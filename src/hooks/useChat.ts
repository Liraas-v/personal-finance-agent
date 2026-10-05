import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import type { TransactionSummary } from '@/types'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [contextEnabled, setContextEnabled] = useState(true)
  const { transactions, totalGastos, totalReceitas, saldo, porCategoria } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')

  const toggleContext = useCallback(() => setContextEnabled((v) => !v), [])
  const clearChat = useCallback(() => setMessages([]), [])

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setLoading(true)

      let context: TransactionSummary | undefined
      if (contextEnabled && transactions.length > 0) {
        const dates = transactions.map((t) => t.data).sort()
        context = {
          periodo: { from: dates[0], to: dates[dates.length - 1] },
          totalGastos,
          totalReceitas,
          saldo,
          porCategoria,
          moeda,
        }
      }

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, context }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Erro ao contatar Ollama')
        }

        const data = await res.json()
        const assistantMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch (e) {
        const errMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: e instanceof Error ? e.message : 'Erro desconhecido.',
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setLoading(false)
      }
    },
    [contextEnabled, transactions, totalGastos, totalReceitas, saldo, porCategoria, moeda]
  )

  return { messages, loading, contextEnabled, toggleContext, sendMessage, clearChat }
}
