# shadcn/ui Phase 01: Tailwind v4 Token System & Radix Init

**Date**: 2026-06-03 15:45
**Severity**: Medium
**Component**: Design System, Tailwind Token Layer, shadcn/ui Bootstrap
**Status**: Complete (commit 6a3ce28, branch feat/design-component)

## What Shipped

- **SAA brand color tokens** in `globals.css` (Tailwind v4 `@layer theme`):
  - Primary: gold `#FFEA9E` (brand hero color)
  - Secondary: navy `#00101A` (dark background)
  - Semantic tokens: container, error, + text layers (primary-1/2, secondary-1/2)
  - Token names trimmed: `--primary` not `--text-primary` (user design decision)

- **shadcn/ui bootstrap** via `init -p nova -b radix`:
  - `components.json` configuration (component alias, custom recipe paths)
  - Radix Primitives + shadcn Tailwind token mapping installed
  - Zero components imported yet (pristine state; only scaffold ready)

- **Verification gate passed**:
  - `npm run build` (9 routes, no errors)
  - `npm run lint` (src/ clean)
  - `npm test` (29/29 passing, no test breakage)
  - Playwright screenshots of /login, /countdown, / (all render correctly, 0 console errors, colors preserved)

## The Brutal Truth

The CLI init was a gotcha-laden surprise. It **overwrote brand colors** and **hijacked the font stack**. Spent 2 cycles diagnosing and restoring. The underlying issue: shadcn defaults assume a project with no existing Tailwind tokens; we had strong branding that needed to be the **base layer**.

## Technical Details

### Token Collision
`shadcn init` OVERWRITES `globals.css` with default oklch grays for `--primary`, `--secondary`, `--destructive`, etc. SAA's existing `--primary` (gold) got nuked by shadcn's `--primary` (oklch gray). **Fix**: Restored brand colors **before** semantic tokens, then remapped shadcn semantic tokens **onto** brand primitives in the same file.

Example token structure (now correct):
```css
:root {
  /* Layer 1: Brand primitives */
  --primary: #FFEA9E;
  --secondary: #00101A;
  --container: rgb(42 32 23);
  --error: #C12C2C;
  
  /* Layer 2: Semantic (shadcn + custom) */
  --primary-1: ... (derived from brand)
  --primary-2: ...
  
  /* Layer 3: shadcn system tokens mapped to Layer 1/2 */
  --background: var(--secondary);
  --foreground: var(--primary-1);
  /* etc */
}
```

### Font Hijack
`init` injected `import { Geist_Mono } from "next/font/google"` into root layout.tsx and bound it to `--font-sans`, overriding the project's **Montserrat** brand font. (Geist is the shadcn default template.) **Fix**: Deleted Geist import; project still uses Montserrat + Digital Numbers via `next/font`.

### Build Dependency
`@import "shadcn/tailwind.css"` in globals.css makes the `shadcn` package a **real build dependency** (not just devDep). If pruned or removed, build breaks. Kept in `package.json` (npm list shows it's resolved).

## What We Tried

1. **Ran init, didn't review diff immediately**: Learned the hard way (colorful failures in Playwright). **Lesson**: Always `git diff` after CLI tools modify config files.

2. **Manual token restoration**: Copied brand colors back into `:root`, then layer-mapped shadcn system tokens. Worked, but revealed the real problem: no clear protocol for "existing brand + new library." Documented in comments.

3. **Dark-mode strategy**: Chose **dark-first** (site is dark-only). Dark color values live directly in `:root` (no `.dark` media query toggle). shadcn Tailwind classes like `bg-background`, `text-foreground` now map cleanly to brand without extra selector nesting.

## Root Cause Analysis

**Why the collision happened**: shadcn init assumes a greenfield project and unconditionally writes default Tailwind v4 theme to globals.css, not merging with existing tokens. The project should have had a **pre-init checklist**:
- Back up globals.css
- Review shadcn defaults (token names, color philosophy)
- Plan 2-layer mapping (brand ← → shadcn system)
- Apply init, then **reconcile diffs** before any other work

We skipped that because the brainstorm said "cherry-pick" but didn't specify the token-bridge strategy.

## Lessons Learned

1. **Config-modifying CLI tools need pre-approval**: shadcn init, tailwind migrate, prisma setup — all touch critical files. Always review diffs immediately. Don't assume the tool knows your project's constraints.

2. **Token layering is non-obvious**: Two-layer token system (primitives + semantic) is invisible until a library tries to set its own semantic meanings. Document the mapping upfront.

3. **next/font is sticky**: Once a font is in `layout.tsx`, it's easy to forget it's there. Hijacked font is subtle (project still looks reasonable, just wrong identity). Consider a "design tokens checklist" in onboarding.

4. **Dark-first simplifies shadcn adoption**: No `.dark` toggle = no extra specificity rules. All token defaults can be dark values directly.

## Next Steps

- **Phase 02** (PoC language-switcher): Import `DropdownMenu` from shadcn, refactor language-switcher off hand-rolled listbox, validate a11y (arrow keys, focus trap).
- **Phase 03** (form stack, deferred): Add `Form` + `Input` + `Button` + integrate react-hook-form + zod for nominate/vote flows.
- **Phase 04** (admin table, deferred): Add `Table` (markup) + `@tanstack/react-table` (logic) for admin panel.
- **Document token maintenance**: Add section to `docs/code-standards.md` on "Maintaining Tailwind v4 Token Layers" for future contributors.

## Session Stats

- **Commits**: 1 (6a3ce28: feat(design): init shadcn/ui phase 01, establish brand token layer)
- **Duration**: Brainstorm (sealed) → planning (tkm:create-plan) → init + token reconciliation (2 cycles) + verification → writing this entry
- **Files created**: 3 (components.json, .shadcn/* config stubs, vitest + playwright baseline)
- **Files modified**: 2 (globals.css, layout.tsx font cleanup)
- **Blockers resolved**: Token collision (isolated & documented), font hijack (reverted), verified via tests/screenshots
- **Build state**: ✓ passing, ✓ no console errors, ✓ 29/29 tests, ✓ 3 e2e routes validated
