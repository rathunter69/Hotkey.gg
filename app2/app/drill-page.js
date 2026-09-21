// app2/app/drill-page.js — the drill workspace (SITE_SPEC §5) in the old trainer layout: drill bar
// (chapter · title · position · prev/next), slim mode bar (Help · Win/Mac · ghost · sound ·
// fullscreen), the sheet with a sheet-tabs strip, the task panel on the RIGHT, and a status line
// with pass / pro / legendary pars ("—" until Phase D). Today it hosts the existing mountSandbox.
// The clock starts on the first key press (session.t0).
import { mountSandbox } from './sandbox.js';
import { prefs, keyLabel } from './prefs.js';
import { showToast } from '../ui/toast.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const ICO = {
  ghost: `<svg class="mb-ico" ${SVG}><path d="M5 21V10a7 7 0 0 1 14 0v11l-3-2-2 2-2-2-2 2-3-2Z"/><path d="M9.5 10h.01M14.5 10h.01"/></svg>`,
  sound: `<svg class="mb-ico" ${SVG}><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>`,
  mute: `<svg class="mb-ico" ${SVG}><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6M16 9l6 6"/></svg>`,
  fs: `<svg class="mb-ico" ${SVG}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`,
};

/** The drills this page knows. Sandbox is the only one until Phase D. */
export const DRILLS = [
  { id: 'sandbox', chapter: 'Practice', title: 'Sandbox: a free sheet', task: 'Nothing is graded here. Try anything.',
    suggestions: [
      { text: 'Jump to the bottom of the Line item column', keys: 'Ctrl+↓' },
      { text: 'Select the whole block from A1', keys: 'Ctrl+A' },
      { text: 'Make a cell bold from the Ribbon', keys: 'Alt H B' },
      { text: 'Open Format Cells and set a number format', keys: 'Ctrl+1' },
      { text: 'Undo everything and start again', keys: 'Ctrl+Z' },
    ] },
];

const fmt = secs => { const s = Math.max(0, secs); const m = Math.floor(s / 60); const r = s - m * 60; return m ? `${m}:${r.toFixed(1).padStart(4, '0')}` : r.toFixed(1); };

export function mountDrillPage(root, ctx = {}) {
  const id = (ctx.params && ctx.params.id) || 'sandbox';
  const drill = DRILLS.find(d => d.id === id) || DRILLS[0];
  const pos = DRILLS.indexOf(drill) + 1;
  const el = document.createElement('div');
  el.className = 'drill-page';
  let p = prefs.get();
  let helpOpen = false;

  const helpHtml = () => `<div class="help-panel" id="drHelp"${helpOpen ? '' : ' hidden'}>
      <div class="help-goal">Help: hints, guided and the solution, in one place.</div>
      <p class="help-note">In a timed drill this is where hints, the guided walk-through and the solution replay live. Using any of them means no personal best and no board entry for that run. The sandbox has nothing to grade, so read on and try things.</p>
      <div class="help-keys"><kbd>${esc(keyLabel('Ctrl+Z', p.platform))}</kbd><span class="kx">undo</span> <kbd>Esc</kbd><span class="kx">back out</span> <kbd>${esc(keyLabel('Alt', p.platform))}</kbd><span class="kx">Ribbon KeyTips</span> <kbd>F2</kbd><span class="kx">edit cell</span></div>
    </div>`;

  el.innerHTML = `
    <div class="drillbar">
      <button class="db-nav" id="prevDrill" type="button" title="previous drill" aria-label="previous drill" disabled>‹</button>
      <a class="db-current" id="drillPick" href="#/practice" title="all drills">
        <span class="db-cat">${esc(drill.chapter)}</span>
        <span class="db-name">${esc(drill.title)}</span>
        <span class="db-pos">${pos} / ${DRILLS.length}</span>
        <span class="db-more">all drills</span>
      </a>
      <button class="db-nav" id="nextDrill" type="button" title="next drill" aria-label="next drill" disabled>›</button>
    </div>
    <div class="exrow"><div class="mode-bar" role="toolbar" aria-label="drill tools">
      <button class="mb-tool" id="helpToggle" type="button" aria-pressed="false" title="F1"><kbd>F1</kbd> help</button>
      <button class="mb-tool" id="platBtn" type="button" title="the platform your keys follow"></button>
      <button class="mb-tool" id="ghostToggle" type="button" disabled title="Ghost arrives with timed play">${ICO.ghost}ghost</button>
      <span class="mb-spacer"></span>
      <button class="mb-tool" id="soundToggle" type="button" aria-pressed="false" title="key sounds"></button>
      <button class="mb-tool mb-icon" id="fsToggle" type="button" title="fullscreen (Esc to exit)" aria-label="fullscreen">${ICO.fs}</button>
    </div></div>
    <div class="stage drill-stage">
      <div class="stage-row">
        <div class="stage-main drill-host" id="drillHost"></div>
        <aside class="task-panel" id="taskPanel">
          <div class="cl-head">task <span>sandbox</span></div>
          <p class="task-text">${esc(drill.task)}</p>
          <div class="cl-list">${drill.suggestions.map(s => `<div class="cl-item"><span class="cl-box"></span><span class="cl-label">${esc(s.text)}</span><span class="cl-keys" data-keys="${esc(s.keys)}">${s.keys.split(' ').map(k => `<kbd>${esc(keyLabel(k, p.platform))}</kbd>`).join(' ')}</span></div>`).join('')}</div>
          ${helpHtml()}
          <div class="cl-esc"><kbd>Esc</kbd> backs out of the Ribbon or a dialog box · <kbd>${esc(keyLabel('Ctrl+Z', p.platform))}</kbd> undoes</div>
        </aside>
      </div>
      <div class="sheettabs" id="sheetTabs"><span class="st-lead">SHEETS</span><span class="st-tab cur" role="tab" aria-selected="true">Sheet1</span></div>
    </div>
    <div class="bar drill-status">
      <div class="stat">time <b id="drTime">0.0</b> · keys <b id="drKeys">0</b></div>
      <div class="stat">pass <b id="parPass">—</b> · pro <b id="parPro">—</b> · legendary <b id="parLeg">—</b><span class="muted"> · pars arrive with timed play</span></div>
      <div class="spacer"></div>
      <button class="btn btn-ghost" id="drReset" type="button">Reset sheet</button>
    </div>`;
  root.appendChild(el);
  const $ = id => el.querySelector('#' + id);

  const SB_OPTS = { modeBar: false, ribbonMode: 'slim' };   // the drill page carries its own mode bar (§5)
  let sb = mountSandbox($('drillHost'), SB_OPTS);
  const tickH = setInterval(() => {
    if (!sb) return;
    const t0 = sb.session.t0; $('drTime').textContent = t0 == null ? '0.0' : fmt((Date.now() - t0) / 1000);
    $('drTime').classList.toggle('run', t0 != null);
    $('drKeys').textContent = String(sb.session.keyLog.length);
  }, 100);

  function paintPlatform() { p = prefs.get(); $('platBtn').textContent = p.platform === 'mac' ? '⌘ mac keys' : 'win keys'; $('platBtn').setAttribute('aria-label', 'platform: ' + (p.platform === 'mac' ? 'Mac' : 'Windows') + ', click to switch');
    el.querySelectorAll('.cl-keys').forEach(s => { s.innerHTML = s.dataset.keys.split(' ').map(k => `<kbd>${esc(keyLabel(k, p.platform))}</kbd>`).join(' '); }); }
  // sound: the feedback layer (sandbox.fx) owns the sounds; prefs.mute mirrors its remembered mute so Settings and the bar agree
  const fx = () => (sb && sb.fx && typeof sb.fx.isMuted === 'function') ? sb.fx : null;
  const isMuted = () => { const f = fx(); return f ? f.isMuted() : prefs.get().mute; };
  const setMuted = m => { const f = fx(); if (f) f.setMuted(m); prefs.set({ mute: m }); };
  if (prefs.get().mute && fx() && !fx().isMuted()) fx().setMuted(true);
  function paintSound() { const m = isMuted(); const b = $('soundToggle'); b.innerHTML = (m ? ICO.mute : ICO.sound) + (m ? 'sound off' : 'sound on'); b.setAttribute('aria-pressed', m ? 'false' : 'true'); b.classList.toggle('on', !m); }
  paintPlatform(); paintSound();

  $('helpToggle').onclick = () => { helpOpen = !helpOpen; $('drHelp').hidden = !helpOpen; $('helpToggle').classList.toggle('on', helpOpen); $('helpToggle').setAttribute('aria-pressed', String(helpOpen)); };
  $('platBtn').onclick = () => { prefs.set({ platform: p.platform === 'mac' ? 'win' : 'mac' }); paintPlatform(); showToast('Keys follow ' + (prefs.get().platform === 'mac' ? 'Mac' : 'Windows')); };
  $('soundToggle').onclick = () => { const m = !isMuted(); setMuted(m); paintSound(); showToast(m ? 'Sound off' : 'Sound on'); };
  $('fsToggle').onclick = () => {
    const on = document.documentElement.classList.toggle('hk-fs');
    $('fsToggle').classList.toggle('on', on);
    try { if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); else if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } catch (e) { /* not allowed */ }
  };
  $('drReset').onclick = () => { if (sb) sb.destroy(); sb = mountSandbox($('drillHost'), SB_OPTS); showToast('Sheet reset'); $('drReset').blur(); };

  const onKey = e => {
    if (e.key === 'F1') { e.preventDefault(); $('helpToggle').click(); }
    if (e.key === 'Escape' && document.documentElement.classList.contains('hk-fs') && !document.fullscreenElement) { document.documentElement.classList.remove('hk-fs'); $('fsToggle').classList.remove('on'); }
  };
  const onFsChange = () => { if (!document.fullscreenElement) { document.documentElement.classList.remove('hk-fs'); $('fsToggle').classList.remove('on'); } };
  document.addEventListener('keydown', onKey);
  document.addEventListener('fullscreenchange', onFsChange);

  return {
    get sandbox() { return sb; },
    destroy() {
      clearInterval(tickH);
      document.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFsChange);
      document.documentElement.classList.remove('hk-fs');
      if (sb) sb.destroy(); sb = null;
      el.remove();
    },
  };
}
