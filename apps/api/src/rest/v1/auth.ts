import { db } from "@plop/db/client";
import { getApiKeyAuthByHash, updateApiKeyLastUsedAt } from "@plop/db/queries";
import { logger } from "@plop/logger";
import type { MiddlewareHandler } from "hono";
import { hashApiKey, isValidApiKeyFormat } from "../../utils/api-keys";

export type ApiKeyContext = {
  id: string;
  teamId: string;
  scopes: string[];
  mailboxName: string | null;
  expiresAt: Date | null;
};

type Variables = {
  apiKey: ApiKeyContext;
};

export const apiKeyAuth: MiddlewareHandler<{ Variables: Variables }> = async (
  c,
  next,
) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token || !isValidApiKeyFormat(token)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const keyHash = hashApiKey(token);
  const apiKey = await getApiKeyAuthByHash(db, keyHash);
  if (!apiKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now()) {
    return c.json({ error: "API key expired" }, 401);
  }

  c.set("apiKey", {
    ...apiKey,
    scopes: apiKey.scopes ?? [],
    mailboxName: apiKey.mailboxName ?? null,
    expiresAt: apiKey.expiresAt ?? null,
  });

  void updateApiKeyLastUsedAt(db, apiKey.id).catch((error) => {
    logger.warn(
      { error, apiKeyId: apiKey.id },
      "Failed to update last_used_at",
    );
  });

  await next();
};
