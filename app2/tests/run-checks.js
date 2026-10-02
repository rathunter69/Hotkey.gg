// npm run check — the whole gate for the rebuild branch. Must finish in < 30 s.
//   1. syntax: every app2/**/*.js parses as an ES module (node --check)
//   2. isolation: nothing under app2/ imports from outside app2/ (the old build is off-limits)
//   2b. public pages and content/copy/index.js are generated and must not drift; copy-check's rules hold
//   3. unit tests: node --test app2/tests/, files at once up to the core count
// The child steps (1, 2b, 2c, 3) start together and are reported in order, so the gate's wall time
// is its longest step, not their sum. `--full` adds the *.slow.test.js files (the liveness
// equivalence replay): on demand and in the non-blocking full-check workflow, never in the gate.
// No dependencies, no framework, no browser.
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const app2 = resolve(here, '..');
const root = resolve(app2, '..');
const t0 = Date.now();
const kids = new Set();
const fail = (msg) => { for (const c of kids) c.kill(); console.error('\nCHECK FAILED: ' + msg); process.exit(1); };
const FULL = process.argv.includes('--full');
/** A child node process, started now; resolves to { status, stdout, stderr } (inherit: streamed to this terminal instead). */
const run = (args, { inherit = false } = {}) => new Promise(done => {
  const c = spawn(process.execPath, args, { stdio: inherit ? 'inherit' : 'pipe' });
  kids.add(c);
  let stdout = '', stderr = '';
  if (!inherit) { c.stdout.setEncoding('utf8').on('data', d => { stdout += d; }); c.stderr.setEncoding('utf8').on('data', d => { stderr += d; }); }
  const start = Date.now();
  c.on('close', status => { kids.delete(c); done({ status, stdout, stderr, secs: (Date.now() - start) / 1000 }); });
});

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'node_modules' && name !== 'vendor') walk(p, out); }
    else if (/\.(js|mjs)$/.test(name)) out.push(p);
  }
  return out;
}
const files = walk(app2);

// 1. syntax: every file parses as an ES module, in one child process (a node --check per file cost ~7 s of the budget)
const PARSE = `import vm from 'node:vm'; import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(1)) { try { new vm.SourceTextModule(readFileSync(f, 'utf8'), { identifier: f }); } catch (e) { console.error(f + '\\n' + e.message); process.exit(1); } }`;
const synP = run(['--experimental-vm-modules', '--no-warnings', '--input-type=module', '-e', PARSE, ...files]);
// 2b and 2c start now too: they only read
const ppP = run([join(here, 'public-pages.js')]);
// 2d. the CSS check (M94): what a machine can check of 3.0's tells, over every stylesheet and module
const copyP = ['copy-build.js', 'copy-check.js', 'css-check.js'].map(script => run([join(here, script)]));
// 3. unit tests. Most of a test file's cost used to be importing the content (every workbook
// builds its states at import, ~1.5 s of CPU) once per file, since node --test gives each file its
// own process. The gate instead packs the files into one pool per core, each pool one process
// (--experimental-test-isolation=none), so the content is imported once per core; the pools are
// balanced longest first on the weights below. Files that set globals or sign an account in run
// apart, each in its own process. --full runs every file in its own process, the classic way.
const testFiles = files.filter(f => f.endsWith('.test.js') && (FULL || !f.endsWith('.slow.test.js'))).sort();
const base = f => f.slice(f.lastIndexOf('/') + 1).replace(/\.test\.js$/, '');
/** Files that need a process to themselves: they stub globals (localStorage, fetch, a Supabase client) or hold the auth singleton. */
const OWN_PROCESS = new Set(['auth', 'challenge', 'effects', 'entitlement', 'leaderboard', 'lessons', 'moments', 'records', 'site-pages', 'store', 'store-sync', 'telemetry']);
/** Rough CPU seconds beyond the shared imports (measured 2026-10-02); an unlisted file counts 0.3. Only the balance depends on them. */
const WEIGHT = { 'clearcoat-databook': 5.7, 'clearcoat-valuation': 3.6, 'clearcoat-model': 2.7, 'lesson-replay-0': 3.4, 'lesson-replay-1': 2.2, 'lesson-replay-2': 1.5, 'lesson-replay-3': 1.9,
  'recalc-bench': 2.2, drills: 1.3, 'sheet-standard': 1.1, copy: 1.1, schedule: 0.8, 'module-states': 0.8 };
const weight = f => WEIGHT[base(f)] ?? 0.3;
const cores = availableParallelism();
let testJobs;
if (FULL) testJobs = [run(['--test', '--test-concurrency=' + cores, ...testFiles])];
else {
  const pools = Array.from({ length: cores }, () => ({ files: [], w: 0 }));
  for (const f of testFiles.filter(f => !OWN_PROCESS.has(base(f))).sort((a, b) => weight(b) - weight(a))) {
    const p = pools.reduce((a, b) => (b.w < a.w ? b : a)); p.files.push(f); p.w += weight(f);
  }
  testJobs = pools.filter(p => p.files.length).map(p => run(['--test', '--experimental-test-isolation=none', '--no-warnings', ...p.files]));
  const apart = testFiles.filter(f => OWN_PROCESS.has(base(f)));
  if (apart.length) testJobs.push(run(['--test', '--test-concurrency=2', ...apart]));
}
const testP = Promise.all(testJobs);

const syn = await synP;
if (syn.status !== 0) fail(`syntax error in ${relative(root, (syn.stderr.split('\n')[0] || ''))}\n${syn.stderr.split('\n').slice(1).join('\n')}`);
console.log(`syntax ok: ${files.length} modules`);

// 2. isolation — static import specifiers must stay inside app2/
// [^\w$-]: a hyphen before the keyword means a kebab-case id ('welcome-export'), not a statement
const IMPORT_RX = /(?:^|[^\w$-])(?:import|export)\s*(?:[\w${},*\s]+from\s*)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let m;
  while ((m = IMPORT_RX.exec(src))) {
    const spec = m[1] || m[2];
    if (!spec.startsWith('.') && !spec.startsWith('/')) {
      if (spec.startsWith('node:') && f.startsWith(join(app2, 'tests'))) continue; // tests may use node builtins
      fail(`${relative(root, f)} imports a bare specifier "${spec}" — the shipped site has no dependencies`);
    }
    const target = resolve(dirname(f), spec);
    if (!target.startsWith(app2 + '/') ) fail(`${relative(root, f)} imports outside app2/: "${spec}"`);
  }
}
const htmls = readdirSync(app2).filter(n => n.endsWith('.html'));
for (const h of htmls) {
  const src = readFileSync(join(app2, h), 'utf8');
  const bad = src.match(/(?:src|href)=["'](\.\.\/[^"']*|\/(?!app2\/)[^"']*\.(?:js|css))["']/g);
  if (bad) fail(`${h} references files outside app2/: ${bad.join(', ')}`);
}
console.log('isolation ok: no imports from outside app2/');

// 2b. the public lesson and shortcut pages are generated from the lesson data and must not drift
const pp = await ppP;
if (pp.status !== 0) fail((pp.stderr || pp.stdout).trim());
console.log(pp.stdout.trim());

// 2c. the copy layer: content/copy/index.js is inlined from the CSVs and must not drift; the copy rules hold
for (const p of copyP) {
  const r = await p;
  if (r.status !== 0) fail((r.stderr || r.stdout).trim());
  const lines = (r.stdout + r.stderr).trim().split('\n'); console.log(lines[lines.length - 1]);
}

// the test processes' TAP, summed; a failing process prints each failure's block (or everything, when it died without one)
const results = await testP;
const sum = { tests: 0, pass: 0, fail: 0, skipped: 0, todo: 0, cancelled: 0 };
for (const r of results) for (const m of r.stdout.matchAll(/^# (tests|pass|fail|skipped|todo|cancelled) (\d+)$/gm)) sum[m[1]] += +m[2];
const failed = results.filter(r => r.status !== 0);
for (const r of failed) {
  const lines = r.stdout.split('\n'); let shown = false;
  lines.forEach((l, i) => { if (/^\s*not ok /.test(l)) { shown = true; const ind = l.match(/^\s*/)[0].length; let j = i + 1; while (j < lines.length && !(/^\s*(ok|not ok) /.test(lines[j]) && lines[j].match(/^\s*/)[0].length <= ind) && !/^\s*# Subtest/.test(lines[j])) j++; console.error(lines.slice(i, j).join('\n')); } });
  if (!shown) console.error(r.stdout + r.stderr);
}
console.log(`unit tests: ${sum.tests} tests in ${testFiles.length} files, ${sum.pass} pass, ${sum.fail} fail, ${sum.skipped} skipped (${results.length} processes, the longest ${Math.max(...results.map(r => r.secs)).toFixed(1)}s)`);
if (failed.length || sum.fail) fail('unit tests failed');

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nCHECK PASSED in ${secs}s`);
if (!FULL && Date.now() - t0 > 30000) fail(`check took ${secs}s — the budget is 30s`);   // --full is not the gate: no budget
