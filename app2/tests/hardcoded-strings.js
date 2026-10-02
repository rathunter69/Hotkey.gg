// app2/tests/hardcoded-strings.js — the hardcoded-strings guard (R8, M1). Every line a learner reads
// lives in the copy sheets (content/copy/*.csv); a screen asks for it by key, with its built-in line
// only as the fallback: siteCopy('key', 'fallback') or a page's t('key', 'fallback'). This scans the
// screens' source (app/ and ui/) for string literals that read as English prose and are not such a
// fallback, and reports each one. Pure: findings(src) → [{ line, text }].
//
// The heuristic: after dropping ${…} interpolations and HTML tags, a literal is prose when it holds
// three words or more of plain letters in a row with a lowercase word among them ("Saved to your
// account"). Not prose: class lists and ids (hyphens, underscores, dots), selectors, key sequences,
// URLs, comments, the fallback argument of a copy lookup, a `fallback:` field (the sheet's row wins),
// and developer-only text (console, throw, an error list). What is left either moves to a sheet or
// goes on the allow list in hardcoded-allow.js with its reason.
//
//   node app2/tests/hardcoded-strings.js     list every finding outside the allow list
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The string literals of a source file, as { start, quote, body }: every quoted string, and every
 * template literal with its ${…} parts blanked (the literals inside an interpolation are listed in
 * their own right, so a lookup's fallback inside a template is still seen as one). Comments and
 * regular expressions are skipped.
 */
export function literals(code) {
  const out = [];
  const str = (i, q) => {
    let j = i + 1;
    while (j < code.length && code[j] !== q && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1;
    out.push({ start: i, quote: q, body: code.slice(i + 1, j) });
    return j + 1;
  };
  const tpl = i => {
    let j = i + 1, body = '';
    const at = out.length; out.push(null);
    while (j < code.length && code[j] !== '`') {
      if (code[j] === '\\') { body += code.slice(j, j + 2); j += 2; continue; }
      if (code[j] === '$' && code[j + 1] === '{') { j = scan(j + 2, true); body += ' ${} '; continue; }
      body += code[j]; j++;
    }
    out[at] = { start: i, quote: '`', body };
    return j + 1;
  };
  const regex = i => {
    let j = i + 1, cls = false;
    while (j < code.length && code[j] !== '\n') {
      const d = code[j];
      if (d === '\\') { j += 2; continue; }
      if (d === '[') cls = true; else if (d === ']') cls = false; else if (d === '/' && !cls) break;
      j++;
    }
    return j + 1;
  };
  // code up to the brace that closes an interpolation (or the end); returns the index after it
  function scan(i, inInterp) {
    let depth = 0;
    while (i < code.length) {
      const c = code[i], n = code[i + 1];
      if (c === '/' && n === '/') { const e = code.indexOf('\n', i); i = e < 0 ? code.length : e; continue; }
      if (c === '/' && n === '*') { const e = code.indexOf('*/', i + 2); i = e < 0 ? code.length : e + 2; continue; }
      if (c === '/') {
        const prev = code.slice(Math.max(0, i - 12), i).replace(/\s+$/, '');
        if (!prev || /[=(,:;!&|?{}[+\-*%<>~^]$/.test(prev) || /\b(?:return|typeof|case|in|of)$/.test(prev)) { i = regex(i); continue; }
      }
      if (c === '\'' || c === '"') { i = str(i, c); continue; }
      if (c === '`') { i = tpl(i); continue; }
      if (c === '{') depth++;
      else if (c === '}') { if (inInterp && depth === 0) return i + 1; depth--; }
      i++;
    }
    return i;
  }
  scan(0, false);
  return out.filter(Boolean);
}

/** The words a reader would see in a literal: interpolations and tags dropped, entities read. */
export function visible(body) {
  return String(body).replace(/\\(['"`\\])/g, '$1').replace(/\$\{\}/g, ' ').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Is this English prose a learner would read? Three plain words in a row, one of them lowercase. */
export function isProse(text) {
  const t = String(text);
  if (/^\w+(?:,\s*\w+)+$/.test(t)) return false;   // a column list
  if (/^[\w.-]+(\s+[\w.-]+)*$/.test(t) && /[-_.]/.test(t) && !/\s[a-z]+\s[a-z]+\s/.test(' ' + t + ' ')) return false;   // a class list or ids
  if (/^(?:https?:|mailto:|#\/|\.\/|\/)/.test(t)) return false;
  let run = 0, lower = false;
  for (const w of t.split(/\s+/)) {
    const bare = w.replace(/[.,:;!?…)(“”"’‘]+/g, '');
    if (/^[A-Za-z][a-z’']*$/.test(bare)) { run++; if (/^[a-z]/.test(bare) && bare.length > 1) lower = true; if (run >= 3 && lower) return true; }
    else { run = 0; lower = false; }
  }
  return false;
}

/** The copy lookups whose second argument is a fallback: siteCopy('k', fb), a page's t('k', fb), and the like. */
const LOOKUP = /\b(?:siteCopy|t|tt|tx|line|copy)\(\s*(?:['"`][\w.:{}$-]+['"`]|[\w.]+(?:\s*\+\s*(?:['"`][\w.-]*['"`]|[\w.]+))*|[^()]*\?[^()]*:[^()]*)\s*,\s*$/;
/** Developer-only contexts: never on a page. */
const DEV = /(?:console\.\w+|throw new \w*Error|new Error|errs\.push|reject|assert\w*|track)\(\s*$/;

/** Every prose literal in `src` that is not a copy fallback or developer text: [{ line, text }]. */
export function findings(src) {
  const out = [];
  for (const lit of literals(src)) {
    const text = visible(lit.body);
    if (!isProse(text)) continue;
    const before = src.slice(Math.max(0, lit.start - 160), lit.start);
    if (LOOKUP.test(before)) continue;
    if (/\bfallback\s*:\s*$/.test(before)) continue;
    if (DEV.test(before)) continue;
    if (/(?:querySelector(?:All)?|closest|matches|import)\(\s*$/.test(before)) continue;
    out.push({ line: src.slice(0, lit.start).split('\n').length, text });
  }
  return out;
}

const here = dirname(fileURLToPath(import.meta.url));
export const APP2 = resolve(here, '..');
/** The screens' source: every module under app/ and ui/. */
export function screenFiles() {
  const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; });
  return [...walk(join(APP2, 'app')), ...walk(join(APP2, 'ui'))].map(p => relative(APP2, p)).sort();
}
/** Every line the copy sheets carry: a literal that is one of these is a fallback the sheet already holds. */
export async function sheetLines() {
  const { COPY } = await import('../content/copy/index.js');
  const out = new Set();
  const add = v => { if (typeof v === 'string' && v.trim()) for (const p of v.split(/\s*\|\|\s*/)) out.add(p.trim()); };
  const walk = o => { if (o && typeof o === 'object') for (const k in o) { const v = o[k]; if (typeof v === 'string') add(v); else walk(v); } };
  walk(COPY);
  return out;
}
/** Every finding over the screens that no sheet line covers: [{ file, line, text }]. */
export async function scanScreens() {
  const lines = await sheetLines();
  return screenFiles().flatMap(file => findings(readFileSync(join(APP2, file), 'utf8')).map(f => ({ file, ...f })))
    .filter(f => !lines.has(f.text));
}
/** The findings the allow list does not cover. */
export function unlisted(found, { ALLOW, ALLOW_FILES }) {
  return found.filter(f => !ALLOW_FILES[f.file] && !ALLOW.some(a => a.file === f.file && f.text.startsWith(a.text)));
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const left = unlisted(await scanScreens(), await import('./hardcoded-allow.js'));
  for (const f of left) console.log(`${f.file}:${f.line}  ${f.text.slice(0, 160)}`);
  console.log(`${left.length} hardcoded line(s) outside the allow list`);
}
