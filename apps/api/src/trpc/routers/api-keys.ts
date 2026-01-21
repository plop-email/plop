import { getPlanEntitlements, isTrialExpired } from "@plop/billing";
import {
  ApiKeyHashConflictError,
  createApiKeyWithSecret,
  deleteApiKeyById,
  getMailboxByName,
  listApiKeysByTeam,
} from "@plop/db/queries";
import { teams } from "@plop/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateApiKey, hashApiKey } from "../../utils/api-keys";
import type { TRPCContext } from "../init";
import { createTRPCRouter, teamProcedure } from "../init";

const mailboxNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i, {
    message:
      "Mailbox names may contain letters, numbers, dot, dash, underscore.",
  })
  .transform((value) => value.toLowerCase());

const scopeSchema = z.enum(["api.full", "email.full", "email.mailbox"]);

function maskKey(key: string) {
  const prefix = key.slice(0, 3);
  const suffix = key.slice(-3);
  const starCount = Math.max(3, key.length - 6);
  return `${prefix}${"*".repeat(starCount)}${suffix}`;
}

const createApiKeySchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    scope: scopeSchema,
    mailboxName: mailboxNameSchema.optional(),
    expiresInDays: z.number().int().min(1).max(3650).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === "email.mailbox" && !data.mailboxName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mailbox is required for mailbox-scoped keys.",
        path: ["mailboxName"],
      });
    }
  });

const deleteApiKeySchema = z.object({
  id: z.string().uuid(),
});

function requireOwner(role: "owner" | "member") {
  if (role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

async function assertTrialNotExpired(ctx: {
  db: TRPCContext["db"];
  teamId: string;
}) {
  const [team] = await ctx.db
    .select({
      createdAt: teams.createdAt,
      subscriptionStatus: teams.subscriptionStatus,
    })
    .from(teams)
    .where(eq(teams.id, ctx.teamId))
    .limit(1);

  if (team?.subscriptionStatus !== "trialing") return;
  if (!isTrialExpired(team.createdAt)) return;

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Trial ended. Upgrade to create API keys.",
  });
}

async function getTeamPlan(ctx: { db: TRPCContext["db"]; teamId: string }) {
  const [team] = await ctx.db
    .select({ plan: teams.plan })
    .from(teams)
    .where(eq(teams.id, ctx.teamId))
    .limit(1);

  return team?.plan ?? "starter";
}

async function assertApiKeyLimit(ctx: {
  db: TRPCContext["db"];
  teamId: string;
}) {
  const plan = await getTeamPlan(ctx);
  const entitlements = getPlanEntitlements(plan);

  if (typeof entitlements.apiKeys === "number") {
    const existingKeys = await listApiKeysByTeam(ctx.db, ctx.teamId);
    if (existingKeys.length >= entitlements.apiKeys) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "API key limit reached for your plan. Upgrade to create more.",
      });
    }
  }
}

export const apiKeysRouter = createTRPCRouter({
  list: teamProcedure.query(async ({ ctx }) => {
    return listApiKeysByTeam(ctx.db, ctx.teamId);
  }),

  create: teamProcedure
    .input(createApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);
      await assertTrialNotExpired(ctx);
      await assertApiKeyLimit(ctx);

      let mailboxName: string | null = null;
      if (input.scope === "email.mailbox") {
        mailboxName = input.mailboxName ?? null;
        if (mailboxName) {
          const mailbox = await getMailboxByName(ctx.db, {
            teamId: ctx.teamId,
            name: mailboxName,
          });

          if (!mailbox) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Mailbox not found.",
            });
          }
        }
      }

      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      let created:
        | {
            id: string;
            name: string;
            keyMasked: string;
            scopes: string[];
            mailboxName: string | null;
            createdAt: Date;
            expiresAt: Date | null;
            lastUsedAt: Date | null;
          }
        | undefined;
      let key = "";

      for (let attempt = 0; attempt < 3; attempt += 1) {
        key = generateApiKey();
        const keyHash = hashApiKey(key);
        const keyMasked = maskKey(key);

        try {
          const result = await createApiKeyWithSecret(ctx.db, {
            name: input.name,
            keyMasked,
            keyHash,
            teamId: ctx.teamId,
            userId: ctx.user!.id,
            scopes: [input.scope],
            mailboxName,
            expiresAt,
          });

          created = result;
          break;
        } catch (error) {
          if (error instanceof ApiKeyHashConflictError) {
            continue;
          }
          throw error;
        }
      }

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API key.",
        });
      }

      return {
        key,
        apiKey: created,
      };
    }),

  delete: teamProcedure
    .input(deleteApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      const deleted = await deleteApiKeyById(ctx.db, {
        id: input.id,
        teamId: ctx.teamId,
      });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deleted;
    }),
});
