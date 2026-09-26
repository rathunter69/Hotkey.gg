// app2/content/workbooks/clusters.js — the 12-city clothing pool every challenge seed draws from
// (LESSON_FRAMEWORK §8): a seed picks a cluster, a week label and site names, so the Dallas file
// never reads like the Austin one — while the workload (goals, faults, row band, pars) never moves.
// Names are Project Volt fiction: districts and roads of each city, not real businesses.

export const CLUSTERS = [
  { city: 'Dallas', week: 'w/c 22 Sep 2026', sites: ['Deep Ellum', 'Uptown', 'Oak Lawn', 'Bishop Arts', 'Love Field', 'Knox Park'] },
  { city: 'Denver', week: 'w/c 22 Sep 2026', sites: ['LoDo', 'RiNo', 'Cherry Creek', 'Highlands', 'Stapleton', 'Golden Gate'] },
  { city: 'Phoenix', week: 'w/c 29 Sep 2026', sites: ['Camelback', 'Roosevelt Row', 'Arcadia', 'Deer Valley', 'South Mountain'] },
  { city: 'Nashville', week: 'w/c 29 Sep 2026', sites: ['The Gulch', 'East Bank', 'Berry Hill', 'Germantown', 'Music Row'] },
  { city: 'Charlotte', week: 'w/c 06 Oct 2026', sites: ['South End', 'NoDa', 'Plaza Midwood', 'Ballantyne', 'University City'] },
  { city: 'Columbus', week: 'w/c 06 Oct 2026', sites: ['Short North', 'Franklinton', 'Grandview', 'Easton', 'Clintonville'] },
  { city: 'San Antonio', week: 'w/c 13 Oct 2026', sites: ['The Pearl', 'Southtown', 'Alamo Heights', 'Stone Oak', 'Medical Center'] },
  { city: 'Raleigh', week: 'w/c 13 Oct 2026', sites: ['Glenwood South', 'Five Points', 'North Hills', 'Brier Creek', 'Warehouse District'] },
  { city: 'Salt Lake City', week: 'w/c 20 Oct 2026', sites: ['Sugar House', 'The Avenues', 'Granary', 'Millcreek', 'Foothill'] },
  { city: 'Kansas City', week: 'w/c 20 Oct 2026', sites: ['Crossroads', 'Westport', 'River Market', 'Brookside', 'Waldo'] },
  { city: 'Portland', week: 'w/c 27 Oct 2026', sites: ['Pearl District', 'Hawthorne', 'Alberta', 'Sellwood', 'St Johns'] },
  { city: 'Tampa', week: 'w/c 27 Oct 2026', sites: ['Ybor City', 'Hyde Park', 'Seminole Heights', 'Westshore', 'Channelside'] },
];

/** The seed's cluster pick: rng is the challenge's mulberry32 stream. */
export function pickCluster(rng) {
  return CLUSTERS[Math.floor(rng() * CLUSTERS.length)];
}

/** `n` site names from a cluster, in listed order (the pool lists 5–6; a twist may take the 6th). */
export function siteNames(cluster, n) {
  return cluster.sites.slice(0, Math.max(1, Math.min(cluster.sites.length, n)));
}
