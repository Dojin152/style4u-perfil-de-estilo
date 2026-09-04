'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { CONJUNTO, REFERENCIAS_POR_ARQUETIPO } from '@/lib/arquetipos'

/**
 * The reference set, as the client will hand it over: one row per archetype,
 * with the images, the name and the sentence the reveal is allowed to say.
 */
export function Galeria({
  selecionado,
  aoSelecionar,
}: {
  selecionado: string | null
  aoSelecionar: (id: string | null) => void
}) {
  return (
    <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
      {CONJUNTO.map((arquetipo) => {
        const ativo = selecionado === arquetipo.id

        return (
          <motion.button
            key={arquetipo.id}
            type="button"
            onClick={() => aoSelecionar(ativo ? null : arquetipo.id)}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={
              'group border-linha relative aspect-[4/5] overflow-hidden border text-left transition-colors ' +
              (ativo ? 'border-acento' : 'hover:border-linha-forte')
            }
          >
            <Image
              src={arquetipo.imagem}
              alt={arquetipo.nome}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,11,0.92)_8%,rgba(10,10,11,0.25)_52%,rgba(10,10,11,0.5)_100%)]" />

            <span className="absolute inset-x-0 bottom-0 p-5">
              <span className="flex gap-1.5">
                {arquetipo.paleta.map((cor) => (
                  <span
                    key={cor}
                    className="border-tinta/20 h-3 w-3 rounded-full border"
                    style={{ background: cor }}
                  />
                ))}
              </span>
              <span className="font-serifa mt-3 block text-[26px] leading-[1.05]">
                {arquetipo.nome}
              </span>
              <span className="text-tinta-suave mt-1.5 block text-[13px]">{arquetipo.frase}</span>
              <span
                className={
                  'text-tinta-suave mt-3 block overflow-hidden text-[12px] leading-relaxed transition-all duration-500 ' +
                  (ativo ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100')
                }
              >
                {arquetipo.descricao}
              </span>
            </span>

            <span className="rotulo absolute top-4 right-4" data-numero>
              {REFERENCIAS_POR_ARQUETIPO} refs
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
