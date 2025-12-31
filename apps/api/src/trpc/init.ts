import type { Database } from "@plop/db/client";
import { connectDb } from "@plop/db/client";
import { teamMemberships } from "@plop/db/schema";
import { teamCache } from "@plop/kv/team-cache";
import { logger } from "@plop/logger";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import superjson from "superjson";
import type { Session } from "../utils/auth";
import { verifyAccessToken } from "../utils/auth";
import { withPrimaryReadAfterWrite } from "./middleware/primary-read-after-write";
import { withRLS } from "./middleware/rls";

type AuthedUser = {
  id: string;
  email: string | null;
};

type TeamRole = "owner" | "member";

export type TRPCContext = {
  session: Session | null;
  user: AuthedUser | null;
  db: Database;
  teamId: string | null;
  teamRole: TeamRole | null;
};

type AuthedContext = TRPCContext & {
  session: Session;
  user: AuthedUser;
};

function getAccessTokenFromAuthHeader(value: string | undefined) {
  if (!value?.startsWith("Bearer ")) return undefined;
  return value.slice("Bearer ".length);
}

export async function createTRPCContext(
  _: unknown,
  c: Context,
): Promise<TRPCContext> {
  const accessToken = getAccessTokenFromAuthHeader(
    c.req.header("Authorization"),
  );

  const db = await connectDb(accessToken);

  if (!accessToken) {
    return { session: null, user: null, db, teamId: null, teamRole: null };
  }

  const session = await verifyAccessToken(accessToken);

  if (!session) {
    logger.warn("Failed to verify access token");
    return { session: null, user: null, db, teamId: null, teamRole: null };
  }

  return {
    session,
    user: { id: session.user.id, email: session.user.email ?? null },
    db,
    teamId: null,
    teamRole: null,
  };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const loggingMiddleware = t.middleware(
  async ({ ctx, type, path, input, next }) => {
    const startedAt = Date.now();

    const result = await next();

    const durationMs = Date.now() - startedAt;
    const logData = {
      type,
      path,
      durationMs,
      userId: ctx.user?.id ?? null,
      teamId: ctx.teamId ?? null,
      input: input ?? null,
      ok: result.ok,
    };

    if (result.ok) {
      logger.info(logData, "tRPC request");
    } else {
      logger.warn({ ...logData, error: result.error }, "tRPC request failed");
    }

    return result;
  },
);

const baseProcedure = t.procedure;

export const publicProcedure = baseProcedure.use(loggingMiddleware);

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    } as AuthedContext,
  });
});

const withRLSMiddleware = t.middleware(async (opts) => {
  return withRLS({
    ctx: opts.ctx,
    next: opts.next,
  });
});

const withTeamPermissionMiddleware = t.middleware(async ({ ctx, next }) => {
  const userId = ctx.session?.user?.id;
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No permission to access this team",
    });
  }

  const membershipDb = ctx.db.usePrimaryOnly ? ctx.db.usePrimaryOnly() : ctx.db;
  const [membership] = await membershipDb
    .select()
    .from(teamMemberships)
    .where(eq(teamMemberships.userId, userId))
    .limit(1);

  const role = membership?.role ?? null;
  const teamId = membership?.teamId ?? null;

  const cacheKey = `user:${userId}:team:${teamId}:role:${role}`;
  let hasAccess = await teamCache.get(cacheKey);

  if (hasAccess === undefined) {
    hasAccess = !!membership;
    await teamCache.set(cacheKey, hasAccess);
  }

  if (!hasAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No permission to access this team",
    });
  }

  if (!teamId || !role) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User has no role in this team",
    });
  }

  return next({
    ctx: {
      ...ctx,
      teamId,
      teamRole: role,
    },
  });
});

const withPrimaryReadAfterWriteMiddleware = t.middleware(async (opts) => {
  return withPrimaryReadAfterWrite(opts);
});

const authedProcedure = baseProcedure.use(authMiddleware);

export const protectedProcedure = authedProcedure
  .use(withRLSMiddleware)
  .use(loggingMiddleware);

export const teamProcedure = authedProcedure
  .use(withTeamPermissionMiddleware)
  .use(withPrimaryReadAfterWriteMiddleware)
  .use(withRLSMiddleware)
  .use(loggingMiddleware);
