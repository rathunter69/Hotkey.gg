// app2/app/storyboard.js — the unlisted storyboard index (#/storyboard): every screen of the
// experience pass in one place for Wolf to walk, plus the Daily result card with sample numbers
// (#/storyboard/daily-card). Turns the ?flow=next flag on for the browser when opened.
import { dailyCardHtml } from '../ui/result-card.js';
import { dayOf } from './records.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const SCREENS = [
  { h: 'Landing', items: [['#/landing?flow=next&h=1', 'Headline 1 · You don’t learn Excel by watching. You learn it by doing it again.'], ['#/landing?flow=next&h=2', 'Headline 2 · Excel isn’t learned. It’s practiced.'], ['#/landing?flow=next&h=3', 'Headline 3 · Nobody learned Excel from a video.']] },
  { h: 'First run (one frame)', items: [['#/start?flow=next&replay=1', 'Demo → briefing (3 cards) → orientation → picker → the Welcome race']] },
  { h: 'Home', items: [['#/?flow=next&demo=1', 'Dashboard on a seeded first-week state (Continue, Due today, the Daily, the deal strip, rings, level)'], ['#/?flow=next', 'Dashboard on this browser’s real state']] },
  { h: 'Learn · the data room', items: [['#/learn?flow=next', 'Folders, numbered documents, steps, challenge tiers, pack pages']] },
  { h: 'Workspace · panel layout variants (same lesson)', items: [['#/lesson/inherited-workbook?flow=next&panel=right', 'Panel RIGHT (the spec default)'], ['#/lesson/inherited-workbook?flow=next&panel=left', 'Panel LEFT (flip with the strip button; ?panel=left forces it for the storyboard)'], ['#/lesson/inherited-workbook?flow=next&panel=overlay', 'OVERLAY: a floating task card over the sheet, goals collapsed behind it']] },
  { h: 'Workspace · cues', items: [['#/lesson/welcome-export?flow=next', 'The Welcome: target pulses at goal start, the story beat first'], ['#/lesson/inherited-workbook?flow=next', 'Module 1.1 lesson 1: Ribbon route glow (goal 4 · Alt H O R), the stuck hint after ~8 s']] },
  { h: 'Due today', items: [['#/due/ctrl-shift-arrow?flow=next', 'A 30-second micro-drill from the queue']] },
  { h: 'The Daily result card', items: [['#/storyboard/daily-card', 'Sample numbers, all four tiers']] },
];

export function mountStoryboard(root, ctx = {}) {
  try { localStorage.setItem('hk2_flow', 'next'); document.documentElement.setAttribute('data-flow', 'next'); } catch (e) { /* ignore */ }
  const id = (ctx.params && ctx.params.id) || 'index';
  const el = document.createElement('div');
  el.className = 'page storyboard';
  if (id === 'daily-card') {
    const samples = [
      { day: dayOf(), title: 'Go anywhere', secs: 38.42, tier: 'legendary', keys: 27, refKeys: 26, pos: 3, of: 41, attempts: 2, clean: true, handle: 'wolf' },
      { day: dayOf(), title: 'Go anywhere', secs: 61.4, tier: 'pro', keys: 34, refKeys: 26, pos: 12, of: 41, attempts: 1, clean: true, handle: 'wolf' },
      { day: dayOf(), title: 'Go anywhere', secs: 96.07, tier: 'pass', keys: 51, refKeys: 26, pos: 30, of: 41, attempts: 3, clean: true, handle: null },
      { day: dayOf(), title: 'Go anywhere', secs: 74.9, tier: 'pass', keys: 40, refKeys: 26, pos: null, of: null, attempts: 1, clean: false, handle: 'wolf' },
    ];
    el.innerHTML = `<div class="page-head"><h1>The Daily result card</h1><p class="page-sub">Designed as the thing people screenshot: tier, time, keys against the reference, board position, the date, the mark. Copy-to-clipboard keeps the text line; the card is the share.</p></div>
      <div class="dc-grid">${samples.map(s => dailyCardHtml(s)).join('')}</div>`;
  } else {
    el.innerHTML = `<div class="page-head"><h1>Storyboard · the experience pass</h1><p class="page-sub">Every screen behind the <code>?flow=next</code> flag. Opening this page turns the flag on for this browser; add <code>?flow=off</code> to any address to turn it off.</p></div>
      ${SCREENS.map(g => `<section class="sb-group"><h2>${esc(g.h)}</h2><ul class="plain-list">${g.items.map(([href, label]) => `<li><a href="${esc(href)}">${esc(label)}</a><span class="muted">${esc(href)}</span></li>`).join('')}</ul></section>`).join('')}
      <p class="page-fine">Density: the top-right theme menu carries no switch yet; set it with <code>localStorage.hk2_prefs</code> → <code>density: "compact"</code>, or wait for Settings (ships with go).</p>`;
  }
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}
