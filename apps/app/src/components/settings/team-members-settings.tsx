"use client";

import { Button } from "@plop/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plop/ui/card";
import { Input } from "@plop/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plop/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTeamMembership } from "@/hooks/use-team-membership";

export function TeamMembersSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { isOwner } = useTeamMembership();

  const { data: me } = useCurrentUser();
  const { data: members } = useQuery(trpc.team.members.queryOptions());

  const { data: invites } = useQuery({
    ...trpc.team.invites.queryOptions(),
    enabled: isOwner,
  });

  const [email, setEmail] = useState("");

  const inviteMutation = useMutation(
    trpc.team.invite.mutationOptions({
      onSuccess: () => {
        setEmail("");
        queryClient.invalidateQueries({
          queryKey: trpc.team.invites.queryKey(),
        });
      },
    }),
  );

  const deleteInviteMutation = useMutation(
    trpc.team.deleteInvite.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.team.invites.queryKey(),
        });
      },
    }),
  );

  const removeMemberMutation = useMutation(
    trpc.team.removeMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.team.members.queryKey(),
        });
      },
    }),
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Everyone who has access to this team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => {
                const isMe = member.user.id === me?.id;
                const isRemoving =
                  removeMemberMutation.isPending &&
                  removeMemberMutation.variables?.userId === member.user.id;

                return (
                  <TableRow key={member.id}>
                    <TableCell className="min-w-[220px]">
                      <div className="truncate text-sm font-medium">
                        {member.user.fullName ?? member.user.email}
                        {isMe ? " (you)" : ""}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {member.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="border px-2 py-1 text-xs text-muted-foreground">
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      Active
                    </TableCell>
                    <TableCell className="text-right">
                      {isOwner && !isMe ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isRemoving}
                          onClick={() =>
                            removeMemberMutation.mutate({
                              userId: member.user.id,
                            })
                          }
                        >
                          {isRemoving ? "Removing…" : "Remove"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {members?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Invite new members by email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOwner && (
            <div className="border border-dashed p-4 text-sm text-muted-foreground">
              Only team owners can invite members.
            </div>
          )}

          {isOwner && (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  inputMode="email"
                />
                <Button
                  type="button"
                  disabled={
                    inviteMutation.isPending || email.trim().length === 0
                  }
                  onClick={() => inviteMutation.mutate({ email: email.trim() })}
                >
                  {inviteMutation.isPending ? "Inviting…" : "Invite"}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites?.map((invite) => {
                    const isDeleting =
                      deleteInviteMutation.isPending &&
                      deleteInviteMutation.variables?.inviteId === invite.id;

                    return (
                      <TableRow key={invite.id}>
                        <TableCell className="min-w-[220px] text-sm font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Pending
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() =>
                              deleteInviteMutation.mutate({
                                inviteId: invite.id,
                              })
                            }
                          >
                            {isDeleting ? "Revoking…" : "Revoke"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {invites?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No pending invites.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
