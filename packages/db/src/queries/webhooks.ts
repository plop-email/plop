import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../client";
import {
  inboxMessages,
  webhookDeliveries,
  webhookEndpoints,
  webhookSecrets,
} from "../schema";

export async function listWebhookEndpointsByTeam(db: Database, teamId: string) {
  return db
    .select({
      id: webhookEndpoints.id,
      url: webhookEndpoints.url,
      description: webhookEndpoints.description,
      secretMasked: webhookEndpoints.secretMasked,
      events: webhookEndpoints.events,
      active: webhookEndpoints.active,
      createdAt: webhookEndpoints.createdAt,
      updatedAt: webhookEndpoints.updatedAt,
    })
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.teamId, teamId))
    .orderBy(desc(webhookEndpoints.createdAt));
}

export async function getWebhookEndpointById(
  db: Database,
  params: { id: string; teamId: string },
) {
  const [endpoint] = await db
    .select()
    .from(webhookEndpoints)
    .where(
      and(
        eq(webhookEndpoints.id, params.id),
        eq(webhookEndpoints.teamId, params.teamId),
      ),
    )
    .limit(1);

  return endpoint ?? null;
}

export async function getWebhookEndpointSummaryById(db: Database, id: string) {
  const [endpoint] = await db
    .select({
      id: webhookEndpoints.id,
      url: webhookEndpoints.url,
      active: webhookEndpoints.active,
    })
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.id, id))
    .limit(1);

  return endpoint ?? null;
}

export async function createWebhookEndpointWithSecret(
  db: Database,
  data: {
    teamId: string;
    url: string;
    description: string | null;
    secretMasked: string;
    secret: string;
  },
) {
  return db.transaction(async (tx) => {
    const [endpoint] = await tx
      .insert(webhookEndpoints)
      .values({
        teamId: data.teamId,
        url: data.url,
        description: data.description,
        secretMasked: data.secretMasked,
      })
      .returning({
        id: webhookEndpoints.id,
        url: webhookEndpoints.url,
        description: webhookEndpoints.description,
        secretMasked: webhookEndpoints.secretMasked,
        events: webhookEndpoints.events,
        active: webhookEndpoints.active,
        createdAt: webhookEndpoints.createdAt,
      });

    if (!endpoint) {
      throw new Error("Failed to create webhook endpoint.");
    }

    await tx.insert(webhookSecrets).values({
      webhookEndpointId: endpoint.id,
      secret: data.secret,
    });

    return endpoint;
  });
}

export async function deleteWebhookEndpointById(
  db: Database,
  params: { id: string; teamId: string },
) {
  const [deleted] = await db
    .delete(webhookEndpoints)
    .where(
      and(
        eq(webhookEndpoints.id, params.id),
        eq(webhookEndpoints.teamId, params.teamId),
      ),
    )
    .returning({ id: webhookEndpoints.id });

  return deleted ?? null;
}

export async function toggleWebhookEndpoint(
  db: Database,
  params: { id: string; teamId: string; active: boolean },
) {
  const [updated] = await db
    .update(webhookEndpoints)
    .set({ active: params.active, updatedAt: new Date() })
    .where(
      and(
        eq(webhookEndpoints.id, params.id),
        eq(webhookEndpoints.teamId, params.teamId),
      ),
    )
    .returning({ id: webhookEndpoints.id, active: webhookEndpoints.active });

  return updated ?? null;
}

export async function getWebhookSecretByEndpointId(
  db: Database,
  endpointId: string,
) {
  const [row] = await db
    .select({ secret: webhookSecrets.secret })
    .from(webhookSecrets)
    .where(eq(webhookSecrets.webhookEndpointId, endpointId))
    .limit(1);

  return row?.secret ?? null;
}

export async function listActiveWebhookEndpointsForTeam(
  db: Database,
  teamId: string,
) {
  return db
    .select({
      id: webhookEndpoints.id,
      url: webhookEndpoints.url,
      events: webhookEndpoints.events,
    })
    .from(webhookEndpoints)
    .where(
      and(
        eq(webhookEndpoints.teamId, teamId),
        eq(webhookEndpoints.active, true),
      ),
    );
}

export async function listWebhookDeliveries(
  db: Database,
  params: { endpointId: string; limit?: number; offset?: number },
) {
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  return db
    .select({
      id: webhookDeliveries.id,
      event: webhookDeliveries.event,
      messageId: webhookDeliveries.messageId,
      status: webhookDeliveries.status,
      httpStatus: webhookDeliveries.httpStatus,
      responseBody: webhookDeliveries.responseBody,
      latencyMs: webhookDeliveries.latencyMs,
      attempt: webhookDeliveries.attempt,
      error: webhookDeliveries.error,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.webhookEndpointId, params.endpointId))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createWebhookDelivery(
  db: Database,
  data: {
    webhookEndpointId: string;
    event: string;
    messageId: string | null;
    status?: string;
    attempt?: number;
  },
) {
  const [delivery] = await db
    .insert(webhookDeliveries)
    .values({
      webhookEndpointId: data.webhookEndpointId,
      event: data.event,
      messageId: data.messageId,
      status: data.status ?? "pending",
      attempt: data.attempt ?? 1,
    })
    .returning({ id: webhookDeliveries.id });

  return delivery ?? null;
}

export async function updateWebhookDelivery(
  db: Database,
  params: {
    id: string;
    status?: string;
    httpStatus?: number | null;
    responseBody?: string | null;
    latencyMs?: number | null;
    attempt?: number;
    error?: string | null;
  },
) {
  const { id, ...fields } = params;

  const [updated] = await db
    .update(webhookDeliveries)
    .set(fields)
    .where(eq(webhookDeliveries.id, id))
    .returning({ id: webhookDeliveries.id });

  return updated ?? null;
}

export async function getMessageSummaryById(db: Database, messageId: string) {
  const [message] = await db
    .select({
      id: inboxMessages.id,
      mailbox: inboxMessages.mailbox,
      mailboxWithTag: inboxMessages.mailboxWithTag,
      tag: inboxMessages.tag,
      fromAddress: inboxMessages.fromAddress,
      toAddress: inboxMessages.toAddress,
      subject: inboxMessages.subject,
      receivedAt: inboxMessages.receivedAt,
      domain: inboxMessages.domain,
    })
    .from(inboxMessages)
    .where(eq(inboxMessages.id, messageId))
    .limit(1);

  return message ?? null;
}
