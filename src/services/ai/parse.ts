import type { ParsedTransaction } from '@/types'
import { AIProviderError, toAIProviderError } from './errors'

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw toAIProviderError(e)
  }
}

// Lista vazia só é válida quando a IA realmente respondeu uma lista; formato inesperado é falha.
export function parseInsights(raw: string): string[] {
  const parsed = parseJson(raw)
  const lista = Array.isArray(parsed) ? parsed : (parsed as { insights?: unknown } | null)?.insights
  if (!Array.isArray(lista) || !lista.every((i) => typeof i === 'string')) {
    throw new AIProviderError('invalid_response', 'A IA não devolveu a lista de insights esperada')
  }
  return lista as string[]
}

export function parseExpense(raw: string): ParsedTransaction {
  const parsed = parseJson(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AIProviderError('invalid_response', 'A IA não devolveu a análise esperada')
  }
  return parsed as ParsedTransaction
}
