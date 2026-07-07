-- team codes: private cohort leaderboards (finance clubs, analyst classes)
alter table public.profiles add column if not exists team_code text;
create index if not exists profiles_team_code_idx on public.profiles (team_code);
