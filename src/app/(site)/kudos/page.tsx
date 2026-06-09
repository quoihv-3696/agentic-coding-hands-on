import { KudoFeed } from "./_components/kudo-feed";
import { getFeed } from "@/lib/kudos/queries";

/** Sun* Kudos feed page — renders the latest Kudos from Supabase. */
export default async function KudosPage() {
  const rows = await getFeed();

  return (
    <main className="min-h-screen bg-secondary px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 font-bold text-2xl text-primary tracking-wide uppercase">
          Sun* Kudos
        </h1>
        <KudoFeed rows={rows} />
      </div>
    </main>
  );
}
