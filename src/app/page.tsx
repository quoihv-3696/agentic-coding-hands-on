import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeView } from "./_components/home-view";

/** Protected home. Middleware also guards this; the check here is defense-in-depth. */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <HomeView email={user.email ?? ""} />;
}
