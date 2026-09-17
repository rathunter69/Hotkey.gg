'use strict';
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const base = 'origin/main';
console.log('# Branch inventory\n');
console.log(`Local remote-ref snapshot, generated ${new Date().toISOString().slice(0, 10)}.`);
console.log(`Baseline: ${base} at ${git('rev-parse', base)}. This command does not fetch or modify branches.\n`);
console.log('Refresh with `git fetch origin` before using this report for branch reconciliation.');
console.log('Ahead/behind measures commit ancestry, not whether a squash-merged feature already exists.');
console.log('Patch-equivalent commits are detected with `git cherry`; remaining commits still need semantic review.\n');
console.log('| Branch | Behind main | Ahead | Patch-equivalent | Other commits | Disposition |');
console.log('|---|---:|---:|---:|---:|---|');
const details = [];
for (const ref of git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin').split('\n')) {
  if (ref === base || ref === 'origin' || ref.endsWith('/HEAD')) continue;
  const [behind, ahead] = git('rev-list', '--left-right', '--count', `${base}...${ref}`).split(/\s+/).map(Number);
  const cherry = ahead ? git('cherry', base, ref).split('\n') : [];
  const equivalent = cherry.filter(s => s.startsWith('-')).length;
  const other = cherry.filter(s => s.startsWith('+')).length;
  const disposition = !ahead ? 'Contained in main' : !other ? 'Patch-equivalent; confirm before retiring' : 'Review before reuse or retirement';
  console.log(`| ${ref} | ${behind} | ${ahead} | ${equivalent} | ${other} | ${disposition} |`);
  if (ahead) details.push(`\n## ${ref}\n\nTip: ${git('rev-parse', ref)}\n\nRecent branch-only commits:\n\n` +
    git('log', '--max-count=5', '--format=- %h %cs %s', `${base}..${ref}`));
}
console.log(details.join('\n'));
