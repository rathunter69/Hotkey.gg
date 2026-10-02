// app2/ui/components/paywall.js — the paywall as a panel on the page the learner opened
// (screenplay 3.0 "Pricing and the paywall"; 3.13; M105): a Pro chapter on Learn, a Pro drill in
// the catalog, a Pro lesson's URL. Never a pop-up. The heading names the thing ("Chapter 2:
// Formatting", or the drill's title) with "Pro" at the right of the same line, then Wolf's line,
// then Go Pro (Enter) and Not now (Esc). A signed-in account without Pro gets the redeem line.
// One component, used by every page that has a door to show.
//
//   paywallHtml({ heading, line, signedIn })             → the panel's markup
//   const pw = mountPaywall(el, { heading, signedIn, onNotNow, goHref }); pw.destroy();
import { siteCopy } from '../../content/copy/apply.js';
import { panelHtml, buttonHtml } from './table.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (key, fb) => siteCopy(key, fb);

/** The paid line the catalog shows on a locked chapter; one source for the lock page and the lists. */
export const PAID_LINE = () => t('paywall_line', 'Go Pro for the rest of the content.');

/**
 * The panel: the heading with Pro at its right, the line, Go Pro (Enter) and Not now (Esc). `mode` is
 * the page's color (learn on Learn and a lesson's door, drills in the catalog); `ids` names the two
 * buttons for a page that wires them itself. The panel is the page's selected item (the cell cursor).
 */
export function paywallHtml({ heading = '', signedIn = false, goHref = '#/pricing', mode = 'learn', ids = {} } = {}) {
  const body = `<p class="panel-line">${esc(PAID_LINE())}</p>` +
    (signedIn ? `<p class="panel-line ink-2">${esc(t('paywall_signed_in', 'This account isn’t Pro yet. Go Pro, or redeem a code in Plan and billing.'))}</p>` : '') +
    `<div class="btn-row">${buttonHtml({ label: t('paywall_go', 'Go Pro'), key: 'Enter', href: goHref, primary: true, id: ids.go || '', attrs: { 'data-act': 'go' } })}${buttonHtml({ label: t('paywall_not_now', 'Not now'), key: 'Esc', quiet: true, id: ids.notNow || '', attrs: { 'data-act': 'not-now' } })}</div>`;
  return panelHtml({ heading: esc(heading), facts: `<span class="paywall-mark">${esc(t('paywall_pro', 'Pro'))}</span>`, body, mode, cls: 'paywall',
    attrs: { 'aria-label': t('paywall_pro', 'Pro'), 'data-cursor': true, 'data-cursor-enter': '[data-act="go"]', tabindex: '-1' } });
}

/**
 * Mount the panel into `el`. Enter does Go Pro, Esc does Not now (the host decides where that
 * goes: back to the catalog, or just closing the panel).
 */
export function mountPaywall(el, opts = {}) {
  el.innerHTML = paywallHtml(opts);
  const go = el.querySelector('[data-act="go"]');
  const notNow = () => { if (opts.onNotNow) opts.onNotNow(); else if (opts.notNowHref) location.hash = opts.notNowHref; };
  el.querySelector('[data-act="not-now"]').onclick = notNow;
  const onKey = e => {
    if (e.defaultPrevented) return;
    const inField = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.key === 'Enter' && !inField && !(e.target && e.target.closest && e.target.closest('button, a') && e.target !== go)) { e.preventDefault(); if (go) go.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); notNow(); }
  };
  document.addEventListener('keydown', onKey);
  if (go && opts.focus !== false) go.focus({ preventScroll: true });
  return { destroy() { document.removeEventListener('keydown', onKey); el.innerHTML = ''; } };
}
