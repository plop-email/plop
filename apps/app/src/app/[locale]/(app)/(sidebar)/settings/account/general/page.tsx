import { ProfileSettings } from "@/components/settings/profile-settings";
import { prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Account settings - General",
};

export default async function Page() {
  prefetch(trpc.user.me.queryOptions());

  return (
    <div className="space-y-8">
      <ProfileSettings />
    </div>
  );
}
