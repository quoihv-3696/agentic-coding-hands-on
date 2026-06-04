import Image from "next/image";
import { PrelaunchCountdown } from "@/components/countdown/prelaunch-countdown";
import countdownBg from "@/assets/images/countdown/bg.png";

/**
 * Public prelaunch countdown page. Three stacked layers per the design:
 *   1. base background colour (#00101A — the project's background colour)
 *   2. the countdown Key Visual artwork (/countdown/bg.png)
 *   3. a "Cover" gradient for text contrast
 * with the centered countdown timer on top.
 */
export default function CountdownPage() {
  return (
    // Layer 1: base background colour.
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Layer 2: the countdown Key Visual (next/image emits optimized,
         viewport-sized variants of the large source PNG). */}
      <Image
        src={countdownBg}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
      />

      {/* Layer 3: the design's "Cover" gradient (18deg) — #00101A solid ->
         #00121D @46% -> #001320 @0%, keeping the brightest artwork vivid. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)",
        }}
      />

      <main className="relative z-10 px-6">
        <PrelaunchCountdown />
      </main>
    </div>
  );
}
