import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiTransactionRepository } from '@/lib/repositories/apiTransactionRepository'

describe('ApiTransactionRepository', () => {
  const repo = new ApiTransactionRepository()
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('list() chama GET /api/transactions e retorna o corpo', async () => {
    const transactions = [{ id: '1', descricao: 'iFood', valor: 42 }]
    fetchMock.mockResolvedValue({ ok: true, json: async () => transactions })

    const result = await repo.list()

    expect(fetch).toHaveBeenCalledWith('/api/transactions')
    expect(result).toEqual(transactions)
  })

  it('create() faz POST com o input e retorna a transação salva', async () => {
    const input = {
      tipo: 'gasto', descricao: 'iFood', valor: 42, categoria: 'Alimentação',
      pagamento: 'pix', data: '2026-08-01', origem: 'manual',
    } as const
    const saved = { ...input, id: '1', createdAt: '2026-08-01T00:00:00.000Z' }
    fetchMock.mockResolvedValue({ ok: true, json: async () => saved })

    const result = await repo.create(input)

    expect(fetch).toHaveBeenCalledWith('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    expect(result).toEqual(saved)
  })

  it('update() faz PATCH em /api/transactions/:id', async () => {
    const updated = { id: '1', descricao: 'iFood editado' }
    fetchMock.mockResolvedValue({ ok: true, json: async () => updated })

    const result = await repo.update('1', { descricao: 'iFood editado' })

    expect(fetch).toHaveBeenCalledWith('/api/transactions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: 'iFood editado' }),
    })
    expect(result).toEqual(updated)
  })

  it('remove() faz DELETE em /api/transactions/:id', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    await repo.remove('1')
    expect(fetch).toHaveBeenCalledWith('/api/transactions/1', { method: 'DELETE' })
  })

  it('clear() faz DELETE em /api/transactions', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    await repo.clear()
    expect(fetch).toHaveBeenCalledWith('/api/transactions', { method: 'DELETE' })
  })

  it('lança erro quando a resposta não é ok', async () => {
    fetchMock.mockResolvedValue({ ok: false })
    await expect(repo.list()).rejects.toThrow('Failed to load transactions')
  })
})
