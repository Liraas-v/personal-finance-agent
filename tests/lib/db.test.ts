// tests/lib/db.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type { Transaction } from '@/types'

// Point DATA_DIR to a temp directory for isolation
const testDir = path.join(os.tmpdir(), `fa-test-${Date.now()}`)
process.env.DATA_DIR = testDir

describe('DB layer', () => {
  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  it('readTransactions returns [] when file does not exist', async () => {
    const { readTransactions } = await import('@/lib/db')
    expect(readTransactions()).toEqual([])
  })

  it('writeTransactions + readTransactions round-trips data', async () => {
    const { readTransactions, writeTransactions } = await import('@/lib/db')
    const tx = [{ id: '1', descricao: 'iFood', valor: 42 }] as unknown as Transaction[]
    writeTransactions(tx)
    expect(readTransactions()).toEqual(tx)
  })

  it('readConfig returns DEFAULT_CONFIG when file does not exist', async () => {
    const { readConfig, DEFAULT_CONFIG } = await import('@/lib/db')
    expect(readConfig()).toEqual(DEFAULT_CONFIG)
  })

  it('writeConfig + readConfig round-trips data', async () => {
    const { readConfig, writeConfig, DEFAULT_CONFIG } = await import('@/lib/db')
    const cfg = { ...DEFAULT_CONFIG, metaEconomia: 1500 }
    writeConfig(cfg)
    expect(readConfig()).toEqual(cfg)
  })
})
