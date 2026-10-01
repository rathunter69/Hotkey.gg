// app2/ui/nav.js — the site's nav is the dark left rail (screenplay 3.0 "The rail"; M88), built
// once in ui/components/rail.js and rendered from data. This module keeps the name the shell and
// the tests import: mountNav is mountRail, and the account row's items are the rail's. The
// two-row top nav, its icon set and the theme picker modal are retired: the theme is picked in
// Settings, under Appearance (3.0, Account).
export { mountRail as mountNav, RAIL_ITEMS, ACCOUNT_ITEMS, LANDING_ITEMS, weekCells, initials } from './components/rail.js';
