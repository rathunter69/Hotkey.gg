// app2/tests/public-pages.js — the public lesson and shortcut pages (SITE_SPEC §2): one static
// page per lesson and per shortcut for search engines, generated from the lesson and reference
// data so they can never drift. Each opens the lesson in the app.
//
//   node app2/tests/public-pages.js --write   regenerate app2/lessons/*.html and app2/shortcuts/*.html
//   node app2/tests/public-pages.js           check mode (npm run check): fail if the files differ
//
// No dependencies, no JavaScript on the pages beyond the theme preload the app itself uses.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, LESSONS, chapterOf, lessonNumber, nextLesson } from '../content/index.js';
import { REFERENCE, CATEGORIES, CATEGORY_NOTES, ADDIN_DISCLAIMER, parseChord } from '../content/reference.js';

const here = dirname(fileURLToPath(import.meta.url));
const app2 = resolve(here, '..');

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** `Ctrl+1` → <kbd>Ctrl+1</kbd>; everything else escaped. */
const rich = s => esc(s).replace(/`([^`]+)`/g, (m, k) => `<kbd>${k}</kbd>`);
const plain = s => String(s).replace(/`/g, '');
/** 'Ctrl+Shift+↓' → <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>↓</kbd>; 'Alt H 1' → three keycaps in sequence. */
const chordHtml = chord => parseChord(chord).map(seg => seg.map(alts => `<kbd>${esc(alts.join('/'))}</kbd>`).join('+')).join(' ');

const CSS = `
:root{--bg:#dbd8d1;--surface:#ecebe6;--surface2:#e1dfd8;--line:#c6c2b8;--text:#38352d;--muted:#6b665d;--faint:#a09a8f;--accent:#16a862;--accent-dim:#0e7a45;--accent-glow:rgba(22,168,98,.16);--on-accent:#fff;--mono:'JetBrains Mono',ui-monospace,monospace;--sans:'Hanken Grotesk',system-ui,sans-serif}
*{box-sizing:border-box}html,body{margin:0}body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:15px;line-height:1.6}
a{color:var(--accent-dim)}a:hover{color:var(--accent)}
.top{display:flex;align-items:center;gap:18px;padding:12px 20px;border-bottom:1px solid var(--line);background:var(--surface);font-family:var(--mono);font-size:13px}
.top .brand{font-weight:700;color:var(--text);text-decoration:none;margin-right:auto}.top .brand b{color:var(--accent)}.top a{color:var(--muted);text-decoration:none}.top a:hover{color:var(--text)}
main{max-width:760px;margin:28px auto 40px;padding:0 16px}
.crumb{font-family:var(--mono);font-size:12px;color:var(--faint);margin-bottom:10px}.crumb a{color:var(--muted);text-decoration:none}
h1{font-family:var(--mono);font-size:26px;letter-spacing:-.4px;margin:0 0 6px}h2{font-size:17px;margin:26px 0 8px}h3{font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin:22px 0 6px}
.meta{font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:18px}.meta .free{color:var(--accent);font-weight:700}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin:14px 0}
kbd{font-family:var(--mono);font-size:12px;color:var(--text);background:var(--surface2);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:1px 6px;white-space:nowrap}
.chord{font-size:18px}.chord kbd{font-size:16px;padding:4px 10px}.chords{display:flex;gap:28px;flex-wrap:wrap;margin:10px 0 4px}.chords div span{display:block;font-family:var(--mono);font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
ol.goals,ul.list{padding-left:22px;margin:0}ol.goals li,ul.list li{margin:5px 0}ul.list .k{font-family:var(--mono);font-size:12.5px}
.btn{display:inline-block;font-family:var(--mono);font-size:14px;font-weight:700;color:var(--on-accent);background:var(--accent);border:1px solid var(--accent);border-radius:8px;padding:10px 18px;text-decoration:none}.btn:hover{background:var(--accent-dim);color:var(--on-accent)}
.btn-ghost{background:transparent;color:var(--text);border-color:var(--line);font-weight:500}.btn-ghost:hover{background:var(--surface2);color:var(--text)}
.cta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:22px 0}.path{font-family:var(--mono);font-size:12px;color:var(--muted)}
.prevnext{display:flex;justify-content:space-between;gap:12px;margin-top:26px;font-family:var(--mono);font-size:12.5px}
.muted{color:var(--muted)}.small{font-size:12.5px}
footer{border-top:1px solid var(--line);margin-top:30px;padding:18px 20px;font-family:var(--mono);font-size:12px;color:var(--muted);display:flex;gap:16px;flex-wrap:wrap}footer a{color:var(--muted);text-decoration:none}footer a:hover{color:var(--text)}
`.trim();

const THEME_PRELOAD = `<script>try{var v=JSON.parse(localStorage.getItem('hotkey_theme_vars'));if(v&&v.vars){var r=document.documentElement;for(var k in v.vars)r.style.setProperty('--'+k,v.vars[k]);r.setAttribute('data-dark',v.dark?'1':'0');}}catch(e){}</script>`;

/** The shared frame. `up` is the relative path from the page to app2/ ('../'). */
function frame({ title, description, up, body }) {
  const app = up + 'index.html';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="generator" content="app2/tests/public-pages.js — generated from lesson data; do not edit by hand">
${THEME_PRELOAD}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}ui/public.css">
</head>
<body>
<nav class="top"><a class="brand" href="${app}#/">hotkey<b>.gg</b></a><a href="${app}#/learn">Learn</a><a href="${app}#/practice">Practice</a><a href="${app}#/leaderboard">Leaderboard</a><a href="${app}#/reference">Reference</a></nav>
<main>
${body}
</main>
<footer><a href="${app}#/pricing">Pricing</a><a href="${app}#/teams">Teams</a><a href="${app}#/about">About</a><a href="${app}#/terms">Terms</a><a href="${app}#/privacy">Privacy</a><a href="${app}#/contact">Contact</a><span>© hotkey.gg</span></footer>
</body>
</html>
`;
}

export function renderLessonPage(lesson) {
  const ch = chapterOf(lesson); const n = lessonNumber(lesson.id); const teach = lesson.steps.find(s => s.mode === 'teach');
  const up = '../'; const app = up + 'index.html';
  const i = LESSONS.indexOf(lesson); const prev = i > 0 ? LESSONS[i - 1] : null; const next = nextLesson(lesson.id);
  const taught = REFERENCE.filter(e => e.lessonId === lesson.id);
  const body = `<div class="crumb"><a href="${app}#/learn">Learn</a> › <a href="index.html">${esc(ch.title)}</a> › ${esc(lesson.section)}</div>
<h1>Lesson ${n}: ${esc(lesson.title)}</h1>
<div class="meta">${esc(ch.title)} · ${esc(lesson.section)} · ${esc(lesson.difficulty)} · <span class="${lesson.access === 'free' ? 'free' : ''}">${lesson.access === 'free' ? 'Free' : 'Paid'}</span></div>
<div class="card">
<h2 style="margin-top:0">${esc(teach.title)}</h2>
${teach.body.map(p => `<p>${rich(p)}</p>`).join('\n')}
</div>
<h2>What you will do</h2>
<ol class="goals">${lesson.goals.map(g => `<li>${esc(g.text)}</li>`).join('')}</ol>
<div class="cta"><a class="btn" href="${app}#/lesson/${esc(lesson.id)}">Start this lesson</a><span class="path">Read → Guided → Try solo → Timed</span></div>
${taught.length ? `<h2>Shortcuts in this lesson</h2><ul class="list">${taught.map(e => `<li><span class="k">${chordHtml(e.win)}</span> <a href="../shortcuts/${esc(e.id)}.html">${esc(e.name)}</a></li>`).join('')}</ul>` : ''}
<div class="prevnext"><span>${prev ? `← <a href="${esc(prev.id)}.html">Lesson ${n - 1}: ${esc(prev.title)}</a>` : ''}</span><span>${next ? `<a href="${esc(next.id)}.html">Lesson ${n + 1}: ${esc(next.title)}</a> →` : ''}</span></div>`;
  return frame({ title: `Lesson ${n}: ${lesson.title} — ${ch.title} · hotkey.gg`, description: plain(teach.body[0]), up, body });
}

export function renderLessonsIndex() {
  const up = '../'; const app = up + 'index.html';
  const body = `<div class="crumb"><a href="${app}#/learn">Learn</a> › Lessons</div>
<h1>Excel lessons</h1>
<p class="muted">Every lesson runs on a real in-browser spreadsheet. Read, do it guided, do it solo, then race the clock.</p>
${CHAPTERS.map(ch => `<h2>${esc(ch.title)}</h2><p class="muted small">${esc(ch.blurb)}</p>` +
  (ch.sections || []).map(sec => { const ls = ch.lessons.filter(l => l.section === sec); return ls.length ? `<h3>${esc(sec)}</h3><ul class="list">${ls.map(l => `<li><a href="${esc(l.id)}.html">Lesson ${lessonNumber(l.id)}: ${esc(l.title)}</a> <span class="muted small">· ${esc(l.difficulty)}</span></li>`).join('')}</ul>` : ''; }).join('')).join('')}
<div class="cta"><a class="btn" href="${app}#/learn">Open the catalogue</a></div>`;
  return frame({ title: 'Excel lessons · hotkey.gg', description: 'Learn Excel by doing: guided lessons on a real in-browser spreadsheet, from the active cell to formulas.', up, body });
}

export function renderShortcutPage(e) {
  const up = '../'; const app = up + 'index.html';
  const lesson = e.lessonId ? LESSONS.find(l => l.id === e.lessonId) : null;
  const body = `<div class="crumb"><a href="${app}#/reference">Reference</a> › <a href="index.html">${esc(e.category)}</a></div>
<h1>${esc(e.name)}</h1>
<div class="meta">Excel shortcut · ${esc(e.category)}${e.addin ? ` · ${esc(e.addin)} add-in` : ''}</div>
<div class="card">
<div class="chords"><div><span>Windows</span><div class="chord">${chordHtml(e.win)}</div></div><div><span>Mac</span><div class="chord">${chordHtml(e.mac)}</div></div></div>
<p>${esc(e.what)}</p>
${e.note ? `<p class="muted small">${esc(e.note)}</p>` : ''}${e.macNote ? `<p class="muted small">Mac: ${esc(e.macNote)}</p>` : ''}
</div>
${lesson ? `<h2>Learn it</h2><p>Taught in <a href="../lessons/${esc(lesson.id)}.html">Lesson ${lessonNumber(lesson.id)}: ${esc(lesson.title)}</a>.</p>
<div class="cta"><a class="btn" href="${app}#/lesson/${esc(lesson.id)}">Practise it in the lesson</a><a class="btn btn-ghost" href="${app}#/reference">Full reference</a></div>`
  : `<h2>Learn it</h2><p class="muted">A lesson for this shortcut is coming with a later chapter.</p><div class="cta"><a class="btn btn-ghost" href="${app}#/reference">Full reference</a></div>`}
${e.addin ? `<p class="muted small">${esc(ADDIN_DISCLAIMER)}</p>` : ''}`;
  return frame({ title: `${e.name} (${e.win}) — Excel shortcut · hotkey.gg`, description: `${e.name}: ${e.win} on Windows, ${e.mac} on Mac. ${e.what}`, up, body });
}

export function renderShortcutsIndex() {
  const up = '../'; const app = up + 'index.html';
  const body = `<div class="crumb"><a href="${app}#/reference">Reference</a> › Shortcuts</div>
<h1>Excel shortcuts</h1>
<p class="muted">Every shortcut in the reference, with the lesson that teaches it where one exists.</p>
${CATEGORIES.map(cat => { const rows = REFERENCE.filter(e => e.category === cat); return rows.length ? `<h2>${esc(cat)}</h2>${CATEGORY_NOTES[cat] ? `<p class="muted small">${esc(CATEGORY_NOTES[cat])}</p>` : ''}<ul class="list">${rows.map(e => `<li><span class="k">${chordHtml(e.win)}</span> <a href="${esc(e.id)}.html">${esc(e.name)}</a>${e.lessonId ? ` <span class="muted small">· Lesson ${lessonNumber(e.lessonId)}</span>` : ''}</li>`).join('')}</ul>` : ''; }).join('')}
<p class="muted small">${esc(ADDIN_DISCLAIMER)}</p>
<div class="cta"><a class="btn" href="${app}#/reference">Open the reference</a></div>`;
  return frame({ title: 'Excel shortcuts · hotkey.gg', description: 'Every Excel keyboard shortcut in the hotkey.gg reference, Windows and Mac, with the lesson that teaches it.', up, body });
}

/** Every generated page: Map of app2-relative path → html. */
export function pages() {
  const out = new Map();
  out.set('ui/public.css', `/* app2/ui/public.css — generated by app2/tests/public-pages.js for the public lesson and shortcut pages; do not edit by hand */\n${CSS}\n`);
  out.set('lessons/index.html', renderLessonsIndex());
  for (const l of LESSONS) out.set(`lessons/${l.id}.html`, renderLessonPage(l));
  out.set('shortcuts/index.html', renderShortcutsIndex());
  for (const e of REFERENCE) out.set(`shortcuts/${e.id}.html`, renderShortcutPage(e));
  return out;
}

/** Compare the generated pages with the files on disk. Returns the list of paths that differ or are stale. */
export function drift() {
  const want = pages(); const bad = [];
  for (const [p, html] of want) { const f = join(app2, p); if (!existsSync(f) || readFileSync(f, 'utf8') !== html) bad.push(p); }
  for (const dir of ['lessons', 'shortcuts']) {
    const d = join(app2, dir); if (!existsSync(d)) continue;
    for (const name of readdirSync(d)) if (name.endsWith('.html') && !want.has(`${dir}/${name}`)) bad.push(`${dir}/${name} (stale: no such lesson or shortcut)`);
  }
  return bad;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ids = REFERENCE.map(e => e.id);
  if (new Set(ids).size !== ids.length) { console.error('public-pages: duplicate shortcut ids'); process.exit(1); }
  if (process.argv.includes('--write')) {
    const want = pages();
    for (const dir of ['lessons', 'shortcuts', 'ui']) mkdirSync(join(app2, dir), { recursive: true });
    for (const [p, html] of want) writeFileSync(join(app2, p), html);
    for (const dir of ['lessons', 'shortcuts']) for (const name of readdirSync(join(app2, dir))) if (name.endsWith('.html') && !want.has(`${dir}/${name}`)) { const { unlinkSync } = await import('node:fs'); unlinkSync(join(app2, dir, name)); }
    console.log(`public pages written: ${want.size} files under ${relative(process.cwd(), app2)}/lessons and /shortcuts`);
  } else {
    const bad = drift();
    if (bad.length) { console.error(`public pages drift from the lesson data (${bad.length}): ${bad.slice(0, 8).join(', ')}${bad.length > 8 ? ', …' : ''}\n  run: node app2/tests/public-pages.js --write`); process.exit(1); }
    console.log(`public pages ok: ${pages().size} files match the lesson and reference data`);
  }
}
