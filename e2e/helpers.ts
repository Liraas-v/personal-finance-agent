import type { Page } from '@playwright/test'

interface Lancamento {
  descricao: string
  valor: string
  categoria?: string
  pagamento?: string
  data?: string
  parcelas?: string
}

// Preenche o formulário "Nova transação" da página /transacoes (sem enviar).
export async function preencherLancamento(page: Page, l: Lancamento) {
  await page.getByLabel('Descrição').fill(l.descricao)
  await page.getByLabel(/^Valor/).fill(l.valor)
  if (l.categoria) await page.getByLabel('Categoria').selectOption(l.categoria)
  if (l.pagamento) await page.getByLabel('Pagamento').selectOption(l.pagamento)
  if (l.data) await page.getByLabel(/^Data/).fill(l.data)
  if (l.parcelas) await page.getByLabel('Parcelas', { exact: true }).fill(l.parcelas)
}

export async function enviarLancamento(page: Page) {
  await page.getByRole('button', { name: 'Adicionar' }).click()
}
