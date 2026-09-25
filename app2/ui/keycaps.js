// app2/ui/keycaps.js — the key-flash HUD: a body-level .keyflash showing the last six keys as
// .kchip pills (newest .new), fading 1.4 s after the last key. Lifted from index.html flashKey /
// resetFlash (27198, 27301–27312) and the markup at 2438.
//
//   const caps = mountKeycaps(session);   // hooks session.opts.onKey (chains any existing handler)
//   mountKeycaps(null, { parent, cls: 'in-frame' })   // the lesson workspace: inside the frame, over the sheet-tab bar
//   caps.flash('Ctrl+B'); caps.reset(); caps.destroy();

export function mountKeycaps(session, opts = {}) {
  const parent = opts.parent || document.body;
  let el = opts.el || null;
  if (!el) { el = document.createElement('div'); el.className = 'keyflash' + (opts.cls ? ' ' + opts.cls : ''); el.id = 'keyflash'; el.setAttribute('aria-hidden', 'true'); parent.appendChild(el); }
  let timer = null, chips = [];
  const hold = opts.hold || 1400;

  function flash(t) {
    chips.push(String(t)); if (chips.length > 6) chips.shift();
    el.innerHTML = chips.map((x, i) => `<span class="kchip${i === chips.length - 1 ? ' new' : ''}">${esc(x)}</span>`).join('');
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => { el.classList.remove('show'); chips = []; }, hold);
  }
  function reset() { chips = []; clearTimeout(timer); el.classList.remove('show'); el.innerHTML = ''; }

  // The Session reads opts.onKey on every logKey(), so wrapping the option here is enough.
  const prev = session && session.opts ? session.opts.onKey : null;
  if (session) { session.opts = session.opts || {}; session.opts.onKey = label => { if (prev) prev(label); flash(label); }; }

  function destroy() { reset(); if (session && session.opts) session.opts.onKey = prev || undefined; if (!opts.el) el.remove(); }
  return { el, flash, reset, destroy };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
