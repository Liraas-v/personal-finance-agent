import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('@/lib/repositories', () => ({
  getTransactionRepository: () => ({ create: vi.fn(), update: vi.fn(), remove: vi.fn(), list: vi.fn() }),
  getConfigRepository: () => ({ read: vi.fn(), update: vi.fn() }),
}))

import { useFinanceStore } from '@/lib/store'
import { useTransactions } from '@/hooks/useTransactions'
import type { Transaction } from '@/types'

const tx = (id: string, data: string): Transaction => ({
  id, data, tipo: 'gasto', descricao: id, valor: 10, categoria: 'Outros',
  pagamento: 'pix', origem: 'manual', createdAt: '2026-01-01T00:00:00Z',
})

beforeEach(() => {
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
