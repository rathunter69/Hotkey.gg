// app2/tests/hint-rules.js — the hint vocabulary law (C2 gap 7, framework v2 §6), as pure
// functions the lessons test and the standalone lesson checker share: Go To is a tool, not
// movement glue (another sheet, more than a screen away, or Go To Special), and no hint grinds
// more than three plain arrows in a row unless the goal is a deliberate slow round.
import { workbookState } from '../content/workbooks/index.js';

/** A hint as a keystroke script: glyphs → key names, '×N' repeats the key before it, connectives dropped, quoted text kept. */
export function hintScript(hint) {
  const out = [];
  for (const t of String(hint || '').match(/"[^"]*"|\S+/g) || []) {
    if (/^(then|…|,|and|or)$/.test(t)) continue;
    const m = /^×(\d+)$/.exec(t);
    if (m) { if (!out.length) throw new Error(`"${hint}": ×N needs a key before it`); const last = out[out.length - 1]; for (let i = 1; i < +m[1]; i++) out.push(last); continue; }
    out.push(t.startsWith('"') ? t : t.replace(/↑/g, 'Up').replace(/↓/g, 'Down').replace(/←/g, 'Left').replace(/→/g, 'Right').replace(/⌫/g, 'Backspace').replace(/↵/g, 'Enter'));
  }
  return out.join(' ');
}

export const hintTokens = keys => String(keys || '').match(/"[^"]*"|\S+/g) || [];
const CELL_RE = /^\$?([A-Z]{1,3})\$?(\d{1,7})$/;
const cellRC = ref => { const m = CELL_RE.exec(String(ref).replace(/^.*!/, '').split(':')[0].replace(/\$/g, '')); if (!m) return null; let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return { r: +m[2], c }; };
const isArrow = t => /^(↑|↓|←|→|Up|Down|Left|Right)$/.test(t);

/** Every Ctrl+G / F5 in a hint, judged: null when fine, else the reason it reads as movement glue. */
export function goToOffence(tokens, anchor) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== 'Ctrl+G' && tokens[i] !== 'F5') continue;
    const after = tokens.slice(i + 1, i + 4);
    if (after.some(t => t === 'Alt+S')) { continue; }                       // the door to Go To Special
    const quoted = after.find(t => t.startsWith('"'));
    const ref = quoted ? quoted.slice(1, -1) : '';
    if (ref.includes('!')) { anchor = cellRC(ref) || anchor; continue; }    // another sheet: a jump, not glue
    const to = cellRC(ref);
    if (!to) return `types "${ref}" — not a reference and not Go To Special`;
    if (anchor && Math.abs(to.r - anchor.r) < 20 && Math.abs(to.c - anchor.c) < 10) {
      return `jumps to ${ref} from ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[anchor.c - 1] || '?'}${anchor.r} — a screen or less away`;
    }
    anchor = to;
  }
  return null;
}
/**
 * More than three consecutive plain arrows (×N counts as N presses)? Arrows inside the Ribbon or
 * a dialog (after a bare Alt, Ctrl+G, F5 or Ctrl+1, until Enter or Esc closes it) are list
 * navigation, not sheet movement, and never count.
 */
export function arrowGrind(tokens) {
  let streak = 0, prevArrow = false, inDialog = false;
  for (const t of tokens) {
    if (t === 'Alt' || t === 'Ctrl+G' || t === 'F5' || t === 'Ctrl+1') { inDialog = true; streak = 0; prevArrow = false; continue; }
    if (/^(↵|Enter|Esc|Escape)$/.test(t)) { inDialog = false; streak = 0; prevArrow = false; continue; }
    if (inDialog) continue;
    const rep = /^×(\d+)$/.exec(t);
    if (rep && prevArrow) { streak += +rep[1] - 1; }
    else if (isArrow(t)) { streak += 1; prevArrow = true; }
    else { streak = 0; prevArrow = false; continue; }
    if (streak > 3) return true;
  }
  return false;
}
/** Where the hint's cursor last verifiably stood before goal `gi`: the previous goals' last typed ref, else the state's active cell. */
export function anchorBefore(lesson, gi) {
  for (let j = gi - 1; j >= 0; j--) {
    const qs = hintTokens(lesson.goals[j].keys).filter(t => t.startsWith('"'));
    for (let k = qs.length - 1; k >= 0; k--) { const rc = cellRC(qs[k].slice(1, -1).split(':').pop()); if (rc) return rc; }
  }
  try {
    const st = workbookState(lesson.workbook, lesson.state.before);
    const sh = st.sheets.find(s => s.active) || st.sheets[0];
    return cellRC((sh && typeof sh.active === 'string' && sh.active) || 'A1') || { r: 1, c: 1 };
  } catch (e) { return { r: 1, c: 1 }; }
}

