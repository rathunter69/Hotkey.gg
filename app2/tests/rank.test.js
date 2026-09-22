// app2/tests/rank.test.js — the ladder math ports intact from the old build (Phase D).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIERS, ratingOf, tierOf, standing, PROVISIONAL_W, BOARD_MIN_FIELD } from '../app/rank.js';

test('the ladder: eight tiers, MBA Associate the floor, Second-Year the summit', () => {
  assert.equal(TIERS.length, 8);
  assert.equal(TIERS[0].name, 'MBA Associate');
  assert.equal(TIERS[7].name, 'Second-Year Analyst');
  for (let i = 2; i < TIERS.length; i++) assert.ok(TIERS[i].pct < TIERS[i - 1].pct, 'gates tighten up the ladder');
  assert.ok(BOARD_MIN_FIELD >= 20, 'rank hides until a board has real depth');
});

test('ratingOf: the 0.5 prior beats few-board sniping', () => {
  // two crowns on 2-player boards: pct 0, weight log2(3)/log2(9) ≈ 0.5 each → (0 + 6·0.5)/(1+6) ≈ 0.4286
  const two = ratingOf([{ pct: 0, n: 2 }, { pct: 0, n: 2 }]);
  assert.ok(two > 0.4 && two < 0.45, `two thin crowns stay mid (${two.toFixed(4)})`);
  // the old comment's example: two full-weight crowns → (2·0 + 6·0.5)/(2+6) = 0.375
  assert.equal(ratingOf([{ pct: 0, n: 8 }, { pct: 0, n: 8 }]), 0.375);
  // no boards → the pure prior
  assert.equal(ratingOf([]), 0.5);
  // twenty full-weight top-3% boards pull hard toward the truth
  const many = ratingOf(Array.from({ length: 20 }, () => ({ pct: 0.03, n: 40 })));
  assert.ok(many < 0.15, `broad excellence ranks (${many.toFixed(4)})`);
});

test('tierOf: gates, the provisional cap, buckets', () => {
  assert.equal(tierOf(null, 0).name, 'MBA Associate');
  assert.equal(tierOf(0.2, 3).name, 'MBA Associate', 'under 5 attempts stays the floor');
  assert.equal(tierOf(0.9, 5, 10).name, 'Candidate');
  assert.equal(tierOf(0.5, 8, 10).name, 'Summer Analyst');
  assert.equal(tierOf(0.3, 12, 10).name, 'Associate');
  assert.equal(tierOf(0.1, 18, 10).name, 'Second-Year Analyst');
  assert.equal(tierOf(0.1, 16, 10).name, 'MD', 'attempt gate holds the summit');
  // provisional: under PROVISIONAL_W weighted boards, capped at Summer Analyst
  const capped = tierOf(0.1, 18, PROVISIONAL_W - 1);
  assert.equal(capped.name, 'Summer Analyst');
  assert.equal(capped.provisional, true);
  assert.match(capped.full, /provisional/);
  // buckets split the band in thirds
  const t = tierOf(0.5, 8, 10);
  assert.ok(['Top Bucket', 'Middle Bucket', 'Bottom Bucket'].includes(t.bucket));
  assert.ok(t.promote >= 0 && t.promote <= 100);
  assert.equal(tierOf(0.16, 18, 10).nextName, 'Second-Year Analyst');
});

test('standing dedups per board, counts crowns/podiums, weights exposure', () => {
  const boards = ['edge-jumps', 'weekly-sales-report'];
  const runs = [
    // edge-jumps board, best-first: me 1st of 3 (and a dup row that must not double-count)
    { challenge: 'edge-jumps', user_id: 'me' }, { challenge: 'edge-jumps', user_id: 'me' },
    { challenge: 'edge-jumps', user_id: 'u2' }, { challenge: 'edge-jumps', user_id: 'u3' },
    // weekly board: me 3rd of 4
    { challenge: 'weekly-sales-report', user_id: 'u2' }, { challenge: 'weekly-sales-report', user_id: 'u3' },
    { challenge: 'weekly-sales-report', user_id: 'me' }, { challenge: 'weekly-sales-report', user_id: 'u4' },
    // a board not in menuOrder is ignored
    { challenge: 'other', user_id: 'me' },
  ];
  const s = standing(runs, 'me', boards);
  assert.equal(s.att, 2);
  assert.equal(s.crowns, 1);
  assert.equal(s.pod, 2);
  assert.equal(s.entries[0].pct, 0, 'first of three');
  assert.ok(Math.abs(s.entries[1].pct - 2 / 3) < 1e-9, 'third of four');
  assert.ok(s.wsum > 0 && s.wsum < 2, 'thin boards weigh under full');
  assert.ok(s.avgPct > 0.4 && s.avgPct < 0.55, 'prior keeps two thin boards mid');
  const none = standing([], 'me', boards);
  assert.equal(none.att, 0); assert.equal(none.avgPct, null);
});
