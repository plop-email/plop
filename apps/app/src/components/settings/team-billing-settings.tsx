"use client";

import {
  DEFAULT_PLAN_TIER,
  PLAN_CATALOG,
  formatUsd,
  getMonthlyEquivalent,
  getPriceForCycle,
  getTrialDaysLeft,
  getTrialEndsAt,
  isTrialExpired,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plop/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@plop/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";

const plans = [PLAN_CATALOG.starter, PLAN_CATALOG.pro, PLAN_CATALOG.enterprise];

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export function TeamBillingSettings() {
  const trpc = useTRPC();
  const { data: team } = useQuery(trpc.team.current.queryOptions());
  const { data: usage } = useQuery(trpc.billing.usage.queryOptions());
  const { data: orders } = useQuery(
    trpc.billing.orders.queryOptions({ pageSize: 5 }),
  );
  const { data: starterEligibility } = useQuery(
    trpc.billing.canChooseStarterPlan.queryOptions(),
  );

  const [cycle, setCycle] = useState<"monthly" | "yearly">(
    team?.billingCycle ?? "yearly",
  );

  useEffect(() => {
    if (team?.billingCycle) {
      setCycle(team.billingCycle);
    }
  }, [team?.billingCycle]);

  const checkoutMutation = useMutation(
    trpc.billing.createCheckout.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
    }),
  );

  const portalMutation = useMutation(
    trpc.billing.createPortal.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
    }),
  );

  const currentPlanTier = team?.plan ?? DEFAULT_PLAN_TIER;
  const currentPlan = PLAN_CATALOG[currentPlanTier];
  const isTrialing = team?.subscriptionStatus === "trialing";
  const trialEndsAt = isTrialing ? getTrialEndsAt(team?.createdAt) : null;
  const trialDaysLeft = isTrialing ? getTrialDaysLeft(team?.createdAt) : null;
  const trialExpired = isTrialing && isTrialExpired(team?.createdAt);
  const canOpenPortal = Boolean(team?.polarCustomerId);

  const planStatusLabel = useMemo(() => {
    if (!team?.subscriptionStatus) return "Not subscribed";
    return team.subscriptionStatus.replace(/_/g, " ");
  }, [team?.subscriptionStatus]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            Your workspace is on the {currentPlan.name} plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Plan</div>
            <div className="text-sm font-medium">{currentPlan.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="text-sm font-medium capitalize">
              {planStatusLabel}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Renews</div>
            <div className="text-sm font-medium">
              {team?.cancelAtPeriodEnd
                ? `Ends ${formatDate(team.currentPeriodEnd)}`
                : formatDate(team?.currentPeriodEnd) || "—"}
            </div>
          </div>
        </CardContent>
        {isTrialing && (
          <CardContent className="text-xs text-muted-foreground">
            {trialExpired
              ? "Trial ended. Choose a plan to continue."
              : `Trial ends ${trialEndsAt ? formatDate(trialEndsAt) : "soon"}${
                  trialDaysLeft !== null ? ` (${trialDaysLeft} days left)` : ""
                }.`}
          </CardContent>
        )}
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending || !canOpenPortal}
          >
            {portalMutation.isPending ? "Opening portal..." : "Manage billing"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {canOpenPortal
              ? "Need invoices or cancellations? Use the customer portal."
              : "Portal access is available after subscribing."}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Track mailbox and email usage for your current billing period.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Mailboxes</div>
            <div className="text-sm font-medium">
              {usage?.mailboxesUsed ?? 0}
              {usage?.mailboxesLimit
                ? ` / ${usage.mailboxesLimit}`
                : " / Unlimited"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Emails</div>
            <div className="text-sm font-medium">
              {usage?.emailsUsed ?? 0}
              {usage?.emailsLimit ? ` / ${usage.emailsLimit}` : " / Unlimited"}
            </div>
          </div>
          <div className="text-xs text-muted-foreground sm:col-span-2">
            Current period: {formatDate(usage?.periodStart)} –{" "}
            {formatDate(usage?.periodEnd)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>
            Switch plans instantly. Annual billing saves ~20%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={cycle}
            onValueChange={(value) => setCycle(value as typeof cycle)}
          >
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent =
                plan.tier === currentPlanTier &&
                (!team?.billingCycle || team.billingCycle === cycle);
              const isComingSoon = plan.comingSoon;
              const isStarter = plan.tier === "starter";
              const starterBlocked =
                isStarter && starterEligibility?.allowed === false;
              const price =
                cycle === "yearly"
                  ? getMonthlyEquivalent(plan.tier)
                  : getPriceForCycle(plan.tier, "monthly");

              return (
                <div
                  key={plan.tier}
                  className={`border border-border bg-muted/30 p-4 ${
                    starterBlocked ? "opacity-60" : ""
                  }`}
                >
                  <div className="text-sm font-semibold">{plan.name}</div>
                  <div className="mt-2 text-2xl font-semibold">
                    {isComingSoon ? "Coming soon" : formatUsd(price)}
                    {!isComingSoon && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    )}
                  </div>
                  {!isComingSoon && cycle === "yearly" && (
                    <div className="text-xs text-muted-foreground">
                      {formatUsd(plan.pricing.yearly)} billed yearly
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {plan.shortDescription}
                  </p>
                  {starterBlocked && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Starter requires one mailbox and no custom domain.
                    </p>
                  )}
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {plan.highlights.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button
                      type="button"
                      className="w-full"
                      disabled={
                        isCurrent ||
                        isComingSoon ||
                        checkoutMutation.isPending ||
                        starterBlocked
                      }
                      onClick={() =>
                        checkoutMutation.mutate({
                          plan: plan.tier,
                          cycle,
                        })
                      }
                    >
                      {isCurrent
                        ? "Current plan"
                        : isComingSoon
                          ? "Coming soon"
                          : "Choose plan"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
          <CardDescription>Recent invoices and receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.data?.length ? (
                orders.data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.productName}
                    </TableCell>
                    <TableCell className="text-xs capitalize text-muted-foreground">
                      {order.status}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatAmount(order.amount.amount, order.amount.currency)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-20 text-center text-xs text-muted-foreground"
                  >
                    No billing history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
