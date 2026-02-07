import { randomBytes } from "node:crypto";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getPlanEntitlements } from "@plop/billing";
import { db } from "@plop/db/client";
import {
  createWebhookEndpointWithSecret,
  deleteWebhookEndpointById,
  getWebhookEndpointById,
  listWebhookDeliveries,
  listWebhookEndpointsByTeam,
  toggleWebhookEndpoint,
} from "@plop/db/queries";
import type { ApiKeyContext } from "./auth";
import {
  errorResponseSchema,
  webhookCreateBodySchema,
  webhookCreatedResponseSchema,
  webhookDeletedResponseSchema,
  webhookDeliveriesQuerySchema,
  webhookDeliveriesResponseSchema,
  webhookIdParamsSchema,
  webhooksResponseSchema,
  webhookToggleBodySchema,
  webhookToggledResponseSchema,
} from "./schemas";
import { getTeamPlan, hasApiFullScope } from "./utils";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List webhook endpoints",
    operationId: "listWebhooks",
    description:
      "Retrieve all webhook endpoints for the authenticated team. Required scope: api.full.",
    tags: ["Webhooks"],
    security: [{ token: [] }],
    responses: {
      200: {
        description: "List of webhook endpoints.",
        content: {
          "application/json": { schema: webhooksResponseSchema },
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
    if (!hasApiFullScope(apiKey.scopes)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const rows = await listWebhookEndpointsByTeam(db, apiKey.teamId);
    return c.json({ data: rows }, 200);
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Create a webhook endpoint",
    operationId: "createWebhook",
    description:
      "Create a new webhook endpoint for the authenticated team. The signing secret is returned once and cannot be retrieved again. Required scope: api.full.",
    tags: ["Webhooks"],
    security: [{ token: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: webhookCreateBodySchema },
        },
        required: true,
      },
    },
    responses: {
      201: {
        description: "Webhook endpoint created with signing secret.",
        content: {
          "application/json": { schema: webhookCreatedResponseSchema },
        },
      },
      400: {
        description: "Invalid request body.",
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
        description:
          "API key lacks required scope or plan does not allow webhooks.",
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

    const plan = await getTeamPlan(apiKey.teamId);
    const entitlements = getPlanEntitlements(plan);
    if (!entitlements.webhooks) {
      return c.json(
        { error: "Webhooks are not available on your current plan." },
        403,
      );
    }

    const body = c.req.valid("json");
    const secret = `whsec_${randomBytes(32).toString("hex")}`;
    const last4 = secret.slice(-4);
    const secretMasked = `whsec_${"*".repeat(8)}...${last4}`;

    const endpoint = await createWebhookEndpointWithSecret(db, {
      teamId: apiKey.teamId,
      url: body.url,
      description: body.description ?? null,
      secretMasked,
      secret,
    });

    return c.json(
      {
        data: {
          endpoint: {
            ...endpoint,
            updatedAt: endpoint.createdAt,
          },
          secret,
        },
      },
      201,
    );
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a webhook endpoint",
    operationId: "deleteWebhook",
    description: "Delete a webhook endpoint by ID. Required scope: api.full.",
    tags: ["Webhooks"],
    security: [{ token: [] }],
    request: {
      params: webhookIdParamsSchema,
    },
    responses: {
      200: {
        description: "Webhook endpoint deleted.",
        content: {
          "application/json": {
            schema: webhookDeletedResponseSchema,
          },
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
        description: "Webhook endpoint not found.",
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
    const deleted = await deleteWebhookEndpointById(db, {
      id,
      teamId: apiKey.teamId,
    });

    if (!deleted) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: { id: deleted.id } }, 200);
  },
);

app.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    summary: "Toggle webhook active state",
    operationId: "toggleWebhook",
    description:
      "Enable or disable a webhook endpoint. Required scope: api.full.",
    tags: ["Webhooks"],
    security: [{ token: [] }],
    request: {
      params: webhookIdParamsSchema,
      body: {
        content: {
          "application/json": { schema: webhookToggleBodySchema },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Webhook endpoint updated.",
        content: {
          "application/json": {
            schema: webhookToggledResponseSchema,
          },
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
        description: "Webhook endpoint not found.",
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
    const { active } = c.req.valid("json");
    const updated = await toggleWebhookEndpoint(db, {
      id,
      teamId: apiKey.teamId,
      active,
    });

    if (!updated) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: { id: updated.id, active: updated.active } }, 200);
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/deliveries",
    summary: "List webhook deliveries",
    operationId: "listWebhookDeliveries",
    description:
      "Retrieve delivery history for a webhook endpoint. Required scope: api.full.",
    tags: ["Webhooks"],
    security: [{ token: [] }],
    request: {
      params: webhookIdParamsSchema,
      query: webhookDeliveriesQuerySchema,
    },
    responses: {
      200: {
        description: "List of webhook deliveries.",
        content: {
          "application/json": { schema: webhookDeliveriesResponseSchema },
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
        description: "Webhook endpoint not found.",
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
    const query = c.req.valid("query");

    const endpoint = await getWebhookEndpointById(db, {
      id,
      teamId: apiKey.teamId,
    });

    if (!endpoint) {
      return c.json({ error: "Not found" }, 404);
    }

    const rows = await listWebhookDeliveries(db, {
      endpointId: id,
      limit: query.limit,
      offset: query.offset,
    });

    return c.json({ data: rows }, 200);
  },
);

export { app as webhooksRouter };
