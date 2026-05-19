import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type { NextRequest } from 'next/server'

const testDir = path.join(os.tmpdir(), `fa-test-config-${Date.now()}`)
process.env.DATA_DIR = testDir

function makePatchRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('/api/config', () => {
  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  it('GET retorna DEFAULT_CONFIG quando não existe config salva', async () => {
    const { GET } = await import('@/app/api/config/route')
    const { DEFAULT_CONFIG } = await import('@/lib/db')
    const res = await GET()
    expect(await res.json()).toEqual(DEFAULT_CONFIG)
  })

  it('PATCH faz merge parcial e persiste', async () => {
    const { GET, PATCH } = await import('@/app/api/config/route')

    await PATCH(makePatchRequest({ metaEconomia: 2000 }))
    const res = await GET()
    const config = await res.json()

    expect(config.metaEconomia).toBe(2000)
    expect(config.moeda).toBe('BRL')
  })
})
