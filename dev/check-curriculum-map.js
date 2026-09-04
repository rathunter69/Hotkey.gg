/* CURRICULUM MAP GUARD (r454, dev/CURRICULUM_REBUILD.md Phase A; rules re-cut to Wolf's
   2026-09-03 redirects — the ORIGINAL EIGHT chapters, and Foundations rebuilt as FIVE major
   game levels that replace both the lesson drills and the Keyboard Tour).
   Reads dev/curriculum-v3.json — the eight-chapter map — and asserts the six properties
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
     (c) MEMBERSHIP. Every key in drills.js menuOrder appears exactly once in the map, or is
         declared in retired[] with the map key it retires INTO and a 'why'; no key is
         invented; the map carries NO entry of kind 'tour' and declares `keyboardtour`
         retired, because level 1 replaces it.
     (d) FOUNDATIONS IS THE GAME TUTORIAL, AND NO OTHER CHAPTER OPENS ON A WALL.
         (d1) Chapter 1 is EXACTLY FIVE level drills — four of kind 'level', 60–120 s par
              each, then the capstone. No Tour, no lesson, no ordinary drill, no sixth
              entry. Level 1 requires nothing (it is first contact). Each level is a
              multi-act game board teaching one foundational FAMILY; the capstone chains
              all four.
         (d2) Every OTHER chapter opens either on its own lowest-par drill, or on a drill
              whose REQUIRES are all satisfied by Foundations alone — i.e. a player who has
              done nothing but the five levels can walk into it. No chapter opens on a
              capstone. There is no opener_exempt flag and no "a lesson at the head of
              every chapter" rule: Wolf's redirect replaces both.
     (e) TIER + LEVEL CURVE. tier is free|pro on every chapter, free chapters all precede
         pro ones, free chapters carry no unlock_level, and pro unlock_levels strictly rise.
     (f) THE DIFFICULTY SPINE. Inside a chapter, par(i+1) >= 0.63 x par(i) over the graded
         drills. The four Foundations LEVELS are exempt: a level is a 60–120 s multi-act
         teaching board, not a rung on the speed spine — Foundations' first rung is its
         capstone. 0.63 is the audit §2.3 "drop" threshold. The spine is printed anyway.

   --v4 (r457, dev/CATALOG_V4.md §7 wave 0): the SAME proof, over dev/curriculum-v4.json —
   the v4 map, which carries CATALOG_V4's `family`, `board` and §5 `verdict` on every entry
   plus the 15 planned new keys. Only the vocabulary check and (a) require-before-teach run:
   (b)-(f) are properties of the FINAL 64-drill ladder, and wave 0 deliberately leaves the
   chapters and the 74 keys' order exactly where v3 put them (waves 1-8 cut the order). A
   `planned` entry teaches only the tags it DECLARES — one with an empty teaches[] (every new
   capstone) is skipped as a teacher, so a planned drill can never satisfy a requirement it
   has not promised. The run then prints the FAMILY COVERAGE table (§2 P4): every §3 family,
   who teaches it as a primary, and which chapters repeat one.

   Run: node dev/check-curriculum-map.js         (v3 — the gated one, exit 0 = clean)
        node dev/check-curriculum-map.js --v4    (v4 — the wave-0 map) */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const V4 = process.argv.includes('--v4');
const MAP_PATH = path.join(ROOT, 'dev', V4 ? 'curriculum-v4.json' : 'curriculum-v3.json');
const DROP = 0.63;

let fail = 0;
const bad = m => { fail++; console.error('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);

const M = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const chapters = M.chapters || [];
if (!chapters.length) { console.error(`FAIL ${path.basename(MAP_PATH)}: no chapters`); process.exit(1); }
console.log(`MAP: ${path.basename(MAP_PATH)} (${M.version})`);

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
    /* --v4: a `planned` drill is not built, so it teaches ONLY the tags it declares; one with
       an empty teaches[] is skipped as a teacher entirely (it can satisfy nothing). */
    for (const t of (d.teaches || [])) if (!taught.has(t)) { taught.set(t, ref); firstTaughtAt.set(t, ref); }
  }
  console.log(`\nCURRICULUM MAP: ${violations} violations\n`);
  if (!violations) ok(`(a) require-before-teach: 0 violations across ${flat.length} entries`);
  // orphan report: a tag nothing teaches
  const orphans = (M.tags || []).filter(t => !taught.has(t));
  if (orphans.length) bad(`(a) tags taught by nothing: ${orphans.join(', ')}`);
  else ok(`(a) every tag in the vocabulary has a teacher`);
}

/* ---------- --v4 only: the FAMILY COVERAGE table (CATALOG_V4 §2 P4) ---------- */
if (V4) {
  const fams = M.families || {};
  const ids = Object.keys(fams);
  if (!ids.length) bad('(v4) the map declares no families{} — CATALOG_V4 §3 is the source');
  const live = flat.filter(d => d.d.status !== 'planned');
  const primaryOf = {};
  for (const { d } of flat) {
    if (!d.family) { bad(`(v4) ${d.key}: no family — every v4 entry declares one primary family (§3)`); continue; }
    if (!fams[d.family]) bad(`(v4) ${d.key}: family '${d.family}' is not in families{}`);
    if (!d.board) bad(`(v4) ${d.key}: no board — §2 P2 needs one of schedule/table/tape/form/grid/two-block/list/maze/cover`);
    if (!d.verdict) bad(`(v4) ${d.key}: no §5 verdict (keep|recut|new|retire|capstone)`);
    if (d.verdict === 'retire' && !d.absorbedBy) bad(`(v4) ${d.key} is retired and names no absorbedBy key`);
    (primaryOf[d.family] = primaryOf[d.family] || []).push(d.key);
  }
  console.log('\n  FAMILY COVERAGE (§2 P4 — every family a primary somewhere, none twice in a chapter)');
  for (const id of ids) {
    const ks = primaryOf[id] || [];
    console.log(`    ${id.padEnd(4)} ${fams[id].name.padEnd(26)} ${ks.length ? ks.join(' ') : '— NOBODY\'S PRIMARY'}`);
  }
  const uncovered = ids.filter(id => !(primaryOf[id] || []).length);
  if (uncovered.length) console.warn(`WARN (v4) ${uncovered.length} family/families are nobody's primary: ${uncovered.join(', ')}`);
  else ok(`(v4) all ${ids.length} families are some drill's primary`);
  let rep = 0;
  for (const c of chapters) {
    const byFam = {};
    for (const d of c.drills) (byFam[d.family] = byFam[d.family] || []).push(d.key);
    const dupes = Object.entries(byFam).filter(([, ks]) => ks.length > 1);
    console.log(`    ${c.id} ${c.name.padEnd(16)} ${c.drills.length} entries · ${Object.keys(byFam).length} distinct primaries · repeats: ` +
      (dupes.length ? dupes.map(([f, ks]) => `${f}×${ks.length} (${ks.join(' ')})`).join(' · ') : 'none'));
    rep += dupes.length;
  }
  if (rep) console.warn(`WARN (v4) ${rep} chapter/family repeats remain — wave 0 measures them; waves 1-8 cut them (§7)`);
  const tally = {}, boards = {};
  for (const { d } of flat) { tally[d.verdict] = (tally[d.verdict] || 0) + 1; boards[d.board] = (boards[d.board] || 0) + 1; }
  console.log('\n  VERDICTS (§5): ' + Object.entries(tally).map(([k, v]) => k + ' ' + v).join(' · '));
  console.log('  BOARDS   (§2 P2): ' + Object.entries(boards).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(' · '));
  console.log(`  ${live.length} built · ${flat.length - live.length} planned · retired[]: ${(M.retired || []).map(r => r.key + '→' + r.into).join(', ')}`);
}

if (!V4) {
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
  /* a live key may leave the catalog ONLY by naming, in retired[], the map key that absorbs it */
  const retired = M.retired || [];
  const retiredOf = new Map(retired.map(r => [r.key, r.into]));
  for (const r of retired) {
    if (!liveSet.has(r.key) && !r.outside_catalog)
      bad(`(c) retired[] names '${r.key}', which drills.js does not have — a surface outside menuOrder must say outside_catalog:true`);
    if (!r.into || !catalogSet.has(r.into)) bad(`(c) retired '${r.key}' must retire INTO a key the map carries (has '${r.into}')`);
    if (!r.why) bad(`(c) retired '${r.key}' carries no 'why'`);
    if (catalogSet.has(r.key)) bad(`(c) '${r.key}' is both retired and in the catalog`);
  }
  const missing = live.filter(k => !catalogSet.has(k) && !retiredOf.has(k));
  const invented = flat.filter(f => f.d.status === 'built' && f.d.kind !== 'tour' && !liveSet.has(f.d.key)).map(f => f.d.key);
  if (missing.length) bad(`(c) live catalog key(s) absent from the map: ${missing.join(', ')}`);
  if (invented.length) bad(`(c) key(s) marked status 'built' that drills.js does not have: ${invented.join(', ')}`);

  /* the Keyboard Tour is retired into level 1 — the map carries no separate tour entry, and the
     retirement must be declared so nobody re-adds an untimed pre-game by accident */
  const tours = flat.filter(f => f.d.kind === 'tour');
  if (tours.length) bad(`(c) entry of kind 'tour' found (${tours.map(t => t.d.key).join(', ')}) — level 1 replaces the Tour; declare it in retired[] instead`);
  if (!retiredOf.has('keyboardtour')) bad(`(c) the Keyboard Tour must be declared in retired[] (into level 1)`);

  const adds = flat.filter(f => f.d.status === 'add');
  const levels = flat.filter(f => f.d.kind === 'level');
  const stale = flat.filter(f => f.d.kind === 'lesson' || f.d.kind === 'game');
  if (stale.length) bad(`(c) ${stale.length} entries of kind 'lesson'/'game' — the five-level tutorial replaced both; use kind 'level'`);
  const addCaps = adds.filter(f => f.d.kind === 'capstone').length;
  if (!missing.length && !invented.length && !dupes.length)
    ok(`(c) membership: ${live.length} live keys · ${retired.length} retired (${retired.map(r => r.key + '→' + r.into).join(', ') || 'none'}) · +${adds.length} ADDs (${adds.length - addCaps} drills, ${addCaps} capstones) · ${levels.length} levels · catalog after = ${catalogKeys.length}`);
}

/* ---------- (d) Foundations is the game tutorial; no other chapter opens on a wall ---------- */
{
  let bad_d = 0;
  const c1 = chapters[0];

  /* (d1) the five-level tutorial: four levels, then the capstone — nothing else, and no Tour. */
  {
    const ds = c1.drills || [];
    const body = ds.slice(0, -1);                       // everything but the capstone
    if (ds.length !== 5) { bad(`(d1) ${c1.id} carries ${ds.length} entries — Foundations is EXACTLY five levels (four kind 'level' + the capstone)`); bad_d++; }
    const strays = body.filter(d => d.kind !== 'level');
    if (strays.length) { bad(`(d1) ${c1.id} ${c1.name} is the five-level tutorial — every entry before the capstone must be kind 'level'; found ${strays.map(d => d.key + ' (' + d.kind + ')').join(', ')}`); bad_d++; }
    const nLevels = body.filter(d => d.kind === 'level').length;
    if (nLevels !== 4) { bad(`(d1) ${c1.id} carries ${nLevels} entries of kind 'level' (want exactly 4)`); bad_d++; }
    if (body[0] && (body[0].requires || []).length) { bad(`(d1) ${c1.id}/${body[0].key} is level 1 — first contact requires nothing, it has ${body[0].requires.join(', ')}`); bad_d++; }
    for (const d of body)
      if (typeof d.par === 'number' && (d.par < 60 || d.par > 120)) { bad(`(d1) ${c1.id}/${d.key} par ${d.par} — a level runs 60–120 s`); bad_d++; }
    if (!bad_d) ok(`(d1) ${c1.id} ${c1.name} = ${nLevels} levels + ${c1.capstone}, five catalog entries and no Tour · L1 '${body[0] && body[0].key}' is first contact`);
  }

  /* (d2) every other chapter opens on its lowest par, or on a drill the game tutorial
     alone already qualifies the player for. Never on a capstone. */
  const foundationTaught = new Set();
  for (const d of (c1.drills || [])) for (const t of (d.teaches || [])) foundationTaught.add(t);
  const how = [];
  for (const c of chapters.slice(1)) {
    const first = (c.drills || [])[0];
    if (!first) { bad(`(d2) ${c.id} is empty`); bad_d++; continue; }
    if (first.kind === 'capstone') { bad(`(d2) ${c.id} opens on the capstone '${first.key}'`); bad_d++; continue; }
    const pars = c.drills.filter(d => typeof d.par === 'number').map(d => d.par);
    const lowest = Math.min(...pars);
    const isLowest = first.par === lowest;
    const walkIn = (first.requires || []).every(t => foundationTaught.has(t));
    if (!isLowest && !walkIn) {
      const missing = (first.requires || []).filter(t => !foundationTaught.has(t));
      bad(`(d2) ${c.id} opens on '${first.key}' (par ${first.par}, lowest is ${lowest}) and it wants ${missing.join(', ')} — which Foundations does not teach`);
      bad_d++; continue;
    }
    how.push(`${c.id} ${first.key}${isLowest ? ' (lowest par ' + first.par + ')' : ' (walk-in off Foundations)'}`);
  }
  if (!bad_d) ok(`(d2) ${how.length} chapters open on a rung, not a wall: ${how.join(' · ')}`);
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
  console.log('\n  THE SPINE (par by position; ▮ = a Foundations level — exempt, it is a teaching board)');
  for (const c of chapters) {
    const line = c.drills.map(d => (d.kind === 'tour' || d.kind === 'level') ? (d.kind === 'tour' ? '·' : d.par + '▮') : d.par).join(' → ');
    console.log(`    ${c.id} ${c.name.padEnd(18)} ${line}`);
    const graded = c.drills.filter(d => d.kind !== 'tour' && d.kind !== 'level');
    for (let i = 0; i + 1 < graded.length; i++) {
      const a = graded[i], b = graded[i + 1];
      const r = b.par / a.par;
      if (r < DROP) { bad(`(f) ${c.id}: ${a.key} ${a.par} → ${b.key} ${b.par} is x${r.toFixed(2)} — below the x${DROP} floor`); bad_f++; }
    }
  }
  // report the jumps, too (not a failure — the doc flags them)
  const jumps = [];
  for (const c of chapters) {
    const g = c.drills.filter(d => d.kind !== 'tour' && d.kind !== 'level');
    for (let i = 0; i + 1 < g.length; i++) { const r = g[i + 1].par / g[i].par; if (r > 1.6) jumps.push(`${c.id} ${g[i].key} ${g[i].par} → ${g[i + 1].key} ${g[i + 1].par} x${r.toFixed(2)}`); }
  }
  console.log('\n  jumps > x1.6 (reported, not failed): ' + (jumps.length ? jumps.length : 'none'));
  jumps.forEach(j => console.log('    ' + j));
  if (!bad_f) ok(`\n(f) spine monotone within tolerance in all ${chapters.length} chapters (floor x${DROP})`);
}
}

console.log(fail ? `\nCURRICULUM MAP: ${fail} FAILURE(S)` : '\nCURRICULUM MAP: clean');
process.exit(fail ? 1 : 0);
