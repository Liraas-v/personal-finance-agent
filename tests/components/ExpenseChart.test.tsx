import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FALLBACK_CHART_COLORS } from '@/lib/chartColors'

const transactions = [
  { id: '1', descricao: 'Salário', valor: 5000, tipo: 'receita', categoria: 'Outros', data: '2026-09-01', origem: 'manual' },
  { id: '2', descricao: 'Aluguel', valor: 1800, tipo: 'gasto', categoria: 'Moradia', data: '2026-09-02', origem: 'manual' },
]

vi.mock('@/lib/store', () => ({
  useFinanceStore: (sel: (s: { transactions: typeof transactions }) => unknown) => sel({ transactions }),
}))
vi.mock('@/hooks/useChartColors', () => ({ useChartColors: () => FALLBACK_CHART_COLORS }))

import { ExpenseChart } from '@/components/dashboard/ExpenseChart'

describe('ExpenseChart', () => {
  it('identifica qual barra é gasto e qual é receita sem depender do hover', () => {
    render(<ExpenseChart />)
    expect(screen.getByText('Gastos')).toBeInTheDocument()
    expect(screen.getByText('Receitas')).toBeInTheDocument()
  })

  it('sem dados não mostra a legenda', () => {
    transactions.length = 0
    render(<ExpenseChart />)
    expect(screen.queryByText('Gastos')).not.toBeInTheDocument()
    expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument()
  })
})
