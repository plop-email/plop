import { DEFAULT_PLAN_TIER, type PlanTier } from "@plop/billing";
import { db } from "@plop/db/client";
import { teams } from "@plop/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { ApiKeyContext } from "./auth";

// ─── Team plan lookup ───────────────────────────────────────────

export async function getTeamPlan(teamId: string): Promise<PlanTier> {
  const [team] = await db
    .select({ plan: teams.plan })
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  return (team?.plan as PlanTier) ?? DEFAULT_PLAN_TIER;
}

// ─── Scope checks ───────────────────────────────────────────────

function hasScope(scopes: string[], value: string): boolean {
  return scopes.includes(value);
}

export function hasEmailScope(scopes: string[]): boolean {
  return (
    hasScope(scopes, "api.full") ||
    hasScope(scopes, "email.full") ||
    hasScope(scopes, "email.mailbox")
  );
}

export function hasApiFullScope(scopes: string[]): boolean {
  return hasScope(scopes, "api.full");
}

export function resolveMailboxScope(
  apiKey: ApiKeyContext,
  requestedMailbox: string | null,
): string | null {
  if (
    hasScope(apiKey.scopes, "api.full") ||
    hasScope(apiKey.scopes, "email.full")
  ) {
    return requestedMailbox;
  }

  if (hasScope(apiKey.scopes, "email.mailbox")) {
    if (!apiKey.mailboxName) {
      throw new Error("FORBIDDEN_MAILBOX_SCOPE");
    }
    if (requestedMailbox && requestedMailbox !== apiKey.mailboxName) {
      throw new Error("FORBIDDEN_MAILBOX_SCOPE");
    }
    return apiKey.mailboxName;
  }

  return requestedMailbox;
}

// ─── Parsing helpers ────────────────────────────────────────────

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

export function parseMailboxName(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  const localPart = trimmed.includes("@")
    ? (trimmed.split("@")[0] ?? "")
    : trimmed;

  const parsed = mailboxNameSchema.safeParse(localPart);
  if (!parsed.success) return null;
  return parsed.data;
}

export function parseCsv(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function normalizeDateRange(
  start: string | undefined,
  end: string | undefined,
): { start: Date | null; end: Date | null } {
  const startDate = start ? new Date(`${start}T00:00:00.000Z`) : null;
  const endDate = end ? new Date(`${end}T23:59:59.999Z`) : null;

  const validStart =
    startDate && !Number.isNaN(startDate.getTime()) ? startDate : null;
  const validEnd = endDate && !Number.isNaN(endDate.getTime()) ? endDate : null;

  if (validStart && validEnd && validStart > validEnd) {
    return { start: validEnd, end: validStart };
  }

  return { start: validStart, end: validEnd };
}
