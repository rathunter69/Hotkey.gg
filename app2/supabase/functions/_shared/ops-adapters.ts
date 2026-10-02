// app2/supabase/functions/_shared/ops-adapters.ts — the real database adapter behind ops.js: the
// service-role client for the digest and the health probe, and a user-token client to ask whether a
// caller belongs to ops_admins (through rpc_ops_overview, which refuses everyone else with 42501).
// Uses only what every Edge Function gets by default (SUPABASE_URL, SUPABASE_ANON_KEY,
// SUPABASE_SERVICE_ROLE_KEY); no new secret is needed. No Stripe import, so health stays light.
import { createClient } from 'npm:@supabase/supabase-js@2';

const url = () => Deno.env.get('SUPABASE_URL')!;
const serviceKey = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

export function opsEnv() {
  return { serviceKey: serviceKey(), version: '0015' };   // the migration the function was written against
}

export function opsDb() {
  const admin = createClient(url(), serviceKey(), noSession);
  return {
    async build(days: number) {
      const { data, error } = await admin.rpc('ops_build_digest', { p_days: days });
      if (error) throw new Error(error.message);
      return data;
    },
    async store() {
      const { data, error } = await admin.rpc('ops_store_digest', {});
      if (error) throw new Error(error.message);
      return data;
    },
    async health() {
      const { data, error } = await admin.rpc('ops_health');
      if (error) throw new Error(error.message);
      return data;
    },
    async isOpsAdmin(jwt: string) {
      const asUser = createClient(url(), Deno.env.get('SUPABASE_ANON_KEY')!, { ...noSession, global: { headers: { Authorization: 'Bearer ' + jwt } } });
      const { error } = await asUser.rpc('rpc_ops_overview', { p_days: 1 });
      return !error;
    },
  };
}

export function respondJson(status: number, body: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers });
}
