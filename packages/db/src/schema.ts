import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const teamRole = pgEnum("team_role", ["owner", "member"]);

export const teamPlan = pgEnum("team_plan", [
  "starter",
  "team",
  "pro",
  "enterprise",
]);

export const billingCycle = pgEnum("billing_cycle", ["monthly", "yearly"]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

const privateSchema = pgSchema("private");

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  plan: teamPlan("plan").notNull().default("pro"),
  billingCycle: billingCycle("billing_cycle"),
  subscriptionStatus: subscriptionStatus("subscription_status"),
  polarCustomerId: text("polar_customer_id"),
  polarSubscriptionId: text("polar_subscription_id"),
  polarProductId: text("polar_product_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teamMemberships = pgTable(
  "team_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: teamRole("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueUserId: uniqueIndex("team_memberships_unique_user_id").on(
      table.userId,
    ),
    uniqueTeamUser: uniqueIndex("team_memberships_unique_team_user").on(
      table.teamId,
      table.userId,
    ),
  }),
);

export const teamInvites = pgTable(
  "team_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: teamRole("role").notNull().default("member"),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (table) => ({
    teamIdIndex: index("idx_team_invites_team_id").on(table.teamId),
    emailIndex: index("idx_team_invites_email").on(table.email),
  }),
);

export const teamInboxSettings = pgTable(
  "team_inbox_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    domain: text("domain"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueTeamId: uniqueIndex("team_inbox_settings_unique_team_id").on(
      table.teamId,
    ),
    uniqueDomain: uniqueIndex("team_inbox_settings_unique_domain").on(
      table.domain,
    ),
  }),
);

export const inboxMailboxes = pgTable(
  "inbox_mailboxes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    teamIdIndex: index("idx_inbox_mailboxes_team_id").on(table.teamId),
    uniqueDomainMailbox: uniqueIndex("inbox_mailboxes_unique_domain_name").on(
      table.domain,
      table.name,
    ),
    uniqueTeamMailbox: uniqueIndex("inbox_mailboxes_unique_team_name").on(
      table.teamId,
      table.name,
    ),
  }),
);

export const inboxMessages = pgTable(
  "inbox_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    mailboxId: uuid("mailbox_id")
      .notNull()
      .references(() => inboxMailboxes.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    domain: text("domain").notNull(),
    tenantSubdomain: text("tenant_subdomain"),
    mailbox: text("mailbox").notNull(),
    mailboxWithTag: text("mailbox_with_tag").notNull(),
    tag: text("tag"),
    fromAddress: text("from_address").notNull(),
    toAddress: text("to_address").notNull(),
    subject: text("subject"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    headers: jsonb("headers")
      .$type<Array<{ name: string; value: string }>>()
      .notNull(),
    htmlContent: text("html_content"),
    textContent: text("text_content"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueExternalId: uniqueIndex("inbox_messages_unique_external_id").on(
      table.externalId,
    ),
    teamIdIndex: index("idx_inbox_messages_team_id").on(table.teamId),
    mailboxIdIndex: index("idx_inbox_messages_mailbox_id").on(table.mailboxId),
    receivedAtIndex: index("idx_inbox_messages_received_at").on(
      table.receivedAt,
    ),
  }),
);

export const teamEmailUsage = pgTable(
  "team_email_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    teamIdIndex: index("idx_team_email_usage_team_id").on(table.teamId),
    uniqueTeamPeriod: uniqueIndex("team_email_usage_unique_team_period").on(
      table.teamId,
      table.periodStart,
    ),
  }),
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    keyMasked: text("key_masked").notNull(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scopes: text("scopes").array().notNull().default(sql`'{}'::text[]`),
    mailboxName: text("mailbox_name"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    teamIdIndex: index("idx_api_keys_team_id").on(table.teamId),
    userIdIndex: index("idx_api_keys_user_id").on(table.userId),
    expiresAtIndex: index("idx_api_keys_expires_at").on(table.expiresAt),
  }),
);

export const apiKeySecrets = privateSchema.table(
  "api_key_secrets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiKeyId: uuid("api_key_id")
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    keyHash: text("key_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    keyHashUnique: uniqueIndex("api_keys_key_hash_unique").on(table.keyHash),
    apiKeyIdUnique: uniqueIndex("api_keys_secret_api_key_unique").on(
      table.apiKeyId,
    ),
  }),
);

export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    description: text("description"),
    secretMasked: text("secret_masked").notNull(),
    events: text("events")
      .array()
      .notNull()
      .default(sql`'{email.received}'::text[]`),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    teamIdIndex: index("idx_webhook_endpoints_team_id").on(table.teamId),
    uniqueTeamUrl: uniqueIndex("webhook_endpoints_unique_team_url").on(
      table.teamId,
      table.url,
    ),
  }),
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    webhookEndpointId: uuid("webhook_endpoint_id")
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    messageId: uuid("message_id").references(() => inboxMessages.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("pending"),
    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    latencyMs: integer("latency_ms"),
    attempt: integer("attempt").notNull().default(1),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    endpointIdIndex: index("idx_webhook_deliveries_endpoint_id").on(
      table.webhookEndpointId,
    ),
    endpointCreatedIndex: index("idx_webhook_deliveries_endpoint_created").on(
      table.webhookEndpointId,
      table.createdAt,
    ),
  }),
);

export const webhookSecrets = privateSchema.table(
  "webhook_secrets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    webhookEndpointId: uuid("webhook_endpoint_id")
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: "cascade" }),
    secret: text("secret").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    endpointIdUnique: uniqueIndex("webhook_secrets_endpoint_unique").on(
      table.webhookEndpointId,
    ),
  }),
);
