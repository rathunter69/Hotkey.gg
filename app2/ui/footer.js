// app2/ui/footer.js — the one site footer (SITE_SPEC §2): Pricing, Teams, About, Terms, Privacy,
// Contact, the brand and the Microsoft non-affiliation line. Look lifted from the old nav.js
// FOOTER_HTML / nav.css .site-footer.
//
//   const f = mountFooter(el);  f.destroy();

export const FOOTER_LINKS = [
  { label: 'Pricing', href: '#/pricing' },
  { label: 'Teams', href: '#/teams' },
  { label: 'About', href: '#/about' },
  { label: 'Terms', href: '#/terms' },
  { label: 'Privacy', href: '#/privacy' },
  { label: 'Contact', href: '#/contact' },
];

export function footerHtml() {
  return `<footer class="site-footer">
      <div class="sf-in">
        <div class="sf-left">
          <a href="#/" class="sf-brand">hotkey<b>.gg</b></a>
          <span class="sf-fine">Learn Excel by doing. Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not affiliated with or endorsed by Microsoft.</span>
        </div>
        <nav class="sf-links" aria-label="footer">
          ${FOOTER_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n          ')}
        </nav>
      </div>
    </footer>`;
}

export function mountFooter(el) {
  el.innerHTML = footerHtml();
  return { destroy() { el.innerHTML = ''; } };
}
