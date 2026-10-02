// app2/ui/tool-cards.js — the cards of the Formulas and Data tools (engine/tools.js), drawn in the
// workbook-card idiom ribbon-view.js uses for Format Cells and Page Setup: Goal Seek, Data Table,
// Text to Columns, Edit Links, the Watch Window, PivotTable (Create and the field list), Insert
// Hyperlink, the Style dialog (New Cell Style), Sort, Remove Duplicates, Data Validation, Evaluate
// Formula, Error Checking, the AutoFilter menu, the validation drop-down and the cell's shortcut
// menu. Each card reads the draft (`session.dlg`) and nothing else; every control that has a key
// carries it as a click (dset:key:Alt+X), so a click and the key reach the same state.
//
// TOOL_CARDS: dialog name → { id, title(ss), cls, body(ss), foot(ss), pane? }. A pane (the Watch
// Window, the PivotTable field list) docks at the right edge of the sheet, as Excel's do.
import { RibbonView } from './ribbon-view.js';
import { dispText } from '../engine/format.js';
import { colLetter, parseRef } from '../engine/refs.js';
import { ALLOW, DV_DATA } from '../engine/tools.js';
import { PIVOT_FNS } from '../engine/pivot.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** A label with its accelerator underlined (the first occurrence of `k`, any case). */
export const ul = (label, k) => { if (!k) return esc(label); const i = label.toLowerCase().indexOf(k.toLowerCase()); return i < 0 ? esc(label) : esc(label.slice(0, i)) + '<u>' + esc(label[i]) + '</u>' + esc(label.slice(i + 1)); };
/** A card button: an accelerator key makes it clickable (the same key); no act draws it disabled, as Excel greys a button the engine does not carry. */
const btn = (label, k, act, extra = '') => act ? `<span class="pd-btn${extra}" data-act="${act}">${ul(label, k)}</span>` : `<span class="pd-btn dis" aria-disabled="true">${esc(label)}</span>`;
const altBtn = (label, k) => btn(label, k, 'dset:key:Alt+' + k.toUpperCase());
const F = (v, foc, act, cls) => RibbonView.field(v, foc, act, cls);
/** A field that opens selected (typing replaces it): Excel's look for a box reached by its key. */
const selField = (v, foc, fresh, act, cls) => fresh && foc && v !== '' ? `<span class="od-field foc${cls ? ' ' + cls : ''}"${act ? ` data-act="${act}"` : ''}><span class="od-seltext">${esc(v)}</span><i class="od-caret"></i></span>` : F(v, foc, act, cls);
const row = (label, k, field) => `<div class="gt-ref"><label>${ul(label, k)}</label>${field}</div>`;
const note = ss => ss.note ? `<div class="wb-err">${esc(ss.note)}</div>` : '';
const okCancel = (ok, extra) => RibbonView.okCancel(ok, extra);
const closeOnly = (label = 'Close') => '<span class="pd-spacer"></span><span class="pd-btn" data-act="cancel">' + esc(label) + ' <kbd>esc</kbd></span>';
const sheetName = ss => ((ss.sheets || []).find(e => e.sheet === ss.sheet) || {}).name || 'Sheet1';
const quoteSheet = n => /^[A-Za-z_][A-Za-z0-9_.]*$/.test(n) ? n : "'" + String(n).replace(/'/g, "''") + "'";
const list = (items, cls = '') => `<div class="od-list tc-list${cls ? ' ' + cls : ''}" role="listbox">${items.join('') || '<div class="cf-empty">(none)</div>'}</div>`;
const item = (on, act, html) => `<div class="od-item${on ? ' on' : ''}"${act ? ` data-act="${act}"` : ''} role="option" aria-selected="${!!on}">${html}</div>`;

/* ---------------- What-If Analysis ---------------- */
function goalSeekBody(ss) {
  const d = ss.dlg;
  if (d.status) {
    const v = x => typeof x === 'number' ? esc(dispText({ value: x, formula: null })) : esc(x);
    return `<div class="ds-msg"><span>${esc(d.status.note)}</span></div>` +
      `<div class="tc-grid2"><span class="od-lbl">Target value:</span><span class="tc-val">${v(d.status.target)}</span><span class="od-lbl">Current value:</span><span class="tc-val">${v(d.status.current)}</span></div>`;
  }
  return row('Set cell:', 'e', selField(d.set, d.focus === 'set', d.fresh, 'dset:key:Alt+E')) +
    row('To value:', 'v', selField(d.to, d.focus === 'to', d.fresh, 'dset:key:Alt+V')) +
    row('By changing cell:', 'c', selField(d.by, d.focus === 'by', d.fresh, 'dset:key:Alt+C')) + note(ss);
}
const goalSeekFoot = ss => ss.dlg && ss.dlg.status ? btn('Step', '', null) + btn('Pause', '', null) + okCancel('OK') : okCancel('OK');
function dataTableBody(ss) {
  const d = ss.dlg;
  return row('Row input cell:', 'r', F(d.row, d.focus === 'row', 'dset:key:Alt+R')) + row('Column input cell:', 'c', F(d.col, d.focus === 'col', 'dset:key:Alt+C')) + note(ss);
}

/* ---------------- Text to Columns ---------------- */
function textToColumnsBody(ss) {
  const d = ss.dlg, v = ss.textToColumnsView(); const R = RibbonView.radio, C = RibbonView.check;
  let html = `<div class="od-caplbl">Step ${v.step} of 3</div>`;
  if (d.confirm) return html + `<div class="ds-msg"><span class="ds-icon" aria-hidden="true">!</span><span>${esc(ss.note)}</span></div>`;
  if (v.step === 1) html += '<div class="od-sect">Original data type</div>' + R(d.mode === 'delimited', 'dset:key:Alt+D', ul('Delimited', 'd'), '', { foc: true }) + R(d.mode === 'fixed', 'dset:key:Alt+W', ul('Fixed width', 'w'), '', { foc: true });
  else if (v.step === 2 && d.mode === 'delimited') {
    html += '<div class="od-sect">Delimiters</div><div class="tc-cols2">' + C(d.tab, 'dset:key:Alt+T', ul('Tab', 't'), '', { foc: d.focus === 'tab' }) + C(d.semicolon, 'dset:key:Alt+M', ul('Semicolon', 'm'), '', { foc: d.focus === 'semicolon' }) +
      C(d.comma, 'dset:key:Alt+C', ul('Comma', 'c'), '', { foc: d.focus === 'comma' }) + C(d.space, 'dset:key:Alt+S', ul('Space', 's'), '', { foc: d.focus === 'space' }) +
      `<div class="od-row${d.focus === 'other' ? ' foc' : ''}" data-act="dset:key:Alt+O"><span class="od-box${d.otherOn ? ' on' : ''}"></span><span class="od-lbl">${ul('Other:', 'o')}</span>${F(d.other, d.focus === 'other', '')}</div>` +
      C(d.consecutive, 'dset:key:Alt+R', ul('Treat consecutive delimiters as one', 'r'), '', { foc: d.focus === 'consecutive' }) + '</div>';
  } else if (v.step === 2) html += '<div class="od-caplbl">The break lines sit where every row has a space; the preview shows the columns.</div>';
  else {
    const fmts = [['general', 'General', 'g'], ['text', 'Text', 't'], ['date', 'Date', 'd'], ['skip', 'Do not import column (skip)', 'i']];
    const cur = v.formats[v.col] || 'general';
    html += '<div class="od-sect">Column data format</div>' + fmts.map(([k, l, a]) => R(cur === k, 'dset:key:Alt+' + a.toUpperCase(), ul(l, a), '')).join('') +
      row('Destination:', 'e', selField(d.dest, d.focus === 'dest', d.fresh, 'dset:key:Alt+E'));
  }
  // the Data preview: the rows as Finish would split them; on step 3 the picked column is lit and each column's format heads it
  const show = v.rows.slice(0, 6);
  const head = v.step === 3 ? '<tr>' + Array.from({ length: v.columns }, (_, i) => `<th class="${i === v.col ? 'on' : ''}" data-act="dset:tpick:${i}">${esc({ general: 'General', text: 'Text', date: 'MDY', skip: 'Skip column' }[v.formats[i]])}</th>`).join('') + '</tr>' : '';
  const body = show.map(r => '<tr>' + Array.from({ length: v.columns }, (_, i) => `<td class="${v.step === 3 && i === v.col ? 'on' : ''}">${esc(r[i] === undefined ? '' : r[i])}</td>`).join('') + '</tr>').join('');
  return html + `<div class="od-sect">Data preview</div><div class="tc-preview"><table>${head}${body}</table></div>` + note(ss);
}
const textToColumnsFoot = ss => { const d = ss.dlg; if (d.confirm) return okCancel('OK'); return '<span class="pd-spacer"></span><span class="pd-btn" data-act="cancel">Cancel <kbd>esc</kbd></span>' + btn('< Back', 'b', d.step > 1 ? 'dset:key:Alt+B' : null) + btn('Next >', 'n', d.step < 3 ? 'dset:key:Alt+N' : null) + btn('Finish', 'f', 'dset:key:Alt+F', ' ok'); };

/* ---------------- Edit Links ---------------- */
function editLinksBody(ss) {
  const d = ss.dlg;
  if (d.confirm) return `<div class="ds-msg"><span class="ds-icon" aria-hidden="true">!</span><span>${esc(ss.note)}</span></div>`;
  const kept = f => { const vals = ss.externalValues || {}; return Object.keys(vals).some(k => k.startsWith('[' + f.toLowerCase() + ']')); };
  const head = '<div class="od-item tc-row tc-h tc-links"><span>Source</span><span>Type</span><span>Update</span><span>Status</span></div>';
  const rows = d.list.map((l, i) => item(i === d.idx, 'dset:tpick:' + i, `<span class="tc-links"><span>${esc(l.file)}</span><span>Worksheet</span><span>A</span><span>${kept(l.file) ? 'OK' : 'Unknown'}</span></span>`));
  const cur = d.list[d.idx];
  return list([head].concat(rows)) +
    (cur ? `<div class="od-caplbl">Location: ${esc(cur.cells.slice(0, 4).join(', '))}${cur.cells.length > 4 ? ', …' : ''}</div>` : '') +
    (d.rename !== null ? row('Change Source:', '', F(d.rename, true, '', 'wide')) : '') +
    `<div class="cf-btns">${btn('Update Values', 'u', null)}${altBtn('Change Source…', 'n')}${btn('Open Source', 'o', null)}${altBtn('Break Link', 'b')}${btn('Check Status', 'c', null)}</div>`;
}
const editLinksFoot = ss => ss.dlg && ss.dlg.confirm ? '<span class="pd-spacer"></span><span class="pd-btn" data-act="cancel">Cancel <kbd>esc</kbd></span><span class="pd-btn ok" data-act="enter">Break Links <kbd>↵</kbd></span>' : closeOnly();

/* ---------------- the Watch Window ---------------- */
function watchBody(ss) {
  const d = ss.dlg; const rows = ss.watchView();
  if (d.add !== null) return '<div class="od-caplbl">Select the cells that you would like to watch the value of:</div>' + `<div class="gt-ref">${selField(d.add, true, d.fresh, '', 'wide')}</div>` + note(ss);
  const head = '<div class="od-item tc-row tc-h tc-watch"><span>Book</span><span>Sheet</span><span>Name</span><span>Cell</span><span>Value</span><span>Formula</span></div>';
  const body = rows.map((w, i) => item(i === d.idx, 'dset:tpick:' + i, `<span class="tc-watch"><span>Book1</span><span>${esc(w.sheet)}</span><span>${esc(w.name)}</span><span>${esc(w.cell)}</span><span>${esc(w.value)}</span><span>${esc(w.formula)}</span></span>`));
  return `<div class="cf-btns">${altBtn('Add Watch…', 'a')}${altBtn('Delete Watch', 'd')}</div>` + list([head].concat(body), 'tc-wide');
}
const watchFoot = ss => ss.dlg && ss.dlg.add !== null ? '<span class="pd-spacer"></span><span class="pd-btn" data-act="cancel">Cancel <kbd>esc</kbd></span><span class="pd-btn ok" data-act="enter">Add <kbd>↵</kbd></span>' : closeOnly();

/* ---------------- PivotTable ---------------- */
function pivotBody(ss) {
  const d = ss.dlg; const R = RibbonView.radio;
  if (d.step === 'create') {
    return '<div class="od-sect">Choose the data that you want to analyze</div>' + row('Table/Range:', 't', selField(d.source, d.focus === 'source', d.fresh, 'dset:key:Alt+T', 'wide')) +
      '<div class="od-sect">Choose where you want the PivotTable to be placed</div>' +
      R(d.where === 'new', 'dset:key:Alt+N', ul('New Worksheet', 'n'), '') + R(d.where === 'existing', 'dset:key:Alt+E', ul('Existing Worksheet', 'e'), '') +
      row('Location:', 'l', d.where === 'existing' ? selField(d.loc, d.focus === 'loc', d.fresh, 'dset:key:Alt+L', 'wide') : F(d.loc, false, '', 'wide dis')) + note(ss);
  }
  const found = ss.findPivot(d.pivot); const sp = found ? found.pivot.spec : {};
  const used = f => [sp.row, sp.col, sp.value].includes(f);
  const fields = d.fields.map((f, i) => item(i === d.idx, 'dset:tpick:' + i, `<span class="od-box${used(f) ? ' on' : ''}"></span>${esc(f)}`));
  const fn = (PIVOT_FNS.find(x => x[0] === sp.fn) || PIVOT_FNS[0])[1];
  const area = (title, v) => `<div class="tc-area"><div class="od-caplbl">${title}</div><div class="tc-chip-row">${v ? `<span class="cf-chip">${esc(v)}</span>` : ''}</div></div>`;
  return '<div class="od-caplbl">Choose fields to add to report:</div>' + list(fields) +
    '<div class="od-caplbl">Drag fields between areas below:</div><div class="tc-areas">' + area('Filters', '') + area('Columns', sp.col) + area('Rows', sp.row) + area('Values', sp.value ? fn + ' of ' + sp.value : '') + '</div>' +
    `<div class="cf-btns">${btn('Rows', 'r', 'dset:key:R')}${btn('Columns', 'c', 'dset:key:C')}${btn('Values', 'v', 'dset:key:V')}${btn('Summarize Values By', 's', 'dset:key:S')}</div>`;
}
const pivotFoot = ss => ss.dlg && ss.dlg.step === 'create' ? okCancel('OK') : closeOnly();

/* ---------------- Insert Hyperlink ---------------- */
function hyperlinkBody(ss) {
  const d = ss.dlg;
  const side = `<div class="tc-linkto"><div class="od-caplbl">Link to:</div>` +
    `<div class="od-item${d.mode === 'url' ? ' on' : ''}" data-act="dset:key:Alt+X">${ul('Existing File or Web Page', 'x')}</div>` +
    `<div class="od-item${d.mode === 'place' ? ' on' : ''}" data-act="dset:key:Alt+A">${ul('Place in This Document', 'a')}</div>` +
    '<div class="od-item dim">Create New Document</div><div class="od-item dim">E-mail Address</div></div>';
  let main = row('Text to display:', 't', selField(d.text, d.focus === 'text', d.fresh, 'dset:key:Alt+T', 'wide'));
  if (d.mode === 'url') main += row('Address:', 'e', selField(d.url, d.focus === 'url', d.fresh, 'dset:key:Alt+E', 'wide'));
  else {
    const sheets = d.places.map((p, i) => [p, i]).filter(([p]) => p.kind === 'sheet'), names = d.places.map((p, i) => [p, i]).filter(([p]) => p.kind === 'name');
    const pl = ([p, i]) => item(i === d.place, 'dset:tpick:' + i, esc(p.name));
    main += row('Type the cell reference:', 'e', selField(d.ref, d.focus === 'ref', d.fresh, 'dset:key:Alt+E')) +
      `<div class="od-caplbl">${ul('Or select a place in this document:', 'c')}</div>` +
      list(['<div class="od-item tc-h">Cell Reference</div>'].concat(sheets.map(pl), names.length ? ['<div class="od-item tc-h">Defined Names</div>'] : [], names.map(pl)), d.focus === 'place' ? 'foc' : '');
  }
  return `<div class="tc-hyper">${side}<div class="tc-hmain">${main}</div></div>` + note(ss);
}
const hyperlinkFoot = ss => okCancel('OK', ss.dlg && ss.dlg.had ? altBtn('Remove Link', 'r') : '');

/* ---------------- the Style dialog (New Cell Style) ---------------- */
const STYLE_ROWS = [['number', 'Number', 'n'], ['alignment', 'Alignment', 'l'], ['font', 'Font', 'f'], ['border', 'Border', 'b'], ['fill', 'Fill', 'i'], ['protection', 'Protection', 'r']];
/** What each Style Includes row says about the example cell (Excel prints the format beside the tick). */
function styleDesc(cell, part) {
  switch (part) {
    case 'number': return cell.numFmt || ({ general: 'General', comma: '#,##0.00', currency: '$#,##0.00', acct: 'Accounting', percent: '0%' }[cell.fmtStyle] || 'General');
    case 'alignment': return ({ l: 'Left', c: 'Center', r: 'Right' }[cell.align] || 'General') + ', Bottom Aligned';
    case 'font': return 'Calibri 11' + (cell.bold ? ', Bold' : '') + (cell.it ? ', Italic' : '');
    case 'border': return cell.bt || cell.bb || cell.bl || cell.br || cell.ball ? 'Borders' : 'No Borders';
    case 'fill': return cell.fill ? 'Shaded' : 'No Shading';
    default: return 'Locked';
  }
}
function newStyleBody(ss) {
  const d = ss.dlg; const a = ss.sheet.dispActive(); const cell = ss.sheet.get(a.r, a.c);
  return row('Style name:', 's', selField(d.name, d.focus === 'name', d.fresh, 'dset:key:Alt+S', 'wide')) +
    `<div class="cf-btns">${btn('Format…', 'o', null)}</div><div class="od-sect">Style Includes (By Example)</div>` +
    STYLE_ROWS.map(([k, l, a2]) => `<div class="od-row${d.focus === k ? ' foc' : ''}" data-act="dset:key:Alt+${a2.toUpperCase()}"><span class="od-box${d.includes[k] ? ' on' : ''}"></span><span class="od-lbl tc-w">${ul(l, a2)}</span><span class="od-unit">${esc(styleDesc(cell, k))}</span></div>`).join('');
}

/* ---------------- Sort, Remove Duplicates ---------------- */
function sortBody(ss) {
  const v = ss.sortDialogView(); if (!v) return '';
  const head = '<div class="od-item tc-row tc-h tc-sort"><span></span><span>Column</span><span>Sort On</span><span>Order</span></div>';
  const rows = v.levels.map((l, i) => item(i === v.cur, 'dset:tpick:' + i, `<span class="tc-sort"><span>${i === 0 ? 'Sort by' : 'Then by'}</span><span class="od-combo${i === v.cur && v.focus === 'col' ? ' tc-foc' : ''}">${esc(l.label)}</span><span class="od-combo">Cell Values</span><span class="od-combo${i === v.cur && v.focus === 'order' ? ' tc-foc' : ''}">${esc(l.order)}</span></span>`));
  return `<div class="cf-btns">${altBtn('Add Level', 'a')}${altBtn('Delete Level', 'd')}${btn('Copy Level', 'c', null)}${btn('Options…', 'o', null)}` +
    `<span class="pd-spacer"></span>${RibbonView.check(v.headers, 'dset:key:Alt+H', ul('My data has headers', 'h'), '', { foc: v.focus === 'headers' })}</div>` + list([head].concat(rows), 'tc-wide');
}
function removeDupBody(ss) {
  const v = ss.removeDuplicatesView(); if (!v) return '';
  return '<div class="od-caplbl">To delete duplicate values, select one or more columns that contain duplicates.</div>' +
    `<div class="cf-btns">${altBtn('Select All', 'a')}${altBtn('Unselect All', 'u')}<span class="pd-spacer"></span>${RibbonView.check(v.headers, 'dset:key:Alt+M', ul('My data has headers', 'm'), '')}</div>` +
    `<div class="od-caplbl">Columns</div>` + list(v.columns.map((c, i) => item(i === v.idx, 'dset:tpick:' + i, `<span class="od-box${c.checked ? ' on' : ''}"></span>${esc(c.label)}`)));
}

/* ---------------- Data Validation ---------------- */
function validationBody(ss) {
  const d = ss.dlg; const C = RibbonView.check;
  const tabs = RibbonView.tabRow([{ k: 'settings', html: 'Settings' }, { k: 'input', html: 'Input Message' }, { k: 'error', html: 'Error Alert' }], d.tab, false);
  const combo = (listx, val, foc, act) => `<span class="od-combo${foc ? ' tc-foc' : ''}" data-act="${act}">${esc((listx.find(x => x[0] === val) || listx[0])[1])}</span>`;
  let body = '';
  if (d.tab === 'settings') {
    body = '<div class="od-sect">Validation criteria</div>' + row('Allow:', 'a', combo(ALLOW, d.allow, d.focus === 'allow', 'dset:key:Alt+A')) +
      C(d.ignoreBlank, d.allow === 'any' ? '' : 'dset:key:Alt+B', ul('Ignore blank', 'b'), '', { foc: d.focus === 'ignoreBlank' });
    if (d.allow === 'list') body += row('Source:', 's', F(d.source, d.focus === 'source', 'dset:key:Alt+S', 'wide')) + C(d.inCell, 'dset:key:Alt+I', ul('In-cell dropdown', 'i'), '', { foc: d.focus === 'inCell' });
    else if (d.allow === 'custom') body += row('Formula:', 'f', F(d.source, d.focus === 'source', 'dset:key:Alt+S', 'wide'));
    else if (d.allow !== 'any') {
      body += row('Data:', 'd', combo(DV_DATA, d.data, d.focus === 'data', 'dset:key:Alt+D'));
      const two = d.data === 'between' || d.data === 'notBetween';
      body += row(two ? 'Minimum:' : 'Value:', 'm', F(d.min, d.focus === 'min', 'dset:key:Alt+M', 'wide')) + (two ? row('Maximum:', 'x', F(d.max, d.focus === 'max', 'dset:key:Alt+X', 'wide')) : '');
    }
  } else if (d.tab === 'input') {
    body = '<div class="od-caplbl">When cell is selected, show this input message:</div>' + row('Title:', 't', F(d.inTitle, d.focus === 'inTitle', 'dset:key:Alt+T', 'wide')) + row('Input message:', 'i', F(d.inMsg, d.focus === 'inMsg', 'dset:key:Alt+I', 'wide'));
  } else {
    body = '<div class="od-caplbl">When user enters invalid data, show this error alert:</div>' + row('Style:', 'y', combo([['stop', 'Stop'], ['warning', 'Warning'], ['information', 'Information']], d.errStyle, d.focus === 'errStyle', 'dset:key:Alt+Y')) +
      row('Title:', 't', F(d.errTitle, d.focus === 'errTitle', 'dset:key:Alt+T', 'wide')) + row('Error message:', 'e', F(d.errMsg, d.focus === 'errMsg', 'dset:key:Alt+E', 'wide'));
  }
  return tabs + body + note(ss);
}
const validationFoot = () => okCancel('OK', altBtn('Clear All', 'c'));

/* ---------------- Evaluate Formula, Error Checking ---------------- */
function evaluateBody(ss) {
  const d = ss.dlg; const v = ss.evaluateView(); const p = parseRef(d.cell);
  return `<div class="tc-grid2"><span class="od-lbl">Reference:</span><span class="od-lbl">Evaluation:</span><span class="tc-val">${esc(quoteSheet(sheetName(ss)) + '!$' + colLetter(p.c) + '$' + p.r)}</span>` +
    `<span class="tc-eval">${esc(v.before)}${v.under ? '<u>' + esc(v.under) + '</u>' : ''}${esc(v.after)}</span></div>` +
    `<div class="od-caplbl">${d.done ? 'The cell currently being evaluated contains a constant.' : 'To show the result of the underlined expression, click Evaluate. The most recent result appears italicized.'}</div>`;
}
const evaluateFoot = ss => { const d = ss.dlg; return (d && d.done ? altBtn('Restart', 'r') : altBtn('Evaluate', 'e')) + btn('Step In', 'i', null) + btn('Step Out', 'o', null) + closeOnly(); };
function errorCheckBody(ss) {
  const d = ss.dlg;
  if (d.done) return `<div class="ds-msg"><span>${esc(d.note)}</span></div>`;
  const p = parseRef(d.cell);
  const what = { '#DIV/0!': 'Divide by Zero Error', '#N/A': 'Value Not Available Error', '#NAME?': 'Invalid Name Error', '#REF!': 'Invalid Cell Reference Error', '#VALUE!': 'Error in Value', '#NUM!': 'Invalid Number Error', '#NULL!': 'Null Error' }[d.error] || 'Error';
  return `<div class="tc-errcheck"><div><div class="od-caplbl">Error in cell ${esc(colLetter(p.c) + p.r)}</div><div class="tc-val">${esc(d.formula)}</div><div class="od-sect">${esc(what)}</div></div>` +
    `<div class="tc-errbtns">${btn('Help on this Error', '', null)}${btn('Show Calculation Steps…', '', null)}${altBtn('Ignore Error', 'i')}${altBtn('Edit in Formula Bar', 'f')}</div></div>`;
}
const errorCheckFoot = ss => ss.dlg && ss.dlg.done ? '<span class="pd-spacer"></span><span class="pd-btn ok" data-act="enter">OK <kbd>↵</kbd></span>' : btn('Options…', 'o', null) + '<span class="pd-spacer"></span>' + altBtn('Previous', 'p') + altBtn('Next', 'n');

/* ---------------- the AutoFilter menu, the validation drop-down, the shortcut menu ---------------- */
const AF_NUM = [['E', 'Equals…'], ['N', 'Does Not Equal…'], ['G', 'Greater Than…'], ['O', 'Greater Than Or Equal To…'], ['L', 'Less Than…'], ['Q', 'Less Than Or Equal To…'], ['W', 'Between…'], ['T', 'Top 10…'], ['A', 'Above Average'], ['B', 'Below Average'], ['F', 'Custom Filter…']];
const AF_TEXT = [['E', 'Equals…'], ['N', 'Does Not Equal…'], ['I', 'Begins With…'], ['T', 'Ends With…'], ['A', 'Contains…'], ['D', 'Does Not Contain…'], ['F', 'Custom Filter…']];
const AF_OP_LABEL = { eq: 'equals', ne: 'does not equal', gt: 'is greater than', ge: 'is greater than or equal to', lt: 'is less than', le: 'is less than or equal to', begins: 'begins with', ends: 'ends with', contains: 'contains', ncontains: 'does not contain' };
const menuItem = (k, label, act, on) => `<div class="rdrop-item${on ? ' on' : ''}" data-act="${act}"><span class="ri-key">${esc(k)}</span><span class="rdrop-lbl">${esc(label)}</span></div>`;
function autoFilterBody(ss) {
  const d = ss.dlg;
  if (d.custom) {
    const c = d.custom; const R = RibbonView.radio;
    return `<div class="od-caplbl">Show rows where: <b>${esc(d.header)}</b></div>` +
      `<div class="gt-ref"><span class="od-combo">${esc(AF_OP_LABEL[c.op1] || '')}</span>${F(c.v1, c.focus === 'v1', '', 'wide')}</div>` +
      `<div class="tc-andor">${R(c.and, 'dset:key:Alt+A', ul('And', 'a'), '', { foc: c.focus === 'and' })}${R(!c.and, 'dset:key:Alt+O', ul('Or', 'o'), '', { foc: c.focus === 'and' })}</div>` +
      `<div class="gt-ref"><span class="od-combo">${esc(AF_OP_LABEL[c.op2] || '')}</span>${F(c.v2, c.focus === 'v2', '', 'wide')}</div>`;
  }
  if (d.menu === 'filters') return (d.numeric ? AF_NUM : AF_TEXT).map(([k, l]) => menuItem(k, l, 'dset:key:' + k)).join('');
  const what = d.numeric ? 'Number' : 'Text';
  return menuItem('S', d.numeric ? 'Sort Smallest to Largest' : 'Sort A to Z', 'dset:key:S') + menuItem('O', d.numeric ? 'Sort Largest to Smallest' : 'Sort Z to A', 'dset:key:O') +
    menuItem('C', `Clear Filter From "${d.header}"`, 'dset:key:C') + menuItem('F', what + ' Filters ›', 'dset:key:F') + menuItem('E', 'Search', 'dset:key:E') +
    `<div class="gt-ref">${F(d.search, d.focus === 'search', 'dset:key:E', 'wide')}</div>` +
    list([item(d.idx === 0, 'dset:tpick:0', `<span class="od-box${d.all ? ' on' : ''}"></span>(Select All)`)].concat(d.items.map((it, i) => item(d.idx === i + 1, 'dset:tpick:' + (i + 1), `<span class="od-box${it.checked ? ' on' : ''}"></span>${esc(it.text)}`))), d.focus === 'list' ? 'foc' : '');
}
const dvListBody = ss => list(ss.dlg.items.map((it, i) => item(i === ss.dlg.idx, 'dset:tpick:' + i, esc(it))), 'foc tc-dv');
function contextMenuBody(ss) {
  const S = ss.sheet; const a = S.dispActive(); const has = !!ss.linkOf(a.r, a.c);
  return (has ? menuItem('O', 'Open Hyperlink', 'dset:key:O') : '') + menuItem('H', has ? 'Edit Hyperlink…' : 'Link', 'dset:key:H') + (S.get(a.r, a.c).link ? menuItem('R', 'Remove Hyperlink', 'dset:key:R') : '');
}

/* ---------------- Name Manager and Paste Name ---------------- */
function nameManagerBody(ss) {
  const d = ss.dlg;
  const rows = ss.nameManagerRows();
  if (d.confirm) return `<div class="ds-msg"><span class="ds-icon" aria-hidden="true">!</span><span>Are you sure you want to delete the name ${esc((rows[d.idx] || {}).name)}?</span></div>`;
  if (d.edit) {
    const e = d.edit;
    return row('Name:', 'n', selField(e.name, e.focus === 'name', e.fresh, 'dset:key:Alt+N')) +
      `<div class="gt-ref"><label>Scope:</label><span class="od-combo">Workbook</span></div>` +
      row('Refers to:', 'r', selField(e.refersTo, e.focus === 'refersTo', e.fresh, 'dset:key:Alt+R', 'wide')) + note(ss);
  }
  return `<div class="tc-grid4 od-caplbl"><span>Name</span><span>Value</span><span>Refers To</span><span>Scope</span></div>` +
    list(rows.map((n, i) => item(i === d.idx, 'dset:tpick:' + i, `<span class="tc-grid4"><span>${esc(n.name)}</span><span>${esc(n.value)}</span><span>${esc(n.refersTo)}</span><span>${esc(n.scope)}</span></span>`)), 'foc');
}
const nameManagerFoot = ss => {
  const d = ss.dlg;
  if (d && (d.confirm || d.edit)) return okCancel('OK');
  return altBtn('New…', 'n') + altBtn('Edit…', 'e') + altBtn('Delete', 'd') + closeOnly('Close');
};
const pasteNamesBody = ss => '<div class="od-caplbl">Paste name</div>' + list(ss.definedNames().map((n, i) => item(i === ss.dlg.idx, 'dset:tpick:' + i, esc(n.name))), 'foc');
const pasteNamesFoot = () => altBtn('Paste List', 'l') + okCancel('OK');

/* ---------------- the table ---------------- */
const fixedTitle = t => () => t;
export const TOOL_CARDS = {
  goalseek: { id: 'goalSeekDialog', title: ss => ss.dlg && ss.dlg.status ? 'Goal Seek Status' : 'Goal Seek', cls: 'pd-mid', body: goalSeekBody, foot: goalSeekFoot },
  datatable: { id: 'dataTableDialog', title: fixedTitle('Data Table'), cls: 'pd-mid', body: dataTableBody, foot: () => okCancel('OK') },
  texttocols: { id: 'textToColumnsDialog', title: ss => ss.dlg && ss.dlg.confirm ? 'Microsoft Excel' : 'Convert Text to Columns Wizard', cls: 'pd-wide', body: textToColumnsBody, foot: textToColumnsFoot },
  editlinks: { id: 'editLinksDialog', title: ss => ss.dlg && ss.dlg.confirm ? 'Microsoft Excel' : 'Edit Links', cls: 'pd-wide', body: editLinksBody, foot: editLinksFoot },
  watch: { id: 'watchWindow', title: ss => ss.dlg && ss.dlg.add !== null ? 'Add Watch' : 'Watch Window', cls: 'pd-wide', body: watchBody, foot: watchFoot, pane: true },
  pivot: { id: 'pivotDialog', title: ss => ss.dlg && ss.dlg.step === 'create' ? 'Create PivotTable' : 'PivotTable Fields', cls: 'pd-mid', body: pivotBody, foot: pivotFoot, pane: ss => !!(ss.dlg && ss.dlg.step !== 'create') },
  hyperlink: { id: 'hyperlinkDialog', title: ss => ss.dlg && ss.dlg.had ? 'Edit Hyperlink' : 'Insert Hyperlink', cls: 'pd-wide', body: hyperlinkBody, foot: hyperlinkFoot },
  newstyle: { id: 'styleDialog', title: fixedTitle('Style'), cls: 'pd-mid', body: newStyleBody, foot: () => okCancel('OK') },
  sortdlg: { id: 'sortDialog', title: fixedTitle('Sort'), cls: 'pd-wide', body: sortBody, foot: () => okCancel('OK') },
  removedup: { id: 'removeDupDialog', title: fixedTitle('Remove Duplicates'), cls: 'pd-mid', body: removeDupBody, foot: () => okCancel('OK') },
  validation: { id: 'validationDialog', title: fixedTitle('Data Validation'), cls: 'pd-mid', body: validationBody, foot: validationFoot },
  evalfx: { id: 'evaluateDialog', title: fixedTitle('Evaluate Formula'), cls: 'pd-wide', body: evaluateBody, foot: evaluateFoot },
  errcheck: { id: 'errorCheckDialog', title: ss => ss.dlg && ss.dlg.done ? 'Microsoft Excel' : 'Error Checking', cls: 'pd-mid', body: errorCheckBody, foot: errorCheckFoot },
  autofilter: { id: 'autoFilterMenu', title: ss => ss.dlg && ss.dlg.custom ? 'Custom AutoFilter' : 'Filter: ' + ((ss.dlg && ss.dlg.header) || ''), cls: 'pd-narrow', body: autoFilterBody, foot: ss => ss.dlg && ss.dlg.custom ? okCancel('OK') : okCancel('OK') },
  dvlist: { id: 'dvListMenu', title: fixedTitle('List'), cls: 'pd-narrow', body: dvListBody, foot: () => closeOnly('Close') },
  ctxmenu: { id: 'contextMenu', title: fixedTitle('Cell'), cls: 'pd-narrow', body: contextMenuBody, foot: () => closeOnly('Close') },
  namemgr: { id: 'nameManagerDialog', title: ss => ss.dlg && ss.dlg.confirm ? 'Microsoft Excel' : ss.dlg && ss.dlg.edit ? 'Edit Name' : 'Name Manager', cls: 'pd-wide', body: nameManagerBody, foot: nameManagerFoot },
  pastenames: { id: 'pasteNameDialog', title: fixedTitle('Paste Name'), cls: 'pd-mid', body: pasteNamesBody, foot: pasteNamesFoot },
};

/** The card for the open tool dialog as { title, body, foot, pane } (pure: the ribbon view paints it, the tests read it), or null. */
export function toolCard(ss) {
  const spec = TOOL_CARDS[ss.dialog]; if (!spec || !ss.dlg) return null;
  return { id: spec.id, cls: spec.cls, title: spec.title(ss), body: spec.body(ss), foot: spec.foot(ss), pane: typeof spec.pane === 'function' ? spec.pane(ss) : !!spec.pane };
}
