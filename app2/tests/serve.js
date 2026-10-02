// npm run serve — tiny static server for local browser checks. Dev tooling only, no dependencies.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteHeaders } from './headers-file.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const port = Number(process.env.PORT || 8080);
// The site-wide headers from app2/_headers (the CSP above all), so a local run and the browser smoke
// load every page under the policy hotkey.gg serves: a script the policy would block fails here too.
const SITE = siteHeaders();
createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    let file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    // a root-absolute path outside /app2/ (404.html's /ui/fonts, /favicon.ico) is the published site's
    // root, which is app2/: serve it from there, as Pages does
    let body;
    try { body = await readFile(file); } catch (e) {
      if (p.startsWith('/app2/')) throw e;
      file = normalize(join(root, 'app2', p));
      if (!file.startsWith(join(root, 'app2'))) throw e;
      body = await readFile(file);
    }
    res.writeHead(200, { ...SITE, 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) { res.writeHead(404); res.end('not found'); }
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} at http://127.0.0.1:${port}/app2/`));
