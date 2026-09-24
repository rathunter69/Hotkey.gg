// npm run check — the whole gate for the rebuild branch. Must finish in < 30 s.
//   1. syntax: every app2/**/*.js parses as an ES module (node --check)
//   2. isolation: nothing under app2/ imports from outside app2/ (the old build is off-limits)
//   3. unit tests: node --test app2/tests/
// No dependencies, no framework, no browser.
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app2 = resolve(here, '..');
const root = resolve(app2, '..');
const t0 = Date.now();
const fail = (msg) => { console.error('\nCHECK FAILED: ' + msg); process.exit(1); };

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'node_modules' && name !== 'vendor') walk(p, out); }
    else if (/\.(js|mjs)$/.test(name)) out.push(p);
  }
  return out;
}
const files = walk(app2);

// 1. syntax
for (const f of files) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) fail(`syntax error in ${relative(root, f)}\n${r.stderr}`);
}
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
const cs = spawnSync(process.execPath, [join(here, 'copy-sync.js')], { encoding: 'utf8' });
if (cs.status !== 0) { process.stdout.write(cs.stdout || ''); process.stderr.write(cs.stderr || ''); console.log('CHECK FAILED: the copy layer is stale (node app2/tests/copy-sync.js --write)'); process.exit(1); }
process.stdout.write(cs.stdout || '');
const pp = spawnSync(process.execPath, [join(here, 'public-pages.js')], { encoding: 'utf8' });
if (pp.status !== 0) fail((pp.stderr || pp.stdout).trim());
console.log(pp.stdout.trim());

// 3. unit tests
const testFiles = files.filter(f => f.endsWith('.test.js')).sort();
const t = spawnSync(process.execPath, ['--test', ...testFiles], { stdio: 'inherit' });
if (t.status !== 0) fail('unit tests failed');

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nCHECK PASSED in ${secs}s`);
if (Date.now() - t0 > 30000) fail(`check took ${secs}s — the budget is 30s`);
