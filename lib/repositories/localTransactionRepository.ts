import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import type { Transaction } from '@/types'
import type { TransactionRepository, CreateTransactionInput } from './types'
import { buildDemoTransactions } from '@/lib/demoSeed'

const STORAGE_KEY = 'finance-agent:demo:transactions'
let memoryFallback: Transaction[] | null = null

function readAll(): Transaction[] {
  if (typeof window === 'undefined') return []
  if (memoryFallback !== null) return memoryFallback

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    const seeded = buildDemoTransactions()
    writeAll(seeded)
    return seeded
  }
  try {
    return JSON.parse(raw) as Transaction[]
  } catch {
    return []
  }
}

function writeAll(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    memoryFallback = null
  } catch {
    memoryFallback = transactions
    toast.error('Não foi possível salvar no navegador — os dados vão se perder ao recarregar a página.')
  }
}

export class LocalTransactionRepository implements TransactionRepository {
  async list(): Promise<Transaction[]> {
    return readAll()
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const transaction: Transaction = { ...input, id: uuidv4(), createdAt: new Date().toISOString() }
    writeAll([transaction, ...readAll()])
    return transaction
  }

  async update(id: string, patch: Partial<CreateTransactionInput>): Promise<Transaction> {
    const transactions = readAll()
    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Transaction not found')

    const updated = { ...transactions[index], ...patch }
    transactions[index] = updated
    writeAll(transactions)
    return updated
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((t) => t.id !== id))
  }

  async clear(): Promise<void> {
    writeAll([])
  }
}
