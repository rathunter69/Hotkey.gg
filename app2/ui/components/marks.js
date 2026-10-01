// app2/ui/components/marks.js — the small drawn marks of the interface standard (screenplay 3.0),
// built once and used on every page: the tier marks (three diamonds, filled to the tier), the
// goal segments, a bar (XP, progress, time against the field), a mode's 9px square, and a
// keycap. Pure HTML builders; the look is components.css, on tokens.
//
//   tierMarksHtml(tier)                 'none' | 'pass' | 'pro' | 'legendary' → three marks
//   segmentsHtml(done, total, current)  the goal segments; `current` rings the next one
//   barHtml(pct, cls)                   a bar filled to pct, in the page's mode color
//   modeMarkHtml(mode)                  the 9px square of a mode's fill
//   keycapHtml(label)                   a keycap
//   levelChipHtml(n)                    'L4', the level beside a handle on a board
import { esc } from './format.js';

export const TIER_FILL = { none: 0, pass: 1, pro: 2, legendary: 3 };
export const TIER_WORD = { none: '', pass: 'Pass', pro: 'Expert', legendary: 'Legendary' };

export function tierMarksHtml(tier, { label = true } = {}) {
  const n = TIER_FILL[tier] || 0;
  const word = TIER_WORD[tier] || '';
  return `<span class="tiers${n ? '' : ' tiers-none'}"${label && word ? ` aria-label="${esc(word)}"` : ' aria-hidden="true"'}>${[0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
}

export function segmentsHtml(done, total, current = false) {
  const t = Math.max(0, total | 0), d = Math.max(0, Math.min(t, done | 0));
  if (!t) return '';
  return `<span class="segs" role="img" aria-label="${d} of ${t}">${Array.from({ length: t }, (_, i) => `<i class="${i < d ? 'on' : i === d && current ? 'now' : ''}"></i>`).join('')}</span>`;
}

export function barHtml(pct, cls = '') {
  const p = Math.max(0, Math.min(100, Number.isFinite(pct) ? Math.round(pct) : 0));
  return `<span class="bar ${esc(cls)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><i style="width:${p}%"></i></span>`;
}

export const modeMarkHtml = mode => `<i class="mode-mark" style="--mark:var(--${esc(mode)})" aria-hidden="true"></i>`;

export const keycapHtml = label => `<kbd class="key">${esc(label)}</kbd>`;

export const levelChipHtml = n => (Number.isFinite(n) && n > 0 ? `<span class="lvl-chip" aria-label="Level ${n}">L${n}</span>` : '');
