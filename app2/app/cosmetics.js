// app2/app/cosmetics.js — cosmetic unlocks (SITE_SPEC §9): themes by level, achievement or
// rank; frames and flair by rank tier. Everything here is pure lookup over a ctx of
// { level, rank, earned (a Set of achievement ids) }; nothing cosmetic is ever pay-to-win and
// nothing locked ever blocks the eight free themes.
import { THEME_ORDER } from '../ui/themes.js';

/** The themes everyone has from the first visit. */
export const FREE_THEMES = ['daylight', 'github', 'light', 'default', 'nord', 'dracula', 'gruvbox', 'solarized'];

/** A few themes carry story unlocks instead of a level. */
export const SPECIAL_THEMES = {
  bloomberg: { ach: 'ch1-complete', label: 'Complete Foundations' },
  terminal: { ach: 'tier-legend', label: 'Beat a legendary clock' },
  synthwave: { ach: 'combo-10', label: 'A ten-hit rapid-fire combo' },
  crimson: { rank: 6, label: 'Reach MD' },   // rank.js TIERS index
};

/** Level-locked themes in unlock order: every locked, non-special theme, one each 3 levels. */
export const LEVEL_THEMES = THEME_ORDER.filter(k => !FREE_THEMES.includes(k) && !SPECIAL_THEMES[k]);
export const levelFor = key => { const i = LEVEL_THEMES.indexOf(key); return i < 0 ? null : 3 * (i + 1); };

/**
 * Why a theme is locked for this ctx, or null when it is usable.
 * ctx = { level (default 1), rankIndex (default 0), earned (Set/array of achievement ids) }
 */
export function themeLock(key, ctx = {}) {
  if (FREE_THEMES.includes(key)) return null;
  const earned = ctx.earned instanceof Set ? ctx.earned : new Set(ctx.earned || []);
  const sp = SPECIAL_THEMES[key];
  if (sp) {
    if (sp.ach) return earned.has(sp.ach) ? null : sp.label;
    if (sp.rank != null) return (ctx.rankIndex || 0) >= sp.rank ? null : sp.label;
  }
  const need = levelFor(key);
  if (need == null) return null;   // a theme added later defaults open
  return (ctx.level || 1) >= need ? null : `Unlocks at level ${need}`;
}

/** Every theme with its lock state, in picker order: [{ key, lock }]. */
export function themeStates(ctx = {}) {
  return THEME_ORDER.map(key => ({ key, lock: themeLock(key, ctx) }));
}

/** Rank flair: the frame class and label a tier index carries (rank.js TIERS order). */
export const RANK_FLAIR = [
  { frame: 'frame-none', label: null },
  { frame: 'frame-bronze', label: 'Candidate' },
  { frame: 'frame-silver', label: 'Summer' },
  { frame: 'frame-gold', label: 'First-Year' },
  { frame: 'frame-amethyst', label: 'Associate' },
  { frame: 'frame-platinum', label: 'VP' },
  { frame: 'frame-crimson', label: 'MD' },
  { frame: 'frame-diamond', label: 'Second-Year' },
];
export const rankFlair = i => RANK_FLAIR[Math.max(0, Math.min(RANK_FLAIR.length - 1, i || 0))];
