# Business details (DRAFT)

Status: draft for a licensed professional and Wolf. Not published. The legal name, state, address and numbers are in Wolf's Drive; this session has no access to it, so every one is a placeholder.
Markers: **[LLC]** is a detail from Wolf's Drive. **[LAWYER]** is a point a lawyer must confirm.

## Where the details go once filled

| Place | What shows | Where in the code |
|---|---|---|
| Contact page, Company section | Legal name, state of formation, postal address | `LEGAL.contact` in app2/app/legal-pages.js (live page: change only with Wolf's go-ahead) |
| Site footer, business line | "hotkey.gg is operated by [legal name], [city, state]." | Copy row `footer_business` in app2/content/copy/site.csv (empty today, so the footer shows nothing) |
| Terms and Privacy, first paragraph | Legal name, state, address | the drafts in this folder |
| Stripe and Link | Public business name, support email, statement descriptor `HOTKEY.GG` | Stripe Dashboard (Wolf) |
| Sign-in and receipt emails | Postal address in the footer **[LAWYER]** CAN-SPAM requires it for commercial email only; we send none, but a footer address on transactional mail is good practice | app2/supabase/templates/ |

## The text

hotkey.gg is operated by **[LLC: legal name]**, a **[LLC: state]** limited liability company.
Registered address: **[LLC: postal address]**.
**[LLC: EIN or state file number, only if counsel advises showing it]**
Support: hello@hotkey.gg. Privacy: privacy@hotkey.gg. Legal notices: legal@hotkey.gg. Security: security@hotkey.gg. Teams: teams@hotkey.gg.

**[LAWYER]** Confirm whether a registered agent address can stand in for a home address on the public pages. **[LAWYER]** Confirm that each address above is a real, monitored mailbox before publishing (Link escalations must be answered within 48 hours: docs/phases/E-checkout.md).
