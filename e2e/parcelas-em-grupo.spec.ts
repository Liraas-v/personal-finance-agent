import { test, expect } from './fixtures'
import { enviarLancamento, preencherLancamento } from './helpers'

async function lancarNike(app: import('@playwright/test').Page) {
  await app.goto('/transacoes')
  await preencherLancamento(app, {
    descricao: 'Tênis Nike',
    valor: '1200',
    pagamento: 'parcelado',
    parcelas: '12',
    data: '2026-10-05',
  })
  await enviarLancamento(app)
  await app.getByPlaceholder('Buscar...').fill('Nike')
  await expect(app.locator('div.group')).toHaveCount(12)
}

test('excluir só as futuras: com o relógio em 05/10/2026 sobra a parcela de hoje', async ({ app }) => {
  await lancarNike(app)
  await app.getByRole('button', { name: 'Gerenciar parcelas de Tênis Nike (1/12)' }).click()

  const dialogo = app.getByRole('dialog', { name: 'Parcelas de Tênis Nike' })
  await expect(dialogo.getByRole('listitem')).toHaveCount(12)
  await dialogo.getByRole('button', { name: 'Excluir só as futuras' }).click()
  await expect(dialogo.getByText('Excluir as 11 parcelas futuras?')).toBeVisible()
  await dialogo.getByRole('button', { name: 'Confirmar exclusão' }).click()

  await expect(dialogo).toBeHidden()
  await expect(app.locator('div.group')).toHaveCount(1)
  await expect(app.locator('div.group')).toContainText('Tênis Nike (1/12)')
})

test('editar todas: total de 1200 para 1500 deixa as 12 parcelas em R$ 125,00', async ({ app }) => {
  await lancarNike(app)
  await app.getByRole('button', { name: 'Gerenciar parcelas de Tênis Nike (1/12)' }).click()

  const dialogo = app.getByRole('dialog', { name: 'Parcelas de Tênis Nike' })
  await dialogo.getByRole('button', { name: 'Editar todas' }).click()
  await dialogo.getByLabel(/^Valor total/).fill('1500')
  await dialogo.getByRole('button', { name: 'Salvar alterações' }).click()

  await expect(dialogo).toBeHidden()
  await expect(app.locator('div.group').filter({ hasText: /125,00/ })).toHaveCount(12)
  await expect(app.locator('div.group')).toHaveCount(12)
})

test('dado antigo, sem grupo, não mostra o botão de parcelas', async ({ app }) => {
  await app.addInitScript(() => {
    localStorage.setItem(
      'finance-agent:demo:transactions',
      JSON.stringify([
        {
          id: 'antigo-1', tipo: 'gasto', descricao: 'Fone antigo (1/3)', valor: 50, categoria: 'Compras',
          pagamento: 'parcelado', parcelas: 3, data: '2026-10-01', origem: 'manual', createdAt: '2026-10-01T00:00:00.000Z',
        },
      ]),
    )
  })
  await app.goto('/transacoes')
  await expect(app.locator('div.group').filter({ hasText: 'Fone antigo (1/3)' })).toBeVisible()
  await expect(app.getByRole('button', { name: /Gerenciar parcelas/ })).toHaveCount(0)
})
