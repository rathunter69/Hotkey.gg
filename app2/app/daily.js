// app2/app/daily.js — the Daily (SITE_SPEC §5): one drill a day, the same for everyone, drawn
// deterministically from the pool by the UTC day. A drill with a `seed` function gets fresh
// figures from the day's rng; the drill id and seed are pure functions of the date, so every
// player sees the same board with no server involved.
import { DAILY_POOL, drillById } from '../content/drills.js';
import { mulberry32, hash32 } from '../engine/rng.js';

/** The day's pick: { drillId, seed } for a 'YYYY-MM-DD' UTC day string. Pure. */
export function dailyFor(dayStr, pool = DAILY_POOL) {
  const seed = hash32('hk-daily-' + dayStr);
  const drillId = pool[seed % pool.length];
  return { drillId, seed };
}

/** The day's drill with its seeded cell patch (null when the drill has no seed fn). */
export function dailyDrill(dayStr) {
  const { drillId, seed } = dailyFor(dayStr);
  const drill = drillById(drillId);
  const seedCells = drill && typeof drill.seed === 'function' ? drill.seed(mulberry32(seed)) : null;
  return { drill, seed, seedCells };
}

/** The share text for a finished Daily (copy-to-clipboard; no URL shortener, no tracking). */
export function shareText(dayStr, drillTitle, secs, tier) {
  const stamp = tier === 'legendary' ? '◆◆◆' : tier === 'pro' ? '◆◆' : tier === 'pass' ? '◆' : '—';
  return `hotkey.gg Daily ${dayStr}\n${drillTitle}: ${secs.toFixed(2)}s ${stamp}\nhttps://hotkey.gg/#/daily`;
}
