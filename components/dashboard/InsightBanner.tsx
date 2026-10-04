'use client'
import { useEffect, useState } from 'react'
import { useInsights } from '@/hooks/useInsights'
import { motion, AnimatePresence } from 'framer-motion'

export function InsightBanner() {
  const { insights, generate, loading } = useInsights()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (insights.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % insights.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [insights.length])

  return (
    <section className="min-h-[100px] rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Resumo</p>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        ) : insights[current] ? (
          <motion.p
            key={insights[current].id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-sm text-foreground-secondary"
          >
            {insights[current].texto}
          </motion.p>
        ) : (
          <p className="text-sm text-muted-foreground">Adicione transações para gerar insights.</p>
        )}
      </AnimatePresence>
    </section>
  )
}
