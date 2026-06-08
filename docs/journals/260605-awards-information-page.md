# Awards Information Page (`/awards`)

**Date**: 2026-06-05
**Severity**: Low
**Component**: Awards route, AwardCard, AwardNav, AWARD_DETAILS, i18n
**Status**: Shipped

## What Shipped

- `/awards` route promoted from `ComingSoon` stub to full Awards Information page.
- `src/app/(site)/awards/_components/`: five new components — `awards-page.tsx` (shell), `awards-title.tsx`, `award-nav.tsx` (sticky scroll-spy nav), `award-list.tsx`, `award-card.tsx` (reusable card).
- `src/lib/awards/award-details.ts` — `AWARD_DETAILS` record keyed by `AWARD_CATEGORIES` slug; each entry carries quantity, unit, long-description i18n key, and prize array.
- `src/lib/awards/award-details.test.ts` — unit tests for `AWARD_DETAILS` shape.
- `src/lib/i18n/messages/{vi,en}.json` — new `awardsPage` block (headings, units, prize values, long descriptions VN+EN).
- `src/components/icons.tsx` — added `TargetIcon`, `DiamondIcon`, `LicenseIcon` (SVG → `?react`).
- `vitest.config.ts` — added `@/*` → `src/*` path alias so tests resolve `@/` imports.

## Architecture

The page reuses the Homepage background shell verbatim (bg-secondary base, `heroBg` Key Visual pinned top, 12deg cover gradient) so brand consistency requires zero extra assets.

Layout: `AwardsTitle` header → two-column section (sticky `AwardNav` + scrollable `AwardList`) → reused `KudosSection` + `SiteFooter` + `FloatingWidget`.

`AwardNav` is a client component: `IntersectionObserver` drives active state; a scroll-to-bottom fallback forces the last section (MVP) active when the observer's `-60%` bottom margin prevents it from firing. Clicks smooth-scroll respecting `prefers-reduced-motion`.

`AwardCard` alternates image side (`imageSide: "left" | "right"`) via `lg:flex-row-reverse`. Signature 2025 - Creator renders two prize rows separated by an "or" divider — the only card with `prizes.length > 1`.

Data flow: `AwardList` zips `AWARD_CATEGORIES` (slug + title key) with `AWARD_DETAILS` (quantity + prize + desc keys) and resolves trophy `StaticImageData` from a local slug→image map. No backend; entirely static.

## Key Decisions

1. **Data split: `categories.ts` vs `award-details.ts`**: Homepage award cards only need slug/title/short-desc (`AWARD_CATEGORIES`). Detail data (quantity, prizes, long copy) lives separately in `AWARD_DETAILS` so the homepage import stays lean.

2. **Reuse existing trophy assets**: Trophy images already imported in `awards-section.tsx` on the homepage. `award-list.tsx` duplicates the slug→image map rather than exporting it from a shared location — acceptable duplication (YAGNI; only two consumers).

3. **Client boundary is minimal**: Only `AwardNav` (scroll-spy) and `AwardCard` (i18n hook) are `"use client"`. `AwardsPage`, `AwardList`, and `AwardsTitle` are Server Components.

4. **`vitest.config.ts` alias**: Tests referencing `@/lib/awards/categories` failed without the alias. Added `resolve.alias` mirroring `tsconfig.json`'s `@/*` path map — no other test infrastructure changes.

## Gotchas

- **MVP scroll-spy fallback**: With `rootMargin: "-96px 0px -60% 0px"`, the last section is never tall enough to cross the observer threshold. Explicit `scroll` listener fires when `scrollY + innerHeight >= scrollHeight - 2` to force `active = "mvp"`.
- **Separator import**: `AwardCard` uses `@/components/ui/separator` (shadcn). Ensure it stays in `src/components/ui/` — do not move it to a route-private `_components/`.

## Follow-Ups

- Prize values are hardcoded strings in i18n JSON; update when final values are confirmed.
- `AwardCard` long-description uses inline `style` for Montserrat font properties — migrate to a Tailwind utility class once the design token for body copy is finalized.
- a11y: `AwardCard` trophy images use `alt="" aria-hidden` (decorative); verify with stakeholders whether images require descriptive alt text.
