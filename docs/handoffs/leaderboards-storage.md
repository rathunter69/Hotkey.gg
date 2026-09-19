# Saved progress and leaderboard contract review

Updated: 2026-09-19 (Europe/Berlin)
Task: `01a0b908-9ee9-7d31-afb6-9733f5d421bf`
Chief: `01a0b0fa-d857-7002-ab95-1da0a1cfb858`
Branch: `codex/leaderboards-storage-review`
Starting code: `16ee8306a8c170db9f8fe2e051b44b0519782ae1`, CURRENT's accepted groundwork baseline.
Shared guidance read separately: initially `4ec23e01cb958d5dfed5e92875db3f7002eab1e1`; refreshed
`codex/repository-foundation` at `2b16827aecf9b1c773f9b48d9b986c506c061c8a`. Its delta registers
active UI/storage planning and these two user answers; accepted code/ownership are unchanged.
State: completed planning assessment/proposed contract; committed and pushed branch checkpoint,
not merged or deployed. Final commit identity is supplied by this file's Git history.
Owned/changed file: **only `docs/handoffs/leaderboards-storage.md`**. CURRENT/PRODUCT remain chief-owned.

## Scope and outcome

Define what users retain, how a save can be trusted, and which results can fairly be compared.
Completion, saving, eligibility and publication are separate facts. A helped lesson can be
completed and saved privately with no XP; a solo speedrun can be a private PB without a public
entry; an eligible challenge can be saved while publication is still pending.

This report reuses the existing audits and traces the accepted source. It does not repeat the
platform audit or approve application changes, migrations, live writes, deployment, billing,
catalog replacement, retention deletion or progress reset. The original dirty checkout is
preserved; a separate worktree holds the single-file planning branch.

## Confirmed decisions and provenance

The [shared PRODUCT at 4ec23e0](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/PRODUCT.md)
and [Catalog handoff at 15de791](https://github.com/rathunter69/Hotkey.gg/blob/15de791605cbfb4fa6bbc26c2d8f5f4a94139477/docs/handoffs/catalog-progression.md)
record Wolf's September 18–19 approvals. The table restates constraints, not new permissions.

| Confirmed direction | Meaning for this contract |
|---|---|
| Every finished attempt; lightweight deliberate restart/ended-unfinished summaries | Helped, mouse-based and private work must not disappear merely because it is unscored. Detailed replay/full workbook autosave is not approved. |
| Private detailed history; selected public highlights; deliberate public challenges | Saving privately is independent of publishing. A profile highlight is not permission to expose its underlying attempt log. |
| Helped ordinary completion advances learning, no XP | Instructions/explanations alone do not count as solution help. Solution steps, Guided help and replay do. |
| Fresh Try solo judged on its own assistance/input record | Keep the preceding helped attempt. No wait until another session and no inherited help penalty. |
| Spreadsheet mouse use: progress, no XP or qualifying timed PB/competitive score | Start/Retry page clicks alone are permitted. Mouse eligibility and solution help are separate fields. |
| Completion certificates include helped/mouse completions | Certificate-set completion, solo readiness, XP and timed eligibility need separate decisions; none is inferred from another. Preserve issued credentials. |
| Confirmed private guest-history carry-over at signup | Show device guest records and obtain confirmation to the new account; exclude other signed-in accounts. Import does not publish a result or establish competitive eligibility. |
| Goal before Start; worksheet reveal starts continuous scored time | Ordinary learning remains freely pausable with an optional timer. Older first-action times must remain distinguishable. |
| Benchmarks/Daily: unlimited attempts, best eligible time | All finished attempts remain in history; one best eligible result represents the account in the relevant comparison group. |
| One XP level, smaller limited repeat awards, no speed multiplier | Exact amounts/caps/eligible accomplishments remain Catalog-owned. Preserve existing XP, achievements, PBs and rank history; no new mastery/overall rank. |
| Time/PBs/improvement/key totals; active practice time/days, optional streak | Actual key presses and completed command uses differ. Activity is not elapsed scored time; missing historical measurement stays unknown. |

### New explicit answers in this task — September 19

1. **PB comparison:** Wolf selected **“Separate groups until equivalence is proven (recommended)”**.
   Compare only proven-comparable task, timing rules and Excel setup. Changed/older tasks keep
   their own visible records. This settles the conservative grouping principle, not exact
   equivalence tests, Windows/Mac parity or grouping identifiers. It replaces the open choice
   between proven equivalence and pooling variants merely judged similar.
2. **Delayed public submission:** Wolf selected **“Short published submission grace period
   (recommended)”**. Keep a result privately and show public submission pending while disconnected;
   public credit requires reconnection within a published deadline. This selects a grace period
   over a strict event-close receipt cutoff. Exact duration, trusted completion evidence, event
   boundaries and dispute/finalization rules remain open. It does not approve arbitrary late
   entries or trusting a client-supplied date.

Acceptance examples: an old 0:55 first-action PB remains visible beside a separate new reveal-clock
record; neither wins the other's group. A Daily completed within its valid window can await
submission during the published grace period; a late or unverifiable submission remains private
history without being described as a public placing.

**Everything below labelled proposed is an implementation contract recommendation.** The two
answers do not blanket-approve fields, migration rules, public verification or the whole report.

## Evidence reused and bounded source review

Read remote AGENTS, README, CURRENT, PRODUCT, DEVELOPMENT, TASK_GUIDE, ARCHITECTURE, audit index,
DATA_SECURITY, EXPERIENCE, relevant Catalog record/timing decisions, account-isolation handoff,
Security replay handoff, both database assessments and the accepted integration handoff.

| Evidence | Accepted meaning / remaining conflict |
|---|---|
| [DATA-04/06/07](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/audit/DATA_SECURITY.md) | Incomplete global reads/flag filtering; lost-response duplicate saves; direct-write/numeric checks do not prove a completed task. These remain separate from the shared-nav isolation repair. |
| [EXP-01/03/04](https://github.com/rathunter69/Hotkey.gg/blob/4ec23e01cb958d5dfed5e92875db3f7002eab1e1/docs/audit/EXPERIENCE.md) | False profile-save success, outages rendered as empty boards, and certificate outages rendered as missing/revoked work. Reused synthetic reproductions, not rerun here. |
| [Account isolation](https://github.com/rathunter69/Hotkey.gg/blob/e598752d8dc39acd500276fbd42d50955018bbeb/docs/handoffs/security-accounts.md) and [integration 16ee830](https://github.com/rathunter69/Hotkey.gg/blob/16ee8306a8c170db9f8fe2e051b44b0519782ae1/docs/handoffs/groundwork-db-integration.md) | Account/generation fences, late responses and sign-out reset accepted locally. This is not production or every page-loader/cross-device clearance. |
| [Security baseline](https://github.com/rathunter69/Hotkey.gg/blob/54640b07554882dcd3322d84f2bba398fadc94c0/docs/handoffs/security-accounts.md) | Two complete isolated replays, each 44 passing controls/12 DATA-01 failures. Permission defects remain; do not call infrastructure completion security clearance. |
| [Database assessment A](https://github.com/rathunter69/Hotkey.gg/blob/b852e41969e4157e9ce7f93aa48b8dda302f3b29/docs/handoffs/repository-database.md) / [B](https://github.com/rathunter69/Hotkey.gg/blob/6a73f8e649f875f567f44748c9e677d1065ac5d5/docs/handoffs/repository-database.md) | Raw runs, certificates and maintained `run_stats` have consumers. INSERT-only aggregation is not a complete history or correction strategy. No table removal justified. |

At accepted source 16ee830, the existing completion path writes device-only history capped at
400 entries and separate PB/trace data (`index.html:25647`, `:25712`, `:34256`). Ordinary
`recordRun` (`:34496`) excludes guest/Guided/mouse runs and retries inserts without stable
completion identity; mode sessions have a separate path (`:34519`). Account profile/history
and public standings derive from overlapping raw reads (`nav.js`, `lb.js`), not a complete
private attempt ledger. Client-state synchronization sends a snapshot rather than an atomic
union of independent device updates. See the focused source findings below for precise boundaries.

This conflicts with future all-attempt/private-history/continuous-scored-clock rules. Existing
code proves current behavior; it is not permission to keep accidental exclusions as product rules.

### Focused source findings at 16ee830

Line references below refer to [this exact source tree](https://github.com/rathunter69/Hotkey.gg/tree/16ee8306a8c170db9f8fe2e051b44b0519782ae1),
not the dirty original checkout. SQL filenames are under `supabase/migrations/`. An independent
investigator checked these bounded paths.

| Source boundary | Verified fact / consequence |
|---|---|
| `index.html:25607`, `:25675`, `:25712`, `:25763` | Win, local ledger, PB/streak and conditional server post are separate side effects without one stable completion ID. |
| `index.html:34256` | Device ledger retains at most 400 completed entries; no owner, completion ID, help/mouse category or eligibility field. It cannot prove all entries are guest or solo. |
| `index.html:34442–34516` | Two insert attempts followed by a 25-row outbox can duplicate a completion if replies are lost. Neither queue size is a reliable all-history retention promise. |
| `20251231000000_baseline_r453.sql:124–133` | Server run has generated ID, owner, challenge, time, keys, optimal, mouse flag, trace and created-at; lacks assistance/visibility/unfinished/client-completion identity. Created-at after queued delivery is not original completion time, and the caller can supply it. |
| `index.html:29141`, `:31136`, `:33837`, `:34109` | Guided marks an attempt; hints/tutorial guidance/replay use different paths. Existing control labels cannot enforce the new help taxonomy. Prior replay is not itself a reason to penalize a genuinely fresh solo attempt. |
| `index.html:25013`, `:25068`, `:27241` | Existing gate starts time on explicit go and swallows that key, before the next productive action. No persisted start/finish instant. “First-action” is the historical product label, not proof of reveal-clock equivalence. |
| `nav.js:1503–1549` | Snapshot contains achievement/seen flags, streak and two Daily latches; sends whole JSON after 2.5 seconds and merges on hydration only. No atomic multi-device union; `client_state_at` does not reject stale writes. |
| `lb.js:156–166`, `nav.js:541–549`, `profile.html:300–306`, `stats.html:272–277` | Global raw reads lack pagination and ordinary returned-error handling. Account-owner cache fencing does not make these reads complete. |
| `20260903000600_policies.sql:152–161`; `index.html:34397`; `account.html:521` | Clean/unflagged run reads are public; owners also see flagged rows. Owner PB/certificate prechecks do not consistently exclude flags. Current runs have no per-result private choice. |
| `20260903000800_run_stats.sql:115–154`; `20260717100000_run_integrity.sql:124–135` | INSERT-only aggregates are not corrected by moderation clear/delete. `best_ms` and `clean_best_ms` differ; neither table nor raw rows may be discarded as cleanup. |

The original wrong-key sign-out finding is already addressed by `nav.js:494–499`, which clears
both names. Preserve that accepted repair; do not report it as an unchanged defect. Full saved
worksheet/checkpoint resume and the new attempt contract remain unimplemented.

## Proposed record and eligibility contract

Store a small durable attempt record, then derive progress/PBs and public views from explicit
rules. The following is a semantic field dictionary, **not a selected SQL schema**.

| Record | Minimum meaning to preserve |
|---|---|
| Attempt identity and origin | Stable attempt ID; guest namespace or authenticated owner; originating device namespace; import provenance and original ID. Public identity never grants access to private origin data. |
| Task and rules | Stable exercise ID, content/grader revision, variant/seed or approved equivalence group, purpose (lesson/solo/speedrun/event), timing/input rules and selected supported Excel setup. Path/menu position is context, not identity. |
| Outcome and assistance | Finished-correct, deliberate restart, ended-unfinished, or interrupted/unknown; help types used; spreadsheet mouse flag; known/unknown evidence. Record independent eligibility reasons rather than a single overloaded “clean” flag. |
| Measurements | Scored elapsed time only when applicable; separate measured active practice time; per-run key total and completed-command counts only under defined measurement versions. Unknown is not zero. No new raw key stream/full worksheet collection is implied. |
| Time and receipt | Client-observed start/end with reliability, authoritative server receipt, save/validation status and rule version. Offline occurrence time is useful history, not authority to backdate public eligibility/rate limits. |
| Progress and awards | Completion evidence; separately qualifying solo/readiness evidence; each XP award's amount/reason/source/rule; earned achievements/credentials with original standard. Existing aggregates may remain preserved snapshots where no original ledger exists. |
| Public result/highlight | Explicit event-entry record and rules; validated result/reason; distinct publication receipt; chosen highlight fields/visibility. Public result refers to an attempt without exposing the full attempt. |
| Return location | Latest useful ordinary lesson/step pointer, where supported. Resume pointer is not a saved workbook or resumable scored run. Concurrent pointers cannot erase attempts. |

| Example attempt | Private history / learning | New XP or solo-readiness evidence | Qualifying timed PB / public score |
|---|---|---|---|
| Correct lesson using normal instructions | Retain completion | May qualify under Catalog's rules | Timer visibility alone does not create a scored attempt or public entry |
| Correct lesson with solution help | Retain helped completion; applicable completion-certificate credit | No XP; not solo readiness | No solo timed PB or public score; measured elapsed time can be labelled personal feedback |
| Fresh correct Try solo after Help | Retain both attempts; add new solo evidence when eligible | Judge new attempt only; no duplicate first-accomplishment award | May qualify if deliberately timed and all comparison/input rules pass; public entry still separate |
| Correct spreadsheet-mouse completion | Retain completion and separate input flag; applicable certificate credit | No XP; Catalog must define whether it supplies any readiness evidence | No qualifying timed PB/public score |
| Private eligible drill speedrun | Retain time, keys, comparison group and improvement history | Apply separate award rules; no speed multiplier | Personal PB without a public board |
| Public benchmark/Daily attempt | Retain every finished attempt, including slower/ineligible ones | Apply separate award rules | Best eligible time in its event/group, after validation/publication receipt |
| Deliberate restart/end unfinished | Lightweight summary; no completed-lesson claim; meaningful activity can count | No completed-accomplishment award/readiness claim | No completed-task PB or public score |
| Historical/flagged/unknown record | Preserve original result/awards and known facts; explain uncertainty or moderation | No inferred new qualification from missing fields | Preserve its historical context; do not silently qualify it for a new-standard group |

Catalog owns what completion, equivalent solo work, readiness, award and certificate evidence
means. Security owns trustworthy authorization/validation. Storage records their independent
verdicts and reasons. Paying, joining a desk, changing a path or publishing a highlight must
not change an attempt's historical facts.

## Proposed guest transfer and account separation

1. Guest attempts belong to a device guest namespace, separate from every account namespace.
   Signing out must never relabel the account's cached history or pending writes as guest work.
   A shared browser does not prove who performed guest work; reviewed confirmation is consent,
   not identity or anti-cheat verification.
2. At signup, preview the guest records, their save limitations and target account before
   confirmation. Allow declining/leaving them on the device. Exact selective-import controls
   and transfer into an already-existing account remain open with UI/Security.
3. Exclude account-owned records. Legacy ownerless/ambiguous records must not be silently
   attributed or imported as known guest work; Security needs a safe classification/recovery
   rule. Preserve their local data while ownership is unresolved.
4. Confirmation binds an import batch to that authenticated target and a stable list of source
   IDs. Recheck that owner at submission; account switching/expired auth stops work instead of
   retargeting it. A successful response received after switching must not render in the new account.
5. Import adds private records with original facts, timing labels and assistance uncertainty.
   Preserve guest PBs as imported history in their original groups; do not promote them into
   verified current PBs/public boards, grant fresh XP or claim readiness merely because of import.
   Whether sufficiently evidenced guest work qualifies for those new benefits is an open
   Catalog/Security policy. Do not delete earned guest history to enforce that distinction.
6. Retry the same import/record identities. Return per-record accepted/already-present/pending/
   conflict outcomes. Partial success must be visible; confirmed items do not re-award on retry.
   Do not deduplicate distinct attempts merely because time/date/task happen to match.
7. Mark the local copy transferred only after its account receipt. Keep unsent records recoverable;
   do not erase them on consent, navigation or a failed response. A transferred identity must not
   become eligible for a second account's import. Multi-tab and copied/stale import replay handling
   needs server-enforced provenance where available; local flags alone cannot prove exclusivity.

Account-owned queued writes keep their original owner through logout. They resume only for that
owner; B cannot see, submit or claim A's queue. An already accepted A write remains A's write,
even if the response arrives while B is active. Cache/request fences need owner plus session
generation so A → B → A cannot revive obsolete responses. Define shared-device local retention
with Security: UI namespacing alone is not protection against someone reading browser storage.

## Proposed save, retry and interruption contract

| Truth known | User-facing meaning |
|---|---|
| Local persistence succeeded; no account receipt | “Saved on this device.” Other devices cannot see it yet. Browser-data removal can lose it. |
| Account upload in progress or response lost | “Waiting to confirm account save.” Keep the same attempt queued; do not assert failure or success without evidence. |
| Authenticated durable attempt receipt returned/recovered | “Saved to your account.” Show award/publication pending separately if those decisions are incomplete. |
| Transient service error with durable local copy | “Saved on this device. Account save needs a retry.” Retry save resends the same attempt. |
| Local write also fails | “Not saved. Keep this page open.” Do not promise offline recovery; retain the in-memory record where possible. |
| Permanent rejection or identity/payload conflict | Explain the rejected operation and retain private/local evidence. Stop blind retries; account-save rejection and public-score rejection have different consequences. |
| History read fails / only some pages arrived | History unavailable/incomplete, or last confirmed history labelled stale. Never replace known history with zero or claim a complete lifetime statistic. |

**Identity:** allocate stable identity before the first durable submission, preferably at attempt
start. A network retry keeps it; a deliberate gameplay retry starts a new attempt. Database
uniqueness and atomic award/counter handling must make one attempt produce one stored record
and at most one instance of each permitted award. Same ID/same payload returns the existing
receipt. Same ID/different immutable payload is a conflict, not an overwrite. Each real new
attempt still faces accomplishment/repeat caps; unlimited attempts do not mean unlimited XP.

**Lost reply:** if the server commits and the reply is lost, look up/retry that same identity.
The recovered receipt must agree with private history, awards and public projection. A receipt
needs enough status to avoid “saved and awarded” when only the attempt has committed; later
award processing must itself be deduplicated and recoverable.

**Deliberate end:** finalize the old attempt's lightweight summary locally before starting the successor,
with honest local-write status; do not block learning while waiting for a network receipt.
one ID cannot be both counted as two unfinished records and one completed run. A lesson pause
is not an end and does not create another attempt. Unfinished means unfinished, not incorrect.

**Crash/background exit:** no guarantee that unload can write. A later recovered checkpoint may
say “interrupted; last confirmed activity …”, with unknown end/duration where necessary. Do
not invent a deliberate quit, completion or idle duration. Checkpoint frequency, crash-summary
retention and full lesson resume are open. Scored elapsed time must not pause or reset across
focus loss/sleep; if clock continuity cannot be established, retain history but withhold its
qualifying time pending the agreed interruption policy.

## Proposed cross-device and read contract

- The account's confirmed attempt set is authoritative. Two devices add distinct IDs; they do
  not upload whole progress totals over each other. Derive completions/PBs from that set and
  versioned decisions. Award uniqueness applies across devices, paths, import and retries.
- A stale device cannot remove earned work by uploading an old snapshot. Merge earned-once
  facts without double counting; apply deliberate preference/highlight changes with versions
  and explicit conflict behavior. Do not resolve privacy reversals by unioning “public” flags.
- Account history is queried by owner, independently of global fastest results. Use complete
  pagination with stable ordering/cursors and an explicit snapshot/scope. Public boards use
  their own eligible summaries. An API row cap must not determine who exists or has a PB.
- Distinguish no records after a successful complete read from errors and partial reads. Mark
  recent-only summaries as recent; a missing page cannot prove a new lifetime PB or award.
- On device 2, show confirmed account history plus that device's own labelled pending records.
  Unsent records on device 1 cannot appear by magic. Once device 1 receives a receipt, refresh
  or sync device 2 without replacing its separate pending work.
- Active-time/day aggregation needs defined idle/background rules, overlapping-device handling,
  timezone changes and a meaningful-activity threshold. Do not sum simultaneous intervals or
  count resend time twice. Preserve older “time on grid” with its narrower original scope.

## Comparable PBs, timing transition and competition

**Approved grouping principle:** separate until equivalence is proven. Proposed group identity
includes exercise/scored revision, valid variant or demonstrated-equivalent variant family,
grader/objective, timing standard, input/assistance rules and supported Excel setup. A public
group additionally binds event/benchmark edition and scoring rules. OS/setup, content or
instrumentation changes that materially affect work/time require review before pooling.
Device speed differences are a measurement/fairness concern, not permission to create a new
user-visible board for every device. Catalog/Engine supply evidence; Storage records the decision.

Path order, page location and cosmetic edits alone do not create new timed tasks or first-clear
awards. Legitimate alternate keyboard routes stay valid; a lower authored keystroke count is
not a correctness test. Same skill or similar par is insufficient proof of timing equivalence.
Private time improvement compares a named prior result in the same group; retain both attempts.

**Older timing:** keep original first-action-clock PBs, raw records, dates, earned awards and
rank history. Display “Earlier timing rules” where established and “Timing rules unknown” where
not. Do not guess a conversion factor, subtract a planning allowance, overwrite an old PB or
label unknown help/input as solo. New reveal-clock records begin a separate comparable series.
A revised path can recognize old completion under Catalog's explicit mapping without importing
that time into a new speed group. Historical boards and rank presentation need an approved
transition; this review does not freeze, delete or silently privatize existing public results.

**Public entry and best-of-unlimited:** proposed entry shows the task goal, group/rules, access,
public fields, event window and submission deadline before Start. The start/reveal/clock boundary
must be coherent: no inspecting the playable worksheet before the scored clock. Every retry is
a fresh attempt under the edition's rules; keep all completed attempts privately and select the
minimum eligible elapsed time for one account's board entry. Slower retries or a failed upload
cannot erase an already accepted better result. Public entry does not expose all retries.

Recommended fairness details, still proposals:

- Fixed, versioned benchmark tasks and one common Daily task/seed per comparison group, unless
  Catalog/Engine demonstrate variant equivalence. Unlimited practice makes familiarity part
  of this benchmark; do not advertise it as first-try mastery. Changing a Daily seed mid-event
  creates a different group, not an unexplained replacement of standings.
- Equal scored times share placing at the declared scoring precision. Key counts are informative,
  not an unstated tiebreak. Display ordering can be deterministic without claiming a better rank.
- Define one published event timezone/window (recommend UTC with local display). A valid start/
  finish and a receipt deadline are distinct. **Approved:** short published grace for delayed
  receipt. **Proposed precise rule:** finish within the event window; only receipt may arrive by
  close plus grace. This is submission grace, not extra playing time. Bind earlier server-issued
  entry parameters/evidence to account, event edition and attempt. Exact window, grace duration
  and trustworthy finish/continuity verification remain to be designed; a client date alone
  is insufficient. This recommended enforcement design is not claimed as an additional user answer.
- During a lost connection, preserve private history and mark public entry pending. Fully offline,
  unissued or unverifiable attempts are retained privately, not retroactively entered using a
  forged date. Exact evidence/replay versus other validation design belongs to Security/Engine.
  Deadline failure rejects public credit, not the private attempt. Benchmarks also need a stated
  submission lifetime; no arbitrary future re-upload into a changed edition.
- Mark standings provisional until grace and validation close. Preserve dated final results only
  when actually established. Moderation/correction records carry reasons and revisions; changing
  a board projection must not erase raw attempt evidence or silently rewrite earned awards.
- Technical anti-abuse limits must not quietly contradict unlimited legitimate retries. Validate
  identities, ownership, full-account/public-entry eligibility and issued parameters on the
  server; numeric sanity checks and a durable receipt alone do not prove a valid solve.

## Private records versus public records: proposed permission boundary

| Actor | May read | May change |
|---|---|---|
| Guest on this device | Its explicitly guest-owned local history | Its local attempts/preferences; no other account queue/import |
| Authenticated owner | Own detailed attempts, summaries, receipts, pending decisions and existing earned records | Own permitted preferences/highlights and authorized submissions; cannot choose server timestamps, verified eligibility, award amounts or another owner |
| Other account / unauthenticated visitor | Only approved published challenge summaries and intentionally showcased fields | No private-history reads/writes, no ownership reassignment or public-score forgery |
| Desk member/captain | Same public scope by default | Membership does not itself grant private learning-history/reporting access; separate Desks permission decision required |
| Authorized moderation/service role | Narrow data/actions required by a separately reviewed role | Reasoned corrections through controlled paths; no broad client privilege inferred |

Public summaries should expose only display identity, challenge/edition/group, qualifying score
and relevant placing/status, plus intentionally chosen highlights. Do not expose guest/device
IDs, unfinished practice, raw traces, private timestamps/activity, account-state blobs or hidden
school fields through convenient joins. Exact public fields need Security review. Removing a
showcase highlight must stop its public read without deleting the underlying personal record;
withdrawal/anonymization of an entered public result is a separate unresolved policy.

Security must enforce this at database/API boundaries, including direct table/function requests,
not just screens. Row restrictions alone do not specify which columns are safe to expose
([Supabase column-security guidance](https://supabase.com/docs/guides/database/postgres/column-level-security)).
DATA-02 presently blocks a truthful promise that current detailed profile state is private.
DATA-07 blocks treating currently accepted run payloads as independently verified completions.
No permission repair is implied by this design. DATA-01 desk-role and DATA-03 MFA work stay separate.

## Preservation and future acceptance examples

No retention limit, purge, raw-run replacement or recalculation is selected. Preserve raw runs,
sessions, known local records, PBs, key/command aggregates, earned XP/achievements, credentials,
high-water recognition and actual rank evidence. Do not invent per-attempt awards or placement
history that the old data never stored. Label aggregate-only and sampled legacy facts honestly.
Any future migration needs a recoverable inventory/export, stable old-to-new identity mapping,
dry-run reconciliation, reward/receipt deduplication and owner-visible old records. `run_stats`
cannot replace raw history until every reader/correction/moderation dependency is proven.

These are future acceptance scenarios, **not executed tests in this planning task**:

| Plain-English example | Required observation |
|---|---|
| “I used Help, then tried solo.” | Two retained attempts; helped completion/no XP; new solo eligibility judged independently; applicable certificate credit remains separate. |
| “I improved privately from 1:24 to 1:16.” | Both attempts and same-group improvement saved; no public entry merely from enabling a timer. |
| “I signed up after the guest lesson.” | Preview and confirmation to named account; only guest-owned records transfer; declined/ambiguous/other-account records are not claimed. |
| “I clicked Retry save after the reply disappeared.” | One attempt, one count, at most one permitted award; same receipt recovered. Gameplay Retry creates another ID. |
| “I switched from A to B while offline.” | A's pending data never appears in or submits to B; late A receipts cannot update B's UI. |
| “I restarted halfway, then my browser crashed later.” | Deliberate restart summary retained; crash recovery reports only known activity, never invented completion or guaranteed resume. |
| “The server is down.” | Honest device/pending/not-saved state; old confirmed history stays available where cached; outage does not become zero progress or revoked certificate. |
| “I practiced on two computers.” | Both confirmed sets survive, awards deduplicate, stale snapshots do not remove work; unsent device-only work is identified. |
| “My old time is faster than my new PB.” | Original PB remains in earlier timing group, new PB explains its standard; no conversion or history reset. |
| “I retried today's challenge ten times.” | Ten finished attempts retained privately, best eligible result counts once; slower attempts do not replace it; repeat XP follows separate caps. |
| “My Daily upload arrived during grace / too late.” | Valid timely evidence plus within-deadline receipt can count; otherwise private history survives with a clear public rejection reason. |
| “The results API returned only its first page.” | No false lifetime PB/award/rank or empty-account claim; complete pagination or explicit incomplete state. |
| “I removed my public highlight.” | Public field disappears at the data boundary; private attempt remains; unrelated school/device/private fields were never exposed. |

## Remaining choices, coordination and next step

Discuss only one small packet at a time; answered rules above must not be reopened as pending.

| Packet | Recommended next choice | Alternative / owner |
|---|---|---|
| 1. Guest eligibility | Import historical facts privately; grant new XP/readiness/current-standard PB eligibility only where a separately approved evidence rule can validate it | Require fresh qualifying solo work for those new benefits; preserve imported facts and known completion, with new path/certificate equivalence specified separately. Catalog + Security decide; no automatic public entry in either option. |
| 2. Event grace and evidence | Published short receipt grace, finish within event window, trusted issued entry/continuity evidence | Choose duration, exact event window, proof and finalization together; Storage + Security + Engine/Catalog. Do not use receipt grace to extend gameplay. |
| 3. Public comparison details | Fixed benchmark/Daily task per group; equal times share rank; proven-equivalent setup/variants only | Add validated variant families later. Catalog/Engine prove comparability; access remains Payments-owned. |
| 4. Retention and interruption | All finished records + lightweight deliberate summaries; no silent expiry; label interrupted facts only | Archive presentation/limits, guest device retention, exports/deletion, full resume and public withdrawal require their own explicit decisions. |

Metric definitions (keys/commands/active-idle/day/timezone), XP caps/accomplishments, old-to-new
readiness/certificate equivalence and access expiry remain with their existing owners. This
report does not select numbers, collect additional input data or tie history retention to paying.

Catalog returned [coordination handoff 194db93](https://github.com/rathunter69/Hotkey.gg/blob/194db93780b4e9a3187271687d2d049e2fe4922f/docs/handoffs/catalog-progression.md)
and confirmed all rules above remain those at 15de791, with no newer unshared decisions. It
retains eligibility/reward/state semantics and requests the remote contract for semantic review.
Catalog then reviewed the full published `8c7686c649eb15d0dbc5429e79208ea11ff311e6` report
(file blob `ccc92587170daef41da6c0dec1ef035ee90f09a3`) against 15de791/194db93 and refreshed PRODUCT.
Its sole clarification was to narrow the guest-import alternative to **new XP, solo-readiness
and current-standard PB recognition**, preserving known imported completion separately. The
option above now does that; no further material semantic conflict was found in the bounded
review. This is consistency review, not approval of either guest-eligibility proposal.
The [UI handoff at b0d2f17](https://github.com/rathunter69/Hotkey.gg/blob/b0d2f17929768e1be348510728e5559975544b2c/docs/handoffs/experience-site.md)
aligns completion/save/award/publication, unknown responses, account receipts, ambiguous imports
and distinct Retry save versus Retry attempt. Its saving section was checked directly; no
material mismatch found. Security was asked twice for existing-evidence permission constraints,
without a new repair/audit assignment. Its turns returned no readable reply through task retrieval;
this report reuses the pinned Security evidence and does **not** claim Security approval of
new permissions, guest proof or public verification. Send the remote report for that review.
Chief receives the
verified file link and the two explicit answers for CURRENT/PRODUCT integration; no shared-file edits.

**Next recommended turn:** settle guest-import eligibility with Catalog/Security using one guest
helped completion, one guest solo result and one ambiguous legacy record. Then finalize the narrow
save/receipt/identity acceptance contract before any implementation batch is authorized.

## Verification and limitations

Remote guidance was fetched and pinned; accepted code was checked out separately. Focused source
review reuses prior synthetic audit evidence and includes an independent read-only investigator.
A separate contract reviewer checked preservation, identity, privacy, retries, partial reads and
approval boundaries. Its sole finding led to clarifying receipt grace versus extra gameplay;
the recommended completion-within-window rule is now explicit and still labelled proposed.
Pinned GitHub source links were checked against fetched objects; whitespace/single-file scope
are checked before commit. Reviewed workflow triggers do not deploy this documentation branch.
Remote commit/file identity is verified after push and returned to the chief in the task message.
No new browser, database, account, cross-device, failure-injection or competition tests ran.
`npm run check` and browser suites are intentionally unrun for this one-file planning change,
under CURRENT/TASK_GUIDE's documentation-only exception. No playtest/security clearance is claimed.
No customer records, secrets, live database, deployment, billing or main merge was touched.

Supabase skill/security guidance was read for permission planning. The changelog Markdown fetch
failed (web unsupported content type; shell connection refused); official column-privilege guidance
was accessible. No API/schema implementation depends on the unavailable changelog.

This file's Git history supplies the final documentation commit. A handoff is complete only
after push, remote branch/blob verification and delivery to the chief; this does not merge or deploy it.
