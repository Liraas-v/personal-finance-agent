import { test as base, expect, type Page } from '@playwright/test'

// Relógio fixo: o seed da demo usa datas relativas a "hoje" e os testes não podem depender do dia real.
export const AGORA = new Date('2026-10-05T12:00:00-03:00')

export const INSIGHTS_SIMULADOS = [
  'Moradia domina os gastos.',
  'Alimentação passou do limite.',
  'Saldo positivo no período.',
]

export const test = base.extend<{ app: Page }>({
  app: async ({ page }, entregar) => {
    await page.clock.install({ time: AGORA })
    // IA sempre simulada: nenhum teste depende de chave, rede ou Ollama
    await page.route('**/api/ai/insights', (r) => r.fulfill({ json: { insights: INSIGHTS_SIMULADOS } }))
    await page.route('**/api/ai/chat', (r) => r.fulfill({ json: { reply: 'Resposta simulada do chat.' } }))
    await page.route('**/api/ai/analyze', (r) =>
      r.fulfill({ json: { categoria: 'Outros', descricao: 'x', pagamento: 'crédito', degraded: true } }),
    )
    await entregar(page)
  },
})

export { expect }
