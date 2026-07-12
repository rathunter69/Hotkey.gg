-- SCHOOL TAGS v1.5 (r122) — Wolf's .edu auto-identity (design: dev/TEAMS_DESIGN.md).
-- The email domain IS the verification: tags derive SERVER-SIDE from auth.email,
-- never client-claimed. Display is OPT-IN (show_school). Home-desk membership can
-- be joined by domain WITHOUT a code — but captaincy still only travels through
-- invite codes (code = captaincy, domain = membership).

alter table public.profiles add column if not exists school_domain text;
alter table public.profiles add column if not exists school_tag text;
alter table public.profiles add column if not exists show_school boolean not null default false;

-- school_domain/school_tag are server-derived ONLY: clients keep just their own
-- editable columns (this also stops a fresh insert from self-claiming a tag).
revoke update on public.profiles from anon, authenticated;
revoke insert on public.profiles from anon, authenticated;
grant update (handle, team_code, flair, show_school, updated_at) on public.profiles to authenticated;
grant insert (id, handle, team_code, flair, show_school, updated_at) on public.profiles to authenticated;

create table if not exists public.school_map (
  domain text primary key,
  tag    text not null
);
insert into public.school_map (domain, tag) values
  ('upenn.edu','UPenn'),('wharton.upenn.edu','Wharton'),('hbs.edu','HBS'),
  ('harvard.edu','Harvard'),('stanford.edu','Stanford'),('gsb.stanford.edu','Stanford GSB'),
  ('mit.edu','MIT'),('columbia.edu','Columbia'),('gsb.columbia.edu','CBS'),
  ('nyu.edu','NYU'),('stern.nyu.edu','NYU Stern'),('uchicago.edu','UChicago'),
  ('chicagobooth.edu','Booth'),('kellogg.northwestern.edu','Kellogg'),
  ('northwestern.edu','Northwestern'),('yale.edu','Yale'),('princeton.edu','Princeton'),
  ('cornell.edu','Cornell'),('dartmouth.edu','Dartmouth'),('tuck.dartmouth.edu','Tuck'),
  ('umich.edu','Michigan'),('berkeley.edu','Berkeley'),('haas.berkeley.edu','Haas'),
  ('ucla.edu','UCLA'),('anderson.ucla.edu','UCLA Anderson'),('duke.edu','Duke'),
  ('fuqua.duke.edu','Fuqua'),('virginia.edu','UVA'),('darden.virginia.edu','Darden'),
  ('georgetown.edu','Georgetown'),('lse.ac.uk','LSE'),('ox.ac.uk','Oxford'),
  ('cam.ac.uk','Cambridge'),('insead.edu','INSEAD'),('london.edu','LBS'),
  ('utexas.edu','UT Austin'),('mccombs.utexas.edu','McCombs'),('nd.edu','Notre Dame'),
  ('bc.edu','Boston College'),('vanderbilt.edu','Vanderbilt'),('emory.edu','Emory'),
  ('usc.edu','USC'),('cmu.edu','CMU'),('wustl.edu','WashU'),('rice.edu','Rice'),
  ('unc.edu','UNC'),('gatech.edu','Georgia Tech'),('utoronto.ca','UToronto'),
  ('mcgill.ca','McGill'),('queensu.ca','Queen''s')
on conflict (domain) do nothing;

create or replace function public.refresh_school_tag()
returns text language plpgsql security definer set search_path = public as $$
declare v_email text; v_dom text; d text; v_tag text; base text;
begin
  if auth.uid() is null then return null; end if;
  select email into v_email from auth.users where id = auth.uid();
  if v_email is null or position('@' in v_email) = 0 then return null; end if;
  v_dom := lower(split_part(v_email, '@', 2));
  -- walk subdomains: finance.wharton.upenn.edu -> wharton.upenn.edu -> upenn.edu
  d := v_dom;
  while v_tag is null and position('.' in d) > 0 loop
    select tag into v_tag from public.school_map where domain = d;
    exit when v_tag is not null;
    d := substring(d from position('.' in d) + 1);
  end loop;
  -- unmapped academic domains still earn a tag from the registrable label
  if v_tag is null and (v_dom ~ '\.edu$' or v_dom ~ '\.(edu|ac)\.[a-z]{2}$') then
    base := regexp_replace(v_dom, '\.(edu|ac)(\.[a-z]{2})?$', '');
    if position('.' in base) > 0 then base := substring(base from '([^.]+)$'); end if;
    v_tag := initcap(base);
  end if;
  update public.profiles
     set school_domain = case when v_tag is not null then v_dom else null end,
         school_tag    = v_tag
   where id = auth.uid();
  return v_tag;
end $$;
grant execute on function public.refresh_school_tag() to authenticated;

-- home-desk: a seeded/marked desk whose edu_domain matches your school domain.
create or replace function public.home_desk_for_me()
returns table(team_id uuid, name text, slug text, members bigint)
language sql security definer stable set search_path = public as $$
  select t.id, t.name, t.slug,
         (select count(*) from public.team_members m where m.team_id = t.id)
  from public.teams t
  join public.profiles p on p.id = auth.uid()
  where t.edu_domain is not null and p.school_domain is not null
    and (p.school_domain = t.edu_domain or p.school_domain like '%.' || t.edu_domain)
    and not exists (select 1 from public.team_members m2 where m2.user_id = auth.uid())
  limit 1
$$;
grant execute on function public.home_desk_for_me() to authenticated;

-- join by DOMAIN: membership only — captaincy still requires the invite code
-- (the club president claims with the code Wolf hands them; students auto-join).
create or replace function public.join_home_desk()
returns table(team_id uuid, name text, slug text)
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_name text; v_slug text;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  select h.team_id, h.name, h.slug into v_id, v_name, v_slug from public.home_desk_for_me() h;
  if v_id is null then raise exception 'NO_HOME_DESK'; end if;
  insert into public.team_members (team_id, user_id, role) values (v_id, auth.uid(), 'member');
  return query select v_id, v_name, v_slug;
end $$;
grant execute on function public.join_home_desk() to authenticated;
