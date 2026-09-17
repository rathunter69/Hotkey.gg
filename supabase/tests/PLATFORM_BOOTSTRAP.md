# One platform-only bootstrap experiment

Authorized September 17 by the chief under Wolf's testing/security groundwork; foundation
scope `e437d08914fb1cff84a89b0a2216b2b8635164fd`. Based on Security feasibility `14d7e10`.
This is separate from browser CI, Hotkey migration replay and the 56 permission assertions.

`platform-bootstrap.js --plan` prints the fixed image/source pair and platform SQL hash.
`--run` and `--cleanup` accept only the dedicated branch push on a GitHub-hosted Linux x64
runner in this repository. There are no host, URL, image or migration-path overrides.
The distinct `security-platform-bootstrap.yml` must receive Testing's independent review
before the first triggering branch push. Only its named branch and four exact tooling paths
trigger it; no main, pull-request or deployment trigger. Actions are pinned by commit;
permissions are contents:read; checkout retains no credentials; no repository secrets.

## Fixed official inputs

| Component | Linux amd64 digest | Source commit |
|---|---|---|
| Postgres 17.6.1.136 | `supabase/postgres@sha256:5a4314708484bec672de2c09653a5c01fb1c84a998564ac231b0325e2238ed5b` | `d156ba65c14694c12cc5e782bc15b9b8ed2d1376` |
| Auth v2.196.0 | `supabase/gotrue@sha256:7e813221b93fbf54b515036438550e483bfaf057b9db52fe9bc1ce91c47e817e` | `0204331ca41a5b49f076b6fa3dc6c0d20b996590` |

The images are pulled before container creation. Database creation uses network none, no
published ports, tmpfs PGDATA/socket storage, no host/persistent mounts or additional
capabilities, and the original config. `cron.launch_active_jobs=off` is a server command-line
argument. The pinned official entrypoint forwards it to the temporary initial server too.
Original preload libraries are retained. The final server listens only on loopback. Network,
mount and ownership checks precede startup; loopback-only and scheduler checks precede Auth.

Auth runs `auth migrate --config /dev/null`, with explicit synthetic DB/JWT/site settings,
namespace auth, and tracing/metrics/profiling disabled. It shares only the exact database's
network namespace, with read-only root, /tmp tmpfs, all capabilities dropped and no ports.
Its API is never served. The official loopback HBA uses trust; the synthetic URL password
does not imply password authentication. No role passwords, permissions or functions are
patched. The migrator is removed before platform checks.

## Evidence and stopping rule

Check authentic Auth objects and migration ledger, all Auth data tables empty, no public
application tables, official default ACLs/role membership, and real claim helpers under anon
and authenticated. Read the protected Auth migration ledger and HBA as supabase_admin;
all extension, grant and claim checks use postgres or the explicit API role. Install shipped
pgTAP/pg_cron/pg_net transactionally, check no scheduled jobs or HTTP queue, report versions,
then roll back. No HTTP call, email, Auth token issuance or user record is created.

The script reads only its platform SQL file. It never invokes the replay runner's main entry
point, reads application migration files, or runs the desk fixture. It imports only the
existing container validator. `hotkeyMigrationsExecuted` and `permissionAssertionsExecuted`
remain zero in the result.

Stop at the first genuine platform incompatibility, preserving the stage/error and named
container logs. Correct only bounded bootstrap-script mistakes; do not cycle image variants
or manufacture compatibility objects. Cleanup runs in finally and an always workflow step,
and refuses names/images/purpose labels outside the run. No volume/network prune or host
configuration changes. GitHub's ephemeral runner is the final containment boundary.

Evidence is JSON and synthetic container logs under the runner temp directory, uploaded for
seven days. Save the durable source/job/result and any exact failure in the area handoff;
do not rely on expiring artifacts as continuity. A pass establishes this platform-only
experiment, not Hotkey replay, application permissions, production parity or browser CI.

## Reviewed official sources

- [Database Dockerfile](https://github.com/supabase/postgres/blob/d156ba65c14694c12cc5e782bc15b9b8ed2d1376/Dockerfile-17),
  [first-start entrypoint](https://github.com/docker-library/postgres/blob/6edb0a8c4def40c371514b34aef9037ec82d9110/17/alpine3.23/docker-entrypoint.sh),
  [official HBA](https://github.com/supabase/postgres/blob/d156ba65c14694c12cc5e782bc15b9b8ed2d1376/ansible/files/postgresql_config/pg_hba.conf.j2).
- [Auth migration command](https://github.com/supabase/auth/blob/0204331ca41a5b49f076b6fa3dc6c0d20b996590/cmd/migrate_cmd.go),
  [Auth configuration](https://github.com/supabase/auth/blob/0204331ca41a5b49f076b6fa3dc6c0d20b996590/internal/conf/configuration.go),
  [protected migration ledger](https://github.com/supabase/postgres/blob/d156ba65c14694c12cc5e782bc15b9b8ed2d1376/migrations/db/migrations/20250421084701_revoke_admin_roles_from_postgres.sql).
