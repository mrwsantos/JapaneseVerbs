// Modo Escrita (verbos e adjetivos): conversão romaji → hiragana enquanto
// digita, decks de 10 palavras (erradas voltam no fim do deck até acertar) e
// estatística de erros no fim de cada deck, com sugestão do que treinar.

// ===== Romaji → hiragana (estilo teclado japonês) =====
// "taberu" → たべる, "kka" → っか, "n" + consoante → ん, "nn"/"n'" → ん,
// "-" → ー. Kana e kanji digitados passam direto. Enquanto digita, um "n"
// (ou "nn") no fim fica em romaji até a próxima letra decidir se é ん ou な/に…
const Romaji = (()=>{
  const T = {
    a:"あ", i:"い", u:"う", e:"え", o:"お",
    ka:"か", ki:"き", ku:"く", ke:"け", ko:"こ", ga:"が", gi:"ぎ", gu:"ぐ", ge:"げ", go:"ご",
    sa:"さ", shi:"し", si:"し", su:"す", se:"せ", so:"そ", za:"ざ", ji:"じ", zi:"じ", zu:"ず", ze:"ぜ", zo:"ぞ",
    ta:"た", chi:"ち", ti:"ち", tsu:"つ", tu:"つ", te:"て", to:"と", da:"だ", di:"ぢ", du:"づ", de:"で", do:"ど",
    na:"な", ni:"に", nu:"ぬ", ne:"ね", no:"の",
    ha:"は", hi:"ひ", fu:"ふ", hu:"ふ", he:"へ", ho:"ほ", ba:"ば", bi:"び", bu:"ぶ", be:"べ", bo:"ぼ",
    pa:"ぱ", pi:"ぴ", pu:"ぷ", pe:"ぺ", po:"ぽ", ma:"ま", mi:"み", mu:"む", me:"め", mo:"も",
    ya:"や", yu:"ゆ", yo:"よ", ra:"ら", ri:"り", ru:"る", re:"れ", ro:"ろ",
    wa:"わ", wo:"を", wi:"うぃ", we:"うぇ",
    fa:"ふぁ", fi:"ふぃ", fe:"ふぇ", fo:"ふぉ", she:"しぇ", che:"ちぇ", je:"じぇ",
    xa:"ぁ", xi:"ぃ", xu:"ぅ", xe:"ぇ", xo:"ぉ", la:"ぁ", li:"ぃ", lu:"ぅ", le:"ぇ", lo:"ぉ",
    xtu:"っ", ltu:"っ", xtsu:"っ", ltsu:"っ", xya:"ゃ", xyu:"ゅ", xyo:"ょ", lya:"ゃ", lyu:"ゅ", lyo:"ょ", xwa:"ゎ",
  };
  const YOON = {ky:"き", gy:"ぎ", sh:"し", sy:"し", ch:"ち", cy:"ち", ty:"ち", ny:"に", hy:"ひ", my:"み",
    ry:"り", by:"び", py:"ぴ", j:"じ", jy:"じ", zy:"じ", dy:"ぢ"};
  for(const [c, k] of Object.entries(YOON)){ T[c+"a"] = k+"ゃ"; T[c+"u"] = k+"ゅ"; T[c+"o"] = k+"ょ"; }
  const KEYS = Object.keys(T);
  const isPrefix = (s)=> KEYS.some((k)=> k.startsWith(s));
  const DOUBLE = /[bcdfghjkmpqrstvwxyz]/;

  function toKana(str, final){
    const s = str.toLowerCase();
    let out = "", i = 0;
    while(i < s.length){
      const c = s[i];
      if(!/[a-z'-]/.test(c)){ out += str[i]; i++; continue; }
      if(c==="-"){ out += "ー"; i++; continue; }
      if(c==="'"){ i++; continue; }
      if(c==="n"){
        const n1 = s[i+1];
        if(n1===undefined){ out += final ? "ん" : "n"; i++; continue; }
        if(n1==="'"){ out += "ん"; i += 2; continue; }
        if(n1==="n"){
          const n2 = s[i+2];
          if(n2===undefined){ out += final ? "ん" : "nn"; i += 2; continue; }
          if(/[aiueoy]/.test(n2)){ out += "ん"; i++; continue; } // "minna" → みんな
          out += "ん"; i += 2; continue;                           // "konn" + consoante
        }
        if(!/[aiueoy]/.test(n1)){ out += "ん"; i++; continue; }
      }
      if(DOUBLE.test(c) && (s[i+1]===c || (c==="t" && s[i+1]==="c" && s[i+2]==="h"))){ out += "っ"; i++; continue; }
      let hit = false;
      for(let len = 4; len >= 1; len--){
        const k = s.slice(i, i+len);
        if(k.length===len && T[k]){ out += T[k]; i += len; hit = true; break; }
      }
      if(hit) continue;
      // Sílaba ainda incompleta no fim ("ky", "sh"): fica em romaji.
      const rest = s.slice(i);
      if(isPrefix(rest)){ out += str.slice(i); break; }
      out += str[i]; i++;
    }
    return out;
  }

  // Liga a conversão num <input>.
  // No celular (Gboard etc.) o teclado "segura" a palavra em composição e
  // mexer no valor no meio dela duplica letras. Por isso o campo é desenhado
  // por uma camada por cima (o kana já convertido), com o texto real
  // invisível por baixo: o que você vê muda a cada letra em qualquer teclado.
  // Fora de composição (PC, iPhone) o valor real também é trocado na hora.
  // Quem muda o valor por código deve chamar input.dispatchEvent(new Event("input")).
  function bind(input){
    if(!input || input.dataset.romaji) return;
    input.dataset.romaji = "1";
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("inputmode", "email");
    const cs = getComputedStyle(input);
    const wrap = document.createElement("div");
    wrap.style.cssText = `position:relative;width:100%;margin:${cs.marginTop} 0 ${cs.marginBottom}`;
    input.style.margin = "0";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const shown = document.createElement("div");
    shown.className = "romaji-shown";
    shown.setAttribute("lang", "ja");
    shown.setAttribute("aria-hidden", "true");
    const just = cs.textAlign==="center" ? "center" : (cs.textAlign==="right" || cs.textAlign==="end") ? "flex-end" : "flex-start";
    shown.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:${just};pointer-events:none;white-space:pre;overflow:hidden;`
      + `padding:${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft};border:${cs.borderTopWidth} solid transparent;`
      + `font:${cs.font};letter-spacing:${cs.letterSpacing};color:${cs.color}`;
    const text = document.createElement("span");
    const caret = document.createElement("span");
    caret.style.cssText = "display:inline-block;width:2px;height:1.15em;margin-left:1px;background:var(--accent);animation:romajiBlink 1s steps(1) infinite";
    shown.append(text, caret);
    wrap.appendChild(shown);
    if(!document.getElementById("romajiBlinkCss")){
      const st = document.createElement("style");
      st.id = "romajiBlinkCss";
      st.textContent = "@keyframes romajiBlink{50%{opacity:0}}";
      document.head.appendChild(st);
    }
    input.style.color = "transparent";
    input.style.caretColor = "transparent";
    const paint = ()=>{
      text.textContent = toKana(input.value, false);
      caret.style.visibility = document.activeElement===input ? "visible" : "hidden";
    };
    const run = ()=>{
      const pos = input.selectionStart ?? input.value.length;
      const before = input.value.slice(0, pos), after = input.value.slice(pos);
      const conv = toKana(before, false);
      if(conv!==before){
        input.value = conv + after;
        try{ input.setSelectionRange(conv.length, conv.length); }catch(e){}
      }
      paint();
    };
    input.addEventListener("input", (e)=>{ if(e.isComposing) paint(); else run(); });
    input.addEventListener("compositionend", ()=> setTimeout(run, 0));
    input.addEventListener("focus", paint);
    input.addEventListener("blur", paint);
    paint();
  }
  return {toKana, bind};
})();

// ===== Decks + estatística de erros =====
// Adaptador (Escrita.setup):
//   words              todas as palavras do app
//   forms(v)           {chave: [respostas aceitas (kana e kanji)]} das 8 formas
//   groupOf(v)         {key, label} do grupo (Grupo 1 / -i ...) para a estatística;
//                      a página tem trainWriteGroup(key) para o botão do grupo mais fraco
//   hint(key)          terminação típica da forma (ex.: "〜なかった")
//   statsKey           chave do localStorage para o histórico
const Escrita = (()=>{
  const DECK = 10;
  const FORM = {
    dict:{f:0,p:0,n:0}, masu:{f:1,p:0,n:0}, nai:{f:0,p:0,n:1}, masen:{f:1,p:0,n:1},
    ta:{f:0,p:1,n:0}, mashita:{f:1,p:1,n:0}, nakatta:{f:0,p:1,n:1}, masendeshita:{f:1,p:1,n:1},
  };
  const formLabel = (k)=>{ const F = FORM[k]; return `${F.f?"Formal":"Informal"} · ${F.p?"passado":"presente"} · ${F.n?"negativo":"afirmativo"}`; };
  let A = null;

  // Por que errou: escreveu outra forma da mesma palavra (e o que trocou) ou
  // uma escrita/conjugação que não é forma nenhuma dela.
  function classify(v, key, input){
    const typed = katakanaToHiragana(input.trim());
    const forms = A.forms(v);
    for(const [k, answers] of Object.entries(forms)){
      if(k!==key && answers.includes(typed)){
        const a = FORM[key], b = FORM[k];
        return {type: "forma", got: k, swapped: [a.f!==b.f && "f", a.p!==b.p && "p", a.n!==b.n && "n"].filter(Boolean)};
      }
    }
    return {type: "escrita"};
  }

  // Histórico de todas as tentativas (por forma e por grupo), para a sugestão
  // não depender só de um deck.
  function loadHist(){ try{ return JSON.parse(localStorage.getItem(A.statsKey)) || {forms:{}, groups:{}}; }catch(e){ return {forms:{}, groups:{}}; } }
  function record(v, key, ok){
    const h = loadHist(), g = A.groupOf(v).key;
    const bump = (o, k)=>{ o[k] = o[k] || {ok:0, total:0}; o[k].total++; if(ok) o[k].ok++; };
    bump(h.forms, key); bump(h.groups, g);
    try{ localStorage.setItem(A.statsKey, JSON.stringify(h)); }catch(e){}
  }

  const pct = (a, b)=> b ? Math.round(a / b * 100) : 0;
  function bar(label, errs, total, extra){
    const p = pct(errs, total);
    return `<div class="es-row"><div class="es-label">${label}${extra ? ` <span class="es-hint">${extra}</span>` : ""}</div>
      <div class="es-bar"><div style="width:${p}%"></div></div><div class="es-num">${errs}/${total}</div></div>`;
  }

  // Tela de fim de deck. attempts: [{v, key, ok, err}] na ordem respondida.
  function summaryHtml(attempts, deckSize){
    const words = new Map();
    attempts.forEach((a)=>{ const w = words.get(a.v) || {v: a.v, errs: 0, tries: 0}; w.tries++; if(!a.ok) w.errs++; words.set(a.v, w); });
    const firstTry = [...words.values()].filter((w)=> w.errs===0).length;
    const wrong = attempts.filter((a)=> !a.ok);

    // Erros por característica da forma pedida.
    const dims = [["f",1,"Formal"],["f",0,"Informal"],["p",1,"Passado"],["p",0,"Presente"],["n",1,"Negativo"],["n",0,"Afirmativo"]];
    const dimRows = dims.map(([d, val, label])=>{
      const of = attempts.filter((a)=> FORM[a.key][d]===val);
      return {label, errs: of.filter((a)=> !a.ok).length, total: of.length};
    }).filter((r)=> r.total);

    // Tipo do erro.
    const kinds = {f: 0, p: 0, n: 0, escrita: 0, desistiu: 0};
    wrong.forEach((a)=>{ if(a.err.type==="escrita" || a.err.type==="desistiu") kinds[a.err.type]++; else a.err.swapped.forEach((s)=> kinds[s]++); });
    const kindRows = [
      ["Trocou formal/informal", kinds.f], ["Trocou passado/presente", kinds.p],
      ["Trocou afirmativo/negativo", kinds.n], ["Conjugação ou escrita errada", kinds.escrita],
      ["Desistiu (vai para o próximo deck)", kinds.desistiu],
    ].filter(([, n])=> n);

    // Por grupo (verbos: 1/2/3; adjetivos: -i/-na).
    const groups = new Map();
    attempts.forEach((a)=>{ const g = A.groupOf(a.v); const r = groups.get(g.key) || {key: g.key, label: g.label, errs: 0, total: 0}; r.total++; if(!a.ok) r.errs++; groups.set(g.key, r); });

    // Sugestão: forma com mais erros no deck (o histórico desempata).
    const hist = loadHist();
    const byForm = {};
    attempts.forEach((a)=>{ const r = byForm[a.key] = byForm[a.key] || {errs: 0, total: 0}; r.total++; if(!a.ok) r.errs++; });
    const histRate = (k)=>{ const r = hist.forms[k]; return r && r.total ? (r.total - r.ok) / r.total : 0; };
    const weakest = Object.entries(byForm).filter(([, r])=> r.errs)
      .sort(([ka, a], [kb, b])=> (b.errs/b.total - a.errs/a.total) || (b.errs - a.errs) || (histRate(kb) - histRate(ka)))[0];
    const weakGroup = [...groups.values()].filter((g)=> g.errs).sort((a, b)=> b.errs/b.total - a.errs/a.total)[0];
    const histTotal = Object.values(hist.forms).reduce((s, r)=> s + r.total, 0);
    const histOk = Object.values(hist.forms).reduce((s, r)=> s + r.ok, 0);

    let tip;
    if(!wrong.length) tip = `<p>Nenhum erro neste deck. Se estiver fácil, ative <b>Embaralhado</b> nos Ajustes para variar as formas.</p>`;
    else {
      tip = `<p>Treine <b>${formLabel(weakest[0])}</b> <span class="es-hint">${A.hint(weakest[0])}</span>: ${weakest[1].errs} de ${weakest[1].total} errados.</p>`;
      if(kinds.escrita > wrong.length / 2) tip += `<p>A maioria dos erros foi na própria conjugação, não na escolha da forma: revise a tabela de conjugações (toque no kanji do card).</p>`;
      else if(kinds.p || kinds.f || kinds.n) tip += `<p>Você sabia conjugar, mas usou a forma errada: leia com calma as etiquetas antes de responder.</p>`;
      if(weakGroup && groups.size > 1) tip += `<p>Mais erros em <b>${weakGroup.label}</b> (${weakGroup.errs}/${weakGroup.total}).</p>`;
    }

    const wordList = [...words.values()].filter((w)=> w.errs).sort((a, b)=> b.errs - a.errs)
      .map((w)=> `<li><span lang="ja">${w.v.kanji}</span> <span class="es-hint">${w.v.kana} · ${w.v.meaning}</span> <b>${w.errs}×</b></li>`).join("");

    return `<div class="card nohand es-card">
      <div class="es-title">📊 Fim do deck</div>
      <div class="es-big">${firstTry}/${deckSize}</div>
      <div class="es-hint">acertos de primeira · ${attempts.length} respostas, ${wrong.length} erros</div>
      ${wrong.length ? `
        <div class="es-sec">Erros pela forma pedida</div>${dimRows.map((r)=> bar(r.label, r.errs, r.total)).join("")}
        <div class="es-sec">Tipo de erro</div>${kindRows.map(([l, n])=> bar(l, n, wrong.length)).join("")}
        ${groups.size > 1 ? `<div class="es-sec">Por grupo</div>${[...groups.values()].map((g)=> bar(g.label, g.errs, g.total)).join("")}` : ""}
        <div class="es-sec">Palavras que você errou</div><ul class="es-words">${wordList}</ul>` : ""}
      <div class="es-sec">💡 Sugestão</div><div class="es-tip">${tip}</div>
      ${histTotal ? `<div class="es-hint" style="margin-top:10px">No geral: ${pct(histOk, histTotal)}% de acerto em ${histTotal} respostas na Escrita.</div>` : ""}
    </div>
    <div class="es-actions">
      ${weakGroup && groups.size > 1 ? `<button type="button" class="know-btn" onclick="trainWriteGroup('${weakGroup.key}')">🎯 Próximo deck só com ${weakGroup.label}</button>` : ""}
      ${weakest && new Set(attempts.map((a)=> a.key)).size > 1 ? `<button type="button" class="know-btn" onclick="trainWriteForm('${weakest[0]}')">🎯 Próximo deck só com essa forma</button>` : ""}
    </div>
    <div class="actions"><button class="btn yes" onclick="nextWriteDeck()">Próximo deck →</button></div>`;
  }

  return {DECK, FORM, formLabel, setup(a){ A = a; }, classify, record, summaryHtml};
})();
