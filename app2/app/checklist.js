// app2/app/checklist.js — the checklist as one state machine (screenplay 3.0 "Get these right
// now", 3; "The timed run"; M98). One to sixty goals, each pending, current or done, with an
// assisted flag per goal. The run panel and the lesson's goal list both render its view: done
// tasks fold into one "{n} done" line, the current task is highlighted, the next few are listed
// under it and "{n} more after these" closes the list. Pure: every transition returns a new state.
//
//   createChecklist(goals)         → state (the first goal is current)
//   land(state)                    → the current goal done, the next current
//   landTo(state, n)               → the first n goals done (the engine's doneCount after a jump)
//   assist(state, i = current)     → goal i flagged assisted
//   reset(state)                   → everything pending again, the first current
//   view(state, { next = 3 })      → { done, current, next: [...], moreAfter, total, allDone }
//   STATUSES, MIN_GOALS, MAX_GOALS

export const STATUSES = ['pending', 'current', 'done'];
export const MIN_GOALS = 1;
export const MAX_GOALS = 60;

export function createChecklist(goals) {
  const list = Array.isArray(goals) ? goals : [];
  if (list.length < MIN_GOALS || list.length > MAX_GOALS) throw new RangeError(`a checklist holds ${MIN_GOALS} to ${MAX_GOALS} goals, not ${list.length}`);
  return {
    items: list.map((g, i) => ({ index: i, id: typeof g === 'string' ? g : (g && g.id) || String(i), text: typeof g === 'string' ? g : (g && g.text) || '', status: i === 0 ? 'current' : 'pending', assisted: false })),
    current: 0,
  };
}

const withStatuses = (state, current) => ({
  items: state.items.map((it, i) => ({ ...it, status: i < current ? 'done' : i === current ? 'current' : 'pending' })),
  current: Math.min(current, state.items.length),
});

/** The current goal lands: it is done and the next goal is current (or every goal is done). */
export function land(state) { return state.current >= state.items.length ? state : withStatuses(state, state.current + 1); }
/** The first n goals are done (the engine grades in order; a key can land several at once). Never moves backward. */
export function landTo(state, n) { const to = Math.max(state.current, Math.min(state.items.length, n | 0)); return to === state.current ? state : withStatuses(state, to); }
/** Help touched goal i (the current one by default): the flag never clears. */
export function assist(state, i = state.current) {
  if (!(i >= 0 && i < state.items.length)) return state;
  return { ...state, items: state.items.map((it, k) => (k === i ? { ...it, assisted: true } : it)) };
}
export function reset(state) { return { items: state.items.map((it, i) => ({ ...it, status: i === 0 ? 'current' : 'pending', assisted: false })), current: 0 }; }

/**
 * What the panel shows: the folded count of done tasks, the current task, the next `next` tasks,
 * and how many more follow those. `allDone` once every goal has landed (then `current` is null and
 * `done` is the total).
 */
export function view(state, { next = 3 } = {}) {
  const total = state.items.length;
  const done = state.current;
  const allDone = done >= total;
  const current = allDone ? null : state.items[done];
  const upcoming = allDone ? [] : state.items.slice(done + 1, done + 1 + Math.max(0, next | 0));
  const moreAfter = allDone ? 0 : Math.max(0, total - (done + 1) - upcoming.length);
  return { done, current, next: upcoming, moreAfter, total, allDone, assisted: state.items.filter(it => it.assisted).length };
}
