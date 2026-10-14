// Modo Frases (verbos e adjetivos): uma frase de exemplo com lacuna onde vai a
// palavra JÁ CONJUGADA (formal/informal, passado, negativo). A pessoa escolhe
// entre 4 alternativas ou digita. Cada app registra um adaptador com os dados
// e a conjugação dele (Frases.setup); o resto (sorteio da forma, distratores,
// tela, teclado e ajustes) fica aqui.
//
// Adaptador:
//   words            todas as palavras do app (distratores)
//   variants(v)      frases de exemplo de v (uma é sorteada por pergunta)
//   keys(v, s)       formas possíveis na frase s: chaves de FORM, ou ['fixed']
//                    quando a frase não admite conjugar (palavra no meio da frase)
//   item(v, key, s)  {pre, post, preK, postK, ans, ansK, pt}: frase em kanji e em
//                    kana com a lacuna, resposta (kanji/kana) e a tradução, com a
//                    palavra em destaque entre [ ]
//   blank(w, key, v, s) {ans, ansK}: a palavra w na forma `key`, para a frase s de
//                    v (null se não serve)
//   kind(w)          tipo da palavra (distratores do mesmo tipo vêm primeiro)
//   studied(w)       palavra já estudada (preferida como distrator)
//   altForms(kana)   (opcional) variações aceitas ao digitar
//   score(v, ok)     grava o resultado no progresso
//   next()           avança para a próxima frase
//   render()         redesenha a tela
//   showKanji()      frase em kanji (true) ou só em kana
//   toggleKanji      nome da função global que alterna kanji/kana (botão no card)
const Frases = (()=>{
  const FORM = {
    dict:{f:0,p:0,n:0}, masu:{f:1,p:0,n:0}, nai:{f:0,p:0,n:1}, masen:{f:1,p:0,n:1},
    ta:{f:0,p:1,n:0}, mashita:{f:1,p:1,n:0}, nakatta:{f:0,p:1,n:1}, masendeshita:{f:1,p:1,n:1},
  };
  const KEYS = Object.keys(FORM);
  const PRESENT = KEYS.filter((k)=> !FORM[k].p);
  const keyOf = (f, p, n)=> KEYS.find((k)=> FORM[k].f===f && FORM[k].p===p && FORM[k].n===n);
  // Frases no futuro (明日, 来年) não vão para o passado.
  const FUTURE = /明日|来年|amanhã|ano que vem/i;

  const INPUT_KEY = "jp-frase-input";  // 'opcoes' | 'digitar' (compartilhado)
  const FORMS_KEY = "jp-frase-forms";  // 'variada' | 'basica'
  const load = (k, d)=>{ try{ return localStorage.getItem(k) || d; }catch(e){ return d; } };
  const save = (k, v)=>{ try{ localStorage.setItem(k, v); }catch(e){} };
  let input = load(INPUT_KEY, "opcoes");
  let forms = load(FORMS_KEY, "variada");

  let A = null; // adaptador
  let q = null; // pergunta atual

  const shuffle = (a)=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const pick = (a)=> a[Math.floor(Math.random()*a.length)];
  const senses = (w)=> w.meaning.toLowerCase().split("/").map((s)=> s.replace(/\(.*?\)/g, "").trim()).filter(Boolean);
  const markHl = (t)=> String(t||"").replace(/\[([^\]]+)\]/g, "<mark>$1</mark>");
  const cap = (s)=> s.charAt(0).toUpperCase() + s.slice(1);

  // Português: troca a palavra `word` da frase por `repl` (passado) e/ou põe
  // "não" antes, deixando o resultado entre [ ]. "-me" vira "não me ...".
  function ptVerb(sentence, word, repl, neg){
    const i = sentence.toLowerCase().indexOf(word.toLowerCase());
    if(i===-1) return null;
    let w = repl.toLowerCase();
    if(neg) w = /-me$/.test(w) ? "não me " + w.replace(/-me$/, "") : "não " + w;
    if(i===0) w = cap(w);
    return sentence.slice(0, i) + "[" + w + "]" + sentence.slice(i + word.length);
  }

  function makeQuestion(v){
    const s = pick(A.variants(v));
    let keys = A.keys(v, s);
    if(forms==="basica"){
      const basic = keys.filter((k)=> k==="dict" || k==="masu" || k==="fixed");
      if(basic.length) keys = basic;
    }
    const key = pick(keys);
    const item = A.item(v, key, s);
    const opts = [{ans: item.ans, ansK: item.ansK, ok: true}];
    const seen = new Set([item.ans, item.ansK]);
    const add = (o)=>{
      if(!o || seen.has(o.ans) || seen.has(o.ansK)) return false;
      seen.add(o.ans); seen.add(o.ansK); opts.push({...o, ok: false}); return true;
    };
    // Um distrator é a própria palavra em outra forma (mesma formalidade, que
    // aparece na etiqueta): treina a conjugação, não só o significado.
    if(key!=="fixed" && forms!=="basica"){
      const F = FORM[key];
      for(const k of shuffle([keyOf(F.f, 1-F.p, F.n), keyOf(F.f, F.p, 1-F.n), keyOf(F.f, 1-F.p, 1-F.n)])){
        if(add(A.blank(v, k, v, s))) break;
      }
    }
    // O resto: outras palavras na mesma forma, sem sentido em comum com a certa.
    const vs = senses(v);
    const score = (w)=> (A.kind(w)===A.kind(v) ? 2 : 0) + (A.studied(w) ? 1 : 0);
    const cands = shuffle(A.words.filter((w)=> w!==v && !senses(w).some((s)=> vs.includes(s))))
      .sort((a, b)=> score(b) - score(a));
    for(const w of cands){ if(opts.length>=4) break; add(A.blank(w, key, v, s)); }
    q = {v, key, item, opts: shuffle(opts), chosen: -1, typed: "", done: false, ok: false};
  }

  function finish(ok){
    q.done = true; q.ok = ok;
    Sons.play("cards", ok ? "acerto" : "erro");
    A.score(q.v, ok);
    A.render();
  }
  function choose(i){
    if(!q || q.done) return;
    q.chosen = i;
    finish(q.opts[i].ok);
  }
  function check(){
    if(!q || q.done) return;
    const el = document.getElementById("fqInput");
    q.typed = el ? el.value : "";
    const s = q.typed.trim().replace(/[。.]$/, "");
    const kanas = A.altForms ? A.altForms(q.item.ansK) : [q.item.ansK];
    const ok = !!s && (
      kanas.some((k)=> normRomaji(s)===normRomaji(kanaToRomaji(k))) ||
      kanas.includes(katakanaToHiragana(s)) ||
      s===q.item.ans);
    finish(ok);
  }
  function next(){ q = null; A.next(); }
  function reset(){ q = null; }

  function tagsHtml(key){
    if(key==="fixed") return "";
    const F = FORM[key];
    return `<div class="tags">
      <span class="tagbadge ${F.f?'formal':'informal'}">${F.f?'Formal':'Informal'}</span>
      <span class="tagbadge time">${F.p?'Passado':'Presente'}</span>
      <span class="tagbadge neg">${F.n?'Negativo':'Afirmativo'}</span>
    </div>`;
  }

  // Tela da frase atual (v = palavra da vez).
  function html(v){
    if(!q || q.v!==v) makeQuestion(v);
    const kanji = A.showKanji(), it = q.item;
    const [pre, post, ans] = kanji ? [it.pre, it.post, it.ans] : [it.preK, it.postK, it.ansK];
    const blank = q.done ? `<mark>${ans}</mark>` : `<span class="fq-blank" aria-label="lacuna">？</span>`;
    // Aviso só quando a forma importa (frase conjugável).
    let h = q.key!=="fixed" ? `<div class="fq-note">⚠️ Atenção ao <b>tempo verbal</b> e à <b>formalidade</b>: veja as etiquetas e a tradução.</div>` : "";
    h += `<div class="card nohand fq-card">
      ${tagsHtml(q.key)}
      <div class="sentence fq-jp" lang="ja">${pre}${blank}${post}</div>
      ${q.done && kanji && (it.pre+it.ans+it.post)!==(it.preK+it.ansK+it.postK) ? `<div class="fq-kana" lang="ja">${it.preK}<mark>${it.ansK}</mark>${it.postK}</div>` : ""}
      <div class="fq-pt">${markHl(it.pt)}</div>
      <button type="button" class="fq-script" onclick="${A.toggleKanji}()" aria-pressed="${kanji}">${kanji ? "Ver em hiragana" : "Ver em kanji"}</button>
      ${q.done ? `<div class="fq-result"><span class="${q.ok?'result-ok':'result-no'}">${q.ok ? '✓ Certo!' : '✗ Não foi dessa vez'}</span></div>` : ""}
    </div>`;
    if(input==="opcoes"){
      h += `<div class="fq-opts">${q.opts.map((o, i)=>{
        const cls = !q.done ? "" : o.ok ? "ok" : i===q.chosen ? "no" : "dim";
        return `<button type="button" class="fq-opt ${cls}" lang="ja" onclick="Frases.choose(${i})" ${q.done?'disabled':''}><span class="fq-n" aria-hidden="true">${i+1}</span>${kanji ? o.ans : o.ansK}</button>`;
      }).join("")}</div>`;
    } else if(!q.done){
      h += `<input class="write-input fq-input" id="fqInput" lang="ja" placeholder="romaji, hiragana, katakana ou kanji" autocapitalize="off" autocomplete="off" value="">`;
    } else {
      h += `<div class="fq-typed">Você escreveu: <b lang="ja">${q.typed.replace(/[<>&]/g, "") || "—"}</b>${q.ok ? "" : ` · certo: <b lang="ja">${it.ans!==it.ansK ? it.ans + " (" + it.ansK + ")" : it.ansK}</b>`}</div>`;
    }
    if(q.done) h += `<div class="actions"><button class="btn next" onclick="Frases.next()">Próxima →</button></div>`;
    else if(input==="digitar") h += `<div class="actions"><button class="btn yes" onclick="Frases.check()">Conferir</button></div>`;
    return h;
  }
  // Teclado: 1–4 escolhem, Enter confere/avança. Chamar depois de pôr o html.
  function bind(sheetOpen){
    const inp = document.getElementById("fqInput");
    if(inp){
      if(!sheetOpen) inp.focus();
      inp.onkeydown = (e)=>{ if(e.key==="Enter"){ e.preventDefault(); e.stopPropagation(); check(); } };
    }
    document.onkeydown = (e)=>{
      if(sheetOpen || e.target.tagName==="INPUT") return;
      if(q && q.done && e.key==="Enter"){ e.preventDefault(); next(); return; }
      const n = parseInt(e.key, 10);
      if(input==="opcoes" && q && !q.done && n>=1 && n<=q.opts.length) choose(n-1);
    };
  }

  function setInput(v){ input = v; save(INPUT_KEY, v); q = null; A.render(); }
  function setForms(v){ forms = v; save(FORMS_KEY, v); q = null; A.render(); }
  function settingsHtml(segHtml){
    return `<div class="setting"><div class="setting-label">Resposta</div>${segHtml([["opcoes","Alternativas"],["digitar","Digitar"]], input, "Frases.setInput")}
        <div class="setting-note">${input==="opcoes" ? "Escolha entre 4 opções (teclas 1–4)." : "Escreva a palavra conjugada: romaji, kana ou kanji."}</div></div>
      <div class="setting"><div class="setting-label">Conjugação</div>${segHtml([["variada","🎲 Variada"],["basica","Só presente"]], forms, "Frases.setForms")}
        <div class="setting-note">${forms==="variada" ? "Formal/informal, passado e negativo sorteados em cada frase." : "Só a forma do dicionário e a formal (ます/です)."}</div></div>`;
  }
  function summary(){ return (input==="opcoes" ? "Alternativas" : "Digitar") + (forms==="basica" ? " · presente" : ""); }

  return {
    FORM, KEYS, PRESENT, FUTURE, ptVerb,
    setup(adapter){ A = adapter; },
    html, bind, choose, check, next, reset, settingsHtml, summary, setInput, setForms,
    _q: ()=> q,
  };
})();
