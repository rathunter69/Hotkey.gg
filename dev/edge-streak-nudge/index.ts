/* r370 STREAK NUDGE — Supabase Edge Function (same rails as weekly-recap).
 *
 * Audience: profiles with email_streak = true whose synced streak (client_state →
 * hotkey_streak, pushed by nav.js) is ≥3 days and whose last active day was YESTERDAY —
 * i.e. the streak dies at midnight unless they play today. One short nudge, no guilt.
 *
 * Deploy:   supabase functions deploy streak-nudge --no-verify-jwt
 * Schedule: select cron.schedule('streak-nudge', '0 22 * * *',   -- 22:00 UTC daily (evening US)
 *   $$ select net.http_post(
 *        url:='https://<PROJECT-REF>.supabase.co/functions/v1/streak-nudge',
 *        headers:=jsonb_build_object('Authorization','Bearer <SERVICE_ROLE_KEY>')) $$);
 * Prereq: dev/migrate-email-prefs.sql · RESEND_API_KEY secret set.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const FROM = 'hotkey.gg <nudge@hotkey.gg>';

Deno.serve(async (req) => {
  const auth = req.headers.get('Authorization') || '';
  const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!svc || !auth.includes(svc)) return new Response('unauthorized', { status: 401 });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, svc);
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return new Response('RESEND_API_KEY not set', { status: 500 });

  const yday = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
  const { data: prefs } = await sb.from('profiles')
    .select('id,handle,client_state').eq('email_streak', true);
  let sent = 0, skipped = 0;

  for (const p of prefs || []) {
    const st = p.client_state && p.client_state.hotkey_streak;
    const n = st && st.n | 0;
    // only when the streak is real (≥3) and dies TODAY (last active = yesterday)
    if (!st || n < 3 || st.day !== yday) { skipped++; continue; }
    const { data: u } = await sb.auth.admin.getUserById(p.id);
    const email = u?.user?.email;
    if (!email || !u?.user?.email_confirmed_at) { skipped++; continue; }

    const text = [
      `${p.handle || 'Analyst'} — your ${n}-day streak ends at midnight.`,
      ``,
      `One clean drill keeps it alive. Two minutes, tops:`,
      `https://www.hotkey.gg?daily=1`,
      ``,
      `— hotkey.gg · you asked for streak nudges on your Account page; turn them off there anytime.`,
    ].join('\n');

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject: `Your ${n}-day streak ends at midnight`, text }),
    });
    if (r.ok) sent++; else skipped++;
  }
  return new Response(JSON.stringify({ sent, skipped }), { headers: { 'Content-Type': 'application/json' } });
});
