'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { Look } from '@/lib/acervo'
import { pedirPerfil } from '@/lib/api'
import { jogarComo, PERSONAS, type Persona } from '@/lib/personas'
import { MIN_BATALHAS, type Batalha, type Escala, type ModoVetor, type Perfil } from '@/lib/perfil'
import { criarRng, semente } from '@/lib/rng'
import { sortearPar } from '@/lib/simulacao'
import { Aparelho } from './aparelho'
import { Motor } from './motor'
import { Revelacao } from './revelacao'
import { TelaDeBatalha } from './tela-de-batalha'

const BATALHAS_DA_PERSONA = 24

export function Experiencia() {
  // Seeded so the sequence of pairs is the same for everyone who opens the page,
  // and so nothing random runs during the server render.
  const rng = useRef(criarRng(semente('style4u:demo')))

  const [batalhas, setBatalhas] = useState<Batalha[]>([])
  const [par, setPar] = useState<[Look, Look] | null>(null)
  const [tela, setTela] = useState<'inicio' | 'batalha' | 'revelacao'>('inicio')

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [contadas, setContadas] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [duracao, setDuracao] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const [modo, setModo] = useState<ModoVetor>('direcao')
  const [escala, setEscala] = useState<Escala>('centrado')
  const [resumo, setResumo] = useState<'dominante' | 'indice'>('indice')

  async function calcular(lista: Batalha[]) {
    setCarregando(true)
    setErro(null)

    try {
      const resposta = await pedirPerfil(lista)
      setPerfil(resposta.perfil)
      setDuracao(resposta.duracao)
      setContadas(lista.length)
    } catch {
      setErro('O endpoint não respondeu. Tente de novo.')
    } finally {
      setCarregando(false)
    }
  }

  function proximoPar() {
    setPar(sortearPar(rng.current))
  }

  function comecar() {
    proximoPar()
    setTela('batalha')
  }

  function escolher(vencedor: Look, perdedor: Look) {
    setBatalhas((atuais) => [...atuais, { vencedor: vencedor.id, perdedor: perdedor.id }])
    proximoPar()
  }

  async function revelar() {
    await calcular(batalhas)
    setTela('revelacao')
  }

  async function simular(persona: Persona) {
    const lista = jogarComo(persona, BATALHAS_DA_PERSONA)
    setBatalhas(lista)
    proximoPar()
    await calcular(lista)
    setTela('revelacao')
  }

  function reiniciar() {
    setBatalhas([])
    setPerfil(null)
    setContadas(0)
    setDuracao(null)
    setErro(null)
    setPar(null)
    setTela('inicio')
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(300px,352px)_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-10 lg:self-start">
        <Aparelho>
          <AnimatePresence mode="wait">
            <motion.div
              key={tela}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="h-full"
            >
              {tela === 'inicio' && <TelaInicial aoComecar={comecar} />}
              {tela === 'batalha' && par && (
                <TelaDeBatalha
                  par={par}
                  jogadas={batalhas.length}
                  aoEscolher={escolher}
                  aoRevelar={revelar}
                />
              )}
              {tela === 'revelacao' && perfil && (
                <Revelacao
                  perfil={perfil}
                  modo={modo}
                  escala={escala}
                  resumo={resumo}
                  aoSair={() => {
                    if (!par) proximoPar()
                    setTela('batalha')
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Aparelho>

        <div className="mt-7">
          <p className="rotulo">Atalhos da demonstração</p>
          <p className="text-tinta-suave mt-2 text-[13px] leading-relaxed">
            Cada persona joga {BATALHAS_DA_PERSONA} batalhas com um gosto declarado.
            &ldquo;Dividida&rdquo; existe para cair no caso em que os dois primeiros
            arquétipos ficam perto demais.
          </p>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => simular(persona)}
                disabled={carregando}
                title={persona.descricao}
                className="border-linha-forte text-tinta-suave hover:border-tinta hover:text-tinta rounded-full border px-3 py-1.5 text-[12px] transition-colors disabled:opacity-40"
              >
                {persona.nome}
              </button>
            ))}
            <button
              type="button"
              onClick={reiniciar}
              className="text-tinta-tenue hover:text-tinta px-3 py-1.5 text-[12px] underline underline-offset-4 transition-colors"
            >
              Zerar
            </button>
          </div>

          {erro && <p className="text-acento mt-3 text-[12px]">{erro}</p>}
        </div>
      </div>

      <Motor
        perfil={perfil}
        novas={Math.max(0, batalhas.length - contadas)}
        duracao={duracao}
        carregando={carregando}
        modo={modo}
        escala={escala}
        resumo={resumo}
        aoTrocarModo={setModo}
        aoTrocarEscala={setEscala}
        aoTrocarResumo={setResumo}
        aoRecalcular={() => calcular(batalhas)}
      />
    </div>
  )
}

function TelaInicial({ aoComecar }: { aoComecar: () => void }) {
  return (
    <div className="flex h-full flex-col justify-between px-6 pt-16 pb-7">
      <span className="rotulo">Style4U</span>

      <div>
        <h2 className="font-serifa text-[40px] leading-[0.98] tracking-[-0.015em]">
          O seu perfil de estilo
        </h2>
        <p className="text-tinta-suave mt-4 max-w-[250px] text-[14px] leading-relaxed">
          Duas peças por vez. Você escolhe a que levaria e o resto é conta nossa.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={aoComecar}
          className="bg-tinta text-superficie w-full rounded-full py-3 text-[13px] font-medium"
        >
          Começar
        </button>
        <p className="text-tinta-tenue mt-2.5 text-center text-[11px]">
          {MIN_BATALHAS} batalhas para o perfil fechar
        </p>
      </div>
    </div>
  )
}
