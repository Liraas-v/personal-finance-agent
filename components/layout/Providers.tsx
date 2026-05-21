'use client'
import { useEffect } from 'react'
import { useFinanceStore } from '@/lib/store'
import { getTransactionRepository, getConfigRepository } from '@/lib/repositories'

const transactionRepository = getTransactionRepository()
const configRepository = getConfigRepository()

export function Providers({ children }: { children: React.ReactNode }) {
  const setTransactions = useFinanceStore((s) => s.setTransactions)
  const setConfig = useFinanceStore((s) => s.setConfig)

  useEffect(() => {
    transactionRepository
      .list()
      .then(setTransactions)
      .catch(() => setTransactions([]))

    configRepository
      .read()
      .then(setConfig)
      .catch(() => {})
  }, [setTransactions, setConfig])

  return <>{children}</>
}
