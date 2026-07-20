# hotkey.gg email — setup & operations

Three campaigns ride one set of rails: **Resend** (the sender), **profiles email-pref
columns** (the audience switches, surfaced on the Account page), and **Supabase Edge
Functions on pg_cron** (the automation). Copy in the functions is plain text on purpose —
edit the function, redeploy, done.

| campaign | function | default | cadence (cron) |
|---|---|---|---|
| weekly recap | `dev/edge-weekly-recap` | opt-in (off) | Mondays 14:00 UTC |
| streak nudge | `dev/edge-streak-nudge` | opt-in (off) | daily 22:00 UTC |
| certificate earned | `dev/edge-cert-email` | opt-out (on) | hourly, deduped via `certificates.emailed_at` |

Auth emails (signup confirmation, password reset, magic links) are separate — Supabase
Auth sends those already. See §4 to brand them.

## 1. Resend account (one-time, ~10 min)

1. Sign up at https://resend.com (free tier: 3,000 emails/mo, 100/day — plenty for beta).
2. **Domains → Add Domain** → `hotkey.gg`. Resend shows 3–4 DNS records
   (SPF TXT, DKIM CNAMEs/TXT, optional DMARC).
3. Add those records in **Cloudflare → hotkey.gg → DNS**. Set them to *DNS only*
   (grey cloud), not proxied. Resend verifies within minutes.
4. **API Keys → Create** → copy the `re_...` key (shown once).

Once the domain verifies you can send from any address at it (`recap@`, `nudge@`,
`certificates@`) — no inboxes needed; they're send-only identities.

## 2. Database (one paste)

SQL editor → paste `dev/migrate-email-prefs.sql`. Idempotent; adds the three pref
columns + the cert-email dedupe stamp. (Paste `dev/migrate-drill-feedback.sql` in the
same sitting if launching the drill-review channel.)

## 3. Deploy + schedule (one sitting with the CLI)

```sh
# from the repo root, once: npx supabase login && npx supabase link --project-ref <PROJECT-REF>
npx supabase secrets set RESEND_API_KEY=re_...
npx supabase functions deploy weekly-recap  --no-verify-jwt
npx supabase functions deploy streak-nudge  --no-verify-jwt
npx supabase functions deploy cert-email    --no-verify-jwt
```

The functions live at `dev/edge-*/index.ts`; copy each folder to `supabase/functions/<name>/`
before deploying (or point the CLI at them). Then schedule — SQL editor
(Database → Extensions: enable `pg_cron` + `pg_net` first), replacing
`<PROJECT-REF>` and `<SERVICE_ROLE_KEY>`:

```sql
select cron.schedule('weekly-recap', '0 14 * * 1',
  $$ select net.http_post(
       url:='https://<PROJECT-REF>.supabase.co/functions/v1/weekly-recap',
       headers:=jsonb_build_object('Authorization','Bearer <SERVICE_ROLE_KEY>')) $$);
select cron.schedule('streak-nudge', '0 22 * * *',
  $$ select net.http_post(
       url:='https://<PROJECT-REF>.supabase.co/functions/v1/streak-nudge',
       headers:=jsonb_build_object('Authorization','Bearer <SERVICE_ROLE_KEY>')) $$);
select cron.schedule('cert-email', '0 * * * *',
  $$ select net.http_post(
       url:='https://<PROJECT-REF>.supabase.co/functions/v1/cert-email',
       headers:=jsonb_build_object('Authorization','Bearer <SERVICE_ROLE_KEY>')) $$);
```

Test a function by hand anytime:
`curl -X POST https://<PROJECT-REF>.supabase.co/functions/v1/weekly-recap -H "Authorization: Bearer <SERVICE_ROLE_KEY>"`
→ returns `{"sent":N,"skipped":M}`.

## 4. Branding the auth emails (optional but recommended)

Supabase → **Authentication → Email Templates**: rewrite confirmation / reset copy in the
site's voice. Then **Authentication → SMTP Settings** → enable custom SMTP with Resend
(host `smtp.resend.com`, port 465, user `resend`, password = the API key, sender
`hotkey.gg <auth@hotkey.gg>`). This lifts Supabase's ~4/hour shared-sender rate limit and
sends auth mail from the real domain.

## 5. Receiving mail at @hotkey.gg (optional)

Resend addresses are send-only. To *receive* `contact@hotkey.gg` etc., use
**Cloudflare → hotkey.gg → Email → Email Routing**: enable it, add the routing MX records
it proposes (one click), and forward `contact@` → your personal inbox. Free, no mailbox
hosting needed. Resend's SPF/DKIM records and Cloudflare's routing MX coexist fine.

## Adding a campaign later

A campaign = an audience query + a template + a cron line. Copy any `dev/edge-*` folder,
change the `.eq(...)` audience filter and the text, deploy, schedule. Keep the rules:
opt-in by default (certificate-style receipts may default on), always skip unconfirmed
emails, always include the "turn it off on your Account page" line, and stamp-dedupe
anything event-driven so a cron re-run can't double-send.
