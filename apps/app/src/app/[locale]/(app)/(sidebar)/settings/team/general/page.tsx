import { TeamSettings } from "@/components/settings/team-settings";
import { prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Team settings - General",
};

export default async function Page() {
  prefetch(trpc.team.current.queryOptions());

  return (
    <div className="space-y-8">
      <TeamSettings />
    </div>
  );
}
