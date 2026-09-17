'use strict';
// One official platform experiment on an ephemeral GitHub-hosted Linux runner.
// No URL/image override, application migration reader, linked project or API server.
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { validateContainer } = require('./run-isolated');
const DB_IMAGE = 'supabase/postgres@sha256:5a4314708484bec672de2c09653a5c01fb1c84a998564ac231b0325e2238ed5b';
const AUTH_IMAGE = 'supabase/gotrue@sha256:7e813221b93fbf54b515036438550e483bfaf057b9db52fe9bc1ce91c47e817e';
const PURPOSE = 'gg.hotkey.platform-bootstrap';
const ROOT = path.resolve(__dirname, '../..');
const endpoint = 'unix:///var/run/docker.sock';

function context(env) {
  if (env.GITHUB_ACTIONS !== 'true' || env.RUNNER_ENVIRONMENT !== 'github-hosted'
      || env.RUNNER_OS !== 'Linux' || env.RUNNER_ARCH !== 'X64'
      || env.GITHUB_REPOSITORY !== 'rathunter69/Hotkey.gg'
      || env.GITHUB_EVENT_NAME !== 'push'
      || env.GITHUB_REF !== 'refs/heads/codex/security-platform-bootstrap'
      || !/^\d+$/.test(env.GITHUB_RUN_ID || '') || !/^\d+$/.test(env.GITHUB_RUN_ATTEMPT || '')
      || !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA || '') || !path.isAbsolute(env.RUNNER_TEMP || '')) {
    throw new Error('Requires the dedicated branch-push job on GitHub-hosted Linux x64');
  }
  const key = `${env.GITHUB_RUN_ID}-${env.GITHUB_RUN_ATTEMPT}`;
  return { key, db: `hk-security-platform-${key}-db`, auth: `hk-security-platform-${key}-auth`,
    output: path.join(env.RUNNER_TEMP, 'hotkey-platform-bootstrap') };
}
function validateOwned(c, name, image, key) {
  if (c.Name !== '/' + name || c.Config?.Image !== image
      || c.Config?.Labels?.[PURPOSE] !== key
      || c.Config?.Labels?.['gg.hotkey.security-test'] !== 'disposable-synthetic') {
    throw new Error('Refusing a container outside this exact purpose-labelled experiment');
  }
}
function validateAuth(c, ctx, dbId) {
  validateOwned(c, ctx.auth, AUTH_IMAGE, ctx.key);
  const h = c.HostConfig || {};
  if (h.NetworkMode !== `container:${dbId}` || h.Privileged || h.PidMode === 'host'
      || h.IpcMode === 'host' || h.CapAdd?.length || h.Devices?.length
      || Object.keys(h.PortBindings || {}).length || !h.ReadonlyRootfs
      || Object.keys(c.NetworkSettings?.Networks || {}).length
      || (c.Mounts || []).some(m => m.Type !== 'tmpfs')
      || JSON.stringify(c.Config.Cmd) !== JSON.stringify(['auth','migrate','--config','/dev/null'])) {
    throw new Error('Auth migrator must be read-only and confined to the exact DB namespace');
  }
}
function dockerEnv(env) {
  const clean = { ...env };
  for (const key of Object.keys(clean)) if (/^(DOCKER_|PG|SUPABASE_|GOTRUE_)/i.test(key)) delete clean[key];
  return clean;
}
function command(cmd, args, opts = {}) {
  const r = cp.spawnSync(cmd, args, { encoding:'utf8', timeout:180000, maxBuffer:8*1024*1024, ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status}): ${r.stderr || r.stdout}`);
  return r.stdout;
}
async function main(args, env = process.env) {
  if (args.length !== 1 || !['--plan','--run','--cleanup'].includes(args[0])) throw new Error('Usage: platform-bootstrap.js --plan | --run | --cleanup');
  const sqlPath = path.join(__dirname,'platform-bootstrap-check.sql');
  const plan = { databaseImage:DB_IMAGE, authImage:AUTH_IMAGE,
    databaseSource:'d156ba65c14694c12cc5e782bc15b9b8ed2d1376',
    authSource:'0204331ca41a5b49f076b6fa3dc6c0d20b996590',
    sqlSha256:crypto.createHash('sha256').update(fs.readFileSync(sqlPath)).digest('hex'),
    hotkeyMigrationsExecuted:0, permissionAssertionsExecuted:0 };
  if (args[0] === '--plan') { console.log(JSON.stringify(plan,null,2)); return; }
  const ctx = context(env);
  if (process.platform !== 'linux') throw new Error('Linux Docker only');
  const clean = dockerEnv(env);
  const docker = (a, opts = {}) => command('docker',['--host',endpoint,...a],{env:clean,...opts});
  const inspect = name => {
    const r = cp.spawnSync('docker',['--host',endpoint,'inspect',name],{encoding:'utf8',timeout:30000,env:clean});
    if (r.error) throw r.error;
    if (r.status !== 0) {
      if (/No such (object|container)/i.test(r.stderr || '')) return null;
      throw new Error('Docker inspect failed: ' + r.stderr);
    }
    return JSON.parse(r.stdout)[0];
  };
  const cleanup = () => {
    for (const [name,image] of [[ctx.auth,AUTH_IMAGE],[ctx.db,DB_IMAGE]]) {
      const c = inspect(name);
      if (!c) continue;
      validateOwned(c,name,image,ctx.key);
      docker(['rm','--force',name]);
      if (inspect(name)) throw new Error('Named container cleanup failed');
    }
    console.log('Named experiment containers absent; no unrelated resource removed.');
  };
  if (args[0] === '--cleanup') { cleanup(); return; }
  fs.mkdirSync(ctx.output,{recursive:true});
  const report = { ...plan, source:env.GITHUB_SHA, runId:env.GITHUB_RUN_ID,
    attempt:env.GITHUB_RUN_ATTEMPT, stage:'preflight', result:'UNRUN' };
  let failure;
  const sql = source => docker(['exec','-i',ctx.db,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres'],{input:source});
  const adminSql = source => docker(['exec','-i',ctx.db,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d','postgres'],{input:source});
  const verify = () => {
    const c = inspect(ctx.db);
    validateOwned(c,ctx.db,DB_IMAGE,ctx.key);
    validateContainer(c,ctx.db);
    if (docker(['exec',ctx.db,'sh','-c','ls -1 /sys/class/net']).trim() !== 'lo') throw new Error('DB network is not loopback only');
    const s = JSON.parse(sql("select json_build_object('cron',current_setting('cron.launch_active_jobs',true),'source',(select source from pg_settings where name='cron.launch_active_jobs'),'preload',current_setting('shared_preload_libraries'));"));
    if (s.cron !== 'off' || s.source !== 'command line' || !s.preload.split(/,\s*/).includes('pg_cron')) throw new Error('Scheduler startup controls failed');
    return s;
  };
  try {
    if (command('git',['rev-parse','HEAD'],{cwd:ROOT}).trim() !== env.GITHUB_SHA
        || command('git',['status','--porcelain'],{cwd:ROOT}).trim()) throw new Error('Expected clean exact-source checkout');
    if (inspect(ctx.db) || inspect(ctx.auth)) throw new Error('Refusing to reuse existing containers');
    report.stage = 'pull-pinned-images';
    for (const image of [DB_IMAGE,AUTH_IMAGE]) {
      docker(['pull','--platform','linux/amd64',image],{timeout:300000});
      const c = JSON.parse(docker(['image','inspect',image]))[0];
      if (c.Architecture !== 'amd64' || c.Os !== 'linux' || Object.keys(c.Config?.Volumes || {}).length) throw new Error('Unexpected architecture or image-declared persistent volume');
    }
    report.stage = 'database-bootstrap';
    docker(['create','--name',ctx.db,'--label',`gg.hotkey.security-test=disposable-synthetic`,
      '--label',`${PURPOSE}=${ctx.key}`,'--network','none','--platform','linux/amd64',
      '--tmpfs','/var/lib/postgresql/data:rw,nosuid,nodev,size=1g',
      '--tmpfs','/var/run/postgresql:rw,nosuid,nodev,size=16m',
      '--security-opt','no-new-privileges:true',
      '--env','POSTGRES_PASSWORD=synthetic-platform-only-password',
      DB_IMAGE,'postgres','-c','config_file=/etc/postgresql/postgresql.conf',
      '-c','cron.launch_active_jobs=off','-c','listen_addresses=127.0.0.1',
      '-c','log_statement=none']);
    const created = inspect(ctx.db);
    validateOwned(created,ctx.db,DB_IMAGE,ctx.key);
    validateContainer({...created,State:{...created.State,Running:true}},ctx.db);
    // Validate confinement BEFORE starting official image code.
    docker(['start',ctx.db]);
    let ready = false;
    for (let i=0;i<90;i++) {
      const c = inspect(ctx.db);
      if (!c.State.Running) throw new Error('Database image exited during official bootstrap');
      // Initial setup uses a socket-only temporary server. TCP readiness marks final startup.
      const r = cp.spawnSync('docker',['--host',endpoint,'exec',ctx.db,'pg_isready','-h','127.0.0.1','-U','postgres','-d','postgres'],{encoding:'utf8',timeout:10000,env:clean});
      if (r.error) throw r.error;
      if (r.status === 0) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve,2000));
    }
    if (!ready) throw new Error('Database bootstrap readiness timed out');
    report.settingsBeforeAuth = verify();
    const hba = JSON.parse(adminSql("select json_build_object('file',current_setting('hba_file'),'loopbackTrust',exists(select 1 from pg_hba_file_rules where type='host' and database=ARRAY['all']::text[] and user_name=ARRAY['all']::text[] and address='127.0.0.1' and netmask='255.255.255.255' and auth_method='trust' and error is null));"));
    if (hba.file !== '/etc/postgresql/pg_hba.conf' || !hba.loopbackTrust) throw new Error('Expected genuine official loopback trust configuration');
    report.loopbackAuthentication = hba;
    sql("do $$ begin if exists(select 1 from auth.users) or exists(select 1 from pg_tables where schemaname='public') then raise exception 'Platform is not empty'; end if; end $$;");
    report.stage = 'official-auth-migrations';
    const dbId = inspect(ctx.db).Id;
    // Pinned official pg_hba trusts loopback. No fabricated grants or role-password edits.
    docker(['create','--name',ctx.auth,'--label','gg.hotkey.security-test=disposable-synthetic',
      '--label',`${PURPOSE}=${ctx.key}`,'--network',`container:${dbId}`,'--platform','linux/amd64',
      '--read-only','--tmpfs','/tmp:rw,nosuid,nodev,noexec,size=16m','--cap-drop','ALL',
      '--security-opt','no-new-privileges:true',
      '--env','GOTRUE_DB_DRIVER=postgres',
      '--env','GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:synthetic@127.0.0.1:5432/postgres?sslmode=disable',
      '--env','DB_NAMESPACE=auth',
      '--env','GOTRUE_JWT_SECRET=synthetic-platform-only-jwt-secret-never-used-for-tokens',
      '--env','API_EXTERNAL_URL=http://127.0.0.1:9999',
      '--env','GOTRUE_SITE_URL=http://127.0.0.1:9999',
      '--env','GOTRUE_TRACING_ENABLED=false','--env','GOTRUE_METRICS_ENABLED=false',
      '--env','GOTRUE_PROFILER_ENABLED=false','--env','GOTRUE_LOG_LEVEL=info',
      AUTH_IMAGE,'auth','migrate','--config','/dev/null']);
    validateAuth(inspect(ctx.auth),ctx,dbId);
    verify();
    docker(['start','--attach',ctx.auth],{timeout:180000});
    const auth = inspect(ctx.auth);
    validateAuth(auth,ctx,dbId);
    if (auth.State.Running || auth.State.ExitCode !== 0) throw new Error('Official Auth migrations failed');
    report.authExitCode = auth.State.ExitCode;
    docker(['rm',ctx.auth]);
    if (inspect(ctx.auth)) throw new Error('Auth migrator remained after completion');
    report.stage = 'platform-assertions';
    report.settingsAfterAuth = verify();
    // Official platform revokes postgres access to the Auth migration ledger.
    // Read metadata/emptiness as platform admin; never grant that access back.
    report.authBootstrap = JSON.parse(adminSql(`
      do $$ declare t record; populated boolean; begin
        if not exists(select 1 from auth.schema_migrations where version='20240214120130') then
          raise exception 'Official anonymous-user migration not recorded'; end if;
        for t in select tablename from pg_tables where schemaname='auth' and tablename<>'schema_migrations' loop
          execute format('select exists(select 1 from auth.%I)',t.tablename) into populated;
          if populated then raise exception 'Unexpected data in auth.%',t.tablename; end if;
        end loop;
      end $$;
      select json_build_object('migrationCount',(select count(*) from auth.schema_migrations),
        'latestMigration',(select max(version) from auth.schema_migrations),'authDataEmpty',true);`));
    const output = sql(fs.readFileSync(sqlPath,'utf8'));
    const checks = output.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
    if (checks.length !== 2 || checks[0].check !== 'platform' || checks[1].check !== 'claims' || !checks[1].passed) throw new Error('Incomplete platform check evidence');
    report.checks = checks;
    report.settingsFinal = verify();
    sql("do $$ begin if exists(select 1 from auth.users) or exists(select 1 from pg_tables where schemaname='public') then raise exception 'Platform check left data'; end if; end $$;");
    report.result = 'PASS';
  } catch (error) {
    failure = error; report.result = 'FAIL'; report.error = error.message;
    for (const [name,image] of [[ctx.db,DB_IMAGE],[ctx.auth,AUTH_IMAGE]]) {
      try {
        const c = inspect(name); if (!c) continue;
        validateOwned(c,name,image,ctx.key);
        const logs = cp.spawnSync('docker',['--host',endpoint,'logs','--tail','160',name],{encoding:'utf8',timeout:30000,env:clean});
        if (logs.error || logs.status !== 0) throw new Error('Could not capture named container logs');
        fs.writeFileSync(path.join(ctx.output,name+'.log'),(logs.stdout || '')+(logs.stderr || ''));
      } catch (logError) { report.logError = logError.message; }
    }
  } finally {
    try { cleanup(); report.cleanup = 'PASS'; }
    catch (error) { report.cleanup = 'FAIL'; report.cleanupError = error.message; failure ||= error; report.result = 'FAIL'; }
    fs.writeFileSync(path.join(ctx.output,'result.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }
  if (failure) throw failure;
}
module.exports = { context, validateOwned, validateAuth, dockerEnv, DB_IMAGE, AUTH_IMAGE, PURPOSE };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e.message); process.exitCode = 1; });
