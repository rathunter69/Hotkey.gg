// app2/ui/ribbon-commands.js — what a MOUSE CLICK on a ribbon control does, as data. One table maps
// every terminal command id of engine/ribbon.js COMMANDS (the `np` strings: 'H1', 'HBO', 'HK', …)
// to { label, group, tab, icon, keys, run(session) }. `run` performs the command the way the
// keyboard dispatcher does (keyboard.js applyRibbon): a direct command calls the same Sheet method,
// a dialog command opens the same dialog state, so the same cards/dropdowns appear and the same
// grading sees the same end-state. UNIMPLEMENTED lists the real Excel commands the engine does not
// have, so the full ribbon can draw them disabled rather than missing; RIBBON_LAYOUT is the Excel
// tab/group/button arrangement the full bar renders. No DOM here: the unit test drives it headless.
//
//   import { RIBBON_COMMANDS, runCommand, recordMouse } from './ribbon-commands.js';
//   runCommand(session, 'H1');            // bold, exactly as Alt H 1 / Ctrl+B would
//   recordMouse(session, 'ribbon:H1');    // SITE_SPEC §6: every workspace click is recorded

import { COMMANDS, MENUS, TABS, RIBBON_ICONS, RIBBON_MENU_ICONS } from '../engine/ribbon.js';

/* ---------------- mouse recording (SITE_SPEC §6) ---------------- */
/**
 * Record one workspace mouse action on the session: `session.mouse = { count, log:[{t, what}] }`,
 * then `session.opts.onMouse(what)` when the host listens. `what` is one of
 * 'cell' | 'header' | 'edit' | 'ribbon:<np>' | 'dialog:<key>'. Page controls never call this.
 */
export function recordMouse(session, what) {
  if (!session) return null;
  const m = session.mouse || (session.mouse = { count: 0, log: [] });
  m.count++; m.log.push({ t: Date.now(), what: String(what) });
  try { if (session.opts && typeof session.opts.onMouse === 'function') session.opts.onMouse(what); } catch (e) { /* a listener's bug never blocks the click */ }
  return m;
}

/** Dialogs that own the input while open: the sheet and the bar behind them ignore clicks (Excel's modal cards). */
export const MODAL_DIALOGS = new Set(['fmt', 'paste', 'colw', 'sortwarn', 'series', 'fxfix']);

/** Leave the Alt walk without acting (a mouse command supersedes any open KeyTip path or dropdown). */
export function leaveRibbon(session) { if (session.mode === 'ribbon') session.exitRibbon(false); }

/** A mouse Cancel on a dialog or dropdown: what Esc does, without a key. */
export function closeDialog(session) {
  session.dialog = null; session.pasteKind = null; session.note = ''; session.sortPend = null; session.colwBuf = '';
  if (session.fxfixPend) session.fxfixPend = null;
  if (session.mode === 'ribbon') session.exitRibbon(false);
}

/** Open a menu path with the mouse (the same state Alt + letters reach): path ['H','B'] shows the Borders menu. */
export function openMenuPath(session, np) {
  if (session.mode !== 'ribbon') session.enterRibbon();
  session.dialog = null; session.pasteKind = null; session.note = '';
  session.path = String(np).split('');
}

/* ---------------- icons (the old build's 24px stroke language) ---------------- */
const _rs = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const svg = body => _rs + body + '</svg>';
const glyph = (txt, style) => '<span class="ri-g"' + (style ? ' style="' + style + '"' : '') + '>' + txt + '</span>';
const SERIF = "font-family:Georgia,'Times New Roman',serif";

export const ICON = {
  bold: RIBBON_ICONS['1'], italic: RIBBON_ICONS['2'], underline: RIBBON_ICONS['3'],
  fontName: RIBBON_ICONS.F, comma: RIBBON_ICONS.K, percent: RIBBON_ICONS.P, decDec: RIBBON_ICONS['9'], decInc: RIBBON_ICONS['0'],
  sum: RIBBON_ICONS.U, paste: RIBBON_ICONS.V, indentDec: RIBBON_ICONS['5'], indentInc: RIBBON_ICONS['6'],
  fill: RIBBON_ICONS.H, borders: RIBBON_ICONS.B, cellStyles: RIBBON_ICONS.J, wrap: RIBBON_ICONS.W,
  insert: RIBBON_ICONS.I, del: RIBBON_ICONS.D, format: RIBBON_ICONS.O, clear: RIBBON_ICONS.E,
  sortAZ: RIBBON_MENU_ICONS.A.S,
  sortZA: svg('<path d="M7 4v14M4 15l3 3 3-3"/><text x="14" y="10" font-size="8" font-weight="700" stroke="none" fill="currentColor">ZA</text>'),
  cut: svg('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.6 15.4M8.6 8.6 20 20"/>'),
  copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  painter: svg('<path d="M4 4h12v5H4z"/><path d="M16 6h3v5h-8v3"/><path d="M9 14h4v6H9z"/>'),
  fontGrow: glyph('A<span style="font-size:.5em;vertical-align:5px">▲</span>', SERIF),
  fontShrink: glyph('A<span style="font-size:.5em;vertical-align:5px">▼</span>', SERIF),
  fontColor: glyph('A', SERIF + ';border-bottom:3px solid #c00000;line-height:1;padding:0 1px'),
  alignTop: svg('<path d="M3 4h18"/><path d="M7 9h10M7 13h10"/>'),
  alignMid: svg('<path d="M7 7h10M7 17h10"/><path d="M3 12h18"/>'),
  alignBot: svg('<path d="M7 11h10M7 15h10"/><path d="M3 20h18"/>'),
  orient: glyph('ab', 'display:inline-block;transform:rotate(-45deg);font-size:12px'),
  alignL: svg('<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>'),
  alignC: svg('<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>'),
  alignR: svg('<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>'),
  merge: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 12h6M15 12h6"/><path d="M7 9l3 3-3 3M17 9l-3 3 3 3"/>'),
  acct: glyph('$'),
  condFmt: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h5M7 12h9M7 16h3"/>'),
  fmtTable: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16"/>'),
  fillMenu: svg('<rect x="6" y="3" width="12" height="6" rx="1"/><path d="M12 9v11M8 16l4 4 4-4"/>'),
  filter: svg('<path d="M4 5h16L14 12v6l-4 2v-8L4 5Z"/>'),
  find: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>'),
  fx: glyph('fx', 'font-style:italic;' + SERIF),
  precedents: svg('<rect x="13" y="8" width="8" height="8" rx="1"/><path d="M3 12h9M9 9l3 3-3 3"/>'),
  dependents: svg('<rect x="3" y="8" width="8" height="8" rx="1"/><path d="M12 12h9M18 9l3 3-3 3"/>'),
  removeArrows: svg('<path d="M3 12h10M10 9l3 3-3 3"/><path d="M16 9l5 5M21 9l-5 5"/>'),
  showFormulas: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h8M8 14h8"/>'),
  evaluate: svg('<path d="M4 6h16M4 12h9M4 18h6"/><circle cx="17" cy="16" r="3"/><path d="M19.3 18.3 22 21"/>'),
  calc: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h.5M8 16h2M12 16h2M16 16h.5"/>'),
  gridlines: svg('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
  zoom: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M8 10.5h5M10.5 8v5"/>'),
  zoom100: glyph('100%', 'font-size:10px'),
  freeze: svg('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18" stroke-width="3"/>'),
  newWindow: svg('<rect x="3" y="7" width="12" height="12" rx="2"/><path d="M9 3h10a2 2 0 0 1 2 2v10"/>'),
  pivot: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/><path d="M13 14h5M16 12l2 2-2 2"/>'),
  table: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M10 4v16"/>'),
  picture: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>'),
  shapes: svg('<circle cx="8" cy="8" r="4"/><rect x="11" y="11" width="9" height="9" rx="1"/>'),
  chartCol: svg('<path d="M5 20v-9M11 20V5M17 20v-6M2 20h20"/>'),
  chartLine: svg('<path d="M3 16l5-6 4 3 7-8"/><path d="M2 21h20"/>'),
  chartPie: svg('<circle cx="12" cy="12" r="8"/><path d="M12 4v8h8"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  textBox: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M8 9h8M12 9v6"/>'),
  headerFooter: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M3 16h18"/>'),
  themes: svg('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7" r="1.2"/><circle cx="16" cy="10" r="1.2"/><path d="M12 21a3 3 0 0 1 0-6h2a2 2 0 0 0 0-4"/>'),
  margins: svg('<rect x="3" y="3" width="18" height="18" rx="1"/><rect x="7" y="7" width="10" height="10" stroke-dasharray="2 2"/>'),
  pageOrient: svg('<rect x="3" y="7" width="10" height="14" rx="1"/><rect x="9" y="3" width="12" height="9" rx="1"/>'),
  pageSize: svg('<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M5 9h14"/>'),
  printArea: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="3 2"/><rect x="7" y="7" width="10" height="10"/>'),
  spelling: glyph('abc<span style="color:var(--accent)">✓</span>', 'font-size:10px'),
  thesaurus: svg('<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>'),
  comment: svg('<path d="M21 12a8 8 0 0 1-8 8H8l-5 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  fromText: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'),
  fromWeb: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  textToCols: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M12 5v14M7 12h2M15 12h2"/>'),
  removeDupes: svg('<rect x="3" y="3" width="10" height="10" rx="1"/><rect x="11" y="11" width="10" height="10" rx="1"/><path d="M14 14l4 4M18 14l-4 4"/>'),
  validation: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M7 12l3 3 7-7"/>'),
  viewNormal: svg('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/>'),
  viewBreak: svg('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18" stroke-dasharray="3 2"/>'),
  viewLayout: svg('<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  ruler: svg('<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v3M14 8v3M18 8v3"/>'),
  headings: svg('<path d="M3 3h18v5H3zM3 3h5v18H3z" fill="currentColor" opacity=".25" stroke="none"/><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 8h18M8 3v18"/>'),
  colWidth: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M9 5v14M3 12h6M6 9l-3 3 3 3"/>'),
  autofit: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M7 12h10M10 9l-3 3 3 3M14 9l3 3-3 3"/>'),
  rowHeight: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M12 8v8M9 11l3-3 3 3M9 13l3 3 3-3"/>'),
  series: svg('<path d="M4 18l4-5 4 2 8-9"/><path d="M16 6h4v4"/>'),
  fillDown: svg('<rect x="6" y="3" width="12" height="6" rx="1"/><path d="M12 9v11M8 16l4 4 4-4"/>'),
  fillRight: svg('<rect x="3" y="6" width="6" height="12" rx="1"/><path d="M9 12h11M16 8l4 4-4 4"/>'),
  noBorder: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="2 2"/>'),
  borderTop: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="2 2"/><path d="M3 3h18" stroke-width="3"/>'),
  borderBottom: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="2 2"/><path d="M3 21h18" stroke-width="3"/>'),
  borderLeft: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="2 2"/><path d="M3 3v18" stroke-width="3"/>'),
  borderRight: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="2 2"/><path d="M21 3v18" stroke-width="3"/>'),
  borderAll: svg('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18M12 3v18"/>'),
  borderOutside: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-width="3"/><path d="M3 12h18M12 3v18" stroke-dasharray="2 2"/>'),
  borderThick: svg('<rect x="4" y="4" width="16" height="16" rx="1" stroke-width="4"/>'),
  borderDouble: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="2 2"/><path d="M3 18h18M3 22h18"/>'),
  borderTopBot: svg('<rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="2 2"/><path d="M3 3h18M3 21h18" stroke-width="3"/>'),
  pasteValues: glyph('123', 'font-size:10px;letter-spacing:-.5px'),
  pasteSpecial: RIBBON_ICONS.V,
  clearAll: RIBBON_ICONS.E, clearFormats: svg('<path d="M7 21h11"/><path d="M6 15l6-6 7 7-4 4h-5z"/><path d="M13 3l2 2"/>'), clearContents: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M9 9l6 6M15 9l-6 6"/>'),
  insertRows: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/><path d="M12 10v4M10 12h4" stroke-width="2.5"/>'),
  insertCols: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/><path d="M12 10v4M10 12h4" stroke-width="2.5"/>'),
  deleteRows: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/><path d="M10 10l4 4M14 10l-4 4"/>'),
  deleteCols: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/><path d="M10 10l4 4M14 10l-4 4"/>'),
};

/* ---------------- the command table ---------------- */
// `direct` mirrors keyboard.js applyRibbon's `case … : S.x(); return done();` — the same Sheet call,
// then out of the Alt walk. `dialog` mirrors `this.dialog = …` — the same dialog state, opened with
// an empty path (like Ctrl+1 / Ctrl+Alt+V) so one Esc closes it for a mouse user.
const direct = fn => s => { leaveRibbon(s); s.startClock(); fn(s.sheet, s); };
const dialog = (name, setup) => s => { leaveRibbon(s); s.startClock(); s.openDialog(name); if (setup) setup(s); };
const sortRun = dir => s => {
  leaveRibbon(s); s.startClock(); const S = s.sheet; const r = S.selRange();
  if (r.c1 === r.c2 && r.r1 !== r.r2 && S.sortNeedsExpand()) { s.sortPend = { dir, r1: r.r1, r2: r.r2, key: S.dispActive().c }; s.openDialog('sortwarn'); return; }
  S.sort(dir);
};
const autoSum = s => { leaveRibbon(s); s.startClock(); s.doAutoSum(); };
const gridlines = direct((S, s) => { S.gridlines = !S.gridlines; s.toast(S.gridlines ? 'gridlines shown' : 'gridlines hidden — Alt W V G to show'); S.commit('ribbon'); });
const fmtCells = dialog('fmt');
const pasteSpecial = dialog('paste', s => { s.pasteKind = 'all'; s.pasteOp = 'none'; });

const C = (label, group, tab, icon, run, keys) => ({ label, group, tab, icon, run, keys: keys || '' });

export const RIBBON_COMMANDS = {
  // Home · Clipboard
  'HVV': C('Paste values', 'Clipboard', 'H', ICON.pasteValues, direct(S => S.paste('values')), 'Ctrl+Shift+V'),
  'HVS': C('Paste special…', 'Clipboard', 'H', ICON.pasteSpecial, pasteSpecial, 'Ctrl+Alt+V'),
  'ES': C('Paste special…', 'Clipboard', 'H', ICON.pasteSpecial, pasteSpecial, 'Ctrl+Alt+V'),
  // Home · Font
  'H1': C('Bold', 'Font', 'H', ICON.bold, direct(S => S.toggleAllOrNone('bold')), 'Ctrl+B'),
  'H2': C('Italic', 'Font', 'H', ICON.italic, direct(S => S.toggleAllOrNone('it')), 'Ctrl+I'),
  'H3': C('Underline', 'Font', 'H', ICON.underline, direct(S => S.toggleAllOrNone('uline')), 'Ctrl+U'),
  'HFG': C('Increase font size', 'Font', 'H', ICON.fontGrow, direct(S => S.fontSize(1))),
  'HFK': C('Decrease font size', 'Font', 'H', ICON.fontShrink, direct(S => S.fontSize(-1))),
  'HFC': C('Font color', 'Font', 'H', ICON.fontColor, dialog('fontcolor', s => { s.fontColorIdx = 0; })),
  'HH': C('Fill color', 'Font', 'H', ICON.fill, dialog('fillcolor', s => { s.fillColorIdx = 0; })),
  'HBO': C('Bottom border', 'Font', 'H', ICON.borderBottom, direct(S => S.border('bottom'))),
  'HBP': C('Top border', 'Font', 'H', ICON.borderTop, direct(S => S.border('top'))),
  'HBL': C('Left border', 'Font', 'H', ICON.borderLeft, direct(S => S.border('left'))),
  'HBR': C('Right border', 'Font', 'H', ICON.borderRight, direct(S => S.border('right'))),
  'HBN': C('No border', 'Font', 'H', ICON.noBorder, direct(S => S.border('none'))),
  'HBA': C('All borders', 'Font', 'H', ICON.borderAll, direct(S => S.border('all'))),
  'HBS': C('Outside borders', 'Font', 'H', ICON.borderOutside, direct(S => S.border('outside'))),
  'HBT': C('Thick outside borders', 'Font', 'H', ICON.borderThick, direct(S => S.border('thick'))),
  'HBB': C('Double bottom border', 'Font', 'H', ICON.borderDouble, direct(S => S.border('double'))),
  'HBD': C('Top and bottom border', 'Font', 'H', ICON.borderTopBot, direct(S => S.border('topbottom'))),
  // Home · Alignment
  'HAL': C('Align left', 'Alignment', 'H', ICON.alignL, direct(S => S.setAlign('l'))),
  'HAC': C('Center', 'Alignment', 'H', ICON.alignC, direct(S => S.setAlign('c'))),
  'HAR': C('Align right', 'Alignment', 'H', ICON.alignR, direct(S => S.setAlign('r'))),
  'H5': C('Decrease indent', 'Alignment', 'H', ICON.indentDec, direct(S => S.changeIndent(-1))),
  'H6': C('Increase indent', 'Alignment', 'H', ICON.indentInc, direct(S => S.changeIndent(1))),
  'HW': C('Wrap text', 'Alignment', 'H', ICON.wrap, direct(S => S.toggleWrap())),
  // Home · Number
  'HAN': C('Accounting number format', 'Number', 'H', ICON.acct, direct(S => S.setNumberFormat('acct', 0))),
  'HP': C('Percent style', 'Number', 'H', ICON.percent, direct(S => S.setNumberFormat('percent', 0)), 'Ctrl+Shift+%'),
  'HK': C('Comma style', 'Number', 'H', ICON.comma, direct(S => S.setNumberFormat('comma', 2)), 'Ctrl+Shift+!'),
  'H0': C('Increase decimal', 'Number', 'H', ICON.decInc, direct(S => S.changeDecimals(1))),
  'H9': C('Decrease decimal', 'Number', 'H', ICON.decDec, direct(S => S.changeDecimals(-1))),
  // Home · Styles
  'HJ': C('Cell styles', 'Styles', 'H', ICON.cellStyles, dialog('cellstyle', s => { s.cellStyleIdx = 0; })),
  // Home · Cells
  'HIR': C('Insert sheet rows', 'Cells', 'H', ICON.insertRows, direct(S => S.insert('r'))),
  'HIC': C('Insert sheet columns', 'Cells', 'H', ICON.insertCols, direct(S => S.insert('c'))),
  'HDR': C('Delete sheet rows', 'Cells', 'H', ICON.deleteRows, direct(S => S.remove('r'))),
  'HDC': C('Delete sheet columns', 'Cells', 'H', ICON.deleteCols, direct(S => S.remove('c'))),
  'HOI': C('AutoFit column width', 'Cells', 'H', ICON.autofit, direct(S => S.autofitCols())),
  'HOA': C('AutoFit row height', 'Cells', 'H', ICON.rowHeight, direct(S => S.commit('ribbon'))),   // the engine's rows are one height: a no-op, as Alt H O A is
  'HOW': C('Column width…', 'Cells', 'H', ICON.colWidth, dialog('colw', s => { s.colwBuf = ''; })),
  'HOE': C('Format cells…', 'Cells', 'H', ICON.format, fmtCells, 'Ctrl+1'),
  'OE': C('Format cells…', 'Cells', 'H', ICON.format, fmtCells, 'Ctrl+1'),
  // Home · Editing
  'HUS': C('AutoSum', 'Editing', 'H', ICON.sum, autoSum, 'Alt+='),
  'HFIS': C('Series…', 'Editing', 'H', ICON.series, dialog('series')),
  'HFID': C('Fill down', 'Editing', 'H', ICON.fillDown, direct(S => S.fill('down')), 'Ctrl+D'),
  'HFIR': C('Fill right', 'Editing', 'H', ICON.fillRight, direct(S => S.fill('right')), 'Ctrl+R'),
  'HEA': C('Clear all', 'Editing', 'H', ICON.clearAll, direct(S => S.clearAll())),
  'HEF': C('Clear formats', 'Editing', 'H', ICON.clearFormats, direct(S => S.clearFormats())),
  'HEC': C('Clear contents', 'Editing', 'H', ICON.clearContents, direct(S => S.clearContents()), 'Delete'),
  // Formulas
  'MUS': C('AutoSum', 'Function Library', 'M', ICON.sum, autoSum, 'Alt+='),
  'MP': C('Trace precedents', 'Formula Auditing', 'M', ICON.precedents, direct((S, s) => s.jumpPrecedent()), 'Ctrl+['),
  'MD': C('Trace dependents', 'Formula Auditing', 'M', ICON.dependents, direct((S, s) => s.jumpDependent()), 'Ctrl+]'),
  // Data
  'ASA': C('Sort A to Z', 'Sort & Filter', 'A', ICON.sortAZ, sortRun('asc')),
  'ASD': C('Sort Z to A', 'Sort & Filter', 'A', ICON.sortZA, sortRun('desc')),
  // View
  'WVG': C('Gridlines', 'Show', 'W', ICON.gridlines, gridlines),
  'WG': C('Gridlines', 'Show', 'W', ICON.gridlines, gridlines),
  // Mouse-only faces of engine features that have a chord but no Alt path (Excel's Clipboard buttons)
  'PASTE': C('Paste', 'Clipboard', 'H', ICON.paste, direct(S => S.paste('all')), 'Ctrl+V'),
  'CUT': C('Cut', 'Clipboard', 'H', ICON.cut, direct(S => S.copy(true)), 'Ctrl+X'),
  'COPY': C('Copy', 'Clipboard', 'H', ICON.copy, direct(S => S.copy(false)), 'Ctrl+C'),
};
/** The mouse-only ids above (not Alt paths): the test treats them apart from COMMANDS. */
export const MOUSE_ONLY = ['PASTE', 'CUT', 'COPY'];

/**
 * Run a command for a mouse click. An open edit is committed in place first (Excel commits when
 * you click the ribbon); a refused or autocorrect-proposed entry stays open and the click is dropped.
 * Returns true when the command ran. Does not record the mouse or repaint: the view does both.
 */
export function runCommand(session, id) {
  const cmd = RIBBON_COMMANDS[id]; if (!cmd) return false;
  if (session.editing && !session.commitEdit(0, 0, { kind: 'move' })) return false;
  cmd.run(session); return true;
}

/* ---------------- the disabled Excel commands ---------------- */
const U = (id, label, group, tab, icon) => ({ id, label, group, tab, icon: icon || '' });
export const UNIMPLEMENTED = [
  U('FormatPainter', 'Format Painter', 'Clipboard', 'H', ICON.painter),
  U('FontName', 'Font', 'Font', 'H'), U('FontSize', 'Font Size', 'Font', 'H'),
  U('AlignTop', 'Top Align', 'Alignment', 'H', ICON.alignTop), U('AlignMiddle', 'Middle Align', 'Alignment', 'H', ICON.alignMid), U('AlignBottom', 'Bottom Align', 'Alignment', 'H', ICON.alignBot),
  U('Orientation', 'Orientation', 'Alignment', 'H', ICON.orient), U('MergeCenter', 'Merge & Center', 'Alignment', 'H', ICON.merge),
  U('NumberFormat', 'Number Format', 'Number', 'H'),
  U('CondFormat', 'Conditional Formatting', 'Styles', 'H', ICON.condFmt), U('FormatTable', 'Format as Table', 'Styles', 'H', ICON.fmtTable),
  U('Filter', 'Filter', 'Sort & Filter', 'H', ICON.filter), U('FindSelect', 'Find & Select', 'Editing', 'H', ICON.find),
  U('PivotTable', 'PivotTable', 'Tables', 'N', ICON.pivot), U('Table', 'Table', 'Tables', 'N', ICON.table),
  U('Pictures', 'Pictures', 'Illustrations', 'N', ICON.picture), U('Shapes', 'Shapes', 'Illustrations', 'N', ICON.shapes),
  U('ChartColumn', 'Column', 'Charts', 'N', ICON.chartCol), U('ChartLine', 'Line', 'Charts', 'N', ICON.chartLine), U('ChartPie', 'Pie', 'Charts', 'N', ICON.chartPie),
  U('Link', 'Link', 'Links', 'N', ICON.link), U('TextBox', 'Text Box', 'Text', 'N', ICON.textBox), U('HeaderFooter', 'Header & Footer', 'Text', 'N', ICON.headerFooter),
  U('Themes', 'Themes', 'Themes', 'P', ICON.themes), U('Margins', 'Margins', 'Page Setup', 'P', ICON.margins), U('PageOrientation', 'Orientation', 'Page Setup', 'P', ICON.pageOrient),
  U('PageSize', 'Size', 'Page Setup', 'P', ICON.pageSize), U('PrintArea', 'Print Area', 'Page Setup', 'P', ICON.printArea),
  U('SheetGridlines', 'Gridlines', 'Sheet Options', 'P', ICON.gridlines), U('SheetHeadings', 'Headings', 'Sheet Options', 'P', ICON.headings),
  U('InsertFunction', 'Insert Function', 'Function Library', 'M', ICON.fx), U('RecentlyUsed', 'Recently Used', 'Function Library', 'M'),
  U('Financial', 'Financial', 'Function Library', 'M'), U('Logical', 'Logical', 'Function Library', 'M'), U('TextFn', 'Text', 'Function Library', 'M'),
  U('RemoveArrows', 'Remove Arrows', 'Formula Auditing', 'M', ICON.removeArrows), U('ShowFormulas', 'Show Formulas', 'Formula Auditing', 'M', ICON.showFormulas),
  U('EvaluateFormula', 'Evaluate Formula', 'Formula Auditing', 'M', ICON.evaluate), U('CalculateNow', 'Calculate Now', 'Calculation', 'M', ICON.calc),
  U('FromText', 'From Text/CSV', 'Get & Transform Data', 'A', ICON.fromText), U('FromWeb', 'From Web', 'Get & Transform Data', 'A', ICON.fromWeb),
  U('SortDialog', 'Sort', 'Sort & Filter', 'A', ICON.sortAZ), U('DataFilter', 'Filter', 'Sort & Filter', 'A', ICON.filter), U('ClearFilter', 'Clear', 'Sort & Filter', 'A', ICON.clear),
  U('TextToColumns', 'Text to Columns', 'Data Tools', 'A', ICON.textToCols), U('RemoveDuplicates', 'Remove Duplicates', 'Data Tools', 'A', ICON.removeDupes), U('DataValidation', 'Data Validation', 'Data Tools', 'A', ICON.validation),
  U('Spelling', 'Spelling', 'Proofing', 'R', ICON.spelling), U('Thesaurus', 'Thesaurus', 'Proofing', 'R', ICON.thesaurus),
  U('NewComment', 'New Comment', 'Comments', 'R', ICON.comment), U('DeleteComment', 'Delete', 'Comments', 'R', ICON.del), U('ShowComments', 'Show Comments', 'Comments', 'R', ICON.comment),
  U('ProtectSheet', 'Protect Sheet', 'Protect', 'R', ICON.lock), U('ProtectWorkbook', 'Protect Workbook', 'Protect', 'R', ICON.lock),
  U('ViewNormal', 'Normal', 'Workbook Views', 'W', ICON.viewNormal), U('ViewPageBreak', 'Page Break Preview', 'Workbook Views', 'W', ICON.viewBreak), U('ViewPageLayout', 'Page Layout', 'Workbook Views', 'W', ICON.viewLayout),
  U('Ruler', 'Ruler', 'Show', 'W', ICON.ruler), U('FormulaBar', 'Formula Bar', 'Show', 'W', ICON.fx), U('Headings', 'Headings', 'Show', 'W', ICON.headings),
  U('Zoom', 'Zoom', 'Zoom', 'W', ICON.zoom), U('Zoom100', '100%', 'Zoom', 'W', ICON.zoom100),
  U('FreezePanes', 'Freeze Panes', 'Window', 'W', ICON.freeze), U('NewWindow', 'New Window', 'Window', 'W', ICON.newWindow),
];
export const UNIMPLEMENTED_BY_ID = Object.fromEntries(UNIMPLEMENTED.map(u => [u.id, u]));

/* ---------------- menus and the full-bar layout ---------------- */
/**
 * Menu buttons: a MENUS key opens that Alt path (the keyboard and the mouse share the state); a
 * local key (not in MENUS, e.g. 'HSF') lists its `items` in a view-owned dropdown. 'HA', 'HF',
 * 'WV', 'AS' are VIRTUAL: their items are buttons on the bar, so the walk shows KeyTips there
 * instead of opening a dropdown.
 */
export const MENU_META = {
  'HV': { label: 'Paste', icon: ICON.paste }, 'HB': { label: 'Borders', icon: ICON.borders },
  'HI': { label: 'Insert', icon: ICON.insert }, 'HD': { label: 'Delete', icon: ICON.del }, 'HO': { label: 'Format', icon: ICON.format },
  'HE': { label: 'Clear', icon: ICON.clear }, 'HFI': { label: 'Fill', icon: ICON.fillMenu }, 'HU': { label: 'AutoSum', icon: ICON.sum }, 'MU': { label: 'AutoSum', icon: ICON.sum },
  'HA': { label: 'Alignment', icon: ICON.alignL, virtual: true }, 'HF': { label: 'Font', icon: ICON.fontName, virtual: true },
  'WV': { label: 'Show', icon: ICON.gridlines, virtual: true }, 'AS': { label: 'Sort', icon: ICON.sortAZ, virtual: true },
  'E': { label: 'Edit', icon: ICON.paste }, 'O': { label: 'Format', icon: ICON.format },
  'HSF': { label: 'Sort & Filter', icon: ICON.filter, items: [{ cmd: 'ASA' }, { cmd: 'ASD' }, { dead: 'Filter' }] },
};
export const VIRTUAL_MENUS = new Set(Object.keys(MENU_META).filter(k => MENU_META[k].virtual));

// Item kinds: { cmd } a live command button · { menu } a dropdown button · { dead } a disabled Excel
// command (UNIMPLEMENTED id) · { box } a disabled name/size/format box. `big` = icon over label
// (Excel's large button), otherwise a small icon+label row button; `iconOnly` drops the label;
// `caret` marks a command that opens a dropdown (colours, styles). A group is columns; a column is
// a big item or { rows: [[…], […], […]] } of small items, as Excel stacks them.
const big = it => ({ ...it, big: true });
const ico = it => ({ ...it, iconOnly: true });
export const RIBBON_LAYOUT = {
  H: [
    { name: 'Clipboard', cols: [big({ menu: 'HV', cmd: 'PASTE', label: 'Paste' }), { rows: [[ico({ cmd: 'CUT' })], [ico({ cmd: 'COPY' })], [ico({ dead: 'FormatPainter' })]] }] },
    { name: 'Font', cols: [{ rows: [
      [{ box: 'Arial', dead: 'FontName', w: 74 }, { box: '11', dead: 'FontSize', w: 34 }, ico({ cmd: 'HFG' }), ico({ cmd: 'HFK' })],
      [ico({ cmd: 'H1' }), ico({ cmd: 'H2' }), ico({ cmd: 'H3' }), ico({ menu: 'HB' }), ico({ cmd: 'HH', caret: true }), ico({ cmd: 'HFC', caret: true })],
    ] }] },
    { name: 'Alignment', cols: [{ rows: [
      [ico({ dead: 'AlignTop' }), ico({ dead: 'AlignMiddle' }), ico({ dead: 'AlignBottom' }), ico({ dead: 'Orientation', caret: true }), { cmd: 'HW', label: 'Wrap' }],
      [ico({ cmd: 'HAL' }), ico({ cmd: 'HAC' }), ico({ cmd: 'HAR' }), ico({ cmd: 'H5' }), ico({ cmd: 'H6' }), ico({ dead: 'MergeCenter', caret: true })],
    ] }] },
    { name: 'Number', cols: [{ rows: [
      [{ box: 'General', dead: 'NumberFormat', w: 96 }],
      [ico({ cmd: 'HAN' }), ico({ cmd: 'HP' }), ico({ cmd: 'HK' }), ico({ cmd: 'H0' }), ico({ cmd: 'H9' })],
    ] }] },
    { name: 'Styles', cols: [{ rows: [[{ dead: 'CondFormat', caret: true }], [{ dead: 'FormatTable', caret: true }], [{ cmd: 'HJ', caret: true }]] }] },
    { name: 'Cells', cols: [{ rows: [[{ menu: 'HI' }], [{ menu: 'HD' }], [{ menu: 'HO' }]] }] },
    { name: 'Editing', cols: [{ rows: [[{ menu: 'HU' }], [{ menu: 'HFI' }], [{ menu: 'HE' }]] }, { rows: [[{ menu: 'HSF' }], [{ dead: 'FindSelect', caret: true }]] }] },
  ],
  N: [
    { name: 'Tables', cols: [big({ dead: 'PivotTable' }), big({ dead: 'Table' })] },
    { name: 'Illustrations', cols: [big({ dead: 'Pictures' }), big({ dead: 'Shapes' })] },
    { name: 'Charts', cols: [{ rows: [[{ dead: 'ChartColumn' }], [{ dead: 'ChartLine' }], [{ dead: 'ChartPie' }]] }] },
    { name: 'Links', cols: [big({ dead: 'Link' })] },
    { name: 'Text', cols: [{ rows: [[{ dead: 'TextBox' }], [{ dead: 'HeaderFooter' }]] }] },
  ],
  P: [
    { name: 'Themes', cols: [big({ dead: 'Themes' })] },
    { name: 'Page Setup', cols: [big({ dead: 'Margins' }), big({ dead: 'PageOrientation' }), big({ dead: 'PageSize' }), big({ dead: 'PrintArea' })] },
    { name: 'Sheet Options', cols: [{ rows: [[{ dead: 'SheetGridlines' }], [{ dead: 'SheetHeadings' }]] }] },
  ],
  M: [
    { name: 'Function Library', cols: [big({ dead: 'InsertFunction' }), big({ menu: 'MU', cmd: 'MUS', label: 'AutoSum' }), { rows: [[{ dead: 'RecentlyUsed' }], [{ dead: 'Financial' }], [{ dead: 'Logical' }]] }, { rows: [[{ dead: 'TextFn' }]] }] },
    { name: 'Formula Auditing', cols: [{ rows: [[{ cmd: 'MP' }], [{ cmd: 'MD' }], [{ dead: 'RemoveArrows' }]] }, { rows: [[{ dead: 'ShowFormulas' }], [{ dead: 'EvaluateFormula' }]] }] },
    { name: 'Calculation', cols: [big({ dead: 'CalculateNow' })] },
  ],
  A: [
    { name: 'Get & Transform Data', cols: [big({ dead: 'FromText' }), big({ dead: 'FromWeb' })] },
    { name: 'Sort & Filter', cols: [{ rows: [[ico({ cmd: 'ASA' })], [ico({ cmd: 'ASD' })]] }, big({ dead: 'SortDialog' }), big({ dead: 'DataFilter' }), { rows: [[{ dead: 'ClearFilter' }]] }] },
    { name: 'Data Tools', cols: [big({ dead: 'TextToColumns' }), big({ dead: 'RemoveDuplicates' }), big({ dead: 'DataValidation' })] },
  ],
  R: [
    { name: 'Proofing', cols: [big({ dead: 'Spelling' }), big({ dead: 'Thesaurus' })] },
    { name: 'Comments', cols: [big({ dead: 'NewComment' }), big({ dead: 'DeleteComment' }), big({ dead: 'ShowComments' })] },
    { name: 'Protect', cols: [big({ dead: 'ProtectSheet' }), big({ dead: 'ProtectWorkbook' })] },
  ],
  W: [
    { name: 'Workbook Views', cols: [big({ dead: 'ViewNormal' }), big({ dead: 'ViewPageBreak' }), big({ dead: 'ViewPageLayout' })] },
    { name: 'Show', cols: [{ rows: [[{ dead: 'Ruler' }], [{ cmd: 'WVG', check: true }]] }, { rows: [[{ dead: 'FormulaBar' }], [{ dead: 'Headings' }]] }] },
    { name: 'Zoom', cols: [big({ dead: 'Zoom' }), big({ dead: 'Zoom100' })] },
    { name: 'Window', cols: [big({ dead: 'FreezePanes' }), big({ dead: 'NewWindow' })] },
  ],
};

/** The KeyTip path a layout item answers to: its command id, or its menu key (a split button: the menu). */
export function itemTip(it) { return it.menu || it.cmd || ''; }

/**
 * The badge an item shows at the current Alt path ('' = the tab strip): the rest of its tip beyond
 * the path, Excel-style ('FC' on Font Color at Alt H, 'C' at Alt H F). Nothing off-path.
 */
export function keyTipAt(tip, pathStr) {
  if (!tip || !pathStr) return '';
  if (tip.length <= pathStr.length || !tip.startsWith(pathStr)) return '';
  return tip.slice(pathStr.length);
}

/** Every item of every tab's layout, flattened (test + renderer helper). */
export function layoutItems(tab) {
  const out = [];
  const walk = it => { if (it.rows) it.rows.forEach(row => row.forEach(walk)); else out.push(it); };
  const tabs = tab ? [tab] : TABS.map(t => t.k);
  tabs.forEach(k => (RIBBON_LAYOUT[k] || []).forEach(g => g.cols.forEach(walk)));
  return out;
}

/** Sanity used by the test: every Alt-walk id is in the table, and the names all resolve. */
export function tableGaps() {
  const missing = Object.keys(COMMANDS).filter(k => !RIBBON_COMMANDS[k]);
  const badMenus = Object.keys(MENU_META).filter(k => !menuEntries(k).length && !MENU_META[k].items);
  return { missing, badMenus };
}

/**
 * A menu's [key, label] entries: MENUS, or, for a legacy path with no MENUS row (Alt O → O E),
 * the COMMANDS one letter deeper.
 */
export function menuEntries(key) {
  if (MENUS[key]) return MENUS[key];
  return Object.keys(COMMANDS).filter(np => np.length === key.length + 1 && np.startsWith(key)).map(np => [np.slice(-1), COMMANDS[np]]);
}
