'use strict';
// Dedicated baseline: at most two independent platforms; first migration error stops.
const fs = require('node:fs');
const path = require('node:path');
const { replayInstance, cleanupReplay, context } = require('./platform-bootstrap');
const { main: guardedRunner, manifest, sanitizedError } = require('./run-isolated');

function mayTrySecond(report) {
  return report?.cleanup === 'PASS' && report?.baseline?.replayComplete === true
    && !report.baseline.testError && report.baseline.phase === 'complete'
    && (report.result === 'PASS' || report.baseline.assertionFailures === true);
}
function classify(attempts) {
  const reproducible = attempts.length === 2 && attempts.every(r => r.baseline?.replayComplete && r.baseline.completedMigrations.length === 52 && r.cleanup === 'PASS');
  const permissionsPassed = attempts.length === 2 && attempts.every(r => r.result === 'PASS'
    && r.baseline?.tests.length === 1 && r.baseline.tests[0].total === 56 && !r.baseline.tests[0].failures.length);
  return { reproducible, permissionsPassed, result:reproducible && permissionsPassed ? 'PASS' : 'FAIL' };
}
async function main(args, env = process.env) {
  if (args.length !== 1 || !['--plan','--run','--cleanup'].includes(args[0])) throw new Error('Usage: replay-baseline.js --plan | --run | --cleanup');
  const files = manifest();
  if (files.filter(f=>f.file.startsWith('supabase/migrations/')).length !== 52
      || files.filter(f=>f.file.startsWith('supabase/tests/database/')).length !== 1) throw new Error('Expected reviewed 52 migrations and one unchanged permission suite');
  if (args[0] === '--plan') { console.log(JSON.stringify({freshInstances:2,expectedAssertionsPerInstance:56,files},null,2)); return; }
  const ctx = context(env,1);
  if (args[0] === '--cleanup') { await cleanupReplay(env); return; }
  const output = path.dirname(ctx.output);
  fs.mkdirSync(output,{recursive:true});
  const attempts = [];
  let failure;
  for (const iteration of [1,2]) {
    try {
      const result = await replayInstance(iteration, (name, report) => {
        const baseline = report.baseline = {};
        try {
          guardedRunner(['--container',name,'--replay'],baseline);
          if (baseline.tests.length !== 1 || baseline.tests[0].total !== 56) throw new Error('Expected exactly 56 complete permission assertions');
        } finally {
          report.hotkeyMigrationsExecuted = baseline.completedMigrations?.length || 0;
          report.hotkeyMigrationFailed = baseline.failedMigration?.file || null;
          report.permissionAssertionsExecuted = baseline.tests?.length
            ? baseline.tests.reduce((n,t)=>n+t.total,0) : baseline.testsStarted ? null : 0;
        }
      },env);
      attempts.push(result);
    } catch (error) {
      failure ||= error;
      attempts.push(error.platformReport || {result:'FAIL',error:sanitizedError(error.message),cleanup:'UNVERIFIED'});
    }
    // Assertion failures stay failures, but a completed replay can be repeated on
    // one NEW platform. Migration/setup/fixture/cleanup errors stop immediately.
    if (!mayTrySecond(attempts.at(-1))) break;
  }
  const result = {source:env.GITHUB_SHA,runId:env.GITHUB_RUN_ID,attempt:env.GITHUB_RUN_ATTEMPT,
    ...classify(attempts),freshInstancesAttempted:attempts.length,instances:attempts};
  fs.writeFileSync(path.join(output,'baseline-result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
  if (failure || result.result !== 'PASS') throw new Error('Isolated baseline failed; see exact first failure and recorded results. No failure was suppressed.');
}
module.exports = { main, mayTrySecond, classify };
if (require.main === module) main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
