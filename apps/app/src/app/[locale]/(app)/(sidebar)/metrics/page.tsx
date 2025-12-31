import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@plop/ui/card";

export const metadata = {
  title: "Metrics",
};

const stats = [
  { label: "Total inbound", value: "—" },
  { label: "Avg response time", value: "—" },
  { label: "SLA met", value: "—" },
];

export default function Page() {
  return (
    <>
      <PageHeader
        title="Metrics"
        description="Monitor volume, response times, and SLA health."
      />
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inbound volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-center justify-center border border-dashed text-sm text-muted-foreground">
                Chart placeholder
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mailbox breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-center justify-center border border-dashed text-sm text-muted-foreground">
                Chart placeholder
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
