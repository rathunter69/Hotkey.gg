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

export const DRILLS_BY_ID = Object.fromEntries(DRILLS.map(d => [d.id, d]));
export const drillById = id => DRILLS_BY_ID[id] || null;
/** The drills whose boards feed rank once boards exist (§9). */
export const BENCHMARKS = DRILLS.filter(d => d.benchmark);
/** The Daily draws from every free drill; seeded ones vary their figures by the day. */
export const DAILY_POOL = DRILLS.filter(d => d.access === 'free').map(d => d.id);
