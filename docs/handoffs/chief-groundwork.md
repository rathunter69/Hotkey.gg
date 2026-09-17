# Chief groundwork review

Updated: 2026-09-17
Owner: chief task `01a0b0fa-d857-7002-ab95-1da0a1cfb858`
Shared guidance branch: `codex/repository-foundation`
Reviewed application/testing tree: `6c984161c31bc4637dbe88b73a4da8408cefdf1d`
Tested code within that checkpoint: `c702c6932b342cd36656317f7ce50f1c33b7df3e`

## Request and boundaries

Wolf asked the chief to orchestrate testing/security groundwork, review security and the
GitHub file structure, and make the file structure cleaner. The chief reviewed repository
metadata/source and coordinated existing area tasks. Implementation stays with those tasks.
One bounded documentation/archive cleanup is brought forward; broader catalog/progression
and site redesign remain in their agreed order. The current assignments/results belong in
[CURRENT.md](../CURRENT.md), not a second backlog here.

No main merge, deployment, production test, live security-setting change, billing activation,
data deletion or catalog rebuild is authorized by this review. Pending local files were
preserved. Remote source/report files, rather than this PC's checkout, supply this evidence.

## GitHub and release security

| Boundary | Fresh evidence | Interpretation / owner |
|---|---|---|
| Main protection | GitHub branch metadata still reports `protected=false`, required-check enforcement off and empty contexts/checks; rulesets collection is empty. Main remains `434bc0e8764e741e0e11f84cf51d61a1755d7c67`. | The earlier D01 gap remains. A proposal for required review/checks belongs to Git/testing; no live rule was changed by the chief. Choose actual check names after the new full gate is verified. |
| Test versus deployment workflows | The reviewed tree contains `.github/workflows/gate.yml` and `supabase-deploy.yml`. Gate is triggered by PR/main pushes. Database delivery is independently triggered by main `supabase/**` changes or manual dispatch. | Keep a test-only route separate from publishing. A passing website gate does not certify database delivery. Testing owns its gate; production workflow edits/release remain outside this batch. |
| Workflow privileges | Neither reviewed workflow declares `permissions`. Both use action tags; database CLI version is `latest`. Effective repository-default token permissions were not accessible/verified. | This is configuration ambiguity, not proof of a write-capable token. Testing was asked to give its workflows explicit minimal permissions and verified immutable action references. Deployment hardening requires a separately reviewed batch. |
| Database delivery | Source still links the live project, runs `db push --include-all`, and deploys functions. No protected environment or serialized deployment is declared in that file. | Do not invoke it as a database test. Earlier failed-deployment evidence is reused; no new deployment was attempted or claimed. |
| Secret hygiene | `.gitignore` excludes local environment files. The gate invokes `dev/check-secrets.sh`, which scans tracked files for selected value-shaped patterns. | Presence of a scanner/ignore rule is not a repository-history or secret-settings clearance. No secret values were read or saved in this review. The testing owner should record actual scanner execution. |
| Current security defects | Accepted account isolation covers the shared navigation boundary. The existing DATA-01/02/03 desk, profile privacy and MFA findings remain unrepaired. | Security owns synthetic permission cases and test setup now; runtime/schema repairs follow separately after useful failing evidence. No live exploit or customer-data sampling. |

Source files: [gate](https://github.com/rathunter69/Hotkey.gg/blob/6c984161c31bc4637dbe88b73a4da8408cefdf1d/.github/workflows/gate.yml),
[database delivery](https://github.com/rathunter69/Hotkey.gg/blob/6c984161c31bc4637dbe88b73a4da8408cefdf1d/.github/workflows/supabase-deploy.yml),
[secret scanner](https://github.com/rathunter69/Hotkey.gg/blob/6c984161c31bc4637dbe88b73a4da8408cefdf1d/dev/check-secrets.sh).
GitHub's [secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use)
supports minimum workflow permissions and action commit pins. Its
[manual workflow guidance](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
requires a dispatchable workflow on the default branch. That limitation is not permission
to merge a test workflow into main or invoke the production workflow.

## Repository structure review

The recursive GitHub tree at 6c98416 was complete (`truncated=false`). File counts:

| Location | Files | Role / current constraint |
|---|---:|---|
| Repository root | 47 | Static application pages/assets, hosting entry files, tooling manifests and several historical setup notes. Moving the application wholesale changes served URLs and test discovery. |
| `dev/` | 163 | Active tests/generators mixed with historical plans, mirrors and prototypes. Existing tests parse source paths; classify before moving. |
| `docs/` | 18 | Current guidance, audits and area handoffs at this application checkpoint. Later chief updates live on foundation. |
| `art/` | 35 | Mixed assets/prototypes. At least the social image is a live dependency; prior audit found public prototype URLs. |
| `drills/` | 75 | Committed generated drill/library HTML used by static hosting. Keep and regenerate from sources when needed. |
| `supabase/` | 56 | Ordered migrations, current function source and project configuration. No history renaming/squashing for tidiness. |
| `.github/` | 2 | The two workflows above. No separate security policy or CODEOWNERS file exists in this reviewed tree; adding one alone would not enforce review. |
| `.agents/`, `.claude/` | 40 / 4 | Assistant skills/configuration and historical automation; these have consumers outside the website and are not blanket deletion candidates. |

Counts are an inventory, not an unused-file finding or secret scan. Both database cleanup
reports already establish positive dependencies for all 18 public tables; no table deletion
is part of making the GitHub view cleaner.

### Structure rules for the authorized cleanup

- Keep a short root README that points to current guidance, source ownership, checks and handoffs.
- Put current guidance under `docs/`; group superseded planning/history under a clearly named
  archive, retaining provenance and correcting both inbound and relative outbound references.
- Keep current runtime URLs and generated output stable during this documentation batch.
- Defer moving tests/generators until discovery rules and consumers move together in a separate
  reviewed change. Defer SQL mirrors that are still used by tests.
- Preserve original Foundations feedback and useful design references independently from old
  automatic waves, quotas or assistant instructions.
- A folder called `archive` does not make a file private. Hosting boundaries need separate
  verification before claiming development material is excluded from publication.

These are constraints for the cleanup owner's concrete before/after result, not a claim that
a new runtime layout is implemented. The safe next layout is incremental; no frontend framework
migration is needed to make ownership and entry points clearer.

## Evidence, limitations and follow-through

Remote reads covered branch/ruleset metadata, the complete tree, architecture guidance, two
workflow sources, ignore rules, the scanner, project configuration and existing security/testing
reports. The GitHub connector rejected the workflow-list endpoint; workflow source paths were
instead confirmed through the complete Git tree. The Supabase changelog markdown endpoint
returned an unsupported content type; the chief made no API/schema implementation based on it.

No application tests were rerun for this chief documentation review. Area owners run checks
for their changes and return pinned GitHub handoffs; the chief verifies those results and
cross-branch file compatibility before recording the batch as complete. Repository-wide
secret history, hosting origin/output, live account settings, backup/restore and whole-schema
parity are outside this review. None is marked clean by inference.

Current assignments: testing task `01a0af90-b973-7572-b7ff-d5bf9f504a52`;
security task `01a0af8b-9a97-7593-a1d2-6d2491cfe947`;
structure task `01a0af90-7fb2-7571-a5d6-b82354d57540`.
The additional database-assessment task stays paused to avoid duplicate work.
