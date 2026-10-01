// app2/ui/components/cursor.js — the cell cursor as the focus mark on site pages (screenplay 3.0,
// rules 1 and 6; "Motion and moments", "The cursor moves"; M88): a 2px outline in the page's mode
// color with the small square handle at its bottom right, moved with the arrows, Enter doing the
// item's action. A page marks what the cursor can land on with `data-cursor` (a table row, a
// panel's button, a tile); `data-cursor-enter` names the selector of what Enter activates when it
// is not the element itself. One cursor per page; the route remounts it.
//
//   nextIndex(i, n, key, cols)   → the index an arrow key moves to (pure; cols for a grid)
//   const cursor = createCursor({ root });
//   cursor.refresh(); cursor.select(el | index); cursor.current; cursor.destroy();
export const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/** Where an arrow moves from index i of n items: a list moves by one on any arrow; a grid of `cols` columns moves by a row on Up/Down. Clamped, never wrapping. */
export function nextIndex(i, n, key, cols = 1) {
  if (!Number.isInteger(n) || n <= 0) return -1;
  const at = Number.isInteger(i) && i >= 0 && i < n ? i : -1;
  if (at < 0) return 0;
  const step = cols > 1 ? cols : 1;
  let to = at;
  if (key === 'ArrowDown') to = at + step;
  else if (key === 'ArrowUp') to = at - step;
  else if (key === 'ArrowRight') to = at + 1;
  else if (key === 'ArrowLeft') to = at - 1;
  return Math.max(0, Math.min(n - 1, to));
}

export function createCursor(opts = {}) {
  const root = opts.root || (typeof document !== 'undefined' ? document.body : null);
  let items = [];
  let current = -1;

  const inField = el => !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
  function refresh() {
    items = root ? [...root.querySelectorAll('[data-cursor]')].filter(el => !el.closest('[hidden]')) : [];
    if (current >= items.length) current = items.length - 1;
    paint();
  }
  function paint() {
    items.forEach((el, i) => { el.classList.toggle('cursor-on', i === current); if (i === current) el.setAttribute('data-cursor-on', ''); else el.removeAttribute('data-cursor-on'); });
  }
  function select(what, { focus = true, scroll = true } = {}) {
    const i = typeof what === 'number' ? what : items.indexOf(what);
    if (!(i >= 0 && i < items.length)) return false;
    current = i; paint();
    const el = items[i];
    if (focus && typeof el.focus === 'function') { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    if (scroll && typeof el.scrollIntoView === 'function') { try { el.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older engines */ } }
    return true;
  }
  function activate() {
    const el = items[current]; if (!el) return false;
    const sel = el.getAttribute('data-cursor-enter');
    const target = sel ? el.querySelector(sel) || root.querySelector(sel) : el;
    if (target && typeof target.click === 'function') { target.click(); return true; }
    return false;
  }
  const colsOf = el => { const g = el && el.closest('[data-cursor-cols]'); const n = g ? parseInt(g.getAttribute('data-cursor-cols'), 10) : 1; return Number.isInteger(n) && n > 1 ? n : 1; };

  const onKey = e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (inField(e.target)) return;
    if (document.body.classList.contains('keytips-on')) return;
    if (ARROWS.includes(e.key)) {
      if (!items.length) refresh();
      if (!items.length) return;
      const to = nextIndex(current, items.length, e.key, current >= 0 ? colsOf(items[current]) : 1);
      e.preventDefault(); select(to);
    } else if (e.key === 'Enter' && current >= 0 && items[current]) {
      if (e.target !== items[current] && items[current].contains(e.target)) return;   // a control inside the item handles its own Enter
      if (activate()) e.preventDefault();
    }
  };
  const onFocus = e => { const i = items.indexOf(e.target.closest ? e.target.closest('[data-cursor]') : null); if (i >= 0 && i !== current) { current = i; paint(); } };
  window.addEventListener('keydown', onKey);
  if (root) root.addEventListener('focusin', onFocus);
  refresh();
  function destroy() { window.removeEventListener('keydown', onKey); if (root) root.removeEventListener('focusin', onFocus); items.forEach(el => el.classList.remove('cursor-on')); items = []; }
  return { refresh, select, activate, destroy, get current() { return items[current] || null; }, get index() { return current; }, get count() { return items.length; } };
}
