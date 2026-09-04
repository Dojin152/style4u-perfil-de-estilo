export interface DadosDoCartao {
  arquetipo: string
  segundo: string | null
  frase: string
  tinta: string
  batalhas: number
  linhas: { rotulo: string; valor: string }[]
  amostras: string[]
  versao: string
  data: string
}

/**
 * The share image.
 *
 * It is not a screenshot of the reveal screen. The screen is responsive, obeys
 * the system font scale and sits under a notch, so capturing it gives a
 * different picture on every handset and a cropped one on the small ones. This
 * draws a fixed 1080 by 1350 composition instead, with its own type sizes, and
 * the screen only ever shows a scaled preview of the very same bitmap.
 */
export const LARGURA = 1080
export const ALTURA = 1350

const MARGEM = 88
const CAMPO = 860

export async function desenharCartao(canvas: HTMLCanvasElement, dados: DadosDoCartao) {
  canvas.width = LARGURA
  canvas.height = ALTURA

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas sem contexto 2d')

  // Web fonts are not loaded just because the page is using them: the canvas
  // paints with whatever is ready at that instant, so a card drawn too early
  // comes out in Times. This is the whole reason the function is async.
  await Promise.all([
    document.fonts.load('400 132px "Instrument Serif"'),
    document.fonts.load('400 34px Inter'),
    document.fonts.load('500 26px Inter'),
  ])

  ctx.fillStyle = dados.tinta
  ctx.fillRect(0, 0, LARGURA, CAMPO)
  ctx.fillStyle = '#f2efe9'
  ctx.fillRect(0, CAMPO, LARGURA, ALTURA - CAMPO)

  ctx.fillStyle = 'rgba(242, 239, 233, 0.6)'
  ctx.font = '500 26px Inter, sans-serif'
  escreverEspacado(ctx, 'STYLE4U', MARGEM, 132, 7)
  ctx.textAlign = 'right'
  escreverEspacado(ctx, 'PERFIL DE ESTILO', LARGURA - MARGEM, 132, 7, 'right')
  ctx.textAlign = 'left'

  ctx.strokeStyle = 'rgba(242, 239, 233, 0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGEM, 170)
  ctx.lineTo(LARGURA - MARGEM, 170)
  ctx.stroke()

  // The dark field is laid out from the bottom up, so a name that wraps to three
  // lines and one that fits in one both sit on the same baseline instead of
  // drifting away from the colour swatches.
  ctx.font = '400 38px Inter, sans-serif'
  const frase = quebrar(ctx, dados.frase, LARGURA - MARGEM * 2)
  let cursor = CAMPO - 92

  ctx.fillStyle = 'rgba(242, 239, 233, 0.72)'
  for (const linha of [...frase].reverse()) {
    ctx.fillText(linha, MARGEM, cursor)
    cursor -= 52
  }

  cursor -= 22

  if (dados.segundo) {
    ctx.fillStyle = 'rgba(242, 239, 233, 0.55)'
    ctx.font = '400 46px "Instrument Serif", Georgia, serif'
    ctx.fillText('com um pé em ' + dados.segundo, MARGEM, cursor)
    cursor -= 72
  }

  cursor -= 26

  ctx.fillStyle = '#f2efe9'
  ctx.font = '400 132px "Instrument Serif", Georgia, serif'
  for (const linha of [...quebrar(ctx, dados.arquetipo, LARGURA - MARGEM * 2)].reverse()) {
    ctx.fillText(linha, MARGEM, cursor)
    cursor -= 134
  }

  // A ring in the paper colour: without it a black swatch vanishes into the
  // field it is straddling.
  dados.amostras.slice(0, 4).forEach((cor, i) => {
    ctx.beginPath()
    ctx.arc(MARGEM + 46 + i * 108, CAMPO, 46, 0, Math.PI * 2)
    ctx.fillStyle = cor
    ctx.fill()
    ctx.strokeStyle = '#f2efe9'
    ctx.lineWidth = 7
    ctx.stroke()
  })

  let linha = CAMPO + 140
  for (const item of dados.linhas) {
    ctx.fillStyle = '#9a938a'
    ctx.font = '500 24px Inter, sans-serif'
    escreverEspacado(ctx, item.rotulo.toUpperCase(), MARGEM, linha, 4)

    ctx.fillStyle = '#17150f'
    ctx.font = '400 46px "Instrument Serif", Georgia, serif'
    ctx.textAlign = 'right'
    ctx.fillText(item.valor, LARGURA - MARGEM, linha + 4)
    ctx.textAlign = 'left'

    ctx.strokeStyle = '#ded8cd'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(MARGEM, linha + 34)
    ctx.lineTo(LARGURA - MARGEM, linha + 34)
    ctx.stroke()

    linha += 86
  }

  ctx.fillStyle = '#9a938a'
  ctx.font = '400 24px Inter, sans-serif'
  ctx.fillText(dados.versao + ' · ' + dados.data, MARGEM, ALTURA - 64)
  ctx.textAlign = 'right'
  ctx.fillText(dados.batalhas + ' batalhas', LARGURA - MARGEM, ALTURA - 64)
  ctx.textAlign = 'left'
}

function escreverEspacado(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  espaco: number,
  alinhamento: 'left' | 'right' = 'left'
) {
  const largura = [...texto].reduce(
    (total, letra) => total + ctx.measureText(letra).width + espaco,
    -espaco
  )
  let cursor = alinhamento === 'right' ? x - largura : x

  for (const letra of texto) {
    ctx.textAlign = 'left'
    ctx.fillText(letra, cursor, y)
    cursor += ctx.measureText(letra).width + espaco
  }

  ctx.textAlign = alinhamento
}

function quebrar(ctx: CanvasRenderingContext2D, texto: string, limite: number) {
  const linhas: string[] = []
  let atual = ''

  for (const palavra of texto.split(' ')) {
    const tentativa = atual ? atual + ' ' + palavra : palavra
    if (ctx.measureText(tentativa).width > limite && atual) {
      linhas.push(atual)
      atual = palavra
    } else {
      atual = tentativa
    }
  }

  if (atual) linhas.push(atual)
  return linhas
}
