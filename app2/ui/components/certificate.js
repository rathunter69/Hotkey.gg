// app2/ui/components/certificate.js — the certificate as something you work toward (Wolf, 2026-10-02,
// point 30): the six chapters as progress, the one next step, what you earn, and the certificate
// itself drawn as the page it will be. The profile's certificate section shows it in full; Home and
// the boards carry the teaser. One component; every line is a site.csv row.
//
//   courseNow()                    → courseProgress over this learner's records (the six chapters)
//   nextCertStep(course)           → { text, href } the one thing that moves it
//   certCardHtml(course, name)     → the certificate as it will look, filled to where you are
//   certTeaserHtml(course)         → the small panel for Home and the boards
import { CHAPTERS } from '../../content/index.js';
import { siteCopy } from '../../content/copy/apply.js';
import { store } from '../../app/store.js';
import { COURSE, courseProgress } from '../../app/progress-model.js';
import { panelHtml } from './table.js';
import { esc, fill } from './format.js';

const t = (k, vars) => fill(siteCopy(k, k), vars);

export function courseNow() {
  const recs = {};
  for (const c of COURSE.chapters) { try { recs[c.id] = store.chapter(c.id) || {}; } catch (e) { recs[c.id] = {}; } }
  return courseProgress(CHAPTERS, store.all(), recs);
}

/** The first chapter not Verified, and what it needs next. */
export function nextCertStep(course) {
  const ch = course.chapters.find(c => !c.verified);
  if (!ch) return { text: t('cert_next_done'), href: '#/account?section=certificate' };
  const built = CHAPTERS.find(c => c.id === ch.id);
  if (!ch.built) return { text: t('cert_next_writing', { n: ch.n }), href: '#/learn' };
  if (ch.completed) {
    const gate = built && built.lessons.find(l => l.kind === 'assessment');
    return { text: t('cert_next_assess', { n: ch.n }), href: gate ? '#/lesson/' + gate.id : '#/learn?ch=' + ch.id };
  }
  const left = Math.max(0, ch.lessons - ch.lessonsDone);
  return { text: t(left === 1 ? 'cert_next_lessons_one' : 'cert_next_lessons', { n: ch.n, left }), href: '#/learn?ch=' + ch.id };
}

const segs = course => `<span class="cert-segs" aria-hidden="true">${course.chapters.map(c => `<i class="${c.verified ? 'on' : c.completed ? 'half' : ''}"></i>`).join('')}</span>`;

export function certCardHtml(course, name = '') {
  const issued = course.verifiedCount >= course.of;
  return `<div class="cert-card${issued ? ' issued' : ''}">
    <div class="cert-top"><span class="cert-mark">hotkey<b>.gg</b></span><span class="cert-state">${esc(issued ? t('cert_issued') : t('cert_not_yet'))}</span></div>
    <div class="cert-name">${esc(t('certificate_name'))}</div>
    <div class="cert-course">${esc(t('certificate_course'))}</div>
    <div class="cert-to"><span>${esc(t('cert_awarded_to'))}</span><b>${esc(name || t('cert_you'))}</b></div>
    ${segs(course)}
    <div class="cert-foot"><span>${esc(t('certificate_progress', { n: course.verifiedCount }))}</span><span>${esc(t('cert_issued_at'))}</span></div>
  </div>`;
}

export function certTeaserHtml(course, { cls = '' } = {}) {
  const step = nextCertStep(course);
  const body = `${segs(course)}<p class="panel-line">${esc(step.text)}</p><a class="panel-link" href="#/account?section=certificate">${esc(t('cert_see'))}</a>`;
  return panelHtml({ heading: esc(t('certificate_name')), facts: esc(t('certificate_progress', { n: course.verifiedCount })), body, cls: 'cert-teaser ' + cls });
}
