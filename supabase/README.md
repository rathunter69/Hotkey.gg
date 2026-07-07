# Supabase-in-repo — no more pasting SQL into the dashboard

Database changes now live in `supabase/migrations/*.sql` and deploy automatically
on push via GitHub Actions.

## One-time setup (2 minutes, Wolf)
1. Get a Supabase access token: app.supabase.com → account icon → Access Tokens →
   Generate new token. COPY it.
2. GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
   Name: `SUPABASE_ACCESS_TOKEN` · Value: the token. (Never in code or chat.)
3. Done. Any push that touches `supabase/` runs the migrations against the project.

## How changes work from now on
- New table/column/policy → Claude adds a timestamped file in `supabase/migrations/`
  and pushes. The Action applies it. No dashboard pasting.
- The two existing migrations mirror the SQL already run manually — they're
  idempotent (`if not exists`), so the first automated run is a safe no-op.
- Edge Functions (Stripe etc., when built) will live in `supabase/functions/<name>/`
  and deploy from the same workflow.

## Notes
- The project ref (vshtftzrlepedydmkcnm) is public info (it's in every page's URL
  config); the ACCESS TOKEN is the secret — repo secrets only.
- Never commit service-role keys or Stripe secrets anywhere in this repo.
