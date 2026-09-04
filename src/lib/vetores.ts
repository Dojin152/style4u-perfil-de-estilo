/**
 * Vector helpers for the archetype layer.
 *
 * The demo does not run CLIP. It builds embeddings with the same property that
 * makes the real ones tricky: a large component shared by every image in the
 * domain. See `acervo.ts` for how that component is added, and `perfil.ts` for
 * what has to be done about it before a number reaches the screen.
 */
export type Vetor = number[]

export function somar(a: Vetor, b: Vetor): Vetor {
  return a.map((valor, i) => valor + (b[i] ?? 0))
}

export function subtrair(a: Vetor, b: Vetor): Vetor {
  return a.map((valor, i) => valor - (b[i] ?? 0))
}

export function escalar(a: Vetor, k: number): Vetor {
  return a.map((valor) => valor * k)
}

export function produto(a: Vetor, b: Vetor): number {
  let total = 0
  for (let i = 0; i < a.length; i += 1) total += (a[i] ?? 0) * (b[i] ?? 0)
  return total
}

export function norma(a: Vetor): number {
  return Math.sqrt(produto(a, a))
}

export function normalizar(a: Vetor): Vetor {
  const n = norma(a)
  return n === 0 ? a.map(() => 0) : a.map((valor) => valor / n)
}

export function media(vetores: Vetor[]): Vetor {
  if (vetores.length === 0) return []
  const total = vetores.reduce((acc, v) => somar(acc, v))
  return escalar(total, 1 / vetores.length)
}

/** Cosine similarity. Both sides are normalised first so the call is safe. */
export function cosseno(a: Vetor, b: Vetor): number {
  const na = norma(a)
  const nb = norma(b)
  if (na === 0 || nb === 0) return 0
  return produto(a, b) / (na * nb)
}

/**
 * Removes the component of `v` that lies along `eixo` and renormalises.
 *
 * This is the whole fix for the narrow cone: with `eixo` set to the mean of the
 * reference set, what is left is the part of the taste vector that actually
 * distinguishes one archetype from another. Without it every user sits within a
 * few hundredths of every archetype and the ranking is decided by whichever
 * reference image happens to be the most generic.
 */
export function remover(v: Vetor, eixo: Vetor): Vetor {
  const unidade = normalizar(eixo)
  const projecao = produto(v, unidade)
  return normalizar(subtrair(v, escalar(unidade, projecao)))
}

/** Standard normal CDF, for turning a z score into a percentile. */
export function percentil(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804014327 * Math.exp(-(z * z) / 2)
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z >= 0 ? 1 - p : p
}
