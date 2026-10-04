'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTransactions } from '@/hooks/useTransactions'
import { useChartColors } from '@/hooks/useChartColors'
import { categoryColor, groupTopCategories } from '@/lib/chartColors'

export function CategoryChart() {
  const { porCategoria } = useTransactions()
  const colors = useChartColors()

  const data = groupTopCategories(
    Object.entries(porCategoria).map(([name, value]) => ({ name, value })),
    colors.categories.length,
  )

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Por Categoria</h3>
      {data.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke={colors.surface}
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={categoryColor(colors, i)} />
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
            <Legend
              iconType="square"
              iconSize={8}
              formatter={(v) => <span style={{ fontSize: 12, color: colors.text }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
