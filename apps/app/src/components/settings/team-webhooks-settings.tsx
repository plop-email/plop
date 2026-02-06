"use client";

import { Button } from "@plop/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plop/ui/card";
import { Icons } from "@plop/ui/icons";
import { Input } from "@plop/ui/input";
import { Label } from "@plop/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@plop/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plop/ui/table";
import { createClient } from "@plop/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTeamMembership } from "@/hooks/use-team-membership";
import { useTRPC } from "@/trpc/client";

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatRelativeTime(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block size-2 rounded-full ${active ? "bg-green-500" : "bg-gray-400"}`}
    />
  );
}

function DeliveryStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}

export function TeamWebhooksSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { isOwner } = useTeamMembership();

  const { data: endpoints = [] } = useQuery(trpc.webhooks.list.queryOptions());

  const [createOpen, setCreateOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deliveriesEndpointId, setDeliveriesEndpointId] = useState<
    string | null
  >(null);

  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation(
    trpc.webhooks.create.mutationOptions({
      onSuccess: (data) => {
        setCreatedSecret(data.secret);
        setCreateOpen(false);
        setUrl("");
        setDescription("");
        queryClient.invalidateQueries({
          queryKey: trpc.webhooks.list.queryKey(),
        });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.webhooks.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.webhooks.list.queryKey(),
        });
      },
    }),
  );

  const toggleMutation = useMutation(
    trpc.webhooks.toggle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.webhooks.list.queryKey(),
        });
      },
    }),
  );

  const testMutation = useMutation(trpc.webhooks.test.mutationOptions());

  const { data: deliveries = [] } = useQuery({
    ...trpc.webhooks.deliveries.list.queryOptions({
      endpointId: deliveriesEndpointId!,
    }),
    enabled: deliveriesEndpointId !== null,
  });

  useEffect(() => {
    if (!deliveriesEndpointId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`webhook-deliveries:${deliveriesEndpointId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "webhook_deliveries",
          filter: `webhook_endpoint_id=eq.${deliveriesEndpointId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: trpc.webhooks.deliveries.list.queryKey({
              endpointId: deliveriesEndpointId,
            }),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deliveriesEndpointId, queryClient, trpc]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = () => {
    if (!createdSecret) return;
    void navigator.clipboard.writeText(createdSecret);
    setCopied(true);
  };

  const canCreate =
    isOwner &&
    url.trim().length > 0 &&
    url.startsWith("https://") &&
    !createMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Receive HTTP notifications when emails arrive.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isOwner}
            onClick={() => setCreateOpen(true)}
          >
            Create webhook
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">
                    {endpoint.url}
                  </TableCell>
                  <TableCell className="text-sm">
                    {endpoint.description || "—"}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <StatusDot active={endpoint.active} />
                      {endpoint.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(endpoint.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeliveriesEndpointId(endpoint.id)}
                      >
                        Deliveries
                      </Button>
                      {isOwner && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={toggleMutation.isPending}
                            onClick={() =>
                              toggleMutation.mutate({
                                id: endpoint.id,
                                active: !endpoint.active,
                              })
                            }
                          >
                            {endpoint.active ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              deleteMutation.isPending &&
                              deleteMutation.variables?.id === endpoint.id
                            }
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Delete webhook for "${endpoint.url}"?`,
                              );
                              if (confirmed) {
                                deleteMutation.mutate({ id: endpoint.id });
                              }
                            }}
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables?.id === endpoint.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {endpoints.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No webhooks configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {!isOwner && (
            <p className="mt-3 text-xs text-muted-foreground">
              Only team owners can create or manage webhooks.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create webhook sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Create webhook</SheetTitle>
            <SheetDescription>
              We'll send a POST request to this URL when emails arrive.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/webhooks/plop"
              />
              <p className="text-xs text-muted-foreground">
                Must be an HTTPS URL.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="webhook-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Production notification handler"
                maxLength={200}
              />
            </div>

            {createMutation.error && (
              <p className="text-xs text-destructive">
                {createMutation.error.message}
              </p>
            )}
          </div>

          <SheetFooter className="mt-auto pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canCreate}
              onClick={() => {
                createMutation.mutate({
                  url: url.trim(),
                  description: description.trim() || undefined,
                });
              }}
            >
              {createMutation.isPending ? "Creating..." : "Create webhook"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Secret display sheet (shown once after creation) */}
      <Sheet
        open={createdSecret !== null}
        onOpenChange={(open) => {
          if (!open) setCreatedSecret(null);
        }}
      >
        <SheetContent className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Webhook created</SheetTitle>
            <SheetDescription>
              Copy this signing secret now. You won't be able to see it again.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-secret">Signing secret</Label>
              <div className="relative">
                <Input
                  id="webhook-secret"
                  readOnly
                  value={createdSecret ?? ""}
                  className="pr-24 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!createdSecret}
                  onClick={handleCopy}
                  data-state={copied ? "copied" : "idle"}
                  className="absolute right-1 top-1/2 h-7 -translate-y-1/2 gap-1 px-2 text-xs data-[state=copied]:animate-in data-[state=copied]:fade-in data-[state=copied]:zoom-in-95"
                >
                  {copied ? (
                    <>
                      <Icons.Check className="size-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="size-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* TODO: Signature verification snippet — user contribution opportunity */}
            <div className="space-y-2">
              <Label>Verify signatures</Label>
              <p className="text-xs text-muted-foreground">
                Each request includes an{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  X-Plop-Signature
                </code>{" "}
                header with format{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  t=timestamp,v1=signature
                </code>
                . Compute HMAC-SHA256 over{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  {"{timestamp}.{body}"}
                </code>{" "}
                using this secret and compare.
              </p>
            </div>
          </div>
          <SheetFooter className="mt-auto pt-6">
            <Button type="button" onClick={() => setCreatedSecret(null)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Deliveries sheet */}
      <Sheet
        open={deliveriesEndpointId !== null}
        onOpenChange={(open) => {
          if (!open) setDeliveriesEndpointId(null);
        }}
      >
        <SheetContent className="flex h-full flex-col sm:max-w-lg">
          <SheetHeader className="mb-6">
            <SheetTitle>Recent deliveries</SheetTitle>
            <SheetDescription>
              Last 50 webhook delivery attempts.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto">
            {isOwner && deliveriesEndpointId && (
              <div className="mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={testMutation.isPending}
                  onClick={() =>
                    testMutation.mutate({ id: deliveriesEndpointId })
                  }
                >
                  {testMutation.isPending ? "Sending..." : "Send test"}
                </Button>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-mono text-xs">
                      {delivery.event}
                    </TableCell>
                    <TableCell>
                      <DeliveryStatusBadge status={delivery.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {delivery.httpStatus ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {delivery.latencyMs != null
                        ? `${delivery.latencyMs}ms`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {delivery.attempt}
                    </TableCell>
                    <TableCell
                      className="text-xs text-muted-foreground"
                      title={
                        delivery.error ? `Error: ${delivery.error}` : undefined
                      }
                    >
                      {formatRelativeTime(delivery.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}

                {deliveries.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No deliveries yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <SheetFooter className="mt-auto pt-6">
            <Button type="button" onClick={() => setDeliveriesEndpointId(null)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
