'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const readSource = require('./read-source');
const { createServer } = require('./serve');

test('the lockfile pins every declared development dependency', () => {
  const pkg = require('../package.json');
  const lock = require('../package-lock.json');
  assert.equal(lock.lockfileVersion, 3);
  assert.deepEqual(lock.packages[''].devDependencies, pkg.devDependencies);
  for (const [name, version] of Object.entries(pkg.devDependencies)) {
    assert.match(version, /^\d+\.\d+\.\d+$/);
    assert.equal(lock.packages['node_modules/' + name].version, version);
    assert.match(lock.packages['node_modules/' + name].integrity, /^sha512-/);
  }
});

test('source guards receive identical text from LF and CRLF files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hotkey-source-'));
  try {
    for (const eol of ['\n', '\r\n']) {
      const file = path.join(dir, eol.length + '.js');
      fs.writeFileSync(file, ['// retired drill', 'steps: [', ']', ''].join(eol));
      assert.equal(readSource(file), '// retired drill\nsteps: [\n]\n');
    }
  } finally {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith('hotkey-source-'));
    fs.rmSync(dir, { recursive: true });
  }
});

test('preview serves pages and denies dotfiles, traversal and writes', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const request = (url, method = 'GET') => new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: server.address().port, path: url, method }, res => {
      res.resume(); res.on('end', () => resolve(res));
    });
    req.on('error', reject); req.end();
  });
  try {
    for (const url of ['/', '/drills/', '/drills.js?v=307']) assert.equal((await request(url)).statusCode, 200);
    assert.equal((await request('/')).headers['cache-control'], 'no-store');
    assert.equal((await request('/index.html', 'HEAD')).statusCode, 200);
    for (const url of ['/.git/config', '/.env', '/%2e%2e/package.json', '/%2e%2e%5cpackage.json']) {
      assert.equal((await request(url)).statusCode, 403);
    }
    assert.equal((await request('/%zz')).statusCode, 400);
    assert.equal((await request('/missing-file')).statusCode, 404);
    assert.equal((await request('/', 'POST')).statusCode, 405);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
