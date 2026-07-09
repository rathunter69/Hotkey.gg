# hotkey.gg — PROJECT_CONTEXT (handover / source of truth)
_Verified 2026-07-07 against the live repo (github.com/rathunter69/Hotkey.gg @ main).
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
  favicon.svg. supabase/ IS in the repo: migrations/ deploy
  automatically on push via the Supabase GitHub integration (VERIFIED working —
  never paste SQL in the dashboard again). stats.html AND account.html are part of the deploy set. Shared asset version: v41. r40 features REPLAYED after silent-failure incident (see AUDIT — RULE: surgery blocks end with success echo + per-feature grep verify). '+' seeds '=+'. Guide footer lists engine-live chord alternates. Player card: top-5 shortcut chips + rule-based coach's notes from trace scans. Type-to-replace implemented (printable char starts Enter-mode edit; app hotkeys keep priority). #taskLine bar renders C.req above drillbar (13px, family dot, accent <em>). Target soft-highlight always on (td.ttarget dashed = next failing check's range; guided keeps strong ring). Eight-bug batch: gridwrap zoom rules DELETED (the real 140%); F4 cycles typed refs via caret-regex fallback; pointer ranges = editPointerBase (shift+arrow extends, plain re-points); caret always visible (.edcaret accent blink); td:hover neutralized; openAuth opens pre-sb; paste dialog docked bottom-right; results card has next-drill button. parKeys recalibrated via demo-replay audit (27 drills; policy min(current,computed); chords=1 keystroke; navigation+foot kept — demo tours overcount vs ctrl-jumps). RULE: recompute parKeys whenever a demo() changes. 43 drills; Full Builds = 6 (isbuild, bsbuild, cfslink, nwcsched, debtsched, threestmt capstone w/ 3 ref-checked links + zero-tie checks); wacc/lbo/schedule at flagship coverage (pars 78/98/98). Campaign v8 gates all six. IDEA QUEUE: sources&uses, accretion/dilution, DCF sensitivity row, returns bridge, football field, 13-week cash flow (RX flavor). Alt+= = Excel-parity propose+pointer (adaptive above/left, shift+arrows re-point, Enter commits; parens auto-close in commitEdit). Grid density: COLS=10 (A..J), ROWS_MAX=14, 12px cells (#grid overrides). Beacon v2 appends async stack line. QUEUE: balance-sheet/working-capital/3-statement full builds; deepen wacc/lbo/schedule; exploit wider grid for 4-5yr models. BOOT ERROR RESOLVED: wire-before-create on soundToggle/profileToggle (live since v31 — was the v32 'elements gone' mystery); listeners now live inside the creation block. RULE: wire-with-render, never wire listeners before their element exists. Boot smoke harness is NULL-STRICT now (getElementById null for unknown ids). Beacon also catches unhandledrejection. 40 drills. NEW GROUP 'Full Builds' (isbuild/cfslink/debtsched — WSP-style corkscrews, ref-checked links, pars 115-140); campaign v8. dcf=TV+EV (par 100), comps=full chain (par 62). Stale dup revolver excised. SURGERY RULE: drill edits via ^-anchored span maps + label-signature + key-list asserts + atomic write (see AUDIT r34 incident). wacc/lbo/schedule deepening queued. LADDER v4 (8 tiers, desk-culture): MBA Associate floor → Candidate → Summer → First-Year → Associate → VP → MD (crimson) → Second-Year Analyst (summit); ALL tier math delegates to HK_RANK (themes.js) — no local tier tables allowed (three stale ones excised). Leaderboard userStat = one pipeline (entries/ratingOf/wsum; .sum is dead). rosterHtml rendered in renderAll. Boot beacon on index paints runtime errors on-screen. nav auth slot retries for window.sb + navRefreshAuth() kick. Rank cache key = hk_rank3. CHROME RULE: nav.css owns page chrome (scrollbar-gutter stable, body padding-top 14, .wrap 1180, flat var(--bg) — NO per-page gradients/widths/body layouts). Index is TOP-ALIGNED (vertical-centering removed — that was the menu-jump root cause). Family dots on stats rows + leaderboard chips (CH has .group). Backdrop click-away = nav.js delegation (NEVER {once:true} on overlay closers). Demo beats: select 520ms / key 330ms / typing 110ms. Sound+profile = nav tool icons beside ? (index injects post-mount; HUD ⚙ gone). Stats: shortcut-chord heatmap + Lifetime tiles. DESIGN LANGUAGE: colored family dot for top-level, en-dash for sub-items (banker notes) — apply to all future lists. Revolver = true cash sweep (value-graded; headless-verified). GRADER RULE: no function-name checks unless the function is the skill. nav.js now loads in BODY right after #navMount (no defer) and mounts instantly — keep that placement on any new page. Tooltips = data-tip CSS (instant). Campaign = 'the build', chapters are versions v1–v7. Achievements = 23. Featured boards min-height 290. PLUGIN LAYERS LIVE: HOTKEY_PLUGIN_LAYERS (drills.js, 24 Macabacus + 14 FactSet researched entries) rendered on reference.html in per-plugin accents w/ ●=engine-live; engine adds Ctrl+Shift+$/%/~ (native), Macabacus Ctrl+Shift+D + CAS+1/4/5, FactSet Ctrl+Alt+E. Achievements v2: 34px medals, hover = Steam-style global rarity (computed from all users' runs). Group colors = dots not strips. Landing has a Log in button. Beta tools on account.html: ranked-gate test unlock (hk_dev_unlock) — REMOVE AT LAUNCH. 37 drills (Foundations=11: +autofit/rowops/filldr/blocksel). Landing contains the beta gate (REQUIRE_INVITE flag; INVITE_AUTO_CODE fallback). Nav = Monkeytype left-cluster (index inline topnav CSS deleted — nav.css is sole authority). favicon.ico+png+svg all ?v'd (Safari can't do svg favicons). Provisional rank: tierOf(avg,att,wsum) caps at Incoming until wsum≥6. NEXT TURN RESERVED: full Macabacus/FactSet layer buildout. RANK = rating v2: shrunk (K=6 prior 0.5) size-weighted (log2 cap 8+) placement; tier pcts recalibrated to shrunk scale (.53/.375/.26/.18) — see AUDIT r27 before touching. Tier roster panel on leaderboard. HOTKEY_GROUP_COLORS per family (accents only; hkBadge(color) param). Handle blocklist expanded server-side w/ leetspeak folding (migration 20260707400000). Favicon links carry ?v. nav.js keydown is trainer-aware ('?' off, Esc closes-overlay-only w/ stopImmediatePropagation; game pauses via window.navOverlayOpen). Anon signup LINKS via auth.updateUser (same uid — guest runs kept); profiles handle saves are UPSERTS. Modal-x delegation lives in nav.js (all pages, flag-synced); themes/kbd/settings modals have x. Toolbar = quiet Monkeytype-style buttons; header gap 30px. Drills: 33 (Foundations grew to 7: navigation, ribbon, editfix, undo, pastes, saves, copyover; campaign Ch1 matches; PARS regenerated). Ctrl+S is CONTEXT-AWARE (usesSave drills save via S.saveN; else restart). Modal × closes via capture-phase delegation (.modal-x/.pc-x). Emblems/badges are FLAT (no drop-shadows/pulse — Monkeytype discipline). Favicon = original cell-selection mark. MAJOR: index.html uses the SHARED nav (navMount/nav.js) — its inline nav, auth slot renderer, modals, and HUD rank pill are gone; nav.js owns all nav-layer UI on every page. Theme fallback unified to 'default' (dark) in themes.js + index. ONE drill bar (legacy header bar, now with +xp chip). Flair: profiles.flair + account selector + card borders. Analytics section on stats (PRO-tagged). create-checkout Edge Function scaffold (TEST-only, refuses live keys) + STRIPE_SETUP.md; startCheckout falls back to modal until deployed. Achievements: HOTKEY_ACHIEVEMENTS (15) in drills.js, medals+progress on card. XP UI: LVL chip has bar; picker/drill-bar show next-solve earn. Plugin profiles behind requirePro (beta passes). AWAITING: Wolf's original Macabacus/FactSet hotkey list for the full premium layers. Ranked gate: LVL 10 OR campaign complete, with wait/leave options. Emblems = keycap ladder (per-tier palettes, bucket pips; rankEmblem(name,size,bucket)). Handle rules server-enforced (unique/format/7-day cooldown, migration 20260707200000). Modal × standard: .modal-x, wire on render. Nav centering is ABSOLUTE on desktop (both nav.css + index inline — sync). Badges = window.hkBadge hex medals (themes.js + index inline — sync). Player card has an explainer legend toggle. XP v3: sessions earn XP (+20 marathon/+10 rapid), advanced first-clear bonus (+15 if par≥55); results card shows +xp; explainer via LVL chip. Drill bar above grid. Sound+profile in ⚙ popover. HOTKEY_PARS in drills.js (regen on par changes). Campaign mode live (HOTKEY_CAMPAIGN in drills.js, PB-derived progress, badges on player card — nav.js exact gating needs a HOTKEY_PARS snapshot, see AUDIT r19). Ranked opt-in at LVL 3 (localStorage hk_ranked). Sound cycles classic/arcade/thock/off. Favicon = F4 keycap. Drills: 28 in 7 groups (Models group added r18: wacc/dcf/lbo/schedule/comps). Tiers now have Top/Middle/Bottom BUCKET subtiers (HK_RANK.tierOf returns .bucket/.full).
- Never put secret/service-role/Stripe secret keys in client code.

## Structural pipeline (assessed 2026-07-07, priority order)
S1 DONE account.html + stats refinement (r17) · S2 ghost cursor on the grid (traces
ready) · S3 campaign mode — ordered curriculum path w/ unlocks (the Duolingo half;
biggest structural lift, biggest retention) · S4 drillgen engine integration ·
S5 onboarding funnel v2 (signup→placement→first PB→share card prompt) · S6 PWA
install (app feel + unlocks Ctrl+PgUp/PgDn) · S7 server streaks + re-engagement
email (needs Edge Function) · S8 usage-analytics admin view (the B2B evidence
story) · S9 team spaces v2 (invite links, team pages) · S10 rank-math consolidation DONE r18 (HK_RANK canonical; index inline copy — sync 2).

## Conventions (bugs earned these)
- **CACHE-BUSTING (round 16):** every shared-asset reference uses ?v=N
  (nav.js, nav.css, themes.js, drills.js across all pages). BUMP N on any shared-file
  change or GitHub Pages serves stale JS — this caused the "missing stats icon" and
  earlier "invisible rank pill" reports.
- Emoji in python edits: \U escapes + io.open utf-8 (surrogate write once zeroed index.html).
- Duplicated-code sync sets: tier/level math (index+nav.js+leaderboard TIERS) ·
  applyTheme/data-dark (themes.js+index inline) · rankEmblem (themes.js+index inline) ·
  XP v2 formula (nav.js+leaderboard).

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
Round 7: parity sweep (Delete-range/Backspace-edit/F2/Ctrl+A), rank pill on all
pages (hk_rank sessionStorage cache; tierOf duplicated index↔nav.js — sync both),
stats.html (in shared nav), supabase/ folder + GitHub Action deploy (needs repo
secret SUPABASE_ACCESS_TOKEN — see supabase/README.md; migrations idempotent).
Deploy set += stats.html, supabase/, .github/. Round 8: placement onboarding (nav-tour + pace verdict; tour demoted), share cards
(canvas PNG from results), team codes (profiles.team_code migration + settings UI +
leaderboard team-only toggle), index nav icons + stats link, rank pill always-on.
Round 9: PB pace ghost (live vs-pb delta at the clock; traces now timestamped
{k,t} — true ghost replays unlocked for future data), weekly gauntlet (🏁 button,
5 seeded legs, combined-time board, keys 'wk-YYYY-WW-<drill>'), RF plugin-chord
aliases (verified only), audit drill (24 total). Supabase deploys confirmed
working via GitHub integration (team_code applied). Round 10: XP+level system (formula in dev/AUDIT.md r10), player card v2 (LVL bar
+ stat tiles in nav.js), HUD LVL chip (local, anon-friendly, KV hotkey_solves),
balance drill (25 total). Round 12 (Monkeytype pass): sheet zoom-scales on wide screens (.gridwrap zoom),
app 1280px, theme-aware cell colors via html[data-dark] (applyTheme duplicated in
themes.js AND index inline — sync both), selection/marquee on accent-glow, index
nav icon-only desktop, guides teach Ctrl+Shift-edge selection. Round 13: leaderboard = dashboard (your card + NEXT RANK requirements, top-players
overall ranking, featured daily/weekly, tab+chip drill browser; tier math now in 3
files — sync index/nav.js/leaderboard). Pro scaffold: entitlements table (RLS),
isPro()/requirePro() gate, PRO badge, upgrade modal, inert startCheckout(); BETA_MODE
unlocks all. Round 14 (freedom/rigidity doctrine — see dev/AUDIT.md r14 for the 5 principles):
input completeness (numpad + inserts; Alt H I R/H D R/H I C/H D C; Ctrl+Alt+V paste
special), navigation latches action-sourced via S.lastRowOp (undo can't fake steps;
undo/redo clear it), Esc unswallowed → cancels copy ants else restarts drill
(restartDrill preserves daily/weekly), checklist prints the esc affordance. ALL new
drills must satisfy the 5 principles. Round 15: F2 EDIT MODE (caret editing — arrows move caret not commit; F2 toggles
Edit/Enter; editMode/editCaret vars), Monkeytype loop (Ctrl+S restart + toast, F11
swallowed, results ↵=retry N=next via resultsChainKeys), rank emblems
(window.rankEmblem in themes.js + inline index copy — sync), XP v2 anti-grind
(50/15/3 decay per drill + 30 daily + 25 weekly; in nav.js AND leaderboard — sync),
leaderboard fit polish, revolver drill (26). DCF/LBO drill pack queued: debt
schedule roll, WACC, working capital, exit bridge. Queue: true ghost replays,
drillgen engine integration, transpose drill, streak server-sync, campaign mode,
gauntlet one-attempt lock.
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
