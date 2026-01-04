export type PlanTier = "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export type PlanEntitlements = {
  mailboxes: number | null;
  tags: number | null;
  emailsPerMonth: number | null;
  customDomains: boolean;
  retentionDays: number | null;
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
      retentionDays: 14,
    },
    highlights: [
      "1 email address",
      "Unlimited tags",
      "5,000 emails / month",
      "14-day retention",
      "Shared domain",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    shortDescription: "10 email addresses for growing teams.",
    longDescription:
      "Scale inbox coverage across products, environments, and teams with 10 mailboxes.",
    pricing: {
      monthly: 49,
      yearly: 468,
      currency: "USD",
    },
    entitlements: {
      mailboxes: 10,
      tags: null,
      emailsPerMonth: 60000,
      customDomains: false,
      retentionDays: 90,
    },
    highlights: [
      "10 email addresses",
      "Unlimited tags",
      "60,000 emails / month",
      "90-day retention",
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
      retentionDays: null,
    },
    highlights: [
      "Custom subdomains",
      "Unlimited mailboxes",
      "Priority support",
      "Custom retention",
      "Coming soon",
    ],
  },
};

/**
 * Comprehensive list of reserved mailbox names to prevent:
 * - System/technical address conflicts (RFC 2142)
 * - Phishing and social engineering attacks
 * - Brand impersonation
 * - Service account conflicts
 */
export const RESERVED_MAILBOX_NAMES = new Set([
  // RFC 2142 Standard Email Addresses
  "abuse",
  "admin",
  "administrator",
  "hostmaster",
  "mailer-daemon",
  "postmaster",
  "root",
  "webmaster",

  // System & Technical
  "daemon",
  "system",
  "sys",
  "sysadmin",
  "devops",
  "ops",
  "noc",
  "it",
  "tech",
  "technical",

  // Common Service Accounts
  "no-reply",
  "noreply",
  "no_reply",
  "donotreply",
  "do-not-reply",
  "bounce",
  "bounces",
  "notifications",
  "notification",
  "alerts",
  "alert",
  "newsletter",
  "newsletters",
  "digest",

  // Customer Service & Support
  "support",
  "help",
  "helpdesk",
  "service",
  "contact",
  "info",
  "information",
  "inquiries",
  "inquiry",
  "feedback",
  "questions",

  // Sales & Marketing
  "sales",
  "marketing",
  "business",
  "partner",
  "partners",
  "affiliate",
  "affiliates",
  "reseller",

  // Financial & Billing
  "billing",
  "finance",
  "accounting",
  "accounts",
  "payment",
  "payments",
  "payroll",
  "invoice",
  "invoices",

  // Legal & Compliance
  "legal",
  "compliance",
  "privacy",
  "gdpr",
  "dpo",
  "terms",
  "dmca",
  "copyright",

  // Security
  "security",
  "abuse",
  "spam",
  "phishing",
  "fraud",
  "cert",
  "csirt",

  // API & Development
  "api",
  "webhook",
  "webhooks",
  "developer",
  "dev",
  "staging",
  "test",
  "testing",
  "demo",
  "sandbox",

  // Executive & Authority (Social Engineering Prevention)
  "ceo",
  "cfo",
  "cto",
  "coo",
  "ciso",
  "president",
  "vp",
  "director",
  "manager",
  "executive",
  "leadership",
  "board",
  "founder",
  "owner",

  // Human Resources
  "hr",
  "humanresources",
  "human-resources",
  "recruiting",
  "recruitment",
  "careers",
  "jobs",
  "hiring",

  // Brand Protection (Plop-specific)
  "plop",
  "team",
  "teams",
  "company",
  "official",
  "staff",
  "employee",
  "employees",

  // Common Generic Terms (Prevent Confusion)
  "all",
  "everyone",
  "nobody",
  "default",
  "example",
  "sample",
  "mail",
  "email",
  "inbox",
  "outbox",

  // Temporary & Testing
  "temp",
  "temporary",
  "tmp",
  "trash",
  "junk",
  "spam",
  "test",
  "testing",
  "qa",

  // Special Values
  "null",
  "undefined",
  "none",
  "unknown",
  "anonymous",
  "guest",

  // News & Updates
  "news",
  "updates",
  "announcements",
  "press",
  "media",
  "pr",

  // Operations
  "operations",
  "deployment",
  "deploy",
  "release",
  "releases",
  "status",
  "uptime",
  "monitoring",
  "logs",

  // Common Service Providers (Brand Protection)
  "google",
  "gmail",
  "microsoft",
  "outlook",
  "yahoo",
  "apple",
  "icloud",
  "amazon",
  "aws",

  // Government/Authority Impersonation Prevention
  "irs",
  "fbi",
  "cia",
  "nsa",
  "government",
  "gov",
  "federal",
  "state",
  "police",
  "court",

  // Payment Services (Phishing Prevention)
  "paypal",
  "stripe",
  "venmo",
  "cashapp",
  "zelle",
  "bank",
  "banking",

  // Social Media (Brand Protection)
  "facebook",
  "twitter",
  "x",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",

  // Shipping/Logistics (Phishing Prevention)
  "fedex",
  "ups",
  "usps",
  "dhl",
  "shipping",
  "delivery",
  "tracking",

  // Reserved for Future Use
  "reserved",
  "future",
  "coming-soon",
  "beta",
  "alpha",
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
