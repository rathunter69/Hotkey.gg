/* CURRICULUM MAP GUARD (r454, dev/CURRICULUM_REBUILD.md Phase A).
   Reads dev/curriculum-v3.json — the nine-chapter map — and asserts the six properties
   that make it a LADDER rather than a list. No browser, no network: it loads one JSON and
   drills.js (via vm, the dev/check-invariants.js pattern) and runs in well under a second,
   so it belongs in gate.yml's always-on fast lane.

     (a) NO REQUIRE-BEFORE-TEACH. Every REQUIRES tag of every entry is TAUGHT by a strictly
         earlier entry in catalog order (chapter order, then drill order). The audit
         (dev/audit-r452/audit-catalog.md §1.3) counted 59 of these on the live catalog.
         On this map the count must be 0.
     (b) CAPSTONE LAST, AND IT CHAINS. Each chapter's last entry is its declared capstone,
         and the capstone's TEACHES is a subset of the tags taught strictly earlier — a
         capstone chains what the chapter taught, it never introduces.
     (c) MEMBERSHIP. Every key in drills.js menuOrder appears exactly once in the map; no
         key is invented; the Tour is present and is NOT a catalog drill.
     (d) EVERY CHAPTER OPENS ON TEACHING. The first entry of each chapter is the Tour or a
         lesson — unless the chapter declares opener_exempt, which is legal only when the
         chapter introduces no tag that is not already taught before it AND it opens on its
         own lowest-par drill.
     (e) TIER + LEVEL CURVE. tier is free|pro on every chapter, free chapters all precede
         pro ones, free chapters carry no unlock_level, and pro unlock_levels strictly rise.
     (f) THE DIFFICULTY SPINE. Inside a chapter, par(i+1) >= 0.63 x par(i) over the graded
         drills (lessons and the Tour are exempt — a 14-second lesson is a start gate, not a
         rung). 0.63 is the audit §2.3 "drop" threshold. The spine is printed either way.

   Run: node dev/check-curriculum-map.js     (exit 0 = clean) */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'dev', 'curriculum-v3.json');
const DROP = 0.63;

let fail = 0;
const bad = m => { fail++; console.error('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);

const M = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const chapters = M.chapters || [];
if (!chapters.length) { console.error('FAIL curriculum-v3.json: no chapters'); process.exit(1); }

/* flatten into catalog order: chapter order, then drill order */
const flat = [];
for (const c of chapters) for (const d of (c.drills || [])) flat.push({ ch: c, d, ref: c.id + '/' + d.key });

/* ---------- vocabulary ---------- */
{
  const vocab = new Set(M.tags || []);
  let strays = 0;
  for (const { ref, d } of flat)
    for (const t of [].concat(d.requires || [], d.teaches || []))
      if (!vocab.has(t)) { bad(`${ref}: tag '${t}' is not in the map's tags[] vocabulary`); strays++; }
  if (!strays) ok(`vocabulary: ${vocab.size} tags, every REQUIRES/TEACHES tag declared`);
}

/* ---------- (a) require-before-teach ---------- */
const firstTaughtAt = new Map();   // tag -> ref of the first entry that teaches it
{
  const taught = new Map();
  let violations = 0;
  for (const { ref, d } of flat) {
    for (const t of (d.requires || []))
      if (!taught.has(t)) {
        const later = flat.find(x => (x.d.teaches || []).includes(t));
        violations++;
        bad(`${ref} requires ${t}, first taught at ${later ? later.ref : 'never'}`);
      }
    for (const t of (d.teaches || [])) if (!taught.has(t)) { taught.set(t, ref); firstTaughtAt.set(t, ref); }
  }
  console.log(`\nCURRICULUM MAP: ${violations} violations\n`);
  if (!violations) ok(`(a) require-before-teach: 0 violations across ${flat.length} entries`);
  // orphan report: a tag nothing teaches
  const orphans = (M.tags || []).filter(t => !taught.has(t));
  if (orphans.length) bad(`(a) tags taught by nothing: ${orphans.join(', ')}`);
  else ok(`(a) every tag in the vocabulary has a teacher`);
}

/* ---------- (b) capstone last, and it chains ---------- */
{
  let bad_b = 0;
  for (const c of chapters) {
    const ds = c.drills || [];
    const last = ds[ds.length - 1];
    if (!c.capstone) { bad(`(b) ${c.id} declares no capstone`); bad_b++; continue; }
    if (!last || last.key !== c.capstone) { bad(`(b) ${c.id}: last entry is '${last && last.key}', not the declared capstone '${c.capstone}'`); bad_b++; }
    if (last && last.kind !== 'capstone') { bad(`(b) ${c.id}/${last.key}: capstone entry must have kind 'capstone' (has '${last.kind}')`); bad_b++; }
    // the capstone may not introduce: everything it teaches must be taught strictly earlier
    const before = new Set();
    for (const { d, ref } of flat) {
      if (ref === c.id + '/' + c.capstone) break;
      for (const t of (d.teaches || [])) before.add(t);
    }
    for (const t of ((last && last.teaches) || []))
      if (!before.has(t)) { bad(`(b) ${c.id}/${c.capstone} introduces '${t}' — a capstone chains, it does not introduce`); bad_b++; }
    const cnt = ds.filter(d => d.kind === 'capstone').length;
    if (cnt !== 1) { bad(`(b) ${c.id}: ${cnt} entries of kind 'capstone' (want exactly 1)`); bad_b++; }
  }
  if (!bad_b) ok(`(b) all ${chapters.length} chapters end on their capstone, and no capstone introduces a tag`);
}

/* ---------- (c) membership against drills.js ---------- */
{
  const sandbox = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console: { warn() {}, log() {} }, navigator: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'drills.js'), 'utf8'), sandbox);
  const D = sandbox.window.HOTKEY_DRILLS || {};
  const live = D.menuOrder || (D.groups || []).flatMap(g => g.keys || []);
  const liveSet = new Set(live);

  const mapKeys = flat.map(f => f.d.key);
  const dupes = mapKeys.filter((k, i) => mapKeys.indexOf(k) !== i);
  if (dupes.length) bad(`(c) key(s) listed more than once in the map: ${[...new Set(dupes)].join(', ')}`);

  const catalogKeys = flat.filter(f => f.d.kind !== 'tour').map(f => f.d.key);
  const catalogSet = new Set(catalogKeys);
  const missing = live.filter(k => !catalogSet.has(k));
  const invented = flat.filter(f => f.d.status === 'built' && f.d.kind !== 'tour' && !liveSet.has(f.d.key)).map(f => f.d.key);
  if (missing.length) bad(`(c) live catalog key(s) absent from the map: ${missing.join(', ')}`);
  if (invented.length) bad(`(c) key(s) marked status 'built' that drills.js does not have: ${invented.join(', ')}`);

  const tours = flat.filter(f => f.d.kind === 'tour');
  if (tours.length !== 1) bad(`(c) expected exactly 1 entry of kind 'tour', found ${tours.length}`);
  else if (tours[0].ch.id !== chapters[0].id || tours[0].ch.drills[0].key !== tours[0].d.key)
    bad(`(c) the Tour must be the first entry of the first chapter`);
  else if (liveSet.has(tours[0].d.key)) bad(`(c) the Tour '${tours[0].d.key}' must NOT be in menuOrder — it is not a catalog drill`);

  const adds = flat.filter(f => f.d.status === 'add');
  const lessons = flat.filter(f => f.d.kind === 'lesson');
  if (lessons.length > 8) bad(`(c) ${lessons.length} lesson drills — the program caps lessons at 8`);
  if (!missing.length && !invented.length && !dupes.length)
    ok(`(c) membership: ${live.length} live keys each appear once · +${adds.length} ADDs (${lessons.length} lessons, ${adds.length - lessons.length} capstones) · catalog after = ${catalogKeys.length}`);
}

/* ---------- (d) every chapter opens on teaching ---------- */
{
  let bad_d = 0;
  const exempt = [];
  for (const c of chapters) {
    const first = (c.drills || [])[0];
    if (!first) { bad(`(d) ${c.id} is empty`); bad_d++; continue; }
    if (first.kind === 'tour' || first.kind === 'lesson') continue;
    if (!c.opener_exempt) { bad(`(d) ${c.id} opens on '${first.key}' (kind ${first.kind}) — a chapter opens on a lesson or the Tour`); bad_d++; continue; }
    // an exemption is legal only if the chapter introduces nothing new...
    const before = new Set();
    for (const { ch, d } of flat) { if (ch.id === c.id) break; for (const t of (d.teaches || [])) before.add(t); }
    const introduced = [];
    for (const d of c.drills) for (const t of (d.teaches || [])) if (!before.has(t)) introduced.push(t);
    if (introduced.length) { bad(`(d) ${c.id} claims opener_exempt but introduces ${[...new Set(introduced)].join(', ')}`); bad_d++; continue; }
    // ...and only if it opens on its own lowest par
    const pars = c.drills.filter(d => typeof d.par === 'number').map(d => d.par);
    if (first.par !== Math.min(...pars)) { bad(`(d) ${c.id} claims opener_exempt but opens on par ${first.par}, not its lowest (${Math.min(...pars)})`); bad_d++; continue; }
    exempt.push(`${c.id} ${c.name} (opens ${first.key}, par ${first.par})`);
  }
  if (!bad_d) ok(`(d) every chapter opens on the Tour or a lesson · ${exempt.length} recorded exemption(s): ${exempt.join(' · ') || 'none'}`);
}

/* ---------- (e) tier + level curve ---------- */
{
  let bad_e = 0, seenPro = false, lastLvl = 0;
  for (const c of chapters) {
    if (c.tier !== 'free' && c.tier !== 'pro') { bad(`(e) ${c.id}: tier '${c.tier}' must be free or pro`); bad_e++; continue; }
    if (c.tier === 'free') {
      if (seenPro) { bad(`(e) ${c.id} is free but follows a pro chapter — free chapters precede pro ones`); bad_e++; }
      if (c.unlock_level !== null) { bad(`(e) ${c.id} is free and must carry unlock_level null (has ${c.unlock_level})`); bad_e++; }
    } else {
      seenPro = true;
      if (typeof c.unlock_level !== 'number') { bad(`(e) ${c.id} is pro and needs a numeric unlock_level`); bad_e++; }
      else if (c.unlock_level <= lastLvl) { bad(`(e) ${c.id} unlock_level ${c.unlock_level} does not rise above ${lastLvl}`); bad_e++; }
      else lastLvl = c.unlock_level;
    }
  }
  const free = chapters.filter(c => c.tier === 'free'), pro = chapters.filter(c => c.tier === 'pro');
  if (!bad_e) ok(`(e) tiers: free ${free.map(c => c.id).join(' ')} · pro ${pro.map(c => c.id + '@L' + c.unlock_level).join(' ')}`);
}

/* ---------- (f) the difficulty spine ---------- */
{
  let bad_f = 0;
  console.log('\n  THE SPINE (par by position; · = lesson/tour, exempt)');
  for (const c of chapters) {
    const line = c.drills.map(d => (d.kind === 'lesson' || d.kind === 'tour') ? '·' : d.par).join(' → ');
    console.log(`    ${c.id} ${c.name.padEnd(18)} ${line}`);
    const graded = c.drills.filter(d => d.kind !== 'lesson' && d.kind !== 'tour');
    for (let i = 0; i + 1 < graded.length; i++) {
      const a = graded[i], b = graded[i + 1];
      const r = b.par / a.par;
      if (r < DROP) { bad(`(f) ${c.id}: ${a.key} ${a.par} → ${b.key} ${b.par} is x${r.toFixed(2)} — below the x${DROP} floor`); bad_f++; }
    }
  }
  // report the jumps, too (not a failure — the doc flags them)
  const jumps = [];
  for (const c of chapters) {
    const g = c.drills.filter(d => d.kind !== 'lesson' && d.kind !== 'tour');
    for (let i = 0; i + 1 < g.length; i++) { const r = g[i + 1].par / g[i].par; if (r > 1.6) jumps.push(`${c.id} ${g[i].key} ${g[i].par} → ${g[i + 1].key} ${g[i + 1].par} x${r.toFixed(2)}`); }
  }
  console.log('\n  jumps > x1.6 (reported, not failed): ' + (jumps.length ? jumps.length : 'none'));
  jumps.forEach(j => console.log('    ' + j));
  if (!bad_f) ok(`\n(f) spine monotone within tolerance in all ${chapters.length} chapters (floor x${DROP})`);
}

console.log(fail ? `\nCURRICULUM MAP: ${fail} FAILURE(S)` : '\nCURRICULUM MAP: clean');
process.exit(fail ? 1 : 0);
