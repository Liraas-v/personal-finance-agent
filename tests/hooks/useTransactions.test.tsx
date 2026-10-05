import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

vi.mock('sonner', () => ({ toast: mocks.toast }))
vi.mock('@/lib/repositories', () => ({
  getTransactionRepository: () => ({ create: mocks.create, update: vi.fn(), remove: vi.fn(), list: vi.fn() }),
  getConfigRepository: () => ({ read: vi.fn(), update: vi.fn() }),
}))

import { useFinanceStore } from '@/lib/store'
import { useTransactions } from '@/hooks/useTransactions'
import type { CreateTransactionInput } from '@/lib/repositories/types'
import type { Transaction } from '@/types'

const tx = (id: string, data: string): Transaction => ({
  id, data, tipo: 'gasto', descricao: id, valor: 10, categoria: 'Outros',
  pagamento: 'pix', origem: 'manual', createdAt: '2026-01-01T00:00:00Z',
})

const input = (descricao: string, data: string, valor = 100): CreateTransactionInput => ({
  tipo: 'gasto', descricao, valor, categoria: 'Compras', pagamento: 'parcelado', parcelas: 3, data, origem: 'manual',
})

beforeEach(() => {
  mocks.create.mockReset()
  mocks.toast.success.mockClear()
  mocks.toast.error.mockClear()
  mocks.toast.warning.mockClear()
  mocks.create.mockImplementation(async (i: CreateTransactionInput) => ({
    ...i, id: `id-${i.descricao}`, createdAt: '2026-10-05T00:00:00Z',
  }))
  useFinanceStore.setState({
    transactions: [tx('antiga', '2026-08-20'), tx('recente', '2026-09-30'), tx('meio', '2026-09-01')],
    dateRange: null,
    config: null,
  })
})

describe('useTransactions', () => {
  it('devolve as transações da mais recente para a mais antiga', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.transactions.map((t) => t.id)).toEqual(['recente', 'meio', 'antiga'])
  })

  it('o filtro de período continua valendo e também sai ordenado', () => {
    useFinanceStore.setState({ dateRange: { from: '2026-09-01', to: '2026-09-30' } })
    const { result } = renderHook(() => useTransactions())
    expect(result.current.transactions.map((t) => t.id)).toEqual(['recente', 'meio'])
  })
})

describe('useTransactions.createMany', () => {
  const tres = [input('Nike (1/3)', '2027-01-05'), input('Nike (2/3)', '2027-02-05'), input('Nike (3/3)', '2027-03-05', 100.01)]

  it('salva cada lançamento, em ordem, e todos entram no store', async () => {
    const { result } = renderHook(() => useTransactions())
    let salvos: Transaction[] = []
    await act(async () => { salvos = await result.current.createMany(tres) })

    expect(mocks.create.mock.calls.map((c) => c[0].descricao)).toEqual(['Nike (1/3)', 'Nike (2/3)', 'Nike (3/3)'])
    expect(salvos).toHaveLength(3)
    expect(useFinanceStore.getState().transactions.map((t) => t.id)).toEqual(
      expect.arrayContaining(['id-Nike (1/3)', 'id-Nike (2/3)', 'id-Nike (3/3)'])
    )
  })

  it('mostra um único aviso de sucesso com a quantidade e o total, em vez de um por parcela', async () => {
    const { result } = renderHook(() => useTransactions())
    await act(async () => { await result.current.createMany(tres) })

    expect(mocks.toast.success).toHaveBeenCalledTimes(1)
    const msg = String(mocks.toast.success.mock.calls[0][0])
    expect(msg).toContain('3 parcelas')
    expect(msg).toContain('300.01')
  })

  it('se uma parcela falha, para, mantém as já salvas e avisa quantas foram', async () => {
    mocks.create
      .mockImplementationOnce(async (i: CreateTransactionInput) => ({ ...i, id: 'ok-1', createdAt: '' }))
      .mockRejectedValueOnce(new Error('falhou'))
    const { result } = renderHook(() => useTransactions())
    let salvos: Transaction[] = []
    await act(async () => { salvos = await result.current.createMany(tres) })

    expect(mocks.create).toHaveBeenCalledTimes(2)
    expect(salvos).toHaveLength(1)
    expect(useFinanceStore.getState().transactions.some((t) => t.id === 'ok-1')).toBe(true)
    expect(mocks.toast.success).not.toHaveBeenCalled()
    expect(mocks.toast.error).toHaveBeenCalledTimes(1)
    expect(String(mocks.toast.error.mock.calls[0][0])).toContain('1 de 3')
  })

  it('lista vazia não chama o repositório nem mostra aviso', async () => {
    const { result } = renderHook(() => useTransactions())
    await act(async () => { await result.current.createMany([]) })
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.toast.success).not.toHaveBeenCalled()
  })
})
