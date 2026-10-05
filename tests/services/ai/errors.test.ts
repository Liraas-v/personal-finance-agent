import { describe, it, expect } from 'vitest'
import { AIProviderError, STATUS_BY_REASON, toAIProviderError } from '@/services/ai/errors'

describe('AIProviderError', () => {
  it('carrega o motivo e o status HTTP original', () => {
    const e = new AIProviderError('http', 'Groq HTTP 429', 429)
    expect(e).toBeInstanceOf(Error)
    expect(e.reason).toBe('http')
    expect(e.status).toBe(429)
    expect(e.name).toBe('AIProviderError')
  })
})

describe('toAIProviderError', () => {
  it('mantém um AIProviderError como está', () => {
    const original = new AIProviderError('missing_key', 'sem chave')
    expect(toAIProviderError(original)).toBe(original)
  })

  it('TimeoutError e AbortError viram "timeout"', () => {
    const t = Object.assign(new Error('x'), { name: 'TimeoutError' })
    const a = Object.assign(new Error('x'), { name: 'AbortError' })
    expect(toAIProviderError(t).reason).toBe('timeout')
    expect(toAIProviderError(a).reason).toBe('timeout')
  })

  it('falha de rede (TypeError do fetch) vira "offline"', () => {
    expect(toAIProviderError(new TypeError('fetch failed')).reason).toBe('offline')
  })

  it('SyntaxError de JSON vira "invalid_response"', () => {
    expect(toAIProviderError(new SyntaxError('Unexpected token')).reason).toBe('invalid_response')
  })

  it('qualquer outra coisa vira "invalid_response" sem vazar o objeto original na mensagem', () => {
    const e = toAIProviderError({ segredo: 'GROQ_KEY_123' })
    expect(e.reason).toBe('invalid_response')
    expect(e.message).not.toContain('GROQ_KEY_123')
  })

  it('um Error genérico não vaza a mensagem original', () => {
    const e = toAIProviderError(new Error('segredo-interno'))
    expect(e.reason).toBe('invalid_response')
    expect(e.message).not.toContain('segredo-interno')
  })
})

describe('STATUS_BY_REASON', () => {
  it('mapeia cada motivo para um status HTTP coerente', () => {
    expect(STATUS_BY_REASON).toEqual({
      missing_key: 503,
      offline: 503,
      timeout: 504,
      http: 502,
      invalid_response: 502,
    })
  })
})
