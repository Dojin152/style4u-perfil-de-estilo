import { calcularPerfil, type Batalha } from '@/lib/perfil'

/**
 * The endpoint the brief asks for. It is written to the budget a Worker gives:
 * one pass over the battles, no vector leaving the data layer, nothing kept in
 * memory between calls, and a body small enough to be worth returning whole.
 *
 * In production it reads the battles the user already played from Postgres and
 * writes the snapshot back. Here they arrive in the body, because the demo has
 * no session and no database, and everything else is identical.
 */

const LIMITE_DE_BATALHAS = 400

export async function POST(request: Request) {
  let corpo: unknown

  try {
    corpo = await request.json()
  } catch {
    return erro('corpo inválido: esperado JSON')
  }

  if (typeof corpo !== 'object' || corpo === null || !('batalhas' in corpo)) {
    return erro('campo obrigatório ausente: batalhas')
  }

  const { batalhas } = corpo as { batalhas: unknown }

  if (!Array.isArray(batalhas)) return erro('batalhas precisa ser uma lista')
  if (batalhas.length > LIMITE_DE_BATALHAS) {
    return erro('batalhas acima do limite de ' + LIMITE_DE_BATALHAS)
  }

  const validas: Batalha[] = []
  for (const item of batalhas) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Batalha).vencedor !== 'string' ||
      typeof (item as Batalha).perdedor !== 'string'
    ) {
      return erro('cada batalha precisa de vencedor e perdedor')
    }
    validas.push({ vencedor: (item as Batalha).vencedor, perdedor: (item as Batalha).perdedor })
  }

  return Response.json(calcularPerfil(validas), {
    headers: { 'cache-control': 'no-store' },
  })
}

function erro(mensagem: string) {
  return Response.json({ erro: mensagem }, { status: 400 })
}
