/* STATIC INVARIANTS GUARD (Segment C, r414-review). Catches the single-source-of-
   truth DRIFT bug class in CI — the same fact hand-copied in many places and silently
   diverging (caused the #121 notch-pill bug and the #76 membership drift). No browser.
     C1 — drills.js membership: campaign/track keys are all real drills; the 3 cert
          tracks partition the whole catalog; menuOrder + HOTKEY_PARS line up.
     C3 — skin-list coverage: every SKINS key wears a per-class notch (.hkf-tab)
          override in nav.css, so a new skin can't silently fall back to the base pill.
     C5 — de-hint the picker metadata (r419 H4): drills.js meta name/label/tab/desc are
          player-visible before a drill even opens, so they must never leak a chord
          (the AUDIT_R417 §D Class A regression: "Alt E S everything", tab "F4",
          "F9 the suspect leg"). e2e-smoke's runtime de-hint covers index.html prompt/
          checklist/desc but never scanned these fields, and its pattern skips bare
          F-keys (cell refs there are content); picker metadata has no cell refs, so
          bare F1-F12 are flagged here too.
   Run: node dev/check-invariants.js */
'use strict';
const fs = require('fs');
const vm = require('vm');
let fail = 0;
const bad = m => { fail++; console.error('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);

/* ---- C1: drills.js membership (load via a window shim) ---- */
try {
  const sandbox = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sandbox);
  const W = sandbox.window;
  const D = W.HOTKEY_DRILLS || {};
  const groups = D.groups || [];
  const valid = new Set(groups.flatMap(g => g.keys || []));
  if (!valid.size) bad('drills.js: no drill keys parsed (shape changed?)');

  // campaign chapter keys are all real drills
  const camp = (W.HOTKEY_CAMPAIGN && W.HOTKEY_CAMPAIGN.chapters) || [];
  const chapIds = new Set(camp.map(c => c.id));
  for (const c of camp) for (const k of (c.keys || []))
    if (!valid.has(k)) bad(`HOTKEY_CAMPAIGN chapter ${c.id}: '${k}' is not a real drill key`);

  // gate bypass chapters reference real campaign chapters
  const gates = W.HOTKEY_GATES || {};
  for (const g of Object.keys(gates))
    for (const ch of (gates[g].chapters || []))
      if (!chapIds.has(ch)) bad(`HOTKEY_GATES.${g}: bypass chapter '${ch}' not in HOTKEY_CAMPAIGN`);

  // the 3 cert tracks partition the whole catalog (no drill orphaned, no stray)
  const tracks = W.HK_TRACKS || {};
  const trackUnion = new Set();
  for (const t of Object.keys(tracks)) {
    for (const k of (tracks[t].keys || [])) {
      if (!valid.has(k)) bad(`HK_TRACKS.${t}: '${k}' is not a real drill key`);
      trackUnion.add(k);
    }
    for (const ch of (tracks[t].milestones || []))
      if (ch && ch.chapter && !chapIds.has(ch.chapter)) bad(`HK_TRACKS.${t}: milestone chapter '${ch.chapter}' not in HOTKEY_CAMPAIGN`);
  }
  if (valid.size) {
    for (const k of valid) if (!trackUnion.has(k)) bad(`drill '${k}' is in no certificate track`);
    if (fail === 0) ok(`drills.js: ${valid.size} drills, all campaign/track keys valid, tracks partition the catalog`);
  }

  // HOTKEY_PARS keys are all real drills, and every drill has a par snapshot
  const pars = W.HOTKEY_PARS || {};
  for (const k of Object.keys(pars)) if (!valid.has(k)) bad(`HOTKEY_PARS: '${k}' is not a real drill key`);
  for (const k of valid) if (!(k in pars)) bad(`HOTKEY_PARS: missing entry for drill '${k}'`);
} catch (e) {
  bad('C1 drills.js could not be evaluated: ' + String(e.message || e).slice(0, 120));
}

/* ---- C5: drills.js picker metadata carries no keyboard chords (de-hint) ---- */
try {
  const sb = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sb);
  const meta = (sb.window.HOTKEY_DRILLS || {}).meta || {};
  const keys = Object.keys(meta);
  if (!keys.length) bad('C5: no meta entries parsed from drills.js (shape changed?)');
  const CHORD  = /\b(ctrl|alt|cmd|shift)\s*\+/i;            // modifier combos: Ctrl+C, alt+=
  const ALTWALK = /\b[Aa]lt(\s+[A-Za-z0-9]\b){2,}/;         // ribbon walks: "Alt E S", "alt h k"
  const FKEY   = /\bF([1-9]|1[0-2])\b/;                     // bare function keys: F4, F9
  let hits = 0;
  for (const k of keys) for (const f of ['name', 'label', 'tab', 'desc']) {
    const t = String(meta[k][f] || '');
    if (CHORD.test(t) || ALTWALK.test(t) || FKEY.test(t) || t.includes('⌘')) {
      hits++; bad(`C5 de-hint: drills.js meta.${k}.${f} leaks a chord token: "${t.slice(0, 70)}"`);
    }
  }
  if (keys.length && !hits) ok(`drills.js: ${keys.length} meta entries carry no chord tokens (de-hint)`);
} catch (e) {
  bad('C5 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C3: every SKINS key has a per-class notch override in nav.css ---- */
try {
  const themes = fs.readFileSync('themes.js', 'utf8');
  const cssTxt = fs.readFileSync('nav.css', 'utf8');
  const si = themes.indexOf('const SKINS={');
  const block = si >= 0 ? themes.slice(si, themes.indexOf('};', si)) : '';
  const skinKeys = [];
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*'?([a-zA-Z][\w-]*)'?\s*:\s*\[/);
    if (m) skinKeys.push(m[1]);
  }
  if (!skinKeys.length) bad('C3: no SKINS keys parsed from themes.js (shape changed?)');
  // notch override coverage = any `.hk-frame-<id> .hkf-tab` selector (the base `.hkf-tab`
  // rule has no frame prefix, so appearing here means the skin got an explicit shape).
  const covered = new Set();
  let m; const re = /hk-frame-([\w-]+)\s+\.hkf-tab/g;
  while ((m = re.exec(cssTxt))) covered.add(m[1]);
  for (const k of skinKeys)
    if (!covered.has(k)) bad(`C3: skin '${k}' has no per-class notch (.hk-frame-${k} .hkf-tab) in nav.css — it will fall back to the base pill (the #121 bug class)`);
  if (skinKeys.length && fail === 0) ok(`nav.css: all ${skinKeys.length} SKINS wear a per-class notch`);
} catch (e) {
  bad('C3 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C7 (r421, DEPTH_PASS §2.8): split-capture + bonus-☆ wiring stays wired.
   The runtime law (`S.splits.length === checks.length` at the win snapshot, and the
   bonus never blocking the win) is asserted live in dev/e2e-depth-mechanics.js; this
   static guard makes sure the wiring those assertions depend on can't be deleted or
   detached in a refactor without CI noticing. Also: HOTKEY_CLOCKS keys ⊆ real drills
   (the §2.1 override map can't drift from the catalog). ---- */
try {
  const idx = fs.readFileSync('index.html', 'utf8');
  const need = [
    ['function hkSplitTick', 'the §2.1 split-capture latch (hkSplitTick) is gone from index.html'],
    ['hkSplitTick(items)', 'updateChecklist no longer feeds the grading pass into hkSplitTick — splits stop capturing'],
    ['c.ok||c.bonus', 'gradePass no longer filters bonus beats — a ☆ line would BLOCK the win (§2.2 regression)'],
    ['function hkTierTick', 'the §2.5 tier-ladder reveal (hkTierTick) is gone from index.html'],
    ['function hkTouchTick', 'the §2.6 touch-list latch (hkTouchTick) is gone from index.html'],
  ];
  let miss = 0;
  for (const [tok, msg] of need) if (!idx.includes(tok)) { miss++; bad('C7: ' + msg); }
  if (!miss) ok('index.html: depth-pass §2 wiring present (splits · bonus filter · tiers · touch-lists)');

  const sb7 = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sb7);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sb7);
  const valid7 = new Set(((sb7.window.HOTKEY_DRILLS || {}).groups || []).flatMap(g => g.keys || []));
  const clocks = sb7.window.HOTKEY_CLOCKS || {};
  let cbad = 0;
  for (const k of Object.keys(clocks)) {
    if (!valid7.has(k)) { cbad++; bad(`C7: HOTKEY_CLOCKS.'${k}' is not a real drill key`); }
    const o = clocks[k] || {};
    for (const f of Object.keys(o)) if (!['pass', 'pro', 'leg'].includes(f)) { cbad++; bad(`C7: HOTKEY_CLOCKS.${k}.${f} — clocks are {pass, pro, leg} seconds only`); }
  }
  if (!cbad) ok(`drills.js: HOTKEY_CLOCKS ${Object.keys(clocks).length} override(s), all real drills, right shape`);
} catch (e) {
  bad('C7 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C8 (r421, DEPTH_PASS §2.8 + §1.7): bare-range LINT on check labels — a label that
   is ONLY coordinates with no board-label noun ("select B4", "fill A1:E1") flags for
   review; beats reference the real-world item, never the bare cell (Wolf, round 1).
   WARN-ONLY by design ("CI warns, human merges") — never fails the gate. Maze-class
   drills are allowlisted (§1.7 R2(a): obstacle boards where coordinates ARE the game);
   additions to the allowlist require the drill's §4 page claiming the R2(a) exemption. ---- */
try {
  const BARE_RANGE_ALLOW = new Set(['navigation']);
  const idx = fs.readFileSync('index.html', 'utf8');
  const start = idx.indexOf('const CHALLENGES = {');
  const end = idx.indexOf('STATE + ENGINE', start);
  let warned = 0, scanned = 0;
  if (start < 0 || end < 0) { console.warn('  warn C8: CHALLENGES block not found — bare-range lint skipped'); }
  else {
    const body = idx.slice(start, end);
    // split the object into per-drill chunks on top-level `  key:{` lines
    const parts = body.split(/\n  ([a-z][a-z0-9_]*):\s*\{/);
    for (let i = 1; i < parts.length; i += 2) {
      const key = parts[i], chunk = parts[i + 1] || '';
      if (BARE_RANGE_ALLOW.has(key)) continue;
      const re = /label:\s*'((?:[^'\\]|\\.)*)'/g;
      let m;
      while ((m = re.exec(chunk))) {
        scanned++;
        let lab = m[1];
        // strip refs/ranges + row/column coordinates, then ask what nouns are left
        const stripped = lab
          .replace(/\$?[A-J]\$?\d{1,2}(\s*:\s*\$?[A-J]\$?\d{1,2})?/g, ' ')
          .replace(/\b(row|rows|column|columns|col|cols|cell|cells|range)\b\s*\d*/gi, ' ')
          .replace(/\b[A-J]\b/g, ' ');
        const words = (stripped.match(/[a-zA-Z]{2,}/g) || []);
        if (words.length < 2 && /[A-J]\$?\d/.test(lab)) {
          warned++;
          console.warn(`  warn C8 bare-range: ${key} check label is coordinates with no board-label noun: "${lab.slice(0, 70)}"`);
        }
      }
    }
    console.log(`  ok  C8 bare-range lint: ${scanned} static labels scanned, ${warned} flagged (warn-only — §1.7 semantic rule)`);
  }
} catch (e) {
  console.warn('  warn C8 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C9 (r422, DEPTH_PASS §0 DoD #2 + §2.8): reworked-drill anatomy — tri-length equality
   (guide.length === checks.length === targets.length, ☆ bonus line included) and EXACTLY ONE
   bonus:true per reworked drill. Static proxy over the drill's source chunk: checks counted as
   `{label:` entries, guide/targets counted as top-level elements of their returned array
   literal (string-aware bracket scan). Drills join REWORKED as their depth-pass page ships.
   r423 (Wolf round-2 §1): reworked drills also declare saveClose:true — the engine APPENDS the
   "Save your work" beat (+1 to checks/guide/targets/demo) AT RUNTIME via hkSaveCloseWire, so the
   STATIC counts asserted here stay the hand-written tri-length; C9 asserts the declaration is
   present and that no drill hand-writes the save beat (the engine owns it, exactly once). ---- */
try {
  const REWORKED = ['navigation','blocksel','filldr','pastes','rowops'];   // r422 H6b-1 wave 1
  const idx = fs.readFileSync('index.html', 'utf8');
  const start = idx.indexOf('const CHALLENGES = {');
  const end = idx.indexOf('STATE + ENGINE', start);
  // count top-level elements of the FIRST array literal returned by fn `name(){ return [ ... ]; }`
  const arrLen = (chunk, name) => {
    const m = new RegExp(name + '\\s*\\(\\)\\s*\\{[^\\[]*?return\\s*\\[').exec(chunk);
    if (!m) return null;
    let i = m.index + m[0].length, depth = 1, elems = 0, sawTok = false, q = null;
    for (; i < chunk.length && depth > 0; i++) {
      const ch = chunk[i];
      if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
      if (ch === "'" || ch === '"' || ch === '`') { q = ch; sawTok = true; continue; }
      if (ch === '[' || ch === '{' || ch === '(') { depth += (ch === '[' ? 1 : 0); if (ch !== '[') { let d2 = 1; const op = ch, clx = ch === '{' ? '}' : ')'; for (i++; i < chunk.length && d2 > 0; i++) { const c2 = chunk[i]; if (q) { if (c2 === '\\') i++; else if (c2 === q) q = null; continue; } if (c2 === "'" || c2 === '"' || c2 === '`') q = c2; else if (c2 === op) d2++; else if (c2 === clx) d2--; } i--; } sawTok = true; continue; }
      if (ch === ']') { depth--; continue; }
      if (ch === ',' && depth === 1) { if (sawTok) elems++; sawTok = false; continue; }
      if (!/\s/.test(ch)) sawTok = true;
    }
    return elems + (sawTok ? 1 : 0);
  };
  if (start < 0 || end < 0) bad('C9: CHALLENGES block not found');
  else {
    const body = idx.slice(start, end);
    const parts = body.split(/\n  ([a-z][a-z0-9_]*):\s*\{/);
    const chunks = {};
    for (let i = 1; i < parts.length; i += 2) chunks[parts[i]] = parts[i + 1] || '';
    for (const key of REWORKED) {
      const chunk = chunks[key];
      if (!chunk) { bad(`C9: reworked drill '${key}' not found in CHALLENGES`); continue; }
      const ci = chunk.indexOf('checks(');
      const checksN = ci >= 0 ? (chunk.slice(ci).match(/\{\s*label:/g) || []).length : 0;
      const guideN = arrLen(chunk, 'guide');
      const targetsN = arrLen(chunk, 'targets');
      const bonusN = (chunk.match(/bonus\s*:\s*true/g) || []).length;
      if (!checksN) bad(`C9: ${key} — no check labels parsed`);
      if (guideN !== checksN || targetsN !== checksN)
        bad(`C9: ${key} — tri-length broken: checks=${checksN} guide=${guideN} targets=${targetsN} (§1.9 index alignment)`);
      if (bonusN !== 1) bad(`C9: ${key} — expected exactly one bonus:true beat, found ${bonusN}`);
      /* r423 §1: the Ctrl+S closer — declared, never hand-written (the engine appends it at runtime) */
      const hasSaveClose = /saveClose\s*:\s*true/.test(chunk);
      const handWritten = /label\s*:\s*'Save your work'/.test(chunk) || /savedN/.test(chunk);
      if (!hasSaveClose) bad(`C9: ${key} — reworked drill must declare saveClose:true (the engine-appended Ctrl+S closer)`);
      if (handWritten) bad(`C9: ${key} — hand-written save beat found; hkSaveCloseWire owns the closer (would double-append)`);
      if (checksN && guideN === checksN && targetsN === checksN && bonusN === 1 && hasSaveClose && !handWritten)
        ok(`C9 ${key}: guide/checks/targets tri-length ${checksN} (+1 saveClose beat at runtime), one ☆ bonus`);
    }
  }
} catch (e) {
  bad('C9 could not run: ' + String(e.message || e).slice(0, 120));
}

if (fail) { console.error(`\nSTATIC INVARIANTS: ${fail} problem(s)`); process.exit(1); }
console.log('STATIC INVARIANTS: clean');
