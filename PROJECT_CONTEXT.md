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
  never paste SQL in the dashboard again). stats.html AND account.html are part of the deploy set. Shared asset version: v81. Brand [BETA] chip. WEEKLY RETIRED (button+board; engine dormant). Leaderboard names: analyst-#### fallback. Account: Security (pw reset, sign out) + Appearance (theme buttons); handle save repaints nav. RULE: no surrogate-pair escapes in heredoc anchors — regex for emoji lines. Shared asset version: v84. Leaderboard 14px rhythm (rows 9/14 mono 13.5 min-h 42, cols 48/1fr/92; gaps/empty/panels/titles/chips aligned). Recon correction: .row/.hero were NOT duplicated (grep -n pipe misread; set -e caught it). Queue: number-format cycling retired (format drill covers); borders drill pending border-op audit; streak sync parked. Shared asset version: v83. Picker: arrows rewired to bylines (2D nav, .focus cursor), overlay top-aligned to stage + 1180 wide. PB SERVER HYDRATION on login (min-merge, 2000 cap). Account: Security deduped+merged; Progress card (crest+ring); Data card (export/clear local). Shared asset version: v82. (v81 = the 'lost-reply' turn that DID ship: beta tag, weekly retired, analyst-#### fallback, account Security/Appearance, hotfix.) v82: rapid-fire +comma/percent/bold-ribbon (9 ops); version medals c1-c8 = build-story glyphs; density III audit 8/sumif 9/lookup 7 (lookup hardcoded r<=6 caught & fixed — rule: sweep loop bounds on range swaps); Full Builds = full-width FLAGSHIP picker block w/ par chips. Shared asset version: v80. Picker v3: section-block grid (colored caps) + byline clouds (mono chips, ✓ PB); rows/desc/xp retired. Achievements sweep IN-GAME on next drill load post-win (hk_runs_lite ledger + local ctx; crowns stay card-side; hk_ach_seen shared). r79 log corrected: 43 achievements total. Shared asset version: v79. ACHIEVEMENTS 51 (incl. anti: Old Habits/Mouse Lifestyle, Thorough >60s, Night/Dawn/Weekend via hk_ach_flags written at run end). Picker = blurred over-game overlay, transparent 3-col masonry 1080px, mono pk-name. Gridwrap flush top-left (padding 0 10 3 0). Shared asset version: v78. Player card DOM repaired (r76 slice left the r72 hero OPENER orphaned above the comment anchor — unclosed div ate the layout). RULE: div-balance check after any innerHTML surgery. Shared asset version: v77. CELEBRATIONS: hkCelebrate/hkConfetti in nav.js+nav.css (frame-language dialog, ding pulse, CSS confetti, queue). Wired: level-up (hk_xp_est ladder), rank-up (hk_seen_tier on card), achievement unlocks (hk_ach_seen), PB confetti on result. Fossil scan engine-wide: CLEAN (dcfsens C4:H4 intentional). Shared asset version: v76. Navigation demo fossil fixed (A1:H7→A1:J7 — 8-col-era sels stalled the insert step). Player card = Apex showcase (handle banner; crest 84 | ring 84 tiles). Name prompt now global on session (not landing-gated) + card 'set your name' CTA (promptHandle exported). Checklist scrollbar 6px themed. Shared asset version: v75. Hero de-plated: tier.cls pill CSS leaked onto emblem wrapper + name (the orange plate) — class removed from wrapper, bg nulled on name, hero crest renders bucket-less, ring column self-centered. Shared asset version: v74. Crests FLAT: halo/under-shadow/under-stroke/bevel all retired (regalia +.35 op, rim 2.2). hkLevelRing(lvl,pct,size) fitness-style ring = hero's right column (chip retained for compact spots). Shared asset version: v73. GRID GAP CLOSED (screenshot-diagnosed): stage-main was a plain block breaking the height chain — now flex column (fbar 0 / gridwrap 1, min-height:0); rows distribute to the tab strip. Shared asset version: v72. Player card: level column INSIDE rank hero (right of crest); standalone level row removed. Campaign medals = 'THE BUILD n/8 VERSIONS' framed strip (v-labels, ship medal). FONT DOCTRINE: cells = Arial-first stack; all non-grid chrome = JetBrains Mono/Hanken (unchanged since ever). Shared asset version: v71. Grid fill engine-proof: .gridwrap table{flex:1;height:100%} (display:table ignores flex-basis in some engines), cap 56. 'set a name' = real-account profile w/o handle (handle lived on old ANON gate identity); promptHandle() now fires for member+no-handle sessions. Shared asset version: v70. Player card v2: rank hero (72px crest plate), 3 stat tiles, achievements 'N/23' + top-3 rarest earned featured 46px, grid 40px, drill list retired. SVG text fonts = JetBrains Mono. Nav/modebar tooltips flip below. signOut reloads. onSession closes auth modal + navRefreshAuth() (no-refresh username). Landing h1 23px. Shared asset version: v69. Landing greets sessions ('Welcome back', login hidden; gate auto-advances 700ms after member settle — fixes double sign-in). .gridwrap table{flex:1} = sheet reaches tabs at ANY geometry (cellh=floor). Crests: tier-metal halo disc + rim 2.3 + regalia +.25 opacity. Satellite h1s 22px/12-10 pads (content at the game line). Shared asset version: v68. Titles de-winked (Leaderboard/Stats/Shortcut reference/Account). scrollbar-gutter:stable everywhere (leaderboard horizontal-jump bug = scrollbar appearing on filter); chip hover lift removed. hkLevelChip wired (nav card 26/stats 20/account 24). Emblems enlarged (nav 20, card 30, lb rows 22-28, stats 46, account 54). Mobile gate card ≤740px/coarse. Shared asset version: v67. REGALIA PASS: rankEmblem v2 (escalating backplates: ring→studs→laurel+rings→wings+ice→crown+rays→starburst; transparent ground; cross-theme armor: rgba under-shadow + dark paint-order under-stroke + bevel hairline). hkBadge v2 (earned: crown notches + inner ring). hkLevelChip(lvl) helper added (unwired). Favicon = grey-dracula crest. Page header pads unified 24/16 (flush with game line). Alt directions B (shields) / C (ribbons) offered. Shared asset version: v66. Tab strip: ☰-all retired; lead chip '« GROUP' clicks BACK, NEXT chip centered (always fits). WIDTH DOCTRINE: game space (1180px/24px) is the alignment reference for ALL pages (nav 1280→1180; stats/account/About widened; pads unified 24). Shared asset version: v65. Landing = frame-language DIALOG (600px card, strip-cap brand line, over blurred game). Sheet fills to tab strip (pad 14/3, rowH ceiling 48). CELLS = Calibri stack 13.5px (--cellfont; Excel-authentic softness); chrome stays JetBrains Mono. Shared asset version: v64. ROOT CAUSE KILLED: index.html's inline THEMES dict shadowed themes.js (r52-r63 palette changes never reached the game page) — replaced with `const THEMES = window.THEMES;`, themes.js = single source (RULE: no inlined copies of shared dicts). Shared asset version: v62 — VISUAL STYLE LOCKED (Wolf-confirmed): grey-dracula Default (#292b31 bg, grey-drained dracula layers, sage #6ec9a0), flat everything, 34px surface2 strip caps, 12px radii, unified frame + workbook tabs. Do not touch absent explicit revisit. Default = dracula base + sage green (#282a36 bg, #6ec9a0 accent; :root ×5). Satellite pages matched to frame: leaderboard texture retired + strip caps + flat tints; stats hero flat; reference strip caps, flat glows, solid sticky, no entrance anim; radius unified 12px. DEFAULT = r52 desk dark RESTORED (bg #24272e, accent #4fb286; :root synced ×5) — LOCKED look. Sheet-tab strip: NEXT-group tab (next set's name in its color, click hops groups; stepGroup()). Leaderboard ld-rows flex→grid normalization. Wolf's leaderboard 'weird behavior' = unspecified, awaiting symptom. Workbook tabs: group-colored (--gcol per HOTKEY_GROUP_COLORS; 'GROUP »' lead chip; 38px flat strip). Flat pass II: dialog/tooltip shadows removed, glows→outlines. XP: canonical computeXP (nav.js) now smooth-decays repeats 50/15/10/7/5/3×5/1 (history reprices in beta); client estimate synced via hk_clears. Frame: stage-row clamp(400px,60vh,680px), row ceiling 42px, wrap 1280px. Default lightened: bg #d8dade, surfaces #e9eaed/#dfe1e5 (pastel dracula-grey; :root synced on all 5 pages). Density pass II: ribbon (random-site walks, par 42), polish (decoy table, par 38), foot (4×4 both-ways w/ grand-total agreement, par 72), bridge→Point Mode (5-yr pointed refs, wrong-column rejects, par 40). Pass III queue: audit, sumif, lookup, drill (visual only). 51 drills. Density pass I: saves/autofit/blocksel/copyover rebuilt site-driven (decoy + collision-disjoint patterns). NEW: retbridge (attribution ties algebraically, par 112), football (MIN/MAX ref-enforced, par 92) — Models=12. REGRESSION FIXED: S._colW=engine widths again (r55 pointed it at elastic __ew, silently auto-passing autofit); display uses S._ew. Flat pass: ribbon/button shadows removed. Sparse pass II queue: ribbon, polish, foot, bridge, audit, sumif, lookup, drill (undo exempt). SHEET TABS: bottom-edge Excel tab strip (current group, PBs, ☰ all; Alt+PgUp/PgDn walks — Ctrl+Pg browser-reserved). :root fallback vars were the theme culprit (hardcoded matrix pre-JS) — all pages now grey Default. editfix rebuilt site-driven (3 scattered typos, 18+ cells, par 44). Sparse density pass queued: saves/undo/autofit/blocksel/copyover/drill/ribbon/polish/foot/bridge/audit/sumif/lookup. .result moved OUTSIDE the frame (was the half-inch gap). True adaptive rows: measured gridwrap height, rowH clamp 22-36, one-frame re-render on load. THEMES: 'default' = windows-grey light (the desk look); old matrix dark renamed 'terminal'; 'desk' key retired (fallback catches it). ELASTIC FIT: spare gridwrap width distributed across all 10 cols (effective widths drive display + #### logic; S._colW = effective; engine colW untouched); row height scales w/ ROWS (32/29/26/24px via --cellh). Column cut DECLINED — G-I load-bearing for site-driven drills (pushback in AUDIT r55). Rail spans to FRAME TOP: ribbon inside stage-main; frame row 1 = ribbon ||| ✓ strip (both 34px surface2 — the color match). cl-head back to compact in-body form. Desk theme now WINDOWS-GREY LIGHT (dark:false; bg #b9bcc3, surfaces #cdcfd5/#c0c3ca, accent #3f9873) — still the default. Rail head twinned w/ formula bar: ✓ colhdr strip removed; .cl-head ('✓ checklist n/x') = rail top bar (34px, surface, hairline) — frame row 2 reads as one continuous strip. DEFAULT THEME = 'desk' (grey-green dark: #24272e bg, #4fb286 accent; dark×dracula blend). Rail flush to frame top (fbar inside stage-main; ✓ header pairs w/ formula bar; timer moved LEFT after namebox, 16px). .mb-tool buttons: resting surface2 + border + micro-shadow (affordance in all themes). Favicon = the keycap crest (desk palette, F4 legend). Badges/emblems audited: already house style. 49 drills. Rail render fix: .cl-inner absolute-inset wrapper (height:0/min-height:100% collapsed in indefinite flex rows — RULE logged); style locked per Wolf ('keep this exact style'). NEW: dcfsens (par 74, Models=10) — mixed-anchor sensitivity row, anchors grader-enforced. Queue: returns bridge, football field. 48 drills. PEDAGOGY RULE: checks are diagnostics, never constructions — no plugs unless the finance genuinely defines a residual (S&U sponsor equity OK; BS retained earnings NEVER). balance drill rewritten (RE = given; both sides SUM-footed, ref-enforced; lazy =B6 tie rejects). NEW: accdil (accretion/dilution, par 104) — Models now 9. Queue: DCF sensitivity row, returns bridge, football field. 47 drills. Frame: ribbon+fbar full-width rows (stage=column; stage-row holds grid+rail); ✓ header aligned to th strip. Rail adaptive (height:0/min-height:100% — grid rules height, rail scrolls; dense mode ≥5 checks). Unified mono 12.5px type. Taskline retired. Guide toggle = F1 (g now types). NEW: sourcesuses (plug-enforced S&U, par 96) in Models. Sheet-skinned checklist rail: faux ✓ column header (30px, matches grid th strip), hairline row rules, radius 0 — reads as a sheet column, stays non-addressable (real cells rejected: nav collision + spread doctrine + cell density; pushback in AUDIT r48). UNIFIED EXCEL FRAME: taskline caps one bordered block (stage radius 0 0 12 12, gap 0); ribbon = permanent 34px strip (ghost idle, accent in Alt-mode, ZERO layout shift — the r46 'popping' was insert-on-Alt); fbar/gridwrap/checklist are internal rows w/ hairlines. Returning-user fix: onSession sets __hkHasSession → onboard prompt only for true first-timers. Daylight = warm paper (#dbd8d1/#ecebe6). New favicon.svg (HK keycap). HOTKEY_PREMIUM scaffold (enabled:false; groups Models+Full Builds) — ◆ advanced badges in picker; leaderboard section-leaders strip (flagships: threestmt/lbo/waterfall/txncomps, zero new queries). Ribbon hidden when idle (the 'big banner'). .stage align-items:stretch (the REAL flush fix — flex-start was overriding). PAYWALL STAYS OFF during beta+internship (pushback logged in AUDIT r46). 46 drills. Transpose engine (Alt E S E) + transpose drill. format/pastes site-converted (10 site-driven). Per-step guide alternates live (guideAltNote, verified pairs). Rapid-fire GROUP B live (6 altSeq ops: align c/r/l, font-blue walk, autofit, paste-values). NEW: waterfall (MIN-enforced seniority cascade, par 118) + txncomps (precedent transactions, par 110) in Models (now 7). parKeys via replay: 24/14/14/63/54. Model dressing (codename() pool; 12 model titles randomized, '($mm)' units). isbuild/cfslink/debtsched/nwcsched extended to 4 years (pars 128/132/155/132; parKeys 61/43/84/85). center/sort/series converted site-driven (pars 44/40/30; parKeys 28/22/24; series randomizes start year). Site-driven drills: 8 total. Queue: format/pastes conversions, per-step alternates, Group B engine, new drill ideas. SITE-DRIVEN RANDOMIZATION: req/guide/targets can be functions (guide cached per load via __gCache); margin/growth/cagr/percent/blue randomize STRUCTURE from slot pools (verified 25 layouts each). Taskline sits BELOW drillbar (hugs grid). Copy rule: labels read like a person explaining the action. Doctrine: new drills randomize structure, not just values. SPREAD PASS: margin/growth/cagr/percent/blue rewritten multi-site across A..J×14 (pars 52/58/72/64/62, parKeys 48/37/79/32/61, decoy cells in blue, per-block anchors ref-checked in percent). LAYOUT DOCTRINE: drills occupy ≥6 cols/≥9 rows OR multi-site. gridwrap bottom flush w/ checklist (align-self:stretch). r40 features REPLAYED after silent-failure incident (see AUDIT — RULE: surgery blocks end with success echo + per-feature grep verify). '+' seeds '=+'. Guide footer lists engine-live chord alternates. Player card: top-5 shortcut chips + rule-based coach's notes from trace scans. Type-to-replace implemented (printable char starts Enter-mode edit; app hotkeys keep priority). #taskLine bar renders C.req above drillbar (13px, family dot, accent <em>). Target soft-highlight always on (td.ttarget dashed = next failing check's range; guided keeps strong ring). Eight-bug batch: gridwrap zoom rules DELETED (the real 140%); F4 cycles typed refs via caret-regex fallback; pointer ranges = editPointerBase (shift+arrow extends, plain re-points); caret always visible (.edcaret accent blink); td:hover neutralized; openAuth opens pre-sb; paste dialog docked bottom-right; results card has next-drill button. parKeys recalibrated via demo-replay audit (27 drills; policy min(current,computed); chords=1 keystroke; navigation+foot kept — demo tours overcount vs ctrl-jumps). RULE: recompute parKeys whenever a demo() changes. 43 drills; Full Builds = 6 (isbuild, bsbuild, cfslink, nwcsched, debtsched, threestmt capstone w/ 3 ref-checked links + zero-tie checks); wacc/lbo/schedule at flagship coverage (pars 78/98/98). Campaign v8 gates all six. IDEA QUEUE: sources&uses, accretion/dilution, DCF sensitivity row, returns bridge, football field, 13-week cash flow (RX flavor). Alt+= = Excel-parity propose+pointer (adaptive above/left, shift+arrows re-point, Enter commits; parens auto-close in commitEdit). Grid density: COLS=10 (A..J), ROWS_MAX=14, 12px cells (#grid overrides). Beacon v2 appends async stack line. QUEUE: balance-sheet/working-capital/3-statement full builds; deepen wacc/lbo/schedule; exploit wider grid for 4-5yr models. BOOT ERROR RESOLVED: wire-before-create on soundToggle/profileToggle (live since v31 — was the v32 'elements gone' mystery); listeners now live inside the creation block. RULE: wire-with-render, never wire listeners before their element exists. Boot smoke harness is NULL-STRICT now (getElementById null for unknown ids). Beacon also catches unhandledrejection. 40 drills. NEW GROUP 'Full Builds' (isbuild/cfslink/debtsched — WSP-style corkscrews, ref-checked links, pars 115-140); campaign v8. dcf=TV+EV (par 100), comps=full chain (par 62). Stale dup revolver excised. SURGERY RULE: drill edits via ^-anchored span maps + label-signature + key-list asserts + atomic write (see AUDIT r34 incident). wacc/lbo/schedule deepening queued. LADDER v4 (8 tiers, desk-culture): MBA Associate floor → Candidate → Summer → First-Year → Associate → VP → MD (crimson) → Second-Year Analyst (summit); ALL tier math delegates to HK_RANK (themes.js) — no local tier tables allowed (three stale ones excised). Leaderboard userStat = one pipeline (entries/ratingOf/wsum; .sum is dead). rosterHtml rendered in renderAll. Boot beacon on index paints runtime errors on-screen. nav auth slot retries for window.sb + navRefreshAuth() kick. Rank cache key = hk_rank3. CHROME RULE: nav.css owns page chrome (scrollbar-gutter stable, body padding-top 14, .wrap 1180, flat var(--bg) — NO per-page gradients/widths/body layouts). Index is TOP-ALIGNED (vertical-centering removed — that was the menu-jump root cause). Family dots on stats rows + leaderboard chips (CH has .group). Backdrop click-away = nav.js delegation (NEVER {once:true} on overlay closers). Demo beats: select 520ms / key 330ms / typing 110ms. Sound+profile = nav tool icons beside ? (index injects post-mount; HUD ⚙ gone). Stats: shortcut-chord heatmap + Lifetime tiles. DESIGN LANGUAGE: colored family dot for top-level, en-dash for sub-items (banker notes) — apply to all future lists. Revolver = true cash sweep (value-graded; headless-verified). GRADER RULE: no function-name checks unless the function is the skill. nav.js now loads in BODY right after #navMount (no defer) and mounts instantly — keep that placement on any new page. Tooltips = data-tip CSS (instant). Campaign = 'the build', chapters are versions v1–v7. Achievements = 23. Featured boards min-height 290. PLUGIN LAYERS LIVE: HOTKEY_PLUGIN_LAYERS (drills.js, 24 Macabacus + 14 FactSet researched entries) rendered on reference.html in per-plugin accents w/ ●=engine-live; engine adds Ctrl+Shift+$/%/~ (native), Macabacus Ctrl+Shift+D + CAS+1/4/5, FactSet Ctrl+Alt+E. Achievements v2: 34px medals, hover = Steam-style global rarity (computed from all users' runs). Group colors = dots not strips. Landing has a Log in button. Beta tools on account.html: ranked-gate test unlock (hk_dev_unlock) — REMOVE AT LAUNCH. 37 drills (Foundations=11: +autofit/rowops/filldr/blocksel). Landing contains the beta gate (REQUIRE_INVITE flag; INVITE_AUTO_CODE fallback). Nav = Monkeytype left-cluster (index inline topnav CSS deleted — nav.css is sole authority). favicon.ico+png+svg all ?v'd (Safari can't do svg favicons). Provisional rank: tierOf(avg,att,wsum) caps at Incoming until wsum≥6. NEXT TURN RESERVED: full Macabacus/FactSet layer buildout. RANK = rating v2: shrunk (K=6 prior 0.5) size-weighted (log2 cap 8+) placement; tier pcts recalibrated to shrunk scale (.53/.375/.26/.18) — see AUDIT r27 before touching. Tier roster panel on leaderboard. HOTKEY_GROUP_COLORS per family (accents only; hkBadge(color) param). Handle blocklist expanded server-side w/ leetspeak folding (migration 20260707400000). Favicon links carry ?v. nav.js keydown is trainer-aware ('?' off, Esc closes-overlay-only w/ stopImmediatePropagation; game pauses via window.navOverlayOpen). Anon signup LINKS via auth.updateUser (same uid — guest runs kept); profiles handle saves are UPSERTS. Modal-x delegation lives in nav.js (all pages, flag-synced); themes/kbd/settings modals have x. Toolbar = quiet Monkeytype-style buttons; header gap 30px. Drills: 33 (Foundations grew to 7: navigation, ribbon, editfix, undo, pastes, saves, copyover; campaign Ch1 matches; PARS regenerated). Ctrl+S is CONTEXT-AWARE (usesSave drills save via S.saveN; else restart). Modal × closes via capture-phase delegation (.modal-x/.pc-x). Emblems/badges are FLAT (no drop-shadows/pulse — Monkeytype discipline). Favicon = original cell-selection mark. MAJOR: index.html uses the SHARED nav (navMount/nav.js) — its inline nav, auth slot renderer, modals, and HUD rank pill are gone; nav.js owns all nav-layer UI on every page. Theme fallback unified to 'default' (dark) in themes.js + index. ONE drill bar (legacy header bar, now with +xp chip). Flair: profiles.flair + account selector + card borders. Analytics section on stats (PRO-tagged). create-checkout Edge Function scaffold (TEST-only, refuses live keys) + STRIPE_SETUP.md; startCheckout falls back to modal until deployed. Achievements: HOTKEY_ACHIEVEMENTS (15) in drills.js, medals+progress on card. XP UI: LVL chip has bar; picker/drill-bar show next-solve earn. Plugin profiles behind requirePro (beta passes). AWAITING: Wolf's original Macabacus/FactSet hotkey list for the full premium layers. Ranked gate: LVL 10 OR campaign complete, with wait/leave options. Emblems = keycap ladder (per-tier palettes, bucket pips; rankEmblem(name,size,bucket)). Handle rules server-enforced (unique/format/7-day cooldown, migration 20260707200000). Modal × standard: .modal-x, wire on render. Nav centering is ABSOLUTE on desktop (both nav.css + index inline — sync). Badges = window.hkBadge hex medals (themes.js + index inline — sync). Player card has an explainer legend toggle. XP v3: sessions earn XP (+20 marathon/+10 rapid), advanced first-clear bonus (+15 if par≥55); results card shows +xp; explainer via LVL chip. Drill bar above grid. Sound+profile in ⚙ popover. HOTKEY_PARS in drills.js (regen on par changes). Campaign mode live (HOTKEY_CAMPAIGN in drills.js, PB-derived progress, badges on player card — nav.js exact gating needs a HOTKEY_PARS snapshot, see AUDIT r19). Ranked opt-in at LVL 3 (localStorage hk_ranked). Sound cycles classic/arcade/thock/off. Favicon = F4 keycap. Drills: 28 in 7 groups (Models group added r18: wacc/dcf/lbo/schedule/comps). Tiers now have Top/Middle/Bottom BUCKET subtiers (HK_RANK.tierOf returns .bucket/.full).
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
