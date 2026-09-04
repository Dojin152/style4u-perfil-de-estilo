/**
 * Deterministic PRNG. Every synthetic number in this demo (the reference set,
 * the population used for the z scores, the auto-played battles) comes from a
 * named seed, so two people opening the page see the same profile and a bug is
 * reproducible from the seed alone.
 */
export function criarRng(semente: number) {
  let estado = semente >>> 0

  return function proximo() {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Seed derived from a string, so seeds can be named instead of numbered. */
export function semente(texto: string) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Box-Muller. Used to jitter the reference images around each prototype. */
export function normal(rng: () => number) {
  const u = Math.max(rng(), Number.EPSILON)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
