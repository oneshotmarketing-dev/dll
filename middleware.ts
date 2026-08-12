import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on each request so server
// components and route handlers see a valid session. It does NOT protect or
// gate any route — every existing page stays fully public. Route protection can
// be added later (e.g. redirect unauthenticated users away from /dashboard).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touching getUser() refreshes the session and rotates cookies as needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard the authenticated areas: unauthenticated users are sent to /login.
  // Marketing routes stay fully public. The must_change_password redirect to
  // /set-password is handled in the (portal) layout (needs a profile read).
  const path = request.nextUrl.pathname;
  // The admin login page is public — it must not be gated (else infinite loop).
  const isAdminLogin = path === "/admin/login";
  const protectedPrefixes = ["/student", "/admin", "/tutor", "/dashboard", "/set-password", "/change-password"];
  const isProtected = !isAdminLogin && protectedPrefixes.some((p) => path === p || path.startsWith(p + "/"));
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    // Admin area gets its own branded sign-in; everything else uses the portal login.
    url.pathname = path.startsWith("/admin") ? "/admin/login" : "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|csv|txt|xml|webmanifest)$).*)",
  ],
};
