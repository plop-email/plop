import type { BillingCycle, PlanTier } from "./plans";

export type PolarEnvironment = "production" | "sandbox";

export type PlanProductIds = Record<
  PlanTier,
  {
    monthly?: string;
    yearly?: string;
  }
>;

export function getPolarEnvironment(
  value = process.env.POLAR_ENVIRONMENT,
): PolarEnvironment {
  return value === "production" ? "production" : "sandbox";
}

export function getPlanProductIds(env = process.env): PlanProductIds {
  return {
    starter: {
      monthly: env.POLAR_STARTER_MONTHLY_PRODUCT_ID,
      yearly: env.POLAR_STARTER_YEARLY_PRODUCT_ID,
    },
    team: {
      monthly: env.POLAR_TEAM_MONTHLY_PRODUCT_ID,
      yearly: env.POLAR_TEAM_YEARLY_PRODUCT_ID,
    },
    pro: {
      monthly: env.POLAR_PRO_MONTHLY_PRODUCT_ID,
      yearly: env.POLAR_PRO_YEARLY_PRODUCT_ID,
    },
    enterprise: {
      monthly: env.POLAR_ENTERPRISE_MONTHLY_PRODUCT_ID,
      yearly: env.POLAR_ENTERPRISE_YEARLY_PRODUCT_ID,
    },
  };
}

export function getPlanByProductId(
  productId: string,
  env = process.env,
): { plan: PlanTier; cycle: BillingCycle } | null {
  const planProductIds = getPlanProductIds(env);
  const entries = Object.entries(planProductIds) as Array<
    [PlanTier, { monthly?: string; yearly?: string }]
  >;

  for (const [plan, ids] of entries) {
    if (ids.monthly && ids.monthly === productId) {
      return { plan, cycle: "monthly" };
    }
    if (ids.yearly && ids.yearly === productId) {
      return { plan, cycle: "yearly" };
    }
  }

  return null;
}

export function getProductIdForPlan(
  plan: PlanTier,
  cycle: BillingCycle,
  env = process.env,
) {
  const ids = getPlanProductIds(env)[plan];
  return cycle === "yearly" ? ids.yearly : ids.monthly;
}
