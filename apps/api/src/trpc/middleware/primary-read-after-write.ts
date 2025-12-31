import type { Database, DatabaseWithPrimary } from "@plop/db/client";
import { replicationCache } from "@plop/kv/replication-cache";
import { logger } from "@plop/logger";
import type { Session } from "../../utils/auth";

const REPLICATION_LAG_WINDOW = 10_000;

export const withPrimaryReadAfterWrite = async <
  TReturn,
  TCtx extends {
    session?: Session | null;
    teamId?: string | null;
    db: Database;
  },
>(opts: {
  ctx: TCtx;
  type: "query" | "mutation" | "subscription";
  next: (opts: { ctx: TCtx }) => Promise<TReturn>;
}) => {
  const { ctx, type, next } = opts;
  const teamId = ctx.teamId ?? undefined;

  if (teamId) {
    if (type === "mutation") {
      const expiryTime = Date.now() + REPLICATION_LAG_WINDOW;
      await replicationCache.set(teamId);

      logger.info({
        msg: "Using primary DB for mutation",
        teamId,
        operationType: type,
        replicaBlockUntil: new Date(expiryTime).toISOString(),
      });

      const dbWithPrimary = ctx.db as DatabaseWithPrimary;
      if (dbWithPrimary.usePrimaryOnly) {
        ctx.db = dbWithPrimary.usePrimaryOnly();
      }
    } else {
      const timestamp = await replicationCache.get(teamId);
      const now = Date.now();

      if (timestamp && now < timestamp) {
        const remainingMs = timestamp - now;
        logger.info({
          msg: "Using primary DB for query after recent mutation",
          teamId,
          operationType: type,
          replicaBlockRemainingMs: remainingMs,
          replicaBlockUntil: new Date(timestamp).toISOString(),
        });

        const dbWithPrimary = ctx.db as DatabaseWithPrimary;
        if (dbWithPrimary.usePrimaryOnly) {
          ctx.db = dbWithPrimary.usePrimaryOnly();
        }
      } else {
        logger.debug({
          msg: "Using replica DB for query",
          teamId,
          operationType: type,
          recentMutation: !!timestamp,
        });
      }
    }
  }

  const start = performance.now();
  const result = await next({ ctx });
  const duration = performance.now() - start;

  if (duration > 500) {
    logger.warn({
      msg: "Slow DB operation detected",
      teamId,
      operationType: type,
      durationMs: Math.round(duration),
    });
  }

  return result;
};
