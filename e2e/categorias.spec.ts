import { test, expect } from './fixtures'
import { enviarLancamento, preencherLancamento } from './helpers'

test('categoria personalizada: criar, usar, limitar, renomear e remover', async ({ app }) => {
  // criar em Configurações
  await app.goto('/settings')
  await app.getByRole('textbox', { name: 'Nova categoria' }).fill('Pets')
  await app.getByRole('button', { name: 'Adicionar' }).click()
  await expect(app.locator('li[data-categoria="Pets"]')).toBeVisible()

  // aparece no formulário e recebe um lançamento
  await app.goto('/transacoes')
  await expect(app.getByLabel('Categoria').locator('option', { hasText: 'Pets' })).toHaveCount(1)
  await preencherLancamento(app, { descricao: 'Ração', valor: '200', categoria: 'Pets', pagamento: 'pix' })
  await enviarLancamento(app)
  await expect(app.locator('div.group', { hasText: 'Ração' })).toHaveCount(1)

  // donut e legenda mostram "Pets" com a 9ª cor e um percentual
  await app.goto('/dashboard')
  const item = app.locator('li', { hasText: 'Pets' }).filter({ has: app.locator('[data-swatch]') })
  await expect(item).toBeVisible()
  await expect(item).toContainText(/\d+%|<1%/)
  const cor = await item.locator('[data-swatch]').getAttribute('data-color')
  const cat9 = await app.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cat-9').trim())
  expect(cor).toBe(cat9)

  // limite em Metas: 200 gastos contra 100 de limite
  await app.goto('/metas')
  await app.getByRole('button', { name: 'Definir limite de Pets' }).click()
  await app.getByLabel('Limite de Pets').fill('100')
  await app.getByRole('button', { name: 'OK' }).click()
  await expect(app.locator('li[data-categoria="Pets"]')).toHaveAttribute('data-status', 'over')

  // renomear: lançamento e limite acompanham
  await app.goto('/settings')
  await app.getByRole('button', { name: 'Renomear Pets' }).click()
  await app.getByRole('textbox', { name: 'Novo nome de Pets' }).fill('Animais')
  await app.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(app.locator('li[data-categoria="Animais"]')).toBeVisible()
  await expect(app.locator('li[data-categoria="Pets"]')).toHaveCount(0)

  await app.goto('/transacoes')
  await expect(app.locator('div.group', { hasText: 'Ração' })).toContainText('Animais')
  await app.goto('/metas')
  await expect(app.locator('li[data-categoria="Animais"]')).toHaveAttribute('data-status', 'over')

  // remover reatribuindo para "Outros"
  await app.goto('/settings')
  await app.getByRole('button', { name: 'Remover Animais' }).click()
  await expect(app.getByText(/1 lançamento será movido/)).toBeVisible()
  await app.getByRole('button', { name: 'Confirmar remoção' }).click()
  await expect(app.locator('li[data-categoria="Animais"]')).toHaveCount(0)

  await app.goto('/transacoes')
  await expect(app.locator('div.group', { hasText: 'Ração' })).toContainText('Outros')
})

test('nome duplicado é recusado com o motivo', async ({ app }) => {
  await app.goto('/settings')
  await app.getByRole('textbox', { name: 'Nova categoria' }).fill('saude')
  await app.getByRole('button', { name: 'Adicionar' }).click()
  await expect(app.getByRole('alert').filter({ hasText: 'Já existe uma categoria' })).toBeVisible()
})

test('configuração antiga, sem categorias, abre normalmente com as de hoje', async ({ app }) => {
  await app.addInitScript(() => {
    localStorage.setItem(
      'finance-agent:demo:config',
      JSON.stringify({ metaEconomia: 1000, limitesPorCategoria: { Lazer: 150 }, ollama: { model: 'm', url: 'u' }, moeda: 'BRL' }),
    )
  })
  await app.goto('/settings')
  await expect(app.locator('li[data-categoria]')).toHaveCount(9)
  await app.goto('/metas')
  await expect(app.locator('li[data-categoria="Lazer"]')).toContainText('150,00')
  await app.goto('/transacoes')
  await expect(app.getByLabel('Categoria').locator('option')).toHaveCount(9)
})
