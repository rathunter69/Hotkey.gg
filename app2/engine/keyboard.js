// app2/engine/keyboard.js — the keyboard layer. Headless: turn key events into Sheet operations.
//
//   const s = new Session(new Sheet());
//   s.type('=SUM(A1:A3)'); s.press('Enter');        // or s.run('"=SUM(A1:A3)" Enter')
//   s.sheet.value('A4')
//
// A Session owns everything the old keydown handler kept in module globals (index.html
// r28413–r29130): the edit buffer and caret, Enter/Edit/Point modes, the Alt ribbon walk with its
// dialogs, the Tab-run latch and the key log. It never touches the DOM; ui/sheet-view.js reads
// `session` after every key to paint. Every Excel-parity rule the old build encoded is kept:
//   · typing replaces (Enter mode: arrows commit), F2 edits (arrows move the caret), F2 toggles
//   · an arrow inside a formula points: re-points a bare trailing ref, else appends anchor+step;
//     Shift grows a range, Ctrl jumps to a block edge, typing/Home/End/F2 exit point mode, Backspace deletes
//     the whole live ref, F4 cycles $ (never on a name such as LOG10 or a ref outside the sheet)
//   · Enter ↓ / Shift+Enter ↑ / Tab → / Shift+Tab ←; Enter after a Tab run returns home, one row down
//   · Ctrl+Enter fills the selection (refs translate per cell) and stays put
//   · Alt opens the ribbon; letters walk MENUS; Esc backs out one level; a bad letter resets to the strip
//   · Delete clears the selection (formats kept); Backspace opens the active cell as an empty Enter-mode
//     edit — the sheet is untouched until ↵ commits it (an empty entry over content clears the cell), Esc restores
//   · every edit, stamp and jump acts on the displayed active cell (Sheet.dispActive) — the white cell of a
//     row/column/all selection — never on the moving corner
//   · ↵ / Shift+↵ / Tab / Shift+Tab pressed while editing are logged (on the edited cell) before they commit
//   · the workbook: `sheets` [{name, sheet}], `sheet` is always the active one; Ctrl+PgDn / Ctrl+PgUp
//     step between sheets (no wrap); Go To (Ctrl+G, F5) jumps to a cell or selects a range
//   · sheet management, each a Home-tab command with a card where Excel has one: Shift+F11 / Alt H I S
//     insert a sheet before the active one; Alt H O R (or a double-click on the tab) opens Rename
//     Sheet with the name selected; Alt H D S deletes the active sheet — at once when blank, after
//     Excel's "permanently delete" confirm when it holds anything, never the last sheet; Alt H O M
//     opens Move or Copy (↑ ↓ pick the sheet it goes before or "(move to end)", C = Create a copy)
//   · settings Excel keeps outside the grid (calculation mode, iterative calculation, gridlines, the
//     Quick Access Toolbar, page setup) are RECORDED by real-looking dialogs (Alt F T, Alt P S P):
//     the dialog edits a draft (`dlg`), ↵ = OK writes it into `settings`, Esc = Cancel discards it

import { Sheet, FONT_SWATCHES, FILL_SWATCHES, CELL_STYLES, CF_STYLE_KEYS, CF_BAR_COLORS, CF_SCALES, cfOperand } from './sheet.js';
import { evalFormula, formulaRefs, translateFormula, parses } from './formula.js';
import { builtinCode } from './numfmt.js';
import { refKey, parseRef, parseRange, rangeText } from './refs.js';
import { stepPath, PASTE_OPTS, PASTE_OP_OPTS, QAT_COMMANDS, QAT_DEFAULT, POPULAR_COMMANDS, OPTIONS_LIVE_PAGES } from './ribbon.js';

const ARROWS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
const ARROWSYM = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
const OPERATOR_BOUNDARY = /[=+\-*/^(,&<>]$/;
const REF_TAIL = /(\$?[A-Za-z]{1,3}\$?\d+)$/;
const IDENT_CHAR = /[A-Za-z0-9_.$]/;
/** A bare cell reference ending `s` ({ref, start}), or null — the tail of a longer name (DAYS360 → AYS360, ATAN2 → TAN2) is not one. */
function refTail(s) {
  const m = REF_TAIL.exec(s); if (!m) return null;
  const start = s.length - m[1].length;
  if (start > 0 && IDENT_CHAR.test(s[start - 1])) return null;
  return { ref: m[1], start };
}
const SHIFTED = { '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+', '`': '~', ';': ':', ',': '<', '.': '>', '/': '?', '[': '{', ']': '}', '\\': '|', "'": '"' };
const KEY_ALIASES = { esc: 'Escape', escape: 'Escape', enter: 'Enter', return: 'Enter', tab: 'Tab', space: ' ', spacebar: ' ',
  up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', arrowup: 'ArrowUp', arrowdown: 'ArrowDown', arrowleft: 'ArrowLeft', arrowright: 'ArrowRight',
  home: 'Home', end: 'End', delete: 'Delete', del: 'Delete', backspace: 'Backspace', bs: 'Backspace', pageup: 'PageUp', pagedown: 'PageDown', pgup: 'PageUp', pgdn: 'PageDown',
  alt: 'Alt', ctrl: 'Control', control: 'Control', shift: 'Shift', f1: 'F1', f2: 'F2', f4: 'F4', f5: 'F5', f9: 'F9', plus: '+', minus: '-', equals: '=', equal: '=' };

/** Physical-key code for a character (so Alt walks work on any layout, like the old codeToChar). */
export function codeFor(key) {
  if (/^[a-z]$/i.test(key)) return 'Key' + key.toUpperCase();
  if (/^[0-9]$/.test(key)) return 'Digit' + key;
  if (key === '=' || key === '+') return 'Equal';
  if (key === '-' || key === '_') return 'Minus';
  return '';
}
function codeToChar(code, k) {
  if (/^Key[A-Z]$/.test(code || '')) return code.slice(3);
  if (/^Digit[0-9]$/.test(code || '')) return code.slice(5);
  if (code === 'Equal') return '=';
  const up = (k && k.length === 1) ? k.toUpperCase() : '';
  return /^[A-Z0-9=]$/.test(up) ? up : '';
}

/**
 * Parse a key spec such as 'Ctrl+Shift+ArrowDown', 'Alt', 'Enter', 'h', 'Ctrl+1' into an event.
 * Ctrl+digit chords produce the shifted character when Shift is held (Ctrl+Shift+1 → '!').
 */
const MODIFIERS = new Set(['ctrl', 'control', 'cmd', 'meta', 'shift', 'alt', 'option']);
const hasAlias = t => Object.prototype.hasOwnProperty.call(KEY_ALIASES, t.toLowerCase());
/** 'Ctrl+Shift+H' → { mods: ['ctrl','shift'], keyTok: 'H' }. 'Ctrl++' splits to ['Ctrl','',''], so the last token was a literal '+'. */
function splitSpec(spec) {
  const parts = String(spec).split('+');
  let keyTok = parts.pop();
  if (keyTok === '' && parts.length) { keyTok = '+'; parts.pop(); }
  return { mods: parts.map(p => p.toLowerCase()), keyTok };
}
/** A key a script may name: one character, an alias (Enter, Esc, Down, Alt, …) or an F-key. */
const isKeyToken = t => t.length === 1 || hasAlias(t) || /^F\d{1,2}$/i.test(t);

export function parseKeySpec(spec) {
  const { mods, keyTok } = splitSpec(spec);
  const ev = { key: keyTok, ctrlKey: mods.includes('ctrl') || mods.includes('control') || mods.includes('cmd') || mods.includes('meta'), shiftKey: mods.includes('shift'), altKey: mods.includes('alt') || mods.includes('option'), metaKey: false };
  if (hasAlias(keyTok)) ev.key = KEY_ALIASES[keyTok.toLowerCase()];
  if (ev.key.length === 1) {
    if (ev.shiftKey) { if (/[a-z]/.test(ev.key)) ev.key = ev.key.toUpperCase(); else if (SHIFTED[ev.key]) ev.key = SHIFTED[ev.key]; }
    else if (/[A-Z]/.test(ev.key) && (ev.ctrlKey || ev.altKey)) ev.key = ev.key.toLowerCase();
  }
  ev.code = codeFor(ev.key.length === 1 ? ev.key : '');
  return ev;
}

/**
 * Parse a keystroke script: whitespace-separated key specs; a double-quoted string types its
 * characters. Example: '"Weekly Sales Report" Enter Up Ctrl+B Alt H B O'.
 * A token that is neither a key spec nor quoted text throws (naming the token) rather than being
 * dropped; a held KeyTip chord such as Alt+H expands to Alt then H, which is what a browser delivers.
 */
export function parseKeyScript(script) {
  if (Array.isArray(script)) return script.flatMap(parseKeyScript);
  const out = []; const s = String(script); let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    // "…" types its characters; '…' does the same for text that itself carries double quotes (a TEXT() formula)
    if (ch === '"' || ch === "'") { let j = i + 1, t = ''; while (j < s.length && s[j] !== ch) { t += s[j++]; } out.push({ type: 'text', text: t }); i = j + 1; continue; }
    let j = i; while (j < s.length && !/\s/.test(s[j])) j++;
    const tok = s.slice(i, j); i = j;
    if (/^[0-9.]{2,}$/.test(tok)) { out.push({ type: 'text', text: tok }); continue; }   // 20 types two digits; a single digit is the same either way
    const { mods, keyTok } = splitSpec(tok);
    if (!isKeyToken(keyTok) || mods.some(m => !MODIFIERS.has(m))) throw new Error(`parseKeyScript: unknown key "${tok}" — quote text as "…"`);
    const alt = mods.includes('alt') || mods.includes('option'), ctrl = mods.some(m => m === 'ctrl' || m === 'control' || m === 'cmd' || m === 'meta');
    if (alt && !ctrl && /^[A-Za-z0-9]$/.test(keyTok)) {   // Alt+H held = Alt, then H (Alt+= and Ctrl+Alt+V stay chords)
      out.push({ type: 'press', spec: 'Alt' }, { type: 'press', spec: mods.filter(m => m !== 'alt' && m !== 'option').concat(keyTok).join('+') }); continue;
    }
    out.push({ type: 'press', spec: tok });
  }
  return out;
}

/* ---------------- workbook helpers ---------------- */
export const SHEET_NAME_MAX = 31;
/** Excel's rule for a sheet name: 1–31 characters, none of [ ] : * ? / \, not blank. */
export function isSheetName(name) {
  const t = String(name == null ? '' : name);
  return t.length >= 1 && t.length <= SHEET_NAME_MAX && t.trim().length > 0 && !/[\[\]:*?/\\]/.test(t);
}
/** 'Sheet2', 'Sheet3', … — the first Sheet<n> not already in `sheets` (Excel numbers from the count). */
export function nextSheetName(sheets) {
  const taken = new Set(sheets.map(x => String(x.name).toLowerCase()));
  for (let n = sheets.length + 1; ; n++) if (!taken.has('sheet' + n)) return 'Sheet' + n;
}
/** The recorded settings, fresh. `gridlines` is an accessor on the ACTIVE sheet's flag, so the two can never drift. */
function makeSettings(session) {
  const st = { calcMode: 'automatic', iterative: false, maxIterations: 100, maxChange: 0.001 };
  Object.defineProperty(st, 'gridlines', { enumerable: true, get: () => !!session.sheet.gridlines, set: v => { session.sheet.gridlines = !!v; } });
  st.qat = QAT_DEFAULT.slice();
  st.showFormulas = false;   // Ctrl+` / Formulas › Show Formulas (C2 gap 5): the view paints formula text instead of values
  st.pageSetup = { orientation: 'portrait', scaling: 'adjust', adjustTo: 100, fitWide: 1, fitTall: 1,
    titlesRows: '', footer: { left: '', centre: '', right: '' }, printGridlines: false };   // C2 gap 6: Sheet and Header/Footer pages
  return st;
}
const clampInt = (v, lo, hi, dflt) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : dflt; };
/** Page Setup's typed-text controls (Sheet › Rows to repeat at top; Header/Footer › the three footer sections). */
const PAGESETUP_TEXT = new Set(['titlesRows', 'footL', 'footC', 'footR']);
/** 'Rows to repeat at top' as Excel shows it back: '$1:$3' / '1:3' / '2' → '$1:$3' / '$2:$2'; blank is no titles (''); anything else is not a reference (null — Excel refuses it). */
export function normTitlesRows(text) {
  const t = String(text == null ? '' : text);
  if (!t.trim()) return '';
  const m = /^\s*\$?(\d{1,7})(?:\s*:\s*\$?(\d{1,7}))?\s*$/.exec(t);
  if (!m) return null;
  const a = +m[1], b = m[2] == null ? a : +m[2];
  if (a < 1 || b < a) return null;
  return '$' + a + ':$' + b;
}
export const REF_NOT_VALID = 'Reference is not valid.';
/** Footer text with Excel's field codes canonical: &[file] → &[File], &[DATE] → &[Date], &[page] → &[Page], &[pages] → &[Pages], &[tab] → &[Tab]. */
export function normFooterText(text) {
  const CANON = { file: 'File', date: 'Date', page: 'Page', pages: 'Pages', tab: 'Tab', time: 'Time', path: 'Path' };
  return String(text == null ? '' : text).slice(0, 64).replace(/&\[([a-z]+)\]/gi, (m, w) => (CANON[w.toLowerCase()] ? '&[' + CANON[w.toLowerCase()] + ']' : m));
}
const DIALOGS_WB = new Set(['goto', 'options', 'pagesetup', 'renamesheet', 'deletesheet', 'movesheet', 'find', 'gotospecial', 'group', 'numfmt', 'condfmt', 'condrules', 'databar', 'colorscale']);   // the dialogs dialogKey drives
const TYPED_DIALOGS = new Set(['renamesheet', 'find', 'numfmt']);   // a text field keeps the case typed (a format code's "k" is not "K")
export const NUMFMT_BAD_NOTE = 'Microsoft Excel cannot use the number format you typed.';
export const CF_VALUE_NOTE = 'The value you entered is not a valid number, date, time, or string.';
export const CF_FORMULA_NOTE = 'There\'s a problem with this formula.';
/** A Highlight Cells value as a rule stores it (cfOperand: a number, a date's serial, TRUE / FALSE, text, or a '=…' formula kept as text), or null when Excel would refuse it. */
const condOperand = text => cfOperand(text);
/** Excel's messages around the sheet commands (the views show them verbatim). */
export const LAST_SHEET_NOTE = 'A workbook must contain at least one visible worksheet.';
export const FIND_NONE_NOTE = "We couldn't find what you were looking for.";
export const SPECIAL_NONE_NOTE = 'No cells were found.';
export const DELETE_SHEET_PROMPT = 'Microsoft Excel will permanently delete this sheet. Do you want to continue?';
export const NO_GROUP_NOTE = 'No group here.';

export class Session {
  /**
   * @param {Sheet} sheet
   * @param {object} [opts]  onToast(msg), onRefuse(), onKey(label), now() → ms
   */
  constructor(sheet, opts = {}) {
    this.sheet = sheet || new Sheet();
    this.opts = opts;
    this.resetEdit();
    this.mode = 'normal'; this.path = []; this.dialog = null; this.note = '';
    this.pasteKind = null; this.pasteOp = 'none';
    this.fontColorIdx = 0; this.fillColorIdx = 0; this.cellStyleIdx = 0; this.colwBuf = ''; this.rowhBuf = ''; this.sortPend = null; this.fxfixPend = null;
    this.keyLog = [];
    this.mouse = { count: 0, log: [] };   // workspace mouse actions, recorded by the views (SITE_SPEC §6)
    this.listeners = new Set();
    this.t0 = null;
    // the workbook: `sheet` is re-pointed at the active entry (never proxied); the views read it fresh
    this.sheets = [{ name: 'Sheet1', sheet: this.sheet }];
    this.sheetIndex = 0;
    this._xr = false;   // cross-sheet recalc reentry guard
    this._clip = null;  // the workbook's one clipboard (every sheet reads and writes it: wireSheet)
    this._repeat = null;   // what F4 repeats (C2 gap 10), workbook-wide like the clipboard
    this.pageRows = 0; this.pageCols = 0;   // a screenful for PageDown / Alt+PageDown — the view sets them; 0 = 10
    this.settings = makeSettings(this);
    this.dialogBuf = '';     // Go To's Reference field
    this.dlg = null;         // an Options / Page Setup draft while its dialog is open
    this.gotoRecent = [];    // the Go To dialog's list of previous locations (Excel keeps them)
    this.wireSheet(this.sheet);
  }
  /**
   * Workbook plumbing every sheet gets: the resolver cross-sheet formulas read through
   * (name → Sheet, case-insensitive, live over `sheets`), the sheet list (live.js clones the
   * whole workbook), and a change listener that recalculates the OTHER sheets after any
   * mutation — two passes, so an A → B → A chain settles (recalc never emits: no loops).
   */
  wireSheet(sh) {
    // one clipboard per workbook (Excel): a block copied on one sheet pastes on another. The sheet's
    // own field becomes an accessor onto the Session's, so Sheet.copy/paste/pasteDrop need no workbook awareness.
    if (sh.clipboard && !this._clip) this._clip = sh.clipboard;
    Object.defineProperty(sh, 'clipboard', { configurable: true, enumerable: true, get: () => this._clip, set: v => { this._clip = v; } });
    Object.defineProperty(sh, 'lastAction', { configurable: true, enumerable: true, get: () => this._repeat, set: v => { this._repeat = v; } });   // F4 repeats across sheets too
    sh.resolver = name => { const e = this.sheets.find(x => x.name.toLowerCase() === String(name).toLowerCase()); return e ? e.sheet : null; };
    sh.allSheets = () => this.sheets.map(e => ({ name: e.name, sheet: e.sheet }));
    sh.onChange(what => {
      if (!this._xr && this.sheets.length > 1 && what !== 'select' && what !== 'clipboard') {
        this._xr = true;
        try { for (let pass = 0; pass < 2; pass++) for (const e of this.sheets) if (e.sheet !== sh) e.sheet.recalc(); }
        finally { this._xr = false; }
      }
      this.emit('sheet');
    });
  }
  resetEdit() {
    this.editing = false; this.editBuf = ''; this.editCaret = 0; this.editMode = 'enter';
    this.editAnchor = null; this.editPointer = null; this.editPointerStart = -1; this.editPointerBase = null; this.editPointed = false;
    this.editOrigin = null;   // the sheet an open formula entry belongs to while another sheet shows for pointing (Ctrl+PgDn mid-formula)
    this.autoSumEdit = false;
  }
  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(what) { for (const fn of this.listeners) fn(what, this); }
  toast(msg) { if (this.opts.onToast) this.opts.onToast(msg); }

  /* ---------------- driving ---------------- */
  /**
   * Feed one key event ({key, code?, shiftKey, ctrlKey, altKey, metaKey}). Returns true when consumed.
   * An event without a key string is ignored: false, state untouched.
   */
  key(ev) {
    if (!ev || typeof ev.key !== 'string') return false;
    const e = { key: ev.key, code: ev.code || codeFor(ev.key.length === 1 ? ev.key : ''), shiftKey: !!ev.shiftKey, ctrlKey: !!(ev.ctrlKey || ev.metaKey), altKey: !!ev.altKey };
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta' || e.key === 'CapsLock') return false;
    const handled = this.dispatch(e);
    if (handled) this.emit('key');
    return handled;
  }
  press(spec) { return this.key(parseKeySpec(spec)); }
  type(text) { for (const ch of String(text)) this.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
  /** Run a keystroke script (see parseKeyScript). */
  run(script) { for (const step of parseKeyScript(script)) { if (step.type === 'text') this.type(step.text); else this.press(step.spec); } }
  logKey(t) {
    const a = this.sheet.dispActive();   // the white cell the key was pressed on (the edited cell while editing)
    this.keyLog.push({ k: t, t: this.t0 == null ? 0 : (this.opts.now ? this.opts.now() : Date.now()) - this.t0, cell: refKey(a.r, a.c) });
    if (this.opts.onKey) this.opts.onKey(t);
  }
  startClock() { if (this.t0 == null) this.t0 = this.opts.now ? this.opts.now() : Date.now(); }

  /* ---------------- edit lifecycle ---------------- */
  editRetarget() {
    const S = this.sheet;
    if (!S.sel || this.editing) return;
    const rg = S.selRange();
    const a = (S.selA && S.selA.r >= 1) ? S.selA : { r: S.sel.r, c: S.sel.c };
    const isCorner = (a.r === rg.r1 || a.r === rg.r2) && (a.c === rg.c1 || a.c === rg.c2);
    if (!isCorner || (a.r === S.active.r && a.c === S.active.c)) return;
    S.sel = { r: (a.r === rg.r1 ? rg.r2 : rg.r1), c: (a.c === rg.c1 ? rg.c2 : rg.c1) };
    S.active = { r: a.r, c: a.c }; S.selA = { r: a.r, c: a.c };
  }
  startEdit(initial, mode) {
    this.startClock();
    this.sheet.clearClipboard();
    this.editRetarget();
    const a = this.sheet.dispActive();   // the white cell — the far corner of a row/column/all selection is never edited
    this.editing = true; this.editBuf = initial; this.editMode = mode || 'enter'; this.editCaret = initial.length;
    this.editAnchor = { r: a.r, c: a.c };
    this.endPoint(); this.editPointed = false;
  }
  cancelEdit() { this.leaveOrigin(); this.autoSumEdit = false; this.editing = false; this.editBuf = ''; this.editAnchor = null; this.endPoint(); }
  /** Pointing across sheets is over (commit, cancel): the entry's own sheet shows again. */
  leaveOrigin() { const i = this.editOrigin; if (i == null) return; this.editOrigin = null; if (i !== this.sheetIndex && this.sheets[i]) { this.sheetIndex = i; this.sheet = this.sheets[i].sheet; this.emit('sheet'); } }
  /** `Sheet!` for a ref pointed on another sheet than the entry's own; '' at home. */
  sheetPrefix() { if (this.editOrigin == null || this.editOrigin === this.sheetIndex) return ''; const n = this.sheets[this.sheetIndex].name; return (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(n) ? n : "'" + n.replace(/'/g, "''") + "'") + '!'; }
  /** The cell an edit writes to: the displayed active cell it opened on. */
  editCell() { const a = this.editAnchor || this.sheet.dispActive(); return { r: a.r, c: a.c }; }
  endPoint() { this.editPointer = null; this.editPointerStart = -1; this.editPointerBase = null; }
  static clearCell(t) { t.value = null; t.formula = null; t.txt = false; }
  /**
   * Commit the buffer into the edited cell and move by (dr,dc). Returns false if still editing (a
   * refused or fix-proposed formula leaves the buffer exactly as typed — classifyInput auto-closes a
   * missing ')' on its own copy). An empty entry over content clears the cell, like Excel's Backspace ↵.
   * `via` ({kind:'enter'|'tab'|'move', shift}) is remembered so an accepted autocorrect replays the same key.
   */
  commitEdit(dr, dc, via) {
    this.leaveOrigin();
    const S = this.sheet;
    const asStay = this.autoSumEdit; this.autoSumEdit = false;
    const buf = this.editBuf.trim();
    const { r, c } = this.editCell();
    const cls = Sheet.classifyInput(buf, S.get(r, c));
    if (cls.kind === 'fix') { this.fxfixPend = { fixed: cls.fixed, dr, dc, all: false, via: via || null }; this.dialog = 'fxfix'; return false; }
    if (cls.kind === 'bad') { this.refuse(); return false; }
    this.editing = false; this.editBuf = ''; this.editAnchor = null; this.endPoint();
    if (cls.kind !== 'empty') { S.pushUndo(); S.applyInput(S.ensure(r, c), cls, r, c); }
    else if (S.nonEmpty(r, c)) { S.pushUndo(); Session.clearCell(S.ensure(r, c)); }
    this.editPointed = false;
    if ((dr || dc) && !asStay) { S.active = S.clamp(r + dr, c + dc); S.sel = null; S.selA = null; }
    S.commit('edit');
    return true;
  }
  /** Ctrl+Enter: the buffer into every selected cell (formulas translate from the edited cell); the cursor stays. */
  commitEditAll() {
    this.leaveOrigin();
    const S = this.sheet;
    const buf = this.editBuf.trim();
    const { r: ar, c: ac } = this.editCell();
    const cls = Sheet.classifyInput(buf, S.get(ar, ac));
    if (cls.kind === 'fix') { this.fxfixPend = { fixed: cls.fixed, dr: 0, dc: 0, all: true, via: null }; this.dialog = 'fxfix'; return false; }
    if (cls.kind === 'bad') { this.refuse(); return false; }
    this.editing = false; this.editBuf = ''; this.editAnchor = null; this.endPoint();
    if (cls.kind !== 'empty') {
      S.pushUndo();
      S.eachSel((cell, rr, cc) => {
        if (cls.kind === 'formula') { const f = (rr !== ar || cc !== ac) ? translateFormula(cls.formula, rr - ar, cc - ac) : cls.formula; S.applyInput(cell, { kind: 'formula', formula: f }, rr, cc); }
        else S.applyInput(cell, cls, rr, cc);
      });
    } else {
      const rg = S.selRange(); const filled = [];
      for (let rr = rg.r1; rr <= rg.r2; rr++) for (let cc = rg.c1; cc <= rg.c2; cc++) if (S.nonEmpty(rr, cc)) filled.push([rr, cc]);
      if (filled.length) { S.pushUndo(); for (const [rr, cc] of filled) Session.clearCell(S.ensure(rr, cc)); }
    }
    this.editPointed = false; this.autoSumEdit = false;
    S.commit('edit');
    return true;
  }
  /** Enter / Shift+Enter while editing: commit and step ↓ / ↑; a bare Enter that closes a Tab run returns home. */
  commitEnter(shift) {
    const S = this.sheet;
    if (!shift && S.tabHome && S.tabHome.ar === S.active.r && S.tabHome.ac === S.active.c) {
      const th = S.tabHome;
      if (this.commitEdit(0, 0, { kind: 'enter', shift: false })) { S.tabHome = th; this.tabEnterHome(); S.emit('select'); }
      return;
    }
    this.commitEdit(shift ? -1 : 1, 0, { kind: 'enter', shift: !!shift });
  }
  /** Tab / Shift+Tab while editing: commit, step → / ←, and arm (or extend) the Tab-run latch. */
  commitTab(shift) {
    const S = this.sheet;
    const prev = this.editCell(), was = S.tabHome;
    if (this.commitEdit(0, shift ? -1 : 1, { kind: 'tab', shift: !!shift })) this.tabArm(prev, shift, was);
  }
  refuse() { this.logKey('⚠'); this.toast('There’s a problem with this formula — fix it or press Esc to discard'); if (this.opts.onRefuse) this.opts.onRefuse(); }

  /* ---------------- point mode ---------------- */
  /** Where a pointer step lands: one cell (clamped), or with Ctrl the block edge Sheet.ctrlJump finds. */
  pointTarget(from, dr, dc, ctrl) { const S = this.sheet; return ctrl ? S.ctrlJump(from.r, from.c, dr, dc) : S.clamp(from.r + dr, from.c + dc); }
  startPointerFromArrow(dr, dc, ctrl) {
    const pre = this.sheetPrefix();
    const base = pre ? this.sheet.dispActive() : this.editAnchor;   // on another sheet the pointer sets off from that sheet's active cell
    const t = this.pointTarget(base, dr, dc, ctrl);
    if (t.r === base.r && t.c === base.c) return false;
    this.editPointerStart = this.editBuf.length; this.editPointer = { r: t.r, c: t.c }; this.editPointerBase = null;
    this.editBuf += pre + refKey(t.r, t.c); this.editCaret = this.editBuf.length; this.editPointed = true;
    return true;
  }
  /** An arrow with no live pointer: re-point a bare trailing in-sheet ref, else append anchor+step (=LOG10 ↓ → =LOG10C6, never =J11). */
  pointArrow(dr, dc, ctrl) {
    const S = this.sheet;
    const m = refTail(this.editBuf);
    if (m && !OPERATOR_BOUNDARY.test(this.editBuf)) {
      const pr = parseRef(m.ref); const pre = this.sheetPrefix();
      const prefixed = pre && this.editBuf.slice(Math.max(0, m.start - pre.length), m.start) === pre;   // a Sheet!ref pointed here re-points as one token
      if (pr && S.inb(pr.r, pr.c) && (!pre || prefixed)) { this.editPointerStart = m.start - (prefixed ? pre.length : 0); this.editPointer = { r: pr.r, c: pr.c }; this.editPointerBase = null; return this.movePointer(dr, dc, false, ctrl); }
    }
    return this.startPointerFromArrow(dr, dc, ctrl);
  }
  writePointerRef() {
    const p = this.editPointer, b = this.editPointerBase;
    this.editBuf = this.editBuf.slice(0, this.editPointerStart) + this.sheetPrefix() + (b ? refKey(b.r, b.c) + ':' + refKey(p.r, p.c) : refKey(p.r, p.c));
    this.editCaret = this.editBuf.length;
  }
  movePointer(dr, dc, extend, ctrl) {
    if (extend && !this.editPointerBase) this.editPointerBase = { r: this.editPointer.r, c: this.editPointer.c };
    if (!extend) this.editPointerBase = null;
    const t = this.pointTarget(this.editPointer, dr, dc, ctrl);
    if (t.r === this.editPointer.r && t.c === this.editPointer.c) return false;
    this.editPointer = { r: t.r, c: t.c }; this.writePointerRef(); this.editPointed = true;
    return true;
  }
  /** F4: cycle B2 → $B$2 → B$2 → $B2 → B2 on the live pointer, else on the ref behind the caret. */
  cycleAnchor() {
    const cyc = (ac, ar) => { const states = [['', ''], ['$', '$'], ['', '$'], ['$', '']]; const i = states.findIndex(s => s[0] === ac && s[1] === ar); return states[(i + 1) % 4]; };
    const RX1 = /(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/, RXR = /(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/;
    if (!this.editPointer || this.editPointerStart < 0) {
      const S = this.sheet;
      const head = this.editBuf.slice(0, this.editCaret);
      // only a whole token that names a cell of this sheet: not the tail of DAYS360, not LOG10 (column LOG)
      const bounded = m => { const start = this.editCaret - m[0].length; return !(start > 0 && IDENT_CHAR.test(head[start - 1])); };
      const inSheet = (col, row) => { const p = parseRef(col + row); return !!p && S.inb(p.r, p.c); };
      const mr = RXR.exec(head);
      if (mr && bounded(mr) && inSheet(mr[2], mr[4]) && inSheet(mr[6], mr[8])) { const nx = cyc(mr[1], mr[3]); const rep = nx[0] + mr[2] + nx[1] + mr[4] + ':' + nx[0] + mr[6] + nx[1] + mr[8]; const start = this.editCaret - mr[0].length; this.editBuf = this.editBuf.slice(0, start) + rep + this.editBuf.slice(this.editCaret); this.editCaret = start + rep.length; return true; }
      const m = RX1.exec(head); if (!m || !bounded(m) || !inSheet(m[2], m[4])) return false;
      const nx = cyc(m[1], m[3]); const rep = nx[0] + m[2] + nx[1] + m[4]; const start = this.editCaret - m[0].length;
      this.editBuf = this.editBuf.slice(0, start) + rep + this.editBuf.slice(this.editCaret); this.editCaret = start + rep.length; return true;
    }
    const whole = this.editBuf.slice(this.editPointerStart);
    const pm = /^((?:'[^']+'|[A-Za-z_][\w.]*)!)?/.exec(whole); const pre = pm ? pm[1] || '' : '';   // a pointer on another sheet carries Sheet! — the anchors cycle behind it
    const cur = whole.slice(pre.length), base = this.editBuf.slice(0, this.editPointerStart) + pre;
    const mr = /^(\$?)([A-Z]{1,3})(\$?)(\d+):(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(cur);
    if (mr) { const nx = cyc(mr[1], mr[3]); this.editBuf = base + nx[0] + mr[2] + nx[1] + mr[4] + ':' + nx[0] + mr[6] + nx[1] + mr[8]; this.editCaret = this.editBuf.length; return true; }
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(cur); if (!m) return false;
    const nx = cyc(m[1], m[3]); this.editBuf = base + nx[0] + m[2] + nx[1] + m[4]; this.editCaret = this.editBuf.length; return true;
  }

  /* ---------------- tab-run latch ---------------- */
  tabArm(prev, back, was) {
    const S = this.sheet; if (!prev) return;
    const cont = was && was.ar === prev.r && was.ac === prev.c;
    const home = cont ? { r: was.r, c: was.c } : (back ? null : { r: prev.r, c: prev.c });
    S.tabHome = home ? { r: home.r, c: home.c, ar: S.active.r, ac: S.active.c } : null;
  }
  tabEnterHome() {
    const S = this.sheet; if (!S.tabHome) return false;
    const t = S.tabHome; S.tabHome = null;
    if (S.active.r !== t.ar || S.active.c !== t.ac) return false;
    S.active = S.clamp(t.r + 1, t.c); S.sel = null; S.selA = null; return true;
  }

  /* ---------------- ribbon ---------------- */
  enterRibbon() { this.startClock(); this.mode = 'ribbon'; this.path = []; this.dialog = null; this.note = ''; }
  exitRibbon(act) { this.mode = 'normal'; this.path = []; this.dialog = null; this.pasteKind = null; this.note = ''; this.dlg = null; this.dialogBuf = ''; if (act) this.sheet.commit('ribbon'); }
  openDialog(name, path) { this.mode = 'ribbon'; this.path = path || []; this.dialog = name; this.note = ''; }
  ribbonKey(e) {
    const k = e.key;
    // a held Alt+Shift+→ / ← (Group / Ungroup): the Alt press already opened the KeyTips, the chord closes them and acts
    if (!this.dialog && !this.path.length && e.altKey && e.shiftKey && !e.ctrlKey && (k === 'ArrowRight' || k === 'ArrowLeft')) { this.exitRibbon(false); this.groupChord(k === 'ArrowRight'); return true; }
    if (DIALOGS_WB.has(this.dialog)) return this.dialogKey(e);
    if (k === 'Escape') {
      if (this.dialog) { this.dialog = null; this.pasteKind = null; this.note = ''; this.sortPend = null; this.colwBuf = ''; this.rowhBuf = ''; if (this.path.length) return true; this.exitRibbon(false); return true; }
      if (this.path.length) { this.path.pop(); this.note = ''; return true; }
      this.exitRibbon(false); return true;
    }
    const cycle = (prop, n, dir) => { this[prop] = (this[prop] + dir + n) % n; };
    if (this.dialog === 'paste') {
      if (k === 'ArrowDown' || k === 'ArrowRight') { this.logKey('↓'); const i = PASTE_OPTS.findIndex(o => o[2] === (this.pasteKind || 'all')); this.pasteKind = PASTE_OPTS[(i + 1) % PASTE_OPTS.length][2]; return true; }
      if (k === 'ArrowUp' || k === 'ArrowLeft') { this.logKey('↑'); const i = PASTE_OPTS.findIndex(o => o[2] === (this.pasteKind || 'all')); this.pasteKind = PASTE_OPTS[(i - 1 + PASTE_OPTS.length) % PASTE_OPTS.length][2]; return true; }
    }
    if (this.dialog === 'colw') {
      if (/^[0-9.]$/.test(k)) { this.logKey(k); this.colwBuf += k; return true; }
      if (k === 'Backspace') { this.colwBuf = this.colwBuf.slice(0, -1); return true; }
      if (k === 'Enter') { this.logKey('↵'); this.applyRibbon('ENTER'); return true; }
      return true;
    }
    if (this.dialog === 'rowh') {
      if (/^[0-9.]$/.test(k)) { this.logKey(k); this.rowhBuf += k; return true; }
      if (k === 'Backspace') { this.rowhBuf = this.rowhBuf.slice(0, -1); return true; }
      if (k === 'Enter') { this.logKey('↵'); this.applyRibbon('ENTER'); return true; }
      return true;
    }
    if (this.dialog === 'fillcolor') {
      if (k === 'ArrowLeft') { this.logKey('←'); cycle('fillColorIdx', FILL_SWATCHES.length, -1); return true; }
      if (k === 'ArrowRight') { this.logKey('→'); cycle('fillColorIdx', FILL_SWATCHES.length, 1); return true; }
    }
    if (this.dialog === 'cellstyle') {
      if (k === 'ArrowLeft') { this.logKey('←'); cycle('cellStyleIdx', CELL_STYLES.length, -1); return true; }
      if (k === 'ArrowRight') { this.logKey('→'); cycle('cellStyleIdx', CELL_STYLES.length, 1); return true; }
      if (k === 'Enter') { this.logKey('↵'); this.applyRibbon('ENTER'); return true; }
      return true;
    }
    if (this.dialog === 'fontcolor') {
      if (k === 'ArrowLeft') { this.logKey('←'); cycle('fontColorIdx', FONT_SWATCHES.length, -1); return true; }
      if (k === 'ArrowRight') { this.logKey('→'); cycle('fontColorIdx', FONT_SWATCHES.length, 1); return true; }
      if (k === 'Enter') { this.logKey('↵'); this.applyRibbon('ENTER'); return true; }
      return true;
    }
    if (k === 'Enter') { this.logKey('↵'); this.applyRibbon('ENTER'); return true; }
    if (k === 'Alt') return true;
    if (k.length !== 1 && !/^(Key|Digit)/.test(e.code || '') && e.code !== 'Equal') return true;
    const ch = codeToChar(e.code, k);
    if (ch) { this.logKey(ch); this.applyRibbon(ch); }
    return true;
  }
  /** One KeyTip key (uppercase letter/digit/'='/'ENTER') at the current ribbon state. */
  applyRibbon(key) {
    const S = this.sheet;
    const done = (act = true) => this.exitRibbon(act);
    if (DIALOGS_WB.has(this.dialog)) { this.dlgKey(key === 'ENTER' ? 'Enter' : key); return; }
    if (this.dialog === 'fmt') {
      const fmt = (style, dec) => { S.setNumberFormat(style, dec); return done(); };
      if (key === 'G') return fmt('general', 0);
      if (key === 'N') return fmt('comma', 0);
      if (key === 'C') return fmt('currency', 0);
      if (key === 'P') return fmt('percent', 1);
      if (key === 'X') return fmt('mult', 1);
      if (key === 'D') return fmt('date', 0);
      if (key === 'S') { S.setScale(3); return done(); }
      if (key === 'M') { S.setScale(6); return done(); }
      if (key === 'E') { S.toggleSuperscript(); return done(); }
      if (key === 'K') { S.toggleStrike(); return done(); }
      if (key === 'A') { S.centerAcross(); return done(); }
      if (key === 'U') { this.openNumFmt(); return; }   // the Custom box (Chapter 2)
      return;
    }
    if (this.dialog === 'paste') {
      const op2 = PASTE_OP_OPTS.find(o => o[0] === key); if (op2) { this.pasteOp = op2[2]; return; }
      const opt = PASTE_OPTS.find(o => o[0] === key); if (opt) { this.pasteKind = opt[2]; return; }
      if (key === 'ENTER') { S.paste(this.pasteKind || 'all', this.pasteOp); this.pasteOp = 'none'; return done(); }
      return;
    }
    if (this.dialog === 'colw') {
      if (key === 'ENTER') { const n = parseFloat(this.colwBuf); this.colwBuf = ''; if (isFinite(n) && n > 0) S.setColWidth(n); return done(); }
      return;
    }
    if (this.dialog === 'rowh') {
      if (key === 'ENTER') { const n = parseFloat(this.rowhBuf); this.rowhBuf = ''; if (isFinite(n) && n > 0) S.setRowHeight(n); return done(); }
      return;
    }
    if (this.dialog === 'fxfix') {
      if (key === 'ENTER') {
        const p = this.fxfixPend; this.fxfixPend = null; this.dialog = null;
        if (!p || !this.editing) return;
        this.editBuf = p.fixed; this.editCaret = this.editBuf.length; this.endPoint();
        if (p.all) this.commitEditAll();
        else if (p.via && p.via.kind === 'enter') this.commitEnter(p.via.shift);   // keeps the Tab-run home rule
        else if (p.via && p.via.kind === 'tab') this.commitTab(p.via.shift);       // keeps the latch armed
        else this.commitEdit(p.dr, p.dc);
      }
      return;
    }
    if (this.dialog === 'sortwarn') {
      const p = this.sortPend;
      if (key === 'E' || key === 'ENTER') {
        this.sortPend = null; if (!p) return done(false);
        let c1 = p.key, c2 = p.key;
        const nbr = cc => { if (cc < 1 || cc > S.cols) return false; for (let rr = p.r1; rr <= p.r2; rr++) if (S.nonEmpty(rr, cc)) return true; return false; };
        while (c1 > 1 && nbr(c1 - 1)) c1--; while (c2 < S.cols && nbr(c2 + 1)) c2++;
        S.sel = { r: p.r1, c: c1 }; S.active = { r: p.r2, c: c2 }; S.sort(p.dir, p.key); return done();
      }
      if (key === 'C') { this.sortPend = null; if (!p) return done(false); S.sel = { r: p.r1, c: p.key }; S.active = { r: p.r2, c: p.key }; S.sort(p.dir); return done(); }
      return;
    }
    if (this.dialog === 'fontcolor') { if (key === 'ENTER') { S.setFontColor(FONT_SWATCHES[this.fontColorIdx].k); return done(); } return; }
    if (this.dialog === 'fillcolor') {
      const LETTER = { B: 'blue', G: 'green', Y: 'yellow', R: 'red', N: null };
      if (key === 'ENTER') { S.setFill(FILL_SWATCHES[this.fillColorIdx].k); return done(); }
      if (Object.prototype.hasOwnProperty.call(LETTER, key)) { S.setFill(LETTER[key]); return done(); }
      return;
    }
    if (this.dialog === 'series') { if (key === 'ENTER') { S.fillSeries(); return done(); } return; }
    if (this.dialog === 'cellstyle') { if (key === 'ENTER') { S.applyCellStyle(CELL_STYLES[this.cellStyleIdx].k); return done(); } return; }

    // Alt then a digit: the Quick Access Toolbar's numeric KeyTips (Excel shows 1..9 on it)
    if (!this.path.length && /^[1-9]$/.test(key)) {
      const id = this.settings.qat[+key - 1];
      if (!id) return;
      this.runQat(id);
      if (this.mode === 'ribbon' && !this.dialog) this.exitRibbon(false);
      return;
    }
    const step = stepPath(this.path, key);
    if (step.kind === 'tab' || step.kind === 'menu') { this.path = step.path; this.note = ''; return; }
    if (step.kind === 'dead') { this.note = step.note; return; }
    if (step.kind === 'ignore') return;
    if (step.kind === 'reset') { this.path = []; this.note = ''; return; }
    this.execCommand(step.np);
  }
  /**
   * Run one terminal Alt-walk command by its path id ('H1', 'HBO', 'FT', …), from wherever the walk
   * is: the same switch a KeyTip lands in, so the Quick Access Toolbar and the mouse table share it.
   * A direct command acts and leaves the Ribbon; a dialog command opens its dialog and stays.
   */
  execCommand(np) {
    const S = this.sheet;
    const done = (act = true) => this.exitRibbon(act);
    switch (np) {
      case '=': this.exitRibbon(false); this.doAutoSum(); return;
      case 'WVG': case 'WG': S.gridlines = !S.gridlines; this.toast(S.gridlines ? 'gridlines shown' : 'gridlines hidden — Alt W V G to show'); return done();
      case 'AGG': this.exitRibbon(false); this.groupChord(true, true); return;     // Data › Group › Group… (= Alt+Shift+→)
      case 'AUU': this.exitRibbon(false); this.groupChord(false, true); return;    // Data › Ungroup › Ungroup… (= Alt+Shift+←)
      case 'AUC': this.exitRibbon(false); this.startClock(); if (!S.clearOutline()) this.toast(NO_GROUP_NOTE); return;   // Data › Ungroup › Clear Outline
      case 'AH': this.exitRibbon(false); this.startClock(); if (!S.foldAtActive(true)) this.toast(NO_GROUP_NOTE); return;    // Data › Hide Detail
      case 'AJ': this.exitRibbon(false); this.startClock(); if (!S.foldAtActive(false)) this.toast(NO_GROUP_NOTE); return;   // Data › Show Detail
      case 'MH': this.exitRibbon(false); this.toggleShowFormulas(); return;        // Formulas › Show Formulas (= Ctrl+`)
      case 'PI': this.openPageSetup('sheet'); return;                             // Page Layout › Print Titles: Page Setup on its Sheet page
      case 'HVV': S.paste('values'); return done();
      case 'HVS': case 'ES': this.dialog = 'paste'; this.pasteKind = 'all'; this.pasteOp = 'none'; return;
      case 'OE': case 'HOE': this.dialog = 'fmt'; return;
      case 'MP': this.exitRibbon(false); this.jumpPrecedent(); return;
      case 'MD': this.exitRibbon(false); this.jumpDependent(); return;
      case 'HFC': this.dialog = 'fontcolor'; this.fontColorIdx = 0; return;
      case 'HFG': S.fontSize(1); return done();
      case 'HFK': S.fontSize(-1); return done();
      case 'HH': this.dialog = 'fillcolor'; this.fillColorIdx = 0; return;
      case 'HJ': this.dialog = 'cellstyle'; this.cellStyleIdx = 0; return;
      case 'HFIS': this.dialog = 'series'; return;
      // Conditional Formatting (Chapter 2): the presets, a formula rule, the galleries, clear, manage
      case 'HLHG': this.openCondFmt('>'); return;
      case 'HLHL': this.openCondFmt('<'); return;
      case 'HLHB': this.openCondFmt('between'); return;
      case 'HLHE': this.openCondFmt('='); return;
      case 'HLN': this.openCondFmt('formula'); return;
      case 'HLD': this.openCondGallery('databar'); return;
      case 'HLS': this.openCondGallery('colorscale'); return;
      case 'HLCS': S.clearCondFmt('selection'); return done();
      case 'HLCE': S.clearCondFmt('sheet'); return done();
      case 'HLR': this.openCondRules(); return;
      case 'ASA': case 'ASD': {
        const dir = np === 'ASD' ? 'desc' : 'asc'; const r = S.selRange();
        if (r.c1 === r.c2 && r.r1 !== r.r2 && S.sortNeedsExpand()) { this.sortPend = { dir, r1: r.r1, r2: r.r2, key: S.dispActive().c }; this.dialog = 'sortwarn'; return; }
        S.sort(dir); return done();
      }
      case 'HFID': S.fill('down'); return done();
      case 'HFIR': S.fill('right'); return done();
      case 'HW': S.toggleWrap(); return done();
      case 'HK': S.setNumberFormat('comma', 2); return done();
      case 'HP': S.setNumberFormat('percent', 0); return done();
      case 'H9': S.changeDecimals(-1); return done();
      case 'H0': S.changeDecimals(1); return done();
      case 'HBP': S.border('top'); return done();
      case 'HBO': S.border('bottom'); return done();
      case 'HBD': S.border('topbottom'); return done();
      case 'HBB': S.border('double'); return done();
      case 'HBA': S.border('all'); return done();
      case 'HBL': S.border('left'); return done();
      case 'HBR': S.border('right'); return done();
      case 'HBS': S.border('outside'); return done();
      case 'HBT': S.border('thick'); return done();
      case 'HBN': S.border('none'); return done();
      case 'HAL': S.setAlign('l'); return done();
      case 'HAC': S.setAlign('c'); return done();
      case 'HAR': S.setAlign('r'); return done();
      case 'HAN': S.setNumberFormat('acct', 0); return done();
      case 'HIR': S.insert('r'); return done();
      case 'HIC': S.insert('c'); return done();
      case 'HDR': S.remove('r'); return done();
      case 'HDC': S.remove('c'); return done();
      case 'HIS': this.exitRibbon(false); this.insertSheet(); return;   // what Shift+F11 does
      case 'HDS': this.askDeleteSheet(); return;                          // blank: gone; anything on it: the confirm card; the last sheet: a note, the walk stays
      case 'HOR': this.openRenameSheet(); return;
      case 'HOM': this.openMoveSheet(); return;
      case 'HEA': S.clearAll(); return done();
      case 'HEF': S.clearFormats(); return done();
      case 'HEC': S.clearContents(); return done();
      case 'H6': S.changeIndent(1); return done();
      case 'H5': S.changeIndent(-1); return done();
      case 'H1': S.toggleAllOrNone('bold'); return done();
      case 'H2': S.toggleAllOrNone('it'); return done();
      case 'H3': S.toggleAllOrNone('uline'); return done();
      case 'HOW': this.dialog = 'colw'; this.colwBuf = ''; return;
      case 'HOI': S.autofitCols(); return done();
      case 'HOA': S.autofitRows(); return done();
      case 'HUS': case 'MUS': this.exitRibbon(false); this.doAutoSum(); return;
      case 'FT': this.openOptions(); return;
      case 'HFDG': this.openGoTo(); return;
      case 'HFDF': this.openFind(false); return;
      case 'HFDR': this.openFind(true); return;
      case 'HFDS': this.openGoToSpecial(); return;
      case 'HFDU': this.exitRibbon(false); if (!S.selectSpecial('formulas')) this.toast(SPECIAL_NONE_NOTE); return;
      case 'HFDN': this.exitRibbon(false); if (!S.selectSpecial('constants')) this.toast(SPECIAL_NONE_NOTE); return;
      case 'HOH': this.dialog = 'rowh'; this.rowhBuf = ''; return;
      case 'HOUR': S.hideRows(); return done();
      case 'HOUC': S.hideCols(); return done();
      case 'HOUO': S.unhideRows(); return done();
      case 'HOUL': S.unhideCols(); return done();
      case 'WFF': {   // Freeze Panes toggles at the active cell; Excel's label flips to Unfreeze
        const a = S.dispActive();
        S.freeze = (S.freeze.r || S.freeze.c) ? { r: 0, c: 0 } : { r: a.r - 1, c: a.c - 1 };
        return done();
      }
      case 'WFR': S.freeze = { r: 1, c: 0 }; return done();
      case 'WFC': S.freeze = { r: 0, c: 1 }; return done();
      case 'PSP': this.openPageSetup(); return;
      case 'POP': this.setOrientation('portrait'); return done();
      case 'POL': this.setOrientation('landscape'); return done();
      default: this.path = []; this.note = '';
    }
  }

  /* ---------------- the workbook ---------------- */
  /**
   * Append (or insert at `at`) a sheet. `name` defaults to the next free Sheet<n>; it must be
   * Excel-legal (isSheetName) and unique, case-insensitively, or this throws. Returns the new index.
   */
  addSheet(name, sheet, at) {
    const nm = name == null || name === '' ? nextSheetName(this.sheets) : String(name);
    if (!isSheetName(nm)) throw new Error('addSheet: "' + nm + '" is not a legal sheet name (1–31 characters, none of [ ] : * ? / \\)');
    if (this.sheets.some(x => x.name.toLowerCase() === nm.toLowerCase())) throw new Error('addSheet: a sheet named "' + nm + '" already exists');
    const sh = sheet || new Sheet();
    this.wireSheet(sh);
    const i = at == null ? this.sheets.length : Math.max(0, Math.min(this.sheets.length, at | 0));
    this.sheets.splice(i, 0, { name: nm, sheet: sh });
    this.sheetIndex = this.sheets.findIndex(x => x.sheet === this.sheet);   // the active entry may have moved right
    this.emit('sheets');
    return i;
  }
  /** Make sheet `i` (clamped) the active one: an open edit is cancelled, the Ribbon walk closed. True when it changed. */
  switchSheet(i) {
    const idx = Math.max(0, Math.min(this.sheets.length - 1, i | 0));
    if (idx === this.sheetIndex) return false;
    if (this.editing) this.cancelEdit();
    if (this.mode === 'ribbon') this.exitRibbon(false);
    this.sheetIndex = idx; this.sheet = this.sheets[idx].sheet;
    this.emit('sheet');
    return true;
  }
  /** Shift+F11: a new sheet before the active one, made active (Excel). */
  insertSheet() { const i = this.addSheet(undefined, undefined, this.sheetIndex); this.switchSheet(i); return i; }
  /** Whether sheet `i` (the active one by default) holds anything: a value, a formula or a format on any cell. Excel asks before deleting such a sheet. */
  sheetHasContent(i) {
    const e = this.sheets[i == null ? this.sheetIndex : i | 0]; if (!e) return false;
    const cells = e.sheet.cells;
    for (const k in cells) { const c = cells[k]; if ((c.value != null && c.value !== '') || c.formula || Sheet.hasFormat(c)) return true; }
    return false;
  }
  /** Why `name` cannot be sheet `except`'s name, as Excel words it ('' when it can): blank, an illegal character, too long, or another sheet's name (case-insensitively). */
  sheetNameProblem(name, except) {
    const t = String(name == null ? '' : name);
    if (!t.trim()) return 'A sheet name cannot be blank.';
    if (/[\[\]:*?/\\]/.test(t)) return 'A sheet name cannot contain [ ] : * ? / \\';
    if (t.length > SHEET_NAME_MAX) return 'A sheet name can have at most 31 characters.';
    if (this.sheets.some((x, j) => j !== except && x.name.toLowerCase() === t.toLowerCase())) return 'That name is already taken.';
    return '';
  }
  /** Rename sheet `i`. False (nothing changes) unless the name is Excel-legal and no other sheet's; the same name back is fine. */
  renameSheet(i, name) {
    const idx = i | 0; if (!this.sheets[idx]) return false;
    const nm = String(name == null ? '' : name);
    if (this.sheetNameProblem(nm, idx)) return false;
    if (this.sheets[idx].name !== nm) { this.sheets[idx].name = nm; this.emit('sheets'); }
    return true;
  }
  /**
   * Delete sheet `i` (the active one by default). The last sheet never goes (false, with Excel's note).
   * When the active sheet goes, the next one (the previous one at the end) becomes active and an
   * entry in progress on it is dropped. Not undoable, as in Excel — hence the confirm card.
   */
  deleteSheet(i) {
    const idx = i == null ? this.sheetIndex : i | 0; if (!this.sheets[idx]) return false;
    if (this.sheets.length <= 1) { this.note = LAST_SHEET_NOTE; this.toast(LAST_SHEET_NOTE); return false; }
    const wasActive = idx === this.sheetIndex;
    if (wasActive && this.editing) this.cancelEdit();
    this.sheets.splice(idx, 1);
    if (wasActive) { this.sheetIndex = Math.min(idx, this.sheets.length - 1); this.sheet = this.sheets[this.sheetIndex].sheet; }
    else this.sheetIndex = this.sheets.findIndex(x => x.sheet === this.sheet);
    this.emit('sheets');
    if (wasActive) this.emit('sheet');
    return true;
  }
  /**
   * Move sheet `from` to sit before position `to` in the current order (`to` = sheets.length puts it
   * last: Excel's "(move to end)"). False when nothing would change. The active sheet stays active.
   */
  moveSheet(from, to) {
    const n = this.sheets.length; const f = from | 0; if (!this.sheets[f]) return false;
    const t = Math.max(0, Math.min(n, to == null ? n : to | 0));
    if (t === f || t === f + 1) return false;
    const [entry] = this.sheets.splice(f, 1);
    this.sheets.splice(t > f ? t - 1 : t, 0, entry);
    this.sheetIndex = this.sheets.findIndex(x => x.sheet === this.sheet);
    this.emit('sheets');
    return true;
  }
  /** 'Sales' → 'Sales (2)', then '(3)'…, as Excel names a copied sheet; a name already numbered counts on from its base, and a long name is trimmed to fit. */
  copySheetName(name) {
    const base = String(name).replace(/ \(\d+\)$/, '');
    const taken = new Set(this.sheets.map(x => x.name.toLowerCase()));
    for (let n = 2; ; n++) { const sfx = ' (' + n + ')'; const nm = base.slice(0, SHEET_NAME_MAX - sfx.length) + sfx; if (!taken.has(nm.toLowerCase())) return nm; }
  }
  /**
   * Copy sheet `i` (the active one by default: cells, formats, widths, gridlines) to sit before
   * position `before` (default: right after the original), named 'Name (2)'; the copy becomes the
   * active sheet, as in Excel. Returns the copy's index.
   */
  copySheet(i, before) {
    const idx = i == null ? this.sheetIndex : i | 0; const src = this.sheets[idx]; if (!src) return -1;
    const S = src.sheet; const j = S.toJSON();
    const colW = {}; S.colW.forEach((w, c) => { if (S.colSet[c]) colW[c] = w; });
    const copy = new Sheet({ rows: S.rows, cols: S.cols, cells: j.cells, colW, active: j.active, today: S.today || undefined,
      rowH: j.rowH, hiddenRows: j.hiddenRows, hiddenCols: j.hiddenCols, freeze: j.freeze, groups: j.groups,
      condFmt: j.condFmt && j.condFmt.map(({ id, ...r }) => r) });   // the conditional formats come along; the copy mints its own rule ids
    copy.gridlines = S.gridlines;
    const at = this.addSheet(this.copySheetName(src.name), copy, before == null ? idx + 1 : Math.max(0, Math.min(this.sheets.length, before | 0)));
    this.switchSheet(at);
    return at;
  }

  /* ---------------- Rename Sheet (Alt H O R, a double-click on the tab), Delete Sheet (Alt H D S), Move or Copy (Alt H O M) ---------------- */
  /** Open Rename Sheet on sheet `i` (the active one by default): the name is prefilled and selected, so typing replaces it. */
  openRenameSheet(i) {
    const idx = i == null ? this.sheetIndex : Math.max(0, Math.min(this.sheets.length - 1, i | 0));
    this.startClock(); this.openDialog('renamesheet', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'renamesheet', index: idx, name: this.sheets[idx].name, selected: true };
  }
  /** Open Move or Copy for the active sheet: the "Before sheet" highlight starts on the sheet itself (Excel's default), Create a copy off. */
  openMoveSheet() {
    this.startClock(); this.openDialog('movesheet', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'movesheet', index: this.sheetIndex, before: this.sheetIndex, copy: false };
  }
  /**
   * Home › Delete › Delete Sheet on the active sheet: a blank sheet goes at once, one that holds
   * anything opens the confirm card (Enter = Delete, Esc = Cancel), and the last sheet never goes —
   * Excel's note is set and the walk stays where it is. True when the sheet went or the card opened.
   */
  askDeleteSheet() {
    const i = this.sheetIndex;
    if (this.sheets.length <= 1) { this.note = LAST_SHEET_NOTE; this.toast(LAST_SHEET_NOTE); return false; }
    if (!this.sheetHasContent(i)) { this.exitRibbon(false); return this.deleteSheet(i); }
    this.startClock(); this.openDialog('deletesheet', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'deletesheet', index: i };
    return true;
  }
  /** The Rename Sheet keys: typing replaces the selected name then appends (letters keep their case; the log has them upper-case), Backspace edits, Enter = OK with Excel's message when the name will not do. */
  renameKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') {
      const err = this.sheetNameProblem(d.name, d.index);
      if (err) { this.note = err; return; }   // the card stays open, as Excel's does
      const { index, name } = d;
      this.exitRibbon(false);
      this.renameSheet(index, name);
      return;
    }
    if (key === 'Backspace') { d.name = d.selected ? '' : d.name.slice(0, -1); d.selected = false; this.note = ''; return; }
    if (key.length === 1) { const next = (d.selected ? '' : d.name) + key; if (next.length > SHEET_NAME_MAX) return; d.name = next; d.selected = false; this.note = ''; }
  }
  /** The confirm card's keys: Enter = Delete (Esc = Cancel is dialogKey's). */
  deleteKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') { const { index } = d; this.exitRibbon(false); this.deleteSheet(index); }
  }
  /** The Move or Copy keys: ↑ ↓ move the "Before sheet" highlight (the last row is "(move to end)"), C toggles Create a copy, Enter = OK. */
  moveKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') { const { index, before, copy } = d; this.exitRibbon(false); if (copy) this.copySheet(index, before); else this.moveSheet(index, before); return; }
    if (key === 'ArrowUp' || key === 'ArrowDown') { d.before = Math.max(0, Math.min(this.sheets.length, d.before + (key === 'ArrowDown' ? 1 : -1))); return; }
    if (key === 'C') d.copy = !d.copy;
  }

  /* ---------------- Find & Replace (Ctrl+F / Ctrl+H, Alt H F D F / R) ---------------- */
  openFind(replace) {
    this.startClock();
    this.openDialog('find', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'find', find: '', repl: '', focus: 'find', replace: !!replace };
  }
  /** The Find / Replace card's keys: Tab switches fields, ↵ = Find Next, A = Replace All. Modeless in Excel; Esc closes it here as everywhere. */
  findKey(key) {
    const d = this.dlg; if (!d) return;
    const S = this.sheet;
    if (key === 'Enter') {
      const ref = S.findNext(d.find);
      this.note = ref ? '' : FIND_NONE_NOTE;
      return;   // the card stays open, as Excel's does
    }
    if (key === 'Tab' || key === 'Shift+Tab') { if (d.replace) { d.focus = d.focus === 'find' ? 'repl' : 'find'; } return; }
    if (key === 'Backspace') { d[d.focus] = d[d.focus].slice(0, -1); this.note = ''; return; }
    if (key.length === 1) { d[d.focus] = (d[d.focus] + key).slice(0, 64); this.note = ''; return; }   // letters keep their typed case (dialogKey exempts 'find')
    if (key === 'ReplaceAll' && d.replace) {
      const n = S.replaceAll(d.find, d.repl);
      this.note = n ? 'All done. We made ' + n + ' replacement' + (n === 1 ? '' : 's') + '.' : FIND_NONE_NOTE;
    }
  }

  /* ---------------- Go To Special (Alt H F D S, Go To › Alt+S) ---------------- */
  openGoToSpecial() {
    this.startClock();
    this.openDialog('gotospecial', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'gotospecial', pick: 'blanks' };
  }
  gotoSpecialKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'K') { d.pick = 'blanks'; return; }
    if (key === 'O') { d.pick = 'constants'; return; }
    if (key === 'F') { d.pick = 'formulas'; return; }
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      const order = ['blanks', 'constants', 'formulas'];
      const i = order.indexOf(d.pick);
      d.pick = order[Math.max(0, Math.min(order.length - 1, i + (key === 'ArrowDown' ? 1 : -1)))];
      return;
    }
    if (key === 'Enter') {
      const pick = d.pick;
      this.exitRibbon(false);
      if (!this.sheet.selectSpecial(pick)) { this.openGoToSpecial(); this.dlg.pick = pick; this.note = SPECIAL_NONE_NOTE; }
    }
  }

  /* ---------------- Go To (Ctrl+G, F5, Alt H F D G) ---------------- */
  openGoTo() { this.startClock(); this.openDialog('goto', this.mode === 'ribbon' ? this.path : []); this.dialogBuf = ''; this.dlg = null; }
  /**
   * Resolve a Go To reference: 'B4', 'a1:c3', '$B$4', or 'Sheet2!B4' (a sheet of this workbook,
   * case-insensitive). A cell becomes the active cell, a range is selected with its top-left active.
   * False (nothing moves) when it is not a reference inside the sheet.
   */
  goToRef(text) {
    let t = String(text == null ? '' : text).trim(); if (!t) return false;
    let target = -1;
    const bang = t.lastIndexOf('!');
    if (bang >= 0) {
      let nm = t.slice(0, bang).trim(); if (/^'.*'$/.test(nm)) nm = nm.slice(1, -1).replace(/''/g, "'");
      target = this.sheets.findIndex(x => x.name.toLowerCase() === nm.toLowerCase());
      if (target < 0) return false;
      t = t.slice(bang + 1);
    }
    const S = target >= 0 ? this.sheets[target].sheet : this.sheet;
    const rg = parseRange(t); if (!rg || !S.inb(rg.r1, rg.c1) || !S.inb(rg.r2, rg.c2)) return false;
    if (target >= 0) this.switchSheet(target);
    if (rg.r1 === rg.r2 && rg.c1 === rg.c2) S.goTo(rg.r1, rg.c1); else S.select(rangeText(rg));
    const where = (target >= 0 ? this.sheets[target].name + '!' : '') + rangeText(rg);
    this.gotoRecent = [where].concat(this.gotoRecent.filter(x => x !== where)).slice(0, 4);
    return true;
  }
  gotoKey(key) {
    if (key === 'Enter') {
      const ref = this.dialogBuf;
      const path = this.path;
      this.exitRibbon(false);
      if (this.goToRef(ref)) return;
      this.openDialog('goto', path); this.dialogBuf = ref; this.note = 'Reference is not valid.';   // Excel's message; the dialog stays open
      return;
    }
    if (key === 'Backspace') { this.dialogBuf = this.dialogBuf.slice(0, -1); this.note = ''; return; }
    if (key.length === 1 && /[A-Za-z0-9:$!' &_.()\-]/.test(key) && this.dialogBuf.length < 64) { this.dialogBuf += key.toUpperCase(); this.note = ''; }   // a sheet name may carry & . _ - ( ) ('P&L'!D23)
  }

  /* ---------------- Excel Options (Alt F T) and Page Setup (Alt P S P): recorded settings ---------------- */
  setOrientation(o) { this.settings.pageSetup.orientation = o === 'landscape' ? 'landscape' : 'portrait'; this.emit('settings'); }
  /** The Options draft: every control's working value, discarded on Cancel. `focus` names the control ↑/↓/Tab/digits act on. */
  optionsDraft(page) {
    const st = this.settings;
    return { kind: 'options', page: OPTIONS_LIVE_PAGES.includes(page) ? page : 'formulas', focus: 'pages',
      calcMode: st.calcMode, iterative: !!st.iterative, maxIterations: String(st.maxIterations), maxChange: String(st.maxChange),
      gridlines: !!st.gridlines, qat: st.qat.slice(), qatPick: 0, qatSel: 0 };
  }
  /**
   * The Page Setup draft: three pages of Excel's dialog — Page (orientation, scaling), Header/Footer
   * (the three footer sections; &[File] &[Date] &[Page] &[Pages] &[Tab] are the tokens) and Sheet
   * (rows to repeat at top, print gridlines). Text fields take typed characters as typed; every
   * control answers to Alt+letter from anywhere, and to its bare letter when no text field has focus.
   */
  pageSetupDraft(tab) {
    const p = this.settings.pageSetup; const f = p.footer || {};
    const t = tab === 'hf' || tab === 'sheet' ? tab : 'page';
    return { kind: 'pagesetup', tab: t, focus: t === 'hf' ? 'footL' : t === 'sheet' ? 'titlesRows' : 'orient',
      orientation: p.orientation, scaling: p.scaling, adjustTo: String(p.adjustTo), fitWide: String(p.fitWide), fitTall: String(p.fitTall),
      titlesRows: String(p.titlesRows || ''), printGridlines: !!p.printGridlines,
      footL: String(f.left || ''), footC: String(f.centre || ''), footR: String(f.right || '') };
  }
  openOptions(page) { this.startClock(); this.openDialog('options', this.mode === 'ribbon' ? this.path : []); this.dlg = this.optionsDraft(page); }
  openPageSetup(tab) { this.startClock(); this.openDialog('pagesetup', this.mode === 'ribbon' ? this.path : []); this.dlg = this.pageSetupDraft(tab); }
  /** Esc / Cancel: the draft goes; a dialog opened from a menu returns to it, one opened by a chord closes to the grid. */
  cancelDialog() {
    this.dlg = null; this.dialogBuf = ''; this.note = ''; this.dialog = null;
    if (!this.path.length) this.exitRibbon(false);
  }
  /** The Tab order of the open dialog's controls. */
  dialogTabOrder() {
    const d = this.dlg; if (!d) return [];
    if (d.kind === 'pagesetup') return d.tab === 'hf' ? ['footL', 'footC', 'footR'] : d.tab === 'sheet' ? ['titlesRows', 'printGrid'] : ['orient', 'adjustTo', 'fitWide', 'fitTall'];
    if (d.kind === 'find') return d.replace ? ['find', 'repl'] : ['find'];
    if (d.kind === 'condfmt') return d.op === 'formula' ? ['formula', 'style'] : d.op === 'between' ? ['v1', 'v2', 'style'] : ['v1', 'style'];
    if (d.kind !== 'options') return [];   // Rename Sheet, Delete Sheet and Move or Copy have one control each: nothing to Tab between
    if (d.page === 'formulas') return ['pages', 'calc', 'iter'].concat(d.iterative ? ['maxIter', 'maxChange'] : []);
    if (d.page === 'advanced') return ['pages', 'gridlines'];
    return ['pages', 'qatLeft', 'qatRight'];
  }
  /**
   * A mouse-set field of the open draft ('focus', 'page', 'qatPick', 'qatSel'), recorded by the
   * view as a dialog click. The same state the keys reach. True when applied.
   */
  dialogSet(field, value) {
    const d = this.dlg; if (!d) return false;
    if (field === 'focus') { if (this.dialogTabOrder().includes(value)) d.focus = value; else return false; return true; }
    if (field === 'page' && d.kind === 'options') { if (!OPTIONS_LIVE_PAGES.includes(value)) return false; d.page = value; d.focus = 'pages'; return true; }
    if (field === 'qatPick' && d.kind === 'options') { const i = value | 0; if (i < 0 || i >= POPULAR_COMMANDS.length) return false; d.qatPick = i; d.focus = 'qatLeft'; return true; }
    if (field === 'qatSel' && d.kind === 'options') { const i = value | 0; if (i < 0 || i >= d.qat.length) return false; d.qatSel = i; d.focus = 'qatRight'; return true; }
    if (field === 'before' && d.kind === 'movesheet') { const i = value | 0; if (i < 0 || i > this.sheets.length) return false; d.before = i; return true; }   // a click on a "Before sheet" row
    if (field === 'special' && this.dialog === 'goto') { this.openGoToSpecial(); return true; }        // the Go To card's Special… button
    if (field === 'tab' && d.kind === 'pagesetup') { const L = { page: 'P', hf: 'H', sheet: 'S' }[value]; if (!L) return false; this.pageSetupKey('Alt+' + L); return true; }   // the card's tab strip
    if (field === 'grid' && d.kind === 'pagesetup') { this.pageSetupKey('Alt+G'); return true; }   // the card's Gridlines box
    if (field === 'replaceAll' && this.dialog === 'find' && d.kind === 'find' && d.replace) { this.findKey('ReplaceAll'); return true; }   // the card's Replace All button
    if (field === 'style' && d.kind === 'condfmt') { const i = value | 0; if (i < 0 || i >= CF_STYLE_KEYS.length) return false; d.styleIdx = i; d.focus = 'style'; return true; }   // a click on a style chip
    if (field === 'pick' && (d.kind === 'databar' || d.kind === 'colorscale')) { const n = d.kind === 'databar' ? CF_BAR_COLORS.length : CF_SCALES.length; const i = value | 0; if (i < 0 || i >= n) return false; d.idx = i; return true; }   // a click on a gallery tile
    if (field === 'rule' && d.kind === 'condrules') { const i = value | 0; if (i < 0 || i >= this.sheet.condFmt.length) return false; d.sel = i; return true; }   // a click on a rule row
    if (field === 'ruleact' && d.kind === 'condrules') { if (!['Delete', 'U', 'D', 'S'].includes(value)) return false; this.condRulesKey(value); return true; }   // the manager's buttons
    return false;
  }
  /**
   * One key inside Go To / Options / Page Setup, already logged: 'Enter' (OK), 'Tab' / 'Shift+Tab',
   * 'ArrowUp' / 'ArrowDown', 'Backspace', ' ', or one character (letters upper-case). The view's
   * clicks call this with the same values, so a click and a key reach the same state.
   */
  dlgKey(key) {
    if (this.dialog === 'goto') return this.gotoKey(key);
    if (this.dialog === 'find') return this.findKey(key);
    if (this.dialog === 'gotospecial') return this.gotoSpecialKey(key);
    if (this.dialog === 'options') return this.optionsKey(key);
    if (this.dialog === 'pagesetup') return this.pageSetupKey(key);
    if (this.dialog === 'renamesheet') return this.renameKey(key);
    if (this.dialog === 'deletesheet') return this.deleteKey(key);
    if (this.dialog === 'movesheet') return this.moveKey(key);
    if (this.dialog === 'group') return this.groupKey(key);
    if (this.dialog === 'numfmt') return this.numFmtKey(key);
    if (this.dialog === 'condfmt') return this.condFmtKey(key);
    if (this.dialog === 'condrules') return this.condRulesKey(key);
    if (this.dialog === 'databar' || this.dialog === 'colorscale') return this.condGalleryKey(key);
  }
  optionsKey(key) {
    const d = this.dlg; if (!d) return;
    const PAGE_KEY = { F: 'formulas', V: 'advanced', Q: 'qat' };
    const FIRST = { formulas: 'calc', advanced: 'gridlines', qat: 'qatLeft' };
    if (key === 'Enter') { this.optionsOk(); return; }
    if (key === 'Tab' || key === 'Shift+Tab') { const o = this.dialogTabOrder(); const i = Math.max(0, o.indexOf(d.focus)); d.focus = o[(i + (key === 'Tab' ? 1 : o.length - 1)) % o.length]; return; }
    if (PAGE_KEY[key]) { d.page = PAGE_KEY[key]; d.focus = FIRST[d.page]; return; }   // a page letter jumps into that page's first control
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      const dir = key === 'ArrowDown' ? 1 : -1;
      if (d.focus === 'pages') { const i = OPTIONS_LIVE_PAGES.indexOf(d.page); d.page = OPTIONS_LIVE_PAGES[Math.max(0, Math.min(OPTIONS_LIVE_PAGES.length - 1, i + dir))]; }
      else if (d.focus === 'calc') d.calcMode = dir > 0 ? 'manual' : 'automatic';
      else if (d.focus === 'qatLeft') d.qatPick = Math.max(0, Math.min(POPULAR_COMMANDS.length - 1, d.qatPick + dir));
      else if (d.focus === 'qatRight') d.qatSel = Math.max(0, Math.min(d.qat.length - 1, d.qatSel + dir));
      return;
    }
    if (key === ' ') { if (d.focus === 'iter') d.iterative = !d.iterative; else if (d.focus === 'gridlines') d.gridlines = !d.gridlines; return; }
    if (key === 'Backspace') { if (d.focus === 'maxIter') d.maxIterations = d.maxIterations.slice(0, -1); else if (d.focus === 'maxChange') d.maxChange = d.maxChange.slice(0, -1); return; }
    if (/^[0-9.]$/.test(key)) {
      if (d.focus === 'maxIter' && key !== '.' && d.maxIterations.length < 5) d.maxIterations += key;
      else if (d.focus === 'maxChange' && d.maxChange.length < 8 && !(key === '.' && d.maxChange.includes('.'))) d.maxChange += key;
      return;
    }
    if (d.page === 'formulas') {
      if (key === 'A') { d.calcMode = 'automatic'; d.focus = 'calc'; }
      else if (key === 'M') { d.calcMode = 'manual'; d.focus = 'calc'; }
      else if (key === 'I') { d.iterative = !d.iterative; d.focus = 'iter'; }
      else if (key === 'X' && d.iterative) d.focus = 'maxIter';
      else if (key === 'C' && d.iterative) d.focus = 'maxChange';
    } else if (d.page === 'advanced') {
      if (key === 'G') { d.gridlines = !d.gridlines; d.focus = 'gridlines'; }
    } else if (d.page === 'qat') {
      if (key === 'A') { const id = POPULAR_COMMANDS[d.qatPick]; if (id) { d.qat.push(id); d.qatSel = d.qat.length - 1; } }
      else if (key === 'R') { if (d.qat.length) { d.qat.splice(d.qatSel, 1); d.qatSel = Math.max(0, Math.min(d.qatSel, d.qat.length - 1)); } }
    }
  }
  /** OK: every draft value lands in `settings` (gridlines on the sheet), the dialog closes to the grid. */
  optionsOk() {
    const d = this.dlg, st = this.settings; if (!d) return;
    st.calcMode = d.calcMode === 'manual' ? 'manual' : 'automatic';
    st.iterative = !!d.iterative;
    st.maxIterations = clampInt(d.maxIterations, 1, 32767, st.maxIterations);
    const mc = parseFloat(d.maxChange); if (Number.isFinite(mc) && mc >= 0) st.maxChange = mc;
    st.gridlines = d.gridlines;
    st.qat = d.qat.slice();
    this.exitRibbon(true);
    this.emit('settings');
  }
  pageSetupKey(key) {
    const d = this.dlg; if (!d) return;
    const field = { adjustTo: 3, fitWide: 2, fitTall: 2 };   // digits each numeric field takes
    const textFocus = PAGESETUP_TEXT.has(d.focus);
    if (key === 'Enter') { this.pageSetupOk(); return; }
    this.note = '';   // a refused reference's note clears on the next key
    if (key === 'Tab' || key === 'Shift+Tab') { const o = this.dialogTabOrder(); const i = Math.max(0, o.indexOf(d.focus)); d.focus = o[(i + (key === 'Tab' ? 1 : o.length - 1)) % o.length]; d.fresh = d.focus; return; }   // a freshly focused field: the first digit replaces what it held (Excel selects the field's text)
    // accelerators: Alt+letter from anywhere; the bare letter only when no text field has the focus
    const acc = key.startsWith('Alt+') ? key.slice(4) : (!textFocus && /^[A-Z]$/.test(key) ? key : null);
    if (acc) {
      if (acc === 'P') { d.tab = 'page'; d.focus = 'orient'; return; }
      if (acc === 'H') { d.tab = 'hf'; d.focus = 'footL'; return; }
      if (acc === 'S') { d.tab = 'sheet'; d.focus = 'titlesRows'; return; }
      if (d.tab === 'hf' && (acc === 'L' || acc === 'C' || acc === 'R')) { d.focus = acc === 'L' ? 'footL' : acc === 'C' ? 'footC' : 'footR'; return; }   // the three sections (Excel's Footer dialog: Alt+L / C / R)
      if (acc === 'R') { d.tab = 'sheet'; d.focus = 'titlesRows'; return; }
      if (acc === 'G') { d.tab = 'sheet'; d.focus = 'printGrid'; d.printGridlines = !d.printGridlines; return; }
      if (d.tab === 'sheet') return;
      if (acc === 'T') { d.orientation = 'portrait'; d.focus = 'orient'; return; }
      if (acc === 'L') { d.orientation = 'landscape'; d.focus = 'orient'; return; }
      if (acc === 'A') { d.scaling = 'adjust'; d.focus = 'adjustTo'; d.fresh = 'adjustTo'; return; }
      if (acc === 'F') { d.scaling = 'fit'; d.focus = 'fitWide'; d.fresh = 'fitWide'; return; }
      return;
    }
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      const up = key === 'ArrowUp';
      if (d.focus === 'orient') d.orientation = up ? 'portrait' : 'landscape';
      else if (field[d.focus]) { const n = clampInt(d[d.focus], 0, 9999, 0) + (up ? 1 : -1); d[d.focus] = String(Math.max(d.focus === 'adjustTo' ? 10 : 1, n)); }   // the spinner
      return;
    }
    if (key === ' ') { if (d.focus === 'printGrid') { d.printGridlines = !d.printGridlines; return; } if (!textFocus) return; }   // a space types into a text field
    if (key === 'Backspace') { if (field[d.focus]) d[d.focus] = d[d.focus].slice(0, -1); else if (textFocus) d[d.focus] = d[d.focus].slice(0, -1); return; }
    if (textFocus) { if (key.length === 1 && d[d.focus].length < 64) d[d.focus] += key; return; }
    if (/^[0-9]$/.test(key) && field[d.focus]) { if (d.fresh === d.focus) { d[d.focus] = key; d.fresh = null; } else if (d[d.focus].length < field[d.focus]) d[d.focus] += key; }
  }
  pageSetupOk() {
    const d = this.dlg, p = this.settings.pageSetup; if (!d) return;
    p.orientation = d.orientation === 'landscape' ? 'landscape' : 'portrait';
    p.scaling = d.scaling === 'fit' ? 'fit' : 'adjust';
    p.adjustTo = clampInt(d.adjustTo, 10, 400, p.adjustTo);
    p.fitWide = clampInt(d.fitWide, 1, 99, p.fitWide);
    p.fitTall = clampInt(d.fitTall, 1, 99, p.fitTall);
    const titles = normTitlesRows(d.titlesRows);
    if (titles === null) { d.tab = 'sheet'; d.focus = 'titlesRows'; this.note = REF_NOT_VALID; return; }   // Excel refuses the reference and keeps the dialog open
    p.titlesRows = titles;
    p.footer = { left: normFooterText(d.footL), centre: normFooterText(d.footC), right: normFooterText(d.footR) };
    p.printGridlines = !!d.printGridlines;
    this.exitRibbon(true);
    this.emit('settings');
  }
  /** The keys of an open Go To / Options / Page Setup / sheet dialog: logged, then routed to dlgKey. A sheet name keeps the case typed; every other dialog takes the letter upper-case. */
  dialogKey(e) {
    const k = e.key;
    // Alt arms the dialog's accelerators (Excel's Alt+S Special…, Alt+A Replace All): a held
    // chord arrives as e.altKey, a scripted walk as Alt then the letter — both reach the branch
    if (k === 'Alt') { this._dlgAlt = true; return true; }
    const altish = e.altKey || this._dlgAlt; this._dlgAlt = false;
    if (altish && !e.ctrlKey && k.length === 1) {
      const ch = k.toUpperCase();
      if (this.dialog === 'goto' && ch === 'S') { this.logKey('Alt+S'); this.openGoToSpecial(); return true; }
      if (this.dialog === 'find' && ch === 'A') { this.logKey('Alt+A'); this.findKey('ReplaceAll'); return true; }
      if (this.dialog === 'pagesetup') { this.logKey('Alt+' + ch); this.pageSetupKey('Alt+' + ch); return true; }
      return true;
    }
    if (k === 'Escape') { this.logKey('Esc'); this.cancelDialog(); return true; }
    if (k === 'Enter') { this.logKey('↵'); this.dlgKey('Enter'); return true; }
    if (k === 'Tab') { const t = e.shiftKey ? 'Shift+Tab' : 'Tab'; this.logKey(t); this.dlgKey(t); return true; }
    if (ARROWS[k]) { this.logKey(ARROWSYM[k]); this.dlgKey(k); return true; }
    if (k === 'Backspace') { this.logKey('⌫'); this.dlgKey('Backspace'); return true; }
    if (k === 'Delete') { this.logKey('Del'); this.dlgKey('Delete'); return true; }
    if (k === ' ') { this.logKey('Space'); this.dlgKey(' '); return true; }
    if (k.length === 1 && !e.ctrlKey && !e.altKey) {
      const ch = /[a-z]/i.test(k) ? k.toUpperCase() : k; this.logKey(ch);
      const typed = TYPED_DIALOGS.has(this.dialog) || (this.dialog === 'pagesetup' && this.dlg && PAGESETUP_TEXT.has(this.dlg.focus))
        || (this.dialog === 'condfmt' && this.dlg && this.dlg.focus !== 'style');   // a text field keeps the case typed
      this.dlgKey(typed ? k : ch); return true;
    }
    return true;   // a modal dialog swallows everything else
  }

  /* ---------------- the Quick Access Toolbar ---------------- */
  /**
   * Run a toolbar entry by id: an Alt-walk command runs exactly as its KeyTips would, undo / redo /
   * copy / paste act on the sheet, and a command the engine lacks (Save, Format Painter…) is a no-op.
   * True when something ran.
   */
  runQat(id) {
    const q = QAT_COMMANDS[id]; if (!q) return false;
    this.startClock();
    if (q.np) { this.execCommand(q.np); return true; }
    const S = this.sheet;
    if (q.act === 'undo') return S.undo();
    if (q.act === 'redo') return S.redo();
    if (q.act === 'copy') { S.copy(false); return true; }
    if (q.act === 'paste') return S.paste('all');
    return false;
  }
  doAutoSum() {
    const S = this.sheet;
    const res = S.autoSum();
    if (res.committed) return;
    this.autoSumEdit = true;
    this.startEdit('=SUM(', 'enter');
    if (res.range) {
      const { a, b } = res.range;
      this.editPointerStart = this.editBuf.length; this.editPointer = { r: b.r, c: b.c };
      this.editPointerBase = (a.r === b.r && a.c === b.c) ? null : { r: a.r, c: a.c };
      this.writePointerRef();
    }
  }
  jumpPrecedent() {
    const S = this.sheet; const a = S.dispActive(); const c = S.get(a.r, a.c); if (!c.formula) return;
    const refs = formulaRefs(c.formula, { rows: S.rows, cols: S.cols }); if (!refs.length) return;
    const first = refs[0]; const p = first.key ? parseRef(first.key) : { r: first.range.r1, c: first.range.c1 };
    if (first.sheet) {   // a link: the precedent is on another sheet (Excel follows it)
      const i = this.sheets.findIndex(x => x.name.toLowerCase() === String(first.sheet).toLowerCase()); if (i < 0) return;
      const T = this.sheets[i].sheet; if (!T.inb(p.r, p.c)) return;
      this.switchSheet(i); T.goTo(p.r, p.c); return;
    }
    if (!S.inb(p.r, p.c)) return;
    S.goTo(p.r, p.c);
  }
  jumpDependent() {
    const S = this.sheet; const { r, c } = S.dispActive();
    const keys = Object.keys(S.cells).map(k => ({ k, p: parseRef(k) })).filter(x => x.p).sort((a, b) => (a.p.r - b.p.r) || (a.p.c - b.p.c));
    for (const { k, p } of keys) {
      const cell = S.cells[k]; if (!cell || !cell.formula) continue;
      const reads = formulaRefs(cell.formula, { rows: S.rows, cols: S.cols }).some(ref => ref.key ? ref.key === refKey(r, c) : (r >= ref.range.r1 && r <= ref.range.r2 && c >= ref.range.c1 && c <= ref.range.c2));
      if (reads) { S.goTo(p.r, p.c); return; }
    }
  }

  /**
   * Group (Alt+Shift+→) or ungroup (Alt+Shift+←) the selection's whole rows or columns — one outline
   * level, folded and unfolded from the outline bar or Data › Hide / Show Detail. A selection that is
   * neither whole rows nor whole columns does nothing but say so. The chord is logged as one key;
   * the ribbon route logs its own walk.
   */
  groupChord(isGroup, fromRibbon) {
    const S = this.sheet; const r = S.selRange();
    this.startClock();
    if (!fromRibbon) this.logKey(isGroup ? 'Alt+Shift+→' : 'Alt+Shift+←');
    const axis = r.c1 === 1 && r.c2 === S.cols ? 'r' : r.r1 === 1 && r.r2 === S.rows ? 'c' : null;
    if (!axis) {   // a cell range: Excel asks Rows or Columns (the Group / Ungroup dialog, Rows preselected — Enter groups the rows)
      this.openDialog('group', []); this.dlg = { kind: 'group', ungroup: !isGroup, axis: 'r' }; return false;
    }
    const ok = isGroup ? S.group(axis) : S.ungroup(axis);
    if (!ok && !isGroup) this.toast(NO_GROUP_NOTE);
    return ok;
  }
  /** The Group / Ungroup dialog's keys: ↑ ↓ or R / C pick Rows or Columns, Enter = OK over the selection's rows or columns. */
  groupKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'ArrowUp' || key === 'R') { d.axis = 'r'; return; }
    if (key === 'ArrowDown' || key === 'C') { d.axis = 'c'; return; }
    if (key !== 'Enter') return;
    const S = this.sheet, r = S.selRange(), { ungroup, axis } = d;
    this.exitRibbon(false);
    const [a, b] = axis === 'r' ? [r.r1, r.r2] : [r.c1, r.c2];
    const ok = ungroup ? S.ungroupSpan(axis, a, b) : S.groupSpan(axis, a, b);
    if (!ok && ungroup) this.toast(NO_GROUP_NOTE);
  }
  /* ---------------- Format Cells › Custom, and Conditional Formatting (Chapter 2) ---------------- */
  /** Ctrl+1 › U: the Custom box, prefilled with the active cell's code and selected (typing replaces it). ↵ applies; a code Excel would refuse keeps the box open with its note. */
  openNumFmt() {
    this.startClock();
    const a = this.sheet.dispActive(); const cell = this.sheet.get(a.r, a.c);
    const code = cell.fmtStyle === 'custom' && cell.numFmt ? cell.numFmt : builtinCode(cell.fmtStyle, cell.decimals, cell.scale);
    this.openDialog('numfmt', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'numfmt', code, selected: true };
  }
  numFmtKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') {
      if (!this.sheet.setCustomFormat(d.code)) { this.note = NUMFMT_BAD_NOTE; return; }   // the box stays open, as Excel's does
      this.exitRibbon(true); return;
    }
    if (key === 'Backspace') { d.code = d.selected ? '' : d.code.slice(0, -1); d.selected = false; this.note = ''; return; }
    if (key.length === 1) { const next = (d.selected ? '' : d.code) + key; if (next.length > 255) return; d.code = next; d.selected = false; this.note = ''; }
  }
  /**
   * Alt H L H G / L / B / E (a Highlight Cells preset) or Alt H L N (a formula rule): the card takes
   * the value(s) or the formula, ← → (or Tab to the style, then arrows) pick the style, ↵ adds the
   * rule on top of the list. A value Excel would refuse keeps the card open with its note.
   */
  openCondFmt(op) {
    this.startClock();
    this.openDialog('condfmt', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'condfmt', op, v1: '', v2: '', formula: '', styleIdx: 0, focus: op === 'formula' ? 'formula' : 'v1' };
  }
  condFmtKey(key) {
    const d = this.dlg; if (!d) return;
    if (key === 'Enter') {
      const style = CF_STYLE_KEYS[d.styleIdx]; let rule;
      // a formula (a rule's, or a preset's '=…' value) is read for the ACTIVE cell of the selection, as
      // Excel reads it, and stored re-based to the top-left of the Applies-to, where the rule keeps it
      const S = this.sheet, act = S.dispActive(), top = S.selRects()[0];
      const rebase = f => typeof f === 'string' && f.trimStart()[0] === '=' && (top.r1 !== act.r || top.c1 !== act.c) ? translateFormula(f, top.r1 - act.r, top.c1 - act.c) : f;
      if (d.op === 'formula') {
        const f = d.formula.trim(); if (!f || !parses(f)) { this.note = CF_FORMULA_NOTE; d.focus = 'formula'; return; }
        rule = { kind: 'formula', formula: rebase(f), style };
      } else {
        const a = condOperand(d.v1); if (a === null) { this.note = CF_VALUE_NOTE; d.focus = 'v1'; return; }
        const b = d.op === 'between' ? condOperand(d.v2) : 0; if (b === null) { this.note = CF_VALUE_NOTE; d.focus = 'v2'; return; }
        rule = { kind: 'cellValue', op: d.op, v1: rebase(a), v2: rebase(b), style };
      }
      this.sheet.addCondFmt(rule); this.exitRibbon(true); return;
    }
    if (key === 'Tab' || key === 'Shift+Tab') { const o = this.dialogTabOrder(); const i = Math.max(0, o.indexOf(d.focus)); d.focus = o[(i + (key === 'Tab' ? 1 : o.length - 1)) % o.length]; return; }
    if (key === 'ArrowLeft' || key === 'ArrowUp') { d.styleIdx = (d.styleIdx - 1 + CF_STYLE_KEYS.length) % CF_STYLE_KEYS.length; return; }
    if (key === 'ArrowRight' || key === 'ArrowDown') { d.styleIdx = (d.styleIdx + 1) % CF_STYLE_KEYS.length; return; }
    if (d.focus === 'style') return;
    if (key === 'Backspace') { d[d.focus] = d[d.focus].slice(0, -1); this.note = ''; return; }
    if (key.length === 1) { if (d[d.focus].length < 255) d[d.focus] += key; this.note = ''; }
  }
  /** Alt H L D (Data Bars) / Alt H L S (Color Scales): a gallery — ← → pick, ↵ adds the rule over the selection. */
  openCondGallery(kind) {
    this.startClock();
    this.openDialog(kind, this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind, idx: 0 };
  }
  condGalleryKey(key) {
    const d = this.dlg; if (!d) return;
    const list = d.kind === 'databar' ? CF_BAR_COLORS : CF_SCALES;
    if (key === 'Enter') {
      const pick = list[d.idx];
      this.sheet.addCondFmt(d.kind === 'databar' ? { kind: 'dataBar', color: pick.k } : { kind: 'colorScale', scale: pick.k });
      this.exitRibbon(true); return;
    }
    if (key === 'ArrowLeft' || key === 'ArrowUp') { d.idx = (d.idx - 1 + list.length) % list.length; return; }
    if (key === 'ArrowRight' || key === 'ArrowDown') { d.idx = (d.idx + 1) % list.length; return; }
  }
  /**
   * Alt H L R: the Rules Manager for the sheet — ↑ ↓ pick a rule, Delete removes it, U / D move it
   * up / down (Excel's Move Up / Move Down), S toggles Stop If True, ↵ closes. Every edit is live.
   */
  openCondRules() {
    this.startClock();
    this.openDialog('condrules', this.mode === 'ribbon' ? this.path : []);
    this.dlg = { kind: 'condrules', sel: 0 };
  }
  condRulesKey(key) {
    const d = this.dlg; if (!d) return;
    const S = this.sheet, rules = S.condFmt;
    if (key === 'Enter') { this.exitRibbon(true); return; }
    const cur = rules[d.sel];
    if (key === 'ArrowUp') { d.sel = Math.max(0, d.sel - 1); return; }
    if (key === 'ArrowDown') { d.sel = Math.min(Math.max(0, rules.length - 1), d.sel + 1); return; }
    if (!cur) return;
    if (key === 'Delete' || key === 'Backspace') { S.removeCondFmt(cur.id); d.sel = Math.min(d.sel, Math.max(0, rules.length - 1)); return; }
    if (key === 'U') { if (S.moveCondFmt(cur.id, -1)) d.sel--; return; }
    if (key === 'D') { if (S.moveCondFmt(cur.id, 1)) d.sel++; return; }
    if (key === 'S' || key === ' ') { S.setCondFmtStop(cur.id); }   // a data bar's or a colour scale's box is greyed out: the sheet refuses it
  }
  /** Ctrl+` / Formulas › Show Formulas: the view paints every formula's text instead of its value. */
  toggleShowFormulas() { this.startClock(); this.settings.showFormulas = !this.settings.showFormulas; this.emit('settings'); this.sheet.emit('layout'); }

  /* ---------------- the dispatcher ---------------- */
  dispatch(e) {
    const S = this.sheet; const k = e.key;
    if (k === 'F4') { /* always ours */ }
    if (this.mode === 'ribbon') return this.ribbonKey(e);

    // Ctrl+Shift+= / Ctrl+= / Ctrl++ insert, Ctrl+- / Ctrl+_ delete — full rows/columns only
    if (e.ctrlKey && !this.editing && (k === '+' || k === '=' || k === '-' || k === '_')) {
      const isInsert = k === '+' || k === '=';
      if (S.insertOrDelete(isInsert)) { this.startClock(); this.logKey(isInsert ? (e.shiftKey ? 'Ctrl+Shift+=' : 'Ctrl++') : 'Ctrl+-'); }
      return true;   // swallow browser zoom either way
    }
    // Ctrl+9 / Ctrl+0 hide the selection's rows / columns; Ctrl+Shift+( / ) unhide inside it
    // (Ctrl+Shift+9/0 arrive as the shifted characters). While editing they are swallowed so the
    // browser's zoom never fires.
    if (e.ctrlKey && !e.altKey && (k === '9' || k === '0' || k === '(' || k === ')')) {
      if (this.editing) return true;
      this.startClock();
      if (k === '9') { this.logKey('Ctrl+9'); S.hideRows(); }
      else if (k === '0') { this.logKey('Ctrl+0'); S.hideCols(); }
      else if (k === '(') { this.logKey('Ctrl+Shift+('); S.unhideRows(); }
      else { this.logKey('Ctrl+Shift+)'); S.unhideCols(); }
      return true;
    }

    if (this.editing) return this.editKey(e);

    // type-to-replace
    if (k.length === 1 && !e.ctrlKey && !e.altKey && k !== '=' && k !== '+' && !(k === ' ' && e.shiftKey)) {
      this.startEdit(k, 'enter'); this.logKey(k); return true;
    }
    if ((k === '=' || k === '+') && !e.ctrlKey && !e.altKey) { this.startEdit(k === '+' ? '=+' : '='); this.logKey(k); return true; }
    if (k === 'F2' && !e.shiftKey) {
      this.startClock(); this.logKey('F2'); this.editRetarget();
      const a = S.dispActive(); const c = S.get(a.r, a.c);
      const initial = c.formula || (c.value != null && c.value !== '' ? (typeof c.value === 'boolean' ? (c.value ? 'TRUE' : 'FALSE') : String(c.value)) : '');
      this.startEdit(initial, 'edit'); return true;
    }
    if (k === 'F5' && !e.ctrlKey && !e.altKey && !e.shiftKey) { this.logKey('F5'); this.openGoTo(); return true; }
    if (k === 'F4' && !e.ctrlKey && !e.altKey && !e.shiftKey) {   // repeat the last action on the current selection (Excel's F4 / Ctrl+Y outside Edit mode)
      if (S.lastAction) { this.startClock(); this.logKey('F4'); S.repeatLast(); }
      return true;
    }
    if (k === 'F11' && e.shiftKey && !e.ctrlKey && !e.altKey) { this.startClock(); this.logKey('Shift+F11'); this.insertSheet(); return true; }
    if (k === 'F9' && !e.ctrlKey && !e.altKey && !e.shiftKey) { this.startClock(); this.logKey('F9'); S.commit('recalc'); return true; }   // Calculate Now (every sheet is always current: recorded manual mode changes nothing)
    if (k === 'Delete' && !e.ctrlKey && !e.altKey) { this.startClock(); this.logKey('Delete'); S.deleteContents(); return true; }
    if (k === 'Backspace' && !e.ctrlKey && !e.altKey) {   // opens the cell empty; nothing is written until ↵ (Esc restores)
      this.startClock(); this.logKey('⌫'); this.startEdit('', 'enter'); return true;
    }
    if (k === 'Escape' && !e.ctrlKey && !e.altKey) {
      if (S.clipboard) { S.clearClipboard(); this.logKey('Esc'); }
      return true;
    }
    if (k === 'Alt' && !e.shiftKey && !e.ctrlKey) { this.logKey('Alt'); this.enterRibbon(); return true; }
    if (e.altKey && !e.ctrlKey) {
      if (k === '=') { this.logKey('Alt'); this.logKey('='); this.doAutoSum(); return true; }
      if (e.shiftKey && (k === 'ArrowRight' || k === 'ArrowLeft')) { this.groupChord(k === 'ArrowRight'); return true; }   // Group / Ungroup
      if (k === 'PageDown' || k === 'PageUp') {   // a screen right / left
        this.startClock(); this.logKey('Alt+' + (k === 'PageDown' ? 'PgDn' : 'PgUp'));
        S.move(0, (this.pageCols || 10) * (k === 'PageDown' ? 1 : -1), e.shiftKey, false); return true;
      }
      return true;
    }
    if (k === 'Enter' && !e.ctrlKey && !e.altKey) {
      this.startClock();
      if (!e.shiftKey && S.clipboard) { this.logKey('↵'); S.pasteDrop(); return true; }
      this.logKey(e.shiftKey ? 'Shift+↵' : '↵');
      if (!e.shiftKey && this.tabEnterHome()) { S.emit('select'); return true; }
      S.move(e.shiftKey ? -1 : 1, 0, false, false); return true;
    }
    if (k === 'Tab' && !e.ctrlKey && !e.altKey) {
      this.startClock(); this.logKey(e.shiftKey ? 'Shift+Tab' : 'Tab');
      const prev = { r: S.active.r, c: S.active.c }, was = S.tabHome;
      S.move(0, e.shiftKey ? -1 : 1, false, false); this.tabArm(prev, e.shiftKey, was); return true;
    }
    if (ARROWS[k] && !e.altKey) {
      this.startClock(); const [dr, dc] = ARROWS[k];
      this.logKey((e.ctrlKey ? 'Ctrl+' : '') + (e.shiftKey ? 'Shift+' : '') + ARROWSYM[k]);
      S.move(dr, dc, e.shiftKey, e.ctrlKey); return true;
    }
    if (k === 'PageDown' || k === 'PageUp') {
      this.startClock();
      const down = k === 'PageDown';
      if (e.ctrlKey) {   // the next / previous sheet — no wrap (Excel); at the end nothing moves but the key still counts
        this.logKey('Ctrl+' + (e.shiftKey ? 'Shift+' : '') + (down ? 'PgDn' : 'PgUp'));
        this.switchSheet(this.sheetIndex + (down ? 1 : -1)); return true;
      }
      this.logKey((e.shiftKey ? 'Shift+' : '') + k);
      const step = (this.pageRows || 10) * (down ? 1 : -1); S.move(step, 0, e.shiftKey, false); return true;
    }
    if (k === 'Home' && !e.altKey) { this.startClock(); this.logKey((e.ctrlKey ? 'Ctrl+' : '') + (e.shiftKey ? 'Shift+' : '') + 'Home'); S.moveHome(e.ctrlKey, e.shiftKey); return true; }
    if (k === 'End' && !e.altKey) { this.startClock(); this.logKey((e.ctrlKey ? 'Ctrl+' : '') + (e.shiftKey ? 'Shift+' : '') + 'End'); S.moveEnd(e.ctrlKey, e.shiftKey); return true; }
    if (k === ' ' && e.shiftKey && !e.ctrlKey) { this.startClock(); this.logKey('Shift+Space'); S.selectRow(); return true; }
    if (k === ' ' && e.ctrlKey && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+Space'); S.selectCol(); return true; }
    if ((k === ' ' && e.ctrlKey && e.shiftKey) || (e.ctrlKey && !e.altKey && (k === '*' || (k === '8' && e.shiftKey)))) {   // keypad * carries no Shift
      this.startClock(); this.logKey(k === ' ' ? 'Ctrl+Shift+Space' : 'Ctrl+Shift+8');
      const a = S.dispActive(); const rg = S.regionAround(a.r, a.c); S.sel = { r: rg.r1, c: rg.c1 }; S.active = { r: rg.r2, c: rg.c2 }; S.selA = { r: a.r, c: a.c }; S.emit('select'); return true;
    }
    if (e.ctrlKey && !e.altKey) {
      const lk = k.toLowerCase();
      if (lk === 'a') { this.startClock(); this.logKey('Ctrl+A'); S.selectAll(); return true; }
      if (lk === 'z' && !e.shiftKey) { this.logKey('Ctrl+Z'); S.undo(); return true; }
      if (lk === 'y' || (lk === 'z' && e.shiftKey)) { this.logKey('Ctrl+Y'); S.redo(); return true; }
      if (lk === 'c' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+C'); S.copy(false); return true; }
      if (lk === 'x' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+X'); S.copy(true); return true; }
      if (lk === 'v' && e.shiftKey) { this.startClock(); this.logKey('Ctrl+Shift+V'); S.paste('values'); return true; }
      if (lk === 'v') { this.startClock(); this.logKey('Ctrl+V'); S.paste('all'); return true; }
      if (lk === 'd' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+D'); S.fill('down'); return true; }
      if (lk === 'r' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+R'); S.fill('right'); return true; }
      if (lk === 'b' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+B'); S.toggleAllOrNone('bold'); return true; }
      if (lk === 'i' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+I'); S.toggleAllOrNone('it'); return true; }
      if (lk === 'u' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+U'); S.toggleAllOrNone('uline'); return true; }
      if (k === '5' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+5'); S.toggleAllOrNone('strike'); return true; }
      if (k === '%') { this.startClock(); this.logKey('Ctrl+Shift+%'); S.setNumberFormat('percent', 0); return true; }
      if (k === '$') { this.startClock(); this.logKey('Ctrl+Shift+$'); S.setNumberFormat('currency', 2); return true; }
      if (k === '!') { this.startClock(); this.logKey('Ctrl+Shift+!'); S.setNumberFormat('comma', 2); return true; }
      if (k === '~') { this.startClock(); this.logKey('Ctrl+Shift+~'); S.setNumberFormat('general', 0); return true; }
      if (k === '1' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+1'); this.openDialog('fmt'); return true; }
      if (k === ';' && !e.shiftKey) { this.startClock(); this.logKey('Ctrl+;'); const da = S.dispActive(); S.dateStamp(da.r, da.c); return true; }
      if (k === '`' && !e.shiftKey) { this.logKey('Ctrl+`'); this.toggleShowFormulas(); return true; }
      if (k === '[') { this.startClock(); this.logKey('Ctrl+['); this.jumpPrecedent(); return true; }
      if (k === ']') { this.startClock(); this.logKey('Ctrl+]'); this.jumpDependent(); return true; }
      if (lk === 'g' && !e.shiftKey) { this.logKey('Ctrl+G'); this.openGoTo(); return true; }
      if (lk === 'f' && !e.shiftKey) { this.logKey('Ctrl+F'); this.openFind(false); return true; }
      if (lk === 'h' && !e.shiftKey) { this.logKey('Ctrl+H'); this.openFind(true); return true; }
      return true;   // unknown chords are swallowed, never typed
    }
    if (e.ctrlKey && e.altKey && k.toLowerCase() === 'v') { this.startClock(); this.logKey('Ctrl+Alt+V'); this.openDialog('paste'); this.pasteKind = 'all'; this.pasteOp = 'none'; return true; }
    return false;
  }

  editKey(e) {
    const S = this.sheet; const k = e.key;
    if (this.dialog === 'fxfix') {
      if (k === 'Enter') { this.logKey('↵'); this.applyRibbon('ENTER'); return true; }
      if (k === 'Escape') { this.dialog = null; this.fxfixPend = null; return true; }
      return true;
    }
    if (k === 'F2') { this.editMode = this.editMode === 'edit' ? 'enter' : 'edit'; this.endPoint(); this.logKey('F2'); return true; }   // F2 ends point mode: the ref becomes plain text
    if ((k === 'PageDown' || k === 'PageUp') && e.ctrlKey && !e.altKey) {   // the next / previous sheet: an Enter-mode entry commits first (as an arrow would); F2 swallows it
      if (this.editBuf[0] === '=' && this.editMode !== 'edit') {   // a formula being entered stays open on its cell: the next sheet shows, and arrows point there as Sheet!refs (Excel)
        const idx = Math.max(0, Math.min(this.sheets.length - 1, this.sheetIndex + (k === 'PageDown' ? 1 : -1)));
        if (idx !== this.sheetIndex) { if (this.editOrigin == null) this.editOrigin = this.sheetIndex; this.sheetIndex = idx; this.sheet = this.sheets[idx].sheet; this.endPoint(); this.logKey(k === 'PageDown' ? 'Ctrl+PgDn' : 'Ctrl+PgUp'); this.emit('sheet'); }
        return true;
      }
      if (this.editMode === 'edit' || this.editPointer) return true;
      S.tabHome = null;
      if (!this.commitEdit(0, 0, { kind: 'move' })) return true;
      return this.dispatch(e);
    }
    // Home / End move the insertion point in either mode; Delete is a forward-delete (a no-op at the end) — never a cell wipe
    if (k === 'Home') { this.endPoint(); this.editCaret = this.editBuf[0] === '=' ? 1 : 0; return true; }
    if (k === 'End') { this.endPoint(); this.editCaret = this.editBuf.length; return true; }
    if (k === 'Delete') { if (this.editCaret < this.editBuf.length) { this.editBuf = this.editBuf.slice(0, this.editCaret) + this.editBuf.slice(this.editCaret + 1); this.logKey('Delete'); } return true; }
    if (this.editMode === 'edit') {
      if (k === 'ArrowLeft') { this.editCaret = Math.max(0, this.editCaret - 1); return true; }
      if (k === 'ArrowRight') { this.editCaret = Math.min(this.editBuf.length, this.editCaret + 1); return true; }
      if (k === 'ArrowUp') { this.editCaret = this.editBuf[0] === '=' ? 1 : 0; return true; }
      if (k === 'ArrowDown') { this.editCaret = this.editBuf.length; return true; }
    }
    if (k === 'Enter' && e.altKey) return true;   // Excel's in-cell line break — never a commit (no multi-line cells here, so swallowed)
    if (k === 'Enter') {
      if (e.ctrlKey) { this.logKey('Ctrl+↵'); this.commitEditAll(); return true; }   // one cell or a range: commits in place
      this.logKey(e.shiftKey ? 'Shift+↵' : '↵'); this.commitEnter(e.shiftKey); return true;
    }
    if (k === 'Tab') { this.logKey(e.shiftKey ? 'Shift+Tab' : 'Tab'); this.commitTab(e.shiftKey); return true; }
    if (k === 'Escape') { this.logKey('Esc'); this.cancelEdit(); return true; }
    if (k === 'F4') { if (this.cycleAnchor()) this.logKey('F4'); return true; }
    if (k === 'F9') {
      if (this.editBuf[0] === '=' || this.editBuf[0] === '+') {
        try { const v = evalFormula(this.editBuf[0] === '+' ? '=' + this.editBuf.slice(1) : this.editBuf, S.evalCtx({ cell: this.editCell() }));
          if (v !== undefined && v !== null) { this.editBuf = typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v); this.editCaret = this.editBuf.length; this.endPoint(); this.logKey('F9'); } } catch (err) { /* keep buffer */ }
      }
      return true;
    }
    if (k === 'Backspace') {
      if (this.editPointer) { this.editBuf = this.editBuf.slice(0, this.editPointerStart); this.editCaret = this.editBuf.length; this.endPoint(); }
      else if (this.editCaret > 0) { this.editBuf = this.editBuf.slice(0, this.editCaret - 1) + this.editBuf.slice(this.editCaret); this.editCaret--; }
      this.logKey('⌫'); return true;
    }
    if (ARROWS[k] && e.altKey) return true;   // Alt+Shift+→ mid-entry is nothing, not a commit
    if (ARROWS[k]) {
      const [dr, dc] = ARROWS[k]; const ctrl = e.ctrlKey ? 'Ctrl+' : '';
      if (this.editPointer) { if (this.movePointer(dr, dc, e.shiftKey, e.ctrlKey)) this.logKey(ctrl + (e.shiftKey ? '⇧+' : '') + ARROWSYM[k]); return true; }
      if (this.editAnchor && this.editBuf[0] === '=') { if (this.pointArrow(dr, dc, e.ctrlKey)) this.logKey(ctrl + ARROWSYM[k]); return true; }
      S.tabHome = null; this.commitEdit(dr, dc, { kind: 'move' }); return true;
    }
    if (k.length === 1 && !e.ctrlKey && !e.altKey) {
      this.editPointer = null; this.editPointerStart = -1;
      this.editBuf = this.editBuf.slice(0, this.editCaret) + k + this.editBuf.slice(this.editCaret); this.editCaret++;
      this.logKey(k); return true;
    }
    return true;
  }
}
