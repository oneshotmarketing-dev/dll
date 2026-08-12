-- ─────────────────────────────────────────────────────────────
-- Dees Language Lounge — lead capture table
-- Run in the Supabase SQL editor (or via migration) before go-live.
-- Inserts happen server-side in /api/leads using the service role key,
-- so RLS stays ON with no public policies (no client writes).
-- ─────────────────────────────────────────────────────────────

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  type          text not null default 'assessment',   -- 'assessment' | 'newsletter' | 'contact'
  name          text,
  email         text,
  phone         text,
  language      text,                                  -- French | Spanish | German | IELTS
  goal          text,                                  -- Canada PR | Study abroad | Career | Travel
  preferred_time text,
  message       text,
  source_page   text,                                  -- e.g. /french-canada
  utm_source    text,
  utm_medium    text,
  utm_campaign  text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_type_idx on public.leads (type);

-- Enable Row Level Security. No policies = no anon/public access.
-- The service role key bypasses RLS and is used ONLY on the server.
alter table public.leads enable row level security;

-- Grant table privileges to the server-side service role. Required when the
-- project was created with "Automatically expose new tables" OFF (recommended
-- for security), because that skips the default grants for new tables. This
-- grants ONLY service_role — anon/public stay locked out (no client writes).
grant all privileges on table public.leads to service_role;
