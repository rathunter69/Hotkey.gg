/* r360 WEEKLY RECAP — Supabase Edge Function (groundwork; deploy when email launches).
 *
 * What it does: for every profile with email_recap = true and a confirmed email, pull the
 * last 7 days of runs, compose a short plain-text recap (runs, best drill, time saved,
 * streak state), and send it through Resend.
 *
 * Deploy:
 *   supabase functions deploy weekly-recap --no-verify-jwt
 *   supabase secrets set RESEND_API_KEY=re_...   (from resend.com; verify the from-domain)
 * Schedule (SQL editor, needs pg_cron + pg_net enabled):
 *   select cron.schedule('weekly-recap', '0 14 * * 1',   -- Mondays 14:00 UTC
 *     $$ select net.http_post(
 *          url:='https://<PROJECT-REF>.supabase.co/functions/v1/weekly-recap',
 *          headers:=jsonb_build_object('Authorization','Bearer <SERVICE_ROLE_KEY>')) $$);
 *
 * Prereq: dev/migrate-email-prefs.sql (profiles.email_recap).
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const FROM = 'hotkey.gg <recap@hotkey.gg>';   // must be a Resend-verified domain

Deno.serve(async (req) => {
  // service-role only: the cron call carries the service key; anon calls get a 401.
  const auth = req.headers.get('Authorization') || '';
  const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!svc || !auth.includes(svc)) return new Response('unauthorized', { status: 401 });

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, svc);
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return new Response('RESEND_API_KEY not set', { status: 500 });

  const since = new Date(Date.now() - 7 * 86400e3).toISOString();
  const { data: prefs } = await sb.from('profiles').select('id,handle').eq('email_recap', true);
  let sent = 0, skipped = 0;

  for (const p of prefs || []) {
    // email lives in auth.users — admin API, service role only
    const { data: u } = await sb.auth.admin.getUserById(p.id);
    const email = u?.user?.email;
    if (!email || !u?.user?.email_confirmed_at) { skipped++; continue; }

    const { data: runs } = await sb.from('runs')
      .select('challenge,time_ms,created_at').eq('user_id', p.id)
      .gte('created_at', since).order('time_ms', { ascending: true }).limit(500);
    if (!runs || runs.length === 0) { skipped++; continue; }   // quiet week — no mail

    const drills = new Set(runs.map(r => r.challenge));
    const best = runs[0];
    const lines = [
      `Your week on hotkey.gg, ${p.handle || 'analyst'}:`,
      ``,
      `  runs posted      ${runs.length}`,
      `  drills touched   ${drills.size}`,
      `  fastest          ${(best.time_ms / 1000).toFixed(2)}s on ${best.challenge}`,
      ``,
      `Keep the streak alive: https://www.hotkey.gg`,
      ``,
      `— hotkey.gg · you asked for this recap on your Account page; turn it off there anytime.`,
    ];

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject: 'Your week on hotkey.gg', text: lines.join('\n') }),
    });
    if (r.ok) sent++; else skipped++;
  }
  return new Response(JSON.stringify({ sent, skipped }), { headers: { 'Content-Type': 'application/json' } });
});
