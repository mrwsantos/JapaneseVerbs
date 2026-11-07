// Modo Ouvir (verbos e adjetivos): o app fala a palavra e você escolhe o
// significado entre 4 opções ou escreve o que ouviu. Decks de 10; errou, a
// palavra volta no fim do deck. Treino livre: NÃO mexe no nível das palavras,
// só conta nas Estatísticas. Fala o kana (o kanji pode ser lido errado pela voz).
// Adaptador (Ouvir.setup): app "v"|"a", words, pool() palavras estudadas,
// studied(w), conjugate(v), render(), next(), requeue(v), restart().
const Ouvir = (()=>{
  const DECK = 10;
  const INPUT_KEY = "jp-ouvir-input";
  let input = "opcoes";
  try{ input = localStorage.getItem(INPUT_KEY)==="digitar" ? "digitar" : "opcoes"; }catch(e){}
  let A = null, q = null, seen = new Map();

  const CSS = `
.ov-card{gap:10px;align-items:center;text-align:center}
.ov-play{display:flex;align-items:center;justify-content:center;width:84px;height:84px;margin:6px auto 2px;border:none;border-radius:50%;background:var(--accent);color:#fff;font-size:34px;cursor:pointer;box-shadow:var(--shadow)}
.ov-slow{padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:var(--chip);color:var(--text);font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.ov-q{font-size:13px;color:var(--sub)}
.ov-word-row{display:flex;align-items:center;justify-content:center;gap:8px}
.ov-word{padding:0;font-size:30px;font-weight:700}
.ov-kana{font-size:16px;color:var(--sub)}
.ov-opts .fq-opt{font-size:14px;line-height:1.3;padding:16px 10px}`;
  function css(){
    if(document.getElementById("ouvirCss")) return;
    const st = document.createElement("style"); st.id = "ouvirCss"; st.textContent = CSS; document.head.appendChild(st);
  }

  const shuffle = (a)=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const senses = (w)=> w.meaning.toLowerCase().split("/").map((s)=> s.replace(/\(.*?\)/g, "").trim()).filter(Boolean);
  const esc = (s)=> String(s).replace(/[<>&]/g, "");

  function deck(){
    q = null; seen = new Map();
    return shuffle(A.pool().slice()).slice(0, DECK);
  }
  function make(v){
    const vs = senses(v);
    // Mesmo som (易しい/優しい) ou sentido em comum não servem de opção errada.
    const others = shuffle(A.words.filter((w)=> w!==v && w.kana!==v.kana && !senses(w).some((s)=> vs.includes(s))))
      .sort((a, b)=> (A.studied(b) ? 1 : 0) - (A.studied(a) ? 1 : 0));
    const opts = [{v, ok: true}];
    for(const w of others){
      if(opts.length>=4) break;
      if(!opts.some((o)=> o.v.meaning===w.meaning)) opts.push({v: w, ok: false});
    }
    q = {v, opts: shuffle(opts), chosen: -1, typed: "", done: false, ok: false, spoken: false, conjOpen: false};
  }
  function play(rate){ if(q) TTS.speak(q.v.kana, rate); }
  function finish(ok){
    q.done = true; q.ok = ok;
    const r = seen.get(q.v) || {v: q.v, errs: 0};
    if(!ok) r.errs++;
    seen.set(q.v, r);
    Historico.log(A.app, "ouvir", q.v.id, ok);
    Sons.play("cards", ok ? "acerto" : "erro");
    if(!ok) A.requeue(q.v);
    A.render();
  }
  function choose(i){ if(q && !q.done){ q.chosen = i; finish(q.opts[i].ok); } }
  function check(giveUp){
    if(!q || q.done) return;
    const el = document.getElementById("ovInput");
    const typed = giveUp || !el ? "" : Romaji.toKana(el.value, true).trim();
    q.typed = typed;
    const v = q.v;
    finish(!!typed && (katakanaToHiragana(typed)===v.kana || typed===v.kanji));
  }
  function toggleConj(){ if(q){ q.conjOpen = !q.conjOpen; A.render(); } }
  function next(){ q = null; A.next(); }
  function reset(){ q = null; }

  function html(v){
    css();
    if(!q || q.v!==v) make(v);
    let h = `<div class="card nohand ov-card">`;
    if(!q.done){
      h += `<div class="ov-q">${input==="opcoes" ? "O que significa o que você ouviu?" : "Escreva o que você ouviu."}</div>
        <button type="button" class="ov-play" onclick="Ouvir.play()" aria-label="Ouvir de novo">🔊</button>
        <button type="button" class="ov-slow" onclick="Ouvir.play(0.55)">🐢 Mais devagar</button>`;
    } else {
      h += `<div class="fq-result"><span class="${q.ok?'result-ok':'result-no'}">${q.ok ? '✓ Certo!' : '✗ Não foi dessa vez'}</span></div>
        <div class="ov-word-row"><button type="button" class="ov-word kanji-toggle" lang="ja" aria-expanded="${q.conjOpen}" aria-controls="ovConj" onclick="Ouvir.toggleConj()">${v.kanji}</button>${TTS.btnHtml(v.kana)}</div>
        ${v.kanji!==v.kana ? `<div class="ov-kana" lang="ja">${v.kana}</div>` : ""}
        <div class="romaji">${v.romaji}</div><div class="meaning">${v.meaning}</div>
        ${!q.ok ? `<div class="es-hint">Ela volta no fim do deck.</div>` : ""}
        ${q.conjOpen ? `<div class="conj" id="ovConj">${conjRowsHtml(A.conjugate(v))}</div>` : ""}`;
    }
    h += `</div>`;
    if(input==="opcoes"){
      h += `<div class="fq-opts ov-opts">${q.opts.map((o, i)=>{
        const cls = !q.done ? "" : o.ok ? "ok" : i===q.chosen ? "no" : "dim";
        return `<button type="button" class="fq-opt ${cls}" onclick="Ouvir.choose(${i})" ${q.done?'disabled':''}><span class="fq-n" aria-hidden="true">${i+1}</span>${o.v.meaning}</button>`;
      }).join("")}</div>`;
    } else if(!q.done){
      h += `<input class="write-input fq-input" id="ovInput" lang="ja" placeholder="digite em romaji (vira hiragana) ou kana/kanji" autocapitalize="off" autocomplete="off" value="">`;
    } else {
      h += `<div class="fq-typed">Você escreveu: <b lang="ja">${esc(q.typed) || "—"}</b></div>`;
    }
    if(q.done) h += `<div class="actions"><button class="btn next" onclick="Ouvir.next()">Próxima →</button></div>`;
    else if(input==="digitar") h += `<div class="actions"><button class="btn no" onclick="Ouvir.check(true)">Não sei</button><button class="btn yes" onclick="Ouvir.check()">Conferir</button></div>`;
    return h;
  }
  // Teclado: 1–4 escolhem, Espaço repete, Enter confere/avança. Fala a palavra
  // uma vez por pergunta (o toque que trouxe a pergunta libera o áudio no celular).
  function bind(sheetOpen){
    const inp = document.getElementById("ovInput");
    if(inp){
      Romaji.bind(inp);
      if(!sheetOpen) inp.focus();
      inp.onkeydown = (e)=>{ if(e.key==="Enter"){ e.preventDefault(); e.stopPropagation(); check(); } };
    }
    document.onkeydown = (e)=>{
      if(sheetOpen || e.target.tagName==="INPUT") return;
      if(q && q.done && e.key==="Enter" && !e.target.closest(".kanji-toggle, .tts-btn")){ e.preventDefault(); next(); return; }
      if(e.key===" " && !e.target.closest("button")){ e.preventDefault(); play(); return; }
      const n = parseInt(e.key, 10);
      if(input==="opcoes" && q && !q.done && n>=1 && n<=q.opts.length) choose(n-1);
    };
    if(q && !q.spoken && !sheetOpen){ q.spoken = true; play(); }
  }

  function summaryHtml(){
    const list = [...seen.values()], first = list.filter((r)=> !r.errs).length;
    const wrong = list.filter((r)=> r.errs).sort((a, b)=> b.errs - a.errs)
      .map((r)=> `<li><span lang="ja">${r.v.kanji}</span> <span class="es-hint">${r.v.kana} · ${r.v.meaning}</span> <b>${r.errs}×</b></li>`).join("");
    return `<div class="card nohand es-card">
      <div class="es-title">🎧 Fim do deck</div>
      <div class="es-big">${first}/${list.length}</div>
      <div class="es-hint">acertos de primeira</div>
      ${wrong ? `<div class="es-sec">Palavras que você errou</div><ul class="es-words">${wrong}</ul>` : ""}
    </div>
    <div class="actions"><button class="btn yes" onclick="Ouvir.restart()">Próximo deck →</button></div>`;
  }
  function setInput(v){ input = v; try{ localStorage.setItem(INPUT_KEY, v); }catch(e){} if(q) q.spoken = true; A.render(); }
  function settingsHtml(segHtml){
    return `<div class="setting"><div class="setting-label">Resposta</div>${segHtml([["opcoes","Alternativas"],["digitar","Digitar"]], input, "Ouvir.setInput")}
      <div class="setting-note">${input==="opcoes" ? "Escolha o significado entre 4 opções (teclas 1–4)." : "Escreva a palavra que ouviu: romaji, kana ou kanji."}</div></div>
      <div class="setting-note">Treino livre: não muda o nível das palavras, só conta nas Estatísticas.</div>`;
  }
  const summary = ()=> input==="opcoes" ? "Alternativas" : "Digitar";

  return {DECK, setup(a){ A = a; }, deck, html, bind, choose, check, next, reset, play, toggleConj, summaryHtml, setInput, settingsHtml, summary,
    restart(){ A.restart(); }, _q: ()=> q};
})();
