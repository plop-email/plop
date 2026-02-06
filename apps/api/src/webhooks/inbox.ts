import {
  DEFAULT_PLAN_TIER,
  getBillingPeriodStart,
  getPlanEntitlements,
  isTrialExpired,
} from "@plop/billing";
import { db } from "@plop/db/client";
import { listActiveWebhookEndpointsForTeam } from "@plop/db/queries";
import {
  inboxMailboxes,
  inboxMessages,
  teamEmailUsage,
  teamInboxSettings,
  teams,
} from "@plop/db/schema";
import { logger } from "@plop/logger";
import { and, eq, sql } from "drizzle-orm";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { env } from "../env";

type WebhookResult =
  | { ok: true; status: "stored" | "duplicate"; inboxMessageId: string | null }
  | { ok: false; error: string; status?: ContentfulStatusCode };

const inboxWebhookSchema = z.object({
  event: z.literal("email.received"),
  id: z.string().uuid(),
  domain: z.string().min(3),
  tenantSubdomain: z.string().nullable(),
  mailbox: z.string().min(1),
  mailboxWithTag: z.string().min(1),
  tag: z.string().nullable(),
  from: z.string().min(1),
  to: z.string().min(1),
  subject: z.string().nullable(),
  receivedAt: z.string().min(1),
  headers: z.array(z.object({ name: z.string(), value: z.string() })),
  rawContent: z.string().nullable(),
  plainContent: z.string().nullable(),
});

function getBearerToken(value: string | undefined) {
  if (!value) return null;
  if (!value.startsWith("Bearer ")) return null;
  return value.slice("Bearer ".length);
}

async function handleInboxWebhook(payload: z.infer<typeof inboxWebhookSchema>) {
  const domain = payload.domain.trim().toLowerCase();
  const rootDomain = env.INBOX_ROOT_DOMAIN.trim().toLowerCase();
  const mailboxName = payload.mailbox.trim().toLowerCase();
  const mailboxWithTag = payload.mailboxWithTag.trim().toLowerCase();
  const tag = payload.tag?.trim().toLowerCase() || null;
  const tenantSubdomain = payload.tenantSubdomain?.trim().toLowerCase() || null;
  const receivedAt = new Date(payload.receivedAt);

  if (Number.isNaN(receivedAt.getTime())) {
    return {
      ok: false,
      error: "Invalid receivedAt",
      status: 422,
    } satisfies WebhookResult;
  }

  const [settings] = await db
    .select()
    .from(teamInboxSettings)
    .where(eq(teamInboxSettings.domain, domain))
    .limit(1);

  let mailbox:
    | {
        id: string;
        teamId: string;
        domain: string;
        name: string;
      }
    | undefined;

  if (!settings) {
    if (domain !== rootDomain) {
      logger.warn({ domain }, "Inbox webhook domain not configured");
      return {
        ok: false,
        error: "Inbox domain not configured",
        status: 404,
      } satisfies WebhookResult;
    }

    [mailbox] = await db
      .select()
      .from(inboxMailboxes)
      .where(
        and(
          eq(inboxMailboxes.domain, rootDomain),
          eq(inboxMailboxes.name, mailboxName),
        ),
      )
      .limit(1);

    if (!mailbox) {
      return {
        ok: false,
        error: "Mailbox not configured",
        status: 404,
      } satisfies WebhookResult;
    }
  }

  const teamId = settings?.teamId ?? mailbox?.teamId ?? null;
  if (!teamId) {
    return {
      ok: false,
      error: "Unable to resolve mailbox",
      status: 500,
    } satisfies WebhookResult;
  }

  const [team] = await db
    .select({
      plan: teams.plan,
      createdAt: teams.createdAt,
      subscriptionStatus: teams.subscriptionStatus,
    })
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (
    team?.subscriptionStatus === "trialing" &&
    isTrialExpired(team.createdAt)
  ) {
    return {
      ok: false,
      error: "Trial ended. Upgrade to continue receiving email.",
      status: 402,
    } satisfies WebhookResult;
  }

  const plan = team?.plan ?? DEFAULT_PLAN_TIER;
  const entitlements = getPlanEntitlements(plan);

  if (!mailbox) {
    const [existing] = await db
      .select()
      .from(inboxMailboxes)
      .where(
        and(
          eq(inboxMailboxes.teamId, teamId),
          eq(inboxMailboxes.name, mailboxName),
        ),
      )
      .limit(1);

    mailbox = existing;
  }

  if (!mailbox && settings) {
    if (typeof entitlements.mailboxes === "number") {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMailboxes)
        .where(eq(inboxMailboxes.teamId, teamId));

      const mailboxCount = Number(countRow?.count ?? 0);
      if (mailboxCount >= entitlements.mailboxes) {
        return {
          ok: false,
          error: "Mailbox limit reached for this plan",
          status: 403,
        } satisfies WebhookResult;
      }
    }

    const [created] = await db
      .insert(inboxMailboxes)
      .values({
        teamId,
        domain,
        name: mailboxName,
      })
      .onConflictDoNothing({
        target: [inboxMailboxes.domain, inboxMailboxes.name],
      })
      .returning();

    mailbox = created;
  }

  if (!mailbox) {
    return {
      ok: false,
      error: "Mailbox not configured",
      status: 404,
    } satisfies WebhookResult;
  }

  const usagePeriodStart = getBillingPeriodStart(receivedAt);
  if (typeof entitlements.emailsPerMonth === "number") {
    const [usage] = await db
      .select({ count: teamEmailUsage.count })
      .from(teamEmailUsage)
      .where(
        and(
          eq(teamEmailUsage.teamId, teamId),
          eq(teamEmailUsage.periodStart, usagePeriodStart),
        ),
      )
      .limit(1);

    const currentCount = usage?.count ?? 0;
    if (currentCount >= entitlements.emailsPerMonth) {
      return {
        ok: false,
        error: "Monthly email limit reached",
        status: 402,
      } satisfies WebhookResult;
    }
  }

  const [message] = await db
    .insert(inboxMessages)
    .values({
      teamId,
      mailboxId: mailbox.id,
      externalId: payload.id,
      domain,
      tenantSubdomain,
      mailbox: mailboxName,
      mailboxWithTag,
      tag,
      fromAddress: payload.from,
      toAddress: payload.to,
      subject: payload.subject,
      receivedAt,
      headers: payload.headers ?? [],
      htmlContent: payload.rawContent,
      textContent: payload.plainContent,
    })
    .onConflictDoNothing({ target: inboxMessages.externalId })
    .returning({ id: inboxMessages.id });

  if (message) {
    await db
      .insert(teamEmailUsage)
      .values({
        teamId,
        periodStart: usagePeriodStart,
        count: 1,
      })
      .onConflictDoUpdate({
        target: [teamEmailUsage.teamId, teamEmailUsage.periodStart],
        set: {
          count: sql`${teamEmailUsage.count} + 1`,
          updatedAt: new Date(),
        },
      });

    // Dispatch webhook notifications (non-blocking)
    dispatchWebhooks(teamId, message.id).catch((err) => {
      logger.error(
        { err, teamId, messageId: message.id },
        "Webhook dispatch failed",
      );
    });
  }

  return {
    ok: true,
    status: message ? "stored" : "duplicate",
    inboxMessageId: message?.id ?? null,
  } satisfies WebhookResult;
}

async function dispatchWebhooks(teamId: string, messageId: string) {
  const endpoints = await listActiveWebhookEndpointsForTeam(db, teamId);
  if (endpoints.length === 0) return;

  const { tasks } = await import("@trigger.dev/sdk");

  await Promise.all(
    endpoints.map((endpoint) =>
      tasks.trigger("deliver-webhook", {
        webhookEndpointId: endpoint.id,
        messageId,
        teamId,
      }),
    ),
  );
}

export async function inboxWebhookHandler(c: Context) {
  if (!env.INBOX_WEBHOOK_SECRET) {
    return c.json({ error: "Webhook secret not configured" }, 500);
  }

  const token = getBearerToken(c.req.header("Authorization"));
  if (!token || token !== env.INBOX_WEBHOOK_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const payload = inboxWebhookSchema.safeParse(
    await c.req.json().catch(() => null),
  );

  if (!payload.success) {
    return c.json({ error: payload.error.flatten() }, 422);
  }

  const result = await handleInboxWebhook(payload.data);
  if (!result.ok) {
    return c.json({ error: result.error }, result.status ?? 500);
  }

  return c.json(result);
}
