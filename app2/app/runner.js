// app2/app/runner.js — runs one lesson: builds the sheet and session, feeds keys, tracks goals.
// Headless (the replay test uses it); the lesson view paints from it.

import { Sheet } from '../engine/sheet.js';
import { Session, parseKeyScript, parseKeySpec } from '../engine/keyboard.js';
import { stepPath } from '../engine/ribbon.js';

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
    const spec = this.lesson.sheet || {};
    const build = sp => new Sheet({ rows: sp.rows, cols: sp.cols, cells: sp.cells ? structuredCloneCells(sp.cells) : undefined, colW: sp.colW, active: sp.active, today: this.opts.today });
    const first = build(spec);
    this.session = new Session(first, { onKey: this.opts.onKey, onToast: this.opts.onToast, onRefuse: this.opts.onRefuse, now: this.opts.now, onMouse: this.opts.onMouse });
    // A workbook: lesson.sheets names the sheets ([0] is the starting sheet) and adds the others.
    const sheets = Array.isArray(this.lesson.sheets) ? this.lesson.sheets : [];
    if (sheets.length && this.session.sheets) {
      if (sheets[0] && sheets[0].name) this.session.sheets[0].name = sheets[0].name;
      for (const sh of sheets.slice(1)) if (this.session.addSheet) this.session.addSheet(sh.name, build(sh));
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
    return this.endStates().find(e => !e.ok) || null;
  }
  /** The lesson clock is the engine clock: it starts on the first key that does something. */
  get startedAt() { return this.session.t0; }
  get elapsed() {
    const now = this.opts.now ? this.opts.now() : Date.now();
    if (this.startedAt == null) return 0;
    return ((this.finishedAt == null ? now : this.finishedAt) - this.startedAt) / 1000;
  }
  get par() { return typeof this.lesson.par === 'number' ? this.lesson.par : null; }

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
  /** Feed one demo step (the view plays them on a cadence). */
  demoStep(step) {
    if (step.type === 'text') { for (const ch of step.text) this.session.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
    else this.session.key(parseKeySpec(step.spec));
  }
  /** The demo has finished: the goal can land. */
  finishDemo(goal) { this.session.demoDone.add(goal.id); this.evaluate(); this.emit('demo'); }
  /** Play the current goal's demo at once (headless replay, or the learner skipping ahead). */
  playPendingDemo() {
    let g;
    while ((g = this.pendingDemo())) { for (const step of this.demoSteps(g)) this.demoStep(step); this.finishDemo(g); }
  }
  pressSpec(spec) { return this.key(parseKeySpec(spec)); }

  /** Advance goals whose checks now pass, in order; mark the lesson finished when all land. */
  evaluate() {
    let moved = false;
    while (this.doneCount < this.goals.length && safeCheck(this.goals[this.doneCount], this.sheet, this.session)) {
      this.landedAt[this.doneCount] = this.opts.now ? this.opts.now() : Date.now();
      this.doneCount++; moved = true;
      this.session.goalMark = this.session.keyLog.length;   // the next goal's key window starts here
    }
    if (this.doneCount === this.goals.length && this.endStates().every(e => e.ok)) {
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
}

function safeCheck(g, sheet, session) { try { return !!g.check(sheet, session); } catch (e) { return false; } }

function structuredCloneCells(cells) { const out = {}; for (const k in cells) out[k] = { ...cells[k] }; return out; }

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
