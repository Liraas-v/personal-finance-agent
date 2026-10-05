import { test, expect, INSIGHTS_SIMULADOS } from './fixtures'

test('chat: clicar numa sugestão mostra a resposta da IA', async ({ app }) => {
  await app.goto('/chat')
  await app.getByRole('button', { name: 'Onde posso economizar?' }).click()
  await expect(app.getByText('Onde posso economizar?').first()).toBeVisible()
  await expect(app.getByText('Resposta simulada do chat.')).toBeVisible()
})

test('insights: mostra os cards devolvidos pela IA', async ({ app }) => {
  await app.goto('/insights')
  for (const texto of INSIGHTS_SIMULADOS) {
    await expect(app.getByText(texto)).toBeVisible()
  }
})

test('insights: falha da IA mostra a causa e "Tentar de novo" recupera', async ({ app }) => {
  await app.route('**/api/ai/insights', (r) =>
    r.fulfill({ status: 503, json: { error: 'x', reason: 'missing_key' } }),
  )
  await app.goto('/insights')
  await expect(app.getByText('A chave da IA não está configurada neste ambiente.')).toBeVisible()

  // a rota registrada por último vale: a IA "volta"
  await app.route('**/api/ai/insights', (r) => r.fulfill({ json: { insights: INSIGHTS_SIMULADOS } }))
  await app.getByRole('button', { name: 'Tentar de novo' }).click()
  await expect(app.getByText(INSIGHTS_SIMULADOS[0])).toBeVisible()
  await expect(app.getByText('A chave da IA não está configurada neste ambiente.')).toHaveCount(0)
})
