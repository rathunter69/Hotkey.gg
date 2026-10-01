// The site screens of run R1b built here (M92, M95, M101, M105, M106): the pricing page keeps the
// live figures and lays them out to 3.0, the paywall is one panel, the Settings page renders from
// SETTINGS_GROUPS, the footer carries 3.0's lines, and every line the screens show is a site.csv
// row free of the tells.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICES, proTerms, pricingHtml, FREE_ROWS, PRO_ROWS } from '../app/pricing-page.js';
import { paywallHtml, PAID_LINE } from '../ui/components/paywall.js';
import { lockHeading } from '../app/lock-page.js';
import { columnsFor, visibleSettings, controlHtml, groupHtml, themeTiles } from '../app/settings-page.js';
import { SETTINGS_GROUPS, defaultSettings } from '../app/settings.js';
import { footerHtml, FOOTER_LINKS } from '../ui/footer.js';
import { COPY } from '../content/copy/index.js';
import { SITE_KEYS } from '../content/copy/rules.js';
import { tells } from '../content/copy/tells.js';

const text = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

test('pricing (M105): the live figures stay, Free and Pro side by side, the toggle, the rows, the money-back line and Teams', () => {
  assert.deepEqual(PRICES, { month: 9, year: 90, studentMonth: 7, studentYear: 70 }, 'nothing changes until Wolf says go');
  const terms = proTerms();
  assert.deepEqual(terms.map(x => [x.key, x.price]), [['month', '$9'], ['year', '$90']]);
  const html = pricingHtml({ term: 'month' });
  const t = text(html);
  for (const s of ['Pricing', 'Free', 'Pro', '$0', '$9', 'Monthly', 'Yearly', '$7', '$70', 'Go Pro', 'Checkout opens at launch.', '14 days', 'Teams and classes']) assert.ok(t.includes(s), s);
  assert.ok(pricingHtml({ term: 'year' }).includes('id="proFigure">$90<'), 'the toggle swaps the figure');
  assert.equal(FREE_ROWS().length, 4); assert.equal(PRO_ROWS().length, 4);
  assert.equal((html.match(/class="tick"/g) || []).length, 8, 'one ticked row each');
  assert.ok(html.includes('class="panel plan"') && html.includes('plan-pro'), 'two panels');
  assert.doesNotMatch(t, /→|·/, 'no arrow on a button, no dot-joined facts');
  assert.ok(html.includes('disabled'), 'Go Pro waits for checkout');
});

test('the paywall (M105) is one panel: the heading with Pro at its right, the line, Go Pro on Enter and Not now on Esc', () => {
  const html = paywallHtml({ heading: 'Chapter 2: Formatting', signedIn: false });
  assert.ok(html.startsWith('<section class="panel panel-mode paywall"'));
  const t = text(html);
  assert.ok(t.includes('Chapter 2: Formatting') && t.includes('Pro') && t.includes(PAID_LINE()) && t.includes('Go Pro Enter') && t.includes('Not now Esc'));
  assert.ok(!t.includes('redeem'), 'a guest sees no redeem line');
  assert.ok(text(paywallHtml({ heading: 'x', signedIn: true })).includes('redeem a code'));
  assert.equal(lockHeading(null, { title: 'Formatting' }, 2, ''), 'Chapter 2: Formatting');
  assert.equal(lockHeading({ title: 'Bold the header' }, null, 0, '2.1.3'), '2.1.3 Bold the header');
  assert.equal(lockHeading(null, null, 0, ''), 'This lesson');
});

test('Settings (M101) renders from SETTINGS_GROUPS: two columns, every setting a row with its control at the right, account rows only signed in', () => {
  const [left, right] = columnsFor();
  assert.deepEqual(left.map(g => g.id), ['keyboard', 'lessons', 'practice']);
  assert.deepEqual(right.map(g => g.id), ['appearance', 'sound', 'email', 'account']);
  const rec = defaultSettings('win');
  const themes = themeTiles();
  assert.ok(themes.length > 5 && themes.every(th => th.key && th.label && /^#/.test(th.bg)), 'a tile per theme with its palette');
  assert.ok(themeTiles(k => (k === 'crimson' ? 'Level 30' : null)).find(th => th.key === 'crimson').lock === 'Level 30');
  for (const g of SETTINGS_GROUPS) {
    const html = groupHtml(g, rec, true, themes);
    for (const s of g.settings) assert.ok(html.includes(`data-key="${s.key}"`) || s.type === 'link' || s.type === 'action', `${g.id}.${s.key} has its control`);
    assert.equal((html.match(/class="setting(?: setting-wide)?"/g) || []).length, g.settings.length, g.id + ': a row per setting');
  }
  const acct = SETTINGS_GROUPS.find(g => g.id === 'account');
  assert.equal(visibleSettings(acct, false).length, 0, 'a guest sees no account rows');
  assert.ok(groupHtml(acct, rec, false, themes).includes('guest'), 'the guest line instead');
  assert.ok(controlHtml({ key: 'density', type: 'choice', options: ['comfortable', 'compact'] }, rec, themes).includes('aria-checked="true"'));
  assert.ok(controlHtml({ key: 'sound', type: 'switch' }, rec, themes).includes('role="switch"'));
  assert.equal((controlHtml({ key: 'theme', type: 'theme' }, rec, themes).match(/role="radio"/g) || []).length, themes.length);
});

test('the footer (3.0) on every site page: the seven links and the trademark line; the business line waits for the attorney', () => {
  assert.deepEqual(FOOTER_LINKS.map(l => l.label), ['Pricing', 'For teams', 'About', 'Contact', 'Privacy', 'Terms of Use', 'EULA']);
  const t = text(footerHtml());
  assert.ok(t.includes('Microsoft and Excel are trademarks') && t.includes('LinkedIn'));
  assert.equal((footerHtml().match(/footer-line/g) || []).length, 1, 'no business line while footer_business is empty');
});

test('every site.csv row the screens read exists and is free of the tells', () => {
  const missing = SITE_KEYS.filter(k => !(k in COPY.site));
  assert.deepEqual(missing, [], 'missing rows: ' + missing.join(', '));
  for (const k in COPY.site) for (const part of String(COPY.site[k]).split(/\s*\|\|\s*/)) assert.deepEqual(tells(part, { label: /_(next|skip|start|go|not_now|drill_it|see_pricing)$/.test(k) }), [], `${k}: "${part}"`);
});
