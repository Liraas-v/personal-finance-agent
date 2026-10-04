import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/repositories', () => ({
  getConfigRepository: () => ({ update: vi.fn() }),
  getTransactionRepository: () => ({}),
}))
vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ saldo: 800, porCategoria: { Alimentação: 1000, Lazer: 100, Saúde: 50 } }),
}))

import { useFinanceStore } from '@/lib/store'
import { GoalsPanel } from '@/components/goals/GoalsPanel'

beforeEach(() => {
  useFinanceStore.setState({ config: null })
})

describe('GoalsPanel', () => {
  it('mostra a meta real quando o config chega depois da primeira renderização', () => {
    render(<GoalsPanel />)
    act(() => {
      useFinanceStore.setState({
        config: { moeda: 'BRL', metaEconomia: 1500, limitesPorCategoria: {} } as never,
      })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByPlaceholderText('Ex: 2000')).toHaveValue('1500')
  })

  it('categoria com limite mostra a barra; sem limite mostra "Definir limite" e nenhuma barra', () => {
    useFinanceStore.setState({
      config: { moeda: 'BRL', metaEconomia: 0, limitesPorCategoria: { Alimentação: 900 } } as never,
    })
    render(<GoalsPanel />)
    const linhaAlim = screen.getByText('Alimentação').closest('[data-categoria]') as HTMLElement
    expect(linhaAlim.querySelector('[role="progressbar"]')).not.toBeNull()
    const linhaLazer = screen.getByText('Lazer').closest('[data-categoria]') as HTMLElement
    expect(linhaLazer.querySelector('[role="progressbar"]')).toBeNull()
    expect(screen.getAllByRole('button', { name: /Definir limite de Lazer/ })).toHaveLength(1)
  })

  it('gasto acima do limite aparece como estourado', () => {
    useFinanceStore.setState({
      config: { moeda: 'BRL', metaEconomia: 0, limitesPorCategoria: { Alimentação: 900 } } as never,
    })
    render(<GoalsPanel />)
    const linha = screen.getByText('Alimentação').closest('[data-categoria]') as HTMLElement
    expect(linha.getAttribute('data-status')).toBe('over')
  })
})
