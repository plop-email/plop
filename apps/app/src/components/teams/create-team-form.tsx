"use client";

import { Button } from "@plop/ui/button";
import { Input } from "@plop/ui/input";
import { Label } from "@plop/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  getTrialPlanCookie,
  type TrialPlanCookie,
} from "@/utils/trial-plan-cookie";

export function CreateTeamForm() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [trialPlan, setTrialPlan] = useState<TrialPlanCookie | null>(null);

  useEffect(() => {
    setTrialPlan(getTrialPlanCookie());
  }, []);

  const createTeamMutation = useMutation(
    trpc.team.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.replace("/");
        router.refresh();
      },
      onError: (err) => {
        setError(err.message || "Failed to create team.");
      },
    }),
  );

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length >= 2 && !createTeamMutation.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    createTeamMutation.mutate({
      name: trimmedName,
      ...(trialPlan ? { plan: trialPlan } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="team-name">Team name</Label>
        <Input
          id="team-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme QA"
          autoComplete="organization"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          You can change this later in settings.
        </p>
      </div>

      {trialPlan && (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Trial plan selected:{" "}
          <span className="font-medium text-foreground">
            {trialPlan === "starter" ? "Starter" : "Pro"}
          </span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {createTeamMutation.isPending ? "Creating..." : "Create team"}
      </Button>
    </form>
  );
}
