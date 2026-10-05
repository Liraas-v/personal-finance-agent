import type { Config } from '@/types'
import type { ConfigRepository } from './types'

export class ApiConfigRepository implements ConfigRepository {
  async read(): Promise<Config> {
    const res = await fetch('/api/config')
    if (!res.ok) throw new Error('Failed to load config')
    return res.json()
  }

  async update(patch: Partial<Config>): Promise<Config> {
    const res = await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('Failed to update config')
    return res.json()
  }
}
