'use strict';
const net = require('node:net');

function loopbackOrigin(target) {
  const url = new URL(target);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Browser test target must use http(s), got ${url.protocol}`);
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const ip = net.isIP(hostname);
  const loopback = hostname === 'localhost' || hostname === '::1' ||
    (ip === 4 && hostname.split('.')[0] === '127');
  if (!loopback) throw new Error(`Browser test target must be loopback, got ${url.origin}`);
  return url.origin;
}

async function newIsolatedContext(browser, target, options = {}) {
  const origin = loopbackOrigin(target);
  if (options.serviceWorkers && options.serviceWorkers !== 'block') {
    throw new Error('Browser test contexts must block service workers');
  }
  const context = await browser.newContext({ ...options, serviceWorkers: 'block' });
  // route.continue() follows redirects without re-running this handler. Fetch one
  // response without following redirects, fail closed on every redirect, and only
  // fulfill non-redirect responses from the exact local origin.
  await context.route('**/*', async route => {
    let requestOrigin;
    try { requestOrigin = new URL(route.request().url()).origin; } catch (_) { return route.abort('blockedbyclient'); }
    if (requestOrigin !== origin) return route.abort('blockedbyclient');
    let response;
    try { response = await route.fetch({ maxRedirects: 0 }); } catch (_) { return route.abort('failed'); }
    if (response.status() >= 300 && response.status() < 400) return route.abort('blockedbyclient');
    return route.fulfill({ response });
  });
  if (typeof context.routeWebSocket === 'function') {
    await context.routeWebSocket('**/*', socket => socket.close());
  }
  return context;
}

module.exports = { loopbackOrigin, newIsolatedContext };
