// app2/ui/badges.js — the badge shelf (SITE_SPEC §9): earned badges in their rarity colours,
// locked ones as silhouettes with progress, hidden ones as ? tiles until earned. Pure HTML
// builders; the pages (Stats, home) drop the string in and share one look.
import { ACHIEVEMENTS } from '../content/achievements.js';
import { GLYPHS, renderPixel, RARITY_COLOURS } from './pixel.js';

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

/** The shelf as HTML. opts.limit trims to the first N (recent pages); hidden stay ? until earned. */
export function badgesHtml(ctx, opts = {}) {
  const states = evaluateAchievements(ctx);
  const shown = opts.limit ? states.slice(0, opts.limit) : states;
  const earned = states.filter(s => s.done).length;
  return `<div class="badge-shelf" role="list" aria-label="Achievements: ${earned} of ${states.length} earned">
    ${shown.map(s => {
      const { def } = s;
      if (def.hidden && !s.done) return `<div class="badge locked hiddenb" role="listitem" title="Hidden — keep playing"><span class="badge-q">?</span><span class="badge-name">???</span></div>`;
      const art = renderPixel(GLYPHS[def.glyph] || GLYPHS.star, { b: RARITY_COLOURS[def.rarity] || RARITY_COLOURS.common }, s.done ? { size: 34 } : { size: 34, mono: 'color-mix(in srgb, var(--muted) 45%, transparent)' });
      const prog = !s.done && s.goal > 1 ? `<span class="badge-prog"><i style="width:${Math.round(100 * s.prog / s.goal)}%"></i></span>` : '';
      return `<div class="badge ${s.done ? 'earned r-' + esc(def.rarity) : 'locked'}" role="listitem" title="${esc(def.name)} — ${esc(def.desc)}${s.done ? '' : s.goal > 1 ? ` (${s.prog}/${s.goal})` : ''}">
        ${art}<span class="badge-name">${esc(def.name)}</span>${prog}</div>`;
    }).join('')}
  </div>`;
}
