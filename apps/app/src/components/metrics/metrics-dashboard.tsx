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
import { Calendar as DateRangeCalendar } from "@plop/ui/calendar";
import { cn } from "@plop/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@plop/ui/dropdown-menu";
import { Input } from "@plop/ui/input";
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
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Filter, Mail, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  getMetricsFilterDefaults,
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

function formatShortDate(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  return shortDateFormatter.format(date);
}

function formatLongDate(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  return longDateFormatter.format(date);
}

const toLocalDate = (date: Date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const toUtcDate = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const isSameDay = (left?: Date, right?: Date) => {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

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
  onRangeChange,
  onMailboxChange,
  onReset,
  hasFilters,
}: {
  start: Date;
  end: Date;
  mailboxId: string | null;
  mailboxes: Array<{ id: string; name: string; domain?: string | null }>;
  onRangeChange: (range?: DateRange) => void;
  onMailboxChange: (value: string | null) => void;
  onReset: () => void;
  hasFilters: boolean;
}) {
  const [open, setOpen] = useState(false);
  const mailboxValue = mailboxId ?? "all";
  const defaults = useMemo(() => getMetricsFilterDefaults(), []);
  const isDefaultRange =
    start.getTime() === defaults.start.getTime() &&
    end.getTime() === defaults.end.getTime();

  const presets = useMemo((): { label: string; range: DateRange }[] => {
    const today = startOfDay(new Date());
    return [
      { label: "Today", range: { from: today, to: today } },
      {
        label: "Last 7 days",
        range: { from: addDays(today, -6), to: today },
      },
      {
        label: "Last 30 days",
        range: { from: addDays(today, -29), to: today },
      },
      {
        label: "This month",
        range: { from: startOfMonth(today), to: today },
      },
      {
        label: "Last month",
        range: {
          from: startOfMonth(addDays(startOfMonth(today), -1)),
          to: endOfMonth(addDays(startOfMonth(today), -1)),
        },
      },
    ];
  }, []);

  const selectedRange = useMemo<DateRange>(
    () => ({
      from: toLocalDate(start),
      to: toLocalDate(end),
    }),
    [start, end],
  );

  const activePreset = presets.find(
    (preset) =>
      selectedRange.from &&
      selectedRange.to &&
      isSameDay(preset.range.from, selectedRange.from) &&
      isSameDay(preset.range.to, selectedRange.to),
  );

  const rangeLabel =
    activePreset?.label ??
    `${formatShortDate(start)} - ${formatShortDate(end)}`;

  const mailboxLabel = useMemo(() => {
    if (!mailboxId) return "All mailboxes";
    const mailbox = mailboxes.find((item) => item.id === mailboxId);
    if (!mailbox) return "Selected mailbox";
    return mailbox.domain ? `${mailbox.name}@${mailbox.domain}` : mailbox.name;
  }, [mailboxId, mailboxes]);

  const summaryLabel = `${rangeLabel} | ${mailboxLabel}`;
  const activeCount = Number(Boolean(mailboxId)) + (isDefaultRange ? 0 : 1);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          readOnly
          value={summaryLabel}
          title={summaryLabel}
          className="cursor-pointer pl-9 pr-10"
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
        />
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open filters"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground",
              (hasFilters || open) && "text-foreground",
            )}
          >
            <Filter className="h-4 w-4" />
            {activeCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center border bg-background px-1 text-[10px] font-semibold text-foreground">
                {activeCount}
              </span>
            ) : null}
          </button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={12}
        alignOffset={-8}
        className="w-[350px] max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Date range</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-[720px] max-w-[calc(100vw-2rem)] p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full border-b p-3 md:w-[220px] md:border-b-0 md:border-r">
                    <div className="space-y-1">
                      {presets.map((preset) => {
                        const isActive = Boolean(
                          selectedRange.from &&
                            selectedRange.to &&
                            isSameDay(preset.range.from, selectedRange.from) &&
                            isSameDay(preset.range.to, selectedRange.to),
                        );
                        return (
                          <Button
                            key={preset.label}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-9 w-full justify-start text-xs font-medium",
                              isActive && "bg-accent text-accent-foreground",
                            )}
                            onClick={() => onRangeChange(preset.range)}
                          >
                            {preset.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 p-3">
                    <DateRangeCalendar
                      mode="range"
                      selected={selectedRange}
                      onSelect={onRangeChange}
                      numberOfMonths={2}
                      defaultMonth={selectedRange.from}
                      toDate={new Date()}
                      initialFocus
                      className="mx-auto"
                    />
                  </div>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Mail className="h-4 w-4" />
              <span>Mailbox</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="max-h-[320px] overflow-y-auto p-0">
                <DropdownMenuRadioGroup
                  value={mailboxValue}
                  onValueChange={(value) =>
                    onMailboxChange(value === "all" ? null : value)
                  }
                >
                  <DropdownMenuRadioItem value="all">
                    All mailboxes
                  </DropdownMenuRadioItem>
                  {mailboxes.length === 0 ? (
                    <DropdownMenuItem disabled>
                      No mailboxes yet
                    </DropdownMenuItem>
                  ) : (
                    mailboxes.map((mailbox) => {
                      const address = mailbox.domain
                        ? `${mailbox.name}@${mailbox.domain}`
                        : mailbox.name;
                      return (
                        <DropdownMenuRadioItem
                          key={mailbox.id}
                          value={mailbox.id}
                        >
                          {address}
                        </DropdownMenuRadioItem>
                      );
                    })
                  )}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!hasFilters}
          className="gap-2"
          onSelect={onReset}
        >
          <X className="h-4 w-4" />
          Clear filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
    ? `${formatShortDate(range.start)} - ${formatShortDate(range.end)}`
    : "Last 30 days";

  useEffect(() => {
    if (!mailboxId || mailboxes.length === 0) return;
    const exists = mailboxes.some((mailbox) => mailbox.id === mailboxId);
    if (!exists) {
      setFilter({ mailbox: null });
    }
  }, [mailboxId, mailboxes, setFilter]);

  const handleRangeChange = (range?: DateRange) => {
    if (!range || (!range.from && !range.to)) {
      setFilter({ start: null, end: null });
      return;
    }

    const nextStart = range.from ? toUtcDate(range.from) : startDate;
    const nextEnd = range.to ? toUtcDate(range.to) : endDate;

    if (nextStart > nextEnd) {
      setFilter({ start: nextStart, end: nextStart });
      return;
    }

    setFilter({ start: nextStart, end: nextEnd });
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
        onRangeChange={handleRangeChange}
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
