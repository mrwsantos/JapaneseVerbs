// Dados do treino de partículas.
// PARTICLES: guia de cada partícula. near = com quais ela costuma ser confundida
// (viram as alternativas erradas).
// PARTICLE_ITEMS: [frase, frase em kana, português, explicação, aceitas?]. A
// partícula certa fica entre [ ]; "aceitas" são outras que também valeriam na
// frase e por isso nunca entram como alternativa errada.
const PARTICLES = [
  {p:"は", romaji:"wa", name:"Assunto da frase", use:"Diz sobre o que você vai falar. Lê-se \"wa\".", ex:"私は学生です。", exPt:"Eu sou estudante.", near:["が","も","を"]},
  {p:"が", romaji:"ga", name:"Sujeito", use:"Marca quem faz ou o que existe, o que se gosta, e quem responde a 誰/何.", ex:"猫がいます。", exPt:"Tem um gato.", near:["は","を","に"]},
  {p:"を", romaji:"o", name:"Objeto", use:"Marca o que recebe a ação, ou o caminho percorrido. Lê-se \"o\".", ex:"水を飲みます。", exPt:"Bebo água.", near:["が","に","で"]},
  {p:"に", romaji:"ni", name:"Destino, hora, onde está", use:"Para onde vai, a que horas, onde algo existe e para quem.", ex:"七時に起きます。", exPt:"Acordo às sete.", near:["で","を","へ"]},
  {p:"で", romaji:"de", name:"Lugar da ação, meio", use:"Onde a ação acontece e com o que ela é feita.", ex:"駅で待ちます。", exPt:"Espero na estação.", near:["に","を","が"]},
  {p:"へ", romaji:"e", name:"Direção", use:"Para que lado vai. Quase igual a に em frases de ir. Lê-se \"e\".", ex:"日本へ行きます。", exPt:"Vou para o Japão.", near:["を","で","と"]},
  {p:"と", romaji:"to", name:"Com, e", use:"Com quem se faz algo, ou liga duas coisas de uma lista.", ex:"友達と話します。", exPt:"Falo com um amigo.", near:["に","で","も"]},
  {p:"も", romaji:"mo", name:"Também", use:"Entra no lugar de は, が ou を e significa \"também\".", ex:"私も行きます。", exPt:"Eu também vou.", near:["は","が","と"]},
  {p:"の", romaji:"no", name:"De (posse, ligação)", use:"Liga duas palavras: a primeira explica a segunda.", ex:"私の本です。", exPt:"É o meu livro.", near:["は","と","に"]},
  {p:"から", romaji:"kara", name:"Desde, de", use:"Ponto de partida, no tempo ou no espaço.", ex:"九時から働きます。", exPt:"Trabalho a partir das nove.", near:["まで","で","に"]},
  {p:"まで", romaji:"made", name:"Até", use:"Ponto final, no tempo ou no espaço.", ex:"五時まで働きます。", exPt:"Trabalho até as cinco.", near:["から","に","で"]},
  {p:"か", romaji:"ka", name:"Pergunta", use:"No fim da frase, transforma em pergunta.", ex:"学生ですか。", exPt:"Você é estudante?", near:["も","は","が"]},
];
const PARTICLE_ITEMS = [
  ["私[は]学生です。","わたし[は]がくせいです。","Eu sou estudante.","は apresenta o assunto: \"sobre mim: sou estudante\"."],
  ["今日[は]休みです。","きょう[は]やすみです。","Hoje é folga.","は marca do que se fala: o dia de hoje."],
  ["この本[は]高いです。","このほん[は]たかいです。","Este livro é caro.","は apresenta o assunto, e o resto da frase comenta sobre ele."],
  ["父[は]医者です。","ちち[は]いしゃです。","Meu pai é médico.","\"X は Y です\": dizer o que X é. O assunto leva は."],

  ["机の下に猫[が]います。","つくえのしたにねこ[が]います。","Tem um gato embaixo da mesa.","Com います/あります, o que existe leva が."],
  ["私は犬[が]好きです。","わたしはいぬ[が]すきです。","Gosto de cachorro.","好き pede が naquilo de que se gosta, não を."],
  ["誰[が]来ましたか。","だれ[が]きましたか。","Quem veio?","Com 誰 ou 何 como sujeito, é sempre が, nunca は."],
  ["雨[が]降っています。","あめ[が]ふっています。","Está chovendo.","Para contar algo que se vê acontecendo, o sujeito leva が."],
  ["今日は時間[が]ありません。","きょうはじかん[が]ありません。","Hoje não tenho tempo.","\"Ter\" em japonês é \"existir\": o que se tem leva が com あります."],

  ["水[を]飲みます。","みず[を]のみます。","Bebo água.","を marca o que recebe a ação: o que se bebe."],
  ["本[を]読みます。","ほん[を]よみます。","Leio um livro.","を marca o que recebe a ação: o que se lê."],
  ["手紙[を]書きます。","てがみ[を]かきます。","Escrevo uma carta.","を marca o que recebe a ação: o que se escreve."],
  ["公園[を]歩きます。","こうえん[を]あるきます。","Ando pelo parque.","Com verbos de movimento, を marca o caminho percorrido."],
  ["道[を]渡ります。","みち[を]わたります。","Atravesso a rua.","を marca o lugar por onde se passa."],

  ["毎日七時[に]起きます。","まいにちしちじ[に]おきます。","Acordo às sete todo dia.","Hora exata leva に."],
  ["机の上[に]本があります。","つくえのうえ[に]ほんがあります。","Tem um livro em cima da mesa.","Onde algo existe leva に (com あります/います)."],
  ["友達[に]手紙を書きます。","ともだち[に]てがみをかきます。","Escrevo uma carta para um amigo.","Para quem vai a ação leva に."],
  ["電車[に]乗ります。","でんしゃ[に]のります。","Pego o trem.","乗ります pede に: é onde você entra."],
  ["学校[に]行きます。","がっこう[に]いきます。","Vou à escola.","Destino leva に. Aqui へ também estaria certo.",["へ"]],

  ["図書館[で]勉強します。","としょかん[で]べんきょうします。","Estudo na biblioteca.","Lugar onde a ação acontece leva で, não に."],
  ["駅[で]友達に会います。","えき[で]ともだちにあいます。","Encontro um amigo na estação.","Lugar onde a ação acontece leva で."],
  ["バス[で]学校に行きます。","バス[で]がっこうにいきます。","Vou à escola de ônibus.","Meio de transporte leva で."],
  ["日本語[で]話します。","にほんご[で]はなします。","Falo em japonês.","Com o que a ação é feita leva で: aqui, a língua."],

  ["日本[へ]行きます。","にほん[へ]いきます。","Vou para o Japão.","へ mostra a direção. Aqui に também estaria certo.",["に"]],
  ["家[へ]帰ります。","いえ[へ]かえります。","Volto para casa.","へ mostra a direção. Aqui に também estaria certo.",["に"]],
  ["来週、東京[へ]行きます。","らいしゅう、とうきょう[へ]いきます。","Semana que vem vou para Tóquio.","へ mostra para onde se vai. Aqui に também estaria certo.",["に"]],

  ["友達[と]話します。","ともだち[と]はなします。","Falo com um amigo.","Com quem se faz algo leva と."],
  ["母[と]買い物に行きます。","はは[と]かいものにいきます。","Vou às compras com minha mãe.","Com quem se faz algo leva と."],
  ["パン[と]卵を買います。","パン[と]たまごをかいます。","Compro pão e ovos.","と liga as coisas de uma lista: \"A e B\"."],

  ["私[も]学生です。","わたし[も]がくせいです。","Eu também sou estudante.","も significa \"também\" e entra no lugar de は."],
  ["今日[も]暑いです。","きょう[も]あついです。","Hoje também está quente.","も significa \"também\" e entra no lugar de は."],
  ["猫[も]好きです。","ねこ[も]すきです。","Também gosto de gato.","も entra no lugar de が: \"gato também\"."],

  ["私[の]本です。","わたし[の]ほんです。","É o meu livro.","の liga dono e coisa: 私の = meu."],
  ["日本語[の]先生です。","にほんご[の]せんせいです。","É professor de japonês.","の liga as palavras: a primeira explica a segunda."],
  ["駅[の]前で待ちます。","えき[の]まえでまちます。","Espero em frente à estação.","Palavras de posição usam の: \"frente da estação\"."],

  ["九時[から]働きます。","くじ[から]はたらきます。","Trabalho a partir das nove.","Ponto de partida no tempo leva から."],
  ["東京[から]来ました。","とうきょう[から]きました。","Vim de Tóquio.","Ponto de partida no espaço leva から."],
  ["学校は八時[から]です。","がっこうははちじ[から]です。","A escola começa às oito.","から marca quando começa."],

  ["五時[まで]働きます。","ごじ[まで]はたらきます。","Trabalho até as cinco.","Ponto final no tempo leva まで."],
  ["駅[まで]歩きます。","えき[まで]あるきます。","Ando até a estação.","Ponto final no espaço leva まで."],
  ["九時から五時[まで]勉強します。","くじからごじ[まで]べんきょうします。","Estudo das nove às cinco.","から e まで andam juntas: \"de... até...\"."],

  ["これは本です[か]。","これはほんです[か]。","Isto é um livro?","か no fim transforma a frase em pergunta."],
  ["何を食べます[か]。","なにをたべます[か]。","O que você vai comer?","か no fim transforma a frase em pergunta."],
  ["駅はどこです[か]。","えきはどこです[か]。","Onde fica a estação?","Mesmo com どこ, a pergunta fecha com か."],
];
