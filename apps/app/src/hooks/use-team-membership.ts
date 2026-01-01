import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useTeamMembership() {
  const trpc = useTRPC();

  const membershipQuery = useQuery(trpc.team.membership.queryOptions());
  const membership = membershipQuery.data ?? null;

  const teamQuery = useQuery({
    ...trpc.team.current.queryOptions(),
    enabled: Boolean(membership),
  });
  const team = teamQuery.data ?? null;

  const role = team?.role ?? null;
  const isOwner = role === "owner";
  const isMember = role === "member";

  return {
    membership,
    team,
    role,
    isOwner,
    isMember,
    hasMembership: Boolean(membership),
    isLoading: membershipQuery.isLoading || teamQuery.isLoading,
    membershipQuery,
    teamQuery,
  };
}
