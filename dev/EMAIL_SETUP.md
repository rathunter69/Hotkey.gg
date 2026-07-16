# Email & domain setup — the accounts-night checklist

Written for the "putting together accounts tonight" session. Order matters:
the domain mailbox comes first because everything else (Supabase billing,
Stripe, SMTP) wants a real address on your own domain.

## 1. Domain mailbox (do this first)

Pick one:

| Option | Cost | Why |
|---|---|---|
| **Google Workspace** | ~$7/user/mo | Best deliverability reputation, familiar, Gemini junk ignorable. The default choice. |
| Zoho Mail | free tier (1 domain, 5 users) | Fine for a beta; slightly worse spam reputation. |
| Fastmail | ~$5/user/mo | Great product, less common for business identity. |

Create **one real mailbox**: `wolf@hotkey.gg` (your identity for billing,
Supabase, Stripe, bank, registrar). Then add **aliases** (free, route to the
same inbox):

- `hello@hotkey.gg` — already linked all over the site (support/contact/press)
- `billing@hotkey.gg` — give THIS to Supabase Pro, Stripe, and any vendor;
  keeps invoices findable and survives personnel changes
- `security@hotkey.gg` — referenced by security.html disclosure policy

DNS at your registrar (the provider gives exact values): **MX** records,
**SPF** (`v=spf1 include:_spf.google.com ~all` for Workspace), **DKIM**
(enable in the provider console, paste the TXT), **DMARC**
(`v=DMARC1; p=quarantine; rua=mailto:wolf@hotkey.gg`).

## 2. Transactional email (Supabase auth emails)

Supabase's default reset/confirm emails come from a shared Supabase domain —
unbranded, throttled (~2/hour), and spam-prone. Fix with custom SMTP:

1. Create a **Resend** account (resend.com — free 3k emails/mo, simplest) or
   Postmark (best deliverability, $15/mo). Add the hotkey.gg domain, add the
   DKIM/Return-Path DNS records they give you.
2. Create an SMTP credential; use sender `no-reply@hotkey.gg`
   (add it as an alias or just a sending identity — no mailbox needed).
3. Supabase dashboard → Project Settings → **Auth** → SMTP Settings:
   host/port/user/password from Resend, sender name `hotkey.gg`,
   sender address `no-reply@hotkey.gg`.
4. Auth → **Email Templates**: retitle the reset/confirm/magic-link templates
   (short, mono-friendly, no images needed). Keep subject lines plain —
   "Reset your hotkey.gg password" beats anything clever for inboxing.
5. Send yourself a password reset from the site and check it lands in inbox,
   not spam, with the right sender.

This same Resend account later powers the weekly desk digest (task #26) via
its API — one vendor for all outbound.

## 3. While you're in the Supabase dashboard

- **Billing → upgrade to Pro** with `billing@hotkey.gg` — unlocks daily
  backups + 7-day point-in-time recovery (the "oops" insurance worth having
  before real users).
- **Auth → URL configuration**: confirm site URL is `https://www.hotkey.gg`
  and the redirect allowlist covers it (password-reset links depend on this).
- Rotate the personal access token you pasted in chat and store the
  replacement as the `SUPABASE_ACCESS_TOKEN` env var on the Claude Code
  environment (claude.ai/code → environment settings).

## 4. Later, when Stripe enters

Use `billing@hotkey.gg` for the account, `hello@hotkey.gg` for the public
support contact Stripe requires, and the LLC's legal name once it exists —
Stripe asks for entity details up front, so forming the LLC first avoids
re-verification.

## 5. The weekly desk digest is pre-wired (r277)

The whole pipeline is deployed and DORMANT: pg_cron fires the `weekly-digest`
edge function every Monday 13:00 UTC; without `RESEND_API_KEY` it no-ops with
a "dormant" note. To light it up, one step after your Resend account exists:

    Supabase dashboard → Edge Functions → weekly-digest → Secrets
    → add RESEND_API_KEY = re_xxx

(`DIGEST_CRON_SECRET` is already set — minted into Vault + function secrets.)
Recipients: desk members with real emails who haven't opted out. Users manage
it from the account page; every email carries a one-click unsubscribe.
