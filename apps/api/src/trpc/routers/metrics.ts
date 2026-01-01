import { tz } from "@date-fns/tz";
import { getInboxMetricsOverview } from "@plop/db/queries";
import { TRPCError } from "@trpc/server";
import {
  differenceInCalendarDays,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import { z } from "zod";
import { createTRPCRouter, teamProcedure } from "../init";

const metricsOverviewSchema = z
  .object({
    start: z.date().optional(),
    end: z.date().optional(),
    mailboxId: z.string().uuid().optional(),
  })
  .optional();

const utc = tz("UTC");

function formatDate(value: Date) {
  return format(value, "yyyy-MM-dd", { in: utc });
}

export const metricsRouter = createTRPCRouter({
  overview: teamProcedure
    .input(metricsOverviewSchema)
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const end = input?.end
        ? endOfDay(input.end, { in: utc })
        : endOfDay(now, { in: utc });
      const start = input?.start
        ? startOfDay(input.start, { in: utc })
        : startOfDay(subDays(end, 29, { in: utc }), { in: utc });

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid date range.",
        });
      }

      if (start > end) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date must be before end date.",
        });
      }

      const overview = await getInboxMetricsOverview(ctx.db, {
        teamId: ctx.teamId,
        mailboxId: input?.mailboxId,
        start,
        end,
      });

      return {
        range: {
          start: formatDate(start),
          end: formatDate(end),
          days: Math.max(
            differenceInCalendarDays(end, start, { in: utc }) + 1,
            1,
          ),
        },
        totals: overview.totals,
        volumeByDay: overview.volumeByDay,
        volumeByHour: overview.volumeByHour,
        mailboxes: overview.mailboxes,
        tags: overview.tags,
        topSenders: overview.topSenders,
      };
    }),
});
