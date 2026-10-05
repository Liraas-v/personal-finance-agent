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
import { useChartColors } from '@/hooks/useChartColors'
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
    <div className="rounded-lg border border-border bg-card p-3 text-xs">
      <p className="mb-1 text-muted-foreground">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono tabular-nums text-foreground-secondary">
          <span
            aria-hidden
            className="mr-1.5 inline-block h-2 w-2 rounded-sm align-middle"
            style={{ background: p.fill }}
          />
          {p.name}: R$ {p.value.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export function ExpenseChart() {
  const transactions = useFinanceStore((s) => s.transactions)
  const colors = useChartColors()
  const data = buildMonthlyData(transactions)

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Gastos vs Receitas</h3>
      {data.length === 0 ? (
        <div className="flex min-h-[180px] flex-1 items-center justify-center text-sm text-muted-foreground">
          Sem dados para exibir
        </div>
      ) : (
        <>
        <ul className="mb-3 flex gap-4 text-xs text-foreground-secondary">
          {[
            { label: 'Gastos', color: colors.neutral },
            { label: 'Receitas', color: colors.primary },
          ].map(({ label, color }) => (
            <li key={label} className="flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-sm" style={{ background: color }} />
              {label}
            </li>
          ))}
        </ul>
        <div className="min-h-[180px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: colors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: colors.axis, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.grid, opacity: 0.4 }} />
            <Bar dataKey="gastos" name="Gastos" fill={colors.neutral} radius={[3, 3, 0, 0]} />
            <Bar dataKey="receitas" name="Receitas" fill={colors.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
        </>
      )}
    </div>
  )
}
