# Isolated database tests

Updated September 17, 2026. Security groundwork builds on accepted integration
`6c984161c31bc4637dbe88b73a4da8408cefdf1d`; it does not repair DATA-01/02/03.
Executable fixtures and runner: [supabase/tests](../supabase/tests/README.md).
**No Hotkey database replay or application authorization test has run yet.**
Runner unit tests are not RLS evidence.

**September 17 platform-only update:** the one reviewed bootstrap experiment passed in
[run 35275149357](https://github.com/rathunter69/Hotkey.gg/actions/runs/35275149357), exact source
`49b8193b6b6c17c63b97c898d268437ceb191cdf`. Official Auth migration, platform role/claim checks,
default ACLs, transactional extension installation, empty data, isolation and cleanup passed.
This includes platform role checks, not the 56 application authorization assertions. Full
Hotkey replay remains UNRUN. See the [bootstrap recipe](../supabase/tests/PLATFORM_BOOTSTRAP.md)
and [durable result](../supabase/tests/evidence/platform-bootstrap-35275149357.json). The
feasibility section below records the earlier finding; its bootstrap gap is now closed for
this exact pair/host. Any next application replay remains a separately reviewed batch.

## Execution capability

Fresh Windows checks: Docker, Podman, PostgreSQL tools and Supabase CLI absent from PATH;
standard install locations absent; no matching services; WSL explicitly reports not installed.
The permitted runner capability check fails with `docker ENOENT`, before any SQL. No service
or host/account-wide configuration was installed. The connected Supabase project is not an
isolated test environment and was not used as a fallback.

Git/testing confirmed GitHub-hosted Linux can supply Docker and reviewed the separate
Security-owned platform-only workflow before dispatch. That experiment has now passed as
recorded above. Security did not edit Testing's browser gate or deployment workflows.
The following feasibility history identifies why the standalone database image needed Auth.

## Official platform feasibility review — September 17

Historical preparation at 14d7e10; completed runtime bootstrap is recorded above.

Chief requested one concrete official route after accepting preparation at `2a4a5f5`.
Reviewed the database/Auth pair from the official Supabase self-host compose, then resolved
the tags through the public Docker registry and GitHub tag references. No image was pulled,
container started, Auth service served or database contacted. These are source/metadata
findings, not runtime compatibility or build-provenance attestation.

| Component | Official tag and source commit | Immutable Linux amd64 manifest |
|---|---|---|
| Database | `supabase/postgres:17.6.1.136`, `d156ba65c14694c12cc5e782bc15b9b8ed2d1376` | `supabase/postgres@sha256:5a4314708484bec672de2c09653a5c01fb1c84a998564ac231b0325e2238ed5b` |
| Auth migrator | `supabase/gotrue:v2.196.0`, `0204331ca41a5b49f076b6fa3dc6c0d20b996590` | `supabase/gotrue@sha256:7e813221b93fbf54b515036438550e483bfaf057b9db52fe9bc1ce91c47e817e` |

The Postgres multi-platform index was
`sha256:f371b5f3f2ac0a05703f33d6e6134515fb2498cab708fb948a0aeb7481467c00`.
The platform-specific manifests above avoid silently selecting another architecture.
Registry image config confirms Postgres uses `docker-entrypoint.sh`, PGDATA
`/var/lib/postgresql/data`, POSTGRES_USER `supabase_admin`; Auth's command is `auth`.
The reviewed database Dockerfile copies the official platform migrations and supplies
`/etc/postgresql/postgresql.conf`. Preserve its required preload libraries; overriding the
list with only pg_cron is not an established startup recipe.

**Concrete gap:** Postgres alone has no `auth.jwt()` and its `auth.users` lacks
`is_anonymous`. Independent review scanned the pinned platform SQL and confirmed both are
absent. The existing runner rejects missing `auth.jwt()` before application replay; the
fixture also needs the missing column. Platform default ACLs are compatible in source:
`migrate.sh` runs init scripts as postgres, assigning the public defaults to that role;
later official grants support Auth-table access and SET ROLE anon/authenticated.

The pinned Auth release owns both missing objects. Its official `auth migrate` command runs
the embedded migration chain without serving the Auth API. This is a concrete candidate
bootstrap route, but its full configuration requirements, actual image startup, extension
availability and compatibility with this database image are **UNRUN**. Do not copy just two
SQL definitions or substitute fake grants/functions to get through preflight.

**Minimal next proposed action:** Security prepares/reviews one platform-only bootstrap
script using this exact pair, with Testing providing a separate GitHub-hosted Linux job.
Pull images before isolation; initialize an empty tmpfs database with network none, no
published ports or host/persistent mounts, the official config and
`cron.launch_active_jobs=off` from the first server start. Run only the official Auth migration
command in the database's otherwise isolated network namespace, connecting through localhost
as its official Auth migration role with synthetic local-only settings. Stop/remove the Auth
migrator, then verify database isolation, scheduler source/value, empty Auth/public data,
required Auth objects/default ACLs and available extension versions. Save the first setup
failure and stop; no speculative variants. This platform-only check must not replay Hotkey
migrations or execute the 56 assertions. Only an accepted bootstrap result enables the
separately coordinated two-fresh-replay baseline below.

Testing confirmed a separate Ubuntu/Docker job is possible but declined an incomplete DB job;
Security owns the exact bootstrap recipe, Testing owns later integration. Its accepted
browser gate is independent and unchanged. No approved executable bootstrap or DB job is
delivered in this documentation-only feasibility checkpoint.

Pinned official evidence:

- [Database build](https://github.com/supabase/postgres/blob/d156ba65c14694c12cc5e782bc15b9b8ed2d1376/Dockerfile-17),
  [platform migration driver](https://github.com/supabase/postgres/blob/d156ba65c14694c12cc5e782bc15b9b8ed2d1376/migrations/db/migrate.sh),
  [initial Auth schema](https://github.com/supabase/postgres/blob/d156ba65c14694c12cc5e782bc15b9b8ed2d1376/migrations/db/init-scripts/00000000000001-auth-schema.sql).
- [Official Auth migrate command](https://github.com/supabase/auth/blob/0204331ca41a5b49f076b6fa3dc6c0d20b996590/cmd/migrate_cmd.go),
  [JWT function migration](https://github.com/supabase/auth/blob/0204331ca41a5b49f076b6fa3dc6c0d20b996590/migrations/20220531120530_add_auth_jwt_function.up.sql),
  [anonymous-user migration](https://github.com/supabase/auth/blob/0204331ca41a5b49f076b6fa3dc6c0d20b996590/migrations/20240214120130_add_is_anonymous_column.up.sql).

## Host and image contract

Use a dedicated disposable host with a local Docker daemon at the standard Unix socket or
Windows named pipe. The runner sets that endpoint explicitly and strips inherited Docker,
Postgres and Supabase connection variables. It accepts no database URL, remote Docker context,
password, linked project or production config. The host must enforce container isolation.

Prepare an immutable `registry/name@sha256:<64 hex>` image with:

- PostgreSQL and genuine, version-recorded Supabase platform bootstrap: auth.users,
  auth.uid(), auth.jwt(), anon/authenticated/service roles and platform default grants.
  Use reviewed platform sources or a pristine synthetic local stack, never production dumps.
  Do not replace auth functions with stubs or widen application grants to make tests pass.
- Available pgTAP and pg_net, plus preloaded pg_cron. Record exact Postgres, extension and
  platform source versions. Stock PostgreSQL does not provide the required Supabase schema.
- No application tables, users, customer data, production secrets, linking metadata or external
  services. No startup application migration replay or network-calling initialization scripts.
- PostgreSQL started with `-c cron.launch_active_jobs=off` from its FIRST startup, verified
  with `source='command line'` in pg_settings. Session-only or after-start disabling is refused.

The reviewed candidate digests above are not a validated complete bootstrap. The earlier
runbook's CLI 2.117.0 observation is not a validated pin. This runner does not invoke CLI.
If CLI is used to prepare an empty platform,
read its pinned help and ensure start/reset cannot replay this repository before isolation.

Required container shape (adapt to the reviewed image's entrypoint and PGDATA; not a tested
image invocation):

```sh
docker run --detach --name hk-security-replay \
  --label gg.hotkey.security-test=disposable-synthetic \
  --network none \
  --tmpfs /var/lib/postgresql/data:rw,nosuid,nodev \
  --env POSTGRES_HOST_AUTH_METHOD=trust \
  "$REVIEWED_PLATFORM_IMAGE" \
  postgres -c shared_preload_libraries=pg_cron -c cron.launch_active_jobs=off
```

Retain any other preload libraries the reviewed platform requires. Trust auth is ONLY for
this disposable portless container, never a host authentication change. Override every image
persistent volume with tmpfs. Pull/build the reviewed image before the boundary. No image
pulls, container creation, email, Auth, Edge or payment services occur inside the test runner.
The runner rejects bind/volume mounts, published ports, added networks/capabilities/devices,
privileged/host namespaces and non-digest images. It requires the network interface list to
contain only lo. No packets can reach an external mail/payment/digest endpoint from that
network namespace; the local Docker host remains a trusted control plane.

## Replay hazard and commands

20260716800000_digest.sql schedules an HTTP POST to the production digest URL. Later files
schedule pruning and retention. Empty secrets are insufficient: both network denial and cron
disabled from startup must precede replay. Keep the original SQL unchanged. The runner checks
container/network/scheduler controls before every migration/test and afterward.

```sh
# Source SHA plus SHA256 of SQL inputs; no database required.
node supabase/tests/run-isolated.js --plan
# Fresh empty genuine Supabase platform, with isolation already established:
node supabase/tests/run-isolated.js --container hk-security-replay --replay
# Tests only on that same disposable database after successful replay:
node supabase/tests/run-isolated.js --container hk-security-replay
```

The runner uses docker exec/psql over stdin. It verifies auth.users is empty before fixture or
replay; replay also requires no public tables. All 52 migrations execute in filename order,
unaltered, stopping at the FIRST SQL error. Never skip a failure, edit history or rerun a
partial database as a valid baseline. A private test-control manifest is written only after
all migrations succeed; tests-only requires its hash to match the current migration inputs.
Recreate the disposable instance after recording the
failing filename/error. Two fresh successful replays are required to establish reproducibility.

Tests use actual anon/authenticated database roles and synthetic JWT claims. Postgres is used
only for fixture setup. Missing platform default ACLs fail setup instead of falsely proving
security through under-granting. Each successful hostile probe rolls back its own effects;
the outer transaction rolls back all fixtures, and Auth emptiness is checked afterward.
The runner treats pgTAP not-ok as a failing exit even when psql exits zero. TODO/SKIP, missing
plans, incomplete results and bailouts cannot be green. Twelve current DATA-01 failures are
predicted from source/audit, NOT executed reproductions. Record unexpected failures separately.

## Evidence and recovery

Record tested SHA and working-tree SQL hashes; image digest/platform provenance; versions;
container/scheduler settings; migration count or first failing file; assertion results and
exit codes. Save sanitized findings in the handoff. No credentials/customer rows or production
scheduler command payloads in logs. Compare final schema/grants/functions with the existing
sanitized audit under cleanup's later reconciliation scope; matching stamps alone is inadequate.
The nine extra live migration stamps remain unresolved. No history edit is authorized here.

The runner never removes containers or volumes. After evidence is saved, the host owner stops
and removes ONLY the named disposable container and verifies removal. tmpfs data vanishes.
Do not remove unrelated resources. No deployment, secret rotation or billing activation.

## Separate acceptance work

The [boundary matrix](../supabase/tests/README.md) records DATA-02 privacy and DATA-03 MFA needs.
These require public/owner field contracts and chosen AAL2-protected operations, followed by
real API/Auth journey checks. Synthetic SQL claims do not prove token issuance, MFA recovery,
PostgREST behavior, production platform parity or service delivery. No runtime/schema changes
for those findings are included.

Sources reviewed September 17: [database tests](https://supabase.com/docs/guides/database/testing),
[Docker none networking](https://docs.docker.com/engine/network/drivers/none/),
[pg_cron settings](https://github.com/citusdata/pg_cron#extension-settings),
[Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa).
