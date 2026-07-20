-- r360 EMAIL PREFS MIGRATION — run once in the Supabase SQL editor.
-- One column: the weekly-recap opt-IN (default off — nobody gets mail they didn't ask for).
-- The account page renders the toggle; dev/edge-weekly-recap/ is the sender.

alter table public.profiles
  add column if not exists email_recap boolean not null default false;

comment on column public.profiles.email_recap is
  'r360: weekly recap email opt-in. Sender: the weekly-recap edge function (dev/edge-weekly-recap).';
