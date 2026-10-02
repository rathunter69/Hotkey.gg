// app2/ui/components/keyboard.js — a keyboard drawn on the page (Reference; Wolf, 2026-10-02,
// point 17). The board is data: rows of keys with their widths in key units and the id a chord
// names them by. keyIdsOf() turns a reference chord ('Ctrl+Shift+$') into the board keys it uses
// ({Ctrl, Shift, 4}); chordOfEvent() turns a real key press into the same, so pressing a shortcut on
// your own keyboard finds it. Nothing here touches the DOM except keyboardHtml(), which returns markup.
//
//   KEYBOARD                       → [[{ id, label, w }]] the main block; NAV_CLUSTER the arrows and the six above them
//   keyIdsOf(chord, parseChord)    → [Set of key ids] one per alternative (only single-step chords; a sequence returns its first step)
//   chordOfEvent(e, platform)      → Set of key ids pressed, or null when the press is not a lookup
//   sameKeys(a, b)                 → true when two sets hold the same ids
//   keyboardHtml({ marks })        → the board; marks: { id: { g: group id, on: collected } }

const k = (id, w = 1, label = id) => ({ id, label, w });
export const KEYBOARD = [
  [k('Esc'), k('', 0.5), k('F1'), k('F2'), k('F3'), k('F4'), k('', 0.25), k('F5'), k('F6'), k('F7'), k('F8'), k('', 0.25), k('F9'), k('F10'), k('F11'), k('F12')],
  [k('`'), k('1'), k('2'), k('3'), k('4'), k('5'), k('6'), k('7'), k('8'), k('9'), k('0'), k('-'), k('='), k('Backspace', 2, 'Back')],
  [k('Tab', 1.5), k('Q'), k('W'), k('E'), k('R'), k('T'), k('Y'), k('U'), k('I'), k('O'), k('P'), k('['), k(']'), k('\\', 1.5)],
  [k('Caps', 1.75), k('A'), k('S'), k('D'), k('F'), k('G'), k('H'), k('J'), k('K'), k('L'), k(';'), k("'"), k('Enter', 2.25)],
  [k('Shift', 2.25), k('Z'), k('X'), k('C'), k('V'), k('B'), k('N'), k('M'), k(','), k('.'), k('/'), k('Shift', 2.75)],
  [k('Ctrl', 1.5), k('Win', 1.25), k('Alt', 1.25), k('Space', 6), k('Alt', 1.25), k('Menu', 1.25), k('Ctrl', 1.5)],
];
export const NAV_CLUSTER = [
  [k('', 1), k('', 1), k('', 1)],
  [k('Insert', 1, 'Ins'), k('Home'), k('PageUp', 1, 'PgUp')],
  [k('Delete', 1, 'Del'), k('End'), k('PageDown', 1, 'PgDn')],
  [k('', 1), k('', 1), k('', 1)],
  [k('', 1), k('↑'), k('', 1)],
  [k('←'), k('↓'), k('→')],
];

/** The shifted symbols a chord may name, and the key that types them on a US board. */
const SHIFTED = { '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=', '~': '`', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/' };
const ALIAS = { Escape: 'Esc', Del: 'Delete', PgUp: 'PageUp', PgDn: 'PageDown', Return: 'Enter', Spacebar: 'Space' };
const norm = key => { const a = ALIAS[key] || key; return /^[a-z]$/.test(a) ? a.toUpperCase() : a; };

/** The board keys a chord holds down, one set per alternative ('Ctrl+↑/↓' gives two). Pure. */
export function keyIdsOf(chord, parseChord) {
  const segs = parseChord(chord);
  if (!segs.length) return [];
  let combos = [[]];
  for (const alts of segs[0]) combos = combos.flatMap(c => alts.map(a => c.concat(a)));
  return combos.map(c => {
    const ids = new Set();
    for (const raw of c) {
      const key = norm(raw);
      if (SHIFTED[key] && key.length === 1) { ids.add('Shift'); ids.add(SHIFTED[key]); } else ids.add(key);
    }
    return ids;
  });
}

/** Every board key a chord touches, across its steps and alternatives (for colouring the board). Pure. */
export function keysTouched(chord, parseChord) {
  const out = new Set();
  for (const seg of parseChord(chord)) for (const alts of seg) for (const a of alts) { const key = norm(a); if (SHIFTED[key] && key.length === 1) { out.add('Shift'); out.add(SHIFTED[key]); } else out.add(key); }
  return out;
}

const CODE = { Backquote: '`', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Space: 'Space', Enter: 'Enter', NumpadEnter: 'Enter', Tab: 'Tab', Escape: 'Esc', Backspace: 'Backspace', Delete: 'Delete', Insert: 'Insert', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
/**
 * The keys of a real press, as board ids, or null when the press is not a lookup: a lookup holds Ctrl
 * (Cmd on a Mac) or is a function key, so the arrows, Enter and typing keep their usual jobs, and Alt
 * stays the Ribbon's. Pure over the event's fields.
 */
export function chordOfEvent(e, platform = 'win') {
  const ctrl = platform === 'mac' ? e.metaKey : e.ctrlKey;
  const code = String(e.code || '');
  const fkey = /^F\d{1,2}$/.test(code);
  if (!ctrl && !fkey) return null;
  if (e.altKey) return null;
  let key = CODE[code] || (/^Key[A-Z]$/.test(code) ? code.slice(3) : /^Digit\d$/.test(code) ? code.slice(5) : fkey ? code : '');
  if (!key) return null;
  const ids = new Set([key]);
  if (ctrl) ids.add('Ctrl');
  if (e.shiftKey) ids.add('Shift');
  return ids;
}
export const sameKeys = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
/** A press as words: 'Ctrl+Shift+4'. */
export const chordLabel = ids => ['Ctrl', 'Shift', 'Alt'].filter(m => ids.has(m)).concat([...ids].filter(x => !['Ctrl', 'Shift', 'Alt'].includes(x))).join('+');

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const keyHtml = (key, marks) => {
  if (!key.id) return `<i class="kb-gap" style="--w:${key.w}"></i>`;
  const m = marks[key.id];
  return `<i class="kb-key${m ? ' kb-used' : ''}${m && m.on ? ' kb-on' : ''}" data-k="${esc(key.id)}"${m ? ` data-g="${esc(m.g)}"` : ''} style="--w:${key.w}">${esc(key.label)}</i>`;
};
/** The board as markup: the main block and the navigation cluster, each key carrying its id. */
export function keyboardHtml({ marks = {} } = {}) {
  const rows = list => list.map(r => `<span class="kb-row">${r.map(key => keyHtml(key, marks)).join('')}</span>`).join('');
  return `<div class="kb" aria-hidden="true"><span class="kb-main">${rows(KEYBOARD)}</span><span class="kb-nav">${rows(NAV_CLUSTER)}</span></div>`;
}
