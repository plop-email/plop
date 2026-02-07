"use client";

import { Button } from "@plop/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plop/ui/card";
import { Input } from "@plop/ui/input";
import { Icons } from "@plop/ui/icons";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@plop/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plop/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useTeamMembership } from "@/hooks/use-team-membership";

const scopeOptions = [
  {
    value: "api.full",
    label: "Full API",
    description: "Access to all public API endpoints.",
  },
  {
    value: "email.full",
    label: "Email (all mailboxes)",
    description: "Read inbox data across all team mailboxes.",
  },
  {
    value: "email.mailbox",
    label: "Email (single mailbox)",
    description: "Read inbox data for one mailbox only.",
  },
] as const;

type ApiKeyScope = (typeof scopeOptions)[number]["value"];

const expiryOptions = [
  { value: "never", label: "Never" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "365 days" },
];

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
}

function formatExpiry(value: Date | string | null | undefined) {
  if (!value) return "Never";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 1) return "In 1 day";
  return `In ${days} days`;
}

export function TeamApiSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { isOwner } = useTeamMembership();

  const { data: mailboxes = [] } = useQuery(
    trpc.inbox.mailboxes.list.queryOptions(),
  );
  const { data: keys = [] } = useQuery(trpc.apiKeys.list.queryOptions());

  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [scope, setScope] = useState<ApiKeyScope>("email.full");
  const [mailboxName, setMailboxName] = useState("");
  const [expiresIn, setExpiresIn] = useState("never");

  const createMutation = useMutation(
    trpc.apiKeys.create.mutationOptions({
      onSuccess: (data) => {
        setCreatedKey(data.key);
        setCreateOpen(false);
        setName("");
        setScope("email.full");
        setMailboxName("");
        setExpiresIn("never");
        queryClient.invalidateQueries({
          queryKey: trpc.apiKeys.list.queryKey(),
        });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.apiKeys.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.apiKeys.list.queryKey(),
        });
      },
    }),
  );

  const selectedScope = scopeOptions.find((option) => option.value === scope);
  const mailboxOptions = useMemo(
    () => mailboxes.map((mailbox) => mailbox.name),
    [mailboxes],
  );

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = () => {
    if (!createdKey) return;
    void navigator.clipboard.writeText(createdKey);
    setCopied(true);
  };

  const canCreate =
    isOwner &&
    name.trim().length > 0 &&
    !createMutation.isPending &&
    (scope !== "email.mailbox" || mailboxName.trim().length > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>API keys</CardTitle>
            <CardDescription>
              Create scoped keys for the public inbox API.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isOwner}
            onClick={() => setCreateOpen(true)}
          >
            Create key
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Mailbox</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {key.keyMasked ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {key.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {scopeOptions.find((option) =>
                      key.scopes?.includes(option.value),
                    )?.label ??
                      key.scopes?.join(", ") ??
                      "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {key.mailboxName ?? "All"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatExpiry(key.expiresAt)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(key.lastUsedAt) || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {isOwner ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          deleteMutation.isPending &&
                          deleteMutation.variables?.id === key.id
                        }
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Revoke API key "${key.name}"?`,
                          );
                          if (confirmed) {
                            deleteMutation.mutate({ id: key.id });
                          }
                        }}
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables?.id === key.id
                          ? "Revoking..."
                          : "Revoke"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {keys.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No API keys yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {!isOwner && (
            <p className="mt-3 text-xs text-muted-foreground">
              Only team owners can create or revoke keys.
            </p>
          )}
        </CardContent>
      </Card>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Create API key</SheetTitle>
            <SheetDescription>
              Keys are shown once. Store them securely.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key-name">Key name</Label>
              <Input
                id="api-key-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="QA automation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key-scope">Scope</Label>
              <Select
                value={scope}
                onValueChange={(value) => setScope(value as ApiKeyScope)}
              >
                <SelectTrigger id="api-key-scope">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedScope?.description && (
                <p className="text-xs text-muted-foreground">
                  {selectedScope.description}
                </p>
              )}
            </div>

            {scope === "email.mailbox" && (
              <div className="space-y-2">
                <Label htmlFor="api-key-mailbox">Mailbox</Label>
                <Select
                  value={mailboxName || undefined}
                  onValueChange={(value) => setMailboxName(value)}
                  disabled={mailboxOptions.length === 0}
                >
                  <SelectTrigger id="api-key-mailbox">
                    <SelectValue placeholder="Select mailbox" />
                  </SelectTrigger>
                  <SelectContent>
                    {mailboxOptions.map((mailbox) => (
                      <SelectItem key={mailbox} value={mailbox}>
                        {mailbox}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mailboxOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Create a mailbox first to scope a key.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="api-key-expiry">Expiration</Label>
              <Select
                value={expiresIn}
                onValueChange={(value) => setExpiresIn(value)}
              >
                <SelectTrigger id="api-key-expiry">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                const expiresInDays =
                  expiresIn === "never" ? undefined : Number(expiresIn);
                createMutation.mutate({
                  name: name.trim(),
                  scope,
                  mailboxName:
                    scope === "email.mailbox" ? mailboxName.trim() : undefined,
                  expiresInDays,
                });
              }}
            >
              {createMutation.isPending ? "Creating..." : "Create key"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={createdKey !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedKey(null);
          }
        }}
      >
        <SheetContent className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>API key created</SheetTitle>
            <SheetDescription>
              Copy this key now. You won't be able to see it again.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-2">
            <Label htmlFor="created-api-key">API key</Label>
            <div className="relative">
              <Input
                id="created-api-key"
                readOnly
                value={createdKey ?? ""}
                className="pr-24"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!createdKey}
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
          <SheetFooter className="mt-auto pt-6">
            <Button type="button" onClick={() => setCreatedKey(null)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
