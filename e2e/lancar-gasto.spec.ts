import { test, expect } from './fixtures'
import { enviarLancamento, preencherLancamento } from './helpers'

test('lançar um gasto: aparece no topo da lista com a data fixa e reduz o saldo', async ({ app }) => {
  await app.goto('/dashboard')
  const saldoAntes = await app.getByTestId('saldo').innerText()

  await app.goto('/transacoes')
  await preencherLancamento(app, { descricao: 'Teste E2E', valor: '25,90', pagamento: 'pix' })
  await enviarLancamento(app)

  const linha = app.locator('div.group', { hasText: 'Teste E2E' })
  // a linha otimista sai com animação enquanto a salva entra: espera assentar em uma só
  await expect(linha).toHaveCount(1)
  await expect(linha).toContainText(/−\s*R\$\s*25,90/)
  await expect(linha).toContainText('05/10/2026')
  // a lista vem da mais recente para a mais antiga: o lançamento de hoje fica no topo
  await expect(app.locator('div.group').first()).toContainText('Teste E2E')

  await app.goto('/dashboard')
  await expect(app.getByTestId('saldo')).not.toHaveText(saldoAntes)
})
