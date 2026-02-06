-- Webhook endpoints, delivery logs, and signing secrets

create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  url text not null,
  description text,
  secret_masked text not null,
  events text[] not null default '{email.received}'::text[],
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_endpoint_id uuid not null references public.webhook_endpoints(id) on delete cascade,
  event text not null,
  message_id uuid references public.inbox_messages(id) on delete set null,
  status text not null default 'pending',
  http_status integer,
  response_body text,
  latency_ms integer,
  attempt integer not null default 1,
  error text,
  created_at timestamp with time zone not null default now()
);

create table if not exists private.webhook_secrets (
  id uuid primary key default gen_random_uuid(),
  webhook_endpoint_id uuid not null references public.webhook_endpoints(id) on delete cascade,
  secret text not null,
  created_at timestamp with time zone not null default now()
);

-- Indexes
create unique index if not exists webhook_endpoints_unique_team_url
  on public.webhook_endpoints(team_id, url);
create index if not exists idx_webhook_endpoints_team_id
  on public.webhook_endpoints(team_id);
create unique index if not exists webhook_secrets_endpoint_unique
  on private.webhook_secrets(webhook_endpoint_id);
create index if not exists idx_webhook_deliveries_endpoint_id
  on public.webhook_deliveries(webhook_endpoint_id);
create index if not exists idx_webhook_deliveries_endpoint_created
  on public.webhook_deliveries(webhook_endpoint_id, created_at desc);

-- RLS: webhook_endpoints
alter table public.webhook_endpoints enable row level security;

create policy select_webhook_endpoints_for_team_members
on public.webhook_endpoints
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = webhook_endpoints.team_id
      and tm.user_id = auth.uid()
  )
);

create policy manage_webhook_endpoints_for_team_owners
on public.webhook_endpoints
for all
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = webhook_endpoints.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = webhook_endpoints.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);

-- RLS: webhook_deliveries (JOIN through webhook_endpoints to reach team_id)
alter table public.webhook_deliveries enable row level security;

create policy select_webhook_deliveries_for_team_members
on public.webhook_deliveries
for select
to authenticated
using (
  exists (
    select 1
    from public.webhook_endpoints we
    inner join public.team_memberships tm
      on tm.team_id = we.team_id
    where we.id = webhook_deliveries.webhook_endpoint_id
      and tm.user_id = auth.uid()
  )
);

create policy manage_webhook_deliveries_for_team_owners
on public.webhook_deliveries
for all
to authenticated
using (
  exists (
    select 1
    from public.webhook_endpoints we
    inner join public.team_memberships tm
      on tm.team_id = we.team_id
    where we.id = webhook_deliveries.webhook_endpoint_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.webhook_endpoints we
    inner join public.team_memberships tm
      on tm.team_id = we.team_id
    where we.id = webhook_deliveries.webhook_endpoint_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);

-- Grants for private.webhook_secrets
grant usage on schema private to service_role;
grant all on private.webhook_secrets to service_role;
