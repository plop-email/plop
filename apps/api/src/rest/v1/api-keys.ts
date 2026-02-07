import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@plop/db/client";
import { rotateApiKey } from "@plop/db/queries";
import { generateApiKey, hashApiKey } from "../../utils/api-keys";
import type { ApiKeyContext } from "./auth";
import { apiKeyRotateResponseSchema, errorResponseSchema } from "./schemas";
import { hasApiFullScope } from "./utils";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

app.openapi(
  createRoute({
    method: "post",
    path: "/rotate",
    summary: "Rotate API key",
    operationId: "rotateApiKey",
    description:
      "Generate a new API key, invalidating the current one. The new key is returned once — store it securely. Required scope: api.full.",
    tags: ["API Keys"],
    security: [{ token: [] }],
    responses: {
      200: {
        description: "Key rotated successfully.",
        content: {
          "application/json": { schema: apiKeyRotateResponseSchema },
        },
      },
      401: {
        description: "Unauthorized — invalid or missing API key.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      403: {
        description: "Forbidden — api.full scope required.",
        content: {
          "application/json": { schema: errorResponseSchema },
        },
      },
      500: {
        description: "Internal server error.",
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

    const newKey = generateApiKey();
    const newKeyHash = hashApiKey(newKey);
    const newKeyMasked = `${newKey.slice(0, 3)}${"*".repeat(Math.max(3, newKey.length - 6))}${newKey.slice(-3)}`;

    const updated = await rotateApiKey(db, {
      id: apiKey.id,
      newKeyHash,
      newKeyMasked,
    });

    if (!updated) {
      return c.json({ error: "Failed to rotate key" }, 500);
    }

    return c.json(
      {
        data: {
          key: newKey,
          apiKey: {
            ...updated,
            expiresAt: updated.expiresAt?.toISOString() ?? null,
          },
        },
      },
      200,
    );
  },
);

export { app as apiKeysRouter };
