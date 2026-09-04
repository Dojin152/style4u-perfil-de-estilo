'use client'

import { AnimatePresence, motion } from 'motion/react'
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
    .map((item) => CORES[item.chave] ?? '#17150f')

  const fundoEscuro = passo === 4

  const conteudo = [
    <Fragment key="abertura">
      <Rotulo escuro={fundoEscuro}>Perfil de estilo</Rotulo>
      <Titulo>{perfil.batalhas} batalhas</Titulo>
      <Texto>
        {modo === 'direcao'
          ? 'O que você recusou pesa tanto quanto o que você escolheu.'
          : 'Contamos só o que você escolheu.'}
      </Texto>
    </Fragment>,
    <Fragment key="cor">
      <Rotulo escuro={fundoEscuro}>Cor</Rotulo>
      <Titulo>{destaque(cor, resumo)?.chave ?? 'sem dados'}</Titulo>
      <Texto>{frase(destaque(cor, resumo), resumo)}</Texto>
      <div className="mt-6 flex gap-2">
        {paleta.map((hex) => (
          <span
            key={hex}
            className="border-linha h-9 w-9 rounded-full border"
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
      <Rotulo escuro={fundoEscuro}>Marca</Rotulo>
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
      <Rotulo escuro={fundoEscuro}>Ocasião</Rotulo>
      <Titulo>{destaque(ocasiao, resumo)?.chave ?? 'sem dados'}</Titulo>
      <Texto>{frase(destaque(ocasiao, resumo), resumo)}</Texto>
      <div className="mt-6 flex flex-wrap gap-1.5">
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
      <Rotulo escuro={fundoEscuro}>Seu arquétipo</Rotulo>
      <Titulo pequeno={mistura}>
        {mistura ? vencedor.nome + ' com um pé em ' + vice.nome : vencedor.nome}
      </Titulo>
      <Texto escuro>{vencedor.frase}</Texto>
      <p className="mt-5 max-w-[280px] text-[13px] leading-relaxed text-white/65">
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
    <div
      className="relative h-full transition-colors duration-500"
      style={{
        background: fundoEscuro ? vencedor.tinta : undefined,
        color: fundoEscuro ? '#f2efe9' : undefined,
      }}
    >
      <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-4 pt-11">
        {Array.from({ length: PASSOS }, (_, i) => (
          <span
            key={i}
            className="h-[2px] flex-1 rounded-full"
            style={{
              background: fundoEscuro ? 'rgba(242,239,233,0.28)' : 'var(--linha)',
            }}
          >
            <motion.span
              className="block h-full rounded-full"
              initial={false}
              animate={{ scaleX: i <= passo ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: fundoEscuro ? '#f2efe9' : 'var(--tinta)',
                transformOrigin: 'left',
              }}
            />
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={aoSair}
        aria-label="Sair da revelação"
        className="absolute top-[54px] right-4 z-30 text-[18px] leading-none opacity-40 transition-opacity hover:opacity-80"
        style={{ color: fundoEscuro ? '#f2efe9' : 'var(--tinta)' }}
      >
        ×
      </button>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col pt-[86px] pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={passo}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none flex h-full flex-col [&_button]:pointer-events-auto [&_canvas]:pointer-events-auto"
          >
            {passo === PASSOS - 1 ? (
              conteudo[passo]
            ) : (
              <div className="flex h-full flex-col justify-center px-6">{conteudo[passo]}</div>
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
 * The state everybody forgets to design. With ten battles the distance between
 * the first and the second archetype is noise, and naming one of them is the
 * kind of mistake a user notices and repeats to a friend.
 */
function Incompleto({ perfil, aoSair }: { perfil: Perfil; aoSair: () => void }) {
  const feito = perfil.batalhas / MIN_BATALHAS

  return (
    <div className="flex h-full flex-col justify-center px-6 pt-11 pb-6 text-center">
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

function Rotulo({ children, escuro }: { children: React.ReactNode; escuro: boolean }) {
  return (
    <span className="rotulo" style={escuro ? { color: 'rgba(242,239,233,0.55)' } : undefined}>
      {children}
    </span>
  )
}

function Titulo({
  children,
  pequeno,
}: {
  children: React.ReactNode
  pequeno?: boolean
}) {
  return (
    <h2
      className={
        'font-serifa mt-3 leading-[1.03] tracking-[-0.01em] ' +
        (pequeno ? 'text-[31px]' : 'text-[38px]')
      }
    >
      {children}
    </h2>
  )
}

function Texto({ children, escuro }: { children: React.ReactNode; escuro?: boolean }) {
  return (
    <p
      className={
        'mt-4 max-w-[280px] text-[14px] leading-relaxed ' +
        (escuro ? 'text-white/75' : 'text-tinta-suave')
      }
    >
      {children}
    </p>
  )
}

function Nota({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-tinta-tenue mt-7 max-w-[270px] border-t pt-3 text-[11px] leading-relaxed">
      {children}
    </p>
  )
}
