import { randomBytes } from "node:crypto";
import { getPlanEntitlements } from "@plop/billing";
import {
  createWebhookEndpointWithSecret,
  deleteWebhookEndpointById,
  getWebhookEndpointById,
  listWebhookDeliveries,
  listWebhookEndpointsByTeam,
  toggleWebhookEndpoint,
} from "@plop/db/queries";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, teamProcedure } from "../init";
import {
  assertTrialNotExpired,
  getTeamPlan,
  requireOwner,
  type TeamCtx,
} from "./helpers";

async function assertWebhooksEntitlement(ctx: TeamCtx): Promise<void> {
  const plan = await getTeamPlan(ctx);
  const entitlements = getPlanEntitlements(plan);

  if (!entitlements.webhooks) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Webhooks are not available on your plan. Upgrade to enable.",
    });
  }
}

function maskSecret(secret: string): string {
  return `whsec_${"*".repeat(8)}...${secret.slice(-4)}`;
}

const urlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), {
    message: "Webhook URL must use HTTPS.",
  });

export const webhooksRouter = createTRPCRouter({
  list: teamProcedure.query(async ({ ctx }) => {
    return listWebhookEndpointsByTeam(ctx.db, ctx.teamId);
  }),

  create: teamProcedure
    .input(
      z.object({
        url: urlSchema,
        description: z.string().trim().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);
      await assertTrialNotExpired(ctx);
      await assertWebhooksEntitlement(ctx);

      const secret = randomBytes(32).toString("hex");
      const secretMasked = maskSecret(secret);

      const endpoint = await createWebhookEndpointWithSecret(ctx.db, {
        teamId: ctx.teamId,
        url: input.url,
        description: input.description ?? null,
        secretMasked,
        secret,
      });

      return {
        endpoint,
        secret: `whsec_${secret}`,
      };
    }),

  delete: teamProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      const deleted = await deleteWebhookEndpointById(ctx.db, {
        id: input.id,
        teamId: ctx.teamId,
      });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deleted;
    }),

  toggle: teamProcedure
    .input(z.object({ id: z.string().uuid(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      const updated = await toggleWebhookEndpoint(ctx.db, {
        id: input.id,
        teamId: ctx.teamId,
        active: input.active,
      });

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  deliveries: createTRPCRouter({
    list: teamProcedure
      .input(
        z.object({
          endpointId: z.string().uuid(),
          limit: z.number().int().min(1).max(100).optional(),
          offset: z.number().int().min(0).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const endpoint = await getWebhookEndpointById(ctx.db, {
          id: input.endpointId,
          teamId: ctx.teamId,
        });

        if (!endpoint) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return listWebhookDeliveries(ctx.db, {
          endpointId: input.endpointId,
          limit: input.limit,
          offset: input.offset,
        });
      }),
  }),

  test: teamProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.teamRole);

      const endpoint = await getWebhookEndpointById(ctx.db, {
        id: input.id,
        teamId: ctx.teamId,
      });

      if (!endpoint) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const { tasks } = await import("@trigger.dev/sdk");

      await tasks.trigger("deliver-webhook", {
        webhookEndpointId: input.id,
        messageId: "00000000-0000-0000-0000-000000000000",
        teamId: ctx.teamId,
      });

      return { triggered: true };
    }),
});
