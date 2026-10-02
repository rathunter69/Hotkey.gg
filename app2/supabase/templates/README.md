# Sign-in emails (paste into Supabase)

Supabase dashboard, project hotkey.gg: Authentication, then Emails (Email Templates).

1. **Confirm signup** template: subject `Your hotkey.gg code: {{ .Token }}`; body: paste all of confirm-signup.html (Source / HTML view).
2. **Magic Link** template: subject `Your hotkey.gg sign-in code: {{ .Token }}`; body: paste all of magic-link.html.
3. Save each.

Why the code was missing: a new email address gets the Confirm signup email, not Magic Link, and that template had no {{ .Token }}.

Later (needs a sending domain): set up Resend as custom SMTP under Authentication, then SMTP Settings, so mail comes from an hotkey.gg address and the built-in limit of a few emails an hour is lifted.
