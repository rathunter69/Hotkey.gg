# Catalog, modes and learner-flow decision review

Updated: 2026-09-18 (Europe/Berlin)
Task: `01a0b148-2693-7901-af91-934c83cabe1d`
Chief: `01a0b0fa-d857-7002-ab95-1da0a1cfb858`
Branch: `codex/catalog-flow-review`
Starting commit: `00df57afd8d3299cc7feaf523847b9ca43e54d06`
Latest shared guidance checked: `codex/repository-foundation` at `b8b8ca0d6f783fa5396dd39f29fadb9e56a8d147`.
Initial evidence review used guidance at `79e4d93f8bc1fe486a734e58daedd892fbb13544`.
Chief follow-up: guidance `0ae29b1c7dfeee3c2551ce52352a65241a979c74` adds concise user-facing
communication and chief ownership of platform-wide design discussion; this review supplies proposals.
State: learning-first direction, light prerequisite/subscription gates, optional lesson timing
and the instruction-versus-solution-assistance distinction confirmed. Public competition
focuses on selected benchmarks/Daily events. Fresh independent variations and deliberate public
entry are supported in principle, conditional on retaining key user metrics and individual-drill
speedrunning. Exact metrics/comparison rules, mechanics and access boundaries remain open.
Owned files: **only `docs/handoffs/catalog-progression.md`**. CURRENT and PRODUCT remain chief-owned.

## Scope and outcome

Wolf authorized investigation and planning to make learning coherent before a catalog rebuild.
This checkpoint maps current behavior, reconciles relevant history, proposes boundaries and
example journeys, and asks the first three dependent choices. It is not a complete catalog
plan, implementation audit, production playtest or authorization to change access/rewards.

At the initial review, remote CURRENT accepted 00df57a as the next area baseline. CURRENT at
132bb0a now accepts `16ee8306a8c170db9f8fe2e051b44b0519782ae1` for new implementation work;
the chief verified runtime equality and explicitly retained 00df57a for this source/design
review. No rebase or repeat audit is needed for that test-only consolidation. The original dirty
`source/` checkout was preserved. This
branch starts from 00df57a in a separate worktree. The chief acknowledged exclusive ownership
of this handoff and confirmed that no additional area task needs starting.

No application behavior, content, generated page, migration, earned progress, shared product
document, main branch, deployment or billing configuration is changed by this task.

## Confirmed direction and decision provenance

The following are **Wolf-confirmed constraints**, restated in the September 17 task request
and [latest product guidance](https://github.com/rathunter69/Hotkey.gg/blob/79e4d93f8bc1fe486a734e58daedd892fbb13544/docs/PRODUCT.md):

- Preserve the general UI, ribbon and spreadsheet workspace. Pixel art belongs to identity
  and achievements. Interaction rules may change after decisions; the visual foundation stays.
- Preserve Foundations feedback and existing earned progress. No content wipe or progress reset.
- Guided beginner learning should lead from playful keyboard actions to realistic spreadsheet
  and finance work. Personalized starting points remain a requirement; exact questions are open.
- Assisted completion counts toward learning progress, **not XP**, unless Wolf revises that rule.
  September 18 defines ordinary instructions/explanations as unpenalized and solution steps,
  Guided help and solution replay as assistance; mapping every existing hint/control remains work.
- Basics should be freely explorable and paths recommended. Advanced learning now has an
  agreed subscription/readiness policy below; exact inclusions and checkpoint locations remain open.
- A full catalog rebuild is future direction, conditional on a complete agreed plan.
- Subscriptions must work at launch; the launch deadline is parked. The offer and pricing are open.
- The old preference against a practice/ranked switch is explicitly reopened for discussion.
  Reviewing it is not approval to restore it or to retain every historical mode.

The first checkpoint at 0151c3d recorded D1–D3 as unanswered. Subsequent answers are dated
below. Recommendations remain proposals except where explicitly marked confirmed.

### September 17 follow-up: learning first; later-lesson gates

**Confirmed by Wolf:** learning is the main journey, with speedrunning a prominent optional
challenge. The proposed loop was “Learn a skill → complete it independently → improve your
speed → compete.” Wolf asked whether this meant a more educational direction with speedrunning
in the background, then approved the explanation: “Yes - sounds perfect.” The explanation
retains playful hands-on early exercises, later realistic spreadsheets/models, helped learning
progress without XP, and direct access to the competitive experience for experienced players
subject to its eventual eligibility/access rules. No particular button or assessment was approved.

**Also confirmed at the direction level:** Wolf said it “makes more sense to gate the later
lessons.” This puts the gate policy explicitly into the next decision, rather than treating
the area's earlier unrestricted-entitled-exploration recommendation as agreed. It does not settle which lessons,
what evidence unlocks them, or where the paid boundary falls.

**Tentative preference, not final gate policy:** asked whether gates should use demonstrated
skills, earlier lesson completion, subscription, or both skills and subscription, Wolf replied:
“Do you have a suggestion? Intuition is 4.” Option 4 was both prerequisite skills and a
subscription. Record that inclination without converting a request for advice into approval
of the detailed policy below. This was the status at bace206; the subsequent explicit approval
is recorded in the September 18 entry.

**Lead recommendation at bace206, subsequently approved September 18:** subscription access determines whether advanced
learning is included; a small readiness check or equivalent earlier independent result gates
only major jumps in skill requirements. Ordinary lesson completion with help moves learning
forward. Experienced learners can test out; checks judge correct work rather than speed/XP,
and learning/retries remain available to prepare for them. Do not require a new test before
every lesson. The exact free curriculum, checkpoint locations, equivalences and credential
standards remain to be designed. This narrows D3/D9; it does not activate billing.

**Acceptance examples:** a beginner finishes with help, earns learning progress without XP
and receives the next suitable lesson. A learner ready for an advanced topic meets both the
eventual access rule and a targeted prerequisite check, using existing evidence or testing out.
An experienced learner can pursue timed work without being forced through every beginner lesson.
At this first follow-up, checkpoint mechanics were proposals. The next entry records approval
of the general mechanics while preserving the open curriculum/threshold details.

**Earlier guidance affected:** the learning-first hierarchy now replaces treating the speed/XP
climb as the primary educational journey. Later-lesson gates qualify the earlier recommendation
for unrestricted exploration of all entitled exercises; freely explored basics remain preserved.
This does not yet replace specific runtime level locks, automatic publication, level-10 rank
eligibility or placement rules. D1's exact content identity and D2's per-attempt controls remain
open. Existing earned progress stays protected and no implementation is authorized.

### September 18: light readiness gates plus subscription approved

**Source:** following the explicit recommendation of subscription access, short readiness
checks at major skill jumps, credit for earlier independent work/test-out, and helped ordinary
progression without speed/XP gates, Wolf replied: “Sounds perfect. I think this is a better fit
for the vibe of the project.” This approves that policy; it does not approve every earlier proposal.

**Confirmed rules:**

- Subscription access opens the advanced curriculum; the exact free/paid lesson boundary and
  offer remain to be specified, and billing stays inactive during this planning phase.
- Prerequisite checks occur at major skill jumps, not before every ordinary lesson.
- Relevant earlier independent work satisfies readiness; experienced learners can use a short
  test-out instead of completing the whole beginner sequence.
- Completing ordinary lessons with help advances learning, with no assisted XP.
- Readiness is demonstrated through correct independent work, not speed targets or accumulated XP.

**Supersedes:** the tentative combined-gate preference in bace206 and the area's original D3
proposal for no prerequisite gates on any entitled exercise. It also replaces the historical
speed/XP-gated educational ladder as the desired future learning rule. Existing runtime locks
remain unchanged until separately authorized implementation. This does not decide rank-entry
requirements, score posting, checkpoint pass thresholds or any credential assessment rule.

**Acceptance examples:** helped completion of an ordinary beginner lesson leads to the next
suitable lesson and earns no XP. At a major advanced transition, subscription access plus an
existing qualifying independent result permits entry; otherwise a short test-out can establish
readiness. A slow but correct independent result can satisfy readiness. A paid learner lacking
the prerequisite receives preparation work and a way to try again. The formula-to-modelling
transition used in discussion is illustrative, not an approved exact checkpoint/content list.

### September 18: lesson timer and assistance boundary approved

**Source:** Wolf answered “Optional timer during lessons (recommended)” to the question about
hiding the lesson timer unless the learner enables it, with visible timing for deliberate speed
attempts. He answered “Yes, use that distinction (recommended)” to unpenalized instructions and
explanations versus solution steps, Guided help and solution replay counting as assistance.

**Confirmed rules:**

- Ordinary lesson timing is optional; the clock stays hidden unless the learner turns it on.
  Deliberate speed attempts show their clock. Turning on lesson timing does not itself select
  public competition or change an assisted result into independent evidence.
- Normal task instructions and explanations do not penalize the learner or remove XP eligibility
  by themselves. Actual XP still depends on the agreed independent-completion rules.
- Revealing solution steps, using Guided help or replaying a solution makes the attempt
  assisted. It earns learning progress but no XP, and ordinary helped completion still advances
  learning under the approved gate policy.

**Acceptance examples:** a learner reads the task and a concept explanation, completes it
independently and is not marked assisted solely for reading those materials. Another reveals
the solution steps and finishes: learning completion is retained, XP is zero. A lesson begins
without a visible clock; enabling time feedback does not publish a score. A deliberate speed
attempt shows time. The precise independent-retry, public-posting, pause and rank rules remain open.

**Supersedes:** the former always-visible timed teaching direction and historical blanket
“hints never change scoring” rule wherever the hint reveals solution steps. Keep useful instruction
text visible. Classify each existing F1/tutorial hint, rail and replay by what it actually reveals,
not its old label; no UI control, XP formula or persistence code is changed by this decision record.

### September 18: high-level mechanics options — competitive scope selected

Wolf explicitly requested continued suggestions and manageable options at the level of product
mechanics, saying this discussion helped direct the project. Continue this style: explain the
learner impact and real tradeoffs, recommend a choice, and record only actual answers as decisions.
This is not authority to implement recommendations or start additional modules.

The packet addressed D1, D2 and part of D7/D12. At b6a3177, **D1/D2 remained unanswered** and
Wolf had selected the third option. The following entry records his subsequent support with
metrics/speedrun conditions; supporting rule proposals are not automatically approved.

1. **Independent work: same skill, fresh variation.** After learning with help, offer the same
   task pattern with fresh values/targets and only enough layout variation to avoid answer
   recall. Keep exact-board replay available for rehearsal. This reuses teaching/content while
   giving better evidence of independent application; variants need equivalent difficulty and
   reliable grading. Alternatives: exact-board independent replay (familiar/cheap, easier to
   memorize), or a separate assessment exercise (clear separation, more content and maintenance).
   A fresh solve establishes independent completion, not mastery or a certificate by itself.
   How earlier solution viewing affects subsequent attempts still needs an explicit rule.
2. **Competitive intent: choose public scoring before the attempt.** Ordinary learning,
   private timed improvement and public scored attempts are distinct purposes in the same
   workspace. Public entry shows the rules before its clock begins. This adds a deliberate
   choice and makes posting predictable. Alternatives: automatically publish every eligible
   independent run (fewer choices, surprising visibility/eligibility) or make a dedicated
   competition area the only public entry (clear boundary, more navigation/context switching).
   Interface labels and retry controls remain later design. Solution help preserves learning
   completion and may retain clearly labelled personal time feedback, but should end public
   score eligibility; that exclusion is a proposal awaiting the competitive-rule decision.
3. **Competitive scope — selected: personal records plus selected standard benchmarks and Daily events.**
   Learning variants help test understanding; speed comparisons use a defined board, content
   revision and common rules. A curated comparison set can stay stable while lessons evolve.
   Tradeoff: narrower leaderboard variety and more curation. Alternatives: boards across every
   drill (breadth/current continuity, greater fairness/versioning/curriculum coupling), or
   personal bests only initially (simplest, postpones public competition). The comparison pool
   and clock/help/tool rules need agreement; times on arbitrary learning variants should not
   silently enter one common PB/leaderboard. Competitors on one board must have the same
   challenge/rules access; paid curriculum must not grant extra counted boards that inflate a
   shared overall rating. Exact free/paid competition access is still open. The future overall
   account-rank model/display is a separate decision; existing results/earned history are preserved.

**Confirmed September 18:** Wolf answered “Selected benchmarks and Daily events (recommended)”
to the public-competition scope question. The future experience uses a curated set of standard
skill challenges and Daily events, alongside personal bests, rather than making the evolving
lesson catalog itself the universal public comparison set. Existing scores/earned history are
preserved. This selects D7's scope recommendation; it does not settle D1 retry variants or D2
public-entry behavior, and does not approve a new global rank, removal of old boards, exact
benchmark access/seed/retry rules or any implementation.

**Acceptance example:** reordering/replacing a learning lesson does not silently redefine a
public benchmark. A public challenge has its own stated comparable task/rules; prior scores
remain accessible as earned history when a challenge later changes. Versioning mechanics and
the future presentation of existing catalog boards still require a plan.

**Examples for these proposals:** a learner follows a Paste Special guide, then tries the same
skill with different source values. Independent success remains distinct from the helped record.
They can later chase a private time or deliberately enter a fixed public benchmark. Separately,
moving a lesson between paths changes its recommendation without changing the definition of an
existing competitive board. A materially changed benchmark receives a new scored revision;
older results remain historical evidence. These examples do not select XP amounts or mastery rules.

**Dependencies:** fresh variants need the content/skill identity agreement (D1) and grader
equivalence; public intent defines what is saved/published (D2 and Saved-progress); benchmark
scope constrains score comparability, entitlement fairness and future rank design (D7/D9/D11).
Do not make one fresh solve, accumulated XP or a subscription synonymous with mastery/rank.

**Review:** reused the existing source map, with one bounded independent product critique.
It sharpened three distinctions: exact replay versus transfer evidence, private timing versus
public entry, and common benchmark access versus paid curriculum. No fresh audit, application
test, security work or other module was started. The recommendations are product hypotheses,
not measured learning/conversion claims or imported competitor requirements.

### September 18: preserve metrics and personal drill speedrunning

**Source:** responding to the fresh-variation and deliberate-public-entry recommendations,
Wolf said: “I think so - just want to make sure we retain key metrics for the users, but I think
that makes sense. I want to make sure it still has some option to speedrun the drill but it
sounds like better as a learning tool.”

**Decision status:** D1 fresh independent variations and D2 deliberate public entry are
supported in principle with explicit conditions: retain useful personal metrics and an option
to speedrun individual drills. Learning-first does not restrict all timed play to the curated
public benchmark set. This is sufficient to develop that design; it is not approval of exact
metric formulas, scored-variant comparability, rank rules or implementation. Do not repeat the
same broad D1/D2 question; demonstrate these conditions in the next design examples.

**Proposed experience:** learn/practise an exercise, try the skill independently, then speedrun
the drill for a personal best. Public competition uses the selected benchmark/Daily scope and
deliberate public intent. A personal drill speedrun need not have a public leaderboard.
Private activity must not disappear from useful user metrics merely because it was not published.

**Metrics recommendation, exact set not yet approved:** retain completion and path/skill
progress, helped versus independent results, attempt history, completion time, comparable
personal bests and improvement over prior attempts, plus keystrokes/efficiency where reliable.
Retain earned XP/identity history under the approved no-assisted-XP rule. Correct alternative
routes remain valid; an efficiency measure must not become a hidden requirement to copy one
authored solution. One independent success is not automatically mastery. Overall competitive
rank and the exact mastery/XP rules remain separate decisions.

**Proposed acceptance examples:**
- A learner completes a guided lesson and later sees that learning progress in their account;
  the result is labelled helped, with no XP or misleading independent PB.
- A signed-in learner speedruns a drill privately, improves a comparable PB and can return to
  see the time/history, without publishing a leaderboard result or obtaining a competitive rank.
- A lesson moves to another path and the learner retains past results, PBs and earned progress.
- Times from materially different boards/rules are not silently pooled as one comparable PB;
  an assisted time remains separate from an independent speed record. The exact comparison
  groups and treatment of legacy records need a plan before implementation.

**Dependency/ownership:** learning and private-performance records must be distinct from public
score submission in the future persistence contract. Existing run posting is not proof that
private/assisted account history already works. Saved-progress owns durable account history,
save/retry and cross-device verification; this task defines the desired experience only. No
new persistence module, storage schema, data migration or leaderboard removal is authorized.

### September 18: proposed meanings for mastery, XP and competitive rank

**Status: three questions presented; awaiting Wolf's answers.** The chief reconciled the
preceding qualified response in foundation b8b8ca0, checked here through remote PRODUCT and
CURRENT. This packet develops the agreed metrics/speedrun requirement; it does not reopen
the broad retry/public-entry choices or change application behavior.

**Illustrative result history, not current UI or measured user data:**

| Activity | Proposed useful record | Meaning and comparison boundary |
|---|---|---|
| Complete a lesson with solution help | Completed with help; learning credit; zero XP | Keeps the learning achievement. It is not independent skill evidence or an independent speed PB. |
| Solve a fresh task independently | Independent completion; XP eligibility subject to agreed rules | A stronger result, without claiming mastery from one solve. Exact independent-retry eligibility remains open. |
| Speedrun a drill privately | Personal best 1:24; attempt retained | Private does not mean unsaved. This drill need not have a public board. |
| Repeat that same speed challenge | New best 1:16; 8 seconds faster; both attempts retained | Comparison assumes the same board/revision and timing/help rules; arbitrary lesson variants cannot silently share this PB. |
| Enter a public benchmark | Benchmark result 1:31 and its leaderboard position | Its board/rules determine comparison. This time is not compared with the private drill's 1:16 or used to infer improvement across different work. |

Time, attempts, comparable PBs, improvement and meaningful keystroke/efficiency feedback remain
candidate personal metrics. Exact fields, formulas, save/visibility and guest/account behavior
are not approved by this example. Efficiency never overrides a legitimate correct route.

**D6a — mastery meaning. Recommendation:** correct independent application across a few varied
tasks, without a speed requirement. This is evidence about a skill, distinct from lesson
completion and from being fast on a memorized board. Alternatives: one dedicated skill
assessment (clear finish line, depends heavily on test coverage), or omit mastery for now and
show only completion/independent status (simpler, less claim about broader competence).
Varied evidence requires coherent skill coverage and equivalent task difficulty; exact count,
recency, qualifying tasks and wording remain open. No extra mastery gate is proposed for
ordinary learning. The already-approved short readiness check at a major skill jump remains
separate; learners need not fully master a topic before continuing. No certificate standard,
decay rule or revocation of existing awards is selected here.

**D6b — XP meaning. Recommendation:** XP/level celebrates independent learning and practice;
new accomplishments earn most, with smaller, limited repeat-practice rewards. Alternatives:
similar XP for every independent solve (simple and encouraging, easier to grind), or XP only
for first completions/milestones (clear finite rewards, little recognition for useful rehearsal).
Assisted completion still earns zero XP and existing earned XP stays protected. Repeat XP
does not establish mastery/readiness/rank. The exact amounts, limits, definition of a new
accomplishment, treatment of PB improvement and anti-duplication rules remain open. A fresh
random seed or a second path referencing the same exercise is not proposed as a new first-clear
reward. The question does not decide which post-help retries qualify as independent.

**D7a — account rank meaning. Recommendation:** keep the XP level and an optional competitive
rank separate; a future rank would use selected standardized benchmarks. Daily events keep
their own standings and other drills keep personal PBs. Alternative: retain XP and individual
challenge leaderboards while deferring a new overall rank (simpler, fewer aggregate claims,
less cross-challenge competitive identity). Benchmark rank gives competitors a long-term
target but needs sufficient coverage, a fair formula and comparable access/rules. Benchmark
membership, placement, aggregation, seasons, visibility and whether any Daily result ever
affects rank remain open. The recommendation here is to keep Daily standings separate from
the proposed rank, not to infer that Wolf's earlier Daily approval selected a rating formula.
Paid-only counted boards must not provide a breadth advantage under the proposed fairness
policy. No new rank calculation is approved; existing earned rank/results remain historical
evidence under their original rules, without retroactive relabeling or removal.

**Dependencies:** agree meanings before formulas or catalog reward targets. D6a needs a
skill/evidence map; it informs later achievements and certificates without deciding them.
D6b depends on assistance/independent eligibility and durable non-duplicated records. D7a
depends on benchmark comparability, eligibility/access and the future saved-score trust
contract. Saved-progress, Engine and Security retain implementation ownership; no new work
is assigned here. A bounded independent product critique clarified mastery versus access,
repeat rewards versus grind, and proposed versus historical rank. It did not repeat an audit.

**Wolf's choices:** D6a pending; D6b pending; D7a pending. Record each actual answer separately.
The questions were presented as this single three-item group. Silence is not approval of
the recommendations or of any supporting detail in this section.

## Evidence register

All runtime paths/line references below refer to **00df57a**, unless another SHA is named.
They describe the accepted source, not a fresh observation of the public site or live accounts.

| ID | Source | What it establishes |
|---|---|---|
| E1 | [CURRENT at 79e4d93](https://github.com/rathunter69/Hotkey.gg/blob/79e4d93f8bc1fe486a734e58daedd892fbb13544/docs/CURRENT.md) and [groundwork handoff](https://github.com/rathunter69/Hotkey.gg/blob/00df57afd8d3299cc7feaf523847b9ca43e54d06/docs/handoffs/groundwork-integration.md) | Accepted baseline and existing test evidence; separate Security replay work is outside it. |
| E2 | [Architecture](../ARCHITECTURE.md), [experience audit](../audit/EXPERIENCE.md), [engine/content audit](../audit/ENGINE_CONTENT.md), [data/security audit](../audit/DATA_SECURITY.md) | Existing dependency map, onboarding gaps, completion rules and persistence/competition limits. These are reused, not new reproductions. |
| E3 | [drills.js](../../drills.js), especially 19–21, 40–49, 174–212, 234–324, 330–486, 517–718, 811–880 | Catalog, five placement drills, certificate tracks, milestones, speed bands, premium flags, achievements and level/pace gates. |
| E4 | [index.html](../../index.html), especially 25607–25790, 29147, 30380–30387, 31341–31405, 31835–31890, 33857 onward, 34496–34536 | Local completion, help eligibility, milestone/access calculations, tutorial controller and run/session recording. |
| E5 | [themes.js](../../themes.js):662–800; [nav.js](../../nav.js):1410–1436; [lb.js](../../lb.js):578–646 | XP levels, competitive rating, automatic rank eligibility and five-board placement. |
| E6 | [newest certificate definition](../../supabase/migrations/20260903000000_certificate_tracks_r452.sql):35–67 | Three fixed track lists; permanent signed-in account; a mouse-free, unflagged stored run for every required drill; no pace threshold. This is source evidence, not a fresh live issuance test. |
| E7 | [Historical continuity](../../dev/CONTINUITY.md): sections 0b–0d; [merged change a2bc3f7 / PR #249](https://github.com/rathunter69/Hotkey.gg/commit/a2bc3f762df3f360bb6be3182258ebc1ee0780c9) | September 3–4 transition to integrated tutorials, automatic rank at level 10 and retirement of opt-in/out ranked controls. |
| E8 | [Unmerged tutorial branch at 1703b59](https://github.com/rathunter69/Hotkey.gg/tree/1703b59324af098f252b8b4dcd8d3fd859338197); [branch inventory](../BRANCH_INVENTORY.md) | September 5–6 alternative adds `entrybasics` and `ribbonways`, reorders Foundations and changes curriculum mapping. It also edits an existing certificate migration; do not import wholesale. |
| E9 | [Foundations synthesis](../../dev/DRILLS_WOLF_LIKED.md), [Round 1](../../dev/ROUND1_FEEDBACK.md), [Round 2](../../dev/ROUND2_FEEDBACK.md), [Round 3](../../dev/WOLF_ROUND3.md), [Depth Pass](../../dev/DEPTH_PASS.md) | Dated July feedback and September synthesis to preserve as design rationale, not blanket approval of old quotas or roadmaps. |

README, AGENTS, DEVELOPMENT, TASK_GUIDE, TASK_STARTERS, ARCHITECTURE and audit README were read
from freshly fetched remote foundation guidance. Relevant reports and the accepted integration
handoff were followed. Historical branch differences were checked against main `434bc0e`;
their missing newer groundwork is not evidence that accepted work should be removed.

## Plain-English map of the current system

```text
First visit / resume / direct drill link
                |
                v
Choose a drill from eight chapters ----> chapter level/pace locks + separate paid-access check
                |
                v
Spreadsheet workspace: objective, optional teaching/help, running clock, result checks
                |
                v
Completion ----> local activity / tutorial state
                |
                +---- eligible clean attempt ----> personal best + XP + speed band
                |                                   |
                |                                   +--> milestone bonuses / achievements
                |                                   +--> XP level --> rank eligibility
                |
                +---- eligible signed-in run ----> saved run --> boards / placement / rating
                                                    |
                                                    +--> certificate coverage

Current chapter membership also selects certificate requirements, paid classification,
menu order and some achievement targets. A path is not yet an independent recommendation.
```

| Term/system | What the accepted source currently does | What must not be inferred |
|---|---|---|
| Drill | A concrete board, objectives, checks and authored help, addressed by a lasting string key. 74 drills are grouped into eight chapters. | A drill is not automatically a separate lesson, ranked match or proof of mastery. |
| Lesson/tutorial | Navigation has an integrated staged guide. Generic lesson-card and old Keyboard Tour code remains, but the audit did not establish an active lesson catalog or second automatic tour. | Retained framework code is not shipped teaching content. |
| Classic attempt | A drill can be completed repeatedly; the first-key gate starts the clock. Clean means no mouse assistance and no guided rails for normal XP/PB/upload checks. | There is no current global practice/ranked switch. A timed run is not necessarily eligible or posted. |
| Help | F1 hints expose keys without cursor rails; guided mode constrains the cursor and latches `guidedUsed`. The step guide includes manual/automatic hints, which explicitly do not alter scoring (`index.html:33980–33988`, `34109–34118`). Solution replay is another tool. | “Used help” is not one consistent current eligibility category. A coached tutorial can still earn XP/PB and post today. The exact new assistance boundary needs D4. |
| Completion | Successful work updates local clear/activity state. Clean work additionally qualifies for PB/XP and, with an account, run upload. | Assisted completion is not established as durable, account-wide path progress. |
| Learning paths | Three certificate tracks collect chapter groups. The visible Tracks control opens active pace-gated milestones through the legacy-named campaign implementation. There is no established goal/experience personalization. | These are not yet independent advisory paths or a personal prerequisite map. |
| Milestone | Selected clean PBs must meet par × 1.5; designated capstones need a clean result. Claimed milestone rewards have a preservation latch. | Not every drill in a chapter is a milestone requirement; capstone checks do not set the certificate pace rule. |
| XP and level | XP rewards clean solves, repeat activity and other performance/session bonuses. Level accumulates activity and influences locks. | Level is not competitive rank or an assessment of competence. XP is recalculated by client code from stored results, not an authoritative server score ledger. |
| Competitive rank | Eligibility is automatic at level 10 or the campaign-coverage predicate. Then five standard boards (`navigation`, `combo`, `margin`, `sort`, `opmodel`) establish placement. Rating uses relative best-time standings, breadth and field size. | Ordinary eligible drill posting does not wait for level 10. Opening rank eligibility does not instantly establish a placed rank. Placement is not onboarding personalization. |
| Speed bands / achievements | Cleared, Bronze, Silver, Gold and Elite depend on PB versus par. Other achievements use activity, skills, named drills, rank and current catalog membership. | A speed band or optional star is not a complete general mastery model. Decorative selections are not all server-verified credentials. |
| Certificates | Three named tracks require qualifying stored runs for all listed drills. Current issuance does not require a time target or milestone completion. | Following a guide is not the agreed future certificate standard; current input trust is limited by DATA-07. |
| Access | Premium enforcement is disabled and perks are free-for-now, but later chapter level/pace locks still operate. Foundations, Formatting and Formulas I have no group level gate. Real PRO bypasses progression locks; existing PBs and chapter coverage provide other routes. | “All drills free” means no active subscription charge, not unrestricted day-one access. Account, entitlement, XP level and skill prerequisites are different concepts. |
| Guest / account | Guests can use the trainer and local progress. Normal client run posting requires a permanent signed-in account. Creating a desk is a separate real-entitlement boundary. | Guest local success is not automatically a saved cross-device result; billing is not an operational purchase journey. |

The automatic-rank campaign shortcut in `nav.js:1410–1431` checks pace coverage; it does not
call the same capstone predicate as the milestone UI. Treat “every milestone shipped” copy
as an imperfect description of the implementation. This is a narrow source discrepancy for
the later rules owner, not a security finding or an authorization to repair it here.

### Modes, events and recommendation tools

These are different session shapes around the core workspace. They do not all need equal
prominence or their own catalog. This table supplies a proposed disposition, not removal authority.

| Experience | Current source and behavior | Proposed role / overlap to settle |
|---|---|---|
| Classic | Default, one full drill; normal completion/retry/next (`index.html:30741–30756`). | Core exercise experience for learning and independent work. D1/D2 define its attempts. |
| Rapid-fire | Separate short shortcut exercises; hits score; optional keycap help. Landing offers 30/60/90 seconds, but the trainer popover offers 30/60/120 (`2353–2357`, `29759–29770`, `30727–30736`). Guided use makes the session practice (`30844–30918`). | Optional speed practice, subordinate to learning. It trains recall rather than a completed spreadsheet; do not equate its score with model competence. Reconcile durations if this experience is retained. |
| Marathon | Runtime/config for random unlocked/entitled full drills over 3/5/10 minutes remains (`30780–30815`), but the current DOM has no Marathon button; its listener is guarded and landing exposes only Classic/Rapid-fire (`2343–2358`, `29657–29668`, `30753`). | Dormant, not an available ordinary user choice. No revival proposed. A distinct learner purpose and a new decision would be needed before restoring an entry. |
| Daily Challenge | Shared deterministic board; best time for the day; bypasses normal chapter/access gates. Its configured level 3/PRO entry gate is currently bypassed for everyone because `isPro()` includes `PRO_PERKS_FREE=true` (`2744`, `31613`, `32653`). A completed-day button says practice but still launches the challenge route (`31739–31776`, `32054–32089`). | One optional shared competitive event. Decide whether retries score before promising one-attempt fairness; source label/path discrepancy needs a targeted check in later implementation work. |
| Placement / rank | Five full drills are a prerequisite to a placed competitive rank after rank eligibility, not a selectable game engine. | Competitive setup only. Do not reuse it as mandatory learning assessment without a decision about skill coverage and difficulty. |
| Race link | A clean result can share `?race=<drill>&t=<time>`; recipient gets a target verdict and a ladder/paywall bypass (`25162–25223`, `26171–26229`, `32459–32486`). | A shared challenge wrapper. Current URL carries key and target time, not a shared board seed; identical work/fair comparability is not established. Decide access and comparison rules with D7/D9. |
| Weakness queue | Up to six drills selected from PB/par, missing clears and staleness; next walks the queue. Toolbar entry is hidden (`2376`, `29301–29353`). | A recommendation tool feeding the same path/next-step service, not another learning mode. Personalized skill evidence could later improve it. |
| Targeted mistakes retry | A result can offer a 30-second unscored retry of missed/slow parts, prefilling other work; tutorial results do not offer it (`25504–25602`, `25910–25922`). | Useful in-context teaching/recovery. Keep its partial success distinct from a complete independent drill and avoid presenting it as another global mode. |
| Weekly gauntlet | Five-drill seeded implementation and result handling remain; entry button is retired (`2827–2839`, `29358`, `26171–26185`). | Dormant; no revival proposed. Check consumers before any later retirement. |
| Keyboard Tour / sandbox | Legacy Tour replay entry is hidden while `LEVEL1_LIVE=true`; sandbox is retired with flags/guards remaining (`33213–33218`, `33604–33664`). | Do not add a second beginner entry. Any useful teaching moves into the agreed lesson flow only after content review. |

The first review does not choose to delete any of these. Proposed design emphasis: one core
learning workspace, an explicit competitive attempt if D2 is accepted, and a small optional
practice/event area. Rapid-fire teaches a different skill shape; Daily supplies shared competition.
Dormant Marathon remains dormant. Rank, race links and
recommendations are not three additional curricula.

## Why earlier guidance conflicts

| Date/source | Status and conflict | Treatment in this review |
|---|---|---|
| July feedback / E9 | Mature drills should have meaningful depth, clear locations, visible consequences and real finished work. Later guidance says teach beginners gradually. | Preserve substance; do not apply full-page or 60–150-second quotas blindly to a first lesson. |
| July Depth Pass, checklist rule | Checklist text should state the required outcome/location rather than lectures or slogans. | Teaching belongs in the guide. This can coexist with September's integrated lessons. |
| September 3–4, E7 | Historical summary says “clock always runs, every run posts, hints stay free,” alongside no practice/ranked mode. Runtime excludes guests, mouse use and guided rails. | Do not repeat “every run posts” as current fact. Reopen competitive intent and assistance definitions. |
| September 4, continuity / PR #249 | Wolf chose automatic rank at level 10; the old account-level enter/leave ranked controls were removed. | Current baseline and a dated earlier decision, now subject to the explicitly reopened review. A future per-attempt action would be a new decision, not automatic restoration of those controls. |
| September 4–5, PR #250 / v5.1 plans | Proposed 61-drill catalog and extensive wave plans coexist with the active 74-drill catalog. | Planning artifacts only. No 61-drill target, silent acceptance rule or production wave is adopted here. |
| September 5–6, E8 | Branch adds two guided beginner drills and a lighter-first ramp; current next-step/catalog order remains inconsistent. | Candidate evidence for a future blueprint. Inspect individual ideas after the rules settle; preserve Foundations feedback and forward-only migration discipline. |
| September 5, branch `dev/REFINE_PHASE.md` at 1703b59 | Earlier branch plan scoped redesign to re-pacing the existing 74 drills, saying all would stay. September 17 explicitly prefers a future full catalog rebuild after planning. | The narrower branch plan is historical. Preserve useful learning evidence without treating its catalog-size freeze or instrumentation schedule as current instructions. |
| Current access configuration / E3 | Old comments say the level ladder is the game and drives PRO conversion. September 17 favors free exploration and recommended paths; exact advanced access remains open. | Decision D3 explicitly asks whether level/speed locks should survive. Paid access is settled separately. |
| September 17, E1/current request | Assisted learning counts, no XP; subscriptions at launch; no deadline; full redesign only after planning. | These govern this review over older comments, old prices and historical launch claims. |

## Decision order

The initial review put D1–D3 first: what the learner chooses and whether progress controls
access. Follow-ups now settle learning-first priority, the D3/D9 gate policy and the D4/D5
help/timer principles. Next clarify D1/D2 attempt mechanics, then remaining D6–D9 reward,
competition, credential and offer details. D10–D12 cover entry/resume, history transition and
special-session scope, using representative blueprints. History preservation is already mandatory;
only its detailed mapping remains open. Do not ask Wolf to decide prices, all 74 drills or
every reward threshold before the basic experience is defined.

### First three choices — asked September 17; updated after learning-first agreement

| ID | Current behavior / conflict | Options and tradeoffs | Lead recommendation | Wolf's confirmed choice |
|---|---|---|---|---|
| D1: relationship between lesson and drill | One main workspace with layered tools; only Navigation has the established staged entry. Separate lesson/tour frameworks and alternative branch tutorials cause naming overlap. E2/E4/E7/E8. | Exact-board retry (familiar, may reward recall); fresh variation of same task (transfer evidence, requires equivalent grading); separate assessment (clear separation, more content). | Shared skill/task pattern with fresh values/targets for independent work; keep replay and a personal drill speedrun. One exercise identity, distinct attempt evidence and comparable PBs. A fresh solve is not mastery by itself. | **Supported in principle September 18**, conditional on retaining key metrics and individual-drill speedrunning. Exact content/revision/comparison mechanics remain open. Earlier learning-first loop remains confirmed. |
| D2: competitive intent | Eligible classic runs post automatically; rank eligibility is automatic later. No practice/ranked switch. Request explicitly reopens this. E4/E5/E7. | Choose public scoring before start (clear intent, extra choice); publish eligible independent runs automatically (less friction, potential surprise); enter through a dedicated competition area (strong boundary, extra navigation). | Same workspace, distinct learning/private timed/public attempt purposes. Deliberate public intent before start; private drill speedruns still retain personal metrics. No always-visible global switch required. Public submission and private account saving are different actions. | **Supported in principle September 18**, conditional on retained metrics and drill speedrunning. Specific public entry/retry controls, posting/eligibility/rank and private-save mechanics remain open; no retired switch restored. |
| D3: paths and locks | Level/pace/chapter/PB/PRO rules gate later chapters; chapter-linked certificate tracks double as paths. Confirmed freely explored basics conflict with treating the ladder as universal access control. E3/E4. | **Recommendations only:** easy exploration but possible skill gaps. **Targeted prerequisites:** protects readiness with some friction. **Existing level/speed locks:** game-like climb but may require grinding. Subscription inclusion is a separate access test. | Apply the agreed light-gate policy; design the specific skill dependencies/checkpoints after help and outcome rules are clear. | **Confirmed September 18:** helped ordinary completion advances learning; major skill jumps use correct independent evidence, accepting earlier results or test-out; advanced subscription inclusion also applies. Speed/XP do not gate readiness. Exact lesson boundary, skill map and pass thresholds remain open. Supersedes bace206's tentative status and the original unrestricted-entitled-exploration proposal. |

### Subsequent choices — register, not another questionnaire

| ID | Current behavior / conflicting guidance | Options and tradeoffs | Lead recommendation / dependency | Wolf's confirmed choice |
|---|---|---|---|---|
| D4: assistance | F1 hints remain eligible; guided rails exclude normal XP/PB/upload; baseline directions differ from solution help. “Hints stay free” is ambiguous between price and score. | Count all instructions as help (punitive); count explicit solution help (clear boundary); allow all hints competitively (easy entry, weaker independent claim). | Apply the approved distinction to each actual hint/control. Explain consequences before solution help; keep ordinary directions usable. Define fresh independent retry after viewing a solution. Depends on D1/D2. | **Confirmed September 18:** ordinary instructions/explanations unpenalized; revealing solution steps, Guided help and solution replay make the attempt assisted (learning progress, no XP). Exact control mapping and independent-retry boundaries remain open. Replaces blanket score-free solution hints, not access to teaching. |
| D5: timing and retries | First-key gate, running clocks, pars, speed bands and some pass targets coexist. Pausing and special sessions differ. Untimed Foundations was an earlier option. | Visible stopwatch throughout (motivating/stressful); optional personal time while learning; enforced competitive clock with explicit start. Unlimited practice vs limited scored attempts affects fairness. | Apply optional lesson timing without treating it as competitive entry. Separately agree competitive start, planning time, pauses, retries and seeds. Unlimited learning retries remain a proposal; competitive retry policy is D7. | **Confirmed September 18:** lesson clock hidden unless enabled; deliberate speed attempts show timing; no speed/XP readiness gate. Exact timer start/pause/retry and competition rules remain pending. Replaces the always-visible teaching-clock direction. |
| D6: progress, mastery and rewards | Completion, clean PB, speed, XP, optional stars, streaks and milestones overlap; assisted state is largely local. | One combined score (simple but misleading) or distinct learning/independent/speed evidence (clearer, requires readable presentation). Repeat solves can earn diminishing XP or XP can focus on new competencies. | Retain learning progress and private performance history/PBs as separate, useful metrics; distinguish assistance and comparable times. Results explain outcome/save/next step. Propose repeat/transfer evidence for mastery, rather than one fast clear. | Preserve key user metrics and personal drill speedrunning explicitly required September 18; no assisted XP and earned-history preservation already confirmed. Exact metric set/formulas, mastery/XP/achievements remain pending. |
| D7: public competition and account rank | Best-time boards feed relative rank after automatic eligibility and five placements. Daily/session comparisons differ. DATA-04/06/07 limit completeness/trust. | Curated benchmarks/Daily events (stable comparison, less variety); whole-catalog boards (breadth, curriculum/version coupling); private PBs only initially (simple, public competition deferred). Later decide best-of/limited attempts, seeds, comparison pools and rank entry. | Use selected public benchmarks/events while preserving personal drill speedruns beyond that set. Propose common access/rules and comparable versions. Any overall rating should not reward extra paid-only counted boards. Unlimited practice/best eligible standard score remain proposals. Saved-progress/Security own delivery. | **Confirmed September 18:** selected standardized public benchmarks and Daily events, alongside personal bests and retained drill-speedrun options. Level-10 entry, placement set, rank model/display, access/retries/integrity and old-board transition remain open. D1/D2 supported in principle with metrics conditions. |
| D8: certificates | Three chapter-derived lists of qualifying runs; no pace gate or distinct assessment. Old interest in speed recognition overlaps skill credentials. | Completion certificate (low friction, weaker claim), independent skill assessment (stronger evidence, extra work), speed credential (narrower purpose). | Skill-path certificates based on independent, varied competence; separate speed badges. Guided progress prepares for assessment. Preserve existing issued certificates as earned historical credentials, with their original standard identified. Depends on D4/D6/D7; trust needs DATA-07 work. | Interest in shareable credentials carried forward; exact standards, attempts and paid eligibility **pending**. |
| D9: guest/account/free/paid | Guest local practice; permanent account for normal uploads; free-for-now flags plus progression locks; desk creation has a real entitlement check. Old price/PRO copy conflicts. | Free Foundations only vs broader free basics/samples; free or paid timed practice/credentials; account before start vs after first result. | Let a guest complete a useful beginner exercise; explain saving at the result and offer an account. Keep useful basics and replay in the candidate free offer; specify the advanced subscription boundary deliberately. Access must be independent of menu position and rank. Depends on D1–D8; Payments owns eventual authoritative rules. | Subscriptions at launch and the advanced subscription/readiness policy **confirmed September 18**. Exact included lessons, package, prices, trials, desks, competitive/certificate inclusions and guest-history transfer remain **pending**. |
| D10: entry and next step | Fresh device starts Navigation; resume/direct links and several special-session entries exist. Navigation's nextKey is autofit while chapter order next is filldr. Tutorial skip leaves Foundations. No established personalized assessment. | Start with short teaching then personalize; questionnaire first; assessment-first for everyone. | A quick guided success by default, obvious experienced-user shortcut, editable recommendations. Use one next-step resolver across result, path and resume. Returning learner sees last work plus one reasoned suggestion. Placement is optional competitive setup, not a compulsory beginner diagnostic. Depends on D1/D3/D9. | Customized starting points **confirmed**; exact questions/default/assessment **pending**. |
| D11: versioning/history | Results use drill keys; requirements often derive from today's catalog; some earned rewards already latch. Reusing a key could mix different work. | Reinterpret old records (simple but unfair); version requirements/content and retain evidence (more bookkeeping, preserves meaning). | Stable exercise identity plus scored revisions; version paths, credential requirements and competitive rules. Preserve old attempts, awards and certificates; separate incomparable boards. Explicit equivalence decisions determine whether old work satisfies a new requirement. Depends on final rules and content blueprints. | Preservation/no reset **confirmed**; migration/equivalence method **pending**. |
| D12: special-session scope | Classic, Rapid-fire and Daily serve different activities; race links and placement add contexts. Marathon, weekly and Tour implementations have no current ordinary entry. | Equal prominence for available modes (choice/complexity); core learning plus optional practice/events (clear entry); core only initially (simpler but loses useful variety). | Core learning first; selected public benchmarks/Daily events now agreed. Rapid-fire remains an optional-practice proposal; keep dormant systems dormant, race/placement as contexts and weakness queue as recommendations pending detailed choices. No code removal/revival. | **Daily/benchmark public focus confirmed September 18.** Other mode roles, prominence and mechanics remain pending. |

## Proposed journeys to test the choices

These illustrate the proposed complete journey, combining the approved principles above with
still-pending mechanics. They are **not a claim about current behavior or full feature approval**.

1. **Complete beginner, guest.** Starts a short movement-and-copy lesson with visible location
   cues. Opens a step hint, finishes the worksheet and sees “Completed with help — learning
   progress earned; no XP.” Next actions are continue learning or try independently. Saving
   explains what is local and what an account would retain. No automatic competitive entry.
2. **Experienced learner.** Chooses a relevant formulas/model path or skips to an exercise
   included in their access. Gets prerequisite advice without grinding XP; at a major advanced
   jump, prior independent evidence or a short test-out can establish readiness. Can try independently
   or start a scored attempt after seeing its rules. An unfinished diagnostic does not erase
   existing skills/history or block all learning.
3. **Returning learner improving a skill.** Finds the previous lesson and its helped completion.
   Solves a fresh variant independently, retaining the original learning record. Results explain
   the new evidence, XP eligibility and save status. Offers one relevant next lesson and a retry;
   a service failure says pending/unavailable rather than “saved” or “no history.”
4. **Competitor.** Chooses a scored attempt with a defined board/version, clock and help rules.
   Uses an alternative legitimate keyboard route and receives credit for the correct outcome.
   Opening solution help ends competitive eligibility with an explanation, while allowing
   learning to continue. Competitive rank uses eligible results, not helped completions.
5. **Returning certificate holder after a path change.** A path gains a new practice drill.
   Their old runs, earned XP/awards and issued certificate remain visible. The new requirement
   is shown as part of a newer path/certificate version; it does not retroactively revoke the
   old credential or mix old and new speed records.

Preserve Foundations substance in all examples: playful movement and visible checkpoints,
meaningful copy/paste ending at home, clear locations, varied fills, useful Paste Special
dialogs, visible changes in one coherent worksheet, and models that actually work. Grade
legitimate outcomes/routes; require a particular method only when that method is the skill.
Do not reintroduce rare formatting operations as core work merely because an old spec lists them.

## Smallest separation to plan before a rebuild

The following are conceptual responsibilities, not a new framework or approved implementation:

| Responsibility | Owns | Must not silently control |
|---|---|---|
| Exercise definition | Stable identity, revision, skills/prerequisites, board, objectives, help and grading | Paid access or account rank because of its menu folder |
| Path definition | Named/versioned recommendations, order and next-step reasons referencing exercises | Exercise identity, existing results or certificate standards |
| Attempt rules/result | Purpose, assistance, timing, completion evidence, rule/content version and save identity | A claim that every completion is ranked or mastered |
| Learning history | Helped/independent work and durable learner evidence | Public score eligibility by mere existence |
| Rewards and credentials | Explicit versioned rules; earned-state history | Recompute old awards away when a path is reordered |
| Access | Account and subscription entitlements mapped deliberately to the offer | XP grind, menu position or a certificate chapter name |
| Competition | Eligible attempts and comparable boards/rating | Beginner teaching sequence or general learning completion |

**Worked path-change example:** Learner A has helped completion of Navigation, an independent
Fill Down/Right result and an earned fluency certificate under its original requirements.
Path v2 moves Fill Down/Right later and adds a preliminary typing lesson. Reordering changes
the next recommendation only. The same exercise in two paths points to one underlying history;
it earns no duplicate XP. New content is a new requirement, not an erased old result. A material
timed revision creates a separate comparison group; equivalence for learning credit is explicit.
The certificate remains earned under its issuance standard. Whether older work satisfies any
new certificate must be agreed before migration. Nothing in this example authorizes a data move.

## Verification, limits and ownership

- Fresh remote references verified foundation 79e4d93 and accepted integration 00df57a.
  A later remote CURRENT read still names 00df57a as the accepted next-area baseline.
- Reused existing audits and accepted integration/browser evidence. No security re-audit,
  production data query, new browser playtest or database test was run in this review.
- Focused read-only agent traced current flow/modes. Independent review found three wording
  errors: Marathon reachability, Rapid-fire duration differences, and active Tracks versus its
  retired campaign branding. All are corrected above. Lead also corrected the Daily free-now
  eligibility nuance. Reviewer confirmed the main help/rank/access/certificate distinctions
  and pending-choice boundaries; no runtime test or exhaustive line audit is implied.
- Documentation-only validation: all 17 relative Markdown links resolve; the staged manifest
  contains only this added handoff; `git diff --cached --check` passed. `npm run check` and browser suites are **not rerun** under the
  TASK_GUIDE documentation exception; prior passes are not relabeled as new tests.
- Existing EXP-01/03/04, DATA-04/06/07 and ENGINE_CONTENT learning/grader findings remain open
  with UI, Saved-progress, Security and Engine. This task describes product consequences only.
- Current source inspections do not prove real-user comprehension, multi-device continuity,
  production rankings, fair scoring, supported keyboard parity or subscription readiness.
- Publication requires committing/pushing this file and checking the remote commit/file identity.
  Its own final commit SHA is supplied by Git history and the chief message, not invented here.
- September 17 decision follow-up: refreshed remote guidance through 45faa42 and checked this
  update against Wolf's explicit answers. Changed only this handoff; document diff/whitespace
  and relative links checked. No new source investigation or application tests were needed.
- September 18 decision follow-up: refreshed guidance through 132bb0a and retained the valid
  00df source review as instructed by the chief. Checked the explicit gate approval and kept
  the subsequently answered help/timer choices distinct from remaining open mechanics.
  Sole handoff diff, links and whitespace checked;
  no new application tests or agent investigation needed for this documentation update.
- September 18 next-options checkpoint: read the chief's foundation reconciliation at 62c15db,
  which incorporates this branch's prior b5c5c7a gate/help/timer approvals into shared guidance.
  Reused the bounded reviewer for product-tradeoff critique; no source/test rerun. Checked
  the handoff-only diff, links and whitespace; recorded the third answer (competitive scope)
  without assuming answers to the first two (retry format and public entry).
- Subsequent September 18 clarification: refreshed chief reconciliation through 44d0ebd. Recorded Wolf's
  qualified support for D1/D2 and explicit metrics/drill-speedrun conditions, separating the
  recommended metric set/save examples from approved requirements. Sole handoff update; no
  fresh audit/agent/test work needed. Documentation links and whitespace checked.
- September 18 metrics/reward packet: read remote PRODUCT/CURRENT at b8b8ca0, retained the
  accepted source review and developed fictional results plus three bounded questions.
  Reused the reviewer for a narrow product-ambiguity check only. All new reward/rank options
  remain pending; sole handoff diff, all 17 relative links and whitespace checked.

## Proposed updates for the chief

**CURRENT proposal:** this dedicated review stays on `codex/catalog-flow-review` from
00df57a, owning only this handoff. Chief has reconciled b5c5c7a's learning/gate/help/timer
approvals in foundation 62c15db, benchmark scope in 44d0ebd and qualified D1/D2 support/metrics
requirements in b8b8ca0. Exact D1/D2 mechanics and
content/access boundaries remain open.
The newer accepted 16ee830 is for future implementation work; no rebase needed here.
Wolf selected curated benchmarks/Daily events, then supported fresh variation and deliberate
public entry in principle, provided key metrics and drill speedrunning remain. Exact mechanics
still need design; demonstrate those conditions instead of repeating the broad choice questions.
No catalog/progression extraction or new rule implementation has started. Existing security
and testing owners continue their separate scopes; no new module has been dispatched.

**PRODUCT proposal:** retain selected public benchmarks/Daily events, and add the subsequent
D1/D2 support in principle with explicit retention of key metrics and individual-drill speedruns.
Personal speedruns are not confined to public benchmarks. Private saving/statistics must be
distinguished from score publication; exact metric sets/comparison groups are proposals. Preserve
old results/earned history. Keep benchmark access, seeds/retries, rank, old-board transition and
concrete D1/D2 controls open. The earlier fully-unanswered D1/D2 status is now superseded by this
qualified response, not by approval of all detailed mechanics.
Preserve the learning/gate/help/timer and benchmark approvals already reconciled through 44d0ebd and Wolf's requested
discussion style: concise high-level mechanics options with a reasoned recommendation.
Product approval does not authorize implementation.

**Next bounded turn:** show a compact example of learning progress, private drill-speedrun
metrics and public benchmark results together (now presented), then record the answers to
D6a mastery, D6b XP and D7a account rank. All three new choices are pending. Retain qualified
D1/D2 support and its metrics/speedrun conditions; keep
comparison/persistence details explicit without starting implementation.
Do not reopen the approved gate, assistance or optional-timer policies.
A complete skill map,
access/credential/competition rules, history policy and representative blueprints still precede
any catalog rebuild. This handoff is an evidence checkpoint, not the final approved design.
