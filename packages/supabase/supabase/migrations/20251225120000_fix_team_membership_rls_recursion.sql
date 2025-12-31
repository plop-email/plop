-- Fix recursive RLS policies on teams/team_memberships.

drop policy if exists select_team_for_members on public.teams;
drop policy if exists update_team_for_owners on public.teams;
drop policy if exists select_memberships_for_team_members on public.team_memberships;
drop policy if exists manage_memberships_for_team_owners on public.team_memberships;

create or replace function public.is_team_member(target_team_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = target_team_id
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_team_owner(target_team_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = target_team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  );
$$;

create policy select_team_for_members on public.teams
for select
to authenticated
using (
  public.is_team_member(teams.id)
);

create policy update_team_for_owners on public.teams
for update
to authenticated
using (
  public.is_team_owner(teams.id)
);

create policy select_memberships_for_team_members on public.team_memberships
for select
to authenticated
using (
  public.is_team_member(team_memberships.team_id)
);

create policy manage_memberships_for_team_owners on public.team_memberships
for all
to authenticated
using (
  public.is_team_owner(team_memberships.team_id)
)
with check (
  public.is_team_owner(team_memberships.team_id)
);
