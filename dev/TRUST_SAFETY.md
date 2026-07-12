# DESKS — TRUST & SAFETY (r118 design; the launch pass Wolf called)
_Threat Wolf named: impersonation — "an undergrad makes 'PJT RSSG', plays badly
under crude handles, and a real desk's image wears it." This doc is the whole
pass; the protected-names reservation SHIPPED with it (r118 migration)._

## Threat model
1. **Impersonation of real institutions** (the PJT RSSG case) — reputational
   harm lands on the firm AND on hotkey.gg's B2B credibility. HIGHEST priority:
   the corporate funnel dies if firms' first contact is a parody desk.
2. Inappropriate desk names — slur/abuse blocklist (shipped r110, same list as
   handles, leetspeak-folded).
3. Handle abuse inside a desk context (existing server blocklist covers).
4. Desk-name squatting ahead of real institutions claiming them.
5. Invite-code leakage → strangers joining a private cohort.

## SHIPPED r118 — protected-name reservation
Firm names (collapsed-form substring: goldmansachs, morganstanley, evercore,
centerview, liontree…) and desk acronyms (standalone tokens: GS, MS, PJT,
RSSG, KKR, PWP…) raise DESK_NAME_PROTECTED at the trigger. 'Kings of the
Grid' passes; 'GS TMT 2026' is reserved. Client copy: "Real firm and group
names are reserved — verified desks are coming."

## LAUNCH PASS (build order when Wolf calls it)
1. **Verified desks** — `teams.verified boolean` + badge on every desk
   surface. Granted MANUALLY (Wolf) after an institutional-email check:
   captain's auth email domain matches the claimed firm (the school-tag
   mechanism, corporate flavor). Verification UNLOCKS a protected name.
2. **Report flow** — `reports(reporter, kind desk|handle, target, note)` +
   a "report" affordance on public cards/desk pages. Queue reviewed by Wolf;
   no auto-enforcement at beta scale.
3. **Admin powers** (service-role only, never client): force-rename desk,
   suspend desk (hidden from boards, members notified), transfer captaincy.
4. **Rate limits** — 1 desk creation per account per day (trigger); invite
   code ROTATION RPC for captains (leak recovery).
5. **Audit trail** — desk name changes logged (old, new, who, when).
6. **Policy text** — impersonation clause for terms.html at launch: parody/
   unaffiliated use of firm names prohibited; firms may claim their name via
   verification.
7. Private-by-default suggestion when a corporate domain creates a desk.

## Interactions that already help
- One-desk-per-player keeps brigading expensive.
- .edu school tags (v1.5) are DERIVED from auth email — a fake "Wharton"
  desk full of non-Wharton emails is visibly hollow once home-desk badging
  lands.
- Names run through the handle blocklist + leetspeak folding since r110.
