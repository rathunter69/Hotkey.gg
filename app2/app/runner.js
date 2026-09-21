// app2/app/runner.js — runs one lesson: builds the sheet and session, feeds keys, tracks goals.
// Headless (the replay test uses it); the lesson view paints from it.

import { Sheet } from '../engine/sheet.js';
import { Session, parseKeyScript } from '../engine/keyboard.js';

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
    this.doneCount = 0;
    this.finished = false;
    this.finishedAt = null;
    this.startedAt = null;
    this.session.onChange(() => this.emit('session'));
    this.emit('reset');
  }

  get goals() { return this.lesson.goals; }
  get current() { return this.finished ? null : this.goals[this.doneCount]; }
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
    if (handled) {
      if (this.startedAt == null) this.startedAt = this.opts.now ? this.opts.now() : Date.now();
      this.evaluate();
    }
    return handled;
  }
  /** Run a keystroke script through the lesson (the replay test uses this). */
  run(script) {
    for (const step of parseKeyScript(script)) {
      if (step.type === 'text') { for (const ch of step.text) this.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
      else this.session.press && this.pressSpec(step.spec);
    }
  }
  pressSpec(spec) { const ev = parseKeyScriptSpec(spec); return this.key(ev); }

  /** Advance goals whose checks now pass, in order; mark the lesson finished when all land. */
  evaluate() {
    let moved = false;
    while (this.doneCount < this.goals.length && safeCheck(this.goals[this.doneCount], this.sheet, this.session)) { this.doneCount++; moved = true; }
    if (this.doneCount === this.goals.length && (this.lesson.endState || []).every(e => safeCheck(e, this.sheet, this.session))) {
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
}

function safeCheck(g, sheet, session) { try { return !!g.check(sheet, session); } catch (e) { return false; } }

function structuredCloneCells(cells) { const out = {}; for (const k in cells) out[k] = { ...cells[k] }; return out; }

import { parseKeySpec } from '../engine/keyboard.js';
function parseKeyScriptSpec(spec) { return parseKeySpec(spec); }
