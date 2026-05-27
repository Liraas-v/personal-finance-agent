'use client'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
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
    <div className="bg-gradient-to-br from-[#1e1230] to-[#0f0f17] border border-[#2d1b69] rounded-xl p-4 min-h-[100px] flex items-center gap-3">
      <div className="shrink-0">
        <Sparkles size={20} className={loading ? 'text-violet-500 animate-pulse' : 'text-violet-400'} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-violet-400 font-medium mb-1">Insight IA</p>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="h-4 bg-[#2d1b69]/40 rounded animate-pulse w-3/4" />
          ) : insights[current] ? (
            <motion.p
              key={insights[current].id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm text-slate-300"
            >
              {insights[current].texto}
            </motion.p>
          ) : (
            <p className="text-sm text-slate-600">Adicione transações para gerar insights.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
