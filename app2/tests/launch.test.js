// app2/tests/launch.test.js — the cutover files: _redirects, _headers, sitemap, robots,
// and the legacy ?drill= query resolver. Runs before app2/app/config.js exists (Phase B
// creates it), so everything that reads the config tolerates its absence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyQuery } from '../app/main.js';
import { sitemapUrls, renderSitemap, renderRobots } from './public-pages.js';
import { LESSONS } from '../content/index.js';
import { REFERENCE } from '../content/reference.js';

const app2 = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const redirectsFile = readFileSync(join(app2, '_redirects'), 'utf8');
const headersFile = readFileSync(join(app2, '_headers'), 'utf8');

/** SUPABASE_URL from app2/app/config.js, or '' when the file does not exist yet (pre-Phase-B). */
async function configUrl() {
  if (!existsSync(join(app2, 'app', 'config.js'))) return '';
  const cfg = await import('../app/config.js');
  return cfg.SUPABASE_URL || '';
}

/** _redirects rules as { source, dest, status }, comments and blank lines skipped. */
function parseRedirects() {
  return redirectsFile.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => {
      const parts = l.split(/\s+/);
      return { source: parts[0], dest: parts[1], status: parts[2] ? Number(parts[2]) : 302, fields: parts.length };
    });
}

// the old root pages that must each have a rule (index.html itself is the new app, excluded)
const OLD_PAGES = [
  '/drills/*', '/reference.html', '/leaderboard.html', '/About.html', '/enterprise.html',
  '/billing.html', '/terms.html', '/privacy.html', '/contact.html', '/account.html',
  '/profile.html', '/stats.html', '/desks.html', '/cert.html', '/security.html', '/admin.html',
];

test('_redirects: every rule is well-formed', () => {
  const rules = parseRedirects();
  assert.ok(rules.length > 0 && rules.length < 2000, `rule count ${rules.length}`);
  for (const r of rules) {
    assert.ok(r.fields >= 2 && r.fields <= 3, `rule has ${r.fields} fields: ${r.source}`);
    assert.ok([301, 302].includes(r.status), `status ${r.status} on ${r.source}`);
    assert.ok(r.source.startsWith('/'), `source not a path: ${r.source}`);
    assert.ok(r.dest.startsWith('/'), `destination not a path: ${r.dest}`);
  }
});

test('_redirects: no destination is itself a source (no loops)', () => {
  const rules = parseRedirects();
  const sources = new Set(rules.map(r => r.source));
  for (const r of rules) assert.ok(!sources.has(r.dest), `loop: ${r.source} → ${r.dest} is also a source`);
});

test('_redirects: every old root page has a rule', () => {
  const sources = new Set(parseRedirects().map(r => r.source));
  for (const p of OLD_PAGES) assert.ok(sources.has(p), `no rule for ${p}`);
});

test('_headers: frame-ancestors, supabase host, no third-party CDNs', async () => {
  assert.match(headersFile, /frame-ancestors 'none'/);
  assert.ok(!/jsdelivr/.test(headersFile), 'jsdelivr must not appear: nothing in app2 loads it');
  assert.match(headersFile, /connect-src[^;]*https:\/\/[a-z]+\.supabase\.co/, 'connect-src must allow the Supabase project');
  const url = await configUrl();
  if (url) {
    const host = new URL(url).host;
    assert.ok(headersFile.includes(`https://${host}`), `_headers must allow the config.js Supabase host ${host}`);
    assert.ok(headersFile.includes(`wss://${host}`), `_headers must allow wss for ${host}`);
  }
});

test('legacyQuery resolves the old ?drill= CTA and nothing else', () => {
  assert.equal(legacyQuery('?drill=anchor'), '/#/practice');
  assert.equal(legacyQuery('?drill=ctrl-arrow&utm=x'), '/#/practice');
  assert.equal(legacyQuery(''), null);
  assert.equal(legacyQuery(null), null);
  assert.equal(legacyQuery('?code=pkce-return'), null);
  assert.equal(legacyQuery('?mode=solo'), null);
});

test('sitemap covers the app, both indexes and every generated page', () => {
  const urls = sitemapUrls();
  assert.equal(urls.length, LESSONS.length + REFERENCE.length + 3);
  assert.equal(new Set(urls).size, urls.length, 'duplicate sitemap URLs');
  for (const u of urls) assert.match(u, /^https:\/\/www\.hotkey\.gg\//);
  const xml = renderSitemap();
  assert.equal((xml.match(/<loc>/g) || []).length, urls.length);
  const onDisk = readFileSync(join(app2, 'sitemap.xml'), 'utf8');
  assert.equal(onDisk, xml, 'app2/sitemap.xml drifted: run node app2/tests/public-pages.js --write');
});

test('robots allows crawling and names the sitemap', () => {
  const robots = renderRobots();
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.match(robots, /Sitemap: https:\/\/www\.hotkey\.gg\/sitemap\.xml/);
  assert.equal(readFileSync(join(app2, 'robots.txt'), 'utf8'), robots);
});
