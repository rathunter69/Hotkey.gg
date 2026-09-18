# Product direction

Updated September 18, 2026. This is the shared product brief. Current work and launch status
live in [CURRENT.md](CURRENT.md); source locations live in [ARCHITECTURE.md](ARCHITECTURE.md).

## Confirmed by Wolf on September 17

**Direction: repair and rationalize in Wolf's chosen order, in dedicated area tasks.** The master
roadmap conversation is reserved for planning and shared context. Small security/account
fixes come first, then catalog/progression separation, repository/database cleanup, site
structure, and a fully planned catalog redesign. Broad feature work, billing activation and
the catalog rebuild remain paused. The earlier launch schedule remains parked.

Reconfirmed in Wolf's September 17 successor-chief handover: retain this order, preserve the
Foundations feedback in a future fully planned catalog rebuild, and retain subscriptions at
launch as a future product requirement. This restates the existing direction; it does not approve new learning/access rules
or begin a later module. The chief coordinates; dedicated tasks implement assigned batches.

Hotkey.gg is like LeetCode for Excel and business tasks. People learn by doing realistic
spreadsheet work, with an emphasis on becoming faster using the keyboard.

The audience includes banking candidates, consultants, and professionals learning Excel
later in their careers. Onboarding should customize the learning path; we should not force
everyone into the same audience or starting level.

The earlier launch target was October 1, 2026; that schedule is now parked. When launch work
resumes, the product must work and subscriptions must work from day one. A free-only release
is not the requested outcome.

Wolf wants separate tasks for security, payments, the engine, UI/UX, web structure, drill
content, leaderboards and storage, desks, marketing and launch, and LLC/tax/accounting.
Use concise, clear English in discussions and reports.
The twelve task boundaries in CURRENT.md and TASK_GUIDE.md govern ownership; the topic tables
here organize product decisions, not a competing task list. Wolf requires non-secret continuity
to be committed and pushed to GitHub so another computer can resume the work.

## Chief discussion and shared design specification — September 17 clarification

Wolf explicitly asked all agents/sessions to be concise and the orchestration session to
include discussion of the project overview, design specification and platform as a whole.
The chief should lead those product conversations alongside coordination. Detailed technical
evidence belongs in linked handoffs; discussions with Wolf should expose the few choices that
matter and their practical consequences.

Use this brief as the shared, evolving specification. Discuss:
- **Project overview:** who Hotkey serves, what learners gain and the core product promise.
- **Experience and design:** the first-to-returning-user journey, teaching style, interaction
  principles and visual foundation.
- **Platform systems:** how lessons/drills, modes, paths, progress, competition, identity,
  certificates, community/desks and access fit together; inclusion and rules remain decisions,
  not an instruction to expand every system.
- **Business and delivery:** subscriptions/free access, scope, priorities and what must be true
  before launch, while retaining the parked deadline.

The current overview remains learning Excel/business skills through keyboard-led, hands-on
work, progressing from accessible playful exercises to realistic models. Personalized
onboarding and subscriptions at launch remain confirmed requirements. Existing UI/ribbon/
workspace and Foundations feedback remain protected. The confirmed structure now combines one XP level, lesson progress,
personal drill-speedrun records and optional benchmark/Daily leaderboards. New mastery and
overall competitive-rank systems are deferred; detailed flow/access/reward rules remain open.

Area tasks supply evidence and focused choices; the chief discusses and reconciles the overall
design without repeating their audits. Record each agreed rule, source/date, superseded rule
and acceptance example here. Label recommendations and unresolved choices explicitly.
This clarification changes communication and discussion scope; it does not approve new
features, a catalog rebuild, billing activation or deployment.

## Repository-structure follow-up — September 17

Wolf's next request authorized orchestrating testing/security groundwork and making the GitHub
repository structure cleaner. Bring one bounded, behavior-preserving documentation/structure
cleanup forward alongside that groundwork. Keep security fixes and structural moves separately
reviewable. This does not change the later catalog/progression, site or learning-design direction,
or authorize a framework rewrite, content/progress reset, live release or billing activation.
The assigned scopes and evidence belong in CURRENT.md; file paths are implementation details,
not new learning/access rules.

## Wolf's review guidance — September 17 follow-up

**Preserve:** the general UI/UX, ribbon and game workspace feel good. The broad feature set
is useful. The intended pixel-art transition is limited to user account identity/icons and
achievements. Do not treat this as a request to redesign the ribbon or spreadsheet surface.

**Interaction and catalog clarification:** Wolf subsequently noted that interactions between
drills, modes and learning paths may still need changes. Preserve the visual foundation without
freezing those interactions. He highlighted that changing drills/paths currently forces changes
to achievements and progression, making catalog replacement difficult. Review that coupling as
part of cleanup. His later preference is to rebuild the catalog after a complete agreed plan,
while preserving his Foundations feedback. No progression reset has been approved.
The dependency map and proposed separation are in [ARCHITECTURE.md](ARCHITECTURE.md).

**Main learning goal:** create interactive content that teaches users gradually. Early practice
should have the intuitive, playful feel of Excel hotkey/speedrun games: moving blocks,
changing colors and seeing immediate consequences. Later stages should build toward real
models and finance tasks so the keyboard habits transfer to work. Wolf identified the reference
as **Excel Obstacle Course**, noting that much of it is paid. Public reference material includes
the creator's [free introduction](https://excelobstaclecourse.thinkific.com/products/digital_downloads/excel-obstacle-course-1)
and [introductory video](https://www.youtube.com/watch?v=0JxMsq2GuvE). These identify the reference;
the courses have not been playtested in this review. This describes the desired experience,
not an approved implementation.

**Problems Wolf wants investigated:** onboarding feels broken; tutorial systems appear to
overlap; earlier free, partly paid and subscription plans have left too many competing systems.
Leaderboards and persistent progress need clearer rules and verification. Code rationalization,
security and unfinished behavior need attention before adding more features.

Excel fidelity and accessibility for beginners must work together. Preserve familiar Excel
behavior while making instructions, feedback and difficulty approachable. The remaining retry, scoring and progression details must follow the confirmed policies below
and be settled with evidence and Wolf.

Maintaining the ability to publish through Git is a setup requirement; checking that ability
is not authorization to deploy a change. Bounded repairs and preparation follow the order below.

## Catalog, modes and learner-flow decision review — September 17 clarification

Wolf explicitly asked the successor chief to ensure the coming catalog/flow audit clarifies
game modes, ranked mode, learning paths and related systems because earlier pushes contain
deferred or changed decisions. **Confirmed: review and resolve these systems together before
implementing replacement rules.** This is an audit/design requirement, not a decision to add
ranked mode or restore any retired mode switch.

The next recommended product module, after current groundwork is verified together, is the
catalog/progression and learner-flow decision review. Keep it within the existing area
boundaries: Catalog/progression owns the system/dependency map; UI/UX supplies journey
evidence; learning design supplies skill/Foundations evidence; saved-progress and Payments
supply constraints. Coordinate their findings through the chief instead of automatically
starting all those tasks or separate competing rule systems.

Start from current implemented behavior and reuse existing audits. Trace relevant older
commits, branch proposals and dated feedback only where they explain conflicting rules.
An old push proves code existed, not that Wolf still wants it. Distinguish implemented
behavior, Wolf-confirmed direction, carried-forward preference, deferred choice, superseded
decision and unapproved proposal. Cite source/commit and date; unresolved conflicts come
back to Wolf rather than being resolved by whichever document or branch is newest.

| System | Choices to make explicit |
|---|---|
| Drills and game modes | What a drill, lesson, practice session, challenge and any distinct game mode mean; which deserve separate experiences and which share the same exercise. Do not assume every historical label should survive. |
| Ranked play and leaderboards | Whether a distinct ranked mode is wanted at all; how competitive eligibility works; timing, retries, hints/assistance, score validity and fair comparison. Distinguish account rank/progression from ranked play. |
| Learning paths | Recommended routes versus required sequence, prerequisites/unlocks, free exploration, user choice, onboarding recommendations and how paths reuse drills. |
| Teaching and completion | Guided versus independent work; what help means; success, retry and next-step behavior; retain confirmed assisted-completion-without-XP direction unless Wolf explicitly changes it. |
| Progress and rewards | Apply the September 18 simpler structure below: one XP level, helped/independent lesson progress, personal speedrun records and optional challenge leaderboards. New mastery and overall competitive-rank systems are deferred. Settle reward details, achievements/certificates and historical-rank presentation while preserving earned history. |
| Access and subscriptions | Guest/account/free/paid boundaries and where they affect the journey. Subscriptions at launch remain required; the exact offer stays open. |
| Navigation and flow | How first-time beginners, experienced entrants and returning learners find work, move between systems, understand results and choose what to do next. Preserve the general ribbon/workspace foundation. |

Deliver one plain-English system map and a compact decision register: current behavior;
conflicting prior guidance with provenance; what is already confirmed; options and tradeoffs;
chief recommendation; Wolf's decision; which earlier rule it replaces; and concrete acceptance
examples. Show a few end-to-end learner journeys so choices can be assessed together.
Discuss manageable groups of dependent decisions with Wolf; do not ask him to reconstruct
history or decide the whole catalog at once.

The existing preference against a practice/ranked switch is specifically on this review's
agenda. It remains the implementation baseline until Wolf decides otherwise; his request to
review ranked mode does not by itself reverse that preference. Similarly, structural
separation must preserve behavior while unsettled rules remain open. No catalog rebuild,
content deletion, progress reset or new access/reward system follows automatically from
this audit. Preserve the Foundations feedback sources below. Update this brief with each
confirmed decision and its superseded rule; CURRENT owns status and task sequencing.

### Confirmed catalog/flow decisions — September 17–18

Source: [dated review and acceptance examples](https://github.com/rathunter69/Hotkey.gg/blob/0961f3c9b3dd70f5b646b51746feb101606a7a3d/docs/handoffs/catalog-progression.md),
task 01a0b148-2693-7901-af91-934c83cabe1d. The chief checked the remote handoff and Wolf's
actual approvals in that task. The September 17 bace206 tentative gate status is superseded
by the explicit September 18 approval below; other unanswered proposals remain open.

**September 17 — learning first:** learning is the main journey, with prominent optional
speedrunning/competition: learn a skill → complete independently → improve speed → compete.
Preserve playful early lessons, later realistic work, helped progress without XP and direct
entry for experienced competitors subject to eventual rules. Later lessons should have gates.
This replaces a speed/XP climb as the primary educational journey; it does not decide specific
content identity, public score posting, rank entry or buttons.

**September 18 — advanced access and readiness approved:**
- Subscription access opens advanced curriculum; the exact free/paid lesson boundary remains open.
- Short prerequisite checks occur only at major skill jumps, not before every ordinary lesson.
- Relevant earlier independent work satisfies readiness; experienced learners can use a short
  test-out instead of completing the beginner sequence.
- Ordinary lessons completed with help advance learning, with no assisted XP.
- Readiness depends on correct independent work, not speed targets or accumulated XP.

This supersedes the tentative skills-plus-subscription preference and the area's earlier
proposal for unrestricted exploration of every entitled exercise. Freely explored basics
remain protected. Existing runtime locks and billing stay unchanged until implementation is
separately authorized. Checkpoint locations, pass thresholds, equivalences, exact curriculum
and credential requirements remain open.

**September 18 — lesson timer and assistance approved:**
- Ordinary lessons hide the timer unless the learner enables it; deliberate speed attempts
  show time. Enabling a lesson timer does not itself publish a competitive score.
- Normal task instructions and explanations do not mark an attempt assisted or remove XP
  eligibility by themselves. Actual XP still depends on the agreed independent-completion rules.
- Revealing solution steps, using Guided help or replaying a solution marks the attempt
  assisted: learning progress, no XP. Ordinary helped completion still advances learning.

This replaces always-visible teaching timing and blanket score-eligible solution hints as
the desired future rule. Mapping existing controls to these categories still needs design;
an old control named “hint” is not enough to decide its treatment. Independent retries after
viewing solutions, fresh variants, speed/competitive publication, pause and rank rules remain
open. No live behavior is changed by this specification.

**September 18 — public competition scope approved:** selected standardized skill benchmarks
and Daily events, alongside personal bests, form the future public competition focus. The
evolving lesson catalog is not automatically the universal public comparison set. Existing
scores and earned history remain protected. This selects the scope only; it does not approve
removing old boards, a new overall rank, exact benchmark membership/access, seed/retry/fairness
rules or implementation. A lesson can change without silently redefining a public benchmark;
the versioning and old-board transition plan still need agreement.

At b6a3177, only the competitive-scope question had an answer. Wolf's subsequent response
at cc88b716 supersedes the fully-unanswered status of the other two choices with **support in
principle**, conditional on retaining key metrics and an option to speedrun individual drills.
Fresh independent retries and deliberate public entry can now be developed on that basis;
exact variant/comparison, entry, eligibility, retry and saving mechanics are not approved.
Do not turn the qualified response into acceptance of every detailed proposal.

**September 18 — personal metrics and individual-drill speedruns retained:** learning remains
primary, while learners retain an option to speedrun an individual drill and see useful
personal metrics. Personal speedruns extend beyond the curated public benchmark/Daily set:
a drill does not need a public leaderboard to support personal improvement. Preserve existing
personal bests, results and earned history; exact comparability and transition rules still need
agreement. Private versus public must not become saved versus unsaved merely because a score
was not published. This states the design requirement, not a particular storage or UI solution.

**September 18 — simpler progression structure approved:** after asking whether the proposed
XP/mastery/rank structure involved too many systems, Wolf explicitly selected “Yes, use this
simpler structure (recommended)” in the catalog/flow task:
- One visible account level from XP.
- Lesson progress distinguishing completion with help from independent completion.
- Personal drill-speedrun times, bests and improvement records.
- Optional selected benchmark and Daily leaderboards.

Defer a **new mastery system** and a **new overall competitive rank**. This supersedes the
area's earlier three-system recommendation and retires its D6a/D6b/D7a questionnaire as the
next discussion. It does not approve the proposed accomplishment-weighted/capped-repeat XP
formula: exact XP amounts, repeat rewards and eligibility remain open.

Existing earned XP, awards, personal results and rank history remain protected. Deferring a
replacement rank does not authorize deleting or freezing the current system, recalculating
earned values, or hiding history. Plan the current-to-future rank presentation separately.
XP level is not proof of skill or a readiness/access gate. Help/no-assisted-XP, optional lesson
timing, major-jump readiness and personal/public record policies above remain confirmed.
Certificates and achievements remain unresolved, not removed by this simplification.

The review has illustrated helped completion, independent work, a private drill PB improving
from 1:24 to 1:16 with both attempts retained, and a separate public benchmark result. These
are fictional design examples, not actual user statistics or approval of exact metrics or
comparison rules. The area recommends distinct learning, personal-performance and public-
competition views; the exact presentation, additional metrics, formulas, comparison groups,
guest/account saving mechanics, detailed visibility controls and independent eligibility still
need agreement; the later account-records approval below sets history depth and privacy principles.
Legitimate alternative routes must remain valid. No application change follows from this
product approval.

**September 18 — lesson-first entry and useful free beginner path approved:** Wolf explicitly
selected “Try a lesson first (recommended)” and “Useful beginner path free; advanced learning
paid (recommended)” in the catalog/flow task.

- A first visit begins with a short hands-on lesson without requiring an account, followed by
  personalization and an invitation to save progress. Experienced users have a clear shortcut
  to choose a suitable starting point, subject to the agreed readiness/access rules.
- The free offer includes a complete useful beginner path, repeat practice and personal
  speedruns for that included content, plus a few advanced previews.
- Advanced lessons and model-building courses require a subscription. The free speedrun/replay
  promise does not extend automatically to every advanced drill.

This supersedes the tentative first-visit default and the unresolved broad free-offer choice.
“Beginner” is a skill scope to design, not an automatic inclusion of every current Foundations
drill. Useful real spreadsheet work also belongs in beginner learning. Exact content and
preview limits, prices/trials, onboarding questions, guest-to-account transfer and save rules,
advanced speedrun access, competition/credential access and subscription expiry remain open.
Existing help/readiness/timer and simpler-progression decisions remain confirmed. Billing
activation, replacement rules and implementation are not authorized by this approval.

**Entry/access acceptance examples:** a visitor can finish a useful beginner lesson before
signup and then receive an invitation to personalize and save. An experienced visitor can
choose a suitable starting point. A free learner can complete the beginner path and return
to its practice/speedruns; selected advanced previews illustrate paid learning without
promising unrestricted advanced access. These examples do not define the save/transfer contract.

**September 18 — account history, privacy and habit tracking approved:** Wolf explicitly asked
to decide the statistics and tracking records accounts retain before implementation, then
selected all three recommendations in the account-metrics question group:

- Retain every finished attempt, including helped lessons and private speedruns, plus lightweight
  summaries of attempts deliberately restarted or ended unfinished.
- Keep detailed learning/practice history private, with users choosing summary highlights to
  showcase. Deliberate public challenge entry separately publishes its eligible result under
  the stated competition rules.
- Include active practice time and practice days, with an optional streak display that never
  gates lessons or removes earned progress.

These are the approved principles, not blanket approval of the handoff's candidate record/
metric dictionary or dashboard. Exact fields/formulas, active-versus-idle measurement, day/
timezone rules, interruptions, archive/retention limits, detailed keystroke replays and
legacy-record migration remain open. An optional streak display does not approve freeze rules,
XP multipliers or penalties. Existing earned progress/rewards and the no-assisted-XP policy
remain protected; no new tracking collection, schema or application behavior is authorized.

The area recommends keeping unknown historical assistance explicitly unknown, preserving old
awards, defining lightweight unfinished summaries and separating public highlights from the
underlying private record. Exact legacy equivalence, comparison and display controls still
need agreement. Existing data must not be presented as proof of measurements it never captured.

**September 18 — speedrun metrics, practice days and helped-result choices confirmed:** Wolf's
reply selected time, personal bests, improvement history and keystroke count for speedrun
results. Exact key-count semantics and comparable groups remain open; this does not approve
key efficiency as a correctness/accuracy score.

Meaningful active practice qualifies for a practice day, including helped and unfinished work;
opening a page alone does not qualify. Exact thresholds, idle exclusion, day/timezone rules
and measurement remain open. Helped completion still earns no XP, and streaks remain optional
and do not gate learning or remove progress.

After a helped ordinary lesson, offer Continue and a friendly unassisted-retry option.
Wolf requested wording such as “solo” instead of “independently”; **Try solo** is working copy,
not the final label. Primary-button emphasis was not selected, and the retained speedrun
option remains available. Continuing follows the approved readiness/access rules. Result
messages must distinguish actual account save, device-only history, pending and failed saves.

**September 18 — task estimate, command usage and mouse boundaries approved:** Wolf first
expressed interest in mouse-based time savings and usage statistics, then explicitly accepted
the recommended task estimate and specified shortcut/command-only usage. He subsequently
selected all three mouse-boundary/counting/XP recommendations:

- Use a clearly labelled **estimated time saved on this task**, explaining the mouse-based
  reference. Any accumulated estimate is limited to tasks actually completed in Hotkey.gg;
  it must not claim measured workplace savings. Framing is approved; reference selection,
  calibration, formula, repeat counting and numerical claims remain open.
- Usage statistics count completed shortcuts/commands, including sequences such as
  Alt → E → S → T. Do not rank the intermediate physical keys as most/least-used shortcuts.
  Actual key presses remain a separate per-run total: this example is four presses and one
  completed command use. Exact held-key/repeat/modifier/typing and command-mapping rules remain open.
- Mouse interaction with the spreadsheet sheet, ribbon or spreadsheet dialogs excludes
  competitive scores and qualifying timed records, including timed PBs. Clicking ordinary
  page controls such as Start or Retry does not itself disqualify an attempt.
- Spreadsheet mouse use retains learning progress but earns **no XP**. Preserve already-earned
  XP, personal results and history; this future rule does not authorize retrospective removal.

Input eligibility is separate from solution assistance and history retention. Permitting a
Start/Retry click does not make solution help score-eligible. Exact detection, focus and
accessibility handling, legacy equivalence and eligibility for derived time-saved estimates
remain open. Retaining an ineligible elapsed time as private feedback is a presentation
proposal, not permission to count it as a scored record.

Existing “time banked” remains recorded personal first-to-best improvement, not a mouse-user
baseline. No automatic least-used practice recommendations were approved; low usage may reflect
task mix. Relevant skill/opportunity/window rules and grouping equivalent routes remain open.
Preserve existing key/command records through any later transition. No raw replay collection,
benchmark study, numerical estimate or implementation is authorized by these product decisions.

Wolf also explicitly requested continued concise, high-level mechanics options with practical
tradeoffs and a reasoned recommendation. Keep this discussion style, capture each actual answer
separately, and avoid duplicating the area's decision discussion in the chief session.

**Acceptance examples:** reading an instruction or concept explanation does not disqualify
an otherwise independent result. Revealing solution steps preserves completion but awards no
XP. A slow but correct independent result can meet readiness. At a major advanced transition,
subscription inclusion plus qualifying prior work or test-out allows entry; a learner missing
the skill gets preparation and a retry. A lesson starts without a visible clock, while a
deliberate speed attempt shows one. Illustrative transitions do not fix the actual checkpoint list.

**Structure acceptance example:** lesson completion and the next learning step lead the
experience; XP supplies one account level. Choosing a drill speedrun shows personal bests and
improvement. Choosing a benchmark shows that challenge's leaderboard position, without a
new mastery tier or second account ladder. Exact UI and save/reward mechanics remain open.

Next discussion: two choices are pending in the area task. First, judge a fresh equivalent
Try solo attempt by its own help/input record without penalizing earlier guided learning.
Second, offer a reviewed, confirmed and private transfer of device guest history into a new
account, excluding records belonging to other accounts. Both are recommendations, not approved
eligibility or transfer rules. Comparison/XP/public-entry conditions, import ownership,
duplicates/conflicts and imported-result eligibility remain open.

Then finish measurement/calibration, legacy and save/next-step details in small groups.
Do not reopen confirmed metrics, mouse/XP/counting rules, practice days, helped-result options,
history/privacy/habit principles, lesson-first entry or the free offer. The earlier reward
questionnaire remains retired.
Develop the supported-in-principle retry/public-entry design while comparison, persistence,
eligibility and historical-rank transition details remain open. Do not reopen the approved
gate/help/timer policies. The chief reconciles answers without duplicating the area's questions.
Existing progress, Foundations feedback and the complete-plan-before-rebuild requirement
remain protected; implementation still requires a separately authorized bounded batch.

## Learning decisions and repair order — status September 18

| Area | Wolf's direction | Still open |
|---|---|---|
| First experience | Short hands-on lesson before account creation, followed by personalization and invitation to save; clear experienced-user shortcut | Exact first lesson, personalization questions, controls and guest-to-account saving |
| Beginner learning | Interactive lessons that teach hotkeys and how Excel works | Exact help presentation and how much each lesson introduces |
| Timing | Ordinary lesson timer optional and hidden by default; deliberate speed attempts show time | Independent retry, pause, competitive timing and publication rules |
| Assisted completion | Instructions/explanations unpenalized; solution-step reveals, Guided help and solution replay mean assisted learning progress with no XP | Map existing controls; define fresh independent retries and remaining competitive eligibility |
| Exploration and access | Complete useful free beginner path with repeat practice/personal speedruns and a few advanced previews; advanced lessons/model-building subscription. Major-jump readiness accepts prior independent work or test-out; helped ordinary completion advances learning | Exact content/preview limits, prices, advanced speedrun and competition/credential access, expiry, checkpoint locations and equivalent evidence |
| Progress and competition | One XP level; helped/independent lesson progress; personal drill-speedrun records; optional selected benchmark/Daily leaderboards. New mastery and overall competitive-rank systems deferred | XP/repeat formulas, exact metrics/save rules, public eligibility and preservation/presentation of historical rank |
| Account history and habits | Every finished attempt plus lightweight deliberate restart/unfinished summaries; private details with chosen public highlights; meaningful active practice including helped/unfinished work counts toward days; optional non-gating streaks | Metric/record dictionary, activity threshold, idle/day rules, detailed replay, retention, interruptions, legacy comparisons and saving/visibility controls |
| Speedrun results and helped retry | Time, comparable PBs, improvement history and actual key-press total; completed command usage counted separately; labelled task-level mouse-reference estimate; Continue and friendly unassisted retry after help | Exact counting/comparison/calibration, final retry wording/button emphasis, fresh-solo eligibility and any practice recommendations |
| Mouse input | Spreadsheet sheet/ribbon/dialog mouse use retains learning progress but earns no XP or qualifying competitive/timed PB; Start/Retry page controls allowed by themselves; existing earnings/history preserved | Detection/focus/accessibility, historical equivalence and private-feedback/derived-estimate treatment |
| Credentials | Interested in skill-path certificates shareable on LinkedIn, and possibly high-score recognition | Evidence required for a certificate versus a speed badge; no endorsement by LinkedIn implied |
| Catalog | Prefer a likely full rebuild, but preserve substantial earlier Foundations feedback | A full plan must precede implementation; the old v5 proposal is not automatically selected |
| Order of work | Easy security/account fixes → catalog/progression separation → repository/database cleanup → site framework → planned catalog redesign | Size/acceptance of each bounded repair or cleanup batch |

The earlier untimed-free-Foundations/everything-else-paid suggestion is superseded by the
approved useful free beginner offer and optional-timer policy above; exact content remains
open. Do not hard-code new payment gates while separating systems.
"Site framework" means structure, journeys and shared interactions unless Wolf later requests
a particular technical framework; it is not permission for a React/Next rewrite.

### Recommendations awaiting agreement

- Design the approved lesson-first entry and experienced-user shortcut. The exact exercise,
  questions and whether an optional assessment helps still need agreement; no conversion
  improvement has been measured.
- Use the same exercise for guided learning and an independent timed retry. In lessons, suggested
  times provide context and do not fail or block a beginner. Teaching time should not become a
  competitive score. This avoids maintaining duplicate timed and untimed catalogs.
- Apply the approved assistance distinction consistently across current controls. Independent XP
  and competitive eligibility still need their detailed rules; do not equate every hint label
  with solution help or treat public posting as already agreed.
- Specify the approved free beginner path and selected advanced previews, keeping replay and
  personal speedruns useful for included free content. Advanced lessons/model-building are paid;
  exact membership, pricing and whether assessed certificates are paid remain open.
- Award shareable skill certificates for demonstrated competence, with high-score recognition
  as separate badges. Following a guide and proving an independent skill should remain distinguishable.

LeetCode is a useful structural reference: it has [study plans](https://leetcode.com/studyplan/)
alongside its problem library, and [Premium](https://leetcode.com/subscribe/) adds exclusive
content and tools. This does not establish the best timing, price or free-tier boundary for
Excel learners; the recommendations above are our product proposals, not copied requirements.

### Preserve Foundations feedback before redesign

Read `dev/DRILLS_WOLF_LIKED.md` and its source feedback (`ROUND1_FEEDBACK.md`,
`ROUND2_FEEDBACK.md`, `WOLF_ROUND3.md`, `DEPTH_PASS.md`) before authoring replacement lessons.
Carry forward the substance: playful movement with visible checkpoints; meaningful copy/paste
and a finish at home; visible consequences in a coherent worksheet; clear location cues;
varied fill operations; useful Paste Special dialogs; and finished models that actually work.
Separate that feedback from historical quotas for grid density/length: a novice's first lesson
must not inherit advanced prerequisites just to fill the screen.

Before catalog implementation, agree the skill/prerequisite map, lesson-to-independent-retry
flow, assistance/timing rules, reward/certificate/access rules, history migration policy, and
representative drill blueprints. Review a small set of those blueprints with Wolf before scaling
production across the whole catalog. Existing drills remain in place until replacements are ready.

## Guidance review with Wolf

Work through one area at a time. First explain what the current app does, what earlier notes
say, and where they conflict. Then capture Wolf's intent. Do not ask him to re-specify details
already supported by evidence. Record what to preserve, what to retire, what remains uncertain,
and how to recognize correct behavior. Keep proposals separate from confirmed decisions.

| Area | Guidance to settle | Review status |
|---|---|---|
| Security and accounts | Guest access, private/public information, account control, admin powers | Open |
| Payments | What is paid, free access, subscriptions, trials, cancellations and refunds | Open; future billing work paused |
| Engine and gameplay | Excel behavior, supported keyboards, timing, hints, grading, retry and completion | Preserve ribbon/game UI; teaching and fidelity balance open |
| UI/UX and onboarding | Desired look and feel, teaching style, customization, first-session journey | Preserve general UI; identity-only pixel art and customization confirmed; onboarding review open |
| Web structure and releases | Pages to keep, navigation, public information, preview/release expectations | Open |
| Drill catalog | Essential skills, lesson depth, variety, realism, progression and rejected content | Playful early learning → realistic later models confirmed; exact sequence open |
| Leaderboards and storage | Fair competition, saved progress, visibility, retention and recovery | History-depth/private-detail/selected-highlight/habit principles approved; exact metric, save, competition and legacy rules open |
| Desks | Intended users, membership, roles, invitations, assignments and paid features | Open |
| Marketing and launch | Positioning, claims, audience-specific messaging, support and launch standard | Open; schedule parked |
| LLC, tax and accounting | Current business facts, responsibilities, jurisdiction and professional advice needed | Open |

Decision record format: date; area; Wolf's decision; earlier guidance it replaces; current-code
evidence; acceptance example; unresolved questions. Confirmed answers belong in this brief;
review findings belong in the linked platform audit; repair status belongs in CURRENT.md.

## Earlier preferences to preserve unless Wolf changes them

These are carried forward from recorded feedback, not newly approved feature work:

- Keep the clear, LeetCode-like practice workspace. Pixel art belongs to identity elements
  such as ranks, achievements, and player cards, rather than the whole spreadsheet surface.
- Teach inside the drill through steps, guides, and hints. Avoid a separate game-level system.
- Make drills feel like a coherent piece of real work. The finished spreadsheet should look
  usable. Actions should have visible consequences and a reason to perform them.
- Grade the result and accept legitimate alternative keyboard routes. Require a specific
  method only when that method is itself the lesson, such as writing a live formula.
- Vary the problem so repetition teaches a skill rather than memorization of an answer.
- Give concrete instructions, useful location cues, and understandable feedback.
- Keep existing eight-chapter organization pending catalog decisions. The 61-drill rebuild
  is a proposal, not authorization to delete the current 74-drill catalog.
- The earlier preference against a practice/ranked mode switch remains the current implementation
  baseline. Wolf explicitly placed modes/ranked play and rank-unlock behavior on the upcoming
  decision-review agenda; do not treat the historical preference as permanently settled or
  restore a switch before that review.

Sources: `dev/CONTINUITY.md` section 0d and section 0c, `dev/DRILLS_WOLF_LIKED.md`,
`dev/DRILL_DOCTRINE.md`, and the status correction in `dev/ART_DIRECTION.md`.
Older exact quotas for drill length, operation count, or grid density are design references;
they must not make beginner lessons needlessly difficult.

## Proposed learning loop to validate

1. Offer a short hands-on lesson without requiring an account, with an experienced-user shortcut.
2. Show a clear task and let the learner use the keyboard, with help available when needed.
3. Explain the result and what is saved, local or pending; exact records/save mechanics need agreement.
4. Invite the learner to personalize their starting point and save progress.
5. Personalization could ask about goals, experience and keyboard setup, then recommend work.
6. Offer a useful retry or a clear next lesson, preserving the relevant learning/performance record.

Lesson-first entry, subsequent personalization/save invitation and the experienced shortcut
are confirmed. The customization dimensions above and detailed save/next-step controls remain
proposals; Wolf has not selected these exact questions. Start with recommendations drawn from a shared, tested catalog; separate
curricula for every profession are not yet approved. Guided learning and competitive runs
need clear scoring rules; whether any mode-selection system is warranted is now explicitly
part of the pending modes/flow review, not an approved addition.

## Decisions still needed

- Exact onboarding questions, how recommendations change, and how users revise their choices.
- Account metric definitions, comparable/legacy records, saving and retention rules within the approved history/privacy/habit principles.
- Which drills belong in the launch learning path, and which September branch tutorials to keep.
- What a subscription includes, price, billing frequency, trial/refund policy, and desk access.
- Launch browser/operating-system support, especially Mac keyboard behavior.
- Current business entity, jurisdiction, banking and Stripe readiness. Prior internship and
  entity notes are historical; do not assume they describe Wolf's current situation.

## Launch quality standard

Target no known release-blocking defects, not an unprovable promise of zero bugs. A learner
must be able to join, receive a useful starting point, complete lessons, understand results,
retain progress, subscribe, manage billing, and get help. Payment and account permissions
must be tested across different users. The release needs a recovery plan and a named owner
for each unresolved issue. The current status of these checks is in CURRENT.md.
