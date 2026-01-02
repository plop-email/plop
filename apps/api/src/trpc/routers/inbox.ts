import { tz } from "@date-fns/tz";
import {
  DEFAULT_PLAN_TIER,
  getPlanEntitlements,
  isReservedMailboxName,
  isTrialExpired,
} from "@plop/billing";
import {
  inboxMailboxes,
  inboxMessages,
  teamInboxSettings,
  teams,
} from "@plop/db/schema";
import { TRPCError } from "@trpc/server";
import { endOfDay, startOfDay } from "date-fns";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { env } from "../../env";
import { getTeamRetentionStart } from "../../utils/retention";
import type { TRPCContext } from "../init";
import { createTRPCRouter, teamProcedure } from "../init";

function requireOwner(role: "owner" | "member") {
  if (role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

const mailboxNamePattern = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

const mailboxNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(mailboxNamePattern, {
    message:
      "Mailbox names may contain letters, numbers, dot, dash, underscore.",
  })
  .transform((value) => value.toLowerCase())
  .refine((value) => !isReservedMailboxName(value), {
    message: "Mailbox name is reserved.",
  });

const optionalDomainSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed.toLowerCase();
  },
  z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9.-]+$/i, { message: "Enter a valid domain name." })
    .nullable(),
);

const rootDomain = env.INBOX_ROOT_DOMAIN.trim().toLowerCase();
const utc = tz("UTC");
const messagesSortOptions = ["newest", "oldest", "sender", "subject"] as const;
type MessagesSort = (typeof messagesSortOptions)[number];
const messagesListSchema = z
  .object({
    mailboxId: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(200).optional(),
    offset: z.number().int().min(0).max(100000).optional(),
    sort: z.enum(messagesSortOptions).optional(),
    q: z.string().trim().min(1).max(200).optional(),
    tags: z.array(z.string().trim().min(1).max(64)).max(50).optional(),
    start: z.date().optional(),
    end: z.date().optional(),
  })
  .optional();
type MessagesListInput = z.infer<typeof messagesListSchema>;

function buildMessageConditions(
  teamId: string,
  input?: MessagesListInput,
  retentionStart?: Date | null,
) {
  const conditions: SQL[] = [eq(inboxMessages.teamId, teamId)];

  if (retentionStart) {
    conditions.push(gte(inboxMessages.receivedAt, retentionStart));
  }

  if (input?.mailboxId) {
    conditions.push(eq(inboxMessages.mailboxId, input.mailboxId));
  }

  const normalizedQuery = input?.q?.trim();
  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    const searchCondition = or(
      ilike(inboxMessages.subject, pattern),
      ilike(inboxMessages.fromAddress, pattern),
      ilike(inboxMessages.toAddress, pattern),
      ilike(inboxMessages.mailboxWithTag, pattern),
      ilike(inboxMessages.mailbox, pattern),
      ilike(inboxMessages.tag, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (input?.tags && input.tags.length > 0) {
    const uniqueTags = Array.from(new Set(input.tags));
    const tagsCondition = inArray(inboxMessages.tag, uniqueTags);
    if (tagsCondition) {
      conditions.push(tagsCondition);
    }
  }

  let startDate = input?.start ? startOfDay(input.start, { in: utc }) : null;
  let endDate = input?.end ? endOfDay(input.end, { in: utc }) : null;

  if (startDate && endDate && startDate > endDate) {
    const swapped = startDate;
    startDate = endDate;
    endDate = swapped;
  }

  if (startDate) {
    conditions.push(gte(inboxMessages.receivedAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(inboxMessages.receivedAt, endDate));
  }

  return conditions;
}

function getMessageOrder(sort?: MessagesSort) {
  switch (sort) {
    case "oldest":
      return [asc(inboxMessages.receivedAt), asc(inboxMessages.id)];
    case "sender":
      return [
        asc(inboxMessages.fromAddress),
        desc(inboxMessages.receivedAt),
        desc(inboxMessages.id),
      ];
    case "subject":
      return [
        asc(inboxMessages.subject),
        desc(inboxMessages.receivedAt),
        desc(inboxMessages.id),
      ];
    default:
      return [desc(inboxMessages.receivedAt), desc(inboxMessages.id)];
  }
}

async function getTeamPlan(ctx: { db: TRPCContext["db"]; teamId: string }) {
  const [team] = await ctx.db
    .select({ plan: teams.plan })
    .from(teams)
    .where(eq(teams.id, ctx.teamId))
    .limit(1);

  return team?.plan ?? DEFAULT_PLAN_TIER;
}

async function getTeamTrialState(ctx: {
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

  const isTrialing = team?.subscriptionStatus === "trialing";
  const expired = isTrialing && isTrialExpired(team?.createdAt ?? null);

  return { isTrialing, expired };
}

async function assertTrialNotExpired(ctx: {
  db: TRPCContext["db"];
  teamId: string;
}) {
  const trialState = await getTeamTrialState(ctx);
  if (!trialState.expired) return;

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Trial ended. Upgrade to continue.",
  });
}

function normalizeMailboxSeed(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[^a-z0-9]+/g, "")
    .replace(/[^a-z0-9]+$/g, "");

  if (!normalized) return "inbox";

  const trimmed = normalized.slice(0, 64).replace(/[^a-z0-9]+$/g, "");
  return trimmed.length > 0 ? trimmed : "inbox";
}

function buildMailboxCandidates(base: string) {
  const safeBase = normalizeMailboxSeed(base);
  const candidates = [safeBase, `${safeBase}-team`, `${safeBase}-inbox`];
  const randomSuffix = globalThis.crypto?.randomUUID?.().slice(0, 6) ?? "team";
  candidates.push(`${safeBase}-${randomSuffix}`);
  return candidates;
}

export const inboxRouter = createTRPCRouter({
  tags: createTRPCRouter({
    list: teamProcedure
      .input(z.object({ mailboxId: z.string().uuid().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const conditions: SQL<unknown>[] = [
          eq(inboxMessages.teamId, ctx.teamId),
        ];
        const retentionStart = await getTeamRetentionStart(ctx.db, ctx.teamId);

        if (retentionStart) {
          conditions.push(gte(inboxMessages.receivedAt, retentionStart));
        }

        if (input?.mailboxId) {
          conditions.push(eq(inboxMessages.mailboxId, input.mailboxId));
        }

        const rows = await ctx.db
          .select({ tag: inboxMessages.tag })
          .from(inboxMessages)
          .where(and(...conditions))
          .orderBy(inboxMessages.tag);

        const uniqueTags = new Set<string>();
        for (const row of rows) {
          if (row.tag) {
            uniqueTags.add(row.tag);
          }
        }

        return Array.from(uniqueTags).sort((a, b) => a.localeCompare(b));
      }),
  }),

  settings: createTRPCRouter({
    get: teamProcedure.query(async ({ ctx }) => {
      const [settings] = await ctx.db
        .select()
        .from(teamInboxSettings)
        .where(eq(teamInboxSettings.teamId, ctx.teamId))
        .limit(1);

      return settings ?? null;
    }),

    update: teamProcedure
      .input(z.object({ domain: optionalDomainSchema }))
      .mutation(async ({ ctx, input }) => {
        requireOwner(ctx.teamRole);
        const trialState = await getTeamTrialState(ctx);
        const isAddingDomain =
          typeof input.domain === "string" && input.domain.trim().length > 0;
        if (trialState.expired && isAddingDomain) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Trial ended. Upgrade to add a custom domain.",
          });
        }
        if (input.domain) {
          const plan = await getTeamPlan({
            db: ctx.db,
            teamId: ctx.teamId,
          });
          const entitlements = getPlanEntitlements(plan);
          if (!entitlements.customDomains) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Custom domains are available on the Enterprise plan.",
            });
          }
        }

        const nextDomain = input.domain ?? null;
        if (nextDomain === rootDomain) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Root domain is reserved for shared inbox routing.",
          });
        }
        if (nextDomain === null) {
          const teamMailboxes = await ctx.db
            .select({ name: inboxMailboxes.name })
            .from(inboxMailboxes)
            .where(eq(inboxMailboxes.teamId, ctx.teamId));

          const mailboxNames = teamMailboxes.map((row) => row.name);
          if (mailboxNames.length > 0) {
            const [conflict] = await ctx.db
              .select({ id: inboxMailboxes.id })
              .from(inboxMailboxes)
              .where(
                and(
                  eq(inboxMailboxes.domain, rootDomain),
                  inArray(inboxMailboxes.name, mailboxNames),
                  ne(inboxMailboxes.teamId, ctx.teamId),
                ),
              )
              .limit(1);

            if (conflict) {
              throw new TRPCError({
                code: "CONFLICT",
                message: "Mailbox name already taken on the root domain.",
              });
            }
          }
        }

        const [existing] = await ctx.db
          .select()
          .from(teamInboxSettings)
          .where(eq(teamInboxSettings.teamId, ctx.teamId))
          .limit(1);

        if (existing) {
          const [updated] = await ctx.db
            .update(teamInboxSettings)
            .set({ domain: nextDomain })
            .where(eq(teamInboxSettings.id, existing.id))
            .returning();

          await ctx.db
            .update(inboxMailboxes)
            .set({ domain: nextDomain ?? rootDomain })
            .where(eq(inboxMailboxes.teamId, ctx.teamId));

          return updated;
        }

        if (nextDomain === null) {
          return null;
        }

        const [created] = await ctx.db
          .insert(teamInboxSettings)
          .values({ teamId: ctx.teamId, domain: nextDomain })
          .returning();

        return created;
      }),
  }),

  mailboxes: createTRPCRouter({
    list: teamProcedure.query(async ({ ctx }) => {
      return ctx.db
        .select()
        .from(inboxMailboxes)
        .where(eq(inboxMailboxes.teamId, ctx.teamId))
        .orderBy(desc(inboxMailboxes.updatedAt), inboxMailboxes.name);
    }),

    checkAvailability: teamProcedure
      .input(
        z.object({
          name: z.string().trim().min(1).max(64),
          mailboxId: z.string().uuid().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        requireOwner(ctx.teamRole);

        const normalized = input.name.trim().toLowerCase();
        if (!mailboxNamePattern.test(normalized)) {
          return { available: false, reason: "invalid" as const };
        }

        if (isReservedMailboxName(normalized)) {
          return { available: false, reason: "reserved" as const };
        }

        const plan = await getTeamPlan({ db: ctx.db, teamId: ctx.teamId });
        const entitlements = getPlanEntitlements(plan);

        if (typeof entitlements.mailboxes === "number" && !input.mailboxId) {
          const [countRow] = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(inboxMailboxes)
            .where(eq(inboxMailboxes.teamId, ctx.teamId));

          const mailboxCount = Number(countRow?.count ?? 0);
          if (mailboxCount >= entitlements.mailboxes) {
            return { available: false, reason: "limit_reached" as const };
          }
        }

        const [settings] = await ctx.db
          .select()
          .from(teamInboxSettings)
          .where(eq(teamInboxSettings.teamId, ctx.teamId))
          .limit(1);

        const mailboxDomain = settings?.domain ?? rootDomain;
        const [existing] = await ctx.db
          .select({
            id: inboxMailboxes.id,
            teamId: inboxMailboxes.teamId,
          })
          .from(inboxMailboxes)
          .where(
            and(
              eq(inboxMailboxes.domain, mailboxDomain),
              eq(inboxMailboxes.name, normalized),
            ),
          )
          .limit(1);

        if (existing) {
          if (input.mailboxId && existing.id === input.mailboxId) {
            return { available: true } as const;
          }
          return {
            available: false,
            reason: existing.teamId === ctx.teamId ? "owned" : "taken",
          } as const;
        }

        return { available: true } as const;
      }),

    ensureStarterMailbox: teamProcedure.mutation(async ({ ctx }) => {
      requireOwner(ctx.teamRole);
      await assertTrialNotExpired(ctx);

      const plan = await getTeamPlan({ db: ctx.db, teamId: ctx.teamId });
      if (plan !== "starter") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Starter plan is required to auto-create a mailbox.",
        });
      }

      const existingMailboxes = await ctx.db
        .select()
        .from(inboxMailboxes)
        .where(eq(inboxMailboxes.teamId, ctx.teamId))
        .limit(1);

      if (existingMailboxes.length > 0) {
        return existingMailboxes[0];
      }

      const [settings] = await ctx.db
        .select()
        .from(teamInboxSettings)
        .where(eq(teamInboxSettings.teamId, ctx.teamId))
        .limit(1);

      const mailboxDomain = settings?.domain ?? rootDomain;

      const [team] = await ctx.db
        .select({ name: teams.name })
        .from(teams)
        .where(eq(teams.id, ctx.teamId))
        .limit(1);

      const candidates = buildMailboxCandidates(team?.name ?? "inbox");

      for (const candidate of candidates) {
        if (!mailboxNamePattern.test(candidate)) continue;
        if (isReservedMailboxName(candidate)) continue;

        const [existing] = await ctx.db
          .select({ id: inboxMailboxes.id })
          .from(inboxMailboxes)
          .where(
            and(
              eq(inboxMailboxes.domain, mailboxDomain),
              eq(inboxMailboxes.name, candidate),
            ),
          )
          .limit(1);

        if (existing) continue;

        const [mailbox] = await ctx.db
          .insert(inboxMailboxes)
          .values({
            teamId: ctx.teamId,
            domain: mailboxDomain,
            name: candidate,
          })
          .returning();

        return mailbox;
      }

      throw new TRPCError({
        code: "CONFLICT",
        message: "Unable to generate a mailbox name.",
      });
    }),

    create: teamProcedure
      .input(z.object({ name: mailboxNameSchema }))
      .mutation(async ({ ctx, input }) => {
        requireOwner(ctx.teamRole);
        await assertTrialNotExpired(ctx);

        const plan = await getTeamPlan({ db: ctx.db, teamId: ctx.teamId });
        const entitlements = getPlanEntitlements(plan);
        if (typeof entitlements.mailboxes === "number") {
          const [countRow] = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(inboxMailboxes)
            .where(eq(inboxMailboxes.teamId, ctx.teamId));
          const mailboxCount = Number(countRow?.count ?? 0);
          if (mailboxCount >= entitlements.mailboxes) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Mailbox limit reached for this plan.",
            });
          }
        }

        const [settings] = await ctx.db
          .select()
          .from(teamInboxSettings)
          .where(eq(teamInboxSettings.teamId, ctx.teamId))
          .limit(1);

        const mailboxDomain = settings?.domain ?? rootDomain;
        const [existingByDomain] = await ctx.db
          .select()
          .from(inboxMailboxes)
          .where(
            and(
              eq(inboxMailboxes.domain, mailboxDomain),
              eq(inboxMailboxes.name, input.name),
            ),
          )
          .limit(1);

        if (existingByDomain) {
          if (existingByDomain.teamId === ctx.teamId) {
            return existingByDomain;
          }
          throw new TRPCError({
            code: "CONFLICT",
            message: "Mailbox name already taken for this domain.",
          });
        }

        const [mailbox] = await ctx.db
          .insert(inboxMailboxes)
          .values({
            teamId: ctx.teamId,
            domain: mailboxDomain,
            name: input.name,
          })
          .returning();

        return mailbox;
      }),

    update: teamProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          name: mailboxNameSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        requireOwner(ctx.teamRole);
        await assertTrialNotExpired(ctx);

        const [mailbox] = await ctx.db
          .select()
          .from(inboxMailboxes)
          .where(
            and(
              eq(inboxMailboxes.id, input.id),
              eq(inboxMailboxes.teamId, ctx.teamId),
            ),
          )
          .limit(1);

        if (!mailbox) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (mailbox.name === input.name) {
          return mailbox;
        }

        const [teamConflict] = await ctx.db
          .select({ id: inboxMailboxes.id })
          .from(inboxMailboxes)
          .where(
            and(
              eq(inboxMailboxes.teamId, ctx.teamId),
              eq(inboxMailboxes.name, input.name),
              ne(inboxMailboxes.id, input.id),
            ),
          )
          .limit(1);

        if (teamConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Mailbox name already used in this team.",
          });
        }

        const [domainConflict] = await ctx.db
          .select({ id: inboxMailboxes.id, teamId: inboxMailboxes.teamId })
          .from(inboxMailboxes)
          .where(
            and(
              eq(inboxMailboxes.domain, mailbox.domain),
              eq(inboxMailboxes.name, input.name),
              ne(inboxMailboxes.id, input.id),
            ),
          )
          .limit(1);

        if (domainConflict && domainConflict.teamId !== ctx.teamId) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Mailbox name already taken for this domain.",
          });
        }

        const [updated] = await ctx.db
          .update(inboxMailboxes)
          .set({ name: input.name, updatedAt: new Date() })
          .where(eq(inboxMailboxes.id, mailbox.id))
          .returning();

        return updated ?? mailbox;
      }),

    remove: teamProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        requireOwner(ctx.teamRole);

        const [mailbox] = await ctx.db
          .select({ id: inboxMailboxes.id })
          .from(inboxMailboxes)
          .where(
            and(
              eq(inboxMailboxes.id, input.id),
              eq(inboxMailboxes.teamId, ctx.teamId),
            ),
          )
          .limit(1);

        if (!mailbox) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await ctx.db
          .delete(inboxMailboxes)
          .where(eq(inboxMailboxes.id, input.id));

        return { id: input.id };
      }),
  }),

  messages: createTRPCRouter({
    list: teamProcedure
      .input(messagesListSchema)
      .query(async ({ ctx, input }) => {
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        const sort = input?.sort ?? "newest";
        const retentionStart = await getTeamRetentionStart(ctx.db, ctx.teamId);
        const conditions = buildMessageConditions(
          ctx.teamId,
          input,
          retentionStart,
        );

        return ctx.db
          .select({
            id: inboxMessages.id,
            mailboxId: inboxMessages.mailboxId,
            mailbox: inboxMessages.mailbox,
            mailboxWithTag: inboxMessages.mailboxWithTag,
            tag: inboxMessages.tag,
            from: inboxMessages.fromAddress,
            to: inboxMessages.toAddress,
            subject: inboxMessages.subject,
            receivedAt: inboxMessages.receivedAt,
          })
          .from(inboxMessages)
          .where(and(...conditions))
          .orderBy(...getMessageOrder(sort))
          .limit(limit)
          .offset(offset);
      }),

    count: teamProcedure
      .input(messagesListSchema)
      .query(async ({ ctx, input }) => {
        const retentionStart = await getTeamRetentionStart(ctx.db, ctx.teamId);
        const conditions = buildMessageConditions(
          ctx.teamId,
          input,
          retentionStart,
        );

        const [row] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(inboxMessages)
          .where(and(...conditions))
          .limit(1);

        return { count: Number(row?.count ?? 0) };
      }),

    get: teamProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const retentionStart = await getTeamRetentionStart(ctx.db, ctx.teamId);
        const conditions: SQL<unknown>[] = [
          eq(inboxMessages.id, input.id),
          eq(inboxMessages.teamId, ctx.teamId),
        ];

        if (retentionStart) {
          conditions.push(gte(inboxMessages.receivedAt, retentionStart));
        }

        const [message] = await ctx.db
          .select({
            id: inboxMessages.id,
            mailboxId: inboxMessages.mailboxId,
            mailbox: inboxMessages.mailbox,
            mailboxWithTag: inboxMessages.mailboxWithTag,
            tag: inboxMessages.tag,
            from: inboxMessages.fromAddress,
            to: inboxMessages.toAddress,
            subject: inboxMessages.subject,
            receivedAt: inboxMessages.receivedAt,
            headers: inboxMessages.headers,
            htmlContent: inboxMessages.htmlContent,
            textContent: inboxMessages.textContent,
            domain: inboxMessages.domain,
            tenantSubdomain: inboxMessages.tenantSubdomain,
          })
          .from(inboxMessages)
          .where(and(...conditions))
          .limit(1);

        if (!message) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return message;
      }),
  }),
});
