# hotkey.gg · tools for the planning docs

What a session needs besides the docs themselves: how to edit them safely, the script that regenerates the curriculum summary, and how the docs sit in the repo. Cut down on 2026-09-30, when the plan was handed to the build: the transcription scripts and the script that applied the source checklist did their jobs and were removed.

## Working layout a session uses

- Working folder: `/home/claude/out/` (project_write with `local_path` needs the file inside the working directory). `project_read` each doc you'll edit, save it there under the same name (`screenplay.md`, `script-ch1.md` … `script-ch6.md`, `script-drills.md`, `curriculum-summary.md`, `rebuild-direction.md`).
- Edit with small Python scripts that assert each replacement matches exactly once (`assert s.count(old) == 1`), so a stale marker fails loudly instead of editing the wrong place. Never hand-edit `curriculum-summary.md`; regenerate it.
- Publish with `project_write` and `local_path` after every batch. In the repo the same files sit under `docs/screenplay/` (the mapping is below); a build session edits them there with the same assert-once habit and runs the generator with `HK_DIR=docs/screenplay python3 gen_summary.py`.

## gen_summary.py: regenerates claude/curriculum-summary.md from the shells

Usage: `python3 gen_summary.py`, then `project_write` the result; in the repo, `HK_DIR=docs/screenplay python3 gen_summary.py`. It reads `screenplay.md` (the one-view paragraphs and the six-products table) and `script-ch1.md` … `script-ch6.md` (modules, story cards, objectives, lessons, briefs, done lines) and pulls the keys each lesson names from its brief and goals, excluding stuck cues.

```python
# gen_summary.py: builds claude/curriculum-summary.md from screenplay.md and script-ch1..6.md.
# Reads the docs from HK_DIR (default /home/claude/out; docs/screenplay in the repo). Never edit the summary by hand; fix the shell and re-run.
import io, re, datetime, sys, os

D = os.environ.get('HK_DIR', '/home/claude/out')
OUT = sys.argv[1] if len(sys.argv) > 1 else f'{D}/curriculum-summary.md'
def rd(p): return io.open(p, encoding='utf-8').read()

FUNCS = set("""SUM SUMIF SUMIFS AVERAGE AVERAGEIF AVERAGEIFS COUNT COUNTA COUNTIF COUNTIFS MIN MAX MAXIFS MINIFS LARGE SMALL RANK
MEDIAN SUMPRODUCT ROUND ROUNDUP ROUNDDOWN ABS CEILING FLOOR MOD RRI IF IFS AND OR NOT IFERROR IFNA ISNUMBER ISBLANK ISERROR ISFORMULA
ISTEXT INDEX MATCH CHOOSE OFFSET INDIRECT XLOOKUP VLOOKUP HLOOKUP LOOKUP TEXT EOMONTH EDATE DATE YEAR MONTH DAY TODAY YEARFRAC
NETWORKDAYS WEEKDAY DATEVALUE LEN LEFT RIGHT MID FIND SEARCH SUBSTITUTE VALUE TRIM PROPER LOWER UPPER CONCAT TEXTJOIN PV FV PMT
PPMT IPMT NPV XNPV IRR XIRR RATE NPER SUBTOTAL UNIQUE FILTER SORT SEQUENCE GETPIVOTDATA ROW COLUMN TRANSPOSE HYPERLINK N
AGGREGATE EXACT REPT CELL""".split())
COMMANDS = ["Paste Special", "Go To Special", "Go To", "AutoSum", "AutoFit", "Format Painter", "Cell Styles", "Name Manager",
            "Data Validation", "Goal Seek", "Data Table", "data table", "Watch Window", "Remove Duplicates", "Text to Columns",
            "Flash Fill", "Center Across Selection", "PivotTable", "Freeze Panes", "Fill Series", "Move or Copy", "Define Name",
            "Error Checking", "Evaluate Formula", "Edit Links", "Print Preview", "Page Break Preview", "Conditional Formatting",
            "Manage Rules", "AutoFilter", "Name Box", "Replace All", "Quick Access Toolbar", "Custom Format", "Trace Precedents",
            "Trace Dependents", "Row Differences", "Column Differences", "Sort", "Group", "Ungroup", "Iterative", "Page Layout"]
KEYPAT = re.compile(r"""(Ctrl\+(?:Shift\+|Alt\+)?(?:PgDn|PgUp|Enter|Space|Home|End|Backspace|Arrow|Tab|Del|Delete|F\d{1,2}|[A-Z0-9←→↑↓\[\]`'";=~+\-*:.,/\\])
                        |Alt(?:\+(?:Enter|PgDn|PgUp|F\d{1,2}|=|;|↓|↑|←|→|Tab|Shift\+[←→↑↓]))
                        |Alt(?:,\ [A-Z0-9])+
                        |Alt(?:\ [A-Z0-9]){1,5}(?![a-z])
                        |Shift\+(?:Space|F\d{1,2}|Enter|Tab|[←→↑↓])
                        |(?<![A-Za-z$=!:])F(?:[1-9]|1[0-2])(?![\d:!])
                        |Esc\b|PgDn|PgUp)""", re.X)
CELLCTX = re.compile(r"(?:cell|cells|in|on|at|to|from|and|or|of|into|through|beside|under|over|by|select|selecting|then|with|read|watch|the|land|lands)\s+F(?:[1-9]|1[0-2])\b", re.I)

def keys_from(text):
    found = []
    def add(k):
        k = k.replace(", ", " ").strip()
        if k not in found: found.append(k)
    for m in KEYPAT.finditer(text):
        k = m.group(0)
        if re.fullmatch(r"F(?:[1-9]|1[0-2])", k):
            prev = text[m.start()-1] if m.start() > 0 else " "
            nxt = text[m.end():m.end()+14]
            if prev in "=,($+-*/:!&" or re.match(r"[:!\d]", nxt): continue
            if k in ("F2", "F4", "F9"):
                if CELLCTX.search(text[max(0, m.start()-12):m.end()]) and prev != " ": continue
            elif k == "F5":
                if not re.match(r"[ ,]*(?:then|and) Enter", nxt): continue
            elif k == "F3":
                if not re.match(r" (?:paste|then|to)", nxt): continue
            elif k == "F12":
                if not re.match(r" (?:save|Save)", nxt): continue
            else:
                continue
        add(k)
    for c in COMMANDS:
        if re.search(r"\b" + re.escape(c) + r"\b", text): add(c if c != "data table" else "Data Table")
    for w in sorted(set(re.findall(r"\b[A-Z][A-Z0-9]{1,14}\b", text))):
        if w in FUNCS: add(w)
    # drop a chord that is a strict prefix of a longer one (Alt H O when Alt H O I is there); drop typed values after a chord
    cleaned = []
    for k in found:
        k2 = re.sub(r"^(Alt(?: [A-Z]){3,}) \d+$", r"\1", k)
        if k2 not in cleaned: cleaned.append(k2)
    out = [k for k in cleaned if not any(o != k and o.startswith(k + " ") for o in cleaned)]
    return out

def strip_tags(t):
    t = re.sub(r"\*\*(DRAFT|LIVE|LOCKED|TBD|FLAG|RETIRED)\*\*\s*", "", t)
    t = re.sub(r"\s*\(M\d+\)\s*$", "", t)
    return t.strip()

def first_line_after(seg, label):
    m = re.search(r"\*\*" + re.escape(label) + r"\*\*\s*(.*)", seg)
    return strip_tags(m.group(1)) if m else ""

def parse_chapter(n):
    t = rd(f'{D}/script-ch{n}.md')
    brief = {}
    m = re.search(r"^## The chapter in brief\n(.*?)(?=^## )", t, re.M | re.S)
    if m:
        for lab in ["Where the deal is.", "The product.", "What the learner can say afterwards."]:
            mm = re.search(r"\*\*" + re.escape(lab) + r"\*\*\s*(.*)", m.group(1))
            if mm: brief[lab] = mm.group(1).strip()
    wb = re.search(r"^## The workbook\n\n(.*?)\n\n", t, re.M | re.S)
    brief['workbook'] = wb.group(1).strip() if wb else ""
    # modules
    mods = []
    for mm in re.finditer(r"^## (\d\.\d) (.*)$", t, re.M):
        mid, mtitle = mm.group(1), mm.group(2).strip()
        seg = t[mm.end():]
        nxt = re.search(r"^## ", seg, re.M); seg = seg[:nxt.start()] if nxt else seg
        mod = dict(id=mid, title=mtitle, card_title=first_line_after(seg, "Story card, title"),
                   card_body=first_line_after(seg, "Story card, body"),
                   objective=first_line_after(seg, "Objective (data room)"), lessons=[])
        for lm in re.finditer(r"^### (\d\.\d\.(?:\d|C|P|A)|\d\.(?:P|A)) (.*)$", seg, re.M):
            lid, ltitle = lm.group(1), lm.group(2).strip()
            ls = seg[lm.end():]
            ln = re.search(r"^### ", ls, re.M); ls = ls[:ln.start()] if ln else ls
            slug = re.search(r"^\*(?:lesson|challenge|project|assessment): ([^·*]*?)(?: · (\d+) goals?)?\*", ls, re.M)
            nb = re.search(r"\*\*Brief\*\*\s*(.*)", ls)
            briefx = strip_tags(nb.group(1)) if nb else ""
            key = re.search(r"The key is `([^`]*)`", briefx)
            done = first_line_after(ls, "Done screen, line")
            if not done and not nb:
                paras = [x.strip() for x in ls.split("\n") if x.strip() and not re.match(r"\*[a-z]", x.strip())]
                if paras:
                    d = strip_tags(re.sub(r"^\*\*[^*]+\*\*\s*", "", paras[0]))
                    done = d if len(d) <= 260 else d[:257].rsplit(" ", 1)[0] + "…"
            goals_txt = "\n".join(x for x in ls.split("\n") if not re.match(r"\s*\*(?:stuck|was):\*", x) and not x.startswith("*was:*"))
            kk = keys_from(re.sub(r"The key is `[^`]*`\.", "", goals_txt))
            hk = key.group(1) if key else ""
            if hk and hk not in kk and not hk.startswith("="): kk = [hk] + kk
            mod['lessons'].append(dict(id=lid, title=ltitle, slug=slug.group(1).strip() if slug else "",
                                       ngoals=slug.group(2) if slug and slug.group(2) else "",
                                       key=hk, brief=briefx, done=done, keys=kk))
        mods.append(mod)
    return brief, mods, t

CH = {1: ("Foundations", "free"), 2: ("Formatting", "Pro"), 3: ("Formulas", "Pro"), 4: ("Data and Lookups", "Pro"),
      5: ("Finance and Accounting", "Pro"), 6: ("Valuation", "Pro")}
CH1_TEXT = {
 "Where the deal is.": "The company's own weekly numbers. Five site managers, five spreadsheets, one workbook that ops pasted them into; the CFO wants one clean page out of it by Monday afternoon, every week, and the project (a sale of the company to private equity) is a rumor on the finance team.",
 "The product.": "The weekly KPI report: one page, live, formatted, checked, print-ready, built on Raw · Inputs · Costs · Report. The finance rung is the first one: washes × ticket − cost per wash, totals, and a checks row.",
 "workbook": "**Raw**: the managers' feed, pasted; **Inputs**: the cost of a wash and the week; **Costs**: site costs; **Report**: the one page the CFO reads.",
}

sp = rd(f'{D}/screenplay.md')
def sp_para(label):
    m = re.search(r"\*\*" + re.escape(label) + r"\*\*\s*(.*)", sp)
    return m.group(1).strip() if m else ""
six = re.search(r"^### The six products\n(.*?)(?=^### )", sp, re.M | re.S).group(1)
rows = {}
for r in re.finditer(r"^\| (\d) [^|]*\| ([^|]*)\| ([^|]*)\| ([^|]*)\| ([^|]*)\| ([^|]*)\|$", six, re.M):
    rows[int(r.group(1))] = dict(product=r.group(2).strip(), wb=r.group(3).strip(), fin=r.group(4).strip(), buckets=r.group(5).strip(), size=r.group(6).strip())
total = re.search(r"\*\*Total\*\* \| \*\*([^*]*)\*\*", six).group(1)

o = []
o.append("# hotkey.gg Curriculum Summary\n")
o.append(f"*The abbreviated view for Wolf's review: every chapter's framing, every module's story, every lesson's headline key, what it teaches, and its gist in one line. Generated {datetime.date.today()} from claude/screenplay.md and claude/script-ch1.md to script-ch6.md by gen_summary.py. Fix the shell and re-run; never edit this file by hand. The full scaffolding the build sessions code from is the screenplay plus the six chapter scripts. Totals: {total} (lessons · challenges · hours). Everything is DRAFT.*\n")
o.append("**How to read a row.** Key is the headline key the brief ends on. Teaches is every key, command and function the lesson's text names (pulled from the brief and goals; a name in the list may be a reuse from an earlier lesson, and the shells cite the first lesson in brackets). Gist is the lesson's done-screen line: what the learner has when it ends. A challenge has goals only, so its gist is what it grades.\n")
o.append("## The curriculum in one view\n")
o.append("**The platform, in one sentence.** " + sp_para("The platform, in one sentence.") + "\n")
o.append("**The case, in one arc.** " + sp_para("The case, in one arc.") + "\n")
o.append("**What a learner can do at the end, by chapter.** " + sp_para("What a learner can do at the end, by chapter.") + "\n")
o.append("| Chapter | The product | Workbook | Finance rung | Excel buckets | Lessons · challenges · hours |\n| :- | :- | :- | :- | :- | :- |")
for n in range(1, 7):
    r = rows[n]; o.append(f"| {n} {CH[n][0]} ({CH[n][1]}) | {r['product']} | {r['wb']} | {r['fin']} | {r['buckets']} | {r['size']} |")
o.append("")
o.append("Sections 5 of the screenplay carry the rest of the plan: the skills bucketed, the checks thread, the tips and tricks placed, the desk audit, evaluation. Section 4.10 parks the finance left out as add-ons. Section 6 is the practice layer (drills, the Daily, rapid-fire, quests, achievements, XP); the drill sketches for the code layer are in claude/script-drills.md, indexed in 6.2b. Section 9.3 is the build list (M1–M108).\n")

for n in range(1, 7):
    brief, mods, t = parse_chapter(n)
    if n == 1: brief = CH1_TEXT
    nl = sum(1 for m in mods for l in m['lessons'] if re.fullmatch(r"\d\.\d\.\d", l['id']))
    nc = sum(1 for m in mods for l in m['lessons'] if l['id'].endswith('.C'))
    o.append(f"## Chapter {n} · {CH[n][0]} ({CH[n][1]}): {nl} lessons · {nc} challenges · {rows[n]['size'].split('·')[-1].strip()} hours\n")
    if brief.get("Where the deal is."): o.append("**Where the deal is.** " + brief["Where the deal is."] + "\n")
    if brief.get("The product."): o.append("**The product.** " + brief["The product."] + "\n")
    if brief.get("What the learner can say afterwards."): o.append("**What the learner can say afterwards.** " + brief["What the learner can say afterwards."] + "\n")
    if brief.get("workbook"): o.append("**The workbook.** " + re.sub(r"\n+", " ", brief["workbook"]) + "\n")
    for m in mods:
        o.append(f"### {m['id']} {m['title']}\n")
        if m['card_title']: o.append(f"**Story card.** *{m['card_title']}* {m['card_body']}\n")
        if m['objective']: o.append(f"**Objective.** {m['objective']}\n")
        o.append("| Lesson | Key | Teaches | Gist |\n| :- | :- | :- | :- |")
        for l in m['lessons']:
            keys = ", ".join(l['keys']) or "—"
            gist = l['done'] or ("Graded on the sheet's end state: " + (l['brief'][:160] + "…" if len(l['brief']) > 160 else l['brief']) if l['brief'] else "")
            if l['id'].endswith('.C') and not l['done']:
                gist = (f"Challenge, goals only ({l['ngoals']} goals): all of {m['id']} under the clock." if l['ngoals'] else f"Challenge, goals only: all of {m['id']} under the clock.")
            title = l['title'].replace("|", "/")
            o.append(f"| {l['id']} {title} | {('`' + l['key'] + '`') if l['key'] else '—'} | {keys} | {gist} |")
        o.append("")
io.open(OUT, 'w', encoding='utf-8').write("\n".join(o))
print("written", OUT, len("\n".join(o)))
```

## The docs in the repo (run R0 of the build)

The same docs live in two places: the claude.ai project (under `claude/`) and the repo (under `docs/`). This is the mapping, and what run R0 does with it.

| Project doc | Repo path |
| :- | :- |
| claude/rebuild-direction.md | docs/REBUILD_PLAN.md |
| claude/screenplay.md | docs/screenplay/screenplay.md |
| claude/script-ch1.md … claude/script-ch6.md | docs/screenplay/script-ch1.md … script-ch6.md |
| claude/script-drills.md | docs/screenplay/script-drills.md |
| claude/curriculum-summary.md | docs/screenplay/curriculum-summary.md |
| claude/source-checklist.md | docs/screenplay/source-checklist.md |
| claude/tools.md | docs/screenplay/tools.md |
| (not in the project: in hotkey-plan.zip only) | docs/screenplay/interface/ (the approved screens of screenplay 3.0, as images, with an index) |

Run R0, in one commit on `rebuild`:

1. Write the files above into the repo. `hotkey-plan.zip` (handed to Wolf on 2026-10-01; the first was 2026-09-30) holds them already laid out in repo paths, with CLAUDE.md.
2. Replace `CLAUDE.md` at the repo root with the text in the next section.
3. Remove the superseded docs: `START_HERE.md`, `docs/MASTER_HANDOFF.md`, `docs/OPERATING_MODEL.md`, `docs/CODEX_REVIEW.md` and `docs/proposals/`. Git history keeps them. Three code comments cite `docs/proposals` (`app2/app/deal-strip.js`, `app2/content/conventions.js`, `app2/tests/copy-export.js`): point them at the screenplay instead (section 4.5 for the stages, section 7 for the conventions, section 5 for the curriculum).
4. Add one line at the top of `docs/SITE_SPEC.md` and of `docs/LESSON_FRAMEWORK.md`, under the title: "Where this file and docs/screenplay/ disagree, the screenplay wins. docs/REBUILD_PLAN.md, section 1c, lists the superseded sections."
5. Run `node app2/tests/run-checks.js`, commit, push. A dry run of steps 1 to 3 on 2026-09-30 passed all 636 tests.

After R0, a build session that changes a doc changes the repo copy and says so in its report. The project chat copies the repo's version back into the project before the next planning edit, so the two never fork for long.

## CLAUDE.md for the repo (2026-10-01)

Paste as the whole file. Against the version in the repo it changes seven things: where the content plan is, the case, the rules of the content build, the Supabase project ref, the pricing line, the old build (archived at cutover) and the look (the interface standard of 2026-10-01, built for change, in place of the old build).

````markdown
# hotkey.gg — standing instructions

You are the sole developer of hotkey.gg. Wolf is the founder and product owner; he is non-technical. You write and ship all the code.

## What the product is
A learning-first, beginner-friendly Excel platform with a real in-browser spreadsheet and ribbon. The loop is teach -> guided -> challenge -> timed. Speed and competition are the payoff layer learners graduate into, not the entry point. Nobody gets dropped in the deep end.
- Free: Chapter 1 in full (navigation, editing, formatting, basic formulas, the Ribbon), with its drills, challenges, rapid-fire, the Daily, boards, streaks and achievements.
- Paid (the plan is called Pro): Chapters 2–6 and the timed play on them. Wolf's pricing decision of 2026-09-27 is $29 to own the course or $10 a month, one plan (screenplay 9.1, question 11); nothing on the live pricing page changes until he says go.
- Audience: anyone who never got taught Excel properly, through to finance/IB analysts and MBAs. Long-term: B2B pre-onboarding for banks and training providers.

## Current state
A full rebuild is in progress. Read `docs/REBUILD_PLAN.md` (sequence, status, open decisions) first, every session, and keep its phase and run tables current. Do not create other planning, handoff or audit docs.
- The content plan is `docs/screenplay/`: `screenplay.md` (the master: voice, the case, every screen's copy, the curriculum, the practice layer, decisions, and the build list M1–M108 in section 9.3), one script per chapter (`script-ch1.md` … `script-ch6.md`), `script-drills.md` (drill sketches), `curriculum-summary.md` (generated), `source-checklist.md` (build notes in its section H) and `tools.md`. Start with the screenplay's "Start here".
- `docs/SITE_SPEC.md` (pages and systems) and `docs/LESSON_FRAMEWORK.md` (lesson data and tests) still describe how the site works. Where they disagree with the screenplay, the screenplay wins; the plan's section 1c lists the superseded parts.
- The case is Clearcoat Express, an express car wash being sold to private equity (Project Rinse). Anything still named Voltline or Project Volt is the earlier case and gets re-skinned (run R1).
- The current work is the content build in the plan's section 2a: runs R0, R1, R1b and R2 to R7, in order, without waiting on Wolf between them.
- The look and layout follow the interface standard, screenplay section 3.0, approved by Wolf on 2026-10-01. It overrides SITE_SPEC sections 1 to 5 where they differ. `docs/screenplay/interface/` holds the approved screens as images; where one differs from 3.0, 3.0 wins.
- Build the interface for change. Wolf adjusts the look in code once the content is in, so every color, size and duration is a token in `app2/ui/tokens.css`, each element is one component used everywhere, every string a learner reads is in the copy sheets, and repeated layouts (settings, Reference, the drill catalog, achievements, level titles) render from data. The things 3.0 lists under "Get these right now" are the exception: get them right the first time.
- The old build was archived at cutover (2026-09-22) on the `archive/legacy` branch. Do not import from it. It is no longer the reference for the look, apart from the Ribbon: the interface standard is. Its drill content is NOT ported; curriculum is written from zero.
- `codex/*` and `claude/*` branches are reference material only. Useful pieces: `codex/groundwork-db-integration` (check runner, browser isolation helper, CI hardening, SQL permission tests, nav.js account-isolation fix).
- Existing user data does not need to be preserved. New clean schema; no record migration.

## How to work
- Ship-first. Build, put it on a preview, let Wolf react. Do not over-design or write documents instead of code.
- Batch work and minimise round-trips. Make implementation calls yourself; surface only genuine, consequential product decisions, as a question with 2-4 options and your recommendation first.
- Give honest pushback. Say when something is a bad idea.
- Chat replies: concise, plain English, outcome first. No internal labels, commit hashes or file inventories unless asked.
- Anything visual: show it (preview URL or screenshot) before treating it as done.
- Work through the runs in the plan's section 2a in order. Each has an exit check; do not start the next until it is met. The phases that wait on Wolf (his reviews, accounts, checkout) don't hold up the content runs.
- Content build rules (plan section 2a): build from DRAFT, since Wolf refines by playtesting and locks afterwards; write Chapters 2–6 to goal level yourself as you build each one, in the voice of screenplay section 2 with Chapter 1's script as the model; take the working answers in screenplay 9.1 and each script's open calls as decided; build each chapter's workbook before its lessons. Do not stop to ask what the docs already answer.

## Technical rules
- Static site: HTML, CSS, ES modules. No framework, no build step. Supabase backend (project ref `wepejasrnskvftgnnecr`). Only the publishable anon key may appear in client code; never service-role or Stripe secret keys.
- New code lives under `app2/`: `engine/` (grid, formulas, input, ribbon), `ui/` (nav, themes, shell), `content/` (lessons as data), `app/` (progression, storage), `supabase/` (migrations, functions, tests), `tests/`.
- The engine grades spreadsheet END-STATE and accepts any legitimate route. Where a live formula is required, grade liveness with one shared rule (perturb an input and check the result moves), not a regex. Convention graders inspect parsed formula tokens, only on cells a goal names as a convention check; any legitimate route still passes.
- Formula functions must match Excel. Every function fix ships with a node unit test.
- Lessons are data. Goals name visible elements ("Make Weekly Sales Report bold"), use professional Excel terminology, and never ask for a concept that has not been taught. Every lesson carries a reference solution that the generic solver test replays.
- Database: RLS on every table; no direct client writes, RPC only; entitlement checked server-side; separate public profile fields from owner-only data. New forward migrations only; never rewrite applied history. Run the Supabase security advisors after every schema change.
- Keep what is the product's character: the Ribbon, the keycaps, the cell cursor, the themes, the pixel badges. The Ribbon stays as built. Everything else about the look follows screenplay 3.0: a dark left rail with KeyTips, a color per mode, pages laid out as tables, one panel at the right of the sheet for every timed run and result, a task card that points, the moments in one registry. Copy never uses a dash as punctuation, an emoji or a string of dot-joined fragments, and every text and background pair passes the contrast test.

## Shipping
- Blocking checks must stay fast: static checks + node unit tests + a 1-2 minute browser smoke. Full browser matrix runs nightly or on demand, never blocking.
- Browser tests must block all non-local network traffic. Never test against production Supabase.
- Work lands on `rebuild` (short-lived branches or direct commits, as the run needs) and Wolf plays the preview. Never push to `main` without his OK.
- Database migrations are written under `app2/supabase/` with their pgTAP tests. They reach the live project only through the manual `db-deploy` workflow, which Wolf approves, or through the claude.ai project chat with his go-ahead. Never apply one yourself.

## Business constraints
- The LLC is formed; Mercury handles banking and accounting. Stripe stays in TEST mode until Wolf explicitly says to go live. No real charges, no marketing email sends, no change to live pricing or legal pages without his go-ahead.
- You are not a lawyer or accountant. Flag legal/tax questions for a licensed professional.
````
