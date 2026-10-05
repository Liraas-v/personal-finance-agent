'use client'
import type { InsightsStatus } from '@/hooks/useInsights'

interface Props {
  status: InsightsStatus
  hasTransactions: boolean
  onRetry: () => void
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

export function InsightsState({ status, hasTransactions, onRetry }: Props) {
  if (status === 'ready' || status === 'loading') return null

  if (!hasTransactions) {
    return <p className="text-sm text-muted-foreground">Adicione transações para gerar insights.</p>
  }

  if (status === 'error') return <Retry message="A IA não está disponível agora." onRetry={onRetry} />

  // Os providers de IA devolvem lista vazia quando falham: vazio e erro são indistinguíveis aqui.
  if (status === 'empty') return <Retry message="A IA não retornou insights desta vez." onRetry={onRetry} />

  // idle com transações: a geração começa em seguida
  return <p className="text-sm text-muted-foreground">Preparando insights…</p>
}
