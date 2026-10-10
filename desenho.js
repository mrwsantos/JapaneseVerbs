// Modo Desenhar: área para escrever à mão + reconhecimento de letras japonesas.
// O reconhecimento é do KanjiCanvas (c) Dominik Klein, licença MIT —
// https://github.com/asdfjkl/kanjicanvas — carregado só quando o modo abre
// (lib/kanjicanvas/). Funciona offline.
//
// Como o app já sabe a resposta, não precisamos adivinhar qualquer letra:
// a cada traço pegamos as letras mais parecidas e escolhemos a primeira que
// continua uma das respostas aceitas (kanji ou kana).
const Desenho = (()=>{
  const TOP_N = 5;           // quantos candidatos do reconhecedor consideramos
  const AUTO_MS = 1100;      // pausa sem desenhar até a letra entrar sozinha
  // O reconhecedor normaliza o tamanho, então não diferencia ゃ de や.
  const SMALL = {"ぁ":"あ","ぃ":"い","ぅ":"う","ぇ":"え","ぉ":"お","っ":"つ","ゃ":"や","ゅ":"ゆ","ょ":"よ","ゎ":"わ",
                 "ァ":"ア","ィ":"イ","ゥ":"ウ","ェ":"エ","ォ":"オ","ッ":"ツ","ャ":"ヤ","ュ":"ユ","ョ":"ヨ","ヮ":"ワ"};
  const big = (c)=> SMALL[c] || c;

  let libPromise = null;
  function loadScript(src){
    return new Promise((resolve, reject)=>{
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  // base: caminho até a raiz do app ("../" nas páginas de verbos/adjetivos).
  function load(base){
    if(window.KanjiCanvas && KanjiCanvas.refPatterns && KanjiCanvas.refPatterns.length) return Promise.resolve();
    if(!libPromise){
      libPromise = loadScript(base + "lib/kanjicanvas/kanji-canvas.js")
        .then(()=> loadScript(base + "lib/kanjicanvas/padroes.js"))
        .catch((e)=>{ libPromise = null; throw e; });
    }
    return libPromise;
  }

  // Traços em px da área (size x size) -> letras mais parecidas, melhor primeiro.
  function recognize(strokes, size){
    const k = 256 / size;
    const pattern = strokes.map((s)=>{
      const pts = s.map(([x, y])=> [x*k, y*k]);
      return pts.length === 1 ? [pts[0], [pts[0][0] + 1, pts[0][1] + 1]] : pts;
    });
    if(!pattern.length) return [];
    // Toques soltos (todos os pontos iguais) quebram a normalização.
    const xs = pattern.flat().map((p)=> p[0]), ys = pattern.flat().map((p)=> p[1]);
    if(Math.max(...xs) - Math.min(...xs) < 2 && Math.max(...ys) - Math.min(...ys) < 2) return [];
    KanjiCanvas["recordedPattern_desenho"] = pattern;
    const features = KanjiCanvas.extractFeatures(KanjiCanvas.momentNormalize("desenho"), 20.);
    const coarse = KanjiCanvas.coarseClassification(features);
    return KanjiCanvas.fineClassification(features, coarse).split("  ").filter(Boolean);
  }

  // Qual letra entra: a primeira entre as TOP_N que continua alguma resposta.
  function choose(cands, answers, written){
    const pos = written.length;
    for(const c of cands.slice(0, TOP_N)){
      for(const a of answers){
        if(a.startsWith(written) && a.length > pos && big(a[pos]) === big(c)) return {char: a[pos], fits: true, cand: c};
      }
    }
    return cands.length ? {char: cands[0], fits: false, cand: cands[0]} : null;
  }

  let cssDone = false;
  function injectCss(){
    if(cssDone) return; cssDone = true;
    const st = document.createElement("style");
    st.textContent = `
.dw{margin-top:12px}
.dw-written{display:flex;justify-content:center;align-items:center;gap:4px;min-height:48px;margin-bottom:8px;flex-wrap:wrap}
.dw-char{min-width:40px;height:44px;padding:0 4px;border-radius:10px;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:600;animation:popIn .3s cubic-bezier(.34,1.56,.64,1)}
.dw-char.bad{border-color:#c0503f;color:#c0503f}
.dw-caret{width:40px;height:44px;border-radius:10px;border:2px dashed var(--border)}
.dw-pad{position:relative;width:100%;max-width:min(320px,38vh);aspect-ratio:1;margin:0 auto;border-radius:18px;background:var(--card);border:1px solid var(--border);box-shadow:var(--shadow);touch-action:none;overflow:hidden}
.dw-pad::before,.dw-pad::after{content:"";position:absolute;pointer-events:none;border:0 dashed var(--border)}
.dw-pad::before{left:50%;top:8%;bottom:8%;border-left-width:1px}
.dw-pad::after{top:50%;left:8%;right:8%;border-top-width:1px}
.dw-pad canvas{position:absolute;inset:0;width:100%;height:100%;cursor:crosshair}
.dw-hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--sub);font-size:13px;pointer-events:none;text-align:center;padding:20px}
.dw-cands{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;min-height:38px;margin:8px 0 2px}
.dw-cand{min-width:40px;height:38px;padding:0 8px;border-radius:10px;border:1px solid var(--border);background:var(--chip);font-size:20px;color:var(--text)}
.dw-cand.best{border-color:var(--accent);background:var(--accent);color:#fff}
.dw-tools{display:flex;gap:6px;margin-top:8px}
.dw-tool{flex:none;width:44px;height:46px;border-radius:12px;border:1px solid var(--border);background:var(--card);font-size:17px;color:var(--sub)}
.dw-tools .btn{flex:1;padding:0;height:46px;font-size:14px}
.dw-tool:active{transform:scale(.96)}
.dw-credit{text-align:center;font-size:10px;color:var(--sub);margin-top:12px}
.dw-credit a{color:inherit}`;
    document.head.appendChild(st);
  }

  // Monta a área de desenho. answers: respostas aceitas (ex.: ["食べる","たべる"]).
  // onDone(acertou, escrito) é chamado quando completa uma resposta ou ao conferir.
  function mount(el, {answers, onDone}){
    injectCss();
    answers = [...new Set(answers.filter(Boolean))];
    let written = "", marks = [], strokes = [], current = null, cands = [], pick = null, timer = null;
    el.innerHTML = `<div class="dw">
      <div class="dw-written" aria-live="polite"></div>
      <div class="dw-pad"><canvas aria-label="Área para desenhar a letra"></canvas><div class="dw-hint">Desenhe uma letra de cada vez</div></div>
      <div class="dw-cands"></div>
      <div class="dw-tools">
        <button type="button" class="dw-tool" data-act="undo" title="Desfazer traço" aria-label="Desfazer traço">↶</button>
        <button type="button" class="dw-tool" data-act="clear" title="Limpar" aria-label="Limpar desenho">🗑</button>
        <button type="button" class="dw-tool" data-act="back" title="Apagar letra" aria-label="Apagar última letra">⌫</button>
        <button type="button" class="btn next" data-act="giveup">Não sei</button>
        <button type="button" class="btn yes" data-act="check">Conferir</button>
      </div>
      <p class="dw-credit">Reconhecimento: <a href="https://github.com/asdfjkl/kanjicanvas" target="_blank" rel="noopener">KanjiCanvas</a> © Dominik Klein (MIT)</p>
    </div>`;
    const pad = el.querySelector(".dw-pad"), canvas = el.querySelector("canvas"), hint = el.querySelector(".dw-hint");
    const writtenEl = el.querySelector(".dw-written"), candsEl = el.querySelector(".dw-cands");
    const g = canvas.getContext("2d");
    let size = 0;

    function resize(){
      size = pad.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }
    function redraw(){
      g.clearRect(0, 0, size, size);
      g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = Math.max(5, size / 36);
      g.strokeStyle = getComputedStyle(el).getPropertyValue("--text").trim() || "#222";
      for(const s of strokes.concat(current ? [current] : [])){
        g.beginPath(); g.moveTo(s[0][0], s[0][1]);
        if(s.length === 1) g.lineTo(s[0][0] + .1, s[0][1] + .1);
        for(const [x, y] of s.slice(1)) g.lineTo(x, y);
        g.stroke();
      }
      hint.style.display = strokes.length || current ? "none" : "";
    }
    function renderWritten(){
      writtenEl.innerHTML = [...written].map((c, i)=> `<span class="dw-char${marks[i] ? "" : " bad"}">${c}</span>`).join("") + `<span class="dw-caret"></span>`;
    }
    function renderCands(){
      candsEl.innerHTML = cands.slice(0, TOP_N).map((c)=>
        `<button type="button" class="dw-cand${pick && pick.cand === c ? " best" : ""}" data-c="${c}">${c}</button>`).join("");
    }
    function update(){
      cands = strokes.length ? recognize(strokes, size) : [];
      pick = cands.length ? choose(cands, answers, written) : null;
      renderCands();
      clearTimeout(timer);
      // Pausou e a letra mais provável é a esperada: entra sozinha.
      if(pick && pick.fits && pick.cand === cands[0]) timer = setTimeout(()=> accept(pick.char, true), AUTO_MS);
    }
    function accept(char, fits, finish = true){
      clearTimeout(timer);
      written += char; marks.push(fits);
      strokes = []; cands = []; pick = null;
      redraw(); renderWritten(); renderCands();
      if(finish && answers.includes(written)) setTimeout(()=> onDone(true, written), 250);
    }

    let pid = null;
    const pos = (e)=>{ const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener("pointerdown", (e)=>{
      if(pid !== null) return;
      pid = e.pointerId; canvas.setPointerCapture(pid);
      clearTimeout(timer);
      current = [pos(e)]; redraw();
    });
    canvas.addEventListener("pointermove", (e)=>{
      if(e.pointerId !== pid || !current) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for(const ev of evs) current.push(pos(ev));
      redraw();
    });
    const end = (e)=>{
      if(e.pointerId !== pid) return;
      pid = null;
      if(current){ strokes.push(current); current = null; }
      redraw(); update();
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    el.querySelector(".dw-tools").addEventListener("click", (e)=>{
      const act = e.target.closest("[data-act]")?.dataset.act;
      clearTimeout(timer);
      if(act === "undo"){ strokes.pop(); redraw(); update(); }
      if(act === "clear"){ strokes = []; redraw(); update(); }
      if(act === "back"){ written = written.slice(0, -1); marks.pop(); strokes = []; redraw(); renderWritten(); update(); }
      if(act === "giveup") onDone(false, "");
      if(act === "check") ctl.check();
    });
    candsEl.addEventListener("click", (e)=>{
      const c = e.target.closest("[data-c]")?.dataset.c; if(!c) return;
      const ch = choose([c], answers, written);
      accept(ch.char, ch.fits);
    });

    resize(); renderWritten();
    window.addEventListener("resize", resize);
    const ctl = {
      // Botão "Próxima letra": aceita o melhor candidato agora.
      next(){ if(pick) accept(pick.char, pick.fits); },
      // Botão "Conferir": encerra com o que já foi escrito.
      check(){ clearTimeout(timer); if(pick && strokes.length) accept(pick.char, pick.fits, false); onDone(answers.includes(written), written); },
      get written(){ return written; },
      destroy(){ clearTimeout(timer); window.removeEventListener("resize", resize); },
      _test: {recognize: (s)=> recognize(s, size), choose: (c)=> choose(c, answers, written), accept},
    };
    return ctl;
  }

  return {load, mount, recognize, choose};
})();
