// Backup único do app inteiro: um arquivo com TUDO que o app guarda no
// aparelho (progresso de verbos e adjetivos, histórico das estatísticas,
// estatística da Escrita, decks em andamento, recorde do jogo, preferências).
// Importar substitui tudo e recarrega a página.
// Também aceita os backups antigos de um modo só ({app:"verbos", progress}).
const Backup = (()=>{
  const PREFIXES = ["jp-", "jpverbs-", "jpadj-"]; // todas as chaves do app começam assim
  const OLD = { // backups antigos, um por modo
    verbos: {key: "jpverbs-progress-v2", seed: "jpverbs-seeded-v3", app: "v", name: "verbos"},
    adjetivos: {key: "jpadj-progress-v1", seed: "jpadj-seeded-v1", app: "a", name: "adjetivos"},
  };
  const own = (k)=> PREFIXES.some((p)=> k.startsWith(p));
  const ownKeys = ()=> Object.keys(localStorage).filter(own);
  const isObj = (o)=> typeof o === "object" && o !== null && !Array.isArray(o);

  function exportAll(){
    try{
      const data = {};
      ownKeys().forEach((k)=>{ data[k] = localStorage.getItem(k); });
      const d = new Date(), pad = (n)=> String(n).padStart(2, "0");
      const json = JSON.stringify({app: "japones-srs", version: 1, exported: d.toISOString(), data}, null, 1);
      const url = URL.createObjectURL(new Blob([json], {type: "application/json"}));
      const a = document.createElement("a");
      a.href = url; a.download = `japones-srs-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=> URL.revokeObjectURL(url), 1000);
    }catch(e){ alert("Não foi possível exportar o backup."); }
  }

  function apply(text){
    let data;
    try{ data = JSON.parse(text); }catch(e){ alert("Arquivo inválido."); return; }
    if(isObj(data) && data.app === "japones-srs" && isObj(data.data)){
      const keys = Object.keys(data.data).filter((k)=> own(k) && typeof data.data[k] === "string");
      if(!keys.length){ alert("Esse backup está vazio."); return; }
      const when = data.exported ? new Date(data.exported).toLocaleDateString("pt-BR") : "?";
      if(!confirm(`Substituir TODO o progresso deste aparelho pelo backup de ${when}?\n(verbos, adjetivos, estatísticas e preferências)`)) return;
      ownKeys().forEach((k)=> localStorage.removeItem(k));
      keys.forEach((k)=> localStorage.setItem(k, data.data[k]));
    } else {
      // Backup antigo: só o progresso de um modo (sem "app" = verbos, o formato mais antigo).
      const o = isObj(data) && data.app ? OLD[data.app] : OLD.verbos;
      const progress = isObj(data) && data.app ? data.progress : data;
      const valid = o && isObj(progress) && Object.entries(progress).every(([k, e])=> /^\d+$/.test(k) && isObj(e) && typeof e.level === "number");
      if(!valid){ alert("Arquivo inválido: não é um backup deste app."); return; }
      if(!confirm(`Esse é um backup antigo, só de ${o.name}.\nSubstituir o progresso de ${o.name} por ele? (o resto continua como está)`)) return;
      localStorage.setItem(o.key, JSON.stringify(progress));
      localStorage.setItem(o.seed, "1");
      localStorage.removeItem(o.key.split("-")[0] + "-deck");
      if(typeof Historico !== "undefined") Historico.sync(o.app, progress, true);
    }
    alert("Backup importado! O app vai recarregar.");
    location.reload();
  }
  function importFile(file){
    if(!file) return;
    const r = new FileReader();
    r.onload = ()=> apply(r.result);
    r.readAsText(file);
  }
  // Botões prontos (+ input escondido); cls = classe dos botões na página.
  let n = 0;
  function buttonsHtml(cls){
    const id = "backupFile" + (++n);
    return `<button type="button" class="${cls}" onclick="Backup.exportAll()">⬇ Exportar backup (tudo)</button>
      <button type="button" class="${cls}" onclick="document.getElementById('${id}').click()">⬆ Importar backup</button>
      <input type="file" id="${id}" accept="application/json,.json" style="display:none" onchange="Backup.importFile(this.files[0]); this.value=''">`;
  }
  return {exportAll, importFile, apply, buttonsHtml};
})();
