import { test, expect } from './fixtures'

test('barra inferior: 4 abas + Mais, e o painel Mais leva às configurações', async ({ app }) => {
  await app.goto('/dashboard')
  const barra = app.locator('nav').filter({ has: app.getByRole('button', { name: 'Mais' }) })
  await expect(barra.getByRole('link')).toHaveCount(4)
  for (const nome of ['Dashboard', 'Transações', 'Metas', 'Chat']) {
    await expect(barra.getByRole('link', { name: nome })).toBeVisible()
  }

  await barra.getByRole('button', { name: 'Mais' }).click()
  const painel = app.getByRole('dialog')
  for (const nome of ['Insights', 'OCR', 'Configurações']) {
    await expect(painel.getByRole('link', { name: nome })).toBeVisible()
  }
  await expect(painel.getByRole('group', { name: 'Tema' })).toBeVisible()

  await painel.getByRole('link', { name: 'Configurações' }).click()
  await expect(app).toHaveURL(/\/settings$/)
})
