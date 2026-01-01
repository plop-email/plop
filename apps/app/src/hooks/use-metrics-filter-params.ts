import { useQueryStates } from "nuqs";
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

const todayUtc = startOfUtcDay(new Date());
const defaultEnd = todayUtc;
const defaultStart = addDaysUtc(todayUtc, -29);

export const metricsFilterDefaults = {
  start: defaultStart,
  end: defaultEnd,
};

export const metricsFilterParamsSchema = {
  start: parseAsIsoDate.withDefault(defaultStart),
  end: parseAsIsoDate.withDefault(defaultEnd),
  mailbox: parseAsString,
};

export function useMetricsFilterParams() {
  const [filter, setFilter] = useQueryStates(metricsFilterParamsSchema, {
    clearOnDefault: true,
  });

  const hasFilters =
    Boolean(filter.mailbox) ||
    filter.start.getTime() !== defaultStart.getTime() ||
    filter.end.getTime() !== defaultEnd.getTime();

  return {
    filter,
    setFilter,
    hasFilters,
  };
}

export const loadMetricsFilterParams = createLoader(metricsFilterParamsSchema);
