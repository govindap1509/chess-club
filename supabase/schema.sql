-- ============================================================
-- Chess Club Management System — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PROFILES
-- Extends the built-in auth.users table; one row per member
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text,
  class         text,
  parent_phone  text,
  chess_profile_url text,
  chess_rating  integer check (chess_rating >= 0 and chess_rating <= 3000),
  profile_photo text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- 2. EVENTS
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  event_date  timestamptz not null,
  created_at  timestamptz default now() not null
);

-- 3. EVENT SIGNUPS
create table if not exists public.event_signups (
  event_id  uuid not null references public.events(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now() not null,
  primary key (event_id, user_id)
);

-- 4. MESSAGES
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     text not null,
  message     text not null,
  status      text not null default 'pending' check (status in ('pending', 'replied')),
  admin_reply text,
  replied_at  timestamptz,
  created_at  timestamptz default now() not null
);

-- 5. MATCH RESULTS
create table if not exists public.match_results (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references public.events(id) on delete set null,
  player1_id  uuid not null references auth.users(id) on delete cascade,
  player2_id  uuid not null references auth.users(id) on delete cascade,
  winner_id   uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now() not null
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_event_signups_user on public.event_signups(user_id);
create index if not exists idx_messages_user on public.messages(user_id);
create index if not exists idx_match_results_event on public.match_results(event_id);
create index if not exists idx_profiles_rating on public.profiles(chess_rating desc);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles     enable row level security;
alter table public.events        enable row level security;
alter table public.event_signups enable row level security;
alter table public.messages      enable row level security;
alter table public.match_results enable row level security;

-- PROFILES
-- Anyone authenticated can read profiles (for leaderboard, etc.)
create policy "profiles_read_all" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Only the owner can insert/update their profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- EVENTS
-- Everyone authenticated can view events
create policy "events_read_all" on public.events
  for select using (auth.role() = 'authenticated');

-- Only anon/admin service-role can insert (admin uses service-role key via Next.js server)
-- For simplicity, allow authenticated inserts (admin check is handled in the app layer)
create policy "events_insert_auth" on public.events
  for insert with check (auth.role() = 'authenticated');

create policy "events_delete_auth" on public.events
  for delete using (auth.role() = 'authenticated');

-- EVENT SIGNUPS
create policy "signups_read_all" on public.event_signups
  for select using (auth.role() = 'authenticated');

create policy "signups_insert_own" on public.event_signups
  for insert with check (user_id = auth.uid());

create policy "signups_delete_own" on public.event_signups
  for delete using (user_id = auth.uid());

-- MESSAGES
-- Students can only see their own messages; value to admin is handled in app layer
create policy "messages_read_own" on public.messages
  for select using (user_id = auth.uid() or auth.role() = 'service_role');

create policy "messages_insert_own" on public.messages
  for insert with check (user_id = auth.uid());

create policy "messages_update_admin" on public.messages
  for update using (auth.role() = 'authenticated');

-- MATCH RESULTS
create policy "results_read_all" on public.match_results
  for select using (auth.role() = 'authenticated');

create policy "results_insert_auth" on public.match_results
  for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET — profile-photos
-- Create via: Storage > New bucket > "profile-photos" (public)
-- Or run:
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('profile-photos', 'profile-photos', true)
  on conflict (id) do nothing;

create policy "profile_photos_read" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "profile_photos_upload" on storage.objects
  for insert with check (bucket_id = 'profile-photos' and auth.role() = 'authenticated');

create policy "profile_photos_update" on storage.objects
  for update using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- AUTO-UPDATE updated_at trigger for profiles
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
