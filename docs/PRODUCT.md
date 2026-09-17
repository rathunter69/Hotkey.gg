# Product direction

Updated September 17, 2026. This is the shared product brief. Current work and launch status
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
behavior while making instructions, feedback and difficulty approachable. How to handle
timing, assistance, scoring and progression is still to be settled with evidence and Wolf.

Maintaining the ability to publish through Git is a setup requirement; checking that ability
is not authorization to deploy a change. Bounded repairs and preparation follow the order below.

## Learning decisions and repair order — latest September 17 response

| Area | Wolf's direction | Still open |
|---|---|---|
| First experience | Lean toward a guided beginner exercise; a short assessment may be a useful hook | Default entry and the experienced-user shortcut |
| Beginner learning | Interactive lessons that teach hotkeys and how Excel works | Exact help presentation and how much each lesson introduces |
| Timing | Time targets can matter throughout; untimed free Foundations is a possibility | Whether the clock is shown during teaching, and what speed affects |
| Assisted completion | Hints/step-by-step help should count for completion progress, not XP | Define what counts as assistance; instruction text should not be silently penalized |
| Exploration | Users freely explore basics; increasing difficulty and recommended paths | Access to advanced work and how recommendations adapt |
| Credentials | Interested in skill-path certificates shareable on LinkedIn, and possibly high-score recognition | Evidence required for a certificate versus a speed badge; no endorsement by LinkedIn implied |
| Catalog | Prefer a likely full rebuild, but preserve substantial earlier Foundations feedback | A full plan must precede implementation; the old v5 proposal is not automatically selected |
| Order of work | Easy security/account fixes → catalog/progression separation → repository/database cleanup → site framework → planned catalog redesign | Size/acceptance of each bounded repair or cleanup batch |

The user's suggestion of untimed free Foundations with everything else paid is an option under
discussion, not the settled offer. Do not hard-code new payment gates while separating systems.
"Site framework" means structure, journeys and shared interactions unless Wolf later requests
a particular technical framework; it is not permission for a React/Next rewrite.

### Recommendations awaiting agreement

- Begin with a short, satisfying guided exercise; offer experienced users a direct assessment
  route. Treat this as a product hypothesis until tested, not a measured conversion claim.
- Use the same exercise for guided learning and an independent timed retry. In lessons, suggested
  times provide context and do not fail or block a beginner. Teaching time should not become a
  competitive score. This avoids maintaining duplicate timed and untimed catalogs.
- Record assisted completion as learning progress; award XP and competitive eligibility for the
  agreed independent result. Define assistance consistently across hints, rails and solution replay.
- Make free Foundations useful on its own and include replayable timed basics, so visitors can
  experience both learning and improvement. Candidate paid value: deeper paths, business models
  and assessed skill certificates. Exact inclusions and pricing remain open.
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
| Leaderboards and storage | Fair competition, saved progress, identity visibility, retention and recovery | Open |
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
- Preserve the prior decision against a practice/ranked mode switch. Current rank-unlock
  behavior and any changes to it should be reviewed within progression work.

Sources: `dev/CONTINUITY.md` section 0d and section 0c, `dev/DRILLS_WOLF_LIKED.md`,
`dev/DRILL_DOCTRINE.md`, and the status correction in `dev/ART_DIRECTION.md`.
Older exact quotas for drill length, operation count, or grid density are design references;
they must not make beginner lessons needlessly difficult.

## Proposed learning loop to validate

1. Onboarding asks about the learner's goal, experience, and keyboard setup.
2. Recommend a starting lesson and explain why it fits.
3. Show a realistic task with a clear outcome.
4. Let the learner work using the keyboard, with help available when needed.
5. Explain success or failure; show accuracy before speed and efficiency.
6. Offer a useful retry or a clear next lesson. Save progress to the account.

The customization dimensions above are a proposal. Wolf confirmed customization, not these
exact questions. Start with recommendations drawn from a shared, tested catalog; separate
curricula for every profession are not yet approved. Guided learning and competitive runs
need clear scoring rules without adding a new mode-selection system.

## Decisions still needed

- Exact onboarding questions, how recommendations change, and how users revise their choices.
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
