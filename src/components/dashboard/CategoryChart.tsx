'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useTransactions } from '@/hooks/useTransactions'
import { useChartColors } from '@/hooks/useChartColors'
import { categoryColor } from '@/lib/chartColors'
import { getCategorias } from '@/lib/customCategories'
import { useFinanceStore } from '@/lib/store'

function formatPct(value: number, total: number): string {
  if (total <= 0) return '0%'
  const pct = (value / total) * 100
  return pct > 0 && pct < 1 ? '<1%' : `${Math.round(pct)}%`
}

export function CategoryChart() {
  const { porCategoria } = useTransactions()
  const colors = useChartColors()
  const categorias = getCategorias(useFinanceStore((s) => s.config))

  // A cor vem da posição da categoria na lista configurada, então o gráfico e a legenda concordam e
  // a cor de "Alimentação" é a mesma em qualquer tela, com 3 ou com 12 categorias à mostra.
  const data = Object.entries(porCategoria)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value, color: categoryColor(colors, name, categorias) }))
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Por Categoria</h3>
      {data.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
          Sem dados para exibir
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke={colors.surface}
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                itemStyle={{ color: colors.text }}
                formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>

          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-3">
            {data.map((d) => (
              <li key={d.name} className="flex items-center gap-2 text-foreground-secondary">
                <span
                  data-swatch
                  data-color={d.color}
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto font-mono tabular-nums text-muted-foreground">{formatPct(d.value, total)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
