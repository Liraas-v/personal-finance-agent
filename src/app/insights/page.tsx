'use client'
import { useEffect } from 'react'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InsightCard } from '@/components/insights/InsightCard'
import { InsightsState } from '@/components/insights/InsightsState'
import { useInsights } from '@/hooks/useInsights'
import { useFinanceStore } from '@/lib/store'

export default function InsightsPage() {
  const { insights, loading, status, reason, generate } = useInsights()
  const hasTransactions = useFinanceStore((s) => s.transactions.length > 0)

  // As transações chegam de forma assíncrona: gerar só quando existirem (e de novo se passarem a existir).
  useEffect(() => {
    if (hasTransactions) generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTransactions])

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Insights</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="gap-1.5 text-xs border-border-strong text-foreground-secondary"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Gerando...' : 'Regenerar'}
        </Button>
      </div>

      {loading && insights.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && insights.length === 0 && (
        <div className="py-16 text-center">
          <Lightbulb size={32} className="mx-auto mb-3 text-muted-foreground opacity-30" />
          <div className="flex justify-center">
            <InsightsState status={status} hasTransactions={hasTransactions} onRetry={generate} reason={reason} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} index={i} />
        ))}
      </div>
    </div>
  )
}
