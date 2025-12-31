"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { TeamInviteCard } from "@/components/teams/team-invite-card";

export function TeamInvites() {
  const trpc = useTRPC();
  const { data: invites, isLoading } = useQuery(
    trpc.team.invitesByEmail.queryOptions(),
  );

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading invitations...
      </div>
    );
  }

  if (!invites || invites.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        No pending invitations.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <TeamInviteCard key={invite.id} invite={invite} />
      ))}
    </div>
  );
}
