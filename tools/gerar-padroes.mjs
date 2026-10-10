// Gera lib/kanjicanvas/padroes.js: os padrões de traço que o modo Desenhar usa
// para reconhecer a letra desenhada.
//
// O KanjiCanvas original traz 2.213 kanji (6,4 MB) e nenhum kana. Aqui juntamos:
//   - hiragana e katakana (XMLs das pastas hiragana/ e katakana/ do repositório)
//   - só os kanji que aparecem em verbos/data.js e adjetivos/data.js
// e convertemos com as mesmas funções do kanji-canvas.js usadas no navegador.
//
// Rode de novo sempre que adicionar palavras com kanji novos:
//   1. Baixe https://github.com/asdfjkl/kanjicanvas (ref-patterns.js em
//      docs/resources/javascript/ e as pastas hiragana/ e katakana/)
//   2. node tools/gerar-padroes.mjs <ref-patterns.js> <pasta hiragana> <pasta katakana>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const [refPath, hiraDir, kataDir] = process.argv.slice(2);
if(!refPath || !hiraDir || !kataDir){
  console.error("uso: node tools/gerar-padroes.mjs <ref-patterns.js> <pasta hiragana> <pasta katakana>");
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Carrega o kanji-canvas.js num "window" de mentira, só para usar as funções.
const ctx = {document: {addEventListener(){}}};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "lib/kanjicanvas/kanji-canvas.js"), "utf8"), ctx);
const KC = ctx.KanjiCanvas;

// Kanji usados pelo app.
const data = {};
vm.runInNewContext(
  fs.readFileSync(path.join(root, "verbos/data.js"), "utf8") + ";" +
  fs.readFileSync(path.join(root, "adjetivos/data.js"), "utf8") + ";out.v = VERBS_RAW; out.a = ADJ_RAW;",
  {out: data});
const isKanji = (c)=> /\p{Script=Han}/u.test(c);
const needed = new Set();
for(const w of [...data.v, ...data.a]) for(const c of w.kanji) if(isKanji(c)) needed.add(c);

// Kanji: já vêm convertidos no ref-patterns.js original.
vm.runInContext(fs.readFileSync(refPath, "utf8"), ctx);
const kanji = KC.refPatterns.filter((p)=> needed.has(p[0]));
const missing = [...needed].filter((c)=> !kanji.some((p)=> p[0]===c));

// Kana: converte os XMLs (traços em coordenadas cruas) como o navegador faz.
function kanaPatterns(dir){
  return fs.readdirSync(dir).filter((f)=> f.endsWith(".xml")).sort().map((f)=>{
    const xml = fs.readFileSync(path.join(dir, f), "utf8");
    const strokes = [...xml.matchAll(/<stroke>([\s\S]*?)<\/stroke>/g)].map((m)=>
      [...m[1].matchAll(/x="(-?\d+)"\s+y="(-?\d+)"/g)].map((p)=> [+p[1], +p[2]])).filter((s)=> s.length);
    KC["recordedPattern_gen"] = strokes;
    const features = KC.extractFeatures(KC.momentNormalize("gen"), 20.);
    return [String.fromCodePoint(parseInt(f, 16)), strokes.length, features];
  });
}
const kana = [...kanaPatterns(hiraDir), ...kanaPatterns(kataDir)];

const round = (pat)=> pat.map((s)=> s.map(([x, y])=> [Math.round(x*10)/10, Math.round(y*10)/10]));
const all = [...kana, ...kanji].map(([c, n, p])=> [c, n, round(p)]);
const out =
`// GERADO por tools/gerar-padroes.mjs — não edite à mão.
// Padrões de traço do KanjiCanvas (c) Dominik Klein — https://github.com/asdfjkl/kanjicanvas
// ${kana.length} kana + ${kanji.length} kanji usados pelo app.
KanjiCanvas.refPatterns = ${JSON.stringify(all)};
`;
fs.writeFileSync(path.join(root, "lib/kanjicanvas/padroes.js"), out);
console.log(`ok: ${kana.length} kana + ${kanji.length} kanji, ${(out.length/1024).toFixed(0)} KB`);
if(missing.length) console.log(`kanji sem padrão (só dá para desenhar em kana): ${missing.join("")}`);
