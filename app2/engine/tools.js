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

import { Sheet } from './sheet.js';
import { evalFormula, formulaRefs, evaluateStepper, valueText, translateFormula, isErrVal, textToNumber, dateTextValue, parses } from './formula.js';
import { refKey, parseRef, parseRange, rangeText, colLetter } from './refs.js';
import { dispText } from './format.js';
const clone = x => JSON.parse(JSON.stringify(x));

/** The dialogs this module drives (keyboard.js routes their keys to toolKey). */
export const TOOL_DIALOGS = new Set(['evalfx', 'errcheck', 'texttocols', 'removedup', 'validation', 'dvlist', 'editlinks', 'autofilter', 'sortdlg', 'goalseek', 'datatable', 'pivot']);
/** The dialogs with a text field that keeps the case typed. */
export const TOOL_TYPED = new Set(['texttocols', 'validation', 'goalseek', 'datatable', 'sortdlg', 'autofilter']);
/** Excel's messages the tools show verbatim. */
export const ERRCHECK_DONE_NOTE = 'The error check is complete for the entire sheet.';
export const FLASH_FILL_NONE_NOTE = "We looked at all the data next to your selection and didn't see a pattern for filling in values for you.";
export const VALIDATION_NOTE = "This value doesn't match the data validation restrictions defined for this cell.";
export const GOALSEEK_FOUND = (cell) => `Goal Seeking with Cell ${cell} found a solution.`;
export const GOALSEEK_NONE = (cell) => `Goal Seeking with Cell ${cell} may not have found a solution.`;
export const DATATABLE_INPUT_NOTE = 'Input cell reference is not valid.';
export const NO_LINKS_NOTE = 'This workbook contains no links to other files.';
export const TTC_OVERWRITE_NOTE = "There's already data here. Do you want to replace it?";
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
      tokensOf(src).forEach((tok, ti) => { if (/^[A-Za-z\d]+$/.test(tok.t)) for (const [cs, f] of cases) out.push({ text: f(tok.t), read: row => { const ts = tokensOf(row[si] || '').filter(x => /^[A-Za-z\d]+$/.test(x.t)); const k = tokensOf(src).filter(x => /^[A-Za-z\d]+$/.test(x.t)).findIndex(x => x === tok); return ts[k] ? f(ts[k].t) : null; } }); });
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
