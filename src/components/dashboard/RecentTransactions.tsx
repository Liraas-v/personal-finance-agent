'use client'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'

export function RecentTransactions() {
  const { transactions } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')
  const recent = transactions.slice(0, 6)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Últimas Transações</h3>
      {recent.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma transação ainda</p>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm text-foreground">{t.descricao}</p>
                <p className="text-xs text-muted-foreground">{t.categoria} · {t.origem}</p>
              </div>
              <span className={`font-mono text-sm font-medium tabular-nums ${
                t.tipo === 'gasto' ? 'text-negative' : 'text-positive'
              }`}>
                {t.tipo === 'gasto' ? '−' : '+'}{formatCurrency(t.valor, moeda)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
