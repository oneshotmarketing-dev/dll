-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0g (Zoom → Supabase recording pipeline)
-- Run AFTER phase0f.sql, in the Supabase SQL editor. Idempotent, all additive.
--
-- Most Zoom fields already exist from phase0b:
--   sessions.zoom_meeting_id, sessions.zoom_start_url
--   recordings.status ('processing'|'ready'|'unavailable'), .synced_at,
--   recordings.zoom_recording_id
-- This phase only adds what the automated transfer worker needs on top.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. recordings: transfer worker bookkeeping ────────────────────────────
-- transfer_started_at is a *claim* timestamp. We can't add a 'transferring'
-- status (the phase0b check constraint is processing|ready|unavailable), so the
-- cron worker claims a row by stamping this and only picks rows where it's null
-- or older than the stale window — that gives single-flight + automatic retry
-- of crashed transfers without touching the status enum.
alter table public.recordings add column if not exists transfer_started_at timestamptz;
-- Last failure reason, surfaced to admins for debugging a stuck transfer.
alter table public.recordings add column if not exists error text;

-- ─── 2. Idempotency: one recording row per Zoom recording ──────────────────
-- Zoom re-delivers recording.completed on retries; this makes the insert a
-- no-op instead of creating duplicates. Partial so legacy/manual rows (null
-- zoom_recording_id) are unaffected.
create unique index if not exists uq_recordings_zoom_recording_id
  on public.recordings(zoom_recording_id)
  where zoom_recording_id is not null;

-- ─── 3. Fast webhook lookup: session by Zoom meeting id ────────────────────
-- The webhook maps payload.object.id → sessions.zoom_meeting_id on every event.
create index if not exists idx_sessions_zoom_meeting_id
  on public.sessions(zoom_meeting_id);

-- Done. Next: the app-side pipeline (Zoom S2S client, admin schedule-create with
-- auto meeting, recording.completed webhook, and the transfer cron worker).
