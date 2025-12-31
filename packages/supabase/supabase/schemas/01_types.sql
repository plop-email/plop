-- Types

do $$
begin
  create type public.team_role as enum ('owner', 'member');
exception
  when duplicate_object then null;
end
$$;

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
