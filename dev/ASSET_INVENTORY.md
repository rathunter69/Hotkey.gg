# ASSET INVENTORY — every native drawn asset on hotkey.gg

> **r455 · round 2 of the prototype — hand-drawn.** Round 1 (r454, the page this inventory first
> pointed at) was rejected by Wolf on look: "some of them look kind of stretched and weird … I want it
> to look like hand drawn pixel art bespoke for the project." Two causes, both structural: only 7 of
> the 18 achievement 32s were drawn by hand — the other 11 were **EPX-upscaled from a 16**, and EPX
> smears diagonals into the "stretched" read; and the 16s were **re-cuts of the SVG symbols**
> (hexagon + abstract glyph), not drawings of objects. Round 2 redraws every master by hand at its
> own size (18 × 32, 18 × 16, the 5 rings at both sizes, the level chip and ring, the 15-sprite UI
> set, the three animations' frames) with **no algorithmic upscaling anywhere** and **every glyph a
> physical object** (keycaps, ledgers, a stopwatch, a scroll, a mug). The contract is
> `dev/ART_DIRECTION.md §7a`; the proof sheet is `art/asset-style-sheet.png`. Palette +2 (paper,
> paper·shade). The favicon grid mark was approved as-is. Counts and call sites below are unchanged.

_r454 · authored 2026-09-03 for Wolf's direction: **"re-do pixel art for ALL native assets, like the
achievement icons as well — changing from the weird League of Legends theme to something like pixel
art from Undertale or Shattered Pixel Dungeon — like voxel art, with some degree of detail."**_

**Companions:** the grammar is `dev/ART_DIRECTION.md §7`; the picture is `art/asset-pixel-proto.html`
(+ `-dark.png` / `-light.png`). Prior rounds: `§6` settled the **rank emblems** as pixel replicas
(`art/rank-pixel-proto-v2.html`); `dev/FRAME_PIXEL_PASS.md` shipped the **card frames** in r452.
`dev/ART_SPEC.md` (r118, the LoL commissioning brief) is the thing this supersedes.

Scope of this file: **every asset the site draws itself.** Emoji and unicode used AS ICONS are in
scope — 🔥 ⚔ ☆ ★ ● ◆ 🥇 🎓 🏆 render differently on every OS today, which is the strongest single
argument for sprites: consistency is free once the glyph is ours.

---

## 0 · The counts, at a glance

| phase | what | assets | distinct masters to draw | effort |
|---|---|---|---|---|
| **1 · rank + level + medals** | rank emblems (settled in §6), level chip + ring, the 18 achievement category glyphs, the 5 rarity rings | **8 + 2 + 18 + 5 = 33** | 24 × 16 · 24 × 32 · 8 × 64 (the reveal masters) | **≈ 6.5 d** |
| **2 · UI glyphs + badges** | medal clocks, bonus ☆, streak flame, crown/podium, ⚔, hkIcon set, desk-grade plate, frame corner ornaments + medallion + gems, notch/tab chrome | **26** | 19 × 16 (+ 6 at 32) | **≈ 4.0 d** |
| **3 · marketing** | favicon.svg · favicon-32.png · favicon.ico · apple-touch-icon.png · art/og.png | **5** | 1 × 16 master + one 1200×630 composition | **≈ 1.0 d** |
| — | **total in scope** | **64 assets** | **~50 sprite masters** | **≈ 11.5 d** |
| — | *explicitly out of scope (stays typographic)* | school chips, certificates, enterprise/desks/About/legal, the Bloomberg tape, all body type | — | — |

By today's style: **generative SVG 41** · **emoji 13** · **unicode chars 6** · **raster 4**.

---

## 1 · Phase 1 — rank, level, medals

### 1a · Rank emblems — DECIDED in ART_DIRECTION §6, listed here for completeness

| field | value |
|---|---|
| name | 8 tier crests (MBA Associate → Second-Year Analyst) + `Unranked` |
| rendered | `themes.js:272` `rankEmblem(tierName,size,bucket)` — **25 call sites**: `nav.js:369,631,835,891,892` · `lb.js:363,544,545,695,696,772,780,882,1416` · `index.html:31064,32030` · `profile.html:541,542` · `stats.html:347,348` · `account.html:262,263` · `themes.js:2134` |
| today | generative SVG — heater plate + metal gradients + engraved charge + DRESS furniture + 3 bucket pips |
| sizes in use | 15 · 16 · 20 · 22 · 26 · 60 · 64 · 96 · 300 (+ the 16 default) |
| count | 8 tiers × 3 buckets + Unranked = **25 states, 9 drawings** |
| theme-dependence | none — fixed tier metals (`HK_METALS`, `themes.js:291`); sits on all 27 themes |
| proposed | **16 chip (inverted: solid metal, device engraved in deep) · 32 card · 64 reveal**; palette = `HK_METALS` verbatim; 2-frame shimmer on the rank-up reveal only |
| effort | **L** (already scoped in §6: 24 masters) |
| phase | **1** |

### 1b · Level

| name | rendered | today | sizes | count | theme-dep | proposed pixel treatment | effort | phase |
|---|---|---|---|---|---|---|---|---|
| **level ring** (progress + numeral) | `themes.js:635` `hkLevelRing`; called `index.html:31017` (96) and `index.html:25365` (fallback) | generative SVG · 2 circles + a SMIL `stroke-dashoffset` sweep + a `<text>` numeral | 56 (default) · 96 | 1 | **yes** — `var(--surface2)` track, `var(--accent)` arc | 32 master; the sweep quantises to a **24-cell ring** advanced with `steps(24)` over the same 0.9s; numeral in the 3×5 pixel face. Track/arc keep the CSS vars, so themes still drive it | **M** | 1 |
| **level chip** (tier tile + numeral) | `themes.js:650` `hkLevelChip`; `index.html:30808` (16), `index.html:25365` (64) | generative SVG · one rounded rect in a 6-band level colour + white numeral | 16 · 22 (default) · 64 | 1 (6 colour bands) | no (fixed band hex) | 16 master: a chamfered plate + 3×5 numeral; the 6 bands map to the house ramps (steel/bronze/steel/gold/cyan/violet) | **S** | 1 |

### 1c · Achievement medals — the big one

**78 achievements** (`drills.js:512–637`), drawn from **18 category glyphs** — the medals are
*not* unique art today and need not become unique (see decision C).

| glyph id | medals using it | tier spread |
|---|---|---|
| `daily` | 10 | c·r·e |
| `perfect` | 9 | r·e·l |
| `crown` | 9 | r·e·m |
| `speed` | 8 | r·e·l |
| `volume` | 6 | c·r·e·l |
| `mastery` | 6 | l·m |
| `streak` · `formula` · `explorer` · `cert` | 4 each | c→l |
| `moon` | 3 | r |
| `mouse` · `founder` · `combo` · `accuracy` | 2 each | c·r·m |
| `rapid` · `ice` · `comeback` | 1 each | r·e |

`HK_GLYPHS2` (`themes.js:2225`) defines **20** glyphs; `people` and `keycap` are unreferenced and
should be deleted in the same pass.

| name | rendered | today | sizes | count | theme-dep | proposed pixel treatment | effort | phase |
|---|---|---|---|---|---|---|---|---|
| **category glyph (clean)** | `themes.js:2251` `hkGlyph(id,size,color)`; `stats.html:542`, `themes.js:2432` | generative SVG · a 40×40 stroke path, `fill:none stroke:currentColor stroke-width:2.6` | 34 · 40 · 42 · 44 | 18 | **yes** — `currentColor` / `var(--faint)` when locked | **16 + 32 masters, 18 each**. 1px ink outline (`--px-ink`), 4 body tones, the mono-steel ramp by default (see decision B) | **L** | 1 |
| **hex medal (wall)** | `themes.js:2258` `hkBadge(id,earned,size,color,rarity)`; `index.html:30920,33442` · `nav.js:775,800` · `profile.html:652,670` · `stats.html:544` | generative SVG · a 26-grid hex frame + the scaled glyph + the rarity ring | 20 · 34 · 40 · 46 · 60 | 18 × 5 rarities × earned/locked | **yes** — earned `#828896`, locked `var(--faint)` | the hex frame **retires**; the sprite is the medal and the pixel ring carries rarity. `locked` = the same sprite drawn in 2 tones (ink + `k2`), not opacity | **M** | 1 |
| **rarity ring** | `themes.js:2298–2333` (inside `hkBadge`), palette `HK_RARITY` `themes.js:2217` | generative SVG · scaled outer hexes, vertex beads, edge notches, an apex crown for mythic | rides the badge size | 5 | no — fixed `HK_RARITY` hex | a **chamfered pixel frame** 2px outside the sprite box: common corner ticks → rare thin frame → epic frame + beads → legendary double frame + beads → mythic + edge fins + crown notch. Degrades by rule at 16 | **M** | 1 |
| **medal card (tray + pips)** | `themes.js:2423` `hkMedalCard`; `nav.js:799` · `profile.html:651,669` · `themes.js:2100` | HTML/CSS tray + `hkGlyph` + a row of CSS diamond pips | 30 · 38 · 40 | 1 | yes (tray uses card vars) | tray keeps its CSS; the diamond pips become 3×3 pixel lozenges so they match the ring | **S** | 1 |
| **campaign chapter badge** | `index.html:30920` `hkBadge(c.id,…,20,cCol)` with ids `c1…c8`, `rx`, `flag`, … | generative SVG · the legacy `G` table inside `hkBadge` (17 further one-off marks) | 20 | 17 | yes (caller passes a track colour) | **decision:** either sprite these 17 too (+2 d) or map each chapter to an existing category glyph. Recommend the map | **M** | 1 |

---

## 2 · Phase 2 — UI glyphs, chrome and badges

| name | rendered | today | sizes | count | theme-dep | proposed pixel treatment | effort | phase |
|---|---|---|---|---|---|---|---|---|
| **medal clocks ● ◆ ★** | `index.html:24940–24944` `HK_CLOCK_TIERS`; strip `:24960`, results row `:24974`, PB chip `:24982` `hkClockIcon` | **unicode chars** in inline colours (`#aeb6c0` / `#e0b341` / `#b98bff`) | ~11–14px inline | 3 | no (inline hex) | 16 masters: `dot` (steel) · `diamond` (gold) · `star` (violet). The three ARE the ladder — sprites make the escalation a shape change, not just a colour change | **S** | 2 |
| **bonus ☆** (the hidden route) | checklist `index.html:26714` `.cl-star`; results `:25711` `.rm-bonus`; recap row `:25064` | **unicode ☆** — `.cl-star.on` recolours it | ~12px inline | 2 states | yes (`var(--warn)` when found) | one `star` master, drawn **hollow** for unfound and solid for found; a 3-frame sparkle on the found transition | **S** | 2 |
| **streak flame 🔥** | `nav.js:895` · `lb.js:700` · `profile.html:490` · `stats.html:377` · `account.html:268` (`themes.js:1073` documents "streak stays 🔥") | **emoji** — Apple/Google/Windows draw three different flames | ~11–14px inline | 1 | n/a | 16 master + a **second frame** (the lick shifts one cell) on a 640ms `steps(1)` 2-cycle | **S** | 2 |
| **crown (board #1)** | glyph family `crown` in `HK_GLYPHS2`; 9 medals | generative SVG | see 1c | — | — | covered by 1c | — | 1 |
| **podium 🥇🥈🥉** | `lb.js:794`, `lb.js:829` (`gl=['🥇','🥈','🥉']`) | **emoji** | ~12px inline | 3 | n/a | one `medaldisc` master (disc + two ribbon tails) recoloured gold/steel/bronze with the rank numeral stamped from the 3×5 face | **S** | 2 |
| **placement pill ⚔** | `nav.js:439`; also `lb.js:625,648` and `index.html:25847` | **unicode ⚔** | ~12px inline | 1 | n/a | 16 `swords` master (two crossed blades, steel) | **S** | 2 |
| **cert cap 🎓** | `index.html:30966` (chapter cert badge) · `lb.js:944` (School Standings heading) | **emoji** | ~13px inline | 1 | n/a | reuse the `mastery` mortarboard master, bronze ramp | **S** | 2 |
| **trophy 🏆** | `index.html:32151` (boards CTA) · `stats.html:436` (all-paths line) | **emoji** | ~13px inline | 1 | n/a | 16 `trophy` master, gold ramp | **S** | 2 |
| **hkIcon set** (lock · unlock · timer · target) | `themes.js:1074`; **6 call sites**, all `profile.html:620,707,739,759,909(×2)` | generative SVG · 24-grid, `stroke:currentColor` 2px round — the r397 pass that already de-emoji'd these | `1em` (inherits) | 4 | **yes** — pure `currentColor` | 16 masters. These are the one family that legitimately **could stay** line-SVG (they inherit type colour and sit inside sentences) — see decision note in §7 | **S** | 2 |
| **desk grade chip** (S+++ … C-) | `lb.js:976` `DESK_GRADES`, `lb.js:997` `deskGradeChip`; rendered `lb.js:1038,1183` | HTML `<span>` + CSS class per band | inline type | 11 grades | yes (CSS bands) | the **plate** becomes a chamfered sprite (a 2-tone tier plaque); the grade **stays type** — "S+++" is a word, not a picture. The proto shows the plate with the 3×5 face for comparison | **S** | 2 |
| **frame corner ornaments** | `themes.js:1148` `corners()`, art at `:1153 ENG` `:1158 FOIL` `:1162 HER` `:1179 CHA` | generative SVG on a 56×56 viewBox, bezier line-work | 56 → 60 at `.hk-frame-lg` | 4 sets | no (fixed hex) | re-cut on a **16×16 corner tile** at 4×; FRAME_PIXEL_PASS §2 already reserved this (`"gem corner SVGs re-cut on a 16×16 grid"`) — it was **not** shipped in r452 | **M** | 2 |
| **plaque gems** (bucket) | `themes.js:1242` `gems(P,t,b)` | generative SVG, tier metal | rides the corner | 5 metals × 3 buckets | no | 8×8 gem sprite, 3 cut levels | **S** | 2 |
| **heraldic medallion ◆** | `themes.js:1340–1344` | generative SVG · a 34-grid ring + brand lozenge | 34 | 1 | no | 16 master (ring + lozenge), crimson ramp | **S** | 2 |
| **notch / tab chrome** | `themes.js:1246` `tab()`; taxonomy `nav.css:735–756`; `.hkf-sun`/`.hkf-vgrid` `nav.css:780` | CSS shapes + gradients (r452 squared the radii but kept the shapes) | 3 card scales | 31 skins share 2 shapes | yes (per-skin vars) | the notch keeps its taxonomy; only the **founder ★** inside `★ FOUNDER nnn / 200` (`themes.js:1330`) becomes a sprite | **S** | 2 |
| **capstone ★** | picker tag `index.html:31849` `.pk-captag`; campaign row `index.html:30946` `.camp-capstar`; results `index.html:25725–25727` | **unicode ★** | inline | 1 | yes (`gcol` per group) | the `star` master, tinted by the caller's group colour — one sprite, caller keeps its colour system | **S** | 2 |
| **campaign chapter badge ◈** | `index.html:30966` (`certDone?'🎓':'◈'`) | **unicode ◈** | inline | 1 | no | `diamond` master | **S** | 2 |
| **grid touch/pip marks ●** | `index.html:378` `td.touchcell::after`; `:24131`, `:24143` navmarks | **unicode ●** inside the sheet | 7px | 3 | yes | **LEAVE ALONE.** These live INSIDE the spreadsheet, where the doctrine is Excel realism, not game art (`index.html:24129` explicitly freezes the char for keystroke math) | — | — |
| **school chips** | `themes.js:2667` `schoolChip`; **12 call sites** across `lb.js`, `nav.js`, `account.html`, `profile.html`, `stats.html`, `themes.js` | HTML/CSS coloured monogram disc, per-school typeface | 15 · 18 · 20 · 26 | ~90 schools | yes | **STAYS TYPOGRAPHIC.** A school's monogram is its identity; pixelating "MIT" reads as parody. Only the disc could take the plate treatment, and should not | — | — |

---

## 3 · Phase 3 — marketing / platform marks

| name | rendered | today | sizes | count | theme-dep | proposed pixel treatment | effort | phase |
|---|---|---|---|---|---|---|---|---|
| **favicon.svg** | `<link rel=icon>` on every page | inline SVG · rounded green tile + white sheet frame + one filled cell; **theme-aware** via `prefers-color-scheme` (`favicon.svg:6–13`) | 16 → 64 | 1 | **yes** (media query inside the file) | a 16×16 master, drawn once, emitted as `<rect>`s — the theme swap survives because the two palettes are two token sets. Renders crisp at 16/32/64/96 with no scaling artefact, which the current rounded rect cannot claim at 16 | **S** | 3 |
| **favicon-32.png** | `<link rel=icon sizes=32x32>` | raster 32×32 RGBA | 32 | 1 | no | export the master at 2× | **S** | 3 |
| **favicon.ico** | legacy | raster, 826 B | 16 | 1 | no | export at 1× | **S** | 3 |
| **apple-touch-icon.png** | `<link rel=apple-touch-icon>` | raster 180×180 RGB | 180 | 1 | no | 180 is **not** an integer multiple of 16 (11.25×). Either snap the art to 176 on a 180 canvas with a 2px bleed, or cut a dedicated **20×20** master at 9× | **S** | 3 |
| **art/og.png** | `og:image` / `twitter:image` on every page | raster 1200×630 RGB, 51 kB | 1200×630 | 1 | no | the one place the pixel set becomes a **poster**: mark + wordmark + a rank sprite row at 8×, on the graphite ground. Composed once, exported once | **M** | 3 |

---

## 4 · Already done — do not re-open

| asset | state |
|---|---|
| **31 card frames / skins** — borders, interiors, glows, 25 canvas fx | **SHIPPED r452** (`dev/FRAME_PIXEL_PASS.md`). The pixel buffer, the 16-sector conics, the `steps()` quantisation and the 8fps particle cadence are live. Two items left open there: the 2-step stair corner (blocked on moving the notch out of `hkPlayerCard`) and narrowing the plaque `sheen` |
| **rank emblems** | **DECIDED, not built** — ART_DIRECTION §6 (replicas, three masters). This inventory carries it as phase 1a so the effort total is honest |

---

## 5 · The migration surface

One new renderer replaces four drawing paths:

```
hkSprite(name, size, opts)   // opts: {ramp, ring, hollow, frame, locked}
```

- reads a char-row array from `HK_SPRITES` (a new table in `themes.js`, beside `HK_GLYPHS2`)
- snaps `size` to an integer multiple of the master (16 or 32), picking the 32 master at ≥32
- emits `<svg shape-rendering="crispEdges">` with one `<rect>` per horizontal run
- `o` cells paint `var(--px-ink)`; every other char paints a fixed hex from the house palette

**Existing signatures do not change.** `hkGlyph`, `hkBadge`, `hkLevelChip`, `hkLevelRing`,
`rankEmblem` keep their arguments and their classes, and delegate to `hkSprite` internally — so the
**~60 call sites listed above are untouched** and no page needs an edit for phase 1.

**Call sites that DO need an edit** (the emoji/unicode ones, phase 2): `nav.js:439,895` ·
`lb.js:700,794,829,944` · `profile.html:490` · `stats.html:377,436` · `account.html:268` ·
`index.html:25064,25711,26714,30946,30966,32151,31849` and the three `HK_CLOCK_TIERS.ico` reads.
**19 edits, all one-liners** (`'🔥'` → `hkSprite('flame',16)`).

**Gates:** `dev/e2e-audit-rank.js` + `dev/e2e-audit-visual.js` re-baseline; `dev/e2e-smoke.js`
(console-error gate on every page); a new invariant asserting every `hkSprite(...)` size literal is
a permitted multiple of its master — the same check §6 asked for on `rankEmblem`.
