/* FINAL-BOARD probes: ☆ headroom (keyed), negative controls, and the §1.0-R3(p) route walk. */
(function(){
  const CN = s => s.replace(/[0-9]/g,'');
  const RN = s => +s.replace(/[^0-9]/g,'');
  const ci = L => { let n=0; for(const ch of L) n=n*26+(ch.charCodeAt(0)-64); return n; };
  function walk(a,b){ const k=[];
    const ar=RN(a), ac=ci(CN(a)), br=RN(b), bc=ci(CN(b));
    for(let i=0;i<Math.abs(br-ar);i++) k.push({key: br>ar?'ArrowDown':'ArrowUp'});
    for(let i=0;i<Math.abs(bc-ac);i++) k.push({key: bc>ac?'ArrowRight':'ArrowLeft'});
    return k; }
  /* a selection leaves the cursor wherever dispActive() puts it, which is not what a naive
     walk assumes — so every hop re-parks with Ctrl+Home (ONE real key) and walks from A1.
     Applied identically to a star route and its negative control, so the spread is honest. */
  function nav(a,b){ return [{key:'Home',ctrl:true}].concat(walk('A1',b)); }
  const TT = s => [...s].map(ch=>({key:ch}));
  const EN = {key:'Enter'};
  const LL = ch => ({key:ch.toLowerCase(), code:'Key'+ch.toUpperCase()});
  const ALT = {key:'Alt'};
  const CSR = {key:'ArrowRight',ctrl:true,shift:true};
  const CSD = {key:'ArrowDown',ctrl:true,shift:true};
  const SD  = {key:'ArrowDown',shift:true};
  const SR  = {key:'ArrowRight',shift:true};

  /* ───────── stalelink helpers ───────── */
  const SL = C => { const o=C._o; return {o,
    open : o.yc[0]+(o.hr+2),
    fixKeys(i){ const j=o.stale[i], Lc=o.yc[j];
      return {cell:Lc+(o.hr+2+i), keys:[{key:'F2'},{key:'Home'},{key:'ArrowRight'},{key:'Delete'},{key:o.cV},EN]}; },
    typed(i){ const j=o.stale[i], Lc=o.yc[j];
      const dep = i===0 ? Lc+(o.hr+1) : Lc+(o.hr+2);
      return {cell:Lc+(o.hr+2+i), keys:[...TT('=$'+o.cV+'$'+(o.pr+1+i)+'*'+dep),EN]}; } }; };

  return [
  /* ================= stalelink ================= */
  { key:'stalelink', name:'stalelink FINAL — ☆ route, every selection and navigation KEYED',
    moves:C=>{ const {o,fixKeys}=SL(C); const ks=[]; let cur=o.yc[0]+(o.hr+2);
      for(let i=0;i<3;i++){ const f=fixKeys(i); ks.push(...nav(cur,f.cell),...f.keys); cur=CN(f.cell)+(RN(f.cell)+1); }
      const g0=o.yc[0]+(o.hr+2);
      ks.push(...nav(cur,g0),CSR,CSD,ALT,LL('h'),LL('f'),LL('c'),{key:'ArrowLeft'},{key:'ArrowLeft'},EN);
      cur=o.yc[o.NY-1]+(o.hr+4);
      const d0=o.cD+(o.pr+1);
      ks.push(...nav(cur,d0),SD,SD,{key:'Delete'});   cur=o.cD+(o.pr+3);
      const c1=o.yc[0]+(o.hr+5), m1=o.yc[0]+(o.hr+6);
      ks.push(...nav(cur,c1),...TT('='+o.yc[0]+(o.hr+2)+'-'+o.yc[0]+(o.hr+3)+'-'+o.yc[0]+(o.hr+4)),EN);
      ks.push(...TT('='+c1+'/'+o.yc[0]+(o.hr+2)),EN);  cur=o.yc[0]+(o.hr+7);
      ks.push(...nav(cur,c1),SD,SR,SR,SR,SR,{key:'r',ctrl:true});
      cur=o.yc[o.NY-1]+(o.hr+6);
      ks.push(...nav(cur,c1),CSR,{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('p'));
      ks.push({key:'s',ctrl:true});
      return [{sel:o.yc[0]+(o.hr+2), keys:ks}]; } },

  { key:'stalelink', name:'stalelink FINAL — NEGATIVE CONTROL, keyed: repoints typed out, block typed year by year, ☆ dark',
    moves:C=>{ const {o,typed}=SL(C); const ks=[]; let cur=o.yc[0]+(o.hr+2);
      for(let i=0;i<3;i++){ const f=typed(i); ks.push(...nav(cur,f.cell),...f.keys); cur=CN(f.cell)+(RN(f.cell)+1); }
      const g0=o.yc[0]+(o.hr+2);
      ks.push(...nav(cur,g0),CSR,CSD,ALT,LL('h'),LL('f'),LL('c'),{key:'ArrowLeft'},{key:'ArrowLeft'},EN);
      cur=o.yc[o.NY-1]+(o.hr+4);
      const d0=o.cD+(o.pr+1);
      ks.push(...nav(cur,d0),SD,SD,{key:'Delete'});  cur=o.cD+(o.pr+3);
      for(let j=0;j<o.NY;j++){ const Y=o.yc[j];
        ks.push(...nav(cur,Y+(o.hr+5)),...TT('='+Y+(o.hr+2)+'-'+Y+(o.hr+3)+'-'+Y+(o.hr+4)),EN);
        ks.push(...TT('='+Y+(o.hr+5)+'/'+Y+(o.hr+2)),EN); cur=Y+(o.hr+7); }
      const c1=o.yc[0]+(o.hr+5);
      ks.push(...nav(cur,c1),CSR,{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('p'));
      ks.push({key:'s',ctrl:true});
      return [{sel:o.yc[0]+(o.hr+2), keys:ks}]; } },

  { key:'stalelink', name:'stalelink ROUTES — Alt H J Link · Alt H E C clear · Alt H B S box · repoint by copying a healthy year · two separate fills (☆ must be DARK)',
    moves:C=>{ const o=C._o; const mv=[];
      for(let i=0;i<3;i++){ const j=o.stale[i], Lc=o.yc[j], r=o.hr+2+i;
        const good=o.yc.find(x=>x!==Lc);
        mv.push({sel:good+r, keys:[{key:'c',ctrl:true}]});
        mv.push({sel:Lc+r,   keys:[{key:'v',ctrl:true}]}); }
      mv.push({sel:o.linkRng, keys:[ALT,LL('h'),LL('j'),{key:'ArrowRight'},{key:'ArrowRight'},EN]});
      mv.push({sel:o.deadRng, keys:[ALT,LL('h'),LL('e'),LL('c')]});
      const y=o.yc[0];
      mv.push({sel:y+(o.hr+5), keys:[...TT('='+y+(o.hr+2)+'-'+y+(o.hr+3)+'-'+y+(o.hr+4)),EN]});
      mv.push({sel:y+(o.hr+6), keys:[...TT('='+y+(o.hr+5)+'/'+y+(o.hr+2)),EN]});
      mv.push({sel:o.contribRng, keys:[{key:'r',ctrl:true}]});
      mv.push({sel:o.yc[0]+(o.hr+6)+':'+o.yc[o.NY-1]+(o.hr+6), keys:[{key:'r',ctrl:true}]});
      mv.push({sel:o.contribRng, keys:[{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('s')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; } },

  { key:'stalelink', name:'stalelink TRAP — each broken line filled right from its LEFT edge (poisons the line when that edge is the stale one)',
    moves:C=>{ const o=C._o; const mv=[];
      for(let i=0;i<3;i++) mv.push({sel:o.yc[0]+(o.hr+2+i)+':'+o.yc[o.NY-1]+(o.hr+2+i), keys:[{key:'r',ctrl:true}]});
      return mv; } },

  /* ================= signerr ================= */
  { key:'signerr', name:'signerr FINAL — ☆ route, every selection and navigation KEYED',
    moves:C=>{ const o=C._o; const ks=[]; let cur=o.yc[0]+o.rCost1;
      const bc=o.yc[o.bad];
      ks.push(...nav(cur,o.helper),{key:'c',ctrl:true}); cur=o.helper;
      ks.push(...nav(cur,bc+o.rCost1),SD,SD,ALT,LL('e'),LL('s'),LL('m'),EN); cur=bc+(o.rCost1+2);
      const e1=o.yc[0]+o.rEbit;
      ks.push(...nav(cur,e1),...TT('=SUM('+o.yc[0]+o.rRev+':'+o.yc[0]+(o.rRev+3)+')'),EN); cur=o.yc[0]+(o.rEbit+1);
      ks.push(...nav(cur,e1),CSR,{key:'r',ctrl:true},{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('p'));
      cur=o.yc[o.NY-1]+o.rEbit;
      const m1=o.yc[0]+o.rMg;
      ks.push(...nav(cur,m1),...TT('='+o.yc[0]+o.rEbit+'/'+o.yc[0]+o.rRev),EN); cur=o.yc[0]+(o.rMg+1);
      ks.push(...nav(cur,m1),SR,SR,SR,SR,{key:'r',ctrl:true},{key:'1',ctrl:true},LL('p'));
      ks.push({key:'s',ctrl:true});
      return [{sel:o.yc[0]+o.rCost1, keys:ks}]; } },

  { key:'signerr', name:'signerr FINAL — NEGATIVE CONTROL, keyed: three figures retyped, EBIT and margin typed year by year, ☆ dark',
    moves:C=>{ const o=C._o; const ks=[]; let cur=o.yc[0]+o.rCost1;
      const bc=o.yc[o.bad];
      for(let i=0;i<3;i++){ const cell=bc+(o.rCost1+i);
        ks.push(...nav(cur,cell),...TT(String(o.cost[o.bad][i])),EN); cur=bc+(o.rCost1+i+1); }
      for(let j=0;j<o.NY;j++){ const Y=o.yc[j];
        ks.push(...nav(cur,Y+o.rEbit),...TT('=SUM('+Y+o.rRev+':'+Y+(o.rRev+3)+')'),EN); cur=Y+(o.rEbit+1); }
      const e1=o.yc[0]+o.rEbit;
      ks.push(...nav(cur,e1),CSR,{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('p')); cur=o.yc[o.NY-1]+o.rEbit;
      for(let j=0;j<o.NY;j++){ const Y=o.yc[j];
        ks.push(...nav(cur,Y+o.rMg),...TT('='+Y+o.rEbit+'/'+Y+o.rRev),EN); cur=Y+(o.rMg+1); }
      const m1=o.yc[0]+o.rMg;
      ks.push(...nav(cur,m1),SR,SR,SR,SR,ALT,LL('h'),LL('p'),ALT,LL('h'),{key:'0',code:'Digit0'});
      ks.push({key:'s',ctrl:true});
      return [{sel:o.yc[0]+o.rCost1, keys:ks}]; } },

  { key:'signerr', name:'signerr ROUTES — accounting parens for the flips · Alt H V S Multiply · addition-chain EBIT · Alt H P + Alt H 0 percent · Alt H B D border (☆ dark on the paren route)',
    moves:C=>{ const o=C._o; const mv=[]; const bc=o.yc[o.bad];
      for(let i=0;i<3;i++) mv.push({sel:bc+(o.rCost1+i), keys:[...TT('('+Math.abs(o.cost[o.bad][i])+')'),EN]});
      for(let j=0;j<o.NY;j++){ const Y=o.yc[j];
        mv.push({sel:Y+o.rEbit, keys:[...TT('='+Y+o.rRev+'+'+Y+o.rCost1+'+'+Y+(o.rCost1+1)+'+'+Y+(o.rCost1+2)),EN]}); }
      mv.push({sel:o.ebitRng, keys:[{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('d')]});
      mv.push({sel:o.yc[0]+o.rMg, keys:[...TT('='+o.yc[0]+o.rEbit+'/'+o.yc[0]+o.rRev),EN]});
      mv.push({sel:o.mgRng, keys:[ALT,LL('h'),LL('f'),LL('i'),LL('r')]});
      mv.push({sel:o.mgRng, keys:[ALT,LL('h'),LL('p'),ALT,LL('h'),{key:'0',code:'Digit0'}]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; } },

  { key:'signerr', name:'signerr TRAP — the fxconvert-fluent move: helper multiplied over the WHOLE cost block (meter must read 0/3)',
    moves:C=>{ const o=C._o; return [
      {sel:o.helper, keys:[{key:'c',ctrl:true}]},
      {sel:o.costRng, keys:[ALT,LL('e'),LL('s'),LL('m'),EN]},
    ]; } },

  /* ================= versionup ================= */
  { key:'versionup', name:'versionup FINAL — ☆ route, every selection and navigation KEYED',
    moves:C=>{ const o=C._o; const ks=[]; let cur=o.yc[0]+o.rRev;
      const g='$'+o.cV+'$'+(o.pr+1);
      ks.push(...nav(cur,o.yc[1]+o.rRev),...TT('='+o.yc[0]+o.rRev+'*(1+'+g+')'),EN); cur=o.yc[1]+(o.rRev+1);
      ks.push(...nav(cur,o.yc[1]+o.rRev),CSR,{key:'r',ctrl:true}); cur=o.yc[o.NY-1]+o.rRev;
      for(let i=0;i<2;i++){ const r=o.ratioRows[i], ref='$'+o.cV+'$'+(o.pr+2+i);
        ks.push(...nav(cur,o.yc[0]+r),...TT('=-'+o.yc[0]+o.rRev+'*'+ref),EN); cur=o.yc[0]+(r+1);
        ks.push(...nav(cur,o.yc[0]+r),CSR,{key:'r',ctrl:true}); cur=o.yc[o.NY-1]+r; }
      const p0=o.cV+(o.pr+1);
      ks.push(...nav(cur,p0),SD,SD,ALT,LL('h'),LL('j'),{key:'ArrowRight'},EN); cur=o.cV+(o.pr+3);
      ks.push(...nav(cur,o.cL+'1'),{key:'h',ctrl:true,code:'KeyH'},{key:'v'},{key:'1'},{key:'Tab'},{key:'v'},{key:'2'},EN);
      cur=o.cL+'1';
      ks.push(...nav(cur,o.yc[0]+o.rEb),CSR,{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('p'));
      ks.push({key:'s',ctrl:true});
      return [{sel:o.yc[0]+o.rRev, keys:ks}]; } },

  { key:'versionup', name:'versionup FINAL — NEGATIVE CONTROL, keyed: the three version tags retyped instead of one pass, ☆ dark',
    moves:C=>{ const o=C._o; const ks=[]; let cur=o.yc[0]+o.rRev;
      const g='$'+o.cV+'$'+(o.pr+1);
      ks.push(...nav(cur,o.yc[1]+o.rRev),...TT('='+o.yc[0]+o.rRev+'*(1+'+g+')'),EN); cur=o.yc[1]+(o.rRev+1);
      ks.push(...nav(cur,o.yc[1]+o.rRev),CSR,{key:'r',ctrl:true}); cur=o.yc[o.NY-1]+o.rRev;
      for(let i=0;i<2;i++){ const r=o.ratioRows[i], ref='$'+o.cV+'$'+(o.pr+2+i);
        ks.push(...nav(cur,o.yc[0]+r),...TT('=-'+o.yc[0]+o.rRev+'*'+ref),EN); cur=o.yc[0]+(r+1);
        ks.push(...nav(cur,o.yc[0]+r),CSR,{key:'r',ctrl:true}); cur=o.yc[o.NY-1]+r; }
      const p0=o.cV+(o.pr+1);
      ks.push(...nav(cur,p0),SD,SD,ALT,LL('h'),LL('j'),{key:'ArrowRight'},EN); cur=o.cV+(o.pr+3);
      const t=(S,cell)=>{ ks.push(...nav(cur,cell),...TT(S),EN); cur=CN(cell)+(RN(cell)+1); };
      t(String(S.cells[o.cL+'1'].value).replace('v1','v2'), o.cL+'1');
      t('Tag: v2 — supersede on roll-forward', o.cL+(o.hr+8));
      t('Footnotes cite the v2 basis', o.cL+(o.hr+9));
      ks.push(...nav(cur,o.yc[0]+o.rEb),CSR,{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('p'));
      ks.push({key:'s',ctrl:true});
      return [{sel:o.yc[0]+o.rRev, keys:ks}]; } },

  { key:'versionup', name:'versionup ROUTES — Alt H F C Blue swatch · every year typed with no fill anywhere · Alt H B D border',
    moves:C=>{ const o=C._o; const mv=[]; const g='$'+o.cV+'$'+(o.pr+1);
      for(let j=1;j<o.NY;j++) mv.push({sel:o.yc[j]+o.rRev, keys:[...TT('='+o.yc[j-1]+o.rRev+'*(1+'+g+')'),EN]});
      for(let i=0;i<2;i++){ const r=o.ratioRows[i], ref='$'+o.cV+'$'+(o.pr+2+i);
        for(let j=0;j<o.NY;j++) mv.push({sel:o.yc[j]+r, keys:[...TT('=-'+o.yc[j]+o.rRev+'*'+ref),EN]}); }
      mv.push({sel:o.panelRng, keys:[ALT,LL('h'),LL('f'),LL('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},EN]});
      mv.push({sel:o.cL+'1', keys:[{key:'h',ctrl:true,code:'KeyH'},{key:'v'},{key:'1'},{key:'Tab'},{key:'v'},{key:'2'},EN]});
      mv.push({sel:o.ebitRng, keys:[{key:'b',ctrl:true},ALT,LL('h'),LL('b'),LL('d')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; } },

  { key:'versionup', name:'versionup TRAP — the panel reference left UNANCHORED and filled right (beats must stay DARK)',
    moves:C=>{ const o=C._o; const mv=[]; const g=o.cV+(o.pr+1);
      mv.push({sel:o.yc[1]+o.rRev, keys:[...TT('='+o.yc[0]+o.rRev+'*(1+'+g+')'),EN]});
      mv.push({sel:o.revRng, keys:[{key:'r',ctrl:true}]});
      return mv; } },
  ];
})()
