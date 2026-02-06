import type { PlanTier } from "@plop/billing";
import { isTrialExpired } from "@plop/billing";
import { teams } from "@plop/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { TRPCContext } from "../init";

export type TeamCtx = {
  db: TRPCContext["db"];
  teamId: string;
};

export function requireOwner(role: "owner" | "member"): void {
  if (role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

export async function assertTrialNotExpired(ctx: TeamCtx): Promise<void> {
  const [team] = await ctx.db
    .select({
      createdAt: teams.createdAt,
      subscriptionStatus: teams.subscriptionStatus,
    })
    .from(teams)
    .where(eq(teams.id, ctx.teamId))
    .limit(1);

  if (team?.subscriptionStatus !== "trialing") return;
  if (!isTrialExpired(team.createdAt)) return;

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Trial ended. Please upgrade your plan.",
  });
}

export async function getTeamPlan(ctx: TeamCtx): Promise<PlanTier> {
  const [team] = await ctx.db
    .select({ plan: teams.plan })
    .from(teams)
    .where(eq(teams.id, ctx.teamId))
    .limit(1);

  return team?.plan ?? "starter";
}
