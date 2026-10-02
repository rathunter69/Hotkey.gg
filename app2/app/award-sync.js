// app2/app/award-sync.js — the account copy of what R7 kept on the device only (migration 0012):
// the quest XP (each daily and weekly quest, and the bonus for all three) and the clean-lesson
// bonus go to rpc_record_xp_award; the keys a learner practiced or put under par go to
// rpc_note_keys and come back at sign-in through rpc_my_keys. The device stays the UI's source
// (app/quests.js, app/xp.js, app/key-states.js); this is a mirror, so the account's XP and key
// states follow the learner to another device.
//
// One outbox (hk2_award_outbox_v1), owned by a uid like the store's: a foreign account's queue
// is never sent. Items leave once the server answers: 'awarded', 'duplicate' and 'refused' are
// final; 'pending' (a clean-lesson award whose lesson attempt has not reached the server yet)
// waits for the next flush, up to MAX_TRIES; a missing RPC (0012 not applied yet) parks the queue
// until the next sign-in. A guest queues nothing: there is no account to mirror to.
import { auth } from './auth.js';
import { keyStates } from './key-states.js';

export const AWARD_OUTBOX_KEY = 'hk2_award_outbox_v1';
export const MAX_TRIES = 20;
const QUEUE_CAP = 500;

const isObj = v => typeof v === 'object' && v !== null && !Array.isArray(v);
function readJson(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function writeJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
const me = () => { try { const u = auth.user(); return u ? u.id : null; } catch (e) { return null; } };

/** The queue for `uid`; anything another account wrote is discarded. Pure. */
export function ownedQueue(raw, uid) { return isObj(raw) && uid && raw.uid === uid && Array.isArray(raw.items) ? raw.items : []; }
const read = () => ownedQueue(readJson(AWARD_OUTBOX_KEY), me());
const write = items => writeJson(AWARD_OUTBOX_KEY, { uid: me(), items: items.slice(-QUEUE_CAP) });

/** An award as the RPC takes it. Pure. */
export function awardItem(kind, ref, at = Date.now()) { return { t: 'award', kind, ref, at }; }
/**
 * The awards a settled quest run paid (app/quests.js settle: { ticked: [row], bonus: [{ period }] },
 * with each period's key from the board). Pure.
 */
export function questAwards(settled, at = Date.now()) {
  const out = [];
  if (!settled || !settled.board) return out;
  for (const r of settled.ticked || []) {
    const P = settled.board[r.period]; if (!P) continue;
    out.push(awardItem(r.period === 'weekly' ? 'quest-weekly' : 'quest-daily', P.key + ':' + r.id, at));
  }
  for (const b of settled.bonus || []) {
    const P = settled.board[b.period]; if (!P) continue;
    out.push(awardItem(b.period === 'weekly' ? 'bonus-weekly' : 'bonus-daily', P.key, at));
  }
  return out;
}

let flushing = null, parked = false, timer = null;
function queue(items) {
  if (!me() || !items.length) return;
  const have = read();
  const seen = new Set(have.filter(i => i.t === 'award').map(i => i.kind + '|' + i.ref));
  write(have.concat(items.filter(i => i.t !== 'award' || !seen.has(i.kind + '|' + i.ref))));
  flushSoon();
}
function flushSoon(ms = 0) { if (parked || timer || typeof setTimeout !== 'function') return; timer = setTimeout(() => { timer = null; flush(); }, ms); }

async function sendOne(sb, item) {
  try {
    const { data, error } = item.t === 'keys'
      ? await sb.rpc('rpc_note_keys', { p_ids: item.ids, p_under_par: !!item.under })
      : await sb.rpc('rpc_record_xp_award', { p_kind: item.kind, p_ref: item.ref, p_client_at: new Date(item.at || Date.now()).toISOString() });
    if (!error) return item.t === 'keys' ? 'done' : (data === 'pending' ? 'pending' : 'done');
    const msg = String(error.message || '');
    if (/does not exist|schema cache|PGRST202/i.test(msg)) return 'missing';
    if (/bad award|bad keys/.test(msg)) return 'done';   // a malformed item retrying cannot fix
    return 'retry';
  } catch (e) { return 'retry'; }
}

/** Drain the queue in order, one request at a time. */
export function flush() {
  if (flushing) return flushing;
  flushing = (async () => {
    if (parked || auth.state() !== 'in') return;
    const t = auth.token(); const sb = auth.client(); if (!sb) return;
    let delay = null;
    for (let guard = 0; guard < 1000; guard++) {
      const items = read(); if (!items.length) return;
      const item = items[0];
      const r = await sendOne(sb, item);
      if (!auth.current(t)) return;
      if (r === 'missing') { parked = true; return; }
      if (r === 'retry') { delay = 15000; break; }
      const rest = read().slice(1);
      if (r === 'pending' && (item.tries || 0) + 1 < MAX_TRIES) { write([...rest, { ...item, tries: (item.tries || 0) + 1 }]); if (rest.every(i => i.t === 'award' && i.kind === 'lesson-clean')) { delay = 20000; break; } continue; }
      write(rest);
    }
    if (delay != null) flushSoon(delay);
  })().finally(() => { flushing = null; });
  return flushing;
}

/** Sign-in: fold the account's key states into the device's, then send what queued meanwhile. */
async function hydrate() {
  parked = false;
  if (auth.state() !== 'in') return;
  const t = auth.token(); const sb = auth.client(); if (!sb) return;
  try {
    const { data, error } = await sb.rpc('rpc_my_keys');
    if (auth.current(t) && !error && isObj(data)) keyStates.merge(data);
  } catch (e) { /* offline: the device's states stand */ }
  flushSoon(0);
}

export const awardSync = {
  /** The quest awards a run settled (quest-loop.js). */
  quests(settled) { queue(questAwards(settled)); },
  /** The clean-lesson bonus: the first clean finish of a lesson (lesson-view.js). */
  cleanLesson(lessonId) { if (lessonId) queue([awardItem('lesson-clean', lessonId)]); },
  pending() { return read(); },
  flush,
};

let wired = false;
/** Start mirroring: key-state changes queue, and every sign-in hydrates. Idempotent; main.js calls it at boot. */
export function startAwardSync() {
  if (wired) return; wired = true;
  keyStates.onChange(({ practiced, underPar }) => {
    const items = [];
    if (practiced && practiced.length) items.push({ t: 'keys', ids: practiced.slice(0, 200), under: false });
    if (underPar && underPar.length) items.push({ t: 'keys', ids: underPar.slice(0, 200), under: true });
    queue(items);
  });
  auth.onChange(user => { if (user) hydrate(); });
  if (auth.state() === 'in') hydrate();
}
