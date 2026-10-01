// app2/ui/components/run-panel.js — the one panel for every timed run, and for lesson complete
// (screenplay 3.0 "The timed run: one panel, four beats"; "Lesson complete"; M93, M98). Drills, the
// Daily, challenges and the assessments run the same loop in a 340px panel at the right of the
// sheet, which is never dimmed or covered: Ready, Run, Result, Next. A lesson ends in the same
// panel (done line, payoff, shortcuts used, XP, a level-up row, Next lesson), and a module's story
// card shows in it before the first goal. The panel's contents change in place (140ms). Every word
// is a site.csv row.
//
//   fmtClock(secs), fmtPar(secs)            "1:18.4", "2:00"                                  pure
//   trackModel(pars, { secs, best })        the time track's bands and markers in percent       pure
//   paceLabel(tier)                         "Expert pace" | "Behind Pass pace" | ""            pure
//   tierLabel(tier), tierMarks(tier)        "Expert", 2                                         pure
//   boardLine(place, of, move)              "31st of 212, up 9"                                 pure
//   factsLine(parts)                        the facts row (each fact its own place)             pure
//   createRunPanel(host, opts)              → panel.ready(d) .run(d) .result(d) .complete(d) .story(d) .timesUp(d) .hide() .keyFor(key)
import { siteCopy } from '../../content/copy/apply.js';
import { keyLabel } from '../../app/prefs.js';
import { view as checklistView } from '../../app/checklist.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb, vars) => fill(siteCopy(key, fb), vars);

export const PANEL_W = 340;   // the token --panel-w
export const TIER_ORDER = ['pass', 'pro', 'legendary'];
export const TRACK_PAST_PASS = 1.2;   // the track runs a fifth past the Pass par

/* ---------------- pure ---------------- */

/** m:ss.t for a clock or a result ("0:30.4", "1:18.4"); never negative. */
export function fmtClock(secs) {
  const s = Math.max(0, Number.isFinite(secs) ? secs : 0);
  const tenths = Math.floor(s * 10);
  const m = Math.floor(tenths / 600), rest = tenths - m * 600;
  const ss = Math.floor(rest / 10), d = rest % 10;
  return `${m}:${String(ss).padStart(2, '0')}.${d}`;
}
/** m:ss for a par or a best ("2:00", "1:24"); rounds to the second. */
export function fmtPar(secs) {
  const s = Math.max(0, Math.round(Number.isFinite(secs) ? secs : 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
/** "About 2 minutes" from a Pass par: minutes rounded, seconds under a minute. */
export function aboutLength(passSecs) {
  if (!Number.isFinite(passSecs) || passSecs <= 0) return '';
  if (passSecs < 60) return t('panel_seconds', '{n} seconds', { n: Math.round(passSecs) });
  const m = Math.max(1, Math.round(passSecs / 60));
  return m === 1 ? siteCopy('panel_minute', '1 minute') : t('panel_minutes', '{n} minutes', { n: m });
}
/** "{d} seconds" for the New best line, to a tenth. */
export const fmtDelta = secs => { const v = Math.round(Math.abs(secs) * 10) / 10; return (Number.isInteger(v) ? String(v) : v.toFixed(1)); };

export function tierLabel(tier) {
  if (tier === 'legendary') return siteCopy('tier_legendary', 'Legendary');
  if (tier === 'pro') return siteCopy('tier_expert', 'Expert');
  if (tier === 'pass') return siteCopy('tier_pass', 'Pass');
  return siteCopy('tier_none', 'No tier');
}
/** How many of the three marks a tier fills. */
export const tierMarks = tier => Math.max(0, TIER_ORDER.indexOf(tier) + 1);
const marksHtml = (tier, pop) => `<span class="rp-marks${pop ? ' rp-pop' : ''}" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= tierMarks(tier) ? 'on' : ''}"></i>`).join('')}</span>`;

/** The pace line: "{tier} pace", "Behind Pass pace" when no tier is in reach, nothing before the first goal lands. */
export function paceLabel(tier) {
  if (tier == null) return '';
  if (tier === 'none') return siteCopy('panel_pace_behind', 'Behind Pass pace');
  return t('panel_pace', '{tier} pace', { tier: tierLabel(tier) });
}

/**
 * The time track: three bands (Legendary to the left, Expert, Pass), gray past Pass, the run's
 * marker and the old best's, as percentages of a span a fifth past the Pass par. Pure.
 */
export function trackModel(pars, { secs = null, best = null } = {}) {
  const p = pars || {};
  const span = Math.max(1, (Number.isFinite(p.pass) ? p.pass : 60) * TRACK_PAST_PASS);
  const pct = v => (Number.isFinite(v) ? Math.max(0, Math.min(100, 100 * v / span)) : null);
  return {
    span,
    bands: [
      { tier: 'legendary', from: 0, to: pct(p.legendary) || 0 },
      { tier: 'pro', from: pct(p.legendary) || 0, to: pct(p.pro) || 0 },
      { tier: 'pass', from: pct(p.pro) || 0, to: pct(p.pass) || 0 },
    ],
    labels: TIER_ORDER.slice().reverse().map(tier => ({ tier, label: tierLabel(tier), time: fmtPar(p[tier]), at: pct(p[tier]) })),
    marker: pct(secs), best: pct(best),
  };
}

const ORD = n => { const v = Math.abs(n) % 100, u = v % 10; return n + (v >= 11 && v <= 13 ? 'th' : u === 1 ? 'st' : u === 2 ? 'nd' : u === 3 ? 'rd' : 'th'); };
/** "31st of 212, up 9" / "31st of 212, down 2" / "31st of 212". Pure. */
export function boardLine(place, of, move) {
  if (!Number.isInteger(place) || place < 1 || !Number.isInteger(of) || of < 1) return '';
  const base = { place: ORD(place), n: of };
  if (Number.isInteger(move) && move > 0) return t('panel_board_up', '{place} of {n}, up {k}', { ...base, k: move });
  if (Number.isInteger(move) && move < 0) return t('panel_board_down', '{place} of {n}, down {k}', { ...base, k: -move });
  return t('panel_board_still', '{place} of {n}', base);
}

/* ---------------- html pieces ---------------- */
const kbd = (k, platform) => `<kbd class="rp-key">${esc(keyLabel(k, platform))}</kbd>`;
const factsHtml = parts => `<div class="rp-facts">${parts.filter(Boolean).map(f => `<span>${esc(f)}</span>`).join('')}</div>`;
function trackHtml(model, { animate } = {}) {
  const band = b => `<i class="rp-band rp-band-${b.tier}" style="left:${b.from}%;width:${Math.max(0, b.to - b.from)}%"></i>`;
  return `<div class="rp-track${animate ? ' rp-anim' : ''}" aria-hidden="true">${model.bands.map(band).join('')}` +
    (model.best != null ? `<s class="rp-best" style="left:${model.best}%"></s>` : '') +
    (model.marker != null ? `<u class="rp-marker" style="left:${model.marker}%"></u>` : '') + '</div>' +
    `<div class="rp-track-labels">${model.labels.map(l => `<span><b>${esc(l.label)}</b> ${esc(l.time)}</span>`).join('')}</div>`;
}
function buttonsHtml(buttons, platform) {
  return (buttons || []).map(b => `<button type="button" class="rp-btn${b.primary ? ' rp-primary' : ''}" data-act="${esc(b.act)}" data-key="${esc(b.key || '')}"><span>${esc(b.label)}</span>${b.key ? kbd(b.key, platform) : ''}</button>`).join('');
}
function xpHtml(xp, animate) {
  if (!xp || !xp.gained) return '';
  const pct = Math.max(0, Math.min(100, Number.isFinite(xp.pct) ? xp.pct : 0));
  return `<div class="rp-row rp-xp"><span>${esc(siteCopy('panel_xp_word', 'XP'))}</span><span class="rp-bar${animate ? ' rp-anim' : ''}"><i style="--rp-w:${pct}%"></i></span><b>${esc(t('panel_xp', '+{n} XP', { n: xp.gained }))}</b></div>`;
}
function levelUpHtml(lv, platform) {
  if (!lv) return '';
  return `<div class="rp-levelup"><div class="rp-levelup-text"><div><b>${esc(t('level_up_title', 'Level {n}', { n: lv.level }))}</b>${lv.title ? `<span class="rp-levelup-title">${esc(lv.title)}</span>` : ''}</div>` +
    (lv.reward ? `<div class="rp-levelup-reward">${esc(t('level_up_reward', '{reward} is yours.', { reward: lv.reward }))}</div>` : '') + '</div>' +
    (lv.equip ? `<button type="button" class="rp-btn rp-small" data-act="equip" data-key="E"><span>${esc(siteCopy('panel_equip', 'Equip'))}</span>${kbd('E', platform)}</button>` : '') + '</div>';
}

/* ---------------- the component ---------------- */

/**
 * @param {HTMLElement} host   where the panel mounts (the workspace's side slot)
 * @param {object} opts        onAct(act), platform() → 'win' | 'mac'
 */
export function createRunPanel(host, opts = {}) {
  const el = document.createElement('aside');
  el.className = 'rp'; el.hidden = true; el.setAttribute('aria-live', 'polite');
  el.innerHTML = '<div class="rp-body"></div><div class="rp-foot"></div>';
  host.appendChild(el);
  const body = el.querySelector('.rp-body'), foot = el.querySelector('.rp-foot');
  const platform = () => (opts.platform ? opts.platform() : undefined);
  let beat = null, buttons = [], countH = 0, swapH = 0;

  el.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && opts.onAct) opts.onAct(b.dataset.act); });

  /** Change the panel's contents in place: the old fades, the new lands (the beat moment). */
  function swap(name, bodyHtml, btns, after) {
    const changed = beat !== name;
    beat = name; buttons = btns || [];
    el.dataset.beat = name; el.hidden = false;
    const paint = () => { body.innerHTML = bodyHtml; foot.innerHTML = buttonsHtml(buttons, platform()); foot.hidden = !buttons.length; body.scrollTop = 0; el.classList.remove('rp-out'); if (after) after(); };
    clearTimeout(swapH);
    if (changed && !el.hidden && body.innerHTML) { el.classList.add('rp-out'); swapH = setTimeout(paint, durationMs('--d-beat', 140)); } else paint();
  }

  /** Ready: the title, one row of facts, the numbered tasks, the three pars, Press any key to start, Esc back. */
  function ready(d) {
    const best = d.best && Number.isFinite(d.best.secs) ? t('panel_best', 'Best {t}, {tier}', { t: fmtPar(d.best.secs), tier: tierLabel(d.best.tier) }) : '';
    const html = `<div class="rp-title">${esc(d.title)}</div>` +
      factsHtml([t('panel_tasks', '{n} tasks', { n: d.tasks.length }), d.length ? t('panel_about', 'About {m}', { m: d.length }) : '', best]) +
      `<ol class="rp-tasks">${d.tasks.map((x, i) => `<li><i>${i + 1}</i><span>${esc(x)}</span></li>`).join('')}</ol>` +
      (d.pars ? `<div class="rp-pars">${TIER_ORDER.map(tier => `<span><b>${esc(tierLabel(tier))}</b> ${esc(fmtPar(d.pars[tier]))}</span>`).join('')}</div>` : '') +
      `<div class="rp-start">${esc(siteCopy('panel_press_any', 'Press any key to start'))}</div>` +
      `<div class="rp-line"><span>${esc(d.foot || siteCopy('panel_ready_foot', 'Help or the mouse, and the time isn’t posted.'))}</span><span class="rp-esc">${kbd('Esc', platform())} ${esc(d.back || siteCopy('panel_back', 'back'))}</span></div>`;
    swap('ready', html, []);
  }

  /** Run: the amber header with the clock, the pace and the track; the folding checklist; keys so far and Esc. Call once, then tick(). */
  function run(d) {
    const model = trackModel(d.pars, { secs: d.secs || 0, best: d.best });
    const html = `<div class="rp-head"><div class="rp-head-row"><span class="rp-clock">${fmtClock(d.secs || 0)}</span><span class="rp-pace">${esc(paceLabel(d.pace))}</span></div>${trackHtml(model)}</div>` +
      `<div class="rp-check"></div>` +
      `<div class="rp-line rp-run-foot"><span class="rp-keys">${esc(t('panel_keys_so_far', 'Keys so far: {n}', { n: d.keys || 0 }))}</span><span class="rp-esc">${kbd('Esc', platform())} ${esc(siteCopy('panel_esc_ends', 'ends the run'))}</span></div>`;
    swap('run', html, []);
    checklist(d.checklist, d.showKeys);
  }
  /** The checklist from app/checklist.js: done tasks folded into one line, the current one with the cursor, the next three, "{n} more after these". */
  function checklist(state, showKeys) {
    const slot = body.querySelector('.rp-check'); if (!slot || !state) return;
    const v = checklistView(state, { next: 5 });
    const row = (it, cls) => `<div class="rp-task ${cls}"><i>${it.index + 1}</i><span>${esc(it.text)}${showKeys && cls === 'rp-cur' && it.keys ? `<span class="rp-task-keys">${it.keys.split(' ').map(k => kbd(k, platform())).join(' ')}</span>` : ''}</span></div>`;
    slot.innerHTML = (v.done ? `<div class="rp-done"><span class="rp-tickbox on" aria-hidden="true"></span><span>${esc(t('panel_done_n', '{n} done', { n: v.done }))}</span></div>` : '') +
      (v.current ? row(v.current, 'rp-cur cursor-on') : '') +
      v.next.map(it => row(it, 'rp-next')).join('') +
      (v.moreAfter ? `<div class="rp-more">${esc(t('panel_more_after', '{n} more after these', { n: v.moreAfter }))}</div>` : '') +
      (v.allDone ? `<div class="rp-done"><span class="rp-tickbox on" aria-hidden="true"></span><span>${esc(siteCopy('panel_all_done', 'All done'))}</span></div>` : '');
    const cur = slot.querySelector('.rp-cur'); if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: 'nearest' }); } catch (e) { /* no layout */ } }
  }
  /** The clock, the pace and the marker move; nothing else repaints. */
  function tick(d) {
    if (beat !== 'run') return;
    const c = body.querySelector('.rp-clock'); if (c) c.textContent = fmtClock(d.secs);
    const p = body.querySelector('.rp-pace'); if (p) p.textContent = paceLabel(d.pace);
    const m = body.querySelector('.rp-marker'); if (m) { const tm = trackModel(d.pars, { secs: d.secs }); m.style.left = (tm.marker == null ? 0 : tm.marker) + '%'; }
    const k = body.querySelector('.rp-keys'); if (k && d.keys != null) k.textContent = t('panel_keys_so_far', 'Keys so far: {n}', { n: d.keys });
  }

  /**
   * Result: the time with the tier and its marks on one line; New best; the track with this run and the
   * old best; the tasks; the XP row, whose bar fills; the board row with the move; any quest that ticked;
   * a level-up row; the reason when no time was posted. Then the buttons (Enter, R, B). The moments run
   * in order and any key skips them.
   */
  function result(d) {
    const anim = d.animate !== false;
    const model = trackModel(d.pars, { secs: d.secs, best: d.oldBest });
    const newBest = d.newBest ? `<div class="rp-newbest rp-m rp-m3">${esc(Number.isFinite(d.newBest.by) && d.newBest.by > 0 ? t('panel_new_best', 'New best. {d} seconds faster.', { d: fmtDelta(d.newBest.by) }) : siteCopy('panel_new_best_first', 'New best.'))}</div>` : '';
    const html = `<div class="rp-time rp-m rp-m1"><b class="rp-time-n" data-secs="${esc(d.secs)}">${esc(fmtClock(anim ? 0 : d.secs))}</b>` +
      (d.clean ? `<span class="rp-tier rp-m rp-m2">${esc(tierLabel(d.tier))}</span>${marksHtml(d.tier, anim)}` : `<span class="rp-tier rp-m rp-m2">${esc(d.finished || siteCopy('drill_finished', 'Finished'))}</span>`) + '</div>' +
      newBest +
      (d.pars ? `<div class="rp-m rp-m4">${trackHtml(model, { animate: anim })}</div>` : '') +
      (d.tasks ? `<div class="rp-row rp-m rp-m5"><span>${esc(t('panel_tasks', '{n} tasks', { n: d.tasks.total }))}</span><b class="rp-tasks-done">${d.tasks.done >= d.tasks.total ? `<span class="rp-tickbox on" aria-hidden="true"></span>${esc(siteCopy('panel_all_done', 'All done'))}` : esc(t('panel_tasks_done', '{d} of {n} done', { d: d.tasks.done, n: d.tasks.total }))}</b></div>` : '') +
      (d.note ? `<div class="rp-note rp-m rp-m5">${esc(d.note)}</div>` : '') +
      `<div class="rp-m rp-m6">${xpHtml(d.xp, anim)}</div>` +
      (d.board ? `<div class="rp-row rp-m rp-m5"><span>${esc(d.board.title || siteCopy('panel_board', 'Your board'))}</span><b>${esc(boardLine(d.board.place, d.board.of, d.board.move))}</b></div>` : '') +
      `<div class="rp-m rp-m7">${levelUpHtml(d.levelUp, platform())}</div>` +
      (d.quest ? `<div class="rp-row rp-quest rp-m rp-m8"><span class="rp-tickbox on" aria-hidden="true"></span><span>${esc(d.quest.done ? t('panel_quest_done', '{quest}. Done, +{xp} XP', { quest: d.quest.title, xp: d.quest.xp }) : t('panel_quest', '{quest}, {d} of {k}', { quest: d.quest.title, d: d.quest.d, k: d.quest.k }))}</span></div>` : '') +
      (d.extra || '');
    el.classList.toggle('rp-animate', anim);
    swap('result', html, d.buttons, () => countUp(d.secs, anim && el.classList.contains('rp-animate')));   // the count starts once the beat has painted
  }
  /** The time counts up over the moment's first beat (0 to 900ms); skip() lands it. */
  function countUp(secs, anim) {
    cancelAnimationFrame(countH);
    const n = body.querySelector('.rp-time-n'); if (!n) return;
    if (!anim || reducedMotion()) { n.textContent = fmtClock(secs); return; }
    const dur = durationMs('--d-count', 900), t0 = performance.now();
    const step = now => { const f = Math.min(1, (now - t0) / dur); n.textContent = fmtClock(secs * f); if (f < 1 && el.classList.contains('rp-animate')) countH = requestAnimationFrame(step); else n.textContent = fmtClock(secs); };
    countH = requestAnimationFrame(step);
  }
  /** Any key skips the result's moments. */
  function skip() { if (beat !== 'result') return; el.classList.remove('rp-animate'); cancelAnimationFrame(countH); const n = body.querySelector('.rp-time-n'); if (n) n.textContent = fmtClock(+n.dataset.secs); }

  /** Lesson complete: the done line, the payoff paragraphs, the shortcuts used, the XP row, a level-up row, Next lesson on Enter. */
  function complete(d) {
    const rows = (d.shortcuts || []).map(s => `<div class="rp-used"><span>${s.keys.split(' ').map(k => kbd(k, platform())).join(' ')}</span><b>${esc(s.count === 1 ? siteCopy('panel_once', 'once') : t('panel_times', '{n} times', { n: s.count }))}</b></div>`).join('');
    const html = `<div class="rp-title">${esc(d.title)}</div>` +
      (d.line ? `<div class="rp-wow">${esc(d.line)}</div>` : '') +
      (d.paras || []).map(p => `<p class="rp-para">${esc(p)}</p>`).join('') +
      (d.marks || []).map(m => `<div class="rp-note">${esc(m)}</div>`).join('') +
      (rows ? `<div class="rp-h"><span>${esc(siteCopy('panel_shortcuts', 'Shortcuts used'))}</span><span class="rp-h-fact">${esc(t('panel_shortcuts_n', '{n}', { n: d.shortcuts.length }))}</span></div><div class="rp-used-list">${rows}</div>` : '') +
      (d.mouse ? `<div class="rp-note">${esc(d.mouse)}</div>` : '') +
      xpHtml(d.xp, true) + levelUpHtml(d.levelUp, platform()) +
      (d.lines || []).map(l => `<div class="rp-note rp-quiet">${esc(l)}</div>`).join('') +
      (d.extra || '');
    swap('complete', html, d.buttons);
    el.classList.remove('rp-animate');
  }
  /** A module's story card: Wolf's line, then Enter starts the job. */
  function story(d) {
    swap('story', `<div class="rp-title">${esc(d.title)}</div><p class="rp-para">${esc(d.body || '')}</p>`, d.buttons);   // no label above the heading (3.0)
  }
  /** Time's up: the line, the count, the way back in. */
  function timesUp(d) {
    swap('timeup', `<div class="rp-title">${esc(d.title)}</div><p class="rp-para">${esc(d.body || '')}</p>` + factsHtml(d.facts || []), d.buttons);
  }
  function hide() { el.hidden = true; beat = null; delete el.dataset.beat; buttons = []; body.innerHTML = ''; foot.innerHTML = ''; }
  /** The action a key does on the current beat, from the buttons' keys (Enter, R, B, E). */
  function keyFor(key) {
    const k = String(key || '');
    const b = buttons.find(x => x.key && (x.key === k || x.key.toLowerCase() === k.toLowerCase()));
    if (b) return b.act;
    const inBody = body.querySelector(`[data-act][data-key="${k.toUpperCase()}"]`);
    return inBody ? inBody.dataset.act : null;
  }
  return {
    el, ready, run, checklist, tick, result, skip, complete, story, timesUp, hide, keyFor,
    get beat() { return beat; },
    destroy() { clearTimeout(swapH); cancelAnimationFrame(countH); el.remove(); },
  };
}

function durationMs(token, fallback) {
  try { const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim(); const n = parseFloat(v); if (!Number.isFinite(n)) return fallback; return /s$/.test(v) && !/ms$/.test(v) ? n * 1000 : n; } catch (e) { return fallback; }
}
function reducedMotion() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-effects') === 'off'; } catch (e) { return false; } }
