-- Remove posts demo table (dashboard is settings-focused now)
drop table if exists public.posts cascade;

-- Ensure extensions used by schema are available
create extension if not exists "pgcrypto" with schema "extensions";

-- Enum for team membership/invite roles
do $$
begin
  create type public.team_role as enum ('owner', 'member');
exception
  when duplicate_object then null;
end
$$;

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.teams enable row level security;

create trigger teams_updated_at
before update on public.teams
for each row
execute function public.update_updated_at();

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

create policy select_team_for_members on public.teams
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = teams.id
      and tm.user_id = auth.uid()
  )
);

create policy update_team_for_owners on public.teams
for update
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = teams.id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);

create policy select_memberships_for_team_members on public.team_memberships
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships self
    where self.team_id = team_memberships.team_id
      and self.user_id = auth.uid()
  )
);

create policy manage_memberships_for_team_owners on public.team_memberships
for all
to authenticated
using (
  exists (
    select 1
    from public.team_memberships self
    where self.team_id = team_memberships.team_id
      and self.user_id = auth.uid()
      and self.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.team_memberships self
    where self.team_id = team_memberships.team_id
      and self.user_id = auth.uid()
      and self.role = 'owner'
  )
);

-- Team invites (email-based, accepted on first sign-in)
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

-- Updated sign-up trigger to create a default team + membership, or accept an invite.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite record;
  resolved_team_id uuid;
  resolved_role public.team_role;
begin
  select id, team_id, role
  into invite
  from public.team_invites
  where email = new.email
    and accepted_at is null
  order by created_at
  limit 1;

  if invite.id is not null then
    resolved_team_id := invite.team_id;
    resolved_role := invite.role;

    update public.team_invites
    set accepted_at = now()
    where id = invite.id;
  else
    insert into public.teams (name)
    values (
      coalesce(
        nullif(new.raw_user_meta_data ->> 'team_name', ''),
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        'My Team'
      )
    )
    returning id into resolved_team_id;

    resolved_role := 'owner';
  end if;

  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.team_memberships (team_id, user_id, role)
  values (resolved_team_id, new.id, resolved_role);

  return new;
end;
$$;
