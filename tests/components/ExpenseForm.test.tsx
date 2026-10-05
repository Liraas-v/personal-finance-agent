import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const create = vi.fn()
const createMany = vi.fn()
const update = vi.fn()
vi.mock('@/hooks/useTransactions', () => ({ useTransactions: () => ({ create, createMany, update }) }))

import { useFinanceStore } from '@/lib/store'
import { ExpenseForm } from '@/components/transactions/ExpenseForm'
import type { Transaction } from '@/types'

beforeEach(() => {
  create.mockReset().mockResolvedValue(undefined)
  createMany.mockReset().mockResolvedValue([])
  update.mockReset().mockResolvedValue(undefined)
  useFinanceStore.setState({ config: { moeda: 'BRL', metaEconomia: 0, limitesPorCategoria: {} } as never })
})

function preencher({ descricao = 'Nike', valor = '1200', pagamento = 'parcelado', parcelas, data }: {
  descricao?: string; valor?: string; pagamento?: string; parcelas?: string; data?: string
}) {
  fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: descricao } })
  fireEvent.change(screen.getByLabelText(/^Valor/), { target: { value: valor } })
  fireEvent.change(screen.getByLabelText('Pagamento'), { target: { value: pagamento } })
  if (parcelas !== undefined) fireEvent.change(screen.getByLabelText('Parcelas'), { target: { value: parcelas } })
  if (data) fireEvent.change(screen.getByLabelText(/^Data/), { target: { value: data } })
}

describe('ExpenseForm — pagamento parcelado', () => {
  it('sem parcelado não mostra o campo de parcelas e a data é "Data"', () => {
    render(<ExpenseForm />)
    expect(screen.queryByLabelText('Parcelas')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Data')).toBeInTheDocument()
  })

  it('ao escolher parcelado pede o nº de parcelas e a data da 1ª parcela, e o valor vira "total"', () => {
    render(<ExpenseForm />)
    fireEvent.change(screen.getByLabelText('Pagamento'), { target: { value: 'parcelado' } })
    expect(screen.getByLabelText('Parcelas')).toHaveValue(2)
    expect(screen.getByLabelText('Data da 1ª parcela')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor total (R$)')).toBeInTheDocument()
  })

  it('mostra a prévia "Nx de R$ ..." conforme valor e parcelas', () => {
    render(<ExpenseForm />)
    preencher({ valor: '4500', parcelas: '12' })
    expect(screen.getByTestId('previa-parcelas')).toHaveTextContent(/12x de R\$\s375,00/)
  })

  it('a prévia informa quando a última parcela difere por causa do centavo', () => {
    render(<ExpenseForm />)
    preencher({ valor: '100', parcelas: '3' })
    expect(screen.getByTestId('previa-parcelas')).toHaveTextContent(/3x de R\$\s33,33/)
    expect(screen.getByTestId('previa-parcelas')).toHaveTextContent(/última de R\$\s33,34/)
  })

  it('aceita vírgula decimal no valor total', () => {
    render(<ExpenseForm />)
    preencher({ valor: '99,90', parcelas: '3' })
    expect(screen.getByTestId('previa-parcelas')).toHaveTextContent(/3x de R\$\s33,30/)
  })

  it('ao enviar cria N lançamentos mensais de uma vez, a partir da data escolhida', async () => {
    render(<ExpenseForm />)
    preencher({ descricao: 'Nike', valor: '1200', parcelas: '12', data: '2026-10-05' })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))

    await waitFor(() => expect(createMany).toHaveBeenCalledTimes(1))
    expect(create).not.toHaveBeenCalled()
    const lote = createMany.mock.calls[0][0]
    expect(lote).toHaveLength(12)
    expect(lote[0]).toMatchObject({
      descricao: 'Nike (1/12)', valor: 100, data: '2026-10-05', pagamento: 'parcelado', parcelas: 12, tipo: 'gasto', origem: 'manual',
    })
    expect(lote[11]).toMatchObject({ descricao: 'Nike (12/12)', data: '2027-09-05' })
  })

  it('as parcelas do lote levam o mesmo grupo e dois envios geram grupos diferentes', async () => {
    render(<ExpenseForm />)
    preencher({ parcelas: '3' })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() => expect(createMany).toHaveBeenCalledTimes(1))
    const lote1 = createMany.mock.calls[0][0]
    const grupo1 = lote1[0].grupoParcelas
    expect(grupo1).toBeTruthy()
    expect(lote1.every((i: { grupoParcelas: string }) => i.grupoParcelas === grupo1)).toBe(true)

    await waitFor(() => expect(screen.getByLabelText('Descrição')).toHaveValue(''))
    preencher({ parcelas: '3' })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() => expect(createMany).toHaveBeenCalledTimes(2))
    expect(createMany.mock.calls[1][0][0].grupoParcelas).not.toBe(grupo1)
  })

  it('limpa descrição e valor depois de lançar', async () => {
    render(<ExpenseForm />)
    preencher({ parcelas: '3' })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() => expect(createMany).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByLabelText('Descrição')).toHaveValue(''))
    expect(screen.getByLabelText(/^Valor/)).toHaveValue('')
  })

  it('número de parcelas fora de 2 a 60 não lança e mostra o motivo', async () => {
    render(<ExpenseForm />)
    for (const ruim of ['1', '0', '61', '', '2.5']) {
      preencher({ parcelas: ruim })
      fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
      expect(await screen.findByRole('alert')).toHaveTextContent(/de 2 a 60 parcelas/)
    }
    expect(createMany).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it('outras formas de pagamento continuam criando um único lançamento', async () => {
    render(<ExpenseForm />)
    preencher({ descricao: 'Mercado', valor: '50', pagamento: 'pix' })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    expect(createMany).not.toHaveBeenCalled()
    expect(create.mock.calls[0][0]).toMatchObject({ descricao: 'Mercado', valor: 50, pagamento: 'pix' })
  })

  it('ao editar uma parcela não mostra o campo de parcelas e salva só aquele lançamento', async () => {
    const t: Transaction = {
      id: 't1', tipo: 'gasto', descricao: 'Nike (2/12)', valor: 100, categoria: 'Compras',
      pagamento: 'parcelado', parcelas: 12, data: '2026-11-05', origem: 'manual', createdAt: '',
    }
    render(<ExpenseForm transaction={t} />)
    expect(screen.queryByLabelText('Parcelas')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/^Valor/), { target: { value: '110' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1))
    expect(update.mock.calls[0][0]).toBe('t1')
    expect(update.mock.calls[0][1]).toMatchObject({ valor: 110, descricao: 'Nike (2/12)' })
    expect(createMany).not.toHaveBeenCalled()
  })
})
