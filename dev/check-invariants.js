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
     C14 — certificate tracks: the arrays hard-coded in the NEWEST issue_certificate migration
          (and its dev/migrate-certificates.sql mirror) are set-equal to HK_TRACKS from drills.js
          — the r359 drift rule, added r452 after the retired keys sat live in the RPC.
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

  /* ---- CAPSTONE WIRING (r425 DEPTH_PASS §2.4; RESTORED r429) ----
     This guard shipped with modeltour in r425 and was LOST in the r427 union-merge rebuild of
     this file — the r427 commit claims it was carried forward, but no capstone assertion existed
     in the tree when gauntlet (the second capstone) was wired. Restored, with the c2 designation
     as its second live case. WORKFLOW §3.3: no invariant, and the bug returns. */
  const meta = D.meta || {};
  const flagged = Object.keys(meta).filter(k => meta[k] && meta[k].capstone);
  const claimed = new Map();
  for (const c of camp) {
    if (!c.capstone) continue;
    const key = c.capstone;
    if (!valid.has(key)) { bad(`capstone: chapter ${c.id} designates '${key}', which is not a real drill`); continue; }
    if (!(meta[key] && meta[key].capstone)) bad(`capstone: chapter ${c.id} designates '${key}' but drills.js meta.${key}.capstone is not true (the picker ★ tag reads meta)`);
    const grp = groups.find(g => (g.keys || []).includes(key));
    if (!grp) bad(`capstone: '${key}' is in no group`);
    else if (grp.keys[grp.keys.length - 1] !== key) bad(`capstone: '${key}' must sit LAST in its group '${grp.name}' (capstone-last is uniform, §2.4)`);
    if (claimed.has(key)) bad(`capstone: '${key}' is claimed by both ${claimed.get(key)} and ${c.id}`);
    claimed.set(key, c.id);
  }
  for (const k of flagged) if (!claimed.has(k)) bad(`capstone: drills.js meta.${k}.capstone is true but no chapter designates it`);
  if (typeof W.hkCapstoneOk !== 'function') bad('capstone: window.hkCapstoneOk missing — the shared gate predicate every surface reads (§2.4)');
  const clocks = W.HOTKEY_CLOCKS || {};
  for (const [key, chId] of claimed) {
    const cl = clocks[key];
    if (!cl || typeof cl.pass !== 'number') { bad(`capstone: HOTKEY_CLOCKS.${key} needs a pass clock (§2.4: par×2.0)`); continue; }
    const par = (W.HOTKEY_PARS || {})[key];
    if (typeof par === 'number' && cl.pass !== par * 2) bad(`capstone: HOTKEY_CLOCKS.${key}.pass=${cl.pass} but par=${par} — §2.4 wants pass = par × 2 (lockstep)`);
  }
  if (claimed.size) ok(`capstone wiring: ${claimed.size} designated (${[...claimed.keys()].join(', ')}) — meta flag, group-last, one chapter each, hkCapstoneOk present, clocks at par×2`);

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
  const REWORKED = ['navigation', 'blocksel', 'filldr', 'pastes', 'rowops', 'ruleoff', 'editfix', 'ruleaudit', 'housestyle', 'typeset', 'modeltour', 'combo', 'decimals', 'center', 'autofit', 'margin', 'anchor', 'gauntlet', 'foot', 'percent', 'bridge', 'sumif', 'fxconvert', 'cagr', 'lookup', 'scrub', 'sort', 'recon', 'lookup2', 'unhide', 'rollup', 'filterpass', 'series', 'drill', 'stalelink', 'signerr', 'versionup', 'wrapfix', 'cases', 'audit', 'triage', 'balcheck', 'tieout', 'balance', 'wacc', 'fcfbuild', 'dcf', 'comps', 'txncomps', 'football', 'dcfsens', 'retbridge', 'accdil', 'sourcesuses', 'schedule', 'intsched', 'lbo', 'revolver', 'waterfall', 'covtable', 'liqbridge', 'wk13', 'cascade', 'debtsched', 'isbuild', 'bsbuild', 'cfslink', 'nwcsched', 'threestmt', 'opmodel', 'dcfbuild', 'lbobuild', 'debtblock', 'dashcover'];   // r422 H6b-1 wave 1 · r440: the last three of Formulas II · r444: Models I opens
  const idx = fs.readFileSync('index.html', 'utf8');
  const start = idx.indexOf('const CHALLENGES = {');
  const end = idx.indexOf('STATE + ENGINE', start);
  // count top-level elements of the FIRST array literal returned by fn `name(){ return [ ... ]; }`
  const arrLen = (chunk, name) => {
    const m = new RegExp(name + '\\s*\\(\\)\\s*\\{(?:(?!return)[\\s\\S])*?return\\s*\\[').exec(chunk);   /* r447: preamble may index (q0=o.qc[0]) — anchor on the first `return [` instead of forbidding `[` (covtable) */
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

/* ---- C10 (r425, DEPTH_PASS §2.3 + §2.8): disclosed-error-count contract. Every drills.js
   meta entry declaring `errorCount: N` puts the N-segment meter on the drill rail — the meter
   fills by parsing an aggregate "(k/N)" counter label out of the live checklist (index.html
   hkErrMeterHtml). A drill that declares N but ships no such label renders a permanently
   empty meter; a label whose N disagrees with meta lies to the player about the count
   (N is FIXED per drill — Wolf, 2026-07-24). Static proxy: the drill's checks() source must
   contain the '/N' counter fragment. ---- */
try {
  const sb10 = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sb10);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sb10);
  const meta10 = (sb10.window.HOTKEY_DRILLS || {}).meta || {};
  const idx10 = fs.readFileSync('index.html', 'utf8');
  const s10 = idx10.indexOf('const CHALLENGES = {');
  const e10 = idx10.indexOf('STATE + ENGINE', s10);
  const body10 = idx10.slice(s10, e10);
  const parts10 = body10.split(/\n  ([a-z][a-z0-9_]*):\s*\{/);
  const chunks10 = {};
  for (let i = 1; i < parts10.length; i += 2) chunks10[parts10[i]] = parts10[i + 1] || '';
  let n10 = 0;
  for (const k of Object.keys(meta10)) {
    if (meta10[k].errorCount == null) continue;
    n10++;
    const N = meta10[k].errorCount;
    if (!Number.isInteger(N) || N < 2) bad(`C10: meta.${k}.errorCount=${N} — must be a fixed integer ≥2 (§2.3)`);
    const chunk = chunks10[k];
    if (!chunk) { bad(`C10: meta.${k} declares errorCount but '${k}' is not in CHALLENGES`); continue; }
    const ci = chunk.indexOf('checks(');
    if (ci < 0 || chunk.slice(ci).indexOf('/' + N) < 0)
      bad(`C10: ${k} declares errorCount=${N} but checks() carries no "(k/${N})" counter label — the rail meter would never fill`);
  }
  if (fail === 0 || n10) ok(`drills.js: ${n10} errorCount drill(s) — counter labels match their declared N (§2.3)`);
} catch (e) {
  bad('C10 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C11: checklist copy is INSTRUCTIONS, never lessons (r430) ----
   Wolf has rejected this three rounds running, most recently: "Holy fuck dude you still are
   doing the terrible pithy little quotes on the checklist items. ITS JUST THE INSTRUCTIONS OF
   WHAT YOU HAVE TO DO OR ACCOMPLISH!!! NOT A LESSON!!!" — and, on the same point, "it should
   be in the excluded list!". So it is now in the excluded list.

   The rule is about the clause AFTER the em-dash: it may say WHAT or WHERE, never WHY.
     keep — "Format the margin row — one decimal"        (scope)
     keep — "Fill the row — filled across all five years" (scope)
     cut  — "Bold the header row — headers carry the page" (a moral)
   Free-text detection of "is this a maxim" is not reliable enough to gate a build on, so this
   is a literal denylist of the phrasings that have actually shipped and been rejected. When a
   new one gets caught in playtest, add it here — that is what keeps it from coming back. */
try {
  // Scan PLAYER COPY only. Developer comments legitimately quote the rejected phrasing when
  // recording why it was cut (and this very check's rationale would trip itself otherwise), so
  // block comments and full-line // comments come out first. Full-line only: a bare /\/\// would
  // also eat https:// inside real copy.
  // Scan PLAYER COPY only. Developer comments legitimately quote the rejected phrasing when
  // recording why it was cut (and this check's own rationale would trip itself otherwise).
  // Stateful line walk rather than a whole-file regex: block comments here run for dozens of
  // lines, and a lone /\/\*[\s\S]*?\*\// pass mis-spans them — it left continuation lines
  // behind while swallowing real code, so genuine copy was hidden and comments still flagged.
  const raw = fs.readFileSync('index.html', 'utf8');
  const kept = [];
  let inBlock = false;
  for (const line of raw.split('\n')) {
    let s = line;
    if (inBlock) {
      const e = s.indexOf('*/');
      if (e < 0) continue;                 // still inside the comment
      s = s.slice(e + 2); inBlock = false;
    }
    if (s.trim().startsWith('//')) continue;   // full-line only, so https:// in copy survives
    const b = s.indexOf('/*');
    if (b >= 0) {
      const e = s.indexOf('*/', b + 2);
      if (e < 0) { inBlock = true; s = s.slice(0, b); } else { s = s.slice(0, b) + s.slice(e + 2); }
    }
    kept.push(s);
  }
  const html = kept.join('\n');
  const APHORISMS = [
    'headers carry the page', 'it never earned the weight', 'annotations whisper',
    'retired, not erased', 'a total earns the line above it', 'a computed line reads apart',
    'the page carries a masthead', 'blue font marks typed data', 'hardcodes wear blue',
    'the page signs its date', 'undo has a twin', 'housekeeping first',
    'extraneous by design', 'totals rule on top', 'the schedule closes the gap',
    'the memo names it', 'it ships tonight', 'a pointed cell can never drift again',
    'nothing ships showing ####', 'no text running over the page', 'the model starts live',
    'Constants lights even the buried one', 'it double-counts the moment anyone totals',
    'a clean model greets the reader', 'a clean line through the corridor',
    'the page ties', 'one selection, one chord', 'one helper copy, one selection, one operation',
    'the feed arrived left-aligned', 'wearing the row above', 'the total contract',
  ];
  let n11 = 0;
  for (const a of APHORISMS) {
    if (html.toLowerCase().includes(a.toLowerCase())) {
      n11++; bad(`C11 checklist copy: aphorism is back in index.html — "${a}". Checklist items are instructions, not lessons.`);
    }
  }
  if (!n11) ok(`index.html: checklist copy carries none of the ${APHORISMS.length} rejected aphorisms (instructions, not lessons)`);
} catch (e) {
  bad('C11 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C12 (r432, DEPTH_PASS §0 DoD #4): every reworked drill carries ≥2 ALT-PATH entries ----
   The definition of done requires each depth-passed drill to ship at least two entries in
   dev/e2e-alt-paths.js — one with a different op ORDER, one with a different chord ROUTE —
   because that is what proves §1.0(c) Freedom: the beats grade the END STATE, not the route
   the demo happens to take. Nothing enforced it. e2e-alt-paths runs whatever entries exist and
   passes happily with zero for a given drill, so a build that simply never added them looked
   green. That is the quietest possible failure: the drill ships, the gate is clean, and the
   route-freedom claim is untested — which is exactly how the currency-vs-acct dead beat (§1.0-R3(p))
   survived into a playtest.
   With the full-catalog depth pass now running one agent per drill, this is the DoD item most
   likely to be skipped under time pressure, so it is checked rather than trusted.
   NOTE: this counts entries, which is mechanical. It cannot judge whether the two routes are
   genuinely different — that stays a review question. ---- */
try {
  const inv = fs.readFileSync('dev/check-invariants.js', 'utf8');
  const m = /const REWORKED = \[([^\]]*)\]/.exec(inv);
  const reworked = m ? m[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean) : [];
  const alts = fs.readFileSync('dev/e2e-alt-paths.js', 'utf8');
  const counts = {};
  // must match an ALTS ENTRY, not a keystroke object — `{key:'z',ctrl:true}` in a moves
  // script has the same shape. Entries are the only ones followed by a `name:` field.
  let mm; const re = /\{\s*key:\s*'([a-z0-9_]+)'\s*,\s*name\s*:/g;
  while ((mm = re.exec(alts))) counts[mm[1]] = (counts[mm[1]] || 0) + 1;
  let thin = 0;
  for (const k of reworked) {
    const n = counts[k] || 0;
    if (n < 2) { thin++; bad(`C12: reworked drill '${k}' has ${n} alt-path entr${n === 1 ? 'y' : 'ies'} in dev/e2e-alt-paths.js — the depth-pass DoD requires >=2 (different op order AND different chord route)`); }
  }
  // an entry naming a drill that no longer exists is dead weight and hides real coverage gaps
  const sbA = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sbA);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sbA);
  const live = new Set((sbA.window.HOTKEY_DRILLS || {}).menuOrder || []);
  for (const k of Object.keys(counts))
    if (live.size && !live.has(k)) bad(`C12: dev/e2e-alt-paths.js has ${counts[k]} entr${counts[k] === 1 ? 'y' : 'ies'} for '${k}', which is not in menuOrder (retired drill?)`);
  if (reworked.length && !thin) ok(`e2e-alt-paths: all ${reworked.length} reworked drills carry >=2 alternate routes (DoD #4)`);
} catch (e) {
  bad('C12 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C13 (r437): NO HARNESS MAY NAME A RETIRED DRILL ----
   This campaign retired five drills (dress, wirewalk, undo, copyover, growth) and every single
   retirement left a reference behind somewhere that is not the drill. They surfaced one at a
   time, days apart, each as a red suite:
     · dev/migrate-certificates.sql still granted certificates for undo/copyover/dress/wirewalk/growth
     · dev/e2e-lb.js hard-coded the old HK_PLACEMENT list after 'dress' was repointed to 'combo'
     · dev/e2e-mac-input.js still called loadChallenge('dress') to test the Mac display layer
   C12 already catches this inside e2e-alt-paths.js. Nothing caught it anywhere else, and
   e2e-lb IS in gate.yml, so CI sat red across several batches before anyone looked.

   So: sweep every harness and SQL file under dev/ for a quoted drill-shaped token that is a
   KNOWN-RETIRED key. A denylist rather than "any key not in menuOrder" on purpose — the latter
   would fire on ordinary English words in quotes and on keys a test legitimately invents.
   When a drill is retired, add it here; that is the point of the plumbing checklist. ---- */
try {
  const RETIRED = ['dress', 'wirewalk', 'undo', 'copyover', 'growth', 'colops', 'grpfold', 'hunt'];
  // seed-field.sql is HISTORICAL leaderboard data — retired keys are real past runs and the lb
  // suite is green with them present, so rows there are evidence, not drift.
  const SKIP = new Set(['dev/seed-field.sql', 'dev/check-invariants.js']);
  const files = fs.readdirSync('dev')
    .filter(f => /\.(js|sql)$/.test(f)).map(f => 'dev/' + f).filter(f => !SKIP.has(f));
  let n13 = 0;
  // A COMMENT may name a retired drill — the retirements are documented in place, and a
  // trailing `/* r432: dress retired, so this loads housestyle */` is exactly the note you
  // want to keep. So blank comments out rather than skipping whole lines: block comments
  // first (line numbers preserved), then line comments, guarding `://` so URLs survive.
  const decomment = src => src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .split('\n').map(l => l.replace(/(^|[^:])\/\/.*$/, '$1').replace(/(^|[^-])--.*$/, '$1'))
    .join('\n');
  for (const f of files) {
    const src = decomment(fs.readFileSync(f, 'utf8'));
    src.split('\n').forEach((line, i) => {
      for (const k of RETIRED)
        if (new RegExp(`['"\`]${k}['"\`]`).test(line)) {
          n13++;
          bad(`C13: ${f}:${i + 1} references retired drill '${k}' — ${line.trim().slice(0, 90)}`);
        }
    });
  }
  if (!n13) ok(`no dev/ harness or migration names a retired drill (${RETIRED.join(', ')})`);
} catch (e) {
  bad('C13 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C14 (r450): EVERY DRILL-DRIVING HARNESS DECLARES ITS DRILL-START-GATE STANCE ----
   The r450 gate makes every board load LOCKED behind "press any key to start": the first key
   is swallowed and starts the clock. A harness that drives a route without accounting for it
   loses exactly one keystroke and therefore the win — measured on three drills at r450
   (filldr 44→43, navigation 17→16, combo 25→24 logged keys, none winning). That failure is
   silent-ish and generic: a route "stops working" with nothing in the diff to point at.

   So the stance must be EXPLICIT in the file. A harness that boots index.html and loads a
   drill either sets hk_gate_off='1' in its init block (the 53 suites/probes swept in r450) or
   is on the short list below that keys through the real gate on purpose. This is the C13
   pattern applied to a boot flag instead of a drill key: whoever adds the 54th probe by
   copy-paste inherits the flag; whoever writes one from scratch gets told.

   Detection is `loadChallenge(` plus EITHER an `addInitScript` or a `goto(...index.html`: not
   every harness seeds through addInitScript (dev/check-paywall.js, which landed on the working
   branch alongside this round, seeds with a post-goto page.evaluate instead), and a detector
   that only knew the one shape would let the next one through. Deliberately narrow otherwise —
   so drill-page
   builders, SQL, and the leaderboard suite never trip it. ---- */
try {
  /* keys through the real gate on purpose — the two witnesses that the feature works */
  const KEYS_THROUGH = new Set(['dev/check-startgate.js', 'dev/e2e-audit-onboard.js', 'dev/check-pause.js']);
  const files = fs.readdirSync('dev').filter(f => /\.js$/.test(f)).map(f => 'dev/' + f);
  /* Prose must NOT satisfy this. Every file swept in r450 also EXPLAINS the flag, so a plain
     `/hk_gate_off/` would pass a file that only mentions it in a copy-pasted header. Match the
     two real shapes instead — the direct setter, and the array-of-keys forEach form — rather
     than stripping comments first: C13's decommenter is fooled by the supabase route glob in
     e2e-formulas.js, whose star-slash-star string opens a comment that swallows the init
     block — which is exactly how this check first reported a false failure. */
  const SETS_FLAG = src =>
    /setItem\(\s*['"]hk_gate_off['"]/.test(src) ||
    /['"]hk_gate_off['"][^\n]*\]\s*[\s\S]{0,120}?forEach[\s\S]{0,120}?setItem/.test(src);
  let n14 = 0, seen14 = 0;
  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    const boots = /addInitScript/.test(raw) || /goto\([^)]*index\.html/.test(raw) || /goto\(\s*BASE\s*\+\s*['"]\/?index\.html/.test(raw) || /goto\(BASE \+ '\/' \+ url/.test(raw);
    if (!boots || !/loadChallenge\s*\(/.test(raw)) continue;
    seen14++;
    if (KEYS_THROUGH.has(f)) {
      if (!/hkGate|hk_gate_off|start gate|startgate/i.test(raw)) {
        n14++;
        bad(`C14: ${f} is listed as keying through the r450 start gate but never mentions it — ` +
            'either handle the gate explicitly or set hk_gate_off in its init block');
      }
      continue;
    }
    if (!SETS_FLAG(raw)) {
      n14++;
      bad(`C14: ${f} boots index.html and loads a drill but never sets hk_gate_off — the r450 ` +
          'start gate will swallow its first key (one keystroke short, no win). Add ' +
          "localStorage.setItem('hk_gate_off', '1') next to hk_learn_done, or add the file to " +
          'KEYS_THROUGH in this check and handle the gate on purpose.');
    }
  }
  if (!n14) ok(`all ${seen14} drill-driving dev/ harnesses declare a r450 start-gate stance`);
} catch (e) {
  bad('C14 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C16 (r452): NO `name:` / `label:` KEY INSIDE A CHALLENGES BLOCK ----
   drills.js is the display-string SSOT and its header says so: syncDrillMeta (index.html)
   WRITES CHALLENGES[k].name/.label from meta on every load, "so don't keep stale duplicates in
   CHALLENGES". Eighteen of the 74 blocks kept them anyway and had drifted — `ruleaudit` read
   "Audit the rulings" against the shipped "The ruling pass", `balcheck` "Hunt the balance break"
   against "Make it tie — hunt the break", and thirteen more carried the drill's TAB string in
   its NAME slot ("Paste Sp.", "S&U", "2-way"). None of it ever reached a player — the sync
   overwrote all of it — which is exactly why it rotted for two years: a dev reading index.html
   saw one identity, the product shipped another. r452 deleted all 74; this asserts the zero.
   SOURCE regex, not a runtime read: post-sync the properties legitimately exist, so only the
   text of the file can tell a duplicate from the synced value. ---- */
try {
  const idx = fs.readFileSync('index.html', 'utf8');
  const start = idx.indexOf('const CHALLENGES = {');
  const end = idx.indexOf('STATE + ENGINE', start);
  if (start < 0 || end < 0) bad('C16: CHALLENGES block not found in index.html (shape changed?)');
  else {
    const body = idx.slice(start, end);
    const lines = body.split('\n');
    const base = idx.slice(0, start).split('\n').length;   // 1-based line of `const CHALLENGES = {`
    let key = '(head)', n14 = 0;
    let inBlock = false;
    for (let i = 0; i < lines.length; i++) {
      let s = lines[i];
      if (inBlock) { const e = s.indexOf('*/'); if (e < 0) continue; s = s.slice(e + 2); inBlock = false; }
      if (s.trim().startsWith('//')) continue;
      const b = s.indexOf('/*');
      if (b >= 0) { const e = s.indexOf('*/', b + 2); if (e < 0) { inBlock = true; s = s.slice(0, b); } else { s = s.slice(0, b) + s.slice(e + 2); } }
      const km = s.match(/^  ([a-z][a-z0-9_]*)\s*:\s*\{/);
      if (km) key = km[1];
      // a drill-level property only — two-space indent inside the block, i.e. four columns in.
      // check LABELS (`{label:'…'` inside checks()) are indented deeper and are not this class.
      const hit = s.match(/^    (name|label)\s*:/);
      /* r452: the Keyboard Tour (`keyboardtour`, tour:true) is NOT a catalog drill — drills.js meta
         does not carry it, so its display strings legitimately live inline. The only exemption. */
      if (hit && key !== 'keyboardtour') {
        n14++;
        bad(`C16: index.html:${base + i} CHALLENGES.${key} carries an inline \`${hit[1]}:\` — drills.js meta is the SSOT for display strings (drills.js header, lines 8-10); delete it, don't sync it`);
      }
    }
    if (!n14) ok('index.html: no CHALLENGES block carries an inline name:/label: (drills.js meta is the display-string SSOT)');
  }
} catch (e) {
  bad('C16 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C15 (r452): CERTIFICATE TRACK ARRAYS == HK_TRACKS (the r359 drift rule, in CI) ----
   issue_certificate() hard-codes the three track key lists in SQL. drills.js is the truth, so the
   two drift the moment a drill is retired or added — which is exactly what happened: the r424
   retirements reached drills.js and dev/migrate-certificates.sql, but only 'colops' was carried
   into supabase/migrations/, leaving the DEPLOYED function demanding seven drills that no longer
   exist (undo/copyover/dress/growth/grpfold/wirewalk/hunt). The fluency and formulas certificates
   were unissuable in production for weeks and nothing in the gate noticed (contract audit P0-1).
   So: find the NEWEST migration that defines issue_certificate (highest timestamp prefix), parse
   its three arrays, and assert set-equality with the HK_TRACKS keys derived from drills.js. The
   dev/migrate-certificates.sql mirror is held to the same lists — it is a copy, not a channel. ---- */
try {
  const trackArrays = (src, where) => {
    const out = {};
    const re = /when\s+'(fluency|formulas|modeling)'\s*then\s*array\[([^\]]*)\]/g;
    let m;
    while ((m = re.exec(src))) out[m[1]] = m[2].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
    for (const t of ['fluency', 'formulas', 'modeling'])
      if (!out[t]) bad('C15: ' + where + ' — could not parse the ' + t + ' array out of issue_certificate (shape changed?)');
    return out;
  };
  const sbC = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sbC);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sbC);
  const truth = {};
  for (const t of (sbC.window.HK_TRACKS || [])) truth[t.id] = t.keys || [];

  // NEWEST migration that (re)defines the RPC — migrations replay in filename order, so the last
  // one to define it is the one that is live.
  const migDir = 'supabase/migrations';
  const defs = fs.readdirSync(migDir).filter(f => f.endsWith('.sql'))
    .filter(f => /create\s+or\s+replace\s+function\s+public\.issue_certificate/.test(fs.readFileSync(migDir + '/' + f, 'utf8')))
    .sort();
  if (!defs.length) bad('C15: no migration defines public.issue_certificate');
  const live = defs[defs.length - 1];
  const sources = [[migDir + '/' + live, ' (live definition)'], ['dev/migrate-certificates.sql', ' (mirror)']];
  let n14 = 0;
  for (const [path, tag] of sources) {
    if (!fs.existsSync(path)) continue;
    const got = trackArrays(fs.readFileSync(path, 'utf8'), path);
    for (const t of Object.keys(truth)) {
      if (!got[t]) { n14++; continue; }
      const want = new Set(truth[t]), have = new Set(got[t]);
      const extra = [...have].filter(k => !want.has(k));
      const missing = [...want].filter(k => !have.has(k));
      if (got[t].length !== have.size) { n14++; bad('C15: ' + path + tag + ' ' + t + ' array has duplicate keys'); }
      if (extra.length) { n14++; bad('C15: ' + path + tag + ' ' + t + ' requires ' + extra.join(', ') + ' — not in drills.js HK_TRACKS (retired drill? the certificate becomes unissuable)'); }
      if (missing.length) { n14++; bad('C15: ' + path + tag + ' ' + t + ' is missing ' + missing.join(', ') + ' — in HK_TRACKS but not required by the RPC'); }
    }
  }
  if (!n14) ok('certificate tracks: ' + live + ' + dev/migrate-certificates.sql match HK_TRACKS (' +
    Object.keys(truth).map(t => t + ' ' + truth[t].length).join(' · ') + ')');
} catch (e) {
  bad('C15 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C17 (r452): CAMPAIGN CHAPTER NAMES ARE GROUP NAMES ----
   The picker folder reads groups[].name; the campaign rail reads chapters[].name. They were two
   strings for one chapter — groups said `Models I`, the campaign said `Models I · Valuation` —
   so the same chapter had two names on two surfaces. The editorial suffix now lives in a
   separate `sub`, which only the rail appends, and the NAME must match a group exactly. ---- */
try {
  const sb15 = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sb15);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sb15);
  const groups15 = ((sb15.window.HOTKEY_DRILLS || {}).groups || []).map(g => g.name);
  const camp15 = (sb15.window.HOTKEY_CAMPAIGN && sb15.window.HOTKEY_CAMPAIGN.chapters) || [];
  if (!groups15.length || !camp15.length) bad('C17: groups[] or HOTKEY_CAMPAIGN.chapters did not parse (shape changed?)');
  else {
    let n15 = 0;
    for (const c of camp15)
      if (!groups15.includes(c.name)) {
        n15++;
        bad(`C17: HOTKEY_CAMPAIGN chapter ${c.id} name '${c.name}' is not a groups[] name — the picker folder and the campaign rail must show one string (put any suffix in \`sub\`). Groups: ${groups15.join(' | ')}`);
      }
    if (!n15) ok(`drills.js: all ${camp15.length} campaign chapter names match a groups[] name`);
  }
} catch (e) {
  bad('C17 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C20 (r452, audit P1-4): DESK QUEST TEMPLATES NAME LIVE DRILLS ----
   lb.js MG_PROGRAMS pins a week of drills through set_assignment, and the pin loop carries a
   `if(!lab[k]) continue;  // catalog drift guard` that SILENTLY drops a key the catalog no
   longer has. Two retired keys (dress, growth) sat there for the whole depth pass: a captain
   who pinned "Intern week 0" week 2 got a 2-drill week, and the preview line advertised the
   raw retired key. C19 catches retired names under dev/ only — nothing scanned lb.js. So the
   drift guard is now LOUD where it belongs, in CI: every key in every template must be in
   menuOrder. Same pattern as C18's "harness names a retired drill". ---- */
try {
  const sbQ = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sbQ);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sbQ);
  const liveQ = new Set((sbQ.window.HOTKEY_DRILLS || {}).menuOrder || []);
  const lbSrc = fs.readFileSync('lb.js', 'utf8');
  const blk = /const\s+MG_PROGRAMS\s*=\s*\{([\s\S]*?)\n  \};/.exec(lbSrc);
  if (!blk) bad('C20: MG_PROGRAMS block not found in lb.js (shape changed?)');
  else {
    const before = lbSrc.slice(0, blk.index).split('\n').length;
    let n14 = 0, keys14 = 0;
    blk[1].split('\n').forEach((line, i) => {
      const km = /keys:\s*\[([^\]]*)\]/.exec(line);
      if (!km) return;
      km[1].split(',').map(x => x.trim().replace(/^['"`]|['"`]$/g, '')).filter(Boolean).forEach(k => {
        keys14++;
        if (!liveQ.has(k)) { n14++; bad(`C20: lb.js:${before + i} quest template pins '${k}', which is not in menuOrder — the pin loop's drift guard would ship a short week`); }
      });
    });
    if (!n14) ok(`desk quest templates: all ${keys14} pinned keys are live drills (lb.js MG_PROGRAMS)`);
  }
} catch (e) {
  bad('C20 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C21 (r452, audit P0-2): EVERY PLACEMENT BOARD IS REACHABLE ----
   HK_PLACEMENT.KEYS is the standardized 5-board placement series. Its 5th key (opmodel) sits
   in Full Builds — LVL 11 + 32 pace clears — while Ranked opens at LVL 10, so the gate made
   the series impossible to finish and the nav pill sat at "placement 4/5" forever. A placement
   key may therefore be EITHER in an ungated group, OR the trainer's gate must consult the
   shared ride-through predicate (drills.js hkPlacementRide). Source-level assertion on
   purpose: this is about the gate branch existing, not about any one player's state. ---- */
try {
  const sbP = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sbP);
  const drillSrc = fs.readFileSync('drills.js', 'utf8');
  vm.runInContext(drillSrc, sbP);
  const WP = sbP.window;
  const pk = (WP.HK_PLACEMENT || {}).KEYS || [];
  const gatedGroups = new Set(Object.keys((WP.HOTKEY_GATES || {}).groups || {}));
  const groupOf = (WP.HOTKEY_DRILLS || {}).groupOf || {};
  const idx = fs.readFileSync('index.html', 'utf8');
  const gateBranch = /const __gn\s*=\s*drillLocked\(key\);[\s\S]{0,900}?if\s*\(__gn([\s\S]{0,220}?)\)\s*\{/.exec(idx);
  const rideDefined = /window\.hkPlacementRide\s*=\s*function/.test(drillSrc);
  const gateRides = !!(gateBranch && /hkPlacementRide/.test(gateBranch[1]));
  if (!pk.length) bad('C21: HK_PLACEMENT.KEYS is empty (shape changed?)');
  if (!gateBranch) bad("C21: loadChallenge's progression-gate branch not found in index.html (shape changed?)");
  let n15 = 0;
  for (const k of pk) {
    if (!(k in groupOf)) { n15++; bad(`C21: placement key '${k}' is not a real drill`); continue; }
    if (!gatedGroups.has(groupOf[k])) continue;             // free/ungated tier — always reachable
    if (rideDefined && gateRides) continue;                 // gated, but the gate rides through
    n15++;
    bad(`C21: placement key '${k}' is in the GATED group '${groupOf[k]}' and the trainer's gate does not consult hkPlacementRide — the placement series cannot be finished (audit P0-2)`);
  }
  if (!n15 && pk.length) ok(`placement series: ${pk.length} boards, every one reachable (gate rides through via hkPlacementRide)`);
} catch (e) {
  bad('C21 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C22 (r452, audit P1-1): NO PHANTOM CAPSTONE MEDALS ON THE WALL ----
   Five capstone medals test drills that were never built, so they read a permanent 0/1 — and
   they dragged the completionist mythic (x_allach, "every other medal") down with them, making
   it unearnable forever. Ids are frozen, so the fix is `hidden` (derived in drills.js from
   hkCapstoneKeys(), i.e. from HOTKEY_CAMPAIGN.chapters[i].capstone). The invariant: every
   hkCapstoneDone(ctx,'key') literal inside HOTKEY_ACHIEVEMENTS is either a live drill or its
   medal is hidden — and the medal's `cap` field must name the same key its test() does. ---- */
try {
  const sbA2 = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {},
                 localStorage: { getItem: () => null, setItem() {} } };
  vm.createContext(sbA2);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sbA2);
  const WA = sbA2.window;
  const liveA = new Set((WA.HOTKEY_DRILLS || {}).menuOrder || []);
  const AC = WA.HOTKEY_ACHIEVEMENTS || [];
  if (!AC.length) bad('C22: no achievements parsed from drills.js (shape changed?)');
  let n16 = 0, hid = 0;
  for (const a of AC) {
    const src = String(a.test || '');
    const lits = [...src.matchAll(/hkCapstoneDone\s*\([^,]+,\s*['"]([a-z0-9_]+)['"]\)/g)].map(m => m[1]);
    if (!lits.length) continue;
    for (const k of lits) {
      if (a.cap !== k) { n16++; bad(`C22: medal '${a.id}' tests hkCapstoneDone(…,'${k}') but its cap field is '${a.cap}' — the pairing the hidden-derivation reads is broken`); }
      if (liveA.has(k)) continue;
      if (a.hidden) { hid++; continue; }
      n16++;
      bad(`C22: medal '${a.id}' tests capstone '${k}', which is not in menuOrder, and the medal is NOT hidden — a permanently 0/1 medal on the wall that also blocks x_allach (audit P1-1)`);
    }
  }
  const allach = AC.find(a => a.id === 'x_allach');
  if (allach && !/!a\.hidden/.test(String(allach.test))) bad('C22: x_allach must count VISIBLE medals only (its filter dropped the !a.hidden clause) — hidden medals make the mythic unearnable');
  if (!n16) ok(`capstone medals: every hkCapstoneDone key is live or its medal is hidden (${hid} hidden), x_allach counts visible only`);
} catch (e) {
  bad('C22 could not run: ' + String(e.message || e).slice(0, 120));
}

/* ---- C24 (r452, dev/TUTORIAL_CHAPTER_SPEC.md §7): THE KEYBOARD TOUR IS NOT A DRILL ----
   The Tour hangs off the drill engine — a CHALLENGES entry with build/checks/targets and the
   r421 §2.5 tier ladder — but it must never be ONE. It carries no par, so a clock over it would
   read `undefineds`; it is untimed, so a leaderboard row from it would be meaningless; and it is
   not in the marketing count. Nothing structural stops a later edit from adding it to
   drills.js's menuOrder or to HOTKEY_PARS, and MENU_ORDER's fallback (index.html: "Drills in
   engine but not drills.js") would have ADOPTED it automatically if the `tour:true` filter were
   ever dropped — silently putting a four-minute untimed tutorial into the picker, the drill
   count, prev/next, the random pool and the weekly bag. So the exclusions are asserted, one by
   one, and so is the shape the HUD and the staging depend on.

   Second half: the LESSON-DRILL contract (§1.5, §1.6, §2). No lesson drill exists yet — the four
   of §3.1–3.4 are a later wave — so these are ZERO-CASE guards today. They are written now, with
   the platform, precisely so the wave that adds the drills inherits them (WORKFLOW §3.3). ---- */
try {
  const sb15 = { window: {}, document: { createElement: () => ({ style: {} }), head: { appendChild() {} } }, console, navigator: {} };
  vm.createContext(sb15);
  vm.runInContext(fs.readFileSync('drills.js', 'utf8'), sb15);
  const W15 = sb15.window;
  const D15 = W15.HOTKEY_DRILLS || {};
  const idx15 = fs.readFileSync('index.html', 'utf8');
  const KT = 'keyboardtour';

  /* ---- the Tour is nowhere in the catalog plumbing ---- */
  const menu = D15.menuOrder || [];
  if (menu.includes(KT)) bad(`C24: '${KT}' is in drills.js menuOrder — the Tour is not a drill (§2(g))`);
  for (const [name, map] of [['HOTKEY_PARS', W15.HOTKEY_PARS], ['HOTKEY_CLOCKS', W15.HOTKEY_CLOCKS]])
    if (map && KT in map) bad(`C24: '${KT}' is in ${name} — it must be impossible to time the Tour (§7)`);
  if ((W15.HOTKEY_CHALLENGE_POOL || []).includes(KT)) bad(`C24: '${KT}' is in HOTKEY_CHALLENGE_POOL`);
  if (((W15.HK_PLACEMENT || {}).KEYS || []).includes(KT)) bad(`C24: '${KT}' is in HK_PLACEMENT.KEYS`);
  for (const t of Object.keys(W15.HK_TRACKS || {}))
    if ((W15.HK_TRACKS[t].keys || []).includes(KT)) bad(`C24: '${KT}' is in HK_TRACKS.${t}.keys`);
  for (const c of ((W15.HOTKEY_CAMPAIGN || {}).chapters || []))
    if ((c.keys || []).includes(KT)) bad(`C24: '${KT}' is in HOTKEY_CAMPAIGN chapter ${c.id}`);
  for (const g of (D15.groups || []))
    if ((g.keys || []).includes(KT)) bad(`C24: '${KT}' is in drills.js group '${g.name}'`);
  if ((D15.meta || {})[KT]) bad(`C24: drills.js meta.${KT} exists — the Tour has no picker entry (§2(g))`);
  /* the filter that keeps MENU_ORDER's fallback from re-adopting it */
  if (!/filter\(k\s*=>\s*!g\.includes\(k\)\s*&&\s*!CHALLENGES\[k\]\.tour\)/.test(idx15))
    bad('C24: MENU_ORDER\'s fallback no longer filters `tour:true` entries — keyboardtour would ' +
        'silently join the catalog (index.html, the `Drills in engine but not drills.js` block)');

  /* ---- the Tour's own shape, read out of its CHALLENGES chunk ---- */
  const s15 = idx15.indexOf('const CHALLENGES = {');
  const e15 = idx15.indexOf('STATE + ENGINE', s15);
  const body15 = idx15.slice(s15, e15);
  const parts15 = body15.split(/\n  ([a-z][a-z0-9_]*):\s*\{/);
  const chunks15 = {};
  for (let i = 1; i < parts15.length; i += 2) chunks15[parts15[i]] = parts15[i + 1] || '';
  const tc = chunks15[KT];
  if (!tc) bad(`C24: CHALLENGES.${KT} not found — the Keyboard Tour board is gone`);
  else {
    if (!/\btour\s*:\s*true/.test(tc)) bad(`C24: ${KT} must declare tour:true (that flag is what keeps it out of MENU_ORDER)`);
    if (/\bpar\s*:/.test(tc) || /\bparKeys\s*:/.test(tc))
      bad(`C24: ${KT} declares a par — it must be impossible to time the Tour (§7)`);
    if (/saveClose\s*:\s*true/.test(tc))
      bad(`C24: ${KT} declares saveClose — hkSaveCloseWire would append a 25th beat over stage 6's own save`);
    const ci = tc.indexOf('checks(');
    const nChecks = ci >= 0 ? (tc.slice(ci).match(/\{label:/g) || []).length : 0;
    if (nChecks !== 24) bad(`C24: ${KT} has ${nChecks} beats, expected 24 (§3.0.5: 5·4·5·4·5·1)`);
    /* targets are index-paired with checks and exactly ONE is null — stage 6 beat 1 (Ctrl+S has
       no cell on the grid, §3.0.2(2)); the HUD alone carries that beat, by design, not by gap */
    const tm = /targets\(\)\s*\{[\s\S]*?return\s*\[([\s\S]*?)\n      \]; \}/.exec(tc);
    if (!tm) bad(`C24: ${KT} targets() is not a literal array (the C23 static parser reads it as one)`);
    else {
      const nulls = (tm[1].match(/(^|[,\s])null(?=[,\s]|$)/g) || []).length;
      if (nulls !== 1) bad(`C24: ${KT} targets() has ${nulls} null entries, expected exactly 1 (stage 6 beat 1)`);
    }
    /* five staged tiers, one per stage 2-6, every checks index inside 0..23 */
    const tiers = tc.match(/\{ label:'[^']*', checks:\[([0-9,\s]*)\]/g) || [];
    if (tiers.length !== 5) bad(`C24: ${KT} declares ${tiers.length} tiers, expected 5 (stages 2-6, §7)`);
    for (const t of tiers) {
      const ix = /checks:\[([0-9,\s]*)\]/.exec(t)[1].split(',').map(x => parseInt(x, 10)).filter(x => !isNaN(x));
      if (!ix.length) bad(`C24: ${KT} tier ${t.slice(0, 30)} lists no checks`);
      for (const i of ix) if (i < 0 || i >= nChecks)
        bad(`C24: ${KT} tier checks index ${i} is outside its ${nChecks}-beat checks() array`);
    }
    /* six stage cards, each with a title, a body of at most 60 words and a non-empty keycap strip */
    const stagesM = /stages:\s*\[([\s\S]*?)\n    \],/.exec(tc);
    if (!stagesM) bad(`C24: ${KT} declares no stages[] (the six §1.5 lesson cards)`);
    else {
      const titles = stagesM[1].match(/title:'((?:[^'\\]|\\.)*)'/g) || [];
      const bodies = stagesM[1].match(/body:'((?:[^'\\]|\\.)*)'/g) || [];
      const keys = stagesM[1].match(/keys:\[[^\]]+\]/g) || [];
      if (titles.length !== 6 || bodies.length !== 6 || keys.length !== 6)
        bad(`C24: ${KT} stages: ${titles.length} titles / ${bodies.length} bodies / ${keys.length} keycap strips, expected 6 of each`);
      bodies.forEach((b, i) => {
        const words = b.slice(6, -1).split(/\s+/).filter(Boolean).length;
        if (words > 60) bad(`C24: ${KT} stage ${i + 1} card body is ${words} words — the §1.5 lesson card caps at 60`);
      });
    }
  }

  /* ---- the HUD's per-beat strings (HK_TOUR_BEATS, beside the engine) ---- */
  const bm = /const HK_TOUR_BEATS=\[([\s\S]*?)\n\];/.exec(idx15);
  if (!bm) bad('C24: HK_TOUR_BEATS not found — the TUTORIAL HUD has no per-beat copy (§3.0.2)');
  else {
    const huds = (bm[1].match(/hud:'((?:[^'\\]|\\.)*)'/g) || []).map(x => x.slice(5, -1));
    const nudges = (bm[1].match(/nudge:'((?:[^'\\]|\\.)*)'/g) || []).map(x => x.slice(7, -1));
    if (huds.length !== 24) bad(`C24: HK_TOUR_BEATS carries ${huds.length} hud lines, expected 24`);
    if (nudges.length !== 24) bad(`C24: HK_TOUR_BEATS carries ${nudges.length} nudge lines, expected 24 (every beat gets the three-miss line)`);
    huds.forEach((h, i) => {
      if (!h.trim()) bad(`C24: HK_TOUR_BEATS[${i}].hud is empty — the HUD is the ONLY instruction surface on the Tour`);
      const w = h.split(/\s+/).filter(Boolean).length;
      if (w > 14) bad(`C24: HK_TOUR_BEATS[${i}].hud is ${w} words — §3.0.2(5) caps the banner at 14 ("${h.slice(0, 50)}")`);
      if (i && h === huds[i - 1]) bad(`C24: HK_TOUR_BEATS[${i}].hud repeats beat ${i - 1}'s line — one beat, one line`);
    });
  }

  /* ---- the Tour's runtime seams stay wired (each was a live bug during the r452 build) ---- */
  const seams = [
    [/if\(done\|\|demoPlaying\|\|sandboxMode\|\|tourMode\|\|echoOn\|\|microPrefill\) return;/,
     'checkWin no longer bails on tourMode — the Tour would stop a clock it never started, post a PB and pay xp twice (§3.0.4(4))'],
    [/function startClock\(\)\{ if\(running\|\|done\|\|sandboxMode\|\|tourMode\)return;/,
     'startClock no longer refuses tourMode — the untimed Tour would start running a clock (§3.0.4(6))'],
    [/if\(tourMode\) return;\s*\/\* r452 §3\.0\.4\(6\)/,
     'hkGateArm no longer declines the Tour — a start gate would promise a clock nothing runs (check-startgate §8)'],
    [/if\(tourMode\)\{ try\{ hkTourChecklist/,
     'updateChecklist lost its Tour branch — the parked stages\' beats would render (§3.0.2(1))'],
    [/if\(tourMode\)\{ try\{ hkTourKeyWatch\(e\); \}catch\(_\)\{\} \}/,
     'the keydown handler lost hkTourKeyWatch — no keystroke gates and no three-miss nudge (§3.0.2(3))'],
    [/if\(tourMode\) cls\.push\('tourping'\);/,
     'the render lost the Tour\'s .ttarget pulse — the target spotlight stops pulsing (§3.0.2(2))'],
  ];
  for (const [re, why] of seams) if (!re.test(idx15)) bad('C24: ' + why);

  /* ---- the sandbox stays retired (§1.7 / decision T2) ---- */
  for (const dead of ['function startSandbox', 'function sandboxReadyCard', 'function sandboxCallout',
                      'function exitSandbox', 'function startOnboardBoard', 'function sbCell'])
    if (idx15.includes(dead))
      bad(`C24: '${dead}' is back in index.html — the warm-up sandbox was retired into the Keyboard Tour (§1.7, T2)`);
  if (!/let sandboxMode=false;/.test(idx15))
    bad('C24: sandboxMode was deleted — §8 do-not-change #6 keeps the FLAG (checkWin, updateChecklist and loadChallenge all read it)');
  if (fs.existsSync('dev/e2e-onboard-sandbox.js'))
    bad('C24: dev/e2e-onboard-sandbox.js is back — it tests a surface that no longer exists (§1.7)');

  /* ---- the LESSON-DRILL contract (§1.5/§1.6/§2). Zero cases today, by design. ---- */
  const lessonKeys = Object.keys(chunks15).filter(k => /\blesson\s*:\s*\{/.test(chunks15[k]));
  const metaLesson = Object.keys(D15.meta || {}).filter(k => (D15.meta[k] || {}).lesson);
  for (const k of lessonKeys) if (!metaLesson.includes(k))
    bad(`C24: CHALLENGES.${k} carries a lesson but drills.js meta.${k}.lesson is not true (§2(a): the two must never drift)`);
  for (const k of metaLesson) if (!lessonKeys.includes(k))
    bad(`C24: drills.js meta.${k}.lesson is true but CHALLENGES.${k} declares no lesson object (§2(a))`);
  for (const k of lessonKeys) {
    const ch = chunks15[k];
    const lm = /lesson:\s*\{([\s\S]*?)\}/.exec(ch);
    const title = lm && /title:'((?:[^'\\]|\\.)*)'/.exec(lm[1]);
    const bodyL = lm && /body:'((?:[^'\\]|\\.)*)'/.exec(lm[1]);
    const keysL = lm && /keys:\[([^\]]*)\]/.exec(lm[1]);
    if (!title || !bodyL || !keysL || !keysL[1].trim())
      bad(`C24: ${k}.lesson needs title, body and a non-empty keys strip (§1.5)`);
    else {
      const w = bodyL[1].split(/\s+/).filter(Boolean).length;
      if (w > 60) bad(`C24: ${k}.lesson.body is ${w} words — the lesson card caps at 60 (§1.5)`);
    }
    if (!/reveal\s*:\s*true/.test(ch))
      bad(`C24: lesson drill ${k} must render its ☆ visibly (reveal:true) — the efficiency IS the lesson (§1.6)`);
    if (!menu.includes(k)) bad(`C24: lesson drill ${k} is not in menuOrder — lesson drills ARE drills (§2(h))`);
    if ((W15.HOTKEY_CHALLENGE_POOL || []).includes(k)) bad(`C24: lesson drill ${k} is in HOTKEY_CHALLENGE_POOL — a ≤30 s board is not a Daily Challenge (§4 A5)`);
    if (((W15.HK_PLACEMENT || {}).KEYS || []).includes(k)) bad(`C24: lesson drill ${k} is in HK_PLACEMENT.KEYS (§7)`);
    const par = (W15.HOTKEY_PARS || {})[k];
    if (!(par > 0 && par <= 30)) bad(`C24: lesson drill ${k} par is ${par} — lesson pars are ≤ 30 s (§7)`);
    const cl = (W15.HOTKEY_CLOCKS || {})[k];
    if (!cl || Math.abs(cl.pass - par * 2) > 0.01)
      bad(`C24: lesson drill ${k} clocks: pass must be par×2.0 (§2(b)), got ${cl && cl.pass} against par ${par}`);
  }
  /* reveal:true is legal ONLY on a lesson drill — navigation's game ☆ stays hidden (§1.6) */
  for (const k of Object.keys(chunks15))
    if (/reveal\s*:\s*true/.test(chunks15[k]) && !lessonKeys.includes(k))
      bad(`C24: ${k} declares reveal:true but is not a lesson drill — the ☆ is a hidden discovery everywhere else (§1.6)`);
  if (!/function hkLessonKey\(k\)\{/.test(idx15))
    bad('C24: hkLessonKey() is gone — §2(a) names it as the single lesson-drill helper');

  if (!fail) ok(`Keyboard Tour: outside the catalog, 24 beats / 24 targets / 5 tiers / 6 stage cards, ` +
                `HUD copy + runtime seams intact, sandbox retired; ${lessonKeys.length} lesson drill(s) contract-clean`);
} catch (e) {
  bad('C24 could not run: ' + String(e.message || e).slice(0, 160));
}

/* ---- C25 (r452): the Mac chord truth table is SSOT ----
   themes.js's HK_MAC_CHORDS is the only place Mac Excel's real bindings live. Before r452
   reference.html carried its OWN blind glyph swap (macCap: ctrl→⌘, alt→⌥, shift→⇧) and the
   two surfaces drifted for six rounds — the public table published ⌘Space (macOS Spotlight)
   and ⌥= (not a Mac chord) as Excel for Mac. reference.html must DERIVE (hkMacSpec/hkMacNote)
   and must never re-implement the swap locally. */
try {
  const themes = fs.readFileSync('themes.js', 'utf8');
  const ref = fs.readFileSync('reference.html', 'utf8');
  const TABLE = /window\.HK_MAC_CHORDS\s*=\s*\{/;
  const rows = (themes.match(/'(?:CTRL|ALT|F\d|SHIFT)[^']*'\s*:\s*\{/g) || []).length;
  if (!TABLE.test(themes)) bad('C25: themes.js no longer defines window.HK_MAC_CHORDS (the Mac truth table)');
  else if (rows < 12) bad(`C25: HK_MAC_CHORDS has only ${rows} rows — the Mac exception table looks gutted`);
  else ok(`themes.js owns the Mac chord truth table (${rows} audited rows)`);
  for (const fn of ['hkMacSpec', 'hkMacNote', 'hkMacChord', 'hkMacLookup'])
    if (!new RegExp('window\\.' + fn + '\\s*=').test(themes)) bad(`C25: themes.js no longer exports ${fn}()`);
  if (!/window\.hkMacSpec/.test(ref) || !/window\.hkMacNote/.test(ref))
    bad('C25: reference.html no longer derives its Mac column from themes.js (hkMacSpec/hkMacNote)');
  else ok('reference.html derives its Mac column from themes.js');
  // the local re-implementation must stay gone: no ctrl→⌘ swap outside themes.js
  const localSwap = /replace\(\s*\/(?:\\b)?ctrl/i;
  if (localSwap.test(ref) || /function\s+macCap\s*\(/.test(ref))
    bad('C25: reference.html has its own ctrl→⌘ swap again — that is the drift this guard exists for');
  else ok('reference.html carries no local glyph swap');
} catch (e) {
  bad('C25 could not run: ' + String(e.message || e).slice(0, 120));
}

if (fail) { console.error(`\nSTATIC INVARIANTS: ${fail} problem(s)`); process.exit(1); }
console.log('STATIC INVARIANTS: clean');
