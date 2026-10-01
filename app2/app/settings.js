// app2/app/settings.js — the one preferences object (screenplay 3.0 "Get these right now", 9;
// "Account"; M101). Every setting in 3.0's table, in one record with a schema version, saved on
// the device (localStorage `hk2_settings_v1`) and synced to the account (migration 0010,
// rpc_set_settings). The Settings page renders from SETTINGS_GROUPS: a group is a panel, a
// setting is a row with its control at the right and its help under it, and every word is a
// site.csv row (settings_group_<group>, setting_<key>, setting_<key>_help, setting_<key>_<option>).
//
//   settings.get()            → the record (defaults when nothing is stored)
//   settings.set(patch)       → the merged record (`ok:false` when storage refused); mirrors the keys prefs.js owns
//   settings.reflect()        → mirror onto <html> without writing
//   normaliseSettings(raw)    → a valid record from anything (pure)
//   fromPrefs(prefs)          → the settings a device's prefs.js record implies (the one-time carry)
//   toSync(record)            → what goes to the account; mergeSynced(local, remote) → the newer wins per key
//
// Excel's own options (Options › Advanced › After pressing Enter, move selection) are not here:
// the engine's session.settings owns them and a lesson's state sets them (engine/keyboard.js).
import { prefs, detectPlatform } from './prefs.js';

export const SETTINGS_KEY = 'hk2_settings_v1';
export const SETTINGS_VERSION = 1;

/**
 * The groups and settings of 3.0's table, in page order. `type`: 'choice' (one of `options`),
 * 'switch' (boolean), 'theme' (a theme key: the tiles), 'text' (a short string), 'link' (a row that
 * opens another page: handle, email and sign-in), 'action' (a row that does something: export,
 * delete). `help` marks a setting with a help line under it (site.csv setting_<key>_help).
 * `account` marks a setting that only exists signed in. `mirror` is the prefs.js key it keeps in step.
 */
export const SETTINGS_GROUPS = [
  { id: 'keyboard', settings: [
    { key: 'keyLabels', type: 'choice', options: ['win', 'mac'], default: null, help: true, mirror: 'platform' },   // null: the platform the browser reports
    { key: 'layout', type: 'choice', options: ['us', 'uk', 'other'], default: 'us' },
    { key: 'ribbonLessons', type: 'choice', options: ['full', 'tabs'], default: 'full', help: true },
    { key: 'ribbonDrills', type: 'choice', options: ['full', 'tabs'], default: 'tabs' },
    { key: 'siteKeyTips', type: 'switch', default: true, help: true },
  ] },
  { id: 'lessons', settings: [
    { key: 'cardSide', type: 'choice', options: ['auto', 'left', 'right'], default: 'auto', help: true },
    { key: 'showKeys', type: 'choice', options: ['first', 'always'], default: 'first', help: true },
    { key: 'nudge', type: 'choice', options: ['8', '15', 'off'], default: '8', help: true },
    { key: 'demo', type: 'switch', default: true, help: true },
  ] },
  { id: 'practice', settings: [
    { key: 'setLength', type: 'choice', options: ['5', '10', '20'], default: '10' },
    { key: 'ghost', type: 'switch', default: true, help: true, mirror: 'ghost' },
    { key: 'pace', type: 'switch', default: true, help: true },
    { key: 'showOnBoards', type: 'switch', default: true },
  ] },
  { id: 'appearance', settings: [
    { key: 'theme', type: 'theme', default: 'workbook' },
    { key: 'density', type: 'choice', options: ['comfortable', 'compact'], default: 'comfortable', mirror: 'density' },
    { key: 'sheetZoom', type: 'choice', options: ['100', '110', '125'], default: '100' },
  ] },
  { id: 'sound', settings: [
    { key: 'sound', type: 'switch', default: true, help: true, mirror: 'mute' },
    { key: 'soundSet', type: 'choice', options: ['default'], default: 'default' },   // the sets the learner owns are R7's (M60); 'default' is the one everyone has
    { key: 'effects', type: 'choice', options: ['full', 'reduced', 'off'], default: 'full', help: true, mirror: 'effects' },
  ] },
  { id: 'email', settings: [
    { key: 'dailyReminder', type: 'switch', default: false, help: true, account: true },
    { key: 'weeklySummary', type: 'switch', default: false, account: true },
    { key: 'news', type: 'switch', default: false, account: true },
  ] },
  { id: 'account', settings: [
    { key: 'handle', type: 'link', account: true },
    { key: 'certificateName', type: 'text', default: '', help: true, account: true, max: 80 },
    { key: 'signIn', type: 'link', account: true },
    { key: 'publicProfile', type: 'switch', default: true, account: true },
    { key: 'exportData', type: 'action', account: true },
    { key: 'deleteAccount', type: 'action', account: true },
  ] },
];

/** Every setting that holds a value, flat, by key. */
export const SETTINGS = Object.fromEntries(SETTINGS_GROUPS.flatMap(g => g.settings.filter(s => s.type !== 'link' && s.type !== 'action').map(s => [s.key, { ...s, group: g.id }])));
/** The site.csv keys the Settings page reads, for the copy check. */
export function settingsCopyKeys() {
  const keys = [];
  for (const g of SETTINGS_GROUPS) {
    keys.push('settings_group_' + g.id);
    for (const s of g.settings) {
      keys.push('setting_' + s.key);
      if (s.help) keys.push('setting_' + s.key + '_help');
      if (s.type === 'choice') for (const o of s.options) keys.push('setting_' + s.key + '_' + o);
    }
  }
  return keys;
}

const isObj = v => typeof v === 'object' && v !== null && !Array.isArray(v);

export function defaultSettings(detected) {
  const out = { v: SETTINGS_VERSION };
  for (const key in SETTINGS) out[key] = SETTINGS[key].default;
  out.keyLabels = detected === 'mac' ? 'mac' : 'win';
  return out;
}

/** A valid record from anything stored: unknown keys drop, wrong values fall back to the default. Pure. */
export function normaliseSettings(raw, detected) {
  const d = defaultSettings(detected);
  if (!isObj(raw)) return d;
  const out = { ...d };
  for (const key in SETTINGS) {
    const s = SETTINGS[key]; const v = raw[key];
    if (v === undefined) continue;
    if (s.type === 'choice') { const str = String(v); if (s.options.includes(str)) out[key] = str; }
    else if (s.type === 'switch') { if (typeof v === 'boolean') out[key] = v; }
    else if (s.type === 'theme') { if (typeof v === 'string' && /^[a-z0-9-]{1,32}$/.test(v)) out[key] = v; }
    else if (s.type === 'text') { if (typeof v === 'string') out[key] = v.trim().slice(0, s.max || 200); }
  }
  // an older record carries no `v`; every version so far reads the same, so it just takes the current number
  out.v = SETTINGS_VERSION;
  return out;
}

/** The settings a prefs.js record implies: the carry from the device record that came before this object. */
export function fromPrefs(p) {
  if (!isObj(p)) return {};
  const out = {};
  if (p.platform === 'win' || p.platform === 'mac') out.keyLabels = p.platform;
  if (p.ribbon === 'slim') out.ribbonLessons = 'tabs'; else if (p.ribbon === 'full') out.ribbonLessons = 'full';
  if (typeof p.mute === 'boolean') out.sound = !p.mute;
  if (p.effects === 'subtle') out.effects = 'reduced'; else if (p.effects === 'off' || p.effects === 'full') out.effects = p.effects;
  if (typeof p.ghost === 'boolean') out.ghost = p.ghost;
  if (p.density === 'compact' || p.density === 'comfortable') out.density = p.density;
  return out;
}

/** The prefs.js patch that keeps the older record in step (the pages that still read prefs see the same answer). */
export function toPrefsPatch(rec) {
  return {
    platform: rec.keyLabels, ribbon: rec.ribbonLessons === 'tabs' ? 'slim' : 'full', mute: rec.sound === false,
    effects: rec.effects === 'reduced' ? 'subtle' : rec.effects, ghost: rec.ghost !== false, density: rec.density,
  };
}

/** What the account stores: the record with its version and a stamp (ms) of the last change. */
export function toSync(rec, at = Date.now()) { return { ...normaliseSettings(rec), at }; }
/** Merge the account's copy over the device's: the newer record wins whole (settings save as they change, so the last write is the truth). */
export function mergeSynced(local, remote) {
  const l = isObj(local) ? local : {}, r = isObj(remote) ? remote : null;
  if (!r) return normaliseSettings(l);
  const lAt = Number.isFinite(l.at) ? l.at : 0, rAt = Number.isFinite(r.at) ? r.at : 0;
  return normaliseSettings(rAt >= lAt ? r : l);
}

function readRaw() { try { const raw = localStorage.getItem(SETTINGS_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
function writeRaw(rec) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(rec)); return true; } catch (e) { return false; } }
function reflect(rec) {
  try {
    if (typeof document !== 'undefined') {
      const h = document.documentElement;
      h.setAttribute('data-platform', rec.keyLabels);
      h.setAttribute('data-density', rec.density);
      h.setAttribute('data-effects', rec.effects);
      h.setAttribute('data-zoom', rec.sheetZoom);
    }
    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('hk:settings', { detail: rec }));
  } catch (e) { /* no DOM */ }
}

export const settings = {
  /** The record. A device with prefs but no settings yet reads its prefs through once (the carry). */
  get() {
    const raw = readRaw();
    if (raw) return normaliseSettings(raw, detectPlatform());
    let carried = {};
    try { carried = prefs.stored() ? fromPrefs(prefs.get()) : {}; } catch (e) { carried = {}; }
    return normaliseSettings(carried, detectPlatform());
  },
  /** Merge a patch, normalise, persist, mirror to prefs.js, reflect. */
  set(patch) {
    const merged = normaliseSettings({ ...this.get(), ...(isObj(patch) ? patch : {}) }, detectPlatform());
    merged.at = Date.now();
    const ok = writeRaw(merged);
    try { prefs.set(toPrefsPatch(merged)); } catch (e) { /* prefs blocked: the settings record still holds */ }
    reflect(merged);
    return ok ? merged : { ...merged, ok: false };
  },
  stored() { try { return localStorage.getItem(SETTINGS_KEY) != null; } catch (e) { return false; } },
  reflect() { reflect(this.get()); },
  clear() { try { localStorage.removeItem(SETTINGS_KEY); } catch (e) { /* ignore */ } },
};
