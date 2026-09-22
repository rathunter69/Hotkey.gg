# Phase G build brief — Launch and cutover

Read first: `docs/REBUILD_PLAN.md` §3–8, `docs/SITE_SPEC.md` §2, §12, `CLAUDE.md`. Work on branch `rebuild` (or a `cutover` branch off it). Nothing here touches `main` until step 7, and every step marked **WOLF** stops for his explicit OK. Stripe/processor stays in test mode throughout; going live is his call, not this brief's.

Facts to rely on (verified in the tree):

- `app2/` is self-contained: `app2/index.html` loads `./ui/*.css` and `./app/main.js` by relative path; generated `app2/lessons/*.html` and `app2/shortcuts/*.html` use `up = '../'`. So Cloudflare Pages with **build output directory = `app2`** serves the app at `/` with no build step. Do not move files to the repo root.
- Routing is a hash router (`app2/app/main.js` `parseRoute`). Fragments never reach the server, so no SPA fallback is needed; Pages serves `app2/404.html` for missing paths automatically.
- `app2/_headers` does not exist. The root `_headers` (old build) is the reference for the security block only; its `?v=` immutable-cache scheme is retired (SITE_SPEC §12).
- Old workflows: `gate.yml` (old build, uses `dev/`), `supabase-deploy.yml` (fires on push to `main` touching `supabase/**`, hardcodes old ref `vshtftzrlepedydmkcnm`, unpinned `setup-cli@v1 version: latest`, `db push --include-all`, no `permissions:`). `rebuild-check.yml` and `browser-smoke.yml` are already pinned by SHA and target `rebuild`.
- Phase B creates `app2/app/config.js` (project URL + publishable key) and `app2/supabase/migrations/`. If those names differ when you start, use the real ones and say so.

## Order of work

### 1. Pages files (code, no infra yet)

**Create `app2/_headers`:**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://<NEW_REF>.supabase.co wss://<NEW_REF>.supabase.co; frame-src https://checkout.<processor>; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
/*.html
  Cache-Control: no-cache
/
  Cache-Control: no-cache
/*.js
  Cache-Control: public, max-age=0, must-revalidate
/*.css
  Cache-Control: public, max-age=0, must-revalidate
https://:project.pages.dev/*
  X-Robots-Tag: noindex
```

Read `<NEW_REF>` from `app2/app/config.js`; the processor host from the phase E checkout code (`grep -rn "checkout" app2/app/pricing-page.js`). Trap: `index.html` uses inline `<script>` and a data-URI favicon, so keep `'unsafe-inline'` and `data:`; no jsdelivr (nothing in app2 loads it — confirm with `grep -rn jsdelivr app2`).

**Create `app2/_redirects`** (old URLs → new routes, one rule per old root page):

```
/drills/*          /lessons/          301
/reference.html    /shortcuts/        301
/leaderboard.html  /#/leaderboard     301
/About.html        /#/about           301
/enterprise.html   /#/teams           301
/billing.html      /#/pricing         301
/terms.html /#/terms 301   /privacy.html /#/privacy 301   /contact.html /#/contact 301
/account.html /#/account 301   /profile.html /#/account 301   /stats.html /#/account 301   /desks.html /#/account 301
/cert.html /#/account 301   /security.html /#/privacy 301   /admin.html / 302
```

Trap: verify on the first preview that a fragment destination survives the 301 (open `/leaderboard.html` on the pages.dev URL). If Cloudflare strips it, route those rules to `/legacy/<name>.html` stubs generated in step 1c with `<meta http-equiv="refresh" content="0;url=/#/…">`.

**Edit `app2/app/main.js`:** the old CTA on 75 SEO pages was `index.html?drill=<key>`. `_redirects` cannot match query strings, so at boot (before the first `parseRoute`) add `legacyQuery()`: if `location.search` contains `drill=`, `history.replaceState(null, '', '/#/practice')`. Export it; test it as a pure function of a search string.

**Extend `app2/tests/public-pages.js`:** also generate `app2/sitemap.xml` (`/`, `/lessons/`, every lesson page, `/shortcuts/`, every shortcut page — 156 URLs on `https://www.hotkey.gg`) and `app2/robots.txt` (`Allow: /`, `Sitemap:` line). Both go through the existing `pages()` map so `drift()` catches staleness.

**Tests — `app2/tests/launch.test.js` (node --test):**
- `_redirects` parses: every line has 2–3 fields, status ∈ {301,302}, no destination is itself a source (no loops), fewer than 2000 rules.
- Every old root `*.html` in a hardcoded list (the 16 above plus `index.html` excluded) has a rule.
- `_headers` contains `frame-ancestors 'none'`, the supabase host from `config.js`, and no `jsdelivr`.
- `legacyQuery('?drill=anchor')` → `'/#/practice'`; `legacyQuery('')` → `null`.
- `sitemap.xml` URL count equals `LESSONS.length + REFERENCE.length + 3`.

### 2. Analytics events and error log

**`app2/supabase/migrations/<ts>_events.sql`:** tables `events(id uuid default gen_random_uuid(), user_id uuid null, session_id text, name text check (name in ('landing','lesson1_start','lesson1_complete','signup','chapter_complete','paid')), props jsonb default '{}', created_at timestamptz default now())` and `client_errors(id, user_id null, url text, message text, stack text, ua text, created_at)`. RLS on, no direct grants; two `security definer` RPCs `log_event(name, session_id, props)` and `log_error(url, message, stack)` with a length cap (message/stack ≤ 2 KB) and a per-session rate cap (reject after 200 rows/hour). Retention: a `pg_cron` job deleting rows older than 90 days. Run the security advisors after applying (Cowork chat applies, not you).

**Create `app2/app/telemetry.js`:** `track(name, props)` and `installErrorLog()` (`window.onerror` + `unhandledrejection` → `log_error`; dedupe identical messages per page load). Session id = `crypto.randomUUID()` in `sessionStorage`. Every call is fire-and-forget, wrapped in try/catch, and a no-op when `config.js` has no URL (tests, local). Wire the six events: `landing-page.js` mount, `lesson-view.js` first lesson start/complete, the signup path in `account-page.js`, the chapter-complete moment in `progress.js`, and the paid webhook confirmation from phase E (server side, not client).

**Weekly digest:** SQL view `weekly_health` (signups, events by name, failed saves, errors grouped by message, top 10) plus a `pg_cron` job that emails it via the phase E transactional mail path. If no mail path exists yet, the digest is a saved query Wolf runs from the dashboard; say so in the checklist.

Test: `app2/tests/telemetry.test.js` — `track` never throws without config; error dedupe; the event-name allow-list matches the SQL check (read the migration file and regex the names).

### 3. Legal pages final

`app2/app/legal-pages.js`: `LEGAL` keeps its shape (`{title, intro, sections:[[h,body]]}`); replace placeholder bodies with the reviewed text Wolf supplies. Add `LEGAL_STATUS = { reviewed: false, updated: 'YYYY-MM-DD' }`; `mountLegalPage` renders the DRAFT banner only while `reviewed` is false and prints `updated` in `.page-fine`. Add `**WOLF**` gate: the flip to `reviewed: true` happens only in a commit he approves. `pages.test.js` already imports the footer list; add an assertion that all four legal kinds render without the banner when `reviewed` is true.

### 4. Workflows

- Create `.github/workflows/db-deploy.yml`: `on: workflow_dispatch` only; `permissions: contents: read`; `environment: production` (create it in repo settings with Wolf as required reviewer); actions pinned by SHA (copy the SHAs from `rebuild-check.yml`), `supabase/setup-cli` pinned to a SHA and a fixed `version:`; `PROJECT_REF` from `vars.SUPABASE_PROJECT_REF`, never hardcoded; steps: `supabase link`, `supabase db push --dry-run` (printed), then `supabase db push` (no `--include-all`); `working-directory: app2/supabase` is wrong for the CLI — instead set `supabase/config.toml` under `app2/supabase/` and pass `--workdir app2`.
- Edit `rebuild-check.yml` and `browser-smoke.yml`: branches `[main, rebuild]` and `pull_request` on both. Add a step to `rebuild-check.yml` running `node app2/tests/public-pages.js` (already inside `npm run check`; just confirm).
- Delete `gate.yml` in the archive commit (step 7), not before.

### 5. Cloudflare Pages — **WOLF** does the clicks, you write the exact steps

Pages → Create project → connect `rathunter69/hotkey.gg` → production branch `main`, preview branches all, build command empty, output dir `app2`. Add custom domains `hotkey.gg` and `www.hotkey.gg` (Pages rewrites the DNS records itself; the apex currently proxies to GitHub Pages — accept the replacement). Keep proxy on. Turn on "Automatic HTTPS rewrites"; leave Rocket Loader off (it breaks module scripts). Repo → Settings → Pages → disable GitHub Pages **after** the Cloudflare domain shows Active. Delete root `CNAME` in step 7. Set the production preview to `rebuild` branch first and give Wolf `https://rebuild.<project>.pages.dev` for the beginner tests (REBUILD_PLAN §5).

### 6. Supabase replacement — follow REBUILD_PLAN §4 exactly

(1) Phase B migrations reviewed. (2) Cowork chat runs `supabase db dump --linked -f schema.sql` and `--data-only -f data.sql` for the old project; store on Wolf's drive, never in git. (3) **WOLF** deletes the old project and creates the new one (plan: Pro plan so daily backups exist; PITR is an add-on, his call — quarterly restore test noted in ops). (4) Apply migrations, put URL + publishable key in `app2/app/config.js`, advisors clean. Remove the old `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD` repo secrets and disable `supabase-deploy.yml` in the Actions UI **before** step 7.

### 7. Archive and cutover — **WOLF** OK required

```
git tag legacy-v1 main && git push origin legacy-v1
git branch archive/legacy main && git push -u origin archive/legacy
```

Then on the cutover branch: `git rm -r` root `index.html drills.js drills/ nav.js nav.css themes.js lb.js lb.css refmap.js dev/ supabase/ *.html art/ CNAME _headers robots.txt sitemap.xml sessions_*.sql PROJECT_CONTEXT.md STRIPE_SETUP.md hotkey-setup-guide.md flagships.txt new_comps.txt skills-lock.json .github/workflows/gate.yml .github/workflows/supabase-deploy.yml`. Keep `app2/`, `docs/`, `CLAUDE.md`, `package.json`, favicons (move to `app2/`; they are referenced only by the old pages). Trap: `supabase-deploy.yml` has `paths: ['supabase/**']` — deleting `supabase/` matches it; it does not fire when the workflow file is deleted in the same commit, but the secrets must already be gone (step 6). `npm run check` must pass with the old tree gone (the isolation check only walks `app2/`). Open a PR to `main`; merge = live. Delete stale `claude/*` and `codex/*` branches only after Wolf confirms the list (`git branch -r | grep -E 'claude/|codex/'`).

### 8. Branch protection and ops

Repo → Branches → `main`: require PR, required check `rebuild-check`, no force push, include admins. Pin `db-deploy` to the `production` environment. Weekly health check = the `weekly_health` view plus advisors; put the checklist into `docs/REBUILD_PLAN.md` §6 (one plan doc; no new docs).

## Launch checklist (go/no-go, add to REBUILD_PLAN §5)

Go only if all are yes: preview tested by 2–3 beginners and finance users; `rebuild-check` and browser smoke green on the cutover branch; advisors clean on the new project; backups confirmed; `LEGAL_STATUS.reviewed` true after lawyer review; support address in `LEGAL.contact`; refund/cancel runbook written; processor test-mode e2e passes (phase E exit); redirects verified on pages.dev; `sitemap.xml` reachable on the custom domain; branch protection on; old secrets removed; rollback rehearsed once (Pages → Deployments → Rollback). Processor going live is a separate **WOLF** go.