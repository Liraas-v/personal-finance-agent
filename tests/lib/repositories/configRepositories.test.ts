import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiConfigRepository } from '@/lib/repositories/apiConfigRepository'
import { LocalConfigRepository } from '@/lib/repositories/localConfigRepository'
import { demoConfig } from '@/lib/demoSeed'

describe('ApiConfigRepository', () => {
  const repo = new ApiConfigRepository()
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('read() chama GET /api/config', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => demoConfig })
    const result = await repo.read()
    expect(fetch).toHaveBeenCalledWith('/api/config')
    expect(result).toEqual(demoConfig)
  })

  it('update() faz PATCH em /api/config', async () => {
    const updated = { ...demoConfig, metaEconomia: 2000 }
    fetchMock.mockResolvedValue({ ok: true, json: async () => updated })

    const result = await repo.update({ metaEconomia: 2000 })

    expect(fetch).toHaveBeenCalledWith('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metaEconomia: 2000 }),
    })
    expect(result).toEqual(updated)
  })
})

describe('LocalConfigRepository', () => {
  const repo = new LocalConfigRepository()

  beforeEach(() => {
    window.localStorage.clear()
  })

  it('read() semeia demoConfig na primeira leitura', async () => {
    const config = await repo.read()
    expect(config).toEqual(demoConfig)
    expect(window.localStorage.getItem('finance-agent:demo:config')).not.toBeNull()
  })

  it('update() faz merge parcial e persiste', async () => {
    await repo.read()
    const updated = await repo.update({ metaEconomia: 2000 })

    expect(updated.metaEconomia).toBe(2000)
    expect(updated.moeda).toBe(demoConfig.moeda)
    expect((await repo.read()).metaEconomia).toBe(2000)
  })
})
