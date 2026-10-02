// app2/content/lessons/lib/pack-checks.js — the end-state checks Chapter 4's lookup lessons share on
// the clearcoat-pack workbook (module 4.1). Every check reads the learner's own sheets: a cell holds a
// formula that calls the function the goal names (the parsed tokens, never the text), it reads the
// figure Lists gives for the code beside it, and it moves when an input moves (the shared liveness
// rule). Any legitimate route passes: typed, pointed, filled, pasted.
import { tokenize } from '../../../engine/formula.js';
import { sheetIn, settled, calls, live, near, isNum, selected, onSheet, reads } from './databook-checks.js';

export { sheetIn, settled, calls, live, near, isNum, selected, onSheet, reads };
export const summary = ses => sheetIn(ses, 'Summary');
export const lists = ses => sheetIn(ses, 'Lists');
export const qa = ses => sheetIn(ses, 'Q&A');
export const exportSheet = ses => sheetIn(ses, 'Export');

/** The site block's rows on Summary and Lists (six sites). */
export const SITE_ROWS = [5, 6, 7, 8, 9, 10];
/** The Lists site table's columns, by what they hold. */
export const LIST_COL = { code: 'B', name: 'C', cluster: 'D', opened: 'E', capacity: 'F', hours: 'G', costs: 'H' };

const sameText = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
/** The Lists row (5 to 10) holding `code` in column `by` (code or name), or null. */
export function listRow(ses, key, by = 'code') {
  const l = lists(ses); if (!l) return null;
  for (const r of SITE_ROWS) if (sameText(l.value(LIST_COL[by] + r), key)) return r;
  return null;
}
/** What Lists holds for a code (or a name) in a field: the figure a correct lookup returns. */
export function listValue(ses, key, field, by = 'code') {
  const r = listRow(ses, key, by); const l = lists(ses);
  return r == null || !l ? '#N/A' : l.value(LIST_COL[field] + r);
}
/** A value equals what it should read: numbers within a cent's dust, text case-blind, errors by code. */
export const same = (v, want) => (isNum(want) ? near(v, want, 1e-6) : typeof want === 'string' && typeof v === 'string' ? v.toLowerCase() === want.toLowerCase() : v === want);

/** The functions a cell's formula calls, upper case, every occurrence (MATCH twice reads twice). */
export function fnsOf(sh, ref) {
  const f = sh && sh.formula(ref); if (typeof f !== 'string' || !f) return [];
  try { return tokenize(f.replace(/^\s*=/, '')).filter(t => t.t === 'fn').map(t => String(t.v).toUpperCase()); } catch (e) { return []; }
}
/** The string literals inside a cell's formula. */
export function stringsOf(sh, ref) {
  const f = sh && sh.formula(ref); if (typeof f !== 'string' || !f) return [];
  try { return tokenize(f.replace(/^\s*=/, '')).filter(t => t.t === 'str').map(t => t.v); } catch (e) { return []; }
}
/** VLOOKUP's arguments as typed: how many there are, and whether the fourth is FALSE or 0. */
export function vlookupExact(sh, ref) {
  const f = sh && sh.formula(ref); if (typeof f !== 'string') return false;
  let toks; try { toks = tokenize(f.replace(/^\s*=/, '')); } catch (e) { return false; }
  const i = toks.findIndex(t => t.t === 'fn' && /^[VH]LOOKUP$/i.test(t.v)); if (i < 0) return false;
  const args = [[]]; let depth = 0;
  for (let j = i + 1; j < toks.length; j++) {
    const t = toks[j];
    if (t.t === 'lp') { depth++; if (depth === 1) continue; }
    else if (t.t === 'rp') { depth--; if (depth === 0) break; }
    else if (t.t === 'comma' && depth === 1) { args.push([]); continue; }
    args[args.length - 1].push(t);
  }
  const last = args[3];
  return args.length === 4 && last.length === 1 && (String(last[0].v).toUpperCase() === 'FALSE' || last[0].v === 0);
}

/** Every row of a Summary column block holds a formula calling `fns` that reads `want(r)`; `liveRef` is live. */
export function block(sh, col, rows, { fns = [], want, liveRef = col + rows[0] } = {}) {
  if (!sh) return false;
  for (const r of rows) {
    const ref = col + r;
    if (!calls(sh, ref, fns)) return false;
    if (want && !same(sh.value(ref), want(r))) return false;
  }
  return liveRef ? live(sh, liveRef) : true;
}
/** The site block's lookups by code: Lists' figure for the code in column B of the same row. */
export const byCode = (ses, sh, field) => r => listValue(ses, sh.value('B' + r), field);

/** The keys pressed since the current goal began, as the key log writes them. */
export const windowKeys = ses => (ses.keyLog || []).slice(ses.goalMark || 0).map(e => e.k);
/** A whole row or column was inserted in the goal's window (Ctrl+Shift+= or the Ribbon's Insert). */
export const insertedInWindow = ses => { const k = windowKeys(ses); return k.includes('Ctrl+Shift+=') || k.includes('Ctrl++') || k.join(' ').includes('Alt H I'); };
export const undoneInWindow = ses => windowKeys(ses).includes('Ctrl+Z');

/** The Lists site table as the workbook ships it: the capacity header in F4 and Domain on row 5. */
export const listsIntact = ses => { const l = lists(ses); return !!l && l.value('F4') === 'Capacity (cars an hour)' && l.value('B5') === 'AUS-DOM' && l.value('B4') === 'Code'; };
/** A cell holds nothing: no value and no formula. */
export const blank = (sh, ref) => !!sh && (sh.value(ref) == null || sh.value(ref) === '') && !sh.formula(ref);
/** The washes in the Summary cube for a site code and a week label (rows 15 to 20, weeks across C14:E14). */
export function cubeValue(sh, code, week) {
  if (!sh) return null;
  const row = [15, 16, 17, 18, 19, 20].find(r => sameText(sh.value('B' + r), code));
  const col = ['C', 'D', 'E'].find(c => sameText(sh.value(c + '14'), week));
  return row && col ? sh.value(col + row) : '#N/A';
}
/** The bonus a day for a washes-a-day figure, read off the tiers on the learner's Lists (J5:K8, ascending). */
export function bandOf(ses, washes) {
  const l = lists(ses); if (!l || !isNum(washes)) return null;
  let out = '#N/A';
  for (const r of [5, 6, 7, 8]) { const edge = l.value('J' + r); if (isNum(edge) && edge <= washes) out = l.value('K' + r); }
  return out;
}
/** Trace arrows on a sheet. */
export const arrowsOn = sh => (sh && sh.arrows) || [];
