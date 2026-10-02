// app2/engine/pivot.js — a minimal PivotTable (Insert › PivotTable, Alt N V T): one row field, an
// optional column field and one value field summarised by Sum, Count or Average, laid out as
// Excel's compact form with grand totals, and Show Values As % of Column Total. Pure: the Session (tools.js) builds and refreshes a
// pivot on a sheet; GETPIVOTDATA (formula.js, through the sheet's evalCtx) finds the cell a
// data field and its item pairs name.
import { refKey } from './refs.js';

export const PIVOT_FNS = [['sum', 'Sum'], ['count', 'Count'], ['average', 'Average']];
/** Show Values As: No Calculation, or each figure as a share of its column's grand total (Excel's % of Column Total). */
export const PIVOT_SHOW = [['none', 'No Calculation'], ['pctCol', '% of Column Total']];
const itemText = v => v === null || v === undefined || v === '' ? '(blank)' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v);
const sortItems = vals => [...new Set(vals)].sort((a, b) => {
  const na = typeof a === 'number', nb = typeof b === 'number';
  if (a === '(blank)') return 1; if (b === '(blank)') return -1;
  if (na && nb) return a - b; if (na) return -1; if (nb) return 1;
  return String(a).localeCompare(String(b), 'en', { sensitivity: 'base' });
});

/**
 * Summarise a source table. `rows`: arrays of cell values (first row = headers); `spec`:
 * { row, col, value, fn } as header names. Returns { rowItems, colItems, cell(ri, ci) } where an
 * index of -1 is the grand total, or null when the fields are not in the table.
 */
export function pivotCache(table, spec) {
  const heads = table[0].map(h => String(h == null ? '' : h)); const find = n => n ? heads.findIndex(h => h.toLowerCase() === String(n).toLowerCase()) : -1;
  const ri = find(spec.row), ci = find(spec.col), vi = find(spec.value);
  if (ri < 0 || vi < 0 || (spec.col && ci < 0)) return null;
  const body = table.slice(1).filter(r => r.some(v => v !== null && v !== ''));
  const key = v => typeof v === 'number' ? v : itemText(v);
  const rowItems = sortItems(body.map(r => key(r[ri]))), colItems = ci >= 0 ? sortItems(body.map(r => key(r[ci]))) : null;
  const agg = (pred) => {
    const vals = body.filter(pred).map(r => r[vi]); const nums = vals.filter(v => typeof v === 'number');
    if (spec.fn === 'count') return vals.filter(v => v !== null && v !== '').length;
    if (spec.fn === 'average') return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : '#DIV/0!';
    return nums.reduce((a, b) => a + b, 0);
  };
  const raw = (r, c) => agg(x => (r < 0 || key(x[ri]) === rowItems[r]) && (c < 0 || ci < 0 || key(x[ci]) === colItems[c]));
  // % of Column Total: every figure over its column's grand total (the grand total column over the grand total)
  const pct = spec.show === 'pctCol';
  const cell = pct ? (r, c) => { const v = raw(r, c), t = raw(-1, c); return typeof v !== 'number' || typeof t !== 'number' ? v : t === 0 ? '#DIV/0!' : v / t; } : raw;
  const anyRow = (r, c) => body.some(x => (r < 0 || key(x[ri]) === rowItems[r]) && (c < 0 || ci < 0 || key(x[ci]) === colItems[c]));
  return { rowItems, colItems, cell, anyRow, pct, valueHead: (PIVOT_FNS.find(f => f[0] === spec.fn) || PIVOT_FNS[0])[1] + ' of ' + heads[vi] };
}

/** The pivot's cells in compact form at (r0, c0): { 'A3': value, … }, its extent, and which cells hold figures (`data`) and which items (`rowKeys`, `colKeys`). */
export function pivotLayout(cache, at) {
  const out = {}; const data = [], rowKeys = [], colKeys = [];
  const put = (r, c, v, role) => { const k = refKey(r, c); out[k] = v; if (role === 'd') data.push(k); else if (role === 'r') rowKeys.push(k); else if (role === 'c') colKeys.push(k); };
  const { r: r0, c: c0 } = at; const R = cache.rowItems, C = cache.colItems;
  if (!C) {
    put(r0, c0, 'Row Labels'); put(r0, c0 + 1, cache.valueHead);
    R.forEach((it, i) => { put(r0 + 1 + i, c0, it, 'r'); put(r0 + 1 + i, c0 + 1, cache.cell(i, -1), 'd'); });
    put(r0 + 1 + R.length, c0, 'Grand Total'); put(r0 + 1 + R.length, c0 + 1, cache.cell(-1, -1), 'd');
    return { cells: out, data, rowKeys, colKeys, r1: r0, c1: c0, r2: r0 + 1 + R.length, c2: c0 + 1 };
  }
  put(r0, c0, cache.valueHead); put(r0, c0 + 1, 'Column Labels'); put(r0 + 1, c0, 'Row Labels');
  C.forEach((it, j) => put(r0 + 1, c0 + 1 + j, it, 'c')); put(r0 + 1, c0 + 1 + C.length, 'Grand Total');
  R.forEach((it, i) => { put(r0 + 2 + i, c0, it, 'r'); C.forEach((cj, j) => put(r0 + 2 + i, c0 + 1 + j, cache.anyRow(i, j) ? cache.cell(i, j) : null, 'd')); put(r0 + 2 + i, c0 + 1 + C.length, cache.cell(i, -1), 'd'); });
  put(r0 + 2 + R.length, c0, 'Grand Total'); C.forEach((cj, j) => put(r0 + 2 + R.length, c0 + 1 + j, cache.cell(-1, j), 'd')); put(r0 + 2 + R.length, c0 + 1 + C.length, cache.cell(-1, -1), 'd');
  return { cells: out, data, rowKeys, colKeys, r1: r0, c1: c0, r2: r0 + 2 + R.length, c2: c0 + 1 + C.length };
}

/**
 * GETPIVOTDATA's cell: the pivot record (as tools.js stores it: { spec, at, rowItems, colItems,
 * valueHead, valueField }), the data field ('Washes' or 'Sum of Washes') and the field / item pairs.
 * Returns the cell key holding that figure, or null (#REF!) when a field or an item is not in it.
 */
export function pivotLocate(p, field, pairs) {
  const f = String(field).toLowerCase(); if (f !== String(p.spec.value).toLowerCase() && f !== String(p.valueHead).toLowerCase()) return null;
  let ri = -1, ci = -1;
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const name = String(pairs[i]).toLowerCase(), item = pairs[i + 1];
    const idx = list => list ? list.findIndex(x => String(x).toLowerCase() === String(item).toLowerCase() || (typeof item === 'number' && x === item)) : -1;
    if (name === String(p.spec.row).toLowerCase()) { ri = idx(p.rowItems); if (ri < 0) return null; }
    else if (p.spec.col && name === String(p.spec.col).toLowerCase()) { ci = idx(p.colItems); if (ci < 0) return null; }
    else return null;
  }
  const { r: r0, c: c0 } = p.at;
  if (!p.colItems) return refKey(ri < 0 ? r0 + 1 + p.rowItems.length : r0 + 1 + ri, c0 + 1);
  return refKey(ri < 0 ? r0 + 2 + p.rowItems.length : r0 + 2 + ri, ci < 0 ? c0 + 1 + p.colItems.length : c0 + 1 + ci);
}
