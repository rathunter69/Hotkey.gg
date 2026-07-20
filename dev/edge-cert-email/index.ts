/* r370 CERTIFICATE EMAIL — Supabase Edge Function (same rails as weekly-recap).
 *
 * Audience: certificates issued in the last 25 hours whose owner has email_certs = true
 * (default ON — this is the receipt for an action the user just took). The mail carries
 * the public cert URL and the one-click Add-to-LinkedIn link. The 25h window + hourly-safe
 * cron means an email can never be sent twice for the same cert: we stamp emailed_at.
 *
 * Deploy:   supabase functions deploy cert-email --no-verify-jwt
 * Schedule: select cron.schedule('cert-email', '0 * * * *',   -- hourly; the stamp dedupes
 *   $$ select net.http_post(
 *        url:='https://<PROJECT-REF>.supabase.co/functions/v1/cert-email',
 *        headers:=jsonb_build_object('Authorization','Bearer <SERVICE_ROLE_KEY>')) $$);
 * Prereq: dev/migrate-email-prefs.sql AND:
 *   alter table public.certificates add column if not exists emailed_at timestamptz;
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const FROM = 'hotkey.gg <certificates@hotkey.gg>';
/* mirrors HK_TRACKS in drills.js — the cert display names */
const CERT_NAME: Record<string, string> = {
  fluency: 'Excel Keyboard Fluency',
  formulas: 'Spreadsheet Formulas & Data Analysis',
  modeling: 'Financial Modeling Keyboard Mastery',
};

Deno.serve(async (req) => {
  const auth = req.headers.get('Authorization') || '';
  const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!svc || !auth.includes(svc)) return new Response('unauthorized', { status: 401 });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, svc);
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return new Response('RESEND_API_KEY not set', { status: 500 });

  const since = new Date(Date.now() - 25 * 3600e3).toISOString();
  const { data: certs } = await sb.from('certificates')
    .select('id,user_id,track,handle,issued_at,emailed_at')
    .gte('issued_at', since).is('emailed_at', null);
  let sent = 0, skipped = 0;

  for (const c of certs || []) {
    const { data: prof } = await sb.from('profiles').select('email_certs').eq('id', c.user_id).maybeSingle();
    if (prof && prof.email_certs === false) { skipped++; continue; }
    const { data: u } = await sb.auth.admin.getUserById(c.user_id);
    const email = u?.user?.email;
    if (!email || !u?.user?.email_confirmed_at) { skipped++; continue; }

    const name = CERT_NAME[c.track] || c.track;
    const certUrl = `https://www.hotkey.gg/cert.html?id=${encodeURIComponent(c.id)}`;
    const issued = new Date(c.issued_at);
    const li = 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME'
      + '&name=' + encodeURIComponent(name)
      + '&organizationName=' + encodeURIComponent('hotkey.gg')
      + '&issueYear=' + issued.getFullYear() + '&issueMonth=' + (issued.getMonth() + 1)
      + '&certUrl=' + encodeURIComponent(certUrl) + '&certId=' + encodeURIComponent(c.id);

    const text = [
      `${c.handle || 'Analyst'} — your certificate is live.`,
      ``,
      `${name}`,
      `Every drill in the track, clean recorded runs, no mouse. Verifiable anytime:`,
      `${certUrl}`,
      ``,
      `Add it to your LinkedIn profile in one click:`,
      `${li}`,
      ``,
      `— hotkey.gg · manage certificate emails on your Account page.`,
    ].join('\n');

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject: `Certificate earned: ${name}`, text }),
    });
    if (r.ok) { await sb.from('certificates').update({ emailed_at: new Date().toISOString() }).eq('id', c.id); sent++; }
    else skipped++;
  }
  return new Response(JSON.stringify({ sent, skipped }), { headers: { 'Content-Type': 'application/json' } });
});
