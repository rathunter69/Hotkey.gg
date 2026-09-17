'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');
process.chdir(root);
let blocks = 0;
let scripts = 0;

for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|application\/ld\+json/i.test(match[1]) || !match[2].trim()) continue;
    new vm.Script(match[2], { filename: `${file}:inline-${++blocks}` });
  }
}
for (const dir of ['.', 'dev']) {
  for (const file of fs.readdirSync(dir).filter(f => /\.(?:js|mjs)$/.test(f))) {
    const result = spawnSync(process.execPath, ['--check', path.join(dir, file)], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
    scripts++;
  }
}
console.log(`SYNTAX: ${blocks} inline blocks and ${scripts} JavaScript files passed`);
