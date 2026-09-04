import { criarRng, semente } from './rng'
import { escalar, normalizar, produto, somar, subtrair, type Vetor } from './vetores'

/**
 * Two dimensions out of eighteen, by power iteration.
 *
 * The map on screen is not decoration: it is the only way to see that two
 * archetypes a user scores almost the same against are also next to each other
 * in the space, which is what the margin rule is protecting against. The
 * projection is computed over the reference set alone, so it does not move when
 * a user is added, and the user is placed inside a frame that already existed.
 */
export interface Plano {
  eixos: [Vetor, Vetor]
  centro: Vetor
  escala: number
}

export interface Ponto {
  x: number
  y: number
}

function componentePrincipal(amostras: Vetor[], dimensoes: number): Vetor {
  const rng = criarRng(semente('projecao'))
  let v = normalizar(Array.from({ length: dimensoes }, () => rng() - 0.5))

  for (let passo = 0; passo < 240; passo += 1) {
    let proximo: Vetor = new Array(dimensoes).fill(0)
    for (const amostra of amostras) {
      proximo = somar(proximo, escalar(amostra, produto(amostra, v)))
    }
    const norma = Math.sqrt(produto(proximo, proximo))
    if (norma === 0) return v
    v = escalar(proximo, 1 / norma)
  }

  return v
}

export function montarPlano(referencias: Vetor[]): Plano {
  const dimensoes = referencias[0]?.length ?? 0
  const centro = escalar(
    referencias.reduce((acc, v) => somar(acc, v)),
    1 / referencias.length
  )

  const centradas = referencias.map((v) => subtrair(v, centro))
  const primeiro = componentePrincipal(centradas, dimensoes)

  // Deflação: tirado o primeiro eixo, o segundo é o principal do que sobrou.
  const restos = centradas.map((v) => subtrair(v, escalar(primeiro, produto(v, primeiro))))
  const segundo = componentePrincipal(restos, dimensoes)

  const escala = Math.max(
    ...centradas.map((v) =>
      Math.max(Math.abs(produto(v, primeiro)), Math.abs(produto(v, segundo)))
    ),
    1e-6
  )

  return { eixos: [primeiro, segundo], centro, escala }
}

export function projetar(plano: Plano, vetor: Vetor): Ponto {
  const relativo = subtrair(vetor, plano.centro)

  return {
    x: produto(relativo, plano.eixos[0]) / plano.escala,
    y: produto(relativo, plano.eixos[1]) / plano.escala,
  }
}
