// app2/app/lesson-view.js — the split-pane lesson: instructions + one Help entry on the left,
// the sheet on the right. teach → guided (→ solo → timed on request).
import { LessonRun } from './runner.js';
import { progress } from './progress.js';
import { nextLesson, chapterOf, lessonNumber } from '../content/index.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { showToast } from '../ui/toast.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** `Ctrl+1` → <kbd>Ctrl+1</kbd>; everything else escaped. */
const rich = s => esc(s).replace(/`([^`]+)`/g, (m, k) => `<kbd>${k}</kbd>`);
const keysHtml = s => s ? s.split(/\s+/).map(t => /^(then|×\d+|,|and|or|…)$/.test(t) || /^[a-z]/.test(t) && !/^[a-z]$/.test(t) ? `<span class="kx">${esc(t)}</span>` : `<kbd>${esc(t)}</kbd>`).join(' ') : '';

export function mountLessonView(root, lesson, { mode = 'guided' } = {}) {
  const el = document.createElement('div');
  el.className = 'lesson';
  el.innerHTML = `
    <aside class="lesson-left">
      <div class="lesson-crumb"><a href="#/">Lessons</a> › ${esc(chapterOf(lesson).title)} › <span>${lessonNumber(lesson.id)}</span></div>
      <h1 class="lesson-title">${esc(lesson.title)}</h1>
      <div class="lesson-meta"><span class="diff diff-${esc(lesson.difficulty)}">${esc(lesson.difficulty)}</span> <span class="lesson-mode" id="lessonMode"></span> <span class="lesson-timer" id="lessonTimer"></span></div>
      <div class="lesson-body" id="lessonBody"></div>
      <div class="lesson-help"><button class="btn btn-ghost" id="helpBtn" type="button">Help</button><div class="help-panel" id="helpPanel" hidden></div></div>
      <div class="lesson-actions" id="lessonActions"></div>
    </aside>
    <div class="lesson-right">
      <div class="stage"><div class="stage-row"><div class="stage-main">
        <div class="ribbon-slot" id="ribbonSlot"><div class="ribbon" id="ribbon"></div></div>
        <div id="sheetMount"></div>
      </div></div></div>
    </div>`;
  root.appendChild(el);
  const $ = id => el.querySelector('#' + id);

  const keycaps = mountKeycaps();
  const run = new LessonRun(lesson, { mode, onKey: k => keycaps.flash(k), onToast: showToast, onRefuse: () => sheetView && sheetView.shake && sheetView.shake() });
  progress.touch(lesson.id);
  let sheetView = null, ribbonView = null, helpOpen = false, timerH = null;
  let phase = mode === 'guided' ? 'teach' : 'play';   // 'teach' | 'play' | 'done'

  function mountViews() {
    if (sheetView) sheetView.destroy();
    $('sheetMount').innerHTML = '';
    sheetView = new SheetView($('sheetMount'), run.session);
    ribbonView = new RibbonView($('ribbon'), run.session);
    run.onChange(() => { ribbonView.render(); sheetView.render(); if (run.finished && phase !== 'done') finish(); renderLeft(); });
    sheetView.render(); ribbonView.render();
  }

  function teachStep() { return lesson.steps.find(s => s.mode === 'teach'); }
  function renderLeft() {
    $('lessonMode').textContent = phase === 'teach' ? 'Read' : run.mode === 'guided' ? 'Guided' : run.mode === 'solo' ? 'Solo' : 'Timed';
    const body = $('lessonBody');
    if (phase === 'teach') {
      const t = teachStep();
      body.innerHTML = `<h2>${esc(t.title)}</h2>` + t.body.map(p => `<p>${rich(p)}</p>`).join('') +
        `<p class="lesson-goalsintro">You will:</p><ol class="goals goals-preview">${lesson.goals.map(g => `<li>${esc(g.text)}</li>`).join('')}</ol>`;
      $('lessonActions').innerHTML = `<button class="btn btn-primary" id="startBtn" type="button">Start <kbd>Enter</kbd></button>`;
      $('startBtn').onclick = startPlay;
    } else if (phase === 'play') {
      const states = run.goalStates(); const showKeys = run.mode === 'guided';
      body.innerHTML = `<ol class="goals">${states.map(g => `<li class="goal ${g.done ? 'done' : g.current ? 'current' : ''}">
          <span class="goal-mark">${g.done ? '✓' : g.current ? '›' : ''}</span><span class="goal-text">${esc(g.text)}</span>
          ${showKeys && g.current && g.keys ? `<div class="goal-keys">${keysHtml(g.keys)}</div>` : ''}</li>`).join('')}</ol>`;
      $('lessonActions').innerHTML = `<button class="btn btn-ghost" id="restartBtn" type="button">Restart</button>`;
      $('restartBtn').onclick = () => restart(run.mode);
    } else {
      const secs = run.elapsed.toFixed(1); const par = run.par; const nxt = nextLesson(lesson.id);
      body.innerHTML = `<div class="done-card"><div class="done-title">Lesson complete</div>
        <div class="done-stats">${run.mode === 'timed' ? `<b>${secs} s</b>${par ? ` · par ${par} s` : ''}` : `<b>${lesson.goals.length}</b> of ${lesson.goals.length} goals`}</div>
        <div class="done-actions">
          <button class="btn btn-primary" id="continueBtn" type="button">${nxt ? 'Continue' : 'Back to lessons'} <kbd>Enter</kbd></button>
          <button class="btn btn-ghost" id="soloBtn" type="button">${run.mode === 'guided' ? 'Try solo' : run.mode === 'solo' ? 'Try timed' : 'Try again'}</button>
        </div></div>`;
      $('lessonActions').innerHTML = '';
      $('continueBtn').onclick = () => { location.hash = nxt ? '#/lesson/' + nxt.id : '#/'; };
      $('soloBtn').onclick = () => restart(run.mode === 'guided' ? 'solo' : run.mode === 'solo' ? 'timed' : 'timed');
    }
    renderHelp();
    renderTimer();
  }
  function renderHelp() {
    const p = $('helpPanel'); p.hidden = !helpOpen; if (!helpOpen) return;
    const cur = run.current;
    p.innerHTML = phase === 'play' && cur ? `<div class="help-goal">${esc(cur.text)}</div><div class="help-keys">${keysHtml(cur.keys || '')}</div>
      <p class="help-note">Press the keys one after another. <kbd>Esc</kbd> backs out of the Ribbon or a dialog box; <kbd>Ctrl+Z</kbd> undoes.</p>` :
      `<p class="help-note">Read the notes, then press <kbd>Enter</kbd> or Start. Goals are checked as you go.</p>`;
  }
  function renderTimer() {
    const t = $('lessonTimer');
    if (run.mode !== 'timed' || phase === 'teach') { t.textContent = ''; return; }
    t.textContent = run.elapsed.toFixed(1) + ' s' + (run.par ? ' / par ' + run.par : '');
  }
  function startPlay() { phase = 'play'; renderLeft(); }
  function restart(newMode) { phase = 'play'; run.reset(newMode); mountViews(); renderLeft(); }
  function finish() {
    phase = 'done';
    progress.record(lesson.id, run.mode, run.elapsed);
    if (timerH) { clearInterval(timerH); timerH = null; }
  }

  function onKey(e) {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'F1') { e.preventDefault(); helpOpen = !helpOpen; renderHelp(); return; }
    if (phase === 'teach') { if (e.key === 'Enter') { e.preventDefault(); startPlay(); } return; }
    if (phase === 'done') { if (e.key === 'Enter') { e.preventDefault(); $('continueBtn').click(); } return; }
    if (tag === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
    if (run.key(e)) e.preventDefault();
  }
  function onKeyUp(e) { if (e.key === 'Alt') e.preventDefault(); }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  $('helpBtn').onclick = () => { helpOpen = !helpOpen; renderHelp(); };
  timerH = setInterval(renderTimer, 200);

  mountViews();
  renderLeft();
  return { destroy() { document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp); if (timerH) clearInterval(timerH); if (sheetView) sheetView.destroy(); keycaps.destroy(); el.remove(); } };
}
