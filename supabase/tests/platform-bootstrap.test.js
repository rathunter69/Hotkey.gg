'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { context, validateOwned, validateAuth, dockerEnv, DB_IMAGE, AUTH_IMAGE, PURPOSE } = require('./platform-bootstrap');
const env = { GITHUB_ACTIONS:'true', RUNNER_ENVIRONMENT:'github-hosted', RUNNER_OS:'Linux',RUNNER_ARCH:'X64',
  GITHUB_REPOSITORY:'rathunter69/Hotkey.gg',GITHUB_EVENT_NAME:'push',
  GITHUB_REF:'refs/heads/codex/security-platform-bootstrap',GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'1',
  GITHUB_SHA:'a'.repeat(40),RUNNER_TEMP:path.resolve(__dirname,'temporary-test-path') };
const ctx = context(env), dbId = 'b'.repeat(64);
function container(name,image) {
  return {Name:'/'+name,Config:{Image:image,Labels:{[PURPOSE]:ctx.key,'gg.hotkey.security-test':'disposable-synthetic'},Cmd:['auth','migrate','--config','/dev/null']},
    HostConfig:{NetworkMode:'container:'+dbId,ReadonlyRootfs:true},NetworkSettings:{Networks:{}},Mounts:[]};
}
test('bootstrap refuses production branches, PRs, other repositories, local hosts and injected run names',()=>{
  for (const patch of [{GITHUB_REF:'refs/heads/main'},{GITHUB_EVENT_NAME:'pull_request'},
    {GITHUB_REPOSITORY:'other/repo'},{RUNNER_ENVIRONMENT:'self-hosted'},{GITHUB_ACTIONS:'false'},
    {RUNNER_OS:'Windows'},{RUNNER_ARCH:'ARM64'},{GITHUB_RUN_ID:'123;rm'},{GITHUB_RUN_ATTEMPT:'../1'},
    {GITHUB_SHA:'main'},{RUNNER_TEMP:'relative'}]) assert.throws(()=>context({...env,...patch}));
});
test('cleanup ownership rejects unrelated containers, labels, runs and mutable images',()=>{
  const good = container(ctx.db,DB_IMAGE);
  assert.doesNotThrow(()=>validateOwned(good,ctx.db,DB_IMAGE,ctx.key));
  for (const mutate of [c=>c.Name='/unrelated',c=>c.Config.Image='supabase/postgres:latest',
    c=>delete c.Config.Labels[PURPOSE],c=>c.Config.Labels[PURPOSE]='another-run',
    c=>c.Config.Labels['gg.hotkey.security-test']='production']) {
    const c = structuredClone(good); mutate(c);
    assert.throws(()=>validateOwned(c,ctx.db,DB_IMAGE,ctx.key));
  }
});
test('Auth cannot serve an API, escape DB namespace, publish ports, or mount host data',()=>{
  const good = container(ctx.auth,AUTH_IMAGE);
  assert.doesNotThrow(()=>validateAuth(good,ctx,dbId));
  for (const mutate of [c=>c.Config.Cmd=['auth'],c=>c.HostConfig.NetworkMode='bridge',
    c=>c.HostConfig.NetworkMode='container:'+'c'.repeat(64),c=>c.HostConfig.Privileged=true,
    c=>c.HostConfig.PidMode='host',c=>c.HostConfig.IpcMode='host',c=>c.HostConfig.CapAdd=['NET_ADMIN'],
    c=>c.HostConfig.Devices=[{}],c=>c.HostConfig.PortBindings={'5432/tcp':[{}]},
    c=>c.HostConfig.ReadonlyRootfs=false,c=>c.NetworkSettings.Networks={bridge:{}},
    c=>c.Mounts=[{Type:'bind',Source:'/'}],c=>c.Mounts=[{Type:'volume'}]]) {
    const c=structuredClone(good); mutate(c); assert.throws(()=>validateAuth(c,ctx,dbId));
  }
});
test('Docker child cannot inherit remote daemon or production database configuration',()=>{
  assert.deepEqual(dockerEnv({PATH:'/usr/bin',DOCKER_HOST:'tcp://remote',DOCKER_CONTEXT:'prod',
    PGHOST:'prod',PGPASSWORD:'secret',SUPABASE_ACCESS_TOKEN:'secret',GOTRUE_DB_DATABASE_URL:'prod'}),{PATH:'/usr/bin'});
});
