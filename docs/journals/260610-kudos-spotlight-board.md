# Kudos Spotlight Board

**Date**: 2026-06-10
**Severity**: High
**Component**: Kudos page, spotlight word-cloud, realtime, DB migration
**Status**: Shipped (140 tests pass; build/TS/lint clean)

## What Shipped

- **DB migration** (`supabase/migrations/20260610020000_add_kudos_spotlight.sql`):
  - `kudos_spotlight_recipients` view — one row per recipient with ≥1 active kudo. DISTINCT ON latest kudo + grouped count. `security_invoker = true`.
- **Data layer** (`src/lib/kudos/spotlight/`, all new):
  - `types.ts` — `SpotlightRecipient`, related query/layout types.
  - `queries.ts` — `getSpotlightRecipients()`, `getKudosTotalCount()`, `getRecentKudoEvents()`.
  - `layout.ts` — deterministic phyllotaxis word-cloud packing (font-size + position per recipient).
  - `normalize.ts` — recipient data normalization helpers.
  - `use-spotlight-search.ts` — client hook, accent-insensitive recipient search.
  - `use-spotlight-realtime.ts` — dedicated `"kudos-spotlight"` Supabase channel, INSERT-only listener, 500ms debounce before re-fetch.
  - `actions.ts` — server action to re-fetch spotlight data on demand.
- **UI** (`src/app/(site)/kudos/_components/spotlight/`, all new):
  - Pan/zoom canvas via `react-zoom-pan-pinch@^4.0.3`.
  - Label nodes, tooltip, search pill, controls, live ticker.
  - Replaces the `SpotlightPlaceholder` slot in `live-board.tsx`.
- **i18n** — `kudosSpotlight.*` keys added to both `vi.json` and `en.json`.
- **New dep**: `react-zoom-pan-pinch@^4.0.3`.

## Architecture

```
page.tsx (RSC, fetches getSpotlightRecipients + getKudosTotalCount + getRecentKudoEvents)
  → LiveBoard (client shell)
      └── SpotlightBoard (client)
            ├── react-zoom-pan-pinch canvas
            │     └── SpotlightLabelNode (per recipient, phyllotaxis position)
            │           └── SpotlightTooltip (on hover/tap)
            ├── SpotlightSearchPill (accent-insensitive filter)
            ├── SpotlightControls (zoom in/out/reset)
            └── SpotlightLiveTicker (recent events)

Realtime:
  use-spotlight-realtime → "kudos-spotlight" channel, INSERT filter only
    → 500ms debounce → server action re-fetch (never renders raw payload)
    → anonymous masking: ticker shows recipient only; sender identity not exposed
```

Phyllotaxis packing in `layout.ts` is deterministic (no randomness) — same recipients always produce the same layout, preventing layout thrash on re-fetch.

## Key Decisions

1. **Dedicated realtime channel, INSERT-only**: Separate from the main `LiveBoard` realtime subscription. Listens only to INSERT events (new kudos), not DELETE/UPDATE, to avoid noisy re-fetches from heart reactions. 500ms debounce batches rapid insertions.

2. **Anonymous masking preserved in ticker**: `getRecentKudoEvents()` fetches through the masked `kudos_feed` view. Raw realtime payloads are never rendered — same defense-in-depth as the main board.

3. **Phyllotaxis layout is deterministic**: Position and font-size are computed from stable fields (recipient id, kudo count). Re-fetching the same data produces the same layout — no flickering word-cloud.

4. **Replaces placeholder**: `spotlight-placeholder.tsx` (Plan 1 stub) is superseded. `live-board.tsx` now renders the live `SpotlightBoard` component in that slot.

## Follow-Ups

- OrbStack down during development — run `supabase db reset` + seed to runtime-verify the `kudos_spotlight_recipients` view.
- Plan 2: Secret Box gift economy (gift schema, box open flow, gift leaderboard) — still a stub.
- Add Playwright e2e for spotlight: search filtering, zoom controls, realtime ticker update.
