// app2/ui/components/coachmarks.js — the coach marks after the first lesson (screenplay 3.0 "The
// first run"; 3.2; M92): one sentence on each rail item, one at a time, dismissed with Enter.
// The mark is a small card beside the rail item it names, with a pointer on its left edge and
// the Enter key; Esc dismisses the rest. The marks are data (COACH_MARKS: the rail element each
// one sits by and its site.csv row), so adding one is a data edit.
//
//   coachMarksDue(prefs, lessonsDone)                → should Home show them now (pure)
//   const marks = mountCoachMarks({ railEl, onDone });  marks.next(); marks.destroy();
import { siteCopy } from '../../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Each mark: the element it points at and its site.csv row. A rail mark's selector is inside the
 * rail and the card sits to its right; a page mark (`page: true`, Wolf 2026-10-02 point 20: explain
 * levels, XP and quests) points at a panel on Home and the card sits to its left.
 */
export const COACH_MARKS = [
  { key: 'home', at: '.rail-item[data-page="home"]', copy: 'orientation_home', fallback: 'Home picks up where you left off, with today’s quests on the right.' },
  { key: 'home_level', at: '.home-level', page: true, copy: 'orientation_home_level', fallback: 'Lessons, challenges, drills, the Daily, rapid-fire and quests all pay XP, and every level opens a piece of flair, drawn here.' },
  { key: 'home_today', at: '.home-today', page: true, copy: 'orientation_home_today', fallback: 'Three quests a day and three a week each pay XP, with a bonus when all three land.' },
  { key: 'learn', at: '.rail-item[data-page="learn"]', copy: 'orientation_learn', fallback: 'Learn is the course: six chapters of short modules, each ending in a timed challenge on a fresh file.' },
  { key: 'practice', at: '.rail-item[data-page="practice"]', copy: 'orientation_practice', fallback: 'Drills, the Daily, rapid-fire and the challenges all live under Practice, on the clock.' },
  { key: 'leaderboard', at: '.rail-item[data-page="leaderboard"]', copy: 'orientation_leaderboard', fallback: 'Each drill and challenge has a board, the Daily too, and only a run with no help and no mouse posts a time.' },
  { key: 'reference', at: '.rail-item[data-page="reference"]', copy: 'orientation_reference', fallback: 'Reference has every key the course teaches, and shows which ones you’ve practiced.' },
  { key: 'level', at: '#railLevel', copy: 'orientation_level', fallback: 'Lessons, challenges, drills, the Daily, rapid-fire and quests all pay XP toward your next level. Speed is what puts you on the boards.' },
  { key: 'streak', at: '#railStreak', copy: 'orientation_streak', fallback: 'Your first practice each day fills that day’s cell and adds a day to your streak.' },
  { key: 'pro', at: '#railPro', copy: 'orientation_pro', fallback: 'Chapter 1 is free in full, and Full Access opens Chapters 2 to 6 with their timed play.' },
  { key: 'account', at: '#railAcctBtn', copy: 'orientation_account', fallback: 'Progress saves in this browser until a free account keeps it on any device and puts your times on the boards.', guest: true },
];

/** The marks show on the first visit to Home after a lesson, once. Pure. */
export function coachMarksDue(p, lessonsDone) {
  return !!p && p.firstRunDone === true && p.coachMarksDone !== true && (lessonsDone | 0) >= 1;
}

/** The marks whose rail element exists (a guest with no level has no level or streak row). Pure over a lookup. */
export function visibleMarks(find, marks = COACH_MARKS) {
  return marks.filter(m => { const el = find(m.at, m); return !!el && !el.hidden; });
}

export function mountCoachMarks({ railEl, onDone, marks = COACH_MARKS, signedIn = false } = {}) {
  const find = (sel, m) => (m && m.page ? (typeof document !== 'undefined' ? document.querySelector(sel) : null) : railEl ? railEl.querySelector(sel) : null);
  const list = visibleMarks(find, marks.filter(m => !(m.guest && signedIn)));
  let i = -1;
  const card = document.createElement('div');
  card.className = 'coach';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-live', 'polite');
  document.body.appendChild(card);
  let target = null;

  function place() {
    if (!target) return;
    const r = target.getBoundingClientRect();
    const m = list[i];
    card.classList.toggle('coach-left', !!(m && m.page));
    card.style.left = Math.round(m && m.page ? r.left - card.offsetWidth : r.right) + 'px';
    const half = card.offsetHeight / 2, pad = 8;   // kept inside the window: the account mark sits at the rail's foot
    card.style.top = Math.round(Math.max(half + pad, Math.min(window.innerHeight - half - pad, r.top + r.height / 2))) + 'px';
  }
  function show(k) {
    if (target) target.classList.remove('coach-target');
    i = k;
    const m = list[i];
    if (!m) { finish(); return; }
    target = find(m.at, m); if (target) target.classList.add('coach-target');
    card.innerHTML = `<p class="coach-line">${esc(siteCopy(m.copy, m.fallback))}</p><div class="coach-foot"><span class="label">${esc(siteCopy('coach_count', '{n} of {m}').replace('{n}', i + 1).replace('{m}', list.length))}</span><button type="button" class="btn btn-primary btn-small" data-act="next">${esc(i + 1 < list.length ? siteCopy('coach_next', 'Next') : siteCopy('coach_done', 'Done'))}<kbd class="key key-on-fill">Enter</kbd></button></div>`;
    card.querySelector('[data-act="next"]').onclick = next;
    place();
    requestAnimationFrame(place);
    const b = card.querySelector('button'); if (b) b.focus({ preventScroll: true });
  }
  function next() { show(i + 1); }
  let done = false;
  function finish() {
    if (done) return; done = true;
    if (target) target.classList.remove('coach-target');
    card.remove();
    window.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', place);
    if (onDone) { try { onDone(); } catch (e) { /* host hook */ } }
  }
  const onKey = e => {
    if (done) return;
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); next(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); }
  };
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', place);
  if (list.length) show(0); else finish();
  return { next, destroy: finish, get index() { return i; }, get count() { return list.length; } };
}
