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

  describe('falhas tipadas', () => {
    const resumo = { periodo: { from: 'a', to: 'b' }, totalGastos: 1, totalReceitas: 2, saldo: 1, porCategoria: {}, moeda: 'BRL' }
    const insights = async () => {
      const { GroqProvider } = await import('@/services/ai/groqProvider')
      return new GroqProvider().generateInsights(resumo as never)
    }
    const resposta = (content: string) => ({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) })

    it('sem chave: "missing_key" e nenhuma chamada de rede', async () => {
      delete process.env.GROQ_API_KEY
      await expect(insights()).rejects.toMatchObject({ name: 'AIProviderError', reason: 'missing_key' })
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('HTTP não ok: "http" com o status', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) })
      await expect(insights()).rejects.toMatchObject({ reason: 'http', status: 429 })
    })

    it('tempo esgotado: "timeout"', async () => {
      fetchMock.mockRejectedValue(Object.assign(new Error('t'), { name: 'TimeoutError' }))
      await expect(insights()).rejects.toMatchObject({ reason: 'timeout' })
    })

    it('rede indisponível: "offline"', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'))
      await expect(insights()).rejects.toMatchObject({ reason: 'offline' })
    })

    it('corpo que não é JSON: "invalid_response"', async () => {
      fetchMock.mockResolvedValue(resposta('isto não é json'))
      await expect(insights()).rejects.toMatchObject({ reason: 'invalid_response' })
    })

    it('JSON sem a lista de insights: "invalid_response", e NÃO lista vazia', async () => {
      fetchMock.mockResolvedValue(resposta('{"outra":1}'))
      await expect(insights()).rejects.toMatchObject({ reason: 'invalid_response' })
    })

    it('resposta válida com lista vazia continua sendo lista vazia (a IA respondeu)', async () => {
      fetchMock.mockResolvedValue(resposta('{"insights":[]}'))
      await expect(insights()).resolves.toEqual([])
    })

    it('analyzeExpense também lança em vez de devolver o fallback', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
      const { GroqProvider } = await import('@/services/ai/groqProvider')
      await expect(new GroqProvider().analyzeExpense('x 10')).rejects.toMatchObject({ reason: 'http' })
    })
  })
})
