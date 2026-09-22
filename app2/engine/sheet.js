// app2/engine/sheet.js — the grid model. Headless: no DOM, no timers, no globals.
//
// A Sheet holds cells (sparse map keyed 'B3'), the selection (Excel's two-corner model), column
// widths, the clipboard and the undo stack, and exposes every cell/sheet OPERATION the old build
// had (index.html r23181–r28300) as plain methods. The keyboard layer (keyboard.js) turns key
// events into these calls; the UI (ui/sheet-view.js) paints the result. Nothing here knows about
// either.
//
// Cell record (blankCell) — the same fields the old build used, so its themes/CSS keep working:
//   value      number | string | boolean | null      formula   '=SUM(A1:A3)' | null
//   txt        true when the value was typed as text (left-aligned, spills)
//   bold it uline strike  fill fontColor  wrap  align 'l'|'c'|'r'|null  indent 0..8
//   fmtStyle 'general'|'comma'|'currency'|'acct'|'percent'|'mult'|'date'   decimals  scale 0|3|6
//   bt bb bl br ball thick bdbl  (borders)   fsz (font px | null)   ca (center-across span)  cmt

import { colLetter, colIndex, refKey, parseRef, parseRange, rectRefs } from './refs.js';
import { evalFormula, translateFormula, autocorrectFormula, adjustFormulaStructure, isErrVal, formulaRefs } from './formula.js';
import { fmtNum, dispText } from './format.js';

export const COLW_DEFAULT = 64;   // px: Excel's default column width at 100% (8.43 characters); autofit widens beyond this
export const ROWH_DEFAULT = 20;   // px: Excel's default row height at 100% (15pt)
export const CHARPX = 8.6;        // mono digit width the #### test assumes
export const TXTPX = 6.9;         // proportional label glyph
export const PAD_NUM = 12, PAD_TXT = 20, FIT_SLACK = 4, COLW_MAX = 220;
export const FSZ_LADDER = [10, 11.5, 13.5, 16, 18, 20], FSZ_BASE = 13.5;

export function stepFsz(cur, dir) {
  let i = FSZ_LADDER.indexOf(cur == null ? FSZ_BASE : cur);
  if (i < 0) i = FSZ_LADDER.indexOf(FSZ_BASE);
  i = Math.max(0, Math.min(FSZ_LADDER.length - 1, i + dir));
  return FSZ_LADDER[i] === FSZ_BASE ? null : FSZ_LADDER[i];
}

export function blankCell() {
  return { value: null, formula: null, bold: false, fill: null, wrap: false,
    fmtStyle: 'general', decimals: 0, bt: false, bb: false, ball: false, txt: false,
    align: null, fontColor: null, uline: false, indent: 0, scale: 0, thick: false, fsz: null, bdbl: false,
    it: false, strike: false, bl: false, br: false, cmt: false, ca: 0 };
}

/** The format fields copy/fill/paste-formats carry (everything but value/formula). */
export const FMT_FIELDS = ['bold', 'it', 'strike', 'fill', 'wrap', 'fmtStyle', 'decimals', 'bt', 'bb', 'bl', 'br', 'ball',
  'align', 'fontColor', 'uline', 'indent', 'scale', 'thick', 'fsz', 'bdbl', 'cmt', 'txt', 'ca'];
/** What an inserted row/column inherits from its neighbour: formats (alignment incl. center-across, borders), never a comment or the typed-as-text flag. */
export const INHERIT_FIELDS = FMT_FIELDS.filter(f => f !== 'cmt' && f !== 'txt');

export const FONT_SWATCHES = [
  { k: 'black', hex: '#000000', name: 'Black' }, { k: 'darkgray', hex: '#404040', name: 'Dark gray' },
  { k: 'gray', hex: '#7f7f7f', name: 'Gray' }, { k: 'white', hex: '#ffffff', name: 'White' },
  { k: 'blue', hex: '#1f6bb8', name: 'Blue' }, { k: 'red', hex: '#c00000', name: 'Red' },
  { k: 'orange', hex: '#ed7d31', name: 'Orange' }, { k: 'yellow', hex: '#d4a017', name: 'Yellow' },
  { k: 'green', hex: '#1f8a4d', name: 'Green' }, { k: 'purple', hex: '#7030a0', name: 'Purple' },
];
export const FILL_SWATCHES = [
  { k: 'blue', hex: '#9cc3e8', name: 'Blue' }, { k: 'gray', hex: '#d4d4d4', name: 'Gray (header)' },
  { k: 'yellow', hex: '#ffe699', name: 'Yellow (flag)' }, { k: 'green', hex: '#c6e0b4', name: 'Green' },
  { k: 'red', hex: '#f2b8b8', name: 'Red' }, { k: null, hex: 'transparent', name: 'No fill' },
];
export const CELL_STYLES = [
  { k: 'normal', name: 'Normal', apply: c => { const v = c.value, f = c.formula, t = c.txt; for (const k in c) delete c[k]; Object.assign(c, blankCell()); c.value = v; c.formula = f; c.txt = t; } },
  { k: 'input', name: 'Input', apply: c => { c.fontColor = 'blue'; } },
  { k: 'link', name: 'Link', apply: c => { c.fontColor = 'green'; } },
  { k: 'heading', name: 'Heading', apply: c => { c.bold = true; c.fsz = 16; c.bb = true; } },
  { k: 'total', name: 'Total', apply: c => { c.bold = true; c.bt = true; c.bb = true; } },
  { k: 'note', name: 'Note', apply: c => { c.it = true; c.fsz = 11.5; c.fontColor = 'gray'; } },
  { k: 'warning', name: 'Warning', apply: c => { c.fontColor = 'red'; c.bold = true; } },
];

const clone = o => JSON.parse(JSON.stringify(o));
const copyFmt = (dst, src) => { for (const k of FMT_FIELDS) dst[k] = src[k] === undefined ? blankCell()[k] : src[k]; };

/* ---- width verdicts (one definition each) ---- */
export function cellNumPx(cell) {
  if (!cell || typeof cell.value !== 'number' || cell.wrap) return 0;
  const fz = cell.fsz ? cell.fsz / 13.5 : 1;
  return fmtNum(cell.value, cell.fmtStyle, cell.decimals, cell.scale).length * CHARPX * fz + PAD_NUM;
}
export function cellTxtPx(cell) {
  if (!cell || cell.wrap || typeof cell.value !== 'string' || cell.value === '') return 0;
  return cell.value.length * TXTPX + PAD_TXT;
}

export class Sheet {
  /**
   * @param {object} [opts]
   * @param {number} [opts.rows=20]  @param {number} [opts.cols=10]
   * @param {object} [opts.cells]    map key → partial cell ({value}, {formula}, format fields)
   * @param {object} [opts.colW]     map col index → px
   * @param {{r:number,c:number}} [opts.active]
   * @param {() => number} [opts.today]  Excel serial for TODAY()
   */
  constructor(opts = {}) {
    this.rows = opts.rows || 100;   // the visible canvas is Excel-like: many rows and columns, scrolled by the view
    this.cols = opts.cols || 26;
    this.cells = {};
    this.active = { r: 1, c: 1 };
    this.sel = null;        // anchor corner of a range selection, null = single cell
    this.selA = null;       // parked displayed-active cell (Shift+Space / Ctrl+Space / Ctrl+A)
    this.clipboard = null;
    this.colW = new Array(this.cols + 1).fill(COLW_DEFAULT);
    this.colSet = new Array(this.cols + 1).fill(false);   // width set explicitly (never auto-grown)
    this.undoStack = []; this.redoStack = [];
    this.tabHome = null;
    this.gridlines = true;
    this.rowH = new Array(this.rows + 1).fill(ROWH_DEFAULT);   // px per row (Excel default 20)
    this.hiddenRows = new Set(); this.hiddenCols = new Set();
    this.freeze = { r: 0, c: 0 };          // rows/cols frozen above/left of the seam (0 = none)
    this.multi = null;                     // Go To Special: an explicit list of cell keys, or null
    this.resolver = null;                  // name → Sheet, set by the Session that owns the workbook
    this.today = opts.today || null;
    this.listeners = new Set();
    this.lastFlash = null;   // {r1,c1,r2,c2} pasted footprint for the UI's one-shot flash
    if (opts.cells) for (const k in opts.cells) this.setCell(k, opts.cells[k]);
    if (opts.colW) for (const c in opts.colW) { this.colW[c] = opts.colW[c]; this.colSet[c] = true; }
    if (opts.rowH) for (const r in opts.rowH) this.rowH[r] = opts.rowH[r];
    if (opts.hiddenRows) for (const r of opts.hiddenRows) this.hiddenRows.add(r | 0);
    if (opts.hiddenCols) for (const c of opts.hiddenCols) this.hiddenCols.add(c | 0);
    if (opts.freeze) this.freeze = { r: opts.freeze.r | 0, c: opts.freeze.c | 0 };
    if (opts.active) this.active = this.clamp(opts.active.r, opts.active.c);
    this.recalc();
  }

  /* ---------------- change notification ---------------- */
  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(what) { for (const fn of this.listeners) fn(what || 'change', this); }
  /** Every mutating op ends here: recalc, then notify. */
  commit(what) { this.recalc(); this.emit(what || 'commit'); }

  /* ---------------- primitives ---------------- */
  key(r, c) { return refKey(r, c); }
  get(r, c) { return this.cells[refKey(r, c)] || blankCell(); }
  ensure(r, c) { const k = refKey(r, c); if (!this.cells[k]) this.cells[k] = blankCell(); return this.cells[k]; }
  nonEmpty(r, c) { const x = this.get(r, c); return (x.value !== null && x.value !== '') || !!x.formula; }
  inb(r, c) { return r >= 1 && r <= this.rows && c >= 1 && c <= this.cols; }
  clamp(r, c) { return { r: Math.max(1, Math.min(this.rows, r)), c: Math.max(1, Math.min(this.cols, c)) }; }

  /** Seed or overwrite a cell from a partial record: {value}, {formula}, format fields. Does not recalc. */
  setCell(ref, spec) {
    const p = typeof ref === 'string' ? parseRef(ref) : ref;
    if (!p) throw new Error('bad ref ' + ref);
    const cell = this.ensure(p.r, p.c);
    if (spec.formula) { cell.formula = spec.formula; cell.txt = false; }
    else if (spec.value !== undefined) { cell.formula = null; cell.value = spec.value; cell.txt = typeof spec.value === 'string' && !isErrVal(spec.value); }
    for (const k in spec) if (k !== 'value' && k !== 'formula') cell[k] = spec[k];
    return cell;
  }

  /* ---------------- reading back ---------------- */
  /** Cell object (a copy) at 'B3' — blank record if empty. */
  cellAt(ref) { const p = parseRef(ref); return p ? clone(this.get(p.r, p.c)) : null; }
  /** Computed value at 'B3': number | string | boolean | null. */
  value(ref) { const p = parseRef(ref); const c = p && this.cells[refKey(p.r, p.c)]; return c ? c.value : null; }
  /** Display text at 'B3', formatted as the grid paints it. */
  text(ref) { const p = parseRef(ref); return p ? dispText(this.get(p.r, p.c)) : ''; }
  formula(ref) { const p = parseRef(ref); const c = p && this.cells[refKey(p.r, p.c)]; return c ? c.formula : null; }
  /** raw() for the evaluator: the value another cell sees (null when blank). */
  raw(k) { const c = this.cells[k]; return c ? c.value : null; }
  evalCtx(extra) {
    return { raw: k => this.raw(k), rows: this.rows, cols: this.cols, today: this.today || undefined,
      // NAME!B3: another sheet of the workbook (the Session wires `resolver`); no workbook = #REF!
      sheetRaw: (name, key) => { const sh = this.resolver ? this.resolver(name) : null; return sh ? sh.raw(key) : '#REF!'; },
      ...extra };
  }

  /* ---------------- selection ---------------- */
  selRange() {
    if (!this.sel) return { r1: this.active.r, c1: this.active.c, r2: this.active.r, c2: this.active.c };
    return { r1: Math.min(this.sel.r, this.active.r), r2: Math.max(this.sel.r, this.active.r),
      c1: Math.min(this.sel.c, this.active.c), c2: Math.max(this.sel.c, this.active.c) };
  }
  /** The displayed active cell — Excel's white cell inside a selection (the anchor). */
  dispActive() {
    let a = this.active;
    if (this.sel) {
      a = { r: this.sel.r, c: this.sel.c };
      if (this.selA && this.selA.r >= 1) {
        const rg = this.selRange();
        if (this.selA.r >= rg.r1 && this.selA.r <= rg.r2 && this.selA.c >= rg.c1 && this.selA.c <= rg.c2) a = { r: this.selA.r, c: this.selA.c };
      }
    }
    return this.clamp(a.r, a.c);
  }
  eachSel(fn) {
    if (this.multi && this.multi.length) { for (const k of this.multi) { const p = parseRef(k); if (p) fn(this.ensure(p.r, p.c), p.r, p.c); } return; }
    const r = this.selRange(); for (let rr = r.r1; rr <= r.r2; rr++) for (let cc = r.c1; cc <= r.c2; cc++) fn(this.ensure(rr, cc), rr, cc);
  }
  /**
   * Set the selection to a rectangle 'A1:B3' (or a single ref); active = top-left. Both corners are
   * clamped to the grid (a range that collapses to one cell becomes a single-cell selection), so
   * eachSel never materialises cells outside rows × cols.
   */
  select(rangeText) {
    this.multi = null;
    const rg = parseRange(rangeText); if (!rg) return false;
    const a = this.clamp(rg.r1, rg.c1), b = this.clamp(rg.r2, rg.c2);
    if (a.r === b.r && a.c === b.c) { this.active = a; this.sel = null; }
    else { this.sel = a; this.active = b; }
    this.selA = null; this.tabHome = null; this.emit('select'); return true;
  }
  goTo(r, c) { this.multi = null; this.active = this.clamp(r, c); this.sel = null; this.selA = null; this.tabHome = null; this.emit('select'); }
  selectionText() {
    if (this.multi && this.multi.length) return this.multi.join(',');
    const r = this.selRange(); const a = refKey(r.r1, r.c1), b = refKey(r.r2, r.c2); return a === b ? a : a + ':' + b;
  }

  /** Excel's Ctrl+arrow: to the edge of the current data block, or to the next block. */
  ctrlJump(r, c, dr, dc) {
    if (!dr && !dc) return { r, c };
    let nr = r + dr, nc = c + dc;
    if (!this.inb(nr, nc)) return { r, c };
    if (this.nonEmpty(r, c) && this.nonEmpty(nr, nc)) {
      while (this.inb(nr + dr, nc + dc) && this.nonEmpty(nr + dr, nc + dc)) { nr += dr; nc += dc; }
    } else {
      while (this.inb(nr, nc) && !this.nonEmpty(nr, nc)) { if (!this.inb(nr + dr, nc + dc)) break; nr += dr; nc += dc; }
    }
    return { r: nr, c: nc };
  }
  /** Bottom-right of the used range (Ctrl+End). Formatted-but-empty cells count, like Excel. */
  usedRange() {
    let maxR = 1, maxC = 1;
    for (const k in this.cells) { const p = parseRef(k); if (!p) continue; if (p.r > maxR) maxR = p.r; if (p.c > maxC) maxC = p.c; }
    return { r: Math.min(maxR, this.rows), c: Math.min(maxC, this.cols) };
  }
  /** Excel's current region: grow the box until a full border ring is empty. */
  regionAround(r, c) {
    let r1 = r, r2 = r, c1 = c, c2 = c;
    const any = (rr1, cc1, rr2, cc2) => { for (let rr = Math.max(1, rr1); rr <= Math.min(this.rows, rr2); rr++) for (let cc = Math.max(1, cc1); cc <= Math.min(this.cols, cc2); cc++) if (this.nonEmpty(rr, cc)) return true; return false; };
    for (let guard = 0; guard < 60; guard++) {
      let grew = false;
      if (r1 > 1 && any(r1 - 1, c1 - 1, r1 - 1, c2 + 1)) { r1--; grew = true; }
      if (r2 < this.rows && any(r2 + 1, c1 - 1, r2 + 1, c2 + 1)) { r2++; grew = true; }
      if (c1 > 1 && any(r1 - 1, c1 - 1, r2 + 1, c1 - 1)) { c1--; grew = true; }
      if (c2 < this.cols && any(r1 - 1, c2 + 1, r2 + 1, c2 + 1)) { c2++; grew = true; }
      if (!grew) break;
    }
    return { r1, c1, r2, c2 };
  }

  /**
   * Arrow movement. Plain arrows collapse a selection and step from the displayed active cell;
   * Shift extends from the anchor; Ctrl jumps block edges; Ctrl+Shift extends by a jump.
   */
  move(dr, dc, shift, ctrl) {
    this.tabHome = null; this.multi = null;
    if (!shift && this.sel) { const a = this.dispActive(); this.active = { r: a.r, c: a.c }; this.sel = null; this.selA = null; }
    let nr, nc;
    if (ctrl) { const j = this.ctrlJump(this.active.r, this.active.c, dr, dc); nr = j.r; nc = j.c; }
    else { nc = Math.min(this.cols, Math.max(1, this.active.c + dc)); nr = Math.min(this.rows, Math.max(1, this.active.r + dr)); }
    if (shift) { if (!this.sel) { this.sel = { r: this.active.r, c: this.active.c }; this.selA = null; } }
    else this.sel = null;
    this.active = { r: nr, c: nc };
    this.emit('select');
  }
  moveHome(ctrl, shift) {   // Home → column A of this row; Ctrl+Home → A1
    this.tabHome = null; this.multi = null;
    const a = this.sel && !shift ? this.dispActive() : this.active;
    const t = ctrl ? { r: 1, c: 1 } : { r: a.r, c: 1 };
    if (shift) { if (!this.sel) { this.sel = { r: this.active.r, c: this.active.c }; this.selA = null; } }
    else { this.sel = null; this.selA = null; }
    this.active = t; this.emit('select');
  }
  moveEnd(ctrl, shift) {    // End → last used cell in the row; Ctrl+End → bottom-right of the used range
    this.tabHome = null; this.multi = null;
    const a = this.sel && !shift ? this.dispActive() : this.active;
    let t;
    if (ctrl) t = this.usedRange();
    else { let c = this.cols; while (c > 1 && !this.nonEmpty(a.r, c)) c--; t = { r: a.r, c }; }
    if (shift) { if (!this.sel) { this.sel = { r: this.active.r, c: this.active.c }; this.selA = null; } }
    else { this.sel = null; this.selA = null; }
    this.active = t; this.emit('select');
  }
  selectRow() {   // Shift+Space: the active cell's row(s); the cursor stays where it is
    this.multi = null;
    const rg = this.selRange(); const a = this.dispActive();
    this.sel = { r: rg.r1, c: 1 }; this.active = { r: rg.r2, c: this.cols }; this.selA = { r: a.r, c: a.c }; this.emit('select');
  }
  selectCol() {   // Ctrl+Space
    this.multi = null;
    const rg = this.selRange(); const a = this.dispActive();
    this.sel = { r: 1, c: rg.c1 }; this.active = { r: this.rows, c: rg.c2 }; this.selA = { r: a.r, c: a.c }; this.emit('select');
  }
  selectAll() {   // Ctrl+A: the current region first, the whole sheet when already on it (or on a blank)
    this.multi = null;
    const a = this.dispActive(); const rg = this.regionAround(a.r, a.c); const cur = this.selRange();
    const same = this.sel && cur.r1 === rg.r1 && cur.r2 === rg.r2 && cur.c1 === rg.c1 && cur.c2 === rg.c2;
    const whole = same || (rg.r1 === rg.r2 && rg.c1 === rg.c2);
    const t = whole ? { r1: 1, c1: 1, r2: this.rows, c2: this.cols } : rg;
    this.sel = { r: t.r1, c: t.c1 }; this.active = { r: t.r2, c: t.c2 }; this.selA = { r: a.r, c: a.c }; this.emit('select');
  }

  /* ---------------- undo ---------------- */
  snapshot() { return { cells: clone(this.cells), colW: this.colW.slice(), colSet: this.colSet.slice(), rows: this.rows, active: { ...this.active }, sel: this.sel && { ...this.sel },
    rowH: this.rowH.slice(), hiddenRows: [...this.hiddenRows], hiddenCols: [...this.hiddenCols], freeze: { ...this.freeze } }; }
  /** Rewind cells AND the whole selection to one moment, so undo/redo re-select the range the operation touched (Excel). */
  restore(s) {
    this.cells = clone(s.cells); this.colW = s.colW.slice(); this.colSet = s.colSet.slice(); this.rows = s.rows;
    if (s.rowH) this.rowH = s.rowH.slice();
    this.hiddenRows = new Set(s.hiddenRows || []); this.hiddenCols = new Set(s.hiddenCols || []);
    this.freeze = s.freeze ? { ...s.freeze } : { r: 0, c: 0 };
    this.multi = null;
    if (s.active) this.active = this.clamp(s.active.r, s.active.c);
    this.sel = s.sel ? this.clamp(s.sel.r, s.sel.c) : null;
    if (this.sel && this.sel.r === this.active.r && this.sel.c === this.active.c) this.sel = null;
    this.selA = null; this.tabHome = null;
  }
  pushUndo() { this.undoStack.push(this.snapshot()); if (this.undoStack.length > 60) this.undoStack.shift(); this.redoStack = []; }
  /** The frame pushed to the opposite stack keeps the current cells but the undone frame's selection, so redo lands on the same range. */
  undo() { if (!this.undoStack.length) return false; const prev = this.undoStack.pop(); const cur = this.snapshot(); cur.active = { ...prev.active }; cur.sel = prev.sel && { ...prev.sel }; this.redoStack.push(cur); this.restore(prev); this.commit('undo'); return true; }
  redo() { if (!this.redoStack.length) return false; const next = this.redoStack.pop(); const cur = this.snapshot(); cur.active = { ...next.active }; cur.sel = next.sel && { ...next.sel }; this.undoStack.push(cur); this.restore(next); this.commit('redo'); return true; }

  /* ---------------- recalc ---------------- */
  /**
   * Recalculate every formula cell. Cells are evaluated in dependency order (precedents first,
   * found from the formula's references — token based); a genuine circular reference reads 0,
   * as Excel shows it with iterative calculation off. A fixed-point pass then settles anything the
   * static references cannot see (OFFSET/INDEX-built ranges).
   */
  recalc() {
    const keys = []; for (const k in this.cells) if (this.cells[k] && this.cells[k].formula) keys.push(k);
    if (!keys.length) return;
    const fset = new Set(keys);
    // Every formula-cell key a formula actually dereferences while evaluating is recorded, so a
    // dependency that only exists through OFFSET/INDEX/INDIRECT-built ranges still joins the graph.
    const reads = {}; let cur = null;
    const ctx = this.evalCtx({ raw: kk => { if (cur && fset.has(kk)) reads[cur].add(kk); return this.raw(kk); } });
    const evalOne = k => {
      const c = this.cells[k];
      const p = parseRef(k);
      cur = k; reads[k] = new Set();
      try { return evalFormula(c.formula, { ...ctx, cell: p ? { r: p.r, c: p.c } : undefined }); }
      catch (e) { return '#NAME?'; }   // a stored formula that no longer parses reads as an error
      finally { cur = null; }
    };
    // static precedents (formula cells only), ranges clipped to the grid
    const deps = {};
    for (const k of keys) {
      const d = new Set();
      for (const ref of formulaRefs(this.cells[k].formula, { rows: this.rows, cols: this.cols })) {
        if (ref.sheet) continue;   // another sheet's cell: the Session's cross-sheet recalc covers it
        if (ref.key) { if (fset.has(ref.key)) d.add(ref.key); }
        else { const rg = ref.range; for (let r = Math.max(1, rg.r1); r <= Math.min(rg.r2, this.rows); r++) for (let c = Math.max(1, rg.c1); c <= Math.min(rg.c2, this.cols); c++) { const kk = refKey(r, c); if (fset.has(kk)) d.add(kk); } }
      }
      deps[k] = d;
    }
    // cycle detection via iterative DFS colouring: a back edge to n marks the frames from the top
    // of the stack down to n (exactly the loop's members) — never the ancestors below it
    const detect = () => {
      const state = {}; const cyclic = new Set(); const order = [];
      const visit = start => {
        const stack = [[start, [...deps[start]]]]; state[start] = 1;
        while (stack.length) {
          const top = stack[stack.length - 1]; const [k, rest] = top;
          if (!rest.length) { state[k] = 2; order.push(k); stack.pop(); continue; }
          const n = rest.pop();
          if (state[n] === 1) { for (let i = stack.length - 1; i >= 0; i--) { cyclic.add(stack[i][0]); if (stack[i][0] === n) break; } continue; }
          if (!state[n]) { state[n] = 1; stack.push([n, [...deps[n]]]); }
        }
      };
      for (const k of keys) if (!state[k]) visit(k);
      return { cyclic, order };
    };
    // fold the reads of the last evaluation into deps; true when the graph gained an edge
    const merge = () => { let added = false; for (const k of keys) { if (!reads[k]) continue; for (const d of reads[k]) if (!deps[k].has(d)) { deps[k].add(d); added = true; } } return added; };
    let { cyclic, order } = detect();
    // a cell that depends on a cyclic cell inherits nothing special — it just reads the 0
    const evalAll = () => { for (const k of order) { const c = this.cells[k]; c.value = cyclic.has(k) ? 0 : evalOne(k); } };
    evalAll();
    if (merge()) { ({ cyclic, order } = detect()); evalAll(); }
    // settle dynamic references (OFFSET etc.) with a short fixed-point pass; a loop that only
    // forms once values move is caught by the read log, and anything still moving at the cap is
    // treated as circular rather than left at an arbitrary iterate
    const CAP = Math.min(50, keys.length + 2);
    for (let pass = 0; pass < CAP; pass++) {
      const moved = [];
      for (const k of order) { if (cyclic.has(k)) continue; const c = this.cells[k]; const v = evalOne(k); if (v !== c.value) { c.value = v; moved.push(k); } }
      if (!moved.length) break;
      if (merge()) { ({ cyclic, order } = detect()); for (const k of cyclic) this.cells[k].value = 0; continue; }
      if (pass === CAP - 1) for (const k of moved) { cyclic.add(k); this.cells[k].value = 0; }
    }
  }

  /* ---------------- commit parsing (what a typed entry becomes) ---------------- */
  /**
   * Classify typed text. Returns {kind:'formula'|'value', ...} or {kind:'fix', fixed} / {kind:'bad'}
   * for a formula that needs the autocorrect ladder. Pure; does not touch the sheet.
   */
  static classifyInput(text, cell) {
    let buf = String(text).trim();
    if (buf === '') return { kind: 'empty' };
    if (buf[0] === '=') {
      const opens = (buf.match(/\(/g) || []).length, closes = (buf.match(/\)/g) || []).length;
      if (opens > closes) buf += ')'.repeat(opens - closes);   // Excel auto-closes
      const ac = autocorrectFormula(buf);
      if (ac.kind === 'fix') return { kind: 'fix', buf: ac.buf, fixed: ac.fixed };
      if (ac.kind === 'bad') return { kind: 'bad', buf: ac.buf };
      return { kind: 'formula', formula: ac.buf };
    }
    const fmt = (cell && cell.fmtStyle) || 'general';
    const pctIn = n => fmt === 'percent' ? n / 100 : n;                                   // automatic percent entry: a bare number into a percent cell is scaled
    const typedDec = b => Math.min(6, (b.split('.')[1] || '').replace(/\D/g, '').length);   // Excel keeps the typed precision (1,234.56 → 2 places)
    // number grammar mirrors the formula tokenizer: '1.', '.5', '.5e2', '1.e2' are numbers; '.', '+', '-' are not
    if (/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(buf)) return { kind: 'value', value: pctIn(parseFloat(buf)) };
    if (/^[-+]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(buf)) return { kind: 'value', value: pctIn(parseFloat(buf.replace(/,/g, ''))), fmtStyle: fmt === 'general' ? 'comma' : undefined, decimals: fmt === 'general' ? typedDec(buf) : undefined };
    if (/^[-+]?(?:\d+\.?\d*|\.\d+)%$/.test(buf)) return { kind: 'value', value: parseFloat(buf) / 100, fmtStyle: 'percent', decimals: typedDec(buf) };
    if (/^\$-?(?:\d[\d,]*\.?\d*|\.\d+)$/.test(buf)) return { kind: 'value', value: parseFloat(buf.replace(/[$,]/g, '')), fmtStyle: 'currency', decimals: /\./.test(buf) ? 2 : 0 };
    if (/^\((?:\d[\d,]*\.?\d*|\.\d+)\)$/.test(buf)) return { kind: 'value', value: pctIn(-parseFloat(buf.replace(/[(),]/g, ''))) };
    const up = buf.toUpperCase();
    if (up === 'TRUE' || up === 'FALSE') return { kind: 'value', value: up === 'TRUE' };
    if (isErrVal(up)) return { kind: 'value', value: up };
    return { kind: 'value', value: buf, txt: true };
  }

  /**
   * Write typed text into (r,c) using the commit rules. Returns the classification; on 'fix'/'bad'
   * nothing is written (the editor stays open and decides).
   */
  commitInput(text, r, c, { pushUndo = true } = {}) {
    const cell = this.get(r, c);
    const cls = Sheet.classifyInput(text, cell);
    if (cls.kind === 'fix' || cls.kind === 'bad' || cls.kind === 'empty') return cls;   // an empty entry changes nothing: no undo frame, redo kept
    if (pushUndo) this.pushUndo();
    const target = this.ensure(r, c);
    this.applyInput(target, cls, r, c);
    this.commit('edit');
    return cls;
  }
  applyInput(target, cls, r, c) {
    if (cls.kind === 'empty') return;
    if (cls.kind === 'formula') {
      target.formula = cls.formula; target.txt = false;
      let v; try { v = evalFormula(cls.formula, this.evalCtx({ cell: { r, c } })); } catch (e) { v = '#NAME?'; }
      target.value = v;
      return;
    }
    target.formula = null; target.value = cls.value; target.txt = !!cls.txt;
    if (cls.fmtStyle) target.fmtStyle = cls.fmtStyle;
    if (cls.decimals !== undefined) target.decimals = cls.decimals;
  }
  /** Ctrl+Enter: the same text into every selected cell; formulas translate relative to the anchor. */
  commitInputAll(text, ar, ac) {
    const cls = Sheet.classifyInput(text, this.get(ar, ac));
    if (cls.kind === 'fix' || cls.kind === 'bad' || cls.kind === 'empty') return cls;
    this.pushUndo();
    this.eachSel((cell, rr, cc) => {
      if (cls.kind === 'formula') {
        const f = (rr !== ar || cc !== ac) ? translateFormula(cls.formula, rr - ar, cc - ac) : cls.formula;
        this.applyInput(cell, { kind: 'formula', formula: f }, rr, cc);
      } else this.applyInput(cell, cls, rr, cc);
    });
    this.commit('edit');
    return cls;
  }

  /* ---------------- clearing ---------------- */
  deleteContents() { this.pushUndo(); this.eachSel(c => { c.value = null; c.formula = null; c.txt = false; }); this.commit('edit'); }
  clearAll() { this.pushUndo(); this.eachSel(c => { for (const k in c) delete c[k]; Object.assign(c, blankCell()); }); this.commit('edit'); }
  clearFormats() { this.pushUndo(); this.eachSel(c => { const v = c.value, f = c.formula, t = c.txt; for (const k in c) delete c[k]; Object.assign(c, blankCell()); c.value = v; c.formula = f; c.txt = t; }); this.commit('format'); }
  clearContents() { this.pushUndo(); this.eachSel(c => { c.value = null; c.formula = null; }); this.commit('edit'); }

  /* ---------------- formatting ---------------- */
  /** Excel's mixed-selection rule: set on all unless every cell already has it, then clear all. */
  toggleAllOrNone(prop) {
    let all = true;
    if (this.multi && this.multi.length) { for (const k of this.multi) { const q = parseRef(k); if (q && !this.get(q.r, q.c)[prop]) { all = false; break; } } }
    else { const r = this.selRange(); for (let rr = r.r1; rr <= r.r2 && all; rr++) for (let cc = r.c1; cc <= r.c2; cc++) if (!this.get(rr, cc)[prop]) { all = false; break; } }
    this.pushUndo(); const target = !all; this.eachSel(c => c[prop] = target); this.commit('format');
    return target;
  }
  /** Apply a mutation to every selected cell inside one undo step. */
  formatSel(fn, what = 'format') { this.pushUndo(); this.eachSel(fn); this.commit(what); }
  setNumberFormat(style, decimals) {
    this.formatSel(c => { c.fmtStyle = style; if (decimals !== undefined) c.decimals = decimals; if (style === 'general') c.scale = 0; });
    this.autoGrowSelectedCols();
  }
  changeDecimals(delta) { this.formatSel(c => { c.decimals = Math.max(0, Math.min(6, (c.decimals | 0) + delta)); }); this.autoGrowSelectedCols(); }
  setScale(scale) { this.formatSel(c => { c.scale = scale; }); }
  setAlign(a) { this.formatSel(c => { c.align = a; }); }
  changeIndent(delta) { this.formatSel(c => { c.indent = Math.max(0, Math.min(8, (c.indent | 0) + delta)); }); }
  toggleWrap() { this.formatSel(c => { c.wrap = !c.wrap; }); }
  setFill(k) { this.formatSel(c => { c.fill = k; }); }
  setFontColor(k) { this.formatSel(c => { c.fontColor = k; }); }
  fontSize(dir) { this.formatSel(c => { c.fsz = stepFsz(c.fsz, dir); }); }
  toggleStrike() { this.formatSel(c => { c.strike = !c.strike; }); }
  toggleSuperscript() { this.formatSel(c => { if (c.txt && typeof c.value === 'string') c.value = c.value.endsWith('¹') ? c.value.slice(0, -1) : c.value + '¹'; }); }
  centerAcross() { const r = this.selRange(); this.pushUndo(); const a = this.ensure(r.r1, r.c1); a.ca = r.c2 - r.c1 + 1; this.commit('format'); }
  applyCellStyle(k) { const st = CELL_STYLES.find(s => s.k === k); if (!st) return; this.formatSel(c => st.apply(c)); }
  /**
   * Borders: 'top' | 'bottom' | 'left' | 'right' | 'all' | 'topbottom' | 'double' (bottom) |
   * 'outside' | 'thick' (outside, 3px) | 'none'.
   */
  border(kind) {
    const r = this.selRange();
    if (kind === 'outside' || kind === 'thick') {
      this.pushUndo(); const thick = kind === 'thick';
      if (r.r1 === r.r2 && r.c1 === r.c2) { const a = this.ensure(r.r1, r.c1); a.ball = true; if (thick) a.thick = true; }
      else {
        for (let cc = r.c1; cc <= r.c2; cc++) { const t = this.ensure(r.r1, cc), b = this.ensure(r.r2, cc); t.bt = true; b.bb = true; if (thick) { t.thick = true; b.thick = true; } }
        for (let rr = r.r1; rr <= r.r2; rr++) { const l = this.ensure(rr, r.c1), rt = this.ensure(rr, r.c2); l.bl = true; rt.br = true; if (thick) { l.thick = true; rt.thick = true; } }
      }
      this.commit('format'); return;
    }
    const fns = {
      top: c => { c.bt = true; }, bottom: c => { c.bb = true; }, left: c => { c.bl = true; }, right: c => { c.br = true; },
      all: c => { c.ball = true; }, topbottom: c => { c.bt = true; c.bb = true; }, double: c => { c.bb = false; c.bdbl = true; },
      none: c => { c.bt = false; c.bb = false; c.bl = false; c.br = false; c.ball = false; c.thick = false; c.bdbl = false; },
    };
    if (fns[kind]) this.formatSel(fns[kind]);
  }
  dateStamp(r, c) {
    this.pushUndo(); const d = this.ensure(r, c);
    d.formula = null; d.txt = false; d.value = this.today ? this.today() : Math.floor((Date.now() - Date.UTC(1899, 11, 30)) / 86400000);
    d.fmtStyle = 'date'; d.decimals = 0; this.commit('edit');
  }

  /* ---------------- column widths ---------------- */
  neededWidth(c) {
    let w = COLW_DEFAULT;
    for (let r = 1; r <= this.rows; r++) { const cell = this.get(r, c); if (cell.wrap) continue; w = Math.max(w, cellNumPx(cell) + FIT_SLACK, cellTxtPx(cell) + FIT_SLACK); }
    return Math.min(Math.ceil(w), COLW_MAX);
  }
  /** #### verdict: the column's widest number does not fit its own (unscaled) width. */
  overflowsCol(c) { let px = 0; for (let r = 1; r <= this.rows; r++) px = Math.max(px, cellNumPx(this.get(r, c))); return px > (this.colW[c] || COLW_DEFAULT); }
  /** Excel auto-widens a column whose width was never set by hand after a number-format change. */
  autoGrowSelectedCols() {
    const fr = this.selRange();
    for (let c = fr.c1; c <= fr.c2; c++) { if (this.colSet[c]) continue; const need = this.neededWidth(c); if (need > this.colW[c]) this.colW[c] = need; }
  }
  autofitCols() { const r = this.selRange(); this.pushUndo(); for (let c = r.c1; c <= r.c2; c++) { this.colW[c] = this.neededWidth(c); this.colSet[c] = true; } this.commit('layout'); }
  /** Column width in Excel character units (Excel's dialog); ≈ 7px per unit + 5 padding. */
  setColWidth(units) {
    const px = Math.max(16, Math.min(COLW_MAX, Math.round(Number(units) * 7 + 5)));
    if (!isFinite(px)) return;
    const r = this.selRange(); this.pushUndo();
    for (let c = r.c1; c <= r.c2; c++) { this.colW[c] = px; this.colSet[c] = true; }
    this.commit('layout');
  }

  /* ---------------- clipboard ---------------- */
  copy(cut = false) {
    const r = this.selRange(); const data = [];
    for (let rr = r.r1; rr <= r.r2; rr++) { const row = []; for (let cc = r.c1; cc <= r.c2; cc++) row.push(clone(this.get(rr, cc))); data.push(row); }
    const cols = []; for (let cc = r.c1; cc <= r.c2; cc++) cols.push(this.colW[cc]);
    this.clipboard = { data, cols, h: r.r2 - r.r1 + 1, w: r.c2 - r.c1 + 1, rect: { ...r }, cut: !!cut };
    this.emit('clipboard');
  }
  clearClipboard() { if (this.clipboard) { this.clipboard = null; this.emit('clipboard'); } }
  /**
   * Paste at the selection's top-left. kind: 'all' | 'values' | 'formulas' | 'formats' |
   * 'valuesnum' | 'colwidths' | 'transpose'. op: 'none' | 'add' | 'subtract' | 'multiply' | 'divide'.
   */
  paste(kind = 'all', op = 'none') {
    const cb = this.clipboard; if (!cb) return false;
    this.multi = null;
    const sr = this.selRange(); const r0 = sr.r1, c0 = sr.c1;
    if (!(op && op !== 'none')) {   // Excel refuses a paste whose footprint would run off the sheet (the arithmetic ops only write inside the selection)
      let h = cb.h, w = cb.w;
      if (kind === 'transpose') { h = cb.w; w = cb.h; }
      else if (!cb.cut && (sr.r2 - sr.r1 + 1) % cb.h === 0 && (sr.c2 - sr.c1 + 1) % cb.w === 0) { h = sr.r2 - sr.r1 + 1; w = sr.c2 - sr.c1 + 1; }
      if (r0 + h - 1 > this.rows || c0 + w - 1 > this.cols) return false;
    }
    this.pushUndo();
    if (op && op !== 'none') {
      for (let rr = sr.r1; rr <= sr.r2; rr++) for (let cc = sr.c1; cc <= sr.c2; cc++) {
        const s = cb.data[(rr - sr.r1) % cb.h][(cc - sr.c1) % cb.w];
        if (typeof s.value !== 'number') continue;
        const cell = this.ensure(rr, cc); const k = s.value;
        if (op === 'divide' && !k) continue;
        const sym = op === 'multiply' ? '*' : op === 'divide' ? '/' : op === 'subtract' ? '-' : '+';
        if (cell.formula) cell.formula = '=(' + String(cell.formula).replace(/^=/, '') + ')' + sym + k;
        else if (typeof cell.value === 'number') cell.value = op === 'multiply' ? cell.value * k : op === 'divide' ? cell.value / k : op === 'subtract' ? cell.value - k : cell.value + k;
      }
      this.lastFlash = { ...sr }; this.commit('paste'); return true;
    }
    if (cb.cut) {
      for (let rr = cb.rect.r1; rr <= cb.rect.r2; rr++) for (let cc = cb.rect.c1; cc <= cb.rect.c2; cc++) delete this.cells[refKey(rr, cc)];
      for (let i = 0; i < cb.h; i++) for (let j = 0; j < cb.w; j++) { const cell = this.ensure(r0 + i, c0 + j); const s = cb.data[i][j]; Object.assign(cell, clone(s)); }
      this.clipboard = null;
      this.lastFlash = { r1: r0, c1: c0, r2: r0 + cb.h - 1, c2: c0 + cb.w - 1 };
      this.sel = cb.h * cb.w > 1 ? { r: r0, c: c0 } : null; this.active = cb.h * cb.w > 1 ? { r: r0 + cb.h - 1, c: c0 + cb.w - 1 } : { r: r0, c: c0 }; this.selA = null;
      this.commit('paste'); return true;
    }
    const selH = sr.r2 - sr.r1 + 1, selW = sr.c2 - sr.c1 + 1;
    let tileH = cb.h, tileW = cb.w;
    if (kind !== 'transpose' && selH % cb.h === 0 && selW % cb.w === 0) { tileH = selH; tileW = selW; }
    if (kind === 'transpose') {
      for (let i = 0; i < cb.w; i++) for (let j = 0; j < cb.h; j++) {
        const cell = this.ensure(r0 + i, c0 + j); const s = cb.data[j][i];
        cell.formula = null; cell.value = s.value; cell.txt = s.txt;
        cell.bold = s.bold; cell.it = s.it; cell.strike = s.strike; cell.fmtStyle = s.fmtStyle; cell.decimals = s.decimals; cell.align = s.align; cell.fontColor = s.fontColor;
      }
      this.lastFlash = { r1: r0, c1: c0, r2: r0 + cb.w - 1, c2: c0 + cb.h - 1 };
      this.sel = { r: r0, c: c0 }; this.active = { r: r0 + cb.w - 1, c: c0 + cb.h - 1 }; this.selA = null;
      this.commit('paste'); return true;
    }
    for (let i = 0; i < tileH; i++) for (let j = 0; j < tileW; j++) {
      const cell = this.ensure(r0 + i, c0 + j); const s = cb.data[i % cb.h][j % cb.w];
      const fdr = (r0 + i) - (cb.rect.r1 + (i % cb.h)), fdc = (c0 + j) - (cb.rect.c1 + (j % cb.w));
      const xl = f => (f && (fdr || fdc)) ? translateFormula(f, fdr, fdc) : f;
      if (kind === 'values') { cell.formula = null; cell.value = s.value; cell.txt = s.txt; }
      else if (kind === 'formulas') { cell.formula = xl(s.formula); cell.value = s.value; cell.txt = s.formula ? false : s.txt; }
      else if (kind === 'valuesnum') { cell.formula = null; cell.value = s.value; cell.txt = s.txt; cell.fmtStyle = s.fmtStyle; cell.decimals = s.decimals; cell.scale = s.scale | 0; }
      else if (kind === 'formats') { copyFmt(cell, s); }
      else if (kind === 'colwidths') { this.colW[c0 + j] = cb.cols[j % cb.w]; this.colSet[c0 + j] = true; }
      else { cell.formula = xl(s.formula); cell.value = s.value; copyFmt(cell, s); }
    }
    this.lastFlash = { r1: r0, c1: c0, r2: r0 + tileH - 1, c2: c0 + tileW - 1 };
    if (tileH * tileW > 1) { this.sel = { r: r0, c: c0 }; this.active = { r: r0 + tileH - 1, c: c0 + tileW - 1 }; }
    else { this.sel = null; this.active = { r: r0, c: c0 }; }
    this.selA = null;
    this.commit('paste'); return true;
  }
  /** Copy-then-Enter: a one-shot drop that consumes the clipboard and leaves the cursor on the destination. */
  pasteDrop() {
    const a = this.selRange(); if (!this.paste('all')) return false;
    this.clipboard = null; this.sel = null; this.selA = null; this.active = this.clamp(a.r1, a.c1); this.emit('select'); return true;
  }

  /* ---------------- fill ---------------- */
  /** Ctrl+D / Ctrl+R (and up/left): the first cell of the selection fills the rest; formulas translate. */
  fill(dir) {
    const r = this.selRange(); const vertical = dir === 'down' || dir === 'up';
    const stamp = (cell, src, dr, dc) => { copyFmt(cell, src); if (src.formula) { cell.formula = translateFormula(src.formula, dr, dc); cell.value = 0; } else { cell.formula = null; cell.value = src.value; } };
    if (vertical && r.r1 === r.r2) {
      if (dir !== 'down' || r.r1 <= 1) return false;
      this.pushUndo(); for (let c = r.c1; c <= r.c2; c++) stamp(this.ensure(r.r1, c), this.get(r.r1 - 1, c), 1, 0); this.commit('fill'); return true;
    }
    if (!vertical && r.c1 === r.c2) {
      if (dir !== 'right' || r.c1 <= 1) return false;
      this.pushUndo(); for (let rr = r.r1; rr <= r.r2; rr++) stamp(this.ensure(rr, r.c1), this.get(rr, r.c1 - 1), 0, 1); this.commit('fill'); return true;
    }
    this.pushUndo();
    if (dir === 'down') { for (let c = r.c1; c <= r.c2; c++) { const src = this.get(r.r1, c); for (let rr = r.r1 + 1; rr <= r.r2; rr++) stamp(this.ensure(rr, c), src, rr - r.r1, 0); } }
    else if (dir === 'up') { for (let c = r.c1; c <= r.c2; c++) { const src = this.get(r.r2, c); for (let rr = r.r2 - 1; rr >= r.r1; rr--) stamp(this.ensure(rr, c), src, rr - r.r2, 0); } }
    else if (dir === 'right') { for (let rr = r.r1; rr <= r.r2; rr++) { const src = this.get(rr, r.c1); for (let c = r.c1 + 1; c <= r.c2; c++) stamp(this.ensure(rr, c), src, 0, c - r.c1); } }
    else { for (let rr = r.r1; rr <= r.r2; rr++) { const src = this.get(rr, r.c2); for (let c = r.c2 - 1; c >= r.c1; c--) stamp(this.ensure(rr, c), src, 0, c - r.c2); } }
    this.commit('fill'); return true;
  }
  /** Linear series over the selection from its first two numbers (or step 1 from one). */
  fillSeries() {
    const r = this.selRange(); const vertical = r.r1 !== r.r2 && r.c1 === r.c2; const horizontal = r.r1 === r.r2 && r.c1 !== r.c2;
    if (!vertical && !horizontal) return false;
    const cells = []; if (vertical) for (let rr = r.r1; rr <= r.r2; rr++) cells.push([rr, r.c1]); else for (let cc = r.c1; cc <= r.c2; cc++) cells.push([r.r1, cc]);
    const first = this.get(...cells[0]); if (typeof first.value !== 'number') return false;
    const second = this.get(...cells[1]); const step = typeof second.value === 'number' ? second.value - first.value : 1;
    this.pushUndo();
    for (let i = 1; i < cells.length; i++) { const cell = this.ensure(...cells[i]); copyFmt(cell, first); cell.formula = null; cell.value = first.value + step * i; }
    this.commit('fill'); return true;
  }

  /**
   * AutoSum (Alt+=). Range form (any multi-cell selection) commits the sums and returns
   * {committed:true}, as Excel does: a column/row selected THROUGH its empty last cell sums into
   * that cell; a fully filled column, row or block sums into the cell(s) just below it (a filled
   * row: to its right); a block whose bottom row (or right column) is empty sums into that row
   * (column). Only columns/rows holding at least one number get a formula; the selection's data
   * is never overwritten. Single-cell form: returns {proposal:'=SUM(A1:A3)', range} for the
   * editor to open with the range live, or {proposal:'=SUM('} with no neighbours.
   */
  autoSum() {
    const r2 = this.selRange();
    if (this.sel && (r2.r2 > r2.r1 || r2.c2 > r2.c1)) {
      const isNum = (rr, cc) => typeof this.get(rr, cc).value === 'number';
      const blankRow = rr => { for (let cc = r2.c1; cc <= r2.c2; cc++) if (this.nonEmpty(rr, cc)) return false; return true; };
      const blankCol = cc => { for (let rr = r2.r1; rr <= r2.r2; rr++) if (this.nonEmpty(rr, cc)) return false; return true; };
      const targets = [];
      const colSum = (cc, rEnd, tr) => { for (let rr = r2.r1; rr <= rEnd; rr++) if (isNum(rr, cc)) { targets.push({ r: tr, c: cc, f: '=SUM(' + refKey(r2.r1, cc) + ':' + refKey(rEnd, cc) + ')' }); return; } };
      const rowSum = (rr, cEnd, tc) => { for (let cc = r2.c1; cc <= cEnd; cc++) if (isNum(rr, cc)) { targets.push({ r: rr, c: tc, f: '=SUM(' + refKey(rr, r2.c1) + ':' + refKey(rr, cEnd) + ')' }); return; } };
      if (r2.r1 === r2.r2) {                  // one row
        if (!this.nonEmpty(r2.r1, r2.c2)) rowSum(r2.r1, r2.c2 - 1, r2.c2);
        else if (r2.c2 < this.cols) rowSum(r2.r1, r2.c2, r2.c2 + 1);
      } else if (r2.c1 === r2.c2) {           // one column
        if (!this.nonEmpty(r2.r2, r2.c1)) colSum(r2.c1, r2.r2 - 1, r2.r2);
        else if (r2.r2 < this.rows) colSum(r2.c1, r2.r2, r2.r2 + 1);
      } else {                                // a block
        if (blankRow(r2.r2)) { for (let cc = r2.c1; cc <= r2.c2; cc++) colSum(cc, r2.r2 - 1, r2.r2); }
        else if (blankCol(r2.c2)) { for (let rr = r2.r1; rr <= r2.r2; rr++) rowSum(rr, r2.c2 - 1, r2.c2); }
        else if (r2.r2 < this.rows) { for (let cc = r2.c1; cc <= r2.c2; cc++) colSum(cc, r2.r2, r2.r2 + 1); }
      }
      if (targets.length) {
        this.pushUndo();
        for (const t of targets) { const cell = this.ensure(t.r, t.c); cell.formula = t.f; cell.txt = false; }
        this.commit('edit');
      }
      return { committed: true };   // nothing to sum: a no-op rather than an empty =SUM( over the selection's first cell
    }
    const { r, c } = this.dispActive();
    let a = null, b = null;
    let top = r - 1; while (top >= 1 && typeof this.get(top, c).value === 'number') top--; top++;
    if (top <= r - 1) { a = { r: top, c }; b = { r: r - 1, c }; }
    else { let left = c - 1; while (left >= 1 && typeof this.get(r, left).value === 'number') left--; left++; if (left <= c - 1) { a = { r, c: left }; b = { r, c: c - 1 }; } }
    if (!a) return { proposal: '=SUM(', range: null };
    return { proposal: '=SUM(' + refKey(a.r, a.c) + ':' + refKey(b.r, b.c), range: { a, b } };
  }

  /* ---------------- sort ---------------- */
  /** Sort the selected rows by the column of the active cell (or keyCol). Blanks stay last. */
  sort(dir, keyCol) {
    const r = this.selRange(); const sortCol = keyCol || this.dispActive().c;
    if (sortCol < r.c1 || sortCol > r.c2 || r.r1 === r.r2) return false;
    const rows = []; for (let rr = r.r1; rr <= r.r2; rr++) { const row = []; for (let cc = r.c1; cc <= r.c2; cc++) row.push(clone(this.get(rr, cc))); row.r0 = rr; rows.push(row); }
    const off = sortCol - r.c1;
    const rank = v => typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : 2;
    const cmp = (a, b) => { const va = a[off].value, vb = b[off].value; if (rank(va) !== rank(vb)) return rank(va) - rank(vb); if (typeof va === 'number') return va - vb; if (typeof va === 'string') return va.localeCompare(vb, 'en', { sensitivity: 'base' }); return (va ? 1 : 0) - (vb ? 1 : 0); };
    const blanks = rows.filter(rw => rw[off].value == null || rw[off].value === ''), filled = rows.filter(rw => !(rw[off].value == null || rw[off].value === ''));
    filled.sort(cmp); if (dir === 'desc') filled.reverse();
    const all = [...filled, ...blanks];
    this.pushUndo();
    // a row that moves takes its formulas with it as a moved cell would: relative refs shift by the row delta, $-anchored parts stay (Excel)
    let i = 0; for (let rr = r.r1; rr <= r.r2; rr++) { const dr = rr - all[i].r0; let j = 0; for (let cc = r.c1; cc <= r.c2; cc++) { const cell = all[i][j]; if (cell.formula && dr) cell.formula = translateFormula(cell.formula, dr, 0); this.cells[refKey(rr, cc)] = cell; j++; } i++; }
    this.commit('edit'); return true;
  }
  /** True when data sits directly beside a single-column selection (Excel's sort-warning case). */
  sortNeedsExpand() {
    const r = this.selRange(); if (r.c1 !== r.c2) return false;
    for (let rr = r.r1; rr <= r.r2; rr++) { if (r.c1 > 1 && this.nonEmpty(rr, r.c1 - 1)) return true; if (r.c1 < this.cols && this.nonEmpty(rr, r.c1 + 1)) return true; }
    return false;
  }

  /* ---------------- structure ---------------- */
  /** True when the record carries something an insert must not push off the sheet: a format (as Excel counts it) or a comment. */
  static hasFormat(cell) { return !!cell.cmt || INHERIT_FIELDS.some(f => f === 'decimals' ? false : f === 'fmtStyle' ? cell[f] !== 'general' : !!cell[f]); }
  /**
   * Rewrite references that point beyond the grid after a structural shift: a single ref, or a
   * range whose near corner is off the sheet, becomes #REF!; a range's far corner is clipped to
   * the edge. (The old build's adjustFormulaCols bound columns this way; rows get the same rule.)
   */
  boundFormula(f) {
    const src = String(f).trim(); const refs = formulaRefs(src); if (!refs.length) return src;
    const RX = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/;
    let out = src;
    for (let i = refs.length - 1; i >= 0; i--) {
      const x = refs[i]; let rep = null;
      if (x.sheet) continue;
      if (x.key) { const p = parseRef(x.key); if (p && (p.r > this.rows || p.c > this.cols)) rep = '#REF!'; }
      else if (x.range) {
        const rg = x.range;
        if (rg.r1 > this.rows || rg.c1 > this.cols) rep = '#REF!';
        else if (rg.r2 > this.rows || rg.c2 > this.cols) {
          const m = String(x.text).split(':').map(s => RX.exec(s));
          if (m.length === 2 && m[0] && m[1]) rep = m.map(q => q[1] + colLetter(Math.min(this.cols, colIndex(q[2]))) + q[3] + Math.min(this.rows, +q[4])).join(':');
        }
      }
      if (rep !== null && x.pos !== undefined) out = out.slice(0, x.pos) + rep + out.slice(x.end);
    }
    return out;
  }
  shiftCells(axis, at, delta) {
    const out = {}; const max = axis === 'r' ? this.rows : this.cols;
    for (const k in this.cells) {
      const p = parseRef(k); if (!p) continue;
      const n = axis === 'r' ? p.r : p.c;
      let nn;
      if (delta > 0) nn = n >= at ? n + delta : n;
      else { const cnt = -delta; if (n >= at && n < at + cnt) continue; nn = n >= at + cnt ? n - cnt : n; }
      if (nn > max) continue;   // pushed off the grid — insert() only lets a blank, unformatted record get here
      out[axis === 'r' ? refKey(nn, p.c) : refKey(p.r, nn)] = this.cells[k];
    }
    for (const k in out) { const c = out[k]; if (c && c.formula) c.formula = this.boundFormula(adjustFormulaStructure(c.formula, axis, at, delta)); }
    if (delta > 0 && at > 1) {   // an inserted band dresses like the row above / column to its left: formats only, never a comment or the text flag
      const srcKeys = Object.keys(out).filter(k => { const p = parseRef(k); return p && (axis === 'r' ? p.r === at - 1 : p.c === at - 1); });
      for (const sk of srcKeys) { const src = out[sk]; const p = parseRef(sk);
        if (!INHERIT_FIELDS.some(f => f === 'decimals' ? false : f === 'fmtStyle' ? src[f] !== 'general' : !!src[f])) continue;
        for (let i = at; i < at + delta && i <= max; i++) { const key = axis === 'r' ? refKey(i, p.c) : refKey(p.r, i); if (!out[key]) out[key] = blankCell(); for (const f of INHERIT_FIELDS) out[key][f] = src[f] === undefined ? blankCell()[f] : src[f]; } }
    }
    this.cells = out;
  }
  /**
   * Insert rows/columns at the selection (requires whole rows / columns selected, like Ctrl+Shift+=).
   * Returns false, with the sheet untouched, when the shift would push a non-blank or formatted
   * cell off the grid — Excel's "can't insert new cells because it would push non-empty cells off
   * the end of the worksheet".
   */
  insert(axis) {
    const r = this.selRange();
    const count = axis === 'r' ? r.r2 - r.r1 + 1 : r.c2 - r.c1 + 1, at = axis === 'r' ? r.r1 : r.c1, max = axis === 'r' ? this.rows : this.cols;
    for (const k in this.cells) {
      const p = parseRef(k); if (!p) continue; const n = axis === 'r' ? p.r : p.c;
      if (n >= at && n + count > max && (this.nonEmpty(p.r, p.c) || Sheet.hasFormat(this.cells[k]))) return false;
    }
    this.pushUndo(); this.clearClipboard();
    if (axis === 'r') {
      this.shiftCells('r', r.r1, count);
      const inh = r.r1 > 1 ? this.rowH[r.r1 - 1] : ROWH_DEFAULT;
      this.rowH.splice(r.r1, 0, ...new Array(count).fill(inh)); this.rowH.length = this.rows + 1;
      this.hiddenRows = new Set([...this.hiddenRows].map(n => n >= r.r1 ? n + count : n).filter(n => n <= this.rows));
      if (this.freeze.r >= r.r1) this.freeze.r = Math.min(this.rows - 1, this.freeze.r + count);
    }
    else { this.shiftCells('c', r.c1, count);
      this.hiddenCols = new Set([...this.hiddenCols].map(n => n >= r.c1 ? n + count : n).filter(n => n <= this.cols));
      if (this.freeze.c >= r.c1) this.freeze.c = Math.min(this.cols - 1, this.freeze.c + count); for (let c = this.cols; c >= r.c1 + count; c--) { this.colW[c] = this.colW[c - count]; this.colSet[c] = this.colSet[c - count]; } const inh = r.c1 > 1 ? this.colW[r.c1 - 1] : COLW_DEFAULT; for (let c = r.c1; c < r.c1 + count && c <= this.cols; c++) { this.colW[c] = inh; this.colSet[c] = r.c1 > 1 ? this.colSet[r.c1 - 1] : false; } }
    this.commit('structure'); return true;
  }
  /** Delete the selected rows/columns. The cursor lands on the seam but keeps the displayed active cell's column (rows) or row (columns), as Excel does. */
  remove(axis) {
    const r = this.selRange(); const a = this.dispActive(); this.pushUndo(); this.clearClipboard();
    if (axis === 'r') { const count = r.r2 - r.r1 + 1; this.shiftCells('r', r.r1, -count);
      this.rowH.splice(r.r1, count); while (this.rowH.length < this.rows + 1) this.rowH.push(ROWH_DEFAULT);
      this.hiddenRows = new Set([...this.hiddenRows].filter(n => n < r.r1 || n > r.r2).map(n => n > r.r2 ? n - count : n));
      if (this.freeze.r > r.r2) this.freeze.r -= count; else if (this.freeze.r >= r.r1) this.freeze.r = Math.max(0, r.r1 - 1);
      this.sel = null; this.selA = null; this.active = this.clamp(r.r1, a.c); }
    else { const count = r.c2 - r.c1 + 1; this.shiftCells('c', r.c1, -count);
      this.hiddenCols = new Set([...this.hiddenCols].filter(n => n < r.c1 || n > r.c2).map(n => n > r.c2 ? n - count : n));
      if (this.freeze.c > r.c2) this.freeze.c -= count; else if (this.freeze.c >= r.c1) this.freeze.c = Math.max(0, r.c1 - 1); for (let c = r.c1; c <= this.cols - count; c++) { this.colW[c] = this.colW[c + count]; this.colSet[c] = this.colSet[c + count]; } for (let c = Math.max(r.c1, this.cols - count + 1); c <= this.cols; c++) { this.colW[c] = COLW_DEFAULT; this.colSet[c] = false; } this.sel = null; this.selA = null; this.active = this.clamp(a.r, r.c1); }
    this.commit('structure');
  }
  /** Ctrl+Shift+= / Ctrl+- semantics: only when whole rows or whole columns are selected. False when nothing happened (partial selection, or a refused insert). */
  insertOrDelete(isInsert) {
    const r = this.selRange();
    const fullRow = r.c1 === 1 && r.c2 === this.cols, fullCol = r.r1 === 1 && r.r2 === this.rows;
    if (!fullRow && !fullCol) return false;
    if (isInsert) return this.insert(fullRow ? 'r' : 'c');
    this.remove(fullRow ? 'r' : 'c');
    return true;
  }

  /* ---------------- Go To Special (HFDS / Go To › Special) ---------------- */
  /**
   * Select every blank / constant / formula cell inside the current selection (the region around
   * the active cell when nothing is selected). Sets `multi` (an explicit key list the format and
   * clear operations act on), active = the first key. False when nothing qualifies — Excel says
   * "No cells were found." and the selection stays.
   */
  selectSpecial(kind) {
    let rg = this.selRange();
    if (!this.sel) rg = this.regionAround(this.active.r, this.active.c);
    const keys = [];
    for (let rr = rg.r1; rr <= rg.r2; rr++) for (let cc = rg.c1; cc <= rg.c2; cc++) {
      const cell = this.get(rr, cc);
      const isFormula = !!cell.formula;
      const isBlank = !isFormula && (cell.value === null || cell.value === '');
      const ok = kind === 'blanks' ? isBlank : kind === 'formulas' ? isFormula : kind === 'constants' ? (!isFormula && !isBlank) : false;
      if (ok) keys.push(refKey(rr, cc));
    }
    if (!keys.length) return false;
    const first = parseRef(keys[0]);
    this.sel = null; this.selA = null; this.tabHome = null;
    this.active = { r: first.r, c: first.c };
    this.multi = keys;
    this.emit('select');
    return true;
  }

  /* ---------------- Find & Replace (Ctrl+F / Ctrl+H) ---------------- */
  /**
   * The next cell whose display value contains `text` (case-insensitive), scanning row-major
   * after `from` (default: the active cell) and wrapping once. Moves the active cell there and
   * returns the key, or null (nothing moves) when there is no match.
   */
  findNext(text, from) {
    const t = String(text == null ? '' : text).toLowerCase(); if (!t) return null;
    const start = from || this.dispActive();
    const match = (r, c) => {
      const cell = this.get(r, c); if (cell.value === null || cell.value === '') return false;
      return String(cell.value).toLowerCase().includes(t) || (cell.formula && String(cell.formula).toLowerCase().includes(t));
    };
    const total = this.rows * this.cols;
    let idx = (start.r - 1) * this.cols + (start.c - 1);
    for (let step = 1; step <= total; step++) {
      const i = (idx + step) % total;
      const r = Math.floor(i / this.cols) + 1, c = (i % this.cols) + 1;
      if (match(r, c)) { this.goTo(r, c); return refKey(r, c); }
    }
    return null;
  }
  /**
   * Replace every occurrence of `find` (case-insensitive, substring) in values and formulas with
   * `repl`, across the whole sheet, in one undo step. Returns the number of cells changed.
   */
  replaceAll(find, repl) {
    const t = String(find == null ? '' : find); if (!t) return 0;
    const rx = new RegExp(t.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&'), 'gi');
    const to = String(repl == null ? '' : repl);
    const hits = [];
    for (const k in this.cells) {
      const cell = this.cells[k];
      if (cell.formula && rx.test(cell.formula)) hits.push(k);
      else if (typeof cell.value === 'string' && (rx.lastIndex = 0, rx.test(cell.value))) hits.push(k);
      rx.lastIndex = 0;
    }
    if (!hits.length) return 0;
    this.pushUndo();
    for (const k of hits) {
      const cell = this.cells[k];
      if (cell.formula) cell.formula = cell.formula.replace(rx, to);
      else cell.value = cell.value.replace(rx, to);
      rx.lastIndex = 0;
    }
    this.commit('edit');
    return hits.length;
  }

  /* ---------------- row height, hide/unhide, freeze ---------------- */
  /** Row Height (Alt H O H): points, as Excel's dialog takes them; px = pts × 4/3. */
  setRowHeight(pts) {
    const n = Number(pts); if (!isFinite(n) || n <= 0) return false;
    const px = Math.max(2, Math.min(160, Math.round(n * 4 / 3)));
    const r = this.selRange(); this.pushUndo();
    for (let rr = r.r1; rr <= r.r2; rr++) this.rowH[rr] = px;
    this.commit('layout'); return true;
  }
  /** AutoFit Row Height (Alt H O A): default height, doubled per extra wrapped line. */
  autofitRows() {
    const r = this.selRange(); this.pushUndo();
    for (let rr = r.r1; rr <= r.r2; rr++) {
      let h = ROWH_DEFAULT;
      for (let cc = 1; cc <= this.cols; cc++) {
        const cell = this.get(rr, cc);
        if (!cell.wrap || typeof cell.value !== 'string' || !cell.value) continue;
        const w = this.colW[cc] || COLW_DEFAULT;
        const lines = Math.max(1, Math.ceil(cellTxtPx(Object.assign({}, cell, { wrap: false })) / Math.max(20, w - 2 * 3)));
        h = Math.max(h, ROWH_DEFAULT * lines);
      }
      this.rowH[rr] = h;
    }
    this.commit('layout'); return true;
  }
  /** Ctrl+9 / Ctrl+0: hide the selection's rows / columns. */
  hideRows() { const r = this.selRange(); this.pushUndo(); for (let rr = r.r1; rr <= r.r2; rr++) this.hiddenRows.add(rr); this.commit('layout'); }
  hideCols() { const c = this.selRange(); this.pushUndo(); for (let cc = c.c1; cc <= c.c2; cc++) this.hiddenCols.add(cc); this.commit('layout'); }
  /** Ctrl+Shift+( / Ctrl+Shift+): unhide the hidden rows / columns inside the selection. */
  unhideRows() { const r = this.selRange(); this.pushUndo(); for (let rr = r.r1; rr <= r.r2; rr++) this.hiddenRows.delete(rr); this.commit('layout'); }
  unhideCols() { const c = this.selRange(); this.pushUndo(); for (let cc = c.c1; cc <= c.c2; cc++) this.hiddenCols.delete(cc); this.commit('layout'); }

  /* ---------------- serialisation ---------------- */
  toJSON() {
    const cells = {}; for (const k in this.cells) { const c = this.cells[k]; const b = blankCell(); const o = {}; for (const f in c) if (c[f] !== b[f] && !(f === 'value' && c.formula)) o[f] = c[f]; if (Object.keys(o).length) cells[k] = o; }
    const out = { rows: this.rows, cols: this.cols, cells, active: { ...this.active } };
    const rowH = {}; this.rowH.forEach((h, r) => { if (r >= 1 && h !== ROWH_DEFAULT) rowH[r] = h; });
    if (Object.keys(rowH).length) out.rowH = rowH;
    if (this.hiddenRows.size) out.hiddenRows = [...this.hiddenRows];
    if (this.hiddenCols.size) out.hiddenCols = [...this.hiddenCols];
    if (this.freeze.r || this.freeze.c) out.freeze = { ...this.freeze };
    return out;
  }
}
