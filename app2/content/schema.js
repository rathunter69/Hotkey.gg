// app2/content/schema.js — the lesson data format, and a validator for it.
//
// A lesson is a plain ES module exporting one object:
//
// {
//   id: 'foundations-01-active-cell',      unique, kebab-case
//   chapter: 'foundations',                 chapter id (content/index.js)
//   title: 'The active cell',
//   difficulty: 'easy' | 'medium' | 'hard',
//   tags: ['navigation'],
//   access: 'free' | 'paid',
//   concepts: ['active-cell', 'name-box'],  concept ids TAUGHT here (see CONCEPTS below)
//   prerequisites: ['foundations-00-…'],    lesson ids that must be completed first
//   sheet: { cells: {...}, active: {r,c}, colW: {...} },   the starting sheet (Sheet constructor options)
//   steps: [                                 in order: teach → guided → solo → timed
//     { mode: 'teach',  title, body: ['paragraph', …] },   `Ctrl+1` in a paragraph renders as a keycap
//     { mode: 'guided' },                    goals shown one at a time with their keys
//     { mode: 'solo' },                      goals without keys
//     { mode: 'timed', par: 20 },            solo against the clock (seconds)
//   ],
//   goals: [                                 sequential; each names a VISIBLE element of the sheet
//     { id: 'bold-title', text: 'Make Weekly Sales Report bold', keys: 'Ctrl+B',
//       requires: ['bold-command'],          concept ids this goal needs (must be taught here or earlier)
//       check: (sheet, session) => boolean }, end-state predicate
//   ],
//   endState: [ { text, check } ],           optional extra predicates that must hold when the last goal lands
//   solution: '"Weekly Sales Report" Enter Up Ctrl+B',   reference solution as keystrokes (parseKeyScript)
// }
//
// Goals are checked in order after every keystroke: goal i counts as done the first time its check
// passes while every earlier goal is already done, and the lesson is complete when the last goal
// lands and every endState predicate holds. A check may read the session's keyLog when the point of
// the goal is the mechanic itself (e.g. "use F2").

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const ACCESS = ['free', 'paid'];
export const MODES = ['teach', 'guided', 'solo', 'timed'];

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
  'dialog-box': 'a dialog box stays open until you confirm or cancel',
  'format-cells-dialog': 'the Format Cells dialog box: Ctrl+1',
  'number-formats': 'number formats change how a value is displayed, not the value',
  'ribbon-route-dialog': 'Alt, H, O, E opens Format Cells from the Ribbon',
};

/** Validate a lesson object. Returns a list of problems (empty when valid). */
export function validateLesson(l) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  need(typeof l.id === 'string' && /^[a-z0-9-]+$/.test(l.id), 'id must be kebab-case');
  need(typeof l.chapter === 'string' && l.chapter, 'chapter missing');
  need(typeof l.title === 'string' && l.title.trim(), 'title missing');
  need(DIFFICULTIES.includes(l.difficulty), 'difficulty must be easy | medium | hard');
  need(Array.isArray(l.tags), 'tags must be an array');
  need(ACCESS.includes(l.access), 'access must be free | paid');
  need(Array.isArray(l.concepts) && l.concepts.length > 0, 'concepts must list what the lesson teaches');
  for (const c of l.concepts || []) need(CONCEPTS[c], `unknown concept "${c}"`);
  need(Array.isArray(l.prerequisites), 'prerequisites must be an array');
  need(l.sheet && typeof l.sheet === 'object', 'sheet (starting sheet) missing');
  need(Array.isArray(l.steps) && l.steps.length > 0, 'steps missing');
  const modes = (l.steps || []).map(s => s.mode);
  for (const m of modes) need(MODES.includes(m), `unknown step mode "${m}"`);
  need(modes.indexOf('teach') === 0, 'the first step must be teach');
  const order = modes.map(m => MODES.indexOf(m));
  need(order.every((v, i) => i === 0 || v >= order[i - 1]), 'steps must go teach → guided → solo → timed');
  need(modes.includes('guided') || modes.includes('solo'), 'a lesson needs a guided or solo step');
  for (const st of l.steps || []) { if (st.mode === 'teach') { need(st.title, 'teach step needs a title'); need(Array.isArray(st.body) && st.body.length, 'teach step needs body paragraphs'); } if (st.mode === 'timed') need(typeof st.par === 'number' && st.par > 0, 'timed step needs par seconds'); }
  need(Array.isArray(l.goals) && l.goals.length > 0, 'goals missing');
  const ids = new Set();
  for (const g of l.goals || []) {
    need(typeof g.id === 'string' && g.id, 'goal id missing'); need(!ids.has(g.id), `duplicate goal id ${g.id}`); ids.add(g.id);
    need(typeof g.text === 'string' && g.text.trim(), `goal ${g.id}: text missing`);
    need(typeof g.check === 'function', `goal ${g.id}: check must be a function`);
    need(Array.isArray(g.requires), `goal ${g.id}: requires must list concept ids`);
    for (const c of g.requires || []) need(CONCEPTS[c], `goal ${g.id}: unknown concept "${c}"`);
  }
  for (const e of l.endState || []) { need(typeof e.text === 'string', 'endState entries need text'); need(typeof e.check === 'function', 'endState entries need a check'); }
  need(typeof l.solution === 'string' && l.solution.trim(), 'solution keystrokes missing');
  return errs;
}

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
