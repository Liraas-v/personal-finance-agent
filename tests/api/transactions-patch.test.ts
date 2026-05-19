import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type { NextRequest } from 'next/server'
import type { Transaction } from '@/types'

const testDir = path.join(os.tmpdir(), `fa-test-patch-${Date.now()}`)
process.env.DATA_DIR = testDir

function makeRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('PATCH /api/transactions/[id]', () => {
  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  it('atualiza os campos informados e mantém o id', async () => {
    const { writeTransactions } = await import('@/lib/db')
    const { PATCH } = await import('@/app/api/transactions/[id]/route')

    writeTransactions([{ id: '1', descricao: 'iFood', valor: 42, categoria: 'Alimentação' } as unknown as Transaction])

    const res = await PATCH(makeRequest({ descricao: 'iFood editado' }), { params: Promise.resolve({ id: '1' }) })
    const body = await res.json()

    expect(body).toEqual({ id: '1', descricao: 'iFood editado', valor: 42, categoria: 'Alimentação' })
  })

  it('retorna 404 quando o id não existe', async () => {
    const { writeTransactions } = await import('@/lib/db')
    const { PATCH } = await import('@/app/api/transactions/[id]/route')

    writeTransactions([])

    const res = await PATCH(makeRequest({ descricao: 'x' }), { params: Promise.resolve({ id: 'inexistente' }) })
    expect(res.status).toBe(404)
  })
})
