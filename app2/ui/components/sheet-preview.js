// app2/ui/components/sheet-preview.js — a still of a sheet on a site page (screenplay 3.0, Home:
// "a live preview of the learner's own sheet as they left it"; Learn: "a preview of the page the
// selected module builds"). The sheet is built on the real engine so every formula shows its
// value and every format reads as the grid paints it; the preview is read-only and never a
// workspace. Pure HTML; the look is components.css.
//
//   sheetPreviewHtml(sheetState, { rows, cols, title })   sheetState: one sheet of a workbook state (content/workbooks)
//   previewOfLesson(lesson, which)                          the lesson's workbook sheet at state.before (or 'after'), or null
import { Sheet } from '../../engine/sheet.js';
import { colLetter } from '../../engine/refs.js';
import { workbookState } from '../../content/workbooks/index.js';
import { esc } from './format.js';

const DEFAULT_ROWS = 18, DEFAULT_COLS = 9;

/** The sheet of a workbook state a lesson works on: the first tab when it holds anything (the page the learner opens on), else the one with the most cells. */
export function sheetOfState(state) {
  if (!state || !Array.isArray(state.sheets) || !state.sheets.length) return null;
  if (Object.keys(state.sheets[0].cells || {}).length) return state.sheets[0];
  const filled = state.sheets.map(s => ({ s, n: Object.keys(s.cells || {}).length })).sort((a, b) => b.n - a.n);
  return filled[0].n ? filled[0].s : state.sheets[0];
}

export function previewOfLesson(lesson, which = 'before') {
  try {
    if (!lesson || !lesson.workbook || !lesson.state || !lesson.state[which]) return null;
    return sheetOfState(workbookState(lesson.workbook, lesson.state[which]));
  } catch (e) { return null; }
}

/** The used range of a sheet state: { rows, cols } (at least the defaults). */
export function usedRange(cells = {}) {
  let rows = 0, cols = 0;
  for (const k of Object.keys(cells)) {
    const m = /^([A-Z]+)(\d+)$/.exec(k); if (!m) continue;
    rows = Math.max(rows, Number(m[2]));
    let c = 0; for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
    cols = Math.max(cols, c);
  }
  return { rows, cols };
}

export function sheetPreviewHtml(sheetState, { rows, cols, title = '' } = {}) {
  if (!sheetState) return '';
  let sheet;
  try {
    sheet = new Sheet({ rows: 120, cols: 30, cells: sheetState.cells, colW: sheetState.colW, rowH: sheetState.rowH, hiddenRows: sheetState.hiddenRows, hiddenCols: sheetState.hiddenCols, freeze: sheetState.freeze, gridlines: sheetState.gridlines, groups: sheetState.groups });
  } catch (e) { return ''; }
  const used = usedRange(sheetState.cells);
  const R = rows || Math.min(Math.max(used.rows + 1, 8), DEFAULT_ROWS), C = cols || Math.min(Math.max(used.cols + 1, 6), DEFAULT_COLS);
  let head = '<tr><th class="sp-corner"></th>';
  for (let c = 1; c <= C; c++) if (!sheet.hiddenCols.has(c)) head += `<th>${colLetter(c)}</th>`;
  head += '</tr>';
  const body = [];
  for (let r = 1; r <= R; r++) {
    if (sheet.hiddenRows.has(r)) continue;
    let tr = `<th>${r}</th>`;
    for (let c = 1; c <= C; c++) {
      if (sheet.hiddenCols.has(c)) continue;
      const ref = colLetter(c) + r;
      const cell = sheet.get(r, c);
      const text = sheet.text(ref);
      const num = typeof cell.value === 'number' || (cell.formula && typeof cell.value === 'number');
      const cls = [num && cell.align !== 'l' && cell.align !== 'c' ? 'num' : '', cell.align === 'r' ? 'num' : '', cell.align === 'c' ? 'mid' : '', cell.bold ? 'b' : '', cell.it ? 'i' : '',
        cell.fontColor ? 'fc-' + cell.fontColor : '', cell.fill ? 'fill-' + cell.fill : '', cell.bb ? 'bb' : '', cell.bt ? 'bt' : '', cell.ca ? 'ca' : ''].filter(Boolean).join(' ');
      // text spills into the empty cells to its right, as Excel draws it; a number never spills
      let span = cell.ca ? Math.min(cell.ca, C - c + 1) : 1;
      if (!cell.ca && text && !num && cell.align !== 'r' && cell.align !== 'c') {
        while (c + span <= C && !sheet.hiddenCols.has(c + span) && !sheet.text(colLetter(c + span) + r) && !sheet.get(r, c + span).fill) span++;
      }
      const style = span > 1 ? ` colspan="${span}"` : '';
      tr += `<td class="${cls}"${style}>${esc(text)}</td>`;
      c += span - 1;
    }
    body.push(`<tr>${tr}</tr>`);
  }
  // the columns keep the sheet's own widths, scaled to the preview
  const shownCols = []; for (let c = 1; c <= C; c++) if (!sheet.hiddenCols.has(c)) shownCols.push(c);
  const total = shownCols.reduce((n, c) => n + (sheet.colW[c] || 64), 0) || 1;
  const colgroup = `<colgroup><col class="sp-rowhead">${shownCols.map(c => `<col style="width:${(100 * (sheet.colW[c] || 64) / total).toFixed(2)}%">`).join('')}</colgroup>`;
  return `<div class="sheet-preview" aria-label="${esc(title || sheetState.name || 'Sheet')}"><div class="sp-scroll"><table class="sp">${colgroup}<thead>${head}</thead><tbody>${body.join('')}</tbody></table></div>${sheetState.name ? `<div class="sp-tab">${esc(sheetState.name)}</div>` : ''}</div>`;
}
