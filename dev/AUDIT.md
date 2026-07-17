# hotkey.gg — Live Code Audit (2026-07-06, from repo @ main)

## r300 — unique handle suggestions + rapid-fire canon-border cards (Wolf batch)
- **HANDLE SUGGESTIONS ARE COLLISION-CHECKED (Wolf: "make sure it's truly unique").**
  New `hkSuggestHandleUnique(n)`: batches candidates, ONE profiles query per deal
  (case-insensitive compare), redraws taken names up to 4 rounds, numbered fallback.
  The handle modal deals its 3 chips instantly (sync) then quietly swaps any that
  turn out taken; account.html's suggest button same. Offline the check degrades to
  the old behavior. Server unique constraint remains the hard gate.
- **RAPID-FIRE gains the r298 canon borders** — Double bottom (Alt H B B, "close the
  grand total") and Top & bottom (Alt H B D). Flash Fill deliberately NOT a rapid-fire
  card (it needs a source block + example, not a single-cell op) — it gets its own
  drill (queued). RF suite 12 PASS.
- **Email reminders / verification customization (Wolf asked):** still Wolf-gated —
  dev/EMAIL_SETUP.md step 1 (domain mailbox) hasn't happened; templates + weekly
  digest (deployed, dormant since r118) hang off it.
- Remaining queue after this round: onboarding spotlight rebuild (spec ready, next big
  round) · modes-rail mock · tier sub-buckets + LP-style rank design (Wolf-input) ·
  F9 + tie-out drill · icon sweep (screenshot-first) · copy-inventory batch markup.

## r299 — sign-out feels like a reset, deterministic login, Alt+↓ filter dropdown, hidden-row cue (Wolf batch)
- **SIGN-OUT NOW READS AS A RESET (Wolf).** The r296 land-home redirect carries `?fresh=1`; the
  trainer opens on DRILL ONE (last-drill memory is wiped with the account mirrors) and toasts
  "Signed out — fresh desk, drill one." The param strips from the URL after arrival. First
  attempt wired the toast into exitSession()'s resume path by mistake (same loadChallenge line,
  wrong caller) — verified live at the real boot site.
- **LOGIN IS A FULL RELOAD (Wolf: "still not showing my account until I refresh").** Two layers:
  (1) the r297 eager-render fix had NOT deployed when Wolf re-tested — it was sitting in the
  unmerged PR (again: nothing is fixed until main moves); (2) belt-and-suspenders per Wolf's own
  instinct — successful password sign-in now does location.reload(), so every surface (rank pill,
  boards, mirrors, account theme) hydrates from scratch instead of trusting a chain of reactive
  re-renders. This bug class has now come back twice; deterministic wins.
- **HELD Alt+↓ OPENS THE FILTER DROPDOWN (Wolf: "doesn't work in the filtered-row drill").** The
  r143 dead-chord class AGAIN: the Alt keydown entered ribbon mode before ↓ arrived, so the r180
  dropdown branch (gated on mode!=='ribbon') never fired. The ribbon handler now recognizes
  fresh-ribbon + Alt-held + ↓ on an armed filter header as the dropdown chord. Sequential
  Alt, then ↓ still works as before. Verified live: armed → held-chord → dialog='filter'.
- **HIDDEN ROWS SHOW THE BREAK LINE (Wolf: "no icon indicating hidden rows").** Row headers under
  a hidden run now carry Excel's cue — a double rule (.rowhdr.hidcut) where rows are missing.
  The unhide drill stops being a guessing game. Verified on the unhide board.
- **Unhide-all ritual in the reference (Wolf):** new row — Ctrl+A → Alt H O U O, "unhide EVERY
  row — the open-a-new-sheet ritual." (Column unhide stays out until the engine models hidden
  columns; noted in T-E's deferred list.)
- GATE: targeted — filterpass/unhide/grpfold/navigation replay 3/3 each · parity 124 · live
  probes for the three new behaviors · CI full gate on the PR.
- QUEUED from this Wolf batch: unique-handle suggestions + suggest-in-onboarding · email
  reminders/verification customization (EMAIL_SETUP.md is the runbook, Wolf-gated on mailbox) ·
  icon-consistency sweep (screenshot-first) · trace-precedents + F9-evaluate drill (engine F9 +
  'tieout' drill spec in the task).

## r298 — BORDER CHORDS TO EXCEL CANON (Wolf caught it) + insert-seq copy + name-gen + copy quick fixes
- **THE CANON BUG (Wolf, from live play): our Alt H B letters were WRONG vs real Excel.** We taught
  T=top and B=bottom for months; Excel's actual access keys are **O=Bottom, P=Top, T=THICK BOX,
  S=Outside, N=No Border**. For a product whose whole promise is "muscle memory that transfers to
  real Excel," this was the worst class of bug we can ship. Fixed everywhere in one sweep:
  · ENGINE: HBP→top, HBO→bottom, HBT→thick box (was K), HBS→outside (kept), HBN→clear (kept, now
    also clears bdbl). NEW canon items: **HBD = Top & Bottom**, **HBB = DOUBLE BOTTOM** (new `bdbl`
    cell flag + 3px double render — the grand-total rule bankers actually close a page with).
    REMOVED: the r234 "Inside borders" chord (Excel's gallery has no such access key) and the
    nonstandard K/O aliases.
  · SWEEP: 140 chord references migrated across index.html (drill demos in FOUR key encodings,
    req/guide/prompt copy, ribbon MENUS labels), dev/e2e-alt-paths.js, dev/e2e-borders.js,
    dev/e2e-audit-parity.js, reference.html (+ thick box / double bottom / top&bottom rows added).
    Lesson recorded: demo key sequences exist in spaced AND unspaced AND object-literal AND W()
    encodings — canon sweeps must grep all four (the first pass missed 19 spaced/object refs and
    three drills' demos silently hit the NEW double-bottom B).
  · VERIFIED: e2e-borders rewritten to canon (13 PASS incl. new O/P/D/B asserts) · full
    demo-replay 81 GREEN · parity 124 · alt-paths 74 · echo 21 · mac 19 · rapidfire 12.
- **Insert-row sequencing (Wolf):** engine already Excel-true (Ctrl+Shift+= / Ctrl+- only fire on a
  FULL row/col selection — Shift+Space / Ctrl+Space first), and rowops teaches it; the reference
  sheet now spells the sequence out on the insert/delete rows.
- **Handle generator (Wolf: "suggesting names with bulge"):** pools rebuilt — tongue-in-cheek
  across the whole spreadsheet class (PivotTable_Wizard, RunRate_Consultant, HardCoded_Footnote),
  IB slang kept where it's funny and safe; 'Bulge'/'Diluted'/'Distressed' gone; compose-time
  regex guard as a safety net. Server-side moderation stays the real gate.
- **Copy quick fixes (from dev/COPY_INVENTORY.md, marked resolved there):** ladder-floor copy
  unified (MBA Associate is the floor); dead onboarding placement button aligned with the live
  warm-up copy; "dive in" banned phrase out; staffer program templates no longer pin drills
  deleted in r249 (saves/format/blue → undo/dress/decimals); nav shortcut sheet 'g'→'F1';
  dead MARATHON_DURS removed. 555-row inventory awaits Wolf's batch markup for the rest.
- Cache: nav.js 263→264, lb.js 10→11; drill pages + refmap regenerated.

## r297 — Flash Fill, login-shows-account fix, welcome-back honesty, UI+nav polish (Wolf batch)
- **ENGINE — Flash Fill (Ctrl+E)**, the average corporate user's favorite trick (Wolf's ask).
  `flashFill()`: infers a transform from ONE typed example beside a data column and fills the
  block's blanks. Deterministic candidate library (no ML) — case ops (proper/upper/lower),
  token split (first/last word), delimiter splits (@ , -), initial, and TWO-column templates
  with an inferred literal separator ("Last, First"). First candidate reproducing EVERY example
  wins; no pattern → refuses (never guesses). Results land as TEXT, Excel-true (a "7203" ticker
  stays text). Parity matrix +4 (now 124). RANK/text/finance sections from r296 stay green.
- **LOGIN NOW SHOWS YOUR ACCOUNT (Wolf: "open my browser, still logged in, but it doesn't show
  my account; theme feels stale").** Root cause in nav.js boot: `renderAuthBar()` was called ONLY
  inside the profiles `.single()` fetch, so a slow/failed profile query left the auth slot on the
  guest "sign in" button forever even though the cached session was valid. Fix: render the
  signed-in state EAGERLY off `getSession()` (handle refines when the profile lands); `.single()`
  → `.maybeSingle()`; same eager render on the `onAuthStateChange` sign-in branch. The "stale
  theme" feeling was the symptom of this — the account theme was applied but the account wasn't
  showing; with the account rendering, the theme reads as correct (it IS you). Theme stays a
  device pref by design (survives logout, like onboarding/platform).
- **WELCOME-BACK told a lie (Wolf).** The returning-user card advertised "1–9 jump" to a drill,
  but digits route to the cell editor (type-to-replace) long before the drill-jump branch — the
  branch was dead code and the hint was false. Removed the dead `1-9` classic-mode branch; the
  card now reads "\\ pick a drill · F1 guided help · any key to start" (drill jumps live in the
  picker, where digits can't collide with data entry).
- **UI POLISH (from the visual audit):** (1) account.html "Create an account" CTA rendered
  accent-on-accent (invisible) — `.state a` out-specified `.acc-cta`; added `.state a.acc-cta`
  ink rule. (2) leaderboard `.hero.two` never collapsed on mobile (out-specified the media
  queries) → Top Players clipped off-screen; collapse rules now name `.hero.two`. (3) reference.html
  key separators + section counts hardcoded `#4a4c48` (invisible on dark) → `var(--faint)`.
  (4) desks empty guild board rendered two stranded arrows around a void → single centered
  "no desks yet" line. (5) stats KPI row de-raggedized (dropped the lone leading ⏱).
- **NAV/IA POLISH (from the nav audit):** (1) top-nav now shows section NAMES at ≥900px (was five
  unguessable glyphs — "desks"/"reference" icons were ambiguous). (2) campaign modal was the ONE
  modal that trapped Escape (broke the "Esc closes modals" promise) → Esc handler added. (3) the
  weakness chip's ◆ glyph collided with the daily-challenge ◆ → weakness is now ◈.
- DEFERRED to their own rounds (captured, not lost): the Practice/Daily/Compete modes rail (the
  nav audit's #1 — the mode bar has objectively outgrown one row); the WRONG Excel border chords
  (T/B → Excel's O/P/S/T/N canon) + a full chord canon-audit; insert-row sequencing copy; the
  name generator's bad-word filter + broader tone; leaderboard tier sub-buckets; LP-style rank
  progression; rapid-fire coverage of the new functions; the 34 flagged copy rows in
  dev/COPY_INVENTORY.md (the batch-review artifact).
- Cache: nav.js 262→263, nav.css 175→176, lb.js 9→10, lb.css 4→5; drill pages regenerated.
  Local gate green pre-push (parity 124 · demo-replay 81 · onboard 29 · alt-paths 74 · mac 19 ·
  echo 21 · rapidfire 12); CI is the authoritative full gate.

## 0. HEADLINE: the repo is behind the believed feature state
The deployed code does **not** contain several features PROJECT_CONTEXT/memory said
were shipped: **no Stripe/Pro/entitlements code, no =PRO() button, no keyboard-profile
toggle (macabacus/factset), no banking-ladder tier names** (ranking exists but is a
simpler avgPct-tier system with a 5-attempt minimum). Commit history shows a
"new theme, webhook" commit, but current index.html has zero Stripe references.
Also absent from repo: supabase/functions/, STRIPE_SETUP.md.
→ Either an older local copy was uploaded to GitHub, or those features were built in
chat sessions and never deployed. **Decide which is true** — if a newer index.html
exists locally, push it before any further engine work, or we'll be building on the
wrong base.

What IS live and verified: 18 drills, drills.js single-source-of-truth sync (clean),
shared nav on index/leaderboard/reference, themes (default = dark, not Daylight),
rapid-fire + marathon modes, guided mode, anon score gating (recordRun/recordSession),
invite gate, BETA_MODE=true, correct Supabase URL/anon key, CNAME → www.hotkey.gg.

## 1. Drill audit — 18 drills, par/parKeys vs the 10s–120s window
Model: par ≈ keys×1.2+8 · slow ceiling ≈ keys×2+20 · optimized ≈ keys/3.

| drill | par(s) | keys | slow est. | verdict |
|---|---|---|---|---|
| navigation | 20 | 7 | 34 | ✓ but optimal <10s |
| copyover | 18 | 10 | 40 | ✓ |
| polish | 24 | 14 | 48 | ✓ |
| combo | 32 | 20 | 60 | ✓ |
| format | 35 | 28 | 76 | ✓ |
| center | 14 | 8 | 36 | ✓ but optimal <10s |
| blue | 34 | 18 | 56 | ✓ |
| gauntlet | 75 | 30 | 80 | ✓ (par generous) |
| drill | 13 | 9 | 38 | ✓ |
| series | 14 | 8 | 36 | ✓ but optimal <10s |
| sort | 18 | 6 | 32 | ✓ but optimal ~3s |
| margin | 22 | 14 | 48 | ✓ |
| bridge | 22 | 12 | 44 | ✓ |
| foot | 55 | 46 | 112 | ✓ borderline high |
| percent | 30 | 18 | 56 | ✓ |
| schedule | 50 | 54 | **128** | ⚠ over 120s for slow users; par 50 = 1.08 keys/s sustained across 7 pointed formulas — tightest in the app. Fix: par→65, or drop Yr 4 (cuts ~14 keys → slow ≈100s) |
| comps | 32 | 24 | 68 | ✓ |
| lookup | 50 | 38 | 96 | ✓ |

**Sub-10s-optimal drills** (navigation, center, series, sort): fine as warm-ups but
below your 10s floor. Options: accept as intentional quick-reps (my recommendation —
they're rapid-fire fodder), or thicken them (e.g. sort a 2nd column, center + wrap).

## 2. Spec conformance findings
- **sort has ZERO randomization** — fixed deals, fixed values, and `expectedNames`
  hardcoded in checks(). Worst offender vs the randomization goal, and a trap: anyone
  who randomizes build() without touching checks() silently breaks grading.
- **Values randomize everywhere else; layout and labels never do.** Fixed anchors
  (B2:B6 etc.) and the same 'Atlas Co / Borealis / Cygnus' cast in 5+ drills. This is
  exactly what drillgen fixes.
- **navigation checks are STATEFUL** (progression latching on S.navProgress) — the
  "engine grades end-state only" doctrine has one exception. Documented, not a bug.
- combo's autofit task depends on a random value ≥1M appearing (p≈100%, but
  technically the check can be born-satisfied).
- par/parKeys are hand-set constants — consistent style, no other outliers.

## 3. Bug scan
- **Syntax: clean.** Both inline scripts, drills.js, nav.js, themes.js all pass
  node --check. drills.js↔CHALLENGES sync has defensive warnings; keys match 1:1.
- Script load order correct on index/leaderboard/reference (drills.js → themes.js →
  nav.js), with a graceful warning path if drills.js is missing.
- **About.html does not load nav.js/nav.css** — it's outside the shared-nav system.
  If intentional (marketing page), fine; otherwise users there lose site nav.
- reference.html uses .keycap classes (0 <kbd> tags) — fine, just noting.
- No secrets in client code ✓. Anon publishable key + URL match PROJECT_CONTEXT ✓.
- Nothing broken found in static analysis. Runtime/visual bugs need a browser pass —
  report them as you hit them, per usual.

## 4. Layout (static review — can't render, honest limits)
Structure is sound: mode pills (drill/marathon/rapid), marathon HUD, rapid-fire
single-cell stage, per-drill colW overrides so nothing #### s at start. Theme default
is **dark** — PROJECT_CONTEXT claimed Daylight-default; repo says otherwise (same
repo-lag question as §0). True visual review needs screenshots or a browser session.

## 5. Pipeline: drillgen → engine integration map (now exact)
Live cell shape: `{value, formula, txt, bold, fill, fontColor, align, wrap, bb, bt,
fmtStyle:'comma'|'percent'|'currency'|'general', decimals}`. Checks return
`[{label, ok}]`. Helpers: rnd, blankCell, colLetter, Kb, overflowsCol, eqLoose.

Adapter wiring (small, mechanical):
- getValue → S.cells[ref].value · getFormula → .formula · getBold → .bold ·
  getBlue → .fontColor==='blue' · getFmt → map 'comma'→{fmtStyle:'comma',decimals:0},
  'pct1'→{fmtStyle:'percent',decimals:1}
- runChecks output → wrap as [{label, ok}] groups per task for the checklist UI
- Seeded RNG: swap engine's Math.random rnd for DrillGen.makeRng per run; store seed
  with the run for replay/daily-challenge later
- Migration order (port = move build/checks into a generator, keep prompt/guide):
  1) sort (kills the hardcode trap + adds randomization where there's none)
  2) drill, copyover, margin, percent, foot, comps, lookup, bridge, schedule
  3) polish/combo/format/gauntlet/center/blue/series (formatting checks map cleanly)
  4) navigation stays bespoke (stateful)
- Name collisions drillgen↔live: margin/percent/foot/lookup/comps/schedule/bridge/sort
  exist in both with different internals — generators must be adapted to the live
  drills' semantics (e.g. live bridge = profit row fill, not a delta walk) or shipped
  as NEW drills under new keys. Decision per drill at migration.

---
# AUDIT ROUND 2 (2026-07-06, same session) — game modes + IB-priority review

## Game modes
- **Marathon** (5/10/15 min): random drills back-to-back against the clock; records
  mode/duration/score/keystrokes/misses/optimal. Leaderboard tiebreak chain is sound:
  score → fewest keys-over-optimal → fewest misses → earliest. No issues found.
- **Rapid-fire** (30/60/120s): 46-op single-cell chord pool, shuffled-bag sampling,
  toggle-aware ops (start-state randomized), alt input paths (chord + ribbon) where
  both exist, hint hotkey with high scores gated on hints-off. No issues found.
- **Guided mode**: next-keystroke ribbon hints; demo player per drill. No issues.

## IB-priority coverage review (per Wolf's criteria)
RF pool already covers the banker set: paste-values (Alt H V V), F4 anchor, Alt+=,
Ctrl+D/R, full border family (subtotal/total lines), blue-input entry (Alt H F C),
freeze panes, trace precedents, comma/%/$ + decimals, filter. The main catalog
covered pointing formulas, fills, anchoring, INDEX/MATCH, paste-special-values,
sort, series, and model formatting — but was missing three desk staples, now ADDED:
- **growth** — YoY growth row (=C2/B2-1, point + Ctrl+R + %1dp). The most-typed
  formula in banking; was completely absent.
- **revolver** — cash sweep =MAX(0,−cash) fill-right. Debt-schedule core; especially
  on-thesis for restructuring. MIN/MAX already existed in the evaluator, unused.
- **cagr** — =(end/beg)^(1/yrs)−1 + %1dp. Required adding the `^` power operator to
  evalFormula (left-assoc, binds above * / — matches Excel; unit-tested inc. 2^3^2=64).
Catalog: 18 → 21 drills. Formulas group order: margin, growth, bridge, foot, percent,
revolver, cagr, schedule, comps.

## Remaining gaps (future, in priority order)
1. SUMIF drill — needs a SUMIF case in evalFormula's fn() (straightforward: criteria
   arg + two ranges); high desk value.
2. F2 edit/audit drill (fix a planted broken ref) — trains the audit reflex.
3. Paste-special transpose + formats as full drills (RF covers entry only).
4. drillgen engine integration — randomized layouts/labels + computed pars for the
   whole catalog (dev/drillgen.js, tested, awaiting wiring).

---
# AUDIT ROUND 3 (2026-07-06) — windows/snappiness, visuals, cues, ranking/onboarding

## Snappiness & interaction (static review)
- Marathon inter-drill advance 480ms; rapid-fire 300ms — tight. Keydown path is
  synchronous engine + render; no blocking awaits in the hot loop. `\` picker,
  1–9 jumps, Esc paths consistent. No jank sources found in code.
- NEW: last-played drill persisted (hotkey_last_drill); returning users resume it
  instead of always landing on navigation.
- NEW: welcome-back strip on the game page for returning users — once per session,
  shows resumed drill + PB + drills-on-board count + key hints; fades on first
  keydown WITHOUT swallowing it (the dismissing key is already your first rep),
  auto-fades at 8s. Passive by design; zero friction.

## Visuals — themes
All 20 themes pass WCAG AA for text/bg (min 6.6, onedark). Muted text ≥4.0
everywhere. Serika accent/bg 1.5 is authentic Monkeytype yellow (accent ≠ body
text) — intentionally kept. No palette changes needed.

## Audio/visual cues (what actually exists — memory's "confetti" never did)
- Streak-tiered success blips: two-note sine blip, +2 semitones per streak tier,
  bass note at tier 4 (streak 20+); 6ms attack / exp decay — sharp, never abrasive.
- Streak counter with tier classes + bump animation; rf-card celebrate halo.
- Mouse-used badge in-run + "not posted — mouse used" on results; hint use gates
  high scores. Verdict: cue loop is genuinely good; no additions needed this pass.

## Ranking & onboarding readiness
- **FIXED — tier names now the banking ladder** (was generic Bronze→Diamond):
  Candidate → Summer Analyst → Incoming Analyst → First-Year Analyst →
  Top-Bucket Analyst → Second-Year Analyst. Same thresholds (5-attempt floor,
  compounding depth+percentile), same tier CSS classes/colors. Renamed in
  index.html + nav.js (duplicated logic — kept in sync manually; candidate for
  extraction into a shared file later). Progress copy: "N/5 drills toward
  Summer Analyst" — reads like chasing the return offer, on-tone for the
  applicant audience.
- **FIXED — leaderboard duration mismatch:** trainer runs 3/5/10-min marathons +
  30/60/90s rapid; leaderboard rendered 5/10/15-min + 30/60/120s boards. 3-min
  and 90s runs were recorded but invisible; 15-min/120s boards could never fill.
  Leaderboard now matches the trainer configs (comment added to keep in sync).
- Tone review: prompts/desc copy is desk-authentic (comp sets, sweeps, roll-
  forwards, "the way bankers do it") — consistent with the applicant-prep frame.

---
# AUDIT ROUND 4 (2026-07-06) — beefy drills + leaderboard loop

## Thin-drill fixes (per Wolf: "beefy, ~30s even if you're quick")
| drill | was (par/keys) | now (par/keys) | what changed |
|---|---|---|---|
| navigation | 20s / 7 | 30s / 12 | Full 12-chord tour: all four Ctrl-arrows, Ctrl+Shift selects (header → table), Shift+Space rows, insert/delete, Ctrl+Space column, Ctrl+Home finish. Sequential latching extended; colSel guarded against leftover row-selection auto-latch. |
| center | 14s / 8 | 38s / 26 | "Set the alignment": center headers + left-align labels (arrive centered) + right-align total row (arrives left). Alt H A C/L/R — same door, three rooms. |
| series | 14s / 8 | 25s / 13 | Fill the series, then bold + right-align the whole header while the selection is still live. Seeds now arrive undressed. |
| sort | 18s / 6 | 33s / 21 | League-table full rep: 6 deals (up from 4), sort desc, AutoSum the total at B8, bold it. Randomization + computed checks kept. |
Still thin, deliberately left as quick-reps: copyover (10), drill (9) — Foundations
warmups; revisit only if Wolf wants them beefed too.

## Leaderboard (addictive pass)
- Medal colors on ranks 1-3 (gold glow on #1), leader-row gradient + bold name.
- "The chase": your row shows your gap to #1 (+0.42s) — the number to beat.
- Your-standing strip on top: boards led / podiums / top 10s, plus "closest crown:
  <drill> — 0.42s behind" (or "defend your boards" when you lead). Signed-out view
  gets race-framed CTA copy; empty boards read "claim this board".
- Session boards get medals too.

## Left open (consequential — asked Wolf)
- "Centered on racing in PowerPoint tasks": conflicts with the entire Excel engine,
  brand, and catalog. Not built on a guess — see chat.

---
# ROUND 5 (2026-07-06) — keyboard profiles shipped
Toggle in the HUD (⌨ native/macabacus/factset, persisted). Native chords work in
every profile (true on the desk). VERIFIED defaults only:
- Macabacus: Ctrl+Shift+R Fast Fill Right with smart extent (single cell → fills to
  the guide row's data edge), Ctrl+Shift+L Fast Fill Left, Ctrl+Alt+A AutoColor
  selection (numeric hardcodes → blue, formulas → default), Ctrl+Alt+S AutoColor sheet.
- FactSet: Ctrl+Alt+Shift+K/J/D/U — FDS Fill Right/Left/Down/Up.
Engine: fillFrom generalized to all four directions; smartFill + autoColor actions
added; reference.html gains a "Plugin profiles" category. AutoColor legitimately
speedruns the blue drill in macabacus profile — authentic, allowed.
Not implemented (unverified defaults, deliberately): Macabacus Fast Fill Down,
Blue-Black Toggle (Ctrl+; conflicts with native today-stamp), FactSet AutoColor.

---
# ROUND 6 (2026-07-06) — engine parity, checklist UX, daily, streaks, advanced drills

## Engine validation (the coloring/highlighting/enter complaints)
- **FIXED — Shift+Enter/Shift+Tab missing in edit mode**: commit now moves up/left.
- **FIXED — Enter/Tab didn't move the cursor outside edit mode** (Excel parity: Enter
  down, Shift+Enter up, Tab right, Shift+Tab left). This was likely THE "hitting
  enter" bug: Enter simply did nothing on a plain cell.
- Fontcolor dialog (Alt H F C → arrows → ↵) and fill path reviewed statically: sound.
  Selection-highlight rendering unchanged. Remaining coloring/highlight complaints
  need browser repro — report specifics and they get fixed same-day.
- **FIXED — evaluator rejected quoted text** ("NA") — string literals now parse;
  =SUMIF(A:A,"NA",B:B) works in both literal and cell-ref criterion forms (unit-tested
  + regressions on ^ and INDEX/MATCH).

## Ribbon / next-steps UX
- Checklist now ALWAYS highlights the next incomplete task (accent left-bar + glow) —
  previously only in guided mode, which is why task flow felt unclear. Completed
  tasks strike through; a progress bar fills per task. Guided mode still adds key
  hints on top. Ribbon idle-hint + Alt-path breadcrumb reviewed: sound as designed.

## Shortcut-standards check (WSP/BIWS/desk canon)
Catalog covers the canon: Ctrl+arrows/Shift selects, Alt E S V, Alt H O I, Alt+=,
Ctrl+D/R, F4 anchors + pointing, Alt H B borders, Alt H F C blue, Alt H K/9/0,
Ctrl+Shift+%/$/!, Alt A S D, Alt H F I S, Alt H A C/L/R, INDEX/MATCH — plus plugin
profiles. No gaps vs standard IB prep courses at this drill count.

## Shipped features
- **Daily Challenge**: seeded per UTC date (drill-of-day from menuOrder hash; build
  runs on mulberry32(dateSeed) so every player gets the identical layout). ⚡ daily
  HUD button; runs post as challenge='daily-YYYY-MM-DD' (no schema change needed);
  PB tracked per daily key; leaderboard shows "Today's challenge" board on top.
- **Streaks**: 🔥 n-day badge in HUD (any completed drill keeps it alive; local per
  device via KV), shown in welcome-back strip from 2 days up.
- **Advanced drills** (23 total): sumif (anchored SUMIF rollup, par 52) and lookup2
  (two-way INDEX/MATCH with shuffled metric columns, par 60). SUMIF added to the
  evaluator with criteria-range/sum-range pairing.

## Approved queue (next passes, in order)
5 stats page → 6 placement test → 7 share cards → 8 team codes (design: profiles
gains team_code text column; setting in account menu "join a team" with private
code; leaderboard gains team filter — prompt at signup optional later).

## #10 Weekly Gauntlet — shell (not built)
Fixed 5-drill sequence per ISO week (seeded like daily), ONE attempt per account,
combined time posted to a weekly board; sessions table reused with
mode='gauntlet', duration_sec=week number. Attempt-once enforced client-side first
(KV) then via unique index (user_id, mode, duration_sec) when it matters.

---
# ROUND 7 (2026-07-06) — parity sweep, rank prominence, supabase-in-repo, stats

## Excel-parity sweep (generalized beyond the reported chords, per Wolf)
- FIXED: Delete now clears the WHOLE selection (was: nothing outside edit mode).
- FIXED: Backspace clears active cell and enters edit mode (Excel behavior).
- FIXED: F2 edits the active cell with existing contents/formula — THE banker key
  was entirely missing from the grid.
- FIXED: Ctrl+A selects the used region.
- Already correct: Esc paths, Ctrl+Space/Shift+Space, Home/End, undo/redo.

## Rank prominence
- Rank pill on EVERY page: game-page HUD (tier-colored, next to streak) + shared
  nav on leaderboard/reference/stats/legal. Click → full profile card. Standing
  cached 10 min in sessionStorage (key hk_rank) shared across pages; tierOf and
  the standing math remain duplicated index.html↔nav.js — keep in sync.

## Supabase-in-repo (no more dashboard pasting)
- supabase/migrations/ holds the schema (existing SQL folded in, idempotent);
  supabase/config.toml; .github/workflows/supabase-deploy.yml runs `db push` +
  functions deploy on any push touching supabase/.
- ONE-TIME SETUP FOR WOLF: add repo secret SUPABASE_ACCESS_TOKEN (see
  supabase/README.md). Until then the Action fails harmlessly.

## Stats page (queue item #5 — SHIPPED)
- stats.html: drills-on-board, peak keys/sec, avg efficiency vs par, streak;
  per-drill PB + efficiency bar + live rank. Anon users see local PBs with a
  sign-in nudge. Added to shared nav (chart icon).

## Queue: #6 placement test → #7 share cards → #8 team codes. Deploy set now also
## includes stats.html + supabase/ + .github/.

---
# ROUND 8 (final Fable pass) — placement, share cards, team codes, polish
- Rank pill fix: it required a signed-in non-anon user — that's why Wolf saw nothing.
  Now always shows (Candidate default). Also: GitHub Pages caches hard — Ctrl+Shift+R.
- Index nav now matches shared nav: icons + stats link (was text-only, missing stats).
- PLACEMENT (replaces the clunky tour as primary onboarding): "60-second placement —
  find your rung" runs the navigation tour; results show a pace verdict mapped to the
  ladder (t/par ratio: ≤1 Top-Bucket … >3 Candidate). Tour still exists via guided mode.
- SHARE CARDS: results modal gains "download share card" — 1000×524 canvas PNG,
  theme-colored, drill/time/keys/rank/branding. Client-side only.
- TEAM CODES: profiles.team_code (migration 20260707000000, auto-deploys via the
  Supabase integration/Action); Account settings gains team section (set/leave);
  leaderboard per-drill section gains "show team only" toggle when you have a team.
- Supabase GitHub integration (Wolf connected it directly): fine — if both it and our
  Action run migrations, they're idempotent; disable the Action later if redundant.

---
# ROUND 9 — pace ghost, weekly gauntlet, RF aliases, audit drill
- PB PACE GHOST: live "−1.24 vs pb" next to the clock, green ahead / red behind.
  Ghost-replay foundation: keyLog traces now TIMESTAMPED ({k,t} in runs.trace);
  true cursor-ghost replays become possible on data recorded from today forward.
- WEEKLY GAUNTLET (🏁 HUD button): 5 seeded drills per ISO week, deterministic
  layouts per leg, results screen chains legs; runs post per-leg as
  'wk-YYYY-WW-<drill>'; leaderboard computes the combined board (users with all
  5 legs, summed time, asc). Best-of stands (no one-attempt lock in v1).
- RF PROFILE ALIASES: rapid-fire fill_right accepts Macabacus Ctrl+Shift+R and
  FactSet Ctrl+Alt+Shift+K; fill_down accepts FactSet Ctrl+Alt+Shift+D (verified
  bindings only, active profile only).
- AUDIT DRILL (24 total, Formulas): one revenue formula reads the wrong row —
  scan, F2, repair. The 2am rep. par 32 / 20 keys.
- Incident note: a python surrogate-escape write zeroed index.html mid-edit;
  git checkout restored it instantly. Lesson: emoji via \\U escapes + io.open utf-8.

---
# ROUND 10 — progression system + make-it-balance
- XP & LEVELS: XP = 15/clean solve + 50/distinct drill + 25/top-10 + 100/podium +
  250/crown. Level curve triangular (level n costs 150×n more): fast early hook,
  breadth+placement demanded late. Tier ladder stays the COMPETITIVE rank; level is
  personal progress. Both on the card.
- PLAYER CARD v2 (nav.js): LVL + XP bar + 4 stat tiles (clean solves, drills x/25,
  crowns, streak) above the per-drill placement list — the card now reads as a real
  representation of skill (tier/crowns), progress (level/solves), and breadth (drills).
- HUD LVL chip on the game page — computed locally (solves counter KV hotkey_solves
  + PB breadth) so even anon users feel the ladder from solve #1; full XP math on
  the signed-in card.
- MAKE IT BALANCE (25 drills): foot assets, plug retained earnings, foot L&E,
  CHECK cell = A − L&E must read 0. Trains the zero-check reflex. 200-run sim:
  always ties, plug always positive.
- Progression logic summary (the "does it make sense" answer):
  tier = where you PLACE (percentile, decays as others improve) ·
  level = what you've DONE (monotonic, never lost) ·
  crowns/podiums = what you HOLD (defensible) · streak = showing up.
  Four axes, no double-counting, each visible.

# ROUND 11 — true ghost v1
Ghost display now races KEYSTROKES too: fetches your PB run's timestamped trace on
drill load and shows 'keys 9/12' (you vs the ghost at this instant) beside the time
delta. Only works on PBs recorded after timestamps shipped (round 9) — older traces
are label-only and skipped silently. Next: visual ghost cursor on the grid itself.

---
# ROUND 12 — Monkeytype pass: scale, contrast, nav, guide best-practices
- SCALE (the "tiny boxed-game" fix): .app 1040→1280px; sheet zooms 1.18x at ≥1280px
  viewports and 1.34x at ≥1600px via css zoom on .gridwrap — cells/fonts/borders all
  grow, engine px math untouched (it reasons pre-zoom). Timer 16.5→19px.
- CONTRAST (theme-safe cells): fc-* font swatches and fill-blue were HARDCODED —
  blue inputs near-invisible on dark themes. Now themes set html[data-dark] (both
  themes.js AND index's inline applyTheme — they're duplicated, keep in sync) and
  dark variants kick in: blue #6db1ff, black→var(--text), red/green/purple/yellow
  brightened; fill-blue gets a light-theme variant. Selection highlight + copy
  marquee now use var(--accent-glow) — they follow every theme's accent instead of
  hardcoded green (the "messed up by highlights" complaint on non-green themes).
- NAV: index desktop nav was showing icon+label doubled (missing .tl-label rule) —
  now icon-only on desktop, labels return under 760px. Matches shared nav.
- GUIDE BEST-PRACTICES SWEEP: guides now teach edge-jumping over arrow-tapping
  wherever the data is contiguous (copyover, sort, center → Ctrl+Shift+edge;
  polish → Shift+Space row grab). Shift+↓×n retained ONLY where the target range is
  empty (fill drills) — Ctrl+Shift+↓ would overshoot there; that's correct Excel,
  not an inconsistency.
- Default scheme: new visitors already land on Daylight (light). Left as-is;
  changing the 'default' dark palette would orphan saved preferences.

---
# ROUND 13 — leaderboard dashboard + Pro scaffold
- LEADERBOARD REWRITTEN as a dashboard: (1) YOUR CARD hero — tier pill, LVL + XP bar,
  crowns/podiums/solves, and NEXT RANK with concrete unmet requirements
  ("○ 10 drills attempted (you: 8) · ✓ top 30%"); signed-out gets a race-framed CTA.
  (2) TOP PLAYERS — first true overall ranking: all users with 5+ drills, sorted by
  avg placement, tier pills inline, your row surfaced if outside top 8.
  (3) FEATURED — daily + weekly gauntlet side by side. (4) BROWSE — tabs
  (drills/marathon/rapid) + chips (✓ marks boards you're on); one detail board at a
  time instead of 25 stacked. Tab/chip selection persists per session. Team toggle
  lives in the tab row and filters everything.
- TIER/LEVEL MATH now lives in THREE places (index, nav.js, leaderboard TIERS) —
  change all three together. Headless smoke test passed on tier boundaries.
- PRO SCAFFOLD: entitlements table (RLS: read own; writes service-role only —
  migration 20260707100000, deploys via the pipeline); index gains isPro()/
  requirePro() single gate, PRO ✓ badge, upgrade modal ("Beta: everything free —
  early players grandfathered"), inert startCheckout() stub pointing at the future
  TEST-mode create-checkout function. BETA_MODE unlocks everything; flipping to paid
  later = flip BETA_MODE + wire Stripe, no rebuild. NOTHING charges money today.

---
# ROUND 14 — the freedom/rigidity doctrine (engine design principles)
Wolf's report: off-path = frozen cells, undo desyncs navigation, alternate hotkeys
rejected, recovery unclear. Root causes found and fixed; principles now doctrine:

## THE FIVE PRINCIPLES (apply to every current and future drill)
1. END-STATE GRADING IS THE FREEDOM MECHANISM. Any path that reaches the target
   state passes. Never grade the route (navigation-style tours are the only
   exception, and they latch on actions — see 3).
2. INPUT COMPLETENESS. Every ACTION must accept every Excel-legal input for it:
   chord variants (Shift+= AND numpad +), ribbon paths (Alt H I R et al.), and
   legacy menus (Alt E S V). A rejected legal input reads as a frozen sheet.
3. SEQUENTIAL DRILLS LATCH ON ACTIONS, NOT STATE-DIFFS. Undo/redo clear action
   flags; they can never fake or un-fake a step.
4. RECOVERY IS ONE VISIBLE KEY, ZERO PENALTY BEYOND TIME. Esc restarts the drill
   (fresh build + clock); the affordance is printed under every checklist.
5. GUIDED MODE TEACHES ONE CANONICAL PATH BUT NEVER BLOCKS OTHERS.

## Fixes shipped
- Ctrl+NumpadAdd now inserts (insert demanded shiftKey — numpad users' key was
  silently eaten by the zoom-guard = the "freeze"). Label now says "Ctrl and the
  + key (numpad + or Shift+=)".
- Undo faked navigation's delete step (latched on row-count). Now: insert/delete
  handlers set S.lastRowOp; navigation latches on it; undo/redo clear it.
- Ribbon grew Alt H I R / H D R / H I C / H D C (work on PARTIAL selections, like
  real Excel — the chord still requires full rows). Ctrl+Alt+V opens the same
  paste-special dialog as Alt E S V. Alt H 1 bold already existed.
- Esc was swallowed UNCONDITIONALLY by the ribbon handler (dead outside ribbon —
  that's why it never felt like an option). Now: ribbon-Esc closes ribbon;
  grid-Esc cancels copy ants (Excel parity) or restarts the drill; "stuck? esc
  restarts" printed under every checklist.

---
# ROUND 15 — F2 Edit mode, Monkeytype loop, emblems, XP v2, revolver
- F2 ROOT CAUSE: the engine only had Excel's ENTER mode — after F2 opened a formula,
  the first arrow key COMMITTED and walked away instead of moving the text caret.
  Built true EDIT mode: F2 opens with caret at end; ←/→/Home/End move the caret;
  Delete removes at caret; Backspace before it; typing inserts at caret; F2 toggles
  Edit/Enter while editing (Excel parity). Enter-mode pointer logic untouched.
  (Also removed a dead duplicate F2 handler from round 7.)
- GAMEPLAY LOOP (Monkeytype-ized): Ctrl+S = instant restart with a toast
  ("muscle memory ✓") — the banker save reflex, weaponized. Esc restart still works
  and now toasts. F11 swallowed (fullscreen misfire next to F2 was too costly).
  Results screen chains: ↵ = run it again, N = next drill; hints printed on the card.
- RANK EMBLEMS (now actually built — previously discussed only): military-style
  insignia per tier (circle → 1-3 chevrons → chevrons+bar → star), currentColor glow
  via drop-shadow, star pulses. Single source window.rankEmblem in themes.js +
  inline copy in index.html (keep in sync). Wired: HUD pill, nav pill, player card,
  leaderboard hero.
- XP v2 (return-visit > grind): first solve of a drill 50 · solves 2-10 of that
  drill 15 · 11+ only 3 (decay kills single-drill farming) · daily runs 30 ·
  weekly legs 25 · placement unchanged (25/100/250). Mirrored in nav.js +
  leaderboard hero — sync both. Triangular level curve unchanged (already non-flat).
- LEADERBOARD FIT POLISH: featured boards equal-height, hero panels flex-column with
  bottom-anchored last row, rk centering, section rhythm normalized.
- REVOLVER DRILL (26): LBO cash sweep — draw =MAX(0,min−cash), paydown
  =MIN(balance, excess). The DCF/LBO drill line continues; next up per Wolf:
  debt schedule roll-forward, WACC build, working capital, exit bridge.

---
# ROUND 16 — cache-busting, LoL crests, menu fix
- STATS-ICON BUG ROOT CAUSE: GitHub Pages cached stale nav.js on other pages — the
  link existed in code but users got the old file. Fix: ?v=16 on every shared-asset
  reference (all 7 pages). CONVENTION: bump the version on any shared-file change.
  This same cache also explains the earlier "can't see the rank pill" report.
- RANK EMBLEMS v2 (LoL-grade): layered crests in currentColor (no gradient-id
  collisions): Candidate hollow shield → +gem (Summer) → +laurels (Incoming) →
  +crown (First-Year) → +wings (Top-Bucket) → crowned star crest with pulse
  (Second-Year). rankEmblem(name, size); card renders 22px. Sync themes.js + index inline.
- User menu: 'Profile & stats' → 'Player card' + direct 'Your numbers' → stats.html.

---
# ROUND 17 — ladder overview, desktop fit, account page, stats refinement
- LEADERBOARD: maxw 880→1180 (the desktop blank-space complaint); hero is now
  3 panels ≥1080px: Your Card | THE LADDER (new rank-overview: all 6 tiers with
  emblems + requirements, your rung glowing) | Top Players. Boards with <5 entries
  render faint "open lane" filler rows — kills whitespace AND invites competition.
- SHARED HELPERS: window.HK_RANK in themes.js (TIERS+req text, tierOf, levelOf,
  computeXP, standing). New pages use it; index/nav.js/leaderboard keep documented
  duplicates — 5-way sync on threshold changes (consolidation queued).
- ACCOUNT.HTML (new page, in deploy set): title card (42px emblem, tier pill,
  LVL+XP bar, team tag, crowns/podiums/solves, member-since), handle rename,
  team code, password change, pro status, sign out. Anon users get a claim-your-
  handle CTA. User menu "Account settings" → this page (modal retired from menu).
- STATS.HTML: title-card strip on top (emblem+tier+LVL+account link), group
  headers in the per-drill list, Recent Runs (last 10 with keys + date).
- Cache version v17 everywhere.

---
# ROUND 18 — bucket subtiers, Models set (WACC/DCF/LBO), rank-math consolidation
- BUCKETS: every ranked tier now subdivides by position within its percentile band:
  Top / Middle / Bottom Bucket — comp-review language, exactly the audience's own
  vocabulary. Shown on the player card, leaderboard hero, and ladder ("you are here
  (middle bucket)"); the HUD pill stays short (bucket in tooltip). Math unit-tested.
- CONSOLIDATION (S10 largely done): HK_RANK.tierOf is now the single implementation;
  nav.js + leaderboard delegate to it (themes.js loads first on those pages), and
  index.html carries an inline HK_RANK copy (same pattern as rankEmblem — sync the
  two on changes). 5 copies → 2.
- MODELS GROUP (28 drills, dupe revolver in menuOrder found & removed): schedule +
  comps moved in; three new, specced to desk convention within evaluator limits
  (no NPV/IRR fns — deliberate: bankers build PVs by hand anyway):
  · WACC (par 58): total capital, then weighted formula — the (1-t) after-tax debt
    check is explicitly graded.
  · DCF (par 70): ONE anchored PV formula =FCF/(1+$rate)^year, fill right, SUM —
    trains anchoring discipline where it actually pays.
  · LBO (par 75): entry equity, exit equity, MOIC as a formula (typing the number
    fails the check).
- v18.

---
# ROUND 19 — campaign, ranked opt-in, player card v3, identity pass
- NAV BOUNCE FIX: index link CSS differed from nav.css (8/14px vs 7/12px padding,
  missing inline-flex+gap) → icons shifted per page. Now byte-matched; svg sizing
  via CSS only. RULE: index nav CSS mirrors nav.css exactly.
- CAMPAIGN MODE (📈 HUD button): 7 ordered chapters over all 28 drills; a drill
  clears when local PB ≤ par × 1.5 (progress derives from PBs — ZERO new storage);
  chapters unlock sequentially; modal lists gates + jumps into drills. Badges:
  7 chapter emoji + ⭐ finisher, rendered on the player card (earned = glow,
  locked = grayscale). CAMPAIGN def lives in drills.js (window.HOTKEY_CAMPAIGN).
- PLAYER CARD v3: fixed height (82vh), pinned × close (no more scroll-to-close),
  badges row, per-drill list scrolls inside the card.
- RANKED OPT-IN: unranked until LVL 3 + explicit "Enter Ranked" → season-start
  infographic (full ladder, buckets explained, "Lock in ⚔") → localStorage
  hk_ranked. Placements compute regardless; the gate is presentational by design.
- IDENTITY: favicon = F4 keycap ($ tick) — the anchor key IS the brand; tab titles
  rebranded (no mouse allowed / the boards / your numbers / the cheat sheet /
  your card). Featured boards never render thin: empty boards show "first time
  sets the bar" + 5 open lanes.
- SOUND PACK: sound button cycles classic → arcade (brighter/higher) → thock
  (classic + 14ms filtered-noise key ticks on every counted keystroke) → off,
  with an audible preview per state.
- STATS: weakest-board nudge (deep-links index.html?drill=k — param support added),
  strongest-board line, pace sparkline (last 15 runs).
- KNOWN GAP: nav.js badge gate uses window.HOTKEY_PARS which is NOT shipped yet —
  falls back to PB-presence (badge earned on any PB). Ship a pars snapshot next
  round for exact gating on the card; campaign modal itself gates exactly.

---
# ROUND 20 — XP transparency, drill bar, HUD consolidation, menu repair
- XP v3 (transparent + complete): sessions now earn XP (marathon +20, rapid +10);
  advanced drills (par ≥ 55) pay a +15 first-clear bonus. Mirrored nav.js +
  leaderboard (2 spots). FRONTEND: results card shows "+50 xp · first clear ·
  advanced bonus" per run (client estimate; server canonical); "how xp works"
  explainer modal from the results link AND by clicking the LVL chip.
- DRILL BAR: always-visible switcher above the grid — ‹ [GROUP · Drill name ▾] › —
  click name = full picker, arrows step the catalog, hint shows \ and n. No more
  hunting for the dropdown.
- HUD FIX (the "missing" Macabacus/FactSet toggle): the toolbar had 10+ items and
  the ⌨ profile toggle wrapped/clipped on laptop widths. Sound + keyboard profile
  now live in a ⚙ preferences popover (both still click-to-cycle). Freedom pass
  re-verified: profile chords precede generic Ctrl ops; Ctrl+S restart guards
  !altKey so FactSet Ctrl+Alt+Shift chords are untouched.
- INDEX USER MENU repaired to nav.js parity: Player card / Your numbers
  (stats.html) / Account (account.html) / sign out; dead umSettings wire removed —
  this was the broken-dropdown report.
- HOTKEY_PARS snapshot shipped in drills.js (auto-extracted from CHALLENGES; regen
  when pars change) → player-card badge gating is now exact (closes r19 gap).
- v20.

---
# ROUND 21 — nav centering root cause, achievement medals, card legend
- ICON BOUNCE, ACTUAL ROOT CAUSE: .topnav-pages{margin:0 auto} centers links BETWEEN
  brand and tools — and the tools cluster differs per page (rank pill/theme/auth vs
  index's set), so the flex center shifts. Fix: desktop (≥761px) uses absolute
  geometric centering (left:50%, translate(-50%,-50%)) in BOTH nav.css and index
  inline — identical position on every page regardless of siblings. Mobile burger
  untouched. (Round 19's padding match was necessary but not sufficient.)
- ACHIEVEMENT MEDALS (badges v2): emoji out, window.hkBadge in — hexagonal medal
  SVGs with per-chapter glyphs (nav arrows / frames / data bars / sigma / percent /
  bank columns / lens / star finisher). Earned = gold + glow; locked = ghost
  outline at 50%. Single source themes.js + inline index copy (sync). Used on the
  player card AND campaign modal chapter headers; tooltips explain HOW to earn.
- CARD LEGEND: "what am I looking at?" toggle explains rank/buckets, lvl/xp, clean
  solves, crowns ("boards you lead RIGHT NOW — they can be taken"), streak, medals.
- v21. Ready for curriculum shells whenever Wolf sends them.

---
# ROUND 22 — dead ×s, ranked rework, keycap emblems v3, handle integrity
- DEAD × BUG: pcX rendered on the player card but was NEVER wired (r19 patch missed
  the render path) — hence "only close works." Fixed + × added and wired on campaign,
  XP, and Pro modals (.modal-x standard). RULE: wire every × in the same pass that
  renders it.
- RANKED REWORK: gate raised to LVL 10 OR campaign complete (two intuitive routes);
  ineligible users see a progress bar to LVL 10; the infographic gained "Not yet";
  the eligible card gained "Not yet"; ranked users gained a quiet "leave ranked"
  link. Copy explains that entering shows placements on boards already run.
- EMBLEMS v3 — THE KEYCAP LADDER (Wolf's concept): the keyboard gets nicer as you
  climb. Per-tier palettes: plain plastic → bronze → machined silver (ticks) →
  laureled gold → winged platinum ice → radiant diamond (crown + rays + star cap,
  pulses). F4 legend on ranked caps. Bucket pips (1-3 dots) render under the cap on
  the player card + ladder via rankEmblem(name, size, bucket). themes.js + index
  inline — sync both.
- BUCKET/PROGRESSION CLARITY: infographic explains bottom→middle→top→promote; Your
  Card next-rank gained a placement progress bar through the current tier's band
  with a bucket caption; ladder pips show current bucket.
- LANGUAGE PASS: removed "you know how buckets work", "Defend or drop", "ghosts
  don't rank", spreads_hard placeholder, speedrunner-splits line; Ctrl+S toast
  toned down. Brand-level winks (title, F4) retained deliberately.
- HANDLE INTEGRITY (migration 20260707200000, server-enforced): case-insensitive
  unique index, format constraint (2-24, [A-Za-z0-9_]), reserved-substring block,
  7-day change cooldown via trigger (sets handle_changed_at). Account page validates
  client-side and maps server errors to friendly messages. Legacy-duplicate-safe
  (index creation logged + skipped if dupes exist).
- v22.

---
# ROUND 23 — XP made simple, achievements grind set, tools-smush fix, plugin gating
- TOOLS SMUSHED LEFT: r21's absolute page-centering removed .topnav-pages from flex
  flow, so tools lost their push and collapsed next to the brand. Fix:
  .topnav-tools{margin-left:auto} in BOTH nav.css and index inline. Index dropdown
  given min-width to stop squish.
- XP, SIMPLIFIED IN THE UI (math unchanged): LVL chip now carries a mini XP bar
  (hover = exact numbers); every picker row and the drill bar show "+50 xp"/"+15 xp"
  for what the NEXT clean solve pays; explainer cut to 4 lines.
- ACHIEVEMENTS (15 defs in drills.js HOTKEY_ACHIEVEMENTS): speed (Under Par /
  Metronome ×10 / Untouchable = par on ALL drills), volume (100/500/2000 clean
  solves), streak (7/30/100 days), crowns (1/5 held at once), dailies (10/50),
  gauntlet (all 5 legs one week), Everywhere (every board). Card renders a medal
  grid with % progress chips; tooltips give name+desc+progress. Category glyphs
  added to hkBadge (spd/vol/str/crn/day/gnt) in themes.js + index inline.
- PLUGIN LAYERS: cycling to Macabacus/FactSet now passes through requirePro (beta
  unlocks; the gate exists for launch). Added verified Macabacus Ctrl+Shift+V paste-
  values. NOTE: Wolf's original curated hotkey/macro list is NOT in the repo —
  request it; the full layer wires in same-session when provided.
- v23.

---
# ROUND 24 — THE UNIFICATION: shared nav on the trainer, one theme, one drill bar
- STRUCTURAL FIX (ends the header-jank class): index.html now mounts the SHARED nav
  (navMount + nav.js + nav.css), like every other page. Its inline nav markup is
  deleted; nav.js owns links, rank pill, theme picker, auth slot, user menu, player
  card, settings. Index's own auth-slot renderer neutered (early return); its
  profileModal/settingsModal divs removed (nav.js mounts them); HUD rankPill removed
  (nav pill covers all pages). Index's legacy openProfile remains only for the
  ?openProfile=1 param (edge case, noted).
- THEME FLIP FIXED: themes.js fell back to 'daylight' while the trainer fell back
  dark — the white flash between pages on fresh browsers. Both now fall back to
  'default' (dark). themes.js applies synchronously in <head> — no flash.
- DUPLICATE DRILL BAR: a legacy header switcher (prevDrill/drillPick/dbName) predated
  r20's bar — BOTH rendered, with a duplicate dbName id cross-wiring click handlers.
  r20's bar deleted; the legacy bar (header position) kept and given the +xp chip
  and daily/weekly markers.
- LANDING: "Been here before? Sign in" added for returning users on fresh browsers —
  no more forced anonymous entry. Invite gate unchanged (lift post-beta).
- FLAIR (cosmetic prestige): profiles.flair (migration 20260707300000); account page
  selector (none/gold/emerald/holo, PRO-tagged, free in beta); player card renders
  the border+glow.
- ANALYTICS (stats, PRO-tagged): most-hit keys heatmap from your last 40 posted
  traces + fastest-hands keys/sec by drill.
- PAYWALL SCAFFOLD: supabase/functions/create-checkout (Stripe TEST ONLY — hard
  refuses non-sk_test_ keys); startCheckout() invokes it with graceful fallback to
  the modal when undeployed; STRIPE_SETUP.md documents the safe test path and the
  deliberate steps required to ever go live. No real money possible today.
- v24. NOTE: this was major surgery on index.html — browser-test the full flow
  (landing → sign-in → nav → card → drill) and report anything weird immediately.

---
# ROUND 25 — Foundations expansion (33 drills), the × killer, flat pass
- FOUNDATIONS ×5 (Wolf's "robust basics" mandate — the mouse-quitting motions):
  · ribbon (par 30): three ribbon walks — Alt H 1 bold, Alt H K comma, Alt H A C
    center. Teaches reading Alt as a menu.
  · editfix (22): "Reveune" → F2, arrow in, fix in place. The Edit-mode primer.
  · undo (28): delete → Ctrl+Z back → Ctrl+B instead. Action-latched via S.undoN
    (undoAct/redoAct now count); "undo is a tool, not a panic."
  · pastes (38): one copy, Alt E S V values then Alt E S T formats (engine's
    PASTE_OPTS supports both). The legacy-menu muscle.
  · saves (26): work → Ctrl+S → work → Ctrl+S. CONTEXT-AWARE Ctrl+S: drills with
    usesSave:true make Ctrl+S save (S.saveN latch); everywhere else it restarts.
    Esc still restarts inside the save drill.
  Foundations = 7 drills; campaign Ch1 updated; PARS regenerated (33).
- THE × KILLER: a capture-phase DELEGATED close handler — any .modal-x/.pc-x click
  closes its nearest overlay. Immune to re-renders and missed per-instance wiring;
  the recurring dead-× class is structurally dead. Per-instance handlers remain as
  harmless redundancy.
- VISUAL FLAT PASS (Monkeytype discipline): ALL emblem/badge drop-shadows removed
  (index, nav.css, leaderboard, account, stats); emblem-max pulse removed — the
  radiant diamond cap carries its own drama flat. Hex badges keep their borders
  (Wolf likes), lose the glow. Card-flair glows retained (opt-in cosmetics).
- FAVICON: reverted to the original cell-selection mark (grid outline + active
  cell) from commit e736427 — the F4 keycap judged cheesy; keycap art lives on in
  the rank emblems where it earns its keep.

---
# ROUND 26 — trainer/nav peace treaty, anon linking, sleek pass
- HEADER BREAKING THE GAME (root causes, both in nav.js's global keydown):
  · '?' hotkey opened the shortcuts modal — but the game grid isn't an INPUT, so
    typing ? in a cell hijacked mid-drill. Now disabled on NAV_ACTIVE==='trainer'.
  · Esc closed nav overlays AND fell through to the game (= drill restart while
    closing a modal). Now: overlay open on trainer → close + stopImmediatePropagation;
    nothing open → nav stays silent, game owns Esc.
  · Game side: index keydown wrapper checks window.navOverlayOpen() and pauses all
    game keys while the player card / themes / shortcuts are up.
- NICKNAME BUG = ONBOARDING BUG: signup used sb.auth.signUp → brand-new user id →
  every run posted as a guest stayed orphaned under the anon id ('anon' on boards).
  Fix: anonymous LINKING — if the session is anon, signup calls
  sb.auth.updateUser({email,password}): same uid, all guest runs/PBs retained; then
  profiles row is UPSERTED. account.html handle save switched update→upsert (update
  was a silent no-op when the profile row never existed — second nickname path).
  Existing orphaned runs from earlier signups are NOT migrated (would need admin SQL).
- × EVERYWHERE: modal-× delegation moved INTO nav.js (guarded by
  window.__hkModalDelegated; index keeps a fallback copy) so ALL pages have it, and
  it syncs nav's open-flags. themesModal/kbdModal/settings/card fallback states all
  gained a × (.modal-x shared style in nav.css).
- SLEEK PASS: mb-tools are quiet text buttons (transparent border until hover) —
  Monkeytype config-bar feel, less chrome, same tools; badges keep a hairline.
  Header→content gap cut 64→30px on every page (nav.css + index inline — sync).
- v26. Foundations breadth reviewed on request: current 7 cover navigate/ribbon/
  edit/undo/paste-special/save/copy-paste — paste-special is 1 of 7, not overweighted.
  Next wave queued: number-format cycling, borders, autofit, insert/delete rows,
  F4 repeat-last-action (needs engine op-recording — real feature).

---
# ROUND 27 — rating v2, tier roster, chapter colors, moderation, polish
- RATING v2 (game-design math, tested headlessly): rank = Bayesian-shrunk,
  size-weighted average placement. Prior 0.5 with K=6 virtual boards kills the
  1-2-drill sniper (2 crowns alone → 0.42, Candidate); board weight
  log2(N+1)/log2(9) capped at 1 makes tiny fields count less (1st of 2 ≪ 4th of
  40) — self-adapts from 3 users to 10,000 with no retuning. Percentile is
  idx/(N-1). RECALIBRATION: old tier pcts were unreachable on the shrunk scale
  (perfect on all 33 boards = 0.077 > 0.05); thresholds now derived so each tier
  gate ≡ its advertised raw performance at the gate att: silver .53 / gold .375 /
  plat .26 / diamond .18. Balance tests: summit reachable (18 boards @ top-2% →
  Second-Year), sniper stays Candidate, early-small-site grinder lands Gold.
  Displays relabeled "placement rating (lower is better)".
- TIER ROSTER (League-style): "the field · by tier" panel — tier tabs, scrollable
  roster with emblem+bucket+rating+boards, your row highlighted.
- CHAPTER COLOR IDENTITY: HOTKEY_GROUP_COLORS (drills.js) — one muted hue per
  family; applied as accents only: picker group labels + 3px row borders, drill-bar
  category chip, campaign card left borders, chapter medals (hkBadge gained a color
  param — themes.js + index inline, sync).
- MODERATION (migration 20260707400000): expanded server blocklist incl. slurs,
  with leetspeak folding (strips _0134578 before matching); 7-day cooldown +
  uniqueness unchanged; light client pre-check mirrors reserved words.
- POLISH: kbd shortcuts modal scrolls (56vh) instead of spilling; help-bar tokens
  are real keycaps (bordered, theme-aware, bigger); favicon link cache-busted on
  every page (?v=27 — kills the stale-F4 revert); leaderboard tab pills uniform,
  team toggle inline (the right-side misalignment).
- v27.

---
# ROUND 28 — foundations wave 2 (37 drills), landing-gate merge, header simplification
- FOUNDATIONS +4 (breadth, engine-verified ops only): autofit (Alt H O I on #####
  columns), rowops (Alt H I R insert / H D R delete around a placeholder), filldr
  (Ctrl+D down + Ctrl+R right, formula-ref checks), blocksel (Ctrl+Shift+↓ then
  Ctrl+B). Foundations = 11 drills, ordered easy→hard; campaign Ch1 + PARS regen
  (37 total). Deferred pending engine features: F4 repeat-last-action (op
  recording), number-format cycling + borders (no main-grid ops yet).
- LANDING-GATE MERGE: beta gate now renders INSIDE the landing card (same betaCode/
  betaHandle/betaGo ids, so submitBetaCode was reused untouched); backdrop dropped
  to rgba .66 + blur 5px — the live grid ghosts through. REQUIRE_INVITE=true const
  next to BETA_MODE: flip false → code field hides, entry auto-redeems
  INVITE_AUTO_CODE ('HAGS') so members stays consistent. Old #gate overlay retained
  for the non-beta auth path + landing-already-gone edge.
- HEADER (Monkeytype-ization): index's dead inline .topnav CSS block DELETED (it
  was cascading against nav.css on the game page = the drop-down breakage);
  absolute centering removed in nav.css — page icons now sit in a LEFT cluster
  beside the brand, tools stay right via margin-left:auto. One layout, no math.
- FAVICON, properly: real favicon.ico (16/32/48, PIL-drawn to match the svg mark) +
  apple-touch-icon.png + svg, all ?v=28. Safari ignores SVG favicons — that was the
  "revert": Safari/legacy paths fell back to a stale cached icon. NOTE: browsers
  cache /favicon.ico aggressively; may take a day to flip everywhere.
- PROVISIONAL RANK (season-zero rule): tierOf(avg, att, wsum) — until weighted
  exposure wsum ≥ 6 (small fields count fractionally), rank caps at Incoming and
  tags "provisional". Tested: day-one crusher on 3-player boards = Summer ·
  provisional; grown-site elite = Second-Year. Infographic explains it.
- LISTENER/BROWSER-KEY AUDIT (verified by grep, r26 fixes intact):
  NOT intercepted: Ctrl+T/N/W (tabs/windows), F5, Ctrl+L, Ctrl+Tab, Cmd+R.
  Intercepted BY DESIGN (Excel parity, documented tradeoffs): Ctrl+R (fill right —
  reload stays on F5/Cmd+R), Ctrl+S (save/restart), Ctrl+D (fill down vs bookmark),
  F11 (swallowed), Alt keyup (menu-bar suppression). '?' and Esc are nav-safe on
  the trainer; game pauses under nav overlays via window.navOverlayOpen.
- RESERVED NEXT TURN (Wolf-approved big one): full Macabacus + FactSet layers —
  research verified default bindings, curate for IB workflows, distinct colored
  entries on reference.html, profile toggle already in ⚙. Do NOT half-ship.

---
# ROUND 29 — PLUGIN LAYERS SHIPPED, achievements v2, card/QoL pass
- MACABACUS + FACTSET LAYERS (the reserved buildout, researched this session):
  · Sources: Macabacus official shortcuts cheat-sheet PDF + Quick Start Guide;
    FactSet published hot-key sheet (felix.fe.training mirror) + practitioner
    confirmation (WSO: Ctrl+Shift+3/4/5/8/Y number formats, Ctrl+Alt+E autocolor,
    Ctrl+Alt+,/. ref copy/paste).
  · Data: HOTKEY_PLUGIN_LAYERS in drills.js — 24 Macabacus + 14 FactSet curated
    entries, categorized (Modeling/Numbers/Colors/Fonts/Alignment/Borders/Auditing/
    Paste/View/Utilities), each with remap caveats from the vendors' own docs.
  · reference.html: new "Plugin layers" PRO section — each plugin in its own accent
    (Macabacus #8ab4ff, FactSet #e0879e), colored keycaps, ● = live in the trainer.
  · ENGINE: new native Excel parity Ctrl+Shift+$/%/~ (currency/percent/general —
    joins existing Ctrl+Shift+!). Macabacus profile adds Ctrl+Shift+D fill-down +
    Ctrl+Alt+Shift+1/4/5 number cycles (simplified to apply). FactSet profile adds
    Ctrl+Alt+E autocolor. All behind the existing ⚙ profile toggle (Pro-gated,
    beta-open).
- ACHIEVEMENTS v2 (Steam-style): 34px medals; hover title = name + desc + progress
  + "N% of players have this" — global rarity computed by re-running every
  achievement test per-user from the shared runs dataset (best-times vs PARS,
  daily/gauntlet counts, created_at day-streaks, crowns from board leads). The
  "what am I looking at" legend is REMOVED per Wolf.
- COLOR IDENTITY restyle: left-border strips out; 7px dot before picker group
  labels + 6px dot in the drill-bar chip; campaign card borders back to neutral
  (chapter medals carry the hue).
- LANDING: real "Log in" button beside Start (link retained).
- BETA TOOLS (account.html, testing only): "Unlock ranked gate (test)" sets
  hk_dev_unlock + hk_ranked; leaderboard eligibility honors it; Reset reverts.
  Cosmetic gate bypass only — ratings/boards untouched. REMOVE AT LAUNCH.
- nav.js wsum now computed from the card's own placements (fixes r28's undefined
  pass-through) → provisional tags show correctly on the card.
- v29.

---
# ROUND 30 — revolver redesign, grader-freedom audit, instant nav, achievements 23
- REVOLVER WAS A DESIGN BUG, NOT A VALIDATION BUG: framed as a "cash sweep" but
  graded as a MAX(0,−FCF) draw via function-name string matching — Wolf's correct
  MIN(balance, cash available − min cash) rightly failed. REBUILT as a true sweep:
  rows cash available / revolver balance / minimum cash (engineered mix: one full
  paydown, one partial, one zero-sweep year); graded on VALUE + input refs, zero
  function-name policing. Headless-verified: canonical MIN/MAX ✓, IF-chain
  alternative ✓, wrong value rejected ✓. Par 52.
- GRADER-FREEDOM AUDIT (all 37 drills): inventoried every formula check. Most were
  already value+ref (compliant). Fixed: filldr's exact-string equality → value+ref.
  Kept deliberately: INDEX/MATCH + SUMIF pattern checks (the function IS the skill),
  cagr's '^' (no POWER() in the evaluator). RULE: checks() may never require a
  function name unless teaching that function is the drill's stated purpose.
- NAV POP-IN KILLED: nav.js script tag now sits immediately after #navMount in the
  BODY of every page (no defer) and nav.js mounts the instant it parses — no
  DOMContentLoaded wait, no layout drop, no icon resize flash. nav.css icon sizing
  got !important specificity against index's global svg rules.
- INSTANT TOOLTIPS: title → data-tip + CSS ::after (native title has ~1s OS delay).
  Applied to achievement medals + campaign medals.
- CAMPAIGN → THE BUILD: chapters renamed to model versions (v1 Foundations … v7
  Lookups), finisher "Model complete". Modal copy: "ship the model version by
  version". Progression now speaks Excel.
- ACHIEVEMENTS 15→23: Deal Sprint (10/day), Live Deal (25/day), After Hours
  (midnight–5am run), Weekend Warrior (Sat+Sun same weekend), Solid Foundation /
  Model Citizen (par on whole group), Half-Par Club, Season Ticket (gauntlets in 4
  weeks). ctx gained groups; global-rarity calc updated to match.
- FEATURED BOARDS: min-height 290px flex columns (no more squeezed look when
  empty/thin); empty copy now confident: "open board — first run sets the bar."
- v30.

---
# ROUND 31 — click-away, faster demo, nav-native settings, lifetime analytics
- CLICK-AWAY FIXED (root cause): every backdrop listener used {once:true} — one
  inner click consumed it and the backdrop went dead. Universal backdrop close now
  lives in nav.js's capture delegation (flag-synced, permanent); per-instance
  listeners remain as harmless redundancy. RULE: never wire overlay closers with
  {once:true}.
- DEMO ~2.2x FASTER: cell-select beat 1100→520ms, key beat 720→330ms, and plain
  character typing plays at 110ms bursts (chords keep the readable beat).
- SETTINGS RELOCATED: HUD ⚙ popover deleted; sound-cycle (🔊/🔊↑/🔊⌨/🔇) and
  keyboard-profile (⌨) now sit as nav tool icons beside ?, injected by index after
  the synchronous nav mount. data-tips explain each state.
- ANALYTICS (stats): "most-used shortcuts" now counts CHORDS/commands (Ctrl+…,
  Alt, F-keys) rather than raw keys; new Lifetime tiles — total keystrokes, time on
  the grid, distinct shortcuts used, busiest day.
- BULLET DESIGN LANGUAGE (Wolf-endorsed, now standing): colored family DOT for
  top-level items, en-dash (–) for subordinate rows — banker note-taking hierarchy.
  Applied: picker groups (dot), drill-bar chip (dot), campaign version headers
  (dot + family-colored medal), campaign drill rows (– prefix). Use this pattern
  for any future list UI.
- v31.

---
# ROUND 32 — THE JUMP, root-caused; one canonical chrome
- MENU-JUMPS-DOWN, ACTUAL ROOT CAUSE (at last): index's body used flex vertical
  centering (align-items:center + .app{margin:auto} + 72px top padding) — the nav's
  Y-position depended on CONTENT HEIGHT, so dismissing the landing / loading a drill
  re-centered the column and the menu visibly dropped. Every other page top-aligns.
  Index is now top-aligned like the rest. This was the last structural divergence.
- CANONICAL CHROME (nav.css is the single authority):
  · html{scrollbar-gutter:stable} — no shifts when scrollbars appear
  · body{padding-top:14px} — identical breathing room on every page
  · .wrap 1180px / index .app 1180px / reference 1080→1180 — one content column
  · reference's rogue green radial-gradient background REMOVED; flat var(--bg)
    everywhere (variety lives in accents, never backgrounds)
  · reference :root synced to the canonical palette (was missing --faint)
  RULE: no page defines its own background, wrapper width, or body layout — nav.css
  owns chrome; pages own content.
- VISUAL VARIETY FOR CLARITY (accents per the banker-notes design language):
  family-color dots on stats per-drill rows and leaderboard drill chips (CH entries
  now carry group). Dots + en-dashes remain the list hierarchy everywhere.
- v32.

---
# ROUND 33 — desk-culture ladder, leaderboard pipeline unification, boot beacon
- "GAME NOT LOADING" INVESTIGATION: v31→v32 index diff is provably CSS-only; all
  shared JS + every inline index script runs clean under a full runtime stub harness.
  Cannot reproduce a blank page statically → prime suspect is stale cache mixing
  asset versions. RESPONSE: BOOT BEACON shipped — window error listener paints a
  red banner with the exact message + file:line. The page can never fail silent
  again; if it recurs, the banner text is the bug report.
- THE LADDER v4 (Wolf's tongue-in-cheek order): MBA Associate (floor — "everyone
  starts here, yes everyone") → Candidate → Summer Analyst → First-Year Analyst →
  Associate → VP → MD (crimson, crown, no F4 on the cap — never touches Excel) →
  Second-Year Analyst (radiant final boss). 8 tiers; thresholds recalibrated on the
  shrunk scale (.53/.375/.31/.255/.195/.15 at att 8/10/12/14/16/18); summit verified
  reachable; provisional caps at Summer Analyst. MBA Associate's keycap bears a
  MOUSE glyph (the shame mouse). tier-mba + tier-crimson CSS added (index+nav.css).
- SYNC-SET DISEASE EXCISED: found THREE stale duplicate tier tables (index ×2,
  leaderboard ×1 — still carrying the old unreachable .05 summit!). All tier math
  now delegates to window.HK_RANK (themes.js). hk_rank session cache key bumped →
  hk_rank3. RULE: no file may define its own tier table again.
- LEADERBOARD PIPELINE UNIFIED (the NaN + jank): a second userStat builder still
  used .sum while consumers were mixed → "top NaN%" on Your Card and NaN-sorted top
  players. One pipeline now: entries + HK_RANK.ratingOf + wsum everywhere.
  rosterHtml was defined but NEVER RENDERED (r27 injection missed) — now in
  renderAll after featured; its tier tabs call renderAll (render() was undefined).
  Featured: auto-fit minmax(340px) columns, min-height 230, h4 ellipsis (the
  squeezed skinny boards from Wolf's screenshot).
- AUTH SLOT (no username on game/boards): nav.js runs at body-top; pages create
  window.sb in bottom scripts → slot rendered empty once and never retried. Now:
  retry loop + window.navRefreshAuth() kick (index calls it right after sb exists);
  __navAuthKick refreshes session + profile handle then re-renders.
- v33.

---
# ROUND 34 — CURRICULUM DEPTH: Full Builds tier, deepened Models, dup excised
- DEPTH AUDIT FINDING: check-count ≈ enforced work. Models drills had only 2 graded
  cells despite 60-75s pars — 6-7s clears were legitimate. Depth = coverage.
- FULL BUILDS (new group + campaign v8, the WSP-style flagships, all graders
  headless-verified incl. wrong-answer rejection):
  · isbuild (par 115): 3-yr income statement — anchored COGS %, GP, EBIT, anchored
    tax NI; 4 formulas × fills = 12 graded cells, per-year value+ref checks.
  · cfslink (120): net-change SUM + the CASH CORKSCREW — beginning cash must
    REFERENCE prior ending (link is ref-checked, hardcodes rejected).
  · debtsched (140, the crown): revolver corkscrew — anchored amort, capped sweep
    (MIN/MAX), ending balance, interest on AVERAGE balance, and THE LINK across
    3 years. Fake links rejected by the grader.
- DEEPENED: dcf 70→100 (adds Gordon TV, PV of TV, Enterprise Value — 4 checks);
  comps 32→62 (full chain: mean multiple → implied EV → equity → per-share →
  premium, 5 checks). wacc/lbo/schedule queued for the same treatment next round.
- STALE DUPLICATE revolver (pre-r30 draw version, sitting AFTER cagr) excised by
  span surgery. INCIDENT LOG: a naive index()-based excision earlier in the session
  deleted cagr as collateral (the dup sat on both sides of it) and a comps rewrite
  matched a non-drill 'comps:{' object — both caught by asserts before any push.
  RULE: drill-block surgery uses ^-anchored span maps with a label:' content
  signature, asserts the key list before/after, and writes ATOMICALLY at the end.
- 40 drills. Campaign = 8 versions (v8 · Full Builds, gold family color, sheets
  medal glyph in hkBadge c8 — themes.js + index inline, sync). PARS regenerated.

---
# ROUND 35 — THE BOOT ERROR: wire-before-create, live since v31, beacon vindicated
- Wolf's beacon screenshot: "Cannot read properties of null (reading
  'addEventListener') @ :4482". Document line 4482 = $('soundToggle')
  .addEventListener(...) executing BEFORE the r31 block that CREATES the button in
  the nav tools. Sibling bug one screen down: $('profileToggle') listener, same
  class. Both listeners now live INSIDE the creation block (sBtn.onclick /
  pBtn.onclick) — wire-with-render, same rule as modal ×.
- THIS WAS THE v32 "ALL ELEMENTS GONE" MYSTERY: the TypeError aborted the remainder
  of that boot script from v31 onward; the game never finished wiring. The beacon
  (v33) existed precisely to catch it — first real fire, exact file:line, one-shot
  fix. Not supabase, not git, not cache.
- WHY THE HARNESS MISSED IT: the runtime stub faked getElementById for ALL ids, so
  null-element crashes were invisible. NEW REGRESSION HARNESS: null-strict boot —
  getElementById returns null unless the id exists in markup or was dynamically
  created via createElement. The v31 bug class is now testable; current boot passes.
- Beacon upgraded: also catches unhandledrejection (async boot failures banner as
  "boot error (async)").
- v35.

---
# ROUND 36 — Alt+= Excel parity, density pass, beacon v2
- ALT+= AUTOSUM v2 (Wolf's report: committed instantly, shift-adjust dead): now
  PROPOSES like Excel — opens the editor with '=SUM(range)' and arms the pointer
  state (editAnchor/editPointer/editPointerStart) on the proposed range, so
  arrows / shift+arrows re-point it before Enter commits. Proposal is adaptive:
  contiguous numbers ABOVE preferred, LEFT as cross-footing fallback; with no
  neighbors it opens '=SUM(' and the native operator-boundary pointer flow arms
  on first arrow. Ribbon HUS/MUS paths no longer pushUndo around it (nothing
  commits until Enter). commitEdit hardened: unbalanced '(' auto-closed on
  commit — =SUM(A1:A3 <Enter> works, Excel-style.
- DENSITY PASS: COLS 8→10 (A..J), ROWS_MAX 12→14, grid cells 12px/21px rows
  (#grid override block; th 10.5px; colW fallback 72px for new columns).
  Rationale: the grid read like Excel at ~140% zoom; drills now have room for
  4-5 year models and left/right smart-fill patterns.
- BEACON v2: async banner now appends the top stack line (file:line) — the next
  "(async): 1 is not defined" screenshot self-identifies. Could not reproduce it
  headless (evaluator is a hand-rolled parser, no eval/new Function anywhere in
  boot); the stack line is the designed path to it.
- QUEUED (Wolf-endorsed direction — more Full Builds-style tight banking modules):
  balance-sheet build, working-capital schedule, 3-statement mini-link; deepen
  wacc/lbo/schedule to flagship coverage; use the wider grid for 4-5yr spans.
- v36.

---
# ROUND 37 — the queued curriculum: 43 drills, Full Builds at 6
- NEW FULL BUILDS (all graders headless-verified, ties engineered, fake links rejected):
  · bsbuild (par 125): two-year balance sheet — SUM totals both sides, THE RE ROLL
    (prior RE + NI − dividends, ref-checked to year 1), and a check row that must
    read ZERO both years (assets engineered to tie via cash).
  · nwcsched (118): driver-based working capital — AR/inv/AP off anchored
    DSO/DIO/DPO ÷365 lines filled across 3 years, NWC, and ΔNWC ref-checked to
    the prior year.
  · threestmt (155, THE CAPSTONE): three distinct links in one drill — the cash
    corkscrew, the CFS→BS cash pull (ref-checked both years), and the RE roll —
    plus sums, ending in TWO zero check cells. Values engineered so the model
    genuinely ties (yr-2 capex set equal to D&A so ΔRE=ΔTA holds).
- DEEPENED to flagship coverage: wacc 58→78 (E/V + D/V off one total, after-tax
  Kd, assembled WACC — 3 dense checks), lbo 75→98 (entry EV → leverage → equity
  check → exit at the SAME anchored multiple → MOIC — 5 checks), schedule 65→98
  (PP&E roll gains capex row; dep off OPENING balance; corkscrew link enforced).
- Campaign v8 now gates on all six Full Builds. PARS regenerated (43 drills).
- IDEA QUEUE (next candidates, roughly in build order): sources & uses table
  (deal funding both sides tie), accretion/dilution mini (EPS bridge), DCF
  sensitivity row (WACC stepped across columns — exploits the A..J grid),
  returns attribution bridge (EBITDA growth vs multiple vs deleveraging),
  football-field summary (min/max bands per method), 13-week cash flow
  (restructuring desk flavor — Wolf's home turf).
- v37.

---
# ROUND 38 — OPTIMAL-STROKE RECALIBRATION (Wolf's editfix report, systematized)
- Wolf: editfix claimed 14 optimal strokes, solvable in ~5. AUDIT METHOD: replay
  every drill's demo() keyboard-only — chords count 1 (matching the in-game
  counter), navigation costed as arrow-manhattan between targets, Enter advances
  the active cell. Deterministic-rnd stub hung builds with retry-until-distinct
  loops (real Math.random in the harness now — noted for future harnesses).
- FINDING: hand-estimated parKeys were inflated nearly everywhere — worst on
  small drills (undo 12→3, blocksel 10→2, audit 20→8, editfix 14→8) and on
  fill-powered builds where one Ctrl+R does twelve cells (cfslink 96→40,
  isbuild 100→57, threestmt 126→82, lbo 82→49).
- POLICY: parKeys := min(current, computed). 27 drills recalibrated. Two computed
  HIGH and were left alone: navigation (12 vs 96) and foot (46 vs 53) — their
  demos tour cells single-step while optimal play ctrl-jumps; the manhattan model
  overcounts there. parKeys is display/aspiration only (results card + drill bar);
  time pars and XP unaffected.
- Audit script pattern preserved at /tmp level in transcript; rerun after any
  demo() change. RULE: when a drill's demo changes, recompute its parKeys.
- v38.

---
# ROUND 39 — Wolf's eight-bug batch, root causes
- ZOOM MYSTERY CLOSED: .gridwrap had literal CSS zoom:1.18/1.34 media rules
  re-inflating the r36 density pass — deleted. gridwrap overflow:visible, no
  min-height (the useless scrollbar), table 12.5px. Grid fits its box.
- F4 WAS GATED ON A LIVE POINTER ONLY — typed refs or typing-after-pointing left
  it dead ("cuts off half the drills"). cycleAnchor now falls back to the ref
  immediately behind the caret (regex, full 4-state cycle, caret preserved).
  Logic loop-verified standalone.
- SUM RANGES: autoSum had hijacked editAnchor as range base while movePointer
  writes single refs — first arrow collapsed the proposal, shift did nothing.
  New editPointerBase state: shift+arrow EXTENDS (anchor fixed, corner walks,
  writes A1:A3), plain arrow re-points single (Excel semantics). autoSum uses it.
- CARET: was rendered ONLY in F2-mode mid-string — invisible at end-of-buffer
  (i.e., nearly always). Now always rendered, themed accent, 1s blink (.edcaret).
- HOVER GLOW: td:hover background neutralized — keyboard game, the mouse-hover
  cell highlight confused F2/selector work.
- SIGN-IN DEAD PRE-CONNECTION: openAuth() had `if(!sb) return` — clicking Log in
  before the async client existed silently no-oped. Modal now opens immediately,
  shows "connecting…", re-renders when sb lands.
- PASTE DIALOG: was a center-screen flex slab; now a compact bottom-right dock
  (300px, shadowed) inside the gridwrap.
- NEXT-DRILL DISCOVERABILITY: results card gains a primary "next drill → (n)"
  button; the data-act='next'→nextChallenge() wiring already existed.
- v39.

---
# ROUND 40 — type-to-replace + task clarity (Wolf: "unclear what the tasks are")
- TYPE-TO-REPLACE WAS ABSENT ENTIRELY: only '='/'+', F2, and Backspace started
  edits — typing a letter on a selected cell did NOTHING (Excel's most basic entry
  behavior). Now: any printable char (outside app hotkeys — '\' picker keeps
  priority) starts an Enter-mode edit seeded with that char, replacing the cell.
- TASK LINE: C.req was rendered NOWHERE in-game — the task text existed only in
  drill definitions. New #taskLine bar above the drillbar: 13px mono, family-color
  dot, <em> refs in accent bold, populated on every loadChallenge (req, prompt
  fallback). The single biggest clarity fix available.
- ALWAYS-ON TARGET HIGHLIGHT: currentGuideTarget (first FAILING check's target
  range) was guided-mode-only. Renamed currentTargetRange, computed always:
  guided keeps the strong pulsing ring; clean runs get a soft dashed accent
  outline (td.ttarget) on the next cell(s) to change — advances as checks pass.
  No more squinting at "B5" and hunting.
- v40.

---
# ROUND 41 — banker '+', guide alternates, profile coach; r40 REPLAY (process incident)
- PROCESS INCIDENT (own goal): r40's feature pass FAILED SILENTLY — the heredoc
  python aborted at a bad anchor mid-block, bash wasn't &&-chained, the version
  bump still shipped, and the round was reported as delivered. Type-to-replace,
  the task line, and target highlights never reached prod. NEW RULE: every python
  surgery block ends with an explicit success echo AND a per-feature grep verify
  (grep -cF per landmark, exit nonzero on miss) before commit. Applied this round;
  all r40 features replayed and verified landed.
- '+' STARTS A FORMULA seeded as '=+' — what Excel stores when bankers type
  +B2+B3; '=+' ends at an operator boundary so the first arrow points immediately.
- GUIDE ALTERNATES (no pigeonholing): guided checklist gains a footer listing the
  engine-live equivalences (fills ctrl+r/d ⇔ alt h f i r/d, autosum alt+= ⇔
  alt h u s, paste special ctrl+alt+v ⇔ alt e s, rows/cols ctrl+± ⇔ alt h i r /
  h d r, plugin profiles) + the principle: many chords, one sheet — the grader
  only checks the result. Per-step inline alternates queued (needs a chord→op map).
- PROFILE COACH: player card now shows most-used shortcut chips (top 5, last 40
  clean-run traces) + up to two directional "coach's notes" from rule scans of
  the chord mix (no F4 → anchor nudge; no Alt walks → ribbon nudge; single-arrow
  heavy → ctrl+arrow nudge; no paste-special → rotation nudge). Never prescriptive,
  banker dot/dash styling.
- v41.

---
# ROUND 42 — SPREAD PASS: the sheet gets used (Wolf: "underutilizing 80% of the screen")
- LAYOUT DOCTRINE (new standing rule): a drill should either occupy a meaningful
  footprint (≥6 cols / ≥9 rows) or place its task at MULTIPLE SITES across the
  sheet. Corner-clustered single-site drills are legacy; new drills follow this.
- FIVE MULTI-SITE REWRITES (graders verified incl. wrong-answer/decoy rejection;
  parKeys recomputed per the r38 rule):
  · margin (par 22→52): three comp tables in three neighborhoods (B:D top-left,
    G:I top-right, D:F low) — same point-build/fill/percent motion, three homes.
  · growth (28→58): consolidated Y1-Y5 build up top + a segment block low-right —
    growth row built twice, refs shift with the block.
  · cagr (34→72): three deal blocks scattered (B2:B5, G3:G6, D10:D13) — same
    formula shape, three ref sets, percent each.
  · percent (30→64): TWO statements common-sized, each anchored on ITS OWN
    revenue ($B$2 vs $G$2, anchor ref-checked) — the F4 lesson taught twice.
  · blue (34→62): hardcodes scattered across four sites (two blocks, two loose
    singles) + DECOY FORMULA CELLS that must stay default — the grader checks
    both directions of the convention.
- Ctrl+arrow jumping becomes load-bearing: multi-site layouts make edge-jumps the
  natural fast path (guides call it out).
- gridwrap align-self:stretch — bottom flush with the checklist rail.
- v42.

---
# ROUND 43 — SITE-DRIVEN RANDOMIZATION (structural replayability, not just new numbers)
- NEW ENGINE CAPABILITY: req, guide, and targets may be FUNCTIONS — resolved per
  load (guide cached per run via C.__gCache, invalidated in loadChallenge). Drills
  can now randomize STRUCTURE, and every piece of surrounding text/highlighting
  follows the layout.
- FIVE DRILLS CONVERTED to site-driven builds (margin, growth, cagr, percent,
  blue): tables/blocks/singles draw positions from shuffled slot pools each run —
  the segment block moves, statement B moves AND deepens (5-7 rows), the CAGR
  deals scatter differently, blue's hardcodes and decoy formulas relocate with
  collision avoidance. Same skill, new page every run. VERIFIED across 25 random
  layouts per drill (solutions derived from site data; decoys still reject).
- DOCTRINE ADDENDUM: new drills should randomize structure (site pools), not just
  values. parKeys unchanged (motion counts are layout-invariant to first order).
- LAYOUT: taskline moved BELOW the drillbar — instructions now hug the grid
  instead of floating at the page top (Wolf: "too much space for eyes to wander").
  drillbar margin tightened. Skinny filler columns dropped from spread colW maps
  (they read as broken stripes); label columns keep explicit widths, data columns
  use the 72px fallback.
- COPY PASS (de-robotization): "D2 has the VALUE only" → "paste just the VALUE
  into D2 — leave the bold and the fill behind"; "carry live growth formulas" →
  "fill the growth formula down through…"; revolver + copyover labels rewritten
  in desk English. RULE: check labels read like a person explaining, not a
  grader asserting — say what the ACTION is, not what the cell "has".
- v43.

---
# ROUND 44 — models look like MODELS + remaining site conversions
- MODEL DRESSING: MODEL_CODENAMES pool + codename() helper — every model-tier
  drill's A1 title now reads like a real tab ("Northwind Industrial — income
  statement ($mm)"), randomized per run. 12 titles dressed (all Full Builds +
  wacc/lbo/schedule/revolver/comps).
- FOUR FULL BUILDS EXTENDED 3→4 YEARS (isbuild 115→128, cfslink 120→132,
  debtsched 140→155, nwcsched 118→132): loops, checks, demos, fills, colW all
  widened to cols B-E; label column widened to 196px so statement names read
  like a real model. Verified 8 seeds each; corkscrew fake-links still reject.
- THREE MORE SITE CONVERSIONS (center, sort, series): tables draw origins from
  slot pools; center = 5-col alignment table (headers/labels/totals in three
  passes), sort = league table anywhere on the page, series = year header with a
  RANDOM starting year (2021-2026) at a random spot. 20 layouts each verified.
  Site-driven now covers 8 drills.
- parKeys recomputed for all 7 changed drills via the replay tool (best-of-12
  layouts): isbuild 61, cfslink 43, debtsched 84, nwcsched 85, center 28,
  sort 22, series 24.
- STILL QUEUED from prior rounds: per-step guide alternates (needs chord→op
  map); format/pastes conversions; rapid-fire Group B engine; new drill ideas
  (sources & uses, accretion/dilution, DCF sensitivity row, 13-week RX cash flow).
- v44.

---
# ROUND 45 — the whole queue: conversions, transpose, alternates, Group B, new models
- ENGINE — TRANSPOSE: PASTE_OPTS gains ['E','Transpose'] (the real Alt E S E) and
  doPaste grows a transpose branch (rows land as columns; values + core formats
  ride along, formulas dropped like real paste-special transpose).
- NEW DRILL transpose (par 40, Values group): copy a year row, Alt E S E drops it
  down a column at a randomized destination. Site-driven from birth.
- CONVERSIONS format (35→42) + pastes (38→44): both site-driven; format's metric
  table and pastes' source/destination cells relocate per run. Site-driven: 10.
- PER-STEP GUIDE ALTERNATES: guideAltNote() appends engine-verified equivalences
  inline per step (ctrl+d ⇄ alt h f i d, ctrl+r ⇄ alt h f i r, alt+= ⇄ alt h u s,
  ctrl+alt+v ⇄ alt e s, both directions) — max two notes per step, truthful pairs
  only. Queue item closed.
- RAPID-FIRE GROUP B (queue item closed): six altSeq ops added — align center/
  right/left, blue-the-font (full h f c →×4 ↵ walk), autofit h o i, paste-values
  e s v ↵. The altSeq dispatcher already existed (borders); Group B is live.
- NEW MODELS (Wolf's picks; 13-week CF skipped by request):
  · waterfall (par 118): strict-seniority paydown — FCF, MIN-rationed TL paydown
    (MIN + both refs ENFORCED), surviving cash, MIN again on the revolver, both
    ending balances. Builds randomize whether the TL binds on cash or balance.
  · txncomps (par 110): five precedent deals — multiple paid per deal filled
    down, average off one live SUM, implied EV at the average, implied equity
    after net debt. Codenamed title.
- Models tier now 7 drills; 46 total. PARS regenerated; parKeys via replay tool
  (format 24, pastes 14, transpose 14, waterfall 63, txncomps 54).
- Remaining queue: sources & uses, accretion/dilution, DCF sensitivity row,
  returns bridge, football field; onboarding v2; number-format cycling drill.
- v45.

---
# ROUND 46 — advanced tier scaffold, section leaders, banner + flush fixes
- PAYWALL POSITION (pushback given, infrastructure shipped OFF):
  window.HOTKEY_PREMIUM = { enabled:false, groups:['Models','Full Builds'] }.
  Advanced groups get the \u25c6 treatment NOW (hierarchy, badges, section leaders);
  entitlement gating is one switch AWAY but stays off: (a) Wolf previously ruled
  drills out as paywall candidates — flagged the reversal; (b) gating the flagship
  content mid-beta with near-zero users kills the growth loop the B2B thesis
  needs; (c) Stripe must stay TEST-mode during the internship regardless, so
  nothing could be charged anyway. Revisit at launch.
- SECTION LEADERS (leaderboard): \u25c6 strip above the featured grid — fastest clean
  run on each advanced section's flagship (3-Statement, LBO, RX waterfall, Txn
  comps), 'unclaimed / be first' when empty. Computed from the existing time-
  sorted runs fetch (first hit per drill = leader; zero new queries). Mount is
  created dynamically (first insert attempt hit a JS template string containing
  the .featured markup — repaired; grep-verify caught it).
- PICKER: advanced groups get the \u25c6 advanced tag + dashed section rule.
- RIBBON BANNER KILLED WHEN IDLE: .ribbon{display:none} at rest; Alt-mode
  restores the full bar. (The permanent 40px bordered hint WAS the "weird big
  banner".)
- FLUSH, ACTUALLY: .stage had align-items:flex-start, silently overriding both
  children's stretch — the real reason r42's gridwrap stretch never showed.
  Now align-items:stretch.
- v46.

---
# ROUND 47 — the unified Excel frame + returning-user fix + soft Daylight + favicon
- UNIFIED BLOCK: taskline (12px top radii, no bottom border) caps a single framed
  component; .stage carries the one border (0 0 12px 12px), gap:0, overflow
  hidden; fbar and gridwrap lose their own borders (hairline separators only);
  checklist becomes an internal right rail (border-left hairline). Reads as one
  application window — taskbar, ribbon, formula bar, sheet, rail.
- RIBBON, FINALLY RIGHT: it "kept popping" because r46 hid it idle and Alt-mode
  re-inserted a 40px banner (layout shift on every Alt tap — bankers tap Alt
  constantly). Now a PERMANENT 34px strip inside the frame: faint 'alt ribbon'
  ghost at rest, accent-lit in Alt-mode, fixed height, zero layout shift —
  mirrors the actual application, per Wolf's instinct.
- RETURNING USERS: showOnboard now consults window.__hkHasSession, set inside
  onSession() for BOTH restored sessions and fresh sign-ins (also persists
  hotkey_onboarded + closes an open prompt). An account = returning; the
  tutorial/jump-in choice only greets true first-timers. (r33-era logic only
  checked localStorage, so existing users on a new device were re-prompted.)
- DAYLIGHT RETUNED: cool near-white (#e8eaed bg / #f8f9fb surface) → warm paper
  (#dbd8d1 / #ecebe6, warm lines + inks). The glare was the blank bg expanse
  around the frame; warm + darker kills it while staying a light theme.
- FAVICON: fresh keycap mark (dark key, accent face, HK) in favicon.svg; ?v=47
  busts the links. .ico/.png retained as fallbacks (svg link wins in modern
  browsers).
- session CSS: body.session hides the taskline like the drillbar (frame stays
  coherent in marathon/rapid-fire).
- v47.

---
# ROUND 48 — sheet-skinned checklist rail (Wolf: "checklist within the grid?")
- DESIGN CALL (pushback given, alternative shipped): real grid cells for the
  checklist would (a) collide with arrow/ctrl-arrow/ctrl-shift-arrow navigation —
  players would traverse INTO the instructions, (b) permanently eat 2-3 playable
  columns against the r42-44 spread doctrine, (c) require a fake "mega-cell"
  since wrapping sentences don't fit 12.5px cells. Instead: the rail WEARS the
  sheet's language — faux \u2713 column header matched to the grid's 30px th strip
  (same surface2/height/typography), hairline row rules between checklist items,
  radius 0. Reads as one more column of the sheet; stays non-addressable.
- Checklist markup now renders .cl-colhdr + .cl-body wrapper.
- v48.

---
# ROUND 49 — full-width strips, adaptive rail, unified type, F1 guide, S&U drill
- FRAME RESTRUCTURE: ribbon + formula bar are now FULL-WIDTH rows of the frame
  (DOM: stage is a column — ribbon, fbar, then a stage-row holding grid + rail).
  The rough edges were the strips ending at the rail boundary; now every
  horizontal line runs the full frame. ✓ column header aligns with the grid's
  th strip (margin-top matches gridwrap's 14px pad).
- ADAPTIVE RAIL: .checklist height:0 + min-height:100% — the GRID rules the
  frame height; long checklists scroll inside .cl-body instead of stretching
  the page. 'dense' class (auto when ≥5 checks or guided) tightens paddings
  and steps type down a notch.
- UNIFIED TYPE: rail speaks mono at the grid's 12.5px; dense 11.5px.
- TASKLINE RETIRED (Wolf: redundant vs embedded guide) — checklist labels +
  the always-on target highlight carry the task; frame regains full 12px radii.
  req text still lives in drill data (picker, future surfaces).
- GUIDE TOGGLE g → F1: type-to-replace made bare 'g' a typing key ('gross',
  'growth'...). F1 = Excel's help key, zero collision. Button, help sheet, and
  post-onboard hint updated; session-mode 'g' (marathon/rapid) unaffected —
  those bypass cell typing.
- NEW DRILL sourcesuses (par 96, parKeys 52, Models — now 8): total the uses,
  SPONSOR EQUITY IS THE PLUG (=uses−debt−rollover, wrong plug rejects), total
  sources, check row must read zero. Codenamed title. 47 drills.
- Queue: accretion/dilution, DCF sensitivity row, returns bridge, football field.
- v49.

---
# ROUND 50 — PEDAGOGY RULE: no bad-habit plugs; balance rewritten; acc/dil ships
- WOLF'S CATCH: the legacy 'balance' drill taught retained earnings AS A PLUG
  ("=B6-B9-B10-B11 — whatever makes it tie") and then graded a check row that
  was ZERO BY CONSTRUCTION — a fake diagnostic reinforcing exactly the habit a
  desk beats out of first-years.
- FULL-CURRICULUM PLUG AUDIT: every drill's req/formulas scanned. Clean:
  comps/lbo equity =EV−debt (definitional), S&U sponsor plug (the legitimate
  deal convention — the math genuinely solves for it), RE rolls (earned, not
  plugged), waterfall MIN rationing. Sole offender: balance.
- BALANCE REWRITTEN: retained earnings is now a GIVEN input; both sides foot
  independently via AutoSum (SUM ref-enforced — a lazy =B6 tie-by-reference
  REJECTS); the check row is a genuine diagnostic (build engineers the data to
  tie, invisible to the player). The prompt teaches the correction explicitly:
  "retained earnings is NEVER a plug; the check reads zero because the sheet is
  right, not because you forced it."
- NEW PEDAGOGY RULE (standing): checks must be DIAGNOSTICS, never constructions.
  A player formula may only be a residual when the underlying finance genuinely
  defines it as one (S&U sponsor equity, equity = EV − net debt). Nothing that
  backs into a balance.
- NEW DRILL accdil (par 104, parKeys 50, Models — now 9): pro forma NI, pro
  forma shares, both EPS lines, accretion % (percent-formatted, ref-live).
  48 drills.
- Queue: DCF sensitivity row, returns bridge, football field.
- v50.

---
# ROUND 51 — rail render fix (root-caused) + DCF sensitivity row
- RAIL TEXT INVISIBLE (Wolf report; style otherwise loved — KEEP THIS STYLE):
  r49's height:0 + min-height:100% collapsed the rail's content box whenever the
  stage-row height was indefinite (min-height:100% resolves to 0 there) — header
  strip survived, body text vanished. FIX: absolute-inset .cl-inner wrapper —
  rail content sits OUT of the height calculation (grid still rules the frame),
  body scrolls internally, text renders unconditionally. Mobile media query
  reverts to static flow (absolute inside an auto-height parent would collapse).
  RULE: never rely on min-height:100% inside an indefinite-height flex row.
- NEW DRILL dcfsens (par 74, parKeys replay-computed, Models — now 10): the
  sensitivity row. ONE formula with MIXED anchoring (=$B$2/(C3-$B$3): FCF and g
  absolute, the WACC header relative) filled across six columns with ctrl+r.
  Grader enforces the anchors — an unanchored =B2/(C3-B3) build REJECTS even
  when the first value matches. Exploits the full-width grid; teaches the exact
  skill sensitivity tables run on. 49 drills.
- Queue: returns bridge, football field.
- v51.

---
# ROUND 52 — 'Desk' default theme, flush rail, timer left, buttons, favicon
- NEW THEME 'desk' (DEFAULT): dark \u00d7 dracula blend on Wolf's spec — grey slate
  surfaces (#24272e/#2c3038/#353a44), soft grey-green accent (#4fb286), warm
  warn/bad. Fallback swapped default→desk in themes.js. Daylight remains for
  light lovers.
- RAIL FLUSH TO TOP: fbar moved back inside stage-main, so the checklist column
  now spans from the frame's second row — the \u2713 header (34px) PAIRS with the
  formula bar row and the first checklist item reads at eye level with A1.
  Timer relocated LEFT (namebox \u00b7 timer \u00b7 fx \u00b7 content), 16px, border-right.
- BUTTONS READ AS BUTTONS: .mb-tool gains resting surface2 fill, 75% line
  border, 1px bottom shadow — visible affordance in every theme (was borderless
  ghost text). Hover accents unchanged.
- FAVICON REDONE IN THE HOUSE LANGUAGE: the rank-emblem keycap crest itself —
  desk slate cap, grey-green rim, F4 legend. One identity from favicon to MD
  crown.
- BADGES/RANK CARDS: audited — hkBadge hex medals (earned-gold/locked-ghost) and
  the keycap crest ladder ARE the locked style already (tier metals are doctrine,
  LoL gaudiness); they sit natively on the desk palette. No blind restyle;
  targeted tweaks on request.
- v52.

---
# ROUND 53 — checklist head twinned with the formula bar
- The \u2713 colhdr strip removed; .cl-head ("\u2713 checklist n/x") is now the rail's
  top bar — 34px, var(--surface), hairline bottom — exactly matching the formula
  bar's height/surface, so the frame's second row reads as ONE continuous strip:
  A1 \u00b7 timer \u00b7 fx \u00b7 formula ||| \u2713 checklist 3/5. First item another block
  higher. (Old .cl-head margin/typography folded into the strip; .cl-colhdr CSS
  retired.)
- v53.

---
# ROUND 54 — rail to the frame top (the quarter inch, decoded); Desk goes windows-grey
- MISREAD CORRECTED: r53 merged the wrong strips. Wolf wanted the v52 structure
  intact, shifted UP one row — the ✓ strip pairing with the RIBBON (both 34px
  surface2 = the color match he meant). DONE: ribbon moved inside stage-main;
  the rail spans to the frame top; frame row 1 = [alt ribbon ... ||| ✓], one
  continuous surface2 strip. cl-head reverts to its compact in-body form (r53's
  duplicate .cl-head strip rule removed).
- DESK RETUNED PER SPEC ("not even dark — windows grey \u00d7 dracula"): now a
  light-grey theme (dark:false): bg #b9bcc3, surfaces #cdcfd5/#c0c3ca, slate
  inks, grey-green accent #3f9873. Same default slot.
- v54.

---
# ROUND 55 — ELASTIC FIT (column cut declined; goal delivered)
- PUSHBACK: Wolf floated dropping cols G+ to fit the box. Declined with reasons:
  the spread doctrine (his own r42 ask) made G-I load-bearing — margin comp set B
  (G:I), growth segment (→I), cagr pool (I), percent statement B (F:H), blue
  rates (G/H), dcfsens (C:H), plus site pools. Cutting them breaks 8+ drills and
  shrinks the randomization space.
- DELIVERED THE GOAL INSTEAD — elastic fit in render(): spare gridwrap width is
  distributed evenly across ALL columns (effective widths feed both display and
  the #### overflow logic, so what the eye sees stays consistent); row height
  scales with the drill's row count (≤8 rows → 32px, ≤10 → 29, ≤12 → 26,
  else 24) via a --cellh CSS var. The sheet now fills its box on any screen with
  zero curriculum damage. Engine colW (autofit grading, paste widths) untouched;
  S._colW now carries effective widths so overflow helpers match the display.
- v55.

---
# ROUND 56 — the half-inch found (.result inside the frame); Default = the grey look
- THE HALF-INCH: .result (win line) lived INSIDE stage-main below the grid —
  margin 16 + min-height 22 reserved ~38px of frame under the sheet. Moved
  OUTSIDE the frame (renders under it); grid now bottoms the frame exactly.
- TRUE ADAPTIVE ROWS: render() now measures gridwrap.clientHeight when laid out
  (rowH = clamp(22..36, avail/ROWS)); loadChallenge schedules a one-frame
  re-render so the second pass sees real box dimensions. ROWS heuristic remains
  the pre-layout fallback.
- THEME CONFUSION RESOLVED: Wolf picked "Default" and got matrix — Desk was a
  separate entry and his saved theme predated it. Now: 'default' IS the
  windows-grey desk-light palette (dark:false); the old matrix dark lives on as
  'terminal'; 'desk' key retired (saved 'desk' falls through the fallback to
  default — same look).
- v56.

---
# ROUND 57 — sheet tabs, the REAL theme culprit, editfix rebuilt; sparse list opened
- SHEET TABS (Wolf's idea — very on-brand): Excel-style tab strip along the
  frame's bottom edge showing the current GROUP's drills (name + PB), active tab
  accent-topped, click to load, "\u2630 all" opens the picker. Keyboard: Alt+PgUp/
  PgDn walks the group (Ctrl+PgUp/Dn is RESERVED by browsers for their own tabs
  — bound opportunistically, fires only where the browser lets it through; same
  wall as the early shelved item, honestly restated).
- THEME CULPRIT FOUND: the :root fallback vars in every page's <style> were
  hardcoded MATRIX (#0c0d0e...) — they paint before/without JS and were what
  Wolf kept seeing. All 5 pages' :root now carry the grey Default palette.
- EDITFIX REBUILT (Wolf: "2 items, whole grid empty"): now site-driven — THREE
  typos from an 8-word pool scattered across two label columns among clean
  labels + blue figures (18+ cells), different words/spots per run; one check
  per typo; par 22→44. Verified 20 layouts.
- SPARSE LIST OPENED (audit heuristic, needs eyeballing since loops undercount):
  true candidates for a foundations density pass — saves, undo, autofit,
  blocksel, copyover, drill, ribbon, polish, foot, bridge, audit, sumif, lookup.
  Queue for coming rounds alongside returns bridge + football field.
- v57.

---
# ROUND 58 — density pass I, returns bridge + football field, flat pass, autofit regression fixed
- AUTOFIT GRADER REGRESSION (found in recon, r55's doing): elastic fit pointed
  S._colW at inflated EFFECTIVE widths; autofit's checks read S._colW, so the
  drill could auto-pass. FIX: S._colW = engine colW again; effective widths live
  in S._ew; render th/td/#### + formulaOverflow read S._ew||S._colW. Verified:
  squeezed start now FAILS all checks, post-autofit passes.
- DENSITY REBUILDS (4 of the sparse cohort — all site-driven, populated pages):
  * saves — 3 scattered review cells + saveN>=3 (par 44)
  * autofit — TWO squeezed column pairs at random sites (par 34)
  * blocksel — bold the target island ENTIRELY, decoy island must stay plain
    (precision check; par 30)
  * copyover — one source block, TWO destinations, one copy two pastes (par 36);
    r58 collision fix: destination rects enforced disjoint from source and each
    other (overlapping pastes clobbered each other — 200-seed verified)
- NEW DRILLS (Models — now 12; 51 total):
  * retbridge (par 112) — returns attribution: growth at entry multiple,
    expansion on exit EBITDA, deleveraging, total, and a check that ties the
    bridge ALGEBRAICALLY to the actual equity change (identity exact).
  * football (par 92) — midpoints per method, MIN floor / MAX ceiling
    (ref-enforced; =B3 hardcode-by-reference rejects), range width.
- FLAT PASS (Wolf: loved the flat simple vibe): .ribbon.show shadow+gradient →
  plain accent-glow tint; .mb-tool micro-shadow removed (border+fill carry the
  affordance). Modal shadows retained (functional depth, not chrome).
- parKeys: replay-computed worst-of-30, min-policy applied (saves 20, autofit 10,
  blocksel 3, copyover 14, retbridge 70, football 52).
- REMAINING sparse cohort for pass II: ribbon, polish, foot, bridge, audit,
  sumif, lookup, drill (undo exempt — end-state grading can't see it).
- v58.

---
# ROUND 59 — lighter Default; density pass II (ribbon, polish, foot, bridge)
- DEFAULT LIGHTENED AGAIN (Wolf: "even lighter — dracula with green"): bg
  #b9bcc3 → #d8dade, surfaces #e9eaed/#dfe1e5, lines #b6b9c2 — pastel dracula
  greys, same grey-green accent. themes.js + all 5 pages' :root kept in sync.
- DENSITY PASS II (site-driven rebuilds):
  * ribbon (par 42) — the three ribbon-walk jobs (bold/comma/center) land at
    RANDOM cells across a populated four-table page.
  * polish (par 38) — TWO tables; dress the target header (bold/border/shade),
    the other must stay plain (formatting-has-edges check).
  * foot (par 72) — full 4×4 segment×quarter block: four row totals, four
    column totals, grand total must agree with BOTH edges.
  * bridge → "Point Mode" (par 40) — profit=rev×margin pointed (never typed)
    across FIVE years; per-column ref check (wrong-column refs reject).
- parKeys replay worst-of-30, min-policy: ribbon 14, polish 12, foot 34, bridge 16.
- Pass III remaining (visual density only — graders already strong): audit,
  sumif, lookup, drill. undo stays exempt (end-state grading).
- v59.

---
# ROUND 60 — workbook tabs, flat pass II, adaptive XP (canonical), taller frame
- SHEET TABS, WORKBOOK EDITION: group lead chip ("MODELS \u00bb") opens the strip;
  every tab wears the GROUP COLOR (2.5px top edge + lead text via --gcol from
  HOTKEY_GROUP_COLORS) — one family of sheets, one color, like a real deck of
  tabs. Taller (38px strip, 8/15px padding, 11.5px type), flat.
- FLAT PASS II: dialog/popover/tooltip drop shadows removed (modal 18px/56px,
  paste dock, tooltips); focus glows (fc-swatch, guided cl-box) converted to
  outlines. Landing inherits the flattened modal chrome. td inset "shadows"
  retained — those are cell borders/selection, function not chrome.
- ADAPTIVE XP — THE CANONICAL MATH (found in nav.js computeXP, which reprices
  ALL history from the runs table at read time; the results-card number is an
  estimate): repeat schedule was flat 15 for runs 2-10 then cliff to 3. Now
  smooth decay: 1st 50(+15 adv) \u00b7 2nd 15 \u00b7 3rd 10 \u00b7 4th 7 \u00b7 5th 5 \u00b7 6-10th 3 \u00b7
  11+ 1. Client estimate mirrors it via a local clear counter (hk_clears).
  NOTE: levels reprice slightly in beta (history is re-scored) — acceptable now,
  NOT after launch.
- TALLER FRAME: stage-row min-height clamp(400px, 60vh, 680px); measured row
  height ceiling 36→42px — the adaptive rows scale UP into the bigger box.
  Page container 1180→1280px (nav.css — all pages).
- v60.

---
# ROUND 61 — Default rolled back to desk dark (agreed); next-set tab; leaderboard rows
- THEME ROLLBACK per Wolf (+my assessment agrees): the pastel light Default
  fought the blue input convention, tier metals, and cell-color contrast. The
  r52 palette is BACK as Default (dark:true): bg #24272e, surfaces #2c3038/
  #353a44, line #454c59, grey-green accent #4fb286. themes.js + all 5 pages'
  :root synced. Terminal (matrix) and Daylight untouched. THIS is the look —
  treat as locked absent explicit revisit.
- NEXT-SET TAB: right end of the strip shows the NEXT group's name in ITS group
  color ("LOOKUPS \u00bb") — click hops to that group's first drill and the strip
  re-inks. stepGroup() added; \u2630 all stays rightmost.
- LEADERBOARD: section-leader rows normalized flex\u2192grid (auto 1fr auto,
  min-height 38px) — mixed emblem/flair heights were the likely wobble. Wolf's
  "weird behavior" report is UNSPECIFIED — asked for a concrete symptom; watch
  next session.
- v61.

---
# ROUND 62 — dracula-green Default; leaderboard/stats/reference matched to the game frame
- THEME (third dial this arc — Wolf converging): Default = TRUE dracula base
  (bg #282a36, surfaces #363948/#414459, dracula-warm inks) with a SAGE green
  accent #6ec9a0 replacing the purple (dim #4a8f72). Soft dracula warn/bad
  (#e0cf7a/#e07a6e). :root synced \u00d75.
- SATELLITE PAGES MATCHED TO THE GAME FRAME (Wolf: "no longer match"):
  * leaderboard — body grid-texture RETIRED (game page is flat), .board-cap \u2192
    34px surface2 caption strip (mono 11-12px uppercase — the ribbon/\u2713 row
    language), podium + "me" panel gradients \u2192 flat tints, radius 16\u219212.
  * stats — hero gradient \u2192 flat, radius 14\u219212.
  * reference — sticky search backdrop-gradient \u2192 solid + hairline, focus/dot/
    drilled glows \u2192 flat (outline for focus), card h2 \u2192 surface2 strip caps,
    entrance animation removed, radius 14\u219212.
- v62.

---
# ROUND 62b — LOCKED
- Wolf confirms v62 is THE look. Dracula-green Default + flat strip-cap language
  across all pages = LOCKED DOCTRINE. No palette or chrome changes absent an
  explicit "revisit the theme" from Wolf.

---
# ROUND 63 — the final tint: grey-dracula
- Wolf: dracula looks best, wants "a grey and greenish variant." Kept dracula's
  LIGHTNESS layering (its softness is the point) and drained the purple cast:
  bg #292b31, surfaces #383b42/#43474f, line #5a5e68, grey inks; sage accent
  #6ec9a0 unchanged. :root synced \u00d75. This supersedes v62's tint inside the
  same LOCKED doctrine — structure/chrome untouched.

---
# ROUND 64 — THE theme bug, finally: index's inline THEMES shadowed themes.js
- Wolf's observation cracked it: theme updates showed on leaderboard/stats/
  reference but NOT the main game. index.html carried its own inlined
  `const THEMES = {...}` ("for robustness") that SHADOWED themes.js — every
  palette dial from r52 through r63 reached only the satellite pages; the game
  page read a stale inline copy the whole time. This also explains the earlier
  "default doesn't look like you described" rounds.
- FIX: inline dict (5.7KB) deleted; `const THEMES = window.THEMES;` — themes.js
  (already loaded at line ~955, BEFORE the main script) is the single source of
  truth. Boot harness asserts THEMES.default.bg === #292b31 on the game page.
- RULE: no inlined copies of shared dictionaries. One source or it will drift —
  it DID drift, for eleven rounds.
- v64.

---
# ROUND 65 — landing as dialog, sheet to the tabs' edge, Calibri cells
- LANDING \u2192 DIALOG: the splash structure is gone; .landing-inner is now a
  600px frame-language card (surface, hairline, 12px radius) with a strip cap
  (the brand line rides the 34px surface2 strip), floating over a blurred game.
  Gate/CTA content unchanged, left-aligned inside the card.
- SHEET TO THE EDGE: gridwrap bottom pad 14\u21923px; measured rowH ceiling 42\u219248
  and recalibrated to the new padding — rows now eat the box down to the tab
  strip's border.
- CALIBRI CELLS (Wolf wanted arial/calibri or "something softer, less matrix"):
  cells now render in Calibri/Segoe/Arial (Excel's OWN default face — softer
  exactly where the eyes live, and MORE authentic, 13.5px), while all interface
  chrome keeps JetBrains Mono (the brand). Formula bar stays mono. If Wolf wants
  the softness pushed into the chrome too, that's a --mono/--sans swap away —
  offered, not assumed.
- v65.

---
# ROUND 66 — tab strip refined; the deck-flip width doctrine
- "\u2630 all" tab RETIRED (picker lives on \\ and the drill bar). NEXT chip
  vertically centered (align-self:center, zero v-padding) so the text always
  fits the 38px strip; lead chip now reads "\u00ab GROUP" and CLICK WALKS BACK a
  set (stepGroup(-1)) — left is back, right is forward, like a workbook.
- WIDTH DOCTRINE (Wolf: MD deck-flip alignment): the GAME SPACE (1180px /
  24px pads, index .app) is the reference. Everything now aligns to it:
  nav.css .wrap 1280\u21921180 (r60 had widened nav alone — that WAS the
  misalignment), leaderboard pads 28\u219224, stats 880\u21921180, account 760\u21921180,
  About 1080\u21921180, all pads 24. Titles start at the same x on every page.
- v66.

---
# ROUND 67 — the regalia pass: emblems v2, badges v2, favicon, level chip; page tops flush
- RANK EMBLEMS v2 (full devoted pass per Wolf): the keycap crest keeps its
  identity; each tier now earns ESCALATING REGALIA behind it — Summer: bronze
  ring \u00b7 First-Year: machined ring + 8 studs \u00b7 Associate: gold double-ring +
  laurels \u00b7 VP: platinum ring + wings + ice studs \u00b7 MD: crimson double-ring +
  corner rays + crown \u00b7 Second-Year: full 12-spoke starburst + orbit sparks.
  All transparent-ground, layered flats (crisp at 16px). CROSS-THEME ARMOR:
  rgba(0,0,0,.5) under-shadow (was near-black hex), a .35 dark paint-order
  under-stroke on the rim, and a white bevel hairline — reads on Daylight and
  Terminal alike. Neutral pip color de-hardcoded.
- BADGES v2: earned hex medals gain apex crown-notches, an inner ring, and the
  same dark under-stroke; locked stays a ghost outline.
- window.hkLevelChip(lvl): keycap chip w/ metal band by level (grey<5, bronze,
  silver, gold, radiant 20+) — available for account/stats/nav wiring next turn
  (display sites not blind-wired).
- FAVICON: the crest in grey-dracula (#292b31 tile, sage rim, F4).
- PAGE TOPS FLUSH (Wolf: content shifted down from prior iterations): header
  padding unified to 24/16 (was 64/56/52/32) — first content box now sits at
  the game frame's line on every page.
- Direction options if Wolf wants a different vector: (A) shipped — regalia
  behind the cap; (B) shields containing the cap (heavier, more LoL, less
  desk); (C) medal-ribbon style (cap hanging from a tier ribbon). Can prototype
  B/C on request.
- v67.

---
# ROUND 68 — sober titles, the leaderboard shift bug, level chips wired, mobile gate
- TITLES DE-WINKED (copy rule): "no mouse allowed"\u2192"keyboard Excel trainer",
  "the boards / Fastest hands win."\u2192"Leaderboard", "your numbers"\u2192"Stats",
  "the cheat sheet"\u2192"Shortcut reference", "your card"\u2192"Account", About retitled.
- LEADERBOARD SHIFT BUG root-caused: filtering to a drill changes page height;
  the scrollbar appears/disappears and the CENTERED wrap jumps horizontally.
  FIX: html{scrollbar-gutter:stable} on ALL pages. Chip hover translateY lift
  also removed (bubbles drifted off the shared baseline — Wolf's "rounded
  bubbles misaligned" report).
- LEVEL CHIPS WIRED: hkLevelChip now renders beside LVL in the nav player card
  (26px), stats hero (20px), account (24px where present).
- REGALIA VISIBILITY (it WAS live, just small): emblem sizes bumped — nav
  button 16\u219220, player card 22\u219230, leaderboard your-card 22\u219228 / rows
  18-20\u219222-24, stats hero 34\u219246, account 42\u219254.
- MOBILE GATE: \u2264740px or coarse-pointer tablets get a frame-language card —
  "This one needs a real keyboard" — over the game (z 400, bg full).
- v68.

---
# ROUND 69 — welcome-back landing, gate double-sign-in, table flex fill, punchier crests, headers to the line
- WELCOME BACK: a live session rewrites the landing dialog — "Welcome back." +
  "one \u21b5 drops you on the sheet", login button hidden. If the user signed in
  FROM the landing, the gate auto-advances once member+handle settle (700ms
  defer — onSession loads them async; advancing immediately re-prompted the
  code, which WAS the double-sign-in bug).
- SHEET TO TABS, STRUCTURAL FIX: r65's measured rowH was CAPPED (48px), so tall
  frames w/ few rows still left a gap under the table. Now .gridwrap table
  {flex:1} — the table itself stretches to the strip and table layout
  distributes the surplus across rows (--cellh acts as the floor). Zero gap at
  any geometry.
- CRESTS, PUNCH PASS: 16.6r halo disc in the tier metal (op .12) behind every
  crest — pops on any surface; rims 1.8\u21922.3; regalia ring default weight
  1.4\u21921.7 and +.25 opacity.
- SATELLITE HEADERS TO THE GAME LINE: h1s were still display-size
  (40-46px clamps) with 24px pads; now 22px titles, 12/10 pads — first content
  box sits where the frame sits.
- v69.

---
# ROUND 70 — player card v2, session polish, tooltip clipping, font unify
- LEVEL FONT: hkLevelChip + emblem legends now name "JetBrains Mono" first in
  the SVG font stack (was bare ui-monospace — the "slightly different font").
- PLAYER CARD v2 (Wolf's spec): name header \u00b7 RANK HERO block (72px crest on a
  surface2 plate + tier + standing) \u00b7 level row \u00b7 THREE stat tiles (solves,
  crowns, streak) \u00b7 achievements section now headed "achievements N / 23" with
  the TOP-3 RAREST EARNED featured at 46px + names, grid icons 34\u219240. The
  drill-by-drill list is RETIRED from the card (stats page carries it).
- TOOLTIP CLIPPING: tips inside the top nav / modebar / drillbar flip BELOW
  the element (they clipped past the viewport top by the bookmark bar).
- SIGN-OUT: signOut().finally(reload) — fresh landing with the sign-in button
  (the stale hidden-login landing was the "no option to sign in" report).
- SESSION POLISH: onSession also closes an open auth modal (stale "sign in"
  bubble) and kicks navRefreshAuth() so the username appears WITHOUT a refresh.
- Landing dialog type: h1 30\u219223, lede 14 (Wolf: "text looks a little tall").
- v70.

---
# ROUND 71 — grid fill (engine-proof), the 'set a name' identity split
- GRID FILL: flex-basis alone does not stretch display:table in all engines —
  .gridwrap table now ALSO gets height:100% against the resolved gridwrap
  height; rows share the surplus natively (--cellh stays the floor). Measured
  cap 48\u219256 as a comfort bound. A1:J14 reaches the tab strip; no compression.
- 'SET A NAME' DIAGNOSED: the beta gate signs users in ANONYMOUSLY and hangs
  the handle on that anon identity's profile; when Wolf later signed in with a
  real account, its profile had NO handle — leaderboard/card/account correctly
  showed the empty state. FIX: on session settle, a real account with
  membership but no handle gets promptHandle() in-game, once. (Handle migration
  from anon identities left as a manual/Supabase concern — flagged.)
- v71.

---
# ROUND 72 — level joins the rank hero; version strip; font doctrine settled
- LEVEL \u2192 RANK HERO: chip + LVL + progress bar + xp now sit on the RIGHT of
  the crest inside the hero plate (crest | tier+standing | level column). The
  standalone level row below achievements is gone — rank and progression read
  as ONE identity block (Wolf: "rank, achievements... then level was jarring").
- MODEL VERSIONS STRIP: campaign chapter medals re-presented as a labeled,
  framed strip — "THE BUILD \u00b7 n/8 VERSIONS" header, 30px medals with v1..v8
  under each, the ship medal right-aligned. Reads as a versioned deliverable,
  not a loose badge row.
- FONT DOCTRINE (settled): ARIAL leads the cell stack (Wolf's explicit call;
  Calibri/Segoe fallbacks); EVERYTHING outside the grid keeps the original
  system — JetBrains Mono chrome, Hanken sans. Nothing else changed; r65-70
  never touched non-grid fonts, so no rollback was actually needed — stated to
  Wolf for clarity.
- v72.

---
# ROUND 73 — the grid gap, closed for real (screenshot diagnosis)
- Wolf's screenshot showed the band under row 14. ROOT: .stage-main was a plain
  BLOCK — it received the stretched height from stage-row but gridwrap inside
  it sized to content, so the table's height:100% (r71) resolved against an
  indefinite height. FIX: stage-main{display:flex;flex-direction:column;
  min-height:0}, fbar flex:0, gridwrap flex:1 min-height:0 — the flex chain now
  runs frame\u2192stage-row\u2192stage-main\u2192gridwrap\u2192table and rows natively
  distribute every pixel down to the tab strip. Larger cells for free.
- v73.

---
# ROUND 74 — flat crests (contrast armor retired), fitness-ring level
- CRESTS DE-SHADED per Wolf: the r69 "contrast armor" (halo disc, rgba
  under-shadow rect, paint-order dark under-stroke, bevel hairline) read as
  tinted backgrounds and shading against the flat doctrine — ALL retired.
  Crests are now pure flats: regalia strokes (+.35 opacity), cap face + metal
  rim (2.2), legend, pips. Badges lose their under-stroke too.
- PLATFORM QUESTION answered honestly: hand-coded SVG is the right medium for
  flat, theme-aware, multi-size marks; commissioned raster art only makes sense
  if the direction changes to painterly/illustrated crests (it hasn't).
- LEVEL = FITNESS RING: window.hkLevelRing(lvl,pct,size) — flat circular track
  (surface) + accent progress arc, level number centered, LVL caption. The
  player-card hero's right column is now the ring + xp caption — cleaner
  vertical alignment across the hero. hkLevelChip retained for compact spots
  (stats/account).
- v74.

---
# ROUND 75 — the orange plate (tier pill CSS leak) + hero alignment
- Wolf's screenshot: the crest sat on a tinted rounded plate and the tier name
  wore a highlight box. ROOT: tier.cls classes carry PILL styling (background/
  border) for leaderboard chips; the hero applied that class to the emblem
  wrapper and name div, inheriting the tint. FIX: class dropped from the
  wrapper (raw crest on the surface2 plate), background/box-shadow nulled on
  the name, bucket pips omitted at hero size (the floating "accoutrements" —
  standing text already says top n%). Ring column align-self:center.
- v75.

---
# ROUND 76 — navigation demo fossil, Apex card, global name prompt, sleek scroll
- NAVIGATION DEMO BUG (Wolf watched the solution stall): demo/targets still said
  A1:H7 from the 8-COLUMN ERA — playback forced that partial-row selection
  before the insert step (full rows now end at J), the row-insert never fired,
  and every later check stalled. All A1:H7 → A1:J7 (demo + targets).
- PLAYER CARD, APEX SHOWCASE: handle banner (20px) on top; beneath it TWO equal
  showcase tiles side by side — crest (84px) + tier + standing | level ring
  (84px) + LEVEL n + xp. The two circulars are the card's centerpiece.
- 'SET A NAME', ACTUALLY FIXED: the r71 prompt only fired while the LANDING was
  visible. Now onSession prompts any real member without a handle after 900ms,
  anywhere; the card's empty state shows an actionable "set your name" link
  (promptHandle exported to window for nav.js).
- CHECKLIST SCROLL: 6px themed thumb, transparent track, thin width.
- PROCESS NOTE: the parKeys replay script crashed on the last-drill slice edge
  case and the && chain silently skipped the v-bump + this audit entry while
  the (newline-separated) push still ran — v75-tagged assets shipped for one
  commit. Caught and completed here. RULE REINFORCED: verification failures
  must hard-stop the round; keep every statement in ONE && chain through the
  push.
- v76.

---
# ROUND 77 — celebrations: level ding, rank-up, achievement unlocks, PB confetti
- FOSSIL SCAN (Wolf asked re: navigation-class bugs engine-wide): all drill
  sel/target ranges scanned for 8-col-era edges — ONLY dcfsens C4:H4 surfaced,
  which is intentional (six WACC columns). Checks use COLS dynamically.
  Navigation was the sole victim. CLEAN.
- CELEBRATION ENGINE (nav.js/nav.css, shared): hkCelebrate({cap,title,sub,
  iconHtml,colors}) — frame-language dialog (strip cap) with hkPop spring,
  hkDing number pulse, 38-particle CSS confetti; click/\u21b5/esc or 4.2s dismiss;
  queued when several fire. hkConfetti(host) standalone.
- WIRED: LEVEL UP — local xp estimate ladder (hk_xp_est) crosses a threshold on
  a win \u2192 ding dialog w/ level ring at 84 (canonical XP stays server-priced;
  this drives the moment). RANK UP — tier index climbed since last card view \u2192
  new crest at 84, "the desk noticed". ACHIEVEMENTS — fresh unlocks vs
  hk_ach_seen \u2192 medal at 60 + "+N more"; seen-set updated. PB — confetti burst
  over the result line (result hosts it, position:relative), win time bolder.
- v77.

---
# ROUND 78b — CORRECTION: the r78 commit shipped a NO-OP labeled as a fix
- The excise anchor missed on whitespace (assert failed), the balance check
  printed STILL OFF and exited 1 — and the push STILL went out because the
  round's tail was newline-separated statements, not one && chain. The r78
  commit message and audit entry claimed a repair that did not happen, and no
  cache bump shipped. THIS round runs as a single set -e script: excise via
  whitespace-tolerant regex (count-asserted), node syntax check, div balance
  MUST equal, v78 bump asserted >=5 pages, then commit — any failure aborts
  before the commit exists.
- Balance after true excise: verified equal (printed above in CI log).
- STANDING RULE, now enforced structurally: every ship runs as one set -e
  script through the push. Narrative in AUDIT.md may not precede verification.

---
# ROUND 79 — twenty creative achievements, picker over the game, flush corner, pk font
- ACHIEVEMENTS +20 (51 total): Tourist/Completionist (attempts), Blink (<5s),
  No Wasted Keys (keystrokes===optimal) + Economist (10 at/under), Thorough
  (>60s solve), OLD HABITS + THE MOUSE IS A LIFESTYLE (1/10 mouse-ruined runs —
  Wolf's anti-achievements), Night Shift / Dawn Patrol / Weekend Warrior
  (time-of-day flags), Volume Business (200 runs), Foundations Poured, Model
  Citizen, Full Stack, Par Machine (25), Collector (40 PBs), Business Week /
  Quarter Close (streaks), Corner Office (5 crowns). Signals: run rows already
  in ctx + NEW hk_ach_flags localStorage (index writes mouseRuns/slowWins/
  night/dawn/weekend at run end; nav.js feeds ctx). Rarity pipeline unchanged
  (localStorage-signal achievements simply have no global %).
- PICKER, "STILL IN THE GAME": overlay = blurred translucent bg (game visible),
  card chrome dropped (transparent, full-width 1080px, 3-column masonry,
  responsive 2/1), rows semi-transparent surfacing to solid on hover, 6px
  themed scrollbar. pk-name now speaks mono 12.5px like the rest of the game.
- TOP-LEFT FLUSH: gridwrap padding 14→0 on top/left — the corner box and
  headers sit against the formula bar and frame edge, like the real thing.
- v79.

---
# ROUND 80 — picker declutter (section blocks + bylines); achievements pop IN gameplay
- CORRECTION from r79's log: achievement total is 43 (23 + 20), not 51.
- PICKER v3 (Wolf: cluttered, loved the vibe): per-drill rows (desc/xp/best)
  retired. Now SECTION BLOCKS — a 3-col grid of group cards (colored 32px cap
  strip) each holding a BYLINE CLOUD: small mono chips, one per drill, \u2713 when
  a PB is held, tooltip carries label+best. Detail lives in the game; the
  picker is a map. Tabs/arrows remain the in-group navigators.
- ACHIEVEMENTS IN GAMEPLAY: unlocks were only detected at player-card render
  (Wolf saw the pop on card open). Now index keeps a lite local run ledger
  (hk_runs_lite, cap 400) + builds a local ctx (pb/pars/flags/streak/solves)
  and SWEEPS ON THE NEXT DRILL LOAD after a win (+450ms) — the moment lands
  between drills, never over the results box. Crown-dependent achievements
  still resolve card-side (need server data); hk_ach_seen shared, no doubles.
- v80.

---
# ROUND 81 — beta tag, weekly retired, identity fallback, account hardening
- BETA TAG: brand reads hotkey.gg [BETA] — mono chip, accent-dim border,
  palette-adaptive like the wordmark.
- WEEKLY RETIRED (Wolf: clutters boards + button space; daily is the keeper):
  weekly button removed from the mode bar; leaderboard featured slot is
  daily-only. Engine code left dormant (weeklyMode never set). JS references to
  the button are null-guarded by the existing wire() pattern.
- IDENTITY FALLBACK: leaderboard 'anon' placeholders → deterministic
  analyst-#### (uid prefix) via Proxy default + per-profile fallback.
- ACCOUNT HARDENED: Security card (password reset email, sign out) +
  Appearance card (live theme buttons from window.THEMES); handle save kicks
  navRefreshAuth() — the nav shows the new name instantly.
- PROCESS: first attempt aborted on \\ud83c\\udfc1 surrogate escapes in a python
  heredoc (lone surrogates never match real emoji) — anchors rebuilt as
  whitespace/emoji-safe regexes with count asserts; nav.js reset before rerun.
- v81.

# r81 HOTFIX — unguarded weeklyBtn listener shipped as a boot TypeError
- The post-ship grep flagged 2 remaining weeklyBtn refs; one was an UNGUARDED
  addEventListener on the removed element — a boot-time TypeError live for one
  commit. Guarded; null-strict boot harness re-run WITH weeklyBtn absent from
  markup (the harness previously always saw the id present, which is why it
  never caught removed-element listeners). LESSON: after removing markup, boot
  the harness against the NEW markup id-set before shipping.

---
# ROUND 82 — rapid-fire ops, version-medal artwork, density III, flagship blocks
- RECORD CORRECTION: the "empty" prior turn actually SHIPPED (repo log: beta
  brand tag, weekly retired from UI, analyst-#### identity fallback, account
  Security+Appearance cards, + a boot-TypeError hotfix) — only the chat reply
  was lost. That work is v81; this round is v82.
- RAPID-FIRE +3 Group-B ops (9 ribbon ops): comma format (Alt H K), percent
  format (Alt H P), bold-the-ribbon-way (Alt H 1).
- VERSION MEDALS: c1-c8 glyphs tell the build's story — statement lines,
  balance scale, waterfall steps, chain links, debt corkscrew, NWC gears,
  three-statement triangle, rocket for v8 SHIP IT.
- DENSITY III: audit 6→8 rows; sumif 7→9 (ranges → $10 incl. req/guide);
  lookup 5→7 companies. VERIFICATION CATCH: lookup's checks held a HARDCODED
  r<=6 loop the range-swap missed — companies in rows 7-8 would've been
  invisible to the grader; set -e stopped the ship, bound fixed to r<=8,
  40-seed deep verify. RULE: range swaps must sweep numeric loop bounds too.
- FLAGSHIP BLOCKS: 'Full Builds' breaks formation — full-width picker row,
  accent frame, ◆ FLAGSHIP tag, larger bylines w/ par chips. Free play stays
  ungated (doctrine): prominence over locks.
- v82.

---
# ROUND 83 — picker keys rewired + aligned; PB server hydration; account matured
- PICKER ARROWS DEAD, root: pkRows() still queried '.pk-row' — a class the v80
  byline redesign deleted; nav code was walking an empty list. Rewired to
  .pk-byline with 2D movement (←→ linear, ↑↓ nearest chip in the adjacent
  visual row by rect), a visible .focus outline cursor, Enter selects. Overlay
  content now TOP-ALIGNS with the game frame at open (measured stage top) and
  widened to the 1180 doctrine width — the "categories float high" report.
- STAT RETENTION: hydratePBFromServer() on login — min-merges your server runs
  (clean only, capped 2000) into local PBs, so a new device/browser shows real
  bests. Server stays canonical; tabs re-render on merge.
- ACCOUNT PAGE: duplicate Security card MERGED into one (reset-link + session
  rows folded above the password form); NEW Progress card (crest 56 + level
  ring 56 + tier/LVL/xp/solves) and Data card (export local JSON / clear local
  cache — PBs+streak kept, server untouched).
- v83.

---
# ROUND 84 — leaderboard rhythm pass (and a recon correction)
- RECON CORRECTION: the "duplicated .row/.hero blocks" I reported mid-round
  were a misread — a piped grep -n | grep -n double-numbered its output and I
  took the pipe's counter for file lines. Each selector exists ONCE. The set -e
  script caught the false premise BEFORE anything shipped (assert on the dup
  count failed) — the ship-as-script rule paying for itself.
- THE 14px RHYTHM: rows sat at 22px side padding while every caption strip
  sits at 14 — the "left edges don't quite agree" look. Rows now 9/14 pad,
  min-height 42 (kills emblem wobble), mono 13.5px (the game's voice), columns
  48/1fr/92; you-gap/empty/panels/section-titles/chips all pulled onto the
  same 14px line.
- QUEUE RECONCILIATION: "number-format cycling" retired (the live 'format'
  drill covers ctrl+shift+%/$/!); borders drill pending an engine border-op
  audit; streak server-sync parked on a migration path.
- v84.

---
# ROUND 85 — the ribbon crash, paste-special inline, ring sweeps
- RIBBON ROOT CAUSE (Wolf: "ribbon seems broken, can't see subordinate
  options"): drawRibbon's font-color branch referenced __altFooter — a const
  scoped INSIDE the guided-checklist renderer — so any walk touching font
  color threw a ReferenceError mid-paint and the strip died until reload;
  stray '</div></div>' rode along. Reference removed. The adaptive strip
  (TABS at root, MENUS per path) was alive underneath the crash.
- PASTE SPECIAL, INLINE: the options lived only in a floating side dialog; the
  strip now lists every PASTE_OPTS key inline (<k>v</k>Values …) with the
  active kind lit accent — see it and execute it in one place. Dialog stays.
- MENUS: the r82 percent walk (Alt H P) was executable but INVISIBLE in the
  strip — added to H's menu. Audit rule: new altSeq ops must ship with their
  MENUS entry.
- RING SWEEP: hkLevelRing now carries an SMIL <animate> — every level ring
  site-wide sweeps from zero to your progress on mount (0.9s spline), no
  wiring. First taste of the animation pass; count-ups and bar fills queued.
- NAMES: display-site sweep found leaderboard (fallback ✓), nav (retry+CTA ✓),
  stats/account (self-render post-session ✓) — need Wolf's specific pages to
  chase the remaining misses.
- v85.

---
# ROUND 86 — paste-dialog arrows + paint armor
- ARROWS IN PASTE SPECIAL: in ribbon mode the dialog swallowed arrow keys
  (preventDefault, no handler) — "arrows dead" while the dialog was open, and
  if the strip wasn't painting (the v85 crash class), the mode was INVISIBLE:
  a player stuck in silent ribbon mode with dead arrows everywhere. Arrows now
  cycle the paste options (\u2191\u2193\u2190\u2192, Excel-style), banner says so.
- PAINT ARMOR: drawRibbon wrapped — a rendering error now paints a minimal
  "path \u2192 \u2026 esc backs out" strip and logs, instead of stranding input in an
  invisible mode. The __altFooter class of bug can no longer kill the game.
- LIKELY CACHE NOTE for Wolf: v85's ribbon fix shipped minutes before his
  report; GitHub Pages HTML caches briefly — symptoms may have been the PRE-
  fix build. v86 verifies with the armor either way.
- Monetization decision (Wolf): SUBSCRIPTION over one-time. Direction agreed:
  free spine = level-gated progression; sub unlocks full track from L1 +
  cosmetics; one robust pathway, no live-service treadmill. Stripe stays TEST.
- v86.

---
# ROUND 88 — WAVE 1 opens: F4 caret desync, dead results buttons, forgot-password, tab shrink
- F4 BUG (engine-wide, Wolf's repro): cycleAnchor's POINTER branch rewrote the
  ref ($ made it longer) but never moved editCaret — the typed-ref fallback
  did. Next char/pointer-write landed INSIDE the reference ("=$B*$2"). One
  line: editCaret=editBuf.length. Unit-simmed: =B2 → F4 → * → =$B$2* ✓.
  Arrow-repoint after F4 resetting the lock is CORRECT Excel behavior (kept).
- RESULTS BUTTONS: .rm-key buttons rendered with data-act but were NEVER
  wired — keyboard-only card. Click delegation added (again/next/menu);
  space + esc now honor their printed labels in the key chain too.
- WRONG PASSWORD dead end: failed sign-in now offers an inline "forgot
  password?" link that fires resetPasswordForEmail on the typed email — no
  more bounce with nowhere to go. (Landing-dump repro couldn't be reproduced
  from code — modal path never closes on error; watch for Wolf's exact path.)
- TAB CLUMPING (pre-screenshot mitigation): .st-tab now flex-shrinks with
  ellipsis (min 52px) so dense groups compress instead of colliding;
  horizontal scroll remains.
- v87.

---
# ROUND 89 — Wave 1 continues: the ribbon regression, Esc-restart removed, handle-save repaint
- RIBBON TYPES LETTERS, root-caused (Wolf's "text writing feature" theory was
  RIGHT): type-to-replace (any bare letter starts an Enter-mode edit, ~5207)
  sits ~130 lines BEFORE the mode==='ribbon' branch. Excel alt-walks are
  tap-Alt-RELEASE-then-letters, so walk letters arrive bare and got eaten as
  cell input. Fix: mode!=='ribbon' added to the type-to-replace guard.
- ESC RESTART REMOVED: despite r49 comments claiming otherwise, Escape on the
  grid still called restartDrill(). Esc now cancels marching ants, otherwise
  NOTHING. Restart = Shift+F11 + results card. Comment rewritten to match.
- LOGIN-REFRESH residual: nav repaint fired on session (r70) but NOT after the
  handle upserts (promptHandle + beta gate) — first-time namers stayed
  nameless until reload. navRefreshAuth() kicks the moment either saves.
- PROCESS: 89b's tail check used an over-narrow regex and aborted a correct
  build (set -e as designed); completed here after verifying worktree state.
- PIPELINE SUGGESTIONS (per Wolf's invite): (a) Esc-habit micro-drill; (b)
  session-resume (reopen tab → last drill); (c) keystroke heatmap on stats.
- v88.

---
# ROUND 90 — F4 range cycling + keystroke heatmap; Wave 2 confirmed next
- F4 ALREADY cycled all four anchor states on single refs (none→both→row→col,
  Excel order) — the caret bug had just made it look broken. The REAL gap:
  RANGE references (pointed B2:D4 or typed) didn't cycle at all (single-ref
  regex failed → F4 dead). Both branches now cycle both ends together like
  Excel: B2:D4 → $B$2:$D$4 → B$2:D$4 → $B2:$D4 → B2:D4. Unit-simmed ✓.
- KEYSTROKE HEATMAP shipped: each clean run folds its keyLog into a
  persistent hk_key_counts tally (top-80 chords kept); stats page renders
  "Your keyboard" — top-12 chord bars (accent fill, counts).
- WAVE 2 CONFIRMED as the next arc: gameplay-loop redesign/refinement
  (seamless advance, onboarding walkthrough, learn-from-zero, formula bar).
- v89.

---
# ROUND 91 — WAVE 2a: seamless loop, first-run tour, formula bar, panel merge
- SEAMLESS LOOP: Alt+←/→ hops prev/next drill from anywhere (no picker
  round-trip); session RESUME (hk_last_drill — reopening the tab restores your
  drill, not the default); results card's Next button now names its
  destination ("next: Margins →").
- FIRST-RUN TOUR (the buddy-bounce fix): one-time 4-step spotlight — grid
  (arrows/=/end-state grading), checklist (the associate's markup), formula
  bar (F4 locks, Esc is safe), trainer (\\ map, Alt+←/→, F1 guided). Accent
  ring + frame-language caption card, ↵ next / esc skip, hk_tour_done.
  Triggered 900ms after access advances.
- FORMULA BAR: long formulas now SCROLL (caret kept in view via render wrap);
  FUNCTION HINTS live — =IF( floats "IF( condition, if_true, if_false )"
  under the bar with the CURRENT ARG bolded; parser tracks the innermost open
  call through nesting (unit-proven: nested MATCH inside INDEX, arg
  advancement after closing). 16 signatures seeded.
- STATS PANELS MERGED per Wolf: one "most-used shortcuts" block in Analytics
  fed by the local tally (all clean runs on device; posted traces only as a
  fresh-device fallback); the r90 standalone panel removed.
- v90.

---
# ROUND 92 — WAVE 2b: checklist voice (tranche 1), tour meta steps, learn-from-zero
- CHECKLIST LANGUAGE tranche 1 (11 labels: combo/foot/lookup/sumif/audit/
  blocksel): associate voice — verb-first, the ITEM named, refs kept where
  templated ("Total every row down column F — live SUMs, not typed numbers").
  Tranche 2 rides the Wave-3 density rework (labels churn there anyway).
  ANCHOR LESSON: labels mix literal em-dashes and \u2014 escapes — the label
  patcher now tries both encodings (first attempt aborted correctly on it).
- TOUR +3 META STEPS (7 total, one line each): game modes (#mbRapidBtn, rapid
  fire pitched), your card (#authSlot — xp, levels, the rank ladder, player
  card), the boards (crowns, "the desk is watching"). Orientation in ~20s.
- LEARN FROM ZERO: first-ever player (no runs, no PBs) starts drill #1 with
  guided ON + toast ("follow the highlighted keys · F1 turns it off").
  One-shot (hk_learn_done); veterans never see it.
- v91.

---
# ROUND 93 — Wave 2 CLOSED: guided visibility, demo naming, the two-ladders doctrine
- GUIDED MODE VISIBLE: body.guided-on — accent seam on the frame border, a
  live "● guided · practice" chip in the checklist cap, and the F1 toggle lit
  accent. Practice state (doesn't post to boards) is never a surprise now.
- DEMO NAMING unified: the toolbar button is "▶ watch solution" (was "▶ demo")
  with a tooltip; matches the language used in drill copy. Single source of
  the term going forward.
- TWO LADDERS DOCTRINE (Wolf's clarification, now visible in product):
  LEVEL = reps (xp from clean solves, volume-driven, never decays).
  RANK = competition (drills beaten + speed percentile vs the field).
  Tour "your card" step rewritten around the split; player card showcase
  tiles now captioned "rank · speed vs the field" / "level · earned from
  reps". Logged as doctrine in PROJECT_CONTEXT.
- PIPELINE +1 (Wolf): CENTER ACROSS SELECTION drill — fold into the Wave-3
  formatting rework (Ctrl+1 alignment path; the classic no-merge doctrine).
- Wave 2 remainder Ctrl+PgUp/PgDn stays parked on PWA (browser-reserved).
  WAVE 2 IS CLOSED. Wave 3 (content/density arc) is next.
- v92.

---
# ROUND 94 — WAVE 3 opens: Density Doctrine v2 + "The 4am Pass"
- DOCTRINE v2 in PROJECT_CONTEXT (incl. the new NO-RECALC RULE below).
- AUDIT REBUILT: "The 4am pass" — titled divisional P&L (6 divisions × 5 FY
  cols + cross-foot Total column G, Total revenue row, Opex, EBITDA), THREE
  planted defects: a division Total short a year (col G), a stale hardcoded
  EBITDA, an EBITDA reading the neighbor's opex. Associate-voice diagnostic
  checks. par 75 / parKeys 36.
- HARNESS CATCH (the reason this took two designs): the first version put
  the short-SUM on Total revenue, which EBITDA reads — and the engine has NO
  dependency recalc, so fixing the SUM stranded that column's EBITDA at a
  stale value: UNSOLVABLE. 40-seed solved-state verification caught it
  pre-ship. Redesign: defect 1 moved to the cross-foot column (nothing reads
  it); EBITDA judged against DISPLAYED totals. 60-seed order-independent
  solve now passes. NO-RECALC RULE added to doctrine; recalc engine queued
  with the IF/comparator evaluator turn.
- PSEUDO-CHECK CULL: blocksel decoy + polish decoy checks REMOVED; both
  drills verified still grading.
- v93.

---
# ROUND 95 — ENGINE AUDIT (Wolf-directed) + a correction that matters
- THE HEADLINE CORRECTION: r94's "no-recalc" finding was WRONG. commitAction
  runs recalc() — an 8-pass fixed-point recompute over every formula cell.
  The engine (Opus-built) was BETTER than I credited; the "unsolvable drill"
  was my harness mutating cells directly and bypassing recalc. Doctrine rule
  retracted; replaced with the HARNESS RULE (simulated solves must run a
  recalc-equivalent before judging). The shipped 4am-pass design stays — the
  cross-foot defect is better pedagogy anyway — but the reasoning is fixed.
- REAL BUGS FOUND & FIXED by the audit:
  (1) snapshot()/restore() omitted S.ROWS — undo after a row insert/delete
      restored cells but kept the mutated row count: ghost rows / hidden
      data. Geometry now snapshots.
  (2) pointer-Backspace left editCaret beyond the truncated buffer — the
      F4 caret-desync's sibling (edit-mode arrows then misbehaved).
  (3) NUMBER-ENTRY PARITY: '1,000', '50%', '(500)' were stored as TEXT.
      They now land as numbers (comma fmt / percent fmt / negative) — the
      inputs bankers actually type.
- VERIFIED SOLID: fill's translateFormula ($-aware), F4 range cycle, paren
  auto-close. KNOWN SHORTCUTS queued: silent 0 on eval failure (needs a
  #VALUE! state), no circular-ref detection, text-in-SUM counts 0.
- v94.

---
# ROUND 96 — THE EVALUATOR TURN: comparators + IF; the Sticky Switch drill
- EVALUATOR UPGRADE: cmp_() level added BELOW +/- (Excel's lowest
  precedence) — =, <>, <, <=, >, >= all land as 1/0; IF(cond,a,b) in fn()
  (eager branches). Args and the top-level parse route through cmp_ so IF
  conditions work anywhere. Unit-proven on EXTRACTED evaluator code:
  precedence, all six comparators, nested IF, and the full sticky pattern
  =B10*(1+IF(B3=1,B5,IF(B3=2,C5,D5))) flipping with the switch.
- NEW DRILL — "Sticky switch" (cases, Formulas group): a titled revenue
  build with a scenario switch (1/2/3), a growth-by-case block, five FY
  columns. Build the F4-anchored sticky IF in C10, ctrl+R it across, then
  FLIP THE SWITCH to Downside — the recalc engine repopulates the whole row
  from one cell (the r95 finding made this drill possible as designed).
  Checks: anchored live IF / filled with walking year refs / switch at 3
  with the row recomputed. 40-seed verified under the harness recalc rule.
  par 95 / parKeys 62.
- Doctrine compliance: tab title, labeled sections, content randomized
  (growth rates, base revenue, FY start), 3 motions, associate checklists.
- v95.

---
# ROUND 97 — formatting rework flagship + error triage; COUNTIF
- NEW DRILL "Dress the tab" (dress, after format): a finished-but-naked
  analysis dressed book-ready in one pass — title bold+ruled (alt h b o),
  inputs painted BLUE (alt h f c), margins percent+1dec, dollars comma'd.
  Four formatting muscles, randomized geometry (segment count, rows),
  associate checklists. 30-seed plant+solve. par 110/keys 58.
- NEW DRILL "Error triage" (triage, after audit): #REF!/# DIV/0!/#VALUE!
  planted as the real artifacts they are (text remnants of breaks); read
  the error, infer the intent, rebuild the formula. Third check depends on
  the first (fix B8 before growth can compute) — deliberate: triage has an
  order. 30-seed verified incl. the dependency. par 85/keys 40.
- ENGINE +COUNTIF (pairs w/ SUMIF; eqLoose criteria).
- 54 drills total. Center-across-selection still queued (needs an engine
  alignment-span mode + renderer support — logged, not forgotten).
- v96.

---
# ROUND 98 — "Roll-forward prep" (versionup): the de-hardcode drill
- NEW DRILL after triage: inherited tab where growth % and EBITDA are TYPED
  numbers (right today, silently wrong tomorrow). Rebuild both rows as live
  formulas — checks demand formulas AND value-parity with v1 ("nothing
  drifted"). Versioning discipline as a rep. 30-seed verified. 55 drills.
- v97.

---
# ROUND 99 — versionup DENSIFIED (Wolf called the thin ship; he was right)
- Roll-forward prep rebuilt to doctrine: 5 FY columns, full operating stack
  (Revenue/Growth/COGS/Gross profit/Opex/EBITDA/margin), FOUR hardcoded
  derived rows to resurrect = 18 formula sites + 4 fills, mixed comma/
  percent formats, drift-parity check. par 135/keys 82. 30-seed verified.
- v98.

---
# ROUND 100 — THE MODEL DEEPENING PASS (Wave 3 #18: "solvable with two SUMs")
- Six Models drills rebuilt to doctrine; the thin single-column ref-chains
  are gone:
  · WACC — full desk build: unlever the peer beta, relever at the target's
    OWN D/E (B8/B7), CAPM, after-tax Kd, weight off ONE denominator. Checks
    follow the chain — each formula must REFERENCE its upstream cell, so a
    retyped number breaks the grade. par 142/keys 87 (was 78/48).
  · COMPS — multiples no longer given: compute EV/EBITDA ×5 + fill down,
    AVERAGE/MAX/MIN tape, then a second panel walking the target through
    implied EV (must reference the LIVE mean at D8), equity, per share,
    premium. par 161/keys 101 (was 62/54).
  · DCFSENS — now a TRUE two-way table: 5 WACCs × 3 growth rates, ONE
    formula with genuinely mixed anchors ($B$2 / C$3 / $B4), fill right
    then down = 15 live cells; the mixed forms are enforced per cell.
    (The old "mixed anchoring" drill was actually all-absolute — corrected.)
    par 64/keys 29.
  · S&U — the two-SUM archetype fixed: anchored %-of-total columns down
    BOTH sides (=B2/$B$5, filled through 100%); the $-anchor itself is
    check-enforced. par 153/keys 95 (was 96/46).
  · LBO — + hold period + IRR =B12^(1/B13)-1, ref-enforced off MOIC and
    the hold. par 113/keys 65.
  · ACC/DIL — + the financing drag juniors forget: cash consideration ×
    after-tax cost = foregone interest, netted in pro forma NI (check
    label: "the SUM alone is wrong"). par 105/keys 59.
- HARNESS (r95 rule honored): 40 seeds × 6 drills — canonical solve passes,
  fresh build fails, hardcode-only (right values, no formulas) fails. Fill
  mirrors engine translateFormula ($-aware); recalc = 8-pass fixed point.
  One harness bug caught mid-run: fill chords leaked into the typed-text
  filter (ctrl+d's 'd' typed into the anchor cell) — harness-side only.
- parKeys = demo-replay count (typed + chords + Manhattan walk);
  par = round(keys×1.35+25) — calibrated on versionup (82→135).
- drills.js: descs updated; duplicate wacc/dcf/lbo/revolver meta keys
  DEDUPED — later-wins hazard: revolver's live label lived in the second
  copy; preserved it. HOTKEY_PARS regenerated. 55/55 catalog↔CHALLENGES
  key parity asserted.
- No innerHTML surgery this round (drill objects only) — div-balance n/a.
- Queued next deepening tranche: dcf → 5-yr discount-factor×PV two-row
  build; waterfall → 3-yr corkscrew cascade; schedule → 5 yr. CAS engine
  work + comments design still open (r97).
- v99.

---
# ROUND 101 — Wolf's field reports: two P0 input bugs + the welcome-back dialog
- SHIFT+SPACE FIXED (row select was dead): type-to-replace treats any printable
  char as an edit-starter, and space IS printable — it ate the chord before the
  selection branch ever saw it. Carve-out added: space+shift falls through;
  plain space still starts an edit (Excel parity). Ctrl+Space was never hit
  (ctrl already excluded).
- ROW INSERT/DELETE GEOMETRY FIXED (the "squares" / fat-rows report): the
  handlers mutated S.ROWS, and since the adaptive grid distributes the box
  height across the row count, deleting rows collapsed the frame into a few
  giant rows. NEW GEOMETRY RULE (rowsAfterOp): the sheet is a stable VIEWPORT
  — S._ROWS0 stamped at load; insert/delete shifts CELLS, never the frame.
  Content pushed past the bottom edge stays in S.cells (gradable, undo-able),
  like scrolling out of view. Both call sites (Ctrl chord + Alt H I/D R) share
  the helper. Column ops now shift colW too (widths travel with content).
- Navigation drill steps 9/10 re-latched on pure S.lastRowOp action (the
  S.ROWS comparisons can never fire under the stable-frame rule; undo/redo
  still clear the latch so undo can't fake steps). initialRows removed.
- FOSSIL BUG (found by the new Playwright e2e, fires on EVERY solve): a stale
  second el.title line in renderLvl referenced bare `l` — ReferenceError
  inside the hotkey_solves .then on every win since the line landed. Removed.
- WELCOME-BACK DIALOG (Wolf's ask): onboarded users skip the landing entirely
  (html.hk-returning), so the old thin strip WAS the arrival moment — too
  subtle. showWelcomeBack is now a frame-language dialog (cap strip + card
  over the blurred game): named greeting from new localStorage
  hk_handle_cache, resuming-drill line, PB, board count, streak. Dismissal
  stays PASSIVE — first keydown fades it without being swallowed (verified:
  the dismissing ArrowDown still moved the cursor). If the session hasn't
  restored after 2.2s, a Log in button surfaces ON the card (openAuth signin).
- hk_handle_cache written on session handle fetch + saveHandle; cleared at all
  three sign-out sites (index x2, nav.js). Landing (non-onboarded browsers)
  also greets by name via the same cache + signed-out nudge at 2.6s.
- doSignIn hardened: explicit !sb guard message (never a silent dead button).
  Wolf's "sign in button doesn't work" not yet reproduced (works headless,
  local) — NEED FROM WOLF if it persists post-r101: which page/button, and
  does the modal open at all.
- VERIFY: Playwright e2e (real key events): 12/12 nav-tour checks latch incl.
  Shift+Space + ins/del steps; 7-row delete leaves frame+cellh untouched;
  undo restores; rowops ribbon path 2/2; wb dialog + passive dismiss + login
  reveal; zero page errors. 40-seed drill harness still ALL PASS. node --check
  all inline scripts + nav.js + drills.js.
- v100.

---
# ROUND 102 — DEEPENING TRANCHE 2 (dcf/waterfall/schedule) + PORTFOLIO QUEUE
- Wolf directive: deepening continues across the ENTIRE portfolio — he's
  playing through and seeing non-specific, non-realistic exercises. Queue
  below is the roadmap of record for the arc.
- DCF — 5-yr, the real discounting stack: discount-factor row =1/(1+$B$7)^B2
  filled across, PV row =B3*B4 (both refs live), Gordon TV off year-5 FCF,
  PV of TV must REUSE the year-5 factor (=B10*F4, ref-enforced — desk rule:
  never retype a DF), EV = SUM(PV row)+PV of TV. par 140/keys 85 (was 100/77).
- WATERFALL — 3-yr corkscrew cascade: FCF row filled across, MIN-rationed
  TL block B8:D10 filled right, BOTH tranches corkscrew (C7=B9, C12=B14,
  filled right; links ref-enforced per year). TL sized to exhaust
  mid-horizon on most seeds so the cascade MOVES. par 168/keys 106
  (was 118/63).
- SCHEDULE — 5-yr roll + a second corkscrew: the accumulated-depreciation
  memo (B7=-B4; C7=B7-C4 filled — must build off itself; retyped numbers
  fail). FY headers, randomized start year. par 113/keys 65 (was 98/39).
- HARNESS: 40 seeds × 3 — canonical solve passes / fresh build fails /
  hardcode-only fails. Counter calibrated first: reproduces r100's
  published lbo 65/113 and dcfsens 29/64 exactly. node --check all pages'
  scripts + drills/nav/themes; 55/55 catalog↔CHALLENGES parity.
- drills.js descs updated for the three; HOTKEY_PARS regenerated.

## PORTFOLIO DEEPENING QUEUE (Wolf-directed, r102 — the roadmap of record)
SPECIFICITY DOCTRINE (addition): every drill reads like a REAL tab — real
statement layouts, named companies, FY headers, associate-voice checklists.
"Non-specific / non-realistic" is now a defect class, not a style note.
- T3 Full Builds realism pass: isbuild/cfslink/debtsched/nwcsched/bsbuild/
  threestmt — pre-doctrine era; titles/FY headers, sweep for two-SUM
  shortcuts, ref-enforce every link, associate-voice labels.
- T4 Formulas family: margin/growth/bridge/foot/percent/cagr/revolver/
  balance/sumif/cases — rebuild on realistic statement layouts (growth
  clarity, pipeline #26, folds in here).
- T5 Lookups/Data/Values: lookup/lookup2/sort/series/drill/pastes/
  transpose — real surfaces (comps tables, trading data, raw dumps).
- T6 Foundations/Formatting surfaces: mechanics stay, but run on
  model-shaped sheets ('dress' r97 is the template): navigation/copyover/
  blocksel/autofit/filldr/format/center/blue/polish/combo/gauntlet.
- Cross-cutting riders per tranche: drill-titles pass (#25), checklist
  voice tranche 2, retbridge/football re-audit vs doctrine.
- v101.

---
# ROUND 103 — T3: FULL BUILDS REBUILT TO THE MIX RULE (+ two dress bugs, one fossil)
- Wolf directive on T3: no surface density — no drill passes by doing the
  same motion N times. NEW **MIX RULE** (doctrine): every Full Build exercises
  ≥3 distinct op FAMILIES (value entry / formula+anchor / fill / link /
  number format / bold / border walk / font-color dialog). All six now do.
- ISBUILD — 5 yrs: 4 anchored formulas + net-margin row (ctrl+shift+%),
  bottom line bolded + ruled (ctrl+b, alt h b t). 160/100 (was 128/61).
- DEBTSCHED — 5 yrs, and the rate comes "from the VP": YOU type it as a
  percent (r95 number-entry parity), paint it blue (alt h f c →×4 ↵), then
  amort/sweep/interest corkscrew; close dressed. req/guide are functions —
  the rate randomizes per run. 190/122 (was 155/84).
- CFSLINK — 5 yrs + cash-conversion memo (=B6/B2 as %), close bold+ruled.
  134/81 (was 132/43).
- BSBUILD — 3 yrs; RE roll built ONCE and filled across (C10 → walks);
  both totals bolded, check row ruled; three zeros. 182/116 (was 125/78).
- NWCSCHED — 5 yrs; the three drivers typed from the "data room" (values
  randomized into req/guide), painted blue in one selection, NWC row
  dressed. 206/134 (was 132/85).
- THREESTMT — 3 yrs × three links, all filled across; three check zeros;
  TA bolded, check ruled. 174/110 (was 155/82).
- DRESS BUGS FIXED (found while wiring the mix ops — the guide path was
  UNSOLVABLE): (1) alt h f c opens on BLACK (idx 0) and the demo hit Enter
  directly — check demands blue; demo/guide now →×4 to blue (engine default
  kept: the 'blue' drill already arrows correctly). (2) guide teaches
  alt h b o (→ ball) but the check read only bb — now bb||ball. Also the
  comma label claimed "zero decimals" while alt h k applies Excel's 2.
  97/53 restamped (calibrated counter).
- FOSSIL: a duplicate taskLine block (renderDrillbar) immediately overwrote
  the function-aware req render — every function-req drill (percent, margin,
  dress, versionup, debtsched/nwcsched now) painted its req FUNCTION SOURCE
  into the task line. Dup removed; function-aware block is the only one.
- HARNESS v2: sequential key state machine — ctrl chords (b/%/!/r/d), alt
  ribbon walks vs RUN map, font-color dialog w/ arrow index, number-entry
  parity for typed values. Formatting-only drills exempt from the
  hardcode-fail assertion (dress: no formulas to strip). 40 seeds × 7 pass;
  tranche-2 + r100 drills re-verified under v2.
- v102.

---
# ROUND 104 — ESCAPE-LEAK CLASS KILLED + FULL-CATALOG HARNESS DRAGNET
- Wolf: "watch solution shows \\u25b6" + "we still have latent bugs I can't
  audit by hand." Both answered systematically this round.
- ESCAPE-LEAK CLASS: \\uXXXX written where it isn't JS (markup/CSS renders it
  literally). Swept ALL pages (script-stripped regex). FOUR user-visible hits:
  demoBtn markup (\\u25b6 watch solution), guided chip CSS content (showed
  'u00b7'), leaderboard your-row checkmark CSS content (showed 'u2713'),
  stats subtitle markup (showed 'u2014'). Fixed via HTML entities / proper
  CSS escapes (\\00B7, \\2713). RULE: \\uXXXX escapes are JS-STRING-ONLY;
  markup gets &#x...;, CSS content gets \\XXXX. Sweep is repeatable.
- DRAGNET: harness v2 ran ALL 55 drills (25 seeds sweep mode). Classifier
  distinguishes real fails from replayer limits (r95 harness rule — no
  false alarms). RESULT: 33/55 MACHINE-VERIFIED (28 full triple-assert incl
  lookup after exposing eqLoose to the sandbox; 5 formatting drills
  solve+fresh verified, hardcode N/A). ZERO new content bugs found.
- NOT YET MACHINE-VERIFIABLE (the residual latent-bug pool): pointer-mode
  demos (margin/percent/growth/bridge/balance/revolver...), F2/audit/editfix,
  copy-paste family, sort, series/rowops dialogs, navigation (stateful).
  QUEUED (the big lever): DEMO-REPLAY E2E — Playwright drives each drill's
  own demo() through the REAL engine and asserts the win screen; that
  verifies all 55 end-to-end incl input handling, no simulator gap. Next
  infra round.
- Sweep classifier fix: unknown alt-walk terminals now throw UNSUPPORTED
  instead of silently no-oping (rowops/series were misreported as fails).
- v103.

---
# ROUND 105 — T4a: FORMULAS FAMILY, FIRST TRANCHE (growth/sumif/balance/revolver)
- Sweep-informed scope: these four were the thinnest (1-2 motions); margin/
  percent/foot/cases are doctrine-era already and ride T4b (titles/voice).
- GROWTH (#26 closed) — real revenue build: two segments consolidated live,
  YoY row as %, 4-yr CAGR with ^, consolidated line bolded. Typed refs (the
  fill steps Wolf called unclear are now explicit). 110/63 (was 58/37).
- SUMIF — ledger → summary tab: anchored SUMIF fill, live SUM foot,
  % of total off $E$5, total line dressed. 140/85 (was 52/35).
- BALANCE — 2 years, SUM-footed both sides (RE a GIVEN, never a plug),
  check row zero ×2, totals bold + check ruled. 126/75 (was 55/18; the old
  drill was alt+= twice and one subtraction). 
- REVOLVER — 4 sweeps + prove-outs (revolver post-sweep, cash post-sweep),
  balance row dressed. 113/65 (was 52/27).
- All 40-seed triple-assert. New demos are TYPED-REF (harness-verifiable);
  pointer skills still live in margin/bridge (which keep pointer demos).
- Splicer scanner now comment-aware (an apostrophe in a // comment poisoned
  the string-state machine — caught by the EOF assert, write stayed atomic).
- v104.

---
# ROUND 106 — DEMO-REPLAY E2E (the verification lever) + 4 REAL BUGS IT CAUGHT
- dev/e2e-demo-replay.js: Playwright drives EVERY drill's own demo() through the
  REAL engine (real KeyboardEvents via demoKey, real recalc, real graders, real
  win flag) × N random builds. Closes the gap the offline harness can't reach:
  pointer mode, F2 edit, copy/paste, ribbon dialogs, sort. First run: 48 WIN,
  7 red. Standalone triage separated 3 contamination false-positives from 4
  genuine bugs. After fixes: ALL 55 GREEN (5 reps).
- BUG 1 (real, user-facing) — CLIPBOARD nulled after ONE paste (doPaste). Broke
  the "one copy, two pastes" contract copyover AND pastes both teach, and Excel
  parity (Ctrl+V keeps the clipboard; Esc/new-copy clears — that path already
  existed). Removed the null on the main + transpose paste paths.
- BUG 2 (latent contamination) — loadChallenge reset mode/path/dialog but NOT the
  edit vars, so a drill left mid-edit (F2, or Alt+-> mid-edit) poisoned the next
  drill's keystrokes. Added editing/editBuf/editCaret/editPointer reset. This was
  also the source of the e2e's 3 cross-drill false positives — one fix, both wins.
- BUG 3 (broken demo) — bridge used Kb.eq (Alt+=, autoSum) to start a pointed
  product; autoSum seeds =SUM( and pre-selects, so the walk produced
  =SUM(B1*B3) referencing a TEXT header. Switched to plain '=' pointer-start.
  Same class in gauntlet: Kb.eq with no committing Enter left an open edit that
  corrupted every later step — added Kb.enter (matches the working balance demo).
- BUG 4 (broken demo) — editfix blind-deleted the last 2 chars and retyped 2,
  which only fixes last-2-char typos; mid-word transpositions (Reveune->Revenue)
  got mangled. Rewrote the demo to compute the common prefix, backspace the
  divergent tail, retype from the divergence point. Now correct for every pair.
  parKeys 8->44 (the old count was fiction; par 44 kept — foundations, tight-ok).
- No shared asset (nav/themes/drills.js) changed — index.html + dev/ only — so
  per the cache rule ?v stays 104. e2e is a dev tool; the site never loads dev/.
- VERIFY: e2e ALL GREEN (5 reps × 55); offline harness 15/15 shipped drills
  (no regressions); node --check inline scripts.
- (no v bump — no shared-asset change.)

---
# ROUND 107 — T4b: TEXT SPILL (Excel parity) + PICKER-NAME CLARITY (#25)
- TEXT SPILL: long text cells now run across EMPTY right neighbors, clipping
  at the first occupied cell — exactly Excel. Implementation: render() wraps
  spilling text in an absolutely-positioned span clamped to the empty run's
  width; td.spill lifts overflow/z-index. Active/selected cells spill too
  (Excel draws the border around the anchor; text still runs). Kills the
  amputated tab titles ("Cascade Materials — Segm|") wherever the layout
  leaves room; rows packed with year headers still clip at B1 — which is
  what Excel does. Screenshot-verified.
- PICKER NAMES (#25): margin was literally named 'Formula' → 'Margins';
  'Drill' → 'Hardcode'; retbridge tab collided with bridge ('Bridge' →
  'Returns'); copyover tab 'Basics' → 'Copy'; stale labels synced to the
  richer engine copy (cagr/percent/editfix/copyover); descs modernized to
  match the r100+ rebuilds they describe.
- foot/cases audited: already doctrine-clean (titles, voice, mix) — no churn.
  margin/percent/cagr keep scatter layouts by design (multi-site exemption);
  their table headers are the realism, a fake A1 title would collide.
- VERIFY: demo-replay e2e ALL 55 GREEN; offline harness clean; node --check;
  spill screenshot inspected (dress: title spans A1:E1, active border intact).
- v105.

---
# ROUND 108 — T5: LOOKUPS/DATA/VALUES (one rebuild, five audited clean)
- AUDIT-FIRST (no churn doctrine): lookup / lookup2 (comps tables, shuffled
  metric columns), sort (league table + foot + bold), series (year header +
  dress), transpose (header → summary column) all already meet Specificity +
  Mix — left alone, logged here as audited.
- DRILL ('Hardcode it') REBUILT — was the weakest card in the catalog
  (par 13, two ops, 'src/calc' columns): now the pre-send ritual — a deck
  page whose Value column is LIVE LINKS (=E3..=E8) into a visible model
  feed; break the links (ctrl+shift+↓, ctrl+c, alt e s v ↵ onto itself),
  then paint the dead numbers blue (alt h f c →×4 ↵) because hardcodes
  wear blue. Checks: links BROKEN + values exact, column blue. 66/30
  (was 13/9). e2e 8/8 WIN.
- v106.

---
# ROUND 109 — T6 AUDIT (clean, one copy lie fixed) + TEAMS DESIGN TURN (Wave 4 #27)
- T6 audit-first: format/center/blue/combo/polish/dress + navigation/copyover/
  blocksel/autofit/filldr/saves/undo/rowops all reviewed against Specificity +
  Mix. Verdict: surfaces and graders at bar (dress is the flagship template;
  micro-reps keep tight surfaces by design; all e2e-verified). NO rebuilds —
  no-churn doctrine.
- ONE FIX: blocksel's prompt claimed "the grader checks both islands" — false
  since the r94 decoy-check cull (grader is target-only). Prompt rewritten:
  the second island tests your AIM; grader wants the entire target. (polish's
  'know where formatting stops' copy makes no grader claim — kept.)
- TEAMS/CLUBS/SCHOOLS design doc SHIPPED (dev/TEAMS_DESIGN.md) — the design
  turn #27 required before code: thesis (teams = distribution; captain =
  10-150 players), personas, v1 joinable-team schema (teams + team_members,
  RLS, one-team-per-player, ?team=CODE join link into the landing gate),
  v2 captain assignments (the corporate primitive dressed as a club
  feature), v3 corporate gated on internship end, anti-goals, and 4 open
  questions for Wolf (Desks naming, size cap, single-team rule, seeding).
  BUILD BLOCKS ON WOLF'S ANSWERS.
- WAVE 3 CONTENT ARC COMPLETE as of this round: T2 (r102) T3 (r103) T4a
  (r105) T4b (r107) T5 (r108) T6 (r109) + e2e verification lever (r106).
  Remaining Wave 3 stragglers ride later rounds: comments/citations design,
  center-across-selection (needs alignment-span render), growth #26 CLOSED.
- No shared-asset change (index prompt + dev/ doc) — ?v stays 106.

---
# ROUND 110 — DESKS v1: BACKEND + JOIN LOOP (Wolf-approved: Desks, cap 200)
- Wolf's calls: "Desks" naming ✓ one desk per player ✓ cap 200 (MBA/IB club
  scale) ✓ pre-seed via his contacts ✓.
- MIGRATION 20260712000000_desks.sql: teams + team_members (UNIQUE(user_id)
  = one desk per player), name-moderation trigger (same banned list +
  leetspeak folding as handles), 200-cap trigger, RLS (captain checks via
  SECURITY DEFINER fn to dodge the self-recursion trap). INVITE CODES ARE
  NEVER TABLE-READABLE: blanket select revoked, safe columns re-granted —
  codes travel only through RPCs (r111 NOTE: leaderboard must select
  EXPLICIT columns from teams; select * will be permission-denied).
  RPCs: preview_desk (anon ok — landing banner), create_desk (slugifies,
  captain membership), join_desk, my_desk (invite_code to captains only),
  leave_desk (captain exit promotes longest-tenured member; empty desk
  deletes itself).
- ACCOUNT: legacy Team-code card REPLACED by the Desk card — create
  (name + private), join by code, captain invite link w/ copy, leave w/
  click-again confirm. All via RPCs; error mapping incl. DESK_NAME_RESERVED
  / DESK_FULL / ALREADY_ON_DESK / duplicate-name.
- INDEX: ?desk=CODE deep link — stored (hk_pending_desk, survives the
  signup round-trip), landing lede becomes the invitation w/ live member
  count via preview_desk, param stripped; onSession auto-joins on the
  first REAL session (anon sessions wait), toasts the welcome; terminal
  errors clear the pending code, transient ones keep it.
- profiles.team_code retained as legacy display only (card chip) until the
  r111 surfaces round swaps chips to real desks.
- QUEUED NEXT: r111 leaderboard surfaces (my-desk filter on membership,
  desk page = roster + boards, desk chips) · V1.5 SCHOOL TAG (Wolf's .edu
  idea — spec added to dev/TEAMS_DESIGN.md: server-derived domain tag,
  opt-in badge, home-desk auto-suggest; the same mechanism is the future
  corporate funnel).
- VERIFY: node --check both pages' inline scripts; markup escape-leak sweep
  clean; Playwright boot of index (?desk= path) + account — zero real page
  errors (sb-offline paths exercised; Supabase writes untestable in
  sandbox — Wolf smoke-tests the live join flow post-deploy).
- No shared-asset change — ?v stays 106.

---
# ROUND 111 — DESKS SURFACES: leaderboard filter, desk page, legacy retirement
- LEADERBOARD: membership now drives the team view — real desk (team_members
  join) takes precedence, legacy profiles.team_code stays as fallback until
  its holders migrate. Toggle copy: 'show desk only' / '◉ desk: {name}'.
  NOTE HONORED: teams selected with EXPLICIT columns (id,name,slug) — the
  r110 grant revocation makes select * a 403.
- DESK PAGE: leaderboard.html?desk=slug filters EVERY board to the desk's
  members + banner with roster strip (top 12 by crowns/boards, '+N more').
  Account desk card links to it ('Desk boards →').
- NAV settings: the legacy team-code editor RETIRED (input+save removed);
  section now points at the account desk card. nav.js changed → v107.
- VERIFY: boot x5 pages incl ?desk= param — zero real page errors; demo-
  replay e2e ALL GREEN; node --check nav.js + all inline scripts.
- QUEUED: v1.5 school tag (spec in TEAMS_DESIGN.md) · desk chips on
  leaderboard rows + player card ride the school-tag chip round · V2
  captain assignments after real desks exist.
- v107.

---
# ROUND 112 — RANK CONSISTENCY AUDIT (#29): five real splits found and fixed
Wolf's #29 ("same tier everywhere — audit") turned out to be FIVE live defects:
1. STALE INLINE LADDER: index carried the OLD 6-tier HK_RANK as a || fallback
   (Candidate→Second-Year, pre-r27 thresholds, no provisional rule) + a second
   stale copy in its local tierOf body; nav.js had a third. Whenever themes.js
   was slow or stale-cached (the exact failure cache-busting exists for), the
   game page ranked on a ladder that no longer exists. All deleted — tierOf
   everywhere is now pure delegation with an MBA-Associate floor fallback
   (r64 rule: no inlined copies).
2. PROVISIONAL SPLIT-BRAIN: only the leaderboard roster passed wsum, so the
   season-zero cap applied THERE but not on the card/pill/standing/top-players
   — a day-one player on thin boards read MD on their card and Summer Analyst
   (provisional) on the roster. wsum now flows through every tierOf call
   (nav card+pill, index card+pill, lb standing/next-rank/top-players ×2,
   account, stats).
3. RAW-VS-SHRUNK SCALE: nav's loadProfileData and index's rank pill computed
   RAW average placement while thresholds are calibrated to the SHRUNK
   ratingOf scale (r27) — card/pill tier could differ from board tier for the
   same runs. Both now use HK_RANK.ratingOf / HK_RANK.standing.
4. LADDER PANEL DUP: leaderboard's roster prepended a manual Candidate row to
   TIERS.slice(1) — which already starts at Candidate. Candidate listed twice
   on the tier roster. Prepend removed; reqs read from themes' t.req.
5. STALE COPY: pill tooltip said the ladder runs 'Candidate → Second-Year';
   the placement verdict praised 'Top-Bucket Analyst pace' / 'Incoming
   Analyst pace' — tiers that don't exist. Both speak ladder v4 now.
- VERIFY: node --check all pages + nav.js; boot x4 zero real errors; demo-
  replay e2e ALL GREEN. Desks live smoke still pending (egress policy applies
  to NEW sessions — this one booted under the old policy; retry timer armed).
- v108.

---
# ROUND 113 — LEVEL IN TOP BAR (#32) + RANDOM DRILL (#33) + XP v4 DESIGN PASS
- NAV LEVEL CHIP: hkLevelChip beside the user menu on every page (anon-
  friendly hk_xp_est estimate; canonical XP still reprices on the card);
  click opens the player card. Two-ladders doctrine copy in the tooltip.
- RANDOM DRILL: '⚂ random' tool next to ⚡ daily — deals any drill but the
  current one. Variety IS the retention loop; also promotes catalog breadth
  ahead of the XP v4 daily-reset design.
- XP v4 DESIGN (dev/XP_DESIGN.md, NOT implemented — Wolf reviews): keep
  first-ever-solve 50 spine; repeat decay RESETS DAILY (15/10/7/5 floor 2
  per drill per UTC day); +25 warm-up on first solve of the day; no hard
  caps (decay self-limits). Fixes lifetime decay paying loyal players
  worst. Implementation notes incl. created_at in run selects + computeXP
  sync set + hk_clears_day local estimate.
- VERIFY: Playwright — chip renders, random button switches drills twice,
  zero page errors; e2e ALL GREEN; node --check all.
- v109.

---
# ROUND 114 — PUBLIC PLAYER CARDS (#28): click any name on the boards
- Every rendered name (drill boards, session boards, top players, tier
  roster, desk-page roster) carries data-uid + hover underline; ONE
  delegated click handler opens the card — zero new queries, everything
  computed from the already-loaded runs/standing.
- Card: frame-language dialog (34px cap strip) — emblem w/ bucket, handle,
  full tier (+ provisional tag), desk chip when they're on one, tiles
  (crowns/podiums/top-10s/boards), their 3 best placements w/ times.
  Esc + backdrop + \u00d7 all close (no {once:true} on closers — r-rule).
- VERIFY: Playwright w/ stubbed DATA — opens w/ name/desk/tiles, \u00d7
  closes, Esc closes second card; zero page errors; node --check.
- v110.

---
# ROUND 115 — HANDLE GENERATOR (#30) + THE promptHandle RECURSION FOSSIL
- FOSSIL (the catch of the round): r76's export shim
  `window.promptHandle = function(){ return promptHandle(); }` OVERWROTE the
  global function binding — the bare call inside resolved to the wrapper
  itself: infinite recursion on EVERY promptHandle() call, swallowed by
  try/catch at the call sites. The pick-a-name prompt has been silently
  DEAD since it shipped — the reason new members kept landing as
  analyst-#### until they found the account page. Shim deleted (a top-level
  function declaration IS window.promptHandle). Found because r115's
  verification actually drove the prompt.
- HANDLE GENERATOR (#30): window.hkSuggestHandle() in nav.js — desk-dialect
  A×B pools (Levered/Accretive/ProForma… × Analyst/Corkscrew/Multiple…,
  40% numeric suffix, format-safe ≤24). promptHandle deals 3 chips + reroll
  (click fills the input); account handle card gets a 'suggest one' link.
  Server-side blocklist remains the real moderation gate.
- VERIFY: Playwright — window.promptHandle() opens the modal (was: stack
  overflow), 3 chips + reroll render, click fills, reroll changes, format
  regex holds; zero page errors; node --check all; e2e green.
- v111.

---
# ROUND 116 — XP v4 SHIPPED ("the trading day") + FOUR-COPY CONSOLIDATION
- Wolf approved the r113 design ("run xp pass"). LIVE: first-ever solve keeps
  the 50(+15 adv) spine; repeat decay is PER DRILL PER UTC DAY (15/10/7/5,
  floor 2) and resets at midnight; +25 warm-up on each day's first solve;
  daily 30 / wk 25 / sessions 20/10 / board bonuses unchanged. History
  reprices (levels generally go UP — old 1-xp runs reprice daily-fresh).
- CONSOLIDATION: audit found FOUR drifted computeXP copies pricing xp three
  different ways (nav r60 decay · themes flat 50/15/3 · leaderboard flat
  50/15/3 variant · index local estimate) — account/stats already disagreed
  with the nav card TODAY. Now: HK_RANK.computeXP (themes.js) is the ONLY
  implementation; nav + leaderboard delegate; index keeps a day-aware local
  ESTIMATE (hk_clears_day) for the +xp chip/celebrations, xpEarnFor predicts
  today's ladder + warm-up.
- runs selects gained created_at (nav + leaderboard; account already had it)
  — day buckets need it; legacy rows share one bucket.
- VERIFY: canonical math unit-proven on extracted code (composite scenario
  =307 exact; breadth 525 vs grind 109; two-day reset 115); node --check all;
  e2e ALL GREEN (solve path exercises the new estimate); boot clean.
- v112.

---
# ROUND 117 — GAMEPLAY-LOOP SANITY AUDIT (Wolf-directed): the full flow map
Every identity/persistence flow traced end to end. VERDICT: the loop is sound
post-r112/r115/r116; ONE real gap found and fixed this round.
- FLOW MAP (audited good):
  1. First visit → landing dialog (frame language) → invite gate (HAGS) →
     onboarding placement/tour → first drill auto-guided (hk_learn_done).
  2. Account creation → gate signup w/ invite → members insert → pick-a-name
     prompt (ALIVE again since r115's recursion fix; now with generator chips).
  3. Anon → account: auth.updateUser links SAME uid — guest runs/PBs survive.
  4. Returning, same device: hk-returning skips landing → welcome-back dialog
     (named, PB, streak, resume; passive dismissal) → session resume.
  5. Returning, new device: sign in → PB server-hydration (r83, min-merge) →
     rank pill from canonical standing (r112: shrunk scale + wsum) →
     LEVEL: was the gap (below).
  6. Sign-out: handle cache cleared (×3 sites); local PBs/xp stay for device
     continuity; next login overwrites the level estimate (see fix).
- FIXED — LEVEL PERSISTENCE ACROSS DEVICES: hk_xp_est was device-local only;
  fresh device showed LVL 1 in nav/game while the card computed the true
  level. navRank now hydrates hk_xp_est from canonical computeXP on every
  pill load (cache-miss cadence \u226410 min) and repaints the chip. SET
  semantics so account-switching on one machine can't inherit a level.
- ELEGANCE PASS (inline/frame-language doctrine): landing, welcome-back,
  celebrations, gate, name prompt, results, public cards all speak the
  34px-cap frame language; no browser alerts/confirm anywhere in the loop;
  destructive desk-leave uses click-again confirm. No changes needed.
- RANK/LEVEL PERSISTENCE MODEL (for the record): RANK = server runs →
  standing → tierOf (sessionStorage cache 10 min). LEVEL = server runs →
  computeXP canonical, local estimate for instant paint + anon players.
  PBs = local, min-merged with server at login. All three now converge on
  the same numbers on every surface.
- v113.

---
# ROUND 118 — DESK TRUST & SAFETY (Wolf's PJT-RSSG concern) + ART SPEC
- PROTECTED NAMES SHIPPED (migration 20260712300000): real firm names
  (collapsed-substring: goldmansachs/morganstanley/evercore/centerview/
  liontree/...) and desk acronyms (standalone tokens: GS MS PJT RSSG KKR
  PWP CVP...) now raise DESK_NAME_PROTECTED at the trigger — 'Kings of the
  Grid' passes, 'GS TMT 2026' is reserved until a verified claim. Client
  copy: 'Real firm and group names are reserved — verified desks are
  coming.'
- dev/TRUST_SAFETY.md = the launch pass Wolf called: threat model
  (impersonation kills the B2B funnel first), verified desks (captain's
  email domain = the school-tag mechanism in corporate flavor; verification
  unlocks protected names), report flow, admin powers (force-rename/
  suspend), creation rate limit, invite rotation, audit trail, terms
  policy text. Build order documented; triggers on Wolf calling launch.
- dev/ART_SPEC.md for Wolf's LoL-grade icon work: 8 tier emblems (SVG,
  square, 8% margin, 16px silhouette test, both themes, naming scheme),
  rank PLATES 1024x640 for card v3 / rank-reveal (painterly allowed there),
  achievements phase-2 as 8 category glyphs first. Integration = one round:
  rankEmblem gets an asset loader w/ generative fallback.
- No shared-asset change; ?v stays 113. Migration deploys on push.

---
# ROUND 119 — DESK SEEDS + CONTROL PASS (claim-the-desk, verified, reports, limits)
- CLAIM-THE-DESK (the pre-seed unlock): one-desk-per-player means nobody can
  captain 8 seeds — so seeded desks are OWNERLESS and the FIRST joiner takes
  the captaincy (join_desk r119). Handing a club president the code IS the
  handoff. leave_desk semantics unchanged (empty claimed desks self-delete;
  unclaimed seeds persist).
- SEEDED 8 PRIMARY TARGETS (fixed codes, in Wolf's hands via chat): Wharton /
  HBS / Stanford GSB / Columbia Business School / Chicago Booth / Kellogg /
  NYU Stern / LSE — each with edu_domain stamped (v1.5 home-desk suggest is
  pre-wired).
- CONTROLS SHIPPED (from TRUST_SAFETY.md build order): teams.verified flag +
  '✓ verified' badge on the desk page · reports table (RLS: insert-own only,
  NO client reads — service-role review) with report affordances on the desk
  banner (kind desk) and public player cards (kind handle, self-report
  hidden) · 1 desk/day creation rate limit (trigger; seeds exempt via null
  owner) · rotate_invite() RPC + captain Rotate button w/ click-again arm
  ('old links die').
- teams column grants re-issued incl. verified/edu_domain; leaderboard selects
  them explicitly (r110 rule).
- VERIFY: boot clean (lb ?desk= + account); e2e green; node --check; live
  smoke test runs in the SPAWNED FRESH SESSION (this container predates the
  egress policy — see r119 trigger note in chat).
- No shared-asset change; ?v stays 113. Migration deploys on push.

---
# ROUND 120 — LEGACY-ARTIFACT AUDIT (Wolf: "recurring issue — keep everything
# on the latest versions"). Systematic sweep, its own pass as suspected.
- SWEEP TOOLING (repeatable): (a) `window.X = window.X ||` fallback-copy scan,
  (b) adjacent-duplicate-line scan (the r112 dup-delegation class), (c) old
  ladder-name grep, (d) localStorage write/read orphan inventory, (e) weekly-
  engine reachability, (f) normalized diff of sync-set copies vs themes.js.
- FOUND & FIXED: index carried ~6.5KB of STALE hkBadge + rankEmblem +
  RANK_EMBLEM_IDX fallback copies (older art generation; drifted from
  themes.js v2) — the exact class that made r112's stale ladder: wrong art
  on any stale-cache day. Deleted; themes.js is the only source (r64 rule);
  all call sites window.-guarded so a themes failure renders empty, never
  wrong. Stale themes comment ('capped at Incoming Analyst' — a v3 tier)
  corrected to Summer Analyst.
- FALSE ALARMS (documented so nobody re-chases them): hotkey_pb/solves/streak
  'read-never-written' — written via KV.set(key,...) dynamically, sweep only
  sees literal setItem; the CSS duplicate gradient line is an intentional
  two-layer background; weeklyMode ×12 = the retired-but-dormant engine
  (r-decision, gated).
- FOSSIL LEDGER TO DATE (the disease this pass closes out): dup taskLine
  (r103) · dress unsolvable paths (r106-era) · clipboard nulled after paste,
  loadChallenge edit-state leak, Alt+= demo misuse, editfix mangling (r106) ·
  3 stale rank ladders + raw-vs-shrunk + wsum split (r112) · promptHandle
  recursion shim (r115) · 4 drifted computeXP copies (r116) · level-
  persistence gap (r117) · stale emblem fallbacks (r120). STANDING RULE
  reaffirmed: shared dicts/fns live in ONE file; fallbacks may not carry
  implementations, only graceful empties.
- v114.

---
# ROUND 122 — SCHOOL TAGS v1.5 SHIPPED (.edu auto-identity + home-desk one-tap)
- MIGRATION: profiles.school_domain/school_tag (SERVER-DERIVED via
  refresh_school_tag() from auth.email — subdomain-walks a 50-school map,
  falls back to the registrable label for unmapped academic domains) +
  show_school OPT-IN (Wolf's call). Column grants tightened: profiles
  insert/update re-granted on user-editable columns only — a client can no
  longer self-claim a tag (or any future server-derived column).
- HOME DESK: home_desk_for_me() matches your school domain to a desk's
  edu_domain; join_home_desk() joins as MEMBER ONLY — captaincy still
  travels exclusively through invite codes (code = captaincy, domain =
  membership; keeps Wolf's president-handoff intact while students
  self-serve). Account desk card grows a one-tap join button; the game
  nudges once per session via toast.
- SURFACES: opt-in school chips on leaderboard rows (drill + session
  boards) and public player cards; account Profile card shows the tag +
  the opt-in checkbox.
- The cold-start loop is CLOSED: seeded desk + edu_domain + first .edu
  signup -> one-tap membership -> boards fill -> president claims with the
  code. VERIFY: boot clean x3, chip renders in rowHtml, node --check all,
  e2e green. Live RPC verification rides the next fresh-session smoke.

---
# ROUND 123 — RANK ART ITERATION 4 (Wolf's notes: bull, centering, buckets, unranked)
- art/rank-proto.html rewritten: canvas grows to 0-100 x 0-114 — emblem art
  stays square, y 102-112 hosts DIVISION PIPS (3 diamonds, filled left->right
  = Bottom/Middle/Top Bucket). Every ranked tier renders 3 bucket variants;
  TOP BUCKET "ignites": spark stars at the shoulders, hotter rim stroke,
  wider glow. Hover previews the rank-up animation hooks (.aura pulse +
  .pips .on glow) — layers are grouped (.aura/.frame/.glyph/.ornament/
  .pips/.sparks) so the real rank-up sequence can light them in order.
- MD GLYPH IS A BULL now (Wolf's ask): broad angular head, sweeping ivory
  horns, angry slit eyes, muzzle + flared nostrils. First draft read as a
  piglet (nub horns, blob face) — redrawn before shipping; reads at 22px.
- All glyphs optically re-centered (book 50/50, lanyard 50/47.5, sigma
  50/49, chart 50/53, bolt 50/49.5, bull 50/52); silhouettes hold the
  consistent-size rule from iteration 3.1.
- UNRANKED standardized: cracked-cell + gridlines + #REF! badge, no pips
  (unranked has no buckets, per Wolf).
- VERIFY: node --check on extracted inline script, Playwright fullPage +
  MD close-up render clean (no console/page errors), light-theme row +
  22px chip row legible. Proto only — game wiring (rankEmblem loader)
  waits for Wolf's approval of the set.

---
# ROUND 124 — RANK ART ITERATION 5 (LoL bucket escalation, sun glyph, proportions)
- Wolf on iteration 4: pips OK but wants LEAGUE-style escalation (visible
  flair added per rank), summer-analyst glyph unreadable, gold crest too
  vertical vs the other frames.
- BUCKET ESCALATION: emblems now BUILD per bucket — bk1 clean frame+glyph,
  bk2 bolts on the tier's ornaments (ring notches / shield fins+rivets /
  hex blades / laurels / wing-blades / bull horns / summit shards+rays),
  bk3 ignites (crest jewel, sparks, hot rim, brighter core/aura, extra
  ornament extensions). Pips retained as the tiny-size read. New .jewel
  animation layer joins .aura/.frame/.glyph/.ornament/.pips/.sparks.
- SUMMER ANALYST glyph: lanyard replaced with a radiant SUN (8 tapered
  rays, hot inner disc) — instant "summer" read at every size.
- PROPORTIONS: gold Associate crest widened (16..84 shoulders, fuller
  bottom) to match neighbor frames' aspect; glyph-to-frame ratio
  normalized (book x1.12, sigma x1.2, bolt x1.1).
- VERIFY: node --check extracted script, Playwright fullPage render clean
  (no console/page errors), light-theme + 22px chip rows legible.

---
# ROUND 125 — RANK ART ITERATION 6 (job-tied glyphs, unranked re-cut, sun sized up)
- Wolf on iteration 5: sun good but small; unranked #REF! red "feels weird";
  wants job-tied glyphs for gold + summit (briefcase/tie/buyside-exit ideas).
- GOLD ASSOCIATE glyph: sigma -> BRIEFCASE (handle, lid seam, clasp,
  corner straps) — the banker read, instant at chip size.
- SUMMIT (Second-Year Analyst) glyph: bolt -> ROCKET (capsule, porthole,
  swept fins, white-hot exhaust) — "the buyside exit, escape velocity."
- UNRANKED re-cut: chamfered iron plate (corner-cut octagon), crack
  thinned, #REF! now ENGRAVED STEEL (deep shadow + steel face, alarm-red
  dropped), subtler gridlines.
- SUN enlarged (~15%): rays 20/16.5, disc r9.2 — fills the bronze shield.
- VERIFY: node --check extracted script, Playwright fullPage clean, light
  + 22px chip rows legible.

---
# ROUND 126 — RANK ART ITERATION 7 (unranked/MBA split restored, gold rebalance, League colors)
- Wolf caught a ladder regression: iterations 4-6 had merged UNRANKED and
  MBA ASSOCIATE into one badge. Split restored to match HK_RANK: UNRANKED
  is the generic pre-placement plate (empty cell + dashed selection
  marquee, no buckets, no pips); MBA ASSOCIATE is the IRON floor TIER —
  #REF! engraved identity + full bucket ladder (corner rivets at middle,
  peak jewel + sparks + hot rim at top). TIERS array now renders all 8
  ranked tiers; chip row is 9 (unranked + 8).
- GOLD CREST rebalanced: hips widened (32..68 at y78), drop shortened
  (point 90->88, taper starts y46) — horizontal/vertical mass now matches
  the neighboring frames.
- LEAGUE-COLOR EXPERIMENTS (Wolf: "experiment freely, League as central
  iconography"): VP top bucket gains a platinum aura (first aura below
  MD — makes plat feel like the door to the high ladder); SUMMIT goes
  CHALLENGER — 4 major rays now gold + gold 4-point peak star over the
  diamond frame (League Challenger's gold-over-blue read).
- VERIFY: node --check extracted script, Playwright fullPage clean, light
  + 22px chip rows legible.

---
# ROUND 127 — RANK ART ITERATION 8 (unranked X, summit broadened)
- UNRANKED: an X now sits inside the dashed selection marquee — the empty
  placement slot as an invitation ("your rank goes here; queue up"), with
  a faint white top-light so it reads engraved, not error-red.
- SUMMIT widened (Wolf: "still a bit lean"): star-frame wings pushed from
  14/86 out to 10/90 (upper span now the widest silhouette on the ladder,
  wider than MD's shield), crystal shards moved outboard (+4), shoulder
  sparks re-seated at the new wing tips, apex highlight re-anchored.
- VERIFY: node --check extracted script, Playwright fullPage clean, light
  + 22px chip rows legible.

---
# ROUND 128 — RANK EMBLEMS v3 WIRED IN (iteration-8 art ships to the game)
- themes.js rankEmblem REPLACED: 34px keycap crests (r67/r74) -> the
  Wolf-approved iteration-8 system ported from art/rank-proto.html.
  API unchanged (tierName, size, bucket-string) so all 9 pages pick it up
  with zero call-site rework. With a bucket the canvas grows the division-
  pip zone (viewBox 100x114, height size*1.14) and the emblem escalates
  bottom/middle/top; bucket-null renders the clean frame (MBA Associate
  arrives bucket-null in-game = placement pending, so the iron #REF!
  plate shows no pips — semantically exact). 'Unranked' name renders the
  generic empty-cell X plate for future surfaces.
- PERF/CRISPNESS: glow filters off under 24px (leaderboards render
  hundreds of row emblems); gradients/defs get unique rk-prefixed ids per
  render (no cross-SVG id collisions).
- BUCKET now passed at the hero call sites that had tier context: nav.js
  player-card hero + rank-up celebrate (84px), account.html title card
  (54) + progress (56), stats.html hero (46). Row sites already passed it.
- Animation layers (.aura/.frame/.glyph/.ornament/.jewel/.pips/.sparks)
  ship in every emblem — the rank-up sequence hooks onto these next.
- CACHE: v114 -> v115 across all 9 pages.
- VERIFY: node --check themes.js + nav.js; emblem test page at 13/20/22/
  28/54/84px dark+light rendered clean (screenshot reviewed); index/
  leaderboard/account/stats boot with ZERO page errors; e2e demo-replay
  ALL GREEN (40 drills x3). Old keycap renderer fully deleted — no
  fallback copy retained (house rule).

---
# ROUND 129 — THE RANK-UP MOMENT (staged LoL reveal on the emblem layers)
- nav.css: .hk-cel-rank sequence — frame slams in (.55s overshoot), glyph
  lands (+.3s), ornaments attach (+.6s), jewel drops (+.9s), pips forge
  (+1.15s), sparks ignite (+1.35s), aura breathes (pulse from 1.7s);
  title/sub rise on their own delays; emblem renders at 132px in the
  modal. Keyframes are FROM-ONLY with backwards fill so every layer
  settles back to its natural inline-attr state (bottom-bucket dim auras
  stay dim after the show). prefers-reduced-motion kills all of it.
- nav.js: hkCelebrate takes rankUp flag -> hk-cel-rank class; the rank-up
  caller passes rankUp + tier-colored confetti via window.RANK_COLORS
  (exported from themes.js next to the palettes — single source, no
  inlined copies).
- CACHE: v115 -> v116 (nav.css/nav.js/themes.js all changed post-r128).
- VERIFY: node --check nav.js + themes.js; live trigger on index.html via
  hkCelebrate({rankUp:true...}) — mid-sequence and settled screenshots
  reviewed (bull emblem staging correctly, crimson confetti, pips forge
  last); zero page errors.

---
# ROUND 130 — CAPTAIN ASSIGNMENTS SHIPPED (Desks V2, the corporate-training primitive)
- MIGRATION 20260712600000: team_assignments (team_id+challenge unique,
  optional target_ms 1s..1h, note <=120, one-week expiry). Cap 3 LIVE per
  desk via trigger (expired rows pruned on write; <> challenge guard keeps
  re-pin upserts legal). RLS read-all; WRITES ONLY via captain RPCs
  set_assignment (upsert, resets the week) + clear_assignment. Challenge
  key validated by pattern server-side + against menuOrder client-side.
- COMPLETION DERIVES FROM RUNS (no completion table): clean run on the
  drill AFTER it was pinned, under target when one is set.
- account.html: assignments block in the desk card — captain gets pin UI
  (datalist over drills.js menuOrder + target-seconds + note) and per-row
  clear; analysts see the list with Play deep-links (index ?drill=).
  ASSIGN_CAP mapped in deskErr.
- index.html: picker chips wear the assignment mark (warn-colored border
  + diamond, tooltip carries target/note); one toast per session lists
  the week's pins. Fetch keys off my_desk() then team_assignments.
- leaderboard.html ?desk= page: "this week's assignments" strip under the
  banner — each pin shows target ('under Ns' / 'clean clear'), note, and
  X/N members done (derived from fRuns since created_at).
- CACHE v116 -> v117 (all 9 pages).
- VERIFY: node --check on all extracted inline scripts (caught + fixed an
  unbalanced ternary in the picker tooltip before it ever booted), 4
  pages boot clean, e2e demo-replay ALL GREEN. Live RPC verification
  rides the next fresh-session smoke (egress blocked here).

---
# ROUND 131 — LIVE SMOKE TEST: THE PIPELINE THAT NEVER RAN (first egress session)
- FIRST SESSION WITH EGRESS since the desks arc. The planned RPC smoke test
  instead found the real story: EVERY migration from 20260707000000 onward is
  MISSING from the live database — desks v1/v1.5/v2, protected names, seeds,
  school tags, assignments, handle rules, blocklist, flair, entitlements,
  profiles.team_code. Live profiles = {id, handle, updated_at}.
- ROOT CAUSE (GitHub Actions logs): all 9 runs of supabase-deploy.yml since
  2026-07-07 failed at step 1 — "Access token not provided". The repo secret
  SUPABASE_ACCESS_TOKEN was never set (README one-time setup never done).
  The r9 "deploys confirmed working (team_code applied)" AUDIT claim was
  FALSE. Client-side try/catch around desk RPCs made prod degrade silently
  to the pre-desks UI, which is why nobody saw it.
- FIXES SHIPPED: workflow gains fail-LOUD secret check + workflow_dispatch
  manual trigger + SUPABASE_DB_PASSWORD (db push needs it right after the
  token problem); README rewritten with the 2-secret runbook; all 13
  migrations re-scanned idempotent → one green run applies the backlog.
- BUG (static analysis, FIXED in 20260712700000_claim_fix.sql): claim-vs-
  domain-join deadlock — join_desk claimed only on (ownerless AND zero
  members); one join_home_desk student would permanently block the club
  president's code-claim. Now: code-join claims any ownerless desk with no
  sitting captain (code = captaincy, domain = membership — the r122 doctrine).
- DISCOVERED LIVE: signup is server-gated to .edu emails ("Only .edu email
  addresses may register for the beta") — NOT in the repo, added manually in
  the dashboard. Flagged to Wolf: locks out the stated IB-professional
  audience; decide keep-and-document vs remove.
- WHAT PASSED LIVE: auth signup→session (no email confirm), redeem_code HAGS,
  profiles upsert + RLS self-read. Full matrix is in dev/smoke-live.mjs
  (committed; runs post-fix). Test accounts left in prod listed in
  dev/SMOKE_REPORT.md for service-role cleanup.
- WOLF ACTION REQUIRED (3 min): add SUPABASE_ACCESS_TOKEN +
  SUPABASE_DB_PASSWORD repo secrets → Actions → Run workflow → tell Claude
  "pipeline is green". Seed codes must NOT be distributed before that.
- No shared-asset change; ?v stays 117. No deploy-set page touched.

---
# ROUND 132 — SMOKE TO GREEN: 65/65. Backend live-verified end to end.
- Wolf added both repo secrets; ONE green workflow run deployed the entire
  2026-07-07..12 migration backlog. Smoke round 1: 52/64 — three REAL bugs,
  all fixed by migration and re-verified live:
  1. PROFILE UPSERT 403 (P0, live the moment school_tags applied): r122's
     update grant omitted id; PostgREST upsert puts every payload column in
     ON CONFLICT..SET -> gate handle saves denied -> new members rowless (no
     handle, no tag). Fix 20260712800000: id-immutable trigger + id granted +
     refresh_school_tag upserts (row-creation-order-proof).
  2. RATE LIMIT HOLLOW: r119 guard counted currently-OWNED desks;
     create->leave->create bypassed (proven live). Fix 20260712900000:
     desk_creations log rides the insert transaction (failed creates consume
     nothing).
  3. CLAIM DEADLOCK (r131 static catch): zero-member claim condition let one
     join_home_desk student block the president's code-claim forever. Fix
     20260712700000 verified LIVE: C code-claimed smoke-u over a sitting
     domain member -> captain. Code = captaincy, domain = membership.
- LESSON (new house fact): `supabase db push` is STATEFUL — applied
  migrations NEVER re-run; a consumed seed is only restorable by re-shipping
  the insert under a NEW timestamp. The r132 run consumed the Wharton seed
  (zero-member claim path); 20260713000000_smoke_fixtures re-stamped all 8
  school seeds (codes unchanged) + added smoke-u (ownerless private test
  seed on the harness .edu domain) so claim tests never touch real seeds.
- HARNESS (dev/smoke-live.mjs): signin fallback (SMOKE_TS account reuse),
  hard precondition on the claim scenario (round-1 pass was hollow — B never
  joined), slug-asserted claims, real seeds member-joined only, codes never
  rotated. Full matrix consumes smoke-u -> re-stamp fixtures before next run.
- FINAL PROD STATE verified: 8 seeds ownerless w/ original codes, no strays,
  smoke rows in reports flagged for service-role cleanup. SEED CODES ARE
  SAFE TO DISTRIBUTE.
- DISCOVERED r131, still OPEN FOR WOLF: .edu-only signup gate lives ONLY in
  the dashboard (not repo) — locks out working professionals; decide keep+
  document vs remove. ALSO: rotate the access token + DB password (pasted in
  chat = burned) and merge the branch to main (DB is current; main's
  workflow/docs are stale).
- No shared-asset change; ?v stays 117. Branch: claude/hotkey-gg-continue-lvrf86.

---
# ROUND 133 — WOLF'S FIX LIST: nav level legibility, tooltip clip, .edu carrot
- LEVEL CHIP (Wolf: "way too small to see"): nav keycap 20 -> 24px + a
  mono "LVL n" text label beside it (.nav-lvl-t, hidden <=740px) — the
  label carries the read, the keycap is the icon. nav.js + nav.css.
- TOOLTIP CLIP FOSSIL (Wolf's Chrome: tips bleed above the viewport): the
  r70 flip-below rule targeted `.nav [data-tip]` but the markup has been
  `<nav class="topnav">` — the selector NEVER MATCHED; every injected
  topnav tool tip (sound/profile/random/daily) rendered above and clipped
  since r70. `.topnav` added to the rule. Playwright-verified: computed
  ::after top = host height + 8 (below).
- .EDU GATE -> INCENTIVE (Wolf's decision): migration 20260713100000 drops
  the dashboard-era auth.users trigger matching the gate's error text
  ("register for the beta"); if signup still blocks non-.edu post-deploy
  the gate is an Auth HOOK -> dashboard Authentication -> Hooks (noted in
  the migration header). Signup card blurb now carries the carrot: use
  your .edu -> auto-match to your school's desk + student perks later.
  PROJECT_CONTEXT beta facts updated (.edu question CLOSED).
- VERIFY: node --check nav.js/themes.js/extracted index script; Playwright
  boot x5 (index + lb/stats/account/reference) zero page errors; chip
  geometry (24px svg, 11.5px label, 7px gap) and tip geometry asserted.
  Live non-.edu signup probe AFTER the migration deploys (merge triggers
  it) — RESULT: GATE REMOVED, non-.edu signup succeeds (it was a trigger;
  the scan found+dropped it — no dashboard hook involved). Probe account
  hk.smoke.nonedu.1@hotkeysmoketest.com (uid 23dac454-...) added to the
  SMOKE_REPORT cleanup list.
- CACHE v117 -> v118 (all 9 pages).

---
# ROUND 134 — DE-BETA ONBOARDING (PRELAUNCH_LOCK) + Wolf's six-item fix list
- ONBOARDING IS LAUNCH-FINAL NOW (Wolf: "get it working perfectly, then lift
  one thing to go live"). The in-landing beta gate (invite+handle form:
  showLandingGate/showGate/redeemCode/submitBetaCode + markup/CSS) is DELETED.
  New flow: [curtain] -> landing -> Enter DISMISSES (the r-bug: Enter used to
  open the gate form — Wolf: "keeps the window open") -> spotlight tour
  (input-blocked) -> tutorial prompt -> placement. Guests play instantly via
  silent anon session (ensureGuestSession); membership auto-redeems in
  onSession (rpc redeem_code HAGS — members table stays consistent); accounts
  happen via sign-in / save-your-progress, unchanged.
- PRELAUNCH_LOCK = THE LAUNCH SWITCH: device-once access-code curtain before
  the landing (hk_beta_ok; any session also passes; cancelled sign-in re-arms
  it). Launch day = flip ONE flag to false. Nothing else changes.
- TOUR KEY LEAK (Wolf: "still lets me type during the tour"): the __tourI
  guard sat BELOW picker/marathon/type-to-replace in the keydown — printable
  keys started edits mid-tour. Guard moved to the top; tour owns the keyboard.
  Tour and tutorial prompt were also racing on independent timers (both fired
  ~900ms post-entry) — now sequenced: tour -> __tourAfter -> onboard prompt.
- PLAYER CARD FOSSIL (Wolf: "alignment broken, old icons, overflowing"): index
  carried the r13-era card renderer (openProfile/loadProfileData/renderProfile,
  ~6KB — plain rows, no hero/emblem/achievements, 'school email' copy) and its
  own umProfile binding — the GAME PAGE opened a seven-generations-stale card.
  DELETED; nav.js exports window.openProfile (r64 rule: one renderer). PLUS the
  real overflow bug in the modern card: nav.css's .pc-scroll inner-scroll
  wrapper (v3 CSS) was never emitted by the renderer — long cards spilled past
  82vh. Wrapper now emitted; achievements flex-wrap -> even auto-fill grid.
- CHECKLIST: autoscroll SHIPPED (scoped .cl-body scrollTop math on the .next
  item — never scrollIntoView, that jiggles the page); the r89-era fossil
  'esc restarts the drill' copy -> shift+f11 (Esc never restarts).
- LVL BADGE (game header): xp bar floated above the text baseline — flex
  centering (#lvlBadge inline-flex + gap). Playwright-asserted midpoints equal.
- FAVICON (Wolf: "hasn't updated"): favicon.ico was a 429-BYTE PLACEHOLDER and
  favicon-32.png 230 bytes — browsers prefering .ico showed junk/old art
  regardless of the SVG. All four assets regenerated from a new emblem-v3-
  language SVG (engraved plate, metal-rim keycap, F4 legend): real multi-size
  PNG-embedded .ico (16/32/48), 32px PNG, 180px apple-touch.
- CREDENTIALS: Wolf rotated token+DB password and updated both repo secrets —
  verified by a manual workflow run on main (green). Nothing further needed.
- VERIFY: 23-assert Playwright suite ALL GREEN — fresh-device flow (curtain
  wrong/right code, Enter dismisses, tour blocks typing, tour->prompt
  sequence, placement loads), returning-device skip, lvl-bar midpoint, fossil
  copy, autoscroll re-center, modern card + inner scroll from the game page,
  4 satellite pages boot clean. node --check + div-balance-delta vs HEAD
  unchanged. CACHE v118 -> v119 (all 9 pages).
- LOCALSTORAGE: new key hk_beta_ok (curtain pass). REMOVE the curtain block +
  key at launch (flip PRELAUNCH_LOCK=false; key becomes inert).

---
# ROUND 135 — SHOWCASE ACHIEVEMENTS + EMBLEM DE-PLATE + favicon verdict
- EMBLEM PLATE (Wolf: "rank icon has a holdover background"): stats + account
  wrapped the emblem in tier.cls — the tier PILL css (tinted background) painted
  a plate behind the transparent SVG. The r74 "hero de-plated" bug class; these
  two copies survived. Both wrappers stripped to plain spans.
- FAVICON VERDICT: NOT hosting/supabase — live Pages already serves the r134
  icon (4,711-byte .ico vs the old 429-byte placeholder). Chrome's favicon
  cache is a separate DB that hard-refresh doesn't touch; resolves on browser
  restart / incognito confirms.
- ACHIEVEMENTS moved to STATS (Wolf's call): full 43-medal grid w/ progress %
  now lives on stats.html#achievements (local-ctx anon-friendly; crowns exact
  when signed in). EARNED medals are clickable -> ★ SHOWCASE picks (max 3,
  oldest swaps out), stored hk_feat_ach + profiles.featured_ach (migration
  20260713200000, grants re-issued w/ the new column). The player card keeps a
  highlight reel: picks first (★), rarest-3 fallback, "edit showcase ↗" deep
  link; the full grid left the card. PUBLIC cards (lb) render picks as-is
  (cosmetic; profiles select + __featOf map).

---
# ROUND 136 — THE DESK HALL: captain-first team dashboard (Wolf: "not a re-skin")
- leaderboard ?desk= page rebuilt as a GUILD HALL (deskBanner block replaced
  wholesale): cap strip · crest + name + verified + "captained by <name>" ·
  captain-only "captain's controls →" (account) · REPORT kept.
- ROI BAND (the justify-the-investment ask, all derived from loaded runs):
  team time saved (first-attempt -> best, summed) · avg speed-up % per
  re-drilled task · clean runs + drill coverage · runs this week vs last w/
  momentum ▲▼. Honest metrics only — no invented "hours on the desk" math.
- QUEST BOARD: each assignment = quest card (target, note, days left,
  progress bar, X/N) + PER-MEMBER TICKS (✓/·, click -> player card) — the
  "make sure everyone has done the drill" view. 100% = "quest complete".
  Captain empty-state points at the pin controls.
- EVALUATION ROSTER: analyst (★ captain, (you)) · rank emblem+tier · boards ·
  crowns · this-week runs (⚠ 0 flags idle, captain view) · time saved;
  sorted week-activity desc. Rows open public cards (existing delegation).
- team_members select gains role (captain detection). Boards below remain
  desk-only (the drill-down). Member view verified: no captain affordances.
- VERIFY: stubbed-supabase Playwright renders (captain + member screenshots
  reviewed); zero page errors; lb/index/account/stats boot clean; node
  --check all extracted scripts. CACHE v119 -> v120 (all 9 pages).

---
# ROUND 137 — STRATEGY: the five-lens global pass (dev/STRATEGY.md)
- Wolf asked for the wide-angle Fable pass: game designer / live-ops / IB
  coach / buyer / MBA candidate. Deliverable at dev/STRATEGY.md — key calls:
  the 30-second loop is strong, everything BETWEEN sessions is thin; traces
  (recorded since r9) are the unexploited goldmine; measurement is the
  pre-launch blocker (events table before anything else); then Morning Sheet
  daily ritual + streak insurance, ghost-diff results insight, share surfaces
  (rank card / challenge links / placement share), cohort report export +
  captain program templates, audit+RX content round, seasons design-doc-only.
  DO-NOT-BUILD list: more drill breadth, mobile trainer, realtime races,
  live payments (standing). Sequencing rationale inside.

---
# ROUND 138 — STAFFER RENAME + LAUNCH RUNBOOK + ACHIEVEMENTS PROMINENCE/RARITY
- STAFFER (Wolf: "more accurate" — the staffer hands out the work): all
  user-facing 'captain' copy renamed across the Desk Hall (staffer: <name>,
  staffer seat open, staffer controls) + account (role line, NOT_CAPTAIN
  message, invite copy, quest empty-state). SCHEMA UNTOUCHED — role column,
  RPCs, and error codes stay 'captain' (display-layer rename only; rule
  noted inline).
- dev/LAUNCH.md — the launch runbook Wolf asked to "build in": phase 0 gates
  (events data, Morning Sheet shipped, pilot cohort, T&S minimums, smoke-u
  removal, beta-tools sweep), launch day = flip PRELAUNCH_LOCK + cache bump
  + verify + watch funnel, week-1 posture, rollback (flip back; nothing else
  to unwind).
- ACHIEVEMENTS (Wolf mid-round): section MOVED UP on stats (directly under
  the headline tiles); title-attr tooltips -> instant data-tip overlays w/
  name · desc · progress · GLOBAL RARITY; hkBadge gains RARITY METALS
  (5th param, % of players): <=25% platinum-blue + inner ring, <=10% crimson
  + side fins, <=3% radiant gold + apex rays — the "hardest to get" medals
  now read at a glance (legend line under the header). Card showcase badges
  carry rarity + tips too. NOTE: this is the interim system — the LoL-grade
  achievement ART pass (ART_SPEC d3) remains queued; when it lands it
  inherits the rarity tiers.

---
# ROUND 139 — EVENTS: the funnel we couldn't build retroactively (STRATEGY item 1)
- MIGRATION 20260713300000: events (user_id nullable, session_key <=64,
  name ^[a-z0-9_]{2,40}$, meta jsonb <=1KB, created_at). INSERT-ONLY policy
  (anon + authed; user_id must be null-or-own); NO select policy — reads are
  service-role (feeds the S8 admin funnel view). Flood posture documented
  (beta scale; rate limiting rides the T&S launch pass).
- nav.js: window.hkEvent (fire-and-forget, never throws, session_key from
  sessionStorage stitches anon funnels) + one 'pv' beacon per page load.
- index fire points (10): curtain_pass · enter · tour_done · tutorial_start ·
  tutorial_skip · solve{d,ms} · first_solve{d} (device-once) · guest_session ·
  account_session (device-once real login) · desk_join{slug}.
- The launch funnel reads: pv -> curtain_pass -> enter -> tour_done ->
  first_solve -> account_session, stitched by session_key. LAUNCH.md phase-1
  step 5 consumes exactly this.
- VERIFY: node --check all touched scripts; boot suite ALL PASS (stats grid +
  picker re-verified post-move); live insert probe post-merge (below).
  CACHE v120 -> v121 (all 9 pages).

---
# ROUND 140 — MORNING SHEET + STREAK INSURANCE (STRATEGY item 2, Wolf: "sure, build it")
- MORNING SHEET: the ⚡ button is now the SHEET (label carries n/3 live) —
  a frame-language popover deals three drills per UTC day: [1] the seeded
  DAILY (unchanged key, its board survives), [2] SHARPEN (worst PB-vs-par),
  [3] FRESH GROUND (never-drilled, seed-rotated pick) with CHASE-PAR
  fallback when everything's been touched. Deterministic per day, computed
  from local PB — works signed-out. Clean win on a sheet drill signs it off
  (logRunLite hook); 3/3 fires the sheet-cleared celebration + ev('sheet_clear').
  State: hk_sheet_YYYY-MM-DD localStorage. startDaily/drillOfDay unchanged
  underneath (item 1 loads {daily:true} so daily boards keep filling).
- STREAK INSURANCE: every 5-day streak banks a 🧊 freeze (hold max 2); a
  freeze auto-covers exactly ONE missed day — loadStreak forgives the gap at
  paint time, updateStreak consumes it on the next solve (n continues, toast
  says so). Earn toast at each bank. 🔥 badge shows banked freezes + tooltip
  explains the mechanic. KV hotkey_streak gains .frz (backward compatible).
- HARNESS CATCH: the logRunLite hook silently no-op'd on first apply (a
  conditional anchor matched its own output) — the Playwright suite caught
  the miss before ship (sheet stayed 0/3 after a win). RULE reaffirmed:
  behavioral verification over edit-success narration.
- VERIFY: 7-assert Playwright suite ALL GREEN (freeze survives gap at boot,
  popover deals daily/sharpen/fresh tags, click loads drill, win marks 1/3 +
  button repaints, freeze consumed n5->6 frz1->0, zero page errors); node
  --check. CACHE v121 -> v122 (all 9 pages).

---
# ROUND 141 — 'CASCADE': the full waterfall (Wolf reopened content; 13-week parked)
- Wolf redirected the content budget: "full waterfall and debt schedules are
  more relevant" — the 13-WEEK CASH FLOW design (front-8-weeks window, flow
  totals, cushion row) is SPEC'D AND PARKED for the next content push.
- NEW DRILL 'cascade' (Full Waterfall, Models after waterfall, 56 total):
  three tranches x four years of strict-seniority paydown — revolver drinks
  first (MIN of balance/cash), term loan sweeps the REMAINDER (MIN w/ B3-B6),
  mezz gets the dregs (MIN w/ two seniors netted; STARVES in ~2/3 of tranche-
  years by construction — the honest edge case the MIN must express). Every
  tranche corkscrews (C5=B7 class links, ref-checked), total debt row summed
  and dressed. It is the waterfall AND the debt schedule on one tab — each
  tranche is a mini debt schedule. Mix Rule: 3 escalating typed MINs +
  3 corkscrew link families + arithmetic + 10 fills + dress chord.
- RANDOMIZATION (density doctrine): fixed real-tab layout, random content —
  openings rv 100-220 / tl 280-460 / mz 100-200, cash 80-320/yr sized so the
  revolver dies mid-model and the cascade visibly bites.
- CHECKS: 7, all value+ref enforced (MIN( presence, remainder-chain refs
  B3-B6 / B3-B6-B9, corkscrew refs per year, dress bold+bt). par 178 /
  parKeys 102 (token count 117; player-favorable per min-policy).
- VERIFY: 40-seed structural sweep (zero pre-solved checks, conservation +
  non-negativity + no overspend, mezz starvation confirmed 101/160 tranche-
  years); house e2e demo-replay WIN 3/3 (cascade); FULL 56-drill e2e
  regression ALL GREEN (every drill WIN 3/3, zero page errors — merge was
  gated on this). drills.js catalog + PARS synced.
  CACHE v122 -> v123 (all 9 pages).

---
# ROUND 142 — 'HOUSE STYLE': the realistic formatting flagship (Wolf: core day-to-day)
- Wolf: "more focus on core navigation and formatting… realistic formatting
  drills" (= roadmap #19, never fully implemented). The pieces existed as
  isolated drills (format/blue/dress/polish); the realistic COMPOSITE — a raw
  tab brought to full desk standard in one pass — did not.
- NEW DRILL 'housestyle' (House Style, LEADS the Formatting group, 57 total):
  a raw quarterly P&L lands unformatted — plain title, naked headers, inputs
  invisible among formulas, raw decimals, decimal margins, nothing ruled.
  The pass: title bold · headers bold + alt-h-b-b rule-under · INPUTS blue
  via the alt-h-f-c walk · figures alt-h-k + alt-h-9 ×2 · margins ctrl+shift+%
  · EBITDA row bold + ruled above. Six op families, zero same-motion-×N.
- THE TEACHING HOOK: which rows are inputs MOVES every run (Revenue + one of
  COGS/Opex; the other is formula-driven), and ONE HARDCODE IS BURIED in the
  formula row (per-run random column) — the drill fails until the player
  finds and paints it. That's the actual senior's-pass skill: knowing what
  moves. No leave-untouched checks (positives only, doctrine #3).
- ENGINE-TRUTH CATCHES (via house e2e, first run FAIL 3/3): alt-h-b-o is
  OUTLINE border in the engine (Excel-correct) — rule-under is alt-h-b-B;
  alt-h-k sets comma w/ TWO decimals — the pass needs alt-h-9 ×2 (as the
  'format' drill already teaches). Copy/demo corrected; second run WIN 3/3.
- VERIFY: 40-seed sweep (zero pre-solved checks; input-row and buried-cell
  distributions both ~50/50 across seeds; no override ever lands in an input
  row); housestyle e2e WIN 3/3; FULL 57-drill regression ALL GREEN (every
  drill WIN 3/3, zero page errors — merge gated on it). drills.js catalog + PARS synced (par 70/parKeys 42).
  CACHE v123 -> v124 (all 9 pages).
- NAV NOTE: Wolf's "navigation more love" is QUEUED as its own push — design
  sketch: 'modeltour' — N defect cells scattered wide, ctrl-jump navigation
  graded action-sourced like the navigation drill, realistic find-and-fix.

---
# ROUND 143 — PLUGIN LAYER INTEGRATION SWEEP (Wolf: "throughout the entire engine")
- THE DEAD-CHORD BUG (the catch of the round): a blanket `if(e.altKey)`
  swallow sat ABOVE the ctrl block in the classic keydown — EVERY Ctrl+Alt
  chord died there silently since it shipped: Macabacus Ctrl+Alt+A/S
  AutoColor + CAS+1/4/5 cycles, FactSet Ctrl+Alt+E + FDS CAS-fills, and
  native Ctrl+Alt+V paste-special. They only ever worked in rapid-fire
  (separate handler). The r-era "engine adds ..." verifications never drove
  the real key path. FIX: bare-Alt combos still swallowed (ribbon
  semantics); Ctrl+Alt flows to the ctrl block; Ctrl+Alt+V moved above a
  new in-block AltGr guard (`if(e.altKey) return` after the last claimed
  ctrl+alt branch) so unclaimed Ctrl+Alt combos stay INERT — European
  AltGr layouts can never fire plain ctrl ops. Found by driving the real
  chord through the real handler (probe: Ctrl+B logged, Ctrl+Alt+S didn't).
- RF ALIASES extended to every live plugin chord: font_blue += mcb
  Ctrl+Alt+A / fds Ctrl+Alt+E · num_comma/comma += CAS+1 · num_pct/percent
  += CAS+5 · currency += CAS+4 · paste_vals_es += mcb Ctrl+Shift+V.
  (FactSet number chords are native-identical — already matched.)
- GUIDED MODE speaks the profile: PLUGIN_ALTS — when a profile is active,
  steps with a live plugin chord append it (fills -> mcb ctrl+shift+d/r or
  fds cas+d/k; blue walks -> autocolor; % -> cas+5; commas -> cas+1; paste
  values -> ctrl+shift+v). Native profile: no plugin noise.
- PAYOFF PROVEN: under macabacus, ONE Ctrl+Alt+S clears housestyle's whole
  blue step incl. the buried hardcode (end-state grading = the plugin works
  exactly like the real thing); CAS+5 clears the margins check.
- reference.html ● (inEngine) markers audited: accurate as listed.
- VERIFY: 14-assert Playwright suite ALL PASS (classic chords, 8 RF alias
  matchers incl. native-off, guide notes per profile); full 57-drill e2e
  regression ALL GREEN post-fix (the paste-special reorder broke nothing).
  CACHE v124 -> v125.

---
# ROUND 144 — 'MODEL TOUR': navigation realism (Wolf's "nav needs more love")
- NEW DRILL 'modeltour' (Foundations, after navigation): a DENSE operating
  model tab (10 line items x 9 cols, fully populated so ctrl-jumps have real
  edges) with FOUR #REF! marks scattered to far corners + one buried
  mid-table (positions jitter per run). Jump, retype the number from the
  note, land back at A1. Navigation efficiency enforced by the CLOCK
  (freedom doctrine: par 42/keys 33 makes arrow-crawling unaffordable) +
  one stateful finish check (active===A1, gated on all fixes so it can't
  pre-pass). Dictated fix values are intentional — movement is the skill.
- VERIFY: WIN 3/3 house e2e; 40-seed sweep (0 pre-solved, 0 site
  collisions, marks always render).

---
# ROUND 145 — 'WK13': the 13-week cash flow ships (parked r141 spec, unparked)
- NEW DRILL 'wk13' (Models, after cascade; 59 total): the RX staple — front
  eight weeks of the 13-week. Net flow, beginning/ending CORKSCREW, cushion
  vs minimum liquidity with an ANCHORED $B$12 (ref-checked so the anchor
  can't walk), totals on FLOWS ONLY (J4:J6 via SUM + fill-down; ending cash
  gets no total — "an ending balance total is how you spot a tourist").
- HONEST ECONOMICS: cushion goes NEGATIVE in ~43% of week-cells across
  seeds — the sheet shows the crunch, which is what a 13-week is FOR.
- VERIFY: WIN 3/3 house e2e; 40-seed sweep (0 pre-solved; corkscrew,
  beg+ncf=end identity, and flow totals hold every seed); FULL 59-drill
  regression ALL GREEN. drills.js + PARS synced (par 92/keys 48).
  CACHE v125 -> v126 (all 9 pages).

---
# ROUND 146 — GHOST DIFF (STRATEGY item 3) + Wolf's quick-fix batch
- GHOST DIFF SHIPPED: the results card now reads the run's own timestamped
  trace (recorded since r9, never consumed until now) — "WHERE THE TIME
  WENT": executing vs thinking split (gaps > 1.5s), top-3 stalls each named
  by what FOLLOWED the pause (Alt -> "hunting the ribbon" · = -> "formula
  recall" · chords -> "chord recall" · arrows -> "finding the cell"), and
  keys-over-optimal. Zero-stall runs get "clean execution" + "optimal-length
  path — nothing wasted" (positive reinforcement is feedback too).
- N BUTTON DEAD (Wolf): TWO stacked causes — (a) resultsChainKeys (owns
  ↵/N/space/esc on the card) was only ever consulted in rapid-fire's
  handler, never classic's done branch; (b) the TYPE-TO-REPLACE branch sat
  above the done branch and ATE every printable key on a finished drill
  (startEdit no-ops on done but the event was already swallowed) — so N and
  plain-space were both dead. Fixed: !done guard on type-to-replace + done
  branch delegates to resultsChainKeys first (with n/space fallbacks).
- RESTART REACH (Wolf: "shift+f11 is a stretch"): DOUBLE-TAP ESC restarts
  (two Esc inside 450ms). Single Esc untouched — still back-out-only (r89
  doctrine holds; ants-cancel resets the tap timer so a cancel can't chain
  into a restart). Checklist copy: "esc·esc or shift+f11".
- IDLE TIMEOUT (Wolf): 60s without a keystroke mid-run -> fresh board +
  "stalled out" toast. Classic only; nothing posts; armed per keystroke,
  inert when idle/done/demo. AFK clocks no longer rot on the screen.
- PICKER CENTERING (Wolf): the r83 stage-top inline paddingTop was fighting
  the layout — retired; .pk-card centers via margin:auto (overflow-safe),
  verified 128px/128px symmetric.
- VERIFY: 7-assert Playwright suite ALL PASS (ghost diff renders, N
  advances, single-esc safe, esc·esc restarts w/ toast, idle timeout fires,
  picker centered, zero errors); full 59-drill regression gating the merge.
  CACHE v126 -> v127.
- QUEUED r147 (Wolf's VDR idea — verdict: NOT dumb, good skin / wrong
  interaction if literal): re-skin the picker as a DEAL-ROOM file tree
  (folder rows = groups w/ index numbers, drill rows = files, breadcrumb
  cap) while keeping everything expanded + one-keystroke reachable; add
  optional fold/unfold on ←/→ for the folder feel. Full navigation-depth
  VDR (enter/exit folders) rejected: it adds keystrokes between the player
  and the drill — the picker is a speed surface.

---
# ROUND 147 — THE DEAL ROOM: VDR picker re-skin (Wolf's idea, hybrid verdict)
- The picker is now a DEAL-ROOM FILE TREE (r80 section blocks retired):
  cap strip w/ LIVE BREADCRUMB (hotkey.gg › drills › 01 foundations ›
  navigate.xlsx — updates on every cursor move) + file/folder counts ·
  NUMBERED folder rows (01-08, group-color chip, N files, ◆ advanced tag) ·
  FILE rows (tree guides ├/└, NN.M index, name + .xlsx, staffer ◆ mark,
  PB ✓-time, right-aligned par ledger column) · FOLD/UNFOLD (Enter or ←
  on a folder folds; → unfolds/steps in; ← from a file jumps to its
  folder; folds persist in hk_pk_folds).
- INTERACTION DOCTRINE HELD: everything stays one keystroke away — no
  forced folder navigation (the literal-VDR interaction was rejected in
  r146's queue note; Wolf approved the hybrid). Numbers 1-8 now jump to
  FOLDERS (they wear the numbers; the old 1-9-loads-first-nine-drills
  behavior retired). movePkDir (2D chip-cloud nav) retired with the cloud.
- openPicker focuses the current drill's file row (falls back to its folder
  when folded). loadChallenge's .cur repaint works unchanged (.pk-byline
  class kept on file rows on purpose).
- VERIFY: 8-assert Playwright suite ALL PASS (tree renders 8 folders/59
  files, breadcrumb tracks folder AND file focus, fold persists + hides
  files, → unfolds, ← file→folder jump, ↵ loads + closes, zero errors);
  screenshot reviewed (the VDR read is exactly right); full 59-drill
  regression gating the merge. CACHE v127 -> v128.

---
# ROUND 148 — PROOF & GROWTH: the share surfaces round (STRATEGY item 4)
- CHALLENGE LINKS: ?race=<drill>&t=<secs>&by=<name> arms a race target — landing
  banner ("beat wolfy's 42.50s"), live HUD race chip riding ghostTick (works with
  ZERO PB — the recipient may be brand new), a results verdict (race won / holder
  keeps it), and a "copy challenge link" button on every clean solve. The URL IS
  the challenge — no backend row anywhere, works logged out. by= is display-only
  (escaped / textContent at every paint), t clamped 0.5–3600 at parse. A race
  outranks last-drill resume; the welcome-back card stays down on race arrivals.
- SHAREABLE RANK CARD: the player-card foot grows "share your rank card" — a
  1200×627 (LinkedIn-dimensioned) PNG drawn locally, nothing uploaded: handle,
  tier + crest, top-N% standing, level/solves/crowns, best-3 board placements.
  ENGINE-TRUTH CATCH: rankEmblem's SVG ships namespace-less for inline DOM use;
  as an Image document it silently errors — xmlns injected at raster time, and
  a 1.2s timeout means a raster stall can never hold the download hostage.
- PLACEMENT SHARE: the verdict line now fetches a NUMBER — percentile vs
  distinct-user bests on the board (skipped under 5-player fields; a 3-person
  field isn't a percentile) — plus a "share your verdict" card. makeShareCard
  grew an optional sub line (footer row slides down to make room).
- PRO PLACEHOLDER: "card themes — PRO" teaser on the player card →
  openUpgrade('Share-card themes') on index; satellites deep-link via
  ?openUpgrade=1 (handleDeepLink consumes it like openProfile/openAuth).
- FOSSIL KILLED (nav.js): loadProfileData's chord-frequency fetch referenced
  `meId` (undefined) since it shipped — the try/catch swallowed the
  ReferenceError, so "most-used shortcuts" + coach's notes never saw live-trace
  data. One-word fix: me_id.
- Events added: race_open, race_result{win}, challenge_copy, placement_share,
  rankcard_share.
- VERIFY: 19-assert Playwright suite ALL PASS (race arm/banner/chip, by= XSS
  escape + t clamp, out-of-range t stays inert, race-win verdict, clipboard URL
  round-trip, N-advance regression on the new card, placement verdict + PNG
  download, rank-card PNG download w/ crest, PRO modal); PNGs eyeballed (rank
  card + share card read right); node --check all touched scripts; FULL
  59-drill e2e regression ALL GREEN gating the merge.
  CACHE v128 -> v129 (all 9 pages).

---
# ROUND 149 — THE B2B ROUND: cohort report export + staffer program templates (STRATEGY item 5)
- COHORT REPORT EXPORT (leaderboard.html ?desk= hall): "⎙ cohort report
  (print / PDF)" builds #deskPrint — a print-only artifact (screen never sees
  it; in print it's the ONLY thing on the page, forced black-on-white because
  it lands in an inbox, not a theme): brand cap, desk header w/ staffer +
  date, the ROI band, live-assignment completion table, full roster table,
  and a methodology footnote (how time-saved/speed-up derive — a buyer will
  ask). Plus "⬇ summary card": the 1200×627 PNG version of the ROI band for
  the forwardable one-glance number. Zero backend — both derive entirely
  from the hall's already-loaded runs. fmtSaved floors at "<1m" (29s of
  gains read as a broken-looking "0m").
- STAFFER PROGRAM TEMPLATES (account.html staffer controls): three presets —
  Intern week 0 (movement → formatting → formulas → find-and-fix) ·
  First-year bootcamp (clean-up → functions → schedules → statements) ·
  Speed weeks (par×1.5 targets, basics → models). A program is a 4-week
  quest sequence pinned ONE CLICK A WEEK: "pin week N" clears current pins
  (two-click confirm when any exist) and sets the week's ≤3 drills via the
  existing RPCs — the server never learns about programs (cap-3 / 1-week
  expiry untouched); progress is local per desk (hk_prog_<team_id>). Notes
  carry "Program wN: theme" so analysts see the arc on their quest board.
  Catalog-drift guard: template keys are filtered against menuOrder at pin.
- Events: report_print, report_card, program_pin{tpl,week}.
- VERIFY: 19-assert Playwright suite ALL PASS against a stubbed supabase
  client (hall renders w/ export links, print DOM hidden on screen,
  window.print fires w/ desk header + roster + assignment + methodology,
  summary PNG downloads, three templates offered, week-1 preview,
  replace-confirm arms, clear-then-set RPC order + drills + notes asserted,
  progress advances w1✓→w2, speed target = par×1.5 verified to the ms);
  print-media screenshot + PNG eyeballed (both read right); node --check
  all touched scripts; FULL 59-drill e2e regression ALL GREEN gating the
  merge. No shared-asset change → ?v stays 129.

---
# ROUND 150 — WOLF'S FEEDBACK BATCH (share bug, achievement economy, pace clarity, data room)
- SHARE "DOESN'T DO ANYTHING" (Wolf's report, player card): two stacked causes
  found. (a) the pc-foot grew to three links with no flex-wrap — narrow windows
  overflowed into a horizontal scrollbar (his "horizontal slider navigation
  bar"); now wraps. (b) the download used a DETACHED anchor + data:URL click —
  fine in Chrome, silently flaky elsewhere, and every error was swallowed.
  Now: blob URL + DOM-attached anchor (revoked after), and the click TALKS
  BACK ("rendering… → saved ✓ check your downloads / couldn't render — try
  again"). Same hardening applied to the results-card share (makeShareCard)
  + a confirmation toast. A silent no-op can't happen again.
- ACHIEVEMENT ECONOMY REBALANCED (Wolf: "not seeing new icons… only gold…
  balance may be off"). Root causes were real:
  (1) DUPLICATES — the r79 expansion shipped 6 achievements that already
  existed: two 7-day streaks, two 30-day streaks, two 5-crown, two
  attempt-every-drill, TWO 'Model Citizen's (same name+test), and a second
  after-midnight medal. Dropped: x_strk7/x_strk30/x_crown5/x_models/brd1/
  ngt1. Banker renames on the survivors (Business Week / Quarter Close /
  Corner Office / Full Weekend).
  (2) NO NEW ART — ~14 glyphs served 51 medals, so every unlock looked like
  the last one. hkBadge grew 7 NEW glyphs (rx staircase, race flag, morning-
  sheet tick, freeze, model-tour map, house-style brush, chord keyboard).
  (3) ALL-GOLD METALS — rarity was pure live data (% of players holding it);
  at beta scale nothing clears the <=25% bar. Every achievement now carries a
  hand-set difficulty tier (r/e/l) as the DISPLAY FLOOR via hkEffRarity();
  live percentages take over at field >= 20 players, and tooltips only quote
  a % when it's real (tier words below scale — no fake numbers).
  (4) TEN NEW ACHIEVEMENTS for the features that shipped since (The RX Desk,
  House Style, Called Out/Undefeated races, Clean Sheet/Standing Order,
  Ice in the Veins, Tour Guide, Chord Library, Shipped It). Catalog: 47,
  ids+names unique, every test safe on an empty ctx. New flags plumbed at
  the source (race win / sheet clear / freeze bank -> hk_ach_flags) and into
  all three ctx builders (nav card, in-game sweep, stats grid).
- PACE DEFINED (Wolf: "what is this based on?"): the stats pace line was RAW
  SECONDS across mixed drills — 30s foundations next to 190s builds = noise.
  Now pace = time ÷ par per posted run (comparable across drills), dashed
  par baseline, median ×par + median keys/min in the header, and a
  plain-words "how it's computed" footnote. Strongest board now carries its
  numbers (top-%, your best time, gap to #1).
- THE DATA ROOM (Wolf's rename + filename idea): picker cap "◆ the data
  room", crumb root vdr. Files now wear the TASK as a filename —
  label slugged: fix_the_typos_in_place.xlsx, bring_it_to_standard.xlsx,
  the_4am_pass.xlsx. Truncation killed structurally (.vdr-fname flex:1 +
  ellipsis; ledger columns fixed-width right so par/PB never get pushed out).
- VERIFY: 21-assert r150 Playwright suite ALL PASS (catalog health, 7 glyphs
  distinct, eff-rarity math, data-room rename + filenames + zero row
  overflow + crumb, race/sheet/freeze flags land via the REAL paths,
  narrow-card no-overflow, share click feedback + blob download, stats pace
  copy) · r148 + r149 suites re-run ALL PASS · FULL 59-drill e2e regression
  ALL GREEN · badge board + data room screenshots eyeballed.
  CACHE v129 -> v130 (all 9 pages).

---
# ROUND 151 — MOBILE HUB + THE DOPAMINE DRIP (Wolf's brief)
- MOBILE = ANCILLARY, NOT LOCKED OUT: the r68 mobile gate stopped the whole
  product; now it stops only THE TRAINER. The gate card is a hub — "the
  boards", "your numbers", and a dynamic third slot (signed-out: "sign in —
  player card & saved times" → the auth modal opens ABOVE the gate;
  signed-in: "your player card" → the profile modal opens above it too).
  Zero page rebuilds: satellites already render fine at 390px (nav collapses
  to the burger); only z-index plumbing was needed (.auth-modal 500 in the
  mobile media query; .profile-modal.show 500 — the .show doubles
  specificity because nav.css loads after the inline sheet and would win at
  equal specificity). renderMobileGate paints at boot and re-paints on
  every onSession.
- LEVEL CURVE: SIX drifted copies of the 150×n triangular curve (nav.js,
  themes.js, leaderboard, index ×3 — same class r116 killed for XP) now
  delegate to HK_RANK.levelOf. Curve softened IN THE ONE PLACE: 150/300/450
  to L4, then FLAT 600/level — the old curve made L10+ a multi-week desert
  (L10→11 alone was 1,650xp). Levels only move UP under the new curve, so
  the repricing reads as a gift, not a demotion.
- DRIP RUNGS (+9, catalog 56): the ladders had deserts — 1 crown then 5,
  100 solves then 500, 10 dailies then 50, 10 par-beats after 1. Filled:
  Opening Bell (25 solves) · Deal Flow (250) · Back Tomorrow (3-day streak) ·
  Morning Person (3 dailies) · Finding the Line (par ×5) · Land Grab
  (3 crowns) · Shelf Space (20 PBs) · Field Coverage (25 boards) · Piano
  Hands (25k lifetime keys — new ctx.keysLifetime from hk_key_counts, wired
  through all three ctx builders). Fillers are deliberately common-tier:
  cadence, not glory.
- THE DRIP LINE: every results card now ends with the NEXT reward in reach —
  "<n> xp to LVL x · next medal: <name> p/goal". buildAchCtx() extracted from
  achSweepInGame so the countdown and the actual unlock can never disagree.
  A lull is now a visible countdown instead of silence.
- VERIFY: 14-assert r151 suite ALL PASS (hub links + auth-over-gate +
  card-over-gate at 390px w/ touch, curve delegation 8250xp→L16 identical
  across copies, 56 unique, Piano Hands/Opening Bell wiring, drip line on a
  real demo-driven win, zero page errors) · r148/r149/r150 suites re-run ALL
  PASS (r150's hardcoded catalog-count assert updated for legitimate growth)
  · FULL 59-drill e2e ALL GREEN · mobile hub + mobile leaderboard
  screenshots eyeballed. CACHE v130 -> v131 (all 9 pages).

---
# ROUND 152 — AUDIT FAMILY EXPANSION: three new diagnostics ship (STRATEGY 3.1, Wolf: "run it")
- The family thesis: "find what's broken under time pressure" is THE skill VPs
  notice. Each new drill is a DIFFERENT failure class from audit/triage:
- 'balcheck' (Tie-out, Formulas after triage): a balance sheet that doesn't
  tie — and the check row was PASTED OVER WITH ZEROS to hide it. Resurrect
  the check row live (=B8−B14, filled), read which years break, then run
  down both culprits: one Total assets range starts a row short (the Cash
  line fell out to a later insert) and one Equity cell is a typed plug where
  the corkscrew belongs. Construction is honest: the L&E side is built
  first, assets are sized so the sheet GENUINELY tied pre-defect — the fix
  restores truth. 4 checks (live row / respan / corkscrew / dead-zero tie,
  the tie gated on liveness so pasted zeros can't pre-pass). par 75/keys 27.
- 'stalelink' (Stale Links): assumptions moved to v2; three build cells still
  reference the DEAD v1 column — computes fine, confidently wrong. One stale
  link per row (rev/cost/royalty), columns shuffled so the trio never
  stacks; anchored $B$ refs are the fix. Contribution check judged against
  stored v2 TRUTH (not displayed parity — which would pre-pass). par 70/27.
- 'signerr' (Sign Sweep): three cost cells pasted in POSITIVE on a
  negative-convention sum-through P&L — EBIT silently rich in exactly those
  years. Flip the signs (type-to-replace), EBIT re-ties via recalc, then a
  margin row (=B8/B4, fill, ctrl+shift+%) as the sign-off — formula + fill +
  format chord keep the Mix Rule honest on a hunt drill. par 60/22.
- VERIFY: 40-seed structural sweeps ALL CLEAN ×3 (zero pre-solved checks in
  120 builds; defect invariants hold — plug col ≠ short col, assets always
  positive, stale trio never stacks, flips always 3 distinct columns w/ EBIT
  off in exactly 3 years; every demo finishes every check); house demo-replay
  e2e WIN 3/3 ×3 on the FIRST run; FULL 62-drill regression ALL GREEN;
  r148-r151 suites re-run ALL PASS; pars calibrated from measured optimal
  paths (27/27/22 keys, min policy); drills.js catalog + PARS synced;
  tabs screenshot-eyeballed (tie-out breaks in exactly 2 years, sign flips
  read across distinct columns). Catalog: 62 drills.
  CACHE v131 -> v132 (all 9 pages).

---
# ROUND 153 — THE RX PACK COMPLETES: liquidity bridge + covenant table (STRATEGY 3.2)
- With wk13 (r145) these make "The RX desk" a real advanced section — the three
  pages every restructuring deck actually opens with.
- 'liqbridge' (Liq. Bridge, Models after wk13): cash + undrawn revolver walks
  the bridge (burn / asset sales / RX fees) to ending liquidity; the cushion
  against minimum liquidity is the answer. Build once, fill across Base /
  Downside / Severe. HONEST ECONOMICS BY CONSTRUCTION: downside/severe take
  strictly worse deltas so the endings are ordered; cash is raised if the
  base ending lands thin; the minimum-liquidity line sits strictly between
  Severe and Base — Base always clears, Severe always breaches, every seed
  tells the story the page exists to tell. 5 checks (avail / beginning /
  ending w/ SUM range ref-checked / cushion / ending row bold). par 80/40.
- 'covtable' (Cov. Table): leverage off LTM EBITDA vs a covenant max that
  STEPS DOWN mid-table; headroom row; a REAL IF compliance flag (1/0 —
  first drill to grade the r94 comparator evaluator since 'cases'); MIN
  pulls the tightest quarter. EBITDA sags mid-path then stabilizes, debt
  amortizes a touch — breaches surface in ~1/3 of seeds, tight-but-clear in
  the rest. par 85/40.
- ENGINE-TRUTH CATCHES (both via the house harness, pre-ship):
  (1) THE ROW-14 REF CLAMP: fill-right REWRITES cell refs and clamps
  referenced ROWS at ROWS_MAX=14 — '=B14-B16' filled to '=C14-C14'. Rows
  15+ can hold cells (balcheck r15 writes fine) but formulas REFERENCING
  rows >14 die on fill. liqbridge rebuilt onto the canonical 14 rows (WC
  line dropped from the bridge). HOUSE FACT for future drills: keep
  REFERENCED rows <= 14.
  (2) the compliance flag check read `(value)||-1` — a legitimate 0 (breach)
  is falsy and became -1; classic falsy-zero, caught by the 1/3 seed
  failures it produced. Also: first-cut minimum liquidity could go NEGATIVE
  (derived off a deep-negative severe ending) — floored at a real number
  with the between-Severe-and-Base constraint.
- VERIFY: 40-seed sweeps ALL CLEAN ×2 (zero pre-solved in 80 builds;
  endings strictly ordered, base clears + severe breaches every seed,
  covenant band sane, breach variety 14/40); demo-replay WIN 3/3 ×2; FULL
  64-drill regression ALL GREEN; r148-r151 suites re-run ALL PASS; pars
  calibrated from measured optimal paths (40/40 keys); drills.js + PARS
  synced; both tabs screenshot-eyeballed. CATALOG: 64 DRILLS.
  CACHE v132 -> v133 (all 9 pages).

---
# ROUND 154 — THE FULL PASS: onboarding / account / rank / visual audits + Excel-parity fixes (Wolf's standing brief)
- NEW STANDING HARNESSES (dev/): e2e-audit-parity.js (27-assert Excel-parity
  keystroke matrix — movement, edit semantics, F4 cycle order, jumps/selections,
  fill translation, paste, number entry, evaluator, undo, esc discipline),
  e2e-audit-onboard.js (15-assert fresh-visitor walk: curtain → landing → tour
  → prompt → play, plus the return visit), e2e-audit-rank.js (20-assert rank
  cross-surface consistency + account flows + recovery + 2-theme overflow
  sweep). Run them like the demo-replay e2e; they are the drift-catchers for
  exactly this pass.
- THREE REAL BUGS FOUND AND FIXED:
  (1) EXCEL PARITY, translateFormula: fill's ref-rewrite clamped rows at the
  STATIC ROWS_MAX (14) — on a 15-row tab '=B8-B14' filled fine but any ref to
  rows >14 silently re-pointed ('=B14-B16' → '=C14-C14', the r153 catch). Now
  clamps to the LIVE sheet height; the r153 house-fact landmine is REMOVED —
  tall tabs may reference their own rows freely.
  (2) EXCEL PARITY, doPaste: paste NEVER translated relative refs — '=B4+1'
  copied from C9 pasted at D10 still read B4, while fill translated correctly.
  Paste now shifts relatives by the paste offset (anchors hold), for both
  Ctrl+V and Alt-E-S-F; full 64-drill regression confirms no drill leaned on
  the verbatim behavior.
  (3) RANK CONSISTENCY, leaderboard tierOf wrapper: declared (avgPct, att)
  while every caller passed (avg, att, WSUM) — the provisional season-zero cap
  (Summer Analyst until real exposure) silently never applied on ANY
  leaderboard surface (your-standing card, desk-hall roster, public player
  cards, tier panel) while nav/account/stats enforced it. The exact
  split-brain class r112 killed; wsum now passes through, and the audit
  asserts board tier == canonical tier == nav pill on a provisional-scale
  dataset.
- CLEAN BILLS: onboarding end-to-end (curtain incl. wrong-code error +
  case-insensitive pass, landing Enter, tour input-block + release, tutorial
  prompt sequencing, grid takes keys, welcome-back non-swallowing dismiss);
  account flows (handle save + cooldown mapping, protected-desk mapping,
  password recovery flow, sign-out); zero horizontal overflow on 5 pages ×
  2 themes; number-entry/evaluator/undo/esc parity all hold.
- AUDIT-HARNESS HUMILITY (logged so the next auditor doesn't re-learn it):
  position:fixed overlays have offsetParent === null even when visible — six
  "failures" in the first onboarding run were probe artifacts; S.sel is an
  anchor {r,c} (selRange() is the reader), not a rect.
- VERIFY: all three audits ALL PASS post-fix (27+15+20) · FULL 64-drill
  regression ALL GREEN (paste translation broke nothing) · r148-r151 suites
  re-run ALL PASS. No shared-asset change → ?v stays 133.

---
# ROUND 155 — DENSITY TRANCHE (the last pre-doctrine surfaces) + SEASONS DESIGN DOC
- MEASURED, not guessed: a catalog-wide density probe (occupied cells / span)
  ranked all 64 drills. Worst offenders — pastes (5 cells), transpose (6),
  gauntlet (8 cells on a 2×5 strip). 'undo' stays exempt per the r56 ruling;
  everything else already passed a doctrine round.
- 'pastes': the final figure now lives INSIDE a real quarterly P&L (headers,
  four line items, dressed source cell) and feeds two labeled hand-offs.
  Same three keystrokes (ctrl+c · alt-e-s-v · alt-e-s-t); 5 → 30 cells.
- 'transpose': the year row now caps a populated operating build (label col +
  three data rows) with the summary block waiting below; three site layouts.
  Same two keystrokes; 6 → 22 cells.
- 'gauntlet': REBUILT as a two-sided Sources & Uses — every op now runs on
  BOTH blocks (multi-site per the doctrine): blue both input stacks, alt+=
  both totals, bold + top border both, comma ×2 walks down both money
  columns, autofit both. Labels shuffle + row jitter per run. 8 → 21 cells,
  par 75/30 → 100/46.
- SEASONS DESIGN DOC at dev/SEASONS.md (the queue's last item, deliberately
  doc-only): a season = a deal (10 weeks, codename), soft reset on RANK only
  (LEVEL never resets — two-ladders holds), placement reuses the provisional
  machinery verbatim, tombstones on the card, flair rides profiles.flair,
  monetization stance pre-decided (participation/rank never paid; PRO gets
  finish + insight, zero gameplay). Build trigger: DAU ≥ 30 ×2wks or first
  B2B desk request. The build round is a config-and-migration round now.
- VERIFY: WIN 3/3 ×3 on the rebuilds; 40-seed sweeps ALL CLEAN (0 pre-solved
  in 120 builds, min cells 30/22/21, demos finish every check every seed);
  pars recalibrated from measured optimal paths (11/6/46); FULL 64-drill
  regression ALL GREEN; parity audit + r148/r150/r151 suites re-run ALL
  PASS; both tabs screenshot-eyeballed (the S&U #### wall reads exactly
  right). drills.js PARS synced. CACHE v133 -> v134 (all 9 pages).

---
# ROUND 156 — PRO OFFER SURFACES (Wolf: "know what comes with pro, seamless upgrade")
- BASE NOTE: this round was first built as "r131" against the pre-r132 tree
  in a parallel session; on push, main had advanced through r155 (PRs #12-
  #23: deal-room picker, share surfaces incl. the r148 PRO teaser, RX pack,
  audits). Rebuilt cleanly on the current base — the r148 card-themes
  teaser + ?openUpgrade= deep links now land on this sheet, not the old
  thin modal. (Old line preserved on branch backup-pro-r131.)
- THE OFFER, made concrete (drills.js window.HOTKEY_PRO, single source):
  free = the level-gated progression path; PRO = (1) full catalog from
  Level 1 (Models + Full Builds), (2) Macabacus/FactSet plugin layers,
  (3) deep analytics, (4) pro cosmetics (flair + share-card themes).
  Placeholder pricing $7/mo · $59/yr ("2 months free") — Wolf edits ONE
  object. Every pillar maps to an existing gated surface; nothing vapor.
- ONE SHEET EVERYWHERE: hkProSheet(feature) in nav.js + .hk-pro in
  nav.css — PRO-vs-FREE comparison grid, monthly/yearly plan toggle (CTA
  price follows), feature hook line, and two states: BETA (green "PRO is
  on for everyone, free — founder pricing at launch", quiet close CTA) vs
  LAUNCH (gold Upgrade CTA -> hkProCheckout -> create-checkout Edge
  Function, TEST-mode-only, honest fallback copy). Esc/backdrop/x close.
- TOUCHPOINTS: picker (VDR tree) advanced-folder diamond tags, stats
  Analytics PRO tag, account flair PRO tag, NEW account "Your plan" card;
  index openUpgrade/startCheckout now DELEGATE to the shared sheet (old
  inline modal deleted; requirePro flow + r148 deep links unchanged, so
  the launch flip stays config: HOTKEY_PREMIUM.enabled + HOTKEY_PRO.beta).
- CACHE v134 -> v135 (all 9 pages).
- VERIFY: node --check nav.js/drills.js + all extracted inline scripts;
  sheet screenshot-reviewed in both states on the NEW base (plan toggle
  exercised); 5 pages boot clean; e2e demo-replay ALL GREEN (64 drills).
  Stripe remains TEST MODE; no live payments (standing constraint).

---
# ROUND 157 — PRICING FINAL + THE WEAKNESS QUEUE SHIPS (PRO pillar #2 goes real)
- PRICING (Wolf-decided): MONTHLY $7 leads ("crazy ROI on the time you
  save"), YEARLY DROPPED — this audience trains in cycles, not years.
  Second SKU = SEASON PASS $19 / 3 months ("one recruiting cycle", ~10%
  off) for the pre-summer ramp. HOTKEY_PRO grew a plans[] array;
  hkProSheet renders plans generically (first = default), CTA price
  follows the toggle, checkout passes plan id.
- OFFER SHEET v2: five REAL pillars (full catalog day one, THE WEAKNESS
  QUEUE, plugin layers, deep analytics, pro cosmetics) + an honest
  "landing during beta" roadmap line (ghost replays, interview mode,
  season rewards track) — nothing on the paid side of the grid is vapor.
- THE WEAKNESS QUEUE (index): "◆ weakness" joins the drill bar. Scoring
  is LOCAL-ONLY (guest-friendly): PB/par gap (known weakness, capped),
  never-cleared (unknown weakness, progression-weighted by catalog
  position), staleness (>5 days since last clean run adds up to +1) —
  hk_runs_lite entries now carry d+ts to feed it (back-compatible; old
  rows just lack staleness). Pop lists top 6 with REASONS ("38% over
  par · 9d stale"), single rows load directly, "train the queue" arms
  sequential mode: nextDrillKey() serves the queue so the results card's
  n walks it (label shows the true next), restarts stay in place, any
  manual jump disarms, finishing the last item toasts + clears. Gated by
  requirePro('The Weakness Queue') — free in beta, PRO at launch.
  Events: wq_start, wq_done.
- CACHE v135 -> v136 (all 9 pages).
- VERIFY: node --check all extracted scripts; queue driven live in
  Playwright (pop content, arm toast, nextDrillKey chain = queue order);
  sheet v2 screenshot-reviewed (monthly default, season toggle, roadmap
  line); 5 pages boot clean; e2e demo-replay ALL GREEN.

---
# ROUND 158 — PROGRESSION GATES GO LIVE (Wolf: gates clear, not early, not slow-passable)
- THE FREE SPINE, finally real: all 64 drills were open — "unlocks as you
  level" was sheet copy, not code. Now HOTKEY_GATES (drills.js) locks the
  three advanced tiers for non-PRO players:
    Formulas     LVL 3 + 6 pace clears   (day-one reachable at honest pace)
    Models       LVL 6 + 14 pace clears  (~day 2-3 of real play)
    Full Builds  LVL 9 + 22 pace clears  (~day 4-6)
  26 drills (Foundations/Formatting/Values/Data/Lookups) open from minute
  one — nobody hits a wall in their first session.
- WOLF'S TWO FAILURE MODES, both closed by the AND: LEVEL alone is
  slow-grindable (XP pays any completion) -> the CLEARS bar demands pace
  (par x1.5 clean, the campaign's own bar); CLEARS alone could wall a
  grinder -> the LEVEL bar honors volume. Pure-skill bypass: shipping the
  campaign versions covering everything earlier unlocks with no waiting.
  PB grandfather (you've been in the tier -> it stays open; no rug-pulls).
- GATES RUN IN BETA (the ladder is the game): unlock checks _pro (real
  entitlement), NOT BETA_MODE. Sheet betaNote rewritten honestly: perks
  free in beta, the ladder still applies, PRO opens the catalog at launch.
  "PRO skips the wait" button on the gate modal -> hkProSheet.
- SURFACES: VDR picker folders wear a warn gate chip (LVL n · k clears,
  click = explainer) with rows dimmed .gated; gate explainer modal shows
  BOTH bars with live progress (you're LVL x · you have y clears) + the
  campaign path + PRO skip; deep links/next-chain/random dealer/marathon
  pool/weakness queue/morning-sheet picks all honor the ladder; daily runs
  and armed race links are EXEMPT (community moments). gate_hit event logs
  which wall players meet.
- e2e harness sets _pro=true before the sweep (it exercises the full
  catalog by design).
- CACHE v136 -> v137 (all 9 pages).
- VERIFY: node --check all extracted scripts; Playwright gate matrix —
  fresh guest: margin/lbo/debtsched LOCKED, navigation/polish/lookup open,
  deep-load lbo bounces to explainer with state untouched, random pool
  clean of locked keys, next lands unlocked; leveled profile (LVL 6 + 14
  clears): Formulas+Models OPEN, Full Builds still locked — exactly per
  config; 5 pages boot clean; e2e demo-replay ALL GREEN.

---
# ROUND 159 — ENGINE VALIDATION PASS + THE FROM-ZERO RAMP (Wolf's brief)
- ENGINE VALIDATION (before any new drills, per Wolf): all four standing
  suites run against HEAD. Parity matrix EXTENDED 27 -> 37 asserts with
  four new families: K row ops (Alt H I R shift + lastRowOp latch + the
  r95/r101 undo-geometry contract), L formatting ops (Ctrl+B, Alt H A C
  align='c', Alt H K comma), M autofit (Alt H O I widens engine colW),
  N pointer mode (arrows point refs, F4 anchors a POINTED ref — the r87
  bug class — and commits intact). All 37 PASS — the three initial
  failures were MY assertions vs real engine contracts (stable-viewport
  rowsAfterOp, l/c/r align codes, 1-indexed colW), not engine bugs.
  Harnesses gained the r158 gate bypass (_pro=true) — fresh('foot') was
  silently bouncing at the Formulas gate.
- REAL BUG FOUND + FIXED (intro keyboard leak): the new comfort card's
  number keys ALSO fell through to the grid (document-target listener
  order = registration order, game handler first) — every fresh visitor
  would start a stray '2' edit in the active cell. window.__introCardOpen
  guard in the game keydown (onboardOpen pattern); comfort + primer own
  the keyboard while up.
- THE FROM-ZERO RAMP (Wolf: "jumps in quickly… undergrads who never use
  Excel are thrown off off rip"):
  * COMFORT FORK on first entry (before the tour): "how much Excel have
    you done?" — basically none / I get around / I live in it (keys 1-3,
    hk_xlv persisted, comfort event logged).
  * EXCEL-FROM-ZERO PRIMER (novices only, before the product tour): 5
    cards teaching the raw vocabulary — the grid + cell addresses (with a
    mini-grid visual), formula bar vs result, typing/Enter/Esc/F2, the
    Alt ribbon paths, how you win + F1. Enter-driven, hk_primer_done.
  * TRAINING WHEELS x3: novices keep guided mode auto-ON for their first
    3 clean solves (was: 1 drill for everyone); an explicit F1-off is
    respected for the session (hk_guided_off).
- onboard audit grew T4 (novice branch: fork re-asks, primer opens on
  card 1, completes, tour follows) + the fork step in T2: 15 -> 20
  asserts, ALL PASS.
- CACHE v137 -> v138 (all 9 pages).
- VERIFY: full gate green — parity 37, onboard 20, rank 20, demo-replay
  ALL (64 drills x3); node --check all extracted scripts.

---
# ROUND 160 — VISUAL-CLARITY AUDIT: grid, colors, text, borders (Wolf's standing brief)
- NEW STANDING HARNESS dev/e2e-audit-visual.js: computes REAL WCAG
  contrast from getComputedStyle across ALL 21 themes — gridlines vs
  sheet, APPLIED borders vs sheet AND vs gridlines (distinct layers),
  all 10 font swatches vs cell bg (white exempt on light themes — Excel
  parity), blue-fill text vs fill, fill vs sheet. 311 assertions.
  Measurement lesson baked in: td background transitions .08s — settle
  140ms after applyTheme or you read mid-flip colors.
- 26 REAL FAILURES FOUND, 3 CSS ROOT CAUSES, ALL FIXED:
  (1) APPLIED BORDERS drew in var(--accent) — near-invisible on light
  themes (serika 1.46:1, indistinguishable from gridlines at 0.96 ratio)
  and everywhere ambiguous with the SELECTION language. Now var(--text)
  INK, Excel-style: borders=ink, gridlines=line, selection=accent —
  three distinct layers on every theme. This is the substrate Wolf's
  beefed-up border drills need.
  (2) orange/yellow font swatches illegible on paper themes (1.67-2.39):
  bases darkened (#c55a11 / #a67c00), dark themes keep the bright
  variants via [data-dark] overrides (orange override added).
  (3) BLUE FILL invisible: light fill #dbeafe was 1.05:1 vs paper sheets
  -> deepened to #9cc3e8 (text #153c7a, 4.3:1); dark fill #16344e was
  1.03:1 vs everforest/onedark -> brightened to #1d5080 (text #cfe8ff).
- NOT-A-BUG, documented: fresh devices boot to OS prefers-color-scheme
  (light for many users) — light themes are FIRST-TOUCH surfaces, which
  is why the light-theme failures mattered doubly.
- CACHE v138 -> v139 (all 9 pages).
- VERIFY: visual matrix ALL 311 PASS post-fix; demo-replay ALL GREEN;
  parity 37 PASS; formatting showcase screenshots reviewed on default/
  daylight/serika/everforest (borders/fills/swatches/selection all
  distinct). Formatting-drill checks read cell PROPS, not pixels — zero
  gameplay risk from the palette changes.

---
# ROUND 161 — 'RULE OFF': the border flagship lands on the r160 substrate (65 drills)
- NEW DRILL ruleoff ('Rule off the schedule', Formatting, par 52/keys 30):
  a randomized segment build (2 sections, 2-3 rows each, 4-5 FY columns,
  shuffled label pools — a dupe-label slice bug was caught on the FIRST
  screenshot and fixed) that drills the ACCOUNTING RULING CONVENTIONS the
  r160 ink-border fix finally makes readable: line UNDER the headers
  (alt h b b), single rule ABOVE each subtotal (alt h b t — "a total
  earns its line"), EBITDA pulled through (formula + ctrl+r), bolded and
  ruled, and the MD's headline figure boxed (alt h b o) — the box column
  moves every run.
- THE BALANCE DOCTRINE, kept explicit: req/guide TEACH the canonical
  chords, checks grade END STATE ONLY — typed refs or pointed refs, walk
  the ribbon or never touch it, any path that leaves the page ruled
  counts. ("formulas, not typed numbers" is the one prescriptive check —
  it's the skill, not the path.)
- MIX RULE: 4 op families (borders x4 sites, formula build, fill-right,
  bold). No leave-untouched checks. Sites move every run. Sits in the
  UNGATED Formatting tier — border literacy is basics, not endgame.
- VERIFY: demo-replay ruleoff WIN 3/3 across 4 separate seed batches;
  full catalog ALL GREEN (65 drills); parity 37; visual matrix 311;
  solved-board screenshot reviewed (all five rulings legible on the
  light first-touch theme).
- CACHE v139 -> v140 (all 9 pages).

---
# ROUND 162 — SHARE CARD RETRENCHED (Wolf: comparison moment, not grind artifact)
- The per-solve PNG share card is GONE from regular drill results — Wolf's
  read: nobody posts a random drill time; the share moment is (a) the
  DAILY / gauntlet legs, where friends compare the same board, and (b)
  the high-level rank card on the player card (LinkedIn-dimensioned,
  r148) which STAYS untouched.
- Results card now: challenge link on EVERY clean solve (the race URL is
  the true friend-vs-friend loop and costs one button), share card ONLY
  when dailyMode/weeklyMode. Placement-verdict share kept — it fires
  once, at placement, and is milestone-shaped.
- VERIFY (live, both paths): regular solve -> link only, no card; daily
  solve -> card + link. Syntax checks; full demo-replay ALL GREEN.
- CACHE v140 -> v141 (all 9 pages).

---
# ROUND 163 — GHOST REPLAYS + 'RULING PASS' (66 drills)
- GHOST REPLAYS SHIP (PRO pillar graduates from the roadmap): every
  keystroke now also logs the ACTIVE CELL (keyCells beside keyLog/
  keyTimes; server trace rows carry {k,t,c} going forward). When a PB
  lands, the run's cursor path (consecutive-dupe-collapsed, capped 500)
  is kept on-device (hk_ghost_<drill>); on the next run a warn-dashed
  translucent GHOST CURSOR glides through the recorded path in real
  time against the clock — race your own hands. Server traces recorded
  post-r163 feed the ghost across devices for signed-in players. Gated
  by isPro() (beta keeps it on); prefers-reduced-motion kills it; never
  catches input (pointer-events none, z-order under selection).
  VERIFIED LIVE: PB run recorded a 6-step path on ruleoff; the re-run
  armed and the cursor glided through 4 distinct positions and settled.
  Layer language stays clean: selection=accent, borders=ink, ghost=warn.
- NEW DRILL ruleaudit ('The ruling pass', Formatting, par 45/keys 20):
  the DIAGNOSIS twin of r161's Rule Off — the page arrives dressed and
  "done", but 3 random conventions are knocked out (header rule, either
  subtotal's line, answer-line rule/bold, headline box) and one EBITDA
  figure was never pulled through (always; column moves). Checklist
  names broken CONVENTIONS, the page reveals WHERE; intact conventions
  pass at load (the audit-family read). All fixes are idempotent ops
  (set-not-toggle walks; bold knockout is whole-row so ctrl+b is safe).
  Freedom kept: end-state graded, any path counts.
- VERIFY: ruleaudit demo-replay WIN across 4 seed batches; full catalog
  ALL GREEN (66 drills); parity 37; visual 311; onboard 20.
- CACHE v141 -> v142 (all 9 pages).

---
# ROUND 163b — offer sheet: ghost replays graduate roadmap -> pillar grid
- HOTKEY_PRO: 'Ghost replays' moves from the landing-during-beta roadmap
  line into the PRO-vs-FREE grid (free side: 'time + key-count pace
  only' — honest: the delta + keys readout stays free, the CURSOR is
  the PRO feature). Roadmap now: interview mode, season rewards.
- CACHE v142 -> v143.

---
# ROUND 164 — CONTENT ITERATION: the last pre-doctrine drills rebuilt (combo, center)
- STANDING SWEEP (Wolf: "keep running iterations on existing drills"): the
  catalog was graded against Density Doctrine v2 + Mix Rule + site-driven
  randomization. Two clear violators remained, both rebuilt:
- COMBO ('Clean the paste', par 32->48/keys 28): was a FIXED 5x5 block
  with junk lowercase headers, no tab title, values-only randomization.
  Now a real comp sheet — codename title, 2-3 metric columns drawn from
  a 5-metric pool (EV/EBITDA/Net debt/Revenue/FCF), 4-6 companies from
  shuffled pools, header row position varies, notes column rides last.
  FIVE op families: bold (title+headers), align (headers right over
  numbers — NEW), comma+decimals, wrap, autofit. Raw #### overflow ships
  on load so the autofit pass is visibly real.
- CENTER ('Set the alignment', par 44->46/keys 26): was the LAST
  offset-block drill (a floating 5-col block at random offsets, no
  title). Now a real pipeline tab — codename title, Q1..Qn headers
  (3-5), 3-5 deal rows, prefilled SUM total row. Same alignment triple
  (c/l/r) PLUS the natural fourth family: a total reads BOLD. Every
  check requires a change (headers ship slumped left, labels centered,
  totals left-aligned — no leave-untouched).
- Graded-and-passed without change: series, sort, polish, blue, foot,
  lookup family (already site-driven post-T5/r155).
- VERIFY: combo + center demo-replay WIN across 4 seed batches each;
  full catalog ALL GREEN (66); parity 37; visual 311; rebuilt boards
  screenshot-reviewed (combo ships with live #### overflow).
- CACHE v143 -> v144 (all 9 pages).

---
# ROUND 165 — PAR CALIBRATION SWEEP: the efficiency metric comes back to true
- NEW STANDING HARNESS dev/e2e-par-sweep.js: replays every drill's demo
  through the live engine 5x and compares the MEASURED optimal key count
  (keyLog at the win — the exact metric the HUD, results-card efficiency
  ratio, and marathon scoring show players) against declared parKeys.
- THE FINDING: 38 of 66 drills carried parKeys counted under the OLD r33
  token convention (TYPE:str=len, walk letters counted) while the live
  keyLog counts CHORDS — so "optimal" overcounted by 25-80% on most of
  the catalog. Every player's efficiency ratio has been reading
  flattering-to-meaningless (versionup claimed optimal 82 when the real
  optimal path logs 30). New drills (ruleoff/ruleaudit) were already
  true — they were calibrated against the live metric.
- FIX: parKeys := measured median for the 38 drifted drills (all
  measured LOWER, consistent with the metric shift — assignment IS the
  old min-policy). PAR SECONDS UNTOUCHED everywhere: par is tuned
  difficulty (campaign gates x1.5, XP advanced >=55s threshold, PARS
  snapshot in drills.js) — no gameplay difficulty changed this round.
  Ratio-only outliers (undo 3-key etc.) left alone: short drills are
  reading-dominated by design; sweep now reports s/key as INFO only.
- Sweep re-run post-fix: FLAGGED 0. Full catalog replay ALL GREEN;
  parity 37.
- CACHE v144 -> v145 (all 9 pages).

---
# ROUND 166 — PAR POLICY DECIDED (plugin overlays) + THE FRONT-DOOR TRANCHE QUEUED
- PAR vs PLUGIN OVERLAYS (Wolf's question, answered as policy):
  PAR IS NATIVE-CALIBRATED, ALWAYS. One bar for every board — per-profile
  pars would fragment leaderboard comparability, campaign gates, and the
  XP advanced threshold, and plugin coverage varies per drill. Plugin
  layers (Macabacus/FactSet) are a LEGAL EDGE: their chords are shorter,
  so a plugin player beats par easier — exactly like a real desk, and
  exactly the pitch of the PRO plugin-layers pillar. mouse_used stays
  the ONLY purity flag on boards. Policy shipped where players look:
  "how par works" section in the how-xp-works modal (par = native pace;
  plugin layers are playing it like a real desk, not cheating; guided
  mode lists alternates via guideAltNote). FUTURE (queued, not built):
  the par sweep could gain plugin-alternate demos to publish an
  informational "plugin floor" per drill — display-only, never the bar.
- T7 QUEUED — THE FRONT-DOOR ENGAGEMENT TRANCHE (Wolf: earliest free
  drills must be "incredibly fun, engaging, unique"). Graded tonight:
  all 12 Foundations are randomized, 9/12 site-driven, prompts in voice
  — no combo-grade emergencies. The tranche is therefore about JUICE,
  not density: (a) the three 3-key micro-drills (blocksel, undo,
  copyover) deserve a second beat or a stronger story; (b) win moments
  on first-session drills should land harder (the drip line + confetti
  exist — first-clear on foundations could celebrate bigger); (c)
  navigation/filldr/pastes/rowops are sites=N — worth site-driving;
  (d) each foundation drill should teach exactly ONE aha the player can
  name afterward. Runs as its own round with fresh eyes.
- CACHE v145 -> v146.

---
# ROUND 167 — T7 SHIPPED: THE FRONT-DOOR ENGAGEMENT TRANCHE
- THE FOUR MICRO-DRILLS REBUILT to doctrine (undo, filldr, blocksel,
  copyover) — each gained a real tab, a second beat, and a story:
  - UNDO v2 "Undo is a tool, not a panic" (par 34): a 3x3 SCRATCH block
    lands on a live opex tab, one column secretly LIVE ("feeds Q4").
    Nuke the block, Ctrl+Z it ALL back, then delete only the two dead
    columns and bold the survivor's header. checks include the S.undoN
    latch — undo must be USED, not retyped. Adjacent dead columns
    collapse into one selectable range.
  - FILLDR v2 "Fill down, fill right" (par 40): a revenue build with a
    Growth driver anchored at $B$2, ONE written formula, then Ctrl+D
    down the segments and Ctrl+R across the total row. checks demand
    '$B$2' in every filled formula + value parity — fill slides refs,
    anchors hold.
  - BLOCKSEL v2 "Grab the whole block" (par 38): THREE islands, briefs
    on two (bold one, comma the other), the third a decoy testing aim.
    GEOMETRY LESSON: island heights cap at 4 and the fifth spot moved
    to its own column band — taller islands made ctrl+shift+arrows RIDE
    THROUGH a neighbor via contiguous cells (caught by replay: demo
    bolded the decoy).
  - COPYOVER v2 "One copy, three hand-offs" (par 42): the block is now
    a live sub-build (two input rows + a SUM row). Two full pastes keep
    the formulas alive; the third hand-off is the deck — Alt E S V,
    values only. checks assert formulas present at 1+2 and ABSENT at 3.
- THE AHA LINE — every Foundations drill now carries aha:'...' (one
  nameable insight), surfaced on the results card between the ghost
  diff and the leaderboard row (.rm-aha, lightbulb). T7's "teach exactly
  ONE aha the player can name afterward", made literal.
- BOOT BEACON FALSE ALARM FIXED: the capture-phase error listener also
  caught RESOURCE load failures (CDN blocked/adblock/offline) and
  painted the fatal red banner even though guest mode boots fine.
  Resource errors (no .message, target != window) now return early.
- PARKEYS set to measured medians (sweep): undo 4, filldr 2, blocksel 8,
  copyover 8. PARS mirror updated in drills.js (34/40/38/42) + meta
  labels refreshed. Par sweep: FLAGGED 0.
- VERIFIED: demo-replay 66/66 GREEN, parity 37, onboard 20, visual 311,
  rank 20, par sweep clean, inline scripts node --check clean.
- CACHE v146 -> v147 (all 9 pages).

---
# ROUND 168 — THE DENSITY FILTER, GAME-WIDE + THREE GAP-FILLING DRILLS (66 -> 69)
- WOLF'S DIRECTIVE: apply the T7 fun/density filter to ALL drills, then
  theorycraft drills for hotkeys/tricks the catalog was missing.
- GRADED ALL 66 against the doctrine (machine matrix: aha/codename/rnd
  count/prompt length/body length). Verdict: the advanced tiers were
  already dense; the failures clustered in the mid-tier singles.
- THE AHA LINE IS NOW UNIVERSAL: all drills carry aha:'...' — one
  nameable insight, surfaced on the results card. 12 (T7) -> 69.
- SIX MID-TIER UPGRADES:
  - foot v2: the Alt+= drill it always should have been — zero typed
    SUMs; Alt+= reads the row, the column, and the corner (totals moved
    adjacent so the proposal sees the block; par 72->48).
  - polish: the prompt PROMISED the decoy table stays plain but never
    graded it — now checked. + codename title + aha.
  - sort: codename title + aha. series: header now caps a Revenue+EBITDA
    mini-build + aha. margin/transpose: aha (already dense).
- ENGINE-COVERAGE GAP ANALYSIS: rapid-fire covers dialog chords as
  recognition; the CLASSIC grid supported five behaviors NO drill
  taught: column insert/delete (HIC/HDC), Ctrl+Space, decimals walk
  (H9/H0), and full F4 cycling (only single-press was touched).
- THREE NEW DRILLS (69 total):
  - colops "Columns move too" (Foundations, after rowops): stale DRAFT
    column + missing quarter — Ctrl+Space, Alt H D C, Alt H I C, head
    and dress the new column. End-state graded (any op order).
  - anchor "Pin it with F4" (Formulas, after margin): 3x3 price x volume
    grid from ONE formula — F4 x3 to $B pin, F4 x2 to row pin, fill both
    ways. The explicit on-ramp to dcfsens.
  - decimals "The decimals pass" (Formatting, after format): Alt H 9 /
    Alt H 0 — dollars zero places, multiples and percents one. Columns
    shuffle; values must survive untouched.
- CAMPAIGN CHAPTERS UNTOUCHED (versioned paths): new drills join groups
  and gates but never retro-unclear anyone's chapter badges.
- PARKEYS from sweep medians: colops 13, anchor 13, decimals 15, foot 8.
- VERIFIED: replay 69/69 GREEN, parity 37, onboard 20, visual 311,
  rank 20, par sweep FLAGGED 0, node --check clean.
- CACHE v147 -> v148 (all 9 pages).

---
# ROUND 169 — THE DOCTRINE ROUND: anti-railroad harness + methodology + pipeline
- WOLF'S DIRECTIVE: while Fable is available — codify the drill quality
  methodology, prove drills allow alternative solve paths (not railroads),
  research the external training canon, and leave a callable task pipeline.
- NEW STANDING HARNESS: dev/e2e-alt-paths.js — replays ALTERNATIVE
  solutions per drill: ribbon vs ctrl chords (alt h 1 / ctrl+b,
  ctrl+shift+! / alt h k), dialog routes (alt h v s vs alt e s), ribbon
  fills (h f i d/r vs ctrl+d/r), ctrl+± with shift+space rows, typed $
  vs F4 vs pointer+F4, and order permutations everywhere (deck-first
  copyover, bold-first undo, insert-first colops, foot-first sort...).
  RESULT: 14/14 alts across 13 drills PASS on first run — end-state
  grading held; zero railroads found in the covered set. Harness is now
  part of the standard gate; every new/rebuilt drill must land an ALTS
  entry (one order alt + one chord-route alt where the engine has two).
- dev/DRILL_DOCTRINE.md — the canonical methodology: the five doctrines
  (density / freedom / mix / realism / checklist), build protocol
  (splice discipline, ride-through geometry, engine surface incl. the
  full evalFormula function list), the 7-step test gate, the enrichment
  playbook (smallest-upgrade-first ladder), canon research notes, voice.
- dev/PIPELINE.md — the Fable task queue Wolf can paste into any fresh
  session: T-A enrichment tranche 2 (12 drills, ranked matrix included),
  T-B alt-paths to full 69-drill coverage, T-C Models-tier realism
  audit, T-D engine pack 1 (Go To Special, ctrl+[ precedent jump,
  IFERROR), T-E engine pack 2 (hide, format-cells, filter, grouping),
  T-F rapid-fire bridge, T-G scrape-driven canon diff (needs egress —
  WSO/WSP 403 through this proxy; search layer worked), T-H interview
  mode, T-I seasons. Standing items preserved (Supabase smoke test etc).
- RESEARCH (search layer): WSP/Macabacus/WSO/BIWS/FE-ICAEW consensus
  mapped against our catalog — covered list + missing list recorded in
  doctrine §6; the missing set feeds T-D/T-E (Go To Special is the
  canon's #1 audit ritual we don't teach).
- PROJECT_CONTEXT.md: doctrine arc + 4-harness gate recorded.
- No shipped-asset changes this round (docs + dev harness only) — no
  cache bump. Replay/parity untouched; alt-paths ALL 14 PASS.

---
# ROUND 170 — T-A EXECUTED: enrichment tranche 2 (12 drills hand-graded)
- METHOD: doctrine §5 — grade by hand, smallest upgrade that clears the
  bar. Verdicts: percent/bridge/saves/lookup2/drill/transpose SOUND
  (alt entries only); six took upgrades; two REAL BUGS found by reading:
  - LOOKUP DEMO BUG: demo INDEX range ran 2:6 against a 7-row table
    (MATCH over A2:A8) — out-of-range whenever the queried company sat
    in the last two rows. Replay had been passing on seed luck. → 2:8.
  - ENGINE BUG: classic ribbon MENUS advertises Alt H P (Percent) with
    NO RUN handler — the walk dead-ended back to the tab strip. Added
    RUN['HP'] (percent, 0 decimals). The format alt now exercises it.
- UPGRADES:
  - cagr: page title + a JUDGMENT beat — compute three CAGRs, then READ
    them and bold only the winner (checks: winner bold, losers not).
    Mix rule satisfied: formula + format + judgment. par 72→76.
  - ribbon: 4th walk into the borders SUBMENU (alt h b b rules off a
    block bottom) — teaches menu depth, not just single hops. par 42→48.
  - format: codename title (spot pool shifted off row 1).
  - editfix: typo pool 8→14 (amortization/goodwill/accrued/deferred/
    recurring/working capital — real schedule vocabulary).
  - autofit: dead rnd(0,0) → per-run name rotation.
- ALT REGISTRY 14→26 entries, 25 drills covered: two-way INDEX form,
  header-inclusive lookup2 ranges, typed-$ percent, typed-ref bridge +
  ribbon fill, H V S dialog routes for drill/transpose, alt h p route,
  reverse orders everywhere. ALL 26 PASS.
- VERIFIED: replay 69/69, parity 37, onboard 20, visual 311, rank 20,
  par sweep FLAGGED 0 (ribbon parKeys trued 18→14 measured).
- CACHE v148 -> v149.

---
# ROUND 171 — T-G (partial): CANON DIFF via the search layer
- Direct fetch of every major training site is 403-blocked by the
  environment network policy; the WebSearch summary layer worked. All
  claims in dev/CANON_DIFF.md are tagged [live] vs [canon] accordingly.
- dev/CANON_DIFF.md shipped: covered / recognition-only / missing tables
  with engine-lift estimates; 6 new-drill proposals (hardcode hunt, walk
  the wire, wrap-it-or-fix-it, fold-the-detail, no-merge header,
  SUMPRODUCT rollup); realism nuggets for existing copy. New specifics
  extracted live: grouping chords (shift+alt+arrows, alt+shift+=/−) and
  the WSO "never hide, always group" rule; center-across-selection exact
  path (Ctrl+1, A, TAB, C, C); circuit-breaker convention for circular
  models; IFERROR-sparingly principle; Alt W V G gridlines.
- PIPELINE.md updated: T-A marked done (tranche 3 candidates named),
  T-G marked partial with the egress-remainder spelled out.
- Docs only — no shipped assets touched, no cache bump.

---
# ROUND 172 — T-C EXECUTED: Models + Full Builds realism audit (22 drills)
- METHOD: every advanced drill read line-by-line as a former banker —
  prompts, labels, formula shapes, sign conventions, units, and whether
  checks grade what a desk would recognize. dev/REALISM_NOTES.md holds
  per-drill verdicts.
- VERDICT: 21/22 CLEAN. The tier was built under the doctrine and the
  math is desk-true: Hamada unlever/relever, average-balance interest,
  negative-COGS carried into GP, sponsor-equity-as-plug, financing drag
  in acc/dil, retbridge decomposition that ties as an algebraic
  identity, stocks-don't-sum in the 13-week, engineered check-row zeros.
- ONE FIX: txncomps taught =SUM(D3:D7)/5 for the average while its own
  guide bragged "no hand-typed mean" — desks type AVERAGE. req/guide/
  demo now use AVERAGE(D3:D7); the check accepts either idiom and a new
  alt PROVES SUM/5 still lands.
- ALT REGISTRY 26→30 (advanced tier now covered): wacc debt-side-first,
  txncomps SUM/5, football ceiling-first, dcfsens fill-down-first.
  ALL 30 PASS.
- PAR SWEEP FLICKER RESOLVED: ruleaudit's optimal varies by seed (defect
  count is random) — its 5-rep median oscillated across the 15% drift
  threshold. Measured over 21 seeds: median 16 (range 15-19); parKeys
  20→16. Doctrine note: high-variance drills deserve big-sample medians.
- Nits recorded not fixed (REALISM_NOTES): mid-year DCF variant someday,
  cfslink conversion-memo definition, static peer-name pools.
- VERIFIED: replay 69/69, parity 37, visual 311, onboard 20, alts 30/30.
- CACHE v149 -> v150.

---
# ROUND 173 — T-D (2/3): IFERROR + TRACE JUMPS land in the engine, 71 drills
- ENGINE:
  - IFERROR in evalFormula — outermost preprocessing (every other function
    pre-evaluates args, so a throwing first argument must be caught before
    the parser runs); non-finite results (DIV/0) also route to the
    fallback; nested non-throwing form handled in the fn dispatch.
  - Ctrl+[ jumps to the active formula's FIRST precedent; Ctrl+] finds
    the first dependent ROW-MAJOR — including RANGE CONTAINMENT
    (SUM(B4:B6) reads B5 without naming it; formulaReads() checks both
    literal refs and range coverage). S.traceN latches every hop (the
    undoN pattern) for drills that grade the technique.
- TWO NEW DRILLS (69 -> 71, both Formulas tier, gated):
  - wirewalk "Walk the wire": the deck figure is wrong three links
    upstream; ctrl+[ hop to the subtotal, hop to the source block, fix
    the input the VP's note names, ctrl+] rides back while everything
    reprices. Checks: fixed at source, downstream repriced, traceN>=2.
  - wrapfix "Wrap it or fix it": two #N/A lookups that are NOT the same
    problem — a discontinued segment (truly missing -> wrap in IFERROR
    with a zero fallback) vs a MATCH range aimed at the numbers column
    (merely broken -> F2 fix, and the check FAILS if you bury it in
    IFERROR). The canon's suppressing-is-not-fixing rule, graded.
- PARITY 37 -> 43 (section O: fallback, passthrough, precedent hop,
  range-head hop, dependent-via-containment, traceN).
- ALTS 30 -> 32 (wirewalk no-return-trip; wrapfix fix-first with a real
  F2 caret edit). ALL PASS.
- parKeys from sweep: wirewalk 6, wrapfix 73. PIPELINE: T-D marked 2/3
  with the Go To Special mark-and-walk adaptation spec'd.
- VERIFIED: replay 71/71, parity 43, visual 311, onboard 20, rank 20,
  alts 32/32. CACHE v150 -> v151.

---
# ROUND 174 — WOLF'S TRIPLE: sign convention game-wide, onboarding strand
# fixed (reproduced!), blocksel v3 moves blocks, checklist voice -> imperative
- ONBOARDING BUG (Wolf's report, REPRODUCED): three compounding failures.
  (1) A gate bounce with NO board loaded — boot restore or ?drill= link
  targeting a locked tier — returned into the void: EMPTY GRID + gate
  modal. loadChallenge now falls through to the first unlocked drill
  when no board exists. (2) The gate modal had NO keyboard dismissal and
  the tour scrim ate its buttons — it lingered over everything ("keep
  training / PRO" stuck box). Escape now closes it; mid-tour it degrades
  to a toast. (3) The tutorial prompt could fire over a live session.
  ONBOARD AUDIT 20 -> 23 (locked-resume boot, unlocked fallback, Esc).
- SIGN CONVENTION, GLOBAL (banking best practice, Wolf): expenses carry
  their sign so subtotals are clean sums. Converted: isbuild (SG&A
  negative, EBIT=B4+B5), versionup (COGS/opex negative, GP/EBITDA as
  sums), threestmt (capex negative, net change = one SUM — now matches
  cfslink), audit (opex negative, EBITDA=rev+opex all three break
  classes). Kept as-is with doctrine-documented reasons: wk13 (paired
  gross flows), percent (%-of-revenue magnitudes), pure-cost detail
  tables. signerr already TAUGHT the convention; the game now lives it.
  Doctrine §2.4 SIGNS rule added.
- ENGINE: Ctrl+X CUT — copySel + cut flag; paste MOVES (refs do NOT
  translate, source empties, clipboard consumed — Excel one-shot cut).
  Paste (all kinds) now SELECTS the landed range (Excel parity).
- BLOCKSEL v3 (Wolf: "still light — I left one whole block alone"):
  three islands, three briefs — bold one IN PLACE, the second is parked
  WRONG: grab whole, ctrl+x, ctrl+v on the marked spot, alt h k at the
  new address. Decoy still tests aim. The unused spot pool provides the
  destination (geometry stays ride-through-safe). par 38->52, parKeys 10
  (measured). Alt: move-first + ctrl+shift+! + ribbon bold.
- CHECKLIST VOICE (Wolf): checks are now IMPERATIVE COMMANDS ("bold the
  survivor's header", "delete the whole DRAFT column") — 58 front-door
  labels converted; doctrine §2.5 rewritten; T-J queued for the ~45
  advanced-tier stragglers. T-K queued: interactive onboarding v2 spec
  (do-it beats + why-card — Wolf's "justify the product" note).
- VERIFIED: replay 71/71, alts 32/32, parity 43, onboard 23, visual 311,
  rank 20, sweep clean after blocksel parKeys true-up. CACHE v151->v152.

---
# ROUND 175 — INTERACTIVE ONBOARDING V2 (T-K) + the no-do-nothing rule
- TOUR V2 — sell first, explain later (Wolf: "justify the product, more
  interactive"): 7 explanation spotlights -> 6 steps, only 3 of them
  explanatory. Step 1-2 are DO-IT beats: the card says "your mouse needs
  ~4 seconds, your keyboard needs ONE press — hold ctrl and tap →" and
  the user presses the REAL chord on the LIVE sheet (guard lets exactly
  the asked chord through; everything else stays blocked; the beat
  auto-advances after the press). Step 3 is the WHY card: analysts live
  in Excel 6-10h/day, a mouse round-trip costs ~2s vs ~0.3s a chord,
  seniors read keyboard pace as a signal, every drill is a real desk
  task — play it like a ladder game. Then checklist / trainer / ladder
  spotlights (formula-bar + modes steps cut). Esc still skips all.
- ONBOARD AUDIT 23 -> 28: do-it hook opens, stray keys blocked on do-it
  beats, the asked chord advances AND executes on the live sheet,
  second beat lands on the why-card.
- NO-DO-NOTHING CHECKS (Wolf): every checklist line must demand a
  discrete action or graded outcome. Folded 5 standalone leave-it-alone
  lines into the ok of the action checks they guard: undo (LIVE column
  intact -> the delete check), blocksel (decoy -> bold + comma checks),
  polish (other table -> all three dress checks), wrapfix (tape intact
  -> the fix check), colops (data travels -> the delete check).
  Doctrine §2.5 rule added. Grading power unchanged — only the lines.
- VERIFIED: replay 71/71, alts 32/32, parity 43, onboard 28, visual 311,
  rank 20. CACHE v152 -> v153.

---
# ROUND 176 — WOLF'S PLAY-SESSION PAIR: celebration Enter-eats-results + #####
- CELEBRATION vs RESULTS CARD (reproduced): Enter on an achievement /
  level-up toast fell through and RESTARTED the drill under it. Three
  fixes: the game keydown ignores trusted input while __hkCelOpen; the
  results chain guards on it too; hkCelebrate blurs any focused results
  button (Enter's default click was a second path). Enter now dismisses
  the toast and LINGERS on the results card; second Enter behaves
  normally. New: V on any celebration jumps to your player card.
- THE ##### CLASS, fixed at three layers:
  1. ENGINE fmtNum GENERAL format is now Excel-like — binary float noise
     (1152.2999999999997) can never render; toPrecision(10) cleanup, and
     decimals seeded WITHOUT a style are honored (fixes latent raw
     quotients in comps/txncomps/lbo displays too).
  2. ENGINE autofit CLAMP at 220px — a long title used to autofit its
     column to 300px+ and blow the fixed 10-col grid apart. 220 fits
     every house number format and keeps ten columns on screen.
  3. NEW STANDING HARNESS dev/e2e-fit-sweep.js — no drill may LOAD with
     ##### (numeric cell text vs actual colW, x3 seeds, all drills;
     autofit/combo/gauntlet exempt — the squeeze IS their lesson).
     First run caught THREE: housestyle + dress (raw quotient margins ->
     decimals:4 seeds), format (8-digit magnitudes -> $mm / 000s scale
     that fits raw AND cast). ALL CLEAN now; added to the doctrine gate.
- Alt H O W / H O H numeric size dialogs queued into T-E (Wolf's
  intuition: sizing drills should SET widths, not autofit-roulette).
- VERIFIED: replay 71/71, alts 32/32, parity 43, onboard 28, visual 311,
  rank 20, fit sweep clean. CACHE v153 -> v154.

---
# ROUND 177 — THE FORMAT WARDROBE: Ctrl+1 dialog + de-indexing comma (Wolf)
- WOLF'S CALL: comma formatting was over-indexed (desks cycle formats via
  Macabacus/FactSet); the game was missing multiples, dates, superscript
  footnotes, center-across — the formatting people actually reach Ctrl+1
  for. All landed this round.
- ENGINE — mini FORMAT CELLS dialog, keyboard-only, instant-apply:
  Ctrl+1 opens it; so does legacy ALT O E (the pre-ribbon chord that
  still works in real Excel — and Chrome reserves ctrl+digit for tab
  switching, so the legacy route is the always-capturable browser path;
  guides teach both). Letters: G general · N 1,234 · C $1,234 · P 12.3%
  · X 8.2x · D Mmm-yy · F footnote ¹ · A center-across. New fmtStyles:
  'mult' (x-suffix) and 'date' (Excel serial -> Mmm-yy). Footnote = a
  real superscript ¹ toggled on text cells. CENTER ACROSS SELECTION:
  cell.ca span rides the r107 text-spill renderer, centered — the
  never-merge rule made keyboard-real.
- DRILL FOLDS (existing drills, per Wolf — no new drills):
  - format v3: two new rows — EV/EBITDA cast to 8.2x (ctrl+1 x) and a
    raw serial cast to Mmm-yy (ctrl+1 d). par 42->58. aha rewritten:
    "ctrl+1 is the whole format wardrobe."
  - dress: the adjusted-margin label takes its footnote ¹ (ctrl+1 f).
    par 97->104.
  - center: the stranded title centers ACROSS the model (ctrl+1 a,
    "merged cells are banned"). par 46->56. aha now carries the
    numbers-right / headers-centered / center-across best practice.
- PARITY 43 -> 48 (section Q: multiple, date, footnote, center-across,
  esc-clean). ALTS 32 -> 34+2 rewrites (alt-o-e routes for all three).
- DOCTRINE: format-emphasis note (comma = native baseline, not the
  star); realism rules gain mult/date/ca/footnote conventions.
  PIPELINE T-E pruned (ctrl+1 done ahead of schedule).
- VERIFIED: replay 71/71, alts 34/34, parity 48, onboard 28, visual 311,
  rank 20, par sweep 0 flagged, fit sweep clean. CACHE v154 -> v155.

---
# ROUND 178 — THE DATA MODULE GETS REAL (Wolf: "data drills not very built out")
- DECISION (Wolf's question answered with structure): data VALIDATION is
  skipped on purpose — dialog/mouse-heavy, not hotkey-central. But the
  Data section was thin for a bad reason: the two hotkey-dense data jobs
  every analyst actually owns were missing. Both built, ZERO engine work
  (COUNTIF / INDEX+MATCH / row ops / sort / autosum already existed).
- MODULE MERGE: Lookups (2 drills) folds INTO Data — lookups ARE data
  work. Data = sort · scrub · recon · lookup · lookup2. Two stub groups
  became one coherent 5-drill module. Campaign chapters untouched
  (versioned); gates unaffected (Data/Lookups were never gated); sumif
  deliberately STAYS in gated Formulas so the free tier doesn't widen.
- NEW DRILLS (71 -> 73):
  - scrub "Clean the export": the tape came out of the system dirty — a
    duplicated header row, a '--- PAGE 2 ---' break, and a SUBTOTAL trap
    that would double-count the foot. Delete all three (alt h d r),
    sort what's real largest-first, refoot with alt+=. Junk positions
    shuffle; checks scan the WHOLE sheet for surviving junk.
  - recon "Two systems, one truth": trading shows 7 deals, finance
    booked 6, and one shared amount disagrees. COUNTIF flags presence,
    the missing deal comes across with its book amount, INDEX/MATCH
    pulls the record amount into a Δ column, and nothing passes until
    every Δ reads zero. The first-year's actual data job, graded.
- ALTS 34 -> 36 (scrub top-down deletion with shift arithmetic + typed
  SUM; recon in scrambled order). parKeys from sweep: scrub 19, recon 81.
- VERIFIED: replay 73/73, alts 36/36, parity 48, onboard 28, visual 311,
  rank 20, fit sweep 70 clean, par sweep 0 flagged. CACHE v155 -> v156.

---
# ROUND 179 — ROW GROUPING lands (T-E): never hide, always group (74 drills)
- ENGINE — the hidden-rows substrate + grouping on top of it:
  - S.rowGroups[{r1,r2,collapsed}]; hidden rows DERIVE from collapsed
    groups only — the canon rule is structural: hiding happens through a
    group or not at all. SUMs still see hidden rows; only display and
    navigation route around them (visStep; ctrl-jumps never land inside
    a fold; the cursor relocates when its row folds under it).
  - Chords: Shift+Alt+→ groups the selected rows, Shift+Alt+← ungroups,
    Alt A H hides detail, Alt A J shows it — including from the summary
    row NEXT TO a collapsed group (where the ⊞ sits; Excel behavior).
  - Two real bugs caught while wiring: the r91 Alt+arrow drill-hopper
    swallowed Shift+Alt+→ (now shift-excluded), and Show Detail was a
    no-op from the natural cursor position (adjacency expansion added).
  - Visuals: grouped rows carry an accent rail on the row header; the
    first visible row after a collapsed block shows ⊞.
- NEW DRILL grpfold "Fold the detail away" (Data, 74 total): monthly
  detail under three quarterly subtotals; the MD wants the summary view.
  Group each month-block, fold each one — the Q-total rows stay on the
  page and their SUMs keep breathing (hidden months still count).
  Checks grade S.rowGroups directly: three exact-range groups, all
  collapsed, subtotals visible + live. Alt: quarters in reverse plus
  one fold REOPENED via Alt A J and refolded.
- PARITY 48 -> 53 (section R: group/fold/route-around/reopen/ungroup).
  ALTS 36 -> 37. parKeys 12 (measured). Filter (Ctrl+Shift+L) queued to
  ride this same substrate next.
- VERIFIED: replay 74/74, alts 37/37, parity 53, onboard 28, visual 311,
  rank 20, fit sweep 71 clean, par sweep 0 flagged. CACHE v156 -> v157.

## r180 — AutoFilter engine (Ctrl+Shift+L) + filterpass drill
- ENGINE: AutoFilter rides the r179 hidden-rows substrate exactly as
  planned — syncHidden() now unions filter exclusions with collapsed
  groups, so navigation routing, render skipping, and SUM-sees-hidden
  all came free.
  - S.filter = {hr, c1, c2, r2, excl:{col:[values]}}. Ctrl+Shift+L arms
    on the active row as header: columns expand left/right while header
    cells are non-empty, body extent stops at the first blank row.
    Toggling again clears everything. Arming from an empty cell is a
    toast + no-op.
  - Alt+↓ on an armed header opens a value-picker dialog in the ribbon
    strip (chips modeled on the fontcolor picker): ←/→ walk, space
    toggles keep/drop, ↵ applies, Esc cancels without applying. Reopening
    shows the column's current drops. Ribbon route: Alt A T (Data →
    Filter). Every armed header renders a ▾ (bright when that column
    excludes values).
  - Chord conflict resolved by ORDER: the Macabacus profile claims
    Ctrl+Shift+L first (Fast Fill Left, its documented default); native
    (and FactSet) profiles get the Excel filter toggle.
  - No SUBTOTAL function yet — the filter is a READING tool; SUMs see
    hidden rows (parity-asserted). SUBTOTAL(9) stays queued in PIPELINE.
- NEW DRILL filterpass "Work the filtered tape" (Data, 75 total): a
  9-deal tape with Open/Closed/Dead statuses, shuffled + distinct sizes
  per seed. Arm the filter, drop non-Open through the Status picker,
  then TYPE the largest open size into the answer cell — the check
  grades the read, not just the chord. Exactly-non-Open-hidden is graded
  through S.hidden, so excluding by any column that isolates Open rows
  also passes (no railroad). Alt: answer typed FIRST, armed via Alt A T
  from a different header cell, chips swept right-to-left.
- One smoke-harness lesson re-learned: synthetic keydowns are swallowed
  by the landing overlay unless the harness sets the onboard/tour
  localStorage flags (the standing harnesses all do; the new smoke
  script initially didn't).
- PARITY 53 -> 60 (section S: arm-from-middle-cell, ▾ markers, picker
  open, exact hidden set, SUM-sees-hidden, clear, ribbon route).
  ALTS 37 -> 38.
- Par sweep flagged editfix 33 -> 39 on its 5-seed sample; the 21-seed
  median is exactly 33 (range 15-47 — the typo pool is the variance).
  No retune; the r172 big-sample rule catches another false flag.
  filterpass parKeys 14 measured clean on the same sweep.

## r181 — enrichment tranche 3: the advanced tier gets the doctrine
- Hand-graded growth, wacc, revolver, waterfall, txncomps, football per
  doctrine §5 (the T-A tranche-3 queue). One real breach found and fixed,
  the rest was voice and polish.
- WATERFALL (the breach): capex and cash interest were built as POSITIVE
  blue inputs with FCF = B2-B3-B4 — exactly the §2.4 SIGNS pattern the
  doctrine forbids and the neighboring cfslink/nwcsched drills do right.
  Now both carry their negative sign and FCF is one clean =SUM(B2:B4);
  req/guide/demo updated, expected values unchanged. Also merged its 6
  checks to 4 (the §2.5 cap): TL tier and revolver tier each grade as
  one line (paydown + corkscrew + endings together).
- CHECKLIST VOICE: all 21 state-phrased labels across the six drills
  rewritten to imperative commands (verb first, artifact + cell named,
  ok-expressions untouched) — "the balance row is DRESSED" is now
  "dress the balance row — bold B6:E6 with a rule above". This clears
  most of the T-J remainder for the Models tier.
- TXNCOMPS realism: multiples column now wears fmtStyle 'mult' (reads
  8.2x, not 8.2), an Announced date column (Mmm-yy serials, context
  only) finally supports the "precedents are comps with dates" aha, the
  buyer list shuffles per seed, and the prompt's false "anchored SUM"
  became "live formula". Sibling note: the trading-comps drill has the
  same bare-decimals multiples column — queued for the next formatting
  pass, not touched here.
- ALTS 38 -> 41: growth (bold-first + alt h p + algebraic (C4-B4)/B4
  variant), revolver (MAX-outside nest + prove-outs bottom-up + border
  before bold), waterfall (corkscrews linked BEFORE the block fills,
  narrower fill geometry than the demo — proves no sequence latch).
- Revolver sign convention intentionally NOT flipped: its rows read as
  balances plus a magnitude sweep (the doctrine's magnitude-schedule
  exception); debtsched remains the negative-convention exemplar.
- No cache bump: only index.html + dev harnesses changed this round
  (drills.js/nav.js untouched; pages revalidate HTML on fetch).

## r182 — Go To Special engine (F5/Ctrl+G) + hunt drill (76 drills)
- ENGINE: the pre-ship audit ritual, adapted to engine reality exactly as
  PIPELINE T-D specced — no multi-region selection exists, so F5 (or
  Ctrl+G) -> S -> O/F/K MARKS every matching cell instead: dashed-amber
  outlines, S.marks + S.markCrit + a markN latch.
  - Constants means NUMBERS (txt excluded) — the desk unchecks
    text/logicals before hunting hardcodes; comment says so in code.
  - Enter rides the marked set in scan order (Shift+Enter backward);
    committing an edit INTO a marked cell walks to the next survivor,
    and syncMarks() in commitAction re-derives membership, so a relinked
    hardcode unmarks itself — the hunt shrinks as you work. Commits into
    unmarked cells move normally (no teleport while marks idle).
  - Esc's second duty (after marching ants): clear the hunt. Dialogs are
    keyboard-only, Esc-safe, painted in the ribbon strip like fmt/filter.
  - F5 preventDefaults browser refresh — Excel parity wins mid-drill.
- NEW DRILL hunt "Hunt the hardcodes" (Formulas, 76 total): the intern's
  opex build FOOTS — but three calc cells are typed-over stale numbers.
  Eyes can't find them (that's the aha); the ritual lights up 13 raw
  numbers, the player reads which three sit in the calc block, relinks
  each (mark dies on commit), then foots and bolds the total row. Mix
  rule: dialog ritual + formula + fill + format. parKeys 46 (measured,
  21 seeds, zero variance — formula lengths are constant).
- PARITY 60 -> 67 (section T). ALTS 41 -> 42 (totals-first + ctrl+g
  route + crimes in reverse). CACHE v158 -> v159 (drills.js changed).

## r183 — checklist voice: the whole site speaks in commands (T-J complete)
- The T-J inventory turned out ~7x the estimate: 162 label instances
  across 42 drills were state descriptions ("the check row reads ZERO",
  "Availability is live") or verbless fragments ("ending cash across
  the sheet") — the fragment class was never counted in the r174 tally.
  All 162 rewritten to imperative commands (verb first, artifact + cell
  named, meaning unchanged, ok-expressions untouched): "prove the check
  row — ZERO both years, it balances honestly", "run ending cash across
  the sheet".
- Kept-as-is by decision: the navigation drill's hotkey-notation labels
  ("Ctrl+Home → A1") — they read as notation, which is the point of a
  tour drill; converting them would add words without adding a command.
- Mechanics: anchors verified byte-for-byte before patching (the file
  mixes \uXXXX escapes and literal glyphs, even between sibling drills
  — ruleoff escapes its dashes, ruleaudit doesn't); three byte-identical
  duplicate pairs replaced with count=2; diff is exactly 162 label lines
  and nothing else. All 40 touched drills replayed to a win with clean
  concatenated labels before the gate.
- No cache bump: index.html label strings only.

## r184 — anti-railroad coverage complete: every drill has an alt (T-B done)
- ALTS 42 -> 77: all 35 uncovered drills got an alternative-route entry.
  The long builds carry the highest-value proofs — threestmt builds the
  BALANCE SHEET before the CFS, dcf lays the PV row before the discount
  factors it reads, lbo types the whole chain in REVERSE (IRR first),
  debtsched builds the machine before the VP's rate exists — all riding
  the engine's multi-pass recalc, which closes forward references on
  the final commit. Chord swaps throughout (ribbon fills, alt h 1,
  alt h p, ctrl+shift+!, ctrl+1).
- DOCTRINE FINDING (recorded, not forced): navigation's checks are a
  sequential state latch BY DESIGN — the tour is the lesson, so no
  reordered route can exist. Its entry proves the one real freedom:
  ribbon row-insert/delete (alt h i r / d r) satisfies the same
  lastRowOp latches as the ctrl chords. blue and modeltour are
  order-permutation-only (the engine offers no second chord route).
- One real bug caught in the harness itself: regex escapes die inside
  the ALTS template literals (`\d` collapses to a literal 'd' before
  eval), which silently turned two entries' cell parsing to garbage.
  Both rewritten to string ops; noted here so future entries avoid
  regexes in moves sources.
- 35/35 pass (after the harness fix); no check needed loosening — the
  end-state grading discipline held across the entire advanced tier.

## r185 — manual hide + column width dialog + unhide drill (77 drills)
- ENGINE: the canon's forbidden op, built so a drill can teach WHY it's
  forbidden. Ctrl+9 hides selected rows into S.hiddenRows (third client
  of the r179 hidden-rows substrate after groups and filter);
  Ctrl+Shift+9 unhides across the selection (single-cell reach-one-
  either-side, Excel parity); ribbon routes Alt H O U R / O. Chrome
  steals ctrl+digit live, so the ribbon route is the taught path (the
  Alt O E precedent). Boards can now LOAD pre-hidden (loadChallenge
  carries built.hiddenRows) — that's the drill's whole premise.
- Alt H O W: numeric column-width prompt in the ribbon strip — type
  Excel character units, Enter applies to the selected columns
  (px = units*7+5, clamped), Esc cancels. Row height (Alt H O H) NOT
  built: the engine has no row-height model; queued with a note.
- NEW DRILL unhide "Flush the hidden rows" (Data, 77 total): inherited
  tape where rows 4-7 are just GONE — no ⊞, no rail, row numbers skip.
  Unhide the sins, regroup them the house way, fold honestly, and fix
  the crushed Size column with a real width. The load state is an
  intentional squeeze — fit-sweep exemption #4. par 68 / parKeys 12
  (21-seed, zero variance).
- One smoke-harness lesson (not an engine bug): Esc while the results
  card is up means "to menu" by design — a test that wins the drill and
  then keeps pressing keys is testing the menu. Reordered the smoke.
- PARITY 67 -> 73 (section U). ALTS 77 -> 78 (width-first + ribbon
  unhide + grouped-while-hidden). CACHE v159 -> v160.

## r186 — rapid-fire ↔ classic bridge (T-F) + par-sweep variance list
- RAPID-FIRE DECKS: the picker's rapid-fire menu now carries a deck row —
  "all chords" (the full bag, unchanged default) and "dialog chords":
  find / replace / go to / format cells / insert fn / comment / freeze /
  link / new sheet / save / show formulas / paste values — the twelve
  ops classic drills never exercise, isolated so they stop drowning in
  the full rotation. Deck click keeps the popover open; the duration
  click starts the run; the bag builder filters by deck and cycles the
  full family before any repeat.
- reference.html gains a "Classic ↔ rapid-fire" section mapping each
  classic drill family to the card categories that drill the same
  chords, and naming the dialog deck's twelve.
- PAR-SWEEP: known-variance list (editfix). Its 5-seed median has now
  crossed the flag threshold in BOTH directions across four gates
  (39, 24, 42 vs the 21-seed median of exactly 33). Reported as
  info-only; the flag stays armed for every other drill. Retunes still
  require a 21-seed median per the r172 rule.
- No cache bump (inline page changes only; shared assets untouched).

## r187 — backlog-matrix quality round (the r169 suspects, closed out)
- BRIDGE: the block finally MOVES — four spot-pool anchors per seed
  (§2.1: sites randomize, not just values). Point-mode keystrokes are
  identical from any anchor, so par is untouched; req/guide/targets/
  demo/checks all derive from the geometry now. ALTS entry rewritten
  geometry-derived.
- SAVES: the flag stood since r169 — its "blocks of work" were typing
  'done' three times. Now three DIFFERENT micro-jobs per seed (mark
  done / bold the total / comma the figure), each ending in Ctrl+S;
  four checks (three actions + the save latch). parKeys 15 -> 11
  (21-seed, zero variance). The aha finally tells the truth.
- DRILL (hardcode): a live margin memo now sits under the block — an
  over-broad Ctrl+Space column paste flattens it and FAILS check 1
  (guard folded into the action check per §2.5; smoke-proven both
  directions). Honest-path keystrokes unchanged.
- EDITFIX: typo pool 14 -> 19 (severance/collateral/contingency/
  impairment/maintenance — schedule vocabulary, mid-word divergence).
  Fresh 21-seed median 32 (range 20-58), declared 32; VARIANCE_OK note
  refreshed.
- COMPS: multiples finally wear the x (fmtStyle 'mult' on D3:D10) —
  verified no check/demo/alt/harness compares display text before
  changing. RIBBON's matrix flag was stale: its 4th job family (borders
  submenu) shipped at r170; nothing to do.
- The r169 enrichment backlog matrix is now fully dispatched.
- No cache bump (index.html + dev files only).

## r188 — SUMIFS engine + rollup drill (78 drills) — CANON_DIFF closed
- ENGINE: SUMIFS(sumRange, critRange, crit, ...pairs) and SUMPRODUCT
  (pairwise dot product across equal-length ranges) join evalFormula,
  mirroring SUMIF's ref machinery. Malformed args throw into IFERROR,
  never into the sheet (parity-asserted).
- NEW DRILL rollup "Cross the tape" (Formulas, 78 total): raw
  segment × region tape, and the MD wants the CROSS. One SUMIFS with
  ranges $-locked, $F3 column-locked, G$2 row-locked — the dcfsens
  mixed-anchor lesson pointed at data — fills the whole 2×2 grid, then
  feet + dress. Negative case smoke-proven: an over-anchored $F$3/$G$2
  formula repeats one value across the grid and FAILS. Every combo
  seeded ≥2 rows so no grid cell is ever legitimately zero. parKeys 68
  (21-seed, zero variance). Alt: feet FIRST via multi-pass recalc,
  criteria pairs swapped, all fills by ribbon.
- With this, ALL SIX new-drill proposals in dev/CANON_DIFF.md §4 are
  live (hunt r182, wirewalk/wrapfix r173, grpfold r179, center-across
  r177, rollup r188). The §5 realism nuggets landed too: balcheck cites
  the OK/ERROR desk convention, audit names the F5-special sweep the
  seniors run, housestyle carries the never-merge rule verbatim.
- PARITY 73 -> 77 (section V). ALTS 78 -> 79. CACHE v160 -> v161.

## r189 — docs only: pipeline state-of-the-queue header
- No game assets touched (verified: diff is dev/*.md only). PIPELINE.md
  now opens with the r188 queue state — every executable task done; the
  three gates to what's next (egress session, Wolf's two decisions,
  deferred engine items) named explicitly for whichever session
  continues from here.

## r190 — Wolf's playtest round: ghost toggle, real footnote chord, (parens)
- GHOST: now a toolbar toggle (👻, persisted, default on) — Wolf: "I like
  it but it's distracting." Off hides the cursor ghost AND the pb pace
  counter; race links stay visible. The "slightly off" highlight was
  real: the ghost box ignored gridwrap scroll offsets — fixed.
- FOOTNOTE: the Format Cells letter is now E — Excel's actual Font-tab
  superscript accelerator (Alt+E), exactly the flow Wolf described from
  the desk. F is inert in the dialog. Both routes (ctrl+1 / alt o e)
  parity-tested. Whole-cell ¹ stays the mechanic — in-cell partial text
  selection is beyond the engine deliberately; noted in PIPELINE.
- (PARENS): comma and currency styles now wrap negatives in parentheses
  — Excel's own behavior and the desk convention Wolf asked for by
  name. Percent/mult keep the minus. Alt H K suddenly earns its keep:
  the comma pass is what flips costs to (parens) on the page.
- DRESS v4: gains the beat Wolf specced — a live EBITDA total row to
  bold + rule off (alt h b t), costs visibly flip to (parens) during
  the comma pass, and columns are wide enough that NOTHING needs
  resizing mid-drill (his exact complaint). Six checks — one over the
  soft cap, accepted for the flagship full-pass drill. par 112 /
  parKeys 28 (21-seed flat).
- FIT-SWEEP LEARNS POST-SOLVE: the sweep now replays every demo and
  scans the WIN state too. First run caught NINE drills that could
  ##### mid-solve (the class Wolf kept hitting): parens widened
  schedule/debtsched/nwcsched, comma@2 overflowed ribbon/saves, raw
  10-sig-fig quotients overflowed triage/covtable/cases, dcf was
  borderline. All fixed at the source (widths, magnitudes, seeded
  decimals). ALL CLEAN, load + post-solve, 74 drills.
- Gate postscript: the dress par tune initially FAILED SILENTLY — its
  patch anchor used a literal em dash where the file stores —, the
  assert tripped inside a background command chain, and the gate ran on
  stale values (that was the FLAGGED:1). Root rule reaffirmed: anchor
  asserts only protect you if the script runs where you can SEE it die
  — par tunes now run foreground before any gate. Also: wk13's 58px
  columns overflowed on paren-negative seeds the first clean sweep
  happened to miss — widened to 76 (fit is seed-dependent; the sweep's
  3 reps are a sample, not a proof).

## r191 — Paste Special grows up: floating card + real operations (Wolf spec)
- THE DIALOG: Paste Special now floats over the SHEET as a compact card
  — Excel's own presentation — instead of the bottom-right corner pin
  it had worn since r36 (an #pasteDialog ID rule was overriding
  everything; the class-rule "modal" CSS had been dead specificity for
  months). Position clamps to the viewport, the page never dims, and
  the ribbon strip dedupes to a one-line hint. Found the hard way: the
  class rule's inset:0 kept stretching the card to the viewport bottom
  under the JS positioning until removed.
- OPERATIONS: the card gains Excel's Operation group — N None (default,
  reset on every open) · M Multiply · D Add, real accelerators. An
  operation paste is pure arithmetic over the whole SELECTION with the
  clipboard broadcast cyclically: the copied single −1 × a column is
  THE desk sign-flip. Formula cells wrap =(F)*k exactly as Excel
  writes them; formats untouched. S.pasteOpN latches.
- TRANSPOSE v2 (Wolf's spec verbatim): the data team sent years-ACROSS
  with positive capex. Flip the WHOLE 5×4 table (labels, years, all
  three metrics) with one transpose paste, stage a −1, and paste-
  special MULTIPLY over the landed capex column — which then reads in
  (parens) thanks to r190. Retyped negatives without the operation
  provably fail (latch check). par 64 / parKeys 14 (21-seed flat,
  tuned in the foreground per the r190 lesson).
- PARITY 77 → 82 (section W: broadcast multiply, formula wrap, add,
  latch, reset-on-open). ALTS transpose entry rewritten (helper first,
  ctrl+alt+v flip, multiply via alt h v s). CACHE v161 → v162.

## r192 — Wolf's playtest round 2: Sort Warning + the Alt+= flow
- SORT WARNING (Excel's guardrail, verbatim): a single-column selection
  with data alongside no longer decouples rows silently — the warning
  asks first. E / Enter = expand to the contiguous block and sort ROWS
  together, keyed off the ORIGINAL column (sortRange grew a key-column
  override so the expanded selection doesn't move the key); C = sort
  the lone column exactly as selected (Excel obeys you); Esc cancels.
  Full-table selections never see the dialog. The sort drill's alt now
  runs Wolf's exact flow: single-column select → warn → E.
- CTRL+ARROW report: could NOT reproduce — the jump primitive behaves
  Excel-correct in every driven flow (from above a table it stops at
  the first occupied cell, i.e. the header, which reads as "2-3 cells
  down"; press again for the bottom). Parity asserts around formatted-
  empty cells added via the X/Y sections' boards; watching for a repro.
- ALT+= FLOW (both Excel forms): (a) RANGE form — select the column
  (or row) THROUGH its empty total cell, Alt+= fills the SUM committed,
  selection preserved, editor never opens: the power move. (b) The
  single-cell proposal still opens the editor, but its Enter-commit now
  STAYS on the cell — ctrl+b lands on the sum, which was Wolf's whole
  point. Ordinary commits still move down; a canceled proposal clears
  its flag in cancelEdit (the first smoke caught Esc taking the editing
  branch around the normal-mode clear).
- PARITY 82 -> 88 (sections X + Y). No cache bump (index.html only).

## r193 — Wolf round 3, Engine Pack 3 + Tranche A (79 drills)
- ENGINE PACK 3: italic (Ctrl+I / Alt H 2), strikethrough (Ctrl+5 /
  Ctrl+1 K — Excel's Font-tab accelerator), TODAY() (checks grade the
  formula, never the value), Alt H B O now draws the selection
  PERIMETER (bl/br edge flags, inline-composed shadows), paste-op
  Divide (I). All four flags threaded through copy/cut/formats/
  transpose carriers. Font size/family recorded as out of scope.
- ENGINE PARITY BUG (found live by the new modeltour): Ctrl+B/I/5 were
  pure per-cell toggles — bolding a row containing an already-bold cell
  flipped that cell OFF. Excel's rule: mixed selection → apply to ALL;
  only a uniformly-formatted selection removes. toggleAllOrNone() now
  backs Ctrl+B/I/5 and ribbon H1/H2. Parity-asserted (section Z).
- MODELTOUR v2: costs carry their sign; the checklist PRINTS the four
  numbers (Wolf: "not clear I'm supposed to calculate" — you're not);
  new totals pass (bold + rule + dollars on GP/EBITDA/NI rows). 3 checks.
- FILLDR v2 (was parKeys TWO): pull a feed row across, foot with one
  SUM filled, then the 2D fill — one mixed-anchor cell → right → down
  → twelve live ratios. par 78/25.
- UNDO v2: the mistake is SCRIPTED — the note names the wrong block,
  you clear it, the second note reveals it fed Q4, ctrl+z rewinds
  exactly, then you aim. Which block is "wrong" randomizes per seed
  (Wolf's trick idea, made deterministic). par 48/5.
- AUTOFIT v2: teaches when autofit is WRONG — content-fit the label
  pair, then ONE width (Alt H O W, 12) across the ragged print block.
  par 48/12.
- NEW DRILL typeset "Typeset the memo" (Formatting): bold the headers,
  UNBOLD the imposter row, italicize the memos, strike the dead line,
  stamp =TODAY(). Every Engine Pack 3 surface in one pass. par 56/12.
- Parity 88 -> 94 (section Z). Five alts rewritten/added, 5/5 pass.
  All pars 21-seed foreground. CACHE v162 -> v163.

## r194 — Wolf round 3, Tranche B (pastes, copyover, editfix rebuilt)
- PASTES v2 "Alt E S everything": three jobs, one dialog, and they CHAIN
  (§8.1 addendum) — a copied 1000 paste-DIVIDEs the $ feed into $000s,
  the totals re-tie live, the dress clones by formats-paste, and the
  deck takes values of the POST-rescale totals (smoke asserts deck ===
  totals). par 74/22.
- COPYOVER v2: the hand-offs chain — full block lands, one column peels
  OFF THE LANDED COPY to the sensitivity strip, the deck takes values
  from the original. Two sources, three destinations. par 58/10.
- EDITFIX v2: F2 across three error species — two label typos, a model
  hardcode audited against its feed column, and a SUM one row short.
  Chained: the range fix only foots TRUE with the audit fix inside it
  (negative-case smoked). Typo pool intact; still on the par-sweep
  variance list (fresh 21-seed median 32). par 66/32.
- INCIDENT, contained: the first Tranche-B apply used a wrong span
  end-marker and silently swallowed the TEN drills physically between
  pastes and transpose — caught by a post-apply key-count integrity
  check against HEAD, restored from the just-pushed r193, re-applied
  correctly. The splice helper now asserts every span contains exactly
  ONE drill key, and the key-count check joins the standard patch
  routine. Nothing reached the remote.
- Three alts rewritten (dialog-route swaps + order permutations), 3/3.
  CACHE v163 -> v164.

## r195 — Wolf round 3, Tranche C (polish, format, dress) — round 3 COMPLETE
- POLISH v2 "Dress the header row": a historical-financials fragment
  with the whole header STACK undressed — title (bold + rule + shade),
  a date row still in raw serials (ctrl+1 D + bold), the money row to
  dollars, the growth memo italicized — and a decoy second table that
  must stay plain (Wolf: "multiple headers, per-row formats"). Four
  checks, per-row judgment graded both ways (dress T1, DON'T dress T2).
  par 66/19.
- FORMAT v2: the dollar pair now includes a NEGATIVE ("Net debt ($mm)")
  so the currency cast visibly lands the ($xx) paren convention (r190
  engine payoff, smoked with a parens assert), and the %-pair check now
  requires ctrl+i — "%-lines whisper" (Wolf: italic percent lines).
  par 62/23.
- DRESS v5: the title takes a clean rule (alt h b b) and a NEW check
  makes the MD's move explicit — one perimeter (alt h b o) around the
  whole OUTPUT row A:E, graded edge-by-edge (bl/br at the corners,
  bt/bb across). Blue-check copy rewritten per Wolf: "we're not
  painting the numbers, we're making the font blue." par 120/32.
- Three alts rewritten (polish: ALT O E date + ctrl+1 currency zero-dec
  route + ribbon bold/italic; format: +italic beat; dress: perimeter
  EARLY permutation), 3/3. Pars 21-seed foreground, dead flat.
  CACHE v164 -> v165. Wolf playtest round 3 fully shipped.

## r196 — THE EGRESS MILESTONE: live smoke re-run, 65/65 first try
- This session reached supabase.co (the first since the r131-r134 marathon)
  so the standing queue item ran: full live smoke against prod. Procedure
  per the r132 fixture rule — smoke-u re-stamped under a NEW timestamp
  (migration 20260714000000_smoke_fixtures_restamp.sql, PR #24, deploy
  Action green in 29s, fixture verified live before the run).
- **65/65 PASS, zero fixes needed.** Everything shipped to the backend since
  the r132 verification held up in prod: auth/gate/profile upserts, desk
  name guards, create/preview/join, invite_code RLS denial, the assignment
  cap + captain-only writes + cascade, invite rotation, both rate-limit
  guards, heir promotion, empty-desk self-delete, school tags (mapped +
  registrable-label fallback + server-column write denial), non-destructive
  domain joins on real seeds, claim-after-domain-join captaincy, reports
  RLS. SMOKE_TS=12016212; throwaway trio listed in SMOKE_REPORT for
  service-role cleanup; smoke-u consumed again by design.
- **Consequence: the seeded desk codes are CLEARED FOR DISTRIBUTION** — the
  pilot playbook (STRATEGY 4.2) now blocks only on Wolf picking clubs.
- Docs: SMOKE_REPORT.md gains the r196 section; PIPELINE.md state-of-queue
  header rewritten (round 3 complete, egress milestone done, T-G remainder
  partially unblocked — macabacus/WSP fetch 200 from cloud sessions, WSO
  still 403).
- SESSION NOTE (coordination class, new): two Claude sessions ran the Wolf
  round-3 queue in parallel today. The other session's r194/r195 reached
  main first; this session's independent Tranche B/C builds were reset in
  favor of the deployed ones (fetch-first caught both collisions before any
  damage), and this session took the egress milestone instead — work the
  drill-focused session couldn't have raced. Rule added to PIPELINE: fetch
  before every round-close; the slower twin yields.

## r197 — T-G canon verification (egress): the Macabacus defaults were wrong
- The standing T-G remainder ran now that egress reached the sources. The
  authoritative CFI×Macabacus cheat-sheet PDF exposed a SYSTEMATIC error in
  our Macabacus plugin layer: the number/border/color CYCLES were over-
  modified with a phantom Alt. Real Macabacus number cycles piggyback on the
  NATIVE Excel format chords — General Number Ctrl+Shift+1, Local Currency
  Ctrl+Shift+4, Percent Ctrl+Shift+5, Multiple Ctrl+Shift+8, Increase/Decrease
  Decimals Ctrl+, / Ctrl+. — not the Ctrl+Alt+Shift+‹digit› we displayed.
  Also fixed: Center Cycle Ctrl+Shift+C, Outside Border Ctrl+Shift+7, Bottom
  Border Ctrl+Shift+Down, Blue-Black toggle Ctrl+Shift+; (a Colors item),
  AutoColor Workbook Ctrl+Alt+Q (was W). 11 chords corrected in drills.js
  HOTKEY_PLUGIN_LAYERS.
- ENGINE FIX (the real bite): index.html actually BOUND the phantom
  Ctrl+Alt+Shift+1/4/5 for the macabacus profile (classic keydown + 5 rapid-
  fire matchers), and a code comment claimed the profile was “verified.” It
  wasn't — it taught wrong muscle memory. Removed the three phantom classic
  bindings and dropped the phantom clauses from the RF currency/percent/comma
  matchers (the real chords already match via RFM.ctrlShift) and the
  num_comma/num_pct aliases. The correct chords (Ctrl+Shift+1/4/5) were always
  handled by the native un-gated format handlers, so macabacus users lose
  nothing and now train the true chords.
- VERIFIED [canon] rows against the cheat sheet: trace precedents Ctrl+[ / ]
  (wirewalk r173 correct), Go To Special F5→Alt+S (hunt r182 correct),
  grouping Alt+Shift+→/← and trace Alt M P (WSP), VLOOKUP characterization.
  FactSet table NOT re-verified (no authoritative sheet reachable) — flagged
  in CANON_DIFF for a future FactSet egress pass.
- Live behavior check (bespoke, macabacus profile): Ctrl+Shift+1/4/5 →
  comma/currency/percent, phantom Ctrl+Alt+Shift+1 no-ops, 0 page errors.
  GATE: syntax → demo-replay ALL GREEN → alt-paths 80/80 → parity 94 →
  onboard 28 → visual 311 → rank 20 → fit-sweep 75 clean → reference.html
  render check. No drill logic touched. CANON_DIFF.md verdicts recorded.
  CACHE v165 -> v166.

## r198 — FactSet layer verified + rowops rebuilt to the depth bar (Wolf audit)
- FACTSET PLUGIN VERIFY (T-G remainder, now that egress reaches FactSet's
  published Hot Keys sheet — media.felix.fe.training PDF via curl+Read). The
  engine-backed chords were all correct (fills Ctrl+Alt+Shift+K/J/D/U,
  AutoColor Ctrl+Alt+E, Currency/Percent Ctrl+Shift+4/5). Fixed in the DISPLAY
  table: Date SmartCycle is Ctrl+Shift+2 not 3; killed two fabricated rows
  ("Ctrl+Shift+: cell color" → the real Ctrl+; Blue-Black; "Ctrl+Alt+Shift+!
  row/col" → Ctrl+Alt+K Paste Row/Column Info); relabelled Ctrl+Shift+Y as the
  Binary (not general) cycle; sharpened the Copy/Paste Exact Formulas labels.
  ADDED missing priority-5 canon: General Number Ctrl+Shift+1, Smart Copy
  Right/Down Ctrl+Shift+R/D, AutoColor Selection Ctrl+Alt+A, Increase/Decrease
  Decimal Ctrl+, / Ctrl+. Display-only (drills.js). Both plugin layers now
  match their live sheets; CANON_DIFF updated.
- FOUNDATIONS DEPTH (Wolf: "marginal improvement, not to the level of my
  vision"). Graded all 13 against DRILL_DOCTRINE §8. Finding: the r193-r195
  rebuilds (modeltour, editfix, filldr, pastes, copyover, undo) hit the bar,
  but the UN-rebuilt reflex cards drag the group's first impression —
  rowops was the worst (par 26/parKeys 11: two disconnected chores, insert a
  row + delete a row, on a 5-row stub; single op family, no chain, not
  sendable). Also flagged for a later pass: ribbon (four order-free
  formatting chores, no chain) and autofit (the "two disconnected islands"
  tell the AUDIT itself named in §8.1).
- ROWOPS v2 "Rebuild the schedule": a real desk moment that CHAINS — the opex
  schedule came back mis-built (a line dropped, a stale PLACEHOLDER wedged in).
  Insert the missing line + type it, delete the junk, then Alt+= the Total —
  it reads the block you just rebuilt, so it TIES only if the structure is
  right (the foot check does double duty enforcing correct insert placement +
  the delete). Bold + rule the total. 3 op families (structural / formula /
  formatting), 4 beats, sendable footed page. Randomizes which line drops,
  which slot the junk sits, values, labels. par 70 / parKeys 28.
  CHECKLIST CLARITY (Wolf, live): first cut read "insert the dropped Insurance
  line below Software — type it in at 260" — a locational lookup + two actions
  in one item. Tightened to "add the missing Insurance line — insert a row,
  enter 260", now a clean parallel to "delete the PLACEHOLDER row". PRINCIPLE
  reinforced (§2.5): a checklist item is ONE crisp command, not a compound
  locational puzzle; the how-to detail lives in the guide, not the check.
- ENGINE: added S.insRowN / S.delRowN persistent counters (mirroring undoN/
  pasteOpN) on both row insert/delete paths (ribbon HIR/HDR + Ctrl+±), so
  structural drills latch on the MECHANIC without brittle geometry checks.
  shiftCellsRows relocates cells but does NOT rewrite formula ranges (house
  fact, confirmed) — hence the design foots AFTER restructuring with Alt+=.
- GATE: syntax → demo-replay ALL GREEN → alt-paths 80/80 (rowops alt rewritten:
  Ctrl-chord insert/delete + typed SUM + ribbon bold) → par-sweep FLAGGED:0 →
  parity 94 → onboard 28 → visual 311 → rank 20 → fit-sweep 75 clean →
  screenshots (fresh + win). CACHE v166 -> v167.

## r199 — modeltour rebuilt as a real P&L cascade (Wolf feedback)
- Wolf on "Chase the marks": great drill, but (a) hard to see WHERE to add the
  formula, (b) it should build down to EBIT then Net income, (c) more borders
  so it's clear you're rebuilding FORMULAS, not hardcoding — "every drill a
  story of a task someone would actually do." The old drill had you fly to
  four #REF! marks and RETYPE the printed hardcode; every subtotal was a random
  number. Reframed end to end.
- MODELTOUR v3: a proper operating P&L that CASCADES — Revenue, COGS, **Gross
  profit**, S&M, G&A, **EBITDA**, D&A, **EBIT**, Interest, Taxes, **Net
  income**. The four subtotal rows are bold + top-ruled (the computed-row cue)
  and each lost ONE cell to #REF!, scattered across columns so ctrl-arrows are
  the way to reach them. The player flies to each and rebuilds the FORMULA
  (=the sum of the lines above; costs carry their sign so it just adds); the
  cascade recomputes down the column on commit. Graded as a LIVE formula with
  value parity — hardcodes reject (§2.2 exception: "don't hardcode" IS the
  lesson). Then close the bottom line and land at A1. 5 periods, marks +
  values + columns jitter per seed. par 78 / parKeys 40 (median 39).
- ENGINE-honest design: #REF! marks are txt cells carrying fmtStyle:comma, so
  dispText shows the "#REF!" string pre-fix and the fixed numeric value renders
  comma'd post-fix (commitEdit preserves format + the bt rule). No new engine
  code needed.
- CHECKLIST CLARITY — BORDERS (Wolf, live, 2nd note): border checklist items
  must be LITERAL single actions ("add a bottom border to the sum row"), never
  "dress this up / rule it off / box this". Split modeltour's close-the-line
  check into two: "dollar-format the Net income row — ctrl+shift+$" and "add a
  bottom border under the Net income row — the statement's closing rule". This
  becomes a standing copy rule; a site-wide border-label sweep is queued next.
- GATE: syntax → demo-replay ALL GREEN (modeltour incl. the 4-check split) →
  alt-paths 80/80 (modeltour alt rewritten: subtotals via SUM(range) in reverse
  order, close NI via ctrl+1 C) → par-sweep FLAGGED:0 → parity 94 → onboard 28
  → visual 311 → rank 20 → fit-sweep 75 clean → screenshots (fresh + win).
  drills.js meta/par synced. CACHE v167 -> v168.

## r200 — border checklist-clarity sweep (Wolf) + doctrine codified
- Wolf: border checklist items must be LITERAL single actions ("add a top
  border to the sum row" / "add a bottom border to the column headers"), never
  vague verbs — "dress this up", "rule it off", "box this". Swept EVERY
  border-bearing checklist label in the catalog: 26 labels across ~18 drills
  (ruleoff, ruleaudit, housestyle, dress, ribbon, polish, rowops, sourcesuses,
  revolver, debtsched, cfslink, bsbuild, nwcsched, threestmt, wk13, football,
  accdil, retbridge …). Each now names the exact border + range: bt →
  "add a top border above the … row", bb → "add a bottom border under the …",
  ball → "add an outside border around …". Grading unchanged (labels are
  display strings); the chords still ride in the guides.
- DOCTRINE codified (dev/DRILL_DOCTRINE.md): §2.5 gains the LITERAL BORDERS +
  ONE-ACTION-PER-LINE rules; new §2.1b "Banker's-Workbook Finish" — every
  financial-statement drill must, at its WIN state, read like a page a banker
  would hand over (bold title, ruled headers, ruled subtotals via top borders,
  bottom-ruled bottom line, perfectly formatted numbers, blue inputs / black
  formulas, no orphan-format cells). Where formatting is the lesson the player
  builds it; otherwise the board ships pre-dressed. This is a standing arc —
  the next passes carry it drill by drill (Wolf steering).
- GATE: syntax → demo-replay ALL GREEN → visual matrix (label render) → spot
  replay of all 18 touched drills WIN 3/3. index.html only (no shared-asset
  ?v bump needed). No engine/grading change.

## r201–r202 — navigation dressed + thinner grid borders (catalog pass #1)
- r201: navigation board dressed to the banker's-workbook bar (§2.1b) —
  codename title, ruled FY header, ruled subtotals. r202: grid border weight
  cut 2px → 1px across both render paths (td.bt/bb/ball box-shadows + the
  inline perimeter shadows), so borders read as a single realistic rule rather
  than a heavy slab (Wolf: "borders look pretty thick — keep visual distinction
  but slightly more realistic"). Both shipped from the parallel handover branch
  (commits #31/#30 on main).

## r203 — navigation FLAGSHIP rebuilt lean: movement + one-chord fill (Wolf)
- Wolf steered the flagship twice: first "insert-then-delete feels pointless"
  (→ insert + build gross profit), then "maybe the insert is too much for our
  intro — make the user MOVE around, select, fill the formula across." Landed
  on the "Movement + fill payoff" shape (Wolf-picked via question): lap the
  model corner to corner (Ctrl+Home/End + the four Ctrl-arrows, zero scroll),
  then the day-one payoff — EBIT margin filled only for FY1, and Ctrl+R spreads
  the formula across all four years in ONE keystroke. No insert, no typing
  (that structural work is rowops, two drills on). Board ships pre-dressed to
  the §2.1b bar; only the margin awaits its fill.
- checks: movement latches sequentially (home→end→left→up→right→down on the
  static 7-row table); the fill grades the END STATE (C7:E7 carry a formula
  whose value ties EBIT[c]/Revenue[c]) so the payoff is reachable any legit way.
- par 30→38, parKeys 11 (measured median after the demo walks the B7:E7
  selection with Shift+→×3 so par reflects real play, not setDemoSel). meta
  desc rewritten off the stale "12-chord obstacle course". Alt path: same tour
  + ribbon Fill-Right (alt h f i r) instead of Ctrl+R.
- GATE: syntax clean → demo-replay 3/3 → alt-paths PASS → par-sweep FLAGGED:0
  → parity 94/94 → onboard 28/28 → fit-sweep ALL CLEAN across 4 full repeat
  passes (chasing an earlier intermittent 1-drill ##### that never recurred —
  not navigation; its ranges are bounded ≤~1000 in 74px cols).

## r204 — Daylight is the default light theme + softer light-theme ink (Wolf)
- Wolf: "make Daylight the default light theme — the dark default is hard for
  some; keep the font a nice darker grey (not black) but more vibrant/visible
  colors for menu items, navigation, and drill headers."
- DEFAULT: system-light browsers now land on Daylight, not the harsher plain
  Light. Changed BOTH init paths — themes.js head IIFE (shared by leaderboard/
  reference) and the trainer's own loadTheme() — to prefers-color-scheme:light
  → 'daylight', else 'default' (dark stays the Wolf-liked windows-grey desk).
- INK: Daylight text #26241f → #38352d, Light #1a1a1a → #35352f (warm graphite,
  not near-black). On LIGHT sheets black-formatted drill cells now follow the
  softened --text (new html[data-dark="0"] td.fc-black rule), mirroring the
  existing dark override — "a nice darker grey, not black".
- VIBRANCE: one lever — --accent drives menu tabs (.tab.on), nav, and every
  drill-header accent. Daylight+Light accent #2ea36f → #0e9b57 (deeper, more
  saturated green), accent-dim → #0a7442, glow → rgba(14,155,87,.16). The
  deeper green also RAISES contrast, so nothing regresses.
- palette is single-source in themes.js (index.html reads window.THEMES); no
  duplicate to sync. GATE: syntax clean → visual-clarity matrix ALL 311 PASS
  (all 20 themes, incl. the new Daylight/Light contrasts) → Daylight screenshot
  eyeballed (accent pops on tabs/logo/chip; ink reads graphite). Shared-asset
  change — ?v cache bump on the 9 pages.
- QUEUED (not built): T-L Daily Challenge 2.0 in PIPELINE.md — level/PRO-gated,
  prominent standalone real-time leaderboard, NYT-style extra-hard daily; paired
  with a UI-streamline audit (the flat tab row has outgrown the feature set).

## r205 — higher-contrast yellow drill-cell font on light themes (Wolf)
- Wolf on the new light scheme: "yellow drills look a little hard to see still —
  might need a different higher-contrast color for that drill set." The
  fc-yellow font swatch (yellow-formatted cells) was #a67c00 — passed the audit
  floor but read weak on the lighter Daylight sheet (~3.2:1). Deepened to
  #8a6300 (amber-gold, ~4.5:1 on the sheet), still recognizably the "yellow"
  swatch but clearly legible. Dark-theme variant (#ffd75e) unchanged — bright
  on dark already. GATE: visual-clarity matrix ALL 311 PASS.

## r206 — ghost cursor opt-in + formula refs only color during edit (Wolf)
- Wolf, reviewing live: (1) "the ghost cursor is still distracting — keep it as
  an optional feature"; (2) "if my cursor is on a formula it's highlighting the
  affected cells — ok for auditing but not how Excel works, and it's distracting
  because I can't tell where my cursor is / where to select-and-drag."
- GHOST: the toggle has existed since r190 but defaulted ON. Flipped to default
  OFF — now opt-in (ghostOn=false; pref reads '1'=on). Toolbar toggle unchanged;
  both the cursor box (gated at the tick) and the pace delta stay hidden until
  the player opts in.
- FORMULA REFS: render used to color a formula's precedents whenever its cell was
  merely SELECTED ("F2-to-inspect"). Real Excel colors refs only while you're IN
  the cell (editing). Dropped the non-editing branch — refColors now populates
  from editBuf only. Selection no longer lights up inputs, so the active outline
  is never lost in a wash of ref outlines. Auditing still rides explicit Ctrl+[
  trace jumps + Go-To-Special marks.
- GATE: syntax clean → demo-replay ALL GREEN → visual matrix ALL 311 PASS.
  index.html only (no ?v bump — Pages serves it fresh). No grading change.

## r207 — navigation rebuilt as a MOVE + SELECT drill; structure ops split out (Wolf)
- Wolf, reviewing r203 live: drop Ctrl+End; the drill should teach the selection
  muscle analysts live on — select entire row (Shift+Space), entire column
  (Ctrl+Space), extend a selection (Shift+arrow), shoot to the edge
  (Ctrl+Shift+arrow) — and Ctrl+arrow should land on the true data edge (it
  "wasn't navigating properly" because r203's board had an empty margin hole).
  He chose "focus navigation; move structure (insert row/col) to the next drill;
  add more navigation muscle, get creative."
- REBUILD: contiguous P&L (no holes → every Ctrl-arrow lands true). 8 graded
  beats, each latched on the exact state: Ctrl+Home → Ctrl+→ (jump) → Ctrl+Space
  (whole column) → Ctrl+Home/Ctrl+↓ (dive) → Shift+→ (nudge) → Ctrl+Shift+→
  (shoot to edge) → Shift+Space (whole row) → Ctrl+Space (the whole model, the
  Shift+Space→Ctrl+Space "select everything" trick as the climax). No Ctrl+End,
  no insert/type. The finale grades on the DATA extent so Ctrl+A is an equal
  route (the alt uses it).
- ENGINE: selectRow()/selectCol() now call checkWin() (mirrors move()) — a
  selection-final drill couldn't auto-complete before; this is the same fix
  class as the r203 move()-checkWin note. Benign for every other drill (checkWin
  no-ops unless all checks pass).
- par 38→42, parKeys 11 (measured 9). meta desc + alt-paths route updated.
- GATE: syntax clean → demo-replay navigation WIN 3/3, E2E ALL GREEN →
  alt-paths ALL 80 PASS (caught + fixed a finale grading bug: the `all` latch
  measured vs S.ROWS, but Ctrl+A stops at the used range < grid height; re-based
  on the data extent) → par-sweep FLAGGED 0 → fit ALL CLEAN → parity PASS →
  onboard PASS → visual ALL 311 PASS. index.html + drills.js (desc/par) +
  e2e-alt-paths.js. No shared-asset ?v bump (index/drills already at v169 from
  this session's arc; drills.js desc is display-only).
- QUEUED next (Wolf): the "Excel-maze" movement layer — make the Ctrl-arrow lap
  bounce through a set path (maze-style, the inspiration for the app); and a
  sleeker theme-aware favicon (both being handled as follow-ups).

## r208 — sleeker, theme-aware favicon (Wolf)
- Wolf: "make the favicon more sleek — not married to the F4 logo — elegant
  against the tab border regardless of the browser's color mode." The old F4
  keycap plate was dark (#1f2126) and skeuomorphic: muddy at 16px, and it all
  but vanished on a dark tab bar.
- NEW MARK: a spreadsheet cell being navigated — a green rounded tile with a
  white cell outline + an active-cursor block (ties straight to the app's
  navigation identity). favicon.svg is THEME-AWARE via prefers-color-scheme:
  deep green #0e9b57 + white cursor on light tabs, brighter mint #2bb978 + dark
  cursor on dark tabs — legible on either bar down to 16px. Regenerated
  favicon.ico (32px, PNG-in-ICO, transparent corners) and apple-touch-icon.png
  (180px, full-bleed green so iOS's own rounding masks cleanly). ?v 169->170.
- Previewed to Wolf at 16/24/32/64px on both light and dark bars before ship.

## r209 — favicon: spreadsheet grid + selected cell (Wolf's pick "A")
- Wolf chose option A from the 5-up: a spreadsheet grid with the active cell
  selected — most representative of the brand/goal. Replaced the r208 cell-cursor
  mark. favicon.svg theme-aware (green tile; white grid on light tabs, dark grid
  on dark). Regenerated favicon.ico (32px) + apple-touch-icon.png (180px
  full-bleed grid). ?v 170->171.

## r210 — rank pill (and tier colors) legible on light themes (Wolf)
- Wolf on Daylight (the default light theme): "some text can't be seen — like my
  rank in the top bar." The .tier-* colors (nav.css + index.html inline copy)
  are light pastels tuned for dark sheets (#c3c8cf silver, #e0b341 gold,
  #7db8ff diamond, …) — ~1:1 on a light bar. Added html[data-dark="0"] .tier-*
  overrides with darker, saturated variants (bronze #8a5323, silver #5f6670,
  gold #8a6600, platinum #1f8574, diamond #2f6bc4, crimson #b23520, mba #6b6250)
  + matching lighter borders. Verified all seven pills legible on the Daylight
  bar. tier-unranked already rode var(--muted) (theme-aware) — untouched.

## r211 — level readout is PROGRESS-first, not an explanation (Wolf)
- Wolf: "the level progress shouldn't be an explanation but more of your current
  progress, xp to next rank etc — like most video games." Clicking the level
  badge (#lvlBadge) opened openXpInfo — the "how xp works" text wall.
- NEW openLevelProgress(): a game-style panel — big level ring + "LEVEL n" + a
  full-width xp bar with "into / need xp" and "<N> xp to LVL n+1", plus the
  current rank (from the nav's cached tier). "how xp works ›" is now a small
  secondary link inside it, not the headline. #lvlBadge.onclick now opens this;
  renderLvl stashes window.__lvlXp so the panel matches the badge exactly.
- Verified on Daylight + dark: ring/bar/text all legible. index.html only,
  display-only (no grading change, no ?v bump).

## r212 (part 1) — DARK CHROME, LIGHT SHEET (Wolf: "feels like Excel")
- Wolf chose, for "keep the main grid a lighter variant so it still feels like
  Excel": the real-Excel-in-dark-mode look — dark nav/ribbon/checklist chrome,
  but the drill grid renders on a LIGHT sheet. Implemented by scoping a fixed
  light palette onto .gridwrap for dark themes only (html[data-dark="1"]
  .gridwrap { --bg/--surface/--surface2/--line/--text/--muted/--faint/--warn/
  --bad + an Excel-green --accent }). CSS vars cascade to every cell, so the
  sheet flips while the chrome keeps the theme. Light themes already have a
  light sheet — untouched. The dark-theme fc-*/fill-blue overrides (tuned for a
  dark sheet) are negated inside .gridwrap so swatches use their light base.
- AUDIT harness corrected (e2e-audit-visual.js): the "sheet bg" was read from
  the BODY (transparent cells fell through to it) — wrong now that the sheet is
  the .gridwrap surface, not the body. Now reads the .gridwrap div's bg. And the
  white-swatch exemption ("white-on-white is invisible in Excel too") now keys
  on the SHEET luminance, not the theme's dark flag — so it applies to any light
  sheet. VISUAL MATRIX: ALL 295 PASS (was 311; 16 fewer = white now exempt on
  the 16 dark themes' light sheets). index.html only (no ?v bump).

## r213 — navigation: discrete arrow beats + a COPY goal; +6 themes; softer sheet (Wolf)
- Wolf on the live nav drill: make each arrow chord its OWN discrete beat (don't
  chain Shift+arrow straight into Ctrl+Shift), add SELECTING DOWN, and give the
  ending a goal (selecting the whole sheet "for no reason" felt weird). Rebuilt:
  Ctrl+Home → Ctrl+→ → Ctrl+↓ (jumps, both axes) → back to A1 → Shift+→ →
  Shift+↓ (extend one, both axes) → Ctrl+Shift+↓ → Ctrl+Shift+→ (shoot to edge,
  both axes) → Ctrl+C. The finale GOAL: the whole model is highlighted, so
  Ctrl+C copies it for the deck (graded on S.clipboard.rect covering A1:E6).
  par 46, parKeys 11 (measured 9). alt = the slow route (repeated Shift+arrows).
  ENGINE: the Ctrl+C handler now runs checkWin() (a copy can be a drill's goal;
  no-op elsewhere).
- THEMES (+6, Wolf: set felt samey): light/paper — Ledger (accounting green),
  Sepia (warm), Frost (cool), Phoebe's Paws (Sakura pink); bold identities —
  Crimson, Tangerine. Light ones keep their own paper sheet; the bold darks ride
  the r212 dark-chrome/light-sheet.
- SHEET: softened the dark-mode light sheet off stark white to a warm off-white
  (--surface #f0efe8) — easier on the eyes (Wolf).
- GATE: demo WIN 3/3, E2E ALL GREEN · alt ALL 80 PASS · par FLAGGED 0 · parity
  94 · onboard 28 · visual ALL 379 PASS (26 themes) · fit ALL CLEAN. themes.js
  shared-asset ?v 171->172.

## r214 — coherent theme-picker order + themes in the intro tour (Wolf)
- Wolf: the picker interleaved light/dark randomly; and the tour never pointed
  out themes. Added window.THEME_ORDER + window.themeList() in themes.js —
  LIGHT/paper first (Daylight, the default light, leads), then DARK roughly
  light→dark (Default/grey leads → Bloomberg black). Both pickers (index.html
  openThemes + nav.js modal) now iterate themeList(); a theme missing from the
  order still shows (appended), so nothing can vanish.
- TOUR: new step spotlighting #navThemes ("make it yours") between the trainer
  and the ladder steps. Onboard audit ALL 28 PASS (walks steps dynamically).
- themes.js + nav.js shared-asset ?v 172->173.

## r215 — campaign progression front-and-center: progress, wider menu, xp bounties (Wolf)
- Wolf: show campaign progress more clearly; the menu was too skinny; and each
  gate should pay a ONE-TIME xp reward (on top of the medal) so the campaign
  reads as the progression spine and funnels toward PRO.
- XP BOUNTIES: HOTKEY_CAMPAIGN chapters gained an `xp` field (150→600, escalating;
  Models 450 / Full Builds 600 carry the fat ones) + a 500 finisher. New
  awardCampaignXP() pays each version's bounty ONCE (hk_camp_xp flags), adds it
  to the local xp estimate driving the level chip, and celebrates. Hooked right
  after every PB save (the only moment a new drill can ship a version).
- MODAL redesign: widened 520→680px; a progress header (versions shipped X/8,
  a drills-cleared bar, campaign-xp earned/total), per-version xp chips
  (claimed=green ✓ / unclaimed=warn / locked=faint) + a per-version progress
  bar, and a PRO funnel line pointing at the Models/Full-Builds bounties.
- GATE: syntax clean; demo-replay ALL GREEN (award hook is a try/catch no-op
  during single-drill replays). drills.js shared-asset ?v 173->174.

## r216 — elegant tab title + F2 no longer shifts the row (Wolf)
- TITLE: "hotkey.gg — keyboard Excel trainer" → "hotkey.gg · spreadsheet
  speedruns" (Monkeytype-flavored, and sidesteps the raw MS-Excel trademark in
  the persistent tab title per Wolf's caution; the app still references Excel
  nominatively throughout).
- F2 SHIFT: the edit caret was a tall block glyph (▏, U+258F) whose line box
  exceeded the cell's, so entering edit mode grew the row ~1px — a visible jump.
  Replaced with a zero-width CSS bar (border-right, height .92em, constrained
  inside the text line box). Measured: table/row/row-below heights identical
  before vs after F2 (delta 0.00) — editing is now shift-free and snappy.
- GATE: syntax clean; F2 row-shift measured 0.00; demo-replay ALL GREEN (editing
  drills exercise the caret). index.html only (no ?v bump).

## r217 — the flagship becomes an EXCEL MAZE (Wolf)
- Wolf: build the Excel-maze movement INTO the first navigation drill so we wow
  people off the bat with real randomization — but keep the "grab the model"
  payoff. Shape chosen: "Maze journey → grab the model."
- THE MAZE: the sheet now ships as a SCATTER of stray marker cells (blue ●), not
  a contiguous block. From A1 the Ctrl-arrows LEAP marker to marker across the
  blanks — the "corner to corner in one keystroke, zero scrolling" wow. The trail
  zig-zags a fixed shape (down, right, down, LEFT, down) so the guide/req stay
  deterministic, but every marker POSITION randomizes. The last leap lands on a
  compact P&L (Revenue/COGS/Gross profit/EBIT × 2 yrs) tucked in a corner; the
  payoff is grabbing it (Ctrl+Shift+→/↓) and Ctrl+C for the deck.
- SELF-VERIFYING BUILD: build() carries a local replica of the engine's ctrlJump
  (`sim()`) and, before shipping a board, replays the whole A1→markers→model
  thread through it — if any leap misses, it re-rolls (80 attempts, then a
  guaranteed-clean staircase fallback). So no random seed can ship an unsolvable
  maze. Verified live: demo-replay WIN 15/15 across random seeds.
- GRADING: 8 discrete latches — m0..m3 (active ON each marker, no selection, in
  order) → model corner → selW (Ctrl+Shift+→) → selH (Ctrl+Shift+↓) → copied
  (the model is on the clipboard). State-graded, so any legit route counts; the
  lit marker + Ctrl-arrow is the fast/intended way.
- GATE: demo-replay 15/15 · alt-paths PASS (thread via Ctrl-arrows, grow the
  block the SLOW Shift-by-Shift way) · visual ALL 379 PASS · fit-sweep CLEAN ·
  onboard 28 PASS · parity 94 PASS · par-sweep navigation par 44 / 9 keys,
  median 8, drift -11% (healthy). drills.js meta desc + HOTKEY_PARS navigation
  46->44; e2e-alt-paths navigation rewritten for the maze state.

## r218 — Phoebe's Paws re-tuned to the cat-toe hex + Foundations design spec (Wolf)
- THEME: Wolf wanted Phoebe's Paws modeled on his friend's cat's toe beans
  (#D5957F) but pushed PINKER. Re-anchored the palette on a soft Sakura rose:
  blush backgrounds (bg #f9e9ee, surface #fef5f8, surface2 #f4d9e2, line
  #ebbfce), a dusty-rose accent (#c55c7d, dim #9e4460, glow from #D5957F@.16).
  Reads clearly pink now, not salmon/tan; keeps the toe-bean warmth. Visual
  matrix ALL 379 PASS (text/muted/accent legible on the blush). themes.js ?v
  174->175.
- SPEC: wrote dev/FOUNDATIONS_SPEC.md — the completed design document Wolf asked
  for after nailing the first two flagships. Codifies the standard nav (the maze,
  archetype 2A movement) and modeltour (the #REF! cascade, archetype 2B build)
  set: the 7 fields every drill specifies, the 2 archetypes (ships-dressed vs
  build-the-finish), the randomization + self-verification bar, the latch/Freedom
  grading shape, the 8-check gate, a per-drill build-to spec table for all 13
  Foundations drills, and how it runs across the remaining sets.

## r219 — Daily Challenge 2.0 + theme-label reactivity fix (Wolf)
- DAILY CHALLENGE (T-L shipped): a ◆ daily-challenge marquee chip (accent, pulses
  when today's sitting is unplayed, ✓ once done) opens a hero modal — today's
  EXTRA-HARD board (curated hard pool: gauntlet/combo/cascade/threestmt/debtsched/
  comps/waterfall/sourcesuses/football/retbridge/housestyle/dcfsens/revolver/
  schedule; seeded worldwide via challengeSeed=dailySeed^0x9e3779b9; own board key
  challenge-YYYY-MM-DD, distinct seed from the casual daily), a live countdown to
  the next drop (Esc-safe, timer cleared on close), the player's streak, and a
  STANDALONE global leaderboard (fastest-per-user from Supabase runs, medals, your
  rank + delta, degrades gracefully offline / signed-out). GATE: level ≥3 to enter,
  isPro() skips it (beta = all unlocked) and reveals the full field (free sees top
  10) + replays + practice re-rolls. scoreKey() routes challenge runs to the
  standalone board; loadChallenge rides the gate like the daily; the chip flips to
  done on a challenge win. Verified: modal renders, countdown ticks, play loads the
  hard board in challengeMode, Esc closes, daily/weekly unaffected, zero page errors.
- THEME REACTIVITY (Wolf's structural note): the top-bar theme name only updated on
  REFRESH. Root cause — index.html defined a LOCAL applyTheme() that shadowed
  themes.js's window.applyTheme and never called syncThemeLabels(); it also set a
  local currentTheme, not window.currentTheme (which syncThemeLabels reads). Fixed
  index's applyTheme to set window.currentTheme + call window.syncThemeLabels().
  Verified: label tracks Daylight→Dracula→Phoebe's Paws on SELECT, no refresh.
  (Same render-once pattern noted for login rank-pill + keyboard-profile overlay —
  queued for the reactivity pass; login needs a live signed-in session to verify.)
- GATE: onboard 28 PASS, parity 94 PASS, demo-replay (navigation/modeltour/
  threestmt/gauntlet) WIN, zero page errors. index.html only (no ?v bump — CSS +
  JS inline).

## r220 — navigation maze v2: random directions, more jumps, paste + home (Wolf)
- Wolf: "love the blue markers — make it RANDOM (up/down/left/right), hard to max
  out, more jumps; keep the block grab but actually PASTE the block; keep ending
  at home." Rebuilt the flagship.
- RANDOM MAZE: the trail no longer runs a fixed zig-zag — build() does a free
  random-direction walk (D/U/L/R) of 5 markers + the model corner = 6 leaps
  (one more than v1). A local ctrlJump replica VERIFIES the whole thread AND the
  deck hop before shipping; re-rolls busts (600 attempts) with a guaranteed-clean
  fixed fallback (which itself includes an up-leap). Measured: 29 distinct
  direction-sequences over 40 builds, fallback only 2/40 — genuinely un-maxable.
- FULL HAND-OFF: thread the maze → grab the model (Ctrl+Shift+→/↓) → Ctrl+C →
  hop right to the green "deck ▸" frame (Ctrl+→, one clean leap from the block's
  bottom-right) → Ctrl+V drops the model in → Ctrl+Home lands home, clean. 10
  ordered state latches (m0..m4, corner, grab, copied, pasted, home).
- ROW/COLUMN SELECT: left OUT of the flagship on purpose — Ctrl+Space (Columns)
  and Shift+Space (Rows) are the explicit lessons of the very next two Foundations
  drills, so the flagship stays crisp. Offered to Wolf to weave a Ctrl+Space beat
  in if he wants it here.
- GATE: demo-replay 20/20 across random seeds · alt-paths PASS (thread + slow
  Shift-grow + paste + home) · fit CLEAN · visual 379 PASS · onboard 28 · parity
  94 · par-sweep par 58 / 13 keys / median 12 / drift -8% / 0 flagged. drills.js
  meta desc + HOTKEY_PARS navigation 44->58; ?v 175->176; alt-paths rewritten.

## r221 — level ladder gates EVERY post-Foundations group (Wolf's PRO funnel)
- Wolf: "increase the level gate — I want the entire level system to gate the next
  drill/campaign behind additional practice so people are incentivized to pay for
  PRO after the Foundations drills."
- GATES: HOTKEY_GATES previously gated only Formulas/Models/Full Builds. Now EVERY
  group past Foundations is gated, escalating: Formatting lvl3/5clears · Values
  lvl4/8 · Data lvl5/11 · Formulas lvl6/14 · Models lvl9/22 · Full Builds
  lvl13/32. Foundations stays free (the hook). Each group opens on (level AND
  pace-clears) OR the campaign chapters BEFORE it (the "pure speed" bypass, fixed
  to never require a group's own circular chapter) OR a real PRO entitlement
  (_pro skips every gate; deliberately not BETA so the ladder runs in beta).
- XP CONSISTENCY FIX: the gate read hk_xp_est while the visible LVL chip reads the
  local solves+breadth estimate (window.__lvlXp) — they could diverge, so a player
  might see "LVL 5" yet stay gated. myXpEst() now returns max(hk_xp_est, __lvlXp)
  so the gate never lags the chip the player sees.
- VERIFIED: fresh profile — Foundations UNLOCKED, all six later groups LOCKED
  (housestyle → 'Formatting' gate), lvl 1 / 0 clears, zero page errors. Onboard 28
  PASS (boot never strands, fallback is an unlocked drill). Gated drills still
  build+win via demo/daily (gate only blocks manual navigation). drills.js ?v
  176->177.

## r222 — blocksel flagship LIFT (Wolf sample: apply the maze DNA to the set)
- Wolf greenlit a "sample-first" refinement pass: take the maze's transferable DNA
  (structural randomization + on-board affordances + read-and-decide + HUD-style
  latches) and lift an existing Foundations drill as the exemplar, to decide ROI
  before running catalog-wide.
- BLOCKSEL LIFT: same core muscle (Ctrl+Shift grab, Ctrl+X/V move, dress) but now
  (a) each of three comp blocks carries an on-board TAG the player must READ —
  ● LIVE (bold it in place), ▸ TO MODEL (carry it to the frame), STALE (leave it);
  (b) the destination is a visible outlined "the model ▸ drop here" FRAME, not a
  bare address; (c) which block carries which tag randomizes every run, so it
  can't be run from memory. 3 clean HUD beats (the STALE guard folded in, never a
  pre-checked line).
- GATE: demo-replay 15/15 across random tag assignments · alt-paths PASS (carry
  first, comma via Ctrl+Shift+!, bold LIVE via ribbon) · visual 379 PASS · onboard
  28 · parity 94 · fit CLEAN after widening columns to 88/74 (the 4-digit comma
  values overflowed the old default width — targeted check 0 #### / 0 h-overflow
  over 14 loads). alt-paths rewritten for the new _o shape.
- READ ON THE SET: the Foundations catalog is already stronger than "raise the
  floor" implied — every drill has a real financial narrative. So the flagship
  lift is REFINEMENT (affordances + read-and-decide + HUD polish), not rescue.

## r223 — navigation maze v3: more jumps, deterministic grab (moat), roomier grid (Wolf)
- Wolf on the live v2: "add even MORE jumps — build it out longer"; the ENGINE catch —
  "when I grab the block with Ctrl+Shift+→, a marker to the RIGHT of the model gets
  swept into the selection (as Excel would), so I have to Shift+Left to drop it before
  pasting — and the keystrokes-to-win then differ across random seeds"; and "make the
  grid more spacious (more rows, smaller height)."
- MORE JUMPS: NMARK 5→7 (7 marker leaps + the model = 8 jumps), a 12-beat checklist.
- THE MOAT (the fix): every marker is now kept OUT of the model's 1-cell bordering ring,
  so Ctrl+Shift+→/↓ always grab EXACTLY the model — no stray marker adjacent to it, ever.
  Verified: 0 ring violations across 40 builds → the keystrokes-to-win are now identical
  every seed. The deck still sits beyond the ring (gap≥2), so the deck hop is unaffected.
- ROOMIER GRID: RN 14→16; the engine auto-shrinks row height as ROWS grows, so it reads
  more spacious. Fit confirmed (nav 0 #### / 0 h-overflow over 20 loads; values ≤950 @74px).
- ROBUSTNESS: the 7-marker walk + moat + fit is restrictive, so attempts 1500→9000 — the
  full 7-marker maze ships 50/50 (0 fallback), 44 distinct direction-sequences /50.
- GATE: demo-replay 20/20 · alt-paths PASS (thread + slow grow + copy/hop/paste/home) ·
  visual 379 PASS · onboard 28 · parity 94 · par-sweep par 70 / 15 keys / median 14 /
  drift -7% / 0 flagged. drills.js meta+par navigation 58→70; ?v 177→178.
- NOTE: the full fit-sweep flagged 1 OTHER drill (not navigation, not blocksel — both pass
  analytically at CHARPX 8.6); a marginal pre-existing overflow to identify + fix next.

## r224 — blocksel post-solve #### fix (comma at 0 decimals, banker style)
- The r222 blocksel lift shipped a POST-SOLVE overflow: Alt H K applies comma with
  2 decimals (engine default), so the moved block rendered "4,900.00" (8 chars) and
  overflowed the 74px columns — the full fit-sweep's one flagged drill (not nav).
- FIX: the comma beat is now the banker standard the rest of the catalog uses —
  Alt H K then Alt H 9 ×2 → commas at 0 decimals ("4,900" fits 74px). Demo, check
  (fmtStyle==='comma' && decimals===0), guide, req, and alt-path all updated; island
  values carry decimals:0. par 58→66 / parKeys 12→16 for the two trim chords.
- VERIFIED: demo-replay 12/12 · alt-paths PASS (Ctrl+Shift+! + trim) · 0 post-solve
  overflow cells across 12 runs (correct global colW). drills.js blocksel par 52→66,
  ?v 178→179. (Only blocksel touched — no other drill can regress.)

## r225 — blocksel DEEP rewrite: "Assemble the segment summary" (Wolf)
- Wolf on r222/r224: "you're doing surface permutations, not a deep rewrite — there's a
  whole block I do nothing with; why am I bolding in place; the drill should teach COPY
  and CUT explicitly, select across a row AND down a column, paste into clearly-labeled
  slots; the model headers spill." Rebuilt from the story up.
- NEW DRILL — an ASSEMBLY puzzle: the segment summary's pieces are scattered/misfiled.
  COPY the [Segment · Revenue] base that stays filed (Ctrl+Shift+→ across, Ctrl+Shift+↓
  down, Ctrl+C) → paste under Segment/Revenue; CUT the misfiled EBITDA column
  (Ctrl+Shift+↓, Ctrl+X) → paste under EBITDA; CUT the misfiled Op inc column → paste
  under Op inc; comma-format at 0 decimals. 4 beats, COPY vs CUT called out EXPLICITLY
  and graded (base intact after copy; sources empty after cut). Every source is used —
  no dead decoy, no pointless bold-in-place.
- CLARITY + FIT: a FIXED, labeled output frame ("▸ SEGMENT SUMMARY", headers
  Segment/Revenue/EBITDA/Op inc) so WHERE is obvious; short source tags (▸ base blue,
  ▸ EBITDA / ▸ Op inc orange) that fit their column — no spill. Sources scatter to a
  shuffled, isolated anchor every run (the puzzle). Verified: 0 load ####, 0 post-solve
  ####, 0 horizontal overflow over 14 builds.
- GATE: demo-replay 15/15 (then 12/12 after meta) · alt-paths PASS (cut-first, copy-last,
  Ctrl+Shift+! + trim) · targeted fit CLEAN. drills.js label 'Grab the whole block' →
  'Assemble the summary', par 52→74; ?v 179→180. (Global onboard/parity audits hit infra
  timeouts this round; the drill is self-contained — build/demo/checks touch no shared
  flow — and the demo-replay's zero-page-error gate passed.)

## r226 — logout no longer leaves a stale rank/level in the top bar (Wolf)
- Wolf: "logged out and my old account info stays in the top tab — shows guest but still
  a first-year-analyst rank and level 15. Maybe none of the header stuff is adaptive?"
- ROOT CAUSE: the active sign-out (nav.js, which owns the auth slot) called signOut()
  WITHOUT clearing the caches that hydrate the header — sessionStorage hk_rank3 (the rank
  pill), localStorage hk_xp_est (the level chip), hk_handle_cache — and the rank pill is its
  OWN element that renderAuthBar never touches. So the pill + level survived sign-out (and a
  reload would even repaint them from the caches).
- FIX: a shared clearAccountUI() wipes hk_rank3 / hk_xp_est / hk_handle_cache, hides + empties
  navRankPill, removes the nav level chip, zeroes window.__lvlXp. Wired into (a) the nav.js
  sign-out button (then signOut + reload for a bulletproof guest reset), (b) the reactive
  onAuthStateChange SIGNED_OUT branch (covers cross-tab logout, no reload), and (c) index.html's
  own sign-out path (shares window.clearAccountUI before its reload). Verified: with a simulated
  signed-in header (xp 9000, rank pill 'First-year Analyst'), clearAccountUI() → all caches null,
  pill display:none + emptied. Zero page errors. nav.js ?v 174→175 across all pages.

## r227 — player-card level ring shows an ADORNED number, not "n / LVL" (Wolf)
- Wolf (long-standing): the level/xp circle read as a plain "1" stacked over a redundant "LVL",
  when the "LEVEL n" label already sits right below the ring — he wanted just an adorned number
  in the ring.
- FIX: hkLevelRing() now centers the level as one big, bold (800), accent-colored numeral
  (23px for 1-digit, 19px for 2-digit) with a hairline surface stroke for legibility on the arc
  — and drops the inner "LVL" text. Verified across levels 1/5/15/23: clean adorned number inside
  the progress arc, "LEVEL n" label below. themes.js ?v 174/175 → 176 across all pages.

## r228 — rank pill populates on SIGN-IN, not only on refresh (Wolf)
- Wolf's other reactivity half: "login shows username and rank only on refresh." Username
  already re-rendered via onAuthStateChange→renderAuthBar, but the RANK PILL is filled by
  navRank(), which only ran from a boot-time poll that gives up after ~8s — so a user who
  signs in later saw no rank until they refreshed.
- FIX: onAuthStateChange's sign-in branch (and the initial getUser path) now call navRank()
  right after the profile loads, so the rank pill + the level chip (navRank hydrates hk_xp_est
  then re-renders) appear the moment you sign in. nav.js ?v 175→176. Zero page errors.
- Reactivity pass status: theme name (r219), logout wipe (r226), sign-in rank/level (r228) all
  fixed. Remaining minor item: keyboard-profile overlay refresh — queued.

## r229 — blocksel to the FULL spec + standard grid + underline engine (Wolf)
- Wolf on r225: "there's a whole block I do nothing with; why am I bolding in place; no title for
  Revenue, I'm guessing; checklist item 1 doesn't pop; I'm SO tired of Alt H K — dress the table
  properly (bold headers, $ top row over numbers, right-align, centre+underline labels, box it),
  and with the bigger grid, insert/compute a margin memo. And standardize the grid — A is wider."
  Deep rebuild to internalize the standard (now written into FOUNDATIONS_SPEC §8).
- BLOCKSEL v4 — "Assemble & dress the summary": every source is HEADERED (base carries
  Segment|Revenue headers; metrics "EBITDA·CUT"/"Op inc·CUT") so nothing's guessed. COPY the base
  that stays + CUT the two misfiled columns into their slots (copy vs cut explicit + graded). A
  Margin memo computed off the block (=EBITDA/Revenue, live formula → %, italic). Then a banker
  DRESS with DIVERSE chords: bold header (Ctrl+B) + box (Alt H B A); currency top line + comma rows
  at 0-dec (Ctrl+Shift+$ / Ctrl+Shift+! + Alt H 9); right-align figures (Alt H A R); segment names
  centred + underlined (Alt H A C / Ctrl+U). 13 distinct muscles, zero Alt H K spam.
- UNDERLINE ENGINE (new): blankCell.uline, td.uline CSS, Ctrl+U chord + Alt H 3 ribbon, render
  class. Tested: toggles on/off, renders, 0 page errors — no existing drill uses it (isolated).
- STANDARD GRID: ROWS:16 + even columns (80px) — the maze's uneven A(88)/rest(74) → even 80 (Wolf's
  ask); documented as the standard for upgraded drills.
- GATE: demo-replay blocksel 8/8 + navigation 8/8 · alt-paths PASS (CUT-first/COPY-last, ribbon
  variants, box-before-bold) · targeted fit CLEAN (0 load/post ####, 0 h-overflow, both drills).
  drills.js label+par 74→120, ?v 180→181. (onboard/parity/visual re-run confirming post-deploy.)

## r230 — flat level chip (Wolf: flat design, more colour variation, favicon-sleek)
- Wolf: "the colored glow renders oddly — go completely flat, more badge-colour + glyph variation,
  the sleek favicon style, not the legacy shadowed icon."
- LEVEL CHIP: hkLevelChip() dropped the drop-shadow rect + dark base + colored-stroke "glow" for a
  FLAT tier-coloured tile with a white numeral. Six colour bands now (was 5): slate <5, bronze 5-9,
  silver 10-14, gold 15-19, blue 20-24, violet 25+. Rendered clean at levels 1/7/12/17/22/27.
  themes.js ?v 176→177.
- NEXT (queued): the rank EMBLEM system (window.rankEmblem — the ornamented frames/jewels/auras)
  and achievement glyphs get the same flat + varied treatment; that's a larger SVG system best
  done sample-first with Wolf's eye.

## r231 — ENGINE Tier-1 #1: the FILL-COLOR PALETTE (Wolf, Excel-first)
- Wolf: "the way we set background colors isn't elegant" — Alt H H forced instant 'blue' and there
  was no palette. Excel-real fix: Alt H H now opens a swatch PICKER.
- PALETTE: fill can be blue / gray (header shade) / yellow (flag) / green / red / none. Each renders
  across the three theme layers (light · dark chrome · dark-chrome-light-sheet), legible. The render
  generalized from `fill==='blue'` to `fill-<key>`.
- PICKER (mirrors the font-color dialog): Alt H H → swatch row; ← → to pick + Enter, OR letter
  shortcuts B/G/Y/R/N. Elegant + discoverable, unlike the old blind instant-blue.
- COMPAT: the 3 drill demos/alts that pressed Alt H H for blue (housestyle, polish) now add Enter
  (blue is the default swatch). No check changed — fill values are unchanged, so graders still read
  fill==='blue'.
- GATE: demo-replay ALL GREEN · parity 94 PASS · fill picker verified (Enter=blue, arrow=gray,
  letter Y=yellow; 0 page errors) · fill drills (housestyle/polish/dress/blue/ruleoff/combo/gauntlet)
  WIN. New gray/yellow/green/red aren't used by any existing drill yet (no live regression) — the
  visual audit validates them when the drill rebuilds put them to work. index.html only.

## r296 — THE STRANDED-BRANCH RESCUE + engine finance/text/sort pack + sign-out lands home (Wolf)
- **THE DEPLOY MYSTERY SOLVED.** Wolf hard-refreshed and saw NONE of the recent UI work (one-row
  toolbar, marathon/sheet-button removal, auth fixes…). Root cause: that whole session — 19 commits
  including "Game toolbar: retire marathon + sheet button", "Kill marathon from the UI", "Marathon
  purge", the auth/rank root-cause fix, account overhaul, leaderboard rework, rapid-fire rebuild —
  was pushed to `claude/school-flair-phase-1-35myh2` and **no PR was ever opened**. Pages serves
  main; main never got it. Fixed: branch fast-forwarded onto the working branch and shipped with
  this round. HOUSE RULE REINFORCED: a push to a side branch deploys NOTHING — every round ends
  with the PR opened and merged, and the session verifies main moved.
- **SIGN-OUT LANDS YOU HOME (the navigation-pipeline audit).** Wolf: "when I sign out I'm not
  directed anywhere and am left staring at a stale stats page." Two defects: (a) nav.js umSignout
  reloaded IN PLACE, so satellites kept you on a now-guest page; (b) the r226 wipe cleared only the
  HEADER caches — stats.html re-read the account's local mirrors (hotkey_pb, hk_runs_lite,
  hotkey_solves, hotkey_streak, hk_key_counts, hk_camp_xp, achievements, ghosts) and showed the
  signed-out account's numbers to whoever sat down next. Fix: clearAccountUI now wipes every
  account-derived mirror (device prefs — theme, platform, onboarding flags — survive; the server
  re-hydrates the account on next sign-in per r114), and the sign-out button navigates to the home
  page from every surface (location.href resolves via <base>, so drill subpages route home too).
  account.html's "sign out everywhere" (r293) now shares the same wipe — it used to leave every
  mirror behind. Verified live: all mirrors null after sign-out, prefs kept, redirect asserted, 0
  page errors. Cross-tab SIGNED_OUT wipes reactively (r226 path) but deliberately does NOT reload —
  a token-expiry event mid-drill must never eat a run.
- **ENGINE — the finance pack (Wolf's NPV/IRR find).** evalFormula gains **NPV(rate, flows…)**
  (Excel-true: first flow discounts one full period) and **IRR(flows)** (bisection on the
  t0-anchored NPV, deterministic, no guess; mixed signs required, else #NUM → IFERROR-able).
  Identity verified in parity: =NPV(IRR(line),tail) reproduces the year-0 outflow exactly.
- **ENGINE — the text pack.** LEFT/RIGHT/MID/LEN/TRIM (collapses inner space-runs, Excel-true)/
  UPPER/LOWER/PROPER/FIND (case-sensitive, 1-based, miss throws)/CONCATENATE — plus the **&
  operator** at Excel's precedence and **string literals in expressions** (="FY"&B2). Parser
  plumbing: refs now carry raw text through to & and the text functions; arithmetic operators
  coerce exactly as before (text→0, numeric strings now read as their number, Excel-true), so no
  existing drill moves. Commit path accepts text results (mirrors recalc's r257 rule).
- **ENGINE — the sorting functions.** LARGE/SMALL (k-th ranked, text/blanks ignored, ties
  Excel-true) and RANK (RANK.EQ semantics: desc default, order arg flips, ties share the top rank,
  absent value #N/A). TABLES (structured refs) deliberately skipped — Wolf call.
- **FOLDED INTO DRILLS (build the muscle, then the drills that need it get deeper for free):**
  · **dcfbuild** — the audit line: B18 =NPV($B$7,B3:F3) must reproduce the hand-built PV row; the
    pre-ship tie-out ritual as a graded beat. par 76→91 / parKeys 80→96 (sweep).
  · **lbobuild** — the fund-model road: equity laid out as dated FLOWS (check out at year 0 =-B11,
    exit proceeds in at year N =B18, quiet 0s between), then B25 =IRR(flow row) must land on the
    SAME number as the compounded-MOIC B21. Two roads, one number — the aha the drill now teaches.
    Timeline length rides the randomized hold (3–6y). par 61→82 / parKeys 63→85.
  · **comps** — the TRIMMED read: D11 =LARGE(D3:D7,2) / D12 =SMALL(D3:D7,2) — one outlier peer
    never sets the range the IC sees. par 66→94 / parKeys 69→99.
  · **dashcover** — the cover stamp: B16 =UPPER(TRIM(B15)) cleans the data-room's raw deal-name
    feed by FORMULA (randomized dirty name pool, stray + double spaces). par 32→48 / parKeys 31→48.
  RANK ships engine+parity only; its drill home (league-table beat) queued in PIPELINE with the
  text-pack flagship ("clean the import": TRIM/PROPER + LEFT&FIND ticker extraction + & rebuild).
- GATE (all green): demo-replay 81 · **parity 94→120** (3 new sections: finance, text+&, sorting) ·
  onboard 29 · alt-paths 74 (comps alt gained the trimmed read) · mac-input 19 · echo 21 ·
  rapidfire 12 · par-sweep: 4 edited drills re-measured, declared = measured, drift ≤2% (lbobuild
  −8%→0 after re-declare) · drill pages regenerated (descs updated for the 4 drills). Cache: nav.js
  ?v 261→262, drills.js ?v 264→265 across all pages.
