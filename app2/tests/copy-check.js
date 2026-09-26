// app2/tests/copy-check.js — the copy rules (npm run check). Fails on a violation and prints the row.
//   node app2/tests/copy-check.js            check the CSVs in content/copy
//   node app2/tests/copy-check.js <dir>      check the CSVs in another folder (copy-import uses this)
// Rules:
//   R1  every module lesson, challenge, project and assessment in the catalog has a lessons.csv row (warn: the JS copy is the fallback;
//       legacy lessons without a `module` keep their JS copy until the rewrite replaces them)
//   R2  every goal of every module lesson has a goals.csv row (warn, same fallback)
//   R3  brief ≤ 3 sentences and ≤ 70 words
//   R4  goal text names a visible thing: a cell ref or range, a sheet name, a quoted label, or a Ribbon command / keycap
//   R5  no British spellings: colour, practise, centre, organise (and their forms)
//   R6  no "house style"
//   R7  no "first-year" / "first year" assumption
//   R8  goal text ≤ 140 characters
//   R9  why ≤ 110 characters
//   R10 goal text is one sentence ending in a full stop; teach and why are one sentence
//   R11 site.csv carries every key the screens read
//   R12 micro.csv carries a row for every micro-drill (warn: the drill keeps its JS prompt)
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCopyDir, COPY_DIR } from './copy-build.js';
import { LESSONS } from '../content/index.js';
import { WORKBOOKS } from '../content/workbooks/index.js';
import { RIBBON_WORDS, SITE_KEYS } from '../content/copy/rules.js';
import { MICRO } from '../app/schedule.js';

export const BRITISH = /\b(colou?r(?:ed|ing|s)?\b(?<=colour\w*)|colour\w*|practis(?:e|es|ed|ing)|centre\w*|organis(?:e|es|ed|ing|ation)|recognis\w*|analys(?:e|ed|es|ing)\b|grey\b|favour\w*|licence|behaviour\w*|utilis\w*|programme\b)/i;
export const HOUSE_STYLE = /\bhouse style\b/i;
export const FIRST_YEAR = /\bfirst[- ]year\b/i;

export function sentenceCount(text) {
  const t = String(text).replace(/#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/gi, 'ERR').replace(/\b(?:w\/c|e\.g|i\.e|vs|No|Inc|Mr|Ms|Dr)\./g, 'x');
  return (t.match(/[.!?](?:\s|$)/g) || []).length || (t.trim() ? 1 : 0);
}
export const wordCount = text => String(text).trim().split(/\s+/).filter(Boolean).length;

const sheetNames = (() => {
  const names = new Set(['Raw', 'Inputs', 'Costs', 'Report', 'Sheet2', 'Old wk37', 'Notes']);
  for (const id in WORKBOOKS) { try { const st = WORKBOOKS[id].STATES || {}; for (const k in st) for (const sh of st[k].sheets || []) names.add(sh.name); } catch (e) { /* ignore */ } }
  return [...names];
})();
const REF = /\b\$?[A-Z]{1,2}\$?\d{1,3}(?::\$?[A-Z]{1,2}\$?\d{1,3})?\b|\b[A-Z]{1,2}:[A-Z]{1,2}\b|\brow \d+\b|\bcolumn [A-Z]\b|\brows? \d+[–-]\d+\b/;
const QUOTED = /[“"'‘][^”"'’]{1,60}[”"'’]/;
const KEYCAP = /\b(?:Ctrl|Alt|Shift|F\d|Esc|Enter|Tab|Home|End|PgUp|PgDn|Delete|Backspace)\b|[↑↓←→↵]|`[^`]+`/;

/** R4 — does a goal name something the learner can see? Pure. */
export function namesVisibleThing(text) {
  const t = String(text || '');
  if (REF.test(t) || QUOTED.test(t) || KEYCAP.test(t)) return true;
  if (sheetNames.some(n => new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t))) return true;
  return RIBBON_WORDS.some(w => new RegExp('\\b' + w + '\\b', 'i').test(t));
}

/** Every finding: { level: 'error' | 'warn', rule, where, text }. Pure over the copy and the catalog. */
export function checkCopy(copy, lessons = LESSONS) {
  const out = [];
  const err = (rule, where, text) => out.push({ level: 'error', rule, where, text });
  const warn = (rule, where, text) => out.push({ level: 'warn', rule, where, text });
  const live = lessons.filter(l => typeof l.module === 'string' && l.module !== 'welcome');
  for (const l of live) {
    const row = copy.lessons[l.id];
    if (!row) { warn('R1', l.id, 'no lessons.csv row (the JS copy is the fallback)'); continue; }
    const goalRows = copy.goals[l.id] || [];
    (l.goals || []).forEach((g, i) => { if (!goalRows.some(r => Number(r.goal_index) === i)) warn('R2', `${l.id} goal ${i}`, 'no goals.csv row (the JS copy is the fallback)'); });
  }
  const textFields = (where, fields) => {
    for (const [name, v] of fields) {
      if (!v) continue;
      if (BRITISH.test(v)) err('R5', where, `${name}: British spelling — "${v.match(BRITISH)[0]}"`);
      if (HOUSE_STYLE.test(v)) err('R6', where, `${name}: "house style"`);
      if (FIRST_YEAR.test(v)) err('R7', where, `${name}: assumes a first-year analyst`);
    }
  };
  for (const id in copy.lessons) {
    const r = copy.lessons[id]; const where = `lessons.csv ${id}`;
    if (r.brief) {
      const n = sentenceCount(r.brief), w = wordCount(r.brief);
      if (n > 3) err('R3', where, `brief has ${n} sentences: "${r.brief}"`);
      if (w > 70) err('R3', where, `brief has ${w} words: "${r.brief}"`);
    }
    textFields(where, [['title', r.title], ['brief', r.brief], ['closing', r.closing], ['wow', r.wow], ['convention_line', r.convention_line], ['mac_note', r.mac_note], ['story_beat', r.story_beat]]);
  }
  for (const id in copy.goals) for (const g of copy.goals[id]) {
    const where = `goals.csv ${id} #${g.goal_index}`;
    if (g.text) {
      if (g.text.length > 140) err('R8', where, `text is ${g.text.length} chars: "${g.text}"`);
      if (!namesVisibleThing(g.text)) err('R4', where, `text names nothing visible (a cell, a sheet, a quoted label, a Ribbon command or key): "${g.text}"`);
      if (sentenceCount(g.text) > 2 || !/[.!?]$/.test(g.text.trim())) err('R10', where, `text must be one action sentence ending in a full stop: "${g.text}"`);
    }
    if (g.why && g.why.length > 110) err('R9', where, `why is ${g.why.length} chars: "${g.why}"`);
    if (g.teach && sentenceCount(g.teach) > 1) err('R10', where, `teach must be one sentence: "${g.teach}"`);
    if (g.why && sentenceCount(g.why) > 1) err('R10', where, `why must be one sentence: "${g.why}"`);
    textFields(where, [['text', g.text], ['teach', g.teach], ['why', g.why], ['hint_stuck', g.hint_stuck]]);
  }
  for (const id in copy.modules) { const m = copy.modules[id]; textFields(`modules.csv ${id}`, [['name', m.name], ['objective', m.objective], ['story_beat', m.story_beat], ['page_name', m.page_name]]); }
  for (const k in copy.site) textFields(`site.csv ${k}`, [['text', copy.site[k]]]);
  for (const k of SITE_KEYS) if (!(k in copy.site)) warn('R11', `site.csv ${k}`, 'missing key (the screen falls back to its built-in line)');
  for (const id in copy.micro || {}) { const m = copy.micro[id]; textFields(`micro.csv ${id}`, [['prompt', m.prompt], ['teach', m.teach]]); if (m.teach && sentenceCount(m.teach) > 1) err('R10', `micro.csv ${id}`, `teach must be one sentence: "${m.teach}"`); }
  if (copy.micro) for (const id in MICRO) if (!copy.micro[id]) warn('R12', `micro.csv ${id}`, 'missing row (the drill keeps its JS prompt)');
  return out;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dir = process.argv[2] && !process.argv[2].startsWith('--') ? resolve(process.argv[2]) : COPY_DIR;
  const findings = checkCopy(readCopyDir(dir));
  for (const f of findings) console[f.level === 'error' ? 'error' : 'log'](`${f.level.toUpperCase()} ${f.rule} · ${f.where}: ${f.text}`);
  const errors = findings.filter(f => f.level === 'error').length, warns = findings.length - errors;
  if (errors) { console.error(`CHECK FAILED: copy-check found ${errors} violation(s) (${warns} warning(s))`); process.exit(1); }
  console.log(`copy-check ok: 0 violations, ${warns} warning(s)`);
}
