// hooks/useTransactions.ts
import { useCallback, useMemo } from 'react'
import { sortByDateDesc } from '@/lib/transactions'
import { toast } from 'sonner'
import { useFinanceStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { getTransactionRepository } from '@/lib/repositories'
import type { CreateTransactionInput } from '@/lib/repositories/types'
import type { Transaction } from '@/types'

const repository = getTransactionRepository()

export function useTransactions() {
  const { transactions, addTransaction, updateTransaction, removeTransaction, dateRange, config } = useFinanceStore(
    useShallow((s) => ({
      transactions: s.transactions,
      addTransaction: s.addTransaction,
      updateTransaction: s.updateTransaction,
      removeTransaction: s.removeTransaction,
      dateRange: s.dateRange,
      config: s.config,
    }))
  )

  // useMemo mantém a mesma referência entre renderizações (hooks que dependem da lista não recriam callbacks à toa)
  const filteredTransactions = useMemo(
    () =>
      sortByDateDesc(
        dateRange
          ? transactions.filter((t) => t.data >= dateRange.from && t.data <= dateRange.to)
          : transactions
      ),
    [transactions, dateRange]
  )

  const checkCategoryLimit = useCallback(
    (categoria: string, valorNovo: number) => {
      if (!config?.limitesPorCategoria) return
      const limite = config.limitesPorCategoria[categoria]
      if (!limite || limite <= 0) return

      const now = new Date()
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const gastoAntes = transactions
        .filter((t) => t.tipo === 'gasto' && t.categoria === categoria && t.data.startsWith(mes))
        .reduce((sum, t) => sum + t.valor, 0)

      const gastoDepois = gastoAntes + valorNovo
      const pctAntes = (gastoAntes / limite) * 100
      const pctDepois = (gastoDepois / limite) * 100

      if (pctDepois > 100 && pctAntes <= 100) {
        toast.error(
          `🚨 Limite de ${categoria} atingido! ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gastoDepois)} de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(limite)}`
        )
      } else if (pctDepois > 80 && pctAntes <= 80) {
        toast.warning(`⚠️ ${categoria} está em ${pctDepois.toFixed(0)}% do limite`)
      }
    },
    [config, transactions]
  )

  const create = useCallback(
    async (input: CreateTransactionInput) => {
      const optimistic = { ...input, id: `optimistic-${Date.now()}`, createdAt: new Date().toISOString() }
      addTransaction(optimistic)

      if (input.tipo === 'gasto') {
        checkCategoryLimit(input.categoria, input.valor)
      }

      try {
        const saved = await repository.create(input)
        removeTransaction(optimistic.id)
        addTransaction(saved)
        toast.success(`${input.tipo === 'gasto' ? '−' : '+'}R$ ${input.valor.toFixed(2)} registrado`)
      } catch {
        removeTransaction(optimistic.id)
        toast.error('Erro ao salvar transação')
      }
    },
    [addTransaction, removeTransaction, checkCategoryLimit]
  )

  // Lançamentos em lote (compra parcelada): salva em sequência, com um único aviso no final em vez de
  // um por parcela. Se alguma falhar, para e mantém as já salvas, avisando quantas entraram.
  const createMany = useCallback(
    async (inputs: CreateTransactionInput[]): Promise<Transaction[]> => {
      const saved: Transaction[] = []
      const mesAtual = new Date().toISOString().slice(0, 7)

      for (const input of inputs) {
        // O aviso de limite considera só o mês corrente: parcelas futuras ainda não pesam nele.
        if (input.tipo === 'gasto' && input.data.startsWith(mesAtual)) {
          checkCategoryLimit(input.categoria, input.valor)
        }
        try {
          const item = await repository.create(input)
          addTransaction(item)
          saved.push(item)
        } catch {
          toast.error(`Erro ao salvar: só ${saved.length} de ${inputs.length} parcelas foram registradas`)
          return saved
        }
      }

      if (saved.length > 0) {
        const total = saved.reduce((sum, t) => sum + t.valor, 0)
        toast.success(`${saved.length} parcelas registradas (total R$ ${total.toFixed(2)})`)
      }
      return saved
    },
    [addTransaction, checkCategoryLimit]
  )

  const update = useCallback(
    async (id: string, patch: Partial<CreateTransactionInput>) => {
      const previous = transactions.find((t) => t.id === id)
      if (!previous) return

      updateTransaction({ ...previous, ...patch })

      try {
        const saved = await repository.update(id, patch)
        updateTransaction(saved)
        toast.success('Transação atualizada')
      } catch {
        updateTransaction(previous)
        toast.error('Erro ao atualizar transação')
      }
    },
    [transactions, updateTransaction]
  )

  const remove = useCallback(
    async (id: string) => {
      removeTransaction(id)
      try {
        await repository.remove(id)
        toast.success('Transação removida')
      } catch {
        toast.error('Erro ao remover transação')
      }
    },
    [removeTransaction]
  )

  const gastos = filteredTransactions.filter((t) => t.tipo === 'gasto')
  const receitas = filteredTransactions.filter((t) => t.tipo === 'receita')
  const totalGastos = gastos.reduce((sum, t) => sum + t.valor, 0)
  const totalReceitas = receitas.reduce((sum, t) => sum + t.valor, 0)
  const saldo = totalReceitas - totalGastos

  const porCategoria = gastos.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] ?? 0) + t.valor
    return acc
  }, {})

  return {
    transactions: filteredTransactions,
    gastos,
    receitas,
    totalGastos,
    totalReceitas,
    saldo,
    porCategoria,
    create,
    createMany,
    update,
    remove,
  }
}
