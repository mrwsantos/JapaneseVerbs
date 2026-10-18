// Botão de configurações (engrenagem) no topo das páginas: abre uma mini
// lista com o tema (Claro/Escuro) e o backup (baixar/importar, ver backup.js).
// Uso: um <button id="settingsBtn"> no header + Config.init().
// O tema fica em "jp-theme" (o mesmo que as páginas leem ao abrir).
const Config = (()=>{
  const THEME_KEY = "jp-theme";
  const CSS = `
.cfg-pop{position:fixed;z-index:1000;width:min(280px,calc(100vw - 28px));background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:18px;box-shadow:0 12px 40px rgba(20,10,50,.22);padding:14px;text-align:left;
  transform-origin:top right;opacity:0;transform:scale(.92) translateY(-6px);pointer-events:none;visibility:hidden;transition:opacity .16s ease,transform .2s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .2s}
.cfg-pop.open{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition-delay:0s}
.cfg-pop h3{margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--sub);font-weight:700}
.cfg-pop h3:not(:first-child){margin-top:16px}
.cfg-seg{position:relative;display:grid;grid-template-columns:1fr 1fr;background:var(--chip);border-radius:12px;padding:3px}
.cfg-seg input{position:absolute;opacity:0;pointer-events:none}
.cfg-seg label{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 6px;border-radius:9px;font-size:13px;font-weight:700;color:var(--sub);cursor:pointer;transition:color .2s ease}
.cfg-seg input:checked + label{color:#fff}
.cfg-seg input:focus-visible + label{outline:2px solid var(--accent,#6b47ea);outline-offset:2px}
.cfg-seg .cfg-thumb{position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 3px);border-radius:9px;background:var(--accent,#6b47ea);box-shadow:0 2px 8px rgba(0,0,0,.18);transition:transform .28s cubic-bezier(.34,1.56,.64,1)}
.cfg-seg.dark .cfg-thumb{transform:translateX(100%)}
.cfg-seg .cfg-ico{display:inline-block;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.cfg-seg input:checked + label .cfg-ico{transform:rotate(-20deg) scale(1.15)}
.cfg-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border-radius:12px;background:none;border:none;color:var(--text);font:inherit;font-size:13px;font-weight:600;text-align:left;cursor:pointer;transition:background-color .15s ease}
.cfg-btn:hover{background:var(--chip)}
.cfg-btn .cfg-i{width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:9px;background:var(--chip);font-size:15px}
.cfg-btn small{display:block;font-size:11px;font-weight:400;color:var(--sub);margin-top:1px}
.settings-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border-radius:11px;background:var(--chip);color:var(--sub)}
.settings-btn svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.settings-btn[aria-expanded="true"]{background:var(--accent,#6b47ea);color:#fff}
.settings-btn[aria-expanded="true"] svg{transform:rotate(60deg)}
@media (prefers-reduced-motion: reduce){ .cfg-pop,.cfg-seg .cfg-thumb,.cfg-seg .cfg-ico,.settings-btn svg{transition:none} }`;
  const GEAR = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

  // Tema em uso: o escolhido, ou o do sistema enquanto nunca escolheu ("auto").
  function current(){
    const t = document.documentElement.getAttribute("data-theme");
    if(t === "light" || t === "dark") return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function setTheme(mode){
    document.documentElement.setAttribute("data-theme", mode);
    try{ localStorage.setItem(THEME_KEY, mode); }catch(e){}
    const seg = document.querySelector(".cfg-seg");
    if(seg) seg.classList.toggle("dark", mode === "dark");
  }

  function init(){
    const btn = document.getElementById("settingsBtn");
    if(!btn || btn.dataset.cfg) return;
    btn.dataset.cfg = "1";
    if(!document.getElementById("cfgCss")){
      const st = document.createElement("style"); st.id = "cfgCss"; st.textContent = CSS; document.head.appendChild(st);
    }
    btn.innerHTML = GEAR;
    btn.classList.add("settings-btn");
    btn.setAttribute("aria-label", "Configurações");
    btn.title = "Configurações";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");

    const pop = document.createElement("div");
    pop.className = "cfg-pop"; pop.id = "cfgPop";
    pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Configurações");
    const hasBackup = typeof Backup !== "undefined";
    pop.innerHTML = `<h3>Tema</h3>
      <div class="cfg-seg" role="radiogroup" aria-label="Tema">
        <span class="cfg-thumb" aria-hidden="true"></span>
        <input type="radio" name="cfgTheme" id="cfgLight" value="light"><label for="cfgLight"><span class="cfg-ico">☀️</span>Claro</label>
        <input type="radio" name="cfgTheme" id="cfgDark" value="dark"><label for="cfgDark"><span class="cfg-ico">🌙</span>Escuro</label>
      </div>
      ${hasBackup ? `<h3>Progresso</h3>
      <button type="button" class="cfg-btn" id="cfgExport"><span class="cfg-i">⬇</span><span>Baixar progresso<small>um arquivo com tudo do app</small></span></button>
      <button type="button" class="cfg-btn" id="cfgImport"><span class="cfg-i">⬆</span><span>Importar backup<small>substitui o progresso deste aparelho</small></span></button>
      <input type="file" id="cfgFile" accept="application/json,.json" style="display:none">` : ""}`;
    document.body.appendChild(pop);

    const sync = ()=>{
      const t = current();
      pop.querySelector("#cfgLight").checked = t === "light";
      pop.querySelector("#cfgDark").checked = t === "dark";
      pop.querySelector(".cfg-seg").classList.toggle("dark", t === "dark");
    };
    pop.querySelectorAll('input[name="cfgTheme"]').forEach((r)=> r.onchange = ()=> setTheme(r.value));
    if(hasBackup){
      const file = pop.querySelector("#cfgFile");
      pop.querySelector("#cfgExport").onclick = ()=>{ close(); Backup.exportAll(); };
      pop.querySelector("#cfgImport").onclick = ()=> file.click();
      file.onchange = ()=>{ const f = file.files[0]; file.value = ""; close(); Backup.importFile(f); };
    }

    const place = ()=>{
      const r = btn.getBoundingClientRect();
      pop.style.top = (r.bottom + 8) + "px";
      pop.style.right = Math.max(14, innerWidth - r.right) + "px";
    };
    function open(){ sync(); place(); pop.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    function close(){ pop.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    btn.onclick = (e)=>{ e.stopPropagation(); pop.classList.contains("open") ? close() : open(); };
    document.addEventListener("click", (e)=>{ if(pop.classList.contains("open") && !pop.contains(e.target)) close(); });
    document.addEventListener("keydown", (e)=>{ if(e.key === "Escape" && pop.classList.contains("open")){ close(); btn.focus(); } });
    addEventListener("resize", ()=>{ if(pop.classList.contains("open")) place(); });
    addEventListener("scroll", ()=>{ if(pop.classList.contains("open")) place(); }, {passive: true});
    sync();
  }
  return {init, setTheme, current};
})();
