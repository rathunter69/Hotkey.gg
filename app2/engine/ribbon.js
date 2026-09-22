// app2/engine/ribbon.js — the ribbon's data (tabs, menus, groups, icons, option tables) and the
// pure Alt-walk resolver. Lifted from index.html r24593–r24735 + r27463–r27641. No DOM, no state:
// the Session in keyboard.js owns `path`/`dialog` and asks stepPath() what a key means.

export const TABS = [
  { k: 'F', name: 'File', live: true, backstage: true },   // the backstage: a menu, not a tab of groups
  { k: 'H', name: 'Home', live: true },
  { k: 'N', name: 'Insert', live: false },
  { k: 'P', name: 'Page Layout', live: true },
  { k: 'M', name: 'Formulas', live: true },
  { k: 'A', name: 'Data', live: true },
  { k: 'R', name: 'Review', live: false },
  { k: 'W', name: 'View', live: true },
];

export const MENUS = {
  // File backstage (Excel's KeyTips): everything but Options is dead in the engine (DEAD below)
  'F': [['I', 'Info'], ['N', 'New'], ['O', 'Open'], ['S', 'Save'], ['A', 'Save As'], ['P', 'Print'], ['H', 'Share'], ['E', 'Export'], ['C', 'Close'], ['D', 'Account'], ['T', 'Options']],
  'H': [['V', 'Paste'], ['1', 'Bold'], ['2', 'Italic'], ['3', 'Underline'], ['F', 'Font'], ['A', 'Align'], ['5', 'Indent −'], ['6', 'Indent +'], ['H', 'Fill'], ['B', 'Borders'], ['J', 'Cell styles'], ['W', 'Wrap'], ['K', 'Comma'], ['P', 'Percent'], ['9', 'Dec −'], ['0', 'Dec +'], ['I', 'Insert'], ['D', 'Delete'], ['O', 'Cells'], ['E', 'Clear'], ['U', 'Σ Sum']],
  'HV': [['V', 'Paste values'], ['S', 'Paste special…']],
  'HE': [['A', 'Clear all'], ['F', 'Clear formats'], ['C', 'Clear contents']],
  'HI': [['R', 'Insert rows'], ['C', 'Insert columns'], ['S', 'Insert sheet']],
  'HD': [['R', 'Delete rows'], ['C', 'Delete columns'], ['S', 'Delete sheet']],
  'HO': [['I', 'Autofit width'], ['A', 'Autofit height'], ['W', 'Column width…'], ['R', 'Rename sheet'], ['M', 'Move or copy sheet…'], ['E', 'Format cells…']],   // Excel's Format menu: R and M sit among the sheet items, E last
  'HB': [['O', 'Bottom'], ['P', 'Top'], ['L', 'Left'], ['R', 'Right'], ['N', 'No border'], ['A', 'All'], ['S', 'Outside'], ['T', 'Thick box'], ['B', 'Double bottom'], ['D', 'Top & bottom']],
  'HU': [['S', 'Sum']],
  'HA': [['L', 'Left'], ['C', 'Center'], ['R', 'Right'], ['N', '$ Accounting']],
  'HF': [['C', 'Font color'], ['G', 'Grow font'], ['K', 'Shrink font'], ['I', 'Fill'], ['D', 'Find & Select']],   // Excel shares the H F prefix between Font and Fill / Find & Select
  'HFI': [['S', 'Series…'], ['D', 'Down'], ['R', 'Right']],
  'HFD': [['F', 'Find…'], ['R', 'Replace…'], ['G', 'Go To…'], ['S', 'Go To Special…'], ['U', 'Formulas'], ['N', 'Constants'], ['V', 'Data Validation'], ['O', 'Select Objects']],
  // Page Layout: Excel's real KeyTips — Margins M, Orientation O, Size S Z, Print Area A, Breaks B, Background G, Print Titles I, the Page Setup launcher S P
  'P': [['M', 'Margins'], ['O', 'Orientation'], ['S', 'Page Setup'], ['A', 'Print Area'], ['B', 'Breaks'], ['G', 'Background'], ['I', 'Print Titles']],
  'PO': [['P', 'Portrait'], ['L', 'Landscape']],
  'PS': [['P', 'Page Setup…'], ['Z', 'Size']],
  'M': [['U', 'Σ AutoSum'], ['P', 'Trace precedents'], ['D', 'Trace dependents']],
  'MU': [['S', 'Sum']],
  'A': [['S', 'Sort']],
  'AS': [['A', 'Sort A→Z'], ['D', 'Sort Z→A']],
  'E': [['S', 'Paste special…']],
  'W': [['V', 'Show']],
  'WV': [['G', 'Gridlines']],
};

/** Excel's real Home-tab groups — the renderer draws each as a labelled cluster. */
export const RIBBON_GROUPS = {
  'A': [['Sort & Filter', ['S']]],
  'P': [['Page Setup', ['M', 'O', 'S', 'A', 'B', 'G', 'I']]],
  'H': [
    ['Clipboard', ['V']],
    ['Font', ['1', '2', '3', 'F', 'B', 'H']],
    ['Alignment', ['A', '5', '6', 'W']],
    ['Number', ['K', 'P', '9', '0']],
    ['Styles', ['J']],
    ['Cells', ['I', 'D', 'O']],
    ['Editing', ['U', 'E']],
  ],
};

const _rs = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
export const RIBBON_ICONS = {
  '1': '<span class="ri-g" style="font-weight:800">B</span>',
  '2': '<span class="ri-g" style="font-style:italic;font-family:Georgia,\'Times New Roman\',serif">I</span>',
  '3': '<span class="ri-g" style="text-decoration:underline">U</span>',
  'F': '<span class="ri-g" style="font-family:Georgia,serif;letter-spacing:-1px">A<span style="font-size:.62em;vertical-align:2px">a</span></span>',
  'K': '<span class="ri-g" style="font-size:10.5px;letter-spacing:-.5px">,000</span>',
  'P': '<span class="ri-g">%</span>',
  '9': '<span class="ri-g" style="font-size:10px;letter-spacing:-.5px">.0<span style="opacity:.4">◂</span></span>',
  '0': '<span class="ri-g" style="font-size:10px;letter-spacing:-.5px">.00<span style="opacity:.65">▸</span></span>',
  'U': '<span class="ri-g" style="font-weight:700">Σ</span>',
  'V': _rs + '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
  'A': _rs + '<path d="M4 6h16M7 12h10M4 18h16"/></svg>',
  '5': _rs + '<path d="M20 6H10M20 18H10M20 12h-9"/><path d="M6 9l-3 3 3 3"/></svg>',
  '6': _rs + '<path d="M20 6H10M20 18H10M20 12h-9"/><path d="M3 9l3 3-3 3"/></svg>',
  'H': _rs + '<path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z"/></svg>',
  'B': _rs + '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18M12 3v18"/></svg>',
  'J': _rs + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>',
  'W': _rs + '<path d="M4 6h16M4 12h12a3 3 0 1 1 0 6h-3"/><path d="M16 15l-3 3 3 3"/><path d="M4 18h5"/></svg>',
  'I': _rs + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>',
  'D': _rs + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
  'O': _rs + '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M14 4v6h6"/></svg>',
  'E': _rs + '<path d="M7 21h11"/><path d="M6 15l6-6 7 7-4 4h-5z"/></svg>',
};
export const RIBBON_MENU_ICONS = { 'H': null, 'A': {
  'S': _rs + '<path d="M7 4v14M4 15l3 3 3-3"/><text x="14" y="10" font-size="8" font-weight="700" stroke="none" fill="currentColor">AZ</text></svg>',
} };

export const FMT_OPTS = [
  ['G', 'General'], ['N', '1,234'], ['C', '$1,234'], ['P', '12.3%'],
  ['X', '8.2x'], ['D', 'Mar-26'], ['S', '÷ 000s'], ['M', '÷ millions'],
  ['E', 'superscript ¹'], ['K', 'strikethrough'], ['A', 'center across'],
];
export const PASTE_OP_OPTS = [['O', 'None', 'none'], ['M', 'Multiply', 'multiply'], ['D', 'Add', 'add'], ['S', 'Subtract', 'subtract'], ['I', 'Divide', 'divide']];
export const PASTE_OPTS = [
  ['A', 'All', 'all'], ['F', 'Formulas', 'formulas'], ['V', 'Values', 'values'],
  ['T', 'Formats', 'formats'], ['U', 'Values & number formats', 'valuesnum'], ['W', 'Column widths', 'colwidths'],
  ['E', 'Transpose', 'transpose'],
];

export const tabName = k => (TABS.find(t => t.k === k) || { name: k }).name;

/**
 * Menu items Excel has that the engine does not: the walk shows them (so the menus read like
 * Excel's) and a press leaves the path where it is with a note, exactly as a dead tab does.
 */
export const DEAD = {
  'FI': 'Info', 'FN': 'New', 'FO': 'Open', 'FS': 'Save', 'FA': 'Save As', 'FP': 'Print', 'FH': 'Share', 'FE': 'Export', 'FC': 'Close', 'FD': 'Account',
  'HFDF': 'Find', 'HFDR': 'Replace', 'HFDS': 'Go To Special', 'HFDU': 'Formulas', 'HFDN': 'Constants', 'HFDV': 'Data Validation', 'HFDO': 'Select Objects',
  'PM': 'Margins', 'PA': 'Print Area', 'PB': 'Breaks', 'PG': 'Background', 'PI': 'Print Titles', 'PSZ': 'Size',
};

/* ---------------- Excel Options, Page Setup and the Quick Access Toolbar (data the Session reads) ---------------- */
/** The Options dialog's page list, in Excel's order. Pages with a `key` are live (their accelerator letter); the rest are shown dimmed. */
export const OPTIONS_PAGES = [
  { k: 'general', label: 'General' }, { k: 'formulas', label: 'Formulas', key: 'F' }, { k: 'data', label: 'Data' }, { k: 'proofing', label: 'Proofing' },
  { k: 'save', label: 'Save' }, { k: 'language', label: 'Language' }, { k: 'accessibility', label: 'Accessibility' }, { k: 'advanced', label: 'Advanced', key: 'V' },
  { k: 'ribbon', label: 'Customize Ribbon' }, { k: 'qat', label: 'Quick Access Toolbar', key: 'Q' }, { k: 'addins', label: 'Add-ins' }, { k: 'trust', label: 'Trust Center' },
];
export const OPTIONS_LIVE_PAGES = OPTIONS_PAGES.filter(p => p.key).map(p => p.k);   // ['formulas', 'advanced', 'qat']

/**
 * Quick Access Toolbar commands by id. `np` runs an Alt-walk command (keyboard.js execCommand),
 * `act` a Sheet operation with no Alt path (undo, redo, copy, paste); neither = a real Excel
 * command the engine lacks (the toolbar shows it, a press is a no-op). Labels are Excel's.
 */
export const QAT_COMMANDS = {
  autosum: { label: 'AutoSum', np: 'HUS', keys: 'Alt+=' },
  bold: { label: 'Bold', np: 'H1', keys: 'Ctrl+B' },
  borders: { label: 'Borders', np: 'HBA' },
  center: { label: 'Center', np: 'HAC' },
  copy: { label: 'Copy', act: 'copy', keys: 'Ctrl+C' },
  decDecimal: { label: 'Decrease Decimal', np: 'H9' },
  decFont: { label: 'Decrease Font Size', np: 'HFK' },
  deleteRows: { label: 'Delete Sheet Rows', np: 'HDR' },
  fillColor: { label: 'Fill Color', np: 'HH' },
  fontColor: { label: 'Font Color', np: 'HFC' },
  formatCells: { label: 'Format Cells', np: 'HOE', keys: 'Ctrl+1' },
  formatPainter: { label: 'Format Painter' },
  freezePanes: { label: 'Freeze Panes' },
  incDecimal: { label: 'Increase Decimal', np: 'H0' },
  incFont: { label: 'Increase Font Size', np: 'HFG' },
  insertRows: { label: 'Insert Sheet Rows', np: 'HIR' },
  mergeCenter: { label: 'Merge & Center' },
  paste: { label: 'Paste', act: 'paste', keys: 'Ctrl+V' },
  pasteSpecial: { label: 'Paste Special', np: 'HVS', keys: 'Ctrl+Alt+V' },
  pasteValues: { label: 'Paste Values', np: 'HVV' },
  printPreview: { label: 'Print Preview and Print' },
  redo: { label: 'Redo', act: 'redo', keys: 'Ctrl+Y' },
  save: { label: 'Save', keys: 'Ctrl+S' },
  sortAsc: { label: 'Sort Ascending', np: 'ASA' },
  sortDesc: { label: 'Sort Descending', np: 'ASD' },
  spelling: { label: 'Spelling', keys: 'F7' },
  undo: { label: 'Undo', act: 'undo', keys: 'Ctrl+Z' },
};
/** Options › Quick Access Toolbar › "Choose commands from: Popular Commands" — Excel lists them alphabetically. */
export const POPULAR_COMMANDS = Object.keys(QAT_COMMANDS).sort((a, b) => QAT_COMMANDS[a].label.localeCompare(QAT_COMMANDS[b].label));
/** Excel's default toolbar. */
export const QAT_DEFAULT = ['save', 'undo', 'redo'];

/** Every terminal command path the walk can fire, with its human label. */
export const COMMANDS = {
  'H1': 'Bold', 'H2': 'Italic', 'H3': 'Underline', 'H5': 'Decrease indent', 'H6': 'Increase indent',
  'HW': 'Wrap text', 'HK': 'Comma style', 'HP': 'Percent style', 'H9': 'Decrease decimal', 'H0': 'Increase decimal',
  'HAL': 'Align left', 'HAC': 'Center', 'HAR': 'Align right', 'HAN': 'Accounting number format',
  'HBO': 'Bottom border', 'HBP': 'Top border', 'HBL': 'Left border', 'HBR': 'Right border', 'HBN': 'No border',
  'HBA': 'All borders', 'HBS': 'Outside borders', 'HBT': 'Thick outside borders', 'HBB': 'Double bottom border', 'HBD': 'Top and bottom border',
  'HFC': 'Font color', 'HFG': 'Increase font size', 'HFK': 'Decrease font size', 'HFIS': 'Series…', 'HFID': 'Fill down', 'HFIR': 'Fill right',
  'HH': 'Fill color', 'HJ': 'Cell styles', 'HIR': 'Insert sheet rows', 'HIC': 'Insert sheet columns', 'HDR': 'Delete sheet rows', 'HDC': 'Delete sheet columns',
  'HIS': 'Insert sheet', 'HDS': 'Delete sheet', 'HOR': 'Rename sheet', 'HOM': 'Move or copy sheet…',
  'HOI': 'AutoFit column width', 'HOA': 'AutoFit row height', 'HOW': 'Column width…', 'HOE': 'Format cells…', 'OE': 'Format cells…',
  'HEA': 'Clear all', 'HEF': 'Clear formats', 'HEC': 'Clear contents', 'HUS': 'AutoSum', 'MUS': 'AutoSum', 'MP': 'Trace precedents', 'MD': 'Trace dependents',
  'HVV': 'Paste values', 'HVS': 'Paste special…', 'ES': 'Paste special…', 'ASA': 'Sort A to Z', 'ASD': 'Sort Z to A', 'WVG': 'Gridlines', 'WG': 'Gridlines',
  'FT': 'Excel Options…', 'HFDG': 'Go To…', 'PSP': 'Page Setup…', 'POP': 'Portrait', 'POL': 'Landscape',
};

/**
 * Resolve one KeyTip key at the current path.
 *   {kind:'command', np}        a terminal command
 *   {kind:'menu', path}         one level deeper
 *   {kind:'tab', path}          a live tab opened from the strip
 *   {kind:'dead', note}         a tab, or a menu item (DEAD), with nothing wired — the path stays put
 *   {kind:'reset'}              an unknown step — back to the tab strip
 */
export function stepPath(path, key) {
  if (path.length === 0) {
    if (key === '=') return { kind: 'command', np: '=' };
    if (key === 'E' || key === 'O') return { kind: 'menu', path: [key] };
    const t = TABS.find(x => x.k === key);
    if (t && t.live) return { kind: 'tab', path: [key] };
    if (t) return { kind: 'dead', note: t.name + ' — nothing here yet' };
    return { kind: 'ignore' };
  }
  const np = path.join('') + key;
  if (COMMANDS[np] !== undefined) return { kind: 'command', np };
  if (MENUS[np] !== undefined) return { kind: 'menu', path: path.concat(key) };
  if (DEAD[np] !== undefined) return { kind: 'dead', note: DEAD[np] + ' — nothing here yet' };
  return { kind: 'reset' };
}

/** 'HBO' → 'Alt H B O' (the chord as a person reads it). */
export function chordText(np) { return 'Alt ' + np.split('').join(' '); }
