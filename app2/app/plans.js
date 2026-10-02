// app2/app/plans.js — the plans' figures and ticked rows (docs/phases/E-checkout.md, decisions 3
// and 4), in one place with no dependencies beyond the copy sheet, so the pricing page and the
// landing's plans read the same words without the landing loading auth, entitlement or checkout.
import { siteCopy } from '../content/copy/apply.js';

const t = (key, fb) => siteCopy(key, fb);

/** The figures, in dollars (decision 3 and 4). The copy sheet carries the same figures as words. */
export const PRICES = { month: 15, studentMonth: 9, seat: 12, minSeats: 5 };

/** The ticked rows of each plan, as site.csv rows. */
export const FREE_ROWS = () => ['pricing_free_1', 'pricing_free_2', 'pricing_free_3', 'pricing_free_4'].map((k, i) => t(k, ['All of Chapter 1', 'Chapter 1’s drills and challenges', 'Rapid-fire and the Daily', 'Boards, streaks and achievements'][i]));
export const FULL_ROWS = () => ['pricing_full_1', 'pricing_full_2', 'pricing_full_3', 'pricing_full_4'].map((k, i) => t(k, ['All six chapters', 'Every drill, challenge and assessment', 'The certificate, with a page anyone can check', 'Everything added to the course later'][i]));
export const TEAMS_ROWS = () => ['pricing_teams_1', 'pricing_teams_2', 'pricing_teams_3'].map((k, i) => t(k, ['Full Access for every seat', 'One monthly invoice for the team', 'Seats added as the team grows'][i]));
