// app2/app/progress-model.js — the progress model and the one certificate (screenplay 3.0 "Get
// these right now", 7; "The certificate"; 3.16; M102). Lessons roll up to modules, modules to
// chapters, each chapter's assessment to Verified, and six Verified chapters to one certificate:
// hotkey.gg Certified, Excel for Finance. Chapter Verified is a status and an achievement, never
// a certificate. Pure functions over the progress store's shapes (progress.js: a lessons map and a
// chapters map); the certificate page and Home's chapter table render from these.
//
//   lessonStatus(entry)                       'todo' | 'started' | 'done'
//   moduleProgress(module, lessons)           { id, title, done, of, challenge: { passed, tier }, status }
//   chapterProgress(chapter, lessons, rec)    { id, title, modules, lessonsDone, lessons, completed, verified, assessmentSecs, status }
//   courseProgress(chapters, lessons, recs)   { chapters: [...], verifiedCount, of: 6, issued }
//   certificateState(course, issued)          { issued, verifiedCount, of, credentialId, issuedAt, ... }
//   verifyUrl(credentialId), linkedInAddUrl(cert)
//   COURSE, CHAPTER_STATUSES, MODULE_STATUSES
import { modulesOf } from '../content/index.js';

/**
 * The course the certificate covers: its six chapters, in order, by the ids the content uses.
 * Chapters 3 to 6 are named here before their content lands so the progress page can show all six.
 */
export const COURSE = {
  id: 'excel-for-finance',
  issuer: 'hotkey.gg',
  chapters: [
    { id: 'foundations', n: 1, title: 'Foundations' },
    { id: 'formatting', n: 2, title: 'Formatting' },
    { id: 'formulas', n: 3, title: 'Formulas' },
    { id: 'data-and-lookups', n: 4, title: 'Data and Lookups' },
    { id: 'finance-and-accounting', n: 5, title: 'Finance and Accounting' },
    { id: 'valuation', n: 6, title: 'Valuation' },
  ],
};
export const CHAPTER_STATUSES = ['not-started', 'in-progress', 'completed', 'verified'];
export const MODULE_STATUSES = ['not-started', 'in-progress', 'done'];

const isObj = v => typeof v === 'object' && v !== null && !Array.isArray(v);

export function lessonStatus(entry) {
  if (!isObj(entry)) return 'todo';
  return entry.completed ? 'done' : entry.started ? 'started' : 'todo';
}

/** A module from content/index.js modulesOf(): { id, title, lessons, challenge }. */
export function moduleProgress(module, lessons = {}) {
  // the chapter's gates (the assessment, the test-out) are Verified's, not a module's lessons
  const items = (module.lessons || []).filter(l => l.kind !== 'assessment' && l.kind !== 'testout');
  const done = items.filter(l => lessonStatus(lessons[l.id]) === 'done').length;
  const ch = module.challenge ? lessons[module.challenge.id] : null;
  const challenge = module.challenge ? { id: module.challenge.id, passed: !!(ch && (ch.challenge || ch.completed)), tier: (ch && ch.tier) || null } : null;
  const started = done > 0 || items.some(l => lessonStatus(lessons[l.id]) === 'started') || (challenge && challenge.passed);
  const complete = done === items.length && (!challenge || challenge.passed);
  return { id: module.id, title: module.title, done, of: items.length, challenge, status: complete && items.length ? 'done' : started ? 'in-progress' : 'not-started' };
}

/**
 * A chapter's progress: `chapter` is a content chapter (CHAPTERS) or just { id } when its content
 * has not landed; `rec` is progress.js's chapter record { assessment?, testout? }; the assessment
 * time comes from the assessment or test-out lesson's entry (`best`).
 */
export function chapterProgress(chapter, lessons = {}, rec = {}) {
  const mods = chapter && Array.isArray(chapter.lessons) ? modulesOf(chapter).map(m => moduleProgress(m, lessons)) : [];
  const lessonsDone = mods.reduce((n, m) => n + m.done, 0);
  const lessonsOf = mods.reduce((n, m) => n + m.of, 0);
  const completed = mods.length > 0 && mods.every(m => m.status === 'done');
  const verified = !!(isObj(rec) && (rec.assessment || rec.testout));
  let assessmentSecs = null;
  if (verified && chapter && Array.isArray(chapter.lessons)) {
    const gate = chapter.lessons.find(l => (l.kind === 'assessment' || l.kind === 'testout') && lessons[l.id] && Number.isFinite(lessons[l.id].best));
    if (gate) assessmentSecs = lessons[gate.id].best;
  }
  const started = lessonsDone > 0 || mods.some(m => m.status !== 'not-started');
  const status = verified ? 'verified' : completed ? 'completed' : started ? 'in-progress' : 'not-started';
  return { id: chapter.id, title: chapter.title || '', modules: mods, lessonsDone, lessons: lessonsOf, completed, verified, assessmentSecs, status };
}

/** The six chapters as progress toward the certificate. `chapters` is CHAPTERS (the built ones); unbuilt ones show empty. */
export function courseProgress(chapters = [], lessons = {}, recs = {}) {
  const rows = COURSE.chapters.map(c => {
    const built = chapters.find(ch => ch.id === c.id);
    const p = chapterProgress(built || { id: c.id }, lessons, isObj(recs) ? recs[c.id] : null);
    return { ...p, n: c.n, title: c.title, built: !!built };
  });
  const verifiedCount = rows.filter(r => r.verified).length;
  return { chapters: rows, verifiedCount, of: COURSE.chapters.length, issued: verifiedCount === COURSE.chapters.length };
}

/**
 * The certificate's state for the page: not issued until all six are Verified; once issued (the
 * account's row from migration 0010), its id, date and name. `issued` is that row or null.
 */
export function certificateState(course, issued = null) {
  const earned = !!(course && course.issued);
  const row = isObj(issued) ? issued : null;
  return {
    issued: !!row, earned, verifiedCount: course ? course.verifiedCount : 0, of: course ? course.of : COURSE.chapters.length,
    credentialId: row ? row.credentialId || row.credential_id || null : null,
    issuedAt: row ? row.issuedAt || row.issued_at || null : null,
    displayName: row ? row.displayName || row.display_name || '' : '',
    verifyUrl: row && (row.credentialId || row.credential_id) ? verifyUrl(row.credentialId || row.credential_id) : null,
  };
}

export const VERIFY_BASE = 'https://hotkey.gg/#/verify/';
export const verifyUrl = id => VERIFY_BASE + encodeURIComponent(String(id || ''));

/** LinkedIn's add-certification link, filled in (3.0, The certificate): name, issuer, date, credential id, verification URL. */
export function linkedInAddUrl({ name = 'hotkey.gg Certified, Excel for Finance', issuer = COURSE.issuer, issuedAt, credentialId, url } = {}) {
  const d = issuedAt ? new Date(issuedAt) : null;
  const q = new URLSearchParams({ startTask: 'CERTIFICATION_NAME', name, organizationName: issuer });
  if (d && Number.isFinite(d.getTime())) { q.set('issueYear', String(d.getUTCFullYear())); q.set('issueMonth', String(d.getUTCMonth() + 1)); }
  if (credentialId) { q.set('certId', String(credentialId)); q.set('certUrl', url || verifyUrl(credentialId)); }
  return 'https://www.linkedin.com/profile/add?' + q.toString();
}
