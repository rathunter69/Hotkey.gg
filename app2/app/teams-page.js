// app2/app/teams-page.js — Teams (SITE_SPEC §11a): the two paths (Start a desk, free; Group
// access, paid), a "Have a code?" box and a "Request group access" form. Until the server side
// lands (Phases B, E, F) the code and the request are stored on this device, and the page says so.
export const REQUESTS_KEY = 'hk2_group_requests';
export const CODE_KEY = 'hk2_pending_code';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function readList(key) { try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function writeList(key, list) { try { localStorage.setItem(key, JSON.stringify(list)); return true; } catch (e) { return false; } }

/** Validate the request form. Returns { ok, errors:{field:msg}, data }. Pure. */
export function validateRequest(f) {
  const errors = {};
  const data = { name: String(f.name || '').trim(), org: String(f.org || '').trim(), email: String(f.email || '').trim(), seats: Number(f.seats), start: String(f.start || '').trim() };
  if (!data.name) errors.name = 'Your name is needed.';
  if (!data.org) errors.org = 'The organisation is needed.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'A valid email is needed.';
  if (!Number.isInteger(data.seats) || data.seats < 1 || data.seats > 100000) errors.seats = 'Seats: a whole number from 1 up.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.start)) errors.start = 'A start date is needed.';
  return { ok: Object.keys(errors).length === 0, errors, data };
}

export function mountTeamsPage(root) {
  const el = document.createElement('div');
  el.className = 'page teams';
  const pendingCode = readList(CODE_KEY)[0];
  const requests = readList(REQUESTS_KEY);
  el.innerHTML = `<div class="page-head"><h1>Teams and schools</h1><p class="page-sub">For banks, training providers, finance clubs, classes and friend groups. Two things a group can do here.</p></div>
    <div class="teams-grid">
      <section class="tcard">
        <div class="tcard-cap"><span>start a desk</span><span class="pcard-tag on">free to create</span></div>
        <div class="tcard-body">
          <h2>A private group with its own board</h2>
          <p>A desk is a private group: its own leaderboard, assignments set by a captain, and progress the captain can see (your times on assignments, nothing else).</p>
          <p class="muted">For a study group, a finance club, an analyst class, a team at work.</p>
          <a class="btn btn-primary" href="#/account?section=desks">Create a desk</a>
          <p class="page-fine">Desks need an account. Sign-in arrives in the next phase; desk creation follows it.</p>
          <form class="code-box" id="codeForm" novalidate>
            <label for="codeInput"><b>Have a code?</b> Join a desk by invite code or link.</label>
            <div class="code-row"><input id="codeInput" type="text" placeholder="e.g. DESK-4K7Q" autocomplete="off" value="${esc(pendingCode || '')}"><button class="btn btn-ghost" type="submit">Join</button></div>
            <p class="form-msg" id="codeMsg" role="status">${pendingCode ? `Code ${esc(pendingCode)} is kept on this device until sign-in arrives.` : ''}</p>
          </form>
        </div>
      </section>
      <section class="tcard">
        <div class="tcard-cap"><span>group access</span><span class="pcard-tag">paid · for organisations</span></div>
        <div class="tcard-body">
          <h2>One code, a number of seats, one end date</h2>
          <p>Group access unlocks the paid tier for everyone on the code or link, with a progress view for the organiser and invoice-friendly billing. No self-serve checkout for groups at launch: send a request and we reply by email.</p>
          <form class="req-form" id="reqForm" novalidate>
            <div class="req-grid">
              <label>Name<input name="name" type="text" autocomplete="name" required></label>
              <label>Organisation<input name="org" type="text" autocomplete="organization" required></label>
              <label>Email<input name="email" type="email" autocomplete="email" required></label>
              <label>Seats<input name="seats" type="number" min="1" step="1" inputmode="numeric" required></label>
              <label>Start date<input name="start" type="date" required></label>
            </div>
            <div class="req-actions"><button class="btn btn-primary" type="submit">Request group access</button></div>
            <p class="form-msg" id="reqMsg" role="status" aria-live="polite">${requests.length ? `${requests.length} request${requests.length === 1 ? '' : 's'} saved on this device.` : ''}</p>
            <p class="page-fine">For now the request is stored on this device only; it is sent to us once the server side lands. Until then, use the <a href="#/contact">contact page</a>.</p>
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
    if (!v) { msg.textContent = 'Enter a code or paste an invite link.'; return; }
    const code = (v.match(/[A-Z0-9-]{4,}$/) || [v])[0];
    const ok = writeList(CODE_KEY, [code]);
    msg.textContent = ok ? `Code ${code} is kept on this device. Joining opens with accounts in the next phase.` : 'Could not save the code on this device.';
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
    msg.textContent = saved ? `Saved on this device (${list.length} request${list.length === 1 ? '' : 's'}). It is not sent anywhere yet.` : 'Could not save on this device. Please use the contact page.';
    if (saved) form.reset();
  };
  return { destroy() { el.remove(); } };
}
