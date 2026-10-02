// app2/ui/components/path.js — the course as a path you can see (Learn, the drill catalog, Home):
// a chapter as a card with its number on a key, its bar and its count; a module as a row of nodes,
// one per lesson, ending on the challenge, filled as they are done and ringed where the learner is;
// a route's keys as a row of keycaps. One component; the pages pass data, the look is pages.css on
// tokens. Pure HTML builders.
//
//   routeKeys(solution, max)                 a key script → its distinct chords ['Ctrl+1', 'Alt H A R', …]
//   keysRowHtml(keys, { max })                those chords as keycaps, "+n" past max
//   chapterCardsHtml(cards, label)            [{ key, n, title, done, of, pct, locked, on, note }] → the chapter strip (tabs)
//   pathNodesHtml(items)                      [{ id, num, title, href, kind, st: 'done'|'next'|'started'|'todo', tier }] → the nodes
//   moduleRowHtml(row, opts)                  one module: its key, name, minutes, the nodes, the challenge's tier
import { esc } from './format.js';
import { tierMarksHtml } from './marks.js';

const PRETTY = { Right: '→', Left: '←', Up: '↑', Down: '↓', PgDn: 'PgDn', PgUp: 'PgUp', Escape: 'Esc' };
const pretty = k => k.split('+').map(p => PRETTY[p] || p).join('+');

/**
 * The distinct chords a key script uses, in the order they first appear: a token with a modifier
 * ("Ctrl+1", "Shift+Right"), an Alt sequence ("Alt H A R", read as one route), and the lone keys
 * that are shortcuts in their own right (F2, F4). Typed text, arrows, Enter and Tab are left out:
 * they are how every route moves, not what a drill drills. Pure.
 */
export function routeKeys(solution, max = Infinity) {
  const toks = String(solution || '').match(/"[^"]*"|\S+/g) || [];
  const out = [];
  const add = k => { if (k && !out.includes(k)) out.push(k); };
  for (let i = 0; i < toks.length; i++) {
    const tk = toks[i];
    if (tk.startsWith('"')) continue;
    if (tk === 'Alt') {
      const seq = ['Alt'];
      while (i + 1 < toks.length && /^[A-Z0-9]$/i.test(toks[i + 1]) && seq.length < 5) seq.push(toks[++i].toUpperCase());
      if (seq.length > 1) add(seq.join(' '));
      continue;
    }
    if (tk.includes('+')) { add(pretty(tk)); continue; }
    if (tk === 'F2' || tk === 'F4') add(tk);
  }
  // what a route does comes first, how it moves (arrows with Ctrl or Shift, the sheet keys) after:
  // a lesson's row leads with Ctrl+1 and Alt H A R, a navigation drill still shows its jumps
  const NAV = /^(Ctrl\+|Shift\+|Ctrl\+Shift\+)?(→|←|↑|↓|Home|End|PgUp|PgDn|Space)$/;
  const act = out.filter(k => !NAV.test(k)), nav = out.filter(k => NAV.test(k));
  return [...act, ...nav].slice(0, max);
}

export function keysRowHtml(keys, { max = 4 } = {}) {
  const list = (keys || []).slice(0, max);
  const more = (keys || []).length - list.length;
  if (!list.length) return '';
  return `<span class="keys-row">${list.map(k => `<kbd class="key">${esc(k)}</kbd>`).join('')}${more > 0 ? `<span class="keys-more">+${more}</span>` : ''}</span>`;
}

/** The chapter strip: six cards as tabs (wireTabs moves across them), each with its number on a key, its bar and its count or lock. */
export function chapterCardsHtml(cards, label = '') {
  return `<div class="ch-cards tabs" role="tablist"${label ? ` aria-label="${esc(label)}"` : ''}>${cards.map(c => {
    const pct = Math.max(0, Math.min(100, Math.round(c.pct || 0)));
    return `<button type="button" role="tab" class="tab ch-card${c.on ? ' on' : ''}${c.locked ? ' locked' : ''}${pct >= 100 ? ' full' : ''}" aria-selected="${c.on ? 'true' : 'false'}" tabindex="${c.on ? 0 : -1}" data-tab="${esc(c.key)}" data-keytip-label="${esc(c.title)}">
      <span class="ch-top"><kbd class="ch-n">${esc(c.n)}</kbd><span class="ch-note">${esc(c.note || '')}</span></span>
      <span class="ch-title">${esc(c.title)}</span>
      <span class="ch-bar" aria-hidden="true"><i style="width:${pct}%"></i></span>
      <span class="ch-count">${esc(c.count || '')}</span>
    </button>`;
  }).join('')}</div>`;
}

/** One node per item; the line between them fills as the path is walked. The challenge closes the row as a diamond. */
export function pathNodesHtml(items) {
  return `<span class="path" role="list">${(items || []).map(it => {
    const cls = `pn pn-${esc(it.kind === 'challenge' ? 'ch' : 'ls')} pn-${esc(it.st || 'todo')}`;
    const tip = `${it.num ? it.num + ' ' : ''}${it.title || ''}`;
    const inner = it.kind === 'challenge' ? '<i></i>' : '';
    return it.href ? `<a class="${cls}" role="listitem" href="${esc(it.href)}" title="${esc(tip)}" aria-label="${esc(tip)}">${inner}</a>` : `<span class="${cls}" role="listitem" title="${esc(tip)}">${inner}</span>`;
  }).join('')}</span>`;
}

/**
 * A module's row: its number on a key, its name and minutes, the path of its lessons and its
 * challenge, and at the right the challenge's tier or the status word. opts: { open, locked, status, href }.
 */
export function moduleRowHtml(row, { open = false, locked = false, status = '', minutes = '' } = {}) {
  const st = row.status || 'todo';
  return `<div class="mod-row row-module mod-${esc(st)}${open ? ' open' : ''}${row.current ? ' current' : ''}${locked ? ' locked' : ''}" data-module="${esc(row.id)}"${locked ? '' : ' data-cursor tabindex="-1"'} aria-expanded="${open ? 'true' : 'false'}">
    <kbd class="mod-n">${esc(row.n)}</kbd>
    <span class="mod-main"><span class="mod-head"><span class="mod-title">${esc(row.title)}</span>${minutes ? `<span class="mod-min">${esc(minutes)}</span>` : ''}</span>${pathNodesHtml(row.nodes)}</span>
    <span class="mod-end">${status ? `<span class="mod-status">${esc(status)}</span>` : ''}${tierMarksHtml(row.tier || 'none')}</span>
  </div>`;
}
