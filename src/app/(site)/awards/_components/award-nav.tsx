"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { TargetIcon } from "@/components/icons";
import { AWARD_CATEGORIES } from "@/lib/awards/categories";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Sticky left navigation for the Awards Information page.
 * - 6 items from AWARD_CATEGORIES, each anchors to its card section.
 * - Active item = gold text + 1px gold bottom border.
 * - Scroll-spy via IntersectionObserver; rootMargin tuned for fixed header.
 * - Click: smooth-scroll (respects prefers-reduced-motion) + set active.
 * - Hidden below lg (cards stack full-width on mobile).
 */
export function AwardNav() {
  const { t } = useTranslations();
  const [active, setActive] = useState<string>(AWARD_CATEGORIES[0].slug);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );

    AWARD_CATEGORIES.forEach((c) => {
      const el = document.getElementById(c.slug);
      if (el) obs.observe(el);
    });

    // Fallback: the last section (MVP) can be too short to ever win the
    // observer's -60% bottom margin. When scrolled to the page bottom, force it.
    const lastSlug = AWARD_CATEGORIES[AWARD_CATEGORIES.length - 1].slug;
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        setActive(lastSlug);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, slug: string) {
    e.preventDefault();
    setActive(slug);
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  return (
    <nav
      aria-label="Award categories"
      className="sticky top-24 hidden w-44.5 shrink-0 self-start lg:block"
    >
      <ul className="flex flex-col gap-4">
        {AWARD_CATEGORIES.map((c) => {
          const isActive = active === c.slug;
          return (
            <li key={c.slug}>
              <a
                href={`#${c.slug}`}
                onClick={(e) => handleClick(e, c.slug)}
                className={[
                  "flex items-center gap-1 rounded px-4 py-4 text-sm font-bold leading-5 tracking-[0.25px] transition-colors duration-150",
                  isActive
                    ? "border-b border-primary text-primary [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]"
                    : "text-white hover:text-primary/80",
                ].join(" ")}
                aria-current={isActive ? "location" : undefined}
              >
                <TargetIcon
                  className={`size-6 shrink-0 ${isActive ? "text-primary" : "text-white"}`}
                  aria-hidden
                />
                <span>{t(c.titleKey)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
