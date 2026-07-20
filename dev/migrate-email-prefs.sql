-- r360/r370 EMAIL PREFS MIGRATION — run once in the Supabase SQL editor.
-- Three columns, one paste (idempotent — safe to re-run):
--   email_recap   weekly recap           · opt-IN,  default off
--   email_streak  streak-about-to-break  · opt-IN,  default off
--   email_certs   certificate earned     · opt-OUT, default on (it's the receipt for an
--                                          action the user just took, with the LinkedIn link)
-- The Account page renders the toggles; dev/edge-* functions are the senders.

alter table public.profiles
  add column if not exists email_recap boolean not null default false;
alter table public.profiles
  add column if not exists email_streak boolean not null default false;
alter table public.profiles
  add column if not exists email_certs boolean not null default true;

-- cert-email dedupe stamp (see dev/edge-cert-email)
alter table public.certificates
  add column if not exists emailed_at timestamptz;

comment on column public.profiles.email_recap is
  'r360: weekly recap email opt-in. Sender: dev/edge-weekly-recap.';
comment on column public.profiles.email_streak is
  'r370: streak-about-to-break nudge opt-in. Sender: dev/edge-streak-nudge.';
comment on column public.profiles.email_certs is
  'r370: certificate-earned email (default on, opt-out on Account). Sender: dev/edge-cert-email.';
