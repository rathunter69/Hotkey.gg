// Re-records the landing's six "ways to practice" clips (app2/clips/<name>.webm) and their posters
// (<name>.jpg) from the real product at a desktop viewport. A dev tool: the gate never runs it.
//   node app2/tests/record-clips.mjs [name…]        lesson challenge drill daily rapid boards (default: all six)
//   node app2/tests/record-clips.mjs --check <dir>  also writes five frames of each clip, and the landing's
//                                                   modes section at 1440x900 and 1280x800, into <dir> to look at
//   add --no-record to only check the clips already in app2/clips/
// It serves the repo on a free loopback port, blocks every other request (fonts, Supabase: nothing leaves
// the machine), seeds a mid-chapter guest in localStorage and drives each mode by keyboard at a desktop
// viewport (the narrow-screen notice is max-width 900). Each clip is framed for its card (landing-next.js
// MODES, next.css .ld2-clip: object-fit cover from the top left; the wide cards are 2:1, the others near
// square on desktop and 16:10 on a tablet). The page is captured with the Chromium screencast, scaled
// down to the output size in the browser, resampled to 25 fps in real time and encoded to VP8 by
// Playwright's bundled ffmpeg (npx playwright install ffmpeg, or any ffmpeg on PATH).
// Requires Playwright: the global install at /opt/node22/lib/node_modules/playwright, or npm i --no-save playwright.
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../content/index.js';
import { drillById } from '../content/drills.js';
import { parseKeyScript, parseKeySpec } from '../engine/keyboard.js';
import { dailyFor } from '../app/daily.js';
import { RAPID_DECK } from '../app/rapid-fire.js';
import { tierFor } from '../app/pars.js';
import { applyEvent, SCHEDULE_KEY } from '../app/schedule.js';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const HERE = fileURLToPath(new URL('.', import.meta.url));
const CLIPS_DIR = resolve(HERE, '..', 'clips');
const args = process.argv.slice(2);
const checkAt = args.indexOf('--check');
const CHECK_DIR = checkAt >= 0 ? resolve(args[checkAt + 1] || 'clip-check') : null;
const wanted = args.filter((a, i) => !a.startsWith('--') && (checkAt < 0 || i !== checkAt + 1));

/* ---------------- the local server and the browser ---------------- */
const port = await new Promise((ok, no) => { const s = createServer(); s.once('error', no); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => ok(p)); }); });
const server = spawn(process.execPath, [join(HERE, 'serve.js')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
const ORIGIN = `http://127.0.0.1:${port}`;
const BASE = `${ORIGIN}/app2/index.html`;
for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE)).ok) break; } catch (e) { /* not up yet */ } await new Promise(r => setTimeout(r, 100)); }
const browser = await chromium.launch();
const done = async code => { await browser.close().catch(() => {}); server.kill(); process.exit(code); };

/** The ffmpeg Playwright ships for its own videos (mjpeg in, VP8 out, crop is all this needs), else one on PATH. */
function findFfmpeg() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join(homedir(), '.cache', 'ms-playwright'), join(homedir(), 'Library', 'Caches', 'ms-playwright'), join(homedir(), 'AppData', 'Local', 'ms-playwright')].filter(Boolean);
  for (const r of roots) {
    if (!existsSync(r)) continue;
    for (const d of readdirSync(r).filter(n => /^ffmpeg[-_]\d+$/.test(n)).sort().reverse()) {
      const bin = ['ffmpeg-linux', 'ffmpeg-mac', 'ffmpeg-win64.exe', 'ffmpeg'].map(b => join(r, d, b)).find(existsSync);
      if (bin) return bin;
    }
  }
  return spawnSync('ffmpeg', ['-version']).status === 0 ? 'ffmpeg' : null;
}
const FFMPEG = findFfmpeg();
if (!FFMPEG) { console.error('no ffmpeg: run `npx playwright install ffmpeg` (or put ffmpeg on PATH)'); await done(1); }

/* ---------------- the learner the clips show ---------------- */
const DAY = new Date().toISOString().slice(0, 10);   // the records day-bucket (UTC), as app/records.js dayOf
const NOW = Date.now();
const PREFS = { platform: 'win', firstRunDone: true, briefingDone: true, mute: true, installPromptAt: NOW - 86400e3, beatsSeen: ['open-and-set-up', 'move-and-select'] };
/** Mid-chapter: module 1.1 done and its challenge passed, 1.2 under way. */
const done1 = () => ({ completed: true, at: NOW - 86400e3 });
const PROGRESS = { lessons: {
  'inherited-workbook': done1(), 'ribbon-by-keyboard': done1(), 'analyst-setup': done1(), 'colour-label-hardcode': done1(),
  'challenge-inherited-file': { completed: true, challenge: true, tier: 'pass', best: 96.4, at: NOW - 86400e3 },
  'jump-dont-scroll': done1(), 'select-like-you-mean-it': { started: true, at: NOW - 3600e3 },
}, chapters: {} };
/**
 * The boards' clean runs: drills only. A challenge board's middle column reads keys/~optimalKeys, and
 * the challenge drills carry no optimalKeys (it would print "~undefined"), so those boards stay empty,
 * which is also true of a learner in 1.2. Times sit around the pars; tiers come from the real rule.
 */
function boardRecords() {
  const runs = { 'weekly-sales-report': [24.6, 27.9, 34.2], 'edge-jumps': [3.48, 3.91, 4.62], 'go-anywhere': [7.84, 9.16], 'select-blocks': [2.71, 3.35, 3.9],
    'type-the-column': [12.6, 14.4], 'find-and-fix': [17.9, 22.3], 'fill-factory': [13.8, 15.2, 19.7], 'row-wrangler': [11.5, 13.1] };
  const attempts = []; const pbs = {}; let n = 0;
  for (const [ref, times] of Object.entries(runs)) {
    const d = drillById(ref);
    times.forEach((secs, i) => {
      const keys = d.optimalKeys + i * 2 + (secs > d.pars.legendary ? 1 : 0);
      const at = NOW - (times.length - i) * 5400e3 - n * 600e3;
      const a = { id: `clip-${++n}`, kind: 'drill', ref, day: new Date(at).toISOString().slice(0, 10), seed: null, secs, keys, clean: true, helped: false, mouse: 0,
        tier: tierFor(secs, d.pars, { keys, optimalKeys: d.optimalKeys }), first: false, timedOut: false, splits: [], trace: [], at };
      attempts.push(a);
      if (!pbs[ref] || secs < pbs[ref].secs) pbs[ref] = { ref, secs, keys, attemptId: a.id, at };
    });
  }
  const daily = drillById(dailyFor(DAY).drillId);
  if (daily && daily.pars && daily.kind !== 'challenge') {
    [daily.pars.pro * 0.96, daily.pars.pass * 0.9].forEach(s => { const secs = Math.round(s * 100) / 100; attempts.push({ id: `clip-${++n}`, kind: 'daily', ref: daily.id, day: DAY, seed: null, secs, keys: daily.optimalKeys + 4, clean: true, helped: false, mouse: 0, tier: tierFor(secs, daily.pars), first: false, timedOut: false, splits: [], trace: [], at: NOW - n * 60e3 }); });
  }
  return { attempts, pbs, traces: {} };
}
/**
 * Rapid-fire deals the least-remembered shortcuts first (schedule.js rapidOrder). This learner's memory:
 * bold, the edges, Home, copy/cut and undo going stale; the selections, fills and number formats fresh.
 * So a round opens on chords whose effect reads on one cell, before a selection spreads the rest.
 */
function rapidMemory() {
  let s = {};
  s = applyEvent(s, { ids: ['bold-command', 'ctrl-arrow', 'ctrl-home-end', 'copy-cut-paste', 'undo-redo'], q: 3 }, NOW - 3 * 86400e3);
  s = applyEvent(s, { ids: ['ctrl-a', 'row-col-select'], q: 5 }, NOW - 4 * 3600e3);
  return applyEvent(s, { ids: ['fill-down-right', 'number-formats'], q: 5 }, NOW - 3600e3);
}

/* ---------------- keys ---------------- */
const GLYPH = { ' ': 'Space', '↓': 'ArrowDown', '↑': 'ArrowUp', '←': 'ArrowLeft', '→': 'ArrowRight', '↵': 'Enter' };
/** A key spec ("Ctrl+Shift+Up", "Ctrl+↓") as a Playwright chord, the way smoke.mjs presses them. */
function pwKey(spec) {
  const ev = parseKeySpec(spec);
  const mods = []; if (ev.ctrlKey) mods.push('Control'); if (ev.altKey) mods.push('Alt'); if (ev.shiftKey) mods.push('Shift');
  let key = ev.key;
  if (key.length === 1 && ev.shiftKey && /[A-Z]/.test(key)) key = key.toLowerCase();
  if (GLYPH[key]) key = GLYPH[key];
  return [...mods, key].join('+');
}

/* ---------------- the six clips ---------------- */
// vp: the page's viewport (CSS px; desktop, clear of the narrow-screen notice). scale: the output size over
// the viewport. crop: [x, y, w, h] of the viewport the clip keeps (default: all of it). budget: KB.
// Each drive() presses keys as a learner would; k.start() trims what came before, k.poster() picks the still.
const CLIPS = {
  // Lessons (wide, 2:1): 1.1.1 on the full Ribbon. The slow walk down (60 x Down) plays before the clip
  // starts; the clip lands the next four goals (jump, select, the tab tour, a rename by KeyTips), each
  // ticking on the floating card.
  lesson: { route: '#/lesson/inherited-workbook', vp: [1280, 640], scale: 0.75, ready: '.lesson-panel .task-goal', budget: 600, async drive(k) {
    for (let i = 0; i < 60; i++) await k.press('Down', 10);
    await k.hold(1100); k.start();
    await k.hold(500);
    await k.play('Ctrl+Home', 380); await k.play('Ctrl+Down', 800);
    await k.play('Shift+Up Shift+Up Ctrl+Shift+Up', 260); await k.hold(600);
    await k.play('Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Down Down Down Ctrl+Right', 190); await k.hold(200); k.poster(); await k.hold(500);
    await k.play('Ctrl+PgUp Ctrl+PgUp Alt H O R', 240); await k.play('"Inputs"', 55, 55); await k.hold(150); await k.play('Enter', 1100);
  } },
  // Challenges: 1.1.C's clock starts on the first key; the tabs, the gridlines and the units land, struck off
  // the card's list. Framed on the card's side of the workspace: the card, the Ribbon's right half, the keycaps.
  challenge: { route: '#/lesson/challenge-inherited-file', vp: [1280, 800], scale: 0.7, crop: [420, 88, 820, 712], ready: '.lesson-panel .task-list', async drive(k) {
    await k.hold(700);
    const steps = parseKeyScript(LESSONS.find(l => l.id === 'challenge-inherited-file').solution);
    const upTo = steps.findIndex(s => s.type === 'text' && /USD/.test(s.text)) + 2;   // through the units line's Enter
    await k.steps(steps.slice(0, upTo), 135, 32);
    await k.hold(650); k.poster(); await k.hold(450);
  } },
  // Drills: the start card, the key that starts the clock, the run, the result card.
  drill: { route: '#/drill/edge-jumps', vp: [1280, 800], scale: 0.625, ready: '.start-card', async drive(k) {
    await k.hold(1300);
    await k.press('Space', 450);
    await k.play('Ctrl+Down Ctrl+Right', 480); await k.press('Ctrl+G', 520); await k.play('"B40"', 60, 90); await k.hold(300);
    k.poster(); await k.press('Enter', 520); await k.press('Ctrl+Home', 0);
    await k.hold(2600);
  } },
  // The Daily: its start card, then the first keys of today's drill, stopping on a committed step.
  daily: { route: '#/daily', vp: [1280, 800], scale: 0.625, ready: '.start-card, .lesson-panel', async drive(k) {
    const pick = drillById(dailyFor(DAY).drillId);
    const steps = parseKeyScript(pick.kind === 'challenge' ? pick.lesson.solution : pick.solution);
    await k.hold(1500);
    if (await k.page.$('.start-card')) await k.press('Space', 450);
    const t0 = Date.now();
    const committed = i => i > 0 && steps[i - 1].type === 'press' && /^Enter$/.test(steps[i - 1].spec);
    await k.steps(steps, 190, 45, i => { if (i === 8) k.poster(); }, i => Date.now() - t0 > 6500 || (Date.now() - t0 > 4000 && committed(i)));
    await k.hold(1100);
  } },
  // Rapid-fire: pick a length, then prompt after prompt answered, the combo building. The page's footer is
  // cropped off; the seeded memory puts the selection prompts last, so the sheet stays readable.
  rapid: { route: '#/rapid', vp: [1280, 700], scale: 0.6, crop: [0, 0, 1280, 676], ready: '.rapid-durs', schedule: true, async drive(k) {
    await k.hold(1100);
    await k.press('1', 500);
    for (let i = 0; i < 10; i++) {
      const text = await k.page.evaluate(() => (document.querySelector('#rfInstr') || {}).textContent || '');
      const card = RAPID_DECK.find(d => d.text === text);
      if (!card) break;
      await k.play(card.keys, 90);
      if (i === 6) k.poster();
      await k.hold(330);
    }
    await k.hold(700);
  } },
  // Boards (wide, 2:1): the Benchmark boards with this learner's clean times, a gentle scroll down and back.
  boards: { route: '#/leaderboard', vp: [1280, 640], scale: 0.75, ready: '.boards .board', records: true, async drive(k) {
    await k.hold(900); k.poster(); await k.hold(600);
    await k.scroll(300, 1800); await k.hold(1700);
    await k.scroll(-300, 1500); await k.hold(1000);
  } },
};

/* ---------------- recording ---------------- */
const even = n => Math.max(2, Math.round(n / 2) * 2);
const kb = f => Math.round(statSync(f).size / 1024);

async function record(name, spec) {
  const [vw, vh] = spec.vp;
  const size = { width: even(vw * spec.scale), height: even(vh * spec.scale) };
  const context = await browser.newContext({ viewport: { width: vw, height: vh }, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    let origin; try { origin = new URL(route.request().url()).origin; } catch (e) { return route.abort('blockedbyclient'); }
    return origin === ORIGIN ? route.continue() : route.abort('blockedbyclient');
  });
  const seed = { prefs: PREFS, progress: PROGRESS, records: spec.records ? boardRecords() : null, schedule: spec.schedule ? rapidMemory() : null, scheduleKey: SCHEDULE_KEY };
  await context.addInitScript(s => {
    // seed once per tab: the app's own writes during the clip must survive a reload
    if (!sessionStorage.getItem('hk_clip_seeded')) {
      sessionStorage.setItem('hk_clip_seeded', '1');
      localStorage.clear();
      localStorage.setItem('hk2_prefs', JSON.stringify(s.prefs));
      localStorage.setItem('hk2_progress_v1', JSON.stringify(s.progress));
      if (s.records) localStorage.setItem('hk2_records_v1', JSON.stringify(s.records));
      if (s.schedule) localStorage.setItem(s.scheduleKey, JSON.stringify(s.schedule));
    }
    // a goal the platform demonstrates ("watching · Esc skips") is skipped the moment it appears, as smoke.mjs does
    const skip = () => { if (document.querySelector('.goal-demo')) (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); };
    const start = () => new MutationObserver(skip).observe(document.documentElement, { subtree: true, childList: true });
    if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
  }, seed);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + spec.route);
  await page.waitForSelector(spec.ready, { timeout: 8000 });
  await page.waitForTimeout(350);   // fonts and the card's first dock settle
  if (await page.evaluate(() => /wider screen/.test(document.body.innerText))) throw new Error(`${name}: the page shows the narrow-screen notice at ${vw}x${vh}`);

  // The screencast, scaled to the output size in the browser. Each frame keeps its swap time, so the
  // clip is resampled to a steady 25 fps in real time. (Context recordVideo counts every frame as at
  // least 1/25 s, which stretches any animation into slow motion and drifts the trim points by seconds.)
  const cdp = await context.newCDPSession(page);
  const shots = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    shots.push({ t: metadata.timestamp || Date.now() / 1000, jpg: Buffer.from(data, 'base64') });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: size.width, maxHeight: size.height });
  for (let i = 0; i < 40 && !shots.length; i++) await page.waitForTimeout(25);
  let from = Date.now() / 1000, posterAt = null;
  const k = {
    page,
    /** The clip starts here (default: once the page is ready); what came before is trimmed off. */
    start() { from = Date.now() / 1000; },
    hold: ms => page.waitForTimeout(ms),
    async press(key, gap = 150) { await page.keyboard.press(pwKey(key)); if (gap) await page.waitForTimeout(gap); },
    async steps(list, gap, typeDelay, onStep, stop) {
      for (let i = 0; i < list.length; i++) {
        if (stop && stop(i)) break;
        const s = list[i];
        if (s.type === 'text') await page.keyboard.type(s.text, { delay: typeDelay });
        else await page.keyboard.press(pwKey(s.spec));
        await page.waitForTimeout(gap);
        if (onStep) onStep(i);
      }
    },
    play(script, gap = 150, typeDelay = 45) { return k.steps(parseKeyScript(script), gap, typeDelay); },
    /** Scroll the page by dy over ms, eased, the way a trackpad glides. */
    scroll: (dy, ms) => page.evaluate(({ dy, ms }) => new Promise(ok => {
      const y0 = scrollY, t0 = performance.now();
      const step = t => { const p = Math.min(1, (t - t0) / ms), e = p < 0.5 ? 2 * p * p : 1 - (2 - 2 * p) ** 2 / 2; scrollTo(0, y0 + dy * e); if (p < 1) requestAnimationFrame(step); else ok(); };
      requestAnimationFrame(step);
    }), { dy, ms }),
    /** This moment is the poster. */
    poster() { posterAt = Date.now() / 1000; },
  };
  await spec.drive(k);
  const to = Date.now() / 1000;
  await cdp.send('Page.stopScreencast').catch(() => {});
  await context.close();
  if (errors.length) console.log(`  ${name}: page errors: ${errors.join(' | ')}`);
  if (!shots.length) throw new Error(`${name}: the screencast sent no frames`);

  // resample: every 1/25 s from `from` to `to`, the newest frame shown by then
  const FPS = 25;
  const at = t => { let f = shots[0]; for (const s of shots) { if (s.t <= t) f = s; else break; } return f; };
  const seq = [];
  for (let t = from; t < to; t += 1 / FPS) seq.push(at(t).jpg);
  const input = Buffer.concat(seq);

  // crop to the frame, encode VP8 to the budget
  const crop = spec.crop || [0, 0, vw, vh];
  const s = size.width / vw;
  const cw = even(crop[2] * s), ch = even(crop[3] * s), cx = Math.round(crop[0] * s), cy = Math.round(crop[1] * s);
  const out = join(CLIPS_DIR, `${name}.webm`);
  const budget = (spec.budget || 400) * 1024;
  let crf = 22, bytes = Infinity;   // constant quality (-b:v 0): the lowest crf that fits the budget
  while (bytes > budget && crf < 52) {
    crf += 4;
    const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', 'pipe:0',
      '-vf', `crop=${cw}:${ch}:${cx}:${cy}`, '-an', '-c:v', 'libvpx', '-crf', String(crf), '-b:v', '0', '-qmin', '2', '-qmax', '52',
      '-deadline', 'good', '-cpu-used', '1', '-auto-alt-ref', '1', '-lag-in-frames', '16', '-g', '250', out], { input, maxBuffer: 1 << 26 });
    if (r.status !== 0) throw new Error(`${name}: ffmpeg failed: ${r.stderr}`);
    bytes = statSync(out).size;
  }

  // the poster: the noted moment's frame, at the clip's framing and output size
  const jpg = join(CLIPS_DIR, `${name}.jpg`);
  const still = at(posterAt != null ? posterAt : to).jpg;
  const pp = await browser.newPage({ viewport: { width: cw, height: ch } });
  await pp.setContent(`<body style="margin:0;overflow:hidden"><img style="position:absolute;left:${-cx}px;top:${-cy}px" src="data:image/jpeg;base64,${still.toString('base64')}"></body>`);
  await pp.waitForFunction(() => document.images[0].complete);
  writeFileSync(jpg, await pp.screenshot({ type: 'jpeg', quality: 78 }));
  await pp.close();
  console.log(`${name}: ${(to - from).toFixed(1)}s ${cw}x${ch} ${kb(out)} KB (crf ${crf}), ${shots.length} frames, poster at ${posterAt != null ? (posterAt - from).toFixed(1) + 's' : 'the end'} ${kb(jpg)} KB`);
}

/* ---------------- the look: frames of each clip, and the landing ---------------- */
async function frames(name, dir) {
  // serve.js answers no Range requests, so a <video> on it cannot seek: play it from a blob instead
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await page.goto(`${ORIGIN}/app2/clips/`);   // any same-origin page will do (this one is serve.js's 404)
  await page.setContent('<body style="margin:0;background:#888"><video id="v" muted playsinline preload="auto"></video></body>');
  await page.evaluate(async url => { const b = await (await fetch(url)).blob(); document.getElementById('v').src = URL.createObjectURL(b); }, `/app2/clips/${name}.webm?t=${Date.now()}`);
  await page.waitForFunction(() => document.getElementById('v').readyState >= 2, null, { timeout: 8000 });
  const dur = await page.evaluate(() => document.getElementById('v').duration);
  const at = [0.5, dur * 0.25, dur * 0.5, dur * 0.75, Math.max(0, dur - 0.08)];
  for (const [i, t] of at.entries()) {
    await page.evaluate(t => new Promise(ok => { const v = document.getElementById('v'); v.onseeked = () => requestAnimationFrame(() => requestAnimationFrame(ok)); v.currentTime = t; }), t);
    await (await page.$('#v')).screenshot({ path: join(dir, `${name}-${i}-${t.toFixed(1)}s.png`) });
  }
  await page.close();
  return dur;
}

async function landing(dir) {
  for (const [w, h] of [[1440, 900], [1280, 800]]) {
    for (const motion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: motion, serviceWorkers: 'block' });
      await context.route('**/*', r => new URL(r.request().url()).origin === ORIGIN ? r.continue() : r.abort('blockedbyclient'));
      const page = await context.newPage();
      await page.goto(BASE + '#/landing');
      await page.waitForSelector('#lModes .ld2-clip');
      await page.evaluate(() => document.querySelector('#lModes').scrollIntoView());
      await page.waitForTimeout(motion === 'reduce' ? 800 : 3200);
      await (await page.$('#lModes')).screenshot({ path: join(dir, `landing-${w}x${h}-${motion === 'reduce' ? 'posters' : 'playing'}.png`) });
      await context.close();
    }
  }
}

try {
  const names = wanted.length ? wanted : Object.keys(CLIPS);
  const bad = names.filter(n => !CLIPS[n]);
  if (bad.length) { console.error(`unknown clip: ${bad.join(', ')} (have ${Object.keys(CLIPS).join(', ')})`); await done(1); }
  mkdirSync(CLIPS_DIR, { recursive: true });
  if (!args.includes('--no-record')) for (const n of names) await record(n, CLIPS[n]);
  if (CHECK_DIR) {
    mkdirSync(CHECK_DIR, { recursive: true });
    for (const n of names) console.log(`${n}: frames of ${(await frames(n, CHECK_DIR)).toFixed(1)}s in ${CHECK_DIR}`);
    await landing(CHECK_DIR);
    console.log(`landing: the modes section at 1440x900 and 1280x800, playing and as posters, in ${CHECK_DIR}`);
  }
  await done(0);
} catch (e) {
  console.error(e && e.stack || e);
  await done(1);
}
