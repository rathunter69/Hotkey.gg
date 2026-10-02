// app2/app/lesson-view.js — the lesson workspace (screenplay 3.0 "The workspace", "The task card",
// "The timed run", "Lesson complete"; 3.7, 3.8, 3.9; M90, M91, M93). The sheet gets the window. The
// chrome is one title row folded into the Ribbon's tab row (ui/components/chrome.js); a lesson
// talks through the task card that points (task-card.js) and the four other marks on the sheet
// (sheet-marks.js); a challenge, an assessment and lesson complete use the one run panel at the
// right of the sheet (run-panel.js). The engine (app/runner.js) grades the sheet's end state and
// plays demos and ghosts; this file paints from it and never grades.
import { LessonRun, shortcutsUsed } from './runner.js';
import { parseKeySpec } from '../engine/keyboard.js';
import { store } from './store.js';
import { attemptId, dayOf, traceOf } from './records.js';
import { tierFor } from './pars.js';
import { gameCtx, celebrate } from './stats.js';
import { track } from './telemetry.js';
import { nextLesson, chapterOf, moduleOf, CHAPTERS } from '../content/index.js';
import { CONVENTIONS } from '../content/conventions.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountSheetTabs } from '../ui/sheet-tabs.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { mountEffects } from '../ui/effects.js';
import { showToast } from '../ui/toast.js';
import { prefs, keyLabel } from './prefs.js';
import { inferTarget, altPath, glowRibbon, targetBoxes, targetParts, unionBox, rangesOf, rangeCorners } from '../ui/cues.js';
import { moduleNumber, itemNumber, isFinalItem, FINAL_MODULE } from './numbering.js';
import { beatFor, pageDelivered } from './beats.js';
import { schedule, grade as scheduleGrade, dueToday, FAST_SECS } from './schedule.js';
import { keyStates, keyIdsForConcept } from './key-states.js';
import { awardSync } from './award-sync.js';
import { shouldOfferInstall, installAvailable, promptInstall, INSTALL_PROMPT } from './install.js';
import { siteCopy } from '../content/copy/apply.js';
import { settings } from './settings.js';
import { fitZoomFor, opensFitted } from './zoom.js';
import { pace } from './run-record.js';
import { createChecklist, landTo, assist as assistTask } from './checklist.js';
import { titleAt, rewardAt } from '../content/levels.js';
import { recordRun } from './quest-loop.js';
import { equipReward } from './cosmetics.js';
import { createChrome, confirmDialog, lessonRows, isExitKey, EXIT_KEY, sheetKeys, noteSheetKey, sheetKeysDelivered, canFullscreen, fullscreenKeys } from '../ui/components/chrome.js';
import { createTaskCard, placeCard, routeTokens, routeProgress, liveLine, stuckLine, SIDES, alternates, offRoute, tryLine, worksToo, worksTooLine } from '../ui/components/task-card.js';
import { paintTarget, paintNote, paintPen, paintCheck, clearMarks, pingMark, paintBeacon } from '../ui/components/sheet-marks.js';
import { createFocusVeil } from '../ui/components/focus-veil.js';
import { parseMs } from '../ui/effects.js';
import { refKey } from '../engine/refs.js';
import { createRunPanel, fmtPar, aboutLength } from '../ui/components/run-panel.js';

const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb, vars) => fill(siteCopy(key, fb), vars);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KIND_WORD = { project: ['ws_kind_project', 'project'], assessment: ['ws_kind_assessment', 'assessment'], testout: ['ws_kind_testout', 'test out'] };
/** The once-in-the-browser line on the first goal that uses Ctrl+PgUp/PgDn; site.csv tab_keys_note overrides. */
export const TAB_KEYS_NOTE = 'Your browser keeps Ctrl+PgDn and Ctrl+PgUp for its own tabs, so here Alt+PgDn and Alt+PgUp switch sheets and count the same. Full screen, from the button by the sheet tabs, or the installed app hands the real keys to the sheet.';
/** The marks a new goal clears; the ping keeps playing through the change. */
const GOAL_MARKS = ['target', 'note', 'pen', 'check', 'beacon'];
const clearGoalMarks = gw => { for (const k of GOAL_MARKS) clearMarks(gw, k); };
/** How long a learner may be off the route before the card says so (--d-wrong-wait). */
const wrongWait = () => { try { return parseMs(getComputedStyle(document.documentElement).getPropertyValue('--d-wrong-wait')) || 1200; } catch (e) { return 1200; } };
const HOLD_DONE = 420;      // the ticked goal stays on the card this long before the glide (the tick, then the card moves)
const GHOST_MS = 350, DO_MS = 180;

export function mountLessonView(root, lesson, { mode = 'guided', seed: seedOpt, daily: dailyOpt } = {}) {
  const chapter = chapterOf(lesson);
  const at = moduleOf(lesson);
  const isChallenge = lesson.kind === 'challenge';
  const timedOnly = lesson.kind === 'assessment' || lesson.kind === 'testout';
  const timed = isChallenge || timedOnly;        // the one panel's four beats
  const isMicro = lesson.kind === 'micro';        // a due-today rep: no record, no XP, one memory note
  if (timedOnly) mode = 'timed'; else if (isChallenge) mode = 'challenge';
  const chapterOne = !!chapter && chapter.id === 'foundations';
  let cfg = settings.get();
  const platform = () => cfg.keyLabels || prefs.platform();
  if (isChallenge) document.body.dataset.mode = 'challenges';

  /* ---------------- the chrome ---------------- */
  const kindWord = KIND_WORD[lesson.kind];
  const subtitle = isMicro ? siteCopy('ws_sub_due', 'Due today')
    : isChallenge && at ? t('ws_sub_challenge', '{module}, challenge', { module: moduleNumber(at.module.id, at.k) })
    : kindWord ? t('ws_sub_item', '{module}, {kind}', { module: FINAL_MODULE.n, kind: siteCopy(kindWord[0], kindWord[1]) })
    : at ? t('ws_sub_lesson', '{module}, lesson {n} of {m}', { module: moduleNumber(at.module.id, at.k), n: at.n, m: at.of }) : '';
  const moduleLessons = at ? at.module.lessons.map(l => ({ id: l.id, num: itemNumber(l, moduleOf(l)), title: l.title, href: '#/lesson/' + encodeURIComponent(l.id) })) : null;
  const chrome = createChrome(root, {
    kind: isChallenge ? 'challenge' : timedOnly ? 'assessment' : 'lesson', title: lesson.title, subtitle, lessons: moduleLessons, hasCard: !timed,
    onBack: () => askLeave(), onPick: id => { if (id !== lesson.id) location.hash = '#/lesson/' + encodeURIComponent(id); },
    onMore: id => onMore(id), onSound: () => setSound(!effects.isMuted()), onQat: act => { if (ribbonView) ribbonView.act(act); }, platform,
    onFullscreen: () => { fullscreenKeys().then(() => { paintSheetKeys(); focusStage(); }); },
  });
  const effects = mountEffects();
  const keycaps = mountKeycaps(null, { parent: chrome.stage, cls: 'in-frame' });
  const panel = createRunPanel(chrome.sideMount, { onAct: act => onAct(act), platform });
  const card = createTaskCard(chrome.stage, { onHelp: id => onHelp(id), platform });
  if (prefs.get().mute && !effects.isMuted()) effects.setMuted(true);
  chrome.setSound(effects.isMuted());
  function setSound(m) { effects.setMuted(m); prefs.set({ mute: m }); chrome.setSound(m); }
  function openSide(on) { chrome.sideMount.classList.toggle('open', !!on); if (!on) panel.hide(); requestAnimationFrame(placeNow); }

  /* ---------------- the run ---------------- */
  const firstAttempt = () => timed && store.attempts({ ref: lesson.id }).length === 0;
  const run = new LessonRun(lesson, {
    mode, soft: firstAttempt(),
    onKey: k => keycaps.flash(k, { typing: run.session.mode !== 'ribbon' || !!run.session.dialog }),
    onToast: showToast,
    onRefuse: () => { effects.refuse(); if (sheetView && sheetView.shake) sheetView.shake(); },
    onMouse: () => onMouse(),
    onGoal: (i, secs) => track('goal_complete', { lesson_id: lesson.id, goal: i, secs: Math.round(secs * 10) / 10 }),
  });
  if (!isMicro) store.touch(lesson.id);
  if (Number.isFinite(+seedOpt)) run.opts.seedNo = +seedOpt;
  track('lesson_start', { lesson_id: lesson.id, mode: run.mode });

  let sheetView = null, ribbonView = null, sheetTabs = null;
  let phase = timed ? 'ready' : 'play';   // 'ready' | 'play' | 'done' | 'timeup' | 'story'
  let demo = null, ghost = null, doing = null;
  let seenDone = 0;            // goals the card has shown ticked
  let holdUntil = 0, holdH = null, doneGoal = null;
  let cueTarget = null, cueTokens = [], cueGoal = -1, lastSheet = -1;
  let noteRect = null, noteGoal = -1;
  let stuckH = null, helpH = null, stalled = false;
  let mouseNudgeAt = -1;
  let revealedAt = -1;         // the goal Show the keys revealed (the run stays clean)
  const assistedGoals = new Set();   // Show me once / Do it for me
  const hinted = new Set();
  let notedDone = 0;
  let movedSide = null;        // Ctrl+Shift+J: the side asked for, until the next goal
  let leaving = false;         // the Exit dialog is up
  let tryAt = null, tryH = null, tryPending = null;   // off the route: { goal, n } once the pause has passed
  let lastMark = 0, shownFor = null, aside = null;     // the key window of the goal just landed; what the card showed; "That works too"
  let tabKeysGoal = -1;
  let busyOn = false;
  let timerH = null, scrollRaf = 0;
  let checklist = timed ? createChecklist(lesson.goals) : null;
  let showKeysTimed = false;   // F1 in a challenge: the current task's keys in the panel (no time posted)
  let lastReward = null, lastQuests = { quests: [], bonus: [] };
  let lastClean = false, lastTier = null, lastTimedOut = false, xpGained = 0, deliveredNow = false, firstEver = false, saveState = '', installOffer = false;
  let glowObs = null;

  /* ---------------- views ---------------- */
  function mountViews() {
    if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (sheetTabs) sheetTabs.destroy();
    chrome.sheetMount.innerHTML = '';
    chrome.ribbonSlot.innerHTML = '<div class="ribbon" id="ribbon"></div>';
    cfg = settings.get();
    sheetView = new SheetView(chrome.sheetMount, run.session);
    ribbonView = new RibbonView(chrome.ribbonSlot.querySelector('.ribbon'), run.session, { mode: 'full' });
    if (ribbonView.mode !== 'full') ribbonView.setMode('full');   // the layout is the standard's; Ctrl+F1 collapses it
    sheetTabs = mountSheetTabs(chrome.tabsMount, run.session);
    chrome.adoptStatus(sheetView.sbar);   // Excel's foot: the status shares the tabs' row
    // lessons open with the Ribbon full, challenges and assessments with it collapsed; both are settings
    run.session.settings.ribbonCollapsed = (timed ? cfg.ribbonDrills : cfg.ribbonLessons) === 'tabs';
    syncChrome();
    run.session.onChange(() => { syncChrome(); if (phase === 'play' && !timed) { routeGlow(); setPill(!!run.session.editing); requestAnimationFrame(placeNow); } });
    if (glowObs) glowObs.disconnect();
    if (!timed && typeof MutationObserver === 'function') {
      let raf = 0;
      glowObs = new MutationObserver(() => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (phase === 'play' && !demo && !ghost) routeGlow(); }); });
      glowObs.observe(chrome.ribbonSlot, { childList: true, subtree: true });
    }
    sheetView.gw.addEventListener('scroll', onSheetScroll, { passive: true });
    run.onChange(what => {
      if (what === 'reset') return;
      ribbonView.render(); sheetView.render();
      if (run.finished && (phase === 'play')) { finish(); return; }
      if (run.doneCount !== seenDone && phase === 'play') goalLanded();
      maybeStartDemo();
      noteGoals();
      refresh();
    });
    sheetView.render(); ribbonView.render();
    if (opensFitted(lesson.kind)) {
      const b = sheetView.box(); const gw = sheetView.gw;
      if (b) { fitZoomFor(run.session.sheet, { width: gw.clientWidth - b.x0, height: gw.clientHeight - b.y0 }, cfg); sheetView.render(); }
    }
  }
  /** The chrome follows the session: the collapsed state (Ctrl+F1), the toolbar row, the count. */
  function syncChrome() {
    const ss = run.session;
    chrome.setCollapsed(!!(ss.settings && ss.settings.ribbonCollapsed));
    const walking = ss.mode === 'ribbon' && !ss.dialog;
    chrome.renderQat(ribbonView ? ribbonView.qatHtml(walking, (ss.path || []).join('')) : '');
    const m = run.goals.length;
    if (timed) chrome.setProgress({ d: run.doneCount, n: m });
    else chrome.setProgress({ n: Math.min(run.doneCount + 1, m), m });
    if (moduleLessons) chrome.setLessons(lessonRows(moduleLessons, { currentId: lesson.id, progress: store.all(), goalLine: t('ws_goal_count', 'Goal {n} of {m}', { n: Math.min(run.doneCount + 1, m), m }) }));
    paintSheetKeys();
  }
  /** The sheet keys beside the tabs: Excel's, and the browser's alias until the real keys arrive. */
  function paintSheetKeys() {
    chrome.setSheetKeys(sheetKeys({ sheets: (run.session.sheets || []).length, delivered: sheetKeysDelivered(), platform: platform() }), { fullscreen: canFullscreen(), isFull: typeof document !== 'undefined' && !!document.fullscreenElement });
  }
  /** The ping: a ring grows out of the cell cursor, so the eye finds it (after a goal, back from another window). */
  function pingCursor() {
    if (!sheetView || !run.session.sheet) return;
    const a = run.session.sheet.dispActive();
    const el = pingMark(sheetView.gw, sheetView.cellRect(refKey(a.r, a.c)));
    if (el) effects.play('cursor-ping', el);
  }
  function focusStage() {
    const st = chrome.stage; if (!st.hasAttribute('tabindex')) st.setAttribute('tabindex', '-1');
    try { window.focus(); } catch (e) { /* ignore */ }
    try { st.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  // the window lost the keyboard: a veil over the sheet; the click or key that brings it back never lands on a cell
  const veil = createFocusVeil(chrome.stage, {
    active: () => phase === 'play' && !run.finished && !leaving,
    where: () => (sheetView ? sheetView.nameBox.textContent : ''),
    line: () => (timed ? siteCopy('ws_focus_clock', 'The clock is still running.') : ''),
    onResume: () => { focusStage(); if (sheetView) sheetView.keepActiveInView(); pingCursor(); },
  });
  const onFullChange = () => paintSheetKeys();
  document.addEventListener('fullscreenchange', onFullChange);

  /* ---------------- the card ---------------- */
  const activeSheetName = () => { const sh = run.session.sheets && run.session.sheets[run.session.sheetIndex]; return sh ? sh.name : null; };
  const currentTargetBox = () => (cueTarget && sheetView ? unionBox(targetBoxes(sheetView, cueTarget, activeSheetName())) : null);
  const targetElsewhere = () => { const { sheet } = targetParts(cueTarget); return !!sheet && String(sheet).toLowerCase() !== String(activeSheetName()).toLowerCase(); };
  /** The ranges a goal asks the learner to read (goal.read: 'B4:D9' or a list): the card keeps off them. */
  function readBoxes() {
    const g = run.current; if (!g || !g.read || !sheetView) return [];
    return targetBoxes(sheetView, String(g.read), null);
  }
  /** Keys show in Chapter 1, always as a setting, on first teaching, after Show the keys, after a stall. */
  function keysShown(g) {
    if (!g || !g.keys) return false;
    if (timedOnly) return false;
    return cfg.showKeys === 'always' || chapterOne || !!g.teach || revealedAt === run.doneCount || stalled;
  }
  // the card names itself once, on the first goal of the course's first lesson (3.0, The first run; M92)
  const namesItself = !timed && !isMicro && chapterOne && !!at && at.k === 1 && at.n === 1 && !prefs.get().cardNamed;
  let named = false;
  function renderCard() {
    if (timed || phase !== 'play') { card.el.hidden = true; return; }
    const m = run.goals.length;
    if (namesItself && !named && run.doneCount > 0) { named = true; prefs.set({ cardNamed: true }); }
    if (holdUntil && Date.now() < holdUntil && doneGoal) {
      card.set({ n: run.doneCount, m, goal: doneGoal.text, state: 'done' });
      if (!card.hidden) card.el.hidden = false;
      return;
    }
    const cur = run.current;
    if (!cur) { card.el.hidden = true; return; }
    const n = Math.min(run.doneCount + 1, m);
    const tokens = keysShown(cur) ? routeTokens(cur.keys) : [];
    const alts = tokens.length ? alternates(cur, { browserTab: !sheetKeysDelivered() }).map(routeTokens) : [];
    const pressed = run.session.keyLog.slice(run.session.goalMark || 0);
    const progress = routeProgress(tokens, pressed);
    shownFor = { goal: run.doneCount, tokens, alts };
    // off the route: the row resets at once, but the card waits for a pause before it says so, and says it gently
    const off = offRoute(tokens, alts, pressed);
    armTry(off, pressed.length);
    const quiet = progress.wrong ? { ...progress, wrong: null } : progress;
    let live = tokens.length ? liveLine(quiet, tokens, platform()) : '', liveKind = '';
    if (off && tryAt && tryAt.goal === run.doneCount && tryAt.n === pressed.length) { live = tryLine(progress, tokens, platform()); liveKind = 'try'; }
    if (ghost) { live = siteCopy('card_live_watch', 'Watch the keys play on your sheet. When they’re done, the sheet goes back the way it was. Esc hands it back early.'); liveKind = 'stuck'; }
    else if (doing) { live = siteCopy('card_live_doing', 'Doing it for you.'); liveKind = 'stuck'; }
    else if (demo) { live = siteCopy('card_live_demo', 'Watch it once. Esc skips to your turn.'); liveKind = 'demo'; }
    else if (stalled && stuckLine(cur.hintStuck) && !progress.matched) { live = stuckLine(cur.hintStuck); liveKind = 'stuck'; }
    else if (mouseNudgeAt === run.doneCount && !progress.matched) { live = siteCopy(tokens.length ? 'card_live_mouse' : 'card_live_mouse_help', tokens.length ? 'Try it with the keyboard.' : 'Try it with the keyboard. F1 opens Help, which can show you the keys.'); liveKind = 'mouse'; }
    else if (!cur.keys && run.doneCount >= m) { live = siteCopy('panel_sheet_off', 'Every goal’s done, but the sheet isn’t where it needs to be yet. Fix what the pen marks to finish.'); liveKind = 'stuck'; }
    else if (tabKeysGoal === run.doneCount && liveKind !== 'try') { live = siteCopy('tab_keys_note', TAB_KEYS_NOTE); liveKind = 'stuck'; }
    const asideText = aside && aside.goal === run.doneCount && pressed.length < 3 ? aside.text : '';
    card.set({ n, m, goal: cur.text, alts, aside: asideText, intro: namesItself && run.doneCount === 0 ? siteCopy('card_intro', 'This card shows your goal and its keys, and it follows the work around the sheet.') : '', teach: cur.teach || '', keys: tokens, progress, live, liveKind, state: cur.teach ? 'teaching' : 'repeat', helpNone: timedOnly ? siteCopy('card_help_none', 'No help in an assessment: every key this run needs was taught in the chapter.') : null });
    if (!card.hidden) card.el.hidden = false;
  }
  /** Off the route: after a pause with no new key, the card's line says what to press (renderCard reads tryAt). */
  function armTry(off, n) {
    if (!off) { if (tryH) clearTimeout(tryH); tryH = null; tryPending = null; tryAt = null; return; }
    const idx = run.doneCount;
    if (tryPending && tryPending.goal === idx && tryPending.n === n) return;
    if (tryH) clearTimeout(tryH);
    tryPending = { goal: idx, n };
    tryH = setTimeout(() => { tryH = null; if (phase !== 'play' || run.doneCount !== idx) return; tryAt = { goal: idx, n }; renderCard(); placeNow(); }, wrongWait());
  }
  /** The target off the screen: a pill on the sheet's edge with its address and the way to go. */
  function paintBeaconNow() {
    if (!sheetView) return;
    const gw = sheetView.gw;
    if (timed || phase !== 'play' || !cueTarget || targetElsewhere() || demo || ghost) { clearMarks(gw, 'beacon'); return; }
    const tb = currentTargetBox(), b = sheetView.box();
    const label = rangesOf(targetParts(cueTarget).ref)[0] || '';
    if (!tb || !b || !label || /^[A-Z]{1,2}1:[A-Z]{1,2}100$/.test(label)) { clearMarks(gw, 'beacon'); return; }
    paintBeacon(gw, tb, { sl: gw.scrollLeft, st: gw.scrollTop, w: gw.clientWidth, h: gw.clientHeight, x0: b.x0, y0: b.y0 }, label);
  }
  /** Where the card goes: beside the target on the side with the most room, clear of the selection, a note and the ranges read. */
  function placeNow() {
    paintBeaconNow();
    if (timed || phase !== 'play' || !sheetView || card.hidden || card.pill) return;
    const gw = sheetView.gw; const b = sheetView.box(); if (!b) return;
    const g = gw.getBoundingClientRect(), st = chrome.stage.getBoundingClientRect();
    if (!g.width || !g.height) return;
    const box = { w: gw.clientWidth, h: gw.clientHeight, x0: b.x0, y0: b.y0 };
    const sl = gw.scrollLeft, sp = gw.scrollTop;
    const shift = r => (r ? { left: r.left - sl, top: r.top - sp, width: r.width, height: r.height } : null);
    const target = shift(currentTargetBox());
    const avoid = [];
    const selText = run.session.sheet && run.session.sheet.selectionText ? run.session.sheet.selectionText() : '';
    for (const sb of targetBoxes(sheetView, selText, null)) { const r = shift(sb); if (r.width * r.height < 0.3 * box.w * box.h) avoid.push(r); }
    if (noteRect) avoid.push(shift(noteRect));
    for (const rb of readBoxes()) avoid.push(shift(rb));
    // the filled cells showing: what the learner is reading, which the card would rather not cover
    const obstacles = [];
    const W = gw.clientWidth, H = gw.clientHeight;
    for (const td of sheetView.grid.querySelectorAll('td[data-r]')) {
      if (!td.textContent.trim()) continue;
      const left = td.offsetLeft - sl, top = td.parentElement.offsetTop - sp;
      if (left > W || top > H || left + td.offsetWidth < 0 || top + td.offsetHeight < 0) continue;
      obstacles.push({ left, top, width: td.offsetWidth, height: td.offsetHeight });
      if (obstacles.length > 1200) break;
    }
    const size = card.measure();
    const prefer = movedSide || (cfg.cardSide === 'left' || cfg.cardSide === 'right' ? cfg.cardSide : null);
    const p = placeCard(box, target, { w: size.w, h: size.h }, { avoid, obstacles, prefer });
    card.place(p, { left: g.left - st.left, top: g.top - st.top });
  }
  function onSheetScroll() { if (scrollRaf) return; scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; placeNow(); }); }
  let pillH = null;
  function setPill(editing) {
    if (pillH) { clearTimeout(pillH); pillH = null; }
    if (editing === card.pill) return;
    pillH = setTimeout(() => { pillH = null; if (!!run.session.editing !== editing) return; card.setPill(editing); if (!editing) placeNow(); }, editing ? 150 : 180);
  }
  function cycleCard() {
    if (timed) return;
    const cur = card.placement && card.placement.side !== 'dock' ? card.placement.side : movedSide;
    movedSide = SIDES[(SIDES.indexOf(cur) + 1) % SIDES.length];
    placeNow();
    const side = card.placement ? card.placement.side : movedSide;
    showToast(siteCopy('card_side_' + (SIDES.includes(side) ? side : 'auto'), 'Card: ' + side));
  }
  function toggleCard() { const on = card.toggle(); if (on) placeNow(); else showToast(siteCopy('card_card_hidden', 'Ctrl+Shift+K brings the card back.')); focusStage(); }

  /* ---------------- the sheet's other forms ---------------- */
  function cueCurrent() {
    if (timed || phase !== 'play' || !sheetView) return;
    const cur = run.current;
    const gw = sheetView.gw;
    if (run.doneCount !== cueGoal) {
      cueGoal = run.doneCount; stalled = false; movedSide = null; mouseNudgeAt = -1;
      card.ringHelp(false);
      cueTokens = cur ? altPath(cur.keys) : [];
      cueTarget = cur && !demo && !ghost ? inferTarget(cur, (run.session.sheets || []).map(x => x.name)) : null;
      lastSheet = run.session.sheetIndex;
      clearGoalMarks(gw);
      noteRect = null; noteGoal = -1;
      if (cur && tabKeysGoal < 0 && /Ctrl\+Pg(Up|Dn)/.test(cur.keys || '') && !prefs.get().tabKeysNoted && !sheetKeysDelivered()) { tabKeysGoal = run.doneCount; prefs.set({ tabKeysNoted: true }); }
      armStuck();
    }
    if (run.session.sheetIndex !== lastSheet) { lastSheet = run.session.sheetIndex; clearGoalMarks(gw); noteRect = null; }
    paintCurrent();
  }
  /** The target outline, the note, the pen: drawn from the current goal, on the sheet that shows. */
  function paintCurrent() {
    const gw = sheetView.gw; const cur = run.current;
    const boxes = targetBoxes(sheetView, cueTarget, activeSheetName());
    const nextKey = stalled && cur && cur.keys ? (routeTokens(cur.keys)[0] || {}).key : null;
    paintTarget(gw, boxes, { nudgeKey: nextKey ? nextKey : null });
    if (cur && cur.note && noteGoal !== run.doneCount && boxes.length) {
      const b = sheetView.box();
      const corner = rangeCorners(rangesOf(targetParts(cueTarget).ref)[0] || '');
      const cell = corner ? sheetView.cellRect(corner[0]) : null;
      if (cell && b) { const r = paintNote(gw, cell, cur.note, { w: gw.clientWidth, h: gw.clientHeight, x0: b.x0, y0: b.y0, scrollLeft: gw.scrollLeft, scrollTop: gw.scrollTop }); noteRect = r ? r.rect : null; noteGoal = run.doneCount; }
    }
    // every goal landed but a convention or an end state fails: the reviewer's pen on the active cell
    if (run.doneCount >= run.goals.length && cur && !run.finished) {
      const active = sheetView.cellRect(run.session.sheet.selectionText().split(':')[0]);
      const conv = run.goals.map(g => g.convention).filter(Boolean).pop();
      paintPen(gw, active, conv && CONVENTIONS[conv] ? CONVENTIONS[conv].short : '', cur.text);
    } else clearMarks(gw, 'pen');
    markTargetTab();
  }
  function clearNote() { if (!sheetView) return; clearMarks(sheetView.gw, 'note'); noteRect = null; placeNow(); }
  function markTargetTab() {
    const tabsEl = chrome.tabsMount;
    for (const x of tabsEl.querySelectorAll('.wb-tab.cue-target')) x.classList.remove('cue-target');
    if (!cueTarget || !targetElsewhere() || phase !== 'play') return;
    const { sheet } = targetParts(cueTarget);
    const tab = [...tabsEl.querySelectorAll('.wb-tab')].find(x => x.textContent.trim().toLowerCase() === String(sheet).toLowerCase());
    if (tab) tab.classList.add('cue-target');
  }
  function routeGlow() {
    if (timed || !ribbonView) return 0;
    const ss = run.session;
    const tokens = targetElsewhere() ? [] : cueTokens;
    return glowRibbon(chrome.ribbonSlot.querySelector('.ribbon'), tokens, ss.path || [], ss.mode, document.getElementById('ribbonDrop'));
  }
  /** Stuck for the setting's seconds: the target pulses with the next key on a pill; at about 20 seconds Help is ringed. */
  function armStuck() {
    stopStuck();
    if (timed) return;
    const secs = cfg.nudge === 'off' ? 0 : Number(cfg.nudge) || 8;
    const idx = run.doneCount;
    if (secs) stuckH = setTimeout(() => { if (phase === 'play' && run.doneCount === idx && !demo && !ghost) { stalled = true; hinted.add(idx); paintCurrent(); refresh(); } }, secs * 1000);
    helpH = setTimeout(() => { if (phase === 'play' && run.doneCount === idx && !timedOnly) card.ringHelp(true); }, 20000);
  }
  function stopStuck() { if (stuckH) clearTimeout(stuckH); if (helpH) clearTimeout(helpH); stuckH = helpH = null; }
  function goalLanded() {
    const landed = run.doneCount, prev = seenDone;
    doneGoal = run.goals[landed - 1] || null;
    seenDone = landed;
    // the key window of the goal that just landed: a route other than the one shown is "That works too"
    const from = lastMark; lastMark = run.session.goalMark || 0;
    aside = null;
    if (!timed && landed - prev === 1 && shownFor && shownFor.goal === landed - 1 && shownFor.tokens.length && mouseNudgeAt !== landed - 1 && !assistedGoals.has(landed - 1)) {
      const keysIn = run.session.keyLog.slice(from, lastMark);
      if (worksToo(shownFor.tokens, shownFor.alts, keysIn)) aside = { goal: landed, text: worksTooLine(shownFor.tokens, platform()) };
    }
    tryAt = null; tryPending = null; if (tryH) { clearTimeout(tryH); tryH = null; }
    if (checklist) checklist = landTo(checklist, landed);
    if (timed) return;
    pingCursor();
    effects.goalTick(card.el);
    holdUntil = Date.now() + HOLD_DONE;
    if (holdH) clearTimeout(holdH);
    holdH = setTimeout(() => { holdH = null; holdUntil = 0; refresh(); }, HOLD_DONE);
  }
  function refresh() {
    syncChrome();
    if (timed) { if (phase === 'play' && panel.beat === 'run') panel.checklist(checklist, showKeysTimed); return; }
    if (phase !== 'play') return;
    if (!holdUntil) cueCurrent();
    renderCard();
    placeNow();
  }

  /* ---------------- demo, ghost, do it for me ---------------- */
  function stopDemo() { if (demo && demo.timer) clearInterval(demo.timer); demo = null; }
  function maybeStartDemo() {
    if (phase !== 'play' || demo || ghost || doing) return;
    const g = run.pendingDemo(); if (!g) return;
    demo = { goal: g, steps: run.demoSteps(g), i: 0, timer: null };
    if (g.closer && sheetView) { const tb = currentTargetBox(); if (tb) paintCheck(sheetView.gw, tb, 'diff'); }
    renderCard();
    demo.timer = setInterval(() => {
      if (!demo) return;
      if (demo.i < demo.steps.length) { run.demoStep(demo.steps[demo.i++]); return; }
      const d = demo; clearInterval(d.timer); demo = null; endDemo(d.goal);
    }, Math.max(40, (g.demo && g.demo.cadence) || 110));
  }
  function endDemo(goal) {
    if (goal.closer && sheetView) { const tb = currentTargetBox(); if (tb) paintCheck(sheetView.gw, tb, 'ok'); }
    run.finishDemo(goal);
  }
  function skipDemo() {
    if (!demo) return;
    const d = demo; if (d.timer) clearInterval(d.timer); d.timer = null;
    while (d.i < d.steps.length) run.demoStep(d.steps[d.i++]);
    demo = null; endDemo(d.goal);
  }
  function startGhost() {
    if (ghost || demo || doing) return;
    const steps = run.current && run.current.keys ? run.ghostSteps(run.current.keys) : [];
    if (!steps.length) return;
    assistedGoals.add(run.doneCount); hinted.add(run.doneCount);
    run.beginGhost();
    ghost = { steps, i: 0, timer: null };
    renderCard();
    ghost.timer = setInterval(() => { if (!ghost) return; if (ghost.i < ghost.steps.length) { run.ghostStep(ghost.steps[ghost.i++]); return; } stopGhost(true); }, GHOST_MS);
  }
  function stopGhost(finished) {
    if (!ghost) return;
    clearInterval(ghost.timer); ghost = null;
    run.endGhost();
    if (finished && phase === 'play') showToast(siteCopy('card_live_your_turn', 'Your turn.'));
    refresh(); focusStage();
  }
  /** Do it for me: the goal's keys go in as real keys, on a cadence; the goal is marked assisted. */
  function startDoing() {
    if (ghost || demo || doing) return;
    const steps = run.current && run.current.keys ? run.ghostSteps(run.current.keys) : [];
    if (!steps.length) return;
    assistedGoals.add(run.doneCount); hinted.add(run.doneCount);
    doing = { steps, i: 0, timer: null };
    renderCard();
    doing.timer = setInterval(() => {
      if (!doing) return;
      if (doing.i >= doing.steps.length) { stopDoing(); return; }
      const step = doing.steps[doing.i++];
      if (step.type === 'text') { for (const ch of step.text) run.key({ key: ch, shiftKey: /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(ch) }); }
      else run.key(parseKeySpec(step.spec));
    }, DO_MS);
  }
  function stopDoing() { if (!doing) return; clearInterval(doing.timer); doing = null; refresh(); focusStage(); }

  /* ---------------- help, the mouse, the menu ---------------- */
  function onHelp(id) {
    card.closeHelp();
    if (id === 'keys') { revealedAt = run.doneCount; refresh(); }
    else if (id === 'once') startGhost();
    else if (id === 'do') startDoing();
    focusStage();
  }
  function onMouse() {
    if (phase === 'ready') startTimed();
    if (phase !== 'play') return;
    if (run.session.t0 == null && run.session.startClock) run.session.startClock();
    effects.armSounds();
    if (mouseNudgeAt !== run.doneCount) { mouseNudgeAt = run.doneCount; renderCard(); }
  }
  async function onMore(id) {
    if (id === 'lessons') { chrome.openMenu('lessons'); return; }
    if (id === 'restart') {
      const ok = await confirmDialog({ title: siteCopy('restart_title', 'Restart this lesson?'), body: siteCopy('restart_body', 'The sheet goes back to how the lesson started. Your other lessons aren’t touched.'), action: siteCopy('restart_action', 'Restart'), platform: platform() });
      if (ok) restart(); else focusStage();
      return;
    }
    if (id === 'collapse') { run.session.settings.ribbonCollapsed = !run.session.settings.ribbonCollapsed; run.session.emit('settings'); focusStage(); return; }
    if (id === 'move') { cycleCard(); focusStage(); return; }
    if (id === 'report') { try { window.open(location.href.split('#')[0] + '#/contact', '_blank', 'noopener'); } catch (e) { location.hash = '#/contact'; } }
  }
  function leave() {
    if (isMicro) { location.hash = '#/'; return; }
    location.hash = dailyOpt ? '#/practice/daily' : '#/learn';
  }
  /** Exit (its button, More, Ctrl+Shift+X): part-way, a small dialog asks first, with Stay focused so Enter keeps you here. */
  async function askLeave() {
    if (leaving) return;
    const partWay = phase === 'play' && !run.finished && (run.doneCount > 0 || run.session.keyLog.length > 0);
    if (!partWay) { leave(); return; }
    leaving = true; chrome.closeMenu(); card.closeHelp();
    const ok = await confirmDialog({
      title: timed ? siteCopy('leave_run_title', 'Leave this run?') : siteCopy('leave_title', 'Leave this lesson?'),
      body: timed ? siteCopy('leave_run_body', 'No time is posted for a run you leave. Your finished lessons stay saved.') : siteCopy('leave_body', 'Your finished lessons stay saved. This one starts again from its first goal.'),
      action: siteCopy('leave_action', 'Leave'), cancel: siteCopy('leave_stay', 'Stay'), focus: 'cancel', platform: platform(),
    });
    leaving = false;
    if (ok) leave(); else focusStage();
  }

  /* ---------------- the timed run: Ready, Run, Result ---------------- */
  function showReady() {
    phase = 'ready';
    const pb = store.pb(lesson.id);
    const best = pb ? { secs: pb.secs, tier: tierFor(pb.secs, lesson.pars || {}) } : null;
    panel.ready({
      title: lesson.title, tasks: lesson.goals.map(g => g.text), length: aboutLength(lesson.pars && lesson.pars.pass), best, pars: lesson.pars || null,
      foot: timedOnly ? siteCopy('panel_ready_foot_assessment', 'No help in an assessment, and the clock is hard from the second attempt.') : null,
    });
    openSide(true);
  }
  function startTimed() {
    if (phase !== 'ready') return;
    phase = 'play';
    run.session.startClock();
    effects.clockStart();
    if (!busyOn && effects.setBusy) { busyOn = true; effects.setBusy(true); }
    track('lesson_run_start', { lesson_id: lesson.id, mode: run.mode });
    panel.run({ pars: lesson.pars || null, secs: 0, best: (store.pb(lesson.id) || {}).secs, pace: null, keys: 0, checklist, showKeys: showKeysTimed });
    if (!timerH) timerH = setInterval(tick, 100);
  }
  function tick() {
    if (!timed || phase !== 'play') return;
    const secs = run.elapsed, total = run.goals.length;
    const pc = cfg.pace === false ? null : pace(secs, run.doneCount, total, lesson.pars || {}).tier;
    panel.tick({ secs, pace: pc, pars: lesson.pars || null, keys: run.session.keyLog.length });
    if (lesson.timeLimit && !run.opts.soft && secs > lesson.timeLimit && !run.finished) timeUp();
  }
  function timeUp() {
    stopDemo();
    phase = 'timeup';
    busyOn = false; if (effects.setBusy) effects.setBusy(false);
    track('lesson_timeup', { lesson_id: lesson.id, mode: run.mode });
    if (timerH) { clearInterval(timerH); timerH = null; }
    panel.timesUp({
      title: siteCopy('times_up', 'Time’s Up. Keep Drilling.'), body: siteCopy('times_up_note', 'Nothing’s recorded when the clock runs out.'),
      facts: [t('panel_goals', '{d} of {n} goals', { d: run.doneCount, n: run.goals.length }), t('panel_limit', 'Limit {t}', { t: fmtPar(lesson.timeLimit) })],
      buttons: [{ act: 'again', label: siteCopy('panel_try_again', 'Try again'), key: 'Enter', primary: true }, { act: 'learn', label: siteCopy('panel_back_learn', 'Back to Learn'), key: 'B' }],
    });
  }

  /* ---------------- finish ---------------- */
  const assisted = () => assistedGoals.size > 0 || showKeysTimed;
  const doneTitle = () => (timedOnly ? siteCopy('lesson_done_verified', 'Chapter Verified') : lesson.kind === 'project' ? siteCopy('lesson_done_project', 'Project complete') : siteCopy('lesson_done', 'Lesson complete'));
  function levelUpRow(earned) {
    if (!earned || !(earned.levelTo > earned.levelFrom)) return null;
    const lv = earned.levelTo; const reward = rewardAt(lv);
    lastReward = reward;
    return { level: lv, title: titleAt(lv), reward: reward ? reward.label : '', item: reward, equip: !!reward && reward.kind !== 'themes_start' };
  }
  function finish() {
    phase = 'done';
    stopStuck(); stopDemo();
    syncChrome();   // the count reads all goals landed
    if (timerH) { clearInterval(timerH); timerH = null; }
    if (sheetView) { clearMarks(sheetView.gw, 'target'); clearMarks(sheetView.gw, 'pen'); clearMarks(sheetView.gw, 'note'); }
    card.el.hidden = true;
    track('lesson_complete', { lesson_id: lesson.id, mode: run.mode });
    const used = shortcutsUsed(run.session.keyLog).map(u => ({ keys: u.keys, count: u.count }));
    keyStates.notePressed(used);   // every key pressed in a lesson is practiced (M57)
    if (isMicro) {
      lastClean = !assisted() && !run.mouseCount;
      // Drill it: a clean single-key rep inside its par puts the key under par (M57)
      if (lastClean && Number.isFinite(run.elapsed) && run.elapsed <= FAST_SECS) keyStates.noteUnderPar(keyIdsForConcept(lesson.concept));
      schedule.note([lesson.concept], scheduleGrade({ ok: true, secs: run.elapsed, hint: assisted() }));
      effects.finish(chrome.stage);
      const q = dueToday(schedule.state(), {}).items.filter(i => i.id !== lesson.concept); const nextDue = q[0] || null;
      panel.complete({
        title: siteCopy('lesson_done', 'Lesson complete'), line: '', paras: [], marks: [lastClean ? siteCopy('lesson_clean', 'Clean sheet: you did every goal yourself, with no mouse.') : ''].filter(Boolean), shortcuts: used,
        buttons: [{ act: 'due-next', label: nextDue ? t('panel_next_due', 'Next due: {title}', { title: nextDue.title }) : siteCopy('panel_back_home', 'Home'), key: 'Enter', primary: true, href: nextDue ? (nextDue.kind === 'challenge' ? '#/lesson/' + nextDue.id : '#/due/' + nextDue.id) : '#/' }, { act: 'again', label: siteCopy('panel_run_again', 'Run it again'), key: 'R' }],
      });
      openSide(true);
      return;
    }
    const ctxBefore = gameCtx();
    const before = store.all();
    firstEver = !Object.values(before).some(p => p.completed);
    const completedCount = Object.values(before).filter(p => p.completed).length + (before[lesson.id] && before[lesson.id].completed ? 0 : 1);
    installOffer = shouldOfferInstall(prefs.get(), completedCount, installAvailable());
    lastClean = !assisted() && !run.mouseCount;
    lastTimedOut = timed && run.timedOut;
    lastTier = null;
    if (timed && lastClean && lesson.pars) { const tr = tierFor(run.elapsed, lesson.pars, { keys: run.session.keyLog.length, optimalKeys: run.optimalKeys, timedOut: lastTimedOut }); lastTier = tr === 'none' ? null : tr; }
    const wasFirst = !!run.opts.soft;
    if (isChallenge) track('challenge_result', { ref: lesson.id, tier: lastTier || 'none', secs: Math.round(run.elapsed * 10) / 10, keys: run.session.keyLog.length, first: wasFirst, timed_out: lastTimedOut });
    const saved = store.record(lesson.id, run.mode, run.elapsed, { clean: lastClean, keystrokes: run.session.keyLog.length, mouseCount: run.mouseCount, assisted: assisted(), tier: lastTier || undefined });
    if (lastClean && !isChallenge) { try { awardSync.cleanLesson(lesson.id); } catch (e) { /* the device keeps the bonus */ } }   // the +10 on the account too (0012)
    const pbBefore = timed ? store.pb(lesson.id) : null;
    let placeNow_ = null;
    if (timed) {
      const attempt = {
        id: attemptId(), kind: isChallenge ? 'challenge' : 'lesson-timed', ref: lesson.id, day: dayOf(), seed: Number.isInteger(run.seedNo) ? run.seedNo : null,
        secs: run.elapsed, keys: run.session.keyLog.length, clean: lastClean, helped: assisted(), mouse: run.mouseCount, tier: lastTier || 'none', first: wasFirst, timedOut: lastTimedOut,
        splits: run.splits().filter(Number.isFinite), trace: traceOf(run.session.keyLog), at: Date.now(),
      };
      store.addAttempt(attempt);
      if (isChallenge && dailyOpt) store.addAttempt({ ...attempt, id: attemptId(), kind: 'daily' });
      const board = store.boards(lesson.id); const ix = board.findIndex(b => b.at === attempt.at);
      placeNow_ = ix >= 0 ? { place: ix + 1, of: board.length } : null;
    }
    if (timedOnly && !lastTimedOut) {
      store.chapterPass(lesson.chapter, lesson.kind);
      if (lesson.kind === 'testout' && chapter) { const all = store.all(); const ids = chapter.lessons.filter(l => l.id !== lesson.id && !(all[l.id] && all[l.id].completed)).map(l => l.id); if (ids.length) store.skip(ids); }
    }
    // Chapter 6, the last, finished by a subscriber: the course-complete email is due (E-checkout section 6; logged until an email path exists)
    { const ch = chapterOf(lesson); if (ch && CHAPTERS.indexOf(ch) === 5) import('./billing.js').then(b => b.noteCourseComplete(ch.lessons.map(l => l.id), store.all())).catch(() => {}); }
    saveState = saved ? '' : siteCopy('lesson_save_blocked', 'Couldn’t save on this device (storage blocked); the lesson still counts for this visit.');
    // the quest loop (6.10): the run ticks its quests before the XP is read, so their XP lands in this result
    {
      const newPbQ = timed && lastClean && (!pbBefore || run.elapsed < pbBefore.secs);
      const base = { ref: lesson.id, clean: lastClean, tier: lastTier || 'none', pb: newPbQ, ghost: newPbQ && !!pbBefore, noMouse: !run.mouseCount, used };
      const a = recordRun({ ...base, kind: isChallenge ? 'challenge' : 'lesson' });
      const b = isChallenge && dailyOpt ? recordRun({ ...base, kind: 'daily', used: [] }) : { quests: [], bonus: [] };
      lastQuests = { quests: [...a.quests, ...b.quests], bonus: [...a.bonus, ...b.bonus] };
    }
    const ctxAfter = gameCtx();
    xpGained = Math.max(0, ctxAfter.xp - ctxBefore.xp);
    effects.finish(chrome.stage);
    if (lastClean && effects.cleanSheet) effects.cleanSheet();
    const passedBefore = !!(before[lesson.id] && before[lesson.id].completed);
    const knownPage = at && prefs.get().pagesDelivered.includes(at.module.id);
    const deliverer = isChallenge || lesson.kind === 'project';
    if (deliverer && at && passedBefore && !knownPage) prefs.set({ pagesDelivered: [...prefs.get().pagesDelivered, at.module.id] });
    deliveredNow = !!(deliverer && at && !knownPage && !passedBefore);
    if (deliveredNow) { prefs.set({ pagesDelivered: [...prefs.get().pagesDelivered, at.module.id] }); if (effects.packPage) effects.packPage(); }
    busyOn = false; if (effects.setBusy) effects.setBusy(false);
    if (timed) { effects.clockStop(); const newPb = lastClean && (!pbBefore || run.elapsed < pbBefore.secs); if (newPb) effects.newPB(); else if (lastTier) effects.parTier(lastTier); }
    const earned = celebrate(effects, ctxBefore);
    const levelUp = levelUpRow(earned);
    const xp = xpGained ? { gained: xpGained, pct: ctxAfter.levelInfo.pct } : null;
    const nxt = nextLesson(lesson.id);
    const lines = [];
    if (firstEver && store.saveState() === 'device') lines.push(siteCopy('lesson_first_saved', 'Your first lesson is saved on this device, and a free account takes it to any computer.'));
    if (saveState) lines.push(saveState);
    const extra = installOffer ? `<div class="rp-note rp-install"><span>${esc(siteCopy('install_prompt', INSTALL_PROMPT))}</span><div class="rp-foot-row"><button type="button" class="rp-btn rp-small" data-act="install"><span>${esc(siteCopy('panel_install', 'Install'))}</span></button><button type="button" class="rp-btn rp-small" data-act="install-no"><span>${esc(siteCopy('panel_not_now', 'Not now'))}</span></button></div></div>` : '';
    if (installOffer) track('install_prompt', { outcome: 'shown' });
    if (timed) {
      const newPb = lastClean && (!pbBefore || run.elapsed < pbBefore.secs);
      panel.result({
        secs: run.elapsed, tier: lastTier || 'none', clean: lastClean, finished: assisted() ? siteCopy('drill_finished_assisted', 'Finished, Assisted') : siteCopy('drill_finished', 'Finished'),
        newBest: newPb ? { by: pbBefore ? pbBefore.secs - run.elapsed : null } : null, pars: lesson.pars || null, oldBest: pbBefore ? pbBefore.secs : null,
        tasks: { total: run.goals.length, done: run.doneCount },
        note: lastTimedOut ? siteCopy(timedOnly ? 'over_limit_assessment' : 'over_limit', timedOnly ? 'Over The Limit. Run It Again. The page is built, but the chapter isn’t Verified yet, and the clock is hard from here.' : 'Over the limit: no tier, but the module counts.')
          : !lastClean ? (assisted() ? siteCopy('panel_no_time_help', 'Help was used, so no time is posted. It still counts as practice.') : siteCopy('panel_no_time_mouse', 'The mouse touched the sheet, so no time is posted. It still counts as practice.')) : deliveredNow ? pageDelivered(at) : '',
        xp, board: placeNow_ ? { title: dailyOpt ? siteCopy('panel_board_today', 'Today’s board') : siteCopy('panel_board', 'Your board'), place: placeNow_.place, of: placeNow_.of, move: null } : null,
        levelUp, quests: lastQuests.quests, bonus: lastQuests.bonus, extra: extra + lines.map(l => `<div class="rp-note rp-quiet">${esc(l)}</div>`).join(''),
        buttons: [
          { act: 'next', label: nxt ? siteCopy('panel_next_lesson', 'Next lesson') : siteCopy('panel_back_learn', 'Back to Learn'), key: 'Enter', primary: true },
          { act: 'again', label: isChallenge ? siteCopy('panel_run_again_fresh', 'Run it again on a fresh file') : siteCopy('panel_run_again', 'Run it again'), key: 'R' },
          { act: 'board', label: siteCopy('panel_see_board', 'See the board'), key: 'B' },
        ],
      });
    } else {
      const marks = [];
      marks.push(lastClean ? siteCopy('lesson_clean', 'Clean sheet: you did every goal yourself, with no mouse.') : assisted() ? siteCopy('lesson_assisted', 'Assisted: Help played or did a goal for you.') : '');
      if (deliveredNow) marks.push(pageDelivered(at));
      panel.complete({
        title: doneTitle(), line: lesson.wow || '', paras: lesson.closing || [], marks: marks.filter(Boolean), shortcuts: used,
        mouse: run.mouseCount ? siteCopy('lesson_mouse', 'Mouse: {clicks}. It’s allowed in a lesson, but the keyboard is what you’re practicing.').replace(/\{clicks\}/g, run.mouseCount + (run.mouseCount === 1 ? ' click' : ' clicks')) : '',
        xp, levelUp, lines, extra, quests: lastQuests.quests, bonus: lastQuests.bonus,
        buttons: [
          { act: 'next', label: nxt ? (nxt.kind === 'challenge' ? siteCopy('panel_next_lesson', 'Next lesson') : siteCopy('panel_next_lesson', 'Next lesson')) : siteCopy('panel_back_learn', 'Back to Learn'), key: 'Enter', primary: true },
          { act: 'again', label: siteCopy('panel_run_again', 'Run it again'), key: 'R' },
        ],
      });
    }
    openSide(true);
    focusStage();
  }
  function onAct(act) {
    const nxt = nextLesson(lesson.id);
    if (act === 'next') { location.hash = nxt ? '#/lesson/' + encodeURIComponent(nxt.id) : '#/learn'; return; }
    if (act === 'again') { if (isChallenge) run.opts.seedNo = undefined; restart(); return; }
    if (act === 'board') { location.hash = '#/leaderboard'; return; }
    if (act === 'learn') { location.hash = '#/learn'; return; }
    if (act === 'home') { location.hash = '#/'; return; }
    if (act === 'due-next') { const q = dueToday(schedule.state(), {}).items.filter(i => i.id !== lesson.concept); const n = q[0]; location.hash = n ? (n.kind === 'challenge' ? '#/lesson/' + n.id : '#/due/' + n.id) : '#/'; return; }
    if (act === 'equip') { const g = gameCtx(); if (equipReward(lastReward, { level: g.level, rolled: g.rolled })) showToast(siteCopy('panel_equipped', 'Equipped')); return; }
    if (act === 'story-go') { closeStory(); return; }
    if (act === 'install') { const stamp = () => { if (!prefs.get().installPromptAt) prefs.set({ installPromptAt: Date.now() }); }; stamp(); promptInstall().then(r => track('install_prompt', { outcome: r })); const c = panel.el.querySelector('.rp-install'); if (c) c.remove(); return; }
    if (act === 'install-no') { if (!prefs.get().installPromptAt) prefs.set({ installPromptAt: Date.now() }); track('install_prompt', { outcome: 'dismissed' }); const c = panel.el.querySelector('.rp-install'); if (c) c.remove(); }
  }

  /* ---------------- restart, the story card ---------------- */
  function restart() {
    if (ghost) { clearInterval(ghost.timer); ghost = null; run.endGhost(); }
    stopDemo(); stopDoing(); stopStuck();
    if (timerH) { clearInterval(timerH); timerH = null; }
    phase = timed ? 'ready' : 'play';
    seenDone = 0; holdUntil = 0; if (holdH) { clearTimeout(holdH); holdH = null; }
    cueGoal = -1; cueTarget = null; lastSheet = -1; noteRect = null; noteGoal = -1; stalled = false; mouseNudgeAt = -1; revealedAt = -1;
    lastMark = 0; shownFor = null; aside = null; tryAt = null; tryPending = null; if (tryH) { clearTimeout(tryH); tryH = null; }
    assistedGoals.clear(); hinted.clear(); notedDone = 0; movedSide = null; showKeysTimed = false; lastTimedOut = false; deliveredNow = false;
    checklist = timed ? createChecklist(lesson.goals) : null;
    busyOn = false; if (effects.setBusy) effects.setBusy(false);
    run.opts.soft = firstAttempt();
    run.reset(timedOnly ? 'timed' : mode);
    card.closeHelp(); card.ringHelp(false); card.setPill(false); card.show();
    mountViews();
    if (timed) showReady(); else { openSide(false); refresh(); }
    focusStage();
    maybeStartDemo();
  }
  let story = null;
  function showStory() {
    const b = beatFor(lesson, at, prefs.get().beatsSeen);
    if (!b || timed) return;
    story = b; phase = 'story';
    card.el.hidden = true;
    panel.story({ eyebrow: b.eyebrow, title: b.title, body: b.body, buttons: [{ act: 'story-go', label: siteCopy('panel_start_job', 'Start the job'), key: 'Enter', primary: true }] });
    openSide(true);
    stopStuck();
  }
  function closeStory() {
    if (!story) return;
    prefs.set({ beatsSeen: [...prefs.get().beatsSeen, lesson.module].filter(Boolean) });
    story = null; phase = 'play';
    openSide(false);
    refresh(); armStuck(); focusStage(); maybeStartDemo();
  }
  function noteGoals() {
    if (isMicro) return;
    const splits = run.splits();
    while (notedDone < run.doneCount) {
      const i = notedDone++;
      const g = run.goals[i]; if (!g || !Array.isArray(g.requires) || !g.requires.length) continue;
      schedule.note(g.requires, scheduleGrade({ ok: true, secs: splits[i], hint: hinted.has(i) }));
    }
  }

  /* ---------------- keys: the whole page is the workspace ---------------- */
  const MODS = new Set(['Alt', 'Control', 'Shift', 'Meta']);
  function onKey(e) {
    const tg = e.target; const tag = tg && tg.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (tg && tg.isContentEditable)) return;
    if ((tag === 'BUTTON' || tag === 'A') && (e.key === 'Enter' || e.key === ' ')) return;   // a control keeps its own activation
    if (isExitKey(e)) { e.preventDefault(); askLeave(); return; }   // Exit, from anywhere in the workspace
    if (noteSheetKey(e)) paintSheetKeys();   // Excel's own sheet key arrived: this window hands it over
    if (chrome.menu) { e.preventDefault(); chrome.menuKey(e.key); if (!chrome.menu) focusStage(); return; }
    if (card.help) { e.preventDefault(); card.helpKey(e.key); return; }
    if (e.ctrlKey && e.shiftKey && !e.altKey && (e.key === 'K' || e.key === 'k')) { e.preventDefault(); if (!timed) toggleCard(); return; }
    if (e.ctrlKey && e.shiftKey && !e.altKey && (e.key === 'J' || e.key === 'j')) { e.preventDefault(); if (!timed) cycleCard(); return; }
    if (phase === 'story') { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); closeStory(); } else if (e.key.length > 1) e.preventDefault(); return; }
    if (phase === 'done' || phase === 'timeup') {
      if (MODS.has(e.key)) return;
      panel.skip();
      if (e.key === 'Escape') { e.preventDefault(); if (timed) leave(); return; }
      const act = panel.keyFor(e.key); if (act) { e.preventDefault(); onAct(act); }
      return;
    }
    if (phase === 'ready') {
      if (MODS.has(e.key)) return;
      e.preventDefault();
      if (e.key === 'Escape') { leave(); return; }
      if (e.key === 'F1') return;
      startTimed();   // the key that starts the clock never lands on the sheet
      return;
    }
    if (e.key === 'F1' && !e.ctrlKey) {
      e.preventDefault();
      if (timed) { if (!timedOnly && !showKeysTimed) { showKeysTimed = true; checklist = assistTask(checklist, checklist.current); panel.checklist(checklist, true); } return; }
      if (!demo && !ghost && !doing) card.openHelp();
      return;
    }
    if (ghost) { e.preventDefault(); if (e.key === 'Escape') stopGhost(false); return; }
    if (doing) { e.preventDefault(); if (e.key === 'Escape') stopDoing(); return; }
    if (demo) { if (e.key === 'Escape') skipDemo(); if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length > 1) e.preventDefault(); return; }
    if (e.key === 'Escape') {
      // Esc does what it does in Excel: cancels an edit, closes a dialog, a menu or a note, drops the
      // marching ants. It never leaves; with nothing to close, the title bar says how to
      const ss = run.session;
      const engineOwns = ss.editing || ss.mode === 'ribbon' || !!ss.dialog || !!ss.note || !!(ss.sheet && ss.sheet.clipboard);   // Esc clears copy mode's marching ants first, as Excel's does
      if (engineOwns) { if (run.key(e)) e.preventDefault(); return; }
      e.preventDefault();
      if (noteRect) { clearNote(); return; }
      const ants = !!(ss.sheet && ss.sheet.clipboard);
      run.key(e);
      if (!ants) chrome.hint(t('ws_exit_hint', 'To leave, use Exit at the top left or {key}.', { key: keyLabel(EXIT_KEY, platform()) }), 3000);
      return;
    }
    if (run.key(e)) { e.preventDefault(); effects.armSounds(); if (!busyOn && effects.setBusy) { busyOn = true; effects.setBusy(true); } }
  }
  function onKeyUp(e) { if (e.key === 'Alt') e.preventDefault(); }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  const onResize = () => placeNow();
  window.addEventListener('resize', onResize);

  mountViews();
  if (timed) showReady(); else { refresh(); showStory(); }
  focusStage();
  if (phase === 'play') maybeStartDemo();

  return {
    destroy() {
      if (ghost) { clearInterval(ghost.timer); ghost = null; run.endGhost(); }
      stopDemo(); stopDoing(); stopStuck();
      if (tryH) clearTimeout(tryH); if (holdH) clearTimeout(holdH); if (pillH) clearTimeout(pillH);
      if (timerH) clearInterval(timerH);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (glowObs) glowObs.disconnect();
      window.removeEventListener('resize', onResize);
      veil.destroy(); document.removeEventListener('fullscreenchange', onFullChange);
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp);
      if (sheetView && sheetView.gw) sheetView.gw.removeEventListener('scroll', onSheetScroll);
      if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (sheetTabs) sheetTabs.destroy();
      keycaps.destroy(); if (effects.destroy) effects.destroy();
      card.destroy(); panel.destroy(); chrome.destroy();
    },
  };
}
