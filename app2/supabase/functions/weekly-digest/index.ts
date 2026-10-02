// weekly-digest (no gateway JWT check; the function checks its own caller): the week's sign-ups,
// lesson completions, errors and billing alerts. GET ?days=7 returns { report, text }; POST stores the
// week ending at today's midnight UTC in ops_digests (the Monday pg_cron job in 0015 does the same)
// and returns the row. The caller is the service role or a member of ops_admins. It sends no email.
// Kept in the repo, not deployed until Wolf says so. Logic: ../_shared/ops.js (weeklyDigest).
import { weeklyDigest, JSON_HEADERS } from '../_shared/ops.js';
import { opsDb, opsEnv, respondJson } from '../_shared/ops-adapters.ts';

Deno.serve(async (req: Request) => {
  const u = new URL(req.url);
  try {
    const out = await weeklyDigest({ method: req.method, authorization: req.headers.get('Authorization') || '', days: u.searchParams.get('days') }, { db: opsDb(), env: opsEnv(), now: () => Date.now() });
    return respondJson(out.status, out.body, JSON_HEADERS);
  } catch (_) {
    return respondJson(500, { error: 'digest_failed' }, JSON_HEADERS);
  }
});
