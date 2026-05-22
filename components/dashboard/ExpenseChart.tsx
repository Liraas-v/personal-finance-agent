'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useFinanceStore } from '@/lib/store'
import type { Transaction } from '@/types'

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

interface MonthData {
  mes: string
  gastos: number
  receitas: number
}

function buildMonthlyData(transactions: Transaction[]): MonthData[] {
  const map: Record<string, MonthData> = {}

  transactions.forEach((t) => {
    const [year, month] = t.data.split('-')
    const key = `${year}-${month}`
    if (!map[key]) {
      map[key] = { mes: MONTH_NAMES[parseInt(month) - 1], gastos: 0, receitas: 0 }
    }
    if (t.tipo === 'gasto') map[key].gastos += t.valor
    else map[key].receitas += t.valor
  })

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f0f17] border border-[#1e1e2e] rounded-lg p-3 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: R$ {p.value.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export function ExpenseChart() {
  const transactions = useFinanceStore((s) => s.transactions)
  const data = buildMonthlyData(transactions)

  return (
    <div className="bg-[#0f0f17] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Gastos vs Receitas</h3>
      {data.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-slate-600 text-sm">
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
