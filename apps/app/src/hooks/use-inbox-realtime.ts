"use client";

import { createClient } from "@plop/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useTeamMembership } from "./use-team-membership";

export function useInboxRealtime(): void {
  const trpc = useTRPC();
  const { membership } = useTeamMembership();
  const teamId = membership?.teamId ?? null;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!teamId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`inbox:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inbox_messages",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: trpc.inbox.messages.list.queryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.inbox.messages.count.queryKey(),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, queryClient, trpc]);
}
