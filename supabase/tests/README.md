# Security test groundwork

This folder contains test inputs, not deployable migrations. Based on accepted integration
`6c984161c31bc4637dbe88b73a4da8408cefdf1d` and DATA_SECURITY's September 17 audit.
The DATA-01 SQL suite is **unexecuted**. It describes the required secure result and intentionally
fails for known vulnerabilities; it does not label a reproduced vulnerability as protection.

Follow [the isolated-host runbook](../../docs/testing-database.md) before any database work.
Never run these fixtures through the production connector or linked CLI project.

## Files and usage

- `database/01-desk-authorization.test.sql`: transactional pgTAP fixtures and DATA-01 cases.
- `run-isolated.js`: local Docker/psql runner with container/network/cron checks before SQL.
  `--plan` prints source SHA and input hashes without a database; `--container hk-security-NAME`
  tests a prepared isolated instance; adding `--replay` first runs the unchanged migrations.
- `runner.test.js`: tests unsafe-container rejection and TAP failure handling. Run
  `node --test supabase/tests/runner.test.js`. Passing these proves runner logic only.

No new npm dependency. The separate [platform-only bootstrap](PLATFORM_BOOTSTRAP.md) passed
its reviewed Linux CI experiment at exact source 49b8193, run 35275149357; see
[saved evidence](evidence/platform-bootstrap-35275149357.json). Chief reserved that distinct
workflow to Security with Testing review. It ran no Hotkey migrations or DATA-01 assertions.
The original replay runner still needs a separately authorized/reviewed execution batch.
A stock Postgres image, mock auth functions or ad-hoc table grants cannot establish parity
with Supabase.

## DATA-01 boundary matrix

All actors are synthetic. Signed-out requests use role anon without a subject; anonymous
Auth sessions use authenticated plus `is_anonymous=true`; full users use authenticated plus
their own subject. Owners/captains/members differ by fixture rows, not invented database roles.
Actor helpers and probes are SECURITY INVOKER. Superuser setup does not perform the attack.

| Boundary | Denied path / assertion | Allowed or existing control | Current evidence |
|---|---|---|---|
| Captain authority | Outsider directly inserts itself as captain on another desk | Genuine captain can recruit, rotate invite and accept applications; member cannot rotate | Direct insertion expected to fail the security assertion (known vulnerability) |
| Paid-seat seniority | Outsider inserts a backdated member row; member updates own joined_at | Invitation RPC grants member with server timestamp | Insert expected vulnerable; update denial is a preservation control |
| Role change | Member updates own role to captain | Legitimate create installs creator as captain | Existing update denial must remain |
| Trusted desk identity | Owner updates verified/edu_domain; creator supplies those fields on direct insert | RPC creation defaults to unverified and binds owner to caller | Four assertions expected vulnerable |
| Creation eligibility | Anonymous session or unpaid full user directly inserts a desk | RPC rejects those users; entitled full user can create | Two direct insert assertions expected vulnerable |
| Application eligibility | Anonymous Auth session applies by direct insert | RPC requires a full, deskless account | Direct insert expected vulnerable |
| Private/closed desk | Direct application into private/non-recruiting desk | Matching RPC calls reject | Two direct insert assertions expected vulnerable |
| Five pending applications | Sixth direct insert | RPC rejects sixth; fixture proves count is five | Direct insert expected vulnerable |
| Outsider actions | Remove other member, rotate invite, decide application | Captain decision adds ordinary member and clears pending applications | Existing controls must remain |
| Signed-out actor | Direct membership write and create RPC | Public display contract is not changed | Existing denials must remain |

There are 12 predicted vulnerable direct-table assertions and 44 context/allowed/denied
controls (56 total after final additions). Predictions derive from the newest source bodies,
grants and policies, plus DATA-01 audit evidence. They are not observed test results.
The intended repair shape (controlled RPC-only writes for these fields/routes) follows the
audit; if the agreed repair uses another safe route, update exact error expectations with
that review rather than quietly accepting any exception.

Permission errors (`42501`) are accepted only for operations intended to be denied; protected
UPDATE/DELETE may instead affect zero rows. Syntax, missing objects, FK failures, rate/name
guard failures and unrelated exceptions cannot masquerade as denial. Allowed operations use
both lives_ok and resulting-row assertions. Probe subtransactions undo successful attacks,
so one known vulnerability cannot poison later roles or consume their rate limits. The outer
transaction rolls back all 18 synthetic users and desk/application/entitlement fixtures.

## DATA-02 privacy acceptance — specification only

The audit confirms unrestricted profile SELECT and public metadata exposure. No privacy
schema/runtime change or executed privacy suite is part of this batch.

| Actor / request | Required acceptance evidence | Open contract or limitation |
|---|---|---|
| Signed-out anon; anonymous session; unrelated full user | Explicit-column, wildcard and RPC reads cannot retrieve private client state, email preferences or hidden school data | Agree exact public fields and handling of school_tag versus edu_domain before writing the repair |
| Profile owner | Can read/change intended own settings and keep saved progress | Private-column grants must not block legitimate account hydration |
| Public card/leaderboard consumer | Intended handle/flair/public identity remains available; hidden school remains hidden across every route | Enumerate all readers, including nav/lb/profile and invoker/definer views/RPCs |
| Unrelated writer | Cannot set another profile's identity/private fields or owner ID | Test direct requests, not only UI controls |
| Admin/service caller | Only intended privileged operations bypass public restrictions | Inventory actual admin use; do not infer public access from service-role success |

Test a hidden-school synthetic record and an opted-in visible one. Row RLS alone cannot hide
individual fields; inspect column grants and every public view/function. Do not accidentally
equate profile metadata with auth.users email exposure (the audit did not establish the latter).

## DATA-03 MFA acceptance — specification only

The audit confirms enrollment without a complete challenge/enforcement lifecycle. The product
must settle which operations require AAL2 for enrolled accounts and how recovery is handled.
No forced global MFA rule, factor enrollment, schema change or real account action is authorized.

| Case | Required evidence |
|---|---|
| User without verified factor | Agreed ordinary sign-in/use still works; no unintended lockout |
| Enrolled user, password-only/AAL1 or missing aal | Direct table/RPC/API calls to chosen protected operations fail even if UI is bypassed |
| Enrolled user, genuinely issued AAL2 token | Challenge succeeds and the same protected operations work |
| Wrong/expired challenge; refresh/expiry; second device/tab | No premature access or stale success UI; token/session behavior verified through Auth |
| Factor management and loss/recovery | Authorized removal/recovery path works with explicit policy; no silent downgrade or permanent dead end |
| Anonymous and other-account calls | Cannot inherit factor state/assurance or use another account's recovery path |

SQL `set_config` claim fixtures can test policy branching, not JWT signatures, Auth token issuance,
enrollment/challenge APIs or recovery. Those require an isolated Auth service and email sink with
outbound delivery denied. Keep real Auth journeys distinct from pgTAP database results.

## Result reporting

Classify separately: unavailable infrastructure, first migration/bootstrap failure, unexpected
fixture/control failure, known vulnerability reproduced, and passing repaired regression.
No TODO/SKIP is allowed in a green security gate. Preserve failing-before/passing-after evidence
on the same genuine platform when DATA-01 repair is authorized. Real PostgREST/API permission
behavior, production parity and full MFA flow remain unverified by these SQL fixtures.
