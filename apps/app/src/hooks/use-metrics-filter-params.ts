import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsIsoDate, parseAsString } from "nuqs/server";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addDaysUtc(date: Date, amount: number) {
  return new Date(date.getTime() + amount * MS_PER_DAY);
}

export function formatMetricsDate(value: Date) {
  return parseAsIsoDate.serialize(value);
}

export function parseMetricsDate(value: string) {
  return parseAsIsoDate.parse(value);
}

type MetricsFilterDefaults = {
  start: Date;
  end: Date;
};

export function getMetricsFilterDefaults(baseDate = new Date()): MetricsFilterDefaults {
  const todayUtc = startOfUtcDay(baseDate);
  return {
    start: addDaysUtc(todayUtc, -29),
    end: todayUtc,
  };
}

function createMetricsFilterParamsSchema(defaults: MetricsFilterDefaults) {
  return {
    start: parseAsIsoDate.withDefault(defaults.start),
    end: parseAsIsoDate.withDefault(defaults.end),
    mailbox: parseAsString,
  };
}

export function useMetricsFilterParams() {
  const defaults = useMemo(() => getMetricsFilterDefaults(), []);
  const paramsSchema = useMemo(
    () => createMetricsFilterParamsSchema(defaults),
    [defaults],
  );
  const [filter, setFilter] = useQueryStates(paramsSchema, {
    clearOnDefault: true,
  });

  const hasFilters =
    Boolean(filter.mailbox) ||
    filter.start.getTime() !== defaults.start.getTime() ||
    filter.end.getTime() !== defaults.end.getTime();

  return {
    filter,
    setFilter,
    hasFilters,
  };
}

export function loadMetricsFilterParams(searchParams: SearchParams) {
  const defaults = getMetricsFilterDefaults();
  return createLoader(createMetricsFilterParamsSchema(defaults))(searchParams);
}
