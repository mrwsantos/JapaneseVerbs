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
- Filtros: verbos por grupo (1, 2, 3), adjetivos por tipo (い / な).
- **Modo teste** zera os intervalos (tudo volta na hora) — útil só para testar.

> Repetir no mesmo dia uma palavra que você já acertou não ajuda a memorizar; o
> que fixa é revisar depois de alguns dias. Por isso só os **erros** voltam na
> mesma rodada.

## Modo Escrita

Prática extra com as palavras em **Praticando** ou **Aprendido**, embaralhadas.

- Aparece a frase **em português** já conjugada (ex.: "não comeu", "não era
  grande") e você escreve em japonês — vale romaji, hiragana, katakana ou kanji.
- Filtros: Informal / Formal, Passado, Negativo ou 🎲 Embaralhado.
- Acertou → sobe um nível. Errou → desce um nível, mas **nunca abaixo de
  Praticando** (escrita é treino extra, não te faz "desaprender").

## Modo Frases (só verbos)

Frases de exemplo com o verbo, para lembrar o significado em contexto
(alternável entre kanji e hiragana). Cada acerto conta até 2; errar desce um
nível (sem sair de Praticando). São necessários **2 acertos** em Frases para
um verbo ficar **Aprendido**.

## Listas

As abas **Todos**, **Praticando** e **Aprendidos** mostram as palavras com
busca, filtro por nível JLPT (N5–N1) e os detalhes de cada palavra.
