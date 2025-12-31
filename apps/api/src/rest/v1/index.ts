import { OpenAPIHono } from "@hono/zod-openapi";
import type { ApiKeyContext } from "./auth";
import { apiKeyAuth } from "./auth";
import { mailboxesRouter } from "./mailboxes";
import { messagesRouter } from "./messages";

const app = new OpenAPIHono<{ Variables: { apiKey: ApiKeyContext } }>();

app.use("*", apiKeyAuth);

app.route("/mailboxes", mailboxesRouter);
app.route("/messages", messagesRouter);

export { app as v1Router };
