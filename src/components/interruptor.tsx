'use client'

import { motion } from 'motion/react'

export interface Opcao<T extends string> {
  valor: T
  rotulo: string
}

/**
 * The A/B controls. Every one of them switches between the implementation the
 * brief describes and the one this proposal argues for, so they are the whole
 * argument of the page and deserve to be the most obvious control on it.
 */
export function Interruptor<T extends string>({
  nome,
  opcoes,
  valor,
  aoTrocar,
}: {
  nome: string
  opcoes: Opcao<T>[]
  valor: T
  aoTrocar: (valor: T) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={nome}
      className="border-linha bg-carvao-alto inline-flex rounded-full border p-[3px]"
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor

        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoTrocar(opcao.valor)}
            className={
              'relative rounded-full px-3.5 py-1.5 text-[13px] transition-colors ' +
              (ativo ? 'text-noite' : 'text-tinta-suave hover:text-tinta')
            }
          >
            {ativo && (
              <motion.span
                layoutId={'interruptor-' + nome}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="bg-tinta absolute inset-0 rounded-full"
              />
            )}
            <span className="relative">{opcao.rotulo}</span>
          </button>
        )
      })}
    </div>
  )
}
