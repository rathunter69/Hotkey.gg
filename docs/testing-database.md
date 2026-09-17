# Isolated database test setup

Prepared September 17, 2026 by the Git/testing task. This is a setup and acceptance
runbook, **not a completed migration replay or permission test**. Security owns the
permission repairs; repository/database cleanup owns history reconciliation.

## Current limits

This Windows host has no Docker/Podman executable, Docker installation in the standard
Program Files location, or Docker engine pipe. Supabase CLI is absent. A portable CLI
download was attempted but did not complete; no CLI command or database was run.
Do not substitute the connected production project for the missing local database.

The 52 tracked migrations include a baseline, but rebuilding them on an empty Supabase
database has not been verified. Earlier audit evidence compared 54 live function bodies,
not the complete schema, grants, default privileges, triggers or platform configuration.
Nine extra live migration stamps remain a separate reconciliation problem.

## Prerequisites and isolation boundary

1. Use a dedicated disposable Linux VM or container-capable test host. Install a supported
   Docker-compatible runtime. Verify the daemon, available ports and disk space.
2. Install an exact reviewed Supabase CLI release and verify the official archive checksum.
   The official release checked during this task was 2.117.0; it has **not** been validated
   with this repository. Record the CLI version and image digests in the replay evidence.
   Read `supabase --help`, then the help for `init`, `start`, `db reset`, `test db` and `stop`
   before executing them. Do not use the production workflow's floating `latest` as a pin.
3. Create a disposable working directory with a new local project identifier, such as
   `hotkey-db-test`. Initialize its config with that CLI. Copy only the tracked migration
   files and reviewed synthetic tests from the exact task commit. Do not copy `.temp`,
   production linking metadata, `.env`, credentials, customer records, service-function
   secrets or the production `supabase/config.toml` wholesale.
4. Before migration replay, deny outbound traffic from the test database/services and
   disable cron execution. Pull required images before enforcing the network boundary.
   Prove both controls are active; do not depend on missing secrets alone. Keep local
   service-to-service traffic available. Do not serve email/payment/digest functions.

**Specific replay hazard:** `20260716800000_digest.sql:77–82` creates a weekly cron job
calling the production weekly-digest URL through `net.http_post`. Other migrations create
pruning and retention jobs. Merely choosing a local project ID does not rewrite those SQL
strings. Keep the source migrations unchanged; disable execution in the test environment
before applying them. Use a separate reviewed fixture for testing schedules, with a local
sink and no live delivery. Confirm the outbound-denial control survives database resets.

## Replay and permission evidence to produce

After prerequisites are proven, use the pinned CLI's documented local start/reset/test
commands from the disposable directory. Use explicit local selection where supported;
never link, push, deploy or pass a remote database URL. This runbook intentionally does not
provide a one-click reset against the ordinary application checkout.

- Replay every tracked migration in order on an empty Supabase database. Record the
  first failing filename and SQL error verbatim without secrets. Do not skip a migration,
  rewrite history or widen grants to get a green result. Verify a second clean replay.
- Inventory resulting tables, columns, grants, RLS policies, triggers, function definitions,
  extensions and scheduled-job definitions. Compare with reviewed production metadata
  read-only; migration filename agreement is insufficient. Note platform default grants.
- Add deterministic synthetic fixtures for guest/anon, user A, user B, desk member,
  captain, owner and admin. Test direct table access and RPCs under their real roles and
  JWT claims, including `is_anonymous` and MFA assurance level. Superuser-only assertions
  cannot demonstrate RLS. Wrap fixture tests in rollback transactions.
- DATA-01: outsider cannot self-join as captain, choose paid-seat seniority, change desk
  verification/school identity, or bypass application prerequisites. Valid member/owner
  operations still succeed. Test column updates as well as inserts and RPC calls.
- DATA-02: public/other-user requests cannot retrieve hidden school or private account
  state; owner reads/writes and intended public card fields still work.
- DATA-03: specify and test enrolled-user AAL1/AAL2 access with Security. A pgTAP claim
  fixture alone does not establish a real second-factor login/recovery journey.
- Test completion retry idempotency with the persistence owner when that fix is selected.
  Payment lifecycle tests remain future billing work, not covered by these fixtures.
- Record failures as failures on the current baseline. Only mark a security finding
  repaired when the same attack assertion fails before the repair and passes afterward,
  with allowed-use regression cases passing too.

## Completion and recovery

Save source SHA, CLI/Postgres/image versions, migration count, command exit codes,
redacted logs and role-case results to the area handoff. Keep synthetic tests in Git.
Stop only this disposable project's services using the documented CLI command; never
remove unrelated Docker volumes. Rehearse rebuild/recovery before proposing a release.

No live deployment, secret rotation, migration-history repair or billing activation is
authorized by this setup document. The next Git/testing batch should establish the host
and network isolation, complete replay, and add the first Security-owned permission cases.

Official references checked September 17: [local development](https://supabase.com/docs/guides/local-development),
[migration replay](https://supabase.com/docs/guides/local-development/database-migrations),
[database testing](https://supabase.com/docs/guides/database/testing),
[CLI release 2.117.0](https://github.com/supabase/cli/releases/tag/v2.117.0).
