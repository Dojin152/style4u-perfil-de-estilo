'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import { CONJUNTO } from '@/lib/arquetipos'
import { numero } from '@/lib/formato'
import type { ModoVetor, Perfil } from '@/lib/perfil'

const NOMES = new Map(CONJUNTO.map((item) => [item.id, item.nome]))
const IMAGENS = new Map(CONJUNTO.map((item) => [item.id, item.imagem]))

/**
 * O plano vai de -1 a 1. A faixa é apertada de propósito: cada ponto tem um nome
 * embaixo, e um ponto colado na borda de baixo perde o nome fora do quadro.
 */
function posicao(valor: number, invertido = false) {
  const normalizado = ((invertido ? -valor : valor) + 1) / 2
  return 11 + normalizado * 74 + '%'
}

export function Mapa({
  perfil,
  modo,
  selecionado,
  aoSelecionar,
}: {
  perfil: Perfil | null
  modo: ModoVetor
  selecionado: string | null
  aoSelecionar: (id: string | null) => void
}) {
  const [sobre, setSobre] = useState<string | null>(null)
  const variante = perfil?.variantes[modo]
  const usuario = variante?.ponto
  const lider = variante?.pontuacoes[0]?.arquetipo
  const vice = variante?.pontuacoes[1]?.arquetipo

  return (
    <div className="border-linha bg-noite relative aspect-square w-full overflow-hidden rounded-[4px] border">
      <Grade />

      {perfil?.mapa.map((ponto) => {
        const destacado = selecionado === ponto.arquetipo
        const relevante = ponto.arquetipo === lider || ponto.arquetipo === vice
        const apontado = sobre === ponto.arquetipo
        const imagem = IMAGENS.get(ponto.arquetipo)

        return (
          <button
            key={ponto.arquetipo}
            type="button"
            onClick={() => aoSelecionar(destacado ? null : ponto.arquetipo)}
            onMouseEnter={() => setSobre(ponto.arquetipo)}
            onMouseLeave={() => setSobre((atual) => (atual === ponto.arquetipo ? null : atual))}
            style={{
              left: posicao(ponto.x),
              top: posicao(ponto.y, true),
              zIndex: destacado || apontado ? 16 : relevante ? 14 : 10,
            }}
            className="group absolute -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <span
              className={
                'relative block overflow-hidden rounded-full border transition-all duration-300 ' +
                (destacado || relevante
                  ? 'border-tinta/60 h-14 w-14'
                  : 'border-linha-forte h-10 w-10 opacity-60 group-hover:opacity-100')
              }
            >
              {imagem && (
                <Image
                  src={imagem}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover grayscale-[0.4]"
                />
              )}
            </span>
            {/* Rótulo só onde ele significa alguma coisa: com seis nomes sempre
                visíveis, dois arquétipos vizinhos viram um borrão. */}
            {(destacado || relevante || apontado) && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  'absolute top-full left-1/2 mt-2 block w-[110px] -translate-x-1/2 text-[10px] leading-tight ' +
                  (destacado || apontado ? 'text-tinta' : 'text-tinta-suave')
                }
              >
                {NOMES.get(ponto.arquetipo)}
              </motion.span>
            )}
          </button>
        )
      })}

      {usuario && (
        <motion.span
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ left: posicao(usuario.x), top: posicao(usuario.y, true) }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
        >
          <span className="bg-acento/25 absolute -inset-4 animate-pulse rounded-full blur-md" />
          <span className="bg-acento ring-noite relative block h-3.5 w-3.5 rounded-full ring-4" />
          <span className="text-acento absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.14em] uppercase">
            você
          </span>
        </motion.span>
      )}

      {!perfil && (
        <p className="text-tinta-tenue absolute inset-0 flex items-center justify-center text-[13px]">
          O mapa aparece com o primeiro perfil.
        </p>
      )}

      {selecionado && (
        <Detalhe id={selecionado} perfil={perfil} modo={modo} />
      )}
    </div>
  )
}

function Detalhe({
  id,
  perfil,
  modo,
}: {
  id: string
  perfil: Perfil | null
  modo: ModoVetor
}) {
  const arquetipo = CONJUNTO.find((item) => item.id === id)
  const pontuacao = perfil?.variantes[modo].pontuacoes.find((item) => item.arquetipo === id)
  if (!arquetipo) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="vidro border-linha absolute inset-x-3 bottom-3 z-30 rounded-[4px] border p-4"
    >
      <p className="text-[14px]">{arquetipo.nome}</p>
      <p className="text-tinta-suave mt-1 text-[12px] leading-relaxed">{arquetipo.descricao}</p>
      {pontuacao && (
        <p className="text-tinta-tenue mt-2 font-mono text-[11px]" data-numero>
          desvio {pontuacao.z > 0 ? '+' : ''}
          {numero(pontuacao.z)} · percentil {Math.round(pontuacao.percentil * 100)}
        </p>
      )}
    </motion.div>
  )
}

/** Os anéis dizem que o centro é a média do conjunto, não o zero de nada. */
function Grade() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
      {[42, 28, 14].map((raio) => (
        <circle
          key={raio}
          cx="50"
          cy="50"
          r={raio}
          fill="none"
          stroke="rgb(244 241 234 / 0.06)"
          strokeWidth="0.25"
        />
      ))}
      <line x1="8" y1="50" x2="92" y2="50" stroke="rgb(244 241 234 / 0.06)" strokeWidth="0.25" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="rgb(244 241 234 / 0.06)" strokeWidth="0.25" />
    </svg>
  )
}
