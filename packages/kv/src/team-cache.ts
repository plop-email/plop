import { assertServerOnly } from "./server-only";

assertServerOnly();

import { createCache } from "./cache";

const cache = createCache("team", 30 * 60);

export const teamCache = {
  get: (key: string): Promise<boolean | undefined> => cache.get<boolean>(key),
  set: (key: string, value: boolean): Promise<void> => cache.set(key, value),
  delete: (key: string): Promise<void> => cache.delete(key),
};
