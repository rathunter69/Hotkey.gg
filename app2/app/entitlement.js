// app2/app/entitlement.js — does this account hold the paid tier? (Phase B: Wolf grants it by
// admin function or redeem code; checkout later writes the same rows.) The client reads its own
// `entitlements` rows (RLS: owner select only, migration 0005) and keeps the answer for the
// session, mirrored per uid in localStorage so a returning paid account opens Chapter 2 without a
// round trip. This decides what the UI shows — a lock page or the lesson — never what the server
// accepts: every RPC checks has_access() on its own. A guest is never entitled.
//
//   entitlement.entitled()      sync: the signed-in account holds a live entitlement, as far as this session knows
//   entitlement.refresh()       ask the server once per account per session (force = true asks again); resolves to entitled()
//   entitlement.locked(lesson)  a paid lesson this account cannot open
import { auth } from './auth.js';

export const ENTITLEMENT_KEY = 'hk2_entitlement_v1';
let known = null;   // { uid, paid } for the account last checked this session

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

export const entitlement = {
  entitled() {
    const u = auth.user(); if (!u) return false;
    if (known && known.uid === u.id) return known.paid;
    const m = readMirror();
    return !!(m && m.uid === u.id && m.paid === true);
  },
  async refresh(force = false) {
    const u = auth.user(); const client = auth.client();
    if (!u || !client) { known = null; return false; }
    if (!force && known && known.uid === u.id) return known.paid;
    try {
      const { data, error } = await client.from('entitlements').select('starts_at, ends_at').eq('user_id', u.id);
      if (error) throw error;
      const paid = Array.isArray(data) && data.some(r => isLive(r));
      known = { uid: u.id, paid };
      writeMirror({ uid: u.id, paid, at: Date.now() });
      return paid;
    } catch (e) {
      return entitlement.entitled();   // offline or refused: the mirror stands, a guest stays out
    }
  },
  locked(lesson) { return !!lesson && lesson.access === 'paid' && !entitlement.entitled(); },
  /** Test seam: forget what this session learned. */
  reset() { known = null; },
};
