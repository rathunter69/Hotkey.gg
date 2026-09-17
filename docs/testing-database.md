# Isolated database tests

Updated September 17, 2026. Security groundwork builds on accepted integration
`6c984161c31bc4637dbe88b73a4da8408cefdf1d`; it does not repair DATA-01/02/03.
Executable fixtures and runner: [supabase/tests](../supabase/tests/README.md).
**No database replay or role test has run yet.** Runner unit tests are not RLS evidence.

## Execution capability

Fresh Windows checks: Docker, Podman, PostgreSQL tools and Supabase CLI absent from PATH;
standard install locations absent; no matching services; WSL explicitly reports not installed.
The permitted runner capability check fails with `docker ENOENT`, before any SQL. No service
or host/account-wide configuration was installed. The connected Supabase project is not an
isolated test environment and was not used as a fallback.

Git/testing confirms GitHub-hosted Linux can supply Docker. It has not provisioned a database
job or reviewed an image/bootstrap. Testing owns workflows; Security has not changed them.
A future job needs the exact image contract below and no production secrets. The current
missing prerequisites are a container host AND a reviewed genuine platform image by digest.

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
- No application tables, users, customer data, secrets, linking metadata or external services.
  No startup migration replay or network-calling initialization scripts.
- PostgreSQL started with `-c cron.launch_active_jobs=off` from its FIRST startup, verified
  with `source='command line'` in pg_settings. Session-only or after-start disabling is refused.

No digest is nominated without review. The earlier runbook's CLI 2.117.0 observation is not
a validated pin. This runner does not invoke CLI. If CLI is used to prepare an empty platform,
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
