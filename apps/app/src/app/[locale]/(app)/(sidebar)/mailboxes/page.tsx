import { TeamInboxSettings } from "@/components/settings/team-inbox-settings";
import { PageHeader } from "@/components/layout/page-header";
import { prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Mailboxes",
};

export default async function Page() {
  prefetch(trpc.team.current.queryOptions());
  prefetch(trpc.inbox.mailboxes.list.queryOptions());

  return (
    <>
      <PageHeader
        title="Mailboxes"
        description="Manage inbox mailboxes, ownership, and routing."
      />
      <div className="container mx-auto px-4 py-8">
        <TeamInboxSettings />
      </div>
    </>
  );
}
