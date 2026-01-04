import { isReservedMailboxName } from "@plop/billing";
import {
  inboxMailboxes,
  teamInboxSettings,
  teamInvites,
  teamMemberships,
  teams,
  users,
} from "@plop/db/schema";
import { logger } from "@plop/logger";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "../../env";
import { sendTeamInviteEmail } from "../../utils/email";
import { createTRPCRouter, protectedProcedure, teamProcedure } from "../init";

const rootDomain =
  env.INBOX_ROOT_DOMAIN?.trim().toLowerCase() ?? "in.plop.email";
const mailboxNamePattern = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

// Common consumer email domains where the domain name shouldn't be used as mailbox seed
const CONSUMER_EMAIL_DOMAINS = new Set([
  // Google
  "gmail.com",
  "googlemail.com",
  // Microsoft
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  // Yahoo
  "yahoo.com",
  "ymail.com",
  "yahoo.co.uk",
  "yahoo.ca",
  "yahoo.com.au",
  // Apple
  "icloud.com",
  "me.com",
  "mac.com",
  // Others
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "fastmail.com",
  "hey.com",
  "pm.me",
  "tutanota.com",
  "gmx.com",
  "gmx.net",
]);

function isConsumerEmailDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().trim();
  return CONSUMER_EMAIL_DOMAINS.has(normalized);
}

function generateRandomSuffix(length = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(length);
  globalThis.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    const idx = randomValues[i];
    if (idx !== undefined) {
      result += chars[idx % chars.length];
    }
  }
  return result;
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
  const randomSuffix = generateRandomSuffix(4);
  const candidates = [safeBase, `${safeBase}-team`, `${safeBase}-inbox`];
  candidates.push(`${safeBase}-${randomSuffix}`);
  return candidates;
}

/**
 * Extracts the first name from a full name string.
 */
function getFirstName(fullName: string): string | null {
  const trimmed = fullName.trim();
  if (!trimmed) return null;
  const firstName = trimmed.split(/\s+/)[0];
  return firstName && firstName.length >= 2 ? firstName : null;
}

/**
 * Tries to extract a human-readable name from an email username.
 * Returns null if the username doesn't look like a name.
 */
function extractNameFromUsername(username: string): string | null {
  // Remove common numeric suffixes and clean up
  const cleaned = username.replace(/\d+$/, "").toLowerCase();
  if (!cleaned || cleaned.length < 2) return null;

  // Check if it looks like a name pattern (letters with optional separators)
  // e.g., "john.doe", "john_doe", "johndoe", "john-doe"
  if (!/^[a-z]+([._-][a-z]+)?$/i.test(cleaned)) return null;

  // Split by common separators and capitalize
  const parts = cleaned.split(/[._-]/);
  if (parts.some((p) => p.length < 2)) return null;

  // Return the first part (first name) capitalized
  const firstName = parts[0];
  if (!firstName) return null;
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

function extractTeamNameFromEmail(
  email: string,
  fullName?: string | null,
): string {
  // Priority 1: Use the user's actual full name if available
  const firstName = fullName ? getFirstName(fullName) : null;
  if (firstName) {
    return `${firstName}'s Team`;
  }

  const [username, fullDomain] = email.toLowerCase().split("@");
  const domainPrefix = fullDomain?.split(".")[0] ?? "";

  // Priority 2: For business emails, use the domain name
  if (
    domainPrefix &&
    domainPrefix.length >= 2 &&
    !isConsumerEmailDomain(fullDomain ?? "")
  ) {
    return domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1);
  }

  // Priority 3: For consumer emails, try to extract name from username
  const nameFromUsername = extractNameFromUsername(username ?? "");
  if (nameFromUsername) {
    return `${nameFromUsername}'s Team`;
  }

  // Fallback: generic team name
  return "My Team";
}

/**
 * Extracts a suitable mailbox seed from a user's email address.
 * - For consumer emails (gmail, yahoo, etc.): uses username + random suffix
 * - For business emails: uses the domain prefix
 */
function extractMailboxSeedFromEmail(email: string): string {
  const [username, fullDomain] = email.toLowerCase().split("@");
  const domainPrefix = fullDomain?.split(".")[0] ?? "";

  // For consumer email providers, use username + random suffix for uniqueness
  if (isConsumerEmailDomain(fullDomain ?? "")) {
    const normalizedUsername = normalizeMailboxSeed(username ?? "inbox");
    const suffix = generateRandomSuffix(4);
    return `${normalizedUsername}-${suffix}`;
  }

  // For business domains, use the domain prefix
  if (domainPrefix && domainPrefix.length >= 2) {
    return domainPrefix;
  }

  // Fallback: use username with random suffix
  const normalizedUsername = normalizeMailboxSeed(username ?? "inbox");
  const suffix = generateRandomSuffix(4);
  return `${normalizedUsername}-${suffix}`;
}

function requireOwner(role: "owner" | "member") {
  if (role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

function normalizeRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows?: T[] }).rows;
    if (Array.isArray(rows)) return rows;
  }
  return [];
}

const trialPlanSchema = z.enum(["starter", "pro"]);

export const teamRouter = createTRPCRouter({
  current: teamProcedure.query(async ({ ctx }) => {
    const [team] = await ctx.db
      .select()
      .from(teams)
      .where(eq(teams.id, ctx.teamId))
      .limit(1);

    if (!team) return null;

    return {
      ...team,
      role: ctx.teamRole,
    };
  }),

  membership: protectedProcedure.query(async ({ ctx }) => {
    const membershipDb = ctx.db.usePrimaryOnly
      ? ctx.db.usePrimaryOnly()
      : ctx.db;
    const [membership] = await membershipDb
      .select({
        teamId: teamMemberships.teamId,
        role: teamMemberships.role,
      })
      .from(teamMemberships)
      .where(eq(teamMemberships.userId, ctx.user.id))
      .limit(1);

    return membership ?? null;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(80),
        plan: trialPlanSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membershipDb = ctx.db.usePrimaryOnly
        ? ctx.db.usePrimaryOnly()
        : ctx.db;
      const [membership] = await membershipDb
        .select({ id: teamMemberships.id })
        .from(teamMemberships)
        .where(eq(teamMemberships.userId, ctx.user.id))
        .limit(1);

      if (membership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have a team.",
        });
      }

      const name = input.name.trim();
      if (!name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team name is required.",
        });
      }

      const plan = input.plan ?? "pro";

      const result = await ctx.db.execute<{ id: string }>(
        sql`select public.create_team(${name}, ${plan}) as id`,
      );

      const teamId = result[0]?.id;
      if (!teamId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create team.",
        });
      }

      return { teamId };
    }),

  autoSetup: protectedProcedure
    .input(z.object({ plan: trialPlanSchema.optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const plan = input?.plan ?? "pro";
      // Check if user already has a team
      const membershipDb = ctx.db.usePrimaryOnly
        ? ctx.db.usePrimaryOnly()
        : ctx.db;
      const [existingMembership] = await membershipDb
        .select({ teamId: teamMemberships.teamId })
        .from(teamMemberships)
        .where(eq(teamMemberships.userId, ctx.user.id))
        .limit(1);

      if (existingMembership) {
        // Already has a team, return it
        return { teamId: existingMembership.teamId, alreadySetup: true };
      }

      // Check for pending invites
      const invitesResult = await ctx.db.execute(
        sql`select id from public.list_invites_for_current_user() limit 1`,
      );
      const rows = normalizeRows<{ id: string }>(invitesResult);
      if (rows.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "You have pending team invites. Please accept or decline them first.",
        });
      }

      // Generate team name from user data
      const email = ctx.user?.email ?? "";
      const fullName = ctx.session?.user?.full_name;
      const teamName = extractTeamNameFromEmail(email, fullName);

      // Create team with selected plan
      const result = await ctx.db.execute<{ id: string }>(
        sql`select public.create_team(${teamName}, ${plan}) as id`,
      );

      const teamId = result[0]?.id;
      if (!teamId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create team.",
        });
      }

      // Mark onboarding as completed immediately
      await ctx.db
        .update(teams)
        .set({ onboardingCompletedAt: new Date() })
        .where(eq(teams.id, teamId));

      // Auto-create first mailbox
      const [settings] = await ctx.db
        .select()
        .from(teamInboxSettings)
        .where(eq(teamInboxSettings.teamId, teamId))
        .limit(1);

      const mailboxDomain = settings?.domain ?? rootDomain;
      // Use email-based mailbox seed for smarter naming
      // - Consumer emails (gmail, etc.): uses username + random suffix (e.g., john-x7k2)
      // - Business emails: uses domain prefix (e.g., acme)
      const mailboxSeed = extractMailboxSeedFromEmail(email);
      const candidates = buildMailboxCandidates(mailboxSeed);

      let createdMailbox = null;
      for (const candidate of candidates) {
        if (!mailboxNamePattern.test(candidate)) continue;
        if (isReservedMailboxName(candidate)) continue;

        try {
          const [mailbox] = await ctx.db
            .insert(inboxMailboxes)
            .values({
              teamId,
              domain: mailboxDomain,
              name: candidate,
            })
            .onConflictDoNothing({
              target: [inboxMailboxes.domain, inboxMailboxes.name],
            })
            .returning();

          if (mailbox) {
            createdMailbox = mailbox;
            break;
          }
          // Conflict occurred, try next candidate
        } catch (error) {
          // Handle any unexpected constraint violations by trying next candidate
          const isConstraintViolation =
            error instanceof Error &&
            "code" in error &&
            (error as { code?: string }).code === "23505";
          if (isConstraintViolation) continue;
          throw error;
        }
      }

      logger.info(
        { teamId, teamName, mailbox: createdMailbox?.name },
        "Auto-setup completed",
      );

      return {
        teamId,
        teamName,
        mailboxName: createdMailbox?.name ?? null,
        mailboxDomain,
        alreadySetup: false,
      };
    }),

  update: teamProcedure
    .input(
      z.object({
        name: z.string().min(1).max(80).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      const [team] = await ctx.db
        .update(teams)
        .set({
          ...(input.name !== undefined && { name: input.name }),
        })
        .where(eq(teams.id, ctx.teamId))
        .returning();

      return team;
    }),

  members: teamProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        membership: teamMemberships,
        user: users,
      })
      .from(teamMemberships)
      .innerJoin(users, eq(teamMemberships.userId, users.id))
      .where(eq(teamMemberships.teamId, ctx.teamId))
      .orderBy(desc(teamMemberships.createdAt));

    return rows.map((row) => ({
      id: row.membership.id,
      role: row.membership.role,
      createdAt: row.membership.createdAt,
      user: {
        id: row.user.id,
        email: row.user.email,
        fullName: row.user.fullName,
        avatarUrl: row.user.avatarUrl,
      },
    }));
  }),

  invites: teamProcedure.query(async ({ ctx }) => {
    requireOwner(ctx.teamRole);

    return ctx.db
      .select()
      .from(teamInvites)
      .where(
        and(eq(teamInvites.teamId, ctx.teamId), isNull(teamInvites.acceptedAt)),
      )
      .orderBy(desc(teamInvites.createdAt));
  }),

  invitesByEmail: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.email) return [];

    const membershipDb = ctx.db.usePrimaryOnly
      ? ctx.db.usePrimaryOnly()
      : ctx.db;
    const [membership] = await membershipDb
      .select({ id: teamMemberships.id })
      .from(teamMemberships)
      .where(eq(teamMemberships.userId, ctx.user.id))
      .limit(1);

    if (membership) return [];

    const result = await ctx.db.execute(
      sql`select * from public.list_invites_for_current_user()`,
    );

    const rows = normalizeRows<{
      id: string;
      email: string;
      role: "owner" | "member";
      created_at: Date;
      team_id: string;
      team_name: string;
    }>(result);

    return rows.map((row) => ({
      id: row.id as string,
      email: row.email as string,
      role: row.role as "owner" | "member",
      createdAt: row.created_at as Date,
      teamId: row.team_id as string,
      teamName: row.team_name as string,
    }));
  }),

  invite: teamProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      const [existing] = await ctx.db
        .select()
        .from(teamInvites)
        .where(
          and(
            eq(teamInvites.teamId, ctx.teamId),
            eq(teamInvites.email, input.email),
            isNull(teamInvites.acceptedAt),
          ),
        )
        .limit(1);

      if (existing) return existing;

      const [invite] = await ctx.db
        .insert(teamInvites)
        .values({
          teamId: ctx.teamId,
          email: input.email,
          role: "member",
          invitedBy: ctx.user!.id,
        })
        .returning();

      if (!invite) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create invite.",
        });
      }

      const [team] = await ctx.db
        .select({ name: teams.name })
        .from(teams)
        .where(eq(teams.id, ctx.teamId))
        .limit(1);

      const inviteUrl = new URL("/teams", env.APP_URL);
      inviteUrl.searchParams.set("invite", invite.id);

      try {
        await sendTeamInviteEmail({
          to: invite.email,
          teamName: team?.name ?? "your team",
          inviteUrl: inviteUrl.toString(),
          invitedByName:
            ctx.session?.user.full_name || ctx.user?.email || undefined,
        });
      } catch (error) {
        logger.warn(
          { error, inviteId: invite.id, email: invite.email },
          "Failed to send team invite email",
        );
      }

      return invite;
    }),

  acceptInvite: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required to accept an invite.",
        });
      }

      try {
        const result = await ctx.db.execute(
          sql`select public.accept_team_invite(${input.inviteId}) as team_id`,
        );
        const rows = normalizeRows<{ team_id: string }>(result);
        const teamId = rows[0]?.team_id as string | undefined;
        if (!teamId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invite not found.",
          });
        }
        return { teamId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unable to accept invite.",
        });
      }
    }),

  declineInvite: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required to decline an invite.",
        });
      }

      try {
        const result = await ctx.db.execute(
          sql`select public.decline_team_invite(${input.inviteId}) as ok`,
        );
        const rows = normalizeRows<{ ok: boolean }>(result);
        return { ok: Boolean(rows[0]?.ok) };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unable to decline invite.",
        });
      }
    }),

  deleteInvite: teamProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      await ctx.db
        .delete(teamInvites)
        .where(
          and(
            eq(teamInvites.id, input.inviteId),
            eq(teamInvites.teamId, ctx.teamId),
            isNull(teamInvites.acceptedAt),
          ),
        );

      return { ok: true };
    }),

  removeMember: teamProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      if (input.userId === ctx.user!.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can’t remove yourself.",
        });
      }

      const memberships = await ctx.db
        .select()
        .from(teamMemberships)
        .where(eq(teamMemberships.teamId, ctx.teamId));

      const target = memberships.find((m) => m.userId === input.userId);
      if (!target) return { ok: true };

      const ownerCount = memberships.filter((m) => m.role === "owner").length;
      if (target.role === "owner" && ownerCount <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can’t remove the last owner.",
        });
      }

      await ctx.db
        .delete(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, ctx.teamId),
            eq(teamMemberships.userId, input.userId),
          ),
        );

      return { ok: true };
    }),
});
