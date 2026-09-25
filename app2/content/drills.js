// app2/content/drills.js — the drill catalogue (SITE_SPEC §5): timed exercises over taught
// material. Order is catalog order (prev/next in the drill bar walks it). BENCHMARKS are the
// boards that feed rank (Phase B/§9); DAILY_POOL is where the Daily draws from.
import edge_jumps from './drills/edge-jumps.js';
import go_anywhere from './drills/go-anywhere.js';
import select_blocks from './drills/select-blocks-drill.js';
import type_the_column from './drills/type-the-column.js';
import find_and_fix from './drills/find-and-fix.js';
import fill_factory from './drills/fill-factory.js';
import row_wrangler from './drills/row-wrangler.js';
import bold_and_borders from './drills/bold-and-borders.js';
import format_cells_numbers from './drills/format-cells-numbers.js';
import formula_sprint from './drills/formula-sprint.js';
import paste_surgeon from './drills/paste-surgeon.js';
import weekly_sales_report from './drills/weekly-sales-report.js';
import { LESSONS } from './index.js';

export const DRILLS = [
  edge_jumps,
  go_anywhere,
  select_blocks,
  type_the_column,
  find_and_fix,
  fill_factory,
  row_wrangler,
  bold_and_borders,
  format_cells_numbers,
  formula_sprint,
  paste_surgeon,
  weekly_sales_report,
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
