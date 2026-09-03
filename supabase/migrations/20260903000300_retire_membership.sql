-- ============================================================================
-- r453 · B — THE LEGACY MEMBERSHIP MECHANISM IS RETIRED.
-- Wolf's decision, 2026-09-03: the beta invite gate died at r134. What survived
-- it was a silent auto-redeem — index.html held INVITE_AUTO_CODE = 'HAGS' and
-- called redeem_code('HAGS') on EVERY session that lacked a members row, "to keep
-- the members table consistent". Consistent with nothing: no product surface
-- reads members. The result is 2,371 rows of pure bookkeeping against 2,594
-- auth users, one write per new session, forever.
--
-- This is separate from 20260903000100_retire_beta_codes.sql, whose header
-- explicitly scoped itself to beta_codes/curtain_check and said the members
-- mechanism "stays". It does not stay. This file finishes the job.
--
-- VERIFIED LIVE (2026-09-03, read-only): members 2,371 rows · access_codes 2 ·
-- invite_codes 5 · auth.users 2,594 (2,591 anonymous). members_pkey has taken
-- 6,978 index scans — every one of them from the boot-path lookup this round
-- deletes, not from a feature.
--
-- GREPPED FOR LIVE READERS across every .html and .js in the repo
-- (`from('members')`, `access_codes`, `invite_codes`, `redeem_code`,
--  `INVITE_AUTO_CODE`, `me_member`) — the ONLY hits are in index.html:
--     :2628  const INVITE_AUTO_CODE = 'HAGS'
--     :2652  let ... me_member = false ...
--     :32264 sb.from('members').select('user_id').eq('user_id', me_user.id)
--     :32269 sb.rpc('redeem_code', {p_code: INVITE_AUTO_CODE})
--     :32164 / :32251 / :33805  gates that read me_member
-- All six are handled in the client edit that ships with this migration.
-- CONFIRMED: the school-desk join path does NOT touch members. It runs on
-- teams / team_members / team_assignments / profiles.team_code — lb.js:157-205,
-- lb.js:1143-1200, nav.js:503, profile.html:301, account.html:578-734,
-- index.html:32172-32221, and the join_desk / my_desk / home_desk_for_me /
-- join_home_desk RPCs. Nothing there references members, access_codes or
-- invite_codes. `profiles.team_code` is the legacy free-text tag; it is
-- untouched by this file.
--
-- ORDER MATTERS. The live INSERT policy on runs is
--     "members insert own runs":  auth.uid() = user_id
--                                 AND exists (select 1 from members m where m.user_id = auth.uid())
-- Dropping members would need `cascade`, which would take that policy with it and
-- leave public.runs with NO insert policy — every run post would 403 silently and
-- the outbox would fill forever. So the policy is REPLACED FIRST, then the table
-- goes. Nothing else in pg_policies, pg_proc or pg_constraint references members;
-- checked against the live catalog.
--
-- The replacement predicate is written in the (select auth.uid()) initplan form
-- straight away, so 20260903000600 does not have to touch it again.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1 · Free the runs INSERT policy from the membership join.
--     OLD  "members insert own runs" : auth.uid() = user_id AND exists(members …)
--     NEW  "runs_insert_own"         : (select auth.uid()) = user_id
--     Strictly the same protection for every real user: everyone who could post
--     before either had a members row or was about to be handed one by the
--     auto-redeem. The membership half never refused anybody it should not have —
--     it only refused people whose auto-redeem round-trip had not landed yet.
--     runs_guard (20260717100000) remains the real gate on run contents.
-- ---------------------------------------------------------------------------
drop policy if exists "members insert own runs" on public.runs;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='runs' and policyname='runs_insert_own') then
    create policy "runs_insert_own" on public.runs for insert
      with check ((select auth.uid()) = user_id);
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 2 · Drop the mechanism. Function first (it reads members and invite_codes),
--     then the tables. No cascade is needed once §1 has run — proven by the
--     catalog check above; if a dependency did appear, the drop failing loudly is
--     the correct outcome, not a silent cascade.
-- ---------------------------------------------------------------------------
drop function if exists public.redeem_code(text);

drop table if exists public.members;
drop table if exists public.invite_codes;
drop table if exists public.access_codes;

-- Data lost, recorded for the ledger: 2,371 members rows (user_id, code 'HAGS'-era,
-- joined_at), 5 invite_codes rows, 2 access_codes rows ('BOOTH-2026' classmates,
-- 'FRIENDS' general). None of it feeds a board, a certificate, a desk or a stat.
-- The two policies on members and the six privilege rows per table go with them.
