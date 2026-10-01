// app2/engine/dialogs.js — the Excel dialogs Chapter 1 drives by keyboard, as desktop Excel has
// them (run R1: M40, M44, M64, M66, M67, M70, M72). Headless: each dialog is a draft (`session.dlg`)
// that keys edit and OK writes; the views read the draft to paint. installDialogs(Session) mixes
// the methods into keyboard.js's Session, so the dispatcher and the Alt walk reach them exactly as
// they reach Go To or Page Setup.
//
//   Format Cells (Ctrl+1, Alt H O E)   six tabs; the Number tab's categories, Decimal places, Use
//                                       1000 Separator and the four Negative numbers choices write
//                                       Excel's codes; OK is one action F4 repeats
//   Series (Alt H F I S)               Rows / Columns, Linear / Growth / Date / AutoFill, Step, Stop
//   Zoom (Alt W Q), 100% (Alt W J)     the sheet's own zoom
//   Define Name (Alt M M D)            a workbook name on the selection
//   Note (Shift+F2)                    the cell's note: typing writes it, Esc leaves it
// Every tabbed dialog reopens on the tab last used in the session, with the keyboard on the row of
// tabs: there a letter picks a tab, and Ctrl+PgDn / Ctrl+PgUp / Ctrl+Tab (or the browser alias
// Alt+PgDn / Alt+PgUp, M41) step through them; Tab steps onto the page.

import { Sheet, clampZoom, FILL_SWATCHES, FONT_SWATCHES } from './sheet.js';
import { builtinCode, isValidFormat, normalizeCode, codeDecimals } from './numfmt.js';
import { refKey, parseRef, parseRange, rangeText, colLetter } from './refs.js';

/* ======================================================================== */
/* Format Cells: the Number tab's codes (pure, unit-tested)                  */
/* ======================================================================== */
export const FC_TABS = [
  { k: 'number', label: 'Number', key: 'N' }, { k: 'alignment', label: 'Alignment', key: 'A' }, { k: 'font', label: 'Font', key: 'F' },
  { k: 'border', label: 'Border', key: 'B' }, { k: 'fill', label: 'Fill', key: 'F' }, { k: 'protection', label: 'Protection', key: 'P' },
];
/** Excel's Category list, in its order. */
export const FC_CATEGORIES = [
  { k: 'general', label: 'General' }, { k: 'number', label: 'Number' }, { k: 'currency', label: 'Currency' }, { k: 'accounting', label: 'Accounting' },
  { k: 'date', label: 'Date' }, { k: 'time', label: 'Time' }, { k: 'percentage', label: 'Percentage' }, { k: 'fraction', label: 'Fraction' },
  { k: 'scientific', label: 'Scientific' }, { k: 'text', label: 'Text' }, { k: 'special', label: 'Special' }, { k: 'custom', label: 'Custom' },
];
/** The Type lists of the categories that have one (the first is the default). */
export const FC_TYPES = {
  date: ['m/d/yyyy', 'dddd, mmmm d, yyyy', 'm/d', 'm/d/yy', 'mm/dd/yy', 'd-mmm', 'd-mmm-yy', 'mmm-yy', 'mmmm d, yyyy'],
  time: ['h:mm:ss AM/PM', 'h:mm AM/PM', 'h:mm', 'h:mm:ss', 'mm:ss.0', '[h]:mm:ss'],
  fraction: ['# ?/?', '# ??/??', '# ???/???', '# ?/2', '# ?/4', '# ?/8', '# ??/16', '# ?/10', '# ??/100'],
  special: ['00000', '00000-0000', '[<=9999999]###-####;(###) ###-####', '000-00-0000'],
};
/** The four Negative numbers choices: -1,234.10 · 1,234.10 in red · (1,234.10) · (1,234.10) in red. */
export const FC_NEGATIVES = ['minus', 'red', 'paren', 'parenRed'];
/** Categories whose page carries Decimal places. */
const HAS_DECIMALS = new Set(['number', 'currency', 'accounting', 'percentage', 'scientific']);
const zeros = d => (d > 0 ? '.' + '0'.repeat(d) : '');

/**
 * The code Excel writes for a Number or Currency choice: decimals 0..30, the separator (Number
 * only: Currency always groups) and the Negative numbers choice. Picking 0 decimals, the separator
 * and (1,234) writes #,##0_);(#,##0), the desk number format (M64).
 */
export function numberCode(cat, decimals, sep, neg) {
  const d = Math.max(0, Math.min(30, decimals | 0));
  const body = (cat === 'currency' ? '"$"#,##0' : sep ? '#,##0' : '0') + zeros(d);
  switch (neg) {
    case 'red': return body + ';[Red]' + body;
    case 'paren': return body + '_);(' + body + ')';
    case 'parenRed': return body + '_);[Red](' + body + ')';
    default: return cat === 'currency' ? body.replace('"$"', '"$"') : body;
  }
}

/**
 * What the Number tab writes on OK: { style, decimals, numFmt } for the cell fields. The choices
 * the built-in styles already render the same way stay those styles (Number with the separator and
 * (1,234) is the Comma style #,##0_);(#,##0); Currency with ($1,234) the Currency style; Accounting,
 * Percentage, General), so a cell reads the same however it was dressed; everything else is the
 * custom code Excel writes. Null when the Custom code will not do (Excel refuses it).
 */
export function numberTabResult(d) {
  const dec = Math.max(0, Math.min(30, parseInt(d.decimals, 10) || 0));
  switch (d.cat) {
    case 'general': return { style: 'general', decimals: 0, numFmt: null };
    case 'number': return d.sep && d.neg === 'paren' ? { style: 'comma', decimals: dec, numFmt: null } : { style: 'custom', numFmt: numberCode('number', dec, d.sep, d.neg) };
    case 'currency': return d.neg === 'paren' ? { style: 'currency', decimals: dec, numFmt: null } : { style: 'custom', numFmt: numberCode('currency', dec, true, d.neg) };
    case 'accounting': return { style: 'acct', decimals: dec, numFmt: null };
    case 'percentage': return { style: 'percent', decimals: dec, numFmt: null };
    case 'scientific': return { style: 'custom', numFmt: '0' + zeros(dec) + 'E+00' };
    case 'text': return { style: 'custom', numFmt: '@' };
    case 'date': { const t = FC_TYPES.date[d.typeIdx | 0] || FC_TYPES.date[0]; return t === 'mmm-yy' ? { style: 'date', decimals: 0, numFmt: null } : { style: 'custom', numFmt: t }; }
    case 'time': case 'fraction': case 'special': return { style: 'custom', numFmt: FC_TYPES[d.cat][d.typeIdx | 0] || FC_TYPES[d.cat][0] };
    case 'custom': {
      const code = normalizeCode(d.code);
      if (!code) return null;
      if (/^\s*general\s*$/i.test(code)) return { style: 'general', decimals: 0, numFmt: null };
      return { style: 'custom', numFmt: code };
    }
  }
  return null;
}

/** The Number tab as it opens on a cell: the category and controls that show its current format. */
export function numberDraftFromCell(cell) {
  const st = cell.fmtStyle || 'general', dec = cell.decimals | 0;
  const base = { cat: 'general', decimals: '2', sep: false, neg: 'minus', typeIdx: 0, code: '' };
  const code = st === 'custom' && cell.numFmt ? cell.numFmt : builtinCode(st, dec, cell.scale | 0);
  base.code = code;
  if (st === 'general') return base;
  if (st === 'comma' && !cell.scale) return { ...base, cat: 'number', decimals: String(dec), sep: true, neg: 'paren' };
  if (st === 'currency' && !cell.scale) return { ...base, cat: 'currency', decimals: String(dec), sep: true, neg: 'paren' };
  if (st === 'acct' && !cell.scale) return { ...base, cat: 'accounting', decimals: String(dec) };
  if (st === 'percent') return { ...base, cat: 'percentage', decimals: String(dec) };
  if (st === 'date') return { ...base, cat: 'date', typeIdx: FC_TYPES.date.indexOf('mmm-yy') };
  if (st === 'custom' && cell.numFmt) {
    // a code one of the pages writes reopens on that page, Excel-style; anything else on Custom
    for (const cat of ['number', 'currency']) for (let d = 0; d <= 30; d++) for (const sep of cat === 'number' ? [false, true] : [true]) for (const neg of FC_NEGATIVES)
      if (numberCode(cat, d, sep, neg) === cell.numFmt) return { ...base, cat, decimals: String(d), sep, neg };
    for (const cat of ['date', 'time', 'fraction', 'special']) { const i = FC_TYPES[cat].indexOf(cell.numFmt); if (i >= 0) return { ...base, cat, typeIdx: i }; }
    const sci = /^0(?:\.(0+))?E\+00$/.exec(cell.numFmt); if (sci) return { ...base, cat: 'scientific', decimals: String(sci[1] ? sci[1].length : 0) };
    if (cell.numFmt === '@') return { ...base, cat: 'text' };
  }
  return { ...base, cat: 'custom' };
}

/* ======================================================================== */
/* Series (M67): the fill a Series dialog writes (pure on the sheet)        */
/* ======================================================================== */
const FILL_LISTS = [
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
];
function listOf(text) {
  const t = String(text).trim(); if (!t) return null;
  for (const names of FILL_LISTS) {
    const at = names.findIndex(n => n.toLowerCase() === t.toLowerCase()); if (at < 0) continue;
    const recase = t === t.toUpperCase() ? n => n.toUpperCase() : t === t.toLowerCase() ? n => n.toLowerCase() : n => n;
    return { at, names: names.map(recase) };
  }
  return null;
}
const isWeekend = serial => { const wd = ((Math.floor(serial) - 1) % 7 + 7) % 7; return wd === 0 || wd === 1; };   // Excel's serial weekday: 0 Saturday, 1 Sunday
function addMonths(serial, n) {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Math.round((Date.UTC(y, m, Math.min(day, last)) - Date.UTC(1899, 11, 30)) / 86400000) + (serial - Math.floor(serial));
}

/**
 * Fill the selection as Excel's Series dialog does. spec: { dir: 'rows' | 'cols', type: 'linear' |
 * 'growth' | 'date' | 'autofill', step, stop, unit: 'day' | 'weekday' | 'month' | 'year' }. Each row
 * (or column) of the selection fills from its first cell:
 *   linear    start + step × i: a number only, text is left as it is
 *   growth    start × step^i
 *   date      a date stepped by days, weekdays, months or years
 *   autofill  the pattern the first cells set, as the fill handle reads it: Mon runs to Sat, two
 *             numbers set the step (15, 16 → 17 …), one number or plain text is copied
 * A stop value ends the series where the next value would pass it. The first cell's format goes
 * with the series. Returns true when any cell was written (one undo step).
 */
export function fillSeriesSpec(sheet, spec) {
  const S = sheet; const r = S.selRange();
  const dir = spec.dir === 'rows' ? 'rows' : 'cols';
  const step = Number(spec.step); const stop = spec.stop === '' || spec.stop == null ? null : Number(spec.stop);
  if (spec.type !== 'autofill' && !Number.isFinite(step)) return false;
  const lines = [];
  if (dir === 'cols') for (let c = r.c1; c <= r.c2; c++) { const l = []; for (let rr = r.r1; rr <= r.r2; rr++) l.push([rr, c]); lines.push(l); }
  else for (let rr = r.r1; rr <= r.r2; rr++) { const l = []; for (let c = r.c1; c <= r.c2; c++) l.push([rr, c]); lines.push(l); }
  const writes = [];
  const past = v => stop !== null && (step >= 0 ? v > stop + 1e-9 : v < stop - 1e-9);
  for (const line of lines) {
    if (line.length < 2) continue;
    const first = S.get(...line[0]);
    if (spec.type === 'autofill') {
      const list = typeof first.value === 'string' && !first.formula ? listOf(first.value) : null;
      if (list) { for (let i = 1; i < line.length; i++) writes.push([line[i], first, list.names[(list.at + i) % list.names.length], true]); continue; }
      const nums = []; for (const p of line) { const v = S.get(...p); if (typeof v.value === 'number' && !v.formula) nums.push(v.value); else break; }
      if (nums.length >= 2) {
        // the fill handle extends the selection's numbers by their straight-line trend: two of them set the step
        const n = nums.length, mx = (n - 1) / 2, my = nums.reduce((a, b) => a + b, 0) / n;
        let sxy = 0, sxx = 0; nums.forEach((y, i) => { sxy += (i - mx) * (y - my); sxx += (i - mx) * (i - mx); });
        const b = sxy / sxx, a = my - b * mx;
        for (let i = n; i < line.length; i++) writes.push([line[i], S.get(...line[0]), Math.round((a + b * i) * 1e10) / 1e10, false]);
        continue;
      }
      if (first.value === null || first.value === '' || first.formula) continue;
      for (let i = 1; i < line.length; i++) writes.push([line[i], first, first.value, !!first.txt]);
      continue;
    }
    if (typeof first.value !== 'number' || first.formula) continue;   // Linear, Growth and Date step a number: a day name is left alone
    let v = first.value;
    for (let i = 1; i < line.length; i++) {
      if (spec.type === 'growth') v = v * step;
      else if (spec.type === 'date') {
        const u = spec.unit || 'day';
        if (u === 'month') v = addMonths(first.value, step * i);
        else if (u === 'year') v = addMonths(first.value, 12 * step * i);
        else if (u === 'weekday') { let k = Math.abs(Math.round(step)); const s = step < 0 ? -1 : 1; while (k > 0) { v += s; if (!isWeekend(v)) k--; } }
        else v = v + step;
      } else v = first.value + step * i;
      v = Math.round(v * 1e10) / 1e10;
      if (past(v)) break;
      writes.push([line[i], first, v, false]);
    }
  }
  if (!writes.length) return false;
  S.pushUndo();
  for (const [[rr, cc], src, val, txt] of writes) {
    const cell = S.ensure(rr, cc);
    for (const k of ['bold', 'it', 'strike', 'fill', 'fmtStyle', 'decimals', 'numFmt', 'align', 'fontColor', 'uline', 'indent', 'scale']) cell[k] = src[k] === undefined ? null : src[k];
    if (cell.fmtStyle == null) cell.fmtStyle = 'general'; if (cell.decimals == null) cell.decimals = 0; if (cell.scale == null) cell.scale = 0; if (cell.indent == null) cell.indent = 0;
    for (const k of ['bold', 'it', 'strike', 'uline']) cell[k] = !!cell[k];
    cell.formula = null; cell.value = val; cell.txt = txt;
  }
  S.commit('fill');
  return true;
}

/* ======================================================================== */
/* Defined names (M40)                                                      */
/* ======================================================================== */
export const NAME_BAD_NOTE = 'The name that you entered is not valid.';
export const NAME_TAKEN_NOTE = 'The name that you entered already exists. Enter a unique name.';
/** Excel's rule for a defined name: a letter, _ or \ first, then letters, digits, _ and .; no spaces; not a cell reference (A1, R1C1); not C or R alone; at most 255 characters. */
export function isValidName(name) {
  const t = String(name == null ? '' : name);
  if (!t || t.length > 255) return false;
  if (!/^[A-Za-z_\\][A-Za-z0-9_.\\]*$/.test(t)) return false;
  if (/^[cr]$/i.test(t)) return false;
  if (/^\$?[A-Za-z]{1,3}\$?\d+$/.test(t)) { const p = parseRef(t); if (p && p.c <= 16384 && p.r <= 1048576) return false; }
  if (/^[rR]\d*[cC]\d*$/.test(t)) return false;
  return true;
}
/** The name Define Name suggests: the label in the cell to the left (or above), spaces as underscores, when it makes a valid name. */
export function suggestName(sheet, r, c) {
  for (const [rr, cc] of [[r, c - 1], [r - 1, c]]) {
    if (rr < 1 || cc < 1) continue;
    const v = sheet.get(rr, cc).value;
    if (typeof v !== 'string' || !v.trim()) continue;
    const s = v.trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_.\\]/g, '');
    const t = /^[0-9.]/.test(s) ? '_' + s : s;
    if (isValidName(t)) return t;
  }
  return '';
}
/** A sheet name as a reference prefix: Report!, 'Site P&L'! */
export const sheetRef = n => (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(n) ? n : "'" + String(n).replace(/'/g, "''") + "'") + '!';
const absRange = rg => { const a = '$' + colLetter(rg.c1) + '$' + rg.r1, b = '$' + colLetter(rg.c2) + '$' + rg.r2; return a === b ? a : a + ':' + b; };

/* ======================================================================== */
/* Zoom                                                                      */
/* ======================================================================== */
/** The Zoom dialog's Magnification choices with their keys (Excel: 20(0)%, (1)00%, (7)5%, (5)0%, (2)5%, (F)it selection, (C)ustom). */
export const ZOOM_CHOICES = [{ k: '0', z: 200, label: '200%' }, { k: '1', z: 100, label: '100%' }, { k: '7', z: 75, label: '75%' }, { k: '5', z: 50, label: '50%' }, { k: '2', z: 25, label: '25%' },
  { k: 'F', z: 'fit', label: 'Fit selection' }, { k: 'C', z: 'custom', label: 'Custom:' }];

/* ======================================================================== */
/* The Session methods                                                      */
/* ======================================================================== */
const stepIn = (list, cur, dir) => { const i = Math.max(0, list.indexOf(cur)); return list[(i + dir + list.length) % list.length]; };
/** The keys a dialog's tab row answers to as one step: 'NextTab' / 'PrevTab'. */
export function tabStepOf(e) {
  const k = e.key;
  if ((k === 'PageDown' || k === 'PageUp') && (e.ctrlKey || e.altKey)) return k === 'PageDown' ? 'NextTab' : 'PrevTab';
  if (k === 'Tab' && e.ctrlKey) return e.shiftKey ? 'PrevTab' : 'NextTab';
  return null;
}

const methods = {
  /* ---------------- Format Cells (Ctrl+1, Alt H O E) ---------------- */
  openFormatCells(tab) {
    this.startClock();
    const S = this.sheet; const a = S.dispActive(); const cell = S.get(a.r, a.c);
    const t = FC_TABS.some(x => x.k === tab) ? tab : (this.lastTabs.formatcells || 'number');
    this.openDialog('formatcells', this.mode === 'ribbon' ? this.path : []);
    this.lastTabs.formatcells = t;
    const nd = numberDraftFromCell(cell);
    this.dlg = { kind: 'formatcells', tab: t, focus: 'tabs', fresh: null, dirty: {},
      ...nd, catIdx: FC_CATEGORIES.findIndex(x => x.k === nd.cat), codeSel: true,
      align: cell.align || 'general', ca: (cell.ca | 0) > 1, wrap: !!cell.wrap, indent: String(cell.indent | 0),
      bold: !!cell.bold, it: !!cell.it, uline: !!cell.uline, strike: !!cell.strike, fontColor: cell.fontColor || null,
      border: null, fill: cell.fill || null, locked: true, hidden: false };
  },
  /** The controls of the open Format Cells page, in Tab order. */
  fcOrder() {
    const d = this.dlg; if (!d) return [];
    if (d.tab === 'number') {
      const out = ['category'];
      if (HAS_DECIMALS.has(d.cat)) out.push('decimals');
      if (d.cat === 'number') out.push('sep');
      if (d.cat === 'number' || d.cat === 'currency') out.push('neg');
      if (FC_TYPES[d.cat]) out.push('type');
      if (d.cat === 'custom') out.push('code');
      return out;
    }
    if (d.tab === 'alignment') return ['horizontal', 'indent', 'wrap'];
    if (d.tab === 'font') return ['style', 'underline', 'strike', 'color'];
    if (d.tab === 'border') return ['presets'];
    if (d.tab === 'fill') return ['swatches'];
    return ['locked', 'hidden'];
  },
  fcSetTab(k) { const d = this.dlg; d.tab = k; d.focus = 'tabs'; this.lastTabs.formatcells = k; },
  fcSetCat(i) { const d = this.dlg; d.catIdx = Math.max(0, Math.min(FC_CATEGORIES.length - 1, i)); const was = d.cat; d.cat = FC_CATEGORIES[d.catIdx].k; d.typeIdx = 0; d.dirty.number = true; if (d.cat !== was && HAS_DECIMALS.has(d.cat)) d.decimals = '2';   /* Excel shows each category's own default, 2 places */ if (d.cat === 'custom') d.codeSel = true; },
  formatCellsKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') { this.formatCellsOk(); return; }
    if (key === 'NextTab' || key === 'PrevTab') { this.fcSetTab(stepIn(FC_TABS.map(t => t.k), d.tab, key === 'NextTab' ? 1 : -1)); return; }
    const order = this.fcOrder();
    if (key === 'Tab' || key === 'Shift+Tab') {
      const ring = ['tabs'].concat(order); const i = Math.max(0, ring.indexOf(d.focus));
      d.focus = ring[(i + (key === 'Tab' ? 1 : ring.length - 1)) % ring.length]; d.fresh = d.focus === 'decimals' || d.focus === 'indent' ? d.focus : null; return;
    }
    // the row of tabs: a letter picks a tab (F steps between Font and Fill), ← → step; a letter no tab has does nothing
    if (d.focus === 'tabs' && !key.startsWith('Alt+')) {   // Alt with a control's letter reaches it from the tab row too
      if (key === 'ArrowRight' || key === 'ArrowLeft') { this.fcSetTab(stepIn(FC_TABS.map(t => t.k), d.tab, key === 'ArrowRight' ? 1 : -1)); return; }
      if (/^[A-Z]$/.test(key)) { const hits = FC_TABS.filter(t => t.key === key); if (hits.length) { const cur = hits.findIndex(t => t.k === d.tab); this.fcSetTab(hits[(cur + 1) % hits.length].k); } return; }
      if (key === 'ArrowDown') { d.focus = order[0]; }
      return;
    }
    if (d.tab === 'number') return this.fcNumberKey(key);
    return this.fcOtherKey(key);
  },
  fcNumberKey(key) {
    const d = this.dlg;
    // Alt with an underlined letter reaches a control from anywhere on the page
    if (key.startsWith('Alt+')) {
      const L = key.slice(4);
      if (L === 'C') { d.focus = 'category'; return; }
      if (L === 'D' && HAS_DECIMALS.has(d.cat)) { d.focus = 'decimals'; d.fresh = 'decimals'; return; }
      if (L === 'U' && d.cat === 'number') { d.sep = !d.sep; d.focus = 'sep'; d.dirty.number = true; return; }
      if (L === 'N' && (d.cat === 'number' || d.cat === 'currency')) { d.focus = 'neg'; return; }
      if (L === 'T' && (FC_TYPES[d.cat] || d.cat === 'custom')) { d.focus = d.cat === 'custom' ? 'code' : 'type'; return; }
      return;
    }
    if (d.focus === 'category') {
      if (key === 'ArrowDown' || key === 'ArrowUp') { this.fcSetCat(d.catIdx + (key === 'ArrowDown' ? 1 : -1)); return; }
      if (key === 'Home') { this.fcSetCat(0); return; }
      if (key === 'End') { this.fcSetCat(FC_CATEGORIES.length - 1); return; }
      if (/^[A-Z]$/.test(key)) {   // a letter: the next category starting with it (C: Currency, then Custom)
        const n = FC_CATEGORIES.length;
        for (let s = 1; s <= n; s++) { const i = (d.catIdx + s) % n; if (FC_CATEGORIES[i].label[0] === key) { this.fcSetCat(i); return; } }
      }
      return;
    }
    if (d.focus === 'decimals') {
      if (key === 'ArrowUp' || key === 'ArrowDown') { const n = Math.max(0, Math.min(30, (parseInt(d.decimals, 10) || 0) + (key === 'ArrowUp' ? 1 : -1))); d.decimals = String(n); d.fresh = null; d.dirty.number = true; return; }
      if (/^[0-9]$/.test(key)) { const next = d.fresh === 'decimals' ? key : (d.decimals + key).slice(0, 2); d.decimals = String(Math.min(30, parseInt(next, 10))); d.fresh = null; d.dirty.number = true; return; }
      if (key === 'Backspace') { d.decimals = d.fresh === 'decimals' ? '' : d.decimals.slice(0, -1); d.fresh = null; d.dirty.number = true; }
      return;
    }
    if (d.focus === 'sep') { if (key === ' ') { d.sep = !d.sep; d.dirty.number = true; } return; }
    if (d.focus === 'neg') { if (key === 'ArrowDown' || key === 'ArrowUp') { d.neg = FC_NEGATIVES[Math.max(0, Math.min(3, FC_NEGATIVES.indexOf(d.neg) + (key === 'ArrowDown' ? 1 : -1)))]; d.dirty.number = true; } return; }
    if (d.focus === 'type') { const n = (FC_TYPES[d.cat] || []).length; if (n && (key === 'ArrowDown' || key === 'ArrowUp')) { d.typeIdx = Math.max(0, Math.min(n - 1, (d.typeIdx | 0) + (key === 'ArrowDown' ? 1 : -1))); d.dirty.number = true; } return; }
    if (d.focus === 'code') {
      if (key === 'Backspace') { d.code = d.codeSel ? '' : d.code.slice(0, -1); d.codeSel = false; this.note = ''; d.dirty.number = true; return; }
      if (key.length === 1) { const next = (d.codeSel ? '' : d.code) + key; if (next.length <= 255) { d.code = next; d.codeSel = false; this.note = ''; d.dirty.number = true; } }
    }
  },
  fcOtherKey(key) {
    const d = this.dlg;
    const ALIGN = ['general', 'l', 'c', 'r', 'ca'];
    const acc = key.startsWith('Alt+') ? key.slice(4) : null;
    if (d.tab === 'alignment') {
      if (acc === 'H') { d.focus = 'horizontal'; return; }
      if (acc === 'I') { d.focus = 'indent'; d.fresh = 'indent'; return; }
      if (acc === 'W') { d.wrap = !d.wrap; d.focus = 'wrap'; d.dirty.wrap = true; return; }
      if (d.focus === 'horizontal' && (key === 'ArrowDown' || key === 'ArrowUp')) { const cur = d.ca ? 'ca' : d.align; const nx = ALIGN[Math.max(0, Math.min(ALIGN.length - 1, ALIGN.indexOf(cur) + (key === 'ArrowDown' ? 1 : -1)))]; d.ca = nx === 'ca'; d.align = nx === 'ca' ? 'general' : nx; d.dirty.align = true; return; }
      if (d.focus === 'indent') { if (/^[0-9]$/.test(key)) { d.indent = String(Math.min(8, parseInt(d.fresh === 'indent' ? key : d.indent + key, 10))); d.fresh = null; d.dirty.indent = true; } else if (key === 'ArrowUp' || key === 'ArrowDown') { d.indent = String(Math.max(0, Math.min(8, (parseInt(d.indent, 10) || 0) + (key === 'ArrowUp' ? 1 : -1)))); d.dirty.indent = true; } return; }
      if (d.focus === 'wrap' && key === ' ') { d.wrap = !d.wrap; d.dirty.wrap = true; }
      return;
    }
    if (d.tab === 'font') {
      const STYLES = [[false, false], [false, true], [true, false], [true, true]];   // Regular, Italic, Bold, Bold Italic
      if (acc === 'O') { d.focus = 'style'; return; }
      if (acc === 'U') { d.uline = !d.uline; d.focus = 'underline'; d.dirty.uline = true; return; }
      if (acc === 'K') { d.strike = !d.strike; d.focus = 'strike'; d.dirty.strike = true; return; }
      if (acc === 'C') { d.focus = 'color'; return; }
      if (d.focus === 'style' && (key === 'ArrowDown' || key === 'ArrowUp')) { const i = STYLES.findIndex(s => s[0] === d.bold && s[1] === d.it); const j = Math.max(0, Math.min(3, i + (key === 'ArrowDown' ? 1 : -1))); [d.bold, d.it] = STYLES[j]; d.dirty.style = true; return; }
      if ((d.focus === 'underline' || d.focus === 'strike') && key === ' ') { if (d.focus === 'underline') { d.uline = !d.uline; d.dirty.uline = true; } else { d.strike = !d.strike; d.dirty.strike = true; } return; }
      if (d.focus === 'color' && (key === 'ArrowRight' || key === 'ArrowLeft')) { const ks = [null].concat(FONT_SWATCHES.map(s => s.k)); d.fontColor = stepIn(ks, d.fontColor, key === 'ArrowRight' ? 1 : -1); d.dirty.fontColor = true; }
      return;
    }
    if (d.tab === 'border') {   // the presets: None, Outline; and the edges Excel's Border page toggles
      const set = b => { d.border = b; d.dirty.border = true; };
      if (acc === 'N') return set('none'); if (acc === 'O') return set('outside');
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === ' ') { const L = ['none', 'outside', 'top', 'bottom', 'topbottom', 'double']; set(stepIn(L, d.border || 'none', key === 'ArrowUp' ? -1 : 1)); }
      return;
    }
    if (d.tab === 'fill') {
      if (acc === 'N') { d.fill = null; d.dirty.fill = true; return; }
      if (key === 'ArrowRight' || key === 'ArrowLeft') { const ks = FILL_SWATCHES.map(s => s.k); d.fill = stepIn(ks, d.fill, key === 'ArrowRight' ? 1 : -1); d.dirty.fill = true; }
      return;
    }
    if (acc === 'L' || (d.focus === 'locked' && key === ' ')) { d.locked = !d.locked; d.focus = 'locked'; return; }
    if (acc === 'I' || (d.focus === 'hidden' && key === ' ')) { d.hidden = !d.hidden; d.focus = 'hidden'; }
  },
  /** OK: every page's changes land as ONE action on the selection, so F4 repeats the whole dialog (M64). */
  formatCellsOk() {
    const d = this.dlg; if (!d) return;
    const S = this.sheet;
    const num = d.dirty.number ? numberTabResult(d) : undefined;
    if (num === null) { d.tab = 'number'; d.focus = 'code'; this.note = 'Microsoft Excel cannot use the number format you typed.'; return; }
    const fns = [];
    if (num) fns.push(c => { c.fmtStyle = num.style; c.numFmt = num.style === 'custom' ? num.numFmt : null; c.decimals = num.decimals !== undefined ? num.decimals : num.style === 'custom' ? codeDecimals(num.numFmt) : 0; c.scale = 0; });   // a custom code's decimals mirror its first section, so Alt H 9 / 0 keep working
    if (d.dirty.align) { const al = d.align === 'general' ? null : d.align, ca = d.ca; fns.push(c => { c.align = al; if (!ca) c.ca = 0; }); }
    if (d.dirty.indent) { const n = Math.max(0, Math.min(8, parseInt(d.indent, 10) || 0)); fns.push(c => { c.indent = n; }); }
    if (d.dirty.wrap) { const w = d.wrap; fns.push(c => { c.wrap = w; }); }
    if (d.dirty.style) { const b = d.bold, i = d.it; fns.push(c => { c.bold = b; c.it = i; }); }
    if (d.dirty.uline) { const u = d.uline; fns.push(c => { c.uline = u; }); }
    if (d.dirty.strike) { const k = d.strike; fns.push(c => { c.strike = k; }); }
    if (d.dirty.fontColor) { const fc = d.fontColor; fns.push(c => { c.fontColor = fc; }); }
    if (d.dirty.fill) { const f = d.fill; fns.push(c => { c.fill = f; }); }
    const caSpan = d.dirty.align && d.ca;
    const border = d.dirty.border ? d.border : null;
    this.exitRibbon(false);
    if (fns.length) {
      const fn = c => { for (const f of fns) f(c); };
      S.formatSel(fn);
      if (num) S.autoGrowSelectedCols();
    }
    if (caSpan) S.centerAcross();
    if (border) S.border(border);
    if (caSpan || border) {   // F4 repeats the whole dialog: the cell changes, the centring across and the border
      const all = c => { for (const f of fns) f(c); };
      const act = { op: 'formatcells', run: sh => { if (fns.length) sh.formatSel(all); if (caSpan) sh.centerAcross(); if (border) sh.border(border); sh.lastAction = act; } };
      S.lastAction = act;
    }
    S.commit('format');
  },

  /* ---------------- Series (Alt H F I S) ---------------- */
  openSeries() {
    this.startClock();
    const r = this.sheet.selRange();
    this.openDialog('series', this.mode === 'ribbon' ? this.path : []);
    // Series in: Rows when the selection is wider than tall (Excel's default); the cursor opens in Step value, its 1 selected
    this.dlg = { kind: 'series', dir: (r.c2 - r.c1) > (r.r2 - r.r1) ? 'rows' : 'cols', type: 'linear', unit: 'day', step: '1', stop: '', focus: 'step', fresh: 'step', trend: false };
  },
  seriesKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') {
      const spec = { dir: d.dir, type: d.type, unit: d.unit, step: d.step === '' ? 1 : Number(d.step), stop: d.stop };
      if (d.type !== 'autofill' && !Number.isFinite(spec.step)) { this.note = 'Step value is not valid.'; return; }
      this.exitRibbon(false);
      if (fillSeriesSpec(this.sheet, spec)) this.sheet.lastAction = { op: 'series', spec, run: sh => fillSeriesSpec(sh, spec) };
      return;
    }
    const acc = key.startsWith('Alt+') ? key.slice(4) : null;
    const PICK = { R: ['dir', 'rows'], C: ['dir', 'cols'], L: ['type', 'linear'], G: ['type', 'growth'], D: ['type', 'date'], F: ['type', 'autofill'] };
    const UNIT = { A: 'day', W: 'weekday', M: 'month', Y: 'year' };
    if (acc) {
      if (PICK[acc]) { d[PICK[acc][0]] = PICK[acc][1]; d.focus = PICK[acc][0]; return; }
      if (UNIT[acc] && d.type === 'date') { d.unit = UNIT[acc]; d.focus = 'unit'; return; }
      if (acc === 'S') { d.focus = 'step'; d.fresh = 'step'; return; }
      if (acc === 'O') { d.focus = 'stop'; d.fresh = 'stop'; return; }
      if (acc === 'T') { d.trend = !d.trend; return; }
      return;
    }
    const ring = ['dir', 'type'].concat(d.type === 'date' ? ['unit'] : [], ['step', 'stop']);
    if (key === 'Tab' || key === 'Shift+Tab') { const i = Math.max(0, ring.indexOf(d.focus)); d.focus = ring[(i + (key === 'Tab' ? 1 : ring.length - 1)) % ring.length]; d.fresh = d.focus === 'step' || d.focus === 'stop' ? d.focus : null; return; }
    if (d.focus === 'step' || d.focus === 'stop') {
      const f = d.focus;
      if (key === 'Backspace') { d[f] = d.fresh === f ? '' : d[f].slice(0, -1); d.fresh = null; this.note = ''; return; }
      if (/^[0-9.\-]$/.test(key) && (d.fresh === f ? 0 : d[f].length) < 15) { d[f] = (d.fresh === f ? '' : d[f]) + key; d.fresh = null; this.note = ''; }
      return;   // a letter in a number box does nothing (Alt reaches the options)
    }
    const dir = key === 'ArrowDown' || key === 'ArrowRight' ? 1 : key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    if (d.focus === 'dir') d.dir = stepIn(['rows', 'cols'], d.dir, dir);
    else if (d.focus === 'type') d.type = stepIn(['linear', 'growth', 'date', 'autofill'], d.type, dir);
    else if (d.focus === 'unit') d.unit = stepIn(['day', 'weekday', 'month', 'year'], d.unit, dir);
  },

  /* ---------------- Zoom (Alt W Q, Alt W J) ---------------- */
  openZoom() {
    this.startClock();
    const z = this.sheet.zoom || 100; const ch = ZOOM_CHOICES.find(x => x.z === z);
    this.openDialog('zoom', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'zoom', pick: ch ? ch.z : 'custom', custom: String(z), fresh: false };
  },
  zoomKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') {
      const S = this.sheet; let z = d.pick;
      if (z === 'custom') { const n = parseInt(d.custom, 10); if (!Number.isFinite(n) || n < 10 || n > 400) { this.note = 'Enter a number between 10 and 400.'; return; } z = n; }
      else if (z === 'fit') z = this.fitSelectionZoom();
      this.exitRibbon(false); S.setZoom(z); this.emit('settings'); return;
    }
    const L = key.startsWith('Alt+') ? key.slice(4) : key;
    if (d.pick === 'custom' && /^[0-9]$/.test(key) && !key.startsWith('Alt+')) { d.custom = d.fresh ? key : (d.custom + key).slice(0, 3); d.fresh = false; return; }
    if (d.pick === 'custom' && key === 'Backspace') { d.custom = d.custom.slice(0, -1); return; }
    const ch = ZOOM_CHOICES.find(x => x.k === L);
    if (ch) { d.pick = ch.z; if (ch.z === 'custom') d.fresh = true; this.note = ''; return; }
    if (key === 'ArrowDown' || key === 'ArrowUp') { d.pick = stepIn(ZOOM_CHOICES.map(x => x.z), d.pick, key === 'ArrowDown' ? 1 : -1); }
  },
  /** Fit selection: the zoom at which the selected range fills the sheet area the view reported (viewSize), 10..400. */
  fitSelectionZoom() {
    const S = this.sheet, r = S.selRange(), v = this.viewSize || { width: 900, height: 480 };
    let w = 36, h = 20;
    for (let c = r.c1; c <= r.c2; c++) w += S.colW[c] || 64;
    for (let rr = r.r1; rr <= r.r2; rr++) h += S.rowH[rr] || 20;
    return clampZoom(Math.floor(Math.min(v.width / w, v.height / h) * 100));
  },

  /* ---------------- defined names (Alt M M D, the Name Box list, Go To by name) ---------------- */
  /** Every defined name in the workbook: [{ name, sheet, ref, refersTo }], alphabetical as the Name Box lists them. */
  definedNames() {
    const out = [];
    for (const e of this.sheets) for (const k in e.sheet.names || {}) { const n = e.sheet.names[k]; out.push({ name: n.name, sheet: e.name, ref: n.ref, refersTo: '=' + sheetRef(e.name) + n.ref }); }
    return out.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
  },
  /** Why `name` cannot be defined ('' when it can): Excel's two messages. */
  nameProblem(name) {
    if (!isValidName(name)) return NAME_BAD_NOTE;
    if (this.definedNames().some(n => n.name.toUpperCase() === String(name).toUpperCase())) return NAME_TAKEN_NOTE;
    return '';
  },
  /** Define `name` on sheet `i` (the active one) for `range` ('B4', '$B$4:$B$9'; the selection by default). False with nothing changed when the name will not do. */
  defineName(name, range, i) {
    if (this.nameProblem(name)) return false;
    const e = this.sheets[i == null ? this.sheetIndex : i | 0]; if (!e) return false;
    const rg = range ? parseRange(String(range).replace(/\$/g, '')) : e.sheet.selRange(); if (!rg) return false;
    e.sheet.pushUndo();
    e.sheet.names[String(name).toUpperCase()] = { name: String(name), ref: absRange(rg) };
    this.recalcAll(); e.sheet.commit('names');
    return true;
  },
  openDefineName() {
    this.startClock();
    const S = this.sheet, a = S.dispActive(), rg = S.selRange();
    this.openDialog('definename', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'definename', name: suggestName(S, a.r, a.c), selected: true, refersTo: '=' + sheetRef(this.sheets[this.sheetIndex].name) + absRange(rg), range: rangeText(rg) };
  },
  defineNameKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') {
      const err = this.nameProblem(d.name); if (err) { this.note = err; return; }
      const { name, range } = d; this.exitRibbon(false); this.defineName(name, range); return;
    }
    if (key === 'Backspace') { d.name = d.selected ? '' : d.name.slice(0, -1); d.selected = false; this.note = ''; return; }
    if (key.length === 1 && !key.startsWith('Alt')) { const next = (d.selected ? '' : d.name) + key; if (next.length <= 255) { d.name = next; d.selected = false; this.note = ''; } }
  },
  /** Go To by name (the Name Box list, F5): the named cell or range is selected, on its own sheet. False when there is no such name. */
  goToName(name) {
    const n = this.definedNames().find(x => x.name.toUpperCase() === String(name).trim().toUpperCase()); if (!n) return false;
    const i = this.sheets.findIndex(e => e.name === n.sheet); if (i < 0) return false;
    this.switchSheet(i);
    const S = this.sheets[i].sheet; const rg = parseRange(n.ref.replace(/\$/g, '')); if (!rg) return false;
    if (rg.r1 === rg.r2 && rg.c1 === rg.c2) S.goTo(rg.r1, rg.c1); else S.select(rangeText(rg));
    return true;
  },

  /* ---------------- notes (Shift+F2) ---------------- */
  openNote() {
    this.startClock();
    const S = this.sheet, a = S.dispActive();
    const cur = S.noteAt(a.r, a.c);
    this.openDialog('note', []);
    this.dlg = { kind: 'note', r: a.r, c: a.c, text: cur == null ? '' : cur, existed: cur != null };
  },
  /** The note's keys: typing writes (the case kept), Enter starts a new line, Backspace edits; Esc leaves the note, saved, as Excel's does. */
  noteKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Escape') { const { r, c, text } = d; this.exitRibbon(false); this.sheet.setNote(r, c, text); return; }
    if (key === 'Enter') { d.text += '\n'; return; }
    if (key === 'Backspace') { d.text = d.text.slice(0, -1); return; }
    if (key.length === 1 && d.text.length < 32767) d.text += key;
  },

  /* ---------------- the status bar (M40, M65) ---------------- */
  /**
   * The status bar: the mode word on the left, and for a selection of two or more filled cells the
   * Average, Count and Sum of what is selected (Minimum and Maximum too when ticked on its menu),
   * as Excel shows them: Count counts every filled cell, the rest read the numbers only, and each
   * figure is dressed in the active cell's number format.
   */
  statusInfo() {
    const S = this.sheet, st = this.settings;
    const out = { mode: this.modeWord(), zoom: S.zoom || 100, show: false, count: 0, numCount: 0, sum: 0, average: null, min: null, max: null, showMin: !!st.statusMin, showMax: !!st.statusMax, grouped: this.isGrouped ? this.isGrouped() : false };
    const visit = (r, c) => { const cell = S.cells[refKey(r, c)]; if (!cell) return; const v = cell.value; if (v === null || v === '' || v === undefined) return; out.count++; if (typeof v === 'number') { out.numCount++; out.sum += v; out.min = out.min === null ? v : Math.min(out.min, v); out.max = out.max === null ? v : Math.max(out.max, v); } };
    if (S.multi && S.multi.length) for (const k of S.multi) { const p = parseRef(k); if (p) visit(p.r, p.c); }
    else { const r = S.selRange(); for (let rr = r.r1; rr <= r.r2; rr++) for (let cc = r.c1; cc <= r.c2; cc++) visit(rr, cc); }
    if (out.numCount) out.average = out.sum / out.numCount;
    out.show = out.count >= 2;
    const a = S.dispActive(), fmtCell = S.get(a.r, a.c);
    const dress = v => v === null ? '' : (typeof fmtCell.value === 'number' || fmtCell.fmtStyle !== 'general' ? Sheet.fmtLike(fmtCell, v) : Sheet.fmtLike({ fmtStyle: 'general' }, v));
    out.text = { sum: dress(out.numCount ? out.sum : null), average: dress(out.average), count: String(out.count), min: dress(out.min), max: dress(out.max) };
    return out;
  },
  /** The status bar's right-click menu: tick or untick Minimum / Maximum (Excel's two the course sets). */
  toggleStatusItem(k) { const key = k === 'min' ? 'statusMin' : k === 'max' ? 'statusMax' : null; if (!key) return false; this.settings[key] = !this.settings[key]; this.emit('settings'); return true; },

  /* ---------------- grouped sheets (M70) ---------------- */
  isGrouped() { return !!(this.group && this.group.size > 1); },
  /** Select sheets `indices` together (Shift / Ctrl on the tabs, Ctrl+Shift+PgDn): the title bar reads Group and entries land on every one. The active sheet joins. */
  groupSheets(indices) {
    const set = new Set((indices || []).map(i => i | 0).filter(i => i >= 0 && i < this.sheets.length)); set.add(this.sheetIndex);
    this.group = set.size > 1 ? set : null; this.emit('sheets'); return this.isGrouped();
  },
  /** Ungroup Sheets (a tab's menu), or a move to a sheet outside the group. */
  ungroupSheets() { if (!this.group) return false; this.group = null; this.emit('sheets'); return true; },
  /** The cells (as JSON per key), widths and heights of the active sheet, before a key: what mirrorGroup compares against. */
  groupSnap() {
    const S = this.sheet, cells = {};
    for (const k in S.cells) cells[k] = JSON.stringify(S.cells[k]);
    return { sheet: S, cells, colW: S.colW.slice(), rowH: S.rowH.slice() };
  },
  /** After a key on a grouped sheet: every cell it changed (an entry, a format, a clear), and every width and height, lands on the other sheets of the group too. */
  mirrorGroup(pre) {
    if (!this.isGrouped()) return;
    const S = pre.sheet, keys = new Set(Object.keys(pre.cells).concat(Object.keys(S.cells)));
    const changed = []; for (const k of keys) { const now = S.cells[k] ? JSON.stringify(S.cells[k]) : undefined; if (now !== pre.cells[k]) changed.push(k); }
    const cw = []; S.colW.forEach((w, c) => { if (w !== pre.colW[c]) cw.push(c); });
    const rh = []; S.rowH.forEach((h, r) => { if (h !== pre.rowH[r]) rh.push(r); });
    if (!changed.length && !cw.length && !rh.length) return;
    for (const i of this.group) {
      const T = this.sheets[i] && this.sheets[i].sheet; if (!T || T === S) continue;
      T.pushUndo();
      for (const k of changed) { if (S.cells[k]) T.cells[k] = JSON.parse(JSON.stringify(S.cells[k])); else delete T.cells[k]; }
      for (const c of cw) { T.colW[c] = S.colW[c]; T.colSet[c] = S.colSet[c]; }
      for (const r of rh) T.rowH[r] = S.rowH[r];
      T.commit('edit');
    }
  },
};

/** Mix the dialog methods into the Session class (keyboard.js calls this once). */
export function installDialogs(Session) { Object.assign(Session.prototype, methods); }
