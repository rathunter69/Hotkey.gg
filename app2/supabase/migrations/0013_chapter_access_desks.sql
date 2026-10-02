-- 0013_chapter_access_desks.sql — paid access per chapter, checked on the server (M58), and the
-- Teams desk with its group code (Phase E group codes, Phase F desks v1). Forward-only; written in
-- run R8 and NOT applied until Wolf says so in the project chat.
--
--   (a) chapters              the six chapters and which are free (Chapter 1) or Full Access
--   (b) content_refs          every lesson, drill and challenge id with its chapter, so the server
--                             knows which chapter a run belongs to. Seeded here from app2/content;
--                             tests/access.test.js fails when content gains an id no migration seeds
--   (c) entitlements.chapter  null = every chapter (the Full Access plan, admin, checkout and group
--                             rows); a chapter id = that chapter alone (a chapter code, a later DLC
--                             chapter). redeem_codes.chapter carries it onto the grant
--   (d) chapter_open / ref_open / rpc_my_access   the one access rule, and the account's answer
--   (e) the gate on the write path: rpc_record_attempt and rpc_submit_game_attempt refuse a run on a
--       paid chapter's lesson, drill or challenge from an account that can't open that chapter
--       ('no access'); the Daily and rapid-fire stay open to everyone, as Chapter 1's free tier says
--   (f) desks                 a Teams desk: a name, seats, a paid-until date and one join code.
--                             The code IS the group code: joining takes a seat and writes a 'group'
--                             entitlement that ends with the desk. Desks are sold by hand ($12 a seat,
--                             5 or more), so only Wolf creates one (admin_make_desk, no client grant)
--   (g) desk RPCs             preview and join by code, leave, the member's view, the owner's seat
--                             view, remove a member, a new code, and the desk's board
--
-- House rules as 0001 to 0011: RLS on every table, no client writes, security definer with an
-- empty search_path, execute revoked from public, anon and authenticated and granted back only where
-- a client needs it.

-- ---------------------------------------------------------------- (a) chapters
create table public.chapters (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  n integer not null unique check (n between 1 and 99),
  access text not null check (access in ('free', 'paid'))
);
alter table public.chapters enable row level security;
revoke all on table public.chapters from anon, authenticated;
insert into public.chapters (id, n, access) values
  ('foundations', 1, 'free'),
  ('formatting', 2, 'paid'),
  ('formulas', 3, 'paid'),
  ('data-and-lookups', 4, 'paid'),
  ('finance-and-accounting', 5, 'paid'),
  ('valuation', 6, 'paid');

-- ---------------------------------------------------------------- (b) content_refs
create table public.content_refs (
  ref text primary key check (ref ~ '^[a-z0-9-]{1,64}$'),
  chapter text not null references public.chapters (id)
);
create index content_refs_chapter on public.content_refs (chapter);
alter table public.content_refs enable row level security;
revoke all on table public.content_refs from anon, authenticated;
insert into public.content_refs (ref, chapter) values
  -- foundations: 51
  ('alignment-and-titles', 'foundations'),
  ('analyst-setup', 'foundations'),
  ('anchors-dollar-and-f4', 'foundations'),
  ('around-the-workbook', 'foundations'),
  ('before-you-send', 'foundations'),
  ('challenge-audit-before-you-send', 'foundations'),
  ('challenge-complete-the-feed', 'foundations'),
  ('challenge-find-and-mark', 'foundations'),
  ('challenge-inherited-file', 'foundations'),
  ('challenge-reshape-the-report', 'foundations'),
  ('challenge-the-site-pnl', 'foundations'),
  ('challenge-to-standard-in-three-minutes', 'foundations'),
  ('colour-label-hardcode', 'foundations'),
  ('combine-two-tabs', 'foundations'),
  ('copy-cut-paste-fill', 'foundations'),
  ('enter-and-fill', 'foundations'),
  ('enter-the-missing-day', 'foundations'),
  ('find-and-fix', 'foundations'),
  ('find-replace-timeline', 'foundations'),
  ('fit-to-one-page', 'foundations'),
  ('fix-it-in-place', 'foundations'),
  ('fonts-fills-borders', 'foundations'),
  ('format-the-weekly-page', 'foundations'),
  ('formula-sprint', 'foundations'),
  ('foundations-assessment', 'foundations'),
  ('foundations-testout', 'foundations'),
  ('get-around', 'foundations'),
  ('hardcode-hunt', 'foundations'),
  ('hide-group-freeze', 'foundations'),
  ('inherited-workbook', 'foundations'),
  ('insert-and-amend', 'foundations'),
  ('jump-dont-scroll', 'foundations'),
  ('know-the-screen', 'foundations'),
  ('link-across-sheets', 'foundations'),
  ('numbers-a-banker-can-read', 'foundations'),
  ('one-formula-per-row-filled-right', 'foundations'),
  ('paste-special-values', 'foundations'),
  ('paste-surgeon', 'foundations'),
  ('point-dont-type', 'foundations'),
  ('read-the-error-follow-the-trail', 'foundations'),
  ('ribbon-by-keyboard', 'foundations'),
  ('row-wrangler', 'foundations'),
  ('rows-cols-honest-totals', 'foundations'),
  ('select-like-you-mean-it', 'foundations'),
  ('sum-family-and-autosum', 'foundations'),
  ('the-checks-row', 'foundations'),
  ('the-style-pass', 'foundations'),
  ('typed-vs-calculated', 'foundations'),
  ('weekly-kpi-project', 'foundations'),
  ('weekly-sales-report', 'foundations'),
  ('widths-heights-autofit', 'foundations'),
  -- formatting: 49
  ('actuals-vs-estimates-divider', 'formatting'),
  ('alignment-at-scale', 'formatting'),
  ('borders-that-mean-something', 'formatting'),
  ('built-in-formats-on-a-pnl', 'formatting'),
  ('cell-styles-format-painter', 'formatting'),
  ('ch2-assessment', 'formatting'),
  ('ch2-custom-code', 'formatting'),
  ('ch2-flag-it', 'formatting'),
  ('ch2-flip-and-tie', 'formatting'),
  ('ch2-format-sprint', 'formatting'),
  ('ch2-pnl-to-standard', 'formatting'),
  ('ch2-print-it', 'formatting'),
  ('ch2-project', 'formatting'),
  ('ch2-the-divider', 'formatting'),
  ('ch2-to-thousands', 'formatting'),
  ('ch2-top-and-bottom', 'formatting'),
  ('challenge-checks-flags', 'formatting'),
  ('challenge-dynamic-header-block', 'formatting'),
  ('challenge-format-the-numbers', 'formatting'),
  ('challenge-grouped-navigable', 'formatting'),
  ('challenge-house-format-set', 'formatting'),
  ('challenge-pnl-presentation-quality', 'formatting'),
  ('challenge-print-pack', 'formatting'),
  ('cleaning-imported-labels', 'formatting'),
  ('conditional-codes-and-hidden-zeros', 'formatting'),
  ('currency-and-percent-lines', 'formatting'),
  ('data-bars-and-scales', 'formatting'),
  ('dates-on-the-timeline', 'formatting'),
  ('dynamic-headers-with-text', 'formatting'),
  ('dynamic-titles', 'formatting'),
  ('eomonth-edate', 'formatting'),
  ('formula-driven-rules', 'formatting'),
  ('grouping-and-outline-levels', 'formatting'),
  ('hide-group-or-separate-sheet', 'formatting'),
  ('highlight-rules', 'formatting'),
  ('labels-footnotes-sources', 'formatting'),
  ('managing-rules', 'formatting'),
  ('navigation-column', 'formatting'),
  ('one-page-summary', 'formatting'),
  ('print-areas-titles-footers', 'formatting'),
  ('puzzle-ch2', 'formatting'),
  ('remix-format-on-the-pnl', 'formatting'),
  ('sign-convention-costs-negative', 'formatting'),
  ('text-for-labels', 'formatting'),
  ('the-four-section-format', 'formatting'),
  ('title-units-timeline-answer', 'formatting'),
  ('units-and-period-line', 'formatting'),
  ('units-in-the-format', 'formatting'),
  ('widths-and-the-label-column', 'formatting'),
  -- formulas: 45
  ('and-or-not', 'formulas'),
  ('busiest-sites', 'formulas'),
  ('ch3-assessment', 'formulas'),
  ('ch3-bands', 'formulas'),
  ('ch3-date-math', 'formulas'),
  ('ch3-if-ladder', 'formulas'),
  ('ch3-loan-schedule', 'formulas'),
  ('ch3-override', 'formulas'),
  ('ch3-project', 'formulas'),
  ('ch3-sumifs-sprint', 'formulas'),
  ('ch3-text-split', 'formulas'),
  ('ch3-tie-it-out', 'formulas'),
  ('ch3-trace-the-error', 'formulas'),
  ('challenge-flags-block', 'formulas'),
  ('challenge-new-site-case', 'formulas'),
  ('challenge-site-package-summary', 'formulas'),
  ('challenge-six-faults', 'formulas'),
  ('challenge-text-dump', 'formulas'),
  ('challenge-timeline-and-age', 'formulas'),
  ('checks-block-rollup', 'formulas'),
  ('countif-countifs', 'formulas'),
  ('date-serials', 'formulas'),
  ('f9-show-formulas-at-scale', 'formulas'),
  ('hardcode-external-link-hunt', 'formulas'),
  ('if-on-a-threshold', 'formulas'),
  ('iferror-and-the-override', 'formulas'),
  ('irr-xirr', 'formulas'),
  ('member-tenure', 'formulas'),
  ('nested-if-ifs-min-max', 'formulas'),
  ('npv-xnpv', 'formulas'),
  ('parse-the-memo', 'formulas'),
  ('payment-schedule', 'formulas'),
  ('period-keys', 'formulas'),
  ('puzzle-ch3', 'formulas'),
  ('pv-fv-pmt', 'formulas'),
  ('round-family', 'formulas'),
  ('split-the-codes', 'formulas'),
  ('sumif-sumifs-averageifs', 'formulas'),
  ('sumproduct-blended-ticket', 'formulas'),
  ('text-to-columns-flash-fill', 'formulas'),
  ('text-to-numbers', 'formulas'),
  ('the-reconciliation', 'formulas'),
  ('trace-arrows-evaluate', 'formulas'),
  ('trading-calendar', 'formulas'),
  ('yearfrac-and-fiscal-periods', 'formulas'),
  -- data-and-lookups: 50
  ('3d-references', 'data-and-lookups'),
  ('approximate-match-bands', 'data-and-lookups'),
  ('autofilter-subtotal', 'data-and-lookups'),
  ('case-outputs-side-by-side', 'data-and-lookups'),
  ('case-toggle-choose-index', 'data-and-lookups'),
  ('ch4-assessment', 'data-and-lookups'),
  ('ch4-cube-it', 'data-and-lookups'),
  ('ch4-data-table', 'data-and-lookups'),
  ('ch4-goal-seek', 'data-and-lookups'),
  ('ch4-lookup-relay', 'data-and-lookups'),
  ('ch4-name-it', 'data-and-lookups'),
  ('ch4-pivot-in-90', 'data-and-lookups'),
  ('ch4-project', 'data-and-lookups'),
  ('ch4-six-tabs', 'data-and-lookups'),
  ('ch4-sort-and-filter', 'data-and-lookups'),
  ('ch4-two-pickers', 'data-and-lookups'),
  ('challenge-export-three-ways', 'data-and-lookups'),
  ('challenge-filtered-list', 'data-and-lookups'),
  ('challenge-kpi-block', 'data-and-lookups'),
  ('challenge-lookup-summary', 'data-and-lookups'),
  ('challenge-three-case-model', 'data-and-lookups'),
  ('challenge-toggles-named', 'data-and-lookups'),
  ('data-validation-dropdowns', 'data-and-lookups'),
  ('date-range-criteria', 'data-and-lookups'),
  ('dynamic-arrays', 'data-and-lookups'),
  ('filter-tricks', 'data-and-lookups'),
  ('goal-seek-break-even', 'data-and-lookups'),
  ('kpi-block', 'data-and-lookups'),
  ('kpi-page-linked-labeled-checked', 'data-and-lookups'),
  ('match-index-match', 'data-and-lookups'),
  ('multi-criteria-lookups', 'data-and-lookups'),
  ('name-manager', 'data-and-lookups'),
  ('naming-sparingly', 'data-and-lookups'),
  ('offset-indirect-why-not', 'data-and-lookups'),
  ('one-way-data-table', 'data-and-lookups'),
  ('pass-through-driver', 'data-and-lookups'),
  ('pivot-build-rearrange', 'data-and-lookups'),
  ('pivot-group-values', 'data-and-lookups'),
  ('pivot-refresh-getpivotdata', 'data-and-lookups'),
  ('puzzle-ch4', 'data-and-lookups'),
  ('question-end-to-end', 'data-and-lookups'),
  ('remove-duplicates', 'data-and-lookups'),
  ('sort-multi-level', 'data-and-lookups'),
  ('sumifs-cube', 'data-and-lookups'),
  ('two-way-data-table', 'data-and-lookups'),
  ('two-way-index-match', 'data-and-lookups'),
  ('validation-list-by-name', 'data-and-lookups'),
  ('vlookup-hlookup-fail', 'data-and-lookups'),
  ('why-lookups', 'data-and-lookups'),
  ('xlookup', 'data-and-lookups'),
  -- finance-and-accounting: 64
  ('accrual-and-cash', 'finance-and-accounting'),
  ('bs-cash-not-a-plug', 'finance-and-accounting'),
  ('cash-sweep-revolver', 'finance-and-accounting'),
  ('cf-indirect', 'finance-and-accounting'),
  ('ch5-assessment', 'finance-and-accounting'),
  ('ch5-balance-it', 'finance-and-accounting'),
  ('ch5-breaker', 'finance-and-accounting'),
  ('ch5-checks', 'finance-and-accounting'),
  ('ch5-circle-hunt', 'finance-and-accounting'),
  ('ch5-dcf-read-back', 'finance-and-accounting'),
  ('ch5-dep-waterfall', 'finance-and-accounting'),
  ('ch5-discount-it', 'finance-and-accounting'),
  ('ch5-four-rungs', 'finance-and-accounting'),
  ('ch5-is-it-revenue', 'finance-and-accounting'),
  ('ch5-name-the-driver', 'finance-and-accounting'),
  ('ch5-normalize-the-year', 'finance-and-accounting'),
  ('ch5-project', 'finance-and-accounting'),
  ('ch5-revenue-build', 'finance-and-accounting'),
  ('ch5-schedule-fill', 'finance-and-accounting'),
  ('ch5-statement-link', 'finance-and-accounting'),
  ('ch5-sweep', 'finance-and-accounting'),
  ('ch5-two-balance-sheets', 'finance-and-accounting'),
  ('ch5-two-landings', 'finance-and-accounting'),
  ('challenge-dcf', 'finance-and-accounting'),
  ('challenge-eight-faults', 'finance-and-accounting'),
  ('challenge-linked-statements', 'finance-and-accounting'),
  ('challenge-model-shell', 'finance-and-accounting'),
  ('challenge-model-speed', 'finance-and-accounting'),
  ('challenge-one-site-month', 'finance-and-accounting'),
  ('challenge-schedules', 'finance-and-accounting'),
  ('checks-sheet-day-one', 'finance-and-accounting'),
  ('cost-build', 'finance-and-accounting'),
  ('dcf-sensitivity', 'finance-and-accounting'),
  ('debt-and-interest-circle', 'finance-and-accounting'),
  ('discounting-mid-year', 'finance-and-accounting'),
  ('drivers-block', 'finance-and-accounting'),
  ('error-flags-checks-summary', 'finance-and-accounting'),
  ('fill-and-format-block', 'finance-and-accounting'),
  ('fill-patterns', 'finance-and-accounting'),
  ('how-the-statements-link', 'finance-and-accounting'),
  ('is-from-schedules', 'finance-and-accounting'),
  ('keyboard-only-linking', 'finance-and-accounting'),
  ('model-architecture', 'finance-and-accounting'),
  ('model-wide-sweep', 'finance-and-accounting'),
  ('one-week-three-statements', 'finance-and-accounting'),
  ('populate-from-data', 'finance-and-accounting'),
  ('ppe-and-depreciation', 'finance-and-accounting'),
  ('puzzle-ch5', 'finance-and-accounting'),
  ('read-like-a-buyer', 'finance-and-accounting'),
  ('revenue-build', 'finance-and-accounting'),
  ('revenue-build-in-three', 'finance-and-accounting'),
  ('stress-tests', 'finance-and-accounting'),
  ('tax-schedule', 'finance-and-accounting'),
  ('terminal-value', 'finance-and-accounting'),
  ('the-balance-sheet', 'finance-and-accounting'),
  ('the-cash-flow-statement', 'finance-and-accounting'),
  ('the-income-statement', 'finance-and-accounting'),
  ('tie-outs-cross-foots', 'finance-and-accounting'),
  ('timeline-flags-counters', 'finance-and-accounting'),
  ('unlevered-free-cash-flow', 'finance-and-accounting'),
  ('wacc-block', 'finance-and-accounting'),
  ('what-a-dcf-is', 'finance-and-accounting'),
  ('when-it-doesnt-balance', 'finance-and-accounting'),
  ('working-capital-schedule', 'finance-and-accounting'),
  -- valuation: 38
  ('applying-precedents', 'valuation'),
  ('applying-the-range', 'valuation'),
  ('bids-side-by-side', 'valuation'),
  ('calendarization-ltm', 'valuation'),
  ('ch6-assessment', 'valuation'),
  ('ch6-cap-the-amort', 'valuation'),
  ('ch6-ceiling-price', 'valuation'),
  ('ch6-football-field', 'valuation'),
  ('ch6-irr-sprint', 'valuation'),
  ('ch6-lenders-return', 'valuation'),
  ('ch6-ltm-two-ways', 'valuation'),
  ('ch6-median-and-range', 'valuation'),
  ('ch6-napkin', 'valuation'),
  ('ch6-paper-lbo', 'valuation'),
  ('ch6-project', 'valuation'),
  ('ch6-sources-and-uses', 'valuation'),
  ('ch6-spread-a-comp', 'valuation'),
  ('ch6-three-ways-to-a-price', 'valuation'),
  ('ch6-waterfall', 'valuation'),
  ('challenge-board-page', 'valuation'),
  ('challenge-comps', 'valuation'),
  ('challenge-paper-lbo', 'valuation'),
  ('challenge-precedents', 'valuation'),
  ('deal-multiples-premiums', 'valuation'),
  ('football-field-board-page', 'valuation'),
  ('irr-moic', 'valuation'),
  ('median-and-range', 'valuation'),
  ('operating-multiples', 'valuation'),
  ('puzzle-ch6', 'valuation'),
  ('returns-bridge', 'valuation'),
  ('sale-leasebacks', 'valuation'),
  ('sort-and-decide', 'valuation'),
  ('sources-and-uses', 'valuation'),
  ('spreading-a-comp', 'valuation'),
  ('the-waterfall', 'valuation'),
  ('tranches-and-sweep', 'valuation'),
  ('what-the-sponsor-can-pay', 'valuation'),
  ('your-stake', 'valuation');

-- A chapter's gates: the assessment (and Chapter 1's test-out) that make it Verified when passed
-- inside the time limit, as the client's lesson view decides it (a timed run that did not time
-- out). The owner's seat view counts them here; 0014's certificate claim reads them too.
create table public.chapter_gates (
  lesson_id text primary key check (lesson_id ~ '^[a-z0-9-]{1,64}$'),
  chapter text not null references public.chapters (id),
  kind text not null check (kind in ('assessment', 'testout')),
  limit_secs integer not null check (limit_secs between 1 and 86400)
);
alter table public.chapter_gates enable row level security;
revoke all on table public.chapter_gates from anon, authenticated;
insert into public.chapter_gates (lesson_id, chapter, kind, limit_secs) values
  ('foundations-assessment', 'foundations', 'assessment', 600),
  ('foundations-testout', 'foundations', 'testout', 600),
  ('ch2-assessment', 'formatting', 'assessment', 600),
  ('ch3-assessment', 'formulas', 'assessment', 720),
  ('ch4-assessment', 'data-and-lookups', 'assessment', 720),
  ('ch5-assessment', 'finance-and-accounting', 'assessment', 900),
  ('ch6-assessment', 'valuation', 'assessment', 900);

-- ---------------------------------------------------------------- (f) desks
create table public.desks (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 60),
  code text not null unique check (code ~ '^TEAM-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  seats integer not null check (seats between 1 and 1000),   -- Teams sells 5 or more; a pilot may be smaller
  paid_until timestamptz,                                    -- null = open-ended (a grant Wolf makes by hand)
  note text check (note is null or length(note) <= 200),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
alter table public.desks enable row level security;
revoke all on table public.desks from anon, authenticated;   -- the code is never selectable: everything goes through the RPCs

create table public.desk_members (
  desk_id uuid not null references public.desks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (desk_id, user_id)
);
create unique index desk_members_one_desk on public.desk_members (user_id);   -- one desk per account in v1: the board is never ambiguous
create unique index desk_members_one_owner on public.desk_members (desk_id) where role = 'owner';
alter table public.desk_members enable row level security;
revoke all on table public.desk_members from anon, authenticated;

-- ---------------------------------------------------------------- (c) entitlements by chapter, and the desk a group row came from
alter table public.entitlements
  add column chapter text references public.chapters (id),
  add column desk_id uuid references public.desks (id) on delete set null;
create index entitlements_desk on public.entitlements (desk_id) where desk_id is not null;
alter table public.redeem_codes
  add column chapter text references public.chapters (id);

-- ---------------------------------------------------------------- (d) the access rule
-- A chapter is open to an account when it is free, or when the account holds a live entitlement
-- for every chapter (chapter null) or for that chapter. Internal: no client calls it directly.
create or replace function public.chapter_open(p_user uuid, p_chapter text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select c.access = 'free' from public.chapters c where c.id = p_chapter), false)
      or (p_user is not null and exists (
            select 1 from public.entitlements e
            where e.user_id = p_user
              and e.starts_at <= now()
              and (e.ends_at is null or e.ends_at > now())
              and (e.chapter is null or e.chapter = p_chapter)))
$$;
revoke execute on function public.chapter_open(uuid, text) from public, anon, authenticated;

-- A run's ref is open when its chapter is. An id no migration has seeded yet stays open (the node
-- test holds the seed to the content, so a paid id never ships unseeded).
create or replace function public.ref_open(p_user uuid, p_ref text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select public.chapter_open(p_user, r.chapter) from public.content_refs r where r.ref = p_ref), true)
$$;
revoke execute on function public.ref_open(uuid, text) from public, anon, authenticated;

-- The account's own answer: { plan, chapters, sources }. plan is true when a live row opens every
-- chapter; chapters lists the open chapter ids in course order (Chapter 1 always); sources lists
-- where the live rows came from (admin, redeem, checkout, group). A guest gets Chapter 1 only.
create or replace function public.rpc_my_access()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with me as (select (select auth.uid()) as id),
  live as (
    select e.chapter, e.source from public.entitlements e, me
    where e.user_id = me.id and e.starts_at <= now() and (e.ends_at is null or e.ends_at > now())
  )
  select jsonb_build_object(
    'plan', exists (select 1 from live where chapter is null),
    'chapters', coalesce((select jsonb_agg(c.id order by c.n) from public.chapters c, me
                          where public.chapter_open(me.id, c.id)), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(distinct source) from live), '[]'::jsonb))
$$;
revoke execute on function public.rpc_my_access() from public, anon, authenticated;
grant execute on function public.rpc_my_access() to anon, authenticated;

-- ---------------------------------------------------------------- redeem codes for one chapter or the plan
-- rpc_redeem as 0005, carrying the code's chapter (null = every chapter) onto the grant.
create or replace function public.rpc_redeem(p_code text)
returns public.entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  c public.redeem_codes;
  ent public.entitlements;
  normalized text;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  normalized := upper(trim(coalesce(p_code, '')));
  if normalized !~ '^[A-Z0-9-]{8,32}$' then raise exception 'bad code'; end if;
  if (select count(*) from public.events
      where user_id = me and name = 'redeem_try' and at > now() - interval '1 hour') >= 10 then
    raise exception 'too many tries';
  end if;
  insert into public.events (user_id, name) values (me, 'redeem_try');
  select * into c from public.redeem_codes where code = normalized for update;
  if c.code is null then raise exception 'bad code'; end if;
  if c.used_at is not null then raise exception 'already used'; end if;
  if c.expires_at is not null and c.expires_at <= now() then raise exception 'expired'; end if;
  update public.redeem_codes set used_by = me, used_at = now() where code = normalized;
  insert into public.entitlements (user_id, source, ends_at, note, chapter)
  values (me, 'redeem', case when c.grant_days is null then null else now() + make_interval(days => c.grant_days) end, c.note, c.chapter)
  returning * into ent;
  return ent;
end;
$$;
revoke execute on function public.rpc_redeem(text) from public, anon, authenticated;
grant execute on function public.rpc_redeem(text) to authenticated;

-- Wolf's dashboard actions for one chapter (no client grants), e.g.
--   select public.admin_make_chapter_code('formatting', 365, 'Chapter 2 tester');
--   select public.admin_grant_chapter('CleanLedger42', 'formulas', 30, 'support');
create or replace function public.admin_make_chapter_code(p_chapter text, p_days integer default null, p_note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  out_code text;
begin
  if not exists (select 1 from public.chapters where id = p_chapter) then raise exception 'no such chapter'; end if;
  out_code := public.admin_make_code(p_days, p_note);
  update public.redeem_codes set chapter = p_chapter where code = out_code;
  return out_code;
end;
$$;
revoke execute on function public.admin_make_chapter_code(text, integer, text) from public, anon, authenticated;

create or replace function public.admin_grant_chapter(p_handle text, p_chapter text, p_days integer default null, p_note text default null)
returns public.entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
  ent public.entitlements;
begin
  if not exists (select 1 from public.chapters where id = p_chapter) then raise exception 'no such chapter'; end if;
  select id into target from public.profiles where lower(handle) = lower(p_handle);
  if target is null then raise exception 'no such handle'; end if;
  insert into public.entitlements (user_id, source, ends_at, note, chapter)
  values (target, 'admin', case when p_days is null then null else now() + make_interval(days => p_days) end, p_note, p_chapter)
  returning * into ent;
  return ent;
end;
$$;
revoke execute on function public.admin_grant_chapter(text, text, integer, text) from public, anon, authenticated;

-- ---------------------------------------------------------------- (e) the gate on the write path
-- 0004's rpc_record_attempt with the access check: a lesson in a chapter the account can't open is
-- refused before anything is stored. The client drops the queued item on 'no access' (store.js).
create or replace function public.rpc_record_attempt(p jsonb)
returns public.lesson_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.attempts;
  inserted boolean;
  out_row public.lesson_progress;
begin
  if (select auth.uid()) is null then raise exception 'not signed in'; end if;
  a := public.validate_attempt(p, (select auth.uid()), 'live');
  if not public.ref_open((select auth.uid()), a.lesson_id) then raise exception 'no access'; end if;
  insert into public.attempts values (a.*) on conflict (id) do nothing;
  inserted := found;
  if inserted then perform public.apply_attempt(a); end if;
  select * into out_row from public.lesson_progress
  where user_id = (select auth.uid()) and lesson_id = a.lesson_id;
  return out_row;
end;
$$;
revoke execute on function public.rpc_record_attempt(jsonb) from public, anon, authenticated;
grant execute on function public.rpc_record_attempt(jsonb) to authenticated;

-- 0007's rpc_submit_game_attempt with the same check on drills, timed lessons, challenges and
-- assessments. The Daily and rapid-fire are open to every account.
create or replace function public.rpc_submit_game_attempt(p jsonb, p_guest boolean default false)
returns public.game_pbs
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.game_attempts;
  out_row public.game_pbs;
begin
  if (select auth.uid()) is null then raise exception 'not signed in'; end if;
  a := public.validate_game_attempt(p, (select auth.uid()), case when p_guest then 'guest' else 'live' end);
  if a.kind in ('drill', 'lesson-timed', 'challenge', 'assessment') and not public.ref_open((select auth.uid()), a.ref) then
    raise exception 'no access';
  end if;
  insert into public.game_attempts values (a.*) on conflict (id) do nothing;
  if found then perform public.apply_game_attempt(a); end if;
  select * into out_row from public.game_pbs
  where user_id = (select auth.uid()) and ref = a.ref;
  return out_row;
end;
$$;
revoke execute on function public.rpc_submit_game_attempt(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.rpc_submit_game_attempt(jsonb, boolean) to authenticated;

-- ---------------------------------------------------------------- desk internals
-- A join code: TEAM- and two groups of four from an alphabet with no 0/O or 1/I confusion. The
-- prefix tells a desk code from a single-use redeem code in the one box on Plan and billing.
create or replace function public.make_desk_code()
returns text
language plpgsql
set search_path = ''
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  raw text := '';
  i int;
begin
  for i in 1..8 loop
    raw := raw || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return 'TEAM-' || substr(raw, 1, 4) || '-' || substr(raw, 5, 4);
end;
$$;
revoke execute on function public.make_desk_code() from public, anon, authenticated;

-- A seat's access: one 'group' row per member, ending with the desk (paid_until), ended early when
-- the member leaves or is removed.
create or replace function public.desk_seat_grant(p_desk uuid, p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  d public.desks;
begin
  select * into d from public.desks where id = p_desk;
  if d.id is null then raise exception 'no such desk'; end if;
  insert into public.entitlements (user_id, source, ends_at, note, desk_id)
  values (p_user, 'group', d.paid_until, left('Teams desk: ' || d.name, 200), p_desk);
end;
$$;
revoke execute on function public.desk_seat_grant(uuid, uuid) from public, anon, authenticated;

create or replace function public.desk_seat_end(p_desk uuid, p_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.entitlements set ends_at = now()
  where desk_id = p_desk and user_id = p_user and source = 'group'
    and (ends_at is null or ends_at > now())
$$;
revoke execute on function public.desk_seat_end(uuid, uuid) from public, anon, authenticated;

-- The caller's desk and role, or nothing.
create or replace function public.my_desk(p_user uuid)
returns table (desk_id uuid, role text)
language sql
stable
security definer
set search_path = ''
as $$
  select m.desk_id, m.role from public.desk_members m
  join public.desks d on d.id = m.desk_id and d.closed_at is null
  where m.user_id = p_user
$$;
revoke execute on function public.my_desk(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------- admin: Wolf sells a desk by hand
-- From the dashboard SQL editor (no client grants), e.g.
--   select * from public.admin_make_desk('Northbridge analyst class', 12, '2027-07-01', 'CleanLedger42');
--   select public.admin_set_desk('<desk id>', 15, '2027-10-01');
--   select public.admin_close_desk('<desk id>');
-- The owner, when named, takes the first seat and runs the seat view; the seats count every member.
create or replace function public.admin_make_desk(p_name text, p_seats integer, p_paid_until timestamptz default null,
                                                  p_owner_handle text default null, p_note text default null)
returns table (desk_id uuid, code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  d public.desks;
  owner_id uuid;
  tries int := 0;
begin
  if p_owner_handle is not null then
    select id into owner_id from public.profiles where lower(handle) = lower(p_owner_handle);
    if owner_id is null then raise exception 'no such handle'; end if;
    if exists (select 1 from public.desk_members where user_id = owner_id) then raise exception 'on a desk'; end if;
  end if;
  loop
    begin
      insert into public.desks (name, code, seats, paid_until, note)
      values (btrim(p_name), public.make_desk_code(), p_seats, p_paid_until, p_note)
      returning * into d;
      exit;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 5 then raise; end if;
    end;
  end loop;
  if owner_id is not null then
    insert into public.desk_members (desk_id, user_id, role) values (d.id, owner_id, 'owner');
    perform public.desk_seat_grant(d.id, owner_id);
  end if;
  return query select d.id, d.code;
end;
$$;
revoke execute on function public.admin_make_desk(text, integer, timestamptz, text, text) from public, anon, authenticated;

-- New seats or a new paid-until date: every live seat's row moves with it.
create or replace function public.admin_set_desk(p_desk uuid, p_seats integer, p_paid_until timestamptz)
returns public.desks
language plpgsql
security definer
set search_path = ''
as $$
declare
  d public.desks;
begin
  select * into d from public.desks where id = p_desk for update;
  if d.id is null then raise exception 'no such desk'; end if;
  if p_seats < (select count(*) from public.desk_members where desk_id = p_desk) then
    raise exception 'fewer seats than members';
  end if;
  update public.desks set seats = p_seats, paid_until = p_paid_until where id = p_desk returning * into d;
  update public.entitlements set ends_at = p_paid_until
  where desk_id = p_desk and source = 'group' and (ends_at is null or ends_at > now());
  return d;
end;
$$;
revoke execute on function public.admin_set_desk(uuid, integer, timestamptz) from public, anon, authenticated;

-- Close a desk: every seat's access ends now and every member is free to join another desk.
create or replace function public.admin_close_desk(p_desk uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.desks set closed_at = coalesce(closed_at, now()) where id = p_desk;
  if not found then raise exception 'no such desk'; end if;
  update public.entitlements set ends_at = now()
  where desk_id = p_desk and source = 'group' and (ends_at is null or ends_at > now());
  delete from public.desk_members where desk_id = p_desk;
end;
$$;
revoke execute on function public.admin_close_desk(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------- (g) the desk RPCs
-- The join page before joining: the desk's name, its owner's handle, the seats left and until when.
-- Anyone with the code may look (the code is the invitation); nothing else about the desk shows.
create or replace function public.rpc_desk_preview(p_code text)
returns table (name text, owner_handle text, seats_left integer, paid_until timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select d.name,
         (select p.handle from public.desk_members m join public.profiles p on p.id = m.user_id
          where m.desk_id = d.id and m.role = 'owner'),
         greatest(d.seats - (select count(*) from public.desk_members m where m.desk_id = d.id)::int, 0),
         d.paid_until
  from public.desks d
  where d.code = upper(btrim(coalesce(p_code, '')))
    and d.closed_at is null
    and (d.paid_until is null or d.paid_until > now())
$$;
revoke execute on function public.rpc_desk_preview(text) from public, anon, authenticated;
grant execute on function public.rpc_desk_preview(text) to anon, authenticated;

-- Join by code: a seat, and Full Access until the desk's date. Ten tries an hour per account,
-- counted in events. A refusal comes back as { error } rather than an exception, so the try it
-- counted is kept (an exception would roll the count back with it, which is why rpc_redeem's own
-- count only ever sees successful redemptions). The desk row is locked so two joins can't take the
-- last seat twice. Joining the desk you are already on returns it again.
--   { name, paid_until }  or  { error: 'bad code' | 'too many tries' | 'desk ended' | 'on a desk' | 'desk full' }
create or replace function public.rpc_desk_join(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  d public.desks;
  normalized text;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  normalized := upper(btrim(coalesce(p_code, '')));
  if normalized !~ '^TEAM-[A-Z0-9]{4}-[A-Z0-9]{4}$' then return jsonb_build_object('error', 'bad code'); end if;
  if (select count(*) from public.events
      where user_id = me and name = 'desk_try' and at > now() - interval '1 hour') >= 10 then
    return jsonb_build_object('error', 'too many tries');
  end if;
  insert into public.events (user_id, name) values (me, 'desk_try');
  select * into d from public.desks where code = normalized and closed_at is null for update;
  if d.id is null then return jsonb_build_object('error', 'bad code'); end if;
  if exists (select 1 from public.desk_members where desk_id = d.id and user_id = me) then
    return jsonb_build_object('name', d.name, 'paid_until', d.paid_until);
  end if;
  if d.paid_until is not null and d.paid_until <= now() then return jsonb_build_object('error', 'desk ended'); end if;
  if exists (select 1 from public.desk_members where user_id = me) then return jsonb_build_object('error', 'on a desk'); end if;
  if (select count(*) from public.desk_members where desk_id = d.id) >= d.seats then return jsonb_build_object('error', 'desk full'); end if;
  insert into public.desk_members (desk_id, user_id, role) values (d.id, me, 'member');
  perform public.desk_seat_grant(d.id, me);
  return jsonb_build_object('name', d.name, 'paid_until', d.paid_until);
end;
$$;
revoke execute on function public.rpc_desk_join(text) from public, anon, authenticated;
grant execute on function public.rpc_desk_join(text) to authenticated;

-- Leave: the seat frees and its access ends. The owner stays (Wolf moves a desk's owner by hand).
create or replace function public.rpc_desk_leave()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  m record;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  select * into m from public.my_desk(me);
  if m.desk_id is null then raise exception 'not on a desk'; end if;
  if m.role = 'owner' then raise exception 'owner stays'; end if;
  delete from public.desk_members where desk_id = m.desk_id and user_id = me;
  perform public.desk_seat_end(m.desk_id, me);
end;
$$;
revoke execute on function public.rpc_desk_leave() from public, anon, authenticated;
grant execute on function public.rpc_desk_leave() to authenticated;

-- The member's view of their desk, or null: the name, the caller's role, the seats and those taken,
-- the paid-until date, the members (handle, level, role, joined), and the code for the owner only.
create or replace function public.rpc_desk_mine()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid;
  m record;
  d public.desks;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  select * into m from public.my_desk(me);
  if m.desk_id is null then return null; end if;
  select * into d from public.desks where id = m.desk_id;
  return jsonb_build_object(
    'name', d.name,
    'role', m.role,
    'seats', d.seats,
    'used', (select count(*) from public.desk_members where desk_id = d.id),
    'paid_until', d.paid_until,
    'code', case when m.role = 'owner' then d.code else null end,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object('handle', p.handle, 'level', p.level, 'role', dm.role,
                                          'joined_at', dm.joined_at, 'me', dm.user_id = me)
                       order by dm.role = 'owner' desc, dm.joined_at, p.handle)
      from public.desk_members dm join public.profiles p on p.id = dm.user_id
      where dm.desk_id = d.id), '[]'::jsonb));
end;
$$;
revoke execute on function public.rpc_desk_mine() from public, anon, authenticated;
grant execute on function public.rpc_desk_mine() to authenticated;

-- The owner's seat view: each member's lessons done, chapters Verified and when they were last
-- active. Nothing else about a member: the join page promises exactly this.
create or replace function public.rpc_desk_seats()
returns table (handle text, level integer, role text, joined_at timestamptz, lessons_done integer, chapters_verified integer, last_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  me uuid;
  m record;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  select * into m from public.my_desk(me);
  if m.desk_id is null then raise exception 'not on a desk'; end if;
  if m.role <> 'owner' then raise exception 'not owner'; end if;
  return query
    select p.handle, p.level, dm.role, dm.joined_at,
           (select count(*)::int from public.lesson_progress lp where lp.user_id = dm.user_id and lp.completed),
           (select count(distinct g.chapter)::int from public.chapter_gates g
            where exists (select 1 from public.attempts a where a.user_id = dm.user_id and a.lesson_id = g.lesson_id
                            and a.secs is not null and a.secs <= g.limit_secs)),
           greatest((select max(lp.last_at) from public.lesson_progress lp where lp.user_id = dm.user_id),
                    (select max(ga.created_at) from public.game_attempts ga where ga.user_id = dm.user_id))
    from public.desk_members dm join public.profiles p on p.id = dm.user_id
    where dm.desk_id = m.desk_id
    order by dm.role = 'owner' desc, dm.joined_at, p.handle;
end;
$$;
revoke execute on function public.rpc_desk_seats() from public, anon, authenticated;
grant execute on function public.rpc_desk_seats() to authenticated;

-- The owner frees a seat: the member leaves the desk and their access from it ends now.
create or replace function public.rpc_desk_remove(p_handle text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  m record;
  target uuid;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  select * into m from public.my_desk(me);
  if m.desk_id is null then raise exception 'not on a desk'; end if;
  if m.role <> 'owner' then raise exception 'not owner'; end if;
  select dm.user_id into target from public.desk_members dm join public.profiles p on p.id = dm.user_id
  where dm.desk_id = m.desk_id and lower(p.handle) = lower(btrim(coalesce(p_handle, '')));
  if target is null or target = me then raise exception 'no member'; end if;
  delete from public.desk_members where desk_id = m.desk_id and user_id = target;
  perform public.desk_seat_end(m.desk_id, target);
end;
$$;
revoke execute on function public.rpc_desk_remove(text) from public, anon, authenticated;
grant execute on function public.rpc_desk_remove(text) to authenticated;

-- The owner retires the code (shared too widely) and gets a new one; members stay.
create or replace function public.rpc_desk_new_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  m record;
  out_code text;
  tries int := 0;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  select * into m from public.my_desk(me);
  if m.desk_id is null then raise exception 'not on a desk'; end if;
  if m.role <> 'owner' then raise exception 'not owner'; end if;
  loop
    begin
      update public.desks set code = public.make_desk_code() where id = m.desk_id returning code into out_code;
      return out_code;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 5 then raise; end if;
    end;
  end loop;
end;
$$;
revoke execute on function public.rpc_desk_new_code() from public, anon, authenticated;
grant execute on function public.rpc_desk_new_code() to authenticated;

-- The desk's board for one ref (p_seed: one sheet of it, as the Daily): every member's best clean
-- run, ranked by time, then keys, then the earlier run, as the global boards are (M104). Members
-- see each other whatever their public-profile setting: joining the desk is the consent.
create or replace function public.rpc_desk_board(p_ref text, p_seed bigint default null)
returns table (pos bigint, handle text, level integer, secs numeric(8,2), keys integer, at timestamptz, mine boolean, field bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  me uuid;
  m record;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  select * into m from public.my_desk(me);
  if m.desk_id is null then raise exception 'not on a desk'; end if;
  if coalesce(p_ref, '') !~ '^[a-z0-9-]{1,64}$' then return; end if;
  return query
    with best as (
      select b.user_id, b.secs, b.keys, b.at from public.game_pbs b
      where p_seed is null and b.ref = p_ref
      union all
      select s.user_id, s.secs, s.keys, s.at from (
        select distinct on (a.user_id) a.user_id, a.secs, a.keys, coalesce(a.client_at, a.created_at) as at
        from public.game_attempts a
        where p_seed is not null and a.ref = p_ref and a.seed = p_seed and a.clean and a.secs is not null
        order by a.user_id, a.secs asc, a.keys asc, coalesce(a.client_at, a.created_at) asc
      ) s
    )
    select row_number() over (order by r.secs asc, r.keys asc, r.at asc),
           p.handle, p.level, r.secs, r.keys, r.at, r.user_id = me, count(*) over ()
    from best r
    join public.desk_members dm on dm.user_id = r.user_id and dm.desk_id = m.desk_id
    join public.profiles p on p.id = r.user_id
    order by r.secs asc, r.keys asc, r.at asc;
end;
$$;
revoke execute on function public.rpc_desk_board(text, bigint) from public, anon, authenticated;
grant execute on function public.rpc_desk_board(text, bigint) to authenticated;
