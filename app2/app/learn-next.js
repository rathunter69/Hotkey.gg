// app2/app/learn-next.js — Learn as the Project Volt data room (experience pass, decision 8):
// a VDR-style index. Chapters are folders (1. Foundations …), modules are numbered documents
// (1.0, 1.1 …) with an objective, a status, the lessons as steps, the challenge with your tier,
// and the pack page each produces (it fills in when the challenge passes; the challenge replays
// with a new seed from the card). Locked chapters show one-line teasers with a "paid" tag. The
// "where we are in the deal" strip sits at the top. The old path / list toggle is gone; the
// legacy lessons wait in an Archive folder until the rewrite replaces them.
import { CHAPTERS, LESSONS, lessonNumber, sectionsOf, modulesOf } from '../content/index.js';
import { store } from './store.js';
import { auth } from './auth.js';
import { prefs } from './prefs.js';
import { statusOf, moduleStatus, pathModel, CHAPTER_PLAN } from './learn-page.js';
import { STAGES, dealStripHtml } from './deal-strip.js';
import { workbookState, WORKBOOKS } from '../content/workbooks/index.js';
import { ring } from '../ui/ring.js';
import { moduleCopy, siteCopy } from '../content/copy/apply.js';
import { moduleNumber, itemNumber, isFinalItem, FINAL_MODULE } from './numbering.js';
import { entitlement } from './entitlement.js';
import { PAID_LINE } from './lock-page.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TIER_MARK = { legendary: '◆◆◆', pro: '◆◆', pass: '◆' };

/** The Chapter 1 modules as the map plans them, for the ones not yet authored (the content session is writing 1.3–1.7). */
const PLANNED_DEFAULT = [
  { n: '1.1', title: 'Open and set up', objective: 'Tidy the file as it arrived: tabs, gridlines, Excel Options, the QAT, the color-and-label conventions.' },
  { n: '1.2', title: 'Move and select', objective: 'Jumps, never scrolls: Ctrl+Arrow, the selection set, Go To, Go To Special.' },
  { n: '1.3', title: 'Enter, edit, copy and fill', objective: 'The missing day, the typos, the Report skeleton, Paste Special, Find and Replace, a timeline.' },
  { n: '1.4', title: 'Structure', objective: 'Rows and columns that keep the totals honest; widths, heights, AutoFit; hide, group, freeze.' },
  { n: '1.5', title: 'Format', objective: 'Numbers a banker can read; fonts, fills, borders; alignment and titles; the style pass.' },
  { n: '1.6', title: 'Formulas', objective: 'SUM and its family, relative and absolute references, links across sheets, the errors and what they mean.' },
  { n: '1.7', title: 'Present and audit', objective: 'The KPI page checked, print-ready and signed off: page one of the pack.' },
];
const PLANNED_IDS = { '1.1': 'open-and-set-up', '1.2': 'move-and-select', '1.3': 'enter-edit-copy-fill', '1.4': 'structure', '1.5': 'format', '1.6': 'formulas', '1.7': 'present-and-audit' };
/** The seven planned modules; modules.csv (name, objective) overrides the built-in lines by module id. */
export const PLANNED_MODULES = PLANNED_DEFAULT.map(p => { const row = moduleCopy(PLANNED_IDS[p.n]); return row ? { ...p, title: (row.name || '').trim() || p.title, objective: (row.objective || '').trim() || p.objective } : p; });

/** A step's state in words at the row's end: done, in progress, next (a lone glyph read as clipped text). */
const stepMark = (st, isNext) => st === 'done' || st === 'mastered' ? '✓' : st === 'started' ? 'in progress' : isNext ? 'next' : '';
/** A challenge's name in a list whose flag already says "challenge": 'Challenge: find and mark' → 'Find and mark'. */
const challengeName = t => { const x = String(t || '').replace(/^Challenge:\s*/i, ''); return x.charAt(0).toUpperCase() + x.slice(1); };
/** What a module's finished page is called (modules.csv page_name), else the module's title. */
const pageName = m => { const row = moduleCopy(m.id); return (row && row.page_name && row.page_name.trim()) || m.title; };
/** The document number for a module: the curriculum map's (app/numbering.js), else its place among the built modules. */
const docNo = (chapterN, k, id) => moduleNumber(id, k + 1) || `${chapterN}.${k + 1}`;

/**
 * The pack-page thumbnail for a module: the sheet its lessons changed most, rendered as a small
 * table from the last lesson's `after` state. Falls back to the first sheet. `delivered`: the
 * module's challenge has passed, so the page shows filled and stamped. Pure HTML.
 */
export function pageThumbHtml(module, delivered = false) {
  try {
    // the page is the one the module builds: its project's when it has one (1.8), else its last lesson's
    const building = module.lessons.filter(l => l.kind !== 'testout' && l.kind !== 'assessment');
    const last = building.find(l => l.kind === 'project') || building[building.length - 1];
    const first = building[0];
    if (!last || !last.workbook || !last.state) return '';
    const wb = WORKBOOKS[last.workbook];
    const after = workbookState(last.workbook, last.state.after);
    // not delivered yet: the same sheet as it stood when the module began, so passing visibly fills the page
    const shown = !delivered && first && first.state ? workbookState(last.workbook, first.state.before) : after;
    // the sheet the module worked on: the one with the most cell changes since the module began;
    // failing that (a module that only added or renamed sheets), the first sheet with anything on it
    const filled = after.sheets.filter(s => Object.keys(s.cells || {}).length);
    let sheet = filled[0] || after.sheets[0];
    if (first && first.state && wb && typeof wb.diffStates === 'function') {
      const before = workbookState(last.workbook, first.state.before);
      const counts = {};
      for (const d of wb.diffStates(before, after)) if (d.kind === 'cell' || d.kind === 'gridlines') counts[d.sheet] = (counts[d.sheet] || 0) + 1;
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      if (top) sheet = after.sheets.find(s => s.name === top) || sheet;
      else { const added = after.sheets.filter(s => !before.sheets.some(b => b.name === s.name) && Object.keys(s.cells || {}).length); if (added[0]) sheet = added[0]; }
    }
    const src = shown.sheets.find(x => x.name === sheet.name);
    const cells = (src && src.cells) || {};
    const rows = []; const ROWS = 9, COLS = 4;
    for (let r = 1; r <= ROWS; r++) {
      let tr = '';
      for (let c = 1; c <= COLS; c++) {
        const ref = String.fromCharCode(64 + c) + r; const cell = cells[ref];
        let v = cell ? (cell.formula ? '#' : cell.value == null ? '' : String(cell.value)) : '';
        if (typeof cell?.value === 'number') v = cell.value >= 1000 ? Math.round(cell.value).toLocaleString('en-US') : String(cell.value);
        const cls = [cell && cell.bold ? 'b' : '', cell && cell.fontColor === 'blue' ? 'blue' : '', typeof cell?.value === 'number' || cell?.formula ? 'num' : ''].filter(Boolean).join(' ');
        tr += `<td class="${cls}">${esc(v.slice(0, c === 1 ? 20 : 10))}</td>`;
      }
      rows.push(`<tr>${tr}</tr>`);
    }
    return `<div class="dr-thumb${delivered ? ' delivered' : ''}" title="${esc(sheet.name)}${delivered ? ' · delivered' : ' · as it arrived'}"><div class="dr-thumb-tab">${esc(sheet.name)}</div><table><colgroup><col class="c1"><col><col><col></colgroup>${rows.join('')}</table>${delivered ? '<span class="dr-stamp">delivered</span>' : ''}</div>`;
  } catch (e) { return ''; }
}

export function mountLearnPage(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'dr';
  let openChapter = 'foundations';
  let focusIdx = -1;

  function render() {
    const all = store.all(); const skipped = prefs.get().skipped;
    const ch1 = CHAPTERS.find(x => x.id === 'foundations');
    const gate = store.chapter('foundations');
    // the Welcome module is retired (B2): its moves open lesson 1.1.1
    const mods = ch1 ? modulesOf(ch1).filter(m => m.id !== 'welcome') : [];
    const path = ch1 ? pathModel(ch1, all, skipped).filter(m => m.id !== 'welcome') : [];
    // the path marked "next" on the retired module: move the mark to the first open item that is shown
    if (!path.some(m => m.items.some(it => it.next))) { const it = path.flatMap(m => m.items).find(x => x.st !== 'done' && x.st !== 'mastered' && x.st !== 'skipped'); if (it) it.next = true; }
    const modsDone = path.filter(m => m.status === 'complete').length;
    const tree = CHAPTER_PLAN.map(pl => {
      const st = STAGES.find(s => s.id === pl.id) || {};
      const open = pl.id === openChapter;
      const count = pl.id === 'foundations' ? `${modsDone}/${st.modules || mods.length}` : '';
      const held = pl.access !== 'paid' || (CHAPTERS.some(c => c.id === pl.id) && entitlement.entitled());   // a built paid chapter this account holds
      return `<button type="button" class="dr-folder${open ? ' open' : ''}${held ? '' : ' locked'}" data-ch="${esc(pl.id)}" aria-expanded="${open}">
        <span class="dr-folder-ico" aria-hidden="true">${open ? '▾' : '▸'}</span>
        <span class="dr-folder-n">${pl.n}.</span><span class="dr-folder-t">${esc(pl.title)}</span>
        <span class="dr-folder-meta">${count ? `<span class="dr-count">${count}</span>` : ''}<span class="l-tag ${pl.access === 'free' ? 'l-free' : ''}">${pl.access}</span></span>
        ${pl.access === 'paid' ? `<span class="dr-tease">${esc(st.stage || pl.line)}</span>` : ''}
      </button>`;
    }).join('');

    let docs = '';
    if (openChapter === 'foundations') {
      const stage = STAGES[0];
      docs += `<div class="dr-ch-head"><div><div class="dr-ch-eyebrow">Folder 1 · stage 1 of 6 · ${esc(stage.stage)}</div><h2>Foundations</h2>
          <p>Management sent the weekly site report for the Austin cluster, untidy. The deliverable is the weekly KPI page: clean, live, formatted, checked, print-ready. Seven modules, each one job on that file, then the project and assessment.</p></div>
          <div class="dr-ch-tools">${gate.testout ? '<span class="chapter-testout tested">Tested out ✓</span>' : '<a class="btn btn-ghost" href="#/lesson/foundations-testout">Already know this? Test out</a>'}</div></div>`;
      docs += '<div class="dr-docs">';
      mods.forEach((m, k) => {
        const pm = path[k]; const plan = PLANNED_MODULES[k] || {};
        const sec = (sectionsOf(ch1).find(s => s.name === m.title) || {});
        const chP = m.challenge ? (all[m.challenge.id] || null) : null;
        const project = !m.challenge ? m.lessons.find(l => l.kind === 'project') : null;
        const passed = !!(chP && (chP.challenge || chP.completed)) || !!(project && all[project.id] && all[project.id].completed);
        const tier = chP && chP.tier;
        const status = moduleStatus(m, all);
        const statusText = status === 'complete' ? 'Complete' : status === 'lessons-done' ? 'Lessons done · challenge open' : status === 'started' ? 'In progress' : 'Not started';
        docs += `<article class="dr-doc dr-${esc(status)}" data-doc="${esc(m.id)}">
          <div class="dr-doc-num"><span>${docNo(1, k, m.id)}</span>${ring(pm.done, pm.total, { size: 30, stroke: 3.5 })}</div>
          <div class="dr-doc-main">
            <div class="dr-doc-row"><h3>${esc(m.title)}</h3><span class="dr-status st-${esc(status)}">${statusText}</span></div>
            <p class="dr-obj">${esc(sec.blurb || plan.objective || '')}</p>
            <ol class="dr-steps">
              ${m.lessons.map((l, i) => { if (l.kind === 'testout') return ''; const st = statusOf(l.id, all, skipped); const isNext = pm.items[i] && pm.items[i].next; return `<li class="dr-step dr-st-${esc(st)}${isNext ? ' next' : ''}"><a href="#/lesson/${esc(l.id)}" data-open="${esc(l.id)}"><span class="dr-step-n">${esc(itemNumber(l, { module: m, k: k + 1, n: i + 1 }) || docNo(1, k, m.id) + '.' + (i + 1))}</span><span class="dr-step-t">${esc(l.title)}</span><span class="dr-step-m">${l.minutes ? l.minutes + ' min' : ''}</span><span class="dr-step-st">${stepMark(st, isNext)}</span></a></li>`; }).join('')}
              ${m.challenge ? `<li class="dr-step dr-challenge dr-st-${passed ? 'done' : 'todo'}${pm.items[pm.items.length - 1] && pm.items[pm.items.length - 1].next ? ' next' : ''}"><a href="#/lesson/${esc(m.challenge.id)}" data-open="${esc(m.challenge.id)}"><span class="dr-step-n">⚑</span><span class="dr-step-t">${esc(challengeName(m.challenge.title))}<span class="dr-pars">${m.challenge.pars ? 'challenge · pass ' + m.challenge.pars.pass + ' s · pro ' + m.challenge.pars.pro + ' s · legendary ' + m.challenge.pars.legendary + ' s' : 'challenge'}</span></span><span class="dr-step-m">${m.challenge.minutes ? m.challenge.minutes + ' min' : ''}</span><span class="dr-step-st">${passed ? (tier && TIER_MARK[tier] ? TIER_MARK[tier] + ' ' + tier : '✓ passed') : ''}</span></a></li>` : ''}
            </ol>
          </div>
          <div class="dr-doc-page${passed ? ' filled' : ''}">
            ${pageThumbHtml(m, passed)}
            <div class="dr-page-cap"><b>Page ${docNo(1, k, m.id)}</b> ${passed ? `${esc(pageName(m))} · delivered` : m.challenge ? 'fills in when the challenge passes' : 'fills in when the project is built'}</div>
            ${m.challenge && passed ? `<a class="dr-replay" href="#/lesson/${esc(m.challenge.id)}?seed=new" title="Replay the challenge on a fresh sheet">Replay · new sheet →</a>` : ''}
          </div>
        </article>`;
      });
      // 1.8: the chapter's project, assessment and test-out (module or section, whichever the catalogue carries)
      const finals = ch1 ? ch1.lessons.filter(isFinalItem) : [];
      if (finals.length && !mods.some(m => m.id === FINAL_MODULE.id)) {
        const main = finals.filter(l => l.kind !== 'testout');
        const doneN = main.filter(l => { const p = all[l.id]; return p && p.completed; }).length;
        const passed = !!gate.assessment || !!gate.testout;
        const status = passed ? 'complete' : doneN ? 'started' : 'not-started';
        const statusText = passed ? 'Complete' : doneN ? 'In progress' : 'Not started';
        const nextFinal = main.find(l => !(all[l.id] && all[l.id].completed));
        const label = { project: 'P', assessment: 'A', testout: 'T' };
        const row = moduleCopy(FINAL_MODULE.id);
        docs += `<article class="dr-doc dr-${status} dr-final" data-doc="${FINAL_MODULE.id}">
          <div class="dr-doc-num"><span>${FINAL_MODULE.n}</span>${ring(doneN, main.length || 1, { size: 30, stroke: 3.5 })}</div>
          <div class="dr-doc-main">
            <div class="dr-doc-row"><h3>${esc((row && row.name) || FINAL_MODULE.title)}</h3><span class="dr-status st-${status}">${statusText}</span></div>
            <p class="dr-obj">${esc((row && row.objective) || 'Build the weekly report end to end, then prove it against the clock; or test out of the chapter.')}</p>
            <ol class="dr-steps">${finals.filter(l => l.kind !== 'testout').map(l => { const st = statusOf(l.id, all, skipped); const isNext = nextFinal && nextFinal.id === l.id && !mods.some((m2, k2) => path[k2] && path[k2].items.some(it => it.next)); return `<li class="dr-step dr-st-${esc(st)}${isNext ? ' next' : ''}"><a href="#/lesson/${esc(l.id)}" data-open="${esc(l.id)}"><span class="dr-step-n">${FINAL_MODULE.n}.${label[l.kind] || ''}</span><span class="dr-step-t">${esc(l.title)}</span><span class="dr-step-m">${l.minutes ? l.minutes + ' min' : l.timeLimit ? Math.round(l.timeLimit / 60) + ' min limit' : ''}</span><span class="dr-step-st">${stepMark(st, isNext)}</span></a></li>`; }).join('')}</ol>
          </div>
          <div class="dr-doc-page${passed ? ' filled' : ''}"><div class="dr-thumb-slot${passed ? ' delivered' : ''}"><span>Page ${FINAL_MODULE.n}</span></div>
            <div class="dr-page-cap"><b>Page ${FINAL_MODULE.n}</b> ${passed ? `${esc((row && row.page_name) || 'The weekly KPI report')} · delivered` : '· the finished weekly report — fills in when the assessment passes'}</div></div>
        </article>`;
      }
      for (let k = mods.length; k < PLANNED_MODULES.length; k++) {
        const plan = PLANNED_MODULES[k];
        docs += `<article class="dr-doc dr-coming"><div class="dr-doc-num"><span>${esc(plan.n)}</span></div><div class="dr-doc-main"><div class="dr-doc-row"><h3>${esc(plan.title)}</h3><span class="dr-status st-coming">Coming</span></div><p class="dr-obj">${esc(plan.objective)}</p></div><div class="dr-doc-page"><div class="dr-page-cap"><b>Page ${esc(plan.n)}</b> not yet</div></div></article>`;
      }
      docs += '</div>';
    } else if (CHAPTERS.some(c => c.id === openChapter) && entitlement.entitled()) {
      // a built paid chapter the account holds (Chapter 2 on): its modules as documents, the same shape as Chapter 1's
      const ch = CHAPTERS.find(c => c.id === openChapter);
      const pl = CHAPTER_PLAN.find(p => p.id === openChapter) || {};
      const st = STAGES.find(s => s.id === pl.id) || {};
      const cmods = modulesOf(ch); const cpath = pathModel(ch, all, skipped);
      docs += `<div class="dr-ch-head"><div><div class="dr-ch-eyebrow">Folder ${pl.n} · stage ${st.n} of 6 · ${esc(st.stage || '')}</div><h2>${esc(ch.title)} <span class="l-tag">paid · yours</span></h2>
          <p><b>Management sends:</b> ${esc(st.sends || '')}.<br><b>You deliver:</b> ${esc(st.delivers || '')}.</p><p>${esc(ch.blurb)}</p></div></div>`;
      docs += '<div class="dr-docs">';
      cmods.forEach((m, k) => {
        const pm = cpath[k] || { done: 0, total: m.lessons.length, items: [] };
        const sec = (sectionsOf(ch).find(s => s.name === m.title) || {});
        const chP = m.challenge ? (all[m.challenge.id] || null) : null;
        const passed = !!(chP && (chP.challenge || chP.completed));
        const tier = chP && chP.tier;
        const status = moduleStatus(m, all);
        const statusText = status === 'complete' ? 'Complete' : status === 'lessons-done' ? 'Lessons done · challenge open' : status === 'started' ? 'In progress' : 'Not started';
        const no = docNo(pl.n, k, m.id);
        docs += `<article class="dr-doc dr-${esc(status)}" data-doc="${esc(m.id)}">
          <div class="dr-doc-num"><span>${esc(no)}</span>${ring(pm.done, pm.total, { size: 30, stroke: 3.5 })}</div>
          <div class="dr-doc-main">
            <div class="dr-doc-row"><h3>${esc(m.title)}</h3><span class="dr-status st-${esc(status)}">${statusText}</span></div>
            <p class="dr-obj">${esc(sec.blurb || '')}</p>
            <ol class="dr-steps">
              ${m.lessons.map((l, i) => { const stt = statusOf(l.id, all, skipped); const isNext = pm.items[i] && pm.items[i].next; return `<li class="dr-step dr-st-${esc(stt)}${isNext ? ' next' : ''}"><a href="#/lesson/${esc(l.id)}" data-open="${esc(l.id)}"><span class="dr-step-n">${esc(itemNumber(l, { module: m, k: k + 1, n: i + 1 }) || no + '.' + (i + 1))}</span><span class="dr-step-t">${esc(l.title)}</span><span class="dr-step-m">${l.minutes ? l.minutes + ' min' : ''}</span><span class="dr-step-st">${stepMark(stt, isNext)}</span></a></li>`; }).join('')}
              ${m.challenge ? `<li class="dr-step dr-challenge dr-st-${passed ? 'done' : 'todo'}${pm.items[pm.items.length - 1] && pm.items[pm.items.length - 1].next ? ' next' : ''}"><a href="#/lesson/${esc(m.challenge.id)}" data-open="${esc(m.challenge.id)}"><span class="dr-step-n">⚑</span><span class="dr-step-t">${esc(challengeName(m.challenge.title))}<span class="dr-pars">${m.challenge.pars ? 'challenge · pass ' + m.challenge.pars.pass + ' s · pro ' + m.challenge.pars.pro + ' s · legendary ' + m.challenge.pars.legendary + ' s' : 'challenge'}</span></span><span class="dr-step-m">${m.challenge.minutes ? m.challenge.minutes + ' min' : ''}</span><span class="dr-step-st">${passed ? (tier && TIER_MARK[tier] ? TIER_MARK[tier] + ' ' + tier : '✓ passed') : ''}</span></a></li>` : ''}
            </ol>
          </div>
          <div class="dr-doc-page${passed ? ' filled' : ''}">
            ${pageThumbHtml(m, passed)}
            <div class="dr-page-cap"><b>Page ${esc(no)}</b> ${passed ? `${esc(pageName(m))} · delivered` : 'fills in when the challenge passes'}</div>
            ${m.challenge && passed ? `<a class="dr-replay" href="#/lesson/${esc(m.challenge.id)}?seed=new" title="Replay the challenge on a fresh sheet">Replay · new sheet →</a>` : ''}
          </div>
        </article>`;
      });
      for (let k = cmods.length; k < (st.modules || cmods.length); k++) {
        docs += `<article class="dr-doc dr-coming"><div class="dr-doc-num"><span>${esc(pl.n + '.' + (k + 1))}</span></div><div class="dr-doc-main"><div class="dr-doc-row"><h3>Module ${esc(pl.n + '.' + (k + 1))}</h3><span class="dr-status st-coming">Coming</span></div><p class="dr-obj">Lands with the next run of the chapter.</p></div><div class="dr-doc-page"><div class="dr-page-cap"><b>Page ${esc(pl.n + '.' + (k + 1))}</b> not yet</div></div></article>`;
      }
      docs += '</div>';
    } else {
      const pl = CHAPTER_PLAN.find(p => p.id === openChapter) || CHAPTER_PLAN[1];
      const st = STAGES.find(s => s.id === pl.id) || {};
      const built = CHAPTERS.find(c => c.id === pl.id) || null;   // authored, locked to this account: the lessons are in, the door is shut
      const ch1Cleared = !!gate.testout || !!gate.assessment || (ch1 && modulesOf(ch1).filter(m => m.id !== 'welcome').every(m => moduleStatus(m, all) === 'complete'));
      docs += `<div class="dr-ch-head"><div><div class="dr-ch-eyebrow">Folder ${pl.n} · stage ${st.n} of 6 · ${esc(st.stage || '')}</div><h2>${esc(built ? built.title : pl.title)} <span class="l-tag">paid</span></h2>
          <p><b>Management sends:</b> ${esc(st.sends || '')}.<br><b>You deliver:</b> ${esc(st.delivers || '')}.</p><p>${esc(built ? built.blurb : pl.line)}</p>
          ${built ? `<p>${esc(PAID_LINE)}</p><p class="dr-lock">${built.lessons.length} lessons are in: ${modulesOf(built).map(m => esc(m.title)).join(', ')}, each with a timed challenge.</p>` : ''}
          <p class="dr-lock">${pl.n === 2 ? (ch1Cleared ? 'Unlocked — Chapter 1 is behind you. Its lessons ' + (built ? 'open' : 'arrive') + ' with the paid tier.' : 'Opens when Chapter 1 is complete or tested out, with the paid tier.') : 'Arrives with the paid tier, in order.'} <a class="dr-price" href="#/pricing">See pricing →</a>${built && auth.state() !== 'in' ? ' · <a class="dr-price" href="#/account">Sign in →</a>' : ''}</p></div></div>`;
    }

    el.innerHTML = `<div class="dr-head"><div><h1>Project Volt · data room</h1><p class="dr-sub">One deal, six chapters. Each chapter is a stage of the sale and produces one page of the pack. Your progress is ${esc(store.saveLine())}.</p></div>
        <span class="cat-keys"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> open</span></div>
      ${dealStripHtml(all)}
      <div class="dr-grid"><nav class="dr-tree" aria-label="Chapters">${tree}</nav><section class="dr-main">${docs}</section></div>`;
    wire();
  }

  function steps() { return [...el.querySelectorAll('.dr-step a[data-open]')]; }
  function setFocus(i, viaKeyboard) {
    const list = steps(); if (!list.length) return;
    focusIdx = Math.max(0, Math.min(list.length - 1, i));
    list.forEach((a, j) => { a.classList.toggle('kb-focus', j === focusIdx); a.tabIndex = j === focusIdx ? 0 : -1; });
    if (viaKeyboard) { list[focusIdx].focus({ preventScroll: true }); list[focusIdx].scrollIntoView({ block: 'nearest' }); }
  }
  function wire() {
    for (const b of el.querySelectorAll('.dr-folder[data-ch]')) b.onclick = () => { openChapter = b.dataset.ch; render(); };
    const list = steps();
    const nextI = list.findIndex(a => a.closest('.dr-step').classList.contains('next'));
    setFocus(focusIdx >= 0 ? focusIdx : nextI >= 0 ? nextI : 0, false);
  }
  // the header's promise holds from the first key: ↑ ↓ (or j k) move through the steps, Enter opens, without tabbing in first
  let kbMoved = false;
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  const onKey = e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
    const list = steps(); if (!list.length) return;
    const inList = e.target.closest && e.target.closest('.dr-step a');
    const i = inList ? list.indexOf(inList) : focusIdx;
    const go = j => { e.preventDefault(); kbMoved = true; el.classList.add('kb-mode'); setFocus(j, true); };
    if (e.key === 'ArrowDown' || e.key === 'j') go(inList || kbMoved ? i + 1 : i);
    else if (e.key === 'ArrowUp' || e.key === 'k') go(inList || kbMoved ? i - 1 : i);
    else if (e.key === 'Home' && inList) go(0);
    else if (e.key === 'End' && inList) go(list.length - 1);
    else if (e.key === 'Enter' && !inList && e.target === document.body && focusIdx >= 0) { e.preventDefault(); list[focusIdx].click(); }
  };
  document.addEventListener('keydown', onKey);
  el.addEventListener('focusin', e => { const a = e.target.closest && e.target.closest('.dr-step a'); if (a) { const i = steps().indexOf(a); if (i >= 0) setFocus(i, false); } });
  // #/learn?ch=formatting opens that chapter's folder; #/learn?doc=<module> scrolls to its document (Home's rings link here)
  const q = (ctx && ctx.query) || {};
  if (q.ch && CHAPTER_PLAN.some(p => p.id === q.ch)) openChapter = q.ch;
  render();
  root.appendChild(el);
  if (q.doc) { const d = el.querySelector(`.dr-doc[data-doc="${CSS && CSS.escape ? CSS.escape(q.doc) : q.doc}"]`); if (d) requestAnimationFrame(() => { d.scrollIntoView({ block: 'start' }); window.scrollBy(0, -12); d.classList.add('dr-flash'); }); }
  // the next-up row pulses once when the learner comes back (SITE_SPEC §6a)
  const nx = el.querySelector('.dr-step.next'); if (nx) nx.classList.add('pulse-once');
  return { destroy() { document.removeEventListener('keydown', onKey); el.remove(); } };
}
