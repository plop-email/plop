import { DEFAULT_PLAN_TIER, getPlanEntitlements } from "@plop/billing";
import type { Database } from "@plop/db/client";
import { teams } from "@plop/db/schema";
import { subDays } from "date-fns";
import { eq } from "drizzle-orm";

export async function getTeamRetentionStart(
  db: Database,
  teamId: string,
): Promise<Date | null> {
  const [team] = await db
    .select({ plan: teams.plan })
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  const plan = team?.plan ?? DEFAULT_PLAN_TIER;
  const { retentionDays } = getPlanEntitlements(plan);

  if (typeof retentionDays !== "number" || retentionDays <= 0) {
    return null;
  }

  return subDays(new Date(), retentionDays);
}
