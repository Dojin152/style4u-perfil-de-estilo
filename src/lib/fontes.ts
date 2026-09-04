import { Instrument_Serif, Inter } from 'next/font/google'

/**
 * The serif carries the reveal, the sans carries everything that has to be read
 * as data. The share image draws with the same two families, which is why they
 * are loaded here and awaited before the canvas is painted.
 */
export const serifa = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--fonte-serifa',
})

export const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fonte-sans',
})

export const variaveisDeFonte = `${serifa.variable} ${sans.variable}`
