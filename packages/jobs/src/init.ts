import type { Database } from "@plop/db/client";
import { createJobDb } from "@plop/db/job-client";
import { locals, tasks } from "@trigger.dev/sdk";

const DbLocal = locals.create<{
  db: Database;
  disconnect: () => Promise<void>;
}>("db");

function getDbLocal() {
  const value = locals.get(DbLocal);
  if (!value) throw new Error("Database not initialized in middleware");
  return value;
}

export function getDb(): Database {
  return getDbLocal().db;
}

function initDbLocal(): void {
  locals.set(DbLocal, createJobDb());
}

tasks.middleware("db", async ({ next }) => {
  initDbLocal();
  await next();
});

tasks.onWait("db", async () => {
  await getDbLocal().disconnect();
});

tasks.onResume("db", async () => {
  initDbLocal();
});
