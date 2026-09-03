# FRAME PIXEL PASS — re-working the card-frame art style

*r452 · art direction study · authored 2026-09-03 in response to Wolf: "a full pass to
re-work the derivative art style for the border templates — pixel vibe, maybe more pixel-y
borders and pixel animations, but keep most of the animations the same / similar."*

Companion prototype: `art/frame-pixel-proto.html` (+ `-dark.png` / `-light.png`).
Sibling effort (separate, do not entangle): `art/rank-pixel-proto.html` — the rank emblems.

---

## 0 · Scope in one paragraph

**31 skins** (`window.HK_FRAMES`, themes.js:815) — 30 of them full theme cards driven by
the `SKINS` table (themes.js:1254) plus **bone**, which is pure CSS. **25 distinct canvas fx
kinds** are live; the engine (`hkInitCardFx`, themes.js:1367) carries 11 further branches
that no skin references any more (`aurora · cosmic · diamondfx · galaxy · gold · holo ·
holorain · lux · pinstripe · stars · sun`) — dead weight worth deleting in the same pass.
This pass changes **presentation only**: no id, no earn gate, no notch taxonomy, no fx *kind*
name moves. Ids are frozen because earned skins persist in `profiles.flair`.

---

## 1 · Inventory

Border/CSS column = the layered treatment in nav.css. Anim column = CSS keyframes and/or the
canvas fx kind (with its particle class inside `hkInitCardFx`). Every skin renders at three
sizes; see §1.1.

### 1a · Rank ladder cards (clustered first in the picker, in rank order)

| id | title | earn gate | border treatment (nav.css) | animation |
|---|---|---|---|---|
| `engraved` | Engraved | LVL ≥ 5 · themes.js:903 | 2px transparent border, `padding-box` steel body + `border-box` 4-stop steel linear; `::before` 115° hairline weave · nav.css:482, 485; lg 647–649 | canvas `sheen` (themes.js:1286) — stateless diagonal highlight bar, ~4.5s |
| `plaque-bronze` | Bronze Plaque | tierBest ≥ 1 (Candidate) · :906 | shared plaque rule nav.css:494–497 + bronze body/border nav.css:498; lg 653–654 | canvas `sheen` (:1281) |
| `plaque-silver` | Silver Plaque | tierBest ≥ 2 (Summer) · :907 | nav.css:500 | canvas `sheen` (:1282) |
| `plaque-gold` | Gold Plaque | tierBest ≥ 3 (First-Year) · :908 | nav.css:502 | canvas `sheen` (:1283) |
| `plaque-plat` | Platinum Plaque | tierBest ≥ 5 (VP) · :909 | icy platinum, nav.css:505 | canvas `sheen` (:1284) |
| `heraldic` | Heraldic · MD | tierBest ≥ 6 **or** 5 daily wins **or** 3 certs · :912 | crimson body + 7-stop **conic** gilt/blood border-box; `::after` masked ring carrying the Cylon arc · nav.css:524, 528–541; lg 676–685 | CSS `hkCylonCircle` 6s linear (`--hkcyl`, @property) + `hkBorderSpin` 17s; canvas `heraldic` — `heraldicfx` sparks + radial menace + gilt glint + lozenge beat (themes.js:1288, draw ~1718) |
| `plaque-diam` | Diamond Plaque | tierBest ≥ 7 (Second-Year) · :910 | near-black carbon + full-spectrum **conic** border · nav.css:510 | CSS `hkBorderSpin` 19s; canvas `blackdiam` — white brilliance twinkles + prismatic caustic (:1285, draw ~1750) |

### 1b · Cosmetic skins — rare

| id | title | earn gate | border treatment | animation |
|---|---|---|---|---|
| `blueprint` | Blueprint | tierBest ≥ 3 · :918 | flat navy body + 2-stop linear border; `::before` 21px repeating grid · nav.css:800, 804 | canvas `sheet` — `sheetfx` diagonal fill-wave + hopping cell cursor (:1257) |
| `crt` | CRT Terminal | LVL ≥ 12 · :919 | phosphor body + green linear border; `::before` 2px scanline stripe · nav.css:808, 812 | canvas `matrix` — column rain, VT323 glyphs (:1258) |
| `cottoncandy` | Cotton Candy | tierBest ≥ 2 or LVL ≥ 3 · :938 | pastel radial + 3-stop linear border · nav.css:908 | canvas `candy` — rising radial puffs, sine alpha (:1274) |
| `bloom` | Growth | LVL ≥ 2 (starter) · :937 | green radial + 3-stop linear border · nav.css:904 | canvas `bloom` — `bloomfx` falling green petals (:1273) |
| `amethyst` | Amethyst | tierBest ≥ 5 · :931 | purple radial + 3-stop linear border · nav.css:884 | canvas `prism` → `facet` — 4 rotating beams + facet sparkles (:1268) |

### 1c · Cosmetic skins — epic

| id | title | earn gate | border treatment | animation |
|---|---|---|---|---|
| `circuit` | Circuit | 1 daily win or LVL ≥ 8 · :916 | teal body + 2-stop linear border; `::before` 22px grid · nav.css:786, 790 | canvas `circuit` — `circ` trace graph + travelling pulses (:1255) |
| `neon` | Neon | 10 daily wins · :917 | magenta/cyan linear border + double glow · nav.css:794 | canvas `neon` — `neonfx` data-rain, floor grid, RGB glitch bars (:1256) |
| `vaporwave` | Vaporwave | tierBest ≥ 2 or LVL ≥ 4 · :921 | 3-stop sunset body + 3-stop border; ornament adds `.hkf-sun` + `.hkf-vgrid` · nav.css:822, 780 | canvas `drive` — perspective horizon grid (:1260) |
| `constellation` | Navigator | tierBest ≥ 4 · :920 | violet radial + 2-stop linear border · nav.css:816 | canvas `navchart` — nearest-neighbour star graph, pulses along links, 14s compass reticle (:1259) |
| `terminal` | Terminal | ≥ 1 cert · :922 | near-black body + amber **conic** border · nav.css:835 | CSS `hkBorderSpin` 15s; canvas `ticker` — bottom-edge Bloomberg tape (:1261) |
| `sakura` | Sakura | 14-day streak · :933 | pink radial + 3-stop linear border · nav.css:892 | canvas `petals` — rotating translucent ellipses, sine sway (:1270, draw ~1636) |
| `goldenhour` | Golden Hour | 7-day streak · :935 | warm bottom radial + 3-stop border · nav.css:896 | canvas `bokeh` — large rising soft discs (:1271) |
| `pearl` | Pearl | perfect-efficiency run · :936 | pale radial + 4-stop linear border · nav.css:900 | canvas `pearl` — 3 hue-cycling sheen bands + dust (:1272) |
| `emerald` | Emerald | chapter c5 (Formulas II) · :939 | green radial + 3-stop border · nav.css:921 | canvas `emerald` → `facet`, green palette (:1278) |
| `foil` | Foil | 1 daily win or 1 cert · :911 | icy body + full-spectrum **conic** border · nav.css:517; lg 659–664 | CSS `hkBorderSpin` 23s + `hkfGlint`/`hkfSheen` hover (nav.css:567–572); canvas `foilfx` — stateless perimeter glints + prismatic wash (:1287) |
| `pro` | PRO · Cosmic | `u.pro` (paid) · :923 | violet radial + 8-stop cosmic **conic** border · nav.css:841 | CSS `hkBorderSpin` **9s** (prominent); canvas `nebula` — 4 additive drifting clouds, 9s hue-cycling aurora band, twinkling stars (:1262, draw ~1848) |

### 1d · Cosmetic skins — legendary + pinnacle + egg

| id | title | earn gate | border treatment | animation |
|---|---|---|---|---|
| `noir` | Noir | tierBest ≥ 5 · :924 | pure black body + grey **conic** border · nav.css:847 | CSS `hkBorderSpin` 29s; **no canvas** (`SKINS.noir` fx-kind is `''`, :1263) |
| `frostbite` | Frostbite | perfect run · :925 | glacial body + ice **conic** border · nav.css:853 | CSS `hkBorderSpin` 21s; canvas `snow` — drifting flakes, sine sway (:1264) |
| `molten` | Molten | 5 daily wins · :926 | magma body + fire **conic** border · nav.css:860 | CSS `hkBorderSpin` 12s + `hkfCrackPulse` 2.4s; canvas `fire` — embers + ash, updraft glow (:1265) |
| `onyx` | Onyx | tierBest ≥ 7 · :932 | black body + gold **conic** border, **deliberately not spinning** · nav.css:888, 954–955 | canvas `onyxfx` — 5 gold marble veins with a travelling glint (:1269) |
| `architect` | Architect | chapter c8 (Full Builds) · :940 | navy body + gold **conic** border · nav.css:913 | CSS `hkBorderSpin` 16s; canvas `draft` — gold blueprint grid + descending scan line (:1276) |
| `boutique` | Elite Boutique | 3 certs · :941 | black body + champagne **conic** border · nav.css:917 | CSS `hkBorderSpin` 16s; canvas `quilt` — diagonal lattice, gold studs, 4.2s sheen front (:1277, draw ~1642) |
| `founder` | Founder | charter / first-200 PRO · :927 | 5px border, oil-slick body + 9-stop rainbow **conic** · nav.css:873 | CSS `hkBorderSpin` **8s** (fastest); canvas `platinum` — 7 lissajous oil blobs on incommensurate ratios + silver glints (:1266, draw ~1665). Ornament swaps the notch for the `★ FOUNDER nnn / 200` serial (themes.js ~1320) |
| `bone` | Bone | perfect run · :913 | **the only light card**: re-scoped palette vars, 1px hairline, `::after` "SILIAN RAIL · BONE · EGGSHELL" · nav.css:547–556 | **none, by design** — "perfectly still" is the joke. Ships no glint, no canvas, no ornament |

### 1.1 · Where each one renders

| surface | class stack | notes |
|---|---|---|
| picker swatch | `hkFrameOrnaments(id,{mini:true})` returns `''` | interior + border only; **no notch, no canvas** — nothing to change |
| ornament grid | corner SVGs on a **56×56 viewBox** (`.hkf-cn`, nav.css:458–464), scaled by `.hk-frame-lg` to 60px (nav.css:640) | only `engraved` / `foil` / `heraldic` / the 5 plaques still draw corner art; the 22 `SKINS` theme cards do not |
| profile / player card | `.uc .hk-frame-<id> .hk-frame-lg`, 5px border (nav.css:659–663, 671) | the reference size — nav.js:843, 878; profile.html:538 |
| leaderboard hero + public card | `hkPlayerCard` full scale (themes.js:1998) | lb.js:560, 693; fx ignited at lb.js:571, 1543 |
| your-card hero / stats / account | `scale:'compact'` | stats.html:340, account.html:261, nav.js:1584 |

Every surface ignites the same canvases through `hkInitCardFx` (themes.js:1367); density is
already tier-scaled by `elabFor` (legendary 1.45 → common 0.78, themes.js:1382–1392).

---

## 2 · The pixel rule set

State it once; each skin is then a one-line application. `PX` = the pixel unit (see decision
D1 — the prototype runs `PX = 3` at 430px card width, `PX = 2` at compact).

**R1 · Silhouette.** `border-radius: 0`. Corners get a 45° stair of two `PX` steps via
`clip-path` on the card. Every inner chip (`.uc-crest`, `.uc-lvl`, `.uc-titlechip span`,
`.uc-meds i`) squares off with it.
**R2 · Border = stepped bands.** No anti-aliased gradient anywhere. Linear borders become
`repeating-linear-gradient(45deg, …)` at `2·PX` stripes; conic borders become
`repeating-conic-gradient` at **16 hard sectors** (never a smooth sweep — 8 sectors leaves a
whole card edge one flat colour, verified in the prototype's first render).
**R3 · Interior.** Every body gradient quantizes to **3 solid stops**, keeping the original's
angle (`160deg` for most, so the seams read as deliberate diagonal bands, not a horizontal
artefact through the name line).
**R4 · Glow → rim + dither.** Delete every `box-shadow` blur. Replace with (a) a **1px lighter
inner rim** (`inset 0 0 0 1px var(--rim)`), and (b) a **dithered 2-band halo** on the host: a
3px solid band plus a 2px `repeating-conic-gradient` checker, both hard-edged.
**R5 · Motion is kept, quantized.** Same property, same period, `steps(n)` timing:
sweeps/orbits `steps(24)`, border spins `steps(16)`, pulses `steps(4)`. Nothing slows down or
speeds up — a Wolf-tuned 6s Cylon orbit stays 6s, it just advances one 15° cell at a time.
**R6 · Canvas = a low-res buffer.** Size the buffer to `ceil(cssPx / PX)`, draw only on integer
coordinates with `fillRect(x,y,1,1)`, upscale with `image-rendering: pixelated`. Nothing can be
anti-aliased because nothing sub-pixel exists. This replaces every `shadowBlur`,
`createRadialGradient` and fractional `arc()` in the fx engine.
**R7 · Particles.** Square sprites, **3 alpha levels** instead of a continuous ramp (pick from a
3-colour array, never compute alpha), **2–3 frame sprite cycles** instead of continuous
rotation, and a **step cadence of 8fps** for position updates (the rAF loop still runs at
display rate; it redraws only when the 125ms frame counter ticks).
**R8 · Soft fields → ordered dither.** Radial clouds and vignettes become 3 quantized bands
with a 2×2 Bayer dither at each boundary — the pixel-art idiom for a gradient.
**R9 · Reduced motion.** Unchanged contract: `prefers-reduced-motion: reduce` draws exactly
one frame and never enters the loop; all `steps()` animations stay inside the existing
`@media (prefers-reduced-motion: no-preference)` blocks (nav.css:538, 928, 945).
**R10 · Type and notch.** The notch keeps its taxonomy (angular vs rounded, nav.css:735–756) —
rounded becomes `border-radius: 0` with a 2-step top chamfer, angular keeps its `clip-path`;
drop shadow becomes a hard `2px 2px 0`. Card names move to the mono stack.

### Per-skin application (one line each)

| id | application of R1–R10 |
|---|---|
| engraved | Steel border → 4 stepped bands; `::before` weave → 1px `PX`-pitch hatch; `sheen` bar → 3-cell hard column, same 4.5s on `steps`. |
| plaque-bronze/silver/gold/plat | Same as engraved with the metal's 4 tones; gem corner SVGs re-cut on a 16×16 grid (shares the `art/rank-pixel-proto.html` grammar). |
| plaque-diam | 16-sector prism conic on `steps(16)`/19s; `blackdiam` twinkles → 1px squares, 3-level; caustic → hard 6-cell column. |
| heraldic | **Reference implementation, see prototype.** Cylon orbit `steps(24)`/6s; radial menace → 3 dithered bands; embers → 1-cell squares, 3-level red/gilt; gilt glint → 3-cell skewed column; lozenge → 1px Bresenham diamond, 2-frame toggle. |
| foil | 16-sector prism on `steps(16)`/23s; `foilfx` perimeter glints → 2×2 sprites on the border ring only; hover glint → `steps(8)`. |
| pro | 16-sector cosmic conic `steps(16)`/9s; nebula clouds → 3 Bayer-dithered alpha bands; aurora band → hard 6-cell column, hue quantized to 6 stops; stars → 1px, 3-frame twinkle. **Subject to decision D3.** |
| founder | Same recipe at 8s; the 7 lissajous blobs keep their incommensurate ratios but render as dithered bands, so the "never visibly loops" property survives. **Subject to D3.** |
| noir | Border only: 16 grey sectors, `steps(16)`/29s. Nothing else to do — it has no canvas. |
| frostbite / molten | `snow` flakes and `fire` embers → 1–2 cell squares, 3-level alpha, 8fps rise; molten's updraft glow → 3 dithered bands; `hkfCrackPulse` → `steps(2)`. |
| onyx | Veins redrawn with integer Bresenham (crisp by construction); travelling glint → 3-cell run along the vein; border stays still (unchanged). |
| architect | Blueprint grid is already `PX`-aligned; scan line → 2-cell hard bar stepping down. |
| boutique | **Prototype'd.** Lattice on integer 45° stepping; studs → 1/2/3-cell squares (3 discrete sizes replace the radius+shadow ramp); sheen front advances one lattice cell per step, same 4.2s. |
| sakura / bloom | **Prototype'd.** Three 2-frame petal sprites (flat · turned · edge) replace continuous rotation; 3 fixed tones replace per-petal alpha; sway is a stepped ±1 cell. |
| goldenhour / cottoncandy | Bokeh/puff discs → dithered 2-band squares (a soft disc is the hardest thing to pixelate; discs shrink ~30% so the dither reads). |
| pearl | The 3 sheen bands → hard 4-cell columns, hue quantized to 6 stops. |
| amethyst / emerald | `facet` beams → 8-way stepped wedges (`steps(8)` rotation); sparkles → 4-pixel plus-signs. |
| circuit | Traces snap to the `PX` grid (they are already axis-aligned); pulses → 2-cell runs that hop cell-to-cell. |
| neon | Data-rain drops → 1×N cell columns; glitch bars → whole-row 1-cell RGB offsets (this one gets *better* pixelated). |
| blueprint | Fill-wave → per-cell hard fill (no `dist` ramp — cells are on or off in 3 levels); cursor already a rect. |
| crt | Already glyph-grid; snap columns to `PX`, drop the trailing alpha ramp to 3 levels. |
| vaporwave | Horizon grid already integer; `.hkf-sun` → a 16×16 stepped-band sun sprite. |
| constellation | Star graph links redrawn with Bresenham; reticle rotates on `steps(16)`. |
| terminal | The tape is type, not particles — keep it, snap the baseline to the `PX` grid, `steps` the scroll. |
| bone | **No change.** It is the still card and the joke depends on it. |

---

## 3 · Migration approach

1. **nav.css, class by class.** Each skin is a self-contained block (nav.css:482–556 for the
   legacy frames, 786–925 for the theme cards). Convert in the picker's rarity order so a
   half-finished pass still looks intentional. Add one shared `.hk-px` rule set (R1/R4/R10) and
   a `--rim` / `--halo1` / `--halo2` custom-property triple per skin. **Do not touch** the notch
   taxonomy lists at nav.css:735–756 — only the shapes inside them.
2. **themes.js, one flag.** Extend the `SKINS` row with a 6th slot (the comment at themes.js:1252
   already documents `extraFlags`) or, cleaner, pass `pixel:true` per skin into `hkInitCardFx`.
   The engine grows a `PXMODE` branch that (a) sizes the buffer to `w/PX × h/PX`, (b) swaps
   `arc()+shadowBlur` for `fillRect` with a 3-colour palette, (c) gates position updates behind
   the 8fps frame counter. The 25 draw branches are then edited in place — none needs to move,
   and `elabFor`'s tier density scaling (themes.js:1382) still applies unchanged.
3. **Frozen surface.** No `HK_FRAMES` id, no `hkFrameEarned` case (themes.js:899–943), no
   `SKINS` key, no fx-*kind* string changes. Earned skins persist in `profiles.flair`; a renamed
   id silently un-skins a paying founder.
4. **Free cleanup in the same pass.** Delete the 11 unreferenced fx branches (`aurora`, `cosmic`,
   `diamondfx`, `galaxy`, `gold`, `holo`, `holorain`, `lux`, `pinstripe`, `stars`, `sun`) — that
   is ~120 lines of `hkInitCardFx` no skin can reach, and 11 branches we would otherwise
   pixel-convert for nothing.
5. **One real constraint found in the prototype:** `clip-path` on the card clips the notch,
   which rides at `top:-15px` (nav.css:646). Either (a) move the ornament notch onto the host
   (`.pc-card` / `.pxhalo` in the proto), or (b) build the stair corners from four corner
   pseudo-elements instead of a clip. (a) is one line in `hkPlayerCard`; (b) is per-skin. The
   prototype uses (a).

### Test impact

| check | impact |
|---|---|
| `dev/check-invariants.js` **C3** (lines 123–142) | **Directly affected.** It parses `SKINS` keys out of themes.js with `/^\s*'?([\w-]+)'?:\s*\[/` and asserts every key has a `.hk-frame-<id> .hkf-tab` rule in nav.css. Keep both shapes: do not reformat the `SKINS` table, and keep each skin listed in one of the two notch-taxonomy selector lists. Adding a 6th `SKINS` slot is safe; moving a key to a different literal form is not. |
| `dev/e2e-audit-visual.js` | No frame/skin/flair references — unaffected today, but this pass is exactly what it should grow to cover (a per-skin screenshot at `.hk-frame-lg`). |
| `dev/e2e-smoke.js` (cosmetic lane, lines 38–131) | Exercises the **skin-unlock celebration + equip** path with `molten` / `onyx` / `cottoncandy` ids and `hk_seen_frames`. Ids unchanged ⇒ passes untouched. Re-run it because it loads every page and fails on console errors — the pixel canvas branch must throw nothing. |
| `dev/check-borders.js`, `dev/e2e-borders.js` | Grid cell borders, not card frames. Unaffected. |
| new | Add a C-check: every `SKINS` key with a non-empty fx kind resolves to a live branch in `hkInitCardFx` (would have caught the 11 dead kinds). |

### Effort estimate

| slice | estimate |
|---|---|
| Shared rule set + `--rim`/halo tokens + the notch/clip fix | 0.5 day |
| nav.css: 31 skin blocks (≈15 min each once the pattern is set) | 1.0 day |
| themes.js: `PXMODE` plumbing in `hkInitCardFx` + the 8fps counter + palette helper | 0.5 day |
| themes.js: 25 draw branches (heraldic, nebula, quilt, petals already prototyped) | 1.5 days |
| Dead-branch deletion + the new invariant check | 0.25 day |
| Visual QA at 3 sizes × light/dark × reduced-motion, plus Wolf rounds | 1.0 day |
| **Total** | **≈4.75 days**, or ~2 days for a first tranche of 8 flagship skins |

Risk is low and reversible: every change is inside a `.hk-frame-<id>` block or a `kind===` draw
branch, and the `pixel:true` flag lets skins convert one at a time in production.

---

## 4 · Three decisions for Wolf

**D1 · Pixel size: 2px or 3px at card scale?**
The prototype is **3px** at the 430px `.hk-frame-lg` card (≈143×77 buffer cells). 3px is
unmistakably pixel art and survives the compact card at 2px without re-authoring. 2px is subtler
and closer to today's texture, but at compact scale it degrades to ~1.3px and the effect
evaporates. Recommendation: **3px at `.hk-frame-lg`, 2px compact, and never scale non-integer.**
This is the one hard constraint pixel art puts on the engine, same as the rank-emblem study.

**D2 · Glows: keep or cut?**
Today every skin carries `0 0 20–34px` coloured `box-shadow` plus per-particle `shadowBlur`. The
pixel rule kills both (1px rim + dithered 2-band halo). In the renders the cards read *sharper*
and more like objects, but they also lose the "expensive" bloom on `pro` / `founder` / `foil`.
Options: (a) cut all glow — most coherent; (b) keep the outer card `box-shadow` only, kill
particle blur — cheapest, and it keeps the prestige cards feeling lit; (c) cut glow everywhere
except the pinnacle three. Recommendation: **(b)** — particle blur is what actually fights the
pixel read; the card's ambient drop shadow does not.

**D3 · Do PRO and Founder go pixel, or stay premium-smooth as a deliberate contrast?**
The strongest argument for staying smooth: `pro` and `founder` are the **paid** and
**first-200** cards, and "the paid tier is the one that isn't pixelated" is a legible,
self-explaining privilege — like a foil card in a pixel set. The strongest argument against:
a single smooth card in a pixel suite reads as *unfinished*, not as *premium*, and the
prototype's pixel nebula holds up well (see the PRO pair in the renders — the dithered clouds
are convincing, and the 16-sector prism border is arguably more striking than the smooth conic).
Recommendation: **go pixel everywhere, and buy the prestige back with density instead** — PRO
and Founder get the finest grid (2px where everything else is 3px) plus the busiest particle
field, which the existing `elabFor` tier scaling (themes.js:1382) already gives us for free.
