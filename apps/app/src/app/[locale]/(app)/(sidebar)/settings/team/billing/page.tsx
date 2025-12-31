import { TeamBillingSettings } from "@/components/settings/team-billing-settings";
import { prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Team settings - Billing",
};

export default async function Page() {
  prefetch(trpc.team.current.queryOptions());
  prefetch(trpc.billing.usage.queryOptions());
  prefetch(trpc.billing.orders.queryOptions({ pageSize: 5 }));

  return (
    <div className="space-y-8">
      <TeamBillingSettings />
    </div>
  );
}
