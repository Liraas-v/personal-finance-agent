import { describe, it, expect, afterEach } from 'vitest'

describe('getAIProvider', () => {
  const original = process.env.AI_PROVIDER

  afterEach(() => {
    process.env.AI_PROVIDER = original
  })

  it('retorna OllamaProvider por padrão', async () => {
    delete process.env.AI_PROVIDER
    const { getAIProvider } = await import('@/services/ai')
    const { OllamaProvider } = await import('@/services/ai/ollamaProvider')
    expect(getAIProvider()).toBeInstanceOf(OllamaProvider)
  })

  it('retorna GroqProvider quando AI_PROVIDER=groq', async () => {
    process.env.AI_PROVIDER = 'groq'
    const { getAIProvider } = await import('@/services/ai')
    const { GroqProvider } = await import('@/services/ai/groqProvider')
    expect(getAIProvider()).toBeInstanceOf(GroqProvider)
  })
})
