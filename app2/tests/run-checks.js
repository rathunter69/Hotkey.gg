// npm run check — the whole gate for the rebuild branch. Must finish in < 30 s.
//   1. syntax: every app2/**/*.js parses as an ES module (node --check)
//   2. isolation: nothing under app2/ imports from outside app2/ (the old build is off-limits)
//   2b. public pages and content/copy/index.js are generated and must not drift; copy-check's rules hold
//   3. unit tests: node --test app2/tests/, files at once up to the core count
// The child steps (1, 2b, 2c, 3) start together and are reported in order, so the gate's wall time
// is its longest step, not their sum. `--full` adds the *.slow.test.js files (the liveness
// equivalence replay): on demand and in the non-blocking full-check workflow, never in the gate.
// `--measure` times every test file (and every lesson's replays) on its own and writes
// check-costs.json, which the gate balances its processes on; rerun it when a chapter lands.
// The gate replays a sample of the lessons and drills (replay-select.js): those whose content
// changed since the merge-base with origin/main (CHECK_BASE overrides), plus today's eighth of the
// catalogue; every lesson is still validated. `--full` replays everything and is the step before
// a run merges to main. A change to the engine, the runner, the schema or the lesson checks prints
// that a full run is required before merging.
// CHECK_VERBOSE=1 prints each test process's time and files.
// No dependencies, no framework, no browser.
import { spawn, execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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
const MEASURE = process.argv.includes('--measure');
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
const base = f => f.slice(f.lastIndexOf('/') + 1).replace(/\.test\.js$/, '');
const COSTS_FILE = join(here, 'check-costs.json');

// --measure: each test file in a process of its own (two at a time, so the timings stay honest),
// its tests' durations summed (the shared imports are not counted: a pool pays them once); the
// replay shards' tests are summed per lesson as well. Writes check-costs.json and stops.
if (MEASURE) {
  const list = files.filter(f => f.endsWith('.test.js') && !f.endsWith('.slow.test.js')).sort();
  const out = { note: 'CPU seconds per test file and per lesson replay, from `node app2/tests/run-checks.js --measure`; the gate balances its processes on these', files: {}, lessons: {} };
  const queue = [...list];
  const worker = async () => {
    for (let f; (f = queue.shift());) {
      const r = await run(['--test', '--experimental-test-isolation=none', '--no-warnings', '--test-reporter=tap', f]);
      if (r.status !== 0) fail(`${relative(root, f)} fails; measure a passing tree`);
      let name = null, sum = 0;
      for (const l of r.stdout.split('\n')) {
        const m = /^(?:not )?ok \d+ - (.*)$/.exec(l); if (m) { name = m[1]; continue; }
        const d = /^ {2}duration_ms: ([\d.]+)/.exec(l); if (!d || name === null) continue;
        const secs = +d[1] / 1000; sum += secs;
        const lesson = /^lesson-replay-\d+$/.test(base(f)) && /^([\w.-]+): /.exec(name);
        if (lesson) out.lessons[lesson[1]] = (out.lessons[lesson[1]] || 0) + secs;
        name = null;
      }
      out.files[base(f)] = sum;
      process.stdout.write('.');
    }
  };
  await Promise.all([worker(), worker()]);
  const round = o => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [k, Math.round(v * 100) / 100]));
  out.files = round(out.files); out.lessons = round(out.lessons);
  for (const k of Object.keys(out.files)) if (/^lesson-replay-\d+$/.test(k)) delete out.files[k];   // a shard's cost is its lessons'
  writeFileSync(COSTS_FILE, JSON.stringify(out, null, 1) + '\n');
  console.log(`\nmeasured ${list.length} files and ${Object.keys(out.lessons).length} lessons in ${((Date.now() - t0) / 1000).toFixed(0)}s: ${relative(root, COSTS_FILE)}`);
  process.exit(0);
}

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
// balanced longest first on the measured costs (check-costs.json, see --measure). Files that set
// globals or sign an account in run apart, each in its own process. --full runs every file in its
// own process, the classic way.
const testFiles = files.filter(f => f.endsWith('.test.js') && (FULL || !f.endsWith('.slow.test.js'))).sort();
/**
 * Files that need a process to themselves: they stub globals (localStorage, fetch, a Supabase client)
 * for the whole file or hold the auth singleton. lessons and challenge stub localStorage only inside
 * a test and take it away in its finally, so they pool (each would otherwise import the content again).
 */
const OWN_PROCESS = new Set(['auth', 'effects', 'entitlement', 'leaderboard', 'moments', 'records', 'site-pages', 'store', 'store-sync', 'telemetry']);
/**
 * A file's measured CPU seconds beyond the shared imports; a file not measured yet counts the
 * median. A replay shard counts an equal part of every measured lesson: lesson-replay.js deals the
 * lessons to its shards on the same costs, so the shards come out even. Only the balance depends on these.
 */
let COSTS = { files: {}, lessons: {} };
try { COSTS = JSON.parse(readFileSync(COSTS_FILE, 'utf8')); } catch { /* none yet: every file counts the same */ }
const shardFiles = testFiles.filter(f => /^lesson-replay-\d+$/.test(base(f)));
const lessonTotal = Object.values(COSTS.lessons || {}).reduce((a, b) => a + b, 0);
const fileCosts = Object.values(COSTS.files || {}).sort((a, b) => a - b);
const median = fileCosts.length ? fileCosts[fileCosts.length >> 1] : 0.3;
const weight = f => (shardFiles.includes(f) ? (lessonTotal * replayShare) / shardFiles.length || median : (COSTS.files?.[base(f)] ?? median) * (base(f) === 'drills' ? replayShare : 1));
// the gate's replay sample: the files changed since the merge-base with origin/main (the working
// tree included), for replay-select.js in the test processes. No git (a bare copy): everything replays.
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean);
let changed = null;
if (!FULL) {
  try {
    let since; try { since = git(['merge-base', 'HEAD', process.env.CHECK_BASE || 'origin/main'])[0]; } catch { since = null; }
    const committed = since ? git(['diff', '--name-only', since]) : git(['diff-tree', '--no-commit-id', '--name-only', '-r', '--root', 'HEAD']).concat(git(['diff', '--name-only', 'HEAD']));
    changed = [...new Set([...committed, ...git(['ls-files', '--others', '--exclude-standard'])])].filter(f => f.startsWith('app2/')).map(f => f.slice(5));
    process.env.CHECK_REPLAY = JSON.stringify({ files: changed, day: Math.floor(Date.now() / 86400000) });
  } catch { changed = null; }
}
/** Shared code every replay runs through: a change to it needs the full run before merging. */
const SHARED = [/^engine\//, /^app\/runner\.js$/, /^app\/graders\.js$/, /^content\/schema\.js$/, /^content\/lessons\/lib\//, /^content\/workbooks\/(index|page|clusters)\.js$/];
const sharedTouched = (changed || []).filter(f => SHARED.some(rx => rx.test(f)));
// the sample's share of the replay work, for the balance only: today's slice plus the changed content files
const contentChanged = (changed || []).filter(f => /^content\/(lessons|remixes|drills|workbooks)\/[^/]+\.js$/.test(f)).length;
const replayShare = process.env.CHECK_REPLAY ? 0.12 + 0.88 * Math.min(1, 1 / 8 + contentChanged / 40) : 1;   // validation (about an eighth of a lesson's cost) runs for every lesson

const cores = availableParallelism();
let testJobs;
if (FULL) testJobs = [run(['--test', '--test-concurrency=' + cores, ...testFiles])];
else {
  const pools = Array.from({ length: cores }, () => ({ files: [], w: 0 }));
  for (const f of testFiles.filter(f => !OWN_PROCESS.has(base(f))).sort((a, b) => weight(b) - weight(a) || (a < b ? -1 : 1))) {
    const p = pools.reduce((a, b) => (b.w < a.w ? b : a)); p.files.push(f); p.w += weight(f);
  }
  const verbose = (files, w) => r => { if (process.env.CHECK_VERBOSE) console.log(`${r.secs.toFixed(1)}s (est ${w.toFixed(1)}s) ${files.map(base).join(' ')}`); return r; };
  testJobs = pools.filter(p => p.files.length).map(p => run(['--test', '--experimental-test-isolation=none', '--no-warnings', ...p.files]).then(verbose(p.files, p.w)));
  const apart = testFiles.filter(f => OWN_PROCESS.has(base(f)));
  if (apart.length) testJobs.push(run(['--test', '--test-concurrency=2', ...apart]).then(verbose(apart, apart.reduce((a, f) => a + weight(f), 0))));
}
const testP = Promise.all(testJobs);

const syn = await synP;
if (syn.status !== 0) fail(`syntax error in ${relative(root, (syn.stderr.split('\n')[0] || ''))}\n${syn.stderr.split('\n').slice(1).join('\n')}`);
console.log(`syntax ok: ${files.length} modules`);

// 2. isolation — static import specifiers must stay inside app2/
// [^\w$-]: a hyphen before the keyword means a kebab-case id ('welcome-export'), not a statement.
// An export names a module only through a from clause; the keyword followed straight by a quote is not a
// statement, so text such as 'ties to the export' is not read as one.
const IMPORT_RX = /(?:^|[^\w$-])(?:import\s*(?:[\w${},*\s]+from\s*)?|export\s*[\w${},*\s]+from\s*)['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
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
const sample = { lessons: [0, 0], drills: [0, 0] };
for (const r of results) for (const m of r.stdout.matchAll(/^replay-sample (lessons|drills) (\d+) (\d+)$/gm)) { sample[m[1]][0] += +m[2]; sample[m[1]][1] += +m[3]; }
if (sample.lessons[1]) console.log(`replays: ${sample.lessons[0]} of ${sample.lessons[1]} lessons and ${sample.drills[0]} of ${sample.drills[1]} drills (changed since ${process.env.CHECK_BASE || 'origin/main'}, and today's eighth); every lesson validated; npm run check:full replays all`);
if (sharedTouched.length) console.log(`FULL RUN REQUIRED before merging: this change touches shared code every replay runs through (${sharedTouched.slice(0, 3).join(', ')}${sharedTouched.length > 3 ? ` and ${sharedTouched.length - 3} more` : ''}); run npm run check:full`);
if (failed.length || sum.fail) fail('unit tests failed');

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nCHECK PASSED in ${secs}s`);
if (!FULL && Date.now() - t0 > 30000) fail(`check took ${secs}s — the budget is 30s`);   // --full is not the gate: no budget
