import { assertServerOnly } from "./server-only";

assertServerOnly();

import { createCache } from "./cache";

const REPLICATION_LAG_WINDOW = 10_000;
const cache = createCache("replication", 10);

export const replicationCache = {
  get: (key: string): Promise<number | undefined> => cache.get<number>(key),
  set: async (key: string): Promise<void> => {
    const expiryTime = Date.now() + REPLICATION_LAG_WINDOW;
    await cache.set(key, expiryTime);
  },
  delete: (key: string): Promise<void> => cache.delete(key),
};
