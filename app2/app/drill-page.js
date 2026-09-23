// app2/app/drill-page.js — the drill workspace (SITE_SPEC §5) in the old trainer layout: drill bar
// (chapter · title · position · prev/next), slim mode bar (help ladder · platform · ghost · sound ·
// fullscreen), the sheet with the clock in the formula bar, the task panel of checkpoints on the
// RIGHT, and the status line with the three pars, PB and keys. Graded drills run through DrillRun;
// the sandbox keeps its free sheet. The clock starts on the first key press — and the key that
// dismisses the start card never lands on the sheet.
import { mountSandbox } from './sandbox.js';
import { mountSheetTabs } from '../ui/sheet-tabs.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { mountEffects } from '../ui/effects.js';
import { prefs, keyLabel } from './prefs.js';
import { showToast } from '../ui/toast.js';
import { track } from './telemetry.js';
import { DRILLS, drillById } from '../content/drills.js';
import { DrillRun } from './drill-run.js';
import { store } from './store.js';
import { dailyDrill, shareText } from './daily.js';
import { dayOf } from './records.js';
import { gameCtx, celebrate } from './stats.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const ICO = {
  ghost: `<svg class="mb-ico" ${SVG}><path d="M5 21V10a7 7 0 0 1 14 0v11l-3-2-2 2-2-2-2 2-3-2Z"/><path d="M9.5 10h.01M14.5 10h.01"/></svg>`,
  sound: `<svg class="mb-ico" ${SVG}><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>`,
  mute: `<svg class="mb-ico" ${SVG}><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6M16 9l6 6"/></svg>`,
  fs: `<svg class="mb-ico" ${SVG}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`,
  play: `<svg class="mb-ico" ${SVG}><path d="M7 4v16l13-8Z"/></svg>`,
};
const SANDBOX = {
  id: 'sandbox', chapter: 'Practice', title: 'Sandbox: a free sheet', task: 'Nothing is graded here. Try anything.',
  suggestions: [
    { text: 'Jump to the bottom of the Line item column', keys: 'Ctrl+↓' },
    { text: 'Select the whole block from A1', keys: 'Ctrl+A' },
    { text: 'Make a cell bold from the Ribbon', keys: 'Alt H B' },
    { text: 'Open Format Cells and set a number format', keys: 'Ctrl+1' },
    { text: 'Undo everything and start again', keys: 'Ctrl+Z' },
  ],
};
/** The drill bar walks the graded drills, then the sandbox. */
const NAV = [...DRILLS, SANDBOX];

/** The workspace stylesheet (shared with the lesson view: overlay card, help notes, keycaps). */
function ensureCss() {
  if (document.getElementById('lessonCss')) return;
  const link = document.createElement('link'); link.id = 'lessonCss'; link.rel = 'stylesheet'; link.href = new URL('../ui/lesson.css', import.meta.url).href;
  document.head.appendChild(link);
}

const fmtClock = secs => Math.max(0, secs).toFixed(2);
const fmtSecs = secs => secs.toFixed(1);
const TIER_LABEL = { pass: 'Pass', pro: 'Pro', legendary: 'Legendary', none: '—' };

export function mountDrillPage(root, ctx = {}) {
  ensureCss();
  const daily = !!(ctx.params && ctx.params.daily) && (() => { const d = dailyDrill(dayOf()); return d.drill ? d : null; })();
  const id = daily ? daily.drill.id : (ctx.params && ctx.params.id) || 'sandbox';
  const drill = daily ? daily.drill : id === 'sandbox' ? SANDBOX : drillById(id) || SANDBOX;
  const pos = NAV.findIndex(d => d.id === drill.id) + 1;
  const prev = daily ? null : NAV[pos - 2] || null, next = daily ? null : NAV[pos] || null;
  const graded = drill !== SANDBOX;
  const attemptsToday = () => store.attempts({ kind: 'daily', day: dayOf() }).length;

  const el = document.createElement('div');
  el.className = 'drill-page';
  let p = prefs.get();
  let helpOpen = false;       // F1 hints: the current checkpoint's keys
  let guided = false;         // every checkpoint's keys revealed
  let replay = null;          // { steps, i, timer } while the solution plays
  let started = false;        // the start card is gone (graded only)
  let finishedShown = false;
  let ghostOn = graded && p.ghost !== false;

  el.innerHTML = `
    <div class="drillbar">
      ${prev ? `<a class="db-nav" href="#/drill/${esc(prev.id)}" title="previous drill: ${esc(prev.title)}" aria-label="previous drill">‹</a>` : '<button class="db-nav" type="button" disabled>‹</button>'}
      <a class="db-current" id="drillPick" href="#/practice" title="all drills">
        <span class="db-cat">${daily ? '◆ the daily' : esc(drill.chapter)}</span>
        <span class="db-name">${esc(drill.title)}</span>
        <span class="db-pos">${daily ? esc(dayOf()) : pos + ' / ' + NAV.length}</span>
        <span class="db-more">all drills</span>
      </a>
      ${next ? `<a class="db-nav" href="#/drill/${esc(next.id)}" title="next drill: ${esc(next.title)}" aria-label="next drill">›</a>` : '<button class="db-nav" type="button" disabled>›</button>'}
    </div>
    <div class="exrow"><div class="mode-bar" role="toolbar" aria-label="drill tools">
      <button class="mb-tool" id="helpToggle" type="button" aria-pressed="false" title="F1 — light up the keys for the current step"><kbd>F1</kbd> hints</button>
      ${graded ? `<button class="mb-tool" id="guideToggle" type="button" aria-pressed="false" title="guided — every step's keys revealed">✜ guided</button>
      <button class="mb-tool" id="demoBtn" type="button" title="watch the optimal keystrokes replay through the real engine">${ICO.play}solution</button>` : ''}
      <button class="mb-tool" id="platBtn" type="button" title="the platform your keys follow"></button>
      <button class="mb-tool" id="ghostToggle" type="button" ${graded ? '' : 'disabled title="Ghost arrives with timed play"'}>${ICO.ghost}<span id="ghostLabel">ghost</span></button>
      <span class="mb-spacer"></span>
      <button class="mb-tool" id="soundToggle" type="button" aria-pressed="false" title="key sounds"></button>
      <button class="mb-tool mb-icon" id="fsToggle" type="button" title="fullscreen (Esc to exit)" aria-label="fullscreen">${ICO.fs}</button>
    </div></div>
    <div class="stage drill-stage">
      <div class="stage-row">
        <div class="stage-main drill-host" id="drillHost"></div>
        <aside class="task-panel" id="taskPanel"></aside>
      </div>
      <div id="sheetTabs"></div>
    </div>
    <div class="bar drill-status">
      <div class="stat">time <b id="drTime">0.00</b> · keys <b id="drKeys">0</b>${graded ? ` · optimal ~<b>${drill.optimalKeys}</b>` : ''}</div>
      ${graded ? `<div class="stat pars-line">pass <b id="parPass">${drill.pars.pass}s</b> · pro <b id="parPro">${drill.pars.pro}s</b> · legendary <b id="parLeg">${drill.pars.legendary}s</b> · best <b id="drPb">—</b></div>
      <div class="pace" id="paceBar" title="your run against the pars and your best"><i id="paceFill"></i><s id="mkLeg"></s><s id="mkPro"></s><s id="mkPass"></s><u id="mkPb"></u></div>`
      : `<div class="stat">pass <b id="parPass">—</b> · pro <b id="parPro">—</b> · legendary <b id="parLeg">—</b><span class="muted"> · nothing is graded in the sandbox</span></div>`}
      <div class="spacer"></div>
      <button class="btn btn-ghost" id="drReset" type="button">${graded ? 'Retry' : 'Reset sheet'}</button>
    </div>`;
  root.appendChild(el);
  const $ = q => el.querySelector('#' + q);

  /* ---------------- shared bar tools ---------------- */
  function paintPlatform() {
    p = prefs.get();
    $('platBtn').textContent = p.platform === 'mac' ? '⌘ mac keys' : 'win keys';
    $('platBtn').setAttribute('aria-label', 'platform: ' + (p.platform === 'mac' ? 'Mac' : 'Windows') + ', click to switch');
    el.querySelectorAll('.cl-keys').forEach(s => { s.innerHTML = s.dataset.keys.split(' ').map(k => `<kbd>${esc(keyLabel(k, p.platform))}</kbd>`).join(' '); });
  }
  $('platBtn').onclick = () => { prefs.set({ platform: prefs.get().platform === 'mac' ? 'win' : 'mac' }); paintPlatform(); renderPanel(); showToast('Keys follow ' + (prefs.get().platform === 'mac' ? 'Mac' : 'Windows')); };
  $('fsToggle').onclick = () => {
    const on = document.documentElement.classList.toggle('hk-fs');
    $('fsToggle').classList.toggle('on', on);
    try { if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); else if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } catch (e) { /* not allowed */ }
  };
  const onFsChange = () => { if (!document.fullscreenElement) { document.documentElement.classList.remove('hk-fs'); $('fsToggle').classList.remove('on'); } };
  document.addEventListener('fullscreenchange', onFsChange);

  /* ================================================================ sandbox */
  if (!graded) {
    const SB_OPTS = { modeBar: false, ribbonMode: 'slim' };
    let sb = mountSandbox($('drillHost'), SB_OPTS);
    let tabs = mountSheetTabs($('sheetTabs'), sb.session);
    $('taskPanel').innerHTML = `
      <div class="cl-head">task <span>sandbox</span></div>
      <p class="task-text">${esc(drill.task)}</p>
      <div class="cl-list">${drill.suggestions.map(s => `<div class="cl-item"><span class="cl-box"></span><span class="cl-label">${esc(s.text)}</span><span class="cl-keys" data-keys="${esc(s.keys)}"></span></div>`).join('')}</div>
      <div class="help-panel" id="drHelp" hidden>
        <div class="help-goal">Help: hints, guided and the solution, in one place.</div>
        <p class="help-note">In a timed drill this is where hints, the guided walk-through and the solution replay live. Using any of them means no personal best and no board entry for that run. The sandbox has nothing to grade, so read on and try things.</p>
      </div>
      <div class="cl-esc"><kbd>Esc</kbd> backs out of the Ribbon or a dialog box · <kbd data-plat="undo"></kbd> undoes</div>`;
    const tickH = setInterval(() => {
      if (!sb) return;
      const t0 = sb.session.t0; $('drTime').textContent = t0 == null ? '0.00' : fmtClock((Date.now() - t0) / 1000);
      $('drTime').classList.toggle('run', t0 != null);
      $('drKeys').textContent = String(sb.session.keyLog.length);
    }, 100);
    const fx = () => (sb && sb.fx && typeof sb.fx.isMuted === 'function') ? sb.fx : null;
    const isMuted = () => { const f = fx(); return f ? f.isMuted() : prefs.get().mute; };
    const setMuted = m => { const f = fx(); if (f) f.setMuted(m); prefs.set({ mute: m }); };
    if (prefs.get().mute && fx() && !fx().isMuted()) fx().setMuted(true);
    function paintSound() { const m = isMuted(); const b = $('soundToggle'); b.innerHTML = (m ? ICO.mute : ICO.sound) + (m ? 'sound off' : 'sound on'); b.setAttribute('aria-pressed', m ? 'false' : 'true'); b.classList.toggle('on', !m); }
    el.querySelector('[data-plat="undo"]').textContent = keyLabel('Ctrl+Z', p.platform);
    paintPlatform(); paintSound();
    $('helpToggle').onclick = () => { helpOpen = !helpOpen; $('drHelp').hidden = !helpOpen; $('helpToggle').classList.toggle('on', helpOpen); $('helpToggle').setAttribute('aria-pressed', String(helpOpen)); };
    $('soundToggle').onclick = () => { const m = !isMuted(); setMuted(m); paintSound(); showToast(m ? 'Sound off' : 'Sound on'); };
    $('drReset').onclick = () => { if (sb) sb.destroy(); if (tabs) tabs.destroy(); sb = mountSandbox($('drillHost'), SB_OPTS); tabs = mountSheetTabs($('sheetTabs'), sb.session); showToast('Sheet reset'); $('drReset').blur(); };
    const onKey = e => {
      if (e.key === 'F1') { e.preventDefault(); $('helpToggle').click(); }
      if (e.key === 'Escape' && document.documentElement.classList.contains('hk-fs') && !document.fullscreenElement) { document.documentElement.classList.remove('hk-fs'); $('fsToggle').classList.remove('on'); }
    };
    document.addEventListener('keydown', onKey);
    return {
      get sandbox() { return sb; },
      destroy() {
        clearInterval(tickH);
        document.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFsChange);
        document.documentElement.classList.remove('hk-fs');
        if (sb) sb.destroy(); sb = null; if (tabs) tabs.destroy(); tabs = null;
        el.remove();
      },
    };
  }

  /* ================================================================ graded drill */
  const effects = mountEffects();
  const overlay = document.createElement('div');
  overlay.className = 'lesson-done drill-done'; overlay.hidden = true; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
  root.appendChild(overlay);

  let run = null, sheetView = null, ribbonView = null, tabs = null, keycaps = null, ghostEl = null, startCard = null;
  let pbBefore = store.pb(drill.id);
  let ghostTrace = store.trace(drill.id);

  function mountRun() {
    if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (tabs) tabs.destroy(); if (keycaps) keycaps.destroy();
    stopReplay();
    $('drillHost').innerHTML = '<div class="ribbon-slot"><div class="ribbon"></div></div>';
    run = new DrillRun(drill, {
      onToast: showToast,
      onRefuse: () => { effects.refuse(); if (sheetView && sheetView.shake) sheetView.shake(); },
      seedCells: daily ? daily.seedCells : null,
      seed: daily ? daily.seed : null,
      kind: daily ? 'daily' : 'drill',
    });
    sheetView = new SheetView($('drillHost'), run.session);
    ribbonView = new RibbonView($('drillHost').querySelector('.ribbon'), run.session, { mode: 'slim' });
    tabs = mountSheetTabs($('sheetTabs'), run.session);
    keycaps = mountKeycaps(run.session);
    // the clock lives in the formula bar, as the old trainer had it
    const t = document.createElement('span'); t.className = 'ftimer'; t.id = 'drClock'; t.textContent = '0.00';
    sheetView.fbar.insertBefore(t, sheetView.fbar.querySelector('.fx-actions'));
    // the PB ghost: a faint outline cursor inside the scroll box; never focusable, never filled (§6a)
    ghostEl = document.createElement('div'); ghostEl.className = 'ghost-cursor'; ghostEl.hidden = true;
    sheetView.gw.appendChild(ghostEl);
    run.onChange(() => {
      if (sheetView) { sheetView.render(); ribbonView.render(); }
      renderPanel(); paintStatus();
      if (run.finished && !finishedShown) finish();
    });
    started = false; finishedShown = false;
    pbBefore = store.pb(drill.id);
    ghostTrace = store.trace(drill.id);
    paintGhostBtn();
    showStartCard();
    renderPanel(); paintStatus();
    sheetView.render(); ribbonView.render();
    focusStage();
  }

  function showStartCard() {
    if (startCard) startCard.remove();
    startCard = document.createElement('div');
    startCard.className = 'start-card';
    startCard.innerHTML = `<div class="sc-inner">${daily ? `<div class="sc-cat">◆ The Daily · ${esc(dayOf())} · the same drill for everyone</div><div class="sc-title">${esc(drill.title)}</div>` : `<div class="sc-title">Press any key to start</div>`}
      <div class="sc-sub">${daily ? 'Press any key to start — the clock starts on your first key, and that one never lands on the sheet.' : 'The clock starts on your first key — this one never lands on the sheet.'}</div>
      <div class="sc-pars">pass ${drill.pars.pass}s · pro ${drill.pars.pro}s · legendary ${drill.pars.legendary}s${pbBefore ? ` · your best ${fmtSecs(pbBefore.secs)}s` : ''}${daily ? ` · attempts today: ${attemptsToday()}` : ''}</div></div>`;
    $('drillHost').appendChild(startCard);
  }
  function dismissStartCard() { started = true; if (startCard) { startCard.remove(); startCard = null; } effects.clockStart(); track('drill_start', { drill_id: drill.id }); }

  function focusStage() {
    const host = $('drillHost'); if (!host.hasAttribute('tabindex')) host.setAttribute('tabindex', '-1');
    try { host.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  /* ---------------- task panel: checkpoints ---------------- */
  function renderPanel() {
    const panel = $('taskPanel');
    const states = run.goalStates();
    const showKeysFor = g => guided || (helpOpen && g.current);
    panel.innerHTML = `
      <div class="cl-head">task <span>${run.doneCount} / ${run.goals.length}</span></div>
      <p class="task-text">${esc(drill.task)}</p>
      <div class="cl-list">${states.map(g => `
        <div class="cl-item ${g.done ? 'done' : g.current ? 'current' : ''}">
          <span class="cl-box">${g.done ? '✓' : ''}</span>
          <span class="cl-label">${esc(g.text)}</span>
          ${showKeysFor(g) && g.keys ? `<span class="cl-keys" data-keys="${esc(g.keys)}"></span>` : ''}
        </div>`).join('')}</div>
      ${helpOpen || guided ? `<p class="help-note">Help is on: this run sets no personal best and posts no time.</p>` : ''}
      <div class="cl-esc"><kbd>Esc</kbd> backs out of the Ribbon or a dialog box · <kbd>${esc(keyLabel('Ctrl+Z', p.platform))}</kbd> undoes</div>`;
    el.querySelectorAll('.cl-keys').forEach(s => { s.innerHTML = s.dataset.keys.split(' ').map(k => k.startsWith('"') ? `<span class="kx">type ${esc(k.slice(1, -1))}</span>` : /^(then|×\d+)$/.test(k) ? `<span class="kx">${esc(k)}</span>` : `<kbd>${esc(keyLabel(k, p.platform))}</kbd>`).join(' '); });
  }

  /* ---------------- status line, clock, pace, ghost ---------------- */
  function paintStatus() {
    $('drKeys').textContent = String(run.session.keyLog.length);
    const pb = store.pb(drill.id);
    $('drPb').textContent = pb ? fmtSecs(pb.secs) + 's' : '—';
  }
  function tick() {
    if (!run) return;
    const secs = run.elapsed;
    const clock = el.querySelector('#drClock'); if (clock) { clock.textContent = fmtClock(secs); clock.classList.toggle('run', run.startedAt != null && !run.finished); }
    $('drTime').textContent = fmtClock(secs);
    // par markers dim as each clock passes
    $('parLeg').classList.toggle('gone', secs > drill.pars.legendary);
    $('parPro').classList.toggle('gone', secs > drill.pars.pro);
    $('parPass').classList.toggle('gone', secs > drill.pars.pass);
    // pace bar: the run filling toward the pass clock; accent while ahead of your PB, neutral behind
    const span = drill.pars.pass * 1.2;
    const fill = $('paceFill'), pb = pbBefore;
    if (fill) {
      fill.style.width = Math.min(100, 100 * secs / span) + '%';
      fill.classList.toggle('behind', !!pb && secs > pb.secs);
      $('mkLeg').style.left = (100 * drill.pars.legendary / span) + '%';
      $('mkPro').style.left = (100 * drill.pars.pro / span) + '%';
      $('mkPass').style.left = (100 * drill.pars.pass / span) + '%';
      const mk = $('mkPb'); if (pb && pb.secs <= span) { mk.style.left = (100 * pb.secs / span) + '%'; mk.hidden = false; } else mk.hidden = true;
    }
    paintGhost(secs);
  }
  const tickH = setInterval(tick, 50);

  function paintGhostBtn() {
    const b = $('ghostToggle'), has = ghostTrace.length > 0;
    b.disabled = !has;
    b.title = has ? 'race a live ghost of your PB run' : 'the ghost appears once a clean run sets a personal best';
    $('ghostLabel').textContent = 'ghost: ' + (ghostOn && has ? 'on' : 'off');
    b.classList.toggle('on', ghostOn && has);
  }
  $('ghostToggle').onclick = () => { ghostOn = !ghostOn; prefs.set({ ghost: ghostOn }); paintGhostBtn(); if (!ghostOn && ghostEl) ghostEl.hidden = true; $('ghostToggle').blur(); };
  function paintGhost(secs) {
    if (!ghostEl) return;
    if (!ghostOn || !ghostTrace.length || run.startedAt == null || run.finished) { ghostEl.hidden = true; return; }
    const ms = secs * 1000;
    let cell = null;
    for (const e of ghostTrace) { if (e.t <= ms && e.cell) cell = e.cell; if (e.t > ms) break; }
    if (!cell) { ghostEl.hidden = true; return; }
    const r = sheetView.cellRect(cell);
    if (!r) { ghostEl.hidden = true; return; }
    ghostEl.style.left = r.left + 'px'; ghostEl.style.top = r.top + 'px';
    ghostEl.style.width = r.width + 'px'; ghostEl.style.height = r.height + 'px';
    ghostEl.hidden = false;
  }

  /* ---------------- the help ladder (any rung marks the run helped) ---------------- */
  function setHints(on) { helpOpen = on; if (on) run.markHelped(); $('helpToggle').classList.toggle('on', on); $('helpToggle').setAttribute('aria-pressed', String(on)); renderPanel(); }
  $('helpToggle').onclick = () => { setHints(!helpOpen); $('helpToggle').blur(); };
  $('guideToggle').onclick = () => { guided = !guided; if (guided) run.markHelped(); $('guideToggle').classList.toggle('on', guided); $('guideToggle').setAttribute('aria-pressed', String(guided)); renderPanel(); $('guideToggle').blur(); };
  function stopReplay() { if (replay && replay.timer) clearInterval(replay.timer); replay = null; }
  $('demoBtn').onclick = () => {
    if (replay || run.finished) return;
    run.markHelped();
    dismissStartCard();
    replay = { steps: run.demoSteps({ demo: { script: drill.solution } }), i: 0, timer: null };
    $('demoBtn').classList.add('on');
    showToast('Watching the solution — this run is assisted');
    replay.timer = setInterval(() => {
      if (!replay) return;
      if (replay.i < replay.steps.length) { run.demoStep(replay.steps[replay.i++]); return; }
      stopReplay(); $('demoBtn').classList.remove('on');
    }, 250);
    $('demoBtn').blur();
  };

  /* ---------------- sound ---------------- */
  function paintSound() { const m = effects.isMuted(); const b = $('soundToggle'); b.innerHTML = (m ? ICO.mute : ICO.sound) + (m ? 'sound off' : 'sound on'); b.setAttribute('aria-pressed', m ? 'false' : 'true'); b.classList.toggle('on', !m); }
  if (prefs.get().mute && !effects.isMuted()) effects.setMuted(true);
  $('soundToggle').onclick = () => { const m = !effects.isMuted(); effects.setMuted(m); prefs.set({ mute: m }); paintSound(); showToast(m ? 'Sound off' : 'Sound on'); };
  paintPlatform(); paintSound(); paintGhostBtn();

  /* ---------------- finish: record, stamp, offer the retry ---------------- */
  function finish() {
    finishedShown = true;
    stopReplay(); $('demoBtn').classList.remove('on');
    const ctxBefore = gameCtx();
    const attempt = run.toAttempt();
    store.addAttempt(attempt);
    track('drill_complete', { drill_id: drill.id, secs: attempt.secs, tier: attempt.tier, clean: attempt.clean });
    const newPb = attempt.clean && (!pbBefore || attempt.secs < pbBefore.secs);
    effects.clockStop();
    effects.finish($('drillHost'));
    if (newPb) effects.newPB(); else if (attempt.tier !== 'none') effects.parTier(attempt.tier);
    celebrate(effects, ctxBefore);
    const eff = Math.min(100, Math.round(100 * drill.optimalKeys / Math.max(attempt.keys, drill.optimalKeys)));
    const pbAttempt = pbBefore ? store.attempts({ ref: drill.id }).find(a => a.id === pbBefore.attemptId) : null;
    const pbSplits = pbAttempt ? pbAttempt.splits : [];
    const splits = run.splits();
    overlay.innerHTML = `<div class="rm-card">
      <div class="rm-title">${attempt.clean ? (TIER_LABEL[attempt.tier] !== '—' ? TIER_LABEL[attempt.tier] + '!' : 'Finished') : 'Finished — assisted'}</div>
      <div class="rm-lesson">${esc(drill.title)}</div>
      <div class="rm-time">${fmtClock(attempt.secs)}<span>s</span></div>
      <div class="tier-stamps">${['pass', 'pro', 'legendary'].map(t => `<span class="tstamp ${attempt.clean && attempt.secs <= drill.pars[t] ? 'hit' : ''}">${TIER_LABEL[t]} ${drill.pars[t]}s</span>`).join('')}</div>
      <div class="rm-stats">
        <div>keys<b>${attempt.keys} / ~${drill.optimalKeys}</b></div>
        <div>efficiency<b>${eff}%</b></div>
        ${attempt.mouse ? `<div>mouse<b>×${attempt.mouse}</b></div>` : ''}
        <div>best<b>${newPb ? fmtSecs(attempt.secs) + 's ★ new' : pbBefore ? fmtSecs(pbBefore.secs) + 's' : '—'}</b></div>
      </div>
      ${attempt.clean ? '' : `<div class="rm-note">${attempt.helped ? 'Help was used, so no personal best and no posted time — the practice still counts.' : 'The mouse touched the workspace, so no personal best — the keyboard is the game.'}</div>`}
      <div class="splits">${run.goals.map((g, i) => {
        const mine = splits[i], theirs = pbSplits[i];
        const d = mine != null && theirs != null ? mine - theirs : null;
        return `<div class="split-row"><span class="sp-name">${esc(g.text)}</span><span class="sp-time">${mine == null ? '—' : fmtSecs(mine) + 's'}</span><span class="sp-delta ${d == null ? '' : d <= 0 ? 'ahead' : 'behind'}">${d == null ? '' : (d <= 0 ? '−' : '+') + fmtSecs(Math.abs(d))}</span></div>`;
      }).join('')}</div>
      ${daily ? `<div class="rm-note">Daily attempt ${attemptsToday()} today — the board is the same all day, so keep going.</div>` : ''}
      <div class="rm-opts">
        <button class="btn btn-primary" data-act="retry" type="button">Retry <kbd>Enter</kbd></button>
        ${daily ? '<button class="btn" data-act="share" type="button">Copy result</button>' : ''}
        ${next ? `<a class="btn" href="#/drill/${esc(next.id)}">Next drill</a>` : ''}
        <a class="btn" href="#/practice">All drills</a>
        <button class="btn btn-ghost" data-act="look" type="button">Look at the sheet <kbd>Esc</kbd></button>
      </div>
    </div>`;
    const share = overlay.querySelector('[data-act="share"]');
    if (share) share.onclick = () => {
      const text = shareText(dayOf(), drill.title, attempt.secs, attempt.tier);
      try { navigator.clipboard.writeText(text).then(() => showToast('Result copied'), () => showToast('Couldn’t copy — clipboard blocked')); }
      catch (e) { showToast('Couldn’t copy — clipboard blocked'); }
    };
    overlay.querySelector('[data-act="retry"]').onclick = () => retry();
    overlay.querySelector('[data-act="look"]').onclick = () => { overlay.hidden = true; focusStage(); };
    overlay.hidden = false;
    const b = overlay.querySelector('[data-act="retry"]'); if (b) b.focus();
  }
  function retry() {
    overlay.hidden = true;
    helpOpen = false; guided = false;
    $('helpToggle').classList.remove('on'); $('guideToggle').classList.remove('on');
    mountRun();
  }
  $('drReset').onclick = () => { retry(); $('drReset').blur(); };

  /* ---------------- keys ---------------- */
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  const onKeyDown = e => {
    if (isTyping(e.target)) return;
    if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') && (e.key === 'Enter' || e.key === ' ')) return;   // page controls keep their keys and never count (§6)
    if (e.key === 'F1') { e.preventDefault(); setHints(!helpOpen); return; }
    if (e.key === 'Escape' && document.documentElement.classList.contains('hk-fs') && !document.fullscreenElement) { document.documentElement.classList.remove('hk-fs'); $('fsToggle').classList.remove('on'); }
    if (!overlay.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); overlay.hidden = true; focusStage(); }
      else if (e.key === 'Enter' || e.key === 'r' || e.key === 'R' || e.key === 'n' || e.key === 'N') { e.preventDefault(); retry(); }
      return;
    }
    if (run.finished) { if (e.key === 'Enter' || e.key === 'r' || e.key === 'R' || e.key === 'n' || e.key === 'N') { e.preventDefault(); retry(); } return; }
    if (replay) { if (e.key === 'Escape') { e.preventDefault(); stopReplay(); $('demoBtn').classList.remove('on'); } return; }   // watching: your keys wait
    if (!started) {
      // the start card's key: dismiss and swallow — it never lands on the sheet
      if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift' || e.key === 'Meta') return;
      e.preventDefault(); dismissStartCard(); return;
    }
    if (run.key(e)) { e.preventDefault(); effects.armSounds(); }
  };
  const onKeyUp = e => { if (e.key === 'Alt') e.preventDefault(); };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp, { capture: true });

  mountRun();

  return {
    destroy() {
      clearInterval(tickH);
      stopReplay();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp, { capture: true });
      document.removeEventListener('fullscreenchange', onFsChange);
      document.documentElement.classList.remove('hk-fs');
      if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (tabs) tabs.destroy(); if (keycaps) keycaps.destroy();
      effects.destroy && effects.destroy();
      overlay.remove(); el.remove();
    },
  };
}
