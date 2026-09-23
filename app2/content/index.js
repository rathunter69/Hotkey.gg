// app2/content/index.js — the catalogue: chapters in order, each with its lessons in order.
import welcome_race from './lessons/welcome-race.js';
import workbook_sheets_cells from './lessons/workbook-sheets-cells.js';
import managing_sheets from './lessons/managing-sheets.js';
import ribbon_and_keytips from './lessons/ribbon-and-keytips.js';
import excel_options from './lessons/excel-options.js';
import page_setup from './lessons/page-setup.js';
import active_cell from './lessons/active-cell.js';
import moving_around from './lessons/moving-around.js';
import selecting_ranges from './lessons/selecting-ranges.js';
import entering_data from './lessons/entering-data.js';
import editing_cells from './lessons/editing-cells.js';
import ribbon_commands from './lessons/ribbon-commands.js';
import dialog_boxes from './lessons/dialog-boxes.js';
import page_keys from './lessons/page-keys.js';
import go_to_cells from './lessons/go-to-cells.js';
import select_blocks from './lessons/select-blocks.js';
import go_to_special from './lessons/go-to-special.js';
import undo_redo from './lessons/undo-redo.js';
import fill_down_right from './lessons/fill-down-right.js';
import find_replace from './lessons/find-replace.js';
import insert_delete_rows from './lessons/insert-delete-rows.js';
import widths_heights from './lessons/widths-heights.js';
import hide_freeze from './lessons/hide-freeze.js';
import home_tab_tour from './lessons/home-tab-tour.js';
import format_cells_tabs from './lessons/format-cells-tabs.js';
import fills_and_colours from './lessons/fills-and-colours.js';
import first_formula from './lessons/first-formula.js';
import sum_family from './lessons/sum-family.js';
import autosum from './lessons/autosum.js';
import absolute_refs from './lessons/absolute-refs.js';
import cross_sheet from './lessons/cross-sheet.js';
import formula_errors from './lessons/formula-errors.js';
import copy_cut_paste from './lessons/copy-cut-paste.js';
import paste_special from './lessons/paste-special.js';
import fill_series from './lessons/fill-series.js';
import weekly_report_project from './lessons/weekly-report-project.js';
import foundations_assessment from './lessons/foundations-assessment.js';
import foundations_testout from './lessons/foundations-testout.js';

export const CHAPTERS = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Everything a first-week analyst or a total beginner needs before formulas get serious: how Excel works, moving, selecting, entering and editing, rows and columns, the Ribbon and its dialog boxes, basic formulas, copy and paste.',
    // Chapter 1's sections in order (SITE_SPEC §7). A section with no lessons yet still shows in the
    // catalog as upcoming, so the chapter's shape is visible; its blurb says what arrives there.
    sections: [
      { name: 'Welcome', blurb: 'One lesson with a race in it: what this platform does and why it beats a video.' },
      { name: 'How Excel works', blurb: 'Workbook, sheets, cells and references; the Ribbon and Alt chords; Formula Bar and Name Box; the Options that matter; page setup; best practices.' },
      { name: 'Moving', blurb: 'Arrows, Ctrl+Arrow, Home and End, Page keys, Go To, between sheets and workbooks.' },
      { name: 'Selecting', blurb: 'Shift+Arrow, Ctrl+Shift+Arrow, whole rows and columns, Ctrl+A regions, Go To Special.' },
      { name: 'Entering and editing', blurb: 'Type, Enter and Tab, F2, Escape, Delete and Backspace, fill down and right, undo and redo, Find and Replace.' },
      { name: 'Rows, columns and sheets', blurb: 'Insert and delete, width and height, autofit, hide and unhide, group, freeze panes, sheet tabs.' },
      { name: 'The Ribbon and dialogs', blurb: 'The Home tab by KeyTips, Format Cells tab by tab, bold, borders, fills, font colour, alignment.' },
      { name: 'Basic formulas', blurb: '= and operators, SUM, AVERAGE, MIN, MAX and COUNT, AutoSum, relative and absolute references, F4, common errors.' },
      { name: 'Copy, paste and fill', blurb: 'Copy, cut and paste, Paste Special, fill series, the Flash Fill idea.' },
      { name: 'Project and assessment', blurb: 'Build the weekly report end to end, then prove it against the clock; or test out of the chapter.' },
    ],
    lessons: [
      welcome_race,
      workbook_sheets_cells, managing_sheets, ribbon_and_keytips, excel_options, page_setup,
      active_cell, moving_around, page_keys, go_to_cells,
      selecting_ranges, select_blocks, go_to_special,
      entering_data, editing_cells, undo_redo, fill_down_right, find_replace,
      insert_delete_rows, widths_heights, hide_freeze,
      ribbon_commands, dialog_boxes, home_tab_tour, format_cells_tabs, fills_and_colours,
      first_formula, sum_family, autosum, absolute_refs, cross_sheet, formula_errors,
      copy_cut_paste, paste_special, fill_series,
      weekly_report_project, foundations_assessment, foundations_testout,
    ],
  },
];

/** A chapter's section names in order (sections may be strings or { name, blurb } records). */
export const sectionNames = chapter => (chapter.sections || []).map(s => (typeof s === 'string' ? s : s.name));
/**
 * A chapter's lessons grouped by section, in the chapter's section order: [{ name, blurb, lessons }].
 * Every listed section is returned, with an empty `lessons` list when nothing is built there yet
 * (the catalog shows it as upcoming); a lesson naming an unlisted section lands in 'Basics' at the end.
 */
export function sectionsOf(chapter) {
  const order = (chapter.sections || []).map(s => (typeof s === 'string' ? { name: s, blurb: '' } : { name: s.name, blurb: s.blurb || '' }));
  const groups = new Map(order.map(sec => [sec.name, { name: sec.name, blurb: sec.blurb, lessons: [] }]));
  for (const l of chapter.lessons) { const n = l.section || 'Basics'; if (!groups.has(n)) groups.set(n, { name: n, blurb: '', lessons: [] }); groups.get(n).lessons.push(l); }
  return [...groups.values()];
}

/**
 * A chapter's modules (framework v2): lessons sharing a `module` id, grouped in catalog order,
 * each ending in its challenge — [{ id, title, lessons, challenge }]. `title` is the lessons'
 * shared `section` name; `lessons` excludes the challenge. Legacy lessons (no `module`) are not
 * in any module and keep the sectioned catalog until the rewrite replaces them.
 */
export function modulesOf(chapter) {
  const out = []; const idx = {};
  for (const l of chapter.lessons) {
    if (typeof l.module !== 'string') continue;
    if (idx[l.module] == null) { idx[l.module] = out.length; out.push({ id: l.module, title: l.section || l.module, lessons: [], challenge: null }); }
    const m = out[idx[l.module]];
    if (l.kind === 'challenge') m.challenge = l; else m.lessons.push(l);
  }
  return out;
}
/** The module a lesson belongs to, with the lesson's place in it: { module, n, of, k, of7 } — or null. */
export function moduleOf(lesson) {
  if (!lesson || typeof lesson.module !== 'string') return null;
  const ch = CHAPTERS.find(c => c.id === lesson.chapter);
  if (!ch) return null;
  const mods = modulesOf(ch);
  const k = mods.findIndex(m => m.id === lesson.module);
  if (k < 0) return null;
  const m = mods[k];
  const n = m.lessons.findIndex(l => l.id === lesson.id);
  return { module: m, n: n >= 0 ? n + 1 : m.lessons.length + 1, of: m.lessons.length, k: k + 1, of7: mods.length };
}

export const LESSONS = CHAPTERS.flatMap(ch => ch.lessons);
export const LESSONS_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
export const chapterOf = lesson => CHAPTERS.find(ch => ch.id === lesson.chapter);
export const lessonById = id => LESSONS_BY_ID[id] || null;
export const nextLesson = id => { const i = LESSONS.findIndex(l => l.id === id); return i >= 0 && i + 1 < LESSONS.length ? LESSONS[i + 1] : null; };
export const lessonNumber = id => LESSONS.findIndex(l => l.id === id) + 1;
