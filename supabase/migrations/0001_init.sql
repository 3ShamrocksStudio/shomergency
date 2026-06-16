-- SHOMER / Shomergency — backend schema
-- Real multi-user safety: profiles, reports, live SOS events, guardian
-- responses, and web-push subscriptions. Row-Level Security on every table.
--
-- Auth model: devices sign in ANONYMOUSLY (no friction, matches the app's
-- "any phone number" onboarding). Each device gets a stable auth.uid().
-- A profile row optionally carries the name/phone the user typed.

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: owner reads own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles: owner upserts own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: owner updates own"
  on public.profiles for update using (auth.uid() = id);

-- ───────────────────────── reports ──────────────────────────
-- Community incident reports shown on the shared safety map.
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('viol','stalk','sex','med','drug','theft')),
  description  text not null check (char_length(description) <= 500),
  lat          double precision,
  lng          double precision,
  anon         boolean not null default false,
  photo_count  int not null default 0,
  status       text not null default 'active' check (status in ('active','resolved','caution')),
  created_at   timestamptz not null default now()
);
alter table public.reports enable row level security;

-- A public safety map: any authenticated device may read reports.
create policy "reports: authenticated read all"
  on public.reports for select to authenticated using (true);
create policy "reports: owner inserts"
  on public.reports for insert to authenticated with check (auth.uid() = user_id);
create policy "reports: owner updates own"
  on public.reports for update to authenticated using (auth.uid() = user_id);

create index if not exists reports_created_idx on public.reports (created_at desc);
create index if not exists reports_geo_idx on public.reports (lat, lng);

-- ───────────────────────── sos_events ───────────────────────
create table if not exists public.sos_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lat         double precision,
  lng         double precision,
  trigger     text not null default 'manual' check (trigger in ('manual','shake','dms')),
  status      text not null default 'active' check (status in ('active','cancelled','resolved')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.sos_events enable row level security;

create policy "sos: authenticated read all"
  on public.sos_events for select to authenticated using (true);
create policy "sos: owner inserts"
  on public.sos_events for insert to authenticated with check (auth.uid() = user_id);
create policy "sos: owner updates own"
  on public.sos_events for update to authenticated using (auth.uid() = user_id);

create index if not exists sos_status_idx on public.sos_events (status, created_at desc);

-- ──────────────────── guardian_responses ────────────────────
-- A nearby guardian acknowledging / responding to a live SOS.
create table if not exists public.guardian_responses (
  id            uuid primary key default gen_random_uuid(),
  sos_id        uuid not null references public.sos_events(id) on delete cascade,
  responder_id  uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'responding' check (status in ('responding','arrived','stood_down')),
  created_at    timestamptz not null default now(),
  unique (sos_id, responder_id)
);
alter table public.guardian_responses enable row level security;

create policy "responses: authenticated read all"
  on public.guardian_responses for select to authenticated using (true);
create policy "responses: responder inserts own"
  on public.guardian_responses for insert to authenticated with check (auth.uid() = responder_id);
create policy "responses: responder updates own"
  on public.guardian_responses for update to authenticated using (auth.uid() = responder_id);

-- ──────────────────── push_subscriptions ────────────────────
-- Web-push endpoints, one or more per device/user. Owner-private.
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  lat         double precision,
  lng         double precision,
  updated_at  timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

create policy "push: owner reads own"
  on public.push_subscriptions for select to authenticated using (auth.uid() = user_id);
create policy "push: owner inserts own"
  on public.push_subscriptions for insert to authenticated with check (auth.uid() = user_id);
create policy "push: owner updates own"
  on public.push_subscriptions for update to authenticated using (auth.uid() = user_id);
create policy "push: owner deletes own"
  on public.push_subscriptions for delete to authenticated using (auth.uid() = user_id);

-- ──────────────────── realtime publication ──────────────────
-- Broadcast inserts/updates on reports + sos so every open app updates live.
alter publication supabase_realtime add table public.reports;
alter publication supabase_realtime add table public.sos_events;
alter publication supabase_realtime add table public.guardian_responses;
