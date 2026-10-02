// app2/app/ops-page.js — #/ops, the page the people who run hotkey.gg read (REBUILD_PLAN section 6;
// E-checkout's "admin page" for billing alerts). One read, rpc_ops_overview (0015_ops.sql), which
// refuses anyone outside ops_admins with 42501, so the page holds no secret and checks nothing
// itself: this week's figures against the week before, errors grouped by message with their stack,
// the open billing alerts with Resolve, and the stored weekly digests with their text to copy.
// Not in the rail, the sitemap or any link: Wolf opens it by address. Not named "admin" (the
// liability checklist: no default admin route).
import { auth } from './auth.js';
import { siteCopy } from '../content/copy/apply.js';
import { panelHtml, tableHtml, buttonHtml, headerBlockHtml } from '../ui/components/table.js';
import { renderDigest } from '../supabase/functions/_shared/ops.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb, vars) => fill(siteCopy(key, fb), vars);
const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** The window the page reads, in days. */
export const OPS_DAYS = 7;

/** '2026-10-01 14:05' in UTC, or ''. Pure. */
export function when(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16).replace('T', ' ');
}
/** 'team_subscription_ended' → 'Team subscription ended'. Pure. */
export function kindLabel(kind) {
  const s = String(kind || '').replace(/_/g, ' ').trim();
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}
/** An address shown by its path and hash route only. Pure. */
export function pageOf(url) {
  const u = String(url || '');
  const m = /^https?:\/\/[^/]+(\/[^?#]*)?(#[^?]*)?/.exec(u);
  return m ? (m[1] || '/') + (m[2] || '') : u;
}

/** This week's figures against the week before. Pure. */
export function weekHtml(report) {
  const r = report || {}, s = r.signups || {}, l = r.lessons || {}, e = r.errors || {}, b = r.billing || {};
  const rows = [
    ['accounts', t('ops_week_accounts', 'New accounts'), s.accounts, s.accounts_prev],
    ['lessons', t('ops_week_lessons', 'First lesson completions'), l.first_completions, l.first_completions_prev],
    ['runs', t('ops_week_runs', 'Lesson runs, signed in'), l.runs, null],
    ['errors', t('ops_week_errors', 'Error reports'), e.count, e.count_prev],
    ['alerts', t('ops_week_alerts', 'Open billing alerts'), b.alerts_open, null],
  ].map(([key, label, now, before]) => ({ cls: 'ops-' + key, cursor: false, cells: { what: esc(label), now: String(num(now)), before: before == null ? '' : String(num(before)) } }));
  const columns = [{ key: 'what', label: esc(t('ops_col_what', 'Figure')) }, { key: 'now', label: esc(t('ops_col_now', 'This week')), align: 'right' }, { key: 'before', label: esc(t('ops_col_before', 'Week before')), align: 'right' }];
  return panelHtml({ heading: esc(t('ops_week', 'This week')), facts: esc(t('ops_days', 'Last {n} days', { n: num(r.days) || OPS_DAYS })), body: tableHtml({ columns, rows, cls: 'tbl-ops-week' }), mode: 'learn', cls: 'ops-week' });
}

/** Errors grouped by message, loudest first; each message opens to its latest stack. Pure. */
export function errorsHtml(errors) {
  const list = Array.isArray(errors) ? errors : [];
  const columns = [
    { key: 'message', label: esc(t('ops_col_message', 'Message')), cls: 'msg' },
    { key: 'reports', label: esc(t('ops_col_reports', 'Reports')), align: 'right' },
    { key: 'sessions', label: esc(t('ops_col_sessions', 'Sessions')), align: 'right' },
    { key: 'last', label: esc(t('ops_col_last', 'Last seen')), align: 'right', cls: 'time' },
  ];
  const rows = list.map(x => ({
    cursor: false,
    cells: {
      message: `<details class="ops-err"><summary>${esc(String(x.message || '').slice(0, 160))}</summary><dl class="ops-err-more"><dt>${esc(t('ops_col_page', 'Page'))}</dt><dd class="mono">${esc(pageOf(x.url))}</dd><dt>${esc(t('ops_col_browser', 'Browser'))}</dt><dd>${esc(x.ua || t('ops_unknown', 'Unknown'))}</dd></dl>${x.stack ? `<pre class="ops-stack">${esc(x.stack)}</pre>` : ''}</details>`,
      reports: String(num(x.n)), sessions: String(num(x.sessions)), last: esc(when(x.last_at)),
    },
  }));
  const body = list.length ? tableHtml({ columns, rows, cls: 'tbl-ops-errors' }) : `<p class="panel-line">${esc(t('ops_errors_none', 'No errors in this window.'))}</p>`;
  return panelHtml({ heading: esc(t('ops_errors', 'Errors')), facts: esc(t('ops_errors_facts', '{n} messages', { n: list.length })), body, cls: 'ops-errors' });
}

/** The open billing alerts, newest first, each with Resolve. Pure. */
export function alertsHtml(alerts) {
  const list = Array.isArray(alerts) ? alerts : [];
  const columns = [
    { key: 'kind', label: esc(t('ops_col_kind', 'Alert')) },
    { key: 'act', label: '', align: 'right', cls: 'act' },
  ];
  const rows = list.map(a => ({
    cursor: false, attrs: { 'data-alert': a.id },
    cells: {
      kind: `<span class="row-name">${esc(kindLabel(a.kind))}</span><span class="row-sub mono">${esc(when(a.created_at))}${a.ref ? `<br>${esc(a.ref)}` : ''}</span>`,
      act: buttonHtml({ label: t('ops_resolve', 'Resolve'), quiet: true, cls: 'ops-resolve', attrs: { 'data-resolve': a.id } }),
    },
  }));
  const body = list.length ? tableHtml({ columns, rows, cls: 'tbl-ops-alerts' }) : `<p class="panel-line">${esc(t('ops_alerts_none', 'No open alerts.'))}</p>`;
  return panelHtml({ heading: esc(t('ops_alerts', 'Billing alerts')), facts: esc(t('ops_alerts_facts', '{n} open', { n: list.length })), body, cls: 'ops-alerts' });
}

/** The stored weekly digests, newest first; Copy puts a week's text on the clipboard. Pure. */
export function digestsHtml(digests) {
  const list = Array.isArray(digests) ? digests : [];
  const columns = [
    { key: 'week', label: esc(t('ops_col_week', 'Week to')), cls: 'time' },
    { key: 'accounts', label: esc(t('ops_col_accounts', 'Accounts')), align: 'right' },
    { key: 'lessons', label: esc(t('ops_col_lessons', 'Completions')), align: 'right' },
    { key: 'errors', label: esc(t('ops_col_errors', 'Errors')), align: 'right' },
    { key: 'alerts', label: esc(t('ops_col_alerts', 'Alerts')), align: 'right' },
    { key: 'act', label: '', align: 'right', cls: 'act' },
  ];
  const rows = list.map((d, i) => {
    const r = d.report || {};
    return {
      cursor: false,
      cells: {
        week: esc(String(d.period_end || '').slice(0, 10)),
        accounts: String(num((r.signups || {}).accounts)), lessons: String(num((r.lessons || {}).first_completions)),
        errors: String(num((r.errors || {}).count)), alerts: String(num((r.billing || {}).alerts_new)),
        act: buttonHtml({ label: t('ops_copy', 'Copy text'), quiet: true, cls: 'ops-copy', attrs: { 'data-copy': i } }),
      },
    };
  });
  const body = list.length ? tableHtml({ columns, rows, cls: 'tbl-ops-digests' }) : `<p class="panel-line">${esc(t('ops_digests_none', 'No digest stored yet. The first is written on Monday morning.'))}</p>`;
  return panelHtml({ heading: esc(t('ops_digests', 'Weekly digests')), body, cls: 'ops-digests' });
}

/** The whole page for a loaded overview. Pure. */
export function opsHtml(data) {
  const d = data || {};
  return `${headerHtml()}<div class="pg-two"><div class="pg-main">${errorsHtml(d.errors)}${digestsHtml(d.digests)}</div><div class="pg-side">${weekHtml(d.now)}${alertsHtml(d.alerts)}</div></div>`;
}

function headerHtml() {
  return headerBlockHtml({ title: t('ops_title', 'Ops'), line: esc(t('ops_line', 'Errors, billing alerts and the weekly digest, for the people who run hotkey.gg.')), button: buttonHtml({ label: t('ops_refresh', 'Refresh'), key: 'R', id: 'opsRefresh' }), cls: 'ops-hdr' });
}

/** A page with one message instead of figures: unavailable, signed out, not a member, failed, loading. Pure. */
export function stateHtml(kind) {
  const lines = {
    unavailable: t('ops_unavailable', 'This page reads the live database, which isn’t connected here.'),
    out: t('ops_signed_out', 'Sign in to open this page.'),
    denied: t('ops_not_member', 'This page is for the people who run hotkey.gg.'),
    failed: t('ops_failed', 'The figures didn’t load. Try Refresh.'),
    loading: t('ops_loading', 'Loading the figures.'),
  };
  const action = kind === 'out' ? `<div class="btn-row">${buttonHtml({ label: t('rail_sign_in', 'Sign in'), key: 'Enter', href: '#/account', primary: true, id: 'opsSignIn' })}</div>` : '';
  return `${headerHtml()}${panelHtml({ body: `<p class="panel-line" role="status">${esc(lines[kind] || lines.failed)}</p>${action}`, cls: 'ops-state ops-' + kind })}`;
}

export function mountOpsPage(root) {
  const el = document.createElement('div');
  el.className = 'pg pg-ops';
  root.appendChild(el);
  let alive = true; let data = null;
  const paint = html => { if (alive) { el.innerHTML = html; wire(); } };

  async function load() {
    await auth.ready();
    if (!alive) return;
    const state = auth.state();
    if (state === 'unavailable') return paint(stateHtml('unavailable'));
    if (state !== 'in') return paint(stateHtml('out'));
    if (!data) paint(stateHtml('loading'));
    try {
      const { data: got, error } = await auth.client().rpc('rpc_ops_overview', { p_days: OPS_DAYS });
      if (!alive) return;
      if (error) return paint(stateHtml(error.code === '42501' ? 'denied' : 'failed'));
      data = got || {};
      paint(opsHtml(data));
    } catch (e) { paint(stateHtml('failed')); }
  }

  function wire() {
    const refresh = el.querySelector('#opsRefresh');
    if (refresh) refresh.onclick = () => load();
    for (const b of el.querySelectorAll('[data-resolve]')) {
      b.onclick = async () => {
        b.disabled = true;
        try {
          const { error } = await auth.client().rpc('rpc_ops_resolve_alert', { p_id: Number(b.dataset.resolve) });
          if (error) { b.disabled = false; return; }
          load();
        } catch (e) { b.disabled = false; }
      };
    }
    for (const b of el.querySelectorAll('[data-copy]')) {
      b.onclick = async () => {
        const d = data && data.digests && data.digests[Number(b.dataset.copy)];
        if (!d) return;
        try { await navigator.clipboard.writeText(renderDigest(d.report)); const s = b.querySelector('span'); if (s) s.textContent = t('ops_copied', 'Copied'); } catch (e) { /* no clipboard: nothing to say */ }
      };
    }
  }

  const onKey = e => {
    if (e.key !== 'r' && e.key !== 'R') return;
    if (e.ctrlKey || e.metaKey || e.altKey || (e.target && e.target.closest && e.target.closest('input, textarea, select'))) return;
    e.preventDefault(); load();
  };
  document.addEventListener('keydown', onKey);
  const offAuth = auth.onChange(() => { data = null; load(); });
  load();
  return { destroy() { alive = false; document.removeEventListener('keydown', onKey); offAuth(); el.remove(); } };
}
