// app2/content/remix.js — cross-chapter remixes (LESSON_FRAMEWORK §8): a Chapter 1 challenge
// template re-clothed in later material, so old skills stay warm on new sheets and the authoring
// cost is a clothing file, not a new challenge. The base challenge keeps its goals, checks,
// graders and solution: they are written against a sheet by name and a fixed frame (A1:G10, a
// header row, a total row). The clothing supplies the workbook, the state, a seed that lays that
// frame on its own page, and the words. The base's closures look their sheet up by name
// (`Report`), so the remix hands them a view of the session in which the clothing's page wears
// that name; nothing else about the session changes.
//
//   remix(base, { sheet: 'P&L', as: 'Report', lesson: { id, chapter, … }, seed(rng) → patch, solution? })

export function remix(base, clothing) {
  if (!base || base.kind !== 'challenge') throw new Error('remix: the base must be a challenge');
  if (!clothing || !clothing.lesson || typeof clothing.seed !== 'function') throw new Error('remix: clothing needs lesson and seed');
  const rename = clothing.sheet && clothing.as && clothing.sheet !== clothing.as;
  /** The session as the base sees it: the clothing's sheet under the base's name. */
  const view = ses => {
    if (!rename || !ses || !Array.isArray(ses.sheets)) return ses;
    return new Proxy(ses, {
      get(t, k) {
        if (k !== 'sheets') return Reflect.get(t, k, t);   // the session's own getters keep their `this`
        return t.sheets.map(e => (e.name === clothing.sheet ? Object.assign(Object.create(e), { name: clothing.as }) : e));
      },
    });
  };
  const goals = (base.goals || []).map(g => ({ ...g, check: (s, ses) => g.check(s, view(ses)) }));
  const graders = (base.graders || []).map(f => ses => f(view(ses)));
  return { ...base, ...clothing.lesson, kind: 'challenge', remixOf: base.id, goals, graders, seed: clothing.seed, solution: clothing.solution || base.solution };
}
