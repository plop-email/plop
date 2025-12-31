"use client";

import { DEFAULT_PLAN_TIER, getPlanEntitlements } from "@plop/billing";
import { Button } from "@plop/ui/button";
import { Input } from "@plop/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@plop/ui/sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useInboxSettingsParams } from "@/hooks/use-inbox-settings-params";
import { useTRPC } from "@/trpc/client";

const domainPattern = /^[a-z0-9.-]+$/i;

export function InboxDomainSheet() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domainSheet, setParams } = useInboxSettingsParams();
  const isOpen = domainSheet === "create" || domainSheet === "edit";

  const { data: team } = useQuery(trpc.team.current.queryOptions());
  const { data: settings } = useQuery({
    ...trpc.inbox.settings.get.queryOptions(),
    enabled: isOpen,
  });

  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setDomain(settings?.domain ?? "");
  }, [isOpen, settings?.domain]);

  const saveMutation = useMutation(
    trpc.inbox.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.inbox.settings.get.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.inbox.mailboxes.list.queryKey(),
        });
        setParams({ domainSheet: null });
      },
    }),
  );

  const isOwner = team?.role === "owner";
  const plan = team?.plan ?? DEFAULT_PLAN_TIER;
  const entitlements = getPlanEntitlements(plan);
  const canUseCustomDomain = entitlements.customDomains;
  const normalizedDomain = domain.trim().toLowerCase();
  const isDomainValid =
    normalizedDomain.length === 0 || domainPattern.test(normalizedDomain);
  const hasChanged = normalizedDomain !== (settings?.domain ?? "");
  const canSave =
    isOwner &&
    isDomainValid &&
    hasChanged &&
    !saveMutation.isPending &&
    (canUseCustomDomain || normalizedDomain.length === 0);

  const title = useMemo(() => {
    if (settings?.domain) return "Edit custom domain";
    return "Add custom domain";
  }, [settings?.domain]);

  const handleClose = () => setParams({ domainSheet: null });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader className="mb-6">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Use a custom domain for team inboxes. Leave blank to use the shared
            domain.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Domain</div>
            <Input
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="team.example.com"
              disabled={!isOwner || !canUseCustomDomain}
            />
            {!isDomainValid && (
              <p className="text-xs text-destructive">
                Enter a valid domain name.
              </p>
            )}
            {!canUseCustomDomain && (
              <p className="text-xs text-muted-foreground">
                Custom subdomains are available on the Enterprise plan (coming
                soon).
              </p>
            )}
            {!isOwner && (
              <p className="text-xs text-muted-foreground">
                Only team owners can update the inbox domain.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {settings?.domain && isOwner ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  saveMutation.mutate({
                    domain: null,
                  })
                }
                disabled={saveMutation.isPending}
              >
                Use shared domain
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canSave}
                onClick={() =>
                  saveMutation.mutate({
                    domain:
                      normalizedDomain.length === 0 ? null : normalizedDomain,
                  })
                }
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
