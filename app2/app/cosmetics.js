// app2/app/cosmetics.js — what a learner has unlocked and has switched on (screenplay 6.10; M60).
// Themes open by level (the flair catalog, content/flair.js), Amber by finishing Chapter 1, and any
// theme the weekly clear rolled; the other flair (keycap skins, ghost colors, the trail, panel
// headers, board marks, the profile frame) opens by level or by a roll and is equipped here.
// Everything is pure lookup over a ctx of { level, earned (Set of achievement ids), rolled (array
// of flair ids) }; the equip state is localStorage hk2_flair_v1, reflected as data attributes on
// <html> so a stylesheet picks the look from tokens. Nothing cosmetic is ever sold.
import { THEME_ORDER, applyTheme, saveTheme } from '../ui/themes.js';
import { FLAIR, FLAIR_BY_ID, SLOTS, ROLLABLE } from '../content/flair.js';
import { siteCopy } from '../content/copy/apply.js';

/** The themes everyone has from the first visit. */
export const FREE_THEMES = ['workbook', 'contrast', 'default'];

/** Amber is Chapter 1's, for finishing it, whatever the level; Synthwave is rapid-fire's, for the first Combo 10. */
export const SPECIAL_THEMES = {
  bloomberg: { ach: 'ch1-complete', label: 'Complete Chapter 1' },
  synthwave: { ach: 'combo-10', label: 'A ten-hit rapid-fire combo' },   // the meter's first Combo 10 (M100)
};

/** Level-locked themes, from the catalog: theme key → level. */
const THEME_LEVEL = Object.fromEntries(FLAIR.filter(f => f.slot === 'theme' && f.value).map(f => [f.value, f.level]));
export const LEVEL_THEMES = THEME_ORDER.filter(k => THEME_LEVEL[k] != null);
export const levelFor = key => (THEME_LEVEL[key] != null ? THEME_LEVEL[key] : null);

const asSet = v => (v instanceof Set ? v : new Set(v || []));

/** The flair ids this ctx owns: every item at or under the level, and whatever the weekly clears rolled. */
export function ownedFlair(ctx = {}) {
  const lvl = ctx.level || 1, rolled = asSet(ctx.rolled);
  return new Set(FLAIR.filter(f => f.level <= lvl || rolled.has(f.id)).map(f => f.id));
}

/**
 * Why a theme is locked for this ctx, or null when it is usable.
 * ctx = { level (default 1), earned (Set/array of achievement ids), rolled (flair ids) }
 */
export function themeLock(key, ctx = {}) {
  if (FREE_THEMES.includes(key)) return null;
  const sp = SPECIAL_THEMES[key];
  if (sp) return asSet(ctx.earned).has(sp.ach) ? null : sp.label;
  const need = levelFor(key);
  if (need == null) return null;   // a theme added later defaults open
  const owned = ownedFlair(ctx);
  if (FLAIR.some(f => f.slot === 'theme' && f.value === key && owned.has(f.id))) return null;
  return siteCopy('flair_unlocks_at', 'Unlocks at level {n}').replace('{n}', need);
}

/** Every theme with its lock state, in picker order: [{ key, lock }]. */
export function themeStates(ctx = {}) {
  return THEME_ORDER.map(key => ({ key, lock: themeLock(key, ctx) }));
}

/**
 * The equippable flair by slot, for the profile's Flair panel: { slot: [{ id, value, level, owned }] }.
 * The Top Bucket set brings its frame with it.
 */
export function flairBySlot(ctx = {}) {
  const owned = ownedFlair(ctx);
  const out = Object.fromEntries(SLOTS.map(s => [s, []]));
  for (const f of FLAIR) if (out[f.slot]) out[f.slot].push({ id: f.id, value: f.value, level: f.level, owned: owned.has(f.id) });
  out.frame.push({ id: 'top-bucket', value: 'top', level: 30, owned: owned.has('top-bucket') });
  return out;
}

/**
 * The weekly clear's roll (6.10): one theme, keycap skin or board mark the learner hasn't got,
 * chosen by the week's key so a reload never re-rolls. Null when there is nothing left to roll.
 */
export function rollReward(ctx, key) {
  const owned = ownedFlair(ctx);
  const left = FLAIR.filter(f => ROLLABLE.includes(f.kind) && !owned.has(f.id));
  if (!left.length) return null;
  let h = 7; for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return left[h % left.length].id;
}

/* ---------------- the equip state ---------------- */
export const FLAIR_KEY = 'hk2_flair_v1';
/** The equipped value per slot ('' = the plain look). */
export function equipped() {
  try {
    const v = JSON.parse(localStorage.getItem(FLAIR_KEY) || '{}');
    const out = {};
    for (const s of SLOTS) out[s] = typeof v[s] === 'string' ? v[s] : '';
    return out;
  } catch (e) { return Object.fromEntries(SLOTS.map(s => [s, ''])); }
}
/** Equip a value in a slot (only one the ctx owns), save it and apply it. Returns the new state. */
export function equip(slot, value, ctx) {
  if (!SLOTS.includes(slot)) return equipped();
  const list = flairBySlot(ctx)[slot];
  const ok = value === '' || list.some(f => f.value === value && f.owned);
  const st = equipped();
  if (ok) st[slot] = value;
  try { localStorage.setItem(FLAIR_KEY, JSON.stringify(st)); } catch (e) { /* the look still applies for this visit */ }
  applyFlair(st);
  return st;
}
/** Equip a catalog item by id (the level-up row's Equip). Themes are the theme picker's. */
export function equipItem(id, ctx) {
  const f = FLAIR_BY_ID[id];
  if (!f || !SLOTS.includes(f.slot)) return null;
  return equip(f.slot, f.value, ctx);
}
/** Reflect the equip state on <html>: data-keycap, data-cursor, data-trail, data-panel, data-frame. */
export function applyFlair(st = equipped()) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  for (const s of ['keycap', 'cursor', 'trail', 'panel', 'frame']) {
    if (st[s]) html.setAttribute('data-' + s, st[s]); else html.removeAttribute('data-' + s);
  }
}

/**
 * Equip a level-up reward (the result panel's Equip, E): a theme switches the theme, anything else
 * goes in its slot. Returns true when something changed.
 */
export function equipReward(reward, ctx) {
  if (!reward || !reward.id) return false;
  const f = FLAIR_BY_ID[reward.id];
  if (!f) return false;
  if (f.slot === 'theme') {
    if (!f.value || themeLock(f.value, ctx)) return false;
    try { applyTheme(f.value); saveTheme(f.value); } catch (e) { return false; }
    return true;
  }
  return !!equipItem(f.id, ctx);
}
