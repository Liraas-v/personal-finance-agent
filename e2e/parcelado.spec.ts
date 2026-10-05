import { test, expect } from './fixtures'
import { enviarLancamento, preencherLancamento } from './helpers'

test.beforeEach(async ({ app }) => {
  await app.goto('/transacoes')
})

test('1200 em 12x vira 12 parcelas mensais, da 1ª à última', async ({ app }) => {
  await preencherLancamento(app, {
    descricao: 'Tênis Nike',
    valor: '1200',
    pagamento: 'parcelado',
    parcelas: '12',
    data: '2026-10-05',
  })
  await expect(app.getByTestId('previa-parcelas')).toContainText(/12x de R\$\s*100,00/)
  await enviarLancamento(app)

  await app.getByPlaceholder('Buscar...').fill('Nike')
  await expect(app.locator('div.group')).toHaveCount(12)
  await expect(app.locator('div.group', { hasText: 'Tênis Nike (1/12)' })).toContainText('05/10/2026')
  await expect(app.locator('div.group', { hasText: 'Tênis Nike (12/12)' })).toContainText('05/09/2027')
})

test('100 em 3x deixa o centavo de arredondamento na última parcela', async ({ app }) => {
  await preencherLancamento(app, { descricao: 'Fone', valor: '100', pagamento: 'parcelado', parcelas: '3' })
  await expect(app.getByTestId('previa-parcelas')).toContainText(/última de R\$\s*33,34/)
})

test('número de parcelas fora do limite mostra o aviso e não lança nada', async ({ app }) => {
  await preencherLancamento(app, { descricao: 'Fone', valor: '100', pagamento: 'parcelado', parcelas: '1' })
  await enviarLancamento(app)
  await expect(app.getByText('Informe de 2 a 60 parcelas.')).toBeVisible()

  await app.getByPlaceholder('Buscar...').fill('Fone')
  await expect(app.getByText('(1/')).toHaveCount(0)
})
