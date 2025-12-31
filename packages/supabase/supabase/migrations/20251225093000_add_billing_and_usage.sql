-- Billing + onboarding fields

do $$
begin
  create type public.team_plan as enum ('starter', 'pro', 'enterprise');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.billing_cycle as enum ('monthly', 'yearly');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.subscription_status as enum (
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid'
  );
exception
  when duplicate_object then null;
end
$$;

alter table public.teams
  add column if not exists plan public.team_plan not null default 'pro',
  add column if not exists billing_cycle public.billing_cycle,
  add column if not exists subscription_status public.subscription_status,
  add column if not exists polar_customer_id text,
  add column if not exists polar_subscription_id text,
  add column if not exists polar_product_id text,
  add column if not exists current_period_end timestamp with time zone,
  add column if not exists canceled_at timestamp with time zone,
  add column if not exists cancel_at_period_end boolean default false,
  add column if not exists onboarding_completed_at timestamp with time zone;

update public.teams
set onboarding_completed_at = now()
where onboarding_completed_at is null;

-- Team email usage tracking

create table if not exists public.team_email_usage (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  period_start timestamp with time zone not null,
  count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create unique index if not exists team_email_usage_unique_team_period
  on public.team_email_usage(team_id, period_start);

create index if not exists idx_team_email_usage_team_id
  on public.team_email_usage(team_id);

alter table public.team_email_usage enable row level security;

do $$
begin
  create trigger team_email_usage_updated_at
  before update on public.team_email_usage
  for each row
  execute function public.update_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'team_email_usage'
      and policyname = 'select_team_email_usage_for_team_members'
  ) then
    create policy select_team_email_usage_for_team_members
    on public.team_email_usage
    for select
    to public
    using (
      team_id in (
        select tm.team_id
        from public.team_memberships tm
        where tm.team_id = team_email_usage.team_id
      )
    );
  end if;
end
$$;
