/* ☆ HEADROOM IN ISOLATION — the r438 `series` rule. Each pair differs in exactly ONE segment;
   that segment is fully keyed (its selection walked with shift-arrows), everything else is
   identical and parked with setDemoSel, so the delta is the star's own scope and nothing else. */
(function(){
  const TT = s => [...s].map(ch=>({key:ch}));
  const EN = {key:'Enter'};
  const LL = ch => ({key:ch.toLowerCase(), code:'Key'+ch.toUpperCase()});
  const ALT = {key:'Alt'};
  const SD = {key:'ArrowDown',shift:true};
  const SR = {key:'ArrowRight',shift:true};

  return [
  /* ---- stalelink ☆: the contribution block, one fill vs ten typed formulas ---- */
  { key:'stalelink', name:'stalelink ☆ SCOPE — block seeded once and carried in ONE fill',
    moves:C=>{ const o=C._o, y=o.yc[0];
      return [
        {sel:y+(o.hr+5), keys:[...TT('='+y+(o.hr+2)+'-'+y+(o.hr+3)+'-'+y+(o.hr+4)),EN,
                               ...TT('='+y+(o.hr+5)+'/'+y+(o.hr+2)),EN,
                               {key:'ArrowUp'},SD,SR,SR,SR,SR,{key:'r',ctrl:true}]},
      ]; } },
  { key:'stalelink', name:'stalelink ☆ SCOPE — the same block typed year by year (star dark)',
    moves:C=>{ const o=C._o; const ks=[];
      for(let j=0;j<o.NY;j++){ const Y=o.yc[j];
        ks.push(...TT('='+Y+(o.hr+2)+'-'+Y+(o.hr+3)+'-'+Y+(o.hr+4)),EN);
        ks.push(...TT('='+Y+(o.hr+5)+'/'+Y+(o.hr+2)),EN);
        if(j<o.NY-1) ks.push({key:'ArrowUp'},{key:'ArrowRight'}); }
      return [{sel:o.yc[0]+(o.hr+5), keys:ks}]; } },

  /* ---- signerr ☆: the broken year, one arithmetic pass vs three retypes ---- */
  { key:'signerr', name:'signerr ☆ SCOPE — helper copied once, ONE multiply pass over the broken year',
    moves:C=>{ const o=C._o, bc=o.yc[o.bad];
      return [
        {sel:o.helper, keys:[{key:'c',ctrl:true}]},
        {sel:bc+o.rCost1, keys:[SD,SD,ALT,LL('e'),LL('s'),LL('m'),EN]},
      ]; } },
  { key:'signerr', name:'signerr ☆ SCOPE — the same three figures retyped (star dark)',
    moves:C=>{ const o=C._o, bc=o.yc[o.bad]; const ks=[];
      for(let i=0;i<3;i++) ks.push(...TT(String(o.cost[o.bad][i])),EN);
      return [{sel:bc+o.rCost1, keys:ks}]; } },

  /* ---- versionup ☆: the version stamp, one find-and-replace vs three retyped lines ---- */
  { key:'versionup', name:'versionup ☆ SCOPE — every tag renamed in ONE find-and-replace pass',
    moves:C=>{ const o=C._o;
      return [{sel:o.cL+'1', keys:[{key:'h',ctrl:true,code:'KeyH'},{key:'v'},{key:'1'},{key:'Tab'},{key:'v'},{key:'2'},EN]}]; } },
  { key:'versionup', name:'versionup ☆ SCOPE — the same three tags retyped (star dark)',
    moves:C=>{ const o=C._o;
      return [
        {sel:o.cL+'1',      keys:[...TT(String(S.cells[o.cL+'1'].value).replace('v1','v2')),EN]},
        {sel:o.cL+(o.hr+8), keys:[...TT('Tag: v2 — supersede on roll-forward'),EN]},
        {sel:o.cL+(o.hr+9), keys:[...TT('Footnotes cite the v2 basis'),EN]},
      ]; } },
  ];
})()
