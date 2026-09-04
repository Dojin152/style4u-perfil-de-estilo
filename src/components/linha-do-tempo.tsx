'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { CONJUNTO } from '@/lib/arquetipos'
import { numero } from '@/lib/formato'
import { MARGEM_DE_MISTURA, type Marco, type ModoVetor, type Perfil } from '@/lib/perfil'

const NOMES = new Map(CONJUNTO.map((item) => [item.id, item.nome]))

const ALTURA = 120

/**
 * The archetype does not arrive finished. This is the same profile recomputed
 * after every battle, and what it shows is the two things the reveal has to
 * survive: the leader changing hands early on, and the margin taking a while to
 * become one a screen can name.
 */
export function LinhaDoTempo({ perfil, modo }: { perfil: Perfil | null; modo: ModoVetor }) {
  const [ativo, setAtivo] = useState<number | null>(null)
  const marcos = perfil?.historico[modo] ?? []

  if (marcos.length < 2) {
    return <p className="text-tinta-tenue text-[13px]">A linha do tempo precisa de batalhas.</p>
  }

  const largura = 100
  const ultimo = marcos[marcos.length - 1]

  // A escala segue os dados, com o zero sempre dentro: uma faixa fixa deixaria a
  // curva colada no teto e a leitura seria a de uma linha reta.
  const valores = marcos.map((marco) => marco.z)
  const bruto = { min: Math.min(0, ...valores), max: Math.max(0, ...valores) }
  const folga = Math.max(0.25, (bruto.max - bruto.min) * 0.18)
  const teto = bruto.max + folga
  const piso = bruto.min - folga

  const x = (i: number) => (i / (marcos.length - 1)) * largura
  const y = (z: number) => ALTURA - ((z - piso) / (teto - piso)) * ALTURA

  const linha = marcos.map((marco, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(marco.z)}`).join(' ')
  const area = linha + ` L${largura},${ALTURA} L0,${ALTURA} Z`

  const trocas = marcos.filter(
    (marco, i) => i > 0 && marcos[i - 1] && marcos[i - 1]!.lider !== marco.lider
  )
  const margemAgora = ultimo?.margem ?? 0
  const destaque = ativo === null ? ultimo : marcos[ativo]

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${largura} ${ALTURA}`}
          preserveAspectRatio="none"
          className="h-[120px] w-full"
          onMouseLeave={() => setAtivo(null)}
        >
          <line
            x1="0"
            y1={y(0)}
            x2={largura}
            y2={y(0)}
            stroke="rgb(244 241 234 / 0.14)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <linearGradient id="preenchimento-da-linha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--acento)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--acento)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#preenchimento-da-linha)" />
          <motion.path
            d={linha}
            fill="none"
            stroke="var(--acento)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
          {marcos.map((marco, i) => (
            <g key={marco.batalha}>
              <circle
                cx={x(i)}
                cy={y(marco.z)}
                r={ativo === i ? 3 : 0}
                fill="var(--acento)"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x={x(i) - largura / (marcos.length * 2)}
                y="0"
                width={largura / marcos.length}
                height={ALTURA}
                fill="transparent"
                onMouseEnter={() => setAtivo(i)}
              />
            </g>
          ))}
        </svg>

        <span className="text-tinta-tenue absolute top-0 left-0 text-[10px]" data-numero>
          {teto > 0 ? '+' : ''}
          {numero(teto)}
        </span>
        <span
          className="text-tinta-tenue absolute left-0 -translate-y-1/2 text-[10px]"
          style={{ top: (y(0) / ALTURA) * 100 + '%' }}
        >
          0
        </span>
        <span className="text-tinta-tenue absolute bottom-0 left-0 text-[10px]" data-numero>
          {numero(piso)}
        </span>
      </div>

      <div className="border-linha mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t pt-4">
        <p className="text-[13px]">
          {destaque && (
            <>
              <span className="text-tinta-tenue" data-numero>
                batalha {destaque.batalha} ·{' '}
              </span>
              {NOMES.get(destaque.lider)}
              <span className="text-tinta-suave" data-numero>
                {' '}
                em {destaque.z > 0 ? '+' : ''}
                {numero(destaque.z)}
              </span>
            </>
          )}
        </p>
        <p className="text-tinta-suave text-[13px]" data-numero>
          {trocas.length === 0
            ? 'o líder nunca mudou'
            : 'o líder trocou ' + trocas.length + (trocas.length === 1 ? ' vez' : ' vezes')}
          {', e a margem está em ' +
            numero(margemAgora) +
            (margemAgora >= MARGEM_DE_MISTURA ? ', acima do limite' : ', abaixo do limite')}
        </p>
      </div>
    </div>
  )
}

export type { Marco }
