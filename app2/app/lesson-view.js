// app2/app/lesson-view.js — the lesson workspace (SITE_SPEC §4): sheet and ribbon on the LEFT,
// the instructions panel on the RIGHT (Lesson | Help | Shortcuts used), a draggable, collapsible
// divider between them. Phases: Read → Guided (or Solo / Timed) → complete, with the centered
// completion overlay. Mouse works and is recorded (§6); every completed goal gets a tick and the
// finish gets a bigger one (§1, ui/effects.js).
import { LessonRun, shortcutsUsed } from './runner.js';
import { parseKeyScript } from '../engine/keyboard.js';
import { store } from './store.js';
import { attemptId, dayOf, traceOf } from './records.js';
import { gameCtx, celebrate } from './stats.js';
import { track } from './telemetry.js';
import { nextLesson, chapterOf, lessonNumber, moduleOf } from '../content/index.js';
import { CONVENTIONS } from '../content/conventions.js';
import { ring } from '../ui/ring.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountSheetTabs } from '../ui/sheet-tabs.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { mountEffects } from '../ui/effects.js';
import { showToast } from '../ui/toast.js';
import { keyLabel } from './prefs.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** A keycap: the chord as the learner's platform shows it (Ctrl → ⌘, Alt → ⌥ on a Mac). */
const kbd = k => `<kbd>${esc(keyLabel(k))}</kbd>`;
/** `Ctrl+1` → <kbd>Ctrl+1</kbd>; everything else escaped. */
const rich = s => esc(s).replace(/`([^`]+)`/g, (m, k) => kbd(k));
/**
 * A goal's keys: keycaps for keys, plain text for connectives ('then', '×5') and, as in a solution
 * script, a double-quoted run is text to type: '"1200" Enter' → type “1200” ⏎.
 */
const keysHtml = s => s ? (s.match(/"[^"]*"|\S+/g) || []).map(t => t.startsWith('"') ? `<span class="kx">type “${esc(t.slice(1, -1))}”</span>` :
  /^(then|×\d+|,|and|or|…)$/.test(t) || /^[a-z]/.test(t) && !/^[a-z]$/.test(t) ? `<span class="kx">${esc(t)}</span>` : kbd(t)).join(' ') : '';

const PANEL_KEY = 'hk2_panel';
const PANEL_MIN = 300, PANEL_MAX = 560, PANEL_DEFAULT = 380;   // the divider moves within these limits; the panel is always visible (§4)
function loadPanel() {
  try { const v = JSON.parse(localStorage.getItem(PANEL_KEY) || 'null'); if (v && typeof v === 'object') return { w: clampW(v.w) }; } catch (e) { /* private window, blocked storage */ }
  return { w: PANEL_DEFAULT };
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
  const timedOnly = lesson.kind === 'assessment' || lesson.kind === 'testout';   // these run against the clock, no help, no other mode
  if (timedOnly) mode = 'timed';
  const isChallenge = lesson.kind === 'challenge';   // the module challenge: seeded, all goals at once, countdown, tier pars (C2)
  if (isChallenge) mode = 'challenge';
  const el = document.createElement('div');
  el.className = 'lesson';
  el.innerHTML = `
    <div class="lesson-main">
      <div class="stage" id="stage"><div class="stage-row"><div class="stage-main">
        <div class="ribbon-slot" id="ribbonSlot"><div class="ribbon" id="ribbon"></div></div>
        <div id="sheetMount"></div>
      </div></div><div id="sheetTabs"></div></div>
    </div>
    <div class="lesson-divider" id="divider" role="separator" aria-orientation="vertical" aria-label="Lesson panel width. Arrow keys resize it, Home resets it." tabindex="0" title="Drag to resize the panel"></div>
    <aside class="lesson-panel" id="panel" aria-label="Lesson panel">
      <div class="panel-head">
        <div class="lesson-crumb"><a href="#/learn">Learn</a> › ${esc(chapter ? chapter.title : '')} › <span>${lessonNumber(lesson.id)}</span></div>
        <h1 class="lesson-title">${esc(lesson.title)}</h1>
        <div class="module-line" id="moduleLine"></div>
        <div class="lesson-meta"><span class="diff diff-${esc(lesson.difficulty)}">${esc(lesson.difficulty)}</span> <span class="lesson-mode" id="lessonMode"></span> <span class="lesson-progress" id="lessonProgress"></span> <span class="lesson-timer" id="lessonTimer"></span><span class="lesson-tools" id="lessonTools"></span></div>
      </div>
      <div class="panel-tabs" role="tablist" aria-label="Panel">
        <button class="panel-tab" role="tab" id="tabLesson" type="button" aria-selected="true" aria-controls="panelBody" data-tab="lesson">Lesson</button>
        <button class="panel-tab" role="tab" id="tabHelp" type="button" aria-selected="false" aria-controls="panelBody" data-tab="help" tabindex="-1">Help <span class="tab-n">F1</span></button>
        <button class="panel-tab" role="tab" id="tabUsed" type="button" aria-selected="false" aria-controls="panelBody" data-tab="used" tabindex="-1">Shortcuts used</button>
      </div>
      <div class="task-card" id="taskCard" aria-live="polite"></div>
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

  let sheetView = null, ribbonView = null, sheetTabs = null, timerH = null;
  let phase = 'play';        // 'play' | 'done' — the sheet is live at once; the Read text sits at the top of the panel
  let demo = null;           // { goal, steps, i, timer } while the platform plays a demo goal for the learner to watch
  let ghost = null;          // { steps, i, timer, paused } while "Show me" replays the keys and puts the sheet back (C2 gap 9a)
  let tab = 'lesson';                                   // 'lesson' | 'help' | 'used'
  let revealed = false;      // keys shown on request in a solo or timed run: the run is assisted (§6)
  let nudgeAt = -1;          // the goal index a workspace mouse action happened on: show the keyboard nudge there
  let prevDone = 0;          // goals ticked so far, for the tick animation
  let panel = loadPanel();
  let firstEver = false;     // the first completion this device has seen: the save invitation (§3)
  let saveState = '';
  let lastClean = false;     // the finished run: no mouse, no help (the clean-sheet mark, §6)
  let lastTier = null;       // a clean challenge's tier from the pars, for the overlay stamp
  let xpGained = 0;          // what the run earned, for the overlay's count-up

  const run = new LessonRun(lesson, {
    mode,
    onKey: k => keycaps.flash(k),
    onToast: showToast,
    onRefuse: () => { effects.refuse(); if (sheetView && sheetView.shake) sheetView.shake(); },
    onMouse: what => onMouse(what),
  });
  store.touch(lesson.id);
  track('lesson_start', { lesson_id: lesson.id, mode: run.mode });

  /* ---------------- views ---------------- */
  function mountViews() {
    if (sheetView) sheetView.destroy();
    if (ribbonView) ribbonView.destroy();
    if (sheetTabs) sheetTabs.destroy();
    $('sheetMount').innerHTML = '';
    $('ribbonSlot').innerHTML = '<div class="ribbon" id="ribbon"></div>';
    sheetView = new SheetView($('sheetMount'), run.session);
    ribbonView = new RibbonView($('ribbon'), run.session, { mode: fullRibbon ? 'full' : 'slim' });
    sheetTabs = mountSheetTabs($('sheetTabs'), run.session);   // the workbook's sheet tabs, like Excel's strip along the bottom
    run.onChange(what => {
      if (what === 'reset') return;
      ribbonView.render(); sheetView.render();
      if (run.finished && phase !== 'done') finish();
      renderPanel();
      maybeStartDemo();
    });
    sheetView.render(); ribbonView.render();
  }

  /* ---------------- the panel ---------------- */
  const modeLabel = () => run.mode === 'guided' ? 'Guided' : run.mode === 'solo' ? 'Solo' : run.mode === 'challenge' ? 'Challenge' : 'Timed';
  /** Keys show on the goal line only where the goal introduces a shortcut (its teach line) in Guided mode, or after Help revealed them (§4). */
  const keysShown = g => (run.mode === 'guided' && !!g.teach) || revealed;
  const raceOf = id => (lesson.race || []).find(r => r.slow === id || r.fast === id);
  const fmtSecs = s => s.toFixed(1);
  // Guided is the normal way to complete a lesson and is NOT assistance (SITE_SPEC §4): only
  // revealing extra steps through Help ("Show me") marks the attempt assisted.
  const assisted = () => revealed;

  function renderPanel() {
    $('lessonMode').textContent = modeLabel();
    $('lessonProgress').textContent = `${run.doneCount} / ${run.goals.length}`;
    for (const b of el.querySelectorAll('.panel-tab')) { const on = b.dataset.tab === tab; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }
    $('panelBody').setAttribute('aria-labelledby', tab === 'lesson' ? 'tabLesson' : tab === 'help' ? 'tabHelp' : 'tabUsed');
    renderModuleLine();
    renderTaskCard();
    if (tab === 'lesson') renderLesson(); else if (tab === 'help') renderHelp(); else renderUsed();
    renderActions();
    renderTimer();
  }

  /** "Lesson n of m · Module k of 7" with the module's ring; empty for the legacy lessons. */
  function renderModuleLine() {
    const slot = $('moduleLine'); if (!slot) return;
    const at = moduleOf(lesson);
    if (!at) { slot.innerHTML = ''; slot.hidden = true; return; }
    const all = store.all();
    const doneInModule = at.module.lessons.filter(l => { const p = all[l.id]; return (p && p.completed) || l.id === lesson.id && phase === 'done'; }).length;
    slot.hidden = false;
    slot.innerHTML = `${ring(doneInModule, at.module.lessons.length, { size: 20 })} ${lesson.kind === 'challenge'
      ? `<span>Challenge · Module ${at.k} of ${at.of7}</span>`
      : `<span>Lesson ${at.n} of ${at.of} · Module ${at.k} of ${at.of7}</span>`}`;
  }

  /** The one thing to do now, pinned above the scrolling body: goal + teach + keys + convention. */
  function renderTaskCard() {
    const card = $('taskCard'); if (!card) return;
    if (phase === 'done') { card.innerHTML = ''; return; }
    // A challenge pins the whole worklist: all goals at once, ticked as they land.
    if (lesson.kind === 'challenge') {
      const states = run.goalStates();
      const grader = run.doneCount === run.goals.length ? run.graderStates().find(g => !g.ok) : null;
      card.innerHTML = `<div class="task-label">Challenge <span class="task-count">${run.doneCount} / ${run.goals.length}</span></div>
        <ul class="task-list">${states.map(g => `<li class="${g.done ? 'done' : ''}">${esc(g.text)}</li>`).join('')}</ul>
        ${grader ? `<div class="task-extra">${esc(grader.why)}</div>` : ''}`;
      return;
    }
    if (ghost) {
      card.innerHTML = `<div class="task-label">Watch</div>
        <div class="task-goal">${esc(run.current ? run.current.text : '')}</div>
        <div class="task-extra">The keys play on the sheet, then it goes back as it was. <kbd>Esc</kbd> hands back now; <kbd>←</kbd> <kbd>→</kbd> step.</div>`;
      return;
    }
    const cur = run.current;
    if (!cur) { card.innerHTML = ''; return; }
    const isGoal = !!cur.keys || !cur.grader && run.doneCount < run.goals.length;
    const conv = cur.convention && CONVENTIONS[cur.convention];
    card.innerHTML = `<div class="task-label">${isGoal ? 'Now' : 'Still needed'} <span class="task-count">${run.doneCount} / ${run.goals.length}</span></div>
      <div class="task-goal">${esc(cur.text)}</div>
      ${isGoal && run.mode === 'guided' && cur.teach ? `<div class="task-teach">${rich(cur.teach)}</div>` : ''}
      ${isGoal && keysShown(cur) && cur.keys ? `<div class="task-keys">${keysHtml(cur.keys)}</div>` : ''}
      ${isGoal && nudgeAt === run.doneCount ? `<div class="goal-nudge">Try it with the keyboard${!keysShown(cur) && cur.keys ? ': the Help tab shows the keys' : ''}.</div>` : ''}
      ${conv ? `<span class="conv-chip" title="${esc(conv.name)}">${esc(cur.convention)} · ${esc(conv.short)}</span>` : ''}`;
  }

  function goalsHtml() {
    const states = run.goalStates(); const splits = run.splits();
    return `<div class="goal-progress"><i style="width:${Math.round(100 * run.doneCount / run.goals.length)}%"></i></div>
      <ol class="goals">${states.map((g, i) => {
        const race = raceOf(g.id);
        // the current goal's teach, keys and nudge live in the pinned task card; the list stays lean
        const watching = g.current && demo && demo.goal.id === g.id;
        return `<li class="goal ${g.done ? 'done' : g.current ? 'current' : ''}${watching ? ' watching' : ''}" data-goal="${i}">
        <span class="goal-mark">${g.done ? '✓' : g.current ? (watching ? '▶' : '›') : ''}</span><span class="goal-text">${esc(g.text)}${race && g.done && splits[i] != null ? ` <span class="goal-split">${fmtSecs(splits[i])} s</span>` : race && g.current ? ` <span class="goal-split live" data-goal-clock="${i}">0.0 s</span>` : ''}${watching ? ` <span class="goal-demo">watching · Esc skips</span>` : ''}</span></li>`; }).join('')}</ol>`;
  }

  /** The brief, one line until opened: the first sentence as the summary, the rest behind it. */
  function briefHtml() {
    const text = String(lesson.brief || lesson.read || '');
    if (!text) return '';
    const first = (text.split(/(?<=\.)\s+/)[0] || text);
    const rest = text.slice(first.length).trim();
    return `<details class="lesson-brief"><summary>${rich(first)}</summary>${rest ? `<p>${rich(rest)}</p>` : ''}</details>`;
  }

  function renderLesson() {
    const body = $('panelBody');
    if (phase !== 'done') {   // 'play', and 'timeup' behind its overlay: the goals as they stood
      body.innerHTML = briefHtml() + goalsHtml();
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
      body.innerHTML = goalsHtml() + `<div class="done-card"><div class="done-title">${doneTitle()}</div>
        ${raceHtml()}<div class="done-stats">${statsLine()}</div>
        <div class="done-actions">${doneButtonsHtml()}</div></div>`;
      wireDoneButtons(body);
    }
  }

  function renderHelp() {
    const p = $('panelBody');
    // Reading is always free (§6): the Read text and the teaching points introduced so far.
    const taught = lesson.goals.slice(0, Math.min(run.doneCount + 1, lesson.goals.length)).filter(g => g.teach);
    const notes = `<details class="help-notes"><summary>Read the notes again</summary><p>${rich(lesson.read || lesson.brief || '')}</p>${taught.length ? `<p class="lesson-goalsintro">Taught so far</p><ul class="help-taught">${taught.map(g => `<li>${rich(g.teach)}</li>`).join('')}</ul>` : ''}</details>
      <div class="help-links"><a href="#/reference">Shortcut reference</a></div>`;
    if (phase === 'done') { p.innerHTML = `<p class="help-note">Lesson complete. <kbd>Enter</kbd> continues.</p>` + notes; return; }
    const cur = run.current;   // the current goal, or the first failing end-state predicate once every goal has landed
    if (!cur) { p.innerHTML = `<p class="help-note">Every goal has landed.</p>` + notes; return; }
    const footer = `<p class="help-note">Press the keys one after another. <kbd>Esc</kbd> backs out of the Ribbon or a dialog box; ${kbd('Ctrl+Z')} undoes.</p>`;
    if (run.doneCount >= run.goals.length) {
      p.innerHTML = `<div class="help-goal">${esc(cur.text)}</div><p class="help-note">Every goal has landed, but the sheet is not yet as the lesson expects. Put this right and the lesson completes; ${kbd('Ctrl+Z')} undoes.</p>` + notes;
      return;
    }
    const goalLine = `<div class="help-goal">${cur.teach && run.mode === 'guided' ? `<span class="goal-teach">${rich(cur.teach)}</span> ` : ''}${esc(cur.text)}</div>`;
    if (keysShown(cur)) {
      p.innerHTML = goalLine + `<div class="help-keys">${keysHtml(cur.keys || '')}</div>` + footer + notes;
    } else if (timedOnly) {
      // No "Show me the keys" in an assessment or test-out: the run proves the chapter stuck.
      p.innerHTML = goalLine + `<p class="help-note">No help in ${lesson.kind === 'assessment' ? 'an assessment' : 'a test-out'}: every key this run needs was taught in the chapter${lesson.kind === 'testout' ? '’s lessons, which stay open if this run shows a gap' : ''}.</p>` + footer + notes;
    } else {
      p.innerHTML = goalLine +
        `<p class="help-note">Reading is free. Showing the keys counts as help: this attempt is then marked assisted${run.mode === 'timed' ? ', and a timed run with help sets no personal best' : ''}.</p>
        <p><button class="btn" id="revealBtn" type="button">Show me the keys</button></p>` + footer + notes;
      p.querySelector('#revealBtn').onclick = () => { revealed = true; startGhost(); };   // the ghost plays the keys on the sheet, then puts it back (C2 gap 9a)
    }
  }

  function renderUsed() {
    const p = $('panelBody');
    const used = shortcutsUsed(run.session.keyLog);
    const mouse = run.mouseCount;
    p.innerHTML = (used.length
      ? `<ul class="used-list">${used.map(u => `<li class="used-row"><span class="used-keys">${u.keys.split(' ').map(k => kbd(k)).join(' ')}</span><span class="used-count">${u.count > 1 ? '×' + u.count : ''}</span></li>`).join('')}</ul>`
      : `<p class="used-empty">No shortcuts yet. They are listed here as you press them, with how often.</p>`) +
      (mouse ? `<p class="used-mouse">Mouse: ${mouse} ${mouse === 1 ? 'click' : 'clicks'} on the workspace. Allowed here; the keyboard is what you are practising.</p>` : '');
  }

  function renderActions() {
    const a = $('panelActions');
    if (phase !== 'done') {
      a.innerHTML = `<button class="btn btn-ghost" id="restartBtn" type="button">Restart</button>`;
      $('restartBtn').onclick = () => { restart(run.mode); };
    } else a.innerHTML = '';
  }

  function renderTimer() {
    const t = $('lessonTimer');
    // a race goal shows its own clock while it is open (it starts with the first key of that goal)
    const live = el.querySelector('[data-goal-clock]');
    if (live && phase === 'play') { const start = run.goalStart(+live.dataset.goalClock); live.textContent = start == null ? '0.0 s' : fmtSecs(Math.max(0, (Date.now() - start) / 1000)) + ' s'; }
    if (run.mode !== 'timed' && run.mode !== 'challenge') { t.textContent = ''; return; }
    // An assessment, test-out or challenge counts down from its time limit; the clock starts on the first action.
    if (lesson.timeLimit) {
      const left = Math.max(0, lesson.timeLimit - (run.startedAt == null ? 0 : run.elapsed));
      t.textContent = left.toFixed(1) + ' s left';
      if (phase === 'play' && run.startedAt != null && left <= 0 && !run.finished) timeUp();
      return;
    }
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
  /** The race block (a lesson with `race` pairs): each round's slow leg and fast leg side by side, totals, and how many times faster. */
  function raceHtml() {
    if (!lesson.race) return '';
    const splits = run.splits(); const idx = id => lesson.goals.findIndex(g => g.id === id);
    const rows = lesson.race.map(r => ({ label: r.label, slow: splits[idx(r.slow)], fast: splits[idx(r.fast)] }));
    const sum = k => rows.reduce((a, r) => a + (r[k] == null ? 0 : r[k]), 0);
    const slow = sum('slow'), fast = sum('fast'); const ratio = fast > 0 ? slow / fast : null;
    const cell = v => v == null ? '—' : fmtSecs(v) + ' s';
    return `<div class="race"><table class="race-table"><thead><tr><th></th><th>Slow way</th><th>Your way</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${esc(r.label)}</td><td>${cell(r.slow)}</td><td class="race-fast">${cell(r.fast)}</td></tr>`).join('')}
      <tr class="race-total"><td>Total</td><td>${cell(slow)}</td><td class="race-fast">${cell(fast)}</td></tr></tbody></table>
      ${ratio != null && ratio >= 1.2 ? `<div class="race-note">${ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1)}× faster with shortcuts.</div>` : ''}</div>`;
  }
  const closingHtml = () => (lesson.closing || []).map(t => `<p class="rm-closing">${rich(t)}</p>`).join('');
  const doneTitle = () => lesson.kind === 'assessment' ? 'Assessment passed' : lesson.kind === 'testout' ? 'Tested out — chapter cleared' : lesson.kind === 'project' ? 'Project complete' : 'Lesson complete';
  function statsLine() {
    const parts = [`<b>${run.startedAt == null ? '—' : fmtSecs(run.elapsed) + ' s'}</b>`, `<b>${run.session.keyLog.length}</b> keystrokes`, modeLabel().toLowerCase() + (assisted() ? ' · assisted' : '')];
    if (run.mouseCount) parts.push(`mouse ×${run.mouseCount}`);
    if (run.mode === 'timed' && run.par) parts.push(`par ${run.par} s`);
    return parts.join(' · ');
  }
  function doneButtonsHtml() {
    const nxt = nextLesson(lesson.id);
    // A challenge retries by seed: Enter replays the very sheet, N deals a fresh one (C2 gap 9b).
    if (isChallenge) {
      return `<button class="btn btn-primary" data-act="retry-same" type="button">Retry — same sheet <kbd>Enter</kbd></button>
        <button class="btn" data-act="retry-new" type="button">New sheet <kbd>N</kbd></button>
        <button class="btn" data-act="continue" type="button">${nxt ? 'Continue' : 'Back to Learn'}</button>`;
    }
    const alt = run.mode === 'guided' ? 'Try solo' : run.mode === 'solo' ? 'Try timed' : 'Try again';
    return `<button class="btn btn-primary" data-act="continue" type="button">${nxt ? 'Continue' : 'Back to Learn'} <kbd>Enter</kbd></button>
      <button class="btn" data-act="alt" type="button">${alt}</button>`;
  }
  /** Restart a challenge: the same seed replays the identical sheet; a new seed deals fresh clothing. */
  function restartChallenge(newSeed) {
    run.opts.seedNo = newSeed ? undefined : run.seedNo;
    restart('challenge');
  }
  function wireDoneButtons(scope) {
    const nxt = nextLesson(lesson.id);
    const on = (act, fn) => { const b = scope.querySelector(`[data-act="${act}"]`); if (b) b.onclick = fn; };
    on('continue', () => { location.hash = nxt ? '#/lesson/' + nxt.id : '#/learn'; });
    on('alt', () => restart(run.mode === 'guided' ? 'solo' : run.mode === 'solo' ? 'timed' : 'timed'));
    on('retry-same', () => restartChallenge(false));
    on('retry-new', () => restartChallenge(true));
    on('look', closeOverlay);
    // after a timed or challenge run: watch the reference route play over the finished sheet, then it goes back
    on('route', () => { closeOverlay(); startGhost(parseKeyScript(lesson.solution)); });
  }
  /** One line naming the next lesson's job: the first sentence of its brief (or read, or its title). */
  function nextJobHtml() {
    const nxt = nextLesson(lesson.id); if (!nxt) return '';
    const src = String(nxt.brief || nxt.read || nxt.title);
    return `<div class="rm-next">Next: ${rich(src.split(/(?<=[.!?])\s+/)[0])}</div>`;
  }
  /** Count the XP line up from 0 to what the run earned (~600 ms). */
  function countUpXp(scope) {
    const elx = scope.querySelector('.rm-xp'); if (!elx || !xpGained) return;
    const t0 = Date.now(); const dur = 600;
    const tick = () => {
      if (!elx.isConnected) return;
      const f = Math.min(1, (Date.now() - t0) / dur);
      elx.textContent = '+' + Math.round(xpGained * f) + ' XP';
      if (f < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function renderOverlay() {
    // Bare numbers, the clean-sheet mark, the XP count-up and the next job — no comparison
    // sentences, no before/after view (C2 gap 9b).
    const secs = run.startedAt == null ? null : run.elapsed;
    overlay.innerHTML = `<div class="rm-card">
      <div class="rm-title" id="doneTitle">${isChallenge && lastTier ? esc(lastTier[0].toUpperCase() + lastTier.slice(1)) + '!' : doneTitle()}</div>
      <div class="rm-lesson">${lessonNumber(lesson.id)} · ${esc(lesson.title)} · ${modeLabel()}</div>
      ${lesson.race ? raceHtml() : `<div class="rm-time">${secs == null ? '—' : fmtSecs(secs)}<span>s</span></div>`}
      ${isChallenge && lesson.pars ? `<div class="tier-stamps">${['pass', 'pro', 'legendary'].map(t => `<span class="tstamp ${lastClean && secs != null && secs <= lesson.pars[t] ? 'hit' : ''}">${t} ${lesson.pars[t]}s</span>`).join('')}</div>` : ''}
      <div class="rm-stats"><div>keystrokes<b>${run.session.keyLog.length}</b></div>${run.mouseCount ? `<div>mouse<b>×${run.mouseCount}</b></div>` : ''}${run.mode === 'timed' && run.par ? `<div>par<b>${run.par} s</b></div>` : ''}${xpGained ? `<div>earned<b class="rm-xp">+0 XP</b></div>` : ''}</div>
      ${lastClean ? `<div class="rm-clean">✓ Clean sheet — no mouse, no help</div>` : assisted() ? `<div class="rm-note">Assisted — steps were shown on request.</div>` : ''}
      ${closingHtml()}
      ${nextJobHtml()}
      ${firstEver && store.saveState() === 'device' ? `<div class="rm-save"><b>Your first lesson is done.</b> Progress is saved on this device. <a href="#/account">Create a free account</a> to keep it across devices — everything you have done carries over.</div>` : ''}
      <div class="rm-opts">${doneButtonsHtml()}<button class="btn btn-ghost" data-act="look" type="button">Look at the sheet <kbd>Esc</kbd></button>${(run.mode === 'timed' || isChallenge) && lesson.solution ? '<button class="btn btn-ghost" data-act="route" type="button">Watch the reference route</button>' : ''}</div>
      <div class="rm-more">${esc(saveState)}</div>
    </div>`;
    wireDoneButtons(overlay);
    countUpXp(overlay);
    overlay.hidden = false;
    const primary = overlay.querySelector(isChallenge ? '[data-act="retry-same"]' : '[data-act="continue"]'); if (primary) primary.focus();
  }
  function closeOverlay() { overlay.hidden = true; focusWorkspace(); }
  /** The time limit ran out on an assessment or test-out: nothing is recorded, the run offers itself again. */
  function timeUp() {
    stopDemo();
    phase = 'timeup';
    track('lesson_timeup', { lesson_id: lesson.id, mode: run.mode });
    if (timerH) { clearInterval(timerH); timerH = null; }
    renderPanel();
    overlay.innerHTML = `<div class="rm-card">
      <div class="rm-title" id="doneTitle">Time’s up — try again</div>
      <div class="rm-lesson">${lessonNumber(lesson.id)} · ${esc(lesson.title)}</div>
      <div class="rm-stats"><div>goals<b>${run.doneCount} / ${run.goals.length}</b></div><div>limit<b>${lesson.timeLimit} s</b></div></div>
      <div class="rm-note">${lesson.kind === 'testout' ? 'No harm done: nothing is recorded, and the chapter’s lessons are always open.' : 'Nothing is recorded for a run that ran out. The report is the same every time — another run is more practice.'}</div>
      <div class="rm-opts"><button class="btn btn-primary" data-act="continue" type="button">Try again <kbd>Enter</kbd></button>
        ${isChallenge ? '<button class="btn" data-act="new" type="button">New sheet <kbd>N</kbd></button>' : ''}
        <a class="btn" href="#/learn">Back to Learn</a>
        <button class="btn btn-ghost" data-act="look" type="button">Look at the sheet <kbd>Esc</kbd></button></div>
    </div>`;
    overlay.querySelector('[data-act="continue"]').onclick = () => (isChallenge ? restartChallenge(false) : restart('timed'));
    const nw = overlay.querySelector('[data-act="new"]'); if (nw) nw.onclick = () => restartChallenge(true);
    overlay.querySelector('[data-act="look"]').onclick = closeOverlay;
    overlay.hidden = false;
    const primary = overlay.querySelector('[data-act="continue"]'); if (primary) primary.focus();
  }
  function finish() {
    phase = 'done';
    track('lesson_complete', { lesson_id: lesson.id, mode: run.mode });
    const ctxBefore = gameCtx();
    const before = store.all();
    firstEver = !Object.values(before).some(p => p.completed);
    lastClean = !assisted() && !run.mouseCount;
    // A clean challenge earns the tier its time reaches; help or mouse means the pass records with none.
    lastTier = null;
    if (isChallenge && lastClean && lesson.pars) {
      const p = lesson.pars;
      lastTier = run.elapsed <= p.legendary ? 'legendary' : run.elapsed <= p.pro ? 'pro' : run.elapsed <= p.pass ? 'pass' : null;
    }
    const saved = store.record(lesson.id, run.mode, run.elapsed, {
      clean: lastClean,
      keystrokes: run.session.keyLog.length,
      mouseCount: run.mouseCount,
      assisted: assisted(),
      tier: lastTier || undefined,
    });
    // A timed or challenge run is also an attempt record (one source for Stats, PBs, boards and
    // XP; a challenge carries its seed so a ghost can replay the very sheet it was set on).
    if (run.mode === 'timed' || isChallenge) {
      store.addAttempt({
        id: attemptId(), kind: isChallenge ? 'challenge' : 'lesson-timed', ref: lesson.id, day: dayOf(),
        seed: isChallenge && Number.isInteger(run.seedNo) ? run.seedNo : null,
        secs: run.elapsed, keys: run.session.keyLog.length,
        clean: lastClean, helped: assisted(), mouse: run.mouseCount,
        tier: lastTier || 'none', splits: run.splits().filter(Number.isFinite), trace: traceOf(run.session.keyLog), at: Date.now(),
      });
    }
    // A finished assessment or test-out inside its time limit passes the chapter gate (§7);
    // a test-out also marks every not-yet-completed chapter lesson skipped, like placement does.
    if (timedOnly) {
      store.chapterPass(lesson.chapter, lesson.kind);
      if (lesson.kind === 'testout' && chapter) {
        const all = store.all();
        const ids = chapter.lessons.filter(l => l.id !== lesson.id && !(all[l.id] && all[l.id].completed)).map(l => l.id);
        if (ids.length) store.skip(ids);
      }
    }
    saveState = saved ? store.saveText() : 'Couldn’t save on this device (storage blocked); the lesson still counts for this visit';
    xpGained = Math.max(0, gameCtx().xp - ctxBefore.xp);
    if (timerH) { clearInterval(timerH); timerH = null; }
    effects.finish($('stage'));
    if (lastClean && effects.cleanSheet) effects.cleanSheet();
    celebrate(effects, ctxBefore);
    tab = 'lesson';
    renderPanel();
    renderOverlay();
  }

  /* ---------------- phases ---------------- */
  /** Keyboard focus lands on the workspace, so the first key goes to the sheet (never to the page). */
  function focusWorkspace() {
    const stage = $('stage'); if (!stage) return;
    if (!stage.hasAttribute('tabindex')) stage.setAttribute('tabindex', '-1');
    try { window.focus(); } catch (e) { /* ignore */ }
    try { stage.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    paintFocusHint();
  }
  // Embedded in another page (a preview frame), the browser may keep the keyboard on the outer page
  // until the learner clicks inside: say so on the sheet instead of leaving keys to scroll the page.
  function paintFocusHint() {
    const stage = $('stage'); if (!stage) return;
    let hint = stage.querySelector('.focus-hint');
    const away = typeof document.hasFocus === 'function' && !document.hasFocus();
    if (away && !hint) { hint = document.createElement('div'); hint.className = 'focus-hint'; hint.innerHTML = '<span>Click the sheet to start typing</span>'; stage.appendChild(hint); }
    if (!away && hint) hint.remove();
  }
  window.addEventListener('focus', paintFocusHint); window.addEventListener('blur', paintFocusHint);
  function restart(newMode) {
    if (ghost) { clearInterval(ghost.timer); ghost = null; run.endGhost(); }
    stopDemo();
    phase = 'play'; revealed = false; nudgeAt = -1; prevDone = 0; overlay.hidden = true; tab = 'lesson';
    run.reset(timedOnly ? 'timed' : newMode);
    mountViews();
    if (!timerH) timerH = setInterval(renderTimer, 200);
    renderPanel();
    focusWorkspace();
    maybeStartDemo();
  }

  /* ---------------- demo goals: the platform presses the keys while the learner watches ---------------- */
  function stopDemo() { if (demo && demo.timer) clearInterval(demo.timer); demo = null; }
  /** Start the current goal's demo if it has one and it has not played; the keys go in on the goal's cadence. */
  function maybeStartDemo() {
    if (phase !== 'play' || demo) return;
    const g = run.pendingDemo(); if (!g) return;
    demo = { goal: g, steps: run.demoSteps(g), i: 0, timer: null };
    renderPanel();
    demo.timer = setInterval(() => {
      if (!demo) return;
      if (demo.i < demo.steps.length) { run.demoStep(demo.steps[demo.i++]); return; }
      const d = demo; clearInterval(d.timer); demo = null; run.finishDemo(d.goal);
    }, Math.max(40, (g.demo && g.demo.cadence) || 110));
  }
  /** Esc during a demo: play the rest at once. `demo` stays set while the rest plays so a re-render cannot start it again. */
  function skipDemo() {
    if (!demo) return;
    const d = demo; if (d.timer) clearInterval(d.timer); d.timer = null;
    while (d.i < d.steps.length) run.demoStep(d.steps[d.i++]);
    demo = null;
    run.finishDemo(d.goal);
  }

  /* ---------------- ghost replay (C2 gap 9a): "Show me" plays the keys and puts the sheet back ---------------- */
  /** Play `steps` (default: the current goal's hint) as a ghost: ~350 ms a key, keycaps flashing, then restore and hand back. */
  function startGhost(steps) {
    if (ghost || demo) return;
    steps = steps || (run.current && run.current.keys ? run.ghostSteps(run.current.keys) : []);
    if (!steps.length) { renderPanel(); return; }
    run.beginGhost();
    ghost = { steps, i: 0, timer: null, paused: false };
    renderPanel();
    ghost.timer = setInterval(() => {
      if (!ghost || ghost.paused) return;
      if (ghost.i < ghost.steps.length) { run.ghostStep(ghost.steps[ghost.i++]); return; }
      stopGhost(true);
    }, 350);
  }
  function stopGhost(finished) {
    if (!ghost) return;
    clearInterval(ghost.timer); ghost = null;
    run.endGhost();
    renderPanel();
    if (finished && phase === 'play') showToast('Your turn.');
    focusWorkspace();
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

  /* ---------------- divider: drag and keyboard, within limits ---------------- */
  const divider = $('divider');
  function applyPanel() {
    el.style.setProperty('--panel-w', panel.w + 'px');
    divider.setAttribute('aria-valuenow', String(panel.w)); divider.setAttribute('aria-valuemin', String(PANEL_MIN)); divider.setAttribute('aria-valuemax', String(PANEL_MAX));
    if (sheetView) requestAnimationFrame(() => sheetView.render());
  }
  function setPanelW(w) { panel.w = clampW(w); applyPanel(); }
  let drag = null;
  divider.addEventListener('pointerdown', e => {
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
    else return;
    e.preventDefault(); e.stopPropagation();
  });
  applyPanel();

  /* ---------------- keys: the whole page is the workspace ---------------- */
  function onKey(e) {
    const t = e.target; const tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (t && (t.closest('.panel-tabs') || t === divider)) return;   // handled by their own listeners
    if (e.key === 'F1') { e.preventDefault(); selectTab(tab === 'help' ? 'lesson' : 'help'); return; }
    if (!overlay.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); }
      else if (isChallenge && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); restartChallenge(true); }
      else if (e.key === 'Enter' && !(tag === 'BUTTON' || tag === 'A')) {
        e.preventDefault();
        const b = overlay.querySelector(isChallenge ? '[data-act="retry-same"], [data-act="continue"]' : '[data-act="continue"]');
        if (b) b.click();
      }
      return;
    }
    if ((tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY') && (e.key === 'Enter' || e.key === ' ')) return;   // the control handles its own activation
    if (ghost) {   // watching the ghost: Esc hands back, ← → pause and step, Space pauses, everything else waits
      e.preventDefault();
      if (e.key === 'Escape') stopGhost(false);
      else if (e.key === 'ArrowRight') { ghost.paused = true; if (ghost.i < ghost.steps.length) run.ghostStep(ghost.steps[ghost.i++]); else stopGhost(true); }
      else if (e.key === 'ArrowLeft') { ghost.paused = true; if (ghost.i > 0) { ghost.i--; run.ghostSeek(ghost.steps, ghost.i - 1); } }
      else if (e.key === ' ') ghost.paused = !ghost.paused;
      return;
    }
    if (demo) { if (e.key === 'Escape') skipDemo(); if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length > 1) e.preventDefault(); return; }   // watching: keys wait, arrows never scroll the page
    if (phase === 'timeup') {   // the run is over; Enter starts the next attempt (a challenge: the same sheet; N deals fresh)
      if (e.key === 'Enter') { e.preventDefault(); if (isChallenge) restartChallenge(false); else restart('timed'); }
      else if (isChallenge && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); restartChallenge(true); }
      return;
    }
    if (phase === 'done') {
      if (e.key === 'Enter') { e.preventDefault(); const c = el.querySelector(isChallenge ? '[data-act="retry-same"], [data-act="continue"]' : '[data-act="continue"]'); if (c) c.click(); }
      else if (isChallenge && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); restartChallenge(true); }
      return;
    }
    if (run.key(e)) { e.preventDefault(); effects.armSounds(); }
  }
  function onKeyUp(e) { if (e.key === 'Alt') e.preventDefault(); }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  timerH = setInterval(renderTimer, 200);

  mountViews();
  renderPanel();
  focusWorkspace();
  maybeStartDemo();
  return {
    destroy() {
      if (ghost) { clearInterval(ghost.timer); ghost = null; run.endGhost(); }
      stopDemo();
      window.removeEventListener('focus', paintFocusHint); window.removeEventListener('blur', paintFocusHint);
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp);
      if (timerH) clearInterval(timerH);
      if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (sheetTabs) sheetTabs.destroy();
      keycaps.destroy(); if (effects.destroy) effects.destroy();
      overlay.remove(); el.remove();
    },
  };
}
