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
