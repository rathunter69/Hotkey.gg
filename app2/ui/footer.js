// app2/ui/footer.js — the one footer on every site page (screenplay 3.0 "The landing page",
// Footer; 3.3): Pricing, For teams, About, Contact, Privacy, Terms of Use, EULA; the trademark
// line; and the business line with the LLC's legal name and the address and contact a
// jurisdiction or Stripe requires, which the attorney confirms (site.csv footer_business; the
// line is left out while that row is empty). Every word is a site.csv row.
//
//   const f = mountFooter(el);  f.destroy();
import { siteCopy } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const FOOTER_LINKS = [
  { key: 'pricing', copy: 'footer_pricing', label: 'Pricing', href: '#/pricing' },
  { key: 'teams', copy: 'footer_teams', label: 'For teams', href: '#/teams' },
  { key: 'about', copy: 'footer_about', label: 'About', href: '#/about' },
  { key: 'contact', copy: 'footer_contact', label: 'Contact', href: '#/contact' },
  { key: 'privacy', copy: 'footer_privacy', label: 'Privacy', href: '#/privacy' },
  { key: 'terms', copy: 'footer_terms', label: 'Terms of Use', href: '#/terms' },
  { key: 'eula', copy: 'footer_eula', label: 'EULA', href: '#/eula' },
];

export function footerHtml() {
  const business = siteCopy('footer_business', '');
  return `<footer class="site-footer">
      <nav class="footer-links" aria-label="footer">${FOOTER_LINKS.map(l => `<a href="${l.href}">${esc(siteCopy(l.copy, l.label))}</a>`).join('')}</nav>
      <p class="footer-line">${esc(siteCopy('footer_trademarks', 'Microsoft and Excel are trademarks of the Microsoft group of companies. LinkedIn is a trademark of LinkedIn Corporation. hotkey.gg isn’t affiliated with either.'))}</p>
      ${business ? `<p class="footer-line">${esc(business)}</p>` : ''}
    </footer>`;
}

export function mountFooter(el) {
  el.innerHTML = footerHtml();
  return { destroy() { el.innerHTML = ''; } };
}
