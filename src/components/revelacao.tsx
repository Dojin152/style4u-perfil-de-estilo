'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'
import { CORES } from '@/lib/acervo'
import { arquetipo } from '@/lib/arquetipos'
import { data, porcento } from '@/lib/formato'
import {
  comExposicaoMinima,
  dominantes,
  MIN_BATALHAS,
  type Agregado,
  type Escala,
  type ModoVetor,
  type Perfil,
} from '@/lib/perfil'
import { CartaoCompartilhavel } from './cartao-compartilhavel'

const PASSOS = 6

const ROTULOS = ['Perfil de estilo', 'Cor', 'Marca', 'Ocasião', 'Seu arquétipo', 'Cartão']

export function Revelacao({
  perfil,
  modo,
  escala,
  resumo,
  aoSair,
}: {
  perfil: Perfil
  modo: ModoVetor
  escala: Escala
  resumo: 'dominante' | 'indice'
  aoSair: () => void
}) {
  const [passo, setPasso] = useState(0)

  const variante = perfil.variantes[modo]
  const ordenadas =
    escala === 'cru'
      ? [...variante.pontuacoes].sort((a, b) => b.cru - a.cru)
      : variante.pontuacoes

  const primeiro = ordenadas[0]
  const segundo = ordenadas[1]
  const mistura = escala === 'centrado' && variante.mistura

  useEffect(() => {
    function teclado(evento: KeyboardEvent) {
      if (evento.key === 'ArrowRight') setPasso((p) => Math.min(PASSOS - 1, p + 1))
      if (evento.key === 'ArrowLeft') setPasso((p) => Math.max(0, p - 1))
      if (evento.key === 'Escape') aoSair()
    }

    window.addEventListener('keydown', teclado)
    return () => window.removeEventListener('keydown', teclado)
  }, [aoSair])

  if (!perfil.completo || !primeiro || !segundo) {
    return <Incompleto perfil={perfil} aoSair={aoSair} />
  }

  const vencedor = arquetipo(primeiro.arquetipo)
  const vice = arquetipo(segundo.arquetipo)
  const cor = topos(perfil.cores)
  const marca = topos(perfil.marcas)
  const ocasiao = topos(perfil.ocasioes)
  const estilos = comExposicaoMinima(perfil.estilos).slice(0, 3)
  const paleta = comExposicaoMinima(perfil.cores)
    .slice(0, 4)
    .map((item) => CORES[item.chave] ?? '#f4f1ea')

  const noArquetipo = passo === 4

  const conteudo = [
    <Fragment key="abertura">
      <Titulo>{perfil.batalhas} batalhas</Titulo>
      <Texto>
        {modo === 'direcao'
          ? 'O que você recusou pesa tanto quanto o que você escolheu.'
          : 'Contamos só o que você escolheu.'}
      </Texto>
    </Fragment>,
    <Fragment key="cor">
      <Titulo>{destaque(cor, resumo)?.chave ?? 'sem dados'}</Titulo>
      <Texto>{frase(destaque(cor, resumo), resumo)}</Texto>
      <div className="mt-7 flex gap-2">
        {paleta.map((hex) => (
          <motion.span
            key={hex}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + paleta.indexOf(hex) * 0.06, type: 'spring', stiffness: 260 }}
            className="border-linha-forte h-10 w-10 rounded-full border"
            style={{ background: hex }}
          />
        ))}
      </div>
      {resumo === 'indice' && cor.porParticipacao && (
        <Nota>
          A mais frequente foi {cor.porParticipacao.chave}, que também é a mais comum no
          acervo.
        </Nota>
      )}
    </Fragment>,
    <Fragment key="marca">
      <Titulo>{destaque(marca, resumo)?.chave ?? 'sem dados'}</Titulo>
      <Texto>{frase(destaque(marca, resumo), resumo)}</Texto>
      {resumo === 'indice' && marca.porParticipacao && (
        <Nota>
          A que mais apareceu nas suas escolhas foi {marca.porParticipacao.chave}, e ela é
          também a que mais aparece no acervo.
        </Nota>
      )}
    </Fragment>,
    <Fragment key="ocasiao">
      <Titulo>{destaque(ocasiao, resumo)?.chave ?? 'sem dados'}</Titulo>
      <Texto>{frase(destaque(ocasiao, resumo), resumo)}</Texto>
      <div className="mt-7 flex flex-wrap gap-1.5">
        {estilos.map((estilo) => (
          <span
            key={estilo.chave}
            className="border-linha-forte text-tinta-suave rounded-full border px-3 py-1 text-[12px]"
          >
            {estilo.chave}
          </span>
        ))}
      </div>
    </Fragment>,
    <Fragment key="arquetipo">
      <Titulo pequeno={mistura}>
        {mistura ? vencedor.nome + ' com um pé em ' + vice.nome : vencedor.nome}
      </Titulo>
      <Texto>{vencedor.frase}</Texto>
      <p className="text-tinta-suave mt-5 max-w-[280px] text-[13px] leading-relaxed">
        {escala === 'centrado'
          ? 'Você está acima de ' +
            porcento(primeiro.percentil) +
            ' dos usuários nesse eixo' +
            (mistura ? ', e os dois primeiros ficaram perto demais para chamar de um só.' : '.')
          : 'Afinidade de ' +
            primeiro.cru.toFixed(3).replace('.', ',') +
            ' contra ' +
            segundo.cru.toFixed(3).replace('.', ',') +
            ' do segundo colocado.'}
      </p>
    </Fragment>,
    <CartaoCompartilhavel
      key="cartao"
      dados={{
        arquetipo: vencedor.nome,
        segundo: mistura ? vice.nome : null,
        frase: vencedor.frase,
        tinta: vencedor.tinta,
        imagem: vencedor.imagem,
        batalhas: perfil.batalhas,
        linhas: [
          { rotulo: 'Cor', valor: destaque(cor, resumo)?.chave ?? '-' },
          { rotulo: 'Marca', valor: destaque(marca, resumo)?.chave ?? '-' },
          { rotulo: 'Ocasião', valor: destaque(ocasiao, resumo)?.chave ?? '-' },
        ],
        amostras: paleta,
        versao: perfil.versaoDoConjunto,
        data: data(perfil.geradoEm),
      }}
    />,
  ]

  return (
    <div className="relative h-full overflow-hidden bg-[#0d0d0f]">
      {/* A cor que a pessoa mais escolhe, como luz de fundo da revelação. */}
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-700"
        style={{ background: paleta[0] ?? '#f4f1ea', opacity: noArquetipo ? 0 : 0.4 }}
      />

      <AnimatePresence>
        {noArquetipo && (
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={vencedor.imagem}
              alt=""
              fill
              sizes="360px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,11,0.96)_18%,rgba(10,10,11,0.55)_58%,rgba(10,10,11,0.75)_100%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-4 pt-11">
        {Array.from({ length: PASSOS }, (_, i) => (
          <span key={i} className="bg-linha h-[2px] flex-1 overflow-hidden rounded-full">
            <motion.span
              className="bg-tinta block h-full origin-left rounded-full"
              initial={false}
              animate={{ scaleX: i <= passo ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </span>
        ))}
      </div>

      <span className="rotulo absolute top-[52px] left-6 z-20">{ROTULOS[passo]}</span>

      <button
        type="button"
        onClick={aoSair}
        aria-label="Sair da revelação"
        className="text-tinta absolute top-[52px] right-4 z-30 text-[18px] leading-none opacity-45 transition-opacity hover:opacity-90"
      >
        ×
      </button>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col pt-[86px] pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={passo}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-full flex-col [&_button]:pointer-events-auto [&_canvas]:pointer-events-auto"
          >
            {passo === PASSOS - 1 ? (
              conteudo[passo]
            ) : (
              <div className="flex h-full flex-col justify-end px-6 pb-6">{conteudo[passo]}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {passo > 0 && (
        <button
          type="button"
          onClick={() => setPasso((p) => Math.max(0, p - 1))}
          aria-label="Passo anterior"
          className="absolute inset-y-0 left-0 z-0 w-1/4"
        />
      )}
      {passo < PASSOS - 1 && (
        <button
          type="button"
          onClick={() => setPasso((p) => Math.min(PASSOS - 1, p + 1))}
          aria-label="Próximo passo"
          className="absolute inset-y-0 right-0 z-0 w-3/4"
        />
      )}
    </div>
  )
}

/**
 * O estado que quase ninguém desenha. Com dez batalhas a distância entre o
 * primeiro e o segundo arquétipo é ruído, e nomear um deles é o tipo de erro que
 * o usuário percebe e conta para os amigos.
 */
function Incompleto({ perfil, aoSair }: { perfil: Perfil; aoSair: () => void }) {
  const feito = perfil.batalhas / MIN_BATALHAS

  return (
    <div className="flex h-full flex-col justify-center bg-[#0d0d0f] px-6 pt-11 pb-6 text-center">
      <span className="rotulo">Ainda não</span>
      <p className="font-serifa mt-3 text-[34px] leading-[1.08]">
        Faltam {perfil.faltam} batalhas
      </p>
      <p className="text-tinta-suave mx-auto mt-4 max-w-[250px] text-[13px] leading-relaxed">
        Com {perfil.batalhas} jogadas dá para chutar um arquétipo, mas não dá para
        sustentar. O perfil abre em {MIN_BATALHAS}.
      </p>

      <div className="bg-linha mx-auto mt-7 h-[3px] w-40 overflow-hidden rounded-full">
        <motion.span
          className="bg-tinta block h-full origin-left rounded-full"
          initial={false}
          animate={{ scaleX: Math.min(1, feito) }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <button
        type="button"
        onClick={aoSair}
        className="border-linha-forte mx-auto mt-8 rounded-full border px-5 py-2.5 text-[13px]"
      >
        Continuar jogando
      </button>
    </div>
  )
}

function topos(agregados: Agregado[]) {
  return {
    porIndice: comExposicaoMinima(agregados)[0] ?? agregados[0],
    porParticipacao: dominantes(agregados)[0],
  }
}

function destaque(par: ReturnType<typeof topos>, resumo: 'dominante' | 'indice') {
  return resumo === 'indice' ? par.porIndice : par.porParticipacao
}

function frase(item: Agregado | undefined, resumo: 'dominante' | 'indice') {
  if (!item) return 'Sem exposição suficiente para afirmar.'

  return resumo === 'indice'
    ? 'Ganhou ' +
        porcento(item.vitorias / item.exposicoes) +
        ' das ' +
        item.exposicoes +
        ' vezes em que apareceu. O acaso daria metade.'
    : 'Esteve em ' + porcento(item.participacao) + ' das suas escolhas.'
}

function Titulo({ children, pequeno }: { children: React.ReactNode; pequeno?: boolean }) {
  return (
    <h2
      className={
        'font-serifa leading-[1.02] tracking-[-0.015em] ' +
        (pequeno ? 'text-[32px]' : 'text-[40px]')
      }
    >
      {children}
    </h2>
  )
}

function Texto({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-tinta-suave mt-4 max-w-[280px] text-[14px] leading-relaxed">{children}</p>
  )
}

function Nota({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-tinta-tenue border-linha mt-7 max-w-[270px] border-t pt-3 text-[11px] leading-relaxed">
      {children}
    </p>
  )
}
