-- Billing & usage

create table public.team_email_usage (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  period_start timestamp with time zone not null,
  count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create unique index team_email_usage_unique_team_period
  on public.team_email_usage(team_id, period_start);

create index idx_team_email_usage_team_id
  on public.team_email_usage(team_id);

alter table public.team_email_usage enable row level security;

create trigger team_email_usage_updated_at
before update on public.team_email_usage
for each row
execute function public.update_updated_at();

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
