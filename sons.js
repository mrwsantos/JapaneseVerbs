// Sons do app, gerados com Web Audio (sem arquivos de áudio: funciona offline
// e não pesa no PWA). Dois grupos com liga/desliga próprio, salvos no aparelho:
//   "jogo"  — Jogo de Pares (ligado por padrão)
//   "cards" — Cards, Frases e Escrita (ligado por padrão)
// Navegadores só tocam som depois de um toque na página; no iPhone o modo
// silencioso também corta os sons.
const Sons = (()=>{
  const KEYS = {jogo:"jp-sound-game", cards:"jp-sound-cards"};
  const DEFAULTS = {jogo:true, cards:true};
  let ctx = null;

  function audio(){
    if(!ctx){
      const C = window.AudioContext || window.webkitAudioContext;
      if(!C) return null;
      ctx = new C();
    }
    if(ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  // Uma nota curta com ataque e queda suaves (sem estalo no começo/fim).
  function tone(freq, start, dur, {type="sine", gain=0.15, to=null}={}){
    const c = audio(); if(!c) return;
    const t = c.currentTime + start;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if(to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }

  // "Fwip" de papel: ruído branco curto passando por um filtro que sobe.
  function swoosh(dur, {from=900, to=3200, gain=0.12}={}){
    const c = audio(); if(!c) return;
    const t = c.currentTime;
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for(let i=0; i<data.length; i++) data[i] = Math.random()*2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur*0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t); src.stop(t + dur + 0.02);
  }

  const SOUNDS = {
    acerto:   ()=>{ tone(880, 0, .12, {type:"triangle"}); tone(1320, .07, .2, {type:"triangle"}); },
    erro:     ()=>{ tone(196, 0, .24, {type:"square", gain:.06, to:130}); },
    tic:      ()=>{ tone(1600, 0, .035, {type:"square", gain:.045}); },
    tac:      ()=>{ tone(1150, 0, .035, {type:"square", gain:.045}); },
    fim:      ()=>{ [659, 523, 392].forEach((f,i)=> tone(f, i*.16, .3, {type:"triangle"})); },
    recorde:  ()=>{ [523, 659, 784, 1047].forEach((f,i)=> tone(f, i*.11, i===3 ? .45 : .22, {type:"triangle"})); },
    // Cards: bem discretos, para não cansar depois de muitas repetições.
    sabia:    ()=>{ tone(988, 0, .1, {gain:.08}); tone(1318, .05, .12, {gain:.06}); },
    praticar: ()=>{ tone(392, 0, .14, {gain:.07, to:330}); },
    virar:    ()=>{ swoosh(.16); },
  };

  function enabled(group){
    try{ const v = localStorage.getItem(KEYS[group]); return v === null ? DEFAULTS[group] : v === "1"; }
    catch(e){ return DEFAULTS[group]; }
  }
  function setEnabled(group, on){
    try{ localStorage.setItem(KEYS[group], on ? "1" : "0"); }catch(e){}
    if(on) audio(); // o toque no botão já libera o áudio
  }
  function play(group, name){
    if(!enabled(group)) return;
    try{ SOUNDS[name](); }catch(e){}
  }
  // Libera o áudio no primeiro toque, se algum grupo estiver ligado.
  document.addEventListener("pointerdown", ()=>{
    if(enabled("jogo") || enabled("cards")) audio();
  }, {once:true, capture:true});

  return {play, enabled, setEnabled};
})();
