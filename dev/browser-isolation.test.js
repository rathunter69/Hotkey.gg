'use strict';
const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const { chromium } = require('playwright-core');
const { loopbackOrigin, newIsolatedContext } = require('./browser-isolation');

async function listen(handler) {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return server;
}

async function close(server) {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}

test('loopbackOrigin rejects targets outside the local test machine', () => {
  assert.equal(loopbackOrigin('http://127.0.0.1:8791/index.html'), 'http://127.0.0.1:8791');
  assert.equal(loopbackOrigin('http://localhost:8791/'), 'http://localhost:8791');
  assert.throws(() => loopbackOrigin('https://www.hotkey.gg/'), /must be loopback/);
  assert.throws(() => loopbackOrigin('http://192.168.1.10:8791/'), /must be loopback/);
});

test('isolated contexts allow their exact origin and block SDK, direct, and redirected cross-origin requests', async t => {
  const sinkHits = [];
  const allowedHits = [];
  const sink = await listen((req, res) => {
    sinkHits.push(req.url);
    res.writeHead(200, { 'content-type': 'application/javascript', 'access-control-allow-origin': '*' });
    res.end('window.__externalSdkLoaded = true;');
  });
  const sinkOrigin = `http://127.0.0.1:${sink.address().port}`;
  const allowed = await listen((req, res) => {
    allowedHits.push(req.url);
    if (req.url === '/allowed.js') {
      res.writeHead(200, { 'content-type': 'application/javascript' });
      res.end('window.__allowedScriptLoaded = true;');
      return;
    }
    if (req.url === '/allowed-fetch') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"ok":true}');
      return;
    }
    if (req.url === '/redirect-to-sink') {
      res.writeHead(302, { location: sinkOrigin + '/redirected-fetch' });
      res.end();
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><script src="/allowed.js"></script><script src="${sinkOrigin}/npm/@supabase/supabase-js.js"></script>`);
  });
  const allowedOrigin = `http://127.0.0.1:${allowed.address().port}`;
  let browser;
  t.after(async () => {
    if (browser) await browser.close();
    await close(allowed);
    await close(sink);
  });

  const executablePath = process.env.CHROME || chromium.executablePath();
  browser = await chromium.launch({ executablePath, headless: true });

  for (let i = 0; i < 2; i++) {
    const context = await newIsolatedContext(browser, allowedOrigin);
    const page = await context.newPage();
    await page.goto(allowedOrigin + '/');
    const result = await page.evaluate(async sinkUrl => {
      const allowed = await fetch('/allowed-fetch').then(r => r.json());
      const direct = await fetch(sinkUrl + '/direct-fetch').then(() => 'reached', () => 'blocked');
      const redirected = await fetch('/redirect-to-sink').then(() => 'reached', () => 'blocked');
      return { allowed, direct, redirected, allowedScript: window.__allowedScriptLoaded, externalSdk: window.__externalSdkLoaded };
    }, sinkOrigin);
    assert.deepEqual(result.allowed, { ok: true });
    assert.equal(result.direct, 'blocked');
    assert.equal(result.redirected, 'blocked');
    assert.equal(result.allowedScript, true);
    assert.equal(result.externalSdk, undefined);
    await context.close();
  }

  assert.equal(sinkHits.length, 0, `different-origin sink was reached: ${sinkHits.join(', ')}`);
  assert.equal(allowedHits.filter(path => path === '/allowed-fetch').length, 2);
  assert.equal(allowedHits.filter(path => path === '/allowed.js').length, 2);
  assert.equal(allowedHits.filter(path => path === '/redirect-to-sink').length, 2);
});
