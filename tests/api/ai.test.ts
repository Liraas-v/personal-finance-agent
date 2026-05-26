import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

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

  it('POST /api/ai/chat retorna 503 quando o provider falha', async () => {
    mockProvider.chat.mockRejectedValue(new Error('offline'))
    const { POST } = await import('@/app/api/ai/chat/route')

    const res = await POST(makeRequest({ message: 'Como estou indo?' }))
    expect(res.status).toBe(503)
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
})
