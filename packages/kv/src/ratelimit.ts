import { assertServerOnly } from "./server-only";

assertServerOnly();

import { Ratelimit } from "@upstash/ratelimit";
import { client, kvState } from ".";

const createNoopRatelimit = () => ({
  limit: async () => ({
    success: true,
    limit: 0,
    remaining: 0,
    reset: Date.now() + 1000,
    pending: Promise.resolve(),
    reason: "disabled",
  }),
  blockUntilReady: async () => ({
    success: true,
    limit: 0,
    remaining: 0,
    reset: Date.now() + 1000,
    pending: Promise.resolve(),
    reason: "disabled",
  }),
  resetUsedTokens: async () => {},
  getRemaining: async () => ({
    remaining: 0,
    reset: Date.now() + 1000,
  }),
});

const noopRatelimit = createNoopRatelimit();
const baseRatelimit =
  kvState.enabled && client
    ? new Ratelimit({
        limiter: Ratelimit.fixedWindow(10, "10s"),
        redis: client,
      })
    : null;

export const ratelimit = baseRatelimit
  ? {
      limit: async (...args: Parameters<typeof baseRatelimit.limit>) =>
        kvState.healthy ? baseRatelimit.limit(...args) : noopRatelimit.limit(),
      blockUntilReady: async (
        ...args: Parameters<typeof baseRatelimit.blockUntilReady>
      ) =>
        kvState.healthy
          ? baseRatelimit.blockUntilReady(...args)
          : noopRatelimit.blockUntilReady(),
      resetUsedTokens: async (
        ...args: Parameters<typeof baseRatelimit.resetUsedTokens>
      ) =>
        kvState.healthy
          ? baseRatelimit.resetUsedTokens(...args)
          : noopRatelimit.resetUsedTokens(),
      getRemaining: async (
        ...args: Parameters<typeof baseRatelimit.getRemaining>
      ) =>
        kvState.healthy
          ? baseRatelimit.getRemaining(...args)
          : noopRatelimit.getRemaining(),
    }
  : noopRatelimit;
