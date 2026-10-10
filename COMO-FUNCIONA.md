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
sons.js                 sons gerados no navegador (sem arquivos de áudio)
icons/, fonts/
```

- **⌂** no topo volta para a tela inicial; **動詞 Verbos | 形容詞 Adjetivos** troca de modo.
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

- **Toque** no card (ou **Espaço**) para virar e ver a resposta. Toque de novo
  para espiar a frente.
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

A rodada do dia é: **revisões vencidas** + **palavras novas até o limite diário**.

- **Sabia** → sobe um nível e a palavra só volta depois do intervalo.
- **Praticar mais** → volta ao nível 0 e **volta no fim da rodada** (depois das
  outras palavras do dia), até você acertar.
- **✓ Já sei essa** (em qualquer palavra ainda em Novo, mesmo depois de errar)
  → vai direto para **Aprendido** e só volta na revisão de 14 dias. Se errar
  nessa revisão, recomeça do zero. Se a palavra nunca tinha sido respondida, não
  gasta o limite do dia: outra palavra nova entra no lugar.
- **Novas por dia**: 10, 20 (padrão), 30, 50 ou sem limite. O limite vale para
  verbos e adjetivos, mas cada um conta as suas novas separadamente.
- Acabou a rodada e ainda tem palavras novas? Toque em **+10 novas** para
  continuar estudando.
- Filtros (nos Ajustes): verbos por grupo (1, 2, 3), adjetivos por tipo (い / な).
- **Modo teste** (nos Ajustes) zera os intervalos (tudo volta na hora) — útil só
  para testar.

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
  (precisa de pelo menos 6; se não tiver, dá para jogar com as palavras N5).
- Palavras com o mesmo sentido (ex.: 危ない e 危険, "perigoso") nunca aparecem
  juntas, para o par nunca ficar ambíguo.
- Errar não tira tempo, mas o relógio continua correndo. O recorde fica salvo.
- Sons de acerto, erro, fim e recorde, e tic-tac nos últimos 3 segundos
  (cada vez mais rápido). O botão 🔊/🔇 no topo liga e desliga.
- O jogo não mexe no seu progresso do SRS.

## Listas

As abas **Todos**, **Praticando** e **Aprendidos** mostram as palavras com
busca, filtro por nível JLPT (N5–N1) e os detalhes de cada palavra.
