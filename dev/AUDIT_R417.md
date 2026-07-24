# hotkey.gg — PLATFORM AUDIT r417 (2026-07-24) — the findings base
_Six parallel agent audits (drills/copy · engine parity · account wiring · help systems · visuals · backend/launch), all live-verified where possible (headless renders, live-DB queries via the Management API, full e2e suite runs). This file is the FINDINGS BASE for the H1–H8 pipeline segments in dev/PIPELINE.md — each segment cites its section here. Fix a finding → check it off here in the same PR._

## STATUS
- ✅ SHIPPED r417: Backend-truth batch (see supabase/migrations/20260724*): ad-hoc SQL reconciled, desk_name_guard + apply_to_desk regressions repaired, profiles column grants (theme/client_state/email_*), issue_certificate flagged-run exclusion, weekly-digest verify_jwt pin, README banner fixed.
- Everything below is OPEN unless marked.

---
## A. ENGINE EXCEL-PARITY (→ segment H3/H7)

Scope read: full keydown handler (11326–11913), evalFormula (7915–8166), recalc (9930–9964), copy/paste/fill (10062–10853), undo (10546–10564), formats (7851–7898, 8555–8608), structure ops (11164–11256, 11467–11502), plus dev/e2e-audit-parity.js, dev/e2e-formulas.js, and the PROJECT_CONTEXT.md "NOT applied (by choice)" list.

## Ranked divergences

| # | Area | Engine behavior | Excel behavior | Banker notices? | Drill impact | Effort | Where |
|---|------|-----------------|----------------|-----------------|--------------|--------|-------|
| 1 | Formulas/errors | Formula that throws at eval (unwrapped MATCH/VLOOKUP miss, unknown fn) is refused at commit ("problem with this formula"); once committed, a formula that starts erroring keeps its stale old value silently | Commits fine and shows #N/A / #VALUE!; errors are values that display and propagate | YES — #1 immersion break | Player trying unwrapped form is wrongly told formula is malformed | M (map thrown fn errors to error-string sentinels like existing #REF! path) | 10204–10216, 9944 |
| 2 | Clipboard | Copy 1 cell → select range → Ctrl+V pastes top-left only | Paste tiles the copied block across the selection (paste-op path 10786 already broadcasts — plain paste doesn't) | YES — very common gesture | Interferes with fill/copy drills solved "the other way" | S | 10816–10828 |
| 3 | Formulas/format | No #DIV/0!: x/0 → Infinity → commits 0 or stale; error values never propagate — ref to #REF! cell coerces to 0 | #DIV/0! displays and propagates | YES | balcheck/error drills could silently pass wrong builds | M (same sentinel plumbing as #1) | 8146, 8134–8135, 10222 |
| 4 | Format/entry | Typing 8 into %-formatted cell stores 8 → renders 800% | Auto-scales to 8% | YES — most likely "this is broken" moment | Drill grading decimal in pre-% cell fails confusingly | S | 10224 |
| 5 | Clipboard | Marching ants + clipboard survive typing, commits, insert/delete, undo — cleared only by Esc/new copy/cut-paste. Stale rect mis-translates refs after insert | Any edit/structure op kills ants (+ clipboard for structure ops) | YES | Stale-rect paste = wrong numbers | S (clear in startEdit/commitEdit/structure ops) | 10174, 10217, 11488, 11787 |
| 6 | Keyboard | Enter/Tab with multi-cell selection collapse it | Selection persists; Enter/Tab cycle within, wrapping | YES | Fights Ctrl+Enter drill mental model | M | 10875–10877, 10232, 11803–11808 |
| 7 | Keyboard | F4 outside edit mode = swallowed no-op | F4 = repeat last action — top-5 banker key | YES | "Repeat last action" drill impossible until built | L | 11334 |
| 8 | Undo | snapshot() = cells+colW+ROWS only. Hide/unhide, group, filter not undoable — silent no-op consuming a stack frame | All undoable | YES | Mis-hide can't Ctrl+Z out | S (widen snapshot) | 10546–10548 vs 11056, 10949 |
| 9 | Clipboard/refs | Cut-paste never rewrites references (outside pointers + intra-block refs stay on old addresses) | Move updates every reference | YES when moving calc blocks | Poisons free-form solves | M | 10801–10814 |
| 10 | Keyboard | Ctrl+F unhandled → browser Find bar steals keyboard | Excel Find dialog | YES — jarring | Breaks flow anywhere | S (stub/swallow) | ~11843–11912 (absent) |
| 11 | Formulas | Missing: COUNT, COUNTA, MOD, ROUNDUP/ROUNDDOWN, SUBTOTAL, XLOOKUP, PMT, TEXT, SUBSTITUTE — and #1's UX makes them read as "malformed" | All exist | YES (COUNTA/ROUNDUP esp.) | Blocks alternate solves | S each | 8117–8130 |
| 12 | Formulas | Eager IF pre-evaluates both branches — untaken erroring branch fails whole formula | Lazy branches | Sometimes | Forces IFERROR wraps Excel wouldn't need | M (special-case IF like IFERROR) | 8126 |
| 13 | Formulas | INDEX coerces text results to 0 (toN); VLOOKUP/OFFSET/CHOOSE preserve text | INDEX returns text | YES for INDEX/MATCH on labels | Label pulls break | S | 7956–7961 |
| 14 | Format/entry | No date parsing on entry (1/15/2026 lands as text) | Parses to serial + date format | Sometimes | None (drills avoid) | M–L | 10219–10229 |
| 15 | Formulas | % operator unsupported (=50%, =B2*10% refused) | Valid postfix operator | Sometimes | None known | S | 8148–8156 |
| 16 | Keyboard | Tab…Tab…Enter doesn't return to Tab-run start column | Snaps back to run's start column, next row | Sometimes | None | S | 11803–11808 |
| 17 | Clipboard | Transpose paste drops formulas + half format set | Transposes formulas with ref translation | Rarely | None | M | 10829–10836 |
| 18 | Clipboard | After Ctrl+X, paste-special kind ignored | Excel greys paste-special after cut | Rarely | None | S | 10801 |
| 19 | Keyboard | Plain PgUp/PgDn dead (page scrolls) | Moves one screenful | Rarely | None | S (swallow) | 11461, 11710 |
| 20 | Keyboard | Ctrl+A second press = A1:used-range | Second press = entire sheet | Rarely | None; suite asserts current | S | 11870–11881 |
| 21 | Keyboard | Esc in ribbon exits whole KeyTip chain | Esc backs out one level per press | Rarely | None | S | 11631 |
| 22 | Entry | Ctrl+Enter (commitEditAll) lacks single-commit coercions (45%, (500), 1,200 land as text) | Same parsing as normal commit | Sometimes | Could fail checks expecting numbers | S (share parse ladder) | 10256–10257 vs 10224–10229 |
| 23 | Keyboard | Ctrl+; / Ctrl+Shift+; absent | Insert date/time | Rarely | None | S | absent |
| 24 | Format | Ctrl+1→P percent 1 decimal vs Ctrl+Shift+% 0 (Excel default 2) | Internal inconsistency | Barely | None | S | 10573 vs 11906 |
| 25 | Formulas | MATCH ignores match_type (always exact) | Approximate ascending scan for 1 | Rarely | None | S | 7950–7952 |

Deliberate-and-fine (verified): comma-style parens negatives (Wolf desk convention, 7851); Ctrl+=/Ctrl+- full row/col requirement; Esc·Esc restart (r146 — note Esc-hammering can nuke a board). Disagreement with NOT-applied list: "copy-then-Enter doesn't paste" should ride with fix #5 (same code path, ~5 lines, top Excel gesture).

## Top systemic risks
1. **r348 "refuse bad formulas" gate is over-broad** — conflates syntax errors with legit runtime errors; one sentinel fix collapses #1, #3, #12 and defuses #11/#15.
2. **Clipboard has no lifecycle** — never cleared by edits/structure ops (#5), doesn't tile (#2), cut never rewrites refs (#9). Most visibly not-Excel area in free play.
3. **Undo is cells-only** (#8) — every non-cell substrate added since r179 fell outside the undo contract; pattern repeats unless snapshot() widened.
4. **Value-entry coercion single-path** — commitEdit's parse ladder not shared by commitEditAll (#22), doesn't consult cell format (#4). The %-cell 100× explosion is the most likely "broken" moment.
5. **Parity suite locks behaviors but not negatives** — zero assertions on error display, paste tiling, ants lifetime, undo-of-hide. Fixes must land with new suite letters.

---
## B. ACCOUNT / BACKEND WIRING (→ segment H1)

## Confirmed-broken in prod (grant gaps, cross-checked live)
- profiles UPDATE grants missing: theme, client_state, client_state_at, email_recap/streak/certs →
  theme-follows-account DEAD (nav.js:26, index:12867, account:429 all swallow 42501);
  ENTIRE r358 cross-device sync (hkStatePush nav.js:1304) never persists — dead-man check regex
  doesn't match "permission denied" so it silently retries forever;
  email-pref toggles visibly bounce back (account:507).
- index.html:15195 signup path writes school_tag DIRECTLY (revoked since r122) → school picked at
  sign-up silently lost (only .edu auto-derive rescues). Fix: rpc set_school_tag + separate show_school update.

## Sign-out wipe gaps (nav.js:450)
NOT wiped: hk_dev_unlock (ranked bypass leaks to next account), hk_run_outbox (foreign-user rows
retried forever under RLS; also lose original timestamp → XP day repricing; 25-row flush can trip
runs_guard 20/60s), hk_dc_top10 (next account's daily bounty skipped), hk_cert_<track> (cert offer
blocked for next account), hk_seen_frames (mild).

## Level/XP/rank SSOT — holds except:
1. lb.js:661–668 heroHtml parses raw flair with bare-id regex — JSON loadout blobs render UNSKINNED
   on leaderboard "your card" hero (nav.js:812 / lb.js:498 use hkFlair; this was missed).
2. desks.html public card + roster tier computed from desk-FILTERED runs (lb.js:471, 351, 220–233)
   → different tier than global surfaces. Use gUserStat.
3. RANKED_MIN_LVL duplicated nav.js:335 / lb.js:570 (both 10, comment-synced).
4. hkSkinUnlockSweep (nav.js:1581) races hydrateLevel on satellite pages (self-heals).
5. hkLevelXp returns raw __srvXp once landed (index:13817) while myXpEst maxes (14327) → LVL chip
   can DROP on sync while gates stay unlocked. Fix: max() in hkLevelXp (uid-guarded).

## RPC contract map — clean except:
- pause_subscription / cancel_subscription / invoices (billing.html:170/176/186) — NONEXISTENT;
  error branch reads as near-success ("nothing is billing yet") → will mask real failures at launch.
- issue_certificate/certificates/drill_feedback/client_state only in dev/ scripts (pipeline gap — fix in flight).
- redeem_code + members table = pre-repo dashboard schema, undocumented dependency.
  recordSession gates on me_member (index:14927) while recordRun doesn't — sessions silently stop posting if redeem_code breaks.
- digest_unsubscribe requires live session — email unsubscribe link is silent no-op signed-out.
- admin_flagged_sessions / admin_session_verdict have NO admin.html panel — session anti-cheat queue has no reviewer.

## Desks & certs
- account.html:249 + :702 read legacy prof.team_code → modern team_members joiners read deskless on
  their own account page (my_desk RPC on same page knows better).
- Cert issuance trigger is local-PB-only (index:9375) → cross-device/cleared-cache completers never
  offered; account cert card shows 100% with no claim button. Fix: server-coverage claim path.
- Cert flagged-runs issue: issuer counts flagged (definer bypasses RLS), public verify hides them →
  "✓ owner / ⚠ recruiter" split. (Fix in flight in security migration.)
- LinkedIn Add-to-Profile URL: CORRECT per spec; upgrade to organizationId when company page exists.
- HK_TRACKS vs SQL track arrays: currently content-identical (feared drift not live).

## Top-10 ranked fixes (severity × effort)
1. [Crit/S] profiles column grants migration + reconcile dev SQL (IN FLIGHT via fix agent)
2. [High/S] index:15195 signup school_tag → set_school_tag RPC
3. [High/S] sign-out wipe += hk_dev_unlock, hk_run_outbox, hk_dc_top10, hk_cert_* sweep, hk_seen_frames
4. [High/M] certs/feedback into migrations (IN FLIGHT)
5. [Med/M] server-side cert claim path (account cert card button or trust server runs)
6. [Med/S] hkLevelXp max(__srvXp, est)
7. [Med/S] lb.js:663 hkFlair() parse
8. [Med/S] account desk status from my_desk()/team_members not team_code
9. [Med/S] outbox: skip foreign-user rows, carry created_at, cap flush < rate limit
10. [Low-Med/M] billing dead RPCs honest-error; admin flagged-sessions panel

---
## C. HELP / GUIDANCE SYSTEMS (→ segment H2)
Live-verified: replay 82/82×3 seeds, guided 85, alt-paths 75, rapidfire 14, onboard 35 all green.
Defects are static data-shape/copy bugs the suites don't assert.

## The big one: index-pairing misalignment
- Renderer pairs guide[idx]↔checks[idx] (index:10397) and targets[i]↔checks[i] (8374–8388).
- **43/82 drills guide.length ≠ checks.length**: 19 shorter (later checks UNHINTED: fxconvert 3v5,
  cases 4v6, scrub 3v5, cascade 5v7, lbobuild 6v8, dcfbuild, wk13, bsbuild, housestyle, sourcesuses,
  lbo, dashcover, debtblock, ruleaudit, retbridge, colops, editfix, hunt, football), 24 longer
  (trailing rungs never display: navigation 7v4, modeltour 8v6, waterfall 6v4, series 3v1...).
- **11 drills targets ≠ checks**: cases 9v6 (guided ring on WRONG CELL from step 2, index:7189),
  lbobuild 5v8, scrub 3v5, comps, isbuild, cfslink, bsbuild, threestmt, opmodel, dcfbuild, debtblock.
- Fix: realign + add invariant guide.length===checks.length && targets===checks to check-invariants.js.
- CAVEAT: guide arrays double as SEO drill-page mini-guides (build-drill-pages.js:59–66) which want
  sequential narrative — may need split fields (guide per-check vs walkthrough sequential).

## Alt-route gaps (engine accepts vs Excel canon)
- **Ctrl+Shift+V (native M365 paste-values) falls through to lk==='v' → pastes ALL/formulas —
  silent wrong result** (index:11884–11885). Top fix.
- Missing: Ctrl+Shift+& (outline border) / Ctrl+Shift+_ (strip) — ~20 border drills ribbon-only;
  Ctrl+Shift+# (date); Shift+F10 context menu (absent entirely); legacy Alt E A / Alt I R / Alt D S;
  Alt A S S custom sort; Alt A G G/U U; F4 repeat-last-action (biggest canon gap, untracked in ENGINE_GAP_AUDIT).
- ALTS registry: 9 drills zero alternates (fxconvert, tieout, fcfbuild, intsched, opmodel, dcfbuild,
  lbobuild, debtblock, dashcover — all newest Models/Full Builds, violates house rule).
- alt-paths harness runs guided=false — alternates unproven under rails (flip guided=true).

## Guided rails
- Fence sound, railSafe list complete. railZoneCompute eats demo() selections (10025) — fence
  quietly depends on demo script.

## Onboarding V3 spec diff (unshipped)
1. No staged formula cell for tour step 3 (formula-bar lesson demonstrates nothing — spotlights a constant).
2. No replay-the-tour affordance (hk_tour_done never clearable; spec:51).
3. doIt exact-key (11379) — spec wants any-arrow for steps 1–2.
4. Final auth step branches on me_user not #authSlot state (15849).

## Learn mode (echo) is a GHOST
- r401 removed #echoBtn but 3 copy sites still sell it: post-demo card (13642), stuck-nudge toast
  pulses nonexistent button (13766–13767), tour step (15835). echoStart (13671) works, tested, no entry point.
- WOLF CHOICE: restore button or scrub copy.

## Top-10
1. guide↔checks realign ×43 + invariant
2. targets↔checks realign ×11 (cases worst) + invariant
3. Ctrl+Shift+V paste-values
4. learn-mode ghost (Wolf choice)
5. ALTS for 9 drills + guided=true harness
6. onboarding formula cell (e.g. C4 =A4-B4)
7. Ctrl+Shift+& / _ border chords
8. replay-tour affordance
9. any-arrow doIt + authSlot branch
10. F4 repeat-last-action (engine feature) + stale "all 55" header fix

---
## D. DRILL CONTENT: COPY + DEPTH (→ segments H4/H6)

Full report in session transcript. Key structure:

## Copy defects (30 ranked)
- Class A re-hinting in drills.js picker metadata (NOT index.html): pastes label "Alt E S everything" (drills.js:67), anchor label "Pin it with F4" + tab "F4" (drills.js:108), tieout "F9 the suspect leg" (drills.js:133 + stale name index.html:6757).
- Class B text≠grading: dcf desc wrong math "DF row × PV row" (drills.js:112); wk13 aha says 13 columns, build makes 8 (index.html:5214); foot prompt bans typed SUM but sumishF accepts (3985 vs 4018); bridge "never type a cell address"/"pointed" ungradeable (4266/4312); wirewalk "precedents and dependents" but ok=traceN>=2 (6752); versionup "match v1 exactly" recomputed live (7100/7106); unhide width 12 graded ≥~11 via GLOBAL colW (3149); drill prompt says "the column" → trap (1896); housestyle "trim the decimals" directionless (2159); filterpass cursor rider not graded (3031).
- Class C banned verbs / non-imperative: ruleoff "box" (2232), dress "Circle"(2485)/"Dress"(2487)/"rule it"(2480, also ok accepts ball), liqbridge "Dress"(6954), grpfold do-nothing guard line (2975), rowops state-line (3621), gauntlet no-verb (2084), blocksel "centred" + bundle (3907), threestmt/balance/bsbuild state-report labels.
- Class D jargon: balcheck "Corkscrew" (6520), debtsched "BB" (5358), housestyle "colour" (2091), series 3-op single line (4259), comps triple bundle (4103), ~~pastes route-script labels (3281–3283)~~ ✔ r422 H6b-1: semantic beat labels per DEPTH_PASS §4.3.

## 15 shallowest drills (rank, drill, line, checks, one-line enrichment)
1 series 4229 (1) — table to serve + metric row + split checks
2 lookup 3157 (2) — two sequential queries, dress answer, planted broken VLOOKUP decoy
3 lookup2 7462 (2) — deal-screen story, dressed answer + second pull filled
4 bridge 4263 (2) — beat 2: grow revenue off memo rates
5 autofit 3493 (2) — land a SUM that #### overflows, autofit as consequence
6 wrapfix 6822 (2) — randomize which lookup is broken, add healthy leave-alone bait
7 drill 1893 (2) — randomize site, second live column values-only must NOT hit
8 anchor 2536 (2) — move grid per seed, add dress beat
9 foot 3982 (3) — randomize block size/site, total-row dress finish
10 percent 2723 (2) — randomize block A, 1-dec % + bold 100% row
11 sort 4173 (3) — grade row integrity like scrub (_byName), second beat
12 unhide 3106 (3) — randomize hidden span, verify subtotal stayed live
13 margin 2493 (3) — vary ask per table (margin/growth/multiple)
14 dcfsens 6002 (3) — randomize grid site, base-case beat, de-nest checks
15 grpfold 2923 (3) — fold guard away, contrast beat (hidden block → group)
Watchlist: retbridge 6055, football 6103, fcfbuild 4506.

## Label↔check mismatches (11)
sort names not bound to sizes (4213, port scrub's _byName); bridge/foot/wirewalk/versionup/unhide/filterpass as above; ~~pastes CHECK2 latch neither enforces nor frees (3269)~~ ✔ r422 H6b-1: pasteOpN latch dropped, CHECK2 grades pure end state; anchor CHECK2 (2586) / dcfsens CHECK3 (6051) "one formula" without fill latch — systemic; tieout CHECK2 f9N>=1 only (6816); dress CHECK1 lenient (2460).
Clean exemplars: drill CHECK1, scrub, comps, cases, retbridge.

## Systemic patterns
1. De-hinting never applied to drills.js picker metadata/tab strip.
2. Banned-verb border vocab survives where r199/r200 wasn't re-applied (dress/ruleoff/liqbridge) — mechanical pass.
3. HOW-claims engine can't grade = biggest gap class ("pointed", "don't type a single SUM", "from ONE formula") — soften to outcome voice or add latches.
4. Voice drift: state-descriptions vs imperative, multi-op bundles, random caps, UK spellings ×2.
5. Depth cliff concentrated in Formulas I + Data & Lookups single-formula tier; §8 proxies (parKeys<10, zero-formula, 1–2 checks, fixed sites) machine-findable.

---
## E. VISUAL SYSTEM (→ segment H5)
Verified via headless Chromium renders @1400px and 390px.

## Color/tokens
- 12 semantic tokens duplicated as :root fallbacks in 17 files; TWO divergent fallback palettes
  (app charcoal vs marketing near-black), both DARK while default render is LIGHT (Daylight) →
  dark→light flash on slow networks.
- ≥5 "the green" values (#6ec9a0, #2ea36f, #16a862, #1f8a55, #1a7a45); on-accent #0c0d0e hardcoded
  5× in index.html; gold/red near-duplicates; reference.html one-off greys.
- Fix: one tokens.css (fallback = Daylight), breakpoint + radius + 8-step type-scale tokens.

## Layout — LIVE BUG
- **`.wrap` cascade collision**: nav.css:14 (.wrap 1180px, pad 0 24px) loads AFTER page styles and
  overrides cert(880)/contact(880)/enterprise(980)/billing(920) wraps — all four render 1180px,
  bottom padding stripped. billing --maxw:920 dead. Fix: scope nav's wrap (.topnav .wrap) — 1-line root cause.
- About.html is on a DIFFERENT ERA shell: no nav.css/nav.js/themes.js, permanently dark vs
  Daylight-light site → hard theme flip on click; custom nav 62px vs 60px; own footer; 178px mobile
  overflow masked by body overflow-x:hidden.
- Header rhythm drift: contact/enterprise/admin 14px 0 6px vs standard 12px 0 10px.
- Three footer regimes (injected FOOTER_HTML ×14 pages, inline copy in index, none on About/404).
- Radius zoo 11–16px, no rule.

## Typography
- Families excellent (Hanken + JetBrains Mono tokens; Arial cellfont deliberate).
- NO size scale: 36 distinct sizes incl. a full half-pixel ladder (10.5×77, 11.5×68, 12.5×76 decls).
- h1 22/700/-.4 consistent on 9 pages; deviants: enterprise 26, cert 31, index landing 23, About clamp.
- Sub-8px text exists (ribbon labels 7–8.5px).

## Modals (~40 overlays)
1. **Toast z=220 UNDER tour scrim z=340** (index:626 vs 1480) — mid-tour gate feedback invisible
   (index:14347 downgrades to toast during tour). Also under ranked 320/mobile gate 400/celebration 520.
2. **certModal: no Esc + opens z=530 OVER open celebration (520) after 1600ms** — Esc closes the
   celebration UNDERNEATH; cert card stays. Violates the app's own "modal without keyboard dismissal
   is a trap" comment (index:14370).
3. Duplicate DOM IDs #themesModal/#kbdModal mounted by BOTH nav.js:97-98 and index.html:1741-42,
   two Esc handlers, separate state.
4. ZERO focus trapping / role=dialog / aria-modal / focus-restore anywhere; no body scroll-lock on any overlay.
5. Backdrop-close = 3 behaviors; fragile {once:true} binds ×4; z=520 tie celebration/PRO sheet;
   skin-unlock sweep (T+1800ms) can pop over an active tour (__hkCelBlocked doesn't cover tour).
6. Shell drift: radius 12–18, scrim .45–.74, blur on some.

## Animations
- Good: nav.css FX all reduced-motion-gated; one shared rAF for canvases, static frame under RM.
- lb.css ZERO reduced-motion (emblemPulse infinite drop-shadow repaint lb.css:351; fdPulse 506).
- index.html ungated loops: navpulse text-shadow (298), hkStartPulse box-shadow (744), ants (391), edblink (163).
- Canvas loop never culls offscreen/hidden (themes.js:1987); frame picker inits 20-30 canvases with
  shadowBlur everywhere → jank on integrated GPUs.
- 12× transition:all; transition:width on progress fills; permanent will-change on .streak-flame.

## Responsive (@390px verified)
- stats.html 301px REAL hscroll (.ach-filters 652px non-wrapping inline-flex, stats:70/425) — fix flex-wrap.
- About.html 178px overflow (hero-glow 760px fixed).
- Mobile gate covers the LANDING/marketing too — mobile visitor from shared link sees only the
  keyboard wall (deliberate for trainer, costly for funnel).
- Breakpoint zoo: 719/720, 740/760, 840/860 near-dupes.
- Clean at 390: lb, profile, account, cert, enterprise, reference, billing.

## Top-10
1. .wrap cascade fix (scope .topnav .wrap)
2. About.html onto shared shell
3. hkToast z ≥ 530
4. certModal Esc + defer until celebration closes
5. One modal helper (Esc/backdrop/focus-trap/role=dialog/scroll-lock) adopted by ~15 modals
6. Reduced-motion + compositable props for lb.css/index pulses
7. De-dupe themesModal/kbdModal
8. stats .ach-filters flex-wrap
9. Cull offscreen canvases + cap shadowBlur
10. tokens.css extraction (light-first fallback)

---
## F. BACKEND / SECURITY / LAUNCH INFRA (→ segment H8 + shipped r417 batch)
Live-checked: www.hotkey.gg is served by CLOUDFLARE PAGES (_headers active, confirmed via curl);
the root CNAME file is a GitHub-Pages-era leftover (inert — delete in a cleanup pass).

### Fixed in the r417 backend-truth batch (verify on deploy)
- desk_name_guard protected-names regression · apply_to_desk anon-guard regression ·
  profiles UPDATE grants (theme, client_state+_at, email_*) · issue_certificate flagged exclusion ·
  dev/migrate-*.sql reconciled → migrations · weekly-digest verify_jwt=false · README banner.

### Still open (ranked)
- [MED] profiles world-readable incl. school_domain (email domain leaks even when show_school=false)
  + client_state + theme → consider column-level SELECT grants like teams got (desks.sql:237).
- [MED] CSP loose: connect-src 'self' https: wss: (exfil-friendly) → pin to supabase origin + fonts +
  cdn.jsdelivr; img-src https: → self+data:+blob:; frame-src → 'none'. No HSTS header → add
  Strict-Transport-Security max-age=31536000; includeSubDomains.
- [MED] events table: unthrottled anon insert path — curl loop can poison launch-day funnel metrics.
  Cheap per-session_key rate trigger before launch.
- [LOW] curtain_check no rate limit + HAGS fallback client-side constant (moot at launch flip).
- [LOW] reports insert: 400-char cap but no rate limit.
- Cache headers: add /*.js /*.css /art/* → Cache-Control: public, max-age=31536000, immutable
  (safe: every ref is ?v=-queried + CI-enforced bump). HTML stays must-revalidate.
- Baseline schema (runs/profiles/access_codes/members/redeem_code) exists only in
  hotkey-setup-guide.md paste-blocks — write a 00000000000000_baseline.sql for rebuildability.
- Root sessions_setup.sql + sessions_tiebreaker.sql = byte-identical dupes of the 20260101 migrations — delete.
- admin.html auth model server-side + correct; admin_flagged_sessions/verdict RPCs have NO admin panel (H1 item).

### Email map (all sending blocked on Wolf accounts)
| Surface | Status |
|---|---|
| Auth emails | Live, unbranded shared Supabase sender ~2-4/hr throttle — WILL eat launch-day signups. Custom SMTP = Resend + domain. |
| Weekly digest | Deployed + pg_cron scheduled, dormant on RESEND_API_KEY (verify_jwt pin shipped r417). |
| Weekly recap / streak nudge / cert email | Scaffolds in dev/edge-* — not deployed. Two-Monday-emails overlap + two unsubscribe systems to resolve before enabling. |
Go-live order: (1) Wolf: domain mailbox (EMAIL_SETUP §1) → (2) Wolf: Resend + DNS → (3) Wolf: Supabase SMTP + templates →
(4) Wolf: RESEND_API_KEY secret → (5..) auto: deploy remaining fns + resolve overlap. digest_unsubscribe requires a live
session (email link = silent no-op signed-out) — return signed token or uid+hmac param when enabling.

### THE LAUNCH RUNBOOK (ordered; owner tags)
Pre-flip week: 1) ✅ reconcile+regression migration (r417) 2) [Wolf] rotate mgmt token + DB password
(chat-pasted twice now) 3) [auto] G3 full live-vs-repo diff (policies/grants/triggers dump)
4) [auto] smoke-fixture purge migration 5) [Wolf decide/auto run] seed-field clear (dev/seed-clear.sql)
6) [Wolf] email steps 1–4 above 7) [auto] _headers HSTS+CSP+immutable 8) [auto] events rate limit.
Launch day: 9) [Wolf go] PRELAUNCH_LOCK=false (index:1804) 10) [Wolf] BETA_MODE decision (index:1799)
11) [auto] remove owner backdoor nav.js:362-371 + profile.html:321/886 + account.html:713-717 dev
buttons + lb.js:604 hk_dev_unlock honor 12) [auto] deactivate hags beta code + INVITE_AUTO_CODE
13) [auto] cache-bump sweep + PR + verify live 14) post-launch: E1 Stripe JWT-derive + webhook,
E2 billing backend (invoices/pause/cancel), email campaigns.

---
## G. RIBBON / EXCEL AESTHETICS / FORMULA AUTOCORRECT (→ segments H3/H5; Wolf ask 07-24)
Grounded in 15 live renders (scratchpad 01–15) + live commit-path probes. r298 border canon VERIFIED HELD.

### Ribbon keytips (canon verdicts)
- **Alt W G for gridlines is a HOUSE INVENTION** — Excel canon is Alt W V G (W G = Zoom to Selection).
  Fix: add 'WV':[['G','Gridlines']] (MENUS 8766, applyRibbon 10673); keep WG as silent alias. XS.
- Alt H 3 (Underline) WORKS but is hidden — handler 10746 exists, MENUS['H'] 8749 omits it. XS.
- Paste Special missing Subtract (S) — we ship 4 of Excel's 5 ops (PASTE_OP_OPTS 8826, doPaste 10776). S.
- Alt H O E (Format Cells via ribbon) not wired — only legacy Alt O E + Ctrl+1 (MENUS['HO'] 8754). XS.
- Alt M P / M D trace precedents/dependents missing — alias onto existing Ctrl+[/] handlers (8761). S.
- Alt H N number-format dropdown absent (M, defensible cut); AutoSum dropdown lacks A/C/M/I (S);
  Alt H F D / H O U C/L absent (M, low).
- Verified canon-correct: tab letters H/N/P/M/A/R/W; the whole Home inventory incl. A N accounting;
  legacy Alt E S / Alt O E; PASTE_OP_OPTS O/M/D/I. Format Cells house letters = documented, fine.

### Ribbon visuals
1. Lean always-on Home bar (r340) is the discoverability answer and defaults OFF behind the "bar" pin
   (8934/8969) — DEFAULT IT ON for new accounts (zero height cost per 8933 comment). [Wolf playtest]
2. Esc exits whole KeyTip chain (11631) — back out ONE level (= parity finding #21). S.
3. KeyTip badges lowercase (8949-8954, 9076) — Excel uses uppercase. One-char fix.
4. Lean rows lost group labels (Clipboard/Font/…) — consider labels in ribbon-open state only (sub-8px caveat).
5. Icon tiles have mouse-only tooltips in a keyboard product — echo highlighted command name in strip edge.
6. Dim not-wired tabs = good honest UX, keep.

### Grid aesthetics (ranked by immersion)
1. **Selected row/col headers get NO highlight** (render 8484-8486/8503, th CSS 166-169) — Excel shades
   them + green edge/text; THE peripheral cue. S effort, biggest grid win.
2. Error values left-aligned (txt:true seeds 6391-6397) — Excel CENTERS errors. XS (.err class).
3. #### overflow painted amber+letterspaced (251, 8578) — Excel uses normal ink. XS.
4. Marching ants accent-GREEN (382-392) — Excel monochrome; green collides with selection language. XS.
5. Sheet-tab active state lacks the green text/underline (1092). XS.
6. Name box doesn't live-count "3R x 2C" during shift-extension (8725). S.
7. Fill handle missing 1px white notch (368-369); selection tint could take a faint green cast (348). XS.
- Verified Excel-real, no action: active-cell outline+handle, anchor-white-in-range, gridline grey,
  number/text alignment, parens negatives, accounting $ flush, edit pop-out + ref coloring, fx buttons.

### FORMULA AUTOCORRECT — build-ready spec (H3, pairs with error sentinels)
Current: one blunt gate (commitEdit 10204-10216). Probes: =A1++A2 accepted silently; lowercase fns
stored lowercase (10222); =SUM(A1:A2 auto-closed ✓; ;-separators/trailing-op/,)/==/unmatched-) refused;
=FOO(A1) refused (Excel: commits #NAME?); **commitEditAll (Ctrl+Enter, 10240-10261) has NO gate —
junk formulas silently commit 0 across the selection.**
Target tiers: S silent-fix (parens ✓ + case-normalize outside string literals) · P propose-dialog
("↵ accept · esc keep editing"; repairs: ;→, · trailing op · ,) · == · unmatched ")" · doubled binary
ops but never unary --/+) · N commit #NAME? sentinel (string-sentinel house pattern, recalc 9944
extension; forward-compatible with #N/A/#DIV/0! sentinel work) · R refuse (keep r348 beat).
Plan: (1) pure autocorrectFormula(buf) helper near 7914 returning {kind, buf, fixed};
(2) Hook A commitEdit ladder; (3) Hook B proposal render branch beside sortwarn ~9041 + applyRibbon
keys ~10605 + Escape guard 11631 case; (4) Hook C same ladder in commitEditAll; (5) e2e-formulas.js
matrix block (each class × Enter/Ctrl+Enter, normalization, #NAME? recalc stability, Esc-returns,
demoPlaying lenient guard stays).

### Section G top-10
1. Alt W V G canon fix · 2. autocorrect ladder (one build round) · 3. header highlight ·
4. show Alt H 3 · 5. Esc one-level · 6. Paste Special Subtract · 7. lean bar default ON [Wolf] ·
8. error display polish (center + normal-ink ####) · 9. Sort Warning as a card dialog ·
10. Alt H O E + Alt M P aliases. (+ uppercase KeyTips, monochrome ants — one-liners.)
