# Catalog, modes and learner-flow decision review

Updated: 2026-09-18 (Europe/Berlin)
Task: `01a0b148-2693-7901-af91-934c83cabe1d`
Chief: `01a0b0fa-d857-7002-ab95-1da0a1cfb858`
Branch: `codex/catalog-flow-review`
Starting commit: `00df57afd8d3299cc7feaf523847b9ca43e54d06`
Latest shared guidance checked: `codex/repository-foundation` at `b8b8ca0d6f783fa5396dd39f29fadb9e56a8d147`.
Subsequent remote PRODUCT/CURRENT checks are described in the dated follow-ups below.
Initial evidence review used guidance at `79e4d93f8bc1fe486a734e58daedd892fbb13544`.
Chief follow-up: guidance `0ae29b1c7dfeee3c2551ce52352a65241a979c74` adds concise user-facing
communication and chief ownership of platform-wide design discussion; this review supplies proposals.
State: learning-first direction, light prerequisite/subscription gates, optional lesson timing
and the instruction-versus-solution-assistance distinction confirmed. Public competition
focuses on selected benchmarks/Daily events. Fresh independent variations and deliberate public
entry are supported in principle, conditional on retaining key user metrics and individual-drill
speedrunning. Exact metrics/comparison rules, mechanics and access boundaries remain open.
Visible progression is now confirmed as one XP level, learning completion/independent status,
personal speedrun records and optional challenge leaderboards. New mastery and overall
competitive-rank systems are deferred, with existing earned progress/rank history preserved.
First visit now begins with a guest lesson, followed by personalization and an invitation to
save. A useful beginner path with repeat practice/personal speedruns and some advanced previews
is free; advanced learning is subscription curriculum. Exact inclusion/save rules remain open.
Account history now includes finished attempts and lightweight restarted/ended-unfinished
summaries; details are private with selected public highlights. Active practice time/days and
an optional non-gating streak are approved. Exact metric definitions and legacy treatment remain open.
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

**Historical packet: three questions presented, none individually approved.** Wolf subsequently
questioned the number of systems and approved the simpler structure recorded below instead.
The chief reconciled the
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

**Status at 01e2bed:** D6a pending; D6b pending; D7a pending. The questions were presented as a
three-item group; the follow-up below replaces it with the approved simpler structure.
Silence is not approval of the recommendations or their supporting details.

### September 18: simpler visible progression structure approved

**Source:** Wolf asked, “Is that too many systems?” This is a challenge to the proposed
complexity, not approval of either the three-system model or a specific replacement.
After the revised recommendation below, he explicitly answered “Yes, use this simpler
structure (recommended)” to the single question about one XP level, lesson completion/
independent progress, personal speedrun records and optional challenge leaderboards,
deferring a new mastery system and overall rank while preserving earned progress/rank history.

**Revised lead recommendation, now approved:** three separate ladders would be too much for the
learning-first direction. Retain one visible account level from XP; show ordinary lesson
progress as completed with help or completed independently; keep times, personal bests and
improvement records in deliberate drill speedruns. Selected benchmark/Daily leaderboards
supply optional competition. Defer a new mastery system and a redesigned overall competitive
rank until either has a clear purpose beyond these existing records.

This preserves useful measurements while reducing the number of statuses and goals users
must understand. Tradeoff: fewer broad skill credentials and less aggregate competitive
identity initially. A separate mastery label could return if needed for an agreed purpose;
an overall rank could return if individual boards prove insufficient. Neither is required
to preserve skill evidence, short readiness checks or personal speedrunning.

**Single choice presented:** (1) this simpler structure (recommended); (2) retain
mastery but defer overall competitive rank; (3) retain all three with competition less prominent.
**Wolf selected option 1.** This replaces the lead's initial recommendation to introduce
separate mastery and benchmark-rank systems. The earlier three-part reward questionnaire is
retired: D6a new mastery and D7a a new overall rank are deferred; D6b exact XP/repeat mechanics
remain open. Selecting one XP level does not approve the earlier diminishing-repeat formula.

**Boundaries:** helped completion still advances ordinary learning and earns no XP. Major
readiness checks remain based on independent correctness, with prior evidence/test-out.
XP level is not proof of skill or an access requirement. Existing XP, awards, personal results
and rank history remain protected; deferring a replacement rank does not authorize deleting
the current system or freezing/recalculating earned values. The eventual transition/presentation
of current rank remains a separate plan. The decision does not authorize application changes.
Certificates/achievements are still unresolved;
do not infer their removal or approve a new credential system from this simplification.

**Example:** the learner's next lesson and completion status lead the experience; account XP
offers a single continuing reward. A drill's speedrun results show PB and improvement when
relevant. Entering a benchmark shows that challenge's board position, without requiring a
mastery tier or a second account ladder. This illustrates the agreed structure; exact UI,
metric formulas, attempt eligibility and save rules still require design and authorization.

### September 18: remaining planning sequence and first-visit/access choices

**Source:** after approving the simpler structure, Wolf asked, “Awesome - what else do we
have to plan”. The following is the lead's proposed decision order, not permission to start
implementation or reopen the agreed learning/gate/help/timer/progression choices.

| Order | Planning outcome | Dependency / completion condition |
|---|---|---|
| 1. Entry and access | First-visit default, experienced shortcut, guest/account saving journey and useful free versus subscription offer | Select the experience and access principles before exact launch lesson membership or prices. Existing advanced subscription/readiness direction holds. |
| 2. Learning journey | Personalized starting points, skill prerequisites, readiness checks, lesson/retry/next-step behavior | Use the access principles and retained Foundations feedback; settle which skills need checks before assigning a rebuilt lesson sequence. |
| 3. Results and rewards | Completion/help/independent records, saved history, comparable PBs, independent-retry eligibility and XP/repeat rules | Define the record users expect before the Saved-progress owner designs delivery. Keep one XP level; no new mastery ladder. |
| 4. Competition rules | Benchmark/Daily entry, timing, planning/pauses, help, retries, seeds and fair comparison | Use the agreed optional scope and preserved private drill speedruns. Fairness depends on common task/rules/access; no new overall rank. |
| 5. Launch scope | Decide Rapid-fire's role and which achievements/certificates belong in the initial experience | Tie each to a clear learner purpose and agreed evidence; do not revive dormant modes or add overlapping reward systems by default. |
| 6. Catalog blueprint and transition | Skill map, representative lesson/drill examples, free/paid/checkpoint placements and progress-preserving transition | Synthesize the preceding choices into a complete agreed rebuild plan. Retain earned history and Foundations feedback; content authoring/rebuild still needs separate authorization. |

The order is for decisions, not six newly assigned workstreams. Timing/record choices inform
competition; credential requirements inform final content coverage; the final blueprint tests
the whole journey. Exact thresholds, XP amounts and prices can follow their parent choices.
The chief continues to own cross-area delivery priorities and shared-document integration.

**Two recommendations presented and approved:**

1. **D10 first visit. Recommendation:** a short hands-on lesson without requiring an account,
   followed by personalization and an invitation to save progress. Experienced users get a
   clear shortcut to choose a starting point. This lets users experience the product before
   signup, but requires truthful local/save status and a deliberate guest-to-account transfer
   plan. Alternatives: brief personalization before the lesson (better initial matching, more
   steps before trying); account creation and personalization first (simpler durable identity,
   highest entry friction). The exact questions, guest transfer/save mechanics and UI remain open.
2. **D9 free/paid boundary. Recommendation:** a complete useful beginner path, repeat practice
   and personal speedruns free, with a few advanced previews; advanced lessons and model-building
   courses require a subscription. This gives free learners a worthwhile outcome and a clear
   paid expansion, while requiring more free content than a small sampler. Alternative: a
   smaller free introduction with most structured learning paid (earlier paywall and a shorter
   free teaching experience). Freely explorable basic drills remain a carried-forward constraint
   in either case. Exact lesson membership, preview limits, advanced speedrun access, benchmark/
   Daily access, certificates, price, trial and subscription-expiry rules are not selected here.
   “Beginner” is a skill scope to design, not an automatic promise that every current Foundations
   chapter drill is included. Useful real spreadsheet tasks also belong in beginner learning;
   only advanced model-building is proposed as subscription curriculum.

**Explicit September 18 answers:** Wolf selected “Try a lesson first (recommended)” for D10
and “Useful beginner path free; advanced learning paid (recommended)” for D9. This approves
the stated principles: begin with a short lesson without an account, then personalization and
an invitation to save; provide an experienced-user shortcut. Offer a complete useful free
beginner path with repeat practice/personal speedruns and a few advanced previews, with
advanced lessons and model-building courses in the subscription. Exact content and prices
remain open. The free replay/speedrun promise here applies to included free content; do not
infer that all advanced drills become freely speedrunnable.

**Acceptance examples:** a new visitor can finish a useful beginner lesson before creating an
account, then receives an invitation to save and personalize their starting point. An experienced
visitor can choose a suitable starting point subject to the agreed readiness/access rules. A
free learner can complete the beginner path and return to its practice/speedruns. A learner can
preview selected advanced material; continued access to paid advanced curriculum requires a
subscription and, at major skill jumps, qualifying readiness. An account prompt must accurately
explain local versus durable progress; guest transfer/save timing still needs a contract.

**Supersedes:** D10's unanswered first-visit default and D9's broad free/paid boundary question.
It does not select exact lessons/previews, price/trial, credential or competition access, an
expiry policy, onboarding questions, guest-data migration or a full first-visit UI. Existing
runtime access remains unchanged. Subscriptions at launch remain required and billing remains
inactive. No Payments, Saved-progress, UI/UX or Catalog implementation work is assigned.

### September 18: account records and metrics specification — three principles approved

**Source and scope:** Wolf added, “Think we should also decide on all of the stats and tracking
metrics user accounts will have to retain”. Account records are now an explicit planning
deliverable before the catalog rebuild, rather than a detail to leave to implementation.
The metric/retention choices below are proposals unless already covered by an earlier approval.
This defines the product contract for Saved-progress; it does not start its implementation,
create a schema, collect new tracking data or repeat the security/database audit.

**Design principle:** retain enough meaningful evidence to explain progress and improvement;
show a compact overview with details available. A record being private must not prevent it
from contributing to personal history. More complete records do not require more reward systems.
Distinguish a retained event/result from a calculated metric and from permission to display it.

#### Proposed retained account records

| Record group | What the account should remember | Purpose / unresolved boundary |
|---|---|---|
| Profile and learning preferences | Account start date, selected display identity/avatar, learning goals and self-reported starting point, keyboard/platform setup, timer preference, activity-day timezone and visibility selections | Personalization and consistent presentation. Self-reported experience is not assessed ability. Existing profile/identity assets stay protected; exact onboarding fields are still open. |
| Lesson/exercise progress | Stable exercise identity and revision; first/latest completion dates; helped and independent evidence kept separately; last lesson/step for return; path membership/version when relevant | Continuing learning without losing prior work. Retaining a resume pointer does not approve full workbook draft autosave. One exercise appearing in two paths is not two new accomplishments. |
| Readiness evidence | Skill/prerequisite assessed, qualifying independent result or test-out, date and requirement version | Explain an advanced unlock using the approved correctness-based policy. This is supporting evidence, not a new mastery score. Exact equivalences/pass rules remain open. |
| Attempt history | Stable attempt identity, exercise/task/rule revision and variant, purpose/mode, start/end dates, finished/restarted/ended-unfinished outcome, assistance category and relevant input/rule flags | Make all useful learning/private/competitive attempts distinguishable and avoid counting a retried save twice. Unfinished-summary retention is a current question; detailed keystroke replay is not approved. A mouse route is not automatically solution assistance; input restrictions must follow the task's stated rules. |
| Time and activity evidence | Timed-run duration when applicable; separately measured active practice duration; dates needed for activity summaries | A speedrun clock and active learning time measure different things. Hidden lesson-clock display does not make active practice time a competitive result. Idle/background exclusion, pauses, overlapping devices and timing start remain definitions to agree. |
| Performance details | Completion/objective result; countable actions/keystrokes when meaningful; comparable timing; any clearly defined mode-specific hits/misses | Explain the actual task result and improvement. Store a metric only when its measurement is defined; no assumption that every correction, Backspace or alternative route is an error. Raw action streams/full workbook snapshots are separate decisions. |
| Retained mode/keyboard history | Existing session results and known aggregate key/chord/function totals, with their original counting scope | Preserve currently useful records pending an explicit disposition. Future Rapid-fire metrics depend on its retained role; aggregate shortcut use is not mastery, and no broader raw keystroke capture is authorized. |
| Competition results | Challenge/event identity, board/rule revision, attempt evidence, eligibility state/reason, publication choice, submitted result and any dated final event placing | Preserve what was entered and under which standard. A changing live leaderboard position is not a permanent earned placing; Daily and benchmark retry/seed policies remain open. Private/ineligible attempts can remain personal history without public scoring. |
| XP and earned rewards | XP award amount, reason, originating accomplishment/attempt, date and award-rule version; earned achievements and original requirements | Explain totals, exclude duplicate awards and preserve past earnings when catalog/rules change. One XP level only. Assisted XP stays zero; exact independent/repeat XP formulas remain open. |
| Certificates and historical rank | Issued certificate/standard/date and existing earned rank/result history with its original meaning | Preserve earned evidence. This does not introduce a new certificate standard, mastery tier or overall rank; current-to-future rank presentation remains a separate choice. |
| Saving and continuity | Which attempt/progress/reward records were saved, pending or need a retry; their guest/account origin and reconciliation status | Truthful save messages, cross-device continuity and no duplicate totals. Exact guest transfer, ownership and offline behavior belong to the later Saved-progress contract. |

Subscription/access state remains a separate Payments-owned account responsibility; it must
not become the source of learning history. Existing desk membership/assignments are likewise
not a new personal proficiency metric or automatic permission to expose private learning
records. This proposal changes neither area. Account exports/deletion controls and any archive
or retention limits need an explicit later policy; no purge, expiry of earned progress or
unlimited raw-replay promise is proposed here.

#### Proposed user-visible metrics and definitions

| Metric/view | Proposed meaning and display | Avoid misleading interpretation |
|---|---|---|
| Lessons completed | Unique completed lessons/exercises, with helped versus independent status; both can remain in attempt history | Counts of attempts and distinct lessons are different. Later independent work strengthens the status without deleting earlier helped work. |
| Path progress | Completed eligible requirements / applicable requirements of a stated path version, plus suggested next lesson | Reordering must not erase completion. A revised path may add future work without revoking old awards; the transition must be explained. |
| Readiness | Requirement met, or specific preparation still needed, linked to qualifying evidence | No extra mastery ladder and no speed/XP prerequisite. A failed or unfinished check does not erase learning. |
| Attempt counts/history | Completed attempts separated from restarted/ended-unfinished summaries, filterable by exercise, date, purpose and assistance | A restart is not automatically a skill failure. Network retries must not increase counts. Unknown legacy fields must not become zero or independent by default. |
| Personal best and improvement | Best qualifying time for the same comparable challenge/rules; date achieved and improvement versus a stated comparable earlier result | Keep old comparison groups accessible when work/rules materially change. Assisted time can be feedback but is not silently an independent PB. |
| Recent performance | Recent comparable attempt times; a median/trend only when there are enough comparable samples, with the period/sample size stated | No global average speed across unrelated drills or arbitrary random variants. Do not substitute partial history for a lifetime statistic. |
| Keystrokes/actions | Per-attempt count and change across comparable attempts when the counting rule is meaningful | Modifier keys, shortcut actions, typed characters and edits need explicit definitions. A shorter authored solution is not automatically the only legitimate route. |
| Outcome/accuracy feedback | Correct objective/checkpoint outcomes; mode-specific hit accuracy only where successes and opportunities are defined | Defer a general account-wide accuracy/efficiency percentage. Spreadsheet editing and legitimate alternate routes do not have one reliable error denominator. |
| Practice activity | Active practice time and days practiced; helped work counts as practice too | Exclude idle/background time under an agreed rule. No credit duplication across retries/devices; missing historic active time stays unknown rather than estimated as fact. |
| Streaks, if selected | Current/best activity streak as optional motivation under an explicit day/timezone rule | No lesson gate, XP multiplier or earned-progress loss is approved by a streak display. Exact day qualification and timezone changes remain open. |
| XP and level | Existing earned XP plus future awards under their stated rules; level derived from the agreed XP schedule | No independent mastery/rank claim. New formulas must not silently recalculate away earlier awards. |
| Achievements/certificates | Earned items, dates and applicable standards, with existing identity/showcase use preserved | Keep old awards when requirements change; do not imply accreditation or a newly agreed assessment standard. |
| Public challenge performance | Eligible benchmark/Daily result and the relevant board position; dated final placing if actually established | Different events/revisions are distinct. Publication/visibility needs the agreed choice; no new aggregate competitive rank. |

**Additional existing metrics requiring an explicit disposition:**

| Current metric | Source meaning | Lead recommendation, not yet approved |
|---|---|---|
| Accuracy / average keys versus optimal | Mean of authored optimal-key count divided by actual keys, capped per run; labels differ between profile and stats | Do not call it correctness accuracy. Preserve the underlying known counts; show route comparison only where the reference and valid alternatives make it useful. |
| Time on grid | Sum of posted successful-run durations, excluding unposted helped/mouse attempts and mode-session time | Keep historical scope explicit. Future active practice time is a different measure; do not relabel this incomplete total as all practice time. |
| Time banked | Sum of per-drill first recorded time minus personal best | If retained, call it recorded drill improvement and state the comparison scope. It is not measured workplace time saved. Never pool materially different boards/rules. |
| Key totals, most-used chords/functions and shortcut diversity | Mix of saved aggregates, local completion counts and a recent trace sample | Preserve existing records; detailed private view is a candidate. State lifetime versus sampled scope. Using a shortcut once is not proof of proficiency; no new raw input collection is implied. |
| Keys per minute/second and pace graphs | Posted-run key rate or time relative to authored par, sometimes a recent subset | Optional speed detail for comparable tasks; not an overall learning score. Preserve meaningful history without requiring these on the main account overview. |
| Speed bands, crowns, podiums and top-10 counts | Mix of par-based bands and changing public standings | Keep earned awards distinct from current competitive position. Optional challenge details; no reintroduced overall rank or speed-based learning gate. |
| Achievement rarity/progress and rank high-water values | Mix of live derivations, local/synced earned flags and best-ever values for identity rewards | Classify each as current statistic, earned-once item or display choice before migration. Preserve earned items even when live standings or catalog requirements change. |

**Candidate compact overview:** continue learning, lesson/path progress, XP level, recent
activity if chosen and a recent PB. Full attempt history, per-drill performance and public
challenge results belong in details. This is a presentation recommendation, not an approved
new dashboard or a requirement to show every metric on each result screen.

#### Three choices presented and approved

1. **History depth:** recommend every finished attempt, including helped learning and private
   speedruns, plus lightweight summaries of deliberately restarted or ended-unfinished attempts.
   This supports honest practice/improvement history; it needs clear attempt boundaries and more
   storage than milestones alone. Alternatives: finished attempts only (simpler, less context
   for practice effort), or progress milestones/PBs only (smallest record, loses useful history).
   Background exits and exact interruption/resume handling remain open; no replay capture is selected.
2. **Visibility:** recommend private detailed learning/practice history with explicitly selected
   public summary highlights; deliberate public challenges publish eligible results under their
   stated rules. Alternative: private learning with performance summaries public by default
   (easier sharing, less individual control). This concerns future defaults; existing public
   results are not silently removed or relabelled. Desk-sharing permissions remain separate.
3. **Habit stats:** recommend active practice time and practice days, with an optional streak
   display that never gates lessons or removes earned progress. Alternatives: time/days without
   streaks, or omit habit stats and focus on learning/performance. The benefit is visible effort;
   the cost is measurement/idle/timezone complexity and possible pressure from streaks.

**Explicit September 18 answers:** Wolf selected “Finished attempts plus unfinished summaries
(recommended)”, “Private history; selected public highlights (recommended)” and “Practice
time/days; optional streak display (recommended)”. These approve the three stated principles:

- Retain every finished attempt, including helped lessons and private speedruns, plus
  lightweight summaries of attempts deliberately restarted or ended unfinished.
- Detailed learning/practice history is private; users deliberately choose summary highlights
  to showcase. Public challenge entry separately publishes its eligible result under stated rules.
- Include active practice time and practice days, with an optional streak display that never
  gates lessons or removes earned progress.

**Approval limits:** the full proposed record/metric tables are not blanket-approved by those
answers. Exact formulas, fields, idle/day rules, archive/retention limits, detailed replay
capture, interrupted-session behavior and legacy-record transition still need definition.
Earlier preservation, no-assisted-XP and simpler-progression decisions remain in force.
The optional streak display does not select current freeze rules, XP multipliers or penalties.

**Recommended interpretation for implementation planning:** unfinished summaries should contain
only enough to explain practice effort (exercise, date, duration when reliable, purpose,
assistance where known and end reason), not full performance/replay data. Removing a showcased
highlight changes its public display, not the underlying personal record; private summaries
must not reveal the private attempt log. Older runs without reliable assistance evidence stay
“assistance unknown”; retain already-earned XP/PBs/awards/certificates/rank history without
retrospective helped/independent labels. Any use of old results for new readiness requirements
needs an explicit equivalence rule rather than assuming missing help data proves independence.
These clarify the proposed contract; exact field/migration controls remain open.

**Product acceptance examples to refine:** helped completion remains visible on another device
without XP; a private speedrun still improves its comparable personal PB; retrying a save
creates one attempt/award; a changed lesson keeps older comparable records and earned rewards;
a failed history load is shown as unavailable rather than zero progress; profile highlights
do not expose the underlying private attempt log. Incomplete old data must be labelled honestly.

**Existing evidence reused:** DATA-04 concerns incomplete reads/inconsistent score filtering;
DATA-06 concerns duplicate save retries inflating counts/XP; DATA-07 limits score trust. EXP-01
and EXP-03 cover misleading saved/empty states. These are dependencies for eventual delivery,
not fixes performed here. Saved-progress owns retention/query/retry/sync implementation,
Security owns privacy/integrity enforcement, Engine owns meaningful grading/measurements,
UI owns clear presentation and Payments owns access. Coordinate through the chief; no new
module or parallel implementation is dispatched by this plan.

**Targeted source inventory (00df57a runtime; documentation-only changes since):**
- Normal posted run fields include time, keystrokes, authored optimal count, input flag and
  trace; Guided/mouse-used completions are excluded from normal posting (`index.html:34496–34515`).
  Mode sessions retain duration, score, misses and keys (`34519–34534`). This does not establish
  a durable log of all helped, unfinished or independent attempts under the new definitions.
- Every normal completion also writes a device ledger capped at 400 entries, including helped
  work; device PBs, traces/splits, bands and some rewards are separate local records
  (`index.html:25647–25675`, `25712–25729`, `34256–34300`). Local history is not a cross-device promise.
- Profile “accuracy” is the capped optimal/actual-keys ratio (`profile.html:361–364`, `488–504`;
  `stats.html:289–294`, `374–377`). Time banked uses first recorded versus best time
  (`stats.html:357–377`); time on grid and keyboard summaries have different input scopes
  (`stats.html:693–753`). The candidate names/definitions above deliberately distinguish them.
- XP is recomputed from posted runs/sessions and competitive standings, with a separate local
  estimate/high-water display (`themes.js:701–759`; `index.html:31255–31289`). Streak advances
  on normal completed drills, includes a freeze mechanic and is synchronized in client state
  (`index.html:31228–31254`; `nav.js:1490–1557`). Current formulas are not selected future rules.
- Achievement context mixes saved, local, derived and earned flags (`drills.js:531–655`;
  `profile.html:361–434`; `stats.html:451–513`). Rank's live value differs from the saved
  best-tier values used for identity (`themes.js:662–814`; `nav.js:309–327`). Certificates
  currently use track run coverage (`stats.html:397–436`; `index.html:25803–25840`).
- The retained posted fields do not establish solution viewing, hint/step-guide use or
  reliable historical independence. Future migration must retain original claims and unknowns.
  The inventory was read-only; no SQL/live data, schema, tests or security investigation.

A bounded independent product review identified three clarifications included above: explicit
unknown assistance for legacy records, lightweight unfinished-summary scope, and public
highlights that do not expose or delete underlying private records. None adds a new system.

### September 18: next metric definitions and helped-result flow — pending

**Source:** Wolf asked to keep asking questions to clarify the specifications and flow.
Continue in small dependent groups; this is not approval of the next recommendations.

Three questions were presented after the account-history/visibility/habit approvals:

1. **Speedrun result metrics:** recommend completion time, comparable personal bests and
   improvement history, plus keystroke count. These give speedrunners clear feedback without
   treating key economy as correctness. Alternatives: time/PB/improvement only (simplest), or
   also show clearly labelled efficiency versus a reference solution (more route feedback,
   requires meaningful reference counts and recognition of valid alternative solutions).
   Exact key-count semantics, comparison groups and historical unknowns remain to define.
2. **Practice-day qualification:** recommend meaningful active practice, including helped
   work and unfinished attempts, so struggling learners' effort counts. Opening a page alone
   would not count; an activity threshold remains to be specified. Alternatives: at least one
   completed lesson/drill with help allowed (simple finish line, omits unfinished effort), or
   an independent completion (stronger result threshold, discourages learners using help).
   This changes neither no-assisted-XP nor optional/non-gating streak principles.
3. **Helped ordinary lesson result:** recommend Continue learning as the main next action,
   with Try independently available alongside it and speedrunning as another option. State
   completion/help status and zero XP. Alternatives: recommend an independent retry while
   allowing continuation (more consolidation, may feel repetitive), or give equal choices
   without a recommendation (more freedom, more decision effort). Readiness checks at major
   jumps remain separate; continuing may lead to appropriate preparation rather than bypass
   a prerequisite. Result copy must describe the actual save state: confirmed account save,
   device-only guest record, pending or failure. It must never claim a save merely because
   the worksheet is complete.

**Wolf's choices:** all three pending. A decision on this packet would select the metric
categories, practice-day principle and result emphasis only, not all exact measurement,
eligibility, persistence, prerequisite or UI mechanics. No implementation is authorized.

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
| E10 | [Stats](../../stats.html), [profile](../../profile.html) and the E3–E5 runtime sources; targeted references in the account-records section | Existing account metrics, formulas, inputs and device-versus-account gaps. Source inspection only; no live account or new database/security audit. |

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
| D6: progress, mastery and rewards | Completion, clean PB, speed, XP, optional stars, streaks and milestones overlap; assisted state is largely local. | Separate XP/mastery/rank ladders versus one XP level with completion/independent status and personal performance records. The simpler structure reduces status complexity; a separate mastery label would make a broader skill claim. | Apply the confirmed simpler structure: learning progress and private performance/PBs remain useful records; assistance and comparable times stay distinct. Results explain outcome/save/next step. Defer a new mastery system. | **Confirmed September 18:** one XP level, lesson completion/independent progress and personal speedrun records; a new mastery system deferred. No assisted XP and earned-history preservation retained. Exact metric/reward formulas, repeat XP and achievements remain pending; the prior D6a/D6b questionnaire is retired, not approved wholesale. |
| D7: public competition and account rank | Best-time boards feed relative rank after automatic eligibility and five placements. Daily/session comparisons differ. DATA-04/06/07 limit completeness/trust. | Curated benchmark/Daily boards with personal records versus adding a new aggregate competitive rank. Boards offer narrower comparable goals with fewer account systems; aggregate rank adds identity and fairness/maintenance work. | Retain selected public benchmarks/events and personal drill speedruns beyond that set. Defer a new overall competitive rank. Plan common access/rules, comparable versions and preservation of existing rank history; Saved-progress/Security own eventual delivery. | **Confirmed September 18:** selected benchmark/Daily public focus plus personal drill records; optional challenge leaderboards retained in the simpler structure; a new overall competitive rank deferred. Existing earned rank history is protected. Eligibility, access/retries/integrity, exact boards and transition/presentation of the current rank remain open. D1/D2 supported in principle with metrics conditions. |
| D8: certificates | Three chapter-derived lists of qualifying runs; no pace gate or distinct assessment. Old interest in speed recognition overlaps skill credentials. | Completion certificate (low friction, weaker claim), independent skill assessment (stronger evidence, extra work), speed credential (narrower purpose). | Skill-path certificates based on independent, varied competence; separate speed badges. Guided progress prepares for assessment. Preserve existing issued certificates as earned historical credentials, with their original standard identified. Depends on D4/D6/D7; trust needs DATA-07 work. | Interest in shareable credentials carried forward; exact standards, attempts and paid eligibility **pending**. |
| D9: guest/account/free/paid | Guest local practice; permanent account for normal uploads; free-for-now flags plus progression locks; desk creation has a real entitlement check. Old price/PRO copy conflicts. | Complete useful free beginner path with replay/speedruns and advanced previews versus a small free teaching introduction with most structured learning paid. Wider free learning offers a worthwhile result; a smaller sampler places the paywall earlier. | Apply the approved useful-free-path/advanced-subscription split. Exact inclusion must be explicit and independent of menu position or rank. Explain local versus durable saving; Payments owns eventual entitlement rules. | **Confirmed September 18:** useful free beginner path, repeat practice/personal speedruns for included free content and a few advanced previews; advanced lessons/model-building courses require subscription. Subscriptions at launch and correctness-based readiness remain confirmed. Exact lessons/previews, prices/trials, expiry, desks, competition/certificate access and guest-history transfer remain pending. |
| D10: entry and next step | Fresh device starts Navigation; resume/direct links and several special-session entries exist. Navigation's nextKey is autofit while chapter order next is filldr. Tutorial skip leaves Foundations. No established personalized assessment. | Guest lesson before personalization/signup versus personalization first or account first. Try-first reduces entry friction; earlier questions/account improve initial matching/identity at the cost of more initial steps. | Apply the approved guest-lesson-first entry and experienced shortcut. Propose one clear next-step recommendation across result/path/resume, with editable personalized starting points. The exact result/returning flow remains a next decision. | **Confirmed September 18:** short hands-on lesson without an account, followed by personalization and an invitation to save; clear experienced-user shortcut. Customized starting points retained. Exact onboarding questions, save/guest-transfer behavior, assessment details and next-step controls remain pending. |
| D11: versioning/history | Results use drill keys; requirements often derive from today's catalog; some earned rewards already latch. Reusing a key could mix different work. | Reinterpret old records (simple but unfair); version requirements/content and retain evidence (more bookkeeping, preserves meaning). | Stable exercise identity plus scored revisions; version paths, credential requirements and competitive rules. Preserve old attempts, awards and certificates; separate incomparable boards. Explicit equivalence decisions determine whether old work satisfies a new requirement. Depends on final rules and content blueprints. | Preservation/no reset **confirmed**; migration/equivalence method **pending**. |
| D12: special-session scope | Classic, Rapid-fire and Daily serve different activities; race links and placement add contexts. Marathon, weekly and Tour implementations have no current ordinary entry. | Equal prominence for available modes (choice/complexity); core learning plus optional practice/events (clear entry); core only initially (simpler but loses useful variety). | Core learning first; selected public benchmarks/Daily events now agreed. Rapid-fire remains an optional-practice proposal; keep dormant systems dormant, race/placement as contexts and weakness queue as recommendations pending detailed choices. No code removal/revival. | **Daily/benchmark public focus confirmed September 18.** Other mode roles, prominence and mechanics remain pending. |
| D13: account records, visibility and activity | Account clean-run/session records mix with device-only learning/PBs and derived rewards; no durable general unfinished/help-use history. “Accuracy” means route efficiency, and practice-time scope is incomplete. E10 plus DATA-04/06/07. | Full finished history plus unfinished summaries versus finished-only or milestones/PBs; private details with chosen highlights versus public performance summaries; activity time/days with or without optional streaks. | Apply the three approved principles. Complete the candidate record/metric dictionary, comparison/measurement rules and honest legacy-unknown treatment before implementation; keep retained facts, derived stats and public display distinct. | **Confirmed September 18:** every finished attempt including helped/private work plus lightweight deliberately restarted/ended-unfinished summaries; private detailed history and selected public highlights; active practice time/days and optional non-gating streak. Exact fields/formulas, replay capture, interruptions, day/idle rules, retention/archive and migration remain open. The entire candidate metric table is not blanket-approved. |

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
- September 18 simplification follow-up: remote PRODUCT still matches the checked b8b8ca0
  content. Recorded Wolf's complexity concern separately from his subsequent explicit
  selection of the simpler structure. Retired the earlier question group without assuming
  approval of its formulas or mechanics. Documentation only; no new agent, audit or app tests.
- September 18 remaining-plan follow-up: re-read remote PRODUCT/CURRENT and reused this
  decision register. The shared queue still showed the earlier pending reward packet;
  Wolf's explicit simpler-structure selection at b26f112 remains authoritative. Presented
  six dependent planning outcomes and two entry/access questions, then recorded both explicit
  recommended-option selections separately from still-open exact content/save/pricing rules.
  No new source investigation, agent or app testing is needed for this planning-only update.
- September 18 account-metrics follow-up: re-read remote PRODUCT/CURRENT, which had incorporated
  the b26f112 simpler structure. Added the requested comprehensive product-records register,
  reused the focused source investigator and obtained an independent contract-clarity review.
  Recorded the three explicit history/visibility/habit approvals without approving every
  candidate metric/formula. Only this handoff changes; no application tests, live data,
  SQL/schema or security work. Prior audit defects remain implementation dependencies.
  Sole-file diff, all 19 relative Markdown links and whitespace checks pass.

## Proposed updates for the chief

**CURRENT proposal:** metrics examples have been presented. Wolf questioned whether the
proposed XP/mastery/rank model has too many systems, then explicitly selected one XP level,
simple learning status, personal drill-speedrun records and optional challenge leaderboards,
deferring new mastery and overall-rank systems. Retire the earlier three-part reward
questionnaire. Exact XP/metric formulas, access/competition rules and historical-rank
transition remain open. No implementation/new module.
The remaining plan is now grouped into entry/access, learning journey, records/rewards,
competition fairness, launch scope and final catalog/transition blueprint. D10 guest-lesson-first
and D9 useful-free-beginner-path/advanced-subscription principles are now explicitly approved.
Wolf has now explicitly moved the comprehensive account-records/metrics plan ahead of the
completion/save/next-step detail. D13 history depth, visibility and habit principles are
approved; finish the metric definitions and record/legacy contract without adding reward ladders.
This review still owns only its handoff on 00df57a; the chief retained that source review after
accepting 16ee830 for future implementation. No rebase/re-audit is required.

**PRODUCT proposal:** retain all existing confirmed decisions reconciled through b8b8ca0.
Add his explicit September 18 selection of the simpler structure: one XP level, lesson
completion/independent progress, personal speedrun records and optional challenge leaderboards.
New mastery and overall competitive-rank systems are deferred; existing earned progress and
rank history are preserved. This supersedes the area's earlier three-system recommendation,
not any runtime behavior. Exact XP/metric formulas remain open. Keep the approved
help/timer/readiness and public benchmark/Daily rules; no implementation authority follows.
Also add the two explicit entry/access approvals: try a short lesson without an account,
then personalize and offer saving, with an experienced shortcut; useful free beginner path
including repeats/personal speedruns and some advanced previews, advanced learning paid.
Exact inclusion, save/transfer behavior, onboarding questions, pricing and competition/
credential/expiry access are still open. Keep this distinction in the shared decision record.
Add the three explicit account-records approvals: every finished attempt (including helped
lessons/private speedruns) and lightweight deliberately restarted/ended-unfinished summaries;
private details with selected public highlights and separate deliberate public competition;
active practice time/days and optional non-gating streaks. The full metric/record dictionary,
formulas, raw replay, retention limits, interruption rules and legacy transition remain proposals.
Preserve existing records/rewards and avoid relabelling old unknown assistance as independence.

**Next bounded turn:** make the completion, saving and next-lesson journey concrete within
the now-approved entry/access principles. Wolf has explicitly brought account-retained stats
and tracking metrics forward: the history-depth, visibility and habit choices are now approved.
Next finalize the selected metric definitions and legacy/comparison boundaries before designing
result/save/next-step behavior. The full candidate set still needs agreement; bring any material
choices in small groups rather than another large questionnaire.
The current three-question group covers speedrun metric categories, practice-day qualification
and the main next action after helped completion; all three are pending.
Keep comparison/persistence,
credential standards and eventual historical-rank presentation explicit before implementation.
Do not reopen the approved gate, assistance or optional-timer policies. A complete skill map,
access/credential/competition rules, history policy and representative blueprints still precede
any catalog rebuild. This handoff is an evidence checkpoint, not the final approved design.
