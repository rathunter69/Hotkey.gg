# Cookie and Storage Policy (DRAFT)

Status: draft for a licensed professional and Wolf. Not published.
Markers: **[LAWYER]** is a point a lawyer must confirm.

## Decision recorded: no cookie banner

The audit (R9, 2026-10-02) found that hotkey.gg sets **no cookies of its own** and keeps in the browser only what the product needs to work. The one item that was analytics storage (a per-session key for product events in `sessionStorage`) was moved into memory in this run, so it is never written to the device. With nothing non-essential stored, no consent banner is needed, and none was built. A test (app2/tests/consent.test.js) fails if first-party code ever sets a cookie or if the analytics code touches browser storage.
**[LAWYER]** confirm that strictly necessary storage needs no consent under the ePrivacy Directive Art. 5(3) and UK PECR as applied here, and that the Stripe cookies below are covered by the same exemption.

---

## The policy text

hotkey.gg does not use advertising or tracking cookies, and sets no cookies of its own. To work, it keeps some things in your browser's storage. You can clear them at any time in your browser settings, or with Delete local data on the Account page.

### What the site keeps in your browser (local and session storage)

| Name | What it is | Why it is needed |
|---|---|---|
| `sb-…-auth-token` | Your sign-in session, from our auth provider (Supabase) | Keeps you signed in |
| `hk2_progress_v1`, `hk2_records_v1`, `hk2_cache_v1`, `hk2_outbox_v1`, `hk2_game_outbox_v1`, `hk2_game_sync_v1`, `hk2_guest_id` | Your lesson progress and results, and those waiting to sync | Guest progress lives only here; for an account, results wait here until they reach the server |
| `hk2_prefs`, `hk2_settings_v1`, `hk2_theme`, `hk2_theme_vars`, `hk_ribbon_bar`, `hk2_flair_v1`, `hk2_rapid_len` | Your settings, theme and look | So the site remembers your choices |
| `hk2_quests_v1`, `hk2_schedule_v1`, `hk2_board_seen_v1` | Today's quests, your review schedule, which board results you have seen | Product features you use |
| `hk2_entitlement_v1` | Whether this account has Full Access | Opens the paid chapters without waiting for the server |
| `hk2_course_done_logged` | That the course-complete email has been asked for | So it is sent once |
| `hk2_group_requests`, `hk2_pending_code` | A Teams request or invite code you typed | Kept on your device until desks open |
| `hk2_flag_payments` | A test switch for checkout (preview sites only) | Development |
| `hk2_save_later` (session storage) | That you dismissed the save-your-progress note | So it stays dismissed for this visit |

Nothing here is shared with anyone or used to follow you on other sites.

### Cookies set by others

- **Stripe and Link**, only on the checkout page and the billing pages they host, set cookies to prevent fraud and to run the payment (for example `__stripe_mid`, `__stripe_sid`, and Link's own). See Stripe's cookie policy. Checkout is not open on hotkey.gg yet.
- **Google**, only if you choose Continue with Google, on Google's own sign-in page.
- **Cloudflare**, our host, may set a security cookie (for example `__cf_bm`) if its bot protection is switched on. **[BUILD]** confirm in the Cloudflare dashboard whether Bot Fight Mode or similar is on for hotkey.gg.

### Fonts

The site loads its two typefaces from Google Fonts. That sets no cookies, but your browser's request reaches Google. See third-parties.md.

Last updated: **[date of publication]**
