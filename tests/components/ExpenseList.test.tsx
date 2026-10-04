import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const t = {
  id: '1', tipo: 'gasto', descricao: 'Uber', valor: 27.8, categoria: 'Transporte',
  pagamento: 'crédito', data: '2026-09-30', origem: 'voz', createdAt: '2026-09-30T00:00:00Z',
}
vi.mock('@/hooks/useTransactions', () => ({ useTransactions: () => ({ transactions: [t], remove: vi.fn() }) }))
vi.mock('@/lib/store', () => ({ useFinanceStore: (sel: (s: { config: null }) => unknown) => sel({ config: null }) }))
vi.mock('@/components/transactions/ExpenseForm', () => ({ ExpenseForm: () => null }))

import { ExpenseList } from '@/components/transactions/ExpenseList'

describe('ExpenseList', () => {
  it('mostra a data no formato dd/mm/aaaa', () => {
    render(<ExpenseList />)
    expect(screen.getByText('30/09/2026')).toBeInTheDocument()
  })

  it('mostra a origem como texto', () => {
    render(<ExpenseList />)
    expect(screen.getByText('voz')).toBeInTheDocument()
  })

  it('editar e remover ficam visíveis por teclado e em telas sem hover', () => {
    render(<ExpenseList />)
    for (const nome of ['Editar Uber', 'Remover Uber']) {
      const cls = screen.getByRole('button', { name: nome }).className
      expect(cls).toContain('focus-visible:opacity-100')
      expect(cls).toContain('[@media(hover:none)]:opacity-100')
    }
  })

  it('o valor usa fonte mono com algarismos tabulares', () => {
    render(<ExpenseList />)
    const valor = screen.getByText(/27,80/)
    expect(valor.className).toMatch(/font-mono/)
    expect(valor.className).toMatch(/tabular-nums/)
  })
})
