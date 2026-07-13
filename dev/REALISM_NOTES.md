# REALISM NOTES — Models + Full Builds tier audit (T-C, r172)
*(Every drill in Models + Full Builds read line-by-line as a former banker
would — prompts, labels, formulas, sign conventions, units, and whether the
checks grade something a desk would recognize. Verdicts below; mechanical
fixes landed in the same round.)*

## Verdict: 21/22 CLEAN, 1 mechanical fix
This tier was built late in the project under the doctrine and it shows. The
math is not "training-shaped" — it is the actual desk math.

## Per-drill notes
- **wacc** PASS — correct Hamada unlever/relever, CAPM, after-tax Kd,
  one-denominator weighting. Input ranges sane (rf 3.5-4.5%, ERP 4.5-6%,
  Kd 5-8%, tax 21-28%). Chain-graded (retyped numbers break checks) — right.
- **dcf** PASS — DF row off anchored rate, Gordon TV = FCF₅(1+g)/(r−g),
  TV discounted with the REUSED year-5 factor (the desk rule, graded).
  Year-end convention (no mid-year) — acceptable for training; note only.
- **lbo** PASS — entry/exit at the same anchored multiple, MOIC, IRR =
  MOIC^(1/hold)−1 (correct point-to-point shorthand, no interim flows).
- **revolver** PASS — sweep = MIN(balance, MAX(0, cash−minimum)); floors and
  caps both graded. Post-sweep proofs both sides.
- **schedule** PASS — BB + capex − dep = EB, dep on OPENING balance,
  anchored rate, negative convention, accumulated-dep memo corkscrew.
- **cascade / waterfall** PASS — strict-seniority MINs, remainder netting
  (B3−B6−B9), per-tranche corkscrews, total ruled off. Cash is positive by
  construction so the missing MAX(0,·) floor in the cascade MIN is safe.
- **wk13** PASS — the best prompt in the tier: totals on FLOWS only,
  "an ending balance total is how you spot a tourist." Anchored minimum
  liquidity, negative cushion weeks intentional. $000s units correct.
- **isbuild** PASS — negative-COGS convention carried into GP = rev + COGS;
  anchored margin/tax; net-margin percent row; bottom line ruled.
- **debtsched** PASS — type-the-rate-then-build staffing story; sweep capped
  by remaining balance AND cash; interest on AVERAGE balance (senior-level
  detail, graded).
- **cfslink** PASS — NI + D&A + ΔNWC + capex with signs carried in inputs;
  corkscrew; conversion memo = net change / NI ("cash conversion of
  earnings") — defensible; sharpen to FCF/EBITDA only if a future drill
  wants the classic definition side-by-side.
- **bsbuild** PASS — engineered to tie (cash derived as balancer), RE roll
  prior + NI − div, check row diagnostic. Matches FM-Magazine "checks" canon.
- **nwcsched** PASS — AR off DSO/revenue, inventory AND payables off COGS
  (the detail juniors miss), ΔNWC referencing prior year.
- **threestmt** PASS — three explicit links (corkscrew, CFS→BS cash, RE
  roll); tie engineered via DA=capex after year 1 — invisible to the player,
  fine for training.
- **txncomps** FIXED — taught `=SUM(D3:D7)/5` for the average while the
  guide bragged "no hand-typed mean"; desks type AVERAGE. req/guide/demo now
  use AVERAGE(D3:D7); the check accepts either idiom (alt added proving it).
- **sourcesuses** PASS — sponsor equity as THE PLUG (formula, never typed),
  both sides common-sized through 100% on anchored totals, funding check.
- **accdil** PASS — includes the financing drag (foregone interest on cash
  consideration, negative convention) — the part the prompt correctly says
  juniors forget. Verdict as percent vs standalone.
- **dcfsens** PASS — true mixed anchors; TV = FCF_terminal/(w−g) with the
  numerator labeled "Terminal FCF" (i.e., already grown) — consistent.
- **retbridge** PASS — decomposition (ΔE)·m₀ + (Δm)·E₁ + ΔD ties EXACTLY to
  the actual equity change (algebraic identity), and the zero-check grades it.
- **football** PASS — midpoints, MIN floor across lows, MAX ceiling across
  highs. $/sh units.
- **liqbridge** PASS — cash + undrawn availability, bridge to ending, cushion
  vs minimum; seeds engineered so Base clears and Severe breaches every run
  (the page always tells its story).
- **covtable** PASS — leverage off LTM EBITDA, STEPPING covenant max,
  real-IF compliance flag, MIN pulls the pinch quarter; EBITDA sags mid-path
  so the pinch lands mid-table. Genuinely how a compliance grid reads.

## Nits recorded, not fixed (below the bar for churn)
- dcf could one day offer a mid-year-convention variant (advanced).
- cfslink conversion memo definition (above).
- comps/txncomps peer/deal name pools are static lists — content-randomizing
  them is cosmetic; densities are already carried by shuffled values.

## Alt-path proofs added this round
wacc (debt side first), txncomps (SUM/5 still lands), football (ceiling
first), dcfsens (fill down first) — advanced-tier ALTS now exist, breaking
the "alts are a Foundations thing" pattern. T-B continues the rollout.
