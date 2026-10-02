// app2/app/teams-page.js — Teams (SITE_SPEC §11a): the two paths (Start a desk, free; Group
// access, paid), a "Have a code?" box and a "Request group access" form. Until the server side
// lands (Phases B, E, F) the code and the request are stored on this device, and the page says so.
export const REQUESTS_KEY = 'hk2_group_requests';
export const CODE_KEY = 'hk2_pending_code';
import { siteCopy } from '../content/copy/apply.js';

const t = (key, vars) => { let v = siteCopy(key, ''); for (const k in (vars || {})) v = v.split('{' + k + '}').join(String(vars[k])); return v; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function readList(key) { try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function writeList(key, list) { try { localStorage.setItem(key, JSON.stringify(list)); return true; } catch (e) { return false; } }

/** Validate the request form. Returns { ok, errors:{field:msg}, data }. Pure. */
export function validateRequest(f) {
  const errors = {};
  const data = { name: String(f.name || '').trim(), org: String(f.org || '').trim(), email: String(f.email || '').trim(), seats: Number(f.seats), start: String(f.start || '').trim() };
  if (!data.name) errors.name = t('teams_err_name');
  if (!data.org) errors.org = t('teams_err_org');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = t('teams_err_email');
  if (!Number.isInteger(data.seats) || data.seats < 1 || data.seats > 100000) errors.seats = t('teams_err_seats');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.start)) errors.start = t('teams_err_start');
  return { ok: Object.keys(errors).length === 0, errors, data };
}

export function mountTeamsPage(root) {
  const el = document.createElement('div');
  el.className = 'page teams';
  const pendingCode = readList(CODE_KEY)[0];
  const requests = readList(REQUESTS_KEY);
  el.innerHTML = `<div class="page-head"><h1>${esc(t('teams_title'))}</h1><p class="page-sub">${esc(t('teams_sub'))}</p></div>
    <div class="teams-grid">
      <section class="tcard">
        <div class="tcard-cap"><span>${esc(t('teams_desk_cap'))}</span><span class="pcard-tag on">${esc(t('teams_desk_tag'))}</span></div>
        <div class="tcard-body">
          <h2>${esc(t('teams_desk_heading'))}</h2>
          <p>${esc(t('teams_desk_body'))}</p>
          <p class="muted">${esc(t('teams_desk_who'))}</p>
          <a class="btn btn-primary" href="#/account?section=desks">${esc(t('teams_desk_create'))}</a>
          <p class="page-fine">${esc(t('teams_desk_signin'))}</p>
          <form class="code-box" id="codeForm" novalidate>
            <label for="codeInput"><b>${esc(t('teams_code_head'))}</b> ${esc(t('teams_code_line'))}</label>
            <div class="code-row"><input id="codeInput" type="text" placeholder="e.g. DESK-4K7Q" autocomplete="off" value="${esc(pendingCode || '')}"><button class="btn btn-ghost" type="submit">${esc(t('teams_code_join'))}</button></div>
            <p class="form-msg" id="codeMsg" role="status">${pendingCode ? esc(t('teams_code_kept', { code: pendingCode })) : ''}</p>
          </form>
        </div>
      </section>
      <section class="tcard">
        <div class="tcard-cap"><span>${esc(t('teams_group_cap'))}</span><span class="pcard-tag">${esc(t('teams_group_tag'))}</span></div>
        <div class="tcard-body">
          <h2>${esc(t('teams_group_heading'))}</h2>
          <p>${esc(t('teams_group_body'))}</p>
          <form class="req-form" id="reqForm" novalidate>
            <div class="req-grid">
              <label>${esc(t('teams_field_name'))}<input name="name" type="text" autocomplete="name" required></label>
              <label>${esc(t('teams_field_org'))}<input name="org" type="text" autocomplete="organization" required></label>
              <label>${esc(t('teams_field_email'))}<input name="email" type="email" autocomplete="email" required></label>
              <label>${esc(t('teams_field_seats'))}<input name="seats" type="number" min="1" step="1" inputmode="numeric" required></label>
              <label>${esc(t('teams_field_start'))}<input name="start" type="date" required></label>
            </div>
            <div class="req-actions"><button class="btn btn-primary" type="submit">${esc(t('teams_request'))}</button></div>
            <p class="form-msg" id="reqMsg" role="status" aria-live="polite">${requests.length ? esc(t('teams_req_count', { n: requests.length === 1 ? '1 request' : requests.length + ' requests' })) : ''}</p>
            <p class="page-fine">${esc(t('teams_req_local'))} <a href="#/contact">${esc(t('teams_req_link'))}</a></p>
          </form>
        </div>
      </section>
    </div>`;
  root.appendChild(el);

  const codeForm = el.querySelector('#codeForm');
  codeForm.onsubmit = e => {
    e.preventDefault();
    const v = el.querySelector('#codeInput').value.trim().toUpperCase();
    const msg = el.querySelector('#codeMsg');
    if (!v) { msg.textContent = t('teams_code_empty'); return; }
    const code = (v.match(/[A-Z0-9-]{4,}$/) || [v])[0];
    const ok = writeList(CODE_KEY, [code]);
    msg.textContent = ok ? t('teams_code_kept', { code }) : t('teams_code_failed');
  };
  const form = el.querySelector('#reqForm');
  form.onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form).entries());
    const { ok, errors, data } = validateRequest(f);
    form.querySelectorAll('label').forEach(l => l.classList.remove('bad'));
    const msg = el.querySelector('#reqMsg');
    if (!ok) {
      for (const k in errors) { const inp = form.querySelector(`[name="${k}"]`); if (inp) inp.closest('label').classList.add('bad'); }
      msg.textContent = Object.values(errors).join(' ');
      const first = form.querySelector('label.bad input'); if (first) first.focus();
      return;
    }
    const list = readList(REQUESTS_KEY); list.push({ ...data, at: new Date().toISOString() });
    const saved = writeList(REQUESTS_KEY, list);
    msg.textContent = saved ? t('teams_req_saved') : t('teams_req_failed');
    if (saved) form.reset();
  };
  return { destroy() { el.remove(); } };
}
