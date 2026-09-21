// app2/app/lesson-view.js — the lesson workspace (SITE_SPEC §4): sheet and ribbon on the LEFT,
// the instructions panel on the RIGHT (Lesson | Help | Shortcuts used), a draggable, collapsible
// divider between them. Phases: Read → Guided (or Solo / Timed) → complete, with the centered
// completion overlay. Mouse works and is recorded (§6); every completed goal gets a tick and the
// finish gets a bigger one (§1, ui/effects.js).
import { LessonRun, shortcutsUsed } from './runner.js';
import { progress } from './progress.js';
import { nextLesson, chapterOf, lessonNumber } from '../content/index.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { mountEffects } from '../ui/effects.js';
import { showToast } from '../ui/toast.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** `Ctrl+1` → <kbd>Ctrl+1</kbd>; everything else escaped. */
const rich = s => esc(s).replace(/`([^`]+)`/g, (m, k) => `<kbd>${k}</kbd>`);
/**
 * A goal's keys: keycaps for keys, plain text for connectives ('then', '×5') and, as in a solution
 * script, a double-quoted run is text to type: '"1200" Enter' → type “1200” ⏎.
 */
const keysHtml = s => s ? (s.match(/"[^"]*"|\S+/g) || []).map(t => t.startsWith('"') ? `<span class="kx">type “${esc(t.slice(1, -1))}”</span>` :
  /^(then|×\d+|,|and|or|…)$/.test(t) || /^[a-z]/.test(t) && !/^[a-z]$/.test(t) ? `<span class="kx">${esc(t)}</span>` : `<kbd>${esc(t)}</kbd>`).join(' ') : '';

const PANEL_KEY = 'hk2_panel';
const PANEL_MIN = 280, PANEL_MAX = 640, PANEL_DEFAULT = 380;
function loadPanel() {
  try { const v = JSON.parse(localStorage.getItem(PANEL_KEY) || 'null'); if (v && typeof v === 'object') return { w: clampW(v.w), collapsed: !!v.collapsed }; } catch (e) { /* private window, blocked storage */ }
  return { w: PANEL_DEFAULT, collapsed: false };
}
function savePanel(p) { try { localStorage.setItem(PANEL_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ } }
function clampW(w) { return Number.isFinite(w) ? Math.min(PANEL_MAX, Math.max(PANEL_MIN, Math.round(w))) : PANEL_DEFAULT; }

/** The workspace stylesheet, linked once from the module's own location (the route loads lazily). */
function ensureCss() {
  if (document.getElementById('lessonCss')) return;
  const link = document.createElement('link'); link.id = 'lessonCss'; link.rel = 'stylesheet'; link.href = new URL('../ui/lesson.css', import.meta.url).href;
  document.head.appendChild(link);
}

export function mountLessonView(root, lesson, { mode = 'guided' } = {}) {
  ensureCss();
  const chapter = chapterOf(lesson);
  const fullRibbon = chapter && chapter.id === 'foundations';   // Chapter 1: the full ribbon bar is on by default (§4)
  const el = document.createElement('div');
  el.className = 'lesson';
  el.innerHTML = `
    <div class="lesson-main">
      <div class="stage" id="stage"><div class="stage-row"><div class="stage-main">
        <div class="ribbon-slot" id="ribbonSlot"><div class="ribbon" id="ribbon"></div></div>
        <div id="sheetMount"></div>
      </div></div></div>
    </div>
    <div class="lesson-divider" id="divider" role="separator" aria-orientation="vertical" aria-label="Lesson panel width. Arrow keys resize it, Enter hides or shows it." tabindex="0" title="Drag to resize the panel">
      <button class="divider-btn" id="collapseBtn" type="button"></button>
    </div>
    <aside class="lesson-panel" id="panel" aria-label="Lesson panel">
      <div class="panel-head">
        <div class="lesson-crumb"><a href="#/learn">Learn</a> › ${esc(chapter ? chapter.title : '')} › <span>${lessonNumber(lesson.id)}</span></div>
        <h1 class="lesson-title">${esc(lesson.title)}</h1>
        <div class="lesson-meta"><span class="diff diff-${esc(lesson.difficulty)}">${esc(lesson.difficulty)}</span> <span class="lesson-mode" id="lessonMode"></span> <span class="lesson-progress" id="lessonProgress"></span> <span class="lesson-timer" id="lessonTimer"></span><span class="lesson-tools" id="lessonTools"></span></div>
      </div>
      <div class="panel-tabs" role="tablist" aria-label="Panel">
        <button class="panel-tab" role="tab" id="tabLesson" type="button" aria-selected="true" aria-controls="panelBody" data-tab="lesson">Lesson</button>
        <button class="panel-tab" role="tab" id="tabHelp" type="button" aria-selected="false" aria-controls="panelBody" data-tab="help" tabindex="-1">Help <span class="tab-n">F1</span></button>
        <button class="panel-tab" role="tab" id="tabUsed" type="button" aria-selected="false" aria-controls="panelBody" data-tab="used" tabindex="-1">Shortcuts used</button>
      </div>
      <div class="panel-body" id="panelBody" role="tabpanel" aria-labelledby="tabLesson"></div>
      <div class="panel-actions" id="panelActions"></div>
    </aside>`;
  root.appendChild(el);
  const overlay = document.createElement('div');
  overlay.className = 'lesson-done'; overlay.hidden = true; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'doneTitle');
  root.appendChild(overlay);
  const $ = id => el.querySelector('#' + id);

  const keycaps = mountKeycaps();
  const effects = mountEffects();
  effects.mountMuteButton($('lessonTools'));

  let sheetView = null, ribbonView = null, timerH = null;
  let phase = mode === 'guided' ? 'teach' : 'play';   // 'teach' | 'play' | 'done'
  let tab = 'lesson';                                   // 'lesson' | 'help' | 'used'
  let revealed = false;      // keys shown on request in a solo or timed run: the run is assisted (§6)
  let nudgeAt = -1;          // the goal index a workspace mouse action happened on: show the keyboard nudge there
  let prevDone = 0;          // goals ticked so far, for the tick animation
  let panel = loadPanel();
  let firstEver = false;     // the first completion this device has seen: the save invitation (§3)
  let saveState = '';

  const run = new LessonRun(lesson, {
    mode,
    onKey: k => keycaps.flash(k),
    onToast: showToast,
    onRefuse: () => { effects.refuse(); if (sheetView && sheetView.shake) sheetView.shake(); },
    onMouse: what => onMouse(what),
  });
  progress.touch(lesson.id);

  /* ---------------- views ---------------- */
  function mountViews() {
    if (sheetView) sheetView.destroy();
    if (ribbonView) ribbonView.destroy();
    $('sheetMount').innerHTML = '';
    $('ribbonSlot').innerHTML = '<div class="ribbon" id="ribbon"></div>';
    sheetView = new SheetView($('sheetMount'), run.session);
    ribbonView = new RibbonView($('ribbon'), run.session, { mode: fullRibbon ? 'full' : 'slim' });
    run.onChange(what => {
      if (what === 'reset') return;
      ribbonView.render(); sheetView.render();
      if (run.finished && phase !== 'done') finish();
      renderPanel();
    });
    sheetView.render(); ribbonView.render();
  }

  /* ---------------- the panel ---------------- */
  const teachStep = () => lesson.steps.find(s => s.mode === 'teach');
  const modeLabel = () => phase === 'teach' ? 'Read' : run.mode === 'guided' ? 'Guided' : run.mode === 'solo' ? 'Solo' : 'Timed';
  const assisted = () => run.mode === 'guided' || revealed;

  function renderPanel() {
    $('lessonMode').textContent = modeLabel();
    $('lessonProgress').textContent = phase === 'teach' ? '' : `${run.doneCount} / ${run.goals.length}`;
    for (const b of el.querySelectorAll('.panel-tab')) { const on = b.dataset.tab === tab; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }
    $('panelBody').setAttribute('aria-labelledby', tab === 'lesson' ? 'tabLesson' : tab === 'help' ? 'tabHelp' : 'tabUsed');
    if (tab === 'lesson') renderLesson(); else if (tab === 'help') renderHelp(); else renderUsed();
    renderActions();
    renderTimer();
    $('collapseBtn').textContent = panel.collapsed ? 'Show lesson panel' : '›';
    $('collapseBtn').setAttribute('aria-label', panel.collapsed ? 'Show the lesson panel' : 'Hide the lesson panel');
    $('collapseBtn').setAttribute('aria-expanded', panel.collapsed ? 'false' : 'true');
  }

  function goalsHtml() {
    const states = run.goalStates(); const showKeys = run.mode === 'guided' || revealed;
    return `<div class="goal-progress"><i style="width:${Math.round(100 * run.doneCount / run.goals.length)}%"></i></div>
      <ol class="goals">${states.map((g, i) => `<li class="goal ${g.done ? 'done' : g.current ? 'current' : ''}" data-goal="${i}">
        <span class="goal-mark">${g.done ? '✓' : g.current ? '›' : ''}</span><span class="goal-text">${esc(g.text)}</span>
        ${showKeys && g.current && g.keys ? `<div class="goal-keys">${keysHtml(g.keys)}</div>` : ''}
        ${g.current && nudgeAt === i ? `<div class="goal-nudge">Try it with the keyboard${!showKeys && g.keys ? ': the Help tab shows the keys' : ''}.</div>` : ''}</li>`).join('')}</ol>`;
  }

  function renderLesson() {
    const body = $('panelBody');
    if (phase === 'teach') {
      const t = teachStep();
      body.innerHTML = `<h2>${esc(t.title)}</h2>` + t.body.map(p => `<p>${rich(p)}</p>`).join('') +
        `<p class="lesson-goalsintro">You will</p><ol class="goals goals-preview">${lesson.goals.map(g => `<li>${esc(g.text)}</li>`).join('')}</ol>`;
    } else if (phase === 'play') {
      body.innerHTML = goalsHtml();
      // Every goal has landed but an end-state predicate fails (something a goal produced was undone,
      // a value was changed): show those predicates so the learner sees what still needs to hold.
      const ends = run.endStates();
      if (run.doneCount === run.goals.length && !run.finished && ends.length) {
        body.innerHTML += `<p class="lesson-goalsintro">Still needed</p><ol class="goals goals-end">${ends.map(e => `<li class="goal ${e.ok ? 'done' : 'current'}">
          <span class="goal-mark">${e.ok ? '✓' : '›'}</span><span class="goal-text">${esc(e.text)}</span></li>`).join('')}</ol>`;
      }
      tickNewGoals();
      const cur = body.querySelector('.goal.current'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });   // the active goal is always visible (§4)
    } else {
      body.innerHTML = goalsHtml() + `<div class="done-card"><div class="done-title">Lesson complete</div>
        <div class="done-stats">${statsLine()}</div>
        <div class="done-actions">${doneButtonsHtml()}</div></div>`;
      wireDoneButtons(body);
    }
  }

  function renderHelp() {
    const p = $('panelBody');
    const notes = `<details class="help-notes"><summary>Read the notes again</summary><h2>${esc(teachStep().title)}</h2>${teachStep().body.map(t => `<p>${rich(t)}</p>`).join('')}</details>
      <div class="help-links"><a href="#/reference">Shortcut reference</a></div>`;
    if (phase === 'teach') { p.innerHTML = `<p class="help-note">Read the notes, then press <kbd>Enter</kbd> or Start. Each goal is checked as you go.</p>` + notes; return; }
    if (phase === 'done') { p.innerHTML = `<p class="help-note">Lesson complete. <kbd>Enter</kbd> continues.</p>` + notes; return; }
    const cur = run.current;   // the current goal, or the first failing end-state predicate once every goal has landed
    if (!cur) { p.innerHTML = `<p class="help-note">Every goal has landed.</p>` + notes; return; }
    const footer = `<p class="help-note">Press the keys one after another. <kbd>Esc</kbd> backs out of the Ribbon or a dialog box; <kbd>Ctrl+Z</kbd> undoes.</p>`;
    if (run.doneCount >= run.goals.length) {
      p.innerHTML = `<div class="help-goal">${esc(cur.text)}</div><p class="help-note">Every goal has landed, but the sheet is not yet as the lesson expects. Put this right and the lesson completes; <kbd>Ctrl+Z</kbd> undoes.</p>` + notes;
      return;
    }
    if (run.mode === 'guided' || revealed) {
      p.innerHTML = `<div class="help-goal">${esc(cur.text)}</div><div class="help-keys">${keysHtml(cur.keys || '')}</div>` + footer + notes;
    } else {
      p.innerHTML = `<div class="help-goal">${esc(cur.text)}</div>
        <p class="help-note">Reading is free. Showing the keys counts as help: this run is then marked assisted${run.mode === 'timed' ? ', and a timed run with help sets no personal best' : ''}.</p>
        <p><button class="btn" id="revealBtn" type="button">Show me the keys</button></p>` + footer + notes;
      p.querySelector('#revealBtn').onclick = () => { revealed = true; renderPanel(); };   // re-rendered: the button is gone, keys go to the sheet
    }
  }

  function renderUsed() {
    const p = $('panelBody');
    const used = shortcutsUsed(run.session.keyLog);
    const mouse = run.mouseCount;
    p.innerHTML = (used.length
      ? `<ul class="used-list">${used.map(u => `<li class="used-row"><span class="used-keys">${u.keys.split(' ').map(k => `<kbd>${esc(k)}</kbd>`).join(' ')}</span><span class="used-count">${u.count > 1 ? '×' + u.count : ''}</span></li>`).join('')}</ul>`
      : `<p class="used-empty">No shortcuts yet. They are listed here as you press them, with how often.</p>`) +
      (mouse ? `<p class="used-mouse">Mouse: ${mouse} ${mouse === 1 ? 'click' : 'clicks'} on the workspace. Allowed here; the keyboard is what you are practising.</p>` : '');
  }

  function renderActions() {
    const a = $('panelActions');
    if (phase === 'teach') {
      a.innerHTML = `<button class="btn btn-primary" id="startBtn" type="button">Start <kbd>Enter</kbd></button>`;
      $('startBtn').onclick = startPlay;
    } else if (phase === 'play') {
      a.innerHTML = `<button class="btn btn-ghost" id="restartBtn" type="button">Restart</button>`;
      $('restartBtn').onclick = () => { restart(run.mode); };
    } else a.innerHTML = '';
  }

  function renderTimer() {
    const t = $('lessonTimer');
    if (run.mode !== 'timed' || phase === 'teach') { t.textContent = ''; return; }
    t.textContent = run.elapsed.toFixed(1) + ' s' + (run.par ? ' / par ' + run.par : '');
  }

  /** Pop the tick on each goal that landed since the last render. */
  function tickNewGoals() {
    if (run.doneCount > prevDone) {
      for (let i = prevDone; i < run.doneCount; i++) { const li = el.querySelector(`.goal[data-goal="${i}"]`); if (li) effects.goalTick(li); }
      if (nudgeAt < run.doneCount) nudgeAt = -1;
    }
    prevDone = run.doneCount;
  }

  /* ---------------- completion ---------------- */
  const fmtSecs = s => s.toFixed(1);
  function statsLine() {
    const parts = [`<b>${run.startedAt == null ? '—' : fmtSecs(run.elapsed) + ' s'}</b>`, `<b>${run.session.keyLog.length}</b> keystrokes`, assisted() ? 'assisted' : 'solo'];
    if (run.mouseCount) parts.push(`mouse ×${run.mouseCount}`);
    if (run.mode === 'timed' && run.par) parts.push(`par ${run.par} s`);
    return parts.join(' · ');
  }
  function doneButtonsHtml() {
    const nxt = nextLesson(lesson.id);
    const alt = run.mode === 'guided' ? 'Try solo' : run.mode === 'solo' ? 'Try timed' : 'Try again';
    return `<button class="btn btn-primary" data-act="continue" type="button">${nxt ? 'Continue' : 'Back to Learn'} <kbd>Enter</kbd></button>
      <button class="btn" data-act="alt" type="button">${alt}</button>`;
  }
  function wireDoneButtons(scope) {
    const nxt = nextLesson(lesson.id);
    scope.querySelector('[data-act="continue"]').onclick = () => { location.hash = nxt ? '#/lesson/' + nxt.id : '#/learn'; };
    scope.querySelector('[data-act="alt"]').onclick = () => restart(run.mode === 'guided' ? 'solo' : run.mode === 'solo' ? 'timed' : 'timed');
    const look = scope.querySelector('[data-act="look"]'); if (look) look.onclick = closeOverlay;
  }
  function renderOverlay() {
    const secs = run.startedAt == null ? null : run.elapsed;
    const best = progress.get(lesson.id); const pb = best && Number.isFinite(best.best) ? best.best : null;
    overlay.innerHTML = `<div class="rm-card">
      <div class="rm-title" id="doneTitle">Lesson complete</div>
      <div class="rm-lesson">${lessonNumber(lesson.id)} · ${esc(lesson.title)} · ${modeLabel()}</div>
      <div class="rm-time">${secs == null ? '—' : fmtSecs(secs)}<span>s</span></div>
      <div class="rm-stats"><div>keystrokes<b>${run.session.keyLog.length}</b></div><div>help<b>${assisted() ? 'Assisted' : 'Solo'}</b></div>${run.mouseCount ? `<div>mouse<b>×${run.mouseCount}</b></div>` : ''}${run.mode === 'timed' && run.par ? `<div>par<b>${run.par} s</b></div>` : ''}</div>
      ${run.mode === 'timed' ? `<div class="rm-note">${!assisted() && !run.mouseCount ? (pb != null ? `personal best <b>${fmtSecs(pb)} s</b>` : '') : 'help or mouse in a timed run: no personal best'}</div>` : ''}
      ${run.mode === 'guided' && !revealed ? `<div class="rm-note">Try solo does it again without the keys shown.</div>` : ''}
      ${firstEver ? `<div class="rm-save"><b>Your first lesson is done.</b> Progress is saved on this device. Sign-in, which keeps it across devices, arrives in the next phase; see <a href="#/account">Account</a>.</div>` : ''}
      <div class="rm-opts">${doneButtonsHtml()}<button class="btn btn-ghost" data-act="look" type="button">Look at the sheet <kbd>Esc</kbd></button></div>
      <div class="rm-more">${esc(saveState)}</div>
    </div>`;
    wireDoneButtons(overlay);
    overlay.hidden = false;
    const primary = overlay.querySelector('[data-act="continue"]'); if (primary) primary.focus();
  }
  function closeOverlay() { overlay.hidden = true; el.querySelector('#panelBody').focus && el.querySelector('#panelBody').focus(); }
  function finish() {
    phase = 'done';
    const before = progress.all();
    firstEver = !Object.values(before).some(p => p.completed);
    const saved = progress.record(lesson.id, run.mode, run.elapsed, { clean: !assisted() && !run.mouseCount });
    saveState = saved ? 'Saved on this device' : 'Couldn’t save on this device (storage blocked); the lesson still counts for this visit';
    if (timerH) { clearInterval(timerH); timerH = null; }
    effects.finish($('stage'));
    tab = 'lesson';
    renderPanel();
    renderOverlay();
  }

  /* ---------------- phases ---------------- */
  function startPlay() {
    phase = 'play';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    renderPanel();
  }
  function restart(newMode) {
    phase = 'play'; revealed = false; nudgeAt = -1; prevDone = 0; overlay.hidden = true; tab = 'lesson';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    run.reset(newMode);
    mountViews();
    if (!timerH) timerH = setInterval(renderTimer, 200);
    renderPanel();
  }

  /* ---------------- mouse (§6): recorded, allowed in lessons, with a gentle keyboard nudge ---------------- */
  function onMouse(what) {
    if (phase !== 'play') return;
    if (run.session.t0 == null && run.session.startClock) run.session.startClock();   // the clock starts on the first action, mouse or key
    effects.armSounds();
    if (nudgeAt !== run.doneCount) { nudgeAt = run.doneCount; renderPanel(); }
  }

  /* ---------------- tabs ---------------- */
  const TABS = ['lesson', 'help', 'used'];
  function selectTab(name, focus) {
    tab = name; renderPanel();
    if (focus) { const b = el.querySelector(`.panel-tab[data-tab="${name}"]`); if (b) b.focus(); }
  }
  // A tab picked with the mouse hands the keyboard straight back to the sheet (focus stays on the
  // tab list only when it was reached by keyboard, where the arrow keys switch tabs).
  el.querySelector('.panel-tabs').addEventListener('click', e => { const b = e.target.closest('.panel-tab'); if (b) { selectTab(b.dataset.tab); b.blur(); } });
  el.querySelector('.panel-tabs').addEventListener('keydown', e => {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); selectTab(TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length], true); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); e.stopPropagation(); selectTab(e.key === 'Home' ? TABS[0] : TABS[TABS.length - 1], true); }
  });

  /* ---------------- divider: drag, keyboard, collapse ---------------- */
  const divider = $('divider');
  function applyPanel() {
    el.style.setProperty('--panel-w', panel.w + 'px');
    el.classList.toggle('panel-collapsed', panel.collapsed);
    divider.setAttribute('aria-valuenow', String(panel.w)); divider.setAttribute('aria-valuemin', String(PANEL_MIN)); divider.setAttribute('aria-valuemax', String(PANEL_MAX));
    if (sheetView) requestAnimationFrame(() => sheetView.render());
  }
  function setPanelW(w) { panel.w = clampW(w); applyPanel(); }
  function toggleCollapse() { panel.collapsed = !panel.collapsed; savePanel(panel); applyPanel(); renderPanel(); }
  let drag = null;
  divider.addEventListener('pointerdown', e => {
    if (e.target.closest('.divider-btn') || panel.collapsed) return;
    drag = { x: e.clientX, w: panel.w }; divider.classList.add('dragging'); divider.setPointerCapture(e.pointerId); e.preventDefault();
  });
  divider.addEventListener('pointermove', e => { if (drag) setPanelW(drag.w + (drag.x - e.clientX)); });
  const endDrag = () => { if (!drag) return; drag = null; divider.classList.remove('dragging'); savePanel(panel); };
  divider.addEventListener('pointerup', endDrag); divider.addEventListener('pointercancel', endDrag);
  divider.addEventListener('keydown', e => {
    if (e.target !== divider) return;
    if (e.key === 'ArrowLeft') { setPanelW(panel.w + 24); savePanel(panel); }
    else if (e.key === 'ArrowRight') { setPanelW(panel.w - 24); savePanel(panel); }
    else if (e.key === 'Home') { setPanelW(PANEL_DEFAULT); savePanel(panel); }
    else if (e.key === 'Enter' || e.key === ' ') toggleCollapse();
    else return;
    e.preventDefault(); e.stopPropagation();
  });
  $('collapseBtn').onclick = () => { toggleCollapse(); $('collapseBtn').blur(); };
  applyPanel();

  /* ---------------- keys: the whole page is the workspace ---------------- */
  function onKey(e) {
    const t = e.target; const tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (t && (t.closest('.panel-tabs') || t === divider)) return;   // handled by their own listeners
    if (e.key === 'F1') { e.preventDefault(); selectTab(tab === 'help' ? 'lesson' : 'help'); return; }
    if (!overlay.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); }
      else if (e.key === 'Enter' && !(tag === 'BUTTON' || tag === 'A')) { e.preventDefault(); overlay.querySelector('[data-act="continue"]').click(); }
      return;
    }
    if ((tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY') && (e.key === 'Enter' || e.key === ' ')) return;   // the control handles its own activation
    if (phase === 'teach') { if (e.key === 'Enter') { e.preventDefault(); startPlay(); } return; }
    if (phase === 'done') { if (e.key === 'Enter') { e.preventDefault(); const c = el.querySelector('[data-act="continue"]'); if (c) c.click(); } return; }
    if (run.key(e)) { e.preventDefault(); effects.armSounds(); }
  }
  function onKeyUp(e) { if (e.key === 'Alt') e.preventDefault(); }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  timerH = setInterval(renderTimer, 200);

  mountViews();
  renderPanel();
  return {
    destroy() {
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp);
      if (timerH) clearInterval(timerH);
      if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy();
      keycaps.destroy(); if (effects.destroy) effects.destroy();
      overlay.remove(); el.remove();
    },
  };
}
