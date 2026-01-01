"use client";

import {
  DEFAULT_PLAN_TIER,
  PLAN_CATALOG,
  TRIAL_DAYS,
  formatUsd,
  getPriceForCycle,
} from "@plop/billing";
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
import { Label } from "@plop/ui/label";
import { cn } from "@plop/ui/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import type { onboardingSteps } from "@/hooks/use-onboarding-params";
import {
  onboardingPlanOptions,
  useOnboardingParams,
} from "@/hooks/use-onboarding-params";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTeamMembership } from "@/hooks/use-team-membership";
import {
  clearTrialPlanCookie,
  getTrialPlanCookie,
} from "@/utils/trial-plan-cookie";

const mailboxPattern = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

type TrialPlan = (typeof onboardingPlanOptions)[number];

type OnboardingStep = (typeof onboardingSteps)[number];

const isOnboardingPlan = (
  value: string | null | undefined,
): value is TrialPlan => value === "starter" || value === "pro";

const stepIndexMap: Record<OnboardingStep, number> = {
  profile: 1,
  team: 2,
  plan: 3,
  starter: 4,
  mailbox: 4,
  invite: 5,
};

const totalSteps = 5;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export function OnboardingFlow() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { params, setParams } = useOnboardingParams();

  const { data: user } = useCurrentUser();
  const { membership, team, isOwner } = useTeamMembership();

  const [fullName, setFullName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [mailboxName, setMailboxName] = useState("");
  const [debouncedMailbox, setDebouncedMailbox] = useState("");
  const [starterMailbox, setStarterMailbox] = useState<{
    name: string;
    domain: string;
  } | null>(null);
  const [starterMailboxAttempted, setStarterMailboxAttempted] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalizedFullName = user?.fullName?.trim() ?? "";
  const needsFullName = normalizedFullName.length === 0;
  const normalizedTeamName = team?.name?.trim() ?? "";
  const needsTeamName =
    !team ||
    normalizedTeamName.length === 0 ||
    normalizedTeamName.toLowerCase() === "my team";
  const hasCompleted = Boolean(team?.onboardingCompletedAt);
  const hasAdvancedPastPlan = Boolean(
    params.step && stepIndexMap[params.step] > stepIndexMap.plan,
  );
  const cookiePlan = getTrialPlanCookie();
  const selectedPlan: TrialPlan =
    params.plan ??
    cookiePlan ??
    (isOnboardingPlan(team?.plan)
      ? team.plan
      : DEFAULT_PLAN_TIER === "starter"
        ? "starter"
        : "pro");
  const onboardingPlan: TrialPlan = hasAdvancedPastPlan
    ? selectedPlan
    : isOnboardingPlan(team?.plan)
      ? team.plan
      : selectedPlan;
  const shouldSelectPlan =
    !hasAdvancedPastPlan &&
    (!team?.subscriptionStatus || team.subscriptionStatus === "trialing");
  const nextPostTeamStep: OnboardingStep = shouldSelectPlan
    ? "plan"
    : onboardingPlan === "starter"
      ? "starter"
      : "mailbox";

  const requiredStep = useMemo<OnboardingStep | null>(() => {
    if (!user) return null;
    if (membership && !team) return null;

    if (needsFullName) return "profile";
    if (!team || needsTeamName) return "team";
    if (shouldSelectPlan) return "plan";
    if (onboardingPlan === "starter") return "starter";
    return "mailbox";
  }, [
    membership,
    needsFullName,
    needsTeamName,
    onboardingPlan,
    shouldSelectPlan,
    team,
    user,
  ]);

  const isParamStepAllowed = useMemo(() => {
    if (!params.step || !requiredStep) return false;
    if (stepIndexMap[params.step] > stepIndexMap[requiredStep]) return false;
    if (params.step === "starter" && onboardingPlan !== "starter") return false;
    if (params.step === "mailbox" && onboardingPlan === "starter") return false;
    return true;
  }, [onboardingPlan, params.step, requiredStep]);

  const resolvedStep = isParamStepAllowed ? params.step : requiredStep;

  useEffect(() => {
    if (!user) return;
    if (membership && !team) return;

    if (membership && team) {
      if (!isOwner || hasCompleted) {
        router.replace("/");
        return;
      }
    }

    if (requiredStep && (!params.step || !isParamStepAllowed)) {
      setParams({ step: requiredStep });
    }
  }, [
    hasCompleted,
    isOwner,
    membership,
    isParamStepAllowed,
    params.step,
    requiredStep,
    router,
    setParams,
    team,
    user,
  ]);

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user?.fullName]);

  useEffect(() => {
    setError(null);
  }, [resolvedStep]);

  useEffect(() => {
    if (team?.name) setTeamName(team.name);
  }, [team?.name]);

  useEffect(() => {
    if (params.plan) return;
    const cookiePlan = getTrialPlanCookie();
    if (cookiePlan) {
      setParams({ plan: cookiePlan });
      return;
    }
    if (isOnboardingPlan(team?.plan)) {
      setParams({ plan: team.plan });
      return;
    }
    setParams({
      plan: DEFAULT_PLAN_TIER === "starter" ? "starter" : "pro",
    });
  }, [params.plan, setParams, team?.plan]);

  const updateUserMutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.user.me.queryKey() });
        if (!team || needsTeamName) {
          setParams({ step: "team" });
        } else {
          setParams({ step: nextPostTeamStep });
        }
      },
      onError: (err) => setError(err.message || "Failed to update profile."),
    }),
  );

  const createTeamMutation = useMutation(
    trpc.team.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        setParams({ step: nextPostTeamStep });
      },
      onError: (err) => setError(err.message || "Failed to create team."),
    }),
  );

  const updateTeamMutation = useMutation(
    trpc.team.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.team.current.queryKey(),
        });
        setParams({ step: nextPostTeamStep });
      },
      onError: (err) => setError(err.message || "Failed to update team."),
    }),
  );

  const selectTrialPlanMutation = useMutation(
    trpc.billing.selectTrialPlan.mutationOptions({
      onSuccess: async (data) => {
        clearTrialPlanCookie();
        await queryClient.invalidateQueries({
          queryKey: trpc.team.current.queryKey(),
        });
        setParams({
          step: data.plan === "starter" ? "starter" : "mailbox",
          plan: data.plan,
        });
      },
      onError: (err) => setError(err.message || "Failed to set plan."),
    }),
  );

  const ensureStarterMailboxMutation = useMutation(
    trpc.inbox.mailboxes.ensureStarterMailbox.mutationOptions({
      onSuccess: (mailbox) => {
        if (!mailbox) return;
        setStarterMailbox({ name: mailbox.name, domain: mailbox.domain });
      },
      onError: (err) =>
        setError(err.message || "Failed to create a starter mailbox."),
    }),
  );

  useEffect(() => {
    if (resolvedStep !== "starter") return;
    setStarterMailboxAttempted(false);
  }, [resolvedStep]);

  useEffect(() => {
    if (resolvedStep !== "starter") return;
    if (starterMailbox) return;
    if (starterMailboxAttempted) return;
    if (ensureStarterMailboxMutation.isPending) return;
    setStarterMailboxAttempted(true);
    ensureStarterMailboxMutation.mutate();
  }, [
    ensureStarterMailboxMutation,
    resolvedStep,
    starterMailbox,
    starterMailboxAttempted,
  ]);

  useEffect(() => {
    if (resolvedStep !== "mailbox") return;
    const timer = setTimeout(() => {
      setDebouncedMailbox(mailboxName.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [mailboxName, resolvedStep]);

  const createMailboxMutation = useMutation(
    trpc.inbox.mailboxes.create.mutationOptions({
      onSuccess: () => {
        setParams({ step: "invite" });
      },
      onError: (err) => setError(err.message || "Failed to create mailbox."),
    }),
  );

  const inviteMutation = useMutation(trpc.team.invite.mutationOptions());

  const completeOnboardingMutation = useMutation(
    trpc.billing.completeOnboarding.mutationOptions({
      onSuccess: () => {
        router.replace("/");
        router.refresh();
      },
      onError: (err) => setError(err.message || "Failed to finish onboarding."),
    }),
  );

  const normalizedMailbox = mailboxName.trim().toLowerCase();
  const isMailboxValid =
    normalizedMailbox.length > 0 && mailboxPattern.test(normalizedMailbox);

  const { data: availability, isFetching: isChecking } = useQuery({
    ...trpc.inbox.mailboxes.checkAvailability.queryOptions({
      name: debouncedMailbox,
    }),
    enabled:
      resolvedStep === "mailbox" &&
      debouncedMailbox.length > 0 &&
      isMailboxValid,
  });

  const availabilityMessage = useMemo(() => {
    if (resolvedStep !== "mailbox" || !isMailboxValid) return null;
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
  }, [availability, isChecking, isMailboxValid, resolvedStep]);

  const availabilityToneClass =
    availabilityMessage?.tone === "success"
      ? "text-emerald-500"
      : availabilityMessage?.tone === "muted"
        ? "text-muted-foreground"
        : "text-destructive";

  const starterAddress = starterMailbox
    ? `${starterMailbox.name}@${starterMailbox.domain}`
    : null;

  const stepIndex = resolvedStep ? stepIndexMap[resolvedStep] : 1;

  const handleProfileContinue = () => {
    if (!fullName.trim()) return;
    setError(null);
    updateUserMutation.mutate({ fullName: fullName.trim() });
  };

  const handleTeamContinue = () => {
    const trimmed = teamName.trim();
    if (!trimmed) return;
    setError(null);
    if (!team) {
      createTeamMutation.mutate({ name: trimmed });
      return;
    }
    if (trimmed === team.name?.trim()) {
      setParams({ step: nextPostTeamStep });
      return;
    }
    updateTeamMutation.mutate({ name: trimmed });
  };

  const handlePlanContinue = () => {
    if (selectTrialPlanMutation.isPending) return;
    setError(null);
    selectTrialPlanMutation.mutate({ plan: selectedPlan });
  };

  const handleMailboxCreate = () => {
    if (!isMailboxValid) return;
    if (availability?.available === false) return;
    setError(null);
    createMailboxMutation.mutate({ name: normalizedMailbox });
  };

  const handleStarterRetry = () => {
    if (ensureStarterMailboxMutation.isPending) return;
    setError(null);
    setStarterMailboxAttempted(true);
    ensureStarterMailboxMutation.mutate();
  };

  const handleInviteFinish = async (skip?: boolean) => {
    if (completeOnboardingMutation.isPending) return;
    if (inviteMutation.isPending) return;

    setError(null);
    const trimmedEmail = inviteEmail.trim().toLowerCase();

    try {
      if (!skip && trimmedEmail.length > 0) {
        const emailOk = z.string().email().safeParse(trimmedEmail).success;
        if (!emailOk) {
          setError("Enter a valid email address.");
          return;
        }
        await inviteMutation.mutateAsync({ email: trimmedEmail });
      }
      await completeOnboardingMutation.mutateAsync();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!resolvedStep) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading onboarding...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/logo.png" alt="plop" width={96} height={96} />
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Onboarding
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Set up your workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Step {stepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        <Card>
          {resolvedStep === "profile" && (
            <>
              <CardHeader>
                <CardTitle>What is your name?</CardTitle>
                <CardDescription>
                  This shows up in invites and activity feeds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Jordan Lee"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="mt-3 text-sm text-destructive">{error}</p>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="button"
                  onClick={handleProfileContinue}
                  disabled={updateUserMutation.isPending || !fullName.trim()}
                >
                  {updateUserMutation.isPending ? "Saving..." : "Continue"}
                </Button>
              </CardFooter>
            </>
          )}

          {resolvedStep === "team" && (
            <>
              <CardHeader>
                <CardTitle>Name your team</CardTitle>
                <CardDescription>
                  This appears on your workspace and billing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team name</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                    placeholder="Acme QA"
                    autoComplete="organization"
                  />
                </div>
                {error && (
                  <p className="mt-3 text-sm text-destructive">{error}</p>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="button"
                  onClick={handleTeamContinue}
                  disabled={
                    !teamName.trim() ||
                    createTeamMutation.isPending ||
                    updateTeamMutation.isPending
                  }
                >
                  {createTeamMutation.isPending || updateTeamMutation.isPending
                    ? "Saving..."
                    : "Continue"}
                </Button>
              </CardFooter>
            </>
          )}

          {resolvedStep === "plan" && (
            <>
              <CardHeader>
                <CardTitle>Choose your trial plan</CardTitle>
                <CardDescription>
                  Start a {TRIAL_DAYS}-day trial with no credit card required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {onboardingPlanOptions.map((tier) => {
                    const planDef = PLAN_CATALOG[tier];
                    const isSelected = selectedPlan === tier;
                    return (
                      <Card
                        key={tier}
                        className={cn(
                          "cursor-pointer transition",
                          isSelected
                            ? "border-foreground"
                            : "border-border hover:border-foreground/50",
                        )}
                        onClick={() => setParams({ plan: tier })}
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
                            {formatUsd(
                              getPriceForCycle(planDef.tier, "monthly"),
                            )}
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
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="button"
                  onClick={handlePlanContinue}
                  disabled={selectTrialPlanMutation.isPending}
                >
                  {selectTrialPlanMutation.isPending ? "Saving..." : "Continue"}
                </Button>
              </CardFooter>
            </>
          )}

          {resolvedStep === "starter" && (
            <>
              <CardHeader>
                <CardTitle>Your Starter inbox is ready</CardTitle>
                <CardDescription>
                  Here is your default email address to start routing tags.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    Starter includes one mailbox, unlimited tags, and up to
                    5,000 emails per month.
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {!starterMailbox && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStarterRetry}
                    disabled={ensureStarterMailboxMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {ensureStarterMailboxMutation.isPending
                      ? "Retrying..."
                      : "Try again"}
                  </Button>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="button"
                  onClick={() => setParams({ step: "invite" })}
                  disabled={
                    !starterMailbox || ensureStarterMailboxMutation.isPending
                  }
                >
                  Continue
                </Button>
              </CardFooter>
            </>
          )}

          {resolvedStep === "mailbox" && (
            <>
              <CardHeader>
                <CardTitle>Create your first mailbox</CardTitle>
                <CardDescription>
                  Pro gives you unlimited mailboxes. Pick a name for this one.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                      Use 1-64 characters with letters, numbers, dots, dashes,
                      or underscores.
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
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="button"
                  onClick={handleMailboxCreate}
                  disabled={
                    !isMailboxValid ||
                    createMailboxMutation.isPending ||
                    availability?.available === false
                  }
                >
                  {createMailboxMutation.isPending ? "Creating..." : "Continue"}
                </Button>
              </CardFooter>
            </>
          )}

          {resolvedStep === "invite" && (
            <>
              <CardHeader>
                <CardTitle>Invite a teammate</CardTitle>
                <CardDescription>
                  Add one teammate now or skip and do it later.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Teammate email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="teammate@company.com"
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={() => handleInviteFinish(true)}
                  disabled={
                    completeOnboardingMutation.isPending ||
                    inviteMutation.isPending
                  }
                >
                  Skip for now
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => handleInviteFinish(false)}
                  disabled={
                    completeOnboardingMutation.isPending ||
                    inviteMutation.isPending
                  }
                >
                  {inviteMutation.isPending ? "Sending..." : "Finish setup"}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
