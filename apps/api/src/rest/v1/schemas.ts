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
