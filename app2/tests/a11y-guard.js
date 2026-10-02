// app2/tests/a11y-guard.js — the accessible-name guard (liability checklist, R9: alt text). Every
// image has an alt (empty is fine for decoration), and every control a learner can reach by Tab or
// a screen reader (button, link, form field, an element with role="img") has a name: its text, an
// aria-label, aria-labelledby, a title, a <label>, or an image inside it with alt text. Decoration
// hidden with aria-hidden is skipped. `unnamed` runs inside the page (the browser smoke passes it to
// page.evaluate), so it may use only the DOM; a11y-guard.test.js holds it to its examples with a
// minimal stand-in DOM.

/** In the page: [{ tag, why, html }] for every element without the name it needs. */
export function unnamed(root) {
  const doc = root && root.ownerDocument ? root.ownerDocument : (typeof document !== 'undefined' ? document : null);
  const top = root || (doc && doc.body);
  if (!top) return [];
  const out = [];
  const hidden = el => { for (let e = el; e && e !== top.parentNode; e = e.parentElement || e.parentNode) { if (e.getAttribute && (e.getAttribute('aria-hidden') === 'true' || e.hasAttribute('hidden'))) return true; } return false; };
  // the text a screen reader reads out: text nodes outside aria-hidden subtrees, plus alt text
  const spoken = el => {
    let s = '';
    for (const n of el.childNodes || []) {
      if (n.nodeType === 3) s += n.nodeValue;
      else if (n.nodeType === 1 && n.getAttribute('aria-hidden') !== 'true') s += /^img$/i.test(n.tagName) ? ' ' + (n.getAttribute('alt') || '') + ' ' : (n.getAttribute('aria-label') ? ' ' + n.getAttribute('aria-label') + ' ' : spoken(n));
    }
    return s;
  };
  // a name of only marks (×, ›, …) says nothing when read out
  const real = s => (/[\p{L}\p{N}]/u.test(s || '') ? s.trim() : '');
  const byIds = ids => ids.split(/\s+/).map(id => doc && doc.getElementById(id)).filter(Boolean).map(e => spoken(e)).join(' ').trim();
  const nameOf = el => {
    const al = real(el.getAttribute('aria-label')); if (al) return al;
    const lb = el.getAttribute('aria-labelledby'); if (lb && real(byIds(lb))) return byIds(lb);
    if (el.id && doc && doc.querySelector) { const l = doc.querySelector(`label[for="${el.id}"]`); if (l && real(spoken(l))) return spoken(l); }
    const wrap = el.closest && el.closest('label'); if (wrap && real(spoken(wrap))) return spoken(wrap);
    const txt = real(spoken(el)); if (txt && !/^(input|select|textarea)$/i.test(el.tagName)) return txt;
    const ti = real(el.getAttribute('title')); if (ti) return ti;
    const ph = /^(input|textarea)$/i.test(el.tagName) ? (el.getAttribute('placeholder') || '').trim() : ''; if (ph) return ph;
    if (/^input$/i.test(el.tagName) && /^(submit|button|reset)$/i.test(el.getAttribute('type') || '') && (el.getAttribute('value') || '').trim()) return el.getAttribute('value').trim();
    return '';
  };
  const snip = el => (el.outerHTML || '').slice(0, 160);
  for (const img of top.querySelectorAll('img')) {
    if (hidden(img)) continue;
    if (!img.hasAttribute('alt')) out.push({ tag: 'img', why: 'no alt attribute', html: snip(img) });
  }
  const controls = top.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [role="tab"], [role="checkbox"], [role="img"]');
  for (const el of controls) {
    if (hidden(el)) continue;
    if (!nameOf(el)) out.push({ tag: el.tagName.toLowerCase(), why: 'no accessible name', html: snip(el) });
  }
  return out;
}
