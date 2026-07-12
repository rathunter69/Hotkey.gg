# RANK & ACHIEVEMENT ART — commissioning spec (r118, for Wolf's icon work)
_Wolf is developing LoL-grade rank art. This is exactly what the engine needs so
the assets drop in with zero rework. Pipeline #38: SVG system stays until these
land; player card v3 (large graphic plates) ships WITH them._

## Deliverable 1 — tier emblems (8, the priority set)
One emblem per tier, ascending visual weight (the LoL read: you can FEEL the
rank distance at a glance):
  1 MBA Associate · 2 Candidate · 3 Summer Analyst · 4 First-Year Analyst ·
  5 Associate · 6 VP · 7 MD · 8 Second-Year Analyst (the summit)
- **Format**: SVG strongly preferred (renders 13px→220px crisp, theme-safe).
  If raster: PNG, 512×512, transparent background.
- **Canvas**: square 1:1, ~8% safe margin all around, emblem optically centered.
- **Silhouette test**: must read at 16px (nav pill) — distinct outline per tier,
  not just palette shifts.
- **Both themes**: sits on light (#e9eaed-ish) AND dark (#292b31-ish) surfaces —
  avoid pure-black or pure-white outer edges, or deliver -light/-dark variants.
- **Style**: flat doctrine applies at chip/pill sizes (no drop shadows/glows).
  Rich full-color treatment is welcome and encouraged for the PLATES (below).
- **Buckets**: Top/Middle/Bottom Bucket pips stay engine-drawn as an overlay —
  emblems don't need bucket variants (but if you want 3 variants per tier,
  the engine can use them: suffix -top/-mid/-bot).
- **Naming**: rank-mba-associate.svg, rank-candidate.svg, rank-summer-analyst.svg,
  rank-first-year-analyst.svg, rank-associate.svg, rank-vp.svg, rank-md.svg,
  rank-second-year-analyst.svg

## Deliverable 2 — rank PLATES (the LoL card moment)
Large graphic card art behind the rank reveal / player card v3 hero:
- 1024×640 (16:10), PNG or SVG, emblem integrated into a scene/backplate.
- These CAN be painterly/dimensional — the flat rule bends inside card plates.
- Naming: rank-{slug}-plate.png
- Used at ~280-420px wide; keep the emblem in the left 40% (text column right).

## Deliverable 3 — achievement medals (phase 2, after tiers)
43 achievements exist; do NOT draw 43 icons first. Start with the 8 category
glyphs (speed, volume, streak, breadth, night-owl, anti, models, formatting) —
the engine renders category glyph + tier ring. Full uniques later if wanted.
- 256×256, same margin/silhouette/theme rules; naming ach-{category}.svg

## Where they plug in (my side, one round)
rankEmblem(name,size,bucket) gets an asset loader with the current generative
SVG as fallback; sizes in use today: 13/20/22/26/28/46/54/84px. Plates mount in
player card v3 + the rank-up celebration. Nothing else moves.

## Handoff
Drop files in repo /art (or send them in chat) + one line on any intended
palette per tier. I wire, cache-bust, and ship the same day.
