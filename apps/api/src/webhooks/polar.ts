import { DEFAULT_PLAN_TIER } from "@plop/billing";
import { getPlanByProductId } from "@plop/billing/polar";
import { db } from "@plop/db/client";
import { subscriptionStatus, teams } from "@plop/db/schema";
import { logger } from "@plop/logger";
import { Webhooks } from "@polar-sh/hono";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import { eq } from "drizzle-orm";
import type { Context, Handler } from "hono";
import { env } from "../env";

function mapRecurringInterval(interval: string | null | undefined) {
  if (interval === "year") return "yearly";
  return "monthly";
}

type SubscriptionStatus = (typeof subscriptionStatus.enumValues)[number];

const normalizeSubscriptionStatus = (
  value: string | null | undefined,
): SubscriptionStatus | null => {
  if (!value) return null;
  return subscriptionStatus.enumValues.includes(value as SubscriptionStatus)
    ? (value as SubscriptionStatus)
    : null;
};

function getTeamIdFromSubscription(data: Subscription) {
  const teamIdFromMetadata = data.metadata?.teamId;
  if (typeof teamIdFromMetadata === "string") return teamIdFromMetadata;
  return data.customer.externalId ?? null;
}

async function handleSubscriptionUpsert(
  data: Subscription,
  payloadType: string,
) {
  const teamId = getTeamIdFromSubscription(data);
  if (!teamId) {
    logger.warn({ payloadType }, "Polar webhook missing teamId");
    return;
  }

  const planMatch = getPlanByProductId(data.productId);
  const plan = planMatch?.plan ?? DEFAULT_PLAN_TIER;
  const billingCycle =
    planMatch?.cycle ?? mapRecurringInterval(data.recurringInterval);

  await db
    .update(teams)
    .set({
      plan,
      billingCycle,
      subscriptionStatus: normalizeSubscriptionStatus(data.status),
      polarCustomerId: data.customerId ?? null,
      polarSubscriptionId: data.id ?? null,
      polarProductId: data.productId ?? null,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
      canceledAt: data.canceledAt ?? null,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    })
    .where(eq(teams.id, teamId));
}

async function handleSubscriptionCancel(
  data: Subscription,
  payloadType: string,
) {
  const teamId = getTeamIdFromSubscription(data);
  if (!teamId) {
    logger.warn({ payloadType }, "Polar webhook missing teamId");
    return;
  }

  await db
    .update(teams)
    .set({
      subscriptionStatus: normalizeSubscriptionStatus(data.status),
      canceledAt: data.canceledAt ?? new Date(),
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
    })
    .where(eq(teams.id, teamId));
}

const polarWebhookHandlerInternal = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET ?? "disabled",
  onSubscriptionActive: async (payload) => {
    await handleSubscriptionUpsert(payload.data, payload.type);
  },
  onSubscriptionUncanceled: async (payload) => {
    await handleSubscriptionUpsert(payload.data, payload.type);
  },
  onSubscriptionUpdated: async (payload) => {
    await handleSubscriptionUpsert(payload.data, payload.type);
  },
  onSubscriptionCanceled: async (payload) => {
    await handleSubscriptionCancel(payload.data, payload.type);
  },
  onSubscriptionRevoked: async (payload) => {
    await handleSubscriptionCancel(payload.data, payload.type);
  },
  onPayload: async (payload) => {
    if (
      payload.type === "subscription.active" ||
      payload.type === "subscription.uncanceled" ||
      payload.type === "subscription.updated" ||
      payload.type === "subscription.canceled" ||
      payload.type === "subscription.revoked"
    ) {
      return;
    }
    logger.info({ payloadType: payload.type }, "Unhandled Polar webhook");
  },
});

export const polarWebhookHandler: Handler = async (c: Context) => {
  if (!env.POLAR_WEBHOOK_SECRET) {
    return c.json(
      { received: false, error: "Polar webhook not configured" },
      503,
    );
  }

  return polarWebhookHandlerInternal(c);
};
