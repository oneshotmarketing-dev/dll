-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0b (student portal deltas)
-- Run AFTER phase0.sql, in the Supabase SQL editor. Idempotent, all additive.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. resources: per-session attachment + description ────────────────────
-- Materials group by the session they belong to (nullable in DB; required in
-- the admin upload form). description powers the card copy + client-side search.
alter table public.resources add column if not exists session_id  uuid references public.sessions(id) on delete set null;
alter table public.resources add column if not exists description text;
create index if not exists idx_resources_session on public.resources(session_id);

-- ─── 2. sessions: Zoom fields + optional "Today's topic" ───────────────────
alter table public.sessions add column if not exists zoom_meeting_id text;
alter table public.sessions add column if not exists zoom_start_url  text;  -- host start URL, server-only
alter table public.sessions add column if not exists topic           text;  -- optional per-session topic line

-- ─── 3. recordings: sync lifecycle status ──────────────────────────────────
-- The session state machine keys off this (processing → ready → unavailable),
-- not a manual publish flag.
alter table public.recordings add column if not exists status text not null default 'processing'
  check (status in ('processing','ready','unavailable'));
alter table public.recordings add column if not exists synced_at         timestamptz;
alter table public.recordings add column if not exists zoom_recording_id text;
create index if not exists idx_recordings_status on public.recordings(status);

-- Re-gate student visibility on status='ready' (was is_published). Tutors/admins
-- still see everything, including processing/unavailable.
drop policy if exists recordings_select on public.recordings;
create policy recordings_select on public.recordings for select using (
  exists (
    select 1 from public.sessions s join public.batches b on b.id = s.batch_id
    where s.id = public.recordings.session_id
      and ( public.is_admin()
            or b.tutor_id = auth.uid()
            or (public.recordings.status = 'ready' and public.is_enrolled_in_batch(b.id)) )
  )
);

-- ─── 4. New-badge tracking (per student) ───────────────────────────────────
create table if not exists public.recording_views (
  student_id       uuid not null references public.profiles(id)   on delete cascade,
  recording_id     uuid not null references public.recordings(id) on delete cascade,
  first_watched_at timestamptz not null default now(),
  primary key (student_id, recording_id)
);
create table if not exists public.resource_views (
  student_id      uuid not null references public.profiles(id)  on delete cascade,
  resource_id     uuid not null references public.resources(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  primary key (student_id, resource_id)
);

-- ─── 5. profiles: forced first-login password change flag ──────────────────
-- Default false so existing users (you) aren't locked out; the admin
-- "Add student" flow sets it true for new students.
alter table public.profiles add column if not exists must_change_password boolean not null default false;

-- ─── 6. Grants + RLS for the new view tables ───────────────────────────────
grant select, insert, update, delete on public.recording_views, public.resource_views to authenticated;
grant all on all tables in schema public to service_role;

alter table public.recording_views enable row level security;
alter table public.resource_views  enable row level security;

drop policy if exists recording_views_own on public.recording_views;
create policy recording_views_own on public.recording_views for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists resource_views_own on public.resource_views;
create policy resource_views_own on public.resource_views for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- Done. Also create a private Storage bucket 'avatars' (Change photo).
-- ═══════════════════════════════════════════════════════════════════════════
