import { z } from "zod";

export const deliverWebhookSchema = z.object({
  webhookEndpointId: z.string().uuid(),
  messageId: z.string().uuid().nullish(),
  teamId: z.string().uuid(),
});

export type DeliverWebhookPayload = z.infer<typeof deliverWebhookSchema>;
