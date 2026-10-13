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
sons.js                 sons gerados no navegador (sem arquivos de áudio)
desenho.js              área de desenho + reconhecimento usados pela página Desenhar
estudadas.js            palavras em Praticando/Aprendido (libera Jogo e Desenhar)
lib/kanjicanvas/        reconhecimento de escrita (KanjiCanvas, MIT) + padrões
tools/gerar-padroes.mjs gera lib/kanjicanvas/padroes.js a partir dos dados
icons/, fonts/
```

- O botão de **casinha 🏠** no topo volta para a tela inicial; **動詞 Verbos | 形容詞 Adjetivos** troca de modo.
- O app lembra o último modo aberto e o tema (claro/escuro/automático).
- Todo o progresso fica salvo **no navegador do aparelho** (`localStorage`).
  Desinstalar o app ou limpar os dados do site apaga o progresso — use
  **⬇ Exportar progresso** para ter um backup. Fica no fim das abas "Todos os
  verbos" e "Todos os Adjetivos" — um arquivo por modo, e o app não deixa
  importar o backup de um modo no outro.

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
  em japonês, com a palavra destacada na cor do app, e embaixo, menor, a
  tradução. Os verbos usam a frase do modo Frases; as dos adjetivos ficam em
  `adjetivos/data.js` (`frase`/`frasePt`, palavra em destaque entre `[ ]`).
- Depois de virar, **arraste para a direita** = Sabia / Lembrei, **arraste para
  a esquerda** = Praticar mais / Não lembrei. Os botões embaixo fazem o mesmo.
- No teclado: **1** ou **←** = praticar, **2** ou **→** = sabia.
- A barra no topo mostra o progresso da rodada e quantas palavras faltam.

## ⚙️ Ajustes

O botão no canto (ex.: "日本語 → PT ⚙️") abre os ajustes do modo atual:

- **Direção** (Cards e Frases, vale para verbos e adjetivos):
  **日本語 → PT** mostra o japonês e você lembra o significado;
  **PT → 日本語** mostra o português e você lembra como se diz em japonês.
- **Cards**: palavras novas por dia, filtro (grupo do verbo / tipo de
  adjetivo) e modo teste.
- **Frases**: frases em kanji ou só em hiragana.
- **Escrita**: quais formas praticar.
- **🔊 Sons** (todos os modos): sons discretos ao responder. Começa ligado.

## Modo Cards (o principal)

A rodada do dia é: **revisões vencidas** + **um lote de até 10 palavras novas**.

- **Sabia** → sobe um nível e a palavra só volta depois do intervalo. Numa
  revisão (palavra que já passou do lote em dias anteriores), errar guarda
  ela para uma **rodada só das revisões erradas**: no fim das revisões
  ("Revendo 35/35") aparece **Continuar** e você repete só as que errou
  ("Revendo 1/3"), até zerar — só depois entram as palavras novas.
- **Praticar mais** → volta ao nível 0. Numa palavra do **lote** (nova, vista
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

Prática extra com as palavras em **Praticando** ou **Aprendido**, embaralhadas.

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

## Modo Frases (só verbos)

Frases de exemplo com o verbo, para lembrar o significado em contexto
(alternável entre kanji e hiragana). Cada acerto conta até 2; errar desce um
nível (sem sair de Praticando). São necessários **2 acertos** em Frases para
um verbo ficar **Aprendido**.

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

## Listas

As abas **Todos**, **Praticando** e **Aprendidos** mostram as palavras com
busca, filtro por nível JLPT (N5–N1) e os detalhes de cada palavra.

## Créditos

- Reconhecimento de escrita: [KanjiCanvas](https://github.com/asdfjkl/kanjicanvas)
  © Dominik Klein, licença MIT (`lib/kanjicanvas/LICENSE.TXT`).
