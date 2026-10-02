// app2/ui/badges.js — the badge shelf (screenplay 6.7; M103): earned badges as their pixel sprite
// (ui/sprites.js) with the rarity as a colored word under them, locked ones as silhouettes with
// progress, hidden ones as a question mark until earned. Pure HTML builders; the pages (Home, the
// profile, Learn, the achievement banner) drop the string in and share one look.
import { ACHIEVEMENTS } from '../content/achievements.js';
import { spriteSvg } from './sprites.js';
import { siteCopy } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Evaluate every achievement against a ctx: [{ def, done, prog, goal }]. Never throws. */
export function evaluateAchievements(ctx) {
  return ACHIEVEMENTS.map(def => {
    let r;
    try { r = def.test(ctx || {}); } catch (e) { r = { done: false, prog: 0, goal: 1 }; }
    return { def, done: !!(r && r.done), prog: (r && r.prog) || 0, goal: (r && r.goal) || 1 };
  });
}

/** The earned achievement ids as a Set (cosmetics and flair read this). */
export function earnedSet(ctx) {
  return new Set(evaluateAchievements(ctx).filter(s => s.done).map(s => s.def.id));
}

/** One badge's art: the sprite, a silhouette while locked, a question mark while hidden. */
export function badgeArt(def, { done = false, size = 64 } = {}) {
  if (def.hidden && !done) return `<span class="badge-q" style="width:${size}px;height:${size}px" aria-hidden="true">?</span>`;
  return spriteSvg(def.art, { size, locked: !done }) || '';
}

/** The shelf as HTML. opts.limit trims to the first N (recent pages); hidden stay ? until earned. */
export function badgesHtml(ctx, opts = {}) {
  const states = evaluateAchievements(ctx);
  const shown = opts.limit ? states.slice(0, opts.limit) : states;
  const earned = states.filter(s => s.done).length;
  return `<div class="badge-shelf" role="list" aria-label="${esc(siteCopy('ach_shelf_label', 'Achievements: {n} of {m} earned').replace('{n}', earned).replace('{m}', states.length))}">
    ${shown.map(s => {
      const { def } = s;
      if (def.hidden && !s.done) return `<div class="badge locked hiddenb" role="listitem" title="${esc(siteCopy('ach_hidden_desc', 'Keep playing to find it'))}">${badgeArt(def, { size: 34 })}<span class="badge-name">${esc(siteCopy('ach_hidden_name', 'Hidden'))}</span></div>`;
      const prog = !s.done && s.goal > 1 ? `<span class="badge-prog"><i style="width:${Math.round(100 * s.prog / s.goal)}%"></i></span>` : '';
      return `<div class="badge ${s.done ? 'earned r-' + esc(def.rarity) : 'locked'}" role="listitem" title="${esc(def.name)}: ${esc(def.desc)}${s.done ? '' : s.goal > 1 ? ` (${s.prog} of ${s.goal})` : ''}">
        ${badgeArt(def, { done: s.done, size: 34 })}<span class="badge-name">${esc(def.name)}</span>${prog}</div>`;
    }).join('')}
  </div>`;
}
