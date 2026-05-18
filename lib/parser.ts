// lib/parser.ts
import type { ParsedVoice, FormaPagamento, TipoTransacao } from '@/types'

const PAYMENT_PATTERNS: Array<[FormaPagamento, RegExp]> = [
  ['parcelado', /\b(parcelad[oa]|em\s+\d+\s*x|\d+x\b|em\s+\d+\s+vezes)\b/i],
  ['débito',   /\b(débit[oa]|debito|no\s+débit[oa])\b/i],
  ['pix',      /\bpix\b/i],
  ['dinheiro', /\b(dinheiro|cash|espécie)\b/i],
  ['crédito',  /\b(crédit[oa]|credit[oa]|no\s+crédit[oa])\b/i],
]

const RECEITA_PATTERN = /\b(salário|salario|freelance|renda|receita|pagamento\s+recebid[oa]|freela)\b/i
const PARCELAS_PATTERN = /\bem\s+(\d+)\s+(?:x|vezes)\b|(\d+)x\b/i
const VALUE_PATTERN = /\b(\d+(?:[.,]\d{1,2})?)\b/

export function parseVoiceInput(raw: string): ParsedVoice | null {
  const text = raw.trim()
  const lower = text.toLowerCase()

  const valorMatch = lower.match(VALUE_PATTERN)
  if (!valorMatch) return null
  const valor = parseFloat(valorMatch[1].replace(',', '.'))
  if (isNaN(valor) || valor <= 0) return null

  const tipo: TipoTransacao = RECEITA_PATTERN.test(lower) ? 'receita' : 'gasto'

  let pagamento: FormaPagamento = tipo === 'receita' ? 'pix' : 'crédito'
  for (const [method, pattern] of PAYMENT_PATTERNS) {
    if (pattern.test(lower)) {
      pagamento = method
      break
    }
  }

  const parcelasMatch = lower.match(PARCELAS_PATTERN)
  const parcelas = parcelasMatch
    ? parseInt(parcelasMatch[1] ?? parcelasMatch[2], 10)
    : undefined

  const valueIndex = lower.indexOf(valorMatch[1])
  const beforeValue = lower.slice(0, valueIndex).trim()
  const descricaoRaw = beforeValue
    .replace(/\b(no|na|em|de|com)\b/g, '')
    .replace(/(crédito|débito|pix|dinheiro|parcelado)/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 1)
    .join(' ')

  const descricao = descricaoRaw || lower.split(/\s+/)[0]
  const descricaoCapitalized = descricao.charAt(0).toUpperCase() + descricao.slice(1)

  return {
    descricao: descricaoCapitalized,
    valor,
    pagamento,
    tipo,
    ...(parcelas ? { parcelas } : {}),
  }
}
