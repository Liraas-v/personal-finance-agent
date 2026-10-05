export type AIFailureReason = 'missing_key' | 'timeout' | 'http' | 'invalid_response' | 'offline'

export class AIProviderError extends Error {
  constructor(
    public readonly reason: AIFailureReason,
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

export const STATUS_BY_REASON: Record<AIFailureReason, number> = {
  missing_key: 503,
  offline: 503,
  timeout: 504,
  http: 502,
  invalid_response: 502,
}

// Classifica o que o fetch/JSON.parse lançou. Nunca inclui o objeto original na mensagem
// (poderia carregar chave ou resposta do provedor).
export function toAIProviderError(e: unknown): AIProviderError {
  if (e instanceof AIProviderError) return e
  if (e instanceof Error) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      return new AIProviderError('timeout', 'A IA demorou demais para responder')
    }
    if (e instanceof TypeError) return new AIProviderError('offline', 'Não foi possível alcançar a IA')
    if (e instanceof SyntaxError) {
      return new AIProviderError('invalid_response', 'A IA devolveu uma resposta que não é JSON válido')
    }
  }
  return new AIProviderError('invalid_response', 'Resposta inesperada da IA')
}
