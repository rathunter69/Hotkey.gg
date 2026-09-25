// app2/content/index.js — the catalogue: chapters in order, each with its lessons in order.
// Chapter 1 (C2, framework v2): seven modules of lessons on the Project Volt workbook, each ending
// in its challenge, then the project, the assessment and the test-out (1.8).
import inherited_workbook from './lessons/inherited-workbook.js';
import { applyCopy } from './copy/apply.js';
import ribbon_by_keyboard from './lessons/ribbon-by-keyboard.js';
import analyst_setup from './lessons/analyst-setup.js';
import colour_label_hardcode from './lessons/colour-label-hardcode.js';
import challenge_inherited_file from './lessons/challenge-inherited-file.js';
import jump_dont_scroll from './lessons/jump-dont-scroll.js';
import select_like_you_mean_it from './lessons/select-like-you-mean-it.js';
import around_the_workbook from './lessons/around-the-workbook.js';
import typed_vs_calculated from './lessons/typed-vs-calculated.js';
import challenge_find_and_mark from './lessons/challenge-find-and-mark.js';
import enter_the_missing_day from './lessons/enter-the-missing-day.js';
import fix_it_in_place from './lessons/fix-it-in-place.js';
import copy_cut_paste_fill from './lessons/copy-cut-paste-fill.js';
import paste_special_values from './lessons/paste-special-values.js';
import find_replace_timeline from './lessons/find-replace-timeline.js';
import challenge_complete_the_feed from './lessons/challenge-complete-the-feed.js';
import rows_cols_honest_totals from './lessons/rows-cols-honest-totals.js';
import widths_heights_autofit from './lessons/widths-heights-autofit.js';
import hide_group_freeze from './lessons/hide-group-freeze.js';
import challenge_reshape_the_report from './lessons/challenge-reshape-the-report.js';
import numbers_a_banker_can_read from './lessons/numbers-a-banker-can-read.js';
import fonts_fills_borders from './lessons/fonts-fills-borders.js';
import alignment_and_titles from './lessons/alignment-and-titles.js';
import the_style_pass from './lessons/the-style-pass.js';
import challenge_to_standard_in_three_minutes from './lessons/challenge-to-standard-in-three-minutes.js';
import point_dont_type from './lessons/point-dont-type.js';
import sum_family_and_autosum from './lessons/sum-family-and-autosum.js';
import anchors_dollar_and_f4 from './lessons/anchors-dollar-and-f4.js';
import link_across_sheets from './lessons/link-across-sheets.js';
import one_formula_per_row_filled_right from './lessons/one-formula-per-row-filled-right.js';
import read_the_error_follow_the_trail from './lessons/read-the-error-follow-the-trail.js';
import challenge_the_site_pnl from './lessons/challenge-the-site-pnl.js';
import fit_to_one_page from './lessons/fit-to-one-page.js';
import the_checks_row from './lessons/the-checks-row.js';
import hardcode_hunt from './lessons/hardcode-hunt.js';
import challenge_audit_before_you_send from './lessons/challenge-audit-before-you-send.js';
import weekly_kpi_project from './lessons/weekly-kpi-project.js';
import foundations_assessment from './lessons/foundations-assessment.js';
import foundations_testout from './lessons/foundations-testout.js';

export const CHAPTERS = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Everything a first-week analyst or a total beginner needs before formulas get serious: how Excel works, moving, selecting, entering and editing, rows and columns, the Ribbon and its dialog boxes, basic formulas, copy and paste.',
    // Chapter 1's sections in order (SITE_SPEC §7): the seven modules and the closing project block.
    sections: [
      { name: 'Open and set up', blurb: 'The workbook management sent, tidied to house standard: tabs, gridlines, Excel Options, the Quick Access Toolbar, and the analyst’s color-and-label conventions.' },
      { name: 'Move and select', blurb: 'Jumps, never scrolls: Ctrl+Arrow, the selection set, Go To for far and cross-sheet targets, and Go To Special.' },
      { name: 'Enter, edit, copy and fill', blurb: 'The feed completed and cleaned, then the report skeleton built from it: Tab and Enter, F2, the clipboard, Paste Special values, Replace All and a filled timeline.' },
      { name: 'Structure', blurb: 'Rows and columns that keep the totals honest, widths and heights, and grouping, freezing and never hiding: the report reshaped without breaking it.' },
      { name: 'Format', blurb: 'Numbers a banker can read, fonts, fills and borders, alignment and titles, and a style pass with F4: the format the team uses, applied once and repeated.' },
      { name: 'Formulas', blurb: 'Point, don’t type; SUM and its family with AutoSum; anchors and F4; links across sheets; one formula per row filled right; the errors and what they mean.' },
      { name: 'Present and audit', blurb: 'Fit to one page, a checks row that reads zero, and the hardcode hunt before the page goes in the pack.' },
      { name: 'Project and assessment', blurb: 'Build the weekly report end to end, then prove it against the clock; or test out of the chapter.' },
    ],
    lessons: [
      inherited_workbook, ribbon_by_keyboard, analyst_setup, colour_label_hardcode, challenge_inherited_file,
      jump_dont_scroll, select_like_you_mean_it, around_the_workbook, typed_vs_calculated, challenge_find_and_mark,
      enter_the_missing_day, fix_it_in_place, copy_cut_paste_fill, paste_special_values, find_replace_timeline, challenge_complete_the_feed,
      rows_cols_honest_totals, widths_heights_autofit, hide_group_freeze, challenge_reshape_the_report,
      numbers_a_banker_can_read, fonts_fills_borders, alignment_and_titles, the_style_pass, challenge_to_standard_in_three_minutes,
      point_dont_type, sum_family_and_autosum, anchors_dollar_and_f4, link_across_sheets, one_formula_per_row_filled_right, read_the_error_follow_the_trail, challenge_the_site_pnl,
      fit_to_one_page, the_checks_row, hardcode_hunt, challenge_audit_before_you_send,
      weekly_kpi_project, foundations_assessment, foundations_testout,
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

// The copy layer (content/copy/*.csv → content/copy/index.js): a lesson's learner-facing words
// overlay the JS file's where a row exists (a clone; the JS lesson stays the raw fallback and
// copy-check warns where a row is missing). LESSONS_RAW is the inline set, for the schema tests.
for (const ch of CHAPTERS) { ch.lessonsRaw = ch.lessons; ch.lessons = ch.lessons.map(l => applyCopy(l)); }
export const LESSONS_RAW = CHAPTERS.flatMap(ch => ch.lessonsRaw);
export const LESSONS = CHAPTERS.flatMap(ch => ch.lessons);
export const LESSONS_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
export const chapterOf = lesson => CHAPTERS.find(ch => ch.id === lesson.chapter);
export const lessonById = id => LESSONS_BY_ID[id] || null;
export const nextLesson = id => { const i = LESSONS.findIndex(l => l.id === id); return i >= 0 && i + 1 < LESSONS.length ? LESSONS[i + 1] : null; };
export const lessonNumber = id => LESSONS.findIndex(l => l.id === id) + 1;
