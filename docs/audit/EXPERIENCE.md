# Experience and webpage audit

Reviewed September 17, 2026 against `434bc0e` and the preserved working tree.
This is an assessment, not approval to resume development or publish changes.

The existing visual foundation is worth keeping. The strongest problems in this pass are
misleading save/error messages, controls that need a mouse, inconsistent product promises,
and competing definitions of the beginner journey. Those can be addressed without redesigning
the ribbon or spreadsheet workspace.

## Scope and evidence

- Read the source for all 17 top-level HTML pages, their shared navigation, the leaderboard/desk
  controller, the generated drill-page template, and the onboarding entry/controller code.
- Loaded all 17 pages, the drill library, and one generated drill page (`wacc`) in an isolated
  desktop Chrome browser. All 19 loaded without JavaScript exceptions. All rendered local
  file links resolved to existing files, including links affected by the generated pages'
  `<base href="../">`. This does not verify every query-string action or remote link.
- Loaded account, profile, billing, stats and certificate states with a synthetic signed-in
  account. Reproduced failed writes, failed reads, certificate errors and inaccessible controls.
- Inspected screenshots of the landing, reference and generated WACC page at 1280 × 900.
  These sampled views were readable and coherent; this is not a complete visual/accessibility audit.
- The coordinator reports 86 passing existing onboarding assertions and all five smoke suites,
  including the existing 390-pixel width checks on 19 pages. Those tests are useful but narrow.
- Browser tooling: bundled Playwright Core 1.62.1, installed Chrome 152, Node 24.19.0.
  The project's pinned Playwright Core 1.49.1 has not been installed/verified here.
- Every request outside the temporary loopback preview was blocked. Synthetic responses contained
  no real user records. No live account, database, email, billing or deployment action was taken.

Only this report was added by the experience audit agent. Application code was not changed.

## Confirmed defects

Priorities: P1 should be repaired before a paid launch; P2 is a material usability or reliability
defect to repair in the review phase. Priorities describe impact, not permission to deploy.

### EXP-01 — P1: failed profile saves are reported as successful

**User impact:** a person can customize their card, see “saved”, and lose the change after a reload
or on another device. The same pattern affects the “show school” preference.

**Evidence:** `profile.html:506` and `profile.html:509` ignore the result of profile updates;
`profile.html:512` displays success independently. Callers including `profile.html:896` start the
save and immediately flash success. The school toggle does the same at `profile.html:841`.

**Local reproduction:** a synthetic signed-in account opened the profile. The mocked profile
update returned `{data:null, error:{message:'Synthetic save failure'}}`. Clicking a highlight-stat
chip issued the update and displayed `saved ✓`; no failure appeared. A returned error does not
throw, so the surrounding `catch` does not help. Thrown failures are also swallowed.

**Proposed repair:** await the write and inspect its error before saying “saved”; show a recoverable
failure and retain the pending choice. Apply the same rule to related account preferences rather
than fixing only the visible status text. Add one failed-save and one successful-save check.

### EXP-02 — P2: important controls cannot be reached with the keyboard

**User impact:** the keyboard-learning platform requires a pointer to change email, request/set a
password, enable/manage two-factor authentication, sign out all devices, or choose a reference category.

**Evidence:** `account.html:336`, `account.html:343`, `account.html:352` and `account.html:354`
render action anchors without `href`, `tabindex` or keyboard handlers. The reference categories
are click-only spans created at `reference.html:426`. The tutorial-skip line is another click-only
anchor created at `index.html:33882`.

**Local reproduction:** on the synthetic account page, `.focus()` could not focus any of
`acEmailToggle`, `acPwReset`, `acPwToggle`, `acMfaBtn`, or `acSignoutAll`. Each lacked a link target,
explicit tab stop and key handler. The first reference category span also rejected focus.
The browser's default `tabIndex` property alone was not used as proof: actual focus was checked.

**Proposed repair:** use native buttons for actions, preserve their visual styling, and test Tab,
Enter/Space, visible focus and return focus after dialogs close. Review shared dialogs and
profile/desk selectors as one bounded keyboard-accessibility pass; this test is not a full audit
of assistive technology or all modal focus behavior.

### EXP-03 — P2: a database outage appears as empty leaderboards and missing desks

**User impact:** users are told nobody has posted a time or created a desk when the service
actually failed. This can look like their history or community has disappeared.

**Evidence:** `lb.js:156` starts the five main reads; `lb.js:163` takes only their `.data` values
and substitutes empty arrays. The `catch` handles thrown errors, but normal returned API errors
never reach it. Both `leaderboard.html` and `desks.html` use this controller.

**Local reproduction:** all table reads returned `{data:null,error:{message:'Synthetic read outage'}}`.
The leaderboard showed “no times posted yet”, “unclaimed”, and “nobody has placed yet”; desks
showed “no desks yet — start one below”. Neither displayed a service-error state or a JavaScript
exception.

**Proposed repair:** distinguish successful empty results from failed reads. Show an unavailable
state with retry; preserve previously loaded information where useful. Check each dependent read,
so partial failures do not become false rankings or false membership information.

### EXP-04 — P2: certificate errors imply a bad or unearned certificate

**User impact:** an outage can make a legitimate certificate look revoked or unsupported by work.

**Evidence:** `cert.html:106` ignores the lookup error, then `cert.html:107` says the certificate
was not found or may have been revoked. `cert.html:143` ignores the run-query error, then
`cert.html:150` reports missing recorded runs. The SDK-missing branch at `cert.html:104` already
has a distinct unavailable message, but it does not cover ordinary API failures.

**Local reproduction:** a failed certificate lookup displayed “Certificate not found — the id may
be wrong, or it was revoked.” In a second fixture, the certificate existed but its run lookup
failed; the page said “16 of 16 drills lack recorded runs.”

**Proposed repair:** explicitly inspect both errors. Use “verification unavailable” for a failed
request and reserve “not found” / “missing runs” for successful queries that prove those states.
Keep the certificate visible when only re-verification is unavailable.

## Confirmed inconsistencies and unfinished product choices

These are separate from defects in an agreed behavior. They need a clear decision before edits.

### EXP-05 — the public offer has several incompatible descriptions

- `billing.html:135`–`billing.html:175` intentionally show price TBD, disabled payment, all drills
  currently free, and certificates/boards open to everyone.
- The shared offer still displays `$7` monthly and `$19` per season from `drills.js:849`, rendered
  by `nav.js:1560`. `billing.html:211` and `billing.html:237` retain another description that puts
  certificates and ranked cosmetics behind PRO. Some of this copy is conditional, but it remains
  an active alternate rendering path rather than historical documentation.
- `enterprise.html:164` promises comped student clubs, invoiced firms, and a trial; the journey
  says to start a desk and then request desk PRO. `account.html:600` and `lb.js:1103` gate founding
  a desk on a real entitlement. Without an existing entitlement, that advertised sequence cannot
  be completed through ordinary paid checkout today. Manual service arrangements were not verified.
- `dev/build-drill-pages.js:409` hardcodes “free” for every drill page. That is correct under the
  current all-free runtime, but would become stale if future paid access changes only the app.

**Decision needed:** one approved offer, one definition of current access, and one future paid
offer. Keep future commitments separate from available actions. Do not enable billing as cleanup.

### EXP-06 — the About page still describes an older first experience

`About.html:246` and `About.html:251` target analysts/internships, while Wolf's current audience
also includes consultants and later-career beginners. That narrower positioning is a decision,
not a runtime bug. More concrete mismatches remain:

- `About.html:317`–`About.html:318` promise a thirty-second first run of three exercises;
  the actual entry is the multi-step Navigation tutorial (`index.html:22778`; its configured
  par is 90 seconds in `drills.js:512`). A par is not a measured completion time, but the page
  plainly describes a different sequence. The index landing repeats the thirty-second claim at
  `index.html:2711` but correctly calls it one drill, another cross-page inconsistency.
- `About.html:297` says every run posts a time. `index.html:34496` only records eligible signed-in,
  keyboard-only, unassisted runs. Guest and assisted runs do not satisfy that claim.
- `About.html:271` says “Drills, not lessons”, while the active entry teaches through an integrated
  step guide. Decide how to explain learning rather than carrying contradictory messaging.

**Proposed reconciliation:** keep the visual page, but derive its facts from the chosen entry,
recording rules and catalog. Do not promise exact Windows/Mac transfer beyond tested commands.

### EXP-07 — legal and security pages are visibly unfinished

`terms.html:63`–`terms.html:103`, `privacy.html:63`–`privacy.html:93` and
`security.html:63`–`security.html:82` contain visible draft banners and bracketed instructions.
Missing facts include operator, date, jurisdiction, eligibility, hosting provider and billing
terms. These pages are linked from the shared footer (`nav.js:113`). They load successfully;
that does not make them ready to support a paid public launch.

**Required next step:** supply the actual business/service facts, align factual security claims
with the security audit, and obtain the appropriate legal review. This audit supplies no legal
conclusion and does not invent the missing business facts.

### EXP-08 — two-factor “manage” repeats enrollment

At `account.html:766` the button changes to “manage” when a verified factor exists. Its handler
at `account.html:771` always starts another enrollment. This file provides no list/remove/recovery
management path. Static source finding; no real authentication factor was created. The database
and security audit owns the more serious missing sign-in challenge/assurance checks.

## Onboarding: what actually exists

| System | Status in the reviewed source | Implication |
|---|---|---|
| Marketing landing → Enter → first catalog drill | Active: `index.html:33184`, `index.html:33194` | One main fresh-device entry, useful foundation to preserve. |
| Per-drill step guide | Active for drills declaring steps; `index.html:33857` | Navigation has a real integrated guide. Completion/replay uses per-drill local flags. |
| Generic start gate | Active; armed before the guide (`index.html:32171`) | First key starts the clock and is swallowed. The suite tests this intentionally; changing it is a product choice. |
| Hints, guided rails, solution replay | Active toolbar tools | Distinct ways to get help, with different consequences for recording and competition. They need one plain-English explanation. |
| Tutorial skip | Active: `index.html:33893` | Marks tutorial guides seen and jumps out of the first chapter, not merely to the next beginner drill. Agree what “skip” should mean. |
| Old Keyboard Tour | Runtime remains, entry link hidden by `LEVEL1_LIVE`; `index.html:30424`, `index.html:33637` | Cleanup candidate after confirming generator/test consumers. Do not restore as another automatic entry. |
| Generic lesson-card framework | Present: `index.html:33677`, `index.html:33750` | No current drill lesson consumer established in this pass. Do not treat a framework as shipped curriculum. |
| Old comfort/keyboard/primer cards | Deleted; retained explanatory comments at `index.html:34410` | Old comments are not an active personalization system. |
| Placement assessment | Offered from leaderboard, not first onboarding (`index.html:33179`) | Competitive placement is separate from the desired customized learning path. |

The coordinator confirmed two additional concrete transition defects: sign-out clears
`hk_last_drill`, while entry reads/writes `hotkey_last_drill`; and Navigation's explicit next
drill is `autofit`, while Foundations catalog order puts `filldr` next. These should be tracked
once in the consolidated audit, not counted again as independent discoveries here.

Passing the current onboarding suite demonstrates the current fixed path; it does not demonstrate
customization. Goal/experience questions, editable recommendations and account-carried teaching
state are not established by this test. Wolf's customization request is current guidance, but
implementing it remains paused.

## Page-by-page coverage

All rows received source review and local desktop loading. “Mock” means synthetic account/service
responses with all external traffic blocked. Mobile evidence comes from the coordinator's existing
width suite, not a hands-on phone or external-keyboard test.

| Page | Purpose and observed state | Assessment / remaining check |
|---|---|---|
| `index.html` | Public landing, trainer, auth and main entry. Sampled landing visually; existing onboarding suite covers fresh entry, guide and replay. | Preserve workspace/ribbon. Reconcile the next lesson, sign-out resume and teaching state. Live signup/recovery and real beginner playtesting remain. |
| `About.html` | Separate public marketing page; loads and links to trainer/boards/desks. | Old first-run and scoring promises (EXP-06). It is a second marketing surface to keep aligned with the index landing. |
| `profile.html` | Guest account prompt; mock signed-in card customizer renders. | False saved status (EXP-01); broader keyboard check remains. Pixel-style identity belongs here under Wolf's guidance. |
| `stats.html` | Guest sign-in prompt plus paths/achievement wall; mock signed-in summary renders. | Distinguish local learning history from account/competitive history. Rank/history completeness is owned by the data audit; real populated and multi-device states remain. |
| `account.html` | Guest sign-in/create prompt; mock signed-in settings, security, desks and certificates render. | Keyboard barriers (EXP-02), factor management (EXP-08), preference-save failures. Real recovery, sign-out-all, deletion and export scope require isolated integration tests. |
| `admin.html` | Signed-out clearance message renders. | Authenticated admin actions and authorization were not exercised here. Source actions often ignore returned RPC errors (`admin.html:144`, `admin.html:159`); security audit owns permissions. |
| `billing.html` | Plans plus guest account prompt; mock account shows free-for-now PRO, no payment method, empty invoices. | Honest disabled checkout is present; inconsistent alternate offer text (EXP-05). Not a working subscription journey. |
| `leaderboard.html` | Shared board controller; missing SDK shows not connected. Mock failed reads render empty boards. | Error/empty distinction broken (EXP-03). Real populated rankings, paging, private visibility and placement integration belong to data audit. |
| `desks.html` | Shared board controller in team mode. Mock failed reads show no desks and a PRO creation prompt. | Same error issue; clarify entitlement and enterprise path. Invites, owner/member/outsider roles and populated management remain separate integration tests. |
| `reference.html` | 126 shortcut rows, search, categories, platform display and practice links render. Sampled visually. | Empty search works. Category chips inaccessible by keyboard (EXP-02). Practice file links exist; actual shortcut correctness belongs to engine/content audit. |
| `contact.html` | Routed mailto links for support, bugs, schools, press and security. | Links render; mailbox delivery and advertised response expectations not verified. No messages sent. |
| `enterprise.html` | Desk/group sales explanation and contact links. | Offer and eligibility sequence need reconciliation (EXP-05). No invoicing or organization onboarding tested. |
| `cert.html` | Missing-ID state works; mock lookup and re-verification error states tested. | Both returned-error paths mislead (EXP-04). Valid populated certificate layout, real issuance/revocation and public privacy require further checks. |
| `privacy.html` | Linked public draft loads. | Operator/provider/retention facts and final policy unresolved (EXP-07). |
| `terms.html` | Linked public draft loads. | Entity, eligibility, jurisdiction and payment text unresolved (EXP-07). |
| `security.html` | Linked public draft loads. | Match factual claims to actual permissions/auth before publication (EXP-07). |
| `404.html` | Recovery page with four working local file links. | Correct missing-route HTTP behavior and production redirect handling were not tested by directly opening this file. |
| `drills/index.html` | Generated library with all 74 catalog links. | Resolved local links exist; generated from runtime catalog. Keep this public entry aligned with access and learning-path decisions. |
| `drills/wacc.html` / shared template | Generated prompt, shortcuts, optimal line, related drills and trainer link. Sampled visually. | `<base>` correctly resolves shared assets/links. This represents template coverage, not individual content validation of all 74 pages. Hardcoded free label must follow any later billing decision. |

The development curriculum HTML and `art/` prototypes are not part of this top-level navigation
review. Their hosting exposure and intended retention belong to the delivery/source audit.

## What the existing tests do not establish

- Smoke checks look for render exceptions/warnings and horizontal overflow. Returned service
  errors can produce a perfectly rendered lie; EXP-01, EXP-03 and EXP-04 all passed exception checks.
- A 390-pixel page that does not scroll sideways is not proof of readable tap targets, good
  screen-reader order, modal focus, usable phone navigation or supported tablet gameplay.
- The trainer deliberately presents a mobile hub (`index.html:32684`) rather than a touch game.
  Decide supported devices and physical-keyboard behavior before treating that as a defect.
- Mock auth proves the UI branch can render, not that signup, email confirmation, recovery,
  factor challenges or session expiry work with the deployed service.
- No real subscriptions, inbox delivery, public-domain routing, cross-device restoration or
  learner comprehension was tested in this workstream.

## Recommended order

1. Repair truthful save/error handling and keyboard access while preserving the visual design.
2. Reconcile the beginner entry, next lesson, assistance/recording rules and account continuity
   with the engine/data findings. Keep competitive eligibility distinct from learning progress.
3. Agree one current offer and one future subscription offer; align every marketing/account page.
4. Complete business facts and legal/security copy, then exercise real service journeys in an
   isolated environment before considering a public paid launch.
5. Validate the preserved UI with beginners and experienced spreadsheet users, using the agreed
   supported keyboards. This is the evidence needed before expanding or rebuilding lessons.
