import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

const generate = vi.fn()
let status: 'idle' | 'loading' | 'ready' | 'empty' | 'error' = 'idle'
vi.mock('@/hooks/useInsights', () => ({
  useInsights: () => ({ insights: [], status, loading: status === 'loading', generate }),
}))

import { useFinanceStore } from '@/lib/store'
import { InsightBanner } from '@/components/dashboard/InsightBanner'

const tx = { id: '1', data: '2026-09-01', tipo: 'gasto', descricao: 'x', valor: 1, categoria: 'Outros', pagamento: 'pix', origem: 'manual', createdAt: '' }

beforeEach(() => {
  generate.mockClear()
  status = 'idle'
  useFinanceStore.setState({ transactions: [] })
})

describe('InsightBanner', () => {
  it('sem transações não tenta gerar e pede para adicionar', () => {
    render(<InsightBanner />)
    expect(generate).not.toHaveBeenCalled()
    expect(screen.getByText(/Adicione transações para gerar insights/)).toBeInTheDocument()
  })

  it('gera quando as transações chegam depois da primeira renderização', () => {
    render(<InsightBanner />)
    expect(generate).not.toHaveBeenCalled()
    act(() => {
      useFinanceStore.setState({ transactions: [tx as never] })
    })
    expect(generate).toHaveBeenCalledTimes(1)
  })

  it('com transações já carregadas gera uma vez na montagem e não pede para adicionar', () => {
    useFinanceStore.setState({ transactions: [tx as never] })
    render(<InsightBanner />)
    expect(generate).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Adicione transações/)).not.toBeInTheDocument()
  })
})
