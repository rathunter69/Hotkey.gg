# Groundwork database-test integration

Updated: 2026-09-17
Task: `01a0b0f9-09da-7a62-9dd2-dd9baeac388d`
Branch: `codex/groundwork-db-integration`
Starting accepted checkpoint: `00df57afd8d3299cc7feaf523847b9ca43e54d06`
Integrated Security executable checkpoint: `565c34b660460c879b4b39e3d29653b1741e07b9`
State: combined test infrastructure and evidence locally verified; permission baseline remains failing; not merged or deployed.

## Scope and outcome

Wolf authorized one final consolidation of the accepted browser/account/structure/Security-preparation
checkpoint with the completed isolated database-test tooling and reproducible DATA-01 baseline.
This branch preserves `00df57a` and imports only the missing reviewed Security test sources,
the two dedicated Security workflows, durable evidence and documentation. It does not repair
permissions or change application behavior.

Imported provenance:

- platform bootstrap test source `49b8193b6b6c17c63b97c898d268437ceb191cdf`, imported as `85fb3de`;
- platform evidence handoff `3dd686d26edcb53325579fbe479eb01bdf41f773`, imported as `b7dbf14`;
- replay baseline sources `a8ae7eea65fdf4781989cc751d7d9de7ec9fe6ca` and
  `18babfa80dea4acb31fd30be2ae00b3610d42ed2`, imported as `d6c21f8` and `592de01`;
- incomplete-run evidence `9ea05e64edbe66d075b2fda6e7b313a2f198ae72`, imported as `4824eba`;
- exact tested Security source `eaab8645cf8aaee6e62120f65d24ebd911a047ad`, imported as
  `565c34b`, and final docs/evidence `54640b07554882dcd3322d84f2bba398fadc94c0`,
  imported as `b929605`;
- Testing final result history `217ccffd75ffcd251c06e9aeb637ad223aa64eab` and
  `1f2fa577f94911b05ecc50d8b25b7a2a9d16c6f2`, imported as `260d8c9` and `c38cfb1`;
- chief-owned AGENTS, CURRENT, PRODUCT, TASK_GUIDE, TASK_STARTERS and chief handoff history
  reconciled through remote foundation `45faa4243d1ba6321767b76f4ce17896b4298903`.
  This task copied those decisions through their commits and made no roadmap or product decision.

The only workflow additions relative to `00df57a` are
`.github/workflows/security-platform-bootstrap.yml` and
`.github/workflows/security-replay-baseline.yml`. No runtime page/script/style, generated drill,
sitemap, application migration, browser gate, deployment workflow, package file or live setting changed.

## Verification

### Executed evidence reused unchanged

The Security executable/SQL/workflow files on this branch are byte-for-byte identical to exact
tested source `eaab864`. [Run 35277724943](https://github.com/rathunter69/Hotkey.gg/actions/runs/35277724943),
job `105392248802`, executed that source on Ubuntu with Node 22.23.2/npm 10.9.8 and the pinned
Postgres/Auth images. The overall workflow correctly concluded **failure** because permissions
remain vulnerable.

Both fresh isolated instances:

- replayed all 52 unchanged migrations;
- emitted complete 56-result streams;
- passed the same 44 context/allowed/denied controls;
- failed the same 12 DATA-01 authorization assertions;
- rolled back hostile probes and passed named cleanup.

The durable evidence `supabase/tests/evidence/replay-baseline-35277724943.json` was independently
parsed on this combined branch. It contains two instances, 52 migrations and 56 assertions per
instance, identical input files and failure identities, 44 pass / 12 fail, cleanup `PASS` twice,
and CI/result `failure`/`FAIL`. No fixture, migration or unexpected control failure is hidden.

The inherited browser/runtime/test tree remains byte-for-byte identical to Testing source
`4ea428ba1504ee04b3d01943df5f7cd1b68a2c4d` and accepted integration `00df57a`.
Its complete pinned local matrix and exact Linux gate
[35274460688](https://github.com/rathunter69/Hotkey.gg/actions/runs/35274460688)
remain applicable; all 35 recorded job steps passed. They were not rerun for database-only files.

### Checks run on the combined tree

| Check | Result |
|---|---|
| `node dev/run-checks.js static`, Node 22, `GATE_BASE=00df57a` | All seven commands passed; inherited 39 catalog warnings remain warnings. |
| `node --test supabase/tests/runner.test.js supabase/tests/platform-bootstrap.test.js supabase/tests/replay-baseline.test.js` | All 11 guard tests passed. These verify fail-closed test infrastructure, not repaired permissions. |
| `node supabase/tests/replay-baseline.js --plan` | Passed; inventories two fresh instances, 52 unchanged migrations and one 56-assertion fixture without starting a database. |
| Source/blob comparison | All final Security files match `54640b`; Security executable/SQL/workflow files match tested `eaab864`; browser/testing files match `4ea428b`; Testing handoff matches `1f2fa57`. |
| Scope/diff review | Only the two dedicated Security workflows were added under `.github/workflows`; no runtime, generated, migration, gate, deployment or package diff. `git diff --check` passed. |
| Independent review | Confirmed scope, source equality, evidence consistency and correct failing status. No integration defect found. |

No container, browser server, production service or live database was contacted during the
integration checks. Repeating the full browser gate or two-instance replay would duplicate
successful evidence with identical executable inputs, so neither was rerun.

## Reproduced failures and remaining limits

The 12 failures are the required failing-before evidence for DATA-01:

- direct desk creation bypasses full-account and PRO requirements;
- direct membership permits self-captain assignment and manufactured seniority;
- owner/creator writes can assign verification and school association;
- direct applications bypass full-account, private/closed recruiting and five-pending limits.

These are isolated source-database results, not production exploit tests or proof of deployed
schema parity. DATA-01 remains unrepaired. DATA-02 profile privacy and DATA-03 MFA remain separate.
Live HTTP/Auth journeys, production schema/grants/configuration, database delivery, main protection,
hosting origin, rollback/recovery, payments and launch acceptance remain unverified or unresolved.

No fixture expectation, migration, grant, policy or schema was weakened to make the run green.
No production data, Auth setting, billing setting, GitHub protection rule, main branch or deployment
was changed.

## Handoff to the chief

Proposed shared-status result: the accepted browser/account/structure groundwork and complete
database-test infrastructure now coexist on one verified branch. The browser gate is green;
the isolated database baseline is reproducible and correctly red with 12 DATA-01 failures while
44 controls stay green. This completes test infrastructure and evidence, not permission repairs.

The next security action requires a separately authorized, minimal forward repair for the 12
authorization boundaries, preserving this failing-before evidence and all 44 passing controls.
The chief owns sequencing with the separate catalog/flow decision review. This handoff does not
start either implementation.

This report's Git history supplies its final documentation commit. Push and verify the remote
branch/file before reporting continuity complete.
