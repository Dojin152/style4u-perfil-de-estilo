import Image from 'next/image'
import { Capa } from '@/components/capa'
import { Experiencia } from '@/components/experiencia'
import { Navegacao } from '@/components/navegacao'
import { Revelar } from '@/components/revelar'
import { ACERVO } from '@/lib/acervo'
import { ARQUETIPOS, REFERENCIAS_POR_ARQUETIPO, VERSAO_DO_CONJUNTO } from '@/lib/arquetipos'

const RESUMO = [
  { rotulo: 'Endpoint', valor: 'uma passada, sem vetor no cliente' },
  {
    rotulo: 'Arquétipos',
    valor: ARQUETIPOS.length + ' × ' + REFERENCIAS_POR_ARQUETIPO + ' referências',
  },
  { rotulo: 'Acervo', valor: ACERVO.length + ' looks' },
  { rotulo: 'Conjunto', valor: VERSAO_DO_CONJUNTO },
]

const REAL = [
  'A agregação de cores, marcas, ocasiões e estilos, com exposição e vitória contadas separadamente, e o ranking pelo piso do intervalo de confiança.',
  'A camada de arquétipos: cosseno, remoção do eixo comum, posição contra uma base de usuários e a decomposição do resultado por eixo.',
  'O instantâneo gravado com versão do conjunto de referências, o recálculo como ação deliberada e a linha do tempo do perfil batalha a batalha.',
  'A imagem compartilhável, desenhada em montagem própria nos dois formatos e entregue à folha nativa quando o aparelho tem uma.',
  'Os dezessete testes da matemática de similaridade, que rodam com npm test.',
]

const ENCENADO = [
  'As fotos do catálogo. Cada look é desenhado a partir das próprias etiquetas, porque imagem de loja parceira não entra numa demonstração pública.',
  'As imagens de referência dos arquétipos, geradas a partir de um protótipo com semente fixa no lugar do material que você vai fornecer.',
  'A base de usuários que calibra a posição de cada perfil, que aqui é uma população sintética de quatrocentas pessoas.',
  'Sessão, autenticação e persistência: as batalhas vivem no navegador e vão inteiras no corpo da requisição.',
]

export default function Pagina() {
  return (
    <div className="grao" id="topo">
      <Navegacao />

      <main>
        <Capa resumo={RESUMO} />

        <Experiencia />

        <section className="border-linha relative overflow-hidden border-t">
          <Image
            src="/textura-linho.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.07]"
          />
          <div className="from-noite via-noite/85 to-noite absolute inset-0 bg-gradient-to-b" />

          <div className="relative mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
            <Revelar>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <h2 className="font-serifa text-[clamp(1.8rem,3vw,2.4rem)] leading-tight">
                    O que é real aqui
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {REAL.map((item) => (
                      <li
                        key={item}
                        className="border-linha text-tinta-suave border-t pt-4 text-[13px] leading-relaxed"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="font-serifa text-[clamp(1.8rem,3vw,2.4rem)] leading-tight">
                    O que está encenado
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {ENCENADO.map((item) => (
                      <li
                        key={item}
                        className="border-linha text-tinta-suave border-t pt-4 text-[13px] leading-relaxed"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Revelar>
          </div>
        </section>
      </main>

      <footer className="border-linha border-t">
        <div className="text-tinta-tenue mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-8 text-[12px] sm:px-8">
          <span>Next.js · TypeScript · fotografia de banco de imagens livre</span>
          <span className="font-mono">{VERSAO_DO_CONJUNTO}</span>
        </div>
      </footer>
    </div>
  )
}
