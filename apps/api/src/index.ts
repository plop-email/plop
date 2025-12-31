import { trpcServer } from "@hono/trpc-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "@plop/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { env } from "./env";
import { v1Router } from "./rest/v1";
import { createTRPCContext } from "./trpc/init";
import { appRouter } from "./trpc/routers/_app";
import { inboxWebhookHandler } from "./webhooks/inbox";
import { polarWebhookHandler } from "./webhooks/polar";

const app = new OpenAPIHono();

app.use(
  "*",
  cors({
    origin: env.ALLOWED_API_ORIGINS?.split(",") ?? [],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type"],
  }),
);

app.post("/webhooks/inbox", inboxWebhookHandler);
app.post("/webhooks/polar", polarWebhookHandler);

app.route("/v1", v1Router);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createTRPCContext,
  }),
);

app.get("/health", (c) => {
  return c.json({ status: "ok" }, 200);
});

app.doc31("/openapi", {
  openapi: "3.1.0",
  info: {
    version: "0.1.0",
    title: "Plop API",
    description:
      "Public API for Plop (plop.email) inbox automation. Use Bearer API keys from Team settings. All endpoints live under /v1.",
  },
  servers: [
    {
      url: "http://localhost:3003",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Mailboxes",
      description:
        "Discover and enumerate mailboxes available to an API key. Useful before filtering message queries.",
    },
    {
      name: "Messages",
      description:
        "Read inbox messages with filters and retrieve the latest message for test automation.",
    },
  ],
  security: [{ token: [] }],
});

app.openAPIRegistry.registerComponent("securitySchemes", "token", {
  type: "http",
  scheme: "bearer",
  description: "API key authentication",
  bearerFormat: "API Key",
});

app.get(
  "/",
  Scalar({ url: "/openapi", pageTitle: "Plop API", theme: "saturn" }),
);

logger.info(`API listening on http://localhost:${env.PORT}`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
