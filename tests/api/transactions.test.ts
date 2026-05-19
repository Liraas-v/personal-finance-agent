import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type { NextRequest } from 'next/server'

const testDir = path.join(os.tmpdir(), `fa-test-transactions-${Date.now()}`)
process.env.DATA_DIR = testDir

function makeGetRequest(url: string): NextRequest {
  return { nextUrl: new URL(url) } as unknown as NextRequest
}

function makePostRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('/api/transactions', () => {
  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  it('GET retorna [] quando não há transações', async () => {
    const { GET } = await import('@/app/api/transactions/route')
    const res = await GET(makeGetRequest('http://localhost/api/transactions'))
    expect(await res.json()).toEqual([])
  })

  it('POST cria uma transação com id e createdAt gerados', async () => {
    const { POST } = await import('@/app/api/transactions/route')
    const res = await POST(makePostRequest({
      tipo: 'gasto', descricao: 'iFood', valor: 42, categoria: 'Alimentação',
      pagamento: 'pix', data: '2026-08-01', origem: 'manual',
    }))

    expect(res.status).toBe(201)
    const created = await res.json()
    expect(created.id).toBeTruthy()
    expect(created.createdAt).toBeTruthy()
    expect(created.descricao).toBe('iFood')
  })

  it('GET filtra por from/to/tipo/categoria', async () => {
    const { POST, GET } = await import('@/app/api/transactions/route')
    await POST(makePostRequest({ tipo: 'gasto', descricao: 'A', valor: 10, categoria: 'Lazer', pagamento: 'pix', data: '2026-08-01', origem: 'manual' }))
    await POST(makePostRequest({ tipo: 'receita', descricao: 'B', valor: 20, categoria: 'Outros', pagamento: 'pix', data: '2026-08-10', origem: 'manual' }))

    const res = await GET(makeGetRequest('http://localhost/api/transactions?tipo=receita'))
    const result = await res.json()
    expect(result).toHaveLength(1)
    expect(result[0].descricao).toBe('B')
  })

  it('DELETE sem id limpa todas as transações', async () => {
    const { POST, DELETE, GET } = await import('@/app/api/transactions/route')
    await POST(makePostRequest({ tipo: 'gasto', descricao: 'A', valor: 10, categoria: 'Lazer', pagamento: 'pix', data: '2026-08-01', origem: 'manual' }))

    await DELETE()
    const res = await GET(makeGetRequest('http://localhost/api/transactions'))
    expect(await res.json()).toEqual([])
  })
})
