# MODELING_STANDARDS.md — the conventions a Models board must obey (r436)

_Binding on every drill in **Models I**, **Models II** and **Full Builds**, and on any
Formulas-chapter drill whose board is a real financial model. Read this BEFORE designing a
board. DEPTH_PASS.md §1 still governs beat structure; this file governs whether the MODEL is
right._

**Why this file exists.** The rest of the catalog teaches Excel mechanics with a finance skin,
and a wrong label costs a player nothing. These three chapters are different: the player is an
analyst or an incoming associate, and a board that violates a convention their desk enforces
teaches them a habit they will be corrected for. A correct keystroke on a wrong model is worse
than no drill. These are the conventions taught by the standard training path (WSP / BIWS /
Macabacus / CFI house styles and the bulge-bracket internal guides they mirror) — the things a
reviewer notices in the first ten seconds of opening a model.

---

## 1 · The formatting law (non-negotiable — this is the one every desk enforces)

**Font colour encodes PROVENANCE, not decoration:**

| colour | means | example |
|---|---|---|
| **blue** | a hardcoded INPUT typed by a human | growth assumption, tax rate, entry multiple |
| **black** | a FORMULA computed on this sheet | `=B5*B6`, `=SUM(...)` |
| **green** | a link to ANOTHER SHEET/tab | `=Assumptions!B4` |
| **red** | needs attention / a flag / an external link to another FILE | broken tie, plug |

This is the single most-checked convention in a real review. A model where inputs and formulas
are the same colour is unreviewable. Drills already enforce blue-for-hardcode; **green-for-link
is the one the catalog under-uses** and should appear wherever a board has more than one
logical sheet-area.

**Corollary that must be gradeable: NO HARDCODES INSIDE FORMULAS.** `=B5*1.03` is wrong; the
1.03 belongs in a labelled blue input cell and the formula reads `=B5*(1+$B$2)`. This is the
lesson `versionup` and `hunt` already own — Models boards must not violate it in their own
seeded content.

**Structure conventions:** totals wear a **top** border (never a rule underneath); a grand
total may wear a double bottom rule; units are stated in the header (`$mm`, `$000s`, `x`, `%`);
negative numbers are shown in parentheses, not with a leading minus, in accounting format.

---

## 2 · Sign convention — pick one and hold it

Two schools exist and both are defensible; what is NOT defensible is mixing them on one page.

- **Costs negative** (revenue positive, COGS/opex negative, so the P&L is a column of additions
  `=SUM(...)`). Preferred for schedules that feed a cash flow, and the one this catalog uses —
  `signerr` exists precisely to teach sweeping pasted positive costs back to negative.
- **Costs positive** (subtraction written explicitly: `=revenue - COGS - opex`).

**Board rule:** state the convention on the board (a units/basis memo line), keep it consistent
across every seeded row, and never let a drill's own seeded content violate it. In cash-flow
statements, uses of cash are negative — capex is `(capex)`, an increase in NWC is a use.

---

## 3 · The roll-forward ("corkscrew") — the single most important structure

Every balance that moves over time is built the same way, and a reviewer looks for exactly this
shape:

```
Beginning balance          =prior period's Ending
  + additions
  − reductions
= Ending balance           → becomes next period's Beginning
```

Applies to: debt schedules, PP&E (begin + capex − D&A), NWC, cash, share count, deferred taxes,
equity/retained earnings (begin + net income − dividends). **The Beginning cell must REFERENCE
the prior Ending — never re-type it.** That link is the lesson; a typed beginning balance is the
classic junior error and is exactly what `bridge`'s recursive-line lesson sets up.

---

## 4 · Standard formula forms (get these exactly right)

**Valuation / DCF**
- Unlevered FCF = `EBIT × (1 − tax) + D&A − Capex − ΔNWC`
  (note: EBIT × (1−t) is NOPAT; D&A added back because it is non-cash)
- WACC = `E/(D+E) × Re + D/(D+E) × Rd × (1 − tax)`
- CAPM: `Re = Rf + β × ERP` (+ size premium if the house uses one)
- Unlevering beta: `βu = βl / (1 + (1−t) × D/E)`; relever with the target's own D/E
- Discount factor = `1 / (1 + WACC)^t`; **mid-year convention** uses `t − 0.5`
- Terminal value, perpetuity growth = `FCF_final × (1+g) / (WACC − g)`; exit multiple =
  `EBITDA_final × multiple`. **TV is discounted at the FINAL period's factor.**
- Enterprise → equity bridge: `EV − net debt − minorities − preferred + associates = equity value`;
  per share = equity value / **diluted** shares
- Sanity checks a reviewer applies: `g < WACC` always; TV should not be a wild share of EV
  (~60–80% is normal and worth a memo line); implied exit multiple vs the perpetuity answer

**Comps**
- Trading: `EV/EBITDA`, `EV/EBIT`, `EV/Revenue`, `P/E`. **EV multiples take pre-interest
  metrics; P/E takes post-interest.** Pairing equity value with EBITDA is the classic error.
- Use **median** as the headline, not mean — outliers are the norm in a small comp set. (This
  is why `decimals` builds a live MEDIAN row.)
- Calendarise and use LTM/NTM consistently; state which.

**LBO**
- Sources & Uses must balance — the check is a beat in itself.
- Debt schedule with a **cash sweep**: mandatory amortisation first, then optional prepayment
  from excess free cash, floored so the revolver never goes negative.
- Interest on **average** balance `(begin+end)/2` is the convention that creates circularity
  (see §5); interest on the beginning balance avoids it and is the acceptable simplification.
- Returns: `MoM = exit equity / entry equity`; `IRR = MoM^(1/years) − 1` for a single-cash-flow
  case — and note that this is the same compound form `cagr` teaches, which is a real chaining
  opportunity between chapters.
- Credit stats: `Debt/EBITDA` (leverage), `EBITDA/Interest` (coverage) — `covtable` owns these.

**Three-statement linkage** (the Full Builds spine — a reviewer tests exactly these)
- Net income → top of cash flow, **and** → retained earnings on the balance sheet
- D&A → added back on CF, **and** → accumulated depreciation / PP&E
- Capex → investing outflow, **and** → PP&E
- Debt issuance/repayment → financing, **and** → the debt balance
- **Ending cash on the CFS must equal cash on the BS.** If it does not, the model is wrong.
- **Balance check: Assets − (Liabilities + Equity) = 0**, shown on the page and expected to read
  zero. `balance` and `balcheck` own this; every Full Build should carry it.

---

## 5 · Circularity — name it, don't pretend it isn't there

Interest on an average debt balance creates a genuine circular reference (interest → net income
→ cash → debt → interest). Real models handle it one of three ways, and a drill should teach
one deliberately rather than stumble into it:

1. **Iterative calculation on** (Excel's own switch) — what most banks do, plus a circuit-breaker
   toggle cell that zeroes interest to clear a `#REF!` cascade.
2. **Interest on the BEGINNING balance** — kills the circularity outright; a very common and
   perfectly respectable simplification, and the right default for a teaching board.
3. **Hardcode the interest for one iteration** — a plug, only ever temporary.

This engine has no iterative-calc mode, so **Models drills should use the beginning-balance
convention** and, where the drill is about debt, say so on the board in a memo line. Teaching
the average-balance form without the machinery to resolve it would teach a broken habit.

---

## 6 · Error checks a real model carries (and drills should reward)

- balance check (A − L − E = 0)
- cash flow tie (ending cash on CFS = BS cash)
- sources = uses
- a schedule's ending balance = the balance sheet's line
- sum-of-parts foots to the total (the cross-foot `foot` teaches)
- **checks live in one visible place and read zero/TRUE**; a check that must be hunted for is
  not a check

---

## 7 · What this means for drill design

- The board must be a **plausible artifact** — a real page from a real model, with labelled
  rows, stated units, and a source/basis memo. Not an abstract grid of stubs. (This is exactly
  why `cagr` was rebuilt onto a revenue build and `lookup` onto a peer screen.)
- **Grade the model's correctness through VALUES**, not formula text (§1.0-R3(p)) — but the
  conventions above are legitimately gradeable as end state: colour, sign, the presence of a
  top border on a total, a check reading zero, a beginning balance that REFERENCES rather than
  repeats.
- Where a convention is simplified for teaching (beginning-balance interest, no iterative calc,
  no calendarisation), **say so in a code comment and in the board's own memo line**. A player
  who learns a simplification without knowing it is one will be corrected on a desk.
- The ☆ on a Models board should still be an EFFICIENCY move (§1.0(d)) — but the richest ones
  here are structural: one anchored formula filling a whole schedule, a roll-forward whose
  beginning row is one fill because the link was built right, a check that falls out for free
  because the sum was built off the right range.
