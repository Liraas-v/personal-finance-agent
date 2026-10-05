import { describe, it, expect } from 'vitest'
import { messageForReason } from '@/lib/aiMessages'

describe('messageForReason', () => {
  it('uma mensagem específica por motivo, em português e sem termos técnicos soltos', () => {
    expect(messageForReason('missing_key')).toMatch(/chave/i)
    expect(messageForReason('offline')).toMatch(/fora do ar|alcançar/i)
    expect(messageForReason('timeout')).toMatch(/demor/i)
    expect(messageForReason('http')).toMatch(/serviço de IA/i)
    expect(messageForReason('invalid_response')).toMatch(/resposta/i)
  })

  it('motivo desconhecido ou ausente cai numa mensagem genérica', () => {
    expect(messageForReason(undefined)).toBe('A IA não está disponível agora.')
    expect(messageForReason('xyz')).toBe('A IA não está disponível agora.')
  })
})
