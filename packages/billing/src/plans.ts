export type PlanTier = "starter" | "team" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export type PlanEntitlements = {
  mailboxes: number | null;
  tags: number | null;
  emailsPerMonth: number | null;
  customDomains: boolean;
  retentionDays: number | null;
  teamMembers: number | null;
  apiKeys: number | null;
  webhooks: boolean;
  maxAttachmentSizeMb: number;
  rateLimit: number; // requests per minute
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
  badge?: string;
};

export const DEFAULT_PLAN_TIER: PlanTier = "pro";

/**
 * Plan catalog with competitive pricing for market entry.
 *
 * Pricing rationale:
 * - Starter $5/mo: Undercuts Mailosaur ($9), Mailtrap ($14), MailSlurp ($19)
 * - Team $19/mo: Fills gap for small teams, cheaper than Mailtrap Team ($34)
 * - Pro $49/mo: Cheaper than Mailosaur Business ($80), Mailtrap Business ($99)
 * - Enterprise: Custom pricing for large organizations
 */
export const PLAN_CATALOG: Record<PlanTier, PlanDefinition> = {
  starter: {
    tier: "starter",
    name: "Starter",
    shortDescription: "For solo developers and side projects.",
    longDescription:
      "Perfect for individual developers testing email flows in personal projects, side projects, or learning environments.",
    pricing: {
      monthly: 5,
      yearly: 48, // $4/mo equivalent, 20% savings
      currency: "USD",
    },
    entitlements: {
      mailboxes: 1,
      tags: null, // unlimited
      emailsPerMonth: 5000,
      customDomains: false,
      retentionDays: 7,
      teamMembers: 1,
      apiKeys: 1,
      webhooks: false,
      maxAttachmentSizeMb: 5,
      rateLimit: 60,
    },
    highlights: [
      "1 mailbox",
      "5,000 emails/month",
      "7-day retention",
      "Unlimited tags",
      "1 API key",
    ],
  },
  team: {
    tier: "team",
    name: "Team",
    shortDescription: "For small teams and growing projects.",
    longDescription:
      "Scale your email testing across multiple environments and team members with 5 dedicated mailboxes.",
    badge: "Popular",
    pricing: {
      monthly: 19,
      yearly: 182, // $15.17/mo equivalent, 20% savings
      currency: "USD",
    },
    entitlements: {
      mailboxes: 5,
      tags: null, // unlimited
      emailsPerMonth: 25000,
      customDomains: false,
      retentionDays: 30,
      teamMembers: 5,
      apiKeys: 3,
      webhooks: true,
      maxAttachmentSizeMb: 10,
      rateLimit: 300,
    },
    highlights: [
      "5 mailboxes",
      "25,000 emails/month",
      "30-day retention",
      "Webhooks",
      "5 team members",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    shortDescription: "For growing companies with advanced needs.",
    longDescription:
      "Enterprise-grade email testing with extended retention, higher limits, and priority support.",
    pricing: {
      monthly: 49,
      yearly: 470, // $39.17/mo equivalent, 20% savings
      currency: "USD",
    },
    entitlements: {
      mailboxes: 20,
      tags: null, // unlimited
      emailsPerMonth: 100000,
      customDomains: false,
      retentionDays: 90,
      teamMembers: 15,
      apiKeys: 10,
      webhooks: true,
      maxAttachmentSizeMb: 25,
      rateLimit: 1000,
    },
    highlights: [
      "20 mailboxes",
      "100,000 emails/month",
      "90-day retention",
      "15 team members",
      "Priority support",
    ],
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    shortDescription: "Custom domains and enterprise security.",
    longDescription:
      "Tailored solutions with custom subdomains, SSO/SAML, dedicated support, and compliance features.",
    comingSoon: true,
    pricing: {
      monthly: 0, // Custom pricing
      yearly: 0,
      currency: "USD",
    },
    entitlements: {
      mailboxes: null, // unlimited
      tags: null,
      emailsPerMonth: null, // unlimited
      customDomains: true,
      retentionDays: null, // custom
      teamMembers: null, // unlimited
      apiKeys: null, // unlimited
      webhooks: true,
      maxAttachmentSizeMb: 50,
      rateLimit: 5000,
    },
    highlights: [
      "Custom subdomains",
      "Unlimited mailboxes",
      "SSO/SAML",
      "Dedicated support",
      "Custom retention",
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

/**
 * Check if a plan tier is valid for selection (not coming soon)
 */
export function isPlanAvailable(plan: PlanTier): boolean {
  return !PLAN_CATALOG[plan].comingSoon;
}

/**
 * Get all available (non-coming-soon) plans
 */
export function getAvailablePlans(): PlanDefinition[] {
  return Object.values(PLAN_CATALOG).filter((plan) => !plan.comingSoon);
}

/**
 * Get all plans including coming soon
 */
export function getAllPlans(): PlanDefinition[] {
  return Object.values(PLAN_CATALOG);
}

/**
 * Calculate annual savings percentage
 */
export function getAnnualSavingsPercent(plan: PlanTier): number {
  const pricing = PLAN_CATALOG[plan].pricing;
  if (pricing.monthly === 0) return 0;
  const annualIfMonthly = pricing.monthly * 12;
  const savings = ((annualIfMonthly - pricing.yearly) / annualIfMonthly) * 100;
  return Math.round(savings);
}
