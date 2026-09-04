import { comporEmbedding, type Eixos } from './acervo'
import { criarRng, normal, semente } from './rng'
import { media, normalizar, type Vetor } from './vetores'

/**
 * The reference set.
 *
 * In production these are the images the client supplies: the pipeline that
 * already exists computes one embedding per image and the centroid is the mean
 * of them. Here the images are stood in for by a prototype plus jitter, seeded
 * so the set is identical on every machine. What matters for the demo is the
 * shape of the problem, not the pictures: several references per archetype,
 * averaged, versioned together, and never edited in place.
 */
export interface Arquetipo {
  id: string
  nome: string
  frase: string
  descricao: string
  paleta: string[]
  tinta: string
  /** Uma das seis fotografias que a revelação e o cartão usam de fundo. */
  imagem: string
  eixos: Eixos
}

export const ARQUETIPOS: Arquetipo[] = [
  {
    id: 'estrutural',
    imagem: '/arquetipos/estrutural.jpg',
    nome: 'Minimalista Estrutural',
    frase: 'Pouca peça, corte exato.',
    descricao:
      'Silhueta limpa, paleta curta e nenhum detalhe que não sustente o corte. Compra pouco e usa muito.',
    paleta: ['#14120f', '#efe9df', '#c9b79b'],
    tinta: '#14120f',
    eixos: { estrutura: 0.95, minimal: 1, neutro: 0.9, formal: 0.5, justeza: 0.5 },
  },
  {
    id: 'romantico',
    imagem: '/arquetipos/romantico.jpg',
    nome: 'Romântico Suave',
    frase: 'O tecido decide antes do corte.',
    descricao:
      'Caimento fluido, tons claros e detalhe artesanal. A peça pode ser simples desde que o tecido tenha movimento.',
    paleta: ['#e3bfbc', '#efe9df', '#b6a5c8'],
    tinta: '#7d4a52',
    eixos: { romantico: 1, fluidez: 0.9, claro: 0.8, textura: 0.5, brilho: 0.35 },
  },
  {
    id: 'urbano',
    imagem: '/arquetipos/urbano.jpg',
    nome: 'Urbano de Rua',
    frase: 'Conforto que não pede licença.',
    descricao:
      'Volume, tênis e camadas. Referência de rua acima de referência de passarela, e roupa que aguenta o dia inteiro.',
    paleta: ['#3b3b3d', '#535c3c', '#efe9df'],
    tinta: '#26261f',
    eixos: { urbano: 1, volume: 0.9, esporte: 0.8, estampa: 0.4, escuro: 0.5 },
  },
  {
    id: 'classico',
    imagem: '/arquetipos/classico.jpg',
    nome: 'Clássico de Trabalho',
    frase: 'A mesma regra há trinta anos.',
    descricao:
      'Alfaiataria, camisa e sapato fechado. Aposta em peça que não sai de moda e em combinação previsível de propósito.',
    paleta: ['#1e2a44', '#efe9df', '#b0834f'],
    tinta: '#1e2a44',
    eixos: { formal: 1, estrutura: 0.85, vintage: 0.5, neutro: 0.7, justeza: 0.5 },
  },
  {
    id: 'solar',
    imagem: '/arquetipos/solar.jpg',
    nome: 'Solar de Verão',
    frase: 'Textura natural, cor de terra.',
    descricao:
      'Linho, croché, palha e estampa. Paleta quente, peça larga e uma leitura de férias mesmo em dia útil.',
    paleta: ['#b0563a', '#ddd0bd', '#535c3c'],
    tinta: '#8a4023',
    eixos: { textura: 1, vintage: 0.8, estampa: 0.7, saturacao: 0.6, fluidez: 0.6 },
  },
  {
    id: 'noturno',
    imagem: '/arquetipos/noturno.jpg',
    nome: 'Editorial Noturno',
    frase: 'Uma peça que ocupa a sala.',
    descricao:
      'Preto, brilho e ombro construído. Prefere a peça que chama atenção sozinha e dispensa acessório.',
    paleta: ['#14120f', '#5c2130', '#b9bcc0'],
    tinta: '#14120f',
    eixos: { dramatico: 1, escuro: 0.9, brilho: 0.6, estrutura: 0.7, formal: 0.4 },
  },
]

/** Bumped whenever a reference image is added, replaced or re-cropped. */
export const VERSAO_DO_CONJUNTO = 'ref-2026.09-a'
export const REFERENCIAS_POR_ARQUETIPO = 6

/**
 * Six references per archetype. One image per archetype would make the centroid
 * a copy of a single photograph, and the whole ranking would inherit whatever is
 * accidental in it: the model of the mannequin, the light, the ground colour.
 */
function referencias(arquetipo: Arquetipo): Vetor[] {
  const rng = criarRng(semente(VERSAO_DO_CONJUNTO + ':' + arquetipo.id))

  return Array.from({ length: REFERENCIAS_POR_ARQUETIPO }, () => {
    const jitter: Eixos = {}
    for (const [eixo, valor] of Object.entries(arquetipo.eixos)) {
      jitter[eixo as keyof Eixos] = Math.max(0, valor + normal(rng) * 0.22)
    }
    return comporEmbedding(jitter)
  })
}

export interface ArquetipoCalculado extends Arquetipo {
  centroide: Vetor
  amostras: Vetor[]
}

export const CONJUNTO: ArquetipoCalculado[] = ARQUETIPOS.map((arquetipo) => {
  const amostras = referencias(arquetipo)
  return { ...arquetipo, amostras, centroide: normalizar(media(amostras)) }
})

/**
 * The mean of the reference set. Everything the archetypes have in common lives
 * here, and it is exactly what has to come out of both sides before comparing.
 */
export const EIXO_COMUM = normalizar(media(CONJUNTO.map((a) => a.centroide)))

export function arquetipo(id: string): ArquetipoCalculado {
  const encontrado = CONJUNTO.find((item) => item.id === id)
  if (!encontrado) throw new Error('Arquétipo inexistente: ' + id)
  return encontrado
}
