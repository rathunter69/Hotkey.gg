# Renewal reminders and cancelling (DRAFT)

Status: draft for a licensed professional and Wolf. Not published.
Markers: **[LAWYER]** is a point a lawyer must confirm. **[WOLF]** is a dashboard setting only Wolf changes.

## What the product does (checked in code, 2026-10-02)

- **Signing up:** Pricing, Get full access, sign in with an email code, Stripe's form, pay. Four steps.
- **Cancelling:** Account page, Cancel subscription (a visible button beside Manage billing, never inside a menu), which opens Stripe's Customer Portal straight on the cancel confirmation (`flow_data.type = subscription_cancel`), then confirm. Two steps. The portal is set to cancel at period end with no proration, and asks an optional reason (app2/supabase/scripts/stripe-setup.mjs). Access runs to the end of the paid month, and the Account page then says "Ends {date}" instead of "Renews {date}". Cancelling is shorter than signing up.
- **Deleting the account** does not cancel a subscription at Stripe. The delete confirmation now says so for a renewing subscriber (built in R9). **[BUILD]** better: have deletion cancel the subscription server side (an edge function change, which needs Wolf's go-ahead to deploy).
- **Course complete:** a subscriber who finishes Chapter 6 gets one email with what is left to practise and a direct cancel link (logged as an event until a transactional email path exists).
- **Renewal notices:** come from Stripe and Link (Link is merchant of record under Managed Payments). The product sends none itself.

## Settings for Wolf

- **[WOLF]** Stripe Dashboard, Settings, Billing, Subscriptions and emails: turn on "Send emails about upcoming renewals" (and "Send emails when card payments fail"). Under Managed Payments, confirm in the same place, or with Stripe support, that Link sends the renewal notice and what it says. Recorded in /mnt/project-files/build/wolf-todo.md.
- **[WOLF]** Same page: set the reminder to go out **[7]** days before renewal. **[LAWYER]** state laws mostly require reminders for annual or longer terms and for free trials converting to paid; there is no annual plan and no trial, so a monthly reminder is beyond the minimum. Confirm.

## The text (for Terms section 3 and the checkout page)

Full Access renews automatically every month at $15 (or $9 at the student price), plus any tax, until you cancel. You can cancel any time from your Account page in two clicks; you keep access to the end of the month you paid for and are not charged again. Link, which processes the payment, emails a receipt for every payment. **[LAWYER]** California's automatic renewal law requires an acknowledgment after purchase that includes the terms and how to cancel; confirm Link's receipt covers it or add our own.
