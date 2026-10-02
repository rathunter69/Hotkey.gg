// app2/ui/components/task-card.js — the task card that points (screenplay 3.0 "The task card";
// "Get these right now", 4; M90). One component, used by every lesson. It sits beside the goal's
// target on the side with the most room, 16px from it, with a pointer on the edge that faces the
// target; it never covers the active cell, the selection, the target, a note or any range the goal
// asks the learner to read; with no side clear, or no target on the sheet, it docks at the bottom
// right. It shows, in order: the goal segments with "Goal {n} of {m}", the goal, the teach line the
// first time a key is taught, the keys as keycaps, one live line, and a footer with F1 Help and
// Ctrl+Shift+K Hide. Help opens inside it. The keys answer: each keycap fills as it is pressed and
// the next one is ringed; a wrong key resets the row and the line says so. States: teaching,
// repeat, done, typing (a pill while a cell is edited), help, watch.
//
//   placeCard(box, target, card, opts)    → { side, rect, pointer, covers }   pure, tested on every lesson's goals
//   rangeRect(ref, geom)                  → a range's rect from column widths and row heights (pure)
//   routeTokens(keys)                     → [{ key } | { text }]   a goal's keys as the keycaps show them (pure)
//   routeProgress(tokens, pressed)        → { matched, wrong, next, done }   which keycaps are filled (pure)
//   liveLine(progress, tokens, copy)      → the one live line under the keys (pure)
//   alternates(goal), offRoute(…), tryLine(…), worksToo(…), worksTooLine(…)   the other routes and the gentle wrong-key lines (pure)
//   createTaskCard(host, opts)            → the component
import { siteCopy } from '../../content/copy/apply.js';
import { keyLabel } from '../../app/prefs.js';

export const CARD_W = 330;       // the token --card-w; the DOM reads the token, the placement test reads this
export const CARD_GAP = 16;      // --card-gap
export const CARD_PAD = 12;      // the margin to the box's far edges
export const SIDES = ['right', 'left', 'below', 'above'];
export const DOCKS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const overlaps = (a, b) => !!a && !!b && a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;

/* ---------------- placement (pure) ---------------- */

/**
 * Where the card goes.
 *   box     { w, h, x0, y0 }: the visible sheet box in its own pixels; the data area starts at (x0, y0)
 *           (the sticky column letters and row numbers sit above and left of it)
 *   target  { left, top, width, height } in box pixels, scrolled, or null when the goal has no cell target
 *   card    { w, h }
 *   opts    gap (16), pad (12), avoid ([rects] the card never covers: the active cell, the selection,
 *           a note, a range the goal reads), obstacles ([rects] it would rather not cover: the filled
 *           cells showing), prefer ('auto' | 'left' | 'right': the Task card side setting; a side
 *           Ctrl+Shift+J asked for)
 *   → { side: 'right' | 'left' | 'below' | 'above' | 'dock', rect, pointer: { edge, at } | null, covers }
 * Among the sides where the card fits clear of everything, the one over the fewest filled cells
 * wins, then the one with the most room; the setting's side wins when it fits. With no side clear the card docks at the bottom right (then
 * the other corners, the first that is clear); `covers` is true only when nothing is clear at all.
 */
export function placeCard(box, target, card, opts = {}) {
  const gap = opts.gap == null ? CARD_GAP : opts.gap, pad = opts.pad == null ? CARD_PAD : opts.pad;
  const x0 = box.x0 || 0, y0 = box.y0 || 0;
  const avoid = (opts.avoid || []).filter(Boolean), obstacles = (opts.obstacles || []).filter(Boolean);
  const cover = r => obstacles.reduce((n, o) => n + (overlaps(r, o) ? 1 : 0), 0);
  const w = Math.max(0, Math.min(card.w, box.w - x0 - 2 * pad)), h = Math.max(0, Math.min(card.h, box.h - y0 - 2 * pad));
  const maxL = box.w - pad - w, maxT = box.h - pad - h;
  const cx = v => Math.max(x0 + pad, Math.min(maxL, v)), cy = v => Math.max(y0 + pad, Math.min(maxT, v));
  const rect = (left, top) => ({ left, top, width: w, height: h });
  const inside = r => r.left >= x0 && r.top >= y0 && r.left + r.width <= box.w - pad + 1e-9 && r.top + r.height <= box.h - pad + 1e-9;
  // the target clipped to the data area; one wholly outside the box is no target
  let t = null;
  if (target) {
    const l = Math.max(x0, target.left), tp = Math.max(y0, target.top), r = Math.min(box.w, target.left + target.width), b = Math.min(box.h, target.top + target.height);
    if (r > l && b > tp) t = { left: l, top: tp, width: r - l, height: b - tp };
  }
  const clear = r => inside(r) && !overlaps(r, t) && !avoid.some(a => overlaps(r, a));
  const pointerFor = (side, r) => {
    if (!t) return null;
    const cyT = t.top + t.height / 2, cxT = t.left + t.width / 2;
    if (side === 'right') return { edge: 'left', at: Math.max(16, Math.min(r.height - 16, cyT - r.top)) };
    if (side === 'left') return { edge: 'right', at: Math.max(16, Math.min(r.height - 16, cyT - r.top)) };
    if (side === 'below') return { edge: 'top', at: Math.max(16, Math.min(r.width - 16, cxT - r.left)) };
    return { edge: 'bottom', at: Math.max(16, Math.min(r.width - 16, cxT - r.left)) };
  };
  if (t) {
    const cands = [];
    const room = { right: box.w - pad - (t.left + t.width), left: t.left - x0 - pad, below: box.h - pad - (t.top + t.height), above: t.top - y0 - pad };
    const at = { right: () => rect(t.left + t.width + gap, cy(t.top)), left: () => rect(t.left - gap - w, cy(t.top)), below: () => rect(cx(t.left), t.top + t.height + gap), above: () => rect(cx(t.left), t.top - gap - h) };
    for (const side of SIDES) {
      const need = side === 'right' || side === 'left' ? w + gap : h + gap;
      if (room[side] < need) continue;
      const r = at[side]();
      if (clear(r)) cands.push({ side, rect: r, room: room[side], cover: cover(r) });
    }
    const asked = SIDES.includes(opts.prefer) ? cands.find(c => c.side === opts.prefer) : null;
    const pick = asked || cands.sort((a, b) => a.cover - b.cover || b.room - a.room)[0];
    if (pick) return { side: pick.side, rect: pick.rect, pointer: pointerFor(pick.side, pick.rect), covers: false };
  }
  // nothing clear beside it, or nothing to sit beside: the dock, bottom right first
  const corners = { 'bottom-right': rect(maxL, maxT), 'bottom-left': rect(x0 + pad, maxT), 'top-right': rect(maxL, y0 + pad), 'top-left': rect(x0 + pad, y0 + pad) };
  for (const d of DOCKS) { const r = corners[d]; if (clear(r)) return { side: 'dock', dock: d, rect: r, pointer: null, covers: false }; }
  return { side: 'dock', dock: 'bottom-right', rect: corners['bottom-right'], pointer: null, covers: true };
}

/**
 * A range's rect in content pixels from the sheet's geometry: colW(c) and rowH(r) in px (1-based),
 * x0 and y0 where A1 starts. 'B5' or 'B5:D9'. Pure; the placement test builds targets with it.
 */
export function rangeRect(ref, geom) {
  const m = /^\$?([A-Z]{1,3})\$?(\d{1,7})(?::\$?([A-Z]{1,3})\$?(\d{1,7}))?$/.exec(String(ref || '').trim());
  if (!m) return null;
  const col = s => { let n = 0; for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64); return n; };
  const c1 = col(m[1]), r1 = +m[2], c2 = m[3] ? col(m[3]) : c1, r2 = m[4] ? +m[4] : r1;
  const ca = Math.min(c1, c2), cb = Math.max(c1, c2), ra = Math.min(r1, r2), rb = Math.max(r1, r2);
  let left = geom.x0 || 0, top = geom.y0 || 0, width = 0, height = 0;
  for (let c = 1; c < ca; c++) left += geom.colW(c);
  for (let c = ca; c <= cb; c++) width += geom.colW(c);
  for (let r = 1; r < ra; r++) top += geom.rowH(r);
  for (let r = ra; r <= rb; r++) height += geom.rowH(r);
  return { left, top, width, height };
}

/* ---------------- the keys that answer (pure) ---------------- */

const GLYPH = { Enter: '↵', Return: '↵', Escape: 'Esc', Up: '↑', Down: '↓', Left: '←', Right: '→', Backspace: '⌫', Space: 'Space' };
/** One key's label the way the session logs it (↵ for Enter, ↓ for Down, Ctrl+↓ for Ctrl+Down). */
export const normKey = k => String(k || '').split('+').map(p => GLYPH[p] || p).join('+');

/**
 * A goal's keys as the keycaps show them: 'Ctrl+Home ↑ ×3 then Ctrl+1 A "1200" ↵' →
 * [{ key:'Ctrl+Home' }, { key:'↑' } × 3, { key:'Ctrl+1' }, { key:'A' }, { text:'1200' }, { key:'↵' }].
 * Connectives ('then', 'and', ',') fall away; ×N repeats the key before it.
 */
export function routeTokens(keys) {
  const out = [];
  for (const t of String(keys || '').match(/"[^"]*"|'[^']*'|\S+/g) || []) {
    if (t.startsWith('"') || t.startsWith("'")) { out.push({ text: t.slice(1, -1) }); continue; }
    const rep = /^×(\d+)$/.exec(t);
    if (rep) { const last = out[out.length - 1]; if (last) for (let i = 1; i < Math.min(+rep[1], 50); i++) out.push({ ...last }); continue; }
    if (/^[a-z]/.test(t) && t.length > 1) continue;   // then, and, twice: prose
    if (t === ',' || t === '…' || t === '/') continue;
    out.push({ key: normKey(t) });
  }
  return out;
}

/**
 * Which keycaps are filled: walk the keys pressed since the goal became current against the
 * route. A key that is the next one fills it; a wrong key resets the row (and fills the first
 * keycap when it was that one). A text token fills as its characters arrive. `pressed` is a list
 * of logged labels (session.keyLog entries' k, or strings). Modifier-only and refusal marks are
 * ignored. → { matched: tokens filled, chars: characters into the current text token, wrong: the
 * wrong key's label or null, next: the token to press, done }
 */
/** Keys that work the workspace, not the sheet (the Ribbon's fold, the formula bar's height): never a wrong key on a route. */
const CHROME_KEYS = new Set(['Ctrl+F1', 'Ctrl+Shift+U']);
export function routeProgress(tokens, pressed) {
  let matched = 0, chars = 0, wrong = null;
  const list = (pressed || []).map(p => (typeof p === 'string' ? p : p && p.k)).filter(k => k && k !== '⚠' && !CHROME_KEYS.has(k));
  for (const raw of list) {
    const k = normKey(raw);
    if (matched >= tokens.length) break;
    const tok = tokens[matched];
    if (tok.text != null) {
      if (k === tok.text[chars]) { chars++; if (chars >= tok.text.length) { matched++; chars = 0; } wrong = null; continue; }
    } else if (k === tok.key) { matched++; wrong = null; continue; }
    // wrong: the row resets; the key may start the route again
    wrong = k; matched = 0; chars = 0;
    const first = tokens[0];
    if (first && first.key === k) { matched = 1; wrong = null; }
    else if (first && first.text != null && first.text[0] === k) { chars = 1; wrong = null; }
  }
  return { matched, chars, wrong, next: tokens[matched] || null, done: matched >= tokens.length && tokens.length > 0 };
}

/** The live line under the keys: "{n} keys in. Press {key}." or, after a wrong key, "That was {key}. Start again with {key1}." */
export function liveLine(progress, tokens, platform) {
  if (!tokens || !tokens.length) return '';
  const label = tok => (tok.text != null ? '“' + tok.text + '”' : keyLabel(tok.key, platform));
  if (progress.wrong) return fill(siteCopy('card_live_wrong', 'That was {key}. Start again with {key1}.'), { key: keyLabel(progress.wrong, platform), key1: label(tokens[0]) });
  if (progress.done) return siteCopy('card_live_done', 'Every key is in.');
  // a typed token reads "Type “…”", a key "Press …": never "Press “Clearcoat …”"
  const typed = tok => !!tok && tok.text != null;
  if (progress.matched === 0 && !progress.chars) return typed(tokens[0]) ? fill(siteCopy('card_live_start_type', 'Type {text}.'), { text: label(tokens[0]) }) : fill(siteCopy('card_live_start', 'Press {key}.'), { key: label(tokens[0]) });
  const n = progress.matched;
  if (typed(progress.next)) return n === 0 ? fill(siteCopy('card_live_typing', 'Keep typing {text}.'), { text: label(progress.next) }) : fill(siteCopy(n === 1 ? 'card_live_one_type' : 'card_live_keys_type', n === 1 ? 'One key in. Type {text}.' : '{n} keys in. Type {text}.'), { n: WORDS[n] || n, text: label(progress.next) });
  return fill(siteCopy(n === 1 ? 'card_live_one' : 'card_live_keys', n === 1 ? 'One key in. Press {key}.' : '{n} keys in. Press {key}.'), { n: WORDS[n] || n, key: label(progress.next) });
}
/**
 * The other routes a goal shows under its keys as "Also works": the goal's own alt data (another
 * route Excel offers, schema.js), and in a browser tab the alias for Excel's sheet keys (Alt+PgDn for
 * Ctrl+PgDn, which the browser keeps). → a list of key strings, never the route itself. Pure.
 */
export function alternates(goal, { browserTab = true } = {}) {
  if (!goal || !goal.keys) return [];
  const out = [];
  if (goal.alt) for (const a of (Array.isArray(goal.alt) ? goal.alt : [goal.alt])) out.push(String(a).trim());
  if (browserTab && /Ctrl\+Pg(Up|Dn)/.test(goal.keys)) {
    // a route of sheet keys alone shows whole ("Alt+PgDn ×3"); inside a longer route, the alias keys alone
    if (/^(?:Ctrl\+Pg(?:Up|Dn)|×\d+|\s)+$/.test(goal.keys)) out.push(goal.keys.replace(/Ctrl\+Pg(Up|Dn)/g, 'Alt+Pg$1'));
    else for (const m of goal.keys.match(/Ctrl\+Pg(?:Up|Dn)/g)) out.push(m.replace('Ctrl', 'Alt'));
  }
  return [...new Set(out)].filter(a => a && a !== goal.keys);
}
/**
 * Whether the keys pressed since the goal began have left the route the card shows and every
 * alternate too (an alternate under way is never "off the route"). Pure.
 */
export function offRoute(tokens, altTokens, pressed) {
  if (!tokens || !tokens.length) return false;
  if (!routeProgress(tokens, pressed).wrong) return false;
  return !(altTokens || []).some(t => { const p = routeProgress(t, pressed); return !p.wrong && (p.matched > 0 || p.chars > 0 || p.done); });
}
/** The gentle line after a pause off the route: "Not quite. Try {key}." Pure. */
export function tryLine(progress, tokens, platform) {
  if (!tokens || !tokens.length) return '';
  const tok = tokens[Math.min(progress && progress.matched || 0, tokens.length - 1)];
  const label = tok.text != null ? '“' + tok.text + '”' : keyLabel(tok.key, platform);
  return fill(siteCopy('card_live_try', 'Not quite. Try {key}.'), { key: label });
}
/**
 * A goal landed by a route other than the one the card showed (and none of its alternates): the
 * sheet is right, so the card says "That works too" and names the keys the lesson teaches. Pure.
 */
export function worksToo(tokens, altTokens, pressed) {
  if (!tokens || !tokens.length || !pressed || !pressed.length) return false;
  if (routeProgress(tokens, pressed).done) return false;
  return !(altTokens || []).some(t => routeProgress(t, pressed).done);
}
/** The line for worksToo: "That works too. The keys here: Ctrl+↓." Pure. */
export function worksTooLine(tokens, platform) {
  const keys = (tokens || []).map(tok => (tok.text != null ? '“' + tok.text + '”' : keyLabel(tok.key, platform))).join(' ');
  return fill(siteCopy('card_live_works', 'That works too. The keys this goal teaches: {keys}.'), { keys });
}
/** The stuck cue's subtle line: "pulse B5 · Ctrl+↓ jumps to the edge" → the part after the separator (the pulse is the target's). Pure. */
export function stuckLine(hintStuck) {
  const s = String(hintStuck || '');
  const i = s.indexOf('·'); if (i >= 0) return s.slice(i + 1).trim();
  return /^pulse\b/i.test(s) ? '' : s.trim();
}
const WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

/* ---------------- the component ---------------- */

export const HELP_ITEMS = [
  { id: 'keys', copy: 'card_help_keys', fallback: 'Show the keys', noteCopy: 'card_help_clean', noteFallback: 'keeps the run clean' },
  { id: 'once', copy: 'card_help_once', fallback: 'Show me once', noteCopy: 'card_help_assisted', noteFallback: 'marks it assisted' },
  { id: 'do', copy: 'card_help_do', fallback: 'Do it for me', noteCopy: 'card_help_assisted', noteFallback: 'marks it assisted' },
];

/**
 * @param {HTMLElement} host   the sheet frame the card floats in (position: relative)
 * @param {object} opts        onHelp(id) for a Help rung, onHide(), platform() → 'win' | 'mac'
 */
export function createTaskCard(host, opts = {}) {
  const el = document.createElement('div');
  el.className = 'tc'; el.setAttribute('aria-live', 'polite'); el.hidden = true;
  host.appendChild(el);
  let model = null, help = false, helpIx = 0, pill = false, hiddenByKey = false, placed = null, ringH = false;
  const platform = () => (opts.platform ? opts.platform() : undefined);
  const kbd = k => `<kbd class="tc-key">${esc(keyLabel(k, platform()))}</kbd>`;

  function segments(n, m) {
    let h = '<span class="tc-segs" aria-hidden="true">';
    for (let i = 1; i <= m; i++) h += `<i class="${i < n ? 'done' : i === n ? 'now' : ''}"></i>`;
    return h + '</span>';
  }
  function keysHtml(tokens, progress) {
    return '<div class="tc-keys">' + tokens.map((tok, i) => {
      const state = i < progress.matched ? ' on' : i === progress.matched ? ' next' : '';
      if (tok.text != null) return `<span class="tc-type${state}">${esc(siteCopy('card_type', 'type'))} “${esc(tok.text)}”</span>`;
      return `<kbd class="tc-key${state}">${esc(keyLabel(tok.key, platform()))}</kbd>`;
    }).join('') + '</div>';
  }
  function helpHtml(m) {
    const foot = m.helpNone ? `<div class="tc-help-none">${esc(m.helpNone)}</div>` : '';
    const rows = m.helpNone ? '' : HELP_ITEMS.map((it, i) => `<button type="button" class="tc-help-row${i === helpIx ? ' cursor-on' : ''}" data-help="${it.id}"><span>${esc(siteCopy(it.copy, it.fallback))}</span><small>${esc(siteCopy(it.noteCopy, it.noteFallback))}</small></button>`).join('');
    return `<div class="tc-help">${rows}${foot}<div class="tc-foot"><span class="tc-foot-k">${kbd('Esc')} ${esc(siteCopy('ws_close', 'close'))}</span></div></div>`;
  }
  function render() {
    const m = model; if (!m) { el.innerHTML = ''; return; }
    el.dataset.state = m.state || 'teaching';
    el.classList.toggle('tc-pill', pill && m.state !== 'done');
    el.classList.toggle('tc-help-open', help);
    el.classList.toggle('tc-ring-help', ringH && !help);
    const head = `<div class="tc-head">${segments(m.n, m.m)}<span class="tc-count">${esc(fill(siteCopy('ws_goal_count', 'Goal {n} of {m}'), { n: m.n, m: m.m }))}</span></div>`;
    const goal = `<div class="tc-goal">${m.state === 'done' ? '<span class="tc-tick" aria-hidden="true"></span>' : ''}${esc(m.goal)}</div>`;
    if (help) { el.innerHTML = head + goal + helpHtml(m); return; }
    const intro = m.intro ? `<div class="tc-intro">${esc(m.intro)}</div>` : '';   // the card names itself once, in 1.1.1 (M92)
    const teach = m.teach ? `<div class="tc-teach">${esc(m.teach)}</div>` : '';
    const keys = m.keys && m.keys.length ? keysHtml(m.keys, m.progress || { matched: 0 }) : '';
    const alts = m.keys && m.keys.length && m.alts && m.alts.length ? `<div class="tc-alt"><span class="tc-alt-label">${esc(siteCopy('card_also_works', 'Also works'))}</span>${m.alts.map(a => `<span class="tc-alt-route">${a.map(tok => (tok.text != null ? `<span class="tc-type">“${esc(tok.text)}”</span>` : `<kbd class="tc-key tc-key-sm">${esc(keyLabel(tok.key, platform()))}</kbd>`)).join('')}</span>`).join(`<span class="tc-alt-or">${esc(siteCopy('card_alt_or', 'or'))}</span>`)}</div>` : '';
    const aside = m.aside ? `<div class="tc-aside">${esc(m.aside)}</div>` : '';
    const live = m.live ? `<div class="tc-live${m.liveKind ? ' tc-live-' + m.liveKind : ''}">${esc(m.live)}</div>` : '';
    const foot = m.state === 'done' ? '' : `<div class="tc-foot"><span class="tc-foot-k">${kbd('F1')} ${esc(siteCopy('card_help', 'Help'))}</span><span class="tc-foot-k">${kbd('Ctrl+Shift+K')} ${esc(siteCopy('card_hide', 'Hide'))}</span></div>`;
    el.innerHTML = head + intro + aside + goal + teach + keys + alts + live + foot;
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-help]'); if (b && opts.onHelp) { opts.onHelp(b.dataset.help); return; }
    if (pill && !e.target.closest('button')) { setPill(false); }
  });

  /** The card's natural size (its full height, not the one the last placement clamped it to). */
  function measure() {
    const was = el.hidden; el.hidden = false;
    const prev = el.style.maxHeight; el.style.maxHeight = 'none';
    const r = { w: el.offsetWidth || CARD_W, h: el.offsetHeight || 200 };
    el.style.maxHeight = prev; el.hidden = was;
    return r;
  }
  /** Put the card at a placement (box pixels, relative to `origin` in the host). The glide is the CSS transition. */
  function place(p, origin = { left: 0, top: 0 }) {
    placed = p;
    el.style.left = Math.round(origin.left + p.rect.left) + 'px';
    el.style.top = Math.round(origin.top + p.rect.top) + 'px';
    el.style.maxHeight = Math.max(80, Math.round(p.rect.height)) + 'px';
    el.dataset.side = p.side;
    el.dataset.dock = p.dock || '';
    if (p.pointer) { el.dataset.pointer = p.pointer.edge; el.style.setProperty('--tc-at', Math.round(p.pointer.at) + 'px'); } else { el.dataset.pointer = ''; }
  }
  function set(m) { model = m; if (m && m.state !== 'help' && help && m.closeHelp) help = false; render(); }
  function openHelp() { help = true; helpIx = 0; ringH = false; render(); }
  function closeHelp() { if (!help) return false; help = false; render(); return true; }
  function helpKey(key) {
    if (!help) return false;
    const n = HELP_ITEMS.length;
    if (key === 'ArrowDown') { helpIx = (helpIx + 1) % n; render(); return true; }
    if (key === 'ArrowUp') { helpIx = (helpIx + n - 1) % n; render(); return true; }
    if (key === 'Enter') { if (!(model && model.helpNone) && opts.onHelp) opts.onHelp(HELP_ITEMS[helpIx].id); return true; }
    if (key === 'Escape') { closeHelp(); return true; }
    return true;   // the card owns the keys while Help is open
  }
  function setPill(on) { if (pill === !!on) return; pill = !!on; render(); }
  function show() { hiddenByKey = false; el.hidden = false; }
  function hide() { hiddenByKey = true; el.hidden = true; }
  function toggle() { if (hiddenByKey) show(); else hide(); return !hiddenByKey; }
  function ringHelp(on) { ringH = !!on; render(); }
  return {
    el, set, place, measure, openHelp, closeHelp, helpKey, setPill, show, hide, toggle, ringHelp,
    get help() { return help; }, get hidden() { return hiddenByKey; }, get pill() { return pill; }, get placement() { return placed; },
    destroy() { el.remove(); },
  };
}
