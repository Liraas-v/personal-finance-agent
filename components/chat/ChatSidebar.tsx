'use client'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'

export function ChatSidebar() {
  const { totalGastos, totalReceitas, saldo, porCategoria } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')

  const topCategorias = Object.entries(porCategoria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  const fmt = (v: number) => formatCurrency(v, moeda)

  return (
    <aside className="hidden sm:flex flex-col gap-3 w-[240px] shrink-0">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Resumo Financeiro
      </h3>

      <div className="space-y-2">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Gastos</div>
          <div className="text-base font-bold text-negative">{fmt(totalGastos)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Receitas</div>
          <div className="text-base font-bold text-positive">{fmt(totalReceitas)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Saldo</div>
          <div className={`text-base font-bold ${saldo >= 0 ? 'text-positive' : 'text-negative'}`}>
            {fmt(saldo)}
          </div>
        </div>
      </div>

      {topCategorias.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-3">Top categorias</div>
          <div className="space-y-2">
            {topCategorias.map(([cat, val]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-xs text-foreground-secondary truncate pr-2">{cat}</span>
                <span className="text-xs font-medium text-foreground-secondary shrink-0">{fmt(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
