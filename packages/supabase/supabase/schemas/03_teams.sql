-- Teams

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan public.team_plan not null default 'pro',
  billing_cycle public.billing_cycle,
  subscription_status public.subscription_status,
  polar_customer_id text,
  polar_subscription_id text,
  polar_product_id text,
  current_period_end timestamp with time zone,
  canceled_at timestamp with time zone,
  cancel_at_period_end boolean default false,
  onboarding_completed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.teams enable row level security;

create trigger teams_updated_at
before update on public.teams
for each row
execute function public.update_updated_at();
