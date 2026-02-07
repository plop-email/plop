import { OpenAPIHono } from "@hono/zod-openapi";
import { apiKeysRouter } from "./api-keys";
import type { ApiKeyContext } from "./auth";
import { apiKeyAuth } from "./auth";
import { mailboxesRouter } from "./mailboxes";
import { messagesRouter } from "./messages";
import { rateLimitMiddleware } from "./ratelimit";
import { streamRouter } from "./stream";
import { webhooksRouter } from "./webhooks";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

app.use("*", apiKeyAuth);
app.use("*", rateLimitMiddleware);

app.route("/api-keys", apiKeysRouter);
app.route("/mailboxes", mailboxesRouter);
app.route("/messages", streamRouter);
app.route("/messages", messagesRouter);
app.route("/webhooks", webhooksRouter);

export { app as v1Router };
