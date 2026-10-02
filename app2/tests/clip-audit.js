// app2/tests/clip-audit.js — what a page clips (R8 polish), and the fit that stops it. Excel's own rules
// as the painter applies them (ui/sheet-view.js): text spills across empty right neighbours and is cut
// at the first occupied one, right-aligned and centered text is cut at its own edges, a wrapped or
// centered-across cell never clips, and a number that needs more than its column shows ####.
//
//   clippedCells(sheet) → [{ ref, r, c, kind: 'label' | 'header' | 'hashes', need, have, text }]   pure
//   fitFor(workbookId)  → the widths, heights and wrapped headers that unclip every state of a workbook
//
//   node app2/tests/clip-audit.js            every clip in every state of every workbook, fitted
//   node app2/tests/clip-audit.js --write    regenerate content/workbooks/fit.js from the unfitted states
//
// The fit (content/workbooks/fit.js, applied by content/workbooks/unclip.js in stateOf) only ever
// widens a column or raises a row: a label column widens to its longest label, a figure column to its
// widest figure, and a header too long for its figures wraps over two or three lines, as an analyst
// would set it. Chapters 1 and 2 are left alone (their lessons teach AutoFit and ####), and so are the
// sheets a workbook names as off the standard (raw exports keep the feed's widths).
import { refKey, parseRef } from '../engine/refs.js';
import { COLW_DEFAULT, ROWH_DEFAULT, cellTxtPx, cellNumPx, cellShown } from '../engine/sheet.js';
import { dispText } from '../engine/format.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The workbooks the fit covers (Chapters 3 to 6). */
export const FIT_WORKBOOKS = ['clearcoat-databook', 'clearcoat-pack', 'clearcoat-model', 'clearcoat-valuation'];
/** The widest a label column grows; a longer line wraps instead. */
export const LABEL_CAP = 400;
/** How far a column grows for a label: LABEL_GROW times its width, and never less than LABEL_MIN_CAP. */
export const LABEL_GROW = 2.5, LABEL_MIN_CAP = 160;
/** The widest a figure column grows to fit a header on one line; past it the header wraps. */
export const ONE_LINE_CAP = 1.25;
const LINE_PX = 18, MAX_LINES = 3;   // a wrapped line as the grid paints it at 100%

const occupied = c => c && c.value !== null && c.value !== undefined && c.value !== '';
const textPx = cell => cellTxtPx(cell) * (cell.fsz ? cell.fsz / 13.5 : 1) * (cell.bold ? 1.06 : 1) + (cell.indent | 0) * 13;

export function clippedCells(sheet, { maxRow = 220, maxCol = 40 } = {}) {
  const out = [];
  const W = c => (sheet.colW && sheet.colW[c]) || COLW_DEFAULT;
  const H = r => (sheet.rowH && sheet.rowH[r]) || ROWH_DEFAULT;
  const has = (s, v) => !!(s && (s.has ? s.has(v) : s.includes && s.includes(v)));
  for (let r = 1; r <= maxRow; r++) {
    if (has(sheet.hiddenRows, r)) continue;
    for (let c = 1; c <= maxCol; c++) {
      if (has(sheet.hiddenCols, c)) continue;
      const cell = sheet.cells[refKey(r, c)];
      if (!occupied(cell)) continue;
      if (typeof cell.value === 'number') {
        if (!cell.wrap && cellShown(cell, W(c)).over) out.push({ ref: refKey(r, c), r, c, kind: 'hashes', need: Math.ceil(cellNumPx(cell)) + 2, have: W(c), text: String(cell.value) });
        continue;
      }
      if (typeof cell.value !== 'string' || (cell.ca | 0) > 1) continue;
      const need = textPx(cell);
      if (cell.wrap) {   // a wrapped cell clips when its lines need more height than the row has
        const lines = Math.ceil(need / Math.max(1, W(c) - 8));
        if (lines * LINE_PX + 4 > H(r) + 2) out.push({ ref: refKey(r, c), r, c, kind: 'header', need, have: W(c), text: dispText(cell) });
        continue;
      }
      const spills = cell.align !== 'r' && cell.align !== 'c';
      let have = W(c);
      if (spills) for (let cc = c + 1; cc <= maxCol + 10 && have < need; cc++) { if (has(sheet.hiddenCols, cc)) continue; if (occupied(sheet.cells[refKey(r, cc)])) break; have += W(cc); }
      if (need > have + 2) out.push({ ref: refKey(r, c), r, c, kind: spills ? 'label' : 'header', need: Math.ceil(need), have, text: dispText(cell) });
    }
  }
  return out;
}

/** A live workbook for a state, as the runner assembles it, so formulas carry their values. */
export async function sessionOf(st) {
  const { Sheet } = await import('../engine/sheet.js');
  const { Session } = await import('../engine/keyboard.js');
  const build = sp => new Sheet({ cells: structuredClone(sp.cells || {}), colW: sp.colW, rowH: sp.rowH, hiddenRows: sp.hiddenRows, hiddenCols: sp.hiddenCols, freeze: sp.freeze, gridlines: sp.gridlines, groups: sp.groups, condFmt: sp.condFmt });
  const ses = new Session(build(st.sheets[0]), { now: () => 0 });
  ses.sheets[0].name = st.sheets[0].name;
  for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh), undefined, { recalc: false });
  const set = st.settings || {};
  Object.assign(ses.settings, { iterative: !!set.iterative, maxIterations: set.maxIterations || 100, maxChange: set.maxChange == null ? 0.001 : set.maxChange });
  if (st.names && Object.keys(st.names).length) ses.names = st.names; else ses.recalcAll();
  return ses;
}

/**
 * The fit of one workbook, over every state's unfitted sheets: { [sheet]: { colW: { c: px }, rowH: { r: px }, wrap: [ref] } }.
 * A column takes the widest need any state shows; a header that would need more than ONE_LINE_CAP of its
 * column wraps, and its row rises to the lines it takes.
 */
export async function fitFor(id, { log } = {}) {
  const { WORKBOOKS } = await import('../content/workbooks/index.js');
  const wb = WORKBOOKS[id];
  const off = new Set(Object.keys((wb.STANDARD && wb.STANDARD.off) || {}));
  const raw = wb.STATES;
  const need = {};   // sheet → { col: {c: px}, wrap: {ref: {r, c, px}} }
  for (const stateId of Object.keys(raw)) {
    const st = structuredClone(raw[stateId]);
    let ses; try { ses = await sessionOf(st); } catch (e) { if (log) log(`${id} ${stateId}: ${e.message}`); continue; }
    for (const { name, sheet } of ses.sheets) {
      if (off.has(name)) continue;
      const n = need[name] || (need[name] = { col: {}, wrap: {}, base: {}, notText: new Set() });
      // a formula cell that shows a figure in any state never wraps (a fill would carry the wrap onto figures)
      for (const [ref, cell] of Object.entries(sheet.cells)) if (cell && cell.value != null && cell.value !== '' && typeof cell.value !== 'string') n.notText.add(ref);
      const W = c => (sheet.colW && sheet.colW[c]) || COLW_DEFAULT;
      const wrapIt = f => { const was = n.wrap[f.ref], isF = !!(sheet.cells[f.ref] && sheet.cells[f.ref].formula); n.wrap[f.ref] = { r: f.r, c: f.c, px: Math.max(f.need, was ? was.px : 0), f: isF || !!(was && was.f) }; };
      for (const f of clippedCells(sheet)) {
        n.base[f.c] = W(f.c);
        let px = null;
        if (f.kind === 'hashes') px = f.need;
        else if (f.kind === 'label') {
          // a label widens its own column, up to the cap: its spill room is the rest
          // (a narrow column grows at most LABEL_GROW times, so a code column does not turn into a label column)
          const room = f.have - W(f.c), cap = Math.min(LABEL_CAP, Math.max(LABEL_MIN_CAP, Math.round(W(f.c) * LABEL_GROW)));
          px = Math.min(cap, Math.max(W(f.c), f.need - room + 4));
          if (f.need - room + 4 > cap) wrapIt(f);   // longer than the cap: it wraps at the cap
        } else if (f.need <= W(f.c) * ONE_LINE_CAP) px = f.need + 4;
        else wrapIt(f);
        if (px != null && px > W(f.c)) n.col[f.c] = Math.max(n.col[f.c] || 0, Math.ceil(px));
      }
    }
  }
  const fit = {};
  for (const [name, n] of Object.entries(need)) {
    // wrap: typed text (a formula there never wraps); wrapF: text a formula shows (column A's helper labels)
    const out = { colW: {}, rowH: {}, wrap: [], wrapF: [] };
    for (const c of Object.keys(n.col).map(Number).sort((a, b) => a - b)) out.colW[c] = n.col[c];
    for (const [ref, w] of Object.entries(n.wrap).sort()) {
      if (w.f && n.notText.has(ref)) { out.colW[w.c] = Math.max(out.colW[w.c] || 0, Math.min(LABEL_CAP, Math.ceil(w.px) + 4)); continue; }   // it widens instead
      const list = w.f ? out.wrapF : out.wrap;
      list.push(ref);
      // the wrapped header's width: its column as fitted, then enough lines (three at most) for it
      let colPx = out.colW[w.c] || n.base[w.c] || COLW_DEFAULT;
      let lines = Math.ceil(w.px / (colPx - 8));
      if (lines > MAX_LINES) { colPx = Math.ceil(w.px / MAX_LINES) + 8; out.colW[w.c] = Math.max(out.colW[w.c] || 0, colPx); lines = MAX_LINES; }
      if (lines > 1) out.rowH[w.r] = Math.max(out.rowH[w.r] || 0, lines * LINE_PX + 4);
      else list.pop();   // fits on one line in its fitted column: no wrap
    }
    if (!out.wrapF.length) delete out.wrapF;
    if (Object.keys(out.colW).length || out.wrap.length || out.wrapF) fit[name] = out;
  }
  return fit;
}

const here = dirname(fileURLToPath(import.meta.url));
export const FIT_FILE = join(here, '..', 'content', 'workbooks', 'fit.js');
export function renderFit(all) {
  return `// app2/content/workbooks/fit.js — GENERATED by tests/clip-audit.js --write. Do not edit by hand.
// The widths, row heights and wrapped headers that keep Chapters 3 to 6 from clipping a label or
// showing ####; content/workbooks/unclip.js lays them over every state a lesson or drill opens.
/* eslint-disable */
export const FIT = ${JSON.stringify(all, null, 1)};
`;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  if (process.argv.includes('--write')) globalThis.__hkNoFit = true;   // the fit is worked out from the bare states, whatever fit.js holds now
  const { WORKBOOKS } = await import('../content/workbooks/index.js');
  if (process.argv.includes('--write')) {
    const all = {};
    for (const id of FIT_WORKBOOKS) { all[id] = await fitFor(id, { log: console.log }); console.log(id, Object.keys(all[id]).length, 'sheets fitted'); }
    writeFileSync(FIT_FILE, renderFit(all));
    console.log('wrote content/workbooks/fit.js');
  } else {
    const only = process.argv[2];
    for (const [id, wb] of Object.entries(WORKBOOKS)) {
      if (only && id !== only) continue;
      const seen = new Map();
      for (const stateId of Object.keys(wb.STATES || {})) {
        let ses; try { ses = await sessionOf(wb.stateOf(stateId)); } catch (e) { console.log(id, stateId, 'ERR', e.message); continue; }
        for (const { name, sheet } of ses.sheets) for (const f of clippedCells(sheet)) {
          const k = `${name}!${f.ref} ${f.kind}`;
          if (!seen.has(k)) seen.set(k, { ...f, name, states: [] });
          seen.get(k).states.push(stateId);
        }
      }
      for (const [k, f] of seen) console.log(`${id} ${k} need ${f.need} have ${f.have} "${f.text.slice(0, 50)}" in ${f.states.length} states (${f.states.slice(0, 4).join(' ')}${f.states.length > 4 ? '…' : ''})`);
    }
  }
}
void readFileSync; void parseRef;
