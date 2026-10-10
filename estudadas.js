// Palavras que a pessoa já estuda nos apps de verbos e adjetivos: nível 2+
// (Praticando ou Aprendido). O Jogo de Pares e o Desenhar só LEEM o progresso
// e ficam bloqueados até existirem MIN palavras.
const Estudadas = (()=>{
  const MIN = 3;
  const KEYS = {v: "jpverbs-progress-v2", a: "jpadj-progress-v1"}; // mesmas chaves dos apps
  const isStudied = (e)=> !!e && e.level >= 2;
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)) || {}; }catch(e){ return {}; } }

  // Só conta (não precisa dos dados das palavras): usado na tela inicial.
  function count(){
    return Object.values(load(KEYS.v)).filter(isStudied).length + Object.values(load(KEYS.a)).filter(isStudied).length;
  }
  // Lista completa; precisa de VERBS_RAW e ADJ_RAW carregados.
  function words(){
    const pv = load(KEYS.v), pa = load(KEYS.a);
    return [
      ...VERBS_RAW.map((w, i)=> ({...w, key: "v" + i, src: "verbos"})).filter((w, i)=> isStudied(pv[i])),
      ...ADJ_RAW.map((w, i)=> ({...w, key: "a" + i, src: "adjetivos"})).filter((w, i)=> isStudied(pa[i])),
    ];
  }
  // Tela de bloqueio padrão (classes .panel/.cta/.ghost de cada página).
  function lockedHtml(emoji, title, have){
    return `<div class="panel">
      <div class="big-emoji">🔒</div>
      <h2>${emoji} ${title}</h2>
      <p>Libera quando você tiver pelo menos <strong>${MIN} palavras</strong> em <strong>Praticando</strong> ou <strong>Aprendido</strong> (verbos e adjetivos somados).</p>
      <p class="pool">Você tem <b>${have}</b> de <b>${MIN}</b>.</p>
      <p>Estude nos Cards: cada palavra entra em Praticando depois de 2 acertos em dias diferentes, ou na hora com <strong>✓ Já sei essa</strong>.</p>
      <div style="height:14px"></div>
      <a class="cta" style="text-decoration:none;text-align:center" href="../index.html?home">Ir estudar</a>
    </div>`;
  }
  return {MIN, count, words, lockedHtml};
})();
