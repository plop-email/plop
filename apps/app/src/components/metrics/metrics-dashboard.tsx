"use client";

import type { RouterOutputs } from "@plop/api/trpc/routers/_app";
import { Button } from "@plop/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plop/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@plop/ui/chart";
import { Input } from "@plop/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@plop/ui/select";
import { Skeleton } from "@plop/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plop/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import {
  formatMetricsDate,
  parseMetricsDate,
  useMetricsFilterParams,
} from "@/hooks/use-metrics-filter-params";

type MetricsOverview = RouterOutputs["metrics"]["overview"];

type SeriesPoint = {
  date: string;
  count: number;
};

type HourPoint = {
  hour: number;
  count: number;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const palette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1) / 0.4)",
];

const volumeConfig = {
  count: { label: "Inbound", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const mailboxConfig = {
  count: { label: "Messages", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const hourConfig = {
  count: { label: "Messages", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const tagConfig = {
  count: { label: "Messages", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatShortDate(value: string) {
  return shortDateFormatter.format(parseDate(value));
}

function formatLongDate(value: string) {
  return longDateFormatter.format(parseDate(value));
}

function buildDailySeries(
  range: MetricsOverview["range"],
  data: SeriesPoint[],
) {
  const map = new Map(data.map((item) => [item.date, item.count]));
  const series: SeriesPoint[] = [];
  const start = parseDate(range.start);
  const end = parseDate(range.end);
  const cursor = new Date(start.getTime());

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    series.push({ date: key, count: map.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return series;
}

function buildHourlySeries(data: HourPoint[]) {
  const map = new Map(data.map((item) => [item.hour, item.count]));
  return Array.from({ length: 24 }, (_value, hour) => ({
    hour,
    count: map.get(hour) ?? 0,
  }));
}

function formatHourLabel(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized < 12 ? "a" : "p";
  const label = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${label}${suffix}`;
}

function MetricsFilters({
  start,
  end,
  mailboxId,
  mailboxes,
  onStartChange,
  onEndChange,
  onMailboxChange,
  onReset,
  hasFilters,
}: {
  start: Date;
  end: Date;
  mailboxId: string | null;
  mailboxes: Array<{ id: string; name: string; domain?: string | null }>;
  onStartChange: (value: string | null) => void;
  onEndChange: (value: string | null) => void;
  onMailboxChange: (value: string | null) => void;
  onReset: () => void;
  hasFilters: boolean;
}) {
  const startValue = formatMetricsDate(start);
  const endValue = formatMetricsDate(end);
  const mailboxValue = mailboxId ?? "all";
  const isRangeInvalid = start > end;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Filters</CardTitle>
        <CardDescription>
          Refine metrics by date range or mailbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr_auto]">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Start</span>
            <Input
              type="date"
              value={startValue}
              max={endValue || undefined}
              onChange={(event) =>
                onStartChange(
                  event.target.value.length > 0 ? event.target.value : null,
                )
              }
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">End</span>
            <Input
              type="date"
              value={endValue}
              min={startValue || undefined}
              onChange={(event) =>
                onEndChange(
                  event.target.value.length > 0 ? event.target.value : null,
                )
              }
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Mailbox</span>
            <Select
              value={mailboxValue}
              onValueChange={(value) =>
                onMailboxChange(value === "all" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All mailboxes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All mailboxes</SelectItem>
                {mailboxes.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No mailboxes yet
                  </SelectItem>
                ) : (
                  mailboxes.map((mailbox) => {
                    const address = mailbox.domain
                      ? `${mailbox.name}@${mailbox.domain}`
                      : mailbox.name;
                    return (
                      <SelectItem key={mailbox.id} value={mailbox.id}>
                        {address}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={onReset}
              disabled={!hasFilters}
            >
              Reset
            </Button>
          </div>
        </div>
        {isRangeInvalid ? (
          <p className="text-xs text-rose-600">
            Start date must be before the end date.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  helper,
  loading,
}: {
  label: string;
  value: string;
  helper: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-xs text-muted-foreground">{helper}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard() {
  const trpc = useTRPC();
  const { filter, setFilter, hasFilters } = useMetricsFilterParams();
  const { data: mailboxes = [] } = useQuery(
    trpc.inbox.mailboxes.list.queryOptions(),
  );

  const mailboxId = filter.mailbox ?? null;

  const startDate = filter.start;
  const endDate = filter.end;

  const input = {
    start: startDate,
    end: endDate,
    mailboxId: mailboxId ?? undefined,
  };
  const { data, isLoading, isError } = useQuery(
    trpc.metrics.overview.queryOptions(input),
  );

  const range = data?.range;
  const dailySeries = useMemo(
    () => (range && data ? buildDailySeries(range, data.volumeByDay) : []),
    [data, range],
  );
  const hourlySeries = useMemo(
    () => buildHourlySeries(data?.volumeByHour ?? []),
    [data?.volumeByHour],
  );

  const inboundTotal = data?.totals.inbound ?? 0;
  const uniqueSenders = data?.totals.uniqueSenders ?? 0;
  const taggedTotal = data?.totals.tagged ?? 0;
  const avgDaily = range ? inboundTotal / range.days : 0;
  const taggedRate = inboundTotal > 0 ? taggedTotal / inboundTotal : 0;

  const busiestHour =
    inboundTotal > 0
      ? hourlySeries.reduce<HourPoint | null>((acc, point) => {
          if (!acc || point.count > acc.count) return point;
          return acc;
        }, null)
      : null;

  const rangeLabel = range
    ? `${formatShortDate(range.start)} – ${formatShortDate(range.end)}`
    : "Last 30 days";

  useEffect(() => {
    if (!mailboxId || mailboxes.length === 0) return;
    const exists = mailboxes.some((mailbox) => mailbox.id === mailboxId);
    if (!exists) {
      setFilter({ mailbox: null });
    }
  }, [mailboxId, mailboxes, setFilter]);

  const handleStartChange = (value: string | null) => {
    if (!value) {
      setFilter({ start: null });
      return;
    }
    const parsed = parseMetricsDate(value);
    if (!parsed) {
      setFilter({ start: null });
      return;
    }
    if (parsed > endDate) {
      setFilter({ start: parsed, end: parsed });
      return;
    }
    setFilter({ start: parsed });
  };

  const handleEndChange = (value: string | null) => {
    if (!value) {
      setFilter({ end: null });
      return;
    }
    const parsed = parseMetricsDate(value);
    if (!parsed) {
      setFilter({ end: null });
      return;
    }
    if (parsed < startDate) {
      setFilter({ start: parsed, end: parsed });
      return;
    }
    setFilter({ end: parsed });
  };

  const handleReset = () => {
    setFilter({ start: null, end: null, mailbox: null });
  };

  return (
    <div className="space-y-6">
      <MetricsFilters
        start={startDate}
        end={endDate}
        mailboxId={mailboxId}
        mailboxes={mailboxes}
        onStartChange={handleStartChange}
        onEndChange={handleEndChange}
        onMailboxChange={(value) => setFilter({ mailbox: value })}
        onReset={handleReset}
        hasFilters={hasFilters}
      />
      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metrics unavailable</CardTitle>
            <CardDescription>
              We could not load metrics for this team.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
      {!isError ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total inbound"
              value={numberFormatter.format(inboundTotal)}
              helper={rangeLabel}
              loading={isLoading}
            />
            <StatCard
              label="Average per day"
              value={numberFormatter.format(Math.round(avgDaily))}
              helper="Based on daily volume"
              loading={isLoading}
            />
            <StatCard
              label="Unique senders"
              value={numberFormatter.format(uniqueSenders)}
              helper="Distinct from addresses"
              loading={isLoading}
            />
            <StatCard
              label="Tagged coverage"
              value={`${Math.round(taggedRate * 100)}%`}
              helper={
                inboundTotal > 0
                  ? `${numberFormatter.format(taggedTotal)} tagged messages`
                  : "No tags yet"
              }
              loading={isLoading}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inbound volume</CardTitle>
                <CardDescription>
                  Daily messages received ({rangeLabel})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ChartContainer config={volumeConfig} className="h-64 w-full">
                    <AreaChart
                      data={dailySeries}
                      margin={{ left: 0, right: 16 }}
                    >
                      <defs>
                        <linearGradient
                          id="volumeFill"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--color-count)"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-count)"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatShortDate}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        allowDecimals={false}
                        width={32}
                        tickFormatter={(value) => numberFormatter.format(value)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="line"
                            labelFormatter={(value) =>
                              typeof value === "string"
                                ? formatLongDate(value)
                                : ""
                            }
                          />
                        }
                      />
                      <Area
                        dataKey="count"
                        type="monotone"
                        stroke="var(--color-count)"
                        fill="url(#volumeFill)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mailbox breakdown</CardTitle>
                <CardDescription>Top mailboxes by volume</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ChartContainer
                    config={mailboxConfig}
                    className="h-64 w-full"
                  >
                    <BarChart
                      data={data?.mailboxes ?? []}
                      layout="vertical"
                      margin={{ left: 8, right: 12 }}
                    >
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="mailbox"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                        {(data?.mailboxes ?? []).map((item, index) => (
                          <Cell
                            key={item.mailbox}
                            fill={palette[index % palette.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
                {!isLoading && (data?.mailboxes?.length ?? 0) === 0 ? (
                  <p className="mt-4 text-xs text-muted-foreground">
                    No mailboxes yet.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Busiest hours</CardTitle>
                <CardDescription>
                  {busiestHour
                    ? `Peak around ${formatHourLabel(busiestHour.hour)}`
                    : "Hourly distribution"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                  <ChartContainer config={hourConfig} className="h-56 w-full">
                    <BarChart
                      data={hourlySeries}
                      margin={{ left: 0, right: 8 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tickFormatter={formatHourLabel}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) =>
                              (() => {
                                const hour =
                                  typeof value === "number"
                                    ? value
                                    : Number(value);
                                return Number.isNaN(hour)
                                  ? ""
                                  : `${formatHourLabel(hour)} hour`;
                              })()
                            }
                          />
                        }
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 0, 0, 0]}
                        fill="var(--color-count)"
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tag distribution</CardTitle>
                <CardDescription>How messages are categorized</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                    <ChartContainer config={tagConfig} className="h-56 w-full">
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent nameKey="tag" hideLabel />
                          }
                        />
                        <Pie
                          data={data?.tags ?? []}
                          dataKey="count"
                          nameKey="tag"
                          innerRadius={50}
                          outerRadius={80}
                          stroke="none"
                        >
                          {(data?.tags ?? []).map((item, index) => (
                            <Cell
                              key={item.tag}
                              fill={palette[index % palette.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="space-y-3">
                      {(data?.tags ?? []).map((item, index) => (
                        <div
                          key={item.tag}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  palette[index % palette.length],
                              }}
                            />
                            <span className="capitalize">{item.tag}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {numberFormatter.format(item.count)}
                          </span>
                        </div>
                      ))}
                      {(data?.tags?.length ?? 0) === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No tags yet.
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top senders</CardTitle>
                <CardDescription>
                  Most frequent inbound addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sender</TableHead>
                        <TableHead className="text-right">Messages</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.topSenders ?? []).map((sender) => (
                        <TableRow key={sender.sender}>
                          <TableCell className="font-medium">
                            {sender.sender}
                          </TableCell>
                          <TableCell className="text-right">
                            {numberFormatter.format(sender.count)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(data?.topSenders?.length ?? 0) === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            No inbound messages yet.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mailbox summary</CardTitle>
                <CardDescription>
                  Highlights across active mailboxes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                  (data?.mailboxes ?? []).map((item, index) => {
                    const share =
                      inboundTotal > 0 ? item.count / inboundTotal : 0;
                    const width =
                      inboundTotal > 0 ? Math.max(share * 100, 4) : 0;
                    return (
                      <div key={item.mailbox} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.mailbox}</span>
                          <span className="text-muted-foreground">
                            {numberFormatter.format(item.count)} msgs
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded bg-muted">
                          <div
                            className="h-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor: palette[index % palette.length],
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(share * 100)}% of inbound volume
                        </div>
                      </div>
                    );
                  })
                )}
                {!isLoading && (data?.mailboxes?.length ?? 0) === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No mailboxes yet.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
