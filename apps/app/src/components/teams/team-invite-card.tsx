"use client";

import type { RouterOutputs } from "@plop/api/trpc/routers/_app";
import { Button } from "@plop/ui/button";
import { Card } from "@plop/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";

type Invite = RouterOutputs["team"]["invitesByEmail"][number];

type TeamInviteCardProps = {
  invite: Invite;
};

export function TeamInviteCard({ invite }: TeamInviteCardProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation(
    trpc.team.acceptInvite.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
        router.replace(invite.role === "owner" ? "/onboarding" : "/");
        router.refresh();
      },
    }),
  );

  const declineMutation = useMutation(
    trpc.team.declineInvite.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.team.invitesByEmail.queryKey(),
        });
      },
    }),
  );

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-semibold text-foreground">
          {invite.teamName}
        </div>
        <div className="text-xs text-muted-foreground">Role: {invite.role}</div>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={acceptMutation.isPending}
          onClick={() => acceptMutation.mutate({ inviteId: invite.id })}
        >
          {acceptMutation.isPending ? "Accepting..." : "Accept"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          disabled={declineMutation.isPending}
          onClick={() => declineMutation.mutate({ inviteId: invite.id })}
        >
          {declineMutation.isPending ? "Declining..." : "Decline"}
        </Button>
      </div>
    </Card>
  );
}
