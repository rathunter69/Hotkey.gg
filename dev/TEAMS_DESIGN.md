# TEAMS / CLUBS / SCHOOLS — design doc (r109, Wave 4 #27)
_Wolf signed off 2026-07-12: DESKS naming, one desk/player, cap 200, pre-seed.
v1 backend + join loop SHIPPED r110. Wolf reviews → answers the open questions at the bottom → then the
build phases below become rounds._

## Thesis
Teams are the distribution engine, not a feature. Every analyst class, MBA
club, and bank training cohort is a pre-formed group with (a) an internal
competitive culture and (b) one organizer who can put a link in a group chat.
One captain = 10–150 players. The corporate version of the same object is the
B2B pre-onboarding story (S8 analytics is its evidence arm).

## Personas
1. **Club officer** (Wharton UG Finance, LSE FinSoc): wants a branded
   leaderboard this week; zero admin tolerance; recruits via link.
2. **Cohort self-organizer** (6 first-years at an EB): wants private bragging
   rights; small, invite-only.
3. **Training lead** (the paid future): wants completion tracking against an
   assigned drill list, exportable. NOT in v1 — but the schema must not
   foreclose it.

## What exists today
`profiles.team_code` (r-round 8): a free-text tag + leaderboard team-only
toggle. It proved the demand shape but has no identity, no membership, no
page, no invite mechanics. v1 replaces it (migration keeps old tags as
legacy display until owners claim them).

## V1 — the joinable team (2 rounds)
- **Schema** (supabase migration, RLS on everything):
  - `teams`: id, name (unique, filtered through the r-handle blocklist),
    slug, invite_code (rotating 8-char), owner_id, is_private (default
    false), created_at.
  - `team_members`: team_id, user_id, role ('captain'|'member'), joined_at.
    UNIQUE(user_id) for v1 — ONE team per player keeps every leaderboard
    unambiguous and makes switching a real decision. (Open Q3.)
- **Join flow**: `hotkey.gg/?team=CODE` → landing shows "You've been invited
  to join **{Team}**" over the normal gate → auto-join after signup/login.
  One shareable string; works cold from a group chat.
- **Create flow**: Account page → "Start a team" (name + private toggle) →
  copyable invite link. Captain = creator.
- **Surfaces**: team chip on player card + leaderboard rows (replaces the
  team_code tag); leaderboard "my team" filter upgraded to real membership;
  team page at `leaderboard.html?team=slug` — roster, team PB board, drill
  boards filtered to members. Zero new query engines: same boards, one
  membership WHERE clause.

## V1.5 — SCHOOL TAG (Wolf, 2026-07-12): .edu auto-identity
Wolf's ask: sign up with an institutional email → school badge/identifier,
optional display. Design:
- **Derivation is server-side** (trigger on profiles from auth.email — never
  client-claimed): academic domains (.edu, .ac.uk, .edu.au…) → institution
  tag. Mapping table for the top target schools ('upenn.edu'→'UPenn',
  'hbs.edu'→'HBS'); fallback = registrable domain sans TLD, title-cased.
- `profiles.school_domain` (derived) + `profiles.show_school` boolean
  default FALSE — displaying the badge is OPT-IN, per Wolf.
- Badge: compact school chip beside the handle on card + leaderboard rows,
  auto-colored from the existing group-color system. No logo uploads.
- **Onboarding hook**: `teams.edu_domain` (nullable) marks a desk as a
  school's home desk; first session with a matching domain gets a one-tap
  "Wharton has a desk — join?" prompt. Combined with pre-seeding, this is
  the cold-start loop: seed desk + first .edu signup → self-recruiting.
- Corporate parallel (v3): company domains → private desk auto-suggest —
  the same mechanism IS the B2B pre-onboarding funnel.
- Ships after the leaderboard surfaces round (needs the desk chip anyway).

## V2 — captain tools (1 round, after v1 has real teams)
- Weekly team digest strip on the team page (most improved, new PBs, streak
  leaders) — computed client-side from existing runs, no new infra.
- **Assignments**: captain pins up to 3 drills w/ target pars ("this week:
  Debt Schedule under 190"); members see them on the picker; completion
  ticks on the team page. This is the corporate-training primitive dressed
  as a club feature — same table (`team_assignments`), zero rework later.

## V3 — corporate (BLOCKED until internship ends, design-only note)
Private teams + seat limits + usage export = the paid unit. Stripe stays
test-mode; nothing in v1/v2 references billing. The only v1 obligation:
`is_private` exists from day one so the paid gate is a flag, not a refactor.

## Anti-goals (v1)
No team chat, no avatars/branding uploads (name + auto color from the
existing group-color system), no multi-team membership, no captain moderation
queue beyond kick (owner-only delete-membership).

## Open questions for Wolf
1. **Naming**: "Teams" (neutral) vs "Desks" (house voice — 'join the desk')?
   Recommendation: **Desks** everywhere the product speaks, `teams` in the
   schema.
2. **Size cap** for v1: recommend 150 (a training class), revisit for paid.
3. **One team per player** (recommended, see above) — or allow 2 (school +
   cohort)? One keeps boards honest; two doubles every filter's complexity.
4. Seed strategy: launch empty, or pre-create 5–10 school teams and hand
   codes to your MBA/IB contacts as the beta channel?
