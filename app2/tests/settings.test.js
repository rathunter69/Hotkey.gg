// app2/tests/settings.test.js — M101: one preferences object with a schema version, every setting
// of 3.0's table, normalised from anything, carried from prefs.js once, and mirrored back so the
// pages that still read prefs agree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SETTINGS_GROUPS, SETTINGS, SETTINGS_VERSION, defaultSettings, normaliseSettings, fromPrefs, toPrefsPatch, toSync, mergeSynced, settingsCopyKeys } from '../app/settings.js';

test('the table carries 3.0\'s seven groups and every setting, each with its type', () => {
  assert.deepEqual(SETTINGS_GROUPS.map(g => g.id), ['keyboard', 'lessons', 'practice', 'appearance', 'sound', 'email', 'account']);
  const keys = SETTINGS_GROUPS.flatMap(g => g.settings.map(s => s.key));
  for (const k of ['keyLabels', 'layout', 'ribbonLessons', 'ribbonDrills', 'siteKeyTips', 'cardSide', 'showKeys', 'nudge', 'demo', 'setLength', 'ghost', 'pace', 'showOnBoards', 'theme', 'density', 'sheetZoom', 'sound', 'soundSet', 'effects', 'dailyReminder', 'weeklySummary', 'news', 'handle', 'certificateName', 'signIn', 'publicProfile', 'exportData', 'deleteAccount']) assert.ok(keys.includes(k), k);
  assert.equal(new Set(keys).size, keys.length, 'no key twice');
  for (const g of SETTINGS_GROUPS) for (const s of g.settings) {
    assert.ok(['choice', 'switch', 'theme', 'text', 'link', 'action'].includes(s.type), s.key + ' type');
    if (s.type === 'choice') { assert.ok(Array.isArray(s.options) && s.options.length >= 1, s.key + ' options'); assert.ok(s.default === null || s.options.includes(s.default), s.key + ' default'); }
    if (s.type === 'switch') assert.equal(typeof s.default, 'boolean', s.key + ' default');
  }
  assert.ok(!SETTINGS.handle && !SETTINGS.exportData, 'links and actions hold no value');
  const copy = settingsCopyKeys();
  assert.ok(copy.includes('settings_group_keyboard') && copy.includes('setting_nudge_15') && copy.includes('setting_ribbonLessons_help'));
});

test('defaults, normalising and the version', () => {
  const d = defaultSettings('mac');
  assert.equal(d.v, SETTINGS_VERSION); assert.equal(d.keyLabels, 'mac'); assert.equal(d.theme, 'workbook'); assert.equal(d.ribbonDrills, 'tabs'); assert.equal(d.sound, true);
  assert.equal(defaultSettings('win').keyLabels, 'win'); assert.equal(defaultSettings(undefined).keyLabels, 'win');
  const n = normaliseSettings({ v: 0, nudge: 15, sheetZoom: 125, sound: 'yes', theme: 'Bad Theme!', certificateName: '  Wolf D  ', bogus: 1, density: 'compact' }, 'win');
  assert.equal(n.nudge, '15', 'a number reads as its option'); assert.equal(n.sheetZoom, '125'); assert.equal(n.sound, true, 'a wrong type keeps the default');
  assert.equal(n.theme, 'workbook'); assert.equal(n.certificateName, 'Wolf D'); assert.equal(n.bogus, undefined); assert.equal(n.density, 'compact'); assert.equal(n.v, SETTINGS_VERSION);
  assert.deepEqual(normaliseSettings('junk', 'win'), defaultSettings('win'));
  assert.equal(normaliseSettings({ certificateName: 'x'.repeat(200) }).certificateName.length, 80, 'the certificate name is capped');
});

test('the carry from prefs.js, and the mirror back', () => {
  assert.deepEqual(fromPrefs({ platform: 'mac', ribbon: 'slim', mute: true, effects: 'subtle', ghost: false, density: 'compact' }), { keyLabels: 'mac', ribbonLessons: 'tabs', sound: false, effects: 'reduced', ghost: false, density: 'compact' });
  assert.deepEqual(fromPrefs(null), {});
  const rec = normaliseSettings({ keyLabels: 'mac', ribbonLessons: 'tabs', sound: false, effects: 'reduced', ghost: false, density: 'compact' });
  assert.deepEqual(toPrefsPatch(rec), { platform: 'mac', ribbon: 'slim', mute: true, effects: 'subtle', ghost: false, density: 'compact' });
});

test('sync: the newer record wins whole', () => {
  const local = toSync({ nudge: '15' }, 100), remote = toSync({ nudge: 'off' }, 200);
  assert.equal(mergeSynced(local, remote).nudge, 'off');
  assert.equal(mergeSynced(remote, local).nudge, 'off');
  assert.equal(mergeSynced(local, null).nudge, '15');
  assert.equal(toSync({}).v, SETTINGS_VERSION); assert.ok(Number.isFinite(toSync({}).at));
});
