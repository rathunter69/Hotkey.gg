# RANK ART DIRECTION — heraldic crests vs pixel sprites (r451 memo, decision pending)

_Wolf (2026-09-03): "I think it might make more sense and be more visually appealing to have more
of an 8-bit pixel art style like Undertale, but curious what you think." This memo is the answer
plus the prototype that makes the decision a picture: `art/rank-pixel-proto.html` (open it from a
local server; `../themes.js` supplies today's crests for the side-by-side) and its renders
`art/rank-pixel-proto-dark.png` / `-light.png`. Spec history: `dev/ART_SPEC.md` (r118 — the
LoL-grade commissioning brief), `art/rank-proto.html` (iteration 8 of the crests that shipped)._

## 1 · What exists today

Eight generative SVG **heraldic crests** (`themes.js` `rankEmblem(name, size, bucket)`, ~120 lines
of devices + dress tables): tier metal palettes (iron → bronze → silver → gold → amethyst →
platinum → crimson → diamond), an escalating "dress" grammar per bucket (rivets → bordure →
mantling → wings → finials), engraved charges (#REF! · keycap · #### · crossed arrows · ↵ · $ over
swords · bull · Σ gem), and three bucket pips. Rendered at **23 call sites** across
`index.html` / `nav.js` / `lb.js` / `profile.html` / `stats.html` / `account.html` at sizes
13 · 15 · 16 · 20 · 22 · 26 · 60 · 64 · 96 · 300. They are polished, theme-safe and fully built.

## 2 · My view

**Go pixel — for the rank system and, later, the achievement wall — but decide from the render,
not the argument.** The case:

- **Tone match.** The ladder is already a joke with teeth (MBA Associate on the floor, MD "can't
  use Excel", Second-Year Analyst the final boss, mottos COOKED / GLAZED). The crests read
  League-of-Legends-serious; a sprite reads playful-competitive, which is what the copy is. The
  speedrun / leaderboard / "no mouse allowed" identity is a gamer identity; pixel art is its
  native dress.
- **Conceptual fit.** A cell is a pixel. A spreadsheet IS a pixel grid. The style makes the
  product's central metaphor literal in a way no other style can.
- **Small-size legibility.** The prototype's 16px chip row is the finding: the sprites' silhouettes
  are MORE distinct than the crests' at the sizes the product uses most (nav pill, leaderboard
  rows) — eight recognisable shapes vs eight variations on a shield. The crest system needed
  bucket pips to carry the small-size read; the sprites carry it in the plate shape.
- **Production economics.** 43 achievements exist and have generic category glyphs. A 16×16
  sprite grammar makes unique medal art cheap and consistent (a few hours per dozen), where the
  crest system would need bespoke vector work per medal. Card skins and the certificate seal can
  share the grammar.
- **Distinctiveness.** Dark-mode-SaaS-with-crests is a crowded look; a pixel identity on a
  banker's tool is memorable, and memorable is the cheapest marketing a bootstrapped product has.

The honest costs, which the prototype also shows:

- **Large sizes lose "premium".** At 96–300px (player-card hero, rank-up reveal, shareable rank
  card) the crests look like a $50k art budget and the sprites look like a Game Boy. Two
  mitigations: (a) a second, larger master (32×32 or 48×48) for hero sizes — standard in games
  (icon + portrait), so hero art gets detail while chips stay 16×16; (b) lean into it: chunky
  scale, a 1px dark outline, and animation (a 2-frame idle shimmer on the rank-up reveal) make
  pixel art feel deliberate rather than low-res.
- **The enterprise / certificate surfaces.** A pixel bull on a LinkedIn certificate reads wrong to
  an L&D buyer. Rule: rank art lives on GAME surfaces (pill, boards, player card, results,
  rank-up); certificates, `enterprise.html`, `desks.html` and the About page stay typographic.
  Skins on the player card are already "gamer" (nebula, oil-slick, sakura) — nothing there breaks.
- **Integer scaling is a hard engine constraint.** Pixel art blurs at non-integer scales. The
  call-site sizes must snap: 13/15/16 → 16 (1×), 20/22/26 → 32 is too big for those rows, so those
  chips render at 16 with the box padded — the rows have the line-height (`.rk-pips` CSS already
  re-centres a crest on its text line); 60/64 → 64 (4×); 96 (6×); 300 → 288 (18×) or the larger
  master at 6×. `svgOf()` in the prototype renders rects with `shape-rendering:crispEdges`, so the
  browser never anti-aliases — but the SIZE has to be a multiple of the base or the rects land on
  half-pixels. An invariant in `check-invariants.js` should assert every `rankEmblem(...)` size
  literal is a permitted multiple.
- **Migration cost is real but bounded.** One function (`rankEmblem`) keeps its signature; the
  body becomes a sprite renderer; `RANK_COLORS` stays; the bucket-dress tables go. `e2e-audit-rank.js`
  and the visual audit re-baseline. `hkLevelChip` / `hkLevelRing` (level, not rank) can follow or
  stay flat — they are already flat tiles and coexist fine.
- **Both themes.** The 1px `deep` outline is what makes a sprite sit on light AND dark (the render
  shows both). Keep it; never ship an outline-less sprite.

**Not recommended:** keeping both systems (a skin toggle). The r363 consolidation law exists
because "so many systems" was a real complaint; two rank-art grammars is exactly that.

## 3 · What the prototype is, and is not

It is a **grammar test**, generated in code so every tier follows the same rules: plate silhouette
escalates (cell → keycap → hex → shield → banded → winged → crowned → gem), auto highlight/shadow
rim from the mask, a 7×7 charge in the tier device, three bucket pips on the bottom row, one white
spark pixel for the top bucket. It is not final art: a pixel artist (or a careful hour per tier
in Aseprite) would redraw the charges with sub-pixel intent, add a second 32×32 master for hero
sizes, and tune the palettes (the diamond tier needs more contrast against the light theme).

## 4 · If Wolf says yes — the build (one round, ~one session)

1. **Masters**: eight 16×16 sprites (chip) + eight 32×32 (hero), as pixel arrays in `themes.js`
   (no image assets — keeps the theme-safe outline swap and the zero-request render). Bucket =
   pips + one spark; no per-bucket dress.
2. **Renderer**: `rankEmblem(name, size, bucket)` → picks the master by size (≥64 → 32×32),
   snaps size to an integer multiple, emits `<svg shape-rendering="crispEdges">` rects. Same
   signature, same `.rank-emblem` / `.rk-pips` classes, so the 23 call sites do not change.
   `image-rendering: pixelated` on the class for any raster fallback.
3. **Size audit**: sweep the 23 call sites; snap 13/15 → 16, 20/22/26 → 16 (chip rows) or 32
   (cards), 60 → 64, 300 → 288/320; invariant added.
4. **Motion**: the rank-up reveal gets a 2-frame shimmer (CSS `steps()` animation swapping two
   rect groups) — the one place animation earns its keep; `prefers-reduced-motion` honoured.
5. **Achievements phase 2** (separate round): the 8 category glyphs as 16×16 sprites with the
   rarity ring kept; uniques later, as `ART_SPEC.md` always planned.
6. **Gate**: `e2e-audit-rank.js` + `e2e-audit-visual.js` re-baselined on both themes; smoke; the
   cosmetic lane on CI. Screenshots to Wolf before merge (WORKFLOW §2).

## 5 · Decisions for Wolf

| # | question | recommendation |
|---|---|---|
| A1 | direction: pixel sprites replace the crests · keep the crests · pixel for chips only, crests for heroes (two systems) | **pixel replaces**, with a 32×32 hero master; never two systems |
| A2 | hero-size treatment: chunky 16×16 scaled · a 32×32 second master | **32×32 master** for ≥64px |
| A3 | who draws: code-generated grammar (this proto, tuned) · hand-drawn by Wolf/an artist from the grammar | **Wolf hand-draws or commissions off the grammar** — the grammar guarantees consistency; a human hand gives the charges character the generator cannot |
| A4 | order: after the tutorial chapter ships · in parallel (cosmetic lane, no engine overlap) | **parallel is safe** (themes.js only) but the tutorial is the product — art rides second unless Wolf wants the visual win first |
