import { ACERVO, EIXOS, look, type Eixo, type Look } from './acervo'
import { CONJUNTO, EIXO_COMUM, VERSAO_DO_CONJUNTO } from './arquetipos'
import { PALAVRA_DO_EIXO } from './eixos'
import { vetorDoPerfil, type Batalha, type ModoVetor } from './gosto'
import { estatisticas } from './populacao'
import { montarPlano, projetar, type Ponto } from './projecao'
import { cosseno, norma, percentil, remover, type Vetor } from './vetores'

export type { Batalha, ModoVetor } from './gosto'
export { vetorDoPerfil } from './gosto'

/** What is done to the cosine before it is allowed on screen. */
export type Escala = 'cru' | 'centrado'

export const MIN_BATALHAS = 12
/** Below this gap in z the top two archetypes are reported as a blend. */
export const MARGEM_DE_MISTURA = 0.45
/** Below this many appearances a tag is not shown: the rate would be noise. */
export const MIN_EXPOSICOES = 5
/** 90% one-sided normal quantile, for the lower bound of the win rate. */
const CONFIANCA = 1.2816

export interface Pontuacao {
  arquetipo: string
  cru: number
  centrado: number
  z: number
  percentil: number
}

export interface Contribuicao {
  eixo: Eixo
  palavra: string
  peso: number
}

export interface Variante {
  modo: ModoVetor
  pontuacoes: Pontuacao[]
  margem: number
  mistura: boolean
  /** Onde o usuário cai no mesmo plano em que os arquétipos foram desenhados. */
  ponto: Ponto
  /** O que puxou o resultado para o primeiro colocado, e o que puxou contra. */
  explicacao: Contribuicao[]
}

export interface PontoDoMapa extends Ponto {
  arquetipo: string
}

export interface Marco {
  batalha: number
  lider: string
  z: number
  margem: number
}

export interface Agregado {
  chave: string
  vitorias: number
  exposicoes: number
  participacao: number
  taxa: number
  indice: number
}

export interface Perfil {
  versaoDoConjunto: string
  geradoEm: string
  batalhas: number
  completo: boolean
  faltam: number
  variantes: Record<ModoVetor, Variante>
  mapa: PontoDoMapa[]
  historico: Record<ModoVetor, Marco[]>
  cores: Agregado[]
  marcas: Agregado[]
  ocasioes: Agregado[]
  estilos: Agregado[]
}

function pontuar(vetor: Vetor, modo: ModoVetor): Pontuacao[] {
  const residuo = remover(vetor, EIXO_COMUM)
  const base = estatisticas(modo)

  const pontuacoes = CONJUNTO.map((arquetipo) => {
    const centrado = cosseno(residuo, remover(arquetipo.centroide, EIXO_COMUM))
    const { media: mu, desvio } = base[arquetipo.id] ?? { media: 0, desvio: 1 }
    const z = desvio === 0 ? 0 : (centrado - mu) / desvio

    return {
      arquetipo: arquetipo.id,
      cru: cosseno(vetor, arquetipo.centroide),
      centrado,
      z,
      percentil: percentil(z),
    }
  })

  return pontuacoes.sort((a, b) => b.z - a.z)
}

/**
 * O plano do mapa sai só do conjunto de referências, nunca dos usuários: assim
 * ele não se mexe quando alguém joga mais uma batalha, e duas pessoas podem ser
 * comparadas no mesmo desenho.
 */
const PLANO = montarPlano(CONJUNTO.map((arquetipo) => remover(arquetipo.centroide, EIXO_COMUM)))

const MAPA: PontoDoMapa[] = CONJUNTO.map((arquetipo) => ({
  arquetipo: arquetipo.id,
  ...projetar(PLANO, remover(arquetipo.centroide, EIXO_COMUM)),
}))

/**
 * Cosseno é uma soma sobre os eixos, então dá para dizer de onde ele veio: cada
 * parcela é a contribuição daquele eixo para o resultado, e o sinal diz se o
 * eixo puxou a favor ou contra.
 */
function explicar(vetor: Vetor, centroide: Vetor): Contribuicao[] {
  const u = remover(vetor, EIXO_COMUM)
  const a = remover(centroide, EIXO_COMUM)
  const divisor = norma(u) * norma(a)
  if (divisor === 0) return []

  const parcelas = EIXOS.map((eixo, i) => ({
    eixo,
    palavra: PALAVRA_DO_EIXO[eixo],
    peso: ((u[i] ?? 0) * (a[i] ?? 0)) / divisor,
  }))

  const total = parcelas.reduce((acc, item) => acc + Math.abs(item.peso), 0)

  return parcelas
    .map((item) => ({ ...item, peso: total === 0 ? 0 : item.peso / total }))
    .sort((x, y) => Math.abs(y.peso) - Math.abs(x.peso))
    .slice(0, 6)
}

function variante(batalhas: Batalha[], modo: ModoVetor): Variante {
  const vetor = vetorDoPerfil(batalhas, modo)
  const pontuacoes = pontuar(vetor, modo)
  const margem = (pontuacoes[0]?.z ?? 0) - (pontuacoes[1]?.z ?? 0)
  const primeiro = pontuacoes[0]

  return {
    modo,
    pontuacoes,
    margem,
    mistura: batalhas.length > 0 && margem < MARGEM_DE_MISTURA,
    ponto: projetar(PLANO, remover(vetor, EIXO_COMUM)),
    explicacao:
      batalhas.length === 0 || !primeiro
        ? []
        : explicar(vetor, CONJUNTO.find((a) => a.id === primeiro.arquetipo)?.centroide ?? vetor),
  }
}

/** No máximo esta quantidade de pontos na linha do tempo, seja qual for o número de batalhas. */
const PASSOS_DO_HISTORICO = 26

/**
 * O perfil recalculado a cada passo, do começo até agora. É o que mostra que o
 * arquétipo não aparece pronto: ele se firma, e às vezes troca de líder no meio.
 */
function historico(batalhas: Batalha[], modo: ModoVetor): Marco[] {
  if (batalhas.length === 0) return []

  const salto = Math.max(1, Math.ceil(batalhas.length / PASSOS_DO_HISTORICO))
  const marcos: Marco[] = []

  for (let ate = 1; ate <= batalhas.length; ate += salto) {
    const pontuacoes = pontuar(vetorDoPerfil(batalhas.slice(0, ate), modo), modo)
    const primeiro = pontuacoes[0]
    if (!primeiro) continue

    marcos.push({
      batalha: ate,
      lider: primeiro.arquetipo,
      z: primeiro.z,
      margem: primeiro.z - (pontuacoes[1]?.z ?? 0),
    })
  }

  const ultimo = marcos[marcos.length - 1]
  if (ultimo && ultimo.batalha !== batalhas.length) {
    const pontuacoes = pontuar(vetorDoPerfil(batalhas, modo), modo)
    const primeiro = pontuacoes[0]
    if (primeiro) {
      marcos.push({
        batalha: batalhas.length,
        lider: primeiro.arquetipo,
        z: primeiro.z,
        margem: primeiro.z - (pontuacoes[1]?.z ?? 0),
      })
    }
  }

  return marcos
}

/**
 * Aggregation over a tag.
 *
 * Two numbers, and they answer different questions. `participacao` is what the
 * brief asks for, the share of the user's picks: it is dominated by what the
 * catalogue offers, so half the users get told their colour is black. `indice`
 * is how often the tag won when it appeared, against the 50% it would get by
 * chance, and that one is a fact about the person. The losing look of every
 * battle is what makes the second number possible.
 */
function agregar(batalhas: Batalha[], chaves: (look: Look) => string[]): Agregado[] {
  const vitorias = new Map<string, number>()
  const exposicoes = new Map<string, number>()
  let totalDeEscolhas = 0

  const somar = (mapa: Map<string, number>, chave: string) =>
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1)

  for (const batalha of batalhas) {
    const escolhido = chaves(look(batalha.vencedor))
    const recusado = chaves(look(batalha.perdedor))

    for (const chave of escolhido) {
      somar(vitorias, chave)
      somar(exposicoes, chave)
      totalDeEscolhas += 1
    }
    for (const chave of recusado) somar(exposicoes, chave)
  }

  return [...exposicoes.entries()]
    .map(([chave, vezes]) => {
      const ganhas = vitorias.get(chave) ?? 0
      const taxa = pisoDaTaxa(ganhas, vezes)

      return {
        chave,
        vitorias: ganhas,
        exposicoes: vezes,
        participacao: totalDeEscolhas === 0 ? 0 : ganhas / totalDeEscolhas,
        taxa,
        indice: taxa / 0.5,
      }
    })
    .sort((a, b) => b.indice - a.indice)
}

/**
 * The lower bound of the win rate, not the win rate itself.
 *
 * Four wins out of five appearances is 80%, and so is eighty out of a hundred,
 * but only one of them is a fact about the person. Ranking by the raw rate puts
 * whatever appeared least at the top of the reveal; ranking by the bound puts
 * what the battles actually support there, and the number shown is one the
 * screen can defend.
 */
function pisoDaTaxa(vitorias: number, exposicoes: number) {
  if (exposicoes === 0) return 0.5

  const p = vitorias / exposicoes
  const z2 = CONFIANCA * CONFIANCA
  const centro = p + z2 / (2 * exposicoes)
  const margem =
    CONFIANCA * Math.sqrt((p * (1 - p) + z2 / (4 * exposicoes)) / exposicoes)

  return (centro - margem) / (1 + z2 / exposicoes)
}

/** Axis names are internal; these are the words the reveal screen can use. */
const NOMES_DE_ESTILO: Partial<Record<Eixo, string>> = {
  estrutura: 'alfaiataria',
  minimal: 'minimalista',
  volume: 'oversized',
  fluidez: 'fluido',
  romantico: 'romântico',
  urbano: 'streetwear',
  esporte: 'esportivo',
  formal: 'clássico',
  textura: 'artesanal',
  estampa: 'estampado',
  brilho: 'acetinado',
  dramatico: 'statement',
  vintage: 'retrô',
  justeza: 'justo',
}

function estilosDoLook(item: Look): string[] {
  return EIXOS.filter((eixo) => (item.eixos[eixo] ?? 0) >= 0.7)
    .map((eixo) => NOMES_DE_ESTILO[eixo])
    .filter((nome): nome is string => Boolean(nome))
}

export function calcularPerfil(batalhas: Batalha[], agora = new Date()): Perfil {
  const validas = batalhas.filter(
    (b) => b.vencedor !== b.perdedor && existe(b.vencedor) && existe(b.perdedor)
  )

  return {
    versaoDoConjunto: VERSAO_DO_CONJUNTO,
    geradoEm: agora.toISOString(),
    batalhas: validas.length,
    completo: validas.length >= MIN_BATALHAS,
    faltam: Math.max(0, MIN_BATALHAS - validas.length),
    variantes: {
      media: variante(validas, 'media'),
      direcao: variante(validas, 'direcao'),
    },
    mapa: MAPA,
    historico: {
      media: historico(validas, 'media'),
      direcao: historico(validas, 'direcao'),
    },
    cores: agregar(validas, (item) => item.cores),
    marcas: agregar(validas, (item) => [item.marca]),
    ocasioes: agregar(validas, (item) => [item.ocasiao]),
    estilos: agregar(validas, estilosDoLook),
  }
}

function existe(id: string) {
  return ACERVO.some((item) => item.id === id)
}

export function comExposicaoMinima(agregados: Agregado[]) {
  return agregados.filter((item) => item.exposicoes >= MIN_EXPOSICOES)
}

export function dominantes(agregados: Agregado[]) {
  return [...agregados].sort((a, b) => b.participacao - a.participacao)
}
