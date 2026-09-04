export interface DadosDoCartao {
  arquetipo: string
  segundo: string | null
  frase: string
  tinta: string
  imagem: string
  batalhas: number
  linhas: { rotulo: string; valor: string }[]
  amostras: string[]
  versao: string
  data: string
}

export type Formato = 'feed' | 'story'

export const LARGURA = 1080
export const ALTURAS: Record<Formato, number> = { feed: 1350, story: 1920 }

const MARGEM = 88

/**
 * The share image.
 *
 * It is not a screenshot of the reveal screen. The screen is responsive, obeys
 * the system font scale and sits under a notch, so capturing it gives a
 * different picture on every handset and a cropped one on the small ones. This
 * draws a fixed composition instead, with its own type sizes and its own crop of
 * the photograph, and the screen only ever shows a scaled preview of the very
 * same bitmap.
 */
export async function desenharCartao(
  canvas: HTMLCanvasElement,
  dados: DadosDoCartao,
  formato: Formato = 'feed'
) {
  const altura = ALTURAS[formato]
  canvas.width = LARGURA
  canvas.height = altura

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas sem contexto 2d')

  // Nem a fonte nem a foto estão prontas só porque a página as usa: o canvas
  // pinta com o que existir naquele instante, e um cartão desenhado cedo demais
  // sai em Times e sem imagem. É por isso que a função é assíncrona.
  const [foto] = await Promise.all([
    carregar(dados.imagem),
    document.fonts.load('400 132px "Instrument Serif"'),
    document.fonts.load('400 34px Inter'),
    document.fonts.load('500 26px Inter'),
  ])

  ctx.fillStyle = dados.tinta
  ctx.fillRect(0, 0, LARGURA, altura)
  if (foto) cobrir(ctx, foto, LARGURA, altura)

  const véu = ctx.createLinearGradient(0, altura * 0.2, 0, altura)
  véu.addColorStop(0, 'rgba(10, 10, 11, 0)')
  véu.addColorStop(0.42, 'rgba(10, 10, 11, 0.72)')
  véu.addColorStop(1, 'rgba(10, 10, 11, 0.97)')
  ctx.fillStyle = véu
  ctx.fillRect(0, 0, LARGURA, altura)

  const topo = ctx.createLinearGradient(0, 0, 0, 260)
  topo.addColorStop(0, 'rgba(10, 10, 11, 0.7)')
  topo.addColorStop(1, 'rgba(10, 10, 11, 0)')
  ctx.fillStyle = topo
  ctx.fillRect(0, 0, LARGURA, 260)

  ctx.fillStyle = 'rgba(244, 241, 234, 0.62)'
  ctx.font = '500 26px Inter, sans-serif'
  escreverEspacado(ctx, 'STYLE4U', MARGEM, 128, 7)
  escreverEspacado(ctx, 'PERFIL DE ESTILO', LARGURA - MARGEM, 128, 7, 'right')

  ctx.strokeStyle = 'rgba(244, 241, 234, 0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGEM, 168)
  ctx.lineTo(LARGURA - MARGEM, 168)
  ctx.stroke()

  ctx.fillStyle = 'rgba(244, 241, 234, 0.42)'
  ctx.font = '400 24px Inter, sans-serif'
  ctx.fillText(dados.versao + ' · ' + dados.data, MARGEM, altura - 62)
  ctx.textAlign = 'right'
  ctx.fillText(dados.batalhas + ' batalhas', LARGURA - MARGEM, altura - 62)
  ctx.textAlign = 'left'

  // O bloco de crédito, em colunas, e daí para cima tudo é ancorado no rodapé:
  // um nome que quebra em três linhas e um que cabe em uma terminam na mesma
  // altura em vez de flutuar.
  const colunas = LARGURA - MARGEM * 2
  dados.linhas.forEach((linha, i) => {
    const x = MARGEM + (colunas / dados.linhas.length) * i
    ctx.fillStyle = 'rgba(244, 241, 234, 0.45)'
    ctx.font = '500 22px Inter, sans-serif'
    escreverEspacado(ctx, linha.rotulo.toUpperCase(), x, altura - 168, 4)

    ctx.fillStyle = '#f4f1ea'
    ctx.font = '400 42px "Instrument Serif", Georgia, serif'
    ctx.fillText(linha.valor, x, altura - 118)
  })

  let cursor = altura - 246

  dados.amostras.slice(0, 4).forEach((cor, i) => {
    ctx.beginPath()
    ctx.arc(MARGEM + 30 + i * 76, cursor, 30, 0, Math.PI * 2)
    ctx.fillStyle = cor
    ctx.fill()
    ctx.strokeStyle = 'rgba(244, 241, 234, 0.35)'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  cursor -= 84

  ctx.font = '400 38px Inter, sans-serif'
  ctx.fillStyle = 'rgba(244, 241, 234, 0.78)'
  for (const linha of [...quebrar(ctx, dados.frase, colunas)].reverse()) {
    ctx.fillText(linha, MARGEM, cursor)
    cursor -= 52
  }

  cursor -= 24

  if (dados.segundo) {
    ctx.fillStyle = 'rgba(244, 241, 234, 0.6)'
    ctx.font = '400 46px "Instrument Serif", Georgia, serif'
    ctx.fillText('com um pé em ' + dados.segundo, MARGEM, cursor)
    cursor -= 74
  }

  cursor -= 26

  ctx.fillStyle = '#f4f1ea'
  ctx.font = '400 128px "Instrument Serif", Georgia, serif'
  for (const linha of [...quebrar(ctx, dados.arquetipo, colunas)].reverse()) {
    ctx.fillText(linha, MARGEM, cursor)
    cursor -= 130
  }
}

function carregar(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const imagem = new window.Image()
    imagem.onload = () => resolve(imagem)
    imagem.onerror = () => resolve(null)
    imagem.src = src
  })
}

/** object-fit: cover, na mão, porque o canvas não tem um. */
function cobrir(
  ctx: CanvasRenderingContext2D,
  imagem: HTMLImageElement,
  largura: number,
  altura: number
) {
  const escala = Math.max(largura / imagem.width, altura / imagem.height)
  const l = imagem.width * escala
  const a = imagem.height * escala
  ctx.drawImage(imagem, (largura - l) / 2, (altura - a) / 2, l, a)
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

  ctx.textAlign = 'left'
  for (const letra of texto) {
    ctx.fillText(letra, cursor, y)
    cursor += ctx.measureText(letra).width + espaco
  }
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
