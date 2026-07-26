/* run each drill's own demo and report per-check state */
(function(){
  return ['stalelink','signerr','versionup'].map(k=>({
    key:k, name:k+' — own demo',
    moves:C=>((typeof C.demo==='function')?C.demo.call(C):C.demo)
  }));
})()
