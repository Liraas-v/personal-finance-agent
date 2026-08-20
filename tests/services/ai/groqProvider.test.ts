import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('GroqProvider', () => {
  const originalKey = process.env.GROQ_API_KEY
  const fetchMock = vi.fn()

  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key'
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    process.env.GROQ_API_KEY = originalKey
    vi.unstubAllGlobals()
  })

  // Groq desativa modelos periodicamente (ver console.groq.com/docs/deprecations).
  // O `llama-3.1-8b-instant` hardcoded aqui foi desligado em 16/08/2026 e deixou o
  // modo demo em produção respondendo 503 em /api/ai/chat mesmo com a chave certa —
  // este teste existe pra pegar a próxima vez que isso acontecer.
  it('usa um modelo Groq ativo (não descontinuado) nas chamadas de chat', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    })

    const { GroqProvider } = await import('@/services/ai/groqProvider')
    await new GroqProvider().chat('oi')

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(options.body as string)
    expect(body.model).not.toBe('llama-3.1-8b-instant')
    expect(body.model).not.toBe('llama-3.3-70b-versatile')
    expect(body.model).toBe('openai/gpt-oss-20b')
  })

  it('status() usa o mesmo modelo relatado em chat()', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) })

    const { GroqProvider } = await import('@/services/ai/groqProvider')
    const provider = new GroqProvider()
    const status = await provider.status()

    expect(status.model).toBe('openai/gpt-oss-20b')
  })
})
