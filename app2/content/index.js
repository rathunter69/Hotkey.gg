// app2/content/index.js — the catalogue: chapters in order, each with its lessons in order.
import f01 from './lessons/foundations-01-active-cell.js';
import f02 from './lessons/foundations-02-moving-around.js';
import f03 from './lessons/foundations-03-selecting-ranges.js';
import f04 from './lessons/foundations-04-entering-data.js';
import f05 from './lessons/foundations-05-editing-cells.js';
import f06 from './lessons/foundations-06-ribbon-commands.js';
import f07 from './lessons/foundations-07-dialog-boxes.js';

export const CHAPTERS = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'For someone who has never used Excel: the active cell, moving, selecting, entering and editing, then the Ribbon and its dialog boxes.',
    // Section order inside the chapter (SITE_SPEC §7). Later sections arrive with Phase C.
    sections: ['The worksheet', 'Moving', 'Selecting', 'Entering and editing', 'The Ribbon and dialog boxes'],
    lessons: [f01, f02, f03, f04, f05, f06, f07],
  },
];

/** A chapter's lessons grouped by section, in the chapter's section order: [{ name, lessons }]. */
export function sectionsOf(chapter) {
  const order = chapter.sections || [];
  const groups = new Map(order.map(n => [n, []]));
  for (const l of chapter.lessons) { const n = l.section || 'Basics'; if (!groups.has(n)) groups.set(n, []); groups.get(n).push(l); }
  return [...groups].filter(([, ls]) => ls.length).map(([name, lessons]) => ({ name, lessons }));
}

export const LESSONS = CHAPTERS.flatMap(ch => ch.lessons);
export const LESSONS_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
export const chapterOf = lesson => CHAPTERS.find(ch => ch.id === lesson.chapter);
export const lessonById = id => LESSONS_BY_ID[id] || null;
export const nextLesson = id => { const i = LESSONS.findIndex(l => l.id === id); return i >= 0 && i + 1 < LESSONS.length ? LESSONS[i + 1] : null; };
export const lessonNumber = id => LESSONS.findIndex(l => l.id === id) + 1;
