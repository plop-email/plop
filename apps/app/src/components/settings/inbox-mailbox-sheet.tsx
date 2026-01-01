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
import { useTeamMembership } from "@/hooks/use-team-membership";
import { useTRPC } from "@/trpc/client";

const mailboxPattern = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

export function InboxMailboxSheet() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mailboxSheet, mailboxId, setParams } = useInboxSettingsParams();
  const isOpen = mailboxSheet === "create" || mailboxSheet === "edit";
  const { team, isOwner } = useTeamMembership();

  const { data: mailboxes = [] } = useQuery({
    ...trpc.inbox.mailboxes.list.queryOptions(),
    enabled: isOpen,
  });

  const mailbox = useMemo(
    () => mailboxes.find((item) => item.id === mailboxId) ?? null,
    [mailboxes, mailboxId],
  );

  const [name, setName] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(mailbox?.name ?? "");
  }, [isOpen, mailbox?.name]);

  const createMutation = useMutation(
    trpc.inbox.mailboxes.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.inbox.mailboxes.list.queryKey(),
        });
        setParams({ mailboxSheet: null, mailboxId: null });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.inbox.mailboxes.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.inbox.mailboxes.list.queryKey(),
        });
        setParams({ mailboxSheet: null, mailboxId: null });
      },
    }),
  );

  const normalizedName = name.trim().toLowerCase();
  const isValidName =
    normalizedName.length > 0 && mailboxPattern.test(normalizedName);
  const hasChanged = normalizedName !== (mailbox?.name ?? "");

  const plan = team?.plan ?? DEFAULT_PLAN_TIER;
  const entitlements = getPlanEntitlements(plan);
  const mailboxLimit = entitlements.mailboxes;
  const limitReached =
    typeof mailboxLimit === "number" && mailboxes.length >= mailboxLimit;

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setDebouncedName(normalizedName);
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, normalizedName]);

  const isEditing = mailboxSheet === "edit";

  const shouldCheckAvailability =
    isOpen && isOwner && isValidName && (!isEditing || hasChanged);

  const { data: availability, isFetching: isChecking } = useQuery({
    ...trpc.inbox.mailboxes.checkAvailability.queryOptions({
      name: debouncedName,
      mailboxId: isEditing ? (mailboxId ?? undefined) : undefined,
    }),
    enabled: shouldCheckAvailability && debouncedName.length > 0,
  });

  const availabilityBlocked = availability?.available === false;
  const limitBlocked = !isEditing && limitReached;

  const canSave =
    isOwner &&
    isValidName &&
    (!isEditing || hasChanged) &&
    !availabilityBlocked &&
    !limitBlocked &&
    !createMutation.isPending &&
    !updateMutation.isPending;

  const title = isEditing ? "Edit mailbox" : "Create mailbox";

  const availabilityMessage = useMemo(() => {
    if (isEditing || !shouldCheckAvailability) return null;
    if (limitReached) {
      return {
        tone: "destructive",
        text: `Your plan allows ${mailboxLimit} mailbox${mailboxLimit === 1 ? "" : "es"}.`,
      };
    }
    if (isChecking) {
      return { tone: "muted", text: "Checking availability..." };
    }
    if (availability?.available === true) {
      return { tone: "success", text: "Mailbox name is available." };
    }
    if (availability?.available === false) {
      switch (availability.reason) {
        case "reserved":
          return {
            tone: "destructive",
            text: "That mailbox name is reserved.",
          };
        case "taken":
          return {
            tone: "destructive",
            text: "That mailbox is already taken.",
          };
        case "owned":
          return {
            tone: "destructive",
            text: "You already have a mailbox with this name.",
          };
        case "limit_reached":
          return {
            tone: "destructive",
            text: `Your plan allows ${mailboxLimit} mailbox${mailboxLimit === 1 ? "" : "es"}.`,
          };
        default:
          return {
            tone: "destructive",
            text: "Choose another mailbox name.",
          };
      }
    }
    return null;
  }, [
    availability,
    isChecking,
    isEditing,
    limitReached,
    mailboxLimit,
    shouldCheckAvailability,
  ]);

  const availabilityToneClass =
    availabilityMessage?.tone === "success"
      ? "text-emerald-500"
      : availabilityMessage?.tone === "muted"
        ? "text-muted-foreground"
        : "text-destructive";

  const handleClose = () => setParams({ mailboxSheet: null, mailboxId: null });

  const handleSave = () => {
    if (!canSave) return;
    if (isEditing && mailboxId) {
      updateMutation.mutate({ id: mailboxId, name: normalizedName });
      return;
    }
    createMutation.mutate({ name: normalizedName });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader className="mb-6">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Mailbox names can include letters, numbers, dots, dashes, and
            underscores.
            {isEditing && (
              <span className="mt-2 block text-xs text-muted-foreground">
                Renames only affect new mail routing. Existing messages keep the
                original mailbox label.
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Mailbox name</div>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="support"
              disabled={!isOwner}
            />
            {!isValidName && name.trim().length > 0 && (
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
            {!isOwner && (
              <p className="text-xs text-muted-foreground">
                Only team owners can manage mailboxes.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" disabled={!canSave} onClick={handleSave}>
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
