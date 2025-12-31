import { assertServerOnly } from "./server-only";

assertServerOnly();

import { client, kvState } from "./index";

type MemoryEntry = {
  value: string;
  expiresAt?: number;
};

const shouldUseMemory = () => !kvState.enabled || !kvState.healthy || !client;

const disableKv = (error: unknown, prefix: string, key: string) => {
  if (kvState.healthy) {
    kvState.healthy = false;
    console.warn(
      `KV disabled for ${prefix} cache after error (fallback to memory).`,
      { key },
      error,
    );
  }
};

const parseValue = <T>(value: unknown): T | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  return value as T;
};

const stringifyValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

export const createCache = (prefix: string, defaultTtlSeconds: number) => {
  const getKey = (key: string) => `${prefix}:${key}`;
  const memoryStore = new Map<string, MemoryEntry>();

  const readMemory = <T>(key: string): T | undefined => {
    const entry = memoryStore.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return undefined;
    }
    return parseValue<T>(entry.value);
  };

  const writeMemory = (key: string, value: unknown, ttlSeconds?: number) => {
    const serializedValue = stringifyValue(value);
    const ttl = ttlSeconds ?? defaultTtlSeconds;
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : undefined;
    memoryStore.set(key, { value: serializedValue, expiresAt });
  };

  return {
    get: async <T>(key: string): Promise<T | undefined> => {
      const cacheKey = getKey(key);
      const redis = client;
      if (shouldUseMemory() || !redis) {
        return readMemory<T>(cacheKey);
      }
      try {
        const value = await redis.get(cacheKey);
        return parseValue<T>(value);
      } catch (error) {
        disableKv(error, prefix, key);
        return readMemory<T>(cacheKey);
      }
    },
    set: async (
      key: string,
      value: unknown,
      ttlSeconds?: number,
    ): Promise<void> => {
      const cacheKey = getKey(key);
      const redis = client;
      if (shouldUseMemory() || !redis) {
        writeMemory(cacheKey, value, ttlSeconds);
        return;
      }
      try {
        const serializedValue = stringifyValue(value);
        const ttl = ttlSeconds ?? defaultTtlSeconds;
        if (ttl > 0) {
          await redis.set(cacheKey, serializedValue, { ex: ttl });
        } else {
          await redis.set(cacheKey, serializedValue);
        }
      } catch (error) {
        disableKv(error, prefix, key);
        writeMemory(cacheKey, value, ttlSeconds);
      }
    },
    delete: async (key: string): Promise<void> => {
      const cacheKey = getKey(key);
      const redis = client;
      if (shouldUseMemory() || !redis) {
        memoryStore.delete(cacheKey);
        return;
      }
      try {
        await redis.del(cacheKey);
      } catch (error) {
        disableKv(error, prefix, key);
        memoryStore.delete(cacheKey);
      }
    },
  };
};
