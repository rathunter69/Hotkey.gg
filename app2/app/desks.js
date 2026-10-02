// app2/app/desks.js — Teams desks, the client side (Phase F desks v1; migration 0013). A desk is
// what a Teams purchase becomes: a name, a number of seats, a paid-until date and one join code
// (TEAM-XXXX-XXXX), which is also the group code. Wolf makes desks by hand (admin_make_desk); a
// learner joins by code into a seat that carries Full Access, the owner sees the seat view and
// frees seats, and everyone on the desk shares its board. Every call is an RPC under the user's own
// session; nothing here writes a table or decides access (the server does both).
//
//   parseDeskCode(input)     pure: 'TEAM-7KQ4-M2XP' from a code or an invite link, or null
//   joinHref(code)           pure: the in-app route of the join page for a code
//   inviteLink(code, base)   pure: the link the owner shares
//   errorKey(code)           pure: the copy key for a server refusal
//   seatLine(desk)           pure: { used, seats, left }
//   lastActive(iso, now)     pure: 'today' | 'yesterday' | { days } | null
//   deskApi                  preview, join, leave, mine, seats, remove, newCode, board
import { auth } from './auth.js';

export const DESK_CODE_RX = /^TEAM-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/** The code from what someone pasted: the code itself, lower case, spaced, or inside an invite link. Pure. */
export function parseDeskCode(input) {
  const raw = String(input == null ? '' : input).toUpperCase();
  const m = raw.match(/TEAM[\s-]*([A-Z0-9]{4})[\s-]*([A-Z0-9]{4})/);
  if (!m) return null;
  const code = `TEAM-${m[1]}-${m[2]}`;
  return DESK_CODE_RX.test(code) ? code : null;
}

/** Is this a desk code rather than a single-use redeem code? Plan and billing has one box for both. Pure. */
export const isDeskCode = input => parseDeskCode(input) != null;

export const joinHref = code => '#/desk/join/' + encodeURIComponent(code);
export const inviteLink = (code, base = 'https://hotkey.gg/') => base.replace(/[#?].*$/, '') + joinHref(code);

/** The server's refusals, as copy keys (site.csv). Unknown codes read as the generic line. Pure. */
export const DESK_ERRORS = {
  'bad code': 'desk_err_bad_code',
  'too many tries': 'desk_err_tries',
  'desk ended': 'desk_err_ended',
  'on a desk': 'desk_err_on_desk',
  'desk full': 'desk_err_full',
  'not signed in': 'desk_err_signin',
  'not on a desk': 'desk_err_not_on',
  'not owner': 'desk_err_not_owner',
  'owner stays': 'desk_err_owner_stays',
  'no member': 'desk_err_no_member',
};
export function errorKey(code) {
  const c = String(code || '').toLowerCase();
  // longest first: 'not on a desk' must not read as 'on a desk'
  for (const k of Object.keys(DESK_ERRORS).sort((a, b) => b.length - a.length)) if (c.includes(k)) return DESK_ERRORS[k];
  return 'desk_err_failed';
}

/** Seats taken and left. Pure. */
export function seatLine(desk) {
  const seats = Math.max(0, Number(desk && desk.seats) || 0);
  const used = Math.min(seats, Math.max(0, Number(desk && desk.used) || 0));
  return { used, seats, left: seats - used };
}

/** When a member was last active, in whole days. Pure. */
export function lastActive(iso, now = Date.now()) {
  const t = Date.parse(iso || '');
  if (!Number.isFinite(t)) return null;
  const day = d => Math.floor(d / 86400000);
  const days = day(now) - day(t);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return { days };
}

/** One RPC under the user's session: { data } or { error: <server message> }. */
async function call(name, args) {
  const sb = auth.client();
  if (!sb) return { error: 'unavailable' };
  const t = auth.token();
  try {
    const { data, error } = await sb.rpc(name, args || {});
    if (!auth.current(t)) return { error: 'stale' };
    if (error) return { error: String(error.message || 'failed') };
    if (data && typeof data === 'object' && !Array.isArray(data) && typeof data.error === 'string') return { error: data.error };
    return { data };
  } catch (e) { return { error: 'network' }; }
}

export const deskApi = {
  /** { name, owner_handle, seats_left, paid_until } or null when the code shows nothing. Works signed out. */
  async preview(code) { const r = await call('rpc_desk_preview', { p_code: code }); return r.error ? r : { data: Array.isArray(r.data) ? r.data[0] || null : r.data || null }; },
  join(code) { return call('rpc_desk_join', { p_code: code }); },
  leave() { return call('rpc_desk_leave'); },
  /** The caller's desk: { name, role, seats, used, paid_until, code (owner only), members } or null. */
  mine() { return call('rpc_desk_mine'); },
  /** The owner's seat view: [{ handle, level, role, joined_at, lessons_done, chapters_verified, last_at }]. */
  seats() { return call('rpc_desk_seats'); },
  remove(handle) { return call('rpc_desk_remove', { p_handle: handle }); },
  newCode() { return call('rpc_desk_new_code'); },
  /** The desk's board for a ref (a seed for one sheet): rows as the global board's. */
  async board(ref, seed = null) {
    const r = await call('rpc_desk_board', { p_ref: ref, p_seed: seed });
    if (r.error) return null;
    const rows = Array.isArray(r.data) ? r.data : [];
    return { field: rows.length ? Number(rows[0].field) : 0, rows: rows.map(x => ({ pos: Number(x.pos), handle: x.handle, level: x.level, secs: Number(x.secs), keys: x.keys, mine: !!x.mine })) };
  },
};
