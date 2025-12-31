import type { Database } from "@plop/db/client";
import { logger } from "@plop/logger";
import { sql } from "drizzle-orm";
import type { Session } from "../../utils/auth";

type SupabaseToken = {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  role?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export const withRLS = async <
  TReturn,
  TCtx extends { session?: Session | null; db: Database },
>(opts: {
  ctx: TCtx;
  next: (opts: { ctx: TCtx }) => Promise<TReturn>;
}) => {
  const { ctx, next } = opts;

  if (!ctx.session?.jwt) {
    return next({ ctx });
  }

  const token: SupabaseToken = {
    ...ctx.session.jwt,
    role: ctx.session.jwt.role || "authenticated",
    email: ctx.session.jwt.email || ctx.session.user.email || undefined,
  };

  const allowedRoles = ["anon", "authenticated", "service_role"] as const;
  const fallbackRole = "anon";
  const safeRole =
    typeof token.role === "string" &&
    /^[A-Za-z0-9_]+$/.test(token.role) &&
    (allowedRoles as readonly string[]).includes(token.role)
      ? token.role
      : fallbackRole;

  logger.debug({
    msg: "Setting RLS context",
    userId: token.sub,
    role: safeRole,
  });

  return await ctx.db.transaction(async (tx) => {
    await tx.execute(sql`
      select set_config('request.jwt.claims', '${sql.raw(
        JSON.stringify(token),
      )}', TRUE);
      select set_config('request.jwt.claim.sub', '${sql.raw(
        token.sub ?? "",
      )}', TRUE);
      set local role ${sql.raw(safeRole)};
    `);

    const wrappedTx = Object.assign(
      Object.create(Object.getPrototypeOf(tx)),
      tx,
      {
        executeOnReplica: tx.execute.bind(tx),
        transactionOnReplica: tx.transaction.bind(tx),
        $primary: tx,
        usePrimaryOnly: () => tx,
        select: tx.select.bind(tx),
        insert: tx.insert.bind(tx),
        update: tx.update.bind(tx),
        delete: tx.delete.bind(tx),
        execute: tx.execute.bind(tx),
        transaction: tx.transaction.bind(tx),
        get query() {
          return tx.query;
        },
      },
    ) as unknown as Database;

    return await next({
      ctx: {
        ...ctx,
        db: wrappedTx,
      },
    });
  });
};
