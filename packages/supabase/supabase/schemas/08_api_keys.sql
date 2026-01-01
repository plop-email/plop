-- API keys (public metadata + private secrets)

create schema if not exists private;

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key_masked text not null,
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  scopes text[] not null default '{}'::text[],
  mailbox_name text,
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create table if not exists private.api_key_secrets (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid not null references public.api_keys(id) on delete cascade,
  key_hash text not null,
  created_at timestamp with time zone not null default now()
);

create unique index if not exists api_keys_key_hash_unique
  on private.api_key_secrets(key_hash);
create unique index if not exists api_keys_secret_api_key_unique
  on private.api_key_secrets(api_key_id);
create index if not exists idx_api_keys_team_id
  on public.api_keys(team_id);
create index if not exists idx_api_keys_user_id
  on public.api_keys(user_id);
create index if not exists idx_api_keys_expires_at
  on public.api_keys(expires_at);

alter table public.api_keys enable row level security;

create policy select_api_keys_for_team_members
on public.api_keys
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = api_keys.team_id
      and tm.user_id = auth.uid()
  )
);

create policy manage_api_keys_for_team_owners
on public.api_keys
for all
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = api_keys.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = api_keys.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);

grant usage on schema private to authenticated;
grant insert on private.api_key_secrets to authenticated;
grant select (id) on private.api_key_secrets to authenticated;
