// app2/app/runner.js — runs one lesson: builds the sheet and session, feeds keys, tracks goals.
// Headless (the replay test uses it); the lesson view paints from it.

import { Sheet } from '../engine/sheet.js';
import { Session, parseKeyScript, parseKeySpec } from '../engine/keyboard.js';

export class LessonRun {
  /**
   * @param {object} lesson   a lesson module's default export
   * @param {object} [opts]   mode ('guided' | 'solo' | 'timed'), onKey, onToast, onRefuse, now()
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
    this.sheet = new Sheet({ rows: spec.rows, cols: spec.cols, cells: spec.cells ? structuredCloneCells(spec.cells) : undefined, colW: spec.colW, active: spec.active, today: this.opts.today });
    this.session = new Session(this.sheet, { onKey: this.opts.onKey, onToast: this.opts.onToast, onRefuse: this.opts.onRefuse, now: this.opts.now });
    // The key window: a mechanic check reads only keys pressed since its goal became current
    // (keyLog.slice(goalMark)), so a key pressed for an earlier goal, or before the lesson began,
    // cannot satisfy a later one.
    this.session.goalMark = 0;
    this.doneCount = 0;
    this.finished = false;
    this.finishedAt = null;
    this.session.onChange(() => this.emit('session'));
    this.emit('reset');
  }

  get goals() { return this.lesson.goals; }
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
  get par() { const t = (this.lesson.steps || []).find(s => s.mode === 'timed'); return t ? t.par : null; }

  /** Feed one key event; returns true when the session consumed it. */
  key(ev) {
    if (this.finished) return false;
    const handled = this.session.key(ev);
    if (handled) this.evaluate();
    return handled;
  }
  /** Run a keystroke script through the lesson (the replay test uses this). */
  run(script) {
    for (const step of parseKeyScript(script)) {
      if (step.type === 'text') { for (const ch of step.text) this.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
      else this.pressSpec(step.spec);
    }
  }
  pressSpec(spec) { return this.key(parseKeySpec(spec)); }

  /** Advance goals whose checks now pass, in order; mark the lesson finished when all land. */
  evaluate() {
    let moved = false;
    while (this.doneCount < this.goals.length && safeCheck(this.goals[this.doneCount], this.sheet, this.session)) {
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
