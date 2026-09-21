# Computer-transfer handoff — September 21, 2026

Owner: Share project with another session (task 01a0c450-84e4-7a82-a9c1-48824dc4e5ff).
User request: package Hotkey.gg to move to a new computer.
Scope: project/work context transfer only. No implementation, main merge or deployment.

## Deliverable

Local archive: `Hotkey.gg-transfer-2026-09-21.zip`, in the user's Hotkey.gg OneDrive folder.
Size: 288,495,853 bytes.
SHA-256: `33eb39d82bd5dd2ce5e0fb2eceeee99daa3ff8587bcba8021f837540bc075f44`.
The adjacent `.zip.sha256` file records the checksum. Cloud sync and receipt on the other computer are unverified; copy the ZIP explicitly or verify OneDrive sync.

The ZIP contains 6,923 payload files plus its manifest:
- A self-contained Git bundle with 80 named refs: local heads, all 32 GitHub branch tips captured, and older recorded remote refs.
- Full working-file snapshots of all 15 registered work areas, retaining the two dirty areas, modified/untracked files, deleted-file lists and staged/unstaged patches.
- The separate payments-plan handoff and parent workspace guidance.
- Latest shared guidance and branch-labelled area handoffs.
- Readable user/assistant exports from all 12 earlier visible project tasks (138 turns exposed by the task reader), with a task/sidebar index.
- Nine locally saved UI mockup/reference files.
- START-HERE.md, OPEN-IN-CODEX.txt, RESTORE-WINDOWS.ps1, validation evidence and SHA-256 file manifest.

Native Codex app databases/sidebar state, tool output/reasoning, chat attachments, browser sessions, authentication and installed dependencies are not imported. The transcript exports may retain tool-level truncation. Project-specific skills/configuration and saved scratch/gate artifacts are preserved. No hosted database/customer-record dump is included. The empty outer Git repository has no commits or unique project content and was omitted.

## Restore

Extract the complete ZIP. Open the extracted folder in Codex and use OPEN-IN-CODEX.txt, or run RESTORE-WINDOWS.ps1 with a new destination and `-RestoreOriginalWorkspaces`. An existing destination is rejected. Install Git first; install Node.js 22+ and run the restored development setup afterward. Reconnect account/plugin sign-ins on the new computer.

Primary application checkout: `codex/groundwork-db-integration` at `16ee8306a8c170db9f8fe2e051b44b0519782ae1`, restored to fresh local branch `codex/new-computer-start`.
Separate shared-guidance checkout: `codex/repository-foundation` at `e1719a7ec7daeb8f014a92fefddd6f0a960000c0`.
Keep these separate: the local original source notes are older, and foundation's code is not the accepted newer implementation baseline.
Original work areas restore detached at their original commits. Their full raw snapshots remain in the package; unchanged text may use Git's native line endings, recorded in restored-line-endings.json.

## Executed verification

- Final ZIP integrity and every payload SHA-256 verified.
- Real offline Windows restore completed with all 15 original work areas.
- All restored HEADs and Git statuses matched the saved states.
- All 6,746 working-file snapshots matched original bytes and restored content. Four unchanged text files differed only in CRLF/LF encoding; original bytes remain archived. The separate payments handoff also matched.
- All 32 captured GitHub tips matched the restored refs; primary checkout was clean.
- All 42 modified/untracked files checked, including payments, already had exact raw or LF-normalized blobs reachable on captured GitHub branches. They were preserved in the ZIP without publishing duplicate application changes.
- High-confidence credential/private-key patterns found no matches in included working files, task exports or UI previews, or in 11,966 reachable historical blobs (737,967,439 bytes). This was not an exhaustive historical security audit.
- Independent review checked inventory and restore correctness. A first test exposed line-ending-only false modifications; the final script handles this narrowly and passed.
- Original workspaces were verified unchanged. No application test suite was rerun because application files were not edited.

## Remaining limits and next step

The ZIP is a point-in-time local deliverable, not a live sync or whole-PC backup. Private task transcripts and the archive are not published to GitHub. Native task continuation requires supported device connection/handoff; reference: https://learn.chatgpt.com/docs/remote-connections.
The current transfer instructions are the only new repository documentation for this task. Shared CURRENT.md and PRODUCT.md remain chief-owned.

Next: copy the ZIP to the new computer, verify the checksum, extract and restore, then sign into services. Read the latest shared CURRENT/PRODUCT, area handoff and relevant task export before resuming work; later task activity is outside this snapshot. This move does not authorize new features, deployment, billing activation, data deletion or catalog/progress resets.
