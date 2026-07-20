#!/usr/bin/env node
/* ============================================================
   SEED FIELD GENERATOR (r337, Wolf: "get enough players and scores in so we can
   see what the leaderboards look like — but be prepared to clear them at launch,
   or keep them on side desks that won't interfere with schools").

   Generates two SQL files to paste into the Supabase SQL editor:
     dev/seed-field.sql  — inserts 50 seed players + ~2k plausible runs + 2 side desks
     dev/seed-clear.sql  — deletes every seed row (run this at launch)

   Design:
   - CLEARABLE BY CONSTRUCTION: every seed user id starts with the hex prefix
     5eed0000-…, every seed desk id with 5eedde5c-…. The clear script deletes by
     prefix — nothing else can collide with it.
   - SIDE DESKS ONLY: seeds join two PRIVATE desks ("The Bullpen", "Night Shift"),
     never a school (show_school=false, no school_tag) — school standings and the
     public guild board never see them.
   - PLAUSIBLE TIMES: each seed gets a skill draw (shark → straggler); per-drill
     times sample around par (HOTKEY_PARS) for that skill band, coverage decays
     down the catalog (everyone ran Foundations, few finished Full Builds).
   - DETERMINISTIC: fixed RNG seed — re-running the generator reproduces the same
     field, and seed-field.sql is idempotent (it clears seed rows first).

   Usage:  node dev/seed-field.js          (writes the two .sql files)
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

// ---- pull pars + catalog order from drills.js (single source) ----
const drillsSrc = fs.readFileSync(path.join(__dirname, '..', 'drills.js'), 'utf8');
const sandbox = {};
new Function('window', drillsSrc)(sandbox);
const PARS = sandbox.HOTKEY_PARS;
const ORDER = sandbox.HOTKEY_DRILLS.menuOrder.filter(k => PARS[k] !== undefined);

// ---- deterministic RNG (mulberry32) ----
let _s = 0x5EED;
const rnd = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const between = (a, b) => a + rnd() * (b - a);
const pick = arr => arr[Math.floor(rnd() * arr.length)];

// ---- the field: 50 clean desk-culture handles ----
const HANDLES = [
  'PasteSpecialist','CtrlFreak','MarginCall','DeskJockey','AltHero','SumProduct','FillDown','TraceKing',
  'ModelCitizen','ParBreaker','VLookupVet','PivotPilot','NoMouseNed','GridLock','AnchorMan','FirstYearFrank',
  'ExcelsiorLBO','ZeroDecimals','BlueFontBandit','CommaChameleon','RibbonRunner','F2Fiend','EscArtist','TabOrDie',
  'SheetShow','WaccWizard','DcfDynamo','LboLegend','CompsCrusher','AccretionAce','BridgeBuilder','CagrCadet',
  'SumIfSam','RollupRick','FxPhantom','SortShark','ScrubDaddy','RowOpsRex','ColColonel','UndoKing',
  'FormatPhantom','BorderPatrol','DecimalDiva','AutofitAndy','GauntletGrace','FootnoteFred','PercentPete',
  'GrowthGuru','SeriesStar','AuditAnnie'
];

// skill bands: [count, timeFactor lo-hi (× par), catalog coverage lo-hi]
const BANDS = [
  { n: 8,  name: 'shark',     f: [0.72, 0.98], cov: [0.60, 0.90] },
  { n: 15, name: 'solid',     f: [0.95, 1.50], cov: [0.45, 0.75] },
  { n: 17, name: 'middle',    f: [1.40, 2.20], cov: [0.30, 0.55] },
  { n: 10, name: 'straggler', f: [1.90, 3.20], cov: [0.15, 0.35] },
];

const uid  = i => '5eed0000-0000-4000-8000-' + String(i).padStart(12, '0');
const DESKS = [
  { id: '5eedde5c-0000-4000-8000-000000000001', name: 'The Bullpen',  slug: 'seed-bullpen' },
  { id: '5eedde5c-0000-4000-8000-000000000002', name: 'Night Shift',  slug: 'seed-nightshift' },
];

// ---- build the field ----
const users = [];
let idx = 0;
BANDS.forEach(b => { for (let j = 0; j < b.n; j++, idx++) {
  users.push({ id: uid(idx), handle: HANDLES[idx], band: b,
    f: between(b.f[0], b.f[1]), cov: between(b.cov[0], b.cov[1]),
    desk: rnd() < 0.6 ? pick(DESKS).id : null });
} });

// runs: coverage decays down the catalog; per covered drill 1 best time (+ sometimes a slower dup)
const NOW = Date.UTC(2026, 6, 18);   // fixed so the output is reproducible
const runs = [];
users.forEach(u => {
  ORDER.forEach((k, i) => {
    const depth = i / (ORDER.length - 1);                 // 0 = first drill, 1 = last
    const pCover = u.cov * (1.15 - 0.9 * depth);          // early drills near-certain, late rare
    if (rnd() > pCover) return;
    const par = PARS[k];
    const jitter = between(0.92, 1.25);                   // day-to-day noise on top of skill
    const ms = Math.max(2500, Math.round(par * u.f * jitter * 1000));
    const daysAgo = Math.floor(between(0, 30));
    const ts = new Date(NOW - daysAgo * 86400e3 - Math.floor(between(0, 86400e3))).toISOString();
    runs.push({ u: u.id, k, ms, ts });
    if (rnd() < 0.25) {                                    // an earlier, slower attempt
      const ts2 = new Date(NOW - (daysAgo + Math.ceil(between(1, 5))) * 86400e3).toISOString();
      runs.push({ u: u.id, k, ms: Math.round(ms * between(1.15, 1.6)), ts: ts2 });
    }
  });
});

// ---- emit SQL ----
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const clearSql = `-- SEED CLEAR (generated by dev/seed-field.js) — removes EVERY seed row.
-- Run this at launch. Seed ids are namespaced (5eed…) so nothing real matches.
begin;
-- the runs table carries a runs_guard() trigger (anti-cheat: rejects rows that don't come
-- through the app). Seeding is exactly that, on purpose — run the transaction with triggers
-- off (postgres/service role only; also skips FK triggers, which our namespaced ids satisfy).
set local session_replication_role = replica;
delete from public.runs         where user_id::text like '5eed0000-%';
delete from public.team_members where user_id::text like '5eed0000-%';
delete from public.teams        where id::text      like '5eedde5c-%';
delete from public.profiles     where id::text      like '5eed0000-%';
delete from auth.users          where id::text      like '5eed0000-%';
commit;
`;

let sql = `-- SEED FIELD (generated by dev/seed-field.js — do not hand-edit; re-run the generator)
-- ${users.length} seed players, ${runs.length} runs, ${DESKS.length} private side desks.
-- Idempotent: clears existing seed rows first. Remove everything with dev/seed-clear.sql.
-- runs_guard() (anti-cheat trigger) rejects direct inserts — seeding runs with triggers off.
begin;
set local session_replication_role = replica;
${clearSql.replace(/^begin;\n|commit;\n$/gm, '').replace(/^--.*\n(--.*\n)?/, '')}
-- auth users (minimal rows; the profiles trigger may pre-create profile stubs)
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
${users.map(u => `  (${q(u.id)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${q(u.handle.toLowerCase() + '@seed.hotkey.gg')}, 'seed-no-login', now(), now(), now(), '{"provider":"seed"}', '{}')`).join(',\n')}
on conflict (id) do nothing;

insert into public.profiles (id, handle, show_school)
values
${users.map(u => `  (${q(u.id)}, ${q(u.handle)}, false)`).join(',\n')}
on conflict (id) do update set handle = excluded.handle, show_school = false;

-- side desks: PRIVATE, unverified, not recruiting — invisible to the guild board and schools
insert into public.teams (id, name, slug, verified, is_private, recruiting)
values
${DESKS.map(d => `  (${q(d.id)}, ${q(d.name)}, ${q(d.slug)}, false, true, false)`).join(',\n')}
on conflict (id) do nothing;

insert into public.team_members (team_id, user_id, role)
values
${users.filter(u => u.desk).map((u, i) => `  (${q(u.desk)}, ${q(u.id)}, ${i === 0 ? q('captain') : q('member')})`).join(',\n')}
on conflict do nothing;

insert into public.runs (user_id, challenge, time_ms, mouse_used, created_at)
values
${runs.map(r => `  (${q(r.u)}, ${q(r.k)}, ${r.ms}, false, ${q(r.ts)})`).join(',\n')};
commit;
`;

fs.writeFileSync(path.join(__dirname, 'seed-field.sql'), sql);
fs.writeFileSync(path.join(__dirname, 'seed-clear.sql'), clearSql);

// ---- summary ----
const perBand = {};
users.forEach(u => { perBand[u.band.name] = (perBand[u.band.name] || 0) + 1; });
const covered = {};
runs.forEach(r => covered[r.k] = (covered[r.k] || new Set(), covered[r.k] || (covered[r.k] = new Set()), covered[r.k].add(r.u), covered[r.k]));
const sizes = ORDER.map(k => (covered[k] ? covered[k].size : 0));
console.log('seed players:', users.length, JSON.stringify(perBand));
console.log('runs:', runs.length, '· desk members:', users.filter(u => u.desk).length);
console.log('board field sizes — first drill:', sizes[0], '· median:', sizes.slice().sort((a, b) => a - b)[Math.floor(sizes.length / 2)], '· last drill:', sizes[sizes.length - 1]);
console.log('wrote dev/seed-field.sql + dev/seed-clear.sql');
