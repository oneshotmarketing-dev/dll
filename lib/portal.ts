import { cache } from "react";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

export type Role = "student" | "tutor" | "admin";

export interface PortalUser {
  id: string;
  email: string | null;
  role: Role;
  fullName: string | null;
  timezone: string | null;
  avatarUrl: string | null;
  mustChangePassword: boolean;
}

// Module-level cache of signed avatar URLs, keyed by the stored bucket path.
// Signing hits Supabase Storage over the network; without this we'd re-sign on
// every single navigation for any user who has an avatar. We sign for 1h and
// reuse the URL for 50min, leaving a 10min buffer before it actually expires.
// Per-serverless-instance and self-trimming, so it can't grow unbounded.
const AVATAR_TTL_MS = 3600_000; // signed-URL lifetime
const AVATAR_REUSE_MS = 3000_000; // 50min — reuse window (buffer before expiry)
const avatarUrlCache = new Map<string, { url: string; signedAt: number }>();

async function signedAvatarUrl(path: string): Promise<string | null> {
  const now = Date.now();
  const hit = avatarUrlCache.get(path);
  if (hit && now - hit.signedAt < AVATAR_REUSE_MS) return hit.url;

  const svc = getServiceClient();
  const { data } = (await svc?.storage.from("avatars").createSignedUrl(path, AVATAR_TTL_MS / 1000)) ?? { data: null };
  const url = data?.signedUrl ?? null;
  if (url) {
    avatarUrlCache.set(path, { url, signedAt: now });
    // Drop entries that are past their reuse window so the map stays small.
    if (avatarUrlCache.size > 500) {
      for (const [k, v] of avatarUrlCache) {
        if (now - v.signedAt >= AVATAR_REUSE_MS) avatarUrlCache.delete(k);
      }
    }
  }
  return url;
}

// Server-side: the current authenticated user joined with their profile row.
// Returns null when there is no session. Use in portal layouts / server pages.
//
// Wrapped in React cache() so the layout and page of the SAME request share one
// execution instead of each doing its own getSession() + profiles + avatar-sign
// round-trips — a big per-navigation latency saving in the portals.
//
// Uses getSession() (a LOCAL JWT decode, no network) rather than getUser() (a
// round-trip to Supabase Auth on every navigation). Safe here because
// middleware.ts already calls getUser() on every request — it validates the
// token against Supabase, refreshes the cookie and bounces unauthenticated
// users before this layout/page ever renders. Repeating getUser() here would
// just be a second, redundant Auth round-trip per page switch.
export const getSessionUser = cache(async (): Promise<PortalUser | null> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, timezone, avatar_url, must_change_password")
    .eq("id", user.id)
    .single();

  // Security: a valid auth session with NO profile row is treated as logged out.
  // This prevents a deleted/deactivated account (its profile removed) from still
  // reaching the portals on the strength of a lingering session cookie — and
  // stops a profile-less session from silently defaulting into the student role.
  if (!profile) return null;

  // avatar_url stores a path in the private 'avatars' bucket — sign it for
  // display (cached, so we don't re-sign on every navigation).
  let avatarUrl: string | null = profile.avatar_url ?? null;
  if (avatarUrl && !avatarUrl.startsWith("http")) {
    avatarUrl = await signedAvatarUrl(avatarUrl);
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role as Role,
    fullName: profile.full_name ?? null,
    timezone: profile.timezone ?? null,
    avatarUrl,
    mustChangePassword: profile.must_change_password ?? false,
  };
});
