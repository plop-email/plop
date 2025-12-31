import { TeamMembersSettings } from "@/components/settings/team-members-settings";
import { prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Team settings - Members",
};

export default async function Page() {
  prefetch(trpc.user.me.queryOptions());
  prefetch(trpc.team.members.queryOptions());

  return (
    <div className="space-y-12">
      <TeamMembersSettings />
    </div>
  );
}
