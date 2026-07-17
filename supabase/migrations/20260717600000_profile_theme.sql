-- r293 (Wolf): the theme follows the ACCOUNT, not the device — pick Daylight on the
-- desktop and your phone opens the same look. Client rule: server theme applies only
-- when the device has no local choice yet; every explicit pick pushes back up.
alter table public.profiles add column if not exists theme text;

do $$ begin
  alter table public.profiles add constraint profiles_theme_len
    check (theme is null or char_length(theme) <= 32);
exception when duplicate_object then null; end $$;
