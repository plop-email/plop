export type PlanTier = "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export type PlanEntitlements = {
  mailboxes: number | null;
  tags: number | null;
  emailsPerMonth: number | null;
  customDomains: boolean;
};

export type PlanPricing = {
  monthly: number;
  yearly: number;
  currency: "USD";
};

export type PlanDefinition = {
  tier: PlanTier;
  name: string;
  shortDescription: string;
  longDescription: string;
  comingSoon?: boolean;
  pricing: PlanPricing;
  entitlements: PlanEntitlements;
  highlights: string[];
};

export const DEFAULT_PLAN_TIER: PlanTier = "pro";

export const PLAN_CATALOG: Record<PlanTier, PlanDefinition> = {
  starter: {
    tier: "starter",
    name: "Starter",
    shortDescription: "One inbox with unlimited tags.",
    longDescription:
      "Best for solo test suites that only need a single mailbox and lots of tag routing.",
    pricing: {
      monthly: 6.99,
      yearly: 59.88,
      currency: "USD",
    },
    entitlements: {
      mailboxes: 1,
      tags: null,
      emailsPerMonth: 5000,
      customDomains: false,
    },
    highlights: [
      "1 email address",
      "Unlimited tags",
      "5,000 emails / month",
      "Shared domain",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    shortDescription: "Unlimited mailboxes for busy teams.",
    longDescription:
      "Scale inbox coverage across products, environments, and teams with unlimited mailboxes.",
    pricing: {
      monthly: 49,
      yearly: 468,
      currency: "USD",
    },
    entitlements: {
      mailboxes: null,
      tags: null,
      emailsPerMonth: null,
      customDomains: false,
    },
    highlights: [
      "Unlimited email addresses",
      "Unlimited tags",
      "Unlimited emails",
      "Shared domain",
    ],
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    shortDescription: "Custom domains and advanced routing.",
    longDescription:
      "Bring your own subdomains, advanced controls, and priority support.",
    comingSoon: true,
    pricing: {
      monthly: 0,
      yearly: 0,
      currency: "USD",
    },
    entitlements: {
      mailboxes: null,
      tags: null,
      emailsPerMonth: null,
      customDomains: true,
    },
    highlights: [
      "Custom subdomains",
      "Unlimited mailboxes",
      "Priority support",
      "Coming soon",
    ],
  },
};

export const RESERVED_MAILBOX_NAMES = new Set([
  "admin",
  "administrator",
  "abuse",
  "alerts",
  "api",
  "billing",
  "compliance",
  "contact",
  "devops",
  "help",
  "info",
  "legal",
  "mailer-daemon",
  "no-reply",
  "noreply",
  "ops",
  "postmaster",
  "privacy",
  "root",
  "sales",
  "security",
  "support",
  "system",
  "team",
  "terms",
  "webmaster",
]);

export function getPlanDefinition(plan: PlanTier) {
  return PLAN_CATALOG[plan];
}

export function getPlanEntitlements(plan: PlanTier): PlanEntitlements {
  return PLAN_CATALOG[plan].entitlements;
}

export function getPriceForCycle(plan: PlanTier, cycle: BillingCycle) {
  const pricing = PLAN_CATALOG[plan].pricing;
  return cycle === "yearly" ? pricing.yearly : pricing.monthly;
}

export function getMonthlyEquivalent(plan: PlanTier) {
  const pricing = PLAN_CATALOG[plan].pricing;
  return pricing.yearly / 12;
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function isReservedMailboxName(value: string) {
  const normalized = value.trim().toLowerCase();
  return RESERVED_MAILBOX_NAMES.has(normalized);
}

export function getBillingPeriodStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function getBillingPeriodEnd(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}
