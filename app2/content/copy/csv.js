// app2/content/copy/csv.js — a small RFC-4180 CSV codec for the copy layer (no dependencies).
// Fields are quoted when they carry a comma, a quote, or a line break; quotes double. Line
// endings on read may be \n or \r\n; on write they are \n. The first row is the header.
//
//   parseCsv(text)           → { header: [...], rows: [{ col: value }] }
//   toCsv(header, rows)      → text
//   rowsOf(text)             → rows only

export function parseCsv(text) {
  const src = String(text == null ? '' : text).replace(/^﻿/, '');
  const records = [];
  let row = [], field = '', i = 0, inQ = false;
  while (i < src.length) {
    const ch = src[i];
    if (inQ) {
      if (ch === '"') { if (src[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === ',') { row.push(field); field = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(field); records.push(row); row = []; field = ''; i++; continue; }
    field += ch; i++;
  }
  if (field.length || row.length) { row.push(field); records.push(row); }
  const nonEmpty = records.filter(r => r.some(c => c !== ''));
  const header = (nonEmpty.shift() || []).map(h => h.trim());
  const rows = nonEmpty.map(r => { const o = {}; header.forEach((h, k) => { o[h] = (r[k] == null ? '' : r[k]).trim(); }); return o; });
  return { header, rows };
}

export function rowsOf(text) { return parseCsv(text).rows; }

function cell(v) {
  const s = String(v == null ? '' : v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCsv(header, rows) {
  return [header.map(cell).join(','), ...rows.map(r => header.map(h => cell(r[h])).join(','))].join('\n') + '\n';
}
