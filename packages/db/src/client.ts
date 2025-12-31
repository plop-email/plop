import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { withReplicas } from "./replicas";
import * as schema from "./schema";
import { env } from "./utils/env";

const primaryPool = postgres(env.DATABASE_PRIMARY_URL, {
  prepare: false,
});

const lhrPool = postgres(env.DATABASE_LHR_URL, {
  prepare: false,
});

export const primaryDb = drizzle(primaryPool, {
  schema,
  casing: "snake_case",
});

const lhrDb = drizzle(lhrPool, {
  schema,
  casing: "snake_case",
});

const getReplicaIndexForRegion = () => {
  switch (env.FLY_REGION) {
    case "lhr":
      return 0;
    default:
      return 0;
  }
};

const createDb = () => {
  const replicaIndex = getReplicaIndexForRegion();

  return withReplicas(
    primaryDb,
    [lhrDb],
    (replicas) => replicas[replicaIndex]!,
  );
};

export const db = createDb();

export const connectDb = async (_accessToken?: string) => createDb();

export type Database = Awaited<ReturnType<typeof connectDb>>;

export type DatabaseWithPrimary = Database & {
  $primary?: Database;
  usePrimaryOnly?: () => Database;
};

export { schema };
