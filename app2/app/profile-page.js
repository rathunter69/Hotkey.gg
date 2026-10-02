// app2/app/profile-page.js — the profile and the certificate (screenplay 3.0, mockups 11 and 12; Wolf,
// 2026-10-02, points 10, 12, 20 and 30). #/account?section=profile: who you are on hotkey.gg in one
// band (the level on a key, the title, the bar, four real numbers), the achievements as a shelf of
// pixel badges with their rarity, and the level titles as a sheet with yours lit and what each pays.
// #/account?section=certificate: the six chapters as progress, the one next step, what you earn, and
// the certificate drawn as the page it will be. Account details and your data stay on the account page.
import { store } from './store.js';
import { auth } from './auth.js';
import { gameCtx } from './stats.js';
import { evaluateAchievements } from '../ui/badges.js';
import { GLYPHS, renderPixel, RARITY_COLOURS } from '../ui/pixel.js';
import { LEVELS, titleAt, MAX_LEVEL } from '../content/levels.js';
import { siteCopy } from '../content/copy/apply.js';
import { esc, fill, fmtClock } from '../ui/components/format.js';
import { panelHtml, tableHtml, buttonHtml } from '../ui/components/table.js';
import { barHtml } from '../ui/components/marks.js';
import { saveNudgeHtml, wireSaveNudge } from '../ui/components/nudge.js';
import { courseNow, nextCertStep, certCardHtml, certTeaserHtml } from '../ui/components/certificate.js';

const t = (k, vars) => fill(siteCopy(k, k), vars);

/** The shelf order: earned first (rarest first), then the ones in reach by progress, then the hidden. Pure. */
export function shelfOrder(states) {
  const R = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const earned = states.filter(s => s.done).sort((a, b) => R[a.def.rarity] - R[b.def.rarity]);
  const open = states.filter(s => !s.done && !s.def.hidden).sort((a, b) => (b.prog / b.goal) - (a.prog / a.goal));
  const hidden = states.filter(s => !s.done && s.def.hidden);
  return [...earned, ...open, ...hidden];
}

function badgeRow(s) {
  const d = s.def;
  if (d.hidden && !s.done) return `<div class="ach hidden"><span class="ach-art ach-q" aria-hidden="true">?</span><span class="ach-words"><span class="ach-name">${esc(t('ach_hidden_name'))}</span><span class="ach-desc">${esc(t('ach_hidden_desc'))}</span><span class="ach-rar r-${esc(d.rarity)}">${esc(t('rarity_' + d.rarity))}</span></span></div>`;
  const art = renderPixel(GLYPHS[d.glyph] || GLYPHS.star, { b: RARITY_COLOURS[d.rarity] || RARITY_COLOURS.common }, s.done ? { size: 48 } : { size: 48, mono: 'var(--line)' });
  const prog = !s.done && s.goal > 1 ? `<span class="ach-prog">${barHtml(100 * s.prog / s.goal, 'bar-ach')}<span>${esc(t('home_count_of', { n: s.prog, m: s.goal }))}</span></span>` : '';
  return `<div class="ach${s.done ? ' earned' : ' locked'}"><span class="ach-art">${art}</span><span class="ach-words"><span class="ach-name">${esc(d.name)}</span><span class="ach-desc">${esc(d.desc)}</span><span class="ach-rar r-${esc(d.rarity)}">${esc(t('rarity_' + d.rarity))}</span>${prog}</span></div>`;
}

function profileHtml() {
  const g = gameCtx();
  const lv = g.levelInfo;
  const prof = auth.state() === 'in' ? store.profile() : null;
  const name = (prof && prof.handle) || t('profile_guest');
  const lessons = Object.values(g.progress).filter(p => p && p.completed).length;
  const pass = new Set(g.attempts.filter(a => a.clean && a.tier && a.tier !== 'none').map(a => a.ref)).size;
  const dailies = new Set(g.attempts.filter(a => a.kind === 'daily' && a.day).map(a => a.day)).size;
  const fastest = g.attempts.filter(a => a.kind === 'daily' && a.clean && a.secs != null).sort((a, b) => a.secs - b.secs)[0];
  const facts = [[lessons, t('profile_lessons')], [pass, t('profile_drills_pass')], [dailies, t('profile_dailies')], [fastest ? fmtClock(fastest.secs, true) : '', t('profile_best_daily')]];
  const band = `<section class="panel prof-band">
      <kbd class="prof-lvl-key" aria-label="${esc(t('home_level', { n: lv.lvl }))}">${lv.lvl}</kbd>
      <div class="prof-who"><h1 class="prof-name">${esc(name)}</h1><span class="prof-title">${esc(titleAt(lv.lvl))}</span>${barHtml(lv.pct, 'bar-level')}<span class="prof-xp">${esc(t('home_xp', { n: lv.into, next: lv.need }))}</span></div>
      <dl class="prof-facts">${facts.map(([v, k]) => `<div><dt>${esc(k)}</dt><dd>${v === '' ? '<span class="ink-2">0</span>' : esc(v)}</dd></div>`).join('')}</dl>
    </section>`;
  const states = shelfOrder(evaluateAchievements(g));
  const earned = states.filter(s => s.done).length;
  const shelf = panelHtml({ heading: esc(t('home_achievements')), facts: esc(t('home_count_of', { n: earned, m: states.length })), body: `<div class="ach-grid">${states.map(badgeRow).join('')}</div>`, cls: 'prof-ach', stretch: true });
  const bandRows = LEVELS.filter(r => r.level === 1 || r.level === r.band || r.level === MAX_LEVEL);
  const cur = LEVELS.filter(r => r.level <= lv.lvl && (r.level === 1 || r.level === r.band)).pop();
  const levels = tableHtml({ sheet: true, cls: 'tbl-levels', columns: [{ key: 'n', label: t('col_level'), align: 'right' }, { key: 'title', label: t('col_title') }, { key: 'reward', label: t('col_reward') }],
    rows: bandRows.map(r => ({ cells: { n: String(r.level), title: `<span class="row-name">${esc(r.title)}</span>`, reward: esc(r.reward.label) }, cls: `${cur && r.level === cur.level ? 'next' : ''}${r.level > lv.lvl ? ' later' : ''}`, cursor: false })) });
  const levelPanel = panelHtml({ heading: esc(t('profile_levels')), facts: esc(t('profile_you_are', { n: lv.lvl, title: titleAt(lv.lvl) })), body: `${levels}<p class="panel-line ink-2">${esc(t('profile_levels_line'))}</p>`, cls: 'prof-levels' });
  const course = courseNow();
  const acct = `<a class="panel-link" href="#/account?section=data">${esc(t('profile_account_link'))}</a>`;
  return `${band}<div class="pg-two"><div class="pg-main">${shelf}</div><div class="pg-side">${saveNudgeHtml()}${levelPanel}${certTeaserHtml(course)}${panelHtml({ body: acct, cls: 'prof-acct' })}</div></div>`;
}

function certificateHtml() {
  const course = courseNow();
  const prof = auth.state() === 'in' ? store.profile() : null;
  const rows = course.chapters.map(c => {
    const pct = c.lessons ? Math.round(100 * c.lessonsDone / c.lessons) : 0;
    const st = c.verified ? `<span class="cert-ok">${esc(c.assessmentSecs != null ? t('cert_verified_time', { t: fmtClock(c.assessmentSecs, false) }) : t('cert_verified'))}</span>` : c.completed ? esc(t('cert_ready')) : !c.built ? esc(t('learn_being_written')) : '';
    return `<div class="cert-row${c.verified ? ' verified' : ''}${c.lessonsDone ? ' started' : ''}"><span class="cert-n">${c.n}</span><span class="cert-ch">${esc(c.title)}</span>${barHtml(pct, 'bar-cert')}<span class="cert-count">${c.lessons ? esc(t('cert_lessons', { d: c.lessonsDone, m: c.lessons })) : ''}</span><span class="cert-st">${st}</span></div>`;
  }).join('');
  const step = nextCertStep(course);
  const main = panelHtml({ heading: esc(t('rail_certificate')), facts: esc(t('certificate_progress', { n: course.verifiedCount })), body: `<div class="cert-rows">${rows}</div>
    <div class="cert-next"><span class="cert-next-k">${esc(t('cert_next_k'))}</span><span>${esc(step.text)}</span>${buttonHtml({ label: t('cert_go'), key: 'Enter', href: step.href, primary: true, id: 'certGo' })}</div>`, cls: 'cert-main', stretch: true,
    attrs: { 'data-cursor': true, 'data-cursor-enter': '#certGo', tabindex: '-1' } });
  const earn = ['cert_earn_1', 'cert_earn_2', 'cert_earn_3'].map(k => `<li>${esc(t(k))}</li>`).join('');
  const side = `${certCardHtml(course, prof && prof.handle)}${panelHtml({ heading: esc(t('cert_earn_head')), body: `<ul class="cert-earn">${earn}</ul><p class="panel-line ink-2">${esc(t('cert_how'))}</p>`, cls: 'cert-earn-panel', stretch: true })}`;
  return `<div class="pg-two pg-cert"><div class="pg-main">${main}</div><div class="pg-side">${side}</div></div>`;
}

export function mountProfilePage(root, ctx = {}) {
  const el = document.createElement('div');
  const section = ctx.query && ctx.query.section === 'certificate' ? 'certificate' : 'profile';
  el.className = 'pg pg-profile pg-' + section;
  const draw = () => { el.innerHTML = section === 'certificate' ? certificateHtml() : profileHtml(); wireSaveNudge(el); if (ctx.cursor) ctx.cursor.refresh(); };
  draw();
  root.appendChild(el);
  const off = auth.onChange(() => draw());
  const onUser = () => draw();
  window.addEventListener('hk:user', onUser);
  setTimeout(() => { if (ctx.cursor && section === 'certificate') ctx.cursor.select(el.querySelector('.cert-main'), { focus: false }); }, 0);
  return { destroy() { if (typeof off === 'function') off(); window.removeEventListener('hk:user', onUser); el.remove(); } };
}
