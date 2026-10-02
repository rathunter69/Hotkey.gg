// app2/app/key-states.js — the learner's state on every key of the keys sheet (M57; screenplay
// 3.15). Four states, in order of progress:
//   not-yet     no lesson has shown it, and it has never been pressed
//   taught      the lesson the sheet names for it is complete (a lesson showed it)
//   practiced   it was pressed in a lesson, a drill, the Daily or a rapid-fire round (any of its
//               routes: the key, its Ribbon route or its legacy chord)
//   under-par   its Drill it rep (the single-key micro drill) landed clean inside the rep's par
// Practiced and under par are stored per key id in this device's records (hk2_keys_v1); taught
// derives from the lessons. The Reference page shows the state word on each row and the count at
// its foot, and the Keyring badges read the same states (content/achievements.js).
import { KEYS } from '../content/keys.js';

export const KEY_STATES = ['not-yet', 'taught', 'practiced', 'under-par'];
export const KEY_STATES_KEY = 'hk2_keys_v1';

const MOD_ORDER = { CTRL: 0, ALT: 1, SHIFT: 2 };
const KEY_ALIAS = { ENTER: '↵', RETURN: '↵', ESCAPE: 'ESC', UP: '↑', DOWN: '↓', LEFT: '←', RIGHT: '→', PGUP: 'PAGEUP', PGDN: 'PAGEDOWN', CMD: 'CTRL', CONTROL: 'CTRL', OPTION: 'ALT' };
/** A shifted symbol is its key with Shift held: Ctrl+Shift+$ is Ctrl+Shift+4 on a US board. */
const UNSHIFT = { '!': '1', '@': '2', '#': '3', $: '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '+': '=', _: '-', '~': '`', '{': '[', '}': ']', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/', '|': '\\' };
/** One held chord in a canonical form: 'Shift+Alt+→' and 'Alt+Shift+→' are the same key, and so are Ctrl+Shift+$ and Ctrl+Shift+4. */
function normHold(seg) {
  const s = String(seg).trim();
  const parts = s.split('+').filter(p => p !== '');
  if (s.length > 1 && s.endsWith('+')) parts.push('+');
  const up = parts.map(p => { const u = p.toUpperCase(); return KEY_ALIAS[u] || u; });
  const mods = up.filter(p => p in MOD_ORDER).sort((a, b) => MOD_ORDER[a] - MOD_ORDER[b]);
  const shift = mods.includes('SHIFT');
  const rest = up.filter(p => !(p in MOD_ORDER)).map(p => (shift && UNSHIFT[p] ? UNSHIFT[p] : p));
  return [...mods, ...rest].join('+');
}
/** A route in canonical form, its segments joined by a space ('Alt H B O', 'CTRL+ALT+V V ↵'). */
export const normRoute = route => String(route || '').trim().split(/\s+/).filter(Boolean).map(normHold).join(' ');

/**
 * The pressed forms a row stands for: each of its routes (key, Ribbon, legacy) with the slash
 * alternatives spread ('Ctrl+↑/↓/←/→' is four chords), and for a sequence that opens on a held
 * chord (Ctrl+Alt+V V Enter) that opening chord too, since the run logs it as one shortcut. Pure.
 */
export function pressedForms(row) {
  const out = new Set();
  for (const route of [row.win, row.ribbon, row.legacy]) {
    if (!route) continue;
    const segs = String(route).trim().split(/\s+/);
    const spread = segs.map(seg => { const m = /^(.*\+)?([^+]+(?:\/[^+]+)+)$/.exec(seg); return m ? m[2].split('/').map(k => (m[1] || '') + k) : [seg]; });
    // every combination of the spread alternatives (arrows only, so at most four)
    let combos = [[]];
    for (const opts of spread) combos = combos.flatMap(c => opts.map(o => [...c, o]));
    for (const c of combos) {
      out.add(normRoute(c.join(' ')));
      if (c.length > 1 && /\+/.test(c[0]) && !/^Alt$/i.test(c[0])) out.add(normRoute(c[0]));
    }
  }
  return out;
}

const FORMS = new Map();
const formsOf = row => { if (!FORMS.has(row)) FORMS.set(row, pressedForms(row)); return FORMS.get(row); };
/**
 * The key ids a run's shortcuts touched (runner.js shortcutsUsed: [{ keys, count }] or strings).
 * A route matches a key when it is one of the key's forms or walks on past it (Alt H F D S K Enter
 * pressed Go To Special, Alt H F D S; an Alt walk passes Alt H, the Home tab, on its way). Pure.
 */
export function keyIdsPressed(used, keys = KEYS) {
  const pressed = [...new Set((Array.isArray(used) ? used : []).map(u => normRoute(typeof u === 'string' ? u : u && u.keys)).filter(Boolean))];
  if (!pressed.length) return [];
  const hit = f => pressed.some(p => p === f || p.startsWith(f + ' '));
  return keys.filter(k => [...formsOf(k)].some(hit)).map(k => k.id);
}
/** The key ids whose Drill it rep is the micro drill for `concept`. Pure. */
export const keyIdsForConcept = (concept, keys = KEYS) => (concept ? keys.filter(k => k.concept === concept).map(k => k.id) : []);

/**
 * A key's state. Pure.
 *   ctx.done       completed lesson ids
 *   ctx.records    { [keyId]: { p?: at, u?: at } } (practiced, under par), from this module's store
 *   ctx.practiced / ctx.underPar   concept ids from the refresher schedule (reps, and reps landed fast)
 */
export function stateOf(row, ctx = {}) {
  if (!row) return 'not-yet';
  const rec = (ctx.records && ctx.records[row.id]) || {};
  const c = row.concept;
  if (rec.u || (c && ctx.underPar && ctx.underPar.has(c))) return 'under-par';
  if (rec.p || (c && ctx.practiced && ctx.practiced.has(c))) return 'practiced';
  const lesson = row.lesson || row.lessonId;
  if (lesson && ctx.done && ctx.done.has(lesson)) return 'taught';
  return 'not-yet';
}
/** Rows past Not yet: the "collected" count the page's foot and the Keyring badges read. Pure. */
export const collected = (rows, ctx) => rows.filter(r => stateOf(r, ctx) !== 'not-yet').length;

/* ---------------- the store (this device; the account copy rides rpc_note_keys, 0012) ---------------- */
function load() {
  try { const raw = JSON.parse(localStorage.getItem(KEY_STATES_KEY) || '{}'); return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}; } catch (e) { return {}; }
}
function save(recs) { try { localStorage.setItem(KEY_STATES_KEY, JSON.stringify(recs)); } catch (e) { /* storage blocked: the states stay for this visit */ } }
const listeners = new Set();

export const keyStates = {
  /** { [keyId]: { p?, u? } } */
  records() { return load(); },
  /** Mark the keys a run pressed as practiced. Returns the ids newly practiced. */
  notePressed(used, at = Date.now()) {
    const ids = keyIdsPressed(used);
    if (!ids.length) return [];
    const recs = load(); const fresh = [];
    for (const id of ids) { const r = recs[id] || (recs[id] = {}); if (!r.p) { r.p = at; fresh.push(id); } }
    if (fresh.length) { save(recs); for (const f of listeners) try { f({ practiced: fresh, underPar: [] }); } catch (e) { /* a listener's fault */ } }
    return fresh;
  },
  /** Mark keys under par (a clean Drill it rep inside its par); a key under par is practiced too. */
  noteUnderPar(ids, at = Date.now()) {
    const recs = load(); const fresh = [];
    for (const id of ids || []) { if (!KEYS.some(k => k.id === id)) continue; const r = recs[id] || (recs[id] = {}); if (!r.p) r.p = at; if (!r.u) { r.u = at; fresh.push(id); } }
    if (fresh.length) { save(recs); for (const f of listeners) try { f({ practiced: [], underPar: fresh }); } catch (e) { /* a listener's fault */ } }
    return fresh;
  },
  /** Fold in the account's copy (hydration after sign-in): the earlier stamp wins for each state. */
  merge(remote) {
    if (!remote || typeof remote !== 'object') return;
    const recs = load();
    for (const id in remote) {
      if (!KEYS.some(k => k.id === id)) continue;
      const a = recs[id] || {}, b = remote[id] || {};
      const pick = (x, y) => (x && y ? Math.min(x, y) : x || y || undefined);
      const p = pick(a.p, b.p), u = pick(a.u, b.u);
      recs[id] = {}; if (p) recs[id].p = p; if (u) recs[id].u = u;
    }
    save(recs);
  },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  clear() { try { localStorage.removeItem(KEY_STATES_KEY); } catch (e) { /* ignore */ } },
};
