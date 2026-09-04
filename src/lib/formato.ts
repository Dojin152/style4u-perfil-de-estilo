const decimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const decimalCurto = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const preciso = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

const dataCurta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const horario = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

export const numero = (valor: number) => decimal.format(valor)
export const numeroCurto = (valor: number) => decimalCurto.format(valor)
export const cosseno = (valor: number) => preciso.format(valor)
export const vezes = (valor: number) => decimalCurto.format(valor) + 'x'
export const porcento = (valor: number) => Math.round(valor * 100) + '%'
export const data = (iso: string) => dataCurta.format(new Date(iso))
export const dataHora = (iso: string) =>
  dataCurta.format(new Date(iso)) + ' às ' + horario.format(new Date(iso))
