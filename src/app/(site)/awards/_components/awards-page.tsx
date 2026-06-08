import Image from "next/image";
import heroBg from "@/assets/images/home/hero-bg.png";
import rootFurtherLogo from "@/assets/images/login/logo.png";
import { KudosSection } from "../../_components/kudos-section";
import { SiteFooter } from "../../_components/site-footer";
import { FloatingWidget } from "../../_components/floating-widget";
import { AwardsTitle } from "./awards-title";
import { AwardNav } from "./award-nav";
import { AwardList } from "./award-list";

/**
 * Awards Information page shell.
 * Mirrors Homepage background pattern exactly:
 *   1. bg-secondary base (#00101A)
 *   2. Key Visual artwork pinned to top (heroBg, aspect preserved)
 *   3. Cover gradient layer above artwork
 *   4. Content z-10
 */
export function AwardsPage() {
  // overflow-x-clip (NOT overflow-hidden): clips horizontal bleed without
  // creating a scroll container, which would break the sticky AwardNav.
  return (
    <div className="relative min-h-screen overflow-x-clip bg-secondary">
      {/* Layer 2: Key Visual band — capped at 627px tall on this screen
          (shorter than the homepage artwork), cropped from the top. */}
      <Image
        src={heroBg}
        alt=""
        aria-hidden
        width={1512}
        height={1392}
        priority
        sizes="100vw"
        className="absolute inset-x-0 top-0 z-0 h-156.75 w-full object-cover object-center"
      />

      {/* Layer 3: Cover gradient — same 627px band, fades the KV into the page. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-1 h-156.75 w-full"
        style={{
          background:
            "linear-gradient(12deg, #00101A 23.7%, rgba(0,18,29,0.46) 38.34%, rgba(0,19,32,0) 48.92%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <main className="space-y-30 px-4 pb-24 pt-44 sm:px-8 lg:px-36">
          <div className="mx-auto max-w-306">
            <Image
              src={rootFurtherLogo}
              alt="Root Further Logo"
              width={338}
              height={150}
              priority
              className="h-auto w-[clamp(13rem,30vw,21.125rem)]"
            />
          </div>

          <AwardsTitle />

          <section className="mx-auto flex max-w-306 justify-between gap-20">
            <AwardNav />
            <div className="min-w-0 max-w-214 flex-1">
              <AwardList />
            </div>
          </section>

          <KudosSection />
        </main>

        <SiteFooter />
      </div>

      {/* Floating widget — fixed position, renders above all content */}
      <FloatingWidget />
    </div>
  );
}
