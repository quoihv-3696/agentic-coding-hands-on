import { notFound } from "next/navigation";
import { getKudoById } from "@/lib/kudos/queries";
import { KudoCard } from "../_components/kudo-card";

/** Single-Kudo permalink — the Copy Link target from the feed. */
export default async function KudoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kudo = await getKudoById(id);
  if (!kudo) notFound();

  return (
    <main className="min-h-screen bg-secondary px-4 pt-[180px] pb-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <KudoCard row={kudo} />
      </div>
    </main>
  );
}
