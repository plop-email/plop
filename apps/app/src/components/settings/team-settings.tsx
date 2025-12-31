"use client";

import { Button } from "@plop/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@plop/ui/card";
import { Input } from "@plop/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";

export function TeamSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: team } = useQuery(trpc.team.current.queryOptions());
  const [name, setName] = useState("");

  useEffect(() => {
    setName(team?.name ?? "");
  }, [team?.name]);

  const updateMutation = useMutation(
    trpc.team.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.team.current.queryKey(),
        });
      },
    }),
  );

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>No team found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isOwner = team.role === "owner";
  const canSave =
    isOwner && name.trim().length > 0 && !updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          Manage your team’s name and workspace details.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Team name</div>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My Team"
              disabled={!isOwner}
            />
            {!isOwner && (
              <div className="text-xs text-muted-foreground">
                Only team owners can update settings.
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          Updates are visible to all members.
        </p>
        <Button
          type="button"
          disabled={!canSave}
          onClick={() => updateMutation.mutate({ name: name.trim() })}
        >
          {updateMutation.isPending ? "Saving…" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
