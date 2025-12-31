-- Auth triggers

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  return new;
end;
$$;

create or replace function public.create_team(
  team_name text,
  team_plan public.team_plan default 'pro'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text := btrim(team_name);
  new_team_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if normalized_name is null or length(normalized_name) = 0 then
    raise exception 'Team name is required';
  end if;

  if team_plan = 'enterprise' then
    raise exception 'Enterprise plan is not available';
  end if;

  if exists (
    select 1
    from public.team_memberships tm
    where tm.user_id = auth.uid()
  ) then
    raise exception 'User already has a team';
  end if;

  insert into public.teams (name, plan, subscription_status)
  values (
    normalized_name,
    team_plan,
    'trialing'::public.subscription_status
  )
  returning id into new_team_id;

  insert into public.team_memberships (team_id, user_id, role)
  values (new_team_id, auth.uid(), 'owner');

  return new_team_id;
end;
$$;

grant execute on function public.create_team(text, public.team_plan) to authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
