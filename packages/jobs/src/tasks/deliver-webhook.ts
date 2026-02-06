import { createHmac } from "node:crypto";
import { getDb } from "@jobs/init";
import {
  createWebhookDelivery,
  getMessageSummaryById,
  getWebhookEndpointSummaryById,
  getWebhookSecretByEndpointId,
  updateWebhookDelivery,
} from "@plop/db/queries";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { deliverWebhookSchema } from "../schema.js";

function signPayload(secret: string, timestamp: number, body: string): string {
  const data = `${timestamp}.${body}`;
  return createHmac("sha256", secret).update(data).digest("hex");
}

export const deliverWebhookTask = schemaTask({
  id: "deliver-webhook",
  schema: deliverWebhookSchema,
  run: async ({ webhookEndpointId, messageId }, { ctx }) => {
    const attemptNumber = ctx.attempt?.number ?? 1;
    const db = getDb();

    const endpoint = await getWebhookEndpointSummaryById(db, webhookEndpointId);

    if (!endpoint || !endpoint.active) {
      logger.warn("Webhook endpoint not found or inactive", {
        webhookEndpointId,
      });
      return { skipped: true };
    }

    const secret = await getWebhookSecretByEndpointId(db, webhookEndpointId);
    if (!secret) {
      logger.error("Webhook secret not found", { webhookEndpointId });
      return { skipped: true };
    }

    const message = await getMessageSummaryById(db, messageId);
    if (!message) {
      logger.error("Message not found", { messageId });
      return { skipped: true };
    }

    const webhookBody = {
      event: "email.received",
      timestamp: new Date().toISOString(),
      data: {
        id: message.id,
        mailbox: message.mailbox,
        mailboxWithTag: message.mailboxWithTag,
        tag: message.tag,
        from: message.fromAddress,
        to: message.toAddress,
        subject: message.subject,
        receivedAt: message.receivedAt.toISOString(),
        domain: message.domain,
      },
    };

    const bodyJson = JSON.stringify(webhookBody);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signPayload(secret, timestamp, bodyJson);
    const signatureHeader = `t=${timestamp},v1=${signature}`;

    const delivery = await createWebhookDelivery(db, {
      webhookEndpointId,
      event: "email.received",
      messageId,
      status: "pending",
      attempt: attemptNumber,
    });

    if (!delivery) {
      logger.error("Failed to create delivery record");
      throw new Error("Failed to create delivery record");
    }

    const startTime = Date.now();

    let response: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Plop-Signature": signatureHeader,
          "User-Agent": "Plop-Webhook/1.0",
        },
        body: bodyJson,
        signal: controller.signal,
      });

      clearTimeout(timeout);
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await updateWebhookDelivery(db, {
        id: delivery.id,
        status: "failed",
        latencyMs,
        attempt: attemptNumber,
        error: errorMessage,
      });

      logger.error("Webhook delivery failed", {
        webhookEndpointId,
        messageId,
        error: errorMessage,
        latencyMs,
      });

      throw error;
    }

    const latencyMs = Date.now() - startTime;
    const responseText = await response.text().catch(() => "");
    const truncatedResponse = responseText.slice(0, 1024);
    const isSuccess = response.status >= 200 && response.status < 300;

    await updateWebhookDelivery(db, {
      id: delivery.id,
      status: isSuccess ? "success" : "failed",
      httpStatus: response.status,
      responseBody: truncatedResponse,
      latencyMs,
      attempt: attemptNumber,
      error: isSuccess ? null : `HTTP ${response.status}`,
    });

    if (!isSuccess) {
      logger.error("Webhook delivery failed", {
        webhookEndpointId,
        messageId,
        httpStatus: response.status,
        latencyMs,
      });
      throw new Error(`Webhook delivery failed with HTTP ${response.status}`);
    }

    logger.info("Webhook delivered", {
      webhookEndpointId,
      messageId,
      httpStatus: response.status,
      latencyMs,
    });

    return { success: true, httpStatus: response.status, latencyMs };
  },
});
