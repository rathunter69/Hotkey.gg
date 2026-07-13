# hotkey.gg — PROJECT_CONTEXT (handover / source of truth)
_Refreshed 2026-07-12 against the live repo (github.com/rathunter69/Hotkey.gg @ main).
New sessions: the repo IS the handover — read this file, dev/AUDIT.md (newest round
at the bottom), and the dev/ design docs. No manual doc upload needed when the
session has the GitHub integration (repo clones automatically)._

## ✅ r131-r132 RESOLVED — BACKEND DEPLOYED + LIVE-VERIFIED (65/65 smoke)
r131 found the supabase-deploy Action had failed on EVERY run since
2026-07-07 (missing repo secrets) — no migration ≥ 20260707000000 was live.
Wolf added SUPABASE_ACCESS_TOKEN + SUPABASE_DB_PASSWORD; the backlog deployed;
the r132 smoke found+fixed 3 real bugs (profile-upsert 403 grant gap ·
hollow desk rate limit · claim-vs-domain-join deadlock) and re-verified
65/65 (dev/SMOKE_REPORT.md). Seed codes SAFE TO DISTRIBUTE. HOUSE FACT:
`supabase db push` is STATEFUL — applied migrations never re-run; restore
consumed seeds/fixtures by re-shipping the insert under a NEW timestamp
(smoke-u fixture pattern, migration 20260713000000). Credentials rotated +
verified green (r134). r134: onboarding de-beta'd (PRELAUNCH_LOCK = launch
switch) · index's r13-era player card deleted (nav.js window.openProfile is
THE card, now with the .pc-scroll inner-scroll it always claimed) · tour
owns the keyboard · checklist autoscroll · favicon rebuilt (the .ico was a
429-byte placeholder). Cache v119.
.edu gate DECIDED r133 (incentive, not wall): gate-removal migration
20260713100000 + signup-card carrot copy (auto-match school desk, student
perks later). Branch auto-merge live per working agreement.

## SESSION HANDOVER SNAPSHOT (2026-07-13, rounds r131-r145 — the marathon session)
- **Backend LIVE + smoke-verified** (r131-r132, see note above). **Onboarding is
  launch-final** behind PRELAUNCH_LOCK (r134) — flip ONE flag to launch
  (runbook: dev/LAUNCH.md). Staffer (nee captain) Desk Hall dashboard w/ ROI
  band + quest ticks (r136/138). Achievements live on stats w/ showcase picks
  (profiles.featured_ach) + rarity metals (r135/138). EVENTS FUNNEL live
  (r139, insert-only, service-role reads). Morning Sheet daily + streak
  freezes (r140). PLUGIN LAYER truly engine-wide (r143 — the dead Ctrl+Alt
  chord bug: a blanket alt-swallow killed every Ctrl+Alt chord in classic
  play since it shipped; fixed w/ AltGr guard; RF aliases + profile-aware
  guide notes).
- **DRILLS: 59** (+4 this session): cascade (full 3-tranche waterfall, r141) ·
  housestyle (raw P&L -> desk standard; randomized input set + buried
  hardcode, r142) · modeltour (ctrl-jump find-and-fix, r144) · wk13 (13-week
  cash flow, RX flagship, r145). All house-bar verified (40-seed sweeps +
  demo-replay e2e + full-catalog regression gating every merge).
- **PROOF & GROWTH SHIPPED (r148, STRATEGY item 4)**: challenge links
  (?race=drill&t=secs&by=name — URL-only race ghosts, copy-link button on every
  clean solve) · shareable rank card (1200×627 PNG off the player card) ·
  placement verdict percentile + share card · PRO placeholder (card-themes
  teaser → openUpgrade; ?openUpgrade=1 deep link from satellites). Ghost diff
  shipped r146; VDR deal-room picker r147.
- **B2B ROUND SHIPPED (r149, STRATEGY item 5)**: cohort report export (print/
  PDF #deskPrint + 1200×627 summary-card PNG off the desk hall, zero backend)
  + staffer program templates (Intern week 0 / First-year bootcamp / Speed
  weeks — 4-week quest sequences pinned one click a week through the existing
  assignment RPCs; progress local per desk).
- **NEXT (STRATEGY.md sequence)**: audit family + RX pack content round
  (balance sweep, stale-link hunt, sign-error triage; liquidity bridge /
  covenant table ideas) · then seasons design doc (doc only — build gated on
  DAU). Pilot playbook (STRATEGY lens 4.2) is now unblocked: events + report
  + programs all exist.
- **Working agreement (r-standing)**: AUTO-MERGE to main once a round's
  verification gate is green (Wolf 2026-07-13). Merge = deploy.
- Cache v129. Test accounts + cleanup list: dev/SMOKE_REPORT.md.

## PREVIOUS SNAPSHOT (2026-07-12, rounds r100-r130)
- **Where we are**: content deepening arc DONE (T2-T6, Mix Rule) · demo-replay e2e
  DONE (dev/e2e-demo-replay.js, all drills green) · Desks v1 + surfaces + protected
  names + seeds/claim-the-desk + school tags v1.5 DONE · XP v4 daily-reset DONE ·
  rank consistency DONE · legacy-artifact audits DONE · RANK EMBLEMS v3 (Wolf-
  approved iteration-8 LoL-grade set: iron #REF! floor, book, sun, F4, briefcase,
  chart, bull MD, rocket summit; bucket escalation + division pips) WIRED into
  themes.js rankEmblem + staged RANK-UP reveal (nav.css .hk-cel-rank) ·
  CAPTAIN ASSIGNMENTS (Desks V2) SHIPPED r130. Cache v117.
- **Live smoke test: DONE r132 (65/65 — see note at top)**: backend deployed
  and verified; harness at dev/smoke-live.mjs (SMOKE_TS reuse; re-stamp the
  smoke-u fixture migration before the next full run). Seed codes (migration
  20260712400000) are cleared for distribution.
- **Agreed next pipeline items (r137 STRATEGY.md is the roadmap of record for
  sequencing)**: 1 events/funnel table · 2 Morning Sheet daily + streak
  insurance · 3 ghost-diff results insight · 4 proof & growth round (rank card
  + challenge links + placement share + PRO placeholder, Stripe TEST MODE) ·
  5 cohort report export + captain program templates · 6 audit family + RX
  pack · seasons = design doc only. Parked: referrals, marathon rethink, PWA,
  comments engine, T&S launch items, achievement art pass (ART_SPEC d3).
- **Art**: art/rank-proto.html is the emblem design lab (iteration 8). The GAME
  renderer is themes.js rankEmblem (ported copy — if Wolf asks for art tweaks,
  iterate in the proto, get approval, then port to themes.js + cache-bump).
- **Environment note**: network egress policy is stamped at session start. If
  supabase.co is unreachable (403 CONNECT), verification is offline-only (node
  --check, extracted-script checks, Playwright boot + e2e on localhost) — say so
  in AUDIT entries and queue live checks for a fresh session.

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
- ACCESS (r134): PRELAUNCH_LOCK=true in index.html is THE LAUNCH SWITCH — a
  device-once access-code curtain (code HAGS, localStorage hk_beta_ok) before
  the landing. Behind it, onboarding is LAUNCH-FINAL: Enter -> play instantly
  as guest (silent anon session; membership auto-redeems via rpc HAGS);
  tour (input-blocked) -> tutorial prompt -> placement; accounts optional
  (sign-in / save-your-progress). The old in-landing beta gate is DELETED.
  Launch = flip PRELAUNCH_LOCK to false. BETA_MODE now ONLY unlocks PRO.
  Signup open to all emails (r133; .edu = incentive: school-desk auto-match +
  future student perks).
- **Git workflow (NEW):** repo github.com/rathunter69/Hotkey.gg (public), GitHub Pages
  via CNAME → www.hotkey.gg. Claude clones per session (no persistent access); Wolf
  pastes a fine-grained token (Contents: R/W, this repo only) when Claude should push.
  Push to main = deploy. Tokens never stored in repo or this file.
- **Coupled deploy set:** index.html (4,835 lines), drills.js, themes.js, nav.js,
  nav.css, leaderboard.html, reference.html, About.html, privacy/terms/security.html,
  favicon.svg. supabase/ IS in the repo: migrations/ deploy
  on push to main via GitHub Actions (secrets set + pipeline VERIFIED GREEN
  r132; `db push` is stateful — applied migrations never re-run). stats.html AND account.html are part of the deploy set. Shared asset version: v81. Brand [BETA] chip. WEEKLY RETIRED (button+board; engine dormant). Leaderboard names: analyst-#### fallback. Account: Security (pw reset, sign out) + Appearance (theme buttons); handle save repaints nav. RULE: no surrogate-pair escapes in heredoc anchors — regex for emoji lines. r130 (v117): CAPTAIN ASSIGNMENTS (Desks V2) — team_assignments migration (cap-3 trigger, 1-week expiry, captain-RPC-only writes set/clear_assignment), completion derives from runs; captain pin UI on account desk card, picker marks + toast on index, X/N-done strip on ?desk= boards. r129 (v116): RANK-UP MOMENT — staged reveal over emblem layers (.hk-cel-rank in nav.css; frame→glyph→ornament→jewel→pips→sparks→aura), tier confetti via RANK_COLORS (themes.js). r128 (v115): RANK EMBLEMS v3 WIRED — themes.js rankEmblem = iteration-8 art (API unchanged; bucket string → pips+escalation; glow off <24px; 'Unranked' = empty-cell X plate; old keycap renderer deleted). r123-r127: emblem art iterations 4-8 in art/rank-proto.html (Wolf feedback loop: bull MD, briefcase Associate, rocket summit, sun Summer, engraved-iron unranked/MBA split, bucket escalation clean/ornamented/ignited, division pips, Challenger-gold summit, VP aura). r122: SCHOOL TAGS v1.5 LIVE (server-derived .edu tags, opt-in chips on boards/cards, home-desk one-tap membership; code=captaincy, domain=membership). r120 (v114): LEGACY AUDIT — repeatable fossil sweep; stale emblem/badge fallback copies (~6.5KB) excised; fallbacks may never carry implementations. r119: SEEDS+CONTROLS — 8 school desks seeded ownerless w/ claim-the-desk captaincy, verified badge, reports table, 1/day rate limit, invite rotation. r118: DESK PROTECTED NAMES live (firm names + acronym tokens reserved at trigger); TRUST_SAFETY.md launch pass + ART_SPEC.md for Wolf's rank art. r117 (v113): LOOP AUDIT — flow map in AUDIT; level-persistence gap fixed (hk_xp_est hydrates from canonical XP at pill load). r116 (v112): XP v4 LIVE (daily-reset decay, warm-up +25, first-ever spine; 4 drifted computeXP copies -> 1 canonical in HK_RANK). r115 (v111): HANDLE GENERATOR (#30, hkSuggestHandle + prompt chips + account link) + FOSSIL KILLED: r76 promptHandle export shim self-recursed — name prompt silently dead since it shipped (analyst-#### root cause). r114 (v110): PUBLIC PLAYER CARDS (#28) — click any board name, delegated, zero new queries. r113 (v109): LEVEL CHIP in top nav (#32), RANDOM DRILL btn (#33), XP v4 daily-reset-decay design at dev/XP_DESIGN.md AWAITING WOLF. RANK CONSISTENCY r112 (v108): #29 closed — 3 stale inline ladders deleted, wsum passed everywhere (provisional split-brain), raw-vs-shrunk pill/card scale unified on ratingOf, lb ladder dup Candidate removed, stale copy fixed. DESKS SURFACES r111 (v107): lb desk filter (membership-first, team_code fallback), desk page ?desk=slug w/ roster banner, nav team-code editor retired. DESKS v1 SHIPPED r110 (Wolf: Desks/200-cap/one-per-player/pre-seed): migration (RPC-only invite codes, RLS), account Desk card, ?desk= deep link + auto-join. r111 = leaderboard surfaces; V1.5 = .edu school tag (Wolf idea, spec'd in TEAMS_DESIGN.md). T6 CLOSED r109 (audit-clean; blocksel prompt lie fixed). WAVE 3 CONTENT ARC COMPLETE (T2-T6 + e2e lever). TEAMS DESIGN DOC at dev/TEAMS_DESIGN.md — build blocks on Wolf's answers (Desks naming? size cap? one-team rule? seed strategy?). Shared asset version: v106. T5 SHIPPED: 'Hardcode it' rebuilt as the pre-send link-break ritual (ESV onto itself + blue paint, 66/30, was 13/9 'src/calc'); lookup/lookup2/sort/series/transpose audited already-at-bar, no churn. Shared asset version: v105. T4b SHIPPED: Excel-parity TEXT SPILL (labels run over empty neighbors, clip at occupied — titles no longer amputated) + picker name clarity #25 (margin 'Formula'→'Margins', drill→'Hardcode', retbridge tab collision fixed, stale labels synced). foot/cases audited clean. DEMO-REPLAY E2E LIVE (dev/e2e-demo-replay.js): Playwright drives every drill's demo() through the real engine — all 55 GREEN. It caught 4 real bugs the offline harness couldn't: clipboard nulled after 1 paste (broke copyover+pastes 'one copy two pastes' + Excel parity), loadChallenge didn't reset edit state (mid-edit poisoned next drill), bridge/gauntlet Alt+= misuse, editfix last-2-char edit mangled mid-word typos. No shared-asset change → ?v stays 104. Shared asset version: v104. T4a SHIPPED (growth 110/63 rev-build w/ CAGR^ · sumif 140/85 ledger→summary · balance 126/75 2-yr honest foot · revolver 113/65 sweep+prove-outs) — all Mix-Rule, typed-ref demos, 40-seed. T4b = margin/percent/foot/cagr/cases titles+voice pass. Shared asset version: v103. ESCAPE-LEAK CLASS killed (4 visible: demoBtn \u25b6, guided chip, lb checkmark, stats subtitle; RULE: \uXXXX = JS strings only). HARNESS DRAGNET all 55 drills: 33 machine-verified, zero new content bugs; residual pool = pointer-mode/F2/paste/sort demos → DEMO-REPLAY E2E queued (Playwright drives demo() in real engine, all 55). Shared asset version: v102. T3 SHIPPED — all six Full Builds rebuilt to the MIX RULE (≥3 op families each: typed hardcodes, blue paint via alt-h-f-c, anchored formulas, corkscrew links, fills, %-format, bold+border dress): isbuild 160/100 · debtsched 190/122 · cfslink 134/81 · bsbuild 182/116 · nwcsched 206/134 · threestmt 174/110. Dress solvability FIXED (fontcolor idx-0 black + ball-vs-bb) 97/53. Fossil dup taskLine (function reqs painted source code) removed. Harness v2 (chords/alt walks/fontcolor dialog). Shared asset version: v101. DEEPENING TRANCHE 2: dcf 5-yr DF×PV stack (140/85), waterfall 3-yr corkscrew cascade (168/106), schedule 5-yr + acc-dep memo (113/65); 40-seed verified. PORTFOLIO DEEPENING QUEUE T3–T6 logged (AUDIT r102; Wolf: kill non-specific/non-realistic exercises portfolio-wide; SPECIFICITY = defect class). Shared asset version: v98. versionup DENSIFIED (Wolf pushback): 5 FY cols, 4 derived rows (growth/GP/EBITDA/margin) = 18 sites + fills, drift-parity; par 135/keys 82. Shared asset version: v97. +versionup ('Roll-forward prep' — de-hardcode drill after triage; formulas + value-parity checks; 55 drills). Next: model deepening pass, CAS engine work, comments design. Shared asset version: v96. +2 drills (54): 'dress' (Dress the tab — 4-muscle formatting pass, randomized geometry) after format; 'triage' (Error triage — #REF!/#DIV/0!/#VALUE! as text artifacts, rebuild intent, ordered dependency B8-first) after audit. Engine +COUNTIF. Center-across-selection queued (needs alignment-span render mode). Shared asset version: v95. EVALUATOR TURN: cmp_() comparator level (=,<>,<,<=,>,>= → 1/0) + IF(cond,a,b); args/top route through cmp_; unit-proven on extracted code. NEW DRILL 'cases' (Sticky switch, Formulas group, 52 drills total): anchored scenario IF → ctrl+R → flip switch to 3, recalc repopulates row; 40-seed verified. Sticky-IF gate CLOSED. Shared asset version: v94. ENGINE AUDIT (Wolf-directed): r94 no-recalc rule RETRACTED (recalc exists, 8-pass; harness artifact — harness rule added). Fixed: snapshot ROWS (undo geometry bug), pointer-Backspace caret, number-entry parity (commas/%/parens). Ledger in doctrine section. Shared asset version: v93. WAVE 3 OPEN: Density Doctrine v2 (incl NO-RECALC RULE — engine doesn't recompute dependents; defects live on leaf cells / checks judge displayed values; first design was unsolvable, harness caught pre-ship). Audit='The 4am pass' (cross-foot col G defect + hardcode + cross-ref EBITDA, 60-seed order-independent verify). Decoy pseudo-checks culled. Recalc engine + IF/comparators = one queued evaluator turn. Shared asset version: v92. WAVE 2 CLOSED: guided-on visual state (frame seam + rail chip + lit F1); demo btn renamed 'watch solution'; TWO-LADDERS DOCTRINE: LEVEL=reps/xp (volume, never decays), RANK=competition (completion+speed percentile) — tour copy + card tile captions carry it. Pipeline+: center-across-selection drill (Wave-3 formatting rework, Ctrl+1 path). Shared asset version: v91. WAVE 2b: checklist associate-voice tranche 1 (11 labels; patcher tries literal+escaped em-dash); tour = 7 steps (+modes/card w/ ladder+level/boards); LEARN-FROM-ZERO first-drill auto-guided + toast (hk_learn_done). Tranche 2 rides Wave 3. Shared asset version: v90. WAVE 2a: Alt+←/→ drill hop; session resume (hk_last_drill); results Next names destination; first-run 4-step spotlight tour (hk_tour_done, ↵/esc); formula bar scrolls + FN_SIGS hints (16 fns, innermost-call parser, current arg bolded); stats shortcut panels MERGED (local tally primary, traces fallback). Shared asset version: v89. F4 range cycling added (both ends anchor together, pointed + typed; single-ref cycle was already Excel-order). Keystroke heatmap live: hk_key_counts tally at run end → stats 'Your keyboard' top-12 bars. WAVE 2 (gameplay-loop redesign) opens next. Shared asset version: v88. RIBBON REGRESSION fixed (type-to-replace guard += mode!=='ribbon'; bare walk letters were eaten pre-branch). ESC-RESTART REMOVED (ants-cancel only; restart=Shift+F11/results). Handle upserts (promptHandle+gate) kick navRefreshAuth. Suggestions: Esc micro-drill, session-resume, keystroke heatmap. Shared asset version: v87. WAVE 1 opened: F4 caret desync FIXED (cycleAnchor pointer branch missed editCaret sync — chars landed inside refs); results-card buttons wired (were render-only; space/esc honored); failed sign-in offers inline forgot-password reset; .st-tab shrink+ellipsis. Shared asset version: v86. Paste dialog: arrows cycle options (were swallowed = 'arrows dead'); drawRibbon wrapped in paint armor (render errors paint minimal strip + log, never strand input). Monetization DECIDED: subscription; free = level-gated path, sub = full track from L1 + cosmetics; single robust pathway. Shared asset version: v85. RIBBON FIXED: __altFooter scope crash in drawRibbon fontcolor branch (killed strip on font-color walks); paste-special options now INLINE in strip (active lit); MENUS += H>P percent (rule: new ops ship w/ MENUS entry). hkLevelRing = SMIL sweep on mount site-wide. Names sweep clean at lb/nav/stats/account — awaiting specific pages. Shared asset version: v84. Leaderboard 14px rhythm (rows 9/14 mono 13.5 min-h 42, cols 48/1fr/92; gaps/empty/panels/titles/chips aligned). Recon correction: .row/.hero were NOT duplicated (grep -n pipe misread; set -e caught it). Queue: number-format cycling retired (format drill covers); borders drill pending border-op audit; streak sync parked. Shared asset version: v83. Picker: arrows rewired to bylines (2D nav, .focus cursor), overlay top-aligned to stage + 1180 wide. PB SERVER HYDRATION on login (min-merge, 2000 cap). Account: Security deduped+merged; Progress card (crest+ring); Data card (export/clear local). Shared asset version: v82. (v81 = the 'lost-reply' turn that DID ship: beta tag, weekly retired, analyst-#### fallback, account Security/Appearance, hotfix.) v82: rapid-fire +comma/percent/bold-ribbon (9 ops); version medals c1-c8 = build-story glyphs; density III audit 8/sumif 9/lookup 7 (lookup hardcoded r<=6 caught & fixed — rule: sweep loop bounds on range swaps); Full Builds = full-width FLAGSHIP picker block w/ par chips. Shared asset version: v80. Picker v3: section-block grid (colored caps) + byline clouds (mono chips, ✓ PB); rows/desc/xp retired. Achievements sweep IN-GAME on next drill load post-win (hk_runs_lite ledger + local ctx; crowns stay card-side; hk_ach_seen shared). r79 log corrected: 43 achievements total. Shared asset version: v79. ACHIEVEMENTS 51 (incl. anti: Old Habits/Mouse Lifestyle, Thorough >60s, Night/Dawn/Weekend via hk_ach_flags written at run end). Picker = blurred over-game overlay, transparent 3-col masonry 1080px, mono pk-name. Gridwrap flush top-left (padding 0 10 3 0). Shared asset version: v78. Player card DOM repaired (r76 slice left the r72 hero OPENER orphaned above the comment anchor — unclosed div ate the layout). RULE: div-balance check after any innerHTML surgery. Shared asset version: v77. CELEBRATIONS: hkCelebrate/hkConfetti in nav.js+nav.css (frame-language dialog, ding pulse, CSS confetti, queue). Wired: level-up (hk_xp_est ladder), rank-up (hk_seen_tier on card), achievement unlocks (hk_ach_seen), PB confetti on result. Fossil scan engine-wide: CLEAN (dcfsens C4:H4 intentional). Shared asset version: v76. Navigation demo fossil fixed (A1:H7→A1:J7 — 8-col-era sels stalled the insert step). Player card = Apex showcase (handle banner; crest 84 | ring 84 tiles). Name prompt now global on session (not landing-gated) + card 'set your name' CTA (promptHandle exported). Checklist scrollbar 6px themed. Shared asset version: v75. Hero de-plated: tier.cls pill CSS leaked onto emblem wrapper + name (the orange plate) — class removed from wrapper, bg nulled on name, hero crest renders bucket-less, ring column self-centered. Shared asset version: v74. Crests FLAT: halo/under-shadow/under-stroke/bevel all retired (regalia +.35 op, rim 2.2). hkLevelRing(lvl,pct,size) fitness-style ring = hero's right column (chip retained for compact spots). Shared asset version: v73. GRID GAP CLOSED (screenshot-diagnosed): stage-main was a plain block breaking the height chain — now flex column (fbar 0 / gridwrap 1, min-height:0); rows distribute to the tab strip. Shared asset version: v72. Player card: level column INSIDE rank hero (right of crest); standalone level row removed. Campaign medals = 'THE BUILD n/8 VERSIONS' framed strip (v-labels, ship medal). FONT DOCTRINE: cells = Arial-first stack; all non-grid chrome = JetBrains Mono/Hanken (unchanged since ever). Shared asset version: v71. Grid fill engine-proof: .gridwrap table{flex:1;height:100%} (display:table ignores flex-basis in some engines), cap 56. 'set a name' = real-account profile w/o handle (handle lived on old ANON gate identity); promptHandle() now fires for member+no-handle sessions. Shared asset version: v70. Player card v2: rank hero (72px crest plate), 3 stat tiles, achievements 'N/23' + top-3 rarest earned featured 46px, grid 40px, drill list retired. SVG text fonts = JetBrains Mono. Nav/modebar tooltips flip below. signOut reloads. onSession closes auth modal + navRefreshAuth() (no-refresh username). Landing h1 23px. Shared asset version: v69. Landing greets sessions ('Welcome back', login hidden; gate auto-advances 700ms after member settle — fixes double sign-in). .gridwrap table{flex:1} = sheet reaches tabs at ANY geometry (cellh=floor). Crests: tier-metal halo disc + rim 2.3 + regalia +.25 opacity. Satellite h1s 22px/12-10 pads (content at the game line). Shared asset version: v68. Titles de-winked (Leaderboard/Stats/Shortcut reference/Account). scrollbar-gutter:stable everywhere (leaderboard horizontal-jump bug = scrollbar appearing on filter); chip hover lift removed. hkLevelChip wired (nav card 26/stats 20/account 24). Emblems enlarged (nav 20, card 30, lb rows 22-28, stats 46, account 54). Mobile gate card ≤740px/coarse. Shared asset version: v67. REGALIA PASS: rankEmblem v2 (escalating backplates: ring→studs→laurel+rings→wings+ice→crown+rays→starburst; transparent ground; cross-theme armor: rgba under-shadow + dark paint-order under-stroke + bevel hairline). hkBadge v2 (earned: crown notches + inner ring). hkLevelChip(lvl) helper added (unwired). Favicon = grey-dracula crest. Page header pads unified 24/16 (flush with game line). Alt directions B (shields) / C (ribbons) offered. Shared asset version: v66. Tab strip: ☰-all retired; lead chip '« GROUP' clicks BACK, NEXT chip centered (always fits). WIDTH DOCTRINE: game space (1180px/24px) is the alignment reference for ALL pages (nav 1280→1180; stats/account/About widened; pads unified 24). Shared asset version: v65. Landing = frame-language DIALOG (600px card, strip-cap brand line, over blurred game). Sheet fills to tab strip (pad 14/3, rowH ceiling 48). CELLS = Calibri stack 13.5px (--cellfont; Excel-authentic softness); chrome stays JetBrains Mono. Shared asset version: v64. ROOT CAUSE KILLED: index.html's inline THEMES dict shadowed themes.js (r52-r63 palette changes never reached the game page) — replaced with `const THEMES = window.THEMES;`, themes.js = single source (RULE: no inlined copies of shared dicts). Shared asset version: v62 — VISUAL STYLE LOCKED (Wolf-confirmed): grey-dracula Default (#292b31 bg, grey-drained dracula layers, sage #6ec9a0), flat everything, 34px surface2 strip caps, 12px radii, unified frame + workbook tabs. Do not touch absent explicit revisit. Default = dracula base + sage green (#282a36 bg, #6ec9a0 accent; :root ×5). Satellite pages matched to frame: leaderboard texture retired + strip caps + flat tints; stats hero flat; reference strip caps, flat glows, solid sticky, no entrance anim; radius unified 12px. DEFAULT = r52 desk dark RESTORED (bg #24272e, accent #4fb286; :root synced ×5) — LOCKED look. Sheet-tab strip: NEXT-group tab (next set's name in its color, click hops groups; stepGroup()). Leaderboard ld-rows flex→grid normalization. Wolf's leaderboard 'weird behavior' = unspecified, awaiting symptom. Workbook tabs: group-colored (--gcol per HOTKEY_GROUP_COLORS; 'GROUP »' lead chip; 38px flat strip). Flat pass II: dialog/tooltip shadows removed, glows→outlines. XP: canonical computeXP (nav.js) now smooth-decays repeats 50/15/10/7/5/3×5/1 (history reprices in beta); client estimate synced via hk_clears. Frame: stage-row clamp(400px,60vh,680px), row ceiling 42px, wrap 1280px. Default lightened: bg #d8dade, surfaces #e9eaed/#dfe1e5 (pastel dracula-grey; :root synced on all 5 pages). Density pass II: ribbon (random-site walks, par 42), polish (decoy table, par 38), foot (4×4 both-ways w/ grand-total agreement, par 72), bridge→Point Mode (5-yr pointed refs, wrong-column rejects, par 40). Pass III queue: audit, sumif, lookup, drill (visual only). 51 drills. Density pass I: saves/autofit/blocksel/copyover rebuilt site-driven (decoy + collision-disjoint patterns). NEW: retbridge (attribution ties algebraically, par 112), football (MIN/MAX ref-enforced, par 92) — Models=12. REGRESSION FIXED: S._colW=engine widths again (r55 pointed it at elastic __ew, silently auto-passing autofit); display uses S._ew. Flat pass: ribbon/button shadows removed. Sparse pass II queue: ribbon, polish, foot, bridge, audit, sumif, lookup, drill (undo exempt). SHEET TABS: bottom-edge Excel tab strip (current group, PBs, ☰ all; Alt+PgUp/PgDn walks — Ctrl+Pg browser-reserved). :root fallback vars were the theme culprit (hardcoded matrix pre-JS) — all pages now grey Default. editfix rebuilt site-driven (3 scattered typos, 18+ cells, par 44). Sparse density pass queued: saves/undo/autofit/blocksel/copyover/drill/ribbon/polish/foot/bridge/audit/sumif/lookup. .result moved OUTSIDE the frame (was the half-inch gap). True adaptive rows: measured gridwrap height, rowH clamp 22-36, one-frame re-render on load. THEMES: 'default' = windows-grey light (the desk look); old matrix dark renamed 'terminal'; 'desk' key retired (fallback catches it). ELASTIC FIT: spare gridwrap width distributed across all 10 cols (effective widths drive display + #### logic; S._colW = effective; engine colW untouched); row height scales w/ ROWS (32/29/26/24px via --cellh). Column cut DECLINED — G-I load-bearing for site-driven drills (pushback in AUDIT r55). Rail spans to FRAME TOP: ribbon inside stage-main; frame row 1 = ribbon ||| ✓ strip (both 34px surface2 — the color match). cl-head back to compact in-body form. Desk theme now WINDOWS-GREY LIGHT (dark:false; bg #b9bcc3, surfaces #cdcfd5/#c0c3ca, accent #3f9873) — still the default. Rail head twinned w/ formula bar: ✓ colhdr strip removed; .cl-head ('✓ checklist n/x') = rail top bar (34px, surface, hairline) — frame row 2 reads as one continuous strip. DEFAULT THEME = 'desk' (grey-green dark: #24272e bg, #4fb286 accent; dark×dracula blend). Rail flush to frame top (fbar inside stage-main; ✓ header pairs w/ formula bar; timer moved LEFT after namebox, 16px). .mb-tool buttons: resting surface2 + border + micro-shadow (affordance in all themes). Favicon = the keycap crest (desk palette, F4 legend). Badges/emblems audited: already house style. 49 drills. Rail render fix: .cl-inner absolute-inset wrapper (height:0/min-height:100% collapsed in indefinite flex rows — RULE logged); style locked per Wolf ('keep this exact style'). NEW: dcfsens (par 74, Models=10) — mixed-anchor sensitivity row, anchors grader-enforced. Queue: returns bridge, football field. 48 drills. PEDAGOGY RULE: checks are diagnostics, never constructions — no plugs unless the finance genuinely defines a residual (S&U sponsor equity OK; BS retained earnings NEVER). balance drill rewritten (RE = given; both sides SUM-footed, ref-enforced; lazy =B6 tie rejects). NEW: accdil (accretion/dilution, par 104) — Models now 9. Queue: DCF sensitivity row, returns bridge, football field. 47 drills. Frame: ribbon+fbar full-width rows (stage=column; stage-row holds grid+rail); ✓ header aligned to th strip. Rail adaptive (height:0/min-height:100% — grid rules height, rail scrolls; dense mode ≥5 checks). Unified mono 12.5px type. Taskline retired. Guide toggle = F1 (g now types). NEW: sourcesuses (plug-enforced S&U, par 96) in Models. Sheet-skinned checklist rail: faux ✓ column header (30px, matches grid th strip), hairline row rules, radius 0 — reads as a sheet column, stays non-addressable (real cells rejected: nav collision + spread doctrine + cell density; pushback in AUDIT r48). UNIFIED EXCEL FRAME: taskline caps one bordered block (stage radius 0 0 12 12, gap 0); ribbon = permanent 34px strip (ghost idle, accent in Alt-mode, ZERO layout shift — the r46 'popping' was insert-on-Alt); fbar/gridwrap/checklist are internal rows w/ hairlines. Returning-user fix: onSession sets __hkHasSession → onboard prompt only for true first-timers. Daylight = warm paper (#dbd8d1/#ecebe6). New favicon.svg (HK keycap). HOTKEY_PREMIUM scaffold (enabled:false; groups Models+Full Builds) — ◆ advanced badges in picker; leaderboard section-leaders strip (flagships: threestmt/lbo/waterfall/txncomps, zero new queries). Ribbon hidden when idle (the 'big banner'). .stage align-items:stretch (the REAL flush fix — flex-start was overriding). PAYWALL STAYS OFF during beta+internship (pushback logged in AUDIT r46). 46 drills. Transpose engine (Alt E S E) + transpose drill. format/pastes site-converted (10 site-driven). Per-step guide alternates live (guideAltNote, verified pairs). Rapid-fire GROUP B live (6 altSeq ops: align c/r/l, font-blue walk, autofit, paste-values). NEW: waterfall (MIN-enforced seniority cascade, par 118) + txncomps (precedent transactions, par 110) in Models (now 7). parKeys via replay: 24/14/14/63/54. Model dressing (codename() pool; 12 model titles randomized, '($mm)' units). isbuild/cfslink/debtsched/nwcsched extended to 4 years (pars 128/132/155/132; parKeys 61/43/84/85). center/sort/series converted site-driven (pars 44/40/30; parKeys 28/22/24; series randomizes start year). Site-driven drills: 8 total. Queue: format/pastes conversions, per-step alternates, Group B engine, new drill ideas. SITE-DRIVEN RANDOMIZATION: req/guide/targets can be functions (guide cached per load via __gCache); margin/growth/cagr/percent/blue randomize STRUCTURE from slot pools (verified 25 layouts each). Taskline sits BELOW drillbar (hugs grid). Copy rule: labels read like a person explaining the action. Doctrine: new drills randomize structure, not just values. SPREAD PASS: margin/growth/cagr/percent/blue rewritten multi-site across A..J×14 (pars 52/58/72/64/62, parKeys 48/37/79/32/61, decoy cells in blue, per-block anchors ref-checked in percent). LAYOUT DOCTRINE: drills occupy ≥6 cols/≥9 rows OR multi-site. gridwrap bottom flush w/ checklist (align-self:stretch). r40 features REPLAYED after silent-failure incident (see AUDIT — RULE: surgery blocks end with success echo + per-feature grep verify). '+' seeds '=+'. Guide footer lists engine-live chord alternates. Player card: top-5 shortcut chips + rule-based coach's notes from trace scans. Type-to-replace implemented (printable char starts Enter-mode edit; app hotkeys keep priority). #taskLine bar renders C.req above drillbar (13px, family dot, accent <em>). Target soft-highlight always on (td.ttarget dashed = next failing check's range; guided keeps strong ring). Eight-bug batch: gridwrap zoom rules DELETED (the real 140%); F4 cycles typed refs via caret-regex fallback; pointer ranges = editPointerBase (shift+arrow extends, plain re-points); caret always visible (.edcaret accent blink); td:hover neutralized; openAuth opens pre-sb; paste dialog docked bottom-right; results card has next-drill button. parKeys recalibrated via demo-replay audit (27 drills; policy min(current,computed); chords=1 keystroke; navigation+foot kept — demo tours overcount vs ctrl-jumps). RULE: recompute parKeys whenever a demo() changes. 43 drills; Full Builds = 6 (isbuild, bsbuild, cfslink, nwcsched, debtsched, threestmt capstone w/ 3 ref-checked links + zero-tie checks); wacc/lbo/schedule at flagship coverage (pars 78/98/98). Campaign v8 gates all six. IDEA QUEUE: sources&uses, accretion/dilution, DCF sensitivity row, returns bridge, football field, 13-week cash flow (RX flavor). Alt+= = Excel-parity propose+pointer (adaptive above/left, shift+arrows re-point, Enter commits; parens auto-close in commitEdit). Grid density: COLS=10 (A..J), ROWS_MAX=14, 12px cells (#grid overrides). Beacon v2 appends async stack line. QUEUE: balance-sheet/working-capital/3-statement full builds; deepen wacc/lbo/schedule; exploit wider grid for 4-5yr models. BOOT ERROR RESOLVED: wire-before-create on soundToggle/profileToggle (live since v31 — was the v32 'elements gone' mystery); listeners now live inside the creation block. RULE: wire-with-render, never wire listeners before their element exists. Boot smoke harness is NULL-STRICT now (getElementById null for unknown ids). Beacon also catches unhandledrejection. 40 drills. NEW GROUP 'Full Builds' (isbuild/cfslink/debtsched — WSP-style corkscrews, ref-checked links, pars 115-140); campaign v8. dcf=TV+EV (par 100), comps=full chain (par 62). Stale dup revolver excised. SURGERY RULE: drill edits via ^-anchored span maps + label-signature + key-list asserts + atomic write (see AUDIT r34 incident). wacc/lbo/schedule deepening queued. LADDER v4 (8 tiers, desk-culture): MBA Associate floor → Candidate → Summer → First-Year → Associate → VP → MD (crimson) → Second-Year Analyst (summit); ALL tier math delegates to HK_RANK (themes.js) — no local tier tables allowed (three stale ones excised). Leaderboard userStat = one pipeline (entries/ratingOf/wsum; .sum is dead). rosterHtml rendered in renderAll. Boot beacon on index paints runtime errors on-screen. nav auth slot retries for window.sb + navRefreshAuth() kick. Rank cache key = hk_rank3. CHROME RULE: nav.css owns page chrome (scrollbar-gutter stable, body padding-top 14, .wrap 1180, flat var(--bg) — NO per-page gradients/widths/body layouts). Index is TOP-ALIGNED (vertical-centering removed — that was the menu-jump root cause). Family dots on stats rows + leaderboard chips (CH has .group). Backdrop click-away = nav.js delegation (NEVER {once:true} on overlay closers). Demo beats: select 520ms / key 330ms / typing 110ms. Sound+profile = nav tool icons beside ? (index injects post-mount; HUD ⚙ gone). Stats: shortcut-chord heatmap + Lifetime tiles. DESIGN LANGUAGE: colored family dot for top-level, en-dash for sub-items (banker notes) — apply to all future lists. Revolver = true cash sweep (value-graded; headless-verified). GRADER RULE: no function-name checks unless the function is the skill. nav.js now loads in BODY right after #navMount (no defer) and mounts instantly — keep that placement on any new page. Tooltips = data-tip CSS (instant). Campaign = 'the build', chapters are versions v1–v7. Achievements = 23. Featured boards min-height 290. PLUGIN LAYERS LIVE: HOTKEY_PLUGIN_LAYERS (drills.js, 24 Macabacus + 14 FactSet researched entries) rendered on reference.html in per-plugin accents w/ ●=engine-live; engine adds Ctrl+Shift+$/%/~ (native), Macabacus Ctrl+Shift+D + CAS+1/4/5, FactSet Ctrl+Alt+E. Achievements v2: 34px medals, hover = Steam-style global rarity (computed from all users' runs). Group colors = dots not strips. Landing has a Log in button. Beta tools on account.html: ranked-gate test unlock (hk_dev_unlock) — REMOVE AT LAUNCH. 37 drills (Foundations=11: +autofit/rowops/filldr/blocksel). Landing contains the beta gate (REQUIRE_INVITE flag; INVITE_AUTO_CODE fallback). Nav = Monkeytype left-cluster (index inline topnav CSS deleted — nav.css is sole authority). favicon.ico+png+svg all ?v'd (Safari can't do svg favicons). Provisional rank: tierOf(avg,att,wsum) caps at Incoming until wsum≥6. NEXT TURN RESERVED: full Macabacus/FactSet layer buildout. RANK = rating v2: shrunk (K=6 prior 0.5) size-weighted (log2 cap 8+) placement; tier pcts recalibrated to shrunk scale (.53/.375/.26/.18) — see AUDIT r27 before touching. Tier roster panel on leaderboard. HOTKEY_GROUP_COLORS per family (accents only; hkBadge(color) param). Handle blocklist expanded server-side w/ leetspeak folding (migration 20260707400000). Favicon links carry ?v. nav.js keydown is trainer-aware ('?' off, Esc closes-overlay-only w/ stopImmediatePropagation; game pauses via window.navOverlayOpen). Anon signup LINKS via auth.updateUser (same uid — guest runs kept); profiles handle saves are UPSERTS. Modal-x delegation lives in nav.js (all pages, flag-synced); themes/kbd/settings modals have x. Toolbar = quiet Monkeytype-style buttons; header gap 30px. Drills: 33 (Foundations grew to 7: navigation, ribbon, editfix, undo, pastes, saves, copyover; campaign Ch1 matches; PARS regenerated). Ctrl+S is CONTEXT-AWARE (usesSave drills save via S.saveN; else restart). Modal × closes via capture-phase delegation (.modal-x/.pc-x). Emblems/badges are FLAT (no drop-shadows/pulse — Monkeytype discipline). Favicon = original cell-selection mark. MAJOR: index.html uses the SHARED nav (navMount/nav.js) — its inline nav, auth slot renderer, modals, and HUD rank pill are gone; nav.js owns all nav-layer UI on every page. Theme fallback unified to 'default' (dark) in themes.js + index. ONE drill bar (legacy header bar, now with +xp chip). Flair: profiles.flair + account selector + card borders. Analytics section on stats (PRO-tagged). create-checkout Edge Function scaffold (TEST-only, refuses live keys) + STRIPE_SETUP.md; startCheckout falls back to modal until deployed. Achievements: HOTKEY_ACHIEVEMENTS (15) in drills.js, medals+progress on card. XP UI: LVL chip has bar; picker/drill-bar show next-solve earn. Plugin profiles behind requirePro (beta passes). AWAITING: Wolf's original Macabacus/FactSet hotkey list for the full premium layers. Ranked gate: LVL 10 OR campaign complete, with wait/leave options. Emblems = keycap ladder (per-tier palettes, bucket pips; rankEmblem(name,size,bucket)). Handle rules server-enforced (unique/format/7-day cooldown, migration 20260707200000). Modal × standard: .modal-x, wire on render. Nav centering is ABSOLUTE on desktop (both nav.css + index inline — sync). Badges = window.hkBadge hex medals (themes.js + index inline — sync). Player card has an explainer legend toggle. XP v3: sessions earn XP (+20 marathon/+10 rapid), advanced first-clear bonus (+15 if par≥55); results card shows +xp; explainer via LVL chip. Drill bar above grid. Sound+profile in ⚙ popover. HOTKEY_PARS in drills.js (regen on par changes). Campaign mode live (HOTKEY_CAMPAIGN in drills.js, PB-derived progress, badges on player card — nav.js exact gating needs a HOTKEY_PARS snapshot, see AUDIT r19). Ranked opt-in at LVL 3 (localStorage hk_ranked). Sound cycles classic/arcade/thock/off. Favicon = F4 keycap. Drills: 28 in 7 groups (Models group added r18: wacc/dcf/lbo/schedule/comps). Tiers now have Top/Middle/Bottom BUCKET subtiers (HK_RANK.tierOf returns .bucket/.full).
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
- **AUTO-MERGE (Wolf, 2026-07-13):** when work on the session branch is
  verified, Claude creates the PR and merges it into main WITHOUT asking —
  push to main = deploy, so merge only after the round's verification gate
  (node --check / boot / e2e / smoke as applicable) is green.

====================================================================
# PIPELINE v2 — Wolf's full list, triaged (r87, 2026-07-10)
This section is the ROADMAP OF RECORD. Decisions here are settled; do
not re-litigate in future chats without Wolf explicitly reopening them.
====================================================================

## WAVE 1 — P0 GAMEPLAY-BREAKING BUGS (next turns, in order)
1. RIBBON TYPES LETTERS: alt+letter walks broken — hypothesis: the
   type-to-replace feature (r49: letters type into cells) captures keys
   before/despite ribbon mode. Trace keydown ordering vs mode==='ribbon'.
2. CURSOR + F4 LOCK not Excel-faithful ("cursor throwing things off").
   NEED FROM WOLF: exact repro (which drill, keys pressed, expected vs got).
3. DRILL-COMPLETION BUTTONS dead on the results card.
4. WRONG PASSWORD dumps to landing — must show inline error + "forgot
   password?" reset flow instead.
5. LOGIN STILL NEEDS REFRESH to show name (navRefreshAuth kick shipped r70
   but symptom persists — re-diagnose end to end).
6. SHEET-TAB CLUMPING at some browser widths (overflow, next-group chip
   hidden). NEED FROM WOLF: approx window width / screenshot.
7. ESC AUDIT: Esc must NEVER restart a drill (Shift+F11 owns restart since
   r49) — verify no residual Esc-restart path; Esc = back out only.

## WAVE 2 — CORE UX / GAMEPLAY LOOP
8. GAMEPLAY LOOP REDESIGN: seamless fast next-drill flow (advance is slow/
   unintuitive today). Includes rethinking the post-win rhythm.
9. ONBOARDING WALKTHROUGH: one-time, semi-transparent overlay highlighting
   the main loop (Wolf's buddy bounced — "no idea what to do").
10. LEARN-FROM-ZERO layer: something gentler than guided mode for true
    beginners (elegant solution TBD — Claude proposes).
11. FORMULA BAR AUDIT: text cuts off (must read across like Excel) + typing
    helpers (=IF( shows condition/if_true/if_false signature hints).
12. CHECKLIST LANGUAGE PASS: read like an associate's instructions to an
    intern ("take revenue and change XYZ" not bare cell refs).
13. Demo/"watch solution" naming consistency across drills (artifact).
14. Guided-mode visual feedback (more obvious when on).
15. Ctrl+PgUp/PgDn + some Alt codes browser-reserved: fold into gameplay-
    look redesign; PWA remains the real unlock (queued).

## WAVE 3 — CONTENT QUALITY (the drill rework arc)
STATUS r103: T3 Full Builds SHIPPED (MIX RULE: no same-motion-×N drills). r102: tranche 2 (dcf/waterfall/schedule) SHIPPED; deepening QUEUED
PORTFOLIO-WIDE as T3 Full Builds / T4 Formulas / T5 Lookups-Data-Values /
T6 Foundations-Formatting surfaces — see dev/AUDIT.md r102.
16. DENSITY DOCTRINE v2: kill offset-block randomization; sheets must read
    like a real model tab. Randomize CONTENT within realistic layouts.
17. CUT "leave-untouched" pseudo-checks everywhere — not a drill.
18. MODEL DRILLS too thin (solvable with two SUMs) — deepen.
19. FORMATTING REWORK: robust randomized formatting exercises; lighter grid
    surface to showcase bold/borders/colors (POLISH #39 folded in); add font
    size ribbon ops + color/highlight dropdowns.
20. AUDIT FAMILY: find broken formulas, formatting errors, balance breaks —
    multiple drills, the training value is diagnosis.
21. ERROR-TRIAGE drill: rework broken-ref into a series (#REF!, #DIV/0!...).
22. NEW DRILL — STICKY IFs: build, copy across/down, flip cases.
23. NEW DRILL — VERSION-UP/RESILIENCE: de-hardcode a bad model so it rolls
    forward cleanly; linking exercises fold in.
24. COMMENTS/CITATIONS habits: needs engine comment functionality first —
    design question open.
25. DRILL TITLES: row 1 = exercise-relevant title (like a real tab), fix
    cut-off company names; clearer drill names in the picker.
26. Growth-formula drill: fill down/right steps unclear — rework.

## WAVE 4 — SYSTEMS & FEATURES
27. TEAMS/CLUBS/SCHOOLS as a central onboarding channel + corporate
    training angle. BIG ARC — gets its own design turn before code.
28. PUBLIC PLAYER CARDS: click a leaderboard name → their card.
29. RANK CONSISTENCY: same tier everywhere (card/header/pages) — audit.
30. USERNAME: profanity/impersonation filter + random generator in
    banking/Excel theme (xbox-style suggestions).
31. REFERRAL system (design open; ties into accounts rework).
32. LEVEL IN TOP BAR (or more prominent account-linked display).
33. RANDOM DRILL MODE; promote rapid-fire; rethink/possibly retire
    marathon as model drills deepen.
34. MOUSE-USE feedback beyond achievements (fun, LATER — after bug waves).
35. CERTIFICATES: retire per-drill PDFs concept; instead exportable/
    LinkedIn-shareable player card + completion badges for flagships/top-%.
36. PRO PLACEHOLDER surface (Claude's judgement on placement).
37. Pop-out/under-game dialog area: better uses, light touch, don't overdo.
38. RANK ART: Wolf commissioning professional images — player card v3
    redesign (LoL-grade) BLOCKS ON ASSETS. SVG system stays until then.

## MONETIZATION (DECIDED)
- SUBSCRIPTION (not one-time). Free spine = level-gated progression path;
  sub unlocks full track from L1 + all cosmetics. One robust pathway, no
  live-service treadmill. Stripe stays TEST MODE until Wolf's internship
  ends — no live payments, no entity formation.

## STANDING CONSTRAINTS & RULES (summary — full detail below)
- Ship-as-script: one set -euo pipefail script through push; any failed
  check aborts before commit. Narrative never precedes verification.
- Div-balance check after any innerHTML surgery.
- Range swaps must sweep numeric loop bounds (lookup r<=6 incident).
- New altSeq ops ship WITH their MENUS entry (r85 rule).
- Whitespace-exact anchors; prefer regex+count asserts for risky excises.
- No inlined copies of shared dicts (THEMES shadow incident).
- Every round: cache-bump all pages, AUDIT.md entry, verify HEAD==FETCH_HEAD.

====================================================================
# DENSITY DOCTRINE v2 (r94 — Wave 3 law; every rebuilt/new drill complies)
====================================================================
1. THE SHEET IS A TAB: row 1 = real title (company — exercise ($000s));
   year headers; labeled sections. Randomize CONTENT (values, names, WHICH
   cell is defective), never layout offsets.
2. DIAGNOSTIC OVER CONSTRUCTION where the skill is reading: plant defects,
   don't dictate answers. Checklists name the SYMPTOM, associate voice.
3. NO LEAVE-UNTOUCHED CHECKS. Ever. (blocksel/polish decoys culled r94.)
4. NO TWO-SUM SOLVES: >=3 distinct motions or sites per drill.
5. RETRACTED (r95): the r94 "no-recalc rule" was FALSE — commitAction runs
   an 8-pass fixed-point recalc(); the engine DOES recompute dependents.
   The r94 "unsolvable" verdict was a HARNESS artifact (direct cell writes
   bypassed recalc). HARNESS RULE replaces it: drill verifications that
   simulate solves MUST run a recalc-equivalent pass before judging checks.
6. STICKY-IF/scenario drills GATED on evaluator IF() + comparators only
   (recalc already exists; engine has SUM/AVERAGE/MIN/MAX/ABS/SUMIF/INDEX/
   MATCH — verified r94/r95).

# ENGINE AUDIT LEDGER (r95, per Wolf's directive after the r94 scare)
- VERIFIED SOLID: recalc (8-pass fixed-point on every commit); fill ref
  translation ($-aware, clamped); F4 cycle incl. ranges (r90); auto-close
  parens on commit; pointer write caret sync.
- FIXED r95: undo snapshot missing S.ROWS (row ins/del + undo corrupted
  geometry); pointer-Backspace caret desync (F4-class sibling); number-entry
  parity (1,000 / 50% / (500) now land as NUMBERS w/ sensible formats).
- KNOWN SHORTCUTS (accepted, queued): eval failure -> silent 0 (should show
  #VALUE!-style error state); no circular-ref detection (staleness-safe but
  silent); text in SUM ranges counts 0 silently. Queue w/ evaluator turn.
