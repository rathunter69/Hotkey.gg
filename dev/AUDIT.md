# hotkey.gg — Live Code Audit (2026-07-06, from repo @ main)

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
