import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { z } from "zod";
import {
  enableEmailRoutingDns,
  getCatchAllRule,
  getEmailRoutingDnsRecords,
  updateCatchAllRuleToWorker,
} from "./cloudflare";
import { parseEmailContent, streamToUint8Array } from "./email-content";
import {
  headMessage,
  listMailboxes,
  listMailboxMessages,
  type MessageStatus,
  markMessageProcessed,
  rawEmailKey,
  recordWebhookAttempt,
  type StoredMessage,
  storeInboundEmail,
} from "./storage";
import {
  encodeMailboxComponent,
  isValidMailboxLocalPart,
  parseEmailAddress,
} from "./validation";

type Bindings = {
  ADMIN_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ZONE_ID: string;
  EMAIL_DOMAIN: string;
  EMAIL_WORKER_NAME: string;
  WEBHOOK_URL?: string;
  WEBHOOK_AUTH_TOKEN?: string;
  WEBHOOK_TIMEOUT_MS?: string;
  INBOX_STORAGE: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal error" }, 500);
});

const requireAdmin: MiddlewareHandler<{ Bindings: Bindings }> = async (
  c,
  next,
) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token || !c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.text("Unauthorized", 401);
  }

  await next();
};

app.get("/health", (c) => c.json({ ok: true }));

app.use("/admin/*", requireAdmin);

function isManagedDomain(domain: string, rootDomain: string): boolean {
  return domain === rootDomain || domain.endsWith(`.${rootDomain}`);
}

function parseMessageStatus(input: string | undefined): MessageStatus | null {
  const value = input?.trim().toLowerCase();
  if (!value) return null;
  if (value === "unprocessed" || value === "pending") return "unprocessed";
  if (value === "processed" || value === "archived") return "processed";
  return null;
}

type WebhookConfig = {
  url: string;
  authToken?: string;
  timeoutMs: number;
};

function getWebhookConfig(env: Bindings): WebhookConfig | null {
  const url = env.WEBHOOK_URL?.trim();
  if (!url) return null;

  const authToken = env.WEBHOOK_AUTH_TOKEN?.trim();
  const timeoutMsRaw = env.WEBHOOK_TIMEOUT_MS?.trim();
  const timeoutMs = timeoutMsRaw ? Number(timeoutMsRaw) : 10_000;

  return {
    url,
    authToken: authToken || undefined,
    timeoutMs: Number.isFinite(timeoutMs)
      ? Math.min(Math.max(timeoutMs, 1000), 60_000)
      : 10_000,
  };
}

type WebhookPayload = {
  event: "email.received";
  id: string;
  domain: string;
  tenantSubdomain: string | null;
  mailbox: string;
  mailboxWithTag: string;
  tag: string | null;
  from: string;
  to: string;
  subject: string | null;
  receivedAt: string;
  headers: Array<{ name: string; value: string }>;
  rawContent: string | null;
  plainContent: string | null;
};

function buildWebhookPayload(params: {
  rootDomain: string;
  domain: string;
  stored: StoredMessage;
  parsed: ReturnType<typeof parseEmailContent> | null;
}): WebhookPayload {
  const { rootDomain, domain, stored, parsed } = params;
  const tenantSubdomain =
    domain === rootDomain ? null : domain.slice(0, -(rootDomain.length + 1));

  return {
    event: "email.received",
    id: stored.id,
    domain,
    tenantSubdomain,
    mailbox: stored.mailbox,
    mailboxWithTag: stored.mailboxWithTag,
    tag: stored.tag,
    from: stored.from,
    to: stored.to,
    subject: stored.subject,
    receivedAt: stored.receivedAt,
    headers: parsed?.headers ?? [],
    rawContent: parsed?.rawContent ?? null,
    plainContent: parsed?.plainContent ?? null,
  };
}

async function postWebhook(
  config: WebhookConfig,
  payload: unknown,
): Promise<{ ok: boolean; status: number; responseText: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.authToken
          ? { Authorization: `Bearer ${config.authToken}` }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, responseText };
  } finally {
    clearTimeout(timeout);
  }
}

app.get("/admin/inboxes", async (c) => {
  const rootDomain = c.env.EMAIL_DOMAIN?.trim().toLowerCase();
  if (!rootDomain) return c.json({ error: "Missing EMAIL_DOMAIN" }, 500);

  const limit = Number(c.req.query("limit") ?? "50");
  const cursor = c.req.query("cursor") ?? undefined;
  const domain = c.req.query("domain")?.trim().toLowerCase() ?? rootDomain;
  const status = parseMessageStatus(c.req.query("status")) ?? "unprocessed";
  if (!isManagedDomain(domain, rootDomain)) {
    return c.json({ error: "Domain not managed by this worker" }, 400);
  }

  const { mailboxes, cursor: nextCursor } = await listMailboxes({
    bucket: c.env.INBOX_STORAGE,
    domain,
    status,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
    cursor,
  });

  return c.json({ mailboxes, status, cursor: nextCursor });
});

app.get("/admin/inboxes/:localPart/messages", async (c) => {
  const rootDomain = c.env.EMAIL_DOMAIN?.trim().toLowerCase();
  if (!rootDomain) return c.json({ error: "Missing EMAIL_DOMAIN" }, 500);

  const domain = c.req.query("domain")?.trim().toLowerCase() ?? rootDomain;
  const status = parseMessageStatus(c.req.query("status")) ?? "unprocessed";
  if (!isManagedDomain(domain, rootDomain)) {
    return c.json({ error: "Domain not managed by this worker" }, 400);
  }

  const localPart = c.req.param("localPart").trim().toLowerCase();
  if (!isValidMailboxLocalPart(localPart)) {
    return c.json({ error: "Invalid localPart" }, 400);
  }
  const mailboxKey = encodeMailboxComponent(localPart);

  const limit = Number(c.req.query("limit") ?? "50");
  const cursor = c.req.query("cursor") ?? undefined;

  const { messages, cursor: nextCursor } = await listMailboxMessages({
    bucket: c.env.INBOX_STORAGE,
    domain,
    mailboxKey,
    status,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
    cursor,
  });

  const requestUrl = new URL(c.req.url);
  const messagesWithUrls = messages.map((msg) => {
    const emlUrl = new URL(
      `/admin/inboxes/${encodeURIComponent(localPart)}/messages/${encodeURIComponent(msg.id)}/raw`,
      requestUrl.origin,
    );
    emlUrl.searchParams.set("domain", domain);
    return { ...msg, emlUrl: emlUrl.toString() };
  });

  return c.json({ messages: messagesWithUrls, status, cursor: nextCursor });
});

app.get("/admin/inboxes/:localPart/messages/:id", async (c) => {
  const rootDomain = c.env.EMAIL_DOMAIN?.trim().toLowerCase();
  if (!rootDomain) return c.json({ error: "Missing EMAIL_DOMAIN" }, 500);

  const domain = c.req.query("domain")?.trim().toLowerCase() ?? rootDomain;
  if (!isManagedDomain(domain, rootDomain)) {
    return c.json({ error: "Domain not managed by this worker" }, 400);
  }

  const localPart = c.req.param("localPart").trim().toLowerCase();
  if (!isValidMailboxLocalPart(localPart)) {
    return c.json({ error: "Invalid localPart" }, 400);
  }
  const mailboxKey = encodeMailboxComponent(localPart);
  const id = c.req.param("id");

  const requestedStatus = parseMessageStatus(c.req.query("status"));
  const statuses: MessageStatus[] = requestedStatus
    ? [requestedStatus]
    : ["processed", "unprocessed"];

  let head: Awaited<ReturnType<typeof headMessage>> | null = null;
  for (const status of statuses) {
    head = await headMessage({
      bucket: c.env.INBOX_STORAGE,
      domain,
      mailboxKey,
      status,
      id,
    });
    if (head) break;
  }
  if (!head) return c.json({ error: "Message not found" }, 404);

  const requestUrl = new URL(c.req.url);
  const emlUrl = new URL(
    `/admin/inboxes/${encodeURIComponent(localPart)}/messages/${encodeURIComponent(id)}/raw`,
    requestUrl.origin,
  );
  emlUrl.searchParams.set("domain", domain);

  const rawObj = await c.env.INBOX_STORAGE.get(
    rawEmailKey(domain, mailboxKey, id),
  );
  const parsed = rawObj ? parseEmailContent(await rawObj.bytes()) : null;

  return c.json({
    ...head.message,
    emlUrl: emlUrl.toString(),
    headers: parsed?.headers ?? [],
    rawContent: parsed?.rawContent ?? null,
    plainContent: parsed?.plainContent ?? null,
  });
});

app.get("/admin/inboxes/:localPart/messages/:id/raw", async (c) => {
  const rootDomain = c.env.EMAIL_DOMAIN?.trim().toLowerCase();
  if (!rootDomain) return c.json({ error: "Missing EMAIL_DOMAIN" }, 500);

  const domain = c.req.query("domain")?.trim().toLowerCase() ?? rootDomain;
  if (!isManagedDomain(domain, rootDomain)) {
    return c.json({ error: "Domain not managed by this worker" }, 400);
  }

  const localPart = c.req.param("localPart").trim().toLowerCase();
  if (!isValidMailboxLocalPart(localPart)) {
    return c.json({ error: "Invalid localPart" }, 400);
  }
  const mailboxKey = encodeMailboxComponent(localPart);
  const id = c.req.param("id");

  const obj = await c.env.INBOX_STORAGE.get(
    rawEmailKey(domain, mailboxKey, id),
  );
  if (!obj) return c.json({ error: "Message not found" }, 404);

  return new Response(obj.body, {
    headers: {
      "Content-Type": "message/rfc822",
      "Content-Disposition": `attachment; filename="${id}.eml"`,
    },
  });
});

app.post("/admin/inboxes/:localPart/messages/:id/webhook", async (c) => {
  const rootDomain = c.env.EMAIL_DOMAIN?.trim().toLowerCase();
  if (!rootDomain) return c.json({ error: "Missing EMAIL_DOMAIN" }, 500);

  const domain = c.req.query("domain")?.trim().toLowerCase() ?? rootDomain;
  if (!isManagedDomain(domain, rootDomain)) {
    return c.json({ error: "Domain not managed by this worker" }, 400);
  }

  const localPart = c.req.param("localPart").trim().toLowerCase();
  if (!isValidMailboxLocalPart(localPart)) {
    return c.json({ error: "Invalid localPart" }, 400);
  }
  const mailboxKey = encodeMailboxComponent(localPart);
  const id = c.req.param("id");

  const webhook = getWebhookConfig(c.env);
  if (!webhook) return c.json({ error: "Webhook not configured" }, 409);

  const head = await headMessage({
    bucket: c.env.INBOX_STORAGE,
    domain,
    mailboxKey,
    status: "unprocessed",
    id,
  });
  if (!head) {
    const processed = await headMessage({
      bucket: c.env.INBOX_STORAGE,
      domain,
      mailboxKey,
      status: "processed",
      id,
    });
    if (processed) return c.json({ error: "Already processed" }, 409);
    return c.json({ error: "Message not found" }, 404);
  }

  const rawObj = await c.env.INBOX_STORAGE.get(
    rawEmailKey(domain, mailboxKey, id),
  );
  if (!rawObj) return c.json({ error: "Raw message not found" }, 404);

  const parsed = parseEmailContent(await rawObj.bytes());
  const payload = buildWebhookPayload({
    rootDomain,
    domain,
    stored: head.message,
    parsed,
  });

  const res = await postWebhook(webhook, payload);
  if (res.ok) {
    await recordWebhookAttempt({
      bucket: c.env.INBOX_STORAGE,
      domain,
      mailboxKey,
      id,
      error: null,
    });
    await markMessageProcessed({
      bucket: c.env.INBOX_STORAGE,
      domain,
      mailboxKey,
      id,
    });
    return c.json({ ok: true, status: "processed" });
  }

  await recordWebhookAttempt({
    bucket: c.env.INBOX_STORAGE,
    domain,
    mailboxKey,
    id,
    error: `Webhook failed (${res.status}): ${res.responseText.slice(0, 500)}`,
  });
  return c.json(
    { ok: false, status: "unprocessed", webhookStatus: res.status },
    502,
  );
});

const configureCatchAllSchema = z.object({
  enabled: z.boolean().optional().default(true),
});

app.get("/admin/catch-all", async (c) => {
  if (!c.env.CLOUDFLARE_ZONE_ID)
    return c.json({ error: "Missing CLOUDFLARE_ZONE_ID" }, 500);
  if (!c.env.CLOUDFLARE_API_TOKEN)
    return c.json({ error: "Missing CLOUDFLARE_API_TOKEN" }, 500);

  const rule = await getCatchAllRule({
    apiToken: c.env.CLOUDFLARE_API_TOKEN,
    zoneId: c.env.CLOUDFLARE_ZONE_ID,
  });
  return c.json(rule);
});

app.post("/admin/catch-all/worker", async (c) => {
  const body = configureCatchAllSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!body.success) return c.json({ error: body.error.flatten() }, 422);

  if (!c.env.CLOUDFLARE_ZONE_ID)
    return c.json({ error: "Missing CLOUDFLARE_ZONE_ID" }, 500);
  if (!c.env.CLOUDFLARE_API_TOKEN)
    return c.json({ error: "Missing CLOUDFLARE_API_TOKEN" }, 500);
  if (!c.env.EMAIL_WORKER_NAME)
    return c.json({ error: "Missing EMAIL_WORKER_NAME" }, 500);

  await updateCatchAllRuleToWorker({
    apiToken: c.env.CLOUDFLARE_API_TOKEN,
    zoneId: c.env.CLOUDFLARE_ZONE_ID,
    workerName: c.env.EMAIL_WORKER_NAME,
    enabled: body.data.enabled,
  });

  return c.json({ ok: true });
});

const enableDnsSchema = z.object({
  name: z.string().optional(),
});

app.get("/admin/email-routing/dns", async (c) => {
  if (!c.env.CLOUDFLARE_ZONE_ID)
    return c.json({ error: "Missing CLOUDFLARE_ZONE_ID" }, 500);
  if (!c.env.CLOUDFLARE_API_TOKEN)
    return c.json({ error: "Missing CLOUDFLARE_API_TOKEN" }, 500);

  const subdomain = c.req.query("subdomain")?.trim();
  const result = await getEmailRoutingDnsRecords({
    apiToken: c.env.CLOUDFLARE_API_TOKEN,
    zoneId: c.env.CLOUDFLARE_ZONE_ID,
    subdomain: subdomain || undefined,
  });

  return c.json(result);
});

app.post("/admin/email-routing/dns/enable", async (c) => {
  const body = enableDnsSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ error: body.error.flatten() }, 422);

  if (!c.env.CLOUDFLARE_ZONE_ID)
    return c.json({ error: "Missing CLOUDFLARE_ZONE_ID" }, 500);
  if (!c.env.CLOUDFLARE_API_TOKEN)
    return c.json({ error: "Missing CLOUDFLARE_API_TOKEN" }, 500);

  await enableEmailRoutingDns({
    apiToken: c.env.CLOUDFLARE_API_TOKEN,
    zoneId: c.env.CLOUDFLARE_ZONE_ID,
    name: body.data.name?.trim() || undefined,
  });

  return c.json({ ok: true });
});

const addSubdomainSchema = z.object({
  subdomain: z.string().optional(),
  domain: z.string().optional(),
});

app.post("/admin/subdomains", async (c) => {
  const body = addSubdomainSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!body.success) return c.json({ error: body.error.flatten() }, 422);

  const rootDomain = c.env.EMAIL_DOMAIN?.trim().toLowerCase();
  if (!rootDomain) return c.json({ error: "Missing EMAIL_DOMAIN" }, 500);
  if (!c.env.CLOUDFLARE_ZONE_ID)
    return c.json({ error: "Missing CLOUDFLARE_ZONE_ID" }, 500);
  if (!c.env.CLOUDFLARE_API_TOKEN)
    return c.json({ error: "Missing CLOUDFLARE_API_TOKEN" }, 500);

  const fullDomain =
    body.data.domain?.trim().toLowerCase() ??
    (body.data.subdomain?.trim()
      ? `${body.data.subdomain.trim().toLowerCase()}.${rootDomain}`
      : null);

  if (!fullDomain) {
    return c.json({ error: "Provide domain or subdomain" }, 400);
  }
  if (!isManagedDomain(fullDomain, rootDomain)) {
    return c.json({ error: "Domain not managed by this worker" }, 400);
  }

  await enableEmailRoutingDns({
    apiToken: c.env.CLOUDFLARE_API_TOKEN,
    zoneId: c.env.CLOUDFLARE_ZONE_ID,
    name: fullDomain,
  });

  return c.json({ ok: true, domain: fullDomain });
});

export default {
  fetch: app.fetch,
  async email(
    message: ForwardableEmailMessage,
    env: Bindings,
    ctx: ExecutionContext,
  ) {
    const parsed = parseEmailAddress(message.to);
    if (!parsed) {
      message.setReject("Invalid recipient address");
      return;
    }

    const rootDomain = env.EMAIL_DOMAIN?.trim().toLowerCase();
    if (!rootDomain || !isManagedDomain(parsed.domain, rootDomain)) {
      message.setReject("Unknown domain");
      return;
    }

    const domain = parsed.domain;
    const {
      localPart: recipientLocalPart,
      localPartBase: mailboxLocalPart,
      localPartBaseKey: mailboxKey,
      localPartTag: recipientTag,
    } = parsed;

    const messageId = crypto.randomUUID();
    const receivedAt = new Date().toISOString();
    const webhook = getWebhookConfig(env);

    ctx.waitUntil(
      (async () => {
        if (!webhook) {
          await storeInboundEmail({
            bucket: env.INBOX_STORAGE,
            domain,
            mailboxLocalPart,
            mailboxKey,
            recipientLocalPart,
            recipientTag,
            messageId,
            message,
            raw: message.raw,
            receivedAt,
          });
          return;
        }

        const rawBytes = await streamToUint8Array(message.raw);
        const storedPromise = storeInboundEmail({
          bucket: env.INBOX_STORAGE,
          domain,
          mailboxLocalPart,
          mailboxKey,
          recipientLocalPart,
          recipientTag,
          messageId,
          message,
          raw: rawBytes,
          receivedAt,
        });

        const parsedContent = parseEmailContent(rawBytes);
        const stored = await storedPromise;
        const payload = buildWebhookPayload({
          rootDomain,
          domain,
          stored,
          parsed: parsedContent,
        });

        const res = await postWebhook(webhook, payload);
        if (res.ok) {
          await recordWebhookAttempt({
            bucket: env.INBOX_STORAGE,
            domain,
            mailboxKey,
            id: messageId,
            error: null,
          });
          await markMessageProcessed({
            bucket: env.INBOX_STORAGE,
            domain,
            mailboxKey,
            id: messageId,
          });
          return;
        }

        await recordWebhookAttempt({
          bucket: env.INBOX_STORAGE,
          domain,
          mailboxKey,
          id: messageId,
          error: `Webhook failed (${res.status}): ${res.responseText.slice(0, 500)}`,
        });
      })().catch((err) => console.error("Inbound email handler failed", err)),
    );
  },
};
