'use client'

import { useEffect, useRef, useState } from 'react'
import { desenharCartao, type DadosDoCartao } from '@/lib/cartao'

/**
 * The canvas is 1080 by 1350 whatever the screen is; CSS only scales the
 * preview. What the user sees here is the exact bitmap that gets shared, which
 * is the point of drawing it separately instead of photographing the screen.
 */
export function CartaoCompartilhavel({ dados }: { dados: DadosDoCartao }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [estado, setEstado] = useState<'desenhando' | 'pronto' | 'compartilhando'>(
    'desenhando'
  )

  useEffect(() => {
    let cancelado = false
    const elemento = canvas.current
    if (!elemento) return

    setEstado('desenhando')
    desenharCartao(elemento, dados).then(() => {
      if (!cancelado) setEstado('pronto')
    })

    return () => {
      cancelado = true
    }
  }, [dados])

  async function arquivo() {
    const elemento = canvas.current
    if (!elemento) return null

    const blob = await new Promise<Blob | null>((resolve) =>
      elemento.toBlob(resolve, 'image/png')
    )
    if (!blob) return null

    return new File([blob], 'perfil-de-estilo.png', { type: 'image/png' })
  }

  async function compartilhar() {
    const imagem = await arquivo()
    if (!imagem) return

    // The share sheet is the one part of this that has no web equivalent on
    // desktop, so the download is not a fallback for failure: it is the desktop
    // path, and the sheet is what the phone gets.
    if (navigator.canShare?.({ files: [imagem] })) {
      setEstado('compartilhando')
      try {
        await navigator.share({ files: [imagem], title: 'Meu perfil de estilo' })
      } catch {
        // Cancelar a folha de compartilhamento não é erro.
      }
      setEstado('pronto')
      return
    }

    baixar(imagem)
  }

  async function salvar() {
    const imagem = await arquivo()
    if (imagem) baixar(imagem)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center px-5">
        <canvas
          ref={canvas}
          aria-label="Prévia do cartão de perfil"
          className="border-linha max-h-full w-auto max-w-full rounded-[2px] border"
          style={{ opacity: estado === 'desenhando' ? 0 : 1, transition: 'opacity 240ms' }}
        />
      </div>

      <div className="space-y-2 px-5 pt-4 pb-5">
        <button
          type="button"
          onClick={compartilhar}
          disabled={estado !== 'pronto'}
          className="bg-tinta text-superficie w-full rounded-full py-3 text-[13px] font-medium disabled:opacity-40"
        >
          Compartilhar
        </button>
        <button
          type="button"
          onClick={salvar}
          disabled={estado !== 'pronto'}
          className="border-linha-forte text-tinta w-full rounded-full border py-3 text-[13px] disabled:opacity-40"
        >
          Salvar imagem
        </button>
      </div>
    </div>
  )
}

function baixar(imagem: File) {
  const url = URL.createObjectURL(imagem)
  const ancora = document.createElement('a')
  ancora.href = url
  ancora.download = imagem.name
  ancora.click()
  URL.revokeObjectURL(url)
}
