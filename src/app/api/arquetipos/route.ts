import { CONJUNTO, REFERENCIAS_POR_ARQUETIPO, VERSAO_DO_CONJUNTO } from '@/lib/arquetipos'

/**
 * The published reference set. The app needs the names, the copy and the palette
 * to draw the reveal; it never needs the vectors, which stay on the server side
 * next to the data they are compared against.
 */

export async function GET() {
  return Response.json(
    {
      versao: VERSAO_DO_CONJUNTO,
      referenciasPorArquetipo: REFERENCIAS_POR_ARQUETIPO,
      dimensoes: CONJUNTO[0]?.centroide.length ?? 0,
      arquetipos: CONJUNTO.map(({ id, nome, frase, descricao, paleta, tinta, imagem }) => ({
        id,
        nome,
        frase,
        descricao,
        paleta,
        tinta,
        imagem,
      })),
    },
    { headers: { 'cache-control': 'public, max-age=3600' } }
  )
}
