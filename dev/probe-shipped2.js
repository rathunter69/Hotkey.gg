/* part-1/part-2 probes, round 2 — Ctrl+Home used to re-park deterministically (1 real key). */
(function(){
  const CN = s => s.replace(/[0-9]/g,'');
  const RN = s => +s.replace(/[^0-9]/g,'');
  const ci = L => { let n=0; for(const ch of L) n=n*26+(ch.charCodeAt(0)-64); return n; };
  function nav(a,b){ const k=[];
    const ar=RN(a), ac=ci(CN(a)), br=RN(b), bc=ci(CN(b));
    for(let i=0;i<Math.abs(br-ar);i++) k.push({key: br>ar?'ArrowDown':'ArrowUp'});
    for(let i=0;i<Math.abs(bc-ac);i++) k.push({key: bc>ac?'ArrowRight':'ArrowLeft'});
    return k; }
  const HOME = {key:'Home',ctrl:true};
  const TT = s => [...s].map(ch=>({key:ch}));
  const EN = {key:'Enter'};
  const LL = ch => ({key:ch.toLowerCase(), code:'Key'+ch.toUpperCase()});
  const goto_ = t => [HOME].concat(nav('A1',t));

  return [
  { key:'versionup', name:'versionup SHIPPED — fastest legal (re-parked): one formula per row + fill, ctrl+h stamp',
    moves:C=>{ const ks=[];
      ks.push(...goto_('C5'),...TT('=C4/B4-1'),EN);
      ks.push(...goto_('C5'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...goto_('B7'),...TT('=B4+B6'),EN);
      ks.push(...goto_('B7'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...goto_('B9'),...TT('=B7+B8'),EN);
      ks.push(...goto_('B9'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...goto_('B10'),...TT('=B9/B4'),EN);
      ks.push(...goto_('B10'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(HOME,{key:'h',ctrl:true,code:'KeyH'},{key:'v'},{key:'1'},{key:'Tab'},{key:'v'},{key:'2'},EN);
      return [{sel:'C5', keys:ks}]; } },

  { key:'versionup', name:'versionup SHIPPED — ctrl+h HALF only: the two tag lines retyped instead',
    moves:C=>{ const ks=[];
      ks.push(...goto_('C5'),...TT('=C4/B4-1'),EN);
      ks.push(...goto_('C5'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...goto_('B7'),...TT('=B4+B6'),EN);
      ks.push(...goto_('B7'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...goto_('B9'),...TT('=B7+B8'),EN);
      ks.push(...goto_('B9'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...goto_('B10'),...TT('=B9/B4'),EN);
      ks.push(...goto_('B10'),{key:'ArrowRight',ctrl:true,shift:true},{key:'r',ctrl:true});
      ks.push(...goto_('A12'),...TT('Tag: v2 — supersede on roll-forward'),EN);
      ks.push(...TT('Footnotes cite the v2 basis'),EN);
      return [{sel:'C5', keys:ks}]; } },

  /* stalelink ☆ CANDIDATE — each broken cell restored from a healthy sibling in its own row */
  { key:'stalelink', name:'stalelink SHIPPED — ☆ candidate: each break restored by copying a healthy year in the same line',
    moves:C=>{ const st=C._stale; const ks=[];
      st.forEach(cell=>{ const Lc=CN(cell), r=RN(cell);
        // pick a healthy column in this row: first of B..F that is not the stale one
        const good = ['B','C','D','E','F'].find(x=>x!==Lc);
        ks.push(...goto_(good+r),{key:'c',ctrl:true});
        ks.push(...goto_(Lc+r),{key:'v',ctrl:true}); });
      return [{sel:'B11', keys:ks}]; } },
  ];
})()
