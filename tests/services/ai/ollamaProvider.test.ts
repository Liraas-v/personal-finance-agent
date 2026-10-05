import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  readConfig: () => ({ ollama: { url: 'http://localhost:11434', model: 'm' } }),
}))

const resumo = { periodo: { from: 'a', to: 'b' }, totalGastos: 1, totalReceitas: 2, saldo: 1, porCategoria: {}, moeda: 'BRL' }

describe('OllamaProvider — falhas tipadas', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  const provider = async () => new (await import('@/services/ai/ollamaProvider')).OllamaProvider()
  const insights = async () => (await provider()).generateInsights(resumo as never)
  const resposta = (response: string) => ({ ok: true, json: async () => ({ response }) })

  it('servidor Ollama desligado: "offline"', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))
    await expect(insights()).rejects.toMatchObject({ reason: 'offline' })
  })

  it('modelo ausente (HTTP 404): "http" com o status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) })
    await expect(insights()).rejects.toMatchObject({ reason: 'http', status: 404 })
  })

  it('tempo esgotado: "timeout"', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('t'), { name: 'TimeoutError' }))
    await expect(insights()).rejects.toMatchObject({ reason: 'timeout' })
  })

  it('corpo que não é JSON: "invalid_response"', async () => {
    fetchMock.mockResolvedValue(resposta('isto não é json'))
    await expect(insights()).rejects.toMatchObject({ reason: 'invalid_response' })
  })

  it('JSON sem a lista de insights: "invalid_response", e NÃO lista vazia', async () => {
    fetchMock.mockResolvedValue(resposta('{"outra":1}'))
    await expect(insights()).rejects.toMatchObject({ reason: 'invalid_response' })
  })

  it('aceita lista pura e objeto com "insights"', async () => {
    fetchMock.mockResolvedValueOnce(resposta('["a","b"]'))
    await expect(insights()).resolves.toEqual(['a', 'b'])
    fetchMock.mockResolvedValueOnce(resposta('{"insights":[]}'))
    await expect(insights()).resolves.toEqual([])
  })

  it('analyzeExpense lança em vez de devolver o fallback', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    await expect((await provider()).analyzeExpense('x 10')).rejects.toMatchObject({ reason: 'http' })
  })

  it('o prompt lista exatamente as categorias recebidas', async () => {
    fetchMock.mockResolvedValue(resposta('{"categoria":"Pets","descricao":"x","pagamento":"pix"}'))
    await (await provider()).analyzeExpense('x 10', ['Pets', 'Outros'])
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const p = JSON.parse(options.body as string).prompt as string
    expect(p).toContain('Categorias válidas: Pets, Outros.')
    expect(p).not.toContain('Lazer')
  })
})
