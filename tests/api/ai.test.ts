import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { AIProviderError } from '@/services/ai/errors'

const mockProvider = {
  chat: vi.fn(),
  analyzeExpense: vi.fn(),
  generateInsights: vi.fn(),
  status: vi.fn(),
  listModels: vi.fn(),
}

vi.mock('@/services/ai', () => ({
  getAIProvider: () => mockProvider,
}))

function makeRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('rotas de IA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('POST /api/ai/chat retorna a resposta do provider', async () => {
    mockProvider.chat.mockResolvedValue('Você está indo bem!')
    const { POST } = await import('@/app/api/ai/chat/route')

    const res = await POST(makeRequest({ message: 'Como estou indo?' }))
    expect(await res.json()).toEqual({ reply: 'Você está indo bem!' })
  })

  it('POST /api/ai/chat usa o mesmo mapeamento de falhas (timeout → 504)', async () => {
    mockProvider.chat.mockRejectedValue(new AIProviderError('timeout', 'x'))
    const { POST } = await import('@/app/api/ai/chat/route')

    const res = await POST(makeRequest({ message: 'Como estou indo?' }))
    expect(res.status).toBe(504)
    expect(await res.json()).toMatchObject({ reason: 'timeout' })
  })

  it('POST /api/ai/chat com erro genérico vira 502 (invalid_response)', async () => {
    mockProvider.chat.mockRejectedValue(new Error('offline'))
    const { POST } = await import('@/app/api/ai/chat/route')

    const res = await POST(makeRequest({ message: 'Como estou indo?' }))
    expect(res.status).toBe(502)
  })

  it('POST /api/ai/insights devolve o status e o motivo da falha (nunca 200 com lista vazia)', async () => {
    const casos: [ConstructorParameters<typeof AIProviderError>[0], number][] = [
      ['missing_key', 503],
      ['offline', 503],
      ['timeout', 504],
      ['http', 502],
      ['invalid_response', 502],
    ]
    const { POST } = await import('@/app/api/ai/insights/route')
    for (const [reason, status] of casos) {
      mockProvider.generateInsights.mockRejectedValueOnce(new AIProviderError(reason, 'x'))
      const res = await POST(makeRequest({ summary: {} }))
      expect(res.status, reason).toBe(status)
      expect(await res.json()).toMatchObject({ reason })
    }
  })

  it('POST /api/ai/insights com resposta válida e lista vazia continua 200', async () => {
    mockProvider.generateInsights.mockResolvedValue([])
    const { POST } = await import('@/app/api/ai/insights/route')
    const res = await POST(makeRequest({ summary: {} }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ insights: [] })
  })

  it('POST /api/ai/analyze degrada para "Outros" quando a IA falha', async () => {
    mockProvider.analyzeExpense.mockRejectedValue(new AIProviderError('offline', 'x'))
    const { POST } = await import('@/app/api/ai/analyze/route')
    const res = await POST(makeRequest({ text: 'padaria 12' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ categoria: 'Outros', descricao: 'padaria 12', pagamento: 'crédito', degraded: true })
  })

  it('erro que não é AIProviderError vira 502 com motivo, sem vazar a mensagem original', async () => {
    mockProvider.generateInsights.mockRejectedValue(new Error('segredo-interno'))
    const { POST } = await import('@/app/api/ai/insights/route')
    const res = await POST(makeRequest({ summary: {} }))
    expect(res.status).toBe(502)
    expect(JSON.stringify(await res.json())).not.toContain('segredo-interno')
  })

  it('POST /api/ai/analyze delega pro provider', async () => {
    mockProvider.analyzeExpense.mockResolvedValue({ categoria: 'Alimentação', descricao: 'iFood', pagamento: 'pix' })
    const { POST } = await import('@/app/api/ai/analyze/route')

    const res = await POST(makeRequest({ text: 'ifood 30 reais' }))
    expect(await res.json()).toEqual({ categoria: 'Alimentação', descricao: 'iFood', pagamento: 'pix' })
  })

  it('POST /api/ai/insights delega pro provider', async () => {
    mockProvider.generateInsights.mockResolvedValue(['Você gastou 20% a mais esse mês'])
    const { POST } = await import('@/app/api/ai/insights/route')

    const res = await POST(makeRequest({ summary: {} }))
    expect(await res.json()).toEqual({ insights: ['Você gastou 20% a mais esse mês'] })
  })

  it('GET /api/ai/status delega pro provider', async () => {
    mockProvider.status.mockResolvedValue({ online: true, model: 'llama-3.1-8b-instant' })
    const { GET } = await import('@/app/api/ai/status/route')

    const res = await GET()
    expect(await res.json()).toEqual({ online: true, model: 'llama-3.1-8b-instant' })
  })

  it('GET /api/ai/models delega pro provider', async () => {
    mockProvider.listModels.mockResolvedValue(['llama-3.1-8b-instant'])
    const { GET } = await import('@/app/api/ai/models/route')

    const res = await GET()
    expect(await res.json()).toEqual({ models: ['llama-3.1-8b-instant'] })
  })

  it('POST /api/ai/analyze repassa as categorias ao provider (e garante "Outros")', async () => {
    mockProvider.analyzeExpense.mockResolvedValue({ categoria: 'Pets', descricao: 'ração', pagamento: 'pix' })
    const { POST } = await import('@/app/api/ai/analyze/route')
    const res = await POST(makeRequest({ text: 'ração 50', categorias: ['Pets', 'Casa'] }))
    expect(mockProvider.analyzeExpense).toHaveBeenCalledWith('ração 50', ['Pets', 'Casa', 'Outros'])
    expect((await res.json()).categoria).toBe('Pets')
  })

  it('POST /api/ai/analyze normaliza uma categoria inventada pela IA para "Outros"', async () => {
    mockProvider.analyzeExpense.mockResolvedValue({ categoria: 'Lazer', descricao: 'cinema', pagamento: 'pix' })
    const { POST } = await import('@/app/api/ai/analyze/route')
    const res = await POST(makeRequest({ text: 'cinema 40', categorias: ['Pets'] }))
    expect((await res.json()).categoria).toBe('Outros')
  })

  it('POST /api/ai/analyze sem categorias valida contra as padrão', async () => {
    mockProvider.analyzeExpense.mockResolvedValue({ categoria: 'alimentacao', descricao: 'x', pagamento: 'pix' })
    const { POST } = await import('@/app/api/ai/analyze/route')
    const res = await POST(makeRequest({ text: 'x' }))
    expect((await res.json()).categoria).toBe('Alimentação')
  })
})
