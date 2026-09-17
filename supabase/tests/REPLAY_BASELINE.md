# Isolated application replay and permission baseline

Chief assigned this one bounded experiment September 17 after accepting platform-only
checkpoint `3dd686d`. This separate branch does not join or block browser/structure integration.
The platform-only branch, exact tested source `49b8193`, and successful run `35275149357`
remain preserved. No application runtime, migration history or permission repair is changed.

Latest result: [run 35277724943](https://github.com/rathunter69/Hotkey.gg/actions/runs/35277724943),
exact `eaab8645cf8aaee6e62120f65d24ebd911a047ad`: both fresh 52-file replays and full 56-result
suites completed. Each has 44 passing controls and identical 12 DATA-01 failures, no unexpected
control failure. Cleanup passed; CI stays failed. [Saved result](evidence/replay-baseline-35277724943.json).
Only the two fixture entitlement reads changed to supported my_pro_status().pro; roles and
all 56 expected outcomes remain unchanged. No application permission repair occurred.

Earlier result: [run 35276711544](https://github.com/rathunter69/Hotkey.gg/actions/runs/35276711544), exact
source `18babfa80dea4acb31fd30be2ae00b3610d42ed2`, completed the first 52-file replay then stopped
at fixture line 119: SQLSTATE 42501, permission denied for internal function my_pro. Only 12
partial TAP lines were emitted; no second instance or complete permission baseline. Cleanup
passed and the job failed. [Saved result](evidence/replay-baseline-35276711544.json) and
[handoff](../../docs/handoffs/security-accounts.md) distinguish the fixture blocker from replay.

`replay-baseline.js --plan` inventories exactly 52 migration inputs and the single reviewed
56-assertion fixture. `--run` works only on the dedicated branch push in this repository's
GitHub-hosted Linux x64 job. Testing must independently clear the exact candidate before a
triggering push. The distinct workflow has no main/PR/deployment/manual trigger, uses pinned
actions, read-only contents permission, no production secrets and no persisted credentials.

The wrapper reuses the proven official [platform bootstrap](PLATFORM_BOOTSTRAP.md), with the
same immutable database/Auth pair, original config/preload libraries, scheduler off from its
first server startup, network none, tmpfs-only mounts, no exposed host ports and official Auth
migrations confined to the database's namespace. The bootstrap checks still run before every
application attempt. The only lifecycle change is a narrow hook after those checks and before
the existing labelled cleanup. Its original platform-only CLI remains platform-only.

The existing guarded runner then replays source files unchanged, in filename order, stopping
at the first SQL error. It checks confinement/scheduling before every file. A failed file may
have committed earlier statements; record completed files and the failed filename/SQLSTATE,
then destroy the entire instance. Never resume it, skip a file, amend history, manufacture
platform grants/functions, try another image, or contact a live project.

Only a completed full replay proceeds to the existing permission SQL. Record all TAP assertion
identities and actual pass/fail outcomes, separating DATA-01 labelled failures from unexpected
control failures. Twelve vulnerable cases remain source predictions, not expected results to
force or suppress. Missing, partial, skipped or bailed-out TAP remains an error. Partial TAP
from a fixture error is retained as incomplete evidence, never a security conclusion.

At most two fresh instances are attempted. A genuine migration/platform/fixture/cleanup error
stops the batch immediately. A full replay followed solely by complete assertion failures may
be repeated once on an independently fresh platform to assess replay reproducibility. Those
failures still make the workflow fail. Two complete 52-file replays are required for the
reproducibility claim; successful permission checks additionally require both full 56-result
streams to pass. No continue-on-error or swallowed process failure makes the job green.

Evidence includes exact source/input hashes, first failure, completed migration list,
platform versions/controls, all complete assertion outcomes, and cleanup. Diagnostics omit
SQL statements/context, scheduler payloads, URLs and vault contents. Cleanup only touches the
exact run's named purpose-labelled containers. Preserve sanitized results and CI links in the
area handoff; artifacts expire after seven days. No unattended reruns or additional repair
batch is authorized by this document.
