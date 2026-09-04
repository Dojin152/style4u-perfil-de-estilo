'use client'

import { motion, useScroll, useTransform } from 'motion/react'

const SECOES = [
  { href: '#produto', rotulo: 'Produto' },
  { href: '#mapa', rotulo: 'Referências' },
  { href: '#acervo', rotulo: 'Acervo' },
]

/** Só aparece depois que a capa saiu, para não competir com ela. */
export function Navegacao() {
  const { scrollY } = useScroll()
  const opacidade = useTransform(scrollY, [220, 460], [0, 1])
  const deslocamento = useTransform(scrollY, [220, 460], [-12, 0])

  return (
    <motion.header
      style={{ opacity: opacidade, y: deslocamento }}
      className="vidro border-linha fixed inset-x-0 top-0 z-50 border-b"
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3.5 sm:px-8">
        <a href="#topo" className="text-[14px] tracking-[-0.01em]">
          Style4U
        </a>

        <nav className="flex items-center gap-6">
          {SECOES.map((secao) => (
            <a
              key={secao.href}
              href={secao.href}
              className="text-tinta-suave hover:text-tinta hidden text-[12px] transition-colors sm:block"
            >
              {secao.rotulo}
            </a>
          ))}
          <span className="rotulo">Perfil de estilo</span>
        </nav>
      </div>
    </motion.header>
  )
}
