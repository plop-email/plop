-- Users

create table public.users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint fk_auth_user foreign key (id) references auth.users(id) on delete cascade
);

alter table public.users enable row level security;

create trigger users_updated_at
before update on public.users
for each row
execute function public.update_updated_at();

create policy select_own_profile on public.users
for select using (auth.uid() = id);

create policy update_own_profile on public.users
for update using (auth.uid() = id);

