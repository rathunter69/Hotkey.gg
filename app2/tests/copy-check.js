// app2/tests/copy-check.js — the copy rules (npm run check). Fails on a violation and prints the row.
//   node app2/tests/copy-check.js            check the CSVs in content/copy
//   node app2/tests/copy-check.js <dir>      check the CSVs in another folder (copy-import uses this)
// Rules:
//   R1  every module lesson, challenge, project and assessment in the catalog has a lessons.csv row (warn: the JS copy is the fallback;
//       legacy lessons without a `module` keep their JS copy until the rewrite replaces them)
//   R2  every goal of every module lesson has a goals.csv row (warn, same fallback)
//   R3  brief ≤ 5 sentences and ≤ 110 words (M28); a lesson's brief ends "The key is `X`." (challenges, projects and assessments don't)
//   R4  goal text names a visible thing: a cell ref or range, a sheet name, a quoted label, or a Ribbon command / keycap
//   R5  no British spellings: colour, practise, centre, organise (and their forms)
//   R6  no "house style"
//   R7  no "first-year" / "first year" assumption
//   R8  goal text ≤ 140 characters
//   R9  why is retired (M28): a filled why warns
//   R10 goal text is one sentence ending in a full stop; teach is up to three sentences (M28)
//   R11 site.csv carries every key the screens read
//   R12 micro.csv carries a row for every micro-drill (warn: the drill keeps its JS prompt)
//   R13 a lesson goal's stuck cue reads "pulse <target> · <one subtle line>" (M27)
//   R14 no tells in anything a learner reads (M94; content/copy/tells.js): a dash as punctuation, an emoji or
//       icon symbol, facts joined by middle dots or pipes, a word in capitals off the whitelist
// Rows written before the screenplay (content/copy/legacy.js) report R3, R13 and R14 as warnings until
// run R1 rewrites them.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCopyDir, COPY_DIR } from './copy-build.js';
import { LESSONS } from '../content/index.js';
import { WORKBOOKS } from '../content/workbooks/index.js';
import { RIBBON_WORDS, SITE_KEYS } from '../content/copy/rules.js';
import { MICRO } from '../app/schedule.js';
import { tells } from '../content/copy/tells.js';
import { LEGACY_LESSONS, LEGACY_MODULES, LEGACY_SITE, LEGACY_MICRO } from '../content/copy/legacy.js';

export const BRITISH = /\b(colou?r(?:ed|ing|s)?\b(?<=colour\w*)|colour\w*|practis(?:e|es|ed|ing)|centre\w*|organis(?:e|es|ed|ing|ation)|recognis\w*|analys(?:e|ed|es|ing)\b|grey\b|favour\w*|licence|behaviour\w*|utilis\w*|programme\b)/i;
export const HOUSE_STYLE = /\bhouse style\b/i;
export const FIRST_YEAR = /\bfirst[- ]year\b/i;

export function sentenceCount(text) {
  const t = String(text).replace(/#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/gi, 'ERR').replace(/\b(?:w\/c|e\.g|i\.e|vs|No|Inc|Mr|Ms|Dr)\./g, 'x');
  return (t.match(/[.!?](?:\s|$)/g) || []).length || (t.trim() ? 1 : 0);
}
/** A stuck cue's two displayed parts: the target after "pulse " and the one subtle line after the separator. */
export function stuckParts(s) {
  const m = String(s || '').match(/^pulse (.*?) \u00B7 (.*)$/);
  return m ? [m[1], m[2]] : [String(s || '')];
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
  // R14: the tells, on every field a learner reads; a legacy row warns instead of failing
  const tellFields = (where, fields, legacy) => {
    for (const [name, v] of fields) {
      if (!v) continue;
      const parts = name === 'hint_stuck' ? stuckParts(v) : String(v).split(/\s*\|\|\s*/);
      for (const part of parts) for (const why of tells(part)) (legacy ? warn : err)('R14', where, `${name}: ${why}: "${part}"`);
    }
  };
  const textFields = (where, fields) => {
    for (const [name, v] of fields) {
      if (!v) continue;
      if (BRITISH.test(v)) err('R5', where, `${name}: British spelling — "${v.match(BRITISH)[0]}"`);
      if (HOUSE_STYLE.test(v)) err('R6', where, `${name}: "house style"`);
      if (FIRST_YEAR.test(v)) err('R7', where, `${name}: assumes a first-year analyst`);
    }
  };
  const kindOf = id => { const l = lessons.find(x => x.id === id); return l ? (l.kind || 'lesson') : 'lesson'; };
  for (const id in copy.lessons) {
    const r = copy.lessons[id]; const where = `lessons.csv ${id}`; const legacy = LEGACY_LESSONS.has(id);
    const r3 = legacy ? warn : err;
    if (r.brief) {
      const n = sentenceCount(r.brief), w = wordCount(r.brief);
      if (n > 5) r3('R3', where, `brief has ${n} sentences: "${r.brief}"`);
      if (w > 110) r3('R3', where, `brief has ${w} words: "${r.brief}"`);
      if (kindOf(id) === 'lesson' && !/The key is `[^`]+`\.$/.test(r.brief.trim())) r3('R3', where, `a lesson's brief ends "The key is \`X\`.": "${r.brief}"`);
    }
    textFields(where, [['title', r.title], ['brief', r.brief], ['closing', r.closing], ['wow', r.wow], ['convention_line', r.convention_line], ['mac_note', r.mac_note], ['story_beat', r.story_beat]]);
    tellFields(where, [['title', r.title], ['brief', r.brief], ['closing', r.closing], ['wow', r.wow], ['convention_line', r.convention_line], ['mac_note', r.mac_note], ['story_beat', r.story_beat]], legacy);
  }
  for (const id in copy.goals) for (const g of copy.goals[id]) {
    const where = `goals.csv ${id} #${g.goal_index}`;
    if (g.text) {
      if (g.text.length > 140) err('R8', where, `text is ${g.text.length} chars: "${g.text}"`);
      if (!namesVisibleThing(g.text)) err('R4', where, `text names nothing visible (a cell, a sheet, a quoted label, a Ribbon command or key): "${g.text}"`);
      if (sentenceCount(g.text) > 2 || !/[.!?]$/.test(g.text.trim())) err('R10', where, `text must be one action sentence ending in a full stop: "${g.text}"`);
    }
    const legacy = LEGACY_LESSONS.has(id);
    if (g.why && !legacy) warn('R9', where, `the why field is retired (M28); fold it into the teach line: "${g.why}"`);
    if (g.teach && sentenceCount(g.teach) > 3) err('R10', where, `teach is up to three sentences: "${g.teach}"`);
    if (g.hint_stuck && !/^pulse \S.* \u00B7 \S/.test(g.hint_stuck)) (legacy ? warn : err)('R13', where, `stuck cue reads "pulse <target> · <one subtle line>": "${g.hint_stuck}"`);
    if (!legacy && kindOf(id) === 'lesson' && g.text && !g.hint_stuck) warn('R13', where, 'no stuck cue');
    textFields(where, [['text', g.text], ['teach', g.teach], ['why', g.why], ['hint_stuck', g.hint_stuck]]);
    tellFields(where, [['text', g.text], ['teach', g.teach], ['hint_stuck', g.hint_stuck]], legacy);
  }
  for (const id in copy.modules) {
    const m = copy.modules[id]; const f = [['name', m.name], ['objective', m.objective], ['story_beat', m.story_beat], ['page_name', m.page_name]];
    textFields(`modules.csv ${id}`, f); tellFields(`modules.csv ${id}`, f, LEGACY_MODULES.has(id));
  }
  for (const k in copy.site) { textFields(`site.csv ${k}`, [['text', copy.site[k]]]); tellFields(`site.csv ${k}`, [['text', copy.site[k]]], LEGACY_SITE.has(k)); }
  for (const k of SITE_KEYS) if (!(k in copy.site)) warn('R11', `site.csv ${k}`, 'missing key (the screen falls back to its built-in line)');
  for (const id in copy.micro || {}) { const m = copy.micro[id]; textFields(`micro.csv ${id}`, [['prompt', m.prompt], ['teach', m.teach]]); tellFields(`micro.csv ${id}`, [['prompt', m.prompt], ['teach', m.teach]], LEGACY_MICRO.has(id)); if (m.teach && sentenceCount(m.teach) > 3) err('R10', `micro.csv ${id}`, `teach is up to three sentences: "${m.teach}"`); }
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
