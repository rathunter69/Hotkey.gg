// app2/content/schema.js — the lesson data format, and a validator for it.
//
// A lesson is a plain ES module exporting one object:
//
// {
//   id: 'moving-around',                    unique, kebab-case (no numbers: the catalogue order numbers lessons)
//   chapter: 'foundations',                 chapter id (content/index.js)
//   section: 'Moving',                      the chapter section (CHAPTERS[].sections in content/index.js)
//   title: 'Moving around the worksheet',
//   difficulty: 'easy' | 'medium' | 'hard',
//   tags: ['navigation'],
//   access: 'free' | 'paid',
//   concepts: ['ctrl-arrow', 'home-key'],   concept ids TAUGHT here (see CONCEPTS below)
//   prerequisites: ['active-cell'],         lesson ids that must be completed first
//   read: 'What the lesson is. What you will do. Why it pays off at work.',   two or three sentences, total
//   sheet: { cells: {...}, active: {r,c}, colW: {...} },   the starting sheet (Sheet constructor options)
//   sheets: [{ name: 'Sheet1' }, { name: 'Sheet2', cells: {...} }],   optional workbook: names and extra sheets
//   par: 20,                                 timed-mode par, seconds
//   goals: [                                 sequential; each names a VISIBLE element of the sheet
//     { id: 'ctrl-down',
//       teach: 'Ctrl+↓ jumps to the edge of the data.',   one sentence, ONLY on the goal that first introduces
//                                                         a concept this lesson teaches (SITE_SPEC §4: adaptive,
//                                                         the teaching point rides the first use; reuse shows the action only)
//       text: 'Move from A3 (Monday) to A7 (Friday).',   the action, one sentence
//       keys: 'Ctrl+↓',                      the route as keycaps; shown with a teach line, else through Help
//       requires: ['ctrl-arrow'],            concept ids this goal needs (must be taught here or earlier)
//       check: (sheet, session) => boolean }, end-state predicate
//   ],
//   endState: [ { text, check } ],           optional extra predicates that must hold when the last goal lands
//   race: [ { goal: 'arrows', label: 'Arrow keys' }, { goal: 'ctrl-down', label: 'Ctrl+↓' } ],   optional: goal split times shown side by side
//   closing: ['sentence', …],                optional paragraphs on the completion overlay
//   solution: 'Ctrl+Down Ctrl+Right Home',   reference solution as keystrokes (parseKeyScript)
// }
//
// Goals are checked in order after every keystroke: goal i counts as done the first time its check
// passes while every earlier goal is already done, and the lesson is complete when the last goal
// lands and every endState predicate holds. A check may read the session's keyLog when the point of
// the goal is the mechanic itself (e.g. "use F2") — but only the key window: the runner sets
// session.goalMark to keyLog.length each time a goal lands, so a mechanic check reads
// keyLog.slice(session.goalMark || 0), the keys pressed since its goal became current. A key pressed
// for an earlier goal, or before the lesson began, never satisfies a later goal.
//
// Goals latch: once landed they stay landed (navigation lessons depend on it), so a lesson whose
// goals leave something on the sheet (a format, a border) should restate it in endState. The
// runner shows a failing endState as the pending item once every goal has landed.

import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { parseRef } from '../engine/refs.js';

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const ACCESS = ['free', 'paid'];
export const MODES = ['guided', 'solo', 'timed'];   // how a lesson is played; the Read phase precedes them

/** Concept ids and their display names — the vocabulary lessons teach and require. */
export const CONCEPTS = {
  'worksheet': 'the worksheet grid: columns A, B, C… and rows 1, 2, 3…',
  'cell-reference': 'a cell reference such as B3 (column letter, row number)',
  'active-cell': 'the active cell and its outline',
  'name-box': 'the Name Box shows the active cell reference',
  'formula-bar': 'the Formula Bar shows the contents of the active cell',
  'arrow-keys': 'the arrow keys move the active cell one cell at a time',
  'ctrl-arrow': 'Ctrl+Arrow jumps to the edge of the current data block',
  'home-key': 'Home moves to column A of the current row',
  'ctrl-home-end': 'Ctrl+Home goes to A1; Ctrl+End goes to the last used cell',
  'enter-tab-move': 'Enter moves down; Tab moves right',
  'range': 'a range is a rectangular block of cells, written B3:B7',
  'shift-arrow': 'Shift+Arrow extends the selection',
  'ctrl-shift-arrow': 'Ctrl+Shift+Arrow extends the selection to the edge of the data',
  'row-col-select': 'Shift+Space selects the row; Ctrl+Space selects the column',
  'ctrl-a': 'Ctrl+A selects the current region',
  'type-to-enter': 'typing into the active cell enters data',
  'enter-commits': 'Enter confirms an entry and moves down',
  'tab-commits': 'Tab confirms an entry and moves right',
  'escape-cancels': 'Escape discards an entry in progress',
  'text-vs-number': 'text aligns left; numbers align right',
  'delete-clears': 'Delete clears the contents of the selected cells',
  'edit-mode-f2': 'F2 opens the active cell for editing with the insertion point at the end',
  'edit-caret': 'in Edit mode the Left/Right arrow keys, Home and End move the insertion point',
  'backspace': 'Backspace deletes the character before the insertion point',
  'replace-by-typing': 'typing on a cell replaces its whole contents',
  'ribbon': 'the Ribbon: tabs of commands across the top of Excel',
  'keytips': 'Alt shows KeyTips; letters choose a tab, then a command',
  'home-tab': 'the Home tab holds the everyday formatting commands',
  'bold-command': 'Bold: Alt, H, 1 (or Ctrl+B)',
  'borders-menu': 'the Borders menu: Alt, H, B, then a border',
  'align-command': 'alignment commands: Alt, H, A, then L / C / R',
  'escape-backs-out': 'Escape backs out of the Ribbon one level at a time',
  'dialog-box': 'in Excel a dialog box stays open until you confirm (Enter/OK) or cancel (Esc)',
  'format-cells-dialog': 'the Format Cells dialog box: Ctrl+1',
  'number-formats': 'number formats change how a value is displayed, not the value',
  'ribbon-route-dialog': 'Alt, H, O, E opens Format Cells from the Ribbon',
  // How Excel works (Chapter 1, section 1)
  'workbook': 'a workbook is the Excel file; each worksheet in it is a tab along the bottom',
  'sheet-tabs': 'Ctrl+PgDn moves to the next worksheet, Ctrl+PgUp to the previous one',
  'go-to': 'Go To (Ctrl+G or F5) jumps to any reference you type: a cell, a range, or a cell on another sheet',
  'sheet-reference': 'a reference on another sheet names the sheet first: Costs!B3',
  'ribbon-tabs': 'the Ribbon tabs (Home, Page Layout, Formulas, Data, View…) each group related commands',
  'gridlines': 'View › Show › Gridlines (Alt, W, V, G) hides or shows the sheet gridlines',
  'excel-options': 'Excel Options (Alt, F, T) holds the settings that live outside the grid',
  'calc-mode': 'Workbook Calculation: Automatic recalculates on every change, Manual waits for F9',
  'iterative-calc': 'Enable iterative calculation lets a workbook resolve a circular reference, such as interest on an average balance',
  'quick-access-toolbar': 'the Quick Access Toolbar above the Ribbon: pinned commands, run with Alt then their number',
  'calculate-now': 'F9 recalculates the workbook (Calculate Now)',
  'page-setup': 'the Page Setup dialog box (Alt, P, S, P): orientation and scaling for printing',
  'orientation': 'Portrait or Landscape: which way the printed page turns',
  'fit-to-page': 'Fit to 1 page wide by 1 tall scales the print to a single page',
  'font-color': 'Font Color: Alt, H, F, C, then → to a swatch and Enter',
  'input-colour-convention': 'the model colour convention: hardcoded inputs blue, formulas black',
};

/** Sentences in a text: terminators followed by a space or the end (decimals like 5.0% and 1,200.00 are not terminators). */
export function sentenceCount(text) { return (String(text).match(/[.!?](?=\s|$)/g) || []).length; }
export function wordCount(text) { return String(text).trim().split(/\s+/).filter(Boolean).length; }

/** Validate a lesson object. Returns a list of problems (empty when valid); never throws. */
export function validateLesson(l) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  if (!l || typeof l !== 'object') return ['lesson must be an object'];
  need(typeof l.id === 'string' && /^[a-z0-9-]+$/.test(l.id), 'id must be kebab-case');
  need(typeof l.chapter === 'string' && l.chapter, 'chapter missing');
  need(typeof l.section === 'string' && l.section.trim(), 'section missing (the chapter section this lesson belongs to)');
  need(typeof l.title === 'string' && l.title.trim(), 'title missing');
  need(DIFFICULTIES.includes(l.difficulty), 'difficulty must be easy | medium | hard');
  need(Array.isArray(l.tags), 'tags must be an array');
  need(ACCESS.includes(l.access), 'access must be free | paid');
  need(Array.isArray(l.concepts) && l.concepts.length > 0, 'concepts must list what the lesson teaches');
  const concepts = Array.isArray(l.concepts) ? l.concepts : [];
  for (const c of concepts) need(CONCEPTS[c], `unknown concept "${c}"`);
  need(Array.isArray(l.prerequisites), 'prerequisites must be an array');
  need(isObject(l.sheet), 'sheet (starting sheet) missing');
  need(l.sheets === undefined || (Array.isArray(l.sheets) && l.sheets.every(isObject)), 'sheets must be an array of { name, cells } records');
  for (const sh of Array.isArray(l.sheets) ? l.sheets.filter(isObject) : []) need(typeof sh.name === 'string' && /^[^[\]:*?/\\]{1,31}$/.test(sh.name), `sheet name "${sh.name}" is not Excel-legal`);
  // The Read phase: two or three sentences, total (what the lesson is, what you will do, why it pays off).
  need(typeof l.read === 'string' && l.read.trim(), 'read missing (two or three sentences)');
  if (typeof l.read === 'string') { const n = sentenceCount(l.read); need(n >= 2 && n <= 3, `read must be two or three sentences (it has ${n})`); need(wordCount(l.read) <= 80, 'read is over 80 words'); need(!/`/.test(l.read) || true, ''); }
  need(typeof l.par === 'number' && l.par > 0, 'par (timed-mode seconds) missing');
  need(Array.isArray(l.goals) && l.goals.length > 0, 'goals missing');
  const goals = Array.isArray(l.goals) ? l.goals.filter(isObject) : [];
  const ids = new Set();
  const introduced = new Set();   // lesson concepts a goal has introduced so far
  for (const g of goals) {
    need(typeof g.id === 'string' && g.id, 'goal id missing'); need(!ids.has(g.id), `duplicate goal id ${g.id}`); ids.add(g.id);
    need(typeof g.text === 'string' && g.text.trim(), `goal ${g.id}: text missing`);
    if (typeof g.text === 'string') { need(sentenceCount(g.text) === 1 && /[.!?]$/.test(g.text.trim()), `goal ${g.id}: the action must be one sentence ending in a full stop`); need(wordCount(g.text) <= 26, `goal ${g.id}: the action is over 26 words`); }
    need(typeof g.check === 'function', `goal ${g.id}: check must be a function`);
    need(Array.isArray(g.requires), `goal ${g.id}: requires must list concept ids`);
    for (const c of Array.isArray(g.requires) ? g.requires : []) need(CONCEPTS[c], `goal ${g.id}: unknown concept "${c}"`);
    need(typeof g.keys === 'string' && g.keys.trim(), `goal ${g.id}: keys (the route as keycaps) missing`);
    // Adaptive rule (SITE_SPEC §4): the goal that first uses a concept this lesson teaches carries the
    // one-line teaching point; a goal that only reuses taught concepts carries none.
    const fresh = (Array.isArray(g.requires) ? g.requires : []).filter(c => concepts.includes(c) && !introduced.has(c));
    if (fresh.length) { need(typeof g.teach === 'string' && g.teach.trim(), `goal ${g.id}: introduces ${fresh.join(', ')} and needs a one-line teach`); fresh.forEach(c => introduced.add(c)); }
    else if (Array.isArray(l.concepts) && Array.isArray(g.requires)) need(g.teach === undefined, `goal ${g.id}: reuses taught concepts only, so it must not carry a teach line`);
    if (typeof g.teach === 'string') { need(sentenceCount(g.teach) === 1 && /[.!?]$/.test(g.teach.trim()), `goal ${g.id}: teach must be one sentence ending in a full stop`); need(wordCount(g.teach) <= 30, `goal ${g.id}: teach is over 30 words`); }
  }
  need(l.race === undefined || (Array.isArray(l.race) && l.race.length === 2 && l.race.every(r => isObject(r) && ids.has(r.goal) && typeof r.label === 'string')), 'race must name two goals with labels');
  need(l.closing === undefined || (Array.isArray(l.closing) && l.closing.every(t => typeof t === 'string')), 'closing must be an array of paragraphs');
  need(l.endState === undefined || Array.isArray(l.endState), 'endState must be an array');
  const ends = Array.isArray(l.endState) ? l.endState.filter(isObject) : [];
  for (const e of ends) { need(typeof e.text === 'string', 'endState entries need text'); need(typeof e.check === 'function', 'endState entries need a check'); }
  need(typeof l.solution === 'string' && l.solution.trim(), 'solution keystrokes missing');
  if (isObject(l.sheet)) validateStartingSheet(l.sheet, goals, ends, need);
  return errs;
}

/**
 * Build the starting sheet and run every check against it: a cell key that does not parse, an
 * active cell outside rows×cols, a sheet that does not build, a check that throws, and a first goal
 * the starting sheet already satisfies (nothing for the learner to do) are all reported. Later goals
 * may legitimately hold at the start — they are gated behind the earlier ones.
 */
function validateStartingSheet(spec, goals, ends, need) {
  const cells = isObject(spec.cells) ? spec.cells : {};
  need(spec.cells === undefined || isObject(spec.cells), 'sheet: cells must be an object of cell records');
  for (const k in cells) { need(parseRef(k), `sheet: bad cell key "${k}"`); need(isObject(cells[k]), `sheet: cell ${k} must be a record such as { value }`); }
  const rows = spec.rows || 100, cols = spec.cols || 26;   // the Sheet defaults
  if (spec.active !== undefined) {
    const a = spec.active;
    need(isObject(a) && Number.isInteger(a.r) && Number.isInteger(a.c) && a.r >= 1 && a.r <= rows && a.c >= 1 && a.c <= cols, `sheet: active ${JSON.stringify(a)} is outside the ${rows}×${cols} grid`);
  }
  let sheet, session;
  try { sheet = new Sheet({ rows: spec.rows, cols: spec.cols, cells, colW: spec.colW, active: spec.active }); session = new Session(sheet, {}); }
  catch (e) { need(false, `sheet does not build: ${e.message}`); return; }
  session.goalMark = 0;
  const probe = (label, check) => {
    if (typeof check !== 'function') return null;
    try { return !!check(sheet, session); } catch (e) { need(false, `${label}: check throws on the starting sheet (${e.message})`); return null; }
  };
  goals.forEach((g, i) => { const ok = probe(`goal ${g.id}`, g.check); if (i === 0) need(ok !== true, `goal ${g.id}: already satisfied by the starting sheet`); });
  for (const e of ends) probe(`endState "${e.text}"`, e.check);
}

const isObject = v => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Every concept available to a lesson: its own plus its prerequisites', transitively. */
export function availableConcepts(lesson, byId, seen = new Set()) {
  const out = new Set(lesson.concepts || []);
  for (const pid of lesson.prerequisites || []) {
    if (seen.has(pid)) continue; seen.add(pid);
    const p = byId[pid]; if (!p) continue;
    for (const c of availableConcepts(p, byId, seen)) out.add(c);
  }
  return out;
}
