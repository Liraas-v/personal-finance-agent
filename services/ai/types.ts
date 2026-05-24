import type { TransactionSummary, ParsedTransaction } from '@/types'

export interface AIProvider {
  chat(prompt: string): Promise<string>
  analyzeExpense(text: string): Promise<ParsedTransaction>
  generateInsights(summary: TransactionSummary): Promise<string[]>
  status(): Promise<{ online: boolean; model: string; loaded?: boolean }>
  listModels(): Promise<string[]>
}
