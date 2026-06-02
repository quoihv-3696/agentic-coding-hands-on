# Deployment

## Platform: Vercel (Next.js 16, App Router)

Vercel auto-detects Next.js — no `vercel.json` required.

> **Status:** Not yet deployed. **Blocked on a hosted Supabase project** — the app's
> auth (login, route guard, session) runs on every request via `src/proxy.ts` and
> needs a reachable Supabase URL. The local stack (`http://127.0.0.1:54321`) is NOT
> reachable from Vercel. Complete the prerequisites below first.

## Prerequisites (do these BEFORE deploying)

1. **Hosted Supabase project** — create one at https://supabase.com (or `supabase link` + `supabase db push`).
   Note its **Project URL** and **publishable key** (Settings → API).
2. **Google OAuth on the hosted project** (Supabase Dashboard → Authentication → Providers → Google):
   - Enable Google, paste `Client ID` + `Client Secret` (Google Cloud Console → Credentials).
   - In **Google Cloud Console**, add Authorized redirect URI:
     `https://<project-ref>.supabase.co/auth/v1/callback`
3. **Supabase Auth URL config** (Dashboard → Authentication → URL Configuration):
   - **Site URL:** `https://<your-vercel-domain>`
   - **Redirect URLs:** add `https://<your-vercel-domain>/auth/callback`

## Environment Variables (set in Vercel → Project → Settings → Environment Variables)

| Name | Value | Scope |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Production (+ Preview) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | hosted project's publishable/anon key | Production (+ Preview) |

> `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are **not** Next.js env vars — they live on the
> Supabase project (local: `supabase/config.toml` via `env()`; hosted: the Dashboard provider settings).
> Do **not** add the `service_role`/secret key to Vercel — the app only uses the publishable key.

## Deploy Command

**Recommended — connect the GitHub repo in the Vercel dashboard** (auto-deploys on push to the branch / `main`).

CLI alternative:
```bash
npm i -g vercel          # or: npx vercel@latest
vercel login
vercel link              # link to a Vercel project
vercel --prod            # production deploy
```

## Custom Domain
Vercel → Project → Settings → Domains → add domain. Then update Supabase Site URL +
Redirect URLs (and Google redirect URI stays the Supabase callback) to match.

## Post-Deploy Verification
- `/login` renders; clicking **Login with Google** opens the Google popup and returns to `/`.
- Visiting `/` while unauthenticated redirects to `/login`.
- Switch VN/EN persists across reload.

## Rollback
```bash
vercel rollback                 # interactive: pick a previous deployment
# or promote a known-good deployment:
vercel promote <deployment-url>
```
Dashboard: Project → Deployments → ⋯ → **Promote to Production** on a prior build.

## Notes / Gotchas
- The popup OAuth flow sets session cookies in `/auth/callback`. Test on **Safari/Firefox** —
  ITP can partition popup-set cookies; if login "succeeds" but bounces back to `/login`,
  that's the cause (consider a same-tab redirect fallback for those browsers).
- `edge_runtime` is disabled in `supabase/config.toml` (local only) — irrelevant to the hosted project.
