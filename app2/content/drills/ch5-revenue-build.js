// Practice · Finance and Accounting — Revenue build in three (screenplay 6.2, benchmark). The
// chapter's first benchmark without the keys on screen: 5.7.1's cut-back revenue build (state B571),
// every row one formula filled right, total revenue typed, the desk format on the rollout and the
// washes. The checkpoints are 5.7.1's goals, graded the same way: the finished model's figures and a
// what-if on Inputs that moves each row.
import lesson from '../lessons/revenue-build-in-three.js';
import { modelDrill } from './model-drills.js';

const goals = lesson.goals.filter(g => !g.closer).map(({ id, text, keys, check }) => ({ id, text, keys, check }));

export default modelDrill({
  id: 'ch5-revenue-build',
  title: 'Revenue build in three',
  task: 'Take the cut-back revenue build on Schedules to a total that ties, every row one formula filled right, inside three minutes.',
  module: 'model-speed',
  benchmark: true,
  state: { before: 'B571' },
  goals,
  endState: lesson.endState,
  solution: lesson.solution,
  optimalKeys: 260,
  route: 90,
});
