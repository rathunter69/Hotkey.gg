// app2/ui/print-preview.js — the page as it would print (C2 Run 4): the chapter ends on the print
// preview of the KPI page. Pure HTML from a live Sheet and the workbook's pageSetup: the used
// range as a paper table (bold, italic, alignment, colours, the total row's top border, number
// formats), the print titles marked, the footer with its field codes filled, the checks cells
// tinted green when they read zero. No interaction; it sits inside the done overlay.
import { dispText } from '../engine/format.js';
import { colLetter, parseRef } from '../engine/refs.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Excel's footer field codes filled for a one-page print. */
export function footerText(section, { file = 'voltline-weekly.xlsx', date = new Date(), tab = 'Report' } = {}) {
  const d = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  return String(section || '').replace(/&\[File\]/gi, file).replace(/&\[Date\]/gi, d).replace(/&\[Page\]/gi, '1').replace(/&\[Pages\]/gi, '1').replace(/&\[Tab\]/gi, tab);
}

/** The rows a titlesRows string names ('$1:$4' → [1, 4]), or null. */
const titleRows = t => { const m = /^\$?(\d+):\$?(\d+)$/.exec(String(t || '').trim()); return m ? [+m[1], +m[2]] : null; };

/**
 * @param {import('../engine/sheet.js').Sheet} sheet  the sheet to print (the Report)
 * @param {object} pageSetup  the workbook's settings.pageSetup
 * @param {{ checks?: string[], file?: string, tab?: string }} opts  checks: the cells tinted green when 0
 */
export function printPreviewHtml(sheet, pageSetup = {}, opts = {}) {
  // the printed extent: the last row and column holding text (a bold pass over an empty row is not content)
  const used = { r: 1, c: 1 };
  for (const k in sheet.cells) { const p = parseRef(k), cell = sheet.cells[k]; if (!p || !cell || (cell.value == null || cell.value === '') && !cell.formula) continue; if (p.r > used.r) used.r = p.r; if (p.c > used.c) used.c = p.c; }
  const checks = new Set(opts.checks || []);
  const tr = titleRows(pageSetup.titlesRows);
  const colsShown = [];
  for (let c = 1; c <= used.c; c++) if (!sheet.hiddenCols.has(c)) colsShown.push(c);
  const totalW = colsShown.reduce((a, c) => a + (sheet.colW[c] || 64), 0) || 1;
  let rows = '';
  for (let r = 1; r <= used.r; r++) {
    if (sheet.hiddenRows.has(r)) continue;
    let tds = '';
    let skip = 0;
    for (const c of colsShown) {
      if (skip > 0) { skip--; continue; }
      const cell = sheet.get(r, c) || {};
      const ref = colLetter(c) + r;
      const text = dispText(cell);
      const st = [];
      if (cell.bold) st.push('font-weight:700');
      if (cell.it) st.push('font-style:italic');
      if (cell.bt) st.push('border-top:1px solid #222');
      if (cell.bb || cell.bdbl) st.push(cell.bdbl ? 'border-bottom:3px double #222' : 'border-bottom:1px solid #222');
      if (cell.fontColor === 'blue') st.push('color:#1f4fd8'); else if (cell.fontColor === 'green') st.push('color:#1e7d34'); else if (cell.fontColor === 'red') st.push('color:#c22');
      if (cell.fsz) st.push(`font-size:${Math.round(cell.fsz * 0.85)}px`);
      if (cell.indent) st.push(`padding-left:${6 + cell.indent * 10}px`);
      const num = typeof cell.value === 'number';
      const align = cell.align === 'r' || (num && cell.align !== 'l' && cell.align !== 'c') ? 'right' : cell.align === 'c' ? 'center' : 'left';
      st.push('text-align:' + align);
      let colspan = 1;
      if (cell.ca && cell.ca > 1) { colspan = Math.min(cell.ca, colsShown.length - colsShown.indexOf(c)); skip = colspan - 1; st.push('text-align:center'); }
      const cls = [];
      if (checks.has(ref)) cls.push(num && Math.abs(cell.value) < 1e-9 ? 'pp-ok' : 'pp-bad');
      if (tr && r >= tr[0] && r <= tr[1]) cls.push('pp-title');
      tds += `<td class="${cls.join(' ')}" style="${st.join(';')}"${colspan > 1 ? ` colspan="${colspan}"` : ''}>${esc(text)}</td>`;
    }
    rows += `<tr>${tds}</tr>`;
  }
  const cols = colsShown.map(c => `<col style="width:${((sheet.colW[c] || 64) / totalW * 100).toFixed(2)}%">`).join('');
  const f = pageSetup.footer || {};
  const fo = { file: opts.file, tab: opts.tab };
  const landscape = pageSetup.orientation === 'landscape';
  return `<div class="pp-page${landscape ? ' pp-land' : ''}" aria-label="print preview">
    <table class="pp-sheet"><colgroup>${cols}</colgroup><tbody>${rows}</tbody></table>
    <div class="pp-footer"><span>${esc(footerText(f.left, fo))}</span><span>${esc(footerText(f.centre, fo))}</span><span>${esc(footerText(f.right, fo))}</span></div>
  </div>
  <div class="pp-cap">${landscape ? 'Landscape' : 'Portrait'} · ${pageSetup.scaling === 'fit' ? `fit to ${pageSetup.fitWide || 1} page wide` : `${pageSetup.adjustTo || 100}%`}${tr ? ` · rows ${tr[0]}–${tr[1]} repeat` : ''}${pageSetup.printGridlines ? ' · gridlines print' : ''}</div>`;
}

/** The first thing a careful associate would flag on the page, from a state diff (diffStates output), in one line. */
export function associateLine(diffs, sheetName = 'Report') {
  const own = (diffs || []).filter(d => d.sheet === sheetName || d.sheet === '*');
  if (!own.length) return 'Nothing to flag: the associate would have sent it as it is.';
  const d = own[0];
  const where = d.sheet === '*' ? '' : ` on ${d.sheet}`;
  if (d.kind === 'cell') {
    const a = d.a || {}, b = d.b || {};
    let what;
    if (!d.a && d.b) what = `${d.key} is empty where ${b.formula ? 'a formula' : 'a value'} belongs`;
    else if (d.a && !d.b) what = `${d.key} holds something the page does not need`;
    else if (String(a.formula || '') !== String(b.formula || '')) what = `${d.key} ${b.formula ? 'does not hold the formula the page needs' : 'holds a formula where a value belongs'}`;
    else if (a.value !== b.value) what = `${d.key} reads differently from the feed`;
    else if (a.fontColor !== b.fontColor) what = `${d.key} is the wrong color for what it holds`;
    else if (a.fmtStyle !== b.fmtStyle || a.decimals !== b.decimals) what = `${d.key}'s number format is off the house style`;
    else what = `${d.key}'s formatting is off the house style`;
    return `The associate would have flagged ${what}${where}.`;
  }
  const byKind = { colW: 'the column widths', rowH: 'the row heights', gridlines: 'gridlines still showing', freeze: 'the panes not frozen at the heads', groups: 'the outline', hiddenCols: 'hidden columns', hiddenRows: 'hidden rows', settings: 'the print set-up', sheets: 'the sheet order' };
  return `The associate would have flagged ${byKind[d.kind] || d.kind}${where}.`;
}

export { parseRef };
