/* page-side probe source — the SHIPPED boards, part-1 spread. Every selection and navigation KEYED:
   setDemoSel is used only to park the cursor on the drill's own opening cell. */
(function(){
  const CN = s => s.replace(/[0-9]/g,'');
  const RN = s => +s.replace(/[^0-9]/g,'');
  const ci = L => { let n=0; for(const ch of L) n=n*26+(ch.charCodeAt(0)-64); return n; };
  // walk from cell a to cell b with plain arrows
  function nav(a,b){ const k=[];
    const ar=RN(a), ac=ci(CN(a)), br=RN(b), bc=ci(CN(b));
    for(let i=0;i<Math.abs(br-ar);i++) k.push({key: br>ar?'ArrowDown':'ArrowUp'});
    for(let i=0;i<Math.abs(bc-ac);i++) k.push({key: bc>ac?'ArrowRight':'ArrowLeft'});
    return k; }
  const TT = s => [...s].map(ch=>({key:ch}));
  const EN = {key:'Enter'};
  const LL = ch => ({key:ch.toLowerCase(), code:'Key'+ch.toUpperCase()});

  return [
  /* ---------------- stalelink (shipped) ---------------- */
  { key:'stalelink', name:'stalelink SHIPPED — fastest legal: F2 caret surgery on each stale ref',
    moves:C=>{ const st=C._stale; let cur='B11'; const ks=[];
      st.forEach(cell=>{ ks.push(...nav(cur,cell)); cur=cell;
        ks.push({key:'F2'},{key:'Home'},{key:'ArrowRight'},{key:'Delete'},{key:'B'},EN);
        // Enter moves down one row
        cur = CN(cell)+(RN(cell)+1); });
      return [{sel:'B11', keys:ks}]; } },
  { key:'stalelink', name:'stalelink SHIPPED — slow-but-sane: each stale formula retyped in full',
    moves:C=>{ const st=C._stale; let cur='B11'; const ks=[];
      st.forEach(cell=>{ const Lc=CN(cell), r=RN(cell);
        const src = r===11?'$B$4':(r===12?'$B$5':'$B$6');
        const dep = r===11?(Lc+'10'):(Lc+'11');
        ks.push(...nav(cur,cell)); ks.push(...TT('='+src+'*'+dep), EN);
        cur = Lc+(r+1); });
      return [{sel:'B11', keys:ks}]; } },
  { key:'stalelink', name:'stalelink SHIPPED — slowest legal: every cell of all three lines retyped',
    moves:C=>{ const ks=[]; let cur='B11';
      for(const r of [11,12,13]) for(const Lc of ['B','C','D','E','F']){
        const src = r===11?'$B$4':(r===12?'$B$5':'$B$6');
        const dep = r===11?(Lc+'10'):(Lc+'11');
        const cell=Lc+r; ks.push(...nav(cur,cell)); ks.push(...TT('='+src+'*'+dep), EN); cur=Lc+(r+1); }
      return [{sel:'B11', keys:ks}]; } },

  /* ---------------- signerr (shipped) ---------------- */
  { key:'signerr', name:'signerr SHIPPED — fastest legal: three flips typed, margin one formula + fill',
    moves:C=>{ const ks=[]; let cur='B5';
      C._flips.forEach(cell=>{ ks.push(...nav(cur,cell)); ks.push(...TT(String(-Math.abs(C._mag[cell]))),EN);
        cur = CN(cell)+(RN(cell)+1); });
      ks.push(...nav(cur,'B10'), ...TT('=B8/B4'), EN);
      // Enter leaves B11; walk back up and grab B10:F10 with the chord, fill right, percent
      ks.push({key:'ArrowUp'},{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true},{key:'%',ctrl:true,shift:true});
      return [{sel:'B5', keys:ks}]; } },
  { key:'signerr', name:'signerr SHIPPED — slowest legal: flips typed, five margin formulas typed, ribbon percent',
    moves:C=>{ const ks=[]; let cur='B5';
      C._flips.forEach(cell=>{ ks.push(...nav(cur,cell)); ks.push(...TT(String(-Math.abs(C._mag[cell]))),EN);
        cur = CN(cell)+(RN(cell)+1); });
      for(const Lc of ['B','C','D','E','F']){ const cell=Lc+'10';
        ks.push(...nav(cur,cell)); ks.push(...TT('='+Lc+'8/'+Lc+'4'), EN); cur=Lc+'11'; }
      ks.push(...nav(cur,'B10'),{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},
             {key:'Alt'},LL('h'),LL('p'));
      return [{sel:'B5', keys:ks}]; } },

  /* ---------------- versionup (shipped) ---------------- */
  { key:'versionup', name:'versionup SHIPPED — fastest legal: one formula per row + fill, ctrl+h stamp',
    moves:C=>{ const ks=[]; let cur='C5';
      ks.push(...TT('=C4/B4-1'),EN);                                   // commits, moves to C6
      ks.push(...nav('C6','C5'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      // selection is C5:F5, active F5
      ks.push(...nav('F5','B7'),...TT('=B4+B6'),EN);
      ks.push(...nav('B8','B7'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...nav('F7','B9'),...TT('=B7+B8'),EN);
      ks.push(...nav('B10','B9'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...nav('F9','B10'),...TT('=B9/B4'),EN);
      ks.push(...nav('B11','B10'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push({key:'h',ctrl:true,code:'KeyH'},{key:'v'},{key:'1'},{key:'Tab'},{key:'v'},{key:'2'},EN);
      return [{sel:'C5', keys:ks}]; } },
  { key:'versionup', name:'versionup SHIPPED — slowest legal: every derived cell typed, both tag lines retyped',
    moves:C=>{ const ks=[]; let cur='C5';
      for(const Lc of ['C','D','E','F']){ const p=String.fromCharCode(Lc.charCodeAt(0)-1);
        ks.push(...nav(cur,Lc+'5'),...TT('='+Lc+'4/'+p+'4-1'),EN); cur=Lc+'6'; }
      for(const Lc of ['B','C','D','E','F']){ ks.push(...nav(cur,Lc+'7'),...TT('='+Lc+'4+'+Lc+'6'),EN); cur=Lc+'8'; }
      for(const Lc of ['B','C','D','E','F']){ ks.push(...nav(cur,Lc+'9'),...TT('='+Lc+'7+'+Lc+'8'),EN); cur=Lc+'10'; }
      for(const Lc of ['B','C','D','E','F']){ ks.push(...nav(cur,Lc+'10'),...TT('='+Lc+'9/'+Lc+'4'),EN); cur=Lc+'11'; }
      ks.push(...nav(cur,'A12'),...TT('Tag: v2 — supersede on roll-forward'),EN);
      ks.push(...TT('Footnotes cite the v2 basis'),EN);
      return [{sel:'C5', keys:ks}]; } },
  ];
})()
