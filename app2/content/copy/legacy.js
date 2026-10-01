// app2/content/copy/legacy.js — copy rows written before the screenplay's voice and its tells rules (M94).
// Run R1 rewrites them from docs/screenplay/script-ch1.md and screenplay section 3; each id leaves this list as
// its rows are rewritten, and the list is empty when R1 is done. While a row is listed, copy-check reports
// its R3/R13/R14 findings as warnings instead of errors. Nothing new is ever added here.
export const LEGACY_LESSONS = new Set(['numbers-a-banker-can-read', 'fonts-fills-borders', 'alignment-and-titles', 'the-style-pass', 'challenge-to-standard-in-three-minutes', 'point-dont-type', 'sum-family-and-autosum', 'anchors-dollar-and-f4', 'link-across-sheets', 'one-formula-per-row-filled-right', 'read-the-error-follow-the-trail', 'challenge-the-site-pnl', 'fit-to-one-page', 'the-checks-row', 'hardcode-hunt', 'challenge-audit-before-you-send', 'weekly-kpi-project', 'foundations-assessment', 'foundations-testout']);
export const LEGACY_MODULES = new Set(['format', 'formulas', 'present-and-audit', 'project-and-assessment']);
export const LEGACY_SITE = new Set([]);
export const LEGACY_MICRO = new Set([]);
