// app2/tests/headers-file.js — reads app2/_headers the way Cloudflare Pages does (a URL pattern line,
// then indented "Name: value" lines; "! Name" detaches a header set by an earlier rule), and lists
// the inline scripts the published pages carry with their CSP hashes. Used by security.test.js
// (the policy allows exactly the inline scripts that exist) and serve.js (the local server sends the
// site-wide headers, so the browser smoke runs under the real policy). Dev tooling only.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP2 = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** [{ pattern, headers: { lower-case name: value }, detach: [lower-case names] }] in file order. */
export function parseHeaders(text = readFileSync(join(APP2, '_headers'), 'utf8')) {
  const rules = [];
  let cur = null;
  for (const raw of text.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) { cur = { pattern: raw.trim(), headers: {}, detach: [] }; rules.push(cur); continue; }
    if (!cur) throw new Error('_headers: a header line before any URL pattern: ' + raw);
    const line = raw.trim();
    if (line.startsWith('!')) { cur.detach.push(line.slice(1).trim().toLowerCase()); continue; }
    const i = line.indexOf(':');
    if (i < 1) throw new Error('_headers: not "Name: value": ' + raw);
    const name = line.slice(0, i).trim().toLowerCase();
    if (name in cur.headers) throw new Error('_headers: ' + name + ' twice under ' + cur.pattern);
    cur.headers[name] = line.slice(i + 1).trim();
  }
  return rules;
}

/** A CSP string as { directive: [sources] }. */
export function parseCsp(csp) {
  const out = {};
  for (const part of String(csp || '').split(';')) {
    const [name, ...vals] = part.trim().split(/\s+/);
    if (name) out[name.toLowerCase()] = vals;
  }
  return out;
}

/** The headers the site-wide rule (/*) sets. */
export function siteHeaders(rules = parseHeaders()) {
  const r = rules.find(x => x.pattern === '/*');
  return r ? r.headers : {};
}

/** Every published .html page under app2 (not the tests, vendor code or the database folder). */
export function publishedPages(dir = APP2, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!['tests', 'vendor', 'supabase', 'node_modules'].includes(n)) publishedPages(p, out); }
    else if (n.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Map of "'sha256-…'" → [pages that carry it], over every inline <script> in the published pages. */
export function inlineScriptHashes(pages = publishedPages()) {
  const out = new Map();
  for (const f of pages) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/i.test(m[1])) continue;
      if (/type\s*=\s*["']?application\/(ld\+)?json/i.test(m[1])) continue;   // data, not script
      const h = `'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`;
      if (!out.has(h)) out.set(h, []);
      out.get(h).push(relative(APP2, f));
    }
  }
  return out;
}

/**
 * `node app2/tests/headers-file.js --write`: rewrites the sha256 list in every script-src of
 * app2/_headers to the inline scripts the pages carry now. Run it after editing an inline script
 * (security.test.js fails until the policy and the pages agree).
 */
export function withCurrentHashes(text, hashes = [...inlineScriptHashes().keys()].sort()) {
  return text.replace(/(script-src 'self')((?: 'sha256-[A-Za-z0-9+/=]+')*)/g, (_, head) => head + (hashes.length ? ' ' + hashes.join(' ') : ''));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--write')) {
  const file = join(APP2, '_headers');
  const before = readFileSync(file, 'utf8');
  const after = withCurrentHashes(before);
  if (after !== before) { writeFileSync(file, after); console.log('app2/_headers: script hashes updated'); } else console.log('app2/_headers: script hashes already current');
}
