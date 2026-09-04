import { escalar, normalizar, somar, type Vetor } from './vetores'

/**
 * The eighteen axes the demo uses instead of a real visual encoder.
 *
 * In production this vector is whatever the existing pipeline already writes
 * for each catalogue item. Nothing downstream of `vetorDoLook` knows where the
 * numbers came from, which is the point: the archetype layer is a consumer of
 * the embedding, never its owner.
 */
export const EIXOS = [
  'estrutura',
  'fluidez',
  'volume',
  'justeza',
  'neutro',
  'saturacao',
  'escuro',
  'claro',
  'brilho',
  'textura',
  'estampa',
  'esporte',
  'formal',
  'romantico',
  'urbano',
  'vintage',
  'minimal',
  'dramatico',
] as const

export type Eixo = (typeof EIXOS)[number]
export type Eixos = Partial<Record<Eixo, number>>

/**
 * The component every image in the domain shares: a catalogue photo of clothing
 * on a plain ground, shot the same way. Real CLIP embeddings behave like this,
 * and it is the reason raw cosine between any two of them lands in a narrow
 * band instead of spreading over [-1, 1].
 */
const MEDIA_DO_DOMINIO: Record<Eixo, number> = {
  estrutura: 0.52,
  fluidez: 0.5,
  volume: 0.42,
  justeza: 0.5,
  neutro: 0.7,
  saturacao: 0.34,
  escuro: 0.52,
  claro: 0.5,
  brilho: 0.24,
  textura: 0.46,
  estampa: 0.3,
  esporte: 0.36,
  formal: 0.46,
  romantico: 0.32,
  urbano: 0.46,
  vintage: 0.3,
  minimal: 0.5,
  dramatico: 0.3,
}

/**
 * How much of each embedding is that shared component. Raising it narrows the
 * cone: at 1.8 two looks from opposite ends of the catalogue still sit around
 * 0.82 of cosine, and the archetype centroids sit even closer to each other,
 * because averaging six references cancels part of what made them different, which is the range
 * the real embeddings show once the images are all product shots of clothing.
 */
const PESO_DO_DOMINIO = 1.8

const BASE = normalizar(EIXOS.map((eixo) => MEDIA_DO_DOMINIO[eixo]))

export function vetorDeEixos(eixos: Eixos): Vetor {
  return normalizar(EIXOS.map((eixo) => eixos[eixo] ?? 0))
}

/** Style vector plus the domain component, normalised. */
export function comporEmbedding(eixos: Eixos): Vetor {
  return normalizar(somar(escalar(BASE, PESO_DO_DOMINIO), vetorDeEixos(eixos)))
}

export type Peca =
  | 'casaco'
  | 'blazer'
  | 'vestido'
  | 'saia'
  | 'calca'
  | 'camiseta'
  | 'tricot'
  | 'jaqueta'
  | 'camisa'
  | 'bota'
  | 'tenis'
  | 'bolsa'
  | 'chapeu'

export type Ocasiao = 'trabalho' | 'dia a dia' | 'noite' | 'evento' | 'viagem' | 'encontro'

export const CORES: Record<string, string> = {
  preto: '#14120f',
  'off-white': '#efe9df',
  cru: '#ddd0bd',
  areia: '#c9b79b',
  camel: '#b0834f',
  caramelo: '#8c5a2b',
  marrom: '#4f3a2c',
  marinho: '#1e2a44',
  'azul-claro': '#8fa8c4',
  cinza: '#8a8781',
  grafite: '#3b3b3d',
  vinho: '#5c2130',
  terracota: '#b0563a',
  oliva: '#535c3c',
  'rosa-claro': '#e3bfbc',
  lilas: '#b6a5c8',
  dourado: '#b99348',
  prata: '#b9bcc0',
}

export interface Look {
  id: string
  nome: string
  marca: string
  ocasiao: Ocasiao
  cores: string[]
  pecas: Peca[]
  fundo: string
  eixos: Eixos
}

/**
 * Thirty-six looks. Colours, brands and occasions are the fields the profile
 * endpoint aggregates; `eixos` is what the archetype layer reads. A look is
 * never tagged with an archetype: that relation is computed, not stored, which
 * is what lets the reference set be replaced without touching the catalogue.
 */
export const ACERVO: Look[] = [
  {
    id: 'l01',
    nome: 'Alfaiataria seca',
    marca: 'Linha Reta',
    ocasiao: 'trabalho',
    cores: ['preto', 'off-white'],
    pecas: ['blazer', 'calca', 'bota'],
    fundo: '#e6e1d8',
    eixos: { estrutura: 0.95, formal: 0.8, minimal: 0.9, neutro: 0.9, justeza: 0.6 },
  },
  {
    id: 'l02',
    nome: 'Trench cru',
    marca: 'Casa Nove',
    ocasiao: 'trabalho',
    cores: ['cru', 'areia'],
    pecas: ['casaco', 'calca', 'bolsa'],
    fundo: '#e9e3d6',
    eixos: { estrutura: 0.8, neutro: 1, minimal: 0.75, claro: 0.7, formal: 0.55 },
  },
  {
    id: 'l03',
    nome: 'Camisa e saia lápis',
    marca: 'Linha Reta',
    ocasiao: 'trabalho',
    cores: ['off-white', 'grafite'],
    pecas: ['camisa', 'saia', 'bota'],
    fundo: '#e4e2de',
    eixos: { estrutura: 0.7, formal: 0.9, justeza: 0.8, neutro: 0.8, minimal: 0.6 },
  },
  {
    id: 'l04',
    nome: 'Tricot cinza e reta larga',
    marca: 'Casa Nove',
    ocasiao: 'dia a dia',
    cores: ['cinza', 'off-white'],
    pecas: ['tricot', 'calca', 'tenis'],
    fundo: '#e7e6e2',
    eixos: { minimal: 0.9, neutro: 0.95, volume: 0.6, textura: 0.6, fluidez: 0.4 },
  },
  {
    id: 'l05',
    nome: 'Preto sobre preto',
    marca: 'Meia-Noite',
    ocasiao: 'noite',
    cores: ['preto'],
    pecas: ['tricot', 'calca', 'bota'],
    fundo: '#d9d7d3',
    eixos: { minimal: 0.85, escuro: 1, neutro: 0.7, estrutura: 0.6, dramatico: 0.4 },
  },
  {
    id: 'l06',
    nome: 'Colete de alfaiataria',
    marca: 'Linha Reta',
    ocasiao: 'trabalho',
    cores: ['marinho', 'off-white'],
    pecas: ['blazer', 'calca', 'bolsa'],
    fundo: '#e2e4e6',
    eixos: { estrutura: 0.9, formal: 0.85, minimal: 0.7, neutro: 0.6, justeza: 0.5 },
  },
  {
    id: 'l07',
    nome: 'Camisa oversized e areia',
    marca: 'Casa Nove',
    ocasiao: 'dia a dia',
    cores: ['areia', 'cru'],
    pecas: ['camisa', 'calca', 'tenis'],
    fundo: '#eae4d8',
    eixos: { volume: 0.8, neutro: 0.95, minimal: 0.8, claro: 0.8, fluidez: 0.5 },
  },
  {
    id: 'l08',
    nome: 'Vestido de viés',
    marca: 'Oito Marés',
    ocasiao: 'encontro',
    cores: ['rosa-claro', 'off-white'],
    pecas: ['vestido', 'bolsa'],
    fundo: '#f0e2e0',
    eixos: { fluidez: 0.95, romantico: 0.9, brilho: 0.5, claro: 0.8, justeza: 0.5 },
  },
  {
    id: 'l09',
    nome: 'Renda e saia midi',
    marca: 'Oito Marés',
    ocasiao: 'evento',
    cores: ['off-white', 'lilas'],
    pecas: ['camisa', 'saia', 'bolsa'],
    fundo: '#efe6f0',
    eixos: { romantico: 1, fluidez: 0.7, textura: 0.6, claro: 0.85, estampa: 0.3 },
  },
  {
    id: 'l10',
    nome: 'Floral miúdo',
    marca: 'Vento Sul',
    ocasiao: 'dia a dia',
    cores: ['rosa-claro', 'oliva'],
    pecas: ['vestido', 'bota'],
    fundo: '#eae7dc',
    eixos: { estampa: 0.95, romantico: 0.8, fluidez: 0.7, vintage: 0.5, claro: 0.6 },
  },
  {
    id: 'l11',
    nome: 'Tricot de gola alta e saia plissada',
    marca: 'Oito Marés',
    ocasiao: 'encontro',
    cores: ['cru', 'camel'],
    pecas: ['tricot', 'saia', 'bota'],
    fundo: '#ece5d9',
    eixos: { romantico: 0.6, textura: 0.8, fluidez: 0.6, neutro: 0.7, vintage: 0.5 },
  },
  {
    id: 'l12',
    nome: 'Cetim lilás',
    marca: 'Oito Marés',
    ocasiao: 'noite',
    cores: ['lilas', 'prata'],
    pecas: ['vestido', 'bolsa'],
    fundo: '#e8e2ef',
    eixos: { brilho: 1, fluidez: 0.85, romantico: 0.7, saturacao: 0.5, dramatico: 0.4 },
  },
  {
    id: 'l13',
    nome: 'Blusa de babado e jeans claro',
    marca: 'Vento Sul',
    ocasiao: 'dia a dia',
    cores: ['off-white', 'azul-claro'],
    pecas: ['camisa', 'calca', 'bolsa'],
    fundo: '#e7ecf1',
    eixos: { romantico: 0.85, claro: 0.9, fluidez: 0.6, vintage: 0.4 },
  },
  {
    id: 'l14',
    nome: 'Moletom oversized e cargo',
    marca: 'Rua Alta',
    ocasiao: 'dia a dia',
    cores: ['grafite', 'oliva'],
    pecas: ['tricot', 'calca', 'tenis'],
    fundo: '#e0e1dc',
    eixos: { urbano: 1, volume: 0.95, esporte: 0.8, escuro: 0.6 },
  },
  {
    id: 'l15',
    nome: 'Jaqueta bomber e tênis alto',
    marca: 'Rua Alta',
    ocasiao: 'dia a dia',
    cores: ['preto', 'prata'],
    pecas: ['jaqueta', 'calca', 'tenis'],
    fundo: '#dedfe1',
    eixos: { urbano: 0.95, esporte: 0.85, escuro: 0.7, estrutura: 0.4 },
  },
  {
    id: 'l16',
    nome: 'Camiseta gráfica e bermuda',
    marca: 'Rua Alta',
    ocasiao: 'dia a dia',
    cores: ['off-white', 'terracota'],
    pecas: ['camiseta', 'calca', 'tenis'],
    fundo: '#eee7de',
    eixos: { urbano: 0.85, estampa: 0.8, esporte: 0.6, saturacao: 0.6 },
  },
  {
    id: 'l17',
    nome: 'Corta-vento e legging',
    marca: 'Rua Alta',
    ocasiao: 'viagem',
    cores: ['marinho', 'prata'],
    pecas: ['jaqueta', 'calca', 'tenis'],
    fundo: '#dfe3e8',
    eixos: { esporte: 1, urbano: 0.7, justeza: 0.6, brilho: 0.3 },
  },
  {
    id: 'l18',
    nome: 'Jeans largo e camiseta branca',
    marca: 'Rua Alta',
    ocasiao: 'dia a dia',
    cores: ['azul-claro', 'off-white'],
    pecas: ['camiseta', 'calca', 'tenis'],
    fundo: '#e6ebf0',
    eixos: { urbano: 0.8, volume: 0.8, minimal: 0.5, claro: 0.6 },
  },
  {
    id: 'l19',
    nome: 'Terno risca de giz',
    marca: 'Fio & Corte',
    ocasiao: 'trabalho',
    cores: ['grafite', 'off-white'],
    pecas: ['blazer', 'calca', 'bota'],
    fundo: '#e3e3e1',
    eixos: { formal: 1, estrutura: 0.9, vintage: 0.5, estampa: 0.3, neutro: 0.7 },
  },
  {
    id: 'l20',
    nome: 'Casaco camel e gola rolê',
    marca: 'Fio & Corte',
    ocasiao: 'trabalho',
    cores: ['camel', 'preto'],
    pecas: ['casaco', 'calca', 'bolsa'],
    fundo: '#eae2d3',
    eixos: { formal: 0.8, estrutura: 0.75, neutro: 0.8, textura: 0.5, minimal: 0.6 },
  },
  {
    id: 'l21',
    nome: 'Camisa listrada e mocassim',
    marca: 'Fio & Corte',
    ocasiao: 'trabalho',
    cores: ['azul-claro', 'marinho'],
    pecas: ['camisa', 'calca', 'bolsa'],
    fundo: '#e4e9ee',
    eixos: { formal: 0.85, estampa: 0.5, vintage: 0.6, justeza: 0.5, neutro: 0.5 },
  },
  {
    id: 'l22',
    nome: 'Blazer cruzado marinho',
    marca: 'Fio & Corte',
    ocasiao: 'evento',
    cores: ['marinho', 'dourado'],
    pecas: ['blazer', 'saia', 'bota'],
    fundo: '#e1e5ea',
    eixos: { formal: 0.95, estrutura: 0.85, vintage: 0.5, dramatico: 0.3 },
  },
  {
    id: 'l23',
    nome: 'Vestido camisa caramelo',
    marca: 'Vento Sul',
    ocasiao: 'viagem',
    cores: ['caramelo', 'cru'],
    pecas: ['vestido', 'chapeu', 'bota'],
    fundo: '#ece1cf',
    eixos: { vintage: 0.7, fluidez: 0.7, neutro: 0.6, saturacao: 0.5, romantico: 0.4 },
  },
  {
    id: 'l24',
    nome: 'Croché e chapéu de palha',
    marca: 'Vento Sul',
    ocasiao: 'viagem',
    cores: ['cru', 'terracota'],
    pecas: ['tricot', 'saia', 'chapeu'],
    fundo: '#ede4d2',
    eixos: { textura: 1, vintage: 0.7, fluidez: 0.6, claro: 0.7, romantico: 0.5 },
  },
  {
    id: 'l25',
    nome: 'Saia longa estampada',
    marca: 'Vento Sul',
    ocasiao: 'evento',
    cores: ['terracota', 'oliva'],
    pecas: ['camiseta', 'saia', 'bolsa'],
    fundo: '#e9e0d0',
    eixos: { estampa: 1, fluidez: 0.8, saturacao: 0.8, vintage: 0.6 },
  },
  {
    id: 'l26',
    nome: 'Jaqueta de camurça franjada',
    marca: 'Vento Sul',
    ocasiao: 'dia a dia',
    cores: ['caramelo', 'marrom'],
    pecas: ['jaqueta', 'calca', 'bota'],
    fundo: '#e8ddcc',
    eixos: { textura: 0.9, vintage: 0.85, volume: 0.5, saturacao: 0.5 },
  },
  {
    id: 'l27',
    nome: 'Vestido longo assimétrico',
    marca: 'Meia-Noite',
    ocasiao: 'noite',
    cores: ['preto', 'vinho'],
    pecas: ['vestido', 'bota'],
    fundo: '#dcd6d6',
    eixos: { dramatico: 1, escuro: 0.9, fluidez: 0.7, brilho: 0.4 },
  },
  {
    id: 'l28',
    nome: 'Sobretudo longo',
    marca: 'Meia-Noite',
    ocasiao: 'noite',
    cores: ['preto', 'grafite'],
    pecas: ['casaco', 'calca', 'bota'],
    fundo: '#dcdcda',
    eixos: { dramatico: 0.85, escuro: 0.95, estrutura: 0.8, volume: 0.6, minimal: 0.5 },
  },
  {
    id: 'l29',
    nome: 'Couro e vinho',
    marca: 'Meia-Noite',
    ocasiao: 'noite',
    cores: ['vinho', 'preto'],
    pecas: ['jaqueta', 'saia', 'bota'],
    fundo: '#e0d5d6',
    eixos: { dramatico: 0.9, escuro: 0.7, brilho: 0.6, urbano: 0.5, saturacao: 0.6 },
  },
  {
    id: 'l30',
    nome: 'Ombro estruturado',
    marca: 'Meia-Noite',
    ocasiao: 'evento',
    cores: ['preto', 'prata'],
    pecas: ['blazer', 'calca', 'bolsa'],
    fundo: '#dedee0',
    eixos: { dramatico: 0.95, estrutura: 1, escuro: 0.8, formal: 0.6 },
  },
  {
    id: 'l31',
    nome: 'Metálico grafite',
    marca: 'Meia-Noite',
    ocasiao: 'noite',
    cores: ['prata', 'grafite'],
    pecas: ['vestido', 'bota'],
    fundo: '#dfe1e3',
    eixos: { brilho: 1, dramatico: 0.8, justeza: 0.7, saturacao: 0.4 },
  },
  {
    id: 'l32',
    nome: 'Malha canelada e calça de couro',
    marca: 'Ateliê Norte',
    ocasiao: 'encontro',
    cores: ['preto', 'cinza'],
    pecas: ['tricot', 'calca', 'bota'],
    fundo: '#e1e0dd',
    eixos: { justeza: 0.9, escuro: 0.7, textura: 0.6, urbano: 0.5, minimal: 0.6 },
  },
  {
    id: 'l33',
    nome: 'Alfaiataria oversized cru',
    marca: 'Ateliê Norte',
    ocasiao: 'trabalho',
    cores: ['cru', 'off-white'],
    pecas: ['blazer', 'calca', 'tenis'],
    fundo: '#ebe7dd',
    eixos: { volume: 0.9, estrutura: 0.7, neutro: 0.9, minimal: 0.8, claro: 0.7 },
  },
  {
    id: 'l34',
    nome: 'Camisa de linho e bermuda de alfaiataria',
    marca: 'Ateliê Norte',
    ocasiao: 'viagem',
    cores: ['off-white', 'areia'],
    pecas: ['camisa', 'calca', 'chapeu'],
    fundo: '#ece8dc',
    eixos: { claro: 1, neutro: 0.9, fluidez: 0.6, minimal: 0.7, textura: 0.5 },
  },
  {
    id: 'l35',
    nome: 'Vestido de tricô oliva',
    marca: 'Ateliê Norte',
    ocasiao: 'dia a dia',
    cores: ['oliva', 'marrom'],
    pecas: ['vestido', 'bota'],
    fundo: '#e4e3d5',
    eixos: { textura: 0.8, fluidez: 0.6, saturacao: 0.5, minimal: 0.5, vintage: 0.4 },
  },
  {
    id: 'l36',
    nome: 'Parka e bota de combate',
    marca: 'Rua Alta',
    ocasiao: 'viagem',
    cores: ['oliva', 'preto'],
    pecas: ['casaco', 'calca', 'bota'],
    fundo: '#e2e3da',
    eixos: { urbano: 0.8, volume: 0.7, esporte: 0.6, textura: 0.5, escuro: 0.5 },
  },
]

const EMBEDDINGS = new Map(ACERVO.map((look) => [look.id, comporEmbedding(look.eixos)]))

export function vetorDoLook(id: string): Vetor {
  const vetor = EMBEDDINGS.get(id)
  if (!vetor) throw new Error('Look inexistente no acervo: ' + id)
  return vetor
}

export function look(id: string): Look {
  const encontrado = ACERVO.find((item) => item.id === id)
  if (!encontrado) throw new Error('Look inexistente no acervo: ' + id)
  return encontrado
}
