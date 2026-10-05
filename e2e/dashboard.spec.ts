import { test, expect } from './fixtures'

test('dashboard mostra o saldo e as últimas transações', async ({ app }) => {
  await app.goto('/dashboard')
  await expect(app.getByText('Saldo do período')).toBeVisible()
  await expect(app.getByTestId('saldo')).toContainText('R$')
  const itens = app.getByRole('heading', { name: 'Últimas Transações' }).locator('..').getByRole('listitem')
  await expect(itens.first()).toBeVisible()
})
