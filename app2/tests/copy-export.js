// app2/tests/copy-export.js — pre-fill content/copy/*.csv from what the site says today, so Wolf
// edits rather than starts blank.
//   node app2/tests/copy-export.js            merge into content/copy (adds missing rows, fills empty cells)
//   node app2/tests/copy-export.js <dir>      write the merged set to another folder instead
// Sources, in this order: an existing CSV cell (never overwritten when non-empty) → the lesson's JS
// copy (module lessons in the catalog, their goals) → the screens' built-in lines (site.csv) →
// the curriculum map's Chapter 1 rows for every mapped-but-unwritten lesson (PLANNED below: the
// title, the task as a draft brief, the closer line as the wow beat, the convention line).
// Idempotent: a second run changes nothing. Regenerates content/copy/index.js when writing in place.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COPY_DIR, FILES, HEADERS, readCopyDir, renderIndex } from './copy-build.js';
import { parseCsv, toCsv } from '../content/copy/csv.js';
import { joinParas } from '../content/copy/apply.js';
import { SITE_KEYS } from '../content/copy/rules.js';
import { CHAPTERS, modulesOf, moduleOf, sectionsOf } from '../content/index.js';
import { CONVENTIONS } from '../content/conventions.js';
import { BRIEFING, ORIENTATION } from '../app/first-run-next.js';
import { HEADLINES, SUBHEAD, MODES } from '../app/landing-next.js';
import { MODULE_BEATS, PAGE_DELIVERED } from '../app/beats.js';
import { PLANNED_MODULES } from '../app/learn-next.js';
import { STAGES } from '../app/deal-strip.js';
import { DASH_LINES, DUE_LINES, SAVE_NUDGE } from '../app/home-next.js';
import { INSTALL_PROMPT } from '../app/install.js';
import { MICRO } from '../app/schedule.js';
import { moduleNumber } from '../app/numbering.js';

const conv = ids => (ids || []).map(id => (CONVENTIONS[id] ? CONVENTIONS[id].short : id)).join(' · ');

/** The mapped-but-unwritten Chapter 1 items (docs/proposals/CURRICULUM_MAP.proposed.md §1.3–1.8), in
 *  Wolf's voice as far as a draft can be: the brief is the map's task in ≤3 sentences, the wow line is
 *  the "does it tie" payoff the closer goal plays, the convention line is the canon's short form. */
export const PLANNED = [
  // 1.3 enter, edit, copy and fill
  { id: 'enter-the-missing-day', module: 'enter-edit-copy-fill', order: '1.3.1', title: 'Enter the missing day',
    brief: 'The Airport site’s Saturday never came through, and management emailed the four figures. Enter them with Tab and Enter, put 0 into the five blank Energy cost cells with one Ctrl+Enter, and clear a stray draft note.',
    wow: 'The feed is complete: sixty rows, no blanks, and the Saturday total now reads on the Report.', conventions: ['F5'] },
  { id: 'fix-it-in-place', module: 'enter-edit-copy-fill', order: '1.3.2', title: 'Fix it in place',
    brief: 'Three typos and one wrong figure sit in the feed. Open each cell with F2, move the caret, fix only what is wrong; replace one cell by typing over it; undo a wrong fix and redo the right one.',
    wow: 'Four corrections, nothing retyped, and the running total moved by exactly the amount you fixed.', conventions: ['E1'] },
  { id: 'copy-cut-paste-fill', module: 'enter-edit-copy-fill', order: '1.3.3', title: 'Copy, cut, paste, fill',
    brief: 'Build the Report skeleton from Raw. Copy the header row across sheets, cut the Notes block to where it belongs, fill a label down five sites with Ctrl+D and a header right with Ctrl+R, and drop the marquee with Esc.',
    wow: 'The Report has headers and site labels, and not one of them was typed twice.', conventions: ['E3'] },
  { id: 'paste-special-values-formats-transpose', module: 'enter-edit-copy-fill', order: '1.3.4', title: 'Paste Special: values, formats, transpose',
    brief: 'The associate wants a comparison column. Freeze last week’s live totals into a Prior week block as values, copy the header style onto it with Paste Formats, and turn the site list into a row header with Transpose.',
    wow: 'Change a figure on Raw: the live block moves, the Prior week snapshot holds. That is what values are for.', conventions: ['E4'] },
  { id: 'find-replace-fill-timeline', module: 'enter-edit-copy-fill', order: '1.3.5', title: 'Find, replace, fill a timeline',
    brief: 'Replace w/c 08 Sep with w/c 15 Sep everywhere and read the count Excel reports. Find the one Airprot and fix it. Then build the day header Mon–Sat and the week-number row with Fill Series.',
    wow: 'One timeline row across the top, every period column the same width: the shape every page after this one keeps.', conventions: ['F5', 'C2'] },
  { id: 'challenge-complete-the-feed', module: 'enter-edit-copy-fill', order: '1.3.C', title: 'Challenge: complete the feed', kind: 'challenge',
    brief: 'A seeded feed missing one day, carrying four typos and one number stored as text: complete it, fix it, snapshot it, and fill the timeline.',
    wow: '', conventions: ['E3', 'E4', 'F5'] },
  // 1.4 structure
  { id: 'rows-and-columns-that-keep-the-totals-honest', module: 'structure', order: '1.4.1', title: 'Rows and columns that keep the totals honest',
    brief: 'Cedar Park opened this week. Add a sixth site row inside the Report block and a Margin % column, delete the stale Old code column, and watch the running total follow every edit.',
    wow: 'Six sites, one total, and it never needed retyping: a total that follows its rows is the first check.', conventions: ['F1'] },
  { id: 'widths-heights-autofit', module: 'structure', order: '1.4.2', title: 'Widths, heights, AutoFit',
    brief: 'Set the six day columns to one equal width and AutoFit the label column to its longest site name. Give the title row height 24, AutoFit it back, and unclip the units line.',
    wow: 'Equal period columns, labels that fit, nothing clipped: the page reads at a glance.', conventions: ['C2'] },
  { id: 'hide-group-freeze', module: 'structure', order: '1.4.3', title: 'Hide, group, freeze',
    brief: 'Hide the two working columns, then unhide them and group them instead: a buyer’s analyst will find a hidden column and wonder why. Freeze the title and label column so the report scrolls without losing its heads.',
    wow: 'Scroll to the far right: the site names stay put. Collapse the group: the working columns fold away, and anyone can fold them back.', conventions: ['C7', 'C8'] },
  { id: 'challenge-reshape-the-report', module: 'structure', order: '1.4.C', title: 'Challenge: reshape the report', kind: 'challenge',
    brief: 'A seeded report with a missing site row, a stale column, uneven widths, a hidden column and nothing frozen: put it right, totals still live.',
    wow: '', conventions: ['F1', 'C7', 'C8'] },
  // 1.5 format
  { id: 'numbers-a-banker-can-read', module: 'format', order: '1.5.1', title: 'Numbers a banker can read',
    brief: 'Thousands separators, no decimals, negatives in parentheses for the figures; one decimal for Margin %; three for the energy price; a percentage for the target margin; currency on the total row. Do it with Ctrl+1 first, then with the shortcuts.',
    wow: 'Every line reads the same way down the page. A negative shows in parentheses, so nobody mistakes it for a dash.', conventions: ['D1', 'D2'] },
  { id: 'fonts-fills-borders', module: 'format', order: '1.5.2', title: 'Fonts, fills, borders',
    brief: 'Bold the title and totals and give the totals a top border, not a grid. Fill the input block a light tint, color the two typed rates blue, and size the title one step up.',
    wow: 'A reviewer can now tell an input from a formula and a total from a line item without reading a single number.', conventions: ['D5', 'B3', 'D8'] },
  { id: 'alignment-and-titles', module: 'format', order: '1.5.3', title: 'Alignment and titles',
    brief: 'Center the title across the report with Center Across Selection, never merge. Right-align the headers over the numbers, indent the day lines under each site, and wrap the long note.',
    wow: 'Insert a column through the title: it still sits centered, because nothing was merged.', conventions: ['D7', 'D6'] },
  { id: 'the-style-pass', module: 'format', order: '1.5.4', title: 'The style pass',
    brief: 'A second, unformatted block arrives: the Costs summary. Bring it to the same standard in one pass with F4 to repeat the last format, the number shortcuts and the Quick Access Toolbar, then remove a stray all-borders grid.',
    wow: 'Two blocks, one look, in under a minute: formatting is a pass you make, not a job you do cell by cell.', conventions: ['D5', 'D1', 'D2'] },
  { id: 'challenge-to-standard-in-three-minutes', module: 'format', order: '1.5.C', title: 'Challenge: to standard in three minutes', kind: 'challenge',
    brief: 'A seeded, unformatted weekly report for another cluster: figures, percentages, a title, totals and an input block. Bring it to the standard.',
    wow: '', conventions: ['D1', 'D2', 'D5', 'D7', 'B1'] },
  // 1.6 formulas
  { id: 'point-dont-type', module: 'formulas', order: '1.6.1', title: 'Point, don’t type',
    brief: 'Build gross profit, gross margin % and average price per kWh for one site by pointing at the cells with the arrow keys, never typing an address. Read each formula back with F2.',
    wow: 'Change the site’s revenue on Raw and watch all three lines move. You built them by pointing, so they point back.', conventions: ['E1'] },
  { id: 'sum-family-and-autosum', module: 'formulas', order: '1.6.2', title: 'SUM family and AutoSum',
    brief: 'Total the six sites with Alt+= in one press across the block. Then AVERAGE, MIN, MAX, COUNT and COUNTA for the week summary, and see what a blank does to AVERAGE.',
    wow: 'Six totals from one press, and the summary line tells you a blank is not a zero.', conventions: ['E5'] },
  { id: 'anchors-dollar-and-f4', module: 'formulas', order: '1.6.3', title: 'Anchors: $ and F4',
    brief: 'The wholesale energy price and target margin live on Inputs. Write one energy-cost line that fills down without breaking, cycle F4 through the four anchor states, and fix a mixed-anchor table of sites by price scenario.',
    wow: 'One input cell, referenced thirty times. Change it once and the whole table follows.', conventions: ['E2', 'B4'] },
  { id: 'link-across-sheets', module: 'formulas', order: '1.6.4', title: 'Link across sheets',
    brief: 'Replace the typed site figures on Report with live links to Raw and Costs, fill them down, and color the links green. External-workbook links would be red, and are avoided.',
    wow: 'The Report is fully live: correct a figure in the feed and page one updates without anyone retyping.', conventions: ['B2', 'E7'] },
  { id: 'one-formula-per-row-filled-right', module: 'formulas', order: '1.6.5', title: 'One formula per row, filled right',
    brief: 'Build this week’s six-day block. Write each line once in the Monday column, select across the week with Ctrl+Shift+→ and fill with Ctrl+R; fix a row whose Thursday was retyped; show the formulas with Ctrl+` to see the pattern.',
    wow: 'Show formulas: every row is one formula, repeated. That pattern is what a reviewer checks first.', conventions: ['C3', 'E3'] },
  { id: 'read-the-error-follow-the-trail', module: 'formulas', order: '1.6.6', title: 'Read the error, follow the trail',
    brief: 'Five planted errors sit on Costs: #REF!, #DIV/0!, #NAME?, #VALUE! and #N/A. Read each code, trace it with Ctrl+[ and Ctrl+], and fix the input or the formula. Never paste a value over it.',
    wow: 'Five errors, five causes, five fixes upstream. Costs is clean and nothing was hardcoded to make it so.', conventions: ['F5', 'F3'] },
  { id: 'challenge-the-site-pnl', module: 'formulas', order: '1.6.C', title: 'Challenge: the site P&L', kind: 'challenge',
    brief: 'A seeded site block with typed figures, an Inputs sheet, two errors and one hardcoded rate: link it, total it, anchor it, fix it, fill the week right.',
    wow: '', conventions: ['B2', 'B1', 'C3', 'B4'] },
  // 1.7 present and audit
  { id: 'fit-to-one-page', module: 'present-and-audit', order: '1.7.1', title: 'Fit to one page',
    brief: 'Set the Report up to print: landscape, fit to one page wide, rows 1 to 3 as print titles, a footer with the file name and date, gridlines off in print. Then read the page the way the MD will.',
    wow: 'Print preview shows one page, titled, dated and footed. The report is a document now, not a sheet.', conventions: ['G1', 'G2', 'A6'] },
  { id: 'the-checks-row', module: 'present-and-audit', order: '1.7.2', title: 'The checks row',
    brief: 'Add a Checks block under the report: report revenue less Raw revenue, sites sum less grand total, margin between 0 and 100%. Label each check, and freeze the block in view.',
    wow: 'Three checks, three zeros. Break a link on purpose and one of them turns non-zero: the page tells you before a buyer does.', conventions: ['F1'] },
  { id: 'hardcode-hunt', module: 'present-and-audit', order: '1.7.3', title: 'Hardcode hunt',
    brief: 'The associate marked up a version of Report with eight planted faults from the day-one list: a literal in a formula, a black input, a retyped Thursday, a title centered with spaces, a minus sign, missing units, an all-borders grid, a hidden column. Find each with Go To Special, show formulas and tracing; fix every one and change nothing else.',
    wow: 'Eight faults found, eight fixed, nothing else touched. That is the audit pass you make before anything leaves your desk.', conventions: ['F3'] },
  { id: 'challenge-audit-before-you-send', module: 'present-and-audit', order: '1.7.C', title: 'Challenge: audit before you send', kind: 'challenge',
    brief: 'A seeded report with five planted faults from the list: find and fix all five in three minutes, then set landscape and fit to page.',
    wow: '', conventions: ['F3', 'G1'] },
  // 1.8 project, assessment, test-out
  { id: 'weekly-kpi-project', module: 'project-and-assessment', order: '1.8.P', title: 'Project: the weekly KPI report', kind: 'project',
    brief: 'Management’s next feed has arrived and the Report is blank. Build the linked, totaled, margin-bearing, formatted, checked, print-ready one-page report the chapter has been building. This is page one of the Project Volt pack.',
    wow: 'Page one of the data room, built by you from a raw feed, and every number on it ties.', conventions: ['B1', 'B2', 'B4', 'C5', 'D1', 'D2', 'D5', 'D7', 'F1', 'G1'] },
  { id: 'foundations-assessment', module: 'project-and-assessment', order: '1.8.A', title: 'Assessment: Monday morning', kind: 'assessment',
    brief: 'Same brief, fresh figures, one extra site. Eight minutes on the clock from your first key, solo and keyboard-only, for the Verified certificate.',
    wow: '', conventions: ['B1', 'B2', 'B4', 'C5', 'D1', 'D2', 'D5', 'D7', 'F1', 'G1'] },
  { id: 'foundations-testout', module: 'project-and-assessment', order: '1.8.T', title: 'Test out of Foundations', kind: 'testout',
    brief: 'Ten tasks across the seven modules on one seeded workbook, five minutes. Pass, and the chapter is skipped.',
    wow: '', conventions: [] },
];

/** The map's module numbers by module id (the retired Welcome module is not counted). */
export const PLANNED_MODULE_IDS = { '1.1': 'open-and-set-up', '1.2': 'move-and-select', '1.3': 'enter-edit-copy-fill', '1.4': 'structure', '1.5': 'format', '1.6': 'formulas', '1.7': 'present-and-audit' };
const moduleN = (id, k) => moduleNumber(id, k) || Object.keys(PLANNED_MODULE_IDS).find(n => PLANNED_MODULE_IDS[n] === id) || '1.' + k;
const PAGE_NAMES = {
  'open-and-set-up': 'The workbook, set up to standard', 'move-and-select': 'The feed, answered', 'enter-edit-copy-fill': 'The Report skeleton', structure: 'The Report, reshaped',
  format: 'The Report, formatted', formulas: 'The Report, live', 'present-and-audit': 'Page one of the pack', 'project-and-assessment': 'The weekly KPI report',
  'number-formats': 'The P&L, numbers to standard', 'custom-number-formats': 'The house number-format set',
};

/** Everything the screens say today, keyed the way rules.js SITE_KEYS names it. */
export function siteDefaults() {
  const out = {};
  BRIEFING.forEach((c, i) => { out[`briefing_${i + 1}_eyebrow`] = c.eyebrow; out[`briefing_${i + 1}_title`] = c.title; out[`briefing_${i + 1}_body`] = joinParas(c.body); });
  out.orientation_eyebrow = ORIENTATION.eyebrow; out.orientation_title = ORIENTATION.title;
  for (const r of ORIENTATION.rows) out['orientation_' + r.where.toLowerCase()] = r.what;
  out.orientation_fine = ORIENTATION.fine;
  out.landing_headline_a = HEADLINES[0].a; out.landing_headline_b = HEADLINES[0].b; out.landing_subhead = SUBHEAD;
  for (const m of MODES) out['mode_' + m.key] = m.line;
  out.dash_learn = DASH_LINES.learn; out.dash_practice = DASH_LINES.practice;
  out.deal_strip_stage_1 = STAGES[0].stage; out.deal_strip_deliverable_1 = STAGES[0].delivers;
  out.page_delivered = PAGE_DELIVERED; out.save_nudge = SAVE_NUDGE; out.install_prompt = INSTALL_PROMPT;
  out.due_empty = DUE_LINES.empty; out.due_foot = DUE_LINES.foot;
  return out;
}

/** The merged copy set: existing cells win, then the JS copy, then the drafts. Pure over `current`. */
export function exportCopy(current) {
  const lessons = [], goals = [], modules = [], site = [];
  const fill = (row, key, value) => { if (!(typeof row[key] === 'string' && row[key].trim()) && value != null && value !== '') row[key] = String(value); };
  const seen = new Set();
  const lessonRow = id => { const r = { ...(current.lessons[id] || {}) }; for (const h of HEADERS['lessons.csv']) if (r[h] == null) r[h] = ''; r.id = id; return r; };
  // module lessons in catalog order, every chapter (legacy lessons keep their JS copy until the rewrite replaces them;
  // a later chapter's rows arrive as drafts of its JS copy, for Wolf's rewrite)
  for (const l of CHAPTERS.flatMap(ch => ch.lessons)) {
    if (typeof l.module !== 'string' || l.module === 'welcome') continue;
    const at = moduleOf(l);
    const r = lessonRow(l.id);
    fill(r, 'module', l.module);
    fill(r, 'order', at ? `${moduleN(l.module, at.k)}.${{ challenge: 'C', project: 'P', assessment: 'A', testout: 'T' }[l.kind] || at.n}` : '');
    fill(r, 'title', l.title); fill(r, 'brief', l.brief || l.read || ''); fill(r, 'closing', joinParas(l.closing));
    fill(r, 'wow', l.wow); fill(r, 'convention_line', l.conventionLine || conv(l.conventions)); fill(r, 'mac_note', l.macNote); fill(r, 'story_beat', l.storyBeat);
    lessons.push(r); seen.add(l.id);
    const rows = current.goals[l.id] || [];
    (l.goals || []).forEach((g, i) => {
      const g0 = rows.find(x => Number(x.goal_index) === i) || {};
      const gr = { lesson_id: l.id, goal_index: String(i), text: g0.text || '', teach: g0.teach || '', why: g0.why || '', hint_stuck: g0.hint_stuck || '' };
      fill(gr, 'text', g.text); fill(gr, 'teach', g.teach); fill(gr, 'why', g.why); fill(gr, 'hint_stuck', g.hintStuck);
      goals.push(gr);
    });
  }
  const covered = new Set(lessons.map(r => r.order));
  for (const p of PLANNED) {
    if (seen.has(p.id) || covered.has(p.order)) continue;   // authored since: the catalog's row carries it
    const r = lessonRow(p.id);
    fill(r, 'module', p.module); fill(r, 'order', p.order); fill(r, 'title', p.title); fill(r, 'brief', p.brief); fill(r, 'wow', p.wow); fill(r, 'convention_line', conv(p.conventions));
    lessons.push(r); seen.add(p.id);
    for (const g of current.goals[p.id] || []) goals.push({ ...g });
  }
  for (const id of current.order) if (!seen.has(id)) { lessons.push(lessonRow(id)); for (const g of current.goals[id] || []) goals.push({ ...g }); }
  lessons.sort((a, b) => orderKey(a.order) - orderKey(b.order) || a.id.localeCompare(b.id));
  // modules: the built ones first, then the planned, then anything only the CSV knows
  const built = CHAPTERS.flatMap(ch => modulesOf(ch)).filter(m => m.id !== 'welcome');
  const mseen = new Set();
  const moduleRow = (id, name, objective) => {
    const r = { ...(current.modules[id] || {}) }; for (const h of HEADERS['modules.csv']) if (r[h] == null) r[h] = ''; r.id = id;
    const beat = MODULE_BEATS[id];
    fill(r, 'name', name); fill(r, 'objective', objective); fill(r, 'story_beat', beat ? joinParas([beat.title, beat.body]) : ''); fill(r, 'page_name', PAGE_NAMES[id]);
    modules.push(r); mseen.add(id);
  };
  for (const m of built) { const plan = PLANNED_MODULES.find(p => p.title === m.title) || {}; const sec = CHAPTERS.flatMap(ch => sectionsOf(ch)).find(x => x.name === m.title) || {}; moduleRow(m.id, m.title, plan.objective || sec.blurb || ''); }
  for (const p of PLANNED_MODULES) { const id = PLANNED_MODULE_IDS[p.n]; if (id && !mseen.has(id)) moduleRow(id, p.title, p.objective); }
  if (!mseen.has('project-and-assessment')) moduleRow('project-and-assessment', 'Project, assessment, test-out', 'Build the weekly report end to end, then prove it against the clock; or test out of the chapter.');
  for (const id in current.modules) if (!mseen.has(id)) moduleRow(id, '', '');
  // site
  const defaults = siteDefaults();
  const keys = [...SITE_KEYS, ...Object.keys(current.site).filter(k => !SITE_KEYS.includes(k))];
  for (const k of keys) site.push({ key: k, text: (current.site[k] && current.site[k].trim()) ? current.site[k] : (defaults[k] || '') });
  // micro-drills: one row per drill, in schedule order; the prompt is the drill's task line, the teach its first goal's (usually empty: the drill repeats a taught key)
  const micro = [];
  const cur = current.micro || {};
  for (const id in MICRO) { const m = MICRO[id]; const r = { id, prompt: (cur[id] && cur[id].prompt) || '', teach: (cur[id] && cur[id].teach) || '' }; fill(r, 'prompt', m.task); fill(r, 'teach', (m.goals && m.goals[0] && m.goals[0].teach) || ''); micro.push(r); }
  for (const id in cur) if (!MICRO[id]) micro.push({ id, prompt: cur[id].prompt || '', teach: cur[id].teach || '' });
  return { lessons, goals, modules, site, micro };
}

function orderKey(order) {
  const m = /^(\d+)\.(\d+)\.(\d+|[A-Z])$/.exec(String(order || ''));
  if (!m) return 1e9;
  const last = /^\d+$/.test(m[3]) ? Number(m[3]) : { C: 50, P: 60, A: 70, T: 80 }[m[3]] || 90;
  return Number(m[1]) * 1e6 + Number(m[2]) * 1e3 + last;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dir = process.argv[2] && !process.argv[2].startsWith('--') ? resolve(process.argv[2]) : COPY_DIR;
  const current = readCopyDir(COPY_DIR);
  const out = exportCopy(current);
  mkdirSync(dir, { recursive: true });
  const texts = { 'lessons.csv': toCsv(HEADERS['lessons.csv'], out.lessons), 'goals.csv': toCsv(HEADERS['goals.csv'], out.goals), 'modules.csv': toCsv(HEADERS['modules.csv'], out.modules), 'site.csv': toCsv(HEADERS['site.csv'], out.site), 'micro.csv': toCsv(HEADERS['micro.csv'], out.micro) };
  let changed = 0;
  for (const f of FILES) {
    const p = join(dir, f);
    const before = existsSync(p) ? readFileSync(p, 'utf8') : '';
    if (before !== texts[f]) { writeFileSync(p, texts[f]); changed++; }
    console.log(`${f}: ${parseCsv(texts[f]).rows.length} rows${before === texts[f] ? ' (unchanged)' : ''}`);
  }
  if (dir === COPY_DIR) writeFileSync(join(COPY_DIR, 'index.js'), renderIndex(readCopyDir(COPY_DIR)));
  console.log(changed ? `exported to ${dir}` : `nothing to export: ${dir} already carries everything`);
}
