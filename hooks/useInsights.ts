// hooks/useInsights.ts
import { useState, useCallback } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import type { Insight, TransactionSummary } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const { transactions, totalGastos, totalReceitas, saldo, porCategoria } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')

  const generate = useCallback(async () => {
    if (transactions.length === 0) return
    setLoading(true)

    const dates = transactions.map((t) => t.data).sort()
    const summary: TransactionSummary = {
      periodo: { from: dates[0], to: dates[dates.length - 1] },
      totalGastos,
      totalReceitas,
      saldo,
      porCategoria,
      moeda,
    }

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      })
      const data = await res.json()
      const texts: string[] = data.insights ?? []

      setInsights(
        texts.map((texto, i) => ({
          id: uuidv4(),
          texto,
          tipo: i === 0 ? 'dica' : i === 1 ? 'alerta' : 'conquista',
          generatedAt: new Date().toISOString(),
        }))
      )
    } catch {
      setInsights([{
        id: uuidv4(),
        texto: 'IA não está disponível no momento.',
        tipo: 'alerta',
        generatedAt: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }, [transactions, totalGastos, totalReceitas, saldo, porCategoria, moeda])

  return { insights, loading, generate }
}
