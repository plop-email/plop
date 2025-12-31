-- Team invites

create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  role public.team_role not null default 'member',
  invited_by uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  accepted_at timestamp with time zone
);

create index idx_team_invites_team_id on public.team_invites(team_id);
create index idx_team_invites_email on public.team_invites(email);

alter table public.team_invites enable row level security;

create policy select_invites_for_team_owners on public.team_invites
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships self
    where self.team_id = team_invites.team_id
      and self.user_id = auth.uid()
      and self.role = 'owner'
  )
);

create policy manage_invites_for_team_owners on public.team_invites
for all
to authenticated
using (
  exists (
    select 1
    from public.team_memberships self
    where self.team_id = team_invites.team_id
      and self.user_id = auth.uid()
      and self.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.team_memberships self
    where self.team_id = team_invites.team_id
      and self.user_id = auth.uid()
      and self.role = 'owner'
  )
);

