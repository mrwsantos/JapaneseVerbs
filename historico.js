// Histórico para a página de Estatísticas (verbos e adjetivos).
// O progresso dos apps só guarda o nível atual de cada palavra; aqui fica
// QUANDO cada palavra começou / entrou em Praticando / ficou Aprendida, e
// quantas respostas (certas e erradas) houve por dia em cada modo.
//
//   Historico.log(app, mode, id, ok)   app "v"|"a", mode "cards"|"frases"|"escrita"
//   Historico.sync(app, progress, old) chamado a cada saveProgress; old=true
//                                      (importar backup) marca as mudanças como
//                                      "antes do histórico" em vez de hoje.
//
// Formato em localStorage (KEY):
//   {start: dia, init: {v: true}, days: {dia: {v: {cards: [certas, total], ...}}},
//    words: {"v12": {s: dia, p: dia, a: dia, ok: n, err: n}}}
// dia = dias desde 1970 (igual ao today() dos apps); -1 = já estava assim
// antes do histórico existir (não conta como "essa semana").
const Historico = (()=>{
  const KEY = "jp-historico-v1";
  const today = ()=> Math.floor(Date.now()/86400000);
  // Mesmas regras do getStatus de cada app.
  function status(app, e){
    if(!e || !(e.level >= 2)) return 'novo';
    if(e.level < 4 || (app==='v' && (e.fraseHits||0) < 2)) return 'praticando';
    return 'aprendido';
  }
  const started = (e)=> !!e && (e.level >= 1 || e.due > 0);
  function load(){
    try{
      const h = JSON.parse(localStorage.getItem(KEY));
      if(h && h.days && h.words) return h;
    }catch(e){}
    return {start: today(), init: {}, days: {}, words: {}};
  }
  function save(h){ try{ localStorage.setItem(KEY, JSON.stringify(h)); }catch(e){} }

  function syncInto(h, app, progress, old){
    const first = !h.init[app];
    const d = (old || first) ? -1 : today();
    for(const [id, e] of Object.entries(progress || {})){
      const k = app + id;
      const w = h.words[k] || {};
      if(!e || (e.level===0 && !(e.due > 0))){ // zerado: começa de novo
        delete w.s; delete w.p; delete w.a;
      } else {
        const st = status(app, e);
        if(w.s===undefined && started(e)) w.s = d;
        if(w.p===undefined && st!=='novo') w.p = d;
        if(w.a===undefined && st==='aprendido') w.a = d;
      }
      if(Object.keys(w).length) h.words[k] = w; else delete h.words[k];
    }
    // Palavras que sumiram do progresso (zerar tudo / importar outro backup).
    for(const k of Object.keys(h.words)){
      if(k[0]===app && !(progress && progress[k.slice(1)])){ const w = h.words[k]; delete w.s; delete w.p; delete w.a; }
    }
    h.init[app] = true;
  }
  function sync(app, progress, old){
    const h = load(); syncInto(h, app, progress, old); save(h);
  }
  function log(app, mode, id, ok){
    const h = load(), t = today();
    const day = h.days[t] = h.days[t] || {};
    const a = day[app] = day[app] || {};
    const m = a[mode] = a[mode] || [0, 0];
    if(ok) m[0]++;
    m[1]++;
    const w = h.words[app + id] = h.words[app + id] || {};
    if(ok) w.ok = (w.ok||0) + 1; else w.err = (w.err||0) + 1;
    save(h);
  }
  return {KEY, status, load, sync, syncInto, log, today};
})();
