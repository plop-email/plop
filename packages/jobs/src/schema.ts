import { z } from "zod";

export const deliverWebhookSchema = z.object({
  webhookEndpointId: z.string().uuid(),
  messageId: z.string().uuid(),
  teamId: z.string().uuid(),
});

export type DeliverWebhookPayload = z.infer<typeof deliverWebhookSchema>;
