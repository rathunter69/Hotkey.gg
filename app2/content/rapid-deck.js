// app2/content/rapid-deck.js — rapid-fire's deck as data (screenplay 6.5, M100).
//
// One prompt per command the course teaches: Excel's name for it (the copy sheet's
// rapid_cmd_<id>, with `name` as the line it falls back to), the chapter that teaches it, the
// reference chord (shown only after a stall), a fragment builder and an end-state check.
//
//   frag(rng)      → a small sheet built fresh from the seeded stream, so no two prompts look
//                    alike: { cells, active | select, setup?, target, colW?, hiddenRows?, … }
//   check(s, f)    → true when the session's sheet shows the command's effect on the fragment.
//                    Any legitimate route passes (Alt H 1 for Bold, Alt H I R for Insert Row);
//                    the keystroke is never read.
//
// fragSession(frag) builds the Session a prompt runs on (the stage and the solver test share it);
// deckFor(chapter) is the deck a learner who has reached that chapter draws from.
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { refKey, parseRange, colLetter } from '../engine/refs.js';
import { mulberry32, hash32 } from '../engine/rng.js';

/** The fragment the stage shows: columns A to G, rows 1 to 8. Every target sits inside it. */
export const FRAG_ROWS = 8, FRAG_COLS = 7;
/** The sheet behind it: big enough that a whole row or column is a real one. */
export const SHEET_ROWS = 40, SHEET_COLS = 14;

/* ---------------- seeded data ---------------- */

const SITES = ['Austin', 'Dallas', 'Plano', 'Frisco', 'Waco', 'Tyler', 'Killeen', 'Temple', 'Denton', 'Lubbock', 'Midland', 'Odessa', 'Abilene', 'Amarillo', 'Laredo', 'McAllen', 'Irving', 'Garland'];
const LONG_SITES = ['Round Rock North', 'College Station', 'San Marcos East', 'New Braunfels', 'Corpus Christi Bay', 'Cedar Park Lakeline', 'Grand Prairie West', 'Sugar Land Central'];
const ITEMS = ['Washes', 'Members', 'Wash revenue', 'Member revenue', 'Labor', 'Chemicals', 'Utilities', 'Rent', 'Repairs', 'Marketing', 'Insurance', 'Card fees'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HEADS = { site: ['Site', 'Location', 'Store'], item: ['Line item', 'Account', 'Metric'] };

const int = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function pickN(rng, arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
const K = (r, c) => refKey(r, c);
const R = (r1, c1, r2, c2) => (r1 === r2 && c1 === c2 ? K(r1, c1) : K(r1, c1) + ':' + K(r2, c2));

/** Column headers for n periods: months from a random start, quarters or fiscal years. */
function periods(rng, n) {
  const kind = int(rng, 0, 2);
  if (kind === 0) { const s = int(rng, 0, 11); return Array.from({ length: n }, (_, i) => MONTHS[(s + i) % 12]); }
  if (kind === 1) { const s = int(rng, 0, 3); return Array.from({ length: n }, (_, i) => 'Q' + (((s + i) % 4) + 1)); }
  const y = int(rng, 22, 26); return Array.from({ length: n }, (_, i) => 'FY' + (y + i));
}
/** A figure of a size the column keeps: hundreds, thousands or ratios. */
function figure(rng, scale) {
  if (scale === 'ratio') return Math.round((0.04 + rng() * 0.5) * 1000) / 1000;
  if (scale === 'small') return int(rng, 12, 980);
  return int(rng, 120, 9800);
}

/**
 * A small table: a header row of periods, a label column, figures, and optionally a total row of
 * live SUMs. Placed at a seeded corner so its edges move from prompt to prompt.
 *   → { cells, r0, c0, r1, c1, top (first data row), last (last data row), labels, heads }
 */
export function table(rng, o = {}) {
  const rows = o.rows || int(rng, 3, 4), cols = o.cols || int(rng, 2, 3);
  const r0 = o.r0 || int(rng, 1, 2), c0 = o.c0 || int(rng, 1, 2);
  const kind = o.kind || (rng() < 0.5 ? 'site' : 'item');
  const labels = pickN(rng, kind === 'site' ? SITES : ITEMS, rows);
  const heads = periods(rng, cols);
  const scale = o.scale || (rng() < 0.5 ? 'small' : 'big');
  const cells = {};
  cells[K(r0, c0)] = { value: pick(rng, HEADS[kind]) };
  heads.forEach((h, j) => { cells[K(r0, c0 + 1 + j)] = { value: h, align: 'r' }; });
  labels.forEach((l, i) => {
    const r = r0 + 1 + i;
    cells[K(r, c0)] = { value: l };
    for (let j = 0; j < cols; j++) cells[K(r, c0 + 1 + j)] = { value: figure(rng, scale), ...(o.cell || {}) };
  });
  let r1 = r0 + rows;
  if (o.total) {
    r1 += 1;
    cells[K(r1, c0)] = { value: 'Total' };
    for (let j = 0; j < cols; j++) { const c = c0 + 1 + j; cells[K(r1, c)] = { formula: `=SUM(${K(r0 + 1, c)}:${K(r0 + rows, c)})`, ...(o.cell || {}) }; }
  }
  return { cells, r0, c0, r1, c1: c0 + cols, top: r0 + 1, last: r0 + rows, labels, heads, rows, cols };
}

/* ---------------- the session a prompt runs on ---------------- */

/** Build the Session for a fragment: the sheet, the selection, then any setup keys (a copy, a bold to undo). */
export function fragSession(frag, opts = {}) {
  const sheet = new Sheet({ rows: SHEET_ROWS, cols: SHEET_COLS, cells: frag.cells, colW: frag.colW, hiddenRows: frag.hiddenRows, hiddenCols: frag.hiddenCols, groups: frag.groups, condFmt: frag.condFmt, view: frag.view });
  const s = new Session(sheet, opts);
  const steps = [frag.select ? { select: frag.select } : { select: frag.active || 'A1' }, ...(frag.setup || [])];
  for (const st of steps) {
    if (typeof st === 'string') s.run(st);
    else if (st.select) s.sheet.select(st.select);
  }
  s.sheet.undoStack = frag.keepUndo ? s.sheet.undoStack : [];
  s.keyLog = [];
  s.t0 = null;
  return s;
}

/* ---------------- check helpers ---------------- */

const cellsIn = (range, fn) => { const g = parseRange(range); for (let r = g.r1; r <= g.r2; r++) for (let c = g.c1; c <= g.c2; c++) fn(K(r, c), r, c); };
const every = (s, range, pred) => { let ok = true; cellsIn(range, k => { if (!pred(s.sheet.cellAt(k), k)) ok = false; }); return ok; };
const selIs = (s, range) => s.sheet.selectionText() === range && !s.editing && !s.dialog;
const multiIs = (s, keys) => { const m = s.sheet.multi || (s.sheet.selectionText().includes(',') ? s.sheet.selectionText().split(',') : [s.sheet.selectionText()]); return m.length === keys.length && keys.every(k => m.includes(k)); };
const dialogIs = (s, name) => s.dialog === name;
const sameSel = s => s.sheet.selRange();

/* ---------------- fragment shapes the prompts share ---------------- */

/** A table with one cell or block selected inside its figures: the target is the selection. */
function onFigures(rng, o = {}) {
  const t = table(rng, o);
  const r = int(rng, t.top, t.last), c = int(rng, t.c0 + 1, t.c1);
  const block = o.block ? R(t.top, t.c0 + 1, t.last, t.c1) : (o.row ? R(r, t.c0 + 1, r, t.c1) : K(r, c));
  return { ...t, cells: t.cells, select: block, target: block };
}
/** A table with its header row selected: the target is the header row. */
function onHeader(rng, o = {}) {
  const t = table(rng, o);
  const rg = R(t.r0, t.c0, t.r0, t.c1);
  return { ...t, select: rg, target: rg };
}
/** A table with a label selected. */
function onLabel(rng, o = {}) {
  const t = table(rng, o);
  const r = int(rng, t.top, t.last);
  return { ...t, select: K(r, t.c0), target: K(r, t.c0) };
}

/** A list whose labels are out of order for the direction asked (never already sorted). */
function sortFrag(rng, dir) {
  const t = table(rng, { kind: 'site', rows: 4 });
  const cmp = (a, b) => dir * a.localeCompare(b, 'en', { sensitivity: 'base' });
  const sorted = t.labels.slice().sort(cmp);
  if (t.labels.every((l, i) => l === sorted[i])) {   // swap the first two rows' labels so the list needs the sort
    const a = K(t.top, t.c0), b = K(t.top + 1, t.c0); [t.cells[a], t.cells[b]] = [t.cells[b], t.cells[a]];
  }
  const rg = R(t.top, t.c0, t.last, t.c1);
  return { cells: t.cells, select: rg, target: rg, col: t.c0, top: t.top, last: t.last };
}
function sortedBy(s, f, dir) {
  const v = []; for (let r = f.top; r <= f.last; r++) v.push(String(s.sheet.value(K(r, f.col))));
  return v.every((x, i) => i === 0 || dir * v[i - 1].localeCompare(x, 'en', { sensitivity: 'base' }) <= 0);
}

/* ---------------- the deck ---------------- */

const P = (id, ch, name, keys, frag, check) => ({ id, ch, name, keys, frag, check });

/** Toggle-style formats: every target cell carries the field. */
const fmtOn = (field, value = true) => (s, f) => every(s, f.target, c => (value === true ? !!c[field] : c[field] === value));

export const RAPID_DECK = [
  /* ---- Chapter 1: move ---- */
  P('edge-down', 1, 'Jump down to the edge of the data', 'Ctrl+↓',
    rng => { const t = table(rng); const c = int(rng, t.c0, t.c1); return { cells: t.cells, select: K(t.r0, c), target: K(t.last, c) }; },
    (s, f) => selIs(s, f.target)),
  P('edge-right', 1, 'Jump right to the edge of the data', 'Ctrl+→',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last); return { cells: t.cells, select: K(r, t.c0), target: K(r, t.c1) }; },
    (s, f) => selIs(s, f.target)),
  P('edge-up', 1, 'Jump up to the edge of the data', 'Ctrl+↑',
    rng => { const t = table(rng); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.last, c), target: K(t.r0, c) }; },
    (s, f) => selIs(s, f.target)),
  P('edge-left', 1, 'Jump left to the edge of the data', 'Ctrl+←',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last); return { cells: t.cells, select: K(r, t.c1), target: K(r, t.c0) }; },
    (s, f) => selIs(s, f.target)),
  P('go-home', 1, 'Go to A1', 'Ctrl+Home',
    rng => { const t = table(rng, { r0: 2, c0: 2 }); return { cells: t.cells, select: K(int(rng, t.top, t.last), int(rng, t.c0 + 1, t.c1)), target: 'A1' }; },
    (s, f) => selIs(s, 'A1')),
  P('go-last', 1, 'Go to the last used cell', 'Ctrl+End',
    rng => { const t = table(rng, { total: rng() < 0.5 }); return { cells: t.cells, select: K(t.r0, t.c0), target: K(t.r1, t.c1) }; },
    (s, f) => selIs(s, f.target)),
  P('row-start', 1, 'Go to the start of the row', 'Home',
    rng => { const t = table(rng, { c0: 2 }); const r = int(rng, t.top, t.last); return { cells: t.cells, select: K(r, t.c1), target: K(r, 1) }; },
    (s, f) => selIs(s, f.target)),

  /* ---- Chapter 1: select ---- */
  P('select-down', 1, 'Extend the selection down to the edge', 'Ctrl+Shift+↓',
    rng => { const t = table(rng); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.top, c), target: R(t.top, c, t.last, c) }; },
    (s, f) => selIs(s, f.target)),
  P('select-right', 1, 'Extend the selection right to the edge', 'Ctrl+Shift+→',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last); return { cells: t.cells, select: K(r, t.c0 + 1), target: R(r, t.c0 + 1, r, t.c1) }; },
    (s, f) => selIs(s, f.target)),
  P('select-up', 1, 'Extend the selection up to the edge', 'Ctrl+Shift+↑',
    rng => { const t = table(rng); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.last, c), target: R(t.r0, c, t.last, c) }; },
    (s, f) => selIs(s, f.target)),
  P('select-row', 1, 'Select the entire row', 'Shift+Space',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last); return { cells: t.cells, select: K(r, int(rng, t.c0, t.c1)), target: R(r, 1, r, FRAG_COLS), row: r }; },
    (s, f) => { const g = sameSel(s); return g.r1 === f.row && g.r2 === f.row && g.c1 === 1 && g.c2 === s.sheet.cols; }),
  P('select-column', 1, 'Select the entire column', 'Ctrl+Space',
    rng => { const t = table(rng); const c = int(rng, t.c0, t.c1); return { cells: t.cells, select: K(int(rng, t.top, t.last), c), target: R(1, c, FRAG_ROWS, c), col: c }; },
    (s, f) => { const g = sameSel(s); return g.c1 === f.col && g.c2 === f.col && g.r1 === 1 && g.r2 === s.sheet.rows; }),
  P('select-region', 1, 'Select the current region', 'Ctrl+A',
    rng => { const t = table(rng, { total: rng() < 0.4 }); return { cells: t.cells, select: K(int(rng, t.top, t.last), int(rng, t.c0, t.c1)), target: R(t.r0, t.c0, t.r1, t.c1) }; },
    (s, f) => { const g = sameSel(s); const t = parseRange(f.target); return g.r1 === t.r1 && g.c1 === t.c1 && g.r2 === t.r2 && g.c2 === t.c2; }),
  P('select-to-last', 1, 'Select to the last used cell', 'Ctrl+Shift+End',
    rng => { const t = table(rng, { total: rng() < 0.5 }); return { cells: t.cells, select: K(t.r0, t.c0), target: R(t.r0, t.c0, t.r1, t.c1) }; },
    (s, f) => selIs(s, f.target)),

  /* ---- Chapter 1: find and go to ---- */
  P('go-to', 1, 'Go To', 'Ctrl+G',
    rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; },
    s => dialogIs(s, 'goto')),
  P('find', 1, 'Find', 'Ctrl+F',
    rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; },
    s => dialogIs(s, 'find') && !!s.dlg && !s.dlg.replace),
  P('replace', 1, 'Replace', 'Ctrl+H',
    rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; },
    s => dialogIs(s, 'find') && !!s.dlg && !!s.dlg.replace),
  P('special-blanks', 1, 'Go To Special: blanks', 'Alt H F D S K ↵',
    rng => {
      const t = table(rng, { rows: 4, cols: 3 });
      const blanks = pickN(rng, Array.from({ length: t.rows * t.cols }, (_, i) => K(t.top + Math.floor(i / t.cols), t.c0 + 1 + (i % t.cols))), int(rng, 1, 3));
      for (const k of blanks) delete t.cells[k];
      const rg = R(t.top, t.c0 + 1, t.last, t.c1);
      return { cells: t.cells, select: rg, target: rg, blanks };
    },
    (s, f) => multiIs(s, f.blanks)),
  P('special-constants', 1, 'Go To Special: constants', 'Alt H F D S O ↵',
    rng => {
      const t = table(rng, { total: true, rows: 3 });
      const rg = R(t.top, t.c0 + 1, t.r1, t.c1); const keys = [];
      cellsIn(R(t.top, t.c0 + 1, t.last, t.c1), k => keys.push(k));
      return { cells: t.cells, select: rg, target: rg, keys };
    },
    (s, f) => multiIs(s, f.keys)),
  P('special-formulas', 1, 'Go To Special: formulas', 'Alt H F D S F ↵',
    rng => {
      const t = table(rng, { total: true, rows: 3 });
      const rg = R(t.r0, t.c0, t.r1, t.c1); const keys = [];
      cellsIn(R(t.r1, t.c0 + 1, t.r1, t.c1), k => keys.push(k));
      return { cells: t.cells, select: rg, target: R(t.r1, t.c0 + 1, t.r1, t.c1), keys };
    },
    (s, f) => multiIs(s, f.keys)),

  /* ---- Chapter 1: enter and edit ---- */
  P('edit-cell', 1, 'Edit the active cell', 'F2',
    rng => { const t = onLabel(rng); return { cells: t.cells, select: t.select, target: t.target }; },
    s => s.editing && s.editMode === 'edit'),
  P('clear-contents', 1, 'Clear contents', 'Delete',
    rng => { const t = onFigures(rng, { row: rng() < 0.5 }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => c.value == null || c.value === '')),
  P('undo', 1, 'Undo', 'Ctrl+Z',
    rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target, setup: ['Ctrl+B'], keepUndo: true }; },
    (s, f) => every(s, f.target, c => !c.bold) && s.sheet.redoStack.length > 0),
  P('redo', 1, 'Redo', 'Ctrl+Y',
    rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target, setup: ['Ctrl+B Ctrl+Z'], keepUndo: true }; },
    (s, f) => every(s, f.target, c => !!c.bold)),

  /* ---- Chapter 1: copy, paste, fill ---- */
  P('copy', 1, 'Copy', 'Ctrl+C',
    rng => { const t = onFigures(rng, { row: rng() < 0.5 }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => { const cb = s.sheet.clipboard; if (!cb || cb.cut) return false; const g = parseRange(f.target); return cb.rect.r1 === g.r1 && cb.rect.c1 === g.c1 && cb.rect.r2 === g.r2 && cb.rect.c2 === g.c2; }),
  P('cut', 1, 'Cut', 'Ctrl+X',
    rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => { const cb = s.sheet.clipboard; if (!cb || !cb.cut) return false; const g = parseRange(f.target); return cb.rect.r1 === g.r1 && cb.rect.c1 === g.c1; }),
  P('paste', 1, 'Paste', 'Ctrl+V',
    rng => {
      const t = table(rng); const r = int(rng, t.top, t.last); const src = K(r, t.c0 + 1); const dest = K(r, t.c1 + 1);
      return { cells: t.cells, select: src, setup: ['Ctrl+C', { select: dest }], target: dest, want: t.cells[src].value };
    },
    (s, f) => s.sheet.value(f.target) === f.want),
  P('fill-down', 1, 'Fill Down', 'Ctrl+D',
    rng => {
      const t = table(rng); const c = int(rng, t.c0 + 1, t.c1);
      for (let r = t.top + 1; r <= t.last; r++) delete t.cells[K(r, c)];
      return { cells: t.cells, select: R(t.top, c, t.last, c), target: R(t.top + 1, c, t.last, c), want: t.cells[K(t.top, c)].value };
    },
    (s, f) => every(s, f.target, (c, k) => s.sheet.value(k) === f.want)),
  P('fill-right', 1, 'Fill Right', 'Ctrl+R',
    rng => {
      const t = table(rng, { cols: 3 }); const r = int(rng, t.top, t.last);
      for (let c = t.c0 + 2; c <= t.c1; c++) delete t.cells[K(r, c)];
      return { cells: t.cells, select: R(r, t.c0 + 1, r, t.c1), target: R(r, t.c0 + 2, r, t.c1), want: t.cells[K(r, t.c0 + 1)].value };
    },
    (s, f) => every(s, f.target, (c, k) => s.sheet.value(k) === f.want)),
  P('paste-values', 1, 'Paste Values', 'Ctrl+Alt+V V ↵',
    rng => {
      const t = table(rng, { total: true, rows: 3, c0: 1, cols: 2 }); const src = K(t.r1, t.c1); const dest = K(t.r1, t.c1 + 2);
      return { cells: t.cells, select: src, setup: ['Ctrl+C', { select: dest }], target: dest, src };
    },
    (s, f) => !s.sheet.formula(f.target) && s.sheet.value(f.target) != null && s.sheet.value(f.target) === s.sheet.value(f.src)),
  P('paste-formats', 1, 'Paste Formats', 'Ctrl+Alt+V T ↵',
    rng => {
      const t = table(rng, { cols: 2, c0: 1 });
      const fill = pick(rng, ['yellow', 'blue', 'green', 'gray']);
      const src = K(t.r0, t.c0 + 1); t.cells[src] = { ...t.cells[src], bold: true, fill, bb: true };
      const dest = R(t.r0, t.c1 + 1, t.r0, t.c1 + 1); t.cells[dest] = { value: pick(rng, MONTHS), align: 'r' };
      return { cells: t.cells, select: src, setup: ['Ctrl+C', { select: dest }], target: dest, fill, was: t.cells[dest].value };
    },
    (s, f) => { const c = s.sheet.cellAt(f.target); return c.bold && c.fill === f.fill && c.bb && c.value === f.was; }),
  P('transpose', 1, 'Paste Special: Transpose', 'Ctrl+Alt+V E ↵',
    rng => {
      const t = table(rng, { rows: 2, cols: 3, r0: 1, c0: 1 }); const src = R(t.r0, t.c0 + 1, t.r0, t.c1);
      const dest = K(t.r1 + 2, 2);
      return { cells: t.cells, select: src, setup: ['Ctrl+C', { select: dest }], target: R(t.r1 + 2, 2, t.r1 + 1 + t.cols, 2), want: t.heads };
    },
    (s, f) => { const g = parseRange(f.target); return f.want.every((h, i) => s.sheet.value(K(g.r1 + i, g.c1)) === h); }),

  /* ---- Chapter 1: rows and columns ---- */
  P('insert-row', 1, 'Insert Row', 'Ctrl+Shift+=',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last); return { cells: t.cells, select: K(r, t.c0), setup: ['Shift+Space'], target: R(r, 1, r, FRAG_COLS), row: r, label: t.cells[K(r, t.c0)].value, c0: t.c0 }; },
    (s, f) => !s.sheet.nonEmpty(f.row, f.c0) && s.sheet.value(K(f.row + 1, f.c0)) === f.label),
  P('delete-row', 1, 'Delete Row', 'Ctrl+-',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last - 1); return { cells: t.cells, select: K(r, t.c0), setup: ['Shift+Space'], target: R(r, 1, r, FRAG_COLS), row: r, next: t.cells[K(r + 1, t.c0)].value, c0: t.c0 }; },
    (s, f) => s.sheet.value(K(f.row, f.c0)) === f.next),
  P('insert-column', 1, 'Insert Column', 'Ctrl+Shift+=',
    rng => { const t = table(rng); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.r0, c), setup: ['Ctrl+Space'], target: R(1, c, FRAG_ROWS, c), col: c, head: t.cells[K(t.r0, c)].value, r0: t.r0 }; },
    (s, f) => !s.sheet.nonEmpty(f.r0, f.col) && s.sheet.value(K(f.r0, f.col + 1)) === f.head),
  P('delete-column', 1, 'Delete Column', 'Ctrl+-',
    rng => { const t = table(rng, { cols: 3 }); const c = int(rng, t.c0 + 1, t.c1 - 1); return { cells: t.cells, select: K(t.r0, c), setup: ['Ctrl+Space'], target: R(1, c, FRAG_ROWS, c), col: c, next: t.cells[K(t.r0, c + 1)].value, r0: t.r0 }; },
    (s, f) => s.sheet.value(K(f.r0, f.col)) === f.next),
  P('autofit-column', 1, 'AutoFit Column Width', 'Alt H O I',
    rng => {
      const t = table(rng, { kind: 'site', c0: 1 }); const r = int(rng, t.top, t.last);
      t.cells[K(r, t.c0)] = { value: pick(rng, LONG_SITES) };
      return { cells: t.cells, colW: { [t.c0]: 40 }, select: K(r, t.c0), target: R(t.r0, t.c0, t.last, t.c0), col: t.c0 };
    },
    (s, f) => s.sheet.colW[f.col] > 40 && s.sheet.colW[f.col] >= s.sheet.neededWidth(f.col) - 2),
  P('wrap-text', 1, 'Wrap Text', 'Alt H W',
    rng => { const t = onLabel(rng); return { cells: t.cells, select: t.select, target: t.target }; },
    fmtOn('wrap')),
  P('hide-rows', 1, 'Hide Rows', 'Alt H O U R',
    rng => { const t = table(rng, { rows: 4 }); const r = int(rng, t.top, t.last - 1); return { cells: t.cells, select: R(r, t.c0, r + 1, t.c0), target: R(r, 1, r + 1, FRAG_COLS), rows: [r, r + 1] }; },
    (s, f) => f.rows.every(r => s.sheet.hiddenRows.has(r))),
  P('hide-columns', 1, 'Hide Columns', 'Alt H O U C',
    rng => { const t = table(rng, { cols: 3 }); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.r0, c), target: R(1, c, FRAG_ROWS, c), cols: [c] }; },
    (s, f) => f.cols.every(c => s.sheet.hiddenCols.has(c))),
  P('unhide-rows', 1, 'Unhide Rows', 'Alt H O U O',
    rng => { const t = table(rng, { rows: 4 }); const r = int(rng, t.top + 1, t.last - 1); return { cells: t.cells, hiddenRows: [r], select: R(r - 1, t.c0, r + 1, t.c0), target: R(r - 1, 1, r + 1, FRAG_COLS), row: r }; },
    (s, f) => !s.sheet.hiddenRows.has(f.row)),
  P('unhide-columns', 1, 'Unhide Columns', 'Alt H O U L',
    rng => { const t = table(rng, { cols: 3 }); const c = int(rng, t.c0 + 1, t.c1 - 1); return { cells: t.cells, hiddenCols: [c], select: R(t.r0, c - 1, t.r0, c + 1), target: R(1, c - 1, FRAG_ROWS, c + 1), col: c }; },
    (s, f) => !s.sheet.hiddenCols.has(f.col)),
  P('group-rows', 1, 'Group', 'Shift+Alt+→',
    rng => { const t = table(rng, { rows: 4 }); const r = int(rng, t.top, t.last - 1); return { cells: t.cells, select: R(r, t.c0, r + 1, t.c0), setup: ['Shift+Space'], target: R(r, 1, r + 1, FRAG_COLS), r1: r, r2: r + 1 }; },
    (s, f) => s.sheet.groups.rows.some(g => g.r1 <= f.r1 && g.r2 >= f.r2)),
  P('ungroup-rows', 1, 'Ungroup', 'Shift+Alt+←',
    rng => { const t = table(rng, { rows: 4 }); const r = int(rng, t.top, t.last - 1); return { cells: t.cells, groups: { rows: [{ r1: r, r2: r + 1 }] }, select: R(r, t.c0, r + 1, t.c0), setup: ['Shift+Space'], target: R(r, 1, r + 1, FRAG_COLS), r1: r, r2: r + 1 }; },
    (s, f) => !s.sheet.groups.rows.some(g => g.r1 <= f.r2 && g.r2 >= f.r1)),
  P('hide-detail', 1, 'Hide Detail', 'Alt A H',
    rng => { const t = table(rng, { rows: 4 }); const r = int(rng, t.top, t.last - 1); return { cells: t.cells, groups: { rows: [{ r1: r, r2: r + 1 }] }, select: K(r, t.c0), target: R(r, 1, r + 1, FRAG_COLS), r1: r }; },
    (s, f) => s.sheet.groups.rows.some(g => g.r1 === f.r1 && g.collapsed)),
  P('show-detail', 1, 'Show Detail', 'Alt A J',
    rng => { const t = table(rng, { rows: 4 }); const r = int(rng, t.top, t.last - 1); return { cells: t.cells, groups: { rows: [{ r1: r, r2: r + 1, collapsed: true }] }, select: K(r + 2, t.c0), target: R(r, 1, r + 1, FRAG_COLS), r1: r }; },
    (s, f) => s.sheet.groups.rows.some(g => g.r1 === f.r1 && !g.collapsed)),
  P('freeze-panes', 1, 'Freeze Panes', 'Alt W F F',
    rng => { const t = table(rng); return { cells: t.cells, select: K(t.top, t.c0 + 1), target: K(t.top, t.c0 + 1), fr: t.top - 1, fc: t.c0 }; },
    (s, f) => s.sheet.freeze.r === f.fr && s.sheet.freeze.c === f.fc),

  /* ---- Chapter 1: format ---- */
  P('bold', 1, 'Bold', 'Ctrl+B', rng => { const t = rng() < 0.5 ? onHeader(rng) : onLabel(rng); return { cells: t.cells, select: t.select, target: t.target }; }, fmtOn('bold')),
  P('italic', 1, 'Italic', 'Ctrl+I', rng => { const t = onLabel(rng); return { cells: t.cells, select: t.select, target: t.target }; }, fmtOn('it')),
  P('underline', 1, 'Underline', 'Ctrl+U', rng => { const t = onHeader(rng); return { cells: t.cells, select: t.select, target: t.target }; }, fmtOn('uline')),
  P('number-format', 1, 'Number Format', 'Ctrl+Shift+!',
    rng => { const t = onFigures(rng, { block: true, scale: 'big' }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => c.numFmt === '#,##0.00' || (c.fmtStyle === 'comma' && c.decimals === 2) || c.fmtStyle === 'number')),
  P('currency', 1, 'Currency Format', 'Ctrl+Shift+$',
    rng => { const t = onFigures(rng, { row: true, scale: 'big' }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => c.fmtStyle === 'currency' || /\$/.test(c.numFmt || ''))),
  P('percent', 1, 'Percent Style', 'Ctrl+Shift+%',
    rng => { const t = onFigures(rng, { row: true, scale: 'ratio' }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => c.fmtStyle === 'percent' || /%/.test(c.numFmt || ''))),
  P('comma-style', 1, 'Comma Style', 'Alt H K',
    rng => { const t = onFigures(rng, { row: true, scale: 'big' }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => /#,##0\.00_\)/.test(c.numFmt || ''))),
  P('decrease-decimal', 1, 'Decrease Decimal', 'Alt H 9',
    rng => { const t = onFigures(rng, { row: true, cell: { numFmt: '#,##0.00', fmtStyle: 'custom', decimals: 2 } }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => c.decimals < 2)),
  P('increase-decimal', 1, 'Increase Decimal', 'Alt H 0',
    rng => { const t = onFigures(rng, { row: true }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => c.decimals > 0)),
  P('font-color', 1, 'Font Color', 'Alt H F C ↵',
    rng => { const t = onFigures(rng, { row: true, cell: { fontColor: 'blue' } }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => !!c.fontColor && c.fontColor !== 'blue')),
  P('fill-color', 1, 'Fill Color', 'Alt H H ↵',
    rng => { const t = rng() < 0.5 ? onHeader(rng) : onFigures(rng, { row: true }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => !!c.fill)),
  P('bottom-border', 1, 'Bottom Border', 'Alt H B O', rng => { const t = onHeader(rng); return { cells: t.cells, select: t.select, target: t.target }; }, fmtOn('bb')),
  P('top-border', 1, 'Top Border', 'Alt H B P',
    rng => { const t = table(rng, { total: true }); const rg = R(t.r1, t.c0, t.r1, t.c1); return { cells: t.cells, select: rg, target: rg }; }, fmtOn('bt')),
  P('all-borders', 1, 'All Borders', 'Alt H B A', rng => { const t = onFigures(rng, { block: true }); return { cells: t.cells, select: t.select, target: t.target }; }, fmtOn('ball')),
  P('outside-borders', 1, 'Outside Borders', 'Alt H B S',
    rng => { const t = onFigures(rng, { block: true }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => { const g = parseRange(f.target); const at = (r, c) => s.sheet.cellAt(K(r, c)); return at(g.r1, g.c1).bt && at(g.r1, g.c1).bl && at(g.r2, g.c2).bb && at(g.r2, g.c2).br; }),
  P('thick-box-border', 1, 'Thick Box Border', 'Alt H B T',
    rng => { const t = onFigures(rng, { block: true }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => { const g = parseRange(f.target); const a = s.sheet.cellAt(K(g.r1, g.c1)), b = s.sheet.cellAt(K(g.r2, g.c2)); return a.thick && a.bt && a.bl && b.thick && b.bb && b.br; }),
  P('double-bottom-border', 1, 'Bottom Double Border', 'Alt H B B',
    rng => { const t = table(rng, { total: true }); const rg = R(t.r1, t.c0 + 1, t.r1, t.c1); return { cells: t.cells, select: rg, target: rg }; }, fmtOn('bdbl')),
  P('top-bottom-border', 1, 'Top and Bottom Border', 'Alt H B D',
    rng => { const t = table(rng, { total: true }); const rg = R(t.r1, t.c0, t.r1, t.c1); return { cells: t.cells, select: rg, target: rg }; },
    (s, f) => every(s, f.target, c => c.bt && c.bb)),
  P('no-border', 1, 'No Border', 'Alt H B N',
    rng => { const t = onFigures(rng, { block: true, cell: { ball: true } }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => !c.ball && !c.bt && !c.bb && !c.bl && !c.br)),
  P('align-left', 1, 'Align Left', 'Alt H A L', rng => { const t = onFigures(rng, { row: true }); return { cells: t.cells, select: t.select, target: t.target }; }, fmtOn('align', 'l')),
  P('center', 1, 'Center', 'Alt H A C', rng => { const t = onHeader(rng); return { cells: t.cells, select: t.select, target: t.target }; }, fmtOn('align', 'c')),
  P('align-right', 1, 'Align Right', 'Alt H A R',
    rng => { const t = table(rng); const rg = R(t.top, t.c0, t.last, t.c0); return { cells: t.cells, select: rg, target: rg }; }, fmtOn('align', 'r')),
  P('increase-indent', 1, 'Increase Indent', 'Alt H 6', rng => { const t = onLabel(rng); return { cells: t.cells, select: t.select, target: t.target }; }, (s, f) => every(s, f.target, c => c.indent > 0)),
  P('decrease-indent', 1, 'Decrease Indent', 'Alt H 5',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last); t.cells[K(r, t.c0)].indent = 1; return { cells: t.cells, select: K(r, t.c0), target: K(r, t.c0) }; },
    (s, f) => every(s, f.target, c => !c.indent)),
  P('increase-font', 1, 'Increase Font Size', 'Alt H F G', rng => { const t = onHeader(rng); return { cells: t.cells, select: t.select, target: t.target }; }, (s, f) => every(s, f.target, c => (c.fsz || 0) > 13.5)),
  P('format-cells', 1, 'Format Cells', 'Ctrl+1', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'formatcells')),
  P('repeat', 1, 'Repeat Last Action', 'F4',
    rng => {
      const t = table(rng, { rows: 4 }); const c = int(rng, t.c0 + 1, t.c1); const a = K(t.top, c), b = K(t.last, c);
      return { cells: t.cells, select: a, setup: ['Alt H B O', { select: b }], target: b };
    },
    fmtOn('bb')),
  P('gridlines', 1, 'Gridlines', 'Alt W V G', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => s.sheet.gridlines === false),

  /* ---- Chapter 1: formulas ---- */
  P('autosum', 1, 'AutoSum', 'Alt+=',
    rng => { const t = table(rng); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.last + 1, c), target: K(t.last + 1, c), range: R(t.top, c, t.last, c) }; },
    (s, f) => { const want = new RegExp('^=SUM\\(' + f.range.replace(':', ':') + '\\)?$', 'i'); return (s.editing && want.test(s.editBuf)) || want.test(s.sheet.formula(f.target) || ''); }),
  P('show-formulas', 1, 'Show Formulas', 'Ctrl+`',
    rng => { const t = table(rng, { total: true }); return { cells: t.cells, select: K(t.r1, t.c1), target: R(t.r1, t.c0 + 1, t.r1, t.c1) }; },
    s => !!s.settings.showFormulas),
  P('absolute-ref', 1, 'Absolute Reference', 'F4',
    rng => {
      const t = table(rng, { c0: 1, cols: 2 }); const src = K(int(rng, t.top, t.last), t.c0 + 1); const at = K(t.top, t.c1 + 2);
      return { cells: t.cells, select: at, setup: [`"=${src}"`], editing: true, target: at, abs: src.replace(/^([A-Z]+)(\d+)$/, '$$$1$$$2') };
    },
    (s, f) => (s.editing && s.editBuf.toUpperCase() === '=' + f.abs) || (s.sheet.formula(f.target) || '').toUpperCase() === '=' + f.abs),
  P('select-precedents', 1, 'Select Precedents', 'Ctrl+[',
    rng => { const t = table(rng, { total: true }); const c = int(rng, t.c0 + 1, t.c1); const keys = []; cellsIn(R(t.top, c, t.last, c), k => keys.push(k)); return { cells: t.cells, select: K(t.r1, c), target: R(t.top, c, t.last, c), keys }; },
    (s, f) => multiIs(s, f.keys) || selIs(s, f.target)),
  P('select-dependents', 1, 'Select Dependents', 'Ctrl+]',
    rng => { const t = table(rng, { total: true }); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(int(rng, t.top, t.last), c), target: K(t.r1, c) }; },
    (s, f) => selIs(s, f.target) || multiIs(s, [f.target])),

  /* ---- Chapter 1: set up and print ---- */
  P('landscape', 1, 'Landscape Orientation', 'Alt P O L', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => s.sheet.pageSetup.orientation === 'landscape'),
  P('page-setup', 1, 'Page Setup', 'Alt P S P', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'pagesetup')),
  P('excel-options', 1, 'Excel Options', 'Alt F T', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'options')),
  P('fill-series', 1, 'Fill Series', 'Alt H F I S',
    rng => { const t = table(rng); const r = int(rng, t.top, t.last); const rg = R(r, t.c0 + 1, r, t.c1); return { cells: t.cells, select: rg, target: rg }; },
    s => dialogIs(s, 'series')),

  /* ---- Chapter 2: formatting and presentation ---- */
  P('general-format', 2, 'General Format', 'Ctrl+Shift+~',
    rng => { const t = onFigures(rng, { row: true, scale: 'big', cell: { fmtStyle: 'currency', decimals: 2 } }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => every(s, f.target, c => c.fmtStyle === 'general' && !c.numFmt)),
  P('todays-date', 2, 'Insert Today’s Date', 'Ctrl+;',
    rng => { const t = table(rng, { c0: 1, cols: 2 }); const at = K(t.r0, t.c1 + 2); return { cells: t.cells, select: at, target: at }; },
    (s, f) => { const c = s.sheet.cellAt(f.target); return typeof c.value === 'number' && c.value > 40000 && !c.formula; }),
  P('data-bars', 2, 'Data Bars', 'Alt H L D ↵',
    rng => { const t = table(rng); const c = int(rng, t.c0 + 1, t.c1); const rg = R(t.top, c, t.last, c); return { cells: t.cells, select: rg, target: rg }; },
    (s, f) => s.sheet.condFmt.some(r => r.kind === 'dataBar' && r.range === f.target)),
  P('color-scale', 2, 'Color Scales', 'Alt H L S ↵',
    rng => { const t = onFigures(rng, { block: true }); return { cells: t.cells, select: t.select, target: t.target }; },
    (s, f) => s.sheet.condFmt.some(r => /scale/i.test(r.kind) && r.range === f.target)),
  P('clear-rules', 2, 'Clear Rules from Selected Cells', 'Alt H L C S',
    rng => { const t = table(rng); const c = int(rng, t.c0 + 1, t.c1); const rg = R(t.top, c, t.last, c); return { cells: t.cells, condFmt: [{ kind: 'dataBar', range: rg, color: 'blue' }], select: rg, target: rg }; },
    s => s.sheet.condFmt.length === 0),
  P('new-rule', 2, 'New Formatting Rule', 'Alt H L N', rng => { const t = onFigures(rng, { block: true }); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'condfmt')),
  P('new-note', 2, 'New Note', 'Shift+F2', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'note')),
  P('hyperlink', 2, 'Insert Link', 'Ctrl+K', rng => { const t = onLabel(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'hyperlink')),
  P('print-area', 2, 'Set Print Area', 'Alt P R S',
    rng => { const t = table(rng, { total: rng() < 0.5 }); const rg = R(t.r0, t.c0, t.r1, t.c1); return { cells: t.cells, select: rg, target: rg }; },
    (s, f) => String(s.sheet.pageSetup.printArea || '').replace(/\$/g, '') === f.target),
  P('page-break', 2, 'Insert Page Break', 'Alt P B I',
    rng => { const t = table(rng, { rows: 4 }); const r = int(rng, t.top + 1, t.last); return { cells: t.cells, select: K(r, 1), target: R(r, 1, r, FRAG_COLS), row: r }; },
    (s, f) => s.sheet.breaks.rows.includes(f.row)),
  P('page-break-preview', 2, 'Page Break Preview', 'Alt W I', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => s.sheet.view === 'pagebreak'),
  P('normal-view', 2, 'Normal View', 'Alt W L', rng => { const t = onFigures(rng); return { cells: t.cells, view: 'pagebreak', select: t.select, target: t.target }; }, s => s.sheet.view === 'normal'),

  /* ---- Chapter 3: formulas and auditing ---- */
  P('trace-precedents', 3, 'Trace Precedents', 'Alt M P',
    rng => { const t = table(rng, { total: true }); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.r1, c), target: K(t.r1, c) }; },
    (s, f) => (s.sheet.arrows || []).some(a => a.kind === 'precedent' && a.to === f.target)),
  P('trace-dependents', 3, 'Trace Dependents', 'Alt M D',
    rng => { const t = table(rng, { total: true }); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(int(rng, t.top, t.last), c), target: K(t.r1, c), from: null }; },
    s => (s.sheet.arrows || []).some(a => a.kind === 'dependent')),
  P('remove-arrows', 3, 'Remove Arrows', 'Alt M A A',
    rng => { const t = table(rng, { total: true }); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.r1, c), setup: ['Alt M P'], target: K(t.r1, c) }; },
    s => !(s.sheet.arrows || []).length),
  P('evaluate-formula', 3, 'Evaluate Formula', 'Alt M V',
    rng => { const t = table(rng, { total: true }); const c = int(rng, t.c0 + 1, t.c1); return { cells: t.cells, select: K(t.r1, c), target: K(t.r1, c) }; },
    s => dialogIs(s, 'evalfx')),
  P('error-checking', 3, 'Error Checking', 'Alt M K',
    rng => { const t = table(rng, { total: true }); return { cells: t.cells, select: K(t.r1, t.c1), target: K(t.r1, t.c1) }; },
    s => dialogIs(s, 'errcheck')),
  P('watch-window', 3, 'Watch Window', 'Alt M W',
    rng => { const t = table(rng, { total: true }); return { cells: t.cells, select: K(t.r1, t.c1), target: K(t.r1, t.c1) }; },
    s => dialogIs(s, 'watch')),
  P('text-to-columns', 3, 'Text to Columns', 'Alt A E',
    rng => { const t = table(rng, { kind: 'site', cols: 2 }); const rg = R(t.top, t.c0, t.last, t.c0); return { cells: t.cells, select: rg, target: rg }; },
    s => dialogIs(s, 'texttocols')),
  P('flash-fill', 3, 'Flash Fill', 'Ctrl+E',
    rng => {
      const n = 4, r0 = int(rng, 1, 2); const names = pickN(rng, SITES, n); const cells = {};
      cells[K(r0, 1)] = { value: 'Site and state' }; cells[K(r0, 2)] = { value: 'Site' };
      names.forEach((nm, i) => { cells[K(r0 + 1 + i, 1)] = { value: nm + ' TX' }; });
      cells[K(r0 + 1, 2)] = { value: names[0] };
      return { cells, colW: { 1: 110 }, select: K(r0 + 2, 2), target: R(r0 + 2, 2, r0 + n, 2), want: names.slice(1) };
    },
    (s, f) => { const g = parseRange(f.target); return f.want.every((nm, i) => s.sheet.value(K(g.r1 + i, g.c1)) === nm); }),

  /* ---- Chapter 4: data and lookups ---- */
  P('sort-ascending', 4, 'Sort A to Z', 'Alt A S A',
    rng => sortFrag(rng, 1),
    (s, f) => sortedBy(s, f, 1)),
  P('sort-descending', 4, 'Sort Z to A', 'Alt A S D',
    rng => sortFrag(rng, -1),
    (s, f) => sortedBy(s, f, -1)),
  P('sort-dialog', 4, 'Custom Sort', 'Alt A S S',
    rng => { const t = table(rng, { rows: 4 }); const rg = R(t.r0, t.c0, t.last, t.c1); return { cells: t.cells, select: rg, target: rg }; },
    s => dialogIs(s, 'sortdlg')),
  P('filter', 4, 'Filter', 'Ctrl+Shift+L',
    rng => { const t = table(rng); return { cells: t.cells, select: K(t.r0, int(rng, t.c0, t.c1)), target: R(t.r0, t.c0, t.r0, t.c1) }; },
    s => !!s.sheet.filter),
  P('filter-menu', 4, 'Open the Filter Menu', 'Alt+↓',
    rng => { const t = table(rng); const at = K(t.r0, int(rng, t.c0, t.c1)); return { cells: t.cells, select: at, setup: ['Ctrl+Shift+L'], target: at }; },
    s => dialogIs(s, 'autofilter')),
  P('remove-duplicates', 4, 'Remove Duplicates', 'Alt A M',
    rng => { const t = table(rng); const rg = R(t.r0, t.c0, t.last, t.c1); return { cells: t.cells, select: rg, target: rg }; },
    s => dialogIs(s, 'removedup')),
  P('data-validation', 4, 'Data Validation', 'Alt A V V', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'validation')),
  P('data-table', 4, 'Data Table', 'Alt A W T',
    rng => { const t = table(rng); const rg = R(t.r0, t.c0, t.last, t.c1); return { cells: t.cells, select: rg, target: rg }; },
    s => dialogIs(s, 'datatable')),
  P('goal-seek', 4, 'Goal Seek', 'Alt A W G',
    rng => { const t = table(rng, { total: true }); return { cells: t.cells, select: K(t.r1, t.c1), target: K(t.r1, t.c1) }; },
    s => dialogIs(s, 'goalseek')),
  P('name-manager', 4, 'Name Manager', 'Ctrl+F3', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'namemgr')),
  P('define-name', 4, 'Define Name', 'Alt M M D', rng => { const t = onFigures(rng); return { cells: t.cells, select: t.select, target: t.target }; }, s => dialogIs(s, 'definename')),
  P('pivot-table', 4, 'PivotTable', 'Alt N V T',
    rng => { const t = table(rng); const rg = R(t.r0, t.c0, t.last, t.c1); return { cells: t.cells, select: K(t.top, t.c0), target: rg }; },
    s => dialogIs(s, 'pivot')),
  P('calc-except-tables', 4, 'Automatic Except for Data Tables', 'Alt M X E',
    rng => { const t = table(rng, { total: true }); return { cells: t.cells, select: K(t.r1, t.c1), target: K(t.r1, t.c1) }; },
    s => s.settings.calcMode === 'autoExceptTables'),
];

export const RAPID_BY_ID = Object.fromEntries(RAPID_DECK.map(p => [p.id, p]));
export const RAPID_DURATIONS = [30, 60, 120];
/** The chapters the deck draws from (Chapters 5 and 6 teach no key the earlier chapters did not). */
export const DECK_CHAPTERS = [...new Set(RAPID_DECK.map(p => p.ch))].sort((a, b) => a - b);

/** The prompts a learner who has reached chapter `ch` draws from: every key taught up to it. */
export const deckFor = (ch = 1) => RAPID_DECK.filter(p => p.ch <= Math.max(1, ch | 0));

/** The fragment for prompt `id` on seed `seed`: the same pair always builds the same sheet. */
export function buildFrag(id, seed) {
  const p = RAPID_BY_ID[id]; if (!p) return null;
  const rng = mulberry32(hash32(id + ':' + (seed >>> 0)));
  return { id, seed: seed >>> 0, ...p.frag(rng) };
}

/** The reference chord as a key script the engine runs: arrows and ↵ spelled out. */
export function chordScript(keys) {
  return String(keys).replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/↵/g, 'Enter');
}

/** The engine's state where a key landed: Ready (no edit, no dialog, no Ribbon walk). */
export const atRest = s => !s.editing && s.mode === 'normal' && !s.dialog;
/** The fragment a prompt opens on is at rest, except the prompts that start inside an entry (F4 on an open formula). */
export const startsAtRest = f => !f.editing;

/** What a prompt's sheet looks like, for telling a chord that changed something from one that did nothing. */
export function stateSig(s) {
  const sh = s.sheet;
  return JSON.stringify([sh.cells, sh.selectionText(), [...sh.hiddenRows], [...sh.hiddenCols], sh.groups, sh.freeze, sh.colW, sh.condFmt.length, !!sh.filter, sh.view, sh.gridlines, sh.pageSetup, sh.breaks, sh.arrows || [], s.settings.showFormulas, s.settings.calcMode, !!sh.clipboard]);
}

/** Excel's 'B2:D5' as the fragment's rows and columns: { r1, c1, r2, c2 }, clipped to the window. */
export function fragRect(range) {
  const g = parseRange(range); if (!g) return null;
  return { r1: Math.max(1, g.r1), c1: Math.max(1, g.c1), r2: Math.min(FRAG_ROWS, g.r2), c2: Math.min(FRAG_COLS, g.c2) };
}
export { colLetter };
