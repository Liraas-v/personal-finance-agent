// lib/store.ts
import { create } from 'zustand'
import type { Transaction, Config } from '@/types'

interface DateRange {
  from: string
  to: string
}

interface FinanceStore {
  transactions: Transaction[]
  config: Config | null
  dateRange: DateRange | null
  isLoading: boolean

  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (transaction: Transaction) => void
  removeTransaction: (id: string) => void
  clearTransactions: () => void
  setConfig: (config: Config) => void
  updateConfig: (partial: Partial<Config>) => void
  setDateRange: (range: DateRange | null) => void
  setLoading: (loading: boolean) => void
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: [],
  config: null,
  dateRange: null,
  isLoading: true,

  setTransactions: (transactions) => set({ transactions, isLoading: false }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateTransaction: (transaction) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === transaction.id ? transaction : t)),
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  clearTransactions: () => set({ transactions: [] }),
  setConfig: (config) => set({ config }),
  updateConfig: (partial) =>
    set((state) => ({
      config: state.config ? { ...state.config, ...partial } : null,
    })),
  setDateRange: (dateRange) => set({ dateRange }),
  setLoading: (isLoading) => set({ isLoading }),
}))
