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
  // Chapter 2 · Formatting and presentation (the script's module ids, run R2)
  'number-formats': '2.1', 'custom-number-formats': '2.2', 'the-page-a-buyer-reads': '2.3', 'alignment-and-structure': '2.4',
  'conditional-formatting': '2.5', 'dates-and-text-for-presentation': '2.6', 'printing-and-page-layout': '2.7', 'ch2-project-and-assessment': '2.8', remixes: '2.R',
  // Chapter 3 · Formulas and functions (script-ch3.md)
  logic: '3.1', dates: '3.2',
  'math-and-aggregation': '3.3', text: '3.4',
  'time-value-of-money': '3.5', auditing: '3.6', 'ch3-project-and-assessment': '3.7',
  // Chapter 4 · Data and lookups (script-ch4.md)
  lookups: '4.1',
  'lists-and-tables': '4.2', 'summaries-from-raw-rows': '4.3',
  'pivot-tables': '4.4', 'scenarios-and-sensitivity': '4.5',
  // Chapter 4 · Data and Lookups (script-ch4.md)
  'names-and-structure': '4.6', 'ch4-project-and-assessment': '4.7',
  // Chapter 5 · Finance and Accounting (script-ch5.md)
  'the-three-statements': '5.1', 'model-setup': '5.2',
  'schedules': '5.3', 'linking-the-statements': '5.4',
  'auditing-a-model': '5.5', dcf: '5.6',
  'model-speed': '5.7', 'ch5-project-and-assessment': '5.8',
  // Chapter 6 · Valuation (script-ch6.md)
  'bids-and-waterfall': '6.4', 'ch6-project-and-assessment': '6.5',
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
  if (isFinalItem(lesson)) return (MODULE_NUMBERS[lesson.module] || FINAL_MODULE.n) + '.' + (FINAL_KIND[lesson.kind] || (at ? at.n : ''));   // 1.8.P, 2.8.A
  if (!at || !at.module) return '';
  const m = moduleNumber(at.module.id, at.k);
  return m ? m + '.' + (lesson.kind === 'challenge' ? 'C' : at.n) : '';
}
