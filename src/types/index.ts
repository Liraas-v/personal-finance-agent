export type TipoTransacao = 'gasto' | 'receita'
export type FormaPagamento = 'crédito' | 'débito' | 'pix' | 'dinheiro' | 'parcelado'
export type OrigemTransacao = 'voz' | 'manual' | 'ocr'

export interface Transaction {
  id: string
  tipo: TipoTransacao
  descricao: string
  valor: number
  categoria: string
  pagamento: FormaPagamento
  parcelas?: number
  /** Liga as parcelas de uma mesma compra. Ausente em lançamentos antigos e em compras à vista. */
  grupoParcelas?: string
  data: string
  origem: OrigemTransacao
  createdAt: string
}

export interface Config {
  metaEconomia: number
  limitesPorCategoria: Record<string, number>
  /** Categorias do usuário, sem "Outros" (implícito, sempre por último). Ausente ⇒ categorias padrão. */
  categorias?: string[]
  ollama: {
    model: string
    url: string
  }
  moeda: 'BRL' | 'USD' | 'EUR'
}

export interface ParsedVoice {
  descricao: string
  valor: number
  pagamento: FormaPagamento
  tipo: TipoTransacao
  parcelas?: number
}

export interface OcrResult {
  valor?: number
  estabelecimento?: string
  data?: string
}

export interface TransactionSummary {
  periodo: { from: string; to: string }
  totalGastos: number
  totalReceitas: number
  saldo: number
  porCategoria: Record<string, number>
  moeda: 'BRL' | 'USD' | 'EUR'
  comparacaoMesAnterior?: Record<string, number>
}

export interface Insight {
  id: string
  texto: string
  tipo: 'alerta' | 'dica' | 'conquista'
  generatedAt: string
}

export interface ParsedTransaction {
  categoria: string
  descricao: string
  pagamento: string
}
