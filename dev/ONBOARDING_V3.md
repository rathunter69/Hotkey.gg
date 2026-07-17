# ONBOARDING V3 — one spotlight sequence, on a cleared grid (Wolf-approved direction, r302)

_Build-ready spec. Source: the r297 onboarding playtest audit (agent drove the full first-run,
screenshotted every step) + Wolf's follow-up direction. Supersedes the primer/tour split._

## The problem (verified live)
Novices today get TWO visual systems teaching the same things: a 5-card centered-modal PRIMER
(index.html ~14093–14118, with a FAKE drawn 3×3 HTML table) and then the spotlight TOUR
(TOUR_STEPS ~14119–14136) — while the real grid sits dimmed behind the fake one. Non-novices
skip the primer but still get the full tour even after picking "just show me the drills"
(showComfort only branches the primer, not the tour). The tour's "step i/N" counter lies when
audience-gated steps are skipped.

## Wolf's direction (the deltas that matter)
1. **Fold the primer INTO the spotlight sequence** — teach grid / cell reference / formula bar /
   typing / starting a formula as interactive spotlight steps. One coherent dim+highlight
   system for ALL users, more interactive.
2. **Run it on a CLEARED grid** — a custom, hidden onboarding drill (a basic-mechanics
   playground board), NOT the live first drill. The tour must never fight drill one's content.
3. **Teach `=` OR `+`** as formula starters (bankers use `+`; the current primer says "always =" — wrong).

## The unified sequence (each = a TOUR_STEPS entry; tourShow renders sel/cap/body/doIt)
| # | spotlight | teach | interaction | notes |
|---|---|---|---|---|
| 1 | .gridwrap | the grid; cell = address (B4); the outline is you | do-it: any arrow | folds PRIMER[0]; real grid, no fake table |
| 2 | #nameBox | the name box always shows where you are | do-it: arrow, watch it change | new doIt type: any-arrow |
| 3 | .fbar / #fContent | grid shows the RESULT; formula bar shows what's inside | Enter (or move onto a staged formula cell) | folds PRIMER[1] |
| 4 | active cell | type replaces · ↵ commits · Tab commits→right · Esc backs out · F2 edits | do-it ENTRY beat: type a number, ↵ | needs the new entry-gate (below) |
| 5 | active cell | formulas start with **= or +**: type =B2+B3 ↵ | do-it ENTRY beat | the `+` is new content |
| 6 | .gridwrap | keyboard beats mouse (Ctrl+→, Ctrl+Shift+↓) | do-it chords | existing steps 0–1 |
| 7+ | existing steps | checklist · drillbar · guided/F1 · (optional) profile/ghost/themes · auth | Enter | unchanged |

Then the existing placement prompt (maybeOnboard) unchanged.

## Engineering seams (from the audit, file:line as of r297)
- **TOUR_STEPS** ~14119: insert steps; add `novice:true` flag on teaching beats; audience gate
  in tourShow (~14149–14153, currently signedIn/signedOut/optional) gains `novice` (skip when
  hk_xlv>0 — or per Wolf keep for ALL users; decide at build).
- **showComfort** ~14073: keep as audience selector; DELETE the `if(v===0) showPrimer(after)`
  branch — every answer flows to tourShow(0). Retire showPrimer/PRIMER after migration.
- **THE ONE REAL GAP — typed-entry gating:** the tour guard (index.html ~10257–10271) only
  passes a single exact chord; `=`, `+`, digits never reach the grid. Build a `doIt` variant
  `{entry:true}`: allow printable keys + Enter/Tab/Esc/F2 through to the live editor, advance
  on COMMIT (cell value change), not on keypress.
- **The hidden intro drill:** a new non-catalog board (not in MENU_ORDER/pickers/boards) —
  `onboardsandbox` style; simple staged numbers + one formula cell for step 3; loaded by the
  tour, discarded after. The existing startSandbox (~13729) machinery is the pattern.
- **Step counter:** compute the denominator from steps that will actually SHOW for this user.
- **Defensive auth step:** the signedIn/signedOut split (~TOUR_STEPS[8/9]) should branch on the
  actual #authSlot state, not just is_anonymous (slow auth resolve can mislabel).
- Re-runnable: add a "replay the tour" affordance (settings or ? menu) — hk_tour_done currently
  gates it off forever.
- Update dev/e2e-audit-onboard.js to walk the new unified flow (it documents the current one).

## Also in the first-run neighborhood (queued with this build)
- Welcome-back card was already de-lied (r297). Sign-out lands home w/ fresh-desk toast (r299).
- Surface the collision-checked handle suggester (r300) in the signup flow proper.
