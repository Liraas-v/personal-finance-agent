// lib/db.ts
import fs from 'fs'
import path from 'path'
import type { Transaction, Config } from '@/types'

export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data')

export const DEFAULT_CONFIG: Config = {
  metaEconomia: 0,
  limitesPorCategoria: {},
  ollama: { model: 'mistral', url: 'http://localhost:11434' },
  moeda: 'BRL',
}

function readJSON<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename)
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function writeJSON(filename: string, data: unknown): void {
  const filePath = path.join(DATA_DIR, filename)
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function readTransactions(): Transaction[] {
  return readJSON<Transaction[]>('transactions.json', [])
}

export function writeTransactions(transactions: Transaction[]): void {
  writeJSON('transactions.json', transactions)
}

export function readConfig(): Config {
  return readJSON<Config>('config.json', DEFAULT_CONFIG)
}

export function writeConfig(config: Config): void {
  writeJSON('config.json', config)
}
