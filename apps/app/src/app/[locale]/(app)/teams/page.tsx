import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@plop/ui/button";
import { TeamInvites } from "@/components/teams/team-invites";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export const metadata = {
  title: "Invitations",
};

export default async function Page() {
  const queryClient = getQueryClient();

  const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());
  if (!user) redirect("/login");

  const membership = await queryClient.fetchQuery(
    trpc.team.membership.queryOptions(),
  );
  if (membership) redirect("/");

  const invites = await queryClient.fetchQuery(
    trpc.team.invitesByEmail.queryOptions(),
  );
  if (!invites?.length) redirect("/onboarding");

  const firstName = user.fullName?.split(" ").at(0) ?? "there";

  return (
    <HydrateClient>
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Image src="/logo.png" alt="plop" width={96} height={96} />
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome, {firstName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Choose a team invitation to continue.
              </p>
            </div>
          </div>

          <TeamInvites />

          <div className="border-t border-dashed border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Want to create your own workspace instead?
            </p>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link href="/onboarding">Create a team</Link>
            </Button>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
