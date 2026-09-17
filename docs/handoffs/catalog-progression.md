# Catalog, modes and learner-flow decision review

Updated: 2026-09-17
Task: `01a0b148-2693-7901-af91-934c83cabe1d`
Chief: `01a0b0fa-d857-7002-ab95-1da0a1cfb858`
Branch: `codex/catalog-flow-review`
Starting commit: `00df57afd8d3299cc7feaf523847b9ca43e54d06`
Latest shared guidance read: `codex/repository-foundation` at `79e4d93f8bc1fe486a734e58daedd892fbb13544`.
Chief follow-up: guidance `0ae29b1c7dfeee3c2551ce52352a65241a979c74` adds concise user-facing
communication and chief ownership of platform-wide design discussion; this review supplies proposals.
State: first evidence/design checkpoint; product questions pending. No replacement rules approved.
Owned files: **only `docs/handoffs/catalog-progression.md`**. CURRENT and PRODUCT remain chief-owned.

## Scope and outcome

Wolf authorized investigation and planning to make learning coherent before a catalog rebuild.
This checkpoint maps current behavior, reconciles relevant history, proposes boundaries and
example journeys, and asks the first three dependent choices. It is not a complete catalog
plan, implementation audit, production playtest or authorization to change access/rewards.

Remote CURRENT explicitly accepts 00df57a as the next area baseline; no newer accepted
application baseline was found. The original dirty `source/` checkout was preserved. This
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
  The definition of assistance remains open. Required instructions must not silently penalize learners.
- Basics should be freely explorable and paths recommended. Access to advanced work is still open.
- A full catalog rebuild is future direction, conditional on a complete agreed plan.
- Subscriptions must work at launch; the launch deadline is parked. The offer and pricing are open.
- The old preference against a practice/ranked switch is explicitly reopened for discussion.
  Reviewing it is not approval to restore it or to retain every historical mode.

No new answer to the first three questions is recorded in this checkpoint. Recommendations
below are proposals by this area lead for Wolf and chief review, not chief-approved decisions.

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

Settle **D1–D3 first**. They define what the learner chooses and whether progress controls
access. Then decide **D4–D6** (help, timing and results/rewards), followed by **D7–D9**
(competitive rules, credentials and access). Finally settle **D10–D12** (entry/resume,
history transition and special-session scope),
using representative blueprints. History preservation is already mandatory;
only its detailed mapping remains open. Do not ask Wolf to decide prices, all 74 drills or
every reward threshold before the basic experience is defined.

### First three choices — asked September 17, awaiting Wolf

| ID | Current behavior / conflict | Options and tradeoffs | Lead recommendation | Wolf's confirmed choice |
|---|---|---|---|---|
| D1: relationship between lesson and drill | One main workspace with layered tools; only Navigation has the established staged entry. Separate lesson/tour frameworks and alternative branch tutorials cause naming overlap. E2/E4/E7/E8. | **Shared exercise:** teaching and independent retries reuse content and progress identity; must clearly label assistance. **Separate lessons/drills:** allows distinct pacing, but duplicates content and makes transfer/history harder. | A lesson teaches an exercise; an independent retry uses that exercise again. One content identity and workspace, with distinct attempt evidence. New variants may test transfer; they are not duplicate progress. | **Pending.** Integrated teaching is carried-forward direction; this exact arrangement is a proposal. |
| D2: competitive intent | Eligible classic runs post automatically; rank eligibility is automatic later. No practice/ranked switch. Request explicitly reopens this. E4/E5/E7. | **Explicit scored attempt:** clear start/rules and learner choice; adds an action. **Automatic eligible scoring:** fewer clicks and current continuity; help/eligibility may surprise learners. **Personal bests only for now:** simpler launch scope but postpones social competition. | An explicit “Start scored attempt” action using the same exercise/workspace. Ordinary learning does not publish a competitive score. This separates a run's purpose from an account's rank; no always-visible global toggle is required. Exact eligibility and rank-entry gate remain D7. | **Pending.** Would supersede automatic publication for ordinary learning if selected; does not yet reinstate any old switch. |
| D3: paths and locks | Level/pace/chapter/PB/PRO rules gate later chapters; chapter-linked certificate tracks double as paths. Confirmed freely explored basics conflict with treating the ladder as universal access control. E3/E4. | **Recommendations:** any exercise included in the user's access can be chosen, with prerequisite advice; users may enter difficult work. **Prerequisite checks for advanced work:** protects sequencing but adds friction/assessment. **Existing level/speed locks:** game-like climb but can require grinding before relevant work. | Recommended paths and prerequisite advice, with no XP/speed locks on exercises included in access. Skill evidence gates credentials/competitive eligibility rather than ordinary learning. Exact advanced free/paid access remains open. | **Pending.** Basic exploration is already confirmed; extending this to all entitled exercises needs this decision. |

### Subsequent choices — register, not another questionnaire

| ID | Current behavior / conflicting guidance | Options and tradeoffs | Lead recommendation / dependency | Wolf's confirmed choice |
|---|---|---|---|---|
| D4: assistance | F1 hints remain eligible; guided rails exclude normal XP/PB/upload; baseline directions differ from solution help. “Hints stay free” is ambiguous between price and score. | Count all instructions as help (punitive); count explicit solution help (clear boundary); allow all hints competitively (easy entry, weaker independent claim). | Always show task instructions, location cues and tool labels. Mark solution hints, step-by-step solving, rails and replay-derived attempts as assisted. Show the consequence before help is used. Learning progress survives; no assisted XP. Define fresh independent retry after viewing a solution. Depends on D1/D2. | Assisted completion/no XP **confirmed** September 17. Exact help classification **pending**. |
| D5: timing and retries | First-key gate, running clocks, pars, speed bands and some pass targets coexist. Pausing and special sessions differ. Untimed Foundations was an option, not an approved rule. | Visible stopwatch throughout (motivating/stressful); optional personal time while learning; enforced competitive clock with explicit start. Unlimited practice vs limited scored attempts affects fairness. | No speed failure during teaching; optional time feedback. Competitive time begins on an explicit, consistent start; any planning time, pauses, retries and seed rules must be disclosed. Unlimited learning retries; competitive retry policy decided with D7. Depends on D2/D4. | **Pending.** |
| D6: progress, mastery and rewards | Completion, clean PB, speed, XP, optional stars, streaks and milestones overlap; assisted state is largely local. | One combined progress score (simple but misleading) or distinct learning/independent/speed evidence (clearer but must stay readable). Repeated independent solves can earn diminishing XP or only new competencies can earn XP. | Results lead with outcome: completed with help / independently; then saved status and next step. Learning completion, demonstrated skill, XP level and speed records remain distinct. Mastery requires repeat/transfer evidence, not one fast guided clear. Keep assisted XP at zero; settle independent/repeat XP amounts later. | No assisted XP and preserve earned progress **confirmed**; exact mastery/XP/achievement rules **pending**. |
| D7: public competition and account rank | Best-time boards feed relative rank after automatic eligibility and five placements. Daily/session comparisons differ. DATA-04/06/07 limit completeness/trust. | Best-of unlimited standardized attempts vs limited attempts vs randomized sets. Rank gated by activity vs standardized competence. Different layouts/platforms can need distinct comparison pools. | Correct completion first, comparable exercise/rule version and seed policy, explicit assistance exclusion and supported keyboard/tool policy. Prefer unlimited practice plus best eligible score for ordinary boards; fixed-attempt events only if separately desired. Derive rank from competitive evidence, not teaching XP. Do not promise fair verified competition until its implementation evidence exists. Depends on D2/D4/D5; Saved-progress/Security own delivery. | **Pending**, including retention/removal of level-10 entry and the five-board set. |
| D8: certificates | Three chapter-derived lists of qualifying runs; no pace gate or distinct assessment. Old interest in speed recognition overlaps skill credentials. | Completion certificate (low friction, weaker claim), independent skill assessment (stronger evidence, extra work), speed credential (narrower purpose). | Skill-path certificates based on independent, varied competence; separate speed badges. Guided progress prepares for assessment. Preserve existing issued certificates as earned historical credentials, with their original standard identified. Depends on D4/D6/D7; trust needs DATA-07 work. | Interest in shareable credentials carried forward; exact standards, attempts and paid eligibility **pending**. |
| D9: guest/account/free/paid | Guest local practice; permanent account for normal uploads; free-for-now flags plus progression locks; desk creation has a real entitlement check. Old price/PRO copy conflicts. | Free Foundations only vs broader free basics/samples; free or paid timed practice/credentials; account before start vs after first result. | Let a guest complete a useful beginner exercise; explain saving at the result and offer an account. Keep useful basics and replay in the candidate free offer; paid depth/models/assessed credentials are options. No final package/price selected. Access must be independent of chapter position and rank. Depends on D1–D8; Payments owns eventual authoritative rules. | Subscriptions at launch **confirmed**; package, prices, trials, desks and guest-history transfer **pending**. |
| D10: entry and next step | Fresh device starts Navigation; resume/direct links and several special-session entries exist. Navigation's nextKey is autofit while chapter order next is filldr. Tutorial skip leaves Foundations. No established personalized assessment. | Start with short teaching then personalize; questionnaire first; assessment-first for everyone. | A quick guided success by default, obvious experienced-user shortcut, editable recommendations. Use one next-step resolver across result, path and resume. Returning learner sees last work plus one reasoned suggestion. Placement is optional competitive setup, not a compulsory beginner diagnostic. Depends on D1/D3/D9. | Customized starting points **confirmed**; exact questions/default/assessment **pending**. |
| D11: versioning/history | Results use drill keys; requirements often derive from today's catalog; some earned rewards already latch. Reusing a key could mix different work. | Reinterpret old records (simple but unfair); version requirements/content and retain evidence (more bookkeeping, preserves meaning). | Stable exercise identity plus scored revisions; version paths, credential requirements and competitive rules. Preserve old attempts, awards and certificates; separate incomparable boards. Explicit equivalence decisions determine whether old work satisfies a new requirement. Depends on final rules and content blueprints. | Preservation/no reset **confirmed**; migration/equivalence method **pending**. |
| D12: special-session scope | Classic, Rapid-fire and Daily serve different activities; race links and placement add contexts. Marathon, weekly and Tour implementations have no current ordinary entry. | Equal prominence for available modes (choice/complexity); core learning plus optional practice/events (clear entry); core only initially (simpler but loses useful variety). | Core learning first; optional Rapid-fire and Daily have clear distinct purposes. Keep Marathon dormant; race/placement are competitive contexts and weakness queue is a recommendation. Do not revive dormant systems or remove code in this phase. Depends on D1/D2/D5/D7/D10. | **Pending.** |

## Proposed journeys to test the choices

These are acceptance examples for the proposal, **not current behavior or agreed features**.

1. **Complete beginner, guest.** Starts a short movement-and-copy lesson with visible location
   cues. Opens a step hint, finishes the worksheet and sees “Completed with help — learning
   progress earned; no XP.” Next actions are continue learning or try independently. Saving
   explains what is local and what an account would retain. No automatic competitive entry.
2. **Experienced learner.** Chooses a relevant formulas/model path or skips to an exercise
   included in their access. Gets prerequisite advice without grinding XP. Can try independently
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

## Proposed updates for the chief

**CURRENT proposal:** register this dedicated review on `codex/catalog-flow-review` from
00df57a, owning only this handoff. First evidence map/register prepared; D1–D3 pending.
No catalog/progression extraction or new rule implementation has started. Existing security
and testing owners continue their separate scopes; no new module has been dispatched.

**PRODUCT proposal:** link the reviewed system map and decision register. Preserve September 17
confirmed constraints. Do not promote any recommendation to a decision until Wolf answers.
When an answer arrives, record its date, exact choice, earlier rule replaced, acceptance example
and remaining dependencies. D2 must distinguish per-attempt competition from account rank.

**Next bounded turn:** record Wolf's D1–D3 answers and reconcile them with the chief; then bring
one small group covering help, the clock and what completion earns. A complete skill map,
access/credential/competition rules, history policy and representative blueprints still precede
any catalog rebuild. This handoff is an evidence checkpoint, not the final approved design.
