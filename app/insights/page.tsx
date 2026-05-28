'use client'
import { useEffect } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InsightCard } from '@/components/insights/InsightCard'
import { useInsights } from '@/hooks/useInsights'

export default function InsightsPage() {
  const { insights, loading, generate } = useInsights()

  useEffect(() => {
    generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-violet-400" />
          <h2 className="text-base font-semibold text-slate-200">Insights com IA</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="gap-1.5 text-xs border-[#2a2a3e] text-slate-400"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Gerando...' : 'Regenerar'}
        </Button>
      </div>

      {loading && insights.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#0f0f17] border border-[#1e1e2e] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && insights.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum dado para analisar ainda.</p>
          <p className="text-xs mt-1">Adicione transações e clique em Regenerar.</p>
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
