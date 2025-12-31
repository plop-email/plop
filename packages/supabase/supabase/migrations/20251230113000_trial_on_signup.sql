-- Set trial status for newly created teams
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
  -- Resolve team from an invite (if present), otherwise create a fresh team.
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
    insert into public.teams (name, plan, subscription_status)
    values (
      coalesce(
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        'My Team'
      ),
      'pro'::public.team_plan,
      'trialing'::public.subscription_status
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
