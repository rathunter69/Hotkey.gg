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

## 6 · v2 addendum (2026-09-03, same day) — replicas, not a redesign

Wolf's read on v1: "I don't hate it, but I was thinking more detailed pixel-art replicas of the old
rank designs." `art/rank-pixel-proto-v2.html` (+ `-dark.png` / `-light.png`) tests exactly that: a
hand-drawn 32×32 replica of each shipped crest (same heater silhouette, PALS metals verbatim, the
tier's own charge, the DRESS furniture stepped per bucket) beside the crest and a derived 16×16 chip.

**What the renders settle:**
- **Replicas win on consistency, decisively.** One silhouette, one metal ladder, the tier's charge:
  the family reads as *the same crests, pixelated*. v1's eight different plate shapes read as eight
  different games. **Recommendation changes: replicate, don't redesign.**
- **Size verdict:** the replica wins at 64px (card), ties at 96, and loses at 192 (the reveal) —
  32×32 runs out of information there; the grand wings become triangles. So: a **32×32 master** for
  everything up to 96px, and **one more drawing pass per tier at 64×64** for the rank-up reveal and
  the shareable rank card. That is 16 sprites total, not 8.
- **The chip inverts.** At 16px a dark plate cannot hold a bright charge; the chip is solid tier
  metal with the device engraved in deep. It reads better than both the crest and v1 in the
  leaderboard mock. Accept the inversion as the chip's rule.
- **Charge casualties, resolved:** `#REF!` text → a cracked-cell mark; VP's `$` needs a dark halo at
  7×9 and the swords become a subordinate X; Σ redrawn at 6×7 (the first cut read as an S).
- **Escalation is quieter** in pixels — the furniture ladder (rivets → bordure → mantling → wings →
  finials) carries less at 64px than in the crest. Bucket pips + the top-bucket spark do the work at
  small sizes; the 64×64 reveal master is where the furniture gets to show.

**Revised build (§4 amended):** 8 × 32×32 + 8 × 64×64 + 8 × 16×16 masters as pixel arrays in
`themes.js`; `rankEmblem(name, size, bucket)` picks 16 (<32), 32 (<128) or 64 (≥128) and snaps size to
an integer multiple; chips inverted by rule; same signature, same classes, same 23 call sites.
Decision A1 is now: **pixel replicas replace the crests** (recommended) · keep the crests. A2 is
resolved by the size verdict (three masters). A3 stands (hand-drawn off the grammar — the v2 arrays
are the starting point). A4 stands.

---

## 7 · Every native asset — the pixel pass (r454)

_Wolf (2026-09-03): "re-do pixel art for ALL native assets, like the achievement icons as well —
changing from the weird League of Legends theme to something like pixel art from Undertale or
Shattered Pixel Dungeon — like voxel art, with some degree of detail."_

§6 settled the eight rank emblems. This section is **the grammar for the whole set** — written so
that any pixel artist, or any agent, produces work that sits beside everything already drawn.
The inventory it applies to is `dev/ASSET_INVENTORY.md` (**64 assets · ~50 masters · ≈11.5 days**).
The picture is `art/asset-pixel-proto.html` (+ `-dark.png` / `-light.png`), which renders every rule
below beside today's SVG.

### 7.1 · The reference, stated precisely

Two sources, two jobs.

**Shattered Pixel Dungeon — the OBJECTS** (medals, ranks, clocks, the flame, the crown). Its item
sprites are 16×16, and four properties do all the work:
1. a **1px dark outline** on every edge, closed, no gaps;
2. **3–4 body tones only** — a rim light, an inner light, the body, a shade. Never a gradient;
3. **saturated but limited** colour — one hue family per object, plus at most one accent;
4. **silhouette first**: the shape must be identifiable as a black blob. If it isn't, no amount of
   interior detail saves it (the medal wall in the prototype is the proof — the pixel wall's 18
   shapes are distinguishable at 32px where the 18 hexagons are not).

**Undertale — the CHROME** (chips, plates, tabs, the level tile, the desk-grade badge). Flat fields,
hard edges, **no anti-aliasing anywhere**, white-or-ink type on a solid ground, chamfered corners
instead of radii. Undertale's UI is not shaded; it is *cut*. Chrome takes the chamfer and the flat
fill; only objects get the 4-tone shade.

"Voxel-like" in Wolf's note is satisfied by the shading rule, not by isometric drawing: a single
light from **top-left** with a hard shade on the bottom-right reads as volume at 16px and as a
chunky solid at 64px. Nothing here is drawn in isometric — the site's whole visual field is
rectilinear and an isometric medal would fight the spreadsheet.

### 7.2 · Master sizes and the integer-scaling law

| master | used for | rendered at |
|---|---|---|
| **16** — the chip | leaderboard rows, nav pills, inline type, results strips, tab chrome, the favicon | 16 (1×) · 32 (2×) · 48 (3×) · 64 (4×) |
| **32** — the card | medal wall, player card, profile showcase, chapter headers, the level ring | 32 (1×) · 64 (2×) · 96 (3×) |
| **64** — the hero | rank-up reveal, shareable rank card, `og.png` | 64 (1×) · 128 · 192 · 320 |

**THE LAW: a sprite is only ever drawn at an integer multiple of its master.** Pixel art at a
fractional scale is not pixel art; it is a blurred JPEG of pixel art. `hkSprite` snaps, and
`dev/check-invariants.js` gains a check that every size literal in a call site is a permitted
multiple. Several call sites violate it today and must move: `rankEmblem(...,15,...)` → 16,
`rankEmblem(...,20,...)` and `(...,22,...)` → 16 with the row's line-height doing the centring
(`.rk-pips` in `nav.css:249` already re-centres), `rankEmblem(...,26,...)` → 32, `(...,300,...)` →
320 (the 64 master at 5×). `hkBadge(…,20|34|40|46|60)` → 16 · 32 · 32 · 32 · 64.

The renderer emits `<rect>`s, not an image, so `shape-rendering="crispEdges"` guarantees hard edges
**provided the size lands on whole cells**. That is the whole constraint.

### 7.3 · The palette

Three tiers, and only the middle one is new.

**(a) Tier metals — imported verbatim.** `window.HK_METALS` (`themes.js:291`) already carries eight
7-tone metal ramps that the crests and the plaque frames share. Rank sprites and any tier-coloured
chrome use these unchanged. One palette source; a pixel plaque can never drift off its crest.

**(b) Rarity — imported verbatim.** `window.HK_RARITY` (`themes.js:2217`)
`c #5a9a64 · r #5f83bd · e #8d6cb5 · l #c58a3a · m #bd5a4e`. The pixel ring paints these exact five
so the ring, the `.rr` tags and the stats legend never diverge.

**(c) HK-24 — the house palette (new).** Everything else draws from these twenty-four and nothing
else. They were chosen against two hard constraints: legible on **all 27 themes** (18 dark, 9 light
— `themes.js:5+`), and every ramp having a tone dark enough to outline with and light enough to rim
with.

| role | hex | | role | hex |
|---|---|---|---|---|
| `k0` ink | `#14161a` | | `y0` gold · dark | `#8a6212` |
| `k1` shade | `#26282e` | | `y1` gold · mid | `#e0b341` |
| `k2` slate | `#525761` | | `y2` gold · light | `#ffe08a` |
| `k3` steel | `#7c828e` | | `b0` bronze · dark | `#5a3312` |
| `k4` chrome | `#a9aeb9` | | `b1` bronze · mid | `#a06a2e` |
| `k5` bone | `#d5d9e0` | | `b2` bronze · light | `#cf8e4c` |
| `w` spark | `#ffffff` | | `r0` red · dark | `#7d2015` |
| `g0` green · dark | `#0d5c3a` | | `r1` red · mid | `#e0503f` |
| `g1` green · mid | `#2ea36f` | | `r2` red · light | `#ff9c86` |
| `g2` green · light | `#6ec9a0` | | `v0` violet · dark | `#5a3396` |
| `c0` cyan · dark | `#2b6f96` | | `v1` violet · mid | `#a271e8` |
| `c1` cyan · mid | `#63c2e0` | | `v2` violet · light | `#d9c2ff` |

Not arbitrary: `k1 k2 k3 k4` are IRON's `deep/lo/mid/hi` verbatim; `g1` is the Terminal theme's
accent and `g2` the Graphite accent; `y1` is `--warn` on dark; `r1` is the founder brand red. The
palette is the site's own colours, quantised.

**Composed ramps.** A sprite declares one ramp; the renderer maps its four body chars.

| ramp | `d` | `m` | `l` | `h` | accent (`D M L H`) |
|---|---|---|---|---|---|
| `mono` (the default for medals) | k2 | k3 | k4 | k5 | k3 k4 k5 w |
| `steel` | k2 | k3 | k4 | k5 | g0 g1 g2 g2 |
| `gold` | y0 | y1 | y2 | w | r0 r1 r2 r2 |
| `bronze` | b0 | b1 | b2 | y2 | y0 y1 y2 w |
| `green` | g0 | g1 | g2 | k5 | y0 y1 y2 w |
| `red` | r0 | r1 | r2 | y2 | y0 y1 y2 w |
| `violet` | v0 | v1 | v2 | w | c0 c1 k5 w |
| `cyan` | c0 | c1 | k5 | w | y0 y1 y2 w |

One documented exception: the **founder** glyph keeps its four brand hues (`#e0503f #e0902f #3fae6a
#3f8fe0`) because those four dots ARE the brand mark. It is the only sprite allowed off the 24.

### 7.4 · The outline rule

Every solid cell gets a **1px outline in the empty cells around it**, 8-neighbour, closed. The
outline paints **`var(--px-ink)`**, and that token — the ONLY theme-dependent value in the whole
system — takes two values:

```css
:root                        { --px-ink:#14161a }   /* light themes: the deepest house tone */
html[data-dark], :root.dark  { --px-ink:#2a2e35 }   /* dark themes: lifted, never pure black */
```

**Never pure black on dark themes.** `#000` on a `#0c0d0e` Terminal ground makes a hole, not an
edge; `#2a2e35` reads as a drawn line. On the nine light themes `#14161a` is the object's own
shadow. Two values, one token, and the sprite arrays never change.

The prototype's toggle moves exactly this token and nothing else — that is the light/dark proof.

### 7.5 · Shading

Author a **silhouette**, not a shaded drawing. The pipeline shades it, so every sprite in the set
is lit identically:

```
'#' body   'x' accent   '_' hole   '-' groove   '*' spark   (R O G B = founder brand)
```

1. **outline** grows `o` around the silhouette;
2. **shade**: a body cell with an empty neighbour **above or left** → `h` (rim light); else with an
   empty neighbour **below or right** → `d` (shade); else `m` (body);
3. **lift**: an `m` cell touching an `h` cell → `l` (inner light);
4. `-` resolves to `d`, `_` to transparent, `*` to `w`.

Result: a light from top-left, four tones, no hand-tuning, no drift between one artist and the next.
`w` is a **spark, not a tone** — never more than three cells, reserved for the brightest point of a
gem or the hot core of a flame.

**Chrome does not shade.** Plates, chips, tabs and grade badges use step 1 and a flat `m` fill with
one `l` top edge — the Undertale cut, not the SPD volume.

The output of that pipeline — the finished char-row array — is what ships. An artist working in
Aseprite can hand-paint every cell instead and the array format is identical; the pipeline is a
floor on consistency, not a ceiling on craft. Where a form is organic (flame, crescent, crown) the
silhouette is hand-typed; where it is geometric (target, sun, ring, plate) it is generated from
primitives — both land in the same array.

**Every master is drawn by hand at its own size** (r455, §7a.1). The r454 prototype derived
twelve 32s from their 16s by EPX; put beside the six hand-drawn ones the difference was the whole
verdict, and the round was rejected on it. There is no fallback: a size that has not been drawn
is a size that does not exist yet.

### 7.6 · The rarity ring — pixel grammar

Replaces the SVG hex ring (`themes.js:2298–2333`). The ring is a **chamfered frame drawn in the box
2px (chip) or 4px (card) outside the sprite**, painted in `HK_RARITY[tier]`. Escalation is
structural, so it survives greyscale and colour-blindness:

| rarity | 32 master | 16 chip |
|---|---|---|
| common | four 2px corner ticks | four 1px corner ticks |
| rare | 1px closed frame, 2px chamfer | 1px closed frame, 1px chamfer |
| epic | 1px frame **+ corner beads** | 1px frame + corner pixels |
| legendary | **2px** frame + corner beads | 1px frame + corner pixels |
| mythic | 2px frame + beads + **mid-edge fins** + a **5-pixel crown notch** at the apex | 1px frame + corners + one apex pixel |

The r384 finding survives intact: **the ring is the only place rarity is allowed to speak.**

### 7.7 · Colour axis — the medal set

r384 retired per-family colour ("the wall read as a rainbow") and made every earned medal one
engraved steel. **Reversed in r455 (§7a.6)**: each category carries its family hue as the object's own
material, and the rarity ring alone carries rarity. `mono` stays a legal ramp; band 2 of the prototype
keeps it above the family row for reference.

### 7.8 · Animation

Three assets earn it. Nothing else moves.

| asset | frames | period | timing |
|---|---|---|---|
| streak flame | 2 (the lick shifts one cell) | 640 ms | `steps(1,end)` per frame, 50/50 |
| bonus ☆ on discovery | 3 (solid → hollow flash → solid) | 900 ms, one shot | `steps(1,end)`, thirds |
| rank-up reveal shimmer | 2 (a highlight column advances) | as §6 | `steps(1,end)` |

Frames are stacked `<svg>`s toggled with `opacity`, never a transform and never a transition — a
sprite that tweens is a sprite that blurs. Every rule lives inside
`@media (prefers-reduced-motion: no-preference)`; with `reduce` set, **frame 0 alone renders** and no
loop starts. This is the same contract FRAME_PIXEL_PASS R9 froze for the card canvases.

### 7.9 · What stays typographic

Not everything on the site is a game surface, and the pixel identity gets weaker the more it is
sprayed.

- **Certificates** (`cert.html`), **enterprise.html**, **desks.html**, **About**, and all legal
  pages: no sprites at all. A pixel bull on a LinkedIn certificate reads wrong to an L&D buyer
  (§2 already fixed this line; it holds).
- **School chips** (`themes.js:2667`, 12 call sites): a school's monogram is its identity, set in
  its own face. Pixelating "MIT" reads as parody.
- **Desk grades** "S+++ … C-": the **plate** sprites, the **grade stays type**. It is a word.
- **In-sheet marks** (`index.html:378` touch cells, `:24131` navmarks): inside the grid the doctrine
  is Excel realism. `index.html:24129` explicitly freezes the `●` char for keystroke math.
- **The Bloomberg tape** (`terminal` skin), all body copy, all numerals outside a sprite.

### 7.10 · Format: inline arrays, not an atlas

**Recommendation: pixel arrays in `themes.js`, exactly as today's `HK_GLYPHS2` holds SVG paths.**

The constraint that decides it: **the CSP forbids external images** (`_headers`), and the same rule
governs any hosted prototype page. An atlas PNG would have to be a `data:` URI — legal, but it costs
base64 inflation (+33 %) on every page load and loses the `--px-ink` theme swap entirely, because a
raster outline cannot be recoloured. Inline `<rect>`s keep:

- **the theme swap** (one CSS token, no second asset);
- **zero requests** — the arrays ride the `themes.js` the page already loads;
- **crispness at every integer scale** with no `image-rendering` guesswork;
- **diffability** — a sprite change is a readable text diff in review.

Cost: bytes. A 32×32 sprite averages ~1.0 kB of char rows and ~1.6 kB of emitted rect markup;
50 masters ≈ **48 kB** added to `themes.js` (today 2 923 lines / ~150 kB), gzipping to roughly a
fifth of that because char rows compress hard. That is acceptable. If it ever isn't, the escape
hatch is run-length encoding the rows (`'8.4#4.'`), which halves the source without changing the
renderer's contract.

**Naming.** `HK_SPRITES = { '<name>': { '16': [...], '32': [...], ramp:'gold' } }`, names lowercase
and matching the existing glyph ids (`speed`, `crown`, `streak`, …) so `hkGlyph(id)` and
`hkSprite(id)` never disagree. New UI sprites take plain nouns: `dot`, `diamond`, `star`, `flame`,
`swords`, `trophy`, `lock`, `unlock`, `medaldisc`, `plate`, `favicon`.

### 7.11 · The migration

One renderer, five delegating shims, nineteen one-line call-site edits.

```js
hkSprite(name, size, opts)   // opts: {ramp, ring, hollow, locked, frame}
```

1. **`hkSprite`** reads `HK_SPRITES[name]`, picks the master by size (≥32 → the 32 master, ≥64 → 64),
   snaps `size` to an integer multiple, emits run-length-merged `<rect>`s inside
   `<svg shape-rendering="crispEdges">`. `o` → `var(--px-ink)`; every other char → a fixed hex.
2. **`hkGlyph` / `hkBadge` / `hkLevelChip` / `hkLevelRing` / `rankEmblem` keep their signatures**
   and delegate. The ~60 call sites in `nav.js` / `lb.js` / `index.html` / `profile.html` /
   `stats.html` / `account.html` **do not change** — same functions, same classes, same CSS hooks.
   `hkBadge` loses its hex frame and its `G` table; `locked` becomes a 2-tone draw rather than an
   opacity dim.
3. **The 19 emoji/unicode edits** (phase 2) are listed by file:line in ASSET_INVENTORY §5. Each is
   `'🔥'` → `hkSprite('flame',16)`.
4. **Frozen surfaces**: no achievement `id`, no `HK_FRAMES` id, no `HK_RARITY` key, no fx-kind name.
   Earned state persists in `profiles.flair` and `hk_ach_flags`; a renamed id silently un-earns a
   player.
5. **Free cleanup in the same pass**: delete `HK_GLYPHS2.people` and `.keycap` (unreferenced), and
   the 17 legacy one-off marks in `hkBadge`'s `G` table once the campaign chapter badges map onto
   category glyphs.
6. **Gates**: `dev/e2e-audit-rank.js` + `dev/e2e-audit-visual.js` re-baseline on light AND dark;
   `dev/e2e-smoke.js` (it loads every page and fails on a console error); a new invariant asserting
   every `hkSprite` size literal is a permitted multiple. Screenshots to Wolf before merge
   (WORKFLOW §2).

### 7.12 · Effort

| phase | contents | estimate |
|---|---|---|
| **1 · rank + level + medals** | 8 rank replicas at 3 masters (§6) · level chip + ring · 18 category glyphs at 16 and 32 · the 5 rarity rings · `hkSprite` + the five shims | **6.5 d** |
| **2 · UI glyphs + badges** | 3 clocks · ☆ · flame (2 frames) · podium ×3 · ⚔ · 🎓 · 🏆 · 4 hkIcons · desk plate · 4 corner-ornament sets · plaque gems · medallion · founder ★ · the 19 call-site edits | **4.0 d** |
| **3 · marketing** | the favicon master + 4 exports + the `og.png` composition | **1.0 d** |
| | **total** | **≈ 11.5 d** |

Roughly half is drawing and half is plumbing. Phase 1 alone is shippable and is where the visible
win is: it changes the rank pill, the medal wall, the player card and the results card in one move.
Risk is low and reversible — every change is inside `themes.js`, and a sprite that reads badly is
one array away from being redrawn.

### 7.13 · Three decisions for Wolf

**B1 · Format — inline arrays or an atlas PNG?**
Recommendation **inline arrays** (§7.10). The CSP is the decider: an atlas has to be a `data:` URI,
which costs a third more bytes than it saves and gives up the theme-swappable outline entirely.
Arrays keep zero requests, crisp integer scaling, and a reviewable diff. If bytes ever bite, RLE
the rows.

**B2 · Do the 78 medals get unique sprites, or category + ring?**
Recommendation **category + ring, and keep the r384 mono-steel law** — 18 sprites, not 78, and the
wall stays organisable because rarity owns the only colour axis. The prototype's band 4 is the
evidence: 18 pixel shapes are far more distinguishable at 32px than 18 hexagons, which is what the
wall actually needed. Uniques stay available later for the **eight mythics only** — 8 more drawings,
not 78, and it makes the rarest feats feel hand-made. Band 2 of the prototype offers the
counter-option (family tint); it is prettier in isolation and it is exactly the rainbow r384 killed.

**B3 · Do the ☆ and the clocks animate?**
Recommendation **the ☆ yes, the clocks no.** The bonus star is a *discovery* — a 3-frame flash the
moment a hidden route is found earns its keep and is the closest thing the trainer has to a reward
moment. The medal clocks are *state* (which tier a time held); state that blinks in a leaderboard
row is noise. The streak flame is the third and it should animate at 2 frames — it already carries
the "you are on a run" read, and a still flame in a pixel set looks unfinished. Everything else
holds still, and everything that moves obeys `prefers-reduced-motion`.

---

## 7a · The hand-drawn style contract (r455) — supersedes every part of §7 it contradicts

_Wolf on the r454 prototype: "Don't love those assets — some of them look kind of stretched and weird.
The favicon seems okay. I want it to look like hand drawn pixel art bespoke for the project."_

Why round 1 failed, precisely: (1) only 7 of the 18 achievement glyphs had a hand-drawn 32 master —
the other 11 were EPX-upscaled from a 16, and EPX smears every diagonal into the "stretched" read;
(2) the 16s were re-cuts of the generic SVG **symbols** (hexagon badge + abstract glyph) rather than
drawings of things. Round 2 (`art/asset-pixel-proto.html`, `art/asset-style-sheet.png`) is drawn
under the following contract. Where §7.5 ("EPX derivation is the fallback") and §7.7 ("the default
ramp for all 18 glyphs is `mono`") disagree with this section, **this section wins**.

### 7a.1 · Every size is its own drawing

**No algorithmic upscaling anywhere — not EPX, not scale2x, not nearest-neighbour from a smaller
master.** The card/reveal master is drawn at **32×32**; the chip master is drawn at **16×16**; a 64
hero master, when it comes, is drawn at 64. A 16 is not the 32 shrunk and a 32 is not the 16 grown:
the 16 keeps the silhouette and drops the detail by *decision* (the combo chain goes, the target
keeps its arrow, the mug keeps its four dots). The renderer only ever scales by an integer (§7.2).

### 7a.2 · Every glyph is an object

Each category glyph is a **physical object with volume, seen from a 3/4 top-left view**, that belongs
on the hotkey.gg desk: keycaps, spreadsheet cells, ledgers, calculator tape, stopwatches, coffee,
desk lamps, trophies, ribbons, seals, scrolls, coins, gems. A symbol (a Σ, a ⚡, a ☆) may appear
only as something *on* an object — the Σ is carved into a stone tablet, the ⚡ is the legend on a
keycap. The shipped set:

| glyph | object | family | | glyph | object | family |
|---|---|---|---|---|---|---|
| speed | gold keycap, ⚡ legend, motion lines | gold | | daily | desk calendar, torn leaf, ring binding | gold |
| rapid | steel stopwatch, lit gold dial | steel | | crown | crown on a red cushion | gold |
| perfect | cut cyan gem on a stone plinth | cyan | | cert | rolled diploma, gold ribbon, red wax seal | red |
| accuracy | a cell, green tick stamped in it (§7b) | red | | formula | Σ carved into a stone tablet | green |
| explorer | folded map, red pin, dotted route | green | | mastery | mortarboard + tassel on a book | bronze |
| combo | three caps: ctrl · shift · → (§7b) | steel | | moon | crescent + desk lamp; 16 is crescent + stars | violet |
| comeback | rising bars on a plinth, gold arrow | green | | ice | frosted keycap, snowflake legend, icicles | cyan |
| streak | flame burning on a keycap | red | | mouse | a mouse wearing the red X | steel |
| volume | three ledgers stacked | green | | founder | coffee mug with the four brand dots | (brand) |

### 7a.3 · Canvas, fill, baseline, shadow

- **32**: the object fills **24–28 px** of the canvas; its lowest ink row is **row 27**; **row 28** is
  a 1-row cast shadow (`s` → `--px-shadow`, a translucent ink so it sits on every theme).
- **16**: the object fills **12–14 px**; lowest ink row **13**; shadow **row 14**.
- Things that hang (the crescent, the diamond clock) may float above the baseline; the shadow then
  falls under whatever does touch the ground (the lamp, the plinth).

### 7a.4 · Line, light, tone

- A **1-px ink outline (`o`, `#14161a` on light themes, `#2a2e35` on dark)** closes the whole
  silhouette. **Interior edges use the shade tone, never ink** — a seal on a ribbon is edged in the
  seal's own dark, a keycap's top/front crease is a tone change. Ink inside an object is allowed
  only for a legend, a keyhole, a numeral: things that *are* ink.
- **Light from top-left.** Highlight tone on the top-left face, mid tone on the front, shade tone on
  the right/bottom face. A box is drawn oblique: the top face two rows deep and shifted right, the
  right side one to two columns wide, the corner slants no longer than 3 px.
- **Three tones per hue + ink + one highlight.** A sprite's *family* material uses the ramp chars
  `d m l` (and `h` only as the single brightest point); any second or third material uses the fixed
  chars of the house palette (greys `1‥5`, gold `a b c`, red `e f g`, green `i j k`, bronze
  `n u v`, cyan `x z`, violet `X Z V`, paper `p q`). **One or two `w` spark pixels** per sprite, never
  more.
- **Palette = the 24 of §7.3 plus two**: `p1 #eee2c2` paper and `p0 #c9b283` paper·shade — the
  scroll, the ledger pages, the calendar leaf, the map's dotted route. No further additions without
  a motif that cannot be drawn otherwise; the budget was four, two were spent.

### 7a.5 · Curves and diagonals

- **No 1-px-wide 45° diagonal longer than 3 px without a 2-px step** — a run of 4+ single-stepped
  ink cells reads as a jaggy. A diagonal stroke is drawn as 2×2 or 3×2 blocks stepping two cells at
  a time (the Σ's slant, the comeback arrow's shaft); an oblique edge is a 2-then-1 stair.
- **Curves are stepped as pixel circles** (1-2-3 runs: a horizontal run, then 2, then 1, then a
  vertical run), never mirrored blobs. Two sprites with the same silhouette mirrored are one sprite
  drawn lazily; the two side points of the crown differ in shade, not just position.
- **No perfectly symmetric mirror-blobs**: an object has a lit side and a shaded side, and its
  outline shows it.

### 7a.6 · Colour: family tint on the object, rarity on the ring

The founder's call for the medal wall reverses §7.7: **each category carries its family hue** (the
table in 7a.2) and **the rarity RING alone carries rarity**, in `HK_RARITY` verbatim. `mono` remains
a legal ramp (it greys only the family material; paper, gold trim and second hues keep their colour)
and is kept on the prototype's band 2 for reference only.

### 7a.7 · The rings, chips and UI set follow the same hand

- The **rarity ring** keeps the r454 grammar (ticks → frame → beads → double → fins + crown) but is
  **placed cell by cell at 32 (a 40 box) and again at 16 (a 20 box)**; the 16 ring is not the 32
  shrunk. Common = L-bracket corner ticks; rare = 1-px chamfered frame; epic = + 2×2 corner beads;
  legendary = double frame + beads; mythic = + mid-edge fins + a four-point crown at the apex.
- The **level chip** is a hand-drawn tier-metal **keycap plate** with the numeral cut in **ink** on its
  top face (Undertale chrome: type on a solid ground, never shaded type). The **level ring** is a
  fresh 3-cell annulus, sweep quantised to 24 cells, numeral stamped in the centre.
- The **UI set** (pass / pro / legendary clocks, ☆ unfound and found, streak flame ×2 frames,
  ⚔ placement, trophy, cert cap, three podium medals, lock / unlock, timer ×2 frames, target) is
  drawn at 16 by hand as objects — a steel coin, a cut gem, a five-point star, a chalice, a
  ribboned medal, a padlock — under the same line/light/tone rules, no baseline requirement.
- The three animations (flame 2f, ☆ discovery 3f, clock tick 2f) are **redrawn frames**, not
  transformed copies: the flame's lick flips side, the timer's hands move.

### 7a.8 · The favicon

The r209 grid mark, pixel-cut in r454, is **approved as-is** and unchanged.

### 7a.9 · Process — prove the look before drawing forty things

Any future pass (the eight rank replicas at 64, the mythic uniques) starts with a **six-glyph
contact sheet** rendered old-vs-new at 1×, 2× and 4×, reviewed by eye and iterated at least twice
*before* the rest of the set is drawn. Every sprite is checked by rule (row length, closed outline,
45° run length, baseline row, spark count) before it is looked at, and looked at before it ships.
The r455 sheet is `art/asset-style-sheet.png`; the checker's rules are the ones above.

## 7b · Round 2 touch-ups (r455) — four glyphs re-cut

_Wolf: "the one I don't love is the target looking one — seems like it could be simpler or a different
concept." Band 1b of the sheet; render `art/asset-touchups.png`._

- **accuracy — new object.** Three candidates drawn at 32 and 16 beside the old target-on-legs: (a) a cell
  with a green tick, (b) a bullseye cut to a coin with one arrow, (c) a hollow set-square with a pencil.
  **(a) ships** — the only one that survives 16 (one hard silhouette, a bright ground, one high-contrast
  mark; (b) collapses to a red dot at 1×, (c) to grey sticks), and it is the house metaphor: a cell is a
  pixel, this is the cell you got right. Paper face, red frame, green tick; (b) and (c) stay as candidates.
- **combo** — three caps, **ctrl · shift · →** cut in ink, the last struck down and lit gold; a `>` arrowhead
  joins the 3×5 font. The 16 drops the middle cap by decision (§7a.1): two caps read, three smear. The
  runner-up, a chain link joining two caps, stays on the sheet.
- **cert** — tails 6 cells wide, not 3: splayed, a dark fold band, a swallow-tail notch, unequal lengths. Width and fold carry the ribbon; the 1× "pair of legs" read is gone.
- **moon** — horns taper 1-2-3 at both ends; the 16 drops the desk lamp and gives the crescent the canvas, with two stars.
