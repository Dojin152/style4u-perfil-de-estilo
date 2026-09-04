import { EIXOS, vetorDoLook } from './acervo'
import { media, normalizar, subtrair, type Vetor } from './vetores'

export interface Batalha {
  vencedor: string
  perdedor: string
}

/** How the taste vector is built out of the battles. */
export type ModoVetor = 'media' | 'direcao'

/**
 * The mean of what the user chose is dominated by the catalogue: if most of what
 * the partner stores carry is neutral and casual, everybody's centroid lands in
 * the same place. `direcao` subtracts the mean of what lost the same battles, so
 * what the two looks had in common cancels and what is left is the preference.
 */
export function vetorDoPerfil(batalhas: Batalha[], modo: ModoVetor): Vetor {
  if (batalhas.length === 0) return EIXOS.map(() => 0)

  const vencedores = media(batalhas.map((b) => vetorDoLook(b.vencedor)))
  if (modo === 'media') return normalizar(vencedores)

  const perdedores = media(batalhas.map((b) => vetorDoLook(b.perdedor)))
  return normalizar(subtrair(vencedores, perdedores))
}
