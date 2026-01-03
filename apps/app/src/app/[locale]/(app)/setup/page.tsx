"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import {
  clearTrialPlanCookie,
  getTrialPlanCookie,
} from "@/utils/trial-plan-cookie";

export default function SetupPage() {
  const router = useRouter();
  const trpc = useTRPC();

  const { mutate, isPending, isError, error } = useMutation(
    trpc.team.autoSetup.mutationOptions({
      onSuccess: () => {
        clearTrialPlanCookie();
        router.replace("/");
      },
      onError: (err) => {
        // If user has pending invites, redirect to teams page
        if (err.data?.code === "PRECONDITION_FAILED") {
          router.replace("/teams");
          return;
        }
        // For other errors, redirect to onboarding as fallback
        console.error("Auto-setup failed:", err);
        router.replace("/onboarding");
      },
    }),
  );

  useEffect(() => {
    const plan = getTrialPlanCookie();
    mutate({ plan: plan ?? undefined });
  }, [mutate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
        {isPending && (
          <p className="text-muted-foreground">Setting up your workspace...</p>
        )}
        {isError && (
          <p className="text-destructive">
            {error?.message ?? "Something went wrong. Redirecting..."}
          </p>
        )}
      </div>
    </div>
  );
}
