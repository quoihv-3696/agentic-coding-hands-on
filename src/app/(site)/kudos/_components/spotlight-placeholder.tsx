/**
 * Spotlight Board placeholder (spec B.6/B.7). The interactive name word-cloud +
 * pan/zoom + live ticker is built in Plan 2 (kudos-spotlight-board). This reserves
 * the section in the page layout so the surrounding flow matches the design.
 */
export function SpotlightPlaceholder() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <p className="mb-2 text-center font-semibold text-primary/70 text-sm uppercase tracking-widest">
        Sun* Annual Awards 2025
      </p>
      <h2 className="mb-6 text-center font-bold text-3xl text-primary uppercase tracking-wide">
        Spotlight Board
      </h2>
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-primary/20 border-dashed bg-secondary/40 text-muted-foreground">
        Coming soon
      </div>
    </section>
  );
}
