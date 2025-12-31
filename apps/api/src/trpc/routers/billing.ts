import {
  DEFAULT_PLAN_TIER,
  getBillingPeriodEnd,
  getBillingPeriodStart,
  getPlanEntitlements,
  isTrialExpired,
} from "@plop/billing";
import { getProductIdForPlan } from "@plop/billing/polar";
import {
  inboxMailboxes,
  teamEmailUsage,
  teamInboxSettings,
  teams,
} from "@plop/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "../../env";
import { polar, polarEnabled } from "../../utils/polar";
import type { TRPCContext } from "../init";
import { createTRPCRouter, teamProcedure } from "../init";

function requireOwner(role: "owner" | "member") {
  if (role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

function requirePolar() {
  if (!polarEnabled || !polar) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Billing is not configured.",
    });
  }
  return polar;
}

const billingCycleSchema = z.enum(["monthly", "yearly"]);
const planTierSchema = z.enum(["starter", "pro", "enterprise"]);
const trialPlanSchema = z.enum(["starter", "pro"]);

async function getStarterEligibility(ctx: {
  db: TRPCContext["db"];
  teamId: string;
}) {
  const [mailboxCountRow] = await ctx.db
    .select({ count: sql<number>`count(*)` })
    .from(inboxMailboxes)
    .where(eq(inboxMailboxes.teamId, ctx.teamId));

  const [settings] = await ctx.db
    .select({ domain: teamInboxSettings.domain })
    .from(teamInboxSettings)
    .where(eq(teamInboxSettings.teamId, ctx.teamId))
    .limit(1);

  const mailboxCount = Number(mailboxCountRow?.count ?? 0);
  const hasCustomDomain = Boolean(settings?.domain);

  const reasons: Array<"mailboxes" | "custom_domain"> = [];
  if (mailboxCount > 1) {
    reasons.push("mailboxes");
  }
  if (hasCustomDomain) {
    reasons.push("custom_domain");
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    mailboxCount,
    hasCustomDomain,
  };
}

export const billingRouter = createTRPCRouter({
  canChooseStarterPlan: teamProcedure.query(async ({ ctx }) => {
    return getStarterEligibility(ctx);
  }),

  completeOnboarding: teamProcedure.mutation(async ({ ctx }) => {
    requireOwner(ctx.teamRole);

    await ctx.db
      .update(teams)
      .set({ onboardingCompletedAt: new Date() })
      .where(eq(teams.id, ctx.teamId));

    return { ok: true };
  }),

  usage: teamProcedure.query(async ({ ctx }) => {
    const [team] = await ctx.db
      .select({
        plan: teams.plan,
      })
      .from(teams)
      .where(eq(teams.id, ctx.teamId))
      .limit(1);

    const plan = team?.plan ?? DEFAULT_PLAN_TIER;
    const entitlements = getPlanEntitlements(plan);

    const [mailboxCountRow] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMailboxes)
      .where(eq(inboxMailboxes.teamId, ctx.teamId));

    const periodStart = getBillingPeriodStart();
    const periodEnd = getBillingPeriodEnd();

    const [usageRow] = await ctx.db
      .select({ count: teamEmailUsage.count })
      .from(teamEmailUsage)
      .where(
        and(
          eq(teamEmailUsage.teamId, ctx.teamId),
          eq(teamEmailUsage.periodStart, periodStart),
        ),
      )
      .limit(1);

    return {
      mailboxesUsed: Number(mailboxCountRow?.count ?? 0),
      mailboxesLimit: entitlements.mailboxes,
      emailsUsed: usageRow?.count ?? 0,
      emailsLimit: entitlements.emailsPerMonth,
      periodStart,
      periodEnd,
    };
  }),

  createCheckout: teamProcedure
    .input(
      z.object({
        plan: planTierSchema,
        cycle: billingCycleSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);
      const polarClient = requirePolar();

      if (input.plan === "enterprise") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Enterprise is coming soon.",
        });
      }

      if (input.plan === "starter") {
        const eligibility = await getStarterEligibility(ctx);
        if (!eligibility.allowed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Starter requires a single mailbox and no custom domain.",
          });
        }
      }

      const productId = getProductIdForPlan(input.plan, input.cycle);
      if (!productId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Plan product is not configured.",
        });
      }

      const [team] = await ctx.db
        .select({ name: teams.name })
        .from(teams)
        .where(eq(teams.id, ctx.teamId))
        .limit(1);

      const successUrl = new URL("/settings/team/billing", env.APP_URL);
      successUrl.searchParams.set("checkout", "success");

      const checkout = await polarClient.checkouts.create({
        products: [productId],
        successUrl: successUrl.toString(),
        externalCustomerId: ctx.teamId,
        customerEmail: ctx.user?.email ?? undefined,
        customerName: team?.name ?? undefined,
        metadata: {
          teamId: ctx.teamId,
          teamName: team?.name ?? "",
        },
      });

      return { url: checkout.url };
    }),

  createPortal: teamProcedure.mutation(async ({ ctx }) => {
    requireOwner(ctx.teamRole);
    const polarClient = requirePolar();

    const portal = await polarClient.customerSessions.create({
      externalCustomerId: ctx.teamId,
      returnUrl: new URL("/settings/team/billing", env.APP_URL).toString(),
    });

    return { url: portal.customerPortalUrl };
  }),

  selectTrialPlan: teamProcedure
    .input(z.object({ plan: trialPlanSchema }))
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      const [team] = await ctx.db
        .select({
          subscriptionStatus: teams.subscriptionStatus,
          createdAt: teams.createdAt,
          polarSubscriptionId: teams.polarSubscriptionId,
        })
        .from(teams)
        .where(eq(teams.id, ctx.teamId))
        .limit(1);

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found.",
        });
      }

      if (team.polarSubscriptionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trial is only available before a subscription starts.",
        });
      }

      if (team.subscriptionStatus && team.subscriptionStatus !== "trialing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trial plan cannot be updated after activation.",
        });
      }

      if (input.plan === "starter") {
        const eligibility = await getStarterEligibility(ctx);
        if (!eligibility.allowed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Starter requires a single mailbox and no custom domain.",
          });
        }
      }

      if (team.createdAt && isTrialExpired(team.createdAt)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Trial has ended.",
        });
      }

      await ctx.db
        .update(teams)
        .set({
          plan: input.plan,
          subscriptionStatus: "trialing",
        })
        .where(eq(teams.id, ctx.teamId));

      return { plan: input.plan };
    }),

  orders: teamProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        pageSize: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!polarEnabled || !polar) {
        return { data: [], meta: { hasNextPage: false, cursor: undefined } };
      }

      try {
        const customer = await polar.customers.getExternal({
          externalId: ctx.teamId,
        });

        const page = input.cursor ? Number(input.cursor) : 1;

        const ordersResult = await polar.orders.list({
          customerId: customer.id,
          page,
          limit: input.pageSize,
        });

        const orders = ordersResult.result.items;
        const pagination = ordersResult.result.pagination;

        const filteredOrders = orders.filter((order) => {
          const orderTeamId = order.metadata?.teamId;
          return orderTeamId === ctx.teamId;
        });

        return {
          data: filteredOrders.map((order) => ({
            id: order.id,
            createdAt: order.createdAt,
            amount: {
              amount: order.totalAmount,
              currency: order.currency,
            },
            status: order.status,
            productName: order.product?.name || "Subscription",
            invoiceAvailable: order.isInvoiceGenerated,
          })),
          meta: {
            hasNextPage: page < pagination.maxPage,
            cursor:
              page < pagination.maxPage ? (page + 1).toString() : undefined,
          },
        };
      } catch {
        return {
          data: [],
          meta: { hasNextPage: false, cursor: undefined },
        };
      }
    }),
});
