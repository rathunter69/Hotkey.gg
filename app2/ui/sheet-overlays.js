// app2/ui/sheet-overlays.js — what the grid draws over its headers and cells from the sheet's own
// model, kept pure so the tests read it without a page:
//   outlineMarks   the nested outline (Sheet.groups with levels): a bracket per level on each header,
//                  the ⊖ / ⊕ of every group in its level's lane, the level buttons 1..depth + 1
//   pageBoxes      Page Break Preview (Sheet.view 'pagebreak'): each printed page as a box, its edges
//                  solid for a manual break and dashed for an automatic one, numbered as Excel numbers them
// sheet-view.js turns these into HTML and positions.

/**
 * The outline on one axis ('r' rows, 'c' columns). `max` is the sheet's last row / column.
 * Returns { depth, bars: { [n]: [{ level, end }] }, btns: { [n]: [{ i, level, on }] } }: a band that
 * is open draws its bracket on every row / column it holds (`end` on its last); every band's button
 * sits on the row / column just past it (Excel's summary row below), or just before when the band
 * ends on the sheet's edge; `on` is a collapsed band (⊕).
 */
export function outlineMarks(sheet, axis, max) {
  const list = (sheet.groups || { rows: [], cols: [] })[axis === 'r' ? 'rows' : 'cols'] || [];
  const k1 = axis === 'r' ? 'r1' : 'c1', k2 = axis === 'r' ? 'r2' : 'c2';
  const bars = {}, btns = {}; let depth = 0;
  const host = (g2, g1) => (g2 < max ? g2 + 1 : g1 > 1 ? g1 - 1 : 0);
  list.forEach((g, i) => {
    const level = g.level || 1; depth = Math.max(depth, level);
    if (!g.collapsed) for (let n = g[k1]; n <= g[k2]; n++) (bars[n] || (bars[n] = [])).push({ level, end: n === g[k2] });
    const h = host(g[k2], g[k1]); if (h) (btns[h] || (btns[h] = [])).push({ i, level, on: !!g.collapsed });
  });
  return { depth, bars, btns };
}

/** The header's outline HTML for row / column `n`: its brackets and its buttons. */
export function outlineHeaderHtml(marks, axis, n) {
  let h = '';
  for (const b of marks.bars[n] || []) h += '<i class="ol-bar' + (b.end ? ' end' : '') + '" style="--ol-l:' + b.level + '"></i>';
  for (const b of marks.btns[n] || []) h += '<button type="button" tabindex="-1" class="ol-btn lv' + (b.on ? ' on' : '') + '" style="--ol-l:' + b.level + '" data-ol="' + axis + ':' + b.i + '" title="' + (b.on ? 'Show detail' : 'Hide detail') + '">' + (b.on ? '+' : '−') + '</button>';
  return h;
}

/** The level buttons for the grid's corner: 1 to depth + 1 on each axis that has an outline (data-olv="r:2"). */
export function outlineLevelHtml(rowMarks, colMarks) {
  const strip = (axis, m) => m.depth ? '<span class="ol-lv ' + axis + '">' + Array.from({ length: m.depth + 1 }, (_, i) => '<button type="button" tabindex="-1" class="ol-lv-b" data-olv="' + axis + ':' + (i + 1) + '" title="Show level ' + (i + 1) + '">' + (i + 1) + '</button>').join('') + '</span>' : '';
  return strip('r', rowMarks) + strip('c', colMarks);
}

/**
 * Page Break Preview: the sheet's pages (Sheet.pages) as boxes for the overlay, each with its
 * number, whether its top / left edge is an automatic break (dashed) and the print range they
 * cover (cells outside it are greyed). Null when the sheet is not in Page Break Preview.
 */
export function pageBoxes(sheet) {
  if (!sheet || sheet.view !== 'pagebreak' || typeof sheet.pages !== 'function') return null;
  const pages = sheet.pages(); const range = sheet.printRange();
  const auto = pages.auto || { rows: [], cols: [] };
  return { range, pages: pages.map(p => ({ r1: p.r1, c1: p.c1, r2: p.r2, c2: p.c2, page: p.page, autoTop: auto.rows.includes(p.r1), autoLeft: auto.cols.includes(p.c1) })) };
}
