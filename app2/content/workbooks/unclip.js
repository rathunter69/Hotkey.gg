// app2/content/workbooks/unclip.js — lays content/workbooks/fit.js over a state (R8 polish): the
// widths, row heights and wrapped headers that keep a page from clipping a label or showing ####.
// Only ever widens a column or raises a row; a workbook with no fit comes back as it went in.
import { FIT } from './fit.js';

export function unclip(workbookId, state) {
  const fit = !globalThis.__hkNoFit && FIT[workbookId];   // clip-audit --write reads the bare states
  if (!fit || !state || !Array.isArray(state.sheets)) return state;
  for (const sheet of state.sheets) {
    const f = fit[sheet.name]; if (!f) continue;
    sheet.colW = sheet.colW || {};
    for (const c in f.colW) sheet.colW[c] = Math.max(sheet.colW[c] || 0, f.colW[c]);
    if (f.rowH && Object.keys(f.rowH).length) { sheet.rowH = sheet.rowH || {}; for (const r in f.rowH) sheet.rowH[r] = Math.max(sheet.rowH[r] || 0, f.rowH[r]); }
    // typed text wraps (a formula there, which shows a figure, does not); wrapF is text a formula shows
    for (const ref of f.wrap || []) { const cell = sheet.cells && sheet.cells[ref]; if (cell && !cell.formula && typeof cell.value === 'string') cell.wrap = true; }
    for (const ref of f.wrapF || []) { const cell = sheet.cells && sheet.cells[ref]; if (cell && cell.formula) cell.wrap = true; }
  }
  return state;
}
