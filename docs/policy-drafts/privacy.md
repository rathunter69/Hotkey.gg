# Privacy Policy (DRAFT)

Status: draft for a licensed professional and Wolf. Not published. The live page (`#/privacy`, app2/app/legal-pages.js) is unchanged until Wolf approves a final text.
Markers: **[LAWYER]** is a point a lawyer must confirm. **[LLC]** is a detail from Wolf's Drive.
Written to match the code on branch `rebuild` as of 2026-10-02 (migrations 0001 to 0011, app2/app/*.js).

---

**Who we are.** hotkey.gg is operated by **[LLC: legal name]**, a **[LLC: state]** limited liability company, **[LLC: postal address]** ("we", "us"). Contact for anything in this policy: privacy@hotkey.gg.
**[LAWYER]** Confirm whether we need an EU or UK representative (GDPR Art. 27) given we do not target those markets but accept anyone.

## 1. The short version

- You can use Chapter 1 without an account. As a guest, your progress stays in your browser and is not sent to our servers.
- If you make an account, we store your email, your handle, and your lesson and practice results, so your progress follows you and your times can go on the boards.
- We do not sell or share your personal information for advertising. There are no third-party analytics, advertising or tracking scripts on the site.
- We send no marketing email.
- The product has no AI features and does not use your data to train AI models.
- You can export or delete your data from the Account page at any time.

## 2. What we collect, and why

| Data | When | Why (and **[LAWYER]** GDPR legal basis to confirm) | Kept for |
|---|---|---|---|
| Email address | You make an account (email code, email and password, magic link, or Google) | To sign you in and send the emails an account needs (sign-in codes, confirmations, and for subscribers the payment emails). Basis: contract. | Until you delete the account |
| Password (stored only as a hash by our auth provider) | You choose email and password | To sign you in. Basis: contract. | Until you delete the account or change it |
| Name and profile picture from Google | Only if you choose Continue with Google; Google passes them to our auth provider | We do not use or display them. **[LAWYER]** We could ask Google for email only; recorded as a to-do. | Until you delete the account |
| Handle, theme, platform (Mac or Windows), experience level, settings | You set them | To run the product and show your handle on the boards. Basis: contract. | Until you delete the account |
| Lesson and practice results: which lesson or drill, mode, time, keystroke and mouse counts, whether help was used, checkpoint splits, and for clean timed runs a key-by-key trace (key, time, cell) | You play while signed in | Progress, XP, level, personal bests, the boards and the ghost replay of your best run. Basis: contract. | Until you delete the account |
| Certificate: the name you type for it, a credential id and the six assessment figures | You finish the course and claim it | A certificate anyone can verify with its id. The name you type is shown on the verification page. Basis: contract. | Until you delete the account |
| Plan: whether you have Full Access, its source (code, grant, checkout or group), dates, and your Stripe customer id | You subscribe or redeem a code | To open the paid chapters and show your plan. Basis: contract. | Until you delete the account **[LAWYER]** tax and accounting retention may require Stripe's records to outlive the account; those are held by Stripe and Link, not us |
| Product events (for example: landing viewed, lesson started, lesson completed, account made), with a random key made fresh on every page load, and your account id when signed in | You use the site | To see where the product fails people. First party only. Basis: legitimate interests. **[LAWYER]** confirm a balancing test is enough. | Deleted after 90 days |
| Error reports: the page address, the error message, and your browser's user agent | Something breaks in your browser | To fix bugs. Basis: legitimate interests. | Deleted after 90 days |
| IP address, browser and request logs | Every visit | Our hosting (Cloudflare) and database (Supabase) providers log requests for security and to run the service. We do not combine these with your account. | As set by each provider **[LAWYER]** list their retention periods |

We do not ask for, and the product does not need: your real name (except on a certificate, by your choice), date of birth, address, phone number, employer, payment card details, or any file upload. There is no file upload anywhere on the site.

## 3. What is public

If your public profile is on (it is on by default; switch it off on the Account page): your handle, level, rank, featured achievements and best times appear on the public boards and your profile page. Your school or desk shows only if you opt in. A certificate's verification page shows the name you typed for it. Everything else, including your email, is private and is enforced as private in the database, not only hidden on screen.
**[LAWYER]** Public profile on by default: confirm this is acceptable, especially for users who may be minors (see minors.md). Wolf may prefer off by default.

## 4. What stays in your browser

The site keeps your guest progress, settings, theme and similar preferences in your browser's local storage, and your signed-in session (the sign-in token from our auth provider). These are needed for the site to work; none is used for advertising or tracking across sites. The site itself sets no cookies. See cookies.md.

## 5. Who processes your data for us

| Provider | What it does | What it receives |
|---|---|---|
| Supabase, Inc. | Database, sign-in and sign-in emails | Everything in section 2 that is stored with an account; IP address and browser for each request |
| Cloudflare, Inc. | Hosts the site | Every page request: IP address, browser, the page asked for |
| Google LLC (sign-in) | Only if you choose Continue with Google | Google's own account data, under Google's policy; Google learns you signed in to hotkey.gg |
| Stripe, Inc. and Link (Stripe's merchant of record service) | Checkout, subscriptions, receipts, renewal notices, tax, fraud checks | Your email, payment details (we never see your card), IP address and device data for fraud prevention |

Each acts on our instructions as a processor, except Stripe and Link, which act as merchant of record and are independent controllers for the payment. **[LAWYER]** confirm the controller and processor roles, and that each provider's data processing agreement is accepted (Supabase DPA, Cloudflare DPA, Stripe DPA). **[LAWYER]** international transfers: data is stored in **[Supabase region: check the project settings]**; confirm the transfer mechanism (EU-US Data Privacy Framework or SCCs).

## 6. What we never do

- Sell your personal information or share it for cross-context behavioral advertising. **[LAWYER]** confirm the CCPA/CPRA "Do Not Sell or Share" link is therefore not required, and whether we meet any CCPA threshold at all.
- Run third-party analytics, advertising pixels or session recording.
- Send marketing email. If we ever add an optional email (for example a weekly recap), it will be opt-in with an unsubscribe link in every send, and this policy will change first.
- Use AI to profile you, or give your data to an AI provider. See ai-use.md.

## 7. Your choices and rights

- **Export.** Account page, Your data, Export data: a file with your profile, results, progress and bests. As a guest, the same button exports what is in your browser. Once migration 0017 is applied the file also carries your sign-in email and what your sign-in provider passed on, your certificate, your plan and billing customer, codes you redeemed, your desk, and the product events and error reports linked to your account: everything we hold about you. **[BUILD]** until 0017 is applied, those come by email from privacy@hotkey.gg.
- **Delete.** Account page, Your data, Delete account: removes your profile, results, bests, board entries, certificate and plan rows at once. If you have a subscription, cancel it first (the page says so), because Stripe bills separately. Product events are not linked back after deletion and expire within 90 days. As a guest, Delete local data clears this browser.
- **Correct.** Change your handle and settings on the Account page; anything else, write to privacy@hotkey.gg.
- **By email.** privacy@hotkey.gg for any request, including from people without an account. We answer within 30 days. **[LAWYER]** confirm the response window (GDPR one month, CCPA 45 days) and the identity check.
- **Complain.** You can complain to your local data protection authority. **[LAWYER]** wording per jurisdiction.

## 8. Children

You must be 13 or older to make an account. See minors.md for the full statement. **[LAWYER]** confirm 13 is right everywhere we accept users (several EU states set 16 for consent under GDPR Art. 8).

## 9. Security

Row-level security on every table, no direct writes from the browser, sign-in tokens over HTTPS only. No system is perfectly secure; if a breach affects you we will tell you as the law requires. **[LAWYER]** breach notification wording.

## 10. Changes

We will post changes here with a new date, and for a change that matters we will say so on the site before it takes effect.

Last updated: **[date of publication]**
