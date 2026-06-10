# Kudos Live Board

**Date**: 2026-06-10
**Severity**: High
**Component**: Kudos page, hearts economy, stars, realtime, DB migrations
**Status**: Shipped (DB migrations runtime-unverified — OrbStack was down during implementation)

## What Shipped

- **DB migrations** (`supabase/migrations/`, 5 new files):
  - `20260610010000_add_profile_department.sql` — new `profiles.department` column (6-value CHECK constraint: `CEVC1/2/3/4`, `OPD`, `Infra`). Distinct from existing `dept_code` (team code, unchanged).
  - `20260610010100_add_hearts_economy.sql` — `hearts_awarded` table (FK → `kudo_reactions`), stores credits resolved at INSERT time; `special_days` table (date + multiplier, restricted to `authenticated`).
  - `20260610010200_self_heart_block_rls.sql` — RLS policy on `kudo_reactions` preventing a user from hearting their own kudo.
  - `20260610010300_heart_totals_and_stars.sql` — `profile_heart_totals` view (SUM of `hearts_awarded` per sender) and `recipient_star_count` view (star tier based on kudos received: 1★≥10 / 2★≥20 / 3★≥50); `security_invoker = true` on both.
  - `20260610010400_enable_realtime.sql` — realtime publication on `kudos` and `kudo_reactions` tables.
- **Data layer** (`src/lib/kudos/`, new/extended files):
  - `types.ts` — extended `KudoFeedRow` with `senderStarCount`, `recipientStarCount`, `heartTotal`; new `HighlightFilters`, `StatsSummary`, `LeaderboardEntry`, `DepartmentOption`.
  - `stars.ts` — `StarCount = 0|1|2|3` + `starCountFor(received)` (threshold logic).
  - `departments.ts` — canonical `DEPARTMENTS` list constant (`["CEVC1","CEVC2","CEVC3","CEVC4","OPD","Infra"]`).
  - `filters.ts` — `applyFeedFilters` shared utility (single source for Highlight + All Kudos filter logic).
  - `stats.ts` — `getStats()` (received/sent counts + heart total), `getTopKudosLeaderboard()`, `getPromotionLeaderboard()` (heuristic: most recent recipients, not a real rank-up log — see Gotchas).
  - `realtime.ts` — signal-only Supabase subscription; on change fires `router.refresh()` to re-fetch the masked `kudos_feed` view (never trusts raw payload to preserve anonymous masking).
  - `queries.ts` / `actions.ts` — extended: `getHighlight(filters)`, `getFeed(filters, cursor)` (keyset pagination), `toggleReaction` returns `heartsDelta` (actual credits granted, ×2 on special days in ICT timezone).
- **UI components** (`src/app/(site)/kudos/_components/`, all new):
  - `hero-banner.tsx` — hero section with tier badge + star badge + input pill.
  - `kudos-input-pill.tsx` — pill that opens the existing write form modal.
  - `highlight-carousel.tsx` — top-5 highlight cards with Embla carousel; remounts on filter change via React key.
  - `highlight-filters.tsx` — Hashtag + Department filter pills; active filter reflected in URL searchParams.
  - `highlight-card.tsx` — carousel card; renders `StarBadge` for both sender and recipient.
  - `kudo-card.tsx` / `kudo-card-header.tsx` / `kudo-feed.tsx` — All Kudos feed cards (note: star count display in `kudo-card-header.tsx` is missing per M-01 — see Gotchas).
  - `kudo-gallery.tsx` — image gallery with lightbox dialog.
  - `kudo-feed-infinite.tsx` — infinite scroll (keyset cursor, server action `loadFeedPage`).
  - `stats-sidebar.tsx` — Stats sidebar: kudos received/sent, hearts total, Secret Box stub (count = 0, coming-soon toast), two leaderboards.
  - `secret-box-stub.tsx` — coming-soon placeholder (Plan 2, no gift schema).
  - `spotlight-placeholder.tsx` — Spotlight Board placeholder (Plan 3).
  - `leaderboard.tsx` — rendered for both top-kudos and promotions leaderboards.
  - `star-badge.tsx` — reusable star count badge (`★ N`) placed alongside tier badge.
  - `live-board.tsx` — page shell; composes all sections; wires realtime subscription + filter URL state.
- **Tests** (`src/lib/kudos/stars.test.ts`) — 7 new unit tests for `starCountFor` thresholds. 100/100 tests pass total.
- **i18n** — live-board keys added to both `vi.json` and `en.json`. Known gap: `copyLinkToast` in `vi.json` is English string (cosmetic, tracked as M-04).

## Architecture

```
URL searchParams (hashtag, dept)
  → page.tsx (RSC, validates filters, fetches Hero stats + Highlight + Feed page-1 + Stats)
    → LiveBoard (client shell)
        ├── HeroBanner (tier + star badge + input pill)
        ├── HighlightFilters (updates URL → remounts carousel)
        ├── HighlightCarousel (top-5 by hearts for current filters)
        ├── KudoFeedInfinite (keyset cursor, loadFeedPage server action)
        └── StatsSidebar (stats + leaderboards + Secret Box stub)

Realtime:
  LiveBoard subscribes to kudos + kudo_reactions via Supabase channel
    → on INSERT/DELETE: router.refresh() → RSC re-fetches kudos_feed view
    → kudos_feed view NULLs sender fields for anonymous kudos (defense-in-depth)

Hearts economy:
  toggleReaction (Server Action)
    → check special_days for today (Asia/Ho_Chi_Minh)
    → INSERT kudo_reactions + INSERT hearts_awarded (delta = 1 or 2)
    → unlike: DELETE reaction → exact hearts_awarded delta looked up by SUM view → revoked
  profile_heart_totals view = SUM(hearts_awarded) per sender profile
  recipient_star_count view = CASE WHEN received ≥ 50 → 3 ... WHEN ≥ 10 → 1 ELSE 0
```

Filters drive both Highlight and All Kudos from a single URL searchParam source (`hashtag`, `department`). `applyFeedFilters` is the shared utility; selecting a filter resets the carousel to card 1 via React key remount.

## Key Decisions

1. **Hearts credit the sender, not the recipient**: "Số tim bạn nhận được" in the Stats sidebar = total hearts across all kudos the signed-in user *sent* (others heart those kudos). Resolved at INSERT into `hearts_awarded`; no triggers; exact revoke on unlike by SUM.

2. **Stars (hoa thị) added alongside unchanged Hero tiers**: 1★ ≥ 10 kudos received, 2★ ≥ 20, 3★ ≥ 50. Star badge is a separate UI element (`StarBadge`) placed next to the existing tier badge; Hero tier thresholds (new / rising / super / legend) are untouched.

3. **Realtime = signal-only re-fetch**: Never trust raw Supabase realtime payloads for kudos — they could expose sender identity in anonymous kudos before the view masks it. On any change, fire `router.refresh()` and re-fetch the masked `kudos_feed` view.

4. **`profiles.department` is a new higher-level column**: `dept_code` (e.g. "CEVC10", shown on cards) is unchanged. The new `department` column (`"CEVC1".."Infra"`) is what the filter operates on (recipient's division). These are different concepts with different cardinality.

5. **Special-day multiplier resolved at INSERT time, ICT timezone**: `current_date AT TIME ZONE 'Asia/Ho_Chi_Minh'` compared against `special_days`. The ×2 delta is stored in `hearts_awarded` so it survives even if the special-day window closes before an unlike.

6. **Secret Box + Spotlight + Profile pages are stubs**: No gift schema, no spotlight data model, no `/profile/[id]` route. These are Plans 2 and 3. Links exist; profile pages may 404.

## Gotchas

- **DB migrations not runtime-verified**: OrbStack was down during development. All 5 migrations were code-reviewed only. Run `supabase db reset` and seed before relying on DB behavior.
- **`getPromotionLeaderboard` is a heuristic**: Returns the most recent distinct recipients (not a real rank-up event log). The leaderboard title says "SỰ THĂNG HẠNG MỚI NHẤT" but shows recent recipients. No promotion event schema exists. Tracked as M-03.
- **Star count missing in All Kudos card header**: `kudo-card-header.tsx` renders the tier badge image but not `StarBadge`. `highlight-card.tsx` (carousel) does render stars correctly. Fix: add `recipientStarCount`/`senderStarCount` props to `kudo-card-header.tsx`. Tracked as M-01.
- **`copyLinkToast` in `vi.json` is English**: Low impact, tracked as M-04.
- **Filter searchParams not validated against canonical lists**: An arbitrary `?department=bad` string passes through to PostgREST (no SQL injection; returns zero rows). The active label in the UI will show the raw string. Validate against `DEPARTMENTS`/`KUDO_HASHTAGS` sets in `page.tsx`. Tracked as M-02.
- **Optimistic heart count uses ±1**: `kudo-card.tsx` optimistic update hardcodes `+1`/`-1`; the card's `reaction_count` is `count(reactions)` not `sum(hearts_awarded)`, so the optimistic delta is correct for the displayed count. However, `heartsDelta` returned by `toggleReaction` (for the sender's heart total) is never consumed in the optimistic path. No functional bug today; misleading code. Tracked as H-03.
- **Realtime `router.refresh()` has no debounce**: Each heart INSERT/DELETE triggers a full RSC re-fetch. Acceptable for current scale (annual event); add a 500 ms debounce before high-traffic usage.

## Follow-Ups

- Start OrbStack → `supabase db reset` → seed → manual test: give/revoke heart, self-heart block via RLS, filter by dept/hashtag, leaderboard aggregates.
- Fix M-01: add star count to `kudo-card-header.tsx`.
- Fix M-02: validate `sp.hashtag`/`sp.department` against canonical lists in `page.tsx`.
- Fix M-04: translate `copyLinkToast` in `vi.json`.
- Plan 2: Secret Box gift economy (gift schema, box open flow, gift leaderboard).
- Plan 3: Profile pages (`/profile/[id]`), Spotlight Board.
- Add debounce on realtime `router.refresh()` before production traffic.
- Add Playwright e2e: filter → carousel updates, heart toggle → count increments, anonymous kudo masking end-to-end.
