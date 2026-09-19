# UI/UX, onboarding and web structure

Updated: 2026-09-19 (Europe/Berlin)
Task: `01a0b908-48f9-7f32-94b2-d0ca46f13de3`
Chief: `01a0b0fa-d857-7002-ab95-1da0a1cfb858`
Branch: `codex/experience-site-plan`
Starting accepted code: `16ee8306a8c170db9f8fe2e051b44b0519782ae1`
Shared guidance read remotely: `4ec23e01cb958d5dfed5e92875db3f7002eab1e1` on `codex/repository-foundation`.
Refreshed guidance: `4d964901a4f06493695c11bb8f04c4769d607ab0`; its CURRENT update registers this planning assignment, with no changed product policy.
Shared-guidance refresh: `2b16827aecf9b1c773f9b48d9b986c506c061c8a`; incorporates Storage's proven-comparability and short published submission-grace principles.
Latest shared-guidance read for the grid clarification: `2596378b5073118ff2c3794188727c5ccc57a68f`. Accepted code baseline and ownership remain unchanged.
Approval-recording refresh: `0984834f524966b0da4cabd971857d189f9283aa`; chief has integrated the six presentation choices and historical grid findings. Wolf's subsequent grid approval is recorded here for the next chief integration.
Owned file: **only `docs/handoffs/experience-site.md`**.
State: planning outlines reviewed; the six explicit presentation choices and grid direction below are approved. Remaining exact layouts stay proposals. No application implementation, merge or deployment. Final commit identity is supplied by Git history and the verified chief handoff.

## Scope and outcome

Six screen outlines apply the agreed learning flow while preserving the ribbon and worksheet.
One main action leads each ordinary-learning screen; Help, saving and optional competition have
clear places. These are presentation proposals except where explicitly marked confirmed.
They do not define new learner states, rewards, lesson content, storage schemas or access rules.

**Six UI decisions confirmed by Wolf in this task, September 19:**

1. Help uses a **side panel beside the worksheet**, keeping the worksheet visible.
2. A **small Challenges link beside Home and Catalog** provides optional challenge access.
3. Keep a **short goal and current checkpoint visible**, with the **full checklist expandable**.
   The checkpoint describes the required outcome; solution-revealing help remains separate.
4. **Ordinary lesson results appear in the side panel**, keeping the finished worksheet visible.
   Helped results retain Continue primary and Try solo alongside.
5. Invite account saving through a **secondary button on the first guest result and a quiet Home
   reminder**, preserving the option to continue without signup.
6. Put less-used controls, such as timer visibility and Excel setup, in **one small Lesson options
   menu**. Help and mute remain visible; keyboard access remains required.

Source: Wolf's explicit selections in this task's successive question groups. These settle
the stated presentation choices only; exact dimensions, responsive mechanics, final wording and
the other outline details remain proposals. They do not authorize implementation or change any learning rule.

**Grid direction subsequently approved, September 19:** retain the familiar 20-row/10-column
workspace, make all visible rows usable, and adapt cell sizes within readable limits. When the
worksheet and side panel cannot fit comfortably, suggest fullscreen and allow worksheet scrolling.
Instructions, Help and ordinary results share the existing right-hand area. Wolf accepted the
recommendation because the platform now centers learning before immediate competition. Exact
pixel sizes, support thresholds and implementation remain open; see the grid decision record below.

## Sources and coordination

| Evidence | Use and limits |
|---|---|
| [Initial-read CURRENT](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/CURRENT.md), [PRODUCT](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/PRODUCT.md), [AGENTS](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/AGENTS.md), [TASK_GUIDE](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/TASK_GUIDE.md) | Authority, ownership, settled September 18–19 policy and documentation-only validation exception, with subsequent refreshes recorded above. This worktree's older shared documents are not the latest product brief. |
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

Start opens the retained worksheet/ribbon with the confirmed short goal/current checkpoint,
an expandable full outcome checklist, Help and mute. Solution steps remain within classified
Help rather than appearing automatically as a checkpoint. No profession survey, account wall
or mode picker precedes practice. The experienced
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

**Confirmed placement:** ordinary lesson results use the side panel, keeping the completed
worksheet visible. Detailed spacing, focus behavior and transitions remain to design; the
result panel must not require a competing overlay or automatically reveal a solution.

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

## September 19 follow-up: preserve the look, refine the interactions

Wolf asked which UI/UX decisions remain and said he likes the current aesthetic and general
layout while remaining open to suggestions. Treat this as a renewed preference to preserve
the existing visual foundation, not approval of a wholesale redesign or of every proposal below.
Shared guidance was refreshed through `3b2063f74e53ede253602c83299ff3dd0263e041`; it accepts
the initial UI handoff and records the two placement approvals. Baseline/ownership are unchanged.
Before recording the two answers below, guidance was refreshed through `7a95e428240fad8e539a69c22b79bfcbf179c063`;
AGENTS/CURRENT/PRODUCT/TASK_GUIDE have no changes from that prior read.

The useful remaining decisions concern presentation and sequencing. Keep settled Help,
assistance, Continue/Try solo, rewards and challenge rules out of another questionnaire.

| Choice | Decision or remaining recommendation |
|---|---|
| Visible task guidance | **Confirmed September 19:** keep the short goal and current outcome/checkpoint visible, with the full outcome checklist expandable. A checkpoint describes the required result, not an automatically revealed solution or mandatory keyboard route. |
| Result placement | **Confirmed September 19:** ordinary results appear in the side panel, keeping the finished worksheet visible. Helped results retain Continue primary and Try solo alongside; full statistics expand under the earlier approved information hierarchy. |
| Post-lesson save invitation | **Confirmed September 19:** secondary Save to an account action after the first guest result, plus a quiet Home reminder. Continue without signup remains available. Exact wording remains open; the two skippable personalization topics stay agreed. |
| Catalog browsing | **Tentative preference, September 19:** Wolf said “Probably next drill along learning path, with recommendation to move to next step in the chapter.” Present the next path/chapter step while retaining browsing; do not treat this as approval of a new sequence or mandatory gate. Catalog owns mapping, chapter-end behavior and content. |
| Secondary information and controls | **Confirmed September 19:** one small Lesson options menu for less-used controls; Help and mute remain visible. The separate My progress location and exact menu contents/keyboard bindings remain proposals. |

**Small question group: both explicitly answered September 19.**

1. Wolf selected “Short goal and current checkpoint; expand the full checklist (recommended)”.
   This settles the density of visible outcome guidance; it does not approve automatic solution help.
2. Wolf selected “In the side panel, keeping the finished worksheet visible (recommended)”.
   This settles ordinary lesson result placement; it does not change result/reward semantics.

Acceptance example: a learner can see the goal/current outcome while working, expand the full
outcome checklist when useful, and review a completed lesson in the adjacent result panel while
the finished sheet remains visible. Helped completion still presents Continue then Try solo.
Exact checklist text/mapping, dimensions, responsive mechanics and transitions remain open;
the later grid decision below settles the small-window fallback direction.
No new application tests or agent review were needed to record these explicit answers; the
sole-document diff and whitespace were checked before its remote checkpoint.

Wolf then asked for questions on the outstanding items. **He answered all three:**

1. Selected the secondary result button plus quiet Home reminder. Guest-import consent and
   receipt-based saving remain separate; no compulsory signup step is introduced.
2. Supplied the tentative path/chapter-next-step preference quoted above instead of selecting
   either layout option. Preserve the qualifier “Probably”; no exact catalog layout is approved.
3. Selected one small Lesson options menu, retaining visible Help/mute and keyboard access.

Catalog was notified of this preference and the confirmed presentation choices before any
next-step mapping was assigned. These choices do not change learning, rewards or access.

Spacing, alignment, consistent buttons, readable text, visible keyboard focus, reduced-motion
treatment and clear error wording are design/validation work within the chosen aesthetic. They
do not each need a product poll, and this planning discussion does not authorize app edits.
This question-recording pass did not visually inspect or playtest current layouts. The later
grid clarification below adds bounded browser measurements, not a playtest of these proposals.

## September 19: clarify the earlier grid-space work

Wolf asked to recover the prior Claude work on cell counts, cell sizing and screen adaptation.
This is a bounded history/source/layout clarification within UI planning. It does not approve
changing the engine, worksheet boundaries, historical scores or lesson content. Latest guidance
read for this batch: `2596378b5073118ff2c3794188727c5ccc57a68f`; accepted code remains `16ee830`.

### What was actually decided, and why the notes seem inconsistent

**The consistent 20-row visual grid and stable frame during row operations are carried-forward
Wolf decisions, not a new UI invention.** Their attribution is preserved in the accepted source
and regression comments. Older content-density and pixel-size rules need separate treatment.

| Historical evidence | Interpretation to carry forward |
|---|---|
| [Early density pass, 4911f07](https://github.com/rathunter69/Hotkey.gg/commit/4911f079d97f3f3dd68921e4536c9b5e6342938b), and [elastic fitting, 466eef7](https://github.com/rathunter69/Hotkey.gg/commit/466eef73fa5c0cafe3f1811b3daea483053bba20) / [height measurement, 851fa19](https://github.com/rathunter69/Hotkey.gg/commit/851fa1945c143ea41499f2dc28354edf9d39d6ad) | Earlier work moved from 8 columns/12 rows to 10 columns/14 rows and smaller text, then made widths/heights adapt. Claude retained G–I because existing lessons used them rather than adopting Wolf's floated column-cut idea. These implementations are not all independent permanent product decisions. |
| [Foundations specification](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/dev/FOUNDATIONS_SPEC.md#8-the-rich-drill-standard-r229-wolf--internalized-so-its-not-re-explained) | Its older rich-drill recipe says 16 rows and broadly even 80px columns, with a wider label column when needed. This is an authored content recipe attributed to Wolf, not today's universal rendered geometry. |
| [20-row cap, 383ade1](https://github.com/rathunter69/Hotkey.gg/commit/383ade1ad7843e4ba6ded093d5950482c0d9549b), July 23 | Earlier screen fitting added extra empty rows on tall monitors. The attributed request was to keep about 20 rows and grow their height instead. The first implementation capped computed rows but still permitted fewer on shorter layouts. |
| [Consistent grid correction, 09f1aa2](https://github.com/rathunter69/Hotkey.gg/commit/09f1aa2481a683363b3fac1fbdd03b5e784e3eb9), July 27; [preserved source](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html#L24176) | Preserves Wolf asking why drills still had different row counts after agreeing on a standard 20-row grid. Renderer changed to at least 20 visible rows, preserving any taller declared content instead of cutting it. This is strong direct-attributed evidence for consistent visible geometry. |
| [Row-operation regression](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/dev/e2e-grid-height.js#L134) and [rowsAfterOp](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html#L28154) | Preserves Wolf's instruction that inserting/deleting rows should move the contents, without resizing the workspace. Data beyond the loaded boundary can remain stored, but the current renderer is not a general scrolling Excel viewport. Do not mistake stable frame size for proof that every off-frame cell is reachable. |
| [DEPTH_PASS grid section](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/dev/DEPTH_PASS.md#13-grid-usage) and [current PRODUCT](https://github.com/rathunter69/Hotkey.gg/blob/2596378b5073118ff2c3794188727c5ccc57a68f/docs/PRODUCT.md#preserve-foundations-feedback-before-redesign) | The authored spec strengthens this to 20×10, a 60% content-density target and a content cap. Current guidance demotes old density/length quotas and rejects adding advanced prerequisites simply to fill a beginner screen. It does not explicitly revoke the familiar 20-row visual grid or stable row-operation frame. |

Distinguish **visible grid**, **usable worksheet boundary**, **lesson content**, and **pixel size**.
They are currently different things. A beginner can retain a familiar sheet without needing
graded work in every row. Historical 14/16/20 numbers often refer to different layers, and some
earlier comments describe algorithms later superseded by the code beneath them.

### Accepted code: what adapts and what stays fixed

| Aspect | Verified source behavior at 16ee830 |
|---|---|
| Columns | `COLS=10`: A–J. The browser width does not change the number of columns. |
| Visible rows | `max(S.ROWS,20)`, with hidden rows omitted. Taller declared boards are protected from being cut; 20 is not an enforced runtime maximum. |
| Usable rows | `S.ROWS=max(built.ROWS,14)`. If that is below 20, the extra visible rows are inert filler cells and the cursor stops at the logical boundary. For example, Navigation uses 20; Foot and Combo use 14 plus six filler rows. |
| Width adaptation | Most columns expand or shrink to available worksheet width, with a 40px per-column shrink floor. The outer app is capped at 1180px including surrounding layout; large monitors do not make the sheet indefinitely wider. |
| Graded width lessons | AutoFit/width-verdict exercises opt out of proportional shrinking. Failing columns also resist growth that would visually solve the width problem. These preserve grading meaning, but can exceed the available frame on smaller windows. |
| Height adaptation | Stage minimum height responds to window height, bounded by a 400–800px rule in normal view; fullscreen uses a different 400–900px rule and hides the site header. Table rows share the available space. The grid does not add empty rows just because the monitor is taller. |
| Text and row pixels | Later `#grid` density CSS sets 12px cell text and 21px requested cell height; it overrides an earlier generic `--cellh` height rule. Renderer still calculates an 18–40px `--cellh` value, but that is not a reliable description of actual rendered row height. The height-filling table stretches rows. Font size stayed 12px in the measurements below. |
| Window changes | A document-level observer checks width and height, with a debounced resize listener and fullscreen re-fit. The prior resize/board-change bugs are repaired in accepted source; don't present them as still outstanding. |
| Small screens | Current CSS gates the trainer at width ≤740px, or coarse-pointer devices ≤1024px, and offers a mobile hub. This is current behavior, not a freshly approved support policy or proof of external-keyboard tablet support. Short desktop windows can still place the sheet below the fold. |

Source anchors: [layout frame](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html#L1406),
[density CSS](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html#L2295),
[elastic fit and row math](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html#L24082),
[inert filler rows](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html#L24277),
[fullscreen and resize](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/index.html#L29216).
The opening elastic-fit comment still describes an older linkage between display width and
overflow verdicts; later engine/display-width separation and width-lesson exceptions govern.

### Focused local measurements, not a new full test run

The lead ran one ephemeral local browser measurement for Navigation, Foot and Combo at four
window sizes, fixed seed `424242`. Runtime files and the two existing grid/resize suites match
16ee830 exactly. Used the accepted redirect-blocking browser helper, a new isolated profile,
Node 24.19.0, Playwright 1.49.1 and Chromium 131 headless shell build 1148; all external traffic and service
workers blocked. A temporary loopback server owned an OS-assigned port, then closed with the
browser. No login, user records, live service, application edits or screenshot artifact.

All 12 samples rendered 20 visible rows × 10 columns and 12px cell text. Navigation had 20
usable rows; Foot/Combo each had 14 usable rows plus six decorative rows. Values below list
Navigation / Foot / Combo respectively; dimensions are CSS pixels.

| Window | Actual first-cell heights | Worksheet container width | Table widths | Table bottom positions |
|---|---|---|---|---|
| 1280×900 | 23.3 / 23.7 / 23.7 | 880 | 870 / 870 / 909 | 743 / 743 / 743 |
| 960×700 | 21 / 21 / 21 | 646 | 636 / 636 / 909 | 730 / 723 / 723 |
| 1920×1080 | 31.8 / 32.3 / 32.3 | 880 | 870 / 870 / 909 | 923 / 923 / 923 |
| 1280×620 | 21 / 21 / 21 | 880 | 870 / 870 / 909 | 693 / 686 / 686 |

This confirms adaptive dimensions rather than adaptive cell counts; a desktop-width cap; actual
rows differing from the computed target; the width-lesson exception; and below-fold geometry
at short heights. A table-bottom coordinate beyond window height does not prove content loss,
but disproves a blanket promise that the entire worksheet is always visible without page scrolling.
Measurements are not a complete accessibility/readability test, a grade/row-operation playtest,
phone/Mac validation, or a test of the future side panel.

Reused accepted [testing evidence](git-testing-releases.md): grid-height and 34 resize checks
passed on the preserved application, with Linux gate evidence at 4ea428b. Their coverage is
bounded: `check-resize.js` explicitly allows existing 40px-floor and width-lesson exceptions,
so its green status is not proof that every board fits every window. The long legacy fit sweep
was read for context, not run; it is unnecessary for this question and lacks the newer isolation
wrapper. Full static/browser/database suites were not rerun for this documentation-only update.

### Grid direction approved September 19

Wolf answered the two grid choices and preceding recommendation: **“Go with your recommendation -
I think it should work for the updated content now that the platform is more centered around
learning vs. competing immediately.”** This is a planning approval, not permission to implement.

Keep the carried-forward 20-row visual baseline and familiar 10-column current workspace.
Let dimensions adapt within a readable range; do not add tasks solely to fill cells.
Changing the grid shape is an explicit design decision, not cleanup. Large-model extent remains
with the later Catalog/Engine plan; this does not impose an old 20-row content cap on every future model.

**Accepted layout direction:** reuse the existing right-hand lane for
instructions, Help and results, switching its content instead of adding another column or
shrinking the sheet each time Help opens. The current lane is 250px; that exact width is not
selected for the replacement. Keep column-width grading independent of screen size and leave
inserting/deleting rows stable in the visible frame. Exact wrapping/scrolling/focus behavior
needs an Engine/UI contract before implementation.

**Both grid questions are answered; do not repeat this questionnaire.**

1. **Make every visible row usable**, including all 20 rows of the standard workspace. This
   replaces decorative filler as the intended experience; it does not require 20 rows of lesson
   content or add completion requirements. Before implementation, Catalog/Engine must check
   navigation, row operations, grading, tutorial targets and comparable-history implications.
2. **Preserve readable cells, suggest fullscreen and allow worksheet scrolling** when a small
   window cannot comfortably fit the worksheet plus side panel. Fullscreen is a suggestion,
   not the chosen mandatory pre-Start gate. A real worksheet scroll viewport is not implemented
   today; the approved direction needs a separately authorized design/engine batch. Never crop
   required cells, auto-complete width lessons by scaling, or claim an unsupported layout is usable.

Learning-first rationale: leave room to explore and practise without making blank space feel
broken or demanding extra tasks to fill it. This changes the intended worksheet presentation,
not the settled assistance, XP, timing, readiness, certificate or optional-challenge rules.

**Remaining implementation contract, not new product questions:** specify how keyboard focus
keeps the active cell visible while scrolling, how Help/results preserve worksheet position,
and how row operations retain data within the stable frame. Define and verify readable sizes,
zoom behavior and actual supported input/device combinations. Existing desktop/mobile gates
are unchanged today; this approval alone does not certify a phone or tablet experience.
Use small-window and width-grading cases from the bounded evidence above when that work is scoped.

Catalog was notified of the approval, learning-first rationale and ownership boundaries. UI owns
presentation; Catalog retains content and learner-state mapping. No separate active Engine task
was listed, so the chief must route the bounded engine review before implementation; this update
does not launch one or duplicate its work. Review impacts on prior records without resetting or
reinterpreting history automatically.

Independent historical review checked the attribution and distinguished the 20-row/stable-frame
decisions from authored density recipes. Its final document review found no material correction
before Wolf answered the questions. It did not run the app; the local measurements above are the
lead's separate evidence. This approval-recording update reuses that review and diagnostic without
claiming new tests. Exact minimum supported size, cell dimensions, zoom behavior, scrolling/focus
mechanics and future large-model geometry remain open.

## Verification and handoff

- Reused the remote catalog decision register and audits, plus CURRENT's accepted source and
  integration handoffs. The grid clarification adds source/history findings and 12 bounded
  browser measurements; it does not claim a full audit or certify usability/compatibility.
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
- Relative Markdown links resolve in the accepted-baseline worktree. Pinned GitHub file and
  commit links resolve to fetched Git objects; the added handoffs and historical evidence were
  read before this update. Exact validation counts belong to the chief checkpoint message.
  This verifies repository targets, not public-site navigation or signed-in browser access.
- Staged whitespace/scope checks passed: exactly this handoff was added over `16ee830`; an
  explicit comparison excluding it found no other changed files. The separate worktree was clean
  after the first commit. No runtime or shared-guidance files changed.
- First remote checkpoint verified: commit `b0d2f17929768e1be348510728e5559975544b2c`, matching
  local/remote handoff blob `7508f671039f61ce5433488e4cc7bfaf1dd7972f` after push and fresh fetch.
  This final review-record update is also committed/pushed and remote-verified before the chief
  handoff; its exact final identity is supplied by Git history and that message.
- `npm run check`, full browser suites, live-auth tests and database tests are **not run** for this
  documentation-only task under TASK_GUIDE/CURRENT's exception. Existing passes are not relabelled
  as new tests. The separate isolated layout diagnostic is recorded above. No application,
  generated assets, live data, account settings, billing or deployment changed.
- All exact wording/layouts beyond the six presentation selections and approved grid direction
  remain proposals. Acceptance scenarios
  are future checks, not successful playtests; Mac/accessibility/audio and real save behavior
  remain unverified. Existing audit defects remain with their owners.

**Chief integration request:** record this planning assignment, its verified remote handoff and
the six dated presentation decisions and tentative path/chapter recommendation preference.
Also retain the historical 20-row/stable-frame provenance and record Wolf's subsequent approval
of the grid recommendations: all visible rows usable; readable dimensions with fullscreen
suggestions/worksheet scrolling; retained familiar frame and shared right-hand lane. Both grid
questions are answered. Record his learning-first rationale without changing settled rules.
Keep existing learning/reward rules; do not mark the full outline approved, implemented or
shipped. CURRENT/PRODUCT edits remain chief-owned.

**Next bounded UI turn:** reconcile Catalog/Engine implications of the approved usable-boundary
and worksheet-scrolling direction before fixing the side-panel dimensions and focus contract.
Continue reviewing the first-lesson → Help → helped result outline and Storage/Catalog contracts;
choose an implementation candidate only if separately authorized. Do not start the catalog
rebuild or expand the questionnaire to settled learning, reward or competition rules.
