// app2/app/beats.js — the story beats (experience pass, decision 4): one short card at each
// module boundary, shown once, in the deal-team voice — what just came in, what the module
// delivers. Nothing mid-lesson; the task card and one coach line per goal carry the work. The
// chapter-end moment ("page delivered") reads from the same table.
//
//   beatFor(lesson, moduleAt)  → { id, eyebrow, title, body } for the first lesson of a module, else null
import { PLANNED_MODULES } from './learn-next.js';
import { moduleCopy, siteCopy, splitParas } from '../content/copy/apply.js';

/** The chapter-end line's shape; site.csv page_delivered overrides. {n} the module number, {module} its name, {page} modules.csv page_name. */
export const PAGE_DELIVERED = 'Page {n}, {page}, is done.';

const BEATS_DEFAULT = {
  'open-and-set-up': { eyebrow: 'Module 1.1 · open and set up', title: 'The file arrived the way inherited files do.',
    body: 'A tab still called Sheet2, a dead half-export, no page for the report, a price buried inside a formula. Set it up to house standard first: the tab names you choose now are the names every reference carries later.' },
  'move-and-select': { eyebrow: 'Module 1.2 · move and select', title: 'The associate has questions about the feed.',
    body: 'Last row, last column, the first blank cost, the notes below the data. Answer each one by landing on the cell that holds it, and select what you will format later. Jumps, never scrolls: the mouse is for reviewing, not building.' },
  'enter-edit-copy-fill': { eyebrow: 'Module 1.3 · enter, edit, copy and fill', title: 'A day is missing and the figures have typos.',
    body: 'Airport’s Saturday never came through; management emailed the four figures. Enter them, fix the feed in place, and build the Report skeleton from Raw with the clipboard and the fill keys.' },
  structure: { eyebrow: 'Module 1.4 · structure', title: 'Cedar Park opened this week.',
    body: 'A sixth site row, a margin column, a stale column to remove, and a total that has to follow every edit. Then the widths, heights, groups and frozen panes that make the page readable.' },
  format: { eyebrow: 'Module 1.5 · format', title: 'Numbers a banker can read.',
    body: 'Thousands separators, no stray decimals, negatives in parentheses; bold totals with a top border; inputs blue with a light tint; the title centered across the page. The standard, applied once and then repeated in a single pass.' },
  formulas: { eyebrow: 'Module 1.6 · formulas', title: 'Make the page live.',
    body: 'Every figure on the Report links to Raw and Inputs, so a corrected feed flows through without retyping. SUM and its family, anchoring with F4, links across sheets, and what each error means.' },
  'present-and-audit': { eyebrow: 'Module 1.7 · present and audit', title: 'Sign the page off.',
    body: 'The buyer’s analyst opens page one first. Check the totals tie, the conventions hold, the print fits one page, and nothing is hardcoded that should not be. Then it goes in the pack.' },
  // Chapter 2 · Formatting and presentation (Run 1: 2.1 and 2.2; the rest land with their modules)
  'number-formats': { eyebrow: 'Module 2.1 · number formats', title: 'The P&L came out of the accounting system.',
    body: 'The owners have hired advisers to run the sale, and the first document is the book: the information memorandum that describes the company to buyers. Its financials section starts with three years of P&L, and what the accounting system exported is account codes in capitals, costs as positives and numbers to four decimal places. Before anyone reads it, the figures have to read like figures.' },
  'custom-number-formats': { eyebrow: 'Module 2.2 · custom number formats', title: 'Every number on the page has to say what it is.',
    body: 'A buyer flips to the financials and reads margins, multiples and thousands without a legend, so the number format has to carry the unit. A format code can write k or m after a figure, show a zero as a dash, color a negative and turn a plain date into FY26E, with the value underneath untouched. This module is the format code, one section at a time.' },
  // Chapter 3 · Formulas
  'time-value-of-money': { eyebrow: 'Module 3.5 · time value of money', title: 'What is a new site worth?',
    body: 'Cedar Park cost $5m all in (the land, which Clearcoat owns there, and the build) and was funded with a $3.5m loan, and the buyers want two things: the loan’s schedule, and whether a site like it is worth building at all. A dollar next year is worth less than a dollar today, and the functions in this module say how much less: PMT for the loan, NPV and IRR for the site.' },
  auditing: { eyebrow: 'Module 3.6 · auditing', title: 'Somebody else’s Summary doesn’t tie.',
    body: 'Before you built yours, someone started a Summary sheet and left. It has a SUMIF pointing at a range a row short, a typed number in a formula column, a text "12", and a total that agrees with nothing. Chapter 1 taught the three looks; this module adds the tools a reviewer uses on a sheet they didn’t build, and the checks block that says, in one cell, whether the databook ties.' },
  'ch3-project-and-assessment': { eyebrow: 'Module 3.7 · project and assessment', title: 'The databook, tied out.',
    body: 'A fresh export, a fresh site list, a Summary someone else abandoned. Rebuild it so every number reads the export and the flag reads OK, then value the next site on the list. Build it, then build it again on the clock. The assessment is the test-out.' },
  'project-and-assessment': { eyebrow: 'Module 1.8 · project, assessment, test-out', title: 'Management’s next feed is in.',
    body: 'A fresh week, a blank Report, and everything the chapter taught. Build the page start to finish, then prove it against the clock on Monday morning; or test out of the chapter in five minutes.' },
};

/** modules.csv story_beat ("Title || body") overrides a module's built-in beat; a row with only a body keeps the built-in title. */
export const MODULE_BEATS = Object.fromEntries(Object.entries(BEATS_DEFAULT).map(([id, b]) => {
  const row = moduleCopy(id); const paras = row ? splitParas(row.story_beat) : [];
  if (!paras.length) return [id, b];
  return [id, { eyebrow: b.eyebrow, title: paras.length > 1 ? paras[0] : b.title, body: paras.length > 1 ? paras.slice(1).join(' ') : paras[0] }];
}));

/** The beat for a lesson, when it opens a module the learner has not seen the beat for. Pure over `seen`. */
export function beatFor(lesson, at, seen = []) {
  if (!lesson || !at || at.n !== 1 || lesson.kind === 'challenge') return null;
  const id = lesson.module;
  if (id === 'welcome') return null;   // retired (B2): the Welcome's moves open 1.1.1
  if (!id || seen.includes(id)) return null;
  const b = MODULE_BEATS[id];
  if (b) return { id, ...b };
  const planned = PLANNED_MODULES.find(p => p.title === at.module.title);
  return { id, eyebrow: `Module ${(planned && planned.n) || '1.' + at.k} · ${at.module.title.toLowerCase()}`, title: at.module.title + '.', body: (planned && planned.objective) || '' };
}

/** The chapter-end line when a module's challenge passes: what page went into the pack. */
export function pageDelivered(at) {
  if (!at) return '';
  const planned = PLANNED_MODULES.find(p => p.title === at.module.title);
  const row = moduleCopy(at.module.id);
  const page = (row && row.page_name && row.page_name.trim()) || at.module.title;
  return siteCopy('page_delivered', PAGE_DELIVERED).replace(/\{n\}/g, (planned && planned.n) || '1.' + at.k).replace(/\{module\}/g, at.module.title).replace(/\{page\}/g, page);
}
