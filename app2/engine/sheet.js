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
//   fmtStyle 'general'|'comma'|'currency'|'acct'|'percent'|'mult'|'date'|'custom'   decimals  scale 0|3|6
//   numFmt     the Excel format code when fmtStyle is 'custom' (Chapter 2; numfmt.js renders it)
//   bt bb bl br ball thick bdbl  (borders)   fsz (font px | null)   ca (center-across span)  cmt
// Conditional formatting (Chapter 2) lives beside the cells as an ordered rule list, `condFmt`
// (see normCondFmt); condFmtMap() evaluates it for the painter and the graders.

import { colLetter, colIndex, refKey, parseRef, parseRange, rectRefs, rangeText } from './refs.js';
import { evalFormula, parseFormula, translateFormula, normalizeFormula, autocorrectFormula, adjustFormulaStructure, isErrVal, formulaRefs, parses, dateTextToSerial, compareValues } from './formula.js';
import { fmtNum, dispText } from './format.js';
import { isValidFormat, normalizeCode, stepDecimals, codeDecimals } from './numfmt.js';

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
    it: false, strike: false, bl: false, br: false, cmt: false, ca: 0, numFmt: null };
}

/** The format fields copy/fill/paste-formats carry (everything but value/formula). */
export const FMT_FIELDS = ['bold', 'it', 'strike', 'fill', 'wrap', 'fmtStyle', 'decimals', 'bt', 'bb', 'bl', 'br', 'ball',
  'align', 'fontColor', 'uline', 'indent', 'scale', 'thick', 'fsz', 'bdbl', 'cmt', 'txt', 'ca', 'numFmt'];
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
/** Excel's built-in fill lists: the weekday and month names, short and long. */
const FILL_LISTS = [
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
];
/** The fill list a cell's text starts, with its position and the list re-cased like the cell (MON → TUE, mon → tue), or null. */
export function seriesList(text) {
  const t = String(text).trim(); if (!t) return null;
  for (const names of FILL_LISTS) {
    const at = names.findIndex(n => n.toLowerCase() === t.toLowerCase());
    if (at < 0) continue;
    const recase = t === t.toUpperCase() ? n => n.toUpperCase() : t === t.toLowerCase() ? n => n.toLowerCase() : n => n;
    return { at, names: names.map(recase) };
  }
  return null;
}
const copyFmt = (dst, src) => { for (const k of FMT_FIELDS) dst[k] = src[k] === undefined ? blankCell()[k] : src[k]; };

/* ---- width verdicts (one definition each) ---- */
export function cellNumPx(cell) {
  if (!cell || typeof cell.value !== 'number' || cell.wrap) return 0;
  const fz = cell.fsz ? cell.fsz / 13.5 : 1;
  return fmtNum(cell.value, cell.fmtStyle, cell.decimals, cell.scale, cell.numFmt).length * CHARPX * fz + PAD_NUM;
}

/* ---- conditional formatting (Chapter 2): the rule shapes the dialogs write and the painter reads ---- */
/** Excel's Highlight Cells presets ("with: Light Red Fill with Dark Red Text" …), by key. */
export const CF_STYLES = {
  lightred: { name: 'Light Red Fill with Dark Red Text', fill: '#ffc7ce', fontColor: '#9c0006' },
  yellow: { name: 'Yellow Fill with Dark Yellow Text', fill: '#ffeb9c', fontColor: '#9c5700' },
  green: { name: 'Green Fill with Dark Green Text', fill: '#c6efce', fontColor: '#006100' },
  redfill: { name: 'Light Red Fill', fill: '#ffc7ce', fontColor: null },
  redtext: { name: 'Red Text', fill: null, fontColor: '#9c0006' },
  redborder: { name: 'Red Border', fill: null, fontColor: null, border: '#9c0006' },
};
export const CF_STYLE_KEYS = Object.keys(CF_STYLES);
/** Excel's gradient data-bar colours, in its gallery order. */
export const CF_BAR_COLORS = [
  { k: 'blue', hex: '#638ec6', name: 'Blue' }, { k: 'green', hex: '#63c384', name: 'Green' }, { k: 'red', hex: '#ff555a', name: 'Red' },
  { k: 'orange', hex: '#ffb628', name: 'Orange' }, { k: 'lightblue', hex: '#008aef', name: 'Light Blue' }, { k: 'purple', hex: '#d6007b', name: 'Purple' },
];
/** Excel's colour-scale gallery, in its order (three-colour scales first, then two-colour). */
export const CF_SCALES = [
  { k: 'green-yellow-red', name: 'Green - Yellow - Red', colors: ['#63be7b', '#ffeb84', '#f8696b'] },
  { k: 'red-yellow-green', name: 'Red - Yellow - Green', colors: ['#f8696b', '#ffeb84', '#63be7b'] },
  { k: 'green-white-red', name: 'Green - White - Red', colors: ['#63be7b', '#fcfcff', '#f8696b'] },
  { k: 'red-white-green', name: 'Red - White - Green', colors: ['#f8696b', '#fcfcff', '#63be7b'] },
  { k: 'white-green', name: 'White - Green', colors: ['#fcfcff', '#63be7b'] },
  { k: 'green-white', name: 'Green - White', colors: ['#63be7b', '#fcfcff'] },
  { k: 'white-red', name: 'White - Red', colors: ['#fcfcff', '#f8696b'] },
  { k: 'red-white', name: 'Red - White', colors: ['#f8696b', '#fcfcff'] },
];
export const CF_OPS = ['>', '<', '>=', '<=', '=', '<>', 'between', 'notBetween'];
export const CF_OP_LABEL = { '>': 'Greater Than', '<': 'Less Than', '>=': 'Greater Than or Equal To', '<=': 'Less Than or Equal To', '=': 'Equal To', '<>': 'Not Equal To', between: 'Between', notBetween: 'Not Between' };
let cfSeq = 0;
/* ---- Applies-to geometry: a rule covers one or more rectangles ('B2:B5', 'B2,B4:B5'), as Excel's union does ---- */
/** 'B2,B4:B5' as [{r1,c1,r2,c2}, …], or null when any part is malformed. */
export function parseRanges(text) {
  const out = [];
  for (const part of String(text == null ? '' : text).split(',')) { const rg = parseRange(part.trim()); if (!rg) return null; out.push(rg); }
  return out.length ? out : null;
}
/** The Applies-to text of a rectangle list: 'B2:B5', 'B2,B4:B5'. */
export function rangesText(rects) { return rects.map(rangeText).join(','); }
const rectsMeet = (a, b) => !(a.r2 < b.r1 || a.r1 > b.r2 || a.c2 < b.c1 || a.c1 > b.c2);
const shiftRect = (rg, dr, dc) => ({ r1: rg.r1 + dr, c1: rg.c1 + dc, r2: rg.r2 + dr, c2: rg.c2 + dc });
/** The cells of `a` inside `b`, or null when they do not meet. */
export function intersectRect(a, b) {
  const r = { r1: Math.max(a.r1, b.r1), c1: Math.max(a.c1, b.c1), r2: Math.min(a.r2, b.r2), c2: Math.min(a.c2, b.c2) };
  return r.r1 <= r.r2 && r.c1 <= r.c2 ? r : null;
}
/** `rg` without the cells of `cut`: up to four rectangles (above, below, left, right), or [rg] itself when they do not meet. */
export function subtractRect(rg, cut) {
  if (!rectsMeet(rg, cut)) return [rg];
  const out = [];
  if (rg.r1 < cut.r1) out.push({ r1: rg.r1, c1: rg.c1, r2: cut.r1 - 1, c2: rg.c2 });
  if (rg.r2 > cut.r2) out.push({ r1: cut.r2 + 1, c1: rg.c1, r2: rg.r2, c2: rg.c2 });
  const mr1 = Math.max(rg.r1, cut.r1), mr2 = Math.min(rg.r2, cut.r2);
  if (rg.c1 < cut.c1) out.push({ r1: mr1, c1: rg.c1, r2: mr2, c2: cut.c1 - 1 });
  if (rg.c2 > cut.c2) out.push({ r1: mr1, c1: cut.c2 + 1, r2: mr2, c2: rg.c2 });
  return out;
}
const subtractRects = (rects, cuts) => { let out = rects; for (const cut of cuts) out = out.flatMap(rg => subtractRect(rg, cut)); return out; };
/** Rectangles that share a full edge joined (one directly below the other over the same columns, or side by side over the same rows) and any rectangle inside another dropped: the tidy Applies-to after a fill or a paste grows a rule. The first rectangle stays first. */
export function mergeRects(rects) {
  const list = rects.map(r => ({ ...r }));
  for (let again = true; again;) {
    again = false;
    outer: for (let i = 0; i < list.length; i++) for (let j = 0; j < list.length; j++) {
      if (i === j) continue;
      const a = list[i], b = list[j];
      const inside = b.r1 >= a.r1 && b.r2 <= a.r2 && b.c1 >= a.c1 && b.c2 <= a.c2;
      const below = a.c1 === b.c1 && a.c2 === b.c2 && a.r2 + 1 === b.r1;
      const beside = a.r1 === b.r1 && a.r2 === b.r2 && a.c2 + 1 === b.c1;
      if (!inside && !below && !beside) continue;
      if (below) a.r2 = b.r2; else if (beside) a.c2 = b.c2;
      list.splice(j, 1); again = true; break outer;
    }
  }
  return list;
}
/** A set of cell keys as rectangles: vertical runs per column, neighbouring columns with the same run joined (Excel's areas for a Go To Special selection), top-left area first. */
export function rectsOfKeys(keys) {
  const cols = new Map();
  for (const k of keys) { const p = parseRef(k); if (!p) continue; if (!cols.has(p.c)) cols.set(p.c, new Set()); cols.get(p.c).add(p.r); }
  const rects = [];
  for (const [c, set] of [...cols.entries()].sort((a, b) => a[0] - b[0])) {
    const rows = [...set].sort((a, b) => a - b);
    for (let i = 0; i < rows.length;) {
      let j = i; while (j + 1 < rows.length && rows[j + 1] === rows[j] + 1) j++;
      const run = { r1: rows[i], c1: c, r2: rows[j], c2: c };
      const left = rects.find(x => x.c2 === c - 1 && x.r1 === run.r1 && x.r2 === run.r2);
      if (left) left.c2 = c; else rects.push(run);
      i = j + 1;
    }
  }
  return rects.sort((a, b) => a.r1 - b.r1 || a.c1 - b.c1);
}
/** A rule's Applies-to as rectangles; the first one's top-left is where its formulas are written. */
const cfRects = rule => parseRanges(rule.range) || [];
/** Apply `fn` to every formula a rule carries: `formula`, and the '=…' operands v1 / v2 of a preset. */
function cfMapFormulas(rule, fn) {
  for (const k of ['formula', 'v1', 'v2']) if (typeof rule[k] === 'string' && rule[k].trimStart()[0] === '=') rule[k] = fn(rule[k]);
  return rule;
}
/** `rule` over `rects`: its formulas re-based from the old first cell to the new one, so every remaining cell keeps its meaning. */
function cfWithRects(rule, rects) {
  const old = cfRects(rule)[0], nw = rects[0];
  const next = { ...rule, range: rangesText(rects) };
  const dr = nw.r1 - old.r1, dc = nw.c1 - old.c1;
  if (dr || dc) cfMapFormulas(next, f => translateFormula(f, dr, dc));
  return next;
}
/** The rules with the cells of `cuts` taken out of their Applies-to (a rule left with no cell goes; one flagged `_keep` is left alone); null when no rule met them. */
function cfWithout(rules, cuts) {
  let changed = false; const out = [];
  for (const r of rules) {
    const rects = cfRects(r); const rest = r._keep ? rects : subtractRects(rects, cuts);
    if (rest.length === rects.length && rest.every((x, i) => x === rects[i])) { out.push(r); continue; }
    changed = true;
    if (rest.length) out.push(cfWithRects(r, rest));
  }
  return changed ? out : null;
}
/** `f` after the cells of `rect` moved by (dr, dc): every reference wholly inside the block follows it, $ signs kept, as a moved cell's precedents do in Excel; the rest stays. */
function relocateRefs(f, rect, dr, dc) {
  let out = String(f); const refs = formulaRefs(out);
  for (let i = refs.length - 1; i >= 0; i--) {
    const x = refs[i]; if (x.sheet || x.pos === undefined) continue;
    const rg = x.key ? parseRange(x.key) : x.range;
    if (!rg || rg.r1 < rect.r1 || rg.r2 > rect.r2 || rg.c1 < rect.c1 || rg.c2 > rect.c2) continue;
    const moved = x.text.split(':').map(s => { const m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(s); return m ? m[1] + colLetter(colIndex(m[2]) + dc) + m[3] + (+m[4] + dr) : s; }).join(':');
    out = out.slice(0, x.pos) + moved + out.slice(x.end);
  }
  return out;
}
/**
 * A Highlight Cells value as Excel's box reads it and the rule stores it: a number (1,000 / 12% /
 * $5 / (3); a date or time as its serial), TRUE / FALSE, an '=…' formula kept as text (its relative
 * references walk the range, as a formula rule's do), or the text itself ("North" is matched as
 * text, case aside). Null when Excel refuses the entry: an empty box, or a formula that does not parse.
 */
export function cfOperand(v) {
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  const t = String(v == null ? '' : v).trim();
  if (!t) return null;
  if (t[0] === '=') return parses(t.slice(1)) ? normalizeFormula(t) : null;
  const cls = Sheet.classifyInput(t, null);
  if (cls.kind === 'value' && !cls.txt && !isErrVal(cls.value)) return cls.value;
  const serial = dateTextToSerial(t);
  return serial === null ? t : serial;
}
/**
 * A rule list with sane shapes, in priority order (first wins a conflict, as Excel's Manage
 * Rules lists them). Each rule: { id, range, kind, stopIfTrue } plus, by kind:
 *   cellValue   op (CF_OPS), v1, v2 (cfOperand: a number, TRUE/FALSE, text, or '=…' evaluated per cell), style (a CF_STYLES key)
 *   formula     formula ('=B5<0', written for the top-left of the first area), style
 *   dataBar     color (a CF_BAR_COLORS key)
 *   colorScale  scale (a CF_SCALES key)
 * `range` is the Applies-to: one or more rectangles, comma-joined. Ids are unique within the list
 * (a duplicate, or a missing one, is minted) and the numbering carries on past any loaded 'cfN'.
 * Between with the bounds reversed is stored low bound first, as Excel's box swaps them; Stop If
 * True is never set on a data bar or a colour scale (Excel greys the box out). Anything malformed is dropped.
 */
export function normCondFmt(list) {
  const out = []; const seen = new Set();
  const src = Array.isArray(list) ? list : [];
  for (const x of src) { const m = x && typeof x.id === 'string' ? /^cf(\d+)$/.exec(x.id) : null; if (m && +m[1] > cfSeq) cfSeq = +m[1]; }
  for (const x of src) {
    if (!x || typeof x !== 'object') continue;
    const rects = parseRanges(x.range); if (!rects) continue;
    const id = typeof x.id === 'string' && x.id && !seen.has(x.id) ? x.id : 'cf' + (++cfSeq);
    const rule = { id, range: rangesText(rects), kind: x.kind, stopIfTrue: x.stopIfTrue === true };
    if (x.kind === 'cellValue') {
      if (!CF_OPS.includes(x.op)) continue;
      rule.op = x.op;
      const v1 = cfOperand(x.v1 === undefined ? 0 : x.v1); if (v1 === null) continue; rule.v1 = v1;
      if (x.op === 'between' || x.op === 'notBetween') {
        const v2 = cfOperand(x.v2 === undefined ? 0 : x.v2); if (v2 === null) continue; rule.v2 = v2;
        if (typeof v1 === 'number' && typeof v2 === 'number' && v1 > v2) { rule.v1 = v2; rule.v2 = v1; }
      }
      rule.style = CF_STYLES[x.style] ? x.style : 'lightred';
    }
    else if (x.kind === 'formula') { if (typeof x.formula !== 'string' || !x.formula.trim()) continue; const f = x.formula.trim(); rule.formula = normalizeFormula(f.startsWith('=') ? f : '=' + f); rule.style = CF_STYLES[x.style] ? x.style : 'lightred'; }
    else if (x.kind === 'dataBar') { rule.color = CF_BAR_COLORS.some(b => b.k === x.color) ? x.color : 'blue'; rule.stopIfTrue = false; }
    else if (x.kind === 'colorScale') { rule.scale = CF_SCALES.some(s => s.k === x.scale) ? x.scale : 'green-yellow-red'; rule.stopIfTrue = false; }
    else continue;
    seen.add(id);
    out.push(rule);
  }
  return out;
}
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/** A colour `t` (0..1) of the way from hex `a` to hex `b`. */
export function mixHex(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); }
export function cellTxtPx(cell) {
  if (!cell || cell.wrap || typeof cell.value !== 'string' || cell.value === '') return 0;
  return dispText(cell).length * TXTPX + PAD_TXT;   // the painted text: a custom text section ("Site name: "@) dresses the value
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
    this.lastAction = null;   // what F4 repeats outside Edit mode (C2 gap 10): a format, a border, a width, an insert… as a sheet-free descriptor
    this.colW = new Array(this.cols + 1).fill(COLW_DEFAULT);
    this.colSet = new Array(this.cols + 1).fill(false);   // width set explicitly (never auto-grown)
    this.undoStack = []; this.redoStack = [];
    this.tabHome = null;
    this.gridlines = true;
    this.rowH = new Array(this.rows + 1).fill(ROWH_DEFAULT);   // px per row (Excel default 20)
    this.hiddenRows = new Set(); this.hiddenCols = new Set();
    this.freeze = { r: 0, c: 0 };          // rows/cols frozen above/left of the seam (0 = none)
    this.groups = { rows: [], cols: [] };  // the outline (C2 gap 4): [{r1,r2,collapsed}] / [{c1,c2,collapsed}], one level
    this.condFmt = [];                     // conditional formatting rules in priority order (normCondFmt)
    this._cfMap = null;                    // condFmtMap() memoised until the cells or the rules change (recalc / restore / setCell drop it)
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
    if (opts.groups) this.groups = normGroups(opts.groups);
    if (opts.condFmt) this.condFmt = normCondFmt(opts.condFmt);
    if (opts.gridlines === false) this.gridlines = false;
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
    this._cfMap = null;
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
    else { nc = this.stepVisible('c', this.active.c, dc); nr = this.stepVisible('r', this.active.r, dr); }
    if (shift) { if (!this.sel) { this.sel = { r: this.active.r, c: this.active.c }; this.selA = null; } }
    else this.sel = null;
    this.active = { r: nr, c: nc };
    this.emit('select');
  }
  /** Row / column `n` is on screen: neither hidden (Ctrl+9 / Ctrl+0) nor inside a collapsed group. */
  isVisible(axis, n) { return !(axis === 'r' ? this.hiddenRows : this.hiddenCols).has(n) && !this.isFolded(axis, n); }
  /** `d` visible steps from `from` on an axis, as the arrow keys walk (Excel skips hidden and folded rows / columns); stops at the edge. */
  stepVisible(axis, from, d) {
    if (!d) return from;
    const max = axis === 'r' ? this.rows : this.cols, sign = d > 0 ? 1 : -1;
    let n = from;
    for (let left = Math.abs(d); left > 0; left--) {
      let m = n + sign;
      while (m >= 1 && m <= max && !this.isVisible(axis, m)) m += sign;
      if (m < 1 || m > max) break;
      n = m;
    }
    return n;
  }
  moveHome(ctrl, shift) {   // Home → column A of this row; Ctrl+Home → A1
    this.tabHome = null; this.multi = null;
    const a = this.sel && !shift ? this.dispActive() : this.active;
    const fz = this.freeze || { r: 0, c: 0 };
    const t = ctrl ? { r: fz.r + 1, c: fz.c + 1 } : { r: a.r, c: 1 };   // Ctrl+Home under frozen panes lands on the first unfrozen cell (Excel)
    if (shift) { if (!this.sel) { this.sel = { r: this.active.r, c: this.active.c }; this.selA = null; } }
    else { this.sel = null; this.selA = null; }
    this.active = this.clamp(t.r, t.c); this.emit('select');
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
    rowH: this.rowH.slice(), hiddenRows: [...this.hiddenRows], hiddenCols: [...this.hiddenCols], freeze: { ...this.freeze }, groups: clone(this.groups), condFmt: clone(this.condFmt) }; }
  /** Rewind cells AND the whole selection to one moment, so undo/redo re-select the range the operation touched (Excel). */
  restore(s) {
    this.cells = clone(s.cells); this.colW = s.colW.slice(); this.colSet = s.colSet.slice(); this.rows = s.rows;
    if (s.rowH) this.rowH = s.rowH.slice();
    this.hiddenRows = new Set(s.hiddenRows || []); this.hiddenCols = new Set(s.hiddenCols || []);
    this.freeze = s.freeze ? { ...s.freeze } : { r: 0, c: 0 };
    this.groups = s.groups ? normGroups(s.groups) : { rows: [], cols: [] };
    this.condFmt = s.condFmt ? normCondFmt(s.condFmt) : [];
    this._cfMap = null;
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
    this._cfMap = null;   // every mutation ends in a recalc (commit): the conditional-formatting map is re-evaluated on the next read
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
  /** Clear All / Clear Formats take the selected cells out of every conditional-formatting rule too (Excel: "removes all conditional formats and all other cell formats for selected cells"). */
  clearAll() { this.pushUndo(); this.eachSel(c => { for (const k in c) delete c[k]; Object.assign(c, blankCell()); }); this.condFmt = cfWithout(this.condFmt, this.selRects()) || this.condFmt; this.commit('edit'); }
  clearFormats() { this.pushUndo(); this.eachSel(c => { const v = c.value, f = c.formula, t = c.txt; for (const k in c) delete c[k]; Object.assign(c, blankCell()); c.value = v; c.formula = f; c.txt = t; }); this.condFmt = cfWithout(this.condFmt, this.selRects()) || this.condFmt; this.commit('format'); }
  clearContents() { this.pushUndo(); this.eachSel(c => { c.value = null; c.formula = null; }); this.commit('edit'); }

  /* ---------------- formatting ---------------- */
  /** Excel's mixed-selection rule: set on all unless every cell already has it, then clear all. */
  toggleAllOrNone(prop) {
    let all = true;
    if (this.multi && this.multi.length) { for (const k of this.multi) { const q = parseRef(k); if (q && !this.get(q.r, q.c)[prop]) { all = false; break; } } }
    else { const r = this.selRange(); for (let rr = r.r1; rr <= r.r2 && all; rr++) for (let cc = r.c1; cc <= r.c2; cc++) if (!this.get(rr, cc)[prop]) { all = false; break; } }
    this.pushUndo(); const target = !all; this.eachSel(c => c[prop] = target); this.commit('format');
    this.lastAction = { op: 'format', fn: c => { c[prop] = target; }, what: 'format' };   // F4 repeats the state it set, not the toggle (Excel)
    return target;
  }
  /** Apply a mutation to every selected cell inside one undo step. */
  formatSel(fn, what = 'format') { this.lastAction = { op: 'format', fn, what }; this.pushUndo(); this.eachSel(fn); this.commit(what); }
  /** F4 outside Edit mode: do the last format / border / width / height / insert / delete / hide again, on the current selection. False when there is nothing to repeat. */
  repeatLast() {
    const a = this.lastAction; if (!a) return false;
    if (a.op === 'format') { this.formatSel(a.fn, a.what); return true; }
    if (a.op === 'border') { this.border(a.kind); return true; }
    if (a.op === 'centerAcross') { this.centerAcross(); return true; }
    if (a.op === 'colW') { this.setColWidth(a.units); return true; }
    if (a.op === 'rowH') { this.setRowHeight(a.pts); return true; }
    if (a.op === 'insert') return this.insertOrDelete(true);
    if (a.op === 'remove') return this.insertOrDelete(false);
    if (a.op === 'hideRows') { this.hideRows(); return true; }
    if (a.op === 'hideCols') { this.hideCols(); return true; }
    if (a.op === 'unhideRows') { this.unhideRows(); return true; }
    if (a.op === 'unhideCols') { this.unhideCols(); return true; }
    return false;
  }
  setNumberFormat(style, decimals) {
    this.formatSel(c => { c.fmtStyle = style; if (decimals !== undefined) c.decimals = decimals; if (style === 'general') c.scale = 0; if (style !== 'custom') c.numFmt = null; });
    this.autoGrowSelectedCols();
  }
  /**
   * Format Cells › Custom (Chapter 2): an Excel format code on the selection. A code Excel would
   * refuse is refused here too (false, nothing changes); the decimals field mirrors the code's
   * first section so Alt H 9 / 0 keep working on it.
   */
  setCustomFormat(code) {
    const c0 = normalizeCode(code);   // 0.0x is stored as 0.0"x", as Excel's box does
    if (!c0) return false;
    if (/^\s*general\s*$/i.test(c0)) { this.setNumberFormat('general', 0); return true; }   // General (padded or not) is the built-in style, not a custom code
    this.formatSel(c => { c.fmtStyle = 'custom'; c.numFmt = c0; c.decimals = codeDecimals(c0); c.scale = 0; });
    this.autoGrowSelectedCols();
    return true;
  }
  changeDecimals(delta) {
    this.formatSel(c => {
      if (c.fmtStyle === 'custom' && c.numFmt) { const next = stepDecimals(c.numFmt, delta); if (isValidFormat(next)) { c.numFmt = next; c.decimals = codeDecimals(next); } return; }
      c.decimals = Math.max(0, Math.min(6, (c.decimals | 0) + delta));
    });
    this.autoGrowSelectedCols();
  }
  setScale(scale) { this.formatSel(c => { c.scale = scale; }); }

  /* ---------------- conditional formatting (Chapter 2) ---------------- */
  /** The selection as rectangles: the range, or a Go To Special multi-selection's areas (every one gets the rule, as Excel's Applies-to lists them). */
  selRects() { return this.multi && this.multi.length ? rectsOfKeys(this.multi) : [this.selRange()]; }
  /** Add a rule over the selection (or `rule.range`); new rules go on top, as Excel's Manage Rules lists them. Returns the rule, or null when malformed. */
  addCondFmt(rule) {
    const { id, ...spec } = rule || {};   // the sheet mints every id itself, so two rules can never share one
    const range = spec.range ? spec.range : rangesText(this.selRects());
    const [norm] = normCondFmt([{ ...spec, range }]);
    if (!norm) return null;
    this.pushUndo(); this.condFmt = [norm, ...this.condFmt]; this.commit('format');
    return norm;
  }
  removeCondFmt(id) { const i = this.condFmt.findIndex(r => r.id === id); if (i < 0) return false; this.pushUndo(); this.condFmt.splice(i, 1); this.commit('format'); return true; }
  /** Move a rule up (dir -1, higher priority) or down (dir +1). */
  moveCondFmt(id, dir) {
    const i = this.condFmt.findIndex(r => r.id === id); const j = i + (dir < 0 ? -1 : 1);
    if (i < 0 || j < 0 || j >= this.condFmt.length) return false;
    this.pushUndo(); const [r] = this.condFmt.splice(i, 1); this.condFmt.splice(j, 0, r); this.commit('format'); return true;
  }
  /** Stop If True on a rule (toggled when `on` is omitted). False, nothing changed, for a data bar or a colour scale: Excel greys their box out. */
  setCondFmtStop(id, on) { const r = this.condFmt.find(x => x.id === id); if (!r || r.kind === 'dataBar' || r.kind === 'colorScale') return false; this.pushUndo(); r.stopIfTrue = on === undefined ? !r.stopIfTrue : !!on; this.commit('format'); return true; }
  /** Clear Rules: 'sheet' drops every rule; 'selection' takes the selected cells out of every rule's Applies-to (a rule with no cell left goes), as Excel trims them. False when nothing changed. */
  clearCondFmt(scope = 'selection') {
    if (!this.condFmt.length) return false;
    const next = scope === 'sheet' ? [] : cfWithout(this.condFmt, this.selRects());
    if (!next) return false;
    this.pushUndo(); this.condFmt = next; this.commit('format'); return true;
  }
  /** Rules whose Applies-to covers the cell, in priority order. */
  condFmtRulesAt(r, c) { return this.condFmt.filter(x => cfRects(x).some(rg => r >= rg.r1 && r <= rg.r2 && c >= rg.c1 && c <= rg.c2)); }
  /**
   * Every rule evaluated over the sheet: { 'B5': { fill, fontColor, border, bar: { pct, color }, scale } }
   * for the cells at least one rule paints. Rules run top-down; a rule that holds contributes the
   * properties no higher rule set, and a Stop If True rule that holds ends the walk for that cell.
   */
  condFmtMap() {
    if (this._cfMap) return this._cfMap;   // memoised: a selection change or a repaint costs nothing; recalc() drops it
    const out = {}; this._cfMap = out;
    if (!this.condFmt.length) return out;
    const numAt = (r, c) => { const cell = this.cells[refKey(r, c)]; return cell && typeof cell.value === 'number' ? cell.value : null; };
    const clampRect = rg => ({ r1: Math.max(1, rg.r1), c1: Math.max(1, rg.c1), r2: Math.min(this.rows, rg.r2), c2: Math.min(this.cols, rg.c2) });
    // a rule's formulas are parsed once and evaluated per cell with the offset from the first area's
    // top-left, where they are written — what translating the text per cell would read
    const astOf = f => { try { return parseFormula(f); } catch (e) { return null; } };
    const evalAt = (ast, r, c, a) => { if (!ast) return '#NAME?'; try { return evalFormula(ast, this.evalCtx({ cell: { r, c }, offset: { dr: r - a.r, dc: c - a.c } })); } catch (e) { return '#NAME?'; } };
    for (const rule of this.condFmt) {
      const all = cfRects(rule); if (!all.length) continue;
      const a = { r: all[0].r1, c: all[0].c1 };
      const rects = all.map(clampRect).filter(rg => rg.r1 <= rg.r2 && rg.c1 <= rg.c2);
      let stats;   // { min, max, mid, lo, hi, axis } over the rule's numbers (data bars, colour scales), the loops clamped to the sheet
      const statsOf = () => {
        if (stats !== undefined) return stats;
        const vals = []; for (const rg of rects) for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) { const v = numAt(r, c); if (v !== null) vals.push(v); }
        vals.sort((x, y) => x - y);
        if (!vals.length) return (stats = null);
        const n = vals.length, min = vals[0], max = vals[n - 1], p = 0.5 * (n - 1), i = Math.floor(p);
        // the default three-colour midpoint is Percentile 50 — PERCENTILE.INC, the mean of the two middle values for an even count;
        // a bar's automatic minimum / maximum are the smaller of zero and the minimum / the larger of zero and the maximum, the axis where zero falls
        const lo = Math.min(0, min), hi = Math.max(0, max);
        return (stats = { min, max, mid: vals[i] + (i + 1 < n ? (vals[i + 1] - vals[i]) * (p - i) : 0), lo, hi, axis: hi > lo ? -lo / (hi - lo) : 0 });
      };
      let holds;
      if (rule.kind === 'cellValue') {
        // the comparison =A1>5 for every cell: the formula engine's own order (numbers < text < booleans,
        // text case aside, a blank reads as 0); an error cell, or an operand that errors, never formats
        const prep = v => typeof v === 'string' && v.trimStart()[0] === '=' ? { ast: astOf(v) } : { v };
        const A = prep(rule.v1), B = rule.op === 'between' || rule.op === 'notBetween' ? prep(rule.v2) : null;
        const val = (o, r, c) => o.ast !== undefined ? evalAt(o.ast, r, c, a) : o.v;
        holds = (r, c) => {
          const v = this.raw(refKey(r, c)); if (isErrVal(v)) return false;
          const x = val(A, r, c); if (isErrVal(x)) return false;
          if (!B) return compareValues(rule.op, v, x);
          const y = val(B, r, c); if (isErrVal(y)) return false;
          const inside = (compareValues('>=', v, x) && compareValues('<=', v, y)) || (compareValues('>=', v, y) && compareValues('<=', v, x));
          return rule.op === 'between' ? inside : !inside;
        };
      } else if (rule.kind === 'formula') {
        const ast = astOf(rule.formula);
        holds = (r, c) => { const x = evalAt(ast, r, c, a); return x === true || (typeof x === 'number' && x !== 0); };
      } else holds = (r, c) => numAt(r, c) !== null;   // bars and scales apply to every number in the range
      for (const rg of rects) for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) {
        const key = refKey(r, c);
        if (out[key] && out[key].stop) continue;
        if (!holds(r, c)) continue;
        const o = out[key] || (out[key] = {});
        if (rule.kind === 'cellValue' || rule.kind === 'formula') {
          const st = CF_STYLES[rule.style];
          if (st.fill && !o.fill) o.fill = st.fill;
          if (st.fontColor && !o.fontColor) o.fontColor = st.fontColor;
          if (st.border && !o.border) o.border = st.border;
        } else if (rule.kind === 'dataBar' && !('bar' in o)) {
          // proportional to zero (Excel's automatic bars): v / max on the positive side, |v| / |min| on the
          // negative, drawn from the axis; a zero has no bar, but the slot is taken (a lower bar rule never shows)
          const s = statsOf(); const v = numAt(r, c);
          let pct = 0, neg = false;
          if (s) { if (v >= 0) pct = s.hi > 0 ? v / s.hi : 0; else { pct = v / s.lo; neg = true; } }
          pct = Math.round(pct * 100) / 100;
          if (pct > 0) { const bar = { pct, color: (CF_BAR_COLORS.find(b => b.k === rule.color) || CF_BAR_COLORS[0]).hex }; if (neg) bar.neg = true; if (s.axis) bar.axis = Math.round(s.axis * 100) / 100; o.bar = bar; }
          else o.bar = null;
        } else if (rule.kind === 'colorScale' && !o.fill) {
          // a colour scale sets the fill, so a fill set higher up wins over it and it wins over a lower fill
          const s = statsOf(); const v = numAt(r, c); const cols = (CF_SCALES.find(x => x.k === rule.scale) || CF_SCALES[0]).colors;
          let hex;
          if (!s || s.max === s.min) hex = cols[cols.length - 1];
          else if (cols.length === 2) hex = mixHex(cols[0], cols[1], (v - s.min) / (s.max - s.min));
          else if (v <= s.mid) hex = mixHex(cols[0], cols[1], s.mid === s.min ? 1 : (v - s.min) / (s.mid - s.min));
          else hex = mixHex(cols[1], cols[2], s.max === s.mid ? 1 : (v - s.mid) / (s.max - s.mid));
          o.fill = hex; o.scale = hex;
        }
        if (rule.stopIfTrue) o.stop = true;
      }
    }
    for (const k in out) { const o = out[k]; delete o.stop; if (o.bar === null) delete o.bar; if (!Object.keys(o).length) delete out[k]; }
    return out;
  }
  /**
   * The rules after rows / columns are inserted (delta > 0) or deleted (delta < 0) at `at`: every
   * area follows the cells (one wholly deleted goes; a rule with none left goes), and each formula —
   * `formula`, and a preset's '=…' operands — is first re-expressed for the first surviving cell,
   * then rewritten for the shift, so the surviving cells keep referencing what they did: only a
   * reference into the deleted band becomes #REF!, as in Excel.
   */
  shiftCondFmt(axis, at, delta) {
    const out = [];
    const cnt = delta < 0 ? -delta : 0, end = at + cnt - 1;
    const firstLeft = n => (cnt && n >= at && n <= end) ? end + 1 : n;   // the first surviving row / column at or after `n`, old numbering
    for (const r of this.condFmt) {
      const rects = cfRects(r); if (!rects.length) continue;
      const kept = []; let pre = null;   // pre: the first surviving cell in the old numbering, the formulas' new home
      for (const rg of rects) {
        const t = adjustFormulaStructure('=' + rangeText(rg), axis, at, delta).slice(1);
        if (/#REF!/.test(t)) continue; const n = parseRange(t); if (!n) continue;
        if (!pre) pre = axis === 'r' ? { r: firstLeft(rg.r1), c: rg.c1 } : { r: rg.r1, c: firstLeft(rg.c1) };
        kept.push(n);
      }
      if (!kept.length) continue;
      const a = { r: rects[0].r1, c: rects[0].c1 };
      const next = { ...r, range: rangesText(kept) };
      cfMapFormulas(next, f => adjustFormulaStructure(pre.r === a.r && pre.c === a.c ? f : translateFormula(f, pre.r - a.r, pre.c - a.c), axis, at, delta));
      out.push(next);
    }
    return out;
  }
  /**
   * The rules' part of a paste over `dest`, the pasted footprint: the cells pasted over lose the
   * rules they had (a plain paste replaces conditional formats), then, when the paste carries
   * formats ('all' / 'formats'), every source rule meeting the copied block is copied over each
   * tile of the destination — one new rule per source rule, on top, its formulas shifted as a
   * copied cell's are (relative references move with the cell). `place` maps a source rectangle to
   * its destination for one tile; the transpose paste flips it.
   */
  cfPasteRules(cb, dest, carry, tiles) {
    const kept = cfWithout(this.condFmt, [dest]) || this.condFmt;
    if (!carry) { this.condFmt = kept; return; }
    const src = cb.src || this; const added = [];
    for (const rule of src.condFmt) {
      const rects = cfRects(rule); const hit = rects.map(rg => intersectRect(rg, cb.rect)).filter(Boolean);
      if (!hit.length) continue;
      const a = { r: rects[0].r1, c: rects[0].c1 };
      const placed = tiles.flatMap(place => hit.map(place));
      const t0 = placed[0];
      const { id, ...spec } = rule; const next = { ...spec, range: rangesText(mergeRects(placed)) };
      cfMapFormulas(next, f => translateFormula(f, t0.r1 - a.r, t0.c1 - a.c));   // written for the first pasted cell as the copy there reads; every other pasted cell reads its own offset from it
      added.push(next);
    }
    this.condFmt = [...normCondFmt(added), ...kept];
  }
  /**
   * A cut pasted at (r0, c0): the part of every rule inside the cut block follows the cells — a
   * rule wholly inside moves, one partly inside keeps its other cells and the moved part becomes a
   * rule of its own right below it — the cells pasted over lose the rules they had, and references
   * into the moved block follow it, as a moved cell's precedents do. `from` is the source sheet of
   * a cut from another sheet (its rules are trimmed there, the moved parts land here on top).
   */
  cfMoveRules(cb, r0, c0, from) {
    const dr = r0 - cb.rect.r1, dc = c0 - cb.rect.c1;
    const dest = { r1: r0, c1: c0, r2: r0 + cb.h - 1, c2: c0 + cb.w - 1 };
    const src = from || this; const stay = [], moved = [];
    for (const rule of src.condFmt) {
      const rects = cfRects(rule); const hit = rects.map(rg => intersectRect(rg, cb.rect)).filter(Boolean);
      if (!hit.length) { stay.push(rule); continue; }
      const rest = subtractRects(rects, [cb.rect]);
      const a = { r: rects[0].r1, c: rects[0].c1 }, x0 = { r: hit[0].r1, c: hit[0].c1 };
      const mv = { ...rule, range: rangesText(hit.map(rg => shiftRect(rg, dr, dc))), _keep: true };
      cfMapFormulas(mv, f => relocateRefs(translateFormula(f, x0.r - a.r, x0.c - a.c), cb.rect, dr, dc));
      if (rest.length) { stay.push(cfWithRects(rule, rest)); delete mv.id; }
      if (from) { delete mv.id; moved.push(mv); } else stay.push(mv);
    }
    const settle = list => (cfWithout(list, [dest]) || list).map(r => { const { _keep, ...rule } = r; return rule; });
    if (from) { from.condFmt = stay; this.condFmt = [...normCondFmt(moved), ...settle(this.condFmt)]; }
    else this.condFmt = normCondFmt(settle(stay));
  }
  /** A fill from the line `src` over `dest`: the filled cells lose the rules they had and take those of the source line, extended over them (a fill copies conditional formats); the rule's formulas keep their base. */
  cfFillRules(src, dest, vertical) {
    let changed = false;
    const out = this.condFmt.map(rule => {
      const rects = cfRects(rule); const hit = rects.map(rg => intersectRect(rg, src)).filter(Boolean);
      const rest = subtractRects(rects, [dest]);
      const grown = hit.map(h => vertical ? { r1: dest.r1, c1: h.c1, r2: dest.r2, c2: h.c2 } : { r1: h.r1, c1: dest.c1, r2: h.r2, c2: dest.c2 });
      if (!grown.length && rest.length === rects.length && rest.every((x, i) => x === rects[i])) return rule;
      changed = true;
      const next = mergeRects([...rest, ...grown]);
      return next.length ? cfWithRects(rule, next) : null;
    }).filter(Boolean);
    if (changed) this.condFmt = out;
  }
  setAlign(a) { this.formatSel(c => { c.align = a; }); }
  changeIndent(delta) { this.formatSel(c => { c.indent = Math.max(0, Math.min(8, (c.indent | 0) + delta)); }); }
  toggleWrap() { this.formatSel(c => { c.wrap = !c.wrap; }); }
  setFill(k) { this.formatSel(c => { c.fill = k; }); }
  setFontColor(k) { this.formatSel(c => { c.fontColor = k; }); }
  fontSize(dir) { this.formatSel(c => { c.fsz = stepFsz(c.fsz, dir); }); }
  toggleStrike() { this.formatSel(c => { c.strike = !c.strike; }); }
  toggleSuperscript() { this.formatSel(c => { if (c.txt && typeof c.value === 'string') c.value = c.value.endsWith('¹') ? c.value.slice(0, -1) : c.value + '¹'; }); }
  centerAcross() { const r = this.selRange(); this.lastAction = { op: 'centerAcross' }; this.pushUndo(); const a = this.ensure(r.r1, r.c1); a.ca = r.c2 - r.c1 + 1; this.commit('format'); }
  applyCellStyle(k) { const st = CELL_STYLES.find(s => s.k === k); if (!st) return; this.formatSel(c => st.apply(c)); }
  /**
   * Borders: 'top' | 'bottom' | 'left' | 'right' | 'all' | 'topbottom' | 'double' (bottom) |
   * 'outside' | 'thick' (outside, 3px) | 'none'.
   */
  border(kind) {
    const r = this.selRange();
    if (kind === 'outside' || kind === 'thick') {
      this.lastAction = { op: 'border', kind };
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
  /** The width column `c` needs for its content — the whole column, or only rows r1..r2 when given. */
  neededWidth(c, r1 = 1, r2 = this.rows) {
    let w = COLW_DEFAULT;
    for (let r = Math.max(1, r1); r <= Math.min(this.rows, r2); r++) { const cell = this.get(r, c); if (cell.wrap) continue; w = Math.max(w, cellNumPx(cell) + FIT_SLACK, cellTxtPx(cell) + FIT_SLACK); }
    return Math.min(Math.ceil(w), COLW_MAX);
  }
  /** #### verdict: the column's widest number does not fit its own (unscaled) width. */
  overflowsCol(c) { let px = 0; for (let r = 1; r <= this.rows; r++) px = Math.max(px, cellNumPx(this.get(r, c))); return px > (this.colW[c] || COLW_DEFAULT); }
  /** Excel auto-widens a column whose width was never set by hand after a number-format change. */
  autoGrowSelectedCols() {
    const fr = this.selRange();
    for (let c = fr.c1; c <= fr.c2; c++) { if (this.colSet[c]) continue; const need = this.neededWidth(c); if (need > this.colW[c]) this.colW[c] = need; }
  }
  /** AutoFit Column Width (Alt H O I): whole columns fit everything in them; a range fits to the selected cells only, as Excel does (the title row can be left out). */
  autofitCols() {
    const r = this.selRange(); const whole = r.r1 === 1 && r.r2 === this.rows;
    this.pushUndo();
    for (let c = r.c1; c <= r.c2; c++) { this.colW[c] = whole ? this.neededWidth(c) : this.neededWidth(c, r.r1, r.r2); this.colSet[c] = true; }
    this.commit('layout');
  }
  /** Column width in Excel character units (Excel's dialog); ≈ 7px per unit + 5 padding. */
  setColWidth(units) {
    const px = Math.max(16, Math.min(COLW_MAX, Math.round(Number(units) * 7 + 5)));
    if (!isFinite(px)) return;
    this.lastAction = { op: 'colW', units: Number(units) };
    const r = this.selRange(); this.pushUndo();
    for (let c = r.c1; c <= r.c2; c++) { this.colW[c] = px; this.colSet[c] = true; }
    this.commit('layout');
  }

  /* ---------------- clipboard ---------------- */
  copy(cut = false) {
    const r = this.selRange(); const data = [];
    for (let rr = r.r1; rr <= r.r2; rr++) { const row = []; for (let cc = r.c1; cc <= r.c2; cc++) row.push(clone(this.get(rr, cc))); data.push(row); }
    const cols = []; for (let cc = r.c1; cc <= r.c2; cc++) cols.push(this.colW[cc]);
    // `src` is the sheet the block came from: a workbook shares one clipboard (Session.wireSheet), so a
    // cut pasted on another sheet clears its source there, and the marquee shows only on that sheet
    this.clipboard = { data, cols, h: r.r2 - r.r1 + 1, w: r.c2 - r.c1 + 1, rect: { ...r }, cut: !!cut, src: this };
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
      const from = cb.src && cb.src !== this ? cb.src : null;   // a cut from another sheet: its cells go there (own undo entry)
      if (from) from.pushUndo();
      for (let rr = cb.rect.r1; rr <= cb.rect.r2; rr++) for (let cc = cb.rect.c1; cc <= cb.rect.c2; cc++) delete (from || this).cells[refKey(rr, cc)];
      for (let i = 0; i < cb.h; i++) for (let j = 0; j < cb.w; j++) { const cell = this.ensure(r0 + i, c0 + j); const s = cb.data[i][j]; Object.assign(cell, clone(s)); }
      this.cfMoveRules(cb, r0, c0, from);   // the conditional formats travel with the moved cells
      this.clipboard = null;
      this.lastFlash = { r1: r0, c1: c0, r2: r0 + cb.h - 1, c2: c0 + cb.w - 1 };
      this.sel = cb.h * cb.w > 1 ? { r: r0, c: c0 } : null; this.active = cb.h * cb.w > 1 ? { r: r0 + cb.h - 1, c: c0 + cb.w - 1 } : { r: r0, c: c0 }; this.selA = null;
      if (from) from.commit('paste');
      this.commit('paste'); return true;
    }
    const selH = sr.r2 - sr.r1 + 1, selW = sr.c2 - sr.c1 + 1;
    let tileH = cb.h, tileW = cb.w;
    if (kind !== 'transpose' && selH % cb.h === 0 && selW % cb.w === 0) { tileH = selH; tileW = selW; }
    if (kind === 'transpose') {
      for (let i = 0; i < cb.w; i++) for (let j = 0; j < cb.h; j++) {
        const cell = this.ensure(r0 + i, c0 + j); const s = cb.data[j][i];
        cell.formula = null; cell.value = s.value; cell.txt = s.txt;
        cell.bold = s.bold; cell.it = s.it; cell.strike = s.strike; cell.fmtStyle = s.fmtStyle; cell.decimals = s.decimals; cell.numFmt = s.numFmt || null; cell.align = s.align; cell.fontColor = s.fontColor;
      }
      // the rules come along, their areas flipped; a formula is read for the first pasted cell as a copy there would be
      this.cfPasteRules(cb, { r1: r0, c1: c0, r2: r0 + cb.w - 1, c2: c0 + cb.h - 1 }, true,
        [rg => ({ r1: r0 + (rg.c1 - cb.rect.c1), c1: c0 + (rg.r1 - cb.rect.r1), r2: r0 + (rg.c2 - cb.rect.c1), c2: c0 + (rg.r2 - cb.rect.r1) })]);
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
      else if (kind === 'valuesnum') { cell.formula = null; cell.value = s.value; cell.txt = s.txt; cell.fmtStyle = s.fmtStyle; cell.decimals = s.decimals; cell.scale = s.scale | 0; cell.numFmt = s.numFmt || null; }
      else if (kind === 'formats') { copyFmt(cell, s); }
      else if (kind === 'colwidths') { this.colW[c0 + j] = cb.cols[j % cb.w]; this.colSet[c0 + j] = true; }
      else { cell.formula = xl(s.formula); cell.value = s.value; copyFmt(cell, s); }
    }
    if (kind === 'all' || kind === 'formats') {   // a paste that carries formats carries the conditional formats: the pasted cells take the source's rules in place of their own
      const tiles = []; for (let i = 0; i < tileH; i += cb.h) for (let j = 0; j < tileW; j += cb.w) tiles.push(rg => shiftRect(rg, r0 + i - cb.rect.r1, c0 + j - cb.rect.c1));
      this.cfPasteRules(cb, { r1: r0, c1: c0, r2: r0 + tileH - 1, c2: c0 + tileW - 1 }, true, tiles);
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
    // the conditional formats of the source line extend over the filled cells (cfFillRules): the line and the rest of the selection, as rectangles
    const line = (rr1, cc1, rr2, cc2) => ({ r1: rr1, c1: cc1, r2: rr2, c2: cc2 });
    if (vertical && r.r1 === r.r2) {
      if (dir !== 'down' || r.r1 <= 1) return false;
      this.pushUndo(); for (let c = r.c1; c <= r.c2; c++) stamp(this.ensure(r.r1, c), this.get(r.r1 - 1, c), 1, 0);
      this.cfFillRules(line(r.r1 - 1, r.c1, r.r1 - 1, r.c2), line(r.r1, r.c1, r.r1, r.c2), true); this.commit('fill'); return true;
    }
    if (!vertical && r.c1 === r.c2) {
      if (dir !== 'right' || r.c1 <= 1) return false;
      this.pushUndo(); for (let rr = r.r1; rr <= r.r2; rr++) stamp(this.ensure(rr, r.c1), this.get(rr, r.c1 - 1), 0, 1);
      this.cfFillRules(line(r.r1, r.c1 - 1, r.r2, r.c1 - 1), line(r.r1, r.c1, r.r2, r.c1), false); this.commit('fill'); return true;
    }
    this.pushUndo();
    if (dir === 'down') { for (let c = r.c1; c <= r.c2; c++) { const src = this.get(r.r1, c); for (let rr = r.r1 + 1; rr <= r.r2; rr++) stamp(this.ensure(rr, c), src, rr - r.r1, 0); } this.cfFillRules(line(r.r1, r.c1, r.r1, r.c2), line(r.r1 + 1, r.c1, r.r2, r.c2), true); }
    else if (dir === 'up') { for (let c = r.c1; c <= r.c2; c++) { const src = this.get(r.r2, c); for (let rr = r.r2 - 1; rr >= r.r1; rr--) stamp(this.ensure(rr, c), src, rr - r.r2, 0); } this.cfFillRules(line(r.r2, r.c1, r.r2, r.c2), line(r.r1, r.c1, r.r2 - 1, r.c2), true); }
    else if (dir === 'right') { for (let rr = r.r1; rr <= r.r2; rr++) { const src = this.get(rr, r.c1); for (let c = r.c1 + 1; c <= r.c2; c++) stamp(this.ensure(rr, c), src, 0, c - r.c1); } this.cfFillRules(line(r.r1, r.c1, r.r2, r.c1), line(r.r1, r.c1 + 1, r.r2, r.c2), false); }
    else { for (let rr = r.r1; rr <= r.r2; rr++) { const src = this.get(rr, r.c2); for (let c = r.c2 - 1; c >= r.c1; c--) stamp(this.ensure(rr, c), src, 0, c - r.c2); } this.cfFillRules(line(r.r1, r.c2, r.r2, r.c2), line(r.r1, r.c1, r.r2, r.c2 - 1), false); }
    this.commit('fill'); return true;
  }
  /**
   * Fill Series over the selection: a linear series from its first two numbers (or step 1 from
   * one), or — as Excel's custom lists do — the weekday / month names continued from the first
   * cell ('Mon' → Tue, Wed…; 'January' → February…), the case of the first cell kept.
   */
  fillSeries() {
    const r = this.selRange(); const vertical = r.r1 !== r.r2 && r.c1 === r.c2; const horizontal = r.r1 === r.r2 && r.c1 !== r.c2;
    if (!vertical && !horizontal) return false;
    const cells = []; if (vertical) for (let rr = r.r1; rr <= r.r2; rr++) cells.push([rr, r.c1]); else for (let cc = r.c1; cc <= r.c2; cc++) cells.push([r.r1, cc]);
    const first = this.get(...cells[0]);
    const list = typeof first.value === 'string' ? seriesList(first.value) : null;
    if (list) {
      this.pushUndo();
      for (let i = 1; i < cells.length; i++) { const cell = this.ensure(...cells[i]); copyFmt(cell, first); cell.formula = null; cell.value = list.names[(list.at + i) % list.names.length]; cell.txt = true; }
      this.commit('fill'); return true;
    }
    if (typeof first.value !== 'number') return false;
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
      this.groups.rows = this.shiftGroups('r', r.r1, count);
      this.condFmt = this.shiftCondFmt('r', r.r1, count);
    }
    else { this.shiftCells('c', r.c1, count);
      this.hiddenCols = new Set([...this.hiddenCols].map(n => n >= r.c1 ? n + count : n).filter(n => n <= this.cols));
      this.groups.cols = this.shiftGroups('c', r.c1, count);
      this.condFmt = this.shiftCondFmt('c', r.c1, count);
      if (this.freeze.c >= r.c1) this.freeze.c = Math.min(this.cols - 1, this.freeze.c + count); for (let c = this.cols; c >= r.c1 + count; c--) { this.colW[c] = this.colW[c - count]; this.colSet[c] = this.colSet[c - count]; } const inh = r.c1 > 1 ? this.colW[r.c1 - 1] : COLW_DEFAULT; for (let c = r.c1; c < r.c1 + count && c <= this.cols; c++) { this.colW[c] = inh; this.colSet[c] = r.c1 > 1 ? this.colSet[r.c1 - 1] : false; } }
    this.commit('structure'); return true;
  }
  /** Delete the selected rows/columns. The cursor lands on the seam but keeps the displayed active cell's column (rows) or row (columns), as Excel does. */
  remove(axis) {
    const r = this.selRange(); const a = this.dispActive(); this.pushUndo(); this.clearClipboard();
    if (axis === 'r') { const count = r.r2 - r.r1 + 1; this.shiftCells('r', r.r1, -count);
      this.rowH.splice(r.r1, count); while (this.rowH.length < this.rows + 1) this.rowH.push(ROWH_DEFAULT);
      this.hiddenRows = new Set([...this.hiddenRows].filter(n => n < r.r1 || n > r.r2).map(n => n > r.r2 ? n - count : n));
      this.groups.rows = this.shiftGroups('r', r.r1, -count);
      this.condFmt = this.shiftCondFmt('r', r.r1, -count);
      if (this.freeze.r > r.r2) this.freeze.r -= count; else if (this.freeze.r >= r.r1) this.freeze.r = Math.max(0, r.r1 - 1);
      this.sel = null; this.selA = null; this.active = this.clamp(r.r1, a.c); }
    else { const count = r.c2 - r.c1 + 1; this.shiftCells('c', r.c1, -count);
      this.hiddenCols = new Set([...this.hiddenCols].filter(n => n < r.c1 || n > r.c2).map(n => n > r.c2 ? n - count : n));
      this.groups.cols = this.shiftGroups('c', r.c1, -count);
      this.condFmt = this.shiftCondFmt('c', r.c1, -count);
      if (this.freeze.c > r.c2) this.freeze.c -= count; else if (this.freeze.c >= r.c1) this.freeze.c = Math.max(0, r.c1 - 1); for (let c = r.c1; c <= this.cols - count; c++) { this.colW[c] = this.colW[c + count]; this.colSet[c] = this.colSet[c + count]; } for (let c = Math.max(r.c1, this.cols - count + 1); c <= this.cols; c++) { this.colW[c] = COLW_DEFAULT; this.colSet[c] = false; } this.sel = null; this.selA = null; this.active = this.clamp(a.r, r.c1); }
    this.commit('structure');
  }
  /** Ctrl+Shift+= / Ctrl+- semantics: only when whole rows or whole columns are selected. False when nothing happened (partial selection, or a refused insert). */
  insertOrDelete(isInsert) {
    const r = this.selRange();
    const fullRow = r.c1 === 1 && r.c2 === this.cols, fullCol = r.r1 === 1 && r.r2 === this.rows;
    if (!fullRow && !fullCol) return false;
    this.lastAction = { op: isInsert ? 'insert' : 'remove' };
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
    this.lastAction = { op: 'rowH', pts: n };
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
  hideRows() { const r = this.selRange(); this.lastAction = { op: 'hideRows' }; this.pushUndo(); for (let rr = r.r1; rr <= r.r2; rr++) this.hiddenRows.add(rr); this.commit('layout'); }
  hideCols() { const c = this.selRange(); this.lastAction = { op: 'hideCols' }; this.pushUndo(); for (let cc = c.c1; cc <= c.c2; cc++) this.hiddenCols.add(cc); this.commit('layout'); }
  /** Ctrl+Shift+( / Ctrl+Shift+): unhide the hidden rows / columns inside the selection. */
  unhideRows() { const r = this.selRange(); this.lastAction = { op: 'unhideRows' }; this.pushUndo(); for (let rr = r.r1; rr <= r.r2; rr++) this.hiddenRows.delete(rr); this.commit('layout'); }
  unhideCols() { const c = this.selRange(); this.lastAction = { op: 'unhideCols' }; this.pushUndo(); for (let cc = c.c1; cc <= c.c2; cc++) this.hiddenCols.delete(cc); this.commit('layout'); }

  /* ---------------- grouping / outline (C2 gap 4) ---------------- */
  /**
   * Group the selection's whole rows ('r') or whole columns ('c') into one outline level
   * (Alt+Shift+→, Data › Group): a band that touches an existing group joins it. False, with
   * nothing changed, when the selection is not whole rows / columns or the band is already a group.
   */
  group(axis) {
    const r = this.selRange();
    const full = axis === 'r' ? (r.c1 === 1 && r.c2 === this.cols) : (r.r1 === 1 && r.r2 === this.rows);
    if (!full) return false;
    return this.groupSpan(axis, axis === 'r' ? r.r1 : r.c1, axis === 'r' ? r.r2 : r.c2);
  }
  /** Group rows / columns a..b on an axis (the Group dialog's Rows / Columns answer over a cell range takes this route). */
  groupSpan(axis, a, b) {
    const key = axis === 'r' ? 'rows' : 'cols', k1 = axis === 'r' ? 'r1' : 'c1', k2 = axis === 'r' ? 'r2' : 'c2';
    if (this.groups[key].some(g => g[k1] <= a && g[k2] >= b)) return false;   // already inside a group: one level, nothing to add
    this.pushUndo();
    let lo = a, hi = b, keep = this.groups[key].slice();
    for (let merged = true; merged;) {   // every band touching the new one joins it, however the joins chain
      merged = false; const rest = [];
      for (const g of keep) { if (g[k2] < lo - 1 || g[k1] > hi + 1) rest.push(g); else { lo = Math.min(lo, g[k1]); hi = Math.max(hi, g[k2]); merged = true; } }
      keep = rest;
    }
    keep.push({ [k1]: lo, [k2]: hi, collapsed: false });
    keep.sort((x, y) => x[k1] - y[k1]);
    this.groups[key] = keep;
    this.commit('layout'); return true;
  }
  /** Ungroup (Alt+Shift+←, Data › Ungroup): the selection's whole rows / columns leave whatever group they are in; a group cut in two survives as two. False when nothing changed. */
  ungroup(axis) {
    const r = this.selRange();
    const full = axis === 'r' ? (r.c1 === 1 && r.c2 === this.cols) : (r.r1 === 1 && r.r2 === this.rows);
    if (!full) return false;
    return this.ungroupSpan(axis, axis === 'r' ? r.r1 : r.c1, axis === 'r' ? r.r2 : r.c2);
  }
  /** Ungroup rows / columns a..b on an axis (the Ungroup dialog's answer over a cell range). */
  ungroupSpan(axis, a, b) {
    const key = axis === 'r' ? 'rows' : 'cols', k1 = axis === 'r' ? 'r1' : 'c1', k2 = axis === 'r' ? 'r2' : 'c2';
    const out = []; let changed = false;
    for (const g of this.groups[key]) {
      if (g[k2] < a || g[k1] > b) { out.push(g); continue; }
      changed = true;
      if (g[k1] < a) out.push({ ...g, [k2]: a - 1 });
      if (g[k2] > b) out.push({ ...g, [k1]: b + 1 });
    }
    if (!changed) return false;
    this.pushUndo();
    this.groups[key] = out;
    this.commit('layout'); return true;
  }
  /** Data › Ungroup › Clear Outline: every group on the sheet goes. False when there was none. */
  clearOutline() {
    if (!this.groups.rows.length && !this.groups.cols.length) return false;
    this.pushUndo(); this.groups = { rows: [], cols: [] }; this.commit('layout'); return true;
  }
  /** The group (with its index) holding row / column `n` on an axis, or null. */
  groupAt(axis, n) {
    const key = axis === 'r' ? 'rows' : 'cols', k1 = axis === 'r' ? 'r1' : 'c1', k2 = axis === 'r' ? 'r2' : 'c2';
    const i = this.groups[key].findIndex(g => n >= g[k1] && n <= g[k2]);
    return i < 0 ? null : { i, g: this.groups[key][i] };
  }
  /** Fold (collapsed = true) or unfold one group by index; false when there is no such group or nothing changes. */
  setGroupFold(axis, i, collapsed) {
    const g = this.groups[axis === 'r' ? 'rows' : 'cols'][i]; if (!g || !!g.collapsed === !!collapsed) return false;
    this.pushUndo(); g.collapsed = !!collapsed; this.commit('layout'); return true;
  }
  /**
   * Hide Detail (Alt A H) / Show Detail (Alt A J): fold or unfold the group the displayed active cell
   * sits in — its row group first, else its column group. False when it is in no group.
   */
  foldAtActive(collapsed) {
    const a = this.dispActive();
    // inside the band, or on the summary row / column just past it — where the ⊖ / ⊕ sits and where a folded band leaves you (Excel acts on that group too)
    const find = (axis, n) => { const h = this.groupAt(axis, n); if (h) return h; const list = this.groups[axis === 'r' ? 'rows' : 'cols'], k2 = axis === 'r' ? 'r2' : 'c2'; const i = list.findIndex(g => g[k2] + 1 === n); return i < 0 ? null : { i, g: list[i] }; };
    const hr = find('r', a.r), hc = hr ? null : find('c', a.c);
    const hit = hr ? ['r', hr.i] : hc ? ['c', hc.i] : null;
    if (!hit) return false;
    return this.setGroupFold(hit[0], hit[1], collapsed);
  }
  /** Is row / column `n` inside a collapsed group (folded away in the view, never `hidden`)? */
  isFolded(axis, n) { const h = this.groupAt(axis, n); return !!(h && h.g.collapsed); }
  /** Shift an axis's groups for an insert (delta > 0 at `at`) or a delete (delta < 0: the band at..at−delta−1 goes). */
  shiftGroups(axis, at, delta) {
    const list = this.groups[axis === 'r' ? 'rows' : 'cols'], k1 = axis === 'r' ? 'r1' : 'c1', k2 = axis === 'r' ? 'r2' : 'c2', max = axis === 'r' ? this.rows : this.cols;
    const out = [];
    for (const g of list) {
      let a = g[k1], b = g[k2];
      if (delta > 0) { if (a >= at) a += delta; if (b >= at) b += delta; }   // an insert inside the band grows it; above it, moves it
      else {
        const cnt = -delta, end = at + cnt - 1, shift = n => (n > end ? n - cnt : n);
        if (a >= at && b <= end) continue;                       // the whole group went
        a = a >= at && a <= end ? at : shift(a);
        b = b >= at && b <= end ? at - 1 : shift(b);
        if (b < a) continue;
      }
      if (a > max) continue;
      out.push({ ...g, [k1]: a, [k2]: Math.min(b, max) });
    }
    return out;
  }

  /* ---------------- serialisation ---------------- */
  toJSON() {
    const cells = {}; for (const k in this.cells) { const c = this.cells[k]; const b = blankCell(); const o = {}; for (const f in c) if (c[f] !== b[f] && !(f === 'value' && c.formula)) o[f] = c[f]; if (Object.keys(o).length) cells[k] = o; }
    const out = { rows: this.rows, cols: this.cols, cells, active: { ...this.active } };
    const rowH = {}; this.rowH.forEach((h, r) => { if (r >= 1 && h !== ROWH_DEFAULT) rowH[r] = h; });
    if (Object.keys(rowH).length) out.rowH = rowH;
    if (this.hiddenRows.size) out.hiddenRows = [...this.hiddenRows];
    if (this.hiddenCols.size) out.hiddenCols = [...this.hiddenCols];
    if (this.freeze.r || this.freeze.c) out.freeze = { ...this.freeze };
    if (this.groups.rows.length || this.groups.cols.length) out.groups = clone(this.groups);
    if (this.condFmt.length) out.condFmt = clone(this.condFmt);
    return out;
  }
}

/** A groups record with sane shapes: rows [{r1,r2,collapsed}], cols [{c1,c2,collapsed}], sorted, each band r1 ≤ r2. */
export function normGroups(g) {
  const band = (x, k1, k2) => { if (!x || typeof x !== 'object') return null; const a = x[k1] | 0, b = x[k2] | 0; if (a < 1 || b < a) return null; return { [k1]: a, [k2]: b, collapsed: x.collapsed === true }; };
  const rows = (Array.isArray(g && g.rows) ? g.rows : []).map(x => band(x, 'r1', 'r2')).filter(Boolean).sort((x, y) => x.r1 - y.r1);
  const cols = (Array.isArray(g && g.cols) ? g.cols : []).map(x => band(x, 'c1', 'c2')).filter(Boolean).sort((x, y) => x.c1 - y.c1);
  return { rows, cols };
}
