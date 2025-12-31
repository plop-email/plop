import Image from "next/image";
import { redirect } from "next/navigation";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

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

  return (
    <HydrateClient>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center justify-center">
            <Image src="/logo.png" alt="plop" width={120} height={120} />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your team
            </h1>
            <p className="text-sm text-muted-foreground">
              Add a workspace name to get started. Next you’ll pick a plan and
              inbox.
            </p>
          </div>

          <CreateTeamForm />
        </div>
      </div>
    </HydrateClient>
  );
}
