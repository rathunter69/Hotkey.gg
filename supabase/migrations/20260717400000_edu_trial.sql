-- r288 .EDU PRO TRIAL — capture revenue at peak motivation. A verified .edu email
-- gets a one-time 7-day PRO trial; when it lapses they've felt the paid features and
-- convert (or a club-comp/paid desk grant covers them). Reuses the computed-PRO model:
-- entitlements gains an expiry, my_pro() honors it. Idempotent.

alter table public.entitlements add column if not exists expires_at timestamptz;
alter table public.entitlements add column if not exists trial_used boolean not null default false;

-- my_pro(): own entitlement (pro AND not expired) OR an active desk grant.
create or replace function public.my_pro()
returns boolean
language sql security definer set search_path = public
as $$
  select
    exists(select 1 from public.entitlements e
           where e.user_id = auth.uid() and e.pro
             and (e.expires_at is null or e.expires_at > now()))
    or exists(
      select 1 from public.team_members tm
      join public.desk_pro_grants g on g.team_id = tm.team_id
      where tm.user_id = auth.uid()
        and g.status = 'active'
        and (g.expires_at is null or g.expires_at > now())
    )
$$;
grant execute on function public.my_pro() to authenticated;

-- start_pro_trial(): 7-day PRO for a verified-.edu account, once per user. Returns the
-- new expiry, 'already_pro', 'trial_used', or 'no_edu'. The .edu check reads the JWT
-- email claim (auth.jwt()), so it can't be spoofed from the client.
create or replace function public.start_pro_trial()
returns text
language plpgsql security definer set search_path = public
as $$
declare em text; existing public.entitlements%rowtype; new_exp timestamptz;
begin
  em := lower(coalesce(auth.jwt() ->> 'email', ''));
  -- academic domains: *.edu (US) and *.edu.<cc> / *.ac.<cc> (intl)
  if em !~ '@[^@]*\.(edu|edu\.[a-z]{2}|ac\.[a-z]{2})$' then
    return 'no_edu';
  end if;

  select * into existing from public.entitlements where user_id = auth.uid();
  if existing.user_id is not null then
    if existing.pro and (existing.expires_at is null or existing.expires_at > now()) then
      return 'already_pro';
    end if;
    if existing.trial_used then return 'trial_used'; end if;
  end if;

  new_exp := now() + interval '7 days';
  insert into public.entitlements(user_id, pro, source, expires_at, trial_used, updated_at)
    values (auth.uid(), true, 'edu_trial', new_exp, true, now())
  on conflict (user_id) do update
    set pro=true, source='edu_trial', expires_at=new_exp, trial_used=true, updated_at=now();
  return new_exp::text;
end $$;
grant execute on function public.start_pro_trial() to authenticated;

-- my_pro_status(): everything the client needs to render the badge / countdown / CTA
-- in one round trip — is it on, why (paid/trial/desk), and when it ends.
create or replace function public.my_pro_status()
returns table (pro boolean, source text, expires_at timestamptz, trial_used boolean)
language sql security definer set search_path = public
as $$
  select
    public.my_pro(),
    coalesce(
      (select case when g.status='active' and (g.expires_at is null or g.expires_at>now())
                   then 'desk' end
         from public.team_members tm join public.desk_pro_grants g on g.team_id=tm.team_id
         where tm.user_id=auth.uid() and g.status='active' limit 1),
      (select e.source from public.entitlements e
         where e.user_id=auth.uid() and e.pro
           and (e.expires_at is null or e.expires_at>now()) limit 1)
    ),
    (select e.expires_at from public.entitlements e
       where e.user_id=auth.uid() and e.pro and (e.expires_at is null or e.expires_at>now()) limit 1),
    coalesce((select e.trial_used from public.entitlements e where e.user_id=auth.uid()), false)
$$;
grant execute on function public.my_pro_status() to authenticated;
