// health (public, no JWT): 200 { ok: true, db: 'ok', ... } when the database answers within four
// seconds, else 503. The uptime workflow (.github/workflows/uptime.yml) pings it once HEALTH_URL is
// set. Reports no counts of people and no personal data. Logic: ../_shared/ops.js (healthCheck).
import { healthCheck, JSON_HEADERS } from '../_shared/ops.js';
import { opsDb, opsEnv, respondJson } from '../_shared/ops-adapters.ts';

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return respondJson(405, { error: 'method' }, JSON_HEADERS);
  const out = await healthCheck({ db: opsDb(), env: opsEnv(), now: () => Date.now() });
  return respondJson(out.status, out.body, JSON_HEADERS);
});
