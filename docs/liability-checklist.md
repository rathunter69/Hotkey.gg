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
