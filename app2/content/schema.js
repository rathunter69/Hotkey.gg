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
//   race: [ { label: 'Down the list', slow: 'watch-crawl', fast: 'ctrl-up' } ],   optional: pairs of goals whose split times are shown side by side
//   a goal may instead be a demo the platform plays while the learner watches (the Welcome lesson):
//     { id: 'watch-crawl', demo: { script: 'Down Down …', cadence: 120 }, text: 'Watch: …', requires: [...], check: (s, ses) => ses.demoDone.has('watch-crawl') }
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
import { CONVENTIONS } from './conventions.js';
import { WORKBOOKS, workbookState, applyStatePatch } from './workbooks/index.js';
import { mulberry32 } from '../engine/rng.js';

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const ACCESS = ['free', 'paid'];
export const MODES = ['guided', 'solo', 'timed', 'challenge'];   // how a lesson is played; the Brief precedes them
export const KINDS = ['lesson', 'project', 'assessment', 'testout', 'challenge'];   // + C2: the module's timed, seeded challenge

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
  'rename-sheet': 'Rename Sheet (Alt, H, O, R, or double-click the tab) opens the tab\'s name selected: type the new one and press Enter',
  'insert-sheet': 'Shift+F11 (or Alt, H, I, S) inserts a new worksheet in front of the active one and makes it active',
  'delete-sheet': 'Delete Sheet (Alt, H, D, S) removes the active worksheet; one that holds anything asks you to confirm, and it cannot be undone',
  'move-sheet': 'Move or Copy Sheet (Alt, H, O, M): ↑ ↓ pick the sheet it goes before, or (move to end); C ticks Create a copy',
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
  // Moving and selecting, beyond the basics (phase C)
  'page-keys': 'PgDn and PgUp move a screen down and up; Alt+PgDn and Alt+PgUp a screen right and left',
  'select-all-sheet': 'Ctrl+A selects the current region; pressed again it selects the whole sheet',
  'go-to-special': 'Go To Special (Alt, H, F, D, S) selects every blank, constant or formula cell inside the selection',
  // Entering and editing (phase C)
  'undo-redo': 'Ctrl+Z undoes the last change; Ctrl+Y redoes it',
  'fill-down-right': 'Ctrl+D fills the selection from its top row; Ctrl+R fills it from its left column',
  'ctrl-enter-fill': 'Ctrl+Enter commits an entry into every selected cell at once',
  'find-replace': 'Find (Ctrl+F) jumps to matching text; Replace (Ctrl+H) swaps it out everywhere',
  // Rows, columns and sheets (phase C)
  'insert-delete-rows': 'Ctrl+Shift+= inserts and Ctrl+- deletes the selected whole rows or columns',
  'column-width': 'Column Width (Alt, H, O, W) sets the selected columns\' width in Excel units',
  'row-height': 'Row Height (Alt, H, O, H) sets the selected rows\' height in points',
  'autofit': 'AutoFit (Alt, H, O, I for width, Alt, H, O, A for height) sizes to the content',
  'hide-unhide': 'Ctrl+9 hides the selected rows and Ctrl+0 the columns; Ctrl+Shift+( and Ctrl+Shift+) unhide inside the selection',
  'freeze-panes': 'Freeze Panes (Alt, W, F) keeps the rows above and columns left of the seam in view',
  // The Ribbon and dialogs (phase C)
  'format-cells-tabs': 'the Format Cells categories answer to their first letter: N Number, C Currency, P Percentage, A Center Across',
  'bold-italic-underline': 'Ctrl+B bold, Ctrl+I italic, Ctrl+U underline — and Alt, H, 1 / 2 / 3 from the Ribbon',
  'fills-and-colours': 'Fill Color is Alt, H, H then a letter or arrows; a fill marks a cell, never its value',
  'center-across': 'Center Across Selection (Format Cells, A) centres a title over columns without merging cells',
  // Basic formulas (phase C)
  'formula-basics': 'a formula starts with = and recalculates whenever its inputs change',
  'formula-operators': 'the arithmetic operators: + - * / and parentheses to group',
  'sum-family': 'SUM, AVERAGE, MIN, MAX and COUNT each take a range: =SUM(B3:B7)',
  'autosum': 'AutoSum (Alt+=) proposes =SUM over the numbers above or to the left; Enter accepts it',
  'relative-absolute': 'a relative reference (B3) shifts when copied; $ anchors it: $B$3 never moves',
  'f4-anchor': 'F4 cycles the anchors on the reference at the insertion point: B3, $B$3, B$3, $B3',
  'cross-sheet-ref': 'a reference on another sheet names the sheet first: =Costs!B3',
  'formula-errors': '#DIV/0!, #NAME?, #VALUE! and #REF! each say what broke: the input, the name, the type, the reference',
  // Copy, paste and fill (phase C)
  'copy-cut-paste': 'Ctrl+C copies, Ctrl+X cuts, Ctrl+V pastes at the selection; Esc drops the marquee',
  'paste-enter-drop': 'after a copy, Enter pastes once and drops the marquee',
  'paste-special': 'Paste Special (Ctrl+Alt+V) pastes one aspect: values V, formats T, transpose E, or an operation',
  'fill-series': 'Fill Series (Alt, H, F, I, S) continues the step your first two cells set',
  'flash-fill': 'Flash Fill (Ctrl+E in Excel) fills a column by the pattern of your examples',
  'qat-run': 'Alt then a number runs that Quick Access Toolbar command from anywhere',
  // C2 (Project Volt): the module lessons' additions
  'enter-tab-direction': 'Tab commits and moves right; Enter after a Tab run returns to the column you started in, one row down',
  'replace-all': 'Replace All (Ctrl+H, then Alt+A) swaps every match on the sheet in one step and reports how many cells changed',
  'group-ungroup': 'Alt+Shift+→ groups the selected whole rows or columns into an outline that folds and unfolds; Alt+Shift+← ungroups',
  'show-formulas': 'Ctrl+` shows every formula\'s text in place of its value; press it again to return',
  'print-titles': 'Page Setup › Sheet: the rows to repeat at the top of every printed page, and the footer with its file, date and page fields',
  'pointing': 'while a formula is open, an arrow key points at a cell and writes its reference for you',
  'counta': 'COUNT counts numbers; COUNTA counts every non-empty cell, text included',
  'check-cell': 'a check cell is a live difference between two things that must agree, so it reads 0 when they tie',
  'audit-pass': 'the audit pass: Go To Special, show formulas and tracing find what a reviewer would',
};

/**
 * How many goals a lesson of this kind may carry. Module lessons (C2, framework v2) run denser:
 * one job of 5-8 goals; challenges 4-7; projects 10-15. The legacy bounds hold for the old
 * lessons until the rewrite deletes them. A lesson's closer (goal.closer, the "does it tie"
 * beat the platform plays at the end) is not counted: countedGoals() leaves it out.
 */
export function goalBounds(kind, moduleLesson = false) {
  if (moduleLesson) {
    return { lesson: { min: 5, max: 8 }, challenge: { min: 4, max: 7 }, project: { min: 10, max: 15 }, assessment: { min: 8, max: 14 }, testout: { min: 8, max: 10 } }[kind || 'lesson'] || { min: 5, max: 8 };
  }
  return kind && kind !== 'lesson' ? { min: 3, max: 10 } : { min: 3, max: 6 };
}

/** The goals that count towards the band: every goal but the closer. */
export const countedGoals = goals => (Array.isArray(goals) ? goals : []).filter(g => !(g && g.closer));

/** Sentences in a text: terminators followed by a space or the end. Decimals (5.0%, 1,200.00) and Excel error codes (#NAME?, #DIV/0!) are not terminators. */
export function sentenceCount(text) {
  const t = String(text).replace(/#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/gi, 'ERR');
  return (t.match(/[.!?](?=\s|$)/g) || []).length;
}
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
  const kind = l.kind === undefined ? 'lesson' : l.kind;
  const moduleLesson = typeof l.module === 'string' && l.module.length > 0;   // C2 framework v2
  need(KINDS.includes(kind), 'kind must be lesson | project | assessment | testout | challenge');
  if (kind === 'assessment' || kind === 'testout') need(typeof l.timeLimit === 'number' && l.timeLimit > 0, kind + ' needs a timeLimit (seconds)');
  else if (kind === 'challenge') need(typeof l.timeLimit === 'number' && l.timeLimit >= 150 && l.timeLimit <= 180, 'a challenge needs a timeLimit of 150-180 seconds');
  else need(l.timeLimit === undefined, 'only an assessment, test-out or challenge carries a timeLimit');
  // v2 renames concepts → teaches; the alias holds through the migration. A project, assessment,
  // test-out or challenge combines taught material: it may teach nothing new.
  const conceptsRaw = l.teaches !== undefined ? l.teaches : l.concepts;
  need(kind === 'lesson'
    ? Array.isArray(conceptsRaw) && conceptsRaw.length > 0
    : conceptsRaw === undefined || Array.isArray(conceptsRaw), 'teaches/concepts must list what the lesson teaches');
  const concepts = Array.isArray(conceptsRaw) ? conceptsRaw : [];
  for (const c of concepts) need(CONCEPTS[c], `unknown concept "${c}"`);
  if (l.uses !== undefined) { need(Array.isArray(l.uses), 'uses must be an array of concept ids'); for (const c of Array.isArray(l.uses) ? l.uses : []) need(CONCEPTS[c], `unknown concept in uses: "${c}"`); }
  need(Array.isArray(l.prerequisites) || moduleLesson, 'prerequisites must be an array');
  if (moduleLesson) {
    need(WORKBOOKS[l.workbook], `unknown workbook "${l.workbook}" (content/workbooks)`);
    need(isObject(l.state) && typeof l.state.before === 'string', 'a module lesson needs state.before');
    need(kind === 'challenge' || typeof l.state.after === 'string', 'a module lesson needs state.after');
    if (kind !== 'challenge') {
      need(typeof l.headline === 'string' && l.headline.trim(), 'headline (the one concept the lesson exists to teach) missing');
      need(Array.isArray(l.conventions) && l.conventions.length > 0 && l.conventions.every(id => CONVENTIONS[id]), 'every module lesson carries at least one canon convention id');
    } else if (l.conventions !== undefined) {
      need(Array.isArray(l.conventions) && l.conventions.every(id => CONVENTIONS[id]), 'challenge conventions must be canon ids');
    }
    need(typeof l.minutes === 'number' && l.minutes > 0 && l.minutes <= 15, 'minutes (5-7 for lessons, 2-3 for challenges) missing');
  }
  if (kind === 'challenge') {
    need(typeof l.seed === 'function', 'a challenge is a generator: seed(rng) → patch');
    need(Array.isArray(l.graders) && l.graders.length > 0 && l.graders.every(g => typeof g === 'function'), 'a challenge carries graders: [(session) => {ok, why}]');
    need(isObject(l.pars) && l.pars.pass > l.pars.pro && l.pars.pro > l.pars.legendary && l.pars.legendary > 0, 'challenge pars must fall strictly: pass > pro > legendary > 0');
    for (const g of Array.isArray(l.goals) ? l.goals : []) need(g && g.teach === undefined, 'a challenge goal carries no teach line');
  }
  need(isObject(l.sheet) || moduleLesson, 'sheet (starting sheet) missing');
  need(l.sheets === undefined || (Array.isArray(l.sheets) && l.sheets.every(isObject)), 'sheets must be an array of { name, cells } records');
  for (const sh of Array.isArray(l.sheets) ? l.sheets.filter(isObject) : []) need(typeof sh.name === 'string' && /^[^[\]:*?/\\]{1,31}$/.test(sh.name), `sheet name "${sh.name}" is not Excel-legal`);
  if (moduleLesson) {
    // The Brief (v2): the situation, the task, the payoff — at most three sentences, ending in
    // the headline keycap; a challenge carries one line.
    need(typeof l.brief === 'string' && l.brief.trim(), 'brief missing');
    if (typeof l.brief === 'string') {
      const n = sentenceCount(l.brief);
      if (kind === 'challenge') need(n <= 2 && wordCount(l.brief) <= 40, 'a challenge brief is one line');
      else {
        need(n >= 1 && n <= 3, `brief must be at most three sentences (it has ${n})`);
        need(wordCount(l.brief) <= 70, 'brief is over 70 words');
        need(/`[^`]+`[.!]?\s*$/.test(l.brief.trim()), 'the brief ends with the headline keycap (`Ctrl+…`)');
      }
    }
  } else {
    // The Read phase (legacy): two or three sentences, total.
    need(typeof l.read === 'string' && l.read.trim(), 'read missing (two or three sentences)');
    if (typeof l.read === 'string') { const n = sentenceCount(l.read); need(n >= 2 && n <= 3, `read must be two or three sentences (it has ${n})`); need(wordCount(l.read) <= 80, 'read is over 80 words'); }
  }
  if (kind === 'challenge') need(l.par === undefined, 'a challenge carries pars, not par');
  else if (!moduleLesson) need(typeof l.par === 'number' && l.par > 0, 'par (timed-mode seconds) missing');
  need(Array.isArray(l.goals) && l.goals.length > 0, 'goals missing');
  const goals = Array.isArray(l.goals) ? l.goals.filter(isObject) : [];
  const ids = new Set();
  const introduced = new Set();   // lesson concepts a goal has introduced so far
  for (const g of goals) {
    need(typeof g.id === 'string' && g.id, 'goal id missing'); need(!ids.has(g.id), `duplicate goal id ${g.id}`); ids.add(g.id);
    need(typeof g.text === 'string' && g.text.trim(), `goal ${g.id}: text missing`);
    if (typeof g.text === 'string') {
      // one action sentence; the closer may open with its question ("Does it tie? Watch …")
      const n = sentenceCount(g.text);
      need((g.closer ? n >= 1 && n <= 2 : n === 1) && /[.!?]$/.test(g.text.trim()), `goal ${g.id}: the action must be one sentence ending in a full stop`);
      need(wordCount(g.text) <= 26, `goal ${g.id}: the action is over 26 words`);
    }
    need(typeof g.check === 'function', `goal ${g.id}: check must be a function`);
    need(Array.isArray(g.requires) || kind === 'challenge', `goal ${g.id}: requires must list concept ids`);
    for (const c of Array.isArray(g.requires) ? g.requires : []) need(CONCEPTS[c], `goal ${g.id}: unknown concept "${c}"`);
    if (g.convention !== undefined) need(CONVENTIONS[g.convention], `goal ${g.id}: unknown convention "${g.convention}"`);
    if (g.closer !== undefined) {
      // The "does it tie" closer (C2 addendum): the last goal, played by the platform as a ghost —
      // it perturbs an input, the learner watches the sheet answer, the sheet goes back as it was.
      need(g.closer === true && moduleLesson && kind === 'lesson', `goal ${g.id}: closer is only a module lesson's last goal`);
      need(goals[goals.length - 1] === g, `goal ${g.id}: the closer must be the last goal`);
      need(isObject(g.demo), `goal ${g.id}: a closer is a demo the platform plays (demo: { script })`);
    }
    if (g.demo !== undefined) {
      need(isObject(g.demo) && typeof g.demo.script === 'string' && g.demo.script.trim(), `goal ${g.id}: demo needs a script`);
      need(g.demo === undefined || g.keys === undefined, `goal ${g.id}: a demo goal has no keys (the platform presses them)`);
      need(!isObject(g.demo) || g.demo.cadence === undefined || (typeof g.demo.cadence === 'number' && g.demo.cadence >= 40 && g.demo.cadence <= 1000), `goal ${g.id}: demo cadence is milliseconds per key, 40-1000`);
    } else need(typeof g.keys === 'string' && g.keys.trim(), `goal ${g.id}: keys (the route as keycaps) missing`);
    // Adaptive rule (SITE_SPEC §4): the goal that first uses a concept this lesson teaches carries the
    // one-line teaching point; a goal that only reuses taught concepts carries none.
    const fresh = (Array.isArray(g.requires) ? g.requires : []).filter(c => concepts.includes(c) && !introduced.has(c));
    if (fresh.length) { need(typeof g.teach === 'string' && g.teach.trim(), `goal ${g.id}: introduces ${fresh.join(', ')} and needs a one-line teach`); fresh.forEach(c => introduced.add(c)); }
    else if (Array.isArray(conceptsRaw) && Array.isArray(g.requires)) need(g.teach === undefined, `goal ${g.id}: reuses taught concepts only, so it must not carry a teach line`);
    if (typeof g.teach === 'string') { need(sentenceCount(g.teach) === 1 && /[.!?]$/.test(g.teach.trim()), `goal ${g.id}: teach must be one sentence ending in a full stop`); need(wordCount(g.teach) <= 30, `goal ${g.id}: teach is over 30 words`); }
  }
  need(l.race === undefined || (Array.isArray(l.race) && l.race.length >= 1 && l.race.every(r => isObject(r) && typeof r.label === 'string' && ids.has(r.slow) && ids.has(r.fast))), 'race must be pairs { label, slow, fast } naming goals');
  need(l.closing === undefined || (Array.isArray(l.closing) && l.closing.every(t => typeof t === 'string')), 'closing must be an array of paragraphs');
  need(l.endState === undefined || Array.isArray(l.endState), 'endState must be an array');
  const ends = Array.isArray(l.endState) ? l.endState.filter(isObject) : [];
  for (const e of ends) { need(typeof e.text === 'string', 'endState entries need text'); need(typeof e.check === 'function', 'endState entries need a check'); }
  need(typeof l.solution === 'string' && l.solution.trim(), 'solution keystrokes missing');
  if (isObject(l.sheet) || moduleLesson) validateStartingSheet(l, goals, ends, need, { moduleLesson, kind });
  return errs;
}

/**
 * Build the starting sheet and run every check against it: a cell key that does not parse, an
 * active cell outside rows×cols, a sheet that does not build, a check that throws, and a first goal
 * the starting sheet already satisfies (nothing for the learner to do) are all reported. Later goals
 * may legitimately hold at the start — they are gated behind the earlier ones.
 */
function validateStartingSheet(l, goals, ends, need, opts = {}) {
  const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: sp.cells, colW: sp.colW, active: sp.active, rowH: sp.rowH, hiddenRows: sp.hiddenRows, hiddenCols: sp.hiddenCols, freeze: sp.freeze, gridlines: sp.gridlines, groups: sp.groups });
  let sheet, session;
  if (opts.moduleLesson) {
    // a module lesson starts from the previous lesson's `after` (the named workbook state);
    // a challenge additionally wears the seed's clothing before the first key
    let state;
    try { state = workbookState(l.workbook, l.state.before); } catch (e) { need(false, e.message); return; }
    if (opts.kind === 'challenge' && typeof l.seed === 'function') {
      let patch;
      try { patch = l.seed(mulberry32(1)); } catch (e) { need(false, `seed throws: ${e.message}`); return; }
      need(isObject(patch), 'seed must return a patch object');
      for (const key in patch || {}) { const shName = key.includes('!') ? key.split('!')[0] : state.sheets[0].name; need(state.sheets.some(x => x.name === shName), `seed patches unknown sheet in "${key}"`); }
      applyStatePatch(state, patch || {});
    }
    try {
      session = new Session(build(state.sheets[0]), {}); session.demoDone = new Set();
      session.sheets[0].name = state.sheets[0].name;
      for (const sh of state.sheets.slice(1)) session.addSheet(sh.name, build(sh));
      sheet = session.sheet;
    } catch (e) { need(false, `module state does not build: ${e.message}`); return; }
  } else {
    const spec = l.sheet;
    const cells = isObject(spec.cells) ? spec.cells : {};
    need(spec.cells === undefined || isObject(spec.cells), 'sheet: cells must be an object of cell records');
    for (const k in cells) { need(parseRef(k), `sheet: bad cell key "${k}"`); need(isObject(cells[k]), `sheet: cell ${k} must be a record such as { value }`); }
    const rows = spec.rows || 100, cols = spec.cols || 26;   // the Sheet defaults
    if (spec.active !== undefined) {
      const a = spec.active;
      need(isObject(a) && Number.isInteger(a.r) && Number.isInteger(a.c) && a.r >= 1 && a.r <= rows && a.c >= 1 && a.c <= cols, `sheet: active ${JSON.stringify(a)} is outside the ${rows}×${cols} grid`);
    }
    try {
      sheet = build({ ...spec, cells });
      session = new Session(sheet, {}); session.demoDone = new Set();
      // the workbook, exactly as LessonRun.reset assembles it, so cross-sheet checks probe correctly
      const sheets = Array.isArray(l.sheets) ? l.sheets : [];
      if (sheets.length) {
        if (sheets[0] && sheets[0].name) session.sheets[0].name = sheets[0].name;
        for (const sh of sheets.slice(1)) session.addSheet(sh.name, build(sh));
      }
    }   // as the runner sets it up
    catch (e) { need(false, `sheet does not build: ${e.message}`); return; }
  }
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
  const out = new Set(lesson.teaches || lesson.concepts || []);
  for (const pid of lesson.prerequisites || []) {
    if (seen.has(pid)) continue; seen.add(pid);
    const p = byId[pid]; if (!p) continue;
    for (const c of availableConcepts(p, byId, seen)) out.add(c);
  }
  return out;
}

/**
 * Validate a drill (SITE_SPEC §5): a timed exercise of 1-12 checkpoints with explicit pars and an
 * optimal keystroke count. Unlike a lesson it teaches nothing — no read, no teach lines, no
 * concept bookkeeping — so a checkpoint carries only { id, text, keys, check }. Returns a list of
 * problems (empty when valid); never throws.
 */
export function validateDrill(d) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  if (!d || typeof d !== 'object') return ['drill must be an object'];
  need(typeof d.id === 'string' && /^[a-z0-9-]+$/.test(d.id), 'id must be kebab-case');
  need(typeof d.chapter === 'string' && d.chapter, 'chapter missing');
  need(typeof d.title === 'string' && d.title.trim(), 'title missing');
  need(typeof d.task === 'string' && d.task.trim() && sentenceCount(d.task) === 1, 'task must be one sentence');
  need(ACCESS.includes(d.access), 'access must be free | paid');
  need(d.benchmark === undefined || typeof d.benchmark === 'boolean', 'benchmark must be true or false');
  need(d.seed === undefined || typeof d.seed === 'function', 'seed must be a function (rng) => cells patch');
  need(isObject(d.sheet), 'sheet (starting sheet) missing');
  need(d.sheets === undefined || (Array.isArray(d.sheets) && d.sheets.every(isObject)), 'sheets must be an array of { name, cells } records');
  need(Number.isInteger(d.optimalKeys) && d.optimalKeys > 0, 'optimalKeys must be a positive integer');
  const p = d.pars;
  need(isObject(p) && ['pass', 'pro', 'legendary'].every(k => typeof p[k] === 'number' && Number.isFinite(p[k])), 'pars must give pass, pro and legendary in seconds');
  if (isObject(p)) need(p.pass > p.pro && p.pro > p.legendary && p.legendary > 0, 'pars must fall strictly: pass > pro > legendary > 0');
  need(Array.isArray(d.goals) && d.goals.length >= 1 && d.goals.length <= 12, 'goals: 1-12 checkpoints');
  const goals = Array.isArray(d.goals) ? d.goals.filter(isObject) : [];
  const ids = new Set();
  for (const g of goals) {
    need(typeof g.id === 'string' && g.id, 'goal id missing'); need(!ids.has(g.id), `duplicate goal id ${g.id}`); ids.add(g.id);
    need(typeof g.text === 'string' && g.text.trim(), `goal ${g.id}: text missing`);
    need(typeof g.keys === 'string' && g.keys.trim(), `goal ${g.id}: keys (the route as keycaps) missing`);
    need(typeof g.check === 'function', `goal ${g.id}: check must be a function`);
    need(g.teach === undefined && g.requires === undefined && g.demo === undefined, `goal ${g.id}: a drill checkpoint carries no teach, requires or demo`);
  }
  need(d.endState === undefined || Array.isArray(d.endState), 'endState must be an array');
  const ends = Array.isArray(d.endState) ? d.endState.filter(isObject) : [];
  for (const e of ends) { need(typeof e.text === 'string', 'endState entries need text'); need(typeof e.check === 'function', 'endState entries need a check'); }
  need(typeof d.solution === 'string' && d.solution.trim(), 'solution keystrokes missing');
  if (isObject(d.sheet)) validateStartingSheet(d, goals, ends, need);
  return errs;
}
