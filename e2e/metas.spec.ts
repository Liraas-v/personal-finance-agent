import { test, expect } from './fixtures'
import { enviarLancamento, preencherLancamento } from './helpers'

test('limite por categoria: passa a "over" quando um gasto estoura o limite', async ({ app }) => {
  await app.goto('/metas')
  await app.getByRole('button', { name: 'Definir limite de Transporte' }).click()
  await app.getByLabel('Limite de Transporte').fill('1000')
  await app.getByRole('button', { name: 'OK' }).click()

  const linha = app.locator('li[data-categoria="Transporte"]')
  await expect(linha).toHaveAttribute('data-status', /^(ok|warning)$/)
  await expect(linha.getByRole('button', { name: 'Editar limite de Transporte' })).toBeVisible()

  await app.goto('/transacoes')
  await preencherLancamento(app, { descricao: 'Viagem de carro', valor: '800', categoria: 'Transporte', pagamento: 'pix' })
  await enviarLancamento(app)
  await expect(app.locator('div.group', { hasText: 'Viagem de carro' })).toHaveCount(1)

  await app.goto('/metas')
  await expect(app.locator('li[data-categoria="Transporte"]')).toHaveAttribute('data-status', 'over')
})
