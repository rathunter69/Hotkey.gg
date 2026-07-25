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
  const REWORKED = ['navigation', 'blocksel', 'filldr', 'pastes', 'rowops', 'ruleoff', 'dress', 'editfix', 'ruleaudit', 'housestyle', 'typeset', 'modeltour', 'combo', 'decimals', 'center'];   // r422 H6b-1 wave 1
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

if (fail) { console.error(`\nSTATIC INVARIANTS: ${fail} problem(s)`); process.exit(1); }
console.log('STATIC INVARIANTS: clean');
