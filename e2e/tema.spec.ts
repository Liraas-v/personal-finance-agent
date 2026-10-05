import { test, expect } from './fixtures'

test.use({ colorScheme: 'dark' })

test('tema: segue o sistema, troca para claro, persiste e volta ao sistema', async ({ app }) => {
  await app.goto('/dashboard')
  const html = app.locator('html')
  await expect(html).toHaveClass(/dark/)

  await app.getByRole('button', { name: 'Claro' }).click()
  await expect(html).not.toHaveClass(/dark/)

  await app.reload()
  await expect(html).not.toHaveClass(/dark/)
  await expect(app.getByRole('button', { name: 'Claro' })).toHaveAttribute('aria-pressed', 'true')

  await app.getByRole('button', { name: 'Sistema' }).click()
  await expect(html).toHaveClass(/dark/)
})
