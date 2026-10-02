// one-off: seed content/keys.csv from the reference rows and the rapid deck (M50). Not part of the gate.
import { writeFileSync } from 'node:fs';
import { REFERENCE, macChord, macNote, lessonForConcept } from '../content/reference.js';
import { LESSONS, CHAPTERS } from '../content/index.js';
import { toCsv } from '../content/copy/csv.js';

const GROUP_OF = {
  Navigation: 'move', Selection: 'select', Editing: 'edit', 'Copy and paste': 'edit', 'Rows and columns': 'edit', Workbook: 'edit', 'Page layout and print': 'edit',
  Formatting: 'format', Borders: 'format', 'Number formats': 'format', 'Conditional formatting': 'format',
  'Formulas and fill': 'formulas', Auditing: 'formulas', Ribbon: 'ribbon', 'Data and outline': 'data',
};
const ORDER = ['Navigation', 'Selection', 'Editing', 'Ribbon', 'Formatting', 'Borders', 'Number formats', 'Conditional formatting', 'Formulas and fill', 'Auditing', 'Copy and paste', 'Rows and columns', 'Data and outline', 'Page layout and print', 'Workbook'];

// Ribbon routes, legacy chords and the other accepted routes, from screenplay 10.2 and 10.3
const EXTRA = {
  'ctrl-arrow': { alternatives: 'End then an arrow (End mode)' },
  'ctrl-g': { alternatives: 'F5' },
  'ctrl-a': { alternatives: 'Ctrl+Shift+8 for the current region' },
  'ctrl-shift-space': { alternatives: 'Ctrl+A' },
  'f4-refs': { alternatives: 'Typing the $ by hand' },
  'ctrl-b': { ribbon: 'Alt H 1' },
  'ctrl-i': { ribbon: 'Alt H 2' },
  'ctrl-u': { ribbon: 'Alt H 3' },
  'ctrl-1': { ribbon: 'Alt H O E', legacy: 'Alt O E' },
  'alt-h-o-r': { legacy: 'Alt O H R' },
  'alt-h-i-s': { legacy: 'Alt I W', alternatives: 'Shift+F11' },
  'alt-h-d-s': { legacy: 'Alt E L' },
  'alt-h-o-m': { legacy: 'Alt E M' },
  'alt-f-t': { legacy: 'Alt T O' },
  'alt-p-s-p': { legacy: 'Alt F U', alternatives: 'Ctrl+P then Page Setup' },
  'alt-h-b-a': { alternatives: 'Ctrl+1 then the Border tab' },
  'alt-h-b-s': { alternatives: 'Ctrl+Shift+&' },
  'alt-h-b-n': { alternatives: 'Ctrl+Shift+_' },
  'ctrl-shift-bang': { alternatives: 'Alt H K for Comma Style' },
  'alt-h-0': { alternatives: 'Alt and its number once it is on the toolbar' },
  'alt-h-9': { alternatives: 'Alt 7 once it is on the toolbar' },
  'alt-h-f-c': { alternatives: 'Alt 4 once it is on the toolbar' },
  'alt-h-h': { alternatives: 'Alt 5 once it is on the toolbar' },
  'alt-equals': { ribbon: 'Alt H U S', alternatives: 'Alt M U S' },
  'ctrl-d': { ribbon: 'Alt H F I D', legacy: 'Alt E I D' },
  'ctrl-r': { ribbon: 'Alt H F I R', legacy: 'Alt E I R' },
  'f4-repeat': { alternatives: 'Ctrl+Y when there is nothing to redo' },
  'ctrl-backtick': { ribbon: 'Alt M H' },
  'ctrl-c': { alternatives: 'Ctrl+Insert' },
  'ctrl-x': { alternatives: 'Shift+Delete' },
  'ctrl-v': { alternatives: 'Shift+Insert' },
  'ctrl-alt-v': { ribbon: 'Alt H V S', legacy: 'Alt E S' },
  'alt-e-s-v': { ribbon: 'Alt H V V', alternatives: 'Ctrl+Alt+V V Enter; Ctrl+Shift+V in current Excel' },
  'ctrl-shift-plus': { ribbon: 'Alt H I R', legacy: 'Alt I R', alternatives: 'Alt H I C and Alt I C for a column' },
  'ctrl-minus': { ribbon: 'Alt H D R', legacy: 'Alt E D', alternatives: 'Alt H D C for a column' },
  'alt-h-o-i': { legacy: 'Alt O C A' },
  'alt-h-o-a': { legacy: 'Alt O R A' },
  'ctrl-9': { ribbon: 'Alt H O U R' },
  'group': { ribbon: 'Alt A G G' },
  'ungroup': { ribbon: 'Alt A U U' },
  'ctrl-shift-l': { ribbon: 'Alt A T', legacy: 'Alt D F F' },
  'alt-a-s-a': { legacy: 'Alt D S' },
  'ctrl-f': { ribbon: 'Alt H F D F' },
  'ctrl-h': { ribbon: 'Alt H F D R', legacy: 'Alt E E' },
};

// keys the reference lacked: the rapid deck's commands from Chapters 1 to 4 and the rest of 10.2 and 10.3
const NEW = [
  ['Navigation', 'alt-w-f-f', 'Alt W F F', 'Freeze panes', 'Freeze the rows above and the columns left of the active cell, so the heads stay in view.', { alternatives: 'Alt W F R the top row only; Alt W F C the first column only' }],
  ['Navigation', 'ctrl-k', 'Ctrl+K', 'Insert a link', 'Insert a hyperlink to a place in the workbook.', { legacy: 'Alt I I' }],
  ['Selection', 'go-to-special', 'Alt H F D S', 'Go To Special', 'Select by what a cell holds: K blanks, O constants, F formulas.', { alternatives: 'F5 then Alt+S; Ctrl+G then Alt+S' }],
  ['Selection', 'ctrl-lbracket', 'Ctrl+[', 'Select precedents', 'Select the cells the active formula reads.', { alternatives: 'Ctrl+Shift+{ for every level' }],
  ['Selection', 'ctrl-rbracket', 'Ctrl+]', 'Select dependents', 'Select the cells that read the active cell.', { alternatives: 'Ctrl+Shift+} for every level' }],
  ['Editing', 'ctrl-semicolon', 'Ctrl+;', 'Insert today’s date', 'Type today’s date into the cell as a fixed value.', {}],
  ['Editing', 'shift-f2', 'Shift+F2', 'New note', 'Add a note to the active cell, or edit the one it has.', { legacy: 'Alt I M' }],
  ['Formatting', 'alt-h-w', 'Alt H W', 'Wrap text', 'Wrap the text inside the cell.', {}],
  ['Formatting', 'alt-h-6', 'Alt H 6', 'Increase indent', 'Indent the selected cells one step.', {}],
  ['Formatting', 'alt-h-5', 'Alt H 5', 'Decrease indent', 'Take one step of indent off the selected cells.', {}],
  ['Formatting', 'alt-h-f-g', 'Alt H F G', 'Increase font size', 'Make the font one size larger.', { alternatives: 'Ctrl+Shift+>' }],
  ['Conditional formatting', 'alt-h-l-n', 'Alt H L N', 'New formatting rule', 'Open the New Formatting Rule dialog box, where a formula can drive the format.', { legacy: 'Alt O D' }],
  ['Conditional formatting', 'alt-h-l-d', 'Alt H L D', 'Data bars', 'Draw a bar in each cell sized by its value.', {}],
  ['Conditional formatting', 'alt-h-l-s', 'Alt H L S', 'Color scales', 'Shade each cell by its value on a color scale.', {}],
  ['Conditional formatting', 'alt-h-l-c-s', 'Alt H L C S', 'Clear rules from the selection', 'Remove the conditional formats from the selected cells.', {}],
  ['Formulas and fill', 'alt-h-f-i-s', 'Alt H F I S', 'Fill series', 'Fill a series across the selection: dates, months or a step.', { legacy: 'Alt E I S' }],
  ['Formulas and fill', 'ctrl-f3', 'Ctrl+F3', 'Name Manager', 'Open the Name Manager to see, edit or delete the workbook’s names.', {}],
  ['Formulas and fill', 'alt-m-m-d', 'Alt M M D', 'Define a name', 'Give the selected cell or range a name.', { legacy: 'Alt I N D' }],
  ['Formulas and fill', 'alt-m-x-e', 'Alt M X E', 'Automatic except data tables', 'Set calculation to automatic except for data tables, so a model with sensitivity tables stays quick.', {}],
  ['Auditing', 'alt-m-p', 'Alt M P', 'Trace precedents', 'Draw arrows from the cells the active formula reads.', { legacy: 'Alt T U T' }],
  ['Auditing', 'alt-m-d', 'Alt M D', 'Trace dependents', 'Draw arrows to the cells that read the active cell.', { legacy: 'Alt T U D' }],
  ['Auditing', 'alt-m-a-a', 'Alt M A A', 'Remove arrows', 'Remove the trace arrows.', { legacy: 'Alt T U A' }],
  ['Auditing', 'alt-m-v', 'Alt M V', 'Evaluate formula', 'Step through a formula one part at a time.', { legacy: 'Alt T U F' }],
  ['Auditing', 'alt-m-k', 'Alt M K', 'Error checking', 'Step through the cells Excel flags as errors.', { legacy: 'Alt T K' }],
  ['Auditing', 'alt-m-w', 'Alt M W', 'Watch Window', 'Open the Watch Window to keep an eye on cells on other sheets.', { legacy: 'Alt T U W' }],
  ['Copy and paste', 'paste-values', 'Ctrl+Alt+V V Enter', 'Paste Special: values', 'Paste the values only, no formulas or formats.', { ribbon: 'Alt H V V', legacy: 'Alt E S V', alternatives: 'Ctrl+Shift+V in current Excel' }],
  ['Copy and paste', 'paste-formats', 'Ctrl+Alt+V T Enter', 'Paste Special: formats', 'Paste the formats only.', { legacy: 'Alt E S T', alternatives: 'Format Painter, Alt H F P' }],
  ['Copy and paste', 'paste-transpose', 'Ctrl+Alt+V E Enter', 'Paste Special: transpose', 'Paste the copied block turned on its side: rows become columns.', { legacy: 'Alt E S E' }],
  ['Rows and columns', 'alt-h-o-w', 'Alt H O W', 'Column width', 'Set the column width to a number.', { legacy: 'Alt O C W' }],
  ['Rows and columns', 'alt-h-o-h', 'Alt H O H', 'Row height', 'Set the row height to a number.', { legacy: 'Alt O R E' }],
  ['Rows and columns', 'ctrl-0', 'Ctrl+0', 'Hide columns', 'Hide the selected columns.', { ribbon: 'Alt H O U C' }],
  ['Rows and columns', 'alt-h-o-u-l', 'Alt H O U L', 'Unhide columns', 'Unhide the columns in the selection. Ctrl+Shift+0 does the same where Windows lets it through.', {}],
  ['Data and outline', 'ctrl-8', 'Ctrl+8', 'Outline symbols', 'Show or hide the outline symbols beside grouped rows and columns.', {}],
  ['Data and outline', 'alt-a-s-d', 'Alt A S D', 'Sort descending', 'Sort Z to A, largest first.', { legacy: 'Alt D S' }],
  ['Data and outline', 'alt-a-s-s', 'Alt A S S', 'Custom sort', 'Open the Sort dialog box for a sort on several levels.', { legacy: 'Alt D S' }],
  ['Data and outline', 'alt-a-m', 'Alt A M', 'Remove duplicates', 'Remove the duplicate rows from a list.', {}],
  ['Data and outline', 'alt-a-v-v', 'Alt A V V', 'Data validation', 'Set the values a cell accepts, such as a drop-down list.', { legacy: 'Alt D L' }],
  ['Data and outline', 'alt-a-e', 'Alt A E', 'Text to columns', 'Split one column of text into several.', { legacy: 'Alt D E' }],
  ['Data and outline', 'ctrl-e', 'Ctrl+E', 'Flash Fill', 'Fill the column by the pattern of the first entries.', { ribbon: 'Alt A F F' }],
  ['Data and outline', 'alt-a-w-t', 'Alt A W T', 'Data table', 'Build a one- or two-way data table for sensitivity.', { legacy: 'Alt D T' }],
  ['Data and outline', 'alt-a-w-g', 'Alt A W G', 'Goal Seek', 'Find the input that makes a formula hit a target.', { legacy: 'Alt T G' }],
  ['Data and outline', 'alt-n-v-t', 'Alt N V T', 'PivotTable', 'Insert a PivotTable from the selected list.', { legacy: 'Alt D P' }],
  ['Page layout and print', 'alt-p-o-l', 'Alt P O L', 'Landscape', 'Turn the page to landscape.', { alternatives: 'Alt P O P for portrait' }],
  ['Page layout and print', 'alt-p-r-s', 'Alt P R S', 'Set print area', 'Set the selection as the print area.', {}],
  ['Page layout and print', 'alt-p-i', 'Alt P I', 'Print titles', 'Repeat heading rows on every printed page.', {}],
  ['Page layout and print', 'alt-p-b-i', 'Alt P B I', 'Insert page break', 'Insert a page break above the active cell.', {}],
  ['Page layout and print', 'alt-w-i', 'Alt W I', 'Page Break Preview', 'See where the pages break, and move the breaks.', { alternatives: 'Alt W L back to Normal view' }],
];

/** The first lesson, in course order, whose goal keys press this chord (whole tokens). */
const toks = s => String(s).replace(/↵/g, 'Enter').split(/\s+/).filter(Boolean);
const SHIFTED = { 'Ctrl+Shift+$': 'Ctrl+Shift+4', 'Ctrl+Shift+%': 'Ctrl+Shift+5', 'Ctrl+Shift+!': 'Ctrl+Shift+1', 'Ctrl+Shift+#': 'Ctrl+Shift+3', 'Ctrl+Shift++': 'Ctrl+Shift+=', 'Ctrl+Shift+~': 'Ctrl+Shift+`' };
const OVERRIDE = { 'f4-refs': 'anchors-dollar-and-f4' };
function lessonPressing(chord, id) {
  if (OVERRIDE[id]) return OVERRIDE[id];
  const hit = lessonPressing1(chord);
  return hit || (SHIFTED[chord] ? lessonPressing1(SHIFTED[chord]) : '');
}
function lessonPressing1(chord) {
  const want = toks(chord);
  for (const l of LESSONS) {
    if (l.kind && l.kind !== 'lesson') continue;
    for (const g of l.goals || []) {
      if (typeof g.keys !== 'string') continue;
      const have = toks(g.keys);
      for (let i = 0; i + want.length <= have.length; i++) if (want.every((w, j) => have[i + j] === w)) return l.id;
    }
  }
  return '';
}
const chapterOf = id => { const l = LESSONS.find(x => x.id === id); return l ? CHAPTERS.findIndex(c => c.id === l.chapter) + 1 : ''; };

const rows = [];
for (const e of REFERENCE.filter(x => !x.addin)) {
  const x = EXTRA[e.id] || {};
  const lesson = e.lessonId || lessonPressing(e.win, e.id);
  rows.push({ id: e.id, command: e.name, group: GROUP_OF[e.category], category: e.category, win: e.win, ribbon: x.ribbon || '', legacy: x.legacy || '', mac: e.mac, mac_note: e.macNote || '', lesson, chapter: lesson ? String(chapterOf(lesson)) : '', alternatives: x.alternatives || '', what: e.what, concept: e.concept || '', note: e.note || '' });
}
for (const [category, id, win, name, what, x] of NEW) {
  const lesson = lessonPressing(win, id);
  rows.push({ id, command: name, group: GROUP_OF[category], category, win, ribbon: x.ribbon || '', legacy: x.legacy || '', mac: macChord(win), mac_note: macNote(win), lesson, chapter: lesson ? String(chapterOf(lesson)) : '', alternatives: x.alternatives || '', what, concept: '', note: '' });
}
rows.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
const header = ['id', 'command', 'group', 'category', 'win', 'ribbon', 'legacy', 'mac', 'mac_note', 'lesson', 'chapter', 'alternatives', 'what', 'concept', 'note'];
writeFileSync(new URL('../content/keys.csv', import.meta.url), toCsv(header, rows));
console.log(rows.length, 'rows; no lesson:', rows.filter(r => !r.lesson).map(r => r.id).join(' '));
for (const r of rows) if (r.lesson && !r.concept) console.log(r.id.padEnd(20), r.win.padEnd(22), r.chapter, r.lesson);
