'use client'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'

export function BalanceSummary() {
  const { totalGastos, totalReceitas, saldo } = useTransactions()
  const config = useFinanceStore((s) => s.config)
  const moeda = config?.moeda ?? 'BRL'
  const meta = config?.metaEconomia ?? 0

  const metaPct = meta > 0 ? Math.max(0, Math.min(100, (saldo / meta) * 100)) : 0
  const gastoPct = totalReceitas > 0 ? Math.round((totalGastos / totalReceitas) * 100) : null
  const fmt = (v: number) => formatCurrency(v, moeda)

  return (
    <section aria-label="Resumo do período" className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <p className="text-sm text-muted-foreground">Saldo do período</p>
      <p
        data-testid="saldo"
        className={`mt-1 font-mono text-3xl sm:text-5xl font-semibold tabular-nums tracking-tight ${
          saldo < 0 ? 'text-negative' : 'text-foreground'
        }`}
      >
        {fmt(saldo)}
      </p>

      <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Receitas</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-positive">{fmt(totalReceitas)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Gastos</dt>
          <dd className="mt-0.5 text-sm">
            <span className="font-mono tabular-nums text-negative">{fmt(totalGastos)}</span>{' '}
            <span className="text-muted-foreground">
              {totalGastos === 0 ? 'Nenhum gasto' : gastoPct !== null ? `· ${gastoPct}% da receita` : ''}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Meta de economia</dt>
          <dd className="mt-0.5 text-sm text-foreground-secondary">
            {meta > 0 ? (
              <>
                <span className="font-mono tabular-nums">{metaPct.toFixed(0)}%</span>
                <span className="text-muted-foreground"> · {fmt(saldo)} / {fmt(meta)}</span>
              </>
            ) : (
              'Defina uma meta'
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}
