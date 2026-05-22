'use client'
import { TrendingDown, TrendingUp, Wallet, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'

interface CardProps {
  title: string
  value: string
  sub: string
  icon: React.ReactNode
  color: string
  delay: number
}

function StatCard({ title, value, sub, icon, color, delay }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-[#0f0f17] border border-[#1e1e2e] rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </motion.div>
  )
}

export function DashboardCards() {
  const { totalGastos, totalReceitas, saldo, receitas } = useTransactions()
  const config = useFinanceStore((s) => s.config)
  const moeda = config?.moeda ?? 'BRL'

  const metaEconomia = config?.metaEconomia ?? 0
  const metaPct = metaEconomia > 0 ? Math.min(100, (saldo / metaEconomia) * 100) : 0

  const fmt = (v: number) => formatCurrency(v, moeda)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        title="Saldo do Mês"
        value={fmt(saldo)}
        sub="receitas − gastos"
        icon={<Wallet size={14} className="text-emerald-400" />}
        color="bg-emerald-500/10"
        delay={0}
      />
      <StatCard
        title="Total Gastos"
        value={fmt(totalGastos)}
        sub={totalGastos > 0 ? `${((totalGastos / (totalReceitas || 1)) * 100).toFixed(0)}% da receita` : 'Nenhum gasto'}
        icon={<TrendingDown size={14} className="text-rose-400" />}
        color="bg-rose-500/10"
        delay={0.05}
      />
      <StatCard
        title="Receitas"
        value={fmt(totalReceitas)}
        sub={`${receitas.length} entrada${receitas.length !== 1 ? 's' : ''}`}
        icon={<TrendingUp size={14} className="text-sky-400" />}
        color="bg-sky-500/10"
        delay={0.1}
      />
      <StatCard
        title="Meta Economia"
        value={`${metaPct.toFixed(0)}%`}
        sub={metaEconomia > 0 ? `${fmt(saldo)} / ${fmt(metaEconomia)}` : 'Defina uma meta'}
        icon={<Target size={14} className="text-violet-400" />}
        color="bg-violet-500/10"
        delay={0.15}
      />
    </div>
  )
}
