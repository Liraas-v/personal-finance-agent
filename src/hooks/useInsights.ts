// hooks/useInsights.ts
import { useState, useCallback } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import type { Insight, TransactionSummary } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export type InsightsStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [status, setStatus] = useState<InsightsStatus>('idle')
  const [reason, setReason] = useState<string | undefined>()
  const { transactions, totalGastos, totalReceitas, saldo, porCategoria } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')

  const generate = useCallback(async () => {
    if (transactions.length === 0) {
      setInsights([])
      setStatus('idle')
      return
    }
    setStatus('loading')
    setReason(undefined)

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
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setReason(typeof body?.reason === 'string' ? body.reason : undefined)
        throw new Error(`HTTP ${res.status}`)
      }
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
      setStatus(texts.length > 0 ? 'ready' : 'empty')
    } catch {
      setInsights([])
      setStatus('error')
    }
  }, [transactions, totalGastos, totalReceitas, saldo, porCategoria, moeda])

  return { insights, status, reason, loading: status === 'loading', generate }
}
