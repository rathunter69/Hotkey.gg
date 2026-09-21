// app2/engine/ribbon.js — the ribbon's data (tabs, menus, groups, icons, option tables) and the
// pure Alt-walk resolver. Lifted from index.html r24593–r24735 + r27463–r27641. No DOM, no state:
// the Session in keyboard.js owns `path`/`dialog` and asks stepPath() what a key means.

export const TABS = [
  { k: 'H', name: 'Home', live: true },
  { k: 'N', name: 'Insert', live: false },
  { k: 'P', name: 'Page Layout', live: false },
  { k: 'M', name: 'Formulas', live: true },
  { k: 'A', name: 'Data', live: true },
  { k: 'R', name: 'Review', live: false },
  { k: 'W', name: 'View', live: true },
];

export const MENUS = {
  'H': [['V', 'Paste'], ['1', 'Bold'], ['2', 'Italic'], ['3', 'Underline'], ['F', 'Font'], ['A', 'Align'], ['5', 'Indent −'], ['6', 'Indent +'], ['H', 'Fill'], ['B', 'Borders'], ['J', 'Cell styles'], ['W', 'Wrap'], ['K', 'Comma'], ['P', 'Percent'], ['9', 'Dec −'], ['0', 'Dec +'], ['I', 'Insert'], ['D', 'Delete'], ['O', 'Cells'], ['E', 'Clear'], ['U', 'Σ Sum']],
  'HV': [['V', 'Paste values'], ['S', 'Paste special…']],
  'HE': [['A', 'Clear all'], ['F', 'Clear formats'], ['C', 'Clear contents']],
  'HI': [['R', 'Insert rows'], ['C', 'Insert columns']],
  'HD': [['R', 'Delete rows'], ['C', 'Delete columns']],
  'HO': [['I', 'Autofit width'], ['A', 'Autofit height'], ['W', 'Column width…'], ['E', 'Format cells…']],
  'HB': [['O', 'Bottom'], ['P', 'Top'], ['L', 'Left'], ['R', 'Right'], ['N', 'No border'], ['A', 'All'], ['S', 'Outside'], ['T', 'Thick box'], ['B', 'Double bottom'], ['D', 'Top & bottom']],
  'HU': [['S', 'Sum']],
  'HA': [['L', 'Left'], ['C', 'Center'], ['R', 'Right'], ['N', '$ Accounting']],
  'HF': [['C', 'Font color'], ['G', 'Grow font'], ['K', 'Shrink font'], ['I', 'Fill']],
  'HFI': [['S', 'Series…'], ['D', 'Down'], ['R', 'Right']],
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

/** Every terminal command path the walk can fire, with its human label. */
export const COMMANDS = {
  'H1': 'Bold', 'H2': 'Italic', 'H3': 'Underline', 'H5': 'Decrease indent', 'H6': 'Increase indent',
  'HW': 'Wrap text', 'HK': 'Comma style', 'HP': 'Percent style', 'H9': 'Decrease decimal', 'H0': 'Increase decimal',
  'HAL': 'Align left', 'HAC': 'Center', 'HAR': 'Align right', 'HAN': 'Accounting number format',
  'HBO': 'Bottom border', 'HBP': 'Top border', 'HBL': 'Left border', 'HBR': 'Right border', 'HBN': 'No border',
  'HBA': 'All borders', 'HBS': 'Outside borders', 'HBT': 'Thick outside borders', 'HBB': 'Double bottom border', 'HBD': 'Top and bottom border',
  'HFC': 'Font color', 'HFG': 'Increase font size', 'HFK': 'Decrease font size', 'HFIS': 'Series…', 'HFID': 'Fill down', 'HFIR': 'Fill right',
  'HH': 'Fill color', 'HJ': 'Cell styles', 'HIR': 'Insert sheet rows', 'HIC': 'Insert sheet columns', 'HDR': 'Delete sheet rows', 'HDC': 'Delete sheet columns',
  'HOI': 'AutoFit column width', 'HOA': 'AutoFit row height', 'HOW': 'Column width…', 'HOE': 'Format cells…', 'OE': 'Format cells…',
  'HEA': 'Clear all', 'HEF': 'Clear formats', 'HEC': 'Clear contents', 'HUS': 'AutoSum', 'MUS': 'AutoSum', 'MP': 'Trace precedents', 'MD': 'Trace dependents',
  'HVV': 'Paste values', 'HVS': 'Paste special…', 'ES': 'Paste special…', 'ASA': 'Sort A to Z', 'ASD': 'Sort Z to A', 'WVG': 'Gridlines', 'WG': 'Gridlines',
};

/**
 * Resolve one KeyTip key at the current path.
 *   {kind:'command', np}        a terminal command
 *   {kind:'menu', path}         one level deeper
 *   {kind:'tab', path}          a live tab opened from the strip
 *   {kind:'dead', note}         a tab with nothing wired
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
  return { kind: 'reset' };
}

/** 'HBO' → 'Alt H B O' (the chord as a person reads it). */
export function chordText(np) { return 'Alt ' + np.split('').join(' '); }
