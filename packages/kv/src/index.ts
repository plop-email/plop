import { Redis } from "@upstash/redis";
import { assertServerOnly } from "./server-only";

assertServerOnly();

const hasConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);
const disabledByEnv = process.env.KV_DISABLED === "true";

export const kvState = {
  enabled: hasConfig && !disabledByEnv,
  healthy: hasConfig && !disabledByEnv,
};

export const client = kvState.enabled
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;
