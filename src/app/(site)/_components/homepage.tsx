import Image from "next/image";
import { HeroSection } from "./hero-section";
import { RootFurtherSection } from "./root-further-section";
import { AwardsSection } from "./awards-section";
import heroBg from "@/assets/images/home/hero-bg.png";

/**
 * Public SAA 2025 homepage.
 *
 * Background composition (per design):
 *   1. base page colour #00101A,
 *   2. the Key Visual artwork pinned to the top at its natural aspect ratio
 *      (not cover-cropped) — the page colour shows below it,
 *   3. a "Cover" gradient layer (its own 1512×1480 box) above the artwork.
 * The shared site header lives in the (site) layout and floats above all three.
 */
export function Homepage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#00101A]">
      {/* Layer 2: Key Visual at the top, aspect preserved. */}
      <Image
        src={heroBg}
        alt=""
        aria-hidden
        width={1512}
        height={1392}
        priority
        sizes="100vw"
        className="absolute inset-x-0 top-0 z-0 h-auto w-full"
      />
      {/* Layer 3: Cover gradient (design box 1512×1480, 12deg). */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-1 aspect-1512/1480 w-full"
        style={{
          background:
            "linear-gradient(12deg, #00101A 23.7%, rgba(0,18,29,0.46) 38.34%, rgba(0,19,32,0) 48.92%)",
        }}
      />

      {/* Content (the shared header is rendered by the (site) layout). */}
      <div className="relative z-10">
        <main>
          <HeroSection />
          <RootFurtherSection />
          <AwardsSection />
        </main>
      </div>
    </div>
  );
}
