'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createServer } = require('./serve');
const root = path.resolve(__dirname, '..');
const suites = {
  static: [
    ['dev/check-syntax.js'],
    ['dev/check-cache-versions.js'],
    ['dev/check-invariants.js'],
    ['dev/check-curriculum-map.js'],
    ['dev/check-curriculum-map.js', '--v5'],
    ['dev/check-outbox.js'],
    ['--test', 'dev/tooling.test.js'],
  ],
  smoke: [
    ['dev/e2e-account-isolation.js'],
    ['dev/e2e-smoke.js'], ['dev/e2e-lb.js'],
    ['dev/check-landing.js'], ['dev/check-paywall.js'],
    ['dev/e2e-demo-replay.js', 'navigation', 'combo', 'foot'],
  ],
};

async function main() {
  const mode = process.argv[2] || 'static';
  let checks = suites[mode];
  if (mode === 'browser') {
    const [file, ...args] = process.argv.slice(3);
    if (!file || !/^dev\/[a-z0-9-]+\.(?:js|mjs)$/.test(file) || !fs.existsSync(path.join(root, file))) {
      throw new Error('Usage: npm run test:browser -- dev/e2e-formulas.js [arguments]');
    }
    checks = [[file, ...args]];
  }
  if (!checks) throw new Error(`Unknown suite: ${mode}`);
  const env = { ...process.env };
  let server;
  try {
    if (mode !== 'static') {
      const { chromium } = require('playwright-core');
      env.CHROME = env.CHROME || chromium.executablePath();
      if (!fs.existsSync(env.CHROME)) throw new Error('Chromium missing. Run npm run browser:install or set CHROME.');
      // Legacy harnesses include hard-coded port 8791. Own that port or fail;
      // never silently test a server from another checkout.
      server = createServer();
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(8791, '127.0.0.1', resolve);
      });
      env.BASE = 'http://127.0.0.1:8791';
      env.URL = env.BASE + '/index.html';
      env.REPS = env.REPS || '1';
    }
    for (const args of checks) {
      console.log(`\nRunning ${args.join(' ')}`);
      // URL-based harnesses target the trainer except for the leaderboard suite.
      const checkEnv = mode !== 'static' && args[0] === 'dev/e2e-lb.js'
        ? { ...env, URL: env.BASE + '/leaderboard.html' } : env;
      const code = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, { cwd: root, env: checkEnv, stdio: 'inherit' });
        child.once('error', reject);
        child.once('exit', code => resolve(code === null ? 1 : code));
      });
      if (code !== 0) { process.exitCode = code; return; }
    }
    console.log(`\n${mode.toUpperCase()}: all ${checks.length} checks passed`);
  } finally {
    if (server?.listening) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
