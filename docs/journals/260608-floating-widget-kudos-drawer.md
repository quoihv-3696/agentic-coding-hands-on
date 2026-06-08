# Floating Widget Redesign + Kudos Rules Drawer

**Date**: 2026-06-08
**Severity**: Low
**Component**: FloatingWidget, KudosRulesDrawer, Sheet primitive, i18n
**Status**: Shipped

## What Shipped

- **`src/app/(site)/_components/floating-widget.tsx`** — replaced placeholder with the designed FAB (bottom-right, home + awards pages). Collapsed = gold pill (pen `/` red lightning, per design `_hphd32jN2`); expands via `DropdownMenu` into two gold pills — "Thể lệ" (opens Kudos Rules drawer) and "Viết KUDOS" (intentionally inert for now) — with a red circular ✕ toggle. ✕/close use the project `CloseIcon` (no lucide-react).
- **`src/app/(site)/_components/kudos-rules-drawer.tsx`** + **`kudos-rules-content.tsx`** — rules drawer, 3 content sections, responsive (full-width mobile / 554px desktop).
- **`src/components/ui/sheet.tsx`** — first Sheet/Dialog primitive in the project, built on `@radix-ui/react-dialog`. Previously `src/components/ui/` held only `button`, `dropdown-menu`, `separator`.
- **`src/assets/images/kudos/`** — 6 collectible icons + 4 hero badge label images.
- **`src/assets/icons/thele-lightning.svg`** — new monochrome icon (imported via SVGR `?react`).
- **`src/lib/i18n/messages/{vi,en}.json`** — added `kudosRules.*` and `home.widget.*` key blocks; 120/120 key parity maintained.
- **New dependency**: `@radix-ui/react-dialog` (peer of the Sheet primitive).

## Architecture

`FloatingWidget` is a client component using the existing `DropdownMenu` pattern. On "Thể lệ" selection it sets local state to open `KudosRulesDrawer`, which wraps the new `Sheet` primitive. Drawer content (`KudosRulesContent`) is purely presentational and server-renderable; the open/close state lives in `FloatingWidget`.

Asset convention unchanged: images under `src/assets/images/` (import-based, Next.js `StaticImageData`); monochrome SVG icons under `src/assets/icons/` (SVGR `?react`, `white` → `currentColor`).

## Key Decisions

1. **Sheet over custom drawer**: First interactive overlay pattern beyond menus. Using the shadcn Sheet primitive keeps the overlay stack (focus trap, Escape close, portal, ARIA) consistent with the DropdownMenu approach — no bespoke implementation.

2. **`@radix-ui/react-dialog` as direct dependency**: Sheet is built on `@radix-ui/react-dialog`. Added as a direct dep rather than relying on the `radix-ui` meta-package (consistent with existing `@radix-ui/react-dropdown-menu` pattern).

3. **"Viết KUDOS" inert**: The pill is rendered but has no action — intentional placeholder. Avoids shipping a broken flow; will be wired when the Kudos submission route is built.

4. **FAB scope**: Widget renders on home + awards pages only (controlled by the `(site)` shell that already mounted it). No routing changes required.

## Gotchas

- Sheet/Dialog introduces a focus trap — ensure any future modal/overlay in the same route does not nest another `@radix-ui/react-dialog` tree (stacking portals can conflict).
- `KudosRulesContent` images use fixed dimensions from the Figma spec; verify on Safari/Firefox that `object-fit` behaves correctly on the badge labels (non-square aspect ratio).

## Follow-Ups

- Wire "Viết KUDOS" pill when `/kudos` submission flow is built.
- Add Playwright e2e covering: FAB opens dropdown → Thể lệ opens drawer → Escape closes → focus returns to FAB.
- Confirm final copy/prize values in `kudosRules.*` i18n keys with stakeholders.
