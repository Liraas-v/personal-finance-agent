export const MAX_PARCELAS = 60

export interface Installment {
  descricao: string
  valor: number
  data: string
  parcelas: number
}

interface SplitInput {
  /** Valor TOTAL da compra. */
  total: number
  parcelas: number
  /** Data da 1ª parcela (aaaa-mm-dd). As demais caem nos meses seguintes. */
  primeiraData: string
  descricao: string
}

function diasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate() // mes 1-12: o dia 0 do mês seguinte é o último deste
}

// Soma `meses` a uma data aaaa-mm-dd partindo SEMPRE do dia original, então 31/01 -> 28/02 -> 31/03
// (e não 28/02 -> 28/03). Sem usar Date com fuso: só aritmética sobre a string.
function somarMeses(iso: string, meses: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) throw new RangeError(`Data inválida: "${iso}"`)
  const [ano0, mes0, dia0] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const indice = ano0 * 12 + (mes0 - 1) + meses
  const ano = Math.floor(indice / 12)
  const mes = (indice % 12) + 1
  const dia = Math.min(dia0, diasNoMes(ano, mes))
  return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/**
 * Divide uma compra parcelada em lançamentos mensais. Trabalha em centavos inteiros para a soma
 * das parcelas ser exatamente o total: o resto da divisão fica na última parcela.
 */
export function splitInstallments({ total, parcelas, primeiraData, descricao }: SplitInput): Installment[] {
  if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > MAX_PARCELAS) {
    throw new RangeError(`Número de parcelas inválido: ${parcelas}`)
  }
  if (!Number.isFinite(total) || total <= 0) {
    throw new RangeError(`Valor total inválido: ${total}`)
  }
  const totalCentavos = Math.round(total * 100)
  if (totalCentavos < parcelas) {
    throw new RangeError('O total não dá 1 centavo por parcela')
  }
  somarMeses(primeiraData, 0) // valida a data

  if (parcelas === 1) return [{ descricao, valor: totalCentavos / 100, data: primeiraData, parcelas: 1 }]

  const base = Math.floor(totalCentavos / parcelas)
  const resto = totalCentavos - base * parcelas

  return Array.from({ length: parcelas }, (_, i) => ({
    descricao: `${descricao} (${i + 1}/${parcelas})`,
    valor: (i === parcelas - 1 ? base + resto : base) / 100,
    data: somarMeses(primeiraData, i),
    parcelas,
  }))
}
