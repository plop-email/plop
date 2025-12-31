-- Explicit invite acceptance and onboarding flow updates

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

drop policy if exists select_team_for_invited_users on public.teams;
drop policy if exists select_invites_for_invited_users on public.team_invites;
drop policy if exists update_invites_for_invited_users on public.team_invites;
drop policy if exists delete_invites_for_invited_users on public.team_invites;
drop policy if exists accept_memberships_for_invited_users on public.team_memberships;

create or replace function public.list_invites_for_current_user()
returns table (
  id uuid,
  email text,
  role public.team_role,
  created_at timestamp with time zone,
  team_id uuid,
  team_name text
)
language sql
security definer
set search_path = ''
as $$
  select
    ti.id,
    ti.email,
    ti.role,
    ti.created_at,
    ti.team_id,
    t.name as team_name
  from public.team_invites ti
  inner join public.teams t on t.id = ti.team_id
  where ti.accepted_at is null
    and ti.email = (auth.jwt() ->> 'email')
  order by ti.created_at desc;
$$;

create or replace function public.accept_team_invite(invite_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite record;
  invite_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  invite_email := auth.jwt() ->> 'email';
  if invite_email is null or length(invite_email) = 0 then
    raise exception 'Invite email is required';
  end if;

  if exists (
    select 1
    from public.team_memberships tm
    where tm.user_id = auth.uid()
  ) then
    raise exception 'User already has a team';
  end if;

  select id, team_id, role
  into invite
  from public.team_invites
  where id = invite_id
    and accepted_at is null
    and email = invite_email
  limit 1;

  if invite.id is null then
    raise exception 'Invite not found';
  end if;

  insert into public.team_memberships (team_id, user_id, role)
  values (invite.team_id, auth.uid(), invite.role);

  update public.team_invites
  set accepted_at = now()
  where id = invite.id;

  return invite.team_id;
end;
$$;

create or replace function public.decline_team_invite(invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  invite_email := auth.jwt() ->> 'email';
  if invite_email is null or length(invite_email) = 0 then
    raise exception 'Invite email is required';
  end if;

  delete from public.team_invites
  where id = invite_id
    and accepted_at is null
    and email = invite_email;

  return found;
end;
$$;

grant execute on function public.list_invites_for_current_user() to authenticated;
grant execute on function public.accept_team_invite(uuid) to authenticated;
grant execute on function public.decline_team_invite(uuid) to authenticated;
