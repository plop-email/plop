import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@plop/db/client";
import { listInboxMailboxes } from "@plop/db/queries";
import type { ApiKeyContext } from "./auth";
import {
  errorResponseSchema,
  mailboxesResponseSchema,
  mailboxQuerySchema,
} from "./schemas";
import {
  ensureEmailScope,
  parseMailboxName,
  resolveMailboxScope,
} from "./utils";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List mailboxes",
    operationId: "listMailboxes",
    description:
      "Retrieve mailboxes for the authenticated team. Rationale: discover which mailboxes exist before filtering messages; mailbox-scoped keys only return their scoped mailbox. Required scopes: api.full, email.full, or email.mailbox.",
    tags: ["Mailboxes"],
    security: [{ token: [] }],
    request: {
      query: mailboxQuerySchema,
    },
    responses: {
      200: {
        description: "List of mailboxes available to the API key.",
        content: {
          "application/json": {
            schema: mailboxesResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid mailbox filter.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      401: {
        description: "Missing or invalid API key.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      403: {
        description: "API key lacks required scope.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
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

    const { mailbox } = c.req.valid("query");
    const mailboxParam = parseMailboxName(mailbox ?? undefined);
    if (mailbox && !mailboxParam) {
      return c.json({ error: "Invalid mailbox" }, 400);
    }

    let resolvedMailbox: string | null = null;
    try {
      resolvedMailbox = resolveMailboxScope(apiKey, mailboxParam);
    } catch {
      return c.json({ error: "Forbidden" }, 403);
    }

    const rows = await listInboxMailboxes(db, {
      teamId: apiKey.teamId,
      mailboxName: resolvedMailbox,
    });

    const data = rows.map((row) => ({
      ...row,
      address: row.domain ? `${row.name}@${row.domain}` : row.name,
    }));

    return c.json({ data }, 200);
  },
);

export { app as mailboxesRouter };
