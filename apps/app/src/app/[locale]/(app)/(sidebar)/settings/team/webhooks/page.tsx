import { TeamWebhooksSettings } from "@/components/settings/team-webhooks-settings";
import { prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Team settings - Webhooks",
};

export default async function Page() {
  prefetch(trpc.team.current.queryOptions());
  prefetch(trpc.webhooks.list.queryOptions());

  return (
    <div className="space-y-12">
      <TeamWebhooksSettings />
    </div>
  );
}
