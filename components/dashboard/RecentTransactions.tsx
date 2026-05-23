'use client'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'

export function RecentTransactions() {
  const { transactions } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')
  const recent = transactions.slice(0, 6)

  return (
    <div className="bg-[#0f0f17] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Últimas Transações</h3>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-600 py-4 text-center">Nenhuma transação ainda</p>
      ) : (
        <div className="space-y-3">
          {recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">{t.descricao}</p>
                <p className="text-xs text-slate-600">{t.categoria} · {t.origem}</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${
                t.tipo === 'gasto' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {t.tipo === 'gasto' ? '−' : '+'}{formatCurrency(t.valor, moeda)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
