// hotkey.gg LIVE SMOKE TEST — desks / school tags / assignments RPCs (r131)
// Runs against production Supabase with the publishable anon key only.
// Usage: node dev/smoke-live.mjs        (needs network egress to supabase.co)
// Design: every mutation is paired with a cleanup so seed state is restored.
// CAVEAT: `supabase db push` is STATEFUL — applied migrations never re-run,
// so consumed fixtures can't be restored by re-running the workflow. Claim
// tests therefore target ONLY the smoke-u fixture desk (migration
// 20260713000000); a full run consumes it — restore by shipping a fresh copy
// of that insert under a NEW timestamp. Real school seeds are only ever
// member-joined (non-destructive); their codes are never rotated.
// Each run creates 3 throwaway .edu accounts (signup is server-gated to .edu)
// — list them in dev/SMOKE_REPORT.md for service-role cleanup.
const BASE = 'https://vshtftzrlepedydmkcnm.supabase.co';
const KEY = 'sb_publishable_yKhIRqtk7w98jUCJYjFWAQ_CMnQ4-yT';
const TS = process.env.SMOKE_TS || String(Date.now()).slice(-8);

const results = [];
function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      apikey: KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data };
}

const rpc = (fn, token, args = {}) => api(`/rest/v1/rpc/${fn}`, { method: 'POST', token, body: args });

async function signup(email, password) {
  const r = await api('/auth/v1/signup', { method: 'POST', body: { email, password } });
  return r;
}
async function signin(email, password) {
  return api('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
}

function errMsg(r) {
  if (r.data && typeof r.data === 'object') return r.data.message || r.data.msg || r.data.error_description || JSON.stringify(r.data);
  return String(r.data);
}

const STEP = process.argv[2] || 'all';

(async () => {
  console.log('SMOKE_TS =', TS);
  const pw = 'Smoke-' + TS + '-xK9!';
  // NOTE: signup is server-gated to .edu emails ("Only .edu email addresses may
  // register for the beta") — discovered live. A/C use an unmapped .edu domain,
  // which exercises refresh_school_tag's registrable-label fallback branch.
  const users = {
    A: { email: `hk.smoke.a.${TS}@hotkeysmoketest.edu` },
    B: { email: `hk.smoke.b.${TS}@upenn.edu` },
    C: { email: `hk.smoke.c.${TS}@hotkeysmoketest.edu` },
  };

  // ---------- 1. AUTH ----------
  for (const k of Object.keys(users)) {
    const u = users[k];
    let r = await signup(u.email, pw);
    if (r.status === 422 || (r.data && /already|exists/i.test(errMsg(r)))) {
      r = await signin(u.email, pw);   // SMOKE_TS reuse: account from a prior run
    }
    if (r.status === 200 && r.data && r.data.access_token) {
      u.token = r.data.access_token; u.id = r.data.user && r.data.user.id;
      log(`auth: signup/signin ${k} (${u.email})`, true, `uid ${u.id}`);
    } else if (r.status === 200 && r.data && r.data.user && !r.data.access_token) {
      log(`auth: signup ${k}`, false, 'email confirmation required — no session. ' + errMsg(r));
    } else {
      log(`auth: signup ${k}`, false, `${r.status} ${errMsg(r)}`);
    }
  }
  if (!users.A.token) { console.log('No session for A — aborting.'); process.exit(1); }

  // redeem invite (members gate)
  for (const k of Object.keys(users)) {
    const u = users[k]; if (!u.token) continue;
    const r = await rpc('redeem_code', u.token, { p_code: 'HAGS' });
    log(`gate: redeem_code HAGS for ${k}`, r.status === 200 && r.data === true, `${r.status} ${JSON.stringify(r.data)}`);
  }

  // profiles insert (handle) — the gate does this
  for (const k of Object.keys(users)) {
    const u = users[k]; if (!u.token) continue;
    const r = await api('/rest/v1/profiles', { method: 'POST', token: u.token, body: { id: u.id, handle: `smoke_${k.toLowerCase()}_${TS}` }, headers: { Prefer: 'resolution=merge-duplicates' } });
    log(`profiles: upsert handle ${k}`, r.status === 201 || r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
  }

  const A = users.A, B = users.B, C = users.C;

  // ---------- 2. NAME GUARDS (failed inserts consume nothing) ----------
  {
    let r = await rpc('create_desk', A.token, { p_name: 'GS TMT 2026' });
    log('guard: create_desk "GS TMT 2026" → DESK_NAME_PROTECTED', r.status >= 400 && errMsg(r).includes('DESK_NAME_PROTECTED'), `${r.status} ${errMsg(r)}`);
    r = await rpc('create_desk', A.token, { p_name: 'Goldman Sachs Speedrunners' });
    log('guard: create_desk "Goldman Sachs Speedrunners" → DESK_NAME_PROTECTED', r.status >= 400 && errMsg(r).includes('DESK_NAME_PROTECTED'), `${r.status} ${errMsg(r)}`);
    r = await rpc('create_desk', A.token, { p_name: 'admin desk' });
    log('guard: create_desk "admin desk" → DESK_NAME_RESERVED', r.status >= 400 && errMsg(r).includes('DESK_NAME_RESERVED'), `${r.status} ${errMsg(r)}`);
  }

  // ---------- 3. CREATE / PREVIEW / JOIN / MY_DESK ----------
  let deskCode = null, deskId = null;
  {
    const name = `Smoke Desk ${TS}`;
    const r = await rpc('create_desk', A.token, { p_name: name });
    const row = Array.isArray(r.data) ? r.data[0] : r.data;
    deskCode = row && row.invite_code; deskId = row && row.id;
    log('desk: A create_desk', r.status === 200 && !!deskCode, `${r.status} ${JSON.stringify(row)}`);

    const my = await rpc('my_desk', A.token);
    const m = Array.isArray(my.data) ? my.data[0] : null;
    log('desk: A my_desk → captain + code visible', !!m && m.role === 'captain' && m.invite_code === deskCode, JSON.stringify(m));

    const pv = await rpc('preview_desk', null, { p_code: deskCode });
    const p = Array.isArray(pv.data) ? pv.data[0] : null;
    log('desk: anon preview_desk(code)', !!p && p.name === name && Number(p.members) === 1, `${pv.status} ${JSON.stringify(p)}`);

    // invite_code must NOT be selectable from the table
    const sel = await api(`/rest/v1/teams?select=invite_code&id=eq.${deskId}`, { token: C.token });
    log('security: teams.invite_code not client-readable', sel.status >= 400, `${sel.status} ${errMsg(sel)}`);

    const j = await rpc('join_desk', C.token, { p_code: deskCode });
    log('desk: C join_desk(code) → member', j.status === 200, `${j.status} ${JSON.stringify(j.data)}`);
    const myC = await rpc('my_desk', C.token);
    const mc = Array.isArray(myC.data) ? myC.data[0] : null;
    log('desk: C my_desk → member, code hidden', !!mc && mc.role === 'member' && mc.invite_code == null, JSON.stringify(mc));

    const j2 = await rpc('join_desk', C.token, { p_code: deskCode });
    log('desk: C join again → ALREADY_ON_DESK', j2.status >= 400 && errMsg(j2).includes('ALREADY_ON_DESK'), `${j2.status} ${errMsg(j2)}`);
  }

  // ---------- 4. ASSIGNMENTS ----------
  {
    let r = await rpc('set_assignment', A.token, { p_challenge: 'debtsched', p_target_ms: 190000, p_note: 'roll it clean, no hardcodes' });
    log('assign: captain set_assignment debtsched', r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
    r = await rpc('set_assignment', A.token, { p_challenge: 'foot' });
    log('assign: set #2 foot', r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
    r = await rpc('set_assignment', A.token, { p_challenge: 'margin', p_target_ms: 52000 });
    log('assign: set #3 margin', r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
    r = await rpc('set_assignment', A.token, { p_challenge: 'lookup' });
    log('assign: set #4 → ASSIGN_CAP', r.status >= 400 && errMsg(r).includes('ASSIGN_CAP'), `${r.status} ${errMsg(r)}`);
    r = await rpc('set_assignment', A.token, { p_challenge: 'debtsched', p_target_ms: 180000, p_note: 'tightened' });
    log('assign: re-pin same drill (upsert legal at cap)', r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
    r = await rpc('set_assignment', C.token, { p_challenge: 'foot' });
    log('assign: member set_assignment → NOT_CAPTAIN', r.status >= 400 && errMsg(r).includes('NOT_CAPTAIN'), `${r.status} ${errMsg(r)}`);
    const list = await api(`/rest/v1/team_assignments?select=challenge,target_ms,note,expires_at&team_id=eq.${deskId}&order=challenge`, { token: C.token });
    const rows = Array.isArray(list.data) ? list.data : [];
    const dbt = rows.find(x => x.challenge === 'debtsched');
    log('assign: readable by members, upsert took', rows.length === 3 && dbt && dbt.target_ms === 180000, JSON.stringify(rows.map(x => [x.challenge, x.target_ms])));
    r = await rpc('clear_assignment', A.token, { p_challenge: 'margin' });
    const list2 = await api(`/rest/v1/team_assignments?select=challenge&team_id=eq.${deskId}`, { token: A.token });
    log('assign: clear_assignment removes row', (r.status === 200 || r.status === 204) && Array.isArray(list2.data) && list2.data.length === 2, `${r.status}; left=${JSON.stringify(list2.data)}`);
    // direct table write must fail (RPC-only)
    const w = await api('/rest/v1/team_assignments', { method: 'POST', token: A.token, body: { team_id: deskId, challenge: 'sort', created_by: A.id } });
    log('security: direct team_assignments insert denied', w.status >= 400, `${w.status} ${errMsg(w)}`);
  }

  // ---------- 5. ROTATE INVITE ----------
  {
    const oldCode = deskCode;
    const r = await rpc('rotate_invite', A.token);
    const newCode = typeof r.data === 'string' ? r.data : null;
    log('rotate: captain rotate_invite → new code', r.status === 200 && newCode && newCode !== oldCode, `${r.status} ${JSON.stringify(r.data)}`);
    if (newCode) deskCode = newCode;
    const pv = await rpc('preview_desk', null, { p_code: oldCode });
    log('rotate: old code dead (preview empty)', pv.status === 200 && Array.isArray(pv.data) && pv.data.length === 0, JSON.stringify(pv.data));
    const rc = await rpc('rotate_invite', C.token);
    log('rotate: member rotate → NOT_CAPTAIN', rc.status >= 400 && errMsg(rc).includes('NOT_CAPTAIN'), `${rc.status} ${errMsg(rc)}`);
  }

  // ---------- 6. RATE LIMIT (A owns a desk created today) ----------
  {
    // A must first not be blocked by ALREADY_ON_DESK to reach the rate guard;
    // ALREADY_ON_DESK fires first, which is also worth asserting:
    const r = await rpc('create_desk', A.token, { p_name: `Second Smoke ${TS}` });
    log('desk: A second create while on desk → ALREADY_ON_DESK', r.status >= 400 && errMsg(r).includes('ALREADY_ON_DESK'), `${r.status} ${errMsg(r)}`);
  }

  // ---------- 7. HEIR PROMOTION + EMPTY-DELETE ----------
  {
    let r = await rpc('leave_desk', A.token);
    log('leave: captain A leaves', r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
    const myC = await rpc('my_desk', C.token);
    const mc = Array.isArray(myC.data) ? myC.data[0] : null;
    log('leave: C promoted to captain (heir)', !!mc && mc.role === 'captain' && !!mc.invite_code, JSON.stringify(mc));
    // rate limit check for A now that A is deskless: created a desk <1day ago
    r = await rpc('create_desk', A.token, { p_name: `Second Smoke ${TS}` });
    log('guard: A deskless re-create same day → DESK_RATE_LIMIT', r.status >= 400 && errMsg(r).includes('DESK_RATE_LIMIT'), `${r.status} ${errMsg(r)}`);
    r = await rpc('leave_desk', C.token);
    log('leave: last member C leaves', r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
    const t = await api(`/rest/v1/teams?select=id&id=eq.${deskId}`, { token: A.token });
    log('leave: empty desk self-deleted', Array.isArray(t.data) && t.data.length === 0, JSON.stringify(t.data));
    const a = await api(`/rest/v1/team_assignments?select=challenge&team_id=eq.${deskId}`, { token: A.token });
    log('leave: assignments cascaded', Array.isArray(a.data) && a.data.length === 0, JSON.stringify(a.data));
  }

  // ---------- 8. SCHOOL TAGS (B is @upenn.edu) ----------
  {
    let r = await rpc('refresh_school_tag', B.token);
    log('school: B refresh_school_tag → UPenn', r.status === 200 && r.data === 'UPenn', `${r.status} ${JSON.stringify(r.data)}`);
    const p = await api(`/rest/v1/profiles?select=school_domain,school_tag,show_school&id=eq.${B.id}`, { token: B.token });
    const row = Array.isArray(p.data) ? p.data[0] : null;
    log('school: server-derived columns set', !!row && row.school_domain === 'upenn.edu' && row.school_tag === 'UPenn', JSON.stringify(row));
    // opt-in flips
    r = await api(`/rest/v1/profiles?id=eq.${B.id}`, { method: 'PATCH', token: B.token, body: { show_school: true } });
    log('school: show_school opt-in PATCH allowed', r.status === 200 || r.status === 204, `${r.status} ${errMsg(r)}`);
    // self-claim must be denied (column grants)
    r = await api(`/rest/v1/profiles?id=eq.${B.id}`, { method: 'PATCH', token: B.token, body: { school_tag: 'HBS' } });
    log('security: client PATCH school_tag denied', r.status >= 400, `${r.status} ${errMsg(r)}`);
    // A is an UNMAPPED .edu → fallback tag from the registrable label
    r = await rpc('refresh_school_tag', A.token);
    log('school: unmapped .edu A → fallback tag "Hotkeysmoketest"', r.status === 200 && r.data === 'Hotkeysmoketest', `${r.status} ${JSON.stringify(r.data)}`);
  }

  // ---------- 9. HOME DESK (B → Wharton seed, MEMBER only, non-destructive) ----------
  let whartonId = null;
  {
    const t = await api(`/rest/v1/teams?select=id,name,slug,owner_id,edu_domain&slug=eq.wharton`, { token: B.token });
    const w = Array.isArray(t.data) ? t.data[0] : null; whartonId = w && w.id;
    log('seed: wharton visible + ownerless', !!w && w.owner_id === null && w.edu_domain === 'upenn.edu', JSON.stringify(w));
    let r = await rpc('home_desk_for_me', B.token);
    const h = Array.isArray(r.data) ? r.data[0] : null;
    log('school: B home_desk_for_me → Wharton', !!h && h.slug === 'wharton', `${r.status} ${JSON.stringify(h)}`);
    r = await rpc('join_home_desk', B.token);
    log('school: B join_home_desk', r.status === 200, `${r.status} ${JSON.stringify(r.data)}`);
    const my = await rpc('my_desk', B.token);
    const m = Array.isArray(my.data) ? my.data[0] : null;
    log('school: B is MEMBER of Wharton (not captain)', !!m && m.role === 'member' && m.slug === 'wharton', JSON.stringify(m));
    const t2 = await api(`/rest/v1/teams?select=owner_id&slug=eq.wharton`, { token: B.token });
    const w2 = Array.isArray(t2.data) ? t2.data[0] : null;
    log('school: Wharton still ownerless after domain join', !!w2 && w2.owner_id === null, JSON.stringify(w2));
    // C never refreshed a school tag → no home desk (negative path)
    r = await rpc('home_desk_for_me', C.token);
    log('school: untagged C home_desk_for_me → empty', r.status === 200 && Array.isArray(r.data) && r.data.length === 0, JSON.stringify(r.data));
    const r2 = await rpc('join_home_desk', C.token);
    log('school: untagged C join_home_desk → NO_HOME_DESK', r2.status >= 400 && errMsg(r2).includes('NO_HOME_DESK'), `${r2.status} ${errMsg(r2)}`);
  }

  // ---------- 10. CLAIM-AFTER-DOMAIN-JOIN on the smoke-u FIXTURE (fix 20260712700000) ----------
  // A (hotkeysmoketest.edu) domain-joins the smoke-u test seed as member; C then
  // code-joins and must take the captaincy (code = captaincy, domain = membership).
  // Real school seeds are never claimed by the harness — smoke-u is consumable
  // and gets restored by re-stamping the fixtures migration under a new timestamp.
  {
    let r = await rpc('home_desk_for_me', A.token);
    const h = Array.isArray(r.data) ? r.data[0] : null;
    log('fixture: A home_desk_for_me → smoke-u', !!h && h.slug === 'smoke-u', `${r.status} ${JSON.stringify(h)}`);
    r = await rpc('join_home_desk', A.token);
    log('fixture: A join_home_desk (member)', r.status === 200, `${r.status} ${JSON.stringify(r.data)}`);
    const pre = await rpc('my_desk', A.token);
    const preRow = Array.isArray(pre.data) ? pre.data[0] : null;
    log('claim: PRECONDITION A on smoke-u as domain member', !!preRow && preRow.slug === 'smoke-u' && preRow.role === 'member', JSON.stringify(preRow));
    // A already on a desk → home_desk_for_me now empty (the not-exists clause)
    r = await rpc('home_desk_for_me', A.token);
    log('school: on-a-desk A home_desk_for_me → empty', r.status === 200 && Array.isArray(r.data) && r.data.length === 0, JSON.stringify(r.data));
    r = await rpc('join_desk', C.token, { p_code: 'smokeu42' });
    log('claim: C code-joins smoke-u over a sitting domain member', r.status === 200, `${r.status} ${JSON.stringify(r.data)}`);
    const my = await rpc('my_desk', C.token);
    const m = Array.isArray(my.data) ? my.data[0] : null;
    log('claim: C took the captaincy (fix 20260712700000)', !!m && m.slug === 'smoke-u' && m.role === 'captain' && !!m.invite_code, JSON.stringify(m));
    const t = await api(`/rest/v1/teams?select=owner_id&slug=eq.smoke-u`, { token: C.token });
    const w = Array.isArray(t.data) ? t.data[0] : null;
    log('claim: smoke-u owner set to C', !!w && w.owner_id === C.id, JSON.stringify(w));
    // captain powers on a claimed seed
    let r2 = await rpc('set_assignment', C.token, { p_challenge: 'navigation', p_note: 'week one: learn the grid' });
    log('claim: assignment on claimed seed works', r2.status === 200 || r2.status === 204, `${r2.status} ${errMsg(r2)}`);
    r2 = await rpc('rotate_invite', C.token);
    log('claim: rotate on claimed seed works', r2.status === 200 && typeof r2.data === 'string', `${r2.status}`);
  }

  // ---------- 11. CLEANUP (heir promotion re-check + fixture consumption) ----------
  // NOTE: the pure zero-member claim (ownerless + empty → captain) was proven
  // live in the r131 run (C claimed the then-empty Wharton seed) — not repeated
  // here so real seeds stay untouched.
  {
    let r = await rpc('leave_desk', C.token);
    const my = await rpc('my_desk', A.token);
    const m = Array.isArray(my.data) ? my.data[0] : null;
    log('cleanup: C (captain) leaves → A promoted heir on smoke-u', (r.status === 200 || r.status === 204) && !!m && m.role === 'captain' && m.slug === 'smoke-u', JSON.stringify(m));
    r = await rpc('leave_desk', A.token);
    const t = await api(`/rest/v1/teams?select=id&slug=eq.smoke-u`, { token: A.token });
    log('cleanup: A leaves → smoke-u consumed (re-stamp fixtures migration to restore)', (r.status === 200 || r.status === 204) && Array.isArray(t.data) && t.data.length === 0, JSON.stringify(t.data));
    r = await rpc('leave_desk', B.token);
    const t2 = await api(`/rest/v1/teams?select=owner_id&slug=eq.wharton`, { token: B.token });
    const w2 = Array.isArray(t2.data) ? t2.data[0] : null;
    log('cleanup: B leaves Wharton → seed survives ownerless', (r.status === 200 || r.status === 204) && !!w2 && w2.owner_id === null, JSON.stringify(w2));
  }

  // ---------- 12. REPORTS ----------
  {
    let r = await api('/rest/v1/reports', { method: 'POST', token: B.token, body: { reporter: B.id, kind: 'handle', target: `smoke_a_${TS}`, note: 'smoke test report — ignore' } });
    log('reports: insert own report', r.status === 201, `${r.status} ${errMsg(r)}`);
    r = await api('/rest/v1/reports?select=*', { token: B.token });
    log('reports: client select returns nothing', (r.status === 200 && Array.isArray(r.data) && r.data.length === 0) || r.status >= 400, `${r.status} ${JSON.stringify(r.data).slice(0, 80)}`);
    r = await api('/rest/v1/reports', { method: 'POST', token: B.token, body: { reporter: A.id, kind: 'handle', target: 'x', note: 'forged reporter' } });
    log('reports: forged reporter denied', r.status >= 400, `${r.status} ${errMsg(r)}`);
  }

  // ---------- summary ----------
  const fails = results.filter(r => !r.ok);
  console.log(`\n==== ${results.length - fails.length}/${results.length} PASS ====`);
  if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log(' -', f.name, '—', f.detail)); }
  // dump for the report
  const fs = await import('fs');
  fs.writeFileSync(new globalThis.URL('./smoke-results.json', import.meta.url), JSON.stringify({ TS, users: { A: { email: users.A.email, id: users.A.id }, B: { email: users.B.email, id: users.B.id }, C: { email: users.C.email, id: users.C.id } }, results }, null, 2));
})();
