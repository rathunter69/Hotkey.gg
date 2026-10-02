// Re-takes the landing demo's poster (app2/clips/demo-compact.jpg): the still the landing paints at once
// while the live demo (ui/demo-player.js) loads, and keeps if it never arrives (ui/demo-poster.js). The
// still is the demo's own last frame (4 / 4), taken from the live player on the landing at 1440 by 900,
// at the poster's real size. A dev tool: the gate never runs it.
//   node app2/tests/record-clips.mjs                 re-take the poster
//   node app2/tests/record-clips.mjs --check <dir>   also write the landing's hero (live and poster) and the
//                                                    whole page at 1440x900 and 1280x800 into <dir> to look at
//   add --no-record to only check the poster already in app2/clips/
// The six mode clips the old landing played (lesson, challenge, drill, daily, rapid, boards) were retired
// with it in R1b: the 3.0 landing draws its proof plates from data (app/landing-page.js PLATES).
// It serves the repo on a free loopback port and blocks every other request (fonts, Supabase: nothing
// leaves the machine). Requires Playwright: the global install at /opt/node22/lib/node_modules/playwright,
// or npm i --no-save playwright.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const HERE = fileURLToPath(new URL('.', import.meta.url));
const CLIPS_DIR = resolve(HERE, '..', 'clips');
const args = process.argv.slice(2);
const checkAt = args.indexOf('--check');
const CHECK_DIR = checkAt >= 0 ? resolve(args[checkAt + 1] || 'clip-check') : null;

const port = await new Promise((ok, no) => { const s = createServer(); s.once('error', no); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => ok(p)); }); });
const server = spawn(process.execPath, [join(HERE, 'serve.js')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
const ORIGIN = `http://127.0.0.1:${port}`;
const BASE = `${ORIGIN}/app2/index.html`;
for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE)).ok) break; } catch (e) { /* not up yet */ } await new Promise(r => setTimeout(r, 100)); }
const browser = await chromium.launch();
const done = async code => { await browser.close().catch(() => {}); server.kill(); process.exit(code); };

async function contextAt(w, h, extra = {}) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', ...extra });
  await context.route('**/*', r => new URL(r.request().url()).origin === ORIGIN ? r.continue() : r.abort('blockedbyclient'));
  return context;
}

/** The poster: the live demo played to 4 / 4, its sheet and card area at the size the poster image fills. */
async function poster() {
  const context = await contextAt(1440, 900);
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + '#/landing');
  await page.waitForSelector('#ldDemo .dp:not(.dp-poster) .dp-grid', { timeout: 10000 });
  await page.waitForFunction(() => /^4 \/ 4$/.test((document.querySelector('#demoCount') || {}).textContent || ''), null, { timeout: 90000 });
  await page.waitForTimeout(900);   // the last goal's tick and the card settle
  const out = join(CLIPS_DIR, 'demo-compact.jpg');
  await (await page.$('#ldDemo .dp .dp-grid')).screenshot({ path: out, type: 'jpeg', quality: 82 });
  await context.close();
  if (errors.length) console.log(`  poster: page errors: ${errors.join(' | ')}`);
  console.log(`poster: ${out} ${Math.round(statSync(out).size / 1024)} KB`);
}

/** The landing to look at: the hero with the live demo and with only the poster (the player blocked), and the whole page. */
async function landing(dir) {
  for (const [w, h] of [[1440, 900], [1280, 800]]) {
    const context = await contextAt(w, h);
    const page = await context.newPage();
    await page.goto(BASE + '#/landing');
    await page.waitForSelector('#ldDemo .dp');
    await page.waitForTimeout(3200);
    await page.screenshot({ path: join(dir, `landing-${w}x${h}-live.png`) });
    await page.screenshot({ path: join(dir, `landing-${w}x${h}-page.png`), fullPage: true });
    await context.close();
    const still = await contextAt(w, h);
    await still.route('**/ui/demo-player.js', r => r.abort('failed'));
    const p2 = await still.newPage();
    await p2.goto(BASE + '#/landing');
    await p2.waitForSelector('.dp-poster img');
    await p2.waitForFunction(() => { const i = document.querySelector('.dp-poster img'); return i && i.complete; });
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: join(dir, `landing-${w}x${h}-poster.png`) });
    await still.close();
  }
}

try {
  mkdirSync(CLIPS_DIR, { recursive: true });
  if (!args.includes('--no-record')) await poster();
  if (CHECK_DIR) {
    mkdirSync(CHECK_DIR, { recursive: true });
    await landing(CHECK_DIR);
    console.log(`landing: the hero live and as a poster, and the whole page, at 1440x900 and 1280x800, in ${CHECK_DIR}`);
  }
  await done(0);
} catch (e) {
  console.error(e && e.stack || e);
  await done(1);
}
