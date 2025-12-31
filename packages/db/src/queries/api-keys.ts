import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../client";
import { apiKeySecrets, apiKeys, inboxMailboxes, users } from "../schema";

export class ApiKeyHashConflictError extends Error {
  constructor() {
    super("API_KEY_HASH_CONFLICT");
  }
}

export type ApiKeyAuth = {
  id: string;
  teamId: string;
  scopes: string[] | null;
  mailboxName: string | null;
  expiresAt: Date | null;
};

export type CreateApiKeyData = {
  name: string;
  keyMasked: string;
  keyHash: string;
  teamId: string;
  userId: string;
  scopes: string[];
  mailboxName: string | null;
  expiresAt: Date | null;
};

export async function getApiKeyAuthByHash(
  db: Database,
  keyHash: string,
): Promise<ApiKeyAuth | null> {
  const [apiKey] = await db
    .select({
      id: apiKeys.id,
      teamId: apiKeys.teamId,
      scopes: apiKeys.scopes,
      mailboxName: apiKeys.mailboxName,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeySecrets)
    .innerJoin(apiKeys, eq(apiKeySecrets.apiKeyId, apiKeys.id))
    .where(eq(apiKeySecrets.keyHash, keyHash))
    .limit(1);

  return apiKey ?? null;
}

export async function updateApiKeyLastUsedAt(db: Database, id: string) {
  return db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, id));
}

export async function listApiKeysByTeam(db: Database, teamId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyMasked: apiKeys.keyMasked,
      scopes: apiKeys.scopes,
      mailboxName: apiKeys.mailboxName,
      createdAt: apiKeys.createdAt,
      expiresAt: apiKeys.expiresAt,
      lastUsedAt: apiKeys.lastUsedAt,
      user: {
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(apiKeys)
    .leftJoin(users, eq(apiKeys.userId, users.id))
    .where(eq(apiKeys.teamId, teamId))
    .orderBy(desc(apiKeys.createdAt));
}

export async function createApiKeyWithSecret(
  db: Database,
  data: CreateApiKeyData,
) {
  return db.transaction(async (tx) => {
    const [publicKey] = await tx
      .insert(apiKeys)
      .values({
        name: data.name,
        keyMasked: data.keyMasked,
        teamId: data.teamId,
        userId: data.userId,
        scopes: data.scopes,
        mailboxName: data.mailboxName,
        expiresAt: data.expiresAt,
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        keyMasked: apiKeys.keyMasked,
        scopes: apiKeys.scopes,
        mailboxName: apiKeys.mailboxName,
        createdAt: apiKeys.createdAt,
        expiresAt: apiKeys.expiresAt,
        lastUsedAt: apiKeys.lastUsedAt,
      });

    if (!publicKey) {
      throw new Error("Failed to create API key.");
    }

    const [secret] = await tx
      .insert(apiKeySecrets)
      .values({
        apiKeyId: publicKey.id,
        keyHash: data.keyHash,
      })
      .onConflictDoNothing({ target: apiKeySecrets.keyHash })
      .returning({ id: apiKeySecrets.id });

    if (!secret) {
      throw new ApiKeyHashConflictError();
    }

    return publicKey;
  });
}

export async function deleteApiKeyById(
  db: Database,
  params: { id: string; teamId: string },
) {
  const [deleted] = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, params.id), eq(apiKeys.teamId, params.teamId)))
    .returning({ id: apiKeys.id });

  return deleted ?? null;
}

export async function getMailboxByName(
  db: Database,
  params: { teamId: string; name: string },
) {
  const [mailbox] = await db
    .select({ id: inboxMailboxes.id })
    .from(inboxMailboxes)
    .where(
      and(
        eq(inboxMailboxes.teamId, params.teamId),
        eq(inboxMailboxes.name, params.name),
      ),
    )
    .limit(1);

  return mailbox ?? null;
}
