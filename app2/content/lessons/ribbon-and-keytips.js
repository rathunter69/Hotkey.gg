// Foundations · How Excel works — The Ribbon and KeyTips
// Alt shows the KeyTips, a letter opens a tab, the next letters run a command (Alt W V G toggles
// the gridlines), and Esc backs out one level at a time.
const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
  A8: { value: 'Total', bold: true }, B8: { value: 6355, bold: true, bt: true }, C8: { value: 209, bold: true, bt: true },
};
/** Keys pressed since the current goal became current (the runner's key window). */
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
/**
 * Alt, H was walked and nothing else was pressed on the Ribbon: the window ends in Alt then H.
 * Esc is not logged, so a walk that ran a command (Alt H 1) leaves its command key after the H
 * and does not count; the mode says whether the two Esc presses backed all the way out.
 */
const homeWalkedThenOut = ses => { const ks = windowKeys(ses); return ses.mode === 'normal' && ks.length >= 2 && ks[ks.length - 1] === 'H' && ks[ks.length - 2] === 'Alt'; };

export default {
  id: 'ribbon-and-keytips',
  chapter: 'foundations',
  section: 'How Excel works',
  title: 'The Ribbon and KeyTips',
  difficulty: 'easy',
  tags: ['ribbon', 'basics'],
  access: 'free',
  concepts: ['ribbon', 'ribbon-tabs', 'keytips', 'gridlines', 'home-tab', 'escape-backs-out'],
  prerequisites: ['workbook-sheets-cells'],
  read: 'The Ribbon is the band of tabs across the top of Excel, and every command on it has a keyboard route. In this lesson you press Alt to show the KeyTips, open the View and Home tabs, hide and show the gridlines, and back out with Esc. Once the chords are in your fingers, formatting a sheet takes seconds and no mouse.',
  sheet: { cells: REPORT, active: { r: 1, c: 1 }, colW: { 1: 84 } },   // column A fitted to its day names, as an author would
  par: 15,
  goals: [
    { id: 'open-view', teach: 'The Ribbon is a row of tabs, each holding a group of commands; Alt shows a KeyTip letter on every tab and pressing it opens that tab.', text: 'Open the View tab with Alt, then W.', keys: 'Alt W', requires: ['ribbon', 'ribbon-tabs', 'keytips'],
      check: (s, ses) => ses.mode === 'ribbon' && !ses.dialog && ses.path.length === 1 && ses.path[0] === 'W' },
    { id: 'gridlines-off', teach: 'Inside a tab the next KeyTips pick a group, then a command: V opens Show and G is Gridlines, so the whole chord is Alt, W, V, G.', text: 'With the View tab open, press V then G to hide the gridlines.', keys: 'V G', requires: ['keytips', 'gridlines'],
      check: s => s.gridlines === false },
    { id: 'gridlines-on', text: 'Show the gridlines again with the full chord.', keys: 'Alt W V G', requires: ['keytips', 'gridlines'],
      check: s => s.gridlines === true },
    { id: 'home-and-out', teach: 'Home holds the everyday formatting commands, and Esc backs out one level at a time: from the tab to the KeyTips, then out of the Ribbon.', text: 'Open the Home tab with Alt, H, look at its groups, then leave the Ribbon with Esc, Esc.', keys: 'Alt H Esc Esc', requires: ['keytips', 'home-tab', 'escape-backs-out'],
      check: (s, ses) => homeWalkedThenOut(ses) },
  ],
  solution: 'Alt W V G Alt W V G Alt H Escape Escape',
};
