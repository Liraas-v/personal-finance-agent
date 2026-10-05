export type LimitStatus = 'none' | 'ok' | 'warning' | 'over'

// Mesmos limiares dos avisos de useTransactions (estritamente acima de 80% e de 100%).
export function limitStatus(spent: number, limit: number): { status: LimitStatus; pct: number } {
  if (!(limit > 0)) return { status: 'none', pct: 0 }
  const raw = (Math.max(0, spent) / limit) * 100
  const status: LimitStatus = raw > 100 ? 'over' : raw > 80 ? 'warning' : 'ok'
  return { status, pct: Math.min(100, raw) }
}
