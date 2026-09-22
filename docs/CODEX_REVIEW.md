# Review of Codex work on hotkey.gg — 2026-09-21

Historical context for the rebuild. Kept for provenance; nothing here is a live instruction.

Scope: all 18 codex/* branches vs main (434bc0e, PR #250). Nothing merged or deployed.

## Verified real (kept in the rebuild)
- Engine defects (all reproduced from the old evaluator, now fixed and pinned in app2/tests/excel-defects.test.js): AVERAGE/MIN/MAX/MEDIAN coerce blanks to 0; INDEX no bounds; ROUND uses Math.round; TRUE/FALSE literals throw (VLOOKUP(...,FALSE) fails); COUNTIF/SUMIF equality-only; MATCH ignores match type; YEARFRAC ignores basis.
- Grader weakness wider than Codex reported: weak "live" helper in 18 drills.
- Live DB holes DATA-01 (desk direct-write bypasses) and DATA-02 (world-readable profiles). DATA-01 was patched on the old project 2026-09-21; both are moot once the old project is deleted.
- The nav.js account-isolation fix (generation tokens, stale-response guards) is on branch codex/groundwork-db-integration and is the reference for Phase B account switching.
- Codex's test-runner, browser isolation helper and SHA-pinned CI were carried into app2/.

## Why the rebuild exists
Codex produced ~8,500 lines of append-only planning docs and almost no product code, and left 12 permission holes unrepaired. The rebuild replaces that with a thin decision spec + code. codex/* and claude/* branches are reference only; they are archived/deleted at cutover.
