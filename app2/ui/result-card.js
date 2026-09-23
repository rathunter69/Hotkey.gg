// app2/ui/result-card.js — the Daily result card (experience pass, decision 14): the thing
// people screenshot. Tier, time, keys against the reference, board position, the date and the
// mark, composed as one card with the site's identity on it. The copy-to-clipboard line
// (app/daily.js shareText) stays; this is the card itself. Pure HTML; the drill page mounts it
// inside its completion overlay and the storyboard route shows it with sample numbers.
//
//   dailyCardHtml({ day, title, secs, tier, keys, refKeys, pos, of, attempts, clean, handle })

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const TIER_MARK = { legendary: '◆◆◆', pro: '◆◆', pass: '◆', none: '—' };
export const TIER_WORD = { legendary: 'Legendary', pro: 'Pro', pass: 'Pass', none: 'Finished' };

/** '2026-09-23' → 'Tue 23 Sep 2026'. Pure. */
export function prettyDay(day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day || ''));
  if (!m) return String(day || '');
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Keys against the reference route as a percentage (100 = the reference or better). Pure. */
export function efficiency(keys, refKeys) {
  if (!Number.isFinite(keys) || !Number.isFinite(refKeys) || refKeys <= 0) return null;
  return Math.min(100, Math.round(100 * refKeys / Math.max(keys, refKeys)));
}

export function dailyCardHtml(r) {
  const tier = r.clean === false ? 'none' : (r.tier || 'none');
  const eff = efficiency(r.keys, r.refKeys);
  const secs = Number.isFinite(r.secs) ? r.secs : null;
  return `<div class="dc dc-${esc(tier)}" role="group" aria-label="Daily result">
    <div class="dc-head"><span class="dc-brand">hotkey<b>.gg</b></span><span class="dc-day">The Daily · ${esc(prettyDay(r.day))}</span></div>
    <div class="dc-title">${esc(r.title || '')}</div>
    <div class="dc-main">
      <div class="dc-time"><span class="dc-num">${secs == null ? '—' : secs.toFixed(2)}</span><span class="dc-unit">s</span></div>
      <div class="dc-tier"><span class="dc-mark" aria-hidden="true">${TIER_MARK[tier]}</span><span class="dc-word">${TIER_WORD[tier]}</span>${r.clean === false ? '<span class="dc-sub">assisted · no board</span>' : ''}</div>
    </div>
    <div class="dc-stats">
      <div><span>keys</span><b>${Number.isFinite(r.keys) ? r.keys : '—'}${Number.isFinite(r.refKeys) ? ` <i>/ ${r.refKeys}</i>` : ''}</b></div>
      <div><span>efficiency</span><b>${eff == null ? '—' : eff + '%'}</b></div>
      <div><span>board</span><b>${r.pos ? '#' + r.pos + (r.of ? ' <i>of ' + r.of + '</i>' : '') : r.clean === false ? '—' : 'local'}</b></div>
      <div><span>attempt</span><b>${r.attempts || 1}</b></div>
    </div>
    <div class="dc-foot"><span>${r.handle ? '@' + esc(r.handle) : 'guest'}</span><span>hotkey.gg/#/daily</span></div>
  </div>`;
}
