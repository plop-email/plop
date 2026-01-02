import { InboxView } from "@/components/inbox/inbox-view";
import { PageHeader } from "@/components/layout/page-header";
import { loadInboxFilterParams } from "@/hooks/use-inbox-filter-params";
import { prefetch, trpc } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";

export const metadata = {
  title: "Incoming emails",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const filter = loadInboxFilterParams(searchParams);
  const mailboxId = filter.mailbox ?? undefined;
  const query = filter.q?.trim();
  const tags = filter.tags && filter.tags.length > 0 ? filter.tags : undefined;
  const start = filter.start ?? undefined;
  const end = filter.end ?? undefined;

  prefetch(trpc.inbox.mailboxes.list.queryOptions());
  prefetch(
    trpc.inbox.tags.list.queryOptions({
      mailboxId,
    }),
  );
  prefetch(
    trpc.inbox.messages.list.queryOptions({
      mailboxId,
      q: query && query.length > 0 ? query : undefined,
      tags,
      start,
      end,
    }),
  );
  prefetch(
    trpc.inbox.messages.count.queryOptions({
      mailboxId,
      q: query && query.length > 0 ? query : undefined,
      tags,
      start,
      end,
    }),
  );

  return (
    <>
      <PageHeader
        title="Incoming emails"
        description="Review incoming email and route messages to the right mailbox."
      />
      <div className="container mx-auto px-4 py-8">
        <InboxView />
      </div>
    </>
  );
}
