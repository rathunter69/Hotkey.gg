// app2/content/quests.js — the quest pool, as data (screenplay 6.6; M54). Three daily quests and
// three weekly ones are drawn from these rows (app/quests.js holds the drawing rules and the
// progress); a row says what counts, how many, what it pays and when it may be drawn. The words
// are site.csv rows (quest_<id>), one imperative line each in the clipped register; the fallback
// here is only used when the sheet is missing a row.
//
//   { id, period: 'daily' | 'weekly',
//     metric: 'count'    events matching `where`, counted
//           | 'distinct' distinct refs among the events matching `where`
//           | 'best'     the largest `field` on one event matching `where` (30 hits in one round)
//           | 'keys'     presses of the shortcuts in `keys`, summed over the period's runs
//           | 'chapter'  the drills of one chapter tried at least once, the best chapter's count
//     where: { kind: [...], clean, tier: 'pass'|'pro'|'legendary', pb, ghost, noWaste, noMouse, before: hour, ref: '{ref}' },
//     target, xp,
//     needs: 'lessons-left' | 'challenge-again' | { taught: <reference id> } | { lesson: <lesson id> },
//     pro: true  (needs Pro content: never drawn for a free learner),
//     fun: true  (the hotkey-count quests: drawn only from keys a lesson has taught) }
//
// Hotkey counts read the shortcuts-used counter the workspace keeps (runner.shortcutsUsed), folded
// per run into the practice log. Rapid-fire rounds count from their attempt records.

/** XP a quest pays, and the bonus for all three (6.10; Claude's working figures, recalibrated after launch). */
export const QUEST_XP = { daily: 25, weekly: 75, dailyBonus: 50, weeklyBonus: 150 };
/** How many of each are drawn. */
export const QUESTS_PER_PERIOD = 3;
/** A module's challenge is offered again when it has not been passed clean in this many days. */
export const AGAIN_AFTER_DAYS = 14;

const D = QUEST_XP.daily, W = QUEST_XP.weekly;

export const QUESTS = [
  // ---- the daily pool (6.6) ----
  { id: 'd-lesson', period: 'daily', metric: 'count', where: { kind: ['lesson'] }, target: 1, xp: D, needs: 'lessons-left', fallback: 'Complete a lesson.' },
  { id: 'd-drills-2', period: 'daily', metric: 'count', where: { kind: ['drill'] }, target: 2, xp: D, fallback: 'Finish two drills.' },
  { id: 'd-daily', period: 'daily', metric: 'count', where: { kind: ['daily'] }, target: 1, xp: D, fallback: 'Play the Daily.' },
  { id: 'd-pass', period: 'daily', metric: 'count', where: { kind: ['drill', 'daily'], clean: true, tier: 'pass' }, target: 1, xp: D, fallback: 'Pass any drill.' },
  { id: 'd-expert', period: 'daily', metric: 'count', where: { kind: ['drill', 'daily'], clean: true, tier: 'pro' }, target: 1, xp: D, fallback: 'Expert on any drill.' },
  { id: 'd-rapid-30', period: 'daily', metric: 'best', field: 'hits', where: { kind: ['rapid'] }, target: 30, xp: D, fallback: 'Land 30 hits in one rapid-fire round.' },
  { id: 'd-clean-lesson', period: 'daily', metric: 'count', where: { kind: ['lesson'], clean: true }, target: 1, xp: D, needs: 'lessons-left', fallback: 'Finish a lesson clean, with no mouse and no help.' },
  { id: 'd-again', period: 'daily', metric: 'count', where: { kind: ['challenge'], ref: '{ref}' }, target: 1, xp: D, needs: 'challenge-again', fallback: 'Run the {module} challenge again.' },
  { id: 'd-pb', period: 'daily', metric: 'count', where: { kind: ['drill', 'daily'], pb: true }, target: 1, xp: D, fallback: 'Set a new personal best on any drill.' },
  { id: 'd-rapid-3', period: 'daily', metric: 'count', where: { kind: ['rapid'] }, target: 3, xp: D, fallback: 'Play three rapid-fire rounds.' },
  // ---- the daily pool, the fun ones: hotkey counts, drawn only from keys a lesson has taught ----
  { id: 'k-ctrl-shift-down', period: 'daily', fun: true, metric: 'keys', keys: ['Ctrl+Shift+↓'], target: 10, xp: D, needs: { taught: 'ctrl-shift-arrow' }, fallback: 'Press Ctrl+Shift+↓ ten times.' },
  { id: 'k-paste-special', period: 'daily', fun: true, metric: 'keys', keys: ['Ctrl+Alt+V'], target: 5, xp: D, needs: { lesson: 'paste-special-values' }, fallback: 'Open Paste Special five times.' },
  { id: 'k-f4', period: 'daily', fun: true, metric: 'keys', keys: ['F4'], target: 15, xp: D, needs: { taught: 'f4-repeat' }, fallback: 'Press F4 fifteen times.' },
  { id: 'k-fill', period: 'daily', fun: true, metric: 'keys', keys: ['Ctrl+D', 'Ctrl+R'], target: 10, xp: D, needs: { lesson: 'copy-cut-paste-fill' }, fallback: 'Fill down or fill right ten times.' },
  { id: 'k-autosum', period: 'daily', fun: true, metric: 'keys', keys: ['Alt =', 'Alt+='], target: 3, xp: D, needs: { lesson: 'sum-family-and-autosum' }, fallback: 'AutoSum with Alt+= three times.' },
  { id: 'k-alt-chord', period: 'daily', fun: true, metric: 'keys', keys: ['Alt *'], target: 5, xp: D, needs: { taught: 'alt-keytips' }, fallback: 'Run five commands by Alt chord.' },
  { id: 'k-trace', period: 'daily', fun: true, metric: 'keys', keys: ['Ctrl+['], target: 5, xp: D, needs: { lesson: 'trace-arrows-evaluate' }, fallback: 'Follow the trail with Ctrl+[ five times.' },
  { id: 'k-sheets', period: 'daily', fun: true, metric: 'keys', keys: ['Ctrl+PageDown', 'Ctrl+PageUp'], target: 20, xp: D, needs: { taught: 'ctrl-page-up-down' }, fallback: 'Switch sheets by keyboard twenty times.' },
  { id: 'k-no-mouse', period: 'daily', fun: true, metric: 'count', where: { kind: ['lesson'], noMouse: true }, target: 1, xp: D, needs: 'lessons-left', fallback: 'Finish a whole lesson without touching the mouse.' },
  { id: 'k-ghost', period: 'daily', fun: true, metric: 'count', where: { kind: ['drill'], ghost: true }, target: 1, xp: D, fallback: 'Beat your own ghost on any drill.' },
  { id: 'k-no-waste', period: 'daily', fun: true, metric: 'count', where: { kind: ['drill', 'daily'], noWaste: true }, target: 1, xp: D, fallback: 'Finish a drill with no wasted keys.' },
  { id: 'k-early-daily', period: 'daily', fun: true, metric: 'count', where: { kind: ['daily'], before: 9 }, target: 1, xp: D, fallback: 'Play the Daily before 9am.' },
  // ---- the weekly pool: the same quests at week size ----
  { id: 'w-drills-10', period: 'weekly', metric: 'count', where: { kind: ['drill'] }, target: 10, xp: W, fallback: 'Finish ten drills.' },
  { id: 'w-dailies-5', period: 'weekly', metric: 'count', where: { kind: ['daily'] }, target: 5, xp: W, fallback: 'Play five Dailies.' },
  { id: 'w-expert-3', period: 'weekly', metric: 'distinct', where: { kind: ['drill', 'daily'], clean: true, tier: 'pro' }, target: 3, xp: W, fallback: 'Reach Expert on three drills.' },
  { id: 'w-rapid-10', period: 'weekly', metric: 'count', where: { kind: ['rapid'] }, target: 10, xp: W, fallback: 'Play ten rapid-fire rounds.' },
  { id: 'w-pb-2', period: 'weekly', metric: 'count', where: { kind: ['drill', 'daily'], pb: true }, target: 2, xp: W, fallback: 'Set two new personal bests.' },
  { id: 'w-clean-5', period: 'weekly', metric: 'count', where: { kind: ['lesson'], clean: true }, target: 5, xp: W, needs: 'lessons-left', fallback: 'Finish five lessons clean.' },
  { id: 'w-challenges-3', period: 'weekly', metric: 'count', where: { kind: ['challenge'] }, target: 3, xp: W, fallback: 'Run three challenges.' },
  { id: 'w-ctrl-shift-100', period: 'weekly', metric: 'keys', keys: ['Ctrl+Shift+↓', 'Ctrl+Shift+↑', 'Ctrl+Shift+←', 'Ctrl+Shift+→'], target: 100, xp: W, needs: { taught: 'ctrl-shift-arrow' }, fallback: 'Press Ctrl+Shift and an arrow a hundred times.' },
  { id: 'w-f4-100', period: 'weekly', metric: 'keys', keys: ['F4'], target: 100, xp: W, needs: { taught: 'f4-repeat' }, fallback: 'Press F4 a hundred times.' },
  { id: 'w-chapter-drills', period: 'weekly', metric: 'chapter', target: 0, xp: W, fallback: 'Play every drill in one chapter.' },
];

export const QUESTS_BY_ID = Object.fromEntries(QUESTS.map(q => [q.id, q]));
