# How to write hotkey.gg copy

The words learners read live in four spreadsheets under `app2/content/copy/`. Edit them in Excel or Google Sheets, keep the header row exactly as it is, save each as CSV (UTF-8), and send the folder back. A script validates it against the rules below, shows what changed row by row, and puts it live. Nothing you write is fetched at runtime; it is inlined into the site.

## The four files

| File | One row is… | Columns |
|---|---|---|
| `lessons.csv` | one lesson, challenge, project or assessment | `id` (never change) · `module` · `order` (1.3.2, 1.3.C) · `title` · `brief` · `closing` · `wow` · `convention_line` · `mac_note` · `story_beat` |
| `goals.csv` | one goal inside a lesson (`goal_index` counts from 0) | `lesson_id` · `goal_index` · `text` · `teach` · `why` · `hint_stuck` |
| `modules.csv` | one module (1.1 … 1.8) | `id` · `name` · `objective` · `story_beat` · `page_name` |
| `site.csv` | one line somewhere on the site, by key | `key` · `text` |

Where each field shows:

- **brief** — the task card when a lesson opens. At most 3 sentences, 70 words. Ends with the headline key in backticks: `` the key move is `Ctrl+↓` ``.
- **closing** — the paragraphs on the "Lesson complete" overlay. Separate paragraphs with ` || `.
- **wow** — the one-line payoff on the same overlay, above the closing ("Change a figure on Raw: the live block moves, the snapshot holds."). It is the "does it tie" moment.
- **convention_line** — the banker-convention chip text. **mac_note** — the one line a Mac learner sees. **story_beat** — a lesson's own beat, rarely used; the module's beat usually carries it.
- **goal text** — the line the learner acts on. **teach** — the one sentence above it in guided mode that says what the key does. **why** — one sentence under it: why a banker does it this way. **hint_stuck** — shown after 8 seconds without progress, before the keys are revealed.
- **modules: objective** shows in the data room and on the Learn page; **story_beat** is the card at the module's first lesson, as `Title || body`; **page_name** is what the finished page is called when it is delivered ("Page 1.1 — The workbook, set up to standard — delivered to the data room").
- **site.csv** keys are the briefing cards (`briefing_1_title` …), the orientation card, the landing headline and subhead, the six mode captions (`mode_lesson` …), the dashboard sentences, the deal strip, the delivered line (`{n}` and `{page}` fill in), the save nudge, the install prompt and the two due-today lines.

An empty cell is not an instruction to show nothing: the site keeps its built-in line. Delete a row and the same happens. Change an `id`, `lesson_id`, `goal_index` or `key` and the row stops matching anything.

## The voice

A finance instructor talking to a capable person who has never worked in banking. Say what the thing is the first time it appears ("the data room: the folder buyers will read"). Never assume a job title, never say "house style", never "first-year". American spelling: color, center, practice, organize. Excel's own names for things: Format Cells, Center Across Selection, the Name Box, Go To Special. Keys as Excel writes them: Ctrl+Shift+↓, Alt H O R, F2.

## Goal lines

A goal names something the learner can see and ends with a full stop. One action sentence.

Good:

- Rename Sheet2 to Inputs.
- Make the "Weekly Sales Report" title in A1 bold.
- Select the Revenue column E2:E61 in one Ctrl+Shift+↓.
- Old wk37 is a dead half-export — delete it and confirm.

Bad, and why:

- *Make it look professional.* — names nothing visible; which cells, which command?
- *Format the header, then the totals, then check the widths.* — three jobs; each one is a goal.
- *Use the trick from earlier to tidy this up* — the learner cannot see "the trick"; name the key or the cell.
- *Colour the inputs blue* — spelling; "Color the inputs in B4:B6 blue."

## Limits the checker enforces

| Field | Limit |
|---|---|
| brief | ≤ 3 sentences, ≤ 70 words |
| goal text | ≤ 140 characters, one sentence, ends with . ! or ?, names a cell, range, sheet, quoted label, key or Ribbon command |
| teach | one sentence |
| why | one sentence, ≤ 110 characters |
| anywhere | no British spellings, no "house style", no "first-year" |

The checker prints the file, the row and the sentence it stopped on. Fix it in the sheet and send again; a folder that fails changes nothing on the site.
