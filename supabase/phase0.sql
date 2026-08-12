-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0 schema (student/tutor/admin portals)
-- Run once in the Supabase SQL editor. Idempotent: safe to re-run.
--
-- 10 tables: profiles · languages · courses · modules · lessons · resources ·
--            batches · enrollments · sessions · attendance · recordings
-- (auth.users is Supabase-managed — not created here.)
--
-- Model: one identity pool (auth.users) + profiles.role. RLS on every table,
-- keyed on auth.uid(). Supersedes the earlier profiles.sql.
--
-- Order matters: tables → indexes → functions → triggers → grants → RLS.
-- (SQL functions are validated at creation, so their tables must exist first.)
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 1. Tables (created in foreign-key dependency order) ───────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'student' check (role in ('student','tutor','admin')),
  full_name  text,
  phone      text,
  country    text,
  timezone   text,
  avatar_url text,
  created_at timestamptz not null default now()
);
-- Bring an existing (starter) profiles table up to the Phase 0 shape.
alter table public.profiles add column if not exists phone      text;
alter table public.profiles add column if not exists country    text;
alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.languages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text unique not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  language_id  uuid not null references public.languages(id) on delete restrict,
  level        text check (level in ('A1','A2','B1','B2','C1','C2')),
  title        text not null,
  slug         text unique not null,
  summary      text,
  description  text,
  mode         text not null default 'live' check (mode in ('live','self_paced','both')),
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
  -- exam_id + course_prices are added by later-phase migrations (additive).
);

create table if not exists public.modules (
  id        uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title     text not null,
  position  int  not null default 0
);

create table if not exists public.lessons (
  id        uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title     text not null,
  summary   text,
  position  int  not null default 0
);

create table if not exists public.resources (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  type         text not null check (type in ('pdf','audio','video','interactive','link')),
  title        text not null,
  storage_path text,   -- path in the Supabase Storage 'resources' bucket
  url          text,   -- for type = 'link'
  duration     int,
  position     int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.batches (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete restrict,
  tutor_id      uuid references public.profiles(id) on delete set null,
  title         text not null,
  start_date    date,
  end_date      date,
  schedule_text text,
  timezone      text,
  seats_total   int,
  status        text not null default 'open' check (status in ('open','running','closed','full')),
  created_at    timestamptz not null default now()
);

create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete restrict,
  batch_id     uuid references public.batches(id) on delete set null,  -- null = self-paced
  mode         text not null default 'live' check (mode in ('live','self_paced')),
  status       text not null default 'active' check (status in ('active','completed','cancelled')),
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, course_id)
  -- order_id (→ orders) is added by the commerce-phase migration (additive).
);

create table if not exists public.sessions (
  id        uuid primary key default gen_random_uuid(),
  batch_id  uuid not null references public.batches(id) on delete cascade,
  title     text not null,
  starts_at timestamptz not null,
  ends_at   timestamptz,
  provider  text not null default 'zoom' check (provider in ('zoom','meet')),
  join_url  text,
  status    text not null default 'scheduled' check (status in ('scheduled','live','ended','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references public.sessions(id) on delete cascade,
  student_id          uuid not null references public.profiles(id) on delete cascade,
  status              text not null default 'absent' check (status in ('present','absent','late','excused')),
  joined_at           timestamptz,
  participation_score int,
  unique (session_id, student_id)
);

create table if not exists public.recordings (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions(id) on delete cascade,
  title          text not null,
  storage_path   text,   -- path in the Supabase Storage 'recordings' bucket
  duration       int,
  transcript_url text,
  is_published   boolean not null default false,
  recorded_at    timestamptz,
  created_at     timestamptz not null default now()
);


-- ─── 2. Indexes on foreign keys / hot lookups ──────────────────────────────
create index if not exists idx_courses_language   on public.courses(language_id);
create index if not exists idx_modules_course      on public.modules(course_id);
create index if not exists idx_lessons_module      on public.lessons(module_id);
create index if not exists idx_resources_lesson    on public.resources(lesson_id);
create index if not exists idx_batches_course      on public.batches(course_id);
create index if not exists idx_batches_tutor       on public.batches(tutor_id);
create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_enrollments_batch   on public.enrollments(batch_id);
create index if not exists idx_sessions_batch      on public.sessions(batch_id);
create index if not exists idx_sessions_starts_at  on public.sessions(starts_at);
create index if not exists idx_attendance_session  on public.attendance(session_id);
create index if not exists idx_attendance_student  on public.attendance(student_id);
create index if not exists idx_recordings_session  on public.recordings(session_id);


-- ─── 3. Role/access helper functions ───────────────────────────────────────
-- SECURITY DEFINER so they bypass RLS on the tables they read (prevents policy
-- recursion). STABLE + fixed search_path. Created after the tables they query.

create or replace function public.user_role()
returns text language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce(public.user_role() = 'admin', false)
$$;

create or replace function public.is_batch_tutor(b uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.batches x where x.id = b and x.tutor_id = auth.uid())
$$;

create or replace function public.is_enrolled_in_batch(b uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.enrollments e where e.batch_id = b and e.student_id = auth.uid())
$$;

-- A course is "accessible" to admins, its enrolled students, or a tutor who
-- runs a batch of it. Used to gate the curriculum/LMS tables.
create or replace function public.can_access_course(c uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.is_admin()
      or exists (select 1 from public.enrollments e where e.course_id = c and e.student_id = auth.uid())
      or exists (select 1 from public.batches b where b.course_id = c and b.tutor_id = auth.uid())
$$;

create or replace function public.teaches_course(c uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.batches b where b.course_id = c and b.tutor_id = auth.uid())
$$;


-- ─── 4. Triggers on profiles / auth.users ──────────────────────────────────

-- Auto-create a profile row for every new auth user (incl. admin-created).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A logged-in user can never escalate their own role; only admins (or the
-- server via the service-role key, where auth.uid() is null) may change it.
create or replace function public.enforce_role_immutable()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change a profile role';
  end if;
  return new;
end $$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.enforce_role_immutable();


-- ─── 5. Grants ─────────────────────────────────────────────────────────────
-- The project has "auto-expose new tables" OFF, so grants are explicit. RLS
-- (below) does the real row-level gating; these grants just make the tables
-- reachable by the API roles. anon gets nothing (portal is authenticated-only;
-- public course pages render server-side with the service role).
grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.profiles, public.languages, public.courses, public.modules,
  public.lessons, public.resources, public.batches, public.enrollments,
  public.sessions, public.attendance, public.recordings
to authenticated;

-- Server-side/admin operations (service-role key) bypass RLS but still need
-- the base grant.
grant all on all tables in schema public to service_role;


-- ─── 6. Row Level Security ─────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.languages   enable row level security;
alter table public.courses     enable row level security;
alter table public.modules     enable row level security;
alter table public.lessons     enable row level security;
alter table public.resources   enable row level security;
alter table public.batches     enable row level security;
alter table public.enrollments enable row level security;
alter table public.sessions    enable row level security;
alter table public.attendance  enable row level security;
alter table public.recordings  enable row level security;

-- profiles: read own, or admin all, or a tutor reading students in their batches.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.enrollments e
    join public.batches b on b.id = e.batch_id
    where e.student_id = public.profiles.id and b.tutor_id = auth.uid()
  )
);
-- Update own profile only (role changes are blocked by the trigger above).
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- Admins can update anyone (e.g. set roles).
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- languages: any authenticated user may browse; admins manage.
drop policy if exists languages_select on public.languages;
create policy languages_select on public.languages for select using (true);
drop policy if exists languages_write on public.languages;
create policy languages_write on public.languages for all
  using (public.is_admin()) with check (public.is_admin());

-- courses: published courses are visible to any authenticated user; a course's
-- tutor and admins see unpublished ones too. Admins manage.
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select using (
  is_published or public.is_admin() or public.teaches_course(id)
);
drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

-- modules / lessons / resources: readable to admins, the course tutor, and
-- enrolled students (students only see published resources). Writable by the
-- course tutor (uploads) and admins.
drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules for select
  using (public.can_access_course(course_id));
drop policy if exists modules_write on public.modules;
create policy modules_write on public.modules for all
  using (public.is_admin() or public.teaches_course(course_id))
  with check (public.is_admin() or public.teaches_course(course_id));

drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons for select using (
  exists (select 1 from public.modules m
          where m.id = public.lessons.module_id and public.can_access_course(m.course_id))
);
drop policy if exists lessons_write on public.lessons;
create policy lessons_write on public.lessons for all using (
  exists (select 1 from public.modules m
          where m.id = public.lessons.module_id
            and (public.is_admin() or public.teaches_course(m.course_id)))
) with check (
  exists (select 1 from public.modules m
          where m.id = public.lessons.module_id
            and (public.is_admin() or public.teaches_course(m.course_id)))
);

drop policy if exists resources_select on public.resources;
create policy resources_select on public.resources for select using (
  exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    where l.id = public.resources.lesson_id
      and ( public.is_admin()
            or public.teaches_course(m.course_id)
            or ( public.resources.is_published
                 and exists (select 1 from public.enrollments e
                             where e.course_id = m.course_id and e.student_id = auth.uid())) )
  )
);
drop policy if exists resources_write on public.resources;
create policy resources_write on public.resources for all using (
  exists (select 1 from public.lessons l
          join public.modules m on m.id = l.module_id
          where l.id = public.resources.lesson_id
            and (public.is_admin() or public.teaches_course(m.course_id)))
) with check (
  exists (select 1 from public.lessons l
          join public.modules m on m.id = l.module_id
          where l.id = public.resources.lesson_id
            and (public.is_admin() or public.teaches_course(m.course_id)))
);

-- batches: admin all; the assigned tutor; enrolled students. Only admins create.
drop policy if exists batches_select on public.batches;
create policy batches_select on public.batches for select using (
  public.is_admin() or tutor_id = auth.uid() or public.is_enrolled_in_batch(id)
);
drop policy if exists batches_write on public.batches;
create policy batches_write on public.batches for all
  using (public.is_admin()) with check (public.is_admin());

-- enrollments: student sees own; the batch tutor; admin. Only admins enrol.
drop policy if exists enrollments_select on public.enrollments;
create policy enrollments_select on public.enrollments for select using (
  student_id = auth.uid()
  or public.is_admin()
  or exists (select 1 from public.batches b
             where b.id = public.enrollments.batch_id and b.tutor_id = auth.uid())
);
drop policy if exists enrollments_write on public.enrollments;
create policy enrollments_write on public.enrollments for all
  using (public.is_admin()) with check (public.is_admin());

-- sessions: admin; batch tutor; enrolled students. Tutor (or admin) schedules.
drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions for select using (
  public.is_admin() or public.is_batch_tutor(batch_id) or public.is_enrolled_in_batch(batch_id)
);
drop policy if exists sessions_write on public.sessions;
create policy sessions_write on public.sessions for all
  using (public.is_admin() or public.is_batch_tutor(batch_id))
  with check (public.is_admin() or public.is_batch_tutor(batch_id));

-- attendance: student sees own; the batch tutor; admin. Tutor/admin marks it.
drop policy if exists attendance_select on public.attendance;
create policy attendance_select on public.attendance for select using (
  student_id = auth.uid()
  or public.is_admin()
  or exists (select 1 from public.sessions s join public.batches b on b.id = s.batch_id
             where s.id = public.attendance.session_id and b.tutor_id = auth.uid())
);
drop policy if exists attendance_write on public.attendance;
create policy attendance_write on public.attendance for all using (
  public.is_admin()
  or exists (select 1 from public.sessions s join public.batches b on b.id = s.batch_id
             where s.id = public.attendance.session_id and b.tutor_id = auth.uid())
) with check (
  public.is_admin()
  or exists (select 1 from public.sessions s join public.batches b on b.id = s.batch_id
             where s.id = public.attendance.session_id and b.tutor_id = auth.uid())
);

-- recordings: admin; batch tutor; enrolled students (published only). Tutor/admin manage.
drop policy if exists recordings_select on public.recordings;
create policy recordings_select on public.recordings for select using (
  exists (
    select 1 from public.sessions s join public.batches b on b.id = s.batch_id
    where s.id = public.recordings.session_id
      and ( public.is_admin()
            or b.tutor_id = auth.uid()
            or (public.recordings.is_published and public.is_enrolled_in_batch(b.id)) )
  )
);
drop policy if exists recordings_write on public.recordings;
create policy recordings_write on public.recordings for all using (
  exists (select 1 from public.sessions s join public.batches b on b.id = s.batch_id
          where s.id = public.recordings.session_id
            and (public.is_admin() or b.tutor_id = auth.uid()))
) with check (
  exists (select 1 from public.sessions s join public.batches b on b.id = s.batch_id
          where s.id = public.recordings.session_id
            and (public.is_admin() or b.tutor_id = auth.uid()))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done. Next: create Storage buckets 'resources' and 'recordings' (private),
-- and set the first admin:  update public.profiles set role='admin' where id='<uuid>';
-- ═══════════════════════════════════════════════════════════════════════════
