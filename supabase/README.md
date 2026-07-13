# Supabase-in-repo — no more pasting SQL into the dashboard

Database changes live in `supabase/migrations/*.sql` and deploy automatically
on push via GitHub Actions.

> **STATUS 2026-07-12 (r131): THE PIPELINE HAS NEVER RUN SUCCESSFULLY.**
> Every deploy since 2026-07-07 failed at "Access token not provided" — the
> one-time setup below was never completed, so NOTHING in
> `supabase/migrations/` from `20260707000000_team_code.sql` onward exists in
> the live database. Full findings: `dev/SMOKE_REPORT.md`. Complete the setup,
> then re-run the workflow (Actions tab → "Deploy Supabase migrations" →
> Run workflow) — all migrations are idempotent and apply in one pass.

## One-time setup (3 minutes, Wolf) — TWO secrets
1. Get a Supabase access token: app.supabase.com → account icon → Access Tokens →
   Generate new token. COPY it.
2. Get the database password: Supabase dashboard → Project Settings → Database →
   Database password. If you don't have it saved, use "Reset database password"
   and copy the new one.
3. GitHub repo → Settings → Secrets and variables → Actions → New repository
   secret, twice:
   - Name: `SUPABASE_ACCESS_TOKEN` · Value: the token from step 1.
   - Name: `SUPABASE_DB_PASSWORD` · Value: the password from step 2.
   (Never in code or chat.)
4. GitHub repo → Actions tab → "Deploy Supabase migrations" → Run workflow.
   Green run = the whole backlog (desks, school tags, assignments, handle
   rules, flair, entitlements) is live.

## How changes work from now on
- New table/column/policy → Claude adds a timestamped file in `supabase/migrations/`
  and pushes. The Action applies it. No dashboard pasting.
- All migrations are idempotent (house rule) — safe to re-run.
- Edge Functions (Stripe etc., when built) live in `supabase/functions/<name>/`
  and deploy from the same workflow.

## Notes
- The project ref (vshtftzrlepedydmkcnm) is public info (it's in every page's URL
  config); the ACCESS TOKEN and DB PASSWORD are the secrets — repo secrets only.
- Never commit service-role keys or Stripe secrets anywhere in this repo.
- The workflow now fails LOUDLY with instructions if either secret is missing
  (r131) — a missing secret can never again read as a quiet no-op.
