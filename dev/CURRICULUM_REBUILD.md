# THE CURRICULUM REBUILD — one spine, a clean-slate entry, a launch homepage (r453 program spec)

_Wolf, 2026-09-03, after seeing the PR #247 preview: "before any of this we need a fulsome
audit / rebuild of the curriculum. The current onboarding feels broken where we're mixing different
old systems of the guided overlay / tutorial level — maybe start from a clean slate on the
onboarding/entry and tutorial. The homepage should be built for a full launch where PRO is a real
thing, no classic vs rapid-fire option, later chapters clearly gated by subscription or unlockable
at level gates, and highlight the ranking/leaderboard system and the ability to progress."_

_The audits already exist and are binding inputs: `dev/audit-r452/audit-catalog.md` (the skill graph:
59 require-before-teach violations, the difficulty spine, the four rework options),
`dev/audit-r452/audit-progression.md` (four ladders describing one climb; the 30-day player path),
`dev/TUTORIAL_CHAPTER_SPEC.md` v2 (the Keyboard Tour + lesson drills, built in wave 0),
`dev/DEPTH_PASS.md` (the drill law), `dev/MODELING_STANDARDS.md`. This file is the PROGRAM: the
decisions, the order, and the definition of done for each phase. It supersedes AUDIT_R452 §2 rows
A1, B1–B6 and C3, which it absorbs._

---

## 0 · The three findings this answers (from the audits, in one line each)

1. **The catalog is a flat list that assumes what it never taught.** 59 skills are required before
   they are taught, 38 of them in the first 16 drills; three of eight chapters have capstones;
   "Formulas II" is an audit chapter; Models I opens on its hardest board.
2. **Progression is four ladders wearing one name.** Level+clears gates, campaign milestones,
   certificate tracks and capstone gates each describe "the climb" and drift against each other;
   the chip and the card disagree on XP; the daily hands new players locked drills.
3. **Entry is three teaching systems stacked.** The modal product tour (spotlight cards), the
   Keyboard Tour (HUD + stage cards), guided rails with F1 hints on drill 1, the lesson card, and
   the placement prompt all fire in a new player's first five minutes. Each was right when built;
   together they read as broken.

## 1 · Decisions (the program's law — change here, not in the phases)

| # | decision | why |
|---|---|---|
| **P1** | **One spine.** The catalog is a ladder of CHAPTERS; each chapter is a cumulative concept family; each chapter ends in a CAPSTONE; clearing the capstone opens the next chapter's *progression artifacts* (milestone XP, the chapter medal, the track's step). Free play stays open (standing law: gate artifacts, never access). Level+clears gates are RETIRED as a second gate. | four ladders → one; the picker can finally say "next" |
| **P2** | **Two tiers, both real at launch.** Tier 1 (free): the front chapters. Tier 2 (PRO): the back chapters, gated by subscription OR by level (a level threshold per PRO chapter lets a committed free player earn in). `HOTKEY_PREMIUM.enabled` flips at launch with Stripe live; until Stripe is live the PRO chapters show their gate and their price and unlock by the level path only. | "PRO is a real thing"; the level path keeps the ladder the game |
| **P3** | **Chapters are re-cut by concept family**, in teaching order: Keyboard (the Tour + lessons) → Build (fill, formulas, anchors, sums) → Format (the banker's finish) → Structure & Data (rows/cols, sort, filter, lookups) → Audit & Repair (find-the-break) → Components (schedules, bridges, corkscrews) → Valuation (WACC, DCF, comps) → Credit (debt, revolver, waterfall, covenants) → Full Builds. Keys never change (PBs, boards, runs key off them); only `groups[]` order/names and `meta` move. | the skill graph says the order; the names say what a chapter teaches |
| **P4** | **Every chapter opens with a lesson and closes with a capstone.** Lesson drills (lesson card = start gate, 2–4 beats, visible ☆, hints on) teach the chapter's new concepts before the depth-pass drills use them; the capstone chains them. The five unbuilt capstones (redflags, pitchpage, shipit, cleanroom, qclose) get built in this program. | the bridge drills retire the violations; capstones make chapters real |
| **P5** | **One entry system.** Landing → Enter → the Keyboard Tour (six stages, HUD) → lesson 1. The modal product tour is DELETED; product chrome (checklist, drillbar, hints, themes, account) is taught by the Tour's HUD at the moment each first matters and by one-time contextual tips afterwards. Guided rails are never auto-enabled; F1 hints default on for lesson drills only. Placement is offered from the leaderboard, not from onboarding. | one voice, one surface, in order |
| **P6** | **Rank and progression are the homepage's second act.** Hero (what it is, one CTA) → how it works (learn by doing) → the ladder (chapters with free/PRO/level badges, live counts) → the competition (rank tiers, a live board snippet, desks) → PRO (real price, what it opens, the level path) → CTA. No mode toggle anywhere on the landing; Rapid-fire and Marathon live in the app's mode bar as *modes*, not as entry choices. | "highlight the ranking/leaderboard system and the ability to progress" |
| **P7** | **Certificates = tracks of chapters, unchanged in shape**; `HK_TRACKS` re-derives from the new groups and `migrate-certificates`/the RPC arrays move in the same PR (C15 guards it). | keeps the cert product; the invariant already exists |
| **P8** | **Frozen:** drill keys, achievement ids, HK_RANK.TIERS order, HK_PLACEMENT keys, localStorage keys. Renamed/moved: group names, chapter ids may be re-cut (a claim-flag migration maps old `hk_camp_xp` ids to new — one-time, client-side). | earned things persist |

## 1a · AMENDMENT (Wolf, 2026-09-03 evening — after the first Phase A map) — supersedes P3/P4 where they conflict

Wolf on the nine-chapter map: "I don't love that layout — the idea is less about lessons and
execution drills and more about MERGING the two into a gamified format. The original chapter layout
was actually pretty good; expand Foundations to cover the ribbon and other stuff (an extended long
set of tutorials) and then sections based on Excel functionalities. The first chapter is very
gamified — like the pac-man-style course for movement — with similar mechanics that make each drill
in the first set a GAME as you learn each foundational concept: a game tutorial before the speed
drills that are more like actual spreadsheets and business tasks."

Binding changes:
- **P3 (re-cut) is withdrawn.** The eight chapters stay (Foundations · Formatting · Formulas I ·
  Data & Lookups · Formulas II · Models I · Models II · Full Builds), with their ids c1–c8 and their
  capstone designations. No claim-flag migration.
- **P4 becomes: Foundations = THE GAME TUTORIAL.** ~12 mini-game drills, one foundational concept
  each (move · select · enter/edit · copy/cut/paste · fill · first formulas · anchors · number
  formats · fonts & colours · alignment & borders · the ribbon · structure ops), each built on a
  game mechanic the way the movement corridor is (pips, captures, lives, a visible bonus), before
  the speed drills that look like real spreadsheets. No lesson drills at the head of later chapters;
  later chapters are re-ordered within themselves only.
- **P1 (one spine) and P2 (two real tiers) stand.** PRO = the four chapters HOTKEY_PREMIUM names
  today; earn-in levels per PRO chapter.
- **Art (new, P9): every native asset goes pixel** — rank emblems, achievement medals, level chip,
  medal clocks, ☆, streak/crown/placement glyphs, badges, favicon/OG — in a detailed pixel style
  (Shattered Pixel Dungeon / Undertale register, "voxel-ish with some detail"), replacing the
  heraldic League-style theme entirely. Plan: dev/ASSET_INVENTORY.md + ART_DIRECTION §7.

Phase A v2 (the revised map) replaces the first map on PR #249.

### 1b · Wolf's answers (2026-09-03, late) — RESOLVED
- **Foundations = FIVE LEVELS, not twelve mini-games** ("feels shallow"): L1 The Corridor (move & select) ·
  L2 The Repair Shop (enter, edit, structure, clipboard, fill) · L3 The Power Grid (formulas, anchors,
  sign convention) · L4 The Print Shop (formats, fonts, alignment, borders, the ribbon both ways) ·
  L5 Model Tour (the existing capstone). Multi-act game boards, 5–8 min first play, replayable for time.
- **Level 1 replaces the Keyboard Tour** entirely (its runtime — HUD, cards, tier reveals — becomes
  the level runtime; the separate pre-game is retired when L1 ships).
- **Levels post to leaderboards** like any drill: timed, generous pass clocks, one visible ☆ each.
- **The level names are placeholders**; keep them until playtest.
- Entry path: landing → Enter → Level 1 act 1. The modal product tour and the guided auto-handoff are
  deleted; three contextual one-time tips replace the tour's chrome beats.

## 2 · The phases (each = one PR, gate green, Wolf playtest between)

### Phase A — the curriculum map (spec, one session, Wolf review)
- Produce `dev/CURRICULUM_V3.md`: the nine chapters, every drill's placement (all 74 + the Tour +
  the lesson drills + the five capstones = 74 + 6 lessons + 5 capstones ≈ 85), each drill's
  REQUIRES/TEACHES tags carried from the skill graph, and the check that no drill requires a tag
  its chapter (or an earlier one) does not teach. The picker's "next up" rule. The PRO line (which
  chapters) and each PRO chapter's level threshold. The certificate tracks re-derived.
- Per-lesson-drill pages for the six bridges (select · firstsum · lockref · ribbonpass · signs ·
  tracepass — four already in TUTORIAL_CHAPTER_SPEC §3.1–3.4) and per-capstone pages for the five
  ADDs (DEPTH_PASS §4 already carries qclose/cleanroom/redflags/pitchpage/shipit — refresh them to
  the r452 law).
- Wolf reviews the map in one sitting; decisions recorded in the doc, then it is binding.
- **Done when:** the map exists, every drill has a chapter, the violation count on the map is zero.

### Phase B — the clean-slate entry (build, one session)
- Delete the modal product tour (`TOUR_STEPS`, `tourShow` family, `showComfort`'s branching, the
  post-tour toast, `hk_tour_done`), the guided auto-handoff, and `maybeOnboard`'s placement prompt.
- The Keyboard Tour becomes the ONLY first-run path (already built, r452): landing Enter → guest
  session → Tour stage 1. Its HUD gains the four product beats where they first matter (checklist
  when stage 1 shows beats, drillbar at hand-off, F1/hints on lesson 1's card, account/save on the
  hand-off card). "I live in it" is a single line on the hand-off card, not a pre-question.
- Contextual one-time tips (a tiny toast with a keycap) replace the tour's chrome beats: first
  picker open, first PB, first rank pill change. Three, not thirteen.
- `e2e-audit-onboard.js` rewritten again around the single path; `check-startgate` covers the
  lesson-card gate; a new invariant asserts no second onboarding surface exists (no `TOUR_STEPS`,
  no `showPrimer`, no sandbox).
- **Done when:** a fresh device goes landing → Tour → lesson 1 → catalog with exactly one teaching
  surface on screen at any moment, proven by the suite's per-beat assertions.

### Phase C — the lesson wave + re-cut (build, two sessions)
- Wave 1: the six lesson drills (payload contract, WORKFLOW §9). Wave 2: the five capstones.
- Assembly: `groups[]` re-cut per the map, `meta` names, campaign chapters (ids per P8 with the
  claim-flag map), `HK_TRACKS` + certificate migration, `HOTKEY_GATES` retired in favour of the
  capstone spine + PRO level thresholds, `HOTKEY_PREMIUM.groups` set to the PRO chapters,
  achievements re-pointed (group-name reads), placement unchanged, SEO pages, sitemap, marketing
  counts (guarded). Picker: chapter progress, "next up", prerequisite chips, locked-with-reason
  naming the lesson drill.
- **Done when:** the full gate is green, the map's violation check is a CI invariant (C-next),
  and Wolf plays chapter 1 → 2 cold.

### Phase D — progression ties (build, one session)
- Bounty XP synced to the server snapshot (chip == card); daily rides through the gate; provisional
  rule = 5; one vocabulary for bands (pass/pro/legendary) surfaced on the card; skins' earn prose
  matches code. (AUDIT_R452 §2 A2–A7.)
- **Done when:** the 30-day player path in audit-progression.md replays with no contradiction.

### Phase E — the launch homepage (build, one session, after C)
- Landing v3 per P6: no mode chips; the ladder band reads free / PRO / "unlocks at level N" per
  chapter from the live config; the competition band shows the rank tiers (pixel emblems if C2 has
  shipped) and a live top-5 from the leaderboard RPC (guest-readable) with a "your placement"
  CTA; the PRO band quotes the real price from `HOTKEY_PRO.plans` once Stripe is live (until then
  "opens with billing · earn in at level N"); `check-landing.js` re-cut to assert all of it.
- Copy law holds: no chords, banker's register, learn-by-doing contrast stays.
- **Done when:** the landing has zero hand-typed numbers and the paywall guard runs both states.

### Phase F — the rank art (cosmetic lane, parallel to C–E)
- ART_DIRECTION §6: three pixel masters per tier behind the same `rankEmblem` signature.

## 3 · Order and dependencies
A (spec) → B (entry) ‖ D (ties) → C (lessons, capstones, re-cut) → E (homepage) ; F any time after
Wolf approves the v2 render. A is the only phase that needs a Wolf review before code; B can
start the same day A is approved because it does not depend on the map.

## 4 · What Phase A must decide with Wolf (the questions, with recommendations)
1. **The PRO line.** Recommendation: free = Keyboard · Build · Format · Structure & Data (about 30
   drills + the Tour); PRO = Audit & Repair · Components · Valuation · Credit · Full Builds.
2. **Level thresholds for earning into PRO chapters.** Recommendation: a single curve — chapter
   k of the PRO tier unlocks at level 10 + 3k — so a free grinder reaches Full Builds around level 25.
3. **Chapter ids.** Recommendation: new ids (k1…k9) with a one-time claim-flag map, rather than
   overloading c1…c8 with different contents.
4. **Placement's five boards** stay (navigation · combo · margin · sort · opmodel) — they still
   span the arc; opmodel's ride-through is already in.
5. **Rapid-fire and Marathon** stay as modes in the app's mode bar; nothing on the landing.
