// app2/content/copy/apply.js — the copy layer meets the lessons. A lesson module carries the
// mechanics (states, keys, checks, seeds, graders, pars); its learner-facing words come from
// content/copy/*.csv, inlined into content/copy/index.js by tests/copy-build.js. applyCopy()
// overlays a lesson's row and its goals' rows; a missing row leaves whatever the JS file still
// carries (the fallback, and copy-check warns). Nothing here is fetched at runtime.
//
//   applyCopy(lesson, COPY)   → a clone with title/brief/closing/wow/... overlaid (the source untouched), or the source itself when no row exists
//   siteCopy(key, fallback)   → a site.csv line or the fallback
//   moduleCopy(id)            → a modules.csv row or null
import { COPY } from './index.js';

const nz = v => typeof v === 'string' && v.trim() !== '';

/** `a || b` in a CSV cell → ['a', 'b'] (the closing paragraphs). */
export const splitParas = s => String(s == null ? '' : s).split(/\s*\|\|\s*/).map(x => x.trim()).filter(Boolean);
export const joinParas = list => (Array.isArray(list) ? list : []).map(x => String(x).trim()).filter(Boolean).join(' || ');

export function applyCopy(source, copy = COPY) {
  if (!source || !copy) return source;
  const row = copy.lessons && copy.lessons[source.id];
  const goalRows = copy.goals && copy.goals[source.id];
  if (!row && !(Array.isArray(goalRows) && goalRows.length)) return source;
  // a shallow clone (goals too): checks, states and graders are shared, the words are the copy's
  const lesson = { ...source, goals: Array.isArray(source.goals) ? source.goals.map(g => ({ ...g })) : source.goals };
  if (row) {
    if (nz(row.title)) lesson.title = row.title;
    if (nz(row.brief)) lesson.brief = row.brief;
    if (nz(row.closing)) lesson.closing = splitParas(row.closing);
    if (nz(row.wow)) lesson.wow = row.wow;
    if (nz(row.convention_line)) lesson.conventionLine = row.convention_line;
    if (nz(row.mac_note)) lesson.macNote = row.mac_note;
    if (nz(row.story_beat)) lesson.storyBeat = row.story_beat;
  }
  if (Array.isArray(goalRows) && Array.isArray(lesson.goals)) {
    for (const g of goalRows) {
      const i = Number(g.goal_index);
      const goal = lesson.goals[i]; if (!goal) continue;
      if (nz(g.text)) goal.text = g.text;
      if (nz(g.teach)) goal.teach = g.teach;
      if (nz(g.why)) goal.why = g.why;
      if (nz(g.hint_stuck)) goal.hintStuck = g.hint_stuck;
    }
  }
  return lesson;
}

export function siteCopy(key, fallback = '') {
  const v = COPY && COPY.site ? COPY.site[key] : undefined;
  return nz(v) ? v : fallback;
}

export function moduleCopy(id) { return (COPY && COPY.modules && COPY.modules[id]) || null; }
/** micro.csv's row for a micro-drill (by its concept id), or null. */
export function microCopy(id) { return (COPY && COPY.micro && COPY.micro[id]) || null; }
/** A micro-drill lesson with micro.csv's words laid over it: the prompt is its brief, the teach line rides its first goal. */
export function applyMicroCopy(lesson, id) {
  const row = microCopy(id); if (!lesson || !row) return lesson;
  const out = { ...lesson, goals: Array.isArray(lesson.goals) ? lesson.goals.map(g => ({ ...g })) : lesson.goals };
  if (nz(row.prompt)) out.brief = row.prompt;
  if (nz(row.teach) && Array.isArray(out.goals) && out.goals[0]) out.goals[0].teach = row.teach;
  return out;
}

/**
 * A drill with drills.csv and drill_goals.csv laid over it (R8, M1). Drill modules are singletons
 * with getters (a fresh plant, a solution built on read), so the words are written onto the drill
 * in place rather than onto a clone; the checks, keys and states are untouched. A missing row or an
 * empty cell keeps the drill file's line, which is the fallback (the drill-copy test fails on it).
 */
export function applyDrillCopy(drill, copy = COPY) {
  if (!drill || !copy) return drill;
  const row = copy.drills && copy.drills[drill.id];
  const rows = (copy.drillGoals && copy.drillGoals[drill.id]) || [];
  if (row) {
    if (nz(row.title)) drill.title = row.title;
    if (nz(row.task)) drill.task = row.task;
  }
  for (const r of rows) {
    const i = Number(r.index);
    if (!nz(r.text)) continue;
    if (r.kind === 'goal' && Array.isArray(drill.goals) && drill.goals[i]) drill.goals[i].text = r.text;
    else if (r.kind === 'end' && Array.isArray(drill.endState) && drill.endState[i]) drill.endState[i].text = r.text;
    else if (r.kind === 'why' && drill.whatIf && typeof drill.whatIf === 'object') drill.whatIf.why = r.text;
  }
  return drill;
}

/** Every line a learner reads on a drill, as { kind, index, text } (the drill-copy test and the export walk it). */
export function drillLines(drill) {
  const out = [];
  (drill.goals || []).forEach((g, i) => out.push({ kind: 'goal', index: i, text: g.text }));
  (drill.endState || []).forEach((g, i) => out.push({ kind: 'end', index: i, text: g.text }));
  if (drill.whatIf && typeof drill.whatIf.why === 'string') out.push({ kind: 'why', index: 0, text: drill.whatIf.why });
  return out;
}
