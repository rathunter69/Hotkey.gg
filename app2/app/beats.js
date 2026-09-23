// app2/app/beats.js — the story beats (experience pass, decision 4): one short card at each
// module boundary, shown once, in the deal-team voice — what just came in, what the module
// delivers. Nothing mid-lesson; the task card and one coach line per goal carry the work. The
// chapter-end moment ("page delivered") reads from the same table.
//
//   beatFor(lesson, moduleAt)  → { id, eyebrow, title, body } for the first lesson of a module, else null
import { PLANNED_MODULES } from './learn-next.js';

export const MODULE_BEATS = {
  welcome: { eyebrow: 'Module 1.0 · the Welcome', title: 'Sixty seconds on the feed.',
    body: 'Management sent the Austin cluster’s site feed: sixty rows, six columns. Before anything gets built, get to the bottom of it the slow way and the fast way, both on your own clock. The difference is the whole idea.' },
  'open-and-set-up': { eyebrow: 'Module 1.1 · open and set up', title: 'The file arrived the way inherited files do.',
    body: 'A tab still called Sheet2, a dead half-export, no page for the report, a price buried inside a formula. Set it up to house standard first: the tab names you choose now are the names every reference carries later.' },
  'move-and-select': { eyebrow: 'Module 1.2 · move and select', title: 'The associate has questions about the feed.',
    body: 'Last row, last column, the first blank cost, the notes below the data. Answer each one by landing on the cell that holds it, and select what you will format later. Jumps, never scrolls: the mouse is for reviewing, not building.' },
  'enter-edit-copy-fill': { eyebrow: 'Module 1.3 · enter, edit, copy and fill', title: 'A day is missing and the figures have typos.',
    body: 'Airport’s Saturday never came through; management emailed the four figures. Enter them, fix the feed in place, and build the Report skeleton from Raw with the clipboard and the fill keys.' },
  structure: { eyebrow: 'Module 1.4 · structure', title: 'Cedar Park opened this week.',
    body: 'A sixth site row, a margin column, a stale column to remove, and a total that has to follow every edit. Then the widths, heights, groups and frozen panes that make the page readable.' },
  format: { eyebrow: 'Module 1.5 · format', title: 'Numbers a banker can read.',
    body: 'Thousands separators, no stray decimals, negatives in parentheses; bold totals with a top border; inputs blue with a light tint; the title centered across the page. House style, applied once and then repeated in a single pass.' },
  formulas: { eyebrow: 'Module 1.6 · formulas', title: 'Make the page live.',
    body: 'Every figure on the Report links to Raw and Inputs, so a corrected feed flows through without retyping. SUM and its family, anchoring with F4, links across sheets, and what each error means.' },
  'present-and-audit': { eyebrow: 'Module 1.7 · present and audit', title: 'Sign the page off.',
    body: 'The buyer’s analyst opens page one first. Check the totals tie, the conventions hold, the print fits one page, and nothing is hardcoded that should not be. Then it goes in the pack.' },
};

/** The beat for a lesson, when it opens a module the learner has not seen the beat for. Pure over `seen`. */
export function beatFor(lesson, at, seen = []) {
  if (!lesson || !at || at.n !== 1 || lesson.kind === 'challenge') return null;
  const id = lesson.module;
  if (!id || seen.includes(id)) return null;
  const b = MODULE_BEATS[id];
  if (b) return { id, ...b };
  const planned = PLANNED_MODULES.find(p => p.title === at.module.title);
  return { id, eyebrow: `Module 1.${at.k - 1} · ${at.module.title.toLowerCase()}`, title: at.module.title + '.', body: (planned && planned.objective) || '' };
}

/** The chapter-end line when a module's challenge passes: what page went into the pack. */
export function pageDelivered(at) {
  if (!at) return '';
  return `Page 1.${at.k - 1} — ${at.module.title} — delivered to the pack.`;
}
