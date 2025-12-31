"use client";

import {
  DEFAULT_PLAN_TIER,
  PLAN_CATALOG,
  formatUsd,
  getPriceForCycle,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@plop/ui/dialog";
import { Input } from "@plop/ui/input";
import { Label } from "@plop/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  clearTrialPlanCookie,
  getTrialPlanCookie,
} from "@/utils/trial-plan-cookie";

const mailboxPattern = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

type OnboardingStep = "plan" | "starter" | "name" | "mailbox";

export function OnboardingModal() {
  const trpc = useTRPC();
  const { data: team } = useQuery(trpc.team.current.queryOptions());

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<OnboardingStep>("name");
  const [teamName, setTeamName] = useState("");
  const [mailboxName, setMailboxName] = useState("");
  const [debouncedMailbox, setDebouncedMailbox] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">("pro");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [starterMailbox, setStarterMailbox] = useState<{
    name: string;
    domain: string;
  } | null>(null);

  const plan = team?.plan ?? DEFAULT_PLAN_TIER;
  const isTrialing = team?.subscriptionStatus === "trialing";
  const isOwner = team?.role === "owner";
  const hasCompleted = Boolean(team?.onboardingCompletedAt);
  const shouldShow = Boolean(team && isOwner && !hasCompleted);
  const normalizedTeamName = team?.name?.trim() ?? "";
  const needsName =
    normalizedTeamName.length === 0 ||
    normalizedTeamName.toLowerCase() === "my team";
  const fallbackPlan: "starter" | "pro" =
    DEFAULT_PLAN_TIER === "starter" ? "starter" : "pro";

  const ensureStarterMailboxMutation = useMutation(
    trpc.inbox.mailboxes.ensureStarterMailbox.mutationOptions({
      onSuccess: (mailbox) => {
        if (!mailbox) return;
        setStarterMailbox({
          name: mailbox.name,
          domain: mailbox.domain,
        });
      },
    }),
  );

  const updateTeamMutation = useMutation(
    trpc.team.update.mutationOptions({
      onSuccess: () => {
        setStep("mailbox");
      },
    }),
  );

  const selectTrialPlanMutation = useMutation(
    trpc.billing.selectTrialPlan.mutationOptions({
      onSuccess: (data) => {
        clearTrialPlanCookie();
        setStep(
          data.plan === "starter" ? "starter" : needsName ? "name" : "mailbox",
        );
      },
    }),
  );

  const createMailboxMutation = useMutation(
    trpc.inbox.mailboxes.create.mutationOptions({
      onSuccess: () => {
        completeOnboardingMutation.mutate();
      },
    }),
  );

  const completeOnboardingMutation = useMutation(
    trpc.billing.completeOnboarding.mutationOptions({
      onSuccess: () => {
        setOpen(false);
      },
    }),
  );

  useEffect(() => {
    if (!shouldShow) {
      setOpen(false);
      setHasInitialized(false);
      return;
    }

    if (!open) {
      setOpen(true);
    }

    if (!hasInitialized) {
      const cookiePlan = getTrialPlanCookie();
      if (cookiePlan) {
        setSelectedPlan(cookiePlan);
      } else if (plan === "starter" || plan === "pro") {
        setSelectedPlan(plan);
      } else {
        setSelectedPlan(fallbackPlan);
      }

      setStep(
        isTrialing
          ? "plan"
          : plan === "starter"
            ? "starter"
            : needsName
              ? "name"
              : "mailbox",
      );
      setHasInitialized(true);
    }
  }, [hasInitialized, isTrialing, needsName, open, plan, shouldShow]);

  useEffect(() => {
    if (!open) return;
    setTeamName(team?.name ?? "");
  }, [open, team?.name]);

  useEffect(() => {
    if (!open || step !== "starter") return;
    if (starterMailbox || ensureStarterMailboxMutation.isPending) return;
    ensureStarterMailboxMutation.mutate();
  }, [ensureStarterMailboxMutation, open, starterMailbox, step]);

  useEffect(() => {
    if (!open || step !== "mailbox") return;
    const timer = setTimeout(() => {
      setDebouncedMailbox(mailboxName.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [mailboxName, open, step]);

  const normalizedMailbox = mailboxName.trim().toLowerCase();
  const isMailboxValid =
    normalizedMailbox.length > 0 && mailboxPattern.test(normalizedMailbox);

  const { data: availability, isFetching: isChecking } = useQuery({
    ...trpc.inbox.mailboxes.checkAvailability.queryOptions({
      name: debouncedMailbox,
    }),
    enabled:
      step === "mailbox" && debouncedMailbox.length > 0 && isMailboxValid,
  });

  const availabilityMessage = useMemo(() => {
    if (step !== "mailbox" || !isMailboxValid) return null;
    if (isChecking) {
      return { tone: "muted", text: "Checking availability..." } as const;
    }
    if (availability?.available === true) {
      return { tone: "success", text: "Mailbox name is available." } as const;
    }
    if (availability?.available === false) {
      switch (availability.reason) {
        case "reserved":
          return {
            tone: "destructive",
            text: "That mailbox name is reserved.",
          } as const;
        case "taken":
          return {
            tone: "destructive",
            text: "That mailbox is already taken.",
          } as const;
        case "owned":
          return {
            tone: "destructive",
            text: "You already have a mailbox with this name.",
          } as const;
        case "limit_reached":
          return {
            tone: "destructive",
            text: "Your current plan mailbox limit is reached.",
          } as const;
        default:
          return { tone: "destructive", text: "Choose another name." } as const;
      }
    }
    return null;
  }, [availability, isChecking, isMailboxValid, step]);

  const availabilityToneClass =
    availabilityMessage?.tone === "success"
      ? "text-emerald-500"
      : availabilityMessage?.tone === "muted"
        ? "text-muted-foreground"
        : "text-destructive";

  const starterAddress = starterMailbox
    ? `${starterMailbox.name}@${starterMailbox.domain}`
    : null;

  const handleStarterComplete = () => {
    if (completeOnboardingMutation.isPending) return;
    completeOnboardingMutation.mutate();
  };

  const handlePlanContinue = () => {
    if (selectTrialPlanMutation.isPending) return;
    selectTrialPlanMutation.mutate({ plan: selectedPlan });
  };

  const handleNameContinue = () => {
    if (!teamName.trim()) return;
    if (teamName.trim() === team?.name?.trim()) {
      setStep("mailbox");
      return;
    }
    updateTeamMutation.mutate({ name: teamName.trim() });
  };

  const handleMailboxCreate = () => {
    if (!isMailboxValid || createMailboxMutation.isPending) return;
    if (availability?.available === false) return;
    createMailboxMutation.mutate({ name: normalizedMailbox });
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {step === "plan" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose your trial plan</DialogTitle>
              <DialogDescription>
                Start a {TRIAL_DAYS}-day trial with no credit card required.
                Pick the plan you want to try.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {(["starter", "pro"] as const).map((tier) => {
                  const planDef = PLAN_CATALOG[tier];
                  const isSelected = selectedPlan === tier;
                  return (
                    <Card
                      key={tier}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? "border-foreground"
                          : "border-border hover:border-foreground/50"
                      }`}
                      onClick={() => setSelectedPlan(tier)}
                    >
                      <CardHeader className="space-y-1">
                        <CardTitle className="text-base">
                          {planDef.name}
                        </CardTitle>
                        <CardDescription>
                          {planDef.shortDescription}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm font-semibold">
                          {formatUsd(getPriceForCycle(planDef.tier, "monthly"))}
                          <span className="text-xs text-muted-foreground">
                            /mo after trial
                          </span>
                        </div>
                        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                          {planDef.highlights.slice(0, 3).map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handlePlanContinue}
                disabled={selectTrialPlanMutation.isPending}
              >
                {selectTrialPlanMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "starter" && (
          <>
            <DialogHeader>
              <DialogTitle>Your Starter inbox is ready</DialogTitle>
              <DialogDescription>
                Here’s your default email address and the fastest way to start
                routing tags.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border border-border bg-muted/40 p-4">
                <div className="text-xs uppercase text-muted-foreground">
                  Your inbox address
                </div>
                <div className="mt-2 font-mono text-sm">
                  {starterAddress ?? "Creating mailbox..."}
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Add tags with a plus sign to route scenarios. Example:
                  <span className="ml-1 font-mono text-foreground">
                    {starterMailbox
                      ? `${starterMailbox.name}+signup@${starterMailbox.domain}`
                      : "qa+signup@in.plop.email"}
                  </span>
                </p>
                <p>
                  Starter includes one mailbox, unlimited tags, and up to 5,000
                  emails per month.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleStarterComplete}
                disabled={completeOnboardingMutation.isPending}
              >
                {completeOnboardingMutation.isPending
                  ? "Finishing..."
                  : "Got it"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "name" && (
          <>
            <DialogHeader>
              <DialogTitle>Name your team</DialogTitle>
              <DialogDescription>
                This name appears on your workspace and billing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team name</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="Acme QA"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleNameContinue}
                disabled={updateTeamMutation.isPending || !teamName.trim()}
              >
                {updateTeamMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "mailbox" && (
          <>
            <DialogHeader>
              <DialogTitle>Create your first mailbox</DialogTitle>
              <DialogDescription>
                Pro gives you unlimited mailboxes. Pick a name for this one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mailbox-name">Mailbox name</Label>
                <Input
                  id="mailbox-name"
                  value={mailboxName}
                  onChange={(event) => setMailboxName(event.target.value)}
                  placeholder="signup"
                />
                {!isMailboxValid && mailboxName.trim().length > 0 && (
                  <p className="text-xs text-destructive">
                    Use 1-64 characters with letters, numbers, dots, dashes, or
                    underscores.
                  </p>
                )}
                {availabilityMessage && (
                  <p className={`text-xs ${availabilityToneClass}`}>
                    {availabilityMessage.text}
                  </p>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Unlimited tags are included on every mailbox.
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleMailboxCreate}
                disabled={
                  !isMailboxValid ||
                  createMailboxMutation.isPending ||
                  availability?.available === false
                }
              >
                {createMailboxMutation.isPending ? "Creating..." : "Finish"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
