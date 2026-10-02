// app2/ui/components/table.js — the panel and the table (screenplay 3.0, rules 3 and 4): a white
// panel on the paper ground with no border, a heading with its facts at the right of the same
// line, and a table with a rule above the header, hairlines between rows, labels left and
// figures right in tabular numerals. One component; Home's chapter table, Learn, the drill
// catalog, the boards and the side panels all render from data through it.
//
//   panelHtml({ heading, facts, body, mode, cls, id, stretch })
//   tableHtml({ columns: [{ key, label, align: 'left'|'right'|'center', cls }], rows: [{ cells: { key: html }, href, cls, attrs, cursor, enter }], head, sheet })
//     sheet: true draws it as a worksheet: the column letters on the chrome strip, a row number down the
//     left, the labels as row 1 typed in bold, gridlines; the selected row lights its number, as Excel does
//   tabsHtml(tabs: [{ key, label, mode, on }], label)   the page tabs
//   wireTabs(el, onPick)                                 arrows and Home/End move across them
//   buttonHtml({ label, key, href, primary, quiet, id, mode, attrs })
//   headerBlockHtml({ title, line, control, button, facts })   the Practice pages' header block
//   wireRows(el)                                         a click on a row with data-href follows it
import { esc } from './format.js';
import { keycapHtml, modeMarkHtml } from './marks.js';

const attrsOf = a => (a ? Object.entries(a).map(([k, v]) => (v === true ? ` ${k}` : v == null || v === false ? '' : ` ${k}="${esc(v)}"`)).join('') : '');

export function panelHtml({ heading = '', facts = '', body = '', mode = '', cls = '', id = '', stretch = false, attrs = null, headAttrs = null } = {}) {
  const head = heading || facts ? `<div class="panel-head"${attrsOf(headAttrs)}><h2 class="panel-h">${heading}</h2>${facts ? `<span class="panel-facts">${facts}</span>` : ''}</div>` : '';
  return `<section class="panel${mode ? ' panel-mode' : ''}${stretch ? ' panel-stretch' : ''} ${esc(cls)}"${mode ? ` style="--mode:var(--${esc(mode)})"` : ''}${id ? ` id="${esc(id)}"` : ''}${attrsOf(attrs)}>${head}${body}</section>`;
}

export const colLetter = i => { let s = ''; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };

export function tableHtml({ columns = [], rows = [], head = true, cls = '', label = '', sheet = false, fill = 0 } = {}) {
  const col = c => `${c.align === 'right' ? ' class="num"' : c.align === 'center' ? ' class="mid"' : ''}`;
  if (sheet) {
    const letters = `<thead><tr class="sh-letters"><th class="sh-corner" aria-hidden="true"></th>${columns.map((c, i) => `<th class="sh-col${c.align === 'right' ? ' num' : ''}"${c.cls ? ` data-col="${esc(c.cls)}"` : ''} aria-hidden="true">${colLetter(i)}</th>`).join('')}</tr></thead>`;
    const labels = head ? `<tr class="sh-labels"><td class="sh-row" aria-hidden="true">1</td>${columns.map(c => `<td${col(c)}${c.cls ? ` data-col="${esc(c.cls)}"` : ''}>${c.label || ''}</td>`).join('')}</tr>` : '';
    const first = head ? 2 : 1;
    const body = rows.map((r, k) => {
      const tds = columns.map(c => `<td${col(c)}${c.cls ? ` data-col="${esc(c.cls)}"` : ''}>${r.cells && r.cells[c.key] != null ? r.cells[c.key] : ''}</td>`).join('');
      const a = { ...(r.attrs || {}) };
      if (r.href) a['data-href'] = r.href;
      if (r.cursor !== false) { a['data-cursor'] = true; a.tabindex = '-1'; }
      if (r.enter) a['data-cursor-enter'] = r.enter;
      return `<tr class="${esc(r.cls || '')}"${attrsOf(a)}><td class="sh-row" aria-hidden="true">${k + first}</td>${tds}</tr>`;
    }).join('');
    // fill: blank gridded rows to that many, so a short board still reads as a sheet waiting for its rows
    const blanks = Array.from({ length: Math.max(0, fill - rows.length) }, (_, k) => `<tr class="sh-blank" aria-hidden="true"><td class="sh-row">${rows.length + k + first}</td>${columns.map(() => '<td></td>').join('')}</tr>`).join('');
    return `<table class="tbl tbl-sheet ${esc(cls)}"${label ? ` aria-label="${esc(label)}"` : ''}>${letters}<tbody>${labels}${body}${blanks}</tbody></table>`;
  }
  const thead = head && columns.some(c => c.label) ? `<thead><tr>${columns.map(c => `<th${col(c)}${c.cls ? ` data-col="${esc(c.cls)}"` : ''}>${c.label || ''}</th>`).join('')}</tr></thead>` : '';
  const body = rows.map(r => {
    const tds = columns.map(c => `<td${col(c)}${c.cls ? ` data-col="${esc(c.cls)}"` : ''}>${r.cells && r.cells[c.key] != null ? r.cells[c.key] : ''}</td>`).join('');
    const a = { ...(r.attrs || {}) };
    if (r.href) a['data-href'] = r.href;
    if (r.cursor !== false) { a['data-cursor'] = true; a.tabindex = '-1'; }
    if (r.enter) a['data-cursor-enter'] = r.enter;
    return `<tr class="${esc(r.cls || '')}"${attrsOf(a)}>${tds}</tr>`;
  }).join('');
  return `<table class="tbl ${esc(cls)}"${label ? ` aria-label="${esc(label)}"` : ''}>${thead}<tbody>${body}</tbody></table>`;
}

export function tabsHtml(tabs, label = '') {
  return `<div class="tabs" role="tablist"${label ? ` aria-label="${esc(label)}"` : ''}>${tabs.map(t =>
    `<button type="button" role="tab" class="tab${t.on ? ' on' : ''}" aria-selected="${t.on ? 'true' : 'false'}" tabindex="${t.on ? 0 : -1}" data-tab="${esc(t.key)}" data-keytip-label="${esc(t.label)}">${t.mode ? modeMarkHtml(t.mode) : ''}<span>${esc(t.label)}</span></button>`).join('')}</div>`;
}

export function wireTabs(el, onPick) {
  const tabs = [...el.querySelectorAll('.tab')];
  tabs.forEach((t, i) => {
    t.onclick = () => onPick(t.dataset.tab);
    t.onkeydown = e => {
      let to = -1;
      if (e.key === 'ArrowRight') to = (i + 1) % tabs.length; else if (e.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = tabs.length - 1;
      if (to < 0) return;
      e.preventDefault(); e.stopPropagation(); onPick(tabs[to].dataset.tab, true);
    };
  });
  return tabs;
}

export function buttonHtml({ label, key = '', href = '', primary = false, quiet = false, id = '', attrs = null, cls = '' } = {}) {
  const inner = `<span>${esc(label)}</span>${key ? keycapHtml(key) : ''}`;
  const c = `btn2${primary ? ' btn2-primary' : quiet ? ' btn2-quiet' : ''} ${esc(cls)}`;
  if (href) return `<a class="${c}" href="${esc(href)}"${id ? ` id="${esc(id)}"` : ''}${attrsOf(attrs)}>${inner}</a>`;
  // a form's submit button passes attrs.type = 'submit'; every other button is type="button"
  const { type = 'button', ...rest } = attrs || {};
  return `<button type="${type === 'submit' ? 'submit' : 'button'}" class="${c}"${id ? ` id="${esc(id)}"` : ''}${attrsOf(rest)}>${inner}</button>`;
}

/** The header block of a Practice page: the title, one line, a control at the right and the primary button. */
export function headerBlockHtml({ title, line = '', control = '', button = '', facts = '', cls = '' } = {}) {
  // the block is the page's selected item when it opens: the cursor sits on it and Enter presses its primary button
  return `<section class="panel hdr ${esc(cls)}" data-cursor data-cursor-enter=".btn2-primary" tabindex="-1" aria-label="${esc(title)}"><div class="hdr-main"><div class="hdr-row"><h1 class="hdr-title">${esc(title)}</h1>${facts ? `<span class="panel-facts">${facts}</span>` : ''}</div>${line ? `<div class="hdr-fx"><i class="hdr-fx-mark" aria-hidden="true">fx</i><p class="hdr-line">${line}</p></div>` : ''}</div><div class="hdr-acts">${control}${button}</div></section>`;
}

/** A click anywhere on a row that carries data-href follows it (a link inside the row keeps its own). */
export function wireRows(el) {
  const onClick = e => {
    if (e.target.closest('a, button, input, select')) return;
    const row = e.target.closest('[data-href]'); if (!row || !el.contains(row)) return;
    location.hash = row.dataset.href;
  };
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
}
