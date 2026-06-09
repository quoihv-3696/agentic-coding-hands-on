# Kudos Write & Send

**Date**: 2026-06-09
**Severity**: High
**Component**: Kudos DB, data layer, form modal, feed, auth callback
**Status**: Shipped (open security items — see Unresolved)

## What Shipped

- **DB migrations** (`supabase/migrations/`): `profiles`, `kudos`, `kudo_reactions` tables with RLS; `kudos_feed` + `profile_hero_tier` views; `kudo-images` storage bucket; `link_profile_on_login()` RPC; `seed.sql` fixtures.
- **Data layer** (`src/lib/kudos/`): `types.ts`, `tiers.ts` (Hero tier thresholds: 0–4 new, 5–9 rising, 10–20 super, 21+ legend), `hashtags.ts` (8 canonical Sun\* slugs), `schema.ts`/`actions.ts` (Zod validation + Server Actions), `queries.ts`, `storage.ts`, `profile-link.ts`.
- **Write form** (`src/app/(site)/_components/kudos-form/`): modal dialog (shadcn Dialog), TipTap v3 rich-text editor with mention support (`@tiptap/*`, `tippy.js`), recipient search, hashtag picker, image uploader, anonymous toggle.
- **Feed** (`src/app/(site)/kudos/`): `/kudos` feed page (KUDO card grid), `/kudos/[id]` permalink, heart reaction toggle with optimistic UI.
- **Auth**: `/kudos` removed from `PUBLIC_PATHS` (auth-gated); `linkProfileOnLogin` called from `/auth/callback` to link Google identity to a `profiles` row on first login.
- **New dependencies**: `@tiptap/*`, `tippy.js`, `zod`, `isomorphic-dompurify`; shadcn primitives: `dialog`, `input`, `textarea`, `command`, `popover`, `avatar`, `checkbox` (all backed by `@radix-ui/react-*` direct deps).
- **Unit tests** (`src/lib/kudos/*.test.ts`): 41 new tests across tiers, hashtags, and Zod schema validation; 93 total passing.

## Architecture

```
User submits form
  → createKudoAction (Server Action)
    → Zod validation (schema.ts, non-"use server")
    → DOMPurify sanitize bodyHtml (server-side)
    → storage.ts: upload images → kudo-images bucket
    → queries.ts: INSERT into kudos (RLS: sender_profile_id resolved from profiles)
  → kudos_feed view (JOIN kudos + profiles)
    → feed page renders KUDO cards
    → profile_hero_tier view drives hero badge on card
```

`FloatingWidget` "Viết KUDOS" pill (previously inert, see `260608-floating-widget-kudos-drawer.md`) now opens the write form modal.

Client boundary: form modal + feed cards are `"use client"` (hooks, TipTap, optimistic state). Page shells and KUDO card are Server Components where possible.

## Key Decisions

1. **Zod schema in `schema.ts`, not `actions.ts`**: Exporting a non-async Zod object from a `"use server"` module is technically unsupported in RSC. Schema lives in a separate non-`"use server"` file so it can be imported safely by both the server action and tests.

2. **DOMPurify runs server-side**: `isomorphic-dompurify` sanitises `bodyHtml` inside the Server Action before any DB write. No client-side trust.

3. **Hero tier thresholds as shared constants**: `tiers.ts` (data layer) and the `profile_hero_tier` SQL view use the same thresholds (≤4 / ≤9 / ≤20). Unit tests verify parity.

4. **Optimistic reaction UI**: Heart toggle updates local state immediately; rolls back on error (`setHearted(!next)` + count reversal). Prevents double-fire via `pending` guard.

5. **`profiles` insert via RPC**: `linkProfileOnLogin` runs as a `security definer` RPC so the initial profile row can be created before the user's `auth_user_id` is set (avoids circular RLS dependency).

## Gotchas

- **`sender_profile_id` in anonymous kudos**: The `kudos_feed` view nulls `sender_display_name` / `sender_avatar_url` for anonymous kudos but was shipping `sender_profile_id` unconditionally, allowing identity resolution via the public `profiles` table. Fixed in post-review migration: `case when k.is_anonymous then null else k.sender_profile_id end`.
- **`profiles` UPDATE RLS**: Initial migration had no `for update` policy — Postgres fell back to SELECT's `using (true)`, making the table world-writable. A `profiles: self update` policy (`auth_user_id = auth.uid()`) was added. `linkProfileOnLogin` uses a service-role client path to handle first-login when `auth_user_id` is still NULL.
- **TipTap v3 + React 19**: TipTap v3 peer requires React ≥17; verified compatible with React 19.2 in this project.
- **Storage upload path**: Policy enforces `(storage.foldername(name))[1] = auth.uid()::text` so users can only upload under their own UID prefix.

## Follow-Ups

- Add `to authenticated` role restriction to `kudos` and `profiles` SELECT policies (H-3 from reviewer) — currently `anon` key can read via PostgREST directly.
- Add auth guard to `searchProfilesAction` to prevent pre-auth employee directory enumeration (H-2 from reviewer).
- Replace correlated subquery in `kudos_feed` view with JOIN to `profile_hero_tier` for feed performance (M-4 from reviewer).
- Force `rel="noopener noreferrer"` on `<a target="_blank">` in DOMPurify output (L-1 from reviewer).
- Add Playwright e2e: write → submit → feed render, reaction toggle persistence, anonymous sender masking.
