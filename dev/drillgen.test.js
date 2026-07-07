/* drillgen self-test: 200-seed sweep per generator.
   Asserts: deterministic, grid+checks in bounds, timing in the
   10s–120s product window, and simulateSolve passes. */
const DG = require('./drillgen.js');

const SEEDS = 200;
const keys = Object.keys(DG.GENERATORS);
let failures = 0;
const report = {};

function inBounds(ref) {
  const p = DG.parseA1(ref.replace(/\$/g, ''));
  return p && p.r >= 1 && p.r <= DG.GRID.ROWS && p.c >= 1 && p.c <= DG.GRID.COLS;
}

for (const k of keys) {
  const stats = { parKeysMin: 1e9, parKeysMax: 0, parMin: 1e9, parMax: 0, slowMax: 0, fails: [] };
  for (let s = 1; s <= SEEDS; s++) {
    let a, b;
    try {
      a = DG.make(k, s); b = DG.make(k, s);
    } catch (e) { stats.fails.push(`seed ${s}: threw ${e.message}`); continue; }

    // determinism
    if (JSON.stringify(a) !== JSON.stringify(b)) stats.fails.push(`seed ${s}: nondeterministic`);

    // bounds: grid cells + check cells
    for (const ref of Object.keys(a.grid)) if (!inBounds(ref)) stats.fails.push(`seed ${s}: grid ${ref} OOB`);
    for (const ck of a.checks) if (!inBounds(ck.cell)) stats.fails.push(`seed ${s}: check ${ck.cell} OOB`);

    // no check cell pre-filled with the answer in the start grid (except sort, which rearranges in place)
    if (k !== 'sort') {
      for (const ck of a.checks) {
        if (ck.type === 'value' && a.grid[ck.cell] && a.grid[ck.cell].v === ck.expect && !a.grid[ck.cell].f)
          stats.fails.push(`seed ${s}: ${ck.cell} answer pre-filled`);
      }
    }

    // timing band
    const t = a.timing;
    if (!t.ok) stats.fails.push(`seed ${s}: timing out of band (parKeys=${a.parKeys}, slow=${t.slowCeiling})`);
    stats.parKeysMin = Math.min(stats.parKeysMin, a.parKeys);
    stats.parKeysMax = Math.max(stats.parKeysMax, a.parKeys);
    stats.parMin = Math.min(stats.parMin, a.par);
    stats.parMax = Math.max(stats.parMax, a.par);
    stats.slowMax = Math.max(stats.slowMax, t.slowCeiling);

    // consistency: simulated perfect solve must pass grading
    const res = DG.simulateSolve(a);
    if (!res.pass) stats.fails.push(`seed ${s}: simulateSolve failed: ${JSON.stringify(res.fails.slice(0, 2))}`);
  }
  report[k] = stats;
  if (stats.fails.length) failures += stats.fails.length;
}

console.log('generator        keys(min-max)  par(min-max)s  slowMax  status');
for (const k of keys) {
  const s = report[k];
  const status = s.fails.length ? `FAIL ×${s.fails.length}` : 'ok';
  console.log(
    k.padEnd(16),
    `${s.parKeysMin}-${s.parKeysMax}`.padEnd(14),
    `${s.parMin}-${s.parMax}`.padEnd(14),
    String(s.slowMax).padEnd(8),
    status
  );
  if (s.fails.length) console.log('   ' + s.fails.slice(0, 4).join('\n   '));
}
console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
