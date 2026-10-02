# Liability checklist

Wolf's list, copied from Google Drive ("Liability Checklist", 2026-10-01). Queued as run R9 in docs/REBUILD_PLAN.md: nothing here starts before the curriculum runs are done. Legal texts are drafted for a licensed professional's review, never published without Wolf's go-ahead.

## Policies, consent and honest selling

- Privacy Policy
- Terms of Service
- Refund Policy
- Cookie Policy
- Cookie Consent Banner
- Check Form Consents
- No unnecessary Data
- Audit Third-party SDKs
- Remove dark patterns (if violating UI/UX/theme guidelines)
- Remove hidden fees
- Remove fake reviews
- Accessibility alt text (not sure about integration w/ platform)
- Fix color contrast (should be addressed in UI/UX push)
- Add business details (I have on file in drive for LLC name etc)
- Age consent for minors/kids data
- Unsubscribe link in emails
- License fonts/images if applicable
- Data deletion requests
- Mention of AI use in Privacy Policy
- Mention of Third party data collectors in privacy policy (if applicable here)
- Not deleting user uploads
- Storage bucket being public
- Fake testimonials (not a problem here)
- Cancelling longer than sign up
- Auto renew without reminder

## Security

- Add HSTS
- Add CSRF Tokens
- Reset Sessions on password change
- Expire reset links
- Prevent user enumeration
- Whitelist upload types (N/A Here)
- Verify payment webhooks (not set up yet)
- Set prices server-side
- Block prompt injection
- Cap AI usage
- Limit request size
- Rate limit password resets
- Sanitize before storing
- Lock down CORS
- Disable directory listing
- Remove default admin route
- Lock accounts after failed Login attempted
- Log security events
- Set secure cookie flags
- Restrict database permissions

## Status: policies, consent and honest selling (R9, 2026-10-02)

Policy drafts are in docs/policy-drafts/, each marked **[LAWYER]** where counsel must confirm and **[LLC]** where a detail from Wolf's Drive goes. No live legal page and no live pricing page was changed.

| Item | Status | Evidence |
|---|---|---|
| Privacy Policy | Drafted for review | docs/policy-drafts/privacy.md, written from migrations 0001 to 0011 and the client code |
| Terms of Service | Drafted for review | docs/policy-drafts/terms.md, with Wolf's prices ($15, students $9, Teams $12 a seat, 5 or more). The live Terms and About pages still show the old $9/$90 and $7/$70 plans and must be replaced before checkout opens |
| Refund Policy | Drafted for review | docs/policy-drafts/refund.md (14 days on the first payment; Teams terms open for Wolf) |
| Cookie Policy | Drafted for review | docs/policy-drafts/cookies.md lists every storage key the site uses |
| Cookie Consent Banner | Not needed, none built | The site sets no cookies and keeps only what the product needs in browser storage; the analytics key moved from sessionStorage into memory (app2/app/telemetry.js). app2/tests/consent.test.js fails if first-party code sets a cookie or analytics touches storage |
| Check Form Consents | Built | One consent line (Terms, Privacy Policy, what the email is for, no marketing, 13 or older) under every email form: Account, sign-in pop-out, checkout sign-in; the Teams request says what its details are for (app2/ui/components/consent.js). consent.test.js fails if a form asking for an email lacks it |
| No unnecessary Data | Checked, two follow-ups | No date of birth, phone, address or uploads. Follow-ups: Google sign-in stores name and picture we never use (request email only); `rpc_export_my_data` omits email, certificate, plan and linked events (forward migration needed) |
| Audit Third-party SDKs | Done | docs/policy-drafts/third-parties.md: Google Fonts on every page (IP to Google; recommend self-hosting, both fonts are OFL), Supabase (vendored, hash-pinned), Stripe and Link only on checkout on preview hosts, Google sign-in on request, LinkedIn as a plain link. No analytics, pixels or CDN libraries |
| Remove dark patterns | Reviewed, none found in the flow | No pre-ticked boxes, countdowns, fake scarcity or confirmshaming ("Not now" is neutral); Cancel subscription sits beside Manage billing; Get full access is disabled with "Checkout opens at launch." while the flag is off |
| Remove hidden fees | One finding, not edited | Prices are tax-exclusive (stripe-setup.mjs `tax_behavior: 'exclusive'`) but Pricing and the paywall say "$15 a month" with no "plus tax"; Stripe shows tax before payment. Recommend "plus tax where it applies" on Pricing (Wolf's go-ahead needed). Checkout's "money back within 14 days" omits "first payment", unlike Pricing |
| Remove fake reviews | None found, one note | No reviews or testimonials. The landing's sample Daily board ("184 clean runs", made-up handles) is illustrative; recommend labelling it as an example |
| Accessibility alt text | Built | app2/tests/a11y.test.js (every img has alt, no icon-only control without a name) and app2/tests/a11y-guard.js, run by the browser smoke on every page it opens. One gap fixed: the workspace sound button was written with an empty label for script to fill |
| Fix color contrast | Already enforced | app2/tests/contrast.test.js checks every text and background pair in every theme (WCAG AA) |
| Add business details | Drafted, placeholders | docs/policy-drafts/business-details.md; the footer row `footer_business` is empty until the LLC details are filled |
| Age consent for minors/kids data | Built (statement) | "You must be 13 or older to make an account." on every sign-up form; docs/policy-drafts/minors.md for counsel (COPPA, GDPR Art. 8, public profile default) |
| Unsubscribe link in emails | Not applicable | The product sends no marketing email: only sign-in codes and links (Supabase), and payment emails from Link. Any future optional email gets an unsubscribe link (privacy.md section 6) |
| License fonts/images | Checked | Hanken Grotesk and JetBrains Mono: SIL Open Font License 1.1. Images (favicon, icons, the landing poster, pixel badges) are made in-house or recorded from the product. supabase-js: MIT. No stock images |
| Data deletion requests | Built, already present | Account page: Export data and Delete account (typed confirmation, `rpc_delete_account` cascades every table); guests: Delete local data; email privacy@hotkey.gg. Delete now warns a renewing subscriber to cancel first, since deletion does not stop Stripe billing (server-side cancel on delete is a follow-up) |
| Mention of AI use in Privacy Policy | Drafted | docs/policy-drafts/ai-use.md: no AI features, no data to AI providers |
| Mention of Third party data collectors | Drafted | docs/policy-drafts/third-parties.md and privacy.md section 5 |
| Not deleting user uploads | Not applicable | No upload anywhere in the product |
| Storage bucket being public | Not applicable | No Supabase Storage bucket is used |
| Fake testimonials | Not applicable | None on the site |
| Cancelling longer than sign up | Checked, passes | Cancel: Account, Cancel subscription, confirm in Stripe's portal (two steps, `flow_data` subscription_cancel). Sign up: four steps. docs/policy-drafts/renewal-reminders.md |
| Auto renew without reminder | Setting for Wolf | Stripe's upcoming-renewal emails; line added to Wolf's to-do list. Text in docs/policy-drafts/renewal-reminders.md |
