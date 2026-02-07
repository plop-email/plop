import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getPlanEntitlements, isReservedMailboxName } from "@plop/billing";
import { db } from "@plop/db/client";
import { listInboxMailboxes } from "@plop/db/queries";
import { inboxMailboxes, teamInboxSettings } from "@plop/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { env } from "../../env";
import type { ApiKeyContext } from "./auth";
import {
  errorResponseSchema,
  mailboxCreateBodySchema,
  mailboxDeleteResponseSchema,
  mailboxesResponseSchema,
  mailboxIdParamsSchema,
  mailboxQuerySchema,
  mailboxResponseSchema,
  mailboxUpdateBodySchema,
} from "./schemas";
import {
  getTeamPlan,
  hasApiFullScope,
  hasEmailScope,
  parseMailboxName,
  resolveMailboxScope,
} from "./utils";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

const rootDomain = env.INBOX_ROOT_DOMAIN.trim().toLowerCase();

function mailboxToResponse(row: {
  id: string;
  name: string;
  domain: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}): {
  id: string;
  name: string;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
  address: string;
} {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    address: row.domain ? `${row.name}@${row.domain}` : row.name,
  };
}

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
    if (!hasEmailScope(apiKey.scopes)) {
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

app.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Create a mailbox",
    operationId: "createMailbox",
    description:
      "Create a new mailbox for the authenticated team. Required scope: api.full.",
    tags: ["Mailboxes"],
    security: [{ token: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: mailboxCreateBodySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Mailbox created.",
        content: {
          "application/json": { schema: mailboxResponseSchema },
        },
      },
      400: {
        description: "Invalid or reserved mailbox name.",
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
        description: "API key lacks required scope or mailbox limit reached.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      409: {
        description: "Mailbox name already taken.",
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

    const { name } = c.req.valid("json");

    if (isReservedMailboxName(name)) {
      return c.json({ error: "Mailbox name is reserved." }, 400);
    }

    const plan = await getTeamPlan(apiKey.teamId);
    const entitlements = getPlanEntitlements(plan);
    if (typeof entitlements.mailboxes === "number") {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMailboxes)
        .where(eq(inboxMailboxes.teamId, apiKey.teamId));
      const mailboxCount = Number(countRow?.count ?? 0);
      if (mailboxCount >= entitlements.mailboxes) {
        return c.json({ error: "Mailbox limit reached for this plan." }, 403);
      }
    }

    const [settings] = await db
      .select()
      .from(teamInboxSettings)
      .where(eq(teamInboxSettings.teamId, apiKey.teamId))
      .limit(1);

    const mailboxDomain = settings?.domain ?? rootDomain;

    const [existingByDomain] = await db
      .select()
      .from(inboxMailboxes)
      .where(
        and(
          eq(inboxMailboxes.domain, mailboxDomain),
          eq(inboxMailboxes.name, name),
        ),
      )
      .limit(1);

    if (existingByDomain) {
      if (existingByDomain.teamId === apiKey.teamId) {
        return c.json({ data: mailboxToResponse(existingByDomain) }, 201);
      }
      return c.json(
        { error: "Mailbox name already taken for this domain." },
        409,
      );
    }

    const [mailbox] = await db
      .insert(inboxMailboxes)
      .values({
        teamId: apiKey.teamId,
        domain: mailboxDomain,
        name,
      })
      .returning();

    return c.json({ data: mailboxToResponse(mailbox!) }, 201);
  },
);

app.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    summary: "Rename a mailbox",
    operationId: "updateMailbox",
    description: "Rename an existing mailbox. Required scope: api.full.",
    tags: ["Mailboxes"],
    security: [{ token: [] }],
    request: {
      params: mailboxIdParamsSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: mailboxUpdateBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Mailbox updated.",
        content: {
          "application/json": { schema: mailboxResponseSchema },
        },
      },
      400: {
        description: "Invalid or reserved mailbox name.",
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
        description: "Mailbox not found.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      409: {
        description: "Mailbox name already taken.",
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
    const { name } = c.req.valid("json");

    if (isReservedMailboxName(name)) {
      return c.json({ error: "Mailbox name is reserved." }, 400);
    }

    const [mailbox] = await db
      .select()
      .from(inboxMailboxes)
      .where(
        and(
          eq(inboxMailboxes.id, id),
          eq(inboxMailboxes.teamId, apiKey.teamId),
        ),
      )
      .limit(1);

    if (!mailbox) {
      return c.json({ error: "Not found" }, 404);
    }

    if (mailbox.name === name) {
      return c.json({ data: mailboxToResponse(mailbox) }, 200);
    }

    const [domainConflict] = await db
      .select({ id: inboxMailboxes.id, teamId: inboxMailboxes.teamId })
      .from(inboxMailboxes)
      .where(
        and(
          eq(inboxMailboxes.domain, mailbox.domain),
          eq(inboxMailboxes.name, name),
          ne(inboxMailboxes.id, id),
        ),
      )
      .limit(1);

    if (domainConflict) {
      const errorMessage =
        domainConflict.teamId === apiKey.teamId
          ? "Mailbox name already used in this team."
          : "Mailbox name already taken for this domain.";
      return c.json({ error: errorMessage }, 409);
    }

    const [updated] = await db
      .update(inboxMailboxes)
      .set({ name, updatedAt: new Date() })
      .where(eq(inboxMailboxes.id, mailbox.id))
      .returning();

    return c.json({ data: mailboxToResponse(updated ?? mailbox) }, 200);
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a mailbox",
    operationId: "deleteMailbox",
    description: "Delete an existing mailbox. Required scope: api.full.",
    tags: ["Mailboxes"],
    security: [{ token: [] }],
    request: {
      params: mailboxIdParamsSchema,
    },
    responses: {
      200: {
        description: "Mailbox deleted.",
        content: {
          "application/json": { schema: mailboxDeleteResponseSchema },
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
        description: "Mailbox not found.",
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

    const [mailbox] = await db
      .select({ id: inboxMailboxes.id })
      .from(inboxMailboxes)
      .where(
        and(
          eq(inboxMailboxes.id, id),
          eq(inboxMailboxes.teamId, apiKey.teamId),
        ),
      )
      .limit(1);

    if (!mailbox) {
      return c.json({ error: "Not found" }, 404);
    }

    await db.delete(inboxMailboxes).where(eq(inboxMailboxes.id, id));

    return c.json({ data: { id } }, 200);
  },
);

export { app as mailboxesRouter };
