// app2/app/drill-run.js — one timed drill run (SITE_SPEC §5): a LessonRun locked to timed mode,
// with the help/clean bookkeeping and the attempt record the drill page saves. Help of any kind
// (hints shown, guided reveal, the solution replay) marks the run `helped`; helped or moused runs
// still finish and grade a tier of 'none' for records — the pars only ever crown clean runs.

import { LessonRun } from './runner.js';
import { tierFor } from './pars.js';
import { attemptId, dayOf, traceOf } from './records.js';

export class DrillRun extends LessonRun {
  /**
   * @param {object} drill   a drill module's default export (content/drills/)
   * @param {object} [opts]  LessonRun opts; plus `seedCells` (a Daily's cell patch) and `seed` (its number)
   */
  constructor(drill, opts = {}) {
    const spec = opts.seedCells
      ? { ...drill, sheet: { ...drill.sheet, cells: { ...(drill.sheet.cells || {}), ...opts.seedCells } } }
      : drill;
    super(spec, { ...opts, mode: 'timed' });
    this.drill = drill;
    this.seed = Number.isFinite(opts.seed) ? opts.seed : null;
    this.kind = opts.kind || 'drill';   // 'drill' | 'daily'
    this.helped = false;
  }
  reset(mode) { super.reset('timed'); if (this.drill) this.helped = false; }
  /** Any help — hints, guided reveal, solution replay — marks the run; there is no un-marking. */
  markHelped() { this.helped = true; }
  get clean() { return !this.helped && this.mouseCount === 0; }
  get pars() { return this.drill.pars; }
  /** The tier this run's time earns — clean runs only; helped or moused runs grade 'none'. */
  get tier() { return this.finished && this.clean ? tierFor(this.elapsed, this.drill.pars) : 'none'; }
  /** The attempt record for records.addAttempt (call once, on finish). */
  toAttempt() {
    return {
      id: attemptId(), kind: this.kind, ref: this.drill.id, day: dayOf(), seed: this.seed,
      secs: this.elapsed, keys: this.session.keyLog.length,
      clean: this.clean, helped: this.helped, mouse: this.mouseCount, tier: this.tier,
      splits: this.splits().filter(Number.isFinite), trace: traceOf(this.session.keyLog), at: Date.now(),
    };
  }
}
