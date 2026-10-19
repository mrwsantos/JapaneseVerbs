// Pronúncia das palavras e frases via Web Speech API do navegador — sem
// arquivos de áudio (não pesa no PWA, funciona com o app offline já aberto).
// A disponibilidade de voz japonesa varia MUITO por navegador/aparelho, então
// em vez de tentar falar e falhar calado, o botão 🔊 só aparece quando o
// navegador confirma ter alguma voz "ja*" instalada.
const TTS = (()=>{
  const synth = window.speechSynthesis || null;
  let voice = null;
  let waiting = [];

  function pickVoice(){
    const voices = synth.getVoices();
    const jp = voices.filter((v)=> /^ja/i.test(v.lang));
    if(!jp.length) return null;
    // Prefere voz de rede (geralmente mais natural) a uma local sintética.
    return jp.find((v)=> !v.localService) || jp[0];
  }
  function refresh(){
    if(!synth || voice) return;
    voice = pickVoice();
    if(voice){ waiting.forEach((fn)=> fn()); waiting = []; }
  }
  if(synth){
    refresh();
    synth.addEventListener("voiceschanged", refresh);
    // Em alguns navegadores (sobretudo mobile) "voiceschanged" não dispara a
    // tempo ou nunca dispara: tenta de novo nos primeiros segundos.
    [300, 800, 1500, 3000].forEach((ms)=> setTimeout(refresh, ms));
  }

  function available(){ return !!voice; }
  // Chama fn() quando souber que tem voz japonesa — na hora, se já sabia, ou
  // mais tarde, quando o navegador terminar de carregar as vozes. Útil para
  // mandar um render() de novo e o botão 🔊 aparecer sem precisar recarregar.
  function onReady(fn){ voice ? fn() : waiting.push(fn); }
  function speak(text){
    if(!synth || !voice || !text) return;
    try{
      synth.cancel(); // corta qualquer fala em andamento antes de começar a nova
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice.lang; u.voice = voice; u.rate = 0.9;
      synth.speak(u);
    }catch(e){}
  }
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  // Botão 🔊 pronto para entrar num template; só sai no HTML quando tem voz
  // disponível (ver `available`). `text` é o que vai ser falado.
  function btnHtml(text, extraClass){
    if(!available() || !text) return "";
    return `<button type="button" class="tts-btn ${extraClass||""}" data-tts="${esc(text)}" aria-label="Ouvir pronúncia" title="Ouvir pronúncia">🔊</button>`;
  }
  // Delegação: funciona para botões de qualquer render() futuro sem precisar
  // ligar onclick um por um. stopPropagation para não virar o card / escolher
  // uma alternativa quando o botão está dentro de outro elemento clicável.
  document.addEventListener("click", (e)=>{
    const btn = e.target.closest(".tts-btn");
    if(!btn) return;
    e.stopPropagation();
    speak(btn.dataset.tts);
  }, true);

  return {available, onReady, speak, btnHtml};
})();
