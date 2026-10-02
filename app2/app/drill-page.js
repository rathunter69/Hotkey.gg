// app2/app/drill-page.js — the drill workspace (screenplay 3.0 "The workspace", "The timed run";
// 3.10; M91, M93, M98). A drill and the Daily run the one loop in the 340px panel at the right of
// the sheet: Ready (the key that starts the clock never lands), Run (the clock, the pace, the
// track, the folding checklist), Result (the time and its tier, New best, the XP row, the board
// row, a level-up row, then Next drill on Enter, Run it again on R, See the board on B), Next.
// The chrome is ui/components/chrome.js; the panel ui/components/run-panel.js; the record
// app/run-record.js through DrillRun. The sandbox is dropped (M21): its routes open Practice.
import { mountSheetTabs } from '../ui/sheet-tabs.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { mountEffects } from '../ui/effects.js';
import { prefs, keyLabel } from './prefs.js';
import { showToast } from '../ui/toast.js';
import { track } from './telemetry.js';
import { DRILLS, drillById } from '../content/drills.js';
import { CHAPTERS, LESSONS, moduleOf } from '../content/index.js';
import { catalogById } from '../content/catalog.js';
import { DrillRun } from './drill-run.js';
import { store } from './store.js';
import { dailyDrill, shareText } from './daily.js';
import { dayOf } from './records.js';
import { gameCtx, celebrate } from './stats.js';
import { tierFor } from './pars.js';
import { pace } from './run-record.js';
import { createChecklist, landTo, assist as assistTask } from './checklist.js';
import { settings } from './settings.js';
import { fitZoomFor } from './zoom.js';
import { itemNumber } from './numbering.js';
import { titleAt, rewardAt } from '../content/levels.js';
import { recordRun } from './quest-loop.js';
import { hasPickers, PICKER_LESSON } from '../content/catalog.js';
import { equipReward } from './cosmetics.js';
import { shortcutsUsed } from './runner.js';
import { keyStates } from './key-states.js';
import { siteCopy } from '../content/copy/apply.js';
import { entitlement } from './entitlement.js';
import { createChrome, confirmDialog, isExitKey, EXIT_KEY, sheetKeys, noteSheetKey, sheetKeysDelivered, canFullscreen, fullscreenKeys } from '../ui/components/chrome.js';
import { createFocusVeil } from '../ui/components/focus-veil.js';
import { pingMark } from '../ui/components/sheet-marks.js';
import { refKey } from '../engine/refs.js';
import { createRunPanel, aboutLength } from '../ui/components/run-panel.js';
const shortDay = d => { try { return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); } catch (e) { return String(d || ''); } };

const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb, vars) => fill(siteCopy(key, fb), vars);
const MODS = new Set(['Alt', 'Control', 'Shift', 'Meta']);
const entitled = () => { try { return entitlement.entitled(); } catch (e) { return false; } };
const GRADED = () => DRILLS.filter(d => d.kind !== 'challenge');

/** The drill after `id` in the set (?set=a,b,c) or, with no set, in catalog order; null at the end. Pure. */
export function nextDrillId(id, setList) {
  const order = Array.isArray(setList) && setList.length ? setList : GRADED().map(d => d.id);
  const i = order.indexOf(id);
  if (i < 0) return order.find(x => x !== id && drillById(x)) || null;
  for (let j = i + 1; j < order.length; j++) if (drillById(order[j])) return order[j];
  return null;
}

export function mountDrillPage(root, ctx = {}) {
  const daily = !!(ctx.params && ctx.params.daily) && (() => { const d = dailyDrill(dayOf()); return d.drill ? d : null; })();
  const id = daily ? daily.drill.id : (ctx.params && ctx.params.id) || '';
  const drill = daily ? daily.drill : drillById(id);
  if (!drill) { location.replace('#/practice'); return { destroy() {} }; }
  // a module challenge in the catalogue runs in the lesson workspace (seeded, timed, tier-scored); the Daily passes its seed
  if (drill.kind === 'challenge') { location.replace('#/lesson/' + encodeURIComponent(drill.id) + (daily ? '?daily=1&seed=' + daily.seed : '')); return { destroy() {} }; }
  const setList = ctx.query && ctx.query.set ? String(ctx.query.set).split(',').map(s => s.trim()).filter(Boolean) : null;
  const setQuery = setList ? '?set=' + encodeURIComponent(setList.join(',')) : '';
  let cfg = settings.get();
  const platform = () => cfg.keyLabels || prefs.platform();
  const attemptsToday = () => store.attempts({ kind: 'daily', day: dayOf() }).length;

  /* ---------------- the chrome ---------------- */
  const chapterNo = Math.max(1, CHAPTERS.findIndex(ch => ch.id === drill.chapter) + 1);
  const entry = catalogById(drill.id);
  const taught = entry && entry.lesson ? LESSONS.find(l => l.id === entry.lesson) : null;
  const subtitle = daily ? t('ws_sub_daily', 'The Daily, {day}', { day: shortDay(dayOf()) })
    : taught ? t('ws_sub_drill', 'Chapter {n}, taught in {m}', { n: chapterNo, m: itemNumber(taught, moduleOf(taught)) || '' }) : '';
  const chrome = createChrome(root, {
    kind: daily ? 'daily' : 'drill', title: drill.title, subtitle, lessons: null, hasCard: false,
    onBack: () => askLeave(), onMore: id => onMore(id), onSound: () => setSound(!effects.isMuted()), onQat: act => { if (ribbonView) ribbonView.act(act); }, platform,
    onFullscreen: () => { fullscreenKeys().then(() => { paintSheetKeys(); focusStage(); }); },
  });
  const effects = mountEffects();
  const keycaps = mountKeycaps(null, { parent: chrome.stage, cls: 'in-frame' });
  const panel = createRunPanel(chrome.sideMount, { onAct: act => onAct(act), platform });
  chrome.sideMount.classList.add('open');
  if (prefs.get().mute && !effects.isMuted()) effects.setMuted(true);
  chrome.setSound(effects.isMuted());
  function setSound(m) { effects.setMuted(m); prefs.set({ mute: m }); chrome.setSound(m); }
  function leave() { location.hash = daily ? '#/practice/daily' : '#/practice'; }
  let leaving = false;
  /** Exit (its button, More, Ctrl+Shift+X): mid-run, a small dialog asks first, with Stay focused so Enter keeps the run going. */
  async function askLeave() {
    if (leaving) return;
    if (phase !== 'run') { leave(); return; }
    leaving = true; chrome.closeMenu();
    const ok = await confirmDialog({
      title: siteCopy('leave_drill_title', 'Leave this drill?'), body: siteCopy('leave_run_body', 'No time is posted for a run you leave. Your finished lessons stay saved.'),
      action: siteCopy('leave_action', 'Leave'), cancel: siteCopy('leave_stay', 'Stay'), focus: 'cancel', platform: platform(),
    });
    leaving = false;
    if (ok) leave(); else focusStage();
  }

  let run = null, sheetView = null, ribbonView = null, tabs = null, ghostEl = null;
  let phase = 'ready';           // 'ready' | 'run' | 'done'
  let checklist = null, showKeys = false, replay = null, tickH = null, busyOn = false;
  let pbBefore = store.pb(drill.id), ghostTrace = store.trace(drill.id), lastAttempt = null, lastReward = null;

  /* ---------------- the run ---------------- */
  function mountRun() {
    if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (tabs) tabs.destroy();
    stopReplay();
    chrome.sheetMount.innerHTML = '';
    chrome.ribbonSlot.innerHTML = '<div class="ribbon" id="ribbon"></div>';
    cfg = settings.get();
    run = new DrillRun(drill, {
      onKey: k => keycaps.flash(k, { typing: run.session.mode !== 'ribbon' || !!run.session.dialog }),
      onToast: showToast,
      onRefuse: () => { effects.refuse(); if (sheetView && sheetView.shake) sheetView.shake(); },
      onMouse: () => { if (phase === 'ready') start(); },
      seedCells: daily ? daily.seedCells : null, seed: daily ? daily.seed : null, kind: daily ? 'daily' : 'drill',
    });
    sheetView = new SheetView(chrome.sheetMount, run.session);
    ribbonView = new RibbonView(chrome.ribbonSlot.querySelector('.ribbon'), run.session, { mode: 'full' });
    if (ribbonView.mode !== 'full') ribbonView.setMode('full');
    tabs = mountSheetTabs(chrome.tabsMount, run.session);
    chrome.adoptStatus(sheetView.sbar);   // Excel's foot: the status shares the tabs' row
    run.session.settings.ribbonCollapsed = cfg.ribbonDrills !== 'full';   // drills open with the Ribbon collapsed; a setting
    run.session.onChange(() => syncChrome());
    // the PB ghost: a faint outline cursor inside the scroll box; never focusable, never filled
    ghostEl = document.createElement('div'); ghostEl.className = 'ghost-cursor'; ghostEl.hidden = true;
    sheetView.gw.appendChild(ghostEl);
    checklist = createChecklist(drill.goals);
    showKeys = false;
    run.onChange(() => {
      if (!sheetView) return;
      sheetView.render(); ribbonView.render();
      if (run.doneCount !== checklist.current) { checklist = landTo(checklist, run.doneCount); if (phase === 'run') panel.checklist(checklist, showKeys); }
      syncChrome();
      if (run.finished && phase !== 'done') finish();
    });
    pbBefore = store.pb(drill.id); ghostTrace = store.trace(drill.id);
    sheetView.render(); ribbonView.render();
    const b = sheetView.box(); const gw = sheetView.gw;
    if (b) { fitZoomFor(run.session.sheet, { width: gw.clientWidth - b.x0, height: gw.clientHeight - b.y0 }, cfg); sheetView.render(); }
    syncChrome();
    showReady();
    focusStage();
  }
  function syncChrome() {
    const ss = run.session;
    chrome.setCollapsed(!!(ss.settings && ss.settings.ribbonCollapsed));
    const walking = ss.mode === 'ribbon' && !ss.dialog;
    chrome.renderQat(ribbonView ? ribbonView.qatHtml(walking, (ss.path || []).join('')) : '');
    chrome.setProgress({ d: run.doneCount, n: run.goals.length });
    paintSheetKeys();
  }
  function paintSheetKeys() {
    if (!run) return;
    chrome.setSheetKeys(sheetKeys({ sheets: (run.session.sheets || []).length, delivered: sheetKeysDelivered(), platform: platform() }), { fullscreen: canFullscreen(), isFull: typeof document !== 'undefined' && !!document.fullscreenElement });
  }
  function pingCursor() {
    if (!sheetView || !run || !run.session.sheet) return;
    const a = run.session.sheet.dispActive();
    const el = pingMark(sheetView.gw, sheetView.cellRect(refKey(a.r, a.c)));
    if (el) effects.play('cursor-ping', el);
  }
  function focusStage() {
    const st = chrome.stage; if (!st.hasAttribute('tabindex')) st.setAttribute('tabindex', '-1');
    try { st.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  // the window lost the keyboard mid-run: the veil; the clock keeps running (a run is timed end to end)
  const veil = createFocusVeil(chrome.stage, {
    active: () => phase === 'run' && !leaving,
    where: () => (sheetView ? sheetView.nameBox.textContent : ''),
    line: () => siteCopy('ws_focus_clock', 'The clock is still running.'),
    onResume: () => { focusStage(); if (sheetView) sheetView.keepActiveInView(); pingCursor(); },
  });
  const onFullChange = () => paintSheetKeys();
  document.addEventListener('fullscreenchange', onFullChange);

  /* ---------------- Ready, Run ---------------- */
  /** The lines the Ready beat carries above the tasks (M85): a stretch drill's one rule, and the drop-downs when the lesson that teaches them isn't done. */
  function readyNotes(d, all) {
    const notes = [];
    // the Daily draws Full Access drills too (M20): a free account is told, and plays it anyway
    if (daily && d.access === 'paid' && !entitled()) notes.push(t('daily_pro_note', 'Today’s drill is from Chapter {n}, which comes with Full Access. Everyone plays the same sheet, so play it anyway.', { n: chapterNo }));
    if (d.ruleLine) notes.push(d.ruleLine);
    if (hasPickers(d) && !(all[PICKER_LESSON] && all[PICKER_LESSON].completed)) notes.push(siteCopy('panel_pickers', 'The class cells are drop-downs: Alt+↓ opens one, ↑ and ↓ move, Enter picks.'));
    return notes;
  }
  function showReady() {
    phase = 'ready';
    const pb = store.pb(drill.id);
    panel.ready({
      title: drill.title, tasks: drill.goals.map(g => g.text), length: aboutLength(drill.pars && drill.pars.pass), notes: readyNotes(drill, store.all()),
      best: pb ? { secs: pb.secs, tier: tierFor(pb.secs, drill.pars) } : null, pars: drill.pars,
    });
    if (tickH) { clearInterval(tickH); tickH = null; }
  }
  function start() {
    if (phase !== 'ready') return;
    phase = 'run';
    run.session.startClock();
    effects.clockStart();
    if (!busyOn && effects.setBusy) { busyOn = true; effects.setBusy(true); }
    track('drill_start', { drill_id: drill.id });
    panel.run({ pars: drill.pars, secs: 0, best: pbBefore ? pbBefore.secs : null, pace: null, keys: 0, checklist, showKeys });
    tickH = setInterval(tick, 100);
  }
  function tick() {
    if (phase !== 'run' || !run) return;
    const secs = run.elapsed;
    const pc = cfg.pace === false ? null : pace(secs, run.doneCount, run.goals.length, drill.pars).tier;
    panel.tick({ secs, pace: pc, pars: drill.pars, keys: run.session.keyLog.length });
    paintGhost(secs);
  }
  function paintGhost(secs) {
    if (!ghostEl) return;
    if (cfg.ghost === false || !ghostTrace.length || run.startedAt == null || run.finished) { ghostEl.hidden = true; return; }
    const ms = secs * 1000; let cell = null;
    for (const e of ghostTrace) { if (e.t <= ms && e.cell) cell = e.cell; if (e.t > ms) break; }
    const r = cell ? sheetView.cellRect(cell) : null;
    if (!r) { ghostEl.hidden = true; return; }
    ghostEl.style.left = r.left + 'px'; ghostEl.style.top = r.top + 'px'; ghostEl.style.width = r.width + 'px'; ghostEl.style.height = r.height + 'px';
    ghostEl.hidden = false;
  }
  /** F1 during the run: the current task's keys show in the panel; the run is helped and posts no time. */
  function help() {
    if (phase !== 'run' || showKeys) return;
    showKeys = true; run.markHelped();
    checklist = assistTask(checklist, checklist.current);
    panel.checklist(checklist, true);
  }
  function stopReplay() { if (replay && replay.timer) clearInterval(replay.timer); replay = null; }

  /* ---------------- Result ---------------- */
  function levelUpRow(earned) {
    if (!earned || !(earned.levelTo > earned.levelFrom)) return null;
    const lv = earned.levelTo; const reward = rewardAt(lv);
    lastReward = reward;
    return { level: lv, title: titleAt(lv), reward: reward ? reward.label : '', item: reward, equip: !!reward && reward.kind !== 'themes_start' };
  }
  function finish() {
    phase = 'done';
    if (tickH) { clearInterval(tickH); tickH = null; }
    if (ghostEl) ghostEl.hidden = true;
    stopReplay();
    const ctxBefore = gameCtx();
    const attempt = run.toAttempt();
    lastAttempt = attempt;
    store.addAttempt(attempt);
    track('drill_complete', { drill_id: drill.id, secs: attempt.secs, tier: attempt.tier, clean: attempt.clean });
    const newPb = attempt.clean && (!pbBefore || attempt.secs < pbBefore.secs);
    effects.clockStop();
    effects.finish(chrome.stage);
    if (newPb) effects.newPB(); else if (attempt.tier !== 'none') effects.parTier(attempt.tier);
    // the quest loop (6.10): the run ticks its quests before the XP is read, so their XP lands in this result
    const used = shortcutsUsed(run.session.keyLog);
    keyStates.notePressed(used);   // the keys this run pressed are practiced (M57)
    const qr = recordRun({ kind: daily ? 'daily' : 'drill', ref: drill.id, clean: attempt.clean, tier: attempt.tier, pb: newPb, ghost: newPb && !!pbBefore, noWaste: attempt.clean && drill.optimalKeys > 0 && attempt.keys <= drill.optimalKeys, noMouse: !attempt.mouse, used });
    busyOn = false; if (effects.setBusy) effects.setBusy(false);
    const earned = celebrate(effects, ctxBefore);
    const ctxAfter = gameCtx();
    const gained = Math.max(0, ctxAfter.xp - ctxBefore.xp);
    const board = store.boards(drill.id); const ix = board.findIndex(b => b.at === attempt.at);
    const nextId = daily ? null : nextDrillId(drill.id, setList);
    const nextDrill = nextId ? drillById(nextId) : null;
    const buttons = daily
      ? [{ act: 'again', label: siteCopy('panel_run_again', 'Run it again'), key: 'Enter', primary: true }, { act: 'board', label: siteCopy('panel_see_board', 'See the board'), key: 'B' }, { act: 'share', label: siteCopy('panel_copy_result', 'Copy result'), key: 'C' }]
      : [
        nextDrill ? { act: 'next', label: t('panel_next_drill', 'Next: {title}', { title: nextDrill.title }), key: 'Enter', primary: true } : { act: 'all', label: siteCopy('panel_all_drills', 'All drills'), key: 'Enter', primary: true },
        { act: 'again', label: siteCopy('panel_run_again', 'Run it again'), key: 'R' },
        { act: 'board', label: siteCopy('panel_see_board', 'See the board'), key: 'B' },
      ];
    panel.result({
      secs: attempt.secs, tier: attempt.tier, clean: attempt.clean,
      finished: attempt.clean ? '' : siteCopy('drill_finished_assisted', 'Finished, Assisted'),
      newBest: newPb ? { by: pbBefore ? pbBefore.secs - attempt.secs : null } : null,
      pars: drill.pars, oldBest: pbBefore ? pbBefore.secs : null,
      tasks: { total: run.goals.length, done: run.doneCount },
      shortcuts: used.filter(u => /[+ ]/.test(u.keys)).slice(0, 6).map(u => ({ keys: u.keys, count: u.count })),   // the chords, not the plain moves; six fit above the buttons
      note: attempt.clean ? (daily ? t('panel_daily_attempts', 'Attempts today: {n}', { n: attemptsToday() }) : '') : (attempt.helped ? siteCopy('panel_no_time_help', 'Help was used, so no time is posted. It still counts as practice.') : siteCopy('panel_no_time_mouse', 'The mouse touched the sheet, so no time is posted. It still counts as practice.')),
      xp: gained ? { gained, pct: ctxAfter.levelInfo.pct } : null,
      board: ix >= 0 ? { title: daily ? siteCopy('panel_board_today', 'Today’s board') : siteCopy('panel_board', 'Your board'), place: ix + 1, of: board.length, move: null } : null,
      levelUp: levelUpRow(earned),
      quests: qr.quests, bonus: qr.bonus,
      buttons,
    });
    focusStage();
  }
  function onAct(act) {
    if (act === 'next') { const n = nextDrillId(drill.id, setList); location.hash = n ? '#/drill/' + encodeURIComponent(n) + setQuery : '#/practice'; return; }
    if (act === 'again') { mountRun(); return; }
    if (act === 'all') { location.hash = '#/practice'; return; }
    if (act === 'board') { location.hash = '#/leaderboard'; return; }
    if (act === 'equip') { const g = gameCtx(); if (equipReward(lastReward, { level: g.level, rolled: g.rolled })) showToast(siteCopy('panel_equipped', 'Equipped')); return; }
    if (act === 'share' && lastAttempt) {
      const text = shareText(dayOf(), drill.title, lastAttempt.secs, lastAttempt.tier);
      try { navigator.clipboard.writeText(text).then(() => showToast(siteCopy('panel_result_copied', 'Result copied')), () => showToast(siteCopy('panel_copy_blocked', 'Couldn’t copy: the clipboard is blocked'))); }
      catch (e) { showToast(siteCopy('panel_copy_blocked', 'Couldn’t copy: the clipboard is blocked')); }
    }
  }
  async function onMore(id) {
    if (id === 'restart') {
      if (phase === 'ready') { mountRun(); return; }
      const ok = await confirmDialog({ title: siteCopy('restart_title', 'Restart this lesson?'), body: siteCopy('restart_body', 'The sheet goes back to how the lesson started. Your other lessons aren’t touched.'), action: siteCopy('restart_action', 'Restart'), platform: platform() });
      if (ok) mountRun(); else focusStage();
      return;
    }
    if (id === 'collapse') { run.session.settings.ribbonCollapsed = !run.session.settings.ribbonCollapsed; run.session.emit('settings'); focusStage(); return; }
    if (id === 'report') { try { window.open(location.href.split('#')[0] + '#/contact', '_blank', 'noopener'); } catch (e) { location.hash = '#/contact'; } }
  }

  /* ---------------- keys ---------------- */
  const isTyping = x => !!x && (x.tagName === 'INPUT' || x.tagName === 'TEXTAREA' || x.tagName === 'SELECT' || x.isContentEditable);
  const onKeyDown = e => {
    if (isTyping(e.target)) return;
    if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') && (e.key === 'Enter' || e.key === ' ')) return;
    if (isExitKey(e)) { e.preventDefault(); askLeave(); return; }
    if (noteSheetKey(e)) paintSheetKeys();
    if (chrome.menu) { e.preventDefault(); chrome.menuKey(e.key); if (!chrome.menu) focusStage(); return; }
    if (phase === 'done') {
      if (MODS.has(e.key)) return;
      panel.skip();
      if (e.key === 'Escape') { e.preventDefault(); leave(); return; }
      const act = panel.keyFor(e.key); if (act) { e.preventDefault(); onAct(act); }
      return;
    }
    if (phase === 'ready') {
      if (MODS.has(e.key)) return;
      e.preventDefault();
      if (e.key === 'Escape') { leave(); return; }
      if (e.key === 'F1') return;
      start();   // the key that starts the clock never lands on the sheet
      return;
    }
    if (e.key === 'F1' && !e.ctrlKey) { e.preventDefault(); help(); return; }
    if (e.key === 'Escape') {
      // Esc is Excel's (cancel, close, drop the marching ants) and never ends the run: Exit does
      const ss = run.session;
      const ants = !!(ss.sheet && ss.sheet.clipboard), owned = ss.editing || ss.mode === 'ribbon' || !!ss.dialog || !!ss.note;
      if (run.key(e)) e.preventDefault();
      if (!owned && !ants) chrome.hint(fill(siteCopy('ws_exit_hint', 'To leave, use Exit at the top left or {key}.'), { key: keyLabel(EXIT_KEY, platform()) }), 3000);
      return;
    }
    if (run.key(e)) { e.preventDefault(); effects.armSounds(); }
  };
  const onKeyUp = e => { if (e.key === 'Alt') e.preventDefault(); };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp, { capture: true });

  mountRun();

  return {
    destroy() {
      if (tickH) clearInterval(tickH);
      stopReplay();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp, { capture: true });
      veil.destroy(); document.removeEventListener('fullscreenchange', onFullChange);
      if (sheetView) sheetView.destroy(); if (ribbonView) ribbonView.destroy(); if (tabs) tabs.destroy();
      keycaps.destroy(); if (effects.destroy) effects.destroy();
      panel.destroy(); chrome.destroy();
    },
  };
}
