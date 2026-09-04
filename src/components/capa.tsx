'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { useRef } from 'react'

/**
 * The opening frame. The photograph moves slower than the page and loses
 * saturation as the type arrives, so the headline lands on something quiet
 * instead of competing with it.
 */
export function Capa({ resumo }: { resumo: { rotulo: string; valor: string }[] }) {
  const alvo = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: alvo, offset: ['start start', 'end start'] })

  const deslocamento = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const escala = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const opacidade = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <div ref={alvo} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden">
      <motion.div style={{ y: deslocamento, scale: escala }} className="absolute inset-0">
        <Image
          src="/capa.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_28%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(10,10,11,0.88)_0%,rgba(10,10,11,0.55)_46%,rgba(10,10,11,0.2)_72%,rgba(10,10,11,0.62)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[var(--noite)] to-transparent" />
      </motion.div>

      <motion.div
        style={{ opacity: opacidade }}
        className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-16 sm:px-8 lg:pb-24"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rotulo"
        >
          Style4U · demonstração funcional
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-serifa mt-6 max-w-[15ch] text-[clamp(3rem,8.5vw,6.5rem)] leading-[0.92] tracking-[-0.025em]"
        >
          Um perfil de estilo que aguenta ser compartilhado
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <p className="text-tinta-suave max-w-lg text-[15px] leading-relaxed">
            A feature inteira rodando: o endpoint que consolida o gosto, a camada de
            arquétipos, a tela de revelação e a imagem que sai dela. Os interruptores do
            painel trocam a implementação viva, não a legenda.
          </p>

          <dl className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4">
            {resumo.map((item) => (
              <div key={item.rotulo}>
                <dt className="rotulo">{item.rotulo}</dt>
                <dd className="mt-1.5 text-[13px]" data-numero>
                  {item.valor}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </motion.div>

      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0], y: [0, 0, 14, 20] }}
        transition={{ delay: 1.2, duration: 2.4, repeat: Infinity, repeatDelay: 0.4 }}
        className="bg-tinta/50 absolute bottom-8 left-1/2 hidden h-8 w-px lg:block"
      />
    </div>
  )
}
