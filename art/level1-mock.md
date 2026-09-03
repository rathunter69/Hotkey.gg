# Level 1 "The Corridor" — playable preview mock (r455)

`art/level1-mock.html` — one standalone page, a toy of CURRICULUM_V3 §9.1 on a 16×20 fake Excel sheet, in the
pixel language of `art/frame-pixel-proto.html`. Open it and play with the keyboard; the DEV strip at the bottom
jumps between acts, resets, toggles theme (light default / dark) and Mac keycaps. Renders: `level1-mock-act1/2/3.png`,
`-card.png` (act 2 card mid-display, clock ticking under it), `-complete.png`, `-act2-dark.png` (1280×800).

**What it shows.** Act 1 — nine one-press flights through a solid-wall switchback (home bay A1:F9 → model block K12:P20),
a pixel pip at the end of each hall, the block parked dim (the §9.0 reveal). Act 2 — walls dissolve in three checker
steps, the block paints in as the dressed 8-region × Q1–Q4 + FY table, the CAPTURE memo names four targets; a capture
lights on the selection's END STATE only. Act 3 — the home bay outline goes solid, copy → Ctrl+Home → paste → Ctrl+S
(pixel SAVED stamp) → level-complete card. Chrome per §9.0/§3.0.2: act card (scrim + blinking pixel ring on the act's
region, ≤60-word body, keycap strip, any key dismisses, **clock visibly running on the card**), HUD banner (act, beat line,
10 beat pips, ☆ state, mm:ss.t, FIRST PLAY tag), nudge line after three wrong keys, reveal-in of the next act's region.
The act data sits at the top of the script as `ACTS = [{card, beats:[{hud, nudge, good, ok}], reveal}]`.

**What it fakes.** No engine, no seeds (one fixed corridor, one fixed table, one memo pool), no leaderboard/PB/xp
(the "posted" line is copy), the Level 2 button is dead, F5 opens a fake Go To Special where Enter = Constants→Numbers,
Ctrl+A/Space/Home/End are re-implemented mock rules, and the ☆ rule is the simplest possible reading (below).
Google Fonts (VT323 + JetBrains Mono) are linked as in the protos; the renders had them injected offline.

## Decisions to react to

1. **☆ rule.** Mock: *any* plain-arrow move in act 1 forfeits the ☆ (one flag). Alternative: per-hall — forfeit only
   if a hall is *entered and walked*, so a stray tap at a corner is forgiven. Which reading is the level's law?
2. **Capture strictness for beats 4–5.** "The West row of figures" is L13:P13, but the spec's star route is
   Shift+Space (whole row). Mock accepts both the figures-only rectangle and the full row/column. Keep the double
   acceptance, or make the memo say "the West row" and grade only the full row?
3. **Beat 7 route.** The typed figures form a clean rectangle (L13:O20), so Ctrl+Shift+arrows captures it without F5.
   Should the seed plant one hard-coded FY (a blue number in the FY column) so only F5 → Constants gets it in one pass?
4. **Clock under the card.** The card carries a red "clock running 00:xx.x" line and the HUD clock stays uncovered.
   Too much pressure for a first play, or exactly the point (§9.0: the card is on the clock)?
5. **HUD density.** One strip holds act · beat line · 10 pips · ☆ · clock · tag. Nudge appears as a second line.
   Keep everything on one strip, or move pips/☆ into the memo panel and leave the HUD as line + clock?
6. **Memo placement and register.** CAPTURE memo sits right of the sheet and doubles as the checklist in acts 1/3
   (ROUTE / RUN HOME). Right panel vs. a strip under the sheet? Lowercase target names vs. the spec's verb lines?
7. **Dissolve style.** Walls drop in three hard checker steps (0.55 s). Alternative: walls slide out row by row, or
   simply vanish on a one-frame flash. Is the checker the pixel read you want, and is 0.55 s worth its clock cost?
8. **Card body wording.** Three ≤60-word bodies are drafted in the ACTS data (each ends on the act's aha). Rewrite
   freely — the HUD lines (≤10 words + keycaps) and nudges are there too and should be copied, not re-derived, at build.
