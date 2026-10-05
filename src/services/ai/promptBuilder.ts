import type { TransactionSummary } from '@/types'

const LOCALE: Record<string, string> = { BRL: 'pt-BR', USD: 'en-US', EUR: 'de-DE' }

export function buildChatPrompt(message: string, context?: TransactionSummary): string {
  if (!context) {
    return `Você é um consultor financeiro pessoal. Responda em português de forma direta e útil:\n${message}`
  }

  const moeda = context.moeda ?? 'BRL'
  const fmt = (n: number) =>
    new Intl.NumberFormat(LOCALE[moeda] ?? 'pt-BR', { style: 'currency', currency: moeda }).format(n)
  const fmtCateg = (obj: Record<string, number>) =>
    Object.entries(obj).map(([k, v]) => `${k}: ${fmt(v)}`).join(', ')

  return `Você é um assistente financeiro pessoal. Dados do usuário:
- Total gastos: ${fmt(context.totalGastos)}
- Total receitas: ${fmt(context.totalReceitas)}
- Saldo: ${fmt(context.saldo)}
- Por categoria: ${fmtCateg(context.porCategoria)}
- Período: ${context.periodo.from} a ${context.periodo.to}

Com base nesses dados, responda em português de forma direta e útil. Use os valores exatamente como estão acima, sem converter ou reformatar:
${message}`
}
