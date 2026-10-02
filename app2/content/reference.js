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
//     addin: 'Macabacus' | 'FactSet' | null,
//     native rows also: group, chapter, ribbon, legacy, alternatives (from content/keys.csv) }
// lessonId is the lesson the keys sheet names; a row that names none takes the first lesson in the
// catalogue whose `concepts` list the entry's concept.

import { LESSONS } from './index.js';
import { KEYS } from './keys.js';

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
for (const l of LESSONS.filter(l => l.section !== 'Welcome').concat(LESSONS.filter(l => l.section === 'Welcome'))) for (const c of l.teaches || l.concepts || []) if (!(c in LESSON_BY_CONCEPT)) LESSON_BY_CONCEPT[c] = l.id;

/** The id of the first lesson that teaches a concept (Welcome lessons last), or null. */
export const lessonForConcept = concept => (concept && LESSON_BY_CONCEPT[concept]) || null;

/* ---------- the reference ---------- */

// The course's keys come from the keys sheet, content/keys.csv (M50; inlined as content/keys.js by
// tests/copy-build.js): one row per key with its group, Windows key, Ribbon route, legacy route,
// Mac key, taught-in lesson and accepted alternatives. Rows sit in category order.
const NATIVE_ROWS = KEYS;

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

/** A native row from the keys sheet: the lesson the sheet names, else the one that teaches its concept. */
function native(k) {
  const concept = k.concept || null;
  return { id: k.id, name: k.command, what: k.what, category: k.category, group: k.group, win: k.win, mac: k.mac || macChord(k.win), macNote: k.mac ? k.mac_note : macNote(k.win), note: k.note || '', concept, addin: null,
    lessonId: k.lesson || lessonForConcept(concept), chapter: Number(k.chapter) || null, ribbon: k.ribbon || '', legacy: k.legacy || '', alternatives: k.alternatives || '' };
}

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
export const CATEGORIES = [...new Set(NATIVE_ROWS.map(k => k.category)), ...ADDINS.map(s => s[0])];

/** Per-category notes (only the add-ins carry one). */
export const CATEGORY_NOTES = Object.fromEntries(ADDINS.map(([name, note]) => [name, note]));

export const ADDIN_DISCLAIMER = 'Macabacus is a trademark of Macabacus Inc.; FactSet is a trademark of FactSet Research Systems Inc. hotkey.gg is independent and not affiliated with or endorsed by either. The add-in sections describe published default keyboard shortcuts for training compatibility.';

/** The whole reference, in display order. */
export const REFERENCE = [
  ...NATIVE_ROWS.map(native),
  ...ADDINS.flatMap(([name, , rows]) => rows.map(([win, label, what]) => finish(name, { id: `${name.toLowerCase()}-${slug(win)}`, win, name: label, what, addin: name }))),
];

export const REFERENCE_BY_ID = Object.fromEntries(REFERENCE.map(e => [e.id, e]));
export const referenceById = id => REFERENCE_BY_ID[id] || null;
/** Every entry whose Windows chord matches (several rows can share a chord: Enter moves and commits). */
export const referenceByChord = chord => REFERENCE.filter(e => normChord(e.win) === normChord(chord));
