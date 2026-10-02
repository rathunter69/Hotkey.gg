// app2/app/desk-page.js — a Teams desk (Phase F desks v1; migration 0013; screenplay 3.0's page
// rules: panels on the paper ground, tables laid out like a sheet, one primary action, Enter does
// it). Two routes:
//
//   #/desk               your desk. A member: the desk's board (a drill picked from the catalog) and
//                        the members. The owner: the seat view first (each member's lessons done,
//                        chapters Verified and last active; free a seat), the code to share with Copy
//                        the invite link (Enter) and New code, then the board. Not on a desk: the
//                        code box and the way to Teams. Signed out: Sign in.
//   #/desk/join/<code>   the join page: the desk's name, who runs it, the seats left and until when,
//                        and exactly what the owner will see; Join the desk (Enter). Signed out, the
//                        sign-in dialog first; the page redraws signed in.
//
// Desks are made by hand (Teams is sold by hand), so there is no create here. The pure parts
// (seatRowsModel, joinFacts, deskHeadFacts) are tested; every line is a site.csv row.
import { auth } from './auth.js';
import { deskApi, parseDeskCode, joinHref, inviteLink, errorKey, seatLine, lastActive } from './desks.js';
import { entitlement } from './entitlement.js';
import { CATALOG } from '../content/catalog.js';
import { siteCopy } from '../content/copy/apply.js';
import { esc, fill } from '../ui/components/format.js';
import { panelHtml, tableHtml, buttonHtml } from '../ui/components/table.js';
import { levelChipHtml } from '../ui/components/marks.js';
import { mountBoard } from './leaderboard-page.js';
import { showToast } from '../ui/toast.js';

const t = (key, vars) => fill(siteCopy(key, key), vars);

/** A date as the desk pages show it: "July 1, 2027". Pure. */
export function deskDate(iso, locale = 'en-US') {
  const d = Date.parse(iso || ''); if (!Number.isFinite(d)) return '';
  try { return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); } catch (e) { return new Date(d).toISOString().slice(0, 10); }
}

/** "Today", "Yesterday", "6 days ago", or a dash-free "Not yet". Pure. */
export function activeText(iso, now = Date.now()) {
  const a = lastActive(iso, now);
  if (a == null) return t('desk_active_never');
  if (a === 'today') return t('desk_active_today');
  if (a === 'yesterday') return t('desk_active_yesterday');
  return t('desk_active_days', { n: a.days });
}

/** The facts at the right of the desk's heading: the seats, and the date the desk runs to. Pure. */
export function deskHeadFacts(desk) {
  const s = seatLine(desk);
  const facts = [t('desk_seats_used', { used: s.used, seats: s.seats })];
  if (desk && desk.paid_until) facts.push(t('desk_until', { date: deskDate(desk.paid_until) }));
  return facts;
}

/** The owner's seat view as table rows, owner first. Pure. */
export function seatRowsModel(seats, now = Date.now()) {
  return (Array.isArray(seats) ? seats : []).map(s => ({
    handle: String(s.handle || ''), level: Number(s.level) || null, owner: s.role === 'owner',
    lessons: Number(s.lessons_done) || 0, verified: Number(s.chapters_verified) || 0,
    active: activeText(s.last_at, now), joined: deskDate(s.joined_at),
  }));
}

/** The join page's facts: who runs the desk, the seats left, until when. Pure. */
export function joinFacts(p) {
  if (!p) return [];
  const out = [];
  if (p.owner_handle) out.push({ k: t('desk_join_owner_k'), v: p.owner_handle });
  out.push({ k: t('desk_join_seats_k'), v: String(Math.max(0, Number(p.seats_left) || 0)) });
  if (p.paid_until) out.push({ k: t('desk_join_until_k'), v: deskDate(p.paid_until) });
  return out;
}

/** What the owner sees about a member: the join page's promise, one row each. */
export const OWNER_SEES = () => ['desk_sees_1', 'desk_sees_2', 'desk_sees_3', 'desk_sees_4'].map(k => t(k));

const factsHtml = list => list.map(f => `<span>${esc(f)}</span>`).join('');
const kvTable = rows => tableHtml({ cls: 'tbl-kv', head: false, columns: [{ key: 'k', label: '' }, { key: 'v', label: '', align: 'right' }], rows: rows.map(r => ({ cells: { k: esc(r.k), v: `<span class="mono">${esc(r.v)}</span>` }, cursor: false })) });
const lines = list => `<ul class="desk-sees">${list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;

/** The code box: one field and Join. Shown off a desk and on Teams (where Talk to us is the page's primary action, so Join is not). */
export function codeBoxHtml({ value = '', error = '', id = 'deskCode', primary = true } = {}) {
  return `<form class="co-form desk-code-form" id="${esc(id)}Form" novalidate>
    <label class="label" for="${esc(id)}">${esc(t('desk_code_label'))}</label>
    <input class="input mono" id="${esc(id)}" name="code" autocomplete="off" spellcheck="false" placeholder="TEAM-XXXX-XXXX" value="${esc(value)}">
    <p class="co-err" role="alert">${esc(error)}</p>
    <div class="btn-row">${buttonHtml({ label: t('desk_code_go'), key: primary ? 'Enter' : '', primary, id: id + 'Go', attrs: { type: 'submit' } })}</div>
  </form>`;
}

/** Wire a code box: a valid code goes to its join page; anything else says why. */
export function wireCodeBox(el, id = 'deskCode') {
  const f = el.querySelector(`#${id}Form`); if (!f) return;
  f.onsubmit = e => {
    e.preventDefault();
    const code = parseDeskCode(el.querySelector('#' + id).value);
    const err = f.querySelector('.co-err');
    if (!code) { err.textContent = t('desk_err_bad_code'); return; }
    location.hash = joinHref(code);
  };
}

function signedOutHtml() {
  const body = `<p class="panel-line">${esc(t('desk_signed_out'))}</p><div class="btn-row">${buttonHtml({ label: t('rail_sign_in'), key: 'Enter', primary: true, id: 'deskSignin', attrs: { 'data-signin': true } })}</div>`;
  return `<div class="page desk"><h1 class="h-title">${esc(t('desk_title'))}</h1><div class="pg-two"><div class="pg-main">${panelHtml({ heading: esc(t('desk_title')), body, mode: 'daily', cls: 'desk-main' })}</div><div class="pg-side">${teamsSideHtml()}</div></div></div>`;
}

function teamsSideHtml() {
  return panelHtml({ heading: esc(t('desk_teams_head')), body: `<p class="panel-line">${esc(t('desk_teams_line'))}</p><a class="panel-link" href="#/teams">${esc(t('desk_teams_link'))}</a>`, cls: 'desk-teams', stretch: true });
}

function noDeskHtml() {
  const body = `<p class="panel-line">${esc(t('desk_none'))}</p>${codeBoxHtml()}`;
  return `<div class="page desk"><h1 class="h-title">${esc(t('desk_title'))}</h1><div class="pg-two"><div class="pg-main">${panelHtml({ heading: esc(t('desk_code_head')), body, mode: 'daily', cls: 'desk-main' })}</div><div class="pg-side">${teamsSideHtml()}</div></div></div>`;
}

function failedHtml() {
  const body = `<p class="panel-line">${esc(t('desk_failed'))}</p><div class="btn-row">${buttonHtml({ label: t('boards_retry'), key: 'Enter', primary: true, id: 'deskRetry' })}</div>`;
  return `<div class="page desk"><h1 class="h-title">${esc(t('desk_title'))}</h1>${panelHtml({ heading: esc(t('desk_title')), body, cls: 'desk-main' })}</div>`;
}

/** The owner's seat view as a sheet. */
function seatsPanelHtml(desk, seats) {
  const rows = seatRowsModel(seats);
  const s = seatLine(desk);
  const table = tableHtml({ sheet: true, cls: 'tbl-seats', label: t('desk_seats_head'), fill: s.seats,
    columns: [{ key: 'player', label: t('col_player') }, { key: 'lessons', label: t('desk_col_lessons'), align: 'right' }, { key: 'verified', label: t('desk_col_verified'), align: 'right' }, { key: 'active', label: t('desk_col_active') }, { key: 'act', label: '', align: 'right', cls: 'act' }],
    rows: rows.map(r => ({ cells: {
      player: `<span class="row-name">${esc(r.handle)}</span>${levelChipHtml(r.level)}${r.owner ? `<span class="desk-role">${esc(t('desk_role_owner'))}</span>` : ''}`,
      lessons: String(r.lessons), verified: String(r.verified), active: esc(r.active),
      act: r.owner ? '' : `<button type="button" class="link-btn desk-free" data-handle="${esc(r.handle)}">${esc(t('desk_free_seat'))}</button>` }, cursor: false })) });
  const left = s.left ? t(s.left === 1 ? 'desk_seat_left' : 'desk_seats_left', { n: s.left }) : t('desk_seats_full');
  return panelHtml({ heading: esc(t('desk_seats_head')), facts: esc(left), body: table + `<p class="panel-line ink-2">${esc(t('desk_seats_line'))}</p>`, cls: 'desk-seats' });
}

function invitePanelHtml(desk) {
  const body = `<p class="desk-code mono" id="deskCodeShown">${esc(desk.code || '')}</p>
    <p class="panel-line">${esc(t('desk_invite_line'))}</p>
    <div class="btn-row">${buttonHtml({ label: t('desk_copy_link'), key: 'Enter', primary: true, id: 'deskCopy' })}${buttonHtml({ label: t('desk_new_code'), quiet: true, id: 'deskNewCode' })}</div>
    <p class="fine">${esc(t('desk_new_code_line'))}</p>`;
  return panelHtml({ heading: esc(t('desk_invite_head')), body, mode: 'daily', cls: 'desk-invite', attrs: { 'data-cursor': true, 'data-cursor-enter': '#deskCopy', tabindex: '-1' } });
}

function membersPanelHtml(desk) {
  const rows = (desk.members || []).map(m => ({ cells: { player: `<span class="row-name">${esc(m.handle)}</span>${levelChipHtml(Number(m.level) || null)}${m.me ? `<span class="desk-role">${esc(t('desk_you'))}</span>` : ''}`, role: m.role === 'owner' ? esc(t('desk_role_owner')) : '' }, cls: m.me ? 'mine' : '', cursor: false }));
  const table = tableHtml({ cls: 'tbl-members', head: false, columns: [{ key: 'player', label: '' }, { key: 'role', label: '', align: 'right' }], rows });
  const leave = desk.role === 'owner' ? '' : `<div class="btn-row">${buttonHtml({ label: t('desk_leave'), quiet: true, id: 'deskLeave' })}</div><p class="fine">${esc(t('desk_leave_line'))}</p>`;
  return panelHtml({ heading: esc(t('desk_members_head')), facts: esc(String((desk.members || []).length)), body: table + leave, cls: 'desk-members', stretch: true });
}

/** The drills a desk can race on: the catalog's drills, Chapter 1 first, the free ones open to every seat. */
const deskDrills = () => CATALOG.filter(e => e.mode === 'drill');

export function mountDeskPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'pg pg-desk';
  root.appendChild(el);
  const code = ctx.params && ctx.params.code ? parseDeskCode(ctx.params.code) : null;
  let alive = true; let board = null; let ref = (ctx.query && ctx.query.ref) || null;
  const destroyBoard = () => { if (board) { board.destroy(); board = null; } };
  const refresh = () => { if (ctx.cursor) ctx.cursor.refresh(); };
  const onKey = e => {
    if (e.defaultPrevented || e.key !== 'Enter') return;
    if (e.target && e.target.closest && e.target.closest('a, button, input, select, textarea')) return;
    const b = el.querySelector('.btn2-primary:not([disabled])'); if (b) { e.preventDefault(); b.click(); }
  };
  document.addEventListener('keydown', onKey);

  async function showJoin() {
    el.innerHTML = `<div class="page desk"><h1 class="h-title">${esc(t('desk_join_title'))}</h1>${panelHtml({ heading: esc(t('desk_join_title')), body: `<p class="panel-line">${esc(t('boards_loading'))}</p>`, cls: 'desk-main' })}</div>`;
    if (!code) { paintJoin(null, t('desk_err_bad_code')); return; }
    const r = await deskApi.preview(code);
    if (!alive) return;
    if (r.error) { paintJoin(null, t(r.error === 'unavailable' || r.error === 'network' ? 'desk_failed' : errorKey(r.error))); return; }
    paintJoin(r.data, r.data ? '' : t('desk_err_bad_code'));
  }

  function paintJoin(p, error = '') {
    const signedIn = auth.state() === 'in';
    let body;
    if (!p) body = `<p class="panel-line">${esc(error)}</p>${codeBoxHtml()}`;
    else {
      const full = !(Number(p.seats_left) > 0);
      const btn = !signedIn
        ? buttonHtml({ label: t('desk_join_signin'), key: 'Enter', primary: true, id: 'deskJoin', attrs: { 'data-signin': true } })
        : buttonHtml({ label: t('desk_join_go'), key: 'Enter', primary: true, id: 'deskJoin', attrs: full ? { disabled: true } : null });
      body = `${kvTable(joinFacts(p))}
        <p class="panel-line">${esc(t('desk_join_line'))}</p>
        <p class="co-err" role="alert" id="deskJoinErr">${esc(full ? t('desk_err_full') : error)}</p>
        <div class="btn-row">${btn}${buttonHtml({ label: t('paywall_not_now'), key: 'Esc', quiet: true, href: '#/teams', id: 'deskNotNow' })}</div>
        ${signedIn ? '' : `<p class="fine">${esc(t('desk_join_signin_line'))}</p>`}`;
    }
    const sees = panelHtml({ heading: esc(t('desk_sees_head')), body: `${lines(OWNER_SEES())}<p class="panel-line ink-2">${esc(t('desk_sees_not'))}</p>`, cls: 'desk-sees-panel', stretch: true });
    el.innerHTML = `<div class="page desk"><h1 class="h-title">${esc(t('desk_join_title'))}</h1><div class="pg-two"><div class="pg-main">${panelHtml({ heading: esc(p ? p.name : t('desk_code_head')), facts: p ? `<span class="desk-mark">${esc(t('desk_mark'))}</span>` : '', body, mode: 'daily', cls: 'desk-main desk-join', stretch: true, attrs: { 'data-cursor': true, 'data-cursor-enter': '#deskJoin', tabindex: '-1' } })}</div><div class="pg-side">${sees}</div></div></div>`;
    wireCodeBox(el);
    const go = el.querySelector('#deskJoin');
    if (go && signedIn && p) go.onclick = async () => {
      go.disabled = true;
      const r = await deskApi.join(code);
      if (!alive) return;
      if (r.error) { go.disabled = false; el.querySelector('#deskJoinErr').textContent = t(errorKey(r.error)); return; }
      await entitlement.refresh(true);
      if (!alive) return;
      showToast(t('desk_joined', { name: r.data && r.data.name ? r.data.name : p.name }));
      location.hash = '#/desk';
    };
    const esc_ = e => { if (e.key === 'Escape' && !e.defaultPrevented && !document.querySelector('.pop')) { e.preventDefault(); location.hash = '#/teams'; } };
    document.addEventListener('keydown', esc_);
    cleanups.push(() => document.removeEventListener('keydown', esc_));
    refresh();
  }

  async function showDesk() {
    if (auth.state() !== 'in') { el.innerHTML = signedOutHtml(); refresh(); return; }
    el.innerHTML = `<div class="page desk"><h1 class="h-title">${esc(t('desk_title'))}</h1>${panelHtml({ heading: esc(t('desk_title')), body: `<p class="panel-line">${esc(t('boards_loading'))}</p>`, cls: 'desk-main' })}</div>`;
    const r = await deskApi.mine();
    if (!alive) return;
    if (r.error) { el.innerHTML = failedHtml(); el.querySelector('#deskRetry').onclick = showDesk; refresh(); return; }
    if (!r.data) { el.innerHTML = noDeskHtml(); wireCodeBox(el); const i = el.querySelector('#deskCode'); if (i) i.focus({ preventScroll: true }); refresh(); return; }
    const desk = r.data;
    let seats = null;
    if (desk.role === 'owner') { const s = await deskApi.seats(); if (!alive) return; seats = s.error ? [] : s.data; }
    paintDesk(desk, seats);
  }

  function paintDesk(desk, seats) {
    destroyBoard();
    const drills = deskDrills();
    if (!ref || !drills.some(d => d.id === ref)) ref = (drills[0] || {}).id || null;
    const picker = `<label class="picker"><span>${esc(t('boards_pick'))}</span><select id="deskPick">${drills.map(d => `<option value="${esc(d.id)}"${d.id === ref ? ' selected' : ''}>${esc(d.title)}</option>`).join('')}</select></label>`;
    const owner = desk.role === 'owner';
    const head = `<div class="desk-head"><h1 class="h-title">${esc(desk.name)}</h1><span class="panel-facts">${factsHtml(deskHeadFacts(desk))}</span></div>`;
    // the owner's seats and invite sit above the board; the board below takes the page's width, as on Leaderboards
    const boardRow = `<div class="desk-board-row"><h2 class="panel-h">${esc(t('desk_board_head'))}</h2>${picker}</div><div class="board-host"></div>`;
    const top = owner ? `<div class="pg-two"><div class="pg-main">${seatsPanelHtml(desk, seats)}</div><div class="pg-side">${invitePanelHtml(desk)}${membersPanelHtml(desk)}</div></div>` : '';
    const side = owner ? '' : `<div class="desk-members-row">${membersPanelHtml(desk)}</div>`;
    el.innerHTML = `<div class="page desk">${head}${top}${boardRow}${side}</div>`;
    const host = el.querySelector('.board-host');
    const entry = drills.find(d => d.id === ref);
    if (host && ref) board = mountBoard(host, { ref, title: entry ? entry.title : ref, yours: t('boards_yours'), fetch: (r_, seed) => deskApi.board(r_, seed), live: true });
    const pick = el.querySelector('#deskPick'); if (pick) pick.onchange = () => { ref = pick.value; paintDesk(desk, seats); };
    const copy = el.querySelector('#deskCopy');
    if (copy) copy.onclick = () => {
      const link = inviteLink(desk.code, location.href);
      try { navigator.clipboard.writeText(link).then(() => showToast(t('desk_copied')), () => showToast(t('desk_copy_blocked'))); } catch (e) { showToast(t('desk_copy_blocked')); }
    };
    const fresh = el.querySelector('#deskNewCode');
    if (fresh) fresh.onclick = async () => {
      fresh.disabled = true;
      const r = await deskApi.newCode();
      if (!alive) return;
      fresh.disabled = false;
      if (r.error || !r.data) { showToast(t(errorKey(r && r.error))); return; }
      desk.code = r.data; el.querySelector('#deskCodeShown').textContent = r.data; showToast(t('desk_new_code_done'));
    };
    el.querySelectorAll('.desk-free').forEach(b => { b.onclick = async () => {
      const h = b.dataset.handle;
      if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = t('desk_free_confirm', { handle: h }); return; }
      b.disabled = true;
      const r = await deskApi.remove(h);
      if (!alive) return;
      if (r.error) { b.disabled = false; showToast(t(errorKey(r.error))); return; }
      showToast(t('desk_freed', { handle: h }));
      showDesk();
    }; });
    const leave = el.querySelector('#deskLeave');
    if (leave) leave.onclick = async () => {
      if (leave.dataset.armed !== '1') { leave.dataset.armed = '1'; leave.querySelector('span').textContent = t('desk_leave_confirm'); return; }
      leave.disabled = true;
      const r = await deskApi.leave();
      if (!alive) return;
      if (r.error) { leave.disabled = false; showToast(t(errorKey(r.error))); return; }
      await entitlement.refresh(true);
      if (!alive) return;
      showToast(t('desk_left'));
      showDesk();
    };
    refresh();
  }

  const cleanups = [];
  if (code || (ctx.params && ctx.params.join)) showJoin(); else showDesk();
  return { destroy() { alive = false; destroyBoard(); document.removeEventListener('keydown', onKey); cleanups.forEach(f => f()); el.remove(); } };
}
