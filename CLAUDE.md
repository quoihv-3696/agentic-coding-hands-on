@AGENTS.md

# Project: SAA 2025 (`saa-agentic-coding`)

Web app for **Sun\* Annual Awards 2025**. Auth-gated; public entry is the Google-login page.

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 16.2.7** (App Router) | Turbopack; **React Compiler enabled** (`reactCompiler: true`) |
| UI | **React 19.2** | Server Components by default; `"use client"` only when hooks/interactivity needed |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | Config lives in `src/app/globals.css`. **No `tailwind.config.js`**. shadcn config: `components.json`; `cn()` helper: `src/lib/utils.ts`; generated components: `src/components/ui/`. globals.css has a **2-layer token system, dark-first**: Layer 1 = SAA brand primitives (`--primary` gold `#FFEA9E`, `--secondary` navy `#00101A`, etc.); Layer 2 = shadcn semantic tokens pointing to brand primitives. Base theme is dark (navy). |
| Language | **TypeScript** (strict) | Path alias `@/*` → `src/*` |
| Auth/DB | **Supabase** via **`@supabase/ssr`** | Local dev via Supabase CLI + Docker (OrbStack) |
| i18n | Custom cookie-based VN/EN | No library, no locale URL routing |
| Package manager | **npm** | scripts: `dev`, `build`, `start`, `lint` |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # async root layout: reads locale, wraps <I18nProvider>, sets <html lang>
│   ├── globals.css             # Tailwind v4 entry + 2-layer token system
│   ├── (site)/                 # route group: public marketing routes sharing one layout (URLs unchanged)
│   │   ├── layout.tsx          # getUser() once → renders the shared <SiteHeader> over its children
│   │   ├── page.tsx            # / (public auth-aware homepage)
│   │   ├── _components/        # route-private: site-header, account-menu, homepage shell + hero/root-further/awards sections
│   │   ├── awards/page.tsx     # /awards stub
│   │   └── kudos/page.tsx      # /kudos stub
│   ├── login/                  # /login route + _components (header, hero, footer, google-button)
│   ├── countdown/page.tsx      # /countdown (standalone — outside (site), no site header)
│   └── auth/callback/route.ts  # OAuth code exchange; popup posts message to opener + closes
├── proxy.ts                    # Next 16 proxy: session refresh + route guard (replaces middleware)
├── components/                 # SHARED across ≥2 routes only
│   ├── ui/                     # shadcn/ui generated components (cherry-picked)
│   ├── countdown/              # shared countdown UI (logic lives in lib/countdown)
│   ├── button.tsx, dropdown.tsx # composed primitives layered over ui/
│   ├── language-switcher.tsx   # shared VN/EN switcher (used by login + site headers)
│   ├── coming-soon.tsx         # shared stub-page placeholder
│   └── flags.tsx, icons.tsx    # shared presentational
└── lib/
    ├── supabase/               # client (browser), server (async cookies), update-session (proxy helper)
    ├── auth/                   # sign-in-with-google (popup flow)
    ├── i18n/                   # config, get-locale (server), i18n-context (client), messages/{vi,en}.json
    ├── awards/                 # categories.ts (canonical slugs + award href builder)
    ├── countdown/              # countdown logic (parse env datetime, useCountdown, format) + tests
    └── utils.ts                # cn() helper (clsx + tailwind-merge)
supabase/config.toml           # local Supabase config (Google provider; edge_runtime disabled)
```

## Auth Model

- **Google OAuth, popup flow:** `signInWithOAuth({ skipBrowserRedirect:true })` → `window.open` → `/auth/callback` exchanges the code, `postMessage`s the opener, and closes.
- **Sessions** are cookie-based (`@supabase/ssr`); refreshed on every request in `src/proxy.ts`.
- **Route guard:** public = `/login`, `/auth/callback`; everything else requires a session (unauth → `/login`, auth on `/login` → `/`).
- Always use `supabase.auth.getUser()` (validates the JWT) — **not** `getSession()`.

## i18n

- Locales `vi` (default) + `en`; persisted in the `saa-locale` cookie.
- Client: `useTranslations()` → `{ locale, setLocale, t }`. Server: `getLocale()`.
- Add strings to **both** `src/lib/i18n/messages/vi.json` and `en.json` (dotted keys, e.g. `login.button`).

## Conventions

- **File naming:** kebab-case. Keep files **< 200 lines**; split into focused components.
- Follow **YAGNI / KISS / DRY**. Match surrounding style.
- Markdown only under `plans/` and `docs/` (don't scatter `.md` files).
- **Interactive UI components** (dropdowns, dialogs, menus, toggles) — use a shadcn/ui primitive from `src/components/ui/` rather than rolling your own. Marketing/layout sections stay bespoke Tailwind.

### Component organization (colocation — IMPORTANT)

- **Where a component lives is decided by reuse scope:**
  - Used by **≥2 routes** → `src/components/` (cross-route shared). `ui/` = raw shadcn; composed primitives (`button`, `dropdown`) and shared features (`language-switcher`, `countdown/`, `coming-soon`, `flags`, `icons`) sit alongside it.
  - Private to **one route or route-group** → that route's **`_components/`** folder (leading underscore = Next.js private, non-routable). e.g. `app/(site)/_components/`, `app/login/_components/`.
- **No app-wide `common/` dumping ground.** "Shared" is not a single bucket — sort by `ui/` (shadcn) vs composed/shared vs route-private.
- **A component graduates** from `_components/` up to `src/components/` only when a 2nd route needs it — not pre-emptively (YAGNI).
- **Breaking a screen down:** one component per visual section, each in the route's `_components/`; keep each <200 lines. The page/shell composes them.
- **Feature split:** UI in `src/components/<feature>/`, its logic/hooks/types in `src/lib/<feature>/` (see `countdown`).
- **Route groups (`(group)/`)** share chrome (header, auth-derivation) via the group's `layout.tsx` across a set of routes without changing URLs. Derive per-route state (e.g. active nav) inside the shared component via `usePathname`, not props.

## Next.js 16 Gotchas (≠ training data — see AGENTS.md)

- The `middleware` file convention is **deprecated → use `proxy.ts`** (`export function proxy(req)`).
- `cookies()` and `headers()` are **async** — `await` them.
- Read `node_modules/next/dist/docs/` before using unfamiliar APIs; heed build deprecation warnings.

## Local Development

```bash
npm run dev            # Next.js on http://localhost:3000
npx supabase start     # local stack (needs Docker/OrbStack running)
                       #   API http://127.0.0.1:54321 · Studio http://127.0.0.1:54323
```

- **Docker:** this machine uses **OrbStack** — make sure it's running before `supabase start`.
- `edge_runtime` is **disabled** in `config.toml` (unused here; its jsr.io fetch can 403 and block startup).
- Local Supabase issues the **new key format** (`sb_publishable_*` / `sb_secret_*`), not legacy anon JWTs.
- **`.env.local`** (gitignored): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Template in `.env.example`.
- Google OAuth authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback`. After editing credentials, restart Supabase so GoTrue reloads them.
