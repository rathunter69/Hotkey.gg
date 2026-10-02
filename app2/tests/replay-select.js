// app2/tests/replay-select.js: which lessons and drills a gate run replays. The gate (run-checks.js)
// sets CHECK_REPLAY to the content files changed since the merge-base with origin/main; then a
// lesson or drill is replayed (solution, after-state chain, hint walk) when
//   - a changed file under content/lessons, content/remixes or content/drills names it (its own
//     file, or a file that quotes its id), or a changed content/workbooks/<id>.js is its workbook, or
//   - it falls in today's slice: its catalogue place modulo SLICES is today's day number modulo
//     SLICES, so every lesson is replayed by the gate at least once every SLICES days.
// Every lesson is still validated and checked for untaught concepts on every run. Without
// CHECK_REPLAY (`--full`, `--measure`, a test file run on its own) everything is replayed.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export const SLICES = 8;
const app2 = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let plan;
/** The gate's plan: null (replay everything), or { files: [paths relative to app2], day }. */
function readPlan() {
  if (plan !== undefined) return plan;
  try { plan = process.env.CHECK_REPLAY ? JSON.parse(process.env.CHECK_REPLAY) : null; } catch { plan = null; }
  if (plan) {
    plan.texts = [];
    for (const f of plan.files || []) {
      if (!/^content\/(lessons|remixes|drills)\/[^/]+\.js$/.test(f)) continue;   // lessons/lib is shared code: a full run covers it
      let text = ''; try { text = readFileSync(resolve(app2, f), 'utf8'); } catch { /* removed */ }
      plan.texts.push({ base: f.slice(f.lastIndexOf('/') + 1, -3), text });
    }
    plan.workbooks = new Set((plan.files || []).map(f => /^content\/workbooks\/([\w-]+)\.js$/.exec(f)).filter(Boolean).map(m => m[1]));
  }
  return plan;
}
/** Why `item` (a lesson or drill, at `index` in its catalogue) is replayed this run: 'all', 'changed', 'slice', or null (validated only). */
export function replayReason(item, index) {
  const p = readPlan();
  if (!p) return 'all';
  if (p.texts.some(t => t.base === item.id || t.text.includes(`'${item.id}'`) || t.text.includes(`"${item.id}"`))) return 'changed';
  if (item.workbook && p.workbooks.has(item.workbook)) return 'changed';
  if (index % SLICES === ((p.day % SLICES) + SLICES) % SLICES) return 'slice';
  return null;
}
/** One line for the gate's summary (it sums these across its processes). */
export function sampleLine(kind, picked, total) {
  if (readPlan()) console.log(`replay-sample ${kind} ${picked} ${total}`);
}
