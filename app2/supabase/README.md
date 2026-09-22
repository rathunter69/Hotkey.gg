# app2/supabase — database for the rebuild

Forward migrations under `migrations/`, pgTAP permission tests under `tests/`. The build
session **writes** SQL; only the review session **applies** it (`supabase db push --workdir app2`,
or the manual `db-deploy` GitHub workflow), then runs the security advisors. No URL, no keys and
no project ref live in this folder.

## Running the tests

    supabase test db --workdir app2

Disposable local stack only — the files begin by refusing a database that contains users.
Never point them at a hosted project. Each `tests/*.test.sql` is self-contained: platform
preconditions, `pg_temp` helpers (uid / actor / probe, from the
`codex/groundwork-db-integration` reference), two seeded users, assertions, rollback.

The build session validated the chain on a bare Postgres 16 with a minimal Supabase shim
(roles, `auth.users`, `auth.uid()`, Supabase default grants): all four migrations apply and
all five files pass. `supabase test db` on the real platform is still the canonical run.

## Ground rules (docs/phases/B-accounts.md)

- RLS on every table; clients get `select` only where a policy backs it; **no client writes to
  tables, ever** — the RPCs in `0004` (plus the telemetry pair in `0003`) are the whole surface.
- Every function: `security definer`, `set search_path = ''`, fully schema-qualified.
- Migrations are forward-only. Never edit an applied file; add the next number.
- After every applied change: run the Supabase security advisors.
- `0003` schedules a pg_cron retention job; on a database without pg_cron it warns and skips —
  after applying to the real project, confirm the job exists (`select * from cron.job`).
