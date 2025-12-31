import { parseAsString, useQueryStates } from "nuqs";

export function useInboxSettingsParams() {
  const [params, setParams] = useQueryStates({
    mailboxId: parseAsString,
    mailboxSheet: parseAsString,
    domainSheet: parseAsString,
  });

  return {
    ...params,
    setParams,
  };
}
