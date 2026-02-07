import { z } from "@hono/zod-openapi";

export const errorResponseSchema = z
  .object({
    error: z.string().openapi({
      description: "Error message describing what went wrong.",
    }),
    details: z
      .object({})
      .catchall(z.array(z.string()))
      .optional()
      .openapi({
        description:
          "Optional validation details keyed by field name. Each field contains a list of validation messages.",
        example: {
          mailbox: ["Mailbox not found."],
        },
      }),
  })
  .openapi("ErrorResponse");

export const mailboxQuerySchema = z.object({
  mailbox: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "mailbox",
        in: "query",
        description:
          "Mailbox local part or full address. For mailbox-scoped keys, this must match the scoped mailbox.",
      },
      description:
        "Mailbox local part or full address. For mailbox-scoped keys, this must match the scoped mailbox.",
      example: "qa",
    }),
});

export const mailboxSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({ example: "2f5b9f7e-4b8c-4e02-9c1f-9d37a0e8d1ef" }),
    name: z.string().openapi({ example: "qa" }),
    domain: z.string().nullable().openapi({ example: "in.plop.email" }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: "2025-12-24T12:00:00.000Z" }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ example: "2025-12-24T12:00:00.000Z" }),
    address: z.string().openapi({ example: "qa@in.plop.email" }),
  })
  .openapi("Mailbox");

export const mailboxesResponseSchema = z
  .object({
    data: z.array(mailboxSchema),
  })
  .openapi("MailboxesResponse");

export const messageQuerySchema = z.object({
  mailbox: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "mailbox",
        in: "query",
        description:
          "Mailbox local part or full address. If omitted, searches across all mailboxes in scope.",
      },
      description:
        "Mailbox local part or full address. If omitted, searches across all mailboxes in scope.",
      example: "qa",
    }),
  tag: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "tag",
        in: "query",
        description: "Single tag to match.",
      },
      description: "Single tag to match.",
      example: "login",
    }),
  tags: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "tags",
        in: "query",
        description: "Comma-separated list of tags to match.",
      },
      description: "Comma-separated list of tags to match.",
      example: "login,otp",
    }),
  q: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "q",
        in: "query",
        description: "Free-text search across subject, from, to, mailbox, tag.",
      },
      description: "Free-text search across subject, from, to, mailbox, tag.",
      example: "token",
    }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .openapi({
      param: {
        name: "limit",
        in: "query",
        description: "Maximum number of messages to return (1-200).",
      },
      description: "Maximum number of messages to return (1-200).",
      example: 50,
    }),
  start: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "start",
        in: "query",
        description: "Start date (YYYY-MM-DD).",
      },
      description: "Start date (YYYY-MM-DD).",
      example: "2025-12-24",
    }),
  end: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "end",
        in: "query",
        description: "End date (YYYY-MM-DD).",
      },
      description: "End date (YYYY-MM-DD).",
      example: "2025-12-24",
    }),
  since: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "since",
        in: "query",
        description: "Start timestamp (ISO 8601).",
      },
      description: "Start timestamp (ISO 8601).",
      example: "2025-12-24T00:00:00.000Z",
    }),
  to: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "to",
        in: "query",
        description: "Filter by recipient address (partial match).",
      },
      description: "Filter by recipient address (partial match).",
      example: "qa@in.plop.email",
    }),
  from: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "from",
        in: "query",
        description: "Filter by sender address (partial match).",
      },
      description: "Filter by sender address (partial match).",
      example: "no-reply@example.com",
    }),
  subject: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "subject",
        in: "query",
        description: "Filter by subject (partial match).",
      },
      description: "Filter by subject (partial match).",
      example: "Login token",
    }),
  after_id: z
    .string()
    .uuid()
    .optional()
    .openapi({
      param: {
        name: "after_id",
        in: "query",
        description:
          "Cursor: return messages older than this message ID (keyset pagination).",
      },
      description:
        "Cursor: return messages older than this message ID (keyset pagination).",
      example: "7d19c3e2-5e2a-4c83-8e41-5201f97b7e5e",
    }),
});

export const messageSummarySchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({ example: "7d19c3e2-5e2a-4c83-8e41-5201f97b7e5e" }),
    mailboxId: z
      .string()
      .uuid()
      .openapi({ example: "7e0a7c63-2eab-4bb1-9d64-8a443d6b9e2a" }),
    mailbox: z.string().openapi({ example: "qa" }),
    mailboxWithTag: z.string().openapi({ example: "qa+login" }),
    tag: z.string().nullable().openapi({ example: "login" }),
    from: z.string().openapi({ example: "no-reply@example.com" }),
    to: z.string().openapi({ example: "qa@in.plop.email" }),
    subject: z.string().nullable().openapi({ example: "Your login token" }),
    receivedAt: z
      .string()
      .datetime()
      .openapi({ example: "2025-12-24T12:34:56.000Z" }),
  })
  .openapi("MessageSummary");

export const messageHeadersSchema = z
  .object({
    name: z.string().openapi({ example: "X-Request-Id" }),
    value: z.string().openapi({ example: "abc-123" }),
  })
  .openapi("MessageHeader");

export const messageDetailSchema = messageSummarySchema
  .extend({
    headers: z.array(messageHeadersSchema),
    htmlContent: z.string().nullable().openapi({
      description: "Raw HTML body if available.",
    }),
    textContent: z.string().nullable().openapi({
      description: "Plain text body if available.",
    }),
    domain: z.string().openapi({ example: "in.plop.email" }),
    tenantSubdomain: z.string().nullable().openapi({ example: "acme" }),
  })
  .openapi("MessageDetail");

export const messagesResponseSchema = z
  .object({
    data: z.array(messageSummarySchema),
    has_more: z.boolean().openapi({
      description: "Whether more messages exist beyond this page.",
    }),
  })
  .openapi("MessagesResponse");

export const messageResponseSchema = z
  .object({
    data: messageDetailSchema,
  })
  .openapi("MessageResponse");

export const messageIdParamsSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({
      param: {
        name: "id",
        in: "path",
        description: "Message identifier",
        required: true,
      },
      description: "Message identifier",
      example: "7d19c3e2-5e2a-4c83-8e41-5201f97b7e5e",
    }),
});

// --- Webhook schemas ---

export const webhookEndpointSchema = z
  .object({
    id: z.string().uuid(),
    url: z.string().url(),
    description: z.string().nullable(),
    secretMasked: z.string(),
    events: z.array(z.string()),
    active: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("WebhookEndpoint");

export const webhookCreateBodySchema = z
  .object({
    url: z
      .string()
      .url()
      .refine((u) => u.startsWith("https://"), {
        message: "Webhook URL must use HTTPS.",
      }),
    description: z.string().trim().max(200).optional(),
  })
  .openapi("WebhookCreateBody");

export const webhookToggleBodySchema = z
  .object({
    active: z.boolean(),
  })
  .openapi("WebhookToggleBody");

export const webhookDeliverySchema = z
  .object({
    id: z.string().uuid(),
    event: z.string(),
    messageId: z.string().uuid().nullable(),
    status: z.string(),
    httpStatus: z.number().nullable(),
    responseBody: z.string().nullable(),
    latencyMs: z.number().nullable(),
    attempt: z.number(),
    error: z.string().nullable(),
    createdAt: z.string().datetime(),
  })
  .openapi("WebhookDelivery");

export const webhooksResponseSchema = z
  .object({ data: z.array(webhookEndpointSchema) })
  .openapi("WebhooksResponse");

export const webhookCreatedResponseSchema = z
  .object({
    data: z.object({ endpoint: webhookEndpointSchema, secret: z.string() }),
  })
  .openapi("WebhookCreatedResponse");

export const webhookDeliveriesResponseSchema = z
  .object({ data: z.array(webhookDeliverySchema) })
  .openapi("WebhookDeliveriesResponse");

export const webhookIdParamsSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({
      param: {
        name: "id",
        in: "path",
        description: "Webhook endpoint identifier",
        required: true,
      },
    }),
});

export const webhookDeletedResponseSchema = z
  .object({
    data: z.object({
      id: z.string().uuid(),
    }),
  })
  .openapi("WebhookDeletedResponse");

export const webhookToggledResponseSchema = z
  .object({
    data: z.object({
      id: z.string().uuid(),
      active: z.boolean(),
    }),
  })
  .openapi("WebhookToggledResponse");

export const webhookDeliveriesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .openapi({
      param: {
        name: "limit",
        in: "query",
        description: "Maximum number of deliveries to return (1-100).",
      },
    }),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .openapi({
      param: {
        name: "offset",
        in: "query",
        description: "Number of deliveries to skip.",
      },
    }),
});

// --- Mailbox write schemas ---

const mailboxNameField = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i, {
    message:
      "Mailbox names may contain letters, numbers, dot, dash, underscore.",
  })
  .transform((v) => v.toLowerCase());

export const mailboxCreateBodySchema = z
  .object({ name: mailboxNameField })
  .openapi("MailboxCreateBody");

export const mailboxUpdateBodySchema = z
  .object({ name: mailboxNameField })
  .openapi("MailboxUpdateBody");

export const mailboxIdParamsSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({
      param: {
        name: "id",
        in: "path",
        description: "Mailbox identifier",
        required: true,
      },
    }),
});

export const mailboxResponseSchema = z
  .object({
    data: mailboxSchema,
  })
  .openapi("MailboxResponse");

export const mailboxDeleteResponseSchema = z
  .object({
    data: z.object({
      id: z.string().uuid(),
    }),
  })
  .openapi("MailboxDeleteResponse");

export const messageDeleteResponseSchema = z
  .object({
    data: z.object({
      id: z.string().uuid(),
    }),
  })
  .openapi("MessageDeleteResponse");

// --- API Key schemas ---

export const apiKeyRotateResponseSchema = z
  .object({
    data: z.object({
      key: z.string().openapi({
        description: "New plaintext API key — store securely, shown only once.",
      }),
      apiKey: z.object({
        id: z.string().uuid(),
        name: z.string(),
        keyMasked: z.string(),
        scopes: z.array(z.string()),
        mailboxName: z.string().nullable(),
        expiresAt: z.string().datetime().nullable(),
      }),
    }),
  })
  .openapi("ApiKeyRotateResponse");
