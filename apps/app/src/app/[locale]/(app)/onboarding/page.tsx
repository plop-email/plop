import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getQueryClient, HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata = {
  title: "Onboarding",
};

export default async function Page() {
  const queryClient = getQueryClient();

  const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());
  if (!user) redirect("/login");

  const membership = await queryClient.fetchQuery(
    trpc.team.membership.queryOptions(),
  );

  if (membership) {
    const team = await queryClient.fetchQuery(trpc.team.current.queryOptions());
    if (!team || team.role !== "owner" || team.onboardingCompletedAt) {
      redirect("/");
    }
  } else {
    const invites = await queryClient.fetchQuery(
      trpc.team.invitesByEmail.queryOptions(),
    );
    if (invites?.length) {
      redirect("/teams");
    }
  }

  prefetch(trpc.user.me.queryOptions());
  prefetch(trpc.team.membership.queryOptions());

  return (
    <HydrateClient>
      <OnboardingFlow />
    </HydrateClient>
  );
}
