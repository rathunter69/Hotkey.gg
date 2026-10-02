// app2/app/entitlement.js — which chapters this account can open (M58: entitlements per chapter,
// checked on the server). Chapter 1 is free; Chapters 2 to 6 open with Full Access (a row with no
// chapter: the plan, from checkout, an admin grant, a redeem code or a Teams seat) or one chapter at
// a time (a row naming its chapter: a chapter code, a later add-on chapter). The client reads its
// own `entitlements` rows (RLS: owner select only, migrations 0005, 0011, 0013) and keeps the answer
// for the session, mirrored per uid in localStorage so a returning account opens its chapters
// without a round trip. This decides what the UI shows, a lock or the lesson, never what the server
// accepts: rpc_record_attempt and rpc_submit_game_attempt check chapter_open() on their own (0013).
// A guest is never entitled.
//
//   entitlement.entitled()          sync: the account holds the plan (every chapter), as far as this session knows
//   entitlement.chapterOpen(id)     sync: this chapter opens (Chapter 1 always; the plan; a chapter grant)
//   entitlement.refresh()           ask the server once per account per session (force = true asks again); resolves to entitled()
//   entitlement.locked(item)        a paid lesson, drill or chapter row this account cannot open
//   accessFromRows(rows, now)       pure: { plan, chapters } from the account's rows
import { auth } from './auth.js';

export const ENTITLEMENT_KEY = 'hk2_entitlement_v1';
let known = null;   // { uid, paid, chapters } for the account last checked this session
/** Chapter 1, open to everyone (content/index.js: the one chapter without access 'paid'). */
export const FREE_CHAPTERS = ['foundations'];

const storage = () => { try { return globalThis.localStorage || null; } catch (e) { return null; } };
const readMirror = () => {
  const s = storage(); if (!s) return null;
  try { const v = JSON.parse(s.getItem(ENTITLEMENT_KEY) || 'null'); return v && typeof v.uid === 'string' ? v : null; } catch (e) { return null; }
};
const writeMirror = v => { const s = storage(); if (!s) return; try { if (v) s.setItem(ENTITLEMENT_KEY, JSON.stringify(v)); else s.removeItem(ENTITLEMENT_KEY); } catch (e) { /* blocked or full: the session copy stands */ } };

/** Pure: is a row live now? starts_at ≤ now < ends_at (a null ends_at never expires). */
export function isLive(row, now = Date.now()) {
  if (!row || typeof row !== 'object') return false;
  const starts = row.starts_at ? Date.parse(row.starts_at) : 0;
  const ends = row.ends_at ? Date.parse(row.ends_at) : Infinity;
  return Number.isFinite(starts) && starts <= now && (ends === Infinity || (Number.isFinite(ends) && ends > now));
}

/**
 * What an account's rows open. Pure. A live row without a chapter is the plan (every chapter, and
 * everything added later); a live row with one opens that chapter. Rows from a database without
 * 0013's column read as the plan, which is what they were.
 */
export function accessFromRows(rows, now = Date.now()) {
  const live = (Array.isArray(rows) ? rows : []).filter(r => isLive(r, now));
  const plan = live.some(r => !r.chapter);
  const chapters = [...new Set(live.map(r => r.chapter).filter(c => typeof c === 'string' && c))].sort();
  return { plan, chapters };
}

/** The chapter id of a lesson, a drill, a catalog entry or a chapter row ({ chapter } or { key } or { id } with access). */
const chapterIdOf = x => (x && typeof x === 'object' ? x.chapter || x.key || (x.access ? x.id : null) : x) || null;

export const entitlement = {
  entitled() {
    const k = entitlement.known();
    return !!(k && k.paid);
  },
  /** The account's answer as this session knows it: { uid, paid, chapters } or null for a guest. */
  known() {
    const u = auth.user(); if (!u) return null;
    if (known && known.uid === u.id) return known;
    const m = readMirror();
    return m && m.uid === u.id ? { uid: u.id, paid: m.paid === true, chapters: Array.isArray(m.chapters) ? m.chapters : [] } : null;
  },
  chapterOpen(id) {
    if (!id || FREE_CHAPTERS.includes(id)) return true;
    const k = entitlement.known();
    return !!(k && (k.paid || k.chapters.includes(id)));
  },
  async refresh(force = false) {
    const u = auth.user(); const client = auth.client();
    if (!u || !client) { known = null; return false; }
    if (!force && known && known.uid === u.id) return known.paid;
    try {
      // '*' so a database without 0013's chapter column still answers (every row then reads as the plan)
      const { data, error } = await client.from('entitlements').select('*').eq('user_id', u.id);
      if (error) throw error;
      const a = accessFromRows(data);
      known = { uid: u.id, paid: a.plan, chapters: a.chapters };
      writeMirror({ uid: u.id, paid: a.plan, chapters: a.chapters, at: Date.now() });
      return a.plan;
    } catch (e) {
      return entitlement.entitled();   // offline or refused: the mirror stands, a guest stays out
    }
  },
  /** A paid lesson, drill or chapter this account can't open. Free items, and anything in an open chapter, never lock. */
  locked(item) { return !!item && item.access === 'paid' && !entitlement.chapterOpen(chapterIdOf(item)); },
  /** Test seam: forget what this session learned. */
  reset() { known = null; },
};
