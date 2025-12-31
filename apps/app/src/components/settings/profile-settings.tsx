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

export function ProfileSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: user } = useQuery(trpc.user.me.queryOptions());
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user?.fullName]);

  const updateMutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.user.me.queryKey() });
      },
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage how your account shows up in the app.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="text-sm font-medium">{user?.email ?? "—"}</div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Full name</div>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your name"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          Your name appears on invites and team activity.
        </p>
        <Button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => updateMutation.mutate({ fullName })}
        >
          {updateMutation.isPending ? "Saving…" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
