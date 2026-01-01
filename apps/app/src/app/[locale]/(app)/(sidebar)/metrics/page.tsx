import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { prefetch, trpc } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { loadMetricsFilterParams } from "@/hooks/use-metrics-filter-params";

export const metadata = {
  title: "Metrics",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const filters = loadMetricsFilterParams(searchParams);
  const input = {
    start: filters.start,
    end: filters.end,
    mailboxId: filters.mailbox ?? undefined,
  };

  prefetch(trpc.inbox.mailboxes.list.queryOptions());
  prefetch(trpc.metrics.overview.queryOptions(input));

  return (
    <>
      <PageHeader
        title="Metrics"
        description="Track inbound volume, tagging coverage, and sender activity."
      />
      <div className="container mx-auto space-y-6 px-4 py-8">
        <MetricsDashboard />
      </div>
    </>
  );
}
