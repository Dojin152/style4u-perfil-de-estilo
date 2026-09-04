import { criarRng, semente } from './rng'
import { gostoDeMistura, simular } from './simulacao'
import type { Batalha } from './gosto'

/**
 * Shortcuts for whoever is looking at the demo. Playing twenty-two battles by
 * hand to see one screen is a lot to ask, so each persona plays them with a
 * declared taste. "Dividida" exists to reach the state everybody forgets to
 * design: the one where the first two archetypes are too close to name one.
 */
export interface Persona {
  id: string
  nome: string
  descricao: string
  pesos: Record<string, number>
}

export const PERSONAS: Persona[] = [
  {
    id: 'minimalista',
    nome: 'Minimalista',
    descricao: 'Corte limpo, paleta curta, nada de estampa.',
    pesos: { estrutural: 0.8, classico: 0.2 },
  },
  {
    id: 'romantica',
    nome: 'Romântica',
    descricao: 'Caimento fluido e tons claros.',
    pesos: { romantico: 0.85, solar: 0.15 },
  },
  {
    id: 'rua',
    nome: 'De rua',
    descricao: 'Volume, tênis e camada.',
    pesos: { urbano: 0.9, noturno: 0.1 },
  },
  {
    id: 'executiva',
    nome: 'Executiva',
    descricao: 'Alfaiataria e sapato fechado.',
    pesos: { classico: 0.8, estrutural: 0.2 },
  },
  {
    id: 'solar',
    nome: 'Solar',
    descricao: 'Textura natural e cor de terra.',
    pesos: { solar: 0.85, romantico: 0.15 },
  },
  {
    id: 'dividida',
    nome: 'Dividida',
    descricao: 'Metade corte seco, metade preto dramático.',
    pesos: { estrutural: 0.5, noturno: 0.5 },
  },
]

export function jogarComo(persona: Persona, quantidade: number, variacao = 0): Batalha[] {
  const rng = criarRng(semente('persona:' + persona.id + ':' + variacao))
  return simular(gostoDeMistura(persona.pesos), quantidade, rng)
}
