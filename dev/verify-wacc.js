/* verify-wacc.js (r444, DEPTH_PASS §4.57 depth pass) — the drill's own probe.

   Self-contained by the WORKFLOW §9.1 rule: it names `wacc` and no other drill, so the C13
   retirement guard can never be tripped by it. It mirrors the real harness init exactly
   (hotkey_onboarded · hk_tour_done · hk_learn_done · hk_handle_cache) — a probe that skips
   those is measuring a different page than the player sees (the r440 note).

   Three sections, in the order the campaign says they matter:

     §A  ROUTE ENUMERATION — every Excel route to the visible end state, WALKED, not reasoned
         about. This is the only instrument that has ever found the untriggerable-beat class
         (DEPTH_PASS_CAMPAIGN §1: thirteen found, none by reading a predicate). Three of them
         lived on this drill's shipped board and are listed in the CHALLENGES header; the
         routes that exposed them are walked here as routes 9, 10 and 11 and must now clear.

     §B  THE ☆, ISOLATED — the star route measured against its OWN slow alternative (the r438
         `series` rule: a combined number hides a negative half), plus the negative control that
         proves the star is SKIPPABLE: every core green with the ☆ dark.

     §C  BOARD FACTS — §1.3 density at load and at the win, the 20-row cap, no `####` at load,
         and the geometry moat between the two islands.

   Run:  python3 -m http.server 8846 &
         NODE_PATH=<scratchpad>/node_modules URL=http://127.0.0.1:8846/index.html node dev/verify-wacc.js
*/
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '3', 10);

let fails = 0;
const ok = m => console.log('  ok  ' + m);
const bad = m => { fails++; console.error('FAIL ' + m); };

/* A route is a page-side function of the drill (C) returning demo-style moves, so it can read
   the seed's geometry out of C._o exactly as an alt-path entry does. */
const ROUTES = [
  ['1  TAUGHT — one anchored formula, Ctrl+D down the comp column', `C=>{const o=C._o;return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['2  RIBBON FILL — alt h f i d instead of ctrl+d (§1.0(c): same latch, same star)', `C=>{const o=C._o;return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['3  COPY/PASTE — the head cell copied once and pasted over the other four', `C=>{const o=C._o;return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0, keys:[{key:'c',ctrl:true}]},
      {sel:o.CD+(o.p0+1)+':'+o.CD+o.pN, keys:[{key:'v',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['4  FIVE TYPED, unanchored, bottom-up — the slow route (☆ must go dark)', `C=>{const o=C._o;const st=[];
      for(let i=4;i>=0;i--) st.push({sel:o.CD+(o.p0+i), keys:[...T('='+o.CB+(o.p0+i)+'/(1+(1-'+o.CG+o.aTax+')*'+o.CC+(o.p0+i)+')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]});
      st.push({sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]});
      return st;}`, { star: false }],

  ['5  FULLY ANCHORED everywhere ($ typed on every reference)', `C=>{const o=C._o;const A=(c,r)=>'$'+c+'$'+r;return[
      {sel:o.CD+o.p0, keys:[...T('='+A(o.CB,o.p0)+'/(1+(1-'+A(o.CG,o.aTax)+')*'+A(o.CC,o.p0)+')'),{key:'Enter'}]},
      {sel:o.CD+(o.p0+1), keys:[...T('='+A(o.CB,o.p0+1)+'/(1+(1-'+A(o.CG,o.aTax)+')*'+A(o.CC,o.p0+1)+')'),{key:'Enter'}]},
      {sel:o.CD+(o.p0+2), keys:[...T('='+A(o.CB,o.p0+2)+'/(1+(1-'+A(o.CG,o.aTax)+')*'+A(o.CC,o.p0+2)+')'),{key:'Enter'}]},
      {sel:o.CD+(o.p0+3), keys:[...T('='+A(o.CB,o.p0+3)+'/(1+(1-'+A(o.CG,o.aTax)+')*'+A(o.CC,o.p0+3)+')'),{key:'Enter'}]},
      {sel:o.CD+(o.p0+4), keys:[...T('='+A(o.CB,o.p0+4)+'/(1+(1-'+A(o.CG,o.aTax)+')*'+A(o.CC,o.p0+4)+')'),{key:'Enter'}]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+A(o.CD,o.p0)+':'+A(o.CD,o.pN)+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+A(o.CD,o.rMed)+'*(1+(1-'+A(o.CG,o.aTax)+')*'+A(o.CG,o.aDb)+'/'+A(o.CG,o.aEq)+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+A(o.CG,o.aRf)+'+'+A(o.CD,o.rRel)+'*'+A(o.CG,o.aErp)),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+A(o.CG,o.aKd)+'*(1-'+A(o.CG,o.aTax)+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+A(o.CG,o.aEq)+'*'+A(o.CD,o.rKe)+'+'+A(o.CG,o.aDb)+'*'+A(o.CD,o.rKd)+')/('+A(o.CG,o.aEq)+'+'+A(o.CG,o.aDb)+')'),{key:'Enter'}]}];}`, { star: false }],

  ['6  LOWERCASE typed formulas throughout', `C=>{const o=C._o;const lo=s=>s.toLowerCase();return[
      {sel:o.CD+o.p0, keys:[...T(lo('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')')),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T(lo('=median('+o.CD+o.p0+':'+o.CD+o.pN+')')),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T(lo('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')')),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T(lo('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp)),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T(lo('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')')),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T(lo('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')')),{key:'Enter'}]}];}`, { star: true }],

  ['7  MEDIAN pointed at the middle comp instead of =MEDIAN()', `C=>{const o=C._o;
      const mid=o.bu.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0])[2][1];
      return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('='+o.CD+(o.p0+mid)),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['8  MEDIAN as =SMALL(range,3) — the same middle value, a different function', `C=>{const o=C._o;return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('=SMALL('+o.CD+o.p0+':'+o.CD+o.pN+',3)'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['9  RELEVER written INLINE — no reference to the median row (killed beat #1)', `C=>{const o=C._o;return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['10 WACC as ONE expression — no reference to Ke or the after-tax line (killed beat #2)', `C=>{const o=C._o;return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*('+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp+')+'+o.CG+o.aDb+'*('+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')))/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['11 CAPM off an inline relever — no reference to the relevered row (killed beat #3)', `C=>{const o=C._o;return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')*'+o.CG+o.aErp),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]}];}`, { star: true }],

  ['12 the WEIGHT-times-COST WACC form, and the after-tax line written as Kd − Kd×t', `C=>{const o=C._o;
      const W='('+o.CG+o.aEq+'+'+o.CG+o.aDb+')';return[
      {sel:o.CD+o.p0, keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'+'+o.CD+o.rMed+'*(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CD+o.rRel+'*'+o.CG+o.aErp+'+'+o.CG+o.aRf),{key:'Enter'}]},
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'-'+o.CG+o.aKd+'*'+o.CG+o.aTax),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('='+o.CG+o.aEq+'/'+W+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'/'+W+'*'+o.CD+o.rKd),{key:'Enter'}]}];}`, { star: true }],

  /* the pointer starts one step from the FORMULA cell and restarts after every operator
     boundary (index.html startPointerFromArrow + OPERATOR_BOUNDARY), so a reference is
     (horizontal steps, then vertical steps) from the cell being written. Every build cell sits
     in the output column, so the column deltas are jitter-independent: −2 to the levered beta,
     −1 to the D/E, +3 to the assumption stack. */
  ['13 POINT MODE for the whole chain (the slowest legal route — the spread floor)', `C=>{const o=C._o;
      const pt=(dc,dr)=>{const a=[];const H=dc>=0?'ArrowRight':'ArrowLeft';for(let k=0;k<Math.abs(dc);k++)a.push({key:H});
        const V=dr>=0?'ArrowDown':'ArrowUp';for(let k=0;k<Math.abs(dr);k++)a.push({key:V});return a;};
      const st=[];
      for(let i=0;i<5;i++){const R=o.p0+i;
        st.push({sel:o.CD+R, keys:[{key:'='},...pt(-2,0),...T('/(1+(1-'),...pt(3,o.aTax-R),...T(')*'),...pt(-1,0),...T(')'),{key:'Enter'}]});}
      st.push({sel:o.CD+o.rMed, keys:[...T('=MEDIAN('),...pt(0,o.p0-o.rMed),
        {key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},...T(')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rRel, keys:[{key:'='},...pt(0,o.rMed-o.rRel),...T('*(1+(1-'),...pt(3,o.aTax-o.rRel),...T(')*'),...pt(3,o.aDb-o.rRel),...T('/'),...pt(3,o.aEq-o.rRel),...T(')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rKe,  keys:[{key:'='},...pt(3,o.aRf-o.rKe),...T('+'),...pt(0,o.rRel-o.rKe),...T('*'),...pt(3,o.aErp-o.rKe),{key:'Enter'}]});
      st.push({sel:o.CD+o.rKd,  keys:[{key:'='},...pt(3,o.aKd-o.rKd),...T('*(1-'),...pt(3,o.aTax-o.rKd),...T(')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rW,   keys:[...T('=('),...pt(3,o.aEq-o.rW),...T('*'),...pt(0,o.rKe-o.rW),...T('+'),...pt(3,o.aDb-o.rW),...T('*'),...pt(0,o.rKd-o.rW),...T(')/('),...pt(3,o.aEq-o.rW),...T('+'),...pt(3,o.aDb-o.rW),...T(')'),{key:'Enter'}]});
      return st;}`, { star: false }],
];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  /* the real harness init — a probe that skips it is measuring a page the player never sees */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1');
    localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1');
    localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const walk = (src) => page.evaluate(({ src }) => {
    try { window.__hkCelQ = []; } catch (e) {}
    document.querySelectorAll('.hk-cel-wrap').forEach(n => { try { n.click(); } catch (e) {} n.remove(); });
    document.querySelectorAll('.wb-dlg').forEach(n => n.remove());
    loadChallenge('wacc');
    const C = CHALLENGES.wacc;
    const k0 = keyLog.length;
    let moves;
    if (src === '@demo') moves = C.demo();
    else moves = (0, eval)('(' + src + ')')(C);
    for (const mv of moves) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    const items = C.checks(S);
    const cores = items.filter(x => !x.bonus && !x.save);
    const star = items.find(x => x.bonus);
    return {
      keys: keyLog.length - k0,
      cores: cores.map(x => ({ label: x.label.slice(0, 52), ok: !!x.ok })),
      star: !!(star && star.ok),
      allCores: cores.every(x => x.ok),
    };
  }, { src });

  console.log('\n§A ROUTE ENUMERATION — every route walked, ' + SEEDS + ' seeds each');
  console.log('   (every core must clear on every route: §1.0-R3(p) grade the END STATE)\n');
  const keyMed = {};
  for (const [name, src, want] of ROUTES) {
    const runs = [];
    for (let s = 0; s < SEEDS; s++) runs.push(await walk(src));
    const bads = runs.filter(r => !r.allCores);
    const stars = runs.map(r => r.star);
    const med = runs.map(r => r.keys).sort((a, b) => a - b)[Math.floor(SEEDS / 2)];
    keyMed[name.slice(0, 2).trim()] = med;
    const line = name.padEnd(78) + ' ' + String(med).padStart(4) + ' keys  ☆' + (stars.every(Boolean) ? 'on ' : stars.every(x => !x) ? 'off' : 'MIX');
    if (bads.length) { bad(line + '  — ' + bads[0].cores.filter(c => !c.ok).map(c => c.label).join(' | ')); }
    else if (want.star !== null && stars.some(x => x !== want.star)) bad(line + '  — ☆ expected ' + (want.star ? 'ON' : 'OFF'));
    else ok(line);
  }

  console.log('\n§B THE ☆, ISOLATED (r438 series rule: measure the move against its OWN alternative)');
  const starKeys = await page.evaluate(() => {
    loadChallenge('wacc'); const C = CHALLENGES.wacc, o = C._o;
    const run = (moves) => { loadChallenge('wacc'); const k0 = keyLog.length;
      for (const mv of moves) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      return keyLog.length - k0; };
    const head = [...('=' + o.CB + o.p0 + '/(1+(1-$' + o.CG + '$' + o.aTax + ')*' + o.CC + o.p0 + ')')].map(c => ({ key: c })).concat([{ key: 'Enter' }]);
    const starRoute = [{ sel: o.CD + o.p0, keys: head },
      { sel: o.CD + o.p0, keys: [{ key: 'ArrowDown', shift: true }, { key: 'ArrowDown', shift: true }, { key: 'ArrowDown', shift: true }, { key: 'ArrowDown', shift: true }, { key: 'd', ctrl: true }] }];
    const typedRoute = [];
    for (let i = 0; i < 5; i++) typedRoute.push({ sel: o.CD + (o.p0 + i),
      keys: [...('=' + o.CB + (o.p0 + i) + '/(1+(1-' + o.CG + o.aTax + ')*' + o.CC + (o.p0 + i) + ')')].map(c => ({ key: c })).concat([{ key: 'Enter' }]) });
    return { star: run(starRoute), typed: run(typedRoute) };
  });
  ok('the ☆ route (one anchored formula + one fill) = ' + starKeys.star + ' keys');
  ok('its own slow alternative (five typed formulas)  = ' + starKeys.typed + ' keys');
  if (starKeys.typed - starKeys.star < 20) bad('☆ headroom is ' + (starKeys.typed - starKeys.star) + ' keys — too thin to be a discovery');
  else ok('☆ is worth ' + (starKeys.typed - starKeys.star) + ' keys (' + (starKeys.typed / starKeys.star).toFixed(2) + '× on the move itself)');
  const fast = keyMed['1'], slow = keyMed['13'];
  ok('board spread: fastest legal ' + fast + ' → slowest legal ' + slow + ' keys = ' + (slow / fast).toFixed(2) + 'x');

  console.log('\n§C BOARD FACTS');
  const facts = await page.evaluate(() => {
    const out = { load: [], win: [] };
    loadChallenge('wacc');
    const C = CHALLENGES.wacc, o = C._o;
    const rowsUsed = () => { let n = 0; for (let r = 1; r <= S.ROWS; r++) {
      let hit = false; for (let c = 1; c <= 10; c++) { const x = S.cells[colLetter(c) + r];
        if (x && x.value !== null && x.value !== '') { hit = true; break; } }
      if (hit) n++; } return n; };
    const overflow = () => { const bad = []; for (let c = 1; c <= 10; c++) if (overflowsCol(S, c)) bad.push(colLetter(c)); return bad; };
    out.rows = S.ROWS;
    out.loadRows = rowsUsed();
    out.loadOverflow = overflow();
    /* the moat: the column between the two islands must be empty on every row, or a
       Ctrl+Shift+arrow out of the comp table rides into the assumption stack (§3 geometry) */
    out.moatCol = colLetter(o.c0 + 4);
    out.moatClear = Array.from({ length: S.ROWS }, (_, i) => S.cells[out.moatCol + (i + 1)]).every(x => !x || x.value === null || x.value === '');
    out.natWidth = Array.from({ length: 10 }, (_, i) => (S._colW && S._colW[i + 1]) || 78).reduce((a, b) => a + b, 0);
    for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    out.winRows = rowsUsed();
    out.winOverflow = overflow();
    out.compFmt = Array.from({ length: 5 }, (_, i) => S.cells[o.CD + (o.p0 + i)]).map(x => x.fmtStyle + '/' + x.decimals);
    return out;
  });
  (facts.rows === 20 ? ok : bad)('ROWS = ' + facts.rows + ' (§1.3: 20 is floor AND cap)');
  (facts.loadRows / 20 >= 0.6 ? ok : bad)('density at LOAD = ' + facts.loadRows + '/20 = ' + Math.round(facts.loadRows / 20 * 100) + '%');
  (facts.winRows / 20 >= 0.6 ? ok : bad)('density at WIN  = ' + facts.winRows + '/20 = ' + Math.round(facts.winRows / 20 * 100) + '%  (§1.3 target ≥60%)');
  (facts.loadOverflow.length === 0 ? ok : bad)('no #### at load' + (facts.loadOverflow.length ? ' — overflowing: ' + facts.loadOverflow : ''));
  (facts.winOverflow.length === 0 ? ok : bad)('no #### at the win' + (facts.winOverflow.length ? ' — overflowing: ' + facts.winOverflow : ''));
  (facts.moatClear ? ok : bad)('geometry moat: column ' + facts.moatCol + ' is empty on all 20 rows');
  (new Set(facts.compFmt).size === 1 ? ok : bad)('the comp column carries ONE format (' + facts.compFmt[0] + ') — a fill cannot degrade it (r439 cases)');
  ok('natural sheet width = ' + facts.natWidth + 'px (elastic-scaled; this drill grades no width verdict)');

  if (errs.length) bad('page errors: ' + errs.slice(0, 3).join(' | '));
  else ok('zero page errors');

  console.log('\n' + (fails ? 'verify-wacc: ' + fails + ' FAILURE(S)' : 'verify-wacc: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
