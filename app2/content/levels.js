// app2/content/levels.js — the level table and the XP constants, in one place (screenplay 6.10;
// 3.0 "Get these right now", 8; M103). The profile, the Level panel on Home, the rail's foot and
// the level-up row all read this table; nothing else carries a level number or an XP figure.
//
//   The curve: level n to n+1 costs XP_PER_LEVEL × n (150n), so the cumulative XP to reach level n
//   is 75 × n × (n − 1): level 5 at 1,500, level 10 at 6,750, level 20 at 28,500, level 30 at 65,250.
//   Recalibrated from real accounts after launch, the way the pars are (M24).
//
//   The titles name a stage of getting fast in Excel, in the course's own words, and change every
//   third level with the theme. The title shows on the profile and in the level-up row, never on a
//   board. The words themselves are rows in site.csv (level_title_*, level_reward_*); this table
//   carries the keys and the shape. The art and the flair catalog are R7's (M60, M103).
import { siteCopy } from './copy/apply.js';
import { FLAIR_AT } from './flair.js';

export const XP_PER_LEVEL = 150;
export const MAX_LEVEL = 30;

/** XP from level n to n+1. */
export function xpToNext(n) { return XP_PER_LEVEL * Math.max(1, n | 0); }
/** Cumulative XP at which level n begins (level 1 at 0). */
export function xpAtLevel(n) { const k = Math.max(1, n | 0); return XP_PER_LEVEL * k * (k - 1) / 2; }

/**
 * Level from total XP: { lvl, into, need, pct, next }. `into`/`need` drive the level bar ("{into}
 * of {need} XP"), `next` is the cumulative XP at which the next level lands. Capped at MAX_LEVEL,
 * where the bar reads full.
 */
export function levelOf(xp) {
  const total = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;
  let lvl = 1;
  while (lvl < MAX_LEVEL && total >= xpAtLevel(lvl + 1)) lvl++;
  const floor = xpAtLevel(lvl);
  const need = xpToNext(lvl);
  const into = lvl >= MAX_LEVEL ? need : total - floor;
  return { lvl, into, need, pct: Math.min(100, Math.round(100 * into / need)), next: floor + need };
}

/**
 * The bands (6.10): the first level of each band brings the band's theme (or the opening set at
 * level 1, Crimson and the Top Bucket frame at 30); the levels between carry the smaller flair.
 * `title` is the site.csv key's suffix; `reward` names what arrives at the band's first level.
 */
export const LEVEL_BANDS = [
  { from: 1, to: 2, title: 'new_workbook', reward: 'themes_start' },
  { from: 3, to: 5, title: 'arrow_keys', reward: 'theme' },
  { from: 6, to: 8, title: 'ctrl_arrow', reward: 'theme' },
  { from: 9, to: 11, title: 'mouse_retired', reward: 'keycap_skin' },
  { from: 12, to: 14, title: 'alt_native', reward: 'panel_style' },
  { from: 15, to: 17, title: 'chord_player', reward: 'board_flair' },
  { from: 18, to: 20, title: 'live_links', reward: 'cursor_color' },
  { from: 21, to: 23, title: 'ties_out', reward: 'panel_style' },
  { from: 24, to: 26, title: 'model_owner', reward: 'keycap_skin' },
  { from: 27, to: 29, title: 'hard_clock', reward: 'board_flair' },
  { from: 30, to: 30, title: 'top_bucket', reward: 'crimson' },
];

/** The reward kind at level n (6.10; the item itself is content/flair.js, one per level, M60). */
export function rewardKindAt(n) {
  if (!bandOf(n)) return null;
  const f = FLAIR_AT[n];
  return f ? f.kind : null;
}

/** The band a level sits in, or null off the table. */
export function bandOf(n) { return LEVEL_BANDS.find(b => n >= b.from && n <= b.to) || null; }

/**
 * The level table, one row per level (the Settings, the profile and the level-up row render from
 * it): { level, xp (cumulative to reach it), title, titleKey, reward: { kind, label, key } }.
 */
export const LEVELS = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1;
  const band = bandOf(level);
  const kind = rewardKindAt(level);
  return {
    level, xp: xpAtLevel(level), band: band.from,
    titleKey: 'level_title_' + band.title, rewardKey: 'level_reward_' + kind,
    get title() { return siteCopy(this.titleKey, FALLBACK_TITLES[band.title]); },
    get reward() { const f = FLAIR_AT[level]; return { kind, id: f.id, slot: f.slot, value: f.value, label: siteCopy('flair_' + f.id, f.fallback), kindLabel: siteCopy(this.rewardKey, FALLBACK_REWARDS[kind]) }; },
  };
});

/** The title at level n (site.csv level_title_*). */
export function titleAt(n) { const row = LEVELS[Math.max(1, Math.min(MAX_LEVEL, n | 0)) - 1]; return row ? row.title : ''; }
/** What arrives at level n: { kind, id, slot, value, label (the item, site.csv flair_*), kindLabel (level_reward_*) }. */
export function rewardAt(n) { const row = LEVELS[Math.max(1, Math.min(MAX_LEVEL, n | 0)) - 1]; return row ? row.reward : null; }

// The words, as fallbacks only: the sheets (site.csv) win.
const FALLBACK_TITLES = {
  new_workbook: 'New Workbook', arrow_keys: 'Arrow Keys', ctrl_arrow: 'Ctrl+Arrow', mouse_retired: 'Mouse Retired', alt_native: 'Alt Native',
  chord_player: 'Chord Player', live_links: 'Live Links', ties_out: 'Ties Out', model_owner: 'Model Owner', hard_clock: 'Hard Clock', top_bucket: 'Top Bucket',
};
const FALLBACK_REWARDS = {
  themes_start: 'Workbook, High Contrast and Graphite', theme: 'A theme', crimson: 'Crimson and the Top Bucket frame',
  profile_frame: 'The profile frame', ghost_trail: 'The ghost trail', keycap_skin: 'A keycap skin',
  board_flair: 'Board flair', cursor_color: 'A cursor color', panel_style: 'A panel style',
};
