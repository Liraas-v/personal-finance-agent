// lib/currency.ts
const LOCALE_MAP: Record<string, string> = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
}

export function formatCurrency(value: number, moeda: string): string {
  try {
    return new Intl.NumberFormat(LOCALE_MAP[moeda] ?? 'pt-BR', {
      style: 'currency',
      currency: moeda,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }
}
