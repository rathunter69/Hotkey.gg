// app2/app/pars.js — the three named clocks of a drill (SITE_SPEC §5). Authors write the
// legendary time (the optimal route at full speed) and the others derive from it, as the old
// build did: pass = ×1.5 (get it done), pro = ×1.15 (tight), legendary = ×1.0. A capstone
// widens pass to ×2 by passing an override — a chapter-length drill's first plays are long.

/** { pass, pro, legendary } in whole seconds from a legendary par, with optional overrides. */
export function parsFrom(legendary, over = {}) {
  const leg = Math.max(1, Math.ceil(legendary));
  return {
    pass: Math.max(leg + 2, Math.ceil(over.pass !== undefined ? over.pass : leg * 1.5)),
    pro: Math.max(leg + 1, Math.ceil(over.pro !== undefined ? over.pro : leg * 1.15)),
    legendary: leg,
  };
}

/** The tier a clean time earns against a drill's pars; 'none' when over pass or not clean. */
export function tierFor(secs, pars) {
  if (!Number.isFinite(secs) || !pars) return 'none';
  if (secs <= pars.legendary) return 'legendary';
  if (secs <= pars.pro) return 'pro';
  if (secs <= pars.pass) return 'pass';
  return 'none';
}

export const TIER_ORDER = ['none', 'pass', 'pro', 'legendary'];
/** a beats-or-equals b on the tier ladder */
export const tierAtLeast = (a, b) => TIER_ORDER.indexOf(a) >= TIER_ORDER.indexOf(b);
