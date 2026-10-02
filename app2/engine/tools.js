// app2/engine/tools.js — the Formulas and Data tab tools Chapters 3 to 6 drive by keyboard, as
// desktop Excel has them. Headless, like dialogs.js: each dialog is a draft (`session.dlg`) that
// keys edit and OK writes; the views read the draft to paint. installTools(Session) mixes the
// methods into keyboard.js's Session; TOOL_DIALOGS names the dialogs the dispatcher routes here.
//
//   Formula auditing      Trace Precedents (Alt M P), Trace Dependents (Alt M D), one level per press;
//                         Remove Arrows (Alt M A A / P / D); Evaluate Formula (Alt M V); Error
//                         Checking (Alt M K) walking the error cells of the active sheet (M79)
//   Go To Special         Row differences (W) and Column differences (M), against the active cell's
//                         column / row, formulas compared by their relative shape
//   Text to Columns       Alt A E: Delimited / Fixed width, the delimiters, the column data format
//                         (General, Text, Date), Finish
//   Flash Fill            Ctrl+E: the pattern of the example beside the data, or Excel's note
//   Remove Duplicates     Alt A M: one tick box per column, My data has headers, the count note
//   Data Validation       Alt A V V: Allow List with a Source (typed items or a range), the in-cell
//                         drop-down (Alt+↓), and Excel's refusal of an entry off the list
//   Edit Links            Alt A K: the external references ([Book.xlsx]Sheet!A1) and Break Link
//   AutoFilter            Ctrl+Shift+L / Alt A T; the header menu (Alt+↓): values, sort, Number
//                         Filters, Date Filters, Clear; filtered rows hide from SUBTOTAL 101+ and copy
//   Sort                  Alt A S S: Sort by, Order, Add Level, My data has headers
//   Goal Seek             Alt A W G: Set cell, To value, By changing cell; the status, OK / Cancel
//   Data Table            Alt A W T: Row input cell, Column input cell; {=TABLE()} cells; the
//                         calculation option Automatic except for data tables (Alt M X E) and F9
//   PivotTable            Alt N V T: a minimal pivot (one row field, one column field, one value
//                         field with Sum / Count / Average), Refresh (Alt+F5) and GETPIVOTDATA

import { Sheet, CELL_STYLES } from './sheet.js';
import { tokenize, evalFormula, formulaRefs, evaluateStepper, valueText, translateFormula, isErrVal, textToNumber, dateTextValue, parses } from './formula.js';
import { refKey, parseRef, parseRange, rangeText, colLetter } from './refs.js';
import { dispText } from './format.js';
const clone = x => JSON.parse(JSON.stringify(x));
/** The Style dialog's tick boxes and the format fields each one carries (Style Includes, By Example). */
export const STYLE_PARTS = { number: ['fmtStyle', 'decimals', 'numFmt', 'scale'], alignment: ['align', 'wrap', 'indent', 'ca'], font: ['bold', 'it', 'strike', 'uline', 'fontColor', 'fsz'],
  border: ['bt', 'bb', 'bl', 'br', 'ball', 'thick', 'bdbl'], fill: ['fill'], protection: [] };
const STYLE_KEYS = { 'Alt+N': 'number', 'Alt+L': 'alignment', 'Alt+F': 'font', 'Alt+B': 'border', 'Alt+I': 'fill', 'Alt+R': 'protection' };

/** The dialogs this module drives (keyboard.js routes their keys to toolKey). */
export const TOOL_DIALOGS = new Set(['evalfx', 'errcheck', 'texttocols', 'removedup', 'validation', 'dvlist', 'editlinks', 'autofilter', 'sortdlg', 'goalseek', 'datatable', 'pivot', 'newstyle', 'hyperlink', 'ctxmenu']);
/** The dialogs with a text field that keeps the case typed. */
export const TOOL_TYPED = new Set(['newstyle', 'hyperlink', 'editlinks', 'texttocols', 'validation', 'goalseek', 'datatable', 'sortdlg', 'autofilter']);
/** Excel's messages the tools show verbatim. */
export const ERRCHECK_DONE_NOTE = 'The error check is complete for the entire sheet.';
export const FLASH_FILL_NONE_NOTE = "We looked at all the data next to your selection and didn't see a pattern for filling in values for you.";
export const VALIDATION_NOTE = "This value doesn't match the data validation restrictions defined for this cell.";
export const GOALSEEK_FOUND = (cell) => `Goal Seeking with Cell ${cell} found a solution.`;
export const GOALSEEK_NONE = (cell) => `Goal Seeking with Cell ${cell} may not have found a solution.`;
export const DATATABLE_INPUT_NOTE = 'Input cell reference is not valid.';
export const TABLE_CELL_NOTE = "Cannot change part of a data table.";
export const GOALSEEK_FORMULA_NOTE = 'Cell must contain a formula.';
export const GOALSEEK_VALUE_NOTE = 'Cell must contain a value.';
export const GOALSEEK_REF_NOTE = 'Reference is not valid.';
export const BREAK_LINKS_NOTE = 'Breaking links permanently converts formulas and external references to their existing values. Because this cannot be undone, you may want to save a version of this file with a new name. Are you sure you want to break the links?';
export const NO_LINKS_NOTE = 'This workbook contains no links to other files.';
export const TTC_OVERWRITE_NOTE = "There's already data here. Do you want to replace it?";
export const ALLOW = [['any', 'Any value'], ['whole', 'Whole number'], ['decimal', 'Decimal'], ['list', 'List'], ['date', 'Date'], ['time', 'Time'], ['textlen', 'Text length'], ['custom', 'Custom']];
export const DV_DATA = [['between', 'between'], ['notBetween', 'not between'], ['equal', 'equal to'], ['notEqual', 'not equal to'], ['greater', 'greater than'], ['less', 'less than'], ['greaterEq', 'greater than or equal to'], ['lessEq', 'less than or equal to']];
export const DUPLICATES_NOTE = (n, m) => `${n} duplicate value${n === 1 ? '' : 's'} found and removed; ${m} unique value${m === 1 ? '' : 's'} remain${m === 1 ? 's' : ''}.`;
export const NO_DUPLICATES_NOTE = 'No duplicate values found.';

/* ======================================================================== */
/* pure helpers (unit-tested through the Session)                           */
/* ======================================================================== */
const fmtNum = n => Math.round(n * 1e10) / 1e10;
const sameFormulaShape = (fa, ra, fb, rb) => translateFormula(fa, rb.r - ra.r, rb.c - ra.c) === fb;   // the two formulas agree once a is shifted onto b's cell

/**
 * Flash Fill's pattern (Ctrl+E): the example text in `example` is read as pieces of the texts of
 * the same row's other columns (`sources`, left to right) and literal characters between them. A
 * piece is a whole source, a run of letters or digits inside it, or that run upper- / lower- /
 * proper-cased. Returns a function row-texts → filled text, or null when no pattern explains the
 * example (Excel's note). The pattern is confirmed against a second example when one is given.
 */
export function flashFillPattern(examples) {
  const tokensOf = text => { const out = []; const re = /[A-Za-z]+|\d+|[^A-Za-z\d]+/g; let m; while ((m = re.exec(text))) out.push({ t: m[0], at: m.index }); return out; };
  const cases = [['same', x => x], ['upper', x => x.toUpperCase()], ['lower', x => x.toLowerCase()], ['proper', x => x.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (q, a, b) => a + b.toUpperCase())]];
  const pieces = (sources) => {   // every piece the example can be made of, with how to read it again
    const out = [];
    sources.forEach((src, si) => {
      if (!src) return;
      for (const [cs, f] of cases) out.push({ text: f(src), read: row => f(row[si] || '') });
      tokensOf(src).filter(x => /^[A-Za-z\d]+$/.test(x.t)).forEach((tok, k) => { for (const [cs, f] of cases) out.push({ text: f(tok.t), read: row => { const ts = tokensOf(row[si] || '').filter(x => /^[A-Za-z\d]+$/.test(x.t)); return ts[k] ? f(ts[k].t) : null; } }); });   // the k-th word or number of the source
    });
    return out.filter(p => p.text.length > 0).sort((a, b) => b.text.length - a.text.length);
  };
  const parse = (example, sources, depth = 0) => {   // the example as a list of pieces and literals, longest pieces first; literals only between pieces
    if (example === '') return [];
    if (depth > 40) return null;
    for (const p of pieces(sources)) { if (example.startsWith(p.text)) { const rest = parse(example.slice(p.text.length), sources, depth + 1); if (rest) return [p].concat(rest); } }
    const m = /^[^A-Za-z\d]+/.exec(example);   // punctuation and spaces may be literal
    if (m) { const rest = parse(example.slice(m[0].length), sources, depth + 1); if (rest) return [{ lit: m[0] }].concat(rest); }
    return null;
  };
  const first = examples[0]; if (!first || !first.text) return null;
  const plan = parse(first.text, first.sources); if (!plan || !plan.some(p => !p.lit)) return null;
  const fill = row => { let out = ''; for (const p of plan) { if (p.lit) out += p.lit; else { const v = p.read(row); if (v === null) return null; out += v; } } return out; };
  for (const ex of examples.slice(1)) if (fill(ex.sources) !== ex.text) return null;
  return fill;
}

/** Split one text as Text to Columns does: by a set of delimiter characters (consecutive ones as one when `consecutive`), or at fixed-width break positions. */
export function splitForColumns(text, spec) {
  const t = String(text == null ? '' : text);
  if (spec.mode === 'fixed') { const cuts = (spec.breaks || []).slice().sort((a, b) => a - b); const out = []; let last = 0; for (const c of cuts) { if (c <= last || c >= t.length) continue; out.push(t.slice(last, c)); last = c; } out.push(t.slice(last)); return out; }
  const delims = []; if (spec.tab) delims.push('\t'); if (spec.semicolon) delims.push(';'); if (spec.comma) delims.push(','); if (spec.space) delims.push(' '); if (spec.other) delims.push(spec.other);
  if (!delims.length) return [t];
  const out = []; let cur = '', lastDelim = false;
  for (const ch of t) { if (delims.includes(ch)) { if (!(spec.consecutive && lastDelim)) out.push(cur); cur = ''; lastDelim = true; } else { cur += ch; lastDelim = false; } }
  out.push(cur);
  return out;
}

/** Fixed width: the break positions Excel suggests, where every non-empty text has a space (a column of blanks). */
export function suggestBreaks(texts) {
  const len = texts.reduce((m, t) => Math.max(m, t.length), 0); const out = [];
  for (let i = 1; i < len; i++) if (texts.every(t => t === '' || i >= t.length || t[i - 1] === ' ') && texts.some(t => i < t.length && t[i] !== ' ')) out.push(i);
  return out;
}

/* ---------------- AutoFilter criteria ---------------- */
/** Excel's wildcard match for a filter / COUNTIF text: ? one character, * any run, ~ escapes; case-insensitive. */
export function wildMatch(pattern, text) {
  let re = '^'; const p = String(pattern);
  for (let i = 0; i < p.length; i++) { const ch = p[i]; if (ch === '~' && i + 1 < p.length) { re += p[++i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); } else if (ch === '*') re += '.*'; else if (ch === '?') re += '.'; else re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  return new RegExp(re + '$', 'i').test(String(text));
}
/** The text a filter's value list shows for a cell: its display text, (Blanks) for an empty cell. */
export const filterText = cell => { const t = dispText(cell); return t === '' ? '(Blanks)' : t; };
const numOf = v => { if (typeof v === 'number') return v; if (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v))) return Number(v); return null; };
/** One Custom AutoFilter condition against a cell's value: numbers compare as numbers, text with wildcards, case-insensitive (Excel). */
export function filterCond(op, want, cell) {
  const v = cell.value; const wn = numOf(want), vn = typeof v === 'number' ? v : null;
  const t = v == null ? '' : typeof v === 'number' ? dispText(cell) : String(v); const w = String(want == null ? '' : want);
  switch (op) {
    case 'eq': return wn !== null && vn !== null ? vn === wn : wildMatch(w, t);
    case 'ne': return !(wn !== null && vn !== null ? vn === wn : wildMatch(w, t));
    case 'gt': return wn !== null && vn !== null ? vn > wn : (wn === null && vn === null && t.localeCompare(w, 'en', { sensitivity: 'base' }) > 0);
    case 'ge': return wn !== null && vn !== null ? vn >= wn : (wn === null && vn === null && t.localeCompare(w, 'en', { sensitivity: 'base' }) >= 0);
    case 'lt': return wn !== null && vn !== null ? vn < wn : (wn === null && vn === null && t.localeCompare(w, 'en', { sensitivity: 'base' }) < 0);
    case 'le': return wn !== null && vn !== null ? vn <= wn : (wn === null && vn === null && t.localeCompare(w, 'en', { sensitivity: 'base' }) <= 0);
    case 'begins': return wildMatch(w + '*', t);
    case 'nbegins': return !wildMatch(w + '*', t);
    case 'ends': return wildMatch('*' + w, t);
    case 'nends': return !wildMatch('*' + w, t);
    case 'contains': return wildMatch('*' + w + '*', t);
    case 'ncontains': return !wildMatch('*' + w + '*', t);
  }
  return true;
}
/** Does a row's cell pass a column's criterion? `colNums` (the column's numbers, body rows) serves Top 10 and Above / Below Average. */
export function filterMatch(crit, cell, colNums) {
  if (!crit) return true;
  if (crit.kind === 'values') return crit.values.includes(filterText(cell));
  if (crit.kind === 'custom') { const a = filterCond(crit.op1, crit.v1, cell); if (!crit.op2) return a; const b = filterCond(crit.op2, crit.v2, cell); return crit.and ? a && b : a || b; }
  const v = typeof cell.value === 'number' ? cell.value : null; if (v === null) return false;
  if (crit.kind === 'avg') { const m = colNums.length ? colNums.reduce((x, y) => x + y, 0) / colNums.length : 0; return crit.above ? v > m : v < m; }
  if (crit.kind === 'top') {   // Top 10: the n largest (or smallest) items, or the top n percent of the items
    const sorted = colNums.slice().sort((x, y) => crit.bottom ? x - y : y - x);
    const n = crit.pct ? Math.max(1, Math.round(sorted.length * crit.n / 100)) : crit.n;
    const cut = sorted[Math.min(n, sorted.length) - 1]; return cut === undefined ? false : (crit.bottom ? v <= cut : v >= cut);
  }
  return true;
}
/** Sort a column's distinct texts as the value list shows them: numbers (by value) first, then text A to Z, (Blanks) last. */
export function sortFilterItems(items) {
  const rank = it => it.text === '(Blanks)' ? 2 : it.n !== null ? 0 : 1;
  return items.sort((a, b) => (rank(a) - rank(b)) || (rank(a) === 0 ? a.n - b.n : a.text.localeCompare(b.text, 'en', { sensitivity: 'base' })));
}
const AF_OPS = { E: 'eq', N: 'ne', G: 'gt', O: 'ge', L: 'lt', Q: 'le' };   // the Number Filters submenu's letters: Equals, Does Not Equal, Greater Than, Greater Than Or Equal To, Less Than, Less Than Or Equal To
const AF_TEXT_OPS = { E: 'eq', N: 'ne', I: 'begins', T: 'ends', A: 'contains', D: 'ncontains' };   // Text Filters: Equals, Does Not Equal, Begins With, Ends With, Contains, Does Not Contain

/** Goal Seek's search: the x that makes f(x) = target, by secant steps from x0 then bisection; null when none is found. Excel's own tolerance: 0.001 within 100 iterations. */
export function goalSeek(f, x0, target, { maxIter = 100, tol = 0.001 } = {}) {
  const g = x => { const v = f(x); return typeof v === 'number' && isFinite(v) ? v - target : NaN; };
  let a = x0, fa = g(a); if (isNaN(fa)) return null; if (Math.abs(fa) <= tol) return a;
  let b = a === 0 ? 0.01 : a * 1.01, fb = g(b); if (isNaN(fb)) { b = a + 1; fb = g(b); if (isNaN(fb)) return null; }
  for (let i = 0; i < maxIter; i++) {
    if (Math.abs(fb) <= tol) return b;
    if (fb === fa) { b = b + (b - a || 1); fb = g(b); if (isNaN(fb)) return null; continue; }
    const c = b - fb * (b - a) / (fb - fa), fc = g(c);
    if (isNaN(fc) || !isFinite(c)) return null;
    a = b; fa = fb; b = c; fb = fc;
  }
  return Math.abs(fb) <= tol * 10 ? b : null;
}

/* ======================================================================== */
/* the Session methods                                                      */
/* ======================================================================== */
const methods = {
  /** The Alt-walk commands of this module; true when `np` was one of them. */
  toolCommand(np) {
    const S = this.sheet;
    switch (np) {
      case 'MP': this.exitRibbon(false); this.traceArrows('precedent'); return true;
      case 'MD': this.exitRibbon(false); this.traceArrows('dependent'); return true;
      case 'MAA': this.exitRibbon(false); this.removeArrows('all'); return true;
      case 'MAP': this.exitRibbon(false); this.removeArrows('precedent'); return true;
      case 'MAD': this.exitRibbon(false); this.removeArrows('dependent'); return true;
      case 'MV': this.openEvaluate(); return true;
      case 'MK': this.openErrorCheck(); return true;
      case 'MXA': this.settings.calcMode = 'automatic'; this.emit('settings'); this.exitRibbon(false); return true;
      case 'MXE': this.settings.calcMode = 'autoExceptTables'; this.emit('settings'); this.exitRibbon(false); return true;
      case 'MXM': this.settings.calcMode = 'manual'; this.emit('settings'); this.exitRibbon(false); return true;
      case 'AE': this.openTextToColumns(); return true;
      case 'AF': this.exitRibbon(false); this.flashFill(); return true;
      case 'AM': this.openRemoveDuplicates(); return true;
      case 'AVV': this.openValidation(); return true;
      case 'AK': this.openEditLinks(); return true;
      case 'AT': this.exitRibbon(false); this.toggleAutoFilter(); return true;
      case 'ASS': this.openSortDialog(); return true;
      case 'AWG': this.openGoalSeek(); return true;
      case 'AWT': this.openDataTable(); return true;
      case 'NVT': this.openPivot(); return true;
    }
    return false;
  },
  /** One key inside a tool dialog (the dispatcher's normalised key). */
  toolKey(key) {
    switch (this.dialog) {
      case 'evalfx': return this.evaluateKey(key);
      case 'errcheck': return this.errorCheckKey(key);
      case 'texttocols': return this.textToColumnsKey(key);
      case 'removedup': return this.removeDuplicatesKey(key);
      case 'validation': return this.validationKey(key);
      case 'dvlist': return this.dvListKey(key);
      case 'editlinks': return this.editLinksKey(key);
      case 'autofilter': return this.autoFilterKey(key);
      case 'sortdlg': return this.sortDialogKey(key);
      case 'goalseek': return this.goalSeekKey(key);
      case 'datatable': return this.dataTableKey(key);
      case 'pivot': return this.pivotKey(key);
      case 'newstyle': return this.newCellStyleKey(key);
      case 'hyperlink': return this.hyperlinkKey(key);
      case 'ctxmenu': return this.contextMenuKey(key);
    }
  },
  /** A typed character into the draft's focused text field (Backspace removes one). */
  toolType(d, key, fields) {
    if (!fields.includes(d.focus)) return false;
    if (key === 'Backspace') { d[d.focus] = d[d.focus].slice(0, -1); return true; }
    if (key.length === 1) { d[d.focus] = (d[d.focus] || '') + key; return true; }
    return false;
  },
  toolTab(d, key, ring) { const i = Math.max(0, ring.indexOf(d.focus)); d.focus = ring[(i + (key === 'Tab' ? 1 : ring.length - 1)) % ring.length]; },

  /* ---------------- formula auditing: the arrows (Alt M P / D / A) ---------------- */
  /**
   * Trace Precedents / Dependents, one level per press, as Excel draws them: an arrow from each
   * cell (or range, drawn as a box) the active cell reads, or from the active cell to each cell that
   * reads it; the next press adds the next level; nothing more to trace draws nothing. Arrows live on
   * the sheet (`sheet.arrows`: [{kind, from, to, range?, sheet?}]) until removed.
   */
  traceArrows(kind) {
    const S = this.sheet; this.startClock();
    if (!S.arrows) S.arrows = [];
    const a = S.dispActive(); const key = refKey(a.r, a.c);
    const lvl = S.traceLevel && S.traceLevel.key === key && S.traceLevel.kind === kind ? S.traceLevel : { key, kind, frontier: [key] };
    const seen = new Set(S.arrows.map(x => x.kind + '|' + x.from + '|' + x.to + '|' + (x.sheet || '')));
    const next = [];
    const add = arrow => { const id = arrow.kind + '|' + arrow.from + '|' + arrow.to + '|' + (arrow.sheet || ''); if (seen.has(id)) return; seen.add(id); S.arrows.push(arrow); };
    for (const k of lvl.frontier) {
      const p = parseRef(k);
      if (kind === 'precedent') {
        const c = S.get(p.r, p.c); if (!c.formula) continue;
        for (const ref of formulaRefs(c.formula, { rows: S.rows, cols: S.cols })) {
          if (ref.key) { add({ kind, from: ref.key, to: k, sheet: ref.sheet }); if (!ref.sheet) next.push(ref.key); }
          else { const rg = ref.range; const from = refKey(rg.r1, rg.c1); add({ kind, from, to: k, range: { ...rg }, sheet: ref.sheet }); if (!ref.sheet) for (let r = rg.r1; r <= Math.min(rg.r2, S.rows); r++) for (let cc = rg.c1; cc <= Math.min(rg.c2, S.cols); cc++) next.push(refKey(r, cc)); }
        }
      } else {
        for (const kk of Object.keys(S.cells).sort((x, y) => { const X = parseRef(x), Y = parseRef(y); return (X.r - Y.r) || (X.c - Y.c); })) {
          const cell = S.cells[kk]; if (!cell || !cell.formula) continue;
          const reads = formulaRefs(cell.formula, { rows: S.rows, cols: S.cols }).some(ref => !ref.sheet && (ref.key ? ref.key === k : (p.r >= ref.range.r1 && p.r <= ref.range.r2 && p.c >= ref.range.c1 && p.c <= ref.range.c2)));
          if (reads) { add({ kind, from: k, to: kk }); next.push(kk); }
        }
      }
    }
    S.traceLevel = { key, kind, frontier: [...new Set(next)].filter(k2 => S.get(parseRef(k2).r, parseRef(k2).c).formula || kind === 'dependent') };
    this.emit('sheet');
  },
  /** Remove Arrows: all, the precedent arrows or the dependent arrows. */
  removeArrows(which) { const S = this.sheet; this.startClock(); S.arrows = (S.arrows || []).filter(x => which !== 'all' && x.kind !== which); S.traceLevel = null; this.emit('sheet'); },

  /* ---------------- AutoFilter (Ctrl+Shift+L / Alt A T) ---------------- */
  /**
   * Filter on / off: on, the current region around the active cell (or the selection when it is a
   * range) gets a drop-down on each header cell, the header row being its first; off clears every
   * criterion and shows every row, as Excel does.
   */
  toggleAutoFilter() {
    const S = this.sheet; this.startClock(); S.pushUndo();
    if (S.filter) { S.filter = null; S.filterRows = new Set(); S.commit('layout'); return false; }
    const sr = S.selRange(); const a = S.dispActive();
    const rg = sr.r1 === sr.r2 && sr.c1 === sr.c2 ? S.regionAround(a.r, a.c) : { r1: sr.r1, c1: sr.c1, r2: sr.r2, c2: sr.c2 };
    S.filter = { ...rg, crit: {} }; S.filterRows = new Set(); S.commit('layout'); return true;
  },
  /** Recompute the rows the AutoFilter hides from its criteria (every column's must pass). */
  applyFilter() {
    const S = this.sheet; const f = S.filter; const rows = new Set();
    if (f) {
      const nums = {};
      for (const c of Object.keys(f.crit)) { nums[c] = []; for (let r = f.r1 + 1; r <= f.r2; r++) { const v = S.get(r, +c).value; if (typeof v === 'number') nums[c].push(v); } }
      for (let r = f.r1 + 1; r <= f.r2; r++) for (const c of Object.keys(f.crit)) if (!filterMatch(f.crit[c], S.get(r, +c), nums[c])) { rows.add(r); break; }
    }
    S.filterRows = rows;
  },
  /** The rows of the list that pass every column's criterion but `skipCol`'s (the value list of a column shows what the other filters leave). */
  filterRowsPassing(skipCol) {
    const S = this.sheet; const f = S.filter; const out = []; if (!f) return out;
    const nums = {}; for (const c of Object.keys(f.crit)) { nums[c] = []; for (let r = f.r1 + 1; r <= f.r2; r++) { const v = S.get(r, +c).value; if (typeof v === 'number') nums[c].push(v); } }
    for (let r = f.r1 + 1; r <= f.r2; r++) { let ok = true; for (const c of Object.keys(f.crit)) if (+c !== skipCol && !filterMatch(f.crit[c], S.get(r, +c), nums[c])) { ok = false; break; } if (ok) out.push(r); }
    return out;
  },
  /** Alt+↓: the in-cell drop-down: a validation list on the cell, or an AutoFilter header's menu; nothing elsewhere. */
  openDropDown() {
    const S = this.sheet; const a = S.dispActive();
    if (this.openDvList && this.openDvList(a)) return true;
    const f = S.filter; if (f && a.r === f.r1 && a.c >= f.c1 && a.c <= f.c2) { this.openFilterMenu(a.c); return true; }
    return false;
  },
  /**
   * The header's menu as Excel lays it out: Sort A to Z (S), Sort Z to A (O), Clear Filter From
   * "Header" (C), Text / Number Filters (F) with its submenu, Search (E), then the value list with
   * (Select All) first: ↑ ↓ move, Space ticks, Enter is OK, Esc closes.
   */
  openFilterMenu(col) {
    const S = this.sheet; const f = S.filter; this.startClock();
    const rows = this.filterRowsPassing(col); const crit = f.crit[col] || null;
    const seen = new Map();
    for (const r of rows) { const cell = S.get(r, col); const t = filterText(cell); if (!seen.has(t)) seen.set(t, { text: t, n: typeof cell.value === 'number' ? cell.value : null, checked: crit ? crit.kind === 'values' ? crit.values.includes(t) : true : true }); }
    const items = sortFilterItems([...seen.values()]);
    const numeric = items.some(it => it.n !== null) && !items.some(it => it.n === null && it.text !== '(Blanks)');
    this.openDialog('autofilter', []);
    this.dlg = { kind: 'autofilter', col, header: dispText(S.get(f.r1, col)), numeric, items, idx: 0, focus: 'list', search: '', menu: null, custom: null, all: items.every(it => it.checked) };
  },
  autoFilterKey(key) {
    const d = this.dlg; const S = this.sheet; const f = S.filter; if (!d || !f) return;
    const body = { r1: f.r1 + 1, c1: f.c1, r2: f.r2, c2: f.c2 };
    const close = () => this.exitRibbon(false);
    const apply = crit => { S.pushUndo(); if (crit) f.crit[d.col] = crit; else delete f.crit[d.col]; this.applyFilter(); close(); S.commit('layout'); };
    if (d.custom) {   // the Custom AutoFilter dialog: value boxes, And / Or (Alt+A / Alt+O), Tab between, Enter OK
      const c = d.custom;
      if (key === 'Enter') { apply({ kind: 'custom', op1: c.op1, v1: c.v1, and: c.and, op2: c.op2 && c.v2 !== '' ? c.op2 : null, v2: c.v2 }); return; }
      if (key === 'Alt+A') { c.and = true; return; } if (key === 'Alt+O') { c.and = false; return; }
      if (key === 'Tab' || key === 'Shift+Tab') { this.toolTab(c, key, ['v1', 'and', 'v2']); return; }
      if (c.focus === 'and' && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown')) { c.and = !c.and; return; }
      if (c.focus !== 'and') this.toolType(c, key, ['v1', 'v2']);
      return;
    }
    if (d.menu === 'filters') {   // the Text Filters / Number Filters submenu
      const ops = d.numeric ? AF_OPS : AF_TEXT_OPS; const K = key.toUpperCase();
      if (ops[K]) { d.custom = { op1: ops[K], v1: '', and: true, op2: null, v2: '', focus: 'v1' }; d.menu = null; return; }
      if (d.numeric && K === 'W') { d.custom = { op1: 'ge', v1: '', and: true, op2: 'le', v2: '', focus: 'v1' }; d.menu = null; return; }   // Between
      if (d.numeric && K === 'T') { apply({ kind: 'top', n: 10, pct: false, bottom: false }); return; }   // Top 10 with its defaults
      if (d.numeric && K === 'A') { apply({ kind: 'avg', above: true }); return; }
      if (d.numeric && K === 'B') { apply({ kind: 'avg', above: false }); return; }
      if (K === 'F') { d.custom = { op1: 'eq', v1: '', and: true, op2: null, v2: '', focus: 'v1' }; d.menu = null; return; }   // Custom Filter…
      if (key === 'ArrowLeft') d.menu = null;
      return;
    }
    if (d.focus === 'search') {
      if (key === 'Enter') { const shown = d.items.filter(it => wildMatch('*' + d.search + '*', it.text)); apply(shown.length && shown.length < d.items.length ? { kind: 'values', values: shown.map(it => it.text) } : null); return; }
      if (key === 'Tab') { d.focus = 'list'; return; }
      this.toolType(d, key, ['search']); return;
    }
    const K = key.length === 1 ? key.toUpperCase() : key;
    if (K === 'S' || K === 'O') { S.pushUndo(); S.sort(K === 'S' ? 'asc' : 'desc', d.col, body); this.applyFilter(); close(); S.commit('edit'); return; }
    if (K === 'C') { apply(null); return; }
    if (K === 'F') { d.menu = 'filters'; return; }
    if (K === 'E') { d.focus = 'search'; return; }
    if (key === 'ArrowDown') { d.idx = Math.min(d.items.length, d.idx + 1); return; }
    if (key === 'ArrowUp') { d.idx = Math.max(0, d.idx - 1); return; }
    if (key === 'Home') { d.idx = 0; return; } if (key === 'End') { d.idx = d.items.length; return; }
    if (key === ' ') { if (d.idx === 0) { d.all = !d.all; for (const it of d.items) it.checked = d.all; } else { d.items[d.idx - 1].checked = !d.items[d.idx - 1].checked; d.all = d.items.every(it => it.checked); } return; }
    if (key === 'Enter') { const on = d.items.filter(it => it.checked); if (!on.length) return; apply(on.length === d.items.length ? null : { kind: 'values', values: on.map(it => it.text) }); }
  },

  /* ---------------- the Sort dialog (Alt A S S) ---------------- */
  /** Excel's guess for My data has headers: the first row is text throughout and the second row holds something that is not. */
  listHeaders(rg) {
    const S = this.sheet; if (rg.r1 === rg.r2) return false;
    let text = 0, other = 0, below = 0;
    for (let c = rg.c1; c <= rg.c2; c++) { const v = S.get(rg.r1, c).value; if (v === null || v === '') continue; if (typeof v === 'string' && !isErrVal(v)) text++; else other++; const w = S.get(rg.r1 + 1, c).value; if (w !== null && w !== '' && typeof w !== 'string') below++; }
    return text > 0 && other === 0 && below > 0;
  },
  /** The list a Data tool works on: the selection when it is a range, else the current region around the active cell. */
  listRange() {
    const S = this.sheet; const sr = S.selRange(); const a = S.dispActive();
    return sr.r1 === sr.r2 && sr.c1 === sr.c2 ? S.regionAround(a.r, a.c) : { r1: sr.r1, c1: sr.c1, r2: sr.r2, c2: sr.c2 };
  },
  /** What a column is called in a tool's list: its header when the data has headers, else Column C. */
  columnLabel(rg, c, headers) { const t = headers ? dispText(this.sheet.get(rg.r1, c)) : ''; return t || 'Column ' + colLetter(c); },
  /**
   * The Sort dialog: Sort by (a column), Order (A to Z / Z to A, or Smallest to Largest for
   * numbers), Add Level (Alt+A), Delete Level (Alt+D), My data has headers (Alt+H), OK (Enter),
   * Cancel (Esc). Tab walks the fields; the arrows change a combo; a letter jumps to the column that
   * starts with it, as the combo does.
   */
  openSortDialog() {
    const S = this.sheet; this.startClock();
    const rg = S.filter && S.dispActive().r >= S.filter.r1 && S.dispActive().r <= S.filter.r2 ? { r1: S.filter.r1, c1: S.filter.c1, r2: S.filter.r2, c2: S.filter.c2 } : this.listRange();
    const headers = this.listHeaders(rg);
    const a = S.dispActive(); const col = a.c >= rg.c1 && a.c <= rg.c2 ? a.c : rg.c1;
    this.openDialog('sortdlg', []);
    this.dlg = { kind: 'sortdlg', range: rg, headers, levels: [{ col, dir: 'asc' }], cur: 0, focus: 'col' };
  },
  sortDialogKey(key) {
    const d = this.dlg; const S = this.sheet; if (!d) return;
    const rg = d.range; const lvl = d.levels[d.cur];
    if (key === 'Enter') {   // OK: the body (without the header row) sorts by the levels in order
      const body = { r1: rg.r1 + (d.headers ? 1 : 0), c1: rg.c1, r2: rg.r2, c2: rg.c2 };
      this.exitRibbon(false); if (body.r1 >= body.r2) return;
      S.sortBy(d.levels.map(l => ({ col: l.col, dir: l.dir })), body); if (S.filter) this.applyFilter(); S.commit('edit'); return;
    }
    if (key === 'Alt+A') { const used = new Set(d.levels.map(l => l.col)); let c = rg.c1; while (used.has(c) && c < rg.c2) c++; d.levels.splice(d.cur + 1, 0, { col: c, dir: 'asc' }); d.cur++; d.focus = 'col'; return; }   // Add Level
    if (key === 'Alt+D') { if (d.levels.length > 1) { d.levels.splice(d.cur, 1); d.cur = Math.min(d.cur, d.levels.length - 1); } return; }   // Delete Level
    if (key === 'Alt+H') { d.headers = !d.headers; return; }   // My data has headers
    if (key === 'Tab' || key === 'Shift+Tab') {   // the fields of every level, then the tick box and OK
      const fwd = key === 'Tab';
      if (d.focus === 'col' && fwd) d.focus = 'order';
      else if (d.focus === 'order' && fwd) { if (d.cur + 1 < d.levels.length) { d.cur++; d.focus = 'col'; } else d.focus = 'headers'; }
      else if (d.focus === 'headers') d.focus = fwd ? 'ok' : 'order';
      else if (d.focus === 'ok') { if (fwd) { d.cur = 0; d.focus = 'col'; } else d.focus = 'headers'; }
      else if (d.focus === 'order' && !fwd) d.focus = 'col';
      else if (d.focus === 'col' && !fwd) { if (d.cur > 0) { d.cur--; d.focus = 'order'; } else d.focus = 'ok'; }
      return;
    }
    if (d.focus === 'col') {
      if (key === 'ArrowDown') { lvl.col = Math.min(rg.c2, lvl.col + 1); return; } if (key === 'ArrowUp') { lvl.col = Math.max(rg.c1, lvl.col - 1); return; }
      if (key.length === 1) { const K = key.toUpperCase(); const n = rg.c2 - rg.c1 + 1; for (let i = 1; i <= n; i++) { const c = rg.c1 + ((lvl.col - rg.c1 + i) % n); if (this.columnLabel(rg, c, d.headers).toUpperCase().startsWith(K)) { lvl.col = c; return; } } }
      return;
    }
    if (d.focus === 'order') { if (key === 'ArrowDown' || key === 'ArrowUp' || key === ' ') lvl.dir = lvl.dir === 'asc' ? 'desc' : 'asc'; return; }
    if (d.focus === 'headers' && key === ' ') { d.headers = !d.headers; return; }
    if (d.focus === 'ok' && key === ' ') this.sortDialogKey('Enter');
  },
  /** The dialog as the view paints it: each level's column label and order label (numbers sort Smallest to Largest). */
  sortDialogView() {
    const d = this.dlg; if (!d || d.kind !== 'sortdlg') return null; const S = this.sheet; const rg = d.range;
    const numeric = c => { for (let r = rg.r1 + (d.headers ? 1 : 0); r <= rg.r2; r++) { const v = S.get(r, c).value; if (v !== null && v !== '') return typeof v === 'number'; } return false; };
    return { headers: d.headers, cur: d.cur, focus: d.focus, columns: Array.from({ length: rg.c2 - rg.c1 + 1 }, (_, i) => this.columnLabel(rg, rg.c1 + i, d.headers)),
      levels: d.levels.map(l => ({ col: l.col, label: this.columnLabel(rg, l.col, d.headers), dir: l.dir, order: numeric(l.col) ? (l.dir === 'asc' ? 'Smallest to Largest' : 'Largest to Smallest') : (l.dir === 'asc' ? 'A to Z' : 'Z to A') })) };
  },

  /* ---------------- Remove Duplicates (Alt A M) ---------------- */
  /**
   * One tick box per column (Select All Alt+A, Unselect All Alt+U, ↑ ↓ and Space), My data has
   * headers (Alt+M), OK (Enter). A row is a duplicate when every ticked column repeats an earlier
   * row's text, case-insensitively; the later rows go and the rest shift up inside the range.
   */
  openRemoveDuplicates() {
    const S = this.sheet; this.startClock();
    const rg = this.listRange(); const headers = this.listHeaders(rg);
    this.openDialog('removedup', []);
    const cols = []; for (let c = rg.c1; c <= rg.c2; c++) cols.push({ c, checked: true });
    this.dlg = { kind: 'removedup', range: rg, headers, cols, idx: 0 };
  },
  removeDuplicatesKey(key) {
    const d = this.dlg; const S = this.sheet; if (!d) return;
    if (key === 'Alt+A') { for (const c of d.cols) c.checked = true; return; }
    if (key === 'Alt+U') { for (const c of d.cols) c.checked = false; return; }
    if (key === 'Alt+M') { d.headers = !d.headers; return; }
    if (key === 'ArrowDown') { d.idx = Math.min(d.cols.length - 1, d.idx + 1); return; }
    if (key === 'ArrowUp') { d.idx = Math.max(0, d.idx - 1); return; }
    if (key === ' ') { d.cols[d.idx].checked = !d.cols[d.idx].checked; return; }
    if (key !== 'Enter') return;
    const rg = d.range; const keyCols = d.cols.filter(c => c.checked).map(c => c.c);
    this.exitRibbon(false);
    if (!keyCols.length) return;
    const r1 = rg.r1 + (d.headers ? 1 : 0);
    const seen = new Set(); const keep = [], gone = [];
    for (let r = r1; r <= rg.r2; r++) { const k = keyCols.map(c => dispText(S.get(r, c)).toLowerCase()).join('\u0000'); if (seen.has(k)) gone.push(r); else { seen.add(k); keep.push(r); } }
    if (!gone.length) { this.toast(NO_DUPLICATES_NOTE); return; }
    S.pushUndo();
    const rows = keep.map(r => { const row = []; for (let c = rg.c1; c <= rg.c2; c++) row.push(clone(S.get(r, c))); row.r0 = r; return row; });
    for (let i = 0; i < rg.r2 - r1 + 1; i++) {
      const r = r1 + i; const row = rows[i];
      for (let c = rg.c1; c <= rg.c2; c++) { if (!row) { delete S.cells[refKey(r, c)]; continue; } const cell = row[c - rg.c1]; const dr = r - row.r0; if (cell.formula && dr) cell.formula = translateFormula(cell.formula, dr, 0); S.cells[refKey(r, c)] = cell; }
    }
    S.commit('edit');
    this.toast(DUPLICATES_NOTE(gone.length, keep.length));
  },
  /** The dialog as the view paints it: the columns with their labels and ticks. */
  removeDuplicatesView() { const d = this.dlg; if (!d || d.kind !== 'removedup') return null; return { headers: d.headers, idx: d.idx, columns: d.cols.map(c => ({ c: c.c, label: this.columnLabel(d.range, c.c, d.headers), checked: c.checked })) }; },

  /* ---------------- Data Validation (Alt A V V) and the in-cell drop-down ---------------- */
  /** The rule on a cell (null when none). */
  validationFor(S, key) { return (S.validation && S.validation[key]) || null; },
  /** A rule's bound or source evaluated: =A1 and =Cases read the sheet, 100 is 100, Base,Downside is text. */
  validationEval(S, text, p) {
    const t = String(text == null ? '' : text).trim(); if (t === '') return null;
    if (t[0] === '=') { let rows = null; try { const v = evalFormula(t, S.evalCtx({ cell: p, onSpill: r => { rows = r; } })); return rows ? { data: rows.flat() } : v; } catch (e) { return '#NAME?'; } }   // a range or an array arrives as its cells
    const n = textToNumber(t); if (n !== null) return n;
    const d = dateTextValue(t, S.today); return d !== null && d !== undefined ? d : t;
  },
  /** The items of a list rule: the source's cells (their display text, blanks skipped) or the typed, comma-separated entries. */
  validationItems(S, rule, p) {
    const src = String(rule.source || '').trim(); if (!src) return [];
    if (src[0] !== '=') return src.split(',').map(x => x.trim()).filter(x => x !== '');
    const v = this.validationEval(S, src, p); const out = [];
    const push = x => { if (x === null || x === undefined || x === '') return; out.push(typeof x === 'number' ? dispText({ value: x, formula: null }) : String(x)); };
    if (v && typeof v === 'object' && v.data) for (const x of v.data) push(x);
    else push(v);
    return out;
  },
  /**
   * Does an entry pass the cell's rule? `value` is what the commit would store (a formula's
   * result for a formula). Lists compare text case-insensitively; whole numbers must be integers;
   * dates and times are serials; the limits may be typed or point at cells.
   */
  validationAllows(S, rule, value, p) {
    if (!rule || rule.allow === 'any') return true;
    if (value === null || value === '') return rule.ignoreBlank !== false;
    if (rule.allow === 'list') { const t = String(typeof value === 'number' ? dispText({ value, formula: null }) : value).toLowerCase(); return this.validationItems(S, rule, p).some(it => it.toLowerCase() === t); }
    if (rule.allow === 'custom') { const v = this.validationEval(S, rule.source, p); return !!v && !isErrVal(v); }
    let x;
    if (rule.allow === 'textlen') x = String(value).length;
    else { if (typeof value !== 'number') return false; x = value; if (rule.allow === 'whole' && !Number.isInteger(x)) return false; if (rule.allow === 'time' && (x < 0 || x >= 1)) return false; }
    const lo = this.validationEval(S, rule.min, p), hi = this.validationEval(S, rule.max, p);
    const num = v => typeof v === 'number' ? v : NaN;
    switch (rule.data || 'between') {
      case 'between': return x >= num(lo) && x <= num(hi);
      case 'notBetween': return x < num(lo) || x > num(hi);
      case 'equal': return x === num(lo);
      case 'notEqual': return x !== num(lo);
      case 'greater': return x > num(lo);
      case 'less': return x < num(lo);
      case 'greaterEq': return x >= num(lo);
      case 'lessEq': return x <= num(lo);
    }
    return true;
  },
  /** The commit gate: null when the entry may go in, else the alert's { title, message } (Excel's Stop alert: Retry or Cancel). */
  validationCheck(r, c, cls) {
    const S = this.sheet; const rule = this.validationFor(S, refKey(r, c)); if (!rule) return null;
    let value = cls.kind === 'empty' ? null : cls.kind === 'formula' ? (() => { try { return evalFormula(cls.formula, S.evalCtx({ cell: { r, c } })); } catch (e) { return '#NAME?'; } })() : cls.value;
    if (value && typeof value === 'object') value = null;
    if (this.validationAllows(S, rule, value, { r, c })) return null;
    return { title: rule.errTitle || 'Microsoft Excel', message: rule.errMsg || VALIDATION_NOTE, style: rule.errStyle || 'stop' };
  },
  /**
   * The dialog: Settings (Allow Alt+A, Data Alt+D, Minimum Alt+M, Maximum Alt+X, Source Alt+S,
   * Ignore blank Alt+B, In-cell dropdown Alt+I, Clear All Alt+C), Input Message (Title Alt+T,
   * Input message Alt+I) and Error Alert (Style Alt+Y, Title Alt+T, Error message Alt+E) on
   * Ctrl+PgDn / Ctrl+PgUp; a combo takes ↑ ↓ or the entry's first letter; OK is Enter.
   */
  openValidation() {
    const S = this.sheet; this.startClock(); const a = S.dispActive(); const sr = S.selRange();
    const old = this.validationFor(S, refKey(a.r, a.c)) || {};
    this.openDialog('validation', []);
    this.dlg = { kind: 'validation', range: { ...sr }, tab: 'settings', focus: 'allow', allow: old.allow || 'any', data: old.data || 'between', min: old.min || '', max: old.max || '', source: old.source || '',
      inCell: old.inCell !== false, ignoreBlank: old.ignoreBlank !== false, errStyle: old.errStyle || 'stop', errTitle: old.errTitle || '', errMsg: old.errMsg || '', inTitle: old.inTitle || '', inMsg: old.inMsg || '' };
  },
  validationKey(key) {
    const d = this.dlg; const S = this.sheet; if (!d) return;
    const TABS = ['settings', 'input', 'error'];
    if (key === 'NextTab' || key === 'PrevTab') { d.tab = TABS[(TABS.indexOf(d.tab) + (key === 'NextTab' ? 1 : 2)) % 3]; d.focus = d.tab === 'settings' ? 'allow' : d.tab === 'input' ? 'inTitle' : 'errStyle'; return; }
    if (key === 'Enter') {   // OK: the rule onto every selected cell (Any value removes it)
      const rg = d.range; this.exitRibbon(false); S.pushUndo(); if (!S.validation) S.validation = {};
      for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) { const k = refKey(r, c); if (d.allow === 'any') delete S.validation[k]; else S.validation[k] = { allow: d.allow, data: d.data, min: d.min, max: d.max, source: d.source, inCell: d.inCell, ignoreBlank: d.ignoreBlank, errStyle: d.errStyle, errTitle: d.errTitle, errMsg: d.errMsg, inTitle: d.inTitle, inMsg: d.inMsg }; }
      S.commit('validation'); return;
    }
    const ring = d.tab === 'settings' ? ['allow'].concat(d.allow === 'any' ? [] : d.allow === 'list' ? ['source', 'ignoreBlank', 'inCell'] : d.allow === 'custom' ? ['source', 'ignoreBlank'] : ['data'].concat(['between', 'notBetween'].includes(d.data) ? ['min', 'max'] : ['min'], ['ignoreBlank'])).concat(['ok'])
      : d.tab === 'input' ? ['inTitle', 'inMsg', 'ok'] : ['errStyle', 'errTitle', 'errMsg', 'ok'];
    if (key === 'Tab' || key === 'Shift+Tab') { this.toolTab(d, key, ring); return; }
    if (d.tab === 'settings') {
      if (key === 'Alt+A') { d.focus = 'allow'; return; } if (key === 'Alt+D') { d.focus = 'data'; return; } if (key === 'Alt+M') { d.focus = 'min'; return; } if (key === 'Alt+X') { d.focus = 'max'; return; }
      if (key === 'Alt+S') { d.focus = 'source'; return; } if (key === 'Alt+B') { d.ignoreBlank = !d.ignoreBlank; return; } if (key === 'Alt+I') { d.inCell = !d.inCell; return; }
      if (key === 'Alt+C') { Object.assign(d, { allow: 'any', data: 'between', min: '', max: '', source: '', inCell: true, ignoreBlank: true, errTitle: '', errMsg: '', inTitle: '', inMsg: '' }); d.focus = 'allow'; return; }   // Clear All
    } else if (d.tab === 'input') { if (key === 'Alt+T') { d.focus = 'inTitle'; return; } if (key === 'Alt+I') { d.focus = 'inMsg'; return; } }
    else { if (key === 'Alt+Y') { d.focus = 'errStyle'; return; } if (key === 'Alt+T') { d.focus = 'errTitle'; return; } if (key === 'Alt+E') { d.focus = 'errMsg'; return; } }
    const combo = (list, field) => {   // ↑ ↓ step; a letter goes to the next entry that starts with it
      const i = Math.max(0, list.findIndex(x => x[0] === d[field]));
      if (key === 'ArrowDown') { d[field] = list[Math.min(list.length - 1, i + 1)][0]; return true; }
      if (key === 'ArrowUp') { d[field] = list[Math.max(0, i - 1)][0]; return true; }
      if (key.length === 1) { const K = key.toUpperCase(); for (let n = 1; n <= list.length; n++) { const e = list[(i + n) % list.length]; if (e[1].toUpperCase().startsWith(K)) { d[field] = e[0]; return true; } } }
      return false;
    };
    if (d.focus === 'allow') { combo(ALLOW, 'allow'); return; }
    if (d.focus === 'data') { combo(DV_DATA, 'data'); return; }
    if (d.focus === 'errStyle') { combo([['stop', 'Stop'], ['warning', 'Warning'], ['information', 'Information']], 'errStyle'); return; }
    if (d.focus === 'ignoreBlank' && key === ' ') { d.ignoreBlank = !d.ignoreBlank; return; }
    if (d.focus === 'inCell' && key === ' ') { d.inCell = !d.inCell; return; }
    this.toolType(d, key, ['min', 'max', 'source', 'errTitle', 'errMsg', 'inTitle', 'inMsg']);
  },
  /** Alt+↓ on a cell with a list rule: the drop-down (↑ ↓, a letter, Enter picks, Esc closes). True when it opened. */
  openDvList(a) {
    const S = this.sheet; const key = refKey(a.r, a.c); const rule = this.validationFor(S, key);
    if (!rule || rule.allow !== 'list' || rule.inCell === false) return false;
    const items = this.validationItems(S, rule, a); if (!items.length) return false;
    this.startClock(); this.openDialog('dvlist', []);
    const cur = dispText(S.get(a.r, a.c)).toLowerCase(); const idx = Math.max(0, items.findIndex(it => it.toLowerCase() === cur));
    this.dlg = { kind: 'dvlist', cell: key, items, idx }; return true;
  },
  dvListKey(key) {
    const d = this.dlg; const S = this.sheet; if (!d) return;
    if (key === 'ArrowDown') { d.idx = Math.min(d.items.length - 1, d.idx + 1); return; } if (key === 'ArrowUp') { d.idx = Math.max(0, d.idx - 1); return; }
    if (key === 'Home') { d.idx = 0; return; } if (key === 'End') { d.idx = d.items.length - 1; return; }
    if (key === 'Enter') { const p = parseRef(d.cell); const text = d.items[d.idx]; this.exitRibbon(false); S.commitInput(text[0] === '=' || text[0] === "'" ? "'" + text : text, p.r, p.c); return; }
    if (key.length === 1) { const K = key.toUpperCase(); for (let n = 1; n <= d.items.length; n++) { const i = (d.idx + n) % d.items.length; if (d.items[i].toUpperCase().startsWith(K)) { d.idx = i; return; } } }
  },

  /* ---------------- Cell Styles › New Cell Style (Alt H J N) ---------------- */
  /** The gallery's entries: Excel's built-in styles, then the workbook's own (custom) styles. */
  cellStyleList() { return CELL_STYLES.map(st => ({ k: st.k, name: st.name, builtin: true })).concat((this.cellStyles || []).map(st => ({ k: 'custom:' + st.name, name: st.name, custom: st }))); },
  /** Apply a gallery entry to the selection: a built-in through the sheet, a custom style by its ticked parts (the cell remembers the style's name). */
  applyStyleEntry(entry) {
    const S = this.sheet; if (!entry) return;
    if (entry.builtin) { S.applyCellStyle(entry.k); return; }
    const st = entry.custom; S.formatSel(c => { for (const part in STYLE_PARTS) if (st.includes[part]) for (const f of STYLE_PARTS[part]) c[f] = clone(st.fmt[f] === undefined ? null : st.fmt[f]); c.style = st.name; });
  },
  /** Re-apply a saved style by name (what the gallery's Custom row does); false when there is none. */
  applyCellStyleByName(name) { const e = this.cellStyleList().find(x => x.name.toLowerCase() === String(name).toLowerCase()); if (!e) return false; this.applyStyleEntry(e); return true; },
  /**
   * The Style dialog, By Example: Style name (Alt+S; it opens as Style 1, selected), the tick boxes
   * Number (Alt+N), Alignment (Alt+L), Font (Alt+F), Border (Alt+B), Fill (Alt+I), Protection (Alt+R);
   * OK (Enter) saves the active cell's formats under the name (a name in use is redefined).
   */
  openNewCellStyle() {
    const n = (this.cellStyles || []).length + 1;
    this.openDialog('newstyle', []);
    this.dlg = { kind: 'newstyle', name: 'Style ' + n, fresh: true, focus: 'name', includes: { number: true, alignment: true, font: true, border: true, fill: true, protection: true } };
  },
  newCellStyleKey(key) {
    const d = this.dlg; if (!d) return;
    if (STYLE_KEYS[key]) { const p = STYLE_KEYS[key]; d.includes[p] = !d.includes[p]; d.focus = p; return; }
    if (key === 'Alt+S') { d.focus = 'name'; d.fresh = true; return; }
    if (key === ' ' && d.focus !== 'name') { d.includes[d.focus] = !d.includes[d.focus]; return; }
    if (key === 'Enter') {
      const name = d.name.trim(); if (!name) return;
      const S = this.sheet; const a = S.dispActive(); const cell = S.get(a.r, a.c); const fmt = {};
      for (const part in STYLE_PARTS) for (const f of STYLE_PARTS[part]) fmt[f] = clone(cell[f] === undefined ? null : cell[f]);
      if (!this.cellStyles) this.cellStyles = [];
      const style = { name, includes: { ...d.includes }, fmt };
      const i = this.cellStyles.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
      if (i >= 0) this.cellStyles[i] = style; else this.cellStyles.push(style);
      this.exitRibbon(false); S.pushUndo(); S.ensure(a.r, a.c).style = name; S.commit('format'); return;   // the example cell now carries the style
    }
    if (d.focus === 'name') { if (d.fresh && key.length === 1) d.name = ''; if (this.toolType(d, key, ['name'])) d.fresh = false; }
  },

  /* ---------------- Insert Hyperlink (Ctrl+K) and following a link ---------------- */
  /**
   * The Insert Hyperlink dialog. Link to: Existing File or Web Page (Alt+X) or Place in This
   * Document (Alt+A); Text to display (Alt+T); in a place, Type the cell reference (Alt+E) and Or
   * select a place in this document (Alt+C: ↑ ↓ walk the sheets, then the defined names); for a web
   * page, Address (Alt+E). OK (Enter) writes the link; on a linked cell, Remove Link (Alt+R).
   * The cell takes Excel's Hyperlink look (blue, underlined) and shows the text to display.
   */
  openHyperlink() {
    const S = this.sheet; this.startClock(); const a = S.dispActive(); const cell = S.get(a.r, a.c); const old = cell.link || null;
    const places = this.sheets.map(e => ({ kind: 'sheet', name: e.name })).concat(this.definedNames().map(n => ({ kind: 'name', name: n.name })));
    this.openDialog('hyperlink', []);
    const pi = old && old.sheet ? Math.max(0, places.findIndex(p => p.kind === 'sheet' && p.name === old.sheet)) : old && old.name ? Math.max(0, places.findIndex(p => p.name === old.name)) : this.sheetIndex;
    this.dlg = { kind: 'hyperlink', cell: refKey(a.r, a.c), mode: old && old.url ? 'url' : old ? 'place' : 'url', text: dispText(cell), ref: old && old.ref ? old.ref : 'A1', url: old && old.url ? old.url : '', places, place: pi, focus: old ? (old.url ? 'url' : 'ref') : 'url', had: !!old };
  },
  hyperlinkKey(key) {
    const d = this.dlg; const S = this.sheet; if (!d) return;
    if (key === 'Alt+X') { d.mode = 'url'; d.focus = 'url'; d.fresh = true; return; }
    if (key === 'Alt+A') { d.mode = 'place'; d.focus = 'ref'; d.fresh = true; return; }
    if (key === 'Alt+T') { d.focus = 'text'; d.fresh = true; return; }   // a box reached by its key opens with its text selected: typing replaces it
    if (key === 'Alt+E') { d.focus = d.mode === 'place' ? 'ref' : 'url'; d.fresh = true; return; }
    if (key === 'Alt+C' && d.mode === 'place') { d.focus = 'place'; return; }
    if (key === 'Alt+R' && d.had) { const p = parseRef(d.cell); this.exitRibbon(false); S.pushUndo(); const c = S.ensure(p.r, p.c); delete c.link; c.uline = false; c.fontColor = null; S.commit('format'); return; }
    if (key === 'Tab' || key === 'Shift+Tab') { this.toolTab(d, key, d.mode === 'place' ? ['text', 'ref', 'place', 'ok'] : ['text', 'url', 'ok']); d.fresh = true; return; }
    if (d.focus === 'place' && (key === 'ArrowDown' || key === 'ArrowUp')) { d.place = Math.max(0, Math.min(d.places.length - 1, d.place + (key === 'ArrowDown' ? 1 : -1))); return; }
    if (key !== 'Enter') { if (d.fresh && key.length === 1 && ['text', 'ref', 'url'].includes(d.focus)) d[d.focus] = ''; if (this.toolType(d, key, ['text', 'ref', 'url'])) d.fresh = false; return; }
    const p = parseRef(d.cell); let link;
    if (d.mode === 'url') { const u = d.url.trim(); if (!u) return; link = { url: u }; }
    else {
      const pl = d.places[d.place];
      if (pl.kind === 'name') link = { name: pl.name };
      else { const rg = parseRange(d.ref.trim().replace(/\$/g, '').toUpperCase()); if (!rg) { this.toast(GOALSEEK_REF_NOTE); return; } link = { sheet: pl.name, ref: rangeText(rg) }; }
    }
    this.exitRibbon(false); S.pushUndo();
    const c = S.ensure(p.r, p.c); c.link = link; c.uline = true; c.fontColor = 'blue';
    const shown = d.text !== '' ? d.text : link.url || (link.name || ((/^[A-Za-z_][A-Za-z0-9_.]*$/.test(link.sheet) ? link.sheet : "'" + link.sheet + "'") + '!' + link.ref));
    if (!c.formula && dispText(c) !== shown) { c.value = shown; c.txt = false; }
    S.commit('edit');
  },
  /** Where a cell's link goes: its Insert Hyperlink target, or a HYPERLINK formula's "#Sheet!A1" location. Null for none. */
  linkOf(r, c) {
    const S = this.sheet; const cell = S.get(r, c);
    if (cell.link) return cell.link;
    if (cell.formula && /^=\s*HYPERLINK\s*\(/i.test(cell.formula)) {
      const m = /^=\s*HYPERLINK\s*\(\s*"([^"]*)"/i.exec(cell.formula); if (!m) return null;
      const loc = m[1]; if (loc[0] !== '#') return { url: loc };
      const t = loc.slice(1); const bang = t.lastIndexOf('!');
      return bang < 0 ? { name: t } : { sheet: t.slice(0, bang).replace(/^'|'$/g, ''), ref: t.slice(bang + 1) };
    }
    return null;
  },
  /** Follow the link on a cell (a click, Ctrl+click when Excel's option asks for it, or the context menu's Open Hyperlink): a place moves the selection there, switching sheets; a web address is handed to the page (opts.onOpenUrl). True when it went somewhere. */
  followLink(r, c) {
    const a = r === undefined ? this.sheet.dispActive() : { r, c }; const link = this.linkOf(a.r, a.c); if (!link) return false;
    this.startClock();
    if (link.url) { if (this.opts.onOpenUrl) this.opts.onOpenUrl(link.url); return true; }
    if (link.name) return this.goToRef(link.name);
    return this.goToRef((/^[A-Za-z_][A-Za-z0-9_.]*$/.test(link.sheet) ? link.sheet : "'" + link.sheet.replace(/'/g, "''") + "'") + '!' + link.ref);
  },
  /** Shift+F10 (or the Menu key): the cell's shortcut menu. Its Hyperlink items are what the engine acts on: Open Hyperlink (O), Edit Hyperlink (H), Remove Hyperlink (R); Esc closes. */
  openContextMenu() { this.startClock(); this.openDialog('ctxmenu', []); this.dlg = { kind: 'ctxmenu' }; },
  contextMenuKey(key) {
    const K = key.toUpperCase(); const S = this.sheet; const a = S.dispActive(); const has = !!this.linkOf(a.r, a.c);
    if (K === 'O' && has) { this.exitRibbon(false); this.followLink(a.r, a.c); return; }
    if (K === 'H') { this.exitRibbon(false); this.openHyperlink(); return; }
    if (K === 'R' && S.get(a.r, a.c).link) { this.exitRibbon(false); S.pushUndo(); const c = S.ensure(a.r, a.c); delete c.link; c.uline = false; c.fontColor = null; S.commit('format'); return; }
    if (key === 'Enter') this.exitRibbon(false);
  },

  /* ---------------- Text to Columns (Alt A E) ---------------- */
  /**
   * The Convert Text to Columns wizard on the selected column. Step 1: Delimited (Alt+D) or Fixed
   * width (Alt+W). Step 2: the delimiters Tab (Alt+T), Semicolon (Alt+M), Comma (Alt+C), Space
   * (Alt+S), Other (Alt+O, then the character), Treat consecutive delimiters as one (Alt+R); for
   * fixed width, the break lines Excel suggests. Step 3: ← → pick a column of the preview, then
   * General (Alt+G), Text (Alt+T), Date (Alt+D) or Do not import (Alt+I); Destination (Alt+E).
   * Next (Alt+N, Enter), Back (Alt+B), Finish (Alt+F, Enter on the last step). Writing over data
   * asks first (Enter replaces it, Esc goes back).
   */
  openTextToColumns() {
    const S = this.sheet; this.startClock(); const sr = S.selRange();
    this.openDialog('texttocols', []);
    const rg = sr.r1 === sr.r2 && sr.c1 === sr.c2 ? (() => { const g = S.regionAround(sr.r1, sr.c1); return { r1: g.r1, r2: g.r2, c1: sr.c1, c2: sr.c1 }; })() : { r1: sr.r1, r2: sr.r2, c1: sr.c1, c2: sr.c1 };
    const texts = []; for (let r = rg.r1; r <= rg.r2; r++) texts.push(dispText(S.get(r, rg.c1)));
    const comma = texts.some(t => t.includes(',')), tab = texts.some(t => t.includes('\t'));
    this.dlg = { kind: 'texttocols', range: rg, texts, step: 1, mode: 'delimited', tab: tab || !comma, semicolon: false, comma: false, space: false, other: '', otherOn: false, consecutive: false,
      breaks: suggestBreaks(texts), col: 0, formats: {}, dest: '$' + colLetter(rg.c1) + '$' + rg.r1, focus: 'mode', confirm: false };
  },
  textToColumnsSpec(d) { return { mode: d.mode, tab: d.tab, semicolon: d.semicolon, comma: d.comma, space: d.space, other: d.otherOn ? d.other : '', consecutive: d.consecutive, breaks: d.breaks }; },
  /** The wizard's preview: every row split as Finish would split it, and the column formats. */
  textToColumnsView() { const d = this.dlg; if (!d || d.kind !== 'texttocols') return null; const spec = this.textToColumnsSpec(d); const rows = d.texts.map(t => splitForColumns(t, spec)); const n = rows.reduce((m, x) => Math.max(m, x.length), 0); return { step: d.step, mode: d.mode, rows, columns: n, col: d.col, formats: Array.from({ length: n }, (_, i) => d.formats[i] || 'general'), dest: d.dest, confirm: d.confirm }; },
  textToColumnsKey(key) {
    const d = this.dlg; const S = this.sheet; if (!d) return;
    if (d.confirm) { if (key === 'Enter') { d.confirm = false; this.textToColumnsFinish(true); } else if (key === 'Escape') d.confirm = false; return; }
    if (key === 'Alt+B') { d.step = Math.max(1, d.step - 1); return; }
    if (key === 'Alt+N' || (key === 'Enter' && d.step < 3)) { d.step = Math.min(3, d.step + 1); d.focus = d.step === 3 ? 'formats' : 'delims'; return; }
    if (key === 'Alt+F' || key === 'Enter') { this.textToColumnsFinish(false); return; }
    if (d.step === 1) { if (key === 'Alt+D') d.mode = 'delimited'; else if (key === 'Alt+W') d.mode = 'fixed'; else if (key === 'ArrowDown' || key === 'ArrowUp') d.mode = d.mode === 'fixed' ? 'delimited' : 'fixed'; return; }
    if (d.step === 2) {
      if (d.mode === 'delimited') {
        const T = { 'Alt+T': 'tab', 'Alt+M': 'semicolon', 'Alt+C': 'comma', 'Alt+S': 'space', 'Alt+R': 'consecutive' };
        if (T[key]) { d[T[key]] = !d[T[key]]; d.focus = T[key]; return; }
        if (key === 'Alt+O') { d.otherOn = !d.otherOn; d.focus = 'other'; return; }
        if (d.focus === 'other' && key.length === 1) { d.other = key; d.otherOn = true; return; }
        if (d.focus === 'other' && key === 'Backspace') { d.other = ''; return; }
      }
      return;
    }
    // step 3: the column formats and the destination
    const n = this.textToColumnsView().columns;
    if (key === 'ArrowRight') { d.col = Math.min(n - 1, d.col + 1); return; } if (key === 'ArrowLeft') { d.col = Math.max(0, d.col - 1); return; }
    const F = { 'Alt+G': 'general', 'Alt+T': 'text', 'Alt+D': 'date', 'Alt+I': 'skip' };
    if (F[key]) { d.formats[d.col] = F[key]; return; }
    if (key === 'Alt+E') { d.focus = 'dest'; d.fresh = true; return; }
    if (d.focus === 'dest') { if (d.fresh && key.length === 1) d.dest = ''; if (this.toolType(d, key, ['dest'])) d.fresh = false; }
  },
  textToColumnsFinish(confirmed) {
    const d = this.dlg; const S = this.sheet; const rg = d.range;
    const dest = this.toolRef(d.dest, { sameSheet: true }); if (!dest) { this.toast(GOALSEEK_REF_NOTE); return; }
    const spec = this.textToColumnsSpec(d); const rows = d.texts.map(t => splitForColumns(t, spec));
    const keep = []; const n = rows.reduce((m, x) => Math.max(m, x.length), 0); for (let i = 0; i < n; i++) if ((d.formats[i] || 'general') !== 'skip') keep.push(i);
    if (!confirmed) {   // Excel asks before writing over anything but the source cells
      for (let i = 0; i < rows.length; i++) for (let j = 0; j < keep.length; j++) { const r = dest.r + i, c = dest.c + j; if (r >= rg.r1 && r <= rg.r2 && c === rg.c1) continue; if (S.nonEmpty(r, c)) { d.confirm = true; this.note = TTC_OVERWRITE_NOTE; return; } }
    }
    this.exitRibbon(false); S.pushUndo();
    for (let i = 0; i < rows.length; i++) keep.forEach((src, j) => {
      const r = dest.r + i, c = dest.c + j; if (!S.inb(r, c)) return;
      const piece = rows[i][src] === undefined ? '' : rows[i][src]; const cell = S.ensure(r, c); const fmt = d.formats[src] || 'general';
      cell.formula = null; cell.apos = false;
      if (piece === '') { cell.value = null; cell.txt = false; return; }
      if (fmt === 'text') { cell.value = piece; cell.txt = true; return; }
      const cls = Sheet.classifyInput(piece, null, S.today);
      if (cls.kind === 'value') S.applyInput(cell, cls, r, c); else { cell.value = piece; cell.txt = false; }
    });
    S.commit('edit');
  },

  /* ---------------- Flash Fill (Ctrl+E, Alt A F) ---------------- */
  /**
   * Fill the empty cells of the active cell's column, down the data beside it, with the pattern of
   * the example(s) typed above: the texts of the row's other columns, pieces of them, re-cased,
   * joined by literal characters. A header row that fits no pattern is left out. No pattern:
   * Excel's note, nothing changes.
   */
  flashFill() {
    const S = this.sheet; this.startClock(); const a = S.dispActive(); const col = a.c;
    const left = col > 1 ? S.regionAround(a.r, col - 1) : null; const right = col < S.cols ? S.regionAround(a.r, col + 1) : null;
    const pick = [left, right].filter(g => g && (g.r1 !== g.r2 || g.c1 !== g.c2 || S.nonEmpty(g.r1, g.c1)));
    if (!pick.length) { this.toast(FLASH_FILL_NONE_NOTE); return false; }
    const r1 = Math.min(...pick.map(g => g.r1)), r2 = Math.max(...pick.map(g => g.r2));
    const c1 = Math.min(col, ...pick.map(g => g.c1)), c2 = Math.max(col, ...pick.map(g => g.c2));
    const srcCols = []; for (let c = c1; c <= c2; c++) if (c !== col) srcCols.push(c);
    const sourcesOf = r => srcCols.map(c => dispText(S.get(r, c)));
    let examples = []; const empty = [];
    for (let r = r1; r <= r2; r++) { const t = dispText(S.get(r, col)); if (t !== '') examples.push({ r, text: t, sources: sourcesOf(r) }); else if (srcCols.some(c => S.nonEmpty(r, c))) empty.push(r); }
    let fill = examples.length ? flashFillPattern(examples) : null;
    if (!fill && examples.length > 1) { examples = examples.slice(1); fill = flashFillPattern(examples); }   // the first one was a header
    if (!fill || !empty.length) { this.toast(FLASH_FILL_NONE_NOTE); return false; }
    const out = empty.map(r => [r, fill(sourcesOf(r))]).filter(([, v]) => v !== null && v !== '');
    if (!out.length) { this.toast(FLASH_FILL_NONE_NOTE); return false; }
    S.pushUndo();
    for (const [r, v] of out) { const cell = S.ensure(r, col); cell.formula = null; cell.value = v; cell.txt = false; }
    S.commit('edit'); return true;
  },

  /* ---------------- Edit Links (Alt A K): references to other workbooks ---------------- */
  /** The other workbooks the formulas name ([Budget.xlsx]Annual!C10), each with the cells that read it: [{ file, cells: ['Sheet1!B2'] }] in first-seen order. */
  externalLinks() {
    const out = new Map();
    for (const e of this.sheets) for (const k of Object.keys(e.sheet.cells)) {
      const c = e.sheet.cells[k]; if (!c || !c.formula || c.formula.indexOf('[') < 0) continue;
      let toks; try { toks = tokenize(c.formula.replace(/^=/, '')); } catch (x) { continue; }
      for (const t of toks) if (t.t === 'ref' && t.sheet && t.sheet[0] === '[') {
        const m = /^'?\[([^\]]+)\]/.exec(t.sheetTxt); const file = m ? m[1] : t.sheet.slice(1, t.sheet.indexOf(']'));
        const key = file.toLowerCase(); if (!out.has(key)) out.set(key, { file, cells: [] });
        const where = e.name + '!' + k; if (!out.get(key).cells.includes(where)) out.get(key).cells.push(where);
      }
    }
    return [...out.values()];
  },
  /** The values another workbook's cells last had (what Excel keeps with the link): setExternalValues('Budget.xlsx', 'Annual', { C10: 125 }). */
  setExternalValues(file, sheet, values) {
    if (!this.externalValues) this.externalValues = {};
    const k = ('[' + file + ']' + sheet).toLowerCase(); this.externalValues[k] = { ...(this.externalValues[k] || {}), ...values };
    this.recalcAll();
  },
  /** One external cell's value: its stored value, or #REF! when the link has none. */
  externalRaw(name, key) { const v = this.externalValues && this.externalValues[String(name).toLowerCase()]; if (!v) return '#REF!'; return v[key] === undefined ? null : v[key]; },
  /**
   * The Edit Links dialog: ↑ ↓ pick a source; Break Link (Alt+B) asks Excel's question, then (Enter)
   * turns every formula that reads that workbook into its value; Change Source (Alt+N) takes the new
   * file name (Enter) and rewrites the references; Close is Esc. A workbook without links: Excel's note.
   */
  openEditLinks() {
    this.startClock(); const list = this.externalLinks();
    if (!list.length) { this.exitRibbon(false); this.toast(NO_LINKS_NOTE); return; }
    this.openDialog('editlinks', []);
    this.dlg = { kind: 'editlinks', list, idx: 0, confirm: false, rename: null };
  },
  editLinksKey(key) {
    const d = this.dlg; if (!d) return;
    if (d.confirm) { if (key === 'Enter' || key === 'Alt+B') { d.confirm = false; this.breakLink(d.list[d.idx].file); d.list = this.externalLinks(); if (!d.list.length) this.exitRibbon(false); else d.idx = Math.min(d.idx, d.list.length - 1); } return; }
    if (d.rename !== null) {
      if (key === 'Enter') { const to = d.rename.trim(); d.rename = null; if (to) { this.changeLinkSource(d.list[d.idx].file, to); d.list = this.externalLinks(); d.idx = Math.max(0, d.list.findIndex(x => x.file.toLowerCase() === to.toLowerCase())); } return; }
      if (key === 'Backspace') { d.rename = d.rename.slice(0, -1); return; }
      if (key.length === 1) d.rename += key; return;
    }
    if (key === 'ArrowDown') { d.idx = Math.min(d.list.length - 1, d.idx + 1); return; } if (key === 'ArrowUp') { d.idx = Math.max(0, d.idx - 1); return; }
    if (key === 'Alt+B') { d.confirm = true; this.note = BREAK_LINKS_NOTE; return; }
    if (key === 'Alt+N') { d.rename = ''; return; }
    if (key === 'Enter') this.exitRibbon(false);
  },
  /** Break Link: every formula reading the workbook becomes the value it shows (one undo step per sheet touched, as the commit records it). */
  breakLink(file) {
    const tag = '[' + String(file).toLowerCase() + ']';
    for (const e of this.sheets) {
      const S = e.sheet; let touched = false;
      for (const k of Object.keys(S.cells)) { const c = S.cells[k]; if (!c || !c.formula || c.formula.toLowerCase().indexOf(tag) < 0) continue; if (!touched) { S.pushUndo(); touched = true; } c.formula = null; if (c.value && typeof c.value === 'object') c.value = null; }
      if (touched) S.commit('edit');
    }
  },
  /** Change Source: the references to one workbook point at another (the cached values go with them until updated). */
  changeLinkSource(from, to) {
    const lo = String(from).toLowerCase();
    if (this.externalValues) for (const k of Object.keys(this.externalValues)) if (k.startsWith('[' + lo + ']')) { this.externalValues['[' + to.toLowerCase() + ']' + k.slice(lo.length + 2)] = this.externalValues[k]; }
    for (const e of this.sheets) {
      const S = e.sheet; let touched = false;
      for (const k of Object.keys(S.cells)) {
        const c = S.cells[k]; if (!c || !c.formula || c.formula.toLowerCase().indexOf('[' + lo + ']') < 0) continue;
        let toks; try { toks = tokenize(c.formula.slice(1)); } catch (x) { continue; }
        let f = c.formula.slice(1), shift = 0;
        for (const t of toks) if (t.t === 'ref' && t.sheetTxt && t.sheetTxt.toLowerCase().includes('[' + lo + ']')) {
          const quoted = t.sheetTxt[0] === "'"; let inner = quoted ? t.sheetTxt.slice(1, -2).replace(/''/g, "'") : t.sheetTxt.slice(0, -1);
          const i = inner.toLowerCase().indexOf('[' + lo + ']'); inner = inner.slice(0, i) + '[' + to + ']' + inner.slice(i + lo.length + 2);
          const nt = (/^\[[^\]'!]+\][A-Za-z_][A-Za-z0-9_.]*$/.test(inner) && !/\s/.test(inner) ? inner : "'" + inner.replace(/'/g, "''") + "'") + '!';   // quoted when the new name needs it
          f = f.slice(0, t.pos + shift) + nt + f.slice(t.pos + shift + t.sheetTxt.length); shift += nt.length - t.sheetTxt.length;
        }
        if (!touched) { S.pushUndo(); touched = true; } c.formula = '=' + f;
      }
      if (touched) S.commit('edit');
    }
    this.recalcAll();
  },

  /* ---------------- references typed into a tool's box ---------------- */
  /** A single-cell reference typed in a dialog (B5, $B$5, Inputs!B5, 'Rate Card'!$B$5, a defined name): { sheet, key, name } or null. */
  toolRef(text, { sameSheet = false } = {}) {
    let t = String(text || '').trim().replace(/^=/, ''); if (!t) return null;
    const nm = Object.entries(this.names || {}).find(([n]) => n.toLowerCase() === t.toLowerCase()); if (nm) t = nm[1];
    let sheet = this.sheet, name = ((this.sheets || []).find(e => e.sheet === this.sheet) || {}).name || null;
    const bang = t.lastIndexOf('!');
    if (bang > 0) { let sn = t.slice(0, bang); if (sn[0] === "'" && sn.endsWith("'")) sn = sn.slice(1, -1).replace(/''/g, "'"); const e = (this.sheets || []).find(x => x.name.toLowerCase() === sn.toLowerCase()); if (!e) return null; if (sameSheet && e.sheet !== this.sheet) return null; sheet = e.sheet; name = e.name; t = t.slice(bang + 1); }
    const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(t); if (!m) return null;
    const p = parseRef(m[1].toUpperCase() + m[2]); if (!p || p.r < 1 || p.c < 1 || p.r > sheet.rows || p.c > sheet.cols) return null;
    return { sheet, key: refKey(p.r, p.c), r: p.r, c: p.c, name };
  },
  /** Recalculate the workbook after a tool wrote a cell directly (the graph sees the change; nothing is emitted). */
  toolRecalc(S) { if (this.book) this.book.recalc(S); else S.recalc(); },

  /* ---------------- Goal Seek (Alt A W G) ---------------- */
  /**
   * Set cell (Alt+E, the active cell to start), To value (Alt+V), By changing cell (Alt+C); OK
   * (Enter) searches; the status box then says whether a solution was found with the target and
   * current values: OK (Enter) keeps the answer (one undo step), Cancel (Esc) puts the old value back.
   */
  openGoalSeek() {
    const S = this.sheet; this.startClock(); const a = S.dispActive();
    this.openDialog('goalseek', []);
    this.dlg = { kind: 'goalseek', set: colLetter(a.c) + a.r, to: '', by: '', focus: 'set', fresh: true, status: null };
  },
  goalSeekKey(key) {
    const d = this.dlg; if (!d) return;
    if (d.status) { if (key === 'Enter') { this.exitRibbon(false); this.sheet.commit('edit'); } else if (key === 'Escape') this.toolEscape(); return; }
    if (key === 'Alt+E') { d.focus = 'set'; d.fresh = true; return; } if (key === 'Alt+V') { d.focus = 'to'; d.fresh = true; return; } if (key === 'Alt+C') { d.focus = 'by'; d.fresh = true; return; }
    if (key === 'Tab' || key === 'Shift+Tab') { this.toolTab(d, key, ['set', 'to', 'by', 'ok']); d.fresh = true; return; }
    if (key === 'Enter') { this.runGoalSeek(); return; }
    if (d.fresh && key.length === 1 && d.focus !== 'ok') { d[d.focus] = ''; }
    if (this.toolType(d, key, ['set', 'to', 'by'])) d.fresh = false;
  },
  runGoalSeek() {
    const d = this.dlg;
    const set = this.toolRef(d.set), by = this.toolRef(d.by); const target = textToNumber(String(d.to).trim());
    if (!set || !by) { this.toast(GOALSEEK_REF_NOTE); return; }
    if (target === null) { this.toast('Invalid numeric value.'); d.focus = 'to'; return; }
    const sc = set.sheet.get(set.r, set.c); if (!sc.formula) { this.toast(GOALSEEK_FORMULA_NOTE); d.focus = 'set'; return; }
    const bc = by.sheet.get(by.r, by.c); if (bc.formula || (bc.value !== null && typeof bc.value !== 'number')) { this.toast(GOALSEEK_VALUE_NOTE); d.focus = 'by'; return; }
    const B = by.sheet; B.pushUndo(); const before = clone(B.get(by.r, by.c)); const cell = B.ensure(by.r, by.c);
    const f = x => { cell.value = x; this.toolRecalc(B); return set.sheet.get(set.r, set.c).value; };
    let x = goalSeek(f, typeof before.value === 'number' ? before.value : 0, target);
    if (x === null) f(typeof before.value === 'number' ? before.value : 0); else f(x);
    const cur = set.sheet.get(set.r, set.c).value;
    const label = (set.sheet === this.sheet ? '' : set.name + '!') + colLetter(set.c) + set.r;
    d.status = { found: x !== null, note: x !== null ? GOALSEEK_FOUND(label) : GOALSEEK_NONE(label), target, current: cur, before, by };
  },
  /** Esc on a tool dialog: Goal Seek's status box puts the changing cell back; every tool then closes to the grid. */
  toolEscape() {
    const d = this.dlg;
    if (d && d.kind === 'goalseek' && d.status) { const { by, before } = d.status; const B = by.sheet; B.cells[by.key] = clone(before); if (B.undoStack.length) B.undoStack.pop(); this.toolRecalc(B); B.emit('edit'); }
    this.exitRibbon(false);
  },

  /* ---------------- Data Table (Alt A W T) ---------------- */
  /**
   * What-If Analysis › Data Table on the selected block: Row input cell (Alt+R), Column input cell
   * (Alt+C), OK (Enter). Column input only: the input values run down the first column and the
   * formulas across the top row; row input only, the other way; both: the formula sits in the
   * corner. Every result cell holds {=TABLE(row,col)}, which Excel will not let an entry change.
   */
  openDataTable() {
    const S = this.sheet; this.startClock(); const sr = S.selRange();
    this.openDialog('datatable', []);
    this.dlg = { kind: 'datatable', range: { r1: sr.r1, c1: sr.c1, r2: sr.r2, c2: sr.c2 }, row: '', col: '', focus: 'row' };
  },
  dataTableKey(key) {
    const d = this.dlg; const S = this.sheet; if (!d) return;
    if (key === 'Alt+R') { d.focus = 'row'; return; } if (key === 'Alt+C') { d.focus = 'col'; return; }
    if (key === 'Tab' || key === 'Shift+Tab') { this.toolTab(d, key, ['row', 'col', 'ok']); return; }
    if (key !== 'Enter') { this.toolType(d, key, ['row', 'col']); return; }
    const rg = d.range; const row = d.row.trim() ? this.toolRef(d.row, { sameSheet: true }) : null, col = d.col.trim() ? this.toolRef(d.col, { sameSheet: true }) : null;
    if ((!row && !col) || (d.row.trim() && !row) || (d.col.trim() && !col) || rg.r2 <= rg.r1 || rg.c2 <= rg.c1) { this.toast(DATATABLE_INPUT_NOTE); return; }
    const inside = p => p && p.r >= rg.r1 && p.r <= rg.r2 && p.c >= rg.c1 && p.c <= rg.c2;
    if (inside(row) || inside(col)) { this.toast(DATATABLE_INPUT_NOTE); return; }
    this.exitRibbon(false); S.pushUndo();
    if (!S.dataTables) S.dataTables = [];
    S.dataTables = S.dataTables.filter(t => t.r2 < rg.r1 || t.r1 > rg.r2 || t.c2 < rg.c1 || t.c1 > rg.c2);
    const t = { r1: rg.r1, c1: rg.c1, r2: rg.r2, c2: rg.c2, row: row ? row.key : null, col: col ? col.key : null };
    S.dataTables.push(t);
    const text = '{=TABLE(' + (row ? row.key : '') + ',' + (col ? col.key : '') + ')}';
    for (let r = rg.r1 + 1; r <= rg.r2; r++) for (let c = rg.c1 + 1; c <= rg.c2; c++) { const cell = S.ensure(r, c); cell.formula = null; cell.value = null; cell.table = text; }
    this.computeTables(S, true); S.commit('edit');
  },
  /**
   * Fill every data table on the sheet (or the workbook): each result is its formula recalculated
   * with the input cell(s) set to that row's / column's value, then the inputs go back. Runs after
   * every change in Automatic, and only on F9 under Automatic except for Data Tables (Alt M X E).
   */
  computeTables(only, force) {
    if (this._tables) return; const mode = this.settings.calcMode;
    if (!force && mode !== 'automatic') return;
    const list = only ? [only] : this.sheets.map(e => e.sheet);
    this._tables = true;
    try {
      for (const S of list) for (const t of (S.dataTables || [])) {
        const keys = [t.row, t.col].filter(Boolean); const saved = keys.map(k => clone(S.cells[k] || null));
        const put = (k, v) => { const c = S.ensure(parseRef(k).r, parseRef(k).c); c.formula = null; c.value = v; };
        const out = [];
        for (let r = t.r1 + 1; r <= t.r2; r++) for (let c = t.c1 + 1; c <= t.c2; c++) {
          let fr, fc;
          if (t.row && t.col) { put(t.row, S.get(t.r1, c).value); put(t.col, S.get(r, t.c1).value); fr = t.r1; fc = t.c1; }
          else if (t.col) { put(t.col, S.get(r, t.c1).value); fr = t.r1; fc = c; }
          else { put(t.row, S.get(t.r1, c).value); fr = r; fc = t.c1; }
          this.toolRecalc(S); out.push([r, c, S.get(fr, fc).value]);
        }
        keys.forEach((k, i) => { if (saved[i]) S.cells[k] = saved[i]; else delete S.cells[k]; });
        this.toolRecalc(S);
        for (const [r, c, v] of out) { const cell = S.ensure(r, c); cell.value = v; }
        this.toolRecalc(S);
      }
    } finally { this._tables = false; }
  },

  /* ---------------- Evaluate Formula (Alt M V) ---------------- */
  /** The dialog on the active cell's formula: Evaluate (Enter / Alt+E) steps, Restart (Alt+R) after the last step, Close (Esc). A cell without a formula opens nothing, as in Excel. */
  openEvaluate() {
    const S = this.sheet; const a = S.dispActive(); const cell = S.get(a.r, a.c);
    if (!cell.formula) { this.exitRibbon(false); return false; }
    this.startClock();
    this.openDialog('evalfx', this.mode === 'ribbon' ? this.path : []);
    const stepper = evaluateStepper(cell.formula, S.evalCtx({ cell: { r: a.r, c: a.c } }));
    this.dlg = { kind: 'evalfx', cell: refKey(a.r, a.c), stepper, text: stepper.text, done: stepper.done, result: undefined };
    return true;
  },
  evaluateKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter' || key === 'Alt+E') {
      if (d.done) { this.exitRibbon(false); return; }   // the last button reads Close
      d.stepper.step(); d.text = d.stepper.text; d.done = d.stepper.done; if (d.done) d.result = d.stepper.value; return;
    }
    if (key === 'Alt+R' && d.done) { const S = this.sheet; const p = parseRef(d.cell); d.stepper = evaluateStepper(S.get(p.r, p.c).formula, S.evalCtx({ cell: p })); d.text = d.stepper.text; d.done = d.stepper.done; d.result = undefined; }
  },
  /** The dialog's shown text as { before, under, after }: the next piece to evaluate is underlined. */
  evaluateView() {
    const d = this.dlg; if (!d || d.kind !== 'evalfx') return null;
    const t = d.text; const i = t.indexOf('\u0001'), j = t.indexOf('\u0002');
    if (i < 0) return { before: t, under: '', after: '' };
    return { before: t.slice(0, i), under: t.slice(i + 1, j), after: t.slice(j + 1) };
  },

  /* ---------------- Error Checking (Alt M K) — the active sheet only (M79) ---------------- */
  errorCells() { const S = this.sheet; return Object.keys(S.cells).filter(k => { const c = S.cells[k]; return c && c.formula && isErrVal(c.value) && !(S.ignoredErrors && S.ignoredErrors.has(k)); }).sort((x, y) => { const X = parseRef(x), Y = parseRef(y); return (X.r - Y.r) || (X.c - Y.c); }); },
  openErrorCheck() {
    this.startClock();
    const list = this.errorCells();
    this.openDialog('errcheck', this.mode === 'ribbon' ? this.path : []);
    if (!list.length) { this.dlg = { kind: 'errcheck', done: true, note: ERRCHECK_DONE_NOTE }; return; }
    this.dlg = { kind: 'errcheck', idx: 0, list, done: false };
    this.errorCheckShow();
  },
  errorCheckShow() { const d = this.dlg; const S = this.sheet; const k = d.list[d.idx]; const p = parseRef(k); S.goTo(p.r, p.c); d.cell = k; d.error = S.value(k); d.formula = S.formula(k); },
  errorCheckKey(key) {
    const d = this.dlg; if (!d) return;
    if (d.done) { if (key === 'Enter') this.exitRibbon(false); return; }
    if (key === 'Alt+N' || key === 'Enter') { if (d.idx + 1 < d.list.length) { d.idx++; this.errorCheckShow(); } else { d.done = true; d.note = ERRCHECK_DONE_NOTE; } return; }   // Next
    if (key === 'Alt+P') { if (d.idx > 0) { d.idx--; this.errorCheckShow(); } return; }   // Previous
    if (key === 'Alt+I') { const S = this.sheet; if (!S.ignoredErrors) S.ignoredErrors = new Set(); S.ignoredErrors.add(d.cell); d.list.splice(d.idx, 1); if (!d.list.length || d.idx >= d.list.length) { d.done = true; d.note = ERRCHECK_DONE_NOTE; } else this.errorCheckShow(); return; }   // Ignore Error
    if (key === 'Alt+F') { const cell = d.cell; this.exitRibbon(false); const p = parseRef(cell); this.sheet.goTo(p.r, p.c); this.startEdit(this.sheet.get(p.r, p.c).formula, 'edit'); }   // Edit in Formula Bar
  },
};

/** Mix the tool methods into the Session class (keyboard.js calls this once). */
export function installTools(Session) { Object.assign(Session.prototype, methods); }
