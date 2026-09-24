// app2/tests/copy-import.js — bring Wolf's edited CSVs in.
//   node app2/tests/copy-import.js <dir>          validate the four CSVs in <dir> (same rules as
//                                                 copy-check), print the diff per row against
//                                                 content/copy, then write them and regenerate
//                                                 content/copy/index.js. Idempotent: importing the
//                                                 same folder twice changes nothing.
//   node app2/tests/copy-import.js <dir> --dry    validate and diff only
// Then: node app2/tests/copy-check.js && node app2/tests/run-checks.js && node app2/tests/smoke.mjs
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCopyDir, renderIndex, COPY_DIR, FILES, HEADERS } from './copy-build.js';
import { checkCopy } from './copy-check.js';
import { parseCsv, toCsv } from '../content/copy/csv.js';

const dir = process.argv[2] && !process.argv[2].startsWith('--') ? resolve(process.argv[2]) : null;
const dry = process.argv.includes('--dry');
if (!dir) { console.error('usage: node app2/tests/copy-import.js <dir> [--dry]'); process.exit(2); }
for (const f of FILES) if (!existsSync(join(dir, f))) { console.error(`missing ${join(dir, f)}`); process.exit(2); }

let incoming;
try { incoming = readCopyDir(dir); } catch (e) { console.error('IMPORT FAILED: ' + e.message); process.exit(1); }
const findings = checkCopy(incoming);
for (const f of findings) console[f.level === 'error' ? 'error' : 'log'](`${f.level.toUpperCase()} ${f.rule} · ${f.where}: ${f.text}`);
const errors = findings.filter(f => f.level === 'error').length;
if (errors) { console.error(`IMPORT FAILED: ${errors} violation(s) — fix them in the sheet and import again`); process.exit(1); }

// the diff per row: key → changed fields
const current = readCopyDir(COPY_DIR);
const keyOf = { 'lessons.csv': r => r.id, 'goals.csv': r => r.lesson_id + '#' + r.goal_index, 'modules.csv': r => r.id, 'site.csv': r => r.key };
let changes = 0;
for (const f of FILES) {
  const a = parseCsv(readFileSync(join(COPY_DIR, f), 'utf8')).rows, b = parseCsv(readFileSync(join(dir, f), 'utf8')).rows;
  const am = new Map(a.map(r => [keyOf[f](r), r])), bm = new Map(b.map(r => [keyOf[f](r), r]));
  for (const [k, r] of bm) {
    const old = am.get(k);
    if (!old) { changes++; console.log(`+ ${f} ${k}`); continue; }
    const diff = HEADERS[f].filter(h => (old[h] || '') !== (r[h] || ''));
    if (diff.length) { changes++; for (const h of diff) console.log(`~ ${f} ${k} · ${h}\n    - ${old[h] || ''}\n    + ${r[h] || ''}`); }
  }
  for (const k of am.keys()) if (!bm.has(k)) { changes++; console.log(`- ${f} ${k} (row removed)`); }
}
console.log(changes ? `${changes} row(s) differ` : 'no differences');
if (dry) process.exit(0);
// write normalised CSVs (the codec's own quoting) and the inlined index
for (const f of FILES) {
  const rows = parseCsv(readFileSync(join(dir, f), 'utf8')).rows;
  writeFileSync(join(COPY_DIR, f), toCsv(HEADERS[f], rows));
}
writeFileSync(join(COPY_DIR, 'index.js'), renderIndex(readCopyDir(COPY_DIR)));
console.log('imported into content/copy and inlined into content/copy/index.js');
void copyFileSync; void incoming; void current;
