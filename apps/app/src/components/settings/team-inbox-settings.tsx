"use client";

import { DEFAULT_PLAN_TIER, getPlanEntitlements } from "@plop/billing";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { InboxDomainSheet } from "@/components/settings/inbox-domain-sheet";
import { InboxMailboxSheet } from "@/components/settings/inbox-mailbox-sheet";
import { useInboxSettingsParams } from "@/hooks/use-inbox-settings-params";
import { useTRPC } from "@/trpc/client";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export function TeamInboxSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { setParams } = useInboxSettingsParams();

  const { data: team } = useQuery(trpc.team.current.queryOptions());
  const { data: mailboxes = [] } = useQuery(
    trpc.inbox.mailboxes.list.queryOptions(),
  );
  const { data: inboxSettings } = useQuery(
    trpc.inbox.settings.get.queryOptions(),
  );

  const removeMailboxMutation = useMutation(
    trpc.inbox.mailboxes.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.inbox.mailboxes.list.queryKey(),
        });
      },
    }),
  );

  const isOwner = team?.role === "owner";
  const plan = team?.plan ?? DEFAULT_PLAN_TIER;
  const entitlements = getPlanEntitlements(plan);
  const mailboxLimit = entitlements.mailboxes;
  const limitReached =
    typeof mailboxLimit === "number" && mailboxes.length >= mailboxLimit;
  const canUseCustomDomain = entitlements.customDomains;
  const canOpenDomainSheet =
    isOwner && (canUseCustomDomain || inboxSettings?.domain);
  const mailboxRows = useMemo(
    () =>
      mailboxes.map((mailbox) => ({
        ...mailbox,
        address: mailbox.domain
          ? `${mailbox.name}@${mailbox.domain}`
          : mailbox.name,
      })),
    [mailboxes],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Inbox domain</CardTitle>
            <CardDescription>
              Use a shared or custom domain for team mailboxes.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canOpenDomainSheet}
            onClick={() =>
              setParams({
                domainSheet: inboxSettings?.domain ? "edit" : "create",
                mailboxSheet: null,
                mailboxId: null,
              })
            }
          >
            {inboxSettings?.domain ? "Edit domain" : "Add domain"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            {inboxSettings?.domain ? (
              <span className="font-medium">{inboxSettings.domain}</span>
            ) : (
              <span className="text-muted-foreground">Shared domain</span>
            )}
          </div>
          {isOwner && !canUseCustomDomain && (
            <p className="mt-2 text-xs text-muted-foreground">
              Custom subdomains are available on the Enterprise plan (coming
              soon).
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Mailboxes</CardTitle>
            <CardDescription>
              Create and manage inbox mailboxes for your team.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isOwner || limitReached}
            onClick={() =>
              setParams({
                mailboxSheet: "create",
                mailboxId: null,
                domainSheet: null,
              })
            }
          >
            Add mailbox
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mailbox</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailboxRows.map((mailbox) => (
                <TableRow key={mailbox.id}>
                  <TableCell className="text-sm font-medium">
                    {mailbox.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {mailbox.address}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(mailbox.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {isOwner ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setParams({
                              mailboxSheet: "edit",
                              mailboxId: mailbox.id,
                              domainSheet: null,
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            removeMailboxMutation.isPending &&
                            removeMailboxMutation.variables?.id === mailbox.id
                          }
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Remove mailbox "${mailbox.name}"?`,
                            );
                            if (confirmed) {
                              removeMailboxMutation.mutate({ id: mailbox.id });
                            }
                          }}
                        >
                          {removeMailboxMutation.isPending &&
                          removeMailboxMutation.variables?.id === mailbox.id
                            ? "Removing..."
                            : "Remove"}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {mailboxRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No mailboxes yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {!isOwner && (
            <p className="mt-3 text-xs text-muted-foreground">
              Only team owners can create or edit mailboxes.
            </p>
          )}
          {isOwner && limitReached && (
            <p className="mt-3 text-xs text-muted-foreground">
              Your current plan allows {mailboxLimit} mailbox
              {mailboxLimit === 1 ? "" : "es"}. Upgrade to add more.{" "}
              <Link href="/settings/team/billing" className="underline">
                View billing options
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>

      <InboxDomainSheet />
      <InboxMailboxSheet />
    </div>
  );
}
