-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0i (real "class started" detection)
-- Run AFTER phase0h.sql (or phase0g if 0h was skipped). Idempotent, additive.
--
-- Adds actual_start so a class can go "live" the moment the Zoom meeting really
-- starts (via the meeting.started webhook) or when the teacher taps "Start class
-- now" — instead of waiting for the scheduled starts_at. computeState honours it,
-- so attendance / End class appear as soon as the class actually begins.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.sessions
  add column if not exists actual_start timestamptz;

-- Done. Set on meeting.started (webhook) or /api/sessions/[id]/start (manual).
