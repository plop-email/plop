import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@plop/db/client";
import {
  getInboxMessageById,
  getLatestInboxMessage,
  listInboxMessages,
} from "@plop/db/queries";
import { getTeamRetentionStart } from "../../utils/retention";
import type { ApiKeyContext } from "./auth";
import {
  errorResponseSchema,
  messageIdParamsSchema,
  messageQuerySchema,
  messageResponseSchema,
  messagesResponseSchema,
} from "./schemas";
import {
  ensureEmailScope,
  normalizeDateRange,
  parseCsv,
  parseDate,
  parseMailboxName,
  resolveMailboxScope,
} from "./utils";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

type MailboxResolution =
  | { mailbox: string | null }
  | { error: "Invalid mailbox" | "Forbidden" };

function getResolvedMailbox(
  apiKey: ApiKeyContext,
  mailbox: string | undefined,
): MailboxResolution {
  const mailboxParam = parseMailboxName(mailbox);
  if (mailbox && !mailboxParam) {
    return { error: "Invalid mailbox" } as const;
  }

  try {
    return { mailbox: resolveMailboxScope(apiKey, mailboxParam) } as const;
  } catch {
    return { error: "Forbidden" } as const;
  }
}

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List messages",
    operationId: "listMessages",
    description:
      "Retrieve message summaries. Rationale: use for polling and filtering before fetching full content; returns the newest items first (default limit 50). Required scopes: api.full, email.full, or email.mailbox.",
    tags: ["Messages"],
    security: [{ token: [] }],
    request: {
      query: messageQuerySchema,
    },
    responses: {
      200: {
        description: "List of matching message summaries.",
        content: {
          "application/json": {
            schema: messagesResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid query filters.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      401: {
        description: "Missing or invalid API key.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      403: {
        description: "API key lacks required scope.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
    },
  }),
  async (c) => {
    const apiKey = c.get("apiKey");
    try {
      ensureEmailScope(apiKey.scopes);
    } catch {
      return c.json({ error: "Forbidden" }, 403);
    }

    const parsedQuery = c.req.valid("query");

    const mailboxResult = getResolvedMailbox(apiKey, parsedQuery.mailbox);
    if ("error" in mailboxResult) {
      const status = mailboxResult.error === "Invalid mailbox" ? 400 : 403;
      return c.json({ error: mailboxResult.error }, status);
    }

    const tags = parseCsv(parsedQuery.tags).map((value) => value.toLowerCase());
    const tag = parsedQuery.tag?.trim().toLowerCase() ?? null;
    const { start, end } = normalizeDateRange(
      parsedQuery.start,
      parsedQuery.end,
    );
    const since = parseDate(parsedQuery.since);
    const limit = parsedQuery.limit ?? 50;
    const retentionStart = await getTeamRetentionStart(db, apiKey.teamId);
    const effectiveSince =
      retentionStart && (!since || since < retentionStart)
        ? retentionStart
        : since;

    const rows = await listInboxMessages(db, {
      teamId: apiKey.teamId,
      mailboxName: mailboxResult.mailbox,
      tag,
      tags,
      q: parsedQuery.q?.trim() ?? null,
      to: parsedQuery.to?.trim() ?? null,
      from: parsedQuery.from?.trim() ?? null,
      subject: parsedQuery.subject?.trim() ?? null,
      start,
      end,
      since: effectiveSince,
      limit,
    });

    return c.json({ data: rows }, 200);
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/latest",
    summary: "Get latest matching message",
    operationId: "getLatestMessage",
    description:
      "Fetch the most recent message that matches the filters. Rationale: ideal for E2E tests polling for a token without client-side sorting (limit is ignored). Required scopes: api.full, email.full, or email.mailbox.",
    tags: ["Messages"],
    security: [{ token: [] }],
    request: {
      query: messageQuerySchema,
    },
    responses: {
      200: {
        description: "Most recent matching message with full content.",
        content: {
          "application/json": {
            schema: messageResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid query filters.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      401: {
        description: "Missing or invalid API key.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      403: {
        description: "API key lacks required scope.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      404: {
        description: "No matching messages found.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
    },
  }),
  async (c) => {
    const apiKey = c.get("apiKey");
    try {
      ensureEmailScope(apiKey.scopes);
    } catch {
      return c.json({ error: "Forbidden" }, 403);
    }

    const parsedQuery = c.req.valid("query");

    const mailboxResult = getResolvedMailbox(apiKey, parsedQuery.mailbox);
    if ("error" in mailboxResult) {
      const status = mailboxResult.error === "Invalid mailbox" ? 400 : 403;
      return c.json({ error: mailboxResult.error }, status);
    }

    const tags = parseCsv(parsedQuery.tags).map((value) => value.toLowerCase());
    const tag = parsedQuery.tag?.trim().toLowerCase() ?? null;
    const { start, end } = normalizeDateRange(
      parsedQuery.start,
      parsedQuery.end,
    );
    const since = parseDate(parsedQuery.since);
    const retentionStart = await getTeamRetentionStart(db, apiKey.teamId);
    const effectiveSince =
      retentionStart && (!since || since < retentionStart)
        ? retentionStart
        : since;

    const message = await getLatestInboxMessage(db, {
      teamId: apiKey.teamId,
      mailboxName: mailboxResult.mailbox,
      tag,
      tags,
      q: parsedQuery.q?.trim() ?? null,
      to: parsedQuery.to?.trim() ?? null,
      from: parsedQuery.from?.trim() ?? null,
      subject: parsedQuery.subject?.trim() ?? null,
      start,
      end,
      since: effectiveSince,
    });

    if (!message) {
      return c.json({ error: "No messages found" }, 404);
    }

    return c.json({ data: message }, 200);
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get message by id",
    operationId: "getMessageById",
    description:
      "Fetch a single message with full content by ID. Rationale: follow-up after listing messages or using /latest. Required scopes: api.full, email.full, or email.mailbox.",
    tags: ["Messages"],
    security: [{ token: [] }],
    request: {
      params: messageIdParamsSchema,
    },
    responses: {
      200: {
        description: "Message with full content.",
        content: {
          "application/json": {
            schema: messageResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid message id.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      401: {
        description: "Missing or invalid API key.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      403: {
        description: "API key lacks required scope.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      404: {
        description: "Message not found.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
    },
  }),
  async (c) => {
    const apiKey = c.get("apiKey");
    try {
      ensureEmailScope(apiKey.scopes);
    } catch {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { id } = c.req.valid("param");

    let resolvedMailbox: string | null = null;
    try {
      resolvedMailbox = resolveMailboxScope(apiKey, null);
    } catch {
      return c.json({ error: "Forbidden" }, 403);
    }

    const retentionStart = await getTeamRetentionStart(db, apiKey.teamId);
    const message = await getInboxMessageById(db, {
      teamId: apiKey.teamId,
      id,
      mailboxName: resolvedMailbox,
    });

    if (!message || (retentionStart && message.receivedAt < retentionStart)) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: message }, 200);
  },
);

export { app as messagesRouter };
