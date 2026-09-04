import type { Batalha, Perfil } from './perfil'

export interface Resposta {
  perfil: Perfil
  duracao: number
}

/**
 * The only call the page makes. The round trip is measured here because the
 * number is shown next to the response: an endpoint that takes a second to
 * answer would change what the reveal screen can do while it waits.
 */
export async function pedirPerfil(batalhas: Batalha[]): Promise<Resposta> {
  const inicio = performance.now()

  const resposta = await fetch('/api/perfil', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ batalhas }),
  })

  if (!resposta.ok) throw new Error('perfil: HTTP ' + resposta.status)

  return {
    perfil: (await resposta.json()) as Perfil,
    duracao: Math.round(performance.now() - inicio),
  }
}
