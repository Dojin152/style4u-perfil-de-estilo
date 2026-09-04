'use client'

import { useEffect, useRef, useState } from 'react'
import { desenharCartao, type DadosDoCartao, type Formato } from '@/lib/cartao'

const FORMATOS: { valor: Formato; rotulo: string }[] = [
  { valor: 'feed', rotulo: '4:5' },
  { valor: 'story', rotulo: '9:16' },
]

/**
 * The canvas is 1080 wide whatever the screen is; CSS only scales the preview.
 * What the user sees here is the exact bitmap that gets shared, which is the
 * point of drawing it separately instead of photographing the screen.
 */
export function CartaoCompartilhavel({ dados }: { dados: DadosDoCartao }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [formato, setFormato] = useState<Formato>('feed')
  const [estado, setEstado] = useState<'desenhando' | 'pronto'>('desenhando')

  useEffect(() => {
    let cancelado = false
    const elemento = canvas.current
    if (!elemento) return

    setEstado('desenhando')
    desenharCartao(elemento, dados, formato).then(() => {
      if (!cancelado) setEstado('pronto')
    })

    return () => {
      cancelado = true
    }
  }, [dados, formato])

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

    // A folha de compartilhamento não tem equivalente no navegador de mesa, então
    // o download não é um plano B para falha: é o caminho do desktop, e a folha
    // é o que o aparelho recebe.
    if (navigator.canShare?.({ files: [imagem] })) {
      try {
        await navigator.share({ files: [imagem], title: 'Meu perfil de estilo' })
      } catch {
        // Cancelar a folha não é erro.
      }
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
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        <canvas
          ref={canvas}
          aria-label="Prévia do cartão de perfil"
          className="border-linha max-h-full w-auto max-w-full rounded-[3px] border shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]"
          style={{ opacity: estado === 'desenhando' ? 0 : 1, transition: 'opacity 260ms' }}
        />
      </div>

      <div className="px-5 pt-4 pb-5">
        <div className="mb-3 flex items-center justify-center gap-1.5">
          {FORMATOS.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setFormato(opcao.valor)}
              className={
                'rounded-full border px-3 py-1 text-[11px] transition-colors ' +
                (formato === opcao.valor
                  ? 'border-tinta text-tinta'
                  : 'border-linha text-tinta-tenue hover:text-tinta-suave')
              }
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={compartilhar}
          disabled={estado !== 'pronto'}
          className="bg-tinta text-noite w-full rounded-full py-3 text-[13px] font-medium disabled:opacity-40"
        >
          Compartilhar
        </button>
        <button
          type="button"
          onClick={salvar}
          disabled={estado !== 'pronto'}
          className="border-linha-forte text-tinta mt-2 w-full rounded-full border py-3 text-[13px] disabled:opacity-40"
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
