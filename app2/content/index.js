// app2/content/index.js — the catalogue: chapters in order, each with its lessons in order.
// Chapter 1 (C2, framework v2): seven modules of lessons on the Clearcoat weekly workbook (Project Rinse), each ending
// in its challenge, then the project, the assessment and the test-out (1.8).
import inherited_workbook from './lessons/inherited-workbook.js';
import { applyCopy } from './copy/apply.js';
import know_the_screen from './lessons/know-the-screen.js';
import ribbon_by_keyboard from './lessons/ribbon-by-keyboard.js';
import analyst_setup from './lessons/analyst-setup.js';
import colour_label_hardcode from './lessons/colour-label-hardcode.js';
import challenge_inherited_file from './lessons/challenge-inherited-file.js';
import jump_dont_scroll from './lessons/jump-dont-scroll.js';
import select_like_you_mean_it from './lessons/select-like-you-mean-it.js';
import around_the_workbook from './lessons/around-the-workbook.js';
import typed_vs_calculated from './lessons/typed-vs-calculated.js';
import challenge_find_and_mark from './lessons/challenge-find-and-mark.js';
import enter_the_missing_day from './lessons/enter-the-missing-day.js';
import fix_it_in_place from './lessons/fix-it-in-place.js';
import copy_cut_paste_fill from './lessons/copy-cut-paste-fill.js';
import paste_special_values from './lessons/paste-special-values.js';
import find_replace_timeline from './lessons/find-replace-timeline.js';
import challenge_complete_the_feed from './lessons/challenge-complete-the-feed.js';
import rows_cols_honest_totals from './lessons/rows-cols-honest-totals.js';
import widths_heights_autofit from './lessons/widths-heights-autofit.js';
import hide_group_freeze from './lessons/hide-group-freeze.js';
import challenge_reshape_the_report from './lessons/challenge-reshape-the-report.js';
import numbers_a_banker_can_read from './lessons/numbers-a-banker-can-read.js';
import fonts_fills_borders from './lessons/fonts-fills-borders.js';
import alignment_and_titles from './lessons/alignment-and-titles.js';
import the_style_pass from './lessons/the-style-pass.js';
import challenge_to_standard_in_three_minutes from './lessons/challenge-to-standard-in-three-minutes.js';
import point_dont_type from './lessons/point-dont-type.js';
import sum_family_and_autosum from './lessons/sum-family-and-autosum.js';
import anchors_dollar_and_f4 from './lessons/anchors-dollar-and-f4.js';
import link_across_sheets from './lessons/link-across-sheets.js';
import one_formula_per_row_filled_right from './lessons/one-formula-per-row-filled-right.js';
import read_the_error_follow_the_trail from './lessons/read-the-error-follow-the-trail.js';
import challenge_the_site_pnl from './lessons/challenge-the-site-pnl.js';
import fit_to_one_page from './lessons/fit-to-one-page.js';
import the_checks_row from './lessons/the-checks-row.js';
import hardcode_hunt from './lessons/hardcode-hunt.js';
import challenge_audit_before_you_send from './lessons/challenge-audit-before-you-send.js';
import weekly_kpi_project from './lessons/weekly-kpi-project.js';
import foundations_assessment from './lessons/foundations-assessment.js';
import foundations_testout from './lessons/foundations-testout.js';
// Chapter 2 · Formatting and presentation (Run 1: modules 2.1 and 2.2; 2.3–2.7 and the project follow)
import built_in_formats_on_a_pnl from './lessons/built-in-formats-on-a-pnl.js';
import sign_convention_costs_negative from './lessons/sign-convention-costs-negative.js';
import currency_and_percent_lines from './lessons/currency-and-percent-lines.js';
import dates_on_the_timeline from './lessons/dates-on-the-timeline.js';
import challenge_format_the_numbers from './lessons/challenge-format-the-numbers.js';
import the_four_section_format from './lessons/the-four-section-format.js';
import units_in_the_format from './lessons/units-in-the-format.js';
import dynamic_headers_with_text from './lessons/dynamic-headers-with-text.js';
import conditional_codes_and_hidden_zeros from './lessons/conditional-codes-and-hidden-zeros.js';
import challenge_house_format_set from './lessons/challenge-house-format-set.js';
// 2.3 The page a buyer reads, 2.4 Alignment and structure (run R2)
import title_units_timeline_answer from './lessons/title-units-timeline-answer.js';
import actuals_vs_estimates_divider from './lessons/actuals-vs-estimates-divider.js';
import borders_that_mean_something from './lessons/borders-that-mean-something.js';
import labels_footnotes_sources from './lessons/labels-footnotes-sources.js';
import widths_and_the_label_column from './lessons/widths-and-the-label-column.js';
import cell_styles_format_painter from './lessons/cell-styles-format-painter.js';
import challenge_pnl_presentation_quality from './lessons/challenge-pnl-presentation-quality.js';
import alignment_at_scale from './lessons/alignment-at-scale.js';
import grouping_and_outline_levels from './lessons/grouping-and-outline-levels.js';
import hide_group_or_separate_sheet from './lessons/hide-group-or-separate-sheet.js';
import navigation_column from './lessons/navigation-column.js';
import challenge_grouped_navigable from './lessons/challenge-grouped-navigable.js';
import highlight_rules from './lessons/highlight-rules.js';
import formula_driven_rules from './lessons/formula-driven-rules.js';
import data_bars_and_scales from './lessons/data-bars-and-scales.js';
import managing_rules from './lessons/managing-rules.js';
import challenge_checks_flags from './lessons/challenge-checks-flags.js';
import text_for_labels from './lessons/text-for-labels.js';
import eomonth_edate from './lessons/eomonth-edate.js';
import dynamic_titles from './lessons/dynamic-titles.js';
import cleaning_imported_labels from './lessons/cleaning-imported-labels.js';
import units_and_period_line from './lessons/units-and-period-line.js';
import challenge_dynamic_header_block from './lessons/challenge-dynamic-header-block.js';
import print_areas_titles_footers from './lessons/print-areas-titles-footers.js';
import one_page_summary from './lessons/one-page-summary.js';
import challenge_print_pack from './lessons/challenge-print-pack.js';
import ch2_project from './lessons/ch2-project.js';
import ch2_assessment from './lessons/ch2-assessment.js';
// Chapter 3 · Formulas and functions (Run R3): 3.5 Time value of money, 3.6 Auditing, 3.7 Project and assessment
import pv_fv_pmt from './lessons/pv-fv-pmt.js';
import npv_xnpv from './lessons/npv-xnpv.js';
import irr_xirr from './lessons/irr-xirr.js';
import payment_schedule from './lessons/payment-schedule.js';
import challenge_new_site_case from './lessons/challenge-new-site-case.js';
import trace_arrows_evaluate from './lessons/trace-arrows-evaluate.js';
import f9_show_formulas_at_scale from './lessons/f9-show-formulas-at-scale.js';
import hardcode_external_link_hunt from './lessons/hardcode-external-link-hunt.js';
import checks_block_rollup from './lessons/checks-block-rollup.js';
import challenge_six_faults from './lessons/challenge-six-faults.js';
import ch3_project from './lessons/ch3-project.js';
import ch3_assessment from './lessons/ch3-assessment.js';
import remix_format_on_the_pnl from './remixes/formatting-on-the-pnl.js';   // Chapter 1's format challenge, re-clothed (content/remix.js)
// Chapter 3 · Formulas and functions (Run R3, the KPI databook on clearcoat-databook): 3.1 logic, 3.2 dates
import if_on_a_threshold from './lessons/if-on-a-threshold.js';
import nested_if_ifs_min_max from './lessons/nested-if-ifs-min-max.js';
import and_or_not from './lessons/and-or-not.js';
import iferror_and_the_override from './lessons/iferror-and-the-override.js';
import challenge_flags_block from './lessons/challenge-flags-block.js';
import date_serials from './lessons/date-serials.js';
import member_tenure from './lessons/member-tenure.js';
import period_keys from './lessons/period-keys.js';
import yearfrac_and_fiscal_periods from './lessons/yearfrac-and-fiscal-periods.js';
import trading_calendar from './lessons/trading-calendar.js';
import challenge_timeline_and_age from './lessons/challenge-timeline-and-age.js';
// Chapter 3 · Formulas and functions (Run R3): 3.3 Math and aggregation, 3.4 Text
import round_family from './lessons/round-family.js';
import countif_countifs from './lessons/countif-countifs.js';
import sumif_sumifs_averageifs from './lessons/sumif-sumifs-averageifs.js';
import busiest_sites from './lessons/busiest-sites.js';
import sumproduct_blended_ticket from './lessons/sumproduct-blended-ticket.js';
import the_reconciliation from './lessons/the-reconciliation.js';
import challenge_site_package_summary from './lessons/challenge-site-package-summary.js';
import split_the_codes from './lessons/split-the-codes.js';
import parse_the_memo from './lessons/parse-the-memo.js';
import text_to_numbers from './lessons/text-to-numbers.js';
import text_to_columns_flash_fill from './lessons/text-to-columns-flash-fill.js';
import challenge_text_dump from './lessons/challenge-text-dump.js';
// Chapter 4 · Data and Lookups (Run R4, the diligence pack on clearcoat-pack): 4.1 Lookups
import why_lookups from './lessons/why-lookups.js';
import vlookup_hlookup_fail from './lessons/vlookup-hlookup-fail.js';
import match_index_match from './lessons/match-index-match.js';
import two_way_index_match from './lessons/two-way-index-match.js';
import xlookup from './lessons/xlookup.js';
import approximate_match_bands from './lessons/approximate-match-bands.js';
import multi_criteria_lookups from './lessons/multi-criteria-lookups.js';
import offset_indirect_why_not from './lessons/offset-indirect-why-not.js';
import challenge_lookup_summary from './lessons/challenge-lookup-summary.js';
// 4.2 Lists and tables, 4.3 Summaries from raw rows
import sort_multi_level from './lessons/sort-multi-level.js';
import autofilter_subtotal from './lessons/autofilter-subtotal.js';
import remove_duplicates from './lessons/remove-duplicates.js';
import data_validation_dropdowns from './lessons/data-validation-dropdowns.js';
import filter_tricks from './lessons/filter-tricks.js';
import dynamic_arrays from './lessons/dynamic-arrays.js';
import challenge_filtered_list from './lessons/challenge-filtered-list.js';
import sumifs_cube from './lessons/sumifs-cube.js';
import kpi_block from './lessons/kpi-block.js';
import date_range_criteria from './lessons/date-range-criteria.js';
import kpi_page_linked_labeled_checked from './lessons/kpi-page-linked-labeled-checked.js';
import question_end_to_end from './lessons/question-end-to-end.js';
import three_d_references from './lessons/3d-references.js';
import challenge_kpi_block from './lessons/challenge-kpi-block.js';

// Chapter 4 · Data and lookups (Run R4): 4.4 Pivot tables, 4.5 Scenarios and sensitivity
import pivot_build_rearrange from './lessons/pivot-build-rearrange.js';
import pivot_group_values from './lessons/pivot-group-values.js';
import pivot_refresh_getpivotdata from './lessons/pivot-refresh-getpivotdata.js';
import challenge_export_three_ways from './lessons/challenge-export-three-ways.js';
import case_toggle_choose_index from './lessons/case-toggle-choose-index.js';
import one_way_data_table from './lessons/one-way-data-table.js';
import two_way_data_table from './lessons/two-way-data-table.js';
import goal_seek_break_even from './lessons/goal-seek-break-even.js';
import pass_through_driver from './lessons/pass-through-driver.js';
import case_outputs_side_by_side from './lessons/case-outputs-side-by-side.js';
import challenge_three_case_model from './lessons/challenge-three-case-model.js';
// Chapter 4 · Data and Lookups (Run R4): 4.6 Names and structure, 4.7 Project and assessment
import naming_sparingly from './lessons/naming-sparingly.js';
import name_manager from './lessons/name-manager.js';
import validation_list_by_name from './lessons/validation-list-by-name.js';
import challenge_toggles_named from './lessons/challenge-toggles-named.js';
import ch4_project from './lessons/ch4-project.js';
import ch4_assessment from './lessons/ch4-assessment.js';
// Chapter 5 · Finance and Accounting (Run R5): 5.1 The three statements, 5.2 Model setup
import the_income_statement from './lessons/the-income-statement.js';
import accrual_and_cash from './lessons/accrual-and-cash.js';
import the_cash_flow_statement from './lessons/the-cash-flow-statement.js';
import the_balance_sheet from './lessons/the-balance-sheet.js';
import how_the_statements_link from './lessons/how-the-statements-link.js';
import one_week_three_statements from './lessons/one-week-three-statements.js';
import read_like_a_buyer from './lessons/read-like-a-buyer.js';
import challenge_one_site_month from './lessons/challenge-one-site-month.js';
import model_architecture from './lessons/model-architecture.js';
import timeline_flags_counters from './lessons/timeline-flags-counters.js';
import fill_patterns from './lessons/fill-patterns.js';
import checks_sheet_day_one from './lessons/checks-sheet-day-one.js';
import populate_from_data from './lessons/populate-from-data.js';
import drivers_block from './lessons/drivers-block.js';
import challenge_model_shell from './lessons/challenge-model-shell.js';
// Chapter 5 · Finance and Accounting (Run R5): 5.3 Schedules, 5.4 Linking the statements
import revenue_build from './lessons/revenue-build.js';
import cost_build from './lessons/cost-build.js';
import working_capital_schedule from './lessons/working-capital-schedule.js';
import ppe_and_depreciation from './lessons/ppe-and-depreciation.js';
import debt_and_interest_circle from './lessons/debt-and-interest-circle.js';
import tax_schedule from './lessons/tax-schedule.js';
import challenge_schedules from './lessons/challenge-schedules.js';
import is_from_schedules from './lessons/is-from-schedules.js';
import cf_indirect from './lessons/cf-indirect.js';
import bs_cash_not_a_plug from './lessons/bs-cash-not-a-plug.js';
import cash_sweep_revolver from './lessons/cash-sweep-revolver.js';
import when_it_doesnt_balance from './lessons/when-it-doesnt-balance.js';
import challenge_linked_statements from './lessons/challenge-linked-statements.js';
// Chapter 5 · Finance and Accounting (Run R5): 5.5 Auditing a model, 5.6 DCF
import tie_outs_cross_foots from './lessons/tie-outs-cross-foots.js';
import error_flags_checks_summary from './lessons/error-flags-checks-summary.js';
import model_wide_sweep from './lessons/model-wide-sweep.js';
import stress_tests from './lessons/stress-tests.js';
import challenge_eight_faults from './lessons/challenge-eight-faults.js';
import what_a_dcf_is from './lessons/what-a-dcf-is.js';
import unlevered_free_cash_flow from './lessons/unlevered-free-cash-flow.js';
import wacc_block from './lessons/wacc-block.js';
import terminal_value from './lessons/terminal-value.js';
import discounting_mid_year from './lessons/discounting-mid-year.js';
import dcf_sensitivity from './lessons/dcf-sensitivity.js';
import challenge_dcf from './lessons/challenge-dcf.js';
// Chapter 5 · Finance and Accounting (Run R5): 5.7 Model speed, 5.8 Project and assessment
import revenue_build_in_three from './lessons/revenue-build-in-three.js';
import fill_and_format_block from './lessons/fill-and-format-block.js';
import keyboard_only_linking from './lessons/keyboard-only-linking.js';
import challenge_model_speed from './lessons/challenge-model-speed.js';
import ch5_project from './lessons/ch5-project.js';
import ch5_assessment from './lessons/ch5-assessment.js';
// Chapter 6 · Valuation (Run R6): 6.2 Precedent transactions, 6.3 LBO
import deal_multiples_premiums from './lessons/deal-multiples-premiums.js';
import sort_and_decide from './lessons/sort-and-decide.js';
import applying_precedents from './lessons/applying-precedents.js';

export const CHAPTERS = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Everything a first-week analyst or a total beginner needs before formulas get serious: how Excel works, moving, selecting, entering and editing, rows and columns, the Ribbon and its dialog boxes, basic formulas, copy and paste.',
    // Chapter 1's sections in order (SITE_SPEC §7): the seven modules and the closing project block.
    sections: [
      { name: 'Open and set up', blurb: 'The workbook management sent, tidied to house standard: tabs, gridlines, Excel Options, the Quick Access Toolbar, and the analyst’s color-and-label conventions.' },
      { name: 'Move and select', blurb: 'Jumps, never scrolls: Ctrl+Arrow, the selection set, Go To for far and cross-sheet targets, and Go To Special.' },
      { name: 'Enter, edit, copy and fill', blurb: 'The feed completed and cleaned, then the report skeleton built from it: Tab and Enter, F2, the clipboard, Paste Special values, Replace All and a filled timeline.' },
      { name: 'Structure', blurb: 'Rows and columns that keep the totals honest, widths and heights, and grouping, freezing and never hiding: the report reshaped without breaking it.' },
      { name: 'Format', blurb: 'Numbers a banker can read, fonts, fills and borders, alignment and titles, and a style pass with F4: the format the team uses, applied once and repeated.' },
      { name: 'Formulas', blurb: 'Point, don’t type; SUM and its family with AutoSum; anchors and F4; links across sheets; one formula per row filled right; the errors and what they mean.' },
      { name: 'Present and audit', blurb: 'Fit to one page, a checks row that reads zero, and the hardcode hunt before the page goes in the pack.' },
      { name: 'Project and assessment', blurb: 'Build the weekly report end to end, then prove it against the clock; or test out of the chapter.' },
    ],
    lessons: [
      inherited_workbook, know_the_screen, ribbon_by_keyboard, analyst_setup, colour_label_hardcode, challenge_inherited_file,
      jump_dont_scroll, select_like_you_mean_it, around_the_workbook, typed_vs_calculated, challenge_find_and_mark,
      enter_the_missing_day, fix_it_in_place, copy_cut_paste_fill, paste_special_values, find_replace_timeline, challenge_complete_the_feed,
      rows_cols_honest_totals, widths_heights_autofit, hide_group_freeze, challenge_reshape_the_report,
      numbers_a_banker_can_read, fonts_fills_borders, alignment_and_titles, the_style_pass, challenge_to_standard_in_three_minutes,
      point_dont_type, sum_family_and_autosum, anchors_dollar_and_f4, link_across_sheets, one_formula_per_row_filled_right, read_the_error_follow_the_trail, challenge_the_site_pnl,
      fit_to_one_page, the_checks_row, hardcode_hunt, challenge_audit_before_you_send,
      weekly_kpi_project, foundations_assessment, foundations_testout,
    ],
  },
  {
    id: 'formatting',
    title: 'Formatting and presentation',
    access: 'paid',
    blurb: 'Number formats and the format code, the anatomy of a financial page, conditional formatting, dates and text, and a page that prints: a three-year P&L brought to the standard a buyer reads.',
    // Chapter 2's sections in order (script-ch2.md): modules 2.1 to 2.7, the project and assessment (2.8), then the remixes.
    sections: [
      { name: 'Number formats', blurb: 'Number formats on a P&L: the desk number format and decimals by line, the sign convention stated once, currency and percent lines, real dates on the timeline.' },
      { name: 'Custom number formats', blurb: 'Custom number formats: the four-section code, units in the format, custom date codes for the timeline, conditions and hidden zeros.' },
      { name: 'The page a buyer reads', blurb: 'The anatomy of a financial page: title, units, timeline, sections and the answer; the actuals-to-estimates divider; borders that mean something; labels, footnotes and sources; widths and the label column; one page’s formats carried to the next, the total line as a cell style.' },
      { name: 'Alignment and structure', blurb: 'Alignment and outline at scale: headers and wraps on a long page; grouping on two levels; hiding against grouping against a separate sheet; a linked navigation column.' },
      { name: 'Conditional formatting', blurb: 'Conditional formatting: highlight rules for negatives and exceptions, formula-driven rules, data bars and scales and when not to use them, managing the rules.' },
      { name: 'Dates and text for presentation', blurb: 'Text and date functions for presentation: TEXT for labels and headers, EOMONTH and EDATE for period ends, dynamic titles with &, cleaning imported labels, a units line that writes itself.' },
      { name: 'Printing and page layout', blurb: 'Printing at pack scale: landscape, fit to one page wide, the title rows repeated, one footer on every page, and the one-page summary linked from the detail.' },
      { name: 'Project and assessment', blurb: 'Build the historical financials section end to end from a raw export, then build it again on the clock; the assessment is the test-out.' },
      { name: 'Remixes', blurb: 'Chapter 1’s challenges re-clothed in this chapter’s material: the same keys on a new sheet, so old skills stay warm.' },
    ],
    lessons: [
      built_in_formats_on_a_pnl, sign_convention_costs_negative, currency_and_percent_lines, dates_on_the_timeline, challenge_format_the_numbers,
      the_four_section_format, units_in_the_format, dynamic_headers_with_text, conditional_codes_and_hidden_zeros, challenge_house_format_set,
      title_units_timeline_answer, actuals_vs_estimates_divider, borders_that_mean_something, labels_footnotes_sources, widths_and_the_label_column, cell_styles_format_painter, challenge_pnl_presentation_quality,
      alignment_at_scale, grouping_and_outline_levels, hide_group_or_separate_sheet, navigation_column, challenge_grouped_navigable,
      highlight_rules, formula_driven_rules, data_bars_and_scales, managing_rules, challenge_checks_flags,
      text_for_labels, eomonth_edate, dynamic_titles, cleaning_imported_labels, units_and_period_line, challenge_dynamic_header_block,
      print_areas_titles_footers, one_page_summary, challenge_print_pack,
      ch2_project, ch2_assessment,
      remix_format_on_the_pnl,
    ],
  },
  {
    id: 'formulas',
    title: 'Formulas and functions',
    access: 'paid',
    blurb: 'Logic, dates, math and aggregation, text, time value of money and auditing: the point-of-sale export rolled up into a KPI databook where every number reconciles.',
    // Chapter 3's sections in order (script-ch3.md): the six modules and the closing project block.
    sections: [
      { name: 'Logic', blurb: 'IF on a threshold; nested IF against IFS against MIN and MAX; AND, OR and NOT for compound flags; IFERROR and the override pattern.' },
      { name: 'Dates', blurb: 'Serial numbers and DATE, YEAR, MONTH, DAY; member tenure from join and cancel dates; period keys for grouping; YEARFRAC and fiscal periods; NETWORKDAYS and WEEKDAY for the trading calendar.' },
      { name: 'Math and aggregation', blurb: 'ROUND and its family; COUNTIFS, SUMIFS and AVERAGEIFS; MAXIFS, MINIFS, LARGE, SMALL and RANK; SUMPRODUCT; the reconciliation.' },
      { name: 'Text', blurb: 'LEN, LEFT, RIGHT and MID; FIND, SEARCH and SUBSTITUTE; VALUE and DATEVALUE; Text to Columns and Flash Fill.' },
      { name: 'Time value of money', blurb: 'PV, FV and PMT on the site-build loan; NPV and XNPV; IRR and XIRR; a payment schedule with anchors.' },
      { name: 'Auditing', blurb: 'Trace precedents and dependents; F9 on a part and Go To Special at scale; the hardcode and external-link hunt; the checks block with a roll-up flag.' },
      { name: 'Project and assessment', blurb: 'Rebuild the Summary so every number ties, then a fresh export against the clock.' },
    ],
    lessons: [
      if_on_a_threshold, nested_if_ifs_min_max, and_or_not, iferror_and_the_override, challenge_flags_block,
      date_serials, member_tenure, period_keys, yearfrac_and_fiscal_periods, trading_calendar, challenge_timeline_and_age,
      round_family, countif_countifs, sumif_sumifs_averageifs, busiest_sites, sumproduct_blended_ticket, the_reconciliation, challenge_site_package_summary,
      split_the_codes, parse_the_memo, text_to_numbers, text_to_columns_flash_fill, challenge_text_dump,
      pv_fv_pmt, npv_xnpv, irr_xirr, payment_schedule, challenge_new_site_case,
      trace_arrows_evaluate, f9_show_formulas_at_scale, hardcode_external_link_hunt, checks_block_rollup, challenge_six_faults,
      ch3_project, ch3_assessment,
    ],
  },
  {
    id: 'data-and-lookups',
    title: 'Data and Lookups',
    access: 'paid',
    blurb: 'Lookups, lists, summaries from raw rows, pivot tables, scenarios and names: the data room’s questions answered from the export, in a diligence pack where every answer points at a cell.',
    // Chapter 4's sections in order (script-ch4.md): the six modules and the closing project block.
    sections: [
      { name: 'Lookups', blurb: 'Why a model reads a dataset; VLOOKUP and how it fails; INDEX and MATCH; XLOOKUP; approximate match and IFERROR; multi-criteria lookups; why the standard avoids OFFSET and INDIRECT.' },
      { name: 'Lists and tables', blurb: 'Sort and multi-level sort; AutoFilter and SUBTOTAL; Remove Duplicates and the unique site list; Data Validation; visible cells, wildcards and skip blanks; UNIQUE, FILTER and SORT.' },
      { name: 'Summaries from raw rows', blurb: 'The SUMIFS cube; the KPI block of utilization and member share; date-range criteria; the KPI page linked, labeled and checked; a buyer’s question end to end; 3D references and grouped sheets.' },
      { name: 'Pivot tables', blurb: 'Build and rearrange; group dates and value settings; refresh and GETPIVOTDATA.' },
      { name: 'Scenarios and sensitivity', blurb: 'A case toggle; one-way and two-way data tables; Goal Seek on break-even; when data tables fail; case outputs side by side.' },
      { name: 'Names and structure', blurb: 'Naming toggles and key inputs, sparingly; the Name Manager; a validation list driven by a name.' },
      { name: 'Project and assessment', blurb: 'Build the diligence pack from a fresh export, then a fresh export against the clock.' },
    ],
    lessons: [
      why_lookups, vlookup_hlookup_fail, match_index_match, two_way_index_match, xlookup, approximate_match_bands, multi_criteria_lookups, offset_indirect_why_not, challenge_lookup_summary,
      sort_multi_level, autofilter_subtotal, remove_duplicates, data_validation_dropdowns, filter_tricks, dynamic_arrays, challenge_filtered_list,
      sumifs_cube, kpi_block, date_range_criteria, kpi_page_linked_labeled_checked, question_end_to_end, three_d_references, challenge_kpi_block,
      pivot_build_rearrange,
      pivot_group_values,
      pivot_refresh_getpivotdata,
      challenge_export_three_ways,
      case_toggle_choose_index,
      one_way_data_table,
      two_way_data_table,
      goal_seek_break_even,
      pass_through_driver,
      case_outputs_side_by_side,
      challenge_three_case_model,
      naming_sparingly, name_manager, validation_list_by_name, challenge_toggles_named,
      ch4_project, ch4_assessment,
    ],
  },
  {
    id: 'finance-and-accounting',
    title: 'Finance and Accounting',
    access: 'paid',
    blurb: 'The three statements by hand, then the operating model: setup, schedules, the statements linked and balanced, the audit, the DCF and model speed, on Clearcoat’s forty sites growing to seventy.',
    // Chapter 5's sections in order (script-ch5.md): the seven modules and the closing project block.
    sections: [
      { name: 'The three statements', blurb: 'The income statement; accrual and cash; the cash flow statement; the balance sheet; how the three link; one week of one site through all three; reading a set the way a buyer does.' },
      { name: 'Model setup and efficiencies', blurb: 'Inputs, calculations and outputs, sheet order and a Cover; the timeline row with its flags and counters; the fill patterns at model speed; the checks sheet from day one; the statements populated from the data tab; the drivers block.' },
      { name: 'Schedules', blurb: 'The revenue build, the cost build, working capital from days to balances, PP&E with its depreciation waterfall, debt and interest with the average-balance circle and a breaker, and tax.' },
      { name: 'Linking the statements', blurb: 'The income statement from the schedules, the cash flow statement by the indirect method, the balance sheet with cash as the plug that isn’t a plug, the cash sweep and the revolver, and the order to check when it doesn’t balance.' },
      { name: 'Auditing a model', blurb: 'Tie-outs and cross-foots; error flags and the checks summary; the model-wide sweep for hardcodes and pattern breaks; stress tests.' },
      { name: 'DCF', blurb: 'What a DCF is; unlevered free cash flow; the WACC block; terminal value both ways; discounting and the mid-year convention; sensitivity tables.' },
      { name: 'Model speed', blurb: 'The chapter’s three benchmarks with the keys shown once: the revenue build in three minutes, a block filled and formatted in one pass, the cash flow statement linked by keyboard alone.' },
      { name: 'Project and assessment', blurb: 'Build the operating model with its DCF page from an empty shell, then one schedule and its links again on the clock; the assessment is the test-out.' },
    ],
    lessons: [
      the_income_statement, accrual_and_cash, the_cash_flow_statement, the_balance_sheet, how_the_statements_link, one_week_three_statements, read_like_a_buyer, challenge_one_site_month, model_architecture, timeline_flags_counters, fill_patterns, checks_sheet_day_one, populate_from_data, drivers_block, challenge_model_shell,
      revenue_build, cost_build, working_capital_schedule, ppe_and_depreciation, debt_and_interest_circle, tax_schedule, challenge_schedules,
      is_from_schedules, cf_indirect, bs_cash_not_a_plug, cash_sweep_revolver, when_it_doesnt_balance, challenge_linked_statements,
      tie_outs_cross_foots, error_flags_checks_summary, model_wide_sweep, stress_tests, challenge_eight_faults,
      what_a_dcf_is, unlevered_free_cash_flow, wacc_block, terminal_value, discounting_mid_year, dcf_sensitivity, challenge_dcf,
      revenue_build_in_three, fill_and_format_block, keyboard_only_linking, challenge_model_speed,
      ch5_project, ch5_assessment,
    ],
  },
  {
    id: 'valuation',
    title: 'Valuation',
    access: 'paid',
    blurb: 'Trading comps, precedent deals, the sponsor’s LBO, the three bids priced and the waterfall to each owner, on one page for the board, with every number traceable to the model.',
    // Chapter 6's sections in order (script-ch6.md): the four modules and the closing project block.
    sections: [
      { name: 'Trading comps', blurb: 'Spreading a comp; calendarization and LTM; sorting the set, screening the outliers, the median; operating multiples; applying the range.' },
      { name: 'Precedent transactions', blurb: 'Deal multiples and premiums; sorting by date and size and deciding what is comparable; applying the precedents range.' },
      { name: 'LBO', blurb: 'Sources and uses; debt tranches and the cash sweep; sale-leasebacks; returns, IRR and MOIC; the returns bridge; what the sponsor can pay.' },
      { name: 'The bids and the waterfall', blurb: 'Three bids side by side; from enterprise value to the owners’ proceeds; your stake; the football field and the board page.' },
      { name: 'Project and assessment', blurb: 'The valuation summary for the board from fresh comps, deals and bids, then again on the clock.' },
    ],
    lessons: [
      deal_multiples_premiums, sort_and_decide, applying_precedents,
    ],
  },
];

/** A chapter's section names in order (sections may be strings or { name, blurb } records). */
export const sectionNames = chapter => (chapter.sections || []).map(s => (typeof s === 'string' ? s : s.name));
/**
 * A chapter's lessons grouped by section, in the chapter's section order: [{ name, blurb, lessons }].
 * Every listed section is returned, with an empty `lessons` list when nothing is built there yet
 * (the catalog shows it as upcoming); a lesson naming an unlisted section lands in 'Basics' at the end.
 */
export function sectionsOf(chapter) {
  const order = (chapter.sections || []).map(s => (typeof s === 'string' ? { name: s, blurb: '' } : { name: s.name, blurb: s.blurb || '' }));
  const groups = new Map(order.map(sec => [sec.name, { name: sec.name, blurb: sec.blurb, lessons: [] }]));
  for (const l of chapter.lessons) { const n = l.section || 'Basics'; if (!groups.has(n)) groups.set(n, { name: n, blurb: '', lessons: [] }); groups.get(n).lessons.push(l); }
  return [...groups.values()];
}

/**
 * A chapter's modules (framework v2): lessons sharing a `module` id, grouped in catalog order,
 * each ending in its challenge — [{ id, title, lessons, challenge }]. `title` is the lessons'
 * shared `section` name; `lessons` excludes the challenge. Legacy lessons (no `module`) are not
 * in any module and keep the sectioned catalog until the rewrite replaces them.
 */
export function modulesOf(chapter) {
  const out = []; const idx = {};
  for (const l of chapter.lessons) {
    if (typeof l.module !== 'string') continue;
    if (idx[l.module] == null) { idx[l.module] = out.length; out.push({ id: l.module, title: l.section || l.module, lessons: [], challenge: null }); }
    const m = out[idx[l.module]];
    if (l.kind === 'challenge') m.challenge = l; else m.lessons.push(l);
  }
  return out;
}
/** The module a lesson belongs to, with the lesson's place in it: { module, n, of, k, of7 } — or null. */
export function moduleOf(lesson) {
  if (!lesson || typeof lesson.module !== 'string') return null;
  const ch = CHAPTERS.find(c => c.id === lesson.chapter);
  if (!ch) return null;
  const mods = modulesOf(ch);
  const k = mods.findIndex(m => m.id === lesson.module);
  if (k < 0) return null;
  const m = mods[k];
  const n = m.lessons.findIndex(l => l.id === lesson.id);
  return { module: m, n: n >= 0 ? n + 1 : m.lessons.length + 1, of: m.lessons.length, k: k + 1, of7: mods.length };
}

// The copy layer (content/copy/*.csv → content/copy/index.js): a lesson's learner-facing words
// overlay the JS file's where a row exists (a clone; the JS lesson stays the raw fallback and
// copy-check warns where a row is missing). LESSONS_RAW is the inline set, for the schema tests.
for (const ch of CHAPTERS) { ch.lessonsRaw = ch.lessons; ch.lessons = ch.lessons.map(l => applyCopy(l)); }
export const LESSONS_RAW = CHAPTERS.flatMap(ch => ch.lessonsRaw);
export const LESSONS = CHAPTERS.flatMap(ch => ch.lessons);
export const LESSONS_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
export const chapterOf = lesson => CHAPTERS.find(ch => ch.id === lesson.chapter);
export const lessonById = id => LESSONS_BY_ID[id] || null;
export const nextLesson = id => { const i = LESSONS.findIndex(l => l.id === id); return i >= 0 && i + 1 < LESSONS.length ? LESSONS[i + 1] : null; };
export const lessonNumber = id => LESSONS.findIndex(l => l.id === id) + 1;
