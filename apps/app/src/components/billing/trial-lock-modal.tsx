"use client";

import {
  formatUsd,
  getAvailablePlans,
  getPriceForCycle,
  isTrialExpired,
  type PlanTier,
  TRIAL_DAYS,
} from "@plop/billing";
import { Button } from "@plop/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plop/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@plop/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@plop/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";

const availablePlans = getAvailablePlans();

const HIDDEN_PATHS = ["/settings", "/support"];

export function TrialLockModal() {
  const trpc = useTRPC();
  const pathname = usePathname();
  const { data: team } = useQuery(trpc.team.current.queryOptions());
  const { data: starterEligibility } = useQuery(
    trpc.billing.canChooseStarterPlan.queryOptions(),
  );

  const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("team");

  const checkoutMutation = useMutation(
    trpc.billing.createCheckout.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
    }),
  );

  const isTrialing = team?.subscriptionStatus === "trialing";
  const trialExpired = isTrialing && isTrialExpired(team?.createdAt);
  const shouldHide = HIDDEN_PATHS.some((path) => pathname.includes(path));

  const canChooseStarter = starterEligibility?.allowed ?? true;
  const starterBlockers = useMemo(() => {
    if (!starterEligibility || starterEligibility.allowed) return [];
    return starterEligibility.reasons;
  }, [starterEligibility]);

  const handleContinue = () => {
    if (checkoutMutation.isPending) return;
    if (selectedPlan === "starter" && !canChooseStarter) return;
    checkoutMutation.mutate({ plan: selectedPlan, cycle });
  };

  if (!trialExpired || shouldHide) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-[800px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Your trial has ended</DialogTitle>
          <DialogDescription>
            Your {TRIAL_DAYS}-day trial is over. Select a plan to continue using
            Plop.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Tabs
              value={cycle}
              onValueChange={(value) => setCycle(value as typeof cycle)}
            >
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {availablePlans.map((planDef) => {
              const isSelected = selectedPlan === planDef.tier;
              const isDisabled =
                planDef.tier === "starter" && !canChooseStarter;
              return (
                <Card
                  key={planDef.tier}
                  className={`relative cursor-pointer transition ${
                    isSelected
                      ? "border-foreground"
                      : "border-border hover:border-foreground/50"
                  } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (!isDisabled) setSelectedPlan(planDef.tier);
                  }}
                >
                  {planDef.badge && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <span className="bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                        {planDef.badge}
                      </span>
                    </div>
                  )}
                  <CardHeader className="space-y-1 pb-2">
                    <CardTitle className="text-base">{planDef.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {planDef.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-semibold">
                      {formatUsd(getPriceForCycle(planDef.tier, cycle))}
                      <span className="text-xs text-muted-foreground">
                        {cycle === "monthly" ? "/mo" : "/yr"}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                      {planDef.highlights.slice(0, 3).map((highlight) => (
                        <li key={highlight}>• {highlight}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {starterBlockers.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Starter requires a single mailbox and no custom domain. Remove
              extra mailboxes or custom domains to downgrade.
            </p>
          )}

          <Button
            type="button"
            onClick={handleContinue}
            disabled={
              checkoutMutation.isPending ||
              (selectedPlan === "starter" && !canChooseStarter)
            }
            className="w-full"
          >
            {checkoutMutation.isPending ? "Redirecting..." : "Choose plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
