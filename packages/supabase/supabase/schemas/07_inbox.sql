-- Inbox settings + mailboxes + messages

create table public.team_inbox_settings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  domain text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create unique index team_inbox_settings_unique_team_id
  on public.team_inbox_settings(team_id);
create unique index team_inbox_settings_unique_domain
  on public.team_inbox_settings(domain);

alter table public.team_inbox_settings enable row level security;

create trigger team_inbox_settings_updated_at
before update on public.team_inbox_settings
for each row
execute function public.update_updated_at();

create table public.inbox_mailboxes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  domain text not null,
  name text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index idx_inbox_mailboxes_team_id on public.inbox_mailboxes(team_id);
create unique index inbox_mailboxes_unique_domain_name
  on public.inbox_mailboxes(domain, name);
create unique index inbox_mailboxes_unique_team_name
  on public.inbox_mailboxes(team_id, name);

alter table public.inbox_mailboxes enable row level security;

create trigger inbox_mailboxes_updated_at
before update on public.inbox_mailboxes
for each row
execute function public.update_updated_at();

create table public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  mailbox_id uuid not null references public.inbox_mailboxes(id) on delete cascade,
  external_id text not null,
  domain text not null,
  tenant_subdomain text,
  mailbox text not null,
  mailbox_with_tag text not null,
  tag text,
  from_address text not null,
  to_address text not null,
  subject text,
  received_at timestamp with time zone not null,
  headers jsonb not null,
  html_content text,
  text_content text,
  created_at timestamp with time zone not null default now()
);

create unique index inbox_messages_unique_external_id
  on public.inbox_messages(external_id);
create index idx_inbox_messages_team_id on public.inbox_messages(team_id);
create index idx_inbox_messages_mailbox_id on public.inbox_messages(mailbox_id);
create index idx_inbox_messages_received_at on public.inbox_messages(received_at);

alter table public.inbox_messages enable row level security;

create policy select_inbox_settings_for_team_members
on public.team_inbox_settings
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = team_inbox_settings.team_id
      and tm.user_id = auth.uid()
  )
);

create policy manage_inbox_settings_for_team_owners
on public.team_inbox_settings
for all
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = team_inbox_settings.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = team_inbox_settings.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);

create policy select_mailboxes_for_team_members
on public.inbox_mailboxes
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = inbox_mailboxes.team_id
      and tm.user_id = auth.uid()
  )
);

create policy manage_mailboxes_for_team_owners
on public.inbox_mailboxes
for all
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = inbox_mailboxes.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = inbox_mailboxes.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);

create policy select_messages_for_team_members
on public.inbox_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.team_memberships tm
    where tm.team_id = inbox_messages.team_id
      and tm.user_id = auth.uid()
  )
);
