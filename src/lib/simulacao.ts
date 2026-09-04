import { ACERVO, comporEmbedding, vetorDoLook, type Eixos, type Look } from './acervo'
import { arquetipo } from './arquetipos'
import type { Batalha } from './gosto'
import { cosseno, type Vetor } from './vetores'

/**
 * Battles played by a made-up person, used by the population that calibrates the
 * z scores and by the personas on the page. One pick in six goes against the
 * taste vector: a population that always chooses the closer look is tighter than
 * any real one, and the scores calibrated against it would be too generous.
 */
const DISTRACAO = 0.17

export function gostoDeMistura(pesos: Record<string, number>): Vetor {
  const eixos: Eixos = {}

  for (const [id, peso] of Object.entries(pesos)) {
    for (const [eixo, valor] of Object.entries(arquetipo(id).eixos)) {
      const chave = eixo as keyof Eixos
      eixos[chave] = (eixos[chave] ?? 0) + valor * peso
    }
  }

  return comporEmbedding(eixos)
}

export function sortearPar(rng: () => number, evitar?: string): [Look, Look] | null {
  for (let tentativa = 0; tentativa < 40; tentativa += 1) {
    const a = ACERVO[Math.floor(rng() * ACERVO.length)]
    const b = ACERVO[Math.floor(rng() * ACERVO.length)]
    if (!a || !b || a.id === b.id) continue
    if (evitar && (a.id === evitar || b.id === evitar)) continue
    return [a, b]
  }

  return null
}

export function simular(gosto: Vetor, quantidade: number, rng: () => number): Batalha[] {
  const batalhas: Batalha[] = []

  while (batalhas.length < quantidade) {
    const par = sortearPar(rng)
    if (!par) break

    const [a, b] = par
    const distraido = rng() < DISTRACAO
    const prefereA = cosseno(gosto, vetorDoLook(a.id)) >= cosseno(gosto, vetorDoLook(b.id))
    const vencedor = prefereA !== distraido ? a : b

    batalhas.push({
      vencedor: vencedor.id,
      perdedor: vencedor === a ? b.id : a.id,
    })
  }

  return batalhas
}
