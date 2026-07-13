-- FEATURED ACHIEVEMENTS (r135) — Wolf: "let the user pick the top achievements
-- to display on their player card." profiles.featured_ach holds up to 3 comma-
-- separated achievement ids (client-curated, cosmetic — earned-state is always
-- re-derived from runs on the viewer's side for the OWN card; public cards
-- render picks as-is, they carry no competitive weight). Grants re-issued with
-- the new column (grant lists are column-frozen — r122/r132 pattern).

alter table public.profiles add column if not exists featured_ach text
  check (featured_ach is null or char_length(featured_ach) <= 120);

revoke update on public.profiles from anon, authenticated;
grant update (id, handle, team_code, flair, show_school, featured_ach, updated_at)
  on public.profiles to authenticated;
revoke insert on public.profiles from anon, authenticated;
grant insert (id, handle, team_code, flair, show_school, featured_ach, updated_at)
  on public.profiles to authenticated;
