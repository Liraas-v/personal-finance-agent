import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const base = {
  tipo: 'gasto', categoria: 'Compras', pagamento: 'parcelado', origem: 'manual', createdAt: '2026-09-30T00:00:00Z',
}
const comGrupo = { ...base, id: 'a', descricao: 'Nike (1/3)', valor: 100, data: '2026-09-30', grupoParcelas: 'g1' }
const antigaParcelada = { ...base, id: 'b', descricao: 'Fone (1/3)', valor: 50, data: '2026-09-29' } // dado antigo, sem grupo

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: [comGrupo, antigaParcelada], remove: vi.fn() }),
}))
vi.mock('@/lib/store', () => ({ useFinanceStore: (sel: (s: { config: null }) => unknown) => sel({ config: null }) }))
vi.mock('@/components/transactions/ExpenseForm', () => ({ ExpenseForm: () => null }))
vi.mock('@/components/transactions/InstallmentGroupDialog', () => ({
  InstallmentGroupDialog: ({ transaction }: { transaction: { descricao: string } | null }) =>
    transaction ? <p>diálogo do grupo: {transaction.descricao}</p> : null,
}))

import { ExpenseList } from '@/components/transactions/ExpenseList'

describe('ExpenseList — grupo de parcelas', () => {
  it('parcela com grupo mostra o botão "Parcelas" com rótulo acessível', () => {
    render(<ExpenseList />)
    expect(screen.getByRole('button', { name: 'Gerenciar parcelas de Nike (1/3)' })).toBeInTheDocument()
  })

  it('dado antigo, sem grupo, não mostra o botão', () => {
    render(<ExpenseList />)
    expect(screen.queryByRole('button', { name: 'Gerenciar parcelas de Fone (1/3)' })).not.toBeInTheDocument()
  })

  it('o botão fica visível por teclado e em telas sem hover', () => {
    render(<ExpenseList />)
    const cls = screen.getByRole('button', { name: 'Gerenciar parcelas de Nike (1/3)' }).className
    expect(cls).toContain('focus-visible:opacity-100')
    expect(cls).toContain('[@media(hover:none)]:opacity-100')
  })

  it('clicar abre o diálogo com aquela parcela', () => {
    render(<ExpenseList />)
    fireEvent.click(screen.getByRole('button', { name: 'Gerenciar parcelas de Nike (1/3)' }))
    expect(screen.getByText('diálogo do grupo: Nike (1/3)')).toBeInTheDocument()
  })
})
