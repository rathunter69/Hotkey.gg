// app2/app/auth.js — the one auth surface. Wraps the vendored supabase-js UMD (window.supabase,
// a classic script — never imported) behind a generation token so a slow network reply can never
// land on the wrong account (the old nav.js account-isolation fix, kept):
//
//   await auth.ready();                      once, at boot (main.js)
//   auth.state()                             'unavailable' | 'out' | 'in'
//   auth.user()                              { id, email } | null
//   const t = auth.token();                  { id, generation }
//   auth.current(t)                          false once the owner changed — DROP the result
//   auth.onChange(fn)                        fn(user|null) after every owner change
//   auth.lostUid()                           the account whose session died under it (expiry, 401), or null
//
// Every module that awaits anything account-related takes a token first and checks current()
// after; a stale token means the reply is thrown away, silently. A → B → A is three generations.
//
// Importable in Node (no DOM/localStorage at top level): the tests drive bumpOwner/signOutWipe.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { prefs } from './prefs.js';

let client = null;
let owner = '';           // the signed-in user id, '' for guest
let generation = 0;       // bumps on EVERY owner change, including A→B→A
let currentUser = null;
let listeners = [];
let readyPromise = null;
let lost = null;          // the uid whose session expired under it (this page load only)

/** Pure core of the generation rule, exported for the tests. */
export function makeOwnerTracker() {
  let o = '';
  let gen = 0;
  return {
    /** Sets the owner; returns true when the owner actually changed (and the generation moved). */
    set(id) { const next = id || ''; if (next === o) return false; o = next; gen++; return true; },
    token() { return { id: o, generation: gen }; },
    current(t) { return !!t && t.generation === gen && t.id === o; },
  };
}

/**
 * The device keys sign-out must clear so the next account (or guest) never sees this one's data,
 * and the prefs fields that are learner state rather than device state. Exported for the tests.
 */
// records, the game-sync marker and the review schedule are account history on this device: left
// behind, the next account to sign in here would replay them into ITS account as guest runs
export const SIGNOUT_WIPE_KEYS = ['hk2_progress_v1', 'hk2_outbox_v1', 'hk2_cache_v1', 'hk2_game_outbox_v1', 'hk2_guest_id', 'hotkey_theme', 'hk2_records_v1', 'hk2_game_sync_v1', 'hk2_schedule_v1'];
/**
 * A session that died on its own (expiry, revoked refresh token, a 401 the refresh cannot fix) is
 * not a sign-out: the uid-owned cache and outboxes stay, so nothing queued is lost and the same
 * account picks them up on its next sign-in (another uid can never read or send them).
 */
export const EXPIRY_KEEP_KEYS = ['hk2_outbox_v1', 'hk2_cache_v1', 'hk2_game_outbox_v1'];
export function signOutWipe(storage, opts = {}) {
  for (const k of SIGNOUT_WIPE_KEYS) {
    if (opts.expired && EXPIRY_KEEP_KEYS.includes(k)) continue;
    try { storage.removeItem(k); } catch (e) { /* blocked */ }
  }
  // supabase-js persists its session as sb-<ref>-auth-token; remove it ourselves so a hung
  // network signOut can never re-hydrate the session on the next load (old nav.js r311)
  try {
    for (let i = storage.length - 1; i >= 0; i--) {
      const k = storage.key(i);
      if (k && (/^sb-.*-auth-token/.test(k) || k === 'supabase.auth.token')) storage.removeItem(k);
    }
  } catch (e) { /* blocked */ }
}

function emit(user) { for (const fn of listeners.slice()) { try { fn(user); } catch (e) { /* a listener must not break the rest */ } } }

function setOwner(id, user) {
  const next = id || '';
  if (next === owner) { currentUser = user || currentUser; return false; }
  owner = next;
  generation++;
  if (next) lost = null;
  currentUser = user || null;
  return true;
}

export const auth = {
  /**
   * Create the client and read the persisted session (getSession: cached, no network — the
   * eager render never waits). Safe to call twice. Without config or the vendored script the
   * state is 'unavailable' and every other call is a harmless no-op.
   */
  ready() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      const sb = typeof window !== 'undefined' ? window.supabase : null;
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !sb || !sb.createClient) return null;
      try {
        client = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', persistSession: true } });
      } catch (e) { client = null; return null; }
      client.auth.onAuthStateChange((event, session) => {
        // never await supabase inside this callback (deadlock); hop off it first
        setTimeout(() => {
          const u = session && session.user ? session.user : null;
          if (event === 'SIGNED_OUT') {
            // reactive sign-out (another tab, expiry): same wipe as the button
            // An explicit sign-out elsewhere already wiped this device; otherwise it is expiry:
            // degrade to guest and keep the uid-owned queue (see EXPIRY_KEEP_KEYS)
            if (owner) expireNow();
            return;
          }
          // INITIAL_SESSION with no user is a returning guest, not a sign-out: do not wipe
          if (!u) return;
          if (setOwner(u.id, u)) emit(u);
        }, 0);
      });
      try {
        const { data } = await client.auth.getSession();
        const u = data && data.session && data.session.user ? data.session.user : null;
        if (u) setOwner(u.id, u);
      } catch (e) { /* offline boot: guest until the callback says otherwise */ }
      return client;
    })();
    return readyPromise;
  },

  state() { return !client ? 'unavailable' : owner ? 'in' : 'out'; },
  user() { return owner ? currentUser : null; },
  client() { return client; },
  token() { return { id: owner, generation }; },
  current(t) { return !!t && t.generation === generation && t.id === owner; },
  onChange(fn) { listeners.push(fn); return () => { listeners = listeners.filter(f => f !== fn); }; },
  lostUid() { return owner ? null : lost; },

  /**
   * An RPC answered 401 / 'not signed in': refresh once; if the session cannot be revived, drop to
   * guest without touching the uid-owned queue. Resolves true when the session is alive again.
   */
  async recover(t) {
    if (!client || !this.current(t)) return false;
    let ok = false;
    try { const { data, error } = await client.auth.refreshSession(); ok = !error && !!(data && data.session); } catch (e) { ok = false; }
    if (!this.current(t)) return false;
    if (ok) return true;
    expireNow();
    try { await client.auth.signOut({ scope: 'local' }); } catch (e) { /* the local state is already guest */ }
    return false;
  },

  async signInPassword(email, password) {
    if (!client) return { error: 'Sign-in is not configured' };
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  },
  async signUpPassword(email, password) {
    if (!client) return { error: 'Sign-in is not configured' };
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // Supabase with email confirmation on: a user but no session until the link is clicked
    if (data && data.user && !data.session) return { confirm: true };
    return {};
  },
  async magicLink(email) {
    if (!client) return { error: 'Sign-in is not configured' };
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    return error ? { error: error.message } : { confirm: true };
  },
  async google() {
    if (!client) return { error: 'Sign-in is not configured' };
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } });
    return { error: error ? error.message : null };
  },

  /**
   * Sign out and wipe this account's device traces NOW, before the network round-trip: the next
   * paint is a clean guest whatever the network does. Progress, outbox, cache, guest id and the
   * account-following theme go; platform/ribbon/mute stay (they belong to the machine).
   */
  async signOut() {
    lost = null;
    setOwner('', null);
    try { signOutWipe(localStorage); } catch (e) { /* blocked */ }
    resetLearnerPrefs();
    emit(null);
    if (client) { try { await client.auth.signOut(); } catch (e) { /* the local wipe already happened */ } }
  },
};

/** Session died: guest from here on, uid-owned queue kept, `lost` remembers whose it is. */
function expireNow() {
  const was = owner;
  if (!was) return;
  setOwner('', null);
  lost = was;
  try { signOutWipe(localStorage, { expired: true }); } catch (e) { /* blocked */ }
  resetLearnerPrefs();
  emit(null);
}

function redirectTo() {
  try { return location.origin + location.pathname + '#/account'; } catch (e) { return undefined; }
}

/** experience/firstRunDone/skipped are learner state (they ride the account); the rest is device state. */
function resetLearnerPrefs() {
  try { prefs.set({ experience: null, firstRunDone: false, skipped: [] }); } catch (e) { /* blocked */ }
}
