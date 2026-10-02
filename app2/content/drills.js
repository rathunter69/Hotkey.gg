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
import ch2_format_sprint from './drills/ch2-format-sprint.js';
import ch2_to_thousands from './drills/ch2-to-thousands.js';
import ch2_flip_and_tie from './drills/ch2-flip-and-tie.js';
import ch2_custom_code from './drills/ch2-custom-code.js';
import ch2_the_divider from './drills/ch2-the-divider.js';
import ch2_top_and_bottom from './drills/ch2-top-and-bottom.js';
import ch2_flag_it from './drills/ch2-flag-it.js';
import ch2_print_it from './drills/ch2-print-it.js';
import ch2_pnl_to_standard from './drills/ch2-pnl-to-standard.js';
import puzzle_ch2 from './drills/puzzle-ch2.js';
import ch3_if_ladder from './drills/ch3-if-ladder.js';
import ch3_override from './drills/ch3-override.js';
import ch3_date_math from './drills/ch3-date-math.js';
import ch3_sumifs_sprint from './drills/ch3-sumifs-sprint.js';
import ch3_bands from './drills/ch3-bands.js';
import ch3_text_split from './drills/ch3-text-split.js';
import ch3_loan_schedule from './drills/ch3-loan-schedule.js';
import ch3_trace_the_error from './drills/ch3-trace-the-error.js';
import ch3_tie_it_out from './drills/ch3-tie-it-out.js';
import puzzle_ch3 from './drills/puzzle-ch3.js';
import ch4_lookup_relay from './drills/ch4-lookup-relay.js';
import ch4_sort_and_filter from './drills/ch4-sort-and-filter.js';
import ch4_pivot_in_90 from './drills/ch4-pivot-in-90.js';
import ch4_data_table from './drills/ch4-data-table.js';
import ch4_goal_seek from './drills/ch4-goal-seek.js';
import ch4_name_it from './drills/ch4-name-it.js';
import ch4_cube_it from './drills/ch4-cube-it.js';
import ch4_six_tabs from './drills/ch4-six-tabs.js';
import ch4_two_pickers from './drills/ch4-two-pickers.js';
import puzzle_ch4 from './drills/puzzle-ch4.js';
import ch5_statement_link from './drills/ch5-statement-link.js';
import ch5_schedule_fill from './drills/ch5-schedule-fill.js';
import ch5_balance_it from './drills/ch5-balance-it.js';
import ch5_discount_it from './drills/ch5-discount-it.js';
import ch5_sweep from './drills/ch5-sweep.js';
import ch5_checks from './drills/ch5-checks.js';
import ch5_revenue_build from './drills/ch5-revenue-build.js';
import ch5_is_it_revenue from './drills/ch5-is-it-revenue.js';
import puzzle_ch5 from './drills/puzzle-ch5.js';
import ch6_spread_a_comp from './drills/ch6-spread-a-comp.js';
import ch6_median_and_range from './drills/ch6-median-and-range.js';
import ch6_sources_and_uses from './drills/ch6-sources-and-uses.js';
import ch6_irr_sprint from './drills/ch6-irr-sprint.js';
import ch6_waterfall from './drills/ch6-waterfall.js';
import ch6_football_field from './drills/ch6-football-field.js';
import ch6_paper_lbo from './drills/ch6-paper-lbo.js';
import puzzle_ch6 from './drills/puzzle-ch6.js';
import ch6_three_ways_to_a_price from './drills/ch6-three-ways-to-a-price.js';
import ch6_ltm_two_ways from './drills/ch6-ltm-two-ways.js';
import ch6_napkin from './drills/ch6-napkin.js';
import ch6_cap_the_amort from './drills/ch6-cap-the-amort.js';
import ch6_lenders_return from './drills/ch6-lenders-return.js';
import ch6_ceiling_price from './drills/ch6-ceiling-price.js';
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
  // Chapter 2 (screenplay 6.2, script-drills Wave 1): the planned set on the P&L book in teaching order, the benchmark and the puzzle
  ch2_format_sprint,
  ch2_to_thousands,
  ch2_flip_and_tie,
  ch2_custom_code,
  ch2_the_divider,
  ch2_top_and_bottom,
  ch2_flag_it,
  ch2_print_it,
  ch2_pnl_to_standard,
  puzzle_ch2,
  // Chapter 3 (screenplay 6.2, script-drills Wave 1): the planned set on the KPI databook in teaching order, the benchmark and the puzzle
  ch3_if_ladder,
  ch3_override,
  ch3_date_math,
  ch3_sumifs_sprint,
  ch3_bands,
  ch3_text_split,
  ch3_loan_schedule,
  ch3_trace_the_error,
  ch3_tie_it_out,
  puzzle_ch3,
  // Chapter 4 (screenplay 6.2): the planned set on the diligence pack with sort and filter, the benchmark, the two Wave 1 sketches and the puzzle
  ch4_lookup_relay,
  ch4_sort_and_filter,
  ch4_pivot_in_90,
  ch4_data_table,
  ch4_goal_seek,
  ch4_name_it,
  ch4_cube_it,
  ch4_six_tabs,
  ch4_two_pickers,
  puzzle_ch4,
  // Chapter 5 (screenplay 6.2): the planned set on the operating model, the benchmark and the puzzle
  ch5_statement_link,
  ch5_schedule_fill,
  ch5_balance_it,
  ch5_discount_it,
  ch5_sweep,
  ch5_checks,
  ch5_revenue_build,
  ch5_is_it_revenue,   // R7: the proof of pickers and what-if grading (M84, M85; script-drills D01)
  puzzle_ch5,
  // Chapter 6 (screenplay 6.2): the planned set on the valuation pack, the benchmark and the puzzle
  ch6_spread_a_comp,
  ch6_median_and_range,
  ch6_sources_and_uses,
  ch6_irr_sprint,
  ch6_waterfall,
  ch6_football_field,
  ch6_paper_lbo,
  // Chapter 6's Wave 1 sketches (script-drills.md)
  ch6_three_ways_to_a_price,
  ch6_ltm_two_ways,
  ch6_napkin,
  ch6_cap_the_amort,
  ch6_lenders_return,
  ch6_ceiling_price,
  puzzle_ch6,
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
