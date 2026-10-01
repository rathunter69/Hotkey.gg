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
