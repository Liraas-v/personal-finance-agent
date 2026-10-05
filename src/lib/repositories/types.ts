import type { Transaction, Config, TipoTransacao, FormaPagamento, OrigemTransacao } from '@/types'

export interface CreateTransactionInput {
  tipo: TipoTransacao
  descricao: string
  valor: number
  categoria: string
  pagamento: FormaPagamento
  parcelas?: number
  grupoParcelas?: string
  data: string
  origem: OrigemTransacao
}

export interface TransactionRepository {
  list(): Promise<Transaction[]>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, patch: Partial<CreateTransactionInput>): Promise<Transaction>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}

export interface ConfigRepository {
  read(): Promise<Config>
  update(patch: Partial<Config>): Promise<Config>
}
