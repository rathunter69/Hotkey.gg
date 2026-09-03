-- r452 (Wolf, 2026-09-03): THE BETA IS RETIRED. The client-side curtain (PRELAUNCH_LOCK,
-- showPrelaunchLock, hk_beta_ok) was deleted in the same round — see dev/BETA_RETIRE_LANDING.md
-- Part I and dev/LAUNCH.md Phase 1. This migration removes the server half: the access-code table
-- and the anon-callable validator nothing calls any more. `redeem_code` / members (the silent
-- membership auto-redeem, index.html INVITE_AUTO_CODE) are a DIFFERENT mechanism and stay.
-- Data lost: one row ('hags', 15 uses) — recorded here for the ledger.
drop function if exists public.curtain_check(text);
drop table if exists public.beta_codes;
