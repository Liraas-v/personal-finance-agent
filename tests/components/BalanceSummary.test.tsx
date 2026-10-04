import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

let mockTx = { totalGastos: 0, totalReceitas: 0, saldo: 0 }
let mockConfig: { moeda?: string; metaEconomia?: number } | null = { moeda: 'BRL', metaEconomia: 0 }

vi.mock('@/hooks/useTransactions', () => ({ useTransactions: () => mockTx }))
vi.mock('@/lib/store', () => ({
  useFinanceStore: (sel: (s: { config: typeof mockConfig }) => unknown) => sel({ config: mockConfig }),
}))

import { BalanceSummary } from '@/components/dashboard/BalanceSummary'

beforeEach(() => {
  mockTx = { totalGastos: 0, totalReceitas: 0, saldo: 0 }
  mockConfig = { moeda: 'BRL', metaEconomia: 0 }
})

describe('BalanceSummary', () => {
  it('mostra o saldo formatado como número principal', () => {
    mockTx = { totalGastos: 6787, totalReceitas: 13250, saldo: 6463 }
    render(<BalanceSummary />)
    expect(screen.getByTestId('saldo')).toHaveTextContent(/R\$\s6\.463,00/)
  })

  it('mostra a % de gastos sobre a receita', () => {
    mockTx = { totalGastos: 5000, totalReceitas: 10000, saldo: 5000 }
    render(<BalanceSummary />)
    expect(screen.getByText(/50% da receita/)).toBeInTheDocument()
  })

  it('sem receitas não divide por zero nem mostra NaN', () => {
    mockTx = { totalGastos: 300, totalReceitas: 0, saldo: -300 }
    const { container } = render(<BalanceSummary />)
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
    expect(screen.queryByText(/da receita/)).not.toBeInTheDocument()
  })

  it('sem gastos mostra "Nenhum gasto"', () => {
    mockTx = { totalGastos: 0, totalReceitas: 1000, saldo: 1000 }
    render(<BalanceSummary />)
    expect(screen.getByText(/Nenhum gasto/)).toBeInTheDocument()
  })

  it('meta 0 pede para definir a meta', () => {
    render(<BalanceSummary />)
    expect(screen.getByText('Defina uma meta')).toBeInTheDocument()
  })

  it('meta atingida limita a 100%', () => {
    mockTx = { totalGastos: 0, totalReceitas: 5000, saldo: 5000 }
    mockConfig = { moeda: 'BRL', metaEconomia: 1500 }
    render(<BalanceSummary />)
    expect(screen.getByText(/^100%/)).toBeInTheDocument()
  })

  it('saldo negativo não gera % de meta negativa e usa a cor de negativo', () => {
    mockTx = { totalGastos: 900, totalReceitas: 100, saldo: -800 }
    mockConfig = { moeda: 'BRL', metaEconomia: 1500 }
    render(<BalanceSummary />)
    expect(screen.getByText(/^0%/)).toBeInTheDocument()
    expect(screen.getByTestId('saldo').className).toMatch(/text-negative/)
  })
})
