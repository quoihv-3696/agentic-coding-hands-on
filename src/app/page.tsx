import { createClient } from "@/lib/supabase/server";
import { Homepage } from "./_components/home/homepage";

/** Public SAA 2025 homepage. Reads the session only to drive the auth-aware header. */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Homepage authed={!!user} />;
}
