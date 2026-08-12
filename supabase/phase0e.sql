-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0e (admin panel deltas)
-- Run AFTER phase0.sql/0b/0c/0d, in the Supabase SQL editor. Additive + idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- batches: allow 'completed' status. Marking a batch completed flips its active
-- enrollments to 'completed' (done in the admin API), which is what frees those
-- students to enrol in a later batch under the one-batch-per-student rule.
alter table public.batches drop constraint if exists batches_status_check;
alter table public.batches add constraint batches_status_check
  check (status in ('open','running','closed','full','completed'));

-- ═══════════════════════════════════════════════════════════════════════════
-- Done.
-- ═══════════════════════════════════════════════════════════════════════════
