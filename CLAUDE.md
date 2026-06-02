@AGENTS.md

# Project: SAA 2025 (`saa-agentic-coding`)

Web app for **Sun\* Annual Awards 2025**. Auth-gated; public entry is the Google-login page.

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 16.2.7** (App Router) | Turbopack; **React Compiler enabled** (`reactCompiler: true`) |
| UI | **React 19.2** | Server Components by default; `"use client"` only when hooks/interactivity needed |
| Styling | **Tailwind CSS v4** | Config lives in `src/app/globals.css` (`@import "tailwindcss"` + `@theme inline`). **No `tailwind.config.js`** |
| Language | **TypeScript** (strict) | Path alias `@/*` → `src/*` |
| Auth/DB | **Supabase** via **`@supabase/ssr`** | Local dev via Supabase CLI + Docker (OrbStack) |
| i18n | Custom cookie-based VN/EN | No library, no locale URL routing |
| Package manager | **npm** | scripts: `dev`, `build`, `start`, `lint` |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # async root layout: reads locale, wraps <I18nProvider>, sets <html lang>
│   ├── page.tsx                # protected home (getUser() → redirect /login if no session)
│   ├── globals.css             # Tailwind v4 entry
│   ├── _components/            # home-view, logout-button
│   ├── login/                  # /login route + _components (header, hero, footer, google-button, language-switcher)
│   └── auth/callback/route.ts  # OAuth code exchange; popup posts message to opener + closes
├── proxy.ts                    # Next 16 proxy: session refresh + route guard (replaces middleware)
├── components/                 # shared presentational: icons, flags
└── lib/
    ├── supabase/               # client (browser), server (async cookies), update-session (proxy helper)
    ├── auth/                   # sign-in-with-google (popup flow)
    └── i18n/                   # config, get-locale (server), i18n-context (client), messages/{vi,en}.json
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
