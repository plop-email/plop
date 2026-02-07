import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@plop/db/client";
import {
  deleteInboxMessageById,
  getInboxMessageById,
  getLatestInboxMessage,
  listInboxMessages,
} from "@plop/db/queries";
import type { z } from "zod";
import { getTeamRetentionStart } from "../../utils/retention";
import type { ApiKeyContext } from "./auth";
import {
  errorResponseSchema,
  messageDeleteResponseSchema,
  messageIdParamsSchema,
  messageQuerySchema,
  messageResponseSchema,
  messagesResponseSchema,
} from "./schemas";
import {
  hasApiFullScope,
  hasEmailScope,
  normalizeDateRange,
  parseCsv,
  parseDate,
  parseMailboxName,
  resolveMailboxScope,
} from "./utils";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

// ─── Shared query-parsing helpers ───────────────────────────────

type MailboxResolution =
  | { mailbox: string | null }
  | { error: "Invalid mailbox" | "Forbidden" };

function resolveMailbox(
  apiKey: ApiKeyContext,
  mailbox: string | undefined,
): MailboxResolution {
  const mailboxParam = parseMailboxName(mailbox);
  if (mailbox && !mailboxParam) {
    return { error: "Invalid mailbox" };
  }

  try {
    return { mailbox: resolveMailboxScope(apiKey, mailboxParam) };
  } catch {
    return { error: "Forbidden" };
  }
}

type ParsedQuery = z.infer<typeof messageQuerySchema>;

function parseMessageFilters(
  apiKey: ApiKeyContext,
  query: ParsedQuery,
  retentionStart: Date | null,
) {
  const tags = parseCsv(query.tags).map((v) => v.toLowerCase());
  const tag = query.tag?.trim().toLowerCase() ?? null;
  const { start, end } = normalizeDateRange(query.start, query.end);
  const since = parseDate(query.since);
  const effectiveSince =
    retentionStart && (!since || since < retentionStart)
      ? retentionStart
      : since;

  return {
    teamId: apiKey.teamId,
    tag,
    tags,
    q: query.q?.trim() ?? null,
    to: query.to?.trim() ?? null,
    from: query.from?.trim() ?? null,
    subject: query.subject?.trim() ?? null,
    start,
    end,
    since: effectiveSince,
  };
}

// ─── Routes ─────────────────────────────────────────────────────

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
    if (!hasEmailScope(apiKey.scopes)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const query = c.req.valid("query");

    const mailboxResult = resolveMailbox(apiKey, query.mailbox);
    if ("error" in mailboxResult) {
      const status = mailboxResult.error === "Invalid mailbox" ? 400 : 403;
      return c.json({ error: mailboxResult.error }, status);
    }

    const retentionStart = await getTeamRetentionStart(db, apiKey.teamId);
    const filters = parseMessageFilters(apiKey, query, retentionStart);

    const { rows, hasMore } = await listInboxMessages(db, {
      ...filters,
      mailboxName: mailboxResult.mailbox,
      limit: query.limit ?? 50,
      afterId: query.after_id ?? null,
    });

    return c.json({ data: rows, has_more: hasMore }, 200);
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
    if (!hasEmailScope(apiKey.scopes)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const query = c.req.valid("query");

    const mailboxResult = resolveMailbox(apiKey, query.mailbox);
    if ("error" in mailboxResult) {
      const status = mailboxResult.error === "Invalid mailbox" ? 400 : 403;
      return c.json({ error: mailboxResult.error }, status);
    }

    const retentionStart = await getTeamRetentionStart(db, apiKey.teamId);
    const filters = parseMessageFilters(apiKey, query, retentionStart);

    const message = await getLatestInboxMessage(db, {
      ...filters,
      mailboxName: mailboxResult.mailbox,
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
    if (!hasEmailScope(apiKey.scopes)) {
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

app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete message",
    operationId: "deleteMessage",
    description:
      "Permanently delete a message by ID. This action cannot be undone. Required scope: api.full.",
    tags: ["Messages"],
    security: [{ token: [] }],
    request: {
      params: messageIdParamsSchema,
    },
    responses: {
      200: {
        description: "Message deleted.",
        content: {
          "application/json": { schema: messageDeleteResponseSchema },
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
    if (!hasApiFullScope(apiKey.scopes)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { id } = c.req.valid("param");

    let resolvedMailbox: string | null = null;
    try {
      resolvedMailbox = resolveMailboxScope(apiKey, null);
    } catch {
      return c.json({ error: "Forbidden" }, 403);
    }

    const deleted = await deleteInboxMessageById(db, {
      teamId: apiKey.teamId,
      id,
      mailboxName: resolvedMailbox,
    });

    if (!deleted) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: { id: deleted.id } }, 200);
  },
);

export { app as messagesRouter };
