-- 0017_export_complete.sql — Export data hands over everything the database keeps about the
-- caller (liability checklist, R9 consent pass: "No unnecessary data" and data requests). 0012's
-- export left out the account's sign-in record, its plan and the rows linked to it by id. Forward-
-- only; written in the R8/R9 integration and NOT applied until Wolf says so in the project chat.
--
-- Added, each the caller's own rows only:
--   account         the sign-in email, when the account was made, and the profile details the
--                   sign-in provider passed on (auth.users raw_user_meta_data: for Google, the name
--                   and picture, which the site never reads)
--   entitlements    the plan: every grant, code, checkout or desk seat, with its dates and renewal
--   billing         the payment processor's customer id, when one exists (no card data is held)
--   redeemed_codes  when a code was used and what it granted (the code itself stays private)
--   desk            the desk joined: its name, the role and when (never another member or the code)
--   events          product events linked to the account (0003)
--   client_errors   error reports linked to the account (0003; 0015 stopped linking new ones)
-- 0012's keys stay as they were. Same function, same owner-only rule: the caller is auth.uid(), a
-- visitor with no session is refused, and the grants carry over (create or replace keeps the ACL).

create or replace function public.rpc_export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  return jsonb_build_object(
    'account', (select jsonb_build_object('email', u.email, 'created_at', u.created_at,
                                          'provider_details', coalesce(u.raw_user_meta_data, '{}'::jsonb))
                from auth.users u where u.id = me),
    'profile', (select to_jsonb(pr) from public.profiles pr where pr.id = me),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at)
                          from public.attempts a where a.user_id = me), '[]'::jsonb),
    'lesson_progress', coalesce((select jsonb_agg(to_jsonb(lp) order by lp.lesson_id)
                                 from public.lesson_progress lp where lp.user_id = me), '[]'::jsonb),
    'game_attempts', coalesce((select jsonb_agg(to_jsonb(g) order by g.created_at)
                               from public.game_attempts g where g.user_id = me), '[]'::jsonb),
    'game_pbs', coalesce((select jsonb_agg(to_jsonb(b) order by b.ref)
                          from public.game_pbs b where b.user_id = me), '[]'::jsonb),
    'xp_awards', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at)
                           from public.xp_awards x where x.user_id = me), '[]'::jsonb),
    'learner_keys', coalesce((select jsonb_agg(to_jsonb(k) order by k.key_id)
                              from public.learner_keys k where k.user_id = me), '[]'::jsonb),
    'certificates', coalesce((select jsonb_agg(to_jsonb(c) order by c.issued_at)
                              from public.certificates c where c.user_id = me), '[]'::jsonb),
    'entitlements', coalesce((select jsonb_agg(to_jsonb(e) - 'user_id' order by e.created_at)
                              from public.entitlements e where e.user_id = me), '[]'::jsonb),
    'billing', (select jsonb_build_object('customer_id', b.stripe_customer_id, 'created_at', b.created_at)
                from public.billing_customers b where b.user_id = me),
    'redeemed_codes', coalesce((select jsonb_agg(jsonb_build_object('used_at', r.used_at, 'grant_days', r.grant_days) order by r.used_at)
                                from public.redeem_codes r where r.used_by = me), '[]'::jsonb),
    'desk', (select jsonb_build_object('name', d.name, 'role', m.role, 'joined_at', m.joined_at, 'paid_until', d.paid_until)
             from public.desk_members m join public.desks d on d.id = m.desk_id where m.user_id = me),
    'events', coalesce((select jsonb_agg(jsonb_build_object('name', ev.name, 'props', ev.props, 'at', ev.at) order by ev.at)
                        from public.events ev where ev.user_id = me), '[]'::jsonb),
    'client_errors', coalesce((select jsonb_agg(jsonb_build_object('url', ce.url, 'message', ce.message, 'created_at', ce.created_at) order by ce.created_at)
                               from public.client_errors ce where ce.user_id = me), '[]'::jsonb));
end;
$$;
-- grants on rpc_export_my_data carry over from 0004 (create or replace keeps the ACL)
