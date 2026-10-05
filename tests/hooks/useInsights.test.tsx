import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

let mockTx: { transactions: unknown[]; totalGastos: number; totalReceitas: number; saldo: number; porCategoria: Record<string, number> }
vi.mock('@/hooks/useTransactions', () => ({ useTransactions: () => mockTx }))
vi.mock('@/lib/store', () => ({ useFinanceStore: (sel: (s: { config: null }) => unknown) => sel({ config: null }) }))

import { useInsights } from '@/hooks/useInsights'

const comDados = () => ({
  transactions: [{ data: '2026-09-01' }, { data: '2026-09-30' }],
  totalGastos: 10, totalReceitas: 20, saldo: 10, porCategoria: { Outros: 10 },
})

beforeEach(() => {
  mockTx = comDados()
  vi.restoreAllMocks()
})

const respond = (body: unknown, ok = true) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok, json: async () => body } as Response)

describe('useInsights', () => {
  it('sem transações fica em idle e não chama a IA', async () => {
    mockTx = { ...comDados(), transactions: [] }
    const spy = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })

  it('resposta com textos vira ready', async () => {
    respond({ insights: ['a', 'b'] })
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('ready')
    expect(result.current.insights).toHaveLength(2)
  })

  it('resposta sem textos vira empty (e não idle)', async () => {
    respond({ insights: [] })
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('empty')
  })

  it('falha de rede vira error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('error')
    expect(result.current.insights).toEqual([])
  })

  it('resposta HTTP não ok vira error', async () => {
    respond({ error: 'x' }, false)
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('error')
  })

  it('503 com motivo expõe o motivo ao chamador', async () => {
    respond({ error: 'x', reason: 'missing_key' }, false)
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('error')
    expect(result.current.reason).toBe('missing_key')
  })

  it('502 com corpo que não é JSON vira error sem motivo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => { throw new SyntaxError('x') },
    } as unknown as Response)
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('error')
    expect(result.current.reason).toBeUndefined()
  })

  it('o motivo é limpo quando a nova tentativa dá certo', async () => {
    respond({ reason: 'timeout' }, false)
    const { result } = renderHook(() => useInsights())
    await act(async () => { await result.current.generate() })
    expect(result.current.reason).toBe('timeout')
    respond({ insights: ['a'] })
    await act(async () => { await result.current.generate() })
    expect(result.current.status).toBe('ready')
    expect(result.current.reason).toBeUndefined()
  })
})
