// app2/ui/toast.js — the bottom toast lane. Lifted from index.html showToast (31329–31334) and
// the #hkToast rules (905–921): one fixed pill, centred at the bottom, mono type, accent-dim
// border; each call replaces the text and re-arms the 1.6 s fade.

let timer = null;

export function showToast(msg, opts = {}) {
  let el = document.getElementById('hkToast');
  if (!el) { el = document.createElement('div'); el.id = 'hkToast'; document.body.appendChild(el); }
  el.textContent = String(msg); el.classList.add('show');
  clearTimeout(timer); timer = setTimeout(() => el.classList.remove('show'), opts.hold || 1600);
  return el;
}

export function hideToast() {
  clearTimeout(timer);
  const el = document.getElementById('hkToast'); if (el) el.classList.remove('show');
}
