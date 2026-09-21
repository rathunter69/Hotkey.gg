# hotkey.gg site spec

Decided with Wolf on 2026-09-21 (40-question review). This file says what each part of the site is and how it behaves. docs/REBUILD_PLAN.md says what gets built in which order. If they disagree, this file wins on behaviour and the plan wins on sequence. Decisions only; no history.

## 1. Look and feel
- The old build's visual identity is the standard: Daylight palette as default, the same fonts, keycaps, green accent, selection outline with green handle, rounded cards, theme picker top right. The rebuild matches it already; keep matching it. When in doubt, open the old index.html and copy the look, not the code structure.
- Tone of copy: direct, professional Excel terminology, encouraging, never cutesy. Short sentences.
- Feedback: a small success tick per completed goal, a bigger finish on completion. Sounds are soft, off until the learner starts, with an obvious remembered mute.
- Every control is reachable by keyboard with visible focus. Failed loads show an error with retry, never an empty list. Save state is always stated honestly: "Saved on this device", "Saved to your account", "Couldn't save, will retry".
- Below ~900px wide: readable lesson text plus a clear "needs a keyboard and a wider screen" message, not a broken layout.

## 2. Navigation and pages
Top nav: **Learn · Practice · Leaderboard · Reference**, theme picker, account menu. Desks, Stats, Profile, Settings live in the account menu. One shell, one nav, one footer (Pricing, Teams, About, Terms, Privacy, Contact).

| Page | What it is |
|---|---|
| Landing | See section 3 |
| Home (returning) | Continue card first, then chapter progress, Daily, link to catalog |
| Learn | Catalog: 6 chapters, sections inside each, per-lesson status, difficulty, tags, free/paid/sample markers, filters, search, "next up" highlighted, fully keyboard navigable |
| Lesson | Lesson workspace (section 4) |
| Practice | Timed drills with pars, the Daily, rapid-fire, sandbox. Uses the drill workspace (section 5) |
| Leaderboard | Benchmark drill boards, Daily board, school boards, desk boards. Viewable by everyone |
| Reference | Searchable shortcut reference (content ported from old reference.html), each shortcut linked to the lesson that teaches it, Win/Mac aware |
| Pricing | Free vs paid, prices, student pricing, 14-day guarantee, and a "Teams and schools" row linking to the Teams page |
| Teams | See section 11a. For banks, training providers, finance clubs, classes and friend groups |
| Account | Sign in/up, profile, handle, platform, theme, stats, saved-progress state, export data, delete account |
| Public lesson pages | One generated page per lesson and per shortcut for search engines, built from lesson data so they never drift; each opens the lesson |
| Legal | Terms, Privacy, EULA, Contact, 404. Marked draft until legal review |

## 3. Landing page and first run
- Headline direction: "Learn Excel by doing." (alternates to test: "The better way to learn Excel"). Body: whether you're a beginner or a finance professional, learn Excel and practise through guided lessons and real-world drills, not by watching a video or sitting in a classroom. Keep the live drill preview card from the old landing. Sections: how it works (read, do it guided, do it solo, race the clock), what you'll learn (the 6 chapters), free vs paid, for teams and schools, footer.
- Primary button: "Start learning", no signup.
- First run: (1) pick Windows or Mac (pre-selected from the browser, changeable any time; instructions and keycaps follow it); (2) one experience question: "New to Excel / I use it sometimes / I use it daily"; (3) New and Sometimes go straight into lesson 1; Daily users get a short placement run that can mark early sections as skipped (skipped is not completed) and recommends where to start; (4) after the first completion, a low-pressure invitation to save progress.
- Never a signup wall before the first lesson.

## 4. Lesson workspace
- Split pane: sheet and ribbon on the LEFT, instructions panel on the RIGHT (as in the old build). Divider is draggable; panel collapsible.
- Panel tabs: Lesson | Help | Shortcuts used. Phases: Read -> Guided -> (complete) -> optional Try solo -> optional Timed.
- Goals name visible things ("Make Weekly Sales Report bold"). The active goal is always visible. The sheet never scrolls off screen.
- Ribbon: the full ribbon bar (tabs, groups, command buttons) is ON by default throughout Chapter 1. After Chapter 1 it defaults to the slim "alt / ribbon" strip. The toggle is always available. Alt shows KeyTips on whichever is visible. Unimplemented commands render disabled, not missing.
- Lessons are 3-5 minutes: one concept, 3-5 goals. Simple single sheets in early chapters; realistic multi-tab workbooks arrive with the paid chapters and end-of-chapter projects.
- Completion: the familiar centered overlay. Continue is primary, Try solo beside it. Shows time, keystrokes, assisted/solo.

## 5. Drill workspace (Practice, timed play)
- The old trainer layout: drill bar (chapter, title, position, prev/next), slim mode bar, sheet with sheet tabs, task panel on the right, status line with pass / pro / legendary par times.
- Slim mode bar: Help (hints + guided + solution merged into one), Win/Mac, ghost, sound, fullscreen. Daily, tracks and rapid-fire are reached from the Practice page, not the bar.
- The clock starts on the first key press. Reading time is free.

## 6. Rules: help, mouse, XP, rank
- Help: reading explanations is always free. Revealing steps ("show me") in a lesson gives reduced XP; Try solo earns the rest. Any help in a timed run means no PB and no board entry.
- Mouse: works everywhere (sheet, ribbon, dialogs). In lessons it is allowed and earns XP, with a gentle "try it with the keyboard" nudge. In timed runs, mouse use on the workspace means no PB and no board entry. Page controls like Start and Retry never count as mouse use.
- XP and level: one level. Most XP from first completions, small capped XP for repeats, no speed bonus. Achievements give no XP.
- Rank: kept. Speed-based tiers from benchmark drills, separate from level. Appears once a learner starts timed play.
- Pars: pass / pro / legendary on every timed drill.
- Unlocking: open within a chapter with a recommended order. The next chapter needs the previous chapter complete or a passed test-out. Paid chapters also need access.
- Daily: free for everyone. Streak is optional, counts practice days, and never takes anything away.

## 7. Curriculum
- Six big chapters, each with sections and a deep catalog. Chapter 1 is free. Content is written from zero; the old 74 drills are ideas only and are not ported.
  1. Foundations (free): the worksheet and active cell, moving, selecting, entering and editing, the Ribbon and dialogs, basic formatting, basic formulas, copy/paste and fill.
  2. Formatting and presentation
  3. Formulas and functions
  4. Data and analysis (lists, sort/filter, lookups, summaries)
  5. Financial modeling (schedules, three statements, auditing a model)
  6. Valuation and deals (DCF, comps, LBO, waterfalls)
  Names and section lists are refined as each chapter is built.
- Each chapter ends with a practical project and an assessment (used for the Verified certificate).
- Free tier: all of Chapter 1, its timed drills, the Daily, and one sample lesson from each paid chapter.

## 8. Accounts
- Sign-in: email + password, magic link, Google.
- Guests are local only. No anonymous database accounts. At signup the learner sees what will be carried over; it is carried once, and never from another account.
- Handle: pre-filled with a generated name at signup, easy to edit right there, with a note that it appears on public boards and the public profile if they allow it and can be changed any time. Profanity filter and change-rate limit.
- No two-factor until after launch.
- Public profile: handle, level, rank, featured achievements, best times. School and desk only by opt-in. Everything else is private, enforced in the database.
- Stats page: private, under the account. Time, PBs, improvement history, keystroke counts, shortcuts used, and a clearly labelled "estimated time saved".
- Account switching and sign-out never leak the previous account's data (generation-token approach from the old nav.js fix).

## 9. Achievements and cosmetics
- Pixel-art badges with rarity colours on a clean shelf; the rest of the UI stays professional. Main milestones visible, some playful ones hidden until earned.
- A core set of themes is free for everyone. Other themes, profile frames and flair are earned from level, achievements and rank. Nothing cosmetic is sold.

## 10. Payments and access
- $9/mo, $90/yr; student $7/mo, $70/yr. No trial; the free chapter is the trial. Cancel any time, access to the end of the paid period. 14-day money-back guarantee on first payment.
- Processor: merchant of record (Paddle or Lemon Squeezy), pending accountant confirmation. Build entitlements processor-agnostic: the database only knows "this account has access from source X until date Y".
- Student status: verified .edu or recognised school-domain email, rechecked yearly.
- Group access for banks and training providers ships with the paid tier: one code or link, a seat count, one shared end date, a simple admin view.

## 11. Desks, schools, certificates
- Desks v1: create a desk, invite by code or link, private desk leaderboard, captain sets assignments, captain sees members' progress. No applications, recruiting, verification badges or public discovery yet. All writes through server functions.
- School flair: opt-in school tag via verified school email; school boards.
- Certificates, two tiers per chapter: **Completed** (finished any way) and **Verified** (chapter assessment done solo, keyboard only, within a time limit). Public verification page per certificate.

## 11a. Teams page and how groups find it
Visible but not loud. Nobody should have to hunt for it, and a solo learner should never feel sold to.
- **Teams page** (footer link, Pricing link, account menu "Desks"): plain-English explanation of the two things a group can do, with a clear path for each.
  1. **Start a desk** (free to create): what a desk is (a private group with its own leaderboard, assignments from a captain, progress the captain can see), who it's for (a study group, a finance club, an analyst class, a team at work), and a "Create a desk" button. Signed-out visitors are taken through signup and land back on desk creation. Joining is by invite link or code; the page has a "Have a code?" box.
  2. **Group access** (paid, for organisations): one code or link, a number of seats, one end date, progress view for the organiser, invoice-friendly. For banks, training providers and schools. A short "Request group access" form (name, organisation, email, seats, start date) that writes to the database and emails Wolf. No self-serve checkout for groups at launch.
- **Where it is advertised**: one section near the bottom of the landing page ("Learning with a team or a class?" with one sentence and a link); a row on the Pricing page; a small prompt on the Leaderboard page ("Compete with your own group: start a desk"); a one-line mention after a learner finishes Chapter 1 ("Doing this with classmates or colleagues? Start a desk"); the certificate page mentions group reporting. Nowhere else, and never as a popup.
- **Joining flow**: an invite link opens a page showing the desk name, who invited you and what the captain will be able to see (your progress and times on assignments, nothing else), then Join. Guests are asked to create an account first, keeping their local progress.
- **Group access redemption**: a code or link shows the organisation name, what it unlocks and until when, then attaches to the signed-in account. Works for existing subscribers without double charging (their own subscription can be paused or left to lapse; state this plainly).

## 12. Data and infrastructure
- Supabase: a fresh project replaces the old one (see plan for timing). RLS on every table; the client never writes tables directly, only server functions; public profile fields separated from private; every attempt has a client-generated ID so retries never double count; progress, XP and records are derived server-side from attempts; results are paged, never one capped read.
- Hosting: Cloudflare Pages. Preview link per branch, one-click rollback, no manual cache-version bumps.
- Analytics: first-party events table (landing -> lesson 1 -> signup -> chapter complete -> paid) and a lightweight client error log with a weekly digest. No third-party scripts.
- Launch: one public launch with paid on day one. Before it: preview-link testing with a handful of real beginners and finance users.
