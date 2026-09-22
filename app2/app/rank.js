// app2/app/rank.js — the rank ladder, ported intact from the old build (themes.js HK_RANK).
// It reads as "speed-based tiers" because every board is sorted by clean time: your placement
// percentile IS your speed against the field, prior-weighted so a fast time on two thin boards
// never outranks broad competence. Rank stays hidden until benchmark boards have real depth
// (Phase B brings boards; guests are Unranked) and synthetic pace-setter ghosts never post rows.

export const TIERS = [
  { name: 'MBA Associate', cls: 'tier-mba', att: 0, pct: 9, req: 'everyone starts here — yes, everyone' },
  { name: 'Candidate', cls: 'tier-bronze', att: 5, pct: 1.01, req: '5 drills attempted, any placement' },
  { name: 'Summer Analyst', cls: 'tier-silver', att: 8, pct: 0.53, req: '8 drills · top 55% avg placement' },
  { name: 'First-Year Analyst', cls: 'tier-gold', att: 10, pct: 0.375, req: '10 drills · top 30%' },
  { name: 'Associate', cls: 'tier-amethyst', att: 12, pct: 0.31, req: '12 drills · top 22%' },
  { name: 'VP', cls: 'tier-platinum', att: 14, pct: 0.255, req: '14 drills · top 15%' },
  { name: 'MD', cls: 'tier-crimson', att: 16, pct: 0.195, req: '16 drills · top 8% — the corner office' },
  { name: 'Second-Year Analyst', cls: 'tier-diamond', att: 18, pct: 0.15, req: '18 drills · top 3% — the true final boss' },
];

export const PROVISIONAL_W = 6;   // weighted-board exposure before ranks above Summer Analyst unlock
export const RATING_K = 6;        // virtual-boards prior weight

/**
 * Rating: a shrunk, size-weighted average placement percentile. Starts from a 0.5 prior with
 * weight K, each board weighted by field size (w = log2(N+1)/log2(9), capped at 1) — a couple
 * of crowns on thin boards land solidly mid, the summit is earned in many places.
 */
export function ratingOf(entries) {
  const K = RATING_K;
  let wsum = 0, s = 0;
  for (const e of entries || []) {
    const w = Math.min(1, Math.log2((e.n || 1) + 1) / Math.log2(9));
    wsum += w; s += w * e.pct;
  }
  return (s + K * 0.5) / (wsum + K);
}

/**
 * The tier a rating earns at a given attempt count and weighted exposure. Until exposure reaches
 * PROVISIONAL_W the rank is capped at Summer Analyst and tagged provisional — no day-one
 * Second-Years off three-player boards. Adds bucket (thirds of the tier band) and promote %.
 */
export function tierOf(avgPct, att, wsum) {
  const T = TIERS;
  if (avgPct === null || avgPct === undefined || (att || 0) < 5) return { ...T[0], i: 0, bucket: null, full: T[0].name, provisional: false };
  let t = { ...T[1], i: 1 };
  for (let i = T.length - 1; i >= 1; i--) { if (att >= T[i].att && avgPct <= T[i].pct) { t = { ...T[i], i }; break; } }
  let provisional = false;
  if (wsum !== undefined && wsum !== null && wsum < PROVISIONAL_W && t.i > 2) { t = { ...T[2], i: 2 }; provisional = true; }
  else if (wsum !== undefined && wsum !== null && wsum < PROVISIONAL_W) provisional = true;
  t.provisional = provisional;
  const hi = t.pct > 1 ? 1 : t.pct;
  const lo = t.i + 1 < T.length ? T[t.i + 1].pct : 0;
  const span = Math.max(1e-9, hi - lo);
  const pos = Math.min(1, Math.max(0, (avgPct - lo) / span));
  t.bucket = pos <= 1 / 3 ? 'Top Bucket' : (pos <= 2 / 3 ? 'Middle Bucket' : 'Bottom Bucket');
  t.full = t.name + ' · ' + t.bucket + (provisional ? ' · provisional' : '');
  t.pos = pos;
  t.promote = t.i + 1 < T.length ? Math.round((1 - pos) * 100) : 100;
  t.nextName = t.i + 1 < T.length ? TIERS[t.i + 1].name : null;
  return t;
}

/**
 * A player's standing over the benchmark boards. `runs` is every posted clean run, best-first
 * per board (the boards' own sort); `menuOrder` names the boards that count.
 * → { att, avgPct (the rating), rawAvg, crowns, pod, t10, per, entries, wsum }
 */
export function standing(runs, meId, menuOrder) {
  const per = {}; for (const k of menuOrder) per[k] = [];
  const seen = {};
  for (const x of runs || []) {
    if (per[x.challenge] === undefined) continue;
    const key = x.challenge + '|' + x.user_id;
    if (!seen[key]) { seen[key] = true; per[x.challenge].push(x); }
  }
  let att = 0, crowns = 0, pod = 0, t10 = 0;
  const entries = [];
  for (const k of menuOrder) {
    const b = per[k]; const idx = b.findIndex(r => r.user_id === meId);
    if (idx >= 0) {
      att++; entries.push({ pct: b.length > 1 ? idx / (b.length - 1) : 0, n: b.length });
      if (idx === 0) crowns++; if (idx < 3) pod++; if (idx < 10) t10++;
    }
  }
  const rating = att ? ratingOf(entries) : null;
  const wsum = entries.reduce((a, e) => a + Math.min(1, Math.log2((e.n || 1) + 1) / Math.log2(9)), 0);
  return { att, avgPct: rating, rawAvg: att ? entries.reduce((a, e) => a + e.pct, 0) / att : null, crowns, pod, t10, per, entries, wsum };
}

/** How many posted times a board needs before rank shows at all (§9: hidden till the field fills). */
export const BOARD_MIN_FIELD = 20;
