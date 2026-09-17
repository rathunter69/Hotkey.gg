'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateContainer, parseTap } = require('./run-isolated');
function safe() { return { Name: '/hk-security-fixture', State: { Running: true }, Config: { Image: 'reviewed/platform@sha256:' + 'a'.repeat(64), Labels: { 'gg.hotkey.security-test': 'disposable-synthetic' } }, HostConfig: { NetworkMode: 'none' }, Mounts: [{ Type: 'tmpfs' }], NetworkSettings: { Networks: { none: {} } } }; }
test('only an isolated disposable container meets the runner contract', () => {
  assert.doesNotThrow(() => validateContainer(safe(), 'hk-security-fixture'));
  for (const mutate of [
    c => { c.Name = '/unrelated'; }, c => { c.Config.Labels = {}; },
    c => { c.HostConfig.NetworkMode = 'bridge'; }, c => { c.HostConfig.Privileged = true; },
    c => { c.HostConfig.PidMode = 'host'; }, c => { c.HostConfig.CapAdd = ['NET_ADMIN']; },
    c => { c.HostConfig.PortBindings = { '5432/tcp': [{}] }; },
    c => { c.NetworkSettings.Networks.extra = {}; }, c => { c.Mounts = [{ Type: 'bind' }]; },
    c => { c.Mounts = [{ Type: 'volume' }]; }, c => { c.Config.Image = 'postgres:latest'; },
  ]) { const c = safe(); mutate(c); assert.throws(() => validateContainer(c, 'hk-security-fixture')); }
});
test('TAP failures stay failures even if psql exits zero', () => {
  assert.deepEqual(parseTap('ok 1 - control\nnot ok 2 - bypass\n1..2\n'), { total: 2, failures: ['not ok 2 - bypass'] });
  assert.deepEqual(parseTap('1..1\nok 1 - control\n'), { total: 1, failures: [] });
});
test('incomplete, skipped and bailed-out suites cannot appear green', () => {
  for (const output of ['1..2\nok 1', '1..0', 'ok 1', '1..1\nok 2', '1..1\nok 1 # SKIP', '1..1\nnot ok 1 # TODO', 'Bail out! unsafe host\n1..1\nok 1']) assert.throws(() => parseTap(output));
});
