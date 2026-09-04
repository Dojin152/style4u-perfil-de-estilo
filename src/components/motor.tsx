'use client'

import { motion } from 'motion/react'
import { CONJUNTO } from '@/lib/arquetipos'
import { cosseno, dataHora, numero, porcento, vezes } from '@/lib/formato'
import {
  comExposicaoMinima,
  dominantes,
  MARGEM_DE_MISTURA,
  type Agregado,
  type Escala,
  type ModoVetor,
  type Perfil,
  type Variante,
} from '@/lib/perfil'
import { Interruptor } from './interruptor'

const NOMES = new Map(CONJUNTO.map((item) => [item.id, item.nome]))

export function Motor({
  perfil,
  novas,
  duracao,
  carregando,
  modo,
  escala,
  resumo,
  aoTrocarModo,
  aoTrocarEscala,
  aoTrocarResumo,
  aoRecalcular,
}: {
  perfil: Perfil | null
  novas: number
  duracao: number | null
  carregando: boolean
  modo: ModoVetor
  escala: Escala
  resumo: 'dominante' | 'indice'
  aoTrocarModo: (valor: ModoVetor) => void
  aoTrocarEscala: (valor: Escala) => void
  aoTrocarResumo: (valor: 'dominante' | 'indice') => void
  aoRecalcular: () => void
}) {
  return (
    <div className="space-y-px">
      <Secao
        numero="01"
        titulo="Camada de arquétipos"
        descricao="Os dois interruptores são as duas decisões que separam um resultado que parece medido de um que é medido."
      >
        <div className="flex flex-wrap gap-2 pb-6">
          <Interruptor
            nome="vetor"
            valor={modo}
            aoTrocar={aoTrocarModo}
            opcoes={[
              { valor: 'media', rotulo: 'Média das escolhas' },
              { valor: 'direcao', rotulo: 'Escolhido menos recusado' },
            ]}
          />
          <Interruptor
            nome="escala"
            valor={escala}
            aoTrocar={aoTrocarEscala}
            opcoes={[
              { valor: 'cru', rotulo: 'Cosseno cru' },
              { valor: 'centrado', rotulo: 'Centrado e comparado' },
            ]}
          />
        </div>

        {perfil ? (
          <Pontuacoes perfil={perfil} modo={modo} escala={escala} />
        ) : (
          <Vazio>O motor mostra números depois da primeira revelação.</Vazio>
        )}
      </Secao>

      <Secao
        numero="02"
        titulo="Cores, marcas e ocasiões"
        descricao="A mesma agregação lida de duas maneiras. Dominante responde o que o acervo oferece; índice responde o que a pessoa escolhe quando tem chance, e usa o piso da taxa de vitória em vez da taxa crua, para que cinco aparições não passem na frente de vinte."
      >
        <div className="pb-6">
          <Interruptor
            nome="resumo"
            valor={resumo}
            aoTrocar={aoTrocarResumo}
            opcoes={[
              { valor: 'dominante', rotulo: 'Dominante' },
              { valor: 'indice', rotulo: 'Índice contra a base' },
            ]}
          />
        </div>

        {perfil ? (
          <div className="grid gap-8 sm:grid-cols-3">
            <Lista titulo="Cor" itens={perfil.cores} resumo={resumo} />
            <Lista titulo="Marca" itens={perfil.marcas} resumo={resumo} />
            <Lista titulo="Ocasião" itens={perfil.ocasioes} resumo={resumo} />
          </div>
        ) : (
          <Vazio>Sem batalhas ainda.</Vazio>
        )}
      </Secao>

      <Secao
        numero="03"
        titulo="O instantâneo"
        descricao="O perfil é um registro gravado, não um cálculo refeito a cada abertura. Jogue mais batalhas com a revelação aberta e a tela continua mostrando o que foi compartilhado."
      >
        {perfil ? (
          <div className="space-y-5">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Campo rotulo="Conjunto de referências" valor={perfil.versaoDoConjunto} />
              <Campo rotulo="Gerado em" valor={dataHora(perfil.geradoEm)} />
              <Campo rotulo="Batalhas contadas" valor={String(perfil.batalhas)} />
              <Campo
                rotulo="Estado"
                valor={novas > 0 ? novas + ' batalhas novas desde então' : 'em dia'}
                alerta={novas > 0}
              />
            </dl>

            <button
              type="button"
              onClick={aoRecalcular}
              disabled={carregando || novas === 0}
              className="border-linha-forte text-tinta rounded-full border px-5 py-2 text-[13px] transition-colors disabled:opacity-35"
            >
              {carregando ? 'Recalculando' : 'Recalcular o perfil'}
            </button>
          </div>
        ) : (
          <Vazio>Nada gravado ainda.</Vazio>
        )}
      </Secao>

      <Secao
        numero="04"
        titulo="Resposta do endpoint"
        descricao="O mesmo corpo que a tela consumiu, sem nada reescrito para a demonstração. Em produção o endpoint devolve só a variante escolhida; aqui devolve as duas para que os interruptores tenham o que comparar."
      >
        <div className="text-tinta-suave mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px]">
          <span>POST /api/perfil</span>
          <span>{perfil ? perfil.batalhas + ' batalhas no corpo' : 'sem corpo'}</span>
          {duracao !== null && <span data-numero>{duracao} ms</span>}
        </div>

        {perfil ? (
          <pre className="border-linha bg-noite text-tinta-suave max-h-80 overflow-auto rounded-[3px] border p-4 font-mono text-[11px] leading-relaxed">
            {JSON.stringify(perfil, null, 2)}
          </pre>
        ) : (
          <Vazio>Nenhuma chamada feita.</Vazio>
        )}
      </Secao>
    </div>
  )
}

function Pontuacoes({
  perfil,
  modo,
  escala,
}: {
  perfil: Perfil
  modo: ModoVetor
  escala: Escala
}) {
  const variante = perfil.variantes[modo]
  const linhas =
    escala === 'cru'
      ? [...variante.pontuacoes].sort((a, b) => b.cru - a.cru)
      : variante.pontuacoes

  const primeiro = linhas[0]
  const segundo = linhas[1]
  const diferenca =
    escala === 'cru'
      ? (primeiro?.cru ?? 0) - (segundo?.cru ?? 0)
      : (primeiro?.z ?? 0) - (segundo?.z ?? 0)

  return (
    <div>
      <ul className="space-y-2.5">
        {linhas.map((linha, i) => (
          <motion.li
            key={linha.arquetipo}
            layout
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="group relative grid grid-cols-[148px_1fr_58px] items-center gap-3"
          >
            <span
              className={
                'text-[13px] leading-tight ' + (i === 0 ? 'text-tinta' : 'text-tinta-suave')
              }
            >
              {NOMES.get(linha.arquetipo)}
            </span>

            {escala === 'cru' ? (
              <Barra valor={linha.cru} />
            ) : (
              <BarraDivergente z={linha.z} />
            )}

            <span
              className="text-tinta-suave text-right font-mono text-[11px]"
              data-numero
            >
              {escala === 'cru' ? cosseno(linha.cru) : (linha.z > 0 ? '+' : '') + numero(linha.z)}
            </span>

            <span className="vidro border-linha text-tinta-suave pointer-events-none absolute top-full right-0 z-20 mt-1 hidden rounded-[3px] border px-2.5 py-1.5 text-[11px] whitespace-nowrap group-hover:block">
              cosseno {cosseno(linha.cru)} · centrado {numero(linha.centrado)} · percentil{' '}
              {porcento(linha.percentil)}
            </span>
          </motion.li>
        ))}
      </ul>

      <p className="text-tinta-suave mt-5 max-w-xl text-[13px] leading-relaxed">
        <Legenda modo={modo} escala={escala} diferenca={diferenca} />
      </p>

      <Explicacao variante={variante} />
    </div>
  )
}

/**
 * Cosine is a sum over the axes, so it can be taken apart again: each term is
 * what one axis contributed, and the sign says whether it pulled the result
 * towards the archetype or away from it. This is the difference between a screen
 * that announces a label and one that can be argued with.
 */
function Explicacao({ variante }: { variante: Variante }) {
  const primeiro = variante.pontuacoes[0]
  if (!primeiro || variante.explicacao.length === 0) return null

  const maior = Math.max(...variante.explicacao.map((item) => Math.abs(item.peso)))

  return (
    <div className="border-linha mt-8 border-t pt-6">
      <p className="rotulo">Por que {NOMES.get(primeiro.arquetipo)}</p>

      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {variante.explicacao.map((item) => (
          <li key={item.eixo} className="grid grid-cols-[150px_1fr_46px] items-center gap-3">
            <span className="text-tinta-suave truncate text-[12px]">{item.palavra}</span>
            <span className="relative block h-1.5">
              <span className="bg-linha absolute inset-y-0 left-1/2 w-px" />
              <motion.span
                className="absolute top-0 bottom-0 rounded-full"
                initial={false}
                animate={{
                  width: (Math.abs(item.peso) / maior) * 50 + '%',
                  left:
                    item.peso >= 0
                      ? '50%'
                      : 50 - (Math.abs(item.peso) / maior) * 50 + '%',
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: item.peso >= 0 ? 'var(--acento)' : 'var(--frio)' }}
              />
            </span>
            <span className="text-tinta-tenue text-right font-mono text-[10px]" data-numero>
              {item.peso >= 0 ? '+' : '-'}
              {Math.round(Math.abs(item.peso) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The three sentences the four combinations produce. Writing one caption for all
 * of them would be wrong in at least two: the raw cosine of a difference vector
 * behaves nothing like the raw cosine of an average.
 */
function Legenda({
  modo,
  escala,
  diferenca,
}: {
  modo: ModoVetor
  escala: Escala
  diferenca: number
}) {
  if (escala === 'centrado') {
    return (
      <>
        Entre o primeiro e o segundo há{' '}
        <strong className="font-medium">{numero(diferenca)}</strong> de desvio contra a base
        de usuários.{' '}
        {diferenca < MARGEM_DE_MISTURA
          ? 'Abaixo de ' +
            numero(MARGEM_DE_MISTURA) +
            ' a tela revela os dois, porque nomear um só seria invenção.'
          : 'Acima de ' + numero(MARGEM_DE_MISTURA) + ' dá para nomear um só.'}
      </>
    )
  }

  if (modo === 'media') {
    return (
      <>
        Todos os seis passam de nove décimos e entre o primeiro e o segundo há{' '}
        <strong className="font-medium">{cosseno(diferenca)}</strong>. Numa tela isso vira
        dois arquétipos com a mesma afinidade, e quem decide o primeiro lugar é qual imagem
        de referência é mais genérica.
      </>
    )
  }

  return (
    <>
      A direção já cancela o que os arquétipos têm em comum, então o cosseno cru separa
      mais: <strong className="font-medium">{cosseno(diferenca)}</strong> entre o primeiro e
      o segundo. O que ele ainda não tem é escala. Sem saber o que os outros usuários
      pontuam, esse valor não vira nem posição nem frase.
    </>
  )
}

/**
 * The cosine on its own scale, which runs from minus one to one. Drawing it on a
 * zero-to-one axis would hide the two things worth seeing: that the average of
 * the chosen looks scores near the ceiling against every archetype, and that the
 * difference vector scores near nothing against all of them.
 */
function Barra({ valor }: { valor: number }) {
  const largura = Math.min(1, Math.abs(valor)) * 50

  return (
    <span className="relative block h-2 w-full">
      <span className="bg-linha absolute inset-x-0 top-1/2 h-px -translate-y-1/2" />
      <span className="bg-linha-forte absolute inset-y-0 left-1/2 w-px" />
      <motion.span
        className="bg-tinta absolute top-0 bottom-0 rounded-full opacity-80"
        initial={false}
        animate={{ width: largura + '%', left: valor >= 0 ? '50%' : 50 - largura + '%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  )
}

/** Polarity: above or below the average user, with the average as the axis. */
function BarraDivergente({ z }: { z: number }) {
  const limite = 3
  const largura = Math.min(1, Math.abs(z) / limite) * 50

  return (
    <span className="relative block h-2 w-full">
      <span className="bg-linha absolute inset-y-0 left-1/2 w-px" />
      <motion.span
        className="absolute top-0 bottom-0 rounded-full"
        initial={false}
        animate={{
          width: largura + '%',
          left: z >= 0 ? '50%' : 50 - largura + '%',
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: z >= 0 ? 'var(--acento)' : 'var(--frio)' }}
      />
    </span>
  )
}

function Lista({
  titulo,
  itens,
  resumo,
}: {
  titulo: string
  itens: Agregado[]
  resumo: 'dominante' | 'indice'
}) {
  const ordenados = (resumo === 'indice' ? comExposicaoMinima(itens) : dominantes(itens)).slice(
    0,
    4
  )
  const maior = ordenados[0]
  const referencia =
    resumo === 'indice' ? (maior?.indice ?? 1) : (maior?.participacao ?? 1)

  return (
    <div>
      <p className="rotulo mb-3">{titulo}</p>
      <ul className="space-y-2.5">
        {ordenados.map((item) => (
          <motion.li key={item.chave} layout transition={{ duration: 0.28 }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px]">{item.chave}</span>
              <span className="text-tinta-suave font-mono text-[11px]" data-numero>
                {resumo === 'indice' ? vezes(item.indice) : porcento(item.participacao)}
              </span>
            </div>
            <span className="bg-linha relative mt-1.5 block h-[3px] w-full rounded-full">
              <motion.span
                className="bg-tinta absolute inset-y-0 left-0 origin-left rounded-full opacity-70"
                initial={false}
                animate={{
                  width:
                    Math.min(
                      1,
                      (resumo === 'indice' ? item.indice : item.participacao) /
                        (referencia || 1)
                    ) *
                      100 +
                    '%',
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Where the coin would land. Without it a bar of 0,4x looks like
                  an achievement instead of a rejection. */}
              {resumo === 'indice' && referencia > 1 && (
                <span
                  className="bg-linha-forte absolute -top-1 -bottom-1 w-px"
                  style={{ left: (1 / referencia) * 100 + '%' }}
                />
              )}
            </span>
            <span className="text-tinta-tenue mt-1 block text-[11px]" data-numero>
              {item.vitorias} de {item.exposicoes} aparições
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function Secao({
  numero: indice,
  titulo,
  descricao,
  children,
}: {
  numero: string
  titulo: string
  descricao: string
  children: React.ReactNode
}) {
  return (
    <section className="painel px-6 py-7 sm:px-8">
      <header className="mb-6 flex gap-4">
        <span className="text-tinta-tenue mt-[3px] font-mono text-[11px]">{indice}</span>
        <div>
          <h2 className="text-[17px] tracking-[-0.01em]">{titulo}</h2>
          <p className="text-tinta-suave mt-1.5 max-w-xl text-[13px] leading-relaxed">
            {descricao}
          </p>
        </div>
      </header>
      {children}
    </section>
  )
}

function Campo({
  rotulo,
  valor,
  alerta,
}: {
  rotulo: string
  valor: string
  alerta?: boolean
}) {
  return (
    <div>
      <dt className="rotulo">{rotulo}</dt>
      <dd
        className={'mt-1 font-mono text-[12px] ' + (alerta ? 'text-acento' : 'text-tinta')}
        data-numero
      >
        {valor}
      </dd>
    </div>
  )
}

function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="text-tinta-tenue text-[13px]">{children}</p>
}
