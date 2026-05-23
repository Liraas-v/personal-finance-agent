'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTransactions } from '@/hooks/useTransactions'

const COLORS = ['#7c3aed','#4f46e5','#0ea5e9','#10b981','#f59e0b','#f43f5e','#ec4899','#8b5cf6','#64748b']

export function CategoryChart() {
  const { porCategoria } = useTransactions()

  const data = Object.entries(porCategoria)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="bg-[#0f0f17] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Por Categoria</h3>
      {data.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-slate-600 text-sm">
          Sem dados para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#0f0f17', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, '']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
