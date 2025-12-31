import { redirect } from "next/navigation";
import { getQueryClient, trpc } from "@/trpc/server";

export const metadata = {
  title: "Create Team",
};

export default async function Page() {
  const queryClient = getQueryClient();

  const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());
  if (!user) redirect("/login");

  const membership = await queryClient.fetchQuery(
    trpc.team.membership.queryOptions(),
  );
  if (membership) redirect("/");

  redirect("/onboarding");
}
