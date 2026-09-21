// app2/app/prefs.js — the learner's device preferences in localStorage (key `hk2_prefs`).
// Every read and write is wrapped in try/catch and the stored shape is normalised on load, so a
// private window, a blocked storage API or a corrupt value never breaks a page.
//
//   prefs.get()                → { platform, experience, firstRunDone, skipped, ribbon, mute }
//   prefs.set({ mute: true })  → the merged, normalised record (false-y `ok` when storage refused)
//   prefs.stored()             → true once anything has been saved (the router's "returning" test)
//   prefs.clear()
//
// `platform` ('win' | 'mac') drives instructions and keycaps. It is mirrored on
// <html data-platform> and announced with a `hk:prefs` window event so views can follow it.

export const PREFS_KEY = 'hk2_prefs';
export const PLATFORMS = ['win', 'mac'];
export const EXPERIENCES = ['new', 'sometimes', 'daily'];
export const RIBBON_MODES = ['full', 'slim'];

const isPlainObject = v => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * The platform the browser reports: 'mac' for macOS and iOS, 'win' for everything else.
 * Pure; pass a navigator-like object ({ userAgentData, platform, userAgent }) to test it.
 */
export function detectPlatform(nav) {
  try {
    const n = nav || (typeof navigator !== 'undefined' ? navigator : null);
    if (!n) return 'win';
    const uad = n.userAgentData && n.userAgentData.platform;
    const s = String(uad || n.platform || n.userAgent || '');
    return /mac|iphone|ipad|ipod/i.test(s) ? 'mac' : 'win';
  } catch (e) { return 'win'; }
}

/** Defaults for a device that has never saved anything. */
export function defaultPrefs(detected) {
  return { platform: PLATFORMS.includes(detected) ? detected : 'win', experience: null, firstRunDone: false, skipped: [], ribbon: null, mute: false };
}

/**
 * Coerce whatever was stored into a valid record. Unknown keys are dropped, wrong types fall back
 * to the default, `skipped` keeps only unique non-empty strings (capped so a runaway value cannot
 * bloat storage). Pure.
 */
export function normalisePrefs(raw, detected) {
  const d = defaultPrefs(detected);
  if (!isPlainObject(raw)) return d;
  const out = { ...d };
  if (PLATFORMS.includes(raw.platform)) out.platform = raw.platform;
  if (EXPERIENCES.includes(raw.experience)) out.experience = raw.experience;
  out.firstRunDone = raw.firstRunDone === true;
  if (Array.isArray(raw.skipped)) {
    const seen = new Set();
    for (const id of raw.skipped) { if (typeof id === 'string' && id && !seen.has(id) && seen.size < 500) seen.add(id); }
    out.skipped = [...seen];
  }
  if (RIBBON_MODES.includes(raw.ribbon)) out.ribbon = raw.ribbon;
  out.mute = raw.mute === true;
  return out;
}

function readRaw() {
  try { const raw = localStorage.getItem(PREFS_KEY); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
function writeRaw(rec) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(rec)); return true; }
  catch (e) { return false; }
}
function reflect(rec) {
  try {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-platform', rec.platform);
    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('hk:prefs', { detail: rec }));
  } catch (e) { /* no DOM */ }
}

export const prefs = {
  /** The current record (never null; defaults when nothing is stored). */
  get() { return normalisePrefs(readRaw(), detectPlatform()); },
  /** Merge a patch, normalise, persist. Returns the record with `ok:false` added when storage refused. */
  set(patch) {
    const merged = normalisePrefs({ ...this.get(), ...(isPlainObject(patch) ? patch : {}) }, detectPlatform());
    const ok = writeRaw(merged);
    reflect(merged);
    return ok ? merged : { ...merged, ok: false };
  },
  /** Add lesson ids to `skipped` (placement marks them; skipped is not completed). */
  skip(ids) { const cur = this.get().skipped; return this.set({ skipped: cur.concat(Array.isArray(ids) ? ids : [ids]) }); },
  /** Remove a lesson id from `skipped` (opening a skipped lesson clears the mark). */
  unskip(id) { const cur = this.get().skipped; if (!cur.includes(id)) return this.get(); return this.set({ skipped: cur.filter(x => x !== id) }); },
  /** True once anything has been saved on this device. */
  stored() { try { return localStorage.getItem(PREFS_KEY) != null; } catch (e) { return false; } },
  /** The platform the instructions and keycaps follow. */
  platform() { return this.get().platform; },
  clear() { try { localStorage.removeItem(PREFS_KEY); } catch (e) { /* ignore */ } reflect(defaultPrefs(detectPlatform())); },
  /** Mirror the stored platform onto <html> without writing anything (called at boot). */
  reflect() { reflect(this.get()); },
};

/** Keycap text for the platform: 'Ctrl' → '⌘' on a Mac, 'Alt' → '⌥'. */
export function keyLabel(label, platform) {
  const p = platform || prefs.platform();
  if (p !== 'mac') return label;
  return String(label).replace(/\bCtrl\b/g, '⌘').replace(/\bAlt\b/g, '⌥');
}
