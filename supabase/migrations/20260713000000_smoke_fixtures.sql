-- SMOKE FIXTURES (r132) — reseed + a dedicated test seed.
-- LESSON (live): `supabase db push` is STATEFUL — applied migrations never
-- re-run, so the r119 seed insert cannot restore a consumed seed. The r131
-- smoke run claimed-and-deleted the Wharton seed; this re-stamps all 8 school
-- seeds (idempotent, fixed codes unchanged) and adds 'smoke-u': an ownerless,
-- private test desk whose edu_domain matches the smoke harness accounts
-- (hotkeysmoketest.edu), so claim tests consume ONLY this fixture from now on.
-- Real school seeds are only ever member-joined by the harness (non-destructive).
-- After any full smoke run that consumes smoke-u, restore it by shipping a
-- fresh copy of this insert under a NEW timestamp (db push will skip this one).
-- REMOVE smoke-u AT LAUNCH (T&S pass) — it is invisible to real students
-- (domain never matches) but shouldn't outlive the beta.

insert into public.teams (name, slug, invite_code, owner_id, is_private, edu_domain) values
  ('Wharton',                  'wharton',      '25a39fde', null, false, 'upenn.edu'),
  ('Harvard Business School',  'hbs',          '13584c31', null, false, 'hbs.edu'),
  ('Stanford GSB',             'stanford-gsb', '5516d73c', null, false, 'stanford.edu'),
  ('Columbia Business School', 'cbs',          'e70508a8', null, false, 'columbia.edu'),
  ('Chicago Booth',            'booth',        '6a22b308', null, false, 'chicagobooth.edu'),
  ('Kellogg',                  'kellogg',      '737d446f', null, false, 'northwestern.edu'),
  ('NYU Stern',                'stern',        '36e0a55c', null, false, 'nyu.edu'),
  ('LSE',                      'lse',          '1b97e1cd', null, false, 'lse.ac.uk'),
  ('Smoke University',         'smoke-u',      'smokeu42', null, true,  'hotkeysmoketest.edu')
on conflict (slug) do nothing;
