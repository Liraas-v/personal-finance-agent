'use client'
import type { InsightsStatus } from '@/hooks/useInsights'
import { messageForReason } from '@/lib/aiMessages'

interface Props {
  status: InsightsStatus
  hasTransactions: boolean
  onRetry: () => void
  reason?: string
}

function Retry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-border-strong px-2 py-1 text-xs text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground"
      >
        Tentar de novo
      </button>
    </div>
  )
}

export function InsightsState({ status, hasTransactions, onRetry, reason }: Props) {
  if (status === 'ready' || status === 'loading') return null

  if (!hasTransactions) {
    return <p className="text-sm text-muted-foreground">Adicione transações para gerar insights.</p>
  }

  if (status === 'error') return <Retry message={messageForReason(reason)} onRetry={onRetry} />

  // Falha da IA chega como 'error'; 'empty' significa que a IA respondeu, sem itens.
  if (status === 'empty') return <p className="text-sm text-muted-foreground">Nenhum insight para este período.</p>

  // idle com transações: a geração começa em seguida
  return <p className="text-sm text-muted-foreground">Preparando insights…</p>
}
