import { users } from "@plop/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    return user;
  }),
  update: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1).optional(),
        avatarUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .update(users)
        .set({
          ...(input.fullName !== undefined && { fullName: input.fullName }),
          ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return user;
    }),
});
