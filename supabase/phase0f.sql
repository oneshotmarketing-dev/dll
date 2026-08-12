-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0f (tutor portal deltas)
-- Run AFTER phase0.sql/0b/0c/0d/0e, in the Supabase SQL editor. Additive + idempotent.
--
-- Tightens two write policies so the tutor portal's restrictions hold at the DB
-- layer, not just in the UI:
--   • Scheduling is admin-only (Deepa owns the calendar; tutors request via WhatsApp).
--   • Tutors may edit attendance only within 24h of a session ending; admin always.
-- ═══════════════════════════════════════════════════════════════════════════

-- sessions: only admins may create/edit/cancel sessions. Tutors keep read access
-- (sessions_select is unchanged) but can no longer write — even via a hand-made
-- API call.
drop policy if exists sessions_write on public.sessions;
create policy sessions_write on public.sessions for all
  using (public.is_admin())
  with check (public.is_admin());

-- attendance: admins always; the batch tutor only within 24h of the session's end
-- (falls back to starts_at if ends_at is null). After the window it's admin-only,
-- preventing silent rewrites of the historical record.
drop policy if exists attendance_write on public.attendance;
create policy attendance_write on public.attendance for all using (
  public.is_admin()
  or exists (
    select 1 from public.sessions s join public.batches b on b.id = s.batch_id
    where s.id = public.attendance.session_id
      and b.tutor_id = auth.uid()
      and coalesce(s.ends_at, s.starts_at) > now() - interval '24 hours'
  )
) with check (
  public.is_admin()
  or exists (
    select 1 from public.sessions s join public.batches b on b.id = s.batch_id
    where s.id = public.attendance.session_id
      and b.tutor_id = auth.uid()
      and coalesce(s.ends_at, s.starts_at) > now() - interval '24 hours'
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done.
-- ═══════════════════════════════════════════════════════════════════════════
