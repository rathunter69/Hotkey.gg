# Repository structure

Updated: 2026-09-17
Task: `01a0af90-7fb2-7571-a5d6-b82354d57540`
Branch: `codex/repository-structure`
Starting commit: `6c984161c31bc4637dbe88b73a4da8408cefdf1d`
State: documentation/history cleanup, locally verified; no runtime or database change.
Owned files: `README.md`, selected historical documentation references, `docs/history/`, and this handoff. `CURRENT.md` and `PRODUCT.md` remain chief-owned.

## Scope and outcome

The repository root previously mixed the current entry point with a 121 KB historical session
handover. That made a fresh reader choose between the active guidance and a record whose own
headings described old queues as live.

This batch moves the complete historical record to
`docs/history/PROJECT_CONTEXT.md`, repairs its two relative Markdown links, and adds a root
compatibility page at `PROJECT_CONTEXT.md`. Existing repository links retain a readable landing
page; the canonical current README now points readers directly to the archive. `docs/history/README.md`
explains the archive's role and links back to the current entry points.

No runtime source, generated output, migration, test harness, workflow, asset, database object,
or public site route was moved or changed. The historical content is preserved as a Git rename
plus its one path correction. Nothing was deleted.

### Before and after

| Location | Before | After |
|---|---|---|
| Repository root | `PROJECT_CONTEXT.md` was a large historical handover beside active runtime files | A concise compatibility page directs existing links to current guidance or the archive |
| `docs/` | Current guidance and historical material were separated only by text warnings | `docs/history/` identifies dated records and their current entry points |
| Historical record | The full handover owned the root path | Full content lives at `docs/history/PROJECT_CONTEXT.md`; its README/CURRENT links work from the new location |

## References repaired

- `README.md` now links to the archived record and states that the root path remains for compatibility.
- `docs/TRANSITION_REVIEW.md` points its design-history inventory to the archive.
- `dev/AUDIT_R417.md`, `dev/PROJECT_REVIEW.md`, `dev/TUTORIAL_CHAPTER_SPEC.md`, and
  `dev/audit-r452/audit-perf-stale.md` point historical references to the canonical archive.
- The compatibility page covers remaining older textual references, including the chief-owned
  `docs/CURRENT.md` row, without changing chief-owned guidance.

## Verification

- Re-read AGENTS, README, CURRENT, DEVELOPMENT, TASK_GUIDE, ARCHITECTURE, PRODUCT, the prior
  cleanup report, and the complementary database report. Used the accepted integration commit
  `6c984161c31bc4637dbe88b73a4da8408cefdf1d` in a separate worktree; the dirty original checkout
  and other worktrees were preserved.
- Focused independent review searched exact inbound/outbound references and runtime, generator,
  test, workflow and deployment consumers. It found no such consumer of `PROJECT_CONTEXT.md`;
  documentation references were mapped before the move.
- Confirmed the two Markdown links inside the moved record resolve to the root README and
  `docs/CURRENT.md`; confirmed root/archive/current links resolve locally. `git diff --check`
  passed. A post-move exact-path scan found only documented references and no runtime/tooling
  consumer.
- No `npm run check` or browser suite was run because this is a documentation-only move with no
  runtime, generated, workflow or test change. No live service was touched.

Limits: a GitHub URL that names the old `PROJECT_CONTEXT.md` blob path may not redirect after the
move; the repository compatibility page protects in-repository references, not external deep
links. This is recorded rather than assumed. Moving inside this static repository does not make a
file private; no public asset or served page was moved.

## Decisions for the chief

Wolf authorized one safe documentation/history organization batch while broader structure and
catalog work remain paused. This batch preserves the historical handover and makes the active
entry point unambiguous. No product decision changed.

Proposed chief update: link the historical-context row in `docs/CURRENT.md` to
`docs/history/PROJECT_CONTEXT.md` when integrating this handoff. The root compatibility page
allows that update to be deferred without a broken repository path.

## Remaining structure plan

| Stage | Candidate | Why it is separate | Required proof before work |
|---|---|---|---|
| 1 | `dev/CONTINUITY.md`, `dev/PIPELINE.md`, `dev/WORKFLOW.md`, `dev/ROADMAP.md` | They are historical, but current PRODUCT and multiple retained specifications still cite them. Moving them would require a broad reference rewrite. | Build a complete reference map; decide which design decisions belong in current docs; preserve a compatibility strategy and have the chief approve shared-guidance changes. |
| 2 | Historical SQL mirrors under `dev/` | The certificate mirror is read directly by the leaderboard test; related comments overlap runtime/test owners. | Testing migrates consumers to the canonical definition, runs static and leaderboard coverage, then verifies no documentation/deployment consumer remains. |
| 3 | `dev/audit-r452/` and other older audit material | A current curriculum guard still cites an audit report; individual docs remain source evidence. | Separate test-owned references and preserve audit provenance before an archive move. |
| 4 | Art prototypes and served design files | Some prototypes are public static URLs and `art/og.png` is live metadata. | Decide public URL/hosting treatment and update all asset/design consumers; an archive directory alone is not access control. |
| 5 | `.claude`, `.agents`, root runtime/static layout | Assistant configuration may be discovered outside code search; root static files are deployed directly. | Verify discovery, deployment and user workflow first. Do not impose a `src/` migration on the static site. |

The next recommended structural turn is a read-only decision map for the four dev coordination
documents, followed by one approved move only if the current product references have a stable
replacement. Do not combine it with the security repairs, SQL-mirror consolidation, hosting work,
or catalog redesign.
