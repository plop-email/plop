import { TeamApiSettings } from "@/components/settings/team-api-settings";
import { prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Team settings - API keys",
};

export default async function Page() {
  prefetch(trpc.team.current.queryOptions());
  prefetch(trpc.inbox.mailboxes.list.queryOptions());
  prefetch(trpc.apiKeys.list.queryOptions());

  return (
    <div className="space-y-12">
      <TeamApiSettings />
    </div>
  );
}
