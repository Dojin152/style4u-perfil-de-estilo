import type { Metadata, Viewport } from 'next'
import { variaveisDeFonte } from '@/lib/fontes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Style4U · Perfil de Estilo',
  description:
    'Demonstração funcional do endpoint de perfil, da camada de arquétipos, da tela de revelação e do compartilhamento como imagem.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={variaveisDeFonte}>
      <body className="bg-noite text-tinta min-h-dvh antialiased">{children}</body>
    </html>
  )
}
