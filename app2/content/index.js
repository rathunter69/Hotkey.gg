// app2/content/index.js — the catalogue: chapters in order, each with its lessons in order.
import welcome_race from './lessons/welcome-race.js';
import active_cell from './lessons/active-cell.js';
import moving_around from './lessons/moving-around.js';
import selecting_ranges from './lessons/selecting-ranges.js';
import entering_data from './lessons/entering-data.js';
import editing_cells from './lessons/editing-cells.js';
import ribbon_commands from './lessons/ribbon-commands.js';
import dialog_boxes from './lessons/dialog-boxes.js';

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
    ],
    lessons: [welcome_race, active_cell, moving_around, selecting_ranges, entering_data, editing_cells, ribbon_commands, dialog_boxes],
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

export const LESSONS = CHAPTERS.flatMap(ch => ch.lessons);
export const LESSONS_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
export const chapterOf = lesson => CHAPTERS.find(ch => ch.id === lesson.chapter);
export const lessonById = id => LESSONS_BY_ID[id] || null;
export const nextLesson = id => { const i = LESSONS.findIndex(l => l.id === id); return i >= 0 && i + 1 < LESSONS.length ? LESSONS[i + 1] : null; };
export const lessonNumber = id => LESSONS.findIndex(l => l.id === id) + 1;
