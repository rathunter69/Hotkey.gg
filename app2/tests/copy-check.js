// app2/tests/copy-check.js — what the copy layer still needs from Wolf (C2 Run 3): every draft
// row (the platform's inline text standing in for his), grouped by lesson / beat / micro-drill.
//   node app2/tests/copy-check.js            the list, with counts
//   node app2/tests/copy-check.js --ids      ids only
import { allCopyRows } from '../content/copy/index.js';
const rows = allCopyRows();
const drafts = rows.filter(r => r.draft);
const by = new Map();
for (const r of drafts) { if (!by.has(r.id)) by.set(r.id, []); by.get(r.id).push(r); }
if (process.argv.includes('--ids')) { for (const id of by.keys()) console.log(id); }
else {
  for (const [id, list] of by) { console.log(`${id}  (${list.length} draft)`); for (const r of list) console.log(`  ${r.field}: ${r.text.length > 90 ? r.text.slice(0, 87) + '…' : r.text}`); }
  console.log(`\n${drafts.length} draft rows across ${by.size} items; ${rows.length - drafts.length} written.`);
}
