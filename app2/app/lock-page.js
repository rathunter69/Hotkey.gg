// app2/app/lock-page.js — the page a Pro lesson's URL shows an account that does not hold Pro
// (Chapter 2 on: a guest, a free account). Not a 404: the lesson exists, the door is shut. The
// door is the one paywall panel (ui/components/paywall.js), on the page, never a pop-up (3.0,
// Pricing and the paywall; M105): the chapter as the heading, Pro at the right, Wolf's line,
// Go Pro (Enter) and Not now (Esc), which goes back to Learn.
import { auth } from './auth.js';
import { CHAPTERS, chapterOf, moduleOf } from '../content/index.js';
import { itemNumber } from './numbering.js';
import { mountPaywall, PAID_LINE as paidLine } from '../ui/components/paywall.js';
import { siteCopy } from '../content/copy/apply.js';

/** The paid line the catalog shows on a locked chapter (learn-next reads it). */
export const PAID_LINE = paidLine();

/** The panel's heading: "Chapter {n}: {name}" when the chapter is known, else the lesson with its number. Pure. */
export function lockHeading(lesson, chapter, chapterN, number) {
  if (chapter && chapterN) return siteCopy('paywall_chapter', 'Chapter {n}: {name}').replace('{n}', chapterN).replace('{name}', chapter.title || '');
  return lesson ? `${number ? number + ' ' : ''}${lesson.title}` : siteCopy('paywall_this_lesson', 'This lesson');
}

export function mountLockPage(root, ctx = {}) {
  const lesson = ctx.lesson || null;
  const ch = lesson ? chapterOf(lesson) : null;
  const n = lesson ? itemNumber(lesson, moduleOf(lesson)) : '';
  const el = document.createElement('div');
  el.className = 'page locked';
  root.appendChild(el);
  const pw = mountPaywall(el, { heading: lockHeading(lesson, ch, ch ? CHAPTERS.indexOf(ch) + 1 : 0, n), signedIn: auth.state() === 'in', notNowHref: '#/learn' });
  return { destroy() { pw.destroy(); el.remove(); } };
}
