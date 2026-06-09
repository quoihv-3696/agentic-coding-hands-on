import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Paths reachable without an authenticated session.
 * NOTE: `/awards` and `/kudos` are auth-gated (removed from this list) — only the
 * homepage, login, OAuth callback, and countdown are public.
 * `"/"` is matched exactly (the `startsWith("/" + "/")` branch is dead) — do not
 * treat it as a prefix that opens every route.
 */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/auth/callback",
  "/countdown",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Refreshes the Supabase session cookie on every request and enforces route access:
 * - unauthenticated + private route -> redirect to /login
 * - authenticated + /login         -> redirect to /
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Options are intentionally omitted here — this only updates the
          // in-flight request's cookie store so a later getAll() sees the
          // refreshed token. The response.cookies.set below carries the real
          // options (HttpOnly/SameSite/etc.) to the browser. Do not "fix" this.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() must run to refresh the session; do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const redirectWithCookies = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    const redirect = NextResponse.redirect(url);
    // Preserve any refreshed session cookies on the redirect response.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!user && !isPublic(pathname)) {
    return redirectWithCookies("/login");
  }
  if (user && pathname === "/login") {
    return redirectWithCookies("/");
  }

  return response;
}
