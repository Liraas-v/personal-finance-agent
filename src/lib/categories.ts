// lib/categories.ts
const CATEGORY_MAP: Record<string, string> = {
  'amazon prime': 'Assinaturas',
  'uber eats': 'Alimentação',
  'mercado livre': 'Compras',
  'plano de saude': 'Saúde',
  ifood: 'Alimentação',
  rappi: 'Alimentação',
  mcdonalds: 'Alimentação',
  'burger king': 'Alimentação',
  restaurante: 'Alimentação',
  padaria: 'Alimentação',
  supermercado: 'Alimentação',
  mercado: 'Alimentação',
  feira: 'Alimentação',
  uber: 'Transporte',
  '99': 'Transporte',
  taxi: 'Transporte',
  onibus: 'Transporte',
  metro: 'Transporte',
  gasolina: 'Transporte',
  combustivel: 'Transporte',
  estacionamento: 'Transporte',
  farmacia: 'Saúde',
  'farmácia': 'Saúde',
  remedio: 'Saúde',
  'remédio': 'Saúde',
  'médico': 'Saúde',
  medico: 'Saúde',
  hospital: 'Saúde',
  dentista: 'Saúde',
  spotify: 'Assinaturas',
  netflix: 'Assinaturas',
  disney: 'Assinaturas',
  youtube: 'Assinaturas',
  apple: 'Assinaturas',
  deezer: 'Assinaturas',
  nike: 'Compras',
  adidas: 'Compras',
  zara: 'Compras',
  amazon: 'Compras',
  shopee: 'Compras',
  loja: 'Compras',
  aluguel: 'Moradia',
  'condomínio': 'Moradia',
  condôminio: 'Moradia',
  energia: 'Moradia',
  internet: 'Moradia',
  curso: 'Educação',
  faculdade: 'Educação',
  udemy: 'Educação',
  alura: 'Educação',
  livro: 'Educação',
  cinema: 'Lazer',
  teatro: 'Lazer',
  viagem: 'Lazer',
  hotel: 'Lazer',
  ingresso: 'Lazer',
}

// Sort by key length descending so multi-word keywords match before single words
const SORTED_ENTRIES = Object.entries(CATEGORY_MAP).sort(([a], [b]) => b.length - a.length)

export function categorizeByKeyword(text: string): string {
  const lower = text.toLowerCase()
  for (const [keyword, category] of SORTED_ENTRIES) {
    if (lower.includes(keyword)) return category
  }
  return 'Outros'
}

export const ALL_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Assinaturas',
  'Compras',
  'Moradia',
  'Educação',
  'Lazer',
  'Outros',
]
