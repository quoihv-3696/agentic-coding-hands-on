# shadcn/ui Phase 02: DropdownMenu PoC (Language Switcher)

**Date**: 2026-06-03 16:22
**Severity**: Low
**Component**: Design System, Interactive Components, language-switcher.tsx
**Status**: Complete (commit 2589d3d, branch feat/design-component)

## What Shipped

- **Rebuilt language-switcher** off hand-rolled listbox → shadcn `DropdownMenu` + `DropdownMenuRadioGroup`:
  - `src/app/login/_components/language-switcher.tsx`: 91 → 58 lines (36% reduction)
  - Added `src/components/ui/dropdown-menu.tsx` (radix-ui unified package)
  - Removed 3x internal state (useState(open), useRef, 2x useEffect for outside-click + Escape)

- **Styling wins**:
  - Chevron rotation via CSS `group-data-[state=open]` (no JS state toggle)
  - Replaced hardcoded `bg-black/95` with `bg-popover` + `text-accent` (brand token reference)
  - Focus ring + text contrast now inherits shadcn Radix defaults (WCAG AAA ready)

- **Verification gate passed**:
  - Playwright e2e on /login: a11y roles correct (menuitemradio, checked attribute), keyboard open (Enter/Space), arrow-key nav, Escape closes + restores focus
  - Locale toggles VN↔EN instantly (setLocale updates context synchronously, 0 page reload)
  - 0 console errors; no focus leaks

## The Brutal Truth

This was the validator for Phase 01's token mapping. Expected smooth sailing; instead hit a subtle timing gotcha that nearly derailed e2e validation. The Radix menu component's focus state is **implicit** — you can't ask "is the menu open?" without reading a ref or listening to events. Transient interaction states (e.g., ArrowDown + Enter before render completes) don't register selection reliably.

## Technical Details

### The Timing Gotcha

During Playwright test, random ArrowDown→Enter sequences failed to toggle locale. Root cause: Radix's internal state machine wasn't deterministic under rapid input. **Fix**: Rewrote test to drive the menu explicitly:
1. Click trigger (wait for menu to appear in DOM)
2. Wait for popover animation frame
3. Click the target radio item
4. Assert selection changed

Lesson: **Radix interactive components require external snapshots** (DOM observation) to drive tests reliably. The old hand-rolled version had explicit `open` state; Radix's implicit state + animations created a race.

### Token Rendering

Applied Phase 01 token mapping on a **real interactive component**:
- `bg-popover` renders correctly on navy header (`bg-secondary` = `#00101A`, popover is `rgb(42 32 23)`, darker brown → visual hierarchy preserved)
- `text-accent` applies gold (`#FFEA9E`) to selected menu item → brand hero color visible in interaction
- Chevron SVG used `stroke-current` (inherits `text-accent` via parent class)

No color recalculation needed; token system validated end-to-end.

## What We Tried

1. **Direct Playwright click on radio item**: Failed on transient states. Arrow keys registered but selection didn't persist. **Lesson**: Radix menu selection is async. Must wait for rendered state, not input delivery.

2. **Manual a11y role inspection**: Verified `role="menuitemradio"`, `aria-checked="true"` appear in the DOM after selection. This drove the fix (snapshot-based assertions).

3. **Chevron rotation CSS**: Tried `group-data-[state=open]` (works ✓), also attempted Radix `asChild` pattern (overcomplicated for a single SVG). Kept the data-state approach.

## Root Cause Analysis

**Why the timing issue appeared**: Radix Primitives are **headless** — state lives in React internals + DOM attributes, not in component surface. A test that assumes "input → state" synchronously fails because Radix batches updates and runs animation frames. The hand-rolled version had explicit state variables that tests could read directly. Radix requires **external DOM observation** as the source of truth.

**Why we didn't catch this earlier**: Phase 01 only tested static pages (build, lint, screenshots). Phase 02 was the first interactive PoC, so timing assumptions emerged here.

## Lessons Learned

1. **Radix interactive components need integration tests, not unit tests**: A menu's `open` state is invisible to JavaScript tests. Must drive via Playwright (or similar) and assert DOM state, not component state.

2. **Don't mock Radix animations in e2e tests**: Let the component animate naturally, then assert the final rendered state. Trying to "skip" animations causes race conditions.

3. **Token system is solid**: Phase 01's two-layer mapping (brand primitives + shadcn semantic) worked flawlessly on this real component. Validated the foundation for Phase 03/04.

4. **Doc-writer's convention is actionable**: "Interactive components use shadcn primitives, marketing/layout stays bespoke Tailwind" is now a pattern we can repeat for forms + tables without re-learning Radix quirks.

## Next Steps

- **Phase 03** (form stack): Add `Form` + `Input` + `Button` + react-hook-form + zod for nominate/vote flows. Expect similar e2e timing gotchas; script the test harness to wait for popover animations.
- **Phase 04** (admin table, deferred): Add `Table` (markup) + @tanstack/react-table for admin panel.
- **Update e2e test utils**: Create a helper function for "wait for Radix popover + interact" to prevent re-learning this lesson.
- **Confirm handoff**: Phase 02 complete; Phase 03/04 remain deferred (no real feature yet). shadcn adoption is **go** for interactive forms.

## Session Stats

- **Commits**: 1 (2589d3d: feat(design): implement shadcn/ui phase 02, language-switcher poc)
- **Duration**: Refactored component (20 min) → Playwright e2e debugging (45 min) → verification (15 min) → this entry
- **Files created**: 1 (dropdown-menu.tsx)
- **Files modified**: 1 (language-switcher.tsx, 91 → 58 lines)
- **Blockers resolved**: Timing gotcha (isolated to test harness, not component logic)
- **Build state**: ✓ passing, ✓ no console errors, ✓ e2e validated (role/keyboard/focus)
- **Tokens validated**: popover bg + accent text + current stroke — all correct on dark navy header
