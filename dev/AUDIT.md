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
