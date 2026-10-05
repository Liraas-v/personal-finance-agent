import type { Transaction } from '@/types'
import type { TransactionRepository, CreateTransactionInput } from './types'

export class ApiTransactionRepository implements TransactionRepository {
  async list(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions')
    if (!res.ok) throw new Error('Failed to load transactions')
    return res.json()
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('Failed to create transaction')
    return res.json()
  }

  async update(id: string, patch: Partial<CreateTransactionInput>): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('Failed to update transaction')
    return res.json()
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to remove transaction')
  }

  async clear(): Promise<void> {
    const res = await fetch('/api/transactions', { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to clear transactions')
  }
}
