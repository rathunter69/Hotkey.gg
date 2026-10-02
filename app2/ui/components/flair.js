// app2/ui/components/flair.js — a flair item, drawn (screenplay 6.10: "its reward drawn (a keycap
// skin shows as a keycap)"). One tile per kind, used by Home's Level panel, the profile's Flair
// panel and the level-up row: a keycap skin as a keycap in that skin, a ghost color as the dashed
// ghost outline, a board mark as its pixel sprite, a frame as a framed square, a theme as its
// swatch, a panel style as a small panel head. The colors are the tokens in ui/tokens.css.
import { spriteSvg } from '../sprites.js';
import { tokensFor } from '../themes.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** item: a flair row ({ slot, value }) or a level reward ({ slot, value, kind }). */
export function flairTileHtml(item, { locked = false } = {}) {
  if (!item) return '';
  const lk = locked ? ' flair-locked' : '';
  const v = esc(item.value || '');
  switch (item.slot) {
    case 'keycap': return `<span class="flair-tile${lk}" aria-hidden="true"><kbd class="key kc-skin-${v}">Alt</kbd></span>`;
    case 'cursor': return `<span class="flair-tile${lk}" aria-hidden="true"><i class="flair-ghost cur-${v}"></i></span>`;
    case 'trail': return `<span class="flair-tile${lk}" aria-hidden="true"><i class="flair-ghost flair-trail"></i></span>`;
    case 'board': return `<span class="flair-tile${lk}" aria-hidden="true">${spriteSvg(item.value, { size: 32, locked })}</span>`;
    case 'frame': return `<span class="flair-tile${lk}" aria-hidden="true"><i class="flair-frame frame-${v}"></i></span>`;
    case 'panel': return `<span class="flair-tile${lk}" aria-hidden="true"><i class="flair-panel flair-panel-${v}"></i></span>`;
    case 'theme': {
      if (!item.value) return `<span class="flair-tile${lk}" aria-hidden="true"><i class="flair-swatch"></i></span>`;
      let tk = {}; try { tk = tokensFor(item.value); } catch (e) { /* the default swatch */ }
      const style = `--sw-paper:${tk.paper || 'var(--paper)'};--sw-rail:${tk.rail || 'var(--rail)'};--sw-mark:${tk.learn || 'var(--learn)'}`;
      return `<span class="flair-tile${lk}" aria-hidden="true"><i class="flair-swatch" style="${esc(style)}"></i></span>`;
    }
    default: return '';
  }
}
