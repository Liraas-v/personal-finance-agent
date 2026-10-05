import { v4 as uuidv4 } from 'uuid'
import { MAX_PARCELAS, splitInstallments } from '@/lib/installments'
import type { CreateTransactionInput } from '@/lib/repositories/types'
import type { OrigemTransacao, ParsedVoice } from '@/types'

// Converte o que foi entendido da fala em lançamentos. "Nike 4500 em 12x" vira 12 parcelas mensais;
// "Nike 300 parcelado" (sem número) ou um número fora do limite continua sendo um lançamento só.
export function buildTransactionInputs(
  parsed: ParsedVoice,
  categoria: string,
  data: string,
  origem: OrigemTransacao,
): CreateTransactionInput[] {
  const { parcelas } = parsed
  const parcelar =
    parsed.pagamento === 'parcelado' && parcelas !== undefined && Number.isInteger(parcelas) && parcelas >= 2 && parcelas <= MAX_PARCELAS

  if (parcelar) {
    const grupoParcelas = uuidv4()
    return splitInstallments({ total: parsed.valor, parcelas, primeiraData: data, descricao: parsed.descricao, grupoParcelas }).map((p) => ({
      tipo: parsed.tipo,
      descricao: p.descricao,
      valor: p.valor,
      categoria,
      pagamento: parsed.pagamento,
      parcelas: p.parcelas,
      grupoParcelas: p.grupoParcelas,
      data: p.data,
      origem,
    }))
  }

  return [
    {
      tipo: parsed.tipo,
      descricao: parsed.descricao,
      valor: parsed.valor,
      categoria,
      pagamento: parsed.pagamento,
      ...(parcelas && parcelas > 1 ? { parcelas } : {}),
      data,
      origem,
    },
  ]
}
