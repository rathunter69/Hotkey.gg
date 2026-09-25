// app2/ui/skeleton.js — the page-shaped placeholder the router paints while a page module is on
// its way (experience pass C, item 9): something the shape of the page within 100 ms, never a
// blank screen. Pure markup; the shimmer is CSS and stills under prefers-reduced-motion.
//
//   skeletonHtml('lesson') → '<div class="sk sk-ws" …>…</div>'

const bar = (cls = '') => `<div class="sk-bar ${cls}"></div>`;
const card = (cls = '', lines = 3) => `<div class="sk-card ${cls}">${bar('sk-cap')}${Array.from({ length: lines }, (_, i) => bar(i === lines - 1 ? 'sk-short' : '')).join('')}</div>`;

const SHAPES = {
  // the workspace: the strip, then the frame with its ribbon, formula bar and grid, and the card
  ws: () => `${bar('sk-strip')}<div class="sk-frame">${bar('sk-ribbon')}${bar('sk-fbar')}<div class="sk-grid"></div><div class="sk-float">${card('', 4)}</div></div>`,
  // Home: Learn on the left (continue + modules), Practice on the right (due, the Daily, level)
  home: () => `<div class="sk-halves"><div class="sk-col">${card('sk-tall', 4)}${card('', 2)}</div><div class="sk-col">${card('', 2)}${card('', 3)}${card('', 2)}</div></div>${bar('sk-strip')}`,
  // the data room: title, deal strip, the folder tree and the module documents
  learn: () => `${bar('sk-title')}${bar('sk-sub')}${bar('sk-strip')}<div class="sk-dr"><div class="sk-tree">${bar()}${bar()}${bar()}${bar()}</div><div class="sk-col">${card('sk-tall', 5)}${card('', 5)}${card('', 5)}</div></div>`,
  // anything else: a title and three cards
  page: () => `${bar('sk-title')}${bar('sk-sub')}<div class="sk-col">${card('', 3)}${card('', 3)}${card('', 3)}</div>`,
};
const SHAPE_OF = { lesson: 'ws', drill: 'ws', due: 'ws', rapid: 'ws', home: 'home', learn: 'learn' };

/** The placeholder for a route name. */
export function skeletonHtml(name) {
  const shape = SHAPE_OF[name] || 'page';
  return `<div class="sk sk-${shape}" role="status" aria-live="polite" aria-label="Loading"><span class="sk-sr">Loading…</span>${SHAPES[shape]()}</div>`;
}
