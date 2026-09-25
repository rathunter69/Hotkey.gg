// app2/app/schedule.js — the due-today queue (experience pass, decision 12): a per-shortcut
// memory score fed by every lesson goal, challenge goal and rapid-fire prompt, and the three
// items Home offers each day. SM-2-shaped: a shortcut used correctly grows its interval (1 day,
// then 3, then × its ease); one missed, slow or hint-revealed shrinks it back to a day. Tuned so
// the first week surfaces something every day: whatever day one taught is due on day two, due
// again on day five, and every later lesson keeps the queue fed.
//
// An offer, never a nag (SITE_SPEC §6a): no streak counter, no guilt copy, no red. An empty
// queue says "nothing due; play the Daily". Stores locally (`hk2_schedule_v1`); signed-in sync
// is a later run.
//
//   schedule.note(ids, q)            record an outcome for shortcut ids (q 0–5, see grade())
//   schedule.state()                 the stored map { id: { ef, ivl, due, reps, last, q } }
//   schedule.stateOrBackfill(all, lessons)  the same, rebuilt once from completed lessons when this device has none
//   dueToday(state, ctx, now)        → { items:[{ kind:'micro'|'challenge', id, title, task, secs, why }], secs }
//   rapidOrder(deck, state, seed)    → deck indices, lowest memory first (rapid-fire draws from here)
//   microLesson(id)                  → a small lesson object the lesson workspace can mount (#/due/<id>)
//
// Every read and write is guarded; a private window or corrupt storage never breaks a page.
import { mulberry32 } from '../engine/rng.js';
import { MICRO_MODULES } from '../content/micro.js';
import { applyMicroCopy } from '../content/copy/apply.js';

export const SCHEDULE_KEY = 'hk2_schedule_v1';
export const DAY = 86400000;
export const MAX_DUE = 3;
export const FAST_SECS = 8;    // a goal landed within this many seconds: the shortcut is automatic (q 5)
export const SLOW_SECS = 20;   // landed after this: it needed thinking (q 3)

const isPlainObject = v => typeof v === 'object' && v !== null && !Array.isArray(v);
const finite = v => Number.isFinite(v);

/* ---------------- the memory model (pure) ---------------- */

/**
 * A grade from what happened: hint revealed → 2, missed → 1, correct in under FAST_SECS → 5,
 * under SLOW_SECS → 4, slower → 3. Pure.
 */
export function grade({ ok = true, secs = null, hint = false } = {}) {
  if (hint) return 2;
  if (!ok) return 1;
  if (secs == null) return 4;
  return secs <= FAST_SECS ? 5 : secs <= SLOW_SECS ? 4 : 3;
}

/** A fresh item: never reviewed, due now. */
export function freshItem(now = Date.now()) { return { ef: 2.5, ivl: 0, due: now, reps: 0, last: 0, q: null }; }

/**
 * SM-2 with the intervals in days: q ≥ 3 keeps the streak (1 → 3 → ×ef); q < 3 resets it to one
 * day. Ease moves by the classic formula and never drops below 1.3. Pure.
 */
export function review(item, q, now = Date.now()) {
  const it = isPlainObject(item) ? { ...freshItem(now), ...item } : freshItem(now);
  const g = Math.max(0, Math.min(5, Math.round(finite(q) ? q : 3)));
  let { ef, ivl, reps } = it;
  if (g >= 3) {
    ivl = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(ivl * ef);
    reps += 1;
  } else {
    ivl = 1; reps = 0;
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02)));
  ef = Math.round(ef * 100) / 100;
  return { ef, ivl, due: now + ivl * DAY, reps, last: now, q: g };
}

/** Memory strength 0–1: 1 just after a review, 0.5 at the interval, decaying past it. Unseen → 0. Pure. */
export function strength(item, now = Date.now()) {
  if (!isPlainObject(item) || !item.last) return 0;
  const ivlMs = Math.max(1, item.ivl || 1) * DAY;
  return Math.pow(0.5, Math.max(0, now - item.last) / ivlMs);
}

/** The learner's calendar day of a timestamp ('2026-09-25'), for the one-review-a-day rule. Pure. */
export const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/**
 * Apply one event { ids:[…], q } (or { id, q }) to a state map. At most one review per shortcut per
 * day (C2): a shortcut used in five goals of one lesson is one repetition, not five — otherwise the
 * most-practised shortcuts would jump weeks ahead and never come due. A later slip the same day
 * still counts: it takes the item back to a one-day interval. Pure.
 */
export function applyEvent(state, ev, now = Date.now()) {
  const out = { ...(isPlainObject(state) ? state : {}) };
  const ids = Array.isArray(ev.ids) ? ev.ids : ev.id ? [ev.id] : [];
  const g = Math.max(0, Math.min(5, Math.round(finite(ev.q) ? ev.q : 3)));
  for (const id of ids) {
    if (typeof id !== 'string' || !id) continue;
    const prev = out[id];
    if (isPlainObject(prev) && prev.last && dayKey(prev.last) === dayKey(now)) {
      if (g < 3 && (prev.q == null || prev.q >= 3)) out[id] = { ...prev, ivl: 1, reps: 0, due: now + DAY, last: now, q: g, ef: Math.max(1.3, Math.round((prev.ef - 0.2) * 100) / 100) };
      else if (prev.q != null && g < prev.q) out[id] = { ...prev, q: g };
      continue;
    }
    out[id] = review(prev, g, now);
  }
  return out;
}

/**
 * Items past due, the weakest first: [{ id, strength, overdueDays, item }]. Weakest = lowest
 * remembered strength, then the lower ease (the one that has been missed before), then the
 * longer overdue. Pure.
 */
export function dueItems(state, now = Date.now()) {
  const out = [];
  for (const id in state || {}) {
    const it = state[id];
    if (!isPlainObject(it) || !finite(it.due) || it.due > now) continue;
    out.push({ id, strength: strength(it, now), overdueDays: (now - it.due) / DAY, item: it });
  }
  return out.sort((a, b) => a.strength - b.strength || a.item.ef - b.item.ef || b.overdueDays - a.overdueDays || a.id.localeCompare(b.id));
}

/* ---------------- storage ---------------- */

export function normaliseState(raw) {
  const out = {};
  if (!isPlainObject(raw)) return out;
  let n = 0;
  for (const id in raw) {
    const it = raw[id];
    if (typeof id !== 'string' || !id || !isPlainObject(it) || n >= 500) continue;
    out[id] = {
      ef: finite(it.ef) ? Math.max(1.3, Math.min(4, it.ef)) : 2.5,
      ivl: finite(it.ivl) && it.ivl >= 0 ? it.ivl : 0,
      due: finite(it.due) ? it.due : 0,
      reps: Number.isInteger(it.reps) && it.reps >= 0 ? it.reps : 0,
      last: finite(it.last) ? it.last : 0,
      q: finite(it.q) ? it.q : null,
    };
    n++;
  }
  return out;
}
/**
 * A schedule rebuilt from lessons already completed (C2): a learner whose progress arrived without
 * this device's memory notes — signed in on a new device, or finished lessons before the queue
 * existed — gets each completed lesson's shortcuts reviewed once, as a solid pass (q 4), on the
 * day the lesson was completed, oldest first. Only shortcuts that have a micro-drill count. Pure.
 *   all      the progress map { id: { completed, at } }
 *   lessons  the catalogue's lessons (goals carry `requires`)
 */
export function backfillFrom(all, lessons, now = Date.now()) {
  const done = (lessons || []).filter(l => l && all && all[l.id] && all[l.id].completed)
    .map(l => ({ l, at: finite(all[l.id].at) && all[l.id].at <= now ? all[l.id].at : now - DAY }))
    .sort((a, b) => a.at - b.at);
  let state = {};
  for (const { l, at } of done) {
    const ids = [...new Set((l.goals || []).flatMap(g => (g && Array.isArray(g.requires) ? g.requires : [])).filter(id => MICRO[id]))];
    if (ids.length) state = applyEvent(state, { ids, q: 4 }, at);
  }
  return state;
}

function load() { try { return normaliseState(JSON.parse(localStorage.getItem(SCHEDULE_KEY) || 'null')); } catch (e) { return {}; } }
function save(s) { try { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }

export const schedule = {
  state() { return load(); },
  /** Record an outcome for one or more shortcut ids. Unknown or non-chord ids are ignored. */
  note(ids, q, now = Date.now()) {
    const list = (Array.isArray(ids) ? ids : [ids]).filter(id => typeof id === 'string' && MICRO[id]);
    if (!list.length) return false;
    return save(applyEvent(load(), { ids: list, q }, now));
  },
  clear() { try { localStorage.removeItem(SCHEDULE_KEY); } catch (e) { /* ignore */ } },
  /**
   * The stored schedule, or — when this device has none yet and lessons are complete — one rebuilt
   * from them (backfillFrom) and saved, so Due today is right from the first visit. Never
   * overwrites notes already here.
   */
  stateOrBackfill(all, lessons, now = Date.now()) {
    const cur = load();
    if (Object.keys(cur).length) return cur;
    const built = backfillFrom(all, lessons, now);
    if (Object.keys(built).length) save(built);
    return built;
  },
};

/* ---------------- micro-drills: one shortcut, 30–45 s, on the module workbook's clothing ---------------- */

const at = (sheet, ref) => !sheet.sel && sheet.selectionText() === ref;
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const used = (ses, ...ks) => ks.some(k => windowKeys(ses).includes(k));
const onSheet = (ses, name) => ses.sheets && ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const cellOf = (ses, sheetName, ref) => { const sh = (ses.sheets || []).find(x => x.name === sheetName); return sh && sh.sheet ? sh.sheet.cellAt(ref) : null; };

/**
 * The micro-drill for each shortcut Chapter 1 teaches, as tiny lessons on `voltline-weekly`
 * (the Austin feed at S0, the coloured Costs sheet at S2a). `secs` is the budget the queue adds
 * up; `goals` and `solution` are what the lesson workspace runs. Keyed by concept id so a lesson
 * goal's `requires` list feeds the queue with no extra authoring.
 */
export const MICRO = {
  ...MICRO_MODULES,   // modules 1.3–1.4 (content/micro.js): the same shape, authored with the modules
  'ctrl-arrow': { title: 'Jump to the edge', task: 'Get to the bottom of the feed and back to the top without scrolling.', secs: 30, state: 'S0',
    goals: [
      { id: 'down', text: 'Jump to the last date in the feed, A61.', keys: 'Ctrl+↓', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'A61') && used(ses, 'Ctrl+↓') },
      { id: 'right', text: 'Back to the top with Ctrl+↑, then across to the last header, F1.', keys: 'Ctrl+↑ then Ctrl+→', requires: ['ctrl-arrow'], check: (s, ses) => at(s, 'F1') && used(ses, 'Ctrl+→') },
    ], solution: 'Ctrl+Down Ctrl+Up Ctrl+Right' },
  'ctrl-home-end': { title: 'Top and bottom', task: 'Land on the last used cell, then back on A1.', secs: 30, state: 'S0',
    goals: [
      { id: 'end', text: 'Go to the last used cell on Raw with Ctrl+End.', keys: 'Ctrl+End', requires: ['ctrl-home-end'], check: (s, ses) => used(ses, 'Ctrl+End') && !s.sel },
      { id: 'home', text: 'Back to A1 with Ctrl+Home.', keys: 'Ctrl+Home', requires: ['ctrl-home-end'], check: (s, ses) => at(s, 'A1') && used(ses, 'Ctrl+Home') },
    ], solution: 'Ctrl+End Ctrl+Home' },
  'ctrl-shift-arrow': { title: 'Select to the edge', task: 'Select the whole Revenue column of the feed in one move.', secs: 30, state: 'S0',
    goals: [
      { id: 'sel', text: 'Go to the Revenue header, E1, then select the column to its last figure in one press: E1:E60.', keys: 'Ctrl+→ ← then Ctrl+Shift+↓', requires: ['ctrl-shift-arrow'], check: (s, ses) => s.selectionText() === 'E1:E60' && used(ses, 'Ctrl+Shift+↓') },
    ], solution: 'Ctrl+Right Left Ctrl+Shift+Down' },
  'shift-arrow': { title: 'Grow a selection', task: 'Select one site’s week of dates by hand.', secs: 30, state: 'S0',
    goals: [
      { id: 'sel', text: 'Select the first six dates, A2:A7.', keys: '↓ then Shift+↓ ×5', requires: ['shift-arrow'], check: (s, ses) => s.selectionText() === 'A2:A7' && used(ses, 'Shift+↓') },
    ], solution: 'Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down' },
  'row-col-select': { title: 'Whole row, whole column', task: 'Select a row and a column of the feed with the keyboard.', secs: 30, state: 'S0',
    goals: [
      { id: 'row', text: 'Select row 1, the header row.', keys: 'Shift+Space', requires: ['row-col-select'], check: (s, ses) => s.selectionText() === 'A1:Z1' && used(ses, 'Shift+Space') },
      { id: 'col', text: 'Step down to A2, then select the whole of column A.', keys: '↓ then Ctrl+Space', requires: ['row-col-select'], check: (s, ses) => s.selectionText() === 'A1:A100' && used(ses, 'Ctrl+Space') },
    ], solution: 'Shift+Space Down Ctrl+Space' },
  'ctrl-a': { title: 'The current region', task: 'Select the whole feed in one press.', secs: 30, state: 'S0',
    goals: [
      { id: 'all', text: 'Select the feed, A1:F61.', keys: 'Ctrl+A', requires: ['ctrl-a'], check: (s, ses) => s.selectionText() === 'A1:F61' && used(ses, 'Ctrl+A') },
    ], solution: 'Ctrl+A' },
  'sheet-tabs': { title: 'Walk the tabs', task: 'Move to the Costs sheet and back to Raw by keyboard.', secs: 30, state: 'S0',
    goals: [
      { id: 'costs', text: 'Go to the Costs sheet.', keys: 'Ctrl+PgDn ×3', requires: ['sheet-tabs'], check: (s, ses) => onSheet(ses, 'Costs') && used(ses, 'Ctrl+PgDn') },
      { id: 'raw', text: 'Back to Raw.', keys: 'Ctrl+PgUp ×3', requires: ['sheet-tabs'], check: (s, ses) => onSheet(ses, 'Raw') && used(ses, 'Ctrl+PgUp') },
    ], solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Ctrl+PgUp Ctrl+PgUp Ctrl+PgUp' },
  'go-to': { title: 'Go To a far cell', task: 'Land on a cell by address, across sheets.', secs: 35, state: 'S0',
    goals: [
      { id: 'goto', text: 'Go to Costs!E4 by address.', keys: 'Ctrl+G "Costs!E4" ↵', requires: ['go-to'], check: (s, ses) => onSheet(ses, 'Costs') && at(s, 'E4') && used(ses, 'Ctrl+G', 'F5') },
    ], solution: 'Ctrl+G "Costs!E4" Enter' },
  'rename-sheet': { title: 'Rename a tab', task: 'Give the scratch tab its proper name.', secs: 35, state: 'S0',
    goals: [
      { id: 'ren', text: 'Rename Sheet2 to Inputs.', keys: 'Ctrl+PgDn then Alt H O R "Inputs" ↵', requires: ['rename-sheet'], check: (s, ses) => (ses.sheets || []).some(x => x.name === 'Inputs') && !(ses.sheets || []).some(x => x.name === 'Sheet2') },
    ], solution: 'Ctrl+PgDn Alt H O R "Inputs" Enter' },
  'gridlines': { title: 'Gridlines off', task: 'Turn the gridlines off on the sheet a reader sees.', secs: 30, state: 'S0',
    goals: [
      { id: 'grid', text: 'Turn the gridlines off on Raw.', keys: 'Alt W V G', requires: ['gridlines'], check: (s, ses) => s.gridlines === false },
    ], solution: 'Alt W V G' },
  'format-cells-dialog': { title: 'Format Cells, and out', task: 'Open Format Cells by shortcut and back out cleanly.', secs: 30, state: 'S0',
    goals: [
      { id: 'open', text: 'Open Format Cells on C2.', keys: '↓ Ctrl+→ ← ← ← then Ctrl+1', requires: ['format-cells-dialog'], check: (s, ses) => used(ses, 'Ctrl+1') && !!ses.dialog },
      { id: 'esc', text: 'Back out with Esc.', keys: 'Esc', requires: ['escape-backs-out'], check: (s, ses) => !ses.dialog && ses.mode === 'normal' },
    ], solution: 'Down Ctrl+Right Left Left Left Ctrl+1 Esc' },
  'font-color': { title: 'Blue for an input', task: 'Color a typed figure blue the way a model reads it.', secs: 40, state: 'S2a',
    goals: [
      { id: 'blue', text: 'On Costs, color the Domain lease B4 blue.', keys: 'Ctrl+PgDn ×3 ↓ ×3 → then Alt H F C', requires: ['font-color'], check: (s, ses) => { const c = cellOf(ses, 'Costs', 'B4'); return !!c && c.fontColor === 'blue'; } },
    ], solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Down Down Down Right Alt H F C Right Right Right Right Enter' },
  'go-to-special': { title: 'Find the constants', task: 'Select every typed number in a block in one go.', secs: 45, state: 'S2a',
    goals: [
      { id: 'const', text: 'On Costs, select A3:E8, then Go To Special → Constants.', keys: 'Ctrl+PgDn ×3 ↓ ↓ Ctrl+Shift+End then Alt H F D S O ↵', requires: ['go-to-special'], check: (s, ses) => onSheet(ses, 'Costs') && used(ses, 'Alt', 'F5', 'Ctrl+G') && !!s.multi && s.multi.length > 1 && !s.multi.includes('E4') },
    ], solution: 'Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Down Down Ctrl+Shift+End Alt H F D S O Enter' },
  'bold-command': { title: 'Bold the header', task: 'Make the feed’s header row bold.', secs: 30, state: 'S0',
    goals: [
      { id: 'bold', text: 'Select row 1 and make it bold.', keys: 'Shift+Space then Ctrl+B', requires: ['bold-command'], check: (s, ses) => used(ses, 'Ctrl+B') && !!s.cellAt('B1') && !!s.cellAt('B1').bold && !s.cellAt('A1').bold === false },
    ], solution: 'Shift+Space Ctrl+B' },
  'keytips': { title: 'Walk the Ribbon', task: 'Reach a command by KeyTips and back out one level at a time.', secs: 30, state: 'S0',
    goals: [
      { id: 'walk', text: 'Press Alt, then H: the Home tab’s KeyTips show.', keys: 'Alt H', requires: ['keytips'], check: (s, ses) => ses.mode === 'ribbon' && ses.path[0] === 'H' },
      { id: 'back', text: 'Back out with Esc, one level at a time, until the sheet has the keys again.', keys: 'Esc Esc', requires: ['escape-backs-out'], check: (s, ses) => ses.mode === 'normal' },
    ], solution: 'Alt H Esc Esc' },
};

/** The ids the queue knows (the concept ids with a micro-drill). */
export const MICRO_IDS = Object.keys(MICRO);

/** The rapid-fire deck's prompt ids mapped to the concept the queue scores them under. */
export const RAPID_CONCEPT = {
  bold: 'bold-command', 'edge-down': 'ctrl-arrow', home: 'ctrl-home-end', region: 'ctrl-a', col: 'row-col-select', row: 'row-col-select',
};

/** A micro-drill as a lesson object the lesson workspace can mount (kind 'micro'). Null for an unknown id. */
export function microLesson(id) {
  const m = MICRO[id]; if (!m) return null;
  return applyMicroCopy({
    id: 'due-' + id, kind: 'micro', chapter: 'foundations', section: 'Due today', title: m.title, difficulty: 'easy', tags: ['due'], access: 'free',
    workbook: 'voltline-weekly', state: { before: m.state, after: m.state }, minutes: 1, concept: id, plant: m.plant,
    brief: m.task, goals: m.goals, solution: m.solution, secs: m.secs, teaches: [], requires: [id],
  }, id);
}

/* ---------------- the offer (pure) ---------------- */

/**
 * Up to three items for today, ninety seconds in all: a micro-drill per due shortcut (the
 * weakest first), or one Keep-sharp challenge when a whole completed module has decayed (every
 * shortcut it taught is due). `ctx.modules` = [{ id, title, challengeId, challengeSecs, complete, teaches:[…] }].
 * Pure.
 */
export function dueToday(state, ctx = {}, now = Date.now()) {
  const due = dueItems(state, now).filter(d => MICRO[d.id]);
  const dueSet = new Set(due.map(d => d.id));
  // a whole module gone cold: offer its challenge instead of three of its shortcuts
  for (const m of ctx.modules || []) {
    const ids = (m.teaches || []).filter(id => MICRO[id]);
    if (m.complete && m.challengeId && ids.length >= 2 && ids.every(id => dueSet.has(id))) {
      const secs = Number.isFinite(m.challengeSecs) && m.challengeSecs > 0 ? m.challengeSecs : 90;
      return { items: [{ kind: 'challenge', id: m.challengeId, title: 'Keep sharp: ' + m.title, task: 'The whole module has gone quiet. One pass of its challenge brings every move back.', secs, why: ids }], secs };
    }
  }
  const items = [];
  let secs = 0;
  for (const d of due) {
    if (items.length >= MAX_DUE) break;
    const m = MICRO[d.id];
    if (secs + m.secs > 100) continue;
    items.push({ kind: 'micro', id: d.id, title: m.title, task: m.task, secs: m.secs, strength: d.strength, overdueDays: d.overdueDays });
    secs += m.secs;
  }
  return { items, secs };
}

/**
 * Rapid-fire's prompt order: the deck's indices with the weakest remembered shortcuts first,
 * then the ones never scored, then the strong ones; ties broken by the seed so a round is not
 * the same twice. Pure.
 */
export function rapidOrder(deck, state, seed = 1, now = Date.now()) {
  const rng = mulberry32(seed);
  const rows = deck.map((p, i) => {
    const cid = RAPID_CONCEPT[p.id] || p.id;
    const it = state && state[cid];
    const s = it && it.last ? strength(it, now) : 0.75;   // unseen sits between weak and strong
    return { i, s, r: rng() };
  });
  return rows.sort((a, b) => a.s - b.s || a.r - b.r).map(r => r.i);
}

/**
 * A seeded first-week state for the storyboard (Home with `?demo=1`): day five of a learner
 * who did modules 1.0–1.2 over three days, so three shortcuts are due and one is nearly due.
 */
export function demoState(now = Date.now()) {
  let s = {};
  const d = n => now - n * DAY;
  s = applyEvent(s, { ids: ['ctrl-arrow', 'ctrl-shift-arrow', 'ctrl-home-end', 'shift-arrow'], q: 5 }, d(4));   // day one: the Welcome
  s = applyEvent(s, { ids: ['ctrl-arrow', 'ctrl-home-end'], q: 5 }, d(3));                                   // day two: reviewed, now on a 3-day interval
  s = applyEvent(s, { ids: ['sheet-tabs', 'rename-sheet', 'keytips', 'gridlines', 'format-cells-dialog'], q: 4 }, d(3));
  s = applyEvent(s, { ids: ['font-color'], q: 2 }, d(3));                                                     // hint revealed: back to a day
  s = applyEvent(s, { ids: ['row-col-select', 'ctrl-a', 'go-to', 'go-to-special'], q: 4 }, d(1));            // yesterday: module 1.2
  return s;
}
