'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { mayTrySecond, classify } = require('./replay-baseline');
const { sanitizedError } = require('./run-isolated');
const { context } = require('./platform-bootstrap');
const path = require('node:path');
const complete = () => ({result:'PASS',cleanup:'PASS',baseline:{phase:'complete',replayComplete:true,
  completedMigrations:Array.from({length:52},(_,i)=>String(i)),assertionFailures:false,
  tests:[{total:56,failures:[]}]}});
test('a first migration, fixture, or cleanup failure prevents a second platform attempt',()=>{
  for (const patch of [{replayComplete:false,failedMigration:{file:'first.sql'}},
    {phase:'tests',testError:{complete:false}},{phase:'replay'}]) {
    const r=complete();Object.assign(r.baseline,patch);assert.equal(mayTrySecond(r),false);
  }
  const r=complete();r.cleanup='FAIL';assert.equal(mayTrySecond(r),false);
  assert.equal(mayTrySecond(null),false);
});
test('complete assertion failures can repeat fresh replay but can never produce a green baseline',()=>{
  const r=complete();r.result='FAIL';r.baseline.assertionFailures=true;r.baseline.tests[0].failures=['not ok 1 - denied boundary'];
  assert.equal(mayTrySecond(r),true);
  const short=structuredClone(r);short.baseline.tests[0].total=55;
  assert.equal(mayTrySecond(short),false);
  const missing=structuredClone(r);missing.baseline.completedMigrations.pop();
  assert.equal(mayTrySecond(missing),false);
  assert.deepEqual(classify([r,structuredClone(r)]),{reproducible:true,permissionsPassed:false,result:'FAIL'});
  assert.equal(classify([complete()]).reproducible,false);
  assert.equal(classify([complete(),complete()]).result,'PASS');
  const incomplete=complete();incomplete.baseline.completedMigrations.pop();
  assert.equal(classify([complete(),incomplete]).result,'FAIL');
});
test('error evidence omits SQL context, scheduler payloads and endpoint URLs',()=>{
  const error=sanitizedError('NOTICE: setup\nERROR: 42P01: relation "missing" does not exist\nCONTEXT: SELECT net.http_post(https://production.invalid/private)');
  assert.equal(error,'ERROR: 42P01: relation "missing" does not exist');
  assert.equal(sanitizedError('ERROR: could not contact https://production.invalid/x'),'ERROR: could not contact [redacted-url]');
});
test('replay context permits exactly two isolated instance names on its own branch only',()=>{
  const env={GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'github-hosted',RUNNER_OS:'Linux',RUNNER_ARCH:'X64',
    GITHUB_REPOSITORY:'rathunter69/Hotkey.gg',GITHUB_EVENT_NAME:'push',GITHUB_REF:'refs/heads/codex/security-replay-baseline',
    GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'1',GITHUB_SHA:'a'.repeat(40),RUNNER_TEMP:path.resolve(__dirname,'temp')};
  assert.notEqual(context(env,1).db,context(env,2).db);
  assert.throws(()=>context(env,0));assert.throws(()=>context(env,3));
  assert.throws(()=>context({...env,GITHUB_REF:'refs/heads/main'},1));
});
