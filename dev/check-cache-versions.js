/* CACHE-BUMP GUARD (A1, r414-review Segment A). The `?v=` query on shared assets
   is the ONLY cache-bust (no service worker). It's been forgotten before — r390-392
   shipped nothing to returning visitors because the versions never moved. This makes
   the discipline a gate:
     1. CONSISTENCY (always): every *.html must agree on ONE version per asset — a
        partial sed that leaves some pages behind is the silent-stale failure mode.
     2. BUMP (when GATE_BASE is set to a git ref): if a shared asset's file content
        changed vs BASE, its `?v=` must have moved too.
   Run: node dev/check-cache-versions.js            (consistency only)
        GATE_BASE=<sha> node dev/check-cache-versions.js   (+ bump check)     */
'use strict';
const fs = require('fs');
const cp = require('child_process');
const ASSETS = ['themes.js', 'nav.js', 'nav.css', 'lb.js', 'lb.css', 'drills.js'];
const html = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let fail = 0;
const cur = {}; // asset -> {version -> [files]}

for (const asset of ASSETS) {
  const re = new RegExp(asset.replace('.', '\\.') + '\\?v=(\\d+)', 'g');
  const seen = {};
  for (const f of html) {
    const t = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(t))) (seen[m[1]] = seen[m[1]] || []).push(f);
  }
  cur[asset] = seen;
  const versions = Object.keys(seen);
  if (versions.length > 1) {
    fail++;
    console.error(`FAIL ${asset}: inconsistent ?v= across HTML — ` +
      versions.map(v => `v${v}(${seen[v].length})`).join(', '));
    for (const v of versions) console.error(`    v${v}: ${seen[v].join(', ')}`);
  } else if (versions.length === 1) {
    console.log(`  ok  ${asset}?v=${versions[0]} — ${seen[versions[0]].length} files agree`);
  }
}

const BASE = process.env.GATE_BASE;
if (BASE) {
  const git = a => { try { return cp.execSync(a, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch (e) { return null; } };
  for (const asset of ASSETS) {
    const changed = git(`git diff --name-only ${BASE} -- ${asset}`);
    if (changed && changed.trim()) {
      const nowV = Object.keys(cur[asset])[0];
      // find the asset's old version from any HTML at BASE
      let oldV = null;
      for (const f of html) {
        const old = git(`git show ${BASE}:${f}`);
        if (!old) continue;
        const m = old.match(new RegExp(asset.replace('.', '\\.') + '\\?v=(\\d+)'));
        if (m) { oldV = m[1]; break; }
      }
      if (oldV != null && nowV != null && oldV === nowV) {
        fail++;
        console.error(`FAIL ${asset}: file changed vs ${BASE.slice(0, 7)} but ?v= is still ${nowV} — bump it across all HTML`);
      } else if (oldV != null) {
        console.log(`  ok  ${asset} changed and bumped v${oldV} -> v${nowV}`);
      }
    }
  }
}

if (fail) { console.error(`\nCACHE-BUMP GUARD: ${fail} problem(s)`); process.exit(1); }
console.log('CACHE-BUMP GUARD: clean');
