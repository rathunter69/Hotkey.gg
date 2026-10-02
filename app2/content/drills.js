// app2/content/drills.js — the drill catalogue (SITE_SPEC §5): timed exercises over taught
// material. Order is catalog order (prev/next in the drill bar walks it). BENCHMARKS are the
// boards that feed rank (Phase B/§9); DAILY_POOL is where the Daily draws from.
import get_around from './drills/get-around.js';
import enter_and_fill from './drills/enter-and-fill.js';
import find_and_fix from './drills/find-and-fix.js';
import paste_surgeon from './drills/paste-surgeon.js';
import row_wrangler from './drills/row-wrangler.js';
import format_the_weekly_page from './drills/format-the-weekly-page.js';
import insert_and_amend from './drills/insert-and-amend.js';
import formula_sprint from './drills/formula-sprint.js';
import combine_two_tabs from './drills/combine-two-tabs.js';
import before_you_send from './drills/before-you-send.js';
import weekly_sales_report from './drills/weekly-sales-report.js';
import ch5_statement_link from './drills/ch5-statement-link.js';
import ch5_schedule_fill from './drills/ch5-schedule-fill.js';
import ch5_balance_it from './drills/ch5-balance-it.js';
import ch5_discount_it from './drills/ch5-discount-it.js';
import ch5_sweep from './drills/ch5-sweep.js';
import ch5_checks from './drills/ch5-checks.js';
import ch5_revenue_build from './drills/ch5-revenue-build.js';
import puzzle_ch5 from './drills/puzzle-ch5.js';
import { LESSONS } from './index.js';

/**
 * Chapter 1's eleven drills (screenplay 6.1, resized 2026-10-01; M108), in the order the chapter
 * teaches them: one to three minutes each, eight to twenty goals, pars from each reference route.
 */
export const DRILLS = [
  get_around,
  enter_and_fill,
  find_and_fix,
  paste_surgeon,
  row_wrangler,
  format_the_weekly_page,
  insert_and_amend,
  formula_sprint,
  combine_two_tabs,
  before_you_send,
  weekly_sales_report,
  // Chapter 5 (screenplay 6.2): the planned set on the operating model, the benchmark and the puzzle
  ch5_statement_link,
  ch5_schedule_fill,
  ch5_balance_it,
  ch5_discount_it,
  ch5_sweep,
  ch5_checks,
  ch5_revenue_build,
  puzzle_ch5,
];

/**
 * The module challenges (C2 Run 4) registered as drills: each entry is a thin catalogue record
 * over the challenge lesson (kind 'challenge'); the drill page and the Daily hand it to the
 * lesson workspace (`#/lesson/<id>`), which runs it seeded, timed and tier-scored. Two are the
 * benchmarks that feed rank once boards exist.
 */
const BENCHMARK_CHALLENGES = new Set(['challenge-to-standard-in-three-minutes', 'challenge-the-site-pnl']);
export const CHALLENGE_DRILLS = LESSONS.filter(l => l.kind === 'challenge').map(l => ({
  id: l.id, kind: 'challenge', chapter: l.chapter, module: l.module, title: l.title, task: l.brief || '', access: l.access,
  pars: l.pars, optimalKeys: l.optimalKeys, benchmark: BENCHMARK_CHALLENGES.has(l.id) || undefined, lesson: l,
}));
DRILLS.push(...CHALLENGE_DRILLS);

export const DRILLS_BY_ID = Object.fromEntries(DRILLS.map(d => [d.id, d]));
export const drillById = id => DRILLS_BY_ID[id] || null;
/** The drills whose boards feed rank once boards exist (§9). */
export const BENCHMARKS = DRILLS.filter(d => d.benchmark);
/** The Daily draws from every free drill; seeded ones vary their figures by the day. */
export const DAILY_POOL = DRILLS.filter(d => d.access === 'free').map(d => d.id);
