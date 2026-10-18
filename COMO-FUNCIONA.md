# Japonês SRS — como o app funciona

App (PWA) para estudar **verbos** (動詞) e **adjetivos** (形容詞) japoneses com
repetição espaçada (SRS). É um app só: instale uma vez e troque de modo pelo
seletor no topo.

## Estrutura

```
index.html              tela inicial (abre direto o último modo usado)
manifest.json, sw.js    PWA: instalação e funcionamento offline
verbos/verbos.html      app de verbos      (dados em verbos/data.js)
adjetivos/adjetivos.html app de adjetivos  (dados em adjetivos/data.js)
jogo/jogo.html          jogo de pares (usa os dados dos dois apps)
desenho/desenho.html    treino de escrita à mão (não mexe no progresso)
estatisticas/estatisticas.html  página de estatísticas (botão de gráfico no topo)
historico.js            histórico de respostas e datas para as estatísticas
backup.js               exportar/importar o app inteiro num arquivo só
config.js               botão de configurações (tema + backup) no topo das páginas
sons.js                 sons gerados no navegador (sem arquivos de áudio)
desenho.js              área de desenho + reconhecimento usados pela página Desenhar
estudadas.js            palavras em Praticando/Aprendido (libera Jogo e Desenhar)
lib/kanjicanvas/        reconhecimento de escrita (KanjiCanvas, MIT) + padrões
tools/gerar-padroes.mjs gera lib/kanjicanvas/padroes.js a partir dos dados
icons/, fonts/
```

- O botão de **casinha 🏠** no topo volta para a tela inicial; **動詞 Verbos | 形容詞 Adjetivos** troca de modo.
- A **engrenagem ⚙️** no topo (direita) abre as configurações: tema
  **Claro/Escuro** e **Baixar progresso / Importar progresso** (`config.js`).
  Até escolher um tema, o app segue o do sistema.
- O app lembra o último modo aberto e o tema.
- Todo o progresso fica salvo **no navegador do aparelho** (`localStorage`).
  Desinstalar o app ou limpar os dados do site apaga o progresso — use
  **Baixar progresso** (na engrenagem ⚙️) para ter uma cópia. É **um arquivo só**
  (`backup.js`) com todas as chaves do app (`jp-*`, `jpverbs-*`, `jpadj-*`):
  progresso de verbos e adjetivos, histórico das estatísticas, estatística da
  Escrita, decks em andamento, recorde do jogo e preferências.
  **Importar progresso** substitui tudo e recarrega o app; também
  aceita os backups antigos de um modo só (só troca o progresso daquele modo).

## Níveis e intervalos

Cada palavra tem um **nível** de 0 a 6. Cada nível define em quantos dias ela
volta para revisão:

| Nível     | 0    | 1     | 2      | 3      | 4       | 5       | 6       |
|-----------|------|-------|--------|--------|---------|---------|---------|
| Volta em  | hoje | 1 dia | 3 dias | 7 dias | 14 dias | 30 dias | 60 dias |

| Status          | Regra                                                                 |
|-----------------|-----------------------------------------------------------------------|
| **Novo**        | nível 0 ou 1                                                          |
| **Praticando**  | nível 2 ou 3 (verbos: também nível 4+ sem 2 acertos em Frases)        |
| **Aprendido**   | nível 4+ (verbos: e 2 acertos no modo Frases)                         |

Uma palavra nova precisa de **2 acertos em dias diferentes** para chegar em
Praticando (acerta hoje → nível 1, volta amanhã → acerta → nível 2).

## Como estudar um card

Funciona como no Anki/Quizlet:

- **Toque** no card (ou **Espaço**) para virar e ver a resposta. Depois de
  virado ele **não desvira** (nada de espiar a frente de novo).
- No verso, **Ver numa frase** estica o card para baixo com um exemplo: a frase
  em japonês, com a palavra destacada na cor do app, a mesma frase em
  hiragana e embaixo, menor, a tradução. Os verbos usam a frase do modo Frases; as dos adjetivos ficam em
  `adjetivos/data.js` (`frase`/`fraseKana`/`frasePt`, palavra em destaque entre `[ ]`).
- Depois de virar, **arraste para a direita** = Sabia / Lembrei, **arraste para
  a esquerda** = Praticar mais / Não lembrei. Os botões embaixo fazem o mesmo.
- No teclado: **1** ou **←** = praticar, **2** ou **→** = sabia.
- A barra no topo mostra o progresso da rodada e quantas palavras faltam.

## ⚙️ Ajustes

O botão no canto (ex.: "JP → PT ⚙️") abre os ajustes do modo atual:

- **Direção** (Cards e Frases, vale para verbos e adjetivos):
  **JP → PT** mostra o japonês e você lembra o significado;
  **PT → JP** mostra o português e você lembra como se diz em japonês.
- **Cards**: palavras novas por dia, filtro (grupo do verbo / tipo de
  adjetivo) e modo teste.
- **Frases**: frases em kanji ou só em hiragana.
- **Escrita**: quais formas praticar.
- **🔊 Sons** (todos os modos): sons discretos ao responder. Começa ligado.

## Modo Cards (o principal)

A rodada do dia é: **revisões vencidas** (até 30 por dia) + **um lote de até 10
palavras novas**.

**Para a pilha não acumular** quando você fica dias sem abrir o app:

- **No máximo 30 revisões por dia**, primeiro as de nível mais baixo e mais
  atrasadas. O resto fica para os próximos dias; no fim aparece "Ainda há N
  revisões atrasadas" e o botão **+15 revisões agora** para quem quiser mais.
- **Palavras novas pausam** enquanto houver mais de 30 revisões pendentes
  (botão **Estudar novas mesmo assim** para forçar).
- **Errar uma revisão desce 2 níveis** em vez de zerar (ex.: nível 4 → 2,
  continua em Praticando). Só a 1ª resposta do dia mexe no nível: repetir a
  mesma revisão no mesmo dia não sobe nem desce.
- Constantes em `REVIEW_LIMIT`, `NEW_PAUSE_AT` e `REVIEW_EXTRA` nos apps; o
  contador do dia fica em `jpverbs-reviews-today` / `jpadj-reviews-today`.

- **Sabia** → sobe um nível e a palavra só volta depois do intervalo. Numa
  revisão (palavra que já passou do lote em dias anteriores), errar guarda
  ela para uma **rodada só das revisões erradas**: no fim das revisões
  ("Revendo 35/35") aparece **Continuar** e você repete só as que errou
  ("Revendo 1/3"), até zerar — só depois entram as palavras novas.
- **Praticar mais** → numa revisão, desce 2 níveis (ver acima). Numa palavra do **lote** (nova, vista
  por 1ª vez hoje), ela não volta na hora: continua no mesmo passe pelas
  outras 9, e só reaparece depois, num lote menor só com as que você errou
  (ver "Lotes de 10" abaixo).
- **✓ Já sei essa** (em qualquer palavra ainda em Novo, mesmo depois de errar)
  → vai direto para **Aprendido** e só volta na revisão de 14 dias. Se errar
  nessa revisão, recomeça do zero. Se a palavra nunca tinha sido respondida, não
  gasta o limite do dia: outra palavra nova (a mais comum disponível) entra no
  lugar.
- **Lotes de 10**: as palavras novas entram em lotes fixos de 10, das mais
  comuns para as mais raras (veja "Popularidade" abaixo). Você passa pelas 10
  uma vez (a barra mostra **"X/10"** — a posição da carta atual dentro do
  lote). No fim do passe, se errou alguma, aparece **Continuar**: um novo
  passe, menor, só com as que errou (ex.: "3/3"). Repete até não restar
  nenhuma errada — só então aparece **Próximo lote (10 novas)**, desde que
  ainda caiba no limite diário. O "X/10" não aparece durante revisões
  (palavras de lotes de dias anteriores) — só durante um passe de lote.
- **Novas por dia**: fixo em 20 (2 lotes de 10) — não é mais escolhido pelo
  usuário nos Ajustes. É o total de palavras novas (somando todos os lotes)
  permitido por dia; vale para verbos e adjetivos, mas cada um conta as suas
  novas separadamente. Se bater o limite e ainda tiver palavras novas, aparece
  **+10 novas** para abrir uma folga extra só para hoje.
  > **Decisão (2026-10-13):** antes dava pra escolher 10/20/30/50/sem limite.
  > Virou fixo porque, com as novas entrando em lotes de 10, o botão
  > "Próximo lote" já controla o ritmo — o seletor de limite diário ficou
  > redundante. Se um dia fizer falta escolher outro valor, está tudo no
  > histórico do git (procure por `NEW_LIMIT_OPTIONS`/`setNewLimit` nos commits
  > de `verbos.html`/`adjetivos.html`) para reabilitar.
- Filtros (nos Ajustes): verbos por grupo (1, 2, 3), adjetivos por tipo (い / な).
- **Modo teste** (nos Ajustes) zera os intervalos (tudo volta na hora) — útil só
  para testar.

### Popularidade (`freq`)

Cada verbo/adjetivo tem em `data.js` uma propriedade `freq` de 1 (muito comum)
a 4+ (mais raro), estimada à mão por frequência de uso no dia a dia —
independente do nível JLPL (`nivel`), já que uma palavra N3 pode ser mais usada
no cotidiano que uma N5. Essa propriedade só decide a **ordem de entrada** das
palavras novas dentro do pool filtrado (grupo/tipo); ela nunca reordena o array
nem muda o `id` (que é a posição no array e é o que guarda o progresso salvo),
então dá pra editar os valores de `freq` livremente sem perder progresso.

> Repetir no mesmo dia uma palavra que você já acertou não ajuda a memorizar; o
> que fixa é revisar depois de alguns dias. Por isso só os **erros** voltam na
> mesma rodada.

## Modo Escrita

Prática extra com as palavras em **Praticando** ou **Aprendido**, embaralhadas
em **decks de 10** ("Deck 3/10" no topo).

- **Romaji vira hiragana enquanto você digita** (taberu → たべる, kka → っか,
  nn ou n + consoante → ん, "-" → ー). Também dá para digitar kana ou kanji
  direto. Vale também no Frases (modo Digitar). Lógica em `escrita.js`.
- **Errou, a palavra volta no fim do deck** até você acertar todas.
- **Desistir** mostra a resposta, conta como erro e tira a palavra deste deck:
  ela entra no fim do próximo deck.
- **No fim de cada deck** aparece a estatística: acertos de primeira, erros por
  característica da forma (formal/informal, passado/presente,
  negativo/afirmativo), o tipo de erro (trocou a forma ou errou a conjugação),
  erros por grupo, as palavras que você errou e uma **sugestão** do que treinar.
  Com formas variadas, o botão **Próximo deck só com essa forma** fixa a forma
  em que você mais errou. O histórico geral fica salvo no aparelho.
- Ao errar, o app mostra o que você escreveu e, se for outra forma da mesma
  palavra, qual forma era.
- **Filtro de grupo** (nos Ajustes): verbos por Grupo 1/2/3, adjetivos por
  -i/-na. A estatística mostra os erros por grupo e, com grupos misturados,
  oferece **Próximo deck só com <grupo>** para o que você mais errou.

- Aparece a frase **em português** já conjugada (ex.: "não comeu", "não era
  grande") e você escreve em japonês — vale romaji, hiragana, katakana ou kanji.
- Formas (nos Ajustes): Informal / Formal, Passado, Negativo ou 🎲 Embaralhado.
- Não muda com a Direção: aqui é sempre português → você escreve em japonês.
- Acertou → sobe um nível. Errou → desce um nível, mas **nunca abaixo de
  Praticando** (escrita é treino extra, não te faz "desaprender").

## 🔒 Jogo e Desenhar liberam com 3 palavras

O Jogo de Pares e o Desenhar ficam **bloqueados até você ter pelo menos 3
palavras em Praticando ou Aprendido** (verbos e adjetivos somados). Na tela
inicial os botões mostram 🔒 e quantas faltam (ex.: 1/3). A regra fica em
`estudadas.js` (`MIN`).

## ✍️ Desenhar

Página própria (botão na tela inicial), separada dos apps de verbos e
adjetivos: usa as palavras (verbos e adjetivos) que você já está **praticando**
ou **aprendeu**, em ordem aleatória, e **não mexe no progresso** do SRS. O placar
(acertos e sequência) vale só para a sessão.

- Aparece o significado em português e você **desenha a palavra em japonês,
  uma letra por vez**, na área quadriculada. Vale kanji (話す) ou só kana (はなす).
- A cada traço o app mostra as letras mais parecidas. Quando reconhece a letra
  esperada e você para de desenhar, ela **entra sozinha**; também dá para tocar
  numa das sugestões.
- ↶ desfaz o último traço, 🗑 limpa o desenho, ⌫ apaga a última letra.
- Completou a palavra certa → acerto automático. **Conferir** encerra com o que
  foi escrito; **Não sei** mostra a resposta.
- Se o reconhecimento errar, toque em **✓ Eu escrevi certo** (conta como acerto
  no placar da sessão).
- Funciona offline. Reconhece mesmo com ordem de traços diferente, mas não
  distingue letra pequena (ゃ) de grande (や) — as duas valem.
- Kanji sem padrão de reconhecimento (嬉 眩 綺 賑): escreva essas palavras em kana.
- Ao adicionar palavras com kanji novos, rode `tools/gerar-padroes.mjs` (instruções
  no próprio arquivo).

## Modo Frases (verbos e adjetivos)

Exercício com as palavras em **Praticando** ou **Aprendido**: aparece a frase
de exemplo em japonês com uma **lacuna** onde vai a palavra **já conjugada**, e
a tradução em português embaixo (com a parte que muda destacada).

- Etiquetas mostram a forma pedida: **Formal/Informal**, **Presente/Passado**,
  **Afirmativo/Negativo** (ex.: 友達と＿＿。 "Não falei com o amigo." →
  話さなかった).
- **Alternativas** (padrão): 4 opções, teclas 1–4. Uma delas costuma ser a
  mesma palavra em outra forma (treina a conjugação), as outras são palavras
  diferentes na mesma forma (nunca com o mesmo significado).
- **Digitar** (nos Ajustes): escreva a forma em romaji, kana ou kanji.
- Cada palavra aparece uma vez por rodada; **errou, ela volta no fim da
  rodada** (com outra frase/forma sorteada) até acertar. No fim, **Recomeçar**
  embaralha tudo de novo.
- **Conjugação** (nos Ajustes): 🎲 Variada (padrão) ou Só presente.
- Começa **só em hiragana** (frase e alternativas). O botão **Ver em kanji** no
  card troca para kanji (a leitura em hiragana aparece depois de responder); vale para os dois apps
  e fica salvo (também nos Ajustes).
- **3 frases por palavra**: a cada vez uma é sorteada (`frasesExtra` nos
  `data.js`). O progresso é por palavra, não por frase.
- Frases no futuro (明日, 来年) não vão para o passado; nos adjetivos, frases com
  とても/少し/いつも/一番 ou causa (て + adjetivo) não vão para o negativo. Adjetivo no meio da frase
  (ex.: [小さい]犬) fica sem conjugar.
- **Verbos**: cada acerto conta até 2; errar desce um nível (sem sair de
  Praticando). São necessários **2 acertos** em Frases para um verbo ficar
  **Aprendido**.
- **Adjetivos**: igual à Escrita (acerto sobe um nível, erro desce sem sair de
  Praticando).
- A lógica comum fica em `frases.js`; cada app só informa como conjugar e
  traduzir as suas frases.

## 🎮 Jogo de Pares

Página própria (botão na tela inicial). Português de um lado, japonês do
outro, 5 pares por vez:

- Começa com **10 segundos**; cada par certo dá **+2s** e as casas usadas
  recebem palavras novas.
- Só entram verbos e adjetivos que você já está **praticando** ou **aprendeu**
  (com poucas palavras, aparecem menos pares na tela).
- Palavras com o mesmo sentido (ex.: 危ない e 危険, "perigoso") nunca aparecem
  juntas, para o par nunca ficar ambíguo.
- Errar não tira tempo, mas o relógio continua correndo. O recorde fica salvo.
- **🔥 Modo HARD**: com **10 acertos seguidos** aparece "Acertou 10!", você ganha
  **+4s** extras (além dos +2s do par), a tela fica vermelha/escura e o kana some (fica só o kanji). Errou, volta ao normal e a
  contagem recomeça. O contador 🔥 x/10 fica embaixo dos pontos.
- Sons de acerto, erro, fim e recorde, e tic-tac nos últimos 3 segundos
  (cada vez mais rápido). O botão 🔊/🔇 no topo liga e desliga.
- O jogo não mexe no seu progresso do SRS.

## 📊 Estatísticas

O botão de **gráfico** no canto de cima à direita (tela inicial, verbos e
adjetivos) abre a página do seu aprendizado, em 4 abas: **Resumo**, **Domínio**,
**Treino** e **Dicas**:

- **Continue assim**: quantas palavras você domina e uma previsão de quando
  domina os verbos N5, os adjetivos N5 e o N5 todo. Usa o seu ritmo real
  (palavras novas começadas por dia nos últimos 14 dias) + ~12 dias de
  revisões até Aprendido; antes de 3 dias de histórico, supõe 10 novas por dia.
- **Esta semana**: aprendidas, entraram em Praticando, novas começadas,
  respostas e % de acerto (com ↑/↓ contra a semana anterior), sequência de dias.
- **Atividade** dos últimos 14 dias, **domínio por nível JLPT**, **Geral**
  (verbos/adjetivos e por grupo: G1/G2/G3, -i/-na), **acerto por modo**
  (Cards, Frases, Escrita), **revisões** de hoje e dos próximos 7 dias,
  **palavras que mais travam** e **dicas** geradas pelos seus números.

O histórico (`jp-historico-v1`, em `historico.js`) começa a contar quando a
página foi criada: o que já estava no progresso antes entra como "antes" e não
conta como "essa semana". Progresso importado também não.

## Listas

As abas **Todos**, **Praticando** e **Aprendidos** mostram as palavras com
busca, filtro por nível JLPT (N5–N1) e os detalhes de cada palavra.

## Créditos

- Reconhecimento de escrita: [KanjiCanvas](https://github.com/asdfjkl/kanjicanvas)
  © Dominik Klein, licença MIT (`lib/kanjicanvas/LICENSE.TXT`).
