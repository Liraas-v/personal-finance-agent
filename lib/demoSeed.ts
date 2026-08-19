import type { Transaction, Config } from '@/types'

interface SeedItem {
  daysAgo: number
  tipo: Transaction['tipo']
  descricao: string
  valor: number
  categoria: string
  pagamento: Transaction['pagamento']
  origem: Transaction['origem']
  parcelas?: number
}

const SEED_ITEMS: SeedItem[] = [
  { daysAgo: 45, tipo: 'receita', descricao: 'Salário', valor: 6200, categoria: 'Outros', pagamento: 'pix', origem: 'manual' },
  { daysAgo: 44, tipo: 'gasto', descricao: 'Aluguel', valor: 1800, categoria: 'Moradia', pagamento: 'pix', origem: 'manual' },
  { daysAgo: 44, tipo: 'gasto', descricao: 'Condomínio', valor: 420, categoria: 'Moradia', pagamento: 'débito', origem: 'manual' },
  { daysAgo: 42, tipo: 'gasto', descricao: 'Supermercado Extra', valor: 385.5, categoria: 'Alimentação', pagamento: 'crédito', origem: 'ocr' },
  { daysAgo: 41, tipo: 'gasto', descricao: 'iFood', valor: 47.9, categoria: 'Alimentação', pagamento: 'pix', origem: 'voz' },
  { daysAgo: 40, tipo: 'gasto', descricao: 'Uber', valor: 23.4, categoria: 'Transporte', pagamento: 'crédito', origem: 'voz' },
  { daysAgo: 40, tipo: 'gasto', descricao: 'Netflix', valor: 44.9, categoria: 'Assinaturas', pagamento: 'crédito', origem: 'manual' },
  { daysAgo: 40, tipo: 'gasto', descricao: 'Spotify', valor: 21.9, categoria: 'Assinaturas', pagamento: 'crédito', origem: 'manual' },
  { daysAgo: 38, tipo: 'gasto', descricao: 'Farmácia — remédio', valor: 68.3, categoria: 'Saúde', pagamento: 'débito', origem: 'ocr' },
  { daysAgo: 37, tipo: 'gasto', descricao: 'Cinema', valor: 64, categoria: 'Lazer', pagamento: 'crédito', origem: 'manual' },
  { daysAgo: 36, tipo: 'gasto', descricao: 'Posto de gasolina', valor: 180, categoria: 'Transporte', pagamento: 'crédito', origem: 'manual' },
  { daysAgo: 35, tipo: 'gasto', descricao: 'Curso Alura', valor: 89.9, categoria: 'Educação', pagamento: 'crédito', origem: 'manual' },
  { daysAgo: 34, tipo: 'gasto', descricao: 'Mercado Livre — fone de ouvido', valor: 219, categoria: 'Compras', pagamento: 'parcelado', origem: 'manual', parcelas: 3 },
  { daysAgo: 32, tipo: 'gasto', descricao: 'Restaurante', valor: 96, categoria: 'Alimentação', pagamento: 'crédito', origem: 'voz' },
  { daysAgo: 31, tipo: 'gasto', descricao: '99', valor: 18.6, categoria: 'Transporte', pagamento: 'pix', origem: 'voz' },
  { daysAgo: 30, tipo: 'receita', descricao: 'Freelance', valor: 850, categoria: 'Outros', pagamento: 'pix', origem: 'manual' },
  { daysAgo: 28, tipo: 'gasto', descricao: 'Plano de saúde', valor: 340, categoria: 'Saúde', pagamento: 'débito', origem: 'manual' },
  { daysAgo: 27, tipo: 'gasto', descricao: 'Padaria', valor: 32.5, categoria: 'Alimentação', pagamento: 'dinheiro', origem: 'manual' },
  { daysAgo: 25, tipo: 'gasto', descricao: 'Internet', valor: 99.9, categoria: 'Moradia', pagamento: 'débito', origem: 'manual' },
  { daysAgo: 24, tipo: 'gasto', descricao: 'Energia elétrica', valor: 210, categoria: 'Moradia', pagamento: 'débito', origem: 'ocr' },
  { daysAgo: 22, tipo: 'gasto', descricao: 'Shopee — capinha de celular', valor: 34.9, categoria: 'Compras', pagamento: 'crédito', origem: 'manual' },
  { daysAgo: 15, tipo: 'receita', descricao: 'Salário', valor: 6200, categoria: 'Outros', pagamento: 'pix', origem: 'manual' },
  { daysAgo: 14, tipo: 'gasto', descricao: 'Aluguel', valor: 1800, categoria: 'Moradia', pagamento: 'pix', origem: 'manual' },
  { daysAgo: 13, tipo: 'gasto', descricao: 'Supermercado', valor: 410.2, categoria: 'Alimentação', pagamento: 'crédito', origem: 'ocr' },
  { daysAgo: 11, tipo: 'gasto', descricao: 'Uber Eats', valor: 52.3, categoria: 'Alimentação', pagamento: 'pix', origem: 'voz' },
  { daysAgo: 10, tipo: 'gasto', descricao: 'Academia', valor: 120, categoria: 'Saúde', pagamento: 'débito', origem: 'manual' },
  { daysAgo: 8, tipo: 'gasto', descricao: 'Ingresso show', valor: 180, categoria: 'Lazer', pagamento: 'crédito', origem: 'manual' },
  { daysAgo: 4, tipo: 'gasto', descricao: 'Uber', valor: 27.8, categoria: 'Transporte', pagamento: 'crédito', origem: 'voz' },
]

function toDateString(daysAgo: number, reference: Date): string {
  const d = new Date(reference)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

export function buildDemoTransactions(reference: Date = new Date()): Transaction[] {
  return SEED_ITEMS.map((item, index) => {
    const data = toDateString(item.daysAgo, reference)
    return {
      id: `demo-${index + 1}`,
      tipo: item.tipo,
      descricao: item.descricao,
      valor: item.valor,
      categoria: item.categoria,
      pagamento: item.pagamento,
      parcelas: item.parcelas,
      data,
      origem: item.origem,
      createdAt: `${data}T12:00:00.000Z`,
    }
  })
}

export const demoConfig: Config = {
  metaEconomia: 1500,
  limitesPorCategoria: {
    Alimentação: 900,
    Lazer: 220,
    Compras: 300,
  },
  ollama: { model: 'tinyllama', url: 'http://localhost:11434' },
  moeda: 'BRL',
}
