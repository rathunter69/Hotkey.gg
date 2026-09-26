// app2/app/flow.js — the `?flow=next` flag (experience pass, 2026-09-23): the redesigned landing,
// first run, Home and Learn, the scale step and the workspace cues live behind it until Wolf
// approves the storyboard. Opening any route with `?flow=next` turns it on for this browser;
// `?flow=off` turns it off. The router mirrors it to <html data-flow="next"> so CSS can follow.
//
//   flowNext()        → true when the new flow is on for this browser
//   applyFlowQuery(q) → reads a parsed route query ({ flow }) and persists the switch
//   reflectFlow()     → sets html[data-flow] (the router calls it on every route)
//
// On go (done): DEFAULT_ON is true and the storage switch is the way to turn it OFF.

export const FLOW_KEY = 'hk2_flow';
export const DEFAULT_ON = true;   // flipped on go (2026-09-23 B); ?flow=off stays as the escape hatch for a week

function readStored() {
  try { return localStorage.getItem(FLOW_KEY); } catch (e) { return null; }
}

/** Pure: the switch value a route query asks for — 'next', 'off', or null when it says nothing. */
export function flowFromQuery(query) {
  const v = query && typeof query === 'object' ? query.flow : null;
  if (v === 'next' || v === 'on' || v === '1') return 'next';
  if (v === 'off' || v === '0') return 'off';
  return null;
}

/** Pure: is the flow on, given what is stored? */
export function flowOn(stored) {
  if (stored === 'next') return true;
  if (stored === 'off') return false;
  return DEFAULT_ON;
}

export function flowNext() { return flowOn(readStored()); }

export function applyFlowQuery(query) {
  const want = flowFromQuery(query);
  if (!want) return flowNext();
  try { localStorage.setItem(FLOW_KEY, want); } catch (e) { /* private window: the attribute below still carries the choice for this load */ }
  reflectFlow(want === 'next');
  return want === 'next';
}

export function reflectFlow(on = flowNext()) {
  try { document.documentElement.setAttribute('data-flow', on ? 'next' : 'live'); } catch (e) { /* no DOM */ }
}
