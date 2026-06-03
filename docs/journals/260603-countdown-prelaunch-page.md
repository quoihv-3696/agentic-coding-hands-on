# Countdown Prelaunch Page for SAA 2025

**Date**: 2026-06-03 10:25
**Severity**: Low
**Component**: Public Countdown Page, UI, Testing
**Status**: Shipped (PR #2)

## What Shipped

- Public `/countdown` page (added to route guard allowlist) with live Days/Hours/Minutes countdown to 2026-06-04T15:00:00+07:00
- Seven-segment digit display (Digital Numbers font) in frosted-glass cells: white→transparent gradient, pale-gold #FFEA9E border, backdrop-blur
- 3-layer composition: base #00101A → /countdown/bg.png Key Visual → 18deg cover gradient
- Countdown units (D/H/M) + labels localized (vi/en)
- Redirect to /login on completion
- **First test suite**: vitest + 25 unit tests (formatUnit, computeParts logic)
- Montserrat set as project's main font via next/font (both regular + digital-numbers WOFF)

## Key Decisions

1. **Main thread UI, not background agent**: Track A spawned an `implementer` background agent per MoMorph protocol; it hit the MCP permission wall (playwright interactive tools need approval). Lesson: design-to-code agents with MCP tooling must run in main thread or pre-grant permissions. Rebuilt UI in-session.

2. **Read design metadata, don't guess visuals**: Two visual values guessed from screenshot were wrong:
   - Font: eyeballed DSEG7 (incorrect) → design node metadata said "Digital Numbers" (correct)
   - Background: copied /login/bg.png as DRY shortcut → design has its own Key Visual (exported to /countdown/bg.png)
   
   **Lesson**: Always extract font names, colors, assets from MoMorph node metadata (list_frame_styles, get_media_files), never from the rendered screenshot.

3. **next/font over manual @font-face**: Switched both Montserrat + Digital Numbers to next/font, which auto-preloads + injects @font-face. Eliminated: manual @font-face rule, ReactDOM.preload hack, proxy.ts woff2 matcher.

4. **formatUnit clamps to max 99, 59 per unit**: Minutes/hours cap at 59, days unbounded (countdown can run for years). Extracted as pure function for easy testing.

## Gotchas & Lessons

### Background Agent Permission Wall
`implementer` subagent tried to call MoMorph MCP tools (get_frame, download_specs) with permission prompt. Agent framework doesn't handle interactive approval in background mode. Proposed a workaround: edit `.claude/settings.json` to pre-grant MCP permissions. **Lesson**: Interactive MCP tools + background execution = deadlock; keep design-to-code in foreground or pre-grant globally.

### Font FOUT Risk
Seven-segment display depends on Digital Numbers font. If WOFF doesn't load before render, falls back to serif (unreadable). Moved font preload to root layout. next/font auto-preloads so risk is minimal now. **Reviewer note**: acceptable trade-off given preload strategy.

### No Seconds in Display
Spec omits seconds; formatUnit only handles D/H/M. Countdown JS computes all units but display filters to D/H/M. Keeps design clean per screenId 8PJQswPZmU.

### Hardcoded Countdown Target
Target date (2026-06-04T15:00:00+07:00) in config.ts. Should be env-based for post-launch changes. Acceptable for prelaunch; note as tech debt.

## Reviewer Feedback (8.5/10)

- Font FOUT acceptable (preloaded)
- a11y: aria labels missing on digit cells (deferred; countdown is visual candy, not critical content)
- Sub-minute display (seconds omitted per design): acceptable
- Gradient composition + glass effect visually accurate

Concerns marked as non-blocking.

## Test Coverage

- `formatUnit`: clamp, format, edge cases (0, 59, 99, overflow)
- `computeParts`: decompose ms into D/H/M/S, verify subtraction chain
- 25 tests total, all passing

vitest introduced (first test runner for project). `npm test` script now available.

## Follow-Ups

- Hardcoded countdown target → env-based config (post-launch)
- a11y labels on digit cells (low priority; visual feature)
- Monitor WOFF load performance in production

## Session Stats

- Commits: 1 (43f213c: feat/countdown-prelaunch-page)
- Duration: UI implementation (background fail + main-thread rebuild) → testing (vitest setup + 25 tests) → review (8.5/10)
- Files created: 7 (countdown page + components + tests + fonts + vitest config)
- Files edited: 5 (layout, globals, i18n, package.json, route guard)
- Blockers resolved: Background agent permission wall → main-thread rebuild; design asset extraction (manual export of Key Visual)
