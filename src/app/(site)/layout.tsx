import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "./_components/site-header";

/**
 * Shared layout for the public marketing routes (`/`, `/awards`, `/kudos`).
 * Derives auth state once via `getUser()` and renders the persistent site
 * header above every page; the header's active nav item tracks the pathname.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <>
      <SiteHeader authed={!!user} isAdmin={isAdmin} />
      {children}
      <Toaster />
    </>
  );
}
