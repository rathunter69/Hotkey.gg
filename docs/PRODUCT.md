# Product direction

Updated September 19, 2026. This is the shared product brief. Current work and launch status
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

### Confirmed catalog/flow decisions — September 17–19

Source: [dated review and acceptance examples](https://github.com/rathunter69/Hotkey.gg/blob/927fd4b86f2be720591334639f8e431bd03b6676/docs/handoffs/catalog-progression.md),
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
next discussion. That September 18 choice did not approve the proposed XP formula.
The later September 19 decision below selects the reward principle; exact amounts/caps,
accomplishment definitions and eligibility details remain open.

Existing earned XP, awards, personal results and rank history remain protected. Deferring a
replacement rank does not authorize deleting or freezing the current system, recalculating
earned values, or hiding history. Plan the current-to-future rank presentation separately.
XP level is not proof of skill or a readiness/access gate. Help/no-assisted-XP, optional lesson
timing, major-jump readiness and personal/public record policies above remain confirmed.
This simplification did not remove certificates or achievements. The later September 19
choice below settles completion-certificate purpose; exact sets and achievement rules remain open.

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
not the final label. Button emphasis was initially open; the later September 19 decision below
makes Continue primary for helped ordinary lessons. The retained speedrun option remains available. Continuing follows the approved readiness/access rules. Result
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

**September 19 — fresh attempts, guest saving and scored timing approved:**

- **Try solo** creates a fresh equivalent attempt judged on its own assistance/input record.
  Earlier solution help does not penalize it or impose a wait until another session. XP and
  qualifying timed records still require the applicable help/input/award/comparison rules;
  public scoring requires entering its challenge. Retain the earlier helped attempt.
- Signup offers to show the device's guest progress/attempt history and carry it privately into
  the new account after confirmation. Exclude records belonging to other signed-in accounts.
  Exact ownership, duplicate/conflict handling, retries and imported-result eligibility remain
  open; carrying history over does not publish it or establish competitive eligibility.
- Show the goal before Start; revealing the worksheet starts the scored clock at the same
  time. Scored clocks run continuously. Ordinary learning is freely pausable and keeps its
  optional visible timer. Exact reveal/render/focus/interruption handling remains open.
- Public benchmarks and Daily events allow unlimited attempts; the best eligible time counts.
  Existing help/mouse rules and comparable-task requirements apply. Seeds, access and comparison
  groups remain open. Keep older first-action-clock records distinguishable from reveal-clock
  results; the historical timing transition needs a plan.

These replace the pending fresh-solo/guest questions and resolve the presented clock/retry
choices. They do not approve transfers, new timing instrumentation or changes to stored scores.

**September 19 — optional practice, friend sharing, consolidated Help and fewer choices approved:**

- Retain **Rapid-fire** as optional quick practice, not a learning path or prerequisite.
  Its placement, duration, assistance/XP and mode-specific result details remain open.
- Friend sharing uses the same benchmark/Daily challenge under its existing rules, without a
  separate race mode. Individual-drill friend races were not selected. Exact sharing controls,
  access and seed/version handling remain open; a link must not silently grant paid access
  or expose private history.
- Provide **one Help entry with levels of support**, keeping task instructions visible and
  explaining when solution assistance affects eligibility. Exact layout and control mapping
  remain open; this does not approve automatic solution reveals or loss of keyboard access.

Wolf explicitly requires fewer competing modes, settings and visible choices because the
spreadsheet ribbon/workspace already feels complicated. Preserve that visual foundation while
reducing surrounding complexity. Keeping a useful feature does not require another prominent
button or upfront choice. Preserve experienced-user shortcuts, individual-drill speedruns and
essential keyboard/accessibility controls.

The area recommends default learning with contextual Solo/Speedrun actions, secondary optional
practice/challenges and quieter settings. That hierarchy is design guidance, not a blanket page
layout approval. Review compact beginner, returning and result states before deciding placement.
The built-feature keep/combine/simplify/leave-out map is also a proposal except for explicitly
approved choices above. Other changes to Classic, Tracks/placement, recommendations, dormant
modes, profile/stats, certificates or Desks remain subject to agreed disposition and transition.
Preserve actual runs, earned/high-water recognition, credentials and session history; do not
invent a durable placement-history record. No feature/code/data deletion, catalog rebuild,
benchmark study, new module or implementation follows from this planning checkpoint.

**September 19 — six design choices and platform/certificate refinements approved:**

| Choice | Confirmed direction | Limits still to specify |
|---|---|---|
| Platform/setup | Windows is primary. Before the first guest exercise, offer a quick Windows/Mac Excel-setup choice with a suggested default, changeable later. Instructions and shortcut teaching follow that choice. | Verified supported shortcuts/functions/browsers, detection and timed comparison pools remain open. This is desired behavior, not evidence of Mac compatibility or full parity; preserve existing Mac behavior. |
| XP | Most XP for new eligible accomplishments, smaller limited repeat-practice rewards, no speed multiplier; one XP level. | Amounts/caps, accomplishment/variant definitions and optional-mode awards remain open. No XP for solution-assisted or spreadsheet-mouse attempts; preserve existing earnings and avoid duplicate awards. |
| Learning format | Focused beginner lessons lead into practical tasks and then larger models. | One learning journey, not three modes. Skill map and representative blueprints still precede any catalog rebuild; preserve Foundations feedback. |
| Certificates | Completion certificates for selected lesson/drill sets. All required completions count, including solution help and spreadsheet mouse use. | Sets/names, completion checks, versions, account/paid access and legacy equivalence remain open. A completion certificate is not an independent-skill claim or speed award. Preserve issued credentials under their original meaning. |
| Desks | Separate optional area for enterprise/training-provider use; individual learning remains primary. | WSP/Training the Street are audience examples, not customers, partners or integration commitments. Roles, assignments, reporting, licensing and organization access remain open; no new workstream. |
| Free depth | Everyday navigation, editing, formatting and basic formulas, teaching ribbon/Excel functionality through enough useful work to show the value of keyboard fluency. Advanced learning/models remain paid. | Exact lessons/previews/prices remain open. This does not make every Excel feature or intermediate course free or establish a numerical savings claim. Free repeats/speedruns apply to included content. |

The certificate decision **supersedes the independent practical-assessment recommendation**.
Helped/mouse-based completion can count toward a certificate while earning no XP or qualifying
time score; a major-jump readiness check still requires its own qualifying evidence/test-out.
Fresh Try solo results are evaluated separately. Existing clean-stored-run certificate logic
is current code evidence, not the replacement rule.

The quick platform choice is a narrow pre-lesson step. Broader goals/experience personalization
and the invitation to save still follow the first lesson; no account-first entry or general
questionnaire before practice is selected. Mac setup must inform a usable supported lesson,
not merely relabel Windows shortcuts; unsupported cases require an explicit scoped design.

**Acceptance examples:** a guest confirms their Excel setup, completes a beginner task and can
personalize/save afterward. A learner completes a certificate set using Help or the ribbon by
mouse: completion credit counts, while XP/timed eligibility remains separate. Optional Desks
can serve a training provider without requiring a new individual learner to join a group.

**September 19 — feedback, sound and tone approved:** Wolf wants action completion to feel
rewarding and continued clarification of the platform's features and feel. His explicit
selections in the dated handoff confirm:

- Small, brief success feedback for each meaningful completed spreadsheet action, with a
  stronger finish when the task is complete.
- Soft, brief success sounds on after the learner starts, with an obvious mute that remembers
  the preference. Ordinary typing stays quiet.
- A playful, polished and encouraging tone around the preserved spreadsheet workspace.
  Pixel art remains limited to identity and achievements.

This is a satisfying user-experience goal, not a measured physiological effect or a new reward
currency. Feedback does not grant per-action XP, new achievements or rewards for every raw key
press. Exact visuals/audio assets, animation/timing, reduced-motion/accessibility behavior and
browser/audio validation remain open. Retain valid routes, fewer competing controls and the
existing help/mouse/score rules; feedback must not silently reveal solutions or pause scored time.

**September 19 — calm learning recovery and helped-result emphasis approved:**

- In ordinary learning, give calm recoverable feedback and allow undo or another try, without
  lives, XP deductions or forced restart. Welcome valid alternative routes and normal Excel
  exploration. This does not waive final correctness, change solution Help consequences or
  relax the approved input/XP/time rules.
- After a helped ordinary lesson, **Continue is primary**, with **Try solo clearly alongside**.
  The working retry label and exact layout remain open. This emphasis does not determine every
  speedrun/challenge result screen, and the retained speedrun option remains available.

These explicitly selected rules resolve the earlier button-emphasis question. Mistake
definition/detection and public-challenge interruption handling remain open. Helped/mouse-based
completion can still feel positive and count toward an applicable completion certificate
without awarding XP or a qualifying timed score. No implementation or new assets are authorized.

**Next proposals, both pending:** use broadly accessible everyday beginner spreadsheet examples
before deeper finance/modeling work, versus finance-first examples; and ask two short,
skippable/changeable post-lesson questions about experience and goal, versus goal-only or a
fuller questionnaire. Windows/Mac setup already comes before the sample lesson. Self-reported
experience is not readiness evidence. Exact question/goal wording, recommendation mapping and
save-invitation placement remain open; neither proposal approves new curricula or assessment.

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

The six-choice/refinement, feel and recovery packets are answered. Await the beginner-context
and post-lesson-personalization choices, then apply the agreed feedback/recovery and helped-result
priority to concrete first-action, helped/solo-result and returning-home examples. Exact layouts,
sound/motion assets and navigation remain design work. Measurement/calibration, comparison,
guest-save/import, XP amounts, certificate sets, public-entry and historical transition also
remain open. Do not reopen answered policies or the retired reward questionnaire. The chief
reconciles answers without duplicating the area's questions.
Existing progress, Foundations feedback and the complete-plan-before-rebuild requirement
remain protected; implementation still requires a separately authorized bounded batch.

## Learning decisions and repair order — status September 19

| Area | Wolf's direction | Still open |
|---|---|---|
| First experience and platform | Quick suggested/changeable Windows/Mac setup before the guest exercise; Windows primary; instructions follow setup; lesson before signup, then personalization/save invitation; experienced shortcut | Verified platform scope/parity, exact lesson, broader personalization, controls and guest-saving mechanics |
| Learning format | Focused lessons → practical tasks → larger models, teaching ribbon/Excel functionality | Exact lesson depth, skill map, examples and Foundations-preserving blueprints |
| Timing and scored retries | Ordinary learning freely pausable with optional hidden-by-default timer; goal before Start, worksheet reveal starts a continuously running scored clock; unlimited benchmark/Daily attempts, best eligible time | Reveal/focus/interruption mechanics, seeds/comparison groups, access, historical timing transition and public-entry controls |
| Help and solo retry | One Help entry with visible instructions and stated assistance consequences; solution help earns learning progress but no XP; a fresh Try solo attempt is judged on its own help/input record | Map actual help controls, define equivalent/comparable tasks and remaining award/eligibility details |
| Exploration and access | Complete useful free beginner path with repeat practice/personal speedruns and a few advanced previews; advanced lessons/model-building subscription. Major-jump readiness accepts prior independent work or test-out; helped ordinary completion advances learning | Exact content/preview limits, prices, advanced speedrun and competition/credential access, expiry, checkpoint locations and equivalent evidence |
| Progress and competition | One XP level: new eligible accomplishments earn most, limited repeats less, no speed multiplier; learning progress, personal speedruns and optional benchmark/Daily boards; new mastery/overall rank deferred | Exact XP amounts/caps/eligibility, metrics/save rules, public eligibility and historical-rank presentation |
| Account history and habits | Every finished attempt plus lightweight deliberate restart/unfinished summaries; private details with chosen public highlights; meaningful active practice including helped/unfinished work counts toward days; optional non-gating streaks | Metric/record dictionary, activity threshold, idle/day rules, detailed replay, retention, interruptions, legacy comparisons and saving/visibility controls |
| Speedrun results and helped retry | Time, comparable PBs, improvement history and actual key-press total; completed commands counted separately; labelled task-level mouse estimate; Continue primary with Try solo alongside after helped ordinary lessons; new solo attempt evaluated on its own | Exact counting/comparison/calibration, final retry wording/layout, event-result actions and any practice recommendations |
| Mouse input | Spreadsheet sheet/ribbon/dialog mouse use retains learning progress but earns no XP or qualifying competitive/timed PB; Start/Retry page controls allowed by themselves; existing earnings/history preserved | Detection/focus/accessibility, historical equivalence and private-feedback/derived-estimate treatment |
| Entry, sharing and simplicity | Offer reviewed/confirmed private guest-history carry-over at signup; optional Rapid-fire; benchmark/Daily friend sharing without separate race mode; fewer competing modes/settings | Import/ownership mechanics, navigation/action hierarchy, remaining feature dispositions and mode rewards |
| Feedback and recovery | Brief success feedback for meaningful actions and bigger task finish; soft success sounds after Start with remembered mute, quiet typing; playful/polished/encouraging; calm ordinary-learning undo/retry without lives, XP deductions or forced restart | Exact assets/timing/accessibility and mistake detection; correctness/Help/input and continuously running scored time remain unchanged |
| Certificates | Completion of selected lesson/drill sets, including helped and spreadsheet-mouse completions; preserve issued credentials; separate from solo readiness/XP/time eligibility | Exact sets/checks, names, versions, account/paid eligibility and legacy equivalence; no independent-skill or accreditation claim |
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
- Design fresh equivalent Try solo tasks under the approved per-attempt eligibility rules.
  Define shared content identity and timed comparison groups without turning teaching time
  into a competitive score or penalizing prior guided learning.
- Apply the approved assistance distinction consistently across current controls. Independent XP
  and competitive eligibility still need their detailed rules; do not equate every hint label
  with solution help or treat public posting as already agreed.
- Specify the approved free beginner path and selected advanced previews, keeping replay and
  personal speedruns useful for included free content. Advanced lessons/model-building are paid;
  exact membership, pricing and whether completion certificates are paid remain open.
- Specify the approved completion-certificate sets and truthful wording. Keep certificate
  completion separate from solo readiness, XP and timed performance; no new assessment system
  follows from this decision.

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
| Desks | Optional separate enterprise/training-provider area | Audience/prominence approved; roles, assignments, reporting, licensing and integrations remain open |
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

1. Offer a quick suggested/changeable Windows/Mac setup, then a short guest lesson with an experienced-user shortcut.
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
- Exact verified browser/operating-system support and Mac keyboard behavior under the approved Windows-primary/changeable-setup direction.
- Current business entity, jurisdiction, banking and Stripe readiness. Prior internship and
  entity notes are historical; do not assume they describe Wolf's current situation.

## Launch quality standard

Target no known release-blocking defects, not an unprovable promise of zero bugs. A learner
must be able to join, receive a useful starting point, complete lessons, understand results,
retain progress, subscribe, manage billing, and get help. Payment and account permissions
must be tested across different users. The release needs a recovery plan and a named owner
for each unresolved issue. The current status of these checks is in CURRENT.md.
