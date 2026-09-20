# Payments and subscriptions — Area 10

Updated: 2026-09-20
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
| Personal speedruns / replay of paid advanced content | Requires current advanced entitlement; prior completion alone does not grant permanent replay | Included for supported paid content while entitled; valid group access is another source |
| Selected public challenges | Included; exact benchmark/Daily selection remains Catalog-owned, with the agreed eligibility and retry rules | Same access and scoring; no purchased scoring advantage |
| Completion certificates | Access follows required content; earned credentials remain accessible | Includes applicable paid content; exact free/paid/mixed sets and issuance timing open; no separate certificate fee proposed |
| Saved history, earned XP/awards, prior certificates/results | Preserved; payment lapse does not erase or reclassify them | Same retention and privacy principles |
| Banking-group invitation access | Full individual learning access for approved invitees until a shared program end date; exact invitation controls proposed | Existing subscriptions and invitation grants must coexist under an explicit billing rule |
| Business Desks, seats and organization tools | Separate offer to define with Desks | Separate; not bundled by this plan |

The complete free path is not synonymous with the current chapter named Foundations.
Catalog owns exact lesson IDs/versions, preview list, prerequisite mapping and substantial
certificate sets. Chapter order, difficulty labels or a shared challenge link must not silently
determine entitlement. A free advanced benchmark does not unlock its surrounding paid course.
Preview completion is real completion of that unit; it does not assert completion of a whole
course, establish readiness without qualifying evidence, or override help/input rules.

## September 20 — trial, expiry and banking-group access

**Explicit user decisions in this task:**
- **P3 — no extra consumer subscription trial.** The useful free path and selected complete
  advanced samples remain available. The existing automatic .edu trial is current source
  behavior, not approved as an exception; its eventual transition remains to be planned.
- **P4 — after expiry, keep free content playable; require renewal for advanced practice.**
  Retain earned history, results, credentials and progress. This selects renewal over permanent
  playability of previously completed paid lessons. Timing for an in-progress attempt and
  evidence-qualified but unissued certificates remains open. A separate still-valid group or
  organizational entitlement can continue to supply access; one source expiring must not
  erase another source.
- **P5 — provide automatic full access through special codes for banking groups.**
  Wolf expects codes to be generated automatically/randomly and wants to prevent sharing.
  This is a future product requirement within the planning task, not permission to implement
  or issue real codes now. Exact duration, issuer authority, eligibility and revocation
  remain open. The group is not assumed to be an existing customer or partner.

**Further explicit answers, September 20:**
- **P6 — $9/month standard, $7/month for students, with the same paid content.**
  This resolves the monthly pricing choice after Wolf's initial $9-versus-$7 question.
  Student eligibility/reverification and tax/currency presentation remain to define.
  That answer alone did not select annual billing; the subsequent P10 answer below does.
- **P7 — one shared access end date per banking group/program.**
  Late redemption does not imply a new full-duration term or extend the shared date.
  The actual dates, redemption cutoff and renewal/extension policy remain open.
- **P8 — cancel anytime; access continues to the end of the paid period.**
  This is ordinary cancellation: stop future renewal and show the final access date.
  Separate refund rights/policies remain applicable.
- **P9 — a 14-day voluntary money-back guarantee on the first subscription payment,**
  applying to monthly or annual billing, in addition to mandatory legal rights.
  This does not select an automatic guarantee on every renewal or resolve all service-failure,
  mistaken-renewal, refund-processing or access-end details.
- **P10 — monthly and annual billing.** Annual is $90 standard or $70 student, paid upfront;
  these annual amounts equal ten of the respective monthly payments. Same included content.
  Student eligibility/reverification, tax presentation, interval switching and price-change
  handling remain open. No seasonal billing or extra content tier is selected.

The student price is a discount on the same learning access, not a separate content tier.
Do not equate the existing .edu trial with a worldwide student verification policy.
The choice authorizes recording the intended offer; it does not activate billing or establish
that the final paid catalog, unit economics, taxes and legal terms are ready for launch.

At 100 subscribers, gross monthly revenue is $900 at $9 versus $700 at $7.
Equal gross revenue needs 9/7 = 1.2857 times as many subscribers at $7: about 29% more.
This calculation excludes fees, tax, refunds, churn, acquisition cost and support; it does
not prove which price will convert or retain better. No Hotkey demand/price experiment
has been run. [Stripe's price-testing guidance](https://stripe.com/resources/more/price-testing)
supports comparing conversion, revenue and longer-term behavior; it does not validate our
particular price. The recommendation is product judgment, not measured willingness to pay.

**Recommended group-invitation design — not yet approved in detail:**

1. An authorized operator approves a group/program, access scope, permitted recipients and
   end-date/duration. The system generates invitations automatically within that scope;
   no public self-issuance or automatic group approval is implied.
2. Give each intended recipient a unique random, single-use invitation tied to a verified
   email/account. One shared reusable group code is not the recommendation. Randomness
   limits guessing; binding stops a forwarded code being claimed by the wrong account.
   Single-use alone would not stop someone else redeeming it first.
3. Redemption grants the approved individual learning access automatically, without payment
   details or checkout. A server-side atomic redemption binds the grant to the account;
   duplicate retries return the same grant and simultaneous attempts cannot create two.
4. Store a non-plaintext token verifier; avoid codes in analytics/logs or public documents.
   Enforce redemption deadlines, revoked/used states and attempt limits. Show safe failure
   messages and permit an authorized reissue without adding another entitlement.
   Exact token design and permission tests remain Security-owned future implementation work.
5. Define a redemption deadline separately from access expiry. P7 now selects one shared
   program end date. No exact date, duration, permanent grant, seat cap or automatic renewal
   is selected. Invitation copy must show the real remaining access before redemption.
6. Expiry/revocation of a group grant follows the free-versus-advanced access rule while
   preserving earned history and respecting any other valid access source. Voluntary paid
   cancellation/refunds and interactions with an existing subscription must be specified;
   redeeming a group invitation must not silently cancel or keep charging without explanation.
7. Full learning access does not grant readiness, XP, certificate completion, paid score
   advantages, another user's private records, or Desks administration/reporting rights.
   Keep this learning-access program separate from business Desks unless explicitly scoped.
   This does not restore the retired site-wide beta/invite gate or membership tables.

These controls address invitation sharing/guessing; they are not a guarantee against sharing
an already-authorized account's credentials. The security pattern is analogous to the
[OWASP single-use, user-linked token guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html);
applying it to invitations is our design proposal, not a reviewed implementation.

**Answered packet:** monthly/student pricing and shared program end date are confirmed P6/P7.
Do not repeat them or the answered consumer-trial/advanced-expiry questions.
**The cancellation/refund/annual-billing packet is now answered:** P8/P9/P10 above.
P3-P10 are answered. Student eligibility, invitation controls and the stated lifecycle edge
cases remain open; do not ask Wolf to reconfirm the selected offer.

## Commercial choices — pending unless explicitly answered

| Topic | Lead recommendation | Alternative / status |
|---|---|---|
| Individual monthly price | $9 standard; $7 for students; same included paid learning | Confirmed P6, September 20. Student eligibility/reverification and tax/currency presentation remain open. |
| Billing intervals | Monthly or annual; $90 standard/$70 student billed upfront each year, same content | Confirmed P10, September 20. Annual equals ten monthly payments; switching/renewal notices and student renewal eligibility remain open. |
| Consumer trial | No additional trial; useful free path and samples demonstrate value | Confirmed P3, September 20. Banking-group access is a separate selected requirement; existing .edu-trial transition remains open. |
| Expired advanced access | Free content stays playable; renewal required for paid advanced practice | Confirmed P4, September 20. Retain earned records; other valid grants remain separate sources. |
| Cancellation | Cancel anytime; stop renewal, keep access until the paid-through time | Confirmed P8, September 20. Self-service flow and exact date/confirmation wording remain to design. |
| Voluntary refunds | 14-day money-back guarantee on the first subscription payment, monthly or annual, additional to mandatory rights | Confirmed P9, September 20. Renewal mistakes, duplicate charges, service failures, partial refunds and refund/access timing still need policy detail; no claim of legal readiness. |
| Failed renewal | Clear update-payment notice and a short bounded grace period before advanced access ends | Duration and conditions open. Never confuse payment grace with Storage's public-result submission grace. |
| Certificate claim after expiry | If all required evidence qualified while entitled, permit later claim/download without repurchase | Proposal for consistency with earned-history protection. Evidence cutoff, version mapping and account requirement need Catalog/Storage agreement. |

Monthly and annual offer prices are confirmed. Tax-inclusive/exclusive presentation, billing
currency/markets and applicable terms need Area 12 review before publication. No seasonal plan,
lifetime offer, extra individual tier, consumer coupon, automatic consumer trial or enterprise
price is selected. Automatic banking-group learning-access codes are a separate confirmed
requirement with issuance/redemption details still proposed.
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
| Cancellation scheduled | Paid content remains available to the displayed paid-through time; no further renewal | Confirmed P8; exact self-service flow remains design work |
| Expiry | Free content remains playable; paid advanced practice requires renewal unless another valid grant applies. Retain all earned/history records | Confirmed P4; in-progress attempt handling still open |
| Payment lookup/network failure | Say verification is pending/unavailable; retain work and history; do not display an invented expiry or grant unlimited access | Offline lease and existing-session details open with Security/Storage |
| Refund | Apply the approved first-payment 14-day guarantee plus mandatory rights; track refund/cancellation separately and retain history | P9 confirmed; access-end timing, processing/failure recovery and other refunds open |
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
  Runtime automatically invokes a one-time seven-day .edu entitlement trial. P3 rejects an
  extra consumer trial; treatment of existing grants and transition of that old feature still
  need an explicit decision. It has not been selected as an exception. Preserve grant history.
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

## September 20 verification update

Refreshed remote AGENTS, README, CURRENT, PRODUCT, DEVELOPMENT and TASK_GUIDE at
`e1719a7ec7daeb8f014a92fefddd6f0a960000c0`. Read the relevant inclusion/credential boundaries
in Catalog's [71cc00e roadmap](https://github.com/rathunter69/Hotkey.gg/blob/71cc00e3b6fa71933a3871360a2d9d059a8ced61/docs/handoffs/drill-catalog.md)
and Storage's [26e71a0 contract](https://github.com/rathunter69/Hotkey.gg/blob/26e71a0f741de3a3e23f8653314a3b2e7f5cf46e/docs/handoffs/leaderboards-storage.md).
New curriculum content allocations remain proposals. Storage's approved five-minute Daily upload
grace is distinct from still-open payment grace and group grant duration.
A focused independent review checked the September 20 decisions against the commercial/lifecycle
tables. Its two clarifications are resolved: the existing .edu-trial transition is not permission
for an extra consumer trial, and only P3-P10 are marked answered while edge cases stay open.
Local/remote file identity, one-file scope, whitespace and decision/proposal checks accompany
publication. No new agent source audit or application test was needed.
This update records user choices and recommendations only; no code, app tests, new source audit,
code generation, real invitation, billing operation or deployment. Pinned-source evidence above
is reused, not relabeled as freshly tested.

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

**For the chief:** preserve P1/P2 and add September 20 decisions P3/P4/P5: no extra consumer
trial; free content after expiry with renewal for advanced practice; automatic banking-group
full-access codes as a future requirement. Add P6/P7: $9/month standard and $7/month student,
same content; one shared program access end date. Student eligibility and actual dates remain
open; email binding/single-use controls are recommendations, not a user-approved full design.
Also add P8/P9/P10: cancellation at paid-period end, 14-day first-payment money-back guarantee
in addition to required rights, monthly plus $90/$70 annual upfront. This settles the presented
commercial packet; remaining edge cases are not blanket-approved. Do not mark subscription integration
complete or checkout ready. This task owns only this handoff.

**Next bounded objective:** define student eligibility and group invitation issuance/redemption
with two or three concrete learner examples, then resolve overlapping grants/subscriptions,
refund access timing and failed-renewal grace. Reconcile Catalog's exact membership, certificate
timing and Security's future controls. Do not reopen P1-P10 or begin implementation.
Do not start checkout work while those choices and business/release prerequisites remain open.
