import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { apiKeysRouter } from "./api-keys";
import { billingRouter } from "./billing";
import { inboxRouter } from "./inbox";
import { teamRouter } from "./team";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  apiKeys: apiKeysRouter,
  billing: billingRouter,
  inbox: inboxRouter,
  user: userRouter,
  team: teamRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
