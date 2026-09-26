// app2/app/lesson-view.js — the lesson workspace (SITE_SPEC §4): sheet and ribbon on the LEFT,
// the instructions panel on the RIGHT (Lesson | Help | Shortcuts used), a draggable, collapsible
// divider between them. Phases: Read → Guided (or Solo / Timed) → complete, with the centered
// completion overlay. Mouse works and is recorded (§6); every completed goal gets a tick and the
// finish gets a bigger one (§1, ui/effects.js).
import { LessonRun, shortcutsUsed } from './runner.js';
import { parseKeyScript } from '../engine/keyboard.js';
import { store } from './store.js';
import { attemptId, dayOf, traceOf } from './records.js';
import { tierFor } from './pars.js';
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
import { keyLabel, prefs } from './prefs.js';
import { flowNext } from './flow.js';
import { inferTarget, altPath, pulseTarget, clearPulse, glowRibbon, placeNear, SIDES, targetBoxes, targetParts, unionBox } from '../ui/cues.js';
import { moduleNumber, itemNumber, isFinalItem, FINAL_MODULE } from './numbering.js';
import { beatFor, pageDelivered } from './beats.js';
import { pageThumbHtml } from './learn-next.js';
import { schedule, grade as scheduleGrade, dueToday } from './schedule.js';
import { shouldOfferInstall, installAvailable, promptInstall, INSTALL_PROMPT } from './install.js';
import { siteCopy } from '../content/copy/apply.js';
import { printPreviewHtml, associateLine } from '../ui/print-preview.js';
import { WORKBOOKS } from '../content/workbooks/index.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** A keycap: the chord as the learner's platform shows it (Ctrl → ⌘, Alt → ⌥ on a Mac). */
const kbd = k => `<kbd>${esc(keyLabel(k))}</kbd>`;
/** Module 1.8's items are named for what they are, not counted as lessons. */
const FINAL_LABEL = { project: 'Project', assessment: 'Assessment', testout: 'Test out' };
/** `Ctrl+1` → <kbd>Ctrl+1</kbd>; everything else escaped. */
const rich = s => esc(s).replace(/`([^`]+)`/g, (m, k) => kbd(k));
/**
 * A goal's keys: keycaps for keys, plain text for connectives ('then', '×5') and, as in a solution
 * script, a double-quoted run is text to type: '"1200" Enter' → type “1200” ⏎.
 */
const keysHtml = s => s ? (s.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(t => t.startsWith('"') || t.startsWith("'") ? `<span class="kx">type “${esc(t.slice(1, -1))}”</span>` :
  /^(then|×\d+|,|and|or|…)$/.test(t) || /^[a-z]/.test(t) && !/^[a-z]$/.test(t) ? `<span class="kx">${esc(t)}</span>` : kbd(t)).join(' ') : '';

/** The once-in-the-browser line on the first goal that uses Ctrl+PgUp/PgDn; site.csv tab_keys_note overrides. */
export const TAB_KEYS_NOTE = 'Your browser may keep Ctrl+PgDn and Ctrl+PgUp for its own tabs. Fullscreen hands them to the sheet, and so does the installed app.';
/** A challenge's name after the word "Challenge": 'Challenge: another cluster’s file' → 'Another cluster’s file'. */
const challengeName = t => { const x = String(t || '').replace(/^Challenge:\s*/i, ''); return x.charAt(0).toUpperCase() + x.slice(1); };
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

export function mountLessonView(root, lesson, { mode = 'guided', panel: panelOpt, seed: seedOpt, daily: dailyOpt } = {}) {
  ensureCss();
  const chapter = chapterOf(lesson);
  const fullRibbon = chapter && (chapter.id === 'foundations' || chapter.id === 'formatting');   // Chapters 1 and 2: the full ribbon bar is on by default (§4)
  const timedOnly = lesson.kind === 'assessment' || lesson.kind === 'testout';   // these run against the clock, no help, no other mode
  if (timedOnly) mode = 'timed';
  const isChallenge = lesson.kind === 'challenge';   // the module challenge: seeded, all goals at once, countdown, tier pars (C2)
  if (isChallenge) mode = 'challenge';
  const isMicro = lesson.kind === 'micro';           // a due-today micro-drill (app/schedule.js): no record, no XP, one memory note
  const next = flowNext();                           // the experience pass: strip, cues, beats, panel side — behind ?flow=next
  const at = moduleOf(lesson);
  const wrap = document.createElement('div');
  wrap.className = 'ws' + (next ? ' ws-next' : '');
  const el = document.createElement('div');
  // the panel (B4): the adaptive floating card by default, docked right or left as a setting; ?panel= overrides for a look
  const panelMode = ['overlay', 'right', 'left'].includes(panelOpt) ? panelOpt : prefs.get().panelSide;
  const overlayMode = next && panelMode === 'overlay';
  el.className = 'lesson' + (overlayMode ? ' panel-overlay' : '');
  if (next) el.dataset.panel = panelMode;
  if (next) {
    const ctx0 = gameCtx();
    const crumb = at
      ? `<a href="#/learn">Learn</a> › <span>${esc(chapter ? chapter.title : '')}</span> › <span>${esc(moduleNumber(at.module.id, at.k))} ${esc(at.module.title)}</span> › <b>${isChallenge ? 'Challenge' : FINAL_LABEL[lesson.kind] || `Lesson ${at.n} of ${at.of}`}</b>`
      : isMicro ? `<a href="#/">Home</a> › <span>Practice · due today</span> › <b>${esc(lesson.title)}</b>`
      : isFinalItem(lesson) ? `<a href="#/learn">Learn</a> › <span>${esc(chapter ? chapter.title : '')}</span> › <span>${FINAL_MODULE.n} ${esc(FINAL_MODULE.title)}</span> › <b>${esc(lesson.title)}</b>`
      : `<a href="#/learn">Learn</a> › <span>${esc(chapter ? chapter.title : '')}</span> › <b>${esc(lesson.title)}</b>`;
    const sideName = { overlay: 'Floating card', right: 'Docked right', left: 'Docked left' };
    wrap.innerHTML = `<div class="ws-strip" id="wsStrip" role="navigation" aria-label="You are here">
      <div class="ws-crumb">${crumb}<span class="ws-ring" id="wsRing"></span></div>
      <div class="ws-tools">
        <span class="ws-level" id="wsLevel" title="Level ${ctx0.level} · XP from lessons, challenges and the Daily">L${ctx0.level} <i>${ctx0.levelInfo.into}/${ctx0.levelInfo.need} XP</i></span>
        <span id="wsMute"></span>
        <button type="button" class="mb-tool" id="wsFull" title="Fullscreen: the sheet gets the whole screen, and the browser's own shortcuts stay out of the way">Fullscreen</button>
        <div class="ws-more-wrap"><button type="button" class="mb-tool ws-more" id="wsMore" aria-haspopup="menu" aria-expanded="false" title="Panel and workspace options">More <span aria-hidden="true">▾</span></button>
          <div class="ws-menu" id="wsMenu" role="menu" hidden>
            <div class="ws-menu-cap">Lesson panel</div>
            ${['overlay', 'right', 'left'].map(m => `<button type="button" role="menuitemradio" aria-checked="${m === panelMode}" class="ws-menu-item${m === panelMode ? ' on' : ''}" data-side="${m}"><span>${sideName[m]}</span>${m === panelMode ? '<i>✓</i>' : ''}</button>`).join('')}
            ${panelMode === 'overlay' ? `<div class="ws-menu-sep"></div>
            <!-- literal Ctrl on a Mac too: the handler reads ctrlKey, and ⌘⇧J/K belong to the browser -->
            <button type="button" role="menuitem" class="ws-menu-item" data-act="move"><span>Move the card</span><kbd>Ctrl+Shift+J</kbd></button>
            <button type="button" role="menuitem" class="ws-menu-item" data-act="hide"><span>Hide or show the card</span><kbd>Ctrl+Shift+K</kbd></button>` : ''}
          </div></div>
      </div></div>`;
  }
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
        <div class="lesson-crumb"><a href="#/learn">Learn</a> › ${esc(chapter ? chapter.title : '')} › <span>${esc(itemNumber(lesson, at) || String(lessonNumber(lesson.id)))}</span></div>
        <h1 class="lesson-title" title="${esc(lesson.title)}">${esc(lesson.title)}</h1>
        <div class="module-line" id="moduleLine"></div>
        <div class="lesson-meta"><span class="diff diff-${esc(lesson.difficulty)}">${esc(lesson.difficulty)}</span> <span class="lesson-mode" id="lessonMode"></span> <span class="lesson-progress" id="lessonProgress"></span> <span class="lesson-timer" id="lessonTimer"></span><span class="lesson-tools" id="lessonTools"></span></div>
      </div>
      <div class="panel-tabs" role="tablist" aria-label="Panel">
        <button class="panel-tab" role="tab" id="tabLesson" type="button" aria-selected="true" aria-controls="panelBody" data-tab="lesson">Lesson</button>
        <button class="panel-tab" role="tab" id="tabHelp" type="button" aria-selected="false" aria-controls="panelBody" data-tab="help" tabindex="-1">Help <span class="tab-n">F1</span></button>
        <button class="panel-tab" role="tab" id="tabUsed" type="button" aria-selected="false" aria-controls="panelBody" data-tab="used" tabindex="-1">Shortcuts used <span class="tab-count" id="usedCount"></span></button>
      </div>
      <div class="task-card" id="taskCard" aria-live="polite"></div>
      <div class="panel-body" id="panelBody" role="tabpanel" aria-labelledby="tabLesson"></div>
      <div class="panel-actions" id="panelActions"></div>
    </aside>`;
  wrap.appendChild(el);
  root.appendChild(wrap);
  const overlay = document.createElement('div');
  overlay.className = 'lesson-done'; overlay.hidden = true; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'doneTitle');
  root.appendChild(overlay);
  const $ = id => el.querySelector('#' + id);

  // the key echo sits in the sheet-tab bar's empty right end, so the floating card never lands on it
  const keycaps = mountKeycaps(null, next ? { parent: $('stage'), cls: 'in-frame' } : {});
  let onDocClick = null;
  const effects = mountEffects();
  effects.mountMuteButton(next ? wrap.querySelector('#wsMute') : $('lessonTools'));
  // the strip's tools (experience pass): panel side, fullscreen
  if (next) {
    const more = wrap.querySelector('#wsMore'), menu = wrap.querySelector('#wsMenu');
    const closeMenu = (refocus) => { if (menu.hidden) return; menu.hidden = true; more.setAttribute('aria-expanded', 'false'); if (refocus) focusWorkspace(); };
    more.onclick = e => { e.stopPropagation(); const open = menu.hidden; menu.hidden = !open; more.setAttribute('aria-expanded', String(open)); if (open) { const first = menu.querySelector('.ws-menu-item'); if (first) first.focus(); } };
    menu.addEventListener('click', e => {
      const b = e.target.closest('.ws-menu-item'); if (!b) return;
      if (b.dataset.side) { if (b.dataset.side !== panelMode) { prefs.set({ panelSide: b.dataset.side }); location.hash = location.hash.replace(/[?&]panel=[a-z]+/, ''); location.reload(); } else closeMenu(true); return; }
      closeMenu(false);
      if (b.dataset.act === 'move') cycleDock(); else if (b.dataset.act === 'hide') togglePanel();
    });
    menu.addEventListener('keydown', e => {
      const items = [...menu.querySelectorAll('.ws-menu-item')]; const i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
    });
    onDocClick = e => { if (!e.target.closest('.ws-more-wrap')) closeMenu(false); };
    document.addEventListener('click', onDocClick);
    wrap.querySelector('#wsFull').onclick = () => toggleFullscreen();
  }
  const onFs = () => {
    try {
      const on = !!document.fullscreenElement;
      document.documentElement.classList.toggle('hk-fs', on);
      const b = wrap.querySelector('#wsFull'); if (b) { b.textContent = on ? 'Exit fullscreen' : 'Fullscreen'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
      if (sheetView) requestAnimationFrame(() => { sheetView.render(); renderTaskCard(); dockPanel(); });
    } catch (e) { /* no DOM */ }
  };
  document.addEventListener('fullscreenchange', onFs);

  /**
   * Fullscreen on and off. On: the keyboard lock hands Esc and Ctrl+PgUp/PgDn to the sheet instead of
   * the browser (holding Esc still leaves fullscreen, and the browser says so). Browsers without the
   * lock, or that refuse fullscreen, simply stay as they are.
   */
  function toggleFullscreen() {
    try {
      if (document.fullscreenElement) { const x = document.exitFullscreen(); if (x && x.catch) x.catch(() => {}); return; }
      const p = document.documentElement.requestFullscreen();
      const lock = () => { try { const k = navigator.keyboard; if (k && k.lock) k.lock(['Escape', 'PageUp', 'PageDown']).catch(() => {}); } catch (e) { /* no lock */ } };
      if (p && p.then) p.then(lock).catch(() => {}); else lock();
    } catch (e) { /* not allowed here */ }
  }
  /** A plain browser tab: not the installed app, not fullscreen — where the browser may keep Ctrl+PgUp/PgDn for itself. */
  const inBrowserTab = () => { try { return !document.fullscreenElement && !(window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)); } catch (e) { return true; } };
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
  let lastTimedOut = false;  // a soft-timed first challenge run that finished past the limit: completes, no tier
  let xpGained = 0;          // what the run earned, for the overlay's count-up
  let deliveredNow = false;  // this pass delivered the module's page for the first time (the moment plays once per page)
  // the experience pass: cues on the goal's target and the Ribbon route, the ~8 s stuck hint, the
  // memory notes the queue reads, the module's story beat
  const cuesOn = next && fullRibbon && mode === 'guided' && !isChallenge;
  let cueGoal = -1;          // the goal index the cue last fired for
  let cueTokens = [];        // the current goal's Alt route, as KeyTip letters
  let stuckH = null, helpH = null;
  let hintAt = -1;           // the goal index the stuck hint is showing for
  const hinted = new Set();  // goal indexes that were hinted or revealed (the queue grades them lower)
  let notedDone = 0;         // goals already noted to the queue
  let beat = null;           // the story-beat card while it shows
  let dock = 'free';         // the floating panel's side of the target (B4); recomputed on goal change and scroll
  let dockRect = null;       // its last rect in box pixels: kept while a goal has no target, so the card does not hop
  let dockedGoal = -1, dockedGlow = 0;   // what the last dock was computed for (the goal; the glowing Ribbon control count)
  let dockPinned = false;    // Ctrl+Shift+J moved it by hand: keep that until the next goal
  let pill = false;          // collapsed to a one-line pill while a cell is being edited
  let cueTarget = null;      // the current goal's target (inferTarget): its box is measured afresh on every dock, on whichever sheet shows
  let lastSheet = -1;        // the sheet index last seen, to spot a move to another sheet
  let pillH = null;          // the pending collapse (150 ms after an edit starts) or expand (after it settles)
  let busyOn = false;        // the run is live: achievements queue until it ends (SITE_SPEC §6a)
  let cardDone = 0;          // goals the task card has already shown ticked (the tick plays on the card itself)
  let cardHold = 0, cardHoldH = null;   // the ticked goal stays on the card this long before the next slides in
  let usedSeen = null;       // the shortcuts already used this run: a new one pops the Shortcuts used tab
  let glowQuiet = false;     // the learner Esc-ed all the way out of a Ribbon route: the glow waits for the next Alt
  let tabKeysGoal = -1;      // the goal the one-time browser-tab note shows on
  let overlayOpen = '';      // which workbook dialog or Ribbon menu was open at the last dock ('' for none)
  let glowObs = null;        // re-applies the route glow whenever the Ribbon repaints itself (a resize, a density change)
  let scrollRaf = 0;

  // The first attempt at a challenge is soft-timed (C2 addendum): the clock runs and decides the
  // tier, but time-up does not end the run. From the second attempt the limit is hard.
  // The assessment and test-out (seeded, timed) get the same soft first attempt (C2 Run 4).
  const firstAttempt = () => (isChallenge || timedOnly) && store.attempts({ ref: lesson.id }).length === 0;
  const run = new LessonRun(lesson, {
    mode,
    soft: firstAttempt(),
    onKey: k => keycaps.flash(k, { typing: run.session.mode !== 'ribbon' || !!run.session.dialog }),   // a letter outside the Ribbon, or in a dialog field, is typing
    onToast: showToast,
    onRefuse: () => { effects.refuse(); if (sheetView && sheetView.shake) sheetView.shake(); },
    onMouse: what => onMouse(what),
    onGoal: (i, secs) => track('goal_complete', { lesson_id: lesson.id, goal: i, secs: Math.round(secs * 10) / 10 }),
  });
  if (!isMicro) store.touch(lesson.id);
  if (Number.isFinite(+seedOpt)) run.opts.seedNo = +seedOpt;
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
    // the Ribbon view re-renders on its own session listener (registered above, so it fires after
    // the run's); the route glow is re-applied from a listener registered after it, so it lands
    // on the freshly painted bar
    run.session.onChange(() => {
      if (cuesOn && phase === 'play') { routeGlow(); markTargetTab(); }
      if (overlayMode) {
        setPill(!!run.session.editing);
        // a workbook dialog or Ribbon menu opened, moved or closed: the card makes room for it
        const ov = openOverlayRect(); const key = ov ? [ov.left, ov.top, ov.width, ov.height].map(Math.round).join(',') : '';
        if (key !== overlayOpen) { overlayOpen = key; requestAnimationFrame(dockPanel); }
      }
    });
    // the Ribbon repaints itself on a resize or a density change: the route glow goes back on
    if (glowObs) glowObs.disconnect();
    if (cuesOn && typeof MutationObserver === 'function') {
      let raf = 0;
      glowObs = new MutationObserver(() => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (phase === 'play' && !demo && !ghost) routeGlow(); }); });
      glowObs.observe($('ribbon'), { childList: true, subtree: true });
    }
    if (overlayMode && sheetView && sheetView.gw) sheetView.gw.addEventListener('scroll', onSheetScroll, { passive: true });
    run.onChange(what => {
      if (what === 'reset') return;
      ribbonView.render(); sheetView.render();
      if (run.finished && phase !== 'done') finish();
      renderPanel();
      maybeStartDemo();
      noteGoals();
      noteShortcuts();
      cueCurrent();
    });
    sheetView.render(); ribbonView.render();
  }

  /* ---------------- the panel ---------------- */
  const modeLabel = () => run.mode === 'guided' ? 'Guided' : run.mode === 'solo' ? 'Solo' : run.mode === 'challenge' ? 'Challenge' : 'Timed';
  /** Keys show on the goal line only where the goal introduces a shortcut (its teach line) in Guided mode, or after Help revealed them (§4). */
  const keysShown = g => (run.mode === 'guided' && !!g.teach) || revealed || hintAt === run.doneCount;
  const raceOf = id => (lesson.race || []).find(r => r.slow === id || r.fast === id);
  const fmtSecs = s => s.toFixed(1);
  // Guided is the normal way to complete a lesson and is NOT assistance (SITE_SPEC §4): only
  // revealing extra steps through Help ("Show me") marks the attempt assisted.
  const assisted = () => revealed;

  /** A shortcut used for the first time this run: the Shortcuts used count pops, with the soft pop sound. */
  function noteShortcuts() {
    const used = shortcutsUsed(run.session.keyLog);
    const keys = new Set(used.map(u => u.keys));
    const badge = $('usedCount');
    if (usedSeen && [...keys].some(k => !usedSeen.has(k))) {
      if (effects.newShortcut && phase === 'play') effects.newShortcut();
      if (badge) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
    }
    usedSeen = keys;
    if (badge) badge.textContent = keys.size ? String(keys.size) : '';
  }
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
    if (!at) { slot.innerHTML = ''; slot.hidden = true; return; }
    const all = store.all();
    const doneInModule = at.module.lessons.filter(l => { const p = all[l.id]; return (p && p.completed) || l.id === lesson.id && phase === 'done'; }).length;
    const wsRing = wrap.querySelector('#wsRing');
    if (wsRing) { wsRing.innerHTML = ring(doneInModule, at.module.lessons.length, { size: 18, stroke: 3 }) + `<span class="ws-ring-n">${doneInModule}/${at.module.lessons.length}</span>`; const lbl = `${doneInModule} of ${at.module.lessons.length} lessons in ${moduleNumber(at.module.id, at.k)} done`; wsRing.title = lbl; wsRing.setAttribute('aria-label', lbl); wsRing.setAttribute('role', 'img'); }
    slot.hidden = false;
    slot.innerHTML = `${ring(doneInModule, at.module.lessons.length, { size: 20 })} ${lesson.kind === 'challenge'
      ? `<span>Challenge · Module ${esc(moduleNumber(at.module.id, at.k))}</span>`
      : `<span>${FINAL_LABEL[lesson.kind] ? FINAL_LABEL[lesson.kind] : `Lesson ${at.n} of ${at.of}`} · Module ${esc(moduleNumber(at.module.id, at.k))}</span>`}`;
  }

  /** The one thing to do now, pinned above the scrolling body: goal + teach + keys + convention. */
  function renderTaskCard(slideIn) {
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
    // a goal just landed: it stays on the card, ticked (its convention chip earning its colour), for
    // a beat before the next one slides up (SITE_SPEC §6a) — the card is where the learner is looking
    if (run.doneCount > cardDone && phase === 'play' && !demo) {
      const doneGoal = run.goals[run.doneCount - 1];
      cardDone = run.doneCount;
      if (doneGoal && (overlayMode || el.classList.contains('pill'))) {
        const dconv = doneGoal.convention && CONVENTIONS[doneGoal.convention];
        card.innerHTML = `<div class="task-label task-label-done">Done</div>
          <div class="task-goal task-goal-done"><span class="task-check" aria-hidden="true"></span>${esc(doneGoal.text)}</div>
          ${dconv ? `<span class="conv-chip earned" title="${esc(dconv.name)}">✓ ${esc(dconv.short)}</span>` : ''}`;
        cardHold = Date.now() + (dconv ? 650 : 420);
        if (cardHoldH) clearTimeout(cardHoldH);
        cardHoldH = setTimeout(() => { cardHoldH = null; cardHold = 0; renderTaskCard(true); }, cardHold - Date.now());
        return;
      }
    }
    if (cardHold && Date.now() < cardHold) return;   // the tick is still showing; the next goal follows it
    const cur = run.current;
    if (!cur) { card.innerHTML = ''; return; }
    const isGoal = !!cur.keys || !cur.grader && run.doneCount < run.goals.length;
    const conv = cur.convention && CONVENTIONS[cur.convention];
    // once, in a browser tab: the browser may take Ctrl+PgUp/PgDn for its own tabs; fullscreen or the app hands them to the sheet
    if (next && tabKeysGoal < 0 && /Ctrl\+Pg(Up|Dn)/.test(cur.keys || '') && inBrowserTab() && !prefs.get().tabKeysNoted) { tabKeysGoal = run.doneCount; prefs.set({ tabKeysNoted: true }); }
    const tabNote = tabKeysGoal === run.doneCount && inBrowserTab()
      ? `<div class="task-tabkeys">${esc(siteCopy('tab_keys_note', TAB_KEYS_NOTE))} <button type="button" class="btn btn-ghost" data-act="fs-now">Fullscreen</button></div>` : '';
    card.innerHTML = `<div class="task-label">${isGoal ? 'Now' : 'Still needed'} <span class="task-count">${run.doneCount} / ${run.goals.length}</span></div>
      <div class="task-goal${slideIn ? ' task-in' : ''}">${esc(cur.text)}</div>
      ${isGoal && run.mode === 'guided' && cur.teach ? `<div class="task-teach">${rich(cur.teach)}</div>` : ''}
      ${isGoal && run.mode === 'guided' && cur.why ? `<div class="task-why">${rich(cur.why)}</div>` : ''}
      ${isGoal && hintAt === run.doneCount && cur.hintStuck ? `<div class="task-stuck">${rich(cur.hintStuck)}</div>` : ''}
      ${isGoal && keysShown(cur) && cur.keys ? `<div class="task-keys${hintAt === run.doneCount && !(run.mode === 'guided' && cur.teach) && !revealed ? ' task-hint' : ''}">${keysHtml(cur.keys)}</div>` : ''}
      ${isGoal && nudgeAt === run.doneCount ? `<div class="goal-nudge">Try it with the keyboard${!keysShown(cur) && cur.keys ? ': the Help tab shows the keys' : ''}.</div>` : ''}
      ${conv ? `<span class="conv-chip" title="${esc(conv.name)}">${esc(conv.short)}</span>` : ''}
      ${tabNote}`;
    const fsb = card.querySelector('[data-act="fs-now"]'); if (fsb) fsb.onclick = () => { toggleFullscreen(); };
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
      p.querySelector('#revealBtn').onclick = () => { revealed = true; hinted.add(run.doneCount); startGhost(); };   // the ghost plays the keys on the sheet, then puts it back (C2 gap 9a)
    }
  }

  function renderUsed() {
    const p = $('panelBody');
    const used = shortcutsUsed(run.session.keyLog);
    const mouse = run.mouseCount;
    p.innerHTML = (used.length
      ? `<ul class="used-list">${used.map(u => `<li class="used-row"><span class="used-keys">${u.keys.split(' ').map(k => kbd(k)).join(' ')}</span><span class="used-count">${u.count > 1 ? '×' + u.count : ''}</span></li>`).join('')}</ul>`
      : `<p class="used-empty">No shortcuts yet. They are listed here as you press them, with how often.</p>`) +
      (mouse ? `<p class="used-mouse">Mouse: ${mouse} ${mouse === 1 ? 'click' : 'clicks'} on the workspace. Allowed here; the keyboard is what you are practicing.</p>` : '');
  }

  function renderActions() {
    const a = $('panelActions');
    if (phase !== 'done') {
      const overlayMode = el.classList.contains('panel-overlay');
      const open = el.classList.contains('goals-open');
      const label = open && tab !== 'lesson' ? (tab === 'help' ? 'Help' : 'Shortcuts used') : `Goals ${run.doneCount}/${run.goals.length}`;
      a.innerHTML = `<button class="btn btn-ghost" id="restartBtn" type="button">Restart</button>${overlayMode ? `<button class="btn btn-ghost" id="goalsBtn" type="button" aria-expanded="${open}">${label} ${open ? '▴' : '▾'}</button>` : ''}`;
      $('restartBtn').onclick = () => { restart(run.mode); };
      const gb = $('goalsBtn'); if (gb) gb.onclick = () => { const was = el.classList.contains('goals-open'); el.classList.toggle('goals-open'); if (was && tab !== 'lesson') { tab = 'lesson'; openedByTab = false; renderPanel(); } else renderActions(); gb.blur(); requestAnimationFrame(dockPanel); };
    } else if (overlay.hidden) {
      // the result stays one key away after "Look at the sheet": the time, Continue (Enter) and the way back to the card
      a.innerHTML = `<span class="done-bar-t">${isChallenge && lastTier ? esc(lastTier[0].toUpperCase() + lastTier.slice(1)) : isMicro ? 'Done' : 'Complete'} · ${run.startedAt == null ? '—' : fmtSecs(run.elapsed) + ' s'}</span>${doneButtonsHtml()}<button class="btn btn-ghost" data-act="show-result" type="button">Result</button>`;
      wireDoneButtons(a);
      const r = a.querySelector('[data-act="show-result"]'); if (r) r.onclick = () => renderOverlay({ again: true });
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
      // reading is free: until the first key the clock says when it starts (SITE_SPEC §5, §6a pre-run)
      // the pass par is the number Home and Learn show; the limit is named as one
      if (run.startedAt == null && phase === 'play') { t.innerHTML = `clock starts on your first key · <span class="nw">` + (lesson.pars && lesson.pars.pass ? `pass ${+lesson.pars.pass} s · limit ${+lesson.timeLimit} s` : `${+lesson.timeLimit} s`) + '</span>'; t.classList.add('pre'); return; }
      t.classList.remove('pre');
      const left = Math.max(0, lesson.timeLimit - (run.startedAt == null ? 0 : run.elapsed));
      if (run.opts.soft && left <= 0 && run.startedAt != null) { t.textContent = 'over the limit'; return; }   // a first attempt runs on; the tier is gone, the module is not
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
  const leadBold = t => { const m = /^(.*?[.!?])(\s+.*)?$/s.exec(String(t || '')); return m ? `<b>${esc(m[1])}</b>${m[2] ? esc(m[2]) : ''}` : esc(t); };
  const closingHtml = () => (lesson.wow ? `<p class="rm-wow">${rich(lesson.wow)}</p>` : '') + (lesson.closing || []).map(t => `<p class="rm-closing">${rich(t)}</p>`).join('');
  const doneTitle = () => lesson.kind === 'assessment' ? 'Assessment passed' : lesson.kind === 'testout' ? 'Tested out — chapter cleared' : lesson.kind === 'project' ? 'Project complete' : 'Lesson complete';
  function statsLine() {
    const parts = [`<b>${run.startedAt == null ? '—' : fmtSecs(run.elapsed) + ' s'}</b>`, `<b>${run.session.keyLog.length}</b> keystrokes`, modeLabel().toLowerCase() + (assisted() ? ' · assisted' : '')];
    if (run.mouseCount) parts.push(`mouse ×${run.mouseCount}`);
    if (run.mode === 'timed' && run.par) parts.push(`par ${run.par} s`);
    return parts.join(' · ');
  }
  function doneButtonsHtml() {
    if (isMicro) {
      const q = dueToday(schedule.state(), {}).items.filter(i => i.id !== lesson.concept);
      const nextDue = q[0] || null;
      return `<a class="btn btn-primary" data-act="due-next" href="${nextDue ? (nextDue.kind === 'challenge' ? '#/lesson/' + esc(nextDue.id) : '#/due/' + esc(nextDue.id)) : '#/'}">${nextDue ? 'Next due: ' + esc(nextDue.title) : 'Home'} <kbd>Enter</kbd></a>
        <button class="btn" data-act="alt" type="button">Again</button>`;
    }
    const nxt = nextLesson(lesson.id);
    // A challenge retries by seed: Enter replays the very sheet, N deals a fresh one (C2 gap 9b).
    if (isChallenge) {
      // the first pass moves the learner on (Enter continues); a replay is for the clock (Enter retries the same sheet)
      const cont = `<button class="btn${challengeLead() === 'continue' ? ' btn-primary' : ''}" data-act="continue" type="button">${nxt ? 'Continue' : 'Back to Learn'}${challengeLead() === 'continue' ? ' <kbd>Enter</kbd>' : ''}</button>`;
      const same = `<button class="btn${challengeLead() === 'retry' ? ' btn-primary' : ''}" data-act="retry-same" type="button">Retry same sheet <kbd>${challengeLead() === 'retry' ? 'Enter' : 'R'}</kbd></button>`;
      const fresh = `<button class="btn" data-act="retry-new" type="button">New sheet <kbd>N</kbd></button>`;
      return challengeLead() === 'continue' ? cont + same + fresh : same + fresh + cont;
    }
    // the module challenge replaces the old solo and timed rungs (SITE_SPEC §4): the module's last lesson names it
    if (nxt && nxt.kind === 'challenge') return `<button class="btn btn-primary" data-act="continue" type="button">Start the challenge <kbd>Enter</kbd></button>
      <a class="btn" href="#/learn">Back to Learn</a>`;
    return `<button class="btn btn-primary" data-act="continue" type="button">${nxt ? 'Continue' : 'Back to Learn'} <kbd>Enter</kbd></button>
      <button class="btn" data-act="alt" type="button">Again</button>`;
  }
  /** What Enter does on a finished challenge: continue after the first pass, retry on a replay. */
  let firstPassNow = false;
  const challengeLead = () => (firstPassNow ? 'continue' : 'retry');
  /** Restart a challenge: the same seed replays the identical sheet; a new seed deals fresh clothing. */
  function restartChallenge(newSeed) {
    run.opts.seedNo = newSeed ? undefined : run.seedNo;
    restart('challenge');
  }
  function wireDoneButtons(scope) {
    const nxt = nextLesson(lesson.id);
    const on = (act, fn) => { const b = scope.querySelector(`[data-act="${act}"]`); if (b) b.onclick = fn; };
    on('continue', () => { location.hash = nxt ? '#/lesson/' + nxt.id : '#/learn'; });
    on('alt', () => restart(isMicro ? 'guided' : run.mode));
    on('retry-same', () => restartChallenge(false));
    on('retry-new', () => restartChallenge(true));
    on('look', closeOverlay);
    // after a timed or challenge run: watch the reference route play over the finished sheet, then it goes back
    on('route', () => { closeOverlay(); startGhost(parseKeyScript(lesson.solution)); });
  }
  /** One line naming the next lesson's job: the first sentence of its brief (or read, or its title). */
  /** The chapter's ending (C2 Run 4): the project finishes on the print preview of the KPI page, the checks green, and one line of what the associate would have flagged. */
  function projectEndHtml() {
    try {
      const wb = WORKBOOKS[lesson.workbook]; if (!wb) return '';
      const entry = run.session.sheets.find(x => x.name === 'Report') || run.session.sheets[0];
      const after = wb.stateOf(lesson.state.after);
      const afterRep = after.sheets.find(x => x.name === entry.name) || after.sheets[0];
      const checks = Object.keys(afterRep.cells || {}).filter(ref => /^B\d+$/.test(ref) && afterRep.cells[ref].formula && /^=.*(-|IF\()/.test(afterRep.cells[ref].formula) && +ref.slice(1) > 15);
      const line = associateLine(wb.diffStates(wb.sessionToState(run.session), after), entry.name);
      return `<div class="rm-preview">${printPreviewHtml(entry.sheet, run.session.settings.pageSetup || {}, { checks, tab: entry.name })}<p class="rm-assoc">${esc(line)}</p></div>`;
    } catch (e) { return ''; }
  }
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
  function renderOverlay(o = {}) {
    // Bare numbers, the clean-sheet mark, the XP count-up and the next job — no comparison
    // sentences, no before/after view (C2 gap 9b). One accent for the number that matters.
    const secs = run.startedAt == null ? null : run.elapsed;
    const opt = run.optimalKeys;
    const TIERS = ['pass', 'pro', 'legendary'];
    const tierIx = lastTier ? TIERS.indexOf(lastTier) : -1;
    const numLabel = itemNumber(lesson, at) || String(lessonNumber(lesson.id));
    const lessonLine = isMicro ? 'Due today · ' + esc(lesson.title)
      : isChallenge ? esc(numLabel) + ' · Challenge · ' + esc(challengeName(lesson.title))
      : esc(numLabel) + ' · ' + esc(lesson.title) + ' · ' + modeLabel();
    const saveBox = firstEver && store.saveState() === 'device';
    overlay.innerHTML = `<div class="rm-card rm-in">
      <div class="rm-title" id="doneTitle">${isChallenge && lastTier ? esc(lastTier[0].toUpperCase() + lastTier.slice(1)) : isMicro ? 'Done' : doneTitle()}</div>
      <div class="rm-lesson">${lessonLine}</div>
      ${lesson.race ? raceHtml() : `<div class="rm-time">${secs == null ? '—' : fmtSecs(secs)}<span>s</span></div>`}
      ${(isChallenge || timedOnly) && lesson.pars ? `<div class="tier-stamps">${TIERS.map((t, i) => `<span class="tstamp${i === tierIx ? ' got tier-' + t : i < tierIx ? ' hit' : ''}">${i < tierIx ? '✓ ' : ''}${t} ${lesson.pars[t]}s</span>`).join('')}</div>` : ''}
      <div class="rm-stats"><div>keys<b>${run.session.keyLog.length}${isChallenge && opt ? ' / ' + opt : ''}</b></div>${run.mouseCount ? `<div>mouse<b>×${run.mouseCount}</b></div>` : ''}${run.mode === 'timed' && run.par ? `<div>par<b>${run.par} s</b></div>` : ''}${xpGained ? `<div>earned<b class="rm-xp">+0 XP</b></div>` : ''}</div>
      ${lastTimedOut ? `<div class="rm-note">${timedOnly ? `Over the limit — no tier, and the ${lesson.kind === 'testout' ? 'chapter is not skipped' : 'gate is not passed'}. The run still counts; the next attempt runs against a hard clock.` : 'Over the limit — no tier. The module still counts.'}</div>` : ''}
      ${lastClean ? `<div class="rm-clean">✓ Clean sheet — no mouse, no help</div>` : assisted() ? `<div class="rm-note">Assisted — steps were shown on request.</div>` : ''}
      ${deliveredNow ? `<div class="rm-page"><div class="rm-page-slot" aria-hidden="true">${pageThumbHtml(at.module, true)}</div><div class="rm-page-line">${esc(pageDelivered(at))}</div></div>` : ''}
      ${lesson.kind === 'project' && next ? projectEndHtml() : ''}
      ${closingHtml() ? `<div class="rm-closing-block">${closingHtml()}</div>` : ''}
      ${isMicro ? '' : nextJobHtml()}
      ${saveBox ? `<div class="rm-save"><b>Your first lesson is done.</b> Progress is saved on this device. <a href="#/account">Create a free account</a> to keep it across devices — everything you have done carries over.</div>` : ''}
      ${installOffer ? `<div class="rm-save rm-install">${leadBold(siteCopy('install_prompt', INSTALL_PROMPT))} <span class="rm-install-acts"><button class="btn" data-act="install" type="button">Install</button><button class="btn btn-ghost" data-act="install-no" type="button">Not now</button></span></div>` : ''}
      <div class="rm-opts">${doneButtonsHtml()}</div>
      <div class="rm-foot"><button class="rm-link" data-act="look" type="button">Look at the sheet <kbd>Esc</kbd></button>${(run.mode === 'timed' || isChallenge) && lesson.solution ? '<button class="rm-link" data-act="route" type="button">Watch the reference route</button>' : ''}${saveBox || !saveState ? '' : `<span class="rm-more">${esc(saveState)}</span>`}</div>
    </div>`;
    wireDoneButtons(overlay);
    countUpXp(overlay);
    if (installOffer) {
      // the offer counts as made once it is answered, or once it has been on screen for 3 s — not the moment it renders
      track('install_prompt', { outcome: 'shown' });
      const stamp = () => { if (!prefs.get().installPromptAt) prefs.set({ installPromptAt: Date.now() }); };
      const seen = setTimeout(() => { if (!overlay.hidden && overlay.querySelector('.rm-install')) stamp(); }, 3000);
      overlay.querySelector('[data-act="install"]').onclick = async () => { clearTimeout(seen); stamp(); const r = await promptInstall(); track('install_prompt', { outcome: r }); const c = overlay.querySelector('.rm-install'); if (c) c.remove(); };
      overlay.querySelector('[data-act="install-no"]').onclick = () => { clearTimeout(seen); stamp(); track('install_prompt', { outcome: 'dismissed' }); const c = overlay.querySelector('.rm-install'); if (c) c.remove(); };
    }
    overlay.hidden = false;
    document.body.classList.add('hk-result-open');
    if (!isMicro && !o.again) burst(overlay.querySelector('.rm-card'), firstEver ? 22 : 12);
    if (o.again) overlay.querySelector('.rm-card').classList.remove('rm-in');
    const primary = overlay.querySelector('.rm-opts .btn-primary'); if (primary) primary.focus();
  }
  /**
   * The lesson-complete burst (SITE_SPEC §6a): small cells and keycaps in the theme's own colours
   * fly out from behind the card for under a second, transform and opacity only; bigger the first
   * time; any key ends it; reduced motion and 'Celebrations: Off' get none.
   */
  function burst(card, n) {
    if (!card || !effects.visualsOn || !effects.visualsOn()) return;
    const box = document.createElement('div'); box.className = 'rm-burst'; box.setAttribute('aria-hidden', 'true');
    const glyphs = ['Ctrl', 'Alt', '↵', 'F2', '⇧', 'Tab', '', '', '', ''];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (i % 3) * 0.37, d = 150 + (i % 4) * 34;
      const piece = document.createElement('i');
      const g = glyphs[i % glyphs.length];
      piece.className = g ? 'rm-bit rm-bit-key' : 'rm-bit rm-bit-cell' + (i % 2 ? ' dim' : '');
      piece.textContent = g;
      piece.style.setProperty('--dx', Math.round(Math.cos(a) * d * 1.35) + 'px');
      piece.style.setProperty('--dy', Math.round(Math.sin(a) * d) + 'px');
      piece.style.setProperty('--rot', ((i * 47) % 90 - 45) + 'deg');
      piece.style.animationDelay = (i % 5) * 18 + 'ms';
      box.appendChild(piece);
    }
    overlay.insertBefore(box, card);
    const end = () => { box.remove(); document.removeEventListener('keydown', end, true); };
    document.addEventListener('keydown', end, true);
    setTimeout(end, 1100);
  }
  function closeOverlay() { overlay.hidden = true; document.body.classList.remove('hk-result-open'); renderActions(); focusWorkspace(); }
  /** The time limit ran out on an assessment or test-out: nothing is recorded, the run offers itself again. */
  function timeUp() {
    stopDemo();
    phase = 'timeup';
    busyOn = false; if (effects.setBusy) effects.setBusy(false);
    track('lesson_timeup', { lesson_id: lesson.id, mode: run.mode });
    if (timerH) { clearInterval(timerH); timerH = null; }
    renderPanel();
    overlay.innerHTML = `<div class="rm-card">
      <div class="rm-title" id="doneTitle">Time’s up — try again</div>
      <div class="rm-lesson">${esc(itemNumber(lesson, at) || String(lessonNumber(lesson.id)))} · ${esc(lesson.title)}</div>
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
  let installOffer = false;
  function finish() {
    phase = 'done';
    stopStuck();
    track('lesson_complete', { lesson_id: lesson.id, mode: run.mode });
    if (isMicro) {
      // a micro-drill: one memory note, nothing recorded, no XP (the queue is an offer, not a ledger)
      lastClean = !assisted() && !run.mouseCount; lastTier = null; xpGained = 0; saveState = '';
      schedule.note([lesson.concept], scheduleGrade({ ok: true, secs: run.elapsed, hint: assisted() }));
      if (timerH) { clearInterval(timerH); timerH = null; }
      effects.finish($('stage'));
      tab = 'lesson'; renderPanel(); renderOverlay();
      return;
    }
    const ctxBefore = gameCtx();
    const before = store.all();
    firstEver = !Object.values(before).some(p => p.completed);
    const completedCount = Object.values(before).filter(p => p.completed).length + (before[lesson.id] && before[lesson.id].completed ? 0 : 1);
    installOffer = next && shouldOfferInstall(prefs.get(), completedCount, installAvailable());
    lastClean = !assisted() && !run.mouseCount;
    // A clean challenge earns the tier its time and its keystrokes reach (pro ≤ 1.5× the reference
    // route, legendary ≤ 1.2×); help, mouse or a run past the limit records the pass with none.
    lastTimedOut = (isChallenge || timedOnly) && run.timedOut;
    lastTier = null;
    if ((isChallenge || timedOnly) && lastClean && lesson.pars) {
      const t = tierFor(run.elapsed, lesson.pars, { keys: run.session.keyLog.length, optimalKeys: run.optimalKeys, timedOut: lastTimedOut });
      lastTier = t === 'none' ? null : t;
    }
    const wasFirst = !!run.opts.soft;
    if (isChallenge) track('challenge_result', { ref: lesson.id, tier: lastTier || 'none', secs: Math.round(run.elapsed * 10) / 10, keys: run.session.keyLog.length, first: wasFirst, timed_out: lastTimedOut });
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
        seed: Number.isInteger(run.seedNo) ? run.seedNo : null,
        secs: run.elapsed, keys: run.session.keyLog.length,
        clean: lastClean, helped: assisted(), mouse: run.mouseCount,
        tier: lastTier || 'none', first: wasFirst, timedOut: lastTimedOut,
        splits: run.splits().filter(Number.isFinite), trace: traceOf(run.session.keyLog), at: Date.now(),
      });
      // a challenge reached from the Daily (drills.js registers the module challenges) is today's Daily attempt too
      if (isChallenge && dailyOpt) store.addAttempt({ id: attemptId(), kind: 'daily', ref: lesson.id, day: dayOf(), seed: Number.isInteger(run.seedNo) ? run.seedNo : null, secs: run.elapsed, keys: run.session.keyLog.length, clean: lastClean, helped: assisted(), mouse: run.mouseCount, tier: lastTier || 'none', splits: run.splits().filter(Number.isFinite), trace: traceOf(run.session.keyLog), at: Date.now() });
    }
    // A finished assessment or test-out inside its time limit passes the chapter gate (§7);
    // a test-out also marks every not-yet-completed chapter lesson skipped, like placement does.
    if (timedOnly && !lastTimedOut) {   // a soft first attempt that ran over completes the item, not the gate
      store.chapterPass(lesson.chapter, lesson.kind);
      if (lesson.kind === 'testout' && chapter) {
        const all = store.all();
        const ids = chapter.lessons.filter(l => l.id !== lesson.id && !(all[l.id] && all[l.id].completed)).map(l => l.id);
        if (ids.length) store.skip(ids);
      }
    }
    saveState = saved ? null : 'Couldn’t save on this device (storage blocked); the lesson still counts for this visit';
    xpGained = Math.max(0, gameCtx().xp - ctxBefore.xp);
    if (timerH) { clearInterval(timerH); timerH = null; }
    effects.finish($('stage'));
    if (lastClean && effects.cleanSheet) effects.cleanSheet();
    // the module's page goes into the pack the first time its challenge passes, and only then
    // (a page passed before this device knew — signed in elsewhere, an older run — was delivered then: noted quietly)
    const passedBefore = !!(before[lesson.id] && before[lesson.id].completed);
    const knownPage = at && prefs.get().pagesDelivered.includes(at.module.id);
    const deliverer = isChallenge || lesson.kind === 'project';
    if (deliverer && at && passedBefore && !knownPage) prefs.set({ pagesDelivered: [...prefs.get().pagesDelivered, at.module.id] });
    deliveredNow = !!(next && deliverer && at && !knownPage && !passedBefore);
    firstPassNow = isChallenge && !passedBefore;
    if (deliveredNow) { prefs.set({ pagesDelivered: [...prefs.get().pagesDelivered, at.module.id] }); if (effects.packPage) effects.packPage(); }
    busyOn = false; if (effects.setBusy) effects.setBusy(false);   // the run has ended: queued achievements may show now
    celebrate(effects, ctxBefore);
    const lv = wrap.querySelector('#wsLevel'); if (lv) { const c2 = gameCtx(); lv.innerHTML = `L${c2.level} <i>${c2.levelInfo.into}/${c2.levelInfo.need} XP</i>`; }
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
    phase = 'play'; revealed = false; nudgeAt = -1; prevDone = 0; overlay.hidden = true; tab = 'lesson'; lastTimedOut = false; deliveredNow = false;
    cardDone = 0; cardHold = 0; if (cardHoldH) { clearTimeout(cardHoldH); cardHoldH = null; } usedSeen = null; glowQuiet = false; openedByTab = false;
    busyOn = false; if (effects.setBusy) effects.setBusy(false);
    document.body.classList.remove('hk-result-open'); el.classList.remove('goals-open');
    run.opts.soft = firstAttempt();   // the second attempt onward runs against a hard limit
    cueGoal = -1; dockedGoal = -1; cueTarget = null; lastSheet = -1; hintAt = -1; hinted.clear(); notedDone = 0; stopStuck();
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

  /* ---------------- the experience pass: cues, the stuck hint, memory notes, the story beat ---------------- */
  /** A new current goal: pulse its target once, remember its Ribbon route, arm the stuck hint. Every change: re-glow the route's next control. */
  function cueCurrent() {
    if (!cuesOn || phase !== 'play') return;
    const cur = run.current;
    if (run.doneCount !== cueGoal) {
      cueGoal = run.doneCount; hintAt = -1; glowQuiet = false;
      clearPulse(el);
      cueTokens = cur ? altPath(cur.keys) : [];
      if (cur && !demo && !ghost) {
        cueTarget = inferTarget(cur, (run.session.sheets || []).map(x => x.name));
        pulseTarget(sheetView, cueTarget, activeSheetName(), $('sheetTabs'));
      } else cueTarget = null;
      lastSheet = run.session.sheetIndex;
      dockPinned = false;
      armStuck();
    }
    const glowing = routeGlow();
    markTargetTab();
    // another sheet came up: the old sheet's ring goes, and arriving where the target is pulses it there once
    let moved = false;
    if (run.session.sheetIndex !== lastSheet) {
      lastSheet = run.session.sheetIndex; moved = true;
      clearPulse(sheetView && sheetView.gw);
      const { sheet, tab } = targetParts(cueTarget);
      if (cueTarget && !tab && sheet && sheet.toLowerCase() === String(activeSheetName()).toLowerCase()) pulseTarget(sheetView, cueTarget, activeSheetName(), $('sheetTabs'));
    }
    // the card follows the glow (a Ribbon goal: beside the tab, then beside the group's control as the route is walked)
    const hasBox = !!currentTargetBox();
    if (moved || run.doneCount !== dockedGoal || (!hasBox && glowing !== dockedGlow)) { dockedGoal = run.doneCount; dockedGlow = glowing; dockPanel(); }
  }
  /** ~8 s on one goal: the keys appear as a hint; ~20 s: the Help tab pulses. Both stop when the goal lands. */
  function armStuck() {
    stopStuck();
    if (!next || run.mode === 'timed' || run.mode === 'challenge' || timedOnly) return;
    const idx = run.doneCount;
    stuckH = setTimeout(() => { if (phase === 'play' && run.doneCount === idx && !demo && !ghost) { hintAt = idx; hinted.add(idx); renderTaskCard(); } }, 8000);
    helpH = setTimeout(() => { if (phase === 'play' && run.doneCount === idx) { const t = $('tabHelp'); if (t) t.classList.add('pulse'); } }, 20000);
  }
  function stopStuck() { if (stuckH) clearTimeout(stuckH); if (helpH) clearTimeout(helpH); stuckH = helpH = null; const t = $('tabHelp'); if (t) t.classList.remove('pulse'); }
  /** Every goal that just landed feeds the queue: its shortcuts, graded by how long it took and whether a hint was shown. */
  function noteGoals() {
    if (isMicro) return;   // the micro-drill notes itself on finish
    const splits = run.splits();
    while (notedDone < run.doneCount) {
      const i = notedDone++;
      const g = run.goals[i]; if (!g || !Array.isArray(g.requires) || !g.requires.length) continue;
      schedule.note(g.requires, scheduleGrade({ ok: true, secs: splits[i], hint: hinted.has(i) }));
    }
  }
  /** The module's story beat, once, before the first lesson of the module (decision 4). */
  function showBeat() {
    const b = next ? beatFor(lesson, at, prefs.get().beatsSeen) : null;
    if (!b) return;
    beat = document.createElement('div');
    beat.className = 'ws-beat'; beat.setAttribute('role', 'dialog'); beat.setAttribute('aria-modal', 'true'); beat.setAttribute('aria-labelledby', 'beatTitle');
    beat.innerHTML = `<div class="ws-beat-card"><div class="fr2-card-eyebrow">${esc(b.eyebrow)}</div><h1 id="beatTitle">${esc(b.title)}</h1><p>${esc(b.body)}</p>
      <div class="ws-beat-acts"><button class="btn btn-primary" type="button" id="beatGo">Start the job <kbd>Enter</kbd></button></div></div>`;
    root.appendChild(beat);
    beat.querySelector('#beatGo').onclick = closeBeat;
    beat.querySelector('#beatGo').focus();
    stopStuck();
  }
  function closeBeat() {
    if (!beat) return;
    const id = beat.dataset.id || (lesson.module || '');
    beat.remove(); beat = null;
    prefs.set({ beatsSeen: [...prefs.get().beatsSeen, lesson.module].filter(Boolean) });
    focusWorkspace(); armStuck();
    void id;
  }

  /* ---------------- the floating panel (B4): beside the goal's target, a cell or two away ---------------- */
  const activeSheetName = () => { const sh = run.session.sheets && run.session.sheets[run.session.sheetIndex]; return sh ? sh.name : null; };
  /** The current goal's target on the sheet that shows, in .gridwrap content pixels, or null (another sheet, a tab, nothing). */
  function currentTargetBox() { return cueTarget && sheetView ? unionBox(targetBoxes(sheetView, cueTarget, activeSheetName())) : null; }
  /** The target sits on a sheet the learner is not on (its tab is the cue until they get there). */
  const targetElsewhere = () => { const { sheet } = targetParts(cueTarget); return !!sheet && String(sheet).toLowerCase() !== String(activeSheetName()).toLowerCase(); };
  /**
   * The Ribbon route's glow, with two quiet spells: after the learner Esc-es all the way out of a
   * route it waits for the next Alt (the brief: the glow clears on Esc), and while the goal's sheet
   * is elsewhere the tab is the cue, not the Ribbon. Returns how many controls glow.
   */
  function routeGlow() {
    const path = run.session.path || []; const mode = run.session.mode;
    if (mode === 'ribbon') glowQuiet = false;   // the next Alt brings the glow back
    const tokens = glowQuiet || targetElsewhere() ? [] : cueTokens;
    return glowRibbon($('ribbon'), tokens, path, mode, document.getElementById('ribbonDrop'));
  }
  /** The goal's sheet, while the learner is elsewhere, keeps a quiet accent on its tab (the pulse alone is easy to miss). */
  function markTargetTab() {
    const tabsEl = $('sheetTabs'); if (!tabsEl) return;
    for (const t of tabsEl.querySelectorAll('.wb-tab.cue-target')) t.classList.remove('cue-target');
    if (!cueTarget || !targetElsewhere() || phase !== 'play') return;
    const { sheet } = targetParts(cueTarget);
    const t = [...tabsEl.querySelectorAll('.wb-tab')].find(x => x.textContent.trim().toLowerCase() === String(sheet).toLowerCase());
    if (t) t.classList.add('cue-target');
  }
  /** An open workbook dialog or Ribbon menu, in viewport pixels, or null. */
  function openOverlayRect() {
    for (const d of document.querySelectorAll('#ribbonDrop, .pd-box')) { const r = d.getBoundingClientRect(); if (r.width > 0 && r.height > 0) return r; }
    return null;
  }
  /** The filled cells showing, in the visible box's pixels: what the learner is reading, which the card keeps off. */
  function readingCells(gw) {
    const out = []; const grid = sheetView && sheetView.grid; if (!grid) return out;
    const sl = gw.scrollLeft, st = gw.scrollTop, W = gw.clientWidth, H = gw.clientHeight;
    for (const td of grid.querySelectorAll('td[data-r]')) {
      if (!td.textContent.trim()) continue;
      const left = td.offsetLeft - sl, top = td.parentElement.offsetTop - st;
      if (left > W || top > H || left + td.offsetWidth < 0 || top + td.offsetHeight < 0) continue;
      out.push({ left, top, width: td.offsetWidth, height: td.offsetHeight });
      if (out.length > 1200) break;
    }
    return out;
  }
  /** Place the card next to the current goal's target (the side over the least content), under the glowing Ribbon control for a Ribbon goal, else over the emptiest corner. */
  function dockPanel() {
    if (!overlayMode || !sheetView || !sheetView.gw) return;
    const gw = sheetView.gw; const panelEl = $('panel'); if (!panelEl) return;
    const g = gw.getBoundingClientRect(); const l = el.getBoundingClientRect();
    if (!g.width || !g.height) return;
    const b = sheetView.box() || { x0: 0, y0: 0 };
    // the visible box, less the part below the window's bottom edge (a tall sheet on a short screen)
    const box = { w: g.width, h: Math.max(160, Math.min(g.height, window.innerHeight - g.top - 8)), x0: b.x0, y0: b.y0 };
    // the target in the visible box's pixels (scrolled; the sticky headers stay at the box's top and left)
    const tb = currentTargetBox();
    const t = tb ? { left: tb.left - gw.scrollLeft, top: tb.top - gw.scrollTop, width: tb.width, height: tb.height } : null;
    // the card's natural size, not the one the last dock clamped it to (else it shrinks a little every dock)
    const prevMax = panelEl.style.maxHeight; panelEl.style.maxHeight = 'none';
    const pw = Math.min(panelEl.offsetWidth || 380, box.w - 24), ph = Math.min(panelEl.offsetHeight || 260, box.h - 24);
    panelEl.style.maxHeight = prevMax;
    // a Ribbon goal: the glowing control's span, in box pixels (the card docks under the bar beside it)
    let ribbon = null;
    if (!t && cueTokens.length) {
      const glow = el.querySelector('#ribbon .cue-glow, #ribbonDrop .cue-glow');
      if (glow) { const r = glow.getBoundingClientRect(); ribbon = { left: r.left - g.left, right: r.right - g.left }; }
    }
    // never over: the active cell and the selection (unless it is most of the sheet), an open dialog or menu (SITE_SPEC §6a)
    const hard = [];
    const sel = run.session.sheet && run.session.sheet.selectionText ? run.session.sheet.selectionText() : '';
    for (const sb of targetBoxes(sheetView, sel, null)) {
      const r = { left: sb.left - gw.scrollLeft, top: sb.top - gw.scrollTop, width: sb.width, height: sb.height };
      if (r.width * r.height < 0.3 * box.w * box.h) hard.push(r);
    }
    const ov = openOverlayRect(); if (ov) hard.push({ left: ov.left - g.left, top: ov.top - g.top, width: ov.width, height: ov.height });
    const pick = placeNear(box, t, { w: pw, h: ph }, { prefer: dockPinned ? [dock] : [], ribbon, keep: dockRect ? { side: dock, rect: dockRect } : null, obstacles: readingCells(gw), hard });
    dock = pick.side; dockRect = pick.rect;
    // never over the ribbon or the formula bar: the box starts under them, so a rect inside it is clear of both
    panelEl.style.left = (g.left - l.left + pick.rect.left) + 'px';
    panelEl.style.top = (g.top - l.top + pick.rect.top) + 'px';
    panelEl.style.maxHeight = Math.max(120, box.h - pick.rect.top - 12) + 'px';   // the whole card, footer included, stays inside the sheet box
    el.dataset.dock = dock;
  }
  /**
   * Typing into a cell folds the card to a one-line pill so the entry has room — calmly: it folds
   * 150 ms into the edit (a keystroke that commits at once never folds it), and unfolds when the
   * edit ends by Enter, Tab or Esc and stays ended for 180 ms (a Tab run from cell to cell stays
   * folded instead of flickering open between entries).
   */
  function setPill(editing) {
    if (pillH) { clearTimeout(pillH); pillH = null; }
    if (editing === pill) return;
    pillH = setTimeout(() => {
      pillH = null;
      if (!!run.session.editing !== editing || editing === pill) return;
      pill = editing; el.classList.toggle('pill', pill);
      if (!pill) dockPanel();
      else if (sheetView && sheetView.gw) {
        const pnl = $('panel'); const gr = sheetView.gw.getBoundingClientRect(); const pr = pnl.getBoundingClientRect();
        if (pr.right > gr.right - 12) pnl.style.left = (parseFloat(pnl.style.left || '0') - (pr.right - gr.right + 12)) + 'px';
      }
    }, editing ? 150 : 180);
  }
  function onSheetScroll() { if (scrollRaf) return; scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; dockPanel(); }); }
  /** Ctrl+Shift+J: ask for the next side by hand (sticks until the next goal; a side that does not fit falls through to the next). */
  function cycleDock() { if (!overlayMode) return; dockPinned = true; dock = SIDES[(SIDES.indexOf(dock) + 1) % SIDES.length]; dockPanel(); showToast('Panel: ' + { right: 'right of the target', below: 'below the target', left: 'left of the target', above: 'above the target', ribbon: 'under the Ribbon group', free: 'top right' }[dock]); }
  /** Ctrl+Shift+K: hide or show the panel (a small pill stays so it can come back by mouse). */
  function togglePanel() { const hidden = el.classList.toggle('panel-hidden'); let b = el.querySelector('#panelShow'); if (hidden && !b) { b = document.createElement('button'); b.type = 'button'; b.id = 'panelShow'; b.className = 'panel-show'; b.textContent = 'Show panel · Ctrl+Shift+K'; b.onclick = togglePanel; el.appendChild(b); } else if (!hidden && b) b.remove(); if (!hidden) dockPanel(); focusWorkspace(); }
  const onResize = () => dockPanel();
  window.addEventListener('resize', onResize);

  /* ---------------- tabs ---------------- */
  const TABS = ['lesson', 'help', 'used'];
  let openedByTab = false;
  function selectTab(name, focus) {
    tab = name;
    // the floating card keeps its body folded; Help (F1) and Shortcuts used open it, Lesson folds it back to the goals toggle
    if (overlayMode) { if (name !== 'lesson') el.classList.add('goals-open'); else if (openedByTab) el.classList.remove('goals-open'); openedByTab = name !== 'lesson'; }
    renderPanel(); if (overlayMode) requestAnimationFrame(dockPanel);
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
  divider.addEventListener('pointermove', e => { if (drag) setPanelW(drag.w + (drag.x - e.clientX) * (prefs.get().panelSide === 'left' ? -1 : 1)); });
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
    if (next && e.ctrlKey && e.shiftKey && !e.altKey && (e.key === 'K' || e.key === 'k')) { e.preventDefault(); togglePanel(); return; }
    if (next && e.ctrlKey && e.shiftKey && !e.altKey && (e.key === 'J' || e.key === 'j')) { e.preventDefault(); cycleDock(); return; }
    if (beat) { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); closeBeat(); } else if (e.key.length > 1) e.preventDefault(); return; }
    if (!overlay.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); }
      else if (isChallenge && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); restartChallenge(true); }
      else if (isChallenge && (e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); restartChallenge(false); }
      else if (e.key === 'Enter' && !(tag === 'BUTTON' || tag === 'A')) {
        e.preventDefault();
        const b = overlay.querySelector('.rm-opts .btn-primary');
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
      if (e.key === 'Enter') { e.preventDefault(); const c = el.querySelector('#panelActions .btn-primary') || el.querySelector(isChallenge ? (challengeLead() === 'continue' ? '[data-act="continue"]' : '[data-act="retry-same"]') : isMicro ? '[data-act="due-next"]' : '[data-act="continue"]'); if (c) c.click(); }
      else if (isChallenge && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); restartChallenge(true); }
      else if (isChallenge && (e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); restartChallenge(false); }
      return;
    }
    const wasRibbon = run.session.mode === 'ribbon';
    if (run.key(e)) { e.preventDefault(); effects.armSounds(); if (!busyOn && effects.setBusy) { busyOn = true; effects.setBusy(true); } }
    // Esc took the learner all the way out of the Ribbon: the route's glow clears until the next Alt
    if (e.key === 'Escape' && wasRibbon && run.session.mode !== 'ribbon' && cuesOn && phase === 'play') { glowQuiet = true; routeGlow(); }
  }
  function onKeyUp(e) { if (e.key === 'Alt') e.preventDefault(); }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  timerH = setInterval(renderTimer, 200);

  mountViews();
  renderPanel();
  focusWorkspace();
  maybeStartDemo();
  cueCurrent();
  showBeat();
  if (overlayMode) {
    requestAnimationFrame(dockPanel);
    $('panel').addEventListener('click', e => { if (el.classList.contains('pill') && !e.target.closest('button, a')) { el.classList.remove('pill'); el.classList.add('goals-open'); renderActions(); dockPanel(); } });
  }
  return {
    destroy() {
      if (ghost) { clearInterval(ghost.timer); ghost = null; run.endGhost(); }
      stopDemo(); stopStuck();
      if (beat) { beat.remove(); beat = null; }
      document.removeEventListener('fullscreenchange', onFs);
      window.removeEventListener('resize', onResize);
      if (sheetView && sheetView.gw) sheetView.gw.removeEventListener('scroll', onSheetScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (pillH) clearTimeout(pillH);
      if (cardHoldH) clearTimeout(cardHoldH);
      if (glowObs) glowObs.disconnect();
      if (onDocClick) document.removeEventListener('click', onDocClick);
      window.removeEventListener('focus', paintFocusHint); window.removeEventListener('blur', paintFocusHint);
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp);
      if (timerH) clearInterval(timerH);
      if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (sheetTabs) sheetTabs.destroy();
      keycaps.destroy(); if (effects.destroy) effects.destroy();
      document.body.classList.remove('hk-result-open');
      overlay.remove(); el.remove(); wrap.remove();
    },
  };
}
