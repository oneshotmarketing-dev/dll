import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

// Exchanges the code from a Supabase email link (password recovery) for a
// session, then forwards to the `next` page (e.g. /reset-password). Sets the
// auth cookies via the server client.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No/invalid code — send them back to login with a hint.
  return NextResponse.redirect(`${origin}/login?error=reset_link`);
}
