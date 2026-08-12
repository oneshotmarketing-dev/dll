-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0c
-- Lets a student read the profile (name) of the tutor(s) who teach the batches
-- they're enrolled in — needed to show "Trainer: Kavita" across the portal.
-- Additive: just widens the profiles SELECT policy. Run in the SQL editor.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  -- a tutor sees the students in their batches
  or exists (
    select 1 from public.enrollments e
    join public.batches b on b.id = e.batch_id
    where e.student_id = public.profiles.id and b.tutor_id = auth.uid()
  )
  -- a student sees the tutors of batches they're enrolled in
  or exists (
    select 1 from public.batches b
    join public.enrollments e on e.batch_id = b.id
    where b.tutor_id = public.profiles.id and e.student_id = auth.uid()
  )
);
