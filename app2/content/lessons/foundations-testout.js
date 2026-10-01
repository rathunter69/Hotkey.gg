// Chapter 1 · the test-out (M26): the assessment, entered cold. Anyone who already knows the
// chapter opens the same San Antonio feed, builds the same page under the same ten-minute clock
// and the same graders, with nothing taught before it: no prerequisites, no concept gating.
// The mechanics are the assessment's (one seed, one goal list, one set of graders); only the
// words and the door differ.
import assessment, { GOALS, GRADERS, seed, SOLUTION_KEYS } from './foundations-assessment.js';
import { parsFrom } from '../../app/pars.js';
import { hintToScript } from '../../app/runner.js';

export default {
  ...assessment,
  id: 'foundations-testout',
  kind: 'testout',
  title: 'Test out of Chapter 1',
  tags: ['assessment', 'test-out', 'report'],
  minutes: 10,
  uses: [],
  prerequisites: [],
  brief: 'Already know all of this? Monday 7:10am. The CFO wants the page before the 9:00: the San Antonio cluster\'s Week of Sep 22 feed sits on Raw, the Report is blank, and the page is the one the chapter builds (links, totals, margins, daily block, checks, formats and print set-up), on the clock, no help, keyboard only. Pass, and the chapter is yours. The key is `Ctrl+PgDn`.',
  wow: 'You built page one of the pack from a blank sheet on the clock, and Chapter 1 is yours.',
  timeLimit: 600,
  pars: parsFrom(300, { pass: 600, pro: 440 }),
  seed,
  goals: GOALS.map(g => ({ ...g, requires: [] })),   // the door is open: nothing was taught before it, so nothing gates a goal
  graders: GRADERS,
  closing: [
    'Built from a feed you had never seen: every figure a live link or a formula, the checks at zero, the print set-up done.',
    'That is the chapter: moving without the mouse, marking what is typed, keeping the formulas live, and leaving a page the reader can trust. Chapter 2 starts from here.',
  ],
  solution: SOLUTION_KEYS.map(k => hintToScript(k)).join(' '),
};
