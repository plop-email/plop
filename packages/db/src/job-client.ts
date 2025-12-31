import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Database } from "./client";
import * as schema from "./schema";
import { env } from "./utils/env";

export const createJobDb = () => {
  const jobPool = postgres(env.DATABASE_SESSION_POOLER, {
    prepare: false,
    max: 1,
    idle_timeout: 10,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
  });

  const db = drizzle(jobPool, {
    schema,
    casing: "snake_case",
  });

  return {
    db: db as Database,
    disconnect: () => jobPool.end(),
  };
};
