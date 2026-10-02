// app2/tests/text-guard.js — the rendered-text guard: what a learner reads on a page, checked for the
// marks of a broken template. A placeholder that never filled ({board}), a value that never
// arrived (undefined, null, NaN), a title spliced into a sentence ("Your The desk's format…", a
// capital "The" mid-sentence), a doubled word, or a raw copy key (boards_yours) standing in for its
// line. Pure: textProblems(text) → [{ rule, line }]. The browser smoke runs it over the rendered
// text of the key pages; text-guard.test.js holds the rules to their examples.
import { COPY } from '../content/copy/index.js';

/** Every copy key: a word on the page that is one of these is a line that never resolved. */
const COPY_KEYS = new Set(Object.values(COPY || {}).flatMap(t => (t && typeof t === 'object' ? Object.keys(t) : [])).filter(k => k.includes('_')));

/** snake_case words that are really on the page: the 404's formula. Handles (ctrl_z) pass: one underscore and not a copy key. */
export const SNAKE_ALLOW = new Set(['this_page']);
/** Proper names that start with a capital "The" anywhere in a sentence. */
const THE_NAMES = /^The (Daily|Ribbon)\b/;

const RULES = [
  { rule: 'placeholder', test: line => /[{}]/.test(line) },
  { rule: 'missing value', test: line => /\b(undefined|null|NaN)\b/.test(line) || /\[object Object\]/.test(line) },
  { rule: 'spliced title', test: line => /\b(Your|your|the|a|an) The\b/.test(line) },
  {
    // a capital "The" after a lowercase word or a comma: a title dropped into a sentence ("Today it's The weekly report")
    rule: 'capital The mid-sentence',
    test: line => { const re = /[a-z,]\s+(The\s+\S+)/g; let m; while ((m = re.exec(line))) if (!THE_NAMES.test(m[1])) return true; return false; },
  },
  {
    // "the the", "is is": words of two letters or more, not all capitals (Alt H H is a key sequence)
    rule: 'doubled word',
    test: line => { const re = /\b([A-Za-z][a-z]+) +\1\b/gi; let m; while ((m = re.exec(line))) if (m[1] !== m[1].toUpperCase()) return true; return false; },
  },
  {
    // a copy key, or an id with two underscores or more (level_title_new_workbook); a handle like ctrl_z is a name
    rule: 'raw key',
    test: line => (line.match(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g) || []).some(w => !SNAKE_ALLOW.has(w) && (COPY_KEYS.has(w) || (w.match(/_/g) || []).length >= 2)),
  },
];

/** Every problem in a block of rendered text, one entry per offending line and rule. */
export function textProblems(text) {
  const out = [];
  for (const raw of String(text == null ? '' : text).split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    for (const r of RULES) if (r.test(line)) out.push({ rule: r.rule, line });
  }
  return out;
}

/**
 * Browser side: the text a learner reads on the current page (innerText plus aria-labels,
 * titles and placeholders), leaving out the sheet's cells, the formula bar and the status bar,
 * which hold the lesson's data rather than the site's words. Self-contained, so it can be passed
 * to page.evaluate as it is.
 */
export function readableText() {
  const SHEET = '.gridwrap, .fbar, .sbar';
  const hidden = [...document.querySelectorAll(SHEET)].map(el => [el, el.style.display]);
  hidden.forEach(([el]) => { el.style.display = 'none'; });
  const parts = [document.title, document.body.innerText];
  hidden.forEach(([el, d]) => { el.style.display = d; });
  for (const el of document.querySelectorAll('[aria-label],[title],[placeholder]')) {
    if (el.closest(SHEET)) continue;
    for (const a of ['aria-label', 'title', 'placeholder']) { const v = el.getAttribute(a); if (v) parts.push(v); }
  }
  return parts.join('\n');
}
