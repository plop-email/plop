-- Team memberships

create table public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.team_role not null default 'member',
  created_at timestamp with time zone not null default now()
);

create unique index team_memberships_unique_user_id on public.team_memberships(user_id);
create unique index team_memberships_unique_team_user on public.team_memberships(team_id, user_id);

alter table public.team_memberships enable row level security;

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
