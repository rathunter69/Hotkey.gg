# UI/UX, onboarding and web structure

Updated: 2026-09-19 (Europe/Berlin)
Task: `01a0b908-48f9-7f32-94b2-d0ca46f13de3`
Chief: `01a0b0fa-d857-7002-ab95-1da0a1cfb858`
Branch: `codex/experience-site-plan`
Starting accepted code: `16ee8306a8c170db9f8fe2e051b44b0519782ae1`
Shared guidance read remotely: `4ec23e01cb958d5dfed5e92875db3f7002eab1e1` on `codex/repository-foundation`.
Refreshed guidance: `4d964901a4f06493695c11bb8f04c4769d607ab0`; its CURRENT update registers this planning assignment, with no changed product policy.
Final shared-guidance refresh: `2b16827aecf9b1c773f9b48d9b986c506c061c8a`; incorporates Storage's proven-comparability and short published submission-grace principles. Accepted code baseline and ownership remain unchanged.
Owned file: **only `docs/handoffs/experience-site.md`**.
State: planning outlines reviewed; full layouts remain proposals except the two explicit choices below. No application implementation, merge or deployment. Final commit identity is supplied by Git history and the verified chief handoff.

## Scope and outcome

Six screen outlines apply the agreed learning flow while preserving the ribbon and worksheet.
One main action leads each ordinary-learning screen; Help, saving and optional competition have
clear places. These are presentation proposals except where explicitly marked confirmed.
They do not define new learner states, rewards, lesson content, storage schemas or access rules.

**Two UI decisions confirmed by Wolf in this task, September 19:**

1. Help uses a **side panel beside the worksheet**, keeping the worksheet visible.
2. A **small Challenges link beside Home and Catalog** provides optional challenge access.

Source: Wolf's explicit selections in this task's two-option question group. These settle
placement only; exact dimensions, narrow-screen treatment, final wording and the other outline
details remain proposals. They do not authorize implementation or change any learning rule.

## Sources and coordination

| Evidence | Use and limits |
|---|---|
| [Latest-read CURRENT](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/CURRENT.md), [PRODUCT](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/PRODUCT.md), [AGENTS](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/AGENTS.md), [TASK_GUIDE](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/TASK_GUIDE.md) | Authority, ownership, settled September 18–19 policy and documentation-only validation exception. This worktree's older shared documents are not the latest product brief. |
| [Catalog handoff at 15de791](https://github.com/rathunter69/Hotkey.gg/blob/15de791605cbfb4fa6bbc26c2d8f5f4a94139477/docs/handoffs/catalog-progression.md) | Reuse its proposed beginner, experienced, returning, competitor and certificate-holder journeys; learner semantics and detailed contracts stay with that owner. The dated approvals supersede older proposed wording in the report. |
| [Catalog ownership confirmation at 194db93](https://github.com/rathunter69/Hotkey.gg/blob/194db93780b4e9a3187271687d2d049e2fe4922f/docs/handoffs/catalog-progression.md#september-19-coordination-with-ui-and-saved-progress-planning) | Catalog confirmed no newer unshared decisions, delegated presentation ownership to this assigned UI task, and will not duplicate these outlines. Reused its first-exercise/helped-result/home sketches as well as its journeys. |
| [Storage contract at 8c7686c](https://github.com/rathunter69/Hotkey.gg/blob/8c7686c649eb15d0dbc5429e79208ea11ff311e6/docs/handoffs/leaderboards-storage.md) | Owner confirmed no material mismatch with this handoff's b0d2f17 saving table. Receipt/award/publication, unknown replies, owner isolation, partial reads/imports and local failure agree. Detailed implementation contract remains proposed. |
| [Accepted integration at 16ee830](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/docs/handoffs/groundwork-db-integration.md) and [account/testing handoff](account-testing-integration.md) | Accepted code lineage. Existing browser evidence is green; database permission evidence remains 44 pass/12 fail. Neither establishes the proposed experience or live saving. |
| [Experience audit](../audit/EXPERIENCE.md), [engine/content audit](../audit/ENGINE_CONTENT.md), [audit index](../audit/README.md), [architecture](../ARCHITECTURE.md) | Reused EXP-01–04 save/error/keyboard findings, onboarding overlap, E7 inconsistent next lesson, and source/generated-page ownership. Findings are not newly reproduced or repaired here. |

Required remote README, DEVELOPMENT, TASK_STARTERS (Area 5 and September 19 follow-up), handoff
format and branch inventory were also read. No full audit, historical tutorial import or new
curriculum investigation was needed. The dirty original checkout was preserved; this branch
starts from accepted code in a separate worktree and reads newer guidance separately.

Ownership was raised with Catalog before drafting overlapping presentation, and with the chief.
Catalog task `01a0b148-2693-7901-af91-934c83cabe1d` retains content, path meaning, learner-state
definitions and eligibility. UI consumes those proposals rather than creating another state
model. Saved-progress task `01a0b908-9ee9-7d31-afb6-9733f5d421bf` owns durable saves, account/guest
ownership, conflicts, duplicate retries, history and comparison contracts; it was sent the
display-state requirements below. Payments retains exact inclusion/entitlement lifecycle;
Security retains authentication and permissions. Chief alone integrates CURRENT and PRODUCT.

Storage's September 19 coordination response agrees that outcome, persistence receipt and
public eligibility/publication are independent. It requires owner-bound durable account receipts,
safe retries of the same attempt, explicit unknown-save status after a lost reply, last-good
account-owned snapshots on read failure, and exclusion of ambiguous guest-import records.
These are coordinated draft contracts, not newly approved storage behavior or working code.

## Fixed inputs, not another decision packet

- Guest lesson before account creation; quick suggested/changeable Windows/Mac setup first.
  Afterward, two skippable/changeable experience and goal questions recommend from one catalog.
- Ordinary learning: visible instructions, optional hidden timer, freely pausable, calm undo/retry.
  No lives, forced restart or XP deductions. Correct legitimate routes remain valid.
- Opening Help or reading instructions/explanations alone does not mark assistance. Solution
  steps, Guided help and solution replay do. Helped or spreadsheet-mouse work retains learning
  completion but earns no XP or qualifying timed/competitive record. Page controls are separate.
- Continue is primary after helped ordinary work, with Try solo clearly alongside. Try solo
  starts a fresh attempt judged on its own help/input record; the earlier attempt is retained.
- One XP level; actual eligible awards, no speed multiplier or achievement bonus XP. Inclusive
  completion certificates remain separate from readiness, XP and speed. No new mastery/rank ladder.
- Personal drill speedruns remain available subject to access. Benchmark/Daily entry is optional;
  unlimited attempts, best eligible time. Goal before Start, reveal starts continuous scored time.
- Useful beginner learning/repeats/personal speedruns are free; advanced curriculum subscription
  and major-jump readiness are separate requirements. Prior independent work or test-out can
  satisfy readiness. No XP gates, exact paid list or new checkpoint is chosen here.
- Keep every approved kind of history private by default, deliberate public challenge results
  separate, and existing earnings/credentials/history intact. No old timing equivalence assumed.
- Storage's September 19 approvals: compare PBs only across proven-comparable task, clock and
  Excel-setup groups; retain other groups visibly. Delayed public submissions have a short
  published grace period, with duration, trusted evidence and finalization still open.
- Brief meaningful-action success feedback, bigger finish, soft sounds after Start, obvious
  remembered mute, quiet typing. Pixel art stays with identity/achievements.

## Navigation and page responsibilities

**Confirmed placement:** Home · Catalog · Challenges. Keep Challenges visually modest.
**Proposed shell:** the existing identity/account menu holds My progress, profile/achievements,
account and preferences. Guest state offers Sign in there. Avoid a row of equal-weight mode,
rank, certificate, streak and subscription buttons around the worksheet.

| Destination | Responsibility and return path |
|---|---|
| Home | One Continue card; catalog is an easy secondary route. Completed lessons return here without reopening onboarding. |
| Catalog | Browse the shared lessons/tasks/models and recommended paths. Opening a lesson shows its goal/access context. Return restores search, filters and focus. |
| Challenges | Benchmark/Daily selection and their boards; secondary optional quick practice. No extra race or practice/ranked switch. |
| Lesson/workspace | Existing ribbon/sheet, visible objective, one Help entry, mute and a compact lesson-options menu. Leaving uses the honest persistence rules below. |
| My progress | Existing stats/history purpose: private attempts, personal speedrun records, certificates and achievements. Preserve access to earned/historical records; exact legacy-rank display belongs to the later history plan. |
| Reference and support | Reference remains discoverable through Help and the footer/menu; account/support help must not be confused with solution help. Footer retains About, Contact, legal/security and optional Desks/enterprise routes. |

These are information responsibilities, not new URLs or approval to merge/delete pages.
Existing `index.html`, `stats.html`, `profile.html`, account, reference, boards, Desks, public
information and `drills/` entries retain their routes until a separately agreed migration.
Generated drill pages should eventually lead into the same lesson/access context and shared
next-step decision; they must not independently claim everything is free. Do not edit their
generated output to implement this plan. No framework change is proposed.

Deep links preserve the requested destination through setup/sign-in where permitted, explaining
any access/readiness limitation. Browser Back must not silently restart a scored attempt or
publish a result. A missing/retired lesson offers Catalog and available historical records;
it must not silently redirect an old scored result into a different lesson revision.

## 1. First guest lesson

```text
Home   Catalog   Challenges                         Sign in
Try a short Excel lesson
Excel setup: [Windows] [Mac]       (suggested; changeable)
Goal: [one clear, catalog-owned everyday outcome]
[Start lesson]                       Choose my starting point
```

Start opens the retained worksheet/ribbon with a short visible goal/instruction area, Help and
mute. No profession survey, account wall or mode picker precedes practice. The experienced
shortcut opens Catalog, retaining a route back to the recommended starter. It does not mark
unplayed lessons complete or imply advanced readiness. Exact starter content stays Catalog-owned;
do not silently choose between the old Navigation→Autofit and catalog sequence (E7).

Setup follows Windows-primary direction without promising unverified Mac parity. If a selected
setup cannot support the task, explain the specific limitation before Start and offer a
verified alternative when one exists; do not merely relabel a Windows-only shortcut. Narrow
screens/non-keyboard devices need an honest compatibility state; desktop layout is not proof
of phone playability.

After the first result, proposed sequence: **Continue → personalize (optional) → recommended
next lesson**. Present two short questions one at a time, with Skip and a later Edit route:
experience (new / some use / regular use) and goal (everyday work / work or study / finance/models).
These exact words/options are draft copy for Catalog to refine; they never establish readiness.
Skipping uses Catalog's default recommendation. The first result also carries a secondary
Save to an account invitation, repeatable from Home, so signup never blocks Continue.

The signup path shows records confidently attributable to this guest/device context, excluding
ambiguous or account-owned records, and asks whether to carry them privately into the identified
new account. Continue without import remains available. Confirming
signup alone is not import confirmation or proof that a save succeeded. Do not include another
account's history, silently publish guest records, or promise imported competitive eligibility.

## 2. Help beside the worksheet

```text
Goal / instructions                       Help         Mute
[existing ribbon]
[existing worksheet]            | Help                  Close
                                | Understand the task
                                | [Explain the concept]
                                | Need a solution step?
                                | [Show a step]
                                | More support: Guided / Replay
```

The side-panel location is confirmed. The contents and progressive disclosure above are a
proposal: explanation first; one visible step-help action; Guided and replay within the same
Help surface. Keep the goal visible when Help closes. Avoid a second tour, separate automatic
tutorial overlay, or simultaneous Hint/Guide/Demo buttons around the sheet. Existing overlapping
systems are evidence to map, not permission to delete their code.

Before a solution-revealing action, show its consequence beside that action: **“Solution help
keeps your lesson progress; this attempt earns no XP or qualifying time.”** Opening the panel,
reading instructions or reading a concept explanation has no such consequence by itself.
Do not hide solution steps inside a supposedly unpenalized explanation. During an already
helped attempt, show a small “Using solution help” status without repeated warnings.

In a scored attempt, Help never silently pauses time. Label “Clock continues” and explain the
eligibility consequence before a reveal. For ordinary learning, the proposed Pause/Resume
control sits in lesson options; pausability is approved, but this placement is not. Exact
active-time measurement belongs to Saved-progress.
Only supported recovery paths should be offered: no false “resume this score later” promise.

## 3. Helped and solo results

```text
Lesson complete — with help        (or: Lesson complete — solo)
[brief confirmation of the correct completed task]
[compact actual XP / applicable certificate progress]
[honest save status, separately from completion]
[Continue: next lesson]     [Try solo / Practise again]
Details v                         Speedrun this lesson
```

| Result context | Message and actions |
|---|---|
| Helped ordinary completion | Positive completion; explain “No XP for this helped attempt.” Continue primary, Try solo clearly alongside. Applicable completion-certificate credit is allowed; do not imply readiness was passed. |
| Fresh solo completion | “Solo” only when the attempt's own assistance/input evidence supports it. Show actual confirmed XP, or a truthful pending/unavailable state, not a predicted award. Continue primary is proposed; Practise again secondary. |
| Spreadsheet mouse used | “Lesson complete” with a compact reason for no XP/qualifying time; do not call it solution-assisted unless help was also used. Completion-certificate progress can still count under the approved rules. |
| Fresh Try solo selected | Retain the helped result; show the goal and Start for a new equivalent attempt. No inherited assistance penalty, forced wait or automatic public challenge entry. |
| Deliberate personal speedrun | Lead with elapsed time and comparable PB/improvement, then key-press total and save status. Retry is proposed primary; Back to lesson secondary. No claim of a PB when eligibility, comparison or saving is unresolved. |

Award confirmation is independent of saving: display an XP award only when its own authoritative
award evidence is known. Account retention needs an owner-bound receipt for this result/current
identity, while public posting needs its own confirmation. A late receipt cannot update a
different account after switching. An unknown/lost save reply says “Waiting to confirm save.”

Details disclose supported elapsed/active-time labels, actual key presses, completed commands
and relevant history. Unknown historical facts remain unknown. Keep time banked distinct from
the approved but uncalibrated mouse-reference estimate; no invented numerical savings, XP,
accuracy score, certificate percentage or benchmark is displayed in this plan. Certificate
progress requires a defined applicable set/version and known completion data.

Speedrun stays one secondary contextual action, not a compulsory next mode. Completing an
ordinary lesson with its timer visible does not automatically create a qualifying speedrun or
publish a challenge score. Final speedrun/challenge eligibility and record claims use the
catalog/storage contract, including distinctions between older and new clock standards.

## 4. Returning home

```text
Home   Catalog   Challenges                    Account / My progress
Welcome back
Continue [unfinished ordinary lesson / next recommendation]
[brief reason or last confirmed learning state]
[Continue]                                  Browse catalog
[compact confirmed progress]                 Change recommendations
```

Use the Catalog-provided next step consistently on Home, results and catalog recommendations.
Resume is offered only when the actual ordinary-learning state is recoverable. Otherwise say
“Start again” or “Continue learning” and identify the lesson; do not imply a preserved worksheet.
Never offer paused-score resumption as ordinary learning continuation.

No trustworthy account history yet: show loading, or an unavailable message with Retry loading
and Browse catalog. Previously confirmed information may stay visible only for its owning
current account, labelled stale/incomplete, with “Last updated…” only if that time is known.
A read failure must not show zero progress or first-visit onboarding.
An actually empty history offers the starter. A completed path offers Catalog's next suggestion
or Browse catalog, without inventing another gate or resetting the completed path.

After sign-out/account switching, replace account-specific cards with the new identity's state;
never leave another learner's progress or pending-import details visible. Local guest-only
history and signed-in account history need distinct labels. Preserve access to personal records
and prior rewards from My progress without surrounding Continue with dashboards or ladders.

## 5. Catalog

```text
Home   Catalog   Challenges
Find something to learn        [Search]
Recommended for you             [Change answers]
[lesson/path title] [plain skill goal] [progress/access label]
[Open lesson]
Browse all                     [Filters]
```

Recommendations reference the same underlying catalog. Do not create duplicate curricula by
profession or separate progress for the same lesson in different paths. Proposed initial
surface: search, one recommended route and browse-all; place extra filters behind Filters.
Show lesson/task/model context when useful without turning those forms into three mode choices.

Lesson detail shows goal, selected setup, relevant readiness/access reason and one main action.
Freely explore included basics. At an approved major skill jump, missing readiness can offer
preparation or test-out; a subscription requirement is a different explanation. XP level cannot
stand in for either. If both requirements apply, state both rather than promising payment alone
will unlock entry. Prices, exact included lessons, expiry and purchase controls stay Payments-owned;
this plan does not activate checkout or reclassify current content.

No search matches: preserve the query and offer Clear filters. Failed catalog/progress/access
reads: name what is unavailable and offer retry without calling the catalog empty or the learner
unsubscribed. If lesson content is available but progress is not, browsing may continue with
progress labelled unavailable; protected access must not be guessed from a display fallback.
Completion labels distinguish helped from solo where evidence exists; unknown legacy state
does not become uncompleted. Path reordering cannot erase history or relabel old PBs.

## 6. Optional challenges and quick practice

```text
Home   Catalog   Challenges
Optional challenges
[Daily]                     [Browse benchmarks]
Each: goal / rule summary / access and comparison context
[View challenge]            [Leaderboard]
Quick practice: Rapid-fire
```

The Challenges nav link is confirmed; this page composition is proposed. Keep Rapid-fire a
secondary quick-practice route, separate from scored public cards and never a prerequisite.
Its unresolved awards/duration/result details are not assigned here. Individual-drill speedrun
remains on the lesson/result surface and in personal records, beyond the public challenge set.

Challenge detail precedes Start: goal, public-entry meaning, continuous reveal-start clock,
help/mouse eligibility, best-of-unlimited rule and known version/setup/event context. Deliberate
public entry must be clear before the attempt; a generic lesson Start does not opt someone in.
Exact entry/account/access controls remain a Catalog/Storage/Payments dependency. Do not display
an active start/entry affordance for an undefined or unavailable competition contract.

Scored result: time first, then confirmed eligible PB/event best and publication status. “Saved
privately” needs an owner-bound durable receipt; “posted to the leaderboard” needs separate
confirmation. Lost replies remain “Waiting to confirm save.” Eligibility failure may preserve private history
without promising an ineligible timed PB. Retry challenge is proposed primary, View board
secondary. Interrupted/invalid/unverified attempts need the contract's truthful status and a
fresh Start route; there is no implied clock pause or resume. Old and new timing groups stay
visibly distinct when a comparison is shown.

Compare times only when task, timing rules and Excel setup are proven comparable; preserve
other records in clearly labelled groups. For disconnected benchmark/Daily submission, show
public submission pending and the published grace deadline when defined, independently of
whether private saving is confirmed. Explain that late/unverifiable results remain private
history without a public placing. Do not invent a grace duration or claim queued work is durable
without a receipt/local-write confirmation. Event evidence and finalization stay Storage-owned.

Sharing reuses the same benchmark/Daily identity and rules. A proposed Share link action copies
the challenge link only after request; no separate race mode, private history exposure or paid
access bypass. Loading, successfully empty, unavailable and partially loaded boards are distinct;
partial data must not produce a confident overall placement.

## Keyboard, focus and feedback across all six screens

These are proposed acceptance requirements for later implementation, not tested accessibility claims.

- Use real links for navigation and buttons for actions, including Skip, mute, Help, filters and
  account options. Visible focus, logical reading order, Tab/Shift+Tab and native Enter/Space
  behavior must work without pointer-only controls (EXP-02).
- Before Start, focus stays on the goal/setup controls. Starting moves focus deliberately into
  the worksheet. Preserve normal spreadsheet/ribbon keyboard behavior and browser shortcuts;
  do not steal Tab from cell editing or bind a new global single-letter Help shortcut.
- Provide a documented keyboard route from worksheet to page/Help controls and back, discoverable
  before Start. The exact nonconflicting binding needs an engine/platform input review; it is
  unresolved, not a claimed working shortcut. A visible focus-return control is also required.
- The Help side panel is nonmodal: opening moves focus to its heading/first control, permits
  deliberate return to the sheet, and closing restores the exact invoking control/cell when
  still present. Escape closes Help only when Help owns focus; sheet/dialog Escape keeps its
  normal meaning. Narrow layout must retain worksheet visibility or offer an explicit supported
  layout limitation; overlay fallback has not been approved.
- Auth/import/confirmation dialogs contain focus, have a named heading and close/cancel route,
  and restore focus to their opener. Scored time must not silently pause because a dialog opens.
  Full page navigation focuses a useful heading; results announce completion without repeated
  focus theft. Back to Catalog restores the originating lesson link/filter state.
- Announce saving/loading/completion changes once through restrained status messages; do not
  read out every key press. Errors use readable text, not color or sound alone. Detailed failures
  must remain available after a transient toast disappears.
- Small success feedback follows meaningful correct actions, not every key press or one mandated
  route. Bigger finish stays brief and does not block Continue. Mistakes provide a location/goal
  cue and recoverable undo/another try without revealing a solution automatically.
- Show an accessible mute control beside Help, including its current state. Respect a remembered
  mute before playback; otherwise soft success audio begins only after Start/user interaction.
  Quiet ordinary typing, visual feedback when muted/audio unavailable, reduced-motion treatment
  and no focus-stealing animation are proposed. If preference persistence fails, say it applies
  for this visit rather than promising it is remembered across visits/devices.

## Honest saving and failure presentation

UI maps evidence supplied by Saved-progress to these display states; this table is **not** a
storage implementation or approval of offline durability, retry automation or conflict rules.
Completion, award confirmation, account retention and public posting are separate facts.

| Evidence available | Example display | Useful action / boundary |
|---|---|---|
| Verified guest write to device storage only | “Saved on this device. Not in an account.” | Save to an account; explain browser/device limitations. Never promise another-device recovery. |
| No verified durable copy | “Completed. Not saved yet.” | Keep current result visible; explain risk before leaving. Do not say “safe on this device.” |
| Account request in flight | “Saving to your account…” | Keep Continue usable where leaving is safe; do not show a save-success tick. Confirm XP only from its own authoritative award evidence, independently of saving. |
| Confirmed local pending copy, account unconfirmed | “Saved on this device. Account save pending.” | Retry save when supported. Auto-retry promises require Storage's explicit contract. |
| Lost reply / write outcome unknown | “Waiting to confirm save.” | Safe Retry save for the same attempt after the Storage contract is implemented; do not claim definite failure or create a second attempt. |
| Owner-bound durable account receipt for this identity/result | “Saved to your account.” | My progress; this alone makes no public-posting claim. |
| Save failed with a known retained local copy | “Account save failed. This result is still on this device.” | Retry save; retry the same result, never restart the lesson as a saving remedy. |
| Save failed with no known durable copy | “Not saved — keep this page open.” | Retry save; warn before leaving without claiming the page can survive reload. Unknown remote outcomes use the separate confirmation-pending state above. |
| Permanent rejection or ownership/payload conflict | Explain the rejected operation and what evidence is still retained | Stop blind retries; account-save rejection and public-score rejection are different outcomes. Recovery follows Storage/Security's contract. |
| Account session expired | “Sign in again to save to this account.” | Re-authenticate; retain only what is actually retained. Never redirect a pending result into a different account silently. |
| Guest import review / partial import | Show source history, destination account and Confirm / Not now; then actual confirmed/pending/failed portions | No “all saved” after partial success. Exclude account-owned or ambiguous records; ownership, deduplication and conflicts remain Storage/Security-owned. |
| Account data load failed | “Your progress couldn't be loaded.” | Retry loading; label a retained last-good snapshot as stale/incomplete and only show it to its owning account. Do not show “no history.” |
| Successful complete empty read | “No saved attempts yet.” | Start a lesson; only after a complete read actually succeeded. |
| Public result pending/failed | “Account result saved; leaderboard update pending/failed” only if those facts are known | Retry posting only under the agreed contract; do not invent a rank. |
| Certificate lookup/recheck failed | “Certificate verification is unavailable.” | Retry verification; keep already loaded certificate details. Do not imply revocation or missing work (EXP-04). |

Use **Retry save**, **Retry loading**, and **Try solo / Retry challenge** distinctly: they do
different things. A slow response must not overwrite a newer account's UI. Leaving ordinary
learning should offer a calm stay/leave choice only when work is truly at risk; no repetitive
confirmation after a confirmed durable save. Do not promise unfinished worksheet restoration
from a lightweight unfinished-attempt summary. Exact browser-close/offline behavior requires
the Storage contract and later testing.

## Review examples and remaining dependencies

| Scenario to verify later | Expected experience |
|---|---|
| Guest uses explanation, then reveals a solution step | Explanation alone stays unassisted; reveal has advance notice. Positive helped completion, Continue primary, fresh Try solo secondary; saving label matches evidence. |
| Learner completes with spreadsheet mouse, then tries solo | First completion retained without XP/timed PB; fresh keyboard-only, unassisted attempt judged separately. No claim that page-button clicks are spreadsheet mouse use. |
| Account save returns an error after a correct task | Completion remains true; no false “saved”, no duplicated attempt/XP on Retry save, no demand to redo work. Storage must supply deduplication. |
| Returning learner's history cannot load | Unavailable/retry state, no blank progress or repeated beginner setup; catalog access preserved where permitted. |
| Keyboard user opens/closes Help and later a dialog | Worksheet remains visible, focus returns predictably, existing ribbon/edit keys retain meaning; scored clock never pauses silently. |
| Guest signs up on a shared device | Reviewed guest-only carry-over into the confirmed identity; another account's data excluded; no automatic public score. |
| Path changes after certificate/PB was earned | Existing history/credential stays accessible under its original meaning; newer recommendations do not reinterpret incomparable times. |
| Board/certificate/access service fails | Unavailable is distinct from empty/revoked/unsubscribed; no invented placement, missing-work accusation or payment demand. |

Before implementation, owners must settle: Catalog's starter and next-step mapping; content/help
classification and supported setup; Storage's observable save/import/publication/comparison facts;
Payments' exact offer/access lifecycle; engine-safe keyboard escape/return and timed interruption
handling. Precise reward amounts, certificate sets, activity measurement and legacy migration
stay with those owners. None is reopened or decided by this UI proposal.

## Verification and handoff

- Reused the remote catalog decision register and audits, plus CURRENT's accepted source and
  integration handoffs. No new source-level defect, compatibility or usability claim is made.
- A focused independent document reviewer checked policy boundaries, keyboard/help/timing and
  save-state consistency. Four refinements were incorporated: separate award confirmation from
  save confirmation; apply receipt/account-snapshot safeguards throughout the screens; explicitly
  label Pause placement proposed; exclude ambiguous records from guest-import review. No app or
  accessibility test was implied. Lead checked the revised wording against each finding.
- Catalog then reviewed the entire published `b0d2f17` outline against its agreed decision
  register and fresh shared PRODUCT: **no material contradictions or required corrections**.
  Its [durable semantic review](https://github.com/rathunter69/Hotkey.gg/blob/c08b53b73afcfd3cb5e660b8a9f3d232c028f83e/docs/handoffs/catalog-progression.md#september-19-bounded-semantic-review-of-the-ui-proposal)
  confirms that these are presentations of existing learner semantics and draft storage facts,
  not new progression states. It does not approve all layouts or certify runtime behavior.
- Storage reviewed the published saving table and reported **no material mismatch**. Its remote
  contract at `8c7686c` was then fetched/read, including newly approved comparison/grace principles;
  the final outline reflects those principles without choosing their unresolved details.
- All five relative Markdown links resolve in the accepted-baseline worktree. The seven original
  pinned GitHub file links and added Catalog-review/Storage-contract links resolve to fetched
  Git objects; the added handoffs were read before this final update.
  This verifies repository targets, not public-site navigation or signed-in browser access.
- Staged whitespace/scope checks passed: exactly this handoff was added over `16ee830`; an
  explicit comparison excluding it found no other changed files. The separate worktree was clean
  after the first commit. No runtime or shared-guidance files changed.
- First remote checkpoint verified: commit `b0d2f17929768e1be348510728e5559975544b2c`, matching
  local/remote handoff blob `7508f671039f61ce5433488e4cc7bfaf1dd7972f` after push and fresh fetch.
  This final review-record update is also committed/pushed and remote-verified before the chief
  handoff; its exact final identity is supplied by Git history and that message.
- `npm run check`, browser suites, live-auth tests and database tests are **not run** for this
  documentation-only task under TASK_GUIDE/CURRENT's exception. Existing passes are not relabelled
  as new tests. No application, generated assets, data, settings, billing or deployment changed.
- All exact wording/layouts beyond the two selections remain proposals. Acceptance scenarios
  are future checks, not successful playtests; Mac/accessibility/audio and real save behavior
  remain unverified. Existing audit defects remain with their owners.

**Chief integration request:** record this planning assignment, its verified remote handoff and
the two dated placement decisions. Keep existing learning/reward rules; do not mark the full
outline approved, implemented or shipped. CURRENT/PRODUCT edits remain chief-owned.

**Next bounded UI turn:** review the first-lesson → Help → helped result outline with Wolf and
reconcile the Storage/Catalog response contracts, then choose one implementation candidate only
if separately authorized. Do not start the catalog rebuild or expand the questionnaire to settled
learning, reward or competition rules.
