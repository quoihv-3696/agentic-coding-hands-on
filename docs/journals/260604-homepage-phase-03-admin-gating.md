# Homepage Phase 03: Admin Gating (Presentation-Only)

**Date**: 2026-06-04
**Severity**: Low
**Component**: Homepage, SiteHeader, AccountMenu
**Status**: Partial — homepage feature not complete (Kudos, Footer, FloatingWidget pending)

## What Shipped

- `src/app/page.tsx` derives `isAdmin = user?.app_metadata?.role === "admin"` and threads it down: `Homepage → SiteHeader → AccountMenu`.
- `AccountMenu` shows a DISABLED "Admin Dashboard" stub item for admins; Profile item is a disabled stub for all users.
- Sign-out remains functional. No other behavior changes.
- Deleted orphan components `src/app/_components/home-view.tsx` and `src/app/_components/logout-button.tsx` (zero importers).
- Removed dead i18n keys `home.{title,greeting,loggedInAs}` from `vi.json` + `en.json`.
- Added `DashboardIcon` export to `src/components/icons.tsx`.

## Architectural Note: Presentation-Only Gate

The admin gate is intentionally **presentation-only**. `app_metadata.role` is read from the already-validated session (`getUser()`), so the value is trustworthy for UI rendering. However, no route protection or server-side authorization exists yet — those belong to the future `/admin` dashboard route.

Pattern used: derive role flag at the page/server boundary, pass down as a boolean prop. Avoids session re-reads in child components. When the dashboard route is built, add route-level authorization there; do not retrofit it into this component tree.
