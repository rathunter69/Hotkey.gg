'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

// Local preview only; Cloudflare continues to serve the static repository in production.
function createServer() {
  return http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405); res.end(); return;
    }
    let parts;
    try { parts = decodeURIComponent(req.url.split('?')[0]).replace(/\\/g, '/').split('/'); }
    catch { res.writeHead(400); res.end(); return; }
    if (parts.some(p => p.startsWith('.') || p.includes(':') || p.includes('\0'))) {
      res.writeHead(403); res.end(); return;
    }
    let file = path.resolve(root, ...parts.filter(Boolean));
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403); res.end(); return;
    }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      const data = fs.readFileSync(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Content-Length': data.length });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
}

module.exports = { createServer };
if (require.main === module) {
  const port = Number(process.env.PORT || 8791);
  const server = createServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Hotkey.gg: http://127.0.0.1:${port} (${root})`));
}
