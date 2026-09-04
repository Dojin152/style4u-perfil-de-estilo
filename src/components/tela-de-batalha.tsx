'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Look } from '@/lib/acervo'
import { MIN_BATALHAS } from '@/lib/perfil'
import { ArteDoLook } from './arte-do-look'

export function TelaDeBatalha({
  par,
  jogadas,
  aoEscolher,
  aoRevelar,
}: {
  par: [Look, Look]
  jogadas: number
  aoEscolher: (vencedor: Look, perdedor: Look) => void
  aoRevelar: () => void
}) {
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const faltam = Math.max(0, MIN_BATALHAS - jogadas)

  function escolher(vencedor: Look, perdedor: Look) {
    if (escolhido) return
    setEscolhido(vencedor.id)
    // The pair only changes after the highlight has been seen, otherwise the
    // next battle appears before the tap has registered as a choice.
    window.setTimeout(() => {
      setEscolhido(null)
      aoEscolher(vencedor, perdedor)
    }, 260)
  }

  return (
    <div className="flex h-full flex-col pt-11">
      <header className="flex items-center justify-between px-5 pb-3">
        <span className="rotulo">Batalha {jogadas + 1}</span>
        <span className="text-tinta-suave text-[11px]" data-numero>
          {faltam > 0 ? faltam + ' para o perfil fechar' : 'perfil disponível'}
        </span>
      </header>

      <div className="grid flex-1 grid-rows-2 gap-2 px-3">
        {par.map((look, i) => (
          <AnimatePresence key={i} mode="popLayout" initial={false}>
            <motion.button
              key={look.id}
              type="button"
              initial={{ opacity: 0, y: i === 0 ? -10 : 10 }}
              animate={{
                opacity: escolhido && escolhido !== look.id ? 0.25 : 1,
                y: 0,
                scale: escolhido === look.id ? 0.975 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => escolher(look, par[i === 0 ? 1 : 0])}
              aria-label={'Escolher ' + look.nome + ', ' + look.marca}
              className="group border-linha relative flex flex-col overflow-hidden rounded-[2px] border text-left"
            >
              <ArteDoLook look={look} className="min-h-0 flex-1" />
              <span
                className={
                  'pointer-events-none absolute inset-0 z-10 border-2 transition-opacity ' +
                  (escolhido === look.id
                    ? 'border-tinta opacity-100'
                    : 'border-transparent opacity-0')
                }
              />
              <span className="bg-superficie border-linha block border-t px-3.5 py-2.5">
                <span className="block truncate text-[13px] leading-tight">{look.nome}</span>
                <span className="text-tinta-tenue mt-0.5 block text-[11px]">
                  {look.marca} · {look.ocasiao}
                </span>
              </span>
            </motion.button>
          </AnimatePresence>
        ))}
      </div>

      <footer className="px-5 pt-3 pb-5">
        <button
          type="button"
          onClick={aoRevelar}
          disabled={jogadas === 0}
          className="bg-tinta text-superficie w-full rounded-full py-3 text-[13px] font-medium disabled:opacity-25"
        >
          Revelar meu perfil
        </button>
        <p className="text-tinta-tenue mt-2.5 text-center text-[11px]">
          Toque no look que você levaria
        </p>
      </footer>
    </div>
  )
}
