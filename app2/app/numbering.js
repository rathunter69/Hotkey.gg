// app2/app/numbering.js — Chapter 1's numbers, one source for the strip, the overlay, Home and
// the data room (experience pass C, item 1): modules 1.1–1.7, then 1.8 for the project,
// assessment and test-out; the retired Welcome has no number. A module the table does not know
// yet falls back to its place in the catalogue.
//
//   moduleNumber('structure')                 → '1.4'
//   itemNumber(lesson, moduleOf(lesson))      → '1.4.2' | '1.4.C' | '1.8.P' | ''

export const MODULE_NUMBERS = {
  'open-and-set-up': '1.1', 'move-and-select': '1.2', 'enter-edit-copy-fill': '1.3', structure: '1.4',
  format: '1.5', formulas: '1.6', 'present-and-audit': '1.7', 'project-and-assessment': '1.8',
};
/** The catalogue section the chapter's project, assessment and test-out sit in (module 1.8). */
export const FINAL_SECTION = 'Project and assessment';
export const FINAL_MODULE = { id: 'project-and-assessment', n: '1.8', title: 'Project, assessment, test-out' };
const FINAL_KIND = { project: 'P', assessment: 'A', testout: 'T' };

/** A module's number from its id; `k` (1-based place among the chapter's modules) when the id is new. */
export function moduleNumber(id, k) {
  if (MODULE_NUMBERS[id]) return MODULE_NUMBERS[id];
  return Number.isFinite(k) && k > 0 ? '1.' + k : '';
}

/** Whether a lesson is one of the chapter's closing items (module 1.8). */
export const isFinalItem = lesson => !!lesson && (lesson.module === FINAL_MODULE.id || (lesson.section === FINAL_SECTION && !!FINAL_KIND[lesson.kind]));

/** A lesson's number as the curriculum map writes it: 1.4.2, 1.4.C, 1.8.P. '' for anything else. */
export function itemNumber(lesson, at) {
  if (!lesson) return '';
  if (isFinalItem(lesson)) return FINAL_MODULE.n + '.' + (FINAL_KIND[lesson.kind] || (at ? at.n : ''));
  if (!at || !at.module) return '';
  const m = moduleNumber(at.module.id, at.k);
  return m ? m + '.' + (lesson.kind === 'challenge' ? 'C' : at.n) : '';
}
