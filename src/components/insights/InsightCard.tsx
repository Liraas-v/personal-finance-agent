'use client'
import { motion } from 'framer-motion'
import { Lightbulb, AlertTriangle, Trophy } from 'lucide-react'
import type { Insight } from '@/types'

const TIPO_CONFIG = {
  dica: { icon: <Lightbulb size={16} />, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  alerta: { icon: <AlertTriangle size={16} />, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  conquista: { icon: <Trophy size={16} />, color: 'text-positive', bg: 'bg-positive/10 border-positive/20' },
}

export function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const cfg = TIPO_CONFIG[insight.tipo]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`flex gap-3 p-4 rounded-lg border ${cfg.bg}`}
    >
      <span className={cfg.color}>{cfg.icon}</span>
      <p className="text-sm text-foreground leading-relaxed">{insight.texto}</p>
    </motion.div>
  )
}
