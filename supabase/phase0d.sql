-- ═══════════════════════════════════════════════════════════════════════════
-- Dees Language Lounge — Phase 0d (admin portal)
-- Run AFTER phase0.sql/0b/0c, in the SQL editor. Additive + idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- profiles: denormalized email (for admin lists/search) + active/inactive status
-- (soft deactivation — blocks access, preserves data; the enterprise standard).
alter table public.profiles add column if not exists email  text;
alter table public.profiles add column if not exists status text not null default 'active'
  check (status in ('active','inactive'));

-- Backfill email from auth.users for any existing profiles.
update public.profiles p
  set email = u.email
  from auth.users u
  where u.id = p.id and p.email is null;

-- Capture email on new-user creation too.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done.
-- ═══════════════════════════════════════════════════════════════════════════
