'use strict';
// Database-only runner. Never accepts a database URL, host, password or linked project.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const label = 'gg.hotkey.security-test';

function manifest() {
  return ['supabase/migrations', 'supabase/tests/database'].flatMap(dir =>
    fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.sql')).sort().map(f => {
      const file = `${dir}/${f}`;
      return { file, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex') };
    }));
}
function validateContainer(c, name) {
  const h = c.HostConfig || {}, cfg = c.Config || {};
  if (c.Name !== '/' + name || cfg.Labels?.[label] !== 'disposable-synthetic') throw new Error('Not the explicitly labelled disposable container');
  if (!c.State?.Running || h.NetworkMode !== 'none') throw new Error('Container must be running with --network none');
  if (h.Privileged || h.PidMode === 'host' || h.IpcMode === 'host' || h.CapAdd?.length || h.Devices?.length) throw new Error('Privileged/shared-host containers are refused');
  if (Object.keys(h.PortBindings || {}).length || Object.keys(c.NetworkSettings?.Ports || {}).some(p => c.NetworkSettings.Ports[p]?.length)) throw new Error('Published ports are refused');
  if (Object.keys(c.NetworkSettings?.Networks || {}).some(n => n !== 'none')) throw new Error('Additional networks are refused');
  if ((c.Mounts || []).some(m => m.Type !== 'tmpfs')) throw new Error('Persistent volumes and host mounts are refused; use disposable tmpfs data');
  if (!/^.+@sha256:[a-f0-9]{64}$/.test(cfg.Image || '')) throw new Error('Image must be selected by immutable registry digest');
}
function parseTap(output) {
  const lines = output.split(/\r?\n/);
  const plan = lines.filter(l => /^1\.\.\d+$/.test(l));
  const results = lines.filter(l => /^(?:not )?ok\b/.test(l));
  if (lines.some(l => /^Bail out!/i.test(l)) || plan.length !== 1) throw new Error('Missing/ambiguous TAP plan or bailout');
  const count = Number(plan[0].slice(3));
  if (!count || results.length !== count || results.some((l, i) => Number(l.match(/^(?:not )?ok\s+(\d+)/)?.[1]) !== i + 1)) throw new Error('Incomplete TAP result stream');
  if (results.some(l => /#\s*(?:TODO|SKIP)\b/i.test(l))) throw new Error('Skipped or TODO security assertions are not a passing gate');
  return { total: count, failures: results.filter(l => /^not ok\b/.test(l)) };
}
function execute(command, args, options = {}) {
  const result = cp.spawnSync(command, args, { encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status}): ${result.stderr || result.stdout}`);
  return result.stdout;
}
function main(args) {
  if (args.length === 1 && args[0] === '--plan') { console.log(JSON.stringify({ source: execute('git', ['rev-parse', 'HEAD'], { cwd: root }).trim(), files: manifest() }, null, 2)); return; }
  if (args.length < 2 || args[0] !== '--container' || !/^hk-security-[a-z0-9-]+$/.test(args[1]) || args.slice(2).some(a => a !== '--replay') || args.length > 3) {
    throw new Error('Usage: node supabase/tests/run-isolated.js --plan | --container hk-security-NAME [--replay]');
  }
  const name = args[1], replay = args.includes('--replay');
  // Explicit local daemon endpoint; inherited Docker contexts/remote hosts cannot redirect this.
  const endpoint = process.platform === 'win32' ? 'npipe:////./pipe/docker_engine' : 'unix:///var/run/docker.sock';
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/^(DOCKER_|PG|SUPABASE_)/i.test(key)) delete env[key];
  const docker = a => execute('docker', ['--host', endpoint, ...a], { env });
  const sql = source => execute('docker', ['--host', endpoint, 'exec', '-i', name, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], { env, input: source });
  const verify = () => {
    validateContainer(JSON.parse(docker(['inspect', name]))[0], name);
    const interfaces = docker(['exec', name, 'sh', '-c', 'ls -1 /sys/class/net']).trim().split(/\s+/);
    if (interfaces.length !== 1 || interfaces[0] !== 'lo') throw new Error('Expected loopback-only network namespace');
    const settings = JSON.parse(sql("select json_build_object('cron', current_setting('cron.launch_active_jobs', true), 'source', (select source from pg_settings where name='cron.launch_active_jobs'), 'preload', current_setting('shared_preload_libraries'));"));
    if (settings.cron !== 'off' || settings.source !== 'command line' || !settings.preload.includes('pg_cron')) throw new Error('pg_cron must be preloaded with cron.launch_active_jobs=off on the server command line before startup');
    return settings;
  };
  const files = manifest();
  const migrationHash = crypto.createHash('sha256').update(JSON.stringify(files.filter(f => f.file.startsWith('supabase/migrations/')))).digest('hex');
  const settings = verify();
  // This check happens before any fixture, extension install or migration. No customer data allowed.
  sql(`do $$ begin
    if to_regclass('auth.users') is null or to_regprocedure('auth.uid()') is null or to_regprocedure('auth.jwt()') is null then
      raise exception 'Missing genuine Supabase platform bootstrap; do not substitute mock auth functions'; end if;
    if exists(select 1 from auth.users) then raise exception 'Expected empty synthetic Auth database'; end if;
    if not exists(select 1 from pg_available_extensions where name='pgtap') then raise exception 'pgTAP unavailable'; end if;
    if not exists(select 1 from pg_available_extensions where name='pg_net') then raise exception 'pg_net unavailable'; end if;
  end $$;`);
  console.log(JSON.stringify({ source: execute('git', ['rev-parse', 'HEAD'], { cwd: root }).trim(), image: JSON.parse(docker(['inspect', name]))[0].Image, postgres: sql('show server_version;').trim(), settings, files }, null, 2));
  if (replay) {
    sql("do $$ begin if exists(select 1 from pg_tables where schemaname='public') then raise exception 'Replay requires empty public schema; refusing existing app database'; end if; end $$;");
    for (const item of files.filter(f => f.file.startsWith('supabase/migrations/'))) {
      verify();
      console.log('REPLAY ' + item.file);
      // Original files, original filename order. Abort at the first SQL error; never skip/rewrite.
      sql(fs.readFileSync(path.join(root, item.file), 'utf8'));
    }
    // Written only after every original migration succeeds. Tests-only refuses a partial replay.
    sql(`create schema hotkey_test_control;
      revoke all on schema hotkey_test_control from public;
      create table hotkey_test_control.replay_manifest (sha256 text not null);
      insert into hotkey_test_control.replay_manifest values ('${migrationHash}');`);
  }
  if (sql('select sha256 from hotkey_test_control.replay_manifest;').trim() !== migrationHash) throw new Error('Missing or mismatched complete replay manifest; recreate a fresh disposable instance');
  verify();
  // Platform installs this extension for Supabase CLI tests too; no app grants are repaired here.
  sql('create schema if not exists extensions; create extension if not exists pgtap with schema extensions;');
  let failed = false;
  for (const item of files.filter(f => f.file.startsWith('supabase/tests/database/'))) {
    verify();
    console.log('TEST ' + item.file);
    const output = sql(fs.readFileSync(path.join(root, item.file), 'utf8'));
    console.log(output);
    const result = parseTap(output);
    if (result.failures.length) failed = true;
    console.log(JSON.stringify(result));
  }
  verify();
  // Fixture rollback must leave Auth empty, even when security assertions fail.
  sql("do $$ begin if exists(select 1 from auth.users) then raise exception 'Fixture cleanup failed'; end if; end $$;");
  if (failed) throw new Error('Security regression failures. Known baseline vulnerabilities remain failures, not a passing gate.');
  console.log('All executed database assertions passed; this is not HTTP/Auth-service or production verification.');
}
module.exports = { validateContainer, parseTap, manifest, main };
if (require.main === module) { try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
