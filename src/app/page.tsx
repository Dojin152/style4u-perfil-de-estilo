import { Experiencia } from '@/components/experiencia'
import { REFERENCIAS_POR_ARQUETIPO, ARQUETIPOS, VERSAO_DO_CONJUNTO } from '@/lib/arquetipos'
import { ACERVO } from '@/lib/acervo'

const RESUMO = [
  { rotulo: 'Endpoint', valor: 'uma passada, sem vetor no cliente' },
  { rotulo: 'Arquétipos', valor: ARQUETIPOS.length + ' × ' + REFERENCIAS_POR_ARQUETIPO + ' referências' },
  { rotulo: 'Acervo', valor: ACERVO.length + ' looks' },
  { rotulo: 'Conjunto', valor: VERSAO_DO_CONJUNTO },
]

const REAL = [
  'A agregação de cores, marcas, ocasiões e estilos, com exposição e vitória contadas separadamente.',
  'A comparação com os arquétipos: cosseno, remoção do eixo comum e posição contra uma base de usuários.',
  'O instantâneo gravado com versão do conjunto de referências, e o recálculo como ação deliberada.',
  'A imagem compartilhável, desenhada em montagem própria de 1080 por 1350 e entregue à folha nativa quando o aparelho tem uma.',
  'Os testes da matemática de similaridade, que rodam com npm test.',
]

const ENCENADO = [
  'As fotos do catálogo. Cada look é desenhado a partir das próprias etiquetas, porque imagem de loja parceira não entra numa demonstração pública.',
  'As imagens de referência dos arquétipos, geradas a partir de um protótipo com semente fixa no lugar do material que o cliente vai fornecer.',
  'A base de usuários que calibra a posição de cada perfil, que aqui é uma população sintética de quatrocentas pessoas.',
  'Sessão, autenticação e persistência: as batalhas vivem no navegador e vão inteiras no corpo da requisição.',
]

export default function Pagina() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
      <header className="flex items-center justify-between border-b py-5">
        <span className="text-[15px] tracking-[-0.01em]">Style4U</span>
        <span className="rotulo">Perfil de estilo</span>
      </header>

      <main id="conteudo">
        <section className="grid gap-10 border-b py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:py-24">
          <div>
            <p className="rotulo">Demonstração funcional</p>
            <h1 className="font-serifa mt-5 text-[clamp(2.6rem,6vw,4.4rem)] leading-[0.96] tracking-[-0.02em]">
              Um perfil de estilo que aguenta ser compartilhado
            </h1>
          </div>

          <div className="flex flex-col justify-end gap-8">
            <p className="text-tinta-suave max-w-lg text-[15px] leading-relaxed">
              À esquerda, o que o usuário vê: as batalhas, a revelação e a imagem que sai
              dela. À direita, o que o endpoint devolveu, com interruptores para trocar as
              duas decisões que decidem se o resultado significa alguma coisa: como o vetor
              de gosto é construído e o que se faz com o cosseno antes de mostrar um número.
            </p>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
              {RESUMO.map((item) => (
                <div key={item.rotulo}>
                  <dt className="rotulo">{item.rotulo}</dt>
                  <dd className="mt-1 text-[13px]">{item.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <Experiencia />
        </section>

        <section className="grid gap-10 border-t py-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="font-serifa text-[26px] leading-tight">O que é real aqui</h2>
            <ul className="mt-5 space-y-3">
              {REAL.map((item) => (
                <li key={item} className="text-tinta-suave border-t pt-3 text-[13px] leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serifa text-[26px] leading-tight">O que está encenado</h2>
            <ul className="mt-5 space-y-3">
              {ENCENADO.map((item) => (
                <li key={item} className="text-tinta-suave border-t pt-3 text-[13px] leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="text-tinta-tenue flex flex-wrap items-center justify-between gap-3 border-t py-7 text-[12px]">
        <span>Next.js · TypeScript · sem imagem externa · sem dependência de terceiros no navegador</span>
        <span className="font-mono">{VERSAO_DO_CONJUNTO}</span>
      </footer>
    </div>
  )
}
