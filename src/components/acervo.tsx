'use client'

import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ACERVO, type Ocasiao } from '@/lib/acervo'
import { porcento } from '@/lib/formato'
import type { Batalha } from '@/lib/perfil'
import { ArteDoLook } from './arte-do-look'

const OCASIOES: (Ocasiao | 'tudo')[] = [
  'tudo',
  'trabalho',
  'dia a dia',
  'noite',
  'encontro',
  'evento',
  'viagem',
]

/**
 * The catalogue the endpoint reads, open for inspection.
 *
 * It is here because every number on this page is an aggregation over these
 * thirty-six rows, and a claim about somebody's taste is only worth as much as
 * the catalogue that produced it: what the partner stores carry decides what
 * "dominant" can possibly mean.
 */
export function Acervo({ batalhas }: { batalhas: Batalha[] }) {
  const [filtro, setFiltro] = useState<Ocasiao | 'tudo'>('tudo')

  const registro = useMemo(() => {
    const mapa = new Map<string, { vitorias: number; aparicoes: number }>()
    const somar = (id: string, ganhou: boolean) => {
      const atual = mapa.get(id) ?? { vitorias: 0, aparicoes: 0 }
      mapa.set(id, {
        vitorias: atual.vitorias + (ganhou ? 1 : 0),
        aparicoes: atual.aparicoes + 1,
      })
    }

    for (const batalha of batalhas) {
      somar(batalha.vencedor, true)
      somar(batalha.perdedor, false)
    }

    return mapa
  }, [batalhas])

  const visiveis = useMemo(() => {
    const lista = ACERVO.filter((look) => filtro === 'tudo' || look.ocasiao === filtro)

    // Mesmo critério do painel: uma peça que ganhou a única vez em que apareceu
    // não passa na frente de outra que ganhou três de quatro.
    const piso = (r?: { vitorias: number; aparicoes: number }) => {
      if (!r || r.aparicoes === 0) return -1
      const z2 = 1.2816 * 1.2816
      const p = r.vitorias / r.aparicoes
      const centro = p + z2 / (2 * r.aparicoes)
      const margem =
        1.2816 * Math.sqrt((p * (1 - p) + z2 / (4 * r.aparicoes)) / r.aparicoes)
      return (centro - margem) / (1 + z2 / r.aparicoes)
    }

    return [...lista].sort((a, b) => piso(registro.get(b.id)) - piso(registro.get(a.id)))
  }, [filtro, registro])

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {OCASIOES.map((ocasiao) => (
          <button
            key={ocasiao}
            type="button"
            onClick={() => setFiltro(ocasiao)}
            className={
              'rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ' +
              (filtro === ocasiao
                ? 'border-tinta bg-tinta text-noite'
                : 'border-linha-forte text-tinta-suave hover:text-tinta')
            }
          >
            {ocasiao}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {visiveis.map((look) => {
          const marca = registro.get(look.id)

          return (
            <motion.article
              key={look.id}
              layout
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="border-linha bg-carvao group overflow-hidden border"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ArteDoLook
                  look={look}
                  className="h-full w-full transition-transform duration-700 group-hover:scale-[1.05]"
                />
                {marca && (
                  <span
                    className="vidro absolute top-2 right-2 rounded-full px-2 py-1 text-[10px]"
                    data-numero
                  >
                    {porcento(marca.vitorias / marca.aparicoes)} de {marca.aparicoes}
                  </span>
                )}
              </div>

              <div className="px-3 py-3">
                <p className="truncate text-[12px] leading-tight">{look.nome}</p>
                <p className="text-tinta-tenue mt-1 truncate text-[11px]">
                  {look.marca} · {look.ocasiao}
                </p>
                <p className="text-tinta-tenue mt-2 flex flex-wrap gap-1 text-[10px]">
                  {look.cores.map((cor) => (
                    <span key={cor} className="border-linha rounded-full border px-1.5 py-0.5">
                      {cor}
                    </span>
                  ))}
                </p>
              </div>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
