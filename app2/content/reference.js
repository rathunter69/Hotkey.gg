// app2/content/reference.js — the shortcut reference as data, ported from the old build's
// reference.html (its DATA table plus the Macabacus / FactSet add-in layers it appended from
// drills.js HOTKEY_PLUGIN_LAYERS). Every old row is kept; nothing was corrected silently.
//
// Chord notation is the lessons' own:
//   'Ctrl+Shift+↓'   keys joined with + are held together
//   'Alt H B O'      keys separated by a space are pressed one after the other (release between)
//   '↑/↓/←/→'        alternatives within one key
//   'Ctrl+Shift++'   a trailing + is the literal + key
//
// Entry shape:
//   { id, name, what, category, win, mac, lessonId,
//     concept: the schema.js concept the shortcut belongs to (null when no lesson covers it),
//     note: a muted aside ('Compact keyboards: Ctrl+Fn+←'), macNote: the Mac caveat ('' when none),
//     addin: 'Macabacus' | 'FactSet' | null }
// lessonId is derived: the first lesson in the catalogue whose `concepts` list the entry's concept.
// When a later chapter teaches a concept, the link appears here without touching this file.

import { LESSONS } from './index.js';

/* ---------- chord notation ---------- */

/** 'Alt H B O' → ['Alt', 'H', 'B', 'O'] — the segments pressed in sequence. */
export const splitSequence = chord => String(chord).trim().split(/\s+/).filter(Boolean);

/** 'Ctrl+Shift++' → ['Ctrl', 'Shift', '+'] — the keys held together in one segment. */
export function splitHold(segment) {
  const s = String(segment);
  const keys = s.split('+').filter(p => p !== '');
  if (s.length > 1 && s.endsWith('+')) keys.push('+');
  return keys.length ? keys : [s];
}

/**
 * Parse a chord into segments → held keys → alternatives:
 *   parseChord('Ctrl+↑/↓/←/→') → [[['Ctrl'], ['↑', '↓', '←', '→']]]
 *   parseChord('Alt H 1')      → [[['Alt']], [['H']], [['1']]]
 */
export const parseChord = chord => splitSequence(chord).map(seg => splitHold(seg).map(k => k.split('/').filter(Boolean)));

/* ---------- the Mac column ---------- */
// The old page derived the Mac column by rule: Ctrl→⌘, Alt→⌥, Shift→⇧ (verified for the ⌘-plays-Ctrl
// family) behind a truth table of the chords whose Mac form is NOT that swap (themes.js HK_MAC_CHORDS).
// Rows the old audit would not stand behind carry varies:true and show the Windows chord with a
// "Mac: varies" note. Add-in rows never translate: neither add-in has a Mac build.

const MAC_KEY = { ctrl: '⌘', alt: '⌥', shift: '⇧' };

export const MAC_OVERRIDES = {
  /* selection / clipboard */
  'CTRL+SPACE': { mac: '⌃+Space', note: '⌘+Space is macOS Spotlight' },
  'CTRL+ALT+V': { mac: '⌃+⌘+V' },
  /* formulas */
  'ALT+=': { mac: '⌘+⇧+T', note: 'Alt+= is not a Mac Excel chord' },
  'CTRL+`': { mac: '⌃+`', note: '⌘+` cycles macOS windows' },
  /* editing / F-keys */
  'F2': { mac: '⌃+U', note: 'or fn+F2' },
  'F4': { mac: 'fn+F4', note: 'or ⌘+T (the browser takes ⌘+T outside full screen)' },
  /* dialogs */
  'CTRL+H': { mac: '⌃+H', note: '⌘+H hides the app' },
  /* number formats — Mac Excel keeps these on ⌃, not ⌘ */
  'CTRL+SHIFT+$': { mac: '⌃+⇧+$' },
  'CTRL+SHIFT+%': { mac: '⌃+⇧+%' },
  'CTRL+SHIFT+!': { mac: '⌃+⇧+!' },
  'CTRL+SHIFT+~': { mac: '⌃+⇧+~' },
  'CTRL+SHIFT+#': { mac: '⌃+⇧+#' },
  'CTRL+SHIFT++': { mac: '⌃+⇧+=' },
  'CTRL+;': { mac: '⌃+;' },
  'CTRL+SHIFT+;': { mac: '⌃+⇧+;' },
  /* the old audit would not stand behind a Mac form for these; say so instead of guessing */
  'CTRL+9': { varies: true },
  'CTRL+SHIFT+L': { varies: true },
  'CTRL+PAGEUP': { varies: true },
  'CTRL+PAGEDOWN': { varies: true },
  'CTRL+PAGEUP/PAGEDOWN': { varies: true },
};

const normChord = s => String(s).trim().replace(/\s*\+\s*/g, '+').replace(/\s+/g, ' ').toUpperCase();
const override = chord => MAC_OVERRIDES[normChord(chord)] || null;

/** The Mac form of one Windows chord: 'Ctrl+B' → '⌘+B', 'Alt H B O' → '⌥ H B O', 'Ctrl+Space' → '⌃+Space'. */
export function macChord(win) {
  const whole = override(win);
  if (whole) return whole.varies ? String(win) : whole.mac;
  return splitSequence(win).map(seg => {
    const hit = override(seg);
    if (hit) return hit.varies ? seg : hit.mac;
    return splitHold(seg).map(k => MAC_KEY[k.toLowerCase()] || k).join('+');
  }).join(' ');
}

/** The caveat to print beside a chord on Mac ('' when there is none). */
export function macNote(win) {
  const hit = override(win);
  if (!hit) return '';
  return hit.varies ? 'Mac: varies' : (hit.note || '');
}

/* ---------- lesson lookup ---------- */

// The Welcome race introduces a couple of shortcuts for the wow moment; the reference links to the
// lesson that teaches them properly, so Welcome lessons only count when nothing else covers a concept.
const LESSON_BY_CONCEPT = {};
for (const l of LESSONS.filter(l => l.section !== 'Welcome').concat(LESSONS.filter(l => l.section === 'Welcome'))) for (const c of l.concepts || []) if (!(c in LESSON_BY_CONCEPT)) LESSON_BY_CONCEPT[c] = l.id;

/** The id of the first lesson that teaches a concept (Welcome lessons last), or null. */
export const lessonForConcept = concept => (concept && LESSON_BY_CONCEPT[concept]) || null;

/* ---------- the reference ---------- */

const R = (id, win, name, what, extra = {}) => ({ id, win, name, what, ...extra });

const NATIVE = [
  ['Navigation', [
    R('arrow-keys', '↑/↓/←/→', 'Move one cell', 'Move the active cell one cell up, down, left or right.', { concept: 'arrow-keys' }),
    R('ctrl-arrow', 'Ctrl+↑/↓/←/→', 'Jump to the edge of the data', 'Jump to the edge of the data region.', { concept: 'ctrl-arrow' }),
    R('home', 'Home', 'Start of the row', 'Move to column A of the current row.', { concept: 'home-key' }),
    R('ctrl-home', 'Ctrl+Home', 'Go to A1', 'Go to A1, the top-left cell.', { concept: 'ctrl-home-end', note: 'Compact keyboards: Ctrl+Fn+←' }),
    R('ctrl-end', 'Ctrl+End', 'Go to the last used cell', 'Go to the last used cell of the worksheet.', { concept: 'ctrl-home-end', note: 'Compact keyboards: Ctrl+Fn+→' }),
    R('tab-move', 'Tab', 'Move right', 'Move right (Shift+Tab to move left).', { concept: 'enter-tab-move' }),
    R('enter-move', 'Enter', 'Move down', 'Move down (Shift+Enter to move up).', { concept: 'enter-tab-move' }),
    R('page-up-down', 'PageUp/PageDown', 'Scroll one screen', 'Scroll one screen up or down.', { note: 'Compact keyboards: Fn+↑ / Fn+↓' }),
    R('ctrl-page-up-down', 'Ctrl+PageUp/PageDown', 'Previous / next worksheet', 'Move to the previous or next worksheet.', { concept: 'sheet-tabs', note: 'Compact keyboards: Ctrl+Fn+↑ / Ctrl+Fn+↓' }),
    R('ctrl-g', 'Ctrl+G', 'Go To', 'Open Go To: type a cell or range reference and press Enter to jump there. F5 does the same.', { concept: 'go-to' }),
  ]],
  ['Selection', [
    R('shift-arrow', 'Shift+↑/↓/←/→', 'Extend the selection one cell', 'Extend the selection one cell at a time.', { concept: 'shift-arrow' }),
    R('ctrl-shift-arrow', 'Ctrl+Shift+↑/↓/←/→', 'Extend to the edge of the data', 'Extend the selection to the edge of the data region.', { concept: 'ctrl-shift-arrow' }),
    R('shift-space', 'Shift+Space', 'Select the entire row', 'Select the entire row of the active cell.', { concept: 'row-col-select' }),
    R('ctrl-space', 'Ctrl+Space', 'Select the entire column', 'Select the entire column of the active cell.', { concept: 'row-col-select' }),
    R('ctrl-shift-space', 'Ctrl+Shift+Space', 'Select the current region', 'Select the current region: the whole table under the cursor.'),
    R('ctrl-a', 'Ctrl+A', 'Select the current region, then the whole sheet', 'Select the current region; press again for the whole sheet.', { concept: 'ctrl-a' }),
    R('ctrl-shift-end', 'Ctrl+Shift+End', 'Select to the last used cell', 'Select from here to the last used cell.', { note: 'Compact keyboards: Ctrl+Shift+Fn+→' }),
  ]],
  ['Editing', [
    R('f2-edit', 'F2', 'Edit the active cell', 'Edit the active cell with the insertion point at the end.', { concept: 'edit-mode-f2' }),
    R('ctrl-enter', 'Ctrl+Enter', 'Commit into every selected cell', 'Commit the edit into every selected cell; formulas translate per cell.'),
    R('equals', '=', 'Start a formula', 'Start a formula in the active cell.'),
    R('enter-commit', 'Enter', 'Commit and move down', 'Confirm the entry and move down.', { concept: 'enter-commits' }),
    R('tab-commit', 'Tab', 'Commit and move right', 'Confirm the entry and move right.', { concept: 'tab-commits' }),
    R('esc-cancel', 'Esc', 'Cancel the edit', 'Cancel the edit and keep the previous contents.', { concept: 'escape-cancels' }),
    R('delete-clear', 'Delete', 'Clear cell contents', 'Clear the contents of the selected cells.', { concept: 'delete-clears' }),
    R('alt-enter', 'Alt+Enter', 'Line break inside a cell', 'Start a new line inside the cell while editing.'),
    R('f4-refs', 'F4', 'Cycle absolute / relative references', 'Cycle absolute / relative references ($) while editing a formula.'),
  ]],
  ['Ribbon', [
    R('alt-keytips', 'Alt', 'Show KeyTips', 'Show KeyTips on the Ribbon; the letters choose a tab, then a command.', { concept: 'keytips' }),
    R('alt-h', 'Alt H', 'Home tab', 'Open the Home tab, which holds the everyday formatting commands.', { concept: 'home-tab' }),
    R('esc-ribbon', 'Esc', 'Back out of the Ribbon', 'Back out of the Ribbon one level at a time.', { concept: 'escape-backs-out' }),
  ]],
  ['Formatting', [
    R('ctrl-b', 'Ctrl+B', 'Bold', 'Make the selected cells bold.', { concept: 'bold-command' }),
    R('alt-h-1', 'Alt H 1', 'Bold (Ribbon)', 'Bold from the Ribbon: Home tab, then 1.', { concept: 'bold-command' }),
    R('ctrl-i', 'Ctrl+I', 'Italic', 'Make the selected cells italic.'),
    R('ctrl-u', 'Ctrl+U', 'Underline', 'Underline the selected cells.'),
    R('ctrl-1', 'Ctrl+1', 'Format Cells dialog box', 'Open the Format Cells dialog box.', { concept: 'format-cells-dialog' }),
    R('alt-h-o-e', 'Alt H O E', 'Format Cells (Ribbon)', 'Open the Format Cells dialog box from the Ribbon: Home, Format, Format Cells.', { concept: 'ribbon-route-dialog' }),
    R('alt-w-v-g', 'Alt W V G', 'Gridlines', 'View tab: show or hide the gridlines.', { concept: 'gridlines' }),
    R('alt-h-o-r', 'Alt H O R', 'Rename sheet', 'Home › Format › Rename Sheet: type the new name and press Enter.', { concept: 'rename-sheet' }),
    R('alt-h-i-s', 'Alt H I S', 'Insert sheet', 'Home › Insert › Insert Sheet, the same as Shift+F11.', { concept: 'insert-sheet' }),
    R('alt-h-d-s', 'Alt H D S', 'Delete sheet', 'Home › Delete › Delete Sheet; Excel asks first when the sheet holds anything.', { concept: 'delete-sheet' }),
    R('alt-h-o-m', 'Alt H O M', 'Move or copy sheet', 'Home › Format › Move or Copy Sheet: pick the sheet it goes before, or move it to the end.', { concept: 'move-sheet' }),
    R('alt-f-t', 'Alt F T', 'Excel Options', 'Open Excel Options from the File menu: calculation mode, iterative calculation, the Quick Access Toolbar.', { concept: 'excel-options' }),
    R('alt-p-s-p', 'Alt P S P', 'Page Setup dialog box', 'Open Page Setup from the Page Layout tab: orientation and scaling.', { concept: 'page-setup' }),
    R('alt-h-a-l', 'Alt H A L', 'Align left', 'Align the selected cells left.', { concept: 'align-command' }),
    R('alt-h-a-c', 'Alt H A C', 'Center', 'Center the selected cells.', { concept: 'align-command' }),
    R('alt-h-a-r', 'Alt H A R', 'Align right', 'Align the selected cells right.', { concept: 'align-command' }),
    R('alt-h-h', 'Alt H H', 'Fill color', 'Fill (cell shading) color.'),
    R('alt-h-f-c', 'Alt H F C', 'Font color', 'Font color: models colour inputs blue and formulas black.', { concept: 'font-color' }),
  ]],
  ['Borders', [
    R('alt-h-b-o', 'Alt H B O', 'Bottom border', 'Put a border along the bottom of the selected cells.', { concept: 'borders-menu' }),
    R('alt-h-b-p', 'Alt H B P', 'Top border', 'Put a border along the top of the selected cells.', { concept: 'borders-menu' }),
    R('alt-h-b-a', 'Alt H B A', 'All borders', 'Put a border on every edge of every selected cell.', { concept: 'borders-menu' }),
    R('alt-h-b-s', 'Alt H B S', 'Outside borders', 'Put a border around the outside of the selection.', { concept: 'borders-menu' }),
    R('alt-h-b-t', 'Alt H B T', 'Thick box border', 'Put a thick border around the outside of the selection.', { concept: 'borders-menu' }),
    R('alt-h-b-b', 'Alt H B B', 'Double bottom border', 'Double bottom border (grand total).', { concept: 'borders-menu' }),
    R('alt-h-b-d', 'Alt H B D', 'Top and bottom border', 'Put a border along the top and the bottom of the selection.', { concept: 'borders-menu' }),
    R('alt-h-b-n', 'Alt H B N', 'No border', 'Remove the borders from the selected cells.', { concept: 'borders-menu' }),
  ]],
  ['Number formats', [
    R('ctrl-shift-dollar', 'Ctrl+Shift+$', 'Currency', 'Currency, 2 decimals.'),
    R('ctrl-shift-percent', 'Ctrl+Shift+%', 'Percent', 'Percent, 0 decimals.'),
    R('ctrl-shift-bang', 'Ctrl+Shift+!', 'Comma', 'Comma (thousands separator), 2 decimals.'),
    R('ctrl-shift-tilde', 'Ctrl+Shift+~', 'General', 'General format.'),
    R('ctrl-shift-hash', 'Ctrl+Shift+#', 'Date', 'Date format.'),
    R('alt-h-0', 'Alt H 0', 'Add a decimal place', 'Show one more decimal place.'),
    R('alt-h-9', 'Alt H 9', 'Remove a decimal place', 'Show one fewer decimal place.'),
    R('alt-h-k', 'Alt H K', 'Comma style', 'Apply Comma Style from the Ribbon.'),
  ]],
  ['Formulas and fill', [
    R('alt-equals', 'Alt+=', 'AutoSum', 'AutoSum the adjacent range.'),
    R('ctrl-d', 'Ctrl+D', 'Fill down', 'Fill down from the cell above.'),
    R('ctrl-r', 'Ctrl+R', 'Fill right', 'Fill right from the cell to the left.'),
    R('f4-repeat', 'F4', 'Repeat the last action', 'Repeat the last action (when not editing).', { macVaries: true }),
    R('f9', 'F9', 'Recalculate', 'Recalculate all open workbooks (Calculate Now, when calculation is set to Manual).', { concept: 'calculate-now' }),
    R('ctrl-backtick', 'Ctrl+`', 'Show formulas', 'Toggle between showing formulas and showing values.'),
  ]],
  ['Copy and paste', [
    R('ctrl-c', 'Ctrl+C', 'Copy', 'Copy the selected cells.'),
    R('ctrl-x', 'Ctrl+X', 'Cut', 'Cut the selected cells.'),
    R('ctrl-v', 'Ctrl+V', 'Paste', 'Paste at the active cell.'),
    R('ctrl-alt-v', 'Ctrl+Alt+V', 'Paste Special dialog box', 'Open the Paste Special dialog box.'),
    R('alt-e-s-v', 'Alt E S V', 'Paste values', 'Paste values only (legacy chain).'),
    R('alt-h-v-s', 'Alt H V S', 'Paste Special (Ribbon)', 'Open Paste Special from the Ribbon.'),
  ]],
  ['Rows and columns', [
    R('ctrl-shift-plus', 'Ctrl+Shift++', 'Insert rows / columns', 'Insert rows or columns. Select the whole row or column first (Shift+Space / Ctrl+Space).'),
    R('ctrl-minus', 'Ctrl+-', 'Delete rows / columns', 'Delete rows or columns. Select the whole row or column first.'),
    R('alt-h-o-i', 'Alt H O I', 'AutoFit column width', 'Fit the column width to its contents.'),
    R('alt-h-o-a', 'Alt H O A', 'AutoFit row height', 'Fit the row height to its contents.'),
    R('ctrl-9', 'Ctrl+9', 'Hide rows', 'Hide the selected rows (Ctrl+0 hides columns).'),
    R('unhide-all-rows', 'Ctrl+A Alt H O U O', 'Unhide every row', 'Unhide every row: select all first, then Format, Hide & Unhide, Unhide Rows.'),
  ]],
  ['Data and outline', [
    R('group', 'Shift+Alt+→', 'Group', 'Group the selected rows.'),
    R('ungroup', 'Shift+Alt+←', 'Ungroup', 'Ungroup the selected rows.'),
    R('alt-a-h', 'Alt A H', 'Hide detail', 'Hide (fold) the group detail.'),
    R('alt-a-j', 'Alt A J', 'Show detail', 'Show the group detail.'),
    R('ctrl-shift-l', 'Ctrl+Shift+L', 'AutoFilter', 'Toggle AutoFilter on the header row.'),
    R('alt-down', 'Alt+↓', 'Open the filter picker', 'Open the filter value picker on a header cell.'),
    R('alt-a-s-a', 'Alt A S A', 'Sort ascending', 'Sort ascending (Alt A S D for descending).'),
  ]],
  ['Workbook', [
    R('ctrl-z', 'Ctrl+Z', 'Undo', 'Undo the last action.'),
    R('ctrl-y', 'Ctrl+Y', 'Redo', 'Redo the last undone action.'),
    R('ctrl-s', 'Ctrl+S', 'Save', 'Save the workbook.'),
    R('ctrl-f', 'Ctrl+F', 'Find', 'Open Find.'),
    R('ctrl-h', 'Ctrl+H', 'Find and replace', 'Open Find and Replace.'),
    R('ctrl-p', 'Ctrl+P', 'Print', 'Print.'),
  ]],
];

// Add-in layers, as the old page listed them (from drills.js HOTKEY_PLUGIN_LAYERS): Windows-only
// defaults, remappable in each vendor's shortcut manager. [chord, name, what]
const ADDINS = [
  ['Macabacus', 'Defaults verified against the CFI × Macabacus cheat sheet (Jul 2026). Number, border and color cycles piggyback on the native Excel chords; most desks remap some in Shortcut Manager.', [
    ['Ctrl+Shift+R', 'Fast Fill Right', 'Fills to the data edge from one cell.'],
    ['Ctrl+Shift+D', 'Fast Fill Down', 'Modeling.'],
    ['Ctrl+Shift+L', 'Fast Fill Left', 'Modeling.'],
    ['Ctrl+Alt+A', 'AutoColor Selection', 'Inputs blue, formulas black.'],
    ['Ctrl+Alt+S', 'AutoColor Sheet', 'Colors.'],
    ['Ctrl+Alt+Q', 'AutoColor Workbook', 'Colors.'],
    ['Ctrl+Shift+V', 'Paste Values', 'Paste.'],
    ['Ctrl+Shift+1', 'General Number Cycle', 'Numbers.'],
    ['Ctrl+Alt+Shift+2', 'Date Cycle', 'Numbers.'],
    ['Ctrl+Shift+4', 'Local Currency Cycle', 'Numbers.'],
    ['Ctrl+Shift+5', 'Percent Cycle', 'Numbers.'],
    ['Ctrl+Shift+8', 'Multiple Cycle (x)', 'Numbers.'],
    ['Ctrl+,', 'Increase Decimals', 'Numbers.'],
    ['Ctrl+.', 'Decrease Decimals', 'Numbers.'],
    ['Ctrl+Shift+;', 'Blue-Black font toggle', 'Colors.'],
    ['Ctrl+Alt+Shift+U', 'Underline Cycle', 'Single → accounting.'],
    ['Ctrl+Shift+C', 'Center Cycle', 'Includes center-across-selection.'],
    ['Ctrl+Shift+7', 'Outside Border Cycle', 'Borders.'],
    ['Ctrl+Shift+↓', 'Bottom Border Cycle', 'Borders.'],
    ['Ctrl+Shift+[', 'Pro Precedents', 'Step through formula inputs, across tabs.'],
    ['Ctrl+Shift+]', 'Pro Dependents', 'Auditing.'],
    ['Ctrl+Alt+G', 'Toggle gridlines', 'View.'],
    ['Ctrl+Alt+=', 'Zoom in', '5% steps.'],
    ['Ctrl+Alt+-', 'Zoom out', 'View.'],
  ]],
  ['FactSet', 'Verified against FactSet’s published Hot Keys sheet (Jul 2026). Remappable via FactSet ribbon → Settings → Manage Hotkeys.', [
    ['Ctrl+Alt+Shift+K', 'Fill Right (FDS)', 'Copy with links.'],
    ['Ctrl+Alt+Shift+J', 'Fill Left (FDS)', 'Modeling.'],
    ['Ctrl+Alt+Shift+D', 'Fill Down (FDS)', 'Modeling.'],
    ['Ctrl+Alt+Shift+U', 'Fill Up (FDS)', 'Modeling.'],
    ['Ctrl+Shift+R', 'Smart Copy Right', 'Copies the formula intelligently.'],
    ['Ctrl+Shift+D', 'Smart Copy Down', 'Modeling.'],
    ['Ctrl+Alt+E', 'AutoColor', 'Recolors by content: blue inputs, green links, black formulas.'],
    ['Ctrl+Alt+A', 'AutoColor Selection', 'Colors.'],
    ['Ctrl+;', 'Blue-Black SmartCycle', 'The font blue/black toggle.'],
    ['Ctrl+Shift+1', 'General Number SmartCycle', 'Numbers.'],
    ['Ctrl+Shift+2', 'Date SmartCycle', 'Numbers.'],
    ['Ctrl+Shift+4', 'Currency SmartCycle', 'Numbers.'],
    ['Ctrl+Shift+5', 'Percent SmartCycle', 'Numbers.'],
    ['Ctrl+Shift+8', 'Multiple SmartCycle (7.5x)', 'Numbers.'],
    ['Ctrl+Shift+Y', 'Binary SmartCycle', 'On/off, yes/no.'],
    ['Ctrl+,', 'Increase Decimal', 'Numbers.'],
    ['Ctrl+.', 'Decrease Decimal', 'Numbers.'],
    ['Ctrl+Alt+,', 'Copy Exact Formulas', 'Capture for pasting elsewhere.'],
    ['Ctrl+Alt+.', 'Paste Exact Formulas', 'No reference adjustment.'],
    ['Ctrl+Alt+K', 'Paste Row/Column Info', 'Size, hidden and grouped state.'],
  ]],
];

const SLUG = { '+': '-', ' ': '-', '↑': 'up', '↓': 'down', '←': 'left', '→': 'right', ',': 'comma', '.': 'period', ';': 'semicolon', '=': 'equals', '-': 'minus', '[': 'lbracket', ']': 'rbracket', '/': '-' };
const slug = chord => String(chord).split('').map(c => SLUG[c] !== undefined ? SLUG[c] : c.toLowerCase()).join('').replace(/-+/g, '-').replace(/^-|-$/g, '');

function finish(category, r) {
  const addin = r.addin || null;
  let mac, note;
  if (addin) { mac = r.win; note = 'Windows only'; }
  else if (r.macVaries) { mac = r.win; note = 'Mac: varies'; }
  else { mac = macChord(r.win); note = macNote(r.win); }
  const concept = r.concept || null;
  return { id: r.id, name: r.name, what: r.what, category, win: r.win, mac, macNote: note, note: r.note || '', concept, addin, lessonId: lessonForConcept(concept) };
}

/** Category display order. */
export const CATEGORIES = [...NATIVE.map(s => s[0]), ...ADDINS.map(s => s[0])];

/** Per-category notes (only the add-ins carry one). */
export const CATEGORY_NOTES = Object.fromEntries(ADDINS.map(([name, note]) => [name, note]));

export const ADDIN_DISCLAIMER = 'Macabacus is a trademark of Macabacus Inc.; FactSet is a trademark of FactSet Research Systems Inc. hotkey.gg is independent and not affiliated with or endorsed by either. The add-in sections describe published default keyboard shortcuts for training compatibility.';

/** The whole reference, in display order. */
export const REFERENCE = [
  ...NATIVE.flatMap(([category, rows]) => rows.map(r => finish(category, r))),
  ...ADDINS.flatMap(([name, , rows]) => rows.map(([win, label, what]) => finish(name, { id: `${name.toLowerCase()}-${slug(win)}`, win, name: label, what, addin: name }))),
];

export const REFERENCE_BY_ID = Object.fromEntries(REFERENCE.map(e => [e.id, e]));
export const referenceById = id => REFERENCE_BY_ID[id] || null;
/** Every entry whose Windows chord matches (several rows can share a chord: Enter moves and commits). */
export const referenceByChord = chord => REFERENCE.filter(e => normChord(e.win) === normChord(chord));
