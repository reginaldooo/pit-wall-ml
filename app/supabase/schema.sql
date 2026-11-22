-- Pit Wall ML: run once in the Supabase SQL editor (Dashboard > SQL Editor > New query).
-- Auth settings: Authentication > Providers > Email: turn OFF "Confirm email" (usernames map to a private,
-- never-mailed address like name@pitwall-ml.app). Anyone can sign up, so keep the free-plan limits in mind.

-- ---------- profiles: the public username ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_-]{3,20}$'),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username) values (new.id, lower(new.raw_user_meta_data ->> 'username'));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- progress: one JSON document per user ----------
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint progress_size check (pg_column_size(data) < 32000),
  constraint progress_xp check (
    coalesce((data -> 'engine' ->> 'xp')::int, 0) between 0 and 1000000
    and coalesce((data -> 'math' ->> 'xp')::int, 0) between 0 and 1000000)
);

-- ---------- attempts: history of answers and arena runs ----------
create table if not exists public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  track text not null check (track in ('quiz', 'math', 'arena')),
  item_id text not null check (char_length(item_id) <= 40),
  correct boolean not null,
  level int not null check (level between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_time on public.attempts (user_id, created_at desc);

-- Keep the latest 2000 attempts per user so the free 500 MB database never fills up.
create or replace function public.prune_attempts() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.attempts
  where user_id = new.user_id
    and id < (select id from public.attempts where user_id = new.user_id order by id desc offset 2000 limit 1);
  return null;
end $$;

drop trigger if exists attempts_prune on public.attempts;
create trigger attempts_prune after insert on public.attempts
  for each row execute function public.prune_attempts();

-- ---------- Row Level Security: users see and change only their own rows ----------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.attempts enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));

drop policy if exists "own progress read" on public.progress;
drop policy if exists "own progress write" on public.progress;
create policy "own progress read" on public.progress for select to authenticated using (user_id = (select auth.uid()));
create policy "own progress write" on public.progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "own attempts read" on public.attempts;
drop policy if exists "own attempts insert" on public.attempts;
create policy "own attempts read" on public.attempts for select to authenticated using (user_id = (select auth.uid()));
create policy "own attempts insert" on public.attempts for insert to authenticated with check (user_id = (select auth.uid()));

-- ---------- leaderboard: only username and XP, only users who did not opt out ----------
create or replace function public.leaderboard() returns table (username text, xp int)
language sql stable security definer set search_path = public as $$
  select p.username,
         (coalesce((g.data -> 'engine' ->> 'xp')::int, 0) + coalesce((g.data -> 'math' ->> 'xp')::int, 0))::int as xp
  from public.progress g join public.profiles p on p.id = g.user_id
  where coalesce(g.data -> 'prefs' ->> 'optOut', 'false') <> 'true'
  order by xp desc, p.username asc
  limit 20
$$;
revoke all on function public.leaderboard() from public;
grant execute on function public.leaderboard() to anon, authenticated;
