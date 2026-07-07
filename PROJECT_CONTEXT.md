# hotkey.gg — PROJECT_CONTEXT (handover / source of truth)
_Verified 2026-07-06 against the live repo (github.com/rathunter69/Hotkey.gg @ main).
Upload this file to the Claude project after review._

## What this is
Excel keystroke speedrun trainer ("Monkeytype/Duolingo for Excel") for IB analysts,
finance pros, MBAs. Long-term: B2B pre-onboarding tool for banks. Wolf (non-technical
IB associate, restructuring) is founder; Claude is sole developer.

## Status constraints (until internship ends)
- Stripe TEST MODE only. No live payments. No entity formation. No OBA-flag risk.

## Stack & deploy
- Static HTML/JS, no framework/build step. Supabase backend (anon auth + invite gate).
- Project ref: vshtftzrlepedydmkcnm · URL: https://vshtftzrlepedydmkcnm.supabase.co
- Anon key (publishable, client-safe): sb_publishable_yKhIRqtk7w98jUCJYjFWAQ_CMnQ4-yT
- Invite code: HAGS (unlimited). BETA_MODE=true.
- **Git workflow (NEW):** repo github.com/rathunter69/Hotkey.gg (public), GitHub Pages
  via CNAME → www.hotkey.gg. Claude clones per session (no persistent access); Wolf
  pastes a fine-grained token (Contents: R/W, this repo only) when Claude should push.
  Push to main = deploy. Tokens never stored in repo or this file.
- **Coupled deploy set:** index.html (4,835 lines), drills.js, themes.js, nav.js,
  nav.css, leaderboard.html, reference.html, About.html, privacy/terms/security.html,
  favicon.svg. supabase/functions/ are NOT in the repo (deployed separately via
  Supabase dashboard/CLI).
- Never put secret/service-role/Stripe secret keys in client code.

## Architecture notes
- drills.js = canonical drill catalog (groups, names, labels, tabs, desc, difficulty).
  Trainer auto-injects name/label into CHALLENGES at runtime; leaderboard + profile
  modal + MENU_ORDER all derive from it. Console warnings on drills.js/CHALLENGES
  mismatches; sync is non-destructive.
- index.html CHALLENGES[key] = { par, parKeys, prompt, req, guide, targets,
  build(), demo(), checks(S) }. Engine grades END-STATE only.
- Engine internals used by drills: Kb, blankCell, colLetter, rnd, shiftCellsRows,
  shiftCellsCols, selRange, pushUndo/commitAction. Grid A–J × 14+, col width 12.
- Adding a drill = edit drills.js (metadata) + index.html (engine logic).
- Shared nav (nav.js/nav.css): themes picker, shortcuts modal, user menu, profile
  modal, account settings — on all three pages. Keyboard-profile toggle
  (native/macabacus/factset; plugin profiles Pro-gated). No Mac mode (ruled out).
- Rapid-fire + marathon modes: BUILT and in the repo (mode pills + duration popover,
  marathon HUD, single-cell rapid stage).
- Ranking: banking-ladder tier names (Candidate → Summer Analyst → Incoming Analyst
  → First-Year Analyst → Top-Bucket Analyst → Second-Year Analyst), avgPct percentile
  + compounding attempt thresholds, 5-attempt floor. tierOf duplicated in index.html
  AND nav.js — change both. Leaderboard session boards: marathon 3/5/10 min, rapid
  30/60/90s (must match trainer duration configs).
- Keyboard profiles: HUD toggle native/macabacus/factset (KV hotkey_profile).
  Verified chords only — Macabacus Ctrl+Shift+R/L smart fills + Ctrl+Alt+A/S
  AutoColor; FactSet Ctrl+Alt+Shift+K/J/D/U FDS fills. Native always works.
- Returning-user flow: last drill persisted (hotkey_last_drill) and resumed on
  revisit; welcome-back strip (once/session, passive dismiss on first keydown).
- Payments: NOT in deployed code (see repo-lag question above).
- Anon score gating across recordRun, recordSession, results UI.

## Drill inventory — 21 drills (18 + growth/revolver/cagr added 2026-07-06)
Foundations: navigation, copyover · Formatting: polish, combo, format, center, blue,
gauntlet · Values: drill (paste-special values), series (fill series) · Data: sort ·
Formulas: margin, growth (YoY), bridge (profit row fill), foot, percent,
revolver (MAX cash sweep), cagr (^ power), schedule (PP&E roll), comps ·
Lookups: lookup (INDEX/MATCH).
Engine supports: font color, alignment, sort, fill series, wrap, autofit, borders,
fill shade. Evaluator: + - * / ^ (left-assoc), SUM/AVERAGE/MIN/MAX/ABS/ROUND/
INDEX/MATCH. Cell shape: {value, formula, txt, bold, fill, fontColor, align, wrap,
bb, bt, fmtStyle, decimals}. checks(S) → [{label,ok}]; navigation checks stateful.
Game modes audited clean: marathon 3/5/10min, rapid-fire 46-op pool 30/60/90s,
guided mode. Beefed drills (round 4): navigation 12-chord tour (par 30/12),
center=alignment triple (38/26), series fill+dress (25/13), sort+foot+bold (33/21).
Leaderboard: medals, chase gaps, your-standing strip (crowns/podiums/top10s). Next drill gaps: SUMIF (needs evaluator fn),
F2-audit drill, paste-special transpose/formats as full drills.

## Repo-lag question: RESOLVED (2026-07-06)
Wolf's local legacy copy diffed byte-identical to the repo — the repo IS canonical.
Stripe/Pro, keyboard-profile toggle, and banking-ladder tiers were never saved from
past chat sessions; they're roadmap rebuilds if still wanted. Theme note: new
visitors default to Daylight via themes.js fallback (THEMES.default itself is dark).

## Shipped 2026-07-06 (round 6)
Engine parity: Shift+Enter/Tab + non-edit Enter/Tab movement; string literals in
evaluator; SUMIF fn. Checklist: always-on next-task highlight + progress bar.
Daily Challenge (seeded UTC, challenge='daily-YYYY-MM-DD', leaderboard board).
Streaks (KV hotkey_streak, HUD 🔥). Drills: 23 (added sumif, lookup2).
Approved queue: stats page → placement test → share cards → team codes.
Weekly gauntlet shelled in dev/AUDIT.md.

## Curriculum v2 (current focus)
- CURRICULUM.md: 28 new drills across 5 tracks, tiered T1/T2/T3 (batch plan inside).
  Dedupe vs live catalog done in AUDIT.md §5 — 8 generator names collide with live
  drills but differ in semantics; adapt-or-rename decided per drill at migration.
- **drillgen.js v2:** randomization + computed-par engine, 17 generators.
  - Seeded RNG (mulberry32) → same seed = same drill (daily challenge/ghost-ready).
  - Randomizes values, labels (company/segment pools), AND layout (anchor jitter,
    series length) within A–J×14.
  - Generator emits canonical optimal solution as token list; parKeys = counted
    tokens; par(sec) = keys×1.2+8; optimized ≈ keys/3; slow ceiling ≈ keys×2+20.
    Healthy parKeys band: 10–50 → fits the 10s–120s product window.
  - Declarative checks (value/text/formula/isFormula/isValue/fmt/bold/blue/empty)
    + runChecks() with ENGINE_ADAPTER (5 accessor fns → index.html internals at
    integration; getBlue is Group B forward-compat).
  - Token convention: non-modifier press = 1, chords = 1, TYPE:str = len,
    ALT:ESV = 1+letters. Matches historic hand counts (mini-bridge 14 keys).
  - **Generators (17):** hardcode, growth, margin, percent, foot, lookup,
    pastevalues, transpose, sort⚠, comps, schedule, bridge, autosum, filldown,
    anchor, cagr, sumif. (⚠ sort assumes an Alt A S D sort action exists in the
    live engine — verify; end-state value checks work regardless of mechanism.)
  - Fmt keys used in checks: 'comma' / 'pct1' only — map to engine fmt keys at
    integration. Multiples (×.0x) intentionally unchecked pending engine key.
  - Self-test harness (drillgen.test.js): 200-seed sweep per generator asserts
    determinism, grid/check bounds, timing band, answer-not-prefilled, and
    simulateSolve (perfect solve passes grading). ALL PASS as of 2026-07-06.
  - Solution token list doubles as guided-mode script.
- Migration plan (exact mapping in AUDIT.md §5): wire ENGINE_ADAPTER
  (getValue→.value, getFormula→.formula, getBlue→fontColor==='blue',
  fmt 'comma'→{comma,0} / 'pct1'→{percent,1}); swap rnd for seeded RNG per run;
  wrap runChecks output as [{label,ok}]. Port order: sort first (fixes the hardcode
  trap), then formula drills, then formatting drills; navigation stays bespoke.
- Push workflow live. Shipped 2026-07-06: schedule par 50→65; sort drill fully
  randomized (names/values/start order, checks computed per-run — hardcode trap
  removed); About.html dead app.html CTAs → index.html (was a 404 on the landing
  page's Train buttons). dev/ folder in repo holds drillgen.js + tests + docs;
  nothing on the site loads dev/ yet — engine integration is next.

## Ruled out / deferred
Mac mode (permanent). Ctrl+PgUp/PgDn drills (browser-tab limitation). Conditional
formatting, freeze panes (pipeline). Campaign+Model drills (deferred). (Group B engine work: RESOLVED — engine already supports font color, alignment, sort.)
Number-select limited to 1–9.

## Working agreements
Ship-first, batch outputs, minimal questions, honest pushback, node --check before
shipping, deliverables via present_files, concise replies, remind which files to
redeploy. Bugs reported post-hoc. This file wins over memory summaries — keep it
updated and uploaded to project knowledge.
