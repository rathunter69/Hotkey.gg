# Payments and subscriptions — Area 10

Updated: 2026-09-19
Task: `01a0b969-ac99-7553-bc36-42868257ff55` (Plan payments access rules)
Branch: `codex/payments-plan`
Starting commit: `b2dad98f46e521307b8d7b75245068b9511a2628` (`codex/repository-foundation`)
State: planning checkpoint; publication and exact remote identity recorded in this file's commit history.
Owned files: **only `docs/handoffs/payments.md`**. CURRENT.md and PRODUCT.md remain chief-owned.

## Scope and outcome

Define one simple individual free/paid offer and its access lifecycle. Wolf's September 19
request authorizes planning, this dedicated branch checkpoint and handoff to chief task
`01a0b0fa-d857-7002-ab95-1da0a1cfb858`. Checkout stays inactive. No runtime, billing setting,
customer, migration, catalog, main merge or deployment changes.

This planning branch follows Wolf's requested latest foundation guidance. The separately
accepted implementation baseline remains `16ee8306a8c170db9f8fe2e051b44b0519782ae1`;
starting a future implementation here would omit the accepted repair/test integration.
Read latest shared guidance and the chief's implementation baseline again before any code work.
The dirty original checkout is preserved. Local command-line Git could not reach GitHub in
this session; the authenticated GitHub connector is used for remote branch publication.
Before publication, shared guidance was refreshed through
`dc939ea2c6efd32b0afd6bc8249a4e78af43c536`. The complete intervening CURRENT/PRODUCT/
TASK_STARTERS diff was read: the chief already records P1/P2 and assigns Catalog a new
`docs/handoffs/drill-catalog.md` curriculum roadmap. No commercial rule conflict or change
to this task's one-file ownership; coordinate exact inclusion with that roadmap.

## Confirmed decisions and provenance

Existing constraints come from [PRODUCT at the starting commit](https://github.com/rathunter69/Hotkey.gg/blob/b2dad98f46e521307b8d7b75245068b9511a2628/docs/PRODUCT.md)
and [Catalog's approved decision register](https://github.com/rathunter69/Hotkey.gg/blob/15de791605cbfb4fa6bbc26c2d8f5f4a94139477/docs/handoffs/catalog-progression.md).
They remain distinct from this area's proposals.

- Complete useful free everyday foundations: navigation, editing, formatting, basic formulas,
  ribbon/Excel functionality, repeat practice and personal speedruns for included content.
- Advanced lessons and model-building use subscription access. Exact lesson membership is open.
- A first guest lesson precedes signup. Account saving, payment, readiness and public entry are
  separate conditions. Free access does not automatically authorize guest public scoring.
- Readiness only at major skill jumps, satisfied by relevant correct independent work or test-out.
  Purchase supplies access, never readiness or XP. Helped ordinary completion advances learning.
- Completion certificates cover substantial named sets, including helped/mouse completions.
  They do not claim independently assessed skill, accreditation or speed.
- Preserve earned XP, achievements, credentials, personal results, historical PBs and known completion.
  Detailed history stays private unless the learner chooses the applicable public sharing.
- Desks is separate and optional for businesses/training providers. No individual-plan purchase
  implies desk administration, seats, reporting or organizational licensing.

**Explicit answers in this task, September 19:**

| ID | Wolf's choice | Acceptance example / remaining limit |
|---|---|---|
| P1 | A few complete advanced preview lessons | A free learner finishes the entire selected sample. This does not promise a sample in every course; Catalog selects membership and learning credit. |
| P2 | Free selected public challenges; certificates follow content | Selected public challenges have no subscription fee; exact benchmark/Daily membership remains Catalog-owned. Certificate qualification/access follows the required content; set composition, including mixed free/paid sets, and issuance timing remain open. Earned certificates/results remain accessible. |

P1 resolves preview form, not exact content. P2 resolves the economic boundary, not scoring,
guest publication, certificate qualification or new issue/reissue mechanics. Neither answer
changes existing code or authorizes billing. Historical $7/month/$19-season copy is not an
approved price; the current all-free switches are not a permanent commercial promise.

## Simple access table

This is the intended offer, **not current implemented gating**. “Free” is an access price,
not a promise of anonymous account saving or public submission.

| Experience | Free individual access | Individual subscription |
|---|---|---|
| Complete everyday beginner path | Included, with useful practice and ribbon/Excel teaching | Included |
| Repeat practice / personal speedruns of free content | Included | Included |
| Selected complete advanced samples | Included; a few, chosen with Catalog | Included |
| Other advanced lessons / practical models | Subscription required | Included, subject to separate major-jump readiness |
| Personal speedruns / replay of paid advanced content | Proposed: follows paid content entitlement | Proposed: included for supported drills while entitled |
| Selected public challenges | Included; exact benchmark/Daily selection remains Catalog-owned, with the agreed eligibility and retry rules | Same access and scoring; no purchased scoring advantage |
| Completion certificates | Access follows required content; earned credentials remain accessible | Includes applicable paid content; exact free/paid/mixed sets and issuance timing open; no separate certificate fee proposed |
| Saved history, earned XP/awards, prior certificates/results | Preserved; payment lapse does not erase or reclassify them | Same retention and privacy principles |
| Business Desks, seats and organization tools | Separate offer to define with Desks | Separate; not bundled by this plan |

The complete free path is not synonymous with the current chapter named Foundations.
Catalog owns exact lesson IDs/versions, preview list, prerequisite mapping and substantial
certificate sets. Chapter order, difficulty labels or a shared challenge link must not silently
determine entitlement. A free advanced benchmark does not unlock its surrounding paid course.
Preview completion is real completion of that unit; it does not assert completion of a whole
course, establish readiness without qualifying evidence, or override help/input rules.

## Commercial choices — pending unless explicitly answered

| Topic | Lead recommendation | Alternative / status |
|---|---|---|
| Individual price and intervals | Provisional US$9 monthly or US$90 billed annually for the same included content | US$12/$120, or defer price until paid catalog is defined. Question sent; no answer yet. Currency, taxes, unit economics and final launch price remain unvalidated. |
| Trial | No additional subscription trial; useful free path and full samples demonstrate value | Optional 7-day trial without a payment card. Question sent; no answer yet. |
| Expired advanced access | Renewal needed for new attempts/replay/speedruns of paid advanced content; retain history | Keep completed paid lessons playable. Question sent; no answer yet. |
| Cancellation | Self-service at any time; stop renewal, keep access until the paid-through time | Proposed; not yet asked/approved. Show the exact final access date and cancellation confirmation. |
| Voluntary refunds | Full refund requested within 14 days of the first individual payment, monthly or annual; no routine prorated change-of-mind refund after that window | Proposed commercial policy, not law or approved terms. Renewal mistakes, duplicate charges, service failures and mandatory rights need an explicit policy. |
| Failed renewal | Clear update-payment notice and a short bounded grace period before advanced access ends | Duration and conditions open. Never confuse payment grace with Storage's public-result submission grace. |
| Certificate claim after expiry | If all required evidence qualified while entitled, permit later claim/download without repurchase | Proposal for consistency with earned-history protection. Evidence cutoff, version mapping and account requirement need Catalog/Storage agreement. |

Monthly/annual are proposals, not a settled currency or tax-inclusive price. No seasonal plan,
lifetime offer, extra individual tier, coupon, automatic trial or enterprise price is selected.
Business facts, provider readiness, countries served, tax presentation and consumer-contract
classification remain Area 12 inputs; do not copy a jurisdiction from this PC's timezone.
A voluntary refund promise does not replace applicable statutory rights.

## Lifecycle contract to settle

These are planning acceptance cases, not a tested implementation.

| State / event | Intended access and history behavior | Status |
|---|---|---|
| Guest or free account | Free path, samples and selected public challenges; saving/public-entry rules remain separate | Offer confirmed; exact account/verification rules open |
| Checkout abandoned, initial payment incomplete or authentication pending | Keep free access; do not label a return-page visit as paid success | Proposed implementation contract |
| Successful purchase / renewal | Authenticated payer gets the appropriate validated access period, once; readiness unchanged | Proposed implementation contract |
| Cancellation scheduled | Paid content remains available to the displayed paid-through time; no further renewal | Proposed policy |
| Expiry | Retain all earned/history records; advanced playback/new attempts follow Wolf's pending expiry answer | History confirmed; playable access pending |
| Payment lookup/network failure | Say verification is pending/unavailable; retain work and history; do not display an invented expiry or grant unlimited access | Offline lease and existing-session details open with Security/Storage |
| Refund | Track refund and cancellation separately; never falsely promise a completed refund; retain learning/history | Refund policy, access-end timing and failure recovery open |
| Return after a lapse | Restore access after a valid new purchase and show existing progress; do not re-award old completions | Proposed acceptance contract |
| Cancel or expire while an attempt/save is in progress | Preserve the attempt and original facts; no data loss. Whether an already-authorized attempt can finish needs a bounded rule | Open with Catalog/Storage/Security |
| Individual entitlement plus organizational grant | Evaluate each valid source independently; loss of one is not automatic loss of the other | Proposed boundary; Desks owns seat/member rules |

Example: canceling during a paid period should not erase a finished model, PB or certificate.
When paid access later ends, retained history must remain visibly distinct from permission to
start another paid attempt. Restoring access must not duplicate XP, completion or certificates.
Changing a lesson from free to paid must not rewrite its historical completion or old certificate;
future catalog/access changes require a versioned transition, not a retroactive progress reset.

## Current scaffold and evidence

Reuse [DATA_SECURITY](https://github.com/rathunter69/Hotkey.gg/blob/b2dad98f46e521307b8d7b75245068b9511a2628/docs/audit/DATA_SECURITY.md)
and [EXPERIENCE EXP-05/07](https://github.com/rathunter69/Hotkey.gg/blob/b2dad98f46e521307b8d7b75245068b9511a2628/docs/audit/EXPERIENCE.md).
A focused read-only agent checked application source at
`16ee8306a8c170db9f8fe2e051b44b0519782ae1`; no production inventory is repeated.

| Pinned source | Newly confirmed source evidence |
|---|---|
| [drills.js](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/drills.js#L327) | Premium disabled; old four-chapter paid mapping at 331 and all-entitled early return at 475-480. HOTKEY_PRO.freeNow and $7/$19 placeholders at 844-852. These do not select the future catalog boundary or price. |
| [nav.js](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/nav.js#L1661) | Shared modal can call test checkout with body user_id; yearly fallback differs from configured monthly/season options. hkFlagPro at 1855-1865 reads retired beta. |
| [billing.html](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/billing.html#L132) | Disabled/TBD billing, conflicting certificate/cosmetic copy, default plan='pro' and absent-schema plan/invoices reads. Display fallback is not paid-access authority. |
| [create-checkout](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/supabase/functions/create-checkout/index.ts#L12) | Refuses non-test keys; trusts body user_id as client reference, ignores client plan and uses one configured price. No live-key/settings check was made here. |
| [education trial](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/supabase/migrations/20260717400000_edu_trial.sql#L28) | One-time seven-day school trial; trainer auto-calls it on .edu signup at index.html 32623-32637. It is existing behavior, not approval for a general consumer trial. |
| [desk seats](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/supabase/migrations/20260717500000_desk_pro_seats.sql#L7) | my_pro combines personal expiry and eligible desk seats. Earlier my_pro_status source label omits the later seat predicate and returns only personal expiry; pro boolean calls the newer helper, but source/expiry metadata can mislead. |
| [RPC grants](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/supabase/migrations/20260903000500_rpc_grants.sql#L171) | Entitlement/status/trial RPCs are authenticated; my_pro is internal. Client entitlement writes are revoked. This does not implement Stripe lifecycle authority. |

Repository source search found no implemented payment webhook, durable Stripe customer/
subscription mapping or event ledger, customer portal, invoice table migration, or complete
renewal/failure/cancellation/refund handlers. This confirms scaffold incompleteness at the
pinned source, not the contents of an uninspected Stripe dashboard. School-trial transitions
and inconsistent desk status metadata are explicit future reconciliation work, not cleanup
authorized in this turn.

- Multiple meanings of PRO: disabled premium gates/free-for-now perks, retired beta flag reads,
  and server entitlement checks for Desks. Do not switch these flags to activate payments.
- Checkout is a test scaffold with no established authoritative billing lifecycle.
  The audit found caller identity taken from body user_id rather than bound to the validated caller.
- Billing UI includes disabled actions/TBD pricing and conflicting older offer copy.
  The [database assessment](https://github.com/rathunter69/Hotkey.gg/blob/6a73f8e649f875f567f44748c9e677d1065ac5d5/docs/handoffs/repository-database.md)
  found profiles.plan/invoices reads without corresponding deployed schema objects.
- Existing school/admin/desk grants are not approval for a consumer subscription trial.
  Runtime automatically invokes a one-time seven-day .edu entitlement trial. Whether it remains,
  changes or coexists with a consumer trial is open. Preserve and trace existing grant history.
- Paid lesson data is in the publicly served static application. A journey gate cannot make
  already-served source confidential. Future authoritative service access and content-delivery
  expectations need separate design; this is not permission for a framework rewrite.
- Draft business/legal information and incomplete purchase/renewal/failure/cancel/refund
  integration block a paid launch. Existing test-only behavior stays intact.

Before separately authorized billing implementation: settle this policy, bind purchases to the
authenticated account, validate allowed prices, verify payment events, handle duplicate/delayed/
out-of-order events, reconcile access with authoritative state, provide billing management and
test the entire lifecycle in isolation. Preserve Security's boundaries; paid status is not a
permission override for Desks or another account's records.

## Coordination and external references

Catalog task `01a0b148-2693-7901-af91-934c83cabe1d` reviewed the boundary and found no conflict
with confirmed learning direction. It reaffirmed exact content/preview/certificate-set ownership
and that free access is not guest-publication approval. P1/P2 were sent back to Catalog.
Its review does not approve price, trial or lifecycle proposals.

Relevant linked handoffs read for constraints:
[Catalog](https://github.com/rathunter69/Hotkey.gg/blob/7193044d41b348d3f31df4d3f4ff53457a8b39a8/docs/handoffs/catalog-progression.md),
[Storage](https://github.com/rathunter69/Hotkey.gg/blob/e9f3e6e06b84378b57ec03534920ba9bb01f8ee4/docs/handoffs/leaderboards-storage.md),
[UI](https://github.com/rathunter69/Hotkey.gg/blob/731ee791683c603ba4e788c242dcb6834f4f7db3/docs/handoffs/experience-site.md).
Storage owns save/receipt/import/comparison; UI owns truthful access/save messages; Catalog owns
learning qualification; Security owns authorization; Desks owns organization roles/licensing;
Area 12 owns business/tax facts; chief reconciles CURRENT/PRODUCT.

Official documentation checked September 19 for later implementation constraints:
- [Stripe cancellation](https://docs.stripe.com/billing/subscriptions/cancel): period-end cancellation
  can preserve the already-paid period; cancellation and refund choices must be explicit.
- [Stripe subscription events](https://docs.stripe.com/billing/subscriptions/webhooks):
  validated subscription/payment changes drive access; redirect/display flags are insufficient.
- [Stripe trials](https://docs.stripe.com/billing/subscriptions/trials):
  no-card trials require an explicit end behavior; provider capability is not product approval.
- [Stripe refunds](https://docs.stripe.com/refunds):
  refunds have pending/failure states to communicate honestly.
- [EU consumer guidance](https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm):
  withdrawal rights and digital-content/service exceptions depend on circumstances.
  No conclusion is made about Hotkey's legal classification or applicable jurisdiction.

The Supabase skill was read for source review. Its changelog markdown fetch failed; no API,
configuration, database or live-service change depends on that unavailable reference.

## Verification and next step

Read latest remote AGENTS, README, CURRENT, PRODUCT, DEVELOPMENT and TASK_GUIDE, then relevant
architecture, audit, handoff format and linked area evidence. Existing audits are historical
evidence with their stated limits; this task does not claim fresh live service parity.

Documentation-only validation: local link inventory and trailing-whitespace checks passed;
all document links are explicit HTTPS references. Independent draft review completed: clarified
selected challenge membership, mixed certificate sets, unissued-certificate timing and the existing
.edu trial. Remote single-file manifest/parent/blob verification accompanies the final checkpoint. No application tests, npm check, browser
suite, payment transaction, real account test or database query was run in this planning task,
under TASK_GUIDE's documentation exception. No production action or new paid gate.

**For the chief:** Area 10 is now assigned. Integrate P1/P2 as dated decisions and the offer table
as bounded planning, preserving all marked open questions. Do not mark subscription integration
complete or checkout ready. This task owns only this handoff.

**Next bounded objective:** finish the current price/trial/expiry questions, then ask one small
cancellation/refund packet; reconcile Catalog's exact membership and certificate timing.
Do not start checkout work while those choices and business/release prerequisites remain open.
