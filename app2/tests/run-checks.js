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
  c.on('close', status => { kids.delete(c); done({ status, stdout, stderr }); });
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
const copyP = ['copy-build.js', 'copy-check.js'].map(script => run([join(here, script)]));
// 3. unit tests: every file at once up to the core count (node --test's default leaves one core idle)
const testFiles = files.filter(f => f.endsWith('.test.js') && (FULL || !f.endsWith('.slow.test.js'))).sort();
const testP = run(['--test', '--test-concurrency=' + availableParallelism(), ...testFiles], { inherit: true });

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

const t = await testP;
if (t.status !== 0) fail('unit tests failed');

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nCHECK PASSED in ${secs}s`);
if (!FULL && Date.now() - t0 > 30000) fail(`check took ${secs}s — the budget is 30s`);   // --full is not the gate: no budget
