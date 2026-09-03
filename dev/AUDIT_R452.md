# AUDIT r452 — THE FULL-PROJECT PASS (2026-09-03) · findings base + the menu

_Wolf: "assess the entire code base — performance, stale code, every page and the core drill set for
bugs, Excel parity especially Mac, a full audit of progression / rank / desk / level / missions /
achievements / learning path so everything ties, and a rework proposal for the catalog. Make immediate
fixes without approval; give me a menu for the rest." Six read-only audit agents ran in parallel
worktrees (one domain each, WORKFLOW §1); their full reports with every file:line are preserved in
`dev/audit-r452/`. This file is the synthesis: what was fixed the same day, what is on the menu,
and the recommendation. Companion: the r452 entries at the top of `dev/AUDIT.md` (one per fix
stream) and `dev/CONTINUITY.md` §0._

| domain | report | headline |
|---|---|---|
| performance + stale code | `audit-perf-stale.md` | render() rebuilt the grid with 21 `innerHTML +=` cycles per key; two forced relayouts per key; a listener leak on locked drills; drills.js loaded twice on 14 pages; 91-line dead echo subsystem |
| Excel parity + Mac | `audit-parity-mac.md` | the Mac adapter merged ⌃ and ⌘ into one bit (⌃⌘V silently full-pasted, ⌘⇧T dead); reference.html's Mac column was a glyph swap that taught Spotlight's shortcut |
| pages + drills bug sweep | `audit-bugs.md` | grading is sound (74/74, 160 alts, 77 guided, no false greens); the grid never re-fits on resize; Esc could not close sign-in; `?drill=` misrouted 49/74 deep links; legal pages are drafts with 13 placeholders |
| progression systems | `audit-progression.md` | four ladders describe one climb; 2 of 3 certificates unissuable; placement's 5th board unreachable; chip and card compute XP from different sources; the daily hands new players locked drills |
| catalog coherence | `audit-catalog.md` | 59 require-before-teach violations, 38 in the first 16 drills; navigation→filldr is a ×2.2 par jump; 3 of 8 chapters have capstones; the Tour + lessons retire ~45 of 59 |
| client ↔ backend contract | `audit-contract.md` | all 52 RPC calls match their signatures; the certificate arrays were stale (P0); `runs`/`profiles` have no CREATE in any migration; the outbox wedged on rejected rows; the retention decision (G10) is unimplementable without an aggregate layer |

## 1 · FIXED THE SAME DAY (merged on `claude/drill-redesign-art-style-jg9vhm`, each with a CI guard)

| # | fix | guard |
|---|---|---|
| F1 | **Certificates issuable again** — `issue_certificate` arrays derived from HK_TRACKS (fluency 19→16, formulas 32→28); every prior check carried forward (diff-before-replace) | C15: newest migration's arrays == HK_TRACKS |
| F2 | **Run outbox no longer wedges** — RUN_REJECTED/RLS/constraint drop the row; RATE_LIMITED/network keep it with a 10-attempt cap; newest-first | `dev/check-outbox.js` in the fast lane |
| F3 | **Placement's 5th board reachable** — the level+clears gate rides through `hkPlacementRide` for ranked entrants (one predicate, extended) | C21 + e2e-audit-rank T5 |
| F4 | **Phantom capstone medals hidden** (5 named drills that don't exist); `x_allach` counts visible only; `hk_ach_flags.pro/chaptersCleared/crowns` now written | C22 |
| F5 | **Captain quest templates** no longer pin retired drills | C20 |
| F6 | **Mac parity** — ⌃/⌘ un-merged; ⌃⌘V = Paste Special; ⌘⇧T = AutoSum; HK_MAC_CHORDS truth table (themes.js) with reference.html deriving from it; popup teaches fn+F4; Windows-only add-ins labeled | mac-input 19→30, parity 177→189, C25 |
| F7 | **Windows parity** — Tab-Enter home; Ctrl+Shift+V = values; Ctrl+Shift+8 region; Ctrl+; today; Shift+F2 guarded | parity suite |
| F8 | **Escape closes the sign-in modal** | onboard T10 |
| F9 | **74 forbidden inline name/label duplicates** removed from CHALLENGES; filldr's desc describes its real 7-beat board; dcfsens says "two-way sensitivity"; campaign chapter names == group names | C16, C17 |
| F10 | **The beta is retired** — curtain deleted, BETA_MODE → PRO_PERKS_FREE (behavior kept), 24 strings swept, beta_codes + curtain_check dropped by migration, `hags` deactivated live | onboard T1/T3/T9 |
| F11 | **Landing v2** live on the branch (Daylight default, the PRO door, learn-by-doing) | `dev/check-landing.js` 28 |
| F12 | **The Keyboard Tour** (wave 0 + the six-stage board + the HUD) | onboard 71 asserts, C23/C24 |
| F13 | **Card frames pixel pass** across 30 skins; 11 dead fx branches gone | C3 notch taxonomy |
| F14 | in flight at time of writing: **keystroke hot path** (one grid write, no forced relayouts, gate-listener dedupe, drills.js once per page, echo retired, Cache-Control) and the **bug-sweep set** (resize re-fit, honest deep links, billing loads the catalog, mobile overflows, toast above the tour, ? sheet, refmap chords, cert message, visual-audit harness repair) | see the r452 AUDIT entries when they land |

## 2 · THE MENU — needs Wolf (each row: what · why · effort · recommendation)

### A · Progression: make the systems one ladder
| # | item | why | effort | rec |
|---|---|---|---|---|
| A1 | **One spine: chapter → capstone → certificate.** Drop `chapters[].keys` as a gate; a group opens on the prior chapter's capstone; certificates stay the breadth requirement; XP/level = volume meter; rank = competition; bands surfaced on the card; achievements = flavor | four ladders (level+clears gates · milestones · certificates · capstones) describe one climb and drift against each other (audit-progression §Reconcile). Needs the 5 unbuilt capstones (redflags, pitchpage, shipit, cleanroom, qclose) | L | **yes, after the tutorial ships** — it is the structural answer to "make progression clear" |
| A2 | **Sync bounty XP** (milestones, bands, ☆, daily) into the server snapshot so chip and card agree (P0-3: chip LVL 7 while the gate read LVL 10) | local-only XP streams are lost per device and starve the ranked nudge | M | **yes** — a correctness bug players can see |
| A3 | **Daily Challenge pool filtered by what the player has unlocked** (P0-4: a fresh guest is served `comps`, locked) — or keep one global board and let the daily ride through the gate for everyone | one board for the whole site vs new players hitting a lock | S | **ride-through** (keeps the shared daily; matches the r158 "community moments" precedent) |
| A4 | Placement is 5 boards but `PROVISIONAL_W=6`, so every first rank is "Summer Analyst · provisional" | a rule that can never be satisfied at placement | S | set PROVISIONAL_W = 5, or make the 5th board count double |
| A5 | Two vocabularies for one ladder: HK_BAND Bronze/Silver/Gold/Elite vs pass/pro/legendary clocks; band medals render only on the results card | confusion, not a bug | M | pick pass/pro/legendary everywhere; show the band on the card |
| A6 | `gauntlet` is both a c2 milestone key (par×1.5 = 70 s) and its capstone (pass 94 s) — two different "done"s | | S | capstones are not milestone keys |
| A7 | Skins whose earn prose contradicts their code (6), `hk_runs_lite` counting mouse/guided runs, two "solves" definitions, `HOTKEY_PRO.roadmap` selling seasons that have no code | | S each | sweep in one cosmetic round |

### B · Catalog: the building-block ladder (audit-catalog §4)
| # | option | rec |
|---|---|---|
| B1 | **Build the four lesson drills** (select · firstsum · lockref · ribbonpass — TUTORIAL_CHAPTER_SPEC §3.1–3.4) **plus two the skill graph asks for**: `signs` (sign convention is demanded at drill #2 and taught at #42) and `tracepass` (Ctrl+[ / Ctrl+` — two orphans). Retires ~45 of the 59 violations. Catalog 74 → 80 | **yes — the next content wave** (spec exists; two pages to add) |
| B2 | **Prerequisite chips + "next up" in the picker**, and `drillLocked()`'s gate text names the bridge drill ("wants anchoring — try Lock the reference, 14 s") | **yes, same release** — clarity is the ask as much as order |
| B3 | Six re-orders inside chapters (the audit lists them: e.g. Models I opens on its hardest drill, `wacc` 112) | yes, with B1 |
| B4 | Designate the five missing capstones (needs the ADDs) and rename **Formulas II → Audit & Repair** (9 of 10 drills are find-the-break) | rename now (meta + achievement strings), capstones with A1 |
| B5 | Full chapter re-cut by concept family (Move & Select → Enter & Fill → Formulas → Format → Structure & Data → Audit → Components → Builds) | later — group names are load-bearing in five configs and move live players' certificate scope |
| B6 | Move `drill` (Hardcode) from Data & Lookups to Audit & Repair | with B4 |

### C · Product surfaces
| # | item | rec |
|---|---|---|
| C1 | **Legal pages are published drafts** — privacy/terms/security carry "Draft for review" banners and 13 `[bracketed]` placeholders on every footer link (bug-sweep P0-1) | **fill now** — needs the entity name (BUSINESS_PLAN §1) or an interim "operated by Wolf, sole proprietor" line; delete the banners |
| C2 | Rank art: pixel replicas (ART_DIRECTION §6): 8 × 16 + 8 × 32 + 8 × 64 masters, same `rankEmblem` signature | yes — one cosmetic round, after Wolf approves the v2 render |
| C3 | Landing hero: a real looping demo instead of the static grid | later; the static hero passed |
| C4 | Mac KeyTips: does Excel for Mac honor ⌥ ribbon KeyTips? 18 drills teach an Alt walk as the canonical route with no Ctrl+1 fallback for borders/alignment | **Wolf on a real Mac, 10 minutes** — decides whether Ctrl+1 needs Border/Alignment tabs |
| C5 | `__noShrink` drills overrun at 960×600 on fresh load (gauntlet, combo, unhide) — documented r333 exemption | accept or widen the fit sweep |

### D · Engineering
| # | item | rec |
|---|---|---|
| D1 | **Baseline migration**: `runs` and `profiles` (and `members`, `access_codes`, `redeem_code`) have no CREATE in any migration — the repo cannot rebuild its database. Needs live schema introspection (the secret key) to write safely | **yes, in the security session** (SECURITY_PLAN §1.1) |
| D2 | **Retention (G10)** is unimplementable as decided: PBs, boards, certificates derive from raw `runs` at read time. Needs a `run_stats` aggregate layer first | design decision — keep raw runs until the aggregate exists |
| D3 | CI: `e2e-audit-visual` (108 stale-probe fails, being repaired), fit-sweep (no per-drill timeout, no incremental output, ran 70+ min), numfmt/borders/cellstyles/findreplace/fontsize/clear-menu/audit-rank/par-sweep are all outside gate.yml | add the fast ones; give fit-sweep a per-drill time-box and output |
| D4 | `CHALLENGES` is 1.75 MB (68 % of index.html), parsed per load | architectural — lazy-load per chapter; L |
| D5 | fx canvases run whenever connected (no IntersectionObserver / `document.hidden`) — PROJECT_REVIEW F1 | M |
| D6 | `mySchoolChip` built-not-inserted (a missing feature, not dead code); `cycleProfile`/`toggleSound` unreferenced | decide |
| D7 | The `dev/migrate-*.sql` side channel is now labeled a mirror; the deploy workflow applies every file under `supabase/**` on merge — "review-only" migrations are impossible | doc rule added; keep |

## 3 · Recommendation (the order)
1. **C1 legal pages** (an afternoon, needs the entity line) and **C4 Mac KeyTips** (ten minutes on a Mac) — both are Wolf-only and both gate copy that is live.
2. **B1 + B2 + B3** — the lesson-drill wave with prereq chips and next-up; this is the catalog answer and the spec is written.
3. **A2 + A3 + A4** — the three progression bugs players can feel, one round.
4. **C2 rank art** on the cosmetic lane, in parallel.
5. **A1 one spine + B4 capstones** — the structural release, after the ADDs.
6. **D1 baseline + D3 CI lane** inside the security session.

Everything in §1 is on the branch and green on the local gate; CI runs the full 19-suite matrix on
every push and is the last word before merge to main.
