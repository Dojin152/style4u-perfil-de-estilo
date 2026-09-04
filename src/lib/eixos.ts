import type { Eixo } from './acervo'

/**
 * Every axis in words. The screen never shows an axis name from the model; it
 * shows this, because "estrutura 0,41" explains nothing to somebody who is
 * about to share the result with a friend.
 */
export const PALAVRA_DO_EIXO: Record<Eixo, string> = {
  estrutura: 'corte estruturado',
  fluidez: 'caimento fluido',
  volume: 'volume amplo',
  justeza: 'modelagem justa',
  neutro: 'paleta neutra',
  saturacao: 'cor saturada',
  escuro: 'tom escuro',
  claro: 'tom claro',
  brilho: 'brilho e cetim',
  textura: 'textura artesanal',
  estampa: 'estampa',
  esporte: 'referência esportiva',
  formal: 'código formal',
  romantico: 'detalhe romântico',
  urbano: 'referência de rua',
  vintage: 'referência retrô',
  minimal: 'redução minimalista',
  dramatico: 'peça statement',
}
