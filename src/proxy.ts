import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

// Next.js 16 renamed the `middleware` convention to `proxy`.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on all paths except Next internals and static asset files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
