import { describe, expect, it } from 'vitest'
import { ACERVO, vetorDoLook } from './acervo'
import { CONJUNTO, EIXO_COMUM } from './arquetipos'
import {
  calcularPerfil,
  comExposicaoMinima,
  MIN_BATALHAS,
  vetorDoPerfil,
  type Batalha,
} from './perfil'
import { cosseno } from './vetores'

/**
 * Battles between the looks that sit at opposite ends of one archetype, so the
 * expected answer is known without running the app.
 */
function batalhasEntre(vencedores: string[], perdedores: string[]): Batalha[] {
  return vencedores.flatMap((vencedor) =>
    perdedores.map((perdedor) => ({ vencedor, perdedor }))
  )
}

const ESTRUTURAL = ['l01', 'l03', 'l05', 'l06', 'l33']
const SOLAR = ['l24', 'l25', 'l26', 'l23', 'l10']

describe('o cone', () => {
  const entreLooks = ACERVO.flatMap((a, i) =>
    ACERVO.slice(i + 1).map((b) => cosseno(vetorDoLook(a.id), vetorDoLook(b.id)))
  )
  const entreCentroides = CONJUNTO.flatMap((a, i) =>
    CONJUNTO.slice(i + 1).map((b) => cosseno(a.centroide, b.centroide))
  )

  it('mantém dois looks quaisquer do acervo acima de 0,7 de cosseno', () => {
    expect(Math.min(...entreLooks)).toBeGreaterThan(0.7)
  })

  it('deixa os centróides de arquétipo ainda mais parecidos entre si', () => {
    // Média de seis referências: parte do que distinguia cada imagem se cancela
    // e sobra o que todas têm em comum. É por isso que o problema piora
    // justamente na camada que precisa separar.
    expect(Math.min(...entreCentroides)).toBeGreaterThan(Math.min(...entreLooks))
  })
})

describe('escala', () => {
  const perfil = calcularPerfil(batalhasEntre(ESTRUTURAL, SOLAR))
  const pontuacoes = perfil.variantes.direcao.pontuacoes

  it('não separa nada em cosseno cru: primeiro e segundo ficam a centésimos', () => {
    // A implementação direta do enunciado: média do que foi escolhido, cosseno
    // contra cada centróide, o valor que sai vai para a tela.
    const cru = [...perfil.variantes.media.pontuacoes].sort((a, b) => b.cru - a.cru)
    const distancia = (cru[0]?.cru ?? 0) - (cru[1]?.cru ?? 0)

    expect(distancia).toBeLessThan(0.05)
  })

  it('separa depois de tirar o eixo comum e comparar com a base de usuários', () => {
    const distancia = (pontuacoes[0]?.z ?? 0) - (pontuacoes[1]?.z ?? 0)

    expect(distancia).toBeGreaterThan(0.5)
    expect(pontuacoes[0]?.arquetipo).toBe('estrutural')
  })
})

describe('vetor do perfil', () => {
  it('a direção fica mais longe da média do acervo do que a média das escolhas', () => {
    const batalhas = batalhasEntre(ESTRUTURAL, SOLAR)
    const distancia = (modo: 'media' | 'direcao') =>
      Math.abs(cosseno(vetorDoPerfil(batalhas, modo), EIXO_COMUM))

    expect(distancia('direcao')).toBeLessThan(distancia('media'))
  })

  it('ignora o que os dois looks da batalha têm em comum', () => {
    const perfil = calcularPerfil(batalhasEntre(['l05'], ['l28']))
    const direcao = perfil.variantes.direcao.pontuacoes

    // l05 e l28 são os dois pretos e estruturados: o que sobra da diferença não
    // pode ser "escuro", tem que ser o que os separa.
    expect(direcao[0]?.arquetipo).not.toBe('noturno')
  })
})

describe('agregações', () => {
  const perfil = calcularPerfil(batalhasEntre(ESTRUTURAL, SOLAR))

  it('separa participação de índice contra a base', () => {
    const cru = perfil.cores.find((cor) => cor.chave === 'cru')

    // "cru" aparece dos dois lados da batalha, então é dominante em participação
    // e mediano em índice. É o caso que o resumo por dominância erra sozinho.
    expect(cru?.exposicoes ?? 0).toBeGreaterThan(cru?.vitorias ?? 0)
    expect(cru?.indice ?? 0).toBeLessThan(1.2)
  })

  it('dá índice alto para a cor que ganha sempre que aparece', () => {
    const preto = perfil.cores.find((cor) => cor.chave === 'preto')

    expect(preto?.indice ?? 0).toBeGreaterThan(1.4)
  })
})

describe('ranking das agregações', () => {
  it('desempata duas taxas iguais pela quantidade de evidência', () => {
    // Lilás e preto ganharam os mesmos quatro quintos das vezes em que
    // apareceram, um em cinco batalhas e o outro em vinte. A taxa crua empata;
    // só uma das duas é um fato sobre a pessoa.
    const batalhas: Batalha[] = [
      ...Array.from({ length: 4 }, () => ({ vencedor: 'l12', perdedor: 'l24' })),
      { vencedor: 'l24', perdedor: 'l12' },
      ...Array.from({ length: 16 }, () => ({ vencedor: 'l05', perdedor: 'l10' })),
      ...Array.from({ length: 4 }, () => ({ vencedor: 'l10', perdedor: 'l05' })),
    ]

    const cores = comExposicaoMinima(calcularPerfil(batalhas).cores)
    const preto = cores.findIndex((cor) => cor.chave === 'preto')
    const lilas = cores.findIndex((cor) => cor.chave === 'lilas')

    expect(preto).toBeGreaterThanOrEqual(0)
    expect(preto).toBeLessThan(lilas)
  })

  it('esconde a etiqueta que apareceu menos que o mínimo', () => {
    const perfil = calcularPerfil([{ vencedor: 'l12', perdedor: 'l24' }])

    expect(perfil.cores.some((cor) => cor.chave === 'lilas')).toBe(true)
    expect(comExposicaoMinima(perfil.cores)).toHaveLength(0)
  })
})

describe('mapa e explicação', () => {
  const perfil = calcularPerfil(batalhasEntre(ESTRUTURAL, SOLAR))

  it('desenha os seis arquétipos num plano estável', () => {
    expect(perfil.mapa).toHaveLength(6)
    for (const ponto of perfil.mapa) {
      expect(Math.abs(ponto.x)).toBeLessThanOrEqual(1.0001)
      expect(Math.abs(ponto.y)).toBeLessThanOrEqual(1.0001)
    }

    // O plano sai só das referências, então não muda com o usuário.
    const outro = calcularPerfil(batalhasEntre(SOLAR, ESTRUTURAL))
    expect(outro.mapa).toEqual(perfil.mapa)
  })

  it('põe o usuário do lado do arquétipo que venceu', () => {
    const alvo = perfil.mapa.find((ponto) => ponto.arquetipo === 'estrutural')
    const oposto = perfil.mapa.find((ponto) => ponto.arquetipo === 'solar')
    const usuario = perfil.variantes.direcao.ponto

    const distancia = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y)

    expect(distancia(usuario, alvo!)).toBeLessThan(distancia(usuario, oposto!))
  })

  it('explica o resultado por eixos, e as parcelas somam o todo', () => {
    const explicacao = perfil.variantes.direcao.explicacao
    const total = explicacao.reduce((acc, item) => acc + Math.abs(item.peso), 0)

    expect(explicacao.length).toBeGreaterThan(2)
    expect(total).toBeGreaterThan(0.5)
    expect(total).toBeLessThanOrEqual(1.0001)
    expect(explicacao[0]?.palavra).toBeTruthy()
  })
})

describe('linha do tempo', () => {
  it('recalcula o perfil a cada passo e termina no número de batalhas jogadas', () => {
    const batalhas = batalhasEntre(ESTRUTURAL, SOLAR)
    const marcos = calcularPerfil(batalhas).historico.direcao

    expect(marcos.length).toBeGreaterThan(3)
    expect(marcos[0]?.batalha).toBe(1)
    expect(marcos[marcos.length - 1]?.batalha).toBe(batalhas.length)
  })

  it('não devolve linha do tempo sem batalha', () => {
    expect(calcularPerfil([]).historico.direcao).toEqual([])
  })
})

describe('perfil incompleto', () => {
  it('não fecha antes do mínimo de batalhas', () => {
    const perfil = calcularPerfil([{ vencedor: 'l01', perdedor: 'l24' }])

    expect(perfil.completo).toBe(false)
    expect(perfil.faltam).toBe(MIN_BATALHAS - 1)
  })

  it('descarta batalha com look inexistente', () => {
    const perfil = calcularPerfil([{ vencedor: 'l01', perdedor: 'nao-existe' }])

    expect(perfil.batalhas).toBe(0)
  })
})
