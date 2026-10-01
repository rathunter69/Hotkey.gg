// app2/ui/components/keytips.js — one KeyTips registry for site pages (screenplay 3.0 "Get these
// right now", 5; "The rail"; M88), separate from the Ribbon's. Alt puts a letter on everything a
// page offers: the rail's letters are fixed (Home H, Learn L, Practice P, The Daily D, Drills R,
// Rapid-fire F, Challenges C, Leaderboards B, Reference E, Account A) and a page's own panels and
// commands take the next free letters, assigned here. Alt shows them, a letter acts, Esc backs
// out. None of it runs inside a lesson, a challenge or a drill, where Alt belongs to the Ribbon
// alone: the host says which routes are the workspace (opts.isWorkspace).
//
//   RAIL_TIPS                      the fixed letters
//   assignLetters(labels, taken)   → letters for a page's items (pure)
//   const tips = createKeyTips({ root, isWorkspace, enabled });
//   tips.register([{ id, label, el, action }]) → the letters assigned (the page's items; cleared on the next route)
//   tips.show(); tips.hide(); tips.clear(); tips.destroy(); tips.visible

export const RAIL_TIPS = { home: 'H', learn: 'L', practice: 'P', daily: 'D', drills: 'R', rapid: 'F', challenges: 'C', leaderboard: 'B', reference: 'E', account: 'A' };
export const RESERVED = new Set(Object.values(RAIL_TIPS));
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Letters for a page's items, in order: the first letter of the label that is still free, else
 * the next free letter of the alphabet. `taken` holds the letters already in use (the rail's by
 * default). Pure; an item past the alphabet gets null.
 */
export function assignLetters(labels, taken = RESERVED) {
  const used = new Set([...taken].map(l => String(l).toUpperCase()));
  return labels.map(label => {
    const first = String(label || '').replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase();
    let pick = first && !used.has(first) ? first : ALPHABET.find(l => !used.has(l)) || null;
    if (pick) used.add(pick);
    return pick;
  });
}

export function createKeyTips(opts = {}) {
  const root = opts.root || (typeof document !== 'undefined' ? document : null);
  const isWorkspace = opts.isWorkspace || (() => false);
  const enabled = opts.enabled || (() => true);
  let visible = false;
  let page = [];   // the page's registered items: { id, label, letter, el, action }
  let altDown = false;

  function marks() { return root ? [...root.querySelectorAll('[data-keytip]')] : []; }
  function show() {
    if (visible) return;
    visible = true;
    document.body.classList.add('keytips-on');
    for (const it of page) if (it.el && !it.el.querySelector(':scope > .kt-page')) {
      const k = document.createElement('kbd'); k.className = 'kt kt-page'; k.textContent = it.letter; k.setAttribute('aria-hidden', 'true'); it.el.appendChild(k);
    }
  }
  function hide() {
    if (!visible) return;
    visible = false;
    document.body.classList.remove('keytips-on');
    for (const it of page) { const k = it.el && it.el.querySelector(':scope > .kt-page'); if (k) k.remove(); }
  }
  /** Act on a letter: the page's item first, then the rail's. Returns true when something acted. */
  function act(letter) {
    const L = String(letter || '').toUpperCase();
    const it = page.find(p => p.letter === L);
    if (it) { hide(); if (typeof it.action === 'function') it.action(); else if (it.el) it.el.click(); return true; }
    const el = marks().find(m => String(m.dataset.keytip || '').toUpperCase() === L);
    if (el) { hide(); el.click(); return true; }
    return false;
  }
  function register(items) {
    clear();
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    const letters = assignLetters(list.map(i => i.label), new Set([...RESERVED, ...marks().map(m => String(m.dataset.keytip || '').toUpperCase())]));
    page = list.map((it, i) => ({ ...it, letter: letters[i] })).filter(it => it.letter);
    if (visible) { visible = false; show(); }
    return page.map(it => it.letter);
  }
  function clear() { hide(); page = []; }

  const onKeyDown = e => {
    if (!enabled() || isWorkspace()) { if (visible) hide(); return; }
    const inField = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.key === 'Alt' && !e.ctrlKey && !e.metaKey && !e.shiftKey) { altDown = true; e.preventDefault(); if (visible) hide(); else show(); return; }
    if (!visible) return;
    if (e.key === 'Escape') { e.preventDefault(); hide(); return; }
    if (e.key.length === 1 && /[a-z]/i.test(e.key) && !e.ctrlKey && !e.metaKey) {
      if (act(e.key)) { e.preventDefault(); e.stopPropagation(); return; }
      if (!inField) { e.preventDefault(); hide(); return; }
    }
    if (e.key === 'Shift' || e.key === 'Alt') return;
    hide();
  };
  const onKeyUp = e => { if (e.key === 'Alt') { altDown = false; if (visible) e.preventDefault(); } };
  const onBlur = () => { altDown = false; hide(); };
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('blur', onBlur);
  window.addEventListener('mousedown', hide, true);

  function destroy() {
    hide(); page = [];
    window.removeEventListener('keydown', onKeyDown, true); window.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('blur', onBlur); window.removeEventListener('mousedown', hide, true);
  }
  return { register, clear, show, hide, act, destroy, get visible() { return visible; }, get items() { return page.slice(); }, get altDown() { return altDown; } };
}
