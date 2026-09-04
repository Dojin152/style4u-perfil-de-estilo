# Style4U · Perfil de Estilo

Demonstração funcional da feature descrita no projeto: o endpoint que consolida o perfil de
gosto, a camada de correspondência a arquétipos, a tela de revelação no estilo cartão e o
compartilhamento da peça como imagem.

Não é um protótipo de telas. A matemática roda de verdade, o endpoint responde de verdade e
os interruptores do painel da direita trocam a implementação viva, não uma legenda.

Além dos quatro entregáveis, a página abre o que costuma ficar escondido: o mapa do conjunto
de referências em duas dimensões com a sua posição dentro dele, a decomposição do resultado
eixo por eixo, a linha do tempo do perfil recalculado depois de cada batalha e o acervo
inteiro que o endpoint lê.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # a matemática de similaridade
npm run build
```

Node 20.9 ou mais novo. Nenhuma variável de ambiente e nenhuma chamada a terceiro em tempo de
execução: fontes, fotografias e dados são servidos pelo próprio projeto.

## Publicar na Vercel

O projeto é um Next.js padrão, sem configuração especial. Importe o repositório na Vercel e
aceite os padrões (framework Next.js, `npm run build`, sem variáveis de ambiente). O arquivo
`.npmrc` fixa `legacy-peer-deps` porque o npm 10 tromba num par opcional do vitest ao montar a
árvore; sem ele a instalação falha na máquina de build.

## O que a demonstração defende

Três decisões que não aparecem no enunciado e decidem se o resultado significa alguma coisa.
Cada uma é um interruptor no painel, com o comportamento ingênuo de um lado e o proposto do
outro.

**1. Como o vetor de gosto é construído.** `Média das escolhas` é a leitura direta do
enunciado e é dominada pelo acervo: se a maior parte do que as lojas parceiras oferecem é
neutra, o centróide de quase todo mundo cai no mesmo lugar. `Escolhido menos recusado` usa o
par inteiro da batalha, então o que os dois looks têm em comum se cancela e sobra a
preferência. O look perdedor é o dado que o escopo não usa e que já está gravado.

**2. O que se faz com o cosseno antes de mostrar um número.** Em `Cosseno cru`, os seis
arquétipos ficam todos acima de nove décimos e o primeiro e o segundo se separam por
centésimos, porque embeddings de imagem do mesmo domínio vivem num cone estreito. Em
`Centrado e comparado`, o eixo comum ao conjunto de referências sai dos dois lados e o
resultado é posicionado contra a distribuição dos outros usuários. Só depois disso existe uma
frase honesta para a tela.

**3. Dominante ou índice.** `Dominante` responde o que o acervo oferece: se metade do catálogo
é preto, a cor dominante de quase todo usuário é preto. `Índice contra a base` responde com
que frequência a etiqueta venceu quando apareceu, contra os cinquenta por cento do acaso, e
usa o piso do intervalo de confiança em vez da taxa crua, para que cinco aparições não passem
na frente de vinte.

Além dos três, a demonstração implementa os dois estados que costumam ficar de fora: perfil
ainda não formado, com quantas batalhas faltam, e empate técnico entre os dois primeiros
arquétipos, revelado como mistura em vez de rótulo. A persona `Dividida` cai nesse caso de
propósito.

## O que dá para ver além das telas

**O mapa.** Os seis centróides achatados em duas dimensões pelas suas próprias direções de
maior variação, com o seu perfil posicionado dentro do mesmo plano. O plano sai só das
referências, então ele não se mexe quando alguém joga mais uma batalha, e dois perfis podem
ser comparados no mesmo desenho. Serve para ver uma coisa que a lista de pontuações esconde:
arquétipos que o texto separa bem podem estar colados no espaço, e é contra isso que a regra
de mistura protege a tela.

**Por que este arquétipo.** Cosseno é uma soma sobre os eixos, então dá para devolver de onde
ele veio: cada parcela é a contribuição de um eixo, e o sinal diz se puxou a favor ou contra.
É a diferença entre uma tela que anuncia um rótulo e uma que aguenta ser questionada.

**A linha do tempo.** O mesmo perfil recalculado depois de cada batalha, com as trocas de
líder e a margem se abrindo. Deixa visível que o arquétipo não chega pronto, que é o
argumento por trás do mínimo de batalhas e do estado de perfil incompleto.

**O acervo.** As trinta e seis peças com marca, ocasião, cores e etiquetas, filtráveis por
ocasião, e com o seu retrospecto em cada uma depois de jogar. Toda afirmação sobre gosto vale
o que vale o acervo que a produziu.

## Estrutura

| Arquivo | O que faz |
|---|---|
| `src/app/api/perfil/route.ts` | O endpoint. Recebe as batalhas, devolve o instantâneo do perfil. |
| `src/app/api/arquetipos/route.ts` | O conjunto de referências publicado, sem os vetores. |
| `src/lib/perfil.ts` | Agregações, pontuação contra os arquétipos e o instantâneo. |
| `src/lib/gosto.ts` | O vetor de gosto nas duas variantes. |
| `src/lib/arquetipos.ts` | Referências por arquétipo, centróides e a versão do conjunto. |
| `src/lib/populacao.ts` | A base contra a qual cada perfil é posicionado. |
| `src/lib/vetores.ts` | Cosseno, remoção do eixo comum, percentil. |
| `src/lib/cartao.ts` | A imagem compartilhável, desenhada em 1080 de largura nos dois formatos. |
| `src/lib/projecao.ts` | O plano de duas dimensões, por iteração de potência. |
| `src/components/mapa.tsx` | O mapa dos arquétipos e a sua posição nele. |
| `src/components/linha-do-tempo.tsx` | O perfil batalha a batalha. |
| `src/components/acervo.tsx` | O acervo aberto para inspeção. |
| `src/components/revelacao.tsx` | A tela de revelação, seus seis passos e os dois estados de exceção. |
| `src/lib/perfil.test.ts` | Os dezessete testes da matemática, com vetores e batalhas fixas. |

## Como isso mapeia no Style4U

O que aqui é uma rota do Next vira uma rota Hono no Worker, e `calcularPerfil` atravessa sem
mudança: a função não sabe de onde vieram as batalhas. A comparação com os arquétipos, que
aqui roda em memória sobre trinta e seis looks, vira uma consulta com o operador do pgvector,
para que o vetor não entre no runtime do Worker. O instantâneo vira uma tabela com a versão do
conjunto de referências e a data, escrita uma vez e lida barato. A tela de revelação vira uma
rota apresentada em modal acima do grupo de abas, com os passos como estado interno e não uma
rota por passo, e a captura da imagem vira a mesma montagem de tamanho fixo, desenhada fora da
tela e entregue à folha nativa de compartilhamento.

## O que é real e o que está encenado

Real: as agregações, a similaridade e sua correção, a projeção do mapa, a decomposição por
eixo, a linha do tempo, o instantâneo versionado, a imagem compartilhável e o caminho até a
folha nativa quando o navegador tem uma, os testes.

Encenado: as fotos do catálogo, que aqui são desenhadas a partir das etiquetas de cada look
porque imagem de loja parceira não entra numa demonstração pública; as fotografias dos seis
arquétipos, que vêm de banco de imagens livre e ocupam o lugar do material que você vai
fornecer, com os identificadores listados em `CREDITOS.md`; os vetores das referências,
gerados a partir de um protótipo com semente fixa; a base de usuários que calibra a posição de
cada perfil, que é uma população sintética de quatrocentas pessoas; e a persistência, já que
as batalhas vivem no navegador e vão inteiras no corpo da requisição.
