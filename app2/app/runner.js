// app2/app/runner.js — runs one lesson: builds the sheet and session, feeds keys, tracks goals.
// Headless (the replay test uses it); the lesson view paints from it.

import { Sheet } from '../engine/sheet.js';
import { Session, parseKeyScript, parseKeySpec } from '../engine/keyboard.js';
import { stepPath } from '../engine/ribbon.js';
import { workbookState, applyStatePatch } from '../content/workbooks/index.js';
import { mulberry32 } from '../engine/rng.js';
import { SEEDED_KINDS } from '../content/schema.js';

export class LessonRun {
  /**
   * @param {object} lesson   a lesson module's default export
   * @param {object} [opts]   mode ('guided' | 'solo' | 'timed'), onKey, onToast, onRefuse, onMouse, now()
   */
  constructor(lesson, opts = {}) {
    this.lesson = lesson;
    this.opts = opts;
    this.mode = opts.mode || 'guided';
    this.listeners = new Set();
    this.reset();
  }
  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(what) { for (const fn of this.listeners) fn(what, this); }

  /** Fresh sheet + session at the lesson's starting state. */
  reset(mode) {
    if (mode) this.mode = mode;
    this.ghostSnap = null; this.ghosting = false;   // a restart mid-ghost: the freeze belongs to the session being thrown away
    const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: sp.cells ? structuredCloneCells(sp.cells) : undefined, colW: sp.colW, active: sp.active, today: this.opts.today, rowH: sp.rowH, hiddenRows: sp.hiddenRows, hiddenCols: sp.hiddenCols, freeze: sp.freeze, gridlines: sp.gridlines, groups: sp.groups, condFmt: sp.condFmt });
    // A module lesson (C2): the starting workbook is a named state of the module workbook — the
    // file the previous lesson left — not an inline sheet. The legacy path stays for drills and
    // the old lessons until the rewrite completes.
    const moduleState = this.lesson.workbook && this.lesson.state && this.lesson.state.before
      ? workbookState(this.lesson.workbook, this.lesson.state.before) : null;
    // A challenge is a generator: the seed decides the clothing, figures and planting positions
    // (content only, never workload). The seed number is remembered so the attempt can carry it
    // and a ghost can replay the very sheet the run was set on.
    if (moduleState && SEEDED_KINDS.includes(this.lesson.kind) && typeof this.lesson.seed === 'function') {
      this.seedNo = Number.isFinite(this.opts.seedNo) ? this.opts.seedNo >>> 0 : (Math.random() * 4294967296) >>> 0;
      applyStatePatch(moduleState, this.lesson.seed(mulberry32(this.seedNo)) || {});
    }
    // A lesson's planting (C2 Run 3): what arrived in the file for this lesson to fix — the associate's grid, a
    // retyped Thursday, five errors on Costs — applied over `before` so the chain of states stays honest.
    if (moduleState && this.lesson.plant && typeof this.lesson.plant === 'object') applyStatePatch(moduleState, this.lesson.plant);
    // a test's or a Daily's patch: { '<Sheet>!<ref>': cellRecord | null, '<Sheet>!#colW': {…} } applied over `before`
    if (moduleState && this.opts.statePatch) applyStatePatch(moduleState, this.opts.statePatch);
    const spec = moduleState ? moduleState.sheets[0] : this.lesson.sheet || {};
    const first = build(spec);
    this.session = new Session(first, { onKey: this.opts.onKey, onToast: this.opts.onToast, onRefuse: this.opts.onRefuse, now: this.opts.now, onMouse: this.opts.onMouse });
    // A workbook: the state's sheets, or lesson.sheets ([0] is the starting sheet), name the tabs.
    const sheets = moduleState ? moduleState.sheets : Array.isArray(this.lesson.sheets) ? this.lesson.sheets : [];
    if (sheets.length && this.session.sheets) {
      if (sheets[0] && sheets[0].name) this.session.sheets[0].name = sheets[0].name;
      for (const sh of sheets.slice(1)) if (this.session.addSheet) this.session.addSheet(sh.name, build(sh));
      for (let pass = 0; pass < 2; pass++) for (const e of this.session.sheets) e.sheet.recalc();   // cross-sheet links read their sheets once every sheet exists (no #REF! until the first edit)
    }
    if (moduleState && moduleState.settings) {
      const st = moduleState.settings;
      if (st.calcMode) this.session.settings.calcMode = st.calcMode;
      if (st.iterative !== undefined) this.session.settings.iterative = !!st.iterative;
      if (Array.isArray(st.qat)) this.session.settings.qat = st.qat.slice();
      if (st.pageSetup && typeof st.pageSetup === 'object') { const p = JSON.parse(JSON.stringify(st.pageSetup)); this.session.settings.pageSetup = { ...this.session.settings.pageSetup, ...p, footer: { ...this.session.settings.pageSetup.footer, ...(p.footer || {}) } }; }
    }
    this.landedAt = [];   // when each goal landed (the session clock), for split times
    // Demo goals (goal.demo = { script, cadence }): the platform plays the keys itself while the
    // learner watches. The session records which demos have finished so the goal's check can read it.
    this.session.demoDone = new Set();
    // The key window: a mechanic check reads only keys pressed since its goal became current
    // (keyLog.slice(goalMark)), so a key pressed for an earlier goal, or before the lesson began,
    // cannot satisfy a later one.
    this.session.goalMark = 0;
    this.doneCount = 0;
    this.finished = false;
    this.finishedAt = null;
    // A change that did not come through key() (a mouse click on the sheet or ribbon, a dialog
    // option clicked) is graded too: the engine grades end state, whichever route produced it.
    this.session.onChange(() => { if (!this.inKey) this.evaluate(); this.emit('session'); });
    this.emit('reset');
  }

  /** The active sheet (a workbook lesson can switch sheets; the session owns the pointer). */
  get sheet() { return this.session.sheet; }
  get goals() { return this.lesson.goals; }
  /**
   * Seconds each landed goal took: from the moment it became current (the previous goal landing, or
   * the first key for the first goal) to the moment it landed. null while a goal is open.
   */
  /** When goal i became current on the session clock: the previous goal's landing, or the first key for the first goal. */
  goalStart(i) { return i === 0 ? this.session.t0 : (this.landedAt[i - 1] == null ? null : this.landedAt[i - 1]); }
  splits() {
    return this.goals.map((g, i) => {
      const end = this.landedAt[i]; if (end == null) return null;
      const start = i === 0 ? this.session.t0 : this.landedAt[i - 1];
      return start == null ? null : Math.max(0, (end - start) / 1000);
    });
  }
  /**
   * What the learner should do next: the current goal, or, once every goal has landed but an
   * end-state predicate still fails, that predicate (it has `text` and no `keys`). null when finished.
   */
  get current() {
    if (this.finished) return null;
    if (this.doneCount < this.goals.length) return this.goals[this.doneCount];
    const end = this.endStates().find(e => !e.ok);
    if (end) return end;
    const grader = this.graderStates().find(g => !g.ok);
    return grader ? { text: grader.why, grader: true } : null;
  }
  /** The lesson clock is the engine clock: it starts on the first key that does something. */
  get startedAt() { return this.session.t0; }
  get elapsed() {
    const now = this.opts.now ? this.opts.now() : Date.now();
    if (this.startedAt == null) return 0;
    return ((this.finishedAt == null ? now : this.finishedAt) - this.startedAt) / 1000;
  }
  get par() { return typeof this.lesson.par === 'number' ? this.lesson.par : null; }
  /** The reference route's key count: the authored `optimalKeys`, else the solution's presses (the efficiency axis, C2 addendum). */
  get optimalKeys() { return Number.isInteger(this.lesson.optimalKeys) && this.lesson.optimalKeys > 0 ? this.lesson.optimalKeys : keyCount(this.lesson.solution); }
  /** A timed run past its limit (the clock started, the limit is set, the time is up). */
  get timedOut() { return typeof this.lesson.timeLimit === 'number' && this.startedAt != null && this.elapsed > this.lesson.timeLimit; }

  /** Feed one key event; returns true when the session consumed it. */
  key(ev) {
    if (this.finished) return false;
    this.inKey = true;
    let handled;
    try { handled = this.session.key(ev); } finally { this.inKey = false; }
    if (handled) this.evaluate();
    return handled;
  }
  /** Workspace mouse actions recorded by the views (SITE_SPEC §6): clicks on the sheet, ribbon or a dialog. */
  get mouseCount() { return this.session.mouse ? this.session.mouse.count : 0; }
  /** Run a keystroke script through the lesson (the replay test uses this). A pending demo plays first, synchronously. */
  run(script) {
    this.playPendingDemo();
    for (const step of parseKeyScript(script)) {
      if (step.type === 'text') { for (const ch of step.text) this.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
      else this.pressSpec(step.spec);
      this.playPendingDemo();
    }
  }
  /** The current goal's demo, if it has one and it has not played yet. */
  pendingDemo() { const g = this.current; return g && g.demo && !this.session.demoDone.has(g.id) ? g : null; }
  /** The keys of a demo goal, as steps the view can play one at a time: [{ spec } | { text }]. */
  demoSteps(goal) { return parseKeyScript(goal.demo.script); }
  /**
   * Feed one demo step (the view plays them on a cadence). A closer's demo (goal.closer) plays as
   * a ghost: the first step freezes the run, so the perturbation it types goes back afterwards.
   */
  demoStep(step) {
    const g = this.current;
    if (g && g.closer && !this.ghostSnap) this.beginGhost();
    if (step.type === 'text') { for (const ch of step.text) this.session.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
    else this.session.key(parseKeySpec(step.spec));
  }
  /** The demo has finished: the goal can land. A closer's ghost is put back first, so the after state stays exact. */
  finishDemo(goal) {
    const at = goal.closer && this.ghostSnap ? this.ghostSnap.at : null;
    if (goal.closer && this.ghostSnap) this.endGhost();
    this.session.demoDone.add(goal.id); this.evaluate();
    if (at != null && this.finished) { this.finishedAt = at; this.landedAt[this.goals.length - 1] = at; }   // the closer's playback is not on the learner's clock
    this.emit('demo');
  }
  /** Play the current goal's demo at once (headless replay, or the learner skipping ahead). */
  playPendingDemo() {
    let g;
    while ((g = this.pendingDemo())) { for (const step of this.demoSteps(g)) this.demoStep(step); this.finishDemo(g); }
  }
  pressSpec(spec) { return this.key(parseKeySpec(spec)); }

  /* ---------------- ghost replay (C2 gap 9a): "Show me" plays the keys, then puts everything back ---------------- */
  /** The current goal's hint as playable steps (glyphs and connectives normalised away). */
  ghostSteps(keys) { return parseKeyScript(hintToScript(keys)); }
  /**
   * Freeze the run before a ghost plays: every sheet's state, the workbook pointer, the clock and
   * the key log. While `ghosting`, evaluate() is a no-op, so nothing a ghost presses can land a
   * goal or finish the run; endGhost() restores the freeze, so no cell, selection, undo entry,
   * key-log line or settings change survives either.
   */
  beginGhost() {
    if (this.ghostSnap) return;
    const ses = this.session;
    this.ghostSnap = {
      sheets: ses.sheets.map(e => ({ snap: e.sheet.snapshot(), gridlines: e.sheet.gridlines, undo: e.sheet.undoStack.length, redo: e.sheet.redoStack.length })),
      clip: ses.sheet.clipboard,   // the workbook's one clipboard
      idx: ses.sheetIndex, t0: ses.t0, keyLen: ses.keyLog.length, mouse: ses.mouse.count,
      settings: JSON.parse(JSON.stringify({ calcMode: ses.settings.calcMode, iterative: ses.settings.iterative, qat: ses.settings.qat, pageSetup: ses.settings.pageSetup, showFormulas: !!ses.settings.showFormulas })),
      at: this.opts.now ? this.opts.now() : Date.now(),   // when the ghost began: a closer's playback is the platform's time, not the learner's
    };
    this.ghosting = true;
  }
  /** Feed one ghost step (the view plays them on a cadence; keycaps flash through onKey as usual). */
  ghostStep(step) { this.demoStep(step); }
  /** The ghost is over (finished, skipped or scrubbed): put the run back exactly as it stood. */
  endGhost() {
    const g = this.ghostSnap; if (!g) return;
    const ses = this.session;
    ses.sheets.length = g.sheets.length;   // a ghost that inserted a sheet loses it again
    g.sheets.forEach((s, i) => { const sh = ses.sheets[i].sheet; sh.restore(s.snap); sh.gridlines = s.gridlines; sh.undoStack.length = s.undo; sh.redoStack.length = s.redo; });
    ses.sheetIndex = g.idx; ses.sheet = ses.sheets[g.idx].sheet; ses.sheet.clipboard = g.clip;
    ses.t0 = g.t0; ses.keyLog.length = g.keyLen; ses.mouse.count = g.mouse;
    Object.assign(ses.settings, g.settings);
    ses.resetEdit(); ses.mode = 'normal'; ses.path = []; ses.dialog = null; ses.dlg = null; ses.dialogBuf = ''; ses.pasteKind = null; ses.note = '';
    this.ghostSnap = null; this.ghosting = false;
    this.emit('session');
  }
  /** Rewind a paused ghost to just after step i: restore the freeze, replay 0..i instantly. */
  ghostSeek(steps, i) {
    const g = this.ghostSnap; if (!g) return;
    const ses = this.session;
    ses.sheets.length = g.sheets.length;
    g.sheets.forEach((s, j) => { const sh = ses.sheets[j].sheet; sh.restore(s.snap); sh.gridlines = s.gridlines; sh.undoStack.length = s.undo; sh.redoStack.length = s.redo; });
    ses.sheetIndex = g.idx; ses.sheet = ses.sheets[g.idx].sheet; ses.sheet.clipboard = g.clip;
    ses.resetEdit(); ses.mode = 'normal'; ses.path = []; ses.dialog = null; ses.dlg = null; ses.dialogBuf = ''; ses.pasteKind = null;
    for (let j = 0; j <= i && j < steps.length; j++) this.demoStep(steps[j]);
    this.emit('session');
  }

  /** Advance goals whose checks now pass, in order; mark the lesson finished when all land. */
  evaluate() {
    if (this.ghosting) return false;   // a ghost's keys never land a goal
    let moved = false;
    while (this.doneCount < this.goals.length && safeCheck(this.goals[this.doneCount], this.sheet, this.session)) {
      const now = this.opts.now ? this.opts.now() : Date.now();
      this.landedAt[this.doneCount] = now;
      this.doneCount++; moved = true;
      this.session.goalMark = this.session.keyLog.length;   // the next goal's key window starts here
      // the funnel (C2 addendum): a goal landed, and how long since the first key — fire-and-forget
      if (typeof this.opts.onGoal === 'function') { try { this.opts.onGoal(this.doneCount - 1, this.startedAt == null ? 0 : Math.max(0, (now - this.startedAt) / 1000)); } catch (e) { /* a listener's bug never blocks the run */ } }
    }
    if (this.doneCount === this.goals.length && this.endStates().every(e => e.ok) && this.graderStates().every(g => g.ok)) {
      this.finished = true;
      this.finishedAt = this.opts.now ? this.opts.now() : Date.now();
      moved = true;
    }
    if (moved) this.emit('goals');
    return moved;
  }
  /** Goal list with status for the view. */
  goalStates() {
    return this.goals.map((g, i) => ({ ...g, done: i < this.doneCount, current: !this.finished && i === this.doneCount }));
  }
  /** End-state predicates with their current status: [{text, check, ok}]. */
  endStates() {
    return (this.lesson.endState || []).map(e => ({ ...e, ok: safeCheck(e, this.sheet, this.session) }));
  }
  /**
   * A challenge's convention graders over the current workbook: [{ ok, why }]. Correct numbers
   * with a broken convention is not a pass; the first failing `why` is the one line shown.
   */
  graderStates() {
    if (!Array.isArray(this.lesson.graders)) return [];
    return this.lesson.graders.map(fn => {
      try { const r = fn(this.session); return { ok: !!(r && r.ok), why: (r && r.why) || 'a convention check failed' }; }
      catch (e) { return { ok: false, why: 'a convention check failed' }; }
    });
  }
}

function safeCheck(g, sheet, session) { try { return !!g.check(sheet, session); } catch (e) { return false; } }

/**
 * A goal's hint, as a playable key script: glyphs become key names (↵ → Enter, Ctrl+↓ → Ctrl+Down),
 * '×N' repeats the previous press, and connective words ('then', 'and', 'twice') fall away. Quoted
 * runs stay text to type. The ghost replay and the reference-route replay both play through this.
 */
const HINT_GLYPHS = { '↵': 'Enter', '⌫': 'Backspace', '↑': 'Up', '↓': 'Down', '←': 'Left', '→': 'Right', Esc: 'Escape' };
export function hintToScript(keys) {
  const out = [];
  for (const t of String(keys || '').match(/"[^"]*"|'[^']*'|\S+/g) || []) {
    if (t.startsWith('"') || t.startsWith("'")) { out.push(t); continue; }   // '…' carries text with double quotes inside (Chapter 2's TEXT() formulas)
    const rep = /^×(\d+)$/.exec(t);
    if (rep) { const last = out[out.length - 1]; if (last) for (let i = 1; i < Math.min(+rep[1], 50); i++) out.push(last); continue; }
    const norm = t.split('+').map(p => HINT_GLYPHS[p] || p).join('+');
    if (/^[a-z]/.test(norm) && norm.length > 1) continue;   // 'then', 'and', 'twice' — prose, not keys
    if (norm === ',' || norm === '…') continue;
    out.push(norm);
  }
  return out.join(' ');
}

function structuredCloneCells(cells) { const out = {}; for (const k in cells) out[k] = { ...cells[k] }; return out; }

/** How many key presses a keystroke script is: every press counts one, a quoted run counts its characters. */
export function keyCount(script) {
  let n = 0;
  try { for (const step of parseKeyScript(script || '')) n += step.type === 'text' ? step.text.length : step.spec === 'Alt+=' ? 2 : 1; } catch (e) { return 0; }   // the session logs AutoSum as Alt then =
  return n;
}

const GLYPH_KEYS = new Set(['↑', '↓', '←', '→', '↵', '⌫']);
/**
 * The shortcuts pressed in a run, folded for the "Shortcuts used" tab: an Alt walk and the KeyTip
 * keys after it read as one entry ('Alt H B O'), ending with the key that resolves to a command
 * (or leaves the Ribbon), so a letter typed afterwards is not swallowed; arrows, chords, Enter,
 * Tab, F-keys and the like count on their own; typed characters and the refusal marker do not.
 * → [{ keys, count }] in first-use order
 */
export function shortcutsUsed(log) {
  const counts = new Map();
  const add = k => counts.set(k, (counts.get(k) || 0) + 1);
  let alt = null;   // { keys, path } while inside an Alt walk
  for (const e of log) {
    const k = e.k;
    if (k === 'Alt') { if (alt) add(alt.keys.join(' ')); alt = { keys: ['Alt'], path: [] }; continue; }
    if (alt) {
      if (/^[A-Z0-9=]$/.test(k)) {
        const r = stepPath(alt.path, k);
        alt.keys.push(k);
        if (r.kind === 'menu' || r.kind === 'tab') { alt.path = r.path; continue; }
        add(alt.keys.join(' ')); alt = null; continue;   // a command, or a step that leaves the Ribbon: the walk ends here
      }
      add(alt.keys.join(' ')); alt = null;
    }
    if (k === '⚠' || (k.length === 1 && !GLYPH_KEYS.has(k))) continue;
    add(k);
  }
  if (alt) add(alt.keys.join(' '));
  return [...counts].map(([keys, count]) => ({ keys, count }));
}
