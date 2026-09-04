'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { Look } from '@/lib/acervo'
import { pedirPerfil } from '@/lib/api'
import { jogarComo, PERSONAS, type Persona } from '@/lib/personas'
import { MIN_BATALHAS, type Batalha, type Escala, type ModoVetor, type Perfil } from '@/lib/perfil'
import { criarRng, semente } from '@/lib/rng'
import { sortearPar } from '@/lib/simulacao'
import { Acervo } from './acervo'
import { Aparelho } from './aparelho'
import { Galeria } from './galeria'
import { LinhaDoTempo } from './linha-do-tempo'
import { Mapa } from './mapa'
import { Motor } from './motor'
import { Revelacao } from './revelacao'
import { Revelar } from './revelar'
import { TelaDeBatalha } from './tela-de-batalha'

const BATALHAS_DA_PERSONA = 24

export function Experiencia() {
  // Semeado para que a sequência de pares seja a mesma para todo mundo que abre
  // a página, e para que nada aleatório rode durante a renderização no servidor.
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
  const [selecionado, setSelecionado] = useState<string | null>(null)

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
    <>
      <section id="produto" className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(300px,352px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
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

            <div className="mt-8">
              <p className="rotulo">Atalhos da demonstração</p>
              <p className="text-tinta-suave mt-2.5 text-[13px] leading-relaxed">
                Cada persona joga {BATALHAS_DA_PERSONA} batalhas com um gosto declarado.
                &ldquo;Dividida&rdquo; existe para cair no caso em que os dois primeiros
                arquétipos ficam perto demais.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
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
      </section>

      <section id="mapa" className="border-linha border-t">
        <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
          <Revelar>
            <Cabecalho
              numero="05"
              titulo="O conjunto de referências"
              texto="Seis arquétipos, seis imagens cada um, versionados juntos. O mapa é esse mesmo espaço achatado em duas dimensões pelas suas próprias direções de maior variação, e o plano sai só das referências: ele não se mexe quando alguém joga mais uma batalha."
            />
          </Revelar>

          <Revelar atraso={0.08} className="mt-14">
            <Galeria selecionado={selecionado} aoSelecionar={setSelecionado} />
          </Revelar>

          <div className="mt-px grid gap-px lg:grid-cols-[1fr_1.05fr]">
            <Revelar className="painel p-6 sm:p-8">
              <p className="rotulo">Mapa</p>
              <p className="text-tinta-suave mt-2 mb-6 max-w-md text-[13px] leading-relaxed">
                Toque num arquétipo para ler o que ele é. O ponto quente é você, e ele se
                move quando os interruptores acima trocam a maneira de construir o vetor.
                Dois arquétipos que o texto separa bem podem ficar colados aqui, e é
                exatamente contra isso que a margem protege a tela.
              </p>
              <Mapa
                perfil={perfil}
                modo={modo}
                selecionado={selecionado}
                aoSelecionar={setSelecionado}
              />
            </Revelar>

            <Revelar atraso={0.08} className="painel p-6 sm:p-8">
              <p className="rotulo">Como o perfil se firmou</p>
              <p className="text-tinta-suave mt-2 mb-8 max-w-md text-[13px] leading-relaxed">
                O mesmo perfil recalculado depois de cada batalha. É o que mostra que o
                arquétipo não chega pronto: ele se firma, às vezes troca de líder no meio do
                caminho, e a margem demora a virar uma frase que a tela pode dizer.
              </p>
              <LinhaDoTempo perfil={perfil} modo={modo} />

              <div className="border-linha mt-10 border-t pt-6">
                <p className="rotulo">Instantâneo</p>
                <p className="text-tinta-suave mt-2 text-[13px] leading-relaxed">
                  Jogue mais batalhas com a revelação aberta e a tela continua mostrando o
                  que foi compartilhado, até você recalcular.
                </p>
              </div>
            </Revelar>
          </div>
        </div>
      </section>

      <section id="acervo" className="border-linha border-t">
        <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
          <Revelar>
            <Cabecalho
              numero="06"
              titulo="O acervo que o endpoint lê"
              texto="Trinta e seis looks com marca, ocasião, cores e etiquetas de estilo. Toda afirmação sobre o gosto de alguém vale o que vale o acervo que a produziu: o que as lojas parceiras carregam decide o que “dominante” pode significar. Com batalhas jogadas, cada peça mostra o seu retrospecto."
            />
          </Revelar>

          <Revelar atraso={0.08} className="mt-14">
            <Acervo batalhas={batalhas} />
          </Revelar>
        </div>
      </section>
    </>
  )
}

function Cabecalho({
  numero,
  titulo,
  texto,
}: {
  numero: string
  titulo: string
  texto: string
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-20">
      <div className="flex gap-5">
        <span className="text-tinta-tenue mt-3 font-mono text-[11px]">{numero}</span>
        <h2 className="font-serifa text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em]">
          {titulo}
        </h2>
      </div>
      <p className="text-tinta-suave max-w-xl self-end text-[15px] leading-relaxed">{texto}</p>
    </div>
  )
}

function TelaInicial({ aoComecar }: { aoComecar: () => void }) {
  return (
    <div className="flex h-full flex-col justify-between bg-[#0d0d0f] px-6 pt-16 pb-7">
      <span className="rotulo">Style4U</span>

      <div>
        <h2 className="font-serifa text-[42px] leading-[0.98] tracking-[-0.02em]">
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
          className="bg-tinta text-noite w-full rounded-full py-3 text-[13px] font-medium"
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
