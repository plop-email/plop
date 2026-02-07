import { getPlanEntitlements, type PlanTier } from "@plop/billing";
import { client, kvState } from "@plop/kv/client";
import { Ratelimit } from "@upstash/ratelimit";
import type { MiddlewareHandler } from "hono";
import type { ApiKeyContext } from "./auth";
import { getTeamPlan } from "./utils";

type Variables = { apiKey: ApiKeyContext };

// Cache team plans in memory for 5 minutes to avoid DB lookups on every request
const planCache = new Map<string, { plan: PlanTier; expiresAt: number }>();
const PLAN_CACHE_TTL = 5 * 60 * 1000;

async function getTeamPlanCached(teamId: string): Promise<PlanTier> {
  const cached = planCache.get(teamId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.plan;
  }

  const plan = await getTeamPlan(teamId);
  planCache.set(teamId, { plan, expiresAt: Date.now() + PLAN_CACHE_TTL });
  return plan;
}

// Reuse rate limiter instances per requests-per-minute value
const limiters = new Map<number, Ratelimit>();

function getLimiter(requestsPerMinute: number): Ratelimit | null {
  if (!kvState.enabled || !client) return null;

  let limiter = limiters.get(requestsPerMinute);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(requestsPerMinute, "60s"),
      prefix: "plop:api:rl",
    });
    limiters.set(requestsPerMinute, limiter);
  }
  return limiter;
}

export const rateLimitMiddleware: MiddlewareHandler<{
  Variables: Variables;
}> = async (c, next) => {
  const apiKey = c.get("apiKey");

  const plan = await getTeamPlanCached(apiKey.teamId);
  const { rateLimit } = getPlanEntitlements(plan);

  const limiter = getLimiter(rateLimit);
  if (!limiter || !kvState.healthy) {
    await next();
    return;
  }

  const result = await limiter.limit(apiKey.teamId);

  c.header("X-RateLimit-Limit", String(rateLimit));
  c.header("X-RateLimit-Remaining", String(result.remaining));
  c.header("X-RateLimit-Reset", String(Math.ceil(result.reset / 1000)));

  if (!result.success) {
    return c.json({ error: "Rate limit exceeded. Please slow down." }, 429);
  }

  await next();
};
