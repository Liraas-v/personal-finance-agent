import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'

const removeMany = vi.fn()
const updateGroup = vi.fn()
vi.mock('@/hooks/useTransactions', () => ({ useTransactions: () => ({ removeMany, updateGroup }) }))

import { useFinanceStore } from '@/lib/store'
import { splitInstallments } from '@/lib/installments'
import { InstallmentGroupDialog } from '@/components/transactions/InstallmentGroupDialog'
import type { Transaction } from '@/types'

function compra(): Transaction[] {
  return splitInstallments({ total: 1200, parcelas: 12, primeiraData: '2026-09-05', descricao: 'Nike', grupoParcelas: 'g1' }).map(
    (p, i) => ({
      id: `p${i + 1}`,
      tipo: 'gasto',
      categoria: 'Compras',
      pagamento: 'parcelado',
      origem: 'manual',
      createdAt: '2026-09-05T00:00:00Z',
      ...p,
    }),
  )
}

const avulsa: Transaction = {
  id: 'x', tipo: 'gasto', descricao: 'Padaria', valor: 10, categoria: 'Alimentação', pagamento: 'pix',
  data: '2026-09-06', origem: 'manual', createdAt: '2026-09-06T00:00:00Z',
}

const abrir = (onClose = vi.fn()) => {
  render(<InstallmentGroupDialog transaction={useFinanceStore.getState().transactions[0]} onClose={onClose} />)
  return onClose
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-10T12:00:00Z'))
  removeMany.mockReset().mockResolvedValue({ total: 0, ok: 0, falhas: 0 })
  updateGroup.mockReset().mockResolvedValue({ total: 0, ok: 0, falhas: 0 })
  useFinanceStore.setState({
    transactions: [...compra(), avulsa],
    config: { moeda: 'BRL', metaEconomia: 0, limitesPorCategoria: {} } as never,
  })
})

afterEach(() => vi.useRealTimers())

describe('InstallmentGroupDialog — resumo', () => {
  it('lista as 12 parcelas do grupo (e só elas) com data, valor e o total', () => {
    abrir()
    const dialog = screen.getByRole('dialog', { name: 'Parcelas de Nike' })
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(12)
    expect(within(dialog).getByText('Nike (1/12)')).toBeInTheDocument()
    expect(within(dialog).getByText('05/09/2026')).toBeInTheDocument()
    expect(within(dialog).queryByText('Padaria')).not.toBeInTheDocument()
    expect(dialog).toHaveTextContent(/12 parcelas · total R\$\s*1\.200,00/)
  })

  it('o valor das parcelas usa mono com algarismos tabulares', () => {
    abrir()
    const valor = screen.getAllByText(/R\$\s*100,00/)[0]
    expect(valor.className).toMatch(/font-mono/)
    expect(valor.className).toMatch(/tabular-nums/)
  })

  it('fecha com Esc', () => {
    const onClose = abrir()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('sem transação fica fechado', () => {
    render(<InstallmentGroupDialog transaction={null} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('InstallmentGroupDialog — excluir todas', () => {
  it('pede confirmação com a contagem e só então remove as 12', async () => {
    const onClose = abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Excluir todas' }))
    expect(screen.getByText('Excluir as 12 parcelas?')).toBeInTheDocument()
    expect(removeMany).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
    await waitFor(() => expect(removeMany).toHaveBeenCalledTimes(1))
    expect(removeMany.mock.calls[0][0]).toEqual(Array.from({ length: 12 }, (_, i) => `p${i + 1}`))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('cancelar volta ao resumo sem remover nada', () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Excluir todas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(removeMany).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Excluir todas' })).toBeInTheDocument()
  })
})

describe('InstallmentGroupDialog — excluir só as futuras', () => {
  it('conta a partir do relógio: em 10/11/2026 restam 9 futuras, da 4ª à 12ª', async () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Excluir só as futuras' }))
    expect(screen.getByText('Excluir as 9 parcelas futuras?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
    await waitFor(() => expect(removeMany).toHaveBeenCalledTimes(1))
    expect(removeMany.mock.calls[0][0]).toEqual(Array.from({ length: 9 }, (_, i) => `p${i + 4}`))
  })

  it('a parcela de hoje não conta como futura', () => {
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z')) // dia da 3ª parcela
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Excluir só as futuras' }))
    expect(screen.getByText('Excluir as 9 parcelas futuras?')).toBeInTheDocument()
  })

  it('sem parcelas futuras o botão fica desabilitado e explica o motivo', () => {
    vi.setSystemTime(new Date('2027-12-01T12:00:00Z'))
    abrir()
    expect(screen.getByRole('button', { name: 'Excluir só as futuras' })).toBeDisabled()
    expect(screen.getByText(/Nenhuma parcela futura/)).toBeInTheDocument()
  })
})

describe('InstallmentGroupDialog — editar todas', () => {
  const campo = (rotulo: string | RegExp) => screen.getByLabelText(rotulo)

  it('abre com os valores atuais preenchidos', () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Editar todas' }))
    expect(campo('Descrição')).toHaveValue('Nike')
    expect(campo(/^Valor total/)).toHaveValue('1200')
    expect(campo('Parcelas')).toHaveValue(12)
    expect(campo('Data da 1ª parcela')).toHaveValue('2026-09-05')
  })

  it('salvar chama updateGroup com o plano do novo rateio (1200 → 1500 = 12 × 125)', async () => {
    const onClose = abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Editar todas' }))
    fireEvent.change(campo(/^Valor total/), { target: { value: '1500' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(updateGroup).toHaveBeenCalledTimes(1))
    const plano = updateGroup.mock.calls[0][0]
    expect(plano.atualizar).toHaveLength(12)
    expect(plano.atualizar.every((a: { patch: { valor: number } }) => a.patch.valor === 125)).toBe(true)
    expect(plano.criar).toEqual([])
    expect(plano.remover).toEqual([])
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('aceita vírgula decimal e mais parcelas (cria as novas)', async () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Editar todas' }))
    fireEvent.change(campo('Parcelas'), { target: { value: '14' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() => expect(updateGroup).toHaveBeenCalled())
    expect(updateGroup.mock.calls[0][0].criar).toHaveLength(2)
  })

  it('número de parcelas fora de 2 a 60 mostra o aviso e não salva', () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Editar todas' }))
    for (const n of ['1', '61', '']) {
      fireEvent.change(campo('Parcelas'), { target: { value: n } })
      fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
      expect(screen.getByRole('alert')).toHaveTextContent('Informe de 2 a 60 parcelas.')
    }
    expect(updateGroup).not.toHaveBeenCalled()
  })

  it('total inválido mostra o aviso e não salva', () => {
    abrir()
    fireEvent.click(screen.getByRole('button', { name: 'Editar todas' }))
    fireEvent.change(campo(/^Valor total/), { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Confira o valor total')
    expect(updateGroup).not.toHaveBeenCalled()
  })
})
