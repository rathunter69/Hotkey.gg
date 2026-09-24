// app2/content/copy/index.js — the copy layer (C2 Run 3): Wolf writes Chapter 1's learner-facing
// text in copy/chapter1.csv; copy-sync (app2/tests/copy-sync.js --write) turns it into
// copy/chapter1.js, which ships. A row marked draft is the platform's inline text waiting for him
// (copy-check lists them); a row he has written replaces the inline string at catalogue build.
//
//   id                     field                         what it replaces
//   <lesson id>            title | brief                 lesson.title / lesson.brief
//   <lesson id>            goal.<goal id>.text | .teach  that goal's text / teach line
//   <lesson id>            closing.<n> | endState.<n>    the nth closing line / endState label (1-based)
//   beat/<module id>       eyebrow | title | body        the module's story beat (app/beats.js)
//   micro/<concept id>     title | task | goal.<id>.text the micro-drill (app/schedule.js, content/micro.js)
import { COPY } from './chapter1.js';

const byId = new Map();
for (const [id, field, text, draft] of COPY) { if (!byId.has(id)) byId.set(id, new Map()); byId.get(id).set(field, { text, draft: !!draft }); }

/** The written (non-draft) text for an id/field, or the fallback. */
export function copyFor(id, field, fallback) {
  const m = byId.get(id); const row = m && m.get(field);
  return row && !row.draft && typeof row.text === 'string' && row.text !== '' ? row.text : fallback;
}
/** Every row for an id: [{ field, text, draft }]. */
export function copyRows(id) { const m = byId.get(id); return m ? [...m].map(([field, r]) => ({ field, ...r })) : []; }
/** Every row, flat: [{ id, field, text, draft }] (copy-check reads this). */
export function allCopyRows() { return COPY.map(([id, field, text, draft]) => ({ id, field, text, draft: !!draft })); }

/** A lesson with its written copy laid over the inline strings (a shallow clone; checks and states untouched). */
export function applyCopy(lesson) {
  if (!lesson || !byId.has(lesson.id)) return lesson;
  const id = lesson.id, out = { ...lesson };
  out.title = copyFor(id, 'title', lesson.title);
  out.brief = copyFor(id, 'brief', lesson.brief);
  if (Array.isArray(lesson.goals)) out.goals = lesson.goals.map(g => {
    const t = copyFor(id, `goal.${g.id}.text`, g.text), teach = g.teach == null ? undefined : copyFor(id, `goal.${g.id}.teach`, g.teach);
    return t === g.text && teach === g.teach ? g : { ...g, text: t, ...(teach === undefined ? {} : { teach }) };
  });
  if (Array.isArray(lesson.closing)) out.closing = lesson.closing.map((c, i) => copyFor(id, `closing.${i + 1}`, c));
  if (Array.isArray(lesson.endState)) out.endState = lesson.endState.map((e, i) => { const t = copyFor(id, `endState.${i + 1}`, e.text); return t === e.text ? e : { ...e, text: t }; });
  return out;
}
