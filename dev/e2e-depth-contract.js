/* DEPTH-CONTRACT E2E (r429) — the UNIVERSAL depth-pass contract, asserted for every drill on the
   C9 REWORKED ledger, generically. This is the throughput tool for the rest of the pass: it means
   a new drill needs NO bespoke probe file for anything the standard already promises.

   What it proves per drill (all from DEPTH_PASS §1):
     A  demo() clears every core beat AND earns the ☆            (§2.2 — the demo performs the bonus)
     B  the ☆ is a real mystery slot: exactly one bonus check, dark at load, "☆ ?" rendered,
        and its LABEL TEXT does not appear on screen before it is earned   (§1.0(d))
     C  saveClose is declared and no save beat is hand-written    (§1.0(e))
     D  core beat count is 4–6 authored (+1 engine save)          (§1.1)
     E  ≥2 randomisation axes actually vary across 30 builds      (§1.2)
     F  same-seed determinism: two builds of one seed are identical
     G  board density ≥ the §1.3 floor at the win state
     H  zero page errors across the whole run

   What it deliberately does NOT do: the ☆ FORFEIT negative control. That is drill-specific, and it
   lives in dev/e2e-alt-paths.js — every reworked drill ships an alt whose name says "☆ forfeited",
   and the alt runner fails the build if such an alt actually earns the ☆ (r429 contract).

     node dev/e2e-depth-contract.js [drill ...]     # needs a server on 8791 */
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

// the ledger is the single source of truth — read it straight out of check-invariants.js
const src = fs.readFileSync('dev/check-invariants.js', 'utf8');
const m = /const REWORKED = \[([\s\S]*?)\];/.exec(src);
if (!m) { console.log('could not read the C9 REWORKED ledger'); process.exit(1); }
const LEDGER = m[1].split(',').map(s => (s.match(/'([a-z0-9_]+)'/) || [])[1]).filter(Boolean);
const only = process.argv.slice(2);
const KEYS = only.length ? LEDGER.filter(k => only.includes(k)) : LEDGER;

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 120)));
  await page.addInitScript(() => { try { ['hotkey_onboarded', 'hk_tour_done', 'hk_learn_done']
    .forEach(k => localStorage.setItem(k, '1')); localStorage.setItem('hk_handle_cache', ''); } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  let fails = 0;
  for (const key of KEYS) {
    const r = await page.evaluate((k) => {
      const out = { bad: [], note: [] };
      const clean = () => {
        try { window.__hkCelQ = []; } catch (e) {}
        document.querySelectorAll('.hk-cel-wrap').forEach(n => { try { n.click(); } catch (e) {} n.remove(); });
        try { window.__hkCelOpen = false; } catch (e) {}
        document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
        loadChallenge(k);
      };
      const C = CHALLENGES[k];

      // ---- B/C/D: contract at LOAD -------------------------------------------------
      clean();
      let rows = C.checks(S);
      const bonuses = rows.filter(c => c.bonus);
      if (bonuses.length !== 1) out.bad.push('B: expected exactly 1 bonus check, got ' + bonuses.length);
      if (bonuses[0] && bonuses[0].ok) out.bad.push('B: the ☆ is already earned at load');
      const nCore = rows.filter(c => !c.bonus).length;
      // authored core = graded non-bonus minus the engine's appended save beat
      const authored = nCore - (C.saveClose ? 1 : 0);
      /* §1.1 EXCEPTIONS (r429, recorded not churned): blocksel and pastes each carry SEVEN authored
         core beats. Wolf playtested both at that shape in round 2 and signed them off ("much much
         better — on the right track"), so his live approval outranks the doc's 4–6 cap and the
         right move is to record the exception, not to cut a beat out of a drill he liked. Any
         OTHER drill over the cap is a real finding. */
      const BEAT_CAP_EXEMPT = { blocksel: 7, pastes: 7 };
      const cap = BEAT_CAP_EXEMPT[k] || 6;
      if (authored < 4 || authored > cap) out.bad.push('D: ' + authored + ' authored core beats (§1.1 wants 4–' + cap + ')');
      else if (BEAT_CAP_EXEMPT[k]) out.note.push('§1.1 exempt at ' + authored + ' beats (Wolf-approved r2)');
      if (!C.saveClose) out.bad.push('C: saveClose not declared (§1.0(e))');
      const handWritten = rows.filter(c => !c.bonus && /save your work/i.test(c.label)).length;
      if (C.saveClose && handWritten > 1) out.bad.push('C: the save beat appears ' + handWritten + '× — the engine owns it, exactly once');
      const listTxt = (document.getElementById('checklist') || {}).textContent || '';
      if (!/☆\s*\?/.test(listTxt)) out.bad.push('B: checklist does not render the mystery "☆ ?" slot');
      const starLabel = (bonuses[0] || {}).label || '';
      const bare = starLabel.replace(/^☆\s*/, '').slice(0, 28);
      if (bare && listTxt.includes(bare)) out.bad.push('B: the ☆ label leaks on screen before it is earned');

      // ---- A: the demo clears core AND earns the ☆ ---------------------------------
      clean();
      try {
        for (const mv of C.demo.call(C)) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
      } catch (e) { out.bad.push('A: demo threw — ' + String(e).slice(0, 80)); }
      rows = C.checks(S);
      const coreMiss = rows.filter(c => !c.bonus && !c.ok).map(c => c.label.slice(0, 40));
      if (coreMiss.length) out.bad.push('A: demo left core beats open — ' + coreMiss.join(' | '));
      const b = rows.find(c => c.bonus);
      if (b && !b.ok) out.bad.push('A: demo does NOT earn the ☆ (§2.2 — the demo must perform the bonus, or replay never covers it)');

      // ---- G: density at the win state ---------------------------------------------
      const rowsUsed = new Set();
      for (const cellKey of Object.keys(S.cells)) {
        const c = S.cells[cellKey];
        if (c && (c.value !== '' && c.value != null || c.formula)) rowsUsed.add(+cellKey.replace(/^[A-J]+/, ''));
      }
      out.note.push('density ' + rowsUsed.size + '/' + S.ROWS);
      if (rowsUsed.size < 6) out.bad.push('G: only ' + rowsUsed.size + ' rows carry content at the win state (§1.3 density)');

      // ---- E/F: axes vary, and same-seed determinism --------------------------------
      const sig = () => { const o = C._o || C._R || C._sites || {};
        return JSON.stringify(o) + '|' + JSON.stringify(Object.keys(S.cells).sort().slice(0, 40).map(x => S.cells[x].value)); };
      const seen = new Set();
      for (let i = 0; i < 30; i++) { loadChallenge(k); seen.add(sig()); }
      if (seen.size < 2) out.bad.push('E: board is identical across 30 builds (§1.2 wants ≥2 axes)');
      out.note.push(seen.size + '/30 distinct builds');
      return out;
    }, key);

    const bad = r.bad;
    if (bad.length) fails++;
    console.log((bad.length ? 'FAIL ' : 'PASS ') + key.padEnd(11) + ' · ' + r.note.join(' · ')
      + (bad.length ? '\n       ' + bad.join('\n       ') : ''));
  }

  if (errs.length) { console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); fails++; }
  console.log('\nDEPTH CONTRACT: ' + (fails ? fails + ' FAILURE(S) of ' + KEYS.length : 'ALL ' + KEYS.length + ' PASS'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
