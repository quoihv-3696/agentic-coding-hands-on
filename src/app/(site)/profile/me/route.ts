import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * `/profile/me` → redirect to the logged-in user's own `/profile/[id]`.
 * The proxy route guard already forces auth for everything outside `/login`
 * and `/auth/callback`, so an unauthenticated hit never reaches here; we still
 * fall back to `/login` defensively.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL(`/profile/${profile.id}`, request.url));
}
