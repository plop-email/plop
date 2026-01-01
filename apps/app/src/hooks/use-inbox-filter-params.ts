import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsArrayOf,
  parseAsIsoDate,
  parseAsString,
} from "nuqs/server";

export const inboxFilterParamsSchema = {
  q: parseAsString,
  mailbox: parseAsString,
  tags: parseAsArrayOf(parseAsString),
  start: parseAsIsoDate,
  end: parseAsIsoDate,
};

export function useInboxFilterParams() {
  const [filter, setFilter] = useQueryStates(inboxFilterParamsSchema, {
    clearOnDefault: true,
  });

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => {
      if (value === null) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  };
}

export const loadInboxFilterParams = createLoader(inboxFilterParamsSchema);
