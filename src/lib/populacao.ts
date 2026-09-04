import { comporEmbedding, type Eixos } from './acervo'
import { ARQUETIPOS, CONJUNTO, EIXO_COMUM, VERSAO_DO_CONJUNTO } from './arquetipos'
import { vetorDoPerfil, type ModoVetor } from './gosto'
import { criarRng, normal, semente } from './rng'
import { simular } from './simulacao'
import { cosseno, remover } from './vetores'

/**
 * A cosine on its own says nothing to a user. "0,84 de afinidade com Estrutural"
 * is only meaningful next to what everybody else scores, so the screen shows a
 * position inside this distribution instead of the similarity itself.
 *
 * Here the distribution comes from a synthetic population. In production it is
 * the same calculation over the real users, recomputed with the reference set
 * and stored beside it: the pair (reference set, distribution) is what a profile
 * is comparable against, which is why they carry the same version.
 */
const TAMANHO = 400
const BATALHAS_POR_PESSOA = 22

export interface Estatistica {
  media: number
  desvio: number
}

function pessoaSintetica(rng: () => number) {
  const principal = ARQUETIPOS[Math.floor(rng() * ARQUETIPOS.length)] ?? ARQUETIPOS[0]!
  const secundario = ARQUETIPOS[Math.floor(rng() * ARQUETIPOS.length)] ?? ARQUETIPOS[0]!
  const peso = 0.55 + rng() * 0.45

  const eixos: Eixos = {}
  for (const [eixo, valor] of Object.entries(principal.eixos)) {
    eixos[eixo as keyof Eixos] = valor * peso
  }
  for (const [eixo, valor] of Object.entries(secundario.eixos)) {
    const chave = eixo as keyof Eixos
    eixos[chave] = (eixos[chave] ?? 0) + valor * (1 - peso)
  }
  for (const chave of Object.keys(eixos) as (keyof Eixos)[]) {
    eixos[chave] = Math.max(0, (eixos[chave] ?? 0) + normal(rng) * 0.15)
  }

  return comporEmbedding(eixos)
}

const cache = new Map<ModoVetor, Record<string, Estatistica>>()

export function estatisticas(modo: ModoVetor): Record<string, Estatistica> {
  const guardado = cache.get(modo)
  if (guardado) return guardado

  const rng = criarRng(semente(VERSAO_DO_CONJUNTO + ':populacao:' + modo))
  const amostras: Record<string, number[]> = {}
  for (const arquetipo of CONJUNTO) amostras[arquetipo.id] = []

  for (let i = 0; i < TAMANHO; i += 1) {
    const residuo = remover(vetorDoPerfil(simular(pessoaSintetica(rng), BATALHAS_POR_PESSOA, rng), modo), EIXO_COMUM)
    for (const arquetipo of CONJUNTO) {
      amostras[arquetipo.id]?.push(cosseno(residuo, remover(arquetipo.centroide, EIXO_COMUM)))
    }
  }

  const resultado: Record<string, Estatistica> = {}
  for (const [id, valores] of Object.entries(amostras)) {
    const m = valores.reduce((acc, v) => acc + v, 0) / valores.length
    const variancia = valores.reduce((acc, v) => acc + (v - m) ** 2, 0) / valores.length
    resultado[id] = { media: m, desvio: Math.sqrt(variancia) }
  }

  cache.set(modo, resultado)
  return resultado
}
