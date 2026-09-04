import { CORES, type Look, type Peca } from '@/lib/acervo'

/**
 * The catalogue art.
 *
 * The real app shows photographs from the partner stores. Those cannot be
 * copied into a public demo, so each look is drawn from its own tags: the
 * garments it is made of and the colours the profile aggregates. Everything on
 * screen is therefore the same data the endpoint reads, which is convenient
 * when the point of the page is what the endpoint does with it.
 */
const PECAS: Record<Peca, (fill: string, traco: string) => React.ReactNode> = {
  casaco: (fill, traco) => (
    <>
      <path d="M31 22 69 22 80 60 77 126 23 126 20 60Z" fill={fill} />
      <path d="M31 22 19 29 12 68 23 72 30 42Z" fill={fill} />
      <path d="M69 22 81 29 88 68 77 72 70 42Z" fill={fill} />
      <path d="M41 22 50 50 59 22Z" fill={traco} opacity={0.16} />
      <path d="M21 72h58v8H21z" fill={traco} opacity={0.22} />
      <path d="M50 50V126" stroke={traco} strokeWidth={1.2} opacity={0.35} fill="none" />
    </>
  ),
  blazer: (fill, traco) => (
    <>
      <path d="M32 24 68 24 77 58 73 106 27 106 23 58Z" fill={fill} />
      <path d="M32 24 21 31 16 72 26 76 31 45Z" fill={fill} />
      <path d="M68 24 79 31 84 72 74 76 69 45Z" fill={fill} />
      <path d="M41 24 50 52 59 24Z" fill={traco} opacity={0.16} />
      <circle cx="50" cy="66" r="1.8" fill={traco} opacity={0.4} />
      <circle cx="50" cy="78" r="1.8" fill={traco} opacity={0.4} />
    </>
  ),
  camisa: (fill, traco) => (
    <>
      <path d="M33 26 67 26 74 40 71 104 29 104 26 40Z" fill={fill} />
      <path d="M33 26 22 32 18 72 28 76 32 44Z" fill={fill} />
      <path d="M67 26 78 32 82 72 72 76 68 44Z" fill={fill} />
      <path d="M42 26 50 40 58 26 53 22 47 22Z" fill={traco} opacity={0.16} />
      <path d="M50 40v64" stroke={traco} strokeWidth={1.2} opacity={0.35} fill="none" />
    </>
  ),
  camiseta: (fill, traco) => (
    <>
      <path d="M34 30 66 30 72 44 69 90 31 90 28 44Z" fill={fill} />
      <path d="M34 30 22 36 18 58 30 62Z" fill={fill} />
      <path d="M66 30 78 36 82 58 70 62Z" fill={fill} />
      <path d="M42 30q8 9 16 0" stroke={traco} strokeWidth={1.4} opacity={0.4} fill="none" />
    </>
  ),
  tricot: (fill, traco) => (
    <>
      <path d="M40 26h20v7H40z" fill={fill} />
      <path d="M32 31 68 31 74 46 72 98 28 98 26 46Z" fill={fill} />
      <path d="M32 31 18 39 14 82 26 86 31 50Z" fill={fill} />
      <path d="M68 31 82 39 86 82 74 86 69 50Z" fill={fill} />
      <path d="M28 92h44M28 95.5h44" stroke={traco} strokeWidth={1} opacity={0.3} fill="none" />
    </>
  ),
  jaqueta: (fill, traco) => (
    <>
      <path d="M40 25h20v6H40z" fill={fill} />
      <path d="M32 29 68 29 76 45 74 90 26 90 24 45Z" fill={fill} />
      <path d="M32 29 19 37 14 75 26 79 31 47Z" fill={fill} />
      <path d="M68 29 81 37 86 75 74 79 69 47Z" fill={fill} />
      <path d="M26 90h48v9H26z" fill={fill} opacity={0.75} />
      <path d="M50 29v61" stroke={traco} strokeWidth={1.3} opacity={0.45} fill="none" />
    </>
  ),
  vestido: (fill, traco) => (
    <>
      <path d="M36 26 64 26 68 56 32 56Z" fill={fill} />
      <path d="M32 56 68 56 84 124 16 124Z" fill={fill} />
      <path d="M41 26 45 15M59 26 55 15" stroke={fill} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M32 56h36" stroke={traco} strokeWidth={1.2} opacity={0.35} fill="none" />
    </>
  ),
  saia: (fill, traco) => (
    <>
      <path d="M30 44h40v9H30z" fill={fill} opacity={0.8} />
      <path d="M30 53 70 53 82 122 18 122Z" fill={fill} />
      <path d="M41 53 37 122M50 53v69M59 53 63 122" stroke={traco} strokeWidth={1} opacity={0.28} fill="none" />
    </>
  ),
  calca: (fill, traco) => (
    <>
      <path d="M26 40 74 40 76 53 24 53Z" fill={fill} />
      <path d="M24 53 48 53 45 126 31 126Z" fill={fill} />
      <path d="M52 53 76 53 69 126 55 126Z" fill={fill} />
      <path d="M26 46h48" stroke={traco} strokeWidth={1} opacity={0.3} fill="none" />
    </>
  ),
  bota: (fill, traco) => (
    <>
      <path d="M36 40 60 40 63 94 36 94Z" fill={fill} />
      <path d="M36 94 74 100q6 1 6 7v7H36Z" fill={fill} />
      <path d="M62 108h18v10H62z" fill={traco} opacity={0.45} />
      <path d="M36 54h26" stroke={traco} strokeWidth={1} opacity={0.3} fill="none" />
    </>
  ),
  tenis: (fill, traco) => (
    <>
      <path d="M22 102V80q0-9 9-8l14 3q6 1 10 6l14 15q4 4 10 6l9 3q4 1 4 5v-8H22Z" fill={fill} />
      <path d="M22 74q0-8 9-7l13 3q6 1 10 6l15 16q4 4 10 6l9 3q4 2 4 6v3H22Z" fill={fill} />
      <path d="M18 101h68v8a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z" fill={traco} opacity={0.3} />
      <path d="M36 84 46 90M42 77 52 84" stroke={traco} strokeWidth={1.3} opacity={0.45} fill="none" />
    </>
  ),
  bolsa: (fill, traco) => (
    <>
      <path d="M40 58q10-24 20 0" stroke={fill} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <rect x="28" y="58" width="44" height="48" rx="3" fill={fill} />
      <path d="M44 74h12v5H44z" fill={traco} opacity={0.4} />
    </>
  ),
  chapeu: (fill, traco) => (
    <>
      <ellipse cx="50" cy="88" rx="42" ry="12" fill={fill} />
      <path d="M32 88q2-40 18-40t18 40Z" fill={fill} />
      <path d="M32 80h36v8H32z" fill={traco} opacity={0.35} />
    </>
  ),
}

/** White ink on a dark garment, dark ink on a light one. */
function traçoPara(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminancia > 0.55 ? '#17150f' : '#f6f3ec'
}

/**
 * A flat lay reads left to right, largest first. The box is wider than it is
 * tall because that is the shape of the card in the battle screen, and the
 * artwork is cropped from the middle out when the container is a different one.
 */
const POSICOES = [
  { x: 14, y: 12, escala: 1.44, giro: -4 },
  { x: 150, y: 30, escala: 1.26, giro: 4 },
  { x: 276, y: 64, escala: 0.96, giro: -3 },
]

export function ArteDoLook({ look, className }: { look: Look; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={look.nome + ', ' + look.cores.join(' e ')}
    >
      <rect width="400" height="240" fill={look.fundo} />
      {look.pecas.slice(0, 3).map((peca, i) => {
        const posicao = POSICOES[i]
        if (!posicao) return null

        const cor = CORES[look.cores[i % look.cores.length] ?? 'preto'] ?? '#17150f'
        const traco = traçoPara(cor)
        const centro = 50 * posicao.escala

        return (
          <g
            key={peca + i}
            stroke="rgba(23, 21, 15, 0.32)"
            strokeWidth={0.9}
            strokeLinejoin="round"
            transform={
              'translate(' +
              posicao.x +
              ' ' +
              posicao.y +
              ') rotate(' +
              posicao.giro +
              ' ' +
              centro +
              ' ' +
              centro +
              ') scale(' +
              posicao.escala +
              ')'
            }
          >
            {PECAS[peca](cor, traco)}
          </g>
        )
      })}
    </svg>
  )
}
